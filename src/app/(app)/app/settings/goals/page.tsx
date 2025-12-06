'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useGoals, useUpdateGoalsMutation } from '@/lib/query';
import { ArrowLeft } from 'lucide-react';

interface Goals {
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  weightGoal?: number;
}

export default function GoalsPage() {
  const router = useRouter();
  const { data, isLoading } = useGoals();
  const goals = data as Goals | undefined;
  const updateGoalsMutation = useUpdateGoalsMutation();

  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [proteinGoal, setProteinGoal] = useState('150');
  const [carbsGoal, setCarbsGoal] = useState('200');
  const [fatGoal, setFatGoal] = useState('65');
  const [weightGoal, setWeightGoal] = useState('');

  // Update form when goals load
  useEffect(() => {
    if (goals) {
      setCalorieGoal(goals.calorieGoal?.toString() || '2000');
      setProteinGoal(goals.proteinGoal?.toString() || '150');
      setCarbsGoal(goals.carbsGoal?.toString() || '200');
      setFatGoal(goals.fatGoal?.toString() || '65');
      setWeightGoal(goals.weightGoal?.toString() || '');
    }
  }, [goals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateGoalsMutation.mutateAsync({
        calorieGoal: parseInt(calorieGoal),
        proteinGoal: parseFloat(proteinGoal),
        carbsGoal: parseFloat(carbsGoal),
        fatGoal: parseFloat(fatGoal),
        weightGoal: weightGoal ? parseFloat(weightGoal) : undefined,
      });
      router.back();
    } catch (error) {
      console.error('Update goals error:', error);
      alert('Failed to update goals. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-white">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b bg-white px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Goals</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Daily Nutrition Goals</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Calorie Goal (kcal)
              </label>
              <Input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                placeholder="2000"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Protein (g)
                </label>
                <Input
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                  placeholder="150"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Carbs (g)
                </label>
                <Input
                  type="number"
                  value={carbsGoal}
                  onChange={(e) => setCarbsGoal(e.target.value)}
                  placeholder="200"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fat (g)
                </label>
                <Input
                  type="number"
                  value={fatGoal}
                  onChange={(e) => setFatGoal(e.target.value)}
                  placeholder="65"
                  step="0.1"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Weight Goal</h3>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Target Weight (kg) - Optional
            </label>
            <Input
              type="number"
              value={weightGoal}
              onChange={(e) => setWeightGoal(e.target.value)}
              placeholder="70"
              step="0.1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank if you don&apos;t have a specific weight goal
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Your goals should be based on your age, weight, height, and activity level. Consider consulting with a healthcare professional for personalized recommendations.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={updateGoalsMutation.isPending}
        >
          {updateGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
        </Button>
      </form>
    </div>
  );
}
