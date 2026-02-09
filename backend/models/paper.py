<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    authors = Column(String, nullable=True)
    file_path = Column(String)
    file_name = Column(String)
    summary = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # AI-detected category (e.g., "Machine Learning", "Climate Science")
    tags = Column(Text, nullable=True)  # Comma-separated tags
    project_id = Column(Integer, ForeignKey("research_projects.id"), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class ResearchProject(Base):
    __tablename__ = "research_projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Integer, default=0)  # Boolean as int for SQLite
    priority = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
=======
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    authors = Column(String, nullable=True)
    file_path = Column(String)
    file_name = Column(String)
    summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Integer, default=0)  # Boolean as int for SQLite
    priority = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
