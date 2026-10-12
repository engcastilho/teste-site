import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Imagem com proporção fixa. Sem imagem cadastrada, mostra um fundo neutro na
 * cor da marca — nunca uma fotografia inventada.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  preload,
  className,
  aspect = "aspect-[16/9]",
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-100", aspect, className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 via-brand/5 to-brand-2/15 text-brand/50"
          role="img"
          aria-label="Sem imagem"
        >
          <ImageIcon className="size-10" aria-hidden />
        </div>
      )}
    </div>
  );
}
