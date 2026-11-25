// AE-065 film-only props, drawn in the same engraving language as the cover world:
// toy cars, traffic light, quay detail on both banks (fixes the bare embankment of the cover),
// the balance seesaw diagram (REVEAL) and a vertical-lift bridge (PAYOFF, Ampera as it was pre-1970).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Edges, IBox, type Mats } from "./BridgeWorld.tsx";
import { WATER_Y } from "./BridgeWorld.tsx";
import { stoneTex } from "./textures.ts";
import { POLISH } from "../../core/polish/Polish.tsx";

type V3 = [number, number, number];

// ---- cars ----
const CAR_COLORS = ["red", "roof", "wood", "girder"] as const;
export const ToyCar: React.FC<{ m: Mats; pos: V3; tint: number; dir?: 1 | -1 }> = ({ m, pos, tint, dir = 1 }) => {
  const body = m[CAR_COLORS[tint % CAR_COLORS.length]];
  const wheel = useMemo(() => new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16).rotateX(Math.PI / 2), []);
  return (
    <group position={pos} rotation={[0, dir === 1 ? 0 : Math.PI, 0]}>
      <IBox size={[1.0, 0.28, 0.5]} pos={[0, 0.27, 0]} mat={body} r={0.07} />
      <IBox size={[0.55, 0.22, 0.44]} pos={[-0.08, 0.5, 0]} mat={m.deck} r={0.06} />
      {[[-0.32, -0.25], [0.32, -0.25], [-0.32, 0.25], [0.32, 0.25]].map(([x, z], i) => (
        <group key={i} position={[x, 0.13, z]}>
          <mesh geometry={wheel} material={m.iron} />
          <Edges geo={wheel} />
        </group>
      ))}
      <mesh position={[0.51, 0.3, 0.15]} material={m.lamp}>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
    </group>
  );
};

// ---- traffic light facing the approaching cars (−x) ----
export const TrafficLight: React.FC<{ m: Mats; pos: V3; red: boolean }> = ({ m, pos, red }) => {
  const off = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5b4a3a", roughness: 0.6 }), []);
  const green = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8e0a0", emissive: "#4fbf6a", emissiveIntensity: 2 }), []);
  const redOn = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffb39a", emissive: "#ff3a1a", emissiveIntensity: 3 }), []);
  return (
    <group position={pos}>
      <IBox size={[0.12, 1.6, 0.12]} pos={[0, 0.8, 0]} mat={m.iron} />
      <IBox size={[0.22, 0.62, 0.26]} pos={[0, 1.85, 0]} mat={m.iron} r={0.05} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.12, 2.05 - i * 0.2, 0]} material={i === 0 ? (red ? redOn : off) : i === 2 ? (red ? off : green) : off}>
          <sphereGeometry args={[0.07, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
};

// ---- quay detail on both banks (warehouses, railing, lamps, faced bank ends) ----
export const Quays: React.FC<{ m: Mats }> = ({ m }) => {
  const faceMat = useMemo(() => {
    const map = stoneTex(23).clone();
    map.repeat.set(5, 1.2);
    map.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff", map });
  }, []);
  const roof = useMemo(() => new THREE.ConeGeometry(1.0, 0.8, 4, 1).rotateY(Math.PI / 4), []);
  const houses = useMemo(() => {
    const out: { x: number; z: number; w: number; h: number; d: number }[] = [];
    let k = 7;
    for (const side of [-1, 1]) {
      for (let z = -7; z > -36; z -= 3.4) {
        k = (k * 9301 + 49297) % 233280;
        const r = k / 233280;
        out.push({ x: side * (9.2 + r * 1.5), z: z - r, w: 2.2 + r, h: 1.6 + r * 2.0, d: 2.6 });
      }
    }
    return out;
  }, []);
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* faced end of the embankment (was a bare stretched block in the cover) */}
          <IBox size={[16, 4.2, 0.12]} pos={[side * 14.6, -2.1, 4.06]} mat={faceMat} />
          {/* quay railing + lamp posts along the river edge */}
          <IBox size={[0.06, 0.06, 38]} pos={[side * 6.75, 0.55, -21]} mat={m.iron} ink />
          {Array.from({ length: 10 }, (_, i) => (
            <group key={i} position={[side * 6.75, 0, -2.6 - i * 3.8]}>
              <IBox size={[0.06, 0.55, 0.06]} pos={[0, 0.27, 0]} mat={m.iron} ink={false} />
              {i % 3 === 1 && (
                <group>
                  <IBox size={[0.1, 2.2, 0.1]} pos={[0, 1.1, 0]} mat={m.iron} />
                  <mesh position={[0, 2.25, 0]} material={m.lamp}>
                    <sphereGeometry args={[0.11, 12, 10]} />
                  </mesh>
                </group>
              )}
            </group>
          ))}
        </group>
      ))}
      {houses.map((h, i) => (
        <group key={i} position={[h.x, 0, h.z]}>
          <IBox size={[h.w, h.h, h.d]} pos={[0, h.h / 2, 0]} mat={i % 3 ? m.far : m.deck} />
          <group position={[0, h.h + 0.4, 0]} scale={[h.w / 1.4, 1, h.d / 1.4]}>
            <mesh geometry={roof} material={i % 2 ? m.roof : m.red} castShadow />
            <Edges geo={roof} />
          </group>
        </group>
      ))}
    </group>
  );
};

// ---- balance diagram: leaf + counterweight as one seesaw on the trunnion ----
export const SEESAW_POS: V3 = [-1.2, 10, 0];
export const SEESAW_SCALE = 1.35;
export const Seesaw: React.FC<{ m: Mats; tilt: number; pop: number }> = ({ m, tilt, pop }) => {
  const prism = useMemo(() => new THREE.CylinderGeometry(0.0, 0.75, 1.3, 3, 1).rotateY(Math.PI / 6), []);
  const pin = useMemo(() => new THREE.CylinderGeometry(0.16, 0.16, 1.0, 20).rotateX(Math.PI / 2), []);
  return (
    <group position={SEESAW_POS} scale={pop * SEESAW_SCALE}>
      {/* fulcrum */}
      <group position={[0, -0.75, 0]}>
        <mesh geometry={prism} material={m.stonePier} castShadow />
        <Edges geo={prism} />
      </group>
      <IBox size={[2.4, 0.12, 1.2]} pos={[0, -1.46, 0]} mat={m.stonePier} />
      <mesh geometry={pin} material={m.brass} />
      <Edges geo={pin} />
      <group rotation={[0, 0, tilt]}>
        {/* long arm = bridge leaf, short arm = tail + counterweight */}
        <IBox size={[3.6, 0.22, 0.8]} pos={[1.8, 0.12, 0]} mat={m.deck} />
        <IBox size={[3.6, 0.1, 0.06]} pos={[1.8, 0.28, 0.4]} mat={m.girder} ink={false} />
        <IBox size={[1.7, 0.26, 0.6]} pos={[-0.85, 0.1, 0]} mat={m.girder} />
        <IBox size={[0.8, 0.95, 0.9]} pos={[-1.35, -0.45, 0]} mat={m.counter} r={0.06} />
      </group>
    </group>
  );
};

// ---- vertical-lift bridge (towers with sheaves, cables, counterweights) ----
export const LIFT_Z = -26;
export const LIFT_TOWER_X = 3.8;
export const LIFT_TOP = 8.5;
export const LiftBridge: React.FC<{ m: Mats; lift: number }> = ({ m, lift }) => {
  const old = m.far; // weathered grey-ochre paint, pre-1970 look
  const sheave = useMemo(() => new THREE.TorusGeometry(0.45, 0.07, 10, 28), []);
  const deckY = lift * 5.0;
  const cwY = LIFT_TOP - 1.5 - lift * 5.0; // counterweight goes down as the deck rises
  return (
    <group position={[0, 0, LIFT_Z]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * LIFT_TOWER_X, 0, 0]}>
          {/* pier */}
          <IBox size={[2.0, 4.0, 2.6]} pos={[0, WATER_Y / 2 - 0.25, 0]} mat={m.stonePier} />
          {/* four legs + braces */}
          {[[-0.6, -0.9], [0.6, -0.9], [-0.6, 0.9], [0.6, 0.9]].map(([x, z], i) => (
            <IBox key={i} size={[0.16, LIFT_TOP, 0.16]} pos={[x, LIFT_TOP / 2, z]} mat={old} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <group key={i}>
              <IBox size={[1.36, 0.08, 0.08]} pos={[0, 1.2 + i * 1.6, 0.9]} mat={old} ink={false} />
              <IBox size={[1.9, 0.06, 0.06]} pos={[0, 2.0 + i * 1.6, 0.9]} rot={[0, 0, (i % 2 ? 1 : -1) * 1.0]} mat={old} ink={false} />
              <IBox size={[0.08, 0.08, 1.96]} pos={[s * 0.6, 1.2 + i * 1.6, 0]} mat={old} ink={false} />
            </group>
          ))}
          <IBox size={[1.6, 0.3, 2.1]} pos={[0, LIFT_TOP, 0]} mat={old} />
          {/* sheave on top, counterweight inside */}
          <group position={[-s * 0.2, LIFT_TOP + 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh geometry={sheave} material={m.brass} />
            <Edges geo={sheave} />
          </group>
          <IBox size={[0.9, 1.2, 1.2]} pos={[s * 0.1, cwY, 0]} mat={m.counter} r={0.05} />
          {/* cables: deck end ↔ sheave ↔ counterweight */}
          <IBox size={[0.03, LIFT_TOP + 0.55 - deckY - 0.3, 0.03]} pos={[-s * 0.65, (LIFT_TOP + 0.55 + deckY + 0.3) / 2, 0]} mat={m.iron} ink={false} cast={false} />
          <IBox size={[0.03, LIFT_TOP + 0.55 - cwY - 0.6, 0.03]} pos={[s * 0.25, (LIFT_TOP + 0.55 + cwY + 0.6) / 2, 0]} mat={m.iron} ink={false} cast={false} />
        </group>
      ))}
      {/* fixed approach decks to both banks */}
      {[-1, 1].map((s) => (
        <IBox key={`a${s}`} size={[3.3, 0.3, 2.2]} pos={[s * (LIFT_TOWER_X + 1.0 + 1.65), -0.15, 0]} mat={m.deck} />
      ))}
      {/* lifting span: through-truss that stays level */}
      <group position={[0, deckY, 0]}>
        <IBox size={[2 * LIFT_TOWER_X - 1.3, 0.25, 2.2]} pos={[0, -0.12, 0]} mat={m.deck} />
        {[-1, 1].map((z) => (
          <group key={z} position={[0, 0, z * 1.05]}>
            <IBox size={[2 * LIFT_TOWER_X - 1.3, 0.12, 0.12]} pos={[0, 0.9, 0]} mat={old} />
            <IBox size={[2 * LIFT_TOWER_X - 1.3, 0.12, 0.12]} pos={[0, 0.05, 0]} mat={old} />
            {Array.from({ length: 7 }, (_, i) => (
              <IBox key={i} size={[0.08, 1.15, 0.08]} pos={[-2.8 + i * 0.93, 0.47, 0]} rot={[0, 0, (i % 2 ? 1 : -1) * 0.65]} mat={old} ink={false} />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
