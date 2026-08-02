import { request, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const WEB = 'http://localhost:3001';
const ADMIN = 'http://localhost:3002';
const BACKEND = 'http://localhost:8081';
const AUTH_DIR = path.join(process.cwd(), '.auth');

export default async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // ── Admin / superadmin (admin portal :3002) ─────────────────────────────
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPass = process.env.E2E_ADMIN_PASSWORD;
  if (adminEmail && adminPass) {
    const ctx = await request.newContext();
    try {
      const res = await ctx.post(`${ADMIN}/api/auth/login`, {
        data: { email: adminEmail, password: adminPass },
      });
      if (res.ok()) {
        await ctx.storageState({ path: path.join(AUTH_DIR, 'admin.json') });
        console.log(`[global-setup] admin auth saved (${adminEmail})`);
      } else {
        console.warn(`[global-setup] admin login failed: ${res.status()}`);
      }
    } catch (e) {
      console.warn('[global-setup] admin login error:', (e as Error).message);
    } finally {
      await ctx.dispose();
    }
  } else {
    console.warn('[global-setup] E2E_ADMIN_EMAIL/PASSWORD not set — admin auth tests will be skipped');
  }

  // ── Regular user (web app :3001) ────────────────────────────────────────
  const userEmail = process.env.E2E_USER_EMAIL;
  const userPass = process.env.E2E_USER_PASSWORD;
  if (userEmail && userPass) {
    const ctx = await request.newContext();
    try {
      // Ensure the test user exists (ignore "already registered" errors).
      await ctx.post(`${BACKEND}/auth/register`, {
        data: { name: 'E2E Test User', email: userEmail, password: userPass },
      }).catch(() => {});
      const res = await ctx.post(`${WEB}/api/auth/login`, {
        data: { email: userEmail, password: userPass },
      });
      if (res.ok()) {
        await ctx.storageState({ path: path.join(AUTH_DIR, 'user.json') });
        console.log(`[global-setup] user auth saved (${userEmail})`);
      } else {
        console.warn(`[global-setup] user login failed: ${res.status()}`);
      }
    } catch (e) {
      console.warn('[global-setup] user login error:', (e as Error).message);
    } finally {
      await ctx.dispose();
    }
  } else {
    console.warn('[global-setup] E2E_USER_EMAIL/PASSWORD not set — user auth tests will be skipped');
  }
}
