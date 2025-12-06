import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  truncate?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label';
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant = 'body',
      color = 'primary',
      weight,
      truncate = false,
      as,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      h1: 'text-4xl md:text-5xl font-bold leading-tight',
      h2: 'text-3xl md:text-4xl font-bold leading-tight',
      h3: 'text-2xl md:text-3xl font-semibold leading-snug',
      h4: 'text-xl md:text-2xl font-semibold leading-snug',
      body: 'text-base leading-relaxed',
      caption: 'text-sm leading-normal',
      label: 'text-sm font-medium leading-normal',
    };

    const colorStyles = {
      primary: 'text-neutral-900',
      secondary: 'text-neutral-600',
      muted: 'text-neutral-500',
      error: 'text-red-600',
      success: 'text-green-600',
    };

    const weightStyles = weight
      ? {
          normal: 'font-normal',
          medium: 'font-medium',
          semibold: 'font-semibold',
          bold: 'font-bold',
        }[weight]
      : '';

    const truncateStyles = truncate ? 'truncate' : '';

    // Determine the element type
    const defaultElement = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      caption: 'span',
      label: 'label',
    }[variant] as keyof JSX.IntrinsicElements;

    const Component = (as || defaultElement) as any;

    return (
      <Component
        ref={ref}
        className={cn(
          variantStyles[variant],
          colorStyles[color],
          weightStyles,
          truncateStyles,
          className
        )}
        data-testid="text"
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text };
