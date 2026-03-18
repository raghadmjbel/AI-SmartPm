integration & Communication Plan (v1.1)
​1. System Architecture
​The project follows a Microservices Architecture. Each component runs in an isolated container managed by Docker Compose.
​2. API Communication (Backend <-> AI)
​Protocol: REST API using HTTP/1.1.
​Communication Flow: The Backend (ASP.NET Core) acts as a client that sends data to the AI Module (Python/FastAPI) for processing.
​Data Format: All requests and responses are exchanged in JSON format.
​3. Endpoint Specifications
​3.1 AI Prediction Endpoint
​URL: http://ai-service:8000/predict
​Method: POST
​Request Body (from Backend):
{
  "projectId": 1,
  "task_description": "Project requirements and constraints details",
  "priority_level": "Initial_Guess"
}
3.2 Expected AI Response (Output)
​The AI service must return this standard structure to ensure compatibility with Backend DTOs and Frontend state management:
{
  "status": "success",
  "result": {
    "projectId": 1,
    "analysis": {
      "priority": "High",
      "score": 0.95,
      "recommendation": "Start this task immediately"
    }
  },
  "metadata": {
    "model_version": "v1.0",
    "timestamp": "2026-03-18T12:00:00Z"
  }
}
4. Developer Guidelines (Mapping)
​For Backend (Ahmad):
​DTOs: Create an AiResponseDto that matches the hierarchy above.
​Database: The analysis object can be stored as a JSON string in ProjectArtifacts.Content or mapped to new fields in the Project table.
​For AI Module (Abdul-Qader):
​Output: Ensure the keys (status, result, analysis) are lowercase as per JSON standards.
​ID Sync: Always echo back the projectId received in the request.
For Frontend (Raghad & Yamama):
​Response Handling: Use result.analysis.priority to update the UI badges and score for progress bars or charts.