import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Use a timeout to ensure the modal is fully rendered before focusing
    const focusTimeout = setTimeout(() => {
      if (!modalRef.current) return;

      // Get all focusable elements
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0];

      // Focus the first element
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Handle tab key for focus trap
      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !modalRef.current) return;

        const currentFocusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const currentFirst = currentFocusableElements[0];
        const currentLast = currentFocusableElements[currentFocusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === currentFirst) {
            event.preventDefault();
            currentLast?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === currentLast) {
            event.preventDefault();
            currentFirst?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }, 0);

    return () => {
      clearTimeout(focusTimeout);
      // Restore focus to the previously focused element safely
      try {
        if (previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
          previousActiveElement.current.focus();
        }
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="bg-black bg-opacity-50 transition-opacity duration-base"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeStyles[size]} bg-background-primary rounded-lg shadow-xl p-8 border border-border`}
        style={{
          animation: 'scaleIn 0.2s ease-out',
          zIndex: 10000,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="modal-title"
            className="text-2xl font-semibold text-text-primary"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-brand-primary rounded p-1"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-text-primary">{children}</div>
      </div>
    </div>,
    document.body
  );
};
