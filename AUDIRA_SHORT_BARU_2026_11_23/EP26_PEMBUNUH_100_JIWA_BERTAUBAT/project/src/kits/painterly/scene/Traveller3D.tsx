// The traveller: an original hooded walker with a red cloak, a wind-blown yellow scarf, a bedroll
// bedroll and a staff. Built from the painted shader (not toy vinyl): readable silhouette first —
// head and hood, shoulders wider than the hem line, legs that bend at the knee, staff in hand.

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { paintMaterial } from "../lib/paint.ts";
import { PAINT } from "../lib/palette.ts";
import { gust, walkerAt } from "../core/motion.ts";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

const TAU = Math.PI * 2;

/**
 * A flat cloth strip through `pts` (local space), `width` at each point, spread along `side`.
 * Rebuilt per frame from pure functions of t, so the cloth moves deterministically.
 */
function ribbon(pts: THREE.Vector3[], width: (u: number) => number, side: THREE.Vector3) {
  const n = pts.length;
  const pos = new Float32Array(n * 2 * 3);
  const uv = new Float32Array(n * 2 * 2);
  const idx: number[] = [];
  pts.forEach((p, i) => {
    const w = width(i / (n - 1)) / 2;
    pos.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w, p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6);
    uv.set([0, i / (n - 1), 1, i / (n - 1)], i * 4);
    if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const Leg: React.FC<{ side: number; swing: number; knee: number; mats: Record<string, THREE.Material> }> = ({ side, swing, knee, mats }) => (
  <group position={[0.045 * side, 0.27, 0]} rotation={[swing, 0, 0]}>
    <mesh position={[0, -0.065, 0]} material={mats.trousers} castShadow>
      <capsuleGeometry args={[0.028, 0.09, 4, 10]} />
    </mesh>
    <group position={[0, -0.13, 0]} rotation={[knee, 0, 0]}>
      <mesh position={[0, -0.055, 0]} material={mats.trousers} castShadow>
        <capsuleGeometry args={[0.024, 0.08, 4, 10]} />
      </mesh>
      <mesh position={[0, -0.115, 0.022]} material={mats.boots} castShadow>
        <RoundedBoxGeo args={[0.055, 0.04, 0.095]} radius={0.015} />
      </mesh>
    </group>
  </group>
);

export const Traveller3D: React.FC<{ t: number }> = ({ t }) => {
  const w = walkerAt(t);
  const mats = useMemo(
    () => ({
      cloak: paintMaterial({ color: PAINT.cloak, stroke: 26, bands: 4, rim: 0.85, outline: 0.5, seed: 2, side: THREE.DoubleSide }),
      scarf: paintMaterial({ color: PAINT.scarf, stroke: 30, bands: 4, rim: 0.8, outline: 0.4, seed: 4, side: THREE.DoubleSide }),
      skin: paintMaterial({ color: PAINT.skin, stroke: 30, bands: 3, rim: 0.6, outline: 0.3, seed: 6 }),
      trousers: paintMaterial({ color: "#4B5068", stroke: 30, bands: 3, rim: 0.5, outline: 0.4, seed: 8 }),
      boots: paintMaterial({ color: PAINT.boots, stroke: 30, bands: 3, rim: 0.4, outline: 0.3 }),
      roll: paintMaterial({ color: "#5F7F8F", stroke: 28, bands: 4, rim: 0.6, outline: 0.4, seed: 10 }),
      staff: paintMaterial({ color: "#7A5638", stroke: 30, bands: 3, rim: 0.6, outline: 0.3 }),
    }),
    [],
  );
  const cloakGeo = useMemo(() => {
    // shoulders → slightly flared hem, open at the bottom
    const pts = [
      [0.02, 0.6], [0.075, 0.585], [0.105, 0.55], [0.112, 0.48], [0.122, 0.38], [0.14, 0.27], [0.155, 0.2],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 28);
    g.scale(1, 1, 0.78);
    return g;
  }, []);

  const ph = w.phase * TAU;
  const walkAmt = w.walking ? 1 : 0;
  const swingL = Math.sin(ph) * 0.5 * walkAmt;
  const swingR = -swingL;
  const kneeL = Math.max(0, Math.sin(ph + 1.5)) * 0.8 * walkAmt;
  const kneeR = Math.max(0, Math.sin(ph + 1.5 + Math.PI)) * 0.8 * walkAmt;
  const bob = Math.abs(Math.cos(ph)) * 0.012 * walkAmt;
  const g = gust(t);
  // wind blows to +x and a little towards -z in the world; into the figure's local frame
  const windLocal = 0.55 * Math.cos(w.heading) + 0.2 * Math.sin(w.heading);
  const wSide = windLocal < 0 ? -1 : 1;

  const cape = useMemo(() => {
    const pts = Array.from({ length: 9 }, (_, k) => {
      const u = k / 8;
      return new THREE.Vector3(
        windLocal * 0.12 * u * u + Math.sin(t * 4.1 - u * 3) * 0.015 * u,
        0.575 - u * 0.4 + u * u * 0.06 * g,
        -0.085 - u * (0.06 + 0.07 * g) - u * u * 0.05 + Math.sin(t * 5.3 - u * 4) * 0.02 * u,
      );
    });
    return ribbon(pts, (u) => 0.19 + u * 0.1, new THREE.Vector3(1, 0, 0));
  }, [t, g, windLocal]);
  const scarfTail = useMemo(() => {
    const pts = Array.from({ length: 10 }, (_, k) => {
      const u = k / 9;
      return new THREE.Vector3(
        wSide * (0.045 + u * 0.16 * (0.7 + g * 0.5)),
        0.592 - u * 0.05 + Math.sin(t * 9 - u * 6) * 0.018 * u,
        -0.045 - u * 0.12 + Math.sin(t * 7 - u * 5) * 0.02 * u,
      );
    });
    return ribbon(pts, (u) => 0.042 * (1 - u * 0.35), new THREE.Vector3(0, 1, 0.2).normalize());
  }, [t, g, windLocal]);
  useEffect(() => () => cape.dispose(), [cape]);
  useEffect(() => () => scarfTail.dispose(), [scarfTail]);

  return (
    <group position={[w.x, w.y + bob, w.z]} rotation={[0, w.heading, 0]}>
      <group rotation={[0.06 * walkAmt, 0, 0]}>
        <Leg side={-1} swing={swingL} knee={kneeL} mats={mats} />
        <Leg side={1} swing={swingR} knee={kneeR} mats={mats} />
        <mesh geometry={cloakGeo} material={mats.cloak} castShadow receiveShadow />
        {/* cape: a cloth ribbon from the shoulders, swinging back in the wind */}
        <mesh geometry={cape} material={mats.cloak} castShadow />
        {/* bedroll across the shoulders */}
        <mesh position={[0, 0.585, -0.085]} rotation={[0, 0, Math.PI / 2]} material={mats.roll} castShadow>
          <capsuleGeometry args={[0.026, 0.12, 4, 12]} />
        </mesh>
        {/* head and hood */}
        <mesh position={[0, 0.645, 0.012]} material={mats.skin} castShadow>
          <sphereGeometry args={[0.056, 20, 16]} />
        </mesh>
        <mesh position={[0, 0.66, -0.006]} rotation={[-0.35, 0, 0]} material={mats.cloak} castShadow>
          <sphereGeometry args={[0.072, 20, 16, Math.PI * 0.08, Math.PI * 1.84, 0, Math.PI * 0.72]} />
        </mesh>
        {/* scarf: a knot at the neck and a tail streaming in the wind */}
        <mesh position={[0, 0.592, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={mats.scarf} castShadow>
          <torusGeometry args={[0.058, 0.022, 8, 20]} />
        </mesh>
        <mesh geometry={scarfTail} material={mats.scarf} castShadow />
        {/* right arm out of the cloak, holding the staff */}
        <group position={[0.11, 0.53, 0.02]} rotation={[-0.35 + Math.sin(ph) * 0.12 * walkAmt, 0, 0.2]}>
          <mesh position={[0, -0.07, 0]} material={mats.cloak} castShadow>
            <capsuleGeometry args={[0.03, 0.1, 4, 10]} />
          </mesh>
          <mesh position={[0, -0.15, 0.0]} material={mats.skin}>
            <sphereGeometry args={[0.026, 12, 10]} />
          </mesh>
          <mesh position={[0.0, -0.15, 0.0]} rotation={[0.35, 0, -0.2]} material={mats.staff} castShadow>
            <cylinderGeometry args={[0.011, 0.014, 0.82, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
