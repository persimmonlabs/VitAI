<objective>
Implement the Food domain following the patterns established in the User domain.

This domain handles the food database: searching, creating custom foods, managing serving units, and the public/private distinction. Tests MUST pass before moving to the next domain.
</objective>

<context>
@./supabase/migrations/001_initial_schema.sql - Database schema
@./src/domain/user/ - User domain patterns to follow

Food database requirements:
- Public foods (USDA seed, AI-generated marked public)
- Private foods (user-created, default)
- Full-text search on food names
- Multiple serving units per food
- AI can create foods (flagged as ai_generated)
</context>

<requirements>
1. Create domain types in `./src/domain/food/types.ts`:
   ```typescript
   - Food entity with all nutrition fields
   - FoodSource enum (usda, user, ai_generated)
   - ServingUnit entity
   - NutritionPer100g value object
   - FoodSearchResult (partial food for lists)
   - CreateFoodInput, UpdateFoodInput
   ```

2. Create repository in `./src/domain/food/repository.ts`:
   - searchFoods(query, userId, options) - full-text search with priority:
     1. User's private foods
     2. Public USDA foods
     3. Public AI-generated foods
   - getFoodById(id)
   - getFoodWithServings(id)
   - createFood(data, userId)
   - createAIFood(data) - for AI-generated foods
   - updateFood(id, data, userId)
   - deleteFood(id, userId)
   - getServingUnits(foodId)
   - addServingUnit(foodId, unit)

3. Create service in `./src/domain/food/service.ts`:
   - validateNutrition(data) - fiber <= carbs, sugar <= carbs
   - calculateCalories(protein, carbs, fat) - P*4 + C*4 + F*9
   - convertToGrams(quantity, servingUnit) - using grams_equivalent
   - calculateNutritionForServing(food, quantity, unit)
   - formatNutritionDisplay(nutrition, locale) - for UI display
   - searchFoodsWithRelevance(query) - scoring algorithm

4. Write comprehensive tests in `./src/domain/food/__tests__/`:
   - `types.test.ts` - Nutrition validation
   - `service.test.ts` - Calculations, conversions
   - `repository.test.ts` - Search, CRUD, permissions
</requirements>

<implementation>
Search priority algorithm:
1. Exact match on name (highest score)
2. Starts with query (high score)
3. Contains query (medium score)
4. User's private foods get +10 boost
5. USDA foods get +5 boost
6. AI-generated get +0 boost

Calorie calculation:
- calories = (protein * 4) + (carbs * 4) + (fat * 9)
- Round to nearest integer

Validation rules:
- fiber_per_100g <= carbs_per_100g
- sugar_per_100g <= carbs_per_100g
- All nutrition values >= 0
- Name is required, max 200 chars
</implementation>

<output>
Create files:
- `./src/domain/food/types.ts`
- `./src/domain/food/repository.ts`
- `./src/domain/food/service.ts`
- `./src/domain/food/index.ts`
- `./src/domain/food/__tests__/types.test.ts`
- `./src/domain/food/__tests__/service.test.ts`
- `./src/domain/food/__tests__/repository.test.ts`
</output>

<verification>
Run tests before completing:
!npm test -- --testPathPattern="domain/food"

All tests must pass:
- Calorie calculation accuracy
- Serving unit conversions
- Search prioritization logic
- Nutrition validation (fiber/sugar <= carbs)
- Permission checks (private foods)
</verification>

<success_criteria>
- All tests pass
- Search returns properly prioritized results
- Nutrition calculations are accurate
- Validation prevents invalid data
- AI-generated foods properly flagged
</success_criteria>
