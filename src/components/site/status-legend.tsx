import { RESOURCE_STATUSES, RESOURCE_STATUS_INFO } from "@/lib/constants";
import { ResourceStatusBadge } from "@/components/site/resource-status-badge";

/** Explica as etapas de um recurso, da solicitação à execução. */
export function StatusLegend() {
  return (
    <section aria-labelledby="etapas" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <h2 id="etapas" className="text-base font-semibold text-slate-900">
        Entenda as etapas de um recurso
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Um valor só deve ser considerado recebido quando estiver <strong>pago</strong>, e concluído quando estiver{" "}
        <strong>executado</strong>.
      </p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {RESOURCE_STATUSES.map((status, i) => (
          <li key={status} className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">{i + 1}.</span>
              <ResourceStatusBadge status={status} />
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{RESOURCE_STATUS_INFO[status].description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
