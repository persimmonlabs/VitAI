import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'protein' | 'carbs' | 'fat';
  indeterminate?: boolean;
  animated?: boolean;
  showLabel?: boolean;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = 'default',
      indeterminate = false,
      animated = true,
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantStyles = {
      default: 'bg-green-600',
      success: 'bg-green-600',
      warning: 'bg-orange-500',
      error: 'bg-red-600',
      protein: 'bg-blue-500',
      carbs: 'bg-orange-500',
      fat: 'bg-yellow-500',
    };

    return (
      <div
        ref={ref}
        className={cn('relative w-full', className)}
        data-testid="progress-bar"
        {...props}
      >
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          data-testid="progress-track"
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              variantStyles[variant],
              {
                'animate-pulse': animated && !indeterminate,
                'animate-indeterminate': indeterminate,
              }
            )}
            style={{
              width: indeterminate ? '100%' : `${percentage}%`,
            }}
            data-testid="progress-fill"
          />
        </div>
        {showLabel && !indeterminate && (
          <div
            className="mt-1 text-right text-xs text-neutral-600"
            data-testid="progress-label"
          >
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
