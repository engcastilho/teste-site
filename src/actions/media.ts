"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/env";
import type { ActionResult, Media } from "@/lib/types";
import { failure, handleError, refreshPublicSite } from "@/actions/helpers";

const registerSchema = z.object({
  storage_path: z.string().regex(/^\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif|avif)$/, "Caminho inválido."),
  file_name: z.string().max(255),
  mime_type: z.string().regex(/^image\/(jpeg|png|webp|gif|avif)$/, "Tipo de arquivo não permitido."),
  size_bytes: z.number().int().nonnegative().max(5 * 1024 * 1024),
});

/** Registra na biblioteca uma imagem já enviada ao Storage pelo navegador. */
export async function registerMedia(
  input: z.infer<typeof registerSchema>,
): Promise<{ ok: true; media: Media } | { ok: false; message: string }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const { supabase } = await assertAdmin();
    const url = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(parsed.data.storage_path).data.publicUrl;
    const { data, error } = await supabase
      .from("media")
      .insert({ ...parsed.data, url })
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, media: data as Media };
  } catch (error) {
    const result = handleError(error);
    return { ok: false, message: result.message };
  }
}

export async function listMedia(): Promise<Media[]> {
  const { supabase } = await assertAdmin();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []) as Media[];
}

/** Lista onde uma imagem está sendo usada (busca pelo caminho no Storage). */
export async function findMediaUsage(storagePath: string): Promise<string[]> {
  const { supabase } = await assertAdmin();
  const pattern = `%${storagePath}%`;
  const [newsCover, newsContent, resources, pages, settings] = await Promise.all([
    supabase.from("news").select("title, status").like("cover_image_url", pattern),
    supabase.from("news").select("title, status").like("content", pattern),
    supabase.from("resources").select("title, photos"),
    supabase.from("pages").select("title, image_url, content"),
    supabase.from("site_settings").select("logo_url, hero_image_url").eq("id", 1).maybeSingle(),
  ]);

  const usage = new Set<string>();
  const label = (status: string) => (status === "published" ? "publicada" : "rascunho");
  for (const n of newsCover.data ?? []) usage.add(`Capa da notícia “${n.title}” (${label(n.status)})`);
  for (const n of newsContent.data ?? []) usage.add(`Texto da notícia “${n.title}” (${label(n.status)})`);
  for (const r of resources.data ?? []) {
    if ((r.photos as string[]).some((p) => p.includes(storagePath))) usage.add(`Fotos do recurso “${r.title}”`);
  }
  for (const p of pages.data ?? []) {
    if (p.image_url?.includes(storagePath) || p.content?.includes(storagePath)) usage.add(`Página “${p.title}”`);
  }
  if (settings.data?.logo_url?.includes(storagePath)) usage.add("Logotipo do site");
  if (settings.data?.hero_image_url?.includes(storagePath)) usage.add("Fotografia principal do site");
  return [...usage];
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("media").update({ alt: alt.trim().slice(0, 300) }).eq("id", id);
    if (error) throw error;
    return { ok: true, message: "Descrição salva." };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Exclui a imagem do Storage e da biblioteca. Bloqueia a exclusão se a imagem
 * estiver em uso por algum conteúdo, para não quebrar páginas publicadas.
 */
export async function deleteMedia(id: string): Promise<ActionResult & { usage?: string[] }> {
  try {
    const { supabase } = await assertAdmin();
    const { data: media, error } = await supabase.from("media").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!media) return failure("Imagem não encontrada.");

    const usage = await findMediaUsage(media.storage_path);
    if (usage.length) {
      return {
        ok: false,
        message: "Esta imagem está em uso e não pode ser excluída. Substitua-a nos conteúdos abaixo primeiro.",
        usage,
      };
    }

    const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([media.storage_path]);
    if (storageError) throw storageError;
    const { error: deleteError } = await supabase.from("media").delete().eq("id", id);
    if (deleteError) throw deleteError;
    refreshPublicSite();
    return { ok: true, message: "Imagem excluída." };
  } catch (error) {
    return handleError(error);
  }
}
