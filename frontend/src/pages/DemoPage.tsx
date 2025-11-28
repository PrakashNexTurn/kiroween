/**
 * Demo Page
 * Temporary page to demonstrate the layout and theme system
 */

import { useTheme } from '../hooks/useTheme';

export function DemoPage() {
  const { currentTheme, setTheme, availableThemes, theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          Welcome to Kiro Project Orchestrator
        </h1>
        <p
          className="text-lg"
          style={{ color: theme.colors.text.secondary }}
        >
          A professional frontend for managing software project lifecycles
        </p>
      </div>

      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.colors.text.primary }}
        >
          Theme System Demo
        </h2>
        <p
          className="mb-4"
          style={{ color: theme.colors.text.secondary }}
        >
          Current theme: <strong>{currentTheme}</strong>
        </p>

        <div className="flex gap-4 mb-6">
          {availableThemes.map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className="px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor:
                  currentTheme === themeName
                    ? theme.colors.brand.primary
                    : theme.colors.background.tertiary,
                color:
                  currentTheme === themeName
                    ? theme.colors.text.inverse
                    : theme.colors.text.primary,
                border: `2px solid ${
                  currentTheme === themeName
                    ? theme.colors.brand.primary
                    : theme.colors.border
                }`,
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Status Colors
            </h3>
            <div className="space-y-2">
              {Object.entries(theme.colors.status).map(([key, color]) => (
                <div
                  key={`${currentTheme}-status-${key}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded border border-gray-400"
                    style={{
                      backgroundColor: color,
                      width: '32px',
                      height: '32px',
                    }}
                    title={color}
                  />
                  <span style={{ color: theme.colors.text.secondary }}>
                    {key}: {color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Phase Colors
            </h3>
            <div className="space-y-2">
              {Object.entries(theme.colors.phase).map(([key, color]) => (
                <div
                  key={`${currentTheme}-phase-${key}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded border border-gray-400"
                    style={{
                      backgroundColor: color,
                      width: '32px',
                      height: '32px',
                    }}
                    title={color}
                  />
                  <span style={{ color: theme.colors.text.secondary }}>
                    {key}: {color}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.colors.text.primary }}
        >
          Typography & Spacing
        </h2>
        <p
          className="mb-2"
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.base,
          }}
        >
          Base text - {theme.typography.fontSize.base}
        </p>
        <p
          className="mb-2"
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          Small text - {theme.typography.fontSize.sm}
        </p>
        <p
          style={{
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.fontSize.xs,
          }}
        >
          Extra small text - {theme.typography.fontSize.xs}
        </p>
      </div>
    </div>
  );
}
