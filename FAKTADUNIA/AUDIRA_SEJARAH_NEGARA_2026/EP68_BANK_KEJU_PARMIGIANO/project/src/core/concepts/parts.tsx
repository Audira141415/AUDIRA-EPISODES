// Bagian kecil yang dipakai bersama komponen konsep: batang antara dua titik, panah, wajah,
// dan tekstur angka/roundel. Bukan visual utama; selalu bagian dari bentuk yang lebih besar.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH } from "../polish/Polish.tsx";
import type { MaterialName, V3 } from "./palette.ts";

/** Material padat dari resep POLISH. */
export const Solid: React.FC<{ material?: MaterialName; color: string; emissive?: string; emissiveIntensity?: number; side?: THREE.Side }> = ({
  material = "toyPlastic",
  color,
  emissive,
  emissiveIntensity,
  side,
}) => <meshPhysicalMaterial {...POLISH[material]} color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} side={side} />;

/** Material bercahaya (tidak kena tone mapping), untuk sinar dan gelombang. */
export const Glow: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 1 }) => (
  <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} toneMapped={false} depthWrite={opacity >= 1} />
);

const UP = new THREE.Vector3(0, 1, 0);
/** Rotasi yang membawa sumbu +y lokal ke arah `dir`. */
export function alignY(dir: V3): THREE.Euler {
  const v = new THREE.Vector3(...dir).normalize();
  return new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, v));
}

/** Silinder dari titik `a` ke titik `b`. */
export const Rod: React.FC<{ a: V3; b: V3; r: number; children: React.ReactNode; segments?: number }> = ({ a, b, r, children, segments = 10 }) => {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const rot = useMemo(() => alignY(d), [d[0], d[1], d[2]]);
  return (
    <mesh position={mid} rotation={rot} castShadow>
      <cylinderGeometry args={[r, r, len, segments]} />
      {children}
    </mesh>
  );
};

/** Kepala panah (kerucut) di `at`, menunjuk ke arah `dir`. */
export const ArrowHead: React.FC<{ at: V3; dir: V3; size: number; children: React.ReactNode }> = ({ at, dir, size, children }) => {
  const rot = useMemo(() => alignY(dir), [dir[0], dir[1], dir[2]]);
  return (
    <mesh position={at} rotation={rot}>
      <coneGeometry args={[size * 0.55, size, 18]} />
      {children}
    </mesh>
  );
};

/**
 * Wajah kartun (dua mata manik + senyum) di permukaan depan (+z). `spread` = jarak mata dari
 * tengah, `z` = kedalaman permukaan. Mata berkedip mengikuti jam film.
 */
export const Face: React.FC<{ f?: number; spread: number; z: number; size: number; y?: number; ink?: string; mood?: "happy" | "surprised" }> = ({
  f = 0,
  spread,
  z,
  size,
  y = 0,
  ink = "#15100d",
  mood = "happy",
}) => {
  const t = f / 60;
  const phase = t % 3.6;
  const blink = phase < 0.12 ? 0.15 : 1;
  return (
    <group position={[0, y, 0]}>
      {[1, -1].map((s) => (
        <group key={s} position={[s * spread, size * 0.6, z]}>
          <mesh scale={[size * 0.55, size * 0.75 * blink, size * 0.4]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial {...POLISH.glossyEye} color={ink} />
          </mesh>
          <mesh position={[size * 0.18, size * 0.3 * blink, size * 0.32]} scale={size * 0.16}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {mood === "happy" ? (
        <mesh position={[0, -size * 0.35, z]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[size * 0.7, size * 0.14, 8, 20, Math.PI]} />
          <meshPhysicalMaterial {...POLISH.toySkin} color="#7a2f2a" />
        </mesh>
      ) : (
        <mesh position={[0, -size * 0.5, z]} scale={[size * 0.35, size * 0.45, size * 0.2]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshPhysicalMaterial {...POLISH.toySkin} color="#7a2f2a" />
        </mesh>
      )}
    </group>
  );
};

/** Tekstur kanvas: angka/teks gelap di lingkaran putih (roundel balap, nomor dada). */
const decalCache = new Map<string, THREE.CanvasTexture>();
export function decalTexture(text: string, opts: { bg?: string; ink?: string; round?: boolean } = {}): THREE.Texture {
  const { bg = "#ffffff", ink = "#111111", round = true } = opts;
  const key = `${text}|${bg}|${ink}|${round}`;
  const hit = decalCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  if (round) {
    g.beginPath();
    g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = ink;
    g.lineWidth = 6;
    g.strokeRect(10, 10, 236, 236);
  }
  g.fillStyle = ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `900 ${text.length > 2 ? 104 : 150}px Arial, sans-serif`;
  g.fillText(text, 128, 138);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  decalCache.set(key, tex);
  return tex;
}
