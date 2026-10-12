"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type LinkOption = { id: string; label: string; detail?: string; muted?: boolean };

/** Lista com busca e caixas de seleção para vincular notícias e recursos. */
export function LinkSelector({
  name,
  options,
  defaultSelected,
  emptyText,
}: {
  name: string;
  options: LinkOption[];
  defaultSelected: string[];
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(defaultSelected));

  const normalized = query
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  const visible = useMemo(
    () =>
      new Set(
        options
          .filter((o) =>
            o.label
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .toLowerCase()
              .includes(normalized),
          )
          .map((o) => o.id),
      ),
    [options, normalized],
  );

  if (options.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  return (
    <div className="space-y-2">
      {options.length > 5 && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Buscar itens para vincular"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">{selected.size} selecionado(s)</p>
      <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
        {options.map((option) => (
          <li key={option.id} className={visible.has(option.id) ? "" : "hidden"}>
            <label className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-slate-50">
              <input
                type="checkbox"
                name={name}
                value={option.id}
                checked={selected.has(option.id)}
                onChange={(e) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(option.id);
                    else next.delete(option.id);
                    return next;
                  })
                }
                className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
              />
              <span className="min-w-0">
                <span className={`block text-sm font-medium ${option.muted ? "text-slate-500" : "text-slate-900"}`}>
                  {option.label}
                </span>
                {option.detail && <span className="block text-xs text-muted-foreground">{option.detail}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
