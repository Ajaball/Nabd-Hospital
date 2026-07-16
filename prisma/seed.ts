/**
 * Seed data for Nabd Hospital.
 *
 * ALL DATA IN THIS FILE IS FICTIONAL. Doctor and patient names are invented and
 * do not refer to any real person. National IDs use a 9-prefix that no real
 * Saudi ID uses, so they cannot collide with a real identity. Medical content
 * is illustrative and is not medical advice.
 *
 * The dataset is deterministic (fixed PRNG seed) so every run produces the same
 * database — useful for demos and for the double-booking test.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  Role,
  Gender,
  BloodType,
  AppointmentStatus,
  Actor,
} from "@prisma/client";
import { prisma } from "../src/lib/db";

// --- deterministic RNG (mulberry32) -----------------------------------------
function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(20260716);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

// Riyadh is UTC+3 with no DST. Working hours are Riyadh wall-clock; the stored
// instant is UTC. So a 09:00 Riyadh slot is 06:00 UTC.
const RIYADH_OFFSET_H = 3;
function riyadhToUtc(y: number, m: number, d: number, hh: number, mm: number) {
  return new Date(Date.UTC(y, m, d, hh - RIYADH_OFFSET_H, mm, 0, 0));
}

// --- reference data ----------------------------------------------------------
const DEPARTMENTS = [
  {
    slug: "internal-medicine",
    nameAr: "الباطنية",
    icon: "stethoscope",
    descriptionAr:
      "تشخيص وعلاج أمراض البالغين المزمنة والحادة، من ضغط الدم والسكري إلى أمراض الجهاز الهضمي والغدد.",
  },
  {
    slug: "pediatrics",
    nameAr: "الأطفال",
    icon: "baby",
    descriptionAr:
      "رعاية صحية شاملة للأطفال من الولادة حتى سن المراهقة، تشمل المتابعة الدورية والتطعيمات.",
  },
  {
    slug: "orthopedics",
    nameAr: "العظام",
    icon: "bone",
    descriptionAr:
      "علاج إصابات وأمراض العظام والمفاصل والعمود الفقري، جراحيًا وتحفّظيًا، مع إعادة التأهيل.",
  },
  {
    slug: "dermatology",
    nameAr: "الجلدية",
    icon: "scan",
    descriptionAr:
      "تشخيص وعلاج أمراض الجلد والشعر والأظافر، والعناية بالحالات التجميلية والوقائية.",
  },
  {
    slug: "dentistry",
    nameAr: "الأسنان",
    icon: "smile",
    descriptionAr:
      "طب وجراحة الفم والأسنان، من الحشوات والتنظيف إلى علاج الجذور والتركيبات والتقويم.",
  },
  {
    slug: "emergency",
    nameAr: "الطوارئ",
    icon: "siren",
    descriptionAr:
      "استقبال الحالات الطارئة على مدار الساعة بفريق متخصص وتجهيزات إسعافية متكاملة.",
  },
] as const;

const DOCTORS = [
  { slug: "salman-alotaibi", fullNameAr: "د. سلمان العتيبي", title: "استشاري", dept: 0, ys: 18 },
  { slug: "maha-aldosari", fullNameAr: "د. مها الدوسري", title: "أخصائية", dept: 0, ys: 9 },
  { slug: "noura-alqahtani", fullNameAr: "د. نورة القحطاني", title: "استشارية", dept: 1, ys: 21 },
  { slug: "faisal-alharbi", fullNameAr: "د. فيصل الحربي", title: "أخصائي", dept: 1, ys: 7 },
  { slug: "abdulaziz-alshammari", fullNameAr: "د. عبدالعزيز الشمري", title: "استشاري", dept: 2, ys: 24 },
  { slug: "reem-alzahrani", fullNameAr: "د. ريم الزهراني", title: "أخصائية", dept: 2, ys: 11 },
  { slug: "lama-alghamdi", fullNameAr: "د. لمى الغامدي", title: "استشارية", dept: 3, ys: 15 },
  { slug: "tariq-almutairi", fullNameAr: "د. طارق المطيري", title: "أخصائي", dept: 3, ys: 6 },
  { slug: "hind-alsubaie", fullNameAr: "د. هند السبيعي", title: "استشارية", dept: 4, ys: 14 },
  { slug: "khalid-alanazi", fullNameAr: "د. خالد العنزي", title: "أخصائي", dept: 4, ys: 8 },
  { slug: "bandar-alrashidi", fullNameAr: "د. بندر الرشيدي", title: "استشاري", dept: 5, ys: 19 },
  { slug: "asma-albaqami", fullNameAr: "د. أسماء البقمي", title: "أخصائية", dept: 5, ys: 10 },
] as const;

function doctorBio(nameAr: string, deptAr: string, ys: number) {
  return `${nameAr} من الكوادر الطبية في قسم ${deptAr} بمستشفى نبض، بخبرة تمتد إلى ${ys} عامًا في تشخيص الحالات ومتابعتها ووضع خطط العلاج المناسبة لكل مريض.`;
}

const MALE_NAMES = ["أحمد", "محمد", "عبدالله", "خالد", "سعود", "ناصر", "فهد", "يوسف", "تركي", "ماجد"] as const;
const FEMALE_NAMES = ["سارة", "نورة", "ريم", "لطيفة", "هيا", "منال", "دانة", "شهد", "الجوهرة", "غادة"] as const;
const FAMILIES = ["السالم", "المطيري", "القحطاني", "العنزي", "الشهري", "الدوسري", "الغامدي", "الحربي", "العتيبي", "الرشيدي"] as const;
const DISTRICTS = ["حي النرجس", "حي الملقا", "حي الياسمين", "حي العليا", "حي الروضة", "حي قرطبة", "حي الربيع", "حي الصحافة"] as const;
const BLOOD: BloodType[] = [
  BloodType.A_POS, BloodType.A_NEG, BloodType.B_POS, BloodType.B_NEG,
  BloodType.AB_POS, BloodType.AB_NEG, BloodType.O_POS, BloodType.O_NEG,
];
const REASONS = [
  "استشارة عامة", "متابعة دورية", "ألم مستمر", "نتائج تحاليل", "تجديد وصفة",
  "فحص روتيني", "أعراض حادة", "استشارة ثانية",
] as const;

async function main() {
  console.log("Seeding Nabd Hospital (fictional data)…");

  // Idempotent: clear in dependency order.
  await prisma.appointment.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.newsPost.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const patientHash = bcrypt.hashSync("Patient@12345", 10);
  const adminHash = bcrypt.hashSync("Admin@12345", 10);

  // Admin.
  const admin = await prisma.user.create({
    data: {
      email: "admin@nabd.example",
      passwordHash: adminHash,
      fullName: "إدارة مستشفى نبض",
      phone: "+966500000000",
      role: Role.ADMIN,
    },
  });

  // Departments.
  const departments = [];
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    const d = DEPARTMENTS[i];
    departments.push(
      await prisma.department.create({
        data: {
          slug: d.slug,
          nameAr: d.nameAr,
          descriptionAr: d.descriptionAr,
          icon: d.icon,
          sortOrder: i,
          isActive: true,
        },
      }),
    );
  }

  // Doctors + weekly availability (Sun–Thu = dayOfWeek 0..4).
  const doctors = [];
  for (let i = 0; i < DOCTORS.length; i++) {
    const dd = DOCTORS[i];
    const dept = departments[dd.dept];
    const morning = i % 2 === 0;
    const start = morning ? "08:00" : "16:00";
    const end = morning ? "14:00" : "20:00";
    const doc = await prisma.doctor.create({
      data: {
        slug: dd.slug,
        fullNameAr: dd.fullNameAr,
        title: dd.title,
        departmentId: dept.id,
        bio: doctorBio(dd.fullNameAr, dept.nameAr, dd.ys),
        yearsExperience: dd.ys,
        isAcceptingPatients: i % 5 !== 0,
        availability: {
          create: [0, 1, 2, 3, 4].map((day) => ({
            dayOfWeek: day,
            startTime: start,
            endTime: end,
            slotMinutes: 30,
          })),
        },
      },
    });
    doctors.push({ ...doc, morning });
  }

  // Patients: NB-0001 … NB-0040.
  const patients = [];
  for (let n = 1; n <= 40; n++) {
    const isMale = rng() < 0.5;
    const first = isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const family = pick(FAMILIES);
    const fileNumber = `NB-${String(n).padStart(4, "0")}`;
    const birthYear = int(1955, 2018);
    const user = await prisma.user.create({
      data: {
        email: `patient${n}@example.com`,
        passwordHash: patientHash,
        fullName: `${first} ${family}`,
        phone: `+96650${String(int(1000000, 9999999))}`,
        role: Role.PATIENT,
        patient: {
          create: {
            fileNumber,
            // 9-prefix: no real Saudi national ID begins with 9.
            nationalId: `9${String(int(100000000, 999999999))}`,
            dateOfBirth: riyadhToUtc(birthYear, int(0, 11), int(1, 28), 0, 0),
            gender: isMale ? Gender.MALE : Gender.FEMALE,
            bloodType: rng() < 0.85 ? pick(BLOOD) : null,
            address: `${pick(DISTRICTS)}، الرياض`,
          },
        },
      },
      include: { patient: true },
    });
    if (user.patient) patients.push(user.patient);
  }

  // Appointments: ~220 across the last 90 and next 30 days.
  const now = new Date();
  const activeSlots = new Set<string>(); // doctorId|iso -> guards the unique index
  let created = 0;
  let attempts = 0;
  const TARGET = 220;

  while (created < TARGET && attempts < TARGET * 8) {
    attempts++;
    const doc = pick(doctors);
    const dayOffset = int(-90, 30);
    const base = new Date(now.getTime() + dayOffset * 86400000);
    const y = base.getUTCFullYear();
    const mo = base.getUTCMonth();
    const dd = base.getUTCDate();
    const dow = new Date(Date.UTC(y, mo, dd)).getUTCDay(); // 0..6
    if (dow > 4) continue; // clinic runs Sun–Thu only

    const startHour = doc.morning ? int(8, 13) : int(16, 19);
    const startMin = rng() < 0.5 ? 0 : 30;
    const startsAt = riyadhToUtc(y, mo, dd, startHour, startMin);
    const endsAt = new Date(startsAt.getTime() + 30 * 60000);
    const isPast = startsAt.getTime() < now.getTime();

    // Decide status.
    let status: AppointmentStatus;
    const r = rng();
    if (isPast) {
      status = r < 0.05 ? AppointmentStatus.NO_SHOW : r < 0.13 ? AppointmentStatus.CANCELLED : AppointmentStatus.COMPLETED;
    } else {
      status = r < 0.08 ? AppointmentStatus.CANCELLED : r < 0.28 ? AppointmentStatus.PENDING : AppointmentStatus.CONFIRMED;
    }

    // Enforce the double-booking invariant for active statuses.
    const isActive = status === AppointmentStatus.PENDING || status === AppointmentStatus.CONFIRMED;
    const key = `${doc.id}|${startsAt.toISOString()}`;
    if (isActive) {
      if (activeSlots.has(key)) continue;
      activeSlots.add(key);
    }

    const patient = pick(patients);
    const createdAt = new Date(
      Math.min(startsAt.getTime(), now.getTime()) - int(1, 20) * 86400000,
    );
    const cancelled = status === AppointmentStatus.CANCELLED;

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doc.id,
        departmentId: doc.departmentId,
        startsAt,
        endsAt,
        status,
        reasonAr: rng() < 0.7 ? pick(REASONS) : null,
        createdAt,
        cancelledAt: cancelled ? new Date(createdAt.getTime() + 86400000) : null,
        cancelledBy: cancelled ? (rng() < 0.5 ? Actor.PATIENT : Actor.ADMIN) : null,
      },
    });
    created++;
  }

  // News.
  const NEWS = [
    ["افتتاح جناح جديد للعناية المركزة", "افتتح مستشفى نبض جناحًا حديثًا للعناية المركزة يضم أسرّة مجهّزة بأحدث أجهزة المراقبة.", true],
    ["حملة تطعيم موسمية للأطفال", "تنطلق حملة التطعيم الموسمية في قسم الأطفال، وتستقبل العيادة الحجوزات طوال الأسبوع.", true],
    ["مواعيد العمل خلال شهر رمضان", "يعلن المستشفى عن مواعيد العيادات خلال شهر رمضان المبارك مع استمرار عمل الطوارئ على مدار الساعة.", true],
    ["إطلاق العيادات المسائية", "أضاف المستشفى فترات مسائية في عدة أقسام لتخفيف الازدحام وتوسيع خيارات الحجز.", true],
    ["توسعة قسم الطوارئ", "اكتملت توسعة قسم الطوارئ لرفع الطاقة الاستيعابية وتقليل زمن الانتظار.", true],
    ["إرشادات للعناية بصحة القلب", "ينشر قسم الباطنية إرشادات عملية للحفاظ على صحة القلب من خلال التغذية والنشاط البدني.", true],
    ["يوم توعوي عن مرض السكري", "ينظّم المستشفى يومًا توعويًا مجانيًا للكشف المبكر عن السكري وتقديم الاستشارات.", true],
    ["تدشين خدمة الحجز الإلكتروني", "أصبح بإمكان المراجعين حجز مواعيدهم إلكترونيًا واختيار الطبيب والوقت المناسب.", false],
  ] as const;
  for (let i = 0; i < NEWS.length; i++) {
    const [titleAr, bodyAr, published] = NEWS[i];
    await prisma.newsPost.create({
      data: {
        slug: `news-${i + 1}`,
        titleAr,
        excerptAr: bodyAr.slice(0, 90),
        bodyAr: `${bodyAr}\n\nيأتي ذلك ضمن جهود مستشفى نبض المستمرة لتطوير الخدمات الصحية وتحسين تجربة المراجعين.`,
        authorId: admin.id,
        publishedAt: published ? new Date(now.getTime() - (i + 1) * 5 * 86400000) : null,
      },
    });
  }

  // FAQs: 3 categories × 4.
  const FAQS: [string, string, string][] = [
    ["المواعيد", "كيف أحجز موعدًا؟", "يمكنك الحجز إلكترونيًا باختيار القسم ثم الطبيب ثم الوقت المتاح، أو بزيارة الاستقبال."],
    ["المواعيد", "هل يمكنني إلغاء موعدي؟", "نعم، يمكنك إلغاء الموعد قبل موعده بأربع ساعات على الأقل من صفحة مواعيدي."],
    ["المواعيد", "ماذا أحضر معي في الموعد؟", "أحضر بطاقة الهوية ورقم الملف وأي تقارير أو تحاليل سابقة إن وُجدت."],
    ["المواعيد", "هل تتوفر مواعيد مسائية؟", "نعم، توفّر عدة أقسام فترات مسائية. تظهر الأوقات المتاحة عند اختيار الطبيب."],
    ["الخدمات", "هل يعمل قسم الطوارئ ليلًا؟", "قسم الطوارئ يعمل على مدار الساعة طوال أيام الأسبوع."],
    ["الخدمات", "هل يوجد قسم للأطفال؟", "نعم، قسم الأطفال يقدّم رعاية متكاملة من الولادة حتى سن المراهقة."],
    ["الخدمات", "هل تقدّمون خدمة التطعيمات؟", "نعم، تتوفر التطعيمات الموسمية والدورية في قسم الأطفال حسب الجدول المعتمد."],
    ["الخدمات", "أين يقع المستشفى؟", "يقع مستشفى نبض في مدينة الرياض، وتجدون العنوان وأوقات العمل في صفحة تواصل معنا."],
    ["الحساب", "كيف أنشئ حسابًا؟", "من صفحة إنشاء حساب، أدخل بياناتك ورقم جوالك لإتمام التسجيل."],
    ["الحساب", "نسيت كلمة المرور، ماذا أفعل؟", "تواصل مع الاستقبال لإعادة تعيين كلمة المرور مؤقتًا حتى تتوفر خدمة الاستعادة الذاتية."],
    ["الحساب", "كيف أطّلع على مواعيدي؟", "بعد تسجيل الدخول، تعرض صفحة مواعيدي كل مواعيدك القادمة والسابقة وحالتها."],
    ["الحساب", "هل بياناتي آمنة؟", "نلتزم بحماية بياناتك واستخدامها لأغراض الرعاية الصحية فقط."],
  ];
  for (let i = 0; i < FAQS.length; i++) {
    const [category, questionAr, answerAr] = FAQS[i];
    await prisma.faq.create({
      data: { category, questionAr, answerAr, sortOrder: i, isPublished: true },
    });
  }

  // Contact messages: 15, of which 4 unread.
  for (let i = 1; i <= 15; i++) {
    const isMale = rng() < 0.5;
    const name = `${isMale ? pick(MALE_NAMES) : pick(FEMALE_NAMES)} ${pick(FAMILIES)}`;
    await prisma.contactMessage.create({
      data: {
        fullName: name,
        email: `visitor${i}@example.com`,
        phone: `+96650${String(int(1000000, 9999999))}`,
        subjectAr: pick([
          "استفسار عن المواعيد",
          "شكر وتقدير",
          "استفسار عن قسم",
          "طلب معلومات",
          "ملاحظة على الخدمة",
        ]),
        bodyAr: "السلام عليكم، لدي استفسار بخصوص الخدمات المتاحة وأوقات العمل، وأشكر لكم حسن تعاونكم.",
        isRead: i > 4, // first four remain unread
        createdAt: new Date(now.getTime() - i * 2 * 86400000),
      },
    });
  }

  console.log(
    `Done. 1 admin, ${departments.length} departments, ${doctors.length} doctors, ` +
      `${patients.length} patients, ${created} appointments, ${NEWS.length} news, ` +
      `${FAQS.length} FAQs, 15 messages.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
