import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Newspaper } from "lucide-react";
import { RESOURCE_STATUS_INFO } from "@/lib/constants";
import { getResourceBySlug } from "@/lib/data/public";
import { formatCurrency, formatPlainDate, truncate } from "@/lib/format";
import { ResourceStatusBadge } from "@/components/site/resource-status-badge";
import { NewsCard } from "@/components/site/news-card";
import { StatusLegend } from "@/components/site/status-legend";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(props: PageProps<"/recursos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return { title: "Recurso não encontrado", robots: { index: false } };
  const description = truncate(
    `${formatCurrency(resource.amount)} — ${RESOURCE_STATUS_INFO[resource.status].label}. ${resource.purpose || resource.description}`,
    200,
  );
  return {
    title: resource.title,
    description,
    alternates: { canonical: `/recursos/${resource.slug}` },
    openGraph: {
      title: resource.title,
      description,
      url: `/recursos/${resource.slug}`,
      images: resource.photos[0] ? [{ url: resource.photos[0] }] : undefined,
    },
  };
}

async function ResourceContent({ params }: { params: PageProps<"/recursos/[slug]">["params"] }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();
  const info = RESOURCE_STATUS_INFO[resource.status];

  const details = [
    { label: "Finalidade", value: resource.purpose },
    { label: "Localidade beneficiada", value: resource.location },
    { label: "Origem do recurso", value: resource.origin },
    { label: "Data", value: formatPlainDate(resource.reference_date) },
  ].filter((d) => d.value);

  return (
    <article className="mx-auto max-w-4xl space-y-10 px-4 pt-4 pb-10 sm:px-6">
      <header className="space-y-4">
        <ResourceStatusBadge status={resource.status} />
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
          {resource.title}
        </h1>
        <div className="rounded-2xl bg-brand/[0.06] p-5 ring-1 ring-brand/15">
          <p className="text-sm font-medium text-slate-600">Valor {info.label.toLowerCase()}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-4xl">
            {formatCurrency(resource.amount)}
          </p>
          <p className="mt-1 text-sm text-slate-600">{info.description}</p>
        </div>
      </header>

      {details.length > 0 && (
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="rounded-xl border border-slate-200 p-4">
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{d.label}</dt>
              <dd className="mt-1 text-slate-900">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {resource.description && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Descrição</h2>
          <p className="leading-relaxed whitespace-pre-line text-slate-700">{resource.description}</p>
        </section>
      )}

      {resource.photos.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Fotografias</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {resource.photos.map((photo, i) => (
              <li key={photo} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <a href={photo} target="_blank" rel="noopener noreferrer" aria-label={`Abrir fotografia ${i + 1}`}>
                  <Image src={photo} alt={`Fotografia ${i + 1} — ${resource.title}`} fill sizes="(min-width: 768px) 300px, 50vw" className="object-cover transition-transform hover:scale-105" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4" aria-labelledby="noticias-relacionadas">
        <h2 id="noticias-relacionadas" className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Newspaper className="size-5 text-brand" aria-hidden /> Notícias relacionadas
        </h2>
        {resource.news.length ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {resource.news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nenhuma notícia relacionada a este recurso.</p>
        )}
      </section>

      <StatusLegend />
    </article>
  );
}

export default function ResourceDetailPage(props: PageProps<"/recursos/[slug]">) {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <Link href="/recursos" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand">
          <ArrowLeft className="size-4" aria-hidden /> Voltar para recursos
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        }
      >
        <ResourceContent params={props.params} />
      </Suspense>
    </>
  );
}
