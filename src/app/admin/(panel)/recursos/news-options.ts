import { formatDate } from "@/lib/format";
import type { News } from "@/lib/types";

export function toNewsOptions(news: Pick<News, "id" | "title" | "status" | "published_at">[]) {
  return news.map((n) => ({
    id: n.id,
    label: n.title,
    detail: n.status === "published" ? `Publicada em ${formatDate(n.published_at, true)}` : "Rascunho",
    muted: n.status !== "published",
  }));
}
