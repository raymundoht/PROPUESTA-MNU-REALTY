/**
 * Escenas 3D del hero de inicio. Cada una es una maqueta de la propiedad destacada
 * real de su tipo (HERO_PICKS), modelada a partir de sus fotos publicadas:
 *
 * - casa:         Residencia moderna de 1 planta en Altozano (EB-WX2462)
 * - departamento: Departamento Nuevo · Torre Independencia (EB-XI3693)
 * - oficina:      Edificio en Renta · Zona Centro (EB-XH0344)
 * - terreno:      Venta de Terreno en Torralba (EB-WR0163)
 * - local:        Local comercial en renta, Parques de San Felipe (EB-WK0043)
 * - bodega:       Bodega a la Venta en Salida a Delicias (EB-VR1405)
 * - proyecto:     Casa en preventa · Fracc. Dominion (EB-VN2967)
 *
 * Las medidas son aproximadas (tomadas de las fotos). Todo se agrupa en InstancedMesh
 * por material para que cada escena cueste pocas llamadas de dibujo.
 */
import * as THREE from "three";
import type { PropertyType } from "@/lib/types";
import type { MatKey } from "./materials";

type GeoKey = "box" | "cyl" | "ico" | "cone";

export function createGeometries(): Record<GeoKey, THREE.BufferGeometry> {
  return {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
    ico: new THREE.IcosahedronGeometry(0.5, 1),
    cone: new THREE.ConeGeometry(0.5, 1, 7),
  };
}

const NO_SHADOW = new Set<MatKey>(["lamp", "water", "asphalt", "grass", "sidewalk", "dirt", "gravel"]);

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Kit {
  private buckets = new Map<string, { geo: GeoKey; mat: MatKey; m: THREE.Matrix4[] }>();
  private o = new THREE.Object3D();
  readonly rand: () => number;

  constructor(
    private geos: Record<GeoKey, THREE.BufferGeometry>,
    private mats: Record<MatKey, THREE.Material>,
    seed: number,
  ) {
    this.rand = rng(seed);
  }

  add(geo: GeoKey, mat: MatKey, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0, rx = 0, rz = 0) {
    const key = `${geo}:${mat}`;
    let b = this.buckets.get(key);
    if (!b) this.buckets.set(key, (b = { geo, mat, m: [] }));
    this.o.position.set(x, y, z);
    this.o.rotation.set(rx, ry, rz);
    this.o.scale.set(sx, sy, sz);
    this.o.updateMatrix();
    b.m.push(this.o.matrix.clone());
  }

  /** Caja apoyada en `y` (y = base). x/z son el centro. */
  box(mat: MatKey, x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) {
    this.add("box", mat, x, y + h / 2, z, w, h, d, ry);
  }

  /** Caja definida por sus límites: más cómodo para modelar a partir de planos. */
  span(mat: MatKey, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    this.add("box", mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0);
  }

  cyl(mat: MatKey, x: number, y: number, z: number, r: number, h: number) {
    this.add("cyl", mat, x, y + h / 2, z, r * 2, h, r * 2);
  }

  /** Ventana en una fachada que mira a +z (front) o -x/+x (side): marco oscuro y cristal. */
  windowZ(x: number, y: number, z: number, w: number, h: number, warm = false) {
    this.box("aluminum", x, y - 0.06, z, w + 0.12, h + 0.12, 0.1);
    this.box(warm ? "glassWarm" : "glass", x, y, z + 0.03, w, h, 0.06);
    for (let i = 1; i < Math.round(w / 1.4); i++) this.box("aluminum", x - w / 2 + (w / Math.round(w / 1.4)) * i, y, z + 0.07, 0.05, h, 0.04);
  }

  windowX(x: number, y: number, z: number, d: number, h: number, warm = false) {
    this.box("aluminum", x, y - 0.06, z, 0.1, h + 0.12, d + 0.12);
    this.box(warm ? "glassWarm" : "glass", x + 0.03, y, z, 0.06, h, d);
  }

  tree(x: number, z: number, s = 1) {
    this.cyl("trunk", x, 0, z, 0.15 * s, 2 * s);
    this.add("ico", "tree", x, 3.2 * s, z, 3.2 * s, 3 * s, 3.2 * s, this.rand() * 6);
    this.add("ico", "tree", x + 0.7 * s, 4.1 * s, z - 0.3 * s, 2.2 * s, 2.1 * s, 2.2 * s, this.rand() * 6);
  }

  palm(x: number, z: number, h = 7) {
    this.cyl("trunk", x, 0, z, 0.2, h);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + this.rand();
      this.add("box", "palm", x + Math.sin(a) * 1.3, h - 0.3, z + Math.cos(a) * 1.3, 0.5, 0.06, 3, a, -0.45, 0);
    }
  }

  shrub(x: number, z: number, s = 1, mat: MatKey = "shrub") {
    this.add("ico", mat, x, 0.35 * s, z, 1.2 * s, 0.8 * s, 1.2 * s, this.rand() * 6);
  }

  yucca(x: number, z: number) {
    this.cyl("trunk", x, 0, z, 0.12, 1.4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      this.add("box", "palm", x + Math.sin(a) * 0.35, 1.7, z + Math.cos(a) * 0.35, 0.12, 0.04, 1, a, -0.9, 0);
    }
  }

  car(x: number, z: number, mat: MatKey, ry = 0) {
    const c = Math.cos(ry), s = Math.sin(ry);
    const at = (dx: number, dz: number): [number, number] => [x + dx * c + dz * s, z - dx * s + dz * c];
    this.box(mat, x, 0.3, z, 1.85, 0.75, 4.4, ry);
    const [cx, cz] = at(0, -0.3);
    this.box("glass", cx, 1.05, cz, 1.65, 0.62, 2.3, ry);
    for (const [dx, dz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) {
      const [wx, wz] = at(dx, dz);
      this.add("cyl", "tire", wx, 0.34, wz, 0.66, 0.24, 0.66, ry, 0, Math.PI / 2);
    }
  }

  /** Calle frente al predio (a lo largo del eje x), con banqueta y guarnición. */
  street(z: number, len = 160, curb: MatKey = "concrete") {
    this.box("sidewalk", 0, 0, z, len, 0.16, 2.6);
    this.box(curb, 0, 0, z + 1.35, len, 0.18, 0.2);
    this.box("asphalt", 0, 0, z + 6, len, 0.04, 9.4);
  }

  /** Casa vecina sencilla de 2 niveles. */
  neighbor(x: number, z: number, w: number, d: number, mat: MatKey = "stucco") {
    this.box(mat, x, 0, z, w, 6.2, d);
    this.box("charcoal", x, 6.2, z, w + 0.1, 0.35, d + 0.1);
    this.windowZ(x - w / 4, 3.6, z + d / 2 + 0.05, w / 3, 1.6);
    this.windowZ(x + w / 5, 0.6, z + d / 2 + 0.05, w / 3.5, 2.1);
  }

  build(): THREE.Group {
    const g = new THREE.Group();
    for (const { geo, mat, m } of this.buckets.values()) {
      const mesh = new THREE.InstancedMesh(this.geos[geo], this.mats[mat], m.length);
      m.forEach((mx, i) => mesh.setMatrixAt(i, mx));
      mesh.castShadow = !NO_SHADOW.has(mat);
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      g.add(mesh);
    }
    return g;
  }
}

export interface SceneDef {
  group: THREE.Group;
  /** Punto que mira la cámara. */
  target: THREE.Vector3;
  radius: number;
  height: number;
  /** Ángulo base de la órbita (radianes) y cuánto oscila a cada lado. */
  angle: number;
  sweep: number;
  /** Medio ancho del área que recibe sombras. */
  extent: number;
}

type Builder = (k: Kit) => Omit<SceneDef, "group">;

/** Casa de 1 planta, 14 × 20 m: volumen blanco, celosía de madera, cochera doble bajo volado. */
const casa: Builder = (k) => {
  k.street(13);
  k.span("grass", -30, 30, -0.02, 0.02, -40, 11.7);
  k.span("concrete", 1, 7.5, 0, 0.12, 2.5, 11.7); // acceso vehicular
  k.span("sidewalk", -4.5, 0.5, 0, 0.14, 7, 11.7); // andador
  // Plataforma del vestíbulo elevado
  k.span("concrete", -7.2, 0.8, 0, 0.55, -10, 7.2);
  // Volumen principal (sala, recámaras)
  k.span("stucco", -7, 0.6, 0.55, 4.5, -10, 6.5);
  k.span("wood", -5.6, -2, 0.55, 4.5, 6.5, 6.62); // revestimiento de madera
  k.span("wood", -1.2, -0.2, 0.55, 2.9, 6.5, 6.66); // puerta peatonal
  k.box("glass", 0.1, 0.65, 6.6, 0.55, 3.4, 0.06); // vano vertical angosto
  k.windowX(-7.03, 1.0, -3, 5, 2.4);
  // Cochera doble: muro de fondo y gran volado blanco con luminarias
  k.span("stucco", 0.6, 7, 0, 4.5, -10, 0.5);
  k.span("charcoal", 0.6, 7, 0, 2.6, 0.5, 0.6);
  k.span("stucco", 0.4, 7.6, 3.7, 4.5, 0.5, 8.4);
  k.span("stucco", 7, 7.6, 0, 3.7, 0.5, 1.6); // muro lateral de la cochera
  for (const x of [2.3, 5.2]) k.box("lamp", x, 3.66, 6.5, 0.35, 0.04, 0.35);
  k.car(2.6, 4.4, "carWhite");
  // Pretiles y remates gris carbón
  k.span("charcoal", -7.15, 0.75, 4.5, 4.8, -10.15, 6.7);
  k.span("charcoal", 0.25, 7.75, 4.5, 4.75, -10.15, 8.55);
  // Jardineras, yuca y palmera
  k.span("concrete", -6.8, -3.2, 0, 0.6, 8, 9.2);
  k.shrub(-5.8, 8.6, 0.8, "tree");
  k.shrub(-4.2, 8.6, 0.7, "tree");
  k.yucca(-2.4, 9);
  k.palm(-8.6, 9.6, 6.5);
  // Bardas laterales y vecinos
  k.span("stucco", -9, -8.7, 0, 2.6, -14, 8);
  k.span("stucco", 8.7, 9, 0, 2.6, -14, 8);
  k.neighbor(-17, -2, 12, 16);
  k.neighbor(17.5, -3, 12, 16, "beige");
  k.tree(-3, -16, 1.3);
  k.tree(6, -17, 1.1);
  return { target: new THREE.Vector3(0, 2.2, 3), radius: 27, height: 2.6, angle: 0.42, sweep: 0.3, extent: 30 };
};

/** Edificio de 3 niveles, 24 × 26 m: basamento beige con portal, prismas blancos escalonados y núcleo oscuro. */
const departamento: Builder = (k) => {
  k.street(15.5);
  k.span("grass", -40, 40, -0.02, 0.02, -40, 14.2);
  // Planta baja: estacionamiento en basamento beige con gran portal
  k.span("beige", -12, 12, 0, 3.2, -13, 13);
  k.span("black", -4, 4, 0, 2.7, 12.95, 13.05);
  k.span("concrete", -4, 4, 0, 0.1, 13, 14.2);
  // Nivel 1: dos prismas blancos
  k.span("stucco", -12, 0.5, 3.2, 6.4, -12, 11.5);
  k.span("stucco", 1.5, 12, 3.2, 6.4, -13, 9.5);
  // Nivel 2: prismas escalonados (retranqueados)
  k.span("stucco", -12, -1.5, 6.4, 9.6, -10, 12.5);
  k.span("stucco", 2.5, 12, 6.4, 9.6, -13, 7);
  // Núcleo vertical antracita
  k.span("charcoal", -1.5, 2.5, 0, 11.2, -6, 4);
  // Pretiles
  k.span("stucco", -12.1, -1.4, 9.6, 10.2, -10.1, 12.6);
  k.span("stucco", 2.4, 12.1, 9.6, 10.2, -13.1, 7.1);
  // Ventanas de piso a techo y balcones con barandal negro
  for (const x of [-9.5, -5.5, -2]) k.windowZ(x, 3.6, 11.55, 2.4, 2.5, x === -5.5);
  for (const x of [4.5, 9]) k.windowZ(x, 3.6, 9.55, 3, 2.5);
  for (const x of [-9, -4.5]) k.windowZ(x, 6.8, 12.55, 3, 2.5);
  for (const x of [5, 9.5]) k.windowZ(x, 6.8, 7.05, 3, 2.5, x === 9.5);
  k.span("stucco", -12, 0.5, 3.1, 3.3, 11.5, 13.3); // losa de balcón
  k.span("black", -12, 0.5, 3.3, 4.35, 13.25, 13.3);
  k.span("black", 2.5, 12, 6.4, 7.45, 9.45, 9.5); // barandal de terraza
  k.windowX(12.05, 3.7, -4, 6, 2.2);
  k.windowX(12.05, 6.9, -6, 6, 2.2);
  k.palm(9, 14.4, 8);
  k.tree(-20, -18, 1.5);
  k.tree(-6, -20, 1.4);
  k.tree(10, -21, 1.6);
  k.neighbor(-25, -1, 12, 18);
  k.neighbor(25, -2, 12, 18, "beige");
  return { target: new THREE.Vector3(0, 4.5, 2), radius: 46, height: 5, angle: 0.5, sweep: 0.3, extent: 38 };
};

/** Oficinas de 2 niveles al frente (30 m) unidas a una nave de 9 m detrás. */
const oficina: Builder = (k) => {
  k.street(13, 180, "yellow");
  k.span("concrete", -40, 40, -0.02, 0.02, -50, 11.7);
  // Nave
  k.span("stucco", -15, 15, 0, 9, -32, 2);
  k.span("grey", -15.05, 15.05, 0, 1, -32.05, 2);
  k.span("metalRoof", -15.2, 15.2, 9, 9.25, -32.2, 2.2);
  k.span("stucco", -15.2, 15.2, 9.25, 9.8, -32.2, -31.9);
  // Bloque de oficinas
  k.span("stucco", -15, 15, 0, 7, 2, 10);
  k.span("grey", -15.05, 15.05, 0, 1.2, 2, 10.05);
  k.span("stucco", -15.1, 15.1, 7, 7.6, 1.9, 10.1); // pretil
  k.windowZ(-4, 4.7, 10.04, 10, 0.9); // ventanal horizontal superior
  for (const x of [-11, -8, 4, 7]) k.windowZ(x, 2, 10.04, 1.4, 1.2);
  k.span("metalWall", -2, 1, 1.2, 3.6, 10.02, 10.1); // puerta metálica
  k.span("metalWall", 10, 14, 0, 4.2, 10.02, 10.1); // portón de servicio
  k.windowZ(12, 4.9, 10.04, 3, 0.9);
  k.windowX(15.05, 4.6, 6, 5, 0.9);
  // Calle: autos, contenedores, postes con cableado
  k.car(-8, 14.5, "carGrey", Math.PI / 2);
  k.car(6, 14.5, "carRed", Math.PI / 2);
  k.span("black", 16.5, 18.5, 0, 1.4, 6, 9); // contenedor
  k.span("carBlue", 19, 21, 0, 1.4, 6, 9);
  for (const x of [-22, 4, 30]) {
    k.cyl("concrete", x, 0, 12.2, 0.18, 10);
    k.box("black", x, 9.4, 12.2, 2.2, 0.12, 0.12);
  }
  k.span("black", -22, 30, 9.3, 9.33, 12.15, 12.18);
  k.span("black", -22, 30, 9.0, 9.03, 12.3, 12.33);
  k.neighbor(-23, 0, 14, 20, "beige");
  k.neighbor(23, -2, 14, 20, "grey");
  return { target: new THREE.Vector3(0, 4, 0), radius: 52, height: 7, angle: -0.42, sweep: 0.3, extent: 45 };
};

/** Lote de 18 × 28 m de tierra y grava, con bardas de block y sierra árida al fondo. */
const terreno: Builder = (k) => {
  k.street(16);
  k.span("dirt", -40, 40, -0.02, 0.02, -60, 14.7);
  // El lote (con ligera pendiente hacia la calle)
  k.add("box", "dirt", 0, 0.2, 0, 18, 0.4, 28, 0, 0.012, 0);
  for (let i = 0; i < 18; i++) k.box("gravel", (k.rand() - 0.5) * 15, 0.36, (k.rand() - 0.5) * 24, 1 + k.rand() * 2.5, 0.08, 1 + k.rand() * 2);
  for (let i = 0; i < 26; i++) k.shrub((k.rand() - 0.5) * 16, (k.rand() - 0.5) * 26, 0.35 + k.rand() * 0.4);
  // Bardas de block de 2 m al fondo y a los lados
  k.span("block", -9.2, 9.2, 0, 2.1, -14.2, -14);
  k.span("block", -9.2, -9, 0, 2.1, -14, 13);
  k.span("block", 9, 9.2, 0, 2.1, -14, 13);
  // Alumbrado y espejo vial
  for (const x of [-12, 14]) {
    k.cyl("black", x, 0, 14.4, 0.09, 7.5);
    k.box("black", x, 7.4, 13.6, 0.18, 0.14, 1.6);
    k.box("lamp", x, 7.32, 13.1, 0.3, 0.05, 0.5);
  }
  k.cyl("black", 8.5, 0, 14.6, 0.05, 2.6);
  k.add("cyl", "aluminum", 8.5, 2.75, 14.6, 0.7, 0.08, 0.7, 0, Math.PI / 2, 0);
  // Casas contemporáneas vecinas de 2 niveles
  k.neighbor(-17, -4, 13, 18);
  k.neighbor(17, -4, 13, 18, "beige");
  k.neighbor(-4, -26, 16, 12, "grey");
  // Sierra árida
  for (let i = 0; i < 9; i++) {
    const s = 80 + k.rand() * 110;
    k.add("cone", "mountain", -360 + i * 90 + k.rand() * 40, (s * 0.42) / 2, -280 - k.rand() * 90, s * 1.7, s * 0.42, s, k.rand() * 3);
  }
  return { target: new THREE.Vector3(0, 0.8, -1), radius: 44, height: 17, angle: 0.18, sweep: 0.22, extent: 40 };
};

/** Local de 1 nivel, 8 × 16 m: aplanado blanco con franja y marcos rojo anaranjado, cortina metálica y escaparate. */
const local: Builder = (k) => {
  k.street(10.5);
  k.span("sidewalk", -20, 20, 0, 0.15, 8, 9.2);
  k.span("concrete", -20, 20, -0.02, 0.02, -30, 8);
  k.span("stucco", -4, 4, 0, 3.8, -8, 8);
  k.span("stucco", -4.05, 4.05, 3.8, 4.25, -8.05, 8.05); // pretil bajo
  k.span("red", -4.05, 4.05, 0, 0.55, 8, 8.06); // franja inferior
  k.span("red", -4.05, 4.05, 2.95, 3.25, 8, 8.07); // dintel
  k.span("red", -0.2, 0.2, 0.55, 2.95, 8, 8.07); // marco central
  k.span("shutter", -3.75, -0.25, 0.3, 2.9, 7.95, 8.04); // cortina metálica
  k.span("aluminum", 0.3, 3.7, 0.3, 2.95, 7.96, 8.02);
  k.span("glass", 0.4, 3.6, 0.35, 2.9, 8.02, 8.05); // escaparate
  k.span("aluminum", 1.95, 2.05, 0.35, 2.9, 8.04, 8.08);
  // Construcciones bajas colindantes
  k.span("beige", -12, -4.05, 0, 3.4, -8, 7.6);
  k.span("charcoal", -12, -4.05, 3.4, 3.7, -8, 7.6);
  k.span("shutter", -10.5, -6, 0.2, 2.8, 7.6, 7.66);
  k.span("stucco", 4.05, 13, 0, 4.4, -8, 7.8);
  k.windowZ(8.5, 1, 7.82, 3.5, 2);
  k.span("yellow", 4.05, 13, 0, 0.5, 7.8, 7.86);
  // Árbol, postes y cables aéreos
  k.tree(-8.5, 9.8, 1.1);
  for (const x of [-16, 11]) k.cyl("concrete", x, 0, 9.9, 0.16, 8.5);
  k.span("black", -16, 11, 8.1, 8.13, 9.85, 9.88);
  k.span("black", -16, 11, 7.8, 7.83, 9.95, 9.98);
  k.add("box", "black", -2.5, 7.9, 9, 0.03, 0.03, 2.3, 0, 0.45, 0);
  k.car(10, 13.5, "carGrey", Math.PI / 2);
  return { target: new THREE.Vector3(0, 2, 4), radius: 27, height: 2.6, angle: 0.3, sweep: 0.28, extent: 26 };
};

/** Bodega de ~65 × 45 m: naves adosadas a dos aguas con tragaluces, anexos de oficinas y patio cercado. */
const bodega: Builder = (k) => {
  k.street(34, 260);
  k.span("dirt", -130, 130, -0.02, 0.02, -130, 32.7);
  k.span("concrete", -38, 38, 0, 0.06, -30, 31); // patio
  const naves = [
    { x0: -32, x1: -10 },
    { x0: -10, x1: 12 },
    { x0: 12, x1: 32 },
  ];
  const z0 = -24, z1 = 14;
  for (const { x0, x1 } of naves) {
    const w = x1 - x0, cx = (x0 + x1) / 2;
    k.span("metalWall", x0, x1, 0, 7, z0, z1);
    k.span("grey", x0 - 0.02, x1 + 0.02, 0, 1, z0 - 0.02, z1 + 0.02);
    // Hastial (triángulo aproximado con capas) y cubierta a dos aguas
    for (let i = 0; i < 4; i++) k.span("metalWall", cx - (w / 2) * (1 - i / 4), cx + (w / 2) * (1 - i / 4), 7 + i * 0.5, 7.5 + i * 0.5, z1 - 0.3, z1);
    const slope = Math.atan2(2, w / 2);
    const len = Math.hypot(w / 2, 2) + 0.4;
    k.add("box", "metalRoof", cx - w / 4, 8, (z0 + z1) / 2, len, 0.16, z1 - z0 + 1, 0, 0, slope);
    k.add("box", "metalRoof", cx + w / 4, 8, (z0 + z1) / 2, len, 0.16, z1 - z0 + 1, 0, 0, -slope);
    // Franjas de tragaluz sobre cada faldón
    k.add("box", "glass", cx - w / 4, 8.12, (z0 + z1) / 2, 1.4, 0.05, z1 - z0 - 2, 0, 0, slope);
    k.add("box", "glass", cx + w / 4, 8.12, (z0 + z1) / 2, 1.4, 0.05, z1 - z0 - 2, 0, 0, -slope);
    k.span("grey", cx - 2.2, cx + 2.2, 0, 5, z1, z1 + 0.08); // portón de carga
  }
  // Anexos bajos de oficinas al frente y a un costado
  k.span("stucco", -32, -16, 0, 3.6, 14, 20);
  k.span("charcoal", -32.1, -15.9, 3.6, 3.9, 13.9, 20.1);
  for (const x of [-29, -25, -21]) k.windowZ(x, 1.1, 20.04, 2.2, 1.3);
  k.span("stucco", 32, 37, 0, 4, -20, 6);
  k.span("charcoal", 31.9, 37.1, 4, 4.3, -20.1, 6.1);
  // Barda perimetral, caseta y portón
  k.span("block", -38, 38, 0, 2.4, -30.2, -30);
  k.span("block", -38.2, -38, 0, 2.4, -30, 31);
  k.span("block", 38, 38.2, 0, 2.4, -30, 31);
  k.span("block", -38, 8, 0, 2.4, 31, 31.2);
  k.span("block", 18, 38, 0, 2.4, 31, 31.2);
  k.span("shutter", 8, 18, 0, 2.2, 31.05, 31.12);
  k.span("stucco", 19, 22, 0, 2.8, 27, 30);
  k.windowZ(20.5, 1.1, 30.04, 1.8, 1);
  // Remolques, autos y palmeras
  for (const [x, z] of [[-4, 24], [2, 24]]) {
    k.box("carWhite", x, 1.2, z, 2.6, 3.4, 13, 0);
  }
  k.car(-26, 26, "carGrey");
  k.car(-22, 26, "carRed");
  k.car(-18, 26, "carWhite");
  for (const x of [-34, -12, 24, 34]) k.palm(x, 33.6, 9);
  for (let i = 0; i < 40; i++) {
    const x = (k.rand() - 0.5) * 200, z = (k.rand() - 0.5) * 200;
    if (Math.abs(x) < 42 && z > -34 && z < 44) continue;
    k.shrub(x, z, 0.6 + k.rand() * 0.6);
  }
  return { target: new THREE.Vector3(0, 3, 2), radius: 92, height: 48, angle: 0.5, sweep: 0.28, extent: 70 };
};

/** Casa en preventa (render), 16 × 27 m: tres niveles escalonados, caja superior en volado, alberca atrás. */
const proyecto: Builder = (k) => {
  k.span("grass", -35, 35, -0.02, 0.02, -40, 16);
  k.span("concrete", -8, 8, 0, 0.1, 10, 16); // rampa / acceso
  // Semisótano: cochera doble y basamento de piedra clara
  k.span("marble", -8, 8, 0, 2.6, -13, 10);
  k.span("black", 0.5, 7, 0, 2.3, 9.95, 10.05);
  k.span("stone", -8, 0.2, 0, 2.6, 10, 10.15);
  // Nivel 1: volumen gris con correderas de piso a techo
  k.span("grey", -8, 4, 2.6, 5.9, -13, 7.5);
  k.windowZ(-4.5, 2.75, 7.55, 6, 2.9);
  k.span("wood", 0.2, 4, 2.6, 5.9, 7.5, 7.62);
  k.span("glass", -8, 4, 2.6, 3.65, 9.9, 9.95); // barandal de vidrio sobre la cochera
  // Nivel 2: caja blanca en volado hacia el frente
  k.span("stucco", -5, 8, 5.9, 9.4, -10, 11);
  k.span("stucco", -5.1, 8.1, 9.4, 9.9, -10.1, 11.1);
  k.windowZ(1.2, 6.25, 11.03, 7.5, 2.7);
  k.span("wood", -5, -2.2, 5.9, 9.4, 11, 11.1);
  // Celosía / pérgola oscura lateral
  for (let i = 0; i < 12; i++) k.span("black", 8.05, 8.2, 6, 9.3, -9 + i * 0.8, -8.8 + i * 0.8);
  k.windowX(8.06, 3, -4, 6, 2.6);
  // Patio posterior: alberca, terraza, pérgola, cocina exterior
  k.span("marble", -8, 8, 0, 0.18, -26, -13);
  k.span("water", -6, 4, 0, 0.2, -23.5, -17.5);
  k.span("wood", 4.5, 7.8, 0.18, 0.28, -24, -15);
  for (let i = 0; i < 8; i++) k.span("black", -7.8 + i * 0.9, -7.6 + i * 0.9, 3.1, 3.3, -16, -13);
  k.span("black", -8, -7.8, 0.18, 3.3, -16.2, -16);
  k.span("charcoal", 5, 7.8, 0.18, 1.1, -13, -12);
  // Muros perimetrales y paisaje
  k.span("stucco", -8.6, -8.3, 0, 2.4, -27, 10);
  k.span("stucco", 8.3, 8.6, 0, 2.4, -27, -10);
  k.span("stucco", -8.6, 8.6, 0, 2.4, -27.3, -27);
  k.tree(-12, 6, 1.2);
  k.tree(12, -4, 1.4);
  k.yucca(-6.5, 12.5);
  k.shrub(-4, 12.8, 0.9, "tree");
  k.shrub(-2, 12.8, 0.8, "tree");
  return { target: new THREE.Vector3(0, 4.5, 2), radius: 40, height: 4, angle: 0.48, sweep: 0.32, extent: 34 };
};

const builders: Record<PropertyType, Builder> = { casa, departamento, oficina, terreno, local, bodega, proyecto };

export function buildScene(
  type: PropertyType,
  geos: Record<GeoKey, THREE.BufferGeometry>,
  mats: Record<MatKey, THREE.Material>,
): SceneDef {
  const kit = new Kit(geos, mats, type.length * 7919 + type.charCodeAt(0));
  const def = builders[type](kit);
  return { group: kit.build(), ...def };
}
