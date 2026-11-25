// EP05 canvas textures (DEVFORGE): IDE prompt panel, peeling prompt strips, background grid, labels.
// System fonts only (Consolas / Arial Black) so the canvas never draws before a web font loads.
import * as THREE from "three";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";

const cache = new Map<string, THREE.Texture>();
const MONO = "Consolas, 'Courier New', monospace";

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

export const PANEL_W = 2048;
export const PANEL_H = 1160;

/** The prompt panel face. `chars` = typed characters of the prompt (typewriter), `cursor` on/off. */
export function panelTexture(chars: number, cursor: boolean, hl = -1, big = false): THREE.Texture {
  return make(`panel:${chars}:${cursor}:${hl}:${big}`, PANEL_W, PANEL_H, (ctx) => {
    ctx.fillStyle = P.editorBg;
    ctx.beginPath();
    ctx.roundRect(0, 0, PANEL_W, PANEL_H, 36);
    ctx.fill();
    // header bar
    ctx.fillStyle = P.editorHeader;
    ctx.beginPath();
    ctx.roundRect(0, 0, PANEL_W, 132, [36, 36, 0, 0]);
    ctx.fill();
    [P.windowButtonRed, P.windowButtonYellow, P.windowButtonGreen].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(60 + i * 52, 66, 17, 0, Math.PI * 2);
      ctx.fill();
    });
    // active tab with the brand file name
    ctx.fillStyle = P.editorBg;
    const tabW = big ? 820 : 660;
    ctx.beginPath();
    ctx.roundRect(230, 22, tabW, 110, [18, 18, 0, 0]);
    ctx.fill();
    ctx.fillStyle = P.accentNeon;
    ctx.fillRect(230, 22, tabW, 7);
    ctx.font = `bold ${big ? 72 : 54}px ${MONO}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("AUDIRA_Map.prompt", 262, big ? 104 : 100);
    ctx.fillStyle = P.codeComment;
    ctx.fillText("Assistant", big ? 1110 : 950, big ? 104 : 100);
    // gutter
    ctx.fillStyle = P.editorBorder;
    ctx.fillRect(150, 132, 3, PANEL_H - 132);

    const lines: { y: number; size: number; parts: [string, string][] }[] = [
      { y: 245, size: big ? 76 : 60, parts: [["-- 1 pesan = 1 prompt", P.codeComment]] },
      { y: 400, size: 92, parts: [["> ", P.accentNeon], ["buat NPC patroli,", "#FFFFFF"]] },
      { y: 530, size: 92, parts: [["  kejar pemain dalam ", "#FFFFFF"], ["10 stud", P.amberGold]] },
      { y: big ? 700 : 690, size: big ? 84 : 64, parts: [["1. pilih platform (seleksi)", P.metricProfit]] },
      { y: big ? 820 : 800, size: big ? 84 : 64, parts: [["2. taruh NPC di atasnya", P.codeFunc]] },
      { y: big ? 940 : 910, size: big ? 84 : 64, parts: [["3. patroli kiri-kanan", P.codeString]] },
    ];
    // typewriter over the two prompt lines only; other lines are always shown
    let budget = chars;
    let caretX = 0;
    let caretY = 0;
    let caretSize = 92;
    if (hl >= 0) {
      const ln = lines[hl];
      ctx.fillStyle = "rgba(0,240,255,0.16)";
      ctx.fillRect(156, ln.y - ln.size * 0.95, PANEL_W - 200, ln.size * 1.3);
      ctx.fillStyle = P.accentNeon;
      ctx.fillRect(156, ln.y - ln.size * 0.95, 12, ln.size * 1.3);
    }
    lines.forEach((ln, i) => {
      ctx.font = `${ln.size >= 90 ? "bold " : ""}${ln.size}px ${MONO}`;
      ctx.fillStyle = P.codeComment;
      ctx.font = `${ln.size * 0.62}px ${MONO}`;
      ctx.fillText(String(i + 1), 60, ln.y - 4);
      ctx.font = `${ln.size >= 90 ? "bold " : ""}${ln.size}px ${MONO}`;
      let x = 196;
      const typed = i === 1 || i === 2;
      for (const [txt, col] of ln.parts) {
        let s = txt;
        if (typed) {
          s = txt.slice(0, Math.max(0, budget));
          budget -= txt.length;
        }
        ctx.fillStyle = col;
        ctx.fillText(s, x, ln.y);
        x += ctx.measureText(s).width;
        if (typed && s.length > 0) {
          caretX = x;
          caretY = ln.y;
          caretSize = ln.size;
        }
      }
    });
    if (cursor) {
      ctx.fillStyle = P.accentNeon;
      ctx.fillRect(caretX + 10, caretY - caretSize * 0.78, caretSize * 0.5, caretSize * 0.95);
    }
    // send button
    ctx.fillStyle = P.accentNeon;
    ctx.beginPath();
    ctx.roundRect(PANEL_W - 360, PANEL_H - 150, 300, 96, 48);
    ctx.fill();
    ctx.fillStyle = P.editorBg;
    ctx.font = `bold 50px ${MONO}`;
    ctx.fillText("KIRIM ▶", PANEL_W - 318, PANEL_H - 86);
  });
}

/** A glowing line of the prompt peeling off the panel; its right end breaks into square bits. */
export function stripTexture(text: string, seed: number): THREE.Texture {
  return make(`strip:${text}:${seed}`, 1400, 160, (ctx) => {
    ctx.font = `bold 96px ${MONO}`;
    ctx.fillStyle = "#BFFBFF";
    ctx.shadowColor = P.accentNeon;
    ctx.shadowBlur = 26;
    ctx.fillText(text, 20, 112);
    // break the right third into square pixels (seeded)
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "destination-out";
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const w = ctx.measureText(text).width + 20;
    const cell = 22;
    for (let x = w * 0.55; x < 1400; x += cell) {
      const k = (x - w * 0.55) / (w * 0.45);
      for (let y = 0; y < 160; y += cell) if (rnd() < 0.25 + k * 0.7) ctx.fillRect(x, y, cell, cell);
    }
  });
}

/** Faint blueprint grid for the background wall. */
export function gridTexture(): THREE.Texture {
  const t = make("grid", 1024, 1024, (ctx) => {
    ctx.fillStyle = "#070A10";
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = "rgba(0,240,255,0.10)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 1024; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,240,255,0.22)";
    ctx.lineWidth = 3;
    for (let i = 0; i <= 1024; i += 256) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Body of a platform: dark slate with a 1-stud block grid. */
export function blockSideTexture(): THREE.Texture {
  const t = make("blockside", 256, 256, (ctx) => {
    ctx.fillStyle = "#26324A";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#151C2B";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(10, 10, 236, 30);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Label plate text, e.g. "10 STUD" for the NPC range marker. */
export function labelTexture(text: string, bg: string, fg: string): THREE.Texture {
  return make(`label:${text}:${bg}:${fg}`, 512, 160, (ctx) => {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 160, 40);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = `bold 92px ${MONO}`;
    ctx.textAlign = "center";
    ctx.fillText(text, 256, 112);
  });
}

/** Soft radial glow (alpha falls to 0 at the edge). */
export function glowTexture(color: string): THREE.Texture {
  return make(`glow:${color}`, 512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  });
}

export type CardLine = { t: string; size: number; color: string; y: number; font?: "mono" | "display"; align?: "left" | "center"; x?: number };
export type CardSpec = { w: number; h: number; bg?: string; border?: string; radius?: number; lines: CardLine[] };

/** Generic HUD card: rounded plate + text lines (system fonts so nothing draws before a web font). */
export function cardTexture(spec: CardSpec): THREE.Texture {
  return make(`card:${JSON.stringify(spec)}`, spec.w, spec.h, (ctx) => {
    const r = spec.radius ?? 36;
    if (spec.bg) {
      ctx.fillStyle = spec.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, spec.w, spec.h, r);
      ctx.fill();
    }
    if (spec.border) {
      ctx.strokeStyle = spec.border;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(4, 4, spec.w - 8, spec.h - 8, r);
      ctx.stroke();
    }
    for (const l of spec.lines) {
      // shrink to fit the plate width (never overflow the card)
      let size = l.size;
      const font = (z: number) => (l.font === "display" ? `900 ${z}px 'Arial Black', Impact, sans-serif` : `bold ${z}px ${MONO}`);
      ctx.font = font(size);
      while (size > 24 && ctx.measureText(l.t).width > spec.w - 70) {
        size -= 4;
        ctx.font = font(size);
      }
      ctx.fillStyle = l.color;
      ctx.textAlign = l.align ?? "center";
      ctx.fillText(l.t, l.align === "left" ? l.x ?? 40 : spec.w / 2, l.y);
    }
  });
}

/** Hand-drawn style reference image (Scene Generator beat): sketch of a platform layout on paper. */
export function sketchTexture(): THREE.Texture {
  return make("sketch", 640, 480, (ctx) => {
    ctx.fillStyle = "#F3EEDF";
    ctx.fillRect(0, 0, 640, 480);
    ctx.strokeStyle = "#2B3A55";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    const rects: [number, number, number, number][] = [
      [40, 330, 180, 110], [260, 270, 140, 170], [450, 210, 150, 230],
    ];
    for (const [x, y, w, h] of rects) {
      ctx.beginPath();
      ctx.moveTo(x + 3, y); ctx.lineTo(x + w, y + 4); ctx.lineTo(x + w - 2, y + h); ctx.lineTo(x, y + h - 3); ctx.closePath();
      ctx.stroke();
    }
    ctx.setLineDash([16, 14]);
    ctx.beginPath(); ctx.moveTo(130, 300); ctx.quadraticCurveTo(230, 170, 320, 250); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(340, 240); ctx.quadraticCurveTo(430, 120, 520, 190); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#D8A21A";
    [[230, 200], [430, 150]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); });
  });
}

export type FilmPanelMode = "prompt" | "steps";

/** Film-only panel face (after the hook): 3 big bold lines, high contrast, readable on a phone. */
export function filmPanelTexture(mode: FilmPanelMode, hl: number, cursor: boolean): THREE.Texture {
  return make(`fpanel:${mode}:${hl}:${cursor}`, PANEL_W, PANEL_H, (ctx) => {
    ctx.fillStyle = "#070A0F";
    ctx.beginPath();
    ctx.roundRect(0, 0, PANEL_W, PANEL_H, 36);
    ctx.fill();
    ctx.fillStyle = P.editorHeader;
    ctx.beginPath();
    ctx.roundRect(0, 0, PANEL_W, 170, [36, 36, 0, 0]);
    ctx.fill();
    [P.windowButtonRed, P.windowButtonYellow, P.windowButtonGreen].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(70 + i * 62, 85, 22, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#070A0F";
    ctx.beginPath();
    ctx.roundRect(290, 26, 1000, 144, [22, 22, 0, 0]);
    ctx.fill();
    ctx.fillStyle = P.accentNeon;
    ctx.fillRect(290, 26, 1000, 9);
    ctx.font = `bold 92px ${MONO}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("AUDIRA_Map.prompt", 330, 130);

    const prompt: [string, string][][] = [
      [["> ", P.accentNeon], ["buat NPC patroli,", "#FFFFFF"]],
      [["  kejar pemain", "#FFFFFF"]],
      [["  dalam ", "#FFFFFF"], ["10 stud", P.amberGold]],
    ];
    const steps: [string, string][][] = [
      [["1. pilih platform", P.metricProfit]],
      [["2. taruh NPC", "#E3C8FF"]],
      [["3. patroli", "#BFE6FF"]],
    ];
    const lines = mode === "prompt" ? prompt : steps;
    const ys = [440, 690, 940];
    lines.forEach((parts, i) => {
      if (i === hl) {
        ctx.fillStyle = "rgba(0,240,255,0.22)";
        ctx.fillRect(60, ys[i] - 150, PANEL_W - 120, 200);
        ctx.fillStyle = P.accentNeon;
        ctx.fillRect(60, ys[i] - 150, 18, 200);
      }
      ctx.font = `bold 150px ${MONO}`;
      let x = 120;
      for (const [txt, col] of parts) {
        ctx.fillStyle = hl >= 0 && i !== hl ? "rgba(230,237,243,0.55)" : col;
        ctx.fillText(txt, x, ys[i]);
        x += ctx.measureText(txt).width;
      }
      if (cursor && mode === "prompt" && i === lines.length - 1) {
        ctx.fillStyle = P.accentNeon;
        ctx.fillRect(x + 16, ys[i] - 120, 72, 145);
      }
    });
  });
}
