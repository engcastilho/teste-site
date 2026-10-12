"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitize";
import type { ActionState } from "@/lib/types";
import { failure, handleError, refreshPublicSite, text } from "@/actions/helpers";

const schema = z.object({
  slug: z.enum(["sobre", "contato"]),
  title: z.string().min(2, "Informe o título.").max(150, "Título muito longo."),
  subtitle: z.string().max(300, "Subtítulo muito longo."),
  content: z.string().max(200_000, "Conteúdo muito longo."),
  image_url: z.string().refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Imagem inválida."),
  image_alt: z.string().max(300),
});

export async function savePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    content: typeof formData.get("content") === "string" ? (formData.get("content") as string) : "",
    image_url: text(formData, "image_url"),
    image_alt: text(formData, "image_alt"),
  });
  if (!parsed.success) return failure("Corrija os campos destacados.", z.flattenError(parsed.error).fieldErrors);
  const input = parsed.data;

  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("pages").upsert({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      content: sanitizeRichText(input.content),
      image_url: input.image_url || null,
      image_alt: input.image_alt || null,
    });
    if (error) throw error;
    refreshPublicSite();
    return { ok: true, message: "Página atualizada no site." };
  } catch (error) {
    return handleError(error);
  }
}
