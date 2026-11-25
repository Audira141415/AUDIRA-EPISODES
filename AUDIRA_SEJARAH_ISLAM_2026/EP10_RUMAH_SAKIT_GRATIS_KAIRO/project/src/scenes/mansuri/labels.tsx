import React, { useMemo } from "react";
import * as THREE from "three";
import { felt } from "./stitch";
import { M } from "./palette";

// Stitched felt tag with printed lettering: a dark felt plate, a dashed cream border and cream
// serif text drawn into a canvas texture. Never emissive (signs wash out under bloom).

const texCache = new Map<string, THREE.CanvasTexture>();
const tagTexture = (lines: string[], bg: string, fg: string, w: number, h: number) => {
  const key = `${lines.join("|")}-${bg}-${fg}-${w}x${h}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // felt speckle
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + ((i * 37) % 7) / 200})`;
    g.fillRect((i * 97) % w, (i * 53) % h, 2, 1);
  }
  g.setLineDash([h * 0.07, h * 0.05]);
  g.strokeStyle = fg;
  g.lineWidth = Math.max(3, h * 0.025);
  const m = h * 0.07;
  g.strokeRect(m, m, w - 2 * m, h - 2 * m);
  g.setLineDash([]);
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const n = lines.length;
  const fs = Math.min((h * 0.62) / n, (w * 0.86) / Math.max(...lines.map((l) => l.length * 0.62)));
  let size = fs;
  g.font = `bold ${size}px Georgia, 'Palatino Linotype', serif`;
  const widest = Math.max(...lines.map((l) => g.measureText(l).width));
  if (widest > w * 0.8) {
    size = (size * w * 0.8) / widest;
    g.font = `bold ${size}px Georgia, 'Palatino Linotype', serif`;
  }
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (n - 1) / 2) * size * 1.12));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
};

export const FeltTag: React.FC<{
  lines: string[];
  w: number;
  h: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  bg?: string;
  fg?: string;
}> = ({ lines, w, h, position, rotation, scale = 1, bg = M.plate, fg = M.paper }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tagTexture(lines, bg, fg, Math.round(512 * (w / h)), 512), roughness: 1 }), [lines, bg, fg, w, h]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={felt(bg, 0.6)} castShadow>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.04]} />
      </mesh>
      <mesh position={[0, 0, 0.022]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
};
