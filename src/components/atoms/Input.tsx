import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseStyles =
      'flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

    const stateStyles = hasError
      ? 'border-red-500 text-red-900 focus-visible:ring-2 focus-visible:ring-red-500'
      : 'border-neutral-300 text-neutral-900 focus-visible:border-green-600 focus-visible:ring-2 focus-visible:ring-green-600';

    const paddingStyles = cn({
      'pl-10': leftIcon,
      'pr-10': rightIcon,
    });

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('flex flex-col gap-1.5', widthStyles)} data-testid="input-wrapper">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
            data-testid="input-label"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              data-testid="input-left-icon"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(baseStyles, stateStyles, paddingStyles, className)}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            data-testid="input"
            {...props}
          />
          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
              data-testid="input-right-icon"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600"
            data-testid="input-error"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-neutral-500"
            data-testid="input-helper"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
