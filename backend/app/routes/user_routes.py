import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Meeting, Task, Notification, QueryMessage
from app.schemas import DashboardStats, NotificationResponse, UserResponse, ContactLeaderRequest, QueryCreate, QueryReply, QueryResponse
from app.auth import get_current_user

router = APIRouter(prefix="/users", tags=["User Profile & Analytics"])

def is_higher_role(role: Optional[str]) -> bool:
    if not role:
        return False
    r = role.lower()
    return any(keyword in r for keyword in ["lead", "admin", "manager", "director", "executive", "head"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has personal meetings or is higher role
    user_meetings_count = db.query(Meeting).filter(Meeting.user_id == current_user.id).count()
    
    if user_meetings_count > 0:
        total_meetings = user_meetings_count
        tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
        meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    else:
        # For standard team members or new accounts, show overall workspace metrics
        total_meetings = db.query(Meeting).count()
        tasks = db.query(Task).all()
        meetings = db.query(Meeting).all()

    pending_tasks = sum(1 for t in tasks if t.status in ["Pending", "In Progress"])
    completed_tasks = sum(1 for t in tasks if t.status == "Completed")
    
    today_str = datetime.date.today().isoformat()
    upcoming_deadlines = sum(1 for t in tasks if t.deadline and t.deadline >= today_str and t.status != "Completed")

    priority_dist = {
        "High": sum(1 for t in tasks if t.priority == "High"),
        "Medium": sum(1 for t in tasks if t.priority == "Medium"),
        "Low": sum(1 for t in tasks if t.priority == "Low")
    }

    status_dist = {
        "Pending": sum(1 for t in tasks if t.status == "Pending"),
        "In Progress": sum(1 for t in tasks if t.status == "In Progress"),
        "Completed": sum(1 for t in tasks if t.status == "Completed")
    }

    # Trend data over last 7 days
    date_counts = {}
    for m in meetings:
        d = m.date or datetime.date.today().isoformat()
        date_counts[d] = date_counts.get(d, 0) + 1
    
    meetings_trend = [{"date": k, "count": v} for k, v in sorted(date_counts.items())[-7:]]
    if not meetings_trend:
        today = datetime.date.today()
        meetings_trend = [
            {"date": (today - datetime.timedelta(days=i)).isoformat(), "count": 0}
            for i in range(6, -1, -1)
        ]

    return {
        "total_meetings": total_meetings,
        "pending_tasks": pending_tasks,
        "completed_tasks": completed_tasks,
        "upcoming_deadlines": upcoming_deadlines,
        "priority_distribution": priority_dist,
        "tasks_by_status": status_dist,
        "meetings_trend": meetings_trend
    }

@router.get("/leaders", response_model=List[UserResponse])
def get_leaders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    all_users = db.query(User).all()
    leaders = [u for u in all_users if is_higher_role(u.role)]
    # Fallback: if no leaders found, return all users
    if not leaders:
        leaders = all_users
    return leaders

@router.post("/contact-leader")
def contact_leader(
    req: ContactLeaderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leader = db.query(User).filter(User.id == req.leader_id).first()
    if not leader:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target Leader / Manager not found"
        )
    
    # Save into query_messages table for persistent tracking
    q_msg = QueryMessage(
        sender_id=current_user.id,
        recipient_id=leader.id,
        subject=req.subject,
        message=req.message,
        status="Pending"
    )
    db.add(q_msg)

    notif = Notification(
        user_id=leader.id,
        title=f"New Query from {current_user.name} ({current_user.role})",
        message=f"Subject: {req.subject}\n\nMessage: {req.message}\n\nSender Email: {current_user.email}",
        type="reminder"
    )
    db.add(notif)
    db.commit()
    return {"status": "success", "message": f"Message & Query successfully sent to {leader.name} ({leader.role})!"}

@router.post("/queries", response_model=QueryResponse)
def create_query(
    req: QueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipient = db.query(User).filter(User.id == req.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Target Leader/Admin recipient not found")

    q_msg = QueryMessage(
        sender_id=current_user.id,
        recipient_id=req.recipient_id,
        subject=req.subject,
        message=req.message,
        status="Pending"
    )
    db.add(q_msg)

    # Notify recipient
    notif = Notification(
        user_id=recipient.id,
        title=f"Direct Query from {current_user.name}",
        message=f"Subject: {req.subject}\n{req.message[:120]}...",
        type="reminder"
    )
    db.add(notif)
    db.commit()
    db.refresh(q_msg)

    res = QueryResponse.model_validate(q_msg)
    res.sender_name = current_user.name
    res.sender_email = current_user.email
    res.sender_role = current_user.role
    res.recipient_name = recipient.name
    return res

@router.get("/queries", response_model=List[QueryResponse])
def get_user_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch queries where current_user is sender OR recipient
    queries = db.query(QueryMessage).filter(
        (QueryMessage.sender_id == current_user.id) | (QueryMessage.recipient_id == current_user.id)
    ).order_by(QueryMessage.created_at.desc()).all()

    result = []
    for q in queries:
        res = QueryResponse.model_validate(q)
        sender = db.query(User).filter(User.id == q.sender_id).first()
        recipient = db.query(User).filter(User.id == q.recipient_id).first()
        if sender:
            res.sender_name = sender.name
            res.sender_email = sender.email
            res.sender_role = sender.role
        if recipient:
            res.recipient_name = recipient.name
        result.append(res)

    return result


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(20).all()
    return notifs

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

SERVER_ADMIN_EMAILS = ["admin06@gmail.com", "mohammadmusaveer06@gmail.com", "mohammadmusaveermusaveer06@gmail.com"]

@router.put("/profile", response_model=UserResponse)
def update_profile(
    name: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_email = current_user.email.strip().lower()
    is_admin = current_user.role == "Server Admin" or user_email in [e.lower() for e in SERVER_ADMIN_EMAILS]

    if name:
        current_user.name = name
    if role:
        if is_admin and role != "Server Admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Server Admin role is fixed and cannot be modified."
            )
        current_user.role = role
    db.commit()
    db.refresh(current_user)
    return current_user
