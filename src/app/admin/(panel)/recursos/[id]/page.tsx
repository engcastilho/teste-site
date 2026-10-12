import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteResource } from "@/actions/resources";
import { getAdminResource, listNewsOptions } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ResourceForm } from "@/components/admin/resource-form";
import { SavedToast } from "@/components/admin/saved-toast";
import { toNewsOptions } from "../news-options";

export const metadata: Metadata = { title: "Editar recurso" };

export default async function EditResourcePage(props: PageProps<"/admin/recursos/[id]">) {
  const { id } = await props.params;
  const search = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [result, news] = await Promise.all([getAdminResource(id), listNewsOptions()]);
  if (!result) notFound();

  return (
    <>
      <SavedToast message={search.salvo ? "Recurso cadastrado." : undefined} />
      <AdminPageHeader
        title="Editar recurso"
        actions={
          <ConfirmActionButton
            variant="outline"
            className="text-destructive"
            action={deleteResource.bind(null, result.resource.id)}
            title="Excluir recurso?"
            description="Esta ação não pode ser desfeita. As notícias vinculadas não serão apagadas."
            confirmLabel="Excluir"
            destructive
            redirectTo="/admin/recursos"
          >
            <Trash2 /> Excluir
          </ConfirmActionButton>
        }
      />
      <ResourceForm
        key={result.resource.updated_at}
        resource={result.resource}
        newsOptions={toNewsOptions(news)}
        linkedNewsIds={result.newsIds}
      />
    </>
  );
}
