import type { Prisma } from "@prisma/client";

/**
 * Patient file-number allocation. File numbers are human-readable, sequential,
 * and unique (schema: Patient.fileNumber), formatted NB-0001, NB-0002, …
 *
 * Uniqueness is guaranteed by the DB unique constraint, not by this code — if
 * two registrations race for the same number one insert wins and the other
 * raises P2002, which the register endpoint retries. This mirrors the
 * booking-conflict philosophy in CLAUDE.md: the database is the arbiter.
 */

const PREFIX = "NB-";
const PAD = 4;

/** Format a sequence number as a file number, e.g. 7 -> "NB-0007". */
export function formatFileNumber(seq: number): string {
  return `${PREFIX}${String(seq).padStart(PAD, "0")}`;
}

/** Parse the numeric sequence out of a file number, or 0 if it doesn't match. */
export function parseFileNumber(fileNumber: string): number {
  if (!fileNumber.startsWith(PREFIX)) return 0;
  const n = Number.parseInt(fileNumber.slice(PREFIX.length), 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Compute the next file number inside a transaction. Ordering by fileNumber
 * descending is safe because the zero-padded format sorts lexicographically in
 * the same order as numerically (up to NB-9999, far beyond project scale).
 */
export async function nextFileNumber(tx: Prisma.TransactionClient): Promise<string> {
  const latest = await tx.patient.findFirst({
    orderBy: { fileNumber: "desc" },
    select: { fileNumber: true },
  });
  const seq = latest ? parseFileNumber(latest.fileNumber) : 0;
  return formatFileNumber(seq + 1);
}
