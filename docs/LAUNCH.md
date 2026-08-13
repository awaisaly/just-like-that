# Launch checklist

## Infrastructure

- [ ] Deploy Dev Vercel project (`develop` branch) — see [DEPLOY.md](./DEPLOY.md)
- [ ] Deploy Prod Vercel project (`main` branch)
- [ ] Copy env vars into each project (same values for now; different `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_ENV`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to each project’s public domain
- [ ] Configure custom domain and HTTPS on Prod (optional on Dev)

## Product / ops

- [ ] Confirm ATOL / consolidator arrangement for UK flight sales copy
- [ ] Set `NEXT_PUBLIC_SUPPORT_PHONE` (e.g. `+442079935216`)
- [ ] Set `NEXT_PUBLIC_SUPPORT_EMAIL` (e.g. `Info@nobletravel.co.uk`)
- [ ] Confirm WhatsApp numbers in `apps/web/src/lib/contact.ts` (`WHATSAPP_NUMBERS`)
- [ ] Create Resend account; verify sender domain
- [ ] Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_EMAIL_TO`
- [ ] Duffel account: test → live token; set `DUFFEL_ACCESS_TOKEN` and `DUFFEL_USE_MOCK=false` when ready
- [ ] Google Search Console + GTM (`NEXT_PUBLIC_GTM_ID=GTM-WGQLWH3J`); leave `NEXT_PUBLIC_GA_MEASUREMENT_ID` empty if GA4 is in GTM

## Security / compliance

- [ ] No card data collected (PCI out of scope)
- [ ] Duffel and Resend secrets are server-only (never `NEXT_PUBLIC_`)
- [ ] Review callback form honeypot + validation
- [ ] Confirm privacy/contact consent copy on checkout

## Verification

- [ ] Customer: search → select → callback form → pending page
- [ ] Resend delivers lead email with offer snapshot and reference
- [ ] WhatsApp button opens prefilled chat with reference
- [ ] Route landing pages render with FAQ JSON-LD where present
- [ ] `/sitemap.xml` lists static SEO pages
- [ ] `pnpm typecheck` and `pnpm build` green in CI
