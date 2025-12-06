import React from 'react';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';

export interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MacroDisplayProps {
  macros: MacroData;
  layout?: 'horizontal' | 'vertical';
  showCalories?: boolean;
  className?: string;
}

const MacroItem: React.FC<{
  label: string;
  value: number;
  unit: string;
  color: string;
}> = ({ label, value, unit, color }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={cn('h-2 w-2 rounded-full', color)} aria-hidden="true" />
    <Text variant="caption" color="secondary" className="uppercase tracking-wide">
      {label}
    </Text>
    <Text variant="body" weight="semibold">
      {Math.round(value)}
      <Text as="span" variant="caption" color="secondary" className="ml-0.5">
        {unit}
      </Text>
    </Text>
  </div>
);

export const MacroDisplay: React.FC<MacroDisplayProps> = ({
  macros,
  layout = 'horizontal',
  showCalories = true,
  className,
}) => {
  const macroItems = [
    { key: 'protein', label: 'Protein', value: macros.protein, unit: 'g', color: 'bg-blue-500' },
    { key: 'carbs', label: 'Carbs', value: macros.carbs, unit: 'g', color: 'bg-orange-500' },
    { key: 'fat', label: 'Fat', value: macros.fat, unit: 'g', color: 'bg-yellow-500' },
  ];

  if (showCalories) {
    macroItems.push({
      key: 'calories',
      label: 'Calories',
      value: macros.calories,
      unit: 'kcal',
      color: 'bg-green-500',
    });
  }

  return (
    <div
      className={cn(
        'flex gap-4',
        layout === 'vertical' ? 'flex-col' : 'flex-row justify-around',
        className
      )}
      role="group"
      aria-label="Macro nutrients"
    >
      {macroItems.map((item, index) => (
        <MacroItem key={item.key || index} {...item} />
      ))}
    </div>
  );
};

MacroDisplay.displayName = 'MacroDisplay';
