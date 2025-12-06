import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
}

const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      variant = 'default',
      selected = false,
      removable = false,
      onRemove,
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors';

    const variantStyles = {
      default: selected
        ? 'bg-neutral-200 text-neutral-900 border-2 border-neutral-400'
        : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200',
      primary: selected
        ? 'bg-green-600 text-white border-2 border-green-700'
        : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200',
      success: selected
        ? 'bg-green-600 text-white border-2 border-green-700'
        : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200',
      warning: selected
        ? 'bg-orange-600 text-white border-2 border-orange-700'
        : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200',
      error: selected
        ? 'bg-red-600 text-white border-2 border-red-700'
        : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200',
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const clickableStyles = onClick && !disabled ? 'cursor-pointer' : '';

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && onRemove) {
        onRemove();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          disabledStyles,
          clickableStyles,
          className
        )}
        onClick={disabled ? undefined : onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        data-testid="chip"
        aria-disabled={disabled}
        {...props}
      >
        <span className="truncate" data-testid="chip-label">
          {children}
        </span>
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1"
            aria-label="Remove"
            data-testid="chip-remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip };
