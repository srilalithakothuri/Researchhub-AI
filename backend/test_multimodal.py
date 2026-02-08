from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_multimodal():
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
            # Testing Llama 4 Scout
            model="meta-llama/llama-4-scout-17b-16e-instruct",
        )
        print("Multimodal Success:", chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        if hasattr(e, 'body'):
            import json
            print("Error Body:", json.dumps(e.body, indent=2))

if __name__ == "__main__":
    test_multimodal()
