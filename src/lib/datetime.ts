import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { arSA } from "date-fns/locale";

/**
 * The one place UTC instants become Riyadh wall-clock strings (CLAUDE.md §2.4).
 * Every DateTime is stored UTC; nothing formats a date inline in a component.
 *
 * Riyadh (Asia/Riyadh) is UTC+3 with no DST, but we still go through a real
 * tz library so the code is correct if that ever changes. date-fns renders
 * names in Arabic (arSA locale) while keeping Western digits (CLAUDE.md §4:
 * pick Western, never mix), which is exactly the house style.
 */
export const RIYADH_TZ = "Asia/Riyadh";

const opts = { locale: arSA } as const;

/** "2026-07-17" — ISO calendar date, for mono/tabular data cells. */
export function formatISODate(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "yyyy-MM-dd", opts);
}

/** "09:30" — 24h wall-clock time, for mono/tabular data cells. */
export function formatTime(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "HH:mm", opts);
}

/** "17 يوليو 2026" — long human date. */
export function formatDate(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "d MMMM yyyy", opts);
}

/** "الأحد، 17 يوليو 2026" — weekday + long date. */
export function formatDateWithWeekday(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "EEEE، d MMMM yyyy", opts);
}

/** "الأحد، 17 يوليو 2026 — 09:30" — full appointment stamp. */
export function formatDateTime(date: Date): string {
  return `${formatDateWithWeekday(date)} — ${formatTime(date)}`;
}

/** "الأحد" — weekday name only. */
export function formatWeekday(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "EEEE", opts);
}

/** "17 يوليو" — day + month, for compact lists. */
export function formatDayMonth(date: Date): string {
  return formatInTimeZone(date, RIYADH_TZ, "d MMMM", opts);
}

// Arabic weekday names indexed by JS day-of-week (0 = Sunday .. 6 = Saturday).
// Used to render Availability rows, which store dayOfWeek as a number, not a date.
const WEEKDAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

export function weekdayName(dayOfWeek: number): string {
  return WEEKDAY_NAMES[((dayOfWeek % 7) + 7) % 7];
}

/**
 * Convert a Riyadh wall-clock date + time into the stored UTC instant.
 * e.g. ("2026-07-19", "09:00") → 2026-07-19T06:00:00.000Z
 */
export function riyadhWallTimeToUtc(dateISO: string, timeHHmm: string): Date {
  return fromZonedTime(`${dateISO}T${timeHHmm}:00`, RIYADH_TZ);
}

/** The Riyadh calendar parts of a UTC instant (for slot generation). */
export function riyadhParts(date: Date): {
  year: number;
  month: number; // 0-11
  day: number;
  dayOfWeek: number; // 0-6, 0 = Sunday
  hour: number;
  minute: number;
} {
  const z = toZonedTime(date, RIYADH_TZ);
  return {
    year: z.getFullYear(),
    month: z.getMonth(),
    day: z.getDate(),
    dayOfWeek: z.getDay(),
    hour: z.getHours(),
    minute: z.getMinutes(),
  };
}

/** The Riyadh day-of-week (0-6) for a UTC instant. */
export function riyadhDayOfWeek(date: Date): number {
  return toZonedTime(date, RIYADH_TZ).getDay();
}
