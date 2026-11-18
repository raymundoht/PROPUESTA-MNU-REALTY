import type { Paginated, Property, PropertyFilters } from "./types";

export const PAGE_SIZE = 9;

/**
 * Filtra, ordena y pagina propiedades. Es una función pura para usarla igual en el
 * servidor y en el navegador (la versión estática de GitHub Pages filtra en el cliente).
 */
export function filterProperties(all: Property[], f: PropertyFilters, pageSize = PAGE_SIZE): Paginated<Property> {
  const q = f.q?.trim().toLowerCase();
  const items = all
    .filter((p) => {
      if (f.operation && p.operation !== f.operation) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.city && p.city !== f.city) return false;
      if (q && !`${p.title} ${p.colonia} ${p.city} ${p.state}`.toLowerCase().includes(q)) return false;
      if (f.minPrice && p.price < f.minPrice) return false;
      if (f.maxPrice && p.price > f.maxPrice) return false;
      if (f.beds && (p.bedrooms ?? 0) < f.beds) return false;
      if (f.baths && (p.bathrooms ?? 0) < f.baths) return false;
      if (f.minM2 && (p.constructionM2 ?? p.landM2 ?? 0) < f.minM2) return false;
      if (f.amenity && !p.amenities.includes(f.amenity)) return false;
      return true;
    })
    .sort((a, b) => {
      // Disponibles primero; luego el orden pedido.
      const rank = (p: Property) => (p.status === "disponible" ? 0 : p.status === "apartada" ? 1 : 2);
      const r = rank(a) - rank(b);
      if (r) return r;
      if (f.sort === "precio-asc") return a.price - b.price;
      if (f.sort === "precio-desc") return b.price - a.price;
      return b.publishedAt.localeCompare(a.publishedAt);
    });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, f.page ?? 1), pageCount);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, pageCount };
}
