// Chapter 2 set pieces: the seasonal flood channel (wadi) that al-Mahdi moved south, the off-centre
// marker, the view from Jabal Abu Qubais, and the first minarets.
import React, { useMemo } from "react";
import * as THREE from "three";
import { glowMat, Wash, type Rect } from "./parts.tsx";
import { HILLS, HILL_LAYER } from "./layout.ts";

const BEFORE = [new THREE.Vector3(-7, 0, 0.9), new THREE.Vector3(-3, 0, 2.0), new THREE.Vector3(0, 0, 1.75), new THREE.Vector3(3, 0, 2.05), new THREE.Vector3(7, 0, 1.1)];
const AFTER = [new THREE.Vector3(-7, 0, 3.6), new THREE.Vector3(-3, 0, 4.4), new THREE.Vector3(0, 0, 4.35), new THREE.Vector3(3, 0, 4.45), new THREE.Vector3(7, 0, 3.7)];

export const Wadi: React.FC<{ vis: number; shift: number; t: number }> = ({ vis, shift, t }) => {
  const mats = useMemo(() => Array.from({ length: 4 }, (_, i) => glowMat("#43c6ff", 1 + i)), []);
  if (vis <= 0.01) return null;
  const pts = BEFORE.map((p, i) => p.clone().lerp(AFTER[i], shift));
  const curve = new THREE.CatmullRomCurve3(pts);
  const N = 70;
  return (
    <group>
      {Array.from({ length: N }, (_, i) => {
        const u = i / N;
        const p = curve.getPointAt(u);
        const tan = curve.getTangentAt(u);
        const flow = 0.5 + 0.5 * Math.sin(u * 40 - t * 3.2);
        const m = mats[Math.min(3, Math.floor(flow * 4))];
        return (
          <mesh key={i} material={m} position={[p.x, 0.045, p.z]} rotation={[0, -Math.atan2(tan.z, tan.x), 0]} scale={[1, 1, vis]}>
            <boxGeometry args={[14 / N * 0.85, 0.01, 0.12]} />
          </mesh>
        );
      })}
      <Wash pos={[0, 0.04, pts[2].z]} size={[14, 0.5]} color="#43c6ff" opacity={0.12 * vis} />
    </group>
  );
};

/** Courtyard centre vs Ka'bah: an amber crosshair at the courtyard centre and a cyan ring at the Ka'bah. */
export const CentreMarks: React.FC<{ R: Rect; vis: number }> = ({ R, vis }) => {
  const amber = useMemo(() => glowMat("#ffb347", 3), []);
  const cyan = useMemo(() => glowMat("#5fe3f0", 3), []);
  if (vis <= 0.01) return null;
  const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  const s = vis;
  return (
    <group>
      <group position={[cx, 0.06, cz]} scale={[s, 1, s]}>
        <mesh material={amber}><boxGeometry args={[0.7, 0.01, 0.03]} /></mesh>
        <mesh material={amber}><boxGeometry args={[0.03, 0.01, 0.7]} /></mesh>
        <mesh material={amber} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.16, 0.19, 40]} /></mesh>
      </group>
      <mesh material={cyan} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={s}><ringGeometry args={[0.34, 0.37, 48]} /></mesh>
      {/* dashed link between the two centres */}
      {Array.from({ length: 8 }, (_, i) => {
        const k = (i + 0.5) / 8;
        return (
          <mesh key={i} material={amber} position={[cx * k, 0.06, cz * k]} scale={s}>
            <boxGeometry args={[0.04, 0.01, 0.04]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Viewpoint marker on top of Jabal Abu Qubais. */
export const HillMark: React.FC<{ vis: number }> = ({ vis }) => {
  const m = useMemo(() => glowMat("#ffd166", 3), []);
  if (vis <= 0.01) return null;
  const h = HILLS[0];
  const top = h.layers * HILL_LAYER;
  return (
    <group position={[h.x - 0.2, top, h.z]} scale={vis}>
      <mesh material={m} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.18, 0.22, 40]} /></mesh>
      <mesh material={m} position={[0, 0.25, 0]}><cylinderGeometry args={[0.008, 0.008, 0.5, 6]} /></mesh>
    </group>
  );
};
