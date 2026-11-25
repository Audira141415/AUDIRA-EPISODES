// Helpers shared by the chapter files.
import React from "react";
import type { HubProps } from "../hub.tsx";
import { hubHeight, kabahPoint, KABAH } from "../hub.tsx";
import type { Key, V3 } from "../types.ts";
import { Ripple } from "../parts.tsx";

export const K = (t: number, pos: V3, tgt: V3, fov = 36): Key => ({ t, pos, tgt, fov });
export const H = (era: number, fort = 0, fortDemo = 0, hill = 1, tower = 0, towerGlow = 0, plan = 0): HubProps => ({ era, fort, fortDemo, hill, tower, towerGlow, plan });
/** Ground point of the valley at (x, z), lifted by `y`. */
export const G = (x: number, z: number, y = 0): V3 => [x, hubHeight(x, z) + y, z];

/** Door of the Ka'bah (north-east face), world point at the threshold. */
export const DOOR = kabahPoint(-KABAH.W * 0.2, KABAH.H * 0.27, KABAH.D / 2 + 0.06);

/** Swimmers of the 1941 tawaf, shown only as light ripples circling the Ka'bah (no figures). */
export const TawafRipples: React.FC<{ t: number; y: number; o: number; n?: number; stopAtDoor?: number }> = ({ t, y, o, n = 7, stopAtDoor = 0 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      // counter-clockwise seen from above, as tawaf
      const a = -t * 0.35 + (i / n) * Math.PI * 2;
      const r = 0.48 + (i % 3) * 0.08;
      let p: V3 = [Math.cos(a) * r, y + 0.004, Math.sin(a) * r];
      if (i < 2 && stopAtDoor > 0) {
        const d: V3 = [DOOR[0] + (i - 0.5) * 0.06, y + 0.004, DOOR[2] + 0.02];
        p = [p[0] + (d[0] - p[0]) * stopAtDoor, y + 0.004, p[2] + (d[2] - p[2]) * stopAtDoor];
      }
      return <Ripple key={i} at={p} t={t + i * 0.37} o={o} r={0.05} />;
    })}
  </>
);

import { FlowLine } from "../parts.tsx";

/** Haramain high-speed line leaving the valley to the west (toward Jeddah and Madinah). */
export const RAIL_PTS: V3[] = Array.from({ length: 30 }, (_, i) => {
  const x = 3.2 + i * 1.6;
  const z = -1.6 + Math.sin(i * 0.25) * 0.8;
  return G(x, z, 0.12);
});
export const Rail: React.FC<{ t: number; reveal: number; train: number; o?: number }> = ({ t, reveal, train, o = 1 }) => {
  const k = Math.min(RAIL_PTS.length - 1.001, Math.max(0, train * (RAIL_PTS.length - 1)));
  const i = Math.floor(k), f = k - i;
  const a = RAIL_PTS[i], b = RAIL_PTS[i + 1];
  const p: V3 = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + 0.05, a[2] + (b[2] - a[2]) * f];
  const ang = Math.atan2(b[0] - a[0], b[2] - a[2]);
  return (
    <>
      <FlowLine pts={RAIL_PTS} r={0.08} t={t} reveal={reveal} o={o} color="#c8913a" />
      {train > 0.001 && train < 0.999 ? (
        <group position={p} rotation={[0, ang, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.22, 2.6]} />
            <meshStandardMaterial color="#e8dcc0" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 1.45]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.14, 0.5, 12]} />
            <meshStandardMaterial color="#c5a059" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ) : null}
    </>
  );
};
