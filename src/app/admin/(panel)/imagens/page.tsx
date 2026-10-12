import type { Metadata } from "next";
import { listAdminMedia } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { MediaManager } from "@/components/admin/media-manager";

export const metadata: Metadata = { title: "Imagens" };

export default async function AdminMediaPage() {
  const items = await listAdminMedia();
  return (
    <>
      <AdminPageHeader title="Imagens" description="Biblioteca de imagens do site. Imagens em uso não podem ser excluídas." />
      <MediaManager items={items} />
    </>
  );
}
