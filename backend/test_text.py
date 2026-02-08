from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_text():
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            model="llama-3.3-70b-versatile",
        )
        print("Text Success:", chat_completion.choices[0].message.content)
    except Exception as e:
        print("Text Error:", str(e))

if __name__ == "__main__":
    test_text()
