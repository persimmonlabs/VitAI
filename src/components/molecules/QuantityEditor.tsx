import React from 'react';
import { NumberInput } from './NumberInput';
import { SelectField, type SelectOption } from './SelectField';
import { cn } from '@/lib/utils';

export interface QuantityEditorProps {
  quantity: number;
  unit: string;
  onQuantityChange: (quantity: number) => void;
  onUnitChange?: (unit: string) => void;
  availableUnits?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const defaultUnits: SelectOption[] = [
  { value: 'serving', label: 'serving' },
  { value: 'g', label: 'grams (g)' },
  { value: 'oz', label: 'ounces (oz)' },
  { value: 'cup', label: 'cup' },
  { value: 'tbsp', label: 'tablespoon' },
  { value: 'tsp', label: 'teaspoon' },
];

export const QuantityEditor: React.FC<QuantityEditorProps> = ({
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  availableUnits = defaultUnits,
  min = 0.1,
  max = 999,
  step = 0.1,
  className,
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <NumberInput
          value={quantity}
          onChange={onQuantityChange}
          min={min}
          max={max}
          step={step}
          showButtons
        />
      </div>
      {onUnitChange && availableUnits.length > 1 && (
        <div className="w-32">
          <SelectField
            options={availableUnits}
            value={unit}
            onChange={onUnitChange}
            placeholder="Unit"
          />
        </div>
      )}
    </div>
  );
};

QuantityEditor.displayName = 'QuantityEditor';
