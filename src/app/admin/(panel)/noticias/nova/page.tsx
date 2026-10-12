import type { Metadata } from "next";
import { listResourceOptions } from "@/lib/data/admin";
import { RESOURCE_STATUS_INFO } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { NewsForm } from "@/components/admin/news-form";

export const metadata: Metadata = { title: "Nova notícia" };

export default async function NewNewsPage() {
  const resources = await listResourceOptions();
  return (
    <>
      <AdminPageHeader title="Nova notícia" />
      <NewsForm
        resourceOptions={resources.map((r) => ({
          id: r.id,
          label: r.title,
          detail: `${formatCurrency(r.amount)} · ${RESOURCE_STATUS_INFO[r.status].label}${r.is_published ? "" : " · oculto"}`,
          muted: !r.is_published,
        }))}
        linkedResourceIds={[]}
      />
    </>
  );
}
