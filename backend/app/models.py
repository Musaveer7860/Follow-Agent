import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Product Lead")
    team_lead_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class RoleAssignment(Base):
    __tablename__ = "role_assignments"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    assigned_role = Column(String, default="Team Lead") # Server Admin, HR Manager, Team Lead, Member
    assigned_lead_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Stored as JSON encoded strings for SQLite compatibility
    decisions_json = Column(Text, default="[]")
    risks_json = Column(Text, default="[]")
    followups_json = Column(Text, default="[]")
    
    date = Column(String, default=lambda: datetime.date.today().isoformat())
    duration = Column(String, default="30 mins")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="meetings")
    tasks = relationship("Task", back_populates="meeting", cascade="all, delete-orphan")

    @property
    def decisions(self):
        try:
            return json.loads(self.decisions_json or "[]")
        except Exception:
            return []

    @decisions.setter
    def decisions(self, val):
        self.decisions_json = json.dumps(val)

    @property
    def risks(self):
        try:
            return json.loads(self.risks_json or "[]")
        except Exception:
            return []

    @risks.setter
    def risks(self, val):
        self.risks_json = json.dumps(val)

    @property
    def followups(self):
        try:
            return json.loads(self.followups_json or "[]")
        except Exception:
            return []

    @followups.setter
    def followups(self, val):
        self.followups_json = json.dumps(val)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    owner = Column(String, default="Unassigned")
    deadline = Column(String, nullable=True)
    scheduled_email_date = Column(String, nullable=True)
    email_sent = Column(Boolean, default=False)
    last_email_sent_at = Column(DateTime, nullable=True)
    priority = Column(String, default="Medium")  # High, Medium, Low
    status = Column(String, default="Pending")    # Pending, In Progress, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    meeting = relationship("Meeting", back_populates="tasks")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="info")  # task, meeting, reminder, system
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class QueryMessage(Base):
    __tablename__ = "query_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    reply = Column(Text, nullable=True)
    status = Column(String, default="Pending")  # Pending, Answered
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

