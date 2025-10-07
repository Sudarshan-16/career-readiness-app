from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
import io
from datetime import datetime

def generate_pdf(user, results):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#4F46E5'), alignment=1)
    elements.append(Paragraph("Career Readiness Assessment Report", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    user_info = f"<b>Name:</b> {user.name}<br/><b>Email:</b> {user.email}<br/><b>Date:</b> {datetime.now().strftime('%B %d, %Y')}"
    elements.append(Paragraph(user_info, styles['Normal']))
    
    # Add more PDF generation logic here (skill table, career recommendations)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
