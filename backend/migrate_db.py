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
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(messages)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "image_url" not in columns:
            print("Adding 'image_url' column to 'messages' table...")
            cursor.execute("ALTER TABLE messages ADD COLUMN image_url TEXT")
            conn.commit()
            print("Migration successful.")
        else:
            print("'image_url' column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
