from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def list_models():
    try:
        models = client.models.list()
        print("Available models:")
        for model in models.data:
            print(f"- {model.id}")
    except Exception as e:
        print("Error listing models:", str(e))

if __name__ == "__main__":
    list_models()
