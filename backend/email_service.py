class EmailService:
    def send_email(self, to_email: str, subject: str, body: str):
        # Placeholder for SMTP/SendGrid/SES
        print(f"--- SIMULATING EMAIL TO {to_email} ---")
        print(f"Subject: {subject}")
        print(f"Body: \n{body}")
        print("--------------------------------------")
        return True
