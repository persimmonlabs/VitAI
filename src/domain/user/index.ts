// Types
export * from './types';

// Service functions
export {
  validateOnboardingData,
  calculateBMR,
  calculateTDEE,
  suggestCalorieTarget,
  calculateMacroTargets,
  convertWeight,
  convertHeight,
  feetInchesToCm,
  cmToFeetInches,
  calculateWeightDelta,
  estimateWeeksToGoal,
  getActivityLevelDescription,
} from './service';

// Repository
export { createUserRepository, createServerUserRepository } from './repository';
export type { UserRepository } from './repository';
