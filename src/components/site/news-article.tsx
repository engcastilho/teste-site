import { CalendarDays, Landmark } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { News, Resource } from "@/lib/types";
import { CoverImage } from "@/components/site/cover-image";
import { ResourceCard } from "@/components/site/resource-card";
import { RichContent } from "@/components/site/rich-content";

/** Corpo da notícia. Usado no site e na pré-visualização do painel. */
export function NewsArticle({ news }: { news: News & { resources: Resource[] } }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-4 pb-10 sm:px-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-brand/10 px-3 py-1 font-medium text-brand">{news.category}</span>
          {news.published_at && (
            <time dateTime={news.published_at} className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {formatDate(news.published_at)}
            </time>
          )}
        </div>
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
          {news.title}
        </h1>
        {news.excerpt && <p className="text-lg leading-relaxed text-slate-600">{news.excerpt}</p>}
      </header>

      {news.cover_image_url && (
        <CoverImage
          src={news.cover_image_url}
          alt={news.cover_image_alt ?? ""}
          sizes="(min-width: 768px) 720px, 100vw"
          preload
          className="mt-8 rounded-2xl"
        />
      )}

      <RichContent html={news.content} className="mt-8" />

      {news.resources.length > 0 && (
        <section aria-labelledby="recursos-vinculados" className="mt-12 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:p-6">
          <h2 id="recursos-vinculados" className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Landmark className="size-5 text-brand" aria-hidden />
            {news.resources.length > 1 ? "Recursos relacionados a esta notícia" : "Recurso relacionado a esta notícia"}
          </h2>
          <div className="grid gap-4">
            {news.resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
