import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', label, ...props }, ref) => {
    const isHorizontal = orientation === 'horizontal';

    if (label && isHorizontal) {
      return (
        <div
          ref={ref}
          className={cn('relative flex items-center', className)}
          role="separator"
          aria-orientation={orientation}
          data-testid="divider"
          {...props}
        >
          <div className="flex-1 border-t border-neutral-200" />
          <span className="px-3 text-sm text-neutral-500" data-testid="divider-label">
            {label}
          </span>
          <div className="flex-1 border-t border-neutral-200" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          isHorizontal
            ? 'h-px w-full border-t border-neutral-200'
            : 'h-full w-px border-l border-neutral-200',
          className
        )}
        role="separator"
        aria-orientation={orientation}
        data-testid="divider"
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
