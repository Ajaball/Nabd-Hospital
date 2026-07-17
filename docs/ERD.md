# مخطط قاعدة البيانات — Nabd Hospital (ERD)

النموذج الكامل معرّف في [`prisma/schema.prisma`](../prisma/schema.prisma). كل
حقول `DateTime` مخزّنة بتوقيت UTC وتُعرض بتوقيت آسيا/الرياض عبر
[`src/lib/datetime.ts`](../src/lib/datetime.ts).

> **الأطباء بيانات، لا مستخدمون** — لا توجد علاقة بين `Doctor` و`User` (CLAUDE.md §5).

```mermaid
erDiagram
  User ||--o| Patient : "1:1"
  User ||--o{ NewsPost : "author"
  Patient ||--o{ Appointment : "books"
  Department ||--o{ Doctor : "has"
  Department ||--o{ Appointment : "in"
  Doctor ||--o{ Availability : "weekly hours"
  Doctor ||--o{ TimeOff : "blocks"
  Doctor ||--o{ Appointment : "sees"

  User {
    string id PK
    string email UK
    string passwordHash
    string fullName
    string phone
    Role   role "PATIENT | ADMIN"
    datetime createdAt
  }

  Patient {
    string id PK
    string userId FK "unique"
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
    string photoUrl "nullable"
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
    datetime startsAt "UTC"
    datetime endsAt "UTC"
    string reason "nullable"
  }

  Appointment {
    string id PK
    string patientId FK
    string doctorId FK
    string departmentId FK
    datetime startsAt "UTC"
    datetime endsAt "UTC"
    AppointmentStatus status "PENDING|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW"
    string reasonAr "nullable"
    string notesAr "nullable"
    datetime createdAt
    datetime cancelledAt "nullable"
    Actor  cancelledBy "nullable"
  }

  NewsPost {
    string id PK
    string slug UK
    string titleAr
    string excerptAr
    string bodyAr
    string coverUrl "nullable"
    datetime publishedAt "nullable = draft"
    string authorId FK
    datetime createdAt
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
    string phone
    string subjectAr
    string bodyAr
    boolean isRead
    datetime createdAt
  }
```

## الفهرس الحاسم — منع الحجز المزدوج

لا يُعبَّر عنه في مخطط Prisma لأنه فهرس فريد **جزئي** (partial unique index)،
ويُنشأ في هجرة SQL خام:

```sql
CREATE UNIQUE INDEX appointment_no_double_booking
ON "Appointment" ("doctorId", "startsAt")
WHERE status IN ('PENDING', 'CONFIRMED');
```

بهذا الفهرس، أي محاولتين متزامنتين لحجز الطبيب نفسه في اللحظة نفسها تُنتجان
نجاحًا واحدًا (`201`) وتعارضًا نظيفًا واحدًا (`409` من خطأ Prisma `P2002`)،
دون الاعتماد على «افحص ثم أدرج» على مستوى التطبيق. وبما أن الفهرس جزئي، فإن
إلغاء موعد يحرّر اللحظة لتُحجز من جديد.
