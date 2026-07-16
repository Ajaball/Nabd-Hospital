import { cn } from "@/lib/utils";

/**
 * The signature element (CLAUDE.md §4). An ECG trace in --pulse.
 *
 * - variant="hero": large. Draws its stroke once over 1.2s via stroke-dashoffset,
 *   then holds. This is the one bold thing on the page.
 * - variant="rule": a static 1px hairline section divider — the trace collapsed
 *   to a baseline. No animation.
 *
 * Pure CSS/SVG so it renders on the server. Under prefers-reduced-motion the
 * final frame shows immediately (the animation is neutralized globally and the
 * fill mode holds the end state).
 *
 * --pulse is a BRAND GRAPHIC ONLY. This component is the only place it appears.
 */

type PulseTraceProps = {
  variant?: "hero" | "rule";
  className?: string;
  /** Accessible label for the hero trace; the rule is decorative. */
  label?: string;
};

const VIEW_W = 1200;
const VIEW_H = 160;
const BASE_Y = 80;
const BEAT_W = 300;

/** One PQRST complex, drawn with crisp line segments, offset by `x`. */
function beat(x: number): string {
  return [
    `L ${x + 40} ${BASE_Y}`, // flat
    `L ${x + 55} ${BASE_Y - 12}`, // P wave up
    `L ${x + 70} ${BASE_Y}`, // P wave down
    `L ${x + 95} ${BASE_Y}`, // flat
    `L ${x + 102} ${BASE_Y + 12}`, // Q dip
    `L ${x + 112} ${BASE_Y - 60}`, // R spike
    `L ${x + 122} ${BASE_Y + 30}`, // S spike
    `L ${x + 130} ${BASE_Y}`, // back to baseline
    `L ${x + 155} ${BASE_Y}`, // flat
    `L ${x + 185} ${BASE_Y - 20}`, // T wave up
    `L ${x + 215} ${BASE_Y}`, // T wave down
    `L ${x + BEAT_W} ${BASE_Y}`, // flat to next beat
  ].join(" ");
}

const HERO_PATH = [
  `M 0 ${BASE_Y}`,
  beat(0),
  beat(BEAT_W),
  beat(BEAT_W * 2),
  beat(BEAT_W * 3),
].join(" ");

export function PulseTrace({ variant = "hero", className, label }: PulseTraceProps) {
  if (variant === "rule") {
    return (
      <svg
        aria-hidden="true"
        className={cn("block h-px w-full", className)}
        viewBox={`0 0 ${VIEW_W} 1`}
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="0.5"
          x2={VIEW_W}
          y2="0.5"
          stroke="var(--pulse)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      role="img"
      aria-label={label}
      className={cn("pulse-trace block w-full", className)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .pulse-trace path {
          fill: none;
          stroke: var(--pulse);
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: pulse-draw 1.2s ease-out forwards;
        }
        @keyframes pulse-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-trace path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <path d={HERO_PATH} pathLength={1} />
    </svg>
  );
}

export default PulseTrace;
