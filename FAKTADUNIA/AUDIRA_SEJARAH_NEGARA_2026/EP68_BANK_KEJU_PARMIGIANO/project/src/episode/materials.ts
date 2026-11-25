// EP59 WORLDFORGE: realistic miniature materials (procedural wood grain, stone, snow, ice).
// Replaces the FELTCRAFT felt/yarn recipes. Textures are grayscale detail maps multiplied with the colour.
import * as THREE from "three";

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

const texCache = new Map<string, THREE.CanvasTexture>();
const make = (key: string, draw: (g: CanvasRenderingContext2D, s: number) => void, size = 512) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  draw(cv.getContext("2d")!, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
};

/** Log/plank wood: horizontal boards with seams, long grain streaks and a few knots. */
export const woodGrain = () =>
  make("wood", (g, s) => {
    const r = rng(17);
    g.fillStyle = "#d8d8d8";
    g.fillRect(0, 0, s, s);
    const boards = 8;
    const bh = s / boards;
    for (let b = 0; b < boards; b++) {
      const base = 200 + r() * 40;
      g.fillStyle = `rgb(${base},${base},${base})`;
      g.fillRect(0, b * bh, s, bh);
      for (let i = 0; i < 70; i++) {
        const y = b * bh + r() * bh;
        const v = base - 30 - r() * 60;
        g.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.35})`;
        g.lineWidth = 0.6 + r() * 1.6;
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= s; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + b) * 1.5 + (r() - 0.5) * 1.2);
        g.stroke();
      }
      if (r() > 0.4) {
        const kx = r() * s;
        const ky = b * bh + bh * (0.3 + r() * 0.4);
        for (let k = 0; k < 4; k++) {
          g.strokeStyle = `rgba(90,90,90,${0.5 - k * 0.1})`;
          g.lineWidth = 1.2;
          g.beginPath();
          g.ellipse(kx, ky, 4 + k * 4, 2 + k * 2, 0, 0, Math.PI * 2);
          g.stroke();
        }
      }
      g.fillStyle = "rgba(40,40,40,0.85)";
      g.fillRect(0, b * bh, s, 2.5);
    }
  });

/** Granite / rock: mottled speckle with soft blotches. */
export const stoneGrain = () =>
  make("stone", (g, s) => {
    const r = rng(29);
    g.fillStyle = "#c8c8c8";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const v = 150 + r() * 100;
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.beginPath();
      g.arc(r() * s, r() * s, 6 + r() * 30, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 9000; i++) {
      const v = r() > 0.5 ? 240 : 70;
      g.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.3})`;
      g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
    }
  });

/** Snow: near-white with fine crystalline grain and soft drifts. */
export const snowGrain = () =>
  make("snow", (g, s) => {
    const r = rng(41);
    g.fillStyle = "#f4f4f4";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 120; i++) {
      g.fillStyle = `rgba(215,220,232,${0.15 + r() * 0.2})`;
      g.beginPath();
      g.ellipse(r() * s, r() * s, 20 + r() * 60, 8 + r() * 20, r() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 6000; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.8)" : "rgba(190,198,215,0.35)";
      g.fillRect(r() * s, r() * s, 1, 1);
    }
  });

const repeated = (tex: THREE.CanvasTexture, rep: number) => {
  if (rep === 1) return tex;
  const key = `${tex.uuid}-${rep}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = tex.clone();
  c.needsUpdate = true;
  c.repeat.set(rep, rep);
  texCache.set(key, c);
  return c;
};

export type Kind = "wood" | "stone" | "snow" | "paint" | "metal";
/** Pick a surface from the colour: warm browns = wood, very light = snow/plaster, greys = stone. */
export const kindOf = (color: string): Kind => {
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(color).getHSL(hsl);
  if (hsl.l > 0.82 && hsl.s < 0.5) return "snow";
  if (hsl.h > 0.03 && hsl.h < 0.13 && hsl.s > 0.2 && hsl.l < 0.72) return "wood";
  if (hsl.s < 0.22) return "stone";
  // muted greens (lawn, moss) take the mottled stone map so grass is not a flat plastic sheet
  if (hsl.h > 0.18 && hsl.h < 0.4 && hsl.s < 0.45) return "stone";
  return "paint";
};

const cache = new Map<string, THREE.Material>();
/** Realistic miniature material. `repeat` tiles the detail map. */
export const real = (color: string, repeat = 2, kind: Kind = kindOf(color)) => {
  const key = `${color}-${repeat}-${kind}`;
  let m = cache.get(key);
  if (m) return m;
  const col = new THREE.Color(color);
  if (kind === "wood") {
    const t = repeated(woodGrain(), repeat);
    m = new THREE.MeshStandardMaterial({ color: col, map: t, bumpMap: t, bumpScale: 1.4, roughness: 0.78, metalness: 0 });
  } else if (kind === "stone") {
    const t = repeated(stoneGrain(), repeat);
    m = new THREE.MeshStandardMaterial({ color: col, map: t, bumpMap: t, bumpScale: 2.2, roughness: 0.92, metalness: 0 });
  } else if (kind === "snow") {
    const t = repeated(snowGrain(), repeat);
    m = new THREE.MeshPhysicalMaterial({ color: col, map: t, bumpMap: t, bumpScale: 0.8, roughness: 0.62, sheen: 0.4, sheenColor: new THREE.Color("#dfe8ff"), metalness: 0 });
  } else if (kind === "metal") {
    m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.7 });
  } else {
    m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0 });
  }
  cache.set(key, m);
  return m;
};

/** Low-poly displaced icosahedron: reads as a rough rock, not a ball. */
export const rockGeometry = (seed = 1) => {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const r = rng(seed);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const off = new Map<string, number>();
  for (let i = 0; i < pos.count; i++) {
    const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    if (!off.has(k)) off.set(k, 0.78 + r() * 0.36);
    const d = off.get(k)!;
    pos.setXYZ(i, pos.getX(i) * d, pos.getY(i) * d * 0.85, pos.getZ(i) * d);
  }
  geo.computeVertexNormals();
  return geo;
};
