# 🚀 ResearchHub AI - Intelligent Research Assistant Platform

A scalable, AI-powered research assistant platform built with **FastAPI**, **Groq Llama 3.3 70B**, **React**, and **TypeScript**.

## ✨ Features

### 🔐 Authentication System
- Secure JWT-based authentication
- User registration and login
- Password hashing with bcrypt

### 💬 AI Chat Module
- **Text Chatbot** powered by Groq Llama 3.3 70B
- **Chat History** - Save and manage multiple conversations
- **Message Search** - Find specific messages in your chat history
- **Auto-scroll** - Smooth scrolling to latest messages
- **Research Assistant** - Specialized AI agent for research queries
- **Trend Analyzer** - Analyze research trends and patterns

### 🎨 UI/UX
- **Space Theme** - Lavender + Black futuristic design
- **Dark Mode** by default
- **Smooth Animations** with Framer Motion
- **Responsive Design** - Works on all screen sizes
- **Glassmorphism** effects

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Groq API** - Ultra-fast LLM inference (Llama 3.3 70B)
- **SQLAlchemy** - ORM for database management
- **SQLite** - Local database (easily switchable to PostgreSQL)
- **JWT** - Secure authentication
- **Pydantic** - Data validation

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## 📦 Installation

### Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **Groq API Key** (Get free at [console.groq.com](https://console.groq.com))

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd ResearchHub-AI/backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///./researchhub.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. **Run the backend server:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd ResearchHub-AI/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎯 Usage

1. **Register an account** at `/register`
2. **Login** at `/login`
3. **Navigate to Chat** from the sidebar
4. **Click "New Chat"** to start a conversation
5. **Ask research questions** and get AI-powered responses

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

#### Chat
- `POST /chat/` - Create new chat
- `GET /chat/` - Get all user chats
- `GET /chat/{chat_id}` - Get chat with messages
- `POST /chat/{chat_id}/message` - Send message and get AI response
- `DELETE /chat/{chat_id}` - Delete chat

## 🔮 Upcoming Features

### Phase 2: RAG & Research Tools
- [ ] PDF Upload & Text Extraction
- [ ] Vector Database Integration (ChromaDB/Pinecone)
- [ ] Chat with PDF
- [ ] ArXiv/Semantic Scholar API Integration
- [ ] Research Discovery Agent

### Phase 3: Advanced Features
- [ ] Task Scheduler with Calendar
- [ ] Consistency Graph & Reminders
- [ ] Research Analytics & Visualizations
- [ ] Paper Comparison Tool
- [ ] Research Gap Detection
- [ ] Bias & Ethics Analyzer
- [ ] DocSpace (AI-assisted writing)

### Phase 4: Production
- [ ] Voice Assistant (Speech-to-Text + TTS)
- [ ] Multi-Agent Collaboration
- [ ] Redis Caching
- [ ] Async Task Queues (Celery/ARQ)
- [ ] Docker Deployment
- [ ] PostgreSQL Migration
- [ ] CI/CD Pipeline

## 🏗️ Project Structure

```
ResearchHub-AI/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database configuration
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   └── chat.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   └── chat.py
│   ├── routers/             # API routes
│   │   ├── auth.py
│   │   └── chat.py
│   ├── utils/               # Utility functions
│   │   ├── security.py      # JWT & password hashing
│   │   └── llm.py           # Groq LLM integration
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   ├── layouts/         # Layout components
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ChatPage.tsx
│   │   ├── services/        # API services
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   └── lib/             # Utilities
│   │       └── utils.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Groq** for ultra-fast LLM inference
- **Meta** for Llama 3.3 70B model
- **FastAPI** community
- **React** & **Tailwind CSS** teams

---

**Built with ❤️ for researchers by researchers**
