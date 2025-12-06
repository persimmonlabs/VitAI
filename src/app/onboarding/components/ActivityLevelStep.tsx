'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

const activityLevels: Array<{
  id: ActivityLevel;
  multiplier: number;
}> = [
  { id: 'sedentary', multiplier: 1.2 },
  { id: 'lightly_active', multiplier: 1.375 },
  { id: 'moderately_active', multiplier: 1.55 },
  { id: 'very_active', multiplier: 1.725 },
  { id: 'extra_active', multiplier: 1.9 },
];

export function ActivityLevelStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selected, setSelected] = useState<ActivityLevel | null>(null);

  const handleNext = () => {
    if (!selected) return;
    // TODO: Save to context or API
    console.log('Activity level:', selected);
    router.push('/onboarding/goal');
  };

  const handleBack = () => {
    router.push('/onboarding/personal-info');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('onboarding.activityLevel.title')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('onboarding.activityLevel.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {activityLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setSelected(level.id)}
              className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                selected === level.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(`onboarding.activityLevel.levels.${level.id}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`onboarding.activityLevel.levels.${level.id}.description`)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    {t(`onboarding.activityLevel.levels.${level.id}.examples`)}
                  </p>
                </div>
                <div className="ml-4">
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selected === level.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selected === level.id && (
                      <div className="h-3 w-3 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

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
            type="button"
            size="lg"
            onClick={handleNext}
            disabled={!selected}
            className="flex-1"
          >
            {t('common.next')}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
