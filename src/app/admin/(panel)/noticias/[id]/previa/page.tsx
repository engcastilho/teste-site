import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminNews } from "@/lib/data/admin";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/components/site/news-article";

export const metadata: Metadata = { title: "Pré-visualização" };

/** Mostra a notícia como ficará no site, inclusive rascunhos. */
export default async function PreviewNewsPage(props: PageProps<"/admin/noticias/[id]/previa">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const news = await getAdminNews(id);
  if (!news) notFound();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <strong>Pré-visualização.</strong>{" "}
          {news.status === "published"
            ? "Esta notícia está publicada."
            : "Este rascunho ainda não está visível ao público."}{" "}
          Recursos ocultos aparecem aqui, mas não no site.
        </p>
        <Button asChild variant="outline" size="sm" className="bg-white">
          <Link href={`/admin/noticias/${news.id}`}>
            <ArrowLeft /> Voltar à edição
          </Link>
        </Button>
      </div>
      <div className="rounded-2xl bg-white py-6 shadow-sm ring-1 ring-slate-200">
        <NewsArticle news={{ ...news, published_at: news.published_at ?? news.updated_at }} />
      </div>
    </>
  );
}
