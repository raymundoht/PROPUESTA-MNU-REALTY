# MNU Realty: arquitectura y plan

## 1. Arquitectura

```
Visitante ──► mnurealty.com (DNS + SSL en Hostinger)
                 │
                 ▼
     Hostinger Business · Node.js Web App
     ┌───────────────────────────────────────────┐
     │ Next.js 16 (App Router)                    │
     │  • Páginas públicas (SSR/estáticas, SEO)   │
     │  • /dashboard y /admin (privados)          │
     │  • /api/* (backend REST: valida permisos)  │
     └──────────────┬───────────────┬─────────────┘
                    │               │
          SSL + usuario      URLs firmadas
          con permisos         (subidas)
          mínimos
                    ▼               ▼
         AWS RDS PostgreSQL    AWS S3 (+ CloudFront)
         + PostGIS             fotos, videos, PDFs
                    │
   Servicios externos: Google Maps/Places · wa.me · Meta Marketing API · GA4
```

- **Un solo proyecto Next.js** sirve el frontend y la API. Así hay un solo despliegue en Hostinger, y la base de datos nunca queda expuesta al navegador.
- **Capa de datos única** (`src/lib/repo.ts`): las páginas no saben de dónde vienen los datos. Hoy son datos demo; en Fase 2, la misma interfaz consulta PostgreSQL.
- **Caché**: el catálogo usa `"use cache"` con revalidación por etiquetas (`properties`, `agents`). Al aprobar o editar una propiedad se invalida la etiqueta y el sitio se actualiza al momento.
- **Multiempresa**: cada tabla de negocio tiene `agency_id`. La v1 opera con una sola agencia; el SaaS consistirá en resolver la agencia por dominio, sin rediseñar la base.

### Hostinger: compatibilidad verificada
- El plan **Business Web Hosting** permite "Node.js Web Apps" (Next.js con SSR y rutas de API). Admite Node 18/20/22/24, por eso el proyecto fija `engines.node` en `>=22 <25`.
- Despliegue: conectar el repositorio de GitHub en hPanel → Websites → Node.js app (build `npm run build`, start `npm start`).
- **Riesgo:** la IP de salida del hosting compartido puede cambiar, lo que impide restringir RDS por IP. Mitigación: SSL obligatorio, usuario de base de datos con permisos mínimos y contraseña robusta. Si no basta, RDS Proxy o pasar a un VPS de Hostinger.
- **No cambiar DNS** hasta que el sitio esté listo y aprobado.

## 2. Roles y permisos

| Acción | Visitante | Asesor | Admin |
|---|---|---|---|
| Ver catálogo, fichas y perfiles | ✅ | ✅ | ✅ |
| Enviar solicitud / WhatsApp | ✅ | | |
| Crear / editar **sus** propiedades | | ✅ (queda "en revisión") | ✅ todas |
| Aprobar / rechazar / destacar / ocultar | | | ✅ |
| Cambiar asesor responsable | | | ✅ |
| Ver **sus** prospectos y citas | | ✅ | ✅ todos |
| Editar su perfil y WhatsApp | | ✅ | ✅ |
| Crear / suspender asesores | | | ✅ |
| Estadísticas | | propias | globales |
| Configuración e integraciones | | | ✅ |

Las reglas se aplican **en el servidor** en cada operación: toda consulta del asesor filtra por `agent_id = sesión.agentId` y `agency_id = sesión.agencyId`. Ocultar un botón en la interfaz no basta.

**Autenticación:** el documento original propone Amazon Cognito, que es viable. Para el MVP recomiendo **Auth.js** (correo + contraseña o enlace mágico) con los usuarios en la propia base de datos: es más simple, cuesta $0 y la tabla `users.auth_subject` permite migrar a Cognito después sin rehacer datos.

## 3. Estrategia de integraciones

- **WhatsApp (v1):** enlace `wa.me/<número del asesor>?text=<mensaje con datos de la propiedad>`. Se registra cada clic (`events.whatsapp_click`), sabiendo que un clic **no confirma** que se haya enviado un mensaje. Por eso también hay un formulario que sí crea el prospecto en el CRM. La WhatsApp Business Platform (API) queda para el futuro.
- **Google Maps:**
  - Ficha de propiedad: Maps Embed API. Su clave es pública, así que debe restringirse por dominio.
  - Fase 3: Maps JavaScript API (pines de precio con AdvancedMarker, agrupación de marcadores) y Places Autocomplete en el formulario del asesor.
  - Las consultas por área visible usan PostGIS (`ST_MakeEnvelope` + índice GiST).
- **Meta:**
  - Nivel 1: botón "preparar anuncio" que copia textos y descarga las fotos.
  - Nivel 2: feed XML/CSV del catálogo (`/api/feeds/meta`) para catálogos inmobiliarios.
  - Nivel 3: Marketing API, que requiere app verificada, Business Manager y cumplir la *Special Ad Category: Housing* (segmentación limitada).
- **GA4:** etiqueta con consentimiento; eventos `whatsapp_click` y `generate_lead`.

## 4. Costos recurrentes estimados (USD/mes, aproximados)

| Servicio | Arranque | Notas |
|---|---|---|
| Hostinger Business | ya contratado | |
| RDS PostgreSQL db.t4g.micro + 20 GB | ~15–25 | 12 meses gratis si la cuenta AWS es nueva y cumple los requisitos |
| S3 + transferencia | ~1–5 | crece con fotos/tráfico |
| Google Maps Platform | 0–? | cuota mensual gratuita por producto; poner **límites de cuota y alertas** |
| Meta Ads | presupuesto de anuncios | la API no cobra |
| Cognito / Auth.js | 0 | en este volumen |

**Configurar alertas de facturación en AWS y Google Cloud desde el día 1.**

## 5. Riesgos principales
1. Claves de Google expuestas: usar claves distintas para servidor y navegador, la del navegador restringida por dominio.
2. Recursos compartidos de Hostinger: los picos de tráfico se resuelven con caché. Si no alcanza, pasar a Cloud o VPS.
3. Políticas de vivienda de Meta: limitan la segmentación y la aprobación de la app puede tardar semanas.
4. Calidad de datos: dirección y coordenadas mal capturadas. Se resuelve con Places Autocomplete y un marcador ajustable.
5. Datos personales de prospectos: aviso de privacidad (LFPDPPP), acceso por rol y respaldos automáticos de RDS.

## 6. Fases

| Fase | Contenido | Estado |
|---|---|---|
| **1. Portal público** | Landing, buscador, catálogo con filtros, ficha, perfiles de asesor, WhatsApp por asesor, favoritos, SEO | ✅ construida con datos demo |
| **2. Administración** | Auth, base de datos real en RDS, panel de asesor (CRUD + fotos a S3), panel admin (aprobaciones, asesores) | siguiente |
| **3. Geo + CRM** | Mapa con pines y búsqueda por área, Places, CRM por etapas, citas, estadísticas | |
| **4. Publicidad** | Feed Meta, herramientas promocionales, reportes, EasyBroker | |

### Lo que se necesita de MNU Realty para la Fase 2
- Cuenta AWS (con alertas de facturación) y acceso para crear RDS y S3.
- Cuenta de GitHub para el repositorio (Hostinger despliega desde ahí).
- Lista real de asesores: nombre, foto, WhatsApp, zonas y biografía.
- Textos reales: "Nosotros", aviso de privacidad, teléfono y correo de contacto.
