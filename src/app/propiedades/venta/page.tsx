import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Propiedades en venta",
  description: "Casas, departamentos, terrenos y locales en venta. Contacta directo al asesor de cada propiedad.",
  alternates: { canonical: "/propiedades/venta" },
};

export default function Page({ searchParams }: PageProps<"/propiedades/venta">) {
  return (
    <CatalogPage
      eyebrow="Comprar"
      title="Propiedades en venta"
      intro="Encuentra tu próxima casa o inversión. Cada propiedad tiene un asesor que te atiende directamente."
      searchParams={searchParams}
      basePath="/propiedades/venta"
      preset={{ operation: "venta" }}
    />
  );
}
