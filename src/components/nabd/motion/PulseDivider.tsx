"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VIEW_W = 1200;
const VIEW_H = 24;

/** One programmatic ECG line across the width (kept out of hand-authored SVG). */
function ecgPath(beats: number): string {
  const midY = VIEW_H / 2;
  const bw = VIEW_W / beats;
  let d = `M 0 ${midY}`;
  for (let i = 0; i < beats; i++) {
    const x = i * bw;
    const u = bw;
    d +=
      ` L ${x + 0.12 * u} ${midY}` +
      ` L ${x + 0.17 * u} ${midY - 0.4 * VIEW_H}` +
      ` L ${x + 0.22 * u} ${midY}` +
      ` L ${x + 0.34 * u} ${midY}` +
      ` L ${x + 0.37 * u} ${midY + 0.35 * VIEW_H}` +
      ` L ${x + 0.4 * u} ${midY - 1.3 * VIEW_H}` +
      ` L ${x + 0.43 * u} ${midY + 0.7 * VIEW_H}` +
      ` L ${x + 0.47 * u} ${midY}` +
      ` L ${x + 0.66 * u} ${midY}` +
      ` L ${x + 0.74 * u} ${midY - 0.5 * VIEW_H}` +
      ` L ${x + 0.82 * u} ${midY}` +
      ` L ${x + u} ${midY}`;
  }
  return d;
}

/**
 * The signature "خيط النبض": an ECG hairline that draws itself once when it
 * scrolls into view, then holds — the animated evolution of the static section
 * rule (CLAUDE.md §4). Draws in --pulse, respects prefers-reduced-motion.
 */
export function PulseDivider({
  className,
  beats = 10,
}: {
  className?: string;
  beats?: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.setProperty("--len", String(len));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      aria-hidden="true"
      className={cn("block h-3 w-full", className)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        className="nb-pulse-draw"
        data-in={shown}
        d={ecgPath(beats)}
        fill="none"
        stroke="var(--pulse)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
