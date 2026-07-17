import {
  Stethoscope,
  Baby,
  Bone,
  Scan,
  Smile,
  Siren,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps the lucide icon name stored on Department.icon to its component. Keeping
 * the map explicit (rather than a dynamic import) keeps the icon set auditable
 * and the bundle small. Unknown names fall back to the pulse Activity glyph.
 */
const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  baby: Baby,
  bone: Bone,
  scan: Scan,
  smile: Smile,
  siren: Siren,
};

export function DeptIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon aria-hidden="true" className={cn("size-6", className)} strokeWidth={1.75} />;
}
