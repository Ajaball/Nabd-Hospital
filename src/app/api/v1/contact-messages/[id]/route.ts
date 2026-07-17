import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { messageUpdateSchema } from "@/lib/validation/admin";
import { ok, fail, validationError } from "@/lib/http";
import { ar } from "@/content/ar";

/** PATCH /api/v1/contact-messages/[id] — mark a message read/unread (ADMIN). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = messageUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: parsed.data.isRead },
    });
    return ok({ id, isRead: parsed.data.isRead });
  } catch {
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}
