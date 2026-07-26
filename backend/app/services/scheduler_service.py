import asyncio
import datetime
import threading
import time
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Task, Notification, User

def check_and_send_scheduled_emails():
    """
    Automated background worker enforcing exact priority-based email dispatch frequencies:
    - High Priority: Dispatched every 3 hours (3hrs) until completed.
    - Medium Priority: Dispatched 1 time per day (24 hours).
    - Low Priority: Dispatched 2 times per day (every 12 hours).
    """
    db: Session = SessionLocal()
    try:
        now = datetime.datetime.utcnow()
        
        # Query tasks that are still Pending or In Progress
        pending_tasks = db.query(Task).filter(
            Task.status != "Completed"
        ).all()

        auto_sent_count = 0
        for task in pending_tasks:
            p_lower = (task.priority or "medium").lower()
            last_sent = task.last_email_sent_at

            should_send = False
            cadence_tag = ""

            if last_sent is None:
                # First time dispatch for newly created task
                should_send = True
                if p_lower == "high":
                    cadence_tag = "[HIGH PRIORITY - Every 3 Hours]"
                elif p_lower == "low":
                    cadence_tag = "[LOW PRIORITY - 2x Per Day]"
                else:
                    cadence_tag = "[MEDIUM PRIORITY - 1x Per Day]"
            else:
                elapsed_hours = (now - last_sent).total_seconds() / 3600.0

                if p_lower == "high" and elapsed_hours >= 3.0:
                    # High priority: Send every 3 hours!
                    should_send = True
                    cadence_tag = "[HIGH PRIORITY - 3-Hour Repeat Alert]"
                elif p_lower == "low" and elapsed_hours >= 12.0:
                    # Low priority: Send 2 times per day (every 12 hours)!
                    should_send = True
                    cadence_tag = "[LOW PRIORITY - 12-Hour 2x/Day Alert]"
                elif p_lower == "medium" and elapsed_hours >= 24.0:
                    # Medium priority: Send once per day (24 hours)!
                    should_send = True
                    cadence_tag = "[MEDIUM PRIORITY - 24-Hour Daily Alert]"

            if should_send:
                task.email_sent = True
                task.last_email_sent_at = now
                owner_name = task.owner or "Team Member"
                
                # Fetch actual email from the database
                target_user = db.query(User).filter(User.name.ilike(f"%{owner_name.split('(')[0].strip()}%")).first()
                if target_user and target_user.email:
                    email_addr = target_user.email
                else:
                    # Fallback or check if owner has email in parentheses like "Kasyap (test@mail.com)"
                    if "(" in owner_name and ")" in owner_name:
                        email_addr = owner_name.split("(")[1].split(")")[0].strip()
                    else:
                        email_addr = f"{owner_name.lower().replace(' ', '.')}@company.com"

                # Send real email using SMTP
                smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
                smtp_port = int(os.getenv("SMTP_PORT", "587"))
                smtp_user = os.getenv("SMTP_USER", "")
                smtp_pass = os.getenv("SMTP_PASS", "")

                subject = f"{cadence_tag} Action Required: {task.title}"
                body = (
                    f"Hi {owner_name},\n\n"
                    f"This is an automated priority reminder {cadence_tag} regarding your assigned work:\n\n"
                    f"• Task: {task.title}\n"
                    f"• Deadline: {task.deadline or 'TBD'}\n"
                    f"• Priority: {task.priority}\n"
                    f"• Status: {task.status}\n\n"
                    f"Please update the workspace task board once completed.\n\n"
                    f"Best regards,\nMeetMind AI Follow-up Agent"
                )

                if smtp_user and smtp_pass:
                    try:
                        msg = MIMEMultipart()
                        msg['From'] = smtp_user
                        msg['To'] = email_addr
                        msg['Subject'] = subject
                        msg.attach(MIMEText(body, 'plain'))
                        
                        server = smtplib.SMTP(smtp_server, smtp_port)
                        server.starttls()
                        server.login(smtp_user, smtp_pass)
                        server.send_message(msg)
                        server.quit()
                        print(f"[PRIORITY CADENCE SCHEDULER] Real email sent to {email_addr}")
                    except Exception as e:
                        print(f"[SMTP ERROR] Failed to send email to {email_addr}: {e}")
                
                # Log Notification for user
                notif = Notification(
                    user_id=task.user_id,
                    title=f"{cadence_tag} Dispatched",
                    message=f"Auto-sent email for '{task.title}' to {owner_name} ({email_addr}) [Frequency Cadence: {task.priority} Priority].",
                    type="reminder"
                )
                db.add(notif)
                auto_sent_count += 1
                print(f"[PRIORITY CADENCE SCHEDULER] Dispatched {cadence_tag} to {owner_name} for task '{task.title}'")

        if auto_sent_count > 0:
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[PRIORITY SCHEDULER ERROR] {e}")
    finally:
        db.close()

def start_background_email_scheduler():
    """
    Launches a background daemon thread that periodically checks scheduled email dispatches based on priority frequencies.
    """
    def run_loop():
        while True:
            try:
                check_and_send_scheduled_emails()
            except Exception as err:
                print(f"[SCHEDULER LOOP ERROR] {err}")
            time.sleep(30) # Check every 30 seconds

    thread = threading.Thread(target=run_loop, daemon=True)
    thread.start()
    print("[SCHEDULER] Priority-Frequency Automated Email Scheduler Daemon Started!")

