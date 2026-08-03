import { test, expect } from '@playwright/test';

const PLACEMENTS = ['homepage_hero', 'listing_top', 'listing_native', 'destination_detail'];

test.describe('House Ad CTAs', () => {
  test('every enabled house ad target_url resolves (not 404)', async ({ request }) => {
    for (const placement of PLACEMENTS) {
      const res = await request.get(`/api/pleco/ads/house?placement=${placement}`);
      expect(res.status(), `house ad API for ${placement}`).toBe(200);

      const data = (await res.json())?.data;
      expect(data, `house ad ${placement} should exist`).toBeTruthy();

      if (data?.is_enabled) {
        const target: string = data.target_url;
        expect(target, `target_url for ${placement}`).toBeTruthy();
        const targetRes = await request.get(target);
        expect(targetRes.status(), `target_url "${target}" for ${placement}`).toBeLessThan(400);
      }
    }
  });

  test('destination detail CTA is scoped to the /ads landing with listingId', async ({ page }) => {
    await page.goto('/destinations/candi-prambanan');
    await expect(page).toHaveURL(/\/destinations\/candi-prambanan/);

    // AdBanner falls back to HouseAd ("Klaim & Pasang Iklan") when no paid campaign is live.
    const cta = page.getByRole('link', { name: /Pasang Iklan/ }).first();
    await expect(cta).toBeVisible();

    const href = await cta.getAttribute('href');
    expect(href).toContain('/ads');
    expect(href).toContain('placement=destination_detail');
    expect(href).toContain('listingId=');
  });
});
