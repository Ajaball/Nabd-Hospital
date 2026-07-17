import { cn } from "@/lib/utils";

/**
 * A section title + optional lead. Quiet by design (CLAUDE.md §4): the only
 * flourish anywhere is the pulse trace, so headings just set type well.
 */
export function SectionHeading({
  title,
  lead,
  as: As = "h2",
  className,
  align = "start",
}: {
  title: string;
  lead?: string;
  as?: "h1" | "h2";
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <As
        className={cn(
          "font-bold tracking-[-0.01em] text-ink",
          As === "h1" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </As>
      {lead ? (
        <p
          className={cn(
            "mt-2 max-w-2xl text-base leading-loose text-muted-ink",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
