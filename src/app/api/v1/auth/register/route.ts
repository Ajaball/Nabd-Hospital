/**
 * POST /api/v1/auth/register — create a patient account.
 *
 * A write, so it is REST, not a Server Action (CLAUDE.md §2.5), Zod-validated
 * (CLAUDE.md §2.7). Hashes the password with bcrypt and creates the User +
 * Patient in one transaction, generating the next file number inside it. A
 * duplicate email or national ID returns 409; the Prisma P2002 catch is the
 * final backstop if two registrations race the same unique value.
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { nextFileNumber } from "@/lib/services/patients";
import { hitRateLimit } from "@/lib/rate-limit";
import { ar } from "@/content/ar";

export async function POST(request: Request) {
  // Light abuse protection on account creation (per-instance; see rate-limit.ts).
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!hitRateLimit(`register:${ip}`, 10, 60_000).allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: ar.auth.errors.rateLimited },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { fullName, email, phone, nationalId, dateOfBirth, gender, password } =
    parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Pre-check for a friendlier 409 than a raw P2002 (the unique index still
  // guards against a race between this check and the insert).
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "EMAIL_TAKEN", message: ar.auth.errors.emailTaken },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const patient = await prisma.$transaction(async (tx) => {
      const fileNumber = await nextFileNumber(tx);
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName,
          phone,
          role: Role.PATIENT,
          patient: {
            create: {
              fileNumber,
              nationalId,
              dateOfBirth: new Date(dateOfBirth),
              gender,
            },
          },
        },
        include: { patient: { select: { fileNumber: true } } },
      });
      return user.patient;
    });

    return NextResponse.json(
      { ok: true, fileNumber: patient?.fileNumber },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "CONFLICT", message: ar.auth.errors.emailTaken },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: ar.auth.errors.generic },
      { status: 500 },
    );
  }
}
