# Technology Stack

## Backend

### Core Technologies
- **Python 3.11+** - Primary language
- **FastAPI** - Web framework for RESTful API
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and settings management

### Testing
- **pytest** - Test framework
- **pytest-asyncio** - Async test support
- **hypothesis** - Property-based testing
- **httpx** - HTTP client for testing

### Code Quality
- **black** - Code formatting (line length: 100)
- **ruff** - Linting

### Common Commands

```bash
# Backend setup and development
cd backend
pip install -r requirements.txt
python main.py                    # Start server
python main.py --reload           # Development mode with auto-reload
python main.py --log-level DEBUG  # Debug logging

# Testing
pytest                            # Run all tests
pytest tests/unit/                # Unit tests only
pytest tests/property/            # Property-based tests
pytest tests/integration/         # Integration tests
pytest --cov=src                  # With coverage

# Code quality
black src/ tests/                 # Format code
ruff check src/ tests/            # Lint code
```

## Frontend

### Core Technologies
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Code Editor & Rendering
- **Monaco Editor** - In-browser code editor
- **React Markdown** - Markdown rendering with syntax highlighting
- **React Syntax Highlighter** - Code syntax highlighting

### HTTP & State
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications

### Code Quality
- **ESLint** - Linting with TypeScript and React rules
- **Prettier** - Code formatting

### Common Commands

```bash
# Frontend setup and development
cd frontend
npm install
npm run dev                       # Start dev server (http://localhost:5173)
npm run build                     # Production build
npm run preview                   # Preview production build

# Code quality
npm run lint                      # Run ESLint
npm run lint:fix                  # Fix ESLint issues
npm run format                    # Format with Prettier
npm run format:check              # Check formatting
```

## Development Workflow

### Full-Stack Development

Run both services in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### API Endpoints
- Backend API: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- API Docs (ReDoc): `http://localhost:8000/redoc`
- Frontend: `http://localhost:5173`

## Environment Configuration

### Backend (.env)
```bash
KIRO_BASE_PATH=/path/to/projects  # Base path for project storage
KIRO_HOST=0.0.0.0                 # Server host
KIRO_PORT=8000                    # Server port
KIRO_LOG_LEVEL=INFO               # Logging level
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
```
