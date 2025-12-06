// Types
export * from './types';

// Service functions
export {
  calculateWeightChange,
  calculateWeightTrend,
  calculateGoalProgress,
  estimateGoalCompletion,
  isOnTrack,
  normalizeWeight,
  formatWeightChange,
} from './service';

// Repository
export { createWeightRepository, createServerWeightRepository } from './repository';
export type { WeightRepository } from './repository';
