<objective>
Create the main application pages - the core experience users interact with daily.

These pages must be gorgeous, intuitive, and optimized for quick meal logging.
</objective>

<context>
@./src/components/ - All components
@./src/app/api/ - API routes
@./src/domain/ - Domain logic
@./src/i18n/ - Translations

App pages require authentication.
Home is the primary screen users see.
</context>

<requirements>
1. Create app layout:

   **`./src/app/(app)/layout.tsx`**:
   - Header with app name
   - BottomNav for mobile
   - Side nav for desktop (optional)
   - Auth protection
   - User context provider

2. Create home page (`/app`):

   **Core elements**:
   - DailySummaryCard (calories ring + macros)
   - QuickLogButtons (photo, text, manual)
   - MealsList (today's meals)
   - Pull-to-refresh

   **Visual hierarchy**:
   1. Calorie ring prominently displayed
   2. Quick action buttons easily accessible
   3. Meals list scrollable below

   **Interactions**:
   - Tap calorie ring → detailed breakdown
   - Tap quick log → respective flow
   - Tap meal → expand/edit

3. Create meal logging pages:

   **`/app/meals/add`**:
   - Tab/segment: Photo | Text | Manual
   - Photo: Camera access, base64 to AI
   - Text: Input field, AI parses
   - Manual: Food search, add items

   **`/app/meals/[id]`**:
   - Meal details
   - Edit items
   - Delete meal
   - Change meal type/time

   **`/app/meals/confirm`**:
   - AIParseResult display
   - Edit parsed items
   - Confirm to log

4. Create weight pages:

   **`/app/weight`**:
   - WeightChart
   - Recent logs list
   - Log weight FAB
   - Goal progress (if active)

   **`/app/weight/log`**:
   - WeightLogForm
   - Inline or bottom sheet

5. Create settings page:

   **`/app/settings`**:
   - Profile section
   - Preferences (units, language)
   - Goal management
   - Logout
   - About/version
</requirements>

<implementation>
Home page layout:
```typescript
export default function HomePage() {
  const { data: summary } = useQuery(['summary', 'today'], fetchTodaySummary);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero section with calorie ring */}
      <section className="bg-gradient-to-b from-primary-50 to-white p-6">
        <DailySummaryCard summary={summary} />
      </section>

      {/* Quick actions */}
      <section className="px-4 -mt-4">
        <QuickLogButtons />
      </section>

      {/* Today's meals */}
      <section className="flex-1 px-4 mt-6">
        <Text variant="h3">{t('meals.today')}</Text>
        <MealsList date={today} />
      </section>

      {/* Bottom nav handled by layout */}
    </div>
  );
}
```

Photo capture flow:
```typescript
async function handlePhotoCapture() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  // Capture frame
  // Convert to base64
  // Send to /api/ai/parse-photo
  // Navigate to /app/meals/confirm with result
}
```

Text input flow:
```typescript
async function handleTextSubmit(text: string) {
  const result = await parseTextMeal(text);
  if (result.confidence >= 0.7) {
    // Navigate to confirm
    router.push('/app/meals/confirm', { state: result });
  } else {
    // Show clarifying questions
    setShowClarification(true);
  }
}
```
</implementation>

<output>
Create files:
- `./src/app/(app)/layout.tsx`
- `./src/app/(app)/page.tsx` (home, redirects to /app for clarity)
- `./src/app/(app)/app/page.tsx` (actual home)
- `./src/app/(app)/app/meals/add/page.tsx`
- `./src/app/(app)/app/meals/[id]/page.tsx`
- `./src/app/(app)/app/meals/confirm/page.tsx`
- `./src/app/(app)/app/weight/page.tsx`
- `./src/app/(app)/app/weight/log/page.tsx`
- `./src/app/(app)/app/settings/page.tsx`
- `./src/app/(app)/app/settings/profile/page.tsx`
- `./src/app/(app)/app/settings/goals/page.tsx`
</output>

<verification>
Before completing:
1. Home page loads with summary
2. Quick log buttons open correct flows
3. Photo capture works on mobile
4. Text input parses correctly
5. Meals list updates after logging
6. Navigation is intuitive
</verification>

<success_criteria>
- Beautiful home page with calorie ring
- All three logging methods work
- Weight tracking functional
- Settings complete
- Smooth navigation
- Mobile-optimized
</success_criteria>
