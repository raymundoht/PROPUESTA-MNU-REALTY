/**
 * Capa de acceso a datos. Todas las páginas leen de aquí, nunca de la fuente
 * directamente. Hoy responde con datos demo; en Fase 2 estas mismas funciones
 * consultarán PostgreSQL (RDS) sin que cambien las páginas.
 *
 * Solo se exponen propiedades publicadas (aprobadas) y no ocultas.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { demoAgents, demoProperties } from "./demo-data";
import type { Agent, Paginated, Property, PropertyFilters, PropertyType } from "./types";

const PAGE_SIZE = 9;

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

  const q = f.q?.trim().toLowerCase();
  let items = (await allPublic()).filter((p) => {
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
  });

  // Disponibles primero; luego el orden pedido.
  const rank = (p: Property) => (p.status === "disponible" ? 0 : p.status === "apartada" ? 1 : 2);
  items = items.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    if (f.sort === "precio-asc") return a.price - b.price;
    if (f.sort === "precio-desc") return b.price - a.price;
    return b.publishedAt.localeCompare(a.publishedAt);
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page ?? 1), pageCount);
  return {
    items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount,
  };
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

export async function getAmenities() {
  "use cache";
  cacheLife("hours");
  const s = new Set<string>();
  for (const p of await allPublic()) p.amenities.forEach((a) => s.add(a));
  return [...s].sort((a, b) => a.localeCompare(b, "es"));
}
