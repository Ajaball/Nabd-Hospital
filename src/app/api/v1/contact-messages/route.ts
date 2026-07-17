import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validation/contact";
import { created, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/**
 * POST /api/v1/contact-messages — public contact form intake (CLAUDE.md §2.5,
 * writes go through REST). Zod-validated with a honeypot: if the hidden
 * `website` field is filled, we return success without persisting so bots get
 * no signal.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error, ar.errors.badRequest);
  }

  const { website, fullName, email, phone, subject, body: messageBody } = parsed.data;

  // Honeypot tripped — pretend success, store nothing.
  if (website && website.trim().length > 0) {
    return created({ ok: true });
  }

  await prisma.contactMessage.create({
    data: { fullName, email, phone, subjectAr: subject, bodyAr: messageBody },
  });

  return created({ ok: true });
}
