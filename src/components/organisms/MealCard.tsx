import React from 'react';
import { Plus } from 'lucide-react';
import { Card, Button } from '@/components/atoms';
import { MealItemRow } from '@/components/molecules';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  items: FoodItem[];
  onAddItem?: () => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

const mealTypeConfig = {
  breakfast: {
    label: 'Breakfast',
    icon: '🌅',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  lunch: {
    label: 'Lunch',
    icon: '☀️',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  dinner: {
    label: 'Dinner',
    icon: '🌙',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  snacks: {
    label: 'Snacks',
    icon: '🍎',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const config = mealTypeConfig[mealType];
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className={`${config.bgColor} px-4 py-3 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {config.label}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{totalCalories}</p>
            <p className="text-xs text-gray-600">calories</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y">
        {items.length > 0 ? (
          items.map((item) => (
            <MealItemRow
              key={item.id}
              id={item.id}
              foodName={item.name}
              calories={item.calories}
              protein={item.protein}
              carbs={item.carbs}
              fat={item.fat}
              quantity={item.quantity}
              unit={item.unit}
              onEdit={() => onEditItem?.(item.id)}
              onDelete={() => onDeleteItem?.(item.id)}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 text-sm">No items logged yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Add your first item to get started
            </p>
          </div>
        )}
      </div>

      {/* Total Summary */}
      {items.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Totals</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                P: <span className="font-medium">{Math.round(totalProtein)}g</span>
              </span>
              <span className="text-gray-600">
                C: <span className="font-medium">{Math.round(totalCarbs)}g</span>
              </span>
              <span className="text-gray-600">
                F: <span className="font-medium">{Math.round(totalFat)}g</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Button */}
      <div className="px-4 py-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={onAddItem}
          icon={<Plus className="h-4 w-4" />}
          iconPosition="left"
        >
          Add {config.label}
        </Button>
      </div>
    </Card>
  );
};
