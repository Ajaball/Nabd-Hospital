import Link from "next/link";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination. Preserves the current query params and only
 * swaps `page`, so filtering + paging compose through the URL.
 */
export function Pagination({
  basePath,
  params,
  page,
  pageCount,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const linkClass = (disabled: boolean) =>
    cn(
      "rounded-md border px-3 py-1.5 text-sm transition-colors",
      disabled
        ? "pointer-events-none border-line text-muted-ink/50"
        : "border-line text-ink hover:border-teal hover:text-teal",
    );

  return (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="pagination">
      <Link href={href(Math.max(1, page - 1))} className={linkClass(page <= 1)}>
        {ar.admin.common.prev}
      </Link>
      <span className="font-data text-sm text-muted-ink">
        {page} {ar.admin.common.of} {pageCount}
      </span>
      <Link
        href={href(Math.min(pageCount, page + 1))}
        className={linkClass(page >= pageCount)}
      >
        {ar.admin.common.next}
      </Link>
    </nav>
  );
}
