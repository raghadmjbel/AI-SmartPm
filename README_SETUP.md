# AI-SmartPm Project Setup Guide

This document provides step-by-step instructions on how to set up and run the AI-SmartPm project, which consists of three main components: an AI Module (Python), a Backend API (.NET), and a Frontend (React/Vite).

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** - For the AI Module
- **.NET SDK 10.0** - For the Backend API
- **Node.js & npm** - For the Frontend
- **Git** - For version control

## Project Structure

```
AI-SmartPm/
├── AI_Module/          # Python-based AI engine
├── Backend/            # .NET Core API
│   └── SmartPm.Api/
├── smartpm-frontend/   # React/Vite frontend
├── docs/               # Documentation
└── docker-compose.yml  # Docker configuration
```

## Installation & Running Instructions

### Step 1: Set Up Environment Variables

Create a `.env` file in the `AI_Module` folder and add your API key:

```bash
cd AI_Module
echo OPENAI_API_KEY=your_api_key_here > .env
```

Replace `your_api_key_here` with your actual OpenAI API key.

### Step 2: Set Up Python Virtual Environment (Optional but Recommended)

Navigate to the AI Module and create a virtual environment:

```bash
cd AI_Module

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Run the AI Module

In the `AI_Module` folder (with virtual environment activated), run:

```bash
uvicorn app.main:app --reload
```

The AI service will be available at `http://localhost:8000`

### Step 4: Set Up & Run the Backend API

Open a new terminal and navigate to the backend folder:

```bash
cd Backend/SmartPm.Api

# Build the project
dotnet build

# Run migrations (if this is your first time setting up)
dotnet ef database update

# Run the application
dotnet run
```

The API will be available at `http://localhost:5000` (or check the output for the actual port)

### Step 5: Set Up & Run the Frontend

Open a new terminal and navigate to the frontend folder:

```bash
cd smartpm-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or check the output for the actual port)

## Running All Services

For the best experience, run all three services simultaneously in separate terminals:

1. **Terminal 1 - AI Module:**
   ```bash
   cd AI_Module
   .\venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
   uvicorn app.main:app --reload
   ```

2. **Terminal 2 - Backend API:**
   ```bash
   cd Backend/SmartPm.Api
   dotnet run
   ```

3. **Terminal 3 - Frontend:**
   ```bash
   cd smartpm-frontend
   npm run dev
   ```

## Database Setup

If you're running the backend API for the first time, you'll need to apply migrations to create the database:

```bash
cd Backend/SmartPm.Api
dotnet ef database update
```

This will create the database with all necessary tables and schemas.

## Troubleshooting

### AI Module Issues
- Ensure your `.env` file is in the `AI_Module` folder with the correct API key
- Make sure Python 3.8+ is installed
- Activate the virtual environment before running uvicorn

### Backend API Issues
- Ensure .NET SDK 10.0 is installed (`dotnet --version`)
- Check that the database is created after migrations
- Verify all NuGet packages are restored (`dotnet restore`)

### Frontend Issues
- Ensure Node.js 14+ and npm are installed
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
- Check that the backend and AI services are running before testing API calls

## Additional Commands

### AI Module
- Run tests: `pytest tests/`
- Format code: `black app/`
- Lint code: `pylint app/`

### Backend API
- Clean build: `dotnet clean && dotnet build`
- Run tests: `dotnet test`
- Generate migrations: `dotnet ef migrations add <MigrationName>`

### Frontend
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Lint code: `npm run lint`

## Environment Variables

### AI Module (.env)
```
OPENAI_API_KEY=your_openai_api_key
```

### Backend (appsettings.json)
Configure database connection and other services as needed in `Backend/SmartPm.Api/appsettings.json`

## API Documentation

- **Backend API**: Available at `http://localhost:5000/swagger` after running the backend
- **AI Module**: Available at `http://localhost:8000/docs` after running the AI service

## Support

For issues or questions, please refer to the documentation in the `docs/` folder or check the README files in individual module folders.

---

**Last Updated:** April 2026
