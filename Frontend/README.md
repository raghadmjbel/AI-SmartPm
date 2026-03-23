# AI SmartPM Frontend - React Version

This is a React-based frontend for the AI SmartPM project management application.

## Project Structure

```
src/
├── components/      # Reusable components (Sidebar)
├── pages/          # Page components (Dashboard, Scope, etc.)
├── styles/         # CSS files
├── App.jsx         # Main app component with routing
└── main.jsx        # Entry point
```

## Installation

1. Navigate to the project directory:
```bash
cd react-app
```

2. Install dependencies:
```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Features

- **Dashboard**: Overview of projects, tasks, and risks
- **Scope**: Project scope definition
- **Requirements**: Requirement management
- **Tasks**: Task tracking and management
- **Gantt Chart**: Project timeline visualization
- **Risks**: Risk management and tracking

## Technologies Used

- React 18.2
- React Router DOM 6.20
- Vite 5.0
- CSS3 for styling

## API Integration

The app is configured to connect to the backend API at `http://localhost:5000` (can be modified in axios configuration).

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request
