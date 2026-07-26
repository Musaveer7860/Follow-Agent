import sqlite3
from app.database import engine, Base
import app.models  # load models

def migrate():
    Base.metadata.create_all(bind=engine)
    conn = sqlite3.connect("meetmind.db")
    cursor = conn.cursor()
    
    columns_to_add = [
        ("tasks", "scheduled_email_date", "TEXT"),
        ("tasks", "email_sent", "BOOLEAN DEFAULT 0"),
        ("tasks", "last_email_sent_at", "DATETIME"),
        ("users", "team_lead_id", "INTEGER"),
    ]

    for table, col, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type};")
            print(f"Added column {col} to {table}")
        except Exception as e:
            print(f"Column {col} on {table}: {e}")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate()

