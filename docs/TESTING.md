# VitAI Testing Guide

## Overview

VitAI uses a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API routes and database operations
- **E2E Tests**: Test complete user workflows

## Testing Stack

- **Vitest**: Fast unit and integration testing
- **Playwright**: End-to-end browser testing
- **Testing Library**: React component testing utilities

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your test credentials:

```bash
cp .env.example .env.local
```

Required variables for testing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`

### Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### All Tests

```bash
npm test
```

### Unit & Integration Tests Only

```bash
npm run test:unit
```

### E2E Tests Only

```bash
npm run test:e2e
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Test Structure

### Integration Tests (`src/__tests__/`)

#### API Integration Tests (`api.test.ts`)

Tests authentication, CRUD operations, and database interactions:

- **Authentication Flow**
  - User signup
  - User login
  - Invalid credentials
  - User logout

- **Meal Operations**
  - Create meal
  - Retrieve user meals
  - Update meal
  - Delete meal

- **Weight Logging**
  - Log weight entry
  - Retrieve weight history
  - Calculate weight change

- **User Profile**
  - Create profile
  - Update profile

#### AI Integration Tests (`ai.test.ts`)

Tests AI-powered features with mocked API responses:

- **Text Parsing**
  - Simple meal descriptions
  - Multiple items
  - Vague descriptions
  - Error handling

- **Photo Parsing** (Mocked)
  - Food photo analysis
  - Unrecognizable foods
  - Multiple items detection
  - Image validation

- **AI Suggestions**
  - Meal improvements
  - Alternative meals

### E2E Tests (`e2e/`)

#### Onboarding Flow (`onboarding.spec.ts`)

Tests complete user registration and onboarding:

- Complete signup and onboarding process
- Form validation
- Navigation between steps
- Goal calculation
- Network error handling

#### Meal Logging (`meal-logging.spec.ts`)

Tests meal logging workflows:

- Log meal via text input
- Manual nutrition entry
- Edit parsed meal data
- Update daily totals
- Delete and edit meals
- AI parsing errors

#### Weight Tracking (`weight-tracking.spec.ts`)

Tests weight management features:

- Log weight entry
- Input validation
- Weight history display
- Progress tracking
- Weight change trends
- BMI calculation

## Error Boundaries

### Global Error Boundary (`src/app/error.tsx`)

Catches unhandled errors at the root level:
- Displays user-friendly error message
- Provides retry and home navigation
- Logs error details for debugging

### App Error Boundary (`src/app/(app)/error.tsx`)

Catches errors within the authenticated app:
- Shows contextual error information
- Allows retry without full reload
- Navigation to dashboard

## Loading States

### Global Loading (`src/app/loading.tsx`)

Shows centered spinner during initial app load.

### App Loading (`src/app/(app)/loading.tsx`)

Shows navigation skeleton and loading spinner for app routes.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every PR and push to main:

### Jobs

1. **Lint and Type Check**
   - ESLint code quality
   - TypeScript type checking

2. **Unit & Integration Tests**
   - Runs vitest test suite
   - Uploads coverage to Codecov

3. **E2E Tests**
   - Builds production app
   - Runs Playwright tests across browsers
   - Uploads test reports

4. **Build Check**
   - Verifies production build succeeds
   - Checks bundle size

## Best Practices

### Writing Tests

1. **Use Descriptive Names**
   ```typescript
   it('should update daily totals after logging meal', async () => {
     // Test implementation
   });
   ```

2. **Follow AAA Pattern**
   - Arrange: Set up test data
   - Act: Perform action
   - Assert: Verify results

3. **Clean Up After Tests**
   ```typescript
   afterAll(async () => {
     await supabase.auth.admin.deleteUser(testUserId);
   });
   ```

4. **Mock External Services**
   ```typescript
   vi.mock('openai', () => ({
     // Mock implementation
   }));
   ```

5. **Test Edge Cases**
   - Empty inputs
   - Invalid data
   - Network failures
   - Concurrent operations

### E2E Test Tips

1. **Use Data Attributes for Selectors**
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for State Changes**
   ```typescript
   await expect(page).toHaveURL(/.*dashboard/);
   ```

3. **Isolate Tests**
   - Each test should be independent
   - Use unique test data per test

4. **Handle Timing Issues**
   ```typescript
   await page.waitForSelector('text=Success', { timeout: 10000 });
   ```

## Deployment Configuration

### Vercel Configuration (`vercel.json`)

- Framework: Next.js
- Region: Washington DC (iad1)
- Environment variables managed via Vercel dashboard
- Custom headers for API routes

### Environment Variables Setup

In Vercel dashboard, add the following secrets:

1. `vitai-supabase-url` → Your Supabase URL
2. `vitai-supabase-anon-key` → Supabase anon key
3. `vitai-supabase-service-key` → Supabase service role key
4. `vitai-openrouter-key` → OpenRouter API key

## Troubleshooting

### Tests Failing Locally

1. **Check environment variables**
   ```bash
   cat .env.local
   ```

2. **Verify Supabase connection**
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

3. **Clear test database**
   - Use Supabase dashboard to reset test data

### E2E Tests Timing Out

1. **Increase timeout**
   ```typescript
   test.setTimeout(30000); // 30 seconds
   ```

2. **Check dev server is running**
   ```bash
   npm run dev
   ```

3. **Verify browser installation**
   ```bash
   npx playwright install --with-deps
   ```

### CI/CD Failures

1. **Check GitHub Secrets**
   - Verify all secrets are set in repository settings

2. **Review workflow logs**
   - Check detailed error messages in Actions tab

3. **Test locally first**
   ```bash
   npm run build && npm run test:e2e
   ```

## Coverage Goals

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Additional Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Next.js Testing](https://nextjs.org/docs/testing)
