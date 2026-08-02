import { test, expect } from '@playwright/test';

test.describe('Business Page (Portal Utama)', () => {
  test('shows login CTA when unauthenticated', async ({ page }) => {
    await page.goto('/business');
    await expect(page.getByRole('heading', { name: 'Masuk untuk Mengelola Bisnis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk / Daftar Akun' })).toBeVisible();
  });

  test('opens auth modal from login CTA', async ({ page }) => {
    await page.goto('/business');
    const cta = page.getByRole('button', { name: 'Masuk / Daftar Akun' });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page.getByText(/Selamat Datang Kembali|Welcome Back/)).toBeVisible({ timeout: 20_000 });
  });
});
