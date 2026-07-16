import {
  Stethoscope,
  Baby,
  Bone,
  Scan,
  Smile,
  Siren,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Renders the lucide icon a department stores by name (Department.icon). Only
 * the icons actually used by seeded departments are registered, so the bundle
 * never pulls the whole icon set. Unknown names fall back to a neutral glyph.
 */
const REGISTRY: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  baby: Baby,
  bone: Bone,
  scan: Scan,
  smile: Smile,
  siren: Siren,
};

export function DepartmentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = REGISTRY[name] ?? Stethoscope;
  return <Icon aria-hidden="true" className={cn("size-6", className)} />;
}
