from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RoleAssignment, QueryMessage, Notification
from app.schemas import RoleAssignmentCreate, RoleAssignmentResponse, UserResponse, UserUpdateRoleTeamRequest, QueryReply, QueryResponse
from app.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Server Admin & Team Management"])

SERVER_ADMIN_EMAILS = ["admin06@gmail.com", "mohammadmusaveer06@gmail.com", "mohammadmusaveermusaveer06@gmail.com"]

def require_leader_or_admin(current_user: User = Depends(get_current_user)) -> User:
    user_email = current_user.email.strip().lower()
    is_admin_email = user_email in [e.lower() for e in SERVER_ADMIN_EMAILS]
    r = (current_user.role or "").lower()
    is_leader = is_admin_email or current_user.role == "Server Admin" or any(k in r for k in ["lead", "admin", "manager", "director", "executive", "head"])
    if not is_leader:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied. Only Leaders, Managers, and System Server Admins can perform this operation."
        )
    return current_user

@router.post("/assign-role", response_model=RoleAssignmentResponse)
def pre_assign_role(
    req: RoleAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    target_email = req.email.strip().lower()
    if target_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or req.assigned_role == "Server Admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Server Admin role is fixed and cannot be pre-assigned or modified."
        )
    
    # If not Server Admin, default assigned_lead_id to current leader's ID
    user_email = current_user.email.strip().lower()
    is_admin = user_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or current_user.role == "Server Admin"
    
    lead_id = req.assigned_lead_id
    if not is_admin and lead_id is None:
        lead_id = current_user.id
    
    # Check if pre-assignment already exists
    existing = db.query(RoleAssignment).filter(RoleAssignment.email == target_email).first()
    if existing:
        existing.assigned_role = req.assigned_role
        existing.assigned_lead_id = lead_id
        db.commit()
        db.refresh(existing)
        assigned_record = existing
    else:
        assigned_record = RoleAssignment(
            email=target_email,
            assigned_role=req.assigned_role,
            assigned_lead_id=lead_id
        )
        db.add(assigned_record)
        db.commit()
        db.refresh(assigned_record)

    # If user with this email is already registered, update their profile immediately
    existing_user = db.query(User).filter(User.email == target_email).first()
    if existing_user:
        existing_user.role = req.assigned_role
        if lead_id is not None:
            existing_user.team_lead_id = lead_id
        db.commit()

    return assigned_record

@router.get("/assignments", response_model=List[RoleAssignmentResponse])
def get_all_role_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    user_email = current_user.email.strip().lower()
    is_admin = user_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or current_user.role == "Server Admin"
    
    if is_admin:
        return db.query(RoleAssignment).order_by(RoleAssignment.created_at.desc()).all()
    else:
        return db.query(RoleAssignment).filter(RoleAssignment.assigned_lead_id == current_user.id).order_by(RoleAssignment.created_at.desc()).all()

@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    record = db.query(RoleAssignment).filter(RoleAssignment.id == assignment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Role assignment record not found")
    db.delete(record)
    db.commit()
    return None

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    user_email = current_user.email.strip().lower()
    is_admin = user_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or current_user.role == "Server Admin"
    
    if is_admin:
        return db.query(User).order_by(User.id.asc()).all()
    else:
        return db.query(User).filter((User.team_lead_id == current_user.id) | (User.id == current_user.id)).order_by(User.id.asc()).all()

@router.put("/users/{user_id}/role-team", response_model=UserResponse)
def update_user_role_and_team(
    user_id: int,
    req: UserUpdateRoleTeamRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if target is a fixed Server Admin or trying to set to Server Admin
    target_email = user.email.strip().lower()
    if user.role == "Server Admin" or target_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or req.role == "Server Admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Server Admin role is fixed and cannot be created, modified, or transferred."
        )

    user.role = req.role
    if req.team_lead_id is not None:
        user.team_lead_id = req.team_lead_id
    db.commit()
    db.refresh(user)
    return user


@router.get("/queries", response_model=List[QueryResponse])
def get_admin_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    user_email = current_user.email.strip().lower()
    is_admin = user_email in [e.lower() for e in SERVER_ADMIN_EMAILS] or current_user.role == "Server Admin"

    if is_admin:
        queries = db.query(QueryMessage).order_by(QueryMessage.created_at.desc()).all()
    else:
        queries = db.query(QueryMessage).filter(QueryMessage.recipient_id == current_user.id).order_by(QueryMessage.created_at.desc()).all()

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

@router.post("/queries/{query_id}/reply", response_model=QueryResponse)
def reply_query(
    query_id: int,
    req: QueryReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_leader_or_admin)
):
    query_msg = db.query(QueryMessage).filter(QueryMessage.id == query_id).first()
    if not query_msg:
        raise HTTPException(status_code=404, detail="Query message not found")

    query_msg.reply = req.reply
    query_msg.status = "Answered"
    db.commit()
    db.refresh(query_msg)

    # Notify the sender that their query was replied to
    notif = Notification(
        user_id=query_msg.sender_id,
        title=f"Reply from {current_user.name} regarding '{query_msg.subject}'",
        message=f"Answer: {req.reply}",
        type="info"
    )
    db.add(notif)
    db.commit()

    res = QueryResponse.model_validate(query_msg)
    sender = db.query(User).filter(User.id == query_msg.sender_id).first()
    recipient = db.query(User).filter(User.id == query_msg.recipient_id).first()
    if sender:
        res.sender_name = sender.name
        res.sender_email = sender.email
        res.sender_role = sender.role
    if recipient:
        res.recipient_name = recipient.name
    return res


