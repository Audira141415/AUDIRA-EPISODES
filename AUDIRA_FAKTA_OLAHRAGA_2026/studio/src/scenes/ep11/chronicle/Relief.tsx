import React, { useLayoutEffect, useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { buildRelief, fbm, kmPerPx, reliefColor, type Region, type Relief } from "./relief.ts";

const terrainMat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: false });

export const useRelief = (region: Region): Relief => useMemo(() => buildRelief(region), [region]);

/** The terrain grid + the painted sea plane (extended far past the region in the deep-sea colour). */
export const ReliefMap: React.FC<{ relief: Relief }> = ({ relief }) => {
  const seaMat = useMemo(() => new MeshStandardMaterial({ map: relief.sea, roughness: 0.82, metalness: 0.0 }), [relief]);
  return (
    <>
      <mesh geometry={relief.geo} material={terrainMat} receiveShadow castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={seaMat} receiveShadow>
        <planeGeometry args={[relief.size[0], relief.size[1]]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        <planeGeometry args={[relief.size[0] * 6, relief.size[1] * 6]} />
        <meshStandardMaterial color="#183c48" roughness={0.82} />
      </mesh>
    </>
  );
};

/**
 * A stratovolcano that can lose its summit: `collapse` 0 → 1 lowers the peak from km0 to km1 and opens a caldera.
 * Polar mesh on top of the terrain (give the terrain's own cone `skip: true`).
 */
export const Strato: React.FC<{ relief: Relief; lon: number; lat: number; km0: number; km1: number; radiusKm: number; calderaKm: number; collapse: number }> = ({
  relief, lon, lat, km0, km1, radiusKm, calderaKm, collapse,
}) => {
  const RINGS = 90, SEG = 160;
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array((RINGS + 1) * SEG * 3), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array((RINGS + 1) * SEG * 3), 3));
    const idx: number[] = [];
    for (let r = 0; r < RINGS; r++) for (let s = 0; s < SEG; s++) {
      const a = r * SEG + s, b = r * SEG + ((s + 1) % SEG), c = a + SEG, d = b + SEG;
      idx.push(a, b, c, b, d, c);
    }
    g.setIndex(idx);
    return g;
  }, []);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  const [wx, wz] = relief.toWorld(lon, lat);
  const kpp = kmPerPx(lat);
  const R = radiusKm / kpp;
  const base = relief.heightAt(lon, lat - 0.25) * 0.6;
  const c = Math.min(1, Math.max(0, collapse));
  const top = km0 + (km1 - km0) * c;
  const cal = (calderaKm / 2) * c;
  const pos = geo.attributes.position as BufferAttribute;
  const colA = geo.attributes.color as BufferAttribute;
  const kmAt = (rk: number, a: number) => {
    const u = rk / radiusKm;
    const gull = 1 - 0.1 * Math.pow(Math.abs(Math.sin(a * 13 + fbm(u * 4, a * 2, 2) * 4)), 3) * Math.min(1, u * 3);
    let k = km0 * Math.exp(-Math.pow(u, 1.05) * 2.6) * gull;
    k = Math.min(k, top + (km0 - top) * 0.0);
    // caldera: steep-walled bowl, flat floor 1 km below the new rim
    if (cal > 0 && rk < cal * 1.25) {
      const w = Math.min(1, Math.max(0, (cal * 1.25 - rk) / (cal * 0.35)));
      k -= w * (0.95 + 0.15 * fbm(a * 3, rk, 2)) * c;
    }
    return k;
  };
  for (let r = 0; r <= RINGS; r++) {
    const rk = Math.pow(r / RINGS, 1.6) * radiusKm;
    for (let s = 0; s < SEG; s++) {
      const a = (s / SEG) * Math.PI * 2;
      const km = kmAt(rk, a);
      const i = r * SEG + s;
      const vx = wx + (Math.cos(a) * rk) / kpp, vz = wz + (Math.sin(a) * rk) / kpp;
      // tuck the skirt under the real terrain (and under the sea off the coast)
      const ground = relief.heightAtWorld(vx, vz);
      const edge = Math.pow(r / RINGS, 3);
      const yCone = base + km * relief.yPerKm;
      const y = Math.max(yCone * (1 - edge) + (ground - 0.6) * edge, Math.min(ground - 0.05, yCone));
      pos.setXYZ(i, vx, y, vz);
      const dk = kmAt(rk + 0.5, a) - km;
      const [cr, cg, cb] = reliefColor(km + base / relief.yPerKm, Math.abs(dk) * 1.4, fbm(Math.cos(a) * rk * 0.3, Math.sin(a) * rk * 0.3, 3));
      const burn = cal > 0 && rk < cal * 1.3 ? 0.55 : 1;
      colA.setXYZ(i, cr * burn, cg * burn, cb * burn);
    }
  }
  pos.needsUpdate = true;
  colA.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  void R;
  return <mesh geometry={geo} material={terrainMat} castShadow receiveShadow />;
};

/** Expanding shock/sound ring on the sea surface (hidden behind land by depth). */
export const Ring: React.FC<{ at: [number, number]; r: number; opacity: number; color?: string; y?: number; width?: number }> = ({ at, r, opacity, color = "#f6e7c8", y = 0.25, width = 1 }) => {
  // per-instance opacity needs its own material
  const mat = useMemo(() => new MeshBasicMaterial({ color: new Color(color), transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending, toneMapped: false, fog: false }), [color]);
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  mat.opacity = opacity;
  if (opacity <= 0.001 || r <= 0) return null;
  const w = Math.min(0.5, (width * 1.4) / r);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[at[0], y, at[1]]} scale={[r, r, 1]} material={mat}>
      <ringGeometry args={[1 - w, 1, 180, 1]} />
    </mesh>
  );
};
