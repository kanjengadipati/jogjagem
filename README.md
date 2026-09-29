# Jogjagem (Explore Jogja) 🏯

Jogjagem is an AI-powered tourism discovery and ecosystem platform for Yogyakarta, Indonesia. This repository is the **public-facing web app**: destination and event discovery, SEO landing pages, an AI travel assistant, trip planning, reviews, and the self-service **business owner portal**.

It is one of three repos in the platform:

| Repo | Port | Role |
|---|---|---|
| [`jogjagem-api`](../jogjagem-api) | 8081 | Go backend — the single source of all data |
| `jogjagem` | 3001 | This app — public site + business portal |
| [`jogjagem-admin`](../jogjagem-admin) | 3002 | Internal staff console |

---

## Features

- **100+ curated destinations** with galleries, maps, weather, facilities, coordinates, and reviews.
- **Events calendar** and festival detail pages.
- **AI travel assistant** — conversational Q&A, image search, recommendations, trending picks, journey planning, route timeline, and next-stop suggestions (services in `jogjagem-api`).
- **Trip planner** — build itineraries locally, then sync them to your account on login.
- **SEO landing pages** — category and region listicles (kuliner, wisata alam, spot foto, sunset, hidden gems, etc.) with structured data.
- **Bilingual UI** (Indonesian default, English) via `next-intl`.
- **Accounts** — email/password, WhatsApp OTP, magic link, and Google sign-in; profile, travel passport, saved items.
- **Business portal** — register a business, claim a listing, and manage listings, promotions, reviews, team, and subscriptions.
- **Advertising** — house ads and paid ad campaigns with Midtrans Snap checkout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 (CSS-first `@theme`), Inter / Manrope / DM Serif / JetBrains Mono |
| i18n | `next-intl` (`id` default, `en`) |
| Maps | Leaflet |
| Icons / motion | `lucide-react`, `motion` |
| Media | Cloudinary (signed uploads) |
| Payments | Midtrans Snap |
| Analytics | Umami, `@vercel/analytics` |
| Testing | Playwright + a pure-HTTP Node E2E script |

---

## Getting Started

### Prerequisites

- Node.js 20+
- The [`jogjagem-api`](../jogjagem-api) backend running on `http://localhost:8081`
- A Cloudinary account if you need uploads

### Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:3001**.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server on port 3001 (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3001 |
| `npm run clean` | Remove `.next` |
| `npm run lint` | Type check (`tsc --noEmit`) |
| `npm run test:e2e` | Pure-HTTP E2E suite (`test-business-e2e.js`) |
| `npm run test:e2e:ui` | Playwright suite |
| `npm run test:e2e:ui:headed` | Playwright, headed |
| `npm run test:e2e:auth` | Playwright auth spec only |
| `npm run test:e2e:install` | Install Chromium + OS deps |

> There is no ESLint/Prettier config — `npm run lint` is the type check.

---

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | public | Backend base URL (default `http://localhost:8081`) |
| `API_BASE` | server | Server-component API base (falls back to `NEXT_PUBLIC_API_BASE`) |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL (default `https://www.jogjagem.com`) |
| `NEXT_PUBLIC_ADMIN_URL` | public | Admin portal URL for staff links (default `http://localhost:3002`) |
| `NEXT_PUBLIC_BUSINESS_PLATFORM` | public | `new` enables the in-app business portal; unset uses the legacy landing/claim pages |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | public | Session cookie domain in production (default `.jogjagem.com`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public | Google sign-in (button hidden when unset) |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | public | Midtrans Snap checkout |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | public | Umami analytics |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | server | Cloudinary signing (`/api/upload`, `/api/cloudinary/sign`) |
| `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `PLAYWRIGHT_BASE_URL` | test | Playwright auth suite |

The `.env.example` still lists `GEMINI_API_KEY` and `APP_URL` from the original AI Studio template — neither is read by the current code. AI features are proxied to `jogjagem-api`.

---

## Architecture

- **Routing:** App Router with a top-level `[locale]` segment. The root layout is `src/app/[locale]/layout.tsx` (there is no `src/app/layout.tsx`); locale is negotiated by `src/middleware.ts`.
- **API access:**
  - Client components use `src/lib/api.ts` — a single client layer against `NEXT_PUBLIC_API_BASE || '/api/pleco'`. The access token is held in memory only and refreshed automatically 5 minutes before expiry.
  - Server components use `src/lib/api-proxy.ts` / `server-*.ts` helpers.
  - `next.config.ts` rewrites `/api/pleco/:path*` to the backend, plus permanent redirects for legacy `andamp` slugs, `/partner → /business`, and `/hidden-gem → /destinations/hidden-gem`.
- **Auth:** Route handlers under `src/app/api/auth/*` proxy credentials to the backend and store the session in the `jogjagem_session` HttpOnly cookie (`src/lib/session.ts`). Auth state is exposed through `src/contexts/AuthContext.tsx`.
- **Roles:** `user` (public account), `partner` (business owner), `admin` / `superadmin` (redirected to `jogjagem-admin`).

```text
src/
├── app/
│   ├── [locale]/           # all pages (id/en)
│   │   ├── business/       # business portal (+ (dashboard) route group)
│   │   ├── destinations/   # browse + [...slug] detail
│   │   ├── events/, blog/, planner/, ai/, map/, profile/, saved/, ads/
│   │   └── <SEO listicles> # kuliner-jogja, wisata-alam-jogja, ...
│   ├── api/                # 36 server-side route handlers (auth, businesses, upload)
│   ├── sitemap.ts, robots.ts, manifest.ts
├── components/             # 38 UI components + business-portal/ and profile/
├── contexts/               # Auth, I18n, Locale, Location, Sidebar
├── hooks/, i18n/, lib/, messages/, types/
└── middleware.ts           # next-intl + legacy redirects
```

---

## Testing

```bash
# Pure-HTTP suite — requires backend :8081, admin :3002 AND this app :3001 already running
npm run test:e2e

# Playwright — auto-starts the dev server on :3001
npm run test:e2e:install
npm run test:e2e:ui
```

Playwright specs live in `e2e/`. `global-setup.ts` registers/logs in a test user and stores state in `.auth/`. `global-teardown.ts` deletes E2E fixtures directly from the API database using `DATABASE_URL` parsed from `../jogjagem-api/.env`.

---

## Deployment

The app targets **Vercel** (`@vercel/analytics` is wired in; the middleware matcher accounts for `_vercel`). There is no Dockerfile or CI workflow in this repo.

Configure these for production:

- `NEXT_PUBLIC_SITE_URL=https://www.jogjagem.com`
- `NEXT_PUBLIC_API_BASE=https://api.jogjagem.com`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.jogjagem.com`
- `NEXT_PUBLIC_COOKIE_DOMAIN=.jogjagem.com`
- Cloudinary and Midtrans keys
