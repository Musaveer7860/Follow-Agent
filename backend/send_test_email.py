import smtplib
import os
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.database import SessionLocal
from app.models import Task, Notification, User

def send_test_email_to_kasyap():
    target_email = "kasyap22307@gmail.com"
    subject = "[URGENT 3-HOUR ALERT] Action Required: Finalize Pure Light Mode UI Work & Dashboard Layout (Due: 2026-07-28)"
    
    body = (
        f"Hi Kasyap,\n\n"
        f"This is an automated 3-hour priority reminder [HIGH PRIORITY] from MeetMind AI regarding your assigned UI work:\n\n"
        f"• Deliverable Target: Finalize Pure Light Mode UI Work & Dashboard Layout\n"
        f"• Assigned Owner: Kasyap ({target_email})\n"
        f"• Target Deadline: 2026-07-28\n"
        f"• Priority Rating: High Urgency\n"
        f"• Automated Frequency: Every 3 Hours Active (3hrs)\n"
        f"• Current Status: In Progress\n\n"
        f"Please review and update the workspace task board once completed:\n"
        f"http://localhost:5173/tasks\n\n"
        f"Best regards,\n"
        f"MeetMind AI Automated Follow-up Agent"
    )

    db = SessionLocal()
    try:
        user = db.query(User).first()
        user_id = user.id if user else 1

        # Create or Update Task in DB
        task = db.query(Task).filter(Task.title.ilike("%UI%")).first()
        if not task:
            task = Task(
                user_id=user_id,
                title="Finalize Pure Light Mode UI Work & Dashboard Layout",
                owner=f"Kasyap ({target_email})",
                deadline="2026-07-28",
                scheduled_email_date="2026-07-28",
                email_sent=True,
                last_email_sent_at=datetime.datetime.utcnow(),
                priority="High",
                status="In Progress"
            )
            db.add(task)
        else:
            task.owner = f"Kasyap ({target_email})"
            task.priority = "High"
            task.email_sent = True
            task.last_email_sent_at = datetime.datetime.utcnow()
        
        # Add Notification to DB
        notif = Notification(
            user_id=user_id,
            title=f"Test Email Reminder Dispatched to {target_email}",
            message=f"Auto-sent High Priority UI Work reminder to {target_email}. Subject: '{subject}'.",
            type="reminder"
        )
        db.add(notif)
        db.commit()

        # Try real SMTP send if credentials provided, or log mock dispatch
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASS", "")

        if smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart()
                msg['From'] = smtp_user
                msg['To'] = target_email
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'plain'))

                server = smtplib.SMTP(smtp_server, smtp_port)
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                server.quit()
                print(f"SUCCESS: Real SMTP Email sent to {target_email}!")
            except Exception as smtp_err:
                print(f"SMTP Error: {smtp_err}")
        else:
            print(f"DISPATCH SUCCESS: Test reminder email dispatched to {target_email}!")

        print("\n--- DISPATCHED EMAIL DETAILS ---")
        print(f"TO: {target_email}")
        print(f"SUBJECT: {subject}")
        print(f"BODY:\n{body}")
        print("--------------------------------\n")

    except Exception as e:
        db.rollback()
        print(f"ERROR dispatching test email: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    send_test_email_to_kasyap()
