// Painted playing surfaces for every sport in specs.ts: one canvas texture per sport, drawn in
// metres from the official dimensions, cached for the whole render.
//
//   <SportField sport="football" />          // centred on the origin, y = 0, length along z
//   <SportField sport="basketball" glossy />  // clearcoat hardwood that reflects the arena lights

import React, { useMemo } from "react";
import * as THREE from "three";
import { prng } from "../materials/textures.ts";
import { SPORTS, TRACK, fieldExtent, type SportId, type SportSpec } from "./specs.ts";

type Ctx = CanvasRenderingContext2D;

const cache = new Map<SportId, THREE.CanvasTexture>();

/** Canvas texture of a sport's surface and lines (cached). */
export function fieldTexture(sport: SportId): THREE.CanvasTexture {
  let tex = cache.get(sport);
  if (tex) return tex;
  const s = SPORTS[sport];
  const W = s.width + s.margin * 2;
  const L = s.length + s.margin * 2;
  const ppm = Math.min(48, 4096 / Math.max(W, L));
  const c = document.createElement("canvas");
  c.width = Math.round(W * ppm);
  c.height = Math.round(L * ppm);
  const g = c.getContext("2d")!;
  g.translate(c.width / 2, c.height / 2);
  g.scale(ppm, ppm);
  // Lines never thinner than 1.6 px, so they survive mipmapping at a distance.
  const lw = Math.max(s.line, 1.6 / ppm);
  paintSurface(g, s, W, L, ppm);
  g.strokeStyle = s.colors.line;
  g.fillStyle = s.colors.line;
  g.lineWidth = lw;
  g.lineJoin = "round";
  PAINT[sport](g, s, lw);
  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(sport, tex);
  return tex;
}

// ---------------------------------------------------------------------------------------------
// Drawing helpers (metres; x right, +z down the canvas).
const line = (g: Ctx, x1: number, z1: number, x2: number, z2: number) => {
  g.beginPath();
  g.moveTo(x1, z1);
  g.lineTo(x2, z2);
  g.stroke();
};
const rect = (g: Ctx, x1: number, z1: number, x2: number, z2: number) => g.strokeRect(Math.min(x1, x2), Math.min(z1, z2), Math.abs(x2 - x1), Math.abs(z2 - z1));
/** Arc sampled as a polyline: point = (cx + r cos a, cz + r sin a), a from a0 to a1. */
const arc = (g: Ctx, cx: number, cz: number, r: number, a0: number, a1: number) => {
  const n = Math.max(12, Math.ceil(Math.abs(a1 - a0) * r * 4));
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    if (i === 0) g.moveTo(cx + r * Math.cos(a), cz + r * Math.sin(a));
    else g.lineTo(cx + r * Math.cos(a), cz + r * Math.sin(a));
  }
  g.stroke();
};
const dot = (g: Ctx, x: number, z: number, r: number) => {
  g.beginPath();
  g.arc(x, z, r, 0, Math.PI * 2);
  g.fill();
};
const ENDS = [1, -1] as const;

function paintSurface(g: Ctx, s: SportSpec, W: number, L: number, ppm: number) {
  const r = prng(s.id.length * 977 + 31);
  g.fillStyle = s.colors.out;
  g.fillRect(-W / 2, -L / 2, W, L);
  if (s.id === "football") {
    // Mowed stripes across the length (14 in the playing area), continued into the run-off.
    const band = s.length / 14;
    for (let i = -8; i < 8; i++) {
      g.fillStyle = i % 2 ? s.colors.alt : s.colors.field;
      g.fillRect(-W / 2, i * band, W, band);
    }
  } else if (s.id === "track") {
    // Red apron and lanes, grass infield.
    const outer = TRACK.radius + TRACK.lanes * TRACK.lane;
    capsule(g, outer + 1, TRACK.straight);
    g.fillStyle = s.colors.field;
    g.fill();
    capsule(g, TRACK.radius, TRACK.straight);
    g.fillStyle = s.colors.out;
    g.fill();
    const band = TRACK.straight / 10;
    g.save();
    capsule(g, TRACK.radius - 0.05, TRACK.straight);
    g.clip();
    for (let i = -8; i < 8; i++) {
      g.fillStyle = i % 2 ? "#459a3f" : "#3c8c37";
      g.fillRect(-W / 2, i * band, W, band);
    }
    g.restore();
  } else {
    g.fillStyle = s.colors.field;
    g.fillRect(-s.width / 2, -s.length / 2, s.width, s.length);
    if (s.id === "basketball") {
      // Maple planks along the length with per-board tone.
      const plank = 0.18;
      for (let x = -W / 2; x < W / 2; x += plank) {
        for (let z = -L / 2; z < L / 2; ) {
          const len = 1.2 + r() * 2.4;
          const k = r();
          g.fillStyle = k < 0.33 ? "#d6a066" : k < 0.66 ? "#dcab72" : "#cf985c";
          const inside = Math.abs(x) < s.width / 2 && Math.abs(z) < s.length / 2;
          if (inside) g.fillRect(x, z, plank - 0.01, len - 0.01);
          z += len;
        }
      }
    }
  }
  // Fine speckle so no surface reads as flat colour.
  const n = Math.min(60000, Math.round(W * L * 6));
  for (let i = 0; i < n; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(0,0,0,${0.05 + r() * 0.06})` : `rgba(255,255,255,${0.04 + r() * 0.05})`;
    const d = (1 + r() * 2) / ppm;
    g.fillRect(-W / 2 + r() * W, -L / 2 + r() * L, d, d);
  }
}

function capsule(g: Ctx, r: number, straight: number) {
  const h = straight / 2;
  g.beginPath();
  g.moveTo(r, -h);
  g.lineTo(r, h);
  g.arc(0, h, r, 0, Math.PI);
  g.lineTo(-r, -h);
  g.arc(0, -h, r, Math.PI, Math.PI * 2);
  g.closePath();
}

// ---------------------------------------------------------------------------------------------
const PAINT: Record<SportId, (g: Ctx, s: SportSpec, lw: number) => void> = {
  football: (g, s) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    rect(g, -hw, -hl, hw, hl);
    line(g, -hw, 0, hw, 0);
    arc(g, 0, 0, 9.15, 0, Math.PI * 2);
    dot(g, 0, 0, 0.2);
    for (const e of ENDS) {
      const gl = e * hl;
      rect(g, -20.16, gl, 20.16, gl - e * 16.5);
      rect(g, -9.16, gl, 9.16, gl - e * 5.5);
      const spot = gl - e * 11;
      dot(g, 0, spot, 0.2);
      const a = Math.acos(5.5 / 9.15);
      arc(g, 0, spot, 9.15, -e * (Math.PI / 2) - a, -e * (Math.PI / 2) + a);
      // Corner arcs
      arc(g, hw, gl, 1, e > 0 ? Math.PI : Math.PI / 2, e > 0 ? (Math.PI * 3) / 2 : Math.PI);
      arc(g, -hw, gl, 1, e > 0 ? -Math.PI / 2 : 0, e > 0 ? 0 : Math.PI / 2);
    }
  },
  futsal: (g, s) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    rect(g, -hw, -hl, hw, hl);
    line(g, -hw, 0, hw, 0);
    arc(g, 0, 0, 3, 0, Math.PI * 2);
    dot(g, 0, 0, 0.1);
    for (const e of ENDS) {
      const gl = e * hl;
      // Penalty area: quarter circles of 6 m around each post, joined by a 3 m line.
      arc(g, 1.5, gl, 6, 0, -e * (Math.PI / 2));
      arc(g, -1.5, gl, 6, Math.PI, Math.PI + e * (Math.PI / 2));
      line(g, -1.5, gl - e * 6, 1.5, gl - e * 6);
      dot(g, 0, gl - e * 6, 0.08);
      dot(g, 0, gl - e * 10, 0.08);
    }
  },
  basketball: (g, s) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    const accent = s.colors.accent;
    for (const e of ENDS) {
      const bl = e * hl;
      // Painted key under the lines
      g.fillStyle = accent;
      g.fillRect(-2.45, Math.min(bl, bl - e * 5.8), 4.9, 5.8);
      g.fillStyle = s.colors.line;
    }
    g.fillStyle = accent;
    g.beginPath();
    g.arc(0, 0, 1.8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = s.colors.line;
    rect(g, -hw, -hl, hw, hl);
    line(g, -hw, 0, hw, 0);
    arc(g, 0, 0, 1.8, 0, Math.PI * 2);
    for (const e of ENDS) {
      const bl = e * hl;
      const basket = bl - e * 1.575;
      const a = Math.acos(6.6 / 6.75);
      const zArc = basket - e * 6.75 * Math.sin(a);
      line(g, 6.6, bl, 6.6, zArc);
      line(g, -6.6, bl, -6.6, zArc);
      arc(g, 0, basket, 6.75, -e * a, -e * (Math.PI - a));
      rect(g, -2.45, bl, 2.45, bl - e * 5.8);
      arc(g, 0, bl - e * 5.8, 1.8, 0, Math.PI * 2);
      arc(g, 0, basket, 1.25, 0, -e * Math.PI);
    }
  },
  volleyball: (g, s) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    rect(g, -hw, -hl, hw, hl);
    line(g, -hw, 0, hw, 0);
    line(g, -hw, 3, hw, 3);
    line(g, -hw, -3, hw, -3);
  },
  badminton: (g, s) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    rect(g, -hw, -hl, hw, hl);
    line(g, 2.59, -hl, 2.59, hl);
    line(g, -2.59, -hl, -2.59, hl);
    for (const e of ENDS) {
      line(g, -hw, e * 1.98, hw, e * 1.98);
      line(g, -hw, e * 5.94, hw, e * 5.94);
      line(g, 0, e * 1.98, 0, e * hl);
    }
  },
  tennis: (g, s, lw) => {
    const hw = s.width / 2;
    const hl = s.length / 2;
    rect(g, -hw, -hl, hw, hl);
    line(g, 4.115, -hl, 4.115, hl);
    line(g, -4.115, -hl, -4.115, hl);
    for (const e of ENDS) {
      line(g, -4.115, e * 6.4, 4.115, e * 6.4);
      line(g, 0, e * hl, 0, e * (hl - 0.1));
      g.lineWidth = lw * 2;
      line(g, -hw, e * hl, hw, e * hl);
      g.lineWidth = lw;
    }
    line(g, 0, -6.4, 0, 6.4);
  },
  track: (g, s) => {
    for (let i = 0; i <= TRACK.lanes; i++) {
      capsule(g, TRACK.radius + i * TRACK.lane, TRACK.straight);
      g.stroke();
    }
    // Finish line across the home straight, with lane numbers.
    const z = -TRACK.straight / 2;
    const x0 = TRACK.radius;
    const x1 = TRACK.radius + TRACK.lanes * TRACK.lane;
    g.lineWidth = 0.05;
    line(g, x0, z, x1, z);
    g.font = "700 0.7px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let i = 0; i < TRACK.lanes; i++) {
      g.save();
      g.translate(x0 + (i + 0.5) * TRACK.lane, z + 2.2);
      g.rotate(Math.PI);
      g.fillText(String(i + 1), 0, 0);
      g.restore();
    }
    // Football pitch lines in the infield (most stadium tracks have one).
    g.globalAlpha = 0.85;
    g.lineWidth = 0.12;
    rect(g, -34, -52.5, 34, 52.5);
    line(g, -34, 0, 34, 0);
    arc(g, 0, 0, 9.15, 0, Math.PI * 2);
    g.globalAlpha = 1;
  },
};

// ---------------------------------------------------------------------------------------------
export const SportField: React.FC<{
  sport: SportId;
  /** Clearcoat hardwood / acrylic (indoor courts). Defaults on for indoor sports. */
  glossy?: boolean;
  position?: [number, number, number];
  rotation?: number;
}> = ({ sport, glossy, position = [0, 0, 0], rotation = 0 }) => {
  const tex = useMemo(() => fieldTexture(sport), [sport]);
  const { w, d } = fieldExtent(sport);
  const s = SPORTS[sport];
  const shine = glossy ?? s.indoor;
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshPhysicalMaterial
        map={tex}
        roughness={shine ? 0.32 : sport === "football" || sport === "track" ? 0.95 : 0.7}
        clearcoat={shine ? 0.55 : 0}
        clearcoatRoughness={0.4}
        metalness={0}
      />
    </mesh>
  );
};
