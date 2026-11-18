import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Propiedades en venta y renta",
  description: "Explora casas, departamentos, terrenos, locales y oficinas en venta y renta con MNU Realty.",
  alternates: { canonical: "/propiedades" },
};

export default function Page() {
  return (
    <CatalogPage
      eyebrow="Catálogo"
      title="Todas las propiedades"
      intro="Inmuebles publicados por los asesores de MNU Realty. Filtra por zona, precio y características."
      basePath="/propiedades"
    />
  );
}
