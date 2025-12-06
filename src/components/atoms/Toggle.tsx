import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked = false,
      onChange,
      size = 'md',
      label,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const handleToggle = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    const sizeStyles = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: 'translate-x-7',
      },
    };

    const trackBaseStyles =
      'relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2';

    const trackColorStyles = checked
      ? 'bg-green-600'
      : 'bg-neutral-300';

    const thumbStyles =
      'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200';

    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        data-testid="toggle-wrapper"
      >
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            trackBaseStyles,
            trackColorStyles,
            sizeStyles[size].track,
            disabled && 'cursor-not-allowed opacity-50'
          )}
          data-testid="toggle"
          {...props}
        >
          <span
            className={cn(
              thumbStyles,
              sizeStyles[size].thumb,
              checked ? sizeStyles[size].translate : 'translate-x-0.5'
            )}
            data-testid="toggle-thumb"
          />
        </button>
        {label && (
          <span
            className={cn(
              'text-sm font-medium',
              disabled ? 'text-neutral-400' : 'text-neutral-700'
            )}
            data-testid="toggle-label"
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
