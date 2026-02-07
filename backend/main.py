from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import user as user_model, chat as chat_model, paper as paper_model, docspace as docspace_model
from routers import auth, chat, papers, tasks, docspace

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResearchHub AI API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(papers.router)
app.include_router(tasks.router)
app.include_router(docspace.router)

@app.get("/")
async def root():
    return {"message": "Welcome to ResearchHub AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
