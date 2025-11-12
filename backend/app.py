from flask import Flask, render_template, request
from send_alerts import send_alert
from flask_cors import CORS # 👈 NEW: Import the CORS utility

app = Flask(__name__)
CORS(app) # 👈 NEW: Enable CORS for all routes (allows React to talk to Flask)

# @app.route("/")
# def home():
#     # This route is optional if you only use Flask for the API
#     return render_template("index.html")

@app.route("/register", methods=["POST"])
def register():
    # Flask automatically parses application/x-www-form-urlencoded data
    city = request.form.get("city")
    phone = request.form.get("phone")
    email = request.form.get("email")

    # Basic validation check
    if not city or not phone or not email:
        # Return a JSON error message with a 400 status code
        return {"message": "⚠️ Missing required fields (city, phone, or email)."}, 400

    # Call send_alert function to dispatch the email
    send_alert(email, city)

    # NEW: Return a clear, successful JSON response with a 200 status code
    # This structure is cleaner and easier for React's fetch() to handle.
    return {"message": f"✅ Registered Successfully for {city}! Email alert sent to {email}"}, 200

if __name__ == "__main__":
    # Note: Running on port 5000 is the Flask default
    app.run(debug=True, port=5000)