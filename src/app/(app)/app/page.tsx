'use client';

import { useRouter } from 'next/navigation';
import { DailySummaryCard } from '@/components/organisms/DailySummaryCard';
import { MealsList } from '@/components/organisms/MealsList';
import { Button } from '@/components/atoms/Button';
import { Camera, FileText, Edit3 } from 'lucide-react';
import { useMeals, useTodaySummary } from '@/lib/query';

interface SummaryData {
  consumed: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
}

interface MealData {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0] as string;
  const { data: mealsData, isLoading } = useMeals(today);
  const { data: summaryData } = useTodaySummary();

  const meals = (mealsData as MealData[] | undefined) || [];
  const summary = summaryData as SummaryData | undefined;

  const handlePhotoLog = () => {
    router.push('/app/meals/add?tab=photo');
  };

  const handleTextLog = () => {
    router.push('/app/meals/add?tab=text');
  };

  const handleManualLog = () => {
    router.push('/app/meals/add?tab=manual');
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">Today&apos;s Overview</h2>
        <p className="text-sm opacity-90">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Daily Summary */}
      <div className="px-4 py-6">
        {summary ? (
          <DailySummaryCard
            consumed={summary.consumed}
            target={summary.target}
            protein={summary.protein}
            carbs={summary.carbs}
            fat={summary.fat}
            proteinTarget={summary.proteinTarget}
            carbsTarget={summary.carbsTarget}
            fatTarget={summary.fatTarget}
          />
        ) : (
          <DailySummaryCard
            consumed={0}
            target={2000}
            protein={0}
            carbs={0}
            fat={0}
          />
        )}
      </div>

      {/* Quick Log Buttons */}
      <div className="px-4 pb-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Log</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handlePhotoLog}
            variant="ghost"
            className="flex-col gap-2 py-6"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Photo</span>
          </Button>
          <Button
            onClick={handleTextLog}
            variant="ghost"
            className="flex-col gap-2 py-6"
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Text</span>
          </Button>
          <Button
            onClick={handleManualLog}
            variant="ghost"
            className="flex-col gap-2 py-6"
          >
            <Edit3 className="h-6 w-6" />
            <span className="text-xs">Manual</span>
          </Button>
        </div>
      </div>

      {/* Meals List */}
      <div className="px-4 pb-8">
        <h3 className="mb-4 text-lg font-semibold">Today&apos;s Meals</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <MealsList meals={meals as any} />
        )}
      </div>
    </div>
  );
}
