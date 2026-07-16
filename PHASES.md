# Nabd Hospital — Build Phases

Nine phases. **One fresh Claude Code session per phase.** Copy the phase block verbatim
as your first message. `CLAUDE.md` is read automatically — do not paste it.

Each phase ends with a gate. Do not move on until the gate passes.

---

## Phase 0 — Scaffold & prove the hard parts

```
Read CLAUDE.md. Execute Phase 0 only, then stop.

Scaffold the project:
- pnpm create next-app: TypeScript, App Router, Tailwind v4, src/ dir, no ESLint default
  (we configure our own), import alias @/*
- Install: prisma @prisma/client next-auth@beta bcryptjs zod react-hook-form
  @hookform/resolvers recharts lucide-react date-fns date-fns-tz
- Dev deps: vitest @vitejs/plugin-react @playwright/test eslint typescript-eslint prettier
- Init shadcn/ui with our tokens (not the default slate theme)

Then prove the three things that are expensive to retrofit:

1. RTL + fonts. Download the IBM Plex Sans Arabic (400/500/600/700) and IBM Plex Mono
   (400/500) woff2 files into src/app/fonts/ and wire them with next/font/local. Set
   <html dir="rtl" lang="ar">. Expose them as --font-sans and --font-mono.
2. Design tokens. Put the exact palette, status colors, radii, shadow, and type scale from
   CLAUDE.md §4 into src/app/globals.css using Tailwind v4's @theme directive. Do not
   invent extra colors.
3. The signature. Build components/nabd/PulseTrace.tsx: an inline SVG ECG waveform that
   animates its stroke-dashoffset once over 1.2s in --pulse, with a `variant` prop of
   "hero" (large, animates) or "rule" (1px hairline section divider, static). Respect
   prefers-reduced-motion by rendering the final frame immediately.

Deliver a single page at / containing: the PulseTrace hero, an <h1> reading «مستشفى نبض»,
a body paragraph, a primary button, and one PulseTrace rule — all in the real fonts and
tokens. Nothing else.

Also create:
- .env.example with DATABASE_URL and AUTH_SECRET
- src/content/ar.ts exporting an empty typed object tree ready to fill
- package.json scripts: dev, build, typecheck, lint, test, test:e2e, db:push, db:seed,
  db:studio
- .gitignore, README.md stub

GATE: `pnpm dev` renders the page in IBM Plex Sans Arabic, text flows right-to-left,
the ECG trace draws once. `pnpm typecheck && pnpm lint` pass. Screenshot it, then commit.
```

> **Why first:** RTL, font loading, and the design tokens are the three things that are
> agony to add later. Prove them on day one against an empty page, not against 40 screens.

---

## Phase 1 — Schema & seed

```
Read CLAUDE.md. Execute Phase 1 only, then stop.

Design and implement the full Prisma schema. This is the last time the schema changes,
so think it through and show it to me before running the migration.

Models:
- User        — id, email (unique), passwordHash, fullName, phone, role (PATIENT|ADMIN),
                createdAt. Auth identity only.
- Patient     — 1:1 User. fileNumber (unique, human-readable e.g. NB-0001), nationalId,
                dateOfBirth, gender, bloodType?, address?
- Department  — slug (unique), nameAr, descriptionAr, icon (lucide name), sortOrder,
                isActive
- Doctor      — slug (unique), fullNameAr, title (e.g. استشاري), departmentId, bio,
                photoUrl?, yearsExperience, isAcceptingPatients
                NOTE: doctors are data, not users. No relation to User.
- Availability — doctorId, dayOfWeek (0-6), startTime, endTime, slotMinutes (default 30).
                A doctor's recurring weekly working hours.
- TimeOff     — doctorId, startsAt, endsAt, reason. Blocks slot generation.
- Appointment — patientId, doctorId, departmentId, startsAt (UTC), endsAt,
                status (PENDING|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW), reasonAr?,
                notesAr?, createdAt, cancelledAt?, cancelledBy?
- NewsPost    — slug (unique), titleAr, excerptAr, bodyAr, coverUrl?, publishedAt?,
                authorId
- Faq         — questionAr, answerAr, category, sortOrder, isPublished
- ContactMessage — fullName, email, phone, subjectAr, bodyAr, isRead, createdAt

Critical: prevent double-booking at the DATABASE level, not in application code.
Add a raw-SQL migration creating a partial unique index:

  CREATE UNIQUE INDEX appointment_no_double_booking
  ON "Appointment" ("doctorId", "startsAt")
  WHERE status IN ('PENDING', 'CONFIRMED');

Two concurrent requests for the same slot must produce one success and one clean
409 Conflict. Application-level "check then insert" is a race condition and will be
challenged in the oral defense — do not rely on it.

Then write prisma/seed.ts. All data fictional (header comment saying so), all Arabic
natural and Saudi-appropriate:
- 6 departments (باطنية، أطفال، عظام، جلدية، أسنان، طوارئ) with real descriptions
- 12 doctors spread across them, with availability covering Sun–Thu
- 1 admin user, 40 patients with sequential file numbers
- ~220 appointments: a realistic mix across the last 90 days and next 30, weighted so
  the dashboard KPIs look plausible (mostly COMPLETED in the past, mostly CONFIRMED in
  the future, ~8% CANCELLED, ~5% NO_SHOW)
- 8 news posts, 12 FAQs across 3 categories, 15 contact messages (4 unread)

GATE: `pnpm db:push && pnpm db:seed` succeeds. `pnpm db:studio` shows populated tables.
Write a Vitest test proving the partial index rejects a duplicate booking. Commit.
```

> **Why seed now:** every screen after this gets built against real-looking data. Building
> UI against empty tables produces layouts that collapse the moment data arrives.

---

## Phase 2 — Auth & access control

```
Read CLAUDE.md. Execute Phase 2 only, then stop.

Auth.js v5, Credentials provider, bcrypt, JWT sessions with `role` on the token.

- src/lib/auth.ts — the config. Extend the Session type so session.user.role is typed.
- Middleware: /dashboard/* requires ADMIN. /my-appointments requires PATIENT.
  Unauthorized → redirect to the correct login with a callbackUrl.
- Patient login (/login) and register (/register) — react-hook-form + Zod, Arabic
  validation messages from src/content/ar.ts.
- Admin login (/dashboard/login) — visually distinct, no register link.
- POST /api/v1/auth/register — Zod-validated, hashes the password, creates User + Patient
  in one transaction, generates the next fileNumber.
- Rate-limit login attempts (simple in-memory counter is fine at this scale; note the
  limitation in a comment).

Registration must reject: duplicate email, weak password (<8 chars), invalid Saudi phone
(+9665XXXXXXXX or 05XXXXXXXX), invalid national ID length.

GATE: register a patient, log in as them, get bounced from /dashboard; log in as admin,
reach /dashboard. `pnpm typecheck && pnpm lint && pnpm test` pass. Commit.
```

---

## Phase 3 — Public site

```
Read CLAUDE.md. Execute Phase 3 only, then stop.

Build all eight public pages from the project plan, against real seed data. Server
Components reading the DB directly (reads may bypass REST; writes may not).

- /                    Home. PulseTrace hero + one clear sentence + primary CTA «احجز موعدك».
                       Below: the six departments as a wayfinding directory board, three
                       featured doctors, latest three news posts. No stock photos.
- /about               نبذة عن المستشفى. Real prose, a short history, the numbers that
                       matter (departments, doctors, years) set in IBM Plex Mono.
- /departments         Directory board of all six.
- /departments/[slug]  Department detail + its doctors + CTA to book within it.
- /doctors             Staff board. Filter by department (URL search param, not client state).
- /doctors/[slug]      Doctor profile: bio, department, experience, weekly availability
                       rendered as a readable table, CTA to book with this doctor.
- /faq                 Accordion grouped by the three categories.
- /contact             Form → POST /api/v1/contact-messages (Zod, honeypot field).
                       Plus hospital address, phone, and hours.

Shared: header with RTL nav + login link, footer, mobile nav (Sheet). Every page has
proper Metadata (Arabic title/description) and a semantic heading hierarchy.

Do NOT build the booking flow yet — the CTAs link to /book, which can 404 for now.

GATE: all eight pages render with seed data, responsive at 375px / 768px / 1440px,
zero hardcoded strings outside src/content/ar.ts. Screenshot each. Commit.
```

---

## Phase 4 — The booking engine

```
Read CLAUDE.md. Execute Phase 4 only, then stop.

This is the technical core of the project. It gets the most care.

1. src/lib/services/slots.ts — pure, fully unit-tested, no DB calls inside:
     generateSlots({ availability, timeOff, existingAppointments, date, now })
       → Slot[] { startsAt, endsAt, isAvailable, reason? }
   Rules: expand the weekly Availability for that weekday into slotMinutes intervals;
   subtract TimeOff overlaps; subtract PENDING/CONFIRMED appointments; mark anything
   less than 2 hours from `now` unavailable. All arithmetic in UTC; only formatting
   touches Asia/Riyadh.

2. REST:
     GET  /api/v1/doctors/[id]/slots?date=YYYY-MM-DD  → the day's slots
     POST /api/v1/appointments                        → book
     PATCH /api/v1/appointments/[id]                  → cancel (patient: own, PENDING/
                                                        CONFIRMED, ≥4h out)
   POST wraps the insert in a transaction and catches Prisma P2002 from the partial
   unique index → 409 with a clear Arabic message. Never pre-check and then insert.

3. /book — a three-step flow, step in the URL (?step=doctor&dept=...), not React state,
   so refresh and back-button work:
     1) choose department → 2) choose doctor → 3) choose date + slot → confirm
   Unauthenticated users hit login at confirm with a callbackUrl back into the flow.
   The date picker shows Sun–Thu only. Slots render as a grid; taken slots are visibly
   disabled with a reason, not hidden.
   Confirmation renders as an appointment slip: file number, doctor, department, date,
   time — all in IBM Plex Mono, tabular-nums, 4px radius, printable.

4. /my-appointments — patient portal. Upcoming and past, StatusBadge per CLAUDE.md §4,
   cancel with a confirm dialog.

GATE: Vitest covers slots.ts including the DST-free Riyadh case, the 2-hour cutoff, and
a time-off overlap. A test fires two concurrent POSTs at one slot and asserts exactly one
201 and one 409. Booking works end to end in the browser. Commit.
```

> **Why this is the differentiator:** every hospital project has CRUD. Almost none of them
> handle the concurrent-booking race correctly. This is the part worth defending.

---

## Phase 5 — Admin dashboard

```
Read CLAUDE.md. Execute Phase 5 only, then stop.

Six admin screens from the project plan. Consistent table component, server-side
pagination + filtering via URL search params.

- /dashboard              KPI overview: today's appointments, this week's total, active
                          patients, cancellation rate — figures in IBM Plex Mono. Two
                          Recharts: appointments per day (last 30) and appointments per
                          department (bar). Recent activity list.
- /dashboard/appointments Table: filter by status/department/doctor/date-range, search by
                          patient name or file number. Row actions: confirm, complete,
                          mark no-show, cancel. Admin can also create a walk-in booking
                          (reuses the Phase 4 POST — same conflict safety).
- /dashboard/patients     Table + detail drawer showing that patient's appointment history.
- /dashboard/doctors      CRUD + the availability editor (weekly grid). Deleting a doctor
                          with future appointments must be blocked with a clear message.
- /dashboard/departments  CRUD + reorder + activate/deactivate.
- /dashboard/news         CRUD, draft vs published, publishedAt.
- /dashboard/messages     Contact inbox, mark read, unread count badge in the nav.

Every mutation goes through /api/v1/*. Every endpoint checks role === 'ADMIN' server-side —
hiding a button is not authorization.

GATE: all six screens work against seed data, charts render real numbers, `pnpm typecheck
&& pnpm lint && pnpm test` pass. Screenshot each. Commit.
```

---

## Phase 6 — Polish

```
Read CLAUDE.md. Execute Phase 6 only, then stop.

The difference between a student project and a product is entirely in this phase.

- loading.tsx skeletons for every route segment that fetches
- error.tsx boundaries + a designed 404 and 500 (in Arabic, with a way out)
- Empty states for every list: an invitation to act, never "لا توجد بيانات"
- Toasts on every mutation, wording matching the button that triggered it
- Optimistic UI on cancel and status changes, with rollback
- Focus-visible rings on everything interactive, in --teal
- Full keyboard path through the booking flow
- aria-labels on icon-only buttons; the slot grid announces its state to screen readers
- prefers-reduced-motion honored globally
- Color contrast ≥ 4.5:1 verified on every text/background pair actually used
- Open Graph image, favicon, apple-touch-icon, manifest basics
- Verify: 375px, 768px, 1440px, and 1920px

Then a self-critique pass: open every screen and remove one thing from each that isn't
doing a job.

GATE: no raw loading flashes, no unstyled error, no empty list without a designed state.
Lighthouse ≥ 90 on performance and ≥ 95 on accessibility for / and /book. Commit.
```

---

## Phase 7 — Tests & documentation

```
Read CLAUDE.md. Execute Phase 7 only, then stop.

Unit (Vitest):
- slots.ts — full branch coverage
- validation schemas — the Saudi phone and national-ID rules
- the fileNumber generator
- the double-booking index

E2E (Playwright), each a story an examiner can watch:
- patient registers → books → sees it in /my-appointments → cancels
- concurrent booking → one succeeds, one shows the 409 message
- admin logs in → confirms an appointment → it updates in the patient's view
- unauthenticated user is redirected from /dashboard

Docs:
- README.md (Arabic primary, English section below): what it is, stack, setup, scripts,
  env vars, demo credentials, deployment
- docs/ERD.md — Mermaid ER diagram of the schema
- docs/API.md — every /api/v1 endpoint: method, path, auth, request Zod shape, responses
  including error codes
- docs/DECISIONS.md — 6–8 short entries: why Next.js App Router, why Prisma, why a partial
  unique index instead of app-level locking, why UTC storage, why no doctor portal, why
  REST alongside Server Components. Two or three sentences each.

DECISIONS.md is the highest-leverage file in the repo for the oral defense. Write it
carefully.

GATE: `pnpm test && pnpm test:e2e` green. Commit.
```

---

## Phase 8 — Deploy

```
Read CLAUDE.md. Execute Phase 8 only, then stop.

- Neon Postgres project, connection pooling on, DATABASE_URL + DIRECT_URL set
- prisma migrate deploy against it, then seed
- Vercel project, env vars, production deploy
- Verify on the live URL: booking, admin login, all charts, mobile
- Seed a clean demo dataset with obvious credentials, documented in the README
- Add a GitHub Action: typecheck + lint + unit tests on push

GATE: a working public URL, a demo patient login, a demo admin login. Tag v1.0.0.
```

---

## Deliberately out of scope

The project plan lists these as **future features**. Do not build them. If they appear in
a prompt, refuse and point at this line.

- PWA / offline support
- Push notifications
- Electronic medical records (سجل طبي إلكتروني)
- Advanced statistical reports beyond the basic KPI dashboard
- A doctor portal or receptionist role
- Payments, insurance, lab results, pharmacy

Scope creep is what makes graduation projects arrive at week 14 at 70% done. The plan is
the contract.
