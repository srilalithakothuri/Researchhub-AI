from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def list_all_models():
    try:
        models = client.models.list()
        with open("models_full.txt", "w") as f:
            for model in sorted([m.id for m in models.data]):
                f.write(model + "\n")
        print("Models written to models_full.txt")
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    list_all_models()
