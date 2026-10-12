import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getLatestNews, getNewsBySlug, getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { NewsArticle } from "@/components/site/news-article";
import { NewsCard } from "@/components/site/news-card";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(props: PageProps<"/noticias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "Notícia não encontrada", robots: { index: false } };
  const description = news.excerpt || undefined;
  return {
    title: news.title,
    description,
    alternates: { canonical: `/noticias/${news.slug}` },
    openGraph: {
      type: "article",
      title: news.title,
      description,
      url: `/noticias/${news.slug}`,
      publishedTime: news.published_at ?? undefined,
      modifiedTime: news.updated_at,
      section: news.category,
      images: news.cover_image_url ? [{ url: news.cover_image_url, alt: news.cover_image_alt ?? news.title }] : undefined,
    },
  };
}

async function NewsContent({ params }: { params: PageProps<"/noticias/[slug]">["params"] }) {
  const { slug } = await params;
  const [news, settings] = await Promise.all([getNewsBySlug(slug), getSettings()]);
  if (!news) notFound();

  const related = await getLatestNews(3, { excludeSlug: news.slug });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.excerpt,
    datePublished: news.published_at,
    dateModified: news.updated_at,
    image: news.cover_image_url ? [news.cover_image_url] : undefined,
    author: { "@type": "Person", name: settings.site_name },
    publisher: { "@type": "Organization", name: settings.site_name },
    mainEntityOfPage: `${SITE_URL}/noticias/${news.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <NewsArticle news={news} />
      {related.length > 0 && (
        <aside className="mx-auto max-w-6xl px-4 pt-6 sm:px-6" aria-label="Outras notícias">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Outras notícias</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export default function NewsDetailPage(props: PageProps<"/noticias/[slug]">) {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <Link href="/noticias" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand">
          <ArrowLeft className="size-4" aria-hidden /> Voltar para notícias
        </Link>
      </div>
      <Suspense fallback={<ArticleSkeleton />}>
        <NewsContent params={props.params} />
      </Suspense>
    </>
  );
}
