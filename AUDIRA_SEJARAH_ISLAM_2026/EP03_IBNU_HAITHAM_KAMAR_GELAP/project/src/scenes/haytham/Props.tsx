// EP03 props around the dark room: the model table (map, eye model, Nile rapids model), the shelf of
// seven volumes, the bolted door and barred window, the candles outside the shutter with the hand that
// covers one, the exterior box (camera obscura) with the AUDIRA plaque, and the phone of the payoff.
// People appear only as tiny faceless figures, a hand without a body, or the scholar from behind.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { prng } from "../../core/materials/textures.ts";
import { ROOM, HOLE, SPOTS, CANDLES, TABLE, MAP_C, EYE_C, NILE_C, SHELF_C, DOOR_C, WIN_C, PALETTE } from "./layout.ts";
import { mapTexture, mapUV, MAP_SIZE, CITY, NILE_PATH, spineTexture, softDot, woodTexture, scleraTexture, irisTexture } from "./textures.ts";
import type { FilmState } from "./state.ts";

const FX = 1 << FX_LAYER;
type V3 = [number, number, number];

/** A glowing line segment (thin cylinder) between two points, additive. */
export const GlowLine: React.FC<{ a: V3; b: V3; r?: number; color: string; opacity: number; fx?: boolean }> = ({ a, b, r = 0.004, color, opacity, fx = true }) => {
  const { mid, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    return { mid: A.clone().add(B).multiplyScalar(0.5), len: d.length(), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()) };
  }, [a, b]);
  if (opacity <= 0.001 || len < 1e-4) return null;
  return (
    <mesh position={mid} quaternion={quat} layers-mask={fx ? FX : 1}>
      <cylinderGeometry args={[r, r, len, 8, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const Glow: React.FC<{ p: V3; size: number; color: string; opacity: number }> = ({ p, size, color, opacity }) =>
  opacity > 0.001 ? (
    <sprite position={p} scale={[size, size, size]} layers-mask={FX}>
      <spriteMaterial map={softDot()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  ) : null;

// ---------------------------------------------------------------- model table
/** World position of a lon/lat on the map lying on the table, north toward +x (away from the camera). */
export const mapPoint = (lon: number, lat: number, lift = 0.004): V3 => {
  const [u, v] = mapUV(lon, lat);
  // north (v = 0) toward +x, east (u = 1) toward +z: read from a camera on the -x side looking +x
  const x = MAP_C[0] + (0.5 - v) * MAP_SIZE[1];
  const z = MAP_C[2] + (u - 0.5) * MAP_SIZE[0];
  return [x, MAP_C[1] + lift, z];
};

const Route: React.FC<{ pts: V3[]; p: number; color: string; opacity: number }> = ({ pts, p, color, opacity }) => {
  // cumulative lengths so the line grows at a constant speed
  const segs = useMemo(() => {
    const out: { a: V3; b: V3; l0: number; l1: number }[] = [];
    let acc = 0;
    for (let i = 0; i + 1 < pts.length; i++) {
      const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]);
      out.push({ a: pts[i], b: pts[i + 1], l0: acc, l1: acc + l });
      acc += l;
    }
    return { out, total: acc };
  }, [pts]);
  const L = segs.total * p;
  if (p <= 0 || opacity <= 0) return null;
  let head: V3 = pts[0];
  const parts = segs.out
    .filter((s) => s.l0 < L)
    .map((s, i) => {
      const k = Math.min(1, (L - s.l0) / (s.l1 - s.l0));
      const b: V3 = [s.a[0] + (s.b[0] - s.a[0]) * k, s.a[1] + (s.b[1] - s.a[1]) * k, s.a[2] + (s.b[2] - s.a[2]) * k];
      head = b;
      return <GlowLine key={i} a={s.a} b={b} r={0.0028} color={color} opacity={opacity} />;
    });
  return (
    <group>
      {parts}
      <Glow p={head} size={0.05} color={color} opacity={opacity} />
    </group>
  );
};

/** The eye model turns toward the camera side so its iris reads; rays leave/enter along its gaze. */
export const EYE_YAW = 1.04;
/** World position of the eye model pupil (for tag pins). */
export const EYE_PUPIL: V3 = [EYE_C[0] - Math.sin(EYE_YAW) * 0.088, EYE_C[1], EYE_C[2] - Math.cos(EYE_YAW) * 0.088];

const Eye: React.FC<{ s: FilmState; t: number }> = ({ s, t }) => {
  // anatomical eye model on a brass stand; local frame: eye at the origin, gaze toward local -z
  const rays = [-0.5, -0.25, 0, 0.25, 0.5];
  const pupil: V3 = [0, 0, -0.088];
  const tableY = TABLE.top - EYE_C[1];
  return (
    <group position={EYE_C} rotation={[0, EYE_YAW, 0]}>
      {/* sclera: cream with fine veins */}
      <mesh castShadow>
        <sphereGeometry args={[0.085, 64, 48]} />
        <meshPhysicalMaterial map={scleraTexture()} color="#ffffff" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      {/* iris + pupil */}
      <mesh position={[0, 0, -0.0795]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.034, 48]} />
        <meshStandardMaterial map={irisTexture()} roughness={0.45} />
      </mesh>
      {/* glossy cornea dome */}
      <mesh position={[0, 0, -0.074]} scale={[1, 1, 0.42]}>
        <sphereGeometry args={[0.04, 40, 24]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.03} clearcoat={1} clearcoatRoughness={0.02} metalness={0} />
      </mesh>
      {/* brass ring holder + stand */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.087, 0.005, 12, 64]} />
        <meshStandardMaterial color="#b8924a" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 12]} />
        <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh position={[0, tableY + 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.02, 32]} />
        <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
      </mesh>
      {/* old idea: rays OUT of the eye (cold); on "sinar" they turn red and pull back into the eye */}
      {rays.map((a, i) => {
        const len = 0.42 * s.eyeOut * (1 - 0.85 * s.eyeCross);
        const b: V3 = [pupil[0] + Math.sin(a) * len * 0.5, pupil[1] + Math.sin(a * 1.3) * len * 0.15, pupil[2] - Math.cos(a) * len];
        return <GlowLine key={`o${i}`} a={pupil} b={b} r={0.0035} color={s.eyeCross > 0.3 ? PALETTE.red : PALETTE.moon} opacity={0.9 * s.eyeOut} />;
      })}
      {/* the correct idea: light from a candle flame INTO the eye (warm), pulses travel inward */}
      {rays.map((a, i) => {
        const far: V3 = [pupil[0] + Math.sin(a) * 0.035, tableY + 0.1 + 0.012 * Math.cos(a * 3), pupil[2] - 0.42];
        const k = (t * 0.9 + i * 0.2) % 1;
        const pulse: V3 = [far[0] + (pupil[0] - far[0]) * k, far[1] + (pupil[1] - far[1]) * k, far[2] + (pupil[2] - far[2]) * k];
        return (
          <group key={`i${i}`}>
            <GlowLine a={far} b={pupil} r={0.0028} color={PALETTE.tungsten} opacity={0.8 * s.eyeIn} />
            <Glow p={pulse} size={0.03} color={PALETTE.flame} opacity={s.eyeIn} />
          </group>
        );
      })}
      {s.eyeIn > 0.01 ? (
        <group position={[pupil[0], tableY + 0.09, pupil[2] - 0.42]}>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.014, 0.015, 0.07, 16]} />
            <meshPhysicalMaterial {...POLISH.clay} color="#d8cbb0" />
          </mesh>
          <Glow p={[0, 0.012, 0]} size={0.07 * s.eyeIn} color={PALETTE.flame} opacity={s.eyeIn} />
          <pointLight intensity={0.6 * s.eyeIn} distance={0.6} decay={2} color={PALETTE.flame} />
        </group>
      ) : null}
    </group>
  );
};

const NileModel: React.FC<{ s: FilmState; t: number }> = ({ s, t }) => {
  const grain = useSurfaceGrain(31, 0.5, 3);
  const rocks = useMemo(() => {
    const r = prng(77);
    return Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 0.12, z: (r() - 0.5) * 0.055, s: 0.007 + r() * 0.012, ry: r() * 6 }));
  }, []);
  // river runs along x (north = +x), a gentle S-curve
  const river = useMemo(() => {
    const pts: V3[] = [];
    for (let i = 0; i <= 16; i++) {
      const x = -0.27 + (i / 16) * 0.54;
      pts.push([x, 0.032, Math.sin(i * 0.45) * 0.04]);
    }
    return pts;
  }, []);
  const [cx, cy, cz] = NILE_C;
  return (
    <group position={[cx, cy, cz]}>
      {/* relief block */}
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[0.58, 0.06, 0.4]} radius={0.01} />
        <meshStandardMaterial color="#8a7552" roughness={0.95} bumpMap={grain} bumpScale={1} />
      </mesh>
      {/* raised desert banks */}
      {[-0.14, 0.14].map((z, i) => (
        <mesh key={i} position={[0, 0.034, z]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.56, 0.016, 0.1]} radius={0.007} />
          <meshStandardMaterial color="#a88f66" roughness={0.95} bumpMap={grain} bumpScale={0.8} />
        </mesh>
      ))}
      {/* river water */}
      {river.slice(0, -1).map((p, i) => {
        const q = river[i + 1];
        const dx = q[0] - p[0], dz = q[2] - p[2];
        return (
          <mesh key={i} position={[(p[0] + q[0]) / 2, 0.031, (p[2] + q[2]) / 2]} rotation={[-Math.PI / 2, 0, -Math.atan2(dz, dx)]}>
            <planeGeometry args={[Math.hypot(dx, dz) + 0.004, 0.07]} />
            <meshPhysicalMaterial color="#14232b" roughness={0.3} clearcoat={0.6} />
          </mesh>
        );
      })}
      {/* cataract: granite rocks and foam */}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, 0.034, r.z + Math.sin(((r.x + 0.27) / 0.54) * 16 * 0.45) * 0.04]} rotation={[r.ry, r.ry * 2, 0]} scale={r.s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#2a2522" roughness={0.7} />
        </mesh>
      ))}
      {rocks.slice(0, 8).map((r, i) => (
        <Glow key={`f${i}`} p={[r.x + 0.01, 0.04, r.z + Math.sin(((r.x + 0.27) / 0.54) * 16 * 0.45) * 0.04]} size={0.02 + 0.006 * Math.sin(t * 5 + i)} color="#cfe3ea" opacity={0.35} />
      ))}
      {/* the plan: a bold dashed amber line along the river into the cataract; it breaks at "mustahil" */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 0.22 - i * 0.045;
        const z = Math.sin(((x + 0.27) / 0.54) * 16 * 0.45) * 0.04;
        const fall = s.damBreak * (i % 2 === 0 ? 1 : 0.7);
        return (
          <mesh key={`d${i}`} position={[x, 0.06 + fall * (i % 3) * 0.02, z]} rotation={[fall * 0.8, fall * (i % 2 ? 0.9 : -0.7), fall * 0.6]} layers-mask={FX}>
            <boxGeometry args={[0.03, 0.014, 0.014]} />
            <meshBasicMaterial color={s.damBreak > 0.3 ? PALETTE.red : PALETTE.ember} transparent opacity={s.dam * (1 - 0.5 * s.damBreak)} toneMapped={false} />
          </mesh>
        );
      })}
      {/* a small party of faceless figures on the east bank */}
      {[0, 1, 2].map((i) => (
        <group key={`p${i}`} position={[-0.18 + s.walk * 0.1 + i * 0.03, 0.055, 0.13 + (i % 2) * 0.015]}>
          <mesh position={[0, 0.012, 0]} castShadow>
            <coneGeometry args={[0.007, 0.026, 12]} />
            <meshStandardMaterial color={i === 1 ? "#d7cfbf" : "#3b3127"} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.029, 0]} castShadow>
            <sphereGeometry args={[0.0048, 12, 10]} />
            <meshStandardMaterial color="#e6dccb" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const ModelTable: React.FC<{ s: FilmState; t: number }> = ({ s, t }) => {
  const grain = useSurfaceGrain(12, 0.35, 4);
  const map = mapTexture();
  const route1 = useMemo(() => {
    const a = mapPoint(...CITY.basrah, 0.006), b = mapPoint(...CITY.kairo, 0.006);
    // a gentle arc over the desert
    return Array.from({ length: 13 }, (_, i): V3 => {
      const k = i / 12;
      return [a[0] + (b[0] - a[0]) * k + Math.sin(k * Math.PI) * 0.03, a[1] + Math.sin(k * Math.PI) * 0.012, a[2] + (b[2] - a[2]) * k];
    });
  }, []);
  const route2 = useMemo(() => {
    const i0 = 1, i1 = 6; // Kairo .. Aswan along the Nile
    return NILE_PATH.slice(i0, i1 + 1).map(([lo, la]) => mapPoint(lo, la, 0.006));
  }, []);
  return (
    <group>
      {/* table */}
      <mesh position={[TABLE.x, TABLE.top - 0.03, TABLE.z]} castShadow receiveShadow>
        <RoundedBoxGeo args={[TABLE.w, 0.06, TABLE.d]} radius={0.015} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.6} bumpMap={grain} bumpScale={1.5} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[TABLE.x + sx * (TABLE.w / 2 - 0.05), (TABLE.top - 0.06) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.05)]} castShadow>
          <boxGeometry args={[0.05, TABLE.top - 0.06, 0.05]} />
          <meshStandardMaterial color="#120c08" roughness={0.8} />
        </mesh>
      ))}
      {/* map, north toward +x */}
      <mesh position={MAP_C} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} receiveShadow>
        <planeGeometry args={MAP_SIZE} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
      <Route pts={route1} p={s.route1} color={PALETTE.ember} opacity={s.routeVis} />
      <Route pts={route2} p={s.route2} color={PALETTE.tungsten} opacity={s.routeVis} />
      {/* brass pins on the three cities */}
      {[CITY.basrah, CITY.kairo, CITY.aswan].map((c, i) => {
        const p = mapPoint(c[0], c[1], 0);
        return (
          <mesh key={i} position={[p[0], p[1] + 0.012, p[2]]} castShadow>
            <sphereGeometry args={[0.007, 16, 12]} />
            <meshStandardMaterial color="#b8924a" metalness={0.85} roughness={0.3} />
          </mesh>
        );
      })}
      <NileModel s={s} t={t} />
      <Eye s={s} t={t} />
      {/* hanging oil lamp over the table */}
      <group position={[TABLE.x - 0.05, 1.78, TABLE.z]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 1.8, 6]} />
          <meshStandardMaterial color="#120c08" />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#6b4e26" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <Glow p={[0, -0.02, 0]} size={0.12 * s.lamp} color={PALETTE.flame} opacity={0.9 * s.lamp} />
        <pointLight position={[0, -0.06, 0]} intensity={2.6 * s.lamp} distance={1.7} decay={1.6} color={PALETTE.flame} castShadow={false} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- shelf + seven volumes
export const Shelf: React.FC<{ s: FilmState }> = ({ s }) => {
  const [x, y, z] = SHELF_C;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.26, 0.03, 0.9]} radius={0.008} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.7} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const k = Math.max(0, Math.min(1, s.books - i));
        if (k <= 0) return null;
        const h = 0.25 + ((i * 37) % 5) * 0.008;
        return (
          <group key={i} position={[(1 - k) * -0.25, h / 2, -0.33 + i * 0.105]}>
            <mesh castShadow>
              <RoundedBoxGeo args={[0.2, h, 0.085]} radius={0.008} />
              <meshStandardMaterial color="#2c1a10" roughness={0.6} />
            </mesh>
            {/* spine facing the room (-x) */}
            <mesh position={[-0.1005, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.08, h * 0.96]} />
              <meshStandardMaterial map={spineTexture(i + 1)} roughness={0.5} metalness={0.15} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- front wall: bolted door + barred window
export const FrontWall: React.FC<{ s: FilmState }> = ({ s }) => {
  const grain = useSurfaceGrain(19, 0.4, 3);
  const winSpot = useMemo(() => {
    const l = new THREE.SpotLight(PALETTE.moon, 0, 6, 0.5, 0.6, 1.4);
    l.position.set(WIN_C[0], WIN_C[1] + 0.2, ROOM.front + 0.4);
    l.target.position.set(WIN_C[0] - 0.4, 0, ROOM.front - 1.8);
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.bias = -0.0005;
    return l;
  }, []);
  winSpot.intensity = 180 * s.winLight;
  if (s.frontOpen >= 0.5) return null;
  const W = ROOM.halfW, H = ROOM.height;
  return (
    <group>
      <primitive object={winSpot} />
      <primitive object={winSpot.target} />
      {/* wall facing the room (-z) */}
      <mesh position={[0, H / 2, ROOM.front]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[W * 2, H]} />
        <meshStandardMaterial color={PALETTE.plasterDark} roughness={0.95} bumpMap={grain} bumpScale={1.4} />
      </mesh>
      {/* door: planks, iron straps, a heavy bar that drops into its brackets */}
      <group position={DOOR_C}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-0.36 + i * 0.18, 0, -0.03]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.17, 2.0, 0.05]} radius={0.01} />
            <meshStandardMaterial color="#2f2016" roughness={0.75} bumpMap={grain} bumpScale={2} />
          </mesh>
        ))}
        {[-0.6, 0.6].map((y, i) => (
          <mesh key={`st${i}`} position={[0, y, -0.06]}>
            <boxGeometry args={[0.92, 0.04, 0.01]} />
            <meshStandardMaterial color="#1a1714" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
        {[-0.52, 0.52].map((x, i) => (
          <mesh key={`br${i}`} position={[x, 0.05, -0.1]} castShadow>
            <boxGeometry args={[0.06, 0.12, 0.08]} />
            <meshStandardMaterial color="#1a1714" metalness={0.7} roughness={0.45} />
          </mesh>
        ))}
        <mesh position={[0, 0.05 + (1 - s.bar) * 0.5, -0.13]} rotation={[0, 0, (1 - s.bar) * 0.5]} castShadow>
          <RoundedBoxGeo args={[1.25, 0.09, 0.07]} radius={0.012} />
          <meshStandardMaterial color="#3a2818" roughness={0.6} />
        </mesh>
      </group>
      {/* small oil lamp in a wall niche beside the door: keeps the door beat lit */}
      <group position={[0.35, 1.55, ROOM.front - 0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.05, 20]} />
          <meshStandardMaterial color="#6b4e26" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.04, 0.05]}>
          <boxGeometry args={[0.22, 0.03, 0.14]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.7} />
        </mesh>
        <Glow p={[0, 0.06, 0]} size={0.14} color={PALETTE.flame} opacity={0.95 * s.winLight} />
        <pointLight position={[0, 0.12, -0.25]} intensity={5 * s.winLight} distance={3.2} decay={1.5} color={PALETTE.flame} />
      </group>
      {/* barred window: night sky behind iron bars */}
      <group position={WIN_C}>
        <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.62, 0.5]} />
          <meshBasicMaterial color="#20324a" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.72, 0.6]} />
          <meshStandardMaterial color="#120c08" transparent opacity={0} />
        </mesh>
        {[-0.24, -0.12, 0, 0.12, 0.24].map((x, i) => (
          <mesh key={i} position={[x, 0, -0.04]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.52, 10]} />
            <meshStandardMaterial color="#141210" metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
        {[[0, 0.28, 0.74, 0.06], [0, -0.28, 0.74, 0.06], [-0.34, 0, 0.06, 0.62], [0.34, 0, 0.06, 0.62]].map(([fx, fy, w, h], i) => (
          <mesh key={`fr${i}`} position={[fx, fy, -0.04]} castShadow>
            <boxGeometry args={[w, h, 0.07]} />
            <meshStandardMaterial color="#1b130c" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- outside: candles, beams in, the hand
export const Outside: React.FC<{ s: FilmState; t: number }> = ({ s, t }) => {
  const grain = useSurfaceGrain(29, 0.45, 5);
  const vis = Math.max(s.cut, s.inBeams);
  if (vis <= 0.001) return null;
  return (
    <group>
      {/* stone terrace outside the left wall (the box table replaces it in the payoff) */}
      <mesh visible={s.shell < 0.5} rotation={[-Math.PI / 2, 0, 0]} position={[-3.3, 0.001, -1.1]} receiveShadow>
        <planeGeometry args={[2.8, 3.4]} />
        <meshLambertMaterial color="#2c2824" bumpMap={grain} />
      </mesh>
      {CANDLES.map((c, i) => {
        const fl = 0.92 + 0.08 * Math.sin(t * 9.1 + i * 2.3) * Math.sin(t * 3.7 + i);
        const flame = s.flame[i]; // the flame stays lit while covered: only its light is blocked
        const stand = c[1] - 0.12;
        return (
          <group key={i}>
            {/* brass candlestick */}
            <mesh position={[c[0], stand / 2, c[2]]} castShadow>
              <cylinderGeometry args={[0.012, 0.02, stand, 14]} />
              <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
            </mesh>
            <mesh position={[c[0], 0.012, c[2]]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.024, 24]} />
              <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
            </mesh>
            <mesh position={[c[0], stand + 0.005, c[2]]}>
              <cylinderGeometry args={[0.045, 0.03, 0.02, 20]} />
              <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
            </mesh>
            {/* candle */}
            <mesh position={[c[0], stand + 0.06, c[2]]} castShadow>
              <cylinderGeometry args={[0.022, 0.024, 0.1, 18]} />
              <meshPhysicalMaterial {...POLISH.clay} color="#e3d6bb" />
            </mesh>
            {/* flame (stays lit while covered: only its light is blocked) */}
            <Glow p={[c[0], c[1], c[2]]} size={0.11 * fl} color={PALETTE.flame} opacity={flame} />
            <Glow p={[c[0], c[1] - 0.005, c[2]]} size={0.045 * fl} color="#fff6e0" opacity={flame} />
            <pointLight position={c} intensity={1.6 * flame * fl} distance={2.7} decay={1.6} color={PALETTE.flame} />
            {/* light from the candle converging into the pinhole */}
            <GlowLine a={c} b={HOLE} r={0.006} color={PALETTE.flame} opacity={0.35 * s.inBeams * s.light[i]} />
            {/* "segaris lurus": candle, hole and spot on one straight line */}
            <GlowLine a={c} b={SPOTS[i]} r={0.0022} color="#ffffff" opacity={0.8 * s.straight * s.light[i]} />
          </group>
        );
      })}
      {/* a wooden screen slides in front of the middle candle */}
      <Screen k={s.hand} />
      {/* warm spill from the candles on the outside of the shutter */}
      <pointLight position={[-2.7, 2.15, -1.55]} intensity={2.2 * vis * (s.flame[0] + s.flame[1] + s.flame[2]) / 3} distance={1.6} decay={1.6} color={PALETTE.flame} />
      {/* outside face of the shutter + pinhole glow seen from outside */}
      <mesh position={[HOLE[0] - 0.09, HOLE[1], HOLE[2]]} rotation={[0, -Math.PI / 2, 0]} layers-mask={FX}>
        <planeGeometry args={[0.16, 0.16]} />
        <meshBasicMaterial map={softDot()} color={PALETTE.tungsten} transparent opacity={0.8 * vis} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** A small wooden screen on a foot that slides along a rail in front of the middle candle. */
const Screen: React.FC<{ k: number }> = ({ k }) => {
  const c = CANDLES[1];
  const d = [HOLE[0] - c[0], 0, HOLE[2] - c[2]];
  const L = Math.hypot(d[0], d[2]);
  const u = [d[0] / L, 0, d[2] / L];
  const side = [-u[2], 0, u[0]]; // horizontal, across the beam
  const off = (1 - k) * 0.55;
  const base: V3 = [c[0] + u[0] * 0.2 + side[0] * off, 0, c[2] + u[2] * 0.2 + side[2] * off];
  const yaw = Math.atan2(u[0], u[2]);
  const h = c[1] + 0.1;
  const railC: V3 = [c[0] + u[0] * 0.2 + side[0] * 0.28, 0.02, c[2] + u[2] * 0.2 + side[2] * 0.28];
  return (
    <group>
      {/* floor rail */}
      <mesh position={railC} rotation={[0, yaw + Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[0.04, 0.03, 0.75]} />
        <meshStandardMaterial color="#1a1410" roughness={0.6} metalness={0.4} />
      </mesh>
      <group position={base} rotation={[0, yaw, 0]}>
        {/* post */}
        <mesh position={[0, (h - 0.18) / 2, 0]} castShadow>
          <boxGeometry args={[0.035, h - 0.18, 0.035]} />
          <meshStandardMaterial color="#3a2818" roughness={0.6} />
        </mesh>
        {/* the board: wide enough to hide the flame from the hole */}
        <mesh position={[0, h - 0.08, 0]} castShadow>
          <RoundedBoxGeo args={[0.3, 0.34, 0.025]} radius={0.012} />
          <meshStandardMaterial color="#8a6440" roughness={0.55} />
        </mesh>
        {/* brass edge */}
        <mesh position={[0, h + 0.095, 0]}>
          <boxGeometry args={[0.31, 0.015, 0.03]} />
          <meshStandardMaterial color="#b8924a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- payoff: the room seen as a box
/**
 * Exterior shell of the room (outward faces only, invisible from inside), wood planks with brass corner
 * trim; the front stays open (cutaway side). It stands on a big lit table that fades as the room shrinks.
 */
export const Shell: React.FC<{ s: FilmState }> = ({ s }) => {
  const wood = woodTexture(5, "#7a5634", 7);
  const top = woodTexture(9, "#4a3220", 10);
  if (s.shell <= 0.001) return null;
  const W = ROOM.halfW + 0.08, B = ROOM.back - 0.08, F = ROOM.front, H = ROOM.height + 0.12;
  const D = F - B;
  const mat = <meshStandardMaterial color="#ffffff" map={wood} roughness={0.62} />;
  const brass = <meshStandardMaterial color="#c9a258" metalness={0.75} roughness={0.3} />;
  const tableA = Math.max(0, 1 - s.shrink * 5);
  const zc = B + D / 2;
  const edges: [V3, V3][] = [
    // vertical corner posts
    [[-W, H / 2, B], [0.14, H + 0.1, 0.14]], [[W, H / 2, B], [0.14, H + 0.1, 0.14]], [[-W, H / 2, F + 0.05], [0.16, H + 0.16, 0.16]], [[W, H / 2, F + 0.05], [0.16, H + 0.16, 0.16]],
    // top and bottom rails along the depth
    [[-W, H, zc], [0.14, 0.14, D]], [[W, H, zc], [0.14, 0.14, D]], [[-W, 0, zc], [0.14, 0.14, D]], [[W, 0, zc], [0.14, 0.14, D]],
    // front frame (open side) and back rails
    [[0, H, F + 0.05], [2 * W + 0.16, 0.16, 0.16]], [[0, 0, F + 0.05], [2 * W + 0.16, 0.16, 0.16]], [[0, H, B], [2 * W, 0.14, 0.14]], [[0, 0, B], [2 * W, 0.14, 0.14]],
  ];
  return (
    <group>
      <mesh position={[0, H / 2, B]} rotation={[0, Math.PI, 0]} castShadow>
        <planeGeometry args={[W * 2, H]} />
        {mat}
      </mesh>
      <mesh position={[-W, H / 2, zc]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[D, H]} />
        {mat}
      </mesh>
      <mesh position={[W, H / 2, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        {mat}
      </mesh>
      <mesh position={[0, H, zc]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W * 2, D]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.02, zc]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 2, D]} />
        {mat}
      </mesh>
      {edges.map(([p, sz], i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={sz} />
          {brass}
        </mesh>
      ))}
      {/* brass plaque with the brand on the left side, near the open front */}
      <group position={[-W - 0.03, 2.25, F - 1.7]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <RoundedBoxGeo args={[2.3, 0.66, 0.05]} radius={0.06} />
          <meshStandardMaterial color="#c9a258" metalness={0.35} roughness={0.38} emissive="#3a2a10" />
        </mesh>
        <SceneText font="serif" fontSize={0.46} letterSpacing={0.18} color="#2a1a0c" anchorX="center" anchorY="middle" position={[0, -0.01, 0.035]}>
          AUDIRA
        </SceneText>
      </group>
      {/* the study table the box stands on */}
      {tableA > 0.001 ? (
        <group>
          <mesh position={[-1.2, -0.17, 1.2]} receiveShadow>
            <boxGeometry args={[11, 0.26, 15]} />
            <meshStandardMaterial color="#ffffff" map={top} roughness={0.55} transparent opacity={tableA} />
          </mesh>
          {/* a warm study lamp pool on the table */}
          <pointLight position={[-4.5, 4.5, 4.5]} intensity={60 * tableA} distance={16} decay={1.4} color="#f0c88a" />
        </group>
      ) : null}
    </group>
  );
};

/** A phone seen from the back, its main camera lens at LENS (the shrunken room sits inside it). */
export const Phone: React.FC<{ s: FilmState; lens: V3 }> = ({ s, lens }) => {
  if (s.phone <= 0.001) return null;
  const Hh = 8.0, Ww = 3.8, T = 0.42;
  // phone body centred so the lens lands top-left of its back
  const c: V3 = [lens[0] + 1.0, lens[1] - 2.7 - (1 - s.phone) * 11, lens[2] - 0.62];
  const lensY = lens[1] - (1 - s.phone) * 11;
  return (
    <group>
      <mesh position={c} castShadow receiveShadow>
        <RoundedBoxGeo args={[Ww, Hh, T]} radius={0.45} segments={6} />
        <meshPhysicalMaterial color="#15171b" roughness={0.35} metalness={0.4} clearcoat={0.8} clearcoatRoughness={0.25} />
      </mesh>
      {/* camera bump */}
      <mesh position={[lens[0] + 0.35, lensY - 0.35, lens[2] - 0.38]} castShadow>
        <RoundedBoxGeo args={[1.85, 1.85, 0.12]} radius={0.38} segments={6} />
        <meshPhysicalMaterial color="#202329" roughness={0.25} metalness={0.5} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* main lens ring around the little room */}
      <mesh position={[lens[0], lensY, lens[2] - 0.3]}>
        <torusGeometry args={[0.5, 0.07, 20, 64]} />
        <meshStandardMaterial color="#7d8186" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[lens[0], lensY, lens[2] - 0.33]}>
        <circleGeometry args={[0.5, 48]} />
        <meshStandardMaterial color="#020203" roughness={0.2} />
      </mesh>
      {/* second lens + flash */}
      <mesh position={[lens[0] + 0.75, lensY - 0.75, lens[2] - 0.31]}>
        <torusGeometry args={[0.3, 0.05, 16, 48]} />
        <meshStandardMaterial color="#7d8186" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[lens[0] + 0.75, lensY - 0.75, lens[2] - 0.315]}>
        <circleGeometry args={[0.3, 40]} />
        <meshPhysicalMaterial color="#0a0c12" roughness={0.05} clearcoat={1} />
      </mesh>
      <mesh position={[lens[0] + 0.75, lensY, lens[2] - 0.315]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial color="#d8cfa8" emissive="#3a3220" roughness={0.4} />
      </mesh>
    </group>
  );
};

/** Dark-beat practicals: an oil lamp in a niche on the left wall (snuffed on "gelap") and a soft warm
 * light on the brass pinhole plate, so the turn from the door to the pinhole always has a lit subject. */
export const DarkBeatLights: React.FC<{ s: FilmState; t: number }> = ({ s, t }) => {
  if (s.wallLamp <= 0.001 && s.shutterGlow <= 0.001) return null;
  const fl = 0.93 + 0.07 * Math.sin(t * 8.3) * Math.sin(t * 3.1);
  const L = s.wallLamp * fl;
  return (
    <group>
      {[3.6, 0.9].map((z, k) => (
        <group key={k} position={[-ROOM.halfW + 0.14, 1.75, z]}>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.2, 0.03, 0.3]} />
            <meshStandardMaterial color={PALETTE.wood} roughness={0.7} />
          </mesh>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.065, 0.06, 20]} />
            <meshStandardMaterial color="#6b4e26" metalness={0.8} roughness={0.35} />
          </mesh>
          <Glow p={[0, 0.07, 0]} size={0.16 * Math.max(0.3, L)} color={PALETTE.flame} opacity={Math.min(1, 1.1 * L)} />
          <Glow p={[0, 0.06, 0]} size={0.05} color="#fff6e0" opacity={Math.min(1, L)} />
          <pointLight position={[0.3, 0.15, 0]} intensity={10 * L} distance={3.2} decay={1.4} color={PALETTE.flame} />
        </group>
      ))}
      <pointLight position={[HOLE[0] + 0.55, HOLE[1] + 0.15, HOLE[2] + 0.45]} intensity={2.2 * s.shutterGlow} distance={1.8} decay={1.5} color={PALETTE.flame} />
    </group>
  );
};
