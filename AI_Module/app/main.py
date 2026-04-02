from fastapi import FastAPI, HTTPException, Request
import json
import logging
from app.generators import generate_wbs, generate_tasks, generate_risks
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

@app.post("/generate/{artifact_type}")
async def generate(artifact_type: str, request: Request):
    logger.info(f"Received request to generate {artifact_type}")
    try:
        data = await request.json()
        logger.info(f"Request data: {list(data.keys())}")
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}")
        raise HTTPException(400, f"Invalid JSON: {e}")

    # Accept both camelCase and snake_case keys
    def get_field(*names):
        for n in names:
            if n in data:
                return data[n]
        return None

    prompt = get_field("prompt")
    scope = get_field("scope")
    requirements = get_field("requirements")
    constraints = get_field("constraints")

    logger.info(f"Extracted fields - scope: {'present' if scope else 'missing'}, requirements: {'present' if requirements else 'missing'}, constraints: {'present' if constraints else 'missing'}, prompt: {'present' if prompt else 'missing'}")

    try:
        if artifact_type == "wbs":
            # Prefer explicit fields, fallback to prompt
            if scope is not None and requirements is not None and constraints is not None:
                logger.info("Using scope, requirements, constraints for WBS generation")
                combined_prompt = f"Scope: {scope}\nRequirements: {requirements}\nConstraints: {constraints}"
                result = generate_wbs(combined_prompt)
            elif prompt is not None:
                logger.info("Using prompt for WBS generation")
                result = generate_wbs(prompt)
            else:
                logger.error("Missing required fields for WBS generation")
                raise HTTPException(400, "Missing required fields for WBS generation.")

        elif artifact_type == "tasks":
            if scope is not None and requirements is not None and constraints is not None:
                logger.info("Using scope, requirements, constraints for tasks generation")
                result = generate_tasks(f"Scope: {scope}\nRequirements: {requirements}\nConstraints: {constraints}")
            elif prompt is not None:
                logger.info("Using prompt for tasks generation")
                result = generate_tasks(prompt)
            else:
                logger.error("Missing required fields for tasks generation")
                raise HTTPException(400, "Missing required fields for tasks generation.")

        elif artifact_type == "risks":
            if scope is not None and requirements is not None and constraints is not None:
                logger.info("Using scope, requirements, constraints for risks generation")
                result = generate_risks(f"Scope: {scope}\nRequirements: {requirements}\nConstraints: {constraints}")
            elif prompt is not None:
                logger.info("Using prompt for risks generation")
                result = generate_risks(prompt)
            else:
                logger.error("Missing required fields for risks generation")
                raise HTTPException(400, "Missing required fields for risks generation.")

        else:
            logger.error(f"Invalid artifact type: {artifact_type}")
            raise HTTPException(400, "Invalid type")

        logger.info(f"Successfully generated {artifact_type}, result keys: {list(result.keys()) if isinstance(result, dict) else 'not a dict'}")
        
        response = {
            "status": "success",
            "result": json.dumps(result),  # 🔥 REQUIRED
            "metadata": {
                "model_version": "v1.0"
            }
        }
        logger.info(f"Returning response with status: {response['status']}")
        return response
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"AI Module Exception: {traceback.format_exc()}")
        raise HTTPException(500, f"AI Module error: {e}")
