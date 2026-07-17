"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

export type NewsRow = {
  id: string;
  slug: string;
  titleAr: string;
  excerptAr: string;
  bodyAr: string;
  publishedAtLabel: string | null;
};

type Editing = { mode: "create" } | { mode: "edit"; post: NewsRow } | null;

export function NewsManager({ posts }: { posts: NewsRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        toast.success(ar.toasts.newsUpdated);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(ar.toasts.genericError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ mode: "create" })}>
          {ar.admin.common.create}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40">
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.news.colTitle}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.news.colStatus}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.news.colDate}</th>
              <th className="px-4 py-3 text-end font-semibold text-ink">{ar.admin.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => {
              const published = p.publishedAtLabel !== null;
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{p.titleAr}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
                        published
                          ? "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed"
                          : "border-s-st-pending bg-st-pending/8 text-st-pending",
                      )}
                    >
                      {published ? ar.admin.news.published : ar.admin.news.draft}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-data text-muted-ink">
                    {p.publishedAtLabel ?? ar.admin.news.draftDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        disabled={busy}
                        onClick={() =>
                          send(`/api/v1/news/${p.id}`, "PATCH", { publish: !published })
                        }
                      >
                        {published ? ar.admin.news.unpublish : ar.admin.news.publish}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => setEditing({ mode: "edit", post: p })}
                      >
                        {ar.admin.common.edit}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        disabled={busy}
                        onClick={() => send(`/api/v1/news/${p.id}`, "DELETE")}
                      >
                        {ar.admin.news.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-[28rem] max-w-[92vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing?.mode === "create" ? ar.admin.common.create : ar.admin.common.edit}
            </SheetTitle>
          </SheetHeader>
          {editing ? (
            <NewsForm
              key={editing.mode === "edit" ? editing.post.id : "new"}
              post={editing.mode === "edit" ? editing.post : undefined}
              busy={busy}
              onSubmit={(values) =>
                editing.mode === "edit"
                  ? send(`/api/v1/news/${editing.post.id}`, "PATCH", {
                      titleAr: values.titleAr,
                      excerptAr: values.excerptAr,
                      bodyAr: values.bodyAr,
                    })
                  : send("/api/v1/news", "POST", values)
              }
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function NewsForm({
  post,
  busy,
  onSubmit,
}: {
  post?: NewsRow;
  busy: boolean;
  onSubmit: (v: { slug: string; titleAr: string; excerptAr: string; bodyAr: string }) => void;
}) {
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [titleAr, setTitleAr] = useState(post?.titleAr ?? "");
  const [excerptAr, setExcerptAr] = useState(post?.excerptAr ?? "");
  const [bodyAr, setBodyAr] = useState(post?.bodyAr ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ slug, titleAr, excerptAr, bodyAr });
      }}
      className="space-y-4"
    >
      {!post ? (
        <div className="space-y-2">
          <Label htmlFor="news-slug">slug</Label>
          <Input id="news-slug" dir="ltr" className="font-data" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="news-title">{ar.admin.news.colTitle}</Label>
        <Input id="news-title" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-excerpt">{ar.home.newsTitle}</Label>
        <Textarea id="news-excerpt" rows={2} value={excerptAr} onChange={(e) => setExcerptAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="news-body">{ar.admin.news.colTitle}</Label>
        <Textarea id="news-body" rows={6} value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? ar.admin.common.saving : ar.admin.common.save}
      </Button>
    </form>
  );
}
