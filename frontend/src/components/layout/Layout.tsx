/**
 * Layout Component
 * Main application layout structure with header and content area
 * Migrated to use Ant Design Layout components
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout as AntLayout } from 'antd';
import { Header } from './Header';

const { Content: AntContent, Footer: AntFooter } = AntLayout;

/**
 * Layout component
 * Provides the main application structure with Header and content area
 * Uses React Router's Outlet for rendering page content
 * Uses Ant Design Layout components for structure
 * Includes smooth page transition animations
 */
export function Layout() {
  return (
    <AntLayout
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s, color 0.3s',
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
      <AntContent
        id="main-content"
        tabIndex={-1}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </AntContent>

      {/* Footer */}
      <AntFooter
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-primary)',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
            className="sm:flex-row"
          >
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-tertiary)',
                textAlign: 'center',
                margin: 0,
              }}
              className="sm:text-left"
            >
              Built with 💀 for the Kiroween Hackathon
            </p>
            <p
              style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'var(--color-text-tertiary)',
                textAlign: 'center',
                margin: 0,
              }}
              className="sm:text-right"
            >
              "Why install an IDE when the IDE can haunt you instead?"
            </p>
          </div>
        </div>
      </AntFooter>
    </AntLayout>
  );
}
