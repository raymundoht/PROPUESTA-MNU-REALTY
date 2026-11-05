import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Propiedades en renta",
  description: "Casas, departamentos, locales y oficinas en renta. Contacta directo al asesor de cada propiedad.",
  alternates: { canonical: "/propiedades/renta" },
};

export default function Page({ searchParams }: PageProps<"/propiedades/renta">) {
  return (
    <CatalogPage
      eyebrow="Rentar"
      title="Propiedades en renta"
      intro="Departamentos, casas y espacios comerciales listos para ocupar."
      searchParams={searchParams}
      basePath="/propiedades/renta"
      preset={{ operation: "renta" }}
    />
  );
}
