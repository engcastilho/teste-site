import { RESOURCE_STATUS_INFO } from "@/lib/constants";
import type { ResourceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ResourceStatusBadge({ status, className }: { status: ResourceStatus; className?: string }) {
  const info = RESOURCE_STATUS_INFO[status];
  return (
    <span
      title={info.description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        info.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {info.label}
    </span>
  );
}
