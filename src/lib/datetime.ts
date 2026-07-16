/**
 * The single place instants become human-readable text (CLAUDE.md §2.4).
 *
 * Every DateTime is stored UTC in the database; every render converts to
 * Asia/Riyadh here. No component formats a Date inline. Riyadh is UTC+3 with no
 * DST, so the offset never shifts — but we still route through date-fns-tz so
 * the timezone is explicit and the code reads the same as the booking engine
 * built in Phase 4.
 *
 * Digits are Western (CLAUDE.md §4): the date-fns `ar` locale renders Arabic
 * month and weekday names with Latin numerals, which is exactly the mix we want.
 */
import { formatInTimeZone } from "date-fns-tz";
import { ar as arLocale } from "date-fns/locale";

const RIYADH = "Asia/Riyadh";

/** "16 يوليو 2026" */
export function formatDate(instant: Date): string {
  return formatInTimeZone(instant, RIYADH, "d MMMM yyyy", { locale: arLocale });
}

/** "الخميس، 16 يوليو 2026" */
export function formatLongDate(instant: Date): string {
  return formatInTimeZone(instant, RIYADH, "EEEE، d MMMM yyyy", {
    locale: arLocale,
  });
}

/** "08:30" — 24-hour Riyadh wall-clock. */
export function formatTime(instant: Date): string {
  return formatInTimeZone(instant, RIYADH, "HH:mm", { locale: arLocale });
}

/** "16 يوليو 2026 · 08:30" */
export function formatDateTime(instant: Date): string {
  return formatInTimeZone(instant, RIYADH, "d MMMM yyyy · HH:mm", {
    locale: arLocale,
  });
}

/** Machine-readable value for a <time dateTime> attribute. */
export function isoDate(instant: Date): string {
  return formatInTimeZone(instant, RIYADH, "yyyy-MM-dd", { locale: arLocale });
}

/** Whole years elapsed since a founding year, by the Riyadh calendar. */
export function yearsSince(foundedYear: number): number {
  const currentYear = Number(
    formatInTimeZone(new Date(), RIYADH, "yyyy", { locale: arLocale }),
  );
  return Math.max(0, currentYear - foundedYear);
}
