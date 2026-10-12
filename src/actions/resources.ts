"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { RESOURCE_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { ActionResult, ActionState } from "@/lib/types";
import { failure, handleError, refreshPublicSite, syncLinks, text, textList, uniqueSlug } from "@/actions/helpers";

/** Aceita "200000", "200.000,00", "R$ 200.000,50" etc. */
function parseAmount(raw: string): number | null | "invalid" {
  const cleaned = raw.replace(/[R$\s]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return "invalid";
  const value = Number(normalized);
  return Number.isFinite(value) && value < 1e12 ? value : "invalid";
}

const schema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres.").max(200, "Título muito longo."),
  slug: z.string().max(120),
  description: z.string().max(5000),
  purpose: z.string().max(1000),
  location: z.string().max(300),
  origin: z.string().max(300),
  status: z.enum(RESOURCE_STATUSES as [string, ...string[]], { error: "Selecione a situação." }),
  reference_date: z.union([z.literal(""), z.iso.date("Data inválida.")]),
  photos: z.array(z.string().regex(/^https?:\/\/\S+$/i, "Endereço de imagem inválido.")).max(30),
  news_ids: z.array(z.uuid()),
  is_published: z.boolean(),
});

export async function saveResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = text(formData, "id") || undefined;
  const amount = parseAmount(text(formData, "amount"));
  const parsed = schema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    purpose: text(formData, "purpose"),
    location: text(formData, "location"),
    origin: text(formData, "origin"),
    status: text(formData, "status"),
    reference_date: text(formData, "reference_date"),
    photos: textList(formData, "photos"),
    news_ids: textList(formData, "news_ids"),
    is_published: formData.get("is_published") === "on",
  });

  const fieldErrors = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;
  if (amount === "invalid") (fieldErrors as Record<string, string[]>).amount = ["Valor inválido. Exemplo: 200.000,00"];
  if (!parsed.success || amount === "invalid") return failure("Corrija os campos destacados.", fieldErrors);
  const input = parsed.data;

  let newId: string | undefined;
  try {
    const { supabase } = await assertAdmin();

    let slug: string;
    if (input.slug) {
      slug = slugify(input.slug);
      if (!slug) return failure("Corrija os campos destacados.", { slug: ["Endereço inválido."] });
      let query = supabase.from("resources").select("id").eq("slug", slug);
      if (id) query = query.neq("id", id);
      const { data: clash } = await query.maybeSingle();
      if (clash) return failure("Corrija os campos destacados.", { slug: ["Já existe um recurso com este endereço."] });
    } else {
      slug = await uniqueSlug(supabase, "resources", input.title, id);
    }

    const record = {
      title: input.title,
      slug,
      amount,
      description: input.description,
      purpose: input.purpose,
      location: input.location,
      origin: input.origin,
      status: input.status,
      reference_date: input.reference_date || null,
      photos: [...new Set(input.photos)],
      is_published: input.is_published,
    };

    let resourceId = id;
    if (id) {
      const { data, error } = await supabase.from("resources").update(record).eq("id", id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return failure("Recurso não encontrado.");
    } else {
      const { data, error } = await supabase.from("resources").insert(record).select("id").single();
      if (error) throw error;
      resourceId = data.id as string;
      newId = resourceId;
    }

    await syncLinks(supabase, "resource_id", resourceId!, input.news_ids);
    refreshPublicSite();
  } catch (error) {
    return handleError(error);
  }

  if (newId) redirect(`/admin/recursos/${newId}?salvo=1`);
  return {
    ok: true,
    message: input.is_published ? "Recurso salvo e visível no site." : "Recurso salvo (oculto no site).",
  };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { data, error } = await supabase.from("resources").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return failure("Recurso não encontrado.");
    refreshPublicSite();
    return { ok: true, message: "Recurso excluído." };
  } catch (error) {
    return handleError(error);
  }
}

export async function setResourcePublished(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const { data, error } = await supabase
      .from("resources")
      .update({ is_published: isPublished })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return failure("Recurso não encontrado.");
    refreshPublicSite();
    return { ok: true, message: isPublished ? "Recurso visível no site." : "Recurso ocultado do site." };
  } catch (error) {
    return handleError(error);
  }
}
