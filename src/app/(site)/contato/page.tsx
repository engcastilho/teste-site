import type { Metadata } from "next";
import { getPage, getSettings } from "@/lib/data/public";
import { PageHeader } from "@/components/site/page-header";
import { RichContent } from "@/components/site/rich-content";
import { ContactInfo } from "@/components/site/contact-info";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contato");
  return {
    title: page?.title ?? "Contato",
    description: page?.subtitle || "Canais de atendimento do gabinete.",
    alternates: { canonical: "/contato" },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contato"), getSettings()]);

  return (
    <>
      <PageHeader eyebrow="Atendimento" title={page?.title ?? "Contato"} description={page?.subtitle} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <RichContent html={page?.content ?? ""} className="min-w-0" />
        <ContactInfo settings={settings} />
      </div>
    </>
  );
}
