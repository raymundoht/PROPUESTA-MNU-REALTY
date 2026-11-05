import type { Operation, PropertyFilters, PropertyType } from "./types";

// Nombres de parámetros en la URL (en español, para URLs legibles y compartibles).
export const P = {
  operation: "operacion",
  type: "tipo",
  city: "ciudad",
  q: "q",
  minPrice: "min",
  maxPrice: "max",
  beds: "rec",
  baths: "banos",
  minM2: "m2",
  amenity: "amenidad",
  sort: "orden",
  view: "vista",
  page: "pagina",
} as const;

const OPS: Operation[] = ["venta", "renta"];
const TYPES: PropertyType[] = ["casa", "departamento", "terreno", "local", "oficina"];
const SORTS = ["recientes", "precio-asc", "precio-desc"] as const;

type Raw = Record<string, string | string[] | undefined>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseFilters(sp: Raw, preset?: Partial<PropertyFilters>): PropertyFilters {
  const op = str(sp[P.operation]) as Operation | undefined;
  const type = str(sp[P.type]) as PropertyType | undefined;
  const sort = str(sp[P.sort]) as PropertyFilters["sort"];
  return {
    operation: preset?.operation ?? (op && OPS.includes(op) ? op : undefined),
    type: type && TYPES.includes(type) ? type : undefined,
    city: str(sp[P.city]),
    q: str(sp[P.q])?.slice(0, 80),
    minPrice: num(sp[P.minPrice]),
    maxPrice: num(sp[P.maxPrice]),
    beds: num(sp[P.beds]),
    baths: num(sp[P.baths]),
    minM2: num(sp[P.minM2]),
    amenity: str(sp[P.amenity]),
    sort: sort && (SORTS as readonly string[]).includes(sort) ? sort : "recientes",
    page: num(sp[P.page]) ?? 1,
  };
}

export function parseView(sp: Raw): "grid" | "list" {
  return str(sp[P.view]) === "lista" ? "list" : "grid";
}
