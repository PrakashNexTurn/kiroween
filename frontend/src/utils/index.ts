/**
 * Utility Functions
 * Export all utility functions
 */

export {
  parseTasksFromMarkdown,
  getNextPendingTask,
  getTopLevelTasks,
  getSubtasks,
  calculateTaskStats,
} from './taskParser';

export { useNavigation, useBreadcrumbs, ROUTES } from './navigation';
export type { BreadcrumbItem } from './navigation';

export {
  isApiError,
  getErrorMessage,
  getErrorSeverity,
  getErrorSuggestion,
  handleApiError,
  handleNetworkError,
  handleNotFoundError,
  handleAuthError,
  handleServerError,
  handleTimeoutError,
  handleValidationError,
  createErrorHandler,
  retryWithBackoff,
  withFallback,
  ErrorSeverity,
} from './errorHandler';
export type { HandleErrorOptions } from './errorHandler';

export {
  handleFileTreeError,
  handleFileContentError,
  handleFileSearchError,
  handleSteeringFileError,
  handleSteeringSaveError,
  handleSteeringGenerationError,
} from './fileErrorHandler';

export {
  required,
  minLength,
  maxLength,
  pattern,
  email,
  notOnlyWhitespace,
  numeric,
  minValue,
  maxValue,
  combine,
  validateSchema,
  hasErrors,
} from './validation';
export type { ValidationResult, ValidationRule, FieldErrors } from './validation';

export {
  parseAnsiLine,
  shouldFilterLine,
  formatLogs,
  parseLogsForRendering,
} from './logFormatter';
export type { FormattedLogLine } from './logFormatter';

export {
  saveAdhocHistory,
  loadAdhocHistory,
  addAdhocTaskToHistory,
  clearAdhocHistory,
  getMaxHistoryItems,
} from './adhocTaskStorage';

export {
  announceToScreenReader,
  generateA11yId,
  prefersReducedMotion,
  isKeyboardUser,
  setupKeyboardUserDetection,
  getFileTypeLabel,
  formatStatusForScreenReader,
  createSkipLink,
  isHighContrastMode,
  getAnimationDuration,
  trapFocus,
} from './accessibility';

export { themeToAntdConfig } from './themeToAntdConfig';
