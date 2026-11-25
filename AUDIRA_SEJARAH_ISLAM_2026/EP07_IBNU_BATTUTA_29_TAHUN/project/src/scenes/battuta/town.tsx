// EP07 inside Sumutra (Rihla via register #20–#28): boats bringing coconuts, bananas and fish; spears
// along the road to the palace; the guest's three days of rest; the sultan walking to Friday prayer;
// the fiqh circle that lasts until Asr. Every person is a faceless paper-cone figure. The mosque is a
// plain tiered-roof paper model with no writing on it.

import React from "react";
import { Cut, ShearPop, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { PaperBuilding } from "../../kits/paperworld/components/PaperBuilding.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { mix, popEase, remap } from "../../kits/paperworld/motion/easing.ts";
import { BANK_Y, ConeDoll } from "./world.tsx";

export const MOSQUE_AT: V3 = [-5.6, BANK_Y, -23.4];
export const PAVILION_AT: V3 = [6.6, BANK_Y, -22.6];
export const GUEST_HOUSE: V3 = [4.4, BANK_Y, -16.6];
export const HALL_DOOR: V3 = [0.6, BANK_Y, -16.3];

/** Sultan's walk: hall door → mosque door. */
export const WALK_PATH: V3[] = [HALL_DOOR, [-1.6, BANK_Y, -17.2], [-3.6, BANK_Y, -19.4], [-5.2, BANK_Y, -20.8]];
export const walkAt = (u: number): { p: V3; yaw: number } => {
  const n = WALK_PATH.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, u * n));
  const i = Math.floor(f), k = f - i;
  const a = WALK_PATH[i], b = WALK_PATH[i + 1];
  return { p: [mix(a[0], b[0], k), BANK_Y, mix(a[2], b[2], k)], yaw: Math.atan2(b[0] - a[0], b[2] - a[2]) };
};

const pyramid = (r: number, h: number, color: string, y: number, key: string) => (
  <mesh key={key} position={[0, y + h / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow material={paperFace(color)}>
    <coneGeometry args={[r, h, 4, 1, true]} />
  </mesh>
);

export const Mosque: React.FC = () => (
  <group position={MOSQUE_AT}>
    <PaperBuilding b={{ w: 5.2, d: 5.2, h: 2.2, roof: "flat", wall: "ivoryLight", roofColor: "ivoryShade", trim: "goldLight", window: "brownDeep", cols: 2, rows: 1, door: "brownDeep", seed: 61 }} />
    <group position={[0, 2.2, 0]}>
      {pyramid(4.4, 1.5, "brownDeep", 0, "a")}
      <mesh position={[0, 1.55, 0]} castShadow material={paperFace("ivoryShade")}><boxGeometry args={[2.6, 0.55, 2.6]} /></mesh>
      {pyramid(3.0, 1.2, "brown", 1.8, "b")}
      <mesh position={[0, 3.05, 0]} castShadow material={paperFace("ivoryShade")}><boxGeometry args={[1.5, 0.4, 1.5]} /></mesh>
      {pyramid(1.7, 1.4, "brownDeep", 3.25, "c")}
      <mesh position={[0, 4.8, 0]} castShadow material={paperFace("goldLight")}><sphereGeometry args={[0.22, 12, 8]} /></mesh>
    </group>
    {/* serambi: the porch floor with a row of sandals */}
    <Cut shape={S.rectC(5.6, 1.6)} color="brown" depth={0.12} position={[0, 0.08, 3.3]} rotation={[-Math.PI / 2, 0, 0]} />
    {[-1.8, -1.1, -0.4, 0.3, 1.0, 1.7].map((x, i) => (
      <mesh key={i} position={[x, 0.2, 3.7]} castShadow material={paperFace(i % 2 ? "coralDeep" : "brownDeep")}><boxGeometry args={[0.22, 0.06, 0.5]} /></mesh>
    ))}
  </group>
);

/** Spears planted on both sides of the road near the palace: the sign to dismount (register #24). */
export const Spears: React.FC = () => (
  <group>
    {[[1.9, -14.0], [-0.7, -14.0], [1.9, -15.2], [-0.7, -15.2], [-0.6, -16.9], [-2.6, -17.6], [-2.4, -18.6], [-4.4, -19.8]].map(([x, z], i) => (
      <group key={i} position={[x, BANK_Y, z]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.05]}>
        <mesh position={[0, 1.5, 0]} castShadow material={paperFace("brownDeep")}><cylinderGeometry args={[0.05, 0.06, 3, 6]} /></mesh>
        <mesh position={[0, 3.2, 0]} castShadow material={paperFace("ivoryShade")}><coneGeometry args={[0.14, 0.5, 4]} /></mesh>
      </group>
    ))}
  </group>
);

/** Three paper suns on a string over the guest house: the three days of rest (register #25). */
export const SunTokens: React.FC<{ t: [number, number, number]; s: number }> = ({ t, s }) => (
  <group position={[GUEST_HOUSE[0], BANK_Y + 6.6, GUEST_HOUSE[2] + 1.2]} visible={t[0] > 0.001}>
    <mesh rotation={[0, 0, Math.PI / 2]} material={paperFace("#efe6d2")}><cylinderGeometry args={[0.03, 0.03, 6.2, 6]} /></mesh>
    {t.map((k, i) => (
      <group key={i} position={[(i - 1) * 2.1, -0.9, 0]} scale={popEase(Math.min(1, k))} rotation={[0, 0, Math.sin(s * 1.3 + i) * 0.05]}>
        <Cut shape={S.star(0.85, 0.62)} color="goldDeep" depth={0.08} position={[0, 0, -0.06]} />
        <Cut shape={S.circle(0.55)} color="goldLight" depth={0.12} />
      </group>
    ))}
  </group>
);

/** The fiqh circle in an open pavilion; the sultan (gold sash) and the guest (coral sash) sit side by side. */
export const Pavilion: React.FC<{ t: number; s: number }> = ({ t, s }) => (
  <group position={PAVILION_AT}>
    <Cut shape={S.rectC(5.4, 5.4)} color="brownLight" depth={0.3} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    <Cut shape={S.circle(2.1)} color="coral" depth={0.06} position={[0, 0.33, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    {[[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]].map(([x, z], i) => (
      <mesh key={i} position={[x, 1.9, z]} castShadow material={paperFace("brownDeep")}><cylinderGeometry args={[0.12, 0.14, 3.6, 8]} /></mesh>
    ))}
    {pyramid(4.6, 2.4, "brownDeep", 3.6, "roof")}
    <ShearPop t={t} position={[0, 0.3, 0]}>
      <group>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const r = 1.65;
          const sultan = i === 1, guest = i === 2;
          return (
            <ConeDoll key={i} h={1.9} seated position={[Math.sin(a) * r, 0, Math.cos(a) * r]} yaw={a + Math.PI}
              robe={sultan ? "ivoryLight" : guest ? "ivory" : i % 2 ? "ivoryShade" : "#e9dcc2"}
              sash={sultan ? "goldDeep" : guest ? "coral" : undefined} turban="ivoryLight" book={!sultan && !guest && i % 3 === 0} s={s} />
          );
        })}
      </group>
    </ShearPop>
  </group>
);

/** Small boats paddling out from the shore with coconuts, bananas and fish (register #20). */
const Canoe: React.FC<{ p: V3; yaw: number; s: number; seed: number }> = ({ p, yaw, s, seed }) => (
  <group position={[p[0], 0.15 + Math.sin(s * 2 + seed) * 0.05, p[2]]} rotation={[0, yaw, Math.sin(s * 1.7 + seed) * 0.04]}>
    {[-0.55, 0.55].map((z, i) => (
      <Cut key={i} shape={S.poly("canoe", [[-2.2, 0.55], [-1.7, 0], [1.7, 0], [2.3, 0.6]])} color="brown" depth={0.1} position={[0, 0, z]} />
    ))}
    <Cut shape={S.rectC(3.6, 1.1)} color="brownDeep" depth={0.08} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    <ConeDoll h={1.5} robe="coralLight" turban="ivoryLight" position={[-1.3, 0.1, 0]} yaw={Math.PI / 2} />
    <ConeDoll h={1.5} robe="mint" turban="ivoryLight" position={[1.3, 0.1, 0]} yaw={Math.PI / 2} />
    {/* paddles */}
    {[-1.3, 1.3].map((x, i) => (
      <mesh key={i} position={[x + 0.2, 0.6, 0.7]} rotation={[0.9 + Math.sin(s * 4 + i) * 0.4, 0, 0]} material={paperFace("brownDeep")}><boxGeometry args={[0.08, 1.4, 0.18]} /></mesh>
    ))}
    {/* cargo */}
    {[[-0.3, 0.2], [0.1, -0.2], [0.35, 0.25], [-0.05, 0.05]].map(([x, z], i) => (
      <mesh key={`c${i}`} position={[x, 0.4, z]} castShadow material={paperFace("#6b4a30")}><sphereGeometry args={[0.24, 10, 8]} /></mesh>
    ))}
    {[0, 1, 2].map((i) => (
      <mesh key={`b${i}`} position={[0.65, 0.42, -0.25 + i * 0.18]} rotation={[0, 0, 0.6]} castShadow material={paperFace("gold")}><capsuleGeometry args={[0.07, 0.42, 4, 8]} /></mesh>
    ))}
    <Cut shape={S.poly("fish", [[-0.5, 0], [0.1, 0.2], [0.4, 0], [0.6, 0.18], [0.6, -0.18], [0.4, 0], [0.1, -0.2]])} color="cobaltLight" depth={0.06} position={[-0.6, 0.36, -0.2]} rotation={[-Math.PI / 2, 0, 0.4]} />
  </group>
);

export const Boats: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const u = remap(t, 0, 1);
  return (
    <group visible={t > 0.001}>
      <Canoe p={[mix(5.5, 0.6, u), 0, mix(-9.6, -1.8, u)]} yaw={-0.85} s={s} seed={1} />
      <Canoe p={[mix(-1.5, -1.2, u), 0, mix(-10.0, -3.6, u)]} yaw={-1.35} s={s} seed={2} />
    </group>
  );
};

/** The sultan walking to Friday prayer in a plain jurist's robe (register #23, #27). */
export const SultanWalk: React.FC<{ u: number; s: number; show: number }> = ({ u, s, show }) => {
  if (show <= 0.001) return null;
  const { p, yaw } = walkAt(u);
  const moving = u > 0.001 && u < 0.999 ? 1 : 0;
  return <ConeDoll h={2.7} robe="ivoryLight" sash="goldDeep" turban="ivoryLight" position={p} yaw={yaw} s={s} walk={moving} />;
};

/** The guest waiting at the guest house door. */
export const Guest: React.FC<{ show: number; s: number }> = ({ show, s }) =>
  show > 0.001 ? <ConeDoll h={2.1} robe="ivory" sash="coral" turban="ivory" staff position={[GUEST_HOUSE[0] - 1.9, BANK_Y, GUEST_HOUSE[2] + 2.0]} yaw={0.4} s={s} /> : null;
