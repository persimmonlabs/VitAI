import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  test('should complete full signup and onboarding process', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/');
    await page.click('text=Get Started');

    // Fill signup form
    await expect(page).toHaveURL(/.*signup/);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/, { timeout: 10000 });

    // Step 1: Personal Information
    await expect(page.locator('h1')).toContainText('Personal Information');

    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '80');
    await page.click('button:has-text("Next")');

    // Step 2: Activity Level
    await expect(page.locator('h1')).toContainText('Activity Level');

    await page.click('text=Moderately Active');
    await page.click('button:has-text("Next")');

    // Step 3: Goals
    await expect(page.locator('h1')).toContainText('Your Goals');

    await page.click('text=Lose Weight');
    await page.fill('input[name="targetWeight"]', '75');
    await page.click('button:has-text("Next")');

    // Step 4: Review and Calculate
    await expect(page.locator('h1')).toContainText('Review');

    // Verify calculated goals are displayed
    await expect(page.locator('text=Daily Calorie Goal')).toBeVisible();
    await expect(page.locator('text=Protein Goal')).toBeVisible();

    await page.click('button:has-text("Complete Setup")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should validate required fields in onboarding', async ({ page }) => {
    // Create account and go to onboarding
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*onboarding/);

    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=Age is required')).toBeVisible();
    await expect(page.locator('text=Height is required')).toBeVisible();
    await expect(page.locator('text=Weight is required')).toBeVisible();
  });

  test('should allow going back in onboarding steps', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*onboarding/);

    // Fill first step
    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '80');
    await page.click('button:has-text("Next")');

    // Go to second step
    await page.click('text=Moderately Active');
    await page.click('button:has-text("Next")');

    // Go back
    await page.click('button:has-text("Back")');

    // Should be on activity level step with selection preserved
    await expect(page.locator('h1')).toContainText('Activity Level');
    await expect(page.locator('text=Moderately Active')).toHaveClass(/selected|active/);
  });

  test('should calculate appropriate goals based on user input', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*onboarding/);

    // Complete onboarding with specific values
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="gender"]', 'female');
    await page.fill('input[name="height"]', '165');
    await page.fill('input[name="weight"]', '65');
    await page.click('button:has-text("Next")');

    await page.click('text=Lightly Active');
    await page.click('button:has-text("Next")');

    await page.click('text=Lose Weight');
    await page.fill('input[name="targetWeight"]', '60');
    await page.click('button:has-text("Next")');

    // Check that calorie goal is reasonable for weight loss
    const calorieGoal = await page.locator('text=/Daily Calorie Goal.*\\d+/').textContent();
    const calories = parseInt(calorieGoal?.match(/\d+/)?.[0] || '0');

    expect(calories).toBeGreaterThan(1200); // Should not be too low
    expect(calories).toBeLessThan(2000); // Should be in deficit for weight loss
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/network error|offline|connection/i')).toBeVisible({ timeout: 5000 });

    // Restore connection
    await page.context().setOffline(false);
  });
});
