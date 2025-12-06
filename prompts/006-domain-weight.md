<objective>
Implement the Weight domain for body weight tracking and goal management.

This domain handles weight logging, trends, goal progress, and unit conversions. Tests MUST pass before moving to the next domain.
</objective>

<context>
@./supabase/migrations/001_initial_schema.sql - Database schema
@./src/domain/user/ - User domain for unit preferences

Weight tracking requirements:
- Log weight with timestamp
- Support kg and lbs
- Track trends over time
- Goal progress calculation
</context>

<requirements>
1. Create domain types in `./src/domain/weight/types.ts`:
   ```typescript
   - WeightLog entity
   - WeightUnit enum (kg, lbs)
   - WeightTrend aggregate
   - Goal entity
   - GoalType enum (weight_loss, weight_gain, maintenance)
   - GoalStatus enum (active, completed, abandoned)
   - CreateWeightLogInput
   - CreateGoalInput, UpdateGoalInput
   ```

2. Create repository in `./src/domain/weight/repository.ts`:
   - logWeight(userId, data)
   - getWeightLogs(userId, options) - with date range, limit
   - getLatestWeight(userId)
   - getWeightTrend(userId, days)
   - createGoal(userId, data)
   - getActiveGoal(userId)
   - updateGoal(goalId, data)
   - archiveGoal(goalId, status)

3. Create service in `./src/domain/weight/service.ts`:
   - convertWeight(value, from, to)
   - calculateWeightChange(logs) - change over period
   - calculateWeeklyRate(logs) - average weekly change
   - calculateGoalProgress(goal, currentWeight)
   - estimateGoalCompletion(goal, weeklyRate)
   - isOnTrack(goal, currentWeight, weeklyRate)
   - suggestCalorieAdjustment(goal, weeklyRate)
   - formatWeightForDisplay(weight, unit, locale)
   - getWeightStatistics(logs) - min, max, avg, change

4. Write comprehensive tests in `./src/domain/weight/__tests__/`:
   - `types.test.ts` - Weight and goal validation
   - `service.test.ts` - Calculations, conversions
   - `repository.test.ts` - Logging, trends, goals
</requirements>

<implementation>
Weight conversion:
- 1 kg = 2.20462 lbs
- Round to 1 decimal place

Goal progress calculation:
- For weight_loss: progress = (start - current) / (start - target)
- For weight_gain: progress = (current - start) / (target - start)
- For maintenance: progress = 1.0 if within 2% of target, else calculate

Weekly rate calculation:
- Take logs from last 2+ weeks
- Calculate linear regression slope
- Express as change per week

On-track determination:
- weight_loss: on track if losing 0.5-1% body weight per week
- weight_gain: on track if gaining 0.25-0.5% body weight per week
- maintenance: on track if within ±2% of target

Calorie adjustment suggestions:
- Losing too fast (>1.5%/week): increase by 200-300 cal
- Losing too slow (<0.25%/week): decrease by 200-300 cal
- Gaining too fast: decrease by 200-300 cal
- Gaining too slow: increase by 200-300 cal
</implementation>

<output>
Create files:
- `./src/domain/weight/types.ts`
- `./src/domain/weight/repository.ts`
- `./src/domain/weight/service.ts`
- `./src/domain/weight/index.ts`
- `./src/domain/weight/__tests__/types.test.ts`
- `./src/domain/weight/__tests__/service.test.ts`
- `./src/domain/weight/__tests__/repository.test.ts`
</output>

<verification>
Run tests before completing:
!npm test -- --testPathPattern="domain/weight"

All tests must pass:
- Weight unit conversions
- Goal progress calculations
- Weekly rate calculations
- On-track determinations
- Calorie adjustment suggestions
</verification>

<success_criteria>
- All tests pass
- Weight conversions accurate
- Goal progress calculated correctly
- Trend analysis works with limited data
- Calorie suggestions are reasonable
</success_criteria>
