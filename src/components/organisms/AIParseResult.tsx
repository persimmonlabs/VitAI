import React, { useState } from 'react';
import { Check, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, Button } from '@/components/atoms';
import { QuantityEditor } from '@/components/molecules';

interface ParsedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  confidence: number; // 0-100
}

interface AIParseResultProps {
  foods: ParsedFood[];
  sourceText?: string;
  sourceImage?: string;
  onConfirm?: (foods: ParsedFood[]) => void;
  onCancel?: () => void;
  onEditFood?: (foodId: string, updates: Partial<ParsedFood>) => void;
}

const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 80) return { level: 'high', label: 'High', color: 'success' };
  if (confidence >= 50) return { level: 'medium', label: 'Medium', color: 'warning' };
  return { level: 'low', label: 'Low', color: 'error' };
};

const ConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {
  const { level, label, color } = getConfidenceLevel(confidence);

  const Icon = level === 'high' ? CheckCircle : level === 'medium' ? AlertTriangle : AlertCircle;

  const colorClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${colorClasses[color]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{label} ({confidence}%)</span>
    </div>
  );
};

export const AIParseResult: React.FC<AIParseResultProps> = ({
  foods: initialFoods,
  sourceText,
  sourceImage,
  onConfirm,
  onCancel,
}) => {
  const [foods, setFoods] = useState(initialFoods);

  const handleQuantityChange = (foodId: string, quantity: number) => {
    setFoods(foods.map(food => {
      if (food.id === foodId) {
        const ratio = quantity / food.quantity;
        return {
          ...food,
          quantity,
          calories: food.calories * ratio,
          protein: food.protein * ratio,
          carbs: food.carbs * ratio,
          fat: food.fat * ratio,
        };
      }
      return food;
    }));
  };

  const handleRemoveFood = (foodId: string) => {
    setFoods(foods.filter(food => food.id !== foodId));
  };

  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);

  const avgConfidence = foods.length > 0
    ? Math.round(foods.reduce((sum, food) => sum + food.confidence, 0) / foods.length)
    : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Analysis Result</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and adjust the parsed foods
            </p>
          </div>
          <ConfidenceIndicator confidence={avgConfidence} />
        </div>

        {/* Source Preview */}
        {(sourceText || sourceImage) && (
          <div className="mt-3">
            {sourceImage && (
              <div className="mb-2">
                <img
                  src={sourceImage}
                  alt="Food"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            {sourceText && (
              <Card className="p-3 bg-gray-50">
                <p className="text-sm text-gray-700 italic">"{sourceText}"</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Parsed Foods List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {foods.map((food) => (
            <Card key={food.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{food.name}</h3>
                  <div className="mt-1">
                    <ConfidenceIndicator confidence={food.confidence} />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFood(food.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Remove food"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Quantity Editor */}
              <div className="mb-3">
                <QuantityEditor
                  quantity={food.quantity}
                  unit={food.unit}
                  onQuantityChange={(qty: number) => handleQuantityChange(food.id, qty)}
                  min={0.1}
                  step={0.5}
                />
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-0.5">Calories</p>
                  <p className="text-sm font-bold text-gray-900">
                    {Math.round(food.calories)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600 mb-0.5">Protein</p>
                  <p className="text-sm font-bold text-blue-700">
                    {Math.round(food.protein)}g
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 mb-0.5">Carbs</p>
                  <p className="text-sm font-bold text-green-700">
                    {Math.round(food.carbs)}g
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-yellow-600 mb-0.5">Fat</p>
                  <p className="text-sm font-bold text-yellow-700">
                    {Math.round(food.fat)}g
                  </p>
                </div>
              </div>

              {/* Low Confidence Warning */}
              {food.confidence < 50 && (
                <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Low confidence detection. Please verify the nutritional values.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {foods.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No foods detected</p>
            <p className="text-sm text-gray-500 mt-1">Try uploading a different image</p>
          </div>
        )}
      </div>

      {/* Footer with Totals and Actions */}
      {foods.length > 0 && (
        <div className="bg-white border-t p-4">
          {/* Total Summary */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Nutrition</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-100 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-0.5">Calories</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(totalCalories)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-2 text-center">
                <p className="text-xs text-blue-600 mb-0.5">Protein</p>
                <p className="text-lg font-bold text-blue-700">
                  {Math.round(totalProtein)}g
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-2 text-center">
                <p className="text-xs text-green-600 mb-0.5">Carbs</p>
                <p className="text-lg font-bold text-green-700">
                  {Math.round(totalCarbs)}g
                </p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-2 text-center">
                <p className="text-xs text-yellow-600 mb-0.5">Fat</p>
                <p className="text-lg font-bold text-yellow-700">
                  {Math.round(totalFat)}g
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onCancel}
              icon={<X className="h-5 w-5" />}
              iconPosition="left"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onConfirm?.(foods)}
              icon={<Check className="h-5 w-5" />}
              iconPosition="left"
            >
              Confirm & Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
