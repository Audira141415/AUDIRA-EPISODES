// Siege props on the map (s1, s2, s4, s5, s8): Mongol red tugs and camp east of the Round City,
// the camp + horse at Hamadan on the route head (s2), two red pincer arrows (s4), the levee that
// breaks and the flood that swallows the black Abbasid tents (s4), the gate banner lowered on
// "menyerah", and the s5 smoke. No human figures; violence stays off screen.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { Banner } from "./Banner.tsx";
import { CITY, CITY_R, LANDMARKS, SOUTH_GATE, ruinAt } from "./City.tsx";
import { CUE } from "./cues.ts";
import { HAMADAN } from "./geo.ts";
import { RigModel } from "./Models.tsx";
import { easeInCubic, easeOutBack, lin, mix, ss } from "./timing.ts";
import { SHEET_Y, hAt, routeAt, routeTangent } from "./World.tsx";

const gy = (x: number, z: number) => SHEET_Y + hAt(x, z);
export const MONGOL_RED = "#B0291F";
const TENT_MONGOL = "#A89070";
const TENT_ABBASID = "#3A3530";

// ---- Mongol line east of the city ----------------------------------------------------------
/** Red tugs on an arc east of the wall; they rise one by one from CUE.bagdad0 (s1). */
const TUGS: [number, number][] = Array.from({ length: 7 }, (_, i) => {
  const a = -0.95 + i * 0.32; // arc around the east side (angle from +x toward +z)
  const r = CITY_R + 0.62;
  return [CITY[0] + Math.cos(a) * r, CITY[1] + Math.sin(a) * r];
});
const CAMP: [number, number][] = [[-0.35, -0.55], [-0.12, -0.28], [-0.42, -0.05], [0.12, -0.5], [0.05, 0.05]];

export const MongolLine: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {TUGS.map(([x, z], i) => {
      const k = easeOutBack(lin(CUE.bagdad0 + i * 0.28, CUE.bagdad0 + i * 0.28 + 0.5, t));
      if (k <= 0.001) return null;
      return (
        <Banner key={i} t={t} color={MONGOL_RED} position={[x, gy(x, z), z]} h={0.5} w={0.22} ch={0.14} yaw={Math.PI * 0.85}
          seed={i * 3 + 11} glow={0.12} scale={k} />
      );
    })}
    {CAMP.map(([x, z], i) => {
      const k = Math.max(0.001, easeOutBack(lin(CUE.pusat + i * 0.2, CUE.pusat + i * 0.2 + 0.6, t)));
      return (
        <AssetModel key={i} id="soldiers-tent-4bd5b9" size={0.26} ground tint={TENT_MONGOL} position={[x, gy(x, z), z]}
          rotation={[0, 2.4 + i * 0.7, 0]} scale={k} />
      );
    })}
  </group>
);

// ---- s2: camp at Hamadan + horse at the route head -------------------------------------------
export const routeGrowAt = (t: number) => lin(CUE.timur, 23.6, t);
export const HamadanCamp: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.max(0.001, easeOutBack(lin(CUE.timur - 0.6, CUE.timur, t)));
  const u = routeGrowAt(t);
  const p = routeAt(Math.min(0.995, Math.max(0.005, u)));
  const tg = routeTangent(u);
  const yaw = Math.atan2(tg.x, tg.z);
  return (
    <group>
      {[[-0.35, 0.1], [0.3, -0.15], [0.05, 0.38], [0.45, 0.3]].map(([dx, dz], i) => {
        const x = HAMADAN[0] + dx, z = HAMADAN[1] + dz;
        return <AssetModel key={i} id="soldiers-tent-4bd5b9" size={0.42} ground tint={TENT_MONGOL} position={[x, gy(x, z), z]} rotation={[0, 1.6 + i, 0]} scale={k} />;
      })}
      {[-0.15, 0.2].map((dx, i) => {
        const x = HAMADAN[0] + dx, z = HAMADAN[1] - 0.25;
        return <Banner key={i} t={t} color={MONGOL_RED} position={[x, gy(x, z), z]} h={0.9} w={0.4} ch={0.26} yaw={Math.PI} seed={i + 40} glow={0.2} scale={k} />;
      })}
      {u > 0.005 ? (
        <group>
          <RigModel file="animal/horse-base" size={0.55} clip={u < 1 ? "Walk" : "Idle"} time={t} rate={1.3} position={[p.x, gy(p.x, p.z), p.z]} yaw={yaw} />
          <Banner t={t} color={MONGOL_RED} position={[p.x - tg.z * 0.18, gy(p.x, p.z), p.z + tg.x * 0.18]} h={0.8} w={0.34} ch={0.22} yaw={yaw + Math.PI / 2} seed={51} glow={0.25} />
        </group>
      ) : null}
    </group>
  );
};

// ---- s4: pincer arrows ----------------------------------------------------------------------
const PINCERS: [number, number][][] = [
  [[0.4, -1.2], [-0.8, -1.15], [-1.8, -0.95], [-2.4, -0.4]],
  [[0.5, 1.0], [-0.6, 1.15], [-1.9, 0.95], [-2.45, 0.25]],
];
const Arrow: React.FC<{ pts: [number, number][]; grow: number; fade: number }> = ({ pts, grow, fade }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, gy(x, z) + 0.06, z))), [pts]);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 160, 0.055, 10, false), [curve]);
  const g = Math.max(0.02, grow);
  geom.setDrawRange(0, Math.floor(g * 160) * 60);
  const head = curve.getPointAt(Math.min(0.999, g));
  const tan = curve.getTangentAt(Math.min(0.999, g));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
  const mat = <meshStandardMaterial color={MONGOL_RED} emissive={MONGOL_RED} emissiveIntensity={0.55} roughness={0.4} transparent opacity={fade} />;
  return (
    <group>
      <mesh geometry={geom} castShadow>{mat}</mesh>
      <mesh position={head} quaternion={q} castShadow>
        <coneGeometry args={[0.15, 0.32, 20]} />
        {mat}
      </mesh>
    </group>
  );
};
export const Pincers: React.FC<{ t: number }> = ({ t }) => {
  const grow = easeOutBack(lin(CUE.mengepung - 0.2, CUE.mengepung + 1.3, t)) * 0.92;
  const fade = 1 - ss(CUE.menyerah + 1.5, CUE.menyerah + 2.4, t);
  if (grow <= 0.001 || fade <= 0.01) return null;
  return (
    <group>
      {PINCERS.map((p, i) => <Arrow key={i} pts={p} grow={Math.min(0.999, grow)} fade={fade} />)}
    </group>
  );
};

// ---- s4: levee, flood, black tents ------------------------------------------------------------
const LEVEE: [number, number][] = [[-1.2, 0.52], [-1.0, 0.5], [-0.8, 0.49], [-0.6, 0.5]];
const BLACK_TENTS: [number, number][] = [[-1.28, 0.8], [-1.05, 0.92], [-0.85, 0.78], [-0.64, 0.95], [-1.12, 1.0]];
const FLOOD_C: [number, number] = [-0.9, 0.62];
export const floodAt = (t: number) => easeInCubic(lin(CUE.banjir - 0.3, CUE.banjir + 0.2, t)) * 0.12 + ss(CUE.banjir, CUE.feb10 + 1.2, t) * 0.88;

export const Flood: React.FC<{ t: number }> = ({ t }) => {
  const brk = ss(CUE.tanggul, CUE.tanggul + 0.7, t);
  const f = floodAt(t);
  const geom = useMemo(() => {
    // irregular water sheet: a disc with a wavy rim, draped over the relief
    const N = 64, R = 4;
    const pos: number[] = [0, 0, 0], idx: number[] = [];
    for (let r = 1; r <= R; r++) {
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const w = 1 + 0.12 * Math.sin(a * 5 + 1) + 0.07 * Math.sin(a * 11);
        pos.push(Math.cos(a) * (r / R) * w, 0, Math.sin(a) * (r / R) * w * 0.72);
      }
    }
    for (let i = 0; i < N; i++) idx.push(0, 1 + ((i + 1) % N), 1 + i);
    for (let r = 1; r < R; r++)
      for (let i = 0; i < N; i++) {
        const a = 1 + (r - 1) * N + i, b = 1 + (r - 1) * N + ((i + 1) % N), c = 1 + r * N + i, d = 1 + r * N + ((i + 1) % N);
        idx.push(a, b, d, a, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.userData.base = pos.slice();
    return g;
  }, []);
  const rad = 0.06 + f * 0.75;
  const base = geom.userData.base as number[];
  const p = geom.attributes.position as THREE.BufferAttribute;
  for (let n = 0; n < p.count; n++) {
    const x = FLOOD_C[0] + base[n * 3] * rad, z = FLOOD_C[1] + base[n * 3 + 2] * rad;
    p.setXYZ(n, x, gy(x, z) + 0.018 + Math.sin(x * 30 + t * 3) * 0.002, z);
  }
  p.needsUpdate = true;
  geom.computeVertexNormals();
  const out = 1 - ss(59, 60.2, t);
  return (
    <group>
      {/* levee: wall run that tilts and splits on "tanggul" */}
      {LEVEE.map(([x, z], i) => {
        const side = i < 2 ? -1 : 1;
        const open = brk * (i === 1 || i === 2 ? 1 : 0.35);
        return (
          <group key={i} position={[x + side * open * 0.08, gy(x, z) - open * 0.02, z]} rotation={[open * 0.5, 0, side * open * 0.6]}>
            <AssetModel id="adobe-tapia-wall-run-074dd5" size={0.22} ground tint="#9C7B52" rotation={[0, Math.PI / 2, 0]} />
          </group>
        );
      })}
      {BLACK_TENTS.map(([x, z], i) => {
        const dist = Math.hypot(x - FLOOD_C[0], (z - FLOOD_C[1]) / 0.72);
        const sink = ss(0, 1, (rad - dist) / 0.18);
        const tilt = sink * (0.5 + i * 0.1);
        return (
          <group key={i} position={[x + sink * 0.05, gy(x, z) - sink * 0.09, z]} rotation={[tilt * 0.6, i, tilt * 0.4]}>
            <AssetModel id="canvas-wall-tent-de8a04" size={0.2} ground tint={TENT_ABBASID} />
          </group>
        );
      })}
      {f > 0.001 && out > 0.01 ? (
        <mesh geometry={geom} receiveShadow>
          <meshPhysicalMaterial color="#2c6d9c" roughness={0.08} metalness={0.05} clearcoat={1} clearcoatRoughness={0.05}
            transparent opacity={0.88 * out} emissive="#173a58" emissiveIntensity={0.25} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Black banner over the south gate: lowered on "menyerah" (s4). */
export const GateBanner: React.FC<{ t: number }> = ({ t }) => {
  const [x, z] = SOUTH_GATE;
  return (
    <Banner t={t} color="#151515" position={[x + 0.06, gy(x, z) + 0.02, z]} h={0.5} w={0.24} ch={0.15} yaw={-0.3}
      lower={ss(CUE.menyerah, CUE.menyerah + 1.4, t)} seed={7} glow={0.04} />
  );
};

// ---- s5: smoke over the four landmarks --------------------------------------------------------
const PUFFS = Array.from({ length: 10 }, (_, i) => ({ ph: i * 1.7, dx: ((i * 37) % 11) / 11 - 0.5, dz: ((i * 13) % 7) / 7 - 0.5, r: 0.07 + ((i * 7) % 5) * 0.015 }));
export const Smoke: React.FC<{ t: number }> = ({ t }) => {
  const r = ruinAt(t);
  const out = 1 - ss(59.2, 60.4, t);
  if (out <= 0.01) return null;
  return (
    <group>
      {(Object.keys(LANDMARKS) as (keyof typeof LANDMARKS)[]).map((key, j) => {
        const k = r[key] * out;
        if (k <= 0.01) return null;
        const [lx, lz] = LANDMARKS[key];
        return PUFFS.map((p, i) => {
          const life = ((t * 0.35 + p.ph * 0.13 + j * 0.21) % 1);
          // wind toward the east (+x): plumes stretch ~2.5:1 along the wind
          const x = lx + p.dx * 0.12 + life * 0.55, z = lz + p.dz * 0.1;
          const y = gy(lx, lz) + 0.12 + life * 0.55;
          const s = p.r * (0.7 + life * 1.3);
          return (
            <mesh key={`${j}-${i}`} position={[x, y, z]} scale={[s * 2.5, s, s]}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={mix(0, 1, life) > 0.5 ? "#6e6258" : "#8a7a6a"} transparent opacity={0.42 * k * (1 - life) * Math.min(1, life * 6)}
                roughness={1} depthWrite={false} />
            </mesh>
          );
        });
      })}
    </group>
  );
};

/** s8: a warm dawn glow ring around the city (rebuilt light). */
export const DawnRing: React.FC<{ t: number }> = ({ t }) => {
  const k = ss(82, 85, t);
  if (k <= 0.01) return null;
  const ring = ((t - 82) % 2.2) / 2.2;
  return (
    <group position={[CITY[0], gy(CITY[0], CITY[1]) + 0.03, CITY[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={CITY_R * (1.1 + ring * 1.6)}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial color="#FFD27A" transparent opacity={(1 - ring) * 0.7 * k} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};
