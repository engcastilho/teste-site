import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";

function SidebarFooter({ email }: { email: string }) {
  return (
    <div className="space-y-1">
      <Link
        href="/"
        target="_blank"
        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
      >
        <ExternalLink className="size-5" aria-hidden /> Ver site
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-5" aria-hidden /> Sair
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-xs text-slate-500" title={email}>
        {email}
      </p>
    </div>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 text-white lg:flex">
        <div className="px-6 py-5">
          <Link href="/admin" className="text-lg font-semibold">
            Painel
          </Link>
          <p className="text-xs text-slate-400">Gestão do site</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Menu do painel">
          <Suspense fallback={<AdminNavFallback />}>
            <AdminNav />
          </Suspense>
        </nav>
        <div className="border-t border-white/10 p-3">
          <SidebarFooter email={email} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-slate-950 px-2 text-white lg:hidden">
        <AdminMobileMenu footer={<SidebarFooter email={email} />} />
        <Link href="/admin" className="font-semibold">
          Painel
        </Link>
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
