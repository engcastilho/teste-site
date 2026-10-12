import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteResource, setResourcePublished } from "@/actions/resources";
import { listAdminResources } from "@/lib/data/admin";
import { formatCurrency, formatPlainDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ResourceStatusBadge } from "@/components/site/resource-status-badge";

export const metadata: Metadata = { title: "Recursos" };

export default async function AdminResourcesPage() {
  const items = await listAdminResources();
  return (
    <>
      <AdminPageHeader
        title="Recursos"
        description="Valores e investimentos destinados ao município, com a situação de cada um."
        actions={
          <Button asChild>
            <Link href="/admin/recursos/novo">
              <Plus /> Novo recurso
            </Link>
          </Button>
        }
      />
      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-muted-foreground">Nenhum recurso cadastrado.</div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {items.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/recursos/${r.id}`} className="line-clamp-2 font-medium hover:text-brand">
                  {r.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <ResourceStatusBadge status={r.status} />
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(r.amount)}</span>
                  {r.reference_date && <span>{formatPlainDate(r.reference_date)}</span>}
                  <span>· {r.news_count} notícia(s)</span>
                  {!r.is_published && <Badge variant="secondary">Oculto no site</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 md:shrink-0">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/recursos/${r.id}`}>
                    <Pencil /> Editar
                  </Link>
                </Button>
                <ConfirmActionButton
                  size="sm"
                  variant="ghost"
                  action={setResourcePublished.bind(null, r.id, !r.is_published)}
                  title={r.is_published ? "Ocultar recurso do site?" : "Exibir recurso no site?"}
                  description={r.is_published ? "O recurso continuará no painel, mas não aparecerá para o público." : "O recurso ficará visível no site imediatamente."}
                  confirmLabel={r.is_published ? "Ocultar" : "Exibir"}
                >
                  {r.is_published ? <EyeOff /> : <Eye />} {r.is_published ? "Ocultar" : "Exibir"}
                </ConfirmActionButton>
                <ConfirmActionButton
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  action={deleteResource.bind(null, r.id)}
                  title="Excluir recurso?"
                  description={<>O recurso <strong>{r.title}</strong> será excluído e desvinculado das notícias. As notícias não serão apagadas.</>}
                  confirmLabel="Excluir"
                  destructive
                >
                  <Trash2 /> Excluir
                </ConfirmActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
