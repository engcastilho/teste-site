"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { listMedia } from "@/actions/media";
import type { Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/components/admin/upload";

/** Janela para escolher uma imagem da biblioteca ou enviar uma nova. */
export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
}) {
  const [items, setItems] = useState<Media[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listMedia()
      .then((data) => !cancelled && setItems(data))
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          toast.error("Não foi possível carregar a biblioteca.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadImage(file);
      toast.success("Imagem enviada.");
      onSelect(media);
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Biblioteca de imagens</DialogTitle>
          <DialogDescription>Escolha uma imagem já enviada ou envie uma nova.</DialogDescription>
        </DialogHeader>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="sr-only"
            id="library-upload"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {uploading ? "Enviando..." : "Enviar nova imagem"}
          </Button>
        </div>
        <div className="-mx-1 min-h-40 overflow-y-auto px-1">
          {items === null ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="size-8" />
              Nenhuma imagem enviada ainda.
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((media) => (
                <li key={media.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(media);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-lg bg-slate-100 ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    title={media.file_name}
                  >
                    <Image src={media.url} alt={media.alt || media.file_name} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
