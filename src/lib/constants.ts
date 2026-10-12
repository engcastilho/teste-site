import type { HomeSection, HomeSectionKey, ResourceStatus, SiteSettings } from "@/lib/types";

/** Categorias cujas notícias aparecem em "Projetos e realizações". */
export const PROJECT_CATEGORIES = ["Projetos", "Realizações"];

export const NEWS_CATEGORY_SUGGESTIONS = [
  "Notícias",
  "Projetos",
  "Realizações",
  "Saúde",
  "Educação",
  "Infraestrutura",
  "Agricultura",
  "Esporte e lazer",
  "Assistência social",
  "Sessões da Câmara",
];

export const RESOURCE_STATUSES: ResourceStatus[] = [
  "solicitado",
  "anunciado",
  "empenhado",
  "pago",
  "executado",
];

export const RESOURCE_STATUS_INFO: Record<
  ResourceStatus,
  { label: string; description: string; className: string }
> = {
  solicitado: {
    label: "Solicitado",
    description: "Pedido formalizado. Ainda não há garantia de liberação do valor.",
    className: "bg-slate-100 text-slate-700 ring-slate-300",
  },
  anunciado: {
    label: "Anunciado",
    description: "Anunciado pelo órgão responsável, mas ainda não empenhado.",
    className: "bg-sky-50 text-sky-800 ring-sky-300",
  },
  empenhado: {
    label: "Empenhado",
    description: "Valor reservado no orçamento (nota de empenho). Ainda não foi pago.",
    className: "bg-amber-50 text-amber-800 ring-amber-300",
  },
  pago: {
    label: "Pago",
    description: "Valor transferido ou pago. A execução ainda pode estar em andamento.",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  },
  executado: {
    label: "Executado",
    description: "Obra, compra ou serviço efetivamente realizado.",
    className: "bg-green-100 text-green-900 ring-green-400",
  },
};

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  news: "Últimas notícias",
  resources: "Recursos e investimentos",
  projects: "Projetos e realizações",
  about: "Apresentação institucional",
  contact: "Contato",
};

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  { key: "news", enabled: true },
  { key: "resources", enabled: true },
  { key: "projects", enabled: true },
  { key: "about", enabled: true },
  { key: "contact", enabled: true },
];

/** Valores usados enquanto o Supabase não estiver configurado. */
export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Vereador Negão Monteiro",
  site_description: "Site institucional do vereador Negão Monteiro, de Alta Floresta D'Oeste (RO).",
  primary_color: "#1d4ed8",
  secondary_color: "#f59e0b",
  logo_url: null,
  hero_image_url: null,
  hero_eyebrow: "Alta Floresta D'Oeste · Rondônia",
  hero_title: "Vereador Negão Monteiro",
  hero_subtitle: "",
  about_title: "",
  about_text: "",
  contact_email: "",
  contact_phone: "",
  whatsapp: "",
  address: "",
  office_hours: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  tiktok_url: "",
  home_sections: DEFAULT_HOME_SECTIONS,
};

/** Normaliza a lista de seções vinda do banco (ordem + chaves válidas). */
export function normalizeHomeSections(value: unknown): HomeSection[] {
  const valid = new Set<HomeSectionKey>(DEFAULT_HOME_SECTIONS.map((s) => s.key));
  const result: HomeSection[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      if (
        item &&
        typeof item === "object" &&
        valid.has((item as HomeSection).key) &&
        !result.some((s) => s.key === (item as HomeSection).key)
      ) {
        result.push({ key: (item as HomeSection).key, enabled: Boolean((item as HomeSection).enabled) });
      }
    }
  }
  for (const section of DEFAULT_HOME_SECTIONS) {
    if (!result.some((s) => s.key === section.key)) result.push(section);
  }
  return result;
}
