import type { NewsPost } from "@prisma/client";

import { formatDate, isoDate } from "@/lib/datetime";

/**
 * A news summary card. There is no news detail route in Phase 3, so the card is
 * a static summary: title, publish date (data → IBM Plex Mono), and excerpt.
 */
export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-line bg-card p-6">
      {post.publishedAt ? (
        <time
          dateTime={isoDate(post.publishedAt)}
          className="font-data text-xs text-muted-ink"
        >
          {formatDate(post.publishedAt)}
        </time>
      ) : null}
      <h3 className="text-lg font-semibold leading-snug text-ink">
        {post.titleAr}
      </h3>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-ink">
        {post.excerptAr}
      </p>
    </article>
  );
}
