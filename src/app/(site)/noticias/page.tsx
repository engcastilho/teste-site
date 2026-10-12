import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { NEWS_PAGE_SIZE, getNewsCategories, getNewsPage } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/site/page-header";
import { NewsCard } from "@/components/site/news-card";
import { EmptyState } from "@/components/site/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Notícias",
  description: "Notícias, projetos e ações do mandato.",
  alternates: { canonical: "/noticias" },
};

function buildHref(category: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (category) params.set("categoria", category);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `/noticias?${query}` : "/noticias";
}

async function NewsList({ searchParams }: { searchParams: PageProps<"/noticias">["searchParams"] }) {
  const params = await searchParams;
  const category = typeof params.categoria === "string" && params.categoria ? params.categoria : undefined;
  const page = Math.max(1, Number.parseInt(typeof params.pagina === "string" ? params.pagina : "1", 10) || 1);

  const [{ items, total }, categories] = await Promise.all([getNewsPage(page, category), getNewsCategories()]);
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));

  return (
    <>
      {categories.length > 1 && (
        <nav aria-label="Filtrar por categoria" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {[undefined, ...categories].map((cat) => {
              const active = cat === category;
              return (
                <li key={cat ?? "todas"}>
                  <Link
                    href={buildHref(cat, 1)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand/40",
                    )}
                  >
                    {cat ?? "Todas"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <NewsCard key={item.id} news={item} preload={i < 2} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Newspaper} title="Nenhuma notícia encontrada." />
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginação" className="mt-10 flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={buildHref(category, page - 1)} className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium hover:bg-slate-50">
              ← Anteriores
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildHref(category, page + 1)} className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium hover:bg-slate-50">
              Próximas →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

function NewsListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border">
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsPage(props: PageProps<"/noticias">) {
  return (
    <>
      <PageHeader eyebrow="Notícias" title="Notícias do mandato" description="Acompanhe o trabalho, os projetos e as conquistas para o município." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense fallback={<NewsListSkeleton />}>
          <NewsList searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}
