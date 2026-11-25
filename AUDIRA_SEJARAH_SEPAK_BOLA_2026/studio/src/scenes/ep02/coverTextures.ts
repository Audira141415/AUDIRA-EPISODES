// EP02 cover textures (canvas, drawn after Manrope is ready). Deterministic: no Math.random.
import * as THREE from "three";
import { MANROPE } from "../../core/type/fonts.ts";

const cache = new Map<string, THREE.CanvasTexture>();
const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

// seeded value noise for small irregularities
const prng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Front face of an era pedestal: year numerals, a small star, a hairline. */
export const plaqueTexture = (year: string, accent: string, empty = false, brand = false) =>
  make(`plaque-${year}-${empty}-${brand}`, 512, 512, (c) => {
    c.fillStyle = "#f1efea";
    c.fillRect(0, 0, 512, 512);
    // inset engraved panel
    c.strokeStyle = "rgba(31,36,38,0.16)";
    c.lineWidth = 3;
    c.strokeRect(34, 34, 444, 444);
    c.fillStyle = empty ? "#9aa0a2" : "#1f2426";
    c.font = `200 168px ${MANROPE}`;
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.fillText(year, 256, 300);
    c.fillStyle = accent;
    c.fillRect(186, 336, 140, 6);
    // star glyph or empty outline
    const star = (cx: number, cy: number, R: number, r: number) => {
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r : R;
        c.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      c.closePath();
    };
    star(256, 410, 34, 14);
    if (empty) {
      c.setLineDash([8, 7]);
      c.strokeStyle = "#9aa0a2";
      c.lineWidth = 4;
      c.stroke();
      c.setLineDash([]);
    } else {
      c.fillStyle = "#E9B400";
      c.fill();
    }
    if (brand) {
      c.fillStyle = "rgba(31,36,38,0.55)";
      c.font = `600 40px ${MANROPE}`;
      c.fillText("A U D I R A", 256, 118);
    }
  });

/** Equirect ball skins per era (approximate, stylised; no makers' marks). */
export const ballTexture = (era: "leather" | "leatherLight" | "telstar" | "ninety4" | "two002") =>
  make(`ball-${era}`, 1024, 512, (c) => {
    const W = 1024, H = 512;
    const r = prng(era.length * 97 + 11);
    if (era === "leather" || era === "leatherLight") {
      c.fillStyle = era === "leather" ? "#7a4a26" : "#a8723f";
      c.fillRect(0, 0, W, H);
      // laced 18-panel look: vertical bands with darker seams
      c.strokeStyle = "rgba(40,22,10,0.75)";
      c.lineWidth = 7;
      for (let i = 0; i <= 12; i++) {
        c.beginPath();
        for (let y = 0; y <= H; y += 8) {
          const x = (i * W) / 12 + Math.sin((y / H) * Math.PI * 2 + i) * 14;
          if (y === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
      }
      for (let j = 1; j < 3; j++) {
        c.beginPath();
        c.moveTo(0, (j * H) / 3);
        c.lineTo(W, (j * H) / 3);
        c.stroke();
      }
      // scuffs
      for (let k = 0; k < 220; k++) {
        c.fillStyle = `rgba(255,230,190,${0.03 + r() * 0.05})`;
        c.beginPath();
        c.arc(r() * W, r() * H, 2 + r() * 10, 0, Math.PI * 2);
        c.fill();
      }
      // lace
      c.fillStyle = "#e8d6b4";
      for (let k = 0; k < 6; k++) c.fillRect(W * 0.48, H * 0.36 + k * 13, 46, 6);
    } else if (era === "telstar") {
      c.fillStyle = "#f4f2ee";
      c.fillRect(0, 0, W, H);
      c.fillStyle = "#151719";
      const pent = (cx: number, cy: number, R: number, sx: number) => {
        c.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          c.lineTo(cx + R * Math.cos(a) * sx, cy + R * Math.sin(a));
        }
        c.closePath();
        c.fill();
      };
      // 12 pentagons laid out on the sphere (2 poles + 2 rings of 5)
      pent(W / 2, 14, 30, 6);
      pent(W / 2, H - 14, 30, 6);
      for (let i = 0; i < 5; i++) {
        pent(((i + 0.0) * W) / 5 + 40, H * 0.32, 52, 1.25);
        pent(((i + 0.5) * W) / 5 + 40, H * 0.68, 52, 1.25);
      }
      c.strokeStyle = "rgba(20,20,20,0.18)";
      c.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        c.beginPath();
        c.moveTo((i * W) / 20, 0);
        c.lineTo((i * W) / 20 + 30, H);
        c.stroke();
      }
    } else if (era === "ninety4") {
      c.fillStyle = "#f6f5f1";
      c.fillRect(0, 0, W, H);
      // triad motifs (generic)
      for (let i = 0; i < 6; i++) {
        const cx = (i * W) / 6 + 85, cy = i % 2 ? H * 0.35 : H * 0.65;
        for (let k = 0; k < 3; k++) {
          c.fillStyle = k === 1 ? "#1d4fb3" : "#1b1d20";
          c.beginPath();
          const a = (k * 2 * Math.PI) / 3;
          c.moveTo(cx, cy);
          c.arc(cx, cy, 58, a, a + 0.6);
          c.closePath();
          c.fill();
        }
      }
    } else {
      // 2002: white with gold flame shards and thin red lines (generic)
      c.fillStyle = "#f7f5ef";
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        const cx = (i * W) / 4 + 128, cy = i % 2 ? H * 0.32 : H * 0.68;
        c.fillStyle = "#d4a017";
        c.beginPath();
        c.moveTo(cx - 90, cy);
        c.quadraticCurveTo(cx, cy - 70, cx + 90, cy);
        c.quadraticCurveTo(cx, cy + 70, cx - 90, cy);
        c.fill();
        c.strokeStyle = "#c0262b";
        c.lineWidth = 6;
        c.beginPath();
        c.arc(cx, cy, 40, 0, Math.PI * 2);
        c.stroke();
      }
    }
  });

/** Pitch runner: mowed stripes, white side lines and a centre line. */
export const pitchTexture = () =>
  make("pitch", 256, 1024, (c) => {
    const r = prng(5);
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? "#2a9a4f" : "#33ab5b";
      c.fillRect(0, (i * 1024) / 16, 256, 1024 / 16 + 1);
    }
    for (let k = 0; k < 1600; k++) {
      c.fillStyle = `rgba(${r() < 0.5 ? "10,60,25" : "200,255,210"},${0.04 + r() * 0.05})`;
      c.fillRect(r() * 256, r() * 1024, 1.5, 3 + r() * 5);
    }
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.fillRect(10, 0, 7, 1024);
    c.fillRect(239, 0, 7, 1024);
  });

/** Soft round glow for halos (additive). */
export const glowTexture = () =>
  make("glow", 256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

/** AUDIRA engraving for the dark cup plinth. */
export const brandTexture = () =>
  make("brand", 512, 128, (c) => {
    c.fillStyle = "#1f2426";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#e9e4d8";
    c.font = `600 62px ${MANROPE}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("A U D I R A", 256, 60);
    c.fillStyle = "#2BD46A";
    c.fillRect(206, 104, 100, 4);
  });

/**
 * Film-only leather ball (1950s/60s): 18 laced panels in 6 columns x 3 rows with dark stitched
 * seams and a lace slit, plus a matching bump map (seams pressed in, panels domed, lace raised).
 * The cover keeps its own ballTexture so the approved still does not change.
 */
const leatherPanels = (c: CanvasRenderingContext2D, W: number, H: number, mode: "color" | "bump", light: boolean) => {
  const r = prng(light ? 71 : 53);
  const cols = 6, rows = 3;
  const pw = W / cols, ph = H / rows;
  c.fillStyle = mode === "color" ? (light ? "#a8723f" : "#7a4a26") : "#808080";
  c.fillRect(0, 0, W, H);
  const base = light ? [168, 114, 63] : [122, 74, 38];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const x0 = i * pw + (j % 2 ? pw / 2 : 0), y0 = j * ph;
      const g = c.createRadialGradient(x0 + pw / 2, y0 + ph / 2, 4, x0 + pw / 2, y0 + ph / 2, Math.max(pw, ph) * 0.62);
      if (mode === "color") {
        const v = (r() - 0.5) * 26;
        g.addColorStop(0, `rgb(${base[0] + 18 + v},${base[1] + 12 + v},${base[2] + 8 + v})`);
        g.addColorStop(1, `rgb(${base[0] - 14 + v},${base[1] - 10 + v},${base[2] - 6 + v})`);
      } else {
        g.addColorStop(0, "#c8c8c8");
        g.addColorStop(1, "#7a7a7a");
      }
      c.fillStyle = g;
      for (const dx of [0, -W, W]) c.fillRect(x0 + dx + 3, y0 + 3, pw - 6, ph - 6);
    }
  c.strokeStyle = mode === "color" ? "rgba(32,16,6,0.95)" : "#202020";
  c.lineWidth = mode === "color" ? 7 : 10;
  for (let j = 0; j <= rows; j++) {
    c.beginPath();
    c.moveTo(0, j * ph);
    c.lineTo(W, j * ph);
    c.stroke();
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i <= cols; i++) {
      const x = i * pw + (j % 2 ? pw / 2 : 0);
      c.beginPath();
      c.moveTo(x, j * ph);
      c.lineTo(x, (j + 1) * ph);
      c.stroke();
    }
  if (mode === "color") {
    c.fillStyle = "rgba(235,215,180,0.55)";
    for (let j = 0; j <= rows; j++) for (let x = 6; x < W; x += 16) c.fillRect(x, j * ph - 7, 6, 2);
  }
  const lx = W * 0.47, ly = H * 0.42;
  c.fillStyle = mode === "color" ? "#2a1608" : "#1a1a1a";
  c.fillRect(lx, ly, 22, 96);
  c.fillStyle = mode === "color" ? "#efe0c0" : "#f0f0f0";
  for (let k = 0; k < 7; k++) c.fillRect(lx - 14, ly + 6 + k * 13, 50, 6);
  if (mode === "color") {
    for (let k = 0; k < 260; k++) {
      c.fillStyle = `rgba(255,232,196,${0.03 + r() * 0.05})`;
      c.beginPath();
      c.arc(r() * W, r() * H, 2 + r() * 9, 0, Math.PI * 2);
      c.fill();
    }
  }
};
export const leatherBallTextures = (light: boolean) => {
  const bump = make(`leatherBump-${light}`, 1024, 512, (c) => leatherPanels(c, 1024, 512, "bump", light));
  bump.colorSpace = THREE.NoColorSpace;
  return { map: make(`leatherHD-${light}`, 1024, 512, (c) => leatherPanels(c, 1024, 512, "color", light)), bump };
};

/**
 * Film-only modern ball skins (1994, 2002): white synthetic panels with grey stitched seams
 * (pentagon/hexagon rhythm), bold era motifs, and a bump map that presses the seams in.
 */
const modernPanels = (c: CanvasRenderingContext2D, W: number, H: number, mode: "color" | "bump", era: "ninety4" | "two002") => {
  c.fillStyle = mode === "color" ? "#f6f5f1" : "#a0a0a0";
  c.fillRect(0, 0, W, H);
  const cols = 8, rows = 4, pw = W / cols, ph = H / rows;
  // panel seams: offset hex rhythm
  c.strokeStyle = mode === "color" ? "rgba(60,60,64,0.55)" : "#303030";
  c.lineWidth = mode === "color" ? 4 : 8;
  for (let j = 0; j < rows; j++)
    for (let i = -1; i <= cols; i++) {
      const cx = i * pw + (j % 2 ? pw / 2 : 0) + pw / 2, cy = j * ph + ph / 2;
      c.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 6 + (k * Math.PI) / 3;
        c.lineTo(cx + Math.cos(a) * pw * 0.56, cy + Math.sin(a) * ph * 0.62);
      }
      c.closePath();
      c.stroke();
    }
  if (mode === "bump") return;
  for (let i = 0; i < 4; i++) {
    const cx = (i * W) / 4 + W / 8, cy = i % 2 ? H * 0.3 : H * 0.7;
    if (era === "ninety4") {
      // generic triad: three black wedges with a blue ring
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
        c.fillStyle = "#17191c";
        c.beginPath();
        c.moveTo(cx, cy);
        c.arc(cx, cy, 92, a - 0.42, a + 0.42);
        c.closePath();
        c.fill();
      }
      c.strokeStyle = "#1d4fb3";
      c.lineWidth = 12;
      c.beginPath();
      c.arc(cx, cy, 104, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#f6f5f1";
      c.beginPath();
      c.arc(cx, cy, 26, 0, Math.PI * 2);
      c.fill();
    } else {
      // generic gold flame shards with a red ring
      c.fillStyle = "#d4a017";
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
        c.quadraticCurveTo(cx + Math.cos(a + 0.5) * 110, cy + Math.sin(a + 0.5) * 110, cx + Math.cos(a + 0.9) * 120, cy + Math.sin(a + 0.9) * 120);
        c.quadraticCurveTo(cx + Math.cos(a + 0.2) * 70, cy + Math.sin(a + 0.2) * 70, cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
        c.fill();
      }
      c.strokeStyle = "#c0262b";
      c.lineWidth = 8;
      c.beginPath();
      c.arc(cx, cy, 44, 0, Math.PI * 2);
      c.stroke();
    }
  }
};
export const modernBallTextures = (era: "ninety4" | "two002") => {
  const bump = make(`modernBump-${era}`, 1024, 512, (c) => modernPanels(c, 1024, 512, "bump", era));
  bump.colorSpace = THREE.NoColorSpace;
  return { map: make(`modernHD-${era}`, 1024, 512, (c) => modernPanels(c, 1024, 512, "color", era)), bump };
};
