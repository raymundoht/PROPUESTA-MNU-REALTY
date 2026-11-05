import type { MetadataRoute } from "next";
import { getAgents, getAllPublicProperties } from "@/lib/repo";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, agents] = await Promise.all([getAllPublicProperties(), getAgents()]);
  const pages = ["", "/propiedades", "/propiedades/venta", "/propiedades/renta", "/asesores", "/mapa", "/nosotros", "/contacto"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...properties.map((p) => ({ url: `${site.url}/propiedades/${p.slug}`, lastModified: p.publishedAt })),
    ...agents.map((a) => ({ url: `${site.url}/asesores/${a.slug}` })),
  ];
}
