import uuid
from datetime import datetime, timedelta
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
import uuid

def normalize_risks(risks_input):
    if not risks_input:
        return {"risks": []}

    # Mapping for AI text-based probabilities
    prob_map = {"high": 0.9, "medium": 0.5, "low": 0.2}
    normalized = []
    seen = set()

    for r in risks_input:
        # Create a copy to avoid mutating the original input list
        risk = r.copy()

        # 1. Handle ID persistence and uniqueness
        risk_id = risk.get("id")
        if not risk_id or risk_id in seen:
            risk_id = f"R-{uuid.uuid4().hex[:6]}"
        
        risk["id"] = risk_id
        seen.add(risk_id)

        # 2. Basic naming
        risk["name"] = risk.get("name") or risk.get("description", "Unnamed Risk")[:30]

        # 3. Robust Probability Conversion
        raw_prob = risk.get("probability", 0.5)
        
        if isinstance(raw_prob, str):
            # Handle "High/Medium/Low" from AI or numeric strings
            val = prob_map.get(raw_prob.lower())
            if val is None:
                try:
                    val = float(raw_prob)
                except ValueError:
                    val = 0.5
        else:
            val = float(raw_prob)

        risk["probability"] = min(1.0, max(0.0, val))
        normalized.append(risk)

    return {"risks": normalized}
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