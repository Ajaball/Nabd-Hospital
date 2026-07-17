import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { nextFileNumber } from "@/lib/file-number";
import { ar } from "@/content/ar";

/**
 * POST /api/v1/auth/register — patient self-registration.
 *
 * CLAUDE.md §2.5: writes go through REST, never a Server Action. The body is
 * validated with Zod (§2.7); the password is hashed with bcrypt; the User and
 * its 1:1 Patient are created in a single transaction, and the next sequential
 * file number is generated inside that transaction. Uniqueness (email,
 * nationalId) is enforced by the database — a P2002 is translated to a clean
 * 409, never pre-checked.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: ar.auth.register.errors.generic },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: ar.validation.formInvalid,
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const latest = await tx.patient.findFirst({
        orderBy: { fileNumber: "desc" },
        select: { fileNumber: true },
      });
      const fileNumber = nextFileNumber(latest?.fileNumber);

      return tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          role: "PATIENT",
          patient: {
            create: {
              fileNumber,
              nationalId: data.nationalId,
              dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`),
              gender: data.gender,
            },
          },
        },
        include: { patient: true },
      });
    });

    return NextResponse.json(
      {
        id: created.id,
        email: created.email,
        fileNumber: created.patient?.fileNumber,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // The offending column lives in a different place per driver: `meta.target`
      // on the classic engine, `meta.driverAdapterError.cause.constraint.fields`
      // (and the constraint name in the message) on the pg adapter. Searching the
      // serialized meta finds it regardless of shape.
      const meta = JSON.stringify(error.meta ?? {});
      const field = meta.includes("nationalId")
        ? "nationalId"
        : meta.includes("email")
          ? "email"
          : null;
      const message =
        field === "email"
          ? ar.validation.emailTaken
          : field === "nationalId"
            ? ar.validation.nationalIdTaken
            : ar.auth.register.errors.generic;
      return NextResponse.json(
        {
          error: message,
          fieldErrors: field ? { [field]: [message] } : undefined,
        },
        { status: 409 },
      );
    }

    console.error("register: unexpected error", error);
    return NextResponse.json(
      { error: ar.auth.register.errors.generic },
      { status: 500 },
    );
  }
}
