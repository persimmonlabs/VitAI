import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-medium transition-colors';

    const variantStyles = {
      default: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
      success: 'bg-green-100 text-green-700 border border-green-200',
      warning: 'bg-orange-100 text-orange-700 border border-orange-200',
      error: 'bg-red-100 text-red-700 border border-red-200',
      info: 'bg-blue-100 text-blue-700 border border-blue-200',
    };

    const sizeStyles = {
      sm: 'text-xs px-2 py-0.5 h-5',
      md: 'text-sm px-2.5 py-1 h-6',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        data-testid="badge"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
