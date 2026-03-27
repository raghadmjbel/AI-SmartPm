# SmartPm Frontend

This is the React frontend for the SmartPm project management application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root of the frontend directory with:

```
VITE_API_BASE_URL=http://localhost:5000
```

Adjust the URL to match your backend API endpoint.

## Features

- Projects List: View all projects, create new projects, delete projects
- Project Details: View project info, specifications, and artifacts
- Artifact Generation: Generate AI-powered artifacts like WBS, Gantt charts, etc.
- Specifications Management: Add and remove project specifications

## API Integration

The frontend integrates with the ASP.NET Core backend API. Make sure the backend is running before starting the frontend.