import type { Metadata } from "next";
import Link from "next/link";
import { FilePen, Images, Landmark, Newspaper, Plus } from "lucide-react";
import { getDashboardStats } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const cards = [
    { label: "Notícias publicadas", value: stats.published, icon: Newspaper, href: "/admin/noticias?status=published" },
    { label: "Rascunhos", value: stats.drafts, icon: FilePen, href: "/admin/noticias?status=draft" },
    { label: "Recursos cadastrados", value: stats.resources, detail: `${stats.publishedResources} visíveis no site`, icon: Landmark, href: "/admin/recursos" },
    { label: "Imagens", value: stats.media, icon: Images, href: "/admin/imagens" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Resumo do conteúdo do site."
        actions={
          <>
            <Button asChild>
              <Link href="/admin/noticias/nova">
                <Plus /> Nova notícia
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/recursos/novo">
                <Plus /> Novo recurso
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <Icon className="size-5 text-brand" aria-hidden />
            <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Notícias editadas recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recent.length ? (
            <ul className="divide-y">
              {stats.recent.map((news) => (
                <li key={news.id}>
                  <Link href={`/admin/noticias/${news.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                    <span className="min-w-0 truncate text-sm font-medium">{news.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(news.updated_at, true)}</span>
                      <Badge variant={news.status === "published" ? "success" : "warning"}>
                        {news.status === "published" ? "Publicada" : "Rascunho"}
                      </Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma notícia ainda.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
