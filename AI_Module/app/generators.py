import os
import json
import uuid
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")

genai.configure(api_key=GOOGLE_API_KEY)


# =========================
# 🔹 CORE LLM CALL (GEMINI)
# =========================
def call_llm(prompt: str) -> dict:
    model = genai.GenerativeModel(MODEL)

    try:
        response = model.generate_content(prompt)

        content = response.text.strip()

        # Gemini sometimes wraps JSON in ```json
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        return json.loads(content)

    except Exception as e:
        print("LLM Error:", e)
        return {}

# =========================
# 🧱 WBS GENERATOR
# =========================
def generate_wbs(prompt: str):
    full_prompt = f"""
You are a senior project manager with expertise in software engineering and system design.

Your task is to generate a Deliverable-Based Work Breakdown Structure (WBS) for the given project scope.

STRICT RULES:
- Return ONLY valid JSON (no explanations, no markdown, no text)
- Follow this exact structure:
{{
  "wbs": [
    {{
      "id": "1",
      "name": "Deliverable Name",
      "description": "Clear description of the deliverable",
      "children": [
        {{
          "id": "1.1",
          "name": "Actionable Task (verb-based)",
          "description": "Specific and measurable task",
          "children": []
        }}
      ]
    }}
  ]
}}

CONTENT RULES:
- The WBS MUST be deliverable-based (not phase-based like 'Design' or 'Development')
- Each top-level node MUST represent a SYSTEM COMPONENT or DELIVERABLE (e.g., Backend System, Mobile App, Database)
- Each child node MUST be a CONCRETE ACTION (must start with a verb like: Implement, Create, Design, Configure, Develop)
- Avoid vague or abstract names like "Management", "Planning", "Overview"
- Each task must represent a SINGLE, clear action
- Tasks must be small enough to be completed within 1–3 days
- Avoid combining multiple responsibilities in one task
- Prefer "Implement X", "Create Y", "Configure Z" over abstract descriptions
- Avoid technical jargon inside task names unless necessary
- Keep task names concise (max 8–12 words)
- If a task can be split into smaller independent tasks, split it
- Every node must be:
  - specific
  - measurable
  - actionable

STRUCTURE RULES:
- IDs must be hierarchical and unique (e.g., 1, 1.1, 1.1.1)
- Maximum depth = 3 levels
- Each parent must have at least 2 children when possible
"""

    result = call_llm(prompt + "\n\n" + full_prompt)

    return normalize_wbs(result.get("wbs", []))


def normalize_wbs(wbs):
    seen = set()

    def fix(node):
        if not node.get("id") or node["id"] in seen:
            node["id"] = str(uuid.uuid4())

        seen.add(node["id"])

        node["name"] = node.get("name") or "Unnamed"

        if "children" not in node or node["children"] is None:
            node["children"] = []

        for child in node["children"]:
            fix(child)

    for root in wbs:
        fix(root)

    return {"wbs": wbs}


# =========================
# 📋 TASKS GENERATOR
# =========================
def generate_tasks(prompt: str):
    full_prompt = f"""
Generate project tasks.

STRICT RULES:
- Return ONLY JSON
- Format:
{{
  "tasks": [
    {{
      "id": "string",
      "name": "string",
      "durationDays": number
    }}
  ]
}}
- durationDays must be > 0
"""

    result = call_llm(prompt + "\n\n" + full_prompt)

    return normalize_tasks(result.get("tasks", []))


def normalize_tasks(tasks):
    seen = set()

    for t in tasks:
        if not t.get("id") or t["id"] in seen:
            t["id"] = str(uuid.uuid4())

        seen.add(t["id"])

        t["name"] = t.get("name") or "Unnamed Task"

        duration = t.get("durationDays", 1)
        t["durationDays"] = max(1, int(duration))

    return {"tasks": tasks}


# =========================
# ⚠️ RISKS GENERATOR
# =========================
def generate_risks(prompt: str):
    full_prompt = f"""
Generate project risks.

STRICT RULES:
- Return ONLY JSON
- Format:
{{
  "risks": [
    {{
      "id": "string",
      "name": "string",
      "probability": number (0 to 1)
    }}
  ]
}}
- probability must be between 0 and 1
"""

    result = call_llm(prompt + "\n\n" + full_prompt)

    return normalize_risks(result.get("risks", []))


def normalize_risks(risks):
    seen = set()

    for r in risks:
        if not r.get("id") or r["id"] in seen:
            r["id"] = str(uuid.uuid4())

        seen.add(r["id"])

        r["name"] = r.get("name") or "Unnamed Risk"

        prob = r.get("probability", 0.5)
        prob = float(prob)

        r["probability"] = min(1, max(0, prob))

    return {"risks": risks}