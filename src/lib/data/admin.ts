import "server-only";
import { requireAdmin } from "@/lib/auth";
import type { News, Page, PageSlug, Resource, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS, normalizeHomeSections } from "@/lib/constants";

/**
 * Leituras do painel: sem cache e sempre com a sessão do administrador, então
 * incluem rascunhos e itens ocultos (liberados pelo RLS apenas para admins).
 */

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [published, drafts, resources, publishedResources, media] = await Promise.all([
    count(supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published")),
    count(supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(supabase.from("resources").select("id", { count: "exact", head: true })),
    count(supabase.from("resources").select("id", { count: "exact", head: true }).eq("is_published", true)),
    count(supabase.from("media").select("id", { count: "exact", head: true })),
  ]);
  const { data: recent } = await supabase
    .from("news")
    .select("id, title, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  return {
    published,
    drafts,
    resources,
    publishedResources,
    media,
    recent: (recent ?? []) as Pick<News, "id" | "title" | "status" | "updated_at">[],
  };
}

export type AdminNewsRow = Pick<
  News,
  "id" | "title" | "slug" | "category" | "status" | "published_at" | "updated_at" | "cover_image_url"
>;

export async function listAdminNews(filter?: { status?: string; q?: string }) {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("news")
    .select("id, title, slug, category, status, published_at, updated_at, cover_image_url")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (filter?.status === "draft" || filter?.status === "published") query = query.eq("status", filter.status);
  if (filter?.q) query = query.ilike("title", `%${filter.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminNewsRow[];
}

export async function getAdminNews(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("news").select("*, resources(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as (News & { resources: Resource[] }) | null;
}

export async function listAdminResources() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("resources")
    .select("*, news_resources(count)")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...(r as Resource),
    news_count: (r.news_resources as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function getAdminResource(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("resources")
    .select("*, news(id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { news, ...resource } = data as Resource & { news: { id: string }[] };
  return { resource: resource as Resource, newsIds: news.map((n) => n.id) };
}

/** Opções para os seletores de vínculo. */
export async function listResourceOptions() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("resources")
    .select("id, title, amount, status, is_published")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as Pick<Resource, "id" | "title" | "amount" | "status" | "is_published">[];
}

export async function listNewsOptions() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, status, published_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as Pick<News, "id" | "title" | "status" | "published_at">[];
}

export async function getAdminPages() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("pages").select("*");
  if (error) throw error;
  const bySlug = new Map((data ?? []).map((p) => [p.slug as PageSlug, p as Page]));
  const empty = (slug: PageSlug, title: string): Page => ({
    slug,
    title,
    subtitle: "",
    content: "",
    image_url: null,
    image_alt: null,
    updated_at: "",
  });
  return {
    sobre: bySlug.get("sobre") ?? empty("sobre", "Sobre o vereador"),
    contato: bySlug.get("contato") ?? empty("contato", "Contato"),
  };
}

export async function getAdminSettings(): Promise<SiteSettings> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...data, home_sections: normalizeHomeSections(data.home_sections) };
}

export async function listAdminMedia() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []) as import("@/lib/types").Media[];
}
