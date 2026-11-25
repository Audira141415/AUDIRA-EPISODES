// EP042 film (LIDARFORGE): "Banjir kiriman bisa diprediksi sebelum sampai ke kota?"
// One continuous survey-drone flight over the point-cloud Ciliwung basin built for the cover.
// Every beat is keyed to timeline.json (Audio Master Clock); no audio is placed here.
// Deterministic: geometry from fixed hashes, all motion from useCurrentFrame().

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import TL from "./timeline.json";
import { Outro } from "../_shared/Outro";
import { CITY_Z, POSTS, POST_NAMES, clamp, hash, height, riverPoint } from "./valley";
import {
  CLOUD_C, Cloud, MONO, PAL, TITLE, buildCity, buildTerrain, glowTex, push, toGeo,
} from "./Cover";

// ---------- timing (all from the VO clock) ----------
type Word = { w: string; s: number; e: number };
type Clip = { section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
export const TOTAL = TL.total as number;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** start time of the first word in clip `c` that begins with `p` (n-th match) */
const W = (c: number, p: string, n = 0) => {
  const hits = CLIPS[c].words.filter((w) => norm(w.w).startsWith(p));
  return (hits[n] ?? CLIPS[c].words[0]).s;
};
const C = (c: number) => CLIPS[c].start;

const T = {
  hulu: W(1, "hulu"),
  banjir: W(2, "banjir"),
  ciliwung: W(3, "ciliwung"),
  berjam: W(3, "berjam"),
  pos: W(4, "pos"),
  katulampa: W(5, "katulampa"),
  depok: W(5, "depok"),
  manggarai: W(5, "manggarai"),
  siaga4: W(6, "empat"),
  siaga1: W(6, "satu"),
  data: C(7),
  hulu2: W(7, "hulu"),
  naik: W(8, "naik"),
  enam: W(8, "enam"),
  pompa: W(9, "pompa"),
  petugas: W(9, "petugas"),
  sirene: W(9, "sirene"),
  kanal: W(9, "kanal"),
  titik: W(10, "titik"),
  keran: W(10, "keran"),
  hujanJkt: C(11),
  genangan: W(11, "genangan"),
  diperkirakan: W(12, "diperkirakan"),
  dipastikan: W(12, "dipastikan"),
  tanya: C(13),
};
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

const ss = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type V3 = [number, number, number];
const lv = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------- story state ----------
/** Head of the flood pulse along the river (0 = hulu, 1 = city). */
const frontS = (t: number) => {
  if (t < SEC.KONTEKS[0]) return lerp(0, 0.05, ss(T.hulu, SEC.KONTEKS[0], t));
  if (t < SEC.MEKANISME[0]) return lerp(0.05, 0.16, ss(SEC.KONTEKS[0], SEC.KONTEKS[1], t));
  if (t < T.naik) return 0.16 + 0.015 * ss(SEC.MEKANISME[0], T.naik, t);
  if (t < CLIPS[9].start) return lerp(0.175, 0.5, ss(T.naik, CLIPS[9].start, t));
  return lerp(0.5, 0.83, ss(CLIPS[9].start, SEC.REVEAL[1], t));
};
const SIAGA = ["#22c55e", "#facc15", "#fb923c", "#ef4444"]; // Siaga 4, 3, 2, 1
const SIAGA_NAME = ["Siaga 4", "Siaga 3", "Siaga 2", "Siaga 1"];
/** water level on station i's gauge (0..1) */
const gaugeLevel = (i: number, t: number) => {
  const fs = frontS(t);
  const passed = ss(POSTS[i] - 0.06, POSTS[i] + 0.04, fs);
  const base = 0.12 + passed * 0.5;
  // Katulampa climbs further right after "naik"
  return i === 0 ? base + 0.2 * ss(T.naik, T.naik + 2.2, t) : base;
};
const levelIdx = (lvl: number) => (lvl < 0.3 ? 0 : lvl < 0.5 ? 1 : lvl < 0.7 ? 2 : 3);

// ---------- dots ----------
const dotMat = (size: number, H: number, opts: { additive?: boolean; fogNear?: number; fogFar?: number } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: !opts.additive,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uSize: { value: size },
      uPx: { value: 3900 * (H / 1920) },
      uMax: { value: 15 * (H / 1920) },
      uScanZ: { value: -99 },
      uFogNear: { value: opts.fogNear ?? 40 },
      uFogFar: { value: opts.fogFar ?? 70 },
      uFog: { value: new THREE.Color(PAL.void) },
    },
    vertexShader: `
      attribute vec3 color; attribute float psize;
      uniform float uSize; uniform float uPx; uniform float uMax; uniform float uScanZ;
      uniform float uFogNear; uniform float uFogFar; uniform vec3 uFog;
      varying vec3 vCol; varying float vFade;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = -mv.z;
        float fog = smoothstep(uFogNear, uFogFar, dist);
        float scan = exp(-pow((position.z - uScanZ) / 0.12, 2.0));
        float trail = (position.z > uScanZ ? 1.0 : 0.0) * exp(-(position.z - uScanZ) / 0.9) * 0.35;
        vec3 c = mix(color, vec3(0.0, 0.94, 1.0), clamp(scan * 0.85 + trail, 0.0, 1.0));
        vCol = mix(c, uFog, fog * 0.6);
        vFade = 1.0 - fog * 0.55;
        gl_PointSize = min(uMax, uSize * psize * (1.0 + scan * 0.6) * (uPx / dist));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vFade;
      void main(){
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        gl_FragColor = vec4(vCol, smoothstep(0.5, 0.32, r) * vFade);
      }`,
  });

const boxPts = (c: Cloud, cx: number, y0: number, cz: number, w: number, h: number, d: number, col: THREE.Color, step = 0.035, s = 0.9) => {
  const nx = Math.max(2, Math.round(w / step)), ny = Math.max(2, Math.round(h / step)), nz = Math.max(2, Math.round(d / step));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) push(c, [cx - w / 2 + (i / nx) * w, y0 + h, cz - d / 2 + (k / nz) * d], col, s);
  for (let j = 0; j <= ny; j++) {
    const y = y0 + (j / ny) * h;
    const shade = col.clone().multiplyScalar(0.55 + 0.45 * (j / ny));
    for (let i = 0; i <= nx; i++) {
      push(c, [cx - w / 2 + (i / nx) * w, y, cz - d / 2], shade, s);
      push(c, [cx - w / 2 + (i / nx) * w, y, cz + d / 2], shade, s);
    }
    for (let k = 0; k <= nz; k++) {
      push(c, [cx - w / 2, y, cz - d / 2 + (k / nz) * d], shade, s);
      push(c, [cx + w / 2, y, cz - d / 2 + (k / nz) * d], shade, s);
    }
  }
};

const stormGeo = (center: V3, sx: number, n: number, seed: number) => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const top = new THREE.Color("#93a3bb"), base = new THREE.Color("#161d29");
  const puffs: [number, number, number, number][] = [];
  for (let p = 0; p < 22; p++) {
    const px = center[0] + (hash(p + seed, 11) * 2 - 1) * sx;
    const pz = center[2] + (hash(p + seed, 12) * 2 - 1) * 1.8;
    const r = 0.9 + hash(p + seed, 13) * 1.1 * (1 - Math.abs(px - center[0]) / (sx * 1.4));
    puffs.push([px, center[1] + r * 0.35 + hash(p + seed, 14) * 0.6, pz, r]);
  }
  for (let k = 0; k < n; k++) {
    const [px, py, pz, r] = puffs[k % puffs.length];
    const th = hash(k, 1 + seed) * Math.PI * 2, ph = Math.acos(hash(k, 2 + seed) * 2 - 1);
    const rr = r * (0.82 + hash(k, 3) * 0.18);
    const baseY = center[1] - 0.5;
    let y = py + rr * Math.cos(ph) * 0.75;
    if (y < baseY) y = baseY - hash(k, 5) * 0.15;
    push(c, [px + rr * Math.sin(ph) * Math.cos(th), y, pz + rr * Math.sin(ph) * Math.sin(th)], base.clone().lerp(top, Math.pow(clamp((y - baseY) / 2.6), 0.8)), 1 + hash(k, 4) * 0.5);
  }
  return toGeo(c);
};

const rainGeo = (center: V3, sx: number, sz: number, n: number, f: number, amount: number) => {
  const pos: number[] = [];
  for (let k = 0; k < n * amount; k++) {
    const x = center[0] + (hash(k, 9) * 2 - 1) * sx;
    const z = center[2] + (hash(k, 8) * 2 - 1) * sz + 0.4;
    const yTop = center[1] - 0.9, yG = height(x, z);
    if (yG > yTop - 0.4) continue;
    const span = yTop - yG, len = 0.9 + hash(k, 7) * 0.9;
    const y0 = yTop - ((hash(k, 6) + f * 0.05) % 1) * span;
    pos.push(x, y0, z, x - 0.06, Math.max(yG, y0 - len), z + 0.02);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
};

// city props (Manggarai side): pump house, warning tower, crew
const PUMP: V3 = (() => { const [x, , z] = riverPoint(0.93); return [x - 1.0, height(x - 1.0, z), z]; })();
const TOWER: V3 = (() => { const [x, , z] = riverPoint(0.9); return [x + 1.15, height(x + 1.15, z + 0.2), z + 0.2]; })();
const CREW: V3 = [PUMP[0] - 0.15, PUMP[1], PUMP[2] + 0.5];
const CITY_C: V3 = [0.6, 0.2, CITY_Z + 1.6];

const propsGeo = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  // pump house: walls, pitched roof, door, louvres; pump unit + discharge pipe to the river
  const wall = new THREE.Color("#cbd5e1"), roof = new THREE.Color("#ea580c"), pipe = new THREE.Color("#60a5fa"), dark = new THREE.Color("#334155");
  const [hx, hy, hz] = PUMP;
  boxPts(c, hx, hy, hz, 0.6, 0.3, 0.42, wall, 0.025, 0.8);
  for (let i = 0; i <= 26; i++) for (let j = 0; j <= 10; j++) {
    const x = hx - 0.34 + (i / 26) * 0.68, q = j / 10;
    for (const sz of [-1, 1]) push(c, [x, hy + 0.3 + q * 0.16, hz + sz * (0.25 - q * 0.25)], roof.clone().multiplyScalar(0.75 + 0.25 * q), 0.85);
  }
  for (let i = 0; i <= 4; i++) for (let j = 0; j <= 8; j++) push(c, [hx - 0.05 + i * 0.025, hy + j * 0.024, hz + 0.215], dark, 0.8);
  for (let r = 0; r < 4; r++) for (let i = 0; i <= 8; i++) push(c, [hx + 0.12 + i * 0.016, hy + 0.17 + r * 0.025, hz + 0.215], dark, 0.6);
  // pump unit beside the house (horizontal drum)
  for (let a = 0; a < 24; a++) for (let l = 0; l <= 8; l++) {
    const ang = (a / 24) * Math.PI * 2;
    push(c, [hx + 0.42 + l * 0.02, hy + 0.09 + Math.cos(ang) * 0.07, hz - 0.05 + Math.sin(ang) * 0.07], new THREE.Color("#0ea5e9"), 0.8);
  }
  // discharge pipe: rises, crosses the bank, drops toward the river
  const [rvx] = riverPoint(0.93);
  const P0: V3 = [hx + 0.6, hy + 0.1, hz - 0.05];
  const P1: V3 = [hx + 0.75, hy + 0.32, hz - 0.05];
  const P2: V3 = [rvx - 0.25, hy + 0.32, hz - 0.05];
  const P3: V3 = [rvx - 0.12, height(rvx - 0.12, hz) + 0.08, hz - 0.05];
  const seg = (a: V3, b: V3) => {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.02);
    for (let k = 0; k <= n; k++) {
      const p = lv(a, b, k / n);
      for (let r = 0; r < 8; r++) {
        const ang = (r / 8) * Math.PI * 2;
        push(c, [p[0], p[1] + Math.cos(ang) * 0.035, p[2] + Math.sin(ang) * 0.035], pipe, 0.7);
      }
    }
  };
  seg(P0, P1);
  seg(P1, P2);
  seg(P2, P3);
  // warning tower: mast + 4 horns
  for (let k = 0; k < 70; k++) push(c, [TOWER[0], TOWER[1] + k * 0.014, TOWER[2]], new THREE.Color("#e2e8f0"), 1.0);
  for (let q = 0; q < 4; q++) {
    const a = (q * Math.PI) / 2;
    for (let k = 0; k < 8; k++) push(c, [TOWER[0] + Math.cos(a) * (0.03 + k * 0.012), TOWER[1] + 0.98, TOWER[2] + Math.sin(a) * (0.03 + k * 0.012)], new THREE.Color("#fbbf24"), 1.2);
  }
  return toGeo(c);
};
const crewGeo = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const vest = new THREE.Color("#fb923c"), refl = new THREE.Color("#fef08a"), legs = new THREE.Color("#1e3a8a"), helm = new THREE.Color("#ffffff"), skin = new THREE.Color("#c08a64");
  for (let m = 0; m < 3; m++) {
    const x = CREW[0] + m * 0.2, z = CREW[2] + (m % 2) * 0.12;
    for (let k = 0; k < 360; k++) {
      const y = hash(k, m) * 0.3, a = hash(m, k) * Math.PI * 2;
      const r = y > 0.25 ? 0.03 : y > 0.21 ? 0.026 : y > 0.11 ? 0.042 : 0.03;
      const col = y > 0.255 ? helm : y > 0.21 ? skin : y > 0.11 ? (y > 0.15 && y < 0.17 ? refl : vest) : legs;
      const lx = y < 0.11 ? (hash(k, 9) > 0.5 ? 0.02 : -0.02) : 0;
      push(c, [x + lx + Math.cos(a) * r, CREW[1] + y, z + Math.sin(a) * r], col, 0.75);
    }
  }
  return toGeo(c);
};

// puddles in city streets (rain in Jakarta itself)
const puddleGeo = () => {
  const c: Cloud = { pos: [], col: [], size: [] };
  const centers = Array.from({ length: 9 }, (_, i) => [-5 + hash(i, 31) * 10, CITY_Z + 0.4 + hash(i, 32) * 2.4] as [number, number]);
  for (let k = 0; k < 6000; k++) {
    const [cx, cz] = centers[k % centers.length];
    const a = hash(k, 33) * Math.PI * 2, r = Math.sqrt(hash(k, 34)) * (0.35 + hash(k % 9, 35) * 0.3);
    const x = cx + Math.cos(a) * r * 1.4, z = cz + Math.sin(a) * r;
    push(c, [x, height(x, z) + 0.02, z], new THREE.Color(PAL.water), 0.8 + r);
  }
  return toGeo(c);
};

// ---------- moving water ----------
const Flow: React.FC<{ f: number; t: number; H: number }> = ({ f, t, H }) => {
  const mat = useMemo(() => dotMat(0.05, H, { additive: true, fogNear: 45, fogFar: 80 }), [H]);
  const front = frontS(t);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const N = 2200;
    const hot = new THREE.Color("#e8fbff"), cy = new THREE.Color(PAL.laser), calm = new THREE.Color(PAL.water);
    for (let k = 0; k < N; k++) {
      const s = ((k / N + hash(k, 1) * 0.004 + f * 0.0016) % 1 + 1) % 1;
      const [x, y, z] = riverPoint(s);
      const behind = s < front;
      if (!behind && hash(k, 3) > 0.35) continue;
      const head = Math.exp(-Math.pow((s - front) / 0.025, 2));
      const dash = 0.55 + 0.45 * Math.sin((s * 90 - f * 0.35) * Math.PI);
      const col = behind ? cy.clone().lerp(hot, head * 0.3 + 0.1).multiplyScalar(0.6 + 0.4 * dash) : calm.clone().multiplyScalar(0.5);
      push(c, [x + (hash(k, 2) - 0.5) * 0.22, y + 0.06 + head * 0.1, z], col, behind ? 1.2 + head * 0.8 : 0.8);
    }
    return toGeo(c);
  }, [f, front]);
  return <points geometry={geo} material={mat} renderOrder={4} />;
};

// data packets: gauge readings reach the city long before the water does
const DATA_A = (): V3 => stationTopV(0);
const DATA_B: V3 = [CITY_C[0], CITY_C[1] + 1.4, CITY_C[2]];
const arcPt = (u: number): V3 => {
  const a = DATA_A(), b = DATA_B;
  const m: V3 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 3.2, (a[2] + b[2]) / 2];
  const p = lv(lv(a, m, u), lv(m, b, u), u);
  return p;
};
const DataArc: React.FC<{ t: number; H: number }> = ({ t, H }) => {
  const on = ss(T.data - 0.3, T.data + 0.6, t) * (1 - ss(SEC.REVEAL[0] + 1, SEC.REVEAL[0] + 2, t));
  const mat = useMemo(() => dotMat(0.06, H, { additive: true, fogNear: 60, fogFar: 90 }), [H]);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const grow = ss(T.data, T.data + 1.4, t);
    for (let k = 0; k <= 220; k++) {
      const u = k / 220;
      if (u > grow) break;
      const pk = Math.exp(-Math.pow(((u - ((t - T.data) * 0.55) % 1) + 1) % 1 / 0.03, 2));
      push(c, arcPt(u), new THREE.Color(PAL.amber).multiplyScalar(0.45 + 0.9 * pk), 0.9 + pk * 1.6);
    }
    return toGeo(c);
  }, [t]);
  if (on <= 0.01) return null;
  return <points geometry={geo} material={mat} renderOrder={9} />;
};

// ---------- water-level stations ----------
const stationBase = (i: number): V3 => {
  const [x, , z] = riverPoint(POSTS[i]);
  return [x + 0.66, Math.min(height(x + 0.66, z - 0.12), height(x, z) + 0.3), z - 0.12];
};
const WEIR_W = 1.1, CREST_H = 0.24;
const weirC = (i: number): V3 => {
  const [x, , z] = riverPoint(POSTS[i]);
  return [x + 0.3, height(x, z) + 0.15, z];
};
const stationTopV = (i: number): V3 => add(stationBase(i), [0, 1.25, 0]);

const Spill: React.FC<{ rx: number; rz: number; f: number; H: number }> = ({ rx, rz, f, H }) => {
  const mat = useMemo(() => dotMat(0.045, H, { additive: true, fogNear: 45, fogFar: 80 }), [H]);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const g0 = height(rx, rz) - 0.05;
    const cy = new THREE.Color(PAL.water), hot = new THREE.Color("#e0f7ff");
    for (let k = 0; k < 520; k++) {
      const x = rx - WEIR_W / 2 + 0.03 + hash(k, 71) * (WEIR_W - 0.06);
      const q = (hash(k, 72) + f * 0.012) % 1;
      const y = g0 + CREST_H * (1 - Math.pow(q, 1.5)) + 0.025;
      push(c, [x, y, rz + q * 0.42 + 0.01], cy.clone().lerp(hot, 1 - q).multiplyScalar(0.7), 0.9);
    }
    return toGeo(c);
  }, [rx, rz, f]);
  return <points geometry={geo} material={mat} renderOrder={5} />;
};

// survey marker board planted on the Katulampa bank: the AUDIRA survey crew's ground-control sign
const signTex = (() => {
  let tx: THREE.CanvasTexture | null = null;
  return () => {
    if (tx) return tx;
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 192;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#0b1118";
    g.fillRect(0, 0, 512, 192);
    g.strokeStyle = PAL.laser;
    g.lineWidth = 8;
    g.strokeRect(6, 6, 500, 180);
    g.fillStyle = PAL.laser;
    g.font = `700 76px ${TITLE}, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 80);
    g.fillStyle = PAL.amber;
    g.font = `700 30px ${MONO}, monospace`;
    g.fillText("TITIK SURVEI LIDAR", 256, 148);
    tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return tx;
  };
})();
// plang mounted on the downstream rail of the Katulampa service bridge, facing the river
export const SIGN_POS: V3 = (() => {
  const [x, , z] = riverPoint(POSTS[0]);
  return [x + 0.05, height(x, z) - 0.05 + CREST_H + 0.36, z + 0.1];
})();
const SurveySign: React.FC = () => {
  const tex = signTex();
  return (
    <mesh position={SIGN_POS} renderOrder={6}>
      <planeGeometry args={[0.52, 0.195]} />
      <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Station: React.FC<{ i: number; t: number; f: number; H: number }> = ({ i, t, f, H }) => {
  const [rx, , rz] = riverPoint(POSTS[i]);
  const lvl = gaugeLevel(i, t);
  const li = levelIdx(lvl);
  const color = SIAGA[li];
  // stations switch on one by one as their names are spoken, all on afterwards
  const named = [T.katulampa, T.depok, T.manggarai][i];
  const on = Math.max(ss(named - 0.2, named + 0.4, t), t < T.pos ? 0.35 : 0.5) * (0.85 + 0.15 * Math.sin(f * 0.12 - i * 1.6));
  const mat = useMemo(() => dotMat(0.05, H, { fogNear: 45, fogFar: 80 }), [H]);
  const geo = useMemo(() => {
    const c: Cloud = { pos: [], col: [], size: [] };
    const conc = new THREE.Color("#d6d3cc"), steel = new THREE.Color("#5b7a99"), rail = new THREE.Color("#fde68a");
    const g0 = height(rx, rz) - 0.05;
    // mercu: vertical upstream face, rounded crest, sloping downstream apron
    for (let u = 0; u <= 70; u++) {
      const x = rx - WEIR_W / 2 + (u / 70) * WEIR_W;
      for (let v = 0; v <= 5; v++) push(c, [x, g0 + (v / 5) * CREST_H, rz - 0.02], conc.clone().multiplyScalar(0.6 + 0.08 * v), 0.8);
      for (let v = 0; v <= 14; v++) {
        const q = v / 14;
        push(c, [x, g0 + CREST_H * (1 - Math.pow(q, 1.5)), rz + q * 0.42], conc.clone().multiplyScalar(1.0 - q * 0.35), 0.8);
      }
    }
    // abutment walls on both banks
    for (const sx of [-1, 1]) boxPts(c, rx + sx * (WEIR_W / 2 + 0.08), g0, rz + 0.1, 0.16, CREST_H + 0.22, 0.75, conc, 0.028, 0.75);
    // sluice gates on the right bank: piers, steel leaves, service bridge with rails
    const gx0 = rx + WEIR_W / 2 + 0.2;
    for (let gI = 0; gI < 3; gI++) {
      const cx = gx0 + gI * 0.17;
      boxPts(c, cx - 0.085, g0, rz, 0.035, CREST_H + 0.28, 0.2, conc, 0.02, 0.7);
      for (let u = 0; u <= 6; u++) for (let v = 0; v <= 8; v++) push(c, [cx - 0.06 + u * 0.02, g0 + 0.06 + v * 0.025, rz - 0.06], steel.clone().multiplyScalar(0.8 + 0.2 * (v % 2)), 0.8);
    }
    boxPts(c, gx0 + 0.425, g0, rz, 0.035, CREST_H + 0.28, 0.2, conc, 0.02, 0.7);
    for (let u = 0; u <= 40; u++) {
      const x = rx - WEIR_W / 2 - 0.1 + (u / 40) * (WEIR_W + 0.85);
      push(c, [x, g0 + CREST_H + 0.28, rz - 0.08], conc, 0.8);
      push(c, [x, g0 + CREST_H + 0.28, rz + 0.08], conc, 0.8);
      push(c, [x, g0 + CREST_H + 0.4, rz - 0.08], rail, 0.6);
      push(c, [x, g0 + CREST_H + 0.4, rz + 0.08], rail, 0.6);
    }
    // staff gauge (papan duga) on the abutment: red/white bands with ticks
    const sb = stationBase(i);
    const red = new THREE.Color(PAL.coral), wht = new THREE.Color("#ffffff");
    for (let kk = 0; kk <= 90; kk++) {
      const y = sb[1] + (kk / 90) * 1.2, band = Math.floor(kk / 9) % 2 === 0 ? red : wht;
      for (let w = 0; w < 3; w++) push(c, [sb[0] + w * 0.022, y, sb[2]], band, 1.15);
    }
    for (let kk = 0; kk <= 10; kk++) for (let u = 0; u < 4; u++) push(c, [sb[0] - 0.03 - u * 0.022, sb[1] + kk * 0.12, sb[2]], wht, 0.7);
    return toGeo(c);
  }, [rx, rz, H]);
  const top = stationTopV(i);
  const tex = glowTex();
  const pulse = (f * 0.01 + i * 0.33) % 1;
  const base = stationBase(i);
  const wy = base[1] + lvl * 1.2;
  return (
    <group>
      <points geometry={geo} material={mat} renderOrder={3} />
      {/* water line on the staff gauge */}
      <mesh position={[base[0], wy, base[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
        <ringGeometry args={[0.03, 0.16, 32]} />
        <meshBasicMaterial color={PAL.laser} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={top}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite position={top} scale={[1.3 * on, 1.3 * on, 1]} renderOrder={8}>
        <spriteMaterial map={tex} color={color} transparent opacity={0.7 * on} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <Spill rx={rx} rz={rz} f={f} H={H} />
      <mesh position={[top[0], top[1] + 0.5, top[2]]} renderOrder={7}>
        <cylinderGeometry args={[0.01, 0.025, 1.0, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.28 * on * (1 - 0.85 * ss(CLIPS[9].start - 0.6, CLIPS[9].start, t) * (1 - ss(SEC.PAYOFF[0] - 0.3, SEC.PAYOFF[0], t)))} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[rx, height(rx, rz) + 0.08, rz]} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + pulse * 1.4} renderOrder={6}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={(1 - pulse) * 0.7 * on} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- camera: shots blended into one continuous drone flight ----------
type Pose = { p: V3; q: V3; fov: number };
type Shot = { a: number; blend: number; pose: (t: number) => Pose };
const OVER: Pose = { p: [3.2, 30, 30], q: [-0.4, 6.2, -2.5], fov: 50 };
const u = (a: number, b: number, t: number) => ss(a, b, t);
const orbit = (c: V3, r: number, h: number, ang: number, look: V3 = [0, 0, 0]): Pose => ({
  p: [c[0] + Math.sin(ang) * r, c[1] + h, c[2] + Math.cos(ang) * r],
  q: add(c, look),
  fov: 42,
});
const RISE_END = SEC.HOOK[1] + 0.5;
const SHOTS: Shot[] = [
  // 1 city under clear sky, low skyline glide
  { a: 0, blend: 0, pose: (t) => ({ p: lv([3.6, 1.2, 15.0], [2.6, 1.5, 13.6], u(0, 2.6, t)), q: lv([0.6, 2.6, 2.0], [0.2, 2.8, 0.5], u(0, 2.6, t)), fov: 42 }) },
  // 2 crane up and look upstream: rain on the headwaters
  { a: CLIPS[1].start - 0.3, blend: 1.8, pose: (t) => ({ p: lv([1.6, 4.5, 12.8], [0.6, 8.5, 8.0], u(CLIPS[1].start, RISE_END, t)), q: lv([-0.6, 5.0, -6.5], [-0.9, 6.8, -8.2], u(CLIPS[1].start, RISE_END, t)), fov: 46 }) },
  // 3 survey overview: "inilah banjir kiriman"
  { a: SEC.KONTEKS[0] - 0.3, blend: 1.1, pose: (t) => ({ p: lv([2.6, 25, 25], OVER.p, u(SEC.KONTEKS[0], CLIPS[3].start, t)), q: OVER.q, fov: OVER.fov }) },
  // 4 track the head of the water from the mountains to Katulampa
  { a: CLIPS[3].start - 0.2, blend: 1.3, pose: (t) => { const P = riverPoint(frontS(t)); return { p: add(P, [3.0, 4.2, 5.6]), q: add(P, [0, 0.2, -0.8]), fov: 44 }; } },
  // 5 orbit the first station
  { a: SEC.MEKANISME[0] - 0.2, blend: 1.2, pose: (t) => orbit(weirC(0), 3.8, 2.0, lerp(0.3, 0.7, u(SEC.MEKANISME[0], CLIPS[5].start, t)), [0, 0.5, 0]) },
  // 6 glide down the river station by station as they are named
  { a: T.katulampa - 0.4, blend: 1.0, pose: (t) => {
      const s = t < T.depok ? lerp(POSTS[0], POSTS[1], u(T.katulampa + 0.3, T.depok, t)) : lerp(POSTS[1], POSTS[2], u(T.depok + 0.3, T.manggarai, t));
      const P = riverPoint(s);
      return { p: add(P, [3.4, 4.6, 6.0]), q: add(P, [0, 0.6, -0.5]), fov: 44 };
    } },
  // 7 close on the Manggarai gauge for the Siaga ladder
  { a: CLIPS[6].start - 0.3, blend: 1.0, pose: (t) => orbit(weirC(2), 3.6, 1.5, lerp(0.55, 0.3, u(CLIPS[6].start, CLIPS[7].start, t)), [-0.5, 0.5, 0]) },
  // 8 rise high: the reading travels to the city before the water
  { a: CLIPS[7].start - 0.2, blend: 1.4, pose: (t) => ({ p: lv([6.5, 16, 20], [7.5, 19, 18], u(CLIPS[7].start, SEC.MEKANISME[1], t)), q: [-0.4, 3.5, -1.0], fov: 50 }) },
  // 9 Katulampa reading rises
  { a: SEC.REVEAL[0] - 0.2, blend: 1.3, pose: (t) => orbit(weirC(0), 3.6, 1.6, lerp(0.15, 0.45, u(SEC.REVEAL[0], T.enam, t)), [0, 0.55, 0]) },
  // 10 the long side view: water runs, the 6-9 hour window
  { a: T.enam - 0.9, blend: 1.4, pose: (t) => ({ p: lv([13, 13, 3.0], [13.5, 12.5, 1.0], u(T.enam, CLIPS[9].start, t)), q: [-0.5, 1.6, -0.6], fov: 50 }) },
  // 11 the city uses the time: pump, crew, sirens, alerts
  { a: CLIPS[9].start - 0.2, blend: 1.4, pose: (t) => orbit(lv(PUMP, TOWER, 0.5), 4.6, 2.6, lerp(0.75, 1.25, u(CLIPS[9].start, SEC.REVEAL[1], t)), [0, 0.4, 0]) },
  // 12 back to Katulampa: a measuring point, not a tap
  { a: SEC.PAYOFF[0] - 0.25, blend: 0, pose: (t) => orbit(weirC(0), 3.2, 1.2, lerp(-0.15, 0.2, u(SEC.PAYOFF[0], CLIPS[11].start, t)), [0, 0.45, 0]) },
  // 13 rain over Jakarta itself, puddles in the streets
  { a: CLIPS[11].start - 0.25, blend: 0, pose: (t) => ({ p: lv([4.5, 4.6, 13.5], [3.6, 5.2, 12.2], u(CLIPS[11].start, SEC.PAYOFF[1] + 0.5, t)), q: [0.2, 1.2, CITY_Z + 0.8], fov: 46 }) },
  // 14 pull back to the whole basin
  { a: SEC.OUTRO[0] - 0.3, blend: 1.8, pose: (t) => ({ p: lv([3.4, 22, 24], [3.2, 32, 32], u(SEC.OUTRO[0], TOTAL, t)), q: OVER.q, fov: OVER.fov }) },
];
const CUTS = SHOTS.filter((s) => s.blend === 0 && s.a > 0).map((s) => s.a);

export const camAt = (t: number): Pose => {
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
  const cur = SHOTS[i].pose(t);
  const s = SHOTS[i];
  if (i === 0 || s.blend === 0 || t > s.a + s.blend) return cur;
  const prev = SHOTS[i - 1].pose(t);
  const k = ss(s.a, s.a + s.blend, t);
  return { p: lv(prev.p, cur.p, k), q: lv(prev.q, cur.q, k), fov: lerp(prev.fov, cur.fov, k) };
};

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.p);
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 140;
    c.lookAt(new THREE.Vector3(...pose.q));
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

const projector = (pose: Pose, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(pose.fov, w / h, 0.1, 140);
  cam.position.set(...pose.p);
  cam.lookAt(new THREE.Vector3(...pose.q));
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (p: V3) => {
    const v = new THREE.Vector3(...p).project(cam);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, vis: v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 };
  };
};

// ---------- 3D world ----------
const World: React.FC<{ t: number; f: number; H: number; pose: Pose }> = ({ t, f, H, pose }) => {
  const clearSky = 1 - ss(CLIPS[1].start, CLIPS[1].start + 1.6, t);
  // headwater rain only reads from far away; near the storm its streaks would slash across other shots
  const dStorm = Math.hypot(pose.p[0] - CLOUD_C.x, pose.p[1] - CLOUD_C.y, pose.p[2] - CLOUD_C.z);
  const rainVis = ss(11.5, 15, dStorm);
  const terrainMat = useMemo(() => dotMat(0.05, H), [H]);
  const cityMat = useMemo(() => dotMat(0.045, H), [H]);
  const stormMat = useMemo(() => dotMat(0.05, H, { fogNear: 45, fogFar: 80 }), [H]);
  const propMat = useMemo(() => dotMat(0.05, H), [H]);
  const puddleMat = useMemo(() => dotMat(0.05, H, { additive: true }), [H]);
  const terrain = useMemo(buildTerrain, []);
  const city = useMemo(buildCity, []);
  const storm = useMemo(() => stormGeo([CLOUD_C.x, CLOUD_C.y, CLOUD_C.z], 4.8, 30000, 0), []);
  const cityCloudC: V3 = [0.8, 6.6, CITY_Z + 1.2];
  const cityStorm = useMemo(() => stormGeo(cityCloudC, 4.2, 22000, 50), []);
  const props = useMemo(propsGeo, []);
  const crew = useMemo(crewGeo, []);
  const puddles = useMemo(puddleGeo, []);
  const rain = useMemo(() => rainGeo([CLOUD_C.x, CLOUD_C.y, CLOUD_C.z], 4, 1.6, 380, f, 1), [f]);
  const cityRainAmt = ss(CLIPS[11].start - 0.2, CLIPS[11].start + 1.2, t) * (1 - ss(SEC.OUTRO[0] + 1, SEC.OUTRO[0] + 2.5, t));
  const cityRain = useMemo(() => rainGeo(cityCloudC, 4.2, 1.8, 380, f, cityRainAmt), [f, cityRainAmt]);
  // laser sweeps: survey reveal at KONTEKS and on every hard cut
  let scanZ = -99;
  const sweep = (a: number, dur: number, z0: number, z1: number) => {
    if (t >= a && t <= a + dur) scanZ = lerp(z0, z1, (t - a) / dur);
  };
  sweep(SEC.KONTEKS[0] - 0.2, 2.2, 8.5, -10.5);
  sweep(SEC.OUTRO[0], 2.6, -10.5, 8.5);
  for (const c of CUTS) sweep(c, 1.2, 8.5, -10.5);
  terrainMat.uniforms.uScanZ.value = scanZ;
  cityMat.uniforms.uScanZ.value = scanZ;
  const cloudIn = ss(CLIPS[11].start - 0.4, CLIPS[11].start + 0.8, t) * (1 - ss(SEC.OUTRO[0] - 0.2, SEC.OUTRO[0] + 1.0, t));
  const puddleK = ss(CLIPS[11].start + 0.8, T.genangan + 0.8, t) * (1 - ss(SEC.OUTRO[0] + 1.5, SEC.OUTRO[0] + 3, t));
  puddleMat.uniforms.uSize.value = 0.05 * puddleK;
  const sirenK = ss(T.sirene - 0.2, T.sirene + 0.3, t) * (1 - ss(SEC.PAYOFF[0] - 0.4, SEC.PAYOFF[0], t));
  const pumpK = ss(T.pompa - 0.2, T.pompa + 0.4, t) * (1 - ss(SEC.PAYOFF[0] - 0.4, SEC.PAYOFF[0], t));
  const tex = glowTex();
  return (
    <>
      <Rig pose={pose} />
      <points geometry={terrain} material={terrainMat} />
      <points geometry={city} material={cityMat} />
      <points geometry={props} material={propMat} />
      {t > T.petugas - 0.3 && t < SEC.PAYOFF[0] ? <points geometry={crew} material={propMat} /> : null}
      <points geometry={storm} material={stormMat} renderOrder={2} />
      <lineSegments geometry={rain} renderOrder={2}>
        <lineBasicMaterial color="#a9c6e8" transparent opacity={(0.4 - 0.32 * clearSky) * rainVis} depthWrite={false} />
      </lineSegments>
      {cloudIn > 0.01 ? (
        <group position={[0, (1 - cloudIn) * 3, 0]}>
          <points geometry={cityStorm} material={stormMat} renderOrder={2} />
        </group>
      ) : null}
      {cityRainAmt > 0.01 ? (
        <lineSegments geometry={cityRain} renderOrder={2}>
          <lineBasicMaterial color="#a9c6e8" transparent opacity={0.45} depthWrite={false} />
        </lineSegments>
      ) : null}
      {puddleK > 0.01 ? <points geometry={puddles} material={puddleMat} renderOrder={4} /> : null}
      <Flow f={f} t={t} H={H} />
      {POSTS.map((_, i) => (
        <Station key={i} i={i} t={t} f={f} H={H} />
      ))}
      <SurveySign />
      <DataArc t={t} H={H} />
      {/* pump running: glow at the outlet */}
      <sprite position={[PUMP[0] + 0.95, PUMP[1] + 0.15, PUMP[2]]} scale={[1.4 * pumpK, 1.4 * pumpK, 1]} renderOrder={8}>
        <spriteMaterial map={tex} color={PAL.water} transparent opacity={0.8 * pumpK} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* siren sound rings */}
      {[0, 1, 2].map((k) => {
        const ph = (((t - T.sirene) * 0.8 + k / 3) % 1 + 1) % 1;
        return (
          <mesh key={k} position={[TOWER[0], TOWER[1] + 0.98, TOWER[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={0.1 + ph * 2.2} renderOrder={8}>
            <ringGeometry args={[0.92, 1, 64]} />
            <meshBasicMaterial color={PAL.amber} transparent opacity={(1 - ph) * 0.8 * sirenK} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- overlay ----------
const mono = (size: number, color: string = PAL.white, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  color,
  letterSpacing: size * 0.14,
  fontWeight: 700,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  ...extra,
});

const Tag: React.FC<{ x: number; y: number; label: string; color: string; k: number; o: number; dy?: number; right?: boolean; sub?: string }> = ({ x, y, label, color, k, o, dy = -60, right, sub }) => {
  if (o <= 0.01) return null;
  const W = 1080 * k;
  x = clamp(x, 70 * k, W - 70 * k);
  y = clamp(y, 260 * k, 1500 * k);
  if (!right && x > W - 330 * k) right = true;
  else if (right && x < 330 * k) right = false;
  const top = clamp(y + dy * k, 290 * k, 1480 * k);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={x} y1={y} x2={x} y2={top} stroke={color} strokeWidth={2 * k} />
        <circle cx={x} cy={y} r={5 * k} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: top - 34 * k,
          left: right ? undefined : x - 2 * k,
          right: right ? 1080 * k - x - 2 * k : undefined,
          padding: `${4 * k}px ${12 * k}px`,
          background: "rgba(4,7,10,0.78)",
          borderLeft: right ? undefined : `${3 * k}px solid ${color}`,
          borderRight: right ? `${3 * k}px solid ${color}` : undefined,
          textAlign: right ? "right" : "left",
        }}
      >
        <div style={mono(24 * k, color)}>{label}</div>
        {sub ? <div style={mono(16 * k, PAL.white, { opacity: 0.85, marginTop: 2 * k })}>{sub}</div> : null}
      </div>
    </div>
  );
};

// karaoke captions: survey-readout style, phrase of up to 5 words, active word in a cyan cell
const PHRASES = (() => {
  const out: { words: Word[]; a: number; b: number }[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const brk = /[,.?!]$/.test(w.w) || cur.length >= 5;
      if (brk || i === c.words.length - 1) {
        if (cur.length === 1 && out.length && out[out.length - 1].b > w.s - 0.05 && !/[.?!]$/.test(out[out.length - 1].words.at(-1)!.w)) {
          out[out.length - 1].words.push(w);
          out[out.length - 1].b = w.e;
        } else out.push({ words: cur, a: cur[0].s, b: cur[cur.length - 1].e });
        cur = [];
      }
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p, i) => t >= p.a - 0.12 && t < (PHRASES[i + 1]?.a ?? p.b + 0.5) - 0.12 && t < p.b + 0.5);
  if (!ph) return null;
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, bottom: 400 * k, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${8 * k}px ${10 * k}px` }}>
      {ph.words.map((w, i) => {
        const nxt = ph.words[i + 1];
        const active = t >= w.s - 0.03 && t < (nxt ? nxt.s - 0.03 : w.e + 0.15);
        const said = t >= w.e;
        const bounce = active ? 1 + 0.08 * Math.sin(clamp((t - w.s) / 0.18) * Math.PI) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: TITLE,
              fontWeight: 700,
              fontSize: 54 * k,
              lineHeight: 1.1,
              padding: `${2 * k}px ${10 * k}px`,
              color: active ? PAL.void : said ? PAL.white : "rgba(241,245,249,0.6)",
              background: active ? PAL.laser : "rgba(4,7,10,0.62)",
              transform: `scale(${bounce})`,
              display: "inline-block",
              boxShadow: active ? `0 0 ${18 * k}px rgba(0,240,255,0.55)` : undefined,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const SECTION_TAG: [string, string][] = [
  ["HOOK", "Hulu vs kota"],
  ["KONTEKS", "Banjir kiriman"],
  ["MEKANISME", "Pos pantau TMA"],
  ["REVEAL", "Jendela waktu"],
  ["PAYOFF", "Titik ukur"],
  ["OUTRO", "Perkiraan"],
];

const Hud: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  let idx = 0;
  SECTION_TAG.forEach(([s], i) => {
    if (t >= SEC[s][0] - 0.65) idx = i;
  });
  return (
    <div style={{ position: "absolute", top: 180 * k, left: 56 * k, right: 56 * k, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={mono(22 * k, PAL.laser)}>● Survei LiDAR // DAS Ciliwung</div>
      <div style={mono(22 * k, PAL.amber)}>{String(idx + 1).padStart(2, "0")} · {SECTION_TAG[idx][1]}</div>
    </div>
  );
};

const SiagaLadder: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = CLIPS[6].start - 0.2, b = CLIPS[7].start + 0.4;
  const o = ss(a, a + 0.4, t) * (1 - ss(b, b + 0.4, t));
  if (o <= 0.01) return null;
  // ladder fills from Siaga 4 (on "empat") to Siaga 1 (on "satu")
  return (
    <div style={{ position: "absolute", left: 56 * k, top: 290 * k, width: 560 * k, opacity: o, background: "rgba(4,7,10,0.9)", border: `${2 * k}px solid rgba(241,245,249,0.25)`, padding: `${18 * k}px ${20 * k}px`, display: "flex", flexDirection: "column", gap: 10 * k }}>
      <div style={mono(22 * k, PAL.white, { marginBottom: 4 * k })}>Ambang tinggi muka air</div>
      {[3, 2, 1, 0].map((i) => {
        const n = SIAGA_NAME[i];
        const at = lerp(T.siaga4, T.siaga1, i / 3);
        const on = ss(at - 0.1, at + 0.25, t);
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", height: 64 * k, padding: `0 ${16 * k}px`, background: on > 0.5 ? SIAGA[i] : `${SIAGA[i]}33`, border: `${3 * k}px solid ${SIAGA[i]}`, opacity: 0.7 + 0.3 * on, transform: `scale(${1 + 0.04 * Math.sin(clamp((t - at) / 0.3) * Math.PI)})`, transformOrigin: "left center", boxShadow: `0 0 ${24 * k * on}px ${SIAGA[i]}` }}>
            <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 46 * k, color: on > 0.5 ? PAL.void : PAL.white }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
};

const WindowBar: React.FC<{ t: number; k: number; pa: { x: number; y: number }; pb: { x: number; y: number } }> = ({ t, k, pa, pb }) => {
  const o = ss(T.enam - 0.3, T.enam + 0.3, t) * (1 - ss(CLIPS[9].start + 1.0, CLIPS[9].start + 1.5, t));
  if (o <= 0.01) return null;
  const grow = ss(T.enam - 0.3, T.enam + 1.0, t);
  const x2 = lerp(pa.x, pb.x, grow), y2 = lerp(pa.y, pb.y, grow);
  const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1={pa.x} y1={pa.y} x2={x2} y2={y2} stroke={PAL.amber} strokeWidth={5 * k} strokeDasharray={`${14 * k} ${8 * k}`} />
        <circle cx={pa.x} cy={pa.y} r={9 * k} fill={SIAGA[2]} />
        <circle cx={x2} cy={y2} r={9 * k} fill={PAL.amber} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: Math.min(my, 1300 * k) - 120 * k, display: "flex", justifyContent: "center", transform: `translateX(${(mx - 540 * k) * 0.3}px)` }}>
        <div style={{ background: "rgba(4,7,10,0.85)", border: `${2 * k}px solid ${PAL.amber}`, padding: `${10 * k}px ${22 * k}px`, textAlign: "center" }}>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 64 * k, color: PAL.amber, lineHeight: 1 }}>±6–9 jam</div>
          <div style={mono(17 * k, PAL.white, { marginTop: 6 * k, opacity: 0.85 })}>perkiraan BPBD</div>
        </div>
      </div>
    </div>
  );
};

const PhoneAlert: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = CLIPS[9].words.find((w) => norm(w.w).startsWith("peringatan"))?.s ?? T.sirene;
  const o = ss(a - 0.2, a + 0.3, t) * (1 - ss(SEC.PAYOFF[0] - 0.4, SEC.PAYOFF[0], t));
  if (o <= 0.01) return null;
  return (
    <div style={{ position: "absolute", right: 56 * k, top: 300 * k, width: 400 * k, opacity: o, transform: `translateY(${(1 - o) * -30 * k}px)` }}>
      <div style={{ background: "rgba(15,23,33,0.92)", border: `${1.5 * k}px solid rgba(255,183,3,0.7)`, borderRadius: 18 * k, padding: `${16 * k}px ${20 * k}px`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={mono(15 * k, PAL.amber)}>▲ Peringatan dini banjir</div>
        <div style={{ fontFamily: TITLE, fontWeight: 500, fontSize: 25 * k, color: PAL.white, marginTop: 8 * k, lineHeight: 1.25 }}>Tinggi air di hulu naik. Warga bantaran sungai harap waspada.</div>
      </div>
    </div>
  );
};

const Verdict: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o1 = ss(T.titik - 0.2, T.titik + 0.3, t) * (1 - ss(CLIPS[11].start - 0.3, CLIPS[11].start, t));
  const o2 = ss(T.keran - 0.2, T.keran + 0.3, t) * (1 - ss(CLIPS[11].start - 0.3, CLIPS[11].start, t));
  const o3 = ss(T.diperkirakan - 0.2, T.diperkirakan + 0.3, t) * (1 - ss(OUTRO_AT - 0.4, OUTRO_AT, t));
  const o4 = ss(T.dipastikan - 0.2, T.dipastikan + 0.3, t) * (1 - ss(OUTRO_AT - 0.4, OUTRO_AT, t));
  const row = (label: string, ok: boolean, o: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 * k, opacity: o, transform: `translateX(${(1 - o) * -24 * k}px)` }}>
      <div style={{ width: 46 * k, height: 46 * k, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? SIAGA[0] : SIAGA[3], color: PAL.void, fontFamily: TITLE, fontWeight: 700, fontSize: 34 * k }}>{ok ? "✓" : "✕"}</div>
      <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 56 * k, color: PAL.white, textDecoration: ok ? undefined : "line-through", textDecorationColor: SIAGA[3], textDecorationThickness: 5 * k }}>{label}</div>
    </div>
  );
  return (
    <>
      {o1 + o2 > 0.01 ? (
        <div style={{ position: "absolute", left: 56 * k, top: 290 * k, display: "flex", flexDirection: "column", gap: 14 * k }}>
          {row("Titik ukur", true, o1)}
          {row("Keran banjir", false, o2)}
        </div>
      ) : null}
      {o3 + o4 > 0.01 ? (
        <div style={{ position: "absolute", left: 56 * k, top: 290 * k, display: "flex", flexDirection: "column", gap: 14 * k }}>
          {row("Diperkirakan", true, o3)}
          {row("Dipastikan", false, o4)}
        </div>
      ) : null}
    </>
  );
};

// hard-cut laser wipe: a cyan scan line sweeps the frame
const CutWipe: React.FC<{ t: number; H: number; k: number }> = ({ t, H, k }) => {
  const c = CUTS.find((a) => t >= a - 0.25 && t < a + 0.35);
  if (c === undefined) return null;
  const p = (t - (c - 0.25)) / 0.6;
  const y = p * H;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: y, background: `linear-gradient(180deg, rgba(4,7,10,0) 0%, rgba(4,7,10,${t < c ? 0.0 : 0.0}) 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 60 * k, height: 60 * k, background: "linear-gradient(180deg, rgba(0,240,255,0) 0%, rgba(0,240,255,0.35) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 3 * k, background: PAL.laser, boxShadow: `0 0 ${20 * k}px ${PAL.laser}` }} />
    </div>
  );
};

// ---------- film ----------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height: H } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const pose = camAt(t);
  const project = projector(pose, width, H);

  // sky: clear and warm over the city at the start, storm-dark once we look upstream
  const clear = 1 - ss(CLIPS[1].start, CLIPS[1].start + 1.6, t);
  const P = (p: V3) => project(p);
  const pHulu = P([CLOUD_C.x - 3.2, CLOUD_C.y + 0.6, CLOUD_C.z]);
  const pKota = P([CITY_C[0] + 3, CITY_C[1] + 0.9, CITY_C[2]]);
  const pRiver = P(riverPoint(0.3));
  const pSt = [0, 1, 2].map((i) => P(stationTopV(i)));
  const pPump = P([PUMP[0], PUMP[1] + 0.35, PUMP[2]]);
  const pTower = P([TOWER[0], TOWER[1] + 1.0, TOWER[2]]);
  const pCrew = P([CREW[0], CREW[1] + 0.2, CREW[2]]);
  const vis = (q: { vis: boolean }) => (q.vis ? 1 : 0);

  const huluO = (ss(T.hulu - 0.2, T.hulu + 0.3, t) * (1 - ss(T.banjir - 0.5, T.banjir - 0.2, t)) + ss(SEC.OUTRO[0] + 1, SEC.OUTRO[0] + 1.5, t) * (1 - ss(OUTRO_AT - 0.4, OUTRO_AT, t))) * vis(pHulu);
  const kotaO = ((1 - ss(CLIPS[1].start - 0.3, CLIPS[1].start, t)) * ss(0.3, 0.8, t) + ss(SEC.OUTRO[0] + 1.2, SEC.OUTRO[0] + 1.7, t) * (1 - ss(OUTRO_AT - 0.4, OUTRO_AT, t))) * vis(pKota);
  const sungaiO = ss(T.ciliwung - 0.2, T.ciliwung + 0.3, t) * (1 - ss(SEC.KONTEKS[1], SEC.KONTEKS[1] + 0.4, t)) * vis(pRiver);
  const banjirO = ss(T.banjir - 0.2, T.banjir + 0.3, t) * (1 - ss(CLIPS[3].start + 0.6, CLIPS[3].start + 1.0, t));
  const stO = (i: number) => {
    const named = [T.katulampa, T.depok, T.manggarai][i];
    const showMek = ss(named - 0.15, named + 0.3, t) * (1 - ss(CLIPS[6].start - 0.3, CLIPS[6].start, t));
    const showPos = i === 0 ? ss(T.pos - 0.2, T.pos + 0.3, t) * (1 - ss(T.katulampa - 0.3, T.katulampa, t)) : 0;
    const showRev = (i === 0 ? ss(SEC.REVEAL[0], SEC.REVEAL[0] + 0.4, t) * (1 - ss(T.enam - 0.6, T.enam - 0.2, t)) : 0) + (i === 0 ? ss(SEC.PAYOFF[0] + 0.1, SEC.PAYOFF[0] + 0.5, t) * (1 - ss(CLIPS[11].start - 0.3, CLIPS[11].start, t)) : 0);
    const showOut = ss(SEC.OUTRO[0] + 1.4, SEC.OUTRO[0] + 1.9, t) * (1 - ss(OUTRO_AT - 0.4, OUTRO_AT, t));
    return Math.min(1, showMek + showPos + showRev + showOut) * vis(pSt[i]);
  };
  const stLabel = (i: number) => {
    if (t >= T.pos - 0.2 && t < T.katulampa - 0.1 && i === 0) return ["Pos pantau TMA", undefined] as const;
    const li = levelIdx(gaugeLevel(i, t));
    const sub = t > SEC.REVEAL[0] && t < SEC.PAYOFF[0] ? SIAGA_NAME[li] : t >= SEC.PAYOFF[0] && t < CLIPS[11].start ? "Titik ukur" : undefined;
    return [POST_NAMES[i], sub] as const;
  };
  const cityO = (a: number, b: number) => ss(a - 0.2, a + 0.3, t) * (1 - ss(b - 0.4, b, t));

  return (
    <AbsoluteFill style={{ background: PAL.void }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b121c 0%, #121b28 18%, #0a1018 34%, #04070a 60%)" }} />
      <AbsoluteFill style={{ opacity: clear, background: "linear-gradient(180deg, #123050 0%, #1f4a6e 22%, #c98a4a 40%, #3a2a1c 52%, #04070a 70%)" }} />
      <ThreeCanvas width={width} height={H} gl={{ antialias: true, alpha: true }}>
        <World t={t} f={f} H={H} pose={pose} />
      </ThreeCanvas>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(4,7,10,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,7,10,0.65) 6%, rgba(4,7,10,0) 18%, rgba(4,7,10,0) 70%, rgba(4,7,10,0.75) 86%)" }} />

      {/* world-anchored labels */}
      <Tag x={pHulu.x} y={pHulu.y} label="Hulu" sub="Hujan deras" color={PAL.white} k={k} o={huluO} right />
      <Tag x={pKota.x} y={pKota.y} label="Kota" sub={t < 3 ? "Cerah" : undefined} color={PAL.laser} k={k} o={kotaO} />
      <Tag x={pRiver.x} y={pRiver.y} label="Sungai Ciliwung" color={PAL.water} k={k} o={sungaiO} dy={-80} />
      {[0, 1, 2].map((i) => {
        const [lab, sub] = stLabel(i);
        return <Tag key={i} x={pSt[i].x} y={pSt[i].y} label={lab} sub={sub} color={t > SEC.REVEAL[0] && t < SEC.PAYOFF[0] ? SIAGA[levelIdx(gaugeLevel(i, t))] : [PAL.coral, PAL.amber, PAL.laser][i]} k={k} o={stO(i)} dy={-50 - i * 8} right={i !== 1} />;
      })}
      <Tag x={pPump.x} y={pPump.y} label="Pompa" color={PAL.water} k={k} o={cityO(T.pompa, SEC.PAYOFF[0]) * vis(pPump)} dy={-90} right />
      <Tag x={pCrew.x} y={pCrew.y} label="Petugas siaga" color={SIAGA[2]} k={k} o={cityO(T.petugas, SEC.PAYOFF[0]) * vis(pCrew)} dy={70} />
      <Tag x={pTower.x} y={pTower.y} label="Sirene" color={PAL.amber} k={k} o={cityO(T.sirene, SEC.PAYOFF[0]) * vis(pTower)} dy={-70} />
      {t > T.genangan - 0.3 && t < SEC.OUTRO[0] + 0.5 ? (
        <Tag x={P([-2.6, 0.1, CITY_Z + 1.7]).x} y={P([-2.6, 0.1, CITY_Z + 1.7]).y} label="Genangan" sub="Hujan lokal" color={PAL.water} k={k} o={cityO(T.genangan, SEC.OUTRO[0] + 0.5)} dy={-80} />
      ) : null}

      {/* big section card for "banjir kiriman" */}
      {banjirO > 0.01 ? (
        <div style={{ position: "absolute", left: 56 * k, right: 56 * k, top: 290 * k, opacity: banjirO, transform: `translateY(${(1 - banjirO) * 20 * k}px)` }}>
          <div style={mono(20 * k, PAL.amber)}>Definisi</div>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 96 * k, color: PAL.white, lineHeight: 0.95, marginTop: 8 * k }}>
            Banjir <span style={{ color: PAL.laser }}>kiriman</span>
          </div>
          <div style={mono(19 * k, PAL.white, { opacity: 0.8, marginTop: 12 * k, whiteSpace: "normal" })}>Air hujan hulu turun ke hilir</div>
        </div>
      ) : null}
      {/* "berjam-jam": travel clock without numbers */}
      {(() => {
        const o = ss(T.berjam - 0.2, T.berjam + 0.3, t) * (1 - ss(SEC.KONTEKS[1] + 0.2, SEC.KONTEKS[1] + 0.6, t));
        if (o <= 0.01) return null;
        const ang = (t - T.berjam) * 260;
        return (
          <div style={{ position: "absolute", left: 56 * k, top: 290 * k, opacity: o, display: "flex", alignItems: "center", gap: 18 * k }}>
            <svg width={90 * k} height={90 * k} viewBox="-50 -50 100 100">
              <circle r="44" fill="rgba(4,7,10,0.75)" stroke={PAL.amber} strokeWidth="5" />
              <line x1="0" y1="0" x2="0" y2="-26" stroke={PAL.white} strokeWidth="6" strokeLinecap="round" transform={`rotate(${ang / 12})`} />
              <line x1="0" y1="0" x2="0" y2="-36" stroke={PAL.amber} strokeWidth="4" strokeLinecap="round" transform={`rotate(${ang})`} />
            </svg>
            <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 60 * k, color: PAL.white }}>Berjam-jam</div>
          </div>
        );
      })()}
      {/* data travels first */}
      {(() => {
        const o = ss(T.data - 0.2, T.data + 0.3, t) * (1 - ss(SEC.REVEAL[0] - 0.3, SEC.REVEAL[0], t));
        if (o <= 0.01) return null;
        return (
          <div style={{ position: "absolute", left: 56 * k, top: 290 * k, opacity: o }}>
            <div style={mono(20 * k, PAL.amber)}>● Data hulu</div>
            <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 64 * k, color: PAL.white, lineHeight: 1, marginTop: 8 * k }}>
              Dibaca lebih dulu
            </div>
          </div>
        );
      })()}
      <SiagaLadder t={t} k={k} />
      <WindowBar t={t} k={k} pa={pSt[0]} pb={pSt[2]} />
      <PhoneAlert t={t} k={k} />
      <Verdict t={t} k={k} />

      <Hud t={t} k={k} />
      <Captions t={t} k={k} />
      <CutWipe t={t} H={H} k={k} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
