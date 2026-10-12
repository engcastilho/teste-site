"use client";

import { createClient } from "@/lib/supabase/client";
import { registerMedia } from "@/actions/media";
import type { Media } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(EXTENSIONS).join(",");

/**
 * Reduz fotos grandes (comuns em celulares) para no máximo 1920 px antes do
 * envio. GIFs são enviados como estão para preservar a animação.
 */
async function downscale(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/png" ? ".png" : ".jpg");
    return new File([blob], name, { type });
  } catch {
    return file;
  }
}

/** Envia uma imagem ao Supabase Storage e a registra na biblioteca. */
export async function uploadImage(original: File): Promise<Media> {
  if (!EXTENSIONS[original.type]) {
    throw new Error("Formato não suportado. Use JPG, PNG, WebP, GIF ou AVIF.");
  }
  const file = await downscale(original);
  if (file.size > MAX_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");

  const now = new Date();
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Falha no envio: ${error.message}`);

  const result = await registerMedia({
    storage_path: path,
    file_name: original.name.slice(0, 255),
    mime_type: file.type,
    size_bytes: file.size,
  });
  if (!result.ok) {
    await supabase.storage.from("media").remove([path]);
    throw new Error(result.message);
  }
  return result.media;
}
