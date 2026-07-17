"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function markRead() {
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        toast.success(ar.toasts.messageRead);
        router.refresh();
      } else {
        toast.error(ar.toasts.genericError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={markRead} disabled={busy}>
      {ar.admin.messages.markRead}
    </Button>
  );
}
