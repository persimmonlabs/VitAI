'use client';

import { Button } from '@/components/atoms/Button';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

export function WelcomeStep() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/personal-info');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
      <div className="max-w-2xl space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('onboarding.welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('onboarding.welcome.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('onboarding.welcome.features.track.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('onboarding.welcome.features.track.description')}
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('onboarding.welcome.features.analyze.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('onboarding.welcome.features.analyze.description')}
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {t('onboarding.welcome.features.achieve.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('onboarding.welcome.features.achieve.description')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <Button onClick={handleNext} size="lg" className="w-full max-w-md">
            {t('onboarding.welcome.getStarted')}
          </Button>
        </div>
      </div>
    </div>
  );
}
