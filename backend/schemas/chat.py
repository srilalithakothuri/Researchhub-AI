<<<<<<< HEAD
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    content: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatWithMessages(ChatResponse):
    messages: List[MessageResponse] = []
=======
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatWithMessages(ChatResponse):
    messages: List[MessageResponse] = []
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
