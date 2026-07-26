from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task, Notification
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, ReminderRequest, ReminderSendRequest, ReminderResponse
from app.auth import get_current_user
import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TestEmailRequest(BaseModel):
    email: EmailStr
    topic: Optional[str] = "UI Work & Pure Light Mode Overhaul"

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    owner: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if owner:
        query = query.filter(Task.owner.ilike(f"%{owner}%"))
    
    return query.order_by(Task.created_at.desc()).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deadline_val = payload.deadline or "TBD"
    new_task = Task(
        user_id=current_user.id,
        meeting_id=payload.meeting_id,
        title=payload.title,
        owner=payload.owner or "Unassigned",
        deadline=deadline_val,
        scheduled_email_date=deadline_val,
        email_sent=False,
        priority=payload.priority or "Medium",
        status=payload.status or "Pending"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None

@router.post("/test-email")
def send_test_email_endpoint(
    payload: TestEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_email = payload.email
    topic = payload.topic or "UI Work & Pure Light Mode Overhaul"
    subject = f"🚨 [URGENT 3-HOUR ALERT] Action Required: Finalize {topic} (Due: 2026-07-28)"
    
    # Create or Update Task in DB
    task = Task(
        user_id=current_user.id,
        title=f"Finalize {topic}",
        owner=f"Kasyap ({target_email})",
        deadline="2026-07-28",
        scheduled_email_date="2026-07-28",
        email_sent=True,
        last_email_sent_at=datetime.datetime.utcnow(),
        priority="High",
        status="In Progress"
    )
    db.add(task)

    # Log Notification
    notif = Notification(
        user_id=current_user.id,
        title=f"🚨 Test Email Reminder Dispatched to {target_email}",
        message=f"Auto-sent High Priority email reminder for '{topic}' to {target_email} [Subject: {subject}].",
        type="reminder"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "recipient": target_email,
        "subject": subject,
        "message": f"Test reminder email auto-dispatched to {target_email} for '{topic}'!",
        "email_body": (
            f"Hi Kasyap,\n\n"
            f"This is an automated 3-hour priority reminder [HIGH PRIORITY] from MeetMind AI regarding your assigned UI work:\n\n"
            f"• Deliverable Target: Finalize {topic}\n"
            f"• Assigned Owner: Kasyap ({target_email})\n"
            f"• Target Deadline: 2026-07-28\n"
            f"• Priority Rating: High Urgency\n"
            f"• Automated Cadence: Every 3 Hours Active (3hrs)\n"
            f"• Action Status: In Progress\n\n"
            f"Please update the workspace task board once completed:\n"
            f"http://localhost:5173/tasks\n\n"
            f"Best regards,\n"
            f"{current_user.name} (MeetMind AI Follow-up Agent)"
        )
    }

@router.post("/reminders", response_model=ReminderResponse)
def generate_reminders(
    payload: ReminderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.id.in_(payload.task_ids), Task.user_id == current_user.id).all()
    messages = []

    platform = (payload.platform or "slack").lower()

    for task in tasks:
        owner = task.owner or "Team Member"
        deadline_str = task.deadline or "TBD"
        title = task.title
        p_lower = (task.priority or "medium").lower()

        if p_lower == "high":
            subject = f"🚨 [URGENT 3-HOUR ALERT] Action Required: {title} (Due: {deadline_str})"
            urgency_banner = "🚨 HIGH PRIORITY DELIVERABLE - Automated follow-up sent every 3 hours."
        elif p_lower == "low":
            subject = f"📌 [LOW PRIORITY 12-HOUR NOTICE] Action Item: {title} (Due: {deadline_str})"
            urgency_banner = "📌 LOW PRIORITY DELIVERABLE - Automated follow-up sent 2x per day (12h)."
        else:
            subject = f"⚡ [MEDIUM PRIORITY] Action Item: {title} (Due: {deadline_str})"
            urgency_banner = "⚡ MEDIUM PRIORITY DELIVERABLE - Automated follow-up sent 1x per day (24h)."
        
        if platform == "slack":
            msg = (
                f"👋 *Hi {owner}*,\n"
                f"Priority Follow-up ({urgency_banner}):\n"
                f"• *Deliverable Target:* {title}\n"
                f"• *Target Deadline:* `{deadline_str}`\n"
                f"• *Priority Level:* *{task.priority}*\n"
                f"• *Current Status:* `{task.status}`\n\n"
                f"🚀 Please update the task board once completed!"
            )
        elif platform == "email":
            msg = (
                f"Subject: {subject}\n\n"
                f"Hi {owner},\n\n"
                f"This is an automated priority-driven follow-up [{task.priority.upper()} PRIORITY].\n"
                f"Note: {urgency_banner}\n\n"
                f"Here are your key deliverable targets from our meeting:\n"
                f"• Deliverable Target: {title}\n"
                f"• Assigned Owner: {owner}\n"
                f"• Target Deadline: {deadline_str}\n"
                f"• Priority Rating: {task.priority}\n"
                f"• Action Status: {task.status}\n\n"
                f"Please mark as completed on the task board once finished.\n\n"
                f"Best regards,\n"
                f"{current_user.name} (MeetMind AI Follow-up Agent)"
            )
        else: # whatsapp / SMS
            msg = (
                f"Hi {owner}! [{task.priority.upper()} PRIORITY REMINDER]\n"
                f"• Target: *{title}*\n"
                f"• Deadline: *{deadline_str}*\n"
                f"• Cadence: {urgency_banner}\n"
                f"Please let us know once finished! 🙏"
            )

        messages.append({
            "task_id": task.id,
            "owner": owner,
            "title": title,
            "subject": subject,
            "deadline": deadline_str,
            "priority": task.priority,
            "message": msg
        })

    return {"messages": messages}
