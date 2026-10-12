import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import { DEFAULT_SETTINGS, PROJECT_CATEGORIES, normalizeHomeSections } from "@/lib/constants";
import type { News, NewsSummary, Page, PageSlug, Resource, SiteSettings } from "@/lib/types";

/**
 * Leituras públicas. Os resultados ficam em cache ("use cache") e recebem a
 * tag CONTENT_TAG. Toda Server Action do painel chama updateTag(CONTENT_TAG)
 * depois de gravar, então o site público mostra a alteração imediatamente,
 * sem novo deploy. O cacheLife("hours") é só uma rede de segurança para
 * alterações feitas fora do painel (ex.: direto no Supabase).
 */
export const CONTENT_TAG = "content";

const NEWS_SUMMARY_COLUMNS =
  "id, slug, title, excerpt, category, cover_image_url, cover_image_alt, published_at";

export const NEWS_PAGE_SIZE = 12;

function fail(context: string, error: { message: string }): never {
  throw new Error(`Falha ao carregar ${context}: ${error.message}`);
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;

  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) fail("configurações", error);
  if (!data) return DEFAULT_SETTINGS;

  return { ...DEFAULT_SETTINGS, ...data, home_sections: normalizeHomeSections(data.home_sections) };
}

export async function getLatestNews(
  limit: number,
  options: { categories?: string[]; excludeSlug?: string } = {},
): Promise<NewsSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return [];

  let query = createPublicClient()
    .from("news")
    .select(NEWS_SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (options.categories?.length) query = query.in("category", options.categories);
  if (options.excludeSlug) query = query.neq("slug", options.excludeSlug);

  const { data, error } = await query;
  if (error) fail("notícias", error);
  return (data ?? []) as NewsSummary[];
}

export async function getProjectNews(limit: number) {
  return getLatestNews(limit, { categories: PROJECT_CATEGORIES });
}

export async function getNewsPage(
  page: number,
  category?: string,
): Promise<{ items: NewsSummary[]; total: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return { items: [], total: 0 };

  const from = (page - 1) * NEWS_PAGE_SIZE;
  let query = createPublicClient()
    .from("news")
    .select(NEWS_SUMMARY_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, from + NEWS_PAGE_SIZE - 1);
  if (category) query = query.eq("category", category);

  const { data, error, count } = await query;
  if (error) fail("notícias", error);
  return { items: (data ?? []) as NewsSummary[], total: count ?? 0 };
}

export async function getNewsCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return [];

  const { data, error } = await createPublicClient()
    .from("news")
    .select("category")
    .eq("status", "published");
  if (error) fail("categorias", error);
  return [...new Set((data ?? []).map((n) => n.category as string))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export type NewsWithResources = News & { resources: Resource[] };

export async function getNewsBySlug(slug: string): Promise<NewsWithResources | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return null;

  const { data, error } = await createPublicClient()
    .from("news")
    .select("*, resources(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) fail("notícia", error);
  return (data as NewsWithResources | null) ?? null;
}

export async function getResources(): Promise<Resource[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return [];

  const { data, error } = await createPublicClient()
    .from("resources")
    .select("*")
    .eq("is_published", true)
    .order("reference_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) fail("recursos", error);
  return (data ?? []) as Resource[];
}

export type ResourceWithNews = Resource & { news: NewsSummary[] };

export async function getResourceBySlug(slug: string): Promise<ResourceWithNews | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return null;

  const { data, error } = await createPublicClient()
    .from("resources")
    .select(`*, news(${NEWS_SUMMARY_COLUMNS}, status)`)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) fail("recurso", error);
  if (!data) return null;

  const { news, ...resource } = data as Resource & { news: (NewsSummary & { status: string })[] };
  return {
    ...resource,
    news: news
      .filter((n) => n.status === "published")
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")),
  };
}

export async function getPage(slug: PageSlug): Promise<Page | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return null;

  const { data, error } = await createPublicClient()
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) fail("página", error);
  return (data as Page | null) ?? null;
}

export async function getSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) return { news: [], resources: [] };

  const supabase = createPublicClient();
  const [news, resources] = await Promise.all([
    supabase.from("news").select("slug, updated_at").eq("status", "published"),
    supabase.from("resources").select("slug, updated_at").eq("is_published", true),
  ]);
  if (news.error) fail("sitemap", news.error);
  if (resources.error) fail("sitemap", resources.error);
  return {
    news: news.data as { slug: string; updated_at: string }[],
    resources: resources.data as { slug: string; updated_at: string }[],
  };
}
