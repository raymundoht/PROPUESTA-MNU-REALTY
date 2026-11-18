/**
 * Capa de acceso a datos. Todas las páginas leen de aquí, nunca de la fuente
 * directamente. Hoy responde con datos demo; en Fase 2 estas mismas funciones
 * consultarán PostgreSQL (RDS) sin que cambien las páginas.
 *
 * Solo se exponen propiedades publicadas (aprobadas) y no ocultas.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { HERO_PICKS, demoAgents, demoProperties } from "./demo-data";
import { formatPrice, propertyTypes } from "./format";
import { filterProperties } from "./search";
import type { Agent, Paginated, Property, PropertyFilters, PropertyType } from "./types";

async function allPublic(): Promise<Property[]> {
  return demoProperties;
}

async function allAgents(): Promise<Agent[]> {
  return demoAgents;
}

export async function searchProperties(f: PropertyFilters): Promise<Paginated<Property>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return filterProperties(await allPublic(), f);
}

/** Todo lo publicado, sin descripciones: lo necesario para filtrar y pintar tarjetas en el navegador. */
export async function getCatalogListings(): Promise<Property[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return (await allPublic()).map((p) => ({ ...p, description: "", images: p.images.slice(0, 6) }));
}

export async function getFeaturedProperties(limit = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return (await allPublic()).filter((p) => p.featured && p.status !== "vendida").slice(0, limit);
}

export async function getRecentProperties(limit = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return [...(await allPublic())]
    .filter((p) => p.status === "disponible")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export async function getPropertyBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties", `property:${slug}`);
  return (await allPublic()).find((p) => p.slug === slug) ?? null;
}

export async function getAllPublicProperties() {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return allPublic();
}

export async function getAllPropertySlugs() {
  return (await allPublic()).map((p) => p.slug);
}

export async function getSimilarProperties(p: Property, limit = 3) {
  "use cache";
  cacheLife("minutes");
  return (await allPublic())
    .filter((x) => x.id !== p.id && x.operation === p.operation && x.status !== "vendida")
    .sort((a, b) => Number(b.type === p.type) - Number(a.type === p.type) || Number(b.city === p.city) - Number(a.city === p.city))
    .slice(0, limit);
}

export async function getPropertiesByIds(ids: string[]) {
  const set = new Set(ids);
  return (await allPublic()).filter((p) => set.has(p.id));
}

export async function getAgents() {
  "use cache";
  cacheLife("hours");
  cacheTag("agents");
  return allAgents();
}

export async function getAgentById(id: string) {
  return (await getAgents()).find((a) => a.id === id) ?? null;
}

export async function getAgentBySlug(slug: string) {
  return (await getAgents()).find((a) => a.slug === slug) ?? null;
}

export async function getPropertiesByAgent(agentId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("properties");
  return (await allPublic())
    .filter((p) => p.agentId === agentId)
    .sort((a, b) => Number(b.status === "disponible") - Number(a.status === "disponible"));
}

export async function getCities() {
  "use cache";
  cacheLife("hours");
  const counts = new Map<string, { city: string; state: string; count: number; image: string }>();
  for (const p of await allPublic()) {
    const c = counts.get(p.city) ?? { city: p.city, state: p.state, count: 0, image: p.images[0] };
    c.count++;
    counts.set(p.city, c);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export async function getTypeCounts() {
  "use cache";
  cacheLife("hours");
  const counts: Partial<Record<PropertyType, number>> = {};
  for (const p of await allPublic()) counts[p.type] = (counts[p.type] ?? 0) + 1;
  return counts;
}

export interface HeroItem {
  type: PropertyType;
  image: string;
  slug: string;
  title: string;
  place: string;
  price: string;
  specs: string[];
}

/** Una propiedad destacada por tipo para el hero de inicio (ver HERO_PICKS). */
export async function getHeroShowcase(): Promise<HeroItem[]> {
  "use cache";
  cacheLife("hours");
  const all = await allPublic();
  const items: HeroItem[] = [];
  for (const type of propertyTypes) {
    const pick = HERO_PICKS[type];
    const p =
      all.find((x) => x.id === pick.id) ??
      all.find((x) => x.type === type && x.featured) ??
      all.find((x) => x.type === type && x.images.length);
    if (!p?.images.length) continue;
    const area = p.constructionM2 ?? p.landM2;
    items.push({
      type,
      image: p.images[p.id === pick.id ? (pick.image ?? 0) : 0] ?? p.images[0],
      slug: p.slug,
      title: p.title,
      place: `${p.colonia}, ${p.city}`,
      price: formatPrice(p),
      specs: [
        p.bedrooms != null ? `${p.bedrooms} rec.` : null,
        p.bathrooms != null ? `${p.bathrooms} baños` : null,
        area != null ? `${area.toLocaleString("es-MX")} m²` : null,
      ].filter((x): x is string => !!x),
    });
  }
  return items;
}

export async function getAmenities() {
  "use cache";
  cacheLife("hours");
  const s = new Set<string>();
  for (const p of await allPublic()) p.amenities.forEach((a) => s.add(a));
  return [...s].sort((a, b) => a.localeCompare(b, "es"));
}
