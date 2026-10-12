export type NewsStatus = "draft" | "published";

export type ResourceStatus = "solicitado" | "anunciado" | "empenhado" | "pago" | "executado";

export type News = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsSummary = Pick<
  News,
  "id" | "slug" | "title" | "excerpt" | "category" | "cover_image_url" | "cover_image_alt" | "published_at"
>;

export type Resource = {
  id: string;
  slug: string;
  title: string;
  amount: number | null;
  description: string;
  purpose: string;
  location: string;
  origin: string;
  status: ResourceStatus;
  reference_date: string | null;
  photos: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type PageSlug = "sobre" | "contato";

export type Page = {
  slug: PageSlug;
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  updated_at: string;
};

export type HomeSectionKey = "news" | "resources" | "projects" | "about" | "contact";

export type HomeSection = { key: HomeSectionKey; enabled: boolean };

export type SiteSettings = {
  site_name: string;
  site_description: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  address: string;
  office_hours: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  home_sections: HomeSection[];
  updated_at?: string;
};

export type Media = {
  id: string;
  storage_path: string;
  url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  alt: string;
  created_at: string;
};

/** Resultado padrão das Server Actions usadas nos formulários. */
export type ActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ActionState = ActionResult | null;
