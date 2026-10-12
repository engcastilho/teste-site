"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import type { ActionResult, ActionState, NewsStatus } from "@/lib/types";
import { failure, handleError, refreshPublicSite, syncLinks, text, textList, uniqueSlug } from "@/actions/helpers";

const optionalUrl = z
  .string()
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Informe um endereço válido (https://...).");

const schema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres.").max(200, "Título muito longo."),
  slug: z.string().max(120, "Endereço muito longo."),
  excerpt: z.string().max(400, "O resumo deve ter no máximo 400 caracteres."),
  category: z.string().min(1, "Informe a categoria.").max(60, "Categoria muito longa."),
  content: z.string().max(200_000, "Conteúdo muito longo."),
  cover_image_url: optionalUrl,
  cover_image_alt: z.string().max(300),
  resource_ids: z.array(z.uuid()),
  intent: z.enum(["save", "draft", "publish"]),
});

export async function saveNews(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = text(formData, "id") || undefined;
  const parsed = schema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    category: text(formData, "category") || "Notícias",
    content: typeof formData.get("content") === "string" ? (formData.get("content") as string) : "",
    cover_image_url: text(formData, "cover_image_url"),
    cover_image_alt: text(formData, "cover_image_alt"),
    resource_ids: textList(formData, "resource_ids"),
    intent: text(formData, "intent") || "save",
  });
  if (!parsed.success) {
    return failure("Corrija os campos destacados.", z.flattenError(parsed.error).fieldErrors);
  }
  const input = parsed.data;

  let newId: string | undefined;
  try {
    const { supabase } = await assertAdmin();

    // Endereço (slug): o informado manualmente precisa ser único; o automático
    // recebe sufixo numérico se já existir.
    let slug: string;
    if (input.slug) {
      slug = slugify(input.slug);
      if (!slug) return failure("Corrija os campos destacados.", { slug: ["Endereço inválido."] });
      let query = supabase.from("news").select("id").eq("slug", slug);
      if (id) query = query.neq("id", id);
      const { data: clash } = await query.maybeSingle();
      if (clash) return failure("Corrija os campos destacados.", { slug: ["Já existe uma notícia com este endereço."] });
    } else {
      slug = await uniqueSlug(supabase, "news", input.title, id);
    }

    const record: Record<string, unknown> = {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      category: input.category,
      content: sanitizeRichText(input.content),
      cover_image_url: input.cover_image_url || null,
      cover_image_alt: input.cover_image_alt || null,
    };
    if (input.intent === "publish") record.status = "published";
    if (input.intent === "draft") record.status = "draft";

    let newsId = id;
    if (id) {
      const { data, error } = await supabase.from("news").update(record).eq("id", id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return failure("Notícia não encontrada.");
    } else {
      const { data, error } = await supabase.from("news").insert(record).select("id").single();
      if (error) throw error;
      newsId = data.id as string;
      newId = newsId;
    }

    await syncLinks(supabase, "news_id", newsId!, input.resource_ids);
    refreshPublicSite();
  } catch (error) {
    return handleError(error);
  }

  if (newId) redirect(`/admin/noticias/${newId}?salvo=${input.intent}`);

  const messages = {
    publish: "Notícia publicada. Ela já está visível no site.",
    draft: "Notícia salva como rascunho. Ela não aparece no site.",
    save: "Alterações salvas.",
  } as const;
  return { ok: true, message: messages[input.intent] };
}

export async function setNewsStatus(id: string, status: NewsStatus): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { data, error } = await supabase.from("news").update({ status }).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return failure("Notícia não encontrada.");
    refreshPublicSite();
    return {
      ok: true,
      message: status === "published" ? "Notícia publicada." : "Notícia retirada do site e salva como rascunho.",
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteNews(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { data, error } = await supabase.from("news").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return failure("Notícia não encontrada.");
    refreshPublicSite();
    return { ok: true, message: "Notícia excluída." };
  } catch (error) {
    return handleError(error);
  }
}
