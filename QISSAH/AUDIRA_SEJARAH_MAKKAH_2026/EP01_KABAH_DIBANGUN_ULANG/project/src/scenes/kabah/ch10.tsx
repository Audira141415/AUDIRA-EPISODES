// Payoff (c10) and end screen: every version in a row on one long plinth (Ibrahim, Quraysh,
// Ibn Zubair, the Hajjaj return, Murad IV / today), then the camera rises over the mataf where gold
// lines from every direction converge on the same point; the Hijr lights once more; the end screen
// is a quiet wide shot of the cover composition.
import React, { useMemo } from "react";
import type { Key } from "./camera.ts";
import { Box, C, CH, Glow, HijrWall, KabahModel, TL, W, type V3, ramp } from "./core.tsx";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { At, L } from "./world.tsx";
import { COVER_POSE } from "./ch00.ts";

const S = "lineup" as const;
export const LINE = [
  { x: -12, year: "MASA IBRAHIM", desc: "tanpa atap, pintu di tanah" },
  { x: -6, year: "± 605 M", desc: "atap kayu kapal, Hijr di luar" },
  { x: 0, year: "64–65 H · 684 M", desc: "dua pintu, Hijr di dalam" },
  { x: 6, year: "74 H · 693 M", desc: "kembali ke bentuk Quraisy" },
  { x: 12, year: "1040 H · 1631 M", desc: "berdiri sampai sekarang" },
] as const;
export const linePin = (i: number): V3 => L(S, [LINE[i].x + (i === 2 ? 0.45 : 0), [1.9, 3.2, 4.7, 4.7, 5.2][i], 0]);

export const keys10 = (): Key[] => [
  { t: CH("c09").end + 0.8, pos: L(S, [-4, 14, 34]), tgt: L(S, [-4, 1.5, 0]), fov: 34 },
  { t: W("c10", "semuanya"), pos: L(S, [0, 10, 31]), tgt: L(S, [0, 1.6, 0]), fov: 34 },
  { t: W("c10", "ibrahim"), pos: L(S, [-11, 3.8, 10]), tgt: L(S, [-12, 0.8, 0]), fov: 32 },
  { t: W("c10", "quraisy", 0), pos: L(S, [-5.2, 4.2, 10.5]), tgt: L(S, [-6, 1.3, 0]), fov: 32 },
  { t: W("c10", "zubair"), pos: L(S, [0.8, 5, 11.5]), tgt: L(S, [0.4, 1.9, 0]), fov: 32 },
  { t: W("c10", "al-hajjaj"), pos: L(S, [6.8, 5, 11.5]), tgt: L(S, [6, 1.9, 0]), fov: 32 },
  { t: W("c10", "kemudian"), pos: L(S, [12.6, 5.4, 12]), tgt: L(S, [12, 2.1, 0]), fov: 32 },
  { t: W("c10", "bentuknya"), pos: L(S, [0, 9.5, 30]), tgt: L(S, [0, 2, 0]), fov: 34 },
  { t: W("c10", "berubah", 1), pos: [-6, 20, 30], tgt: [0, 0, 0], fov: 34 },
  { t: W("c10", "masa", 1), pos: [0, 30, 10], tgt: [0, 0, 0], fov: 34 },
  { t: W("c10", "sama"), pos: [0, 29, 9.5], tgt: [0, 0, 0], fov: 34 },
  { t: W("c10", "dinding"), pos: [6.5, 10, 9.5], tgt: [1.6, 0, 0], fov: 32 },
  { t: W("c10", "terlihat"), pos: [7, 9.5, 11], tgt: [1.4, 0.2, 0], fov: 32 },
  { t: W("c10", "menurutmu"), pos: [10, 8, 21], tgt: [0, 1.6, 0], fov: 32 },
  { t: W("c10", "kalau", 1), pos: [-8, 8.5, 22], tgt: [0, 1.8, 0], fov: 32 },
  { t: W("c10", "sejarah", 1), pos: [-2, 11, 36], tgt: [0, 2, 0], fov: 30 },
  { t: TL.voEnd + 1.5, ...COVER_POSE },
  { t: TL.total, pos: [1.6, 13.4, 47], tgt: [0, 2, 0], fov: 28 },
];

export const Lineup: React.FC<{ t: number }> = () => {
  const grain = useSurfaceGrain(9, 0.2, 6);
  return (
    <At s={S}>
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[32, 0.5, 8]} />
        <meshPhysicalMaterial color={C.travertine} roughness={0.8} roughnessMap={grain} />
      </mesh>
      <Box s={[31.6, 0.03, 0.06]} p={[0, 0.01, 3.7]} c={C.brass} metal={1} rough={0.3} />
      {LINE.map((l, i) => (
        <group key={i} position={[l.x, 0, 0]}>
          <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[2.7, 2.75, 0.12, 64]} />
            <meshPhysicalMaterial color={C.pearl} roughness={0.42} clearcoat={0.4} />
          </mesh>
          <group position={[0, 0.12, 0]}>
            {i === 0 ? <KabahModel dress="stone" h={1.3} ext={0.9} roof={false} door="ground" hijr={false} hajar="none" seed={71} /> : null}
            {i === 1 ? <KabahModel dress="stone" h={2.6} roof door="raised" hijr hajar="stone" seed={72} /> : null}
            {i === 2 ? <KabahModel dress="stone" h={4.0} ext={0.9} roof door="ground" west={1} hijr={false} hajar="frame" doorGlow={0.8} seed={73} /> : null}
            {i === 3 ? <KabahModel dress="stone" h={4.0} roof door="raised" west={1} walled={1} hijr hajar="frame" seed={74} /> : null}
            {i === 4 ? <KabahModel dress="kiswah" h={4.5} hijr hajar="frame" seed={75} /> : null}
          </group>
        </group>
      ))}
    </At>
  );
};

/** Gold lines from every direction converging on the Ka'bah: the direction that never changed. */
export const Qibla: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("c10", "arahnya"), W("c10", "sama") + 0.5) * (1 - ramp(t, W("c10", "dinding"), W("c10", "terlihat")));
  const rays = useMemo(() => Array.from({ length: 36 }, (_, i) => (i / 36) * Math.PI * 2), []);
  if (k <= 0.001) return null;
  return (
    <group>
      {rays.map((a, i) => {
        const r0 = 34, r1 = 2.9 + (1 - k) * 22;
        const mid = (r0 + r1) / 2, len = r0 - r1;
        return <Glow key={i} s={[0.22, 0.01, len]} p={[Math.sin(a) * mid, mid > 8.4 ? -0.2 : 0.02, Math.cos(a) * mid]} r={[0, a, 0]} op={0.7 * k} />;
      })}
    </group>
  );
};
void HijrWall;
