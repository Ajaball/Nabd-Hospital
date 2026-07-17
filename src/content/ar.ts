/**
 * The single source of every user-visible string (CLAUDE.md §2.2). Nothing the
 * user reads — labels, validation errors, toasts, empty states — is written
 * inline in a component. Each phase fills in its section here.
 *
 * Voice: formal Modern Standard Arabic, native Riyadh register, active voice,
 * sentence case. Never translated-sounding.
 */

export const ar = {
  site: {
    name: "مستشفى نبض",
    tagline: "رعاية صحية موثوقة",
    city: "الرياض",
  },

  actions: {
    bookAppointment: "احجز موعدك",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
  },

  nav: {
    home: "الرئيسية",
    departments: "الأقسام",
    doctors: "الأطباء",
    about: "عن المستشفى",
    news: "الأخبار",
    faq: "الأسئلة الشائعة",
    contact: "تواصل معنا",
    book: "احجز موعدك",
    login: "تسجيل الدخول",
    myAppointments: "مواعيدي",
    dashboard: "لوحة التحكم",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    primary: "التنقل الرئيسي",
  },

  footer: {
    blurb:
      "مستشفى نبض في الرياض — رعاية صحية متكاملة يقدّمها فريق من الأطباء عبر ستة أقسام، مع حجز إلكتروني للمواعيد.",
    exploreTitle: "تصفّح",
    contactTitle: "تواصل",
    hoursTitle: "أوقات العمل",
    address: "طريق الملك فهد، حي العليا، الرياض",
    phone: "0112000000",
    email: "info@nabd.example",
    hoursClinics: "العيادات: الأحد – الخميس، 8 صباحًا – 8 مساءً",
    hoursEmergency: "الطوارئ: 24 ساعة طوال أيام الأسبوع",
    rights: "جميع الحقوق محفوظة لمستشفى نبض.",
    disclaimer: "مشروع تخرّج لأغراض تعليمية. المحتوى والبيانات كلها تجريبية.",
  },

  common: {
    all: "الكل",
    viewAll: "عرض الكل",
    readMore: "اقرأ المزيد",
    backHome: "العودة إلى الرئيسية",
    back: "رجوع",
    loading: "جارٍ التحميل…",
    yearsExperienceSuffix: "سنة خبرة",
    doctorsCountSuffix: "طبيب",
  },

  status: {
    PENDING: "بانتظار التأكيد",
    CONFIRMED: "مؤكد",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
    NO_SHOW: "لم يحضر",
  },

  home: {
    heroTitle: "مستشفى نبض",
    heroLead:
      "رعاية صحية متكاملة تبدأ بنبضة. احجز موعدك مع نخبة من الأطباء في الوقت الذي يناسبك.",
    departmentsTitle: "الأقسام",
    departmentsLead: "ستة أقسام تغطّي احتياجات الأسرة، من الباطنية إلى الطوارئ.",
    doctorsTitle: "أطباء مختارون",
    doctorsLead: "نخبة من الاستشاريين والأخصائيين في خدمتك.",
    newsTitle: "آخر الأخبار",
    newsLead: "مستجدّات المستشفى وخدماته الجديدة.",
    ctaTitle: "احجز موعدك اليوم",
    ctaLead: "اختر القسم والطبيب والوقت المناسب في خطوات معدودة.",
  },

  about: {
    title: "عن مستشفى نبض",
    lead: "مستشفى يضع المريض في قلب الرعاية، بخدمات تشخيصية وعلاجية متكاملة في الرياض.",
    historyTitle: "نبذة",
    history:
      "تأسّس مستشفى نبض ليقدّم رعاية صحية موثوقة تجمع بين الكفاءة الطبية وحسن التعامل. نعمل عبر ستة أقسام رئيسية بفريق من الاستشاريين والأخصائيين، ونحرص على أن تكون تجربة المراجع سهلة من لحظة الحجز حتى انتهاء الموعد. يعمل قسم الطوارئ على مدار الساعة، فيما تستقبل العيادات مراجعيها من الأحد إلى الخميس.",
    missionTitle: "رسالتنا",
    mission:
      "تقديم رعاية صحية آمنة وفي متناول الجميع، تحترم وقت المريض وخصوصيته، وتستند إلى أحدث الممارسات الطبية.",
    statsTitle: "بالأرقام",
    statDepartments: "أقسام طبية",
    statDoctors: "طبيب وطبيبة",
    statYears: "عامًا من الخبرة المجمّعة",
  },

  departments: {
    title: "الأقسام",
    lead: "اختر القسم المناسب لحالتك للاطّلاع على أطبائه وحجز موعدك.",
    doctorsHere: "أطباء القسم",
    bookHere: "احجز في هذا القسم",
    backToDepartments: "كل الأقسام",
    noDoctors: "لا يوجد أطباء مسجّلون في هذا القسم حاليًا.",
    notFound: "القسم غير موجود",
  },

  doctors: {
    title: "الأطباء",
    lead: "تصفّح أطباء المستشفى واحجز مع من يناسبك.",
    filterLabel: "تصفية حسب القسم",
    accepting: "يستقبل مرضى جدد",
    notAccepting: "لا يستقبل حاليًا",
    availabilityTitle: "أوقات العمل الأسبوعية",
    availabilityNone: "لم تُحدَّد أوقات عمل بعد.",
    bookWith: "احجز مع الطبيب",
    inDepartment: "القسم",
    experience: "الخبرة",
    notFound: "الطبيب غير موجود",
    day: "اليوم",
    from: "من",
    to: "إلى",
  },

  faq: {
    title: "الأسئلة الشائعة",
    lead: "إجابات سريعة عن أكثر ما يسأل عنه المراجعون.",
    empty: "لا توجد أسئلة منشورة بعد.",
  },

  contact: {
    title: "تواصل معنا",
    lead: "أرسل استفسارك وسنعود إليك في أقرب وقت.",
    infoTitle: "معلومات التواصل",
    addressLabel: "العنوان",
    phoneLabel: "الهاتف",
    emailLabel: "البريد الإلكتروني",
    hoursLabel: "أوقات العمل",
    formTitle: "أرسل رسالة",
    fields: {
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      subject: "الموضوع",
      body: "نص الرسالة",
      bodyPlaceholder: "اكتب استفسارك هنا…",
    },
    submit: "إرسال الرسالة",
    submitting: "جارٍ الإرسال…",
    success: "تم إرسال رسالتك. سنتواصل معك قريبًا.",
    error: "تعذّر إرسال الرسالة. أعد المحاولة.",
    validation: {
      fullNameRequired: "أدخل الاسم الكامل.",
      emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
      phoneInvalid: "أدخل رقم جوال سعودي صحيح مثل 05XXXXXXXX.",
      subjectRequired: "أدخل موضوع الرسالة.",
      bodyRequired: "اكتب نص الرسالة.",
      bodyTooShort: "الرسالة قصيرة جدًا؛ أضف مزيدًا من التفاصيل.",
    },
  },

  auth: {
    fields: {
      email: "البريد الإلكتروني",
      emailPlaceholder: "name@example.com",
      password: "كلمة المرور",
      passwordPlaceholder: "٨ أحرف على الأقل",
      fullName: "الاسم الكامل",
      fullNamePlaceholder: "الاسم الأول واسم العائلة",
      phone: "رقم الجوال",
      phonePlaceholder: "05XXXXXXXX",
      nationalId: "رقم الهوية الوطنية",
      nationalIdPlaceholder: "١٠ أرقام",
      dateOfBirth: "تاريخ الميلاد",
      gender: "الجنس",
    },

    gender: {
      male: "ذكر",
      female: "أنثى",
    },

    login: {
      title: "تسجيل الدخول",
      lead: "أدخل بياناتك للوصول إلى مواعيدك.",
      submit: "تسجيل الدخول",
      submitting: "جارٍ تسجيل الدخول…",
      noAccount: "ليس لديك حساب؟",
      registerLink: "أنشئ حسابًا جديدًا",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      rateLimited: "تجاوزت عدد المحاولات المسموح بها. أعد المحاولة بعد قليل.",
      genericError: "تعذّر تسجيل الدخول. أعد المحاولة.",
    },

    register: {
      title: "إنشاء حساب",
      lead: "سجّل بياناتك لحجز مواعيدك ومتابعتها.",
      submit: "إنشاء الحساب",
      submitting: "جارٍ إنشاء الحساب…",
      haveAccount: "لديك حساب بالفعل؟",
      loginLink: "سجّل الدخول",
      success: "تم إنشاء حسابك. سجّل الدخول للمتابعة.",
      emailTaken: "هذا البريد الإلكتروني مسجّل مسبقًا.",
      nationalIdTaken: "رقم الهوية مسجّل مسبقًا.",
      genericError: "تعذّر إنشاء الحساب. أعد المحاولة.",
    },

    adminLogin: {
      title: "دخول الإدارة",
      lead: "هذه البوابة مخصّصة لموظفي المستشفى.",
      submit: "دخول لوحة التحكم",
    },

    validation: {
      emailRequired: "أدخل البريد الإلكتروني.",
      emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
      passwordRequired: "أدخل كلمة المرور.",
      passwordTooShort: "يجب ألا تقل كلمة المرور عن ٨ أحرف.",
      fullNameRequired: "أدخل الاسم الكامل.",
      fullNameTooShort: "أدخل الاسم الأول واسم العائلة على الأقل.",
      phoneRequired: "أدخل رقم الجوال.",
      phoneInvalid: "أدخل رقم جوال سعودي صحيح مثل 05XXXXXXXX.",
      nationalIdRequired: "أدخل رقم الهوية.",
      nationalIdInvalid: "يجب أن يتكوّن رقم الهوية من ١٠ أرقام.",
      dateOfBirthRequired: "أدخل تاريخ الميلاد.",
      dateOfBirthInvalid: "أدخل تاريخ ميلاد صحيح.",
      dateOfBirthFuture: "لا يمكن أن يكون تاريخ الميلاد في المستقبل.",
      genderRequired: "اختر الجنس.",
    },
  },

  // Minimal authenticated landing surfaces. Phase 4 (my-appointments) and
  // Phase 5 (dashboard) replace these placeholders with the real screens.
  dashboard: {
    placeholderTitle: "لوحة التحكم",
    placeholderLead: "مرحبًا بك في لوحة تحكم مستشفى نبض.",
  },
  myAppointments: {
    placeholderTitle: "مواعيدي",
    placeholderLead: "ستظهر هنا مواعيدك القادمة والسابقة.",
  },

  errors: {
    badRequest: "البيانات المُرسلة غير صحيحة.",
    unauthorized: "يلزم تسجيل الدخول للمتابعة.",
    forbidden: "لا تملك صلاحية الوصول إلى هذه الصفحة.",
    notFound: "الصفحة غير موجودة.",
    serverError: "حدث خطأ غير متوقع. أعد المحاولة.",
  },

  metadata: {
    home: {
      title: "مستشفى نبض",
      description:
        "مستشفى نبض — رعاية صحية موثوقة ومواعيد تحجزها في دقائق مع نخبة من الأطباء.",
    },
    about: {
      title: "عن المستشفى",
      description: "نبذة عن مستشفى نبض وأقسامه وفريقه الطبي في الرياض.",
    },
    departments: {
      title: "الأقسام",
      description: "أقسام مستشفى نبض الطبية الستة وأطباء كل قسم.",
    },
    doctors: {
      title: "الأطباء",
      description: "تصفّح أطباء مستشفى نبض واحجز موعدك مع الطبيب المناسب.",
    },
    faq: {
      title: "الأسئلة الشائعة",
      description: "إجابات عن أكثر الأسئلة شيوعًا حول مواعيد وخدمات مستشفى نبض.",
    },
    contact: {
      title: "تواصل معنا",
      description: "معلومات التواصل مع مستشفى نبض ونموذج إرسال الاستفسارات.",
    },
    login: {
      title: "تسجيل الدخول",
      description: "سجّل الدخول إلى حسابك في مستشفى نبض لإدارة مواعيدك.",
    },
    register: {
      title: "إنشاء حساب",
      description: "أنشئ حسابًا في مستشفى نبض لحجز المواعيد ومتابعتها.",
    },
    adminLogin: {
      title: "دخول الإدارة",
      description: "بوابة دخول موظفي مستشفى نبض.",
    },
  },
} as const;

export type Content = typeof ar;

export default ar;
