import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { NAV_ITEMS } from "@/components/site/nav";
import { SocialLinks } from "@/components/site/social-links";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-white">{settings.site_name}</p>
          {settings.site_description && (
            <p className="text-sm leading-relaxed text-slate-400">{settings.site_description}</p>
          )}
          <SocialLinks settings={settings} className="pt-2 text-slate-200" />
        </div>

        <nav aria-label="Rodapé" className="space-y-3">
          <p className="text-sm font-semibold tracking-wide text-white uppercase">Navegação</p>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-1.5 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 text-sm">
          <p className="font-semibold tracking-wide text-white uppercase">Contato</p>
          <ul className="space-y-2">
            {settings.contact_phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                <a href={`tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings.contact_email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                <a href={`mailto:${settings.contact_email}`} className="break-all hover:text-white">
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{settings.address}</span>
              </li>
            )}
            {!settings.contact_phone && !settings.contact_email && !settings.address && (
              <li className="text-slate-500">Cadastre os contatos no painel em Configurações.</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{settings.site_name} · Alta Floresta D&apos;Oeste – RO</p>
          <Link href="/admin" className="hover:text-slate-300">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
