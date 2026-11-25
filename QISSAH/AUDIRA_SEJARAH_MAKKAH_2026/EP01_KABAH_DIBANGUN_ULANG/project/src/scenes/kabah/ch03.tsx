// Chapter 2 (c03): the Quraysh rebuilding — a shore diorama on the Red Sea. The old low building is
// darkened by soot and a water stain, taken down course by course into stones laid out on plan
// (one night passes), the Byzantine wreck gives its planks to the new roof, the walls rise to
// eighteen hasta, and the Black Stone is carried on a cloth lifted by four tribal cords and set
// at the corner. No figure and no hands: the cords lead out of frame.
import React, { useMemo } from "react";
import * as THREE from "three";
import type { Key } from "./camera.ts";
import { Box, C, CH, KabahModel, PlanStones, Plinth, TEX, W, type V3, clamp01, mix, ramp } from "./core.tsx";
import { At, L } from "./world.tsx";

const S = "quraisy" as const;
const SITE: V3 = [2.5, 0, 0];
const CLOTH: V3 = [1.2, 0, 3.4];

export const keys03 = (): Key[] => [
  { t: CH("c02").end + 0.8, pos: L(S, [-8, 14, 22]), tgt: L(S, [0, 0.5, 0]), fov: 34 },
  { t: W("c03", "quraisy"), pos: L(S, [1, 8, 20]), tgt: L(S, [1, 0.8, 0]), fov: 32 },
  { t: W("c03", "berusia"), pos: L(S, [4, 4.5, 12.5]), tgt: L(S, [2.5, 0.7, 0]), fov: 32 },
  { t: W("c03", "rapuh"), pos: L(S, [5.4, 2.2, 6.4]), tgt: L(S, [2.5, 0.6, 0]), fov: 34 },
  { t: W("c03", "dindingnya"), pos: L(S, [1.2, 1.8, 6.4]), tgt: L(S, [2.5, 0.6, 0]), fov: 34 },
  { t: W("c03", "membangun"), pos: L(S, [6.5, 5, 10.5]), tgt: L(S, [3.2, 0.4, 0.5]), fov: 32 },
  { t: W("c03", "menunggu"), pos: L(S, [0, 6.5, 15]), tgt: L(S, [2.4, 0.5, 0]), fov: 32 },
  { t: W("c03", "syarat"), pos: L(S, [3.5, 5, 11.5]), tgt: L(S, [3, 0.4, 0.5]), fov: 32 },
  { t: W("c03", "kayunya"), pos: L(S, [-6.5, 3.2, 8.5]), tgt: L(S, [-3.2, 0.3, 1]), fov: 32 },
  { t: W("c03", "romawi"), pos: L(S, [-1.6, 2.4, 6.4]), tgt: L(S, [-3.2, 0.3, 1]), fov: 34 },
  { t: W("c03", "kapal", 1), pos: L(S, [-1, 6.5, 13]), tgt: L(S, [0, 1, 0]), fov: 32 },
  { t: W("c03", "ditinggikan"), pos: L(S, [5.5, 3.8, 9.5]), tgt: L(S, [2.5, 1.3, 0]), fov: 32 },
  { t: W("c03", "beratap"), pos: L(S, [6.4, 6.4, 8.4]), tgt: L(S, [2.5, 2.2, 0]), fov: 32 },
  { t: W("c03", "aswad"), pos: L(S, [1.6, 4.8, 8.2]), tgt: L(S, [1.2, 0.2, 3.4]), fov: 32 },
  { t: W("c03", "berperang"), pos: L(S, [4.4, 4.6, 8.2]), tgt: L(S, [1.2, 0.4, 3.4]), fov: 32 },
  { t: W("c03", "solusinya"), pos: L(S, [0.9, 3.4, 6.6]), tgt: L(S, [1.2, 0.2, 3.4]), fov: 34 },
  { t: W("c03", "mengangkatnya"), pos: L(S, [1.3, 3.2, 6.4]), tgt: L(S, [1.2, 0.55, 3.4]), fov: 34 },
  { t: W("c03", "dipasang"), pos: L(S, [-0.6, 1.7, 5.4]), tgt: L(S, [0.75, 0.6, 1.6]), fov: 34 },
  { t: CH("c03").end, pos: L(S, [0, 4, 10]), tgt: L(S, [1.6, 1, 0.5]), fov: 32 },
];

/** Night falls while Mecca waits to see if the first man to demolish is harmed. */
export const nightOf = (t: number) => ramp(t, W("c03", "menunggu"), W("c03", "celaka") + 0.5) * (1 - ramp(t, W("c03", "ternyata"), W("c03", "berlanjut")));

const Sea: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, -0.18, 0]} receiveShadow>
      <planeGeometry args={[24, 40]} />
      <meshPhysicalMaterial color="#5f9a9c" roughness={0.06} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.92} />
    </mesh>
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.18 + i / 3) % 1);
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4.9 - k * 2.2, -0.16, 0]}>
          <planeGeometry args={[0.08, 14 - i * 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * (1 - k)} />
        </mesh>
      );
    })}
  </group>
);

const Wreck: React.FC<{ taken: number }> = ({ taken }) => {
  return (
    <group position={[-3.4, 0.3, 1]} rotation={[0, 0.5, 0.42]}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -1.0 + i * 0.25;
        const gone = i >= 9 - Math.round(taken * 6);
        return gone ? null : (
          <Box key={i} s={[2.3 - Math.abs(a) * 0.5, 0.05, 0.16]} p={[0, Math.sin(a) * 0.6, -Math.cos(a) * 0.6 + 0.6]} r={[a, 0, 0]} c={i % 2 ? C.wood : "#7a4c2b"} rough={0.72} radius={0.015} />
        );
      })}
      <Box s={[0.08, 0.08, 0.9]} p={[0.85, 0, 0.6]} c="#6b4226" rough={0.7} />
      <Box s={[2.4, 0.09, 0.1]} p={[0, -0.6, 0.6]} c="#5d3a20" rough={0.7} />
      {/* broken mast */}
      <mesh position={[0, 0.2, 0.6]} rotation={[0.2, 0, 1.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 10]} />
        <meshStandardMaterial color="#6b4226" roughness={0.7} />
      </mesh>
    </group>
  );
};

/** Planks lifting off the wreck and landing on the new roof. */
const FlyingPlanks: React.FC<{ t: number }> = ({ t }) => {
  const t0 = W("c03", "kayu", 0), t1 = W("c03", "koptik");
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => {
        const a = mix(t0, t1, i / 8), k = ramp(t, a, a + 2.2);
        if (k <= 0 || k >= 1) return null;
        const from: V3 = [-3.2, 0.4, 1], to: V3 = [SITE[0] - 1.6 + i * 0.45, 2.75, 0];
        return <Box key={i} s={[0.16, 0.06, 2.6]} p={[mix(from[0], to[0], k), mix(from[1], to[1], k) + Math.sin(k * Math.PI) * 2.2, mix(from[2], to[2], k)]} r={[0, mix(1.2, 0, k), Math.sin(k * 6) * 0.2]} c={i % 2 ? C.wood : "#7a4c2b"} rough={0.7} radius={0.015} />;
      })}
    </group>
  );
};

const TRIBES = ["#8c3b2e", "#2f5d73", "#6b7d3a", "#8a6a26"];
/** The Black Stone on a cloth: four tribal cords at the corners lift it together. */
const Cloth: React.FC<{ t: number }> = ({ t }) => {
  const appear = ramp(t, W("c03", "memasang") - 0.5, W("c03", "aswad", 0) + 0.5);
  const lift = ramp(t, W("c03", "mengangkatnya"), W("c03", "bersama", 1) + 0.6);
  const place = ramp(t, W("c03", "dipasang"), W("c03", "sendiri", 1) + 0.4);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.5, 1.5, 24, 24);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const sagged = useMemo(() => {
    const g = geo.clone();
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / 0.75, z = p.getZ(i) / 0.75;
      p.setY(i, -0.32 * (1 - x * x) * (1 - z * z) + 0.02 * Math.sin(x * 9) * Math.sin(z * 7));
    }
    g.computeVertexNormals();
    return g;
  }, [geo]);
  if (appear <= 0) return null;
  const y = mix(0.04, 0.95, lift);
  const corner: V3 = [SITE[0] - 1.8 - 0.02 - CLOTH[0], 0.13 + 2.6 * 0.1 + 0.02 - y, 1.5 + 0.02 - CLOTH[2]];
  const stone: V3 = place > 0 ? [mix(0, corner[0], place), mix(-0.2, corner[1], place) + Math.sin(place * Math.PI) * 0.4, mix(0, corner[2], place)] : [0, -0.2 * lift + 0.08 * (1 - lift), 0];
  return (
    <group position={[CLOTH[0], y, CLOTH[2]]}>
      <mesh geometry={lift > 0.02 ? sagged : geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#efe6d4" roughness={0.85} sheen={0.8} sheenRoughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* the stone (dignified: dark, glossy, small) */}
      {place < 0.999 ? (
        <mesh position={stone} scale={[0.15, 0.1, 0.13]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
          <meshPhysicalMaterial color="#1a1614" roughness={0.25} clearcoat={0.6} />
        </mesh>
      ) : null}
      {/* four cords to four tribal banners */}
      {[[-0.75, -0.75], [0.75, -0.75], [0.75, 0.75], [-0.75, 0.75]].map(([x, z], i) => {
        const top: V3 = [x * 3.0, 2.6 - y, z * 2.6];
        const len = Math.hypot(top[0] - x, top[1], top[2] - z);
        const mid: V3 = [(x + top[0]) / 2, top[1] / 2, (z + top[2]) / 2];
        const dir = new THREE.Vector3(top[0] - x, top[1], top[2] - z).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return (
          <group key={i}>
            <mesh position={mid} quaternion={q}>
              <cylinderGeometry args={[0.012, 0.012, len, 6]} />
              <meshStandardMaterial color="#c9b38a" roughness={0.8} />
            </mesh>
            <mesh position={[top[0], 1.5 - y, top[2]]} castShadow>
              <cylinderGeometry args={[0.03, 0.035, 3.0, 10]} />
              <meshStandardMaterial color="#6b4a2c" roughness={0.7} />
            </mesh>
            <Box s={[0.5, 0.34, 0.02]} p={[top[0] + 0.27, top[1] + 0.2, top[2]]} c={TRIBES[i]} rough={0.85} radius={0.006} mat={{ sheen: 0.6 }} />
          </group>
        );
      })}
    </group>
  );
};

export const Quraisy: React.FC<{ t: number }> = ({ t }) => {
  const sand = TEX.sand();
  const soot = ramp(t, W("c03", "kebakaran"), W("c03", "banjir", 0) + 0.3);
  const stain = ramp(t, W("c03", "banjir", 0), W("c03", "dindingnya") + 0.5);
  const down = ramp(t, W("c03", "memulai"), W("c03", "berlanjut") + 0.8);
  const up = ramp(t, W("c03", "kayu", 0), W("c03", "beratap"));
  const oldVisible = down < 0.999;
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[7.2, 96]} />
        <meshStandardMaterial map={sand} color="#ffffff" roughness={0.97} />
      </mesh>
      <Sea t={t} />
      <Wreck taken={ramp(t, W("c03", "kayu", 0), W("c03", "koptik") + 2)} />
      <FlyingPlanks t={t} />
      <group position={SITE}>
        {oldVisible ? <KabahModel dress="stone" h={1.3} roof={false} door="ground" hijr={false} hajar="stone" rise={1 - down} tint={soot * 0.55} seed={31} /> : null}
        {/* water stain line on the old walls */}
        {oldVisible && stain > 0 ? (
          <mesh position={[0, 0.13 + 0.35, 0]}>
            <boxGeometry args={[3.64, 0.7 * stain, 3.04]} />
            <meshStandardMaterial color="#6d5a40" transparent opacity={0.35 * (1 - down)} roughness={1} depthWrite={false} />
          </mesh>
        ) : null}
        {up > 0.001 ? <KabahModel dress="stone" h={2.6} roof door="raised" hijr={false} hajar={t > W("c03", "sendiri", 1) ? "stone" : "none"} rise={up} seed={32} /> : null}
        <PlanStones n={40} p={[2.4, 0, -2.4]} cols={8} k={down * (1 - up)} seed={33} />
      </group>
      {/* halal-funds offering: three lidded chests; the coins stay inside */}
      <group position={[4.6, 0, 3.2]} rotation={[0, -0.4, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.55, 0, 0]}>
            <Box s={[0.42, 0.3, 0.3]} p={[0, 0.15, 0]} c="#6f4a2a" rough={0.6} radius={0.03} />
            <Box s={[0.44, 0.06, 0.32]} p={[0, 0.32, 0]} c={C.brass} metal={1} rough={0.3} radius={0.02} />
          </group>
        ))}
      </group>
      <Cloth t={t} />
      {/* night oil lamps by the site */}
      {[[0.2, 2.6], [4.9, -1.8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box s={[0.12, 0.6, 0.12]} p={[0, 0.3, 0]} c="#6b4a2c" rough={0.7} radius={0.02} />
          <mesh position={[0, 0.68, 0]}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshBasicMaterial color={C.warmGlow} toneMapped={false} transparent opacity={clamp01(nightOf(t) * 1.4)} />
          </mesh>
          {nightOf(t) > 0.01 ? <pointLight position={[0, 0.8, 0]} color="#ffb766" intensity={6 * nightOf(t)} distance={6} /> : null}
        </group>
      ))}
    </At>
  );
};
