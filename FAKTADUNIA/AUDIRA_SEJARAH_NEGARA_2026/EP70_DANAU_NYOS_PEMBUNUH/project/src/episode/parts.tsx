// Shared props for EP70 Danau Nyos (TERRARIUM: lake as a cut-away glass jar on a dark walnut table).
// Everything is a pure function of t (VO seconds); no Math.random. GLB from public/models/polyfork.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { makeGlassMaterial, makeCorkTexture, makeWoodTexture, makeSpeckleTexture } from "../kits/terrarium/lib/materials";
import { clamp, lerp, smooth, prng } from "../kits/terrarium/core/motion";
import { T, VILLAGES, type V3 } from "./timeline.ts";
import { FX_LAYER } from "../core/render/Post.tsx";

/** Ref callback: put an effect mesh on the FX layer so GTAO / DOF depth passes skip it. */
const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};

export const C = {
  room: "#120d0a",
  wood: "#4a2f1e",
  lakeTop: "#3d8fb0",
  lakeDeep: "#1f5a4b",
  co2: "#cfe3ea",
  magma: "#c2401c",
  lamp: "#ffb45a",
  rust: "#8a3b22",
  rustDeep: "#4a1e12",
  dawn: "#f2b866",
  basalt: "#2f2c2a",
  moss: "#5b6b34",
  soil: "#4a3424",
  brass: "#b8893a",
};

export const win = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

// ---------- geometry constants ----------
export const JR = 1.2; // jar radius
const JY = 1.15; // vertical stretch of the kit profile
export const NECK_TOP = 2.79 * JY;
const PROFILE: [number, number][] = [
  [0.001, 0], [0.86, 0], [0.96, 0.03], [0.995, 0.1], [1.0, 0.25], [1.0, 1.95], [0.985, 2.12], [0.93, 2.3],
  [0.82, 2.44], [0.68, 2.55], [0.61, 2.62], [0.6, 2.7], [0.63, 2.73], [0.64, 2.77], [0.6, 2.79],
];
export const LAKE = { floor: 0.3, thermo: 1.22, surface: 1.95, rim: 2.06, inner: 1.12 };
/** Crater bowl radius at height y. */
export const bowlR = (y: number) => 0.3 + 0.8 * Math.pow(clamp((y - LAKE.floor) / (LAKE.rim - LAKE.floor)), 0.75);

// ---------- terrain: plateau under the jar, valley running down toward +x/+z ----------
const SQ = Math.SQRT1_2;
export const terrainY = (x: number, z: number) => {
  const d = Math.hypot(x, z);
  if (d > 7.6) return -1.62;
  const a = (x + z) * SQ;
  const p = (x - z) * SQ;
  const fall = -1.3 * smooth((d - 1.6) / 4.8);
  const valley = -0.2 * Math.exp(-(p * p) / 0.45) * smooth((a - 1.4) / 1.2);
  const noise = 0.05 * Math.sin(x * 2.1 + 0.3) * Math.sin(z * 1.7 + 1.2) * smooth((d - 1.6) / 0.6);
  const edge = -0.3 * smooth((d - 7.0) / 0.6);
  return fall + valley + noise + edge;
};
export const valleyPoint = (a: number, p = 0): V3 => {
  const pp = p + 0.18 * Math.sin(a * 1.3);
  const x = (a + pp) * SQ;
  const z = (a - pp) * SQ;
  return [x, terrainY(x, z), z];
};

// ---------- textures ----------
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTexture = (text: string, o: { w?: number; h?: number; font?: string; fg?: string; bg?: string; border?: string } = {}) => {
  const { w = 512, h = 160, font = "800 84px 'Segoe UI', Arial, sans-serif", fg = "#F4EFE6", bg = "rgba(18,13,10,0.82)", border = "#3d8fb0" } = o;
  const key = `${text}|${w}|${h}|${font}|${fg}|${bg}|${border}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.fillStyle = border;
    g.fillRect(0, h - Math.max(6, h * 0.07), w, Math.max(6, h * 0.07));
  }
  g.fillStyle = fg;
  g.font = font;
  // shrink the font until the text fits 88% of the plate (long names like "DESA SUBUM" were clipped)
  for (let px = Number(/(\d+)px/.exec(font)?.[1] ?? 84); px > 20 && g.measureText(text).width > w * 0.88; px -= 4) g.font = font.replace(/\d+px/, `${px}px`);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
};

let PUFF: THREE.CanvasTexture | null = null;
const puffTexture = () => {
  if (PUFF) return PUFF;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = prng(919);
  for (let i = 0; i < 26; i++) {
    const x = 128 + (r() - 0.5) * 120;
    const y = 128 + (r() - 0.5) * 70;
    const rad = 30 + r() * 60;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, "rgba(255,255,255,0.22)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
  }
  PUFF = new THREE.CanvasTexture(c);
  return PUFF;
};

const mats = new Map<string, THREE.Material>();
const once = <M extends THREE.Material>(key: string, make: () => M) => (mats.get(key) as M) ?? (mats.set(key, make()).get(key) as M);

// ---------- room ----------
export const Room: React.FC<{ night: number }> = ({ night }) => {
  const wood = useMemo(() => makeWoodTexture(), []);
  const bokeh = useMemo(() => {
    const r = prng(5150);
    return Array.from({ length: 34 }, () => {
      const a = Math.PI * (0.55 + r() * 1.25);
      const rad = 15 + r() * 6;
      return { p: [Math.cos(a) * rad, -0.5 + r() * 6, Math.sin(a) * rad - 2] as V3, s: 0.12 + r() * 0.22, warm: r() > 0.3 };
    });
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <circleGeometry args={[26, 64]} />
        <meshStandardMaterial map={wood} color="#8a6a52" roughness={0.42} metalness={0.05} />
      </mesh>
      {bokeh.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.s, 12, 8]} />
          <meshBasicMaterial color={b.warm ? "#FFC27A" : "#9CC4FF"} fog={false} transparent opacity={0.35 + 0.5 * night} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- terrain mesh ----------
export const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(16, 16, 180, 180);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const moss = new THREE.Color(C.moss);
    const soil = new THREE.Color(C.soil);
    const rock = new THREE.Color(C.basalt);
    const tmp = new THREE.Color();
    const r = prng(77);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainY(x, z);
      pos.setY(i, y);
      const slope = Math.abs(terrainY(x + 0.05, z) - y) + Math.abs(terrainY(x, z + 0.05) - y);
      const d = Math.hypot(x, z);
      tmp.copy(moss).lerp(soil, clamp(slope * 9)).lerp(rock, d < 1.9 ? 0.7 : 0);
      tmp.multiplyScalar(0.85 + r() * 0.3);
      col.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.95} />
    </mesh>
  );
};

/** Seeded scatter of boulders, reeds and trees along the crater rim and valley sides. */
export const Scatter: React.FC = () => {
  const items = useMemo(() => {
    const r = prng(4242);
    const out: { id: string; type: string; p: V3; s: number; ry: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + r() * 0.3;
      const d = 1.45 + r() * 0.35;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (z > 1.0 && Math.abs(x) < 1.1) continue;
      out.push({ id: "basalt-boulder-a1929c", type: "prop", p: [x, terrainY(x, z), z], s: 0.22 + r() * 0.18, ry: r() * 6 });
    }
    for (let i = 0; i < 10; i++) {
      const a = 1.8 + i * 0.55;
      const [x, y, z] = valleyPoint(a, (i % 2 ? 1 : -1) * (1.2 + r() * 0.5));
      out.push({ id: "broad-canopy-shade-tree-e7c4a2", type: "prop", p: [x, y, z], s: 0.42 + r() * 0.2, ry: r() * 6 });
    }
    for (let i = 0; i < 8; i++) {
      const a = 2.1 + i * 0.6;
      const [x, y, z] = valleyPoint(a, (i % 2 ? -1 : 1) * (0.9 + r() * 0.3));
      out.push({ id: "banana-plant-978d7f", type: "prop", p: [x, y, z], s: 0.22 + r() * 0.08, ry: r() * 6 });
    }
    return out;
  }, []);
  return (
    <>
      {items.map((it, i) => (
        <group key={i} position={it.p} rotation={[0, it.ry, 0]}>
          <AssetModel id={it.id} assetType={it.type} size={it.s} ground roughness={0.9} />
        </group>
      ))}
    </>
  );
};

/** Foreground reeds at the table lip (out of focus layer). */
export const Reeds: React.FC<{ position: V3; n?: number; seed?: number }> = ({ position, n = 4, seed = 9 }) => {
  const r = prng(seed);
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[(r() - 0.5) * 0.7, 0, (r() - 0.5) * 0.4]} rotation={[0, r() * 6, 0]}>
          <AssetModel id="cattail-reed-6abbb3" assetType="prop" size={0.55 + r() * 0.25} ground />
        </group>
      ))}
    </group>
  );
};

// ---------- the jar ----------
/** Private reflection map for the jar: dark warm gradient + two tall strip softboxes.
 *  The scene's studio HDRI has octagon softboxes that mirrored as two white "rocks" inside the jar
 *  (scene.environmentIntensity ignores material.envMapIntensity, so dimming did not help). */
const useJarEnv = () => {
  const gl = useThree((st) => st.gl);
  const rt = useMemo(() => {
    const sc = new THREE.Scene();
    const sky = new THREE.SphereGeometry(10, 32, 16);
    const col = new Float32Array(sky.attributes.position.count * 3);
    const lo = new THREE.Color("#0b0806"), hi = new THREE.Color("#3a2c22"), c = new THREE.Color();
    for (let i = 0; i < sky.attributes.position.count; i++) {
      c.copy(lo).lerp(hi, clamp((sky.attributes.position.getY(i) + 10) / 20));
      col.set([c.r, c.g, c.b], i * 3);
    }
    sky.setAttribute("color", new THREE.BufferAttribute(col, 3));
    sc.add(new THREE.Mesh(sky, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const strip = (x: number, z: number, k: number, hex: string) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 9), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, 1, z);
      m.lookAt(0, 1, 0);
      sc.add(m);
    };
    strip(-6, 6, 2.2, "#ffe2c0");
    strip(7, 3, 1.4, "#cfe2ff");
    const pm = new THREE.PMREMGenerator(gl);
    const target = pm.fromScene(sc, 0.02);
    pm.dispose();
    return target;
  }, [gl]);
  return rt.texture;
};

export const GlassJar: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const env = useJarEnv();
  const glass = useMemo(() => {
    const m = makeGlassMaterial();
    m.thickness = 0.08;
    m.envMap = env;
    m.envMapIntensity = 0.9;
    m.side = THREE.FrontSide; // back-face refraction drew displaced copies of the rim boulders inside the jar
    m.roughness = 0.04;
    m.attenuationColor = new THREE.Color("#CFEADF");
    return m;
  }, [env]);
  const geo = useMemo(() => new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x * JR, y * JY)), 128), []);
  return <mesh geometry={geo} material={glass} scale={scale} renderOrder={10} />;
};

/** Cork stopper with hemp twine; pops at T.corkPop and lands on the plateau. */
export const Cork: React.FC<{ t: number }> = ({ t }) => {
  const cork = useMemo(() => makeCorkTexture(), []);
  const u = clamp((t - T.corkPop) / 0.85);
  const rest: V3 = [1.75, terrainY(1.75, 0.55) + 0.1, 0.55];
  const base: V3 = [0, NECK_TOP + 0.12, 0];
  const p: V3 = [lerp(base[0], rest[0], u), lerp(base[1], rest[1], u) + 1.3 * Math.sin(Math.PI * u), lerp(base[2], rest[2], u)];
  const shake = t < T.corkPop ? 0.012 * win(t, 27, 31.8) * Math.sin(t * 61) : 0;
  return (
    <group position={[p[0] + shake, p[1], p[2]]} rotation={[0, 0, -u * (Math.PI / 2 + 3.6)]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.66, 0.6, 0.34, 48]} />
        <meshStandardMaterial map={cork} roughness={0.95} />
      </mesh>
      {u === 0 ? (
        <mesh position={[0, -0.24, 0]}>
          <torusGeometry args={[0.69, 0.025, 8, 48]} />
          <meshStandardMaterial color="#b49a6a" roughness={1} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Brass plaque on the plateau in front of the jar: brand inside the world. */
export const Plaque: React.FC<{ text?: string; position?: V3; w?: number }> = ({ text = "AUDIRA · DANAU NYOS 1986", position = [0, 0.09, 1.5], w = 1.5 }) => {
  const tex = useMemo(() => textTexture(text, { w: 1024, h: 150, font: "800 70px 'Segoe UI', Arial, sans-serif", fg: "#2a1a0a", bg: "#c99a48", border: "#7a5520" }), [text]);
  return (
    <group position={position} rotation={[-0.5, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, w * 0.15, 0.04]} />
        <meshStandardMaterial color={C.brass} metalness={1} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[w * 0.96, w * 0.14]} />
        <meshStandardMaterial map={tex} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
};

// ---------- lake cross-section ----------
const bowlPts = (y0: number, y1: number, n = 14) => Array.from({ length: n + 1 }, (_, i) => y0 + ((y1 - y0) * i) / n);

/** U-shaped polygon (x, y) between the bowl walls from y0 to y1, in the z = 0 cut plane. */
const bowlShape = (y0: number, y1: number) => {
  const s = new THREE.Shape();
  const ys = bowlPts(y0, y1);
  s.moveTo(-bowlR(y0), y0);
  ys.forEach((y) => s.lineTo(bowlR(y), y));
  [...ys].reverse().forEach((y) => s.lineTo(-bowlR(y), y));
  return s;
};

export type LakeState = { surface: number; tilt: number; rust: number; bubbles: number; rush: number; magma: number; frontLid: number };

export const lakeState = (t: number): LakeState => {
  const drop = 0.22 * win(t, 37, 44);
  const rust = win(t, T.rust, T.rust + 1.6) * (1 - win(t, 74.5, 77.5));
  return {
    surface: LAKE.surface - drop,
    tilt: 0.1 * Math.sin((t - 37.8) * 2.4) * win(t, 37.8, 38.4) * (1 - win(t, 39.6, 41.5)),
    rust,
    bubbles: 0.25 + 0.75 * win(t, 9, 31.5),
    rush: win(t, T.eruptStart - 0.6, T.eruptStart + 1.6) * (1 - win(t, 43, 46)),
    magma: 0.5 + 0.9 * win(t, 13, 31.5) - 0.6 * win(t, 44, 50),
    frontLid: 1 - win(t, 8.6, 10.6),
  };
};

/** Water body texture for the cut face: vertical light falloff + drifting silt streaks (uv = world xy). */
const waterTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.35, "#c9c9c9");
    grd.addColorStop(1, "#6e6e6e");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 512);
    const r = prng(77);
    for (let i = 0; i < 90; i++) {
      const y = r() * 512;
      g.strokeStyle = `rgba(255,255,255,${0.05 + r() * 0.1})`;
      g.lineWidth = 1 + r() * 3;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + 6 * Math.sin(x * 0.03 + i));
      g.stroke();
    }
    for (let i = 0; i < 700; i++) {
      g.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.2})`;
      g.fillRect(r() * 256, r() * 512, 1 + r() * 2, 1 + r() * 2);
    }
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    // ShapeGeometry uv = world xy: map x -1.2..1.2 and y floor..surface onto the canvas
    tex.repeat.set(1 / 2.4, 1 / (LAKE.surface - LAKE.floor));
    tex.offset.set(0.5, -LAKE.floor / (LAKE.surface - LAKE.floor));
    return tex;
  };
})();

const BUB = 260;
export const LakeSection: React.FC<{ t: number; s: LakeState }> = ({ t, s }) => {
  const basalt = useMemo(() => makeSpeckleTexture("#2b2826", ["#1a1817", "#3c3733", "#4a443d", "#56604a"], 31, 3), []);
  const rockLathe = useMemo(() => {
    const pts: [number, number][] = [[0.001, 0], [LAKE.inner, 0], [LAKE.inner, LAKE.rim], [bowlR(LAKE.rim), LAKE.rim + 0.02]];
    bowlPts(LAKE.floor, LAKE.rim).reverse().forEach((y) => pts.push([bowlR(y), y]));
    pts.push([0.001, LAKE.floor]);
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96, Math.PI / 2, Math.PI);
  }, []);
  const rockCap = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-LAKE.inner, 0);
    sh.lineTo(LAKE.inner, 0);
    sh.lineTo(LAKE.inner, LAKE.rim);
    const ys = bowlPts(LAKE.floor, LAKE.rim);
    [...ys].reverse().forEach((y) => sh.lineTo(bowlR(y), y));
    ys.forEach((y) => sh.lineTo(-bowlR(y), y));
    sh.lineTo(-LAKE.inner, LAKE.rim);
    sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 4);
    // UV from xy so the speckle tiles
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) * 0.5, p.getY(i) * 0.5);
    return g;
  }, []);
  const deepGeo = useMemo(() => new THREE.ShapeGeometry(bowlShape(LAKE.floor, LAKE.thermo), 4), []);
  const topGeo = useMemo(() => new THREE.ShapeGeometry(bowlShape(LAKE.thermo, LAKE.surface), 4), []);
  const conduit = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.08, -0.02);
    sh.bezierCurveTo(-0.02, 0.1, -0.07, 0.2, -0.04, LAKE.floor + 0.01);
    sh.lineTo(0.04, LAKE.floor + 0.01);
    sh.bezierCurveTo(0.08, 0.2, 0.02, 0.1, 0.08, -0.02);
    sh.closePath();
    return new THREE.ShapeGeometry(sh, 8);
  }, []);
  const bubbles = useMemo(() => {
    const r = prng(2024);
    return Array.from({ length: BUB }, (_, i) => {
      const y = LAKE.floor + 0.05 + r() * (LAKE.thermo - LAKE.floor - 0.1);
      const fromConduit = i < 40;
      return { y, x: (r() * 2 - 1) * bowlR(y) * 0.88, z: 0.015 + r() * 0.05, s: 0.012 + Math.pow(r(), 2) * 0.03, th: r(), ph: r(), fromConduit, sp: 0.15 + r() * 0.2 };
    });
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    bubbles.forEach((b, i) => {
      let x = b.x, y = b.y, sc = b.s;
      if (b.fromConduit) {
        // a thin stream from the magma conduit into the deep layer
        const k = (b.ph + t * b.sp) % 1;
        y = 0.02 + k * (LAKE.floor + 0.25);
        x = 0.03 * Math.sin(k * 9 + b.th * 6);
        sc = b.s * 0.7;
      } else {
        if (b.th > s.bubbles) sc = 0;
        x += 0.01 * Math.sin(t * 1.3 + b.ph * 9);
        y += 0.008 * Math.sin(t * 1.7 + b.ph * 7);
        if (s.rush > 0) {
          const k = (b.ph + t * (0.9 + b.sp * 2)) % 1;
          y = lerp(y, LAKE.floor + k * (s.surface - LAKE.floor), s.rush);
          x *= 1 - 0.35 * s.rush * k;
          sc *= 1 + s.rush * 0.6;
        }
        if (y > s.surface - 0.02) sc = 0;
      }
      o.position.set(x, y, b.z);
      o.scale.setScalar(sc);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, s, bubbles]);

  const top = new THREE.Color(C.lakeTop).lerp(new THREE.Color(C.rust), s.rust);
  const deep = new THREE.Color(C.lakeDeep).lerp(new THREE.Color(C.rustDeep), s.rust);
  const rs = bowlR(s.surface);
  return (
    <group>
      <mesh geometry={rockLathe} castShadow receiveShadow>
        <meshStandardMaterial map={basalt} color="#8a8178" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rockCap} position={[0, 0, 0.001]}>
        <meshStandardMaterial map={basalt} color="#a69a8c" roughness={0.9} />
      </mesh>
      <mesh geometry={conduit} position={[0, 0, 0.004]}>
        <meshStandardMaterial color={C.magma} emissive={C.magma} emissiveIntensity={1.2 + 1.6 * s.magma} toneMapped={false} />
      </mesh>
      {/* deep layer: saturated with CO2 */}
      <mesh geometry={deepGeo} position={[0, 0, 0.006]}>
        <meshStandardMaterial map={waterTexture()} color={deep} emissive={deep} emissiveMap={waterTexture()} emissiveIntensity={0.7} roughness={0.35} />
      </mesh>
      {/* thermocline: thin glinting boundary */}
      <mesh position={[0, LAKE.thermo, 0.01]}>
        <planeGeometry args={[bowlR(LAKE.thermo) * 2, 0.022]} />
        <meshBasicMaterial color="#9fe7f0" toneMapped={false} visible={s.rush < 0.5} />
      </mesh>
      <group rotation={[0, 0, s.tilt]} position={[0, 0, 0]}>
        {/* upper layer */}
        <mesh geometry={topGeo} position={[0, 0, 0.006]} scale={[1, 1, 1]}>
          <meshStandardMaterial map={waterTexture()} color={top} emissive={top} emissiveMap={waterTexture()} emissiveIntensity={0.55} roughness={0.2} />
        </mesh>
        {/* surface: back half always, front half only until the cut opens */}
        <mesh position={[0, s.surface, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[rs, 64, 0, Math.PI]} />
          <meshPhysicalMaterial color={top} roughness={0.12} metalness={0.15} clearcoat={1} />
        </mesh>
        {s.frontLid > 0.01 ? (
          <mesh position={[0, s.surface, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[rs, 64, Math.PI, Math.PI]} />
            <meshPhysicalMaterial color={top} roughness={0.12} metalness={0.15} clearcoat={1} transparent opacity={s.frontLid} />
          </mesh>
        ) : null}
        {/* moonlight glint on the surface */}
        <mesh position={[-0.25, s.surface + 0.004, -0.2]} rotation={[-Math.PI / 2, 0, 0.5]} scale={[1, 0.45, 1]}>
          <circleGeometry args={[0.26, 40]} />
          <meshBasicMaterial color="#e8f2ff" transparent opacity={0.4 * (1 - s.rust)} toneMapped={false} />
        </mesh>
      </group>
      <instancedMesh ref={ref} args={[undefined, undefined, BUB]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#dff7ff" emissive="#7fd6e6" emissiveIntensity={0.5} roughness={0.1} />
      </instancedMesh>
    </group>
  );
};

/** Glass pressure tube clamped to the jar's right side; red column climbs in s3, drops after the pop. */
export const PressureGauge: React.FC<{ t: number }> = ({ t }) => {
  const k = 0.12 + 0.82 * win(t, 19.6, 31.6) - 0.86 * win(t, T.corkPop, T.corkPop + 1.2);
  const h = 1.5;
  return (
    <group position={[JR + 0.16, 0.25, 0.45]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, h, 24, 1, true]} />
        <meshPhysicalMaterial color="#f4fbf8" transmission={1} thickness={0.05} roughness={0.05} transparent />
      </mesh>
      <mesh position={[0, (h * Math.max(0.02, k)) / 2, 0]}>
        <cylinderGeometry args={[0.045, 0.045, h * Math.max(0.02, k), 16]} />
        <meshStandardMaterial color="#d83a22" emissive="#d83a22" emissiveIntensity={0.8 + k} toneMapped={false} />
      </mesh>
      {[0.25, 0.5, 0.75, 1].map((q) => (
        <mesh key={q} position={[-0.075, h * q, 0]}>
          <boxGeometry args={[0.05, 0.012, 0.012]} />
          <meshStandardMaterial color={C.brass} metalness={1} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.08, 24]} />
        <meshStandardMaterial color={C.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** s4: water + foam column out of the neck, spray falling around the jar. */
const FOAM = 180;
export const Eruption: React.FC<{ t: number }> = ({ t }) => {
  const up = win(t, T.eruptStart, T.eruptPeak);
  const down = win(t, 41, T.eruptEnd);
  const h = 3.4 * up * (1 - down);
  const foam = useMemo(() => {
    const r = prng(8080);
    return Array.from({ length: FOAM }, () => ({ k: r(), a: r() * Math.PI * 2, rr: 0.15 + r() * 0.45, s: 0.06 + r() * 0.12, ph: r(), fall: r() > 0.55 }));
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const base = NECK_TOP - 0.1;
    foam.forEach((f, i) => {
      if (h < 0.05) {
        o.scale.setScalar(0);
      } else if (!f.fall) {
        const y = LAKE.surface + ((f.k + t * 0.8) % 1) * (base + h - LAKE.surface);
        const spread = y > base ? 0.32 + 0.35 * ((y - base) / Math.max(0.1, h)) : 0.3;
        o.position.set(Math.cos(f.a + t) * f.rr * spread * 1.6, y, Math.sin(f.a + t) * f.rr * spread * 1.6);
        o.scale.setScalar(f.s * (0.7 + 0.6 * Math.sin(t * 5 + f.ph * 9) ** 2));
      } else {
        // spray arcs: leave the top of the column and fall outside the jar
        const k = (f.ph + t * 0.55) % 1;
        const top = base + h;
        const rad = 0.5 + k * (1.6 + f.rr * 2);
        o.position.set(Math.cos(f.a) * rad, top - k * k * (top + 0.4), Math.sin(f.a) * rad);
        o.scale.setScalar(f.s * 0.55 * (1 - k * 0.5));
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, h, foam]);
  return (
    <group>
      {h > 0.05 ? (
        <mesh ref={fx} position={[0, LAKE.surface + (NECK_TOP - 0.1 + h - LAKE.surface) / 2, 0]}>
          <cylinderGeometry args={[0.55 + 0.25 * up, 0.42, NECK_TOP - 0.1 + h - LAKE.surface, 32, 8, true]} />
          <meshStandardMaterial color="#e3f2f5" emissive="#9cc9d6" emissiveIntensity={0.25} roughness={0.45} transparent opacity={0.82} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      <instancedMesh ref={ref} args={[undefined, undefined, FOAM]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#f2fbfd" roughness={0.6} />
      </instancedMesh>
    </group>
  );
};

// ---------- CO2 flow: puffs riding a curve from the neck down the valley ----------
const GAS = 90;
const gasCurve = (() => {
  const pts: V3[] = [[0.3, NECK_TOP + 0.05, 0.3], [0.62, 2.75, 0.62], [0.86, 1.6, 0.86], [0.92, 0.35, 0.92], [1.2, 0.08, 1.2]];
  for (let a = 2.0; a <= 7.2; a += 0.6) {
    const [x, y, z] = valleyPoint(a);
    pts.push([x, y + 0.05, z]);
  }
  return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
})();
/** Leading edge (0..1 along the curve). */
export const gasFront = (t: number) => 0.2 * win(t, T.gasPour, 49.2) + 0.8 * win(t, 49.2, 64.6);
export const gasFrontPoint = (t: number): V3 => gasCurve.getPointAt(clamp(gasFront(t), 0.001, 1)).toArray() as V3;

export const GasFlow: React.FC<{ t: number }> = ({ t }) => {
  const puffs = useMemo(() => {
    const r = prng(3131);
    return Array.from({ length: GAS }, (_, i) => ({ u: i / GAS + r() * 0.008, s: 0.6 + r() * 0.7, dy: r() * 0.18, off: (r() - 0.5) * 0.5, rot: r() * 6, ph: r() }));
  }, []);
  const front = gasFront(t);
  const fade = 1 - win(t, 66.2, 68.2);
  if (front <= 0 || fade <= 0) return null;
  const tex = puffTexture();
  return (
    <group>
      {puffs.map((p, i) => {
        if (p.u > front) return null;
        const lead = clamp((front - p.u) / 0.05);
        const u = clamp(p.u + 0.004 * Math.sin(t * 0.8 + p.ph * 6));
        const q = gasCurve.getPointAt(u);
        const widen = u < 0.18 ? 0.55 : 1;
        return (
          <Billboard key={i} position={[q.x + p.off * 0.35 * widen, q.y + p.dy * widen + (u > 0.3 ? p.s * 0.3 : 0), q.z - p.off * 0.35 * widen]}>
            <mesh ref={fx} rotation={[0, 0, p.rot + t * 0.1]}>
              <planeGeometry args={[p.s * widen, p.s * widen * 0.7]} />
              <meshBasicMaterial map={tex} color={C.co2} transparent opacity={(u > 0.3 ? 0.24 : 0.42) * lead * fade} depthWrite={false} /> {/* lifted + tone-mapped: half-buried billboards cut a hard white band in the valley at 62s */}
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
};

// ---------- villages ----------
export const villageCenter = (i: number): V3 => valleyPoint(VILLAGES[i].along, VILLAGES[i].side);

export const Village: React.FC<{ i: number; t: number; label: number }> = ({ i, t, label }) => {
  const v = VILLAGES[i];
  const [cx, , cz] = villageCenter(i);
  const lit = 1 - win(t, v.dark, v.dark + 0.7);
  const huts = useMemo(() => {
    const r = prng(600 + i);
    return Array.from({ length: 3 }, (_, k) => {
      const a = (k / 3) * Math.PI * 2 + r();
      const x = cx + Math.cos(a) * 0.32, z = cz + Math.sin(a) * 0.32;
      return { p: [x, terrainY(x, z), z] as V3, ry: r() * 6, s: 0.3 + r() * 0.08 };
    });
  }, [i, cx, cz]);
  const tex = textTexture(v.name, { w: 512, h: 150 });
  const winMat = once(`win${i}`, () => new THREE.MeshStandardMaterial({ color: C.lamp, emissive: C.lamp, toneMapped: false }));
  (winMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + 2.2 * lit;
  return (
    <group>
      {huts.map((h, k) => (
        <group key={k} position={h.p} rotation={[0, h.ry, 0]}>
          <AssetModel id="thatched-cottage-0e63f5" assetType="building" size={h.s} ground roughness={0.9} />
          <mesh position={[0, h.s * 0.22, h.s * 0.42]} material={winMat}>
            <boxGeometry args={[h.s * 0.18, h.s * 0.14, 0.01]} />
          </mesh>
        </group>
      ))}
      <group position={[cx + 0.12, terrainY(cx + 0.12, cz + 0.2), cz + 0.2]}>
        <AssetModel id="hand-lantern-cdbe1a" assetType="attachment" size={0.09} ground />
        <AssetModel id="clay-storage-pot-626452" assetType="prop" size={0.08} ground position={[0.12, 0, 0.02]} />
      </group>
      <pointLight position={[cx, terrainY(cx, cz) + 0.35, cz + 0.2]} intensity={1.4 * lit} distance={1.8} color={C.lamp} />
      {label > 0.01 ? (
        <Billboard position={[cx, terrainY(cx, cz) + 0.62, cz]}>
          <mesh scale={label}>
            <planeGeometry args={[0.62, 0.18]} />
            <meshBasicMaterial map={tex} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      ) : null}
    </group>
  );
};

/** Cattle standing in the pasture near Cha (s6, only before the gas arrives). */
export const Cattle: React.FC<{ t: number }> = ({ t }) => {
  if (t > VILLAGES[2].dark + 0.6) return null;
  const spots = [valleyPoint(4.3, 1.05), valleyPoint(4.55, 1.3), valleyPoint(4.15, 1.4)];
  return (
    <>
      {spots.map((p, i) => (
        <group key={i} position={p} rotation={[0, 0.8 + i * 1.3, 0]}>
          <AssetModel id="cow-base" assetType="animal" size={0.16} ground />
        </group>
      ))}
    </>
  );
};

// ---------- s7: degassing pipe + fountain, and the small Monoun jar ----------
const DROPS = 220;
export const PipeFountain: React.FC<{ t: number }> = ({ t }) => {
  const grow = win(t, T.pipe, T.pipe + 1.4);
  const jet = win(t, 82.2, 84.0);
  const drops = useMemo(() => {
    const r = prng(1717);
    return Array.from({ length: DROPS }, () => ({ a: r() * Math.PI * 2, v: 0.6 + r() * 0.5, ph: r(), s: 0.015 + r() * 0.02 }));
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    drops.forEach((d, i) => {
      const k = (d.ph + t * 0.7) % 1;
      const top = LAKE.surface + 0.12 + jet * 1.9 * d.v;
      const y = LAKE.surface + 0.12 + (top - LAKE.surface - 0.12) * (1 - (2 * k - 1) ** 2);
      const rad = k * (0.12 + 0.5 * d.v) * (y > NECK_TOP ? 1 : 0.6);
      o.position.set(Math.cos(d.a) * rad, y, Math.sin(d.a) * rad);
      o.scale.setScalar(jet > 0.02 ? d.s : 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, jet, drops]);
  if (grow <= 0) return null;
  const len = (LAKE.surface + 0.12 - LAKE.floor) * grow;
  return (
    <group>
      <mesh position={[0, LAKE.floor + len / 2, 0.05]}>
        <cylinderGeometry args={[0.045, 0.045, len, 20]} />
        <meshStandardMaterial color="#8d9399" metalness={0.75} roughness={0.42} />
      </mesh>
      <mesh position={[0, LAKE.surface + 0.02, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={grow}>
        <torusGeometry args={[0.13, 0.04, 10, 32]} />
        <meshStandardMaterial color="#e2702a" roughness={0.5} />
      </mesh>
      <mesh ref={fx} position={[0, LAKE.surface + 0.12 + jet * 0.9, 0.05]} scale={[1, jet, 1]}>
        <cylinderGeometry args={[0.02, 0.05, 1.8, 16, 1, true]} />
        <meshStandardMaterial color="#eaf7fb" emissive="#a9d8e6" emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, DROPS]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#f0fbff" emissive="#bfe8f2" emissiveIntensity={0.35} roughness={0.1} />
      </instancedMesh>
    </group>
  );
};

export const MonounJar: React.FC<{ t: number; position: V3 }> = ({ t, position }) => {
  const glow = win(t, 72.0, 73.6);
  // r2: transmissive top layer vanished behind the glass → opaque layers with the hero lake's silt/gradient texture
  const tex = useMemo(() => {
    const x = waterTexture().clone();
    x.repeat.set(3, 1);
    x.offset.set(0, 0);
    x.wrapS = THREE.RepeatWrapping;
    x.needsUpdate = true;
    return x;
  }, []);
  return (
    <group position={position}>
      <group scale={0.55}>
        {/* jury r1: one flat teal cylinder read as a placeholder → two water layers (deep gas-rich + clear top) like the hero lake */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.9, 48]} />
          <meshStandardMaterial map={tex} color="#2a6a58" emissive="#16443a" emissiveMap={tex} emissiveIntensity={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.905, 0]}>
          <cylinderGeometry args={[1.065, 1.065, 0.012, 48]} />
          <meshBasicMaterial color="#9fe0d0" toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.8, 48]} />
          <meshStandardMaterial map={tex} color="#5ab4c8" emissive="#2a7488" emissiveMap={tex} emissiveIntensity={0.45} roughness={0.15} />
        </mesh>
        <mesh position={[0, 1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.08, 48]} />
          <meshPhysicalMaterial color="#2f6a78" roughness={0.12} clearcoat={1} />
        </mesh>
        <GlassJar />
      </group>
      <Plaque text="MONOUN · 1984" position={[0, 0.07, 0.95]} w={0.95} />
      <pointLight position={[0.6, 1.8, 1.2]} intensity={1.6 * glow} distance={4} color="#ffd59a" />
    </group>
  );
};

/** Pipe spares coiled on the plateau (s7 set dressing). */
export const PipeSpare: React.FC = () => {
  const x = -1.75, z = 0.6;
  return (
    <group position={[x, terrainY(x, z), z]} rotation={[0, 0.6, 0]}>
      <AssetModel id="pipe-run-280a0d" assetType="prop" size={0.9} ground />
    </group>
  );
};
