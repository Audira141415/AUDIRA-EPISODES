// EP09 film world: the cover's LIDAR survey field (Cover.tsx parts) driven by VO time.
// Adds: a tunnel of open-tab point clouds (hook) that collapses into the report, per-source highlight,
// flows with a strength control, and a report that assembles / pulses. Deterministic (seeded, t-driven).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { LIDAR_PALETTE as P } from "../../kits/lidarforge/lib/palette.ts";
import { BG, FLOOR_Y, Floor, Labels, Laser, PointLayer, REPORT_POS, REPORT_ROT, REPORT_SIZE, SOURCES, ramp as eramp, rng, scanTint, shape, worldOf, type V3 } from "./Cover.tsx";
import { glowTexture, pageEdgeTexture, reportCoverTexture } from "./textures.ts";
import { camAt } from "./camera.ts";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const rp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// ------------------------------------------------------------------ VO-time drivers
/** Laser curtain x: idle sweep every ~6.8 s; faster during the research run. */
export const scanAt = (t: number) => {
  const speed = t > 47 && t < 62 ? 3.4 : 1.9;
  return -6.5 + ((t * speed) % 13);
};
/** Highlight per labelled source (0 SEARCH, 1 GMAIL, 2 DRIVE, 3 FILE, 4 NOTEBOOKLM) keyed to spoken words. */
export const highlightAt = (t: number): number[] => {
  const pulse = (a: number, hold: number) => sm(rp(t, a - 0.1, a + 0.25)) * (1 - sm(rp(t, a + hold, a + hold + 0.5)));
  const named = [pulse(17.66, 6.2), pulse(19.91, 4.0), pulse(20.51, 3.4), pulse(20.9, 3.0), pulse(23.47, 0.6)];
  // LANGKAH 3: the source toggles switch on; PAYOFF "buka sumber yang dikutip": all sources re-lit
  const toggles = [40.7, 40.83, 41.0, 41.22, 41.4].map((a) => sm(rp(t, a, a + 0.3)) * (1 - sm(rp(t, 46.5, 47.2))));
  const cited = sm(rp(t, 68.6, 69.0)) * (1 - sm(rp(t, 70.6, 71.2)));
  return named.map((v, i) => Math.max(v, toggles[i] * 0.8, cited));
};

// ------------------------------------------------------------------ camera
const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const k = camAt(t);
    c.position.set(...k.pos);
    c.lookAt(...k.target);
    c.fov = k.fov;
    c.near = 0.05;
    c.far = 60;
    c.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ tab tunnel (hook)
type Tab = { pts: THREE.Vector3[]; delay: number; mid: THREE.Vector3 };
const TABS: Tab[] = (() => {
  const r = rng(7171);
  const out: Tab[] = [];
  for (let i = 0; i < 46; i++) {
    const z = 8.5 - i * 0.46 - r() * 0.3;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (0.9 + r() * 2.0);
    const y = -0.4 + r() * 3.6;
    const rotY = -side * (0.35 + r() * 0.5);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.3, rotY, (r() - 0.5) * 0.25)), new THREE.Vector3(1, 1, 1));
    const pts = shape("browser", 0.95 + r() * 0.4, 0.7 + r() * 0.25, 300 + i).map(([a, b, c]) => new THREE.Vector3(a, b, c).applyMatrix4(m));
    out.push({ pts, delay: r() * 1.6, mid: new THREE.Vector3(x * 0.4, y + 1.2, z * 0.5 + 1) });
  }
  return out;
})();

const TabTunnel: React.FC<{ t: number }> = ({ t }) => {
  const total = useMemo(() => TABS.reduce((n, tb) => n + tb.pts.length, 0), []);
  const targets = useMemo(() => {
    const r = rng(99);
    const rep = new THREE.Matrix4().compose(new THREE.Vector3(...REPORT_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(...REPORT_ROT)), new THREE.Vector3(1, 1, 1));
    return Array.from({ length: total }, () => new THREE.Vector3((r() - 0.5) * REPORT_SIZE[0], (r() - 0.5) * REPORT_SIZE[1], (r() - 0.5) * REPORT_SIZE[2]).applyMatrix4(rep));
  }, [total]);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const c = new THREE.Color();
    const cyan = new THREE.Color(P.laserScanFront);
    const v = new THREE.Vector3();
    let j = 0;
    TABS.forEach((tb, ti) => {
      const u = sm(rp(t, 6.9 + tb.delay, 9.4 + tb.delay));
      const bob = Math.sin(t * 1.3 + ti) * 0.04;
      tb.pts.forEach((p) => {
        const q = targets[j];
        const k = 1 - u;
        v.set(0, 0, 0).addScaledVector(p, k * k).addScaledVector(tb.mid, 2 * k * u).addScaledVector(q, u * u);
        v.y += bob * k;
        eramp(0.28 + ((p.y - FLOOR_Y) / 5.5) * 0.5 + (ti % 4) * 0.03, c);
        c.lerp(cyan, Math.min(1, u * 1.5));
        // fade out once absorbed into the report
        const fade = 1 - sm(rp(u, 0.85, 1));
        c.multiplyScalar((1.15 + Math.sin(u * Math.PI) * 0.8) * fade);
        if (u >= 0.999) v.set(0, -100, 0);
        pos[j * 3] = v.x;
        pos[j * 3 + 1] = v.y;
        pos[j * 3 + 2] = v.z;
        col[j * 3] = c.r;
        col[j * 3 + 1] = c.g;
        col[j * 3 + 2] = c.b;
        j++;
      });
    });
    return { positions: pos, colors: col };
  }, [t, total, targets]);
  if (t > 12) return null;
  return <PointLayer positions={positions} colors={colors} size={0.052} />;
};

// ------------------------------------------------------------------ sources with highlight
const SourcesLit: React.FC<{ scanX: number; hl: number[]; on: number }> = ({ scanX, hl, on }) => {
  const base = useMemo(() => SOURCES.map((s) => worldOf(s)), []);
  const total = useMemo(() => base.reduce((n, a) => n + a.length, 0), [base]);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const c = new THREE.Color();
    const hot = new THREE.Color("#fff3c8");
    let j = 0;
    SOURCES.forEach((s, si) => {
      const far = s.pos[2] < -4;
      const h = si < 5 ? hl[si] : 0;
      base[si].forEach((p) => {
        eramp(0.3 + ((p.y - FLOOR_Y) / 5.5) * 0.55 + (si % 3) * 0.02, c);
        if (far) c.multiplyScalar(0.7);
        scanTint(c, p.x, scanX);
        if (h > 0) c.lerp(hot, h * 0.75).multiplyScalar(1 + h * 0.9);
        c.multiplyScalar(on);
        pos[j * 3] = p.x;
        pos[j * 3 + 1] = p.y + (on < 1 ? (1 - on) * -0.6 : 0);
        pos[j * 3 + 2] = p.z;
        col[j * 3] = c.r;
        col[j * 3 + 1] = c.g;
        col[j * 3 + 2] = c.b;
        j++;
      });
    });
    return { positions: pos, colors: col };
  }, [base, total, scanX, hl, on]);
  if (on <= 0.01) return null;
  return <PointLayer positions={positions} colors={colors} size={0.042} />;
};

/** Survey rings under highlighted sources (ground stake + expanding circle). */
const Stakes: React.FC<{ t: number; hl: number[] }> = ({ t, hl }) => (
  <>
    {SOURCES.slice(0, 5).map((s, i) => {
      if (hl[i] < 0.02) return null;
      const ph = (t * 0.8 + i * 0.2) % 1;
      return (
        <group key={i} position={[s.pos[0], FLOOR_Y + 0.02, s.pos[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35 + ph * 0.6, 0.38 + ph * 0.6, 48]} />
            <meshBasicMaterial color={P.measurementAccent} transparent opacity={hl[i] * (1 - ph) * 0.9} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, (s.pos[1] - FLOOR_Y) / 2 - 0.2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, Math.max(0.05, s.pos[1] - FLOOR_Y - 0.4), 6]} />
            <meshBasicMaterial color={P.measurementAccent} transparent opacity={hl[i] * 0.7} toneMapped={false} />
          </mesh>
        </group>
      );
    })}
  </>
);

// ------------------------------------------------------------------ flows (sources -> report)
const FlowsK: React.FC<{ f: number; amount: number }> = ({ f, amount }) => {
  const base = useMemo(() => {
    const r = rng(909);
    const rep = new THREE.Matrix4().compose(new THREE.Vector3(...REPORT_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(...REPORT_ROT)), new THREE.Vector3(1, 1, 1));
    const items: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; ph: number; jx: number; jy: number; jz: number; col: THREE.Color; gate: number }[] = [];
    SOURCES.slice(0, 7).forEach((s, si) => {
      const pts = worldOf(s);
      const n = si < 5 ? 900 : 220;
      for (let i = 0; i < n; i++) {
        const a = pts[Math.floor(r() * pts.length)].clone();
        const b = new THREE.Vector3((r() - 0.5) * REPORT_SIZE[0] * 0.9, (r() - 0.5) * REPORT_SIZE[1] * 0.9, -REPORT_SIZE[2] / 2).applyMatrix4(rep);
        const mid = a.clone().lerp(b, 0.5);
        mid.y += 0.55 + r() * 0.35;
        mid.z += 0.4;
        items.push({ a, b, c: mid, ph: r(), jx: r() - 0.5, jy: r() - 0.5, jz: r() - 0.5, col: eramp(0.3 + ((a.y - FLOOR_Y) / 5.5) * 0.55), gate: r() });
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
      if (it.gate > amount) {
        pos[i * 3 + 1] = -100;
        return;
      }
      const u = (it.ph + f * 0.0035) % 1;
      const k = 1 - u;
      v.set(0, 0, 0).addScaledVector(it.a, k * k).addScaledVector(it.c, 2 * k * u).addScaledVector(it.b, u * u);
      const spread = Math.sin(u * Math.PI) * 0.07;
      v.x += it.jx * spread;
      v.y += it.jy * spread;
      v.z += it.jz * spread;
      c.copy(it.col).lerp(cyan, Math.min(1, u * 1.6));
      if (u > 0.78) c.lerp(warm, (u - 0.78) / 0.22);
      c.multiplyScalar(0.55 + u * 0.9);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });
    return { positions: pos, colors: col };
  }, [base, f, amount]);
  if (amount <= 0.01) return null;
  return <PointLayer positions={positions} colors={colors} size={0.032} />;
};

// ------------------------------------------------------------------ report (assembles from returns)
const ReportK: React.FC<{ f: number; appear: number; glow: number }> = ({ f, appear, glow }) => {
  const cover = useMemo(() => reportCoverTexture(), []);
  const edge = useMemo(() => pageEdgeTexture(), []);
  const glowT = useMemo(() => glowTexture(), []);
  const [w, h, d] = REPORT_SIZE;
  const shell = useMemo(() => {
    const r = rng(4242);
    const pos: number[] = [];
    const col: number[] = [];
    const cyan = new THREE.Color(P.laserScanFront);
    const amber = new THREE.Color(P.measurementAccent);
    const c = new THREE.Color();
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
  if (appear <= 0.001) return null;
  const pulse = 1 + Math.sin(f / 20) * 0.04;
  const s = 0.15 + 0.85 * appear;
  return (
    <group position={REPORT_POS} rotation={[REPORT_ROT[0], REPORT_ROT[1] + (1 - appear) * 1.2, REPORT_ROT[2]]} scale={[s, s, s]}>
      <sprite position={[0, 0, -0.6]} scale={[4.2 * pulse * glow, 4.6 * pulse * glow, 1]}>
        <spriteMaterial map={glowT} transparent opacity={appear} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh>
        <RoundedBoxGeo args={[w, h, d]} radius={0.035} />
        <meshPhysicalMaterial color="#0a2232" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} emissive="#06384a" emissiveIntensity={0.5} transparent opacity={appear} />
      </mesh>
      <mesh position={[0, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w - 0.04, h - 0.04]} />
        <meshStandardMaterial map={cover} emissiveMap={cover} emissive="#ffffff" emissiveIntensity={0.95} roughness={0.4} toneMapped={false} transparent opacity={appear} />
      </mesh>
      <mesh position={[w / 2 + 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d - 0.06, h - 0.08]} />
        <meshStandardMaterial map={edge} emissiveMap={edge} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.9} transparent opacity={appear} />
      </mesh>
      <mesh position={[0, h / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[d - 0.06, w - 0.08]} />
        <meshStandardMaterial map={edge} emissiveMap={edge} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.9} transparent opacity={appear} />
      </mesh>
      <PointLayer positions={shell.positions} colors={shell.colors} size={0.026} opacity={appear} />
      <lineSegments geometry={boxEdges}>
        <lineBasicMaterial color={P.laserScanFront} transparent opacity={0.35 * appear} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

// ------------------------------------------------------------------ scene
export const WorldScene: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const scanX = scanAt(t);
  const hl = highlightAt(t);
  const sourcesOn = sm(rp(t, 8.6, 10.6));
  const appear = sm(rp(t, 7.6, 10.4));
  const flow = t < 11 ? sm(rp(t, 9.6, 11)) * 0.6 : t > 47 && t < 62 ? 1 : 0.6;
  const glow = 1 + (t > 47 && t < 62 ? 0.15 * Math.sin(t * 3) : 0) + sm(rp(t, 60.4, 61.6)) * 0.5;
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 9, 22]} />
      <CameraRig t={t} />
      <ambientLight intensity={0.35} color="#8fb8d0" />
      <pointLight position={[0, 0.4, 2.2]} intensity={6} distance={6} color="#7fefff" />
      <directionalLight position={[3, 6, 4]} intensity={0.9} color="#cfe8ff" />
      <Floor scanX={scanX} />
      <TabTunnel t={t} />
      <SourcesLit scanX={scanX} hl={hl} on={sourcesOn} />
      <Stakes t={t} hl={hl} />
      <FlowsK f={f} amount={flow} />
      <ReportK f={f} appear={appear} glow={glow} />
      {t > 6.6 && <Laser scanX={scanX} />}
      {sourcesOn > 0.9 && !(t > 59.9 && t < 62.05) && <Labels />}
    </>
  );
};
