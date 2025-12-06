import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-500 text-green-900 dark:bg-green-950 dark:text-green-100',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:text-red-100',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
};

export const Toast: React.FC<ToastProps> = ({
  variant,
  message,
  description,
  action,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className,
}) => {
  const config = variantConfig[variant];
  const ToastIcon = config.icon;

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-in slide-in-from-top-5',
        config.className,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon icon={ToastIcon} size="md" className={cn('shrink-0 mt-0.5', config.iconClassName)} />

      <div className="flex-1 min-w-0">
        <Text variant="body" weight="semibold">
          {message}
        </Text>
        {description && (
          <Text variant="caption" className="mt-1 opacity-90">
            {description}
          </Text>
        )}
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="mt-2 h-8"
          >
            {action.label}
          </Button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close notification"
        >
          <Icon icon={X} size="sm" />
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';
