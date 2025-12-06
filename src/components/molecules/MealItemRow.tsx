import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';

export interface MealItemRowProps {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  foodName,
  quantity,
  unit,
  calories,
  protein,
  carbs,
  fat,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
        'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <Text variant="body" weight="medium" truncate>
            {foodName}
          </Text>
          <Text variant="caption" color="secondary" className="shrink-0">
            {quantity} {unit}
          </Text>
        </div>

        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
            <Text variant="caption" color="secondary">
              {Math.round(protein)}g
            </Text>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
            <Text variant="caption" color="secondary">
              {Math.round(carbs)}g
            </Text>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true" />
            <Text variant="caption" color="secondary">
              {Math.round(fat)}g
            </Text>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <Text variant="body" weight="semibold">
            {Math.round(calories)}
          </Text>
          <Text variant="caption" color="secondary">
            kcal
          </Text>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
                aria-label={`Edit ${foodName}`}
              >
                <Icon icon={Pencil} size="sm" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                aria-label={`Delete ${foodName}`}
              >
                <Icon icon={Trash2} size="sm" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

MealItemRow.displayName = 'MealItemRow';
