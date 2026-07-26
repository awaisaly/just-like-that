# Deploy to Vercel (Dev + Prod)

This project is a single Next.js app (`apps/web`) with shared packages. Deploy **two separate Vercel projects** from the same Git repo — one for development, one for production.

## Local env files

| File | When it loads |
|------|----------------|
| [`apps/web/.env.development`](../apps/web/.env.development) | `pnpm --filter @jlt/web dev` |
| [`apps/web/.env.production`](../apps/web/.env.production) | `pnpm --filter @jlt/web build` / `start` |
| `apps/web/.env.local` | Always (gitignored). Overrides the files above — use for secrets |

Template / checklist: [`apps/web/.env.example`](../apps/web/.env.example).

```bash
cp apps/web/.env.example apps/web/.env.local
# fill DUFFEL_ACCESS_TOKEN, RESEND_API_KEY, etc.
pnpm --filter @jlt/web dev
```

## Two Vercel projects

Create both from the same GitHub repository:

| | **Dev project** | **Prod project** |
|--|-----------------|------------------|
| Suggested name | `just-like-that-dev` | `just-like-that` (or `-prod`) |
| Production branch | `dev` | `main` |
| Domain | Vercel preview URL or `dev.yourdomain.com` | `www.yourdomain.com` |
| Env source | Same keys as `.env.development` | Same keys as `.env.production` |

### Required: Root Directory = `apps/web`

`next` lives in `apps/web/package.json`, not the monorepo root. If Root Directory is `./`, Vercel shows:

> No Next.js version detected…

For each project:

1. Import the monorepo in Vercel → **Add New Project**.
2. **Settings → General → Root Directory** → `apps/web`  
   - Enable **Include files outside the root directory in the Build Step** (needed for `packages/*` and `pnpm-workspace.yaml`).
3. **Framework Preset:** Next.js
4. **Build & Development Settings** (matches `apps/web/vercel.json`):

   | Setting | Value | Override |
   |---------|-------|----------|
   | Install Command | `cd ../.. && pnpm install` | On |
   | Build Command | `cd ../.. && pnpm --filter @jlt/shared build && pnpm --filter @jlt/web build` | On |
   | Output Directory | *(leave default / empty)* | Off |
   | Development Command | *(leave empty)* | Off |

5. **Settings → Git → Production Branch:** `dev` (Dev project) or `main` (Prod project).
6. **Settings → Environment Variables** — add every key from [`.env.example`](../apps/web/.env.example).
   - On the **Dev** project, set variables for **Production** (that project’s production = your staging site).
   - On the **Prod** project, set variables for **Production**.
7. Set `NEXT_PUBLIC_SITE_URL` to that project’s public URL (Dev vs Prod differ).
8. Set `NEXT_PUBLIC_APP_ENV` to `development` on Dev and `production` on Prod.
9. Redeploy.

### Recommended Git wiring

```
dev   →  just-like-that-dev  (Vercel Dev project)
main  →  just-like-that      (Vercel Prod project)
```

### Optional: CLI

```bash
# Link once per project (run from apps/web)
cd apps/web
vercel link   # choose / create just-like-that-dev
vercel env pull .env.local
```

## Environment variables

Copy from [`.env.example`](../apps/web/.env.example). Values are currently the same in Dev and Prod except `NEXT_PUBLIC_APP_ENV` (and you should set different `NEXT_PUBLIC_SITE_URL` per Vercel project).

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_APP_ENV` | Recommended | `development` or `production` |
| `NEXT_PUBLIC_SITE_URL` | Yes | That deployment’s public URL |
| `NEXT_PUBLIC_SUPPORT_PHONE` | Recommended | e.g. `+442079935216` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Recommended | e.g. `Info@nobletravel.co.uk` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recommended | Digits only (e.g. `442079935216`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 |
| `DUFFEL_USE_MOCK` | Dev / fallback | `true` for mock fares |
| `DUFFEL_ACCESS_TOKEN` | For live search | Server-only |
| `FLIGHT_PRICE_MARKUP_PERCENT` | Optional | Default `5` |
| `FLIGHT_SEARCH_CACHE_TTL_SECONDS` | Optional | Default `600` |
| `FLIGHT_CALENDAR_CACHE_TTL_SECONDS` | Optional | Default `1800` |
| `RESEND_API_KEY` | Prod callbacks | Server-only |
| `RESEND_FROM_EMAIL` | Prod callbacks | Verified sender |
| `LEADS_EMAIL_TO` | Prod callbacks | Representative inbox |

## Behaviour notes

- Callback requests are emailed to `LEADS_EMAIL_TO`. They are **not** stored in a database.
- On Vercel when `VERCEL_ENV=production`, Resend must be configured or `/api/leads` / `/api/contact` fail. Local/preview builds accept requests without sending mail when Resend env vars are empty.
- WhatsApp uses a prefilled `wa.me` link the customer opens manually — no WhatsApp Business API.
- Flight offers live only in the browser session until the customer submits a callback request.
