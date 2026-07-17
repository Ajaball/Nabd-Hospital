"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

type Action = "confirm" | "complete" | "noShow" | "cancel";

const ACTIONS_FOR: Record<string, Action[]> = {
  PENDING: ["confirm", "cancel"],
  CONFIRMED: ["complete", "noShow", "cancel"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const LABELS: Record<Action, string> = {
  confirm: ar.admin.appointments.confirm,
  complete: ar.admin.appointments.complete,
  noShow: ar.admin.appointments.noShow,
  cancel: ar.admin.appointments.cancel,
};

export function AppointmentRowActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const actions = ACTIONS_FOR[status] ?? [];

  async function run(action: Action) {
    setBusy(action);
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(ar.toasts.appointmentUpdated);
        router.refresh();
      } else {
        toast.error(ar.toasts.genericError);
      }
    } finally {
      setBusy(null);
    }
  }

  if (actions.length === 0) {
    return <span className="text-xs text-muted-ink/60">—</span>;
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {actions.map((action) => (
        <Button
          key={action}
          size="sm"
          variant={action === "cancel" ? "outline" : action === "confirm" || action === "complete" ? "secondary" : "ghost"}
          className="h-8 px-2.5 text-xs"
          disabled={busy !== null}
          onClick={() => run(action)}
        >
          {LABELS[action]}
        </Button>
      ))}
    </div>
  );
}
