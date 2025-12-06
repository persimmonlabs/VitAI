import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animated = true,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-neutral-200';

    const variantStyles = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    const animationStyles = animated
      ? 'animate-pulse'
      : '';

    const inlineStyles: React.CSSProperties = {
      ...style,
      width: width,
      height: height,
    };

    // Default dimensions for variants
    if (!width && !height) {
      if (variant === 'text') {
        inlineStyles.width = '100%';
      } else if (variant === 'circular') {
        inlineStyles.width = '40px';
        inlineStyles.height = '40px';
      } else if (variant === 'rectangular') {
        inlineStyles.width = '100%';
        inlineStyles.height = '100px';
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          animationStyles,
          className
        )}
        style={inlineStyles}
        role="status"
        aria-label="Loading"
        data-testid="skeleton"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
