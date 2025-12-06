import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { FoodSearch } from './FoodSearch';
import { QuantityEditor } from '@/components/molecules';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  brand?: string;
  quantity?: number;
}

interface AddMealFormProps {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  onSubmit?: (items: FoodItem[], mealType: string) => void;
  onCancel?: () => void;
  searchResults?: FoodItem[];
  recentFoods?: FoodItem[];
  onSearch?: (query: string) => void;
  isSearching?: boolean;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snacks', label: 'Snacks', icon: '🍎' },
];

export const AddMealForm: React.FC<AddMealFormProps> = ({
  mealType = 'breakfast',
  onSubmit,
  onCancel,
  searchResults = [],
  recentFoods = [],
  onSearch,
  isSearching = false,
}) => {
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);

  const handleSelectFood = (food: FoodItem) => {
    const newItem = {
      ...food,
      quantity: food.servingSize,
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      calories: (updatedItems[index].calories / updatedItems[index].servingSize) * quantity,
      protein: (updatedItems[index].protein / updatedItems[index].servingSize) * quantity,
      carbs: (updatedItems[index].carbs / updatedItems[index].servingSize) * quantity,
      fat: (updatedItems[index].fat / updatedItems[index].servingSize) * quantity,
    };
    setSelectedItems(updatedItems);
  };

  const totalCalories = selectedItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = selectedItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = selectedItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = selectedItems.reduce((sum, item) => sum + item.fat, 0);

  const handleSubmit = () => {
    onSubmit?.(selectedItems, selectedMealType);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mealTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedMealType(type.value as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                selectedMealType === type.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{type.icon}</span>
              <span className="font-medium text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Food Search */}
        <div className="flex-1 overflow-hidden border-b lg:border-b-0 lg:border-r">
          <FoodSearch
            onSelectFood={handleSelectFood}
            results={searchResults}
            recentFoods={recentFoods}
            onSearch={onSearch}
            isLoading={isSearching}
          />
        </div>

        {/* Selected Items */}
        <div className="w-full lg:w-96 flex flex-col bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold text-gray-900">
              Selected Items ({selectedItems.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedItems.length > 0 ? (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg border p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-gray-600">{item.brand}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <QuantityEditor
                      quantity={item.quantity || item.servingSize}
                      unit={item.servingUnit}
                      onQuantityChange={(qty: number) => handleUpdateQuantity(index, qty)}
                      min={1}
                      step={1}
                    />

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Badge variant="default" className="text-xs">
                        {Math.round(item.calories)} cal
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        P: {Math.round(item.protein)}g
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        C: {Math.round(item.carbs)}g
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        F: {Math.round(item.fat)}g
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Plus className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 text-sm">No items selected</p>
                <p className="text-gray-500 text-xs mt-1">
                  Search and select foods to add
                </p>
              </div>
            )}
          </div>

          {/* Total Macros Preview */}
          {selectedItems.length > 0 && (
            <div className="border-t bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Total Nutrition
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Calories</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(totalCalories)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Protein</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(totalProtein)}g
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Carbs</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(totalCarbs)}g
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Fat</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(totalFat)}g
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleSubmit}
                  icon={<Check className="h-5 w-5" />}
                  iconPosition="left"
                >
                  Add to {mealTypes.find(m => m.value === selectedMealType)?.label}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
