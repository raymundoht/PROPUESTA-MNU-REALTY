/**
 * DATOS LOCALES mientras no existe la base de datos (Fase 2).
 *
 * - Propiedades: inventario real de MNU Realty importado de EasyBroker (inventory.json).
 * - Asesores: la cuenta de la empresa más perfiles de ejemplo (ficticios).
 * Para dejar de usarlos basta con apuntar DATA_SOURCE=postgres y eliminar este archivo.
 */
import type { Agent, Property, PropertyType } from "./types";
import inventory from "./inventory.json";

const AGENCY = "mnu";
// Número de prueba para los botones de WhatsApp en modo demo (tu propio número).
const DEMO_WA = process.env.DEMO_WHATSAPP_NUMBER ?? null;

/**
 * Propiedad destacada que se muestra en el hero de inicio para cada tipo, y la foto
 * de su galería que mejor funciona a pantalla completa (si no se indica, la primera).
 */
export const HERO_PICKS: Record<PropertyType, { id: string; image?: number }> = {
  casa: { id: "EB-WX2462" },
  departamento: { id: "EB-XI3693" },
  oficina: { id: "EB-XH0344" },
  terreno: { id: "EB-WR0163", image: 4 },
  local: { id: "EB-WK0043", image: 3 },
  bodega: { id: "EB-VR1405" },
  proyecto: { id: "EB-VN2967" },
};

const COMPANY_AGENT_ID = "mnu";

export const demoAgents: Agent[] = [
  {
    id: COMPANY_AGENT_ID,
    agencyId: AGENCY,
    slug: "mnu-realty",
    name: "mnü Realty",
    title: "Equipo MNU Realty",
    bio: "Atención directa del equipo de mnü Realty en Chihuahua para compra, venta y renta de inmuebles.",
    specialties: ["Residencial", "Comercial", "Terrenos", "Preventas"],
    zones: ["Chihuahua", "Delicias", "Cuauhtémoc"],
    yearsExperience: 10,
    phone: "+52 614 247 8604",
    // En modo demo los botones de WhatsApp van al número de prueba, no al de la empresa.
    whatsapp: DEMO_WA,
    email: null,
    photoUrl: null,
    social: {},
  },
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

/**
 * Inventario real de MNU Realty (exportado de EasyBroker). Se regenera con
 * `python3 -I scripts/import-easybroker.py <PROPUESTA-MNU-REALTY/src/data>`.
 * Todas las propiedades se atienden desde la cuenta de la empresa.
 */
export const demoProperties: Property[] = (inventory as Omit<Property, "agencyId" | "agentId">[]).map((p) => ({
  ...p,
  agencyId: AGENCY,
  agentId: COMPANY_AGENT_ID,
}));
