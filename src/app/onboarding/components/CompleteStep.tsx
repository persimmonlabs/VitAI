'use client';

import { Button } from '@/components/atoms/Button';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Target, TrendingUp, Flame, Zap } from 'lucide-react';

export function CompleteStep() {
  const { t } = useTranslation();
  const router = useRouter();

  // TODO: Calculate actual values from user data
  const calculatedCalories = 2150;
  const bmr = 1680;
  const tdee = 2150;
  const goalCalories = 1900; // Example for weight loss

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
            <CheckCircle2 className="h-12 w-12 text-success-500" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('onboarding.complete.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('onboarding.complete.subtitle')}
          </p>
        </div>

        {/* Calculated Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Calorie Target */}
          <div className="col-span-full p-6 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-6 w-6" />
              <h3 className="font-semibold text-lg">
                {t('onboarding.complete.metrics.dailyTarget')}
              </h3>
            </div>
            <p className="text-4xl font-bold">{goalCalories}</p>
            <p className="text-sm opacity-90 mt-1">
              {t('onboarding.complete.metrics.caloriesPerDay')}
            </p>
          </div>

          {/* BMR */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('onboarding.complete.metrics.bmr')}
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bmr}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('onboarding.complete.metrics.basalMetabolicRate')}
            </p>
          </div>

          {/* TDEE */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('onboarding.complete.metrics.tdee')}
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{tdee}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('onboarding.complete.metrics.totalDailyEnergyExpenditure')}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            {t('onboarding.complete.summary.title')}
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{t('onboarding.complete.summary.personalizedPlan')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{t('onboarding.complete.summary.trackProgress')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{t('onboarding.complete.summary.achieveGoals')}</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleComplete} size="lg" className="w-full">
            <TrendingUp className="h-5 w-5 mr-2" />
            {t('onboarding.complete.startTracking')}
          </Button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('onboarding.complete.editAnytime')}
          </p>
        </div>
      </div>
    </div>
  );
}
