/**
 * App Component
 * Root application component with routing and animations
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Layout } from './components/layout';
import { ToastContainer, ErrorBoundary } from './components/common';
import { ProjectBoardPage, ProjectDetailPage, NotFoundPage } from './pages';
import { FileTreeProvider } from './contexts/FileTreeContext';
import { useTheme } from './hooks/useTheme';
import { setupKeyboardUserDetection } from './utils/accessibility';
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
  // Get Ant Design theme configuration from theme context
  const { antdTheme } = useTheme();

  // Initialize accessibility features
  useEffect(() => {
    // Set up keyboard user detection for improved focus indicators
    setupKeyboardUserDetection();
    
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return (
    <ConfigProvider theme={antdTheme}>
      <ErrorBoundary>
        <FileTreeProvider>
          <BrowserRouter>
            <ToastContainer />
            <AnimatedRoutes />
          </BrowserRouter>
        </FileTreeProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
