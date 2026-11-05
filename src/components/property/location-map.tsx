import { MapPin } from "lucide-react";
import type { Property } from "@/lib/types";

/**
 * Mapa de la ficha. Usa Google Maps Embed API cuando existe la clave pública
 * NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY (restringida por dominio en Google Cloud).
 * Si la propiedad pide privacidad, se muestra solo la colonia, nunca el punto exacto.
 */
export function LocationMap({ p }: { p: Property }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const q = p.showExactLocation ? `${p.lat},${p.lng}` : `${p.colonia}, ${p.city}, ${p.state}`;
  const zoom = p.showExactLocation ? 16 : 14;

  return (
    <div>
      <p className="flex items-start gap-2 text-sm text-muted">
        <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" />
        {p.showExactLocation ? `${p.address}, ` : ""}
        {p.colonia}, {p.city}, {p.state}
      </p>
      {!p.showExactLocation && (
        <p className="mt-1 text-xs text-muted">Ubicación aproximada por privacidad. El asesor te dará la dirección exacta.</p>
      )}
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-card bg-sand ring-1 ring-line/60">
        {key ? (
          <iframe
            title={`Mapa de ${p.title}`}
            className="absolute inset-0 size-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}&zoom=${zoom}&language=es`}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,var(--color-gold-light)_0,transparent_60%)] p-6 text-center">
            <div>
              <MapPin className="mx-auto size-8 text-gold-deep" />
              <p className="mt-2 text-sm font-medium text-ink">{p.colonia}, {p.city}</p>
              <p className="mt-1 text-xs text-muted">El mapa se activará al configurar Google Maps.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
