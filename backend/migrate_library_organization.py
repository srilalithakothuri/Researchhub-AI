import sqlite3
import os

# Path to database
db_path = "researchhub.db"

if not os.path.exists(db_path):
    print(f"Error: Database file '{db_path}' not found!")
    exit(1)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(papers)")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"Current columns in papers table: {columns}")
    
    # Add category column if it doesn't exist
    if 'category' not in columns:
        print("Adding 'category' column...")
        cursor.execute("ALTER TABLE papers ADD COLUMN category TEXT")
        print("✓ Added 'category' column")
    else:
        print("✓ 'category' column already exists")
    
    # Add tags column if it doesn't exist
    if 'tags' not in columns:
        print("Adding 'tags' column...")
        cursor.execute("ALTER TABLE papers ADD COLUMN tags TEXT")
        print("✓ Added 'tags' column")
    else:
        print("✓ 'tags' column already exists")
    
    # Add project_id column if it doesn't exist
    if 'project_id' not in columns:
        print("Adding 'project_id' column...")
        cursor.execute("ALTER TABLE papers ADD COLUMN project_id INTEGER")
        print("✓ Added 'project_id' column")
    else:
        print("✓ 'project_id' column already exists")
    
    # Create research_projects table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    print("✓ Created/verified 'research_projects' table")
    
    # Commit changes
    conn.commit()
    print("\n✅ Database migration completed successfully!")
    
    # Verify changes
    cursor.execute("PRAGMA table_info(papers)")
    new_columns = [col[1] for col in cursor.fetchall()]
    print(f"\nUpdated columns in papers table: {new_columns}")
    
except Exception as e:
    print(f"\n❌ Migration failed: {str(e)}")
    conn.rollback()
finally:
    conn.close()
