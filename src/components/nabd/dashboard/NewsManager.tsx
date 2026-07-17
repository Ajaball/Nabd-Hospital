"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/nabd/dashboard/ConfirmDelete";
import { formatISODate } from "@/lib/datetime";
import { ar } from "@/content/ar";

export type NewsRow = {
  id: string;
  slug: string;
  titleAr: string;
  excerptAr: string;
  bodyAr: string;
  publishedAt: string | null;
};

type FormState = {
  slug: string;
  titleAr: string;
  excerptAr: string;
  bodyAr: string;
  published: boolean;
};

const empty: FormState = {
  slug: "",
  titleAr: "",
  excerptAr: "",
  bodyAr: "",
  published: false,
};

export function NewsManager({ posts }: { posts: NewsRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: NewsRow) {
    setEditing(p);
    setForm({
      slug: p.slug,
      titleAr: p.titleAr,
      excerptAr: p.excerptAr,
      bodyAr: p.bodyAr,
      published: p.publishedAt !== null,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/v1/news/${editing.id}` : "/api/v1/news", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(ar.dash.common.saved);
        setOpen(false);
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? ar.dash.common.saveError);
    } catch {
      toast.error(ar.dash.common.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.dash.news.title}
          </h1>
          <p className="mt-1 text-muted-ink">{ar.dash.news.lead}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {ar.dash.news.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? ar.dash.news.edit : ar.dash.news.add}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{ar.dash.news.fields.slug}</Label>
                <Input
                  value={form.slug}
                  dir="ltr"
                  className="text-start"
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{ar.dash.news.fields.titleAr}</Label>
                <Input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{ar.dash.news.fields.excerptAr}</Label>
                <Textarea
                  value={form.excerptAr}
                  maxLength={300}
                  onChange={(e) => setForm({ ...form, excerptAr: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{ar.dash.news.fields.bodyAr}</Label>
                <Textarea
                  rows={6}
                  value={form.bodyAr}
                  onChange={(e) => setForm({ ...form, bodyAr: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v === true })}
                />
                <span className="text-sm text-ink">{ar.dash.news.fields.published}</span>
              </label>
            </div>
            <DialogFooter>
              <Button onClick={save} disabled={saving}>
                {saving ? ar.dash.common.saving : ar.dash.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.news.columns.title}</TableHead>
              <TableHead>{ar.dash.news.columns.status}</TableHead>
              <TableHead>{ar.dash.news.columns.publishedAt}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-ink">
                  {ar.dash.news.empty}
                </TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-ink">{p.titleAr}</TableCell>
                  <TableCell>
                    {p.publishedAt ? (
                      <Badge variant="secondary">{ar.dash.news.published}</Badge>
                    ) : (
                      <Badge variant="outline">{ar.dash.news.draft}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-data tabular-nums text-muted-ink">
                    {p.publishedAt ? formatISODate(new Date(p.publishedAt)) : ar.dash.common.none}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ar.dash.common.edit}
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete url={`/api/v1/news/${p.id}`} iconOnly />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
