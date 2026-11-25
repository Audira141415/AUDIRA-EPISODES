// Plasticine look for EP03: thumbprint bump texture, a material cache per colour, and lumpy hand-rolled primitives.
import * as THREE from "three";

const hashN = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Deterministic thumbprint map: overlapping patches of concentric ridges plus soft knead noise. */
let printTex: THREE.DataTexture | null = null;
export const thumbprints = () => {
  if (printTex) return printTex;
  const W = 256;
  const data = new Uint8Array(W * W * 4);
  const prints = Array.from({ length: 22 }, (_, i) => ({
    x: hashN(i * 3 + 1) * W, y: hashN(i * 5 + 2) * W, r: 22 + hashN(i * 7 + 3) * 30,
    sx: 0.75 + hashN(i * 11) * 0.5, freq: 1.7 + hashN(i * 13) * 0.6,
  }));
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      let v = 0.5;
      // soft kneading lumps (wrapped sines keep the tile seamless)
      v += 0.09 * Math.sin((x / W) * Math.PI * 6 + Math.sin((y / W) * Math.PI * 4) * 1.4) * Math.sin((y / W) * Math.PI * 4 + 0.7);
      v += 0.05 * Math.sin((x / W) * Math.PI * 14 + (y / W) * Math.PI * 10);
      for (const p of prints) {
        for (const ox of [-W, 0, W])
          for (const oy of [-W, 0, W]) {
            const dx = (x - p.x - ox) * p.sx, dy = y - p.y - oy;
            const d = Math.hypot(dx, dy);
            if (d > p.r) continue;
            const win = 1 - d / p.r;
            v += 0.22 * win * win * Math.sin(d * p.freq);
          }
      }
      const c = Math.max(0, Math.min(255, Math.round(v * 255)));
      const o = (y * W + x) * 4;
      data[o] = data[o + 1] = data[o + 2] = c;
      data[o + 3] = 255;
    }
  printTex = new THREE.DataTexture(data, W, W, THREE.RGBAFormat);
  printTex.wrapS = printTex.wrapT = THREE.RepeatWrapping;
  printTex.magFilter = THREE.LinearFilter;
  printTex.minFilter = THREE.LinearMipmapLinearFilter;
  printTex.generateMipmaps = true;
  printTex.needsUpdate = true;
  return printTex;
};

const mats = new Map<string, THREE.MeshStandardMaterial>();
/** Plasticine material per colour (cached). `bump` scales the thumbprint relief, `rough` the sheen. */
export const clay = (color: string, bump = 1, rough = 0.78, emissive?: string, emissiveIntensity = 0) => {
  const key = `${color}|${bump}|${rough}|${emissive ?? ""}|${emissiveIntensity}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: rough,
      metalness: 0,
      bumpMap: bump > 0 ? thumbprints() : null,
      bumpScale: 1.4 * bump,
      emissive: emissive ? new THREE.Color(emissive) : new THREE.Color("#000000"),
      emissiveIntensity,
    });
    mats.set(key, m);
  }
  return m;
};

/** Glossy bead for eyes and noses. */
export const bead = (color = "#1d1816") => clay(color, 0, 0.18);

const geos = new Map<string, THREE.BufferGeometry>();
/** Hand-rolled sphere: unit radius with slight deterministic lumps (seeded), cached. */
export const lump = (seed = 0, amount = 0.035, seg = 28) => {
  const key = `s${seed}|${amount}|${seg}`;
  let g = geos.get(key);
  if (!g) {
    const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const a = hashN(seed + 1) * 6, b = hashN(seed + 2) * 6, c = hashN(seed + 3) * 6;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n = Math.sin(x * 3.1 + a) * Math.sin(y * 2.7 + b) * Math.sin(z * 3.3 + c) + 0.5 * Math.sin(x * 5.3 + y * 4.1 + c);
      const k = 1 + amount * n;
      pos.setXYZ(i, x * k, y * k, z * k);
    }
    geo.computeVertexNormals();
    g = geo;
    geos.set(key, g);
  }
  return g;
};

/** Soft capsule (radius 1, straight length `len`) along +Y, centred. */
export const capsule = (len: number) => {
  const key = `c${len.toFixed(3)}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.CapsuleGeometry(1, len, 8, 18);
    geos.set(key, g);
  }
  return g;
};

export const cyl = (rTop: number, rBot: number, h: number, seg = 24) => {
  const key = `y${rTop}|${rBot}|${h}|${seg}`;
  let g = geos.get(key);
  if (!g) {
    g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1);
    geos.set(key, g);
  }
  return g;
};

/** Rounded box (hand-pressed slab). */
export const slab = (w: number, h: number, d: number, r = 0.06) => {
  const key = `b${w}|${h}|${d}|${r}`;
  let g = geos.get(key);
  if (!g) {
    const shape = new THREE.Shape();
    const x0 = -w / 2, y0 = -d / 2, rr = Math.min(r, w / 2, d / 2);
    shape.moveTo(x0 + rr, y0);
    shape.lineTo(x0 + w - rr, y0);
    shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr);
    shape.lineTo(x0 + w, y0 + d - rr);
    shape.quadraticCurveTo(x0 + w, y0 + d, x0 + w - rr, y0 + d);
    shape.lineTo(x0 + rr, y0 + d);
    shape.quadraticCurveTo(x0, y0 + d, x0, y0 + d - rr);
    shape.lineTo(x0, y0 + rr);
    shape.quadraticCurveTo(x0, y0, x0 + rr, y0);
    const bev = Math.min(r, h / 2.2);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.001, h - bev * 2), bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.9, bevelSegments: 4, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -h / 2 + bev, 0);
    geo.computeVertexNormals();
    // planar UVs so the thumbprint map reads on every face
    const p = geo.attributes.position as THREE.BufferAttribute;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      uv[i * 2] = (p.getX(i) + p.getZ(i) * 0.7) * 0.9;
      uv[i * 2 + 1] = (p.getY(i) + p.getZ(i) * 0.4) * 0.9;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g = geo;
    geos.set(key, g);
  }
  return g;
};

export const C = {
  grass: "#7fa653",
  grassDeep: "#5f8a42",
  grassLight: "#a3c46a",
  path: "#d9b98a",
  table: "#8a5a3a",
  tableDark: "#5e3b26",
  wood: "#a8703f",
  woodDark: "#6e4526",
  barnRed: "#c2483a",
  roof: "#7a3b2e",
  cream: "#f4ead6",
  hay: "#e6be5a",
  hayDark: "#c99a37",
  water: "#5fb3c4",
  waterDeep: "#3f8ea3",
  stone: "#b9b1a4",
  leaf: "#6f9d48",
  leafDark: "#4f7d38",
  trunk: "#7a5236",
  // characters
  pup: "#e9b071",
  pupLight: "#fbe2bf",
  pupEar: "#9c5f34",
  oldDog: "#9b9590",
  oldDogLight: "#d9d4cc",
  horse: "#8c5532",
  horseDark: "#4a2c1b",
  cow: "#f7f3ea",
  cowSpot: "#2c2826",
  cowPink: "#eea3a3",
  sheepWool: "#f8f4ec",
  sheepFace: "#2f2a28",
  hen: "#fbf6ec",
  henComb: "#d8392f",
  beak: "#f0a531",
  cat: "#e98a3c",
  catStripe: "#b65d22",
  skin: "#e5ac82",
  overalls: "#4d74a8",
  shirt: "#d9573f",
  straw: "#e8c46a",
  strawDark: "#c79a3e",
  boot: "#4b3324",
  ink: "#1d1816",
  white: "#fbfaf6",
  tear: "#8fd3f2",
};
