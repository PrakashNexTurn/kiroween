# 👻 Kiro's Ghost - The Phantom IDE

> *"The spirit of Kiro IDE, unleashed from its desktop chains..."*

**Kiro's Ghost** is a possessed orchestrator that channels the power of Kiro AI without requiring the IDE installation. Built for the Kiroween Hackathon, this haunting application brings AI-powered development to any device, anywhere - even your mobile phone.

## 🎃 The Haunting Story

Legend has it that during a dark and stormy hackathon night, the spirit of Kiro IDE escaped its desktop confines and possessed a web application. Now, **Kiro's Ghost** roams the internet, bringing AI-powered development to developers (and non-developers!) wherever they may be.

### The Supernatural Powers

- **👻 No Installation Required** - The ghost needs no physical form. Access Kiro's AI from any browser
- **📱 Omnipresent** - Haunts all devices: desktop, tablet, even mobile phones
- **🔮 No API Needed** - Mysteriously channels Kiro's AI without official APIs
- **🌙 Works Anywhere** - From coffee shops to midnight coding sessions, the ghost follows you
- **✨ Possesses Your Projects** - Takes control of the entire lifecycle from idea to production
- **🧙 Accessible to All** - Even non-developers can summon its powers

## Overview

This repository contains the complete Kiro's Ghost system, including:
- **Backend**: RESTful API possessed by Kiro's spirit for spec-driven development
- **Frontend**: Haunted React-based UI that channels Kiro's intelligence

The phantom orchestrator integrates with kiro-cli to automate requirements gathering, design, task planning, and implementation - all without needing Kiro IDE installed.

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

## 🕯️ Summoning the Ghost

Ready to be possessed by Kiro's spirit? Follow these incantations...

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

## 🎭 Supernatural Features

### The Ghost's Powers (Backend)
- **👻 Phantom Project Management**: Organize multiple haunted projects with separate base paths
- **🔮 Spec-Driven Sorcery**: Automated requirements, design, and task generation through AI channeling
- **🧙 AI-Powered Manifestation**: Integration with kiro-cli for automated code generation - no Kiro IDE required!
- **📡 Spectral API**: Complete RESTful API for project lifecycle management
- **🧪 Property-Based Testing**: Built-in support for correctness properties and PBT
- **🌐 Universal Access**: Works from any device with a browser - desktop, tablet, or mobile

### The Haunted Interface (Frontend)
- **🎃 Project Séance Dashboard**: Summon and manage all your possessed projects in one place
- **✨ Spec Conjuring**: Generate requirements, design, and tasks through an intuitive, haunted UI
- **⚡ Task Possession**: Execute and track implementation tasks with real-time spectral progress
- **📝 Monaco Spirit Editor**: Integrated code editor for viewing and editing spec files
- **🌙 Theme Transformation**: Light, dark, and Halloween themes (naturally!)
- **📱 Mobile Haunting**: Fully responsive - the ghost follows you on any device, anywhere
- **🚫 No Installation Curse**: Break free from desktop-only development - work from coffee shops, trains, or your couch

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

## 🔮 The Kiroween Hackathon Magic

### Why Kiro's Ghost is Supernatural

1. **🚫 No Kiro IDE Installation** - The ghost breaks free from desktop constraints. No need to install the full IDE.

2. **📡 No Official API** - Mysteriously channels Kiro's AI powers without requiring official API access. The ghost has its ways...

3. **🌍 Universal Access** - Work from literally anywhere:
   - ☕ Coffee shop on your laptop
   - 🚂 Train on your tablet  
   - 🛋️ Couch on your phone
   - 🌙 Midnight coding from bed

4. **👥 For Everyone** - Not just for developers:
   - Product managers can spec out features
   - Designers can plan implementations
   - Non-technical founders can prototype ideas
   - Students can learn by doing

5. **🎯 Full Lifecycle** - From idea to production:
   - Generate requirements from descriptions
   - Auto-create technical designs
   - Break down into tasks
   - Execute with AI assistance
   - Track progress in real-time

6. **📱 Mobile-First Haunting** - The only "IDE" that truly works on mobile. Code reviews, spec updates, task tracking - all from your phone.

## 🧙 Development

This is a monorepo structure possessed by the ghost. Each component has its own:
- Dependencies and package management
- Development server
- Build process
- Testing suite
- Documentation

### Awakening Both Spirits

For full-stack development, summon both services in separate terminals:

**Terminal 1 - Backend Spirit:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend Phantom:**
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

## 🎃 Kiroween Hackathon Demo

**Kiro's Ghost** demonstrates that the power of AI-assisted development doesn't need to be locked in a desktop application. By possessing a web interface, we've created:

- A truly accessible development environment
- Mobile-friendly AI-powered coding
- Zero-installation project orchestration
- Universal access to Kiro's intelligence

Perfect for:
- Remote teams working across devices
- Quick prototyping on the go
- Teaching and learning environments
- Accessibility-first development
- The future of cloud-native IDEs

## 👻 Contributing

Want to help the ghost grow stronger? When contributing:
1. Follow the code style guidelines in each component
2. Write tests for new features (even ghosts need tests!)
3. Update documentation as needed
4. Ensure both backend and frontend tests pass
5. Test the full-stack integration
6. Keep the spooky theme alive! 🎃

## 📜 License

[Add your license here]

---

*Built with 💀 for the Kiroween Hackathon*

*"Why install an IDE when the IDE can haunt you instead?"*