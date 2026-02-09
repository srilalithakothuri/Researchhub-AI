<<<<<<< HEAD
# 🔑 Getting Your Groq API Key

## Step 1: Visit Groq Console
Go to [console.groq.com](https://console.groq.com)

## Step 2: Sign Up / Login
- Click "Sign Up" if you're new
- Or "Login" if you already have an account
- You can use Google/GitHub for quick signup

## Step 3: Navigate to API Keys
- Once logged in, click on "API Keys" in the left sidebar
- Or go directly to: https://console.groq.com/keys

## Step 4: Create New API Key
- Click "Create API Key" button
- Give it a name (e.g., "ResearchHub AI")
- Click "Submit"

## Step 5: Copy Your Key
- **IMPORTANT:** Copy the API key immediately!
- You won't be able to see it again
- Store it securely

## Step 6: Add to Your .env File
Open `backend/.env` and paste your key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
DATABASE_URL=sqlite:///./researchhub.db
SECRET_KEY=supersecretkey123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🎉 That's it!

Your ResearchHub AI is now ready to use Groq's ultra-fast Llama 3.3 70B model!

## 💡 Free Tier Limits
- **Free tier:** 30 requests/minute
- **14,400 tokens/minute**
- Perfect for development and testing!

## 🚀 Supported Models
- `llama-3.3-70b-versatile` (Default - Best for research)
- `llama-3.1-8b-instant` (Faster, smaller)
- `mixtral-8x7b-32768` (Long context)

---

**Need help?** Check [Groq Documentation](https://console.groq.com/docs)
=======
# 🔑 Getting Your Groq API Key

## Step 1: Visit Groq Console
Go to [console.groq.com](https://console.groq.com)

## Step 2: Sign Up / Login
- Click "Sign Up" if you're new
- Or "Login" if you already have an account
- You can use Google/GitHub for quick signup

## Step 3: Navigate to API Keys
- Once logged in, click on "API Keys" in the left sidebar
- Or go directly to: https://console.groq.com/keys

## Step 4: Create New API Key
- Click "Create API Key" button
- Give it a name (e.g., "ResearchHub AI")
- Click "Submit"

## Step 5: Copy Your Key
- **IMPORTANT:** Copy the API key immediately!
- You won't be able to see it again
- Store it securely

## Step 6: Add to Your .env File
Open `backend/.env` and paste your key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
DATABASE_URL=sqlite:///./researchhub.db
SECRET_KEY=supersecretkey123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🎉 That's it!

Your ResearchHub AI is now ready to use Groq's ultra-fast Llama 3.3 70B model!

## 💡 Free Tier Limits
- **Free tier:** 30 requests/minute
- **14,400 tokens/minute**
- Perfect for development and testing!

## 🚀 Supported Models
- `llama-3.3-70b-versatile` (Default - Best for research)
- `llama-3.1-8b-instant` (Faster, smaller)
- `mixtral-8x7b-32768` (Long context)

---

**Need help?** Check [Groq Documentation](https://console.groq.com/docs)
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
