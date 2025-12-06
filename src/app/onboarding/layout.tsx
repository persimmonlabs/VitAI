'use client';

import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

const steps = [
  { id: 'welcome', name: 'Welcome' },
  { id: 'personal-info', name: 'Personal Info' },
  { id: 'activity-level', name: 'Activity' },
  { id: 'goal', name: 'Goal' },
  { id: 'preferences', name: 'Preferences' },
  { id: 'complete', name: 'Complete' },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepId = pathname.split('/').pop();
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                VitAI
              </span>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Step Names (Desktop) */}
          <div className="mt-4 hidden md:flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs transition-colors ${
                  index <= currentStepIndex
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
