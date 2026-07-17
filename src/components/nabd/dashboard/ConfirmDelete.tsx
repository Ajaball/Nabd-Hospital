"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
 * Reusable delete-with-confirmation for admin resources. Sends DELETE to `url`;
 * a 409 (delete-blocked) surfaces the server's message.
 */
export function ConfirmDelete({
  url,
  title,
  description,
  triggerLabel,
  iconOnly = false,
}: {
  url: string;
  title?: string;
  description?: string;
  triggerLabel?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      try {
        const res = await fetch(url, { method: "DELETE" });
        if (res.ok) {
          toast.success(ar.dash.common.deleted);
          setOpen(false);
          router.refresh();
          return;
        }
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message ?? ar.dash.common.deleteError);
      } catch {
        toast.error(ar.dash.common.deleteError);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button variant="ghost" size="icon" aria-label={ar.dash.common.delete}>
            <Trash2 className="size-4 text-st-cancelled" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="text-st-cancelled">
            <Trash2 className="size-4" />
            {triggerLabel ?? ar.dash.common.delete}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? ar.dash.common.confirmDeleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? ar.dash.common.confirmDeleteBody}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ar.dash.common.keep}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={pending}
            className="bg-st-cancelled hover:bg-st-cancelled"
          >
            {ar.dash.common.confirmDelete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
