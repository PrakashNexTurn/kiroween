/**
 * Header Component
 * Main application header with logo, breadcrumbs, and theme toggle
 */

import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

/**
 * Breadcrumb item type
 */
type BreadcrumbItem = {
  label: string;
  path: string;
  icon?: React.ComponentType<{ size?: number }>;
};

/**
 * Generate breadcrumb items from current path
 */
function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/', icon: Home },
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // Format segment for display (capitalize, replace hyphens with spaces)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Header component
 * Displays app logo/title, navigation breadcrumbs, and theme toggle
 * Responsive design with mobile-friendly layout
 */
export function Header() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/kiro.svg"
                alt="Kiro Logo"
                className="dark:invert"
                style={{ height: '50px', width: 'auto' }}
              />
              <h1
                className="text-xl font-bold hidden sm:block"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Project Orchestrator
              </h1>
            </Link>
          </div>

          {/* Breadcrumbs - Hidden on mobile */}
          <nav
            className="hidden md:flex items-center gap-2"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const Icon = crumb.icon;

                return (
                  <li key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && (
                      <ChevronRight
                        size={16}
                        style={{ color: 'var(--color-text-tertiary)' }}
                        aria-hidden="true"
                      />
                    )}
                    {isLast ? (
                      <span
                        className="text-sm font-medium flex items-center gap-1"
                        style={{ color: 'var(--color-text-primary)' }}
                        aria-current="page"
                      >
                        {Icon && <Icon size={16} />}
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {Icon && <Icon size={16} />}
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
