# Product Overview

**Kiro's Ghost** (aka The Phantom IDE) is a possessed orchestrator that channels Kiro AI's power without requiring IDE installation. Built for the Kiroween Hackathon, it's a full-stack system for automating software project lifecycles through spec-driven development with AI-powered code generation - accessible from any device, anywhere.

## Core Functionality

The orchestrator manages projects through a structured lifecycle:
1. **Requirements** - Define what needs to be built
2. **Design** - Plan the technical approach
3. **Tasks** - Break down implementation steps
4. **Execution** - Automated code generation via kiro-cli

## Key Features (The Ghost's Powers)

- **No Installation Required**: Access Kiro's AI from any browser - no desktop IDE needed
- **Universal Device Support**: Works on desktop, tablet, and mobile phones
- **No Official API Needed**: Mysteriously channels Kiro's AI without requiring API access
- **Multi-Project Management**: Organize multiple projects with separate base paths
- **Spec-Driven Development**: Automated requirements, design, and task generation
- **AI-Powered Code Generation**: Integration with kiro-cli for automated implementation
- **Property-Based Testing**: Built-in support for correctness properties and PBT
- **Real-time Progress Tracking**: Live task execution monitoring with log streaming
- **Monaco Editor Integration**: In-browser code editing for spec files
- **Mobile-First Design**: Fully responsive interface for on-the-go development
- **Accessible to All**: Designed for developers and non-developers alike

## Project Phases

Projects progress through defined phases:
- `INIT` - Initial project creation
- `SPEC` - Specification generation (requirements, design, tasks)
- `BUILD` - Task execution and implementation
- `TEST` - Testing and verification
- `FIX` - Bug fixes and corrections
- `COMPLETE` - Project completion

## Architecture

- **Backend**: RESTful API (FastAPI) managing project lifecycle and kiro-cli integration
- **Frontend**: React-based UI for project visualization and management
- **Storage**: File-based project storage with JSON metadata

## Kiroween Hackathon Highlights

**The Supernatural Advantage:**
1. **No Kiro IDE Installation** - Break free from desktop constraints
2. **No Official API** - Channels Kiro's AI through kiro-cli integration
3. **True Mobile Development** - Work from phones, tablets, anywhere
4. **Universal Accessibility** - For developers and non-developers
5. **Full Project Lifecycle** - From idea to production, all in browser
6. **Zero Setup** - Just open a browser and start building
