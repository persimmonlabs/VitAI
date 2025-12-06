'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(13, 'You must be at least 13 years old').max(120, 'Please enter a valid age'),
  sex: z.enum(['male', 'female', 'other']),
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export function PersonalInfoStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    // TODO: Save to context or API
    console.log('Personal info:', data);
    router.push('/onboarding/activity-level');
  };

  const handleBack = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('onboarding.personalInfo.title')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('onboarding.personalInfo.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.personalInfo.fields.name')}
            </label>
            <Input
              id="name"
              {...register('name')}
              error={errors.name?.message}
              placeholder={t('onboarding.personalInfo.fields.namePlaceholder')}
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.personalInfo.fields.age')}
            </label>
            <Input
              id="age"
              type="number"
              {...register('age', { valueAsNumber: true })}
              error={errors.age?.message}
              placeholder="25"
            />
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('onboarding.personalInfo.fields.sex')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['male', 'female', 'other'] as const).map((sex) => (
                <label
                  key={sex}
                  className="flex items-center justify-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20"
                >
                  <input
                    type="radio"
                    value={sex}
                    {...register('sex')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`onboarding.personalInfo.fields.sexOptions.${sex}`)}
                  </span>
                </label>
              ))}
            </div>
            {errors.sex && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.sex.message}
              </p>
            )}
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.personalInfo.fields.height')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-3 py-1 text-xs rounded ${
                    heightUnit === 'cm'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('ft')}
                  className={`px-3 py-1 text-xs rounded ${
                    heightUnit === 'ft'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ft
                </button>
              </div>
            </div>
            <Input
              id="height"
              type="number"
              step="0.1"
              {...register('height', { valueAsNumber: true })}
              error={errors.height?.message}
              placeholder={heightUnit === 'cm' ? '170' : '5.7'}
            />
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.personalInfo.fields.weight')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-3 py-1 text-xs rounded ${
                    weightUnit === 'kg'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-3 py-1 text-xs rounded ${
                    weightUnit === 'lbs'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
            <Input
              id="weight"
              type="number"
              step="0.1"
              {...register('weight', { valueAsNumber: true })}
              error={errors.weight?.message}
              placeholder={weightUnit === 'kg' ? '70' : '154'}
            />
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
