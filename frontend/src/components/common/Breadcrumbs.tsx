/**
 * Breadcrumbs Component
 * Navigation breadcrumb trail showing current location in the app
 */

import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../utils';

/**
 * Breadcrumbs component
 * Displays a breadcrumb navigation trail based on the current route
 * Automatically generates breadcrumbs from the URL path
 */
export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.path || crumb.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                size={16}
                className="mx-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            )}

            {isLast ? (
              <span
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
                aria-current="page"
              >
                {index === 0 && <Home size={16} className="inline mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path || '/'}
                className="hover:underline transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {index === 0 && <Home size={16} className="inline mr-1" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
