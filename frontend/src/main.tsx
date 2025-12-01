import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/halloween.css';
import './styles/halloween-animations.css';
import './styles/halloween-enhanced.css';
import './styles/halloween-screensaver.css';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
