/**
 * DATOS DE EJEMPLO — NO SON PROPIEDADES REALES.
 *
 * Sirven solo para construir y probar el diseño mientras no existe la base de
 * datos (Fase 2). Asesores, precios, direcciones y fotos son ficticios
 * (fotos de Unsplash). Todo el sitio muestra un aviso "Demo" mientras se usen.
 * Para borrarlos basta con apuntar DATA_SOURCE=postgres y eliminar este archivo.
 */
import type { Agent, Property } from "./types";

const AGENCY = "mnu";
// Número de prueba para los botones de WhatsApp en modo demo (tu propio número).
const DEMO_WA = process.env.DEMO_WHATSAPP_NUMBER ?? null;

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const P = {
  modern1: img("1600596542815-ffad4c1539a9"),
  modern2: img("1600585154340-be6161a56a0c"),
  int1: img("1600607687939-ce8a6c25118c"),
  int2: img("1600566753190-17f0baa2a6c3"),
  pool: img("1512917774080-9991f1c4c750"),
  villa: img("1613490493576-7fde63acd811"),
  house1: img("1580587771525-78b9dba3b914"),
  house2: img("1568605114967-8130f3a36994"),
  house3: img("1570129477492-45c003edd2be"),
  house4: img("1564013799919-ab600027ffc6"),
  house5: img("1605276374104-dee2a0ed3cd6"),
  house6: img("1600047509807-ba8f99d2cdde"),
  house7: img("1628624747186-a941c476b7ef"),
  apt1: img("1502672260266-1c1ef2d93688"),
  apt2: img("1522708323590-d24dbb6b0267"),
  aptB: img("1545324418-cc1a3fa10c00"),
  apt3: img("1560448204-e02f11c3d0e2"),
  apt4: img("1493809842364-78817add7ffb"),
  office: img("1486406146926-c627a92ad1ab"),
  officeIn: img("1497366216548-37526070297c"),
  land: img("1500382017468-9049fed747ef"),
  shop: img("1441986300917-64674bd600d8"),
  street: img("1460317442991-0ec209397118"),
  int3: img("1507089947368-19c1da9775ae"),
  kitchen: img("1484154218962-a197022b5858"),
  int4: img("1600210492486-724fe5c67fb0"),
  int5: img("1600573472550-8090b5e0745e"),
  int6: img("1616594039964-ae9021a400a0"),
};

export const HERO_IMAGE = img("1613490493576-7fde63acd811").replace("w=1600", "w=2400");

export const demoAgents: Agent[] = [
  {
    id: "a1",
    agencyId: AGENCY,
    slug: "asesor-demo-andrea",
    name: "Andrea Demo",
    title: "Asesora residencial",
    bio: "Perfil de ejemplo. Aquí irá la biografía real del asesor: trayectoria, forma de trabajo y zonas que domina.",
    specialties: ["Residencial", "Preventas"],
    zones: ["Juriquilla", "Zibatá"],
    yearsExperience: 8,
    phone: null,
    whatsapp: DEMO_WA,
    email: null,
    photoUrl: null,
    social: {},
  },
  {
    id: "a2",
    agencyId: AGENCY,
    slug: "asesor-demo-diego",
    name: "Diego Demo",
    title: "Asesor comercial",
    bio: "Perfil de ejemplo. Especialista en locales, oficinas y terrenos para inversión.",
    specialties: ["Comercial", "Terrenos", "Inversión"],
    zones: ["Centro", "Milenio III"],
    yearsExperience: 12,
    phone: null,
    whatsapp: DEMO_WA,
    email: null,
    photoUrl: null,
    social: {},
  },
  {
    id: "a3",
    agencyId: AGENCY,
    slug: "asesor-demo-sofia",
    name: "Sofía Demo",
    title: "Asesora de rentas",
    bio: "Perfil de ejemplo. Acompaña a familias y profesionistas en la búsqueda de departamentos en renta.",
    specialties: ["Rentas", "Departamentos"],
    zones: ["El Refugio", "Providencia"],
    yearsExperience: 5,
    phone: null,
    whatsapp: DEMO_WA,
    email: null,
    photoUrl: null,
    social: {},
  },
  {
    id: "a4",
    agencyId: AGENCY,
    slug: "asesor-demo-mateo",
    name: "Mateo Demo",
    title: "Asesor residencial premium",
    bio: "Perfil de ejemplo. Propiedades residenciales de alto valor y casas de descanso.",
    specialties: ["Lujo", "Casas de descanso"],
    zones: ["Campestre", "San Miguel de Allende"],
    yearsExperience: 15,
    phone: null,
    whatsapp: DEMO_WA,
    email: null,
    photoUrl: null,
    social: {},
  },
];

type Seed = Omit<Property, "agencyId" | "currency" | "showExactLocation" | "slug"> &
  Partial<Pick<Property, "showExactLocation" | "currency">>;

const seeds: Seed[] = [
  {
    id: "101", agentId: "a4", title: "Casa contemporánea con alberca en Campestre",
    description: "Propiedad de ejemplo. Casa de dos niveles con doble altura en sala, jardín con alberca, cocina abierta con isla y recámara principal con vestidor. Ideal para familias que buscan amplitud y privacidad.",
    operation: "venta", type: "casa", status: "disponible", price: 12_800_000,
    state: "Guanajuato", city: "León", colonia: "Campestre", address: "Calle de ejemplo 100",
    lat: 21.153, lng: -101.705, bedrooms: 4, bathrooms: 4.5, parking: 3, constructionM2: 480, landM2: 620,
    amenities: ["Alberca", "Jardín", "Seguridad 24/7", "Cuarto de servicio", "Terraza"],
    images: [P.pool, P.int1, P.kitchen, P.int4, P.int5], featured: true, publishedAt: "2026-10-28",
  },
  {
    id: "102", agentId: "a1", title: "Residencia minimalista en Juriquilla",
    description: "Propiedad de ejemplo. Arquitectura minimalista con grandes ventanales, estudio, roof garden y vista a áreas verdes del fraccionamiento.",
    operation: "venta", type: "casa", status: "disponible", price: 7_450_000,
    state: "Querétaro", city: "Querétaro", colonia: "Juriquilla", address: "Calle de ejemplo 22",
    lat: 20.7, lng: -100.45, bedrooms: 3, bathrooms: 3.5, parking: 2, constructionM2: 320, landM2: 300,
    amenities: ["Roof garden", "Estudio", "Seguridad 24/7", "Casa club"],
    images: [P.modern1, P.int2, P.int3, P.kitchen], featured: true, publishedAt: "2026-10-30",
  },
  {
    id: "103", agentId: "a3", title: "Departamento amueblado en El Refugio",
    description: "Propiedad de ejemplo. Departamento listo para habitar, con balcón, cocina equipada y amenidades de alto nivel.",
    operation: "renta", type: "departamento", status: "disponible", price: 18_000, rentPeriod: "mes",
    state: "Querétaro", city: "Querétaro", colonia: "El Refugio", address: "Calle de ejemplo 8",
    lat: 20.66, lng: -100.345, bedrooms: 2, bathrooms: 2, parking: 2, constructionM2: 95, landM2: null,
    amenities: ["Amueblado", "Gimnasio", "Alberca", "Pet friendly"],
    images: [P.apt1, P.apt3, P.apt2], featured: true, publishedAt: "2026-11-02",
  },
  {
    id: "104", agentId: "a2", title: "Local comercial sobre avenida principal",
    description: "Propiedad de ejemplo. Local a pie de calle con gran frente, alto flujo vehicular y estacionamiento para clientes.",
    operation: "renta", type: "local", status: "disponible", price: 45_000, rentPeriod: "mes",
    state: "Querétaro", city: "Querétaro", colonia: "Centro", address: "Avenida de ejemplo 300",
    lat: 20.593, lng: -100.392, bedrooms: null, bathrooms: 1, parking: 4, constructionM2: 160, landM2: 180,
    amenities: ["Esquina", "Estacionamiento", "Bodega"],
    images: [P.shop, P.street], featured: false, publishedAt: "2026-10-18",
  },
  {
    id: "105", agentId: "a2", title: "Terreno habitacional en Zibatá",
    description: "Propiedad de ejemplo. Terreno plano dentro de fraccionamiento con servicios, ideal para construir casa a la medida.",
    operation: "venta", type: "terreno", status: "disponible", price: 2_150_000,
    state: "Querétaro", city: "Querétaro", colonia: "Zibatá", address: "Lote de ejemplo 14",
    lat: 20.672, lng: -100.336, bedrooms: null, bathrooms: null, parking: null, constructionM2: null, landM2: 350,
    amenities: ["Servicios", "Seguridad 24/7", "Áreas verdes"],
    images: [P.land], featured: false, publishedAt: "2026-10-10", showExactLocation: false,
  },
  {
    id: "106", agentId: "a4", title: "Casa colonial en el centro de San Miguel",
    description: "Propiedad de ejemplo. Casa con patio central, techos altos, terraza con vista y acabados artesanales.",
    operation: "venta", type: "casa", status: "apartada", price: 18_500_000, currency: "MXN",
    state: "Guanajuato", city: "San Miguel de Allende", colonia: "Centro", address: "Calle de ejemplo 5",
    lat: 20.914, lng: -100.744, bedrooms: 4, bathrooms: 5, parking: 1, constructionM2: 410, landM2: 390,
    amenities: ["Terraza", "Patio", "Chimenea", "Vista panorámica"],
    images: [P.villa, P.int6, P.int5], featured: true, publishedAt: "2026-09-29",
  },
  {
    id: "107", agentId: "a3", title: "Departamento con vista en Providencia",
    description: "Propiedad de ejemplo. Piso alto con vista a la ciudad, dos recámaras con baño, terraza y amenidades completas.",
    operation: "renta", type: "departamento", status: "disponible", price: 26_500, rentPeriod: "mes",
    state: "Jalisco", city: "Guadalajara", colonia: "Providencia", address: "Calle de ejemplo 1200",
    lat: 20.695, lng: -103.383, bedrooms: 2, bathrooms: 2, parking: 2, constructionM2: 120, landM2: null,
    amenities: ["Gimnasio", "Alberca", "Elevador", "Seguridad 24/7"],
    images: [P.aptB, P.apt4, P.apt1], featured: false, publishedAt: "2026-11-01",
  },
  {
    id: "108", agentId: "a1", title: "Casa familiar con jardín en Milenio III",
    description: "Propiedad de ejemplo. Casa en privada con jardín, tres recámaras, sala de TV y cochera techada.",
    operation: "venta", type: "casa", status: "disponible", price: 4_250_000,
    state: "Querétaro", city: "Querétaro", colonia: "Milenio III", address: "Privada de ejemplo 3",
    lat: 20.59, lng: -100.36, bedrooms: 3, bathrooms: 2.5, parking: 2, constructionM2: 210, landM2: 160,
    amenities: ["Jardín", "Privada", "Áreas verdes"],
    images: [P.house2, P.int3, P.kitchen], featured: false, publishedAt: "2026-10-25",
  },
  {
    id: "109", agentId: "a2", title: "Oficinas corporativas en renta",
    description: "Propiedad de ejemplo. Piso de oficinas acondicionado, sala de juntas, recepción y cajones de estacionamiento.",
    operation: "renta", type: "oficina", status: "disponible", price: 68_000, rentPeriod: "mes",
    state: "Querétaro", city: "Querétaro", colonia: "Centro Sur", address: "Boulevard de ejemplo 50",
    lat: 20.565, lng: -100.37, bedrooms: null, bathrooms: 3, parking: 8, constructionM2: 380, landM2: null,
    amenities: ["Elevador", "Recepción", "Estacionamiento", "Seguridad 24/7"],
    images: [P.office, P.officeIn], featured: false, publishedAt: "2026-10-05",
  },
  {
    id: "110", agentId: "a4", title: "Residencia en Puerta de Hierro",
    description: "Propiedad de ejemplo. Residencia de lujo con jardín amplio, cine en casa y terraza techada.",
    operation: "venta", type: "casa", status: "disponible", price: 24_900_000,
    state: "Jalisco", city: "Zapopan", colonia: "Puerta de Hierro", address: "Calle de ejemplo 77",
    lat: 20.708, lng: -103.42, bedrooms: 5, bathrooms: 6, parking: 4, constructionM2: 720, landM2: 900,
    amenities: ["Alberca", "Cine", "Jardín", "Seguridad 24/7", "Elevador"],
    images: [P.modern2, P.int4, P.int6, P.kitchen], featured: true, publishedAt: "2026-10-20",
  },
  {
    id: "111", agentId: "a1", title: "Casa en renta cerca de zona escolar",
    description: "Propiedad de ejemplo. Casa en fraccionamiento con vigilancia, cerca de escuelas y centros comerciales.",
    operation: "renta", type: "casa", status: "rentada", price: 22_000, rentPeriod: "mes",
    state: "Querétaro", city: "Querétaro", colonia: "Juriquilla", address: "Calle de ejemplo 41",
    lat: 20.71, lng: -100.44, bedrooms: 3, bathrooms: 2.5, parking: 2, constructionM2: 190, landM2: 150,
    amenities: ["Seguridad 24/7", "Casa club", "Jardín"],
    images: [P.house1, P.int2], featured: false, publishedAt: "2026-09-15",
  },
  {
    id: "112", agentId: "a3", title: "Departamento nuevo en preventa",
    description: "Propiedad de ejemplo. Departamento de una recámara en desarrollo nuevo, ideal para inversión o primera vivienda.",
    operation: "venta", type: "departamento", status: "disponible", price: 2_890_000,
    state: "Querétaro", city: "Querétaro", colonia: "El Refugio", address: "Calle de ejemplo 9",
    lat: 20.655, lng: -100.35, bedrooms: 1, bathrooms: 1, parking: 1, constructionM2: 62, landM2: null,
    amenities: ["Gimnasio", "Coworking", "Roof garden"],
    images: [P.apt2, P.apt3], featured: false, publishedAt: "2026-11-03",
  },
  {
    id: "113", agentId: "a4", title: "Casa de descanso con terraza",
    description: "Propiedad de ejemplo. Casa con espacios abiertos, terraza techada y jardín con árboles maduros.",
    operation: "venta", type: "casa", status: "disponible", price: 9_300_000,
    state: "Guanajuato", city: "San Miguel de Allende", colonia: "Los Frailes", address: "Calle de ejemplo 12",
    lat: 20.88, lng: -100.75, bedrooms: 3, bathrooms: 3, parking: 2, constructionM2: 300, landM2: 700,
    amenities: ["Terraza", "Jardín", "Chimenea"],
    images: [P.house4, P.house5, P.int5], featured: false, publishedAt: "2026-10-12",
  },
  {
    id: "114", agentId: "a1", title: "Casa moderna con doble altura",
    description: "Propiedad de ejemplo. Diseño moderno, doble altura en sala, cocina integral y patio de servicio.",
    operation: "venta", type: "casa", status: "vendida", price: 5_600_000,
    state: "Querétaro", city: "Querétaro", colonia: "Zibatá", address: "Calle de ejemplo 60",
    lat: 20.676, lng: -100.33, bedrooms: 3, bathrooms: 3, parking: 2, constructionM2: 245, landM2: 200,
    amenities: ["Seguridad 24/7", "Áreas verdes"],
    images: [P.house6, P.house7, P.int3], featured: false, publishedAt: "2026-08-30",
  },
];

export const demoProperties: Property[] = seeds.map((s) => ({
  agencyId: AGENCY,
  currency: "MXN",
  showExactLocation: true,
  ...s,
  slug: `${s.title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${s.id}`,
}));
