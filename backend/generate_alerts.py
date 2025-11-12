import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the email
message = Mail(
    from_email=os.getenv('SENDER_EMAIL'),
    to_emails=os.getenv('RECEIVER_EMAIL'),
    subject='Test Alert from Climate AI',
    html_content='<strong>This is a test email from BlueAlert!</strong>'
)

try:
    print("Script started")
    sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
    response = sg.send(message)
    print("✅ Email sent successfully!")
    print(f"Status Code: {response.status_code}")
    print(f"Body: {response.body}")
except Exception as e:
    print("❌ Detailed Error:")
    print(e)
    