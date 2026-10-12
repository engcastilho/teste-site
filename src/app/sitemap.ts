import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { news, resources } = await getSitemapData();
  const staticPages = ["", "/noticias", "/recursos", "/sobre", "/contato"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...news.map((n) => ({ url: `${SITE_URL}/noticias/${n.slug}`, lastModified: n.updated_at, priority: 0.7 })),
    ...resources.map((r) => ({ url: `${SITE_URL}/recursos/${r.slug}`, lastModified: r.updated_at, priority: 0.6 })),
  ];
}
