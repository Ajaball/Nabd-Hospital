"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

/**
 * Cancel-with-confirmation for a patient's own appointment. Posts to
 * PATCH /api/v1/appointments/[id]; the server re-checks ownership, status, and
 * the 4-hour cutoff, so this button is a convenience, not the authority.
 */
export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/appointments/${appointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        });
        if (res.ok) {
          toast.success(ar.appointments.cancelSuccess);
          setOpen(false);
          router.refresh();
          return;
        }
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message ?? ar.appointments.cancelError);
      } catch {
        toast.error(ar.appointments.cancelError);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {ar.appointments.cancel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ar.appointments.cancelConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {ar.appointments.cancelConfirmBody}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ar.appointments.keep}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={pending}
            className="bg-st-cancelled hover:bg-st-cancelled"
          >
            {ar.appointments.cancelConfirmAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
