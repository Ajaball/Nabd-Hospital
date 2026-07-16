# مستشفى نبض (Nabd Hospital)

منصة إدارة مستشفى: موقع عام باللغة العربية للمرضى، ولوحة تحكم خاصة للإدارة.
مشروع تخرّج في علوم الحاسب — يُبنى ليكون بجودة الإنتاج، لا مجرد نموذج.

> A hospital management platform: a public Arabic-language site for patients and a
> private admin dashboard for staff. Built to production quality.

## التقنيات (Stack)

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma + PostgreSQL ·
Auth.js v5 · Zod + react-hook-form · Recharts · Vitest · Playwright · pnpm.

## التشغيل محليًا (Getting started)

```bash
pnpm install
cp .env.example .env    # then fill in DATABASE_URL and AUTH_SECRET
pnpm dev                # http://localhost:3000
```

## الأوامر (Scripts)

| Script | ما يفعله |
|---|---|
| `pnpm dev` | تشغيل خادم التطوير |
| `pnpm build` | بناء الإنتاج |
| `pnpm typecheck` | فحص أنواع TypeScript |
| `pnpm lint` | فحص ESLint |
| `pnpm test` | اختبارات الوحدة (Vitest) |
| `pnpm test:e2e` | اختبارات شاملة (Playwright) |
| `pnpm db:push` | تطبيق مخطط Prisma على قاعدة البيانات |
| `pnpm db:seed` | تعبئة بيانات تجريبية |
| `pnpm db:studio` | فتح Prisma Studio |

## البناء على مراحل (Build phases)

يُبنى المشروع على تسع مراحل موثّقة في [`PHASES.md`](./PHASES.md)، ويحكمه دستور
المشروع في [`CLAUDE.md`](./CLAUDE.md). جلسة واحدة لكل مرحلة.

_البيانات التجريبية جميعها متخيّلة ولا تشير إلى أشخاص حقيقيين._
