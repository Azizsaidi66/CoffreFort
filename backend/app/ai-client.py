import requests
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

def summarize_text(text):
    if not text:
        return {"summary": "", "keywords": []}
    payload = {
        "model": "llama",  # replace with your Ollama model name
        "prompt": f"Summarize this document in 3 bullet points and give 5 keywords:\n\n{text}"
    }
    try:
        r = requests.post(f"{OLLAMA_URL}/api/completions", json=payload, timeout=30)
        if r.ok:
            return r.json()
        return {"error": r.text}
    except Exception as e:
        return {"error": str(e)}