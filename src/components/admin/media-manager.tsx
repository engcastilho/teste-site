"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, ImageIcon, Loader2, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, findMediaUsage, updateMediaAlt } from "@/actions/media";
import { formatBytes, formatDate } from "@/lib/format";
import type { Media } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/components/admin/upload";

function MediaItem({ media }: { media: Media }) {
  const [alt, setAlt] = useState(media.alt);
  const [saving, startSaving] = useTransition();
  const [usage, setUsage] = useState<string[] | null>(null);
  const [checking, startChecking] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border bg-white">
      <a href={media.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video bg-slate-100">
        <Image src={media.url} alt={media.alt || media.file_name} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={media.file_name}>{media.file_name || "Imagem"}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(media.size_bytes)} · {formatDate(media.created_at, true)}
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            startSaving(async () => {
              const result = await updateMediaAlt(media.id, alt);
              if (result?.ok) toast.success(result.message);
              else toast.error(result?.message ?? "Erro ao salvar.");
            });
          }}
        >
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Descrição da imagem" aria-label="Descrição da imagem" className="h-9 text-sm" maxLength={300} />
          <Button type="submit" size="icon-sm" variant="outline" disabled={saving || alt === media.alt} aria-label="Salvar descrição">
            {saving ? <Loader2 className="animate-spin" /> : <Check />}
          </Button>
        </form>
        {usage && (
          <div className="rounded-md bg-slate-50 p-2 text-xs">
            {usage.length ? (
              <>
                <p className="font-medium">Em uso em:</p>
                <ul className="list-disc pl-4">
                  {usage.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Não está em uso.</p>
            )}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(media.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                toast.error("Não foi possível copiar.");
              }
            }}
          >
            {copied ? <Check /> : <Copy />} Link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={checking}
            onClick={() => startChecking(async () => setUsage(await findMediaUsage(media.storage_path)))}
          >
            {checking ? <Loader2 className="animate-spin" /> : <Search />} Onde é usada
          </Button>
          <ConfirmActionButton
            size="sm"
            variant="ghost"
            className="text-destructive"
            action={() => deleteMedia(media.id)}
            title="Excluir imagem?"
            description="A imagem será removida definitivamente. Imagens em uso por notícias, recursos, páginas ou configurações não podem ser excluídas."
            confirmLabel="Excluir"
            destructive
          >
            <Trash2 /> Excluir
          </ConfirmActionButton>
        </div>
      </div>
    </li>
  );
}

export function MediaManager({ items }: { items: Media[] }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let sent = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadImage(file);
        sent++;
      } catch (error) {
        toast.error(`${file.name}: ${(error as Error).message}`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (sent) {
      toast.success(sent === 1 ? "Imagem enviada." : `${sent} imagens enviadas.`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF ou AVIF, até 5 MB. Fotos grandes são reduzidas automaticamente.</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_IMAGE_TYPES} className="sr-only" tabIndex={-1} onChange={(e) => handleFiles(e.target.files)} />
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {uploading ? "Enviando..." : "Enviar imagens"}
        </Button>
      </div>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((media) => (
            <MediaItem key={media.id} media={media} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-white py-16 text-muted-foreground">
          <ImageIcon className="size-8" />
          Nenhuma imagem enviada.
        </div>
      )}
    </div>
  );
}
