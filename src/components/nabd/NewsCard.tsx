import { formatDate } from "@/lib/datetime";

type Props = {
  titleAr: string;
  excerptAr: string;
  publishedAt: Date | null;
};

/**
 * A published news item. There is no public news-detail route in scope, so the
 * card is display-only (title + excerpt + date). The date is data, set in mono.
 */
export function NewsCard({ titleAr, excerptAr, publishedAt }: Props) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-card p-6">
      {publishedAt ? (
        <time
          dateTime={publishedAt.toISOString()}
          className="font-data text-xs text-muted-ink"
        >
          {formatDate(publishedAt)}
        </time>
      ) : null}
      <h3 className="mt-2 text-base font-semibold text-ink">{titleAr}</h3>
      <p className="mt-2 flex-1 text-sm leading-loose text-muted-ink">{excerptAr}</p>
    </article>
  );
}
