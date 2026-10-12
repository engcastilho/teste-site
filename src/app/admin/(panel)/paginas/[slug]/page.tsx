import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAdminPages } from "@/lib/data/admin";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { PageForm } from "@/components/admin/page-form";

export const metadata: Metadata = { title: "Editar página" };

export default async function EditPagePage(props: PageProps<"/admin/paginas/[slug]">) {
  const { slug } = await props.params;
  if (slug !== "sobre" && slug !== "contato") notFound();
  const pages = await getAdminPages();
  const page = pages[slug];

  return (
    <>
      <AdminPageHeader
        title={`Editar: ${page.title}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/${slug}`} target="_blank">
              <ExternalLink /> Ver no site
            </Link>
          </Button>
        }
      />
      <PageForm key={page.updated_at} page={page} withImage={slug === "sobre"} />
    </>
  );
}
