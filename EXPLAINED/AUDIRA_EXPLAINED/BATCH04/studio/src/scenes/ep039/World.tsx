// AE-039 world: stepped cutaway of a subsea oil pipeline resting on the seabed.
// Layers (inside → out): wax deposit, steel wall, anti-corrosion coating, insulation, concrete
// weight coat. Inside: stratified oil + gas mixture and a cleaning pig pushed by the flow (+X).
// Everything is a pure function of `f` (60 fps film clock).

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { KEEP0, KEEP1, P, R, SEABED_Y, X } from "./layout.ts";

export const TAU = Math.PI * 2;
type RFn = (a: number, x: number) => number;

/**
 * Closed sector shell between rIn and rOut, from x0 to x1 and angle a0 to a1 (a: 0 = +Z, 90° = +Y).
 * Each face has its own vertices so cut faces stay crisp. Full rings skip the side faces.
 */
export function shellGeometry(x0: number, x1: number, a0: number, a1: number, rIn: RFn, rOut: RFn, nx = 24, na = 96) {
  const full = Math.abs(a1 - a0 - TAU) < 1e-4;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const pt = (x: number, r: number, a: number) => [x, r * Math.sin(a), r * Math.cos(a)];
  const grid = (cols: number, rows: number, at: (i: number, j: number) => number[], uvAt: (i: number, j: number) => number[]) => {
    const base = pos.length / 3;
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++) {
        pos.push(...at(i, j));
        uv.push(...uvAt(i, j));
      }
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const a = base + j * (cols + 1) + i;
        const b = a + 1;
        const c = a + cols + 1;
        const d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
  };
  const L = x1 - x0;
  const ax = (i: number) => a0 + ((a1 - a0) * i) / na;
  const xx = (j: number) => x0 + (L * j) / nx;
  // outer + inner surfaces
  grid(na, nx, (i, j) => pt(xx(j), rOut(ax(i), xx(j)), ax(i)), (i, j) => [(ax(i) * 1.4) / Math.PI, xx(j) / 2.2]);
  grid(na, nx, (i, j) => pt(xx(j), rIn(ax(i), xx(j)), ax(i)), (i, j) => [(ax(i) * 1.1) / Math.PI, xx(j) / 2.2]);
  // end caps (radial strips)
  const nr = 4;
  for (const x of [x0, x1])
    grid(na, nr, (i, j) => {
      const a = ax(i);
      const r = rIn(a, x) + ((rOut(a, x) - rIn(a, x)) * j) / nr;
      return pt(x, r, a);
    }, (i, j) => [ax(i) / Math.PI, j / nr * 0.2]);
  if (!full)
    for (const a of [a0, a1])
      grid(nx, nr, (i, j) => {
        const x = xx(i);
        const r = rIn(a, x) + ((rOut(a, x) - rIn(a, x)) * j) / nr;
        return pt(x, r, a);
      }, (i, j) => [xx(i) / 2.2, (j / nr) * 0.2]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const c = (v: number): RFn => () => v;

/** One pipe layer: cut sector near the camera, full ring beyond X.cutEnd. */
const Layer: React.FC<{
  x0: number;
  rIn: number;
  rOut: number;
  mat: React.ReactNode;
  far?: number;
}> = ({ x0, rIn, rOut, mat, far = X.far }) => {
  const [cut, full] = useMemo(
    () => [
      shellGeometry(x0, X.cutEnd, KEEP0, KEEP1, c(rIn), c(rOut), 30, 96),
      shellGeometry(X.cutEnd, far, 0, TAU, c(rIn), c(rOut), 40, 128),
    ],
    [x0, rIn, rOut, far],
  );
  return (
    <group>
      <mesh geometry={cut} castShadow receiveShadow>
        {mat}
      </mesh>
      <mesh geometry={full} castShadow receiveShadow>
        {mat}
      </mesh>
    </group>
  );
};

// ---------- fluid: stratified oil (bottom) with gas above ----------

export const LIQ_Y = -0.16;
function liquidGeometry(x0: number, x1: number, Rl: number) {
  // shape coords (sx, sy) = (-z, y); extruded along local Z → world +X via rotation.y = +90°
  const shape = new THREE.Shape();
  const aCut = KEEP1; // front cut ray
  const rRay = LIQ_Y / Math.sin(aCut);
  const toS = (r: number, a: number) => new THREE.Vector2(-r * Math.cos(a), r * Math.sin(a));
  const start = toS(rRay, aCut);
  shape.moveTo(start.x, start.y);
  const rim = toS(Rl, aCut);
  shape.lineTo(rim.x, rim.y);
  const aEnd = Math.PI + Math.asin(-LIQ_Y / Rl); // where the arc meets the surface on the far side
  const n = 40;
  for (let i = 1; i <= n; i++) {
    const a = aCut - ((aCut - aEnd) * i) / n;
    const p = toS(Rl, a);
    shape.lineTo(p.x, p.y);
  }
  shape.lineTo(start.x, start.y);
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 1, steps: 1 });
  return g;
}

const Liquid: React.FC<{ x0: number; x1: number; Rl: number; f: number }> = ({ x0, x1, Rl, f }) => {
  const g = useMemo(() => liquidGeometry(x0, x1, Rl), [x0, x1, Rl]);
  // rippled free surface on top of the body, travelling with the flow (+X)
  const surf = useMemo(() => {
    const zFar = -Math.sqrt(Rl * Rl - LIQ_Y * LIQ_Y) + 0.01;
    const zCut = (LIQ_Y / Math.sin(KEEP1)) * Math.cos(KEEP1);
    const nx = 120;
    const nz = 24;
    const geo = new THREE.PlaneGeometry(1, 1, nx, nz);
    const p = geo.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + 0.5;
      const v = p.getY(i) + 0.5;
      p.setXYZ(i, x0 + u * (x1 - x0), 0, zFar + v * (zCut - zFar));
    }
    geo.computeVertexNormals();
    return geo;
  }, [x0, x1, Rl]);
  useMemo(() => {
    const p = surf.getAttribute("position");
    const ph = (f / 60) * 2.2;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, LIQ_Y + 0.009 + 0.008 * Math.sin(x * 7.5 - ph + z * 2.2) + 0.005 * Math.sin(x * 15.1 - ph * 1.7 - z * 5.3));
    }
    p.needsUpdate = true;
    surf.computeVertexNormals();
  }, [surf, f]);
  return (
    <group>
      <mesh geometry={g} position={[x0, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <meshPhysicalMaterial color="#1a0b04" roughness={0.32} metalness={0} specularIntensity={0.35} sheen={0.3} sheenColor={P.oilSheen} envMapIntensity={0.2} />
      </mesh>
      <mesh geometry={surf} receiveShadow>
        <meshPhysicalMaterial color="#1e0d04" roughness={0.3} metalness={0} specularIntensity={0.3} specularColor="#c08050" envMapIntensity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Gas bubbles caught at the cut face and riding the surface (seeded). */
export const Bubbles: React.FC<{ x0: number; x1: number; f: number }> = ({ x0, x1, f }) => {
  const items = useMemo(() => {
    const rnd = prng(391);
    const out: { p: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const x = x0 + rnd() * (x1 - x0);
      const onSurface = rnd() < 0.55;
      if (onSurface) {
        const z = -0.6 + rnd() * 0.75;
        out.push({ p: [x, LIQ_Y + 0.005, z], s: 0.015 + rnd() * 0.03 });
      } else {
        // on the front cut plane (ray at KEEP1), below the surface
        const r = Math.abs(LIQ_Y / Math.sin(KEEP1)) + rnd() * 0.45;
        const y = r * Math.sin(KEEP1);
        if (y > LIQ_Y - 0.03) continue;
        out.push({ p: [x, y, r * Math.cos(KEEP1) + 0.01], s: 0.018 + rnd() * 0.035 });
      }
    }
    return out;
  }, [x0, x1]);
  const drift = (f / 60) * 0.35;
  return (
    <group>
      {items.map((b, i) => (
        <mesh key={i} position={[x0 + ((b.p[0] - x0 + drift) % (x1 - x0)), b.p[1], b.p[2]]} scale={b.s}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshPhysicalMaterial color="#8a5a2c" roughness={0.04} metalness={0.1} clearcoat={1} clearcoatRoughness={0.02} />
        </mesh>
      ))}
    </group>
  );
};

/** Flow chevrons floating in the gas space, pointing +X. */
export const FlowChevrons: React.FC<{ f: number }> = ({ f }) => {
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
  const phase = ((f / 60) * 0.9) % 0.55;
  const xs = [-3.3, -2.75, -2.2, -1.65];
  return (
    <group>
      {xs.map((x, i) => (
        <mesh key={i} geometry={shape} position={[x + phase, 0.22, -0.1]} rotation={[-Math.PI / 2 + 0.5, 0, 0]}>
          <meshBasicMaterial color={P.amber} toneMapped={false} transparent opacity={0.55 + 0.4 * (i / xs.length)} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- wax deposit ----------

const WaxDeposit: React.FC = () => {
  const g = useMemo(() => {
    const rnd = prng(77);
    const bumps = Array.from({ length: 64 }, () => rnd());
    const noise = (a: number, x: number) => {
      const i = Math.floor(((a / TAU) * 8 + x * 1.7) * 1) & 63;
      const j = Math.floor((a / TAU) * 13 + x * 2.9) & 63;
      return (bumps[i] + bumps[j]) * 0.5 + 0.18 * Math.sin(a * 9 + x * 5.3) + 0.12 * Math.sin(a * 17 - x * 8.1);
    };
    const thick = (a: number, x: number) => {
      // scraped film behind the pig, thick crust ahead of it, heavier on the cold bottom
      const ahead = THREE.MathUtils.smoothstep(x, X.pigFront + 0.05, X.pigFront + 0.6);
      const bottom = 0.5 + 0.5 * Math.max(0, -Math.sin(a));
      const crust = 0.13 + 0.1 * bottom + 0.06 * noise(a, x);
      return 0.006 + (crust - 0.006) * ahead;
    };
    return shellGeometry(X.pigFront - 0.02, X.cutEnd + 0.4, KEEP0, KEEP1, (a, x) => R.steelIn - thick(a, x), c(R.steelIn - 0.001), 120, 120);
  }, []);
  const grain = useSurfaceGrain(23, 0.4, 5);
  return (
    <mesh geometry={g} castShadow receiveShadow>
      <meshPhysicalMaterial color={P.wax} roughness={0.7} bumpMap={grain} bumpScale={1.6} sheen={0.4} sheenColor="#fff4dc" side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Wax shavings pushed ahead of the pig (seeded flakes). */
const Shavings: React.FC = () => {
  const items = useMemo(() => {
    const rnd = prng(1203);
    return Array.from({ length: 70 }, () => {
      const x = X.pigFront + 0.1 + rnd() * 0.55;
      const a = Math.PI * 1.5 + (rnd() - 0.5) * 1.1;
      const r = 0.5 - rnd() * 0.06;
      return { p: [x, r * Math.sin(a), r * Math.cos(a)] as [number, number, number], s: 0.025 + rnd() * 0.05, rot: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number] };
    });
  }, []);
  return (
    <group>
      {items.map((b, i) => (
        <mesh key={i} position={b.p} rotation={b.rot} scale={[b.s * 1.6, b.s * 0.45, b.s]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={P.wax} roughness={0.6} sheen={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- pig ----------

export const Brush: React.FC<{ x: number }> = ({ x }) => {
  const geo = useMemo(() => {
    const n = 90;
    const g = new THREE.CylinderGeometry(0.012, 0.012, 1, 4);
    const parts: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const rnd = prng(500 + Math.round(x * 10));
    for (let k = 0; k < 2; k++)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + k * 0.03;
        const len = 0.42;
        const r = 0.33 + len / 2;
        const p = new THREE.Vector3(x + (k - 0.5) * 0.05 + (rnd() - 0.5) * 0.02, r * Math.sin(a), r * Math.cos(a));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, Math.sin(a), Math.cos(a)));
        m.compose(p, q, new THREE.Vector3(1, len * (0.95 + rnd() * 0.1), 1));
        parts.push(g.clone().applyMatrix4(m));
      }
    // merge manually
    const pos: number[] = [];
    const nor: number[] = [];
    const idx: number[] = [];
    let base = 0;
    for (const pg of parts) {
      const pa = pg.getAttribute("position");
      const na = pg.getAttribute("normal");
      for (let i = 0; i < pa.count; i++) {
        pos.push(pa.getX(i), pa.getY(i), pa.getZ(i));
        nor.push(na.getX(i), na.getY(i), na.getZ(i));
      }
      const ix = pg.getIndex()!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + base);
      base += pa.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    out.setIndex(idx);
    return out;
  }, [x]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={P.brush} roughness={0.55} metalness={0.6} />
    </mesh>
  );
};

export const Cup: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => {
  const geo = useMemo(() => {
    // dished polyurethane cup: lathe profile (r, y) along the pig axis
    const prof: [number, number][] = [
      [0.3, -0.07],
      [0.7, -0.07],
      [0.775, -0.03],
      [0.785, 0.06],
      [0.74, 0.07],
      [0.66, 0.01],
      [0.3, 0.01],
    ];
    return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 96);
  }, []);
  return (
    <mesh geometry={geo} position={[x, 0, 0]} rotation={[0, 0, flip ? -Math.PI / 2 : Math.PI / 2]} castShadow receiveShadow>
      <meshPhysicalMaterial color={P.pigCup} {...POLISH.toyPlastic} roughness={0.38} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Pig: React.FC<{ f: number }> = ({ f }) => {
  const x0 = X.pigBack;
  const x1 = X.pigFront;
  const len = x1 - x0;
  const labelTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#b8c0c8";
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#1a1d21";
    g.font = `700 104px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 134);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    return t;
  }, []);
  return (
    <group>
      {/* steel body */}
      <mesh position={[(x0 + x1) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.31, 0.31, len - 0.1, 64]} />
        <meshPhysicalMaterial color={P.pigBody} metalness={0.9} roughness={0.28} clearcoat={0.3} />
      </mesh>
      {/* AUDIRA band printed on the body, rotated to face the camera */}
      {labelTex ? (
        <mesh position={[(x0 + x1) / 2 + 0.02, 0, 0]} rotation={[-0.5, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.313, 0.313, 0.62, 64, 1, true, -0.55, 1.1]} />
          <meshPhysicalMaterial map={labelTex} metalness={0.6} roughness={0.35} />
        </mesh>
      ) : null}
      {/* nose cone (front, +X) and tail */}
      <mesh position={[x1 - 0.02, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <sphereGeometry args={[0.31, 48, 24, 0, TAU, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={P.pigBody} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[x0 - 0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.2, 0.12, 32]} />
        <meshPhysicalMaterial color="#5b636c" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* cups (lips face backward, the flow pushes them) and brushes */}
      <Cup x={x0 + 0.08} />
      <Cup x={x0 + 0.62} />
      <Brush x={x0 + 1.05} />
      <Cup x={x1 - 0.32} />
      <Brush x={x1 - 0.12} />
    </group>
  );
};

// ---------- anode bracelets + stencil ----------

export const Anode: React.FC<{ x: number }> = ({ x }) => {
  const g = useMemo(() => shellGeometry(x - 0.26, x + 0.26, 0.12, TAU - 0.12, c(R.concOut - 0.02), c(R.concOut + 0.035), 4, 128), [x]);
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.anode} metalness={1} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      {[-0.17, 0.17].map((dx) => (
        <mesh key={dx} position={[x + dx, (R.concOut + 0.05) * Math.sin(0.12), (R.concOut + 0.05) * Math.cos(0.12)]} rotation={[0.12 + Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 6]} />
          <meshStandardMaterial color="#6b7178" metalness={1} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

export const Stencil: React.FC<{ x: number; text: string }> = ({ x, text }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const g = cv.getContext("2d")!;
    g.clearRect(0, 0, 1024, 512);
    g.fillStyle = "rgba(245,240,226,0.92)";
    g.font = `800 230px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 512, 262);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.center.set(0.5, 0.5);
    t.rotation = -Math.PI / 2;
    return t;
  }, [text]);
  if (!tex) return null;
  // cylinder patch around the pipe axis facing the camera side (+Z, slightly up)
  return (
    <mesh position={[x, 0, 0]} rotation={[-0.42, 0, Math.PI / 2]}>
      <cylinderGeometry args={[R.concOut + 0.004, R.concOut + 0.004, 1.5, 64, 1, true, -0.45, 0.9]} />
      <meshStandardMaterial map={tex} transparent roughness={0.9} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
};

// ---------- environment ----------

export const Seabed: React.FC = () => {
  const g = useMemo(() => {
    const geo = new THREE.PlaneGeometry(260, 260, 400, 400);
    geo.rotateX(-Math.PI / 2);
    const p = geo.getAttribute("position");
    const rnd = prng(9);
    const h = Array.from({ length: 32 * 32 }, () => rnd());
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const gx = Math.floor((x + 130) / 2.8) % 32;
      const gz = Math.floor((z + 130) / 2.8) % 32;
      let y = 0.06 * Math.sin(x * 2.3 + z * 0.9) + 0.035 * Math.sin(x * 5.1 - z * 3.7) + 0.12 * (h[gz * 32 + gx] - 0.5);
      // berm of sand along the pipe (scour mound)
      const d = Math.abs(z);
      y += 0.22 * Math.exp(-((d - 1.35) ** 2) / 0.18) * (x > X.conc ? 1 : 0.4);
      p.setY(i, y);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  const grain = useSurfaceGrain(51, 0.5, 18);
  return (
    <mesh geometry={g} position={[0, SEABED_Y, 0]} receiveShadow>
      <meshPhysicalMaterial color={P.sand} roughness={1} bumpMap={grain} bumpScale={0.8} />
    </mesh>
  );
};

export const Rocks: React.FC = () => {
  const rockGeo = useMemo(
    () =>
      [3, 17, 29, 41].map((seed) => {
        const g = new THREE.IcosahedronGeometry(1, 1);
        const rnd = prng(seed);
        const p = g.getAttribute("position");
        const seen = new Map<string, number>();
        for (let i = 0; i < p.count; i++) {
          const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
          let k = seen.get(key);
          if (k === undefined) {
            k = 0.72 + rnd() * 0.45;
            seen.set(key, k);
          }
          p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
        }
        g.computeVertexNormals();
        return g;
      }),
    [],
  );
  const items = useMemo(() => {
    const rnd = prng(4242);
    return Array.from({ length: 70 }, () => {
      const x = -14 + rnd() * 40;
      let z = (rnd() - 0.5) * 22;
      if (Math.abs(z) < 2.2) z += Math.sign(z || 1) * 2.2;
      return { p: [x, SEABED_Y + 0.02, z] as [number, number, number], s: 0.06 + rnd() * rnd() * 0.45, r: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number] };
    });
  }, []);
  return (
    <group>
      {items.map((r, i) => (
        <mesh key={i} position={r.p} rotation={r.r} scale={[r.s * 1.3, r.s * 0.55, r.s * 0.9]} castShadow receiveShadow>
          <primitive object={rockGeo[i % rockGeo.length]} attach="geometry" />
          <meshPhysicalMaterial color="#3d4746" roughness={0.92} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** Marine snow: seeded drifting particles. */
export const MarineSnow: React.FC<{ f: number }> = ({ f }) => {
  const geo = useMemo(() => {
    const rnd = prng(808);
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -10 + rnd() * 34;
      pos[i * 3 + 1] = -1 + rnd() * 12;
      pos[i * 3 + 2] = -14 + rnd() * 24;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} position={[0, -(f / 60) * 0.05, 0]}>
      <pointsMaterial color="#bfe8f2" size={0.035} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
};

/** Faint light shafts from the surface (additive, FX layer so AO ignores them). */
export const LightShafts: React.FC = () => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(160,225,240,0.55)");
    grad.addColorStop(1, "rgba(160,225,240,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    const side = g.createLinearGradient(0, 0, 64, 0);
    side.addColorStop(0, "rgba(0,0,0,1)");
    side.addColorStop(0.5, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = side;
    g.fillRect(0, 0, 64, 256);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  if (!tex) return null;
  const shafts: [number, number, number, number, number][] = [
    [6, -10, 3.2, 0.25, 0.5],
    [12, -16, 5, 0.3, 0.35],
    [2, -20, 4, 0.22, 0.4],
    [18, -9, 2.6, 0.28, 0.3],
  ];
  return (
    <group>
      {shafts.map(([x, z, w, tilt, op], i) => (
        <mesh key={i} position={[x, 7, z]} rotation={[0, -0.9, tilt]} layers={FX_LAYER}>
          <planeGeometry args={[w, 18]} />
          <meshBasicMaterial map={tex} transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

export const Backdrop: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(300, 48, 32);
    const p = g.getAttribute("position");
    const top = new THREE.Color(P.bgTop);
    const bot = new THREE.Color(P.fog);
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const t = THREE.MathUtils.smoothstep(p.getY(i) / 300, 0.0, 0.32);
      const k = bot.clone().lerp(top, t);
      col.set([k.r, k.g, k.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
};

export const World: React.FC<{ f: number }> = ({ f }) => {
  const concGrain = useSurfaceGrain(31, 0.55, 6);
  const insGrain = useSurfaceGrain(13, 0.3, 8);
  const steelGrain = useSurfaceGrain(61, 0.15, 4);
  const { scene } = useThree();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.Fog(P.fog, 11, 40);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  const spot = useMemo(() => {
    const s = new THREE.SpotLight("#ffc27a", 70, 34, 0.3, 0.8, 2);
    s.position.set(-10, 6, 6);
    s.target.position.set(-2.2, -0.2, 0);
    s.castShadow = true;
    s.shadow.mapSize.set(1024, 1024);
    return s;
  }, []);
  return (
    <group>
      <Backdrop />

      {/* light: surface light from above, warm inspection key, cyan rim */}
      <hemisphereLight args={["#5fb6d1", "#0b0e10", 0.55]} />
      <directionalLight
        position={[-4, 14, 6]}
        intensity={2.3}
        color="#d9f1ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
      />
      <primitive object={spot} />
      <primitive object={spot.target} />
      <pointLight position={[-2.4, 0.3, -0.2]} intensity={1.6} distance={3.5} color="#ff9a3c" />
      <pointLight position={[8, 4, -7]} intensity={26} distance={20} color="#55d6ff" />

      <LightShafts />
      <Seabed />
      <Rocks />
      <MarineSnow f={f} />

      {/* pipe layers, stepped toward the camera */}
      <Layer x0={X.conc} rIn={R.insOut} rOut={R.concOut} mat={<meshPhysicalMaterial color={P.concrete} roughness={0.97} bumpMap={concGrain} bumpScale={2.2} side={THREE.DoubleSide} />} />
      <Layer x0={X.ins} rIn={R.coatOut} rOut={R.insOut} mat={<meshPhysicalMaterial color={P.insulation} roughness={0.7} bumpMap={insGrain} bumpScale={1.2} side={THREE.DoubleSide} />} />
      <Layer x0={X.coat} rIn={R.steelOut} rOut={R.coatOut} far={X.cutEnd + 0.5} mat={<meshPhysicalMaterial color={P.coating} roughness={0.35} clearcoat={0.6} side={THREE.DoubleSide} />} />
      <Layer x0={X.steel} rIn={R.steelIn} rOut={R.steelOut} far={X.cutEnd + 0.5} mat={<meshPhysicalMaterial color={P.steel} metalness={0.85} roughness={0.42} bumpMap={steelGrain} bumpScale={0.4} side={THREE.DoubleSide} />} />

      <WaxDeposit />
      <Liquid x0={X.steel + 0.15} x1={X.pigBack - 0.06} Rl={R.steelIn - 0.004} f={f} />
      <Liquid x0={X.pigFront + 0.12} x1={X.cutEnd + 0.3} Rl={R.steelIn - 0.3} f={f} />
      <Bubbles x0={X.steel + 0.2} x1={X.pigBack - 0.1} f={f} />
      <FlowChevrons f={f} />
      <Pig f={f} />
      <Shavings />

      <Anode x={5.7} />
      <Anode x={12} />
      <Anode x={18.3} />
      <Stencil x={4.25} text="AUDIRA" />
      {/* dark oil plug so the far opening reads as a full pipe, not a hollow tube */}
      <mesh position={[X.cutEnd + 0.35, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[R.steelIn - 0.005, 64]} />
        <meshStandardMaterial color="#120802" roughness={0.3} />
      </mesh>
    </group>
  );
};
