from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import io

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = 'career_readiness_db'

# Email Configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'your-email@gmail.com')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your-app-password')

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# MongoDB Connection
try:
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # Collections
    users_collection = db['users']
    assessments_collection = db['assessments']
    
    # Create indexes for better performance
    users_collection.create_index('email', unique=True)
    assessments_collection.create_index('user_id')
    assessments_collection.create_index('timestamp')
    
    print("✅ MongoDB connected successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# Helper Functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc:
        doc['_id'] = str(doc['_id'])
        return doc
    return None

def serialize_docs(docs):
    """Convert list of MongoDB documents to JSON-serializable list"""
    return [serialize_doc(doc) for doc in docs]

# ===== AUTHENTICATION ROUTES =====

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')

        # Validation
        if not name or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        # Check if user exists
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 400

        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create user document
        user_doc = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role,
            'created_at': datetime.utcnow()
        }

        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Create access token
        access_token = create_access_token(identity=user_id)

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'role': role,
                'token': access_token
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        # Find user
        user = users_collection.find_one({'email': email})

        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create access token
        user_id = str(user['_id'])
        access_token = create_access_token(identity=user_id)

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'token': access_token
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== ASSESSMENT ROUTES =====

@app.route('/api/assessments', methods=['POST'])
@jwt_required()
def create_assessment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        results = data.get('results')
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        
        if not results:
            return jsonify({'error': 'Results data required'}), 400

        # Extract overall percentage
        overall_percentage = results.get('overallPercentage', 0)

        # Create assessment document
        assessment_doc = {
            'user_id': user_id,
            'results': results,
            'overall_percentage': overall_percentage,
            'timestamp': datetime.fromisoformat(timestamp.replace('Z', ''))
        }
        
        result = assessments_collection.insert_one(assessment_doc)
        assessment_doc['_id'] = str(result.inserted_id)
        assessment_doc['user_id'] = user_id

        return jsonify({
            'message': 'Assessment saved successfully',
            'assessment': serialize_doc(assessment_doc)
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/user', methods=['GET'])
@jwt_required()
def get_user_assessments():
    try:
        user_id = get_jwt_identity()
        
        assessments = list(assessments_collection.find({'user_id': user_id}).sort('timestamp', -1))
        
        return jsonify({
            'assessments': serialize_docs(assessments)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/<assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    try:
        user_id = get_jwt_identity()
        
        assessment = assessments_collection.find_one({
            '_id': ObjectId(assessment_id),
            'user_id': user_id
        })
        
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        return jsonify({
            'assessment': serialize_doc(assessment)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/<assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    try:
        user_id = get_jwt_identity()
        
        result = assessments_collection.delete_one({
            '_id': ObjectId(assessment_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Assessment not found'}), 404

        return jsonify({'message': 'Assessment deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== PDF EXPORT ROUTE =====

@app.route('/api/assessments/export-pdf', methods=['POST'])
@jwt_required()
def export_pdf():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        data = request.get_json()
        results = data.get('results')

        if not results:
            return jsonify({'error': 'Results data required'}), 400

        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#4F46E5'),
            spaceAfter=30,
            alignment=1
        )
        elements.append(Paragraph("Career Readiness Assessment Report", title_style))
        elements.append(Spacer(1, 0.3*inch))

        # User Info
        user_info = f"<b>Name:</b> {user['name']}<br/><b>Email:</b> {user['email']}<br/><b>Date:</b> {datetime.now().strftime('%B %d, %Y')}"
        elements.append(Paragraph(user_info, styles['Normal']))
        elements.append(Spacer(1, 0.3*inch))

        # Overall Score
        overall_score = f"<b>Overall Readiness Score: {results['overallPercentage']}%</b>"
        score_style = ParagraphStyle('Score', parent=styles['Heading2'], textColor=colors.HexColor('#10B981'))
        elements.append(Paragraph(overall_score, score_style))
        elements.append(Spacer(1, 0.2*inch))

        # Skill Breakdown Table
        elements.append(Paragraph("<b>Skill Breakdown:</b>", styles['Heading2']))
        elements.append(Spacer(1, 0.1*inch))

        skill_names = {
            'problemSolving': 'Problem Solving',
            'communication': 'Communication',
            'creativity': 'Creativity & Innovation',
            'teamwork': 'Teamwork & Collaboration',
            'technical': 'Technical Aptitude',
            'adaptability': 'Adaptability & Learning'
        }

        skill_data = [['Skill', 'Score', 'Percentage', 'Level']]
        for skill_id, skill_info in results['scores'].items():
            feedback = results['feedback'][skill_id]
            skill_name = skill_names.get(skill_id, skill_id)
            skill_data.append([
                skill_name,
                f"{skill_info['score']}/{skill_info['max']}",
                f"{skill_info['percentage']}%",
                feedback['level']
            ])

        skill_table = Table(skill_data, colWidths=[2*inch, 1*inch, 1*inch, 1.5*inch])
        skill_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(skill_table)
        elements.append(Spacer(1, 0.3*inch))

        # Career Recommendations
        elements.append(Paragraph("<b>Recommended Career Paths:</b>", styles['Heading2']))
        elements.append(Spacer(1, 0.1*inch))

        for idx, career in enumerate(results['careerMatches'][:5], 1):
            career_text = f"<b>{idx}. {career['career']}</b> - {career['match']}% Match<br/>{career['description']}"
            elements.append(Paragraph(career_text, styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'career_assessment_{datetime.now().strftime("%Y%m%d")}.pdf'
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== EMAIL ROUTE =====

@app.route('/api/assessments/email', methods=['POST'])
@jwt_required()
def email_results():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        data = request.get_json()
        
        recipient_email = data.get('email')
        results = data.get('results')

        if not recipient_email or not results:
            return jsonify({'error': 'Email and results required'}), 400

        # Create email
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = f'Career Readiness Assessment - {user["name"]}'

        # Email body
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #4F46E5;">Career Readiness Assessment Results</h2>
            <p><strong>Candidate:</strong> {user['name']}</p>
            <p><strong>Email:</strong> {user['email']}</p>
            <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
            <hr>
            <h3>Overall Readiness Score: {results['overallPercentage']}%</h3>
            <h4>Top Career Matches:</h4>
            <ul>
        """

        for career in results['careerMatches'][:3]:
            body += f"<li><strong>{career['career']}</strong> - {career['match']}% Match</li>"

        body += """
            </ul>
            <p>For detailed results, please contact the candidate.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This is an automated email from the Career Readiness Assistant.</p>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        return jsonify({'message': 'Email sent successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== RECRUITER ROUTES =====

@app.route('/api/recruiter/candidates', methods=['GET'])
@jwt_required()
def get_all_candidates():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})

        if user['role'] != 'recruiter':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all students
        students = list(users_collection.find({'role': 'student'}))
        candidates = []

        for student in students:
            student_id = str(student['_id'])
            latest_assessment = assessments_collection.find_one(
                {'user_id': student_id},
                sort=[('timestamp', -1)]
            )
            
            if latest_assessment:
                candidates.append({
                    'id': student_id,
                    'name': student['name'],
                    'email': student['email'],
                    'overall_score': latest_assessment['overall_percentage'],
                    'last_assessment': latest_assessment['timestamp'].isoformat(),
                    'assessment_id': str(latest_assessment['_id'])
                })

        return jsonify({'candidates': candidates}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recruiter/candidate/<candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate_details(candidate_id):
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})

        if user['role'] != 'recruiter':
            return jsonify({'error': 'Unauthorized'}), 403

        candidate = users_collection.find_one({'_id': ObjectId(candidate_id)})
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404

        assessments = list(assessments_collection.find(
            {'user_id': candidate_id}
        ).sort('timestamp', -1))

        return jsonify({
            'candidate': {
                'id': str(candidate['_id']),
                'name': candidate['name'],
                'email': candidate['email'],
                'role': candidate['role'],
                'created_at': candidate['created_at'].isoformat()
            },
            'assessments': serialize_docs(assessments)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== ANALYTICS ROUTE =====

@app.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
def get_analytics():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})

        if user['role'] != 'recruiter':
            return jsonify({'error': 'Unauthorized'}), 403

        total_students = users_collection.count_documents({'role': 'student'})
        total_assessments = assessments_collection.count_documents({})
        
        # Calculate average score
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'avg_score': {'$avg': '$overall_percentage'}
                }
            }
        ]
        
        result = list(assessments_collection.aggregate(pipeline))
        avg_score = result[0]['avg_score'] if result else 0

        return jsonify({
            'total_students': total_students,
            'total_assessments': total_assessments,
            'average_score': round(avg_score, 2)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== HEALTH CHECK =====

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Check MongoDB connection
        client.server_info()
        db_status = 'connected'
    except:
        db_status = 'disconnected'
    
    return jsonify({
        'status': 'API is running',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    try:
        stats = {
            'total_users': users_collection.count_documents({}),
            'total_students': users_collection.count_documents({'role': 'student'}),
            'total_recruiters': users_collection.count_documents({'role': 'recruiter'}),
            'total_assessments': assessments_collection.count_documents({})
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)