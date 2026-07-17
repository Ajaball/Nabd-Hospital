"use client";

import { MessageState } from "@/components/nabd/MessageState";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <MessageState
      title={ar.pages.error.title}
      lead={ar.pages.error.lead}
      actions={<Button onClick={reset}>{ar.pages.error.retry}</Button>}
    />
  );
}
