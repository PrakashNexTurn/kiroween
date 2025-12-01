/**
 * Header Component
 * Main application header with logo, breadcrumbs, and theme toggle
 * Migrated to use Ant Design Layout.Header and Breadcrumb
 */

import { useLocation, Link } from 'react-router-dom';
import { Layout, Breadcrumb } from 'antd';
import { Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const { Header: AntHeader } = Layout;

/**
 * Breadcrumb item type
 */
type BreadcrumbItem = {
  title: string | React.ReactNode;
  path?: string;
};

/**
 * Generate breadcrumb items from current path
 */
function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: (
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Home size={16} />
          <span>Home</span>
        </Link>
      ),
      path: '/',
    },
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format segment for display (capitalize, replace hyphens with spaces)
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const isLast = index === pathSegments.length - 1;

    breadcrumbs.push({
      title: isLast ? (
        <span style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      ) : (
        <Link to={currentPath} style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </Link>
      ),
      path: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Header component
 * Displays app logo/title, navigation breadcrumbs, and theme toggle
 * Responsive design with mobile-friendly layout
 * Uses Ant Design Layout.Header and Breadcrumb components
 */
export function Header() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border)',
        padding: 0,
        height: 'auto',
        lineHeight: 'normal',
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px', // Increased for better mobile touch targets
            gap: '8px',
          }}
        >
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <img
                src="/kiro.svg"
                alt="Kiro Logo"
                className="dark:invert"
                style={{ height: '28px', width: 'auto', flexShrink: 0 }}
              />
              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span className="header-title-full">👻 Kiro's Ghost</span>
                <span className="header-title-short">👻 Kiro</span>
              </h1>
              <span
                className="header-tagline"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                The Phantom IDE
              </span>
            </Link>
          </div>

          {/* Breadcrumbs - Hidden on mobile */}
          <nav className="header-breadcrumbs" style={{ flex: 1, justifyContent: 'center' }}>
            <Breadcrumb
              items={breadcrumbs}
              style={{
                fontSize: '14px',
              }}
            />
          </nav>

          {/* Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </AntHeader>
  );
}
