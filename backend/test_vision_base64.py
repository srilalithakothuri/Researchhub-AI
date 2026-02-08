from groq import Groq
import os
import base64
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_multimodal_base64():
    # A tiny 1x1 black pixel base64 for testing
    tiny_pixel_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{tiny_pixel_base64}"
                            },
                        },
                    ],
                }
            ],
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
    test_multimodal_base64()
