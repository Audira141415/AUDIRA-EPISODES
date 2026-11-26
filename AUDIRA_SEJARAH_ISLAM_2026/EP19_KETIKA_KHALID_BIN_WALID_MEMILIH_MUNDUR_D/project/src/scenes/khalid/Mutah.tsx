// Mu'tah station (s1 hook, s2 setting), the s2 caravan, the s5 withdrawal column and the s8 arc.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { Banner } from "./Banner.tsx";
import { CUE } from "./cues.ts";
import { MUTAH, SYRIA } from "./geo.ts";
import { RigModel } from "./Models.tsx";
import { easeInCubic, easeOutBack, lin, mix, ss } from "./timing.ts";
import { SHEET_Y, hAt, routeAt, routeTangent } from "./World.tsx";

const gy = (x: number, z: number) => SHEET_Y + hAt(x, z);
const GREEN = "#2F6B4F";
const RED = "#8B1E1E";

// ---- s1/s2/s8: four banners at Mu'tah ------------------------------------------------------
const FALLS = [CUE.gugur0, CUE.berturut, 1.8];
export const MutahBanners: React.FC<{ t: number }> = ({ t }) => {
  const rewind = ss(7.0, 8.0, t);
  const late = t > 77; // s8: the three commanders lie where they fell
  return (
    <group>
      {[-0.45, -0.15, 0.15, 0.45].map((dx, i) => {
        const x = MUTAH[0] + dx, z = MUTAH[1] + 0.1;
        const isKhalid = i === 3;
        let fall = 0, glow = 0, yaw = 0.2;
        if (!isKhalid) {
          fall = easeInCubic(lin(FALLS[i], FALLS[i] + 0.45, t)) * (late ? 1 : 1 - rewind);
          if (late) fall = 1;
        } else {
          glow = ss(CUE.panji0, CUE.panji0 + 0.4, t) * (1 - ss(4.0, 4.6, t));
          yaw = mix(0.2, -Math.PI / 2, ss(CUE.mundur0, 6.8, t) * (1 - rewind));
        }
        return (
          <Banner key={i} t={t} color={GREEN} h={1.0} w={0.46} ch={0.3} position={[x, gy(x, z), z]} yaw={yaw}
            fall={fall} fallYaw={0.4 + i * 0.7} glow={glow} seed={i * 2 + 1} />
        );
      })}
    </group>
  );
};

// ---- opposing camp (no numbers, neutral) -----------------------------------------------------
export const Enemy: React.FC<{ t: number; dust: number }> = ({ t, dust }) => {
  const k = Math.max(0.001, easeOutBack(lin(CUE.lawan, CUE.lawan + 0.6, t)));
  const fade = 1 - ss(52, 53.4, t);
  const s = k * Math.max(0.001, fade);
  return (
    <group>
      {[-0.4, 0, 0.4].map((dx, i) => {
        const x = MUTAH[0] + dx, z = MUTAH[1] - 0.9;
        return <Banner key={i} t={t} color={RED} h={0.9} w={0.42} ch={0.28} position={[x, gy(x, z), z]} yaw={Math.PI + 0.2} seed={i + 20} scale={s} />;
      })}
      {[-0.75, 0.75].map((dx, i) => {
        const x = MUTAH[0] + dx, z = MUTAH[1] - 1.15;
        return <AssetModel key={i} id="soldiers-tent-4bd5b9" assetType="building" size={0.45} ground tint="#C9B48A" position={[x, gy(x, z), z]} rotation={[0, i * 0.8, 0]} scale={s} />;
      })}
      {dust > 0.01 ? <Dust k={dust} t={t} /> : null}
    </group>
  );
};

const Dust: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const puffs = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ dx: ((i * 37) % 13) / 13 - 0.5, dz: ((i * 19) % 7) / 7, r: 0.16 + ((i * 7) % 5) * 0.04, ph: i })), []);
  return (
    <group>
      {puffs.map((p, i) => {
        const x = MUTAH[0] + p.dx * 1.8, z = MUTAH[1] - 0.95 + p.dz * 0.7;
        const y = gy(x, z) + 0.15 + Math.sin(t * 0.8 + p.ph) * 0.04 + p.r * 0.4;
        return (
          <mesh key={i} position={[x + Math.sin(t * 0.5 + p.ph) * 0.08, y, z]} scale={p.r * (0.7 + 0.3 * k)}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#d9c29a" transparent opacity={0.55 * k} roughness={1} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---- walkers along the route --------------------------------------------------------------
const Walker: React.FC<{ file: string; size: number; u: number; t: number; back?: boolean; side?: number; tint?: string; moving: boolean }> = ({ file, size, u, t, back, side = 0, tint, moving }) => {
  const p = routeAt(u);
  const tg = routeTangent(u);
  const dx = back ? -tg.x : tg.x, dz = back ? -tg.z : tg.z;
  const yaw = Math.atan2(dx, dz);
  const x = p.x + -dz * side, z = p.z + dx * side;
  return <RigModel file={file} size={size} clip={moving ? "Walk" : "Idle"} time={t} tint={tint} position={[x, gy(x, z), z]} yaw={yaw} />;
};

/** s2: horse and camel travel Madinah -> Mu'tah as the route grows. */
export const Caravan: React.FC<{ t: number }> = ({ t }) => {
  const u = lin(8, 16, t) * 0.97;
  const moving = t < 16;
  return (
    <group>
      <Walker file="animal/horse-base" size={0.6} u={u} t={t} moving={moving} />
      <Walker file="animal/camel-base" size={0.7} u={Math.max(0, u - 0.05)} t={t + 0.3} moving={moving} side={0.05} />
    </group>
  );
};

// s5 column head position along the route (u 1 = Mu'tah, 0 = Madinah)
const COL: [number, number][] = [[41, 1], [43, 1], [48, 0.66], [52.2, 0.45], [54, 0.15], [61, 0.077]];
export const columnU = (t: number) => {
  if (t <= COL[0][0]) return COL[0][1];
  for (let i = 0; i < COL.length - 1; i++) {
    const [ta, ua] = COL[i], [tb, ub] = COL[i + 1];
    if (t <= tb) return mix(ua, ub, (t - ta) / (tb - ta));
  }
  return COL[COL.length - 1][1];
};

/** s5-s6: the withdrawal column: 4 banners, 2 horses, 1 camel heading south. */
export const Column: React.FC<{ t: number }> = ({ t }) => {
  const u0 = columnU(t);
  const moving = t > 43 && t < 61;
  const lower = ss(53.6, 55.5, t);
  const items: { kind: "b" | "h" | "c"; du: number; side: number }[] = [
    { kind: "h", du: 0, side: 0 },
    { kind: "b", du: 0.018, side: -0.1 },
    { kind: "b", du: 0.018, side: 0.1 },
    { kind: "c", du: 0.036, side: 0 },
    { kind: "b", du: 0.054, side: -0.1 },
    { kind: "b", du: 0.054, side: 0.1 },
    { kind: "h", du: 0.075, side: 0 },
  ];
  return (
    <group>
      {items.map((it, i) => {
        const u = Math.min(1, u0 + it.du);
        if (it.kind === "h") return <Walker key={i} file="animal/horse-base" size={0.55} u={u} t={t + i * 0.21} back side={it.side} moving={moving} />;
        if (it.kind === "c") return <Walker key={i} file="animal/camel-base" size={0.65} u={u} t={t + 0.5} back side={it.side} moving={moving} />;
        const p = routeAt(u), tg = routeTangent(u);
        const x = p.x + tg.z * it.side, z = p.z - tg.x * it.side;
        // cloth trails behind the march: local +x along the route tangent (toward Mu'tah)
        const trail = Math.atan2(-tg.z, tg.x);
        return (
          <Banner key={i} t={t} color={GREEN} h={1.0} w={0.42} ch={0.28} position={[x, gy(x, z), z]} yaw={trail}
            lower={lower} seed={i + 30} wind={moving ? 1.2 : 0.8} />
        );
      })}
    </group>
  );
};

/** s5: gold arrow on Mu'tah turns from north to south. */
export const TurnArrow: React.FC<{ t: number }> = ({ t }) => {
  const show = ss(41.6, 42.2, t) * (1 - ss(46.4, 47.2, t));
  if (show < 0.01) return null;
  const turn = ss(CUE.menarik, 43.5, t);
  const yaw = mix(0, Math.PI, turn); // 0 -> points -z (north), PI -> south
  const x = MUTAH[0] + 0.15, z = MUTAH[1] + 0.35;
  return (
    <group position={[x, gy(x, z) + 0.06, z]} rotation={[0, yaw, 0]} scale={show}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.6, 14]} />
        <meshStandardMaterial color="#E8B84A" emissive="#E8B84A" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.35]} castShadow>
        <coneGeometry args={[0.13, 0.26, 18]} />
        <meshStandardMaterial color="#E8B84A" emissive="#E8B84A" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---- s8 -------------------------------------------------------------------------------------
const Pulse: React.FC<{ at: [number, number]; t: number; t0: number }> = ({ at, t, t0 }) => {
  if (t < t0) return null;
  const k = easeOutBack(lin(t0, t0 + 0.5, t));
  const ring = ((t - t0) % 1.4) / 1.4;
  const y = gy(at[0], at[1]) + 0.04;
  return (
    <group position={[at[0], y, at[1]]}>
      <mesh scale={k}>
        <sphereGeometry args={[0.25, 20, 14]} />
        <meshStandardMaterial color="#FFD27A" emissive="#FFC24A" emissiveIntensity={1.6} />
      </mesh>
      {/* s7: light beacon so the point reads above the caption band in the north-view finale */}
      <mesh position={[0, 1.1 * k, 0]} scale={[1, Math.max(0.001, k), 1]}>
        <cylinderGeometry args={[0.14, 0.2, 2.2, 16, 1, true]} />
        <meshBasicMaterial color="#FFE09A" transparent opacity={0.85} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={0.35 + ring * 1.3}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial color="#FFD27A" transparent opacity={(1 - ring) * 0.8 * k} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const Finale: React.FC<{ t: number }> = ({ t }) => {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(MUTAH[0], gy(MUTAH[0], MUTAH[1]) + 0.05, MUTAH[1]);
    const b = new THREE.Vector3(SYRIA[0], gy(SYRIA[0], SYRIA[1]) + 0.05, SYRIA[1]);
    const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0.3, 2.6, 0));
    return new THREE.QuadraticBezierCurve3(a, m, b);
  }, []);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.09, 8, false), [curve]);
  const grow = ss(CUE.medan, 81, t);
  geom.setDrawRange(0, Math.floor(grow * 200) * 48);
  return (
    <group>
      <Pulse at={MUTAH} t={t} t0={CUE.medan} />
      <Pulse at={SYRIA} t={t} t0={CUE.jabatan} />
      {grow > 0.001 ? (
        <mesh geometry={geom}>
          <meshStandardMaterial color="#E8B84A" emissive="#FFC24A" emissiveIntensity={2.2} metalness={0.3} roughness={0.35} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
