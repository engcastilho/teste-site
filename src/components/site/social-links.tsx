import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from "@/components/site/social-icons";

export function getSocialLinks(settings: SiteSettings) {
  return [
    { label: "Instagram", href: settings.instagram_url, Icon: InstagramIcon },
    { label: "Facebook", href: settings.facebook_url, Icon: FacebookIcon },
    { label: "YouTube", href: settings.youtube_url, Icon: YoutubeIcon },
    { label: "TikTok", href: settings.tiktok_url, Icon: TiktokIcon },
    { label: "WhatsApp", href: settings.whatsapp ? whatsappLink(settings.whatsapp) : "", Icon: WhatsappIcon },
  ].filter((link) => link.href);
}

export function SocialLinks({ settings, className }: { settings: SiteSettings; className?: string }) {
  const links = getSocialLinks(settings);
  if (links.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex size-11 items-center justify-center rounded-full border border-current/20 transition-colors hover:bg-current/10"
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
