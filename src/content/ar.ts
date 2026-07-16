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

  home: {
    heroTitle: "مستشفى نبض",
    heroLead:
      "رعاية صحية متكاملة تبدأ بنبضة. احجز موعدك مع نخبة من الأطباء في الوقت الذي يناسبك.",
  },

  metadata: {
    home: {
      title: "مستشفى نبض",
      description:
        "مستشفى نبض — رعاية صحية موثوقة ومواعيد تحجزها في دقائق مع نخبة من الأطباء.",
    },
  },
} as const;

export type Content = typeof ar;

export default ar;
