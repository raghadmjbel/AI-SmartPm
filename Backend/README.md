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

- .NET SDK 10.0
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

- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

Adjust routes based on controller implementation.

## 💡 Notes

- Review `AppDbContext` and model mapping for relationships (artifacts/specifications).
- Update DTOs when adding new domain fields.
