// Chapter 7 (c08): the 1039 H flood and Murad IV's rebuilding — a flood-tank diorama around a stone
// study model (never today's Ka'bah). Brass belts bind the cracked walls; rain; brown water rises to
// half the wall height and leaves a cyan flood line; lamps and books drift; the north wall is shown
// going down as its stones are laid out on plan, then the rest; scaffold rises; granite courses
// build the 1631 building; the black kiswah drops over it: the Ka'bah we know today.
import React, { useMemo } from "react";
import { prng } from "../../core/materials/textures.ts";
import type { Key } from "./camera.ts";
import { Box, C, CH, Glow, HijrWall, KabahModel, PlanStones, Plinth, W, type V3, clamp01, mix, ramp, window01 } from "./core.tsx";
import { At, L } from "./world.tsx";

const S = "rebuild" as const;
const H_OLD = 4.0, H_NEW = 4.5;
const LEVEL = 0.13 + H_OLD * 0.5;

export const keys08 = (): Key[] => [
  { t: W("c08", "air"), pos: [14, 10, 24], tgt: L(S, [0, 1.5, 0]), fov: 34 },
  { t: W("c08", "ahmed"), pos: L(S, [0, 8, 18]), tgt: L(S, [0, 1.6, 0]), fov: 32 },
  { t: W("c08", "retak"), pos: L(S, [2.8, 3.2, 8.2]), tgt: L(S, [-0.2, 1.8, 1.4]), fov: 32 },
  { t: W("c08", "dipasang"), pos: L(S, [6, 4.2, 9]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c08", "rabu"), pos: L(S, [0, 6.5, 15.5]), tgt: L(S, [0, 1.6, 0]), fov: 32 },
  { t: W("c08", "hujan"), pos: L(S, [6.2, 5.2, 11]), tgt: L(S, [0, 1.6, 0]), fov: 32 },
  { t: W("c08", "naik"), pos: L(S, [5, 3.6, 8.2]), tgt: L(S, [0, 1.6, 0.5]), fov: 32 },
  { t: W("c08", "lampu"), pos: L(S, [2.6, 3.1, 6.6]), tgt: L(S, [1, 2.1, 2.5]), fov: 34 },
  { t: W("c08", "utara"), pos: L(S, [8.4, 4.2, 2.4]), tgt: L(S, [2, 1, 0]), fov: 32 },
  { t: W("c08", "barat"), pos: L(S, [8.2, 5.2, 5.4]), tgt: L(S, [1.6, 0.8, 0]), fov: 32 },
  { t: W("c08", "merobohkan"), pos: L(S, [5.2, 8.2, 10]), tgt: L(S, [1, 0.5, 0]), fov: 32 },
  { t: W("c08", "memerintahkan"), pos: L(S, [6.2, 6.2, 11]), tgt: L(S, [0, 1.5, 0]), fov: 32 },
  { t: W("c08", "granit"), pos: L(S, [4, 3.2, 8]), tgt: L(S, [0, 1.6, 0]), fov: 32 },
  { t: W("c08", "atau"), pos: L(S, [-4.2, 5.2, 11]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c08", "menurut"), pos: L(S, [0, 7, 14]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c08", "ka'bah", 2), pos: L(S, [3, 4.4, 10]), tgt: L(S, [0, 2.4, 0]), fov: 32 },
  { t: W("c08", "dipugar"), pos: L(S, [0, 8, 16]), tgt: L(S, [0, 2, 0]), fov: 32 },
  { t: W("c08", "kita"), pos: [7, 9, 22], tgt: [0, 2, 0], fov: 32 },
  { t: W("c08", "seribu", 4), pos: [3, 4.2, 11], tgt: [0, 1.8, 0], fov: 32 },
  { t: W("c08", "pintu"), pos: [-0.2, 1.9, 6.6], tgt: [-0.6, 1.1, 1.5], fov: 34 },
  { t: CH("c08").end, pos: [0.4, 2.2, 7.4], tgt: [-0.6, 1.15, 1.5], fov: 34 },
];

export const stormOf = (t: number) => window01(t, W("c08", "hujan") - 0.8, W("c08", "utara"), 1.2, 1.5);

const Rain: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const drops = useMemo(() => {
    const rnd = prng(61);
    return Array.from({ length: 260 }, () => ({ x: (rnd() - 0.5) * 13, z: (rnd() - 0.5) * 13, ph: rnd(), sp: 7 + rnd() * 3 }));
  }, []);
  if (k <= 0.01) return null;
  return (
    <group>
      {drops.map((d, i) => {
        const y = 7 - (((t * d.sp) / 7 + d.ph) % 1) * 7.5;
        return <Glow key={i} s={[0.012, 0.35, 0.012]} p={[d.x, y, d.z]} c="#dfe8ee" op={0.55 * k} />;
      })}
    </group>
  );
};

const Floaters: React.FC<{ t: number; level: number }> = ({ t, level }) => {
  const k = ramp(t, W("c08", "lampu") - 0.4, W("c08", "utara"));
  if (k <= 0 || level < 0.3) return null;
  const items: { a: V3; b: V3; lamp: boolean }[] = [
    { a: [-3.2, 0, 3.0], b: [2.6, 0, 3.2], lamp: true },
    { a: [-2.6, 0, 2.2], b: [3.0, 0, 2.4], lamp: false },
    { a: [-3.4, 0, -2.8], b: [1.8, 0, -3.2], lamp: false },
    { a: [3.2, 0, -2.6], b: [3.4, 0, 2.0], lamp: true },
    { a: [-3.0, 0, 0.6], b: [-3.2, 0, -2.4], lamp: false },
  ];
  return (
    <group>
      {items.map((it, i) => {
        const kk = clamp01(k * 1.2 - i * 0.04);
        const p: V3 = [mix(it.a[0], it.b[0], kk), level + 0.03 + Math.sin(t * 2 + i) * 0.015, mix(it.a[2], it.b[2], kk)];
        return it.lamp ? (
          <group key={i} position={p} rotation={[0.2 * Math.sin(t + i), t * 0.3 + i, 0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.09, 0.08, 16]} />
              <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.07, 16, 10]} />
              <meshPhysicalMaterial color="#f4f0e6" roughness={0.4} transparent opacity={0.55} />
            </mesh>
          </group>
        ) : (
          <Box key={i} s={[0.26, 0.06, 0.19]} p={p} r={[0.08, t * 0.25 + i * 1.3, 0.05]} c={["#6e2f24", "#2f4a5e", "#5b4a2a"][i % 3]} rough={0.7} radius={0.012} />
        );
      })}
    </group>
  );
};

export const Rebuild: React.FC<{ t: number }> = ({ t }) => {
  const crack = ramp(t, W("c08", "retak") - 0.3, W("c08", "retak") + 0.5);
  const belts = ramp(t, W("c08", "dipasang"), W("c08", "dindingnya") + 0.3);
  const storm = stormOf(t);
  const level = LEVEL * ramp(t, W("c08", "banjir"), W("c08", "ka'bah", 1) + 0.4) * (1 - ramp(t, W("c08", "utara") - 0.4, W("c08", "runtuh") + 0.2));
  const fline = ramp(t, W("c08", "setengah"), W("c08", "ka'bah", 1) + 0.4) * (1 - ramp(t, W("c08", "merobohkan"), W("c08", "dindingnya", 1)));
  const north = 1 - ramp(t, W("c08", "utara"), W("c08", "runtuh") + 0.3);
  const sides = 1 - 0.5 * ramp(t, W("c08", "bersama"), W("c08", "barat") + 0.3);
  const rest = 1 - ramp(t, W("c08", "merobohkan"), W("c08", "dindingnya", 1) + 0.4);
  const planA = ramp(t, W("c08", "utara"), W("c08", "barat") + 0.5);
  const planB = ramp(t, W("c08", "merobohkan"), W("c08", "dindingnya", 1) + 0.4);
  const scaffold = ramp(t, W("c08", "memerintahkan"), W("c08", "ulang", 0) + 0.3) * (1 - ramp(t, W("c08", "ka'bah", 2), W("c08", "lagi")));
  const granite = ramp(t, W("c08", "dikerjakan"), W("c08", "masehi", 1));
  const drape = ramp(t, W("c08", "ka'bah", 2), W("c08", "dipugar") + 0.2);
  const oldOn = rest > 0.001 && granite < 0.02;
  const fr: [number, number, number, number] = [sides * rest, north * rest, sides * rest, rest];
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[7.1, 96]} />
        <meshStandardMaterial color={C.marble} roughness={0.75} />
      </mesh>
      {/* tank rim: the courtyard of the diorama */}
      {[[0, 3.8, 8, 0.2], [0, -3.8, 8, 0.2], [3.8, 0, 0.2, 7.4], [-3.8, 0, 0.2, 7.4]].map(([x, z, w, d], i) => (
        <Box key={i} s={[w, 0.25, d]} p={[x, 0.125, z]} c="#d9cbb3" rough={0.6} radius={0.03} />
      ))}
      {oldOn ? <KabahModel dress="stone" h={H_OLD} door="raised" west={1} walled={1} hijr={false} hajar="stone" belts={belts} faceRise={fr} seed={51} /> : null}
      {oldOn && crack > 0.01 ? (
        <group>
          <Glow s={[0.02, 1.2, 0.01]} p={[0.6, 2.6, 1.505]} r={[0, 0, 0.18]} c="#2a221b" op={crack} />
          <Glow s={[0.02, 0.8, 0.01]} p={[0.78, 1.7, 1.505]} r={[0, 0, -0.3]} c="#2a221b" op={crack} />
          <Glow s={[0.01, 1.0, 0.02]} p={[1.805, 2.3, 0.4]} r={[0.2, 0, 0]} c="#2a221b" op={crack} />
        </group>
      ) : null}
      {granite > 0.001 ? <KabahModel dress="stone" h={H_NEW} door="raised" hijr={false} hajar="stone" rise={granite} palette={["#8f8b86", "#9b958d", "#837f79", "#a19c94"]} seed={52} /> : null}
      {drape > 0.001 ? (
        <group position={[0, (0.13 + H_NEW) * (1 - drape), 0]} scale={[1, Math.max(0.001, drape), 1]}>
          <KabahModel dress="kiswah" h={H_NEW} hijr={false} hajar="none" seed={53} />
        </group>
      ) : null}
      <HijrWall p={[1.85, 0, 0]} />
      <PlanStones n={36} p={[4.4, 0, -2.6]} cols={3} k={planA} seed={54} />
      <PlanStones n={60} p={[-3.4, 0, 4.2]} cols={12} k={planB * (1 - granite)} seed={55} />
      {/* water and the flood line */}
      {level > 0.01 ? (
        <mesh position={[0, level / 2 + 0.01, 0]}>
          <boxGeometry args={[7.4, level, 7.4]} />
          <meshStandardMaterial color="#8c7553" roughness={0.45} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ) : null}
      {fline > 0.01 ? (
        <group position={[0, LEVEL, 0]}>
          <Glow s={[3.66, 0.03, 0.02]} p={[0, 0, 1.52]} c={C.accent} op={fline} />
          <Glow s={[3.66, 0.03, 0.02]} p={[0, 0, -1.52]} c={C.accent} op={fline} />
          <Glow s={[0.02, 0.03, 3.06]} p={[1.82, 0, 0]} c={C.accent} op={fline} />
          <Glow s={[0.02, 0.03, 3.06]} p={[-1.82, 0, 0]} c={C.accent} op={fline} />
        </group>
      ) : null}
      <Floaters t={t} level={level} />
      <Rain t={t} k={storm} />
      {/* scaffold for the 1040 H rebuilding */}
      {scaffold > 0.001 ? (
        <group scale={[1, scaffold, 1]}>
          {[-2.2, -0.7, 0.7, 2.2].map((x) =>
            [-1.9, 1.9].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 2.6, z]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 5.2, 8]} />
                <meshStandardMaterial color="#8b6a44" roughness={0.75} />
              </mesh>
            )),
          )}
          {[1.2, 2.4, 3.6, 4.8].map((y) =>
            [-1.9, 1.9].map((z) => <Box key={`${y}${z}`} s={[4.6, 0.06, 0.25]} p={[0, y, z]} c="#a5784a" rough={0.75} radius={0.01} />),
          )}
        </group>
      ) : null}
    </At>
  );
};
