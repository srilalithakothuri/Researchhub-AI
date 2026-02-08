from groq import Groq
import os
import base64
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_vision():
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What is in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                            },
                        },
                    ],
                }
            ],
            model="llava-v1.5-7b-4096-preview",
        )
        print("Vision Success:", chat_completion.choices[0].message.content)
    except Exception as e:
        with open("error.txt", "w") as f:
            f.write(str(e))
            if hasattr(e, 'body'):
                f.write("\nBody: " + str(e.body))
        print("Vision Error written to error.txt")

if __name__ == "__main__":
    test_vision()
