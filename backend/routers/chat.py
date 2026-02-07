from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.chat import Chat, Message
from models.user import User
from schemas.chat import ChatCreate, ChatResponse, MessageCreate, MessageResponse, ChatWithMessages
from utils.llm import research_assistant, analyze_research_trends
from typing import List

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# Mock authentication - In production, use proper JWT validation
def get_current_user_id():
    return 1  # For now, return a default user ID

@router.post("/", response_model=ChatResponse)
def create_chat(chat: ChatCreate, db: Session = Depends(get_db)):
    """Create a new chat session"""
    user_id = get_current_user_id()
    new_chat = Chat(user_id=user_id, title=chat.title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@router.get("/", response_model=List[ChatResponse])
def get_user_chats(db: Session = Depends(get_db)):
    """Get all chats for the current user"""
    user_id = get_current_user_id()
    chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).all()
    return chats

@router.get("/{chat_id}", response_model=ChatWithMessages)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    """Get a specific chat with all messages"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()
    
    return {
        "id": chat.id,
        "user_id": chat.user_id,
        "title": chat.title,
        "created_at": chat.created_at,
        "messages": messages
    }

@router.post("/{chat_id}/message", response_model=MessageResponse)
def send_message(chat_id: int, message: MessageCreate, db: Session = Depends(get_db)):
    """Send a message and get AI response"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Save user message
    user_message = Message(chat_id=chat_id, role="user", content=message.content)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Get chat history for context
    previous_messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()
    context = "\n".join([f"{msg.role}: {msg.content}" for msg in previous_messages[-5:]])  # Last 5 messages
    
    # Get AI response
    try:
        ai_response = research_assistant(message.content, context=context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
    
    # Save AI response
    assistant_message = Message(chat_id=chat_id, role="assistant", content=ai_response)
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    # Update chat title if it's the first message
    if len(previous_messages) == 1:  # Only user message exists
        chat.title = message.content[:50] + "..." if len(message.content) > 50 else message.content
        db.commit()
    
    return assistant_message

@router.post("/analyze-trends")
def analyze_trends(query: dict, db: Session = Depends(get_db)):
    """Analyze research trends based on query"""
    try:
        result = analyze_research_trends(query.get("query", ""))
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis Error: {str(e)}")

@router.delete("/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    """Delete a chat and all its messages"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete all messages first
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat deleted successfully"}
