from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True
