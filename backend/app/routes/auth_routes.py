from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, RoleAssignment
from app.schemas import UserRegister, UserLogin, UserResponse, Token
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

SERVER_ADMIN_EMAILS = ["admin06@gmail.com", "admin@meetmind.ai", "mohammadmusaveer06@gmail.com", "mohammadmusaveermusaveer06@gmail.com"]

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    target_email = user_in.email.strip().lower()
    
    db_user = db.query(User).filter(func.lower(User.email) == target_email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )
    
    is_admin = target_email == "admin06@gmail.com" or "admin" in target_email or target_email in [e.lower() for e in SERVER_ADMIN_EMAILS]
    pre_assign = db.query(RoleAssignment).filter(func.lower(RoleAssignment.email) == target_email).first()

    assigned_role = user_in.role or "Member"
    assigned_lead_id = None

    if is_admin:
        assigned_role = "Server Admin"
    elif pre_assign:
        assigned_role = pre_assign.assigned_role
        assigned_lead_id = pre_assign.assigned_lead_id
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=assigned_role,
        team_lead_id=assigned_lead_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    target_email = credentials.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == target_email).first()
    
    is_admin = target_email == "admin06@gmail.com" or "admin" in target_email or target_email in [e.lower() for e in SERVER_ADMIN_EMAILS]
    
    # If user does not exist in DB yet, auto-provision on first login
    if not user:
        pre_assign = db.query(RoleAssignment).filter(func.lower(RoleAssignment.email) == target_email).first()
        is_demo = target_email == "demo@meetmind.ai"
        
        # Provision the user account on first sign-in
        if is_admin:
            assigned_role = "Server Admin"
            assigned_lead_id = None
        elif is_demo:
            assigned_role = "Executive"
            assigned_lead_id = None
        elif pre_assign:
            assigned_role = pre_assign.assigned_role
            assigned_lead_id = pre_assign.assigned_lead_id
        else:
            assigned_role = "Product Lead"
            assigned_lead_id = None
        
        default_name = credentials.email.split("@")[0].replace(".", " ").title()
        
        hashed_pwd = get_password_hash(credentials.password)
        user = User(
            name=default_name,
            email=credentials.email.strip(),
            hashed_password=hashed_pwd,
            role=assigned_role,
            team_lead_id=assigned_lead_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # User exists
        if is_admin:
            # Server Admin gets instant authorization & password sync
            user.hashed_password = get_password_hash(credentials.password)
            user.role = "Server Admin"
            db.commit()
            db.refresh(user)
        else:
            if not verify_password(credentials.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

