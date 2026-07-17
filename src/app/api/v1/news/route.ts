/** POST /api/v1/news — create a news post (ADMIN). Starts as a draft. */
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { newsCreateSchema } from "@/lib/validation/catalog";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = newsCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }

  try {
    const created = await prisma.newsPost.create({
      data: { ...parsed.data, authorId: session.user.id },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
