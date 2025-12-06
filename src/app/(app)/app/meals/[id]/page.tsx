'use client';

import { useRouter } from 'next/navigation';
import { useMeal, useUpdateMealMutation, useDeleteMealMutation } from '@/lib/query';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  loggedAt: string;
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = useMeal(params.id);
  const meal = data as Meal | undefined;
  const updateMealMutation = useUpdateMealMutation(params.id);
  const deleteMealMutation = useDeleteMealMutation(params.id);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Initialize form when meal loads
  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setCalories(meal.calories.toString());
      setProtein(meal.protein.toString());
      setCarbs(meal.carbs.toString());
      setFat(meal.fat.toString());
    }
  }, [meal]);

  const handleSave = async () => {
    try {
      await updateMealMutation.mutateAsync({
        id: params.id,
        name,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
      });
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update meal');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      await deleteMealMutation.mutateAsync();
      router.push('/app');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete meal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-gray-600">Meal not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-white">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Edit Meal</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
            disabled={deleteMealMutation.isPending}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 p-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
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

        {/* Image Preview */}
        {meal.imageUrl && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Photo
            </label>
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>
        )}

        {/* Meal Time */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Time
          </label>
          <p className="text-gray-600">
            {new Date(meal.loggedAt).toLocaleString()}
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="w-full"
          disabled={updateMealMutation.isPending}
        >
          {updateMealMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
