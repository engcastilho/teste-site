"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/components/site/nav";

export function MobileNav({ siteName, children }: { siteName: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <div className="border-b px-5 py-4 pr-14">
          <SheetTitle className="text-base">{siteName}</SheetTitle>
          <SheetDescription className="sr-only">Menu de navegação</SheetDescription>
        </div>
        <nav aria-label="Menu principal" className="flex flex-col px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3.5 text-base font-medium text-slate-800 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children && <div className="mt-auto border-t px-5 py-5">{children}</div>}
      </SheetContent>
    </Sheet>
  );
}
