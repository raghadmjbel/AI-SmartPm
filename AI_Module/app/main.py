from fastapi import FastAPI, HTTPException
from datetime import datetime
import json
from app.schemas import PredictRequest, GenerateRequest, PredictResponse, GenerateResponse
from app.ai_engine import call_llm_analysis, generate_wbs, generate_tasks, generate_risks, generate_user_stories, generate_gantt

app = FastAPI()


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        analysis = call_llm_analysis(
            request.task_description,
            request.priority_level
        )

        return {
            "status": "success",
            "result": {
                "projectId": request.projectId,
                "analysis": {
                    "priority": analysis.get("priority", "Medium"),
                    "score": analysis.get("score", 0.5),
                    "recommendation": analysis.get("recommendation", "")
                }
            },
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.post("/generate/wbs", response_model=GenerateResponse)
def generate_wbs_endpoint(request: GenerateRequest):
    try:
        result = generate_wbs(request.scope, request.requirements, request.constraints)
        return {
            "status": "success",
            "result": json.dumps(result),
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "artifact_type": "wbs"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WBS generation failed: {str(e)}")


@app.post("/generate/tasks", response_model=GenerateResponse)
def generate_tasks_endpoint(request: GenerateRequest):
    try:
        result = generate_tasks(request.scope, request.requirements, request.constraints)
        return {
            "status": "success",
            "result": json.dumps(result),
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "artifact_type": "tasks"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tasks generation failed: {str(e)}")


@app.post("/generate/risks", response_model=GenerateResponse)
def generate_risks_endpoint(request: GenerateRequest):
    try:
        result = generate_risks(request.scope, request.requirements, request.constraints)
        return {
            "status": "success",
            "result": json.dumps(result),
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "artifact_type": "risks"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risks generation failed: {str(e)}")


@app.post("/generate/user-stories", response_model=GenerateResponse)
def generate_user_stories_endpoint(request: GenerateRequest):
    try:
        result = generate_user_stories(request.scope, request.requirements, request.constraints)
        return {
            "status": "success",
            "result": json.dumps(result),
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "artifact_type": "user-stories"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User stories generation failed: {str(e)}")


@app.post("/generate/gantt", response_model=GenerateResponse)
def generate_gantt_endpoint(request: GenerateRequest):
    try:
        result = generate_gantt(request.scope, request.requirements, request.constraints)
        return {
            "status": "success",
            "result": json.dumps(result),
            "metadata": {
                "model_version": "v1.0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "artifact_type": "gantt"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gantt generation failed: {str(e)}")