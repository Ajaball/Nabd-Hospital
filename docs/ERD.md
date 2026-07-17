# Data model — ERD

The Prisma schema (`prisma/schema.prisma`) as an entity-relationship diagram.
All `DateTime` columns are stored in UTC.

```mermaid
erDiagram
  User ||--o| Patient : "has (PATIENT role)"
  User ||--o{ NewsPost : authors
  Patient ||--o{ Appointment : books
  Department ||--o{ Doctor : employs
  Department ||--o{ Appointment : categorizes
  Doctor ||--o{ Availability : "works"
  Doctor ||--o{ TimeOff : "is off"
  Doctor ||--o{ Appointment : "sees"

  User {
    string id PK
    string email UK
    string passwordHash
    string fullName
    string phone
    Role   role
    datetime createdAt
  }
  Patient {
    string id PK
    string userId FK,UK
    string fileNumber UK "NB-0001"
    string nationalId UK
    datetime dateOfBirth
    Gender gender
    BloodType bloodType "nullable"
    string address "nullable"
  }
  Department {
    string id PK
    string slug UK
    string nameAr
    string descriptionAr
    string icon "lucide name"
    int    sortOrder
    boolean isActive
  }
  Doctor {
    string id PK
    string slug UK
    string fullNameAr
    string title
    string departmentId FK
    string bio
    int    yearsExperience
    boolean isAcceptingPatients
  }
  Availability {
    string id PK
    string doctorId FK
    int    dayOfWeek "0=Sun..6=Sat"
    string startTime "HH:mm Riyadh"
    string endTime "HH:mm Riyadh"
    int    slotMinutes
  }
  TimeOff {
    string id PK
    string doctorId FK
    datetime startsAt
    datetime endsAt
    string reason "nullable"
  }
  Appointment {
    string id PK
    string patientId FK
    string doctorId FK
    string departmentId FK
    datetime startsAt "UTC"
    datetime endsAt
    AppointmentStatus status
    string reasonAr "nullable"
    datetime cancelledAt "nullable"
    Actor cancelledBy "nullable"
  }
  NewsPost {
    string id PK
    string slug UK
    string titleAr
    string excerptAr
    string bodyAr
    datetime publishedAt "null = draft"
    string authorId FK
  }
  Faq {
    string id PK
    string questionAr
    string answerAr
    string category
    int    sortOrder
    boolean isPublished
  }
  ContactMessage {
    string id PK
    string fullName
    string email
    string subjectAr
    string bodyAr
    boolean isRead
    datetime createdAt
  }
```

## Enums

- **Role** — `PATIENT`, `ADMIN`
- **Gender** — `MALE`, `FEMALE`
- **BloodType** — `A_POS`, `A_NEG`, `B_POS`, `B_NEG`, `AB_POS`, `AB_NEG`, `O_POS`, `O_NEG`
- **AppointmentStatus** — `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- **Actor** — `PATIENT`, `ADMIN`, `SYSTEM`

## The double-booking guard

A raw-SQL **partial unique index** — not expressible in the Prisma schema —
enforces one active appointment per doctor per start time:

```sql
CREATE UNIQUE INDEX appointment_no_double_booking
ON "Appointment" ("doctorId", "startsAt")
WHERE status IN ('PENDING', 'CONFIRMED');
```

Because the `WHERE` clause scopes the index to active statuses, a cancelled or
completed appointment frees its slot for re-booking, while two concurrent active
bookings of the same slot collide — one commits, the other raises Prisma `P2002`,
which the API turns into a `409`.
