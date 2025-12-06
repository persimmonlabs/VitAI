'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';

type GoalType = 'lose' | 'gain' | 'maintain';

const goalSchema = z.object({
  goalType: z.enum(['lose', 'gain', 'maintain']),
  targetWeight: z.number().positive('Target weight must be positive').optional(),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function GoalStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const goals: Array<{
    id: GoalType;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'lose',
      icon: <TrendingDown className="h-8 w-8" />,
      color: 'text-blue-500',
    },
    {
      id: 'gain',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'text-green-500',
    },
    {
      id: 'maintain',
      icon: <Minus className="h-8 w-8" />,
      color: 'text-purple-500',
    },
  ];

  const handleGoalSelect = (goalType: GoalType) => {
    setSelectedGoal(goalType);
    setValue('goalType', goalType);
  };

  const onSubmit = (data: GoalFormData) => {
    // TODO: Save to context or API
    console.log('Goal:', data);
    router.push('/onboarding/preferences');
  };

  const handleBack = () => {
    router.push('/onboarding/activity-level');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('onboarding.goal.title')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('onboarding.goal.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Goal Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleGoalSelect(goal.id)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedGoal === goal.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-3 ${goal.color}`}>{goal.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(`onboarding.goal.types.${goal.id}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`onboarding.goal.types.${goal.id}.description`)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Target Weight and Date (only for lose/gain) */}
          {selectedGoal && selectedGoal !== 'maintain' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('onboarding.goal.fields.targetWeight')}
                  </label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    {...register('targetWeight', { valueAsNumber: true })}
                    error={errors.targetWeight?.message}
                    placeholder="65"
                  />
                </div>

                <div>
                  <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('onboarding.goal.fields.targetDate')}
                  </label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...register('targetDate')}
                    error={errors.targetDate?.message}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('onboarding.goal.healthyRateInfo')}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('common.back')}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!selectedGoal}
              className="flex-1"
            >
              {t('common.next')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
