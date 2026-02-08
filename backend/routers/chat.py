from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import base64
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
def send_message(
    chat_id: int, 
    content: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    image_base64 = None
    image_url = None
    if image:
        try:
            image_data = image.file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            # For this demo, we store the base64 string in the DB. 
            # In production, you'd upload to S3 and store the URL.
            image_url = f"data:image/jpeg;base64,{image_base64}"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

    # Save user message
    user_message = Message(chat_id=chat_id, role="user", content=content, image_url=image_url)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Get chat history for context
    previous_messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()
    context = "\n".join([f"{msg.role}: {msg.content}" for msg in previous_messages[-5:] if msg.content])  # Last 5 messages
    
    # Get AI response
    try:
        if image_base64:
            ai_response = vision_assistant(content or "Analyze this image.", image_base64, context=context)
        else:
            ai_response = research_assistant(content, context=context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
    
    # Save AI response
    assistant_message = Message(chat_id=chat_id, role="assistant", content=ai_response)
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    # Update chat title if it's the first message
    if len(previous_messages) == 1:  # Only user message exists
        title_source = content or "Image Analysis"
        chat.title = title_source[:50] + "..." if len(title_source) > 50 else title_source
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
