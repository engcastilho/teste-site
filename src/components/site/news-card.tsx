import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { NewsSummary } from "@/lib/types";
import { CoverImage } from "@/components/site/cover-image";

export function NewsCard({ news, preload }: { news: NewsSummary; preload?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CoverImage
        src={news.cover_image_url}
        alt={news.cover_image_alt ?? ""}
        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
        preload={preload}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="rounded-full bg-brand/10 px-2.5 py-1 font-medium text-brand">{news.category}</span>
          {news.published_at && (
            <time dateTime={news.published_at} className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDate(news.published_at)}
            </time>
          )}
        </div>
        <h3 className="text-lg leading-snug font-semibold text-slate-900">
          <Link href={`/noticias/${news.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {news.title}
          </Link>
        </h3>
        {news.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{news.excerpt}</p>}
        <span className="mt-auto pt-1 text-sm font-medium text-brand group-hover:underline">Ler notícia →</span>
      </div>
    </article>
  );
}
