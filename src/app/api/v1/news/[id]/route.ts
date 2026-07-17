/** PATCH (edit + publish/unpublish) and DELETE a news post (ADMIN). */
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-guards";
import { newsUpdateSchema } from "@/lib/validation/catalog";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = newsUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { publish, ...fields } = parsed.data;
  const { id } = await params;

  const data: Record<string, unknown> = { ...fields };
  if (publish !== undefined) data.publishedAt = publish ? new Date() : null;

  try {
    await prisma.newsPost.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.newsPost.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
