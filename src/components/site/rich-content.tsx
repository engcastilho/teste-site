import { sanitizeRichText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

/** Exibe HTML do editor sempre sanitizado no servidor. */
export function RichContent({ html, className }: { html: string; className?: string }) {
  return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}
