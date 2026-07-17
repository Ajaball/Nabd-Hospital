import type { Metadata } from "next";

import { NewsManager, type NewsRow } from "@/components/nabd/admin/NewsManager";
import { listNewsAdmin } from "@/lib/services/admin";
import { formatDate } from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = { title: ar.admin.news.title };

export default async function AdminNewsPage() {
  const posts = await listNewsAdmin();
  const rows: NewsRow[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleAr: p.titleAr,
    excerptAr: p.excerptAr,
    bodyAr: p.bodyAr,
    publishedAtLabel: p.publishedAt ? formatDate(p.publishedAt) : null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.news.title}
      </h1>
      {rows.length > 0 ? (
        <NewsManager posts={rows} />
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-card p-10 text-center text-muted-ink">
          {ar.admin.news.empty}
        </p>
      )}
    </div>
  );
}
