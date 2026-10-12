"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";

export function AdminMobileMenu({ footer }: { footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label="Abrir menu do painel">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-slate-800 bg-slate-950 p-0 text-white [&>button]:text-white">
        <div className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="text-white">Painel administrativo</SheetTitle>
          <SheetDescription className="sr-only">Menu do painel</SheetDescription>
        </div>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Menu do painel">
          <Suspense fallback={<AdminNavFallback />}>
            <AdminNav onNavigate={() => setOpen(false)} />
          </Suspense>
        </nav>
        <div className="border-t border-white/10 p-3">{footer}</div>
      </SheetContent>
    </Sheet>
  );
}
