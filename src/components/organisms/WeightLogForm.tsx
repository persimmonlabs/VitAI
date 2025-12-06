import React, { useState } from 'react';
import { Scale, Check, X } from 'lucide-react';
import { Card, Button, Input } from '@/components/atoms';

interface WeightLogFormProps {
  initialWeight?: number;
  initialDate?: Date;
  unit?: 'kg' | 'lbs';
  onSubmit?: (weight: number, date: Date, unit: 'kg' | 'lbs') => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const WeightLogForm: React.FC<WeightLogFormProps> = ({
  initialWeight = 0,
  initialDate = new Date(),
  unit: initialUnit = 'kg',
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [weight, setWeight] = useState(initialWeight || '');
  const [date, setDate] = useState(
    initialDate.toISOString().split('T')[0]
  );
  const [unit, setUnit] = useState<'kg' | 'lbs'>(initialUnit);

  const handleWeightChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight.toString());
    if (weightValue > 0) {
      onSubmit?.(weightValue, new Date(date), unit);
    }
  };

  const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return value * 2.20462;
    return value / 2.20462;
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    if (weight) {
      const currentWeight = parseFloat(weight.toString());
      const convertedWeight = convertWeight(currentWeight, unit, newUnit);
      setWeight(convertedWeight.toFixed(1));
    }
    setUnit(newUnit);
  };

  const isValid = weight && parseFloat(weight.toString()) > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <Scale className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Log Weight</h3>
          <p className="text-sm text-gray-600">Record your current weight</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Weight Input with Unit Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder={`Enter weight in ${unit}`}
                className="pr-12"
                disabled={isLoading}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {unit}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUnitToggle}
              disabled={isLoading}
              className="w-20"
            >
              {unit === 'kg' ? 'lbs' : 'kg'}
            </Button>
          </div>
          {weight && parseFloat(weight.toString()) > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              ≈ {convertWeight(parseFloat(weight.toString()), unit, unit === 'kg' ? 'lbs' : 'kg').toFixed(1)} {unit === 'kg' ? 'lbs' : 'kg'}
            </p>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Date Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick select</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
              disabled={isLoading}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setDate(yesterday.toISOString().split('T')[0]);
              }}
              disabled={isLoading}
            >
              Yesterday
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={onCancel}
              disabled={isLoading}
              leftIcon={<X className="h-5 w-5" />}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid || isLoading}
            loading={isLoading}
            leftIcon={<Check className="h-5 w-5" />}
          >
            Save Weight
          </Button>
        </div>
      </form>

      {/* Helper Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Weigh yourself at the same time each day for consistent tracking,
          preferably in the morning before eating.
        </p>
      </div>
    </Card>
  );
};
