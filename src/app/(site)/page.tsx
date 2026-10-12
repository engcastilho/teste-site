import Link from "next/link";
import { Landmark, Newspaper, Rocket } from "lucide-react";
import { getLatestNews, getProjectNews, getResources, getSettings } from "@/lib/data/public";
import type { HomeSectionKey, SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { NewsCard } from "@/components/site/news-card";
import { ResourceCard } from "@/components/site/resource-card";
import { SectionHeading } from "@/components/site/section-heading";
import { EmptyState } from "@/components/site/empty-state";
import { ContactInfo } from "@/components/site/contact-info";

async function NewsSection() {
  const news = await getLatestNews(3);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-label="Últimas notícias">
      <SectionHeading eyebrow="Notícias" title="Últimas notícias" href="/noticias" linkLabel="Todas as notícias" />
      {news.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Newspaper} title="Nenhuma notícia publicada ainda." />
      )}
    </section>
  );
}

async function ResourcesSection() {
  const resources = (await getResources()).slice(0, 3);
  return (
    <section className="bg-slate-50 py-14" aria-label="Recursos e investimentos">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Transparência"
          title="Recursos e investimentos para o município"
          description="Cada valor é apresentado com a etapa em que se encontra: solicitado, anunciado, empenhado, pago ou executado."
          href="/recursos"
          linkLabel="Ver todos os recursos"
        />
        {resources.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Landmark} title="Nenhum recurso cadastrado ainda." />
        )}
      </div>
    </section>
  );
}

async function ProjectsSection() {
  const projects = await getProjectNews(3);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-label="Projetos e realizações">
      <SectionHeading
        eyebrow="Mandato"
        title="Projetos e realizações"
        description="Projetos apresentados e ações realizadas ao longo do mandato."
        href="/noticias?categoria=Projetos"
        linkLabel="Ver projetos"
      />
      {projects.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Rocket}
          title="Nenhum projeto publicado ainda."
          description="Publique notícias nas categorias Projetos ou Realizações para preencher esta seção."
        />
      )}
    </section>
  );
}

function AboutSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-brand text-brand-foreground" aria-label="Apresentação">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{settings.about_title || "Sobre o vereador"}</h2>
          {settings.about_text && (
            <p className="text-base leading-relaxed whitespace-pre-line opacity-90 sm:text-lg">{settings.about_text}</p>
          )}
        </div>
        <Button asChild size="lg" variant="brand2" className="self-start md:self-center">
          <Link href="/sobre">Conheça a trajetória</Link>
        </Button>
      </div>
    </section>
  );
}

function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-label="Contato">
      <SectionHeading
        eyebrow="Atendimento"
        title="Fale com o gabinete"
        description="Envie sugestões, solicitações e denúncias pelos canais oficiais."
        href="/contato"
        linkLabel="Página de contato"
      />
      <ContactInfo settings={settings} />
    </section>
  );
}

export default async function HomePage() {
  const settings = await getSettings();

  const sections: Record<HomeSectionKey, React.ReactNode> = {
    news: <NewsSection />,
    resources: <ResourcesSection />,
    projects: <ProjectsSection />,
    about: <AboutSection settings={settings} />,
    contact: <ContactSection settings={settings} />,
  };

  return (
    <>
      <Hero settings={settings} />
      {settings.home_sections
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.key}>{sections[section.key]}</div>
        ))}
    </>
  );
}
