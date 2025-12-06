import React from 'react';
import { Label } from '@/components/atoms/Label';
import { Input, type InputProps } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, error, helperText, required, className, ...inputProps }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <Input
          id={id}
          ref={ref}
          error={error ? 'true' : undefined}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...inputProps}
        />
        {error && (
          <Text
            id={`${id}-error`}
            variant="caption"
            color="error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </Text>
        )}
        {!error && helperText && (
          <Text
            id={`${id}-helper`}
            variant="caption"
            color="muted"
          >
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
