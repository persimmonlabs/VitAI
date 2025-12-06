import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Input, type InputProps } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { cn, clamp } from '@/lib/utils';

export interface NumberInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showButtons?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = Infinity,
      step = 1,
      unit,
      showButtons = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleIncrement = () => {
      const newValue = clamp(value + step, min, max);
      onChange(newValue);
    };

    const handleDecrement = () => {
      const newValue = clamp(value - step, min, max);
      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = parseFloat(e.target.value);
      if (!isNaN(inputValue)) {
        const newValue = clamp(inputValue, min, max);
        onChange(newValue);
      }
    };

    const isAtMin = value <= min;
    const isAtMax = value >= max;

    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showButtons && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || isAtMin}
            aria-label="Decrease value"
            className="h-10 w-10 p-0"
          >
            <Icon icon={Minus} size="sm" />
          </Button>
        )}

        <div className="relative flex-1">
          <Input
            ref={ref}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn('text-center', unit && 'pr-12')}
            {...props}
          />
          {unit && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Text variant="caption" color="secondary">
                {unit}
              </Text>
            </div>
          )}
        </div>

        {showButtons && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || isAtMax}
            aria-label="Increase value"
            className="h-10 w-10 p-0"
          >
            <Icon icon={Plus} size="sm" />
          </Button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
