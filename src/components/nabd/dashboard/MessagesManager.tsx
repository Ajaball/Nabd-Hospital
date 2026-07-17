"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatISODate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

export type MessageRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subjectAr: string;
  bodyAr: string;
  isRead: boolean;
  createdAt: string;
};

export function MessagesManager({ messages }: { messages: MessageRow[] }) {
  const router = useRouter();
  const [active, setActive] = useState<MessageRow | null>(null);
  const [, startTransition] = useTransition();

  function setRead(id: string, isRead: boolean) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/contact-messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead }),
        });
        if (res.ok) router.refresh();
        else toast.error(ar.dash.common.saveError);
      } catch {
        toast.error(ar.dash.common.saveError);
      }
    });
  }

  function open(m: MessageRow) {
    setActive(m);
    if (!m.isRead) setRead(m.id, true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.dash.messages.title}
      </h1>
      <p className="mt-1 text-muted-ink">{ar.dash.messages.lead}</p>

      <div className="mt-6 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.messages.columns.from}</TableHead>
              <TableHead>{ar.dash.messages.columns.subject}</TableHead>
              <TableHead>{ar.dash.messages.columns.date}</TableHead>
              <TableHead>{ar.dash.messages.columns.status}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-ink">
                  {ar.dash.messages.empty}
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => (
                <TableRow
                  key={m.id}
                  className={cn("cursor-pointer", !m.isRead && "bg-mint/30")}
                  onClick={() => open(m)}
                >
                  <TableCell className={cn(!m.isRead && "font-semibold", "text-ink")}>
                    {m.fullName}
                  </TableCell>
                  <TableCell className="text-ink">{m.subjectAr}</TableCell>
                  <TableCell className="font-data tabular-nums text-muted-ink">
                    {formatISODate(new Date(m.createdAt))}
                  </TableCell>
                  <TableCell>
                    {m.isRead ? (
                      <Badge variant="outline">{ar.dash.messages.read}</Badge>
                    ) : (
                      <Badge variant="secondary">{ar.dash.messages.unread}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={m.isRead ? ar.dash.messages.markUnread : ar.dash.messages.markRead}
                      onClick={() => setRead(m.id, !m.isRead)}
                    >
                      {m.isRead ? (
                        <Mail className="size-4" />
                      ) : (
                        <MailOpen className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="end" className="w-full max-w-md overflow-y-auto">
          {active ? (
            <>
              <SheetHeader>
                <SheetTitle>{active.subjectAr}</SheetTitle>
                <SheetDescription>{ar.dash.messages.detailTitle}</SheetDescription>
              </SheetHeader>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label={ar.dash.messages.columns.from} value={active.fullName} />
                <Row label={ar.contact.emailLabel} value={active.email} ltr />
                <Row label={ar.contact.phoneLabel} value={active.phone} ltr />
                <Row
                  label={ar.dash.messages.columns.date}
                  value={formatISODate(new Date(active.createdAt))}
                  ltr
                />
              </dl>
              <div className="mt-4 rounded-md border border-line bg-paper p-4 text-sm leading-loose text-ink">
                {active.bodyAr}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-ink">{label}</dt>
      <dd className={ltr ? "font-data text-ink" : "text-ink"} dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
