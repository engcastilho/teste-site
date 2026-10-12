import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteNews } from "@/actions/news";
import { getAdminNews, listResourceOptions } from "@/lib/data/admin";
import { RESOURCE_STATUS_INFO } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { NewsForm } from "@/components/admin/news-form";
import { SavedToast } from "@/components/admin/saved-toast";

export const metadata: Metadata = { title: "Editar notícia" };

const SAVED_MESSAGES: Record<string, string> = {
  publish: "Notícia criada e publicada no site.",
  draft: "Rascunho criado. Use a pré-visualização para conferir.",
  save: "Notícia criada.",
};

export default async function EditNewsPage(props: PageProps<"/admin/noticias/[id]">) {
  const { id } = await props.params;
  const search = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [news, resources] = await Promise.all([getAdminNews(id), listResourceOptions()]);
  if (!news) notFound();

  const { resources: linked, ...newsData } = news;
  const saved = typeof search.salvo === "string" ? SAVED_MESSAGES[search.salvo] : undefined;

  return (
    <>
      <SavedToast message={saved} />
      <AdminPageHeader
        title="Editar notícia"
        actions={
          <ConfirmActionButton
            variant="outline"
            className="text-destructive"
            action={deleteNews.bind(null, news.id)}
            title="Excluir notícia?"
            description="Esta ação não pode ser desfeita. Os recursos vinculados não serão apagados."
            confirmLabel="Excluir"
            destructive
            redirectTo="/admin/noticias"
          >
            <Trash2 /> Excluir
          </ConfirmActionButton>
        }
      />
      <NewsForm
       
        news={newsData}
        resourceOptions={resources.map((r) => ({
          id: r.id,
          label: r.title,
          detail: `${formatCurrency(r.amount)} · ${RESOURCE_STATUS_INFO[r.status].label}${r.is_published ? "" : " · oculto"}`,
          muted: !r.is_published,
        }))}
        linkedResourceIds={linked.map((r) => r.id)}
      />
    </>
  );
}
