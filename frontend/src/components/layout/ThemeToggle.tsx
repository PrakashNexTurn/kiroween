/**
 * ThemeToggle Component
 * Toggle button for switching between light, dark, and Halloween themes
 */

import { Sun, Moon, Ghost } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle component
 * Displays a button with theme icon that cycles through available themes
 * Includes smooth icon transition animation and proper ARIA labels
 */
export function ThemeToggle() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleToggle = () => {
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun size={20} aria-hidden="true" />;
      case 'dark':
        return <Moon size={20} aria-hidden="true" />;
      case 'halloween':
        return <Ghost size={20} aria-hidden="true" />;
      default:
        return <Sun size={20} aria-hidden="true" />;
    }
  };

  const getNextThemeName = () => {
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    return availableThemes[nextIndex];
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-border)',
        border: '1px solid',
      }}
      aria-label={`Switch to ${getNextThemeName()} theme`}
      title={`Switch to ${getNextThemeName()} theme`}
      type="button"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {getThemeIcon()}
      </div>
    </button>
  );
}
