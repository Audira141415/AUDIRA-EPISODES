// Procedural textures for the studio, all seeded canvases cached for the render (no photos):
//   clayDetail()       data map for the thrown piece: R = throwing-ring spiral, G = iron specks,
//                      B = finger streaks. Also used as its bump map.
//   letterTexture(s)   white brush lettering on transparent (painted on the glaze)
//   stampTexture(s)    incised stamp for terracotta (colour + bump)
//   terracottaTexture  matte fired clay with grog, fire flashing and an incised band (colour + bump)
//   brickTexture()     kiln bricks with soot; plasterTexture() studio wall; wheelHeadTexture() slip

import * as THREE from "three";

const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
export function noise2(x: number, y: number, s = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export const fbm = (x: number, y: number, s = 0, oct = 4) => {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x * f, y * f, s + i * 13);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
};
const rgb = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r * 255, c.g * 255, c.b * 255];
};
const cache = new Map<string, unknown>();
function cached<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
const tex = (c: HTMLCanvasElement, srgb: boolean) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};

/** Data map for the thrown piece (u around, v up). Wraps seamlessly around u. */
export const clayDetail = (size = 512) =>
  cached(`detail:${size}`, () => {
    const W = size * 2, H = size;
    const c = canvas(W, H);
    const g = c.getContext("2d")!;
    const img = g.createImageData(W, H);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const u = i / W, v = j / H;
        // Spiral throwing lines: the ring phase climbs once per turn (wrap-safe: integer pitch).
        const ph = v * 46 + u * 1 + (fbm(Math.cos(u * 6.283) * 2, v * 9, 3) - 0.5) * 1.4;
        const ring = 0.5 + 0.5 * Math.sin(ph * 6.283);
        const fine = noise2(Math.cos(u * 6.283) * 40 + 50, v * 300 + Math.sin(u * 6.283) * 40, 5);
        const R = 0.45 * ring + 0.55 * fine;
        // Iron specks: sparse dark dots (stoneware), different sizes.
        const sp = Math.pow(noise2(i * 0.35, j * 0.35, 9), 22) * 2.5 + Math.pow(noise2(i * 0.12, j * 0.12, 21), 24) * 4;
        const G = Math.min(1, sp);
        // Finger streaks running around the piece.
        const B = fbm(Math.cos(u * 6.283) * 1.5 + 4, v * 60 + Math.sin(u * 6.283) * 1.5, 11, 3);
        const o = (j * W + i) * 4;
        img.data[o] = R * 255;
        img.data[o + 1] = G * 255;
        img.data[o + 2] = B * 255;
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const t = tex(c, false);
    t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });

/** White brush lettering on transparent; each glyph carries dry-brush streaks. */
export const letterTexture = (word: string) =>
  cached(`letters:${word}`, () => {
    const W = 1024, H = 256;
    const c = canvas(W, H);
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 168px Georgia, 'Times New Roman', serif";
    const n = word.length;
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * W;
      g.save();
      g.translate(x, H / 2 + Math.sin(i * 2.1) * 4);
      g.rotate(Math.sin(i * 1.7) * 0.03);
      g.fillText(word[i], 0, 0);
      g.restore();
    }
    // Dry-brush: knock out thin horizontal streaks so it reads as a loaded brush, not a decal.
    const img = g.getImageData(0, 0, W, H);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const o = (j * W + i) * 4;
        if (!img.data[o + 3]) continue;
        const streak = noise2(i * 0.02, j * 0.6, 4);
        const k = streak < 0.22 ? 0.35 : 1;
        img.data[o + 3] *= k;
      }
    }
    g.putImageData(img, 0, 0);
    const t = tex(c, true);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });

/** Matte fired terracotta with grog, fire flashing and an optional incised band pattern. */
export const terracottaTexture = (base: string, seed: number, band = true) =>
  cached(`terra:${base}:${seed}:${band}`, () => {
    const W = 512, H = 256;
    const c = canvas(W, H), b = canvas(W, H);
    const g = c.getContext("2d")!, gb = b.getContext("2d")!;
    const img = g.createImageData(W, H), ib = gb.createImageData(W, H);
    const B = rgb(base);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const u = i / W, v = j / H;
        const cu = Math.cos(u * 6.283), su = Math.sin(u * 6.283);
        const flash = fbm(cu * 1.3 + seed, v * 2.2 + su * 1.3, seed, 4); // fire flashing (dark blush)
        const grog = Math.pow(noise2(i * 0.7, j * 0.7, seed + 3), 10);
        const fine = noise2(i * 0.25, j * 0.25, seed + 7);
        // Incised band: a zig-zag (tumpal-like triangles) between two lines around the shoulder.
        let cut = 0;
        if (band) {
          const yb = v - 0.66;
          if (Math.abs(yb - 0.055) < 0.006 || Math.abs(yb + 0.055) < 0.006) cut = 1;
          const zz = Math.abs(((u * 24) % 1) - 0.5) * 2; // 0..1 triangle wave
          if (Math.abs(yb) < 0.05 && Math.abs(yb - (zz - 0.5) * 0.09) < 0.006) cut = 1;
          if (Math.abs(v - 0.3) < 0.004 && noise2(u * 80, 1, seed) > 0.3) cut = Math.max(cut, 0.6);
        }
        const shade = 0.82 + flash * 0.34 - grog * 0.25 + (fine - 0.5) * 0.08 - cut * 0.32;
        const o = (j * W + i) * 4;
        // Flashing pulls toward a darker, browner red; grog toward pale specks.
        const pale = grog > 0.35 ? 0.25 : 0;
        img.data[o] = Math.min(255, B[0] * shade + pale * 80);
        img.data[o + 1] = Math.min(255, B[1] * (shade - (flash - 0.5) * 0.15) + pale * 60);
        img.data[o + 2] = Math.min(255, B[2] * (shade - (flash - 0.5) * 0.2) + pale * 40);
        img.data[o + 3] = 255;
        const h = 150 + (fine - 0.5) * 50 - grog * 40 - cut * 110;
        ib.data[o] = ib.data[o + 1] = ib.data[o + 2] = Math.max(0, Math.min(255, h));
        ib.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    gb.putImageData(ib, 0, 0);
    return { map: tex(c, true), bump: tex(b, false) };
  });

/** Incised stamp: the word pressed into a terracotta tile (colour darker in the letters + bump). */
export const stampTexture = (word: string, base: string) =>
  cached(`stamp:${word}:${base}`, () => {
    const W = 1024, H = 384;
    const mask = canvas(W, H);
    const m = mask.getContext("2d")!;
    m.fillStyle = "#000";
    m.fillRect(0, 0, W, H);
    m.strokeStyle = "#fff";
    m.lineWidth = 10;
    m.strokeRect(40, 40, W - 80, H - 80);
    m.fillStyle = "#fff";
    m.textAlign = "center";
    m.textBaseline = "middle";
    m.font = "bold 190px Georgia, 'Times New Roman', serif";
    m.fillText(word, W / 2, H / 2 + 8);
    const md = m.getImageData(0, 0, W, H).data;
    const c = canvas(W, H), b = canvas(W, H);
    const g = c.getContext("2d")!, gb = b.getContext("2d")!;
    const img = g.createImageData(W, H), ib = gb.createImageData(W, H);
    const Bc = rgb(base);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const o = (j * W + i) * 4;
        // Soften the mask edge with a 3-tap blur so the bump has a shoulder.
        const at = (x: number, y: number) => md[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4] / 255;
        const k = (at(i, j) * 2 + at(i - 3, j) + at(i + 3, j) + at(i, j - 3) + at(i, j + 3)) / 6;
        const fine = noise2(i * 0.3, j * 0.3, 2), grog = Math.pow(noise2(i * 0.8, j * 0.8, 6), 10);
        const flash = fbm(i / 300, j / 300, 8);
        const shade = 0.85 + flash * 0.25 + (fine - 0.5) * 0.1 - grog * 0.25 - k * 0.42;
        img.data[o] = Bc[0] * shade;
        img.data[o + 1] = Bc[1] * shade;
        img.data[o + 2] = Bc[2] * shade;
        img.data[o + 3] = 255;
        const h = 170 + (fine - 0.5) * 30 - k * 150;
        ib.data[o] = ib.data[o + 1] = ib.data[o + 2] = Math.max(0, Math.min(255, h));
        ib.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    gb.putImageData(ib, 0, 0);
    const out = { map: tex(c, true), bump: tex(b, false) };
    out.map.wrapS = out.map.wrapT = out.bump.wrapS = out.bump.wrapT = THREE.ClampToEdgeWrapping;
    return out;
  });

/** Kiln bricks: staggered courses, mortar, soot rising from the mouth (top of the texture darker). */
export const brickTexture = () =>
  cached("brick", () => {
    const W = 512, H = 512;
    const c = canvas(W, H), b = canvas(W, H);
    const g = c.getContext("2d")!, gb = b.getContext("2d")!;
    const img = g.createImageData(W, H), ib = gb.createImageData(W, H);
    const rows = 16, cols = 8;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const v = j / H, u = i / W;
        const row = Math.floor(v * rows);
        const uu = u * cols + (row % 2) * 0.5;
        const col = Math.floor(uu);
        const fu = uu - col, fv = v * rows - row;
        const mortar = fu < 0.05 || fv < 0.1 ? 1 : 0;
        const tone = hash(col, row, 3);
        const soot = Math.pow(1 - v, 1.2) * 0.7 * fbm(u * 4, v * 3, 2) + Math.pow(fbm(u * 6, v * 8, 5), 2) * 0.2;
        const fine = noise2(i * 0.3, j * 0.3, 7);
        let r = 112 + tone * 40, gg = 60 + tone * 22, bb = 42 + tone * 14;
        if (mortar) {
          r = 82; gg = 70; bb = 60;
        }
        const k = (1 - soot) * (0.85 + fine * 0.25);
        const o = (j * W + i) * 4;
        img.data[o] = r * k;
        img.data[o + 1] = gg * k;
        img.data[o + 2] = bb * k;
        img.data[o + 3] = 255;
        const h = mortar ? 70 : 180 + (fine - 0.5) * 40;
        ib.data[o] = ib.data[o + 1] = ib.data[o + 2] = h;
        ib.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    gb.putImageData(ib, 0, 0);
    return { map: tex(c, true), bump: tex(b, false) };
  });

/** Lime-plaster wall with clay smears and damp patches. */
export const plasterTexture = () =>
  cached("plaster", () => {
    const W = 512, H = 512;
    const c = canvas(W, H);
    const g = c.getContext("2d")!;
    const img = g.createImageData(W, H);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const u = i / W, v = j / H;
        const blot = fbm(u * 3, v * 3, 4, 5);
        const fine = noise2(i * 0.4, j * 0.4, 9);
        const damp = Math.max(0, 1 - v * 2.2) * fbm(u * 5, v * 2, 12);
        const k = 0.75 + blot * 0.4 + (fine - 0.5) * 0.08 - damp * 0.35;
        const o = (j * W + i) * 4;
        img.data[o] = 255 * k;
        img.data[o + 1] = 240 * k;
        img.data[o + 2] = 222 * k;
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return tex(c, true);
  });

/** Aluminium wheel head with concentric slip rings and smears (centre = middle of the canvas). */
export const wheelHeadTexture = () =>
  cached("wheelhead", () => {
    const S = 512;
    const c = canvas(S, S);
    const g = c.getContext("2d")!;
    const img = g.createImageData(S, S);
    const slip = rgb("#6A3A24");
    for (let j = 0; j < S; j++) {
      for (let i = 0; i < S; i++) {
        const x = i / S - 0.5, y = j / S - 0.5;
        const r = Math.hypot(x, y) * 2, a = Math.atan2(y, x);
        const lathe = 0.9 + 0.1 * Math.sin(r * 420);
        // Slip: thick inner band where the pot sat, flung streaks outward (they show the spin).
        const ring = r > 0.62 && r < 0.92 ? 0.55 * fbm(a * 3, r * 18, 5) : 0;
        const fling = r > 0.55 ? Math.pow(noise2(a * 12 + r * 4, r * 3, 9), 5) * 1.6 : 0;
        const k = Math.min(1, ring + fling);
        const m = 150 * lathe;
        const o = (j * S + i) * 4;
        img.data[o] = m + (slip[0] - m) * k;
        img.data[o + 1] = m + (slip[1] - m) * k;
        img.data[o + 2] = m + 4 + (slip[2] - m) * k;
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const t = tex(c, true);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
