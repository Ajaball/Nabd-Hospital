# مستشفى نبض (Nabd Hospital)

منصة إدارة مستشفى: موقع عام باللغة العربية للمرضى، ولوحة تحكم خاصة للإدارة.
مشروع تخرّج في علوم الحاسب — يُبنى ليكون بجودة الإنتاج، لا مجرد نموذج.

الموقع بالكامل بالعربية ومن اليمين إلى اليسار (RTL)، ويوفّر:

- **موقع عام**: الصفحة الرئيسية، الأقسام والأطباء، الأسئلة الشائعة، تواصل معنا.
- **حجز المواعيد**: تدفّق من ثلاث خطوات (قسم ← طبيب ← تاريخ ووقت) مع منع الحجز المزدوج على مستوى قاعدة البيانات.
- **بوابة المريض**: تسجيل الدخول، عرض المواعيد القادمة والسابقة، وإلغاؤها.
- **لوحة تحكم الإدارة**: مؤشرات ورسوم بيانية، وإدارة المواعيد والمرضى والأطباء والأقسام والأخبار والرسائل.

> A production-quality hospital management platform: a public Arabic (RTL) site
> for patients with three-step appointment booking, a patient portal, and an
> admin dashboard. Double-booking is prevented at the database level.

---

## التقنيات (Stack)

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui ·
Prisma + PostgreSQL · Auth.js v5 (Credentials + bcrypt) · Zod + react-hook-form ·
Recharts · date-fns / date-fns-tz · Vitest · Playwright · pnpm · Vercel + Neon.

## التشغيل محليًا (Getting started)

```bash
pnpm install
cp .env.example .env          # then fill in the values below
pnpm db:push                  # apply the schema to your database
pnpm db:seed                  # load fictional demo data
pnpm dev                      # http://localhost:3000
```

## متغيرات البيئة (Environment variables)

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط PostgreSQL المجمّع (pooled) — يستخدمه التطبيق وقت التشغيل. |
| `DIRECT_URL` | رابط PostgreSQL المباشر (non-pooled) — يستخدمه Prisma للهجرات. محليًا = نفس `DATABASE_URL`. |
| `AUTH_SECRET` | سر Auth.js لتوقيع الجلسات. وَلِّده بـ `openssl rand -base64 32`. |
| `AUTH_TRUST_HOST` | اضبطه إلى `true` خارج Vercel (مثل `next start` المحلي أو أي استضافة ذاتية). |
| `NEXT_PUBLIC_SITE_URL` | (اختياري) عنوان الموقع الأساسي لبطاقات المشاركة (Open Graph). |

## بيانات الدخول التجريبية (Demo credentials)

بعد `pnpm db:seed`:

| الدور | البريد | كلمة المرور |
|---|---|---|
| الإدارة (ADMIN) | `admin@nabd.example` | `Admin@12345` |
| مريض (PATIENT) | `patient1@example.com` | `Patient@12345` |

> جميع البيانات التجريبية متخيّلة ولا تشير إلى أشخاص حقيقيين، وأرقام الهوية تبدأ بـ`9`
> بحيث لا تصطدم بأي هوية حقيقية.

## الأوامر (Scripts)

| Script | ما يفعله |
|---|---|
| `pnpm dev` | تشغيل خادم التطوير |
| `pnpm build` | بناء الإنتاج |
| `pnpm start` | تشغيل بناء الإنتاج |
| `pnpm typecheck` | فحص أنواع TypeScript |
| `pnpm lint` | فحص ESLint |
| `pnpm test` | اختبارات الوحدة (Vitest) |
| `pnpm test:e2e` | اختبارات شاملة (Playwright) |
| `pnpm db:push` | تطبيق مخطط Prisma على قاعدة البيانات |
| `pnpm db:seed` | تعبئة بيانات تجريبية |
| `pnpm db:studio` | فتح Prisma Studio |

## النشر (Deployment)

- **قاعدة البيانات**: Neon Postgres مع تفعيل التجميع (pooling). اضبط `DATABASE_URL`
  على الرابط المجمّع و`DIRECT_URL` على الرابط المباشر.

- **الاستضافة**: Vercel. أضِف متغيرات البيئة نفسها (على Vercel لا حاجة لضبط
  `AUTH_TRUST_HOST`). عند كل نشر يشغّل Vercel السكربت `vercel-build` الذي **يطبّق
  الهجرات تلقائيًا** (`prisma migrate deploy`) قبل البناء، فلا حاجة لتطبيقها يدويًا.

- **بيانات العرض**: تُملأ مرّة واحدة فقط (البذر ليس جزءًا من البناء). بعد أول نشر،
  شغّلها محليًا مع `.env` موجّهٍ إلى `DIRECT_URL` الخاص بـ Neon:

  ```bash
  pnpm db:seed
  ```

> السكربت المحلي `pnpm build` يبقى `prisma generate && next build` بلا اتصال بقاعدة
> بيانات؛ الهجرة التلقائية مقصورة على `vercel-build`.

## التوثيق (Documentation)

- [`docs/ERD.md`](./docs/ERD.md) — مخطط قاعدة البيانات (Mermaid ER).
- [`docs/API.md`](./docs/API.md) — كل نقاط REST تحت `/api/v1`.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — القرارات التقنية ومبرراتها.
- [`CLAUDE.md`](./CLAUDE.md) — دستور المشروع. [`PHASES.md`](./PHASES.md) — مراحل البناء.

---

## English summary

Nabd Hospital is an Arabic-first, RTL-native hospital management app. The public
site lists departments and doctors and takes contact messages; patients register,
book appointments through a three-step URL-driven flow, and manage them in a
portal; admins run a dashboard (KPIs, charts, and CRUD over appointments,
patients, doctors, departments, news, and messages).

Every write goes through a REST route under `/api/v1` validated with Zod. Times
are stored UTC and rendered in Asia/Riyadh. The signature technical feature is
concurrency-safe booking: a Postgres **partial unique index** on
`(doctorId, startsAt) WHERE status IN ('PENDING','CONFIRMED')` guarantees two
concurrent requests for the same slot yield exactly one `201` and one `409` —
never an application-level check-then-insert. See `docs/DECISIONS.md`.

All seed data is fictional.
