from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.models import Assessment, User
import json, io
from utils.pdf_utils import generate_pdf

assessment_bp = Blueprint('assessment', __name__, url_prefix='/api/assessments')

@assessment_bp.route('', methods=['POST'])
@jwt_required()
def create_assessment():
    user_id = get_jwt_identity()
    data = request.get_json()
    results = data.get('results')
    if not results:
        return jsonify({'error': 'Results data required'}), 400
    overall_percentage = results.get('overallPercentage', 0)
    assessment = Assessment(
        user_id=user_id,
        results=json.dumps(results),
        overall_percentage=overall_percentage
    )
    db.session.add(assessment)
    db.session.commit()
    return jsonify({'assessment': assessment.to_dict()}), 201

@assessment_bp.route('/export-pdf', methods=['POST'])
@jwt_required()
def export_pdf():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    results = request.get_json().get('results')
    buffer = generate_pdf(user, results)
    return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name='report.pdf')
