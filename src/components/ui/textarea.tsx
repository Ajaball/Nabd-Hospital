import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-ink transition-[border-color] duration-150 placeholder:text-muted-ink/70 focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-st-cancelled",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
