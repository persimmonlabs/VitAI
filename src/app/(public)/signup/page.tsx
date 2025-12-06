'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Checkbox } from '@/components/atoms';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Sparkles, AlertCircle, Check, X } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');

  const passwordRequirements: PasswordRequirement[] = [
    { label: t('auth.signup.requirements.minLength'), test: (p) => p.length >= 8 },
    { label: t('auth.signup.requirements.uppercase'), test: (p) => /[A-Z]/.test(p) },
    { label: t('auth.signup.requirements.number'), test: (p) => /[0-9]/.test(p) },
    { label: t('auth.signup.requirements.special'), test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await signup(data.email, data.password);
      router.push('/onboarding/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signup.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.signup.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error-50 dark:bg-error-900/20 p-4 text-sm text-error-600 dark:text-error-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.fields.password')}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
              placeholder={t('auth.fields.passwordPlaceholder')}
            />

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => {
                  const isValid = req.test(password);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      {isValid ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={isValid ? 'text-success-600 dark:text-success-400' : 'text-gray-600 dark:text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.fields.confirmPassword')}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder={t('auth.fields.confirmPasswordPlaceholder')}
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Checkbox
                id="acceptTerms"
                {...register('acceptTerms')}
              />
            </div>
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('auth.signup.acceptTerms')}{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                {t('auth.signup.termsLink')}
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {errors.acceptTerms.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.signup.submit')}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.signup.hasAccount')}{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            {t('auth.signup.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
