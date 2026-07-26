import datetime
import json
from app.database import SessionLocal, engine, Base
from app.models import User, Meeting, Task, Notification
from app.auth import get_password_hash

def seed_database():
    """
    Initializes the SQLite database schema without pre-populating demo users or sample data.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete demo user if present
        db.query(User).filter(User.email == "demo@meetmind.ai").delete()
        db.commit()
        print("Database initialized cleanly with 0 sample data.")

    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()


