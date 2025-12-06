import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl';

    const variantStyles = {
      primary:
        'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-600 shadow-sm',
      secondary:
        'bg-[#FF6B6B] text-white hover:bg-[#FF5252] active:bg-[#FF3838] focus-visible:ring-[#FF6B6B] shadow-sm',
      ghost:
        'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 shadow-sm',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-base px-4 py-2.5 gap-2 min-h-[44px]',
      lg: 'text-lg px-6 py-3.5 gap-2.5 min-h-[52px]',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        disabled={disabled || loading}
        data-testid="button"
        {...props}
      >
        {loading && (
          <Loader2
            className={cn('animate-spin', {
              'h-3.5 w-3.5': size === 'sm',
              'h-4 w-4': size === 'md',
              'h-5 w-5': size === 'lg',
            })}
            data-testid="button-spinner"
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0" data-testid="button-icon-left">
            {icon}
          </span>
        )}
        {children && <span className="flex-1">{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0" data-testid="button-icon-right">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
