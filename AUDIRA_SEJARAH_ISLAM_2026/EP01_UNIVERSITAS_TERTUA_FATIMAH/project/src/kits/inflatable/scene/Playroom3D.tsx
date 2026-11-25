// INFLATABLE set: a candy-pink studio sweep with glossy vinyl toys. A deflated star puffs up (hook),
// a heart and a ball drop in and bounce, a ring inflates, a cloud floats down, then six balloon
// letters lie flat on the floor and inflate one by one, standing up as they fill: AUDIRA.

import React, { useMemo } from "react";
import * as THREE from "three";
import { GroundShadow } from "../../../core/polish/Drei.tsx";
import { balloonLetter, cloudShape, heartShape, puffy, puffyStar } from "../lib/shapes.ts";
import { bounce, hop, inflate, inflateScale, smooth, squashAfter } from "../core/motion.ts";
import { INFLATABLE_PALETTE as P } from "../lib/palette.ts";

/** Glossy vinyl: clearcoat over a saturated base, a hint of sheen at grazing angles. */
const Vinyl: React.FC<{ color: string }> = ({ color }) => (
  <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} clearcoatRoughness={0.12} sheen={0.25} sheenColor="#ffffff" sheenRoughness={0.5} />
);

/** Studio sweep: floor curving up into the back wall (no horizon line). */
const Sweep: React.FC = () => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // profile in (z, y): floor from the front to the cove, quarter circle, then the wall up
    for (let i = 0; i <= 10; i++) pts.push(new THREE.Vector2(6 - i * 0.75, 0));
    for (let i = 1; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      pts.push(new THREE.Vector2(-1.5 - Math.sin(a) * 2, 2 - Math.cos(a) * 2));
    }
    pts.push(new THREE.Vector2(-3.5, 9));
    const g = new THREE.PlaneGeometry(1, 1, 1, pts.length - 1);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    // light pink floor in front, deepening to lilac up the wall: the light has a shape, not a flat fill
    const near = new THREE.Color(P.sweep), far = new THREE.Color(P.sweepFar);
    const col = new Float32Array(p.count * 3);
    for (let r = 0; r < pts.length; r++)
      for (let c = 0; c < 2; c++) {
        const i = r * 2 + c;
        p.setXYZ(i, (c - 0.5) * 16, pts[r].y, pts[r].x);
        const k = Math.min(1, Math.pow(r / (pts.length - 1), 0.8) * 1.1);
        const cc = near.clone().lerp(far, k);
        col.set([cc.r, cc.g, cc.b], i * 3);
      }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
};

type ToyProps = { t: number };

/** Hook: the star lies flat and empty, then puffs up and hops. */
const Star: React.FC<ToyProps & { at: number }> = ({ t, at }) => {
  const geo = useMemo(() => puffyStar(0.6), []);
  const k = inflate(t, at, 0.6);
  const [sx, sy, sz] = inflateScale(k);
  const h = hop(t, at + 0.55, 0.35, 0.5);
  const [qx, qy] = squashAfter(t, h.land, 0.2);
  const stand = smooth((t - at - 0.2) / 0.5);
  const rest = 0.13 + 0.47 * stand; // half the thickness lying, the radius standing
  return (
    <group position={[STAR[0], rest * sz + h.y, STAR[2]]} rotation={[-Math.PI / 2 + (Math.PI / 2) * stand, 0, 0.25 * (1 - stand)]} scale={[sx * qx, sy * qy, sz * qx]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <Vinyl color={P.star} />
      </mesh>
    </group>
  );
};

/** Heart and ball: dropped in from above, bounce, squash on every landing. */
const Dropper: React.FC<ToyProps & { at: number; kind: "heart" | "ball"; x: number; z: number; h: number }> = ({ t, at, kind, x, z, h }) => {
  const geo = useMemo(() => (kind === "heart" ? puffy(heartShape(0.42), 0.42, 0.34) : new THREE.SphereGeometry(0.38, 64, 48)), [kind]);
  const rest = kind === "heart" ? 0.46 : 0.38;
  const b = bounce(t, at, h);
  const [qx, qy] = squashAfter(t, b.impact, 0.24);
  if (t < at) return null;
  return (
    <group position={[x, rest + b.y, z]} rotation={[0, kind === "heart" ? -0.35 : 0, kind === "heart" ? 0.1 : 0]}>
      <group position={[0, -rest, 0]} scale={[qx, qy, qx]}>
        <mesh geometry={geo} position={[0, rest, 0]} castShadow receiveShadow>
          <Vinyl color={kind === "heart" ? P.heart : P.ball} />
        </mesh>
        {kind === "ball" && (
          // beach-ball stripes: thin white bands
          <mesh position={[0, rest, 0]} rotation={[0, 0, 0.4]}>
            <torusGeometry args={[0.381, 0.03, 12, 96]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={1} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** Swim ring: inflates where it lies. */
const Ring: React.FC<ToyProps & { at: number }> = ({ t, at }) => {
  const k = inflate(t, at, 0.7);
  const tube = 0.04 + 0.15 * Math.max(0, k);
  return (
    <mesh position={[2.45, tube, -0.15]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <torusGeometry args={[0.42, tube, 32, 96]} />
      <Vinyl color={P.ring} />
    </mesh>
  );
};

/** Cloud: floats down from above and keeps bobbing. */
const Cloud: React.FC<ToyProps & { at: number }> = ({ t, at }) => {
  const geo = useMemo(() => puffy(cloudShape(0.45), 0.45, 0.36), []);
  const k = smooth((t - at) / 1.6);
  const y = 2.05 + (1 - k) * 2.2 + Math.sin(t * 1.4) * 0.05;
  return (
    <mesh geometry={geo} position={[0.55, y, -1.9]} rotation={[0, -0.25, Math.sin(t * 0.9) * 0.04]} castShadow>
      <Vinyl color={P.cloud} />
    </mesh>
  );
};

/** Toys stand behind and beside the letter row, so the letter close-ups are never blocked. */
export const STAR: [number, number, number] = [-1.45, 0, -1.4];

export const LETTER_SCALE = 0.48;
export const LETTER_R = 0.11;
export const WORD = "AUDIRA";
export const letterAt = (i: number) => 3.9 + i * 0.62;
export const WAVE_AT = 8.3;

/** Balloon letters: flat on the floor, then filling and standing up, one by one. */
const Letters: React.FC<ToyProps> = ({ t }) => {
  const letters = useMemo(() => WORD.split("").map((ch) => balloonLetter(ch, LETTER_SCALE, LETTER_R)), []);
  const gap = 0.06;
  const total = letters.reduce((a, l) => a + l.w, 0) + gap * (letters.length - 1);
  let x = -total / 2;
  return (
    <group position={[0, 0, -0.35]}>
      {letters.map((l, i) => {
        const cx = x + l.w / 2;
        x += l.w + gap;
        const at = letterAt(i);
        const k = inflate(t, at, 0.5);
        const stand = smooth((t - at - 0.1) / 0.45);
        const thick = 0.1 + 0.9 * Math.max(0, Math.min(1.15, k));
        const w = hop(t, WAVE_AT + i * 0.12, 0.2, 0.4);
        const [qx, qy] = squashAfter(t, w.land, 0.14);
        // lying: rotated flat, lifted by its tube radius; standing: base on the floor
        const lift = LETTER_R * thick;
        const zig = (i % 2 ? 0.18 : -0.06) * stand;
        return (
          <group key={i} position={[cx, lift + w.y, zig]} rotation={[-Math.PI / 2 + (Math.PI / 2) * stand, 0, 0]}>
            <group scale={[qx * (1 + 0.08 * (1 - stand)), qy, thick * qx]}>
              {l.geo.map((g, j) => (
                <mesh key={j} geometry={g} castShadow receiveShadow>
                  <Vinyl color={P.letters[i % P.letters.length]} />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
    </group>
  );
};

export const Playroom3D: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <Sweep />
    <GroundShadow scale={9} opacity={0.6} blur={2.2} far={1.6} color="#6A2F57" resolution={1024} />
    <Star t={t} at={0.35} />
    <Dropper t={t} at={1.45} kind="heart" x={0.45} z={-1.6} h={2.6} />
    <Dropper t={t} at={2.05} kind="ball" x={-0.3} z={-2.0} h={3.0} />
    <Ring t={t} at={2.7} />
    <Cloud t={t} at={2.9} />
    <Letters t={t} />
  </group>
);
