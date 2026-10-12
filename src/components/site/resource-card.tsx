import Link from "next/link";
import { MapPin } from "lucide-react";
import { RESOURCE_STATUS_INFO } from "@/lib/constants";
import { formatCurrency, formatPlainDate } from "@/lib/format";
import type { Resource } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ResourceStatusBadge } from "@/components/site/resource-status-badge";

/**
 * Card de recurso. O texto que acompanha o valor sempre diz em que etapa o
 * recurso está, para não sugerir que um valor apenas solicitado ou anunciado
 * já foi recebido ou executado.
 */
export function ResourceCard({ resource, compact, className }: { resource: Resource; compact?: boolean; className?: string }) {
  const info = RESOURCE_STATUS_INFO[resource.status];
  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ResourceStatusBadge status={resource.status} />
        {resource.reference_date && (
          <time dateTime={resource.reference_date} className="text-xs text-slate-500">
            {formatPlainDate(resource.reference_date)}
          </time>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{formatCurrency(resource.amount)}</p>
        <p className="text-xs text-slate-500">Valor {info.label.toLowerCase()} — {info.description}</p>
      </div>
      <h3 className="leading-snug font-semibold text-slate-900">
        <Link href={`/recursos/${resource.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {resource.title}
        </Link>
      </h3>
      {!compact && resource.purpose && <p className="line-clamp-3 text-sm text-slate-600">{resource.purpose}</p>}
      <dl className="mt-auto grid gap-1 text-xs text-slate-500">
        {resource.location && (
          <div className="flex items-start gap-1.5">
            <dt className="sr-only">Localidade</dt>
            <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
            <dd>{resource.location}</dd>
          </div>
        )}
        {resource.origin && (
          <div className="flex gap-1">
            <dt className="font-medium">Origem:</dt>
            <dd>{resource.origin}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
