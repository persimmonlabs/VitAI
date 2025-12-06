import { test, expect } from '@playwright/test';

test.describe('Meal Logging', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    // Sign up and complete onboarding
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Quick onboarding
    await page.waitForURL(/.*onboarding/);
    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '80');
    await page.click('button:has-text("Next")');
    await page.click('text=Moderately Active');
    await page.click('button:has-text("Next")');
    await page.click('text=Maintain Weight');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Complete Setup")');

    await page.waitForURL(/.*dashboard/);
  });

  test('should log meal via text input', async ({ page }) => {
    // Navigate to meal logging
    await page.click('text=Log Meal');

    // Switch to text input tab
    await page.click('text=Text Input');

    // Enter meal description
    await page.fill('textarea[name="mealDescription"]', 'Grilled chicken breast 200g with brown rice 150g and broccoli 100g');

    // Click parse button
    await page.click('button:has-text("Parse Meal")');

    // Wait for AI parsing
    await expect(page.locator('text=Parsing...')).toBeVisible();
    await expect(page.locator('text=Parsing...')).not.toBeVisible({ timeout: 15000 });

    // Verify parsed data is displayed
    await expect(page.locator('input[name="name"]')).toHaveValue(/chicken|meal/i);
    await expect(page.locator('input[name="calories"]')).not.toHaveValue('0');
    await expect(page.locator('input[name="protein"]')).not.toHaveValue('0');

    // Select meal type
    await page.selectOption('select[name="mealType"]', 'lunch');

    // Submit meal
    await page.click('button:has-text("Log Meal")');

    // Should show success message
    await expect(page.locator('text=/logged successfully|meal added/i')).toBeVisible();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify meal appears in today's meals
    await expect(page.locator('text=/chicken|meal/i')).toBeVisible();
  });

  test('should allow manual nutrition entry', async ({ page }) => {
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');

    // Fill in meal details
    await page.fill('input[name="name"]', 'Protein Shake');
    await page.fill('textarea[name="description"]', 'Whey protein with almond milk');
    await page.fill('input[name="calories"]', '250');
    await page.fill('input[name="protein"]', '30');
    await page.fill('input[name="carbs"]', '15');
    await page.fill('input[name="fat"]', '8');
    await page.selectOption('select[name="mealType"]', 'snack');

    await page.click('button:has-text("Log Meal")');

    await expect(page.locator('text=/logged successfully/i')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Protein Shake')).toBeVisible();
  });

  test('should validate meal data before submission', async ({ page }) => {
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');

    // Try to submit without required fields
    await page.click('button:has-text("Log Meal")');

    // Should show validation errors
    await expect(page.locator('text=Meal name is required')).toBeVisible();
    await expect(page.locator('text=Calories are required')).toBeVisible();
  });

  test('should edit parsed meal data before saving', async ({ page }) => {
    await page.click('text=Log Meal');
    await page.click('text=Text Input');

    await page.fill('textarea[name="mealDescription"]', 'Oatmeal with banana');
    await page.click('button:has-text("Parse Meal")');

    // Wait for parsing
    await expect(page.locator('text=Parsing...')).not.toBeVisible({ timeout: 15000 });

    // Edit the parsed values
    await page.fill('input[name="calories"]', '350');
    await page.fill('input[name="protein"]', '10');
    await page.fill('input[name="carbs"]', '65');
    await page.fill('input[name="fat"]', '7');

    await page.selectOption('select[name="mealType"]', 'breakfast');
    await page.click('button:has-text("Log Meal")');

    await expect(page).toHaveURL(/.*dashboard/);

    // Verify edited values were saved
    const mealCard = page.locator('text=/oatmeal/i').locator('..');
    await expect(mealCard.locator('text=350')).toBeVisible();
  });

  test('should show meal in correct time category', async ({ page }) => {
    // Log breakfast
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');
    await page.fill('input[name="name"]', 'Morning Oats');
    await page.fill('input[name="calories"]', '300');
    await page.fill('input[name="protein"]', '10');
    await page.fill('input[name="carbs"]', '50');
    await page.fill('input[name="fat"]', '8');
    await page.selectOption('select[name="mealType"]', 'breakfast');
    await page.click('button:has-text("Log Meal")');

    await page.waitForURL(/.*dashboard/);

    // Check it appears under breakfast section
    const breakfastSection = page.locator('h2:has-text("Breakfast")').locator('..');
    await expect(breakfastSection.locator('text=Morning Oats')).toBeVisible();
  });

  test('should update daily totals after logging meal', async ({ page }) => {
    // Get initial totals
    const initialCalories = await page.locator('text=/Total.*Calories/').textContent();

    // Log a meal
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');
    await page.fill('input[name="name"]', 'Test Meal');
    await page.fill('input[name="calories"]', '500');
    await page.fill('input[name="protein"]', '30');
    await page.fill('input[name="carbs"]', '50');
    await page.fill('input[name="fat"]', '20');
    await page.selectOption('select[name="mealType"]', 'lunch');
    await page.click('button:has-text("Log Meal")');

    await page.waitForURL(/.*dashboard/);

    // Check that totals updated
    const newCalories = await page.locator('text=/Total.*Calories/').textContent();
    expect(newCalories).not.toBe(initialCalories);

    // Should show 500 calories added
    await expect(page.locator('text=/500.*cal/i')).toBeVisible();
  });

  test('should delete meal', async ({ page }) => {
    // Log a meal first
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');
    await page.fill('input[name="name"]', 'Meal to Delete');
    await page.fill('input[name="calories"]', '400');
    await page.fill('input[name="protein"]', '25');
    await page.fill('input[name="carbs"]', '40');
    await page.fill('input[name="fat"]', '15');
    await page.selectOption('select[name="mealType"]', 'dinner');
    await page.click('button:has-text("Log Meal")');

    await page.waitForURL(/.*dashboard/);

    // Find and delete the meal
    const mealCard = page.locator('text=Meal to Delete').locator('..');
    await mealCard.locator('button[aria-label="Delete meal"]').click();

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Meal should be gone
    await expect(page.locator('text=Meal to Delete')).not.toBeVisible();
  });

  test('should edit existing meal', async ({ page }) => {
    // Log a meal
    await page.click('text=Log Meal');
    await page.click('text=Manual Entry');
    await page.fill('input[name="name"]', 'Original Meal');
    await page.fill('input[name="calories"]', '400');
    await page.fill('input[name="protein"]', '25');
    await page.fill('input[name="carbs"]', '40');
    await page.fill('input[name="fat"]', '15');
    await page.selectOption('select[name="mealType"]', 'lunch');
    await page.click('button:has-text("Log Meal")');

    await page.waitForURL(/.*dashboard/);

    // Edit the meal
    const mealCard = page.locator('text=Original Meal').locator('..');
    await mealCard.locator('button[aria-label="Edit meal"]').click();

    // Update values
    await page.fill('input[name="name"]', 'Updated Meal');
    await page.fill('input[name="calories"]', '450');
    await page.click('button:has-text("Save Changes")');

    // Verify updates
    await expect(page.locator('text=Updated Meal')).toBeVisible();
    await expect(page.locator('text=450')).toBeVisible();
  });

  test('should handle AI parsing errors gracefully', async ({ page }) => {
    await page.click('text=Log Meal');
    await page.click('text=Text Input');

    // Enter nonsense that AI can't parse
    await page.fill('textarea[name="mealDescription"]', 'asdfghjkl qwerty 12345');
    await page.click('button:has-text("Parse Meal")');

    // Should show error or low confidence warning
    await expect(page.locator('text=/could not parse|unable to identify|try again/i')).toBeVisible({ timeout: 15000 });
  });
});
