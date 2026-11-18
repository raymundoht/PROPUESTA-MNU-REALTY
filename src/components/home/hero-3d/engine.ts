/**
 * Motor del hero 3D: cielo de tarde, luz de sol dorada con sombras suaves, reflejos del
 * cielo en cristales, oclusión ambiental y una cámara que orbita despacio como en un
 * render arquitectónico.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import type { PropertyType } from "@/lib/types";
import { createMaterials } from "./materials";
import { buildScene, createGeometries, type SceneDef } from "./scenes";

// Sol de media tarde, alto lo suficiente para iluminar fachadas sin que se vean "encendidas".
const SUN_DIR = new THREE.Vector3(-0.62, 0.52, 0.58).normalize();
const INTRO_SECONDS = 3;

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 top;
  uniform vec3 mid;
  uniform vec3 horizon;
  uniform vec3 sunColor;
  uniform vec3 sunDir;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float y = d.y;
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.2, y));
    col = mix(col, top, smoothstep(0.2, 0.75, y));
    if (y < 0.0) col = horizon * 0.8;
    float s = max(dot(d, normalize(sunDir)), 0.0);
    col += sunColor * (pow(s, 8.0) * 0.25 + pow(s, 600.0) * 1.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export class HeroEngine {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private ao: GTAOPass | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.5, 2200);
  private sun: THREE.DirectionalLight;
  private geos = createGeometries();
  private materials = createMaterials();
  private mats = this.materials.mats;
  private cache = new Map<PropertyType, SceneDef>();
  private current: SceneDef | null = null;
  private clock = new THREE.Clock();
  private introStart = -Infinity;
  private pointer = new THREE.Vector2();
  private smooth = new THREE.Vector2();
  private frame = 0;
  private running = false;
  private disposables: { dispose(): void }[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor("#8fa9cf", 1);
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color("#3f6ba8") },
        mid: { value: new THREE.Color("#8fb0d8") },
        horizon: { value: new THREE.Color("#f1d2ae") },
        sunColor: { value: new THREE.Color("#fff0d6") },
        sunDir: { value: SUN_DIR.clone() },
      },
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), skyMat);
    this.scene.add(sky);

    // Reflejos: el mismo cielo convertido en mapa de entorno, para cristales y metales.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const skyScene = new THREE.Scene();
    const skyCopy = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat);
    skyScene.add(skyCopy);
    skyScene.add(new THREE.Mesh(new THREE.CircleGeometry(100, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#6b6a55" })));
    this.scene.environment = pmrem.fromScene(skyScene, 0.02).texture;
    this.scene.environmentIntensity = 0.6;
    skyScene.traverse((o) => {
      if (o instanceof THREE.Mesh && o !== skyCopy) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    skyCopy.geometry.dispose();
    pmrem.dispose();

    // Suelo con degradado radial: pasto cerca, tono del horizonte lejos, para que se funda con el cielo.
    const groundGeo = new THREE.RingGeometry(0, 1000, 64, 12);
    const near = new THREE.Color("#7a6e58");
    const far = new THREE.Color("#c9b9a2");
    const colors: number[] = [];
    const pos = groundGeo.attributes.position;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      const t = THREE.MathUtils.smoothstep(r, 150, 900);
      c.copy(near).lerp(far, t);
      colors.push(c.r, c.g, c.b);
    }
    groundGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.scene.add(new THREE.HemisphereLight("#bcd0ee", "#6e604c", 0.7));
    this.sun = new THREE.DirectionalLight("#ffe2bd", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Oclusión ambiental (sombras de contacto en esquinas): solo en pantallas grandes.
    if (window.innerWidth >= 768) {
      this.ao = new GTAOPass(this.scene, this.camera, 512, 512);
      this.ao.blendIntensity = 0.85;
      this.composer.addPass(this.ao);
    }
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.12, 0.3, 1.1);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.disposables.push(sky.geometry, skyMat, ground.geometry, ground.material as THREE.Material);
    this.resize();
  }

  private get(type: PropertyType) {
    let def = this.cache.get(type);
    if (!def) {
      def = buildScene(type, this.geos, this.mats);
      this.cache.set(type, def);
    }
    return def;
  }

  /** Cambia de escena. Con `intro` la cámara entra con un acercamiento suave. */
  setScene(type: PropertyType, intro = true) {
    const def = this.get(type);
    if (this.current) this.scene.remove(this.current.group);
    this.scene.add(def.group);
    this.current = def;
    const s = this.sun.shadow.camera;
    s.left = s.bottom = -def.extent;
    s.right = s.top = def.extent;
    s.near = 1;
    s.far = 600;
    s.updateProjectionMatrix();
    this.sun.position.copy(def.target).addScaledVector(SUN_DIR, 250);
    this.sun.target.position.copy(def.target);
    this.introStart = intro && !this.reducedMotion ? this.clock.getElapsedTime() : -Infinity;
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y);
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    // Pestaña en segundo plano o aún sin maquetar: no hay tamaño todavía.
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.ao?.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    // En pantallas angostas se abre el lente para que el edificio quepa.
    this.camera.fov = w / h < 0.8 ? 52 : 36;
    // En escritorio el edificio se corre a la derecha para dejar libre el texto de la izquierda.
    if (w >= 1024) this.camera.setViewOffset(w * 1.3, h, 0, 0, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  private placeCamera(t: number) {
    const d = this.current;
    if (!d) return;
    const motion = this.reducedMotion ? 0 : 1;
    this.smooth.lerp(this.pointer, 0.045);
    const intro = 1 - easeOut((t - this.introStart) / INTRO_SECONDS);
    const angle = d.angle + Math.sin(t * 0.11) * d.sweep * motion + this.smooth.x * 0.1 - intro * 0.35;
    const radius = d.radius * (1 + intro * 0.45) * (1 - 0.05 * Math.sin(t * 0.08) * motion);
    const portrait = this.camera.aspect < 0.8 ? 1.25 : 1;
    const height = d.height + intro * d.radius * 0.18 + Math.sin(t * 0.14) * 1.2 * motion - this.smooth.y * 3;
    this.camera.position.set(
      d.target.x + Math.sin(angle) * radius * portrait,
      d.target.y + height,
      d.target.z + Math.cos(angle) * radius * portrait,
    );
    this.camera.lookAt(d.target);
  }

  private loop = () => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.loop);
    if (!this.renderer.domElement.width) this.resize();
    this.placeCamera(this.clock.getElapsedTime());
    this.composer.render();
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  /** Renderiza cada escena una vez y devuelve miniaturas (data URL) para el selector. */
  thumbnails(types: PropertyType[], w = 192, h = 128): Partial<Record<PropertyType, string>> {
    const out: Partial<Record<PropertyType, string>> = {};
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return out;
    const prev = this.current;
    const src = this.renderer.domElement;
    if (!src.width || !src.height) return out;
    for (const type of types) {
      this.setScene(type, false);
      this.placeCamera(0);
      this.composer.render();
      const scale = Math.max(w / src.width, h / src.height);
      const sw = w / scale;
      const sh = h / scale;
      ctx.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, w, h);
      out[type] = c.toDataURL("image/jpeg", 0.82);
    }
    if (prev) {
      this.scene.remove(this.current!.group);
      this.current = null;
    }
    return out;
  }

  dispose() {
    this.stop();
    for (const def of this.cache.values()) {
      def.group.traverse((o) => {
        if (o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
    }
    Object.values(this.geos).forEach((g) => g.dispose());
    this.materials.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.scene.environment?.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
