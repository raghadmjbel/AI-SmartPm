import os
import json
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
#  CORE LLM CALL (GEMINI)
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
