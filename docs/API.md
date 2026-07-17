# واجهة REST — Nabd Hospital

كل عمليات الكتابة تمرّ عبر معالِجات مسار (Route Handlers) تحت `/api/v1`، وكل
واحدة تتحقّق من مدخلاتها بمخطط Zod (CLAUDE.md §2.5 / §2.7). القراءة العامة تقرأ
قاعدة البيانات مباشرة من مكوّنات الخادم.

## المصادقة والصلاحيات (Auth)

- الجلسات JWT عبر Auth.js v5 (مزوّد Credentials + bcrypt)، ويحمل الرمز الدور `role`.
- الوسيط (middleware) يحمي `/dashboard/*` (ADMIN) و`/my-appointments` (PATIENT).
- كل نقطة إدارية تستدعي `requireAdmin()`؛ نقاط المريض تتحقّق من الملكية.

## قالب الاستجابة

```jsonc
// نجاح
{ "data": { /* ... */ } }
// خطأ
{ "error": { "message": "رسالة عربية", "code": "CODE", "fields": { "field": ["..."] } } }
```

رموز الحالة: `200` نجاح، `201` إنشاء، `400` مدخلات غير صحيحة، `401` غير مسجّل،
`403` ممنوع، `404` غير موجود، `409` تعارض، `422` غير قابل للمعالجة، `500` خطأ خادم.

---

## المصادقة

### `POST /api/v1/auth/register`
تسجيل مريض جديد. عام.

- **الجسم**: `{ fullName, email, password(≥8), phone(05… أو +9665…), nationalId(10 أرقام), dateOfBirth(YYYY-MM-DD, ماضٍ), gender(MALE|FEMALE) }`
- **النجاح** `201`: `{ id, email, fullName, fileNumber }`
- **الأخطاء**: `400` تحقّق؛ `409` `EMAIL_TAKEN` / `NATIONAL_ID_TAKEN`.
- ينشئ `User` + `Patient` في معاملة واحدة، ويولّد رقم الملف التالي `NB-####`.

> تسجيل الدخول والخروج عبر مسارات Auth.js القياسية `/api/auth/*`.

---

## المواعيد والحجز

### `GET /api/v1/doctors/[id]/slots?date=YYYY-MM-DD`
أوقات يوم الطبيب. عام.

- **النجاح** `200`: `{ date, doctorId, isAcceptingPatients, slots: [{ startsAt, endsAt, isAvailable, reason }] }`
- `reason` أحد: `past | too_soon | timeoff | booked | null`.
- **الأخطاء**: `400` `INVALID_DATE` (شكل أو تاريخ غير حقيقي)؛ `404` `DOCTOR_NOT_FOUND`.

### `POST /api/v1/appointments`
حجز موعد. يتطلّب جلسة.

- **المريض**: يحجز لنفسه. **الإدارة**: تحجز حجزًا مباشرًا عبر `patientId`، ويُسمح لها بالأوقات القريبة (`too_soon`).
- **الجسم**: `{ doctorId, startsAt(ISO), reasonAr?, patientId?(إدارة) }`
- **النجاح** `201`: `{ id, startsAt, endsAt, status:"PENDING", reasonAr, doctorNameAr, departmentNameAr, fileNumber }`
- **الأخطاء**: `401`؛ `403` `NOT_A_PATIENT`؛ `404` `DOCTOR_NOT_FOUND`؛ `422` `INVALID_SLOT` / `NOT_ACCEPTING`؛ **`409` `SLOT_TAKEN`** من الفهرس الفريد الجزئي.
- لا «يفحص ثم يدرج» — يُدرج ويلتقط `P2002` ⇦ `409`.

### `PATCH /api/v1/appointments/[id]`
انتقال حالة الموعد. يتطلّب جلسة.

- **الجسم**: `{ action: "cancel" | "confirm" | "complete" | "no_show" }`
- **المريض**: `cancel` فقط، على موعده، وقبل الموعد بـ4 ساعات على الأقل.
- **الإدارة**: كل الانتقالات على أي موعد.
- **النجاح** `200`: `{ id, status }`
- **الأخطاء**: `401`؛ `403` `FORBIDDEN`؛ `404`؛ `409` `TOO_LATE` / `INVALID_TRANSITION`.

---

## رسائل التواصل

### `POST /api/v1/contact-messages`
إرسال رسالة تواصل. عام. يحوي حقل فخّ (honeypot) اسمه `website`.

- **الجسم**: `{ fullName, email, phone(سعودي), subject, body(≥10), website?(فخّ) }`
- **النجاح** `201`: `{ ok: true }` (إن امتلأ الفخّ يُرجَع نجاح دون تخزين).
- **الأخطاء**: `400` تحقّق.

### `PATCH /api/v1/contact-messages/[id]` — إدارة
- **الجسم**: `{ isRead: boolean }` · **النجاح** `200`.

---

## الأقسام — إدارة

### `POST /api/v1/departments`
- **الجسم**: `{ slug, nameAr, descriptionAr, icon, sortOrder?, isActive? }` · `201`.
- **الأخطاء**: `409` `SLUG_TAKEN`.

### `PATCH /api/v1/departments/[id]`
- تحديث جزئي (يشمل `sortOrder` لإعادة الترتيب و`isActive` للتفعيل) · `200`.

### `DELETE /api/v1/departments/[id]`
- `200`؛ `409` `DELETE_BLOCKED` إن ارتبط بأطباء أو مواعيد.

---

## الأطباء — إدارة

### `POST /api/v1/doctors`
- **الجسم**: `{ slug, fullNameAr, title, departmentId, bio, yearsExperience, photoUrl?, isAcceptingPatients? }` · `201`؛ `409` `SLUG_TAKEN`.

### `PATCH /api/v1/doctors/[id]` — تحديث جزئي · `200`.

### `DELETE /api/v1/doctors/[id]`
- `200`؛ **`409` `DELETE_BLOCKED`** إن كان لديه مواعيد مستقبلية فعّالة (أو أي مواعيد عبر قيد قاعدة البيانات).

### `PUT /api/v1/doctors/[id]/availability`
- استبدال كامل لأوقات العمل الأسبوعية في معاملة واحدة.
- **الجسم**: `{ availability: [{ dayOfWeek(0-6), startTime("HH:mm"), endTime("HH:mm"), slotMinutes(5-240) }] }` · `200`.

---

## الأخبار — إدارة

### `POST /api/v1/news`
- **الجسم**: `{ slug, titleAr, excerptAr, bodyAr, coverUrl?, published }` · `201`؛ `409` `SLUG_TAKEN`.
- `published:true` يضبط `publishedAt=now`، وإلا يبقى مسودة (`null`).

### `PATCH /api/v1/news/[id]`
- تحديث جزئي؛ تبديل `published` يحافظ على تاريخ النشر الأصلي عند إعادة النشر · `200`.

### `DELETE /api/v1/news/[id]` — `200`.
