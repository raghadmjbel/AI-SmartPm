from datetime import datetime, timedelta
def build_risks_prompt():
      return f""" ### TARGET ARTIFACT: RISK REGISTER ###
You are an expert Project Risk Manager. Your goal is to identify potential threats to the project by analyzing the scope and schedule provided in the previous context.

STRICT OUTPUT RULES:
- Return ONLY valid JSON (no markdown, no explanations)
- Use EXACT format:
{{
  "risks": [
    {{
      "id": "R-01",
      "related_task_id": "string",
      "description": "string",
      "category": "Technical | Schedule | Budget | Operational",
      "probability": "Low | Medium | High",
      "impact": "Low | Medium | High",
      "mitigation_plan": "string",
      "contingency_plan": "string",
      "owner": "string"
    }}
  ]
}}

RISK IDENTIFICATION RULES:
1. TRACEABILITY: Every risk MUST link to an existing Task ID from the context via the 'related_task_id' field.
2. CRITICAL PATH FOCUS: Identify risks for tasks with many dependencies (e.g., Integration, Database setup) or high complexity (e.g., Payment gateways).
3. CATEGORIZATION:
   - Technical: API failures, security vulnerabilities, tech stack limitations.
   - Schedule: Third-party delays, design bottlenecks, testing overruns.
   - Operational: Scope creep, user requirement shifts.
4. PROACTIVE MITIGATION: Define a clear step to prevent the risk from occurring.
5. REACTIVE CONTINGENCY: Define a "Plan B" if the risk event is triggered.

REALISM RULES:
- Use professional project management terminology.
- Ensure the 'owner' field reflects a realistic role (e.g., Senior Developer, Project Manager, Lead Designer).
- Probability and Impact must be balanced (not every risk can be 'High/High')."""

def build_wbs_prompt():
      return f"""
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

def build_tasks_prompt():
      return f"""
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
def build_gantt_prompt():
      return  f"""
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
def build_user_stories_prompt():
      return f"""
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