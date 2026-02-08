from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def find_vision_models():
    try:
        models = client.models.list()
        vision_candidates = []
        for m in models.data:
            # Check for keywords or common vision model prefixes
            if any(k in m.id.lower() for k in ["vision", "multimodal", "llava", "maverick", "scout"]):
                vision_candidates.append(m.id)
        
        print("Vision Candidates:")
        for v in vision_candidates:
            print(f"- {v}")
            
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    find_vision_models()
