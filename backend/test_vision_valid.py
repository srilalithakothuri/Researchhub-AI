from groq import Groq
import os
import base64
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_multimodal_valid_base64():
    # Valid 100x100 white square PNG in base64
    valid_base64 = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAALklEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABuDg8AAAF7Xf7uAAAAAElFTkSuQmCC"
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What color is this square?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{valid_base64}"
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
        )
        print("Multimodal Success:", chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        if hasattr(e, 'body'):
            import json
            print("Error Body:", json.dumps(e.body, indent=2))

if __name__ == "__main__":
    test_multimodal_valid_base64()
