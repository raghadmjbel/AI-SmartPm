from pydantic import BaseModel
from typing import Dict, Any


class PredictRequest(BaseModel):
    projectId: int
    task_description: str
    priority_level: str


class Analysis(BaseModel):
    priority: str
    score: float
    recommendation: str


class PredictResponse(BaseModel):
    status: str
    result: Dict[str, Any]
    metadata: Dict[str, Any]