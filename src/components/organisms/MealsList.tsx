import React from 'react';
import { Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/atoms';
import { MealCard } from './MealCard';

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

interface MealData {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

interface MealsListProps {
  meals: MealData;
  onAddItem?: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  date?: Date;
}

export const MealsList: React.FC<MealsListProps> = ({
  meals,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const allMealsEmpty =
    meals.breakfast.length === 0 &&
    meals.lunch.length === 0 &&
    meals.dinner.length === 0 &&
    meals.snacks.length === 0;

  const totalCalories = Object.values(meals)
    .flat()
    .reduce((sum, item) => sum + item.calories, 0);

  const totalItems = Object.values(meals)
    .flat()
    .length;

  if (allMealsEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Utensils className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No meals logged yet
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-sm">
          Start tracking your nutrition by adding your first meal
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => onAddItem?.('breakfast')}
          icon={<Plus className="h-5 w-5" />}
          iconPosition="left"
        >
          Log Your First Meal
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Header */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Today's Meals</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalCalories} <span className="text-sm font-normal text-gray-600">cal</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-primary-600">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Breakfast */}
      {(meals.breakfast.length > 0 || allMealsEmpty === false) && (
        <MealCard
          mealType="breakfast"
          items={meals.breakfast}
          onAddItem={() => onAddItem?.('breakfast')}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {/* Lunch */}
      {(meals.lunch.length > 0 || allMealsEmpty === false) && (
        <MealCard
          mealType="lunch"
          items={meals.lunch}
          onAddItem={() => onAddItem?.('lunch')}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {/* Dinner */}
      {(meals.dinner.length > 0 || allMealsEmpty === false) && (
        <MealCard
          mealType="dinner"
          items={meals.dinner}
          onAddItem={() => onAddItem?.('dinner')}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {/* Snacks */}
      {(meals.snacks.length > 0 || allMealsEmpty === false) && (
        <MealCard
          mealType="snacks"
          items={meals.snacks}
          onAddItem={() => onAddItem?.('snacks')}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      )}
    </div>
  );
};
