<<<<<<< HEAD
=======
from datetime import datetime, timedelta
import os
import json
import uuid
import requests
import time
import google.generativeai as genai
from dotenv import load_dotenv
>>>>>>> c7267938b8a8033242579aa007ab2b51edc19c70
import logging
from app.context_appender import appendPreviousArtificats
from app.response_normalizer import normalize_tasks, normalize_wbs, normalize_gantt, normalize_user_stories, normalize_risks
from app.prompt_builder import build_wbs_prompt, build_gantt_prompt, build_tasks_prompt, build_user_stories_prompt, build_risks_prompt
from app.ai_core import call_llm


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# =========================
#  WBS GENERATOR
# =========================
<<<<<<< HEAD
def generate_wbs(prompt: str, context_data=None):
=======
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
>>>>>>> c7267938b8a8033242579aa007ab2b51edc19c70
    logger.info(f"Starting WBS generation with prompt length: {len(prompt)}")
    full_prompt = build_wbs_prompt()
    full_prompt = appendPreviousArtificats('WBS', context_data, full_prompt)
    print("Full WBS Prompt:", full_prompt)  # Debug print to check the final prompt being sent to LLM
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





# =========================
#  TASKS GENERATOR
# =========================
def generate_tasks(prompt: str, context_data=None):
    logger.info(f"Starting tasks generation with prompt length: {len(prompt)}")
    full_prompt = build_tasks_prompt()
    full_prompt = appendPreviousArtificats('tasks', context_data, full_prompt)


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





# =========================
# RISKS GENERATOR
# =========================
def generate_risks(prompt: str, context_data=None):
    logger.info(f"Starting risks generation with prompt length: {len(prompt)}")
    full_prompt = build_risks_prompt()
    full_prompt = appendPreviousArtificats('risks', context_data, full_prompt)


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



# ========================
#  GANTT GENERATOR
# =========================
def generate_gantt(prompt: str,  context_data=None):
    logger.info(f"Starting Gantt generation with prompt length: {len(prompt)}")

    full_prompt = build_gantt_prompt()
    full_prompt = appendPreviousArtificats('gantt', context_data, full_prompt)


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

# =========================
#  USER STORIES GENERATOR
# =========================
def generate_user_stories(prompt: str, context_data=None):
    logger.info(f"Starting user stories generation with prompt length: {len(prompt)}")

    full_prompt = build_user_stories_prompt()
    full_prompt = appendPreviousArtificats('user_stories', context_data, full_prompt)

    try:
        result = call_llm(prompt + "\n\n" + full_prompt)
        stories = result.get("stories", [])
        logger.info(f"Generated {len(stories) if isinstance(stories, list) else '?'} user stories")

        normalized = normalize_user_stories(stories)
        return normalized

    except Exception as e:
        logger.error(f"Error during user stories generation: {type(e).__name__}: {e}", exc_info=True)
        return {"user_stories": []}
