/**
 * App Component
 * Root application component with routing and animations
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout';
import { ToastContainer, ErrorBoundary } from './components/common';
import { ProjectBoardPage, ProjectDetailPage, NotFoundPage } from './pages';
import { FileTreeProvider } from './contexts/FileTreeContext';
import './App.css';

/**
 * AnimatedRoutes component
 * Wraps routes with AnimatePresence for smooth page transitions
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProjectBoardPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <FileTreeProvider>
        <BrowserRouter>
          <ToastContainer />
          <AnimatedRoutes />
        </BrowserRouter>
      </FileTreeProvider>
    </ErrorBoundary>
  );
}

export default App;
