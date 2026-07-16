# Nabd Hospital — Project Constitution

Read this file at the start of every session. It overrides your defaults.
If anything here conflicts with a prompt you were given, stop and ask.

---

## 1. What this is

A hospital management web platform for **مستشفى نبض (Nabd Hospital)**:
a public Arabic-language site for patients + a private admin dashboard for staff.

This is a computer-science graduation project. It is graded, deployed publicly, and
defended in an oral examination. It must be production-quality, not a demo.

---

## 2. Non-negotiables

1. **Arabic-only, RTL-native.** `<html dir="rtl" lang="ar">`. There is no English UI and
   no language switcher. Use logical CSS properties everywhere (`ms-*`, `me-*`, `ps-*`,
   `pe-*`, `start-*`, `end-*`) — never `ml-*`, `mr-*`, `left-*`, `right-*`.
2. **No hardcoded strings in components.** Every user-visible string lives in
   `src/content/ar.ts` and is imported. This includes validation errors, toasts, empty
   states, and button labels.
3. **Fonts are self-hosted.** IBM Plex Sans Arabic + IBM Plex Mono via `next/font/local`
   from `src/app/fonts/`. Never `next/font/google`. Never a system-font fallback chain
   that would silently render Arabic in a different face.
4. **Time is UTC in the database, Asia/Riyadh in the UI.** Every `DateTime` column is
   stored UTC. Every render goes through `src/lib/datetime.ts`. No `new Date()` formatting
   inline in a component, ever.
5. **REST, not just Server Actions.** The submitted project plan specifies a REST API.
   Every mutation goes through a Route Handler under `/api/v1/*`. Server Components may
   read the database directly for page rendering, but writes are REST. An examiner will
   open the code looking for the REST layer described in the report — it must be there.
6. **TypeScript strict.** No `any`, no `@ts-ignore`, no `!` non-null assertions outside
   of tests.
7. **Zod at every boundary.** Every Route Handler parses its input with a Zod schema from
   `src/lib/validation/`. Never trust a request body.
8. **All seed data is fictional and labeled.** Doctors, patients, and medical content in
   `prisma/seed.ts` are invented. Do not use the name of any real physician, real
   national ID formats that could collide with a real person, or real medical advice.
   The seed file carries a header comment stating the data is fictional.

---

## 3. Stack — locked, do not substitute

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config in `globals.css`) |
| Components | shadcn/ui |
| ORM / DB | Prisma + PostgreSQL |
| Auth | Auth.js v5, Credentials provider, bcrypt |
| Validation | Zod + react-hook-form |
| Charts | Recharts |
| Icons | lucide-react |
| Dates | date-fns + date-fns-tz |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Package manager | pnpm |
| Hosting | Vercel + Neon Postgres |

Reason for the lock: the project report names React, Next.js, Tailwind, Node.js,
PostgreSQL, and REST API. The code must match the report.

---

## 4. Design system

**Direction:** clinical wayfinding, not a wellness brand. The reference is Saudi hospital
signage — directional, high-contrast, quiet — plus the instrument panel it takes its name
from. Nothing decorative survives that isn't doing a job.

### Palette — 5 values, use no others

```css
--ink:    #10201F;  /* text; near-black with a green cast, never pure #000 */
--paper:  #F4F6F5;  /* page background; cool clinical off-white */
--teal:   #0E5A52;  /* primary: buttons, links, active nav, confirmed state */
--mint:   #DCEDE9;  /* primary tint: badges, selected slots, table hover */
--pulse:  #FF4D3D;  /* BRAND GRAPHIC ONLY — the ECG trace and the logo mark.
                       Never a button. Never an error. Never a UI state. */
```

Derived neutrals: `--ink` at 60% for muted text, `#E3E9E7` for borders. That's the list.

### Status colors — functional, separate from brand

```css
--st-pending:   #B45309  /* بانتظار التأكيد */
--st-confirmed: #0E5A52  /* مؤكد */
--st-completed: #475569  /* مكتمل */
--st-cancelled: #9F1239  /* ملغي */
--st-noshow:    #7C2D12  /* لم يحضر */
```

Status badges are **not pills**. They are 4px-radius rectangles with a 3px leading color
bar on the inline-start edge — the visual language of a colored file tab in a medical
record.

### Type

- **IBM Plex Sans Arabic** — everything Arabic. Weights 400 / 500 / 600 / 700 only.
- **IBM Plex Mono** — every number that is data: appointment times, dates, patient file
  numbers, phone numbers, KPI figures, table IDs. Latin/digits only. `font-variant-numeric:
  tabular-nums`.

The Plex superfamily is designed as one system, so the pairing is coherent — and the mono
for clinical data is the actual vernacular of charts, wristbands, and lab printouts.
Use Arabic-Indic or Western digits consistently; pick Western (`٠١٢` vs `012` → use `012`)
and never mix within a view.

Scale: 12 / 14 / 16 / 20 / 24 / 32 / 44. Display weight 700 with `letter-spacing: -0.01em`.
Body 400 at 16px, `line-height: 1.75` (Arabic needs the leading).

### Geometry

Radius: 10px cards, 8px inputs, 4px badges. One shadow only:
`0 1px 2px rgb(16 32 31 / 0.06), 0 8px 24px -12px rgb(16 32 31 / 0.12)`.
Borders do most of the work; shadows are for overlays.

### Signature element

**The pulse trace.** An ECG line in `--pulse` that draws itself once on home-page load
(~1.2s) and then persists as a static 1px hairline rule at the top of each section.
It encodes the product's name and nothing else does. Under `prefers-reduced-motion`,
render it static immediately.

This is the one bold thing. Everything else stays quiet: no gradients, no glassmorphism,
no stock photography of smiling clinicians, no hero blob, no other animation beyond
hover/focus transitions at 150ms.

### Copy rules

Active voice, sentence case, plain verbs. A button that says «احجز الموعد» produces a
toast that says «تم حجز الموعد». Errors state what happened and what to do; they never
apologize. Empty states are an invitation to act, not a shrug.

The Arabic must read as if written by a native speaker in Riyadh — not translated from
English. If a sentence would be more natural restructured, restructure it. Formal
Modern Standard Arabic for all UI (this is a hospital, not a startup).

---

## 5. Roles — exactly two

```
PATIENT | ADMIN
```

The submitted plan describes patient login and administration login. It does **not**
describe a doctor portal or a receptionist role. Doctors are **data**, not users.
Do not add roles. Do not add a doctor dashboard.

---

## 6. Structure

```
src/
  app/
    (public)/            # home, about, departments, doctors, book, faq, contact
    (patient)/           # login, register, my-appointments
    (admin)/dashboard/   # overview, appointments, patients, doctors, departments, news, messages
    api/v1/              # REST route handlers
    fonts/
  components/
    ui/                  # shadcn primitives
    nabd/                # project components (PulseTrace, StatusBadge, SlotPicker, ...)
  content/ar.ts          # every user-visible string
  lib/
    db.ts  auth.ts  datetime.ts  validation/  services/
prisma/
  schema.prisma  seed.ts  migrations/
tests/
  unit/  e2e/
```

---

## 7. How you work

- **One phase per session.** Read `PHASES.md`, execute only the phase named in the prompt,
  then stop. Do not start the next phase.
- **Plan before you write.** List the files you will create or modify and wait for approval.
- **Never touch `prisma/schema.prisma` after Phase 1** without asking first. Schema drift
  mid-build is the single most expensive failure mode on this project.
- **Gate every phase:** `pnpm typecheck && pnpm lint && pnpm test` must pass before you
  report the phase complete.
- **Commit at the end of each phase.** Conventional commits, English, e.g.
  `feat(booking): add slot generation service and conflict-safe booking endpoint`.
- If a requirement in the prompt contradicts this file, say so and stop. Do not guess.
