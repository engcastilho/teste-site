"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center">
      <h1 className="text-lg font-semibold">Algo deu errado ao carregar esta página</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.digest ? `Código: ${error.digest}` : "Tente novamente."}</p>
      <Button className="mt-4" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
