/**
 * Human-readable patient file numbers: NB-0001, NB-0002, … Sequential and
 * zero-padded to four digits so they sort correctly as strings up to NB-9999.
 *
 * `nextFileNumber` is pure so it can be unit-tested; the register endpoint reads
 * the current maximum inside a transaction and passes it here. The insert is
 * still guarded by the `fileNumber` unique constraint, so a concurrent race
 * fails cleanly rather than duplicating a number.
 */

const FILE_NUMBER_PREFIX = "NB-";
const FILE_NUMBER_PAD = 4;

export function formatFileNumber(sequence: number): string {
  return `${FILE_NUMBER_PREFIX}${String(sequence).padStart(FILE_NUMBER_PAD, "0")}`;
}

/** Given the current highest file number (or null when there are none), return
 *  the next one in sequence. */
export function nextFileNumber(latest: string | null | undefined): string {
  if (!latest) return formatFileNumber(1);
  const current = Number.parseInt(latest.replace(FILE_NUMBER_PREFIX, ""), 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  return formatFileNumber(next);
}
