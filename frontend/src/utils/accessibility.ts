/**
 * Accessibility Utilities
 * 
 * Helper functions for improving accessibility across the application
 * Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
 */

/**
 * Announce a message to screen readers using an ARIA live region
 * 
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Create or get the live region
  let liveRegion = document.getElementById('a11y-announcer');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-announcer';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  // Update the priority if needed
  liveRegion.setAttribute('aria-live', priority);
  
  // Clear and set the message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Generate a unique ID for accessibility attributes
 * 
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Check if the user prefers reduced motion
 * 
 * @returns True if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the user is using a keyboard for navigation
 * 
 * @returns True if keyboard navigation is detected
 */
export function isKeyboardUser(): boolean {
  // Check if the last interaction was a keyboard event
  return document.body.classList.contains('keyboard-user');
}

/**
 * Set up keyboard user detection
 * Adds a class to the body when keyboard navigation is detected
 */
export function setupKeyboardUserDetection(): void {
  let isUsingKeyboard = false;

  // Detect keyboard usage
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-user');
    }
  });

  // Detect mouse usage
  document.addEventListener('mousedown', () => {
    if (isUsingKeyboard) {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-user');
    }
  });
}

/**
 * Get a descriptive label for a file type
 * 
 * @param fileName - The name of the file
 * @param isFolder - Whether the item is a folder
 * @returns A descriptive label for screen readers
 */
export function getFileTypeLabel(fileName: string, isFolder: boolean): string {
  if (isFolder) {
    return `Folder: ${fileName}`;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const typeLabels: Record<string, string> = {
    // Code files
    ts: 'TypeScript file',
    tsx: 'TypeScript React file',
    js: 'JavaScript file',
    jsx: 'JavaScript React file',
    py: 'Python file',
    java: 'Java file',
    cpp: 'C++ file',
    c: 'C file',
    cs: 'C# file',
    go: 'Go file',
    rs: 'Rust file',
    rb: 'Ruby file',
    php: 'PHP file',
    
    // Config files
    json: 'JSON file',
    yaml: 'YAML file',
    yml: 'YAML file',
    toml: 'TOML file',
    xml: 'XML file',
    
    // Text files
    md: 'Markdown file',
    txt: 'Text file',
    log: 'Log file',
    csv: 'CSV file',
    
    // Image files
    png: 'PNG image',
    jpg: 'JPEG image',
    jpeg: 'JPEG image',
    gif: 'GIF image',
    svg: 'SVG image',
    ico: 'Icon file',
    webp: 'WebP image',
    
    // Archive files
    zip: 'ZIP archive',
    tar: 'TAR archive',
    gz: 'GZIP archive',
    rar: 'RAR archive',
    '7z': '7-Zip archive',
  };

  const typeLabel = extension ? typeLabels[extension] || 'File' : 'File';
  return `${typeLabel}: ${fileName}`;
}

/**
 * Format a status for screen reader announcement
 * 
 * @param status - The status to format
 * @returns A formatted status message
 */
export function formatStatusForScreenReader(
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In progress',
    completed: 'Completed',
    failed: 'Failed',
  };

  return statusLabels[status] || status;
}

/**
 * Create a skip link for keyboard navigation
 * 
 * @param targetId - The ID of the element to skip to
 * @param label - The label for the skip link
 * @returns The skip link element
 */
export function createSkipLink(targetId: string, label: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded';
  skipLink.textContent = label;
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  
  return skipLink;
}

/**
 * Check if high contrast mode is enabled
 * 
 * @returns True if high contrast mode is enabled
 */
export function isHighContrastMode(): boolean {
  // Check for Windows High Contrast Mode
  return window.matchMedia('(prefers-contrast: high)').matches ||
         window.matchMedia('(-ms-high-contrast: active)').matches;
}

/**
 * Get the appropriate animation duration based on user preferences
 * 
 * @param defaultDuration - The default animation duration in milliseconds
 * @returns The adjusted duration (0 if reduced motion is preferred)
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Trap focus within a container element
 * 
 * @param container - The container element
 * @param event - The keyboard event
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
