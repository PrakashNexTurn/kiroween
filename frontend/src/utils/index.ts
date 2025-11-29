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
  handleApiError,
  handleNetworkError,
  handleNotFoundError,
  handleAuthError,
  handleServerError,
  handleValidationError,
  createErrorHandler,
} from './errorHandler';

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
