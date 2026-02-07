from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.paper import Task
from schemas.paper import TaskCreate, TaskUpdate, TaskResponse
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

def get_current_user_id():
    return 1

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    user_id = get_current_user_id()
    new_task = Task(
        user_id=user_id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {**new_task.__dict__, "completed": bool(new_task.completed)}

@router.get("/", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    """Get all tasks for current user"""
    user_id = get_current_user_id()
    tasks = db.query(Task).filter(Task.user_id == user_id).order_by(Task.created_at.desc()).all()
    return [{**task.__dict__, "completed": bool(task.completed)} for task in tasks]

@router.get("/stats")
def get_task_stats(db: Session = Depends(get_db)):
    """Get task statistics and consistency data"""
    user_id = get_current_user_id()
    
    total = db.query(Task).filter(Task.user_id == user_id).count()
    completed = db.query(Task).filter(Task.user_id == user_id, Task.completed == 1).count()
    pending = total - completed
    
    # Get completion rate over last 7 days
    consistency_data = []
    for i in range(7):
        date = datetime.now().date()
        # Simplified - in production, calculate per day
        consistency_data.append({
            "date": str(date),
            "completed": completed // 7  # Mock data
        })
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "completion_rate": (completed / total * 100) if total > 0 else 0,
        "consistency": consistency_data
    }

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.completed is not None:
        task.completed = 1 if task_update.completed else 0
        if task_update.completed:
            task.completed_at = datetime.now()
    
    db.commit()
    db.refresh(task)
    return {**task.__dict__, "completed": bool(task.completed)}

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
