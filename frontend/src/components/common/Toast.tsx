import toast, { Toaster, type ToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertTriangle, X, RotateCw } from 'lucide-react';

// Custom toast component with dismiss button and optional retry
const CustomToast = ({ 
  message, 
  type, 
  onDismiss,
  onRetry
}: { 
  message: string; 
  type: 'success' | 'error' | 'info' | 'warning';
  onDismiss: () => void;
  onRetry?: () => void;
}) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
  };

  const colors = {
    success: 'bg-status-success',
    error: 'bg-status-error',
    info: 'bg-status-info',
    warning: 'bg-status-warning',
  };

  return (
    <div className={`${colors[type]} text-text-inverse px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slideInRight`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onRetry && (
        <button
          onClick={() => {
            onDismiss();
            onRetry();
          }}
          className="flex-shrink-0 hover:opacity-80 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1 bg-white/20 flex items-center gap-1"
          aria-label="Retry operation"
        >
          <RotateCw className="h-3 w-3" />
          <span className="text-xs font-semibold">Retry</span>
        </button>
      )}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 hover:opacity-80 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Default toast options
const defaultOptions: ToastOptions = {
  duration: 5000,
  position: 'top-right',
};

// Extended options with retry callback
export interface ToastOptionsWithRetry extends ToastOptions {
  onRetry?: () => void;
}

// Helper functions
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type="success"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    { ...defaultOptions, ...options }
  );
};

export const showError = (message: string, options?: ToastOptionsWithRetry) => {
  return toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type="error"
        onDismiss={() => toast.dismiss(t.id)}
        onRetry={options?.onRetry}
      />
    ),
    { ...defaultOptions, duration: 7000, ...options } // Longer duration for errors with retry
  );
};

export const showInfo = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type="info"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    { ...defaultOptions, ...options }
  );
};

export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type="warning"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    { ...defaultOptions, ...options }
  );
};

// Long-running operation toast (stays visible longer)
export const showLongRunning = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type="info"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    { ...defaultOptions, duration: 10000, ...options } // 10 seconds for long operations
  );
};

// Toaster component to be added to the app root
export const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Prevent overlapping
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      gutter={12}
    />
  );
};
