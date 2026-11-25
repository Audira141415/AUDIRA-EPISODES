// EP09 cover (TOYDIORAMA): canvas-drawn textures (kraft tags, podium sign, envelope, banknotes,
// stage backdrop, AUDIRA plaque). Seeded only (prng). Fonts are passed in after they have loaded,
// so every render tab draws the same pixels.
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: Draw): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

export type Fonts = { display: string; mono: string };

/** Paper fibres and blotches on any paper-coloured canvas. */
function paperFibre(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, dark = 0.06) {
  const r = prng(seed);
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = r() * h, rad = 30 + r() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(90,60,30,${dark * (0.4 + r())})`);
    g.addColorStop(1, "rgba(90,60,30,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 420; i++) {
    ctx.strokeStyle = `rgba(70,45,20,${0.05 + r() * 0.08})`;
    ctx.lineWidth = 1;
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 4 + r() * 14;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

/** Kraft-paper tag: small mono reference line + big display line. */
export function tagTexture(key: string, ref: string, main: string, fonts: Fonts, seed: number): THREE.Texture {
  return canvasTex(`tag-${key}`, 720, 360, (ctx, w, h) => {
    ctx.fillStyle = "#d8b57e";
    ctx.fillRect(0, 0, w, h);
    paperFibre(ctx, w, h, seed, 0.09);
    // punched edge rule
    ctx.strokeStyle = "rgba(60,36,16,0.35)";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.setLineDash([]);
    // reference line with red ink chip
    ctx.fillStyle = "#b8321f";
    ctx.fillRect(44, 58, 24, 74);
    ctx.fillStyle = "#2a1a0e";
    ctx.font = `500 80px ${fonts.mono}`;
    ctx.textBaseline = "middle";
    ctx.fillText(ref, 86, 98);
    // main line
    ctx.font = `400 104px ${fonts.display}`;
    let size = 104;
    while (ctx.measureText(main).width > w - 88 && size > 60) {
      size -= 4;
      ctx.font = `400 ${size}px ${fonts.display}`;
    }
    ctx.fillStyle = "#1d130b";
    ctx.fillText(main, 44, 250);
  });
}

/** Paper sign hung on the empty podium. */
export function podiumSignTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("podium-sign", 560, 300, (ctx, w, h) => {
    ctx.fillStyle = "#f4ecdc";
    ctx.fillRect(0, 0, w, h);
    paperFibre(ctx, w, h, 61, 0.05);
    ctx.strokeStyle = "#8a1f23";
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "#1d130b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 112px ${fonts.display}`;
    ctx.fillText("MANTAN", w / 2, 92);
    ctx.fillStyle = "#8a1f23";
    ctx.fillText("WAPRES", w / 2, 210);
  });
}

/** Pension envelope with a big "100%" stamp. */
export function envelopeTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("envelope", 600, 400, (ctx, w, h) => {
    ctx.fillStyle = "#efe2c6";
    ctx.fillRect(0, 0, w, h);
    paperFibre(ctx, w, h, 73, 0.05);
    // flap fold lines
    ctx.strokeStyle = "rgba(90,60,30,0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w / 2, h * 0.42);
    ctx.lineTo(w, 0);
    ctx.stroke();
    // airmail-ish border in red/white (Indonesian colours)
    for (let x = 0; x < w; x += 40) {
      ctx.fillStyle = (x / 40) % 2 === 0 ? "#c62828" : "#f7f2e8";
      ctx.fillRect(x, h - 22, 40, 22);
    }
    ctx.fillStyle = "#4a2e17";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 46px ${fonts.mono}`;
    ctx.fillText("PENSIUN", w / 2, 120);
    // stamp
    ctx.save();
    ctx.translate(w / 2, 258);
    ctx.rotate(-0.06);
    ctx.strokeStyle = "#c62828";
    ctx.lineWidth = 9;
    ctx.strokeRect(-200, -78, 400, 156);
    ctx.fillStyle = "#c62828";
    ctx.font = `400 150px ${fonts.display}`;
    ctx.fillText("100%", 0, 8);
    ctx.restore();
  });
}

/** Generic toy banknote face (no real currency design). */
export function noteTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("note", 512, 240, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#e8737a");
    g.addColorStop(1, "#c94a55");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,235,225,0.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.ellipse(w * 0.7, h / 2, 30 + i * 9, 18 + i * 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,240,230,0.8)";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = "#fff3ea";
    ctx.font = `400 92px ${fonts.display}`;
    ctx.textBaseline = "middle";
    ctx.fillText("%", 40, h / 2);
  });
}

/** Paper band around a bundle of toy notes. */
export function bandTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("band", 256, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f5efe2";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2a1a0e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 64px ${fonts.mono}`;
    ctx.fillText("100%", w / 2, h / 2);
  });
}

/** Brass plaque text (engraved look). */
export function plaqueTexture(fonts: Fonts): THREE.Texture {
  return canvasTex("plaque", 640, 158, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#e9c877");
    g.addColorStop(0.5, "#c9a14f");
    g.addColorStop(1, "#a07a33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(70,45,10,0.6)";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `500 108px ${fonts.mono}`;
    ctx.fillStyle = "rgba(255,240,200,0.55)";
    ctx.fillText("AUDIRA", w / 2 + 2, h / 2 + 4);
    ctx.fillStyle = "#3b2708";
    ctx.fillText("AUDIRA", w / 2, h / 2 + 2);
  });
}

/** Painted dusk backdrop flat: sky gradient, paper clouds, soft stars. */
export function backdropTexture(): THREE.Texture {
  return canvasTex("backdrop", 1024, 1536, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#14223a");
    g.addColorStop(0.45, "#2f4a6e");
    g.addColorStop(0.72, "#c98a6a");
    g.addColorStop(1, "#f0c48a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(909);
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(255,240,210,${0.25 + r() * 0.5})`;
      ctx.beginPath();
      ctx.arc(r() * w, r() * h * 0.45, 1.5 + r() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // brush texture
    for (let i = 0; i < 900; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.015 + r() * 0.03})`;
      ctx.lineWidth = 2 + r() * 6;
      const x = r() * w, y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30 + r() * 60, y + (r() - 0.5) * 8);
      ctx.stroke();
    }
  });
}
