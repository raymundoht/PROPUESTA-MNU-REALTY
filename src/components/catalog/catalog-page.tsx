import { Suspense } from "react";
import { CatalogFilters } from "@/components/search/catalog-filters";
import { getAgents, getAmenities, getCatalogListings, getCities } from "@/lib/repo";
import type { PropertyFilters } from "@/lib/types";
import { CatalogResults } from "./catalog-results";

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  basePath: string;
  preset?: Partial<PropertyFilters>;
}

export function CatalogPage({ eyebrow, title, intro, basePath, preset }: Props) {
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
          <Results preset={preset} basePath={basePath} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ fixedOperation }: { fixedOperation: boolean }) {
  const [cities, amenities] = await Promise.all([getCities(), getAmenities()]);
  return <CatalogFilters cities={cities.map((c) => c.city)} amenities={amenities} fixedOperation={fixedOperation} />;
}

async function Results({ preset, basePath }: { preset?: Partial<PropertyFilters>; basePath: string }) {
  const [properties, agents] = await Promise.all([getCatalogListings(), getAgents()]);
  return <CatalogResults properties={properties} agents={agents} preset={preset} basePath={basePath} />;
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
