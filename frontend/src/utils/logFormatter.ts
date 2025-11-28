/**
 * Log Formatter Utility
 * 
 * Handles ANSI escape sequences and filters unwanted log lines
 */

/**
 * ANSI color codes mapping to CSS colors
 */
const ANSI_COLORS: Record<string, string> = {
  // Standard colors (30-37, 90-97)
  '30': '#000000', // Black
  '31': '#ff5757', // Red
  '32': '#3dd365', // Green
  '33': '#ffd93d', // Yellow
  '34': '#4a9eff', // Blue
  '35': '#ff8a5b', // Magenta
  '36': '#4ecdc4', // Cyan
  '37': '#e0e0e0', // White
  '90': '#6c757d', // Bright Black (Gray)
  '91': '#ff5757', // Bright Red
  '92': '#3dd365', // Bright Green
  '93': '#ffd93d', // Bright Yellow
  '94': '#4a9eff', // Bright Blue
  '95': '#ff8a5b', // Bright Magenta
  '96': '#4ecdc4', // Bright Cyan
  '97': '#ffffff', // Bright White
  
  // 256 color mode - common colors
  '141': '#af87ff', // Purple
  '10': '#3dd365',  // Green
  '244': '#808080', // Gray
};

/**
 * Parse a single ANSI escape sequence and return the color
 */
function parseAnsiColor(code: string): string | null {
  // Handle 256 color mode: \x1b[38;5;XXXm
  const match256 = code.match(/38;5;(\d+)/);
  if (match256) {
    const colorCode = match256[1];
    return ANSI_COLORS[colorCode] || null;
  }
  
  // Handle standard color codes
  const parts = code.split(';');
  for (const part of parts) {
    if (ANSI_COLORS[part]) {
      return ANSI_COLORS[part];
    }
  }
  
  return null;
}

/**
 * Format log line with ANSI escape sequences converted to HTML
 */
export interface FormattedLogLine {
  text: string;
  color?: string;
  bold?: boolean;
}

/**
 * Parse ANSI escape sequences in a log line
 */
export function parseAnsiLine(line: string): FormattedLogLine[] {
  const segments: FormattedLogLine[] = [];
  
  // Regex to match ANSI escape sequences
  const ansiRegex = /\x1b\[([0-9;]+)m/g;
  
  let lastIndex = 0;
  let currentColor: string | undefined;
  let currentBold = false;
  let match;
  
  while ((match = ansiRegex.exec(line)) !== null) {
    // Add text before this escape sequence
    if (match.index > lastIndex) {
      const text = line.substring(lastIndex, match.index);
      if (text) {
        segments.push({
          text,
          color: currentColor,
          bold: currentBold,
        });
      }
    }
    
    // Parse the escape sequence
    const code = match[1];
    
    if (code === '0') {
      // Reset
      currentColor = undefined;
      currentBold = false;
    } else if (code === '1') {
      // Bold
      currentBold = true;
    } else {
      // Try to parse as color
      const color = parseAnsiColor(code);
      if (color) {
        currentColor = color;
      }
    }
    
    lastIndex = ansiRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < line.length) {
    const text = line.substring(lastIndex);
    if (text) {
      segments.push({
        text,
        color: currentColor,
        bold: currentBold,
      });
    }
  }
  
  return segments;
}

/**
 * Filter out unwanted log lines
 */
export function shouldFilterLine(line: string): boolean {
  const trimmed = line.trim();
  
  // Filter out lines that are just thinking indicators
  if (trimmed.startsWith('Thinking...')) {
    return true;
  }
  
  // Don't filter empty lines - they may be intentional spacing
  
  return false;
}

/**
 * Clean and format logs
 */
export function formatLogs(logs: string): string {
  const lines = logs.split('\n');
  const filteredLines = lines.filter(line => !shouldFilterLine(line));
  return filteredLines.join('\n');
}

/**
 * Parse logs into formatted segments for rendering
 */
export function parseLogsForRendering(logs: string): Array<{ line: string; segments: FormattedLogLine[] }> {
  const cleanedLogs = formatLogs(logs);
  const lines = cleanedLogs.split('\n');
  
  return lines.map(line => ({
    line,
    segments: parseAnsiLine(line),
  }));
}
