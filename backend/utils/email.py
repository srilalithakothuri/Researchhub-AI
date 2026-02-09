def send_otp_email(email: str, otp: str):
    """
    Simulated email sender for OTP.
    In production, use an SMTP library or an email service API (e.g., SendGrid, Mailgun).
    """
    print("\n" + "="*50)
    print(f"📧 EMAIL SIMULATION")
    print(f"To: {email}")
    print(f"Subject: Your ResearchHub AI Password Reset OTP")
    print(f"\nYour OTP is: {otp}")
    print("This code will expire in 10 minutes.")
    print("="*50 + "\n")
    
    return True
