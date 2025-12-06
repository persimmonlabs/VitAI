'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const preferencesSchema = z.object({
  unitSystem: z.enum(['metric', 'imperial']),
  language: z.enum(['en', 'pt-BR']),
  timezone: z.string(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export function PreferencesStep() {
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      unitSystem: 'metric',
      language: locale as 'en' | 'pt-BR',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const unitSystem = watch('unitSystem');
  const language = watch('language');

  const onSubmit = (data: PreferencesFormData) => {
    // Update language
    setLocale(data.language);

    // TODO: Save to context or API
    console.log('Preferences:', data);
    router.push('/onboarding/complete');
  };

  const handleBack = () => {
    router.push('/onboarding/goal');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('onboarding.preferences.title')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('onboarding.preferences.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Unit System */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('onboarding.preferences.fields.unitSystem')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  unitSystem === 'metric'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <input
                  type="radio"
                  value="metric"
                  {...register('unitSystem')}
                  className="sr-only"
                />
                <span className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.preferences.unitSystems.metric.title')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.preferences.unitSystems.metric.units')}
                </span>
              </label>

              <label
                className={`flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  unitSystem === 'imperial'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <input
                  type="radio"
                  value="imperial"
                  {...register('unitSystem')}
                  className="sr-only"
                />
                <span className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.preferences.unitSystems.imperial.title')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.preferences.unitSystems.imperial.units')}
                </span>
              </label>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('onboarding.preferences.fields.language')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  language === 'en'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <input
                  type="radio"
                  value="en"
                  {...register('language')}
                  className="sr-only"
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  🇺🇸 English
                </span>
              </label>

              <label
                className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  language === 'pt-BR'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <input
                  type="radio"
                  value="pt-BR"
                  {...register('language')}
                  className="sr-only"
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  🇧🇷 Português
                </span>
              </label>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.preferences.fields.timezone')}
            </label>
            <select
              id="timezone"
              {...register('timezone')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Sao_Paulo">Brasília Time (BRT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </select>
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
            <Button type="submit" size="lg" className="flex-1">
              {t('common.next')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
