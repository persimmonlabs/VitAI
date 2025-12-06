<objective>
Create the organisms layer of the atomic design system.

Organisms are complex UI components that form distinct sections of the interface. They combine molecules and atoms into feature-complete units.
</objective>

<context>
@./src/components/atoms/ - Atom components
@./src/components/molecules/ - Molecule components
@./src/domain/ - Domain types
@./src/i18n/ - Translations

Organisms handle their own state and may call APIs.
</context>

<requirements>
1. Create organisms in `./src/components/organisms/`:

   **Header.tsx**:
   - App logo/name
   - Navigation (if applicable)
   - User avatar + menu
   - Mobile hamburger menu

   **BottomNav.tsx**:
   - Mobile bottom navigation
   - 4-5 main sections
   - Active state indicator
   - Safe area padding

   **DailySummaryCard.tsx**:
   - CalorieRing (consumed/target)
   - MacroDisplay (P/C/F)
   - Remaining calories
   - Tap to see breakdown

   **MealCard.tsx**:
   - Meal type header
   - List of MealItemRows
   - Total calories
   - Add item button
   - Edit/delete meal actions

   **MealsList.tsx**:
   - Groups meals by type
   - Today's meals overview
   - Empty state when no meals
   - Pull-to-refresh

   **FoodSearch.tsx**:
   - SearchInput
   - Results list (FoodListItem)
   - Loading/empty states
   - Recent foods section
   - Create custom food option

   **AddMealForm.tsx**:
   - Food search integration
   - Selected items list
   - Quantity editing
   - Meal type selector
   - Total macros preview
   - Save button

   **QuickLogButtons.tsx**:
   - Photo button (camera)
   - Text button (type meal)
   - Manual button (search)
   - Voice button (future)

   **AIParseResult.tsx**:
   - Parsed foods display
   - Confidence indicators
   - Edit quantities
   - Clarifying questions
   - Confirm/cancel

   **WeightChart.tsx**:
   - Line chart of weight over time
   - Selectable time range (7d, 30d, 90d)
   - Goal line overlay
   - Tap to see details

   **WeightLogForm.tsx**:
   - NumberInput for weight
   - Unit toggle (kg/lbs)
   - Date picker (default today)
   - Save button

   **GoalProgress.tsx**:
   - Progress bar to target
   - Current vs target weight
   - Estimated completion
   - On-track indicator

   **OnboardingStep.tsx**:
   - Step indicator
   - Form content slot
   - Back/Next buttons
   - Skip option (where applicable)

   **SettingsSection.tsx**:
   - Section title
   - List of setting rows
   - Toggles, selects, links
</requirements>

<implementation>
State management pattern:
```typescript
// Use React Query for server state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function MealsList({ date }: { date: string }) {
  const { data: meals, isLoading } = useQuery({
    queryKey: ['meals', date],
    queryFn: () => fetchMeals(date)
  });

  if (isLoading) return <MealsListSkeleton />;
  if (!meals?.length) return <EmptyState message={t('meals.noMeals')} />;

  return (
    <div className="space-y-4">
      {meals.map(meal => <MealCard key={meal.id} meal={meal} />)}
    </div>
  );
}
```

Mobile-first layout:
```typescript
// Full screen on mobile, card on desktop
<div className="fixed inset-0 md:relative md:inset-auto md:max-w-md md:mx-auto md:rounded-xl">
```
</implementation>

<output>
Create files:
- `./src/components/organisms/Header.tsx`
- `./src/components/organisms/BottomNav.tsx`
- `./src/components/organisms/DailySummaryCard.tsx`
- `./src/components/organisms/MealCard.tsx`
- `./src/components/organisms/MealsList.tsx`
- `./src/components/organisms/FoodSearch.tsx`
- `./src/components/organisms/AddMealForm.tsx`
- `./src/components/organisms/QuickLogButtons.tsx`
- `./src/components/organisms/AIParseResult.tsx`
- `./src/components/organisms/WeightChart.tsx`
- `./src/components/organisms/WeightLogForm.tsx`
- `./src/components/organisms/GoalProgress.tsx`
- `./src/components/organisms/OnboardingStep.tsx`
- `./src/components/organisms/SettingsSection.tsx`
- `./src/components/organisms/index.ts`
</output>

<verification>
Before completing:
1. Organisms compose correctly
2. API integration works
3. Loading/error states handled
4. Mobile layout is full-screen where appropriate
5. Keyboard accessible
</verification>

<success_criteria>
- All organisms created
- Proper data fetching with React Query
- Mobile-optimized layouts
- Smooth interactions
- Complete i18n
</success_criteria>
