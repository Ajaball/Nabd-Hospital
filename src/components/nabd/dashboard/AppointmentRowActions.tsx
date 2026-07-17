"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Check, CheckCheck, UserX, X } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

type Action = "confirm" | "complete" | "no_show" | "cancel";

// Which actions are offered for the current status.
const AVAILABLE: Record<AppointmentStatus, Action[]> = {
  PENDING: ["confirm", "complete", "no_show", "cancel"],
  CONFIRMED: ["complete", "no_show", "cancel"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const LABEL: Record<Action, string> = {
  confirm: ar.dash.appointments.confirm,
  complete: ar.dash.appointments.complete,
  no_show: ar.dash.appointments.noShow,
  cancel: ar.dash.appointments.cancel,
};

const ICON = { confirm: Check, complete: CheckCheck, no_show: UserX, cancel: X } as const;

export function AppointmentRowActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const actions = AVAILABLE[status];

  if (actions.length === 0) {
    return <span className="text-muted-ink">{ar.dash.common.none}</span>;
  }

  function run(action: Action) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          toast.success(ar.dash.appointments.updated);
          router.refresh();
          return;
        }
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message ?? ar.dash.appointments.updateError);
      } catch {
        toast.error(ar.dash.appointments.updateError);
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label={ar.dash.common.actions}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = ICON[action];
          return (
            <DropdownMenuItem
              key={action}
              variant={action === "cancel" ? "destructive" : "default"}
              onSelect={() => run(action)}
            >
              <Icon />
              {LABEL[action]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
