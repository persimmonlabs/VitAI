import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button } from '@/components/atoms';

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  showSkip?: boolean;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isNextDisabled = false,
  isLoading = false,
  showSkip = false,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {/* Step Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index + 1 === currentStep
                    ? 'w-8 bg-primary-600'
                    : index + 1 < currentStep
                    ? 'w-2 bg-primary-400'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 text-lg">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="mb-8">
            {children}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <div className="flex-1">
              {!isFirstStep && onBack && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onBack}
                  disabled={isLoading}
                  icon={<ChevronLeft className="h-5 w-5" />}
                  iconPosition="left"
                  fullWidth
                >
                  {backLabel}
                </Button>
              )}
            </div>

            {/* Skip Button */}
            {showSkip && onSkip && !isLastStep && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onSkip}
                disabled={isLoading}
              >
                Skip
              </Button>
            )}

            {/* Next/Finish Button */}
            <div className="flex-1">
              {onNext && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onNext}
                  disabled={isNextDisabled || isLoading}
                  loading={isLoading}
                  icon={!isLastStep ? <ChevronRight className="h-5 w-5" /> : undefined}
                  iconPosition="right"
                  fullWidth
                >
                  {isLastStep ? 'Get Started' : nextLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Help Text */}
          {!isLastStep && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Press Enter to continue
              </p>
            </div>
          )}
        </Card>

        {/* Welcome Message for First Step */}
        {isFirstStep && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Welcome to <span className="font-semibold text-primary-600">VitAI</span> -
              Your personal nutrition tracking companion
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
