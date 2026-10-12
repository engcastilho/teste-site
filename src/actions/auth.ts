"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { ActionState } from "@/lib/types";

const schema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

/** Traduz os erros do Supabase Auth para mensagens que ajudam a resolver. */
function loginErrorMessage(code?: string, message?: string) {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "E-mail ainda não confirmado. No Supabase, confirme o usuário em Authentication › Users.";
    case "email_provider_disabled":
      return "O login por e-mail está desativado no Supabase. Ative o provedor Email em Authentication › Sign In / Providers.";
    case "user_banned":
      return "Este usuário está bloqueado no Supabase.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    default:
      return `Não foi possível entrar (${code ?? "erro"}: ${message ?? "sem detalhes"}). Verifique as variáveis do Supabase na Vercel.`;
  }
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") && next !== "/admin/login" ? next : "/admin";
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "O Supabase ainda não foi configurado (variáveis de ambiente ausentes)." };
  }

  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, message: "Verifique os campos.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { ok: false, message: loginErrorMessage(error?.code, error?.message) };
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, message: "Esta conta não tem permissão de administrador." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
