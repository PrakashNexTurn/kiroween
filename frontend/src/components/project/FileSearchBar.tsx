/**
 * FileSearchBar Component
 * Provides search functionality for the file tree with debouncing
 * 
 * Requirements: 3.6.1, 3.6.2, 3.6.3, 3.6.4, 3.6.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Props for FileSearchBar component
 */
export interface FileSearchBarProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * FileSearchBar Component
 * 
 * Features:
 * - Search input with icon (Requirement 3.6.1)
 * - Debounced search to avoid excessive filtering (Requirement 3.6.2)
 * - Clear button when search is active
 * - Keyboard shortcuts (Ctrl+F to focus)
 * - Accessibility features
 */
export const FileSearchBar = React.forwardRef<HTMLInputElement, FileSearchBarProps>(
  ({ onSearchChange, placeholder = 'Search files...', debounceMs = 300 }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');

  /**
   * Debounce the search query
   * Requirement 3.6.2: Implement debounced search
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, debounceMs]);

  /**
   * Notify parent when debounced value changes
   * Requirement 3.6.2: Filter tree based on search query
   */
  useEffect(() => {
    onSearchChange(debouncedValue);
  }, [debouncedValue, onSearchChange]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  /**
   * Clear search
   * Requirement 3.6.4: When the search input is cleared THEN restore the full tree
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    setDebouncedValue('');
  }, []);

  return (
    <div
      className="relative mb-3"
      role="search"
      aria-label="File search"
    >
      {/* Search Icon */}
      <div
        className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        <Search
          className="w-4 h-4"
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </div>

      {/* Search Input */}
      <input
        ref={ref}
        id="file-search-input"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
        aria-label="Search files"
        aria-describedby="search-hint"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-opacity-10 transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
            e.currentTarget.style.opacity = '0.1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.opacity = '1';
          }}
          aria-label="Clear search"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Screen reader hint */}
      <span id="search-hint" className="sr-only">
        Press Ctrl+F to focus search. Type to filter files and folders.
      </span>
    </div>
  );
});

FileSearchBar.displayName = 'FileSearchBar';
