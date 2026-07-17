import Link from "next/link";
import { MessageState } from "@/components/nabd/MessageState";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export default function NotFound() {
  return (
    <MessageState
      code={ar.pages.notFound.code}
      title={ar.pages.notFound.title}
      lead={ar.pages.notFound.lead}
      actions={
        <>
          <Button asChild>
            <Link href="/">{ar.pages.notFound.home}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/book">{ar.pages.notFound.book}</Link>
          </Button>
        </>
      }
    />
  );
}
