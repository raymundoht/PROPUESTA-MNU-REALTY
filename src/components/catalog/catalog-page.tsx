import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { CatalogFilters } from "@/components/search/catalog-filters";
import { CatalogToolbar } from "@/components/search/catalog-toolbar";
import { PropertyCard } from "@/components/property/property-card";
import { getAgents, getAmenities, getCities, searchProperties } from "@/lib/repo";
import { P, parseFilters, parseView } from "@/lib/filters";
import type { PropertyFilters } from "@/lib/types";

type SP = Promise<Record<string, string | string[] | undefined>>;

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  searchParams: SP;
  basePath: string;
  preset?: Partial<PropertyFilters>;
}

export function CatalogPage({ eyebrow, title, intro, searchParams, basePath, preset }: Props) {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-x py-10 sm:py-14">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{intro}</p>
        </div>
      </section>
      <div className="container-x grid gap-6 py-8 lg:grid-cols-[300px_1fr] lg:gap-8 lg:py-10">
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <Suspense fallback={<div className="h-12 rounded-full bg-sand lg:h-[560px] lg:rounded-card" />}>
            <Filters fixedOperation={!!preset?.operation} />
          </Suspense>
        </div>
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} preset={preset} basePath={basePath} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ fixedOperation }: { fixedOperation: boolean }) {
  const [cities, amenities] = await Promise.all([getCities(), getAmenities()]);
  return <CatalogFilters cities={cities.map((c) => c.city)} amenities={amenities} fixedOperation={fixedOperation} />;
}

async function Results({ searchParams, preset, basePath }: { searchParams: SP; preset?: Partial<PropertyFilters>; basePath: string }) {
  const sp = await searchParams;
  const filters = parseFilters(sp, preset);
  const view = parseView(sp);
  const [result, agents] = await Promise.all([searchProperties(filters), getAgents()]);
  const agentById = new Map(agents.map((a) => [a.id, a]));

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== P.page) next.set(k, v);
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
        <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Paginación">
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

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-card bg-white ring-1 ring-line/60">
          <div className="aspect-[4/3] animate-pulse bg-sand" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}
