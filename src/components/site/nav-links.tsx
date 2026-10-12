"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "@/components/site/nav";

const base =
  "relative rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900";

/** Links do menu desktop com destaque da página atual. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              base,
              active &&
                "text-slate-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/** Versão sem destaque, usada durante o pré-carregamento. */
export function NavLinksFallback() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={base}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
