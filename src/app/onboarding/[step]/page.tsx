'use client';

import { use } from 'react';
import { WelcomeStep } from '../components/WelcomeStep';
import { PersonalInfoStep } from '../components/PersonalInfoStep';
import { ActivityLevelStep } from '../components/ActivityLevelStep';
import { GoalStep } from '../components/GoalStep';
import { PreferencesStep } from '../components/PreferencesStep';
import { CompleteStep } from '../components/CompleteStep';
import { redirect } from 'next/navigation';

const stepComponents: Record<string, React.ComponentType> = {
  welcome: WelcomeStep,
  'personal-info': PersonalInfoStep,
  'activity-level': ActivityLevelStep,
  goal: GoalStep,
  preferences: PreferencesStep,
  complete: CompleteStep,
};

interface PageProps {
  params: Promise<{ step: string }>;
}

export default function OnboardingStepPage({ params }: PageProps) {
  const { step } = use(params);
  const StepComponent = stepComponents[step];

  if (!StepComponent) {
    redirect('/onboarding/welcome');
  }

  return <StepComponent />;
}
