<div dir="rtl">

# مستشفى نبض

منصّة إدارة مستشفى: موقع عام باللغة العربية للمرضى، ولوحة تحكم إدارية للموظفين.
مشروع تخرّج في علوم الحاسب — مبني ليكون بجودة الإنتاج، ويُنشر علنًا ويُناقش شفهيًا.

## ما الذي يقدّمه

- **للمريض:** تصفّح الأقسام والأطباء، حجز موعد في ثلاث خطوات (قسم ← طبيب ← وقت)،
  ومتابعة المواعيد وإلغاؤها من «مواعيدي».
- **للإدارة:** لوحة مؤشرات ورسوم بيانية، وإدارة المواعيد والمرضى والأطباء والأقسام
  والأخبار والرسائل.
- **واجهة عربية أصيلة** من اليمين إلى اليسار، بخطوط IBM Plex العربية والأحادية،
  والأرقام السريرية بخط أحادي.

## التقنيات

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma +
PostgreSQL · Auth.js v5 · Zod + react-hook-form · Recharts · Vitest · Playwright.

## التشغيل محليًا

1. ثبّت الحزم: `pnpm install`
2. جهّز ملف البيئة: انسخ `.env.example` إلى `.env` واضبط `DATABASE_URL` و
   `DIRECT_URL` و `AUTH_SECRET` (ولّد سرًّا بـ `openssl rand -base64 32`).
3. أنشئ الجداول وابذر البيانات: `pnpm db:deploy && pnpm db:seed`
4. شغّل التطوير: `pnpm dev` ثم افتح `http://localhost:3000`.

## بيانات الدخول التجريبية

| الدور | البريد | كلمة المرور |
|---|---|---|
| الإدارة | `admin@nabd.example` | `Admin@12345` |
| مريض | `patient1@example.com` | `Patient@12345` |

> جميع بيانات البذرة خيالية بالكامل ولا تعود لأي شخص حقيقي.

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `pnpm dev` | خادم التطوير |
| `pnpm build` / `pnpm start` | بناء وتشغيل الإنتاج |
| `pnpm typecheck` | فحص الأنواع |
| `pnpm lint` | فحص الأسلوب |
| `pnpm test` | اختبارات الوحدة (Vitest) |
| `pnpm test:e2e` | اختبارات شاملة (Playwright) |
| `pnpm db:deploy` / `pnpm db:seed` | ترحيل وبذر قاعدة البيانات |
| `pnpm db:studio` | استعراض البيانات |

يُبنى المشروع على مراحل موثّقة في [`PHASES.md`](./PHASES.md)، ويحكمه دستور المشروع
في [`CLAUDE.md`](./CLAUDE.md).

</div>

---

## English

**Nabd Hospital** is a hospital-management platform: a public, Arabic,
right-to-left site for patients, plus a private admin dashboard for staff. It is
a graded computer-science graduation project, built to production quality.

### Highlights

- Patients browse departments and doctors, book in a three-step flow
  (department → doctor → date/slot), and manage/cancel appointments.
- Admins get a KPI + charts overview and CRUD over appointments, patients,
  doctors, departments, news, and the contact inbox.
- **Concurrency-safe booking**: a partial unique index enforces one active
  appointment per doctor/slot at the database level — two concurrent bookings
  yield exactly one success and one clean `409`, never a lost update.
- All times are stored UTC and rendered in Asia/Riyadh; every user-visible
  string lives in `src/content/ar.ts`.

### Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui ·
Prisma + PostgreSQL · Auth.js v5 (Credentials, bcrypt, JWT) · Zod +
react-hook-form · Recharts · Vitest · Playwright · pnpm.

### Setup

```bash
pnpm install
cp .env.example .env          # set DATABASE_URL, DIRECT_URL, AUTH_SECRET
pnpm db:deploy && pnpm db:seed
pnpm dev                      # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection (app runtime). |
| `DIRECT_URL` | Direct connection (migrations / seed). |
| `AUTH_SECRET` | Auth.js JWT secret (`openssl rand -base64 32`). |

### Demo credentials

- Admin — `admin@nabd.example` / `Admin@12345`
- Patient — `patient1@example.com` / `Patient@12345`

### Documentation

- [`docs/API.md`](./docs/API.md) — every `/api/v1` endpoint.
- [`docs/ERD.md`](./docs/ERD.md) — the data model as a Mermaid ER diagram.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — why the key technical choices were made.

### Deployment

Deploy on Vercel with a Neon Postgres database. Set `DATABASE_URL` (pooled),
`DIRECT_URL` (direct), and `AUTH_SECRET`; run `prisma migrate deploy` then the
seed against the production database.
