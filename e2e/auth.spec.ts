import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const STATE = '.auth/user.json';
const enabled =
  !!process.env.E2E_USER_EMAIL &&
  !!process.env.E2E_USER_PASSWORD &&
  fs.existsSync(STATE);

test.describe('Web App — Authenticated (E2E user)', () => {
  test.skip(
    !enabled,
    'set E2E_USER_EMAIL + E2E_USER_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test.use({ storageState: STATE });

  test('business page shows the authenticated dashboard', async ({ page }) => {
    await page.goto('/business');
    await expect(page.getByRole('heading', { name: 'Daftar Bisnis Saya' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tambah Bisnis', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk / Daftar Akun' })).toHaveCount(0);
  });

  test('creates a business via the UI', async ({ page }) => {
    const bizName = `E2E Biz ${Date.now()}`;

    await page.goto('/business');
    await page.getByRole('button', { name: 'Tambah Bisnis', exact: true }).click();
    await page.getByPlaceholder('Contoh: Gudeg Pawon Jogja').fill(bizName);
    await page.getByRole('button', { name: 'Daftarkan Bisnis' }).click();

    await expect(page.getByText(/berhasil didaftarkan/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(bizName, { exact: true })).toBeVisible();
  });

  test('claim page shows the authenticated claim form', async ({ page }) => {
    await page.goto('/business/claim?type=destination&listingId=e2e-dummy-listing');
    await expect(page.getByRole('heading', { name: 'Klaim Kepemilikan Usaha' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk / Daftar Akun' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Kirim Klaim Kepemilikan/ })).toBeVisible();
  });
});
