# Kiroween

Kiro Project Orchestrator - A full-stack system for automating software project lifecycles with AI-powered code generation.

## Overview

This repository contains the complete Kiro Project Orchestrator system, including:
- **Backend**: RESTful API for managing projects through spec-driven development
- **Frontend**: Modern React-based UI for project management and visualization

The orchestrator integrates with kiro-cli to automate requirements gathering, design, task planning, and implementation.

## Repository Structure

```
.
├── backend/              # Backend orchestrator service
│   ├── src/             # Python source code
│   ├── tests/           # Test suite
│   ├── main.py          # Application entry point
│   └── README.md        # Backend documentation
├── frontend/            # Frontend React application
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   └── README.md        # Frontend documentation
├── .kiro/               # Kiro specs and project data
└── README.md            # This file
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   python main.py
   ```

The backend API will be available at `http://localhost:8000`

See [backend/README.md](backend/README.md) for complete backend documentation.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env to set VITE_API_BASE_URL (default: http://localhost:8000)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

See [frontend/README.md](frontend/README.md) for complete frontend documentation.

## Features

### Backend
- **Multi-Project Management**: Organize multiple projects with separate base paths
- **Spec-Driven Development**: Automated requirements, design, and task generation
- **AI-Powered Code Generation**: Integration with kiro-cli for automated implementation
- **RESTful API**: Complete API for project lifecycle management
- **Property-Based Testing**: Built-in support for correctness properties and PBT

### Frontend
- **Project Dashboard**: View and manage all projects in one place
- **Spec Generation**: Generate requirements, design, and tasks through intuitive UI
- **Task Execution**: Execute and track implementation tasks with real-time progress
- **Monaco Editor**: Integrated code editor for viewing and editing spec files
- **Theme System**: Light, dark, and Halloween themes
- **Responsive Design**: Mobile-friendly interface

## Documentation

### Backend
- **[backend/README.md](backend/README.md)** - Backend setup and overview
- **[backend/USAGE.md](backend/USAGE.md)** - Detailed usage guide
- **[backend/API_REFERENCE.md](backend/API_REFERENCE.md)** - Complete API reference

### Frontend
- **[frontend/README.md](frontend/README.md)** - Frontend setup and overview
- **[frontend/ACCESSIBILITY.md](frontend/ACCESSIBILITY.md)** - Accessibility compliance

## Quick Links

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## Development

This is a monorepo structure. Each component (backend and frontend) has its own:
- Dependencies and package management
- Development server
- Build process
- Testing suite
- Documentation

### Running Both Services

For full-stack development, run both services in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Technology Stack

### Backend
- Python 3.8+
- FastAPI
- Uvicorn
- Pydantic
- Pytest

### Frontend
- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- React Router 7
- Axios
- Monaco Editor

## Contributing

When contributing:
1. Follow the code style guidelines in each component
2. Write tests for new features
3. Update documentation as needed
4. Ensure both backend and frontend tests pass
5. Test the full-stack integration

## License

[Add your license here]