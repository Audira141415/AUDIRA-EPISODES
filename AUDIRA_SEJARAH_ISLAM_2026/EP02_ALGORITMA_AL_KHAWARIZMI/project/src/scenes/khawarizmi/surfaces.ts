// EP02 Khawarizmi: surface textures with visible detail at phone size (the contact sheet is judged
// at ~300 px per frame): walnut desk with grain, knots and scratches; brass with patina; the library
// wall (plaster, stone courses, arched niches); a leather grain for spines. All seeded.
import * as THREE from "three";
import { mulberry32 } from "../../kits/manuscript/core/motion";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
const tex = (c: HTMLCanvasElement, repeat: [number, number] = [1, 1]) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
};

/** Walnut desk: long grain, darker latewood bands, knots, tool scratches and ink drops. */
export const makeDeskTexture = (seed = 5) => {
  const S = 1024;
  const c = canvas(S, S);
  const g = c.getContext("2d")!;
  const rnd = mulberry32(seed);
  g.fillStyle = "#4A2E1C";
  g.fillRect(0, 0, S, S);
  // planks
  for (let p = 0; p < 4; p++) {
    const y0 = p * (S / 4);
    g.fillStyle = `rgba(${70 + rnd() * 25},${40 + rnd() * 15},${22},0.55)`;
    g.fillRect(0, y0, S, S / 4);
    g.fillStyle = "rgba(15,8,4,0.85)";
    g.fillRect(0, y0, S, 3);
  }
  // grain
  for (let i = 0; i < 420; i++) {
    const y = rnd() * S;
    const dark = rnd() < 0.55;
    g.strokeStyle = dark ? `rgba(28,15,7,${0.18 + rnd() * 0.32})` : `rgba(150,100,60,${0.08 + rnd() * 0.16})`;
    g.lineWidth = 0.8 + rnd() * 2.6;
    g.beginPath();
    g.moveTo(0, y);
    const a = (rnd() - 0.5) * 22;
    const b = (rnd() - 0.5) * 22;
    g.bezierCurveTo(S * 0.33, y + a, S * 0.66, y + b, S, y + (rnd() - 0.5) * 8);
    g.stroke();
  }
  // knots with rings
  for (let k = 0; k < 7; k++) {
    const x = rnd() * S;
    const y = rnd() * S;
    for (let r = 4; r < 34; r += 4) {
      g.strokeStyle = `rgba(25,12,5,${0.5 - r / 80})`;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(x, y, r * 2.6, r * 0.8, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  // scratches
  for (let i = 0; i < 160; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const an = rnd() * Math.PI;
    const l = 10 + rnd() * 60;
    g.strokeStyle = `rgba(210,170,120,${0.08 + rnd() * 0.14})`;
    g.lineWidth = 0.7;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l);
    g.stroke();
  }
  // old ink drops and ring marks
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(10,6,4,${0.25 + rnd() * 0.3})`;
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, 2 + rnd() * 6, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = "rgba(20,10,5,0.25)";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, 26 + rnd() * 20, 0, Math.PI * 2);
    g.stroke();
  }
  return tex(c, [2, 1.3]);
};

/** Brass with hammer marks, darker patina pockets and green verdigris specks (use with color white). */
export const makeBrassTexture = () => {
  const S = 256;
  const c = canvas(S, S);
  const g = c.getContext("2d")!;
  const rnd = mulberry32(11);
  g.fillStyle = "#B58A3C";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 700; i++) {
    const v = rnd();
    g.fillStyle = v < 0.45 ? `rgba(70,45,15,${0.1 + rnd() * 0.25})` : v < 0.9 ? `rgba(255,225,150,${0.08 + rnd() * 0.2})` : `rgba(62,127,106,${0.25 + rnd() * 0.3})`;
    const r = 1 + rnd() * 4;
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, r, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c, [2, 2]);
};

/** Library back wall: lime plaster, stone courses, two arched niches and a geometric tile band. */
export const makeWallTexture = () => {
  const W = 2048;
  const H = 1024;
  const c = canvas(W, H);
  const g = c.getContext("2d")!;
  const rnd = mulberry32(23);
  g.fillStyle = "#5A3E28";
  g.fillRect(0, 0, W, H);
  // stone courses
  for (let y = 0; y < H; y += 64) {
    const off = (y / 64) % 2 ? 0 : 70;
    for (let x = -off; x < W; x += 140) {
      g.fillStyle = `rgba(${90 + rnd() * 40},${62 + rnd() * 25},${40 + rnd() * 15},0.75)`;
      g.fillRect(x + 3, y + 3, 134, 58);
      for (let k = 0; k < 18; k++) {
        g.fillStyle = `rgba(30,18,10,${rnd() * 0.25})`;
        g.fillRect(x + rnd() * 134, y + rnd() * 58, 2 + rnd() * 3, 2 + rnd() * 3);
      }
    }
    g.fillStyle = "rgba(20,12,7,0.9)";
    g.fillRect(0, y, W, 3);
  }
  // tile band (8-point stars, geometric only)
  const by = 120;
  g.fillStyle = "rgba(20,30,50,0.85)";
  g.fillRect(0, by, W, 90);
  for (let x = 45; x < W; x += 90) {
    g.save();
    g.translate(x, by + 45);
    g.fillStyle = "rgba(201,151,58,0.8)";
    for (let k = 0; k < 2; k++) {
      g.rotate(Math.PI / 4);
      g.fillRect(-22, -22, 44, 44);
    }
    g.restore();
    g.fillStyle = "rgba(36,65,140,0.9)";
    g.beginPath();
    g.arc(x, by + 45, 12, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(201,151,58,0.7)";
  g.fillRect(0, by - 6, W, 5);
  g.fillRect(0, by + 91, W, 5);
  // grime gradient toward the floor
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "rgba(0,0,0,0.15)");
  gr.addColorStop(1, "rgba(0,0,0,0.5)");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  return tex(c, [2, 1]);
};

/** Leather grain + blind tooling overlay drawn onto an existing spine/cover canvas context. */
export const leatherGrain = (g: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  const rnd = mulberry32(seed);
  for (let i = 0; i < (w * h) / 18; i++) {
    g.fillStyle = rnd() < 0.5 ? `rgba(0,0,0,${0.1 + rnd() * 0.18})` : `rgba(255,220,180,${0.04 + rnd() * 0.07})`;
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  // scuffs
  for (let i = 0; i < 12; i++) {
    g.strokeStyle = `rgba(255,230,190,${0.08 + rnd() * 0.1})`;
    g.lineWidth = 1;
    g.beginPath();
    const x = rnd() * w;
    const y = rnd() * h;
    g.moveTo(x, y);
    g.lineTo(x + (rnd() - 0.5) * w * 0.4, y + (rnd() - 0.5) * 10);
    g.stroke();
  }
};
