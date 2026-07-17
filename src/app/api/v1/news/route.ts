import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { newsCreateSchema } from "@/lib/validation/admin";
import { created, fail, validationError, isUniqueViolation } from "@/lib/http";
import { ar } from "@/content/ar";

/** POST /api/v1/news — create a news post (ADMIN). */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(ar.errors.badRequest, 400, { code: "INVALID_JSON" });
  }

  const parsed = newsCreateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error, ar.errors.badRequest);
  const input = parsed.data;

  try {
    const post = await prisma.newsPost.create({
      data: {
        slug: input.slug,
        titleAr: input.titleAr,
        excerptAr: input.excerptAr,
        bodyAr: input.bodyAr,
        coverUrl: input.coverUrl ? input.coverUrl : null,
        publishedAt: input.published ? new Date() : null,
        authorId: guard.session.user.id,
      },
    });
    return created(post);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(ar.dash.common.slugTaken, 409, { code: "SLUG_TAKEN" });
    }
    return fail(ar.errors.serverError, 500, { code: "SERVER_ERROR" });
  }
}
