# SmartPm Backend

This directory contains the SmartPm API backend built with .NET 10 (ASP.NET Core). It includes data models, Entity Framework Core DbContext, migrations, and a project controller for project management interfaces.

## 📁 Folder structure

- `SmartPm.Api/` - main API project
  - `Controllers/` - HTTP controllers (e.g., `projectsController.cs`)
  - `Data/` - `AppDbContext.cs` (EF Core context)
  - `Models/` - entity models
  - `DTOs/` - request/response DTOs
  - `Migrations/` - EF Core migrations
  - `Properties/` - launch settings
  - `appsettings.json` / `appsettings.Development.json` - configuration

## 🚀 Requirements

- .NET SDK 8.0
- `dotnet` CLI
- SQL Server or SQLite provider (configurable in `appsettings.json`)

## 🛠 Setup

From `Backend/SmartPm.Api`:

```powershell
cd Backend\SmartPm.Api
dotnet restore
dotnet build
```

## 🗄 Database migration

Ensure the connection string in `appsettings.json` is set.

```powershell
dotnet ef database update
```

## ▶️ Run API

```powershell
dotnet run
```

By default, API endpoints are available at `https://localhost:5001` and `http://localhost:5000` (per `Properties/launchSettings.json`).

## 🧪 Tests

No tests are currently provided in this backend folder. Add an xUnit/NUnit test project as needed.

## 🔌 Endpoints

### Projects

- GET /api/projects
  - returns list of projects with embedded specifications and artifacts.
- POST /api/projects
  - request JSON: `{ "name": "string", "description": "string" }`
  - response: created `Project` object.
- GET /api/projects/{id}
  - returns project, specs, artifacts as `ProjectDto`.
- PUT /api/projects/{id}
  - request JSON: `{ "name": "string", "description": "string" }`
  - updates fields and returns updated `Project`.
- DELETE /api/projects/{id}
  - deletes project + related specs + artifacts, returns 204.

### AI Artifact Generation

- POST /api/projects/{id}/generate/{type}?force={false}
  - `type` (case-insensitive): `WBS`, `TaskList`, `Gantt`, `RiskRegister`, `UserStories`
  - query: `force=true` bypasses cached artifact and regenerates.
  - response: `ProjectArtifactDto` with `id`, `type`, `contentJson`, `createdAt`, `version`.

### Project artifacts

- GET /api/projects/{id}/artifacts
  - list artifacts for project.
- GET /api/projects/{id}/artifacts/{type}
  - returns latest artifact of matching type.
- DELETE /api/projects/{projectId}/projectartifacts/{artifactId}
  - delete artifact by id.

### Project specifications

- POST /api/projects/{id}/projectspecifications
  - request JSON: `{ "requirements": "string", "constraints": "string" }`
  - returns created specification location (via `GetProject`).
- DELETE /api/projects/{projectId}/projectspecifications/{specId}
  - delete specification by id.

---

## 📘 DTOs and Models

- `CreateProjectDto`: `Name`, `Description`
- `ProjectDto`: includes `Id`, `Name`, `Description`, list of `CreateProjectSpecificationDto`, list of `ProjectArtifactDto`
- `CreateProjectSpecificationDto`: `Id`, `Requirements`, `Constraints`
- `ProjectArtifactDto`: `Id`, `Type`, `ContentJson`, `CreatedAt`, `Version`

### AI DTOs

- `AiFullContextDto`:
  - `projectId`, `scope`, `requirements`, `constraints`
- `AiRequestDto`:
  - `projectId`, `task_description`, `priority_level`
- `AiResponseDto`:
  - `status`, `result` (with `projectId`, `analysis`), `metadata` (with `model_version`, `timestamp`)

## ⚙️ AI Service Behavior

- AIPromptBuilder builds prompts.
- `ArtifactGenerationService` calls configured AI base URL (`AIServiceOptions.BaseUrl` + `/generate/{artifactType}`) and uses retry/circuit-breaker.
- Response validation via `AIResponseValidator` ensures correct artifact schema.

## 🔧 Configuration

### `appsettings.json` `AIServiceOptions`
- `BaseUrl` (AI service URL)
- `TimeoutSeconds`
- `MaxRetries`

### `launchSettings.json`
- HTTPS and HTTP local URLs: `https://localhost:5001`, `http://localhost:5000`

## 🤖 AI Integration

### New DTOs
- `AiRequestDto` { projectId, task_description, priority_level }
- `AiResponseDto` { status, result { projectId, analysis { priority, score, recommendation } }, metadata { model_version, timestamp } }

### Service
- `AiService` using `HttpClient` to POST `http://ai-service:8000/predict`
- Deserializes to `AiResponseDto`
- Throws `HttpRequestException` on non-success response

### Controller
- `POST /api/projects/{id}/analyze` loads project + specs
- Combines requirements and constraints into one string
- Calls `AiService.AnalyzeAsync`
- Saves `ProjectArtifact { Type = "AI_Analysis", Content = analysisJson }`
- Returns full AI response

## 💡 Notes

- Review `AppDbContext` and model mapping for relationships (artifacts/specifications).
- Update DTOs when adding new domain fields.
