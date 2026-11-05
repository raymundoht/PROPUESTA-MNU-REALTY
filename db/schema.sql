-- =====================================================================
-- MNU Realty — Esquema PostgreSQL 16+ con PostGIS (Amazon RDS)
-- Preparado para multiempresa (SaaS): toda tabla de negocio lleva agency_id.
-- La v1 opera con una sola agencia (MNU Realty).
-- Ejecutar con: psql "$DATABASE_URL" -f db/schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- búsqueda por texto (colonia, título)

-- ---------- Tipos ----------
CREATE TYPE user_role        AS ENUM ('super_admin', 'admin', 'agent');
CREATE TYPE user_status      AS ENUM ('active', 'suspended');
CREATE TYPE operation_type   AS ENUM ('venta', 'renta');
CREATE TYPE property_type    AS ENUM ('casa', 'departamento', 'terreno', 'local', 'oficina');
CREATE TYPE availability     AS ENUM ('disponible', 'apartada', 'vendida', 'rentada');
CREATE TYPE publish_status   AS ENUM ('borrador', 'en_revision', 'publicada', 'rechazada', 'oculta');
CREATE TYPE lead_stage       AS ENUM ('nuevo', 'contactado', 'visita_programada', 'negociacion', 'cerrado', 'perdido');
CREATE TYPE lead_source      AS ENUM ('formulario', 'whatsapp', 'telefono', 'manual', 'meta_ads', 'otro');
CREATE TYPE appointment_status AS ENUM ('programada', 'realizada', 'cancelada', 'no_asistio');
CREATE TYPE event_type       AS ENUM ('property_view', 'whatsapp_click', 'phone_click', 'share', 'lead_created', 'favorite');

-- ---------- Función común para updated_at ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- ---------- Agencias (tenant) ----------
CREATE TABLE agencies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  primary_domain text UNIQUE,                 -- mnurealty.com
  branding      jsonb NOT NULL DEFAULT '{}',  -- logo, colores, tipografías
  settings      jsonb NOT NULL DEFAULT '{}',  -- redes, datos de contacto, integraciones (sin secretos)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- Usuarios (staff: admins y asesores) ----------
-- auth_subject = id del proveedor de identidad (Cognito "sub" o Auth.js). Nunca guardamos contraseñas aquí.
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  auth_subject  text UNIQUE,
  email         citext NOT NULL,
  role          user_role NOT NULL DEFAULT 'agent',
  status        user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, email)
);

-- ---------- Perfil público del asesor (1:1 con users) ----------
CREATE TABLE agents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  user_id          uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  slug             text NOT NULL,
  full_name        text NOT NULL,
  title            text,
  bio              text,
  specialties      text[] NOT NULL DEFAULT '{}',
  zones            text[] NOT NULL DEFAULT '{}',
  years_experience smallint CHECK (years_experience BETWEEN 0 AND 80),
  phone            text,
  whatsapp         text CHECK (whatsapp ~ '^[0-9]{10,15}$'),  -- formato internacional sin "+"
  public_email     citext,
  photo_key        text,                      -- clave en S3
  social           jsonb NOT NULL DEFAULT '{}',
  is_public        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, slug)
);

-- ---------- Catálogo de amenidades ----------
CREATE TABLE amenities (
  id        serial PRIMARY KEY,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL = global
  slug      text NOT NULL,
  label     text NOT NULL,
  UNIQUE (agency_id, slug)
);

-- ---------- Propiedades ----------
CREATE TABLE properties (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  agent_id         uuid NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,  -- asesor responsable
  public_code      serial,                     -- número corto para el slug/URL
  slug             text NOT NULL,
  title            text NOT NULL CHECK (length(title) BETWEEN 5 AND 140),
  description      text NOT NULL DEFAULT '',
  operation        operation_type NOT NULL,
  type             property_type NOT NULL,
  availability     availability NOT NULL DEFAULT 'disponible',
  publish_status   publish_status NOT NULL DEFAULT 'borrador',
  price            numeric(14,2) NOT NULL CHECK (price > 0),
  currency         char(3) NOT NULL DEFAULT 'MXN' CHECK (currency IN ('MXN','USD')),
  bedrooms         smallint CHECK (bedrooms >= 0),
  bathrooms        numeric(3,1) CHECK (bathrooms >= 0),
  parking          smallint CHECK (parking >= 0),
  construction_m2  numeric(10,2) CHECK (construction_m2 > 0),
  land_m2          numeric(12,2) CHECK (land_m2 > 0),
  -- Ubicación
  state            text NOT NULL,
  city             text NOT NULL,
  colonia          text NOT NULL,
  street_address   text,
  postal_code      text,
  google_place_id  text,
  location         geography(Point, 4326) NOT NULL,         -- punto exacto (privado si show_exact_location = false)
  show_exact_location boolean NOT NULL DEFAULT true,
  -- Multimedia
  video_url        text,
  tour_360_url     text,
  featured         boolean NOT NULL DEFAULT false,
  -- Moderación
  reviewed_by      uuid REFERENCES users(id),
  reviewed_at      timestamptz,
  rejection_reason text,
  published_at     timestamptz,
  deleted_at       timestamptz,                -- borrado lógico
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, slug),
  CHECK (publish_status <> 'publicada' OR published_at IS NOT NULL)
);

-- Índices del catálogo público: solo filas publicadas y no borradas.
CREATE INDEX properties_location_gix  ON properties USING gist (location);   -- mapa / búsqueda por zona
CREATE INDEX properties_public_idx    ON properties (agency_id, operation, type, price)
  WHERE publish_status = 'publicada' AND deleted_at IS NULL;
CREATE INDEX properties_city_idx      ON properties (agency_id, city, colonia)
  WHERE publish_status = 'publicada' AND deleted_at IS NULL;
CREATE INDEX properties_recent_idx    ON properties (agency_id, published_at DESC)
  WHERE publish_status = 'publicada' AND deleted_at IS NULL;
CREATE INDEX properties_agent_idx     ON properties (agent_id);
CREATE INDEX properties_review_idx    ON properties (agency_id, publish_status) WHERE publish_status = 'en_revision';
CREATE INDEX properties_title_trgm    ON properties USING gin (title gin_trgm_ops);

CREATE TABLE property_amenities (
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id  int  NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE property_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  kind        text NOT NULL DEFAULT 'image' CHECK (kind IN ('image','video','tour360','floorplan')),
  s3_key      text NOT NULL,
  width       int,
  height      int,
  alt         text,
  position    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_media_order_idx ON property_media (property_id, position);

-- Historial de cambios de asesor responsable / precio (auditoría ligera)
CREATE TABLE property_history (
  id          bigserial PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  changed_by  uuid REFERENCES users(id),
  field       text NOT NULL,          -- 'agent_id', 'price', 'availability', 'publish_status'
  old_value   text,
  new_value   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Clientes / prospectos (CRM) ----------
CREATE TABLE contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  full_name   text NOT NULL,
  phone       text,
  email       citext,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);
CREATE INDEX contacts_phone_idx ON contacts (agency_id, phone);
CREATE INDEX contacts_email_idx ON contacts (agency_id, email);

CREATE TABLE leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  contact_id   uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  agent_id     uuid REFERENCES agents(id) ON DELETE SET NULL,      -- asesor responsable
  property_id  uuid REFERENCES properties(id) ON DELETE SET NULL,  -- propiedad de interés (opcional)
  stage        lead_stage NOT NULL DEFAULT 'nuevo',
  source       lead_source NOT NULL DEFAULT 'formulario',
  message      text,
  utm          jsonb NOT NULL DEFAULT '{}',
  closed_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_agent_stage_idx ON leads (agent_id, stage, created_at DESC);
CREATE INDEX leads_agency_idx      ON leads (agency_id, created_at DESC);

CREATE TABLE lead_activities (
  id          bigserial PRIMARY KEY,
  lead_id     uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id),
  kind        text NOT NULL CHECK (kind IN ('nota','llamada','whatsapp','correo','cambio_etapa','visita')),
  body        text,
  from_stage  lead_stage,
  to_stage    lead_stage,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lead_activities_lead_idx ON lead_activities (lead_id, created_at DESC);

CREATE TABLE appointments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  lead_id      uuid REFERENCES leads(id) ON DELETE SET NULL,
  agent_id     uuid NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  property_id  uuid REFERENCES properties(id) ON DELETE SET NULL,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz NOT NULL,
  status       appointment_status NOT NULL DEFAULT 'programada',
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX appointments_agent_time_idx ON appointments (agent_id, starts_at);

-- ---------- Favoritos (clientes con cuenta, fase futura) ----------
CREATE TABLE favorites (
  agency_id    uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_ref   text NOT NULL,          -- id del cliente autenticado
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_ref, property_id)
);

-- ---------- Estadísticas (eventos crudos) ----------
-- Nota: whatsapp_click registra la apertura del enlace, no confirma un mensaje enviado.
CREATE TABLE events (
  id           bigserial PRIMARY KEY,
  agency_id    uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  type         event_type NOT NULL,
  property_id  uuid REFERENCES properties(id) ON DELETE SET NULL,
  agent_id     uuid REFERENCES agents(id) ON DELETE SET NULL,
  session_hash text,                   -- hash anónimo, sin IP en claro
  referrer     text,
  utm          jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_agent_time_idx    ON events (agent_id, type, created_at DESC);
CREATE INDEX events_property_time_idx ON events (property_id, type, created_at DESC);
CREATE INDEX events_agency_time_idx   ON events USING brin (created_at);

-- ---------- Publicidad (Meta) ----------
CREATE TABLE ad_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id        uuid NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  property_id      uuid REFERENCES properties(id) ON DELETE SET NULL,
  created_by       uuid REFERENCES users(id),
  platform         text NOT NULL DEFAULT 'meta',
  external_id      text,                 -- id de la campaña en Meta
  name             text NOT NULL,
  status           text NOT NULL DEFAULT 'borrador',
  daily_budget     numeric(12,2),
  starts_at        timestamptz,
  ends_at          timestamptz,
  metrics          jsonb NOT NULL DEFAULT '{}',  -- impresiones, clics, gasto (sincronizado)
  metrics_synced_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------- Bitácora de auditoría ----------
CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  agency_id   uuid REFERENCES agencies(id) ON DELETE SET NULL,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  action      text NOT NULL,           -- 'property.approve', 'agent.suspend', ...
  entity      text NOT NULL,
  entity_id   text,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_agency_time_idx ON audit_log (agency_id, created_at DESC);

-- ---------- Triggers updated_at ----------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['agencies','users','agents','properties','contacts','leads','appointments','ad_campaigns'] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- ---------- Vista pública (lo único que lee el catálogo) ----------
-- Si la propiedad pide privacidad, se publica un punto desplazado/redondeado (~500 m), nunca el real.
CREATE VIEW public_properties AS
SELECT
  p.id, p.agency_id, p.agent_id, p.slug, p.title, p.description, p.operation, p.type,
  p.availability, p.price, p.currency, p.bedrooms, p.bathrooms, p.parking,
  p.construction_m2, p.land_m2, p.state, p.city, p.colonia,
  CASE WHEN p.show_exact_location THEN p.street_address END AS street_address,
  CASE WHEN p.show_exact_location THEN p.location
       ELSE ST_SnapToGrid(p.location::geometry, 0.005)::geography END AS location,
  p.show_exact_location, p.video_url, p.tour_360_url, p.featured, p.published_at
FROM properties p
WHERE p.publish_status = 'publicada' AND p.deleted_at IS NULL;

-- Ejemplo de consulta del mapa (propiedades dentro del área visible):
--   SELECT * FROM public_properties
--   WHERE agency_id = $1
--     AND location && ST_MakeEnvelope($west, $south, $east, $north, 4326)::geography
--     AND ($op IS NULL OR operation = $op)
--   LIMIT 500;
