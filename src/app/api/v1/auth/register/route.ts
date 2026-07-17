import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { nextFileNumber } from "@/lib/services/patients";
import { created, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * POST /api/v1/auth/register — create a patient account (CLAUDE.md §2.5, all
 * writes go through REST). Zod-validated; the password is bcrypt-hashed; the
 * User and its Patient row are created in one transaction with a freshly
 * allocated file number. Uniqueness (email, nationalId, fileNumber) is enforced
 * by the database — a P2002 is mapped to a clean message and, for a file-number
 * race, retried.
 */

const BCRYPT_ROUNDS = 12;
const MAX_FILE_NUMBER_RETRIES = 3;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error, ar.errors.badRequest);
  }

  const input = parsed.data;
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  for (let attempt = 0; attempt < MAX_FILE_NUMBER_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const fileNumber = await nextFileNumber(tx);
        return tx.user.create({
          data: {
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            phone: input.phone,
            role: "PATIENT",
            patient: {
              create: {
                fileNumber,
                nationalId: input.nationalId,
                dateOfBirth: new Date(input.dateOfBirth),
                gender: input.gender,
              },
            },
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            patient: { select: { fileNumber: true } },
          },
        });
      });

      return created({
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        fileNumber: result.patient?.fileNumber ?? null,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const conflict = uniqueViolationText(error);

        if (conflict.includes("email")) {
          return fail(ar.auth.register.emailTaken, 409, { code: "EMAIL_TAKEN" });
        }
        if (conflict.includes("nationalid")) {
          return fail(ar.auth.register.nationalIdTaken, 409, { code: "NATIONAL_ID_TAKEN" });
        }
        if (conflict.includes("filenumber")) {
          // Two registrations grabbed the same file number — retry the loop to
          // allocate the next one. Give up after the bounded retries.
          continue;
        }
      }
      // Unknown failure — don't leak internals.
      return fail(ar.auth.register.genericError, 500, { code: "SERVER_ERROR" });
    }
  }

  return fail(ar.auth.register.genericError, 500, { code: "FILE_NUMBER_CONTENTION" });
}

/**
 * Collect every hint of which column a P2002 refers to into one lowercase
 * string we can substring-match. The classic Prisma engine exposes
 * `meta.target`; the Prisma 7 pg driver adapter instead nests the field list
 * under `meta.driverAdapterError.cause.constraint.fields`. We also fold in the
 * message as a last resort.
 */
function uniqueViolationText(error: Prisma.PrismaClientKnownRequestError): string {
  const parts: string[] = [];
  const meta = error.meta as Record<string, unknown> | undefined;

  const target = meta?.target;
  if (Array.isArray(target)) parts.push(...target.map(String));
  else if (typeof target === "string") parts.push(target);

  const driverError = meta?.driverAdapterError;
  if (driverError && typeof driverError === "object") {
    const cause = (driverError as { cause?: unknown }).cause;
    if (cause && typeof cause === "object") {
      const constraint = (cause as { constraint?: unknown }).constraint;
      if (constraint && typeof constraint === "object") {
        const fields = (constraint as { fields?: unknown }).fields;
        if (Array.isArray(fields)) parts.push(...fields.map(String));
        const name = (constraint as { name?: unknown }).name;
        if (typeof name === "string") parts.push(name);
      } else if (typeof constraint === "string") {
        parts.push(constraint);
      }
      const originalMessage = (cause as { originalMessage?: unknown }).originalMessage;
      if (typeof originalMessage === "string") parts.push(originalMessage);
    }
  }

  parts.push(error.message);
  return parts.join(" ").toLowerCase();
}
