import { test, expect } from '@playwright/test';

test.describe('Business Claim Page', () => {
  test('pre-fills listing target from query params', async ({ page }) => {
    await page.goto('/business/claim?type=destination&listingId=candi-prambanan');
    await expect(page.getByRole('heading', { name: 'Klaim Kepemilikan Usaha' })).toBeVisible();
    await expect(page.getByText('candi-prambanan', { exact: true })).toBeVisible();
    await expect(page.getByText(/Kategori: destination/)).toBeVisible();
  });

  test('shows login CTA when unauthenticated', async ({ page }) => {
    await page.goto('/business/claim');
    await expect(page.getByRole('button', { name: 'Masuk / Daftar Akun' })).toBeVisible();
  });
});
