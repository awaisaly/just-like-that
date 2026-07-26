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
| Production branch | `develop` (or your staging branch) | `main` |
| Domain | Vercel preview URL or `dev.yourdomain.com` | `www.yourdomain.com` |
| Env source | Same keys as `.env.development` | Same keys as `.env.production` |

For each project:

1. Import the monorepo in Vercel → **Add New Project**.
2. Set **Root Directory** to repository root (uses root `vercel.json`), **or** `apps/web` (uses `apps/web/vercel.json`).
3. Framework: Next.js.
4. Install / Build (root Root Directory):

   | Setting | Value |
   |---------|-------|
   | Install | `pnpm install` |
   | Build | `pnpm --filter @jlt/shared build && pnpm --filter @jlt/web build` |

   If Root Directory is `apps/web`:

   - Install: `cd ../.. && pnpm install`
   - Build: `cd ../.. && pnpm --filter @jlt/shared build && pnpm --filter @jlt/web build`

5. Under **Settings → Environment Variables**, add every key from the matching env file.
   - On the **Dev** project, set variables for **Production** (that project’s production = your staging site). Optionally also Preview.
   - On the **Prod** project, set variables for **Production** (and Preview if you want PR previews).
6. Set `NEXT_PUBLIC_SITE_URL` to that project’s public URL (Dev vs Prod domains differ).
7. Set `NEXT_PUBLIC_APP_ENV` to `development` on Dev and `production` on Prod.
8. Deploy. Pushing to each project’s production branch updates that environment only.

### Recommended Git wiring

```
develop  →  just-like-that-dev  (Vercel Dev project)
main     →  just-like-that      (Vercel Prod project)
```

Disable automatic production deploys from the wrong branch on each project (Vercel → Settings → Git → Production Branch).

### Optional: CLI

```bash
# Link once per project (run from repo root)
vercel link   # choose / create just-like-that-dev
vercel env pull apps/web/.env.local   # optional: pull Dev secrets for local use

# Switch to prod project later with another `vercel link`, or use:
# vercel --prod   only against the Prod-linked project
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
| `RESEND_API_KEY` | Prod callbacks | Server-only |
| `RESEND_FROM_EMAIL` | Prod callbacks | Verified sender |
| `LEADS_EMAIL_TO` | Prod callbacks | Representative inbox |

## Behaviour notes

- Callback requests are emailed to `LEADS_EMAIL_TO`. They are **not** stored in a database.
- On Vercel when `VERCEL_ENV=production`, Resend must be configured or `/api/leads` fails. Local/preview builds accept leads without sending mail when Resend env vars are empty. (This applies to **each** project’s Production deployment — configure Resend on Dev if you want real emails there too.)
- WhatsApp uses a prefilled `wa.me` link the customer opens manually — no WhatsApp Business API.
- Flight offers live only in the browser session until the customer submits a callback request.
- Prefer setting Vercel **Root Directory** to `apps/web` (uses `apps/web/vercel.json`) **or** repo root (uses root `vercel.json`) — keep both projects consistent.
