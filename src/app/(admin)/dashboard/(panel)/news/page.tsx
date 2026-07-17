import { prisma } from "@/lib/db";
import { NewsManager } from "@/components/nabd/dashboard/NewsManager";

export default async function NewsAdminPage() {
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <NewsManager
      posts={posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        titleAr: p.titleAr,
        excerptAr: p.excerptAr,
        bodyAr: p.bodyAr,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      }))}
    />
  );
}
