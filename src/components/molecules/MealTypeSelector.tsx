import React from 'react';
import { Chip } from '@/components/atoms/Chip';
import { Sunrise, Sun, Sunset, Dumbbell, Apple } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface MealTypeSelectorProps {
  value: MealType;
  onChange: (value: MealType) => void;
  className?: string;
}

const mealTypes: Array<{ value: MealType; label: string; icon: typeof Sunrise }> = [
  { value: 'breakfast', label: 'Breakfast', icon: Sunrise },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Sunset },
  { value: 'snack', label: 'Snack', icon: Apple },
  { value: 'pre_workout', label: 'Pre-Workout', icon: Dumbbell },
  { value: 'post_workout', label: 'Post-Workout', icon: Dumbbell },
];

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide pb-2',
        '-mx-4 px-4 md:mx-0 md:px-0',
        className
      )}
      role="radiogroup"
      aria-label="Meal type"
    >
      {mealTypes.map((mealType) => (
        <Chip
          key={mealType.value}
          selected={value === mealType.value}
          onClick={() => onChange(mealType.value)}
          role="radio"
          aria-checked={value === mealType.value}
          className="whitespace-nowrap flex items-center gap-1.5"
        >
          <Icon icon={mealType.icon} size="sm" />
          {mealType.label}
        </Chip>
      ))}
    </div>
  );
};

MealTypeSelector.displayName = 'MealTypeSelector';
