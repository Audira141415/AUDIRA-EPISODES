// The payoff: the three mega mendung clouds lift off the dyed cloth as stacked, extruded bands
// (dark outside, light inside), opening like an accordion as they rise toward the lens.

import React, { useMemo } from "react";
import * as THREE from "three";
import { BANDS, CLOTH_W, CLOUDS, cloudOutline, toCloth } from "../lib/motif.ts";
import { BATIK_PALETTE as P } from "../lib/palette.ts";

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Each cloud: where it lifts to (cloth-local offsets) and when, relative to the lift start. */
const FLIGHT = [
  { to: [0.05, 0.25, 0.75], delay: 0, spin: 0.12 },
  { to: [-0.35, 0.55, 0.45], delay: 0.35, spin: -0.2 },
  { to: [0.4, -0.05, 0.55], delay: 0.6, spin: 0.18 },
] as const;

export const MegaMendung3D: React.FC<{ t: number; liftAt: number; clothY: number; clothZ: number }> = ({ t, liftAt, clothY, clothZ }) => {
  const geos = useMemo(
    () =>
      CLOUDS.map((c) =>
        BANDS.map((b) => {
          const shape = new THREE.Shape(cloudOutline(b, 120).map(([x, y]) => new THREE.Vector2(x, y)));
          const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24 });
          // unit outline → metres: a cloud's radius is c.r of the cloth width
          const s = c.r * CLOTH_W;
          g.scale(s, s, s * 0.22);
          return g;
        }),
      ),
    [],
  );
  if (t < liftAt) return null;
  return (
    <group position={[0, clothY, clothZ]}>
      {CLOUDS.map((c, ci) => {
        const f = FLIGHT[ci];
        const k = smooth((t - liftAt - f.delay) / 1.6);
        const [x0, y0] = toCloth(c.u, c.v);
        const x = x0 + f.to[0] * k, y = y0 + f.to[1] * k, z = 0.012 + f.to[2] * k;
        // a slow turn and bob once airborne, so the stack reads as layers
        const after = Math.max(0, t - liftAt - f.delay - 1.6);
        const bob = Math.sin(after * 1.3 + ci) * 0.015 * Math.min(1, after);
        return (
          <group key={ci} position={[x, y + bob, z]} rotation={[-0.15 * k, f.spin * k + after * 0.05 * (ci % 2 ? -1 : 1), 0]} scale={0.98 + 0.25 * k}>
            {geos[ci].map((g, bi) => (
              <mesh key={bi} geometry={g} position={[0, 0, bi * (0.004 + 0.045 * k)]} castShadow receiveShadow>
                <meshPhysicalMaterial color={P.cloud[bi]} roughness={0.5} clearcoat={0.25} clearcoatRoughness={0.6} emissive={P.cloud[bi]} emissiveIntensity={0.12} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};
