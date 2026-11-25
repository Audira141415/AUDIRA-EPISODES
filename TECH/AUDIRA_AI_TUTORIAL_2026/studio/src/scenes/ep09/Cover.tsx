// EP09 cover — "RISET JADI LAPORAN OTOMATIS" in LIDARFORGE: a survey field of point-cloud sources
// (web page, email, folder, files, notebook) swept by a cyan laser curtain. Their returns stream
// along flight paths and condense into one thick glowing report at the centre (cover: LAPORAN,
// small line chart, AUDIRA label). Floor = elevation-coloured point terrain + survey grid.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadGrot } from "@remotion/google-fonts/SpaceGrotesk";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { LIDAR_PALETTE as P } from "../../kits/lidarforge/lib/palette.ts";
import { glowTexture, labelTexture, pageEdgeTexture, reportCoverTexture } from "./textures.ts";

export const mono = loadMono("normal", { weights: ["500", "600", "800"], subsets: ["latin"] });
export const grot = loadGrot("normal", { weights: ["700"], subsets: ["latin"] });

export const BG = P.surveyVoid;
export const FLOOR_Y = -1.5;

// ---------- deterministic helpers ----------
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const RAMP = [P.elevationBedrock, P.elevationGround, P.elevationVegetation, P.elevationRidge, P.elevationPeak].map((c) => new THREE.Color(c));
export const ramp = (t: number, out = new THREE.Color()) => {
  const x = Math.min(0.999, Math.max(0, t)) * (RAMP.length - 1);
  const i = Math.floor(x);
  return out.copy(RAMP[i]).lerp(RAMP[i + 1], x - i);
};

export type V3 = [number, number, number];
export const line = (out: V3[], a: [number, number], b: [number, number], step: number, z = 0) => {
  const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
  for (let i = 0; i <= n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, z]);
};
export const rect = (out: V3[], x0: number, y0: number, x1: number, y1: number, step: number, z = 0) => {
  line(out, [x0, y0], [x1, y0], step, z);
  line(out, [x1, y0], [x1, y1], step, z);
  line(out, [x1, y1], [x0, y1], step, z);
  line(out, [x0, y1], [x0, y0], step, z);
};
export const textRows = (out: V3[], r: () => number, x0: number, x1: number, yTop: number, rows: number, gap: number, step: number, z = 0) => {
  for (let i = 0; i < rows; i++) {
    const len = (x1 - x0) * (0.55 + r() * 0.42);
    line(out, [x0, yTop - i * gap], [x0 + len, yTop - i * gap], step, z);
  }
};

// ---------- source shapes (local XY plane, centred) ----------
export type Kind = "browser" | "envelope" | "folder" | "pages" | "notebook";
export const shape = (kind: Kind, w: number, h: number, seed: number): V3[] => {
  const r = rng(seed);
  const o: V3[] = [];
  const s = 0.03;
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
  if (kind === "browser") {
    rect(o, x0, y0, x1, y1, s);
    line(o, [x0, y1 - 0.12], [x1, y1 - 0.12], s);
    [0, 1, 2].forEach((k) => {
      for (let a = 0; a < 10; a++) o.push([x0 + 0.08 + k * 0.07 + Math.cos(a) * 0.02, y1 - 0.06 + Math.sin(a) * 0.02, 0]);
    });
    rect(o, x0 + 0.15, y1 - 0.3, x1 - 0.15, y1 - 0.2, s * 0.8);
    for (let k = 0; k < 3; k++) {
      const yy = y1 - 0.42 - k * 0.15;
      rect(o, x0 + 0.08, yy - 0.09, x0 + 0.2, yy + 0.01, s * 0.7);
      textRows(o, r, x0 + 0.26, x1 - 0.08, yy, 2, 0.06, s);
    }
  } else if (kind === "envelope") {
    for (const z of [0, -0.04]) {
      rect(o, x0, y0, x1, y1, s, z);
      line(o, [x0, y1], [0, y0 + h * 0.38], s, z);
      line(o, [x1, y1], [0, y0 + h * 0.38], s, z);
      line(o, [x0, y0], [-w * 0.12, y0 + h * 0.45], s, z);
      line(o, [x1, y0], [w * 0.12, y0 + h * 0.45], s, z);
    }
  } else if (kind === "folder") {
    const tab: [number, number][] = [[x0, y0], [x1, y0], [x1, y1 - 0.1], [x0 + w * 0.42, y1 - 0.1], [x0 + w * 0.34, y1], [x0, y1], [x0, y0]];
    for (const z of [0, -0.08]) for (let i = 0; i < tab.length - 1; i++) line(o, tab[i], tab[i + 1], s, z);
    // pages peeking out of the folder
    rect(o, x0 + 0.08, y0 + 0.1, x1 - 0.1, y1 - 0.04, s, -0.04);
    textRows(o, r, x0 + 0.14, x1 - 0.16, y1 - 0.16, 4, 0.09, s, -0.04);
  } else if (kind === "pages") {
    for (let k = 0; k < 4; k++) {
      const dz = -k * 0.07, dx = k * 0.035, dy = -k * 0.03;
      rect(o, x0 + dx, y0 + dy, x1 + dx, y1 + dy, s, dz);
      if (k === 0) {
        for (let yy = y1 - 0.06; yy > y1 - 0.18; yy -= 0.03) line(o, [x0 + 0.08, yy], [x0 + w * 0.6, yy], s * 0.8);
        textRows(o, r, x0 + 0.08, x1 - 0.08, y1 - 0.28, 8, 0.08, s);
      }
    }
  } else {
    rect(o, x0, y0, x1, y1, s);
    for (let yy = y0 + 0.08; yy < y1 - 0.04; yy += 0.11) for (let a = 0; a < 12; a++) o.push([x0 + Math.cos((a / 12) * Math.PI * 2) * 0.03, yy + Math.sin((a / 12) * Math.PI * 2) * 0.03, 0.01]);
    line(o, [x0 + 0.1, y1 - 0.14], [x1 - 0.1, y1 - 0.14], s * 0.7);
    textRows(o, r, x0 + 0.12, x1 - 0.1, y1 - 0.28, 8, 0.1, s);
  }
  return o;
};

export type Source = { kind: Kind; label?: string; pos: V3; rotY: number; w: number; h: number; seed: number };
export const SOURCES: Source[] = [
  { kind: "browser", label: "SEARCH", pos: [-1.55, -0.05, -1.7], rotY: 0.55, w: 1.1, h: 0.82, seed: 11 },
  { kind: "envelope", label: "GMAIL", pos: [1.35, 1.25, -1.8], rotY: -0.5, w: 1.0, h: 0.66, seed: 12 },
  { kind: "folder", label: "DRIVE", pos: [-1.2, -0.85, 1.4], rotY: 0.6, w: 0.95, h: 0.72, seed: 13 },
  { kind: "pages", label: "FILE", pos: [1.22, -0.8, 1.5], rotY: -0.55, w: 0.72, h: 0.96, seed: 14 },
  { kind: "notebook", label: "NOTEBOOKLM", pos: [1.85, 0.05, -2.9], rotY: -0.6, w: 0.8, h: 1.0, seed: 15 },
  { kind: "pages", pos: [-2.7, 0.3, -5.2], rotY: 0.7, w: 0.8, h: 1.05, seed: 21 },
  { kind: "browser", pos: [2.8, 0.2, -5.6], rotY: -0.7, w: 1.2, h: 0.9, seed: 22 },
  { kind: "envelope", pos: [-1.6, 3.1, -7.2], rotY: 0.3, w: 1.0, h: 0.66, seed: 23 },
  { kind: "folder", pos: [2.0, 3.0, -7.6], rotY: -0.3, w: 1.0, h: 0.75, seed: 24 },
  { kind: "pages", pos: [-3.4, 2.0, -8.4], rotY: 0.6, w: 0.8, h: 1.05, seed: 25 },
  { kind: "browser", pos: [0.9, 4.0, -9.5], rotY: -0.1, w: 1.2, h: 0.9, seed: 26 },
  { kind: "envelope", pos: [3.6, 1.6, -9.0], rotY: -0.5, w: 1.0, h: 0.66, seed: 27 },
];

export const REPORT_POS: V3 = [0, -0.15, 0];
export const REPORT_ROT: V3 = [-0.06, -0.55, 0.0];
export const REPORT_SIZE: V3 = [1.5, 2.0, 0.46];

export const scanXAt = (f: number) => 0.9 + f * 0.0133;

export const worldOf = (src: Source) => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...src.pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, src.rotY, 0)), new THREE.Vector3(1, 1, 1));
  return shape(src.kind, src.w, src.h, src.seed).map(([x, y, z]) => new THREE.Vector3(x, y, z).applyMatrix4(m));
};

// ---------- point layers ----------
export const usePointsGeo = (positions: Float32Array, colors: Float32Array) =>
  useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

export const PointLayer: React.FC<{ positions: Float32Array; colors: Float32Array; size: number; opacity?: number }> = ({ positions, colors, size, opacity = 1 }) => {
  const geo = usePointsGeo(positions, colors);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity, sizeAttenuation: true, toneMapped: false, depthWrite: false }),
    [size, opacity],
  );
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

/** Colour a static point by elevation and laser state (scanned = full, unscanned = dim, front = cyan-white). */
export const scanTint = (c: THREE.Color, x: number, scanX: number) => {
  const d = x - scanX;
  if (Math.abs(d) < 0.06) return c.lerp(new THREE.Color("#d8fdff"), 0.85).multiplyScalar(1.6);
  if (d > 0) return c.multiplyScalar(0.42);
  return c.multiplyScalar(1.05);
};

export const Floor: React.FC<{ scanX: number }> = ({ scanX }) => {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const c = new THREE.Color();
    for (let x = -6; x <= 6; x += 0.17)
      for (let z = -13; z <= 5; z += 0.17) {
        const n = 0.5 + 0.25 * Math.sin(x * 0.9 + z * 0.35) + 0.2 * Math.cos(z * 0.7 - x * 0.4) + 0.05 * Math.sin(x * 3.1 + z * 2.3);
        const y = FLOOR_Y + n * 0.14;
        // returns lift slightly toward the report: warmer near the centre
        const near = Math.exp(-(x * x + z * z) / 6);
        ramp(n * 0.42 + near * 0.32, c);
        scanTint(c, x, scanX);
        pos.push(x, y, z);
        col.push(c.r, c.g, c.b);
      }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [scanX]);
  const grid = useMemo(() => {
    const v: number[] = [];
    for (let x = -6; x <= 6.01; x += 0.5) v.push(x, FLOOR_Y + 0.005, -13, x, FLOOR_Y + 0.005, 5);
    for (let z = -13; z <= 5.01; z += 0.5) v.push(-6, FLOOR_Y + 0.005, z, 6, FLOOR_Y + 0.005, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return (
    <>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#123444" transparent opacity={0.75} toneMapped={false} />
      </lineSegments>
      <PointLayer positions={positions} colors={colors} size={0.045} opacity={0.95} />
    </>
  );
};

const Sources: React.FC<{ scanX: number }> = ({ scanX }) => {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const c = new THREE.Color();
    SOURCES.forEach((s, si) => {
      const far = s.pos[2] < -4;
      worldOf(s).forEach((p) => {
        ramp(0.3 + ((p.y - FLOOR_Y) / 5.5) * 0.55 + (si % 3) * 0.02, c);
        if (far) c.multiplyScalar(0.7);
        scanTint(c, p.x, scanX);
        pos.push(p.x, p.y, p.z);
        col.push(c.r, c.g, c.b);
      });
    });
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [scanX]);
  return <PointLayer positions={positions} colors={colors} size={0.04} />;
};

/** Returns streaming from each labelled source into the report (positions depend on frame). */
const Flows: React.FC<{ f: number }> = ({ f }) => {
  const base = useMemo(() => {
    const r = rng(909);
    const rep = new THREE.Matrix4().compose(new THREE.Vector3(...REPORT_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(...REPORT_ROT)), new THREE.Vector3(1, 1, 1));
    const items: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; ph: number; jx: number; jy: number; jz: number; col: THREE.Color }[] = [];
    SOURCES.slice(0, 7).forEach((s, si) => {
      const pts = worldOf(s);
      const n = si < 5 ? 1100 : 260;
      for (let i = 0; i < n; i++) {
        const a = pts[Math.floor(r() * pts.length)].clone();
        const b = new THREE.Vector3((r() - 0.5) * REPORT_SIZE[0] * 0.9, (r() - 0.5) * REPORT_SIZE[1] * 0.9, -REPORT_SIZE[2] / 2).applyMatrix4(rep);
        const mid = a.clone().lerp(b, 0.5);
        mid.y += 0.55 + r() * 0.35;
        mid.z += 0.4;
        items.push({ a, b, c: mid, ph: r(), jx: r() - 0.5, jy: r() - 0.5, jz: r() - 0.5, col: ramp(0.3 + ((a.y - FLOOR_Y) / 5.5) * 0.55) });
      }
    });
    return items;
  }, []);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(base.length * 3);
    const col = new Float32Array(base.length * 3);
    const cyan = new THREE.Color(P.laserScanFront);
    const warm = new THREE.Color("#fff1c4");
    const c = new THREE.Color();
    const v = new THREE.Vector3();
    base.forEach((it, i) => {
      const u = (it.ph + f * 0.0035) % 1;
      const k = 1 - u;
      v.set(0, 0, 0)
        .addScaledVector(it.a, k * k)
        .addScaledVector(it.c, 2 * k * u)
        .addScaledVector(it.b, u * u);
      const spread = Math.sin(u * Math.PI) * 0.07;
      v.x += it.jx * spread;
      v.y += it.jy * spread;
      v.z += it.jz * spread;
      c.copy(it.col).lerp(cyan, Math.min(1, u * 1.6));
      if (u > 0.78) c.lerp(warm, (u - 0.78) / 0.22);
      c.multiplyScalar(0.55 + u * 0.9);
      pos.set([v.x, v.y, v.z], i * 3);
      col.set([c.r, c.g, c.b], i * 3);
    });
    return { positions: pos, colors: col };
  }, [base, f]);
  return <PointLayer positions={positions} colors={colors} size={0.032} />;
};

const Report: React.FC<{ f: number }> = ({ f }) => {
  const cover = useMemo(() => reportCoverTexture(), []);
  const edge = useMemo(() => pageEdgeTexture(), []);
  const glow = useMemo(() => glowTexture(), []);
  const [w, h, d] = REPORT_SIZE;
  const shell = useMemo(() => {
    const r = rng(4242);
    const pos: number[] = [];
    const col: number[] = [];
    const cyan = new THREE.Color(P.laserScanFront);
    const amber = new THREE.Color(P.measurementAccent);
    const c = new THREE.Color();
    // dense returns tracing the book edges
    const ex = w / 2 + 0.02, ey = h / 2 + 0.02, ez = d / 2 + 0.02;
    const corners: V3[] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx * ex, sy * ey, sz * ez]);
    const edges: [number, number][] = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    edges.forEach(([i, j]) => {
      const A = corners[i], B = corners[j];
      const n = Math.round(Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) / 0.018);
      for (let k = 0; k <= n; k++) {
        pos.push(A[0] + ((B[0] - A[0]) * k) / n, A[1] + ((B[1] - A[1]) * k) / n, A[2] + ((B[2] - A[2]) * k) / n);
        c.copy(cyan).lerp(new THREE.Color("#e8feff"), 0.5);
        col.push(c.r, c.g, c.b);
      }
    });
    // loose returns still condensing onto the surface
    for (let i = 0; i < 1500; i++) {
      const face = Math.floor(r() * 3);
      const p = [(r() - 0.5) * w, (r() - 0.5) * h, (r() - 0.5) * d];
      const sgn = r() > 0.5 ? 1 : -1;
      if (face === 0) p[2] = -d / 2;
      else if (face === 1) p[0] = (sgn * w) / 2;
      else p[1] = (sgn * h) / 2;
      const out = 1.04 + Math.pow(r(), 3) * 0.35;
      pos.push(p[0] * out, p[1] * out, p[2] * (1 + (out - 1) * 4));
      c.copy(cyan).lerp(amber, r() * 0.55);
      col.push(c.r, c.g, c.b);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [w, h, d]);
  const boxEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.5, h + 0.5, d + 0.6)), [w, h, d]);
  const pulse = 1 + Math.sin(f / 20) * 0.04;
  return (
    <group position={REPORT_POS} rotation={REPORT_ROT}>
      <sprite position={[0, 0, -0.6]} scale={[4.2 * pulse, 4.6 * pulse, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh>
        <RoundedBoxGeo args={[w, h, d]} radius={0.035} />
        <meshPhysicalMaterial color="#0a2232" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} emissive="#06384a" emissiveIntensity={0.5} />
      </mesh>
      {/* cover */}
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w - 0.04, h - 0.04]} />
        <meshStandardMaterial map={cover} emissiveMap={cover} emissive="#ffffff" emissiveIntensity={0.95} roughness={0.4} toneMapped={false} />
      </mesh>
      {/* page block on the open side */}
      <mesh position={[w / 2 + 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d - 0.06, h - 0.08]} />
        <meshStandardMaterial map={edge} emissiveMap={edge} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[d - 0.06, w - 0.08]} />
        <meshStandardMaterial map={edge} emissiveMap={edge} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.9} />
      </mesh>
      <PointLayer positions={shell.positions} colors={shell.colors} size={0.026} />
      <lineSegments geometry={boxEdges}>
        <lineBasicMaterial color={P.laserScanFront} transparent opacity={0.35} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

export const Laser: React.FC<{ scanX: number }> = ({ scanX }) => {
  const fan = useMemo(() => {
    const v: number[] = [];
    const top: V3 = [scanX, 4.6, -1.2];
    for (let i = 0; i <= 14; i++) {
      const z = -9 + (i / 14) * 13;
      v.push(...top, scanX, FLOOR_Y, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, [scanX]);
  return (
    <group>
      <mesh position={[scanX, 1.4, -4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.8]} />
        <meshBasicMaterial color={P.laserScanFront} transparent opacity={0.05} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <lineSegments geometry={fan}>
        <lineBasicMaterial color={P.laserEmitter} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

export const Labels: React.FC = () => {
  const items = useMemo(
    () =>
      SOURCES.filter((s) => s.label).map((s) => {
        const t = labelTexture(s.label!, `GRID X${s.pos[0] >= 0 ? "+" : ""}${s.pos[0].toFixed(2)} Z${s.pos[2] >= 0 ? "+" : ""}${s.pos[2].toFixed(2)}`, P.measurementAccent);
        return { s, ...t };
      }),
    [],
  );
  return (
    <>
      {items.map(({ s, map, aspect }) => {
        const hgt = s.pos[2] > 0 ? 0.2 : 0.26;
        return (
          <sprite key={s.label} position={[s.pos[0], s.pos[1] + s.h / 2 + 0.2, s.pos[2]]} scale={[hgt * aspect, hgt, 1]}>
            <spriteMaterial map={map} transparent toneMapped={false} depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const scanX = scanXAt(f);
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 9, 22]} />
      <ambientLight intensity={0.35} color="#8fb8d0" />
      <pointLight position={[0, 0.4, 2.2]} intensity={6} distance={6} color="#7fefff" />
      <directionalLight position={[3, 6, 4]} intensity={0.9} color="#cfe8ff" />
      <Floor scanX={scanX} />
      <Sources scanX={scanX} />
      <Flows f={f} />
      <Report f={f} />
      <Laser scanX={scanX} />
      <Labels />
    </>
  );
};

export const Ep09Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP09 fonts"));
  useEffect(() => {
    Promise.all([mono.waitUntilDone(), grot.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  const legend: [string, string][] = [
    ["SUMBER", P.elevationVegetation],
    ["ALIRAN DATA", P.laserScanFront],
    ["LAPORAN", P.measurementAccent],
  ];

  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          camera={{ position: [0, 2.3, 7.8], fov: 50, near: 0.1, far: 60 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.42, 0)}
        >
          <Scene f={f} />
          <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,7,10,0.94) 0%, rgba(4,7,10,0.78) 26%, rgba(4,7,10,0) 42%)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 262 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'JetBrains Mono'", fontWeight: 600, fontSize: 32, letterSpacing: 7, color: P.laserScanFront }}>
          <span style={{ width: 18, height: 18, background: P.laserScanFront, boxShadow: `0 0 18px ${P.laserScanFront}`, display: "inline-block" }} />
          AUDIRA AI TUTORIAL
        </div>
        <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 132, lineHeight: 0.98, color: P.hudReadout, marginTop: 20, letterSpacing: -2 }}>
          RISET JADI
          <br />
          LAPORAN
          <br />
          <span style={{ color: P.measurementAccent }}>OTOMATIS</span>
        </div>
        <div style={{ marginTop: 22, display: "inline-flex", gap: 12, fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 26, letterSpacing: 2, color: "#C9D6E0", border: `1px solid ${P.laserScanFront}`, padding: "8px 14px", background: "rgba(4,7,10,0.6)" }}>
          DEEP RESEARCH · BIASANYA 5–10 MENIT
        </div>
      </div>
      {/* point classification legend, LiDAR-style (one row, above the bottom safe zone) */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 1474, display: "flex", whiteSpace: "nowrap", gap: 22, padding: "10px 20px", background: "rgba(4,7,10,0.72)", border: "1px solid #1d3a48", fontFamily: "'JetBrains Mono'", fontWeight: 500, fontSize: 21, color: "#a9bccb", letterSpacing: 1.5 }}>
        <span style={{ color: P.hudReadout, fontWeight: 600 }}>KLASIFIKASI</span>
        {legend.map(([t, c]) => (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 14, height: 14, background: c, display: "inline-block" }} />
            {t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
