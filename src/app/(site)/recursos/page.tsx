import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { RESOURCE_STATUSES, RESOURCE_STATUS_INFO } from "@/lib/constants";
import { getResources } from "@/lib/data/public";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/site/page-header";
import { ResourceCard } from "@/components/site/resource-card";
import { EmptyState } from "@/components/site/empty-state";
import { StatusLegend } from "@/components/site/status-legend";

export const metadata: Metadata = {
  title: "Recursos para o município",
  description: "Recursos e investimentos destinados ao município, com a etapa de cada um: solicitado, anunciado, empenhado, pago ou executado.",
  alternates: { canonical: "/recursos" },
};

export default async function ResourcesPage() {
  const resources = await getResources();

  // Totais separados por etapa — valores de etapas diferentes nunca são somados.
  const totals = RESOURCE_STATUSES.map((status) => {
    const items = resources.filter((r) => r.status === status);
    return {
      status,
      count: items.length,
      amount: items.reduce((sum, r) => sum + (r.amount ?? 0), 0),
      hasUnknown: items.some((r) => r.amount === null),
    };
  }).filter((t) => t.count > 0);

  return (
    <>
      <PageHeader
        eyebrow="Transparência"
        title="Recursos para o município"
        description="Acompanhe os recursos buscados e destinados ao município e em que etapa cada um se encontra."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        {totals.length > 0 && (
          <section aria-label="Resumo por etapa">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {totals.map((t) => (
                <li key={t.status} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {RESOURCE_STATUS_INFO[t.status].label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums sm:text-xl">
                    {t.amount > 0 ? formatCurrency(t.amount) : "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.count} {t.count === 1 ? "registro" : "registros"}
                    {t.hasUnknown && " · inclui valor a confirmar"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resources.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Landmark} title="Nenhum recurso publicado ainda." />
        )}

        <StatusLegend />
      </div>
    </>
  );
}
