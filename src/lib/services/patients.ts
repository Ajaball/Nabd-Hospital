/**
 * Patient-related write helpers (CLAUDE.md §Phase 2).
 */
import type { Prisma } from "@prisma/client";

const FILE_PREFIX = "NB-";
const FILE_PAD = 4;

/**
 * Computes the next human-readable file number (NB-0001, NB-0002, …) inside a
 * transaction. The caller MUST pass a transaction client and create the patient
 * in the same transaction so the read-then-write is atomic; the unique index on
 * Patient.fileNumber is the final backstop against a collision under a race.
 */
export async function nextFileNumber(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.patient.findFirst({
    orderBy: { fileNumber: "desc" },
    select: { fileNumber: true },
  });

  const lastSeq = last ? Number.parseInt(last.fileNumber.replace(FILE_PREFIX, ""), 10) : 0;
  const nextSeq = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${FILE_PREFIX}${String(nextSeq).padStart(FILE_PAD, "0")}`;
}
