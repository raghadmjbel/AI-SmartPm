import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL")


def call_llm(task_description: str, priority_level: str):
    url = "https://openrouter.ai/api/v1/chat/completions"

    prompt = f"""
You are a senior project manager AI.

Analyze the following task:

Task Description:
{task_description}

Initial Priority Guess:
{priority_level}

Return ONLY JSON in this format:
{{
  "priority": "High | Medium | Low",
  "score": 0.0-1.0,
  "recommendation": "Short actionable advice"
}}
"""

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
        },
        timeout=30,
    )

    data = response.json()

    content = data["choices"][0]["message"]["content"]

    import json
    try:
        parsed = json.loads(content)
    except:
        parsed = {
            "priority": "Medium",
            "score": 0.5,
            "recommendation": "Fallback due to parsing error"
        }

    return parsed
