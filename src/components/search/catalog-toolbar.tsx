"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, List, Map as MapIcon } from "lucide-react";
import { P } from "@/lib/filters";

export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const view = sp.get(P.view) === "lista" ? "lista" : "cuadricula";

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete(P.page);
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">{total}</span> {total === 1 ? "propiedad" : "propiedades"}
      </p>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="orden">Ordenar</label>
        <select
          id="orden"
          value={sp.get(P.sort) ?? "recientes"}
          onChange={(e) => set(P.sort, e.target.value === "recientes" ? null : e.target.value)}
          className="field w-auto py-2"
        >
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
        </select>
        <div className="flex rounded-full border border-line bg-white p-0.5" role="group" aria-label="Vista">
          <button
            type="button"
            onClick={() => set(P.view, null)}
            aria-pressed={view === "cuadricula"}
            className={`rounded-full p-2 transition ${view === "cuadricula" ? "bg-ink text-ivory" : "text-muted hover:text-ink"}`}
            aria-label="Vista de cuadrícula"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => set(P.view, "lista")}
            aria-pressed={view === "lista"}
            className={`rounded-full p-2 transition ${view === "lista" ? "bg-ink text-ivory" : "text-muted hover:text-ink"}`}
            aria-label="Vista de lista"
          >
            <List className="size-4" />
          </button>
          <Link href="/mapa" className="rounded-full p-2 text-muted transition hover:text-ink" aria-label="Vista de mapa">
            <MapIcon className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
