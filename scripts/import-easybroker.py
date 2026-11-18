#!/usr/bin/env python3
"""
Convierte el inventario de MNU Realty exportado de EasyBroker (repo PROPUESTA-MNU-REALTY,
carpeta src/data) al formato de Property que usa este sitio.

Uso:
    python3 -I scripts/import-easybroker.py <ruta a PROPUESTA-MNU-REALTY/src/data>

Escribe src/lib/inventory.json. Las fotos siguen alojadas en el CDN de EasyBroker.
"""
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "lib" / "inventory.json"

# Centro aproximado de cada ciudad. EasyBroker no publica coordenadas y todas las
# propiedades marcan ubicación aproximada, así que el sitio muestra la colonia.
CITY_COORDS = {
    "Chihuahua": (28.6353, -106.0889),
    "Delicias": (28.1906, -105.4709),
    "Aldama": (28.8389, -105.9117),
    "Cuauhtémoc": (28.4053, -106.8667),
    "Santa Isabel": (28.3833, -106.35),
    "Mazatlán": (23.2494, -106.4111),
    "Playa del Carmen": (20.6296, -87.0739),
}

TYPE_MAP = {
    "Casa": "casa",
    "Departamento": "departamento",
    "Oficina": "oficina",
    "Edificio": "oficina",
    "Terreno": "terreno",
    "Terreno comercial": "terreno",
    "Local": "local",
    "Local comercial": "local",
    "Bodega industrial": "bodega",
    "Nave industrial": "bodega",
}

SMALL = {"de", "del", "en", "la", "las", "el", "los", "y", "con", "a", "al", "para", "por", "o", "e", "un", "una", "sin"}
KEEP_UPPER = {"II", "III", "IV", "CDMX", "USD", "MXN"}


def strip_symbols(s: str) -> str:
    """Quita emojis y símbolos decorativos, conserva letras, números y puntuación común."""
    out = []
    for ch in s:
        cat = unicodedata.category(ch)
        if cat.startswith(("L", "N", "Z")) or ch in "|/-.,:#()&'\"+":
            out.append(ch)
        else:
            out.append(" ")
    return re.sub(r"\s+", " ", "".join(out)).strip(" |-,.")


def clean_title(raw: str) -> str:
    # NFKC convierte las letras "decorativas" (𝑪𝑨𝑺𝑨, 𝐎𝐟𝐢𝐜𝐢𝐧𝐚) a letras normales.
    s = strip_symbols(unicodedata.normalize("NFKC", raw)).replace(" | ", " · ").replace("|", " · ")
    letters = [c for c in s if c.isalpha()]
    shouty = letters and sum(c.isupper() for c in letters) / len(letters) > 0.6
    s = re.sub(r"\s+", " ", s).strip()
    if not shouty:
        return s[:1].upper() + s[1:]
    words = []
    for i, w in enumerate(s.split(" ")):
        lw = w.lower()
        if w in KEEP_UPPER:
            words.append(w)
        elif i > 0 and lw in SMALL:
            words.append(lw)
        else:
            words.append(lw[:1].upper() + lw[1:])
    return " ".join(words)


def to_int(s):
    if s is None:
        return None
    m = re.search(r"\d[\d,]*(?:\.\d+)?", s)
    if not m:
        return None
    return int(float(m.group(0).replace(",", "")))


def parse_details(text: str) -> dict:
    d = {}
    for line in text.split("\n")[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            d[k.strip()] = v.strip()
    return d


def lines_after_header(text: str) -> list[str]:
    return [l.strip() for l in (text or "").split("\n")[1:] if l.strip()]


def full_image(url: str) -> str:
    """Quita el recorte de miniatura (height/width) para pedir la foto completa."""
    parts = urlsplit(url)
    q = {k: v[0] for k, v in parse_qs(parts.query).items() if k not in ("height", "width", "s")}
    return urlunsplit(parts._replace(query=urlencode(q)))


def published(url: str) -> str:
    m = re.search(r"version=(\d+)", url or "")
    if not m:
        return "2026-01-01"
    return datetime.fromtimestamp(int(m.group(1)), tz=timezone.utc).date().isoformat()


def area(pattern: str, text: str):
    m = re.search(pattern + r"[^\d\n]{0,25}(\d[\d,]*(?:\.\d+)?)\s*m", text, re.I)
    return to_int(m.group(1)) if m else None


def convert(item: dict) -> dict:
    card = item["card"]
    details = parse_details(item["details"])
    kind = details.get("Tipo") or card["location"].split(" en ")[0]
    op_raw = card.get("operation_type", "")
    ptype = "proyecto" if "Preventa" in op_raw else TYPE_MAP.get(kind, "casa")
    operation = "renta" if "Renta" in op_raw else "venta"

    loc = [p.strip() for p in item["location"].split(",")]
    state, city = loc[-1], loc[-2]
    colonia = ", ".join(loc[:-2]) or city
    lat, lng = CITY_COORDS.get(city, CITY_COORDS["Chihuahua"])

    price_raw = card.get("price") or ""
    unit = "m2" if "por m²" in price_raw else "ha" if "por ha" in price_raw else None

    desc = item.get("description") or ""
    desc = re.sub(r"^Descripción\s*", "", desc).strip()

    size = to_int(card.get("size"))
    land = area(r"terreno", desc)
    built = area(r"construcci[oó]n", desc)
    if ptype == "terreno":
        land = land or size
        built = None
    else:
        built = built or size

    images = [g["src"] for g in item.get("gallery") or [] if g.get("src")]
    if not images and card.get("image"):
        images = [full_image(card["image"])]

    amenities = [a for a in lines_after_header(item.get("characteristics")) if len(a) < 40]

    prop = {
        "id": card["code"],
        "slug": item["path"].rstrip("/").split("/")[-1],
        "title": clean_title(item["title"]),
        "description": desc,
        "operation": operation,
        "type": ptype,
        "status": "disponible",
        "price": to_int(price_raw) or 0,
        "currency": "USD" if "USD" in price_raw else "MXN",
        "state": state,
        "city": city,
        "colonia": colonia,
        "address": colonia,
        "lat": lat,
        "lng": lng,
        "showExactLocation": False,
        "bedrooms": to_int(details.get("Recámaras")) if details.get("Recámaras") else card.get("bedrooms"),
        "bathrooms": to_int(details.get("Baños")) if details.get("Baños") else card.get("bathrooms"),
        "parking": None,
        "constructionM2": built,
        "landM2": land,
        "amenities": amenities,
        "images": images,
        "featured": False,
        "publishedAt": published(images[0] if images else ""),
    }
    if unit:
        prop["priceUnit"] = unit
    if operation == "renta":
        prop["rentPeriod"] = "mes"
    return prop


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    items = json.loads((src / "mnu-property-details.json").read_text())
    props = [convert(i) for i in items if not i.get("missing")]
    props.sort(key=lambda p: p["publishedAt"], reverse=True)
    # Destacadas: las más recientes con galería completa, una por tipo y luego las que sigan.
    featured, seen = [], set()
    for p in props:
        if len(p["images"]) >= 5 and p["price"] and p["type"] not in seen:
            featured.append(p)
            seen.add(p["type"])
    for p in props:
        if len(featured) >= 6:
            break
        if len(p["images"]) >= 5 and p["price"] and p not in featured:
            featured.append(p)
    for p in featured[:6]:
        p["featured"] = True
    OUT.write_text(json.dumps(props, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(props)} propiedades -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
