// EP46 cover textures (canvas, drawn after Manrope is ready). Deterministic: no Math.random.
import * as THREE from "three";
import { MANROPE } from "../../core/type/fonts.ts";

const cache = new Map<string, THREE.CanvasTexture>();
const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

const prng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Wide front plaque of the hero pedestal: year, accent hairline, AUDIRA engraving. */
export const heroPlaqueTexture = (year: string, accent: string) =>
  make(`hero-plaque-${year}`, 1024, 512, (c) => {
    c.fillStyle = "#f1efea";
    c.fillRect(0, 0, 1024, 512);
    c.strokeStyle = "rgba(31,36,38,0.16)";
    c.lineWidth = 4;
    c.strokeRect(36, 36, 952, 440);
    c.fillStyle = "#1f2426";
    c.font = `200 236px ${MANROPE}`;
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.fillText(year, 512, 300);
    c.fillStyle = accent;
    c.fillRect(422, 338, 180, 7);
    c.fillStyle = "rgba(31,36,38,0.62)";
    c.font = `600 50px ${MANROPE}`;
    c.fillText("A U D I R A", 512, 430);
  });

/** Small square plaque: year numerals only (muted for the grave era). */
export const smallPlaqueTexture = (year: string, accent: string, muted = false) =>
  make(`small-plaque-${year}-${muted}`, 512, 512, (c) => {
    c.fillStyle = muted ? "#dcdad5" : "#f1efea";
    c.fillRect(0, 0, 512, 512);
    c.strokeStyle = "rgba(31,36,38,0.16)";
    c.lineWidth = 3;
    c.strokeRect(34, 34, 444, 444);
    c.fillStyle = muted ? "#5d6366" : "#1f2426";
    c.font = `300 170px ${MANROPE}`;
    c.textAlign = "center";
    c.fillText(year, 256, 310);
    c.fillStyle = accent;
    c.fillRect(186, 350, 140, 6);
  });

/** Grass top for the hero stage: mowed stripes and a white goal line. */
export const turfTexture = () =>
  make("turf46", 1024, 512, (c) => {
    const r = prng(46);
    for (let i = 0; i < 10; i++) {
      c.fillStyle = i % 2 ? "#2f9a52" : "#38ab5d";
      c.fillRect((i * 1024) / 10, 0, 1024 / 10 + 1, 512);
    }
    for (let k = 0; k < 2400; k++) {
      c.fillStyle = `rgba(${r() < 0.5 ? "10,60,25" : "200,255,210"},${0.04 + r() * 0.05})`;
      c.fillRect(r() * 1024, r() * 512, 1.5, 3 + r() * 5);
    }
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.fillRect(0, 120, 1024, 9);
  });

/** Weathered limestone for the unmarked grave stone. */
export const stoneTexture = () =>
  make("stone46", 512, 512, (c) => {
    const r = prng(1930);
    c.fillStyle = "#a9aaa6";
    c.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 900; k++) {
      const v = 120 + Math.floor(r() * 70);
      c.fillStyle = `rgba(${v},${v},${v - 4},${0.08 + r() * 0.12})`;
      c.beginPath();
      c.arc(r() * 512, r() * 512, 1 + r() * 7, 0, Math.PI * 2);
      c.fill();
    }
    // lichen
    for (let k = 0; k < 60; k++) {
      c.fillStyle = `rgba(120,130,90,${0.08 + r() * 0.1})`;
      c.beginPath();
      c.arc(r() * 512, 360 + r() * 150, 4 + r() * 16, 0, Math.PI * 2);
      c.fill();
    }
  });

/** Wood grain for the early goal posts (no net before 1891). */
export const woodTexture = () =>
  make("wood46", 256, 1024, (c) => {
    const r = prng(1889);
    c.fillStyle = "#e7dcc6";
    c.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 46; i++) {
      c.strokeStyle = `rgba(120,86,50,${0.08 + r() * 0.14})`;
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      const x0 = r() * 256;
      for (let y = 0; y <= 1024; y += 16) c.lineTo(x0 + Math.sin(y / 90 + i) * 6, y);
      c.stroke();
    }
  });
