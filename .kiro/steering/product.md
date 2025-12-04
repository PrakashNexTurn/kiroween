# Product Overview

**Kiro's Ghost** (aka The Phantom IDE) is a complete Halloween-themed development ecosystem built for the Kiroween Hackathon. It consists of three supernatural components:

1. **Web Orchestrator**: Full-stack app for AI-powered project management (works on mobile!)
2. **VS Code Extension**: Halloween themes, icons, and interactive effects for desktop users
3. **kiro-cli Integration**: Direct AI access without requiring official API

## Core Functionality

### Web Orchestrator
Manages projects through a structured lifecycle:
1. **Requirements** - Define what needs to be built
2. **Design** - Plan the technical approach
3. **Tasks** - Break down implementation steps
4. **Execution** - Automated code generation via kiro-cli

### VS Code Extension
Provides a spooky coding experience:
1. **Themes** - Halloween dark & light themes
2. **Icons** - Spooky file icons (coffins, pumpkins, ghosts)
3. **Effects** - Interactive animations and mouse effects
4. **Customization** - Configurable settings for all features

## Key Features

### Web Orchestrator Features
- **No Installation Required**: Access from any browser - no desktop IDE needed
- **Universal Device Support**: Works on desktop, tablet, and mobile phones
- **No Official API Needed**: Channels Kiro's AI through kiro-cli
- **Multi-Project Management**: Organize multiple projects with separate base paths
- **Spec-Driven Development**: AI-generated requirements, design, and tasks
- **Real-time Progress Tracking**: Live task execution monitoring with log streaming
- **Monaco Editor Integration**: In-browser code editing
- **File Explorer**: Browse files with syntax highlighting
- **Adhoc Tasks**: Execute custom instructions (Ctrl+K)
- **Mobile-First Design**: Fully responsive interface
- **Accessible to All**: For developers and non-developers

### VS Code Extension Features
- **Halloween Themes**: Dark & light themes with WCAG AA compliance
- **Spooky Icons**: Custom file icons (coffins, pumpkins, ghosts, bats, spiders)
- **Interactive Effects**: Floating ghosts, mouse trails, click explosions, fog
- **Customizable**: Toggle effects, adjust intensity, enable/disable features
- **Performance Optimized**: Smooth animations without impacting IDE performance

## Project Phases

Projects progress through defined phases:
- `INIT` - Initial project creation
- `SPEC` - Specification generation (requirements, design, tasks)
- `BUILD` - Task execution and implementation
- `TEST` - Testing and verification
- `FIX` - Bug fixes and corrections
- `COMPLETE` - Project completion

## Architecture

### Web Orchestrator
- **Backend**: RESTful API (FastAPI) managing project lifecycle and kiro-cli integration
- **Frontend**: React-based UI for project visualization and management
- **Storage**: File-based project storage with JSON metadata

### VS Code Extension
- **Themes**: JSON-based color themes for syntax highlighting
- **Icons**: SVG-based icon theme with file type associations
- **Effects**: HTML/CSS/JS animations injected into VS Code webviews
- **Settings**: Configurable through VS Code settings

## Kiroween Hackathon Highlights

**The Supernatural Advantage:**
1. **No Kiro IDE Installation** - Web orchestrator works in any browser
2. **Optional Desktop Extension** - Haunted VS Code experience for power users
3. **No Official API** - Channels Kiro's AI through kiro-cli integration
4. **True Mobile Development** - Work from phones, tablets, anywhere
5. **Universal Accessibility** - For developers and non-developers
6. **Full Project Lifecycle** - From idea to production, all in browser
7. **Maximum Spookiness** - Halloween themes, icons, and effects throughout
8. **Zero Setup** - Just open a browser (or install extension) and start building
