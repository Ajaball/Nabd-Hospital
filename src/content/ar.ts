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
    // A short line under the wordmark; used later in header/footer.
    tagline: "رعاية صحية موثوقة",
  },

  actions: {
    bookAppointment: "احجز موعدك",
  },

  common: {
    signOut: "تسجيل الخروج",
    submitting: "جارٍ الإرسال…",
    loading: "جارٍ التحميل…",
  },

  home: {
    heroTitle: "مستشفى نبض",
    heroLead:
      "رعاية صحية متكاملة تبدأ بنبضة. احجز موعدك مع نخبة من الأطباء في الوقت الذي يناسبك.",
  },

  // Validation messages — shared by the client forms and the REST boundary, so
  // the message a user sees is identical whether the browser or the server
  // rejected the input.
  validation: {
    required: "هذا الحقل مطلوب.",
    email: "أدخل بريدًا إلكترونيًا صحيحًا.",
    emailTaken: "هذا البريد الإلكتروني مسجّل مسبقًا.",
    fullNameMin: "أدخل الاسم الكامل (ثلاثة أحرف على الأقل).",
    fullNameMax: "الاسم طويل جدًا.",
    phoneInvalid: "أدخل رقم جوال سعودي صحيح، مثل 0512345678 أو ‎+966512345678‎.",
    nationalIdInvalid: "رقم الهوية يتكوّن من عشرة أرقام.",
    nationalIdTaken: "رقم الهوية مسجّل مسبقًا.",
    dobInvalid: "أدخل تاريخ ميلاد صحيح.",
    dobFuture: "لا يمكن أن يكون تاريخ الميلاد في المستقبل.",
    genderRequired: "اختر الجنس.",
    passwordMin: "كلمة المرور ثمانية أحرف على الأقل.",
    passwordMax: "كلمة المرور طويلة جدًا.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    formInvalid: "تحقّق من الحقول المميّزة ثم أعد المحاولة.",
  },

  auth: {
    genderOptions: {
      MALE: "ذكر",
      FEMALE: "أنثى",
    },

    login: {
      title: "تسجيل الدخول",
      subtitle: "ادخل إلى حسابك لإدارة مواعيدك.",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      submit: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      registerCta: "أنشئ حسابًا جديدًا",
      errors: {
        invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        rateLimited:
          "تجاوزت عدد المحاولات المسموح بها. انتظر قليلًا ثم أعد المحاولة.",
        generic: "تعذّر تسجيل الدخول. أعد المحاولة.",
      },
    },

    register: {
      title: "إنشاء حساب",
      subtitle: "سجّل بياناتك لحجز مواعيدك ومتابعتها.",
      fullNameLabel: "الاسم الكامل",
      emailLabel: "البريد الإلكتروني",
      phoneLabel: "رقم الجوال",
      phoneHint: "بصيغة 0512345678 أو ‎+966512345678‎.",
      nationalIdLabel: "رقم الهوية الوطنية",
      dateOfBirthLabel: "تاريخ الميلاد",
      genderLabel: "الجنس",
      genderPlaceholder: "اختر…",
      passwordLabel: "كلمة المرور",
      passwordHint: "ثمانية أحرف على الأقل.",
      confirmPasswordLabel: "تأكيد كلمة المرور",
      submit: "إنشاء الحساب",
      haveAccount: "لديك حساب بالفعل؟",
      loginCta: "سجّل الدخول",
      errors: {
        generic: "تعذّر إنشاء الحساب. أعد المحاولة.",
      },
    },

    adminLogin: {
      title: "دخول الإدارة",
      subtitle: "لوحة تحكم مستشفى نبض. الدخول مخصّص لموظفي الإدارة.",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      submit: "الدخول إلى اللوحة",
      errors: {
        invalid: "بيانات الدخول غير صحيحة أو لا تملك صلاحية الوصول.",
        rateLimited:
          "تجاوزت عدد المحاولات المسموح بها. انتظر قليلًا ثم أعد المحاولة.",
        generic: "تعذّر تسجيل الدخول. أعد المحاولة.",
      },
    },
  },

  patient: {
    myAppointments: {
      title: "مواعيدي",
      lead: "تابع مواعيدك القادمة والسابقة من مكان واحد.",
      // The full portal ships in Phase 4; this is the protected landing.
      placeholder: "ستظهر مواعيدك هنا بمجرد أن تحجز أول موعد.",
      bookCta: "احجز موعدًا",
    },
  },

  admin: {
    dashboard: {
      title: "لوحة التحكم",
      // The full dashboard ships in Phase 5; this is the protected landing.
      welcome: "مرحبًا بك في لوحة تحكم مستشفى نبض.",
      lead: "من هنا تدير المواعيد والمرضى والأطباء والأقسام والأخبار والرسائل.",
    },
  },

  metadata: {
    home: {
      title: "مستشفى نبض",
      description:
        "مستشفى نبض — رعاية صحية موثوقة ومواعيد تحجزها في دقائق مع نخبة من الأطباء.",
    },
    login: {
      title: "تسجيل الدخول",
      description: "سجّل الدخول إلى حسابك في مستشفى نبض لإدارة مواعيدك.",
    },
    register: {
      title: "إنشاء حساب",
      description: "أنشئ حسابًا في مستشفى نبض لحجز مواعيدك ومتابعتها.",
    },
    adminLogin: {
      title: "دخول الإدارة",
      description: "لوحة تحكم مستشفى نبض.",
    },
    myAppointments: {
      title: "مواعيدي",
      description: "تابع مواعيدك القادمة والسابقة في مستشفى نبض.",
    },
    dashboard: {
      title: "لوحة التحكم",
      description: "لوحة تحكم إدارة مستشفى نبض.",
    },
  },
} as const;

export type Content = typeof ar;

export default ar;
