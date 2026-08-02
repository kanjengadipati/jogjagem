import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const ADMIN = process.env.PLAYWRIGHT_ADMIN_URL || 'http://localhost:3002';
const STATE = '.auth/admin.json';
const enabled =
  !!process.env.E2E_ADMIN_EMAIL &&
  !!process.env.E2E_ADMIN_PASSWORD &&
  fs.existsSync(STATE);

test.describe('Admin Portal — Authenticated (superadmin)', () => {
  test.skip(
    !enabled,
    'set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test.use({ storageState: STATE });

  test('admin dashboard loads with sidebar', async ({ page }) => {
    await page.goto(`${ADMIN}/dashboard`);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('aside')).toBeVisible();
  });

  test('pending partner applications page loads', async ({ page }) => {
    await page.goto(`${ADMIN}/partner-applications`);
    await expect(page).toHaveURL(/\/partner-applications/);
    await expect(page.getByRole('heading', { name: 'Business Claims — Pending Review' })).toBeVisible();
  });

  test('business claims page loads', async ({ page }) => {
    await page.goto(`${ADMIN}/business-claims`);
    await expect(page).toHaveURL(/\/business-claims/);
    await expect(page.getByRole('heading', { name: 'Business Listing Claims Review' })).toBeVisible();
  });
});
