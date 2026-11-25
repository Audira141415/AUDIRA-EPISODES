// EP09 world: a pastel low-poly town. Square with a fountain at the origin, a ring of houses,
// fields and a river behind the town, and the teacher's quiet house on the hill across the river.
// Everything is a pure function of the 60 fps film clock `f` (no useFrame, no Math.random).

import React, { useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { LowPolyTree } from "../../kits/polyverse/nature/LowPolyTree.tsx";
import { PAL } from "./palette.ts";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------------------------
// Layout constants (shared with the film for camera targets and character marks)
export const HILL = { x: 13, z: -27, h: 6.2 };
export const riverZ = (x: number) => -13.5 + 2.4 * Math.sin(x * 0.085 + 0.6);
export const BRIDGE_X = 4.5;

export function heightAt(x: number, z: number): number {
  const g = (cx: number, cz: number, s: number, a: number) => a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));
  let h = g(HILL.x, HILL.z, 7, HILL.h) + g(-24, -32, 9, 4.5) + g(36, -10, 9, 3.4) + g(-38, 6, 10, 2.6) + g(30, 22, 10, 2);
  h += 0.32 * Math.sin(x * 0.31 + 1.3) * Math.sin(z * 0.27 + 0.4) + 0.18 * Math.sin(x * 0.13 - z * 0.21);
  // flatten the town plateau
  const r = Math.hypot(x, z * 1.1);
  h *= sstep((r - 11) / 7);
  // carve the river
  const d = Math.abs(z - riverZ(x));
  const bank = sstep((d - 1.3) / 2.2);
  h = h * bank + -0.9 * (1 - bank);
  return h;
}

// ---------------------------------------------------------------------------------------------
const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g0 = new THREE.PlaneGeometry(170, 150, 96, 84);
    g0.rotateX(-Math.PI / 2);
    g0.translate(0, 0, -25);
    const pos = g0.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      // tiny seeded jitter keeps the facets irregular
      const j = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
      const jr = (j - Math.floor(j) - 0.5) * 0.18;
      pos.setY(i, heightAt(x, z) + (Math.hypot(x, z) > 12 ? jr : 0));
    }
    const g = g0.toNonIndexed();
    g0.dispose();
    const p = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const cols = {
      a: new THREE.Color(PAL.grassA), b: new THREE.Color(PAL.grassB), hi: new THREE.Color(PAL.grassHigh),
      deep: new THREE.Color(PAL.meadowDeep), sand: new THREE.Color(PAL.sand),
      fields: [PAL.fieldWheat, PAL.fieldSage, PAL.fieldLavender, PAL.fieldPeach].map((s) => new THREE.Color(s)),
    };
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const hs = Math.sin(i * 0.731) * 9999;
      const n = hs - Math.floor(hs);
      c.copy(n < 0.5 ? cols.a : cols.b);
      if (cy > 2.4) c.lerp(cols.hi, 0.6);
      const dRiver = Math.abs(cz - riverZ(cx));
      const rTown = Math.hypot(cx, cz * 1.1);
      // patchwork fields between the town and the hills
      const fx = Math.floor((cx + 200) / 6.5), fz = Math.floor((cz + 200) / 4.5);
      const fh = Math.sin(fx * 127.1 + fz * 311.7) * 43758.5453;
      const fr = fh - Math.floor(fh);
      if (rTown > 13 && dRiver > 3.6 && cy < 2.2 && fr > 0.5) {
        c.copy(cols.fields[Math.floor(fr * 97) % 4]);
        // furrow stripes
        if (Math.floor(cz * 2.2) % 2 === 0) c.multiplyScalar(0.94);
      }
      if (dRiver < 2.6) c.copy(cols.sand);
      if (rTown < 10) c.lerp(cols.deep, 0.15);
      for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0} />
    </mesh>
  );
};

const Water: React.FC<{ f: number }> = ({ f }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(170, 18, 110, 12);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  // bend the strip along the river and ripple the facets
  useMemo(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = f / 60;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const zl = (Math.floor(i / 111) / 12 - 0.5) * 18;
      pos.setZ(i, riverZ(x) + zl * 0.32);
      pos.setY(i, -0.32 + 0.05 * Math.sin(x * 0.9 + t * 1.6 + zl) + 0.03 * Math.sin(zl * 2.1 - t * 1.1));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, f]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={PAL.water} flatShading roughness={0.18} metalness={0.05} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------------------------
// Houses
const roofGeoCache = new Map<string, THREE.BufferGeometry>();
const roofGeo = (w: number, d: number, rh: number) => {
  const key = `${w}:${d}:${rh}`;
  const hit = roofGeoCache.get(key);
  if (hit) return hit;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, rh);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  roofGeoCache.set(key, g);
  return g;
};

export type HouseSpec = {
  x: number; z: number; heading: number; w: number; d: number; h: number;
  wall: string; roof: string; chimney: boolean; sign?: string; lit?: number;
};

const Window: React.FC<{ p: [number, number, number]; lit: number; w?: number; h?: number }> = ({ p, lit, w = 0.26, h = 0.3 }) => (
  <group position={p}>
    <mesh position={[0, 0, 0.01]}>
      <boxGeometry args={[w + 0.08, h + 0.08, 0.04]} />
      <meshStandardMaterial color={PAL.woodLight} flatShading roughness={0.8} />
    </mesh>
    <mesh position={[0, 0, 0.035]}>
      <boxGeometry args={[w, h, 0.02]} />
      <meshStandardMaterial
        color={lit > 0.5 ? PAL.windowLit : PAL.windowDim}
        emissive={PAL.windowLit}
        emissiveIntensity={lit * 1.4}
        roughness={0.3}
        flatShading
      />
    </mesh>
  </group>
);

const signTexCache = new Map<string, THREE.CanvasTexture>();
const signTexture = (text: string) => {
  const hit = signTexCache.get(text);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f6ead4";
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = "#7b5a48";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = "#2f5d50";
  ctx.font = "700 74px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.split("").join(String.fromCharCode(8202)), 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  signTexCache.set(text, t);
  return t;
};

export const House: React.FC<{ s: HouseSpec; y?: number }> = ({ s, y = 0 }) => {
  const rh = s.w * 0.42;
  const lit = s.lit ?? 0;
  return (
    <group position={[s.x, y, s.z]} rotation={[0, s.heading, 0]}>
      <mesh position={[0, s.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[s.w, s.h, s.d]} radius={0.04} segments={1} />
        <meshStandardMaterial color={s.wall} flatShading roughness={0.9} />
      </mesh>
      {/* stone plinth */}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[s.w + 0.08, 0.14, s.d + 0.08]} />
        <meshStandardMaterial color={PAL.stoneDark} flatShading roughness={0.95} />
      </mesh>
      <mesh geometry={roofGeo(s.w + 0.3, s.d + 0.28, rh)} position={[0, s.h, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={s.roof} flatShading roughness={0.75} />
      </mesh>
      {s.chimney && (
        <mesh position={[s.w * 0.22, s.h + rh * 0.62, -s.d * 0.18]} castShadow>
          <boxGeometry args={[0.2, 0.55, 0.2]} />
          <meshStandardMaterial color={PAL.stoneDark} flatShading />
        </mesh>
      )}
      {/* front: door + windows */}
      <mesh position={[0, 0.36, s.d / 2 + 0.02]}>
        <boxGeometry args={[0.32, 0.58, 0.05]} />
        <meshStandardMaterial color={PAL.door} flatShading roughness={0.7} />
      </mesh>
      <Window p={[-s.w * 0.3, s.h * (s.sign ? 0.45 : 0.62), s.d / 2]} lit={lit} />
      <Window p={[s.w * 0.3, s.h * (s.sign ? 0.45 : 0.62), s.d / 2]} lit={lit} />
      {/* side windows */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <Window p={[0, s.h * 0.6, s.w / 2]} lit={lit} />
      </group>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <Window p={[0, s.h * 0.6, s.w / 2]} lit={lit} />
      </group>
      {s.sign && (
        <group position={[0, s.h * 0.62, s.d / 2 + 0.1]}>
          <mesh position={[0, 0.2, -0.06]}>
            <boxGeometry args={[1.5, 0.42, 0.06]} />
            <meshStandardMaterial color={PAL.wood} flatShading />
          </mesh>
          <mesh position={[0, 0.2, -0.02]}>
            <planeGeometry args={[1.4, 0.33]} />
            <meshStandardMaterial map={signTexture(s.sign)} roughness={0.8} />
          </mesh>
        </group>
      )}
      {s.sign && (
        // little awning over the shop door
        <mesh position={[0, 0.78, s.d / 2 + 0.2]} rotation={[0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.04, 0.42]} />
          <meshStandardMaterial color={PAL.accent} flatShading />
        </mesh>
      )}
    </group>
  );
};

// The town houses: two rings around the square, streets left open to the south and north.
export const TOWN: HouseSpec[] = (() => {
  const r = prng(909);
  const out: HouseSpec[] = [];
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length) % a.length];
  const ring = (radius: number, step: number, offset: number, gapHalf: number, scale: number) => {
    for (let a = offset; a < 360 + offset - 1; a += step) {
      const ang = (a * Math.PI) / 180;
      const x = Math.cos(ang) * radius * (1 + (r() - 0.5) * 0.08);
      const z = Math.sin(ang) * radius * (1 + (r() - 0.5) * 0.08);
      // streets: south (+z, toward camera) and north (-z, toward the bridge)
      const deg = ((a % 360) + 360) % 360;
      if (Math.abs(deg - 100) < gapHalf || Math.abs(deg - 270) < gapHalf * 0.8) continue;
      out.push({
        x, z, heading: Math.atan2(-x, -z),
        w: (1.6 + r() * 0.6) * scale, d: (1.35 + r() * 0.4) * scale, h: (1.25 + r() * 0.75) * scale,
        wall: pick(PAL.walls), roof: pick(PAL.roofs), chimney: r() < 0.5,
      });
    }
  };
  ring(7.2, 30, 0, 28, 1);
  ring(10.8, 22.5, 11, 30, 0.95);
  // the shop with the AUDIRA board faces the square from the north-west
  const shop = out.reduce((best, h) => (Math.abs(Math.atan2(h.z, h.x) - (-2.1)) < Math.abs(Math.atan2(best.z, best.x) - (-2.1)) ? h : best), out[0]);
  shop.sign = "AUDIRA";
  shop.wall = "#fbe3cf";
  shop.roof = "#7fa7b8";
  shop.w = 2.3;
  shop.h = 1.9;
  return out;
})();

// ---------------------------------------------------------------------------------------------
const Fountain: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  return (
    <group>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.48, 8]} />
        <meshStandardMaterial color={PAL.stone} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[1.16, 1.16, 0.06, 8]} />
        <meshStandardMaterial color={PAL.water} flatShading roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.0, 6]} />
        <meshStandardMaterial color={PAL.stone} flatShading />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.22, 0.24, 8]} />
        <meshStandardMaterial color={PAL.stone} flatShading />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 8]} />
        <meshStandardMaterial color={PAL.water} flatShading roughness={0.15} />
      </mesh>
      <mesh position={[0, 1.78 + Math.sin(t * 6) * 0.02, 0]}>
        <coneGeometry args={[0.1, 0.5, 6]} />
        <meshStandardMaterial color="#d8f0fb" transparent opacity={0.75} flatShading />
      </mesh>
    </group>
  );
};

const LampPost: React.FC<{ p: [number, number]; lit: number }> = ({ p, lit }) => (
  <group position={[p[0], 0, p[1]]}>
    <mesh position={[0, 0.8, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 1.6, 6]} />
      <meshStandardMaterial color="#4a5566" flatShading />
    </mesh>
    <mesh position={[0, 1.7, 0]} castShadow>
      <octahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial color={PAL.windowLit} emissive={PAL.windowLit} emissiveIntensity={0.2 + lit * 1.8} flatShading />
    </mesh>
  </group>
);

const Bench: React.FC<{ p: [number, number]; heading: number }> = ({ p, heading }) => (
  <group position={[p[0], 0, p[1]]} rotation={[0, heading, 0]}>
    <mesh position={[0, 0.26, 0]} castShadow>
      <boxGeometry args={[0.9, 0.06, 0.3]} />
      <meshStandardMaterial color={PAL.woodLight} flatShading />
    </mesh>
    {[-0.36, 0.36].map((x) => (
      <mesh key={x} position={[x, 0.12, 0]} castShadow>
        <boxGeometry args={[0.06, 0.24, 0.26]} />
        <meshStandardMaterial color={PAL.wood} flatShading />
      </mesh>
    ))}
  </group>
);

const Square: React.FC<{ f: number; lit: number }> = ({ f, lit }) => (
  <group>
    <mesh position={[0, 0.03, 0]} receiveShadow>
      <cylinderGeometry args={[4.6, 4.7, 0.06, 8]} />
      <meshStandardMaterial color={PAL.pavingRing} flatShading roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.05, 0]} receiveShadow>
      <cylinderGeometry args={[4.1, 4.1, 0.06, 8]} />
      <meshStandardMaterial color={PAL.paving} flatShading roughness={0.95} />
    </mesh>
    {/* streets */}
    <mesh position={[0, 0.03, 10]} receiveShadow>
      <boxGeometry args={[2.2, 0.05, 12]} />
      <meshStandardMaterial color={PAL.pavingRing} flatShading roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.03, -8.5]} receiveShadow>
      <boxGeometry args={[2.0, 0.05, 9]} />
      <meshStandardMaterial color={PAL.pavingRing} flatShading roughness={0.95} />
    </mesh>
    <Fountain f={f} />
    {[20, 160, 215, 325].map((a) => {
      const r = (a * Math.PI) / 180;
      return <LampPost key={a} p={[Math.cos(r) * 3.6, Math.sin(r) * 3.6]} lit={lit} />;
    })}
    {[0, 180].map((a) => {
      const r = (a * Math.PI) / 180;
      const x = Math.cos(r) * 3.2, z = Math.sin(r) * 3.2;
      return <Bench key={a} p={[x, z]} heading={Math.atan2(-x, -z)} />;
    })}
  </group>
);

// ---------------------------------------------------------------------------------------------
const RoundTree: React.FC<{ p: [number, number, number]; s: number; f: number; seed: number; color: string }> = ({ p, s, f, seed, color }) => {
  const sway = Math.sin(f * 0.025 + seed) * 0.03;
  return (
    <group position={p} scale={s} rotation={[sway, seed, sway * 0.5]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
        <meshStandardMaterial color={PAL.wood} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.85} />
      </mesh>
    </group>
  );
};

const TREES = (() => {
  const r = prng(4242);
  const out: { x: number; z: number; s: number; kind: number; seed: number; color: string }[] = [];
  const greens = ["#5fae6e", "#79c07a", "#4f9f6a", "#9ccf7e", "#e6b96f"];
  let tries = 0;
  while (out.length < 120 && tries < 4000) {
    tries++;
    const x = (r() - 0.5) * 120;
    const z = 22 - r() * 75;
    const rt = Math.hypot(x, z * 1.1);
    if (rt < 13.5) continue;
    if (Math.abs(z - riverZ(x)) < 3.2) continue;
    if (Math.hypot(x - HILL.x, z - HILL.z) < 3.2) continue; // teacher's yard
    if (Math.abs(x - BRIDGE_X) < 2 && z < riverZ(x) && z > HILL.z) continue; // hill path
    if (z > 8 && Math.abs(x) < 9) continue; // keep the foreground street open
    const h = heightAt(x, z);
    // denser on hills
    if (h < 1.2 && r() < 0.55) continue;
    out.push({ x, z, s: 0.9 + r() * 0.8, kind: r() < 0.55 ? 0 : 1, seed: Math.floor(r() * 100), color: greens[Math.floor(r() * greens.length)] });
  }
  return out;
})();

const Trees: React.FC<{ f: number }> = ({ f }) => (
  <>
    {TREES.map((t, i) =>
      t.kind === 0 ? (
        <LowPolyTree key={i} position={[t.x, heightAt(t.x, t.z) - 0.05, t.z]} scale={t.s} f={f} seed={t.seed} />
      ) : (
        <RoundTree key={i} p={[t.x, heightAt(t.x, t.z) - 0.05, t.z]} s={t.s * 1.1} f={f} seed={t.seed} color={t.color} />
      ),
    )}
  </>
);

// ---------------------------------------------------------------------------------------------
const Bridge: React.FC = () => {
  const z = riverZ(BRIDGE_X);
  return (
    <group position={[BRIDGE_X, 0, z]}>
      {Array.from({ length: 9 }, (_, i) => {
        const u = i / 8 - 0.5;
        return (
          <mesh key={i} position={[0, 0.15 + (0.25 - u * u) * 1.4, u * 6]} rotation={[-u * 0.9, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.1, 0.66]} />
            <meshStandardMaterial color={i % 2 ? PAL.woodLight : "#c9a07a"} flatShading />
          </mesh>
        );
      })}
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.75, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 6]} />
          <meshStandardMaterial color={PAL.wood} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** Stepping-stone path from the bridge up the hill to the teacher's house. */
export const pathPoint = (u: number): [number, number] => {
  const z0 = riverZ(BRIDGE_X) - 3, z1 = HILL.z + 2.2;
  const z = z0 + (z1 - z0) * u;
  const x = BRIDGE_X + (HILL.x - BRIDGE_X) * u + Math.sin(u * Math.PI * 2.2) * 2.2;
  return [x, z];
};

const HillPath: React.FC = () => (
  <>
    {Array.from({ length: 34 }, (_, i) => {
      const [x, z] = pathPoint(i / 33);
      const [x2, z2] = pathPoint(Math.min(1, (i + 1) / 33));
      return (
        <mesh key={i} position={[x, heightAt(x, z) + 0.02, z]} rotation={[0, Math.atan2(x2 - x, z2 - z), 0]} receiveShadow>
          <boxGeometry args={[0.85, 0.08, 0.7]} />
          <meshStandardMaterial color={PAL.dirt} flatShading roughness={1} />
        </mesh>
      );
    })}
  </>
);

export const TEACHER_HOUSE: HouseSpec = {
  x: HILL.x, z: HILL.z, heading: -0.35, w: 2.2, d: 1.7, h: 1.45, wall: "#f6ecd2", roof: "#c9876f", chimney: true,
};

const TeacherHouse: React.FC<{ lit: number }> = ({ lit }) => {
  const y = heightAt(HILL.x, HILL.z) - 0.05;
  return (
    <group>
      <House s={{ ...TEACHER_HOUSE, lit }} y={y} />
      {/* porch deck and a lone tree beside the house */}
      <group position={[HILL.x, y, HILL.z]} rotation={[0, TEACHER_HOUSE.heading, 0]}>
        <mesh position={[0, 0.06, 1.25]} receiveShadow castShadow>
          <boxGeometry args={[2.3, 0.12, 0.8]} />
          <meshStandardMaterial color={PAL.woodLight} flatShading />
        </mesh>
      </group>
      {(() => {
        const v = new THREE.Vector3(2.6, 0, -0.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), TEACHER_HOUSE.heading);
        return <RoundTree p={[HILL.x + v.x, y, HILL.z + v.z]} s={1.6} f={0} seed={7} color="#e6b96f" />;
      })()}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Faceted clouds (kit LowPolyCloud recipe, but drifting linearly: the kit's wrap-around would jump).
const Cloud: React.FC<{ p: [number, number, number]; f: number; s: number; speed: number }> = ({ p, f, s, speed }) => (
  <group position={[p[0] + f * speed, p[1] + Math.sin(f * 0.01 + p[2]) * 0.3, p[2]]} scale={[s, s * 0.6, s]}>
    {([[0, 0, 0, 0.9], [-0.85, -0.12, 0.1, 0.65], [0.8, -0.08, -0.1, 0.7], [0.3, 0.3, 0.2, 0.55]] as const).map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <dodecahedronGeometry args={[r, 0]} />
        <meshStandardMaterial color="#fbfdff" emissive="#fff4e6" emissiveIntensity={0.25} roughness={0.95} flatShading fog={false} />
      </mesh>
    ))}
  </group>
);

/** Sky colours for a dusk amount (0 = bright afternoon, 1 = deep dusk). */
export const skyColors = (dusk: number) => {
  const mix = (a: string, b: string) => new THREE.Color(a).lerp(new THREE.Color(b), dusk);
  return {
    hor: mix(PAL.horizon, "#ffa77c"),
    pale: mix("#eef5f4", "#f3b9a6"),
    mid: mix(PAL.skyMid, "#8d82bd"),
    top: mix(PAL.skyTop, "#2f3f78"),
    fog: mix(PAL.fog, "#c9a6b4"),
  };
};

const SkyDome: React.FC<{ dusk: number }> = ({ dusk }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(420, 32, 48), []);
  const dq = Math.round(dusk * 200) / 200;
  useMemo(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const { pale, top, mid, hor } = skyColors(dq);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 420;
      if (y < 0.004) c.copy(hor);
      else if (y < 0.03) c.copy(hor).lerp(pale, (y - 0.004) / 0.026);
      else if (y < 0.09) c.copy(pale).lerp(mid, (y - 0.03) / 0.06);
      else c.copy(mid).lerp(top, Math.min(1, (y - 0.09) / 0.2));
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }, [geo, dq]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
};

export const World: React.FC<{ f: number; lit?: number; dusk?: number }> = ({ f, lit = 0, dusk = 0 }) => (
  <group>
    <SkyDome dusk={dusk} />
    <Terrain />
    <Water f={f} />
    <Square f={f} lit={lit} />
    {TOWN.map((s, i) => (
      <House key={i} s={{ ...s, lit }} />
    ))}
    <Bridge />
    <HillPath />
    <TeacherHouse lit={lit} />
    <Trees f={f} />
    <Cloud p={[-20, 24, -70]} f={f} s={7} speed={0.01} />
    <Cloud p={[22, 28, -85]} f={f} s={9} speed={0.008} />
    <Cloud p={[50, 22, -60]} f={f} s={6} speed={0.012} />
    <Cloud p={[-55, 26, -55]} f={f} s={6.5} speed={0.01} />
  </group>
);
