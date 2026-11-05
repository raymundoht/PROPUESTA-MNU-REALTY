import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned } from "lucide-react";
import { getCities, getRecentProperties } from "@/lib/repo";
import { formatPriceShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mapa de propiedades",
  description: "Explora en el mapa las propiedades en venta y renta de MNU Realty.",
};

// El mapa interactivo (Google Maps + PostGIS) es parte de la Fase 3.
// Mientras tanto, esta página muestra cómo se verán los pines y enlaza al catálogo por ciudad.
export default async function MapPage() {
  const cities = await getCities();
  const sample = await getRecentProperties(6);
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl text-center">
        <MapPinned className="mx-auto size-10 text-gold-deep" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Mapa de propiedades</h1>
        <p className="mt-3 text-muted">
          Muy pronto podrás buscar sobre el mapa: cada marcador mostrará el precio y si la propiedad está en venta o renta.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {sample.map((p) => (
            <Link
              key={p.id}
              href={`/propiedades/${p.slug}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold text-white shadow-md transition hover:scale-105 ${p.operation === "venta" ? "bg-sale" : "bg-rent"}`}
            >
              {formatPriceShort(p.price)} · {p.operation === "venta" ? "Venta" : "Renta"}
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="text-center text-sm font-semibold text-muted">Mientras tanto, explora por ciudad</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {cities.map((c) => (
            <Link key={c.city} href={`/propiedades?ciudad=${encodeURIComponent(c.city)}`} className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 transition hover:border-gold/60">
              <span className="font-medium">{c.city}<span className="ml-2 text-sm text-muted">{c.state}</span></span>
              <span className="text-sm text-muted">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
