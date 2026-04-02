import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL")


def call_llm(prompt: str) -> Dict[str, Any]:
    import logging
    logger = logging.getLogger("app.ai_engine")
    url = "https://openrouter.ai/api/v1/chat/completions"

    try:
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
        timeout=60
      )
      logger.info(f"OpenRouter status: {response.status_code}")
      data = response.json()
      if "choices" not in data or not data["choices"]:
        logger.error(f"OpenRouter error or unexpected response: {data}")
        return {"error": "OpenRouter error", "details": data}
      content = data["choices"][0]["message"]["content"]
      try:
        return json.loads(content)
      except Exception as e:
        logger.error(f"Failed to parse LLM content as JSON: {content}")
        return {"raw": content, "error": str(e)}
    except Exception as e:
      logger.error(f"Exception during OpenRouter call: {e}")
      return {"error": "Exception during OpenRouter call", "details": str(e)}


def call_llm_analysis(task_description: str, priority_level: str) -> Dict[str, Any]:
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

    return call_llm(prompt)


def generate_wbs(scope: str, requirements: str, constraints: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior project manager AI specializing in Work Breakdown Structure (WBS).

Create a hierarchical WBS for the following project:

Project Scope:
{scope}

Requirements:
{requirements}

Constraints:
{constraints}

Return ONLY JSON in this format:
{{
  "wbs": [
    {{
      "id": "1",
      "name": "Project Phase 1",
      "description": "Description of phase",
      "children": [
        {{
          "id": "1.1",
          "name": "Task 1.1",
          "description": "Task description",
          "children": []
        }}
      ]
    }}
  ]
}}

Ensure the WBS is hierarchical, logical, and covers all requirements.
"""

    return call_llm(prompt)


def generate_tasks(scope: str, requirements: str, constraints: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior project manager AI specializing in task breakdown.

Create a detailed task list for the following project:

Project Scope:
{scope}

Requirements:
{requirements}

Constraints:
{constraints}

Return ONLY JSON in this format:
{{
  "tasks": [
    {{
      "id": "T001",
      "name": "Task Name",
      "description": "Detailed description",
      "duration_days": 5,
      "priority": "High|Medium|Low",
      "dependencies": ["T002", "T003"]
    }}
  ]
}}

Ensure tasks are specific, measurable, and include realistic durations.
"""

    return call_llm(prompt)


def generate_risks(scope: str, requirements: str, constraints: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior project manager AI specializing in risk management.

Identify and assess risks for the following project:

Project Scope:
{scope}

Requirements:
{requirements}

Constraints:
{constraints}

Return ONLY JSON in this format:
{{
  "risks": [
    {{
      "id": "R001",
      "name": "Risk Name",
      "description": "Detailed description",
      "probability": 0.3,
      "impact": "High|Medium|Low",
      "mitigation": "Mitigation strategy"
    }}
  ]
}}

Focus on realistic risks with proper probability and impact assessment.
"""

    return call_llm(prompt)


def generate_user_stories(scope: str, requirements: str, constraints: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior product owner AI specializing in user story creation.

Create user stories for the following project:

Project Scope:
{scope}

Requirements:
{requirements}

Constraints:
{constraints}

Return ONLY JSON in this format:
{{
  "user_stories": [
    {{
      "id": "US001",
      "role": "As a [user role]",
      "goal": "I want [goal]",
      "benefit": "so that [benefit]",
      "acceptance_criteria": [
        "Criteria 1",
        "Criteria 2"
      ]
    }}
  ]
}}

Ensure stories follow the standard format and are detailed.
"""

    return call_llm(prompt)


def generate_gantt(scope: str, requirements: str, constraints: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior project manager AI specializing in project scheduling.

Create a Gantt chart structure for the following project:

Project Scope:
{scope}

Requirements:
{requirements}

Constraints:
{constraints}

Return ONLY JSON in this format:
{{
  "gantt": {{
    "tasks": [
      {{
        "id": "T001",
        "name": "Task Name",
        "start_date": "2024-01-01",
        "end_date": "2024-01-05",
        "dependencies": []
      }}
    ],
    "milestones": [
      {{
        "id": "M001",
        "name": "Milestone Name",
        "date": "2024-01-10"
      }}
    ]
  }}
}}

Ensure dates are realistic and dependencies are logical.
"""

    return call_llm(prompt)
