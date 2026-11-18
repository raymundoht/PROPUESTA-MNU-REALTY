"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { CatalogToolbar } from "@/components/search/catalog-toolbar";
import { PropertyCard } from "@/components/property/property-card";
import { P, parseFilters, parseView } from "@/lib/filters";
import { filterProperties } from "@/lib/search";
import type { Agent, Property, PropertyFilters } from "@/lib/types";

/**
 * Resultados del catálogo. Se filtra en el navegador a partir de la URL, para que el
 * mismo código funcione con servidor y como sitio estático (GitHub Pages).
 */
export function CatalogResults({
  properties,
  agents,
  preset,
  basePath,
}: {
  properties: Property[];
  agents: Agent[];
  preset?: Partial<PropertyFilters>;
  basePath: string;
}) {
  const params = useSearchParams();
  const sp = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const filters = parseFilters(sp, preset);
  const view = parseView(sp);
  const result = filterProperties(properties, filters);
  const agentById = new Map(agents.map((a) => [a.id, a]));

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (k !== P.page) next.set(k, v);
    if (page > 1) next.set(P.page, String(page));
    const qs = next.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-w-0">
      <CatalogToolbar total={result.total} />

      {result.items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
          <SearchX className="size-10 text-gold" strokeWidth={1.5} />
          <h2 className="mt-4 text-lg font-semibold">No encontramos propiedades con esos filtros</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">Prueba ampliar el rango de precio o quitar alguna característica.</p>
          <Link href={basePath} className="btn-primary mt-6">Ver todas</Link>
        </div>
      ) : (
        <div className={`mt-6 grid gap-6 ${view === "list" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
          {result.items.map((p, i) => (
            <PropertyCard key={p.id} property={p} agent={agentById.get(p.agentId) ?? null} layout={view} priority={i < 3} />
          ))}
        </div>
      )}

      {result.pageCount > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
          {result.page > 1 && (
            <Link href={pageHref(result.page - 1)} className="btn-ghost px-3" aria-label="Página anterior">
              <ChevronLeft className="size-4" />
            </Link>
          )}
          {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={n === result.page ? "page" : undefined}
              className={`grid size-10 place-items-center rounded-full text-sm font-semibold transition ${
                n === result.page ? "bg-ink text-ivory" : "text-muted hover:bg-white hover:text-ink"
              }`}
            >
              {n}
            </Link>
          ))}
          {result.page < result.pageCount && (
            <Link href={pageHref(result.page + 1)} className="btn-ghost px-3" aria-label="Página siguiente">
              <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
