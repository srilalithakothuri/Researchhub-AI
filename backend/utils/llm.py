<<<<<<< HEAD
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def chat_with_llm(messages: list, model: str = "llama-3.3-70b-versatile", temperature: float = 0.7):
    """
    Send messages to Groq LLM and get response.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Groq model name
        temperature: Response randomness (0-1)
    
    Returns:
        str: LLM response content
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=2048,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API Error: {str(e)}")

def analyze_research_trends(query: str):
    """
    Specialized agent for analyzing research trends.
    """
    system_prompt = """You are a Research Trend Analyzer AI. Your role is to:
    1. Identify emerging research topics and methodologies
    2. Analyze publication patterns and citation trends
    3. Suggest promising research directions
    4. Provide insights on interdisciplinary connections
    
    Be concise, data-driven, and actionable."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    
    return chat_with_llm(messages, temperature=0.5)

def research_assistant(query: str, context: str = ""):
    """
    General research assistant for answering questions.
    """
    system_prompt = """You are ResearchHub AI, an intelligent research assistant. You help researchers by:
    - Answering questions about research methodologies
    - Explaining complex concepts
    - Suggesting relevant papers and resources
    - Providing writing and analysis guidance
    
    Be helpful, accurate, and cite sources when possible."""
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"Context: {context}"})
    
    messages.append({"role": "user", "content": query})
    
    return chat_with_llm(messages)

def vision_assistant(query: str, image_base64: str, context: str = ""):
    """
    Multimodal assistant for analyzing images.
    """
    system_prompt = """You are a Research Vision AI. You analyze research data, charts, 
    and diagrams provided in images. Provide detailed technical descriptions and insights 
    based on the visual evidence."""
    
    # Vision models use a specific content structure
    content = []
    if query:
        content.append({"type": "text", "text": query})
    
    content.append({
        "type": "image_url",
        "image_url": {
            "url": f"data:image/jpeg;base64,{image_base64}"
        }
    })
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"Context: {context}"})
        
    messages.append({"role": "user", "content": content})
    
    return chat_with_llm(messages, model="meta-llama/llama-4-scout-17b-16e-instruct")
=======
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def chat_with_llm(messages: list, model: str = "llama-3.3-70b-versatile", temperature: float = 0.7):
    """
    Send messages to Groq LLM and get response.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Groq model name
        temperature: Response randomness (0-1)
    
    Returns:
        str: LLM response content
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=2048,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API Error: {str(e)}")

def analyze_research_trends(query: str):
    """
    Specialized agent for analyzing research trends.
    """
    system_prompt = """You are a Research Trend Analyzer AI. Your role is to:
    1. Identify emerging research topics and methodologies
    2. Analyze publication patterns and citation trends
    3. Suggest promising research directions
    4. Provide insights on interdisciplinary connections
    
    Be concise, data-driven, and actionable."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    
    return chat_with_llm(messages, temperature=0.5)

def research_assistant(query: str, context: str = ""):
    """
    General research assistant for answering questions.
    """
    system_prompt = """You are ResearchHub AI, an intelligent research assistant. You help researchers by:
    - Answering questions about research methodologies
    - Explaining complex concepts
    - Suggesting relevant papers and resources
    - Providing writing and analysis guidance
    
    Be helpful, accurate, and cite sources when possible."""
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"Context: {context}"})
    
    messages.append({"role": "user", "content": query})
    
    return chat_with_llm(messages)
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
