from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaperUpload(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None

class PaperResponse(BaseModel):
    id: int
    user_id: int
    title: str
    authors: Optional[str]
    file_name: str
    summary: Optional[str]
    category: Optional[str]
    tags: Optional[str]
    project_id: Optional[int]
    uploaded_at: datetime

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    completed: bool
    priority: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
