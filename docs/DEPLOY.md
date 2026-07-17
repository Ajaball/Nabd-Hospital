# Deployment (Phase 8)

The code is deploy-ready. These steps provision the two external services (Neon
Postgres + Vercel) and go live. CI (typecheck · lint · unit tests) already runs
on every push via `.github/workflows/ci.yml`.

## 1. Neon Postgres

1. Create a Neon project (region close to your users).
2. Enable **connection pooling**.
3. Copy two connection strings:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
   - **Direct** (no `-pooler`) → `DIRECT_URL`

## 2. Migrate + seed the database

From your machine, with the two URLs exported:

```bash
export DATABASE_URL="postgresql://…-pooler…/neondb?sslmode=require"
export DIRECT_URL="postgresql://…(direct)…/neondb?sslmode=require"
pnpm exec prisma migrate deploy   # applies the schema + partial unique index
pnpm db:seed                      # loads the fictional demo dataset
```

The seed is deterministic and fully fictional; it creates the demo accounts in
the README (`admin@nabd.example` / `Admin@12345`, `patient1@example.com` /
`Patient@12345`).

## 3. Vercel

1. Import the GitHub repo into Vercel (framework preset: **Next.js**).
2. Set environment variables (Production + Preview):
   - `DATABASE_URL` — the pooled Neon URL
   - `DIRECT_URL` — the direct Neon URL
   - `AUTH_SECRET` — `openssl rand -base64 32`
3. Deploy. The default `pnpm build` runs `next build`; `prisma generate` runs via
   the app's postinstall/build.

## 4. Verify on the live URL

- Home renders in Arabic RTL, the pulse trace animates once.
- Register a patient → book (department → doctor → date/slot) → the slip prints.
- `/my-appointments` shows the booking; cancel it.
- Admin login at `/dashboard/login` → the overview KPIs and both charts render
  real numbers; confirm an appointment.
- Check mobile at 375px (nav drawer, forms, tables scroll).

## 5. Tag the release

```bash
git tag v1.0.0
git push origin v1.0.0
```

> Note: the public data pages are statically prerendered at build time, so the
> build needs database access (Neon is reachable during the Vercel build). If you
> prefer fully dynamic public pages, add `export const dynamic = "force-dynamic"`
> to the relevant route segments.
