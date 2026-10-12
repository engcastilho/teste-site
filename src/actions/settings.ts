"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { DEFAULT_HOME_SECTIONS, normalizeHomeSections } from "@/lib/constants";
import type { ActionState } from "@/lib/types";
import { failure, handleError, refreshPublicSite, text } from "@/actions/helpers";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor no formato #RRGGBB.");
const url = z.string().refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Informe um endereço completo (https://...).");
const short = (max: number) => z.string().max(max, `Máximo de ${max} caracteres.`);

const schema = z.object({
  site_name: z.string().min(2, "Informe o nome do site.").max(100),
  site_description: short(300),
  primary_color: hex,
  secondary_color: hex,
  logo_url: url,
  hero_image_url: url,
  hero_eyebrow: short(100),
  hero_title: short(160),
  hero_subtitle: short(400),
  about_title: short(120),
  about_text: short(2000),
  contact_email: z.union([z.literal(""), z.email("E-mail inválido.")]),
  contact_phone: short(40),
  whatsapp: z.string().refine((v) => v === "" || /^[\d\s()+-]{8,20}$/.test(v), "Informe só o número, com DDD."),
  address: short(300),
  office_hours: short(200),
  instagram_url: url,
  facebook_url: url,
  youtube_url: url,
  tiktok_url: url,
});

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fields = Object.fromEntries(Object.keys(schema.shape).map((key) => [key, text(formData, key)]));
  const parsed = schema.safeParse(fields);
  if (!parsed.success) return failure("Corrija os campos destacados.", z.flattenError(parsed.error).fieldErrors);

  let homeSections = DEFAULT_HOME_SECTIONS;
  try {
    homeSections = normalizeHomeSections(JSON.parse(text(formData, "home_sections") || "[]"));
  } catch {
    return failure("Não foi possível ler a ordem das seções.");
  }

  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      ...parsed.data,
      logo_url: parsed.data.logo_url || null,
      hero_image_url: parsed.data.hero_image_url || null,
      primary_color: parsed.data.primary_color.toLowerCase(),
      secondary_color: parsed.data.secondary_color.toLowerCase(),
      home_sections: homeSections,
    });
    if (error) throw error;
    refreshPublicSite();
    return { ok: true, message: "Configurações salvas. O site já foi atualizado." };
  } catch (error) {
    return handleError(error);
  }
}
