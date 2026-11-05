export const site = {
  name: "MNU Realty",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mnurealty.com",
  description:
    "Casas, departamentos, terrenos y locales en venta y renta. Contacta directo al asesor de cada propiedad.",
  /** Mientras no exista la base de datos, el sitio usa datos de ejemplo. */
  demoMode: process.env.DATA_SOURCE !== "postgres",
  // Datos de contacto de la empresa: pendientes de que MNU Realty los proporcione.
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? null,
  },
} as const;

export const nav = [
  { href: "/propiedades/venta", label: "Comprar" },
  { href: "/propiedades/renta", label: "Rentar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/asesores", label: "Asesores" },
  { href: "/nosotros", label: "Nosotros" },
] as const;
