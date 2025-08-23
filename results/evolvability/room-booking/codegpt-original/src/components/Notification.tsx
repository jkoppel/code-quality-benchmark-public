import React, { useEffect } from 'react';

/**
 * Notification Component
 * Displays temporary notifications to users
 * Follows Single Responsibility Principle and provides accessibility
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className = '',
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  if (!isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`notification notification-${type} ${className}`}
      role=\"alert\"
      aria-live=\"polite\"
    >
      <div className=\"notification-content\">
        <span className=\"notification-icon\" aria-hidden=\"true\">
          {getIcon()}
        </span>
        <span className=\"notification-message\">{message}</span>
        <button
          type=\"button\"
          className=\"notification-close\"
          onClick={onClose}
          aria-label=\"Close notification\"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;