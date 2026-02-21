'use client';

import React, { useEffect } from 'react';
import { CheckIcon, AlertIcon, InfoIcon, CloseIcon } from '@/components/icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
  warning: AlertIcon,
};

const colorMap: Record<string, string> = {
  success: 'var(--color-success, #22c55e)',
  error: 'var(--color-danger, #ef4444)',
  info: 'var(--color-info, #3b82f6)',
  warning: 'var(--color-warning, #f59e0b)',
};

const bgMap: Record<string, string> = {
  success: 'toast-success',
  error: 'toast-error',
  info: 'toast-info',
  warning: 'toast-warning',
};

export default function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const Icon = iconMap[type];

  return (
    <div
      className={`toast animate-slideUp ${bgMap[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        <Icon size={18} color={colorMap[type]} />
      </div>
      <p className="toast-message">{message}</p>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
        type="button"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
