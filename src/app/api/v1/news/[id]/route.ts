import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { newsUpdateSchema } from "@/lib/validation/admin";
import { ok, fail, validationError, isUniqueViolation } from "@/lib/http";
import { ar } from "@/content/ar";

/** PATCH /api/v1/news/[id] — update a news post; toggles draft/published (ADMIN). */
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

  const parsed = newsUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);
  const { published, coverUrl, ...rest } = parsed.data;

  const existing = await prisma.newsPost.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!existing) return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });

  // Preserve the original publish date when re-publishing; clear it on unpublish.
  let publishedAt: Date | null | undefined;
  if (published === true) {
    publishedAt = existing.publishedAt ?? new Date();
  } else if (published === false) {
    publishedAt = null;
  }

  try {
    const post = await prisma.newsPost.update({
      where: { id },
      data: {
        ...rest,
        ...(coverUrl !== undefined ? { coverUrl: coverUrl ? coverUrl : null } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
    });
    return ok(post);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}

/** DELETE /api/v1/news/[id] (ADMIN). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  try {
    await prisma.newsPost.delete({ where: { id } });
    return ok({ id });
  } catch {
    return fail(ar.errors.notFound, 404, { code: "NOT_FOUND" });
  }
}
