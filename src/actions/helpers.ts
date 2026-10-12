import "server-only";
import { updateTag } from "next/cache";
import { NotAuthorizedError } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/data/public";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/lib/types";
import type { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/** Invalida o cache do site público para que a alteração apareça na hora. */
export function refreshPublicSite() {
  updateTag(CONTENT_TAG);
}

export function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function textList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());
}

export function failure(message: string, fieldErrors?: Record<string, string[] | undefined>): ActionResult {
  return { ok: false, message, fieldErrors };
}

/** Converte erros conhecidos em mensagens amigáveis. */
export function handleError(error: unknown): ActionResult {
  if (error instanceof NotAuthorizedError) return failure(error.message);
  console.error(error);
  return failure("Não foi possível salvar. Verifique sua conexão e tente novamente.");
}

/** Gera um slug único na tabela, acrescentando -2, -3... se necessário. */
export async function uniqueSlug(
  supabase: Client,
  table: "news" | "resources",
  source: string,
  excludeId?: string,
) {
  const base = slugify(source) || "conteudo";
  const { data } = await supabase.from(table).select("id, slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((row) => row.id !== excludeId).map((row) => row.slug as string));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Sincroniza a tabela de vínculos a partir de um dos lados da relação. */
export async function syncLinks(
  supabase: Client,
  side: "news_id" | "resource_id",
  id: string,
  otherIds: string[],
) {
  const other = side === "news_id" ? "resource_id" : "news_id";
  const { data: current, error } = await supabase.from("news_resources").select(other).eq(side, id);
  if (error) throw error;

  const currentIds = new Set((current ?? []).map((row) => (row as Record<string, string>)[other]));
  const wanted = new Set(otherIds);

  const toRemove = [...currentIds].filter((x) => !wanted.has(x));
  const toAdd = [...wanted].filter((x) => !currentIds.has(x));

  if (toRemove.length) {
    const { error: delError } = await supabase.from("news_resources").delete().eq(side, id).in(other, toRemove);
    if (delError) throw delError;
  }
  if (toAdd.length) {
    const rows = toAdd.map((otherId) => ({ [side]: id, [other]: otherId }));
    const { error: insError } = await supabase.from("news_resources").insert(rows as never);
    if (insError) throw insError;
  }
}
