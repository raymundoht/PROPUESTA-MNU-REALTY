import { useEffect, useMemo, useState } from "react";
import {
  IconAdjustmentsHorizontal, IconArrowRight, IconArrowUpRight, IconBath, IconBed,
  IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconBrandWhatsapp,
  IconBuilding, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight,
  IconHeart, IconHome, IconMail, IconMapPin, IconMenu2, IconPhone, IconRuler2,
  IconSearch, IconSend, IconShieldCheck, IconX,
} from "@tabler/icons-react";
import inventory from "./data/mnu-inventory.json";
import propertyDetails from "./data/mnu-property-details.json";

const LOGO = "https://assets.easybroker.com/organization_files/189408/mn__.png";
const HERO = "https://assets.easybroker.com/organization_files/189408/IMG_1511.JPG";
const TEAM = "https://assets.easybroker.com/organization_files/189408/IMG_1757.jpg";
const PHONE = "+52 614 682 2292";
const PHONE_LINK = "tel:+526146822292";
const EMAIL = "eoreillyinvestments@gmail.com";
const WHATSAPP = "https://wa.me/526146822292";
const ADDRESS = "Paseos Vista del Sol 6801, Torre Azenzo, 2º Piso, Oficina #205, Chihuahua, Chih.";
const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/EduardoOReillyTuAsesorInmobiliario", Icon: IconBrandFacebook },
  { label: "Instagram", href: "https://www.instagram.com/mnu_realty/", Icon: IconBrandInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@mnu.realty", Icon: IconBrandTiktok },
];
const detailsByPath = Object.fromEntries(propertyDetails.map((entry) => [entry.path, entry]));
const sales = inventory.sales.map((item) => ({ ...item, group: "properties" }));
const rentals = inventory.rentals.map((item) => ({ ...item, group: "rentals" }));
const allListings = [...sales, ...rentals];

function cleanTitle(value = "") {
  return value.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, "").replace(/\s+/g, " ").trim();
}
function propertyType(item) { return (item.location || "").split(" en ")[0] || "Propiedad"; }
function numeric(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
function formatCount(value) { return new Intl.NumberFormat("es-MX").format(value); }

function getBasePath() {
  const p = window.location.pathname || "/";
  if (p.includes("/docs")) {
    return p.slice(0, p.indexOf("/docs") + 5);
  }
  const repoMatch = p.match(/^\/([^\/]+)/);
  const knownRoutes = ["properties", "rentals", "about", "owners", "contact", "property", "assets"];
  if (repoMatch && !knownRoutes.includes(repoMatch[1])) {
    return repoMatch[0];
  }
  return "";
}

function getRoute() {
  const base = getBasePath();
  let path = window.location.pathname || "/";
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  if (!path.startsWith("/")) path = "/" + path;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

function toHref(target) {
  const base = getBasePath();
  return base ? `${base}${target.startsWith("/") ? target : "/" + target}` : target;
}
function getInitialFilters() {
  const query = new URLSearchParams(window.location.search);
  return {
    location: query.get("location") || "", type: query.get("type") || "", minPrice: query.get("minPrice") || "",
    maxPrice: query.get("maxPrice") || "", minBeds: query.get("minBeds") || "", minBaths: query.get("minBaths") || "",
    minSize: query.get("minSize") || "", maxSize: query.get("maxSize") || "", minLand: query.get("minLand") || "",
    maxLand: query.get("maxLand") || "", keyword: query.get("keyword") || "",
  };
}
function priceNumber(price) { return numeric(String(price || "").replace(/MXN|USD|\/mes|\/noche/gi, "")); }
function imageFor(item) { return item.image_url || item.image || ""; }
function landArea(item) {
  const detail = detailsByPath[item.href];
  const text = [detail?.description, detail?.details].filter(Boolean).join(" ");
  const match = text.match(/(?:terreno|superficie\s+de\s+terreno)[^\d]{0,30}(\d[\d,]*(?:\.\d+)?)\s*m/i);
  return match ? numeric(match[1]) : 0;
}

function Header({ route, navigate, mobileOpen, setMobileOpen }) {
  const links = [
    { label: "Inicio", href: "/" }, { label: "Ventas", href: "/properties" }, { label: "Rentas", href: "/rentals" },
    { label: "Contáctanos", href: "/contact" }, { label: "¿Quiénes somos?", href: "/about" }, { label: "Propietarios", href: "/owners" },
  ];
  return <>
    <div className="topbar"><div className="shell topbar-inner">
      <span>Asesoría inmobiliaria en Chihuahua y destinos seleccionados</span>
      <div className="topbar-right"><a href={PHONE_LINK}><IconPhone size={14} />{PHONE}</a><span className="topbar-divider" /><span>ES <IconChevronDown size={13} /></span></div>
    </div></div>
    <header className="site-header"><div className="shell header-inner">
      <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}><img src={LOGO} alt="mnü Realty" /></a>
      <nav className={"main-nav" + (mobileOpen ? " is-open" : "")} aria-label="Navegación principal">
        {links.map((link) => <a key={link.href} href={link.href} className={route === link.href || (link.href === "/properties" && route.startsWith("/property/")) ? "active" : ""} onClick={(event) => { event.preventDefault(); navigate(link.href); }}>{link.label}</a>)}
        <a className="nav-mobile-contact" href={WHATSAPP} target="_blank" rel="noreferrer">Escríbenos <IconArrowUpRight size={16} /></a>
      </nav>
      <div className="header-actions"><a className="button button-light header-cta" href={WHATSAPP} target="_blank" rel="noreferrer"><span>Agendar asesoría</span><IconArrowUpRight size={16} /></a>
        <button className="icon-button mobile-menu" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}>{mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}</button>
      </div>
    </div></header>
  </>;
}

function Footer({ navigate }) {
  return <footer className="site-footer"><div className="shell footer-main">
    <div className="footer-brand"><a href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}><img src={LOGO} alt="mnü Realty" /></a>
      <p>Invertir con estrategia.<br />Vivir con propósito.</p>
      <div className="social-links">{SOCIALS.map(({ label, href, Icon }) => <a href={href} target="_blank" rel="noreferrer" aria-label={label} key={label}><Icon size={18} /></a>)}</div>
    </div>
    <div className="footer-column"><div className="footer-label">Explora</div>
      <a href="/properties" onClick={(event) => { event.preventDefault(); navigate("/properties"); }}>Propiedades en venta</a>
      <a href="/rentals" onClick={(event) => { event.preventDefault(); navigate("/rentals"); }}>Propiedades en renta</a>
      <a href="/about" onClick={(event) => { event.preventDefault(); navigate("/about"); }}>Quiénes somos</a>
      <a href="/owners" onClick={(event) => { event.preventDefault(); navigate("/owners"); }}>Publica tu propiedad</a>
    </div>
    <div className="footer-column footer-contact"><div className="footer-label">Hablemos</div><a href={PHONE_LINK}>{PHONE}</a><a href={"mailto:" + EMAIL}>{EMAIL}</a><p>{ADDRESS}</p></div>
    <div className="footer-note"><span className="eyebrow">mnü realty · Chihuahua, México</span><p>Te acompañamos a tomar decisiones inmobiliarias con visión, estrategia y atención personal.</p><a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer">Comienza una conversación <IconArrowUpRight size={16} /></a></div>
  </div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} mnü Realty. Todos los derechos reservados.</span><span>Asesoría inmobiliaria · Chihuahua, Chih.</span></div></footer>;
}

function SearchPanel({ navigate }) {
  const [operation, setOperation] = useState("properties");
  const [type, setType] = useState("");
  const [keyword, setKeyword] = useState("");
  function submit(event) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (keyword) query.set("keyword", keyword);
    navigate("/" + operation + (query.toString() ? "?" + query.toString() : ""));
  }
  const types = [...new Set(allListings.map(propertyType))].sort((a, b) => a.localeCompare(b, "es"));
  return <form className="search-panel" onSubmit={submit}>
    <div className="search-tabs" role="tablist" aria-label="Tipo de operación">
      <button type="button" className={operation === "properties" ? "selected" : ""} onClick={() => setOperation("properties")}>Comprar</button>
      <button type="button" className={operation === "rentals" ? "selected" : ""} onClick={() => setOperation("rentals")}>Rentar</button>
    </div>
    <div className="search-fields">
      <label className="search-keyword"><span>Ubicación o palabra clave</span><div><IconMapPin size={18} /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Ej. Bosques de San Francisco" /></div></label>
      <label><span>Tipo de propiedad</span><div className="select-wrap"><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos los tipos</option>{types.map((item) => <option key={item}>{item}</option>)}</select><IconChevronDown size={16} /></div></label>
      <button className="button button-accent search-submit" type="submit"><IconSearch size={17} /><span>Buscar propiedades</span></button>
    </div>
  </form>;
}

function PropertyCard({ item, navigate, favorite, toggleFavorite }) {
  const title = cleanTitle(item.title || item.location);
  const kind = propertyType(item);
  const propertyHref = item.href + "?operation=" + item.group;
  return <article className="property-card">
    <a className="property-image" href={propertyHref} onClick={(event) => { event.preventDefault(); navigate(propertyHref); }}>
      <img src={imageFor(item)} alt={title || kind} loading="lazy" />
      <span className="property-tag">{item.operation_type || "Propiedad"}</span><span className="property-type">{kind}</span>
    </a>
    <button className={"favorite-button" + (favorite ? " is-favorite" : "")} type="button" aria-label={favorite ? "Quitar de favoritos" : "Guardar propiedad"} onClick={() => toggleFavorite(item.href)}><IconHeart size={18} stroke={1.5} fill={favorite ? "currentColor" : "none"} /></button>
    <div className="property-info"><div className="property-location"><IconMapPin size={14} />{item.location}</div>
      <a className="property-title" href={propertyHref} onClick={(event) => { event.preventDefault(); navigate(propertyHref); }}>{title}</a>
      <div className="property-meta">
        {item.bedrooms !== null && item.bedrooms !== undefined && <span><IconBed size={15} />{item.bedrooms} rec.</span>}
        {item.bathrooms !== null && item.bathrooms !== undefined && <span><IconBath size={15} />{item.bathrooms} baños</span>}
        {item.size && <span><IconRuler2 size={15} />{item.size}</span>}
      </div>
      <div className="property-bottom"><strong>{item.price}</strong><a href={propertyHref} aria-label={"Ver " + title} onClick={(event) => { event.preventDefault(); navigate(propertyHref); }}><IconArrowUpRight size={18} /></a></div>
    </div>
  </article>;
}

function SectionHeading({ eyebrow, title, copy, link, onClick }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
    {link && <a className="text-link" href={link.href} onClick={(event) => { event.preventDefault(); onClick(link.href); }}>{link.label}<IconArrowUpRight size={17} /></a>}
  </div>;
}

function HomePage({ navigate, favorites, toggleFavorite }) {
  const featured = [...sales.slice(0, 3), ...rentals.slice(0, 1)];
  const typeCards = ["Casa", "Departamento", "Terreno", "Oficina"].map((type) => ({
    type, image: sales.find((item) => propertyType(item) === type)?.image_url,
    amount: allListings.filter((item) => propertyType(item) === type).length,
  }));
  return <main>
    <section className="hero">
      <div className="hero-photo" style={{ backgroundImage: "linear-gradient(90deg, rgba(8,9,10,.82) 0%, rgba(8,9,10,.58) 44%, rgba(8,9,10,.11) 100%), linear-gradient(0deg, rgba(8,9,10,.44), transparent 55%), url(" + HERO + ")" }} />
      <div className="shell hero-content"><div className="hero-copy"><span className="eyebrow eyebrow-bright"><span className="accent-dot" />Asesoría inmobiliaria con visión</span>
        <h1>Encuentra tu propiedad <em>ideal.</em></h1>
        <p>Te ayudamos a invertir con estrategia y vivir con propósito. Un equipo cercano, conocimiento local y opciones para cada etapa.</p>
        <div className="hero-actions"><a className="button button-accent" href="/properties" onClick={(event) => { event.preventDefault(); navigate("/properties"); }}>Explorar propiedades <IconArrowUpRight size={17} /></a>
          <a className="hero-call" href={WHATSAPP} target="_blank" rel="noreferrer"><span className="play-icon"><IconBrandWhatsapp size={17} /></span>Agenda una asesoría</a></div></div>
        <div className="hero-caption"><span>01 / 04</span><span>Chihuahua · México</span><div className="hero-progress"><i /></div></div>
      </div><div className="hero-search shell"><SearchPanel navigate={navigate} /></div>
    </section>

    <section className="intro-section shell"><div className="intro-mark">mnü<span>.</span></div>
      <div className="intro-copy"><span className="eyebrow">Más que una inmobiliaria</span><h2>Tu aliado para crear patrimonio con visión y resultados.</h2></div>
      <p>Conectamos tus objetivos con oportunidades reales. Nuestro equipo combina conocimiento de mercado y estrategias de marketing para ayudarte a encontrar, vender o rentar con confianza.</p>
    </section>

    <section className="featured-section section-pad"><div className="shell">
      <SectionHeading eyebrow="Oportunidades seleccionadas" title="Propiedades destacadas" copy="Una selección de espacios para vivir, invertir o hacer crecer tu patrimonio." link={{ href: "/properties", label: "Ver todas las propiedades" }} onClick={navigate} />
      <div className="property-grid featured-grid">{featured.map((item) => <PropertyCard key={item.group + item.href} item={item} navigate={navigate} favorite={favorites.includes(item.href)} toggleFavorite={toggleFavorite} />)}</div>
    </div></section>

    <section className="type-section section-pad"><div className="shell">
      <SectionHeading eyebrow="Encuentra tu espacio" title="Explora por tipo de propiedad" copy="Opciones para tus planes, desde tu nuevo hogar hasta la siguiente inversión." />
      <div className="type-grid">{typeCards.map((card, index) => <button key={card.type} className="type-card" type="button" onClick={() => navigate("/properties?type=" + encodeURIComponent(card.type))}>
        <img src={card.image} alt="" loading="lazy" /><span className="type-index">0{index + 1}</span>
        <span className="type-overlay"><strong>{card.type}</strong><span>{card.amount} propiedades <IconArrowUpRight size={16} /></span></span>
      </button>)}</div>
    </div></section>

    <section className="approach-section"><div className="approach-image" style={{ backgroundImage: "linear-gradient(90deg, rgba(7,8,9,.88), rgba(7,8,9,.18)), url(" + TEAM + ")" }} />
      <div className="shell approach-content"><div className="approach-text"><span className="eyebrow eyebrow-bright">Una experiencia diferente</span><h2>Decisiones inmobiliarias con respaldo en cada paso.</h2>
        <p>Te escuchamos, entendemos tus objetivos y ponemos a tu alcance las herramientas para tomar la mejor decisión. Con atención personalizada, marketing profesional y acompañamiento cercano.</p>
        <a className="button button-outline" href="/about" onClick={(event) => { event.preventDefault(); navigate("/about"); }}>Conoce mnü Realty <IconArrowUpRight size={17} /></a></div>
        <div className="approach-values"><div><span>01</span><strong>Asesoría personalizada</strong><p>Atención según tus necesidades y objetivos.</p></div>
          <div><span>02</span><strong>Estrategia de mercado</strong><p>Información para tomar decisiones con claridad.</p></div>
          <div><span>03</span><strong>Acompañamiento real</strong><p>De la primera búsqueda hasta el cierre.</p></div></div>
      </div>
    </section>

    <section className="owner-cta section-pad"><div className="shell owner-cta-inner">
      <div><span className="eyebrow">¿Tienes una propiedad?</span><h2>Hagamos que llegue a la persona correcta.</h2><p>Publica con un equipo que combina asesoría y marketing inmobiliario.</p></div>
      <a className="button button-accent" href="/owners" onClick={(event) => { event.preventDefault(); navigate("/owners"); }}>Quiero vender o rentar <IconArrowUpRight size={17} /></a>
    </div></section>
  </main>;
}

function FilterFields({ filters, setFilters, mode }) {
  const source = mode === "rentals" ? rentals : sales;
  const locations = [...new Set(source.map((item) => item.location.split(" en ").slice(1).join(" en ").split(",")[0]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const types = [...new Set(source.map(propertyType))].sort((a, b) => a.localeCompare(b, "es"));
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return <>
    <label className="filter-label"><span>Ubicación</span><div className="select-wrap"><select value={filters.location} onChange={(event) => update("location", event.target.value)}><option value="">Todas las zonas</option>{locations.map((location) => <option key={location}>{location}</option>)}</select><IconChevronDown size={15} /></div></label>
    <label className="filter-label"><span>Tipo de propiedad</span><div className="select-wrap"><select value={filters.type} onChange={(event) => update("type", event.target.value)}><option value="">Todos los tipos</option>{types.map((type) => <option key={type}>{type}</option>)}</select><IconChevronDown size={15} /></div></label>
    <fieldset className="filter-fieldset"><legend>{mode === "rentals" ? "Renta mensual" : "Precio"}</legend><div className="range-inputs"><input inputMode="numeric" placeholder="Mínimo" value={filters.minPrice} onChange={(event) => update("minPrice", event.target.value)} /><span>—</span><input inputMode="numeric" placeholder="Máximo" value={filters.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} /></div></fieldset>
    <fieldset className="filter-fieldset"><legend>Recámaras</legend><div className="range-inputs"><input inputMode="numeric" placeholder="Mínimo" value={filters.minBeds} onChange={(event) => update("minBeds", event.target.value)} /><span>+</span></div></fieldset>
    <fieldset className="filter-fieldset"><legend>Baños</legend><div className="range-inputs"><input inputMode="numeric" placeholder="Mínimo" value={filters.minBaths} onChange={(event) => update("minBaths", event.target.value)} /><span>+</span></div></fieldset>
    <fieldset className="filter-fieldset"><legend>Construcción (m²)</legend><div className="range-inputs"><input inputMode="numeric" placeholder="Desde" value={filters.minSize} onChange={(event) => update("minSize", event.target.value)} /><span>—</span><input inputMode="numeric" placeholder="Hasta" value={filters.maxSize} onChange={(event) => update("maxSize", event.target.value)} /></div></fieldset>
    <fieldset className="filter-fieldset"><legend>Terreno (m²)</legend><div className="range-inputs"><input inputMode="numeric" placeholder="Desde" value={filters.minLand} onChange={(event) => update("minLand", event.target.value)} /><span>—</span><input inputMode="numeric" placeholder="Hasta" value={filters.maxLand} onChange={(event) => update("maxLand", event.target.value)} /></div></fieldset>
    <label className="filter-label"><span>Buscar por palabra</span><input className="filter-text" value={filters.keyword} onChange={(event) => update("keyword", event.target.value)} placeholder="Colonia, código, nombre…" /></label>
  </>;
}

function ListingsPage({ mode, navigate, favorites, toggleFavorite }) {
  const [filters, setFilters] = useState(getInitialFilters);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const pageSize = 18;
  const source = mode === "rentals" ? rentals : sales;
  const filtered = useMemo(() => source.filter((item) => {
    const title = cleanTitle(item.title).toLocaleLowerCase("es");
    const location = String(item.location || "").toLocaleLowerCase("es");
    const type = propertyType(item).toLocaleLowerCase("es");
    const price = priceNumber(item.price);
    const size = numeric(item.size);
    const matchesLocation = !filters.location || location.includes(filters.location.toLocaleLowerCase("es"));
    const matchesType = !filters.type || type === filters.type.toLocaleLowerCase("es");
    const matchesMinPrice = !filters.minPrice || price >= numeric(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || price <= numeric(filters.maxPrice);
    const matchesBeds = !filters.minBeds || numeric(item.bedrooms) >= numeric(filters.minBeds);
    const matchesBaths = !filters.minBaths || numeric(item.bathrooms) >= numeric(filters.minBaths);
    const matchesMinSize = !filters.minSize || size >= numeric(filters.minSize);
    const matchesMaxSize = !filters.maxSize || size <= numeric(filters.maxSize);
    const land = landArea(item);
    const matchesMinLand = !filters.minLand || land >= numeric(filters.minLand);
    const matchesMaxLand = !filters.maxLand || (land > 0 && land <= numeric(filters.maxLand));
    const searchValue = filters.keyword.toLocaleLowerCase("es");
    const matchesText = !searchValue || [title, location, item.code].join(" ").toLocaleLowerCase("es").includes(searchValue);
    return matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && matchesMinSize && matchesMaxSize && matchesMinLand && matchesMaxLand && matchesText;
  }).sort((a, b) => {
    if (sort === "price-asc") return priceNumber(a.price) - priceNumber(b.price);
    if (sort === "price-desc") return priceNumber(b.price) - priceNumber(a.price);
    return 0;
  }), [source, filters, sort]);
  useEffect(() => { setPage(1); }, [filters, sort, mode]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const reset = () => setFilters({ location: "", type: "", minPrice: "", maxPrice: "", minBeds: "", minBaths: "", minSize: "", maxSize: "", minLand: "", maxLand: "", keyword: "" });
  const sale = mode === "properties";
  const operationTitle = sale ? "Propiedades en venta" : "Propiedades en renta";
  return <main className="listing-page">
    <section className="listing-hero"><div className="shell listing-hero-inner"><div><span className="eyebrow eyebrow-bright">Catálogo mnü Realty</span><h1>{sale ? "Encuentra tu próximo hogar o inversión." : "Espacios para vivir a tu manera."}</h1><p>Explora propiedades seleccionadas y filtra las opciones que se ajustan a lo que buscas.</p></div>
      <div className="listing-hero-count"><strong>{formatCount(source.length)}</strong><span>propiedades disponibles</span></div></div></section>
    <div className="shell catalog-shell"><div className="catalog-title-row"><div><span className="eyebrow">{sale ? "Venta y preventa" : "Renta residencial y comercial"}</span><h2>{operationTitle}</h2></div>
      <div className="catalog-controls"><button className="button button-filter" type="button" onClick={() => setFilterOpen(true)}><IconAdjustmentsHorizontal size={18} />Filtros</button>
        <label className="sort-label"><span>Ordenar por</span><div className="select-wrap"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Últimos publicados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option></select><IconChevronDown size={15} /></div></label></div></div>
      <div className="catalog-layout"><aside className="filter-sidebar"><div className="filter-sidebar-heading"><h3>Filtrar propiedades</h3><button type="button" onClick={reset}>Limpiar</button></div>
        <FilterFields filters={filters} setFilters={setFilters} mode={mode} /><a className="button button-accent filter-apply" href="#listings">Ver {filtered.length} propiedades <IconArrowRight size={16} /></a></aside>
        <section className="catalog-results" id="listings"><div className="result-summary"><span><strong>{formatCount(filtered.length)}</strong> opciones encontradas</span><span className="results-operation">{sale ? "Venta / preventa" : "Renta"} · Chihuahua</span></div>
          {visible.length ? <div className="property-grid catalog-grid">{visible.map((item, index) => <PropertyCard key={item.href + item.group + index} item={item} navigate={navigate} favorite={favorites.includes(item.href)} toggleFavorite={toggleFavorite} />)}</div>
            : <div className="empty-state"><IconSearch size={30} /><h3>No encontramos resultados</h3><p>Prueba con otros filtros o limpia tu búsqueda para ver todas las propiedades.</p><button className="button button-outline-dark" type="button" onClick={reset}>Limpiar filtros</button></div>}
          {pages > 1 && <nav className="pagination" aria-label="Paginación"><button type="button" disabled={page === 1} onClick={() => { setPage(page - 1); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Página anterior"><IconChevronLeft size={18} /></button>
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={number === page ? "current" : ""} onClick={() => { setPage(number); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>{number}</button>)}
            <button type="button" disabled={page === pages} onClick={() => { setPage(page + 1); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Página siguiente"><IconChevronRight size={18} /></button></nav>}
        </section></div></div>
    {filterOpen && <div className="drawer-backdrop" onClick={() => setFilterOpen(false)}><aside className="filter-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><span className="eyebrow">Personaliza tu búsqueda</span><h2>Filtros</h2></div><button className="icon-button" type="button" onClick={() => setFilterOpen(false)} aria-label="Cerrar filtros"><IconX size={21} /></button></div>
      <FilterFields filters={filters} setFilters={setFilters} mode={mode} /><div className="drawer-actions"><button className="button button-outline-dark" type="button" onClick={reset}>Limpiar</button><button className="button button-accent" type="button" onClick={() => setFilterOpen(false)}>Ver {filtered.length} resultados <IconArrowRight size={16} /></button></div>
    </aside></div>}
  </main>;
}

function PropertyPage({ path, navigate }) {
  const preferredGroup = new URLSearchParams(window.location.search).get("operation");
  const current = allListings.find((item) => item.href === path && (!preferredGroup || item.group === preferredGroup)) || allListings.find((item) => item.href === path) || detailsByPath[path]?.card;
  const detail = detailsByPath[path];
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => { setActiveImage(0); }, [path]);
  if (!current) return <NotFound navigate={navigate} />;
  const item = { ...detail?.card, ...current };
  const gallery = detail?.gallery?.length ? detail.gallery : [{ src: imageFor(item), alt: cleanTitle(item.title) }];
  const currentImage = gallery[Math.min(activeImage, gallery.length - 1)]?.src || imageFor(item);
  const facts = [
    { Icon: IconBed, value: item.bedrooms ?? "—", label: "Recámaras" }, { Icon: IconBath, value: item.bathrooms ?? "—", label: "Baños" },
    { Icon: IconRuler2, value: item.size || "—", label: "Construcción" }, { Icon: IconBuilding, value: detail?.card?.code || item.code || "—", label: "Clave" },
  ];
  const parseList = (value = "", heading) => value.split("\n").map((line) => line.trim()).filter((line) => line && line !== heading);
  const description = (detail?.description || "").replace(/^Descripción\s*\n?/, "");
  const detailItems = parseList(detail?.details || "", "Detalles");
  const characteristics = parseList(detail?.characteristics || "", "Características");
  const financing = parseList(detail?.financing || "", "Opciones de financiamiento");
  return <main className="detail-page"><div className="shell detail-shell">
    <div className="breadcrumbs"><a href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>Inicio</a><IconChevronRight size={14} /><a href={item.group === "rentals" ? "/rentals" : "/properties"} onClick={(event) => { event.preventDefault(); navigate(item.group === "rentals" ? "/rentals" : "/properties"); }}>{item.group === "rentals" ? "Rentas" : "Ventas"}</a><IconChevronRight size={14} /><span>{propertyType(item)}</span></div>
    <div className="detail-title-row"><div><span className="eyebrow">{item.operation_type || "Propiedad"} · {propertyType(item)}</span><h1>{cleanTitle(detail?.title || item.title)}</h1><p><IconMapPin size={16} />{detail?.location || item.location}</p></div>
      <div className="detail-price"><span>Precio</span><strong>{item.price}</strong><a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer">Consultar disponibilidad <IconArrowUpRight size={16} /></a></div></div>
    <div className="gallery-layout"><div className="gallery-main"><img src={currentImage} alt={gallery[activeImage]?.alt || cleanTitle(item.title)} /><span className="gallery-count">{String(activeImage + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
      {gallery.length > 1 && <><button className="gallery-arrow gallery-prev" type="button" onClick={() => setActiveImage((activeImage + gallery.length - 1) % gallery.length)} aria-label="Foto anterior"><IconChevronLeft size={21} /></button><button className="gallery-arrow gallery-next" type="button" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Siguiente foto"><IconChevronRight size={21} /></button></>}</div>
      {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((image, index) => <button type="button" key={image.src} className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={"Ver foto " + (index + 1)}><img src={image.src} alt="" loading="lazy" /></button>)}</div>}
    </div>
    <div className="detail-content-grid"><div className="detail-main-column"><div className="detail-facts">{facts.map(({ Icon, value, label }) => <div key={label}><Icon size={19} /><span className="fact-value">{value}</span><span className="fact-label">{label}</span></div>)}</div>
      <section className="detail-section"><span className="eyebrow">Sobre esta propiedad</span><h2>Descripción</h2><p className="detail-description">{description || "Contáctanos para conocer más detalles de esta propiedad y agendar una visita."}</p></section>
      {detailItems.length > 0 && <section className="detail-section"><span className="eyebrow">Información</span><h2>Detalles de la propiedad</h2><div className="detail-list">{detailItems.map((line, index) => <span key={index}>{line.replace(/^[-•]\s*/, "")}</span>)}</div></section>}
      {characteristics.length > 0 && <section className="detail-section"><span className="eyebrow">Características</span><h2>Comodidades y equipamiento</h2><div className="feature-tags">{characteristics.map((line, index) => <span key={index}><IconCheck size={14} />{line.replace(/^[-•✔️\s]+/, "")}</span>)}</div></section>}
      {financing.length > 0 && <section className="detail-section"><span className="eyebrow">Opciones disponibles</span><h2>Financiamiento</h2><div className="feature-tags">{financing.map((line, index) => <span key={index}><IconCheck size={14} />{line.replace(/^[-•]\s*/, "")}</span>)}</div></section>}
    </div><aside className="detail-contact-card"><span className="eyebrow">¿Te interesa?</span><h2>Conoce esta propiedad en persona.</h2><p>Con gusto resolvemos tus dudas y coordinamos una visita.</p>
      <a className="button button-accent" href={WHATSAPP} target="_blank" rel="noreferrer"><IconBrandWhatsapp size={18} />Solicitar información</a><a className="button button-outline-dark" href={PHONE_LINK}><IconPhone size={17} />Llamar a un asesor</a>
      <div className="contact-agent"><span className="agent-avatar">mnü</span><div><strong>Equipo mnü Realty</strong><span>Asesoría personalizada</span></div></div><div className="detail-code">Clave de propiedad <strong>{item.code || "Consulta disponible"}</strong></div>
    </aside></div>
    <div className="detail-back"><a className="text-link" href={item.group === "rentals" ? "/rentals" : "/properties"} onClick={(event) => { event.preventDefault(); navigate(item.group === "rentals" ? "/rentals" : "/properties"); }}><IconChevronLeft size={16} />Volver al catálogo</a></div>
  </div></main>;
}

function AboutPage({ navigate }) {
  return <main className="content-page"><section className="subpage-hero"><div className="shell"><span className="eyebrow eyebrow-bright">Conoce mnü Realty</span><h1>Más que una inmobiliaria,<br /><em>tu aliado estratégico.</em></h1><p>Te ayudamos a invertir con estrategia y vivir con propósito.</p></div></section>
    <section className="shell about-main"><div className="about-photo"><img src={TEAM} alt="Equipo de mnü Realty" /><span>mnü Realty · Chihuahua</span></div><div className="about-copy"><span className="eyebrow">Quiénes somos</span><h2>Construimos confianza para que construyas patrimonio.</h2>
      <p>Somos especialistas en brindar asesoría estratégica para inversión inmobiliaria, ayudando a nuestros clientes a tomar decisiones inteligentes que generen plusvalía y rentabilidad real.</p>
      <p>Nuestro compromiso es encontrar la propiedad ideal para cada cliente, ya sea para vivir, invertir o desarrollar, entendiendo sus necesidades y objetivos a fondo.</p>
      <p>Además, contamos con el respaldo de nuestra agencia de marketing especializada en bienes raíces, lo que nos permite vender propiedades en el menor tiempo posible, con estrategias digitales, contenido profesional y campañas efectivas que destacan cada inmueble en el mercado.</p>
      <p>Más que una inmobiliaria, somos tu aliado estratégico para construir patrimonio con visión y resultados.</p>
      <a className="button button-accent" href="/properties" onClick={(event) => { event.preventDefault(); navigate("/properties"); }}>Encuentra una propiedad <IconArrowUpRight size={17} /></a></div></section>
    <section className="values-section section-pad"><div className="shell"><SectionHeading eyebrow="Lo que nos mueve" title="Una asesoría que pone tus objetivos al centro." />
      <div className="values-grid"><div><IconShieldCheck size={23} /><span>01</span><h3>Confianza</h3><p>Información clara y trato personal durante todo el proceso.</p></div>
        <div><IconSearch size={23} /><span>02</span><h3>Estrategia</h3><p>Conocimiento del mercado para elegir con mejores herramientas.</p></div>
        <div><IconHome size={23} /><span>03</span><h3>Propósito</h3><p>Oportunidades alineadas con tu forma de vivir e invertir.</p></div></div></div></section>
  </main>;
}

function LeadForm({ owner = false }) {
  const [submitted, setSubmitted] = useState(false);
  function submit(event) { event.preventDefault(); setSubmitted(true); }
  if (submitted) return <div className="form-success"><span><IconCheck size={24} /></span><h3>Gracias por escribirnos.</h3><p>Un miembro del equipo mnü Realty se pondrá en contacto contigo a la brevedad.</p><button type="button" className="text-link" onClick={() => setSubmitted(false)}>Enviar otra consulta <IconArrowRight size={16} /></button></div>;
  return <form className="lead-form" onSubmit={submit}>
    <div className="form-row"><label>Tu nombre<input required name="name" placeholder="Nombre completo" /></label><label>Empresa <span className="optional">Opcional</span><input name="company" placeholder="Nombre de empresa" /></label></div>
    <div className="form-row"><label>Correo electrónico<input required type="email" name="email" placeholder="nombre@correo.com" /></label><label>Número de teléfono<input required type="tel" name="phone" placeholder="+52 614 000 0000" /></label></div>
    <label>{owner ? "Cuéntanos sobre tu propiedad" : "Mensaje"}<textarea required name="message" rows="5" placeholder={owner ? "Tipo de propiedad, ubicación y lo que te gustaría lograr…" : "¿Cómo podemos ayudarte?"} /></label>
    <div className="form-bottom"><p>Al enviar este formulario, autorizas a mnü Realty a contactarte para dar seguimiento a tu solicitud.</p><button className="button button-accent" type="submit">Enviar mensaje <IconSend size={16} /></button></div>
  </form>;
}

function ContactPage() {
  return <main className="contact-page"><section className="subpage-hero contact-hero"><div className="shell"><span className="eyebrow eyebrow-bright">Estamos para ayudarte</span><h1>Hablemos de tu<br /><em>siguiente paso.</em></h1><p>Llena este formulario y un miembro de nuestro equipo te contactará para darte una asesoría personalizada.</p></div></section>
    <section className="shell contact-layout"><div className="contact-details"><span className="eyebrow">Contacto directo</span><h2>Estamos cerca.</h2>
      <div className="contact-detail"><span><IconPhone size={19} /></span><div><small>Teléfono</small><a href={PHONE_LINK}>{PHONE}</a></div></div>
      <div className="contact-detail"><span><IconMail size={19} /></span><div><small>Correo electrónico</small><a href={"mailto:" + EMAIL}>{EMAIL}</a></div></div>
      <div className="contact-detail"><span><IconMapPin size={19} /></span><div><small>Visítanos</small><p>{ADDRESS}</p></div></div>
      <a className="map-link" href="https://maps.google.com/?q=Paseos+Vista+del+Sol+6801+Chihuahua" target="_blank" rel="noreferrer">Ver ubicación <IconArrowUpRight size={16} /></a>
      <div className="contact-social-label">Síguenos</div><div className="social-links">{SOCIALS.map(({ label, href, Icon }) => <a href={href} target="_blank" rel="noreferrer" aria-label={label} key={label}><Icon size={18} /></a>)}</div>
    </div><div className="contact-form-card"><span className="eyebrow">Envíanos un mensaje</span><h2>Cuéntanos qué necesitas.</h2><LeadForm /></div></section>
  </main>;
}

function OwnersPage() {
  return <main className="owners-page"><section className="subpage-hero owners-hero"><div className="shell"><span className="eyebrow eyebrow-bright">Para propietarios</span><h1>Tu propiedad merece<br /><em>una gran estrategia.</em></h1><p>Con nuestro equipo de profesionales te ayudamos a vender o arrendar tu casa en menos de 90 días y al mejor precio.</p></div></section>
    <section className="shell owners-layout"><div className="owners-copy"><span className="eyebrow">Publica con mnü Realty</span><h2>Más alcance. Mejor presentación. Acompañamiento real.</h2>
      <p>Si tienes una propiedad que deseas publicar con nosotros, completa el formulario con todos los datos y un experto se pondrá en contacto contigo.</p>
      <div className="owners-points"><div><span>01</span><p>Estrategias digitales para destacar tu propiedad.</p></div><div><span>02</span><p>Contenido profesional y difusión efectiva.</p></div><div><span>03</span><p>Asesoría cercana en cada etapa del proceso.</p></div></div><img src={TEAM} alt="Equipo mnü Realty" /></div>
      <div className="owners-form-card"><span className="eyebrow">Comienza aquí</span><h2>Cuéntanos de tu propiedad.</h2><LeadForm owner /></div></section>
  </main>;
}

function NotFound({ navigate }) {
  return <main className="not-found shell"><span className="eyebrow">Propiedad no encontrada</span><h1>Esta página ya no está disponible.</h1><p>Puede que la propiedad haya cambiado de estado. Explora el catálogo para encontrar otras opciones.</p><a className="button button-accent" href="/properties" onClick={(event) => { event.preventDefault(); navigate("/properties"); }}>Ver propiedades <IconArrowUpRight size={17} /></a></main>;
}

export function App() {
  const [route, setRoute] = useState(getRoute);
  const [, setLocationVersion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("mnu-favorites") || "[]"); } catch { return []; }
  });
  function navigate(target) {
    const fullTarget = toHref(target);
    window.history.pushState({}, "", fullTarget);
    setRoute(getRoute());
    setLocationVersion((value) => value + 1);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function toggleFavorite(path) {
    setFavorites((current) => {
      const updated = current.includes(path) ? current.filter((item) => item !== path) : [...current, path];
      window.localStorage.setItem("mnu-favorites", JSON.stringify(updated));
      return updated;
    });
  }
  useEffect(() => {
    const onPopState = () => { setRoute(getRoute()); setLocationVersion((value) => value + 1); setMobileOpen(false); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    document.title = route === "/" ? "mnü Realty | Encuentra tu propiedad ideal"
      : route.startsWith("/property/") ? "Propiedad | mnü Realty"
      : route === "/rentals" ? "Propiedades en renta | mnü Realty"
      : route === "/properties" ? "Propiedades en venta | mnü Realty"
      : "mnü Realty | Asesoría inmobiliaria";
  }, [route]);
  let page;
  if (route === "/") page = <HomePage navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} />;
  else if (route === "/properties") page = <ListingsPage key={route + window.location.search} mode="properties" navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} />;
  else if (route === "/rentals") page = <ListingsPage key={route + window.location.search} mode="rentals" navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} />;
  else if (route.startsWith("/property/")) page = <PropertyPage path={route} navigate={navigate} />;
  else if (route === "/about") page = <AboutPage navigate={navigate} />;
  else if (route === "/owners") page = <OwnersPage />;
  else if (route === "/contact") page = <ContactPage />;
  else page = <NotFound navigate={navigate} />;
  return <div className="app-shell"><Header route={route} navigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />{page}<Footer navigate={navigate} />
    <a className="whatsapp-float" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp"><IconBrandWhatsapp size={22} /></a></div>;
}
