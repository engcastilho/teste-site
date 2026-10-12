import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-white to-brand-2/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-brand/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          {settings.hero_eyebrow && (
            <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-brand shadow-sm ring-1 ring-brand/15">
              {settings.hero_eyebrow}
            </p>
          )}
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance text-slate-900 sm:text-5xl">
            {settings.hero_title || settings.site_name}
          </h1>
          {settings.hero_subtitle && (
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">{settings.hero_subtitle}</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/noticias">
                Acompanhe as notícias
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/80">
              <Link href="/contato">Fale com o gabinete</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-md">
          <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-brand-2/40" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-200 shadow-xl ring-1 ring-black/5">
            {settings.hero_image_url ? (
              <Image
                src={settings.hero_image_url}
                alt={`Fotografia de ${settings.site_name}`}
                fill
                preload
                sizes="(min-width: 768px) 420px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-brand/20 to-brand/40 p-6 text-center text-brand">
                <UserRound className="size-24" aria-hidden />
                <p className="text-sm font-medium text-slate-700">
                  Espaço reservado para a fotografia oficial.
                  <br />
                  Envie a foto no painel em Configurações.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
