<objective>
Final polish: integration tests, E2E tests, error boundaries, loading states, and deployment configuration.

This prompt ensures the app is production-ready.
</objective>

<context>
@./src/ - All source code
@./supabase/ - Database migrations

The app should be deployable to Vercel with:
- Supabase project configured
- OpenRouter API key set
- Environment variables in place
</context>

<requirements>
1. Create integration tests in `./src/__tests__/`:

   **api.test.ts**:
   - Test auth flow (register → login → profile)
   - Test meal CRUD
   - Test weight logging
   - Test daily summary

   **ai.test.ts**:
   - Test text parsing
   - Test photo parsing (mock)
   - Test clarification flow
   - Test food creation

2. Create E2E tests in `./e2e/`:

   **onboarding.spec.ts**:
   - Complete signup and onboarding
   - Verify profile created

   **meal-logging.spec.ts**:
   - Log meal via text
   - Log meal via manual entry
   - Edit meal
   - Delete meal

   **weight-tracking.spec.ts**:
   - Log weight
   - View trend
   - Create goal

3. Add error boundaries:

   **`./src/app/error.tsx`**:
   - Global error boundary
   - Friendly error message
   - Retry button
   - Report issue link

   **`./src/app/(app)/error.tsx`**:
   - App-specific errors
   - Maintain navigation

4. Add loading states:

   **`./src/app/loading.tsx`**:
   - Global loading
   - App shell skeleton

   **`./src/app/(app)/loading.tsx`**:
   - App loading with nav

5. Ensure all loading states:
   - Skeleton loaders for lists
   - Spinner for buttons
   - Progress for uploads

6. Create deployment config:

   **`./vercel.json`**:
   - Build settings
   - Environment variable references
   - Redirects if needed

   **`.env.example`** (update):
   - All required variables documented
   - Instructions for each

   **`./DEPLOYMENT.md`**:
   - Step-by-step deployment guide
   - Supabase setup
   - Vercel deployment
   - Post-deployment checklist

7. Create CI/CD workflow:

   **`.github/workflows/ci.yml`**:
   - Run on PR and push to main
   - Install dependencies
   - Run type check
   - Run unit tests
   - Run integration tests

   **`.github/workflows/e2e.yml`**:
   - Run E2E on push to main
   - Deploy preview for PRs

8. Final polish checklist:
   - [ ] All pages have loading states
   - [ ] All API errors handled
   - [ ] All forms validate
   - [ ] Mobile responsive everywhere
   - [ ] PWA works offline (basic)
   - [ ] i18n complete
   - [ ] Accessibility audit
   - [ ] Performance audit
</requirements>

<implementation>
Error boundary pattern:
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Icon name="alert-circle" size="lg" className="text-red-500" />
      <Text variant="h2" className="mt-4">{t('errors.somethingWentWrong')}</Text>
      <Text className="mt-2 text-gray-600">{t('errors.tryAgain')}</Text>
      <Button onClick={reset} className="mt-6">{t('common.retry')}</Button>
    </div>
  );
}
```

CI workflow:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
      - run: npm run test:integration
```
</implementation>

<output>
Create files:
- `./src/__tests__/api.test.ts`
- `./src/__tests__/ai.test.ts`
- `./e2e/onboarding.spec.ts`
- `./e2e/meal-logging.spec.ts`
- `./e2e/weight-tracking.spec.ts`
- `./playwright.config.ts`
- `./src/app/error.tsx`
- `./src/app/loading.tsx`
- `./src/app/(app)/error.tsx`
- `./src/app/(app)/loading.tsx`
- `./vercel.json`
- `./DEPLOYMENT.md`
- `./.github/workflows/ci.yml`
- `./.github/workflows/e2e.yml`
</output>

<verification>
Before completing:
1. All tests pass: `npm test`
2. Type check passes: `npm run typecheck`
3. Build succeeds: `npm run build`
4. App runs locally with all features
5. Deployment guide is accurate
</verification>

<success_criteria>
- All tests pass
- No TypeScript errors
- Build succeeds
- Error boundaries catch errors
- Loading states everywhere
- CI/CD configured
- Deployment documented
- App is production-ready
</success_criteria>
