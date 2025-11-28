# Kiroween

Kiro Project Orchestrator - A system for automating software project lifecycles with AI-powered code generation.

## Overview

This repository contains the Kiro Project Orchestrator backend, which provides a RESTful API for managing software projects through spec-driven development. The orchestrator integrates with kiro-cli to automate requirements gathering, design, task planning, and implementation.

## Repository Structure

```
.
├── backend/              # Backend orchestrator service
│   ├── src/             # Source code
│   ├── tests/           # Test suite
│   ├── main.py          # Application entry point
│   └── README.md        # Backend documentation
├── .kiro/               # Kiro specs and project data
└── README.md            # This file
```

## Getting Started

### Backend Setup

Navigate to the backend directory and follow the setup instructions:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

See [backend/README.md](backend/README.md) for complete backend documentation.

## Features

- **Multi-Project Management**: Organize multiple projects with separate base paths
- **Spec-Driven Development**: Automated requirements, design, and task generation
- **AI-Powered Code Generation**: Integration with kiro-cli for automated implementation
- **RESTful API**: Complete API for project lifecycle management
- **Property-Based Testing**: Built-in support for correctness properties and PBT

## Documentation

- **[backend/README.md](backend/README.md)** - Backend setup and overview
- **[backend/USAGE.md](backend/USAGE.md)** - Detailed usage guide
- **[backend/API_REFERENCE.md](backend/API_REFERENCE.md)** - Complete API reference

## Quick Links

- API Documentation (when running): http://localhost:8000/docs
- Backend Service: http://localhost:8000

## Development

This is a monorepo structure. Each component has its own README with specific setup and development instructions.

## License

[Add your license here]