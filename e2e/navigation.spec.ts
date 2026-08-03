import { test, expect } from '@playwright/test';

test.describe('Navigation & Locale', () => {
  test('root redirects to a locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(en|id)(\/|$)/);
  });

  test('homepage renders hero title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('destination detail page loads with interactive map section', async ({ page }) => {
    await page.goto('/destinations/candi-prambanan');
    await expect(page).toHaveURL(/\/destinations\/candi-prambanan/);
    await expect(page.locator('#interactive-map-section')).toBeVisible();
  });
});
