import type { Availability, Operation, Property, PropertyType } from "./types";
import { site } from "./site";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatPrice(p: Pick<Property, "price" | "currency" | "operation">) {
  const base =
    p.currency === "USD"
      ? `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(p.price)} USD`
      : `${mxn.format(p.price)} MXN`;
  return p.operation === "renta" ? `${base} / mes` : base;
}

/** Formato corto para pines del mapa: $3.5 M, $18,000 */
export function formatPriceShort(price: number) {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `$${m.toFixed(m >= 10 ? 0 : 1).replace(/\.0$/, "")} M`;
  }
  return `$${new Intl.NumberFormat("es-MX").format(price)}`;
}

export const typeLabel: Record<PropertyType, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local: "Local comercial",
  oficina: "Oficina",
};

export const typeLabelPlural: Record<PropertyType, string> = {
  casa: "Casas",
  departamento: "Departamentos",
  terreno: "Terrenos",
  local: "Locales comerciales",
  oficina: "Oficinas",
};

export const operationLabel: Record<Operation, string> = {
  venta: "En venta",
  renta: "En renta",
};

export const statusLabel: Record<Availability, string> = {
  disponible: "Disponible",
  apartada: "Apartada",
  vendida: "Vendida",
  rentada: "Rentada",
};

export function propertyUrl(p: Pick<Property, "slug">) {
  return `${site.url}/propiedades/${p.slug}`;
}

/** Mensaje prellenado para WhatsApp con los datos de la propiedad. */
export function whatsappMessage(p: Pick<Property, "title" | "price" | "currency" | "operation" | "slug">) {
  return `Hola, me interesa la propiedad ${p.title}, con un precio de ${formatPrice(p)}. Me gustaría recibir más información. Enlace: ${propertyUrl(p)}`;
}

/** wa.me exige el número en formato internacional, solo dígitos. */
export function whatsappHref(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
