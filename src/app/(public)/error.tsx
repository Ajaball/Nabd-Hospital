"use client";

import Link from "next/link";
import { MessageState } from "@/components/nabd/MessageState";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <MessageState
      code={ar.pages.error.code}
      title={ar.pages.error.title}
      lead={ar.pages.error.lead}
      actions={
        <>
          <Button onClick={reset}>{ar.pages.error.retry}</Button>
          <Button asChild variant="outline">
            <Link href="/">{ar.pages.error.home}</Link>
          </Button>
        </>
      }
    />
  );
}
