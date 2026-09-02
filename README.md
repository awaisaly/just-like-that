# just-like-that

Internal monorepo for the **Elca Airbridge** customer site — UK-first flight search with agent-assisted booking. One Next.js app on Vercel; no separate API or admin servers.

Customers compare live fares, select an offer, and request a callback. A UK agent re-confirms availability and completes the booking by phone, WhatsApp, or email. **The website does not create bookings or take payment.**

## Stack

| Package | Role |
|---------|------|
| `apps/web` | Next.js customer app (UI + Route Handlers) |
| `packages/shared` | Money helpers, enums, Zod schemas |
| `packages/ui` | Shared React UI (Tailwind) |

Package manager: **pnpm**. Styling: **Tailwind CSS v4**. Flight data: **Duffel** (or mock). Email: **Resend**.

## Customer flow

```text
Home / SEO landing
       ↓
Search (origin, destination, dates, travellers, cabin)
       ↓
Results — sort, filters, flexible dates (±3 days)
       ↓
Offer detail
       ↓
Request a callback (/checkout)  →  email to LEADS_EMAIL_TO
       ↓
Pending confirmation (/checkout/pending)
```

1. **Search** — Homepage search form or SEO route/destination pages. Trip type: return or one way.
2. **Results** (`/flights/search`) — Live offers with Best / Cheapest / Fastest, sort, filters (stops, times, airlines, bags, price), and a flexible-dates bar that shows cached nearby fares (a live search runs when you tap a day).
3. **Offer** (`/flights/offers/[offerId]`) — Full itinerary; selection is stored in session (`jlt-flight-selection`).
4. **Callback** (`/checkout`) — Contact details, preferred time, full vs instalments. Posts the selected offer + travellers to `/api/leads`; agent receives the itinerary by email.
5. **Contact** (`/contact`) — Separate general enquiry form (`/api/contact`); not tied to a selected fare.

Instalments are the primary booking message; payment is arranged offline with the agent after re-price.

## API routes (Next.js)

| Route | Purpose |
|-------|---------|
| `POST /api/flights/search` | Full offer search (Duffel or mock), server TTL cache |
| `POST /api/flights/flexible-dates` | Cached cheapest fare per nearby day (±3); no extra Duffel searches |
| `GET /api/flights/offers/[offerId]` | Fresh offer detail (not long-cached) |
| `POST /api/leads` | Callback request email (includes selected flight) |
| `POST /api/contact` | Contact-page enquiry email |

Flight search cache lives in `apps/web/src/server/flight-cache.ts` (in-process Map + Next `unstable_cache`). Defaults: **10 min** search, **30 min** flexible dates (`FLIGHT_SEARCH_CACHE_TTL_SECONDS`, `FLIGHT_CALENDAR_CACHE_TTL_SECONDS`). HTTP responses stay `no-store`.

Airports and SEO pages are static data under `apps/web/src/data`. Marketing pages: home, about, FAQ, destinations, route guides, contact.

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # secrets / local overrides
pnpm --filter @jlt/web dev                     # loads .env.development (+ .env.local)
```

Open [http://localhost:3000](http://localhost:3000).

| File | Purpose |
|------|---------|
| `apps/web/.env.development` | Defaults for local `dev` (gitignored) |
| `apps/web/.env.production` | Defaults for `build` / `start` (gitignored) |
| `apps/web/.env.local` | Overrides / secrets (gitignored) |
| `apps/web/.env.example` | Documented template (committed) |

- **Live flights:** `DUFFEL_ACCESS_TOKEN` + `DUFFEL_USE_MOCK=false`
- **Emails (callback + contact):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_EMAIL_TO`  
  Locally, requests succeed without sending mail when Resend is not configured. Production on Vercel requires these vars.
- **Instalment service fee:** `FLIGHT_PRICE_MARKUP_PERCENT` (default 5) — added when a ticket is selected for instalments, not on search listings

## Scripts

- `pnpm --filter @jlt/web dev` — customer app
- `pnpm --filter @jlt/web build` — production build
- `pnpm build` / `pnpm test` / `pnpm typecheck` — turbo across the workspace

## Deploy (Vercel)

Use **two Vercel projects** (Dev + Prod) from the same repo — see [docs/DEPLOY.md](docs/DEPLOY.md).

1. Create project `just-like-that-dev` (branch `dev`) and `just-like-that` (branch `main`).
2. **Root Directory:** `apps/web` (required — `next` is not in the repo-root `package.json`).
3. Enable **Include files outside the root directory in the Build Step**.
4. Install: `cd ../.. && pnpm install` · Build: `cd ../.. && pnpm --filter @jlt/shared build && pnpm --filter @jlt/web build`
5. Paste env vars from `.env.example` into each project; set `NEXT_PUBLIC_SITE_URL` to that project’s public URL.

Also see [docs/LAUNCH.md](docs/LAUNCH.md).
