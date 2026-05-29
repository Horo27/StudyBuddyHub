import { test, expect } from '@playwright/test';

test.describe('Payment pages', () => {
  test('/payment/success page loads without crash', async ({ page }) => {
    await page.goto('/payment/success');
    // The page renders a card with a success heading — just assert something visible
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });

  test('/payment/cancel page loads without crash', async ({ page }) => {
    await page.goto('/payment/cancel');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });
});
