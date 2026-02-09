<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.docspace import Project, Note
from schemas.docspace import ProjectCreate, ProjectUpdate, ProjectResponse, NoteCreate, NoteUpdate, NoteResponse
from typing import List

router = APIRouter(
    prefix="/docspace",
    tags=["DocSpace"]
)

def get_current_user_id():
    return 1 # Mock user ID

# Project Endpoints
@router.post("/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_project = Project(user_id=user_id, **project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    return db.query(Project).filter(Project.user_id == user_id).all()

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# Note Endpoints
@router.post("/projects/{project_id}/notes", response_model=NoteResponse)
def create_note(project_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_note = Note(project_id=project_id, **note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/projects/{project_id}/notes", response_model=List[NoteResponse])
def get_notes(project_id: int, db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.project_id == project_id).all()

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}
=======
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.docspace import Project, Note
from schemas.docspace import ProjectCreate, ProjectUpdate, ProjectResponse, NoteCreate, NoteUpdate, NoteResponse
from typing import List

router = APIRouter(
    prefix="/docspace",
    tags=["DocSpace"]
)

def get_current_user_id():
    return 1 # Mock user ID

# Project Endpoints
@router.post("/projects", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    db_project = Project(user_id=user_id, **project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    user_id = get_current_user_id()
    return db.query(Project).filter(Project.user_id == user_id).all()

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# Note Endpoints
@router.post("/projects/{project_id}/notes", response_model=NoteResponse)
def create_note(project_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_note = Note(project_id=project_id, **note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/projects/{project_id}/notes", response_model=List[NoteResponse])
def get_notes(project_id: int, db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.project_id == project_id).all()

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
