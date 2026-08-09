import type { FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const API_DIR = path.join(process.cwd(), '..', 'jogjagem-api');

function databaseUrl(): string | null {
  const envFile = path.join(API_DIR, '.env');
  if (!fs.existsSync(envFile)) return null;
  const match = fs
    .readFileSync(envFile, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('DATABASE_URL=') && l.includes('postgres'));
  return match ? match.slice('DATABASE_URL='.length).trim().replace(/^"|"$/g, '') : null;
}

export default async function globalTeardown(_config: FullConfig) {
  const email = process.env.E2E_USER_EMAIL;
  if (!email) {
    console.warn('[global-teardown] E2E_USER_EMAIL not set — skipping cleanup');
    return;
  }

  const url = databaseUrl();
  if (!url) {
    console.warn('[global-teardown] DATABASE_URL not found in ../jogjagem-api/.env — skipping cleanup');
    return;
  }

  const client = new Client({ connectionString: url });
  try {
    await client.connect();

    const { rows } = await client.query(
      `SELECT b.id, b.name
         FROM businesses b
         JOIN business_owners bo ON bo.business_id = b.id
         JOIN users u ON u.id = bo.user_id
        WHERE u.email = $1 AND b.name LIKE 'E2E Biz %'`,
      [email]
    );
    const ids = rows.map((r) => r.id);
    if (ids.length) {
      // ad_campaigns links to businesses via external_id (no FK/cascade), so
      // clean related campaigns and their payment transactions first.
      const { rows: campRows } = await client.query(
        `SELECT external_id FROM ad_campaigns WHERE business_external_id = ANY(
           SELECT external_id FROM businesses WHERE id = ANY($1::int[])
         )`,
        [ids]
      );
      const campaignIds = campRows.map((r) => r.external_id);
      if (campaignIds.length) {
        await client.query(
          `DELETE FROM payment_transactions
            WHERE subject_type = 'ad_campaign'
              AND subject_external_id = ANY($1::text[])`,
          [campaignIds]
        );
        await client.query(`DELETE FROM ad_campaigns WHERE external_id = ANY($1::text[])`, [
          campaignIds,
        ]);
        console.log(`[global-teardown] deleted ${campaignIds.length} E2E ad campaign(s) + payments`);
      }
      await client.query(`DELETE FROM businesses WHERE id = ANY($1::int[])`, [ids]);
      console.log(`[global-teardown] deleted ${ids.length} E2E business(es): ${rows.map((r) => r.name).join(', ')}`);
    }

    const res = await client.query(`DELETE FROM users WHERE email = $1 RETURNING id`, [email]);
    if (res.rowCount) {
      console.log(`[global-teardown] deleted E2E user (${email})`);
    }
  } catch (e) {
    console.warn('[global-teardown] cleanup error:', (e as Error).message);
  } finally {
    await client.end();
  }
}
