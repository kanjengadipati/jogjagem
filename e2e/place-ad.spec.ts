import { test, expect, request } from '@playwright/test';
import path from 'node:path';

const WEB = 'http://localhost:3001';
const ADMIN = 'http://localhost:3002';
const BACKEND = 'http://localhost:8081';

test.describe('Full Ad Campaign Workflow', () => {

  test('User can place ad and it appears on homepage', async ({ browser }) => {
    // 1. User login
    const userContext = await browser.newContext({ storageState: '.auth/user.json' });
    const userPage = await userContext.newPage();
    
    // 2. Create Business
    console.log('Navigating to business');
    await userPage.goto(`${WEB}/business`);
    console.log('Clicking Tambah Bisnis');
    await userPage.getByRole('button', { name: 'Tambah Bisnis', exact: true }).click();
    console.log('Filling business name');
    await userPage.fill('input[name="name"]', 'E2E Biz ' + Date.now());
    console.log('Submitting');
    await userPage.click('button[type="submit"]');
    console.log('Business created');
    
    // Claim business (simplified, assuming it goes to claim page)
    await userPage.goto(`${WEB}/business/claim`);
    // ... fill claim form
    
    // 3. Admin login and approve
    const adminContext = await browser.newContext({ storageState: '.auth/admin.json' });
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto(`${ADMIN}/partner-applications`);
    // ... approve business
    
    // 4. Create Campaign
    await adminPage.goto(`${ADMIN}/ad-campaigns/create`);
    // ... fill campaign form (with URL image)
    
    // 5. Generate Invoice & Pay
    await adminPage.click('text=Generate Invoice');
    // ... snap checkout modal

    // 6. Simulate Webhook
    const apiCtx = await request.newContext();
    const orderID = '...'; // Get from campaign
    await apiCtx.post(`${BACKEND}/midtrans/notification`, {
        data: {
            order_id: orderID,
            status_code: '200',
            gross_amount: '150000',
            transaction_status: 'settlement',
            signature_key: '...' // Generate HMAC-SHA512
        }
    });

    // 7. Verify banner
    await userPage.goto(WEB);
    await expect(userPage.locator('.sponsored-badge')).toBeVisible();
  });
});
