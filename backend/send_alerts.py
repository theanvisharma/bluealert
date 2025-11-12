import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

def send_alert(to_email, city):
    sender = os.getenv("SENDER_EMAIL")
    api_key = os.getenv("SENDGRID_API_KEY")

    print(f"SENDER: {sender}, RECEIVER: {to_email}")

    message = Mail(
        from_email=sender,
        to_emails=to_email,
        subject=f"BlueAlert: Registration Successful for {city}",
        html_content=f"<strong>Thank you for registering for BlueAlert updates in {city}!</strong>"
    )

    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print("✅ Email sent successfully!")
        print("Status code:", response.status_code)
    except Exception as e:
        print("❌ Error sending email:", e)