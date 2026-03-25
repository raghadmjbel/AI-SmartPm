from fastapi import FastAPI, HTTPException
from datetime import datetime
import json
from app.schemas import PredictRequest, GenerateRequest, PredictResponse, GenerateResponse
from app.ai_engine import call_llm_analysis, generate_wbs, generate_tasks, generate_risks, generate_user_stories, generate_gantt
from app.generators import generate_wbs, generate_tasks, generate_risks
import json

app = FastAPI()

@app.post("/generate/{artifact_type}")
def generate(artifact_type: str, request: dict):
    prompt = request.get("prompt", "")
    print(f"Received prompt: {prompt}")

    if artifact_type == "wbs":
        result = generate_wbs(prompt)

    elif artifact_type == "tasks":
        result = generate_tasks(prompt)

    elif artifact_type == "risks":
        result = generate_risks(prompt)

    else:
        raise HTTPException(400, "Invalid type")
    print(result)
    return {
        "status": "success",
        "result": json.dumps(result),  # 🔥 REQUIRED
        "metadata": {
            "model_version": "v1.0"
        }
    }
