'use client';

import { Button } from '@/components/atoms/Button';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === 'en' ? 'pt-BR' : 'en')}
        >
          {locale === 'en' ? 'PT-BR' : 'EN'}
        </Button>
      </div>

      {/* Logo and Brand */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          VitAI
        </h1>
      </div>

      {/* Value Proposition */}
      <p className="mb-12 max-w-md text-xl text-gray-600 dark:text-gray-300">
        {t('landing.tagline')}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link href="/signup">
          <Button size="lg" className="w-full">
            {t('landing.getStarted')}
          </Button>
        </Link>

        <Link href="/login">
          <Button variant="ghost" size="lg" className="w-full">
            {t('landing.alreadyHaveAccount')}
          </Button>
        </Link>
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="flex flex-col items-center">
          <div className="mb-3 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {t('landing.features.simple.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('landing.features.simple.description')}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-3 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {t('landing.features.beautiful.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('landing.features.beautiful.description')}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-3 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {t('landing.features.effective.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('landing.features.effective.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
