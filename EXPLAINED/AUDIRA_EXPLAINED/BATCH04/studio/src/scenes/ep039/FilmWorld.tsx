// AE-039 film: parametric pipe world (same coordinates and parts as the cover).
// Pure function of the WorldState computed from VO time.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { KEEP0, KEEP1, P, R, X } from "./layout.ts";
import { Anode, Backdrop, Brush, Cup, LIQ_Y, LightShafts, MarineSnow, Rocks, Seabed, Stencil, TAU, c, shellGeometry } from "./World.tsx";

export type PipeState = {
  t: number;
  concX0: number; // near end of the concrete step (>= X.cutEnd = no cut part)
  insX0: number;
  coatGlow: number; // 0..1 highlight
  anodeGlow: number;
  steelHeat: number; // DEH warm glow 0..1
  growth: number; // wax crust 0..1
  scrapeX: number; // wax behind this x is scraped thin
  pigDx: number | null;
  smartDx: number | null;
  heat: number; // heat-loss arrows 0..1
  cable: number; // DEH cable visibility 0..1
  corrosion: number; // 0 hidden, 1 shown, 2 detected
};

const FAR = 120;
const WATER_Y = -0.56;

// ---------- layers ----------
const LayerD: React.FC<{ x0: number; rIn: number; rOut: number; far?: number; children: React.ReactNode }> = ({ x0, rIn, rOut, far = FAR, children }) => {
  const xq = Math.round(x0 * 100) / 100;
  const cut = useMemo(() => (xq < X.cutEnd - 0.01 ? shellGeometry(xq, X.cutEnd, KEEP0, KEEP1, c(rIn), c(rOut), 24, 96) : null), [xq, rIn, rOut]);
  const full = useMemo(() => shellGeometry(X.cutEnd, far, 0, TAU, c(rIn), c(rOut), 60, 112), [rIn, rOut, far]);
  return (
    <group>
      {cut ? (
        <mesh geometry={cut} castShadow receiveShadow>
          {children}
        </mesh>
      ) : null}
      <mesh geometry={full} castShadow receiveShadow>
        {children}
      </mesh>
    </group>
  );
};

// ---------- liquid between two levels (water below, oil above) ----------
function bodyGeometry(x0: number, x1: number, Rl: number, top: number, aCut: number) {
  const toS = (r: number, a: number) => new THREE.Vector2(-r * Math.cos(a), r * Math.sin(a));
  const shape = new THREE.Shape();
  const rRay = top / Math.sin(aCut);
  const start = toS(rRay, aCut);
  shape.moveTo(start.x, start.y);
  const rim = toS(Rl, aCut);
  shape.lineTo(rim.x, rim.y);
  const aEnd = Math.PI + Math.asin(-top / Rl);
  for (let i = 1; i <= 40; i++) {
    const p = toS(Rl, aCut - ((aCut - aEnd) * i) / 40);
    shape.lineTo(p.x, p.y);
  }
  shape.lineTo(start.x, start.y);
  return new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.01, x1 - x0), bevelEnabled: false, curveSegments: 1, steps: 1 });
}

const OIL_CUT = KEEP1 - 0.012;
const WATER_CUT = KEEP1 - 0.004;

const Body: React.FC<{ x0: number; x1: number; Rl: number; top: number; aCut: number; color: string; rough: number }> = ({ x0, x1, Rl, top, aCut, color, rough }) => {
  const key = `${x0.toFixed(2)}:${x1.toFixed(2)}:${Rl.toFixed(3)}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ok = Rl > Math.abs(top) + 0.02;
  const g = useMemo(() => (ok ? bodyGeometry(x0, x1, Rl, top, aCut) : null), [key, top, aCut, ok]);
  if (!g || x1 - x0 < 0.02) return null;
  return (
    <mesh geometry={g} position={[x0, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <meshPhysicalMaterial color={color} roughness={rough} metalness={0} specularIntensity={0.2} envMapIntensity={0.15} />
    </mesh>
  );
};

/** Free surface of the oil: low, broad ripples and a dim specular so it reads as thick dark oil. */
const OilSurface: React.FC<{ x0: number; x1: number; Rl: number; t: number }> = ({ x0, x1, Rl, t }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 90, 16), []);
  useMemo(() => {
    const zFar = -Math.sqrt(Math.max(0.01, Rl * Rl - LIQ_Y * LIQ_Y)) + 0.01;
    const zCut = (LIQ_Y / Math.sin(OIL_CUT)) * Math.cos(OIL_CUT);
    const p = geo.getAttribute("position");
    const uv = geo.getAttribute("uv");
    const ph = t * 1.6;
    for (let i = 0; i < p.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      const x = x0 + u * (x1 - x0);
      const z = zFar + v * (zCut - zFar);
      p.setXYZ(i, x, LIQ_Y + 0.006 + 0.004 * Math.sin(x * 4.2 - ph + z * 1.3), z);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, x0, x1, Rl, t]);
  if (x1 - x0 < 0.02) return null;
  return (
    <mesh geometry={geo} receiveShadow>
      <meshPhysicalMaterial color="#160903" roughness={0.42} metalness={0} specularIntensity={0.18} specularColor="#a0603a" envMapIntensity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Gas bubbles: rise through the oil on the cut face and pop at the surface (seeded, looped). */
const GasBubbles: React.FC<{ x0: number; x1: number; t: number }> = ({ x0, x1, t }) => {
  const items = useMemo(() => {
    const rnd = prng(911);
    return Array.from({ length: 40 }, () => ({ u: rnd(), ph: rnd(), sp: 0.25 + rnd() * 0.3, s: 0.018 + rnd() * 0.03, d: rnd() }));
  }, []);
  const rRay0 = Math.abs(WATER_Y / Math.sin(OIL_CUT));
  const rRay1 = Math.abs(LIQ_Y / Math.sin(OIL_CUT));
  return (
    <group>
      {items.map((b, i) => {
        const k = (b.ph + t * b.sp) % 1;
        const x = x0 + ((b.u * (x1 - x0) + t * 0.5) % (x1 - x0));
        const r = lerpN(rRay0, rRay1, k);
        const y = r * Math.sin(OIL_CUT);
        const z = r * Math.cos(OIL_CUT) + 0.012 + b.d * 0.01;
        const s = b.s * (k > 0.92 ? (1 - k) / 0.08 : 1);
        return (
          <mesh key={i} position={[x, y, z]} scale={s}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshPhysicalMaterial color="#c9a27a" roughness={0.08} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

const Chevrons: React.FC<{ t: number; x0: number; x1: number; y?: number; z?: number; op?: number }> = ({ t, x0, x1, y = 0.24, z = -0.1, op = 1 }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(-0.16, 0.13);
    s.lineTo(-0.1, 0.13);
    s.lineTo(0.06, 0);
    s.lineTo(-0.1, -0.13);
    s.lineTo(-0.16, -0.13);
    s.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
  }, []);
  if (op <= 0 || x1 - x0 < 0.3) return null;
  const gap = 0.55;
  const n = Math.floor((x1 - x0) / gap);
  const ph = (t * 0.9) % gap;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * gap + ph;
        if (x > x1) return null;
        const fade = Math.min(1, (x - x0) / 0.4, (x1 - x) / 0.4);
        return (
          <mesh key={i} geometry={shape} position={[x, y, z]} rotation={[-Math.PI / 2 + 0.5, 0, 0]}>
            <meshBasicMaterial color={P.amber} toneMapped={false} transparent opacity={op * fade * 0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- wax ----------
const WaxD: React.FC<{ growth: number; scrapeX: number }> = ({ growth, scrapeX }) => {
  const gq = Math.round(growth * 40) / 40;
  const sq = Math.round(scrapeX * 25) / 25;
  const g = useMemo(() => {
    if (gq <= 0.001) return null;
    const rnd = prng(77);
    const bumps = Array.from({ length: 64 }, () => rnd());
    const noise = (a: number, x: number) => {
      const i = Math.floor((a / TAU) * 8 + x * 1.7) & 63;
      const j = Math.floor((a / TAU) * 13 + x * 2.9) & 63;
      return (bumps[i] + bumps[j]) * 0.5 + 0.18 * Math.sin(a * 9 + x * 5.3) + 0.12 * Math.sin(a * 17 - x * 8.1);
    };
    const thick = (a: number, x: number) => {
      const ahead = THREE.MathUtils.smoothstep(x, sq + 0.05, sq + 0.6);
      const bottom = 0.5 + 0.5 * Math.max(0, -Math.sin(a));
      const crust = (0.13 + 0.1 * bottom + 0.06 * noise(a, x)) * gq;
      return 0.006 + Math.max(0, crust - 0.006) * ahead;
    };
    return shellGeometry(X.steel + 0.12, X.cutEnd + 0.4, KEEP0, KEEP1, (a, x) => R.steelIn - thick(a, x), c(R.steelIn - 0.001), 110, 110);
  }, [gq, sq]);
  const grain = useSurfaceGrain(23, 0.4, 5);
  if (!g) return null;
  return (
    <mesh geometry={g} castShadow receiveShadow>
      <meshPhysicalMaterial color={P.wax} roughness={0.7} bumpMap={grain} bumpScale={1.6} sheen={0.4} sheenColor="#fff4dc" side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Crystal glints appearing on the crust while it forms (FX layer). */
const WaxGlints: React.FC<{ growth: number; t: number }> = ({ growth, t }) => {
  const items = useMemo(() => {
    const rnd = prng(321);
    return Array.from({ length: 60 }, () => {
      const x = -2.6 + rnd() * 5.6;
      const a = KEEP0 + 0.1 + rnd() * (KEEP1 - KEEP0 - 0.2);
      return { x, a, k: rnd(), s: 0.02 + rnd() * 0.03 };
    });
  }, []);
  if (growth <= 0.02 || growth >= 0.999) return null;
  return (
    <group>
      {items.map((g, i) => {
        const on = THREE.MathUtils.smoothstep(growth, g.k * 0.8, g.k * 0.8 + 0.12) * (1 - THREE.MathUtils.smoothstep(growth, g.k * 0.8 + 0.2, g.k * 0.8 + 0.35));
        if (on <= 0.01) return null;
        const r = R.steelIn - 0.12 * growth - 0.02;
        return (
          <mesh key={i} position={[g.x, r * Math.sin(g.a), r * Math.cos(g.a)]} rotation={[t * 2 + i, i, 0]} scale={g.s * on} layers={FX_LAYER}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#fffbe8" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const ShavingsD: React.FC<{ front: number; amount: number }> = ({ front, amount }) => {
  const items = useMemo(() => {
    const rnd = prng(1203);
    return Array.from({ length: 60 }, () => {
      const dx = 0.1 + rnd() * 0.55;
      const a = Math.PI * 1.5 + (rnd() - 0.5) * 1.1;
      const r = 0.5 - rnd() * 0.06;
      return { dx, a, r, s: 0.025 + rnd() * 0.05, rot: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number], k: rnd() };
    });
  }, []);
  if (amount <= 0) return null;
  return (
    <group>
      {items.map((b, i) =>
        b.k > amount ? null : (
          <mesh key={i} position={[front + b.dx, b.r * Math.sin(b.a), b.r * Math.cos(b.a)]} rotation={b.rot} scale={[b.s * 1.6, b.s * 0.45, b.s]} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial color={P.wax} roughness={0.6} sheen={0.4} />
          </mesh>
        ),
      )}
    </group>
  );
};

// ---------- pigs ----------
const textTex = (text: string, bg: string, fg: string, w = 512, h = 256, size = 104) => {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = `700 ${size}px ${FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.center.set(0.5, 0.5);
  t.rotation = -Math.PI / 2;
  return t;
};

/** Cleaning pig, built along +X from local 0 (tail) to 1.9 (nose). */
export const CleaningPig: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
      <cylinderGeometry args={[0.31, 0.31, 1.8, 64]} />
      <meshPhysicalMaterial color={P.pigBody} metalness={0.9} roughness={0.28} clearcoat={0.3} />
    </mesh>
    <mesh position={[1.88, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
      <sphereGeometry args={[0.31, 48, 24, 0, TAU, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color={P.pigBody} metalness={0.9} roughness={0.25} />
    </mesh>
    <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.12, 0.2, 0.12, 32]} />
      <meshPhysicalMaterial color="#5b636c" metalness={0.9} roughness={0.35} />
    </mesh>
    <Cup x={0.08} />
    <Cup x={0.62} />
    <Brush x={1.05} />
    <Cup x={1.58} />
    <Brush x={1.78} />
  </group>
);

/** Smart (inspection) pig: drive module with cups, sensor ring of pads, odometer wheels, AUDIRA print. */
const SmartPig: React.FC<{ x: number; scan: number }> = ({ x, scan }) => {
  const label = useMemo(() => textTex("AUDIRA", "#d9dee3", "#15191d", 512, 256, 120), []);
  const pads = useMemo(() => Array.from({ length: 36 }, (_, i) => (i / 36) * TAU), []);
  return (
    <group position={[x, 0, 0]}>
      {/* drive module */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.0, 48]} />
        <meshPhysicalMaterial color="#d9dee3" metalness={0.7} roughness={0.3} clearcoat={0.4} />
      </mesh>
      {label ? (
        <mesh position={[1.5, 0, 0]} rotation={[-0.5, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.303, 0.303, 0.8, 48, 1, true, -0.6, 1.2]} />
          <meshPhysicalMaterial map={label} metalness={0.5} roughness={0.35} />
        </mesh>
      ) : null}
      <mesh position={[2.02, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <sphereGeometry args={[0.3, 40, 20, 0, TAU, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#d9dee3" metalness={0.7} roughness={0.3} />
      </mesh>
      <Cup x={1.1} />
      <Cup x={1.85} />
      {/* joint */}
      <mesh position={[0.82, 0, 0]}>
        <sphereGeometry args={[0.14, 24, 16]} />
        <meshPhysicalMaterial color="#5b636c" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* sensor module */}
      <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.8, 48]} />
        <meshPhysicalMaterial color="#2c3238" metalness={0.6} roughness={0.35} />
      </mesh>
      {pads.map((a, i) => {
        const r = 0.58;
        return (
          <group key={i}>
            <mesh position={[0.35, r * Math.sin(a), r * Math.cos(a)]} rotation={[-a, 0, 0]} castShadow>
              <boxGeometry args={[0.34, 0.06, 0.09]} />
              <meshPhysicalMaterial color="#1b2a30" emissive={P.cyan} emissiveIntensity={0.25 + 1.2 * scan} roughness={0.4} />
            </mesh>
            {i % 3 === 0 ? (
              <mesh position={[0.35, 0.42 * Math.sin(a), 0.42 * Math.cos(a)]} rotation={[-a, 0, 0]}>
                <boxGeometry args={[0.05, 0.3, 0.03]} />
                <meshStandardMaterial color="#8b939c" metalness={0.9} roughness={0.3} />
              </mesh>
            ) : null}
          </group>
        );
      })}
      <Cup x={-0.1} />
      {/* odometer wheels */}
      {[0.6, 2.2, 4.0].map((a, i) => (
        <mesh key={i} position={[-0.25, 0.66 * Math.sin(a), 0.66 * Math.cos(a)]} rotation={[a, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 24]} />
          <meshStandardMaterial color="#20252a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/** Scan ring of light sweeping the wall around the sensor module (FX layer). */
const ScanRing: React.FC<{ x: number; on: number }> = ({ x, on }) => {
  if (on <= 0) return null;
  return (
    <mesh position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} layers={FX_LAYER}>
      <torusGeometry args={[R.steelIn - 0.02, 0.012, 8, 96]} />
      <meshBasicMaterial color={P.cyan} toneMapped={false} transparent opacity={on} />
    </mesh>
  );
};

/** Corrosion pit on the inner wall (visible through the cut). */
export const CORROSION: [number, number, number] = [2.05, (R.steelIn - 0.02) * Math.sin((150 * Math.PI) / 180), (R.steelIn - 0.02) * Math.cos((150 * Math.PI) / 180)];
const Corrosion: React.FC<{ state: number; t: number }> = ({ state, t }) => {
  const g = useMemo(() => {
    const a = (150 * Math.PI) / 180;
    return shellGeometry(1.85, 2.25, a - 0.22, a + 0.22, (aa, x) => R.steelIn - 0.016 - 0.008 * Math.sin(aa * 30 + x * 25), c(R.steelIn - 0.004), 12, 16);
  }, []);
  if (state <= 0) return null;
  const pulse = state >= 2 ? 0.5 + 0.5 * Math.sin(t * 10) : 0;
  return (
    <mesh geometry={g}>
      <meshPhysicalMaterial color="#8a3c18" roughness={0.95} emissive="#ff3b2f" emissiveIntensity={pulse * 1.2} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- exterior extras ----------
/** Heat leaving the pipe: wavy amber-to-blue arrows moving radially outward (FX layer). */
const HeatLoss: React.FC<{ on: number; t: number }> = ({ on, t }) => {
  const items = useMemo(() => {
    const out: { x: number; a: number; ph: number }[] = [];
    const rnd = prng(57);
    for (let i = 0; i < 22; i++) out.push({ x: -1 + rnd() * 9, a: (rnd() - 0.2) * Math.PI * 1.2 + 0.2, ph: rnd() });
    return out;
  }, []);
  if (on <= 0) return null;
  return (
    <group>
      {items.map((h, i) => {
        const k = (h.ph + t * 0.45) % 1;
        const r = R.concOut + 0.15 + k * 1.6;
        const col = new THREE.Color("#ff9a3c").lerp(new THREE.Color("#5fd0ff"), k);
        return (
          <mesh key={i} position={[h.x, r * Math.sin(h.a), r * Math.cos(h.a)]} rotation={[-h.a + Math.PI / 2, 0, 0]} layers={FX_LAYER}>
            <coneGeometry args={[0.07, 0.22, 10]} />
            <meshBasicMaterial color={col} toneMapped={false} transparent opacity={on * Math.sin(k * Math.PI) * 0.9} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** DEH cable riding on top of the insulation with current pulses. */
const DehCable: React.FC<{ on: number; t: number; x0: number }> = ({ on, t, x0 }) => {
  if (on <= 0) return null;
  const a = (95 * Math.PI) / 180;
  const r = R.insOut + 0.05;
  const y = r * Math.sin(a);
  const z = r * Math.cos(a);
  const len = 14 - x0;
  return (
    <group>
      <mesh position={[x0 + len / 2, y, z]} rotation={[0, 0, Math.PI / 2]} scale={[1, on, 1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, len, 16]} />
        <meshPhysicalMaterial color="#1a1c1f" roughness={0.5} clearcoat={0.4} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const x = x0 + ((i * 1.3 + t * 3.2) % len);
        return (
          <mesh key={i} position={[x, y, z]} layers={FX_LAYER}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} transparent opacity={on} />
          </mesh>
        );
      })}
    </group>
  );
};

export const FilmPipeWorld: React.FC<{ s: PipeState }> = ({ s }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.Fog(P.fog, 11, 46);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  const spot = useMemo(() => {
    const sp = new THREE.SpotLight("#ffc27a", 70, 34, 0.3, 0.8, 2);
    sp.position.set(-10, 6, 6);
    sp.target.position.set(-2.2, -0.2, 0);
    sp.castShadow = true;
    sp.shadow.mapSize.set(1024, 1024);
    return sp;
  }, []);
  const concGrain = useSurfaceGrain(31, 0.55, 6);
  const insGrain = useSurfaceGrain(13, 0.3, 8);
  const steelGrain = useSurfaceGrain(61, 0.15, 4);
  const t = s.t;
  const pigX = s.pigDx;
  const scrape = pigX !== null ? pigX + 1.95 : s.scrapeX;
  const oilStart = X.steel + 0.15;
  const oilEnd = X.cutEnd + 0.3;
  // oil is displaced where a pig fills the bore
  const pigSpan: [number, number] | null = pigX !== null ? [pigX - 0.08, pigX + 2.0] : s.smartDx !== null ? [s.smartDx - 0.3, s.smartDx + 2.1] : null;
  const RlAhead = R.steelIn - 0.004 - 0.3 * s.growth;
  const segs: [number, number, number][] = [];
  const pushSeg = (a: number, b: number) => {
    if (b - a < 0.02) return;
    // split at the scrape line: thin film behind, crust ahead
    if (scrape > a && scrape < b) {
      segs.push([a, scrape, R.steelIn - 0.01]);
      segs.push([scrape, b, RlAhead]);
    } else segs.push([a, b, scrape >= b ? R.steelIn - 0.01 : RlAhead]);
  };
  if (pigSpan) {
    pushSeg(oilStart, Math.max(oilStart, pigSpan[0]));
    pushSeg(Math.min(oilEnd, pigSpan[1]), oilEnd);
  } else pushSeg(oilStart, oilEnd);

  const steelEm = s.steelHeat;
  const sensorX = s.smartDx !== null ? s.smartDx + 0.35 : 0;
  return (
    <group>
      <Backdrop />
      <hemisphereLight args={["#5fb6d1", "#0b0e10", 0.55]} />
      <directionalLight position={[-4, 14, 6]} intensity={2.3} color="#d9f1ff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
      <primitive object={spot} />
      <primitive object={spot.target} />
      <pointLight position={[-2.4, 0.3, -0.2]} intensity={1.6} distance={3.5} color="#ff9a3c" />
      <pointLight position={[8, 4, -7]} intensity={26} distance={20} color="#55d6ff" />
      {steelEm > 0 ? <pointLight position={[0.5, 0.2, 0]} intensity={4 * steelEm} distance={5} color="#ff7a2a" /> : null}

      <LightShafts />
      <Seabed />
      <Rocks />
      <MarineSnow f={t * 60} />

      <LayerD x0={s.concX0} rIn={R.insOut} rOut={R.concOut}>
        <meshPhysicalMaterial color={P.concrete} roughness={0.97} bumpMap={concGrain} bumpScale={2.2} side={THREE.DoubleSide} />
      </LayerD>
      <LayerD x0={s.insX0} rIn={R.coatOut} rOut={R.insOut} far={X.cutEnd + 0.5}>
        <meshPhysicalMaterial color={P.insulation} roughness={0.7} bumpMap={insGrain} bumpScale={1.2} side={THREE.DoubleSide} />
      </LayerD>
      <LayerD x0={X.coat} rIn={R.steelOut} rOut={R.coatOut} far={X.cutEnd + 0.5}>
        <meshPhysicalMaterial color={P.coating} roughness={0.35} clearcoat={0.6} emissive="#3fb7ff" emissiveIntensity={s.coatGlow * 0.7} side={THREE.DoubleSide} />
      </LayerD>
      <LayerD x0={X.steel} rIn={R.steelIn} rOut={R.steelOut} far={X.cutEnd + 0.5}>
        <meshPhysicalMaterial color={P.steel} metalness={0.85} roughness={0.42} bumpMap={steelGrain} bumpScale={0.4} emissive="#ff5a14" emissiveIntensity={steelEm * (0.55 + 0.15 * Math.sin(t * 6))} side={THREE.DoubleSide} />
      </LayerD>

      <WaxD growth={s.growth} scrapeX={scrape} />
      <WaxGlints growth={s.growth} t={t} />
      {segs.map(([a, b, Rl], i) => (
        <group key={`seg${i}`}>
          <Body x0={a} x1={b} Rl={Rl} top={LIQ_Y} aCut={OIL_CUT} color="#1a0b04" rough={0.4} />
          <Body x0={a} x1={b} Rl={Rl - 0.003} top={WATER_Y} aCut={WATER_CUT} color="#33505a" rough={0.3} />
          <OilSurface x0={a} x1={b} Rl={Rl} t={t} />
        </group>
      ))}
      <GasBubbles x0={oilStart + 0.1} x1={pigSpan ? Math.max(oilStart + 0.4, pigSpan[0] - 0.1) : oilEnd - 0.3} t={t} />
      <Chevrons t={t} x0={oilStart + 0.1} x1={pigSpan ? pigSpan[0] - 0.1 : X.cutEnd - 0.2} />
      {pigX !== null ? <CleaningPig x={pigX} /> : null}
      {pigX !== null ? <ShavingsD front={pigX + 1.95} amount={s.growth} /> : null}
      {s.smartDx !== null ? <SmartPig x={s.smartDx} scan={0.5 + 0.5 * Math.sin(t * 8)} /> : null}
      {s.smartDx !== null ? <ScanRing x={sensorX} on={0.9} /> : null}
      <Corrosion state={s.corrosion} t={t} />

      {Array.from({ length: 18 }, (_, i) => 5.7 + i * 6.3).map((x) => (
        <group key={x}>
          <Anode x={x} />
          {s.anodeGlow > 0 && x < 20 ? (
            <mesh position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} layers={FX_LAYER}>
              <torusGeometry args={[R.concOut + 0.07, 0.025, 8, 96]} />
              <meshBasicMaterial color={P.cyan} toneMapped={false} transparent opacity={s.anodeGlow} />
            </mesh>
          ) : null}
        </group>
      ))}
      <Stencil x={4.25} text="AUDIRA" />
      <HeatLoss on={s.heat} t={t} />
      <DehCable on={s.cable} t={t} x0={Math.max(s.insX0, X.ins)} />
      <mesh position={[X.cutEnd + 0.35, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[R.steelIn - 0.005, 64]} />
        <meshStandardMaterial color="#120802" roughness={0.3} />
      </mesh>
    </group>
  );
};

