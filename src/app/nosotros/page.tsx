import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce MNU Realty.",
  alternates: { canonical: "/nosotros" },
};

// Contenido pendiente: historia, misión y datos reales de MNU Realty.
export default function AboutPage() {
  return (
    <div className="container-x max-w-3xl py-14 lg:py-20">
      <p className="eyebrow">Nosotros</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">MNU Realty</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink/85">
        <p>
          Somos una inmobiliaria que conecta a cada cliente con el asesor que conoce la propiedad. Publicamos casas,
          departamentos, terrenos y locales en venta y renta, revisados antes de aparecer en el catálogo.
        </p>
        <p className="rounded-2xl border border-dashed border-gold/50 bg-gold-light/20 p-4 text-sm text-muted">
          Texto provisional. Aquí irá la historia, misión, cobertura y datos reales de MNU Realty.
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/propiedades" className="btn-primary">Ver propiedades</Link>
        <Link href="/asesores" className="btn-ghost">Conocer asesores</Link>
      </div>
    </div>
  );
}
