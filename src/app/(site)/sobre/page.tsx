import type { Metadata } from "next";
import Image from "next/image";
import { getPage, getSettings } from "@/lib/data/public";
import { PageHeader } from "@/components/site/page-header";
import { RichContent } from "@/components/site/rich-content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("sobre");
  return {
    title: page?.title ?? "Sobre",
    description: page?.subtitle || "Trajetória e atuação parlamentar.",
    alternates: { canonical: "/sobre" },
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage("sobre"), getSettings()]);

  return (
    <>
      <PageHeader eyebrow="Institucional" title={page?.title ?? "Sobre o vereador"} description={page?.subtitle} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <RichContent html={page?.content ?? ""} className="min-w-0" />
        {page?.image_url && (
          <aside className="order-first md:order-last">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-sm md:sticky md:top-24">
              <Image
                src={page.image_url}
                alt={page.image_alt || `Fotografia de ${settings.site_name}`}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-cover"
              />
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
