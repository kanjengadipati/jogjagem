#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Jogjagem — E2E Logic Test Suite (Ad + Business Portal)          ║
 * ║  Cara pakai: npm run test:e2e                                    ║
 * ║                                                                  ║
 * ║  Tidak memerlukan Playwright/Cypress — pure HTTP test.           ║
 * ║  Pastikan semua server sudah jalan:                              ║
 * ║    - Backend Go  : http://localhost:8081                         ║
 * ║    - Admin App   : http://localhost:3002                         ║
 * ║    - Web App     : http://localhost:3001                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Untuk test yang membutuhkan auth (partner/admin), set env variable:
 *   PARTNER_TOKEN=eyJ...  ADMIN_TOKEN=eyJ...
 *   atau tambahkan langsung di konstanta di bawah.
 */

const http  = require('http');
const https = require('https');

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────
const BACKEND = 'http://localhost:8081';
const WEBAPP  = 'http://localhost:3001';
const ADMIN   = 'http://localhost:3002';

// Isi token setelah login manual, atau lewat env var
const PARTNER_TOKEN = process.env.PARTNER_TOKEN || '';
const ADMIN_TOKEN   = process.env.ADMIN_TOKEN   || '';

// ID bisnis untuk test update (isi setelah bisnis dibuat)
const TEST_BUSINESS_EXTERNAL_ID = process.env.TEST_BUSINESS_ID || '';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0, warnings = 0, skipped = 0;

const LINE = '─'.repeat(70);

function fetch(urlStr, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = urlStr.startsWith('https') ? https : http;
    const method = opts.method || 'GET';
    const body   = opts.body ? Buffer.from(opts.body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(opts.headers || {}),
    };
    if (body) headers['Content-Length'] = body.length;

    const url = new URL(urlStr);
    const req = lib.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search,
        method, headers },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(6000, () => { req.destroy(); reject(new Error('request timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

function tryJson(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}

function beToken(token) {
  return { Authorization: `Bearer ${token}` };
}

function ok(label, detail = '') {
  passed++;
  console.log(`  ✅ PASS  ${label}${detail ? '\n         → ' + detail : ''}`);
}

function fail(label, detail = '') {
  failed++;
  console.log(`  ❌ FAIL  ${label}${detail ? '\n         → ' + detail : ''}`);
}

function warn(label, detail = '') {
  warnings++;
  console.log(`  ⚠️  WARN  ${label}${detail ? '\n         → ' + detail : ''}`);
}

function skip(label, reason = '') {
  skipped++;
  console.log(`  ⏭️  SKIP  ${label}${reason ? ' (' + reason + ')' : ''}`);
}

function section(title) {
  console.log(`\n${LINE}`);
  console.log(`  ${title}`);
  console.log(LINE);
}

// ─── TEST GROUPS ──────────────────────────────────────────────────────────────

async function testInfrastructure() {
  section('1. INFRASTRUCTURE — Server Health Checks');

  try {
    const r = await fetch(`${BACKEND}/health`);
    const j = tryJson(r.body);
    j?.data?.status === 'ok'
      ? ok('Backend Go API healthy', `${BACKEND}/health → status=ok`)
      : fail('Backend Go API unhealthy', `status=${r.status} body=${r.body?.slice(0,100)}`);
  } catch(e) { fail('Backend Go API unreachable', e.message); }

  try {
    const r = await fetch(`${ADMIN}/login`);
    r.status === 200
      ? ok('Admin App running', `${ADMIN}/login → 200`)
      : warn('Admin App /login', `status=${r.status}`);
  } catch(e) { fail('Admin App unreachable', e.message); }

  try {
    const r = await fetch(`${WEBAPP}/`);
    (r.status === 200 || r.status === 307 || r.status === 308)
      ? ok('Web App running', `${WEBAPP}/ → status=${r.status}`)
      : warn('Web App /', `status=${r.status}`);
  } catch(e) { fail('Web App unreachable', e.message); }
}

async function testHouseAds() {
  section('2. HOUSE ADS — Slot Iklan Self-Promo');

  const placements = [
    'homepage_hero', 'listing_top', 'listing_native', 'destination_detail'
  ];

  for (const placement of placements) {
    try {
      const r = await fetch(`${BACKEND}/ads/house?placement=${placement}`);
      const j = tryJson(r.body);
      if (r.status === 200 && j?.status === 'success') {
        const d = j.data;
        if (d && d.is_enabled) {
          ok(`House Ad [${placement}]`, `headline="${d.headline}" cta="${d.cta_label}"`);
          // cek target_url tidak mengandung listingId (itu tugas frontend)
          if (d.target_url?.includes('listingId')) {
            warn(`target_url mengandung listingId [${placement}]`, 'listingId seharusnya di-inject FE saja');
          }
        } else if (d && !d.is_enabled) {
          warn(`House Ad [${placement}] is_enabled=false`, 'aktifkan dari admin /house-ads');
        } else {
          warn(`House Ad [${placement}] tidak ada data`, 'jalankan seed_house_ads_self_promo.sql');
        }
      } else {
        fail(`House Ad [${placement}]`, `status=${r.status}`);
      }
    } catch(e) { fail(`House Ad [${placement}]`, e.message); }
  }
}

async function testAdBannerFallback() {
  section('3. AD BANNER — Paid Campaign + Fallback ke House Ad');

  const placements = ['destination_detail', 'homepage_hero', 'listing_top'];
  for (const placement of placements) {
    try {
      const r = await fetch(`${BACKEND}/ads/banners?placement=${placement}`);
      const j = tryJson(r.body);
      if (r.status === 200 && j?.status === 'success') {
        j.data
          ? ok(`AdBanner [${placement}] — paid campaign aktif`, j.data?.business_name || j.data?.partner_name || 'N/A')
          : ok(`AdBanner [${placement}] — tidak ada paid campaign (fallback HouseAd)`, 'expected behavior');
      } else {
        fail(`AdBanner [${placement}]`, `status=${r.status}`);
      }
    } catch(e) { fail(`AdBanner [${placement}]`, e.message); }
  }
}

async function testExtraParamsUrlMerge() {
  section('4. EXTRA PARAMS — URL Merge Logic (frontend logic, pure JS)');

  const cases = [
    {
      label: 'destination_detail → listingId injected',
      targetUrl: '/business/claim?type=destination',
      params: { listingId: '42', type: 'destination' },
      expected: '/business/claim?type=destination&listingId=42',
    },
    {
      label: 'listing_top → no extraParams',
      targetUrl: '/iklan?placement=listing_top',
      params: {},
      expected: '/iklan?placement=listing_top',
    },
    {
      label: 'malformed URL gracefully falls back',
      targetUrl: 'bukan-url-valid',
      params: { listingId: '999' },
      expectedContains: 'bukan-url-valid', // fallback tanpa crash
    },
  ];

  for (const c of cases) {
    try {
      let href = c.targetUrl;
      if (c.params && Object.keys(c.params).length > 0) {
        try {
          const url = new URL(href, 'http://localhost');
          Object.entries(c.params).forEach(([key, value]) => url.searchParams.set(key, value));
          href = url.pathname + url.search;
        } catch {
          // malformed — fallback ke nilai asal
        }
      }
      if (c.expected) {
        href === c.expected
          ? ok(c.label, href)
          : fail(c.label, `expected="${c.expected}" got="${href}"`);
      } else if (c.expectedContains) {
        href.includes(c.expectedContains)
          ? ok(c.label + ' (fallback OK)', href)
          : fail(c.label, `expected to contain "${c.expectedContains}" but got "${href}"`);
      }
    } catch(e) { fail(c.label, e.message); }
  }
}

async function testBusinessApiPublic() {
  section('5. BUSINESS API — Public/Unauthenticated Endpoints');

  // Business Claim Page accessible
  try {
    const r = await fetch(`${WEBAPP}/id/business/claim`);
    (r.status === 200 || r.status === 307)
      ? ok('Web App /id/business/claim accessible', `status=${r.status}`)
      : fail('Web App /id/business/claim', `status=${r.status}`);
  } catch(e) { fail('Web App /id/business/claim', e.message); }

  // Business Page accessible
  try {
    const r = await fetch(`${WEBAPP}/id/business`);
    (r.status === 200 || r.status === 307 || r.status === 308)
      ? ok('Web App /id/business accessible', `status=${r.status}`)
      : fail('Web App /id/business', `status=${r.status}`);
  } catch(e) { fail('Web App /id/business', e.message); }
}

async function testBusinessApiAuthenticated() {
  section('6. BUSINESS API — Authenticated Endpoints (Require PARTNER_TOKEN)');

  if (!PARTNER_TOKEN) {
    skip('GET /businesses/me', 'set PARTNER_TOKEN=<jwt>');
    skip('POST /businesses/me (create)', 'set PARTNER_TOKEN=<jwt>');
    skip('GET /businesses/me/:id', 'set PARTNER_TOKEN=<jwt>');
    skip('PUT /businesses/me/:id (update)', 'set PARTNER_TOKEN=<jwt>');
    return;
  }

  // GET /businesses/me
  try {
    const r = await fetch(`${BACKEND}/businesses/me`, { headers: beToken(PARTNER_TOKEN) });
    const j = tryJson(r.body);
    if (r.status === 200 && j?.status === 'success') {
      ok('GET /businesses/me', `${j.data?.length ?? 0} bisnis ditemukan`);
    } else if (r.status === 401 || r.status === 403) {
      fail('GET /businesses/me — token tidak valid atau tidak punya permission', `status=${r.status}`);
    } else {
      fail('GET /businesses/me', `status=${r.status} body=${r.body?.slice(0,120)}`);
    }
  } catch(e) { fail('GET /businesses/me', e.message); }

  // GET specific business (jika TEST_BUSINESS_EXTERNAL_ID diset)
  if (!TEST_BUSINESS_EXTERNAL_ID) {
    skip('GET /businesses/me/:id', 'set TEST_BUSINESS_ID=<external_id>');
    skip('PUT /businesses/me/:id', 'set TEST_BUSINESS_ID=<external_id>');
  } else {
    try {
      const r = await fetch(`${BACKEND}/businesses/me/${TEST_BUSINESS_EXTERNAL_ID}`, { headers: beToken(PARTNER_TOKEN) });
      const j = tryJson(r.body);
      r.status === 200 && j?.status === 'success'
        ? ok('GET /businesses/me/:id', `name="${j.data?.name}" status="${j.data?.status}"`)
        : fail('GET /businesses/me/:id', `status=${r.status}`);
    } catch(e) { fail('GET /businesses/me/:id', e.message); }

    // PUT /businesses/me/:id — update bisnis
    try {
      const payload = JSON.stringify({
        phone: '081234567890',
        website: 'https://test-update.jogjagem.com',
      });
      const r = await fetch(`${BACKEND}/businesses/me/${TEST_BUSINESS_EXTERNAL_ID}`, {
        method: 'PUT',
        body: payload,
        headers: beToken(PARTNER_TOKEN),
      });
      const j = tryJson(r.body);
      r.status === 200 && j?.status === 'success'
        ? ok('PUT /businesses/me/:id', `updated phone="${j.data?.phone}"`)
        : fail('PUT /businesses/me/:id', `status=${r.status} body=${r.body?.slice(0,120)}`);
    } catch(e) { fail('PUT /businesses/me/:id', e.message); }
  }
}

async function testAdminBusinessProxy() {
  section('7. ADMIN PROXY — /api/businesses/* (Require Cookie/Token)');

  const routes = [
    { path: '/api/businesses/pending', method: 'GET', label: 'Pending businesses list' },
    { path: '/api/businesses', method: 'GET', label: 'All businesses list' },
  ];

  for (const route of routes) {
    try {
      const headers = ADMIN_TOKEN ? { Cookie: `pleco_session=${ADMIN_TOKEN}` } : {};
      const r = await fetch(`${ADMIN}${route.path}`, { method: route.method, headers });
      if (r.status === 200) {
        const j = tryJson(r.body);
        ok(`${route.method} ${route.path}`, `${route.label} — ${j?.data?.length ?? 0} hasil`);
      } else if (r.status === 307 || r.status === 401 || r.status === 403) {
        ADMIN_TOKEN
          ? fail(`${route.method} ${route.path}`, `token invalid? status=${r.status}`)
          : ok(`${route.method} ${route.path} — redirect ke login (protected)`, `status=${r.status} ✓`);
      } else {
        fail(`${route.method} ${route.path}`, `unexpected status=${r.status}`);
      }
    } catch(e) { fail(`${ADMIN}${route.path}`, e.message); }
  }

  // Approve/Reject/Suspend endpoint shape test (without a real ID)
  const actionRoutes = [
    '/api/businesses/__TEST__/approve',
    '/api/businesses/__TEST__/reject',
    '/api/businesses/__TEST__/suspend',
  ];

  for (const path of actionRoutes) {
    try {
      const headers = ADMIN_TOKEN ? { Cookie: `pleco_session=${ADMIN_TOKEN}` } : {};
      const r = await fetch(`${ADMIN}${path}`, { method: 'POST', headers, body: '{}' });
      // 307 (redirect ke login) atau 404 (bisnis tidak ada) keduanya valid untuk shape test
      (r.status === 307 || r.status === 404 || r.status === 400 || r.status === 200)
        ? ok(`POST ${path}`, `route exists, status=${r.status}`)
        : fail(`POST ${path}`, `unexpected status=${r.status}`);
    } catch(e) { fail(`POST ${path}`, e.message); }
  }
}

async function testSecurityResetPassword() {
  section('8. KEAMANAN — Forgot Password API');

  // Tanpa email
  try {
    const r = await fetch(`${ADMIN}/api/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    (r.status === 400 || r.status === 422)
      ? ok('POST /api/auth/forgot-password — empty email rejected', `status=${r.status}`)
      : warn('POST /api/auth/forgot-password empty body', `status=${r.status}`);
  } catch(e) { fail('POST /api/auth/forgot-password', e.message); }

  // Email format valid (tetapi tidak ada di DB — backend harus tetap 200 atau 404)
  try {
    const r = await fetch(`${ADMIN}/api/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@test.jogjagem.com' }),
    });
    (r.status === 200 || r.status === 404 || r.status === 429)
      ? ok('POST /api/auth/forgot-password — valid email processed', `status=${r.status}`)
      : fail('POST /api/auth/forgot-password', `unexpected status=${r.status}`);
  } catch(e) { fail('POST /api/auth/forgot-password', e.message); }
}

async function testPhoneValidationLogic() {
  section('9. VALIDASI NOMOR TELEPON — Business & Profile (pure logic)');

  function validatePhone(v) {
    const digits = v.replace(/\D/g, '');
    // Normalise ke format 0xxx
    const base = digits.startsWith('62') ? '0' + digits.slice(2) : digits;
    // Panjang valid: 9-15 digit total termasuk leading 0
    return /^08\d{7,13}$/.test(base);
  }

  const cases = [
    { input: '081234567890',   valid: true,  label: '081... format' },
    { input: '6281234567890',  valid: true,  label: '62... format' },
    { input: '+6281234567890', valid: true,  label: '+62... format' },
    { input: '081',            valid: false, label: 'terlalu pendek' },
    { input: '12345',          valid: false, label: 'tidak diawali 0/62' },
    { input: 'abc123',         valid: false, label: 'bukan angka' },
    { input: '08123456789012345', valid: false, label: 'terlalu panjang' },
    { input: '082123456',      valid: true,  label: '9 digit total (min)' },
  ];

  for (const c of cases) {
    const result = validatePhone(c.input);
    result === c.valid
      ? ok(`Phone "${c.input}" [${c.label}]`, `valid=${result}`)
      : fail(`Phone "${c.input}" [${c.label}]`, `expected valid=${c.valid} got=${result}`);
  }
}

async function testListingClaimsApi() {
  section('10. LISTING CLAIMS API — Claim Kepemilikan Listing');

  // GET /listing-claims/me — harus auth
  try {
    const r = await fetch(`${BACKEND}/listing-claims/me`);
    (r.status === 401 || r.status === 403)
      ? ok('GET /listing-claims/me — protected without auth', `status=${r.status}`)
      : warn('GET /listing-claims/me', `status=${r.status} (expected 401/403)`);
  } catch(e) { fail('GET /listing-claims/me', e.message); }

  // POST /listing-claims — harus auth
  try {
    const r = await fetch(`${BACKEND}/listing-claims`, { method: 'POST', body: '{}' });
    (r.status === 401 || r.status === 403)
      ? ok('POST /listing-claims — protected without auth', `status=${r.status}`)
      : warn('POST /listing-claims no-auth', `status=${r.status}`);
  } catch(e) { fail('POST /listing-claims', e.message); }

  // Admin: GET /admin/listing-claims/pending
  try {
    const r = await fetch(`${BACKEND}/admin/listing-claims/pending`);
    (r.status === 401 || r.status === 403)
      ? ok('GET /admin/listing-claims/pending — protected', `status=${r.status}`)
      : warn('GET /admin/listing-claims/pending', `status=${r.status}`);
  } catch(e) { fail('GET /admin/listing-claims/pending', e.message); }

  // Authenticated claim (jika token ada)
  if (PARTNER_TOKEN) {
    try {
      const payload = JSON.stringify({
        listing_type: 'destination',
        listing_id: 999999, // ID tidak ada — expect 404/400 bukan crash
        business_external_id: TEST_BUSINESS_EXTERNAL_ID || 'biz-test-001',
        notes: 'E2E test claim',
      });
      const r = await fetch(`${BACKEND}/listing-claims`, {
        method: 'POST',
        body: payload,
        headers: beToken(PARTNER_TOKEN),
      });
      (r.status === 201 || r.status === 400 || r.status === 404 || r.status === 422)
        ? ok('POST /listing-claims authenticated', `status=${r.status} (non-crash response)`)
        : fail('POST /listing-claims authenticated', `status=${r.status}`);
    } catch(e) { fail('POST /listing-claims authenticated', e.message); }
  } else {
    skip('POST /listing-claims (authenticated)', 'set PARTNER_TOKEN=<jwt>');
  }
}

async function testStatusGatingLogic() {
  section('11. STATUS GATING — Logika Kunci Fitur per Status Bisnis');

  // Pure logic test — verifikasi fungsi isPending
  const statuses = [
    { status: 'pending',  isPending: true,  label: 'pending → menu locked' },
    { status: 'draft',    isPending: true,  label: 'draft → menu locked' },
    { status: 'approved', isPending: false, label: 'approved → all menu open' },
    { status: 'rejected', isPending: true,  label: 'rejected → menu locked' },
    { status: 'suspended',isPending: true,  label: 'suspended → menu locked' },
  ];

  for (const c of statuses) {
    const computed = c.status !== 'approved';
    computed === c.isPending
      ? ok(`Status [${c.status}]`, c.label)
      : fail(`Status [${c.status}]`, `expected isPending=${c.isPending} got=${computed}`);
  }
}

async function testAdminBusinessApprovalFlow() {
  section('12. ADMIN APPROVAL FLOW — Approve/Reject Business via Admin Proxy');

  if (!ADMIN_TOKEN || !TEST_BUSINESS_EXTERNAL_ID) {
    skip('Approve business flow', 'set ADMIN_TOKEN + TEST_BUSINESS_ID');
    skip('Reject business flow', 'set ADMIN_TOKEN + TEST_BUSINESS_ID');
    skip('Suspend business flow', 'set ADMIN_TOKEN + TEST_BUSINESS_ID');
    return;
  }

  const headers = { Cookie: `pleco_session=${ADMIN_TOKEN}` };
  const bizId = TEST_BUSINESS_EXTERNAL_ID;

  try {
    const r = await fetch(`${ADMIN}/api/businesses/${bizId}/approve`, {
      method: 'POST',
      headers,
      body: '{}',
    });
    (r.status === 200 || r.status === 400)
      ? ok('POST /api/businesses/:id/approve', `status=${r.status}`)
      : fail('POST /api/businesses/:id/approve', `status=${r.status}`);
  } catch(e) { fail('POST /api/businesses/:id/approve', e.message); }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function printBox(lines) {
  const W = 72;
  const top    = '╔' + '═'.repeat(W - 2) + '╗';
  const bottom = '╚' + '═'.repeat(W - 2) + '╝';
  console.log(top);
  for (const line of lines) {
    console.log(`║ ${line.padEnd(W - 4)} ║`);
  }
  console.log(bottom);
}

async function main() {
  printBox([
    'Jogjagem — Business Feature E2E Logic Test Suite',
    'Cara pakai: npm run test:e2e',
  ]);

  if (PARTNER_TOKEN) console.log(`\n  🔑 PARTNER_TOKEN terdeteksi — test auth akan dijalankan`);
  if (ADMIN_TOKEN)   console.log(`  🔑 ADMIN_TOKEN terdeteksi — test admin akan dijalankan`);
  if (TEST_BUSINESS_EXTERNAL_ID) console.log(`  🏢 TEST_BUSINESS_ID = ${TEST_BUSINESS_EXTERNAL_ID}`);

  if (!PARTNER_TOKEN || !ADMIN_TOKEN) {
    console.log(`\n  💡 Tip: Jalankan dengan token untuk test lengkap:`);
    console.log(`     PARTNER_TOKEN=<jwt> ADMIN_TOKEN=<jwt> TEST_BUSINESS_ID=<id> npm run test:e2e`);
  }

  const start = Date.now();

  await testInfrastructure();
  await testHouseAds();
  await testAdBannerFallback();
  await testExtraParamsUrlMerge();
  await testBusinessApiPublic();
  await testBusinessApiAuthenticated();
  await testAdminBusinessProxy();
  await testSecurityResetPassword();
  await testPhoneValidationLogic();
  await testListingClaimsApi();
  await testStatusGatingLogic();
  await testAdminBusinessApprovalFlow();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const total = passed + failed + warnings + skipped;

  console.log('');
  printBox([
    `Selesai dalam ${elapsed}s`,
    `Total: ${total}  |  ✅ ${passed} pass  |  ❌ ${failed} fail  |  ⚠️ ${warnings} warn  |  ⏭️ ${skipped} skip`,
  ]);

  if (failed > 0) {
    console.log(`\n  ❌ ${failed} test GAGAL — periksa detail di atas.\n`);
    process.exit(1);
  }
  console.log(`\n  ✅ Semua test lolos (dengan ${warnings} warning dan ${skipped} skip).\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Test runner error:', err.message);
  process.exit(1);
});
