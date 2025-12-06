'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Sparkles, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.forgotPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.forgotPassword.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-lg bg-success-50 dark:bg-success-900/20 p-4 text-sm text-success-600 dark:text-success-400">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">{t('auth.forgotPassword.successTitle')}</p>
                <p>{t('auth.forgotPassword.successMessage')}</p>
              </div>
            </div>

            <Link href="/login">
              <Button variant="ghost" size="lg" className="w-full">
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('auth.forgotPassword.backToLogin')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-50 dark:bg-error-900/20 p-4 text-sm text-error-600 dark:text-error-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.fields.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  placeholder={t('auth.fields.emailPlaceholder')}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.forgotPassword.submit')}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
