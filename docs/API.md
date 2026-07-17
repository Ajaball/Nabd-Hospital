# REST API — `/api/v1`

Every mutation goes through a Route Handler (CLAUDE.md §2.5). Each parses its
body with a Zod schema from `src/lib/validation/` and, for admin routes, checks
`role === 'ADMIN'` server-side. Request bodies are JSON; responses are JSON.

Common error responses: `400 INVALID_JSON`, `422 VALIDATION_ERROR`
(`{ error, issues? }`), `401 UNAUTHORIZED`, `500 INTERNAL_ERROR`.

Auth itself is handled by Auth.js at `/api/auth/*` (sign-in, callback, session,
CSRF) — outside the `/api/v1` surface.

---

## Public

### `POST /api/v1/auth/register`
Create a patient account. **Auth:** none (rate-limited per IP).
**Body** (`registerSchema`): `fullName`, `email`, `phone` (Saudi: `05XXXXXXXX`
or `+9665XXXXXXXX`), `nationalId` (10 digits), `dateOfBirth` (`YYYY-MM-DD`, past),
`gender` (`MALE|FEMALE`), `password` (≥8).
**Responses:** `201 { ok, fileNumber }` · `409 EMAIL_TAKEN` · `422` · `429 RATE_LIMITED`.

### `POST /api/v1/contact-messages`
Submit the contact form. **Auth:** none.
**Body** (`contactMessageSchema`): `fullName`, `email`, `phone`, `subject`,
`body`, `website` (honeypot — must be empty; a filled value is silently accepted
and discarded).
**Responses:** `201 { ok }` · `422`.

### `GET /api/v1/doctors/[id]/slots?date=YYYY-MM-DD`
The day's slots for a doctor. **Auth:** none.
**Responses:** `200 { slots: [{ startsAt, endsAt, isAvailable, reason }] }`
(`reason` ∈ `cutoff | booked | timeoff | null`) · `422 INVALID_DATE` ·
`404 DOCTOR_NOT_FOUND`.

---

## Appointments

### `POST /api/v1/appointments`
Book an appointment. **Auth:** `PATIENT` (books for self) or `ADMIN` (walk-in;
pass `patientId`).
**Body** (`createAppointmentSchema`): `doctorId`, `startsAt` (ISO instant),
`reasonAr?`, `patientId?` (admin only).
The slot is validated against the live generator (working hours, 2-hour cutoff,
time-off). The insert relies on the partial unique index for concurrency:
two concurrent bookings of one slot → exactly one `201` and one `409`.
**Responses:** `201 { ok, appointment }` · `409 SLOT_TAKEN` ·
`422 SLOT_UNAVAILABLE` · `403 NO_PATIENT` · `404 DOCTOR_NOT_FOUND` · `401`.

### `PATCH /api/v1/appointments/[id]`
Change status. **Auth:** `PATIENT` (only `cancel`, on own appointment,
`PENDING`/`CONFIRMED`, ≥4h out) or `ADMIN` (any of `confirm`/`complete`/
`noShow`/`cancel`, any appointment).
**Body** (`appointmentActionSchema`): `{ action: "cancel"|"confirm"|"complete"|"noShow" }`.
**Responses:** `200 { ok, status }` · `409 NOT_CANCELLABLE` · `404` (not found or
not owned) · `403` (patient using a non-cancel action) · `401`.

---

## Admin catalog (all require `ADMIN`)

### Departments
- `POST /api/v1/departments` — create. Body (`departmentCreateSchema`): `slug`,
  `nameAr`, `descriptionAr`, `icon`. → `201` · `409 SLUG_TAKEN` · `422`.
- `PATCH /api/v1/departments/[id]` — edit / activate-deactivate / reorder. Body
  (`departmentUpdateSchema`): any of `nameAr`, `descriptionAr`, `icon`,
  `isActive`, or `move: "up"|"down"` (swaps `sortOrder` with a neighbour).
  → `200` · `404` · `422`.

### Doctors
- `POST /api/v1/doctors` — create. Body (`doctorCreateSchema`): `slug`,
  `fullNameAr`, `title`, `departmentId`, `bio`, `yearsExperience`,
  `isAcceptingPatients?`. → `201` · `409 SLUG_TAKEN` · `422`.
- `PATCH /api/v1/doctors/[id]` — edit / toggle accepting. Body
  (`doctorUpdateSchema`, all optional). → `200` · `404` · `422`.
- `DELETE /api/v1/doctors/[id]` — blocked when the doctor has upcoming
  appointments. → `200` · `409 HAS_FUTURE_APPOINTMENTS` (or `HAS_APPOINTMENTS`).
- `PUT /api/v1/doctors/[id]/availability` — replace weekly hours in one
  transaction. Body (`availabilitySchema`): `{ slots: [{ dayOfWeek, startTime,
  endTime, slotMinutes }] }`. → `200` · `404` · `422`.

### News
- `POST /api/v1/news` — create (starts as a draft). Body (`newsCreateSchema`):
  `slug`, `titleAr`, `excerptAr`, `bodyAr`. → `201` · `409 SLUG_TAKEN` · `422`.
- `PATCH /api/v1/news/[id]` — edit / publish. Body (`newsUpdateSchema`):
  `titleAr?`, `excerptAr?`, `bodyAr?`, `publish?` (sets/clears `publishedAt`).
  → `200` · `404` · `422`.
- `DELETE /api/v1/news/[id]` — → `200` · `404`.

### Messages
- `PATCH /api/v1/contact-messages/[id]` — mark read. Body: `{ isRead: boolean }`.
  → `200` · `404` · `422`.
