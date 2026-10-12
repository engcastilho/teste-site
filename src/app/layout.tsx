import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { isHexColor, readableTextColor } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: settings.site_name, template: `%s | ${settings.site_name}` },
    description: settings.site_description,
    applicationName: settings.site_name,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: settings.site_name,
      title: settings.site_name,
      description: settings.site_description,
      images: settings.hero_image_url ? [{ url: settings.hero_image_url }] : undefined,
    },
    twitter: { card: "summary_large_image" },
    icons: settings.logo_url ? { icon: settings.logo_url } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSettings();
  return { themeColor: isHexColor(settings.primary_color) ? settings.primary_color : "#1d4ed8" };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const brand = isHexColor(settings.primary_color) ? settings.primary_color : "#1d4ed8";
  const brand2 = isHexColor(settings.secondary_color) ? settings.secondary_color : "#f59e0b";
  // As cores são validadas como #RRGGBB antes de entrar no CSS.
  const themeCss = `:root{--brand:${brand};--brand-foreground:${readableTextColor(brand)};--brand-2:${brand2};--brand-2-foreground:${readableTextColor(brand2)};}`;

  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <style id="brand-theme">{themeCss}</style>
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
