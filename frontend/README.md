# 👻 Kiro's Ghost - Frontend (The Haunted Interface)

A possessed React-based frontend that channels Kiro's AI powers, providing an intuitive interface for managing software projects through spec-driven development - from any device, anywhere.

## 🎃 Supernatural Features

- **📱 Mobile Haunting**: Fully responsive - works on phones, tablets, and desktops
- **🚫 No Installation**: Access Kiro's AI from any browser, no IDE required
- **👻 Project Possession**: Create, view, and manage multiple projects from anywhere
- **🔮 Spec Conjuring**: Generate requirements, design, and tasks through AI-powered workflows
- **⚡ Task Execution**: Execute and track implementation tasks with spectral progress
- **🌙 Real-time Updates**: Live progress tracking and log streaming
- **📝 Monaco Spirit Editor**: Integrated code editor for viewing and editing spec files
- **✨ Markdown Sorcery**: Rich markdown rendering with syntax highlighting
- **🎭 Theme Transformation**: Light, dark, and Halloween themes with smooth transitions
- **🌍 Universal Access**: The only "IDE" that truly works on mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **Monaco Editor** - Code editor
- **Framer Motion** - Animations
- **React Markdown** - Markdown rendering
- **Lucide React** - Icon library

## 🕯️ Summoning the Ghost

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend spirit running (see [../backend/README.md](../backend/README.md))

### Installation

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

4. Start development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # React components
│   │   ├── common/     # Reusable components
│   │   ├── layout/     # Layout components
│   │   ├── project/    # Project-related components
│   │   └── task/       # Task-related components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── styles/          # Global styles and themes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Public assets
├── .env.example         # Environment variables template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000
```

### Path Aliases

TypeScript path aliases are configured for cleaner imports:

```typescript
import { Button } from '@/components/common/Button'
import { useProjects } from '@/hooks/useProjects'
import { api } from '@/services/api'
```

## Theme System

The app includes three built-in themes:

- **Light Theme**: Clean, professional light mode
- **Dark Theme**: Easy on the eyes dark mode
- **Halloween Theme**: Festive purple and orange theme

Users can switch themes using the theme toggle button in the header. Theme preference is automatically saved to localStorage.

## Accessibility

The frontend is built with accessibility in mind:

- WCAG 2.1 AA compliant color contrast ratios
- Full keyboard navigation support
- ARIA labels and roles for screen readers
- Focus indicators for all interactive elements
- Semantic HTML structure

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for detailed accessibility information.

## Development

### Code Style

- **ESLint**: Configured with TypeScript and React rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled for type safety

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript types
- Follow React best practices
- Use Tailwind CSS for styling
- Ensure accessibility compliance

### Adding New Features

1. Create components in appropriate directories
2. Define TypeScript types in `src/types/`
3. Add API calls in `src/services/`
4. Create custom hooks in `src/hooks/` if needed
5. Update routing in `src/App.tsx`

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory. You can preview it with:

```bash
npm run preview
```

## API Integration

The frontend communicates with the backend API through the `src/services/api.ts` service layer. All API endpoints are typed and include error handling.

Example API usage:

```typescript
import { projectService } from '@/services/api'

// Create a project
const project = await projectService.createProject({
  name: 'My Project',
  description: 'Project description'
})

// Generate requirements
await projectService.generateSpec(projectId, {
  specType: 'requirements',
  description: 'Feature description'
})
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a custom port:

```bash
npm run dev -- --port 3000
```

### API Connection Issues

1. Verify the backend server is running
2. Check `VITE_API_BASE_URL` in `.env`
3. Ensure CORS is properly configured on the backend
4. Check browser console for error messages

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

## Contributing

When contributing to the frontend:

1. Follow the existing code style
2. Write TypeScript types for all new code
3. Ensure accessibility compliance
4. Test in both light and dark themes
5. Run linting and formatting before committing

## License

[Add your license here]
