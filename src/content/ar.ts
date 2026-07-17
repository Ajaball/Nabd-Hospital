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
    signOut: "تسجيل الخروج",
  },

  // Minimal authenticated landing surfaces. Phase 4 (my-appointments) and
  // Phase 5 (dashboard) replace these placeholders with the real screens; they
  // exist now only to prove role-based access control end to end.
  dashboard: {
    placeholderTitle: "لوحة التحكم",
    placeholderLead: "مرحبًا بك في لوحة تحكم مستشفى نبض.",
  },
  myAppointments: {
    placeholderTitle: "مواعيدي",
    placeholderLead: "ستظهر هنا مواعيدك القادمة والسابقة.",
  },

  home: {
    heroTitle: "مستشفى نبض",
    heroLead:
      "رعاية صحية متكاملة تبدأ بنبضة. احجز موعدك مع نخبة من الأطباء في الوقت الذي يناسبك.",
  },

  auth: {
    // Shared field labels + placeholders across the auth forms.
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
      // Auth.js returns a single opaque error for bad credentials; we never
      // reveal whether the email or the password was the wrong one.
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

    // Zod validation messages. Every message states what is wrong and what to do.
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

  errors: {
    // Generic REST envelope messages surfaced to the client.
    badRequest: "البيانات المُرسلة غير صحيحة.",
    unauthorized: "يلزم تسجيل الدخول للمتابعة.",
    forbidden: "لا تملك صلاحية الوصول إلى هذه الصفحة.",
    serverError: "حدث خطأ غير متوقع. أعد المحاولة.",
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
