import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { WhatsappIcon } from "@/components/site/social-icons";
import { SocialLinks } from "@/components/site/social-links";

export function ContactInfo({ settings }: { settings: SiteSettings }) {
  const items = [
    settings.whatsapp && {
      icon: WhatsappIcon,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: whatsappLink(settings.whatsapp),
      external: true,
    },
    settings.contact_phone && {
      icon: Phone,
      label: "Telefone",
      value: settings.contact_phone,
      href: `tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`,
    },
    settings.contact_email && {
      icon: Mail,
      label: "E-mail",
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
    },
    settings.address && { icon: MapPin, label: "Endereço", value: settings.address },
    settings.office_hours && { icon: Clock, label: "Atendimento", value: settings.office_hours },
  ].filter(Boolean) as {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }[];

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Os canais de contato ainda não foram cadastrados. Preencha-os no painel em Configurações.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value, href, external }) => {
          const content = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</span>
                <span className="block font-medium break-words text-slate-900">{value}</span>
              </span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
                >
                  {content}
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
      <SocialLinks settings={settings} className="text-slate-700" />
    </div>
  );
}
