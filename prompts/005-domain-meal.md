<objective>
Implement the Meal domain - the core of the nutrition tracking functionality.

This domain handles meal logging, meal items, daily summaries, and nutrition aggregation. Tests MUST pass before moving to the next domain.
</objective>

<context>
@./supabase/migrations/001_initial_schema.sql - Database schema
@./src/domain/food/ - Food domain for nutrition data
@./src/domain/user/ - User domain for preferences

Meal types: breakfast, lunch, dinner, snack, pre_workout, post_workout, or null (no type)
</context>

<requirements>
1. Create domain types in `./src/domain/meal/types.ts`:
   ```typescript
   - Meal entity with totals
   - MealItem entity with calculated nutrition
   - MealType enum (breakfast, lunch, dinner, snack, pre_workout, post_workout)
   - DailySummary aggregate
   - CreateMealInput, UpdateMealInput
   - AddMealItemInput
   ```

2. Create repository in `./src/domain/meal/repository.ts`:
   - createMeal(userId, data)
   - getMealById(id, userId)
   - getMealsForDate(userId, date)
   - getMealsForDateRange(userId, startDate, endDate)
   - updateMeal(id, userId, data)
   - deleteMeal(id, userId)
   - addMealItem(mealId, data)
   - updateMealItem(itemId, data)
   - removeMealItem(itemId)
   - getDailySummary(userId, date)

3. Create service in `./src/domain/meal/service.ts`:
   - calculateMealTotals(mealItems) - sum nutrition
   - calculateDailySummary(meals) - aggregate all meals
   - inferMealType(timestamp, userTimezone) - based on time of day
   - validateMealItems(items) - at least one item required
   - getMacroPercentages(totals) - protein/carbs/fat percentages
   - getRemainingCalories(consumed, target)
   - formatMealForDisplay(meal, locale)

4. Write comprehensive tests in `./src/domain/meal/__tests__/`:
   - `types.test.ts` - Meal structure validation
   - `service.test.ts` - Calculations, meal type inference
   - `repository.test.ts` - CRUD, date filtering
</requirements>

<implementation>
Meal type inference by hour (user's local time):
- 05:00 - 10:59: breakfast
- 11:00 - 13:59: lunch
- 14:00 - 16:59: snack
- 17:00 - 20:59: dinner
- 21:00 - 04:59: snack

Daily summary structure:
```typescript
{
  date: string,
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  totalFiber: number,
  mealCount: number,
  meals: MealSummary[],
  calorieTarget: number,
  remainingCalories: number,
  macroPercentages: { protein: number, carbs: number, fat: number }
}
```

Macro percentages calculation:
- Total calories from macros = (P*4) + (C*4) + (F*9)
- Protein % = (P*4 / total) * 100
- Carbs % = (C*4 / total) * 100
- Fat % = (F*9 / total) * 100
</implementation>

<output>
Create files:
- `./src/domain/meal/types.ts`
- `./src/domain/meal/repository.ts`
- `./src/domain/meal/service.ts`
- `./src/domain/meal/index.ts`
- `./src/domain/meal/__tests__/types.test.ts`
- `./src/domain/meal/__tests__/service.test.ts`
- `./src/domain/meal/__tests__/repository.test.ts`
</output>

<verification>
Run tests before completing:
!npm test -- --testPathPattern="domain/meal"

All tests must pass:
- Meal total calculations
- Daily summary aggregation
- Meal type inference across timezones
- Macro percentage calculations
- Empty meal validation
</verification>

<success_criteria>
- All tests pass
- Meal totals calculated accurately
- Daily summaries aggregate correctly
- Meal type inference works across timezones
- Validation prevents empty meals
</success_criteria>
