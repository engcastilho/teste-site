import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { SiteSettings } from "@/lib/types";
import { MobileNav } from "@/components/site/mobile-nav";
import { NavLinks, NavLinksFallback } from "@/components/site/nav-links";
import { SocialLinks } from "@/components/site/social-links";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const initials = settings.site_name
    .replace(/^vereador(a)?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${settings.site_name} — página inicial`}>
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
              {initials || "V"}
            </span>
          )}
          <span className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {settings.site_name}
          </span>
        </Link>

        <nav aria-label="Menu principal" className="hidden items-center gap-1 md:flex">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </nav>

        <MobileNav siteName={settings.site_name}>
          <SocialLinks settings={settings} className="text-slate-700" />
        </MobileNav>
      </div>
    </header>
  );
}
