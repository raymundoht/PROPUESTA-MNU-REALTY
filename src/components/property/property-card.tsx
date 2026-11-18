import Link from "next/link";
import { Bath, BedDouble, Car, MapPin, Maximize2 } from "lucide-react";
import type { Agent, Property } from "@/lib/types";
import { formatPrice, typeLabel, whatsappMessage } from "@/lib/format";
import { OperationBadge, StatusBadge } from "./badges";
import { FavoriteButton } from "./favorite-button";
import { WhatsAppButton } from "./whatsapp-button";
import { CardSlider } from "./card-slider";

export function PropertySpecs({ p, className = "" }: { p: Property; className?: string }) {
  const area = p.constructionM2 ?? p.landM2;
  const items = [
    p.bedrooms != null && { icon: BedDouble, label: `${p.bedrooms} rec.`, title: "Recámaras" },
    p.bathrooms != null && { icon: Bath, label: `${p.bathrooms} baños`, title: "Baños" },
    p.parking != null && { icon: Car, label: `${p.parking}`, title: "Estacionamientos" },
    area != null && { icon: Maximize2, label: `${area} m²`, title: p.constructionM2 ? "Construcción" : "Terreno" },
  ].filter(Boolean) as { icon: typeof Bath; label: string; title: string }[];
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted ${className}`}>
      {items.map(({ icon: Icon, label, title }) => (
        <li key={title} className="flex items-center gap-1.5" title={title}>
          <Icon className="size-4 text-gold-deep" strokeWidth={1.75} />
          {label}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  property: Property;
  agent: Agent | null;
  layout?: "grid" | "list";
  priority?: boolean;
}

export function PropertyCard({ property: p, agent, layout = "grid", priority }: Props) {
  const href = `/propiedades/${p.slug}`;
  const list = layout === "list";
  const inactive = p.status === "vendida" || p.status === "rentada";

  return (
    <article
      className={`group relative flex overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-float ${
        list ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <div className={`relative overflow-hidden bg-sand ${list ? "aspect-[4/3] sm:aspect-auto sm:w-[42%] sm:shrink-0" : "aspect-[4/3]"}`}>
        <CardSlider
          images={p.images}
          alt={p.title}
          href={href}
          priority={priority}
          dimmed={inactive}
          sizes={list ? "(min-width: 640px) 360px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3">
          <div className="flex gap-1.5">
            <OperationBadge op={p.operation} />
            <StatusBadge status={p.status} />
          </div>
          <FavoriteButton
            id={p.id}
            className="pointer-events-auto relative z-10 grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-muted">{typeLabel[p.type]}</p>
        <h3 className="mt-1 line-clamp-2 text-[17px] leading-snug font-semibold text-ink">
          <Link href={href} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {p.colonia}, {p.city}
          </span>
        </p>
        <p className="mt-3 font-display text-2xl text-ink">{formatPrice(p)}</p>
        <PropertySpecs p={p} className="mt-3" />

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-line/70 pt-4">
          <span className="truncate text-xs text-muted">
            {agent ? <>Asesor: <span className="font-medium text-ink">{agent.name}</span></> : "MNU Realty"}
          </span>
          {agent && !inactive && (
            <WhatsAppButton
              number={agent.whatsapp}
              message={whatsappMessage(p)}
              agentId={agent.id}
              propertyId={p.id}
              size="sm"
              className="relative z-10 shrink-0"
            />
          )}
          </div>
        </div>
      </div>
    </article>
  );
}
