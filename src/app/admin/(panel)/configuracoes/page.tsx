import type { Metadata } from "next";
import { getAdminSettings } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <AdminPageHeader title="Configurações do site" description="Cores, logotipo, textos da página inicial, contatos e redes sociais." />
      <SettingsForm key={settings.updated_at} settings={settings} />
    </>
  );
}
