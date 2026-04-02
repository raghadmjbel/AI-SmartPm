import os
import json
import uuid
import requests
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")

if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY environment variable not set!")
else:
    logger.info(f"GOOGLE_API_KEY is set. Model: {MODEL}")

genai.configure(api_key=GOOGLE_API_KEY)


# =========================
# 🔹 CORE LLM CALL (GEMINI)
# =========================
def call_llm(prompt: str) -> dict:
    logger.info(f"Calling Gemini API with model: {MODEL}, prompt length: {len(prompt)}")
    model = genai.GenerativeModel(MODEL)

    try:
        response = model.generate_content(prompt, request_options={"timeout": 45})

        content = response.text.strip()
        logger.info(f"Received response from Gemini, content length: {len(content)}")

        # Gemini sometimes wraps JSON in ```json
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        parsed = json.loads(content)
        logger.info(f"Parsed JSON successfully, keys: {list(parsed.keys()) if isinstance(parsed, dict) else 'not a dict'}")
        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from Gemini response: {e}")
        return {}
    except Exception as e:
        logger.error(f"LLM Error: {type(e).__name__}: {e}", exc_info=True)
        return {}

# =========================
# 🧱 WBS GENERATOR
# =========================
def generate_wbs(prompt: str):
    logger.info(f"Starting WBS generation with prompt length: {len(prompt)}")
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

    try:
        logger.info("Calling LLM to generate WBS")
        result = call_llm(prompt + "\n\n" + full_prompt)
        logger.info(f"LLM returned result with keys: {list(result.keys()) if isinstance(result, dict) else 'not a dict'}")
        
        if not isinstance(result, dict):
            logger.error(f"LLM returned non-dict result: {type(result)}")
            return {"wbs": []}
        
        wbs_list = result.get("wbs", [])
        logger.info(f"Extracting WBS list, count: {len(wbs_list) if isinstance(wbs_list, list) else 'not a list'}")
        
        normalized = normalize_wbs(wbs_list)
        logger.info(f"Normalized WBS, final structure keys: {list(normalized.keys())}")
        return normalized
    except Exception as e:
        logger.error(f"Error during WBS generation: {type(e).__name__}: {e}", exc_info=True)
        return {"wbs": []}


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
    logger.info(f"Starting tasks generation with prompt length: {len(prompt)}")
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

    try:
        result = call_llm(prompt + "\n\n" + full_prompt)
        tasks = result.get("tasks", [])
        logger.info(f"Generated {len(tasks) if isinstance(tasks, list) else '?'} tasks")
        normalized = normalize_tasks(tasks)
        logger.info(f"Normalized tasks, count: {len(normalized.get('tasks', []))}")
        return normalized
    except Exception as e:
        logger.error(f"Error during tasks generation: {type(e).__name__}: {e}", exc_info=True)
        return {"tasks": []}


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
    logger.info(f"Starting risks generation with prompt length: {len(prompt)}")
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

    try:
        result = call_llm(prompt + "\n\n" + full_prompt)
        risks = result.get("risks", [])
        logger.info(f"Generated {len(risks) if isinstance(risks, list) else '?'} risks")
        normalized = normalize_risks(risks)
        logger.info(f"Normalized risks, count: {len(normalized.get('risks', []))}")
        return normalized
    except Exception as e:
        logger.error(f"Error during risks generation: {type(e).__name__}: {e}", exc_info=True)
        return {"risks": []}


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