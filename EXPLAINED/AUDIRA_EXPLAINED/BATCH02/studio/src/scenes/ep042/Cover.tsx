// EP042 cover (LIDARFORGE): a LiDAR point-cloud river basin seen from above the city, looking up the
// valley to storm-covered headwaters. Rain falls on the peaks, a swollen pulse of water runs down the
// channel as moving dots, and three water-level stations (weir + staff gauge) light up in sequence.
// Deterministic: geometry from fixed functions/hashes, motion only from useCurrentFrame().

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { loadFont as loadTitle } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import {
  CITY_Z, POSTS, POST_NAMES, X0, X1, Z0, Z1, clamp, fbm, hash, height, riverPoint, riverX, upstream,
} from "./valley";

export const { fontFamily: TITLE } = loadTitle("normal", { weights: ["300", "500", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const PAL = {
  void: "#04070a",
  bedrock: "#1e3a8a",
  ground: "#059669",
  veg: "#10b981",
  ridge: "#f59e0b",
  peak: "#ef4444",
  laser: "#00f0ff",
  water: "#38bdf8",
  amber: "#ffb703",
  coral: "#ff5a4e",
  white: "#f1f5f9",
  storm: "#8796ad",
};

// ---------- camera ----------
export const CAM_POS = new THREE.Vector3(3.2, 30, 30);
export const CAM_TGT = new THREE.Vector3(-0.4, 6.2, -2.5);
export const FOV = 50;

const Rig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(CAM_POS);
    c.fov = FOV;
    c.near = 0.1;
    c.far = 120;
    c.lookAt(CAM_TGT);
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const makeProjector = (w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 120);
  cam.position.copy(CAM_POS);
  cam.lookAt(CAM_TGT);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (p: [number, number, number]) => {
    const v = new THREE.Vector3(...p).project(cam);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };
};

// ---------- round-dot point material ----------
const dotMaterial = (size: number, opts: { additive?: boolean; fogNear?: number; fogFar?: number } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: !opts.additive,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uSize: { value: size },
      uScanZ: { value: 0 },
      uFogNear: { value: opts.fogNear ?? 14 },
      uFogFar: { value: opts.fogFar ?? 34 },
      uFog: { value: new THREE.Color(PAL.void) },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float psize;
      uniform float uSize; uniform float uScanZ; uniform float uFogNear; uniform float uFogFar; uniform vec3 uFog;
      varying vec3 vCol; varying float vFade;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = -mv.z;
        float fog = smoothstep(uFogNear, uFogFar, dist);
        float scan = exp(-pow((position.z - uScanZ) / 0.05, 2.0));
        vec3 c = mix(color, vec3(0.0, 0.94, 1.0), scan * 0.7);
        vCol = mix(c, uFog, fog * 0.6);
        vFade = 1.0 - fog * 0.55;
        gl_PointSize = uSize * psize * (1.0 + scan * 0.6) * (3900.0 / dist);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vFade;
      void main(){
        vec2 q = gl_PointCoord - 0.5;
        float r = length(q);
        if (r > 0.5) discard;
        float a = smoothstep(0.5, 0.32, r) * vFade;
        gl_FragColor = vec4(vCol, a);
      }`,
  });

export type Cloud = { pos: number[]; col: number[]; size: number[] };
export const push = (c: Cloud, p: [number, number, number], col: THREE.Color, s = 1) => {
  c.pos.push(...p);
  c.col.push(col.r, col.g, col.b);
  c.size.push(s);
};
export const toGeo = (c: Cloud) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(c.pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(c.col, 3));
  g.setAttribute("psize", new THREE.Float32BufferAttribute(c.size, 1));
  return g;
};

// elevation colormap: indigo valley floor -> emerald ground -> amber ridges -> coral peaks
export const RAMP = [PAL.bedrock, PAL.ground, PAL.veg, PAL.ridge, PAL.peak].map((h) => new THREE.Color(h));
const STOPS = [0, 0.22, 0.42, 0.72, 1];
export const elevColor = (t: number) => {
  t = clamp(t);
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (t <= STOPS[i + 1]) return RAMP[i].clone().lerp(RAMP[i + 1], (t - STOPS[i]) / (STOPS[i + 1] - STOPS[i]));
  }
  return RAMP[RAMP.length - 1].clone();
};
export const H_MAX = 9.5;

// ---------- terrain ----------
export const isCityBlock = (x: number, z: number) => z > CITY_Z && Math.abs(x - riverX(z)) > 0.75;

export const buildTerrain = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const NX = 210, NZ = 330;
  const L = new THREE.Vector3(-0.5, 0.75, 0.45).normalize();
  const water = new THREE.Color(PAL.water);
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NZ; j++) {
      const x = X0 + ((i + hash(i, j) * 0.8) / NX) * (X1 - X0);
      const z = Z0 + ((j + hash(j, i) * 0.8) / NZ) * (Z1 - Z0);
      // feather the survey edges so the parcel does not read as a cut box
      const edge = Math.min(x - X0, X1 - x, (z - Z0) * 0.7, (Z1 - z) * 1.5);
      if (edge < 1.2 && hash(i * 7.3, j * 1.9) > edge / 1.2 - 0.15 + fbm(x * 0.8, z * 0.8, 3) * 0.3) continue;
      const y = height(x, z);
      // shade with the local slope so the relief reads
      const e = 0.05;
      const nx = height(x - e, z) - height(x + e, z);
      const nz = height(x, z - e) - height(x, z + e);
      const n = new THREE.Vector3(nx, 2 * e, nz).normalize();
      const lam = Math.max(0, n.dot(L));
      const d = Math.abs(x - riverX(z));
      let col: THREE.Color;
      if (d < 0.16 + (1 - upstream(z)) * 0.14) {
        col = water.clone().multiplyScalar(0.55);
      } else {
        col = elevColor(y / H_MAX).multiplyScalar(0.55 + 0.75 * lam);
      }
      if (isCityBlock(x, z)) col.multiplyScalar(0.55);
      push(c, [x, y, z], col, 0.8 + hash(i * 3, j) * 0.35);
    }
  }
  return toGeo(c);
};

// city: building footprints sampled as roof grids and wall edges (LiDAR "building" class)
export const buildCity = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const warm = new THREE.Color("#ffe2b0");
  const cool = new THREE.Color("#c9d7ea");
  for (let a = 0; a < 46; a++) {
    for (let b = 0; b < 14; b++) {
      const x = X0 + 0.4 + a * 0.31 + (hash(a, b) - 0.5) * 0.08;
      const z = CITY_Z + 0.2 + b * 0.27 + (hash(b, a) - 0.5) * 0.06;
      if (!isCityBlock(x, z) || hash(a * 2.1, b * 5.3) < 0.18) continue;
      const w = 0.12 + hash(a, b * 3) * 0.1;
      const dpt = 0.12 + hash(a * 7, b) * 0.08;
      const core = Math.exp(-Math.pow((x - 0.6) / 3.2, 2));
      const hb = 0.12 + Math.pow(hash(a * 1.3, b * 2.7), 3) * (0.5 + core * 1.3);
      const g = height(x, z);
      const top = g + hb;
      const col = warm.clone().lerp(cool, hash(a, b * 11)).multiplyScalar(0.7 + 0.3 * (hb / 1.8));
      // roof
      for (let u = 0; u <= 4; u++) for (let v = 0; v <= 3; v++) push(c, [x - w / 2 + (u / 4) * w, top, z - dpt / 2 + (v / 3) * dpt], col, 0.8);
      // vertical edges
      const steps = Math.max(2, Math.round(hb / 0.05));
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        for (let k = 0; k < steps; k++) push(c, [x + (sx * w) / 2, g + (k / steps) * hb, z + (sz * dpt) / 2], col.clone().multiplyScalar(0.6), 0.7);
      }
    }
  }
  return toGeo(c);
};

// storm cell parked over the headwaters + rain curtains
export const CLOUD_C = new THREE.Vector3(-1.0, 10.6, -8.6);
const buildStorm = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const top = new THREE.Color("#93a3bb");
  const base = new THREE.Color("#161d29");
  // a cumulonimbus made of overlapping puffs, flat-ish dark base, bright billowing tops
  const puffs: [number, number, number, number][] = [];
  for (let p = 0; p < 22; p++) {
    const px = CLOUD_C.x + (hash(p, 11) * 2 - 1) * 4.8;
    const pz = CLOUD_C.z + (hash(p, 12) * 2 - 1) * 1.8;
    const r = 0.9 + hash(p, 13) * 1.1 * (1 - Math.abs(px - CLOUD_C.x) / 7);
    const py = CLOUD_C.y + r * 0.35 + hash(p, 14) * 0.6;
    puffs.push([px, py, pz, r]);
  }
  for (let k = 0; k < 30000; k++) {
    const [px, py, pz, r] = puffs[k % puffs.length];
    // random point on/in the puff surface shell
    const th = hash(k, 1) * Math.PI * 2, ph = Math.acos(hash(k, 2) * 2 - 1);
    const rr = r * (0.82 + hash(k, 3) * 0.18);
    const x = px + rr * Math.sin(ph) * Math.cos(th);
    let y = py + rr * Math.cos(ph) * 0.75;
    const z = pz + rr * Math.sin(ph) * Math.sin(th);
    const baseY = CLOUD_C.y - 0.5;
    if (y < baseY) y = baseY - hash(k, 5) * 0.15;
    const t = clamp((y - baseY) / 2.6);
    push(c, [x, y, z], base.clone().lerp(top, Math.pow(t, 0.8)), 1.0 + hash(k, 4) * 0.5);
  }
  return toGeo(c);
};

const buildRain = (f: number) => {
  const pos: number[] = [];
  for (let k = 0; k < 420; k++) {
    const x = CLOUD_C.x + (hash(k, 9) * 2 - 1) * 5.0;
    const z = CLOUD_C.z + (hash(k, 8) * 2 - 1) * 2.0 + 0.5;
    const yTop = CLOUD_C.y - 0.9;
    const yG = height(x, z);
    if (yG > yTop - 0.4) continue;
    const span = yTop - yG;
    const len = 0.9 + hash(k, 7) * 0.9;
    const ph = (hash(k, 6) + f * 0.05) % 1;
    const y0 = yTop - ph * span;
    pos.push(x, y0, z, x - 0.06, Math.max(yG, y0 - len), z + 0.02);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
};

// ---------- river flow ----------
export const FRONT_S = 0.58; // head of the flood pulse
const Flow: React.FC<{ f: number }> = ({ f }) => {
  const mat = useMemo(() => dotMaterial(0.05, { additive: true, fogNear: 45, fogFar: 80 }), []);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const N = 1500;
    const hot = new THREE.Color("#e8fbff");
    const cy = new THREE.Color(PAL.laser);
    const calm = new THREE.Color(PAL.water);
    for (let k = 0; k < N; k++) {
      const s = ((k / N + hash(k, 1) * 0.004 + f * 0.0016) % 1 + 1) % 1;
      const [x, y, z] = riverPoint(s);
      const lat = (hash(k, 2) - 0.5) * 0.22;
      // the pulse: dense, bright water behind the front, thin calm trickle ahead of it
      const behind = s < FRONT_S;
      if (!behind && hash(k, 3) > 0.35) continue;
      const head = Math.exp(-Math.pow((s - FRONT_S) / 0.03, 2));
      const dash = 0.55 + 0.45 * Math.sin((s * 90 - f * 0.35) * Math.PI);
      const col = behind ? cy.clone().lerp(hot, head * 0.3 + 0.1).multiplyScalar(0.6 + 0.4 * dash) : calm.clone().multiplyScalar(0.55);
      push(c, [x + lat, y + 0.06 + head * 0.12, z], col, behind ? 1.2 + head * 0.8 : 0.8);
    }
    return toGeo(c);
  }, [f]);
  return <points geometry={geo} material={mat} renderOrder={4} />;
};

// ---------- water-level stations ----------
export const STATION_COLS = [PAL.coral, PAL.amber, PAL.laser];

export const glowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const ctx = cv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(cv);
    return t;
  };
})();

export const stationTop = (i: number): [number, number, number] => {
  const [x, , z] = riverPoint(POSTS[i]);
  const px = x + 0.42;
  return [px, height(px, z) + 1.25, z];
};

const Station: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const [rx, , rz] = riverPoint(POSTS[i]);
  const color = STATION_COLS[i];
  // sequential ignition: upstream station first, the city one is just switching on
  const on = [1, 0.9, 0.55][i] * (0.85 + 0.15 * Math.sin(f * 0.12 - i * 1.6));
  const mat = useMemo(() => dotMaterial(0.05, { fogNear: 45, fogFar: 80 }), []);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const conc = new THREE.Color("#d9dee6");
    // weir: a low wall across the channel
    for (let u = 0; u <= 40; u++) {
      for (let v = 0; v <= 4; v++) {
        const x = rx - 0.55 + (u / 40) * 1.1;
        const g = Math.min(height(x, rz), height(rx, rz) + 0.25);
        push(c, [x, g + 0.05 + v * 0.035, rz], conc, 0.9);
      }
    }
    // staff gauge pole with red/white bands
    const px = rx + 0.42;
    const g0 = height(px, rz);
    const red = new THREE.Color(PAL.coral), wht = new THREE.Color("#ffffff");
    for (let k = 0; k <= 60; k++) {
      const y = g0 + (k / 60) * 1.2;
      const band = Math.floor(k / 6) % 2 === 0 ? red : wht;
      push(c, [px, y, rz], band, 1.15);
      push(c, [px + 0.03, y, rz], band, 1.15);
    }
    // tick marks
    for (let k = 0; k <= 10; k++) for (let u = 0; u < 4; u++) push(c, [px - 0.03 - u * 0.025, g0 + k * 0.12, rz], wht, 0.8);
    return toGeo(c);
  }, [rx, rz]);
  const top = stationTop(i);
  const tex = glowTex();
  const pulse = (f * 0.01 + i * 0.33) % 1;
  const gy = height(rx, rz) + 0.08;
  return (
    <group>
      <points geometry={geo} material={mat} renderOrder={3} />
      <mesh position={top}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite position={top} scale={[2.8 * on, 2.8 * on, 1]} renderOrder={8}>
        <spriteMaterial map={tex} color={color} transparent opacity={0.85 * on} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* thin beacon beam so each station reads from far away */}
      <mesh position={[top[0], top[1] + 1.4, top[2]]} renderOrder={7}>
        <cylinderGeometry args={[0.012, 0.03, 2.8, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.45 * on} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* ground ping ring */}
      <mesh position={[rx, gy, rz]} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + pulse * 1.4} renderOrder={6}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={(1 - pulse) * 0.7 * on} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- scene ----------
const World: React.FC<{ f: number }> = ({ f }) => {
  const terrainMat = useMemo(() => dotMaterial(0.05, { fogNear: 40, fogFar: 70 }), []);
  const cityMat = useMemo(() => dotMaterial(0.045, { fogNear: 40, fogFar: 70 }), []);
  const stormMat = useMemo(() => dotMaterial(0.05, { fogNear: 45, fogFar: 80 }), []);
  const terrain = useMemo(buildTerrain, []);
  const city = useMemo(buildCity, []);
  const storm = useMemo(buildStorm, []);
  const rain = useMemo(() => buildRain(f), [f]);
  // laser scan front drifting up the valley
  const scanZ = -99 + f * 0; // laser sweep is reserved for the film; the cover stays clean
  terrainMat.uniforms.uScanZ.value = scanZ;
  cityMat.uniforms.uScanZ.value = -99;
  stormMat.uniforms.uScanZ.value = -99;
  return (
    <>
      <points geometry={terrain} material={terrainMat} />
      <points geometry={city} material={cityMat} />
      <points geometry={storm} material={stormMat} renderOrder={2} />
      <lineSegments geometry={rain} renderOrder={2}>
        <lineBasicMaterial color="#a9c6e8" transparent opacity={0.4} depthWrite={false} />
      </lineSegments>
      <Flow f={f} />
      {POSTS.map((_, i) => (
        <Station key={i} i={i} f={f} />
      ))}
    </>
  );
};

// ---------- overlay ----------
export const mono = (size: number, color = PAL.white, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  color,
  letterSpacing: size * 0.16,
  fontWeight: 700,
  textTransform: "uppercase",
  ...extra,
});

const Tag: React.FC<{ x: number; y: number; label: string; color: string; dy?: number; align?: "left" | "right"; small?: boolean }> = ({ x, y, label, color, dy = -70, align = "left", small }) => (
  <>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={x} y1={y} x2={x} y2={y + dy} stroke={color} strokeWidth={2} />
      <circle cx={x} cy={y} r={5} fill={color} />
    </svg>
    <div
      style={{
        position: "absolute",
        top: y + dy - (small ? 30 : 40),
        left: align === "left" ? x - 2 : undefined,
        right: align === "right" ? 1080 - x - 2 : undefined,
        ...mono(small ? 19 : 26, color, { padding: "4px 12px", background: "rgba(4,7,10,0.72)", borderLeft: align === "left" ? `3px solid ${color}` : undefined, borderRight: align === "right" ? `3px solid ${color}` : undefined }),
      }}
    >
      {label}
    </div>
  </>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height: H } = useVideoConfig();
  const f = (frame / fps) * 60;
  const project = useMemo(() => makeProjector(width, H), [width, H]);

  const pHulu = project([CLOUD_C.x - 3.2, CLOUD_C.y + 0.6, CLOUD_C.z]);
  const pKota = project([5.2, height(5.2, CITY_Z + 1.4) + 0.6, CITY_Z + 1.4]);
  const pPosts = POSTS.map((_, i) => project(stationTop(i)));
  return (
    <AbsoluteFill style={{ background: PAL.void }}>
      {/* background: storm sky over the headwaters, darker toward the plain */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b121c 0%, #121b28 18%, #0a1018 34%, #04070a 60%)" }} />
      <ThreeCanvas width={width} height={H} gl={{ antialias: true, alpha: true }}>
        <Rig />
        <World f={f} />
      </ThreeCanvas>

      {/* clear weather over the city: warm low glow behind the lowland */}
      <div style={{ position: "absolute", left: pKota.x - 700, top: pKota.y - 200, width: 1000, height: 520, background: "radial-gradient(ellipse at center, rgba(255,190,110,0.16) 0%, rgba(255,190,110,0) 65%)" }} />
      {/* foreground: vignette + bottom fade for the title */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(4,7,10,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,7,10,0.85) 8%, rgba(4,7,10,0) 26%, rgba(4,7,10,0) 74%, rgba(4,7,10,0.9) 84%, #04070a 100%)" }} />

      <Tag x={pHulu.x} y={pHulu.y} dy={-50} label="Hulu" color={PAL.white} align="right" />
      <Tag x={pKota.x} y={pKota.y} dy={-60} label="Kota" color={PAL.laser} />
      {pPosts.map((p, i) => (
        <Tag key={i} x={p.x} y={p.y} dy={-40 - i * 10} label={POST_NAMES[i]} color={STATION_COLS[i]} align={i === 1 ? "left" : "right"} small />
      ))}

      {/* title block (top safe zone, over the storm sky) */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={mono(26, PAL.amber, { letterSpacing: 8 })}>AUDIRA EXPLAINED</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={mono(14, PAL.white, { opacity: 0.7 })}>Rendah</div>
            <div style={{ width: 90, height: 8, background: `linear-gradient(90deg, ${PAL.bedrock}, ${PAL.ground}, ${PAL.ridge}, ${PAL.peak})` }} />
            <div style={mono(14, PAL.white, { opacity: 0.7 })}>Tinggi</div>
          </div>
        </div>
        <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 132, lineHeight: 0.95, color: PAL.white, letterSpacing: -2 }}>
          Banjir Datang
          <br />
          dari <span style={{ color: PAL.laser }}>Hulu?</span>
        </div>
      </div>

    </AbsoluteFill>
  );
};
