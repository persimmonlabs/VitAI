'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useCreateMealMutation } from '@/lib/query';
import { ArrowLeft } from 'lucide-react';

interface ParsedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

function ConfirmMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMealMutation = useCreateMealMutation();

  // Get parsed data from query params
  const dataParam = searchParams.get('data');
  const parsedData: ParsedMeal | null = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : null;

  const [name, setName] = useState(parsedData?.name || '');
  const [calories, setCalories] = useState(parsedData?.calories?.toString() || '');
  const [protein, setProtein] = useState(parsedData?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(parsedData?.carbs?.toString() || '');
  const [fat, setFat] = useState(parsedData?.fat?.toString() || '');

  const handleConfirm = async () => {
    try {
      await createMealMutation.mutateAsync({
        name,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        loggedAt: new Date().toISOString(),
      });
      router.push('/app');
    } catch (error) {
      console.error('Create meal error:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!parsedData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-gray-600">No meal data found</p>
        <Button onClick={() => router.push('/app/meals/add')}>
          Back to Add Meal
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-white">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-white px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Confirm Meal</h2>
        </div>
      </div>

      {/* Confirmation Form */}
      <div className="space-y-6 p-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Review and adjust the nutritional information before saving
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Meal Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Breakfast, Lunch, Dinner"
          />
        </div>

        {/* Individual Items (if available) */}
        {parsedData.items && parsedData.items.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Detected Items
            </label>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4">
              {parsedData.items.map((item, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {item.calories} cal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Total Nutrition
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Calories
              </label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Protein (g)
              </label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-600">
              Carbs (g)
            </label>
            <Input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-600">
              Fat (g)
            </label>
            <Input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="0"
              step="0.1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={!name || !calories || createMealMutation.isPending}
          >
            {createMealMutation.isPending ? 'Saving...' : 'Confirm & Save'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmMealPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ConfirmMealContent />
    </Suspense>
  );
}
