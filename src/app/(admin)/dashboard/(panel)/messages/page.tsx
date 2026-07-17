import type { Metadata } from "next";

import { MarkReadButton } from "@/components/nabd/admin/MarkReadButton";
import { Pagination } from "@/components/nabd/admin/Pagination";
import { listMessages } from "@/lib/services/admin";
import { formatDateTime } from "@/lib/datetime";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: ar.admin.messages.title };

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const data = await listMessages(Number(sp.page) || 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.admin.messages.title}
      </h1>

      {data.rows.length > 0 ? (
        <ul className="space-y-3">
          {data.rows.map((m) => (
            <li
              key={m.id}
              className={cn(
                "rounded-lg border bg-card p-5",
                m.isRead ? "border-line" : "border-teal/40",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-ink">{m.subjectAr}</h2>
                    {!m.isRead ? (
                      <span className="rounded-sm bg-mint px-1.5 py-0.5 text-xs font-medium text-teal">
                        {ar.admin.messages.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-ink">
                    {ar.admin.messages.from}: {m.fullName} ·{" "}
                    <span dir="ltr" className="font-data">
                      {m.email}
                    </span>
                  </p>
                </div>
                <span className="font-data text-xs text-muted-ink">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/85">{m.bodyAr}</p>
              {!m.isRead ? (
                <div className="mt-4">
                  <MarkReadButton id={m.id} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-card p-10 text-center text-muted-ink">
          {ar.admin.messages.empty}
        </p>
      )}

      <Pagination
        basePath="/dashboard/messages"
        params={{}}
        page={data.page}
        pageCount={data.pageCount}
      />
    </div>
  );
}
