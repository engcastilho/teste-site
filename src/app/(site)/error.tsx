"use client";

import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-slate-600">Tente novamente em alguns instantes.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
