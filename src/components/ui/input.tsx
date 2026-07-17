import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted-ink/70 focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-st-cancelled",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
