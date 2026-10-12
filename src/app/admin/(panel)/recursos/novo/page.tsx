import type { Metadata } from "next";
import { listNewsOptions } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ResourceForm } from "@/components/admin/resource-form";
import { toNewsOptions } from "../news-options";

export const metadata: Metadata = { title: "Novo recurso" };

export default async function NewResourcePage() {
  const news = await listNewsOptions();
  return (
    <>
      <AdminPageHeader
        title="Novo recurso"
        description="Informe a situação real do recurso. Valores só devem ser marcados como pagos ou executados com confirmação."
      />
      <ResourceForm newsOptions={toNewsOptions(news)} linkedNewsIds={[]} />
    </>
  );
}
