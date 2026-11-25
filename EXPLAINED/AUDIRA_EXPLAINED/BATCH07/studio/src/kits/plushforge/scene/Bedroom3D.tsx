// The cosy bed: a patchwork quilt that dents where the toys sit, a stack of pillows (the front one
// embroidered AUDIRA), a tufted velvet headboard, fairy lights, striped wallpaper, a cotton spool and
// loose buttons. The bear and the bunny drop onto it, bounce, wave, hug, and the needle sews the
// last seam of the bear's heart patch.

import React, { useMemo } from "react";
import * as THREE from "three";
import { PLUSH_PALETTE as P } from "../lib/palette.ts";
import { pillowMaps, plushMaps, quiltMaps, wallpaperMap, plushFinish } from "../lib/fabric.ts";
import { QUILT, pillowEdge, pillowGeometry, quiltPoint, type Dent } from "../lib/seams.ts";
import { BEAR, BUNNY, toyState } from "../core/motion.ts";
import { FeltMat, PlushBear, PlushBunny } from "./Plush3D.tsx";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

type V3 = [number, number, number];

// --- Quilt ---------------------------------------------------------------------------------------
const NX = 180, NZ = 144;
const Quilt: React.FC<{ dents: Dent[] }> = ({ dents }) => {
  const cols = Math.round((QUILT.x1 - QUILT.x0) / QUILT.cell), rows = Math.round((QUILT.z1 - QUILT.z0) / QUILT.cell);
  const { map, bump } = quiltMaps(cols, rows);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) uv.push(i / NX, j / NZ);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const p = j * (NX + 1) + i;
      idx.push(p, p + NX + 1, p + 1, p + 1, p + NX + 1, p + NX + 2);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((NX + 1) * (NZ + 1) * 3), 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }, []);
  const key = dents.map((d) => `${d.x.toFixed(3)},${d.z.toFixed(3)},${d.d.toFixed(4)}`).join("|");
  useMemo(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
      const x = QUILT.x0 + ((QUILT.x1 - QUILT.x0) * i) / NX, z = QUILT.z0 + ((QUILT.z1 - QUILT.z0) * j) / NZ;
      const p = quiltPoint(x, z, dents);
      pos.setXYZ(j * (NX + 1) + i, p[0], p[1], p[2]);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  }, [geo, key]);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshPhysicalMaterial map={map} bumpMap={bump} bumpScale={1.2} roughness={0.88} sheen={0.5} sheenRoughness={0.6} sheenColor="#fff4e0" side={THREE.DoubleSide} />
    </mesh>
  );
};

// --- Pillows -------------------------------------------------------------------------------------
const Pillow: React.FC<{ w: number; h: number; puff: number; position: V3; rotation: V3; front?: "audira" | string; piping: string; back: string }> = ({ w, h, puff, position, rotation, front, piping, back }) => {
  const fg = pillowGeometry(w, h, puff, 1);
  const bg = pillowGeometry(w, h, puff, -1);
  const edge = useMemo(() => new THREE.TubeGeometry(pillowEdge(w, h), 220, 0.013, 8, true), [w, h]);
  const maps = front === "audira" ? pillowMaps() : null;
  const cotton = plushMaps({ fabric: "snow", seed: 41, gores: 0, stitches: false });
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={fg} castShadow receiveShadow>
        {maps ? (
          <meshPhysicalMaterial map={maps.map} bumpMap={maps.bump} bumpScale={2} roughness={0.82} sheen={0.45} sheenRoughness={0.55} sheenColor="#d8f0ee" />
        ) : (
          <meshPhysicalMaterial color={front} bumpMap={cotton.bump} bumpScale={0.8} roughness={0.85} sheen={0.5} sheenRoughness={0.6} sheenColor="#ffffff" />
        )}
      </mesh>
      <mesh geometry={bg} castShadow receiveShadow>
        <meshPhysicalMaterial color={back} roughness={0.85} sheen={0.4} sheenRoughness={0.6} sheenColor="#ffffff" />
      </mesh>
      <mesh geometry={edge} castShadow>
        <meshPhysicalMaterial color={piping} roughness={0.7} sheen={0.6} sheenRoughness={0.4} sheenColor="#ffffff" />
      </mesh>
    </group>
  );
};

// --- Headboard -----------------------------------------------------------------------------------
/** Diamond-tufted velvet: the surface sinks to a button at every lattice point. */
const Headboard: React.FC = () => {
  const W = 2.7, H = 1.0;
  const tufts = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
      const x = -W / 2 + 0.17 + c * 0.295 + (r % 2) * 0.1475;
      const y = -H / 2 + 0.17 + r * 0.22;
      if (x < W / 2 - 0.1) out.push([x, y]);
    }
    return out;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, 216, 80);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      let d2 = 1e9;
      for (const [tx, ty] of tufts) d2 = Math.min(d2, (x - tx) ** 2 + (y - ty) ** 2);
      const edge = Math.min(1, (W / 2 - Math.abs(x)) / 0.06) * Math.min(1, (H / 2 - Math.abs(y)) / 0.06);
      pos.setZ(i, (0.05 * (1 - Math.exp(-d2 / 0.0035)) + 0.01) * Math.max(0, edge));
    }
    g.computeVertexNormals();
    return g;
  }, [tufts]);
  const { map, bump } = plushMaps({ fabric: "velvet", seed: 51, gores: 0, stitches: false });
  const [m, b] = useMemo(() => {
    const a = map.clone(), c = bump.clone();
    a.repeat.set(4, 2);
    c.repeat.set(4, 2);
    a.needsUpdate = c.needsUpdate = true;
    return [a, c];
  }, [map, bump]);
  return (
    <group position={[0, 0.42, -1.33]}>
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W + 0.1, H + 0.1, 0.1]} radius={0.04} />
        <meshPhysicalMaterial color={P.wood} roughness={0.55} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      <mesh geometry={geo} receiveShadow>
        <meshPhysicalMaterial map={m} bumpMap={b} bumpScale={1} {...plushFinish("velvet")} />
      </mesh>
      {tufts.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.012]} scale={[1, 1, 0.5]}>
          <sphereGeometry args={[0.014, 14, 10]} />
          <meshPhysicalMaterial color="#3A2C46" roughness={0.6} sheen={0.6} sheenColor="#C9B4E0" />
        </mesh>
      ))}
    </group>
  );
};

// --- Fairy lights --------------------------------------------------------------------------------
const lightY = (x: number) => {
  const f = ((((x + 1.35) / 0.9) % 1) + 1) % 1;
  return 0.97 - 0.09 * Math.sin(Math.PI * f);
};
const FairyLights: React.FC<{ t: number }> = ({ t }) => {
  const wire = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 90; k++) {
      const x = -1.35 + (2.7 * k) / 90;
      pts.push(new THREE.Vector3(x, lightY(x), -1.2));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 180, 0.003, 5, false);
  }, []);
  const N = 17;
  return (
    <group>
      <mesh geometry={wire}>
        <meshStandardMaterial color={P.wire} roughness={0.6} />
      </mesh>
      {Array.from({ length: N }, (_, i) => {
        const x = -1.28 + (2.56 * i) / (N - 1);
        const glow = 2.2 + 0.5 * Math.sin(t * 2.3 + i * 1.7);
        const c = new THREE.Color(i % 3 === 1 ? "#FFB27A" : P.bulb).multiplyScalar(glow);
        return (
          <mesh key={i} position={[x, lightY(x) - 0.022, -1.2]}>
            <sphereGeometry args={[0.017, 14, 10]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Sewing bits ---------------------------------------------------------------------------------
const Spool: React.FC<{ position: V3; rotation?: V3 }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    {[0.006, 0.094].map((y) => (
      <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.012, 32]} />
        <meshPhysicalMaterial color="#C89A62" roughness={0.5} clearcoat={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.041, 0.041, 0.076, 32]} />
      <FeltMat color={P.threadCream} seed={61} />
    </mesh>
    {Array.from({ length: 16 }, (_, k) => (
      <mesh key={k} position={[0, 0.016 + k * 0.0045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0412, 0.0017, 6, 40]} />
        <meshPhysicalMaterial color={k % 2 ? "#EFE0C6" : P.threadCream} roughness={0.6} sheen={0.7} sheenColor="#ffffff" />
      </mesh>
    ))}
  </group>
);

const SewButton: React.FC<{ position: V3; rotation: V3; color: string; r?: number }> = ({ position, rotation, color, r = 0.026 }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <cylinderGeometry args={[r, r, r * 0.3, 28]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.1} />
    </mesh>
    <mesh position={[0, r * 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r * 0.82, r * 0.1, 8, 28]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.8} />
    </mesh>
    {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b], i) => (
      <mesh key={i} position={[a * r * 0.25, r * 0.152, b * r * 0.25]}>
        <cylinderGeometry args={[r * 0.1, r * 0.1, 0.0015, 10]} />
        <meshBasicMaterial color="#1a1210" />
      </mesh>
    ))}
  </group>
);

// --- Room ----------------------------------------------------------------------------------------
const Room: React.FC = () => {
  const wall = useMemo(() => {
    const m = wallpaperMap().clone();
    m.repeat.set(12, 5);
    m.needsUpdate = true;
    return m;
  }, []);
  return (
    <group>
      <mesh position={[0, 1.0, -1.5]} receiveShadow>
        <planeGeometry args={[9, 4.5]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="#3A2A22" roughness={0.75} />
      </mesh>
      {/* Mattress under the quilt, then the wooden bed frame */}
      <mesh position={[0, -0.17, -0.17]} receiveShadow castShadow>
        <RoundedBoxGeo args={[2.44, 0.32, 2.3]} radius={0.06} />
        <meshPhysicalMaterial color={P.sheet} roughness={0.9} sheen={0.4} sheenColor="#ffffff" />
      </mesh>
      <mesh position={[0, -0.4, -0.17]} receiveShadow castShadow>
        <RoundedBoxGeo args={[2.56, 0.16, 2.42]} radius={0.03} />
        <meshPhysicalMaterial color={P.wood} roughness={0.55} clearcoat={0.3} />
      </mesh>
      {/* Bedside lamp, off to the left: a glowing fabric shade */}
      <group position={[-1.75, -0.05, -0.75]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <RoundedBoxGeo args={[0.5, 0.5, 0.45]} radius={0.03} />
          <meshPhysicalMaterial color={P.wood} roughness={0.5} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.03, 0.06, 0.24, 20]} />
          <meshPhysicalMaterial color="#E9D8BF" roughness={0.4} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.22, 32, 1, true]} />
          <meshBasicMaterial color={new THREE.Color("#FFD9A0").multiplyScalar(1.6)} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

export const TOYS = { bearDent: 0.2, bunnyDent: 0.18 };

/** Everything on the bed at film time t. */
export const Bedroom3D: React.FC<{ t: number }> = ({ t }) => {
  const bear = toyState(BEAR, t, true);
  const bunny = toyState(BUNNY, t, false);
  const dents: Dent[] = [
    { x: bear.pos[0], z: bear.pos[2] + 0.02, r: TOYS.bearDent, d: 0.022 * Math.min(1.6, bear.press) },
    { x: bunny.pos[0], z: bunny.pos[2] + 0.02, r: TOYS.bunnyDent, d: 0.02 * Math.min(1.6, bunny.press) },
  ];
  const groundAt = (x: number, z: number) => quiltPoint(x, z, dents)[1] - 0.004;
  return (
    <group>
      <Room />
      <Headboard />
      <FairyLights t={t} />
      <Quilt dents={dents} />
      <Pillow w={1.05} h={0.56} puff={0.12} position={[-0.62, 0.3, -1.1]} rotation={[-0.4, 0.22, 0.06]} front="#E8DDCB" back="#E8DDCB" piping="#C98A73" />
      <Pillow w={1.05} h={0.56} puff={0.12} position={[0.64, 0.3, -1.12]} rotation={[-0.4, -0.2, -0.05]} front="#7290B4" back="#7290B4" piping="#E8DDCB" />
      <Pillow w={1.2} h={0.62} puff={0.13} position={[0.0, 0.3, -0.9]} rotation={[-0.36, 0, 0]} front="audira" back={P.pillow} piping={P.embroidery} />
      <PlushBear s={bear} t={t} baseY={groundAt(bear.pos[0], bear.pos[2])} />
      <PlushBunny s={bunny} t={t} baseY={groundAt(bunny.pos[0], bunny.pos[2])} />
      <Spool position={[0.86, groundAt(0.86, 0.48), 0.48]} rotation={[0, 0.4, 0]} />
      <SewButton position={[-0.78, groundAt(-0.78, 0.55) + 0.004, 0.55]} rotation={[0.1, 0.3, 0.05]} color="#D8B15A" />
      <SewButton position={[-0.64, groundAt(-0.64, 0.68) + 0.004, 0.68]} rotation={[-0.08, 1.1, 0.06]} color="#C9403A" r={0.02} />
      <SewButton position={[-0.9, groundAt(-0.9, 0.74) + 0.004, 0.74]} rotation={[0.05, 2.0, -0.1]} color={P.pillow} r={0.022} />
    </group>
  );
};

export const bearAt = (t: number) => toyState(BEAR, t, true);
