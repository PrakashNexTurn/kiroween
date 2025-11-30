import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';
import { CheckCircle, XCircle, Info, AlertTriangle, RotateCw } from 'lucide-react';

// Extended options with retry callback
export interface ToastOptionsWithRetry {
  onRetry?: () => void;
  duration?: number;
}

// Configure notification globally
notification.config({
  placement: 'topRight',
  top: 20,
  duration: 5,
  maxCount: 3,
});

// Helper to create notification with retry button
const createNotificationConfig = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  options?: ToastOptionsWithRetry
): ArgsProps => {
  const icons = {
    success: <CheckCircle style={{ color: '#52c41a' }} />,
    error: <XCircle style={{ color: '#ff4d4f' }} />,
    info: <Info style={{ color: '#1890ff' }} />,
    warning: <AlertTriangle style={{ color: '#faad14' }} />,
  };

  const config: ArgsProps = {
    message,
    icon: icons[type],
    duration: options?.duration || (type === 'error' ? 7 : 5),
    closeIcon: true,
  };

  // Add retry button if onRetry is provided
  if (options?.onRetry) {
    config.btn = (
      <button
        onClick={() => {
          notification.destroy();
          options.onRetry!();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 12px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '4px',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
        }}
        aria-label="Retry operation"
      >
        <RotateCw style={{ width: '12px', height: '12px' }} />
        <span>Retry</span>
      </button>
    );
  }

  return config;
};

// Helper functions
export const showSuccess = (message: string, options?: ToastOptionsWithRetry) => {
  notification.success(createNotificationConfig('success', message, options));
};

export const showError = (message: string, options?: ToastOptionsWithRetry) => {
  notification.error(createNotificationConfig('error', message, options));
};

export const showInfo = (message: string, options?: ToastOptionsWithRetry) => {
  notification.info(createNotificationConfig('info', message, options));
};

export const showWarning = (message: string, options?: ToastOptionsWithRetry) => {
  notification.warning(createNotificationConfig('warning', message, options));
};

// Long-running operation notification (stays visible longer)
export const showLongRunning = (message: string, options?: ToastOptionsWithRetry) => {
  notification.info(
    createNotificationConfig('info', message, { ...options, duration: 10 })
  );
};

// ToastContainer is no longer needed with Ant Design
// Ant Design notifications are rendered automatically
export const ToastContainer = () => null;
