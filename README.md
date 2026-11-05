# MNU Realty

Plataforma inmobiliaria de MNU Realty (mnurealty.com): catálogo, fichas de propiedad, perfiles de asesores y WhatsApp directo por asesor.

**Estado:** Fase 1 (portal público) construida con **datos de ejemplo**. La arquitectura, los roles, las integraciones, los costos y las fases están en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md); el modelo de datos, en [db/schema.sql](db/schema.sql).

## Correr en tu computadora

```bash
cp .env.example .env.local   # opcional: pon tu número en DEMO_WHATSAPP_NUMBER
npm install
npm run dev                  # http://localhost:3000
```

## Estructura

```
src/
  app/                     rutas (una carpeta = una URL)
    page.tsx               landing
    propiedades/           catálogo, /venta, /renta y [slug] (ficha)
    asesores/              listado y [slug] (perfil público)
    mapa/ contacto/ nosotros/ favoritos/ login/
    api/leads              solicitudes de información / visitas
    api/track              estadísticas (vistas, clics de WhatsApp)
  components/              UI (property/, search/, agent/, forms/, layout/)
  lib/
    repo.ts                ÚNICO acceso a datos (hoy demo → mañana PostgreSQL)
    demo-data.ts           datos de ejemplo (se elimina en Fase 2)
    format.ts              precios, mensaje y enlace de WhatsApp
db/schema.sql              PostgreSQL + PostGIS, multiempresa
brand/                     logo original y referencias de diseño
```

## Identidad visual
- Logo dorado metálico: va sobre fondos oscuros (encabezado y pie en carbón `#151512`).
- Base marfil `#F7F4EC`, oro `#B79951` como acento, verde `#1F6B4A` = venta, azul `#2457A6` = renta.
- Tipografías: Plus Jakarta Sans (interfaz) y DM Serif Display (títulos).
