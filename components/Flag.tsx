import * as React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

type FlagComp = React.FC<{ title?: string; className?: string }>;

// Bandera SVG por código ISO (es, mx, us…). Relación 3:2.
export function Flag({
  code,
  className = "h-4 w-6",
}: {
  code: string;
  className?: string;
}) {
  const Comp = (Flags as Record<string, FlagComp>)[code.toUpperCase()];
  if (!Comp) return null;
  return (
    <span
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10",
        className,
      )}
    >
      <Comp title={code.toUpperCase()} className="h-full w-full object-cover" />
    </span>
  );
}
