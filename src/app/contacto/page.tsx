import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a MNU Realty para comprar, vender o rentar una propiedad.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Hablemos de tu próxima propiedad</h1>
        <p className="mt-4 max-w-md text-muted">
          ¿Buscas comprar, rentar o quieres publicar tu inmueble con nosotros? Escríbenos y te asignamos al asesor adecuado.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          {site.contact.phone && (
            <li className="flex items-center gap-3"><Phone className="size-4 text-gold-deep" /><a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a></li>
          )}
          {site.contact.email && (
            <li className="flex items-center gap-3"><Mail className="size-4 text-gold-deep" /><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
          )}
        </ul>
      </div>
      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line/60 sm:p-8">
        <LeadForm submitLabel="Enviar mensaje" />
      </div>
    </div>
  );
}
