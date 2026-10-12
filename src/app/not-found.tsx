import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-sm font-semibold text-brand">Erro 404</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Página não encontrada</h1>
      <p className="max-w-md text-slate-600">O conteúdo que você procura não existe ou não está mais publicado.</p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
