"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Images, Landmark, LayoutDashboard, Newspaper, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { href: "/admin/recursos", label: "Recursos", icon: Landmark },
  { href: "/admin/paginas", label: "Páginas", icon: FileText },
  { href: "/admin/imagens", label: "Imagens", icon: Images },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function NavList({ active, onNavigate }: { active?: (href: string) => boolean; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const isActive = active?.(href) ?? false;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
                isActive && "bg-white/15 text-white",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return <NavList active={active} onNavigate={onNavigate} />;
}

export function AdminNavFallback() {
  return <NavList />;
}
