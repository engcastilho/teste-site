import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteNews, setNewsStatus } from "@/actions/news";
import { listAdminNews } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

export const metadata: Metadata = { title: "Notícias" };

const TABS = [
  { value: "", label: "Todas" },
  { value: "published", label: "Publicadas" },
  { value: "draft", label: "Rascunhos" },
];

export default async function AdminNewsPage(props: PageProps<"/admin/noticias">) {
  const params = await props.searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const items = await listAdminNews({ status, q });

  return (
    <>
      <AdminPageHeader
        title="Notícias"
        description="Crie, edite, publique e retire notícias do site."
        actions={
          <Button asChild>
            <Link href="/admin/noticias/nova">
              <Plus /> Nova notícia
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1 rounded-lg bg-slate-200/60 p-1" aria-label="Filtrar por status">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/noticias?status=${tab.value}` : "/admin/noticias"}
              aria-current={status === tab.value ? "page" : undefined}
              className={cn(
                "flex min-h-9 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-600 sm:flex-none",
                status === tab.value && "bg-white text-slate-900 shadow-sm",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form className="relative sm:w-72" action="/admin/noticias">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" type="search" defaultValue={q} placeholder="Buscar pelo título" className="pl-9" aria-label="Buscar notícias" />
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-muted-foreground">
          Nenhuma notícia encontrada.
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {items.map((news) => {
            const published = news.status === "published";
            return (
              <li key={news.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block">
                    {news.cover_image_url ? (
                      <Image src={news.cover_image_url} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <ImageIcon className="absolute inset-0 m-auto size-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/noticias/${news.id}`} className="line-clamp-2 font-medium hover:text-brand">
                      {news.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={published ? "success" : "warning"}>{published ? "Publicada" : "Rascunho"}</Badge>
                      <span>{news.category}</span>
                      <span>·</span>
                      <span>
                        {published && news.published_at
                          ? `Publicada em ${formatDate(news.published_at, true)}`
                          : `Editada em ${formatDate(news.updated_at, true)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 sm:shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/noticias/${news.id}`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <ConfirmActionButton
                    size="sm"
                    variant="ghost"
                    action={setNewsStatus.bind(null, news.id, published ? "draft" : "published")}
                    title={published ? "Retirar da publicação?" : "Publicar notícia?"}
                    description={
                      published
                        ? "A notícia deixará de aparecer no site e voltará a ser rascunho."
                        : "A notícia ficará visível no site imediatamente."
                    }
                    confirmLabel={published ? "Retirar" : "Publicar"}
                  >
                    {published ? <EyeOff /> : <Eye />} {published ? "Retirar" : "Publicar"}
                  </ConfirmActionButton>
                  <ConfirmActionButton
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    action={deleteNews.bind(null, news.id)}
                    title="Excluir notícia?"
                    description={<>A notícia <strong>{news.title}</strong> será excluída definitivamente. Os recursos vinculados não serão apagados.</>}
                    confirmLabel="Excluir"
                    destructive
                  >
                    <Trash2 /> Excluir
                  </ConfirmActionButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
