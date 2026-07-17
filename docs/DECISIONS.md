# Design decisions

Short rationale for the choices most likely to come up in the oral defense.

### 1. Next.js App Router
One framework serves the public Arabic site, the patient portal, and the admin
dashboard, with Server Components reading the database directly for fast page
renders and Route Handlers for the REST API. The App Router's nested layouts and
route groups map cleanly onto the three areas (`(public)`, `(patient)`,
`(admin)`), and its file-based `loading`/`error`/`not-found` conventions gave us
designed loading and error states for free.

### 2. Prisma + PostgreSQL
Prisma gives a typed schema that is the single source of truth for the data
model, type-safe queries end to end, and versioned migrations. PostgreSQL was
required by the project plan and, crucially, supports the partial unique index
that makes booking concurrency-safe (see below).

### 3. A partial unique index, not application-level locking
"Check whether the slot is free, then insert" is a race: two requests can both
pass the check before either inserts. Instead a partial unique index
(`doctorId, startsAt WHERE status IN ('PENDING','CONFIRMED')`) makes the database
the arbiter — two concurrent bookings of one slot produce exactly one commit and
one `P2002`, which the API returns as a clean `409`. The `WHERE` clause also lets
a cancelled appointment free its slot for re-booking. This is enforced by the
schema and proven by a concurrent-insert test.

### 4. UTC in the database, Asia/Riyadh in the UI
Every instant is stored UTC and converted to Riyadh only at render time, through
a single module (`src/lib/datetime.ts`). This keeps arithmetic (slot generation,
cutoffs, overlaps) unambiguous and timezone-independent, and confines display
concerns — Arabic month names, Western digits — to one place. Recurring clinic
hours are stored as `HH:mm` wall-clock strings because they are rules, not
instants.

### 5. REST alongside Server Components
Reads that only render a page (department lists, a doctor profile) query Prisma
directly in a Server Component — no need for a network round-trip to our own API.
Every **write**, however, goes through a versioned `/api/v1` Route Handler with
Zod validation and a server-side role check. This matches the REST API named in
the project plan and keeps a single, auditable mutation surface.

### 6. Doctors are data, not users
The submitted plan describes exactly two roles — patient and admin. Doctors are
modelled as records an admin manages (profile + weekly availability), with no
login and no relation to `User`. This avoids a whole authentication surface and a
doctor portal that were never in scope, and keeps the role model to the two the
plan defends.

### 7. Auth.js v5 with Credentials + JWT
Email/password is the expected flow for a hospital account, so we use the
Credentials provider with bcrypt-hashed passwords and stateless JWT sessions
carrying `role`. The config is split into an edge-safe half (used by the
middleware that gates `/dashboard` and `/my-appointments`) and a Node-only half
that touches Prisma and bcrypt, so route protection runs at the edge without
bundling the database client.

### 8. Arabic-first, RTL-native, self-hosted fonts
There is no English UI and no language switcher: `<html dir="rtl" lang="ar">`,
logical CSS properties throughout, and every string in `src/content/ar.ts`. Fonts
(IBM Plex Sans Arabic + IBM Plex Mono) are self-hosted via `next/font/local` so
Arabic never falls back to a system face, and clinical data — times, dates, file
numbers — is set in the mono face, the actual vernacular of charts and
wristbands.
