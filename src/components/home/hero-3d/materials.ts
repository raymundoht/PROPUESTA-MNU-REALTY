/**
 * Materiales "realistas" sin descargar texturas: se dibujan en un canvas al vuelo
 * (aplanado, concreto, madera, piedra, lámina, asfalto, pasto, grava, block) y se
 * proyectan en coordenadas de mundo (triplanar), así no se estiran en cajas escaladas.
 */
import * as THREE from "three";

type Draw = (ctx: CanvasRenderingContext2D, s: number, r: () => number) => void;

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function canvasTexture(draw: Draw, seed: number, size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const grey = (v: number, a = 1) => `rgba(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)},${a})`;

function speckle(ctx: CanvasRenderingContext2D, s: number, r: () => number, n: number, size: number, lo: number, hi: number, a: number) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = grey(lo + r() * (hi - lo), a);
    const d = size * (0.5 + r());
    ctx.fillRect(r() * s, r() * s, d, d);
  }
}

function blotches(ctx: CanvasRenderingContext2D, s: number, r: () => number, n: number, a: number) {
  for (let i = 0; i < n; i++) {
    const x = r() * s, y = r() * s, rad = 20 + r() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, grey(r() > 0.5 ? 0.7 : 1, a));
    g.addColorStop(1, grey(1, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

const textures = {
  stucco: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.96);
      c.fillRect(0, 0, s, s);
      blotches(c, s, r, 40, 0.05);
      speckle(c, s, r, 9000, 1.2, 0.8, 1, 0.12);
    }, seed),
  concrete: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.9);
      c.fillRect(0, 0, s, s);
      blotches(c, s, r, 70, 0.1);
      speckle(c, s, r, 12000, 1.4, 0.6, 1, 0.16);
      c.strokeStyle = grey(0.7, 0.25);
      for (let y = 0; y < s; y += s / 4) c.strokeRect(0, y, s, s / 4);
    }, seed),
  wood: (seed: number) =>
    canvasTexture((c, s, r) => {
      const ph = s / 16;
      for (let i = 0; i < 16; i++) {
        c.fillStyle = grey(0.78 + r() * 0.22);
        c.fillRect(0, i * ph, s, ph);
        for (let k = 0; k < 7; k++) {
          c.strokeStyle = grey(0.55 + r() * 0.2, 0.35);
          c.lineWidth = 1 + r();
          c.beginPath();
          const y = i * ph + r() * ph;
          c.moveTo(0, y);
          for (let x = 0; x <= s; x += 32) c.lineTo(x, y + (r() - 0.5) * 3);
          c.stroke();
        }
        c.fillStyle = grey(0.35, 0.8);
        c.fillRect(0, i * ph, s, 2);
      }
    }, seed),
  stone: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.55);
      c.fillRect(0, 0, s, s);
      const rh = s / 8;
      for (let row = 0; row < 8; row++) {
        let x = -r() * 60;
        while (x < s) {
          const w = 50 + r() * 90;
          c.fillStyle = grey(0.72 + r() * 0.28);
          c.fillRect(x + 3, row * rh + 3, w - 6, rh - 6);
          x += w;
        }
      }
      speckle(c, s, r, 6000, 1.5, 0.5, 1, 0.15);
    }, seed),
  metal: (seed: number) =>
    canvasTexture((c, s, r) => {
      for (let x = 0; x < s; x++) {
        const v = 0.82 + 0.18 * Math.abs(Math.sin((x / 16) * Math.PI));
        c.fillStyle = grey(v);
        c.fillRect(x, 0, 1, s);
      }
      blotches(c, s, r, 25, 0.06);
    }, seed),
  asphalt: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.85);
      c.fillRect(0, 0, s, s);
      blotches(c, s, r, 50, 0.12);
      speckle(c, s, r, 20000, 1.3, 0.5, 1, 0.3);
    }, seed),
  grass: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.85);
      c.fillRect(0, 0, s, s);
      blotches(c, s, r, 80, 0.15);
      speckle(c, s, r, 26000, 1.6, 0.55, 1, 0.35);
    }, seed),
  gravel: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.82);
      c.fillRect(0, 0, s, s);
      blotches(c, s, r, 60, 0.15);
      speckle(c, s, r, 9000, 3, 0.55, 1, 0.45);
    }, seed),
  block: (seed: number) =>
    canvasTexture((c, s, r) => {
      c.fillStyle = grey(0.62);
      c.fillRect(0, 0, s, s);
      const bw = s / 4, bh = s / 8;
      for (let row = 0; row < 8; row++)
        for (let i = -1; i < 5; i++) {
          c.fillStyle = grey(0.85 + r() * 0.15);
          c.fillRect(i * bw + (row % 2) * (bw / 2) + 2, row * bh + 2, bw - 4, bh - 4);
        }
      speckle(c, s, r, 7000, 1.3, 0.6, 1, 0.15);
    }, seed),
};
export type TexKey = keyof typeof textures;

/** Proyección triplanar en espacio de mundo (funciona con InstancedMesh). */
function triplanar(mat: THREE.MeshStandardMaterial, tex: THREE.Texture, scale: number, key: string) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tTri = { value: tex };
    sh.uniforms.triScale = { value: scale };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNormal;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vec4 triWorld = vec4(transformed, 1.0);
        vec3 triN = objectNormal;
        #ifdef USE_INSTANCING
          triWorld = instanceMatrix * triWorld;
          triN = mat3(instanceMatrix) * triN;
        #endif
        vTriPos = (modelMatrix * triWorld).xyz;
        vTriNormal = normalize(mat3(modelMatrix) * triN);`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D tTri;\nuniform float triScale;\nvarying vec3 vTriPos;\nvarying vec3 vTriNormal;",
      )
      .replace(
        "#include <map_fragment>",
        `vec3 tw = pow(abs(normalize(vTriNormal)), vec3(4.0));
        tw /= (tw.x + tw.y + tw.z);
        vec3 tp = vTriPos * triScale;
        vec4 tx = texture2D(tTri, tp.zy) * tw.x + texture2D(tTri, tp.xz) * tw.y + texture2D(tTri, tp.xy) * tw.z;
        diffuseColor.rgb *= tx.rgb;`,
      );
  };
  mat.customProgramCacheKey = () => `tri-${key}`;
}

export type MatKey =
  | "stucco" | "beige" | "charcoal" | "grey" | "concrete" | "stone" | "marble" | "wood" | "block"
  | "metalRoof" | "metalWall" | "shutter" | "glass" | "glassWarm" | "aluminum" | "red" | "water"
  | "asphalt" | "sidewalk" | "grass" | "dirt" | "gravel" | "tree" | "palm" | "trunk" | "shrub"
  | "carRed" | "carWhite" | "carGrey" | "carBlue" | "tire" | "yellow" | "lamp" | "mountain" | "black";

export function createMaterials(): { mats: Record<MatKey, THREE.Material>; dispose: () => void } {
  const tex: THREE.Texture[] = [];
  const t = (k: TexKey, seed: number) => {
    const x = textures[k](seed);
    tex.push(x);
    return x;
  };
  const std = (
    color: string,
    roughness: number,
    metalness = 0,
    tri?: [TexKey, number, number],
    extra: THREE.MeshStandardMaterialParameters = {},
  ) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (tri) triplanar(m, t(tri[0], tri[2]), tri[1], `${tri[0]}-${tri[1]}-${color}`);
    return m;
  };
  const mats: Record<MatKey, THREE.Material> = {
    stucco: std("#e9e5de", 0.92, 0, ["stucco", 0.22, 11]),
    beige: std("#b9ab9b", 0.92, 0, ["stucco", 0.22, 12]),
    charcoal: std("#3d3936", 0.8, 0, ["stucco", 0.3, 13]),
    grey: std("#64676b", 0.85, 0, ["stucco", 0.25, 14]),
    concrete: std("#a7a49e", 0.95, 0, ["concrete", 0.18, 15]),
    stone: std("#c7bba8", 0.9, 0, ["stone", 0.45, 16]),
    marble: std("#d9d4ca", 0.45, 0, ["concrete", 0.12, 17]),
    wood: std("#7a5038", 0.7, 0, ["wood", 0.5, 18]),
    block: std("#766c62", 0.95, 0, ["block", 0.3, 19]),
    metalRoof: std("#e2e3df", 0.55, 0.35, ["metal", 0.16, 20]),
    metalWall: std("#d1d2cf", 0.65, 0.2, ["metal", 0.16, 21]),
    shutter: std("#a6a7a4", 0.5, 0.45, ["metal", 0.6, 22]),
    glass: new THREE.MeshPhysicalMaterial({ color: "#26303b", roughness: 0.04, metalness: 0.15, envMapIntensity: 1.6 }),
    glassWarm: new THREE.MeshPhysicalMaterial({
      color: "#3a3631", roughness: 0.05, metalness: 0.1, envMapIntensity: 1.2, emissive: "#ffb062", emissiveIntensity: 0.28,
    }),
    aluminum: std("#2a2c2f", 0.45, 0.6),
    red: std("#cf3d2a", 0.85, 0, ["stucco", 0.3, 23]),
    water: new THREE.MeshPhysicalMaterial({ color: "#3fa7c4", roughness: 0.03, metalness: 0, envMapIntensity: 1.3, transmission: 0 }),
    asphalt: std("#3a3b3e", 0.95, 0, ["asphalt", 0.12, 24]),
    sidewalk: std("#b3afa7", 0.95, 0, ["concrete", 0.3, 25]),
    grass: std("#5a6b3b", 1, 0, ["grass", 0.09, 26]),
    dirt: std("#86735c", 1, 0, ["gravel", 0.14, 27]),
    gravel: std("#a5967c", 1, 0, ["gravel", 0.35, 28]),
    tree: std("#4f6a3c", 0.9, 0, undefined, { flatShading: true }),
    palm: std("#5d7a3e", 0.85, 0, undefined, { flatShading: true }),
    trunk: std("#5a4636", 0.95),
    shrub: std("#7b7a52", 0.95, 0, undefined, { flatShading: true }),
    carRed: std("#8e2a24", 0.3, 0.5),
    carWhite: std("#e5e5e2", 0.3, 0.4),
    carGrey: std("#6c7075", 0.3, 0.6),
    carBlue: std("#2c4566", 0.3, 0.5),
    tire: std("#18191a", 0.9),
    yellow: std("#e3b23c", 0.7),
    lamp: new THREE.MeshBasicMaterial({ color: "#fff1d2" }),
    mountain: std("#8a7663", 1, 0, ["gravel", 0.02, 29], { flatShading: true }),
    black: std("#17191b", 0.6, 0.4),
  };
  return {
    mats,
    dispose: () => {
      tex.forEach((x) => x.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}
