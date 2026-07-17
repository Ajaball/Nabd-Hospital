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

/** "20/7" — compact day/month for a "YYYY-MM-DD" date (chart axes). */
export function formatDayMonth(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 9, 0));
  return formatInTimeZone(noon, RIYADH, "d/M", { locale: arLocale });
}

/** "الأحد 20 يوليو" — weekday + day + month for a "YYYY-MM-DD" clinic date. */
export function formatClinicDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  // Noon Riyadh (09:00 UTC) sits safely inside the day regardless of offset.
  const noon = new Date(Date.UTC(y, m - 1, d, 9, 0));
  return formatInTimeZone(noon, RIYADH, "EEEE d MMMM", { locale: arLocale });
}

/** "YYYY-MM-DD" for a UTC-midnight instant of a calendar date. */
function ymd(utcMidnightMs: number): string {
  const dt = new Date(utcMidnightMs);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The next `count` clinic days (Sunday–Thursday) as "YYYY-MM-DD", starting from
 * the Riyadh calendar date of `from`. Weekend days (Fri/Sat) are skipped.
 */
export function listClinicDays(from: Date, count: number): string[] {
  const [y, m, d] = isoDate(from).split("-").map(Number);
  let cursorMs = Date.UTC(y, m - 1, d);
  const days: string[] = [];
  while (days.length < count) {
    const weekday = new Date(cursorMs).getUTCDay(); // 0 = Sun .. 6 = Sat
    if (weekday >= 0 && weekday <= 4) days.push(ymd(cursorMs));
    cursorMs += 24 * 60 * 60 * 1000;
  }
  return days;
}

/** Whole years elapsed since a founding year, by the Riyadh calendar. */
export function yearsSince(foundedYear: number): number {
  const currentYear = Number(
    formatInTimeZone(new Date(), RIYADH, "yyyy", { locale: arLocale }),
  );
  return Math.max(0, currentYear - foundedYear);
}
