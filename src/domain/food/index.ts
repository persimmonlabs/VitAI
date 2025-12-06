// Types
export * from './types';

// Service functions
export {
  validateFoodData,
  calculateCaloriesFromMacros,
  convertToGrams,
  calculateNutritionForServing,
  formatNutritionLabel,
  calculateCaloricDensity,
  isHighInMacro,
  getMacroSplit,
} from './service';

// Repository
export { createFoodRepository, createServerFoodRepository } from './repository';
export type { FoodRepository } from './repository';
