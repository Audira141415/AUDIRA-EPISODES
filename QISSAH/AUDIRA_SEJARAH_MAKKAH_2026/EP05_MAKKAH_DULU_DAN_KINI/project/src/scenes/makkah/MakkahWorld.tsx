// EP05 world: the Makkah valley as one engraved copper plate.
// Left (x < 0, "dulu"): stone houses, the old arcade ring and the Ajyad fortress on its hill.
// Right (x > 0, "kini"): hotel blocks, the modern minarets and the Abraj Al-Bait clock tower.
// The Ka'bah stays at the centre, whole and plain (black cube, gold kiswah band, door). No figures.

import React, { useMemo } from "react";
import * as THREE from "three";
import { engrave, fbm, INK, rng, type EngraveOpts } from "./engraving.ts";
import { clockTexture, skyTexture } from "./textures.ts";

type V3 = [number, number, number];

const edgeMat = new THREE.LineBasicMaterial({ color: INK.sepia, transparent: true, opacity: 0.85 });

/** Box with engraved material and inked edges. */
export const EBox: React.FC<{ args: V3; position: V3; rotation?: V3; mat?: EngraveOpts; edges?: boolean; shadow?: boolean }> = ({
  args,
  position,
  rotation,
  mat,
  edges = true,
  shadow = true,
}) => {
  const geo = useMemo(() => new THREE.BoxGeometry(...args), [args[0], args[1], args[2]]);
  const eg = useMemo(() => new THREE.EdgesGeometry(geo, 25), [geo]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={engrave(mat)} castShadow={shadow} receiveShadow />
      {edges ? <lineSegments geometry={eg} material={edgeMat} /> : null}
    </group>
  );
};

export const ECyl: React.FC<{ r: [number, number]; h: number; position: V3; seg?: number; mat?: EngraveOpts; edges?: boolean }> = ({
  r,
  h,
  position,
  seg = 20,
  mat,
  edges = false,
}) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(r[0], r[1], h, seg), [r[0], r[1], h, seg]);
  const eg = useMemo(() => new THREE.EdgesGeometry(geo, 40), [geo]);
  return (
    <group position={position}>
      <mesh geometry={geo} material={engrave(mat)} castShadow receiveShadow />
      {edges ? <lineSegments geometry={eg} material={edgeMat} /> : null}
    </group>
  );
};

// ---------------------------------------------------------------- terrain

export const FORT = { x: -2.7, z: -3.0, h: 1.75 };

export function groundHeight(x: number, z: number): number {
  // valley floor: flat basin around the sanctuary, opening slightly toward the camera
  const ex = x / 1.25;
  const ez = z < 0 ? z / 0.85 : z / 1.6;
  const r = Math.hypot(ex, ez);
  const rise = THREE.MathUtils.smoothstep(r, 5.5, 13);
  const back = THREE.MathUtils.smoothstep(-z, 2, 18); // taller ranges behind
  const n = fbm(x * 0.16, z * 0.16, 7, 5);
  const ridge = 1 - Math.abs(fbm(x * 0.09 + 4, z * 0.09, 19, 4) * 2 - 1);
  const sideOpen = 0.45 + 0.55 * THREE.MathUtils.smoothstep(Math.abs(x), 3, 16); // lower saddle behind the towers
  let h = rise * (1.6 + 3.2 * n + 3.4 * ridge * (0.5 + back)) * (0.6 + back * 0.9) * sideOpen;
  h = 6.2 * Math.tanh(h / 6.2); // soft cap: ranges stay below the engraved sky
  // Bukit Bulbul (Ajyad hill) on the "dulu" side
  const dh = Math.hypot(x - FORT.x, z - FORT.z);
  h += FORT.h * Math.exp(-(dh * dh) / (2 * 1.05 * 1.05)) * (0.92 + 0.16 * fbm(x * 2, z * 2, 5, 2));
  // gentle floor noise
  h += (fbm(x * 0.9, z * 0.9, 3, 2) - 0.5) * 0.06;
  return Math.max(h, 0);
}

const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(110, 60, 330, 180);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -20);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, groundHeight(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={engrave({ color: INK.paperDeep, freq: 5, contour: 0.65, keep: 0.35, ink: 0.7, toneGain: 1.7 })} receiveShadow castShadow />;
};

const Sky: React.FC = () => {
  const map = useMemo(() => skyTexture(), []);
  return (
    <mesh position={[0, 18, -44]}>
      <planeGeometry args={[190, 64]} />
      <meshBasicMaterial map={map} fog={false} toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- sanctuary

const Kabah: React.FC = () => {
  const black = useMemo(() => new THREE.MeshStandardMaterial({ color: "#121010", roughness: 0.62, metalness: 0.05 }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: INK.gold, roughness: 0.32, metalness: 0.9 }), []);
  const W = 0.34, H = 0.4, D = 0.3;
  return (
    <group position={[0, 0.02, 0.35]} rotation={[0, -0.32, 0]} scale={1.35}>
      <mesh material={black} position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
      </mesh>
      {/* kiswah band */}
      <mesh material={gold} position={[0, H * 0.74, 0]}>
        <boxGeometry args={[W + 0.006, H * 0.09, D + 0.006]} />
      </mesh>
      {/* door, raised, on the facade near the Hajar Aswad corner */}
      <mesh material={gold} position={[W * 0.2, H * 0.4, D / 2 + 0.004]}>
        <boxGeometry args={[W * 0.2, H * 0.36, 0.006]} />
      </mesh>
      {/* Hajar Aswad corner: small silver ring */}
      <mesh position={[W / 2 + 0.002, H * 0.32, D / 2 + 0.002]} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.018, 0.006, 8, 20]} />
        <meshStandardMaterial color="#cfcac0" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
};

const Minaret: React.FC<{ x: number; z: number; h: number; modern?: boolean }> = ({ x, z, h, modern }) => {
  const m: EngraveOpts = modern ? { color: "#e9dcbc", freq: 26, keep: 0.3 } : { color: INK.paperDeep, freq: 26 };
  const r = modern ? 0.07 : 0.05;
  return (
    <group position={[x, 0, z]}>
      <ECyl r={[r, r * 1.15]} h={h} position={[0, h / 2, 0]} seg={12} mat={m} />
      <ECyl r={[r * 1.7, r * 1.4]} h={0.04} position={[0, h * 0.72, 0]} seg={12} mat={m} />
      {modern ? <ECyl r={[r * 0.85, r]} h={h * 0.18} position={[0, h + h * 0.09, 0]} seg={12} mat={m} /> : null}
      <mesh position={[0, h + (modern ? h * 0.18 : 0) + 0.09, 0]} castShadow material={engrave({ color: INK.gold, metalness: 0.8, roughness: 0.35, keep: 0.8, ink: 0.5, freq: 30 })}>
        <coneGeometry args={[r * 1.05, 0.18, 12]} />
      </mesh>
    </group>
  );
};

const Sanctuary: React.FC = () => {
  // courtyard and arcade: the old Ottoman ring of small domes on the left, the modern expansion mass on the right
  const old = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.PI * 0.5 + (i / 21) * Math.PI; // left half ring
      out.push({ x: Math.cos(a) * 1.15, z: 0.35 + Math.sin(a) * 0.95 });
    }
    return out;
  }, []);
  return (
    <group>
      {/* mataf floor */}
      <mesh position={[0, 0.012, 0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={engrave({ color: "#f2e7cc", freq: 22, keep: 0.4, toneGain: 1.6 })}>
        <circleGeometry args={[1.0, 64]} />
      </mesh>
      {/* old arcade: domes on short piers */}
      {old.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <EBox args={[0.16, 0.12, 0.16]} position={[0, 0.06, 0]} mat={{ color: INK.paperDeep, freq: 30 }} edges />
          <mesh position={[0, 0.12, 0]} castShadow material={engrave({ color: INK.paperDeep, freq: 34 })}>
            <sphereGeometry args={[0.075, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      ))}
      <Minaret x={-1.25} z={-0.4} h={0.9} />
      <Minaret x={-0.7} z={-0.55} h={0.8} />
      <Minaret x={-1.3} z={1.15} h={0.85} />
      {/* modern expansion: tiered colonnade block on the right half */}
      <EBox args={[1.2, 0.34, 2.3]} position={[1.55, 0.17, 0.35]} mat={{ color: "#ece0c2", freq: 24, keep: 0.3 }} />
      <EBox args={[0.9, 0.18, 1.9]} position={[1.6, 0.43, 0.35]} mat={{ color: "#ece0c2", freq: 24, keep: 0.3 }} />
      <Minaret x={1.05} z={-0.75} h={1.6} modern />
      <Minaret x={1.05} z={1.45} h={1.6} modern />
      <Minaret x={2.15} z={-0.75} h={1.6} modern />
      <Minaret x={2.15} z={1.45} h={1.6} modern />
      <Kabah />
    </group>
  );
};

// ---------------------------------------------------------------- dulu: houses + Ajyad

const OldCity: React.FC = () => {
  const houses = useMemo(() => {
    const r = rng(1777);
    const out: { p: V3; s: V3; ry: number }[] = [];
    let tries = 0;
    while (out.length < 190 && tries < 3000) {
      tries++;
      const x = -0.7 - r() * 7.4;
      const z = -3.6 + r() * 10.5;
      if (Math.hypot(x, (z - 0.35) * 1.15) < 1.55) continue;
      if (Math.hypot(x - FORT.x, z - FORT.z) < 1.25) continue;
      const gy = groundHeight(x, z);
      if (gy > 1.1) continue;
      const w = 0.16 + r() * 0.22, d = 0.16 + r() * 0.22, h = 0.12 + r() * 0.28;
      out.push({ p: [x, gy + h / 2 - 0.02, z], s: [w, h, d], ry: (r() - 0.5) * 0.3 });
    }
    return out;
  }, []);
  return (
    <group>
      {houses.map((h, i) => (
        <EBox key={i} args={h.s} position={h.p} rotation={[0, h.ry, 0]} mat={{ color: INK.paperDeep, freq: 30, keep: 0.22 }} />
      ))}
    </group>
  );
};

const Ajyad: React.FC = () => {
  const y = groundHeight(FORT.x, FORT.z) - 0.04;
  const stone: EngraveOpts = { color: "#dcc79b", freq: 34, keep: 0.25 };
  const L = 1.05, Wd = 0.72, H = 0.26, T = 0.07;
  const crenels = useMemo(() => {
    const out: V3[] = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = -L / 2 + (i + 0.5) * (L / n);
      out.push([t, H + 0.03, Wd / 2], [t, H + 0.03, -Wd / 2]);
    }
    for (let i = 0; i < 6; i++) {
      const t = -Wd / 2 + (i + 0.5) * (Wd / 6);
      out.push([L / 2, H + 0.03, t], [-L / 2, H + 0.03, t]);
    }
    return out;
  }, []);
  const corners: [number, number][] = [
    [L / 2, Wd / 2],
    [-L / 2, Wd / 2],
    [L / 2, -Wd / 2],
    [-L / 2, -Wd / 2],
  ];
  return (
    <group position={[FORT.x, y, FORT.z]} rotation={[0, 0.25, 0]}>
      <EBox args={[L, H, T]} position={[0, H / 2, Wd / 2]} mat={stone} />
      <EBox args={[L, H, T]} position={[0, H / 2, -Wd / 2]} mat={stone} />
      <EBox args={[T, H, Wd]} position={[L / 2, H / 2, 0]} mat={stone} />
      <EBox args={[T, H, Wd]} position={[-L / 2, H / 2, 0]} mat={stone} />
      {crenels.map((p, i) => (
        <EBox key={i} args={[0.045, 0.06, 0.075]} position={p} mat={stone} edges={false} />
      ))}
      {corners.map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <ECyl r={[0.13, 0.15]} h={0.38} position={[0, 0.19, 0]} seg={18} mat={stone} edges />
          {Array.from({ length: 8 }).map((_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return <EBox key={k} args={[0.045, 0.06, 0.045]} position={[Math.cos(a) * 0.12, 0.41, Math.sin(a) * 0.12]} mat={stone} edges={false} />;
          })}
        </group>
      ))}
      {/* keep with a gate */}
      <EBox args={[0.34, 0.36, 0.28]} position={[-0.12, 0.18, -0.05]} mat={stone} />
      <EBox args={[0.08, 0.12, 0.01]} position={[0, 0.06, Wd / 2 + 0.04]} mat={{ color: INK.sepia, freq: 40, keep: 0.9 }} edges={false} />
      {/* Ramadan cannon on the wall */}
      <mesh position={[0.2, H + 0.06, Wd / 2 + 0.02]} rotation={[Math.PI / 2.3, 0, 0]} castShadow material={engrave({ color: "#6b5a44", metalness: 0.6, roughness: 0.45, freq: 50 })}>
        <cylinderGeometry args={[0.014, 0.02, 0.16, 10]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- kini: towers

const goldMat: EngraveOpts = { color: INK.gold, metalness: 0.85, roughness: 0.32, keep: 0.85, ink: 0.55, freq: 22, toneGain: 1.0 };

export const TOWER = { x: 2.55, z: -2.3 };

const ClockTower: React.FC = () => {
  const face = useMemo(() => clockTexture(), []);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: face, metalness: 0.55, roughness: 0.38, color: "#ffffff", emissive: new THREE.Color("#3a2a10"), emissiveIntensity: 0.25 }), [face]);
  const facade: EngraveOpts = { color: "#e6d6b2", freq: 16, keep: 0.28 };
  const C = 1.0; // clock block
  const yClock = 4.6;
  return (
    <group position={[TOWER.x, 0, TOWER.z]}>
      {/* podium */}
      <EBox args={[3.2, 0.7, 2.2]} position={[0, 0.35, 0]} mat={facade} />
      <EBox args={[2.4, 0.35, 1.7]} position={[0, 0.88, 0]} mat={facade} />
      {/* shaft with setbacks */}
      <EBox args={[1.05, 2.4, 1.05]} position={[0, 2.25, 0]} mat={facade} />
      <EBox args={[1.15, 0.12, 1.15]} position={[0, 3.5, 0]} mat={facade} />
      <EBox args={[0.98, 0.5, 0.98]} position={[0, 3.8, 0]} mat={facade} />
      {/* vertical fins on the shaft */}
      {[-0.36, -0.12, 0.12, 0.36].map((x, i) => (
        <EBox key={i} args={[0.05, 2.3, 0.04]} position={[x, 2.25, 0.54]} mat={facade} edges={false} />
      ))}
      {/* clock block */}
      <EBox args={[C, C * 1.05, C]} position={[0, yClock, 0]} mat={{ ...facade, color: "#d8c49a" }} />
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} material={faceMat} position={[Math.sin((k * Math.PI) / 2) * (C / 2 + 0.006), yClock, Math.cos((k * Math.PI) / 2) * (C / 2 + 0.006)]} rotation={[0, (k * Math.PI) / 2, 0]}>
          <planeGeometry args={[C * 0.86, C * 0.86]} />
        </mesh>
      ))}
      {/* gold crown stages */}
      <ECyl r={[0.42, 0.52]} h={0.3} position={[0, yClock + 0.68, 0]} seg={8} mat={goldMat} edges />
      <ECyl r={[0.3, 0.38]} h={0.42} position={[0, yClock + 1.03, 0]} seg={8} mat={goldMat} edges />
      <mesh position={[0, yClock + 1.38, 0]} castShadow material={engrave(goldMat)}>
        <sphereGeometry args={[0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <ECyl r={[0.05, 0.12]} h={0.9} position={[0, yClock + 1.95, 0]} seg={10} mat={goldMat} />
      <ECyl r={[0.012, 0.04]} h={0.5} position={[0, yClock + 2.6, 0]} seg={8} mat={goldMat} />
      {/* crescent finial */}
      <mesh position={[0, yClock + 3.0, 0]} rotation={[0, 0, Math.PI * 0.5]} material={engrave(goldMat)}>
        <torusGeometry args={[0.11, 0.022, 10, 32, Math.PI * 1.45]} />
      </mesh>
    </group>
  );
};

const SideTowers: React.FC = () => {
  const towers: { x: number; z: number; w: number; h: number }[] = [
    { x: TOWER.x - 1.35, z: TOWER.z + 0.5, w: 0.62, h: 3.0 },
    { x: TOWER.x + 1.35, z: TOWER.z + 0.5, w: 0.62, h: 3.0 },
    { x: TOWER.x - 1.15, z: TOWER.z - 0.75, w: 0.58, h: 3.4 },
    { x: TOWER.x + 1.15, z: TOWER.z - 0.75, w: 0.58, h: 3.4 },
    { x: TOWER.x - 2.0, z: TOWER.z - 0.2, w: 0.55, h: 2.4 },
    { x: TOWER.x + 2.0, z: TOWER.z - 0.2, w: 0.55, h: 2.4 },
  ];
  return (
    <group>
      {towers.map((t, i) => (
        <group key={i}>
          <EBox args={[t.w, t.h, t.w]} position={[t.x, t.h / 2 + 0.3, t.z]} mat={{ color: "#e3d2ac", freq: 18, keep: 0.28 }} />
          <EBox args={[t.w * 0.7, 0.25, t.w * 0.7]} position={[t.x, t.h + 0.42, t.z]} mat={goldMat} />
          <mesh position={[t.x, t.h + 0.62, t.z]} castShadow material={engrave(goldMat)}>
            <coneGeometry args={[t.w * 0.25, 0.3, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const NewCity: React.FC = () => {
  const blocks = useMemo(() => {
    const r = rng(2012);
    const out: { p: V3; s: V3 }[] = [];
    let tries = 0;
    while (out.length < 105 && tries < 3000) {
      tries++;
      const x = 0.7 + r() * 8;
      const z = -4 + r() * 10.5;
      if (x < 2.6 && z > -1.2 && z < 2.2) continue; // expansion block
      if (x < 2.4 && z >= 2.2) continue; // keep the view to the Ka'bah open
      if (Math.abs(x - TOWER.x) < 2.4 && Math.abs(z - TOWER.z) < 1.5) continue;
      const gy = groundHeight(x, z);
      if (gy > 1.4) continue;
      const w = 0.35 + r() * 0.45, d = 0.35 + r() * 0.4;
      const near = Math.hypot(x - TOWER.x, z - TOWER.z);
      const h = (0.4 + r() * (near < 4 ? 1.8 : 1.0)) * (z > 2.5 ? 0.45 : 1);
      out.push({ p: [x, gy + h / 2 - 0.02, z], s: [w, h, d] });
    }
    return out;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <EBox key={i} args={b.s} position={b.p} mat={{ color: "#e7d8b6", freq: 20, keep: 0.26 }} />
      ))}
    </group>
  );
};

export const MakkahWorld: React.FC = () => (
  <group>
    <Sky />
    <Terrain />
    <Sanctuary />
    <OldCity />
    <Ajyad />
    <NewCity />
    <SideTowers />
    <ClockTower />
  </group>
);
