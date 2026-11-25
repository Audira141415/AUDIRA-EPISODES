// The gold hizam band from the cover, animated: satin, cords and knots appear stitch by stitch as
// the progress X moves along the band; cotton padding runs just ahead of the gold and the white
// silk-screen print lies under everything. Ornament is geometric only (no letters).
import React, { useMemo } from "react";
import * as THREE from "three";
import { type Seg } from "./KiswahCover.tsx";
import { Laid, PAL, v3, type V3 } from "./kit.tsx";

const STAR_H = 0.26;
const STAR_R = STAR_H * Math.SQRT2;
const PITCH = 0.92;
const STITCH = 0.0115;
const TOP = 0.02;
const LOZ = 0.11;
type KS = Seg & { key: number };

const starHalfZ = (dx: number) => Math.max(Math.abs(dx) <= STAR_H ? STAR_H : 0, STAR_R - Math.abs(dx));
const starHalfX = (z: number) => Math.max(Math.abs(z) <= STAR_H ? STAR_H : 0, STAR_R - Math.abs(z));
export const bandHalfZ = (x: number) => {
  const i = Math.round(x / PITCH);
  return starHalfZ(x - i * PITCH);
};

function build(x0: number, x1: number) {
  const satin: KS[] = [];
  const cord: KS[] = [];
  const pad: KS[] = [];
  const chalk: KS[] = [];
  const knots: KS[] = [];
  const S = (a: THREE.Vector3, b: THREE.Vector3, r: number, key: number): KS => ({ a, b, r, key });
  const square = (cx: number, h: number, y: number, r: number, out: KS[], key: number) => {
    const A = [v3(cx - h, y, -h), v3(cx + h, y, -h), v3(cx + h, y, h), v3(cx - h, y, h)];
    const R = h * Math.SQRT2;
    const B = [v3(cx, y, -R), v3(cx + R, y, 0), v3(cx, y, R), v3(cx - R, y, 0)];
    for (const P of [A, B]) for (let k = 0; k < 4; k++) out.push(S(P[k], P[(k + 1) % 4], r, key));
  };
  const diamond = (cx: number, h: number, y: number, r: number, out: KS[], key: number) => {
    const P = [v3(cx, y, -h), v3(cx + h, y, 0), v3(cx, y, h), v3(cx - h, y, 0)];
    for (let k = 0; k < 4; k++) out.push(S(P[k], P[(k + 1) % 4], r, key));
  };
  const ring = (cx: number, rad: number, y: number, r: number, out: KS[], key: number) => {
    const n = 28;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 1) / n) * Math.PI * 2;
      out.push(S(v3(cx + Math.cos(a0) * rad, y, Math.sin(a0) * rad), v3(cx + Math.cos(a1) * rad, y, Math.sin(a1) * rad), r, key));
    }
  };
  for (let i = Math.floor(x0 / PITCH); i <= Math.ceil(x1 / PITCH); i++) {
    const cx = i * PITCH;
    const lx = cx + PITCH / 2;
    for (let z = -STAR_R + 0.012; z <= STAR_R - 0.012; z += 0.019) {
      const hx = starHalfX(z) - 0.006;
      if (hx > 0.02) pad.push(S(v3(cx - hx, 0.009, z), v3(cx + hx, 0.009, z), 0.0105, cx - STAR_R));
    }
    for (let z = -LOZ + 0.01; z <= LOZ - 0.01; z += 0.019) {
      const hx = LOZ - Math.abs(z) - 0.004;
      if (hx > 0.01) pad.push(S(v3(lx - hx, 0.009, z), v3(lx + hx, 0.009, z), 0.0105, lx - LOZ));
    }
    for (let x = cx - STAR_R + STITCH / 2; x <= cx + STAR_R; x += STITCH) {
      const hz = starHalfZ(x - cx);
      const j = Math.sin(x * 913.7) * 0.5 + Math.sin(x * 377.1) * 0.5;
      if (hz > 0.01) satin.push(S(v3(x - j * 0.0025, TOP + j * 0.0015, -hz), v3(x + j * 0.0025, TOP - j * 0.0015, hz), 0.0062, x));
    }
    for (let x = lx - LOZ + STITCH / 2; x <= lx + LOZ; x += STITCH) {
      const hz = LOZ - Math.abs(x - lx);
      if (hz > 0.006) satin.push(S(v3(x, TOP, -hz), v3(x, TOP, hz), 0.0062, x));
    }
    square(cx, STAR_H, TOP + 0.012, 0.0085, cord, cx + STAR_R);
    ring(cx, 0.1, TOP + 0.014, 0.007, cord, cx + STAR_R);
    diamond(lx, LOZ + 0.02, TOP + 0.01, 0.007, cord, lx + LOZ);
    for (let k = 0; k < 8; k++) knots.push(S(v3(cx + Math.cos((k / 8) * Math.PI * 2) * 0.05, TOP + 0.016, Math.sin((k / 8) * Math.PI * 2) * 0.05), v3(cx + Math.cos((k / 8) * Math.PI * 2) * 0.05, TOP + 0.03, Math.sin((k / 8) * Math.PI * 2) * 0.05), 0.011, cx + STAR_R));
    square(cx, STAR_H, 0.0015, 0.0028, chalk, -1e9);
    ring(cx, 0.1, 0.0015, 0.0024, chalk, -1e9);
    diamond(lx, LOZ + 0.02, 0.0015, 0.0028, chalk, -1e9);
  }
  // border cords: short pieces so they grow with X; knot line
  for (let x = x0; x < x1; x += 0.05) {
    for (const z of [-0.44, 0.44]) cord.push(S(v3(x, 0.012, z), v3(x + 0.052, 0.012, z), 0.015, x + 0.4));
    for (const z of [-0.395, 0.395]) cord.push(S(v3(x, 0.008, z), v3(x + 0.052, 0.008, z), 0.008, x + 0.3));
  }
  for (let x = x0; x < x1; x += 0.034) for (const z of [-0.4175, 0.4175]) knots.push(S(v3(x, 0.006, z), v3(x, 0.02, z), 0.011, x + 0.2));
  for (const z of [-0.44, 0.44, -0.395, 0.395]) chalk.push(S(v3(x0, 0.0015, z), v3(x1, 0.0015, z), 0.003, -1e9));
  return { satin, cord, pad, chalk, knots };
}

export const Band: React.FC<{ pos: V3; x0?: number; x1?: number; X: number; needle?: boolean; threads?: boolean }> = ({ pos, x0 = -6, x1 = 6, X, needle = true, threads = true }) => {
  const b = useMemo(() => build(x0, x1), [x0, x1]);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.17 }), []);
  const cordM = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.goldDeep, metalness: 1, roughness: 0.3 }), []);
  const cotton = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.cotton, roughness: 0.95 }), []);
  const chalkM = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.chalk, roughness: 0.9 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D9DDE3", metalness: 1, roughness: 0.18 }), []);
  const hz = bandHalfZ(X);
  const tip = v3(X + 0.012, 0, Math.min(hz, 0.43) + 0.01);
  const dir = v3(0.32, 0.86, -0.4).normalize();
  const eye = tip.clone().add(dir.clone().multiplyScalar(0.42));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const mid = tip.clone().add(dir.clone().multiplyScalar(0.21));
  const threadSegs: Seg[] = threads
    ? [
        { a: eye, b: v3(X + 1.6, 4.4, -3.2), r: 0.0042 },
        { a: v3(X + 0.4, 0.012, -0.44), b: v3(X + 2.4, 4.4, -4.2), r: 0.0048 },
        { a: v3(X + 0.4, 0.012, 0.44), b: v3(X + 3.0, 4.4, -3.0), r: 0.0048 },
      ]
    : [];
  return (
    <group position={pos}>
      <Laid segs={b.chalk} material={chalkM} upto={1e9} cast={false} />
      <Laid segs={b.pad} material={cotton} upto={X + 0.95} />
      <Laid segs={b.satin} material={gold} upto={X} />
      <Laid segs={b.cord} material={cordM} upto={X} />
      <Laid segs={b.knots} material={gold} upto={X} />
      {threadSegs.length > 0 && <Laid segs={threadSegs.map((s, i) => ({ ...s, key: i }))} material={gold} upto={99} />}
      {needle && (
        <>
          <Laid segs={[{ a: v3(X, TOP, Math.min(hz, 0.43)), b: tip.clone().add(v3(0, 0.01, 0)), r: 0.0045, key: 0 }]} material={gold} upto={1} />
          <mesh position={mid} quaternion={q} castShadow>
            <cylinderGeometry args={[0.01, 0.002, 0.42, 16]} />
            <primitive object={steel} attach="material" />
          </mesh>
        </>
      )}
    </group>
  );
};
