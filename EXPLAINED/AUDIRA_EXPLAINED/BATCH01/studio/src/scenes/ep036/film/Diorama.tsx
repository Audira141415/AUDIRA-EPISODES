// EP036 film diorama: a cutaway city block over TWIN round tunnels (one per track direction),
// a raised station entrance, a sump pit with a pump between the tunnels and a discharge pipe
// to the street drain. All state comes in as props computed from the VO clock.

import React, { useLayoutEffect, useMemo } from "react";
import {
  BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, MeshStandardMaterial, Path, RepeatWrapping, Shape,
} from "three";
import { prng } from "../../../core/materials/textures.ts";
import { arrowGeo, Building, pipe, strataTexture, Tree, windowTex } from "../World.tsx";
import { P } from "../layout.ts";
import { Rings, Train } from "./common.tsx";

export const DB = { hw: 7.4, top: 0, bottom: -14.5, front: 4, back: -12 };
export const TW = { xs: [-3.7, 3.7] as const, y: -8, R: 2.8, r: 2.42, invertY: -9.85, len: 1.5 };
export const DSUMP = { x0: -1.4, x1: 1.4, y0: -14.0, y1: -11.1, wallZ: 1.6, water: -13.0 };
export const DROAD = { z0: -4.6, z1: 1.5 };
export const ENTRANCE = { x: -4.6, z: 2.8 };
export const TRAIN_LEN = 3 * 6.4 + 2 * 0.25;
export const FLOOD = "#6b5236";

export type DioramaState = {
  t: number;
  /** flood depth above the road (world units, curb = 0.25) */
  flood: number;
  rain: number;
  /** train cab z for left (receding) and right (approaching) tunnels */
  trainL: number;
  trainR: number;
  /** 0..1 visibility of groundwater pressure arrows */
  pressure: number;
  /** 0..1 gasket glow */
  glow: number;
  /** pump running 0..1 (flow arrows + light) */
  pump: number;
  /** 0..1 seepage droplets running to the sump */
  seep: number;
};

const Soil: React.FC = () => {
  const { geo, front, side, sideTex } = useMemo(() => {
    const s = new Shape();
    s.moveTo(-DB.hw, DB.bottom);
    s.lineTo(DB.hw, DB.bottom);
    s.lineTo(DB.hw, DB.top);
    s.lineTo(-DB.hw, DB.top);
    s.closePath();
    TW.xs.forEach((x) => {
      const h = new Path();
      h.absarc(x, TW.y, TW.R, 0, Math.PI * 2, true);
      s.holes.push(h);
    });
    const sp = new Path();
    sp.moveTo(DSUMP.x0, DSUMP.y0);
    sp.lineTo(DSUMP.x0, DSUMP.y1);
    sp.lineTo(DSUMP.x1, DSUMP.y1);
    sp.lineTo(DSUMP.x1, DSUMP.y0);
    sp.closePath();
    s.holes.push(sp);
    const geo = new ExtrudeGeometry(s, { depth: DB.front - DB.back, bevelEnabled: false, curveSegments: 72 });
    geo.translate(0, 0, DB.back);
    const tex = strataTexture();
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(1 / (2 * DB.hw), 1 / (DB.top - DB.bottom));
    tex.offset.set(0.5, 1);
    const front = new MeshStandardMaterial({ map: tex, roughness: 0.95 });
    const side = new MeshStandardMaterial({ color: "#a98663", roughness: 0.95 });
    const sideTex = strataTexture();
    return { geo, front, side, sideTex };
  }, []);
  const H = DB.top - DB.bottom, Dz = DB.front - DB.back;
  return (
    <group>
      <mesh geometry={geo} material={[front, side]} castShadow receiveShadow />
      <mesh position={[DB.hw + 0.002, (DB.top + DB.bottom) / 2, (DB.front + DB.back) / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[Dz, H]} />
        <meshStandardMaterial map={sideTex} roughness={0.95} />
      </mesh>
      <mesh position={[0, DB.bottom - 0.35, (DB.front + DB.back) / 2]} receiveShadow castShadow>
        <boxGeometry args={[DB.hw * 2 + 0.6, 0.7, Dz + 0.6]} />
        <meshStandardMaterial color="#e7e2d9" roughness={0.7} />
      </mesh>
    </group>
  );
};

const Tube: React.FC<{ x: number; s: DioramaState; train: number; dir: 1 | -1 }> = ({ x, s, train, dir }) => {
  const inv = useMemo(() => {
    const yc = TW.invertY - TW.y;
    const r = TW.r + 0.01;
    const a = Math.asin(yc / r);
    const sh = new Shape();
    sh.moveTo(Math.cos(a) * r, yc);
    sh.absarc(0, 0, r, a, Math.PI - a, true);
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth: DB.front - DB.back - 0.05, bevelEnabled: false, curveSegments: 40 });
    g.translate(0, 0, DB.back);
    return g;
  }, []);
  const n = Math.floor((DB.front - DB.back) / TW.len);
  const Lz = DB.front - DB.back;
  return (
    <group position={[x, TW.y, 0]}>
      <Rings R={TW.R} r={TW.r} len={TW.len} n={n} z0={DB.front} glow={s.glow} />
      <mesh geometry={inv} receiveShadow>
        <meshStandardMaterial color="#bdb7ad" roughness={0.9} />
      </mesh>
      {[-0.6, 0.6].map((rx) => (
        <mesh key={rx} position={[rx, TW.invertY - TW.y + 0.09, (DB.front + DB.back) / 2]} receiveShadow>
          <boxGeometry args={[0.1, 0.18, Lz - 0.1]} />
          <meshStandardMaterial color="#9aa1a8" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, TW.invertY - TW.y + 0.02, DB.front - 0.3 - i * 0.55]}>
          <boxGeometry args={[1.7, 0.05, 0.22]} />
          <meshStandardMaterial color="#8d877e" roughness={0.9} />
        </mesh>
      ))}
      {/* drainage channel along the invert */}
      <mesh position={[-x > 0 ? 1.45 : -1.45, TW.invertY - TW.y + 0.012, (DB.front + DB.back) / 2]}>
        <boxGeometry args={[0.26, 0.03, Lz - 0.1]} />
        <meshStandardMaterial color={P.water} roughness={0.08} emissive={P.water} emissiveIntensity={0.3 + s.seep * 0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`l${i}`} position={[x > 0 ? -1.85 : 1.85, 1.5, DB.front - 0.7 - i * 2.4]} rotation={[0, 0, x > 0 ? -0.85 : 0.85]}>
          <boxGeometry args={[0.09, 0.42, 0.8]} />
          <meshStandardMaterial color="#fff6dc" emissive="#ffe9b0" emissiveIntensity={2.2} />
        </mesh>
      ))}
      <mesh position={[0, 0, DB.back + 0.06]}>
        <circleGeometry args={[TW.r, 48]} />
        <meshStandardMaterial color="#353a40" roughness={1} />
      </mesh>
      <pointLight position={[0, 1.2, 2.6]} intensity={7} distance={8} decay={2} color="#ffe2a8" />
      {/* train: `train` = its z nearest the camera; dir 1 = cab facing camera, -1 = tail facing camera */}
      <group position={[0, TW.invertY - TW.y + 0.2 + 1.25, dir === 1 ? train : train - TRAIN_LEN]} rotation={[0, dir === 1 ? 0 : Math.PI, 0]}>
        <Train cars={3} />
      </group>
    </group>
  );
};

const Sump: React.FC<{ s: DioramaState }> = ({ s }) => {
  const z = DB.front;
  const discharge = useMemo(() => pipe([[0.35, -12.4, 3.0], [0.35, -11.6, 3.3], [0.1, -11.3, 3.9], [0, -10.8, z], [0, -6, z], [0, -0.3, z]], 0.16), [z]);
  const drains = useMemo(
    () => [-1, 1].map((sx) => pipe([[sx * 2.25, TW.invertY - 0.05, z], [sx * 1.7, -10.7, z], [sx * 1.2, -11.6, z], [sx * 1.0, -12.0, z]], 0.1)),
    [z],
  );
  const level = DSUMP.water - 0.45 * s.pump;
  const flowY = (i: number, n: number, y0: number, y1: number, speed: number) => {
    const k = (((i / n + s.t * speed) % 1) + 1) % 1;
    return y0 + k * (y1 - y0);
  };
  return (
    <group>
      <mesh position={[0, (DSUMP.y0 + DSUMP.y1) / 2, DSUMP.wallZ]}>
        <boxGeometry args={[DSUMP.x1 - DSUMP.x0, DSUMP.y1 - DSUMP.y0, 0.1]} />
        <meshStandardMaterial color="#c2bcb2" roughness={0.9} />
      </mesh>
      <mesh position={[0, DSUMP.y0 + 0.08, (DSUMP.wallZ + z) / 2]}>
        <boxGeometry args={[DSUMP.x1 - DSUMP.x0, 0.16, z - DSUMP.wallZ]} />
        <meshStandardMaterial color="#b3ada3" roughness={0.9} />
      </mesh>
      <mesh position={[0, (DSUMP.y0 + 0.16 + level) / 2, (DSUMP.wallZ + z) / 2 - 0.02]}>
        <boxGeometry args={[DSUMP.x1 - DSUMP.x0 - 0.02, level - DSUMP.y0 - 0.16, z - DSUMP.wallZ - 0.06]} />
        <meshPhysicalMaterial color={P.water} roughness={0.05} transparent opacity={0.72} emissive={P.waterDeep} emissiveIntensity={0.25} />
      </mesh>
      <group position={[0.35, DSUMP.y0 + 0.16, 3.0]} scale={1.15}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.4, 1.1, 28]} />
          <meshStandardMaterial color={P.amber} roughness={0.4} metalness={0.3} emissive={P.amber} emissiveIntensity={s.pump * 0.5} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.36, 0.25, 28]} />
          <meshStandardMaterial color="#5d6164" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.3, 1.0, 0.3]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#7dff9e" emissive="#3dff7a" emissiveIntensity={s.pump * 3} />
        </mesh>
      </group>
      <mesh geometry={discharge} castShadow>
        <meshStandardMaterial color={P.water} roughness={0.35} metalness={0.2} />
      </mesh>
      {drains.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={P.water} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
      {s.pump > 0.01 &&
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0, flowY(i, 6, -10.6, -0.8, 0.35), z + 0.2]} scale={s.pump}>
            <coneGeometry args={[0.13, 0.26, 3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        ))}
      {s.seep > 0.01 &&
        [-1, 1].flatMap((sx) =>
          Array.from({ length: 3 }, (_, i) => {
            const k = (((i / 3 + s.t * 0.5) % 1) + 1) % 1;
            const x = sx * lerpN(2.25, 1.0, k), y = lerpN(TW.invertY, -12.0, k);
            return (
              <mesh key={`${sx}${i}`} position={[x, y, z + 0.14]} scale={s.seep}>
                <sphereGeometry args={[0.09, 12, 10]} />
                <meshStandardMaterial color="#ffffff" emissive="#bfe4ff" emissiveIntensity={1.2} />
              </mesh>
            );
          }),
        )}
      <pointLight position={[0, -12.1, 3.6]} intensity={3} distance={4} decay={2} color="#cfe8ff" />
    </group>
  );
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

const Pressure: React.FC<{ s: DioramaState }> = ({ s }) => {
  if (s.pressure < 0.01) return null;
  const angles = [110, 150, 190, 230, 270, 310, 350, 30, 70].map((d) => (d * Math.PI) / 180);
  const pulse = 0.12 * Math.sin(s.t * 6);
  return (
    <group>
      {TW.xs.map((x) => (
        <group key={x} position={[x, TW.y, DB.front + 0.01]}>
          {angles.map((a, i) => {
            const r = TW.R + 0.25 + pulse + (1 - s.pressure) * 0.8;
            return (
              <mesh key={i} geometry={arrowGeo()} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a + Math.PI]} scale={0.8 * s.pressure}>
                <meshStandardMaterial color={P.waterDeep} emissive={P.water} emissiveIntensity={0.35} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

const RainField: React.FC<{ t: number; amount: number }> = ({ t, amount }) => {
  const geo = useMemo(() => new BufferGeometry(), []);
  useLayoutEffect(() => {
    const rnd = prng(3602);
    const N = Math.round(900 * amount), pos: number[] = [];
    const H = 7;
    for (let i = 0; i < N; i++) {
      const x = -9 + rnd() * 18, z = -12 + rnd() * 17;
      const y0 = rnd() * H;
      const y = ((y0 - t * 16) % H + H) % H + 0.3;
      const len = 0.45 + rnd() * 0.5;
      pos.push(x, y, z, x - len * 0.18, y + len, z - len * 0.05);
    }
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.computeBoundingSphere();
  }, [t, amount, geo]);
  if (amount < 0.01) return null;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#5a7d99" transparent opacity={0.7} />
    </lineSegments>
  );
};

const Street: React.FC<{ s: DioramaState }> = ({ s }) => {
  const tex = useMemo(() => windowTex(), []);
  const W2 = DB.hw * 2;
  const ripples = useMemo(() => {
    const rnd = prng(908);
    return Array.from({ length: 22 }, () => ({ x: -6.8 + rnd() * 13.6, z: DROAD.z0 + 0.3 + rnd() * (DROAD.z1 - DROAD.z0 - 0.6), ph: rnd() }));
  }, []);
  const fh = Math.max(0.02, s.flood);
  return (
    <group>
      <mesh position={[0, -0.02, (DROAD.z0 + DROAD.z1) / 2]} receiveShadow>
        <boxGeometry args={[W2, 0.04, DROAD.z1 - DROAD.z0]} />
        <meshStandardMaterial color={P.asphalt} roughness={0.6} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-6 + i * 2, 0.005, (DROAD.z0 + DROAD.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 0.12]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.7} />
        </mesh>
      ))}
      {[
        [DROAD.z1, DB.front],
        [DB.back, DROAD.z0],
      ].map(([z0, z1], i) => (
        <mesh key={i} position={[0, 0.125, (z0 + z1) / 2]} castShadow receiveShadow>
          <boxGeometry args={[W2, 0.25, z1 - z0]} />
          <meshStandardMaterial color={P.paver} roughness={0.85} />
        </mesh>
      ))}
      {/* flood water: murky brown, may rise over the curb onto the sidewalk */}
      <mesh position={[0, fh / 2, (DROAD.z0 + DROAD.z1) / 2]}>
        <boxGeometry args={[W2 - 0.01, fh, DROAD.z1 - DROAD.z0 - 0.01]} />
        <meshPhysicalMaterial color={FLOOD} roughness={0.22} transparent opacity={0.93} clearcoat={0.3} />
      </mesh>
      {s.flood > 0.27 && (
        <mesh position={[0, (s.flood + 0.25) / 2, (DROAD.z1 + DB.front) / 2]}>
          <boxGeometry args={[W2 - 0.01, s.flood - 0.25, DB.front - DROAD.z1 - 0.01]} />
          <meshPhysicalMaterial color={FLOOD} roughness={0.22} transparent opacity={0.9} clearcoat={0.3} />
        </mesh>
      )}
      {s.rain > 0.05 &&
        ripples.map((r, i) => {
          const k = ((r.ph + s.t * 0.9) % 1 + 1) % 1;
          return (
            <mesh key={i} position={[r.x, fh + 0.006, r.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05 + k * 0.4, 0.09 + k * 0.4, 28]} />
              <meshBasicMaterial color="#f3ead9" transparent opacity={0.6 * (1 - k) * s.rain} />
            </mesh>
          );
        })}
      {/* cars stuck in the flood */}
      {[
        [1.6, -0.6, "#ef7a43"],
        [-1.8, -3.2, "#5ea7dc"],
      ].map(([x, z, c], i) => (
        <group key={i} position={[x as number, 0.02, z as number]} rotation={[0, i ? Math.PI : 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2.0, 0.6, 1.0]} />
            <meshPhysicalMaterial color={c as string} roughness={0.35} clearcoat={0.8} />
          </mesh>
          <mesh position={[-0.1, 0.95, 0]} castShadow>
            <boxGeometry args={[1.1, 0.42, 0.9]} />
            <meshPhysicalMaterial color="#1c2630" roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* raised station entrance: steps UP from the sidewalk before the stairs go down */}
      <group position={[ENTRANCE.x, 0.25, ENTRANCE.z]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.6, 1.6]} />
          <meshStandardMaterial color="#e9e5dd" roughness={0.8} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[1.35 + (2 - k) * 0.0, 0.1 + k * 0.2, 0]} castShadow>
            <boxGeometry args={[0.6 - k * 0.18, 0.2, 1.2]} />
            <meshStandardMaterial color="#d6d1c7" roughness={0.85} />
          </mesh>
        ))}
        {[[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].map(([x, z], k) => (
          <mesh key={`p${k}`} position={[x, 1.2, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
            <meshStandardMaterial color="#8b9196" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.85, 0]} castShadow>
          <boxGeometry args={[2.8, 0.14, 1.9]} />
          <meshStandardMaterial color={P.water} roughness={0.5} />
        </mesh>
      </group>
      <Building x={-4.8} z={-8.5} w={3.0} d={2.4} h={4.6} tex={tex} />
      <Building x={-1.4} z={-9.0} w={2.6} d={2.2} h={6.4} tex={tex} />
      <Building x={1.8} z={-8.4} w={2.4} d={2.4} h={3.8} tex={tex} />
      <Building x={5.0} z={-8.8} w={3.0} d={2.4} h={5.4} tex={tex} />
      <Tree x={-2.0} z={3.0} s={1} />
      <Tree x={2.4} z={3.1} s={0.9} />
      <Tree x={5.6} z={-6} s={1.1} />
      <Tree x={-6.4} z={-6} s={0.95} />
      <mesh position={[0, 0.256, 3.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial color="#3d4144" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  );
};

export const Diorama: React.FC<{ s: DioramaState }> = ({ s }) => (
  <group>
    <hemisphereLight args={["#eef3f7", "#b9a68f", 0.9]} />
    <directionalLight
      position={[-18, 30, 26]}
      intensity={2.3}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-near={5}
      shadow-camera-far={100}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[20, 6, 18]} intensity={0.7} color="#dfe9f2" />
    <Soil />
    <Tube x={TW.xs[0]} s={s} train={s.trainL} dir={-1} />
    <Tube x={TW.xs[1]} s={s} train={s.trainR} dir={1} />
    <Sump s={s} />
    <Pressure s={s} />
    <Street s={s} />
    <RainField t={s.t} amount={s.rain} />
  </group>
);
