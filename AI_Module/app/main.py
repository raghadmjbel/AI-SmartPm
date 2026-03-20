from fastapi import FastAPI
from datetime import datetime
from app.schemas import PredictRequest
from app.ai_engine import call_llm

app = FastAPI()


@app.post("/predict")
def predict(request: PredictRequest):
    analysis = call_llm(
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