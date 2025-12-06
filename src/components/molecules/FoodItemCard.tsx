import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils';

export interface FoodItemCardProps {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  verified?: boolean;
  onAdd?: () => void;
  onClick?: () => void;
  className?: string;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  name,
  brand,
  servingSize,
  calories,
  protein,
  carbs,
  fat,
  verified = false,
  onAdd,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Text variant="body" weight="semibold" className="flex-1" truncate>
              {name}
            </Text>
            {verified && (
              <Badge variant="success" className="shrink-0 text-xs">
                Verified
              </Badge>
            )}
          </div>

          {brand && (
            <Text variant="caption" color="secondary" truncate className="mb-1">
              {brand}
            </Text>
          )}

          <Text variant="caption" color="muted" className="mb-2">
            {servingSize}
          </Text>

          <div className="flex items-center gap-4">
            <div>
              <Text variant="h4" weight="bold" className="leading-none">
                {calories}
              </Text>
              <Text variant="caption" color="secondary">
                cal
              </Text>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                <Text variant="caption" color="secondary">
                  P: {protein}g
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                <Text variant="caption" color="secondary">
                  C: {carbs}g
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true" />
                <Text variant="caption" color="secondary">
                  F: {fat}g
                </Text>
              </div>
            </div>
          </div>
        </div>

        {onAdd && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            icon={<Plus className="h-4 w-4" />}
            className="shrink-0"
            aria-label="Add food"
          />
        )}
      </div>
    </Card>
  );
};

FoodItemCard.displayName = 'FoodItemCard';
