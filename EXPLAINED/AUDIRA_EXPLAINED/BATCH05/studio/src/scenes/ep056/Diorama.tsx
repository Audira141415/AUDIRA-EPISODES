// AE-056 TIMEFORGE diorama: one round pearl plinth, three terraces rising front to back.
// Front: pre-industrial farm (windmill, water wheel on the river, fields).
// Middle: water-powered stone textile mill (Cromford type, 1771): breast-shot wheel, no chimney.
// Back: brick steam era (beam engine house with flywheel, chimneys) and an early railway.
// Everything is static or driven by the `t` (seconds) prop; no unseeded randomness.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { prng } from "../../core/materials/textures.ts";

export type V3 = [number, number, number];
type Preset = keyof typeof POLISH;

export const Mat: React.FC<{ c: string; p?: Preset; rough?: number; metal?: number; bump?: THREE.Texture; map?: THREE.Texture; bs?: number }> = ({ c, p = "stone", rough, metal, bump, map, bs = 0.6 }) => (
  <meshPhysicalMaterial
    {...POLISH[p]}
    color={c}
    map={map ?? null}
    envMapIntensity={metal ? 3.5 : 1}
    {...(rough !== undefined ? { roughness: rough } : {})}
    {...(metal !== undefined ? { metalness: metal } : {})}
    {...(bump ? { bumpMap: bump, bumpScale: bs } : {})}
  />
);

export const Box: React.FC<{ s: V3; p: V3; c: string; mp?: Preset; r?: number; rot?: V3; bump?: THREE.Texture; rough?: number; metal?: number; map?: THREE.Texture; bs?: number }> = ({ s, p, c, mp, r, rot, bump, rough, metal, map, bs }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <RoundedBoxGeo args={s} radius={r} />
    <Mat c={c} p={mp} bump={bump} rough={rough} metal={metal} map={map} bs={bs} />
  </mesh>
);

/** Pitched roof: triangular prism along x. */
export const Roof: React.FC<{ w: number; d: number; h: number; p: V3; c: string; rotY?: number; slate?: boolean }> = ({ w, d, h, p, c, rotY = 0, slate }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2 - 0.05, 0);
    s.lineTo(d / 2 + 0.05, 0);
    s.lineTo(0, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w + 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    g.translate(0, 0, -(w + 0.1) / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [w, d, h]);
  return (
    <mesh geometry={geo} position={p} rotation={[0, rotY, 0]} castShadow receiveShadow>
      {slate ? <meshPhysicalMaterial color={c} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.12} metalness={0.05} envMapIntensity={2} /> : <Mat c={c} p="fabric" rough={0.85} />}
    </mesh>
  );
};

/** Circle segment of the plinth between world z0..z1, extruded up to `top`. */
export const Tier: React.FC<{ r: number; z0: number; z1: number; top: number; c: string; bump?: THREE.Texture }> = ({ r, z0, z1, top, c, bump }) => {
  const geo = useMemo(() => {
    const a = -z1, b = -z0; // shape y = -world z
    const s = new THREE.Shape();
    const N = 48;
    const w = (y: number) => Math.sqrt(Math.max(0, r * r - y * y));
    s.moveTo(-w(a), a);
    for (let i = 1; i <= N; i++) {
      const y = a + ((b - a) * i) / N;
      s.lineTo(-w(y), y);
    }
    for (let i = N; i >= 0; i--) {
      const y = a + ((b - a) * i) / N;
      s.lineTo(w(y), y);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: top, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [r, z0, z1, top]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <Mat c={c} p="clay" bump={bump} bs={2.2} />
    </mesh>
  );
};

/** Wooden or iron wheel with spokes and paddles, axis along x. */
export const Wheel: React.FC<{ R: number; w: number; p: V3; a: number; c: string; paddles?: number; spokes?: number; iron?: boolean; rotY?: number }> = ({ R, w, p, a, c, paddles = 16, spokes = 8, iron, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <group rotation={[a, 0, 0]}>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[R, R * 0.06, 10, 48]} />
          <Mat c={c} p={iron ? "toyPlastic" : "stone"} metal={iron ? 0.7 : 0} rough={iron ? 0.4 : 0.75} />
        </mesh>
      ))}
      {Array.from({ length: spokes }, (_, i) => (
        <group key={i} rotation={[(i / spokes) * Math.PI * 2, 0, 0]}>
          {[-w / 2, w / 2].map((x) => (
            <mesh key={x} position={[x, R / 2, 0]} castShadow>
              <boxGeometry args={[R * 0.06, R, R * 0.06]} />
              <Mat c={c} p="stone" metal={iron ? 0.7 : 0} rough={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: paddles }, (_, i) => (
        <group key={i} rotation={[(i / paddles) * Math.PI * 2, 0, 0]}>
          <mesh position={[0, R * 0.96, 0]} castShadow>
            <boxGeometry args={[w * 1.02, R * 0.22, R * 0.035]} />
            <Mat c={iron ? "#6d5a45" : c} p="stone" rough={0.8} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[R * 0.09, R * 0.09, w * 1.6, 12]} />
        <Mat c="#3b3632" p="toyPlastic" metal={0.6} rough={0.4} />
      </mesh>
    </group>
  </group>
);

export const Tree: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = "#7f9a5e" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.22, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.07, 0.44, 8]} />
      <Mat c="#6b4f36" p="stone" />
    </mesh>
    <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
      <icosahedronGeometry args={[0.36, 1]} />
      <Mat c={c} p="clay" />
    </mesh>
    <mesh position={[0.14, 0.82, 0.05]} castShadow>
      <icosahedronGeometry args={[0.24, 1]} />
      <Mat c={c} p="clay" />
    </mesh>
  </group>
);

export const Windmill: React.FC<{ p: V3; t: number }> = ({ p, t }) => {
  const a = 0.35 + t * 0.6;
  return (
    <group position={p} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.46, 2.0, 24]} />
        <Mat c="#efe7d6" p="clay" />
      </mesh>
      <mesh position={[0, 0.35, 0.44]} castShadow>
        <boxGeometry args={[0.2, 0.34, 0.06]} />
        <Mat c="#5a4230" p="stone" />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.4, 0.55, 24]} />
        <Mat c="#6a4b35" p="stone" rough={0.7} />
      </mesh>
      <group position={[0, 2.1, 0.42]} rotation={[0, 0, a]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 12]} />
          <Mat c="#3d2e22" p="stone" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <mesh position={[0, 0.78, 0.04]} castShadow>
              <boxGeometry args={[0.05, 1.5, 0.04]} />
              <Mat c="#5b4331" p="stone" />
            </mesh>
            <mesh position={[0.13, 0.86, 0.06]} castShadow>
              <boxGeometry args={[0.22, 1.2, 0.012]} />
              <Mat c="#f2ead8" p="fabric" />
            </mesh>
            {[0.35, 0.65, 0.95, 1.25].map((y) => (
              <mesh key={y} position={[0.13, y + 0.1, 0.075]}>
                <boxGeometry args={[0.24, 0.018, 0.02]} />
                <Mat c="#5b4331" p="stone" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};

export const Cottage: React.FC<{ p: V3; rotY?: number; wall?: string; roof?: string }> = ({ p, rotY = 0, wall = "#e9dcc2", roof = "#b88b4a" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box s={[0.9, 0.5, 0.6]} p={[0, 0.25, 0]} c={wall} mp="clay" r={0.04} />
    <Roof w={0.9} d={0.6} h={0.36} p={[0, 0.5, 0]} c={roof} />
    <Box s={[0.14, 0.22, 0.02]} p={[0.18, 0.13, 0.31]} c="#5a4230" r={0.01} />
    <Box s={[0.14, 0.12, 0.02]} p={[-0.2, 0.3, 0.31]} c="#38404a" r={0.01} />
  </group>
);

export const Haystack: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, 0.4, 16]} />
      <Mat c="#d9b25e" p="fabric" />
    </mesh>
    <mesh position={[0, 0.5, 0]} castShadow>
      <coneGeometry args={[0.22, 0.3, 16]} />
      <Mat c="#c99f4b" p="fabric" />
    </mesh>
  </group>
);

/** Rows of windows on a facade facing +z (local). */
export const Windows: React.FC<{ cols: number; rows: number; w: number; h: number; y0: number; z: number; ww?: number; wh?: number; c?: string; frame?: string }> = ({
  cols, rows, w, h, y0, z, ww = 0.13, wh = 0.2, c = "#2f3a44", frame = "#efe6d4",
}) => (
  <>
    {Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, k) => {
        const x = -w / 2 + (w / cols) * (k + 0.5);
        const y = y0 + (h / rows) * (r + 0.5);
        return (
          <group key={`${r}-${k}`} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[ww + 0.04, wh + 0.04, 0.02]} />
              <Mat c={frame} p="stone" />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <boxGeometry args={[ww, wh, 0.01]} />
              <meshPhysicalMaterial color={c} roughness={0.15} clearcoat={1} metalness={0.1} />
            </mesh>
          </group>
        );
      }),
    )}
  </>
);

/** Water-powered stone mill: five storeys, rows of windows, breast-shot wheel, no chimney. */
export const StoneMill: React.FC<{ p: V3; t: number; grain: THREE.Texture }> = ({ p, t, grain }) => {
  const W = 3.0, H = 2.45, D = 1.15;
  return (
    <group position={p} rotation={[0, -0.08, 0]}>
      <Box s={[W, H, D]} p={[0, H / 2, 0]} c="#d3bb95" r={0.05} bump={grain} />
      <Windows cols={9} rows={5} w={W - 0.2} h={H - 0.25} y0={0.1} z={D / 2} />
      <Roof w={W} d={D} h={0.5} p={[0, H, 0]} c="#5f666e" slate />
      {/* bell cupola */}
      <Box s={[0.22, 0.24, 0.22]} p={[0, H + 0.5, 0]} c="#efe6d4" r={0.03} />
      <mesh position={[0, H + 0.72, 0]} castShadow>
        <coneGeometry args={[0.18, 0.22, 4]} />
        <Mat c="#6f747a" p="stone" />
      </mesh>
      {/* water wheel pit + breast-shot wheel on the side */}
      <Box s={[0.5, 0.45, 1.25]} p={[W / 2 + 0.3, 0.12, 0]} c="#9e8f7a" r={0.03} />
      <Wheel R={0.78} w={0.38} p={[W / 2 + 0.3, 0.72, 0]} a={-t * 0.9} c="#7a5a3c" paddles={20} spokes={8} />
      {/* leat: water channel arriving at mid height of the wheel (breast-shot) */}
      <Box s={[0.36, 0.1, 1.6]} p={[W / 2 + 0.3, 0.88, -1.25]} c="#8d806f" r={0.03} />
      <mesh position={[W / 2 + 0.3, 0.94, -1.2]}>
        <boxGeometry args={[0.28, 0.02, 1.6]} />
        <meshPhysicalMaterial color="#3d8e9c" roughness={0.04} metalness={0.2} clearcoat={1} envMapIntensity={5} />
      </mesh>
    </group>
  );
};

export const Terrace: React.FC<{ p: V3; n: number; rotY?: number }> = ({ p, n, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    {Array.from({ length: n }, (_, i) => {
      const x = i * 0.52;
      return (
        <group key={i} position={[x, 0, 0]}>
          <Box s={[0.5, 0.62, 0.55]} p={[0, 0.31, 0]} c={i % 2 ? "#cdb38c" : "#c6aa82"} r={0.02} />
          <Box s={[0.12, 0.2, 0.02]} p={[-0.1, 0.12, 0.28]} c="#4c3a2c" r={0.01} />
          <Box s={[0.12, 0.12, 0.02]} p={[0.12, 0.42, 0.28]} c="#2f3a44" r={0.01} />
          <Box s={[0.08, 0.2, 0.08]} p={[0.18, 1.0, 0]} c="#9a5a40" r={0.01} />
        </group>
      );
    })}
    <Roof w={n * 0.52} d={0.55} h={0.3} p={[(n - 1) * 0.26, 0.62, 0]} c="#5f666e" slate />
  </group>
);

/** Tapered round brick chimney with a cap. */
export const Chimney: React.FC<{ p: V3; h: number; r: number; grain: BrickTex }> = ({ p, h, r, grain }) => (
  <group position={p}>
    <Box s={[r * 2.8, 0.5, r * 2.8]} p={[0, 0.25, 0]} c="#e8ddd8" r={0.03} map={grain.map} bump={grain.bump} bs={1.2} />
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r * 0.72, r, h, 24]} />
      <Mat c="#ffffff" p="stone" map={grain.map} bump={grain.bump} bs={1.2} />
    </mesh>
    <mesh position={[0, h + 0.05, 0]} castShadow>
      <cylinderGeometry args={[r * 0.95, r * 0.8, 0.14, 24]} />
      <Mat c="#3b2c26" p="stone" />
    </mesh>
  </group>
);

/** Stylised smoke: soft clay puffs drifting with the wind (seeded). */
export const Smoke: React.FC<{ p: V3; t: number; seed: number; n?: number; scale?: number }> = ({ p, t, seed, n = 7, scale = 1 }) => {
  const puffs = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: n }, (_, i) => ({ k: i / n, dx: (r() - 0.5) * 0.25, s: 0.75 + r() * 0.5 }));
  }, [seed, n]);
  return (
    <group position={p} scale={scale}>
      {puffs.map((q, i) => {
        const k = (q.k + t * 0.08) % 1;
        const rad = (0.13 + k * 0.3) * q.s;
        return (
          <mesh key={i} position={[k * 2.6 + q.dx, 0.05 + k * 0.05 + Math.sin(k * 5 + seed) * 0.05, -k * 0.2]} castShadow>
            <icosahedronGeometry args={[rad, 2]} />
            <meshPhysicalMaterial color={k < 0.3 ? "#9d9893" : "#c8c3bc"} roughness={0.95} sheen={0.4} sheenColor="#ffffff" transparent opacity={1 - k * 0.55} depthWrite={k < 0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Beam engine house with a rotative flywheel (sun-and-planet era). */
export const EngineHouse: React.FC<{ p: V3; t: number; grain: BrickTex }> = ({ p, t, grain }) => {
  const rock = Math.sin(t * 1.4) * 0.12;
  return (
    <group position={p} rotation={[0, -0.25, 0]}>
      <Box s={[1.0, 2.1, 1.1]} p={[0, 1.05, 0]} c="#ffffff" r={0.04} map={grain.map} bump={grain.bump} bs={1.2} />
      <Windows cols={1} rows={2} w={1.0} h={1.5} y0={0.3} z={0.555} ww={0.22} wh={0.42} frame="#e7d9c0" />
      <Roof w={1.0} d={1.1} h={0.4} p={[0, 2.1, 0]} c="#55585e" rotY={Math.PI / 2} slate />
      {/* iron beam rocking over the gable wall */}
      <group position={[0.5, 2.0, 0]} rotation={[0, 0, rock]}>
        <Box s={[2.0, 0.14, 0.16]} p={[0.35, 0, 0]} c="#2e3236" r={0.03} metal={0.75} rough={0.35} />
      </group>
      {/* connecting rod down to the flywheel */}
      <Box s={[0.07, 1.3, 0.07]} p={[1.3, 1.35, 0.18]} c="#2e3236" r={0.02} metal={0.75} rough={0.35} />
      <Wheel R={0.75} w={0.12} p={[1.35, 0.85, 0.3]} a={t * 1.4} c="#2e3236" paddles={0} spokes={6} iron rotY={Math.PI / 2} />
      <Box s={[0.18, 0.7, 0.5]} p={[1.35, 0.35, 0.3]} c="#8e8274" r={0.03} />
    </group>
  );
};

/** Early locomotive, generic silhouette: barrel boiler, tall thin chimney, big driving wheels, inclined cylinders. */
export const Locomotive: React.FC<{ p: V3; rotY: number; dist?: number }> = ({ p, rotY, dist = 0 }) => {
  const spoked = (R: number, x: number, z: number, key: string) => (
    <group key={key} position={[x, R, z]}>
      <Wheel R={R} w={0.02} p={[0, 0, 0]} a={0.2 - dist / R} c="#e8d9b0" paddles={0} spokes={10} rotY={Math.PI / 2} />
    </group>
  );
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      {/* frame */}
      <Box s={[1.25, 0.08, 0.5]} p={[0.0, 0.3, 0]} c="#4a3a2c" r={0.02} />
      {/* barrel boiler */}
      <mesh position={[0.05, 0.56, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.95, 28]} />
        <meshPhysicalMaterial roughness={0.25} clearcoat={1} clearcoatRoughness={0.08} metalness={0.15} envMapIntensity={2.5} color="#e2b23a" />
      </mesh>
      {[-0.3, 0.05, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.223, 0.012, 8, 32]} />
          <Mat c="#b38a4a" p="toyPlastic" metal={0.85} rough={0.25} />
        </mesh>
      ))}
      {/* firebox at the back */}
      <Box s={[0.32, 0.5, 0.44]} p={[-0.6, 0.55, 0]} c="#c9a24a" r={0.04} mp="toyPlastic" />
      {/* tall thin chimney at the front */}
      <mesh position={[0.48, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.9, 16]} />
        <Mat c="#f1ede4" p="toyPlastic" />
      </mesh>
      <mesh position={[0.48, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.065, 0.08, 16]} />
        <Mat c="#2d2a26" p="toyPlastic" />
      </mesh>
      {/* inclined outside cylinders */}
      {[-0.27, 0.27].map((z) => (
        <mesh key={z} position={[-0.15, 0.55, z]} rotation={[0, 0, -0.66]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.42, 14]} />
          <Mat c="#5b5f66" p="toyPlastic" metal={0.85} rough={0.28} />
        </mesh>
      ))}
      {[-0.27, 0.27].map((z) => spoked(0.34, 0.3, z, `d${z}`))}
      {[-0.27, 0.27].map((z) => spoked(0.18, -0.5, z, `t${z}`))}
      {/* tender with water barrel */}
      <group position={[-1.2, 0, 0]}>
        <Box s={[0.75, 0.32, 0.5]} p={[0, 0.42, 0]} c="#6e5136" r={0.03} />
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.55, 20]} />
          <Mat c="#8a6a44" p="stone" />
        </mesh>
        {[-0.22, 0.22].map((x) => [-0.26, 0.26].map((z) => spoked(0.15, x, z, `e${x}${z}`)))}
      </group>
      {/* coal wagon */}
      <group position={[-2.05, 0, 0]}>
        <Box s={[0.75, 0.36, 0.5]} p={[0, 0.44, 0]} c="#5a4632" r={0.03} />
        <mesh position={[0, 0.66, 0]} scale={[1.4, 0.45, 0.95]} castShadow>
          <icosahedronGeometry args={[0.24, 1]} />
          <Mat c="#222124" p="stone" rough={0.6} />
        </mesh>
        {[-0.22, 0.22].map((x) => [-0.26, 0.26].map((z) => spoked(0.15, x, z, `w${x}${z}`)))}
      </group>
    </group>
  );
};

export const Track: React.FC<{ a: [number, number]; b: [number, number]; y: number }> = ({ a, b, y }) => {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const L = Math.hypot(dx, dz);
  const ang = -Math.atan2(dz, dx);
  const n = Math.floor(L / 0.26);
  return (
    <group position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, ang, 0]}>
      <Box s={[L, 0.06, 1.0]} p={[0, 0.03, 0]} c="#9b9285" r={0.02} />
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} s={[0.1, 0.05, 0.9]} p={[-L / 2 + 0.13 + i * 0.26, 0.08, 0]} c="#5c4532" r={0.015} />
      ))}
      {[-0.34, 0.34].map((z) => (
        <mesh key={z} position={[0, 0.13, z]} castShadow>
          <boxGeometry args={[L, 0.045, 0.04]} />
          <meshPhysicalMaterial color="#9a9ea4" metalness={0.9} roughness={0.25} envMapIntensity={3} />
        </mesh>
      ))}
    </group>
  );
};

/** Station board with the fictitious name, part of the 3D world. */
export const Board: React.FC<{ p: V3; rotY: number; font: string }> = ({ p, rotY, font }) => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 256;
    const c = cv.getContext("2d")!;
    c.fillStyle = "#24433a";
    c.fillRect(0, 0, 1024, 256);
    c.strokeStyle = "#e9dcbf";
    c.lineWidth = 10;
    c.strokeRect(18, 18, 988, 220);
    c.fillStyle = "#f1e6cc";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `600 120px ${font}`;
    c.fillText("AUDIRA", 512, 112);
    c.font = `500 40px ${font}`;
    c.fillText("STATION", 512, 198);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [font]);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      {[-0.62, 0.62].map((x) => (
        <Box key={x} s={[0.07, 1.0, 0.07]} p={[x, 0.5, 0]} c="#3b2c22" r={0.02} />
      ))}
      <mesh position={[0, 0.88, 0.04]} castShadow>
        <boxGeometry args={[1.5, 0.4, 0.05]} />
        <meshPhysicalMaterial attach="material-0" color="#24433a" />
        <meshPhysicalMaterial attach="material-1" color="#24433a" />
        <meshPhysicalMaterial attach="material-2" color="#24433a" />
        <meshPhysicalMaterial attach="material-3" color="#24433a" />
        <meshPhysicalMaterial attach="material-4" map={tex} roughness={0.5} clearcoat={0.4} />
        <meshPhysicalMaterial attach="material-5" color="#24433a" />
      </mesh>
    </group>
  );
};

/** Seeded brick courses with mortar joints: colour map + matching bump (joints recessed). */
export type BrickTex = { map: THREE.Texture; bump: THREE.Texture };
export function brickTextures(seed: number, rx: number, ry: number): BrickTex {
  const mk = (colour: boolean) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d")!;
    const rnd = prng(seed);
    c.fillStyle = colour ? "#d8cbb4" : "#202020";
    c.fillRect(0, 0, 256, 256);
    const rows = 16, cols = 8, bh = 256 / rows, bw = 256 / cols;
    for (let y = 0; y < rows; y++) {
      for (let x = -1; x < cols; x++) {
        const ox = (y % 2) * bw * 0.5;
        const v = rnd();
        if (colour) {
          const l = 0.82 + v * 0.3;
          c.fillStyle = "rgb(" + Math.round(176 * l) + "," + Math.round(86 * l) + "," + Math.round(60 * l) + ")";
        } else {
          const g = 200 + Math.round(v * 40);
          c.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
        }
        c.fillRect(x * bw + ox + 1.5, y * bh + 1.5, bw - 3, bh - 3);
      }
    }
    const t = new THREE.CanvasTexture(cv);
    if (colour) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };
  return { map: mk(true), bump: mk(false) };
}

export const R = 7.2;
export const TIER = { front: 0.35, mid: 1.1, back: 1.9 };

/** `omit` (film only) drops pieces the film re-renders with its own animation; the cover passes nothing. */
export const Diorama: React.FC<{ t: number; f60: number; font: string; omit?: string[] }> = ({ t, f60, font, omit = [] }) => {
  const has = (k: string) => !omit.includes(k);
  const grass = useSurfaceGrain(11, 0.7, 7);
  const ripple = useSurfaceGrain(5, 0.5, 9);
  const bf = useMemo(() => brickTextures(23, 3, 2), []);
  const bc = useMemo(() => brickTextures(29, 2, 6), []);
  const be = useMemo(() => brickTextures(37, 1.2, 2.5), []);
  const stone = useSurfaceGrain(31, 0.75, 6);
  const trees = useMemo(() => {
    const r = prng(56);
    const spots: V3[] = [
      [-5.6, TIER.front, 2.6], [-6.2, TIER.front, 1.4], [5.9, TIER.front, 1.6], [6.3, TIER.front, 2.6],
      [-5.9, TIER.mid, -0.6], [-6.4, TIER.mid, 0.4], [4.6, TIER.mid, -1.6], [-2.6, TIER.front, 6.2],
      [0.9, TIER.front, 6.5], [-4.6, TIER.front, 5.2],
    ];
    return spots.map((p) => ({ p, s: 0.75 + r() * 0.5, c: r() < 0.5 ? "#7f9a5e" : "#94a86a" }));
  }, []);
  return (
    <group>
      {/* pearl plinth with a hairline time ring (TIMEFORGE stage) */}
      <mesh position={[0, -0.55, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[R + 0.25, R + 0.3, 1.1, 128]} />
        <meshPhysicalMaterial color="#efece6" roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.31, 0.025, 8, 256]} />
        <meshBasicMaterial color="#9fe3e6" toneMapped={false} />
      </mesh>

      {/* terraces: front farm (grass), river, mid mill ground, back industrial yard */}
      <Tier r={R} z0={3.75} z1={R} top={TIER.front} c="#a8b884" bump={grass} />
      <Tier r={R} z0={2.55} z1={3.75} top={0.16} c="#7c6f5c" />
      <mesh position={[0, 0.2, 3.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2 * Math.sqrt(R * R - 3.15 * 3.15) - 0.1, 1.15]} />
        <meshPhysicalMaterial color="#3d8e9c" roughness={0.04} metalness={0.2} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={5} sheen={0.3} sheenColor="#bff3f0" bumpMap={ripple} bumpScale={0.25} />
      </mesh>
      <Tier r={R} z0={1.2} z1={2.55} top={TIER.front} c="#a8b884" bump={grass} />
      <Tier r={R} z0={-2.3} z1={1.2} top={TIER.mid} c="#b9b48c" bump={grass} />
      <Tier r={R} z0={-R} z1={-2.3} top={TIER.back} c="#8f857a" bump={stone} />

      {/* FRONT: pre-industrial power — wind, water, muscle */}
      <Windmill p={[-3.7, TIER.front, 4.3]} t={t} />
      <Cottage p={[-1.6, TIER.front, 4.5]} rotY={0.15} />
      <Cottage p={[2.9, TIER.front, 1.75]} rotY={-0.1} wall="#ece2cd" />
      <Wheel R={0.55} w={0.3} p={[2.25, 0.55, 2.78]} a={-t * 0.8} c="#7a5a3c" paddles={14} spokes={6} rotY={Math.PI / 2} />
      {Array.from({ length: 7 }, (_, i) => (
        <Box key={i} s={[2.6, 0.08, 0.16]} p={[2.3, TIER.front + 0.04, 4.05 + i * 0.25]} c={i % 2 ? "#d7b45f" : "#b8c27a"} r={0.03} mp="fabric" />
      ))}
      <Haystack p={[0.4, TIER.front, 4.6]} />
      <Haystack p={[0.75, TIER.front, 5.0]} s={0.8} />
      {has("people") && <>
      <ToyPerson f={f60} seed={4} pose="walk" outfit="casual" position={[1.1, TIER.front, 4.9]} heading={-0.6} scale={0.6} look={{ top: "#d9cdb0", bottom: "#5b4a3a", height: 1 }} />
      <ToyPerson f={f60} seed={9} pose="stand" outfit="casual" position={[-0.6, TIER.front, 4.4]} heading={0.4} scale={0.6} look={{ top: "#8c3b2e", bottom: "#4a3d33", height: 0.95 }} />
      </>}

      {/* MIDDLE: water-powered stone mill + workers' houses */}
      {has("mill") && <StoneMill p={[-1.3, TIER.mid, -0.55]} t={t} grain={stone} />}
      <Terrace p={[2.1, TIER.mid, 0.25]} n={5} rotY={-0.12} />
      {has("people") && <>
      <ToyPerson f={f60} seed={21} pose="walk" outfit="casual" position={[1.4, TIER.mid, 0.75]} heading={1.2} scale={0.6} look={{ top: "#3c5a7a", bottom: "#3a332c", height: 1 }} />
      <ToyPerson f={f60} seed={33} pose="stand" outfit="casual" position={[0.95, TIER.mid, 0.6]} heading={0.3} scale={0.6} look={{ top: "#b98c4a", bottom: "#463a30", height: 0.7 }} />
      </>}

      {/* BACK: steam — engine house with flywheel, brick works, chimneys, railway */}
      <group position={[-3.0, TIER.back, -4.1]}>
        <Box s={[3.0, 1.5, 1.6]} p={[0, 0.75, 0]} c="#ffffff" r={0.05} map={bf.map} bump={bf.bump} bs={1.2} />
        <Windows cols={7} rows={2} w={2.8} h={1.25} y0={0.12} z={0.8} ww={0.18} wh={0.3} frame="#e7d9c0" />
        {[-1.0, 0, 1.0].map((x) => (
          <group key={x} position={[x, 1.5, 0]}>
            <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
              <cylinderGeometry args={[0.55, 0.55, 1.0, 3, 1, false, 0, Math.PI]} />
              <meshPhysicalMaterial color="#5a5f66" roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.12} envMapIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
      <Chimney p={[-1.0, TIER.back, -5.0]} h={2.85} r={0.34} grain={bc} />
      <Chimney p={[-5.0, TIER.back, -3.3]} h={2.7} r={0.26} grain={bc} />
      <Smoke p={[-1.0, TIER.back + 2.9, -5.0]} t={t} seed={7} n={8} scale={1.1} />
      {has("smokeW") && <Smoke p={[-5.0, TIER.back + 2.75, -3.3]} t={t + 3} seed={13} n={6} scale={0.8} />}
      {has("engine") && <EngineHouse p={[-0.15, TIER.back, -3.35]} t={t} grain={be} />}
      <Track a={[0.8, -6.6]} b={[6.6, -2.5]} y={TIER.back} />
      {has("loco") && <>
      <group position={[5.15, TIER.back + 0.15, -3.52]} scale={1.3}><Locomotive p={[0, 0, 0]} rotY={-Math.atan2(4.1, 5.8)} /></group>
      <Smoke p={[5.6, TIER.back + 2.1, -3.2]} t={t + 1.5} seed={29} n={5} scale={0.55} />
      </>}
      <group scale={1.35}><Board p={[2.55, TIER.back / 1.35, -2.25]} rotY={-0.15} font={font} /></group>
      {has("people") && <ToyPerson f={f60} seed={41} pose="wave" outfit="casual" position={[1.95, TIER.back, -2.85]} heading={0.3} scale={0.6} look={{ top: "#2f4a3e", bottom: "#2c2a2a", height: 1 }} />}

      {trees.map((q, i) => (has(`tree${i}`) ? <Tree key={i} p={q.p} s={q.s} c={q.c} /> : null))}
    </group>
  );
};
