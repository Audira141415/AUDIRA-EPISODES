// Canvas textures for the dark room. All deterministic (seeded), cached per key.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

const cache = new Map<string, THREE.Texture>();
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};
const memo = (key: string, make: () => THREE.Texture) => {
  if (typeof document === "undefined") return new THREE.Texture();
  const hit = cache.get(key);
  if (hit) return hit;
  const t = make();
  cache.set(key, t);
  return t;
};

/** One candle image as the pinhole projects it: an upside-down flame with a soft halo. */
export const invertedFlame = () =>
  memo("flame", () => {
    const [c, g] = canvas(256, 512);
    g.fillStyle = "#000";
    g.fillRect(0, 0, 256, 512);
    // halo
    const halo = g.createRadialGradient(128, 230, 4, 128, 230, 200);
    halo.addColorStop(0, "rgba(255,200,120,0.55)");
    halo.addColorStop(0.35, "rgba(255,160,70,0.18)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, 256, 512);
    // flame body, tip pointing DOWN (inverted image)
    const flame = (scale: number, color: string, blur: number) => {
      g.save();
      g.filter = `blur(${blur}px)`;
      g.fillStyle = color;
      g.beginPath();
      const cx = 128, top = 150, tip = 150 + 260 * scale, w = 62 * scale;
      g.moveTo(cx, tip);
      g.bezierCurveTo(cx + w * 0.4, tip - 90 * scale, cx + w, top + 90 * scale, cx + w * 0.75, top + 30 * scale);
      g.bezierCurveTo(cx + w * 0.45, top - 8 * scale, cx - w * 0.45, top - 8 * scale, cx - w * 0.75, top + 30 * scale);
      g.bezierCurveTo(cx - w, top + 90 * scale, cx - w * 0.4, tip - 90 * scale, cx, tip);
      g.fill();
      g.restore();
    };
    flame(1, "rgba(255,150,60,0.85)", 10);
    flame(0.78, "rgba(255,205,120,0.95)", 6);
    flame(0.48, "rgba(255,245,215,1)", 4);
    // wick stub above the flame (inverted: wick hangs from the base)
    g.filter = "blur(2px)";
    g.fillStyle = "rgba(80,40,20,0.9)";
    g.fillRect(124, 120, 8, 34);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Soft round falloff used for the beam footprint and dust. */
export const softDot = () =>
  memo("dot", () => {
    const [c, g] = canvas(128, 128);
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.4, "rgba(255,255,255,0.35)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  });

/**
 * Open-book page: a geometric ray diagram (lines through a point, circles, arcs) in iron-gall ink,
 * with abstract line blocks instead of real script (no invented text).
 */
export const diagramPage = (seed = 3) =>
  memo(`page${seed}`, () => {
    const [c, g] = canvas(1024, 768);
    const rnd = prng(seed);
    g.fillStyle = "#c9b48c";
    g.fillRect(0, 0, 1024, 768);
    // paper mottling
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(90,60,30,${rnd() * 0.05})`;
      const x = rnd() * 1024, y = rnd() * 768, r = 4 + rnd() * 26;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    // gutter shadow
    const gut = g.createLinearGradient(452, 0, 572, 0);
    gut.addColorStop(0, "rgba(60,40,20,0)");
    gut.addColorStop(0.5, "rgba(60,40,20,0.45)");
    gut.addColorStop(1, "rgba(60,40,20,0)");
    g.fillStyle = gut;
    g.fillRect(452, 0, 120, 768);
    g.strokeStyle = "rgba(45,28,16,0.85)";
    g.lineCap = "round";
    // left page: three rays crossing at a pinhole
    g.lineWidth = 3;
    const px = 250, py = 360;
    [[80, 220], [80, 360], [80, 500]].forEach(([x, y]) => {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(px + (px - x) * 0.8, py + (py - y) * 0.8);
      g.stroke();
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.stroke();
    });
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(250, 160);
    g.lineTo(250, 340);
    g.moveTo(250, 380);
    g.lineTo(250, 580);
    g.stroke();
    g.beginPath();
    g.moveTo(400, 160);
    g.lineTo(400, 580);
    g.stroke();
    // right page: eye-like concentric circles diagram
    g.lineWidth = 3;
    [120, 92, 60].forEach((r) => {
      g.beginPath();
      g.arc(770, 330, r, 0, Math.PI * 2);
      g.stroke();
    });
    g.beginPath();
    g.moveTo(600, 330);
    g.lineTo(940, 330);
    g.stroke();
    // abstract writing blocks (wavy strokes, not letters)
    g.lineWidth = 2.2;
    const lines = (x0: number, x1: number, y0: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const y = y0 + i * 26;
        g.beginPath();
        let x = x1;
        g.moveTo(x, y);
        while (x > x0) {
          const step = 10 + rnd() * 18;
          g.quadraticCurveTo(x - step / 2, y - 4 - rnd() * 6, x - step, y + rnd() * 3);
          x -= step;
          if (rnd() < 0.12) {
            x -= 14;
            g.moveTo(x, y);
          }
        }
        g.stroke();
      }
    };
    lines(70, 430, 620, 5);
    lines(600, 960, 490, 9);
    lines(600, 960, 70, 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });

/** Mashrabiya-style lattice (8-point stars) used as a gobo for the cold window light. */
export const latticeGobo = () =>
  memo("lattice", () => {
    const [c, g] = canvas(512, 512);
    g.fillStyle = "#000";
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#fff";
    const star = (cx: number, cy: number, r: number) => {
      g.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + Math.PI / 8;
        const rr = i % 2 === 0 ? r : r * 0.62;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
    };
    const n = 5, s = 512 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) star(s * (i + 0.5), s * (j + 0.5), s * 0.36);
    // soft vignette so the projected patch has no hard square edge
    const v = g.createRadialGradient(256, 256, 120, 256, 256, 256);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = v;
    g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

// ---------- noir map: Basrah, Kairo, Aswan (schematic coastlines, lon 24-58 E, lat 12-38 N) ----------
export const MAP_LON: [number, number] = [24, 58];
export const MAP_LAT: [number, number] = [12, 38];
/** Map texture u (0 left) / v (0 top) of a longitude / latitude. */
export const mapUV = (lon: number, lat: number): [number, number] => [
  (lon - MAP_LON[0]) / (MAP_LON[1] - MAP_LON[0]),
  (MAP_LAT[1] - lat) / (MAP_LAT[1] - MAP_LAT[0]),
];
export const CITY = { basrah: [47.8, 30.5], kairo: [31.25, 30.05], aswan: [32.9, 24.09] } as const;
export const NILE_PATH: [number, number][] = [
  [31.2, 31.4], [31.25, 30.05], [30.75, 28.1], [31.18, 27.18], [32.7, 26.15], [32.64, 25.7], [32.9, 24.09], [31.35, 21.8], [30.5, 19.2], [32.5, 15.6], [32.6, 12],
];

export const mapTexture = () =>
  memo("map", () => {
    const W = 1024, H = 784;
    const [c, g] = canvas(W, H);
    const P = (lon: number, lat: number): [number, number] => {
      const [u, v] = mapUV(lon, lat);
      return [u * W, v * H];
    };
    // land: aged paper
    g.fillStyle = "#cfc2a2";
    g.fillRect(0, 0, W, H);
    const rnd = prng(17);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${90 + rnd() * 40},${70 + rnd() * 30},${40 + rnd() * 20},${rnd() * 0.06})`;
      g.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 10, 2 + rnd() * 10);
    }
    const sea = (pts: number[][]) => {
      g.beginPath();
      pts.forEach(([lo, la], i) => {
        const [x, y] = P(lo, la);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      g.closePath();
      g.fillStyle = "#3c4a52";
      g.fill();
      g.strokeStyle = "rgba(25,22,18,0.85)";
      g.lineWidth = 3;
      g.stroke();
      // hatched coast ripples
      g.save();
      g.clip();
      g.strokeStyle = "rgba(200,215,220,0.12)";
      g.lineWidth = 1.5;
      for (let y = 0; y < H; y += 9) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y + 4);
        g.stroke();
      }
      g.restore();
    };
    sea([[24, 38], [24, 32.4], [25, 31.6], [29, 30.9], [31, 31.5], [32.3, 31.2], [34.2, 31.3], [34.9, 32.8], [35.5, 34.5], [35.9, 35.5], [36.2, 36.6], [34.5, 36.8], [32.5, 36.1], [30, 36.3], [28, 36.8], [27, 37.5], [26.5, 38]]);
    sea([[32.55, 29.95], [33.5, 27.5], [35.5, 23.9], [37.2, 21], [37.3, 19.6], [38.5, 18], [39.7, 15.6], [41.7, 13.3], [43.3, 12.6], [43.5, 12.7], [42.8, 15], [42.6, 16.8], [41, 19.5], [39.2, 21.5], [38.1, 24.1], [36.6, 25.8], [35.2, 28.0], [34.9, 29.5], [34.6, 28.1], [34.3, 27.8], [33.6, 28.3]]);
    sea([[43.3, 12.6], [45, 12.8], [48, 13.9], [51, 15.2], [52.2, 15.6], [55, 17], [56.8, 18.5], [58, 20.5], [58, 12], [43.3, 12]]);
    sea([[48.0, 29.95], [48.0, 29.4], [48.6, 28], [49.6, 26.6], [50.1, 26.4], [50.8, 25.5], [51.2, 26.1], [51.6, 25.3], [51.4, 24.4], [52.6, 24.2], [54.4, 24.3], [55.3, 25.3], [56.1, 26.1], [56.35, 26.3], [56.4, 25.0], [57.2, 23.9], [58, 23.6], [58, 25.6], [57.3, 25.8], [56.8, 27.1], [55.5, 26.7], [54.5, 26.6], [53, 27], [51.4, 27.9], [50.8, 28.9], [50.2, 29.9], [49.5, 30.1], [48.9, 30.3], [48.4, 30.2]]);
    // rivers
    const river = (pts: number[][], w: number) => {
      g.beginPath();
      pts.forEach(([lo, la], i) => {
        const [x, y] = P(lo, la);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      g.strokeStyle = "#3c4a52";
      g.lineWidth = w;
      g.lineJoin = "round";
      g.stroke();
    };
    river(NILE_PATH, 5);
    river([[47.8, 30.5], [46.3, 31.3], [44.4, 32.4], [43.5, 33.4], [40.1, 35.0], [38.0, 36.4]], 3.5);
    river([[47.8, 30.5], [47.4, 31.0], [44.4, 33.3], [43.1, 36.3], [42, 37.6]], 3.5);
    // grid
    g.strokeStyle = "rgba(60,45,30,0.22)";
    g.lineWidth = 1;
    for (let lo = 25; lo < 58; lo += 5) {
      const [x] = P(lo, 0);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H);
      g.stroke();
    }
    for (let la = 15; la < 38; la += 5) {
      const [, y] = P(0, la);
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    // cities + labels (typewriter)
    const city = (name: string, lo: number, la: number, dx: number, dy: number) => {
      const [x, y] = P(lo, la);
      g.fillStyle = "#1a120c";
      g.beginPath();
      g.arc(x, y, 9, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#1a120c";
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(x, y, 16, 0, Math.PI * 2);
      g.stroke();
      g.font = "bold 58px 'Courier New', monospace";
      g.fillStyle = "#1a120c";
      g.fillText(name, x + dx, y + dy);
    };
    city("BASRAH", ...CITY.basrah, -230, -34);
    city("KAIRO", ...CITY.kairo, -100, -34);
    city("ASWAN", ...CITY.aswan, 24, 14);
    g.font = "italic bold 40px 'Courier New', monospace";
    g.fillStyle = "rgba(30,22,14,0.8)";
    const [nx, ny] = P(29.0, 26.3);
    g.fillText("S. NIL", nx, ny);
    // worn edge
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(40,25,10,0.55)");
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });
export const MAP_SIZE: [number, number] = [0.62, 0.62 * (784 / 1024)];

/** Leather book spine with gold bands and a volume number (I-VII). */
export const spineTexture = (n: number) =>
  memo(`spine${n}`, () => {
    const [c, g] = canvas(128, 512);
    const rnd = prng(50 + n);
    const hues = ["#4a2016", "#3b2414", "#2f2a1c", "#46281a", "#36201a", "#3e2a18", "#4b1e18"];
    g.fillStyle = hues[(n - 1) % hues.length];
    g.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`;
      g.fillRect(rnd() * 128, rnd() * 512, 3, 3);
    }
    g.fillStyle = "#b8924a";
    for (const y of [40, 54, 440, 454]) g.fillRect(8, y, 112, 6);
    g.font = "bold 46px 'Times New Roman', serif";
    g.textAlign = "center";
    g.fillText(["I", "II", "III", "IV", "V", "VI", "VII"][n - 1], 64, 150);
    // abstract ornament (no script)
    g.strokeStyle = "#b8924a";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(64, 220);
    g.lineTo(92, 260);
    g.lineTo(64, 300);
    g.lineTo(36, 260);
    g.closePath();
    g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Wood planks with grain (box shell and the table under it). */
export const woodTexture = (seed = 5, base = "#6b4a2e", planks = 6) =>
  memo(`wood${seed}${base}${planks}`, () => {
    const [c, g] = canvas(1024, 1024);
    const rnd = prng(seed);
    const pw = 1024 / planks;
    for (let p = 0; p < planks; p++) {
      const shade = 0.82 + rnd() * 0.3;
      g.fillStyle = base;
      g.globalAlpha = 1;
      g.fillRect(p * pw, 0, pw, 1024);
      g.fillStyle = `rgba(${shade > 1 ? 255 : 0},${shade > 1 ? 220 : 0},${shade > 1 ? 160 : 0},${Math.abs(1 - shade) * 0.5})`;
      g.fillRect(p * pw, 0, pw, 1024);
      // grain: long wavy lines
      for (let k = 0; k < 26; k++) {
        const x0 = p * pw + rnd() * pw;
        g.strokeStyle = `rgba(30,18,8,${0.12 + rnd() * 0.2})`;
        g.lineWidth = 1 + rnd() * 2.5;
        g.beginPath();
        for (let y = 0; y <= 1024; y += 32) {
          const x = x0 + Math.sin(y * 0.01 + k) * 6 + Math.sin(y * 0.037 + p) * 3;
          if (y === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      // knot
      if (rnd() > 0.5) {
        const kx = p * pw + pw / 2, ky = rnd() * 1024;
        g.strokeStyle = "rgba(30,18,8,0.4)";
        for (let r = 4; r < 22; r += 5) {
          g.beginPath();
          g.ellipse(kx, ky, r * 0.7, r * 1.6, 0, 0, Math.PI * 2);
          g.stroke();
        }
      }
      // seam
      g.fillStyle = "rgba(10,6,3,0.85)";
      g.fillRect(p * pw, 0, 3, 1024);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  });

/** Anatomical-model sclera: cream with fine red veins. */
export const scleraTexture = () =>
  memo("sclera", () => {
    const [c, g] = canvas(1024, 512);
    const rnd = prng(88);
    g.fillStyle = "#efe6d2";
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 70; i++) {
      let x = rnd() * 1024, y = rnd() * 512;
      g.strokeStyle = `rgba(${150 + rnd() * 60},${30 + rnd() * 30},${30 + rnd() * 20},${0.25 + rnd() * 0.35})`;
      g.lineWidth = 0.8 + rnd() * 1.6;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 8; k++) {
        x += (rnd() - 0.5) * 40;
        y += (rnd() - 0.5) * 30;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });

/** Iris disc: hazel-brown radial fibres, dark limbal ring, black pupil. */
export const irisTexture = () =>
  memo("iris", () => {
    const [c, g] = canvas(512, 512);
    const rnd = prng(91);
    g.fillStyle = "#6a4426";
    g.beginPath();
    g.arc(256, 256, 256, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 260; i++) {
      const a = rnd() * Math.PI * 2;
      g.strokeStyle = rnd() > 0.5 ? `rgba(190,140,70,${0.3 + rnd() * 0.4})` : `rgba(40,22,10,${0.3 + rnd() * 0.4})`;
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      g.moveTo(256 + Math.cos(a) * 90, 256 + Math.sin(a) * 90);
      g.lineTo(256 + Math.cos(a + (rnd() - 0.5) * 0.1) * 245, 256 + Math.sin(a + (rnd() - 0.5) * 0.1) * 245);
      g.stroke();
    }
    g.strokeStyle = "rgba(15,8,4,0.95)";
    g.lineWidth = 22;
    g.beginPath();
    g.arc(256, 256, 244, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#050403";
    g.beginPath();
    g.arc(256, 256, 92, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
