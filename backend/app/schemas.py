from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Auth & User Schemas ---

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Product Manager"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    team_lead_id: Optional[int] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RoleAssignmentCreate(BaseModel):
    email: EmailStr
    assigned_role: str = "Team Lead" # Server Admin, HR Manager, Team Lead, Member
    assigned_lead_id: Optional[int] = None

class RoleAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    assigned_role: str
    assigned_lead_id: Optional[int] = None
    created_at: datetime

class UserUpdateRoleTeamRequest(BaseModel):
    role: str
    team_lead_id: Optional[int] = None

class TeamReminderRequest(BaseModel):
    member_ids: List[int]
    subject: str
    message: str

# --- Task Schemas ---

class TaskBase(BaseModel):
    title: str
    owner: Optional[str] = "Unassigned"
    deadline: Optional[str] = None
    scheduled_email_date: Optional[str] = None
    email_sent: Optional[bool] = False
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"

class TaskCreate(TaskBase):
    meeting_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    owner: Optional[str] = None
    deadline: Optional[str] = None
    scheduled_email_date: Optional[str] = None
    email_sent: Optional[bool] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: Optional[int] = None
    user_id: int
    created_at: datetime

# --- Meeting Schemas ---

class MeetingAnalyzeRequest(BaseModel):
    title: str
    transcript: str
    date: Optional[str] = None
    duration: Optional[str] = "30 mins"

class GeminiTaskItem(BaseModel):
    title: str
    owner: str
    deadline: str
    priority: str
    status: str = "Pending"

class GeminiAnalysisResponse(BaseModel):
    summary: str
    decisions: List[str] = []
    tasks: List[GeminiTaskItem] = []
    risks: List[str] = []
    followups: List[str] = []

class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    transcript: str
    summary: Optional[str] = None
    decisions: List[str] = []
    risks: List[str] = []
    followups: List[str] = []
    date: str
    duration: str
    created_at: datetime
    tasks: List[TaskResponse] = []

# --- Reminder Schemas ---

class ReminderRequest(BaseModel):
    task_ids: List[int]
    platform: Optional[str] = "slack"

class ReminderSendRequest(BaseModel):
    task_ids: List[int]
    platform: Optional[str] = "email"

class ReminderResponse(BaseModel):
    messages: List[dict]

# --- Notification Schema ---

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    type: str
    created_at: datetime

class ContactLeaderRequest(BaseModel):
    leader_id: int
    subject: str
    message: str

# --- Query Schemas ---

class QueryCreate(BaseModel):
    recipient_id: int
    subject: str
    message: str

class QueryReply(BaseModel):
    reply: str

class QueryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    recipient_id: int
    subject: str
    message: str
    reply: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    sender_role: Optional[str] = None
    recipient_name: Optional[str] = None

# --- Dashboard Overview Schema ---

class DashboardStats(BaseModel):
    total_meetings: int
    pending_tasks: int
    completed_tasks: int
    upcoming_deadlines: int
    priority_distribution: dict
    tasks_by_status: dict
    meetings_trend: List[dict]

