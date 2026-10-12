import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string;
  isAdmin: boolean;
};

/**
 * Lê a sessão no servidor validando o JWT (getClaims) e confere se o usuário
 * está na tabela admin_users. Retorna null se não houver sessão.
 */
export async function getSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", claims.sub)
    .maybeSingle();

  return {
    supabase,
    userId: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    isAdmin: Boolean(admin),
  };
}

/** Para páginas do painel: redireciona ao login se não houver sessão. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export class NotAuthorizedError extends Error {
  constructor() {
    super("Sua sessão expirou ou você não tem permissão para esta ação. Entre novamente.");
  }
}

/** Para Server Actions: lança erro se o usuário não for administrador. */
export async function assertAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) throw new NotAuthorizedError();
  return session;
}

/** Para páginas do painel: exige sessão de administrador. */
export async function requireAdmin() {
  const session = await requireSession();
  if (!session.isAdmin) redirect("/admin/login?erro=permissao");
  return session;
}
