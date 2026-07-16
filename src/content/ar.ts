/**
 * The single source of every user-visible string (CLAUDE.md §2.2). Nothing the
 * user reads — labels, validation errors, toasts, empty states — is written
 * inline in a component. Later phases fill in their sections here.
 *
 * Voice: formal Modern Standard Arabic, native Riyadh register, active voice,
 * sentence case. Never translated-sounding.
 */

export const ar = {
  site: {
    name: "مستشفى نبض",
    // A short line under the wordmark; used in header/footer.
    tagline: "رعاية صحية موثوقة",
    city: "الرياض",
    addressLine: "طريق الملك عبدالعزيز، حي الملقا، الرياض",
    phone: "+966112000000",
    phoneDisplay: "011 200 0000",
    emergencyPhone: "997",
    email: "info@nabd.example",
    hoursWeekdays: "الأحد – الخميس: 8:00 صباحًا – 8:00 مساءً",
    hoursWeekend: "الجمعة – السبت: العيادات مغلقة",
    hoursEmergency: "قسم الطوارئ يعمل على مدار الساعة",
    foundedYear: 2009,
  },

  nav: {
    home: "الرئيسية",
    about: "عن المستشفى",
    departments: "الأقسام",
    doctors: "الأطباء",
    faq: "الأسئلة الشائعة",
    contact: "تواصل معنا",
    login: "تسجيل الدخول",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    menuTitle: "التنقّل",
  },

  actions: {
    bookAppointment: "احجز موعدك",
    viewDepartment: "تفاصيل القسم",
    viewDoctor: "الملف الشخصي",
    viewAllDepartments: "كل الأقسام",
    viewAllDoctors: "كل الأطباء",
    viewAllNews: "كل الأخبار",
    backToDepartments: "عودة إلى الأقسام",
    backToDoctors: "عودة إلى الأطباء",
    send: "أرسل الرسالة",
    sending: "جارٍ الإرسال…",
  },

  common: {
    departments: "الأقسام",
    doctors: "الأطباء",
    doctor: "طبيب",
    years: "سنوات",
    year: "سنة",
    yearsExperience: "سنوات الخبرة",
    experience: "الخبرة",
    department: "القسم",
    patients: "مراجع",
    accepting: "يستقبل مراجعين جدد",
    notAccepting: "قائمة الانتظار ممتلئة حاليًا",
    weeklySchedule: "أوقات العمل الأسبوعية",
    day: "اليوم",
    hours: "الفترة",
    to: "–",
    closed: "مغلق",
    // dayOfWeek 0..6 → Sunday..Saturday (matches the Prisma Availability model).
    weekdays: [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ],
  },

  home: {
    heroTitle: "مستشفى نبض",
    heroLead:
      "رعاية صحية متكاملة تبدأ بنبضة. احجز موعدك مع نخبة من الأطباء في الوقت الذي يناسبك.",
    deptsTitle: "أقسام المستشفى",
    deptsLead: "ستة أقسام تغطي رعايتك من الفحص الأول حتى المتابعة.",
    doctorsTitle: "نخبة من الأطباء",
    doctorsLead: "كوادر استشارية وأخصائية بخبرة طويلة في تشخيص الحالات ومتابعتها.",
    newsTitle: "آخر الأخبار",
    newsLead: "مستجدّات الخدمات والفعاليات في مستشفى نبض.",
  },

  about: {
    title: "عن المستشفى",
    lead: "مستشفى نبض جهة رعاية صحية في الرياض تجمع بين الكفاءة الطبية وتجربة مراجعة واضحة ومنظّمة.",
    historyTitle: "نبذة ومسيرة",
    historyBody: [
      "تأسس مستشفى نبض ليقدّم رعاية صحية موثوقة يسهل الوصول إليها، بعيادات مجهّزة وفريق طبي يضع المريض في مركز كل قرار.",
      "نمت خدماتنا على مدى السنوات لتشمل ستة أقسام رئيسية، مع تطوير مستمر لأنظمة الحجز والمتابعة حتى تصل إلى موعدك في أقل وقت وبأوضح مسار.",
      "نؤمن أن الرعاية الجيدة تبدأ من التنظيم: موعد دقيق، طبيب مختص، ومعلومة واضحة قبل الزيارة وبعدها.",
    ],
    numbersTitle: "أرقام تختصر المسيرة",
    numbersLead: "بيانات محدّثة من قاعدة المستشفى.",
    statDepartments: "قسمًا طبيًا",
    statDoctors: "طبيبًا وطبيبة",
    statYears: "عامًا من الخدمة",
    statEmergency: "طوارئ على مدار الساعة",
    emergencyValue: "24/7",
    missionTitle: "رسالتنا",
    missionBody:
      "أن نقدّم رعاية صحية آمنة وإنسانية، ونجعل الوصول إليها بسيطًا لكل مراجع، بلا تعقيد وبلا انتظار طويل.",
  },

  departments: {
    title: "الأقسام",
    lead: "اختر القسم المناسب لحالتك للاطّلاع على أطبائه وحجز موعدك.",
    empty: "لا توجد أقسام متاحة حاليًا. عاود الزيارة قريبًا.",
  },

  departmentDetail: {
    doctorsTitle: "أطباء القسم",
    doctorsEmpty: "سنعلن عن أطباء هذا القسم قريبًا. تابعنا لمعرفة الجديد.",
    bookCta: "احجز في هذا القسم",
    aboutTitle: "عن القسم",
  },

  doctors: {
    title: "الأطباء",
    lead: "تصفّح الكادر الطبي، أو رشّح النتائج حسب القسم.",
    filterLabel: "رشّح حسب القسم",
    filterAll: "كل الأقسام",
    empty: "لا يوجد أطباء متاحون حاليًا.",
    emptyFiltered: "لا يوجد أطباء في هذا القسم حاليًا. جرّب قسمًا آخر.",
  },

  doctorDetail: {
    bioTitle: "نبذة عن الطبيب",
    scheduleTitle: "أوقات العمل الأسبوعية",
    scheduleLead: "المواعيد بتوقيت الرياض. اختر «احجز مع الطبيب» لعرض الأوقات المتاحة.",
    scheduleEmpty: "لم تُحدَّد أوقات عمل لهذا الطبيب بعد.",
    experienceLabel: "الخبرة",
    departmentLabel: "القسم",
    bookCta: "احجز مع الطبيب",
  },

  faq: {
    title: "الأسئلة الشائعة",
    lead: "إجابات سريعة عن أكثر ما يسأل عنه المراجعون. لم تجد ما تبحث عنه؟ تواصل معنا.",
    empty: "لا توجد أسئلة منشورة حاليًا.",
  },

  contact: {
    title: "تواصل معنا",
    lead: "أرسل استفسارك وسيصلك ردّ فريق المستشفى، أو تفضّل بزيارتنا في أوقات العمل.",
    formTitle: "أرسل رسالة",
    infoTitle: "معلومات التواصل",
    addressLabel: "العنوان",
    phoneLabel: "الهاتف",
    emergencyLabel: "الطوارئ",
    emailLabel: "البريد الإلكتروني",
    hoursLabel: "أوقات العمل",
    fields: {
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      subject: "الموضوع",
      body: "الرسالة",
    },
    placeholders: {
      fullName: "مثال: محمد العتيبي",
      email: "name@example.com",
      phone: "05XXXXXXXX",
      subject: "موضوع الرسالة",
      body: "اكتب تفاصيل استفسارك هنا…",
    },
    successTitle: "وصلت رسالتك",
    successBody: "شكرًا لتواصلك. سيطّلع فريق المستشفى على رسالتك ويعود إليك قريبًا.",
    sendAnother: "أرسل رسالة أخرى",
    errorTitle: "تعذّر إرسال الرسالة",
    errorBody: "حدث خطأ أثناء الإرسال. تحقّق من بياناتك وحاول مرة أخرى.",
    errors: {
      fullNameShort: "أدخل الاسم الكامل (حرفان على الأقل).",
      fullNameLong: "الاسم طويل جدًا.",
      email: "أدخل بريدًا إلكترونيًا صحيحًا.",
      phone: "أدخل رقم جوال سعودي صحيح (يبدأ بـ 05 أو +9665).",
      subjectShort: "أدخل موضوعًا واضحًا (3 أحرف على الأقل).",
      subjectLong: "الموضوع طويل جدًا.",
      bodyShort: "اكتب رسالتك (10 أحرف على الأقل).",
      bodyLong: "الرسالة طويلة جدًا.",
    },
  },

  footer: {
    blurb:
      "مستشفى نبض — رعاية صحية موثوقة في الرياض، بمواعيد تحجزها في دقائق ومتابعة واضحة.",
    quickLinksTitle: "روابط سريعة",
    contactTitle: "تواصل معنا",
    rights: "جميع الحقوق محفوظة لمستشفى نبض.",
  },

  metadata: {
    home: {
      title: "مستشفى نبض",
      description:
        "مستشفى نبض — رعاية صحية موثوقة ومواعيد تحجزها في دقائق مع نخبة من الأطباء.",
    },
    about: {
      title: "عن المستشفى",
      description:
        "تعرّف على مستشفى نبض: مسيرته وأقسامه وكادره الطبي ورسالته في تقديم رعاية صحية موثوقة في الرياض.",
    },
    departments: {
      title: "الأقسام",
      description:
        "استعرض أقسام مستشفى نبض الطبية واختر القسم المناسب لحالتك لحجز موعدك.",
    },
    doctors: {
      title: "الأطباء",
      description:
        "الكادر الطبي في مستشفى نبض من استشاريين وأخصائيين. رشّح الأطباء حسب القسم واحجز موعدك.",
    },
    faq: {
      title: "الأسئلة الشائعة",
      description:
        "إجابات عن أكثر أسئلة المراجعين شيوعًا حول المواعيد والخدمات والحسابات في مستشفى نبض.",
    },
    contact: {
      title: "تواصل معنا",
      description:
        "معلومات التواصل مع مستشفى نبض: العنوان والهاتف وأوقات العمل، ونموذج لإرسال استفسارك.",
    },
  },

  /**
   * Composed strings that interpolate data. Kept here so no Arabic text is
   * written inline in a component (CLAUDE.md §2.2), while still allowing values
   * to be woven in.
   */
  build: {
    doctorsInDepartment: (deptName: string) => `أطباء قسم ${deptName}`,
    bookInDepartment: (deptName: string) => `احجز في قسم ${deptName}`,
    bookWithDoctor: (doctorName: string) => `احجز مع ${doctorName}`,
    doctorMetaDescription: (
      doctorName: string,
      title: string,
      deptName: string,
    ) => `${doctorName}، ${title} في قسم ${deptName} بمستشفى نبض. اطّلع على نبذة الطبيب وأوقات عمله واحجز موعدك.`,
    departmentMetaDescription: (deptName: string) =>
      `قسم ${deptName} في مستشفى نبض: نبذة عن القسم وأطبّاؤه وحجز المواعيد.`,
    countInDepartment: (count: number) =>
      count === 1 ? `طبيب واحد` : `${count} أطباء`,
  },
} as const;

export type Content = typeof ar;

export default ar;
