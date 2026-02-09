import sqlite3
import os

db_path = "researchhub.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current columns
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "otp" not in columns:
            print("Adding 'otp' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN otp TEXT")
            conn.commit()
            print("OTP column added.")
        
        if "otp_expiry" not in columns:
            print("Adding 'otp_expiry' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN otp_expiry DATETIME")
            conn.commit()
            print("OTP Expiry column added.")
            
        conn.close()
        print("Migration task completed.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
