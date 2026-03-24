from pydantic import BaseModel
from typing import Dict, Any, List


class PredictRequest(BaseModel):
    projectId: int
    task_description: str
    priority_level: str


class GenerateRequest(BaseModel):
    projectId: int
    scope: str
    requirements: str
    constraints: str


class Analysis(BaseModel):
    priority: str
    score: float
    recommendation: str


class PredictResponse(BaseModel):
    status: str
    result: Dict[str, Any]
    metadata: Dict[str, Any]


class GenerateResponse(BaseModel):
    status: str
    result: str  # JSON string
    metadata: Dict[str, Any]


class WbsItem(BaseModel):
    id: str
    name: str
    description: str
    children: List['WbsItem'] = []


class TaskItem(BaseModel):
    id: str
    name: str
    description: str
    duration_days: int
    priority: str
    dependencies: List[str] = []


class RiskItem(BaseModel):
    id: str
    name: str
    description: str
    probability: float
    impact: str
    mitigation: str


class UserStory(BaseModel):
    id: str
    role: str
    goal: str
    benefit: str
    acceptance_criteria: List[str]


class GanttTask(BaseModel):
    id: str
    name: str
    start_date: str
    end_date: str
    dependencies: List[str] = []