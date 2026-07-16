/**
 * POST /api/v1/contact-messages — public contact form intake.
 *
 * A write, so it goes through REST, not a Server Action (CLAUDE.md §2.5). The
 * body is parsed with a Zod schema (CLAUDE.md §2.7); the request body is never
 * trusted. A honeypot field (`website`) silently absorbs bots: if it is filled
 * we return success without persisting anything.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactMessageSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { website, fullName, email, phone, subject, body } = parsed.data;

  // Honeypot tripped — pretend success, store nothing.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  await prisma.contactMessage.create({
    data: {
      fullName,
      email,
      phone,
      subjectAr: subject,
      bodyAr: body,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
