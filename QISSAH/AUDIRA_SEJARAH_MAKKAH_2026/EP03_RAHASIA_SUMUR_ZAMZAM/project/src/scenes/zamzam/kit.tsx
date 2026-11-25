// Shared diorama pieces for the EP03 set pieces: plinths with section faces, pipes, simple props.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";

export type V3 = [number, number, number];

/** Diorama plinth: top surface at y = 0, section-coloured sides, bevelled edges. */
export const Plinth: React.FC<{ w: number; d: number; h?: number; top: string; side: string; seed?: number; front?: number }> = ({ w, d, h = 8, top, side, seed = 3, front = 0 }) => {
  const grain = useSurfaceGrain(seed, 0.4, 5);
  return (
    <group position={[0, 0, front]}>
      <mesh position={[0, -h / 2, -d / 2]} receiveShadow castShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.5} />
        <meshPhysicalMaterial {...POLISH.stone} color={side} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      <mesh position={[0, 0.02, -d / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 1, d - 1]} />
        <meshPhysicalMaterial {...POLISH.stone} color={top} bumpMap={grain} bumpScale={0.9} />
      </mesh>
    </group>
  );
};

/** Straight pipe between two points. */
export const Tube: React.FC<{ a: V3; b: V3; r: number; mat: THREE.Material; seg?: number }> = ({ a, b, r, mat, seg = 20 }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: va.clone().add(vb).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={mat} castShadow>
      <cylinderGeometry args={[r, r, len, seg]} />
    </mesh>
  );
};

/** Poly-line pipe with joint spheres. */
export const PipeRun: React.FC<{ pts: V3[]; r: number; mat: THREE.Material }> = ({ pts, r, mat }) => (
  <group>
    {pts.slice(1).map((p, i) => (
      <Tube key={i} a={pts[i]} b={p} r={r} mat={mat} />
    ))}
    {pts.map((p, i) => (
      <mesh key={`j${i}`} position={p} material={mat}>
        <sphereGeometry args={[r * 1.25, 16, 12]} />
      </mesh>
    ))}
  </group>
);

/** Point on a poly-line at 0..1 of its length. */
export function alongPath(pts: V3[], u: number): V3 {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? d / seg[i] : 0;
      const a = pts[i], b = pts[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

/** Clay water jar (siqayah, Zamzami). */
export const Jar: React.FC<{ p: V3; s?: number; color?: string }> = ({ p, s = 1, color = "#b9774a" }) => {
  const geo = useMemo(() => {
    const prof = [[0, 0], [0.32, 0.02], [0.5, 0.35], [0.52, 0.6], [0.36, 0.95], [0.2, 1.08], [0.24, 1.2], [0.22, 1.22]].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(prof, 28);
  }, []);
  return (
    <mesh position={p} scale={s} geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial {...POLISH.clay} color={color} />
    </mesh>
  );
};

/** A simple standing gazelle (gold), built from rounded parts. */
export const Gazelle: React.FC<{ p: V3; s?: number; rotY?: number; mat: THREE.Material }> = ({ p, s = 1, rotY = 0, mat }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.0, 0]} material={mat} castShadow>
      <capsuleGeometry args={[0.28, 0.9, 6, 14]} />
    </mesh>
    <group position={[0.55, 1.25, 0]} rotation={[0, 0, -0.6]}>
      <mesh position={[0, 0.3, 0]} material={mat} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 10]} />
      </mesh>
      <mesh position={[0.12, 0.66, 0]} rotation={[0, 0, 1.2]} material={mat} castShadow>
        <capsuleGeometry args={[0.11, 0.22, 4, 10]} />
      </mesh>
      {[-0.06, 0.06].map((z) => (
        <mesh key={z} position={[0.02, 0.86, z]} rotation={[0, 0, -0.35]} material={mat}>
          <coneGeometry args={[0.03, 0.42, 6]} />
        </mesh>
      ))}
    </group>
    {[[-0.38, 0.12], [-0.38, -0.12], [0.38, 0.12], [0.38, -0.12]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.42, z]} material={mat} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.8, 8]} />
      </mesh>
    ))}
  </group>
);

/** Seeded scatter helper. */
export const scatter = (n: number, seed: number, f: (r: () => number, i: number) => V3) => {
  const r = prng(seed);
  return Array.from({ length: n }, (_, i) => f(r, i));
};

/** Text on a plane (canvas texture), for plaques, dates and stamps inside the 3D world. */
export const TextPlate: React.FC<{
  text: string; sub?: string; p: V3; w: number; h: number; rot?: V3; bg?: string; fg?: string; font?: number; opacity?: number;
}> = ({ text, sub, p, w, h, rot = [0, 0, 0], bg = "#f6f1e8", fg = "#1d2326", font = 96, opacity = 1 }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * h) / w);
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 ${font}px Manrope, sans-serif`;
    g.fillText(text, c.width / 2, sub ? c.height * 0.4 : c.height / 2);
    if (sub) {
      g.font = `600 ${font * 0.52}px Manrope, sans-serif`;
      g.globalAlpha = 0.92;
      g.fillText(sub, c.width / 2, c.height * 0.74);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, sub, w, h, bg, fg, font]);
  return (
    <mesh position={p} rotation={rot} castShadow>
      <boxGeometry args={[w, h, 0.08]} />
      <meshPhysicalMaterial attach="material-0" color={bg} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
      <meshPhysicalMaterial attach="material-1" color={bg} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
      <meshPhysicalMaterial attach="material-2" color={bg} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
      <meshPhysicalMaterial attach="material-3" color={bg} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
      <meshPhysicalMaterial attach="material-4" map={tex} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
      <meshPhysicalMaterial attach="material-5" color={bg} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
};
