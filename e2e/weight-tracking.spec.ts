import { test, expect } from '@playwright/test';

test.describe('Weight Tracking', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    // Sign up and complete onboarding
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*onboarding/);

    // Complete onboarding
    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '80');
    await page.click('button:has-text("Next")');
    await page.click('text=Moderately Active');
    await page.click('button:has-text("Next")');
    await page.click('text=Lose Weight');
    await page.fill('input[name="targetWeight"]', '75');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Complete Setup")');

    await page.waitForURL(/.*dashboard/);
  });

  test('should log weight entry', async ({ page }) => {
    // Navigate to weight tracking
    await page.click('text=Weight');

    // Fill in weight
    await page.fill('input[name="weight"]', '79.5');

    // Optional: select date (defaults to today)
    // await page.fill('input[name="date"]', '2024-01-15');

    // Submit
    await page.click('button:has-text("Log Weight")');

    // Should show success message
    await expect(page.locator('text=/weight logged|recorded successfully/i')).toBeVisible();

    // Should see weight in history
    await expect(page.locator('text=79.5')).toBeVisible();
  });

  test('should validate weight input', async ({ page }) => {
    await page.click('text=Weight');

    // Try to submit without weight
    await page.click('button:has-text("Log Weight")');

    await expect(page.locator('text=/weight is required/i')).toBeVisible();

    // Try invalid weight (too low)
    await page.fill('input[name="weight"]', '30');
    await page.click('button:has-text("Log Weight")');

    await expect(page.locator('text=/invalid weight|too low/i')).toBeVisible();

    // Try invalid weight (too high)
    await page.fill('input[name="weight"]', '300');
    await page.click('button:has-text("Log Weight")');

    await expect(page.locator('text=/invalid weight|too high/i')).toBeVisible();
  });

  test('should display weight history', async ({ page }) => {
    await page.click('text=Weight');

    // Log multiple weights
    const weights = ['80', '79.5', '79', '78.5'];

    for (const weight of weights) {
      await page.fill('input[name="weight"]', weight);
      await page.click('button:has-text("Log Weight")');
      await page.waitForTimeout(500); // Small delay between entries
    }

    // Should show all entries in history
    for (const weight of weights) {
      await expect(page.locator(`text=${weight}`)).toBeVisible();
    }

    // Should show most recent first
    const firstEntry = page.locator('.weight-history-item').first();
    await expect(firstEntry).toContainText('78.5');
  });

  test('should show weight change trend', async ({ page }) => {
    await page.click('text=Weight');

    // Log initial weight
    await page.fill('input[name="weight"]', '80');
    await page.click('button:has-text("Log Weight")');

    await page.waitForTimeout(1000);

    // Log lower weight
    await page.fill('input[name="weight"]', '78');
    await page.click('button:has-text("Log Weight")');

    // Should show weight loss indicator
    await expect(page.locator('text=/-2|down 2|lost 2/i')).toBeVisible();

    // Should show downward trend icon or indicator
    await expect(page.locator('[aria-label*="down"]')).toBeVisible();
  });

  test('should display weight chart', async ({ page }) => {
    await page.click('text=Weight');

    // Log several weights to populate chart
    const weights = ['80', '79.5', '79', '78.5', '78'];

    for (const weight of weights) {
      await page.fill('input[name="weight"]', weight);
      await page.click('button:has-text("Log Weight")');
      await page.waitForTimeout(500);
    }

    // Check for chart element
    await expect(page.locator('canvas')).toBeVisible();

    // Or if using SVG chart
    // await expect(page.locator('svg.weight-chart')).toBeVisible();
  });

  test('should show progress toward goal', async ({ page }) => {
    // Starting weight was 80kg, goal is 75kg
    await page.click('text=Weight');

    // Log current weight
    await page.fill('input[name="weight"]', '77');
    await page.click('button:has-text("Log Weight")');

    // Should show progress
    await expect(page.locator('text=/60%|3 kg lost|2 kg to go/i')).toBeVisible();

    // Should show progress bar
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();

    // Check progress bar value (should be around 60%)
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressValue || '0')).toBeGreaterThan(50);
  });

  test('should edit weight entry', async ({ page }) => {
    await page.click('text=Weight');

    // Log weight
    await page.fill('input[name="weight"]', '79');
    await page.click('button:has-text("Log Weight")');

    // Edit the entry
    await page.locator('.weight-history-item').first().locator('button[aria-label="Edit"]').click();

    await page.fill('input[name="weight"]', '78.8');
    await page.click('button:has-text("Save")');

    // Should show updated weight
    await expect(page.locator('text=78.8')).toBeVisible();
    await expect(page.locator('text=79').and(page.locator('.weight-history-item'))).not.toBeVisible();
  });

  test('should delete weight entry', async ({ page }) => {
    await page.click('text=Weight');

    // Log weight
    await page.fill('input[name="weight"]', '79');
    await page.click('button:has-text("Log Weight")');

    // Delete the entry
    await page.locator('.weight-history-item').first().locator('button[aria-label="Delete"]').click();

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Entry should be gone
    await expect(page.locator('text=79').and(page.locator('.weight-history-item'))).not.toBeVisible();
  });

  test('should filter weight history by date range', async ({ page }) => {
    await page.click('text=Weight');

    // Log weights over "different days" (in test, they'll all be today)
    const weights = ['80', '79.5', '79', '78.5', '78'];

    for (const weight of weights) {
      await page.fill('input[name="weight"]', weight);
      await page.click('button:has-text("Log Weight")');
      await page.waitForTimeout(500);
    }

    // Apply date filter (last 7 days)
    await page.click('text=Filter');
    await page.click('text=Last 7 days');

    // Should show filtered results
    await expect(page.locator('.weight-history-item')).toHaveCount(5);

    // Change to last 30 days
    await page.click('text=Filter');
    await page.click('text=Last 30 days');

    await expect(page.locator('.weight-history-item')).toHaveCount(5);
  });

  test('should show motivational message on progress', async ({ page }) => {
    await page.click('text=Weight');

    // Log weight showing progress
    await page.fill('input[name="weight"]', '76');
    await page.click('button:has-text("Log Weight")');

    // Should show encouraging message
    await expect(page.locator('text=/great progress|keep it up|on track/i')).toBeVisible();
  });

  test('should calculate and display BMI', async ({ page }) => {
    // Height was set to 175cm in onboarding
    await page.click('text=Weight');

    await page.fill('input[name="weight"]', '75');
    await page.click('button:has-text("Log Weight")');

    // BMI = 75 / (1.75^2) = 24.5
    await expect(page.locator('text=/BMI.*24/i')).toBeVisible();

    // Should show BMI category
    await expect(page.locator('text=/normal weight|healthy/i')).toBeVisible();
  });

  test('should export weight data', async ({ page }) => {
    await page.click('text=Weight');

    // Log some weights
    await page.fill('input[name="weight"]', '79');
    await page.click('button:has-text("Log Weight")');

    await page.waitForTimeout(500);

    await page.fill('input[name="weight"]', '78.5');
    await page.click('button:has-text("Log Weight")');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/weight.*\.csv|weight.*\.json/i);
  });
});
