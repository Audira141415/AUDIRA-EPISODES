// Procedural textures (seeded canvases, cached per render tab; no photos):
//   plaqueRelief()  RGBA data texture for the cast plaque: R = height of the raised letters and
//                   border, G = concavity (inside corners where patina gathers), B = convexity
//                   (raised edges that get rubbed bright)
//   granite()       speckled plinth stone (colour + roughness)
//   sand()          foundry moulding sand (colour + bump)
//   floor()         dark foundry floor with sand dust

import * as THREE from "three";

const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
function noise2(x: number, y: number, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm = (x: number, y: number, s = 0, oct = 4) => {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise2(x * f, y * f, s + i * 13);
    f *= 2.03;
    a *= 0.5;
  }
  return v;
};

const cache = new Map<string, unknown>();
function memo<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

function canvasTex(size: number, px: (i: number, j: number) => [number, number, number], repeat = 1, srgb = true) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const [r, gg, b] = px(i, j);
      const o = (j * size + i) * 4;
      img.data[o] = r;
      img.data[o + 1] = gg;
      img.data[o + 2] = b;
      img.data[o + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Speckled granite: grey-black ground, white quartz and warm feldspar flecks. */
export const granite = () =>
  memo("granite", () => {
    const S = 512;
    const map = canvasTex(S, (i, j) => {
      const n = fbm(i / 40, j / 40, 3);
      const sp = hash(i, j, 9);
      const fl = hash(Math.floor(i / 3), Math.floor(j / 3), 4);
      let v = 70 + n * 50;
      let r = v, g = v * 0.97, b = v * 0.94;
      if (fl > 0.93) { r += 70; g += 62; b += 55; }
      else if (fl < 0.05) { r = 30; g = 28; b = 27; }
      else if (fl > 0.88) { r += 45; g += 22; b += 10; }
      r += (sp - 0.5) * 20; g += (sp - 0.5) * 20; b += (sp - 0.5) * 20;
      return [r, g, b];
    });
    const rough = canvasTex(S, (i, j) => {
      const v = 150 + fbm(i / 25, j / 25, 7) * 80 + (hash(i, j, 2) - 0.5) * 40;
      return [v, v, v];
    }, 1, false);
    return { map, rough };
  });

/** Moulding sand: fine warm grain with darker, damp clumps. */
export const sand = () =>
  memo("sand", () => {
    const S = 512;
    const col = (i: number, j: number) => 0.75 + fbm(i / 22, j / 22, 5) * 0.35 + (hash(i, j, 1) - 0.5) * 0.25;
    const map = canvasTex(S, (i, j) => {
      const v = col(i, j);
      return [124 * v, 101 * v, 80 * v];
    });
    const bump = canvasTex(S, (i, j) => {
      const v = 128 + (hash(i, j, 1) - 0.5) * 160 + (fbm(i / 10, j / 10, 8) - 0.5) * 80;
      return [v, v, v];
    }, 1, false);
    return { map, bump };
  });

/** Dark foundry floor: concrete with sand dust swept around. */
export const floor = () =>
  memo("floor", () => {
    const S = 512;
    const map = canvasTex(S, (i, j) => {
      const n = fbm(i / 60, j / 60, 11);
      const dust = Math.max(0, fbm(i / 18, j / 18, 12) - 0.45) * 2;
      const v = 34 + n * 22 + (hash(i, j, 3) - 0.5) * 10;
      return [v + dust * 50, v * 0.95 + dust * 40, v * 0.9 + dust * 30];
    }, 4);
    return { map };
  });

/** The cast plaque: AUDIRA in raised letters inside a raised, beaded border. */
export const plaqueRelief = (w = 1024, h = 384) =>
  memo(`plaque:${w}`, () => {
    const a = document.createElement("canvas");
    a.width = w;
    a.height = h;
    const g = a.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#fff";
    g.lineWidth = h * 0.05;
    g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
    g.lineWidth = h * 0.012;
    g.strokeRect(h * 0.14, h * 0.14, w - h * 0.28, h - h * 0.28);
    g.fillStyle = "#fff";
    for (let x = h * 0.2; x < w - h * 0.18; x += h * 0.06) {
      g.beginPath();
      g.arc(x, h * 0.2, h * 0.012, 0, Math.PI * 2);
      g.arc(x, h * 0.8, h * 0.012, 0, Math.PI * 2);
      g.fill();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${h * 0.4}px Georgia, 'Times New Roman', serif`;
    // Letter spacing by hand (canvas letterSpacing is not everywhere).
    const word = "AUDIRA";
    const step = h * 0.4;
    word.split("").forEach((ch, i) => g.fillText(ch, w / 2 + (i - (word.length - 1) / 2) * step, h * 0.53));
    // Two small leaves either side of the word.
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(w / 2 + s * w * 0.4, h * 0.5, h * 0.06, h * 0.025, s * 0.5, 0, Math.PI * 2);
      g.fill();
    }
    const blur = (px: number) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const gb = c.getContext("2d")!;
      gb.filter = `blur(${px}px)`;
      gb.drawImage(a, 0, 0);
      return gb.getImageData(0, 0, w, h).data;
    };
    const fine = blur(2.2);
    const wide = blur(12);
    const data = new Uint8Array(w * h * 4);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const s = fine[(j * w + i) * 4] / 255;
        const v = Math.min(1, Math.max(0, (s - 0.15) / 0.6));
        const hh = v * v * (3 - 2 * v);
        const hw = wide[(j * w + i) * 4] / 255;
        const o = ((h - 1 - j) * w + i) * 4;
        data[o] = Math.round(hh * 255);
        data[o + 1] = Math.round(Math.min(1, Math.max(0, (hw - hh) * 2.2)) * 255);
        data[o + 2] = Math.round(Math.min(1, Math.max(0, (hh - hw) * 2.2)) * 255);
        data[o + 3] = 255;
      }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return { tex, w, h };
  });
