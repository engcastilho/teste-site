import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { signOut } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar" };

async function LoginContent({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const session = await getSession();

  if (session?.isAdmin) redirect(next?.startsWith("/admin") ? next : "/admin");

  if (session && !session.isAdmin) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
          A conta <strong>{session.email}</strong> não tem permissão de administrador.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Sair e entrar com outra conta
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      {!isSupabaseConfigured && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          O Supabase ainda não foi configurado. Defina as variáveis de ambiente descritas no README.
        </p>
      )}
      <LoginForm next={next} />
    </>
  );
}

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lock className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">Painel administrativo</CardTitle>
          <CardDescription>Acesso restrito à equipe do gabinete.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-56" />}>
            <LoginContent searchParams={props.searchParams} />
          </Suspense>
          <p className="mt-6 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ← Voltar ao site
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
