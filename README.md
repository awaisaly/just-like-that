# just-like-that

Internal product / monorepo for the **Elca Airbridge** customer site — UK-first flight search with agent-assisted callback booking. One Next.js app, deployable directly to Vercel — no separate API or admin servers.

Customers search flights, select a fare, and request a callback. A representative re-confirms availability and completes the booking by phone or WhatsApp. **No online booking or payment is created by the website.**

## Stack

| Package | Role |
|---------|------|
| `apps/web` | Next.js customer app (UI + Route Handlers) |
| `packages/shared` | Money helpers, enums, Zod schemas |
| `packages/ui` | Shared React UI (Tailwind) |

Package manager: **pnpm**. Styling: **Tailwind CSS v4**.

Server capabilities inside Next.js:

- `POST /api/flights/search` — Duffel or mock flight search
- `POST /api/leads` — email callback request via Resend

Airports and SEO landing pages are static typed data under `apps/web/src/data`.

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # secrets / local overrides
pnpm --filter @jlt/web dev                     # loads .env.development (+ .env.local)
```

Open [http://localhost:3000](http://localhost:3000).

Env files:

| File | Purpose |
|------|---------|
| `apps/web/.env.development` | Defaults for local `dev` |
| `apps/web/.env.production` | Defaults for `build` / `start` |
| `apps/web/.env.local` | Gitignored overrides (tokens, etc.) |

Flight search: set `DUFFEL_ACCESS_TOKEN` and `DUFFEL_USE_MOCK=false` for live Duffel (in `.env.local` or Vercel).

Callback emails require Resend env vars on Vercel production. Locally, requests succeed without sending mail when Resend is not configured.

## Scripts

- `pnpm --filter @jlt/web dev` — customer app (development env)
- `pnpm --filter @jlt/web build` — production build
- `pnpm build` / `pnpm test` / `pnpm typecheck`

## Deploy (Vercel)

Use **two Vercel projects** (Dev + Prod) from the same repo — see [docs/DEPLOY.md](docs/DEPLOY.md).

1. Create project `just-like-that-dev` (branch `develop`) and `just-like-that` (branch `main`).
2. Root Directory: repo root or `apps/web` (same on both).
3. Install: `pnpm install`
4. Build: `pnpm --filter @jlt/shared build && pnpm --filter @jlt/web build`
5. Paste env vars from `.env.development` / `.env.production` into each project; set `NEXT_PUBLIC_SITE_URL` to that project’s URL.

Also see [docs/LAUNCH.md](docs/LAUNCH.md).

## Phase 1 scope

- Flight search (mock or Duffel) with filters and passenger/cabin selection
- Offer detail + callback request form
- Representative email via Resend + customer-initiated WhatsApp handoff
- Static SEO route / destination / guide pages, sitemap, redirects
