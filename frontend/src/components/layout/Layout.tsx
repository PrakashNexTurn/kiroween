/**
 * Layout Component
 * Main application layout structure with header and content area
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';

/**
 * Layout component
 * Provides the main application structure with Header and content area
 * Uses React Router's Outlet for rendering page content
 * Applies theme background colors and ensures responsive design
 * Includes smooth page transition animations
 */
export function Layout() {
  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        style={{
          backgroundColor: 'var(--color-brand-primary)',
          color: 'var(--color-text-inverse)',
        }}
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header />

      {/* Main Content Area with Page Transitions */}
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Optional Footer - can be added later */}
      {/* <footer className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            © 2025 Kiro Project Orchestrator
          </p>
        </div>
      </footer> */}
    </div>
  );
}
