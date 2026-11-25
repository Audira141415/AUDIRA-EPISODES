// Chapter 4 (c05): Ibn Zubair's Ka'bah with two ground doors — and, on the same study model, the
// return to the Quraysh form in chapter 5 (c06). The fire is shown only as soot on the old stones and
// an amber haze; the taking-down happens behind a curtain hung on poles; Ibrahim's foundation line and
// its "camel hump" stones appear inside; the longer, taller building rises with two lit doors at
// ground level; then the Hijr part is shortened, the west door bricked up and the east door raised.
import React from "react";
import type { Key } from "./camera.ts";
import { Box, C, CH, GroundOutline, HijrWall, KabahModel, Plinth, W, mix, ramp } from "./core.tsx";
import { HumpStones } from "./ch02.tsx";
import { At, L } from "./world.tsx";

const S = "zubair" as const;
const CORNER = { p: [-1.82, 0.55, 1.52] as [number, number, number] };

export const keys05 = (): Key[] => [
  { t: CH("c04").end + 0.8, pos: L(S, [-6, 12, 24]), tgt: L(S, [0.4, 1, 0]), fov: 34 },
  { t: W("c05", "hijriah"), pos: L(S, [4, 6.5, 15]), tgt: L(S, [0.4, 1, 0]), fov: 32 },
  { t: W("c05", "terbakar"), pos: L(S, [3.2, 3.4, 10]), tgt: L(S, [0, 1, 0]), fov: 32 },
  { t: W("c05", "memutuskan"), pos: L(S, [-4.5, 4.4, 11]), tgt: L(S, [0.2, 1, 0]), fov: 32 },
  { t: W("c05", "abbas"), pos: L(S, [0, 6, 14]), tgt: L(S, [0.4, 1, 0]), fov: 32 },
  { t: W("c05", "merobohkan"), pos: L(S, [5.5, 7.5, 12.5]), tgt: L(S, [0.4, 1.4, 0]), fov: 32 },
  { t: W("c05", "selama"), pos: L(S, [-5.2, 3.2, 9.5]), tgt: L(S, [0, 1.6, 0]), fov: 32 },
  { t: W("c05", "digantung"), pos: L(S, [-2.0, 2.6, 6.6]), tgt: L(S, [-2.45, 2.6, 2.2]), fov: 34 },
  { t: W("c05", "fondasi"), pos: L(S, [1.2, 9.5, 5.5]), tgt: L(S, [0.45, 0, 0]), fov: 32 },
  { t: W("c05", "unta"), pos: L(S, [2.8, 4.6, 4.6]), tgt: L(S, [2.2, 0, 1.3]), fov: 32 },
  { t: W("c05", "membangun"), pos: L(S, [5.5, 7.5, 9.5]), tgt: L(S, [0.45, 1.4, 0]), fov: 32 },
  { t: W("c05", "dinaikkan"), pos: L(S, [5.4, 4.8, 10.5]), tgt: L(S, [0.45, 2.2, 0]), fov: 32 },
  { t: W("c05", "pintu"), pos: L(S, [-0.8, 1.7, 7.8]), tgt: L(S, [-0.6, 0.6, 1.5]), fov: 34 },
  { t: W("c05", "satu", 1), pos: L(S, [-7.4, 2.6, 1.2]), tgt: L(S, [-0.6, 0.6, 0]), fov: 34 },
  { t: W("c05", "keluar"), pos: L(S, [-3.2, 2.4, -7.2]), tgt: L(S, [-0.6, 0.6, -1.5]), fov: 34 },
  { t: W("c05", "aisyah"), pos: L(S, [-7, 5, 3]), tgt: L(S, [0.4, 1.4, 0]), fov: 32 },
  { t: W("c05", "selesai"), pos: L(S, [3, 6.5, 11]), tgt: L(S, [0.4, 1.6, 0]), fov: 32 },
  { t: W("c05", "aswad"), pos: L(S, [-2.7, 1.0, 3.2]), tgt: L(S, CORNER.p), fov: 34 },
  { t: W("c05", "perak"), pos: L(S, [-2.35, 0.8, 2.5]), tgt: L(S, CORNER.p), fov: 34 },
  { t: CH("c05").end, pos: L(S, [0, 6, 15]), tgt: L(S, [0.4, 1.6, 0]), fov: 32 },
];

/** Camera keys for the part of chapter 5 that happens on this model (c06 343-362). */
export const keys06zubair = (): Key[] => [
  { t: W("c06", "perintah") + 0.6, pos: L(S, [8, 14, -2]), tgt: L(S, [0.4, 1, 0]), fov: 34 },
  { t: W("c06", "tapi"), pos: L(S, [6.2, 4.8, -7.2]), tgt: L(S, [0.4, 1.2, -0.5]), fov: 32 },
  { t: W("c06", "ditutup"), pos: L(S, [5.6, 3.6, -6.4]), tgt: L(S, [0.2, 1.0, -0.8]), fov: 32 },
  { t: W("c06", "quraisy"), pos: L(S, [8.2, 3.6, 0]), tgt: L(S, [0.2, 1.2, 0]), fov: 32 },
  { t: W("c06", "timur"), pos: L(S, [5.8, 3.4, 7]), tgt: L(S, [-0.2, 1.1, 0.5]), fov: 32 },
  { t: W("c06", "ditembok"), pos: L(S, [7.5, 4, 2]), tgt: L(S, [0.4, 1.0, -0.4]), fov: 32 },
  { t: W("c06", "luar"), pos: L(S, [6.4, 4.4, 6.8]), tgt: L(S, [1.2, 0.8, 0]), fov: 32 },
  { t: W("c06", "selesai"), pos: L(S, [3, 7, 13]), tgt: L(S, [0.4, 1.5, 0]), fov: 32 },
];

export const hazeOf = (t: number) =>
  ramp(t, W("c05", "dikepung"), W("c05", "terbakar") + 0.6) * (1 - ramp(t, W("c05", "zubair", 0), W("c05", "abbas") + 1)) +
  ramp(t, W("c06", "dikepung"), W("c06", "manjanik")) * (1 - ramp(t, W("c06", "terbunuh"), W("c06", "perintah")));

const Curtain: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.001) return null;
  const x0 = 0.45, hw = 3.0, hd = 2.25, top = 3.3, H = 3.2 * k;
  const panels = [
    { p: [x0, top - H / 2, hd] as [number, number, number], r: 0, w: hw * 2 },
    { p: [x0, top - H / 2, -hd] as [number, number, number], r: Math.PI, w: hw * 2 },
    { p: [x0 + hw, top - H / 2, 0] as [number, number, number], r: Math.PI / 2, w: hd * 2 },
    { p: [x0 - hw, top - H / 2, 0] as [number, number, number], r: -Math.PI / 2, w: hd * 2 },
  ];
  return (
    <group>
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[x0 + sx * hw, 1.75, sz * hd]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 3.5, 12]} />
          <meshStandardMaterial color="#6b4a2c" roughness={0.7} />
        </mesh>
      ))}
      {panels.map((pn, i) => (
        <mesh key={i} position={pn.p} rotation={[0, pn.r, 0]} castShadow receiveShadow>
          <planeGeometry args={[pn.w, H, 40, 4]} />
          <meshPhysicalMaterial color="#e9dfcc" roughness={0.9} sheen={0.7} sheenRoughness={0.5} side={2} />
        </mesh>
      ))}
      <Box s={[hw * 2 + 0.1, 0.04, 0.04]} p={[x0, top + 0.02, hd]} c="#c9b38a" rough={0.8} />
      <Box s={[hw * 2 + 0.1, 0.04, 0.04]} p={[x0, top + 0.02, -hd]} c="#c9b38a" rough={0.8} />
    </group>
  );
};

export const Zubair: React.FC<{ t: number }> = ({ t }) => {
  const soot = ramp(t, W("c05", "terbakar"), W("c05", "zubair", 0));
  const oldDown = ramp(t, W("c05", "merobohkan"), W("c05", "pertama") + 0.5);
  const curtain = ramp(t, W("c05", "memutuskan", 1), W("c05", "merobohkan")) * (1 - ramp(t, W("c05", "dan", 2), W("c05", "tanah", 1) + 0.6));
  const found = ramp(t, W("c05", "fondasi"), W("c05", "terlihat") + 0.4) * (1 - ramp(t, W("c05", "membangun"), W("c05", "atasnya") + 1));
  const rise = ramp(t, W("c05", "membangun"), W("c05", "kembali") + 0.4);
  const h = mix(2.6, 4.0, ramp(t, W("c05", "tingginya"), W("c05", "hasta") + 0.3));
  // chapter 5 morph on the same model
  const ext = mix(0.9, 0, ramp(t, W("c06", "hijr"), W("c06", "dibongkar") + 0.8));
  const walled = ramp(t, W("c06", "ditutup"), W("c06", "ditembok") + 0.4);
  const raise = ramp(t, W("c06", "ditinggikan"), W("c06", "lagi") + 0.3);
  const hijrBack = ramp(t, W("c06", "hijr", 1), W("c06", "dinding") + 0.3);
  const doorGlow = ramp(t, W("c05", "dua", 0) - 0.3, W("c05", "pintu") + 0.4) * (1 - walled * 0.6);
  const ring = ramp(t, W("c05", "diikat"), W("c05", "perak") + 0.3);
  const newBuilt = rise > 0.001;
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[7.1, 96]} />
        <meshStandardMaterial color={C.marble} roughness={0.75} />
      </mesh>
      {!newBuilt && oldDown < 0.999 ? <KabahModel dress="stone" h={2.6} roof door="raised" hijr hajar="stone" rise={1 - oldDown} tint={soot * 0.6} seed={41} /> : null}
      {found > 0.001 || (oldDown > 0.98 && !newBuilt) ? (
        <>
          <GroundOutline w={4.5} d={3.0} x={0.45} op={Math.max(found, 0.4)} t={0.05} />
          <HumpStones k={Math.max(found, 0.6)} w={4.5} d={3.0} x={0.45} seed={42} />
        </>
      ) : null}
      {newBuilt ? (
        <KabahModel dress="stone" h={h} ext={ext} roof door={raise > 0 ? "raised" : "ground"} doorRaise={raise} west={1} walled={walled} hijr={false} hajar="stone" rise={rise} doorGlow={doorGlow} seed={43} />
      ) : null}
      {hijrBack > 0.001 ? (
        <group scale={[1, hijrBack, 1]}>
          <HijrWall p={[1.85, 0, 0]} />
        </group>
      ) : null}
      {/* silver binding forms around the cracked stone */}
      {newBuilt && ring > 0.001 ? (
        <group position={[-1.82 - ext / 2 + 0.45, 0.13 + h * 0.1 + 0.02, 1.52]} rotation={[0, -Math.PI / 4, 0]} scale={ring}>
          <mesh castShadow>
            <torusGeometry args={[0.1, 0.03, 16, 40]} />
            <meshPhysicalMaterial color={C.silver} metalness={1} roughness={0.2} emissive="#ffffff" emissiveIntensity={0.15 * (1 - ring)} />
          </mesh>
        </group>
      ) : null}
      {/* light from the two ground doors pooling on the marble */}
      {newBuilt && doorGlow > 0.01 ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.62, 0.02, 2.05]}>
            <planeGeometry args={[0.7, 1.1]} />
            <meshBasicMaterial color={C.warmGlow} transparent opacity={0.4 * doorGlow} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.62, 0.02, -2.05]}>
            <planeGeometry args={[0.7, 1.1]} />
            <meshBasicMaterial color={C.warmGlow} transparent opacity={0.4 * doorGlow * (1 - walled)} toneMapped={false} depthWrite={false} />
          </mesh>
        </>
      ) : null}
      <Curtain k={curtain} />
    </At>
  );
};
