"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { PropertyCard } from "@/components/property/property-card";
import type { Agent, Property } from "@/lib/types";

export function FavoritesList({ properties, agents }: { properties: Property[]; agents: Agent[] }) {
  const favs = useFavorites();
  const agentById = new Map(agents.map((a) => [a.id, a]));
  const list = properties.filter((p) => favs.includes(p.id));

  if (list.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
        <Heart className="size-10 text-gold" strokeWidth={1.5} />
        <p className="mt-4 font-semibold">Aún no guardas propiedades</p>
        <p className="mt-1 text-sm text-muted">Toca el corazón en cualquier propiedad para verla aquí.</p>
        <Link href="/propiedades" className="btn-primary mt-6">Explorar propiedades</Link>
      </div>
    );
  }
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <PropertyCard key={p.id} property={p} agent={agentById.get(p.agentId) ?? null} />
      ))}
    </div>
  );
}
