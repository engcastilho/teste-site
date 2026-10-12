"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Images, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/components/admin/upload";

/**
 * Campo de imagem: envia do dispositivo ou escolhe da biblioteca. O endereço
 * escolhido vai no formulário em um input oculto com o nome informado.
 */
export function ImageField({
  name,
  defaultValue,
  aspect = "aspect-video",
  onChange,
  className,
}: {
  name: string;
  defaultValue?: string | null;
  aspect?: string;
  onChange?: (url: string, alt?: string) => void;
  className?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(next: string, alt?: string) {
    setUrl(next);
    onChange?.(next, alt);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadImage(file);
      update(media.url, media.alt);
      toast.success("Imagem enviada.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={url} />
      <div className={cn("relative overflow-hidden rounded-lg border bg-slate-50", aspect)}>
        {url ? (
          <Image src={url} alt="Pré-visualização" fill sizes="400px" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
            <ImageIcon className="size-7" aria-hidden />
            Nenhuma imagem
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload /> Enviar
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => setLibraryOpen(true)}>
          <Images /> Biblioteca
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => update("")}>
            <Trash2 /> Remover
          </Button>
        )}
      </div>
      <MediaLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} onSelect={(m) => update(m.url, m.alt)} />
    </div>
  );
}

/** Lista de várias imagens (fotos de recursos). */
export function MultiImageField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (url: string) => setUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const media = await uploadImage(file);
        add(media.url);
      } catch (error) {
        toast.error(`${file.name}: ${(error as Error).message}`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}
      {urls.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url, i) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-slate-50">
              <Image src={url} alt={`Foto ${i + 1}`} fill sizes="160px" className="object-cover" />
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 right-1 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow"
                aria-label={`Remover foto ${i + 1}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhuma fotografia.</p>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Enviar fotos
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => setLibraryOpen(true)}>
          <Images /> Da biblioteca
        </Button>
      </div>
      <MediaLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} onSelect={(m) => add(m.url)} />
    </div>
  );
}
