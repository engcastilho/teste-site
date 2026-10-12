import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { getAdminPages } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Páginas" };

export default async function AdminPagesPage() {
  const pages = await getAdminPages();
  const list = [
    { page: pages.sobre, path: "/sobre", description: "Biografia, trajetória e atuação parlamentar." },
    { page: pages.contato, path: "/contato", description: "Texto de atendimento. Telefones e redes ficam em Configurações." },
  ];
  return (
    <>
      <AdminPageHeader
        title="Páginas"
        description={<>Textos e fotografias das páginas institucionais. Textos da página inicial ficam em <Link className="underline" href="/admin/configuracoes">Configurações</Link>.</>}
      />
      <ul className="divide-y overflow-hidden rounded-xl border bg-white">
        {list.map(({ page, path, description }) => (
          <li key={page.slug}>
            <Link href={`/admin/paginas/${page.slug}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
              <FileText className="size-5 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{page.title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
                <p className="text-xs text-muted-foreground">
                  {path}
                  {page.updated_at && ` · atualizada em ${formatDate(page.updated_at, true)}`}
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
