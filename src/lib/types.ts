// Modelo de dominio compartido por frontend y API.
// Refleja las tablas de db/schema.sql (nombres en camelCase).

export type Operation = "venta" | "renta";
export type PropertyType = "casa" | "departamento" | "terreno" | "local" | "oficina";
export type Availability = "disponible" | "apartada" | "vendida" | "rentada";

export interface Agent {
  id: string;
  agencyId: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  zones: string[];
  yearsExperience: number;
  phone: string | null;
  /** Número en formato internacional sin "+" (ej. 5214421234567). */
  whatsapp: string | null;
  email: string | null;
  photoUrl: string | null;
  social: { instagram?: string; facebook?: string; linkedin?: string };
}

export interface Property {
  id: string;
  agencyId: string;
  agentId: string;
  slug: string;
  title: string;
  description: string;
  operation: Operation;
  type: PropertyType;
  status: Availability;
  price: number;
  currency: "MXN" | "USD";
  /** Solo renta: periodo del precio. */
  rentPeriod?: "mes";
  state: string;
  city: string;
  colonia: string;
  address: string;
  lat: number;
  lng: number;
  /** Si es false, se muestra una ubicación aproximada (privacidad). */
  showExactLocation: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  constructionM2: number | null;
  landM2: number | null;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  tour360Url?: string;
  featured: boolean;
  publishedAt: string;
}

export interface PropertyFilters {
  operation?: Operation;
  type?: PropertyType;
  city?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minM2?: number;
  amenity?: string;
  sort?: "recientes" | "precio-asc" | "precio-desc";
  page?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
