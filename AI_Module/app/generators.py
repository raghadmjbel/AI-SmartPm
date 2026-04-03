from datetime import datetime, timedelta
import os
import json
import uuid
import requests
import time
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
def call_llm(prompt: str, max_retries: int = 3) -> dict:
    """
    Call Gemini API with retry logic for transient failures.
    
    Args:
        prompt: The prompt to send to the API
        max_retries: Maximum number of retry attempts (default: 3)
    
    Returns:
        Parsed JSON response or empty dict on failure
    """
    model = genai.GenerativeModel(MODEL)
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling Gemini API (attempt {attempt + 1}/{max_retries}), model: {MODEL}, prompt length: {len(prompt)}")
            response = model.generate_content(prompt, request_options={"timeout": 120})

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
            logger.error(f"Failed to parse JSON from Gemini response (attempt {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                return {}
                
        except (TimeoutError, Exception) as e:
            error_name = type(e).__name__
            is_deadline = "DeadlineExceeded" in error_name or "Deadline" in str(e)
            
            logger.warning(f"API call failed (attempt {attempt + 1}/{max_retries}): {error_name}: {e}")
            
            if attempt < max_retries - 1:
                # Exponential backoff: 1s, 2s, 4s
                wait_time = 2 ** attempt
                logger.info(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                logger.error(f"LLM Error after {max_retries} attempts: {error_name}: {e}", exc_info=True)
                return {}
    
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
# =========================
# 📊 GANTT GENERATOR
# =========================
def generate_gantt(prompt: str):
    logger.info(f"Starting Gantt generation with prompt length: {len(prompt)}")

    full_prompt = f"""
Generate a Gantt chart task schedule.

STRICT OUTPUT RULES:
- Return ONLY valid JSON (no markdown, no explanations)
- Use EXACT format:
{{
  "tasks": [
    {{
      "id": "string",
      "name": "string",
      "start_date": "string",
      "end_date": "string",
      "dependencies": ["taskId"]
    }}
  ],
  "milestones": [
    {{
        "id": "string",
        "name": "string",
        "date": "string"
 }}
]
}}

 if not already specified, consider today is {datetime.now().strftime("%Y-%m-%d")}
CORE SCHEDULING RULES:
- Project starts today or at a specified start date
- start_date >= today
- end_date > start_date
- end_date = start_date + duration_days
- Prefer earliest valid start_date (ASAP scheduling)

DEPENDENCY RULES:
- Task MUST NOT start before ALL dependencies finish
- start_date(task) >= max(end_date of all dependencies)
- All dependencies must reference valid existing task IDs
- No circular dependencies

STRUCTURE AND PARALLELIZATION:
- Tasks in the same feature/component are sequential unless explicitly independent
- Independent components should run in parallel if possible
- Backend must precede dependent frontend work
- Integration tasks depend on both backend and frontend completion

REALISM RULES:
- Follow standard software workflow: Planning → Design → Backend → Frontend → Integration → Testing → Deployment
- Testing depends on all major features
- Deployment is final
- Use realistic durations for each task type (Planning 5–10d, Design 10–20d, Backend 20–30d, Frontend 20–40d, Integration 5–10d, Testing 15–30d, Deployment 1–3d)

CONSISTENCY RULES:
- Use provided tasks and durations exactly; do NOT invent new tasks or change names
- If no tasks are provided, generate realistic tasks with proper durations

MILESTONE RULES:
- Milestones must occur after completion of relevant tasks
- Milestone date = latest end_date of all related tasks

ANTI-PATTERNS TO AVOID:
- Tasks starting before dependencies complete
- Missing dependencies
- Sequential tasks where parallel is possible
- Overlapping tasks that should be sequential
- Unrealistic sequencing (e.g., frontend before backend APIs exist)

EXAMPLE:
Task A (duration 3d, no deps) → start_date: today, end_date: today+3d
Task B (depends on A, duration 3d) → start_date: today+3d, end_date: today+6d
Task C (independent, duration 5d) → start_date: today
Task D (depends on B and C, duration 4d) → start_date: max(end(B), end(C)), end_date = start_date + 4d
"""

    try:
        result = call_llm(prompt + "\n\n" + full_prompt)
        tasks = result.get("tasks", [])
        milestones = result.get("milestones", [])
        logger.info(f"Generated {len(tasks) if isinstance(tasks, list) else '?'} gantt tasks")

        normalized = normalize_gantt(tasks, milestones)
        return normalized

    except Exception as e:
        logger.error(f"Error during Gantt generation: {type(e).__name__}: {e}", exc_info=True)
        return {"gantt": []}
def normalize_gantt(input_tasks, input_milestones=None, project_start=datetime.now().strftime("%Y-%m-%d")):
    """
    Normalize tasks and milestones into consistent Gantt JSON structure.

    input_tasks: list of dicts with optional keys: id, name, startDay, durationDays, dependencies
    input_milestones: list of dicts with optional keys: id, name, date
    project_start: str, starting date of project in YYYY-MM-DD
    """
    seen_tasks = set()
    start_date_obj = datetime.strptime(project_start, "%Y-%m-%d")

    normalized_tasks = []
    for t in input_tasks:
        # Unique ID
        if not t.get("id") or t["id"] in seen_tasks:
            t["id"] = str(uuid.uuid4())
        seen_tasks.add(t["id"])

        # Name
        t["name"] = t.get("name") or "Unnamed Task"

    

        # Dependencies
        if "dependencies" not in t or t["dependencies"] is None:
            t["dependencies"] = []

        normalized_tasks.append(t)

    # Normalize milestones
    normalized_milestones = []
    if input_milestones:
        seen_milestones = set()
        for m in input_milestones:
            if not m.get("id") or m["id"] in seen_milestones:
                m["id"] = str(uuid.uuid4())
            seen_milestones.add(m["id"])
            m["name"] = m.get("name") or "Unnamed Milestone"

            # Ensure date is set, default to project start if missing
            date_str = m.get("date") or project_start
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                date_str = project_start
            m["date"] = date_str

            normalized_milestones.append(m)

    return {
        "gantt": {
            "tasks": normalized_tasks,
            "milestones": normalized_milestones
        }
    }
        
# =========================
# 🧑‍💻 USER STORIES GENERATOR
# =========================
def generate_user_stories(prompt: str):
    logger.info(f"Starting user stories generation with prompt length: {len(prompt)}")

    full_prompt = f"""
Generate Agile user stories for the project.

STRICT RULES:
- Return ONLY JSON (no explanations, no markdown)
- Use EXACT format:
{{
  "stories": [
    {{
      "id": "string",
      "role": "string",
      "goal": "string",
      "benefit": "string",
      "acceptance_criteria": ["string"]
    }}
  ]
}}

CONTENT RULES:
- Follow standard Agile user story format:
- Each story must represent a SINGLE feature or functionality
- Avoid combining multiple features in one story
- Stories must be clear, testable, and user-focused
- No titles, no description, strictly use the JSON format I defined above.

ROLES:
- Use realistic roles (e.g., Customer, Admin, Guest, Seller)
- Do NOT use vague roles like "User" unless necessary

ACCEPTANCE CRITERIA RULES:
- Each story MUST have 2–5 acceptance criteria
- Each criterion must be:
  - specific
  - testable
  - measurable

QUALITY RULES:
- Avoid technical implementation details
- Focus on business value and user outcomes
- Cover all major system features:
  - authentication
  - core functionality
  - edge cases (e.g., empty states, errors)

ANTI-PATTERNS (MUST AVOID):
- Stories without acceptance criteria
- Vague descriptions
- Technical tasks instead of user value
- Duplicate or overlapping stories
"""

    try:
        result = call_llm(prompt + "\n\n" + full_prompt)
        stories = result.get("stories", [])
        logger.info(f"Generated {len(stories) if isinstance(stories, list) else '?'} user stories")

        normalized = normalize_user_stories(stories)
        return normalized

    except Exception as e:
        logger.error(f"Error during user stories generation: {type(e).__name__}: {e}", exc_info=True)
        return {"user_stories": []}
def normalize_user_stories(stories):
    seen = set()

    for s in stories:
        if not s.get("id") or s["id"] in seen:
            s["id"] = str(uuid.uuid4())

        seen.add(s["id"])

      

        if "acceptance_criteria" not in s or s["acceptance_criteria"] is None:
            s["acceptance_criteria"] = []

        # Ensure list and non-empty
        if not isinstance(s["acceptance_criteria"], list):
            s["acceptance_criteria"] = []

        if len(s["acceptance_criteria"]) == 0:
            s["acceptance_criteria"].append("System performs expected behavior")

    return {"user_stories": stories}