import type { Availability } from "@prisma/client";

import { ar } from "@/content/ar";

/**
 * A doctor's recurring weekly hours as a readable table (CLAUDE.md §Phase 3).
 * Availability times are Riyadh wall-clock "HH:mm" strings — not instants — so
 * they render as-is; the time range is data → IBM Plex Mono, tabular figures.
 * Rows are grouped by weekday and ordered Sunday-first to match the model.
 */
export function AvailabilityTable({
  availability,
}: {
  availability: Availability[];
}) {
  const byDay = new Map<number, Availability[]>();
  for (const slot of availability) {
    const bucket = byDay.get(slot.dayOfWeek) ?? [];
    bucket.push(slot);
    byDay.set(slot.dayOfWeek, bucket);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <table className="w-full border-collapse overflow-hidden rounded-lg border border-line text-start">
      <caption className="sr-only">{ar.common.weeklySchedule}</caption>
      <thead>
        <tr className="bg-mint/50 text-sm">
          <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
            {ar.common.day}
          </th>
          <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
            {ar.common.hours}
          </th>
        </tr>
      </thead>
      <tbody>
        {days.map((day) => {
          const ranges = byDay.get(day) ?? [];
          return (
            <tr key={day} className="border-t border-line">
              <th
                scope="row"
                className="px-4 py-3 text-start text-base font-medium text-ink"
              >
                {ar.common.weekdays[day]}
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {ranges.map((r) => (
                    <span
                      key={r.id}
                      dir="ltr"
                      className="font-data text-sm text-ink"
                    >
                      {r.startTime} {ar.common.to} {r.endTime}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
