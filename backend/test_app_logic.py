from groq import Groq
import os
import base64
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_app_vision_logic():
    # A bit more realistic 100x100 RGB square (red)
    # Generated programmatically
    from PIL import Image
    import io
    img = Image.new('RGB', (100, 100), color='red')
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    query = "Analyze this image."
    image_base64 = img_b64
    
    content = [
        {"type": "text", "text": query},
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_base64}"
            }
        }
    ]
    
    messages = [
        {"role": "system", "content": "You are a Research Vision AI."},
        {"role": "user", "content": content}
    ]
    
    try:
        completion = client.chat.completions.create(
            messages=messages,
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.7,
            max_tokens=1024
        )
        print("Success:", completion.choices[0].message.content)
    except Exception as e:
        print(f"Error: {type(e).__name__} - {str(e)}")
        if hasattr(e, 'body'):
            import json
            print("Body:", json.dumps(e.body, indent=2))

if __name__ == "__main__":
    test_app_vision_logic()
