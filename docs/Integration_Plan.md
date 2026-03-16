# Integration & Communication Plan

## 1. System Architecture
The project follows a Microservices Architecture. Each component runs in an isolated container managed by Docker Compose.

## 2. API Communication (Backend <-> AI)
- Protocol: REST API using HTTP/1.1.
- Communication Flow: The Backend (ASP.NET Core) acts as a client that sends data to the AI Module (Python/FastAPI) for processing.
- Data Format: All requests and responses are exchanged in JSON format.

###  AI Endpoint:
- URL: http://ai-service:8000/predict
- Method: POST
- Body:
`json
{
  "task_description": "Project details here",
  "priority_level": "High"
}