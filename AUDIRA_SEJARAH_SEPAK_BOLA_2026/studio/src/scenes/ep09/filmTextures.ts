// EP09 film textures (deterministic canvas, no network): full pitch with markings, scoreboard faces,
// flags (simple shapes, allowed), TV static, number badges.
import * as THREE from "three";
import { makeCanvasTexture } from "../../kits/comicforge/lib/materials.ts";
import { rng } from "../../kits/comicforge/core/motion.ts";

const INK = "#121014";
const cache = new Map<string, THREE.Texture>();
const memo = (key: string, make: () => THREE.Texture) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
};

/** 105 x 68 m pitch, length along canvas x. Mowed stripes, halftone grain, white markings. */
export const fullPitchTexture = () =>
  memo("fullpitch", () =>
    makeCanvasTexture(2100, 1360, (ctx) => {
      const s = 20; // px per metre
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = i % 2 ? "#2FB35A" : "#259C4C";
        ctx.fillRect(i * 150, 0, 150, 1360);
      }
      const r = rng(4242);
      ctx.fillStyle = "rgba(10,60,30,0.26)";
      for (let y = 0; y < 1360; y += 14) {
        for (let x = (y / 14) % 2 ? 7 : 0; x < 2100; x += 14) {
          ctx.beginPath();
          ctx.arc(x, y, 1.3 + r() * 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = "#F4F8F0";
      ctx.lineWidth = 9;
      const m = 4; // inset
      ctx.strokeRect(m, m, 2100 - 2 * m, 1360 - 2 * m);
      ctx.beginPath();
      ctx.moveTo(1050, 0);
      ctx.lineTo(1050, 1360);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1050, 680, 9.15 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#F4F8F0";
      ctx.beginPath();
      ctx.arc(1050, 680, 9, 0, Math.PI * 2);
      ctx.fill();
      for (const side of [0, 1]) {
        const x0 = side ? 2100 - m : m;
        const dir = side ? -1 : 1;
        ctx.strokeRect(side ? x0 - 16.5 * s : x0, 680 - 20.16 * s, 16.5 * s, 40.32 * s);
        ctx.strokeRect(side ? x0 - 5.5 * s : x0, 680 - 9.16 * s, 5.5 * s, 18.32 * s);
        ctx.beginPath();
        ctx.arc(x0 + dir * 11 * s, 680, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        const a = Math.acos(5.5 / 9.15);
        if (side) ctx.arc(x0 - 11 * s, 680, 9.15 * s, Math.PI - a, Math.PI + a);
        else ctx.arc(x0 + 11 * s, 680, 9.15 * s, -a, a);
        ctx.stroke();
      }
    }),
  );

/** Old stadium scoreboard face: dark board, bulb-dot letters. */
export const scoreTexture = (top: string, left: string, score: string, right: string, foot: string) =>
  memo(`score-${top}-${left}-${score}-${right}-${foot}`, () =>
    makeCanvasTexture(1024, 640, (ctx) => {
      ctx.fillStyle = "#14161E";
      ctx.fillRect(0, 0, 1024, 640);
      // bulb grid
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let y = 8; y < 640; y += 16) for (let x = 8; x < 1024; x += 16) ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#2BD46A";
      ctx.font = "bold 70px Impact, 'Arial Black', sans-serif";
      ctx.fillText(top, 512, 86);
      ctx.fillStyle = "#FFE100";
      ctx.font = "bold 110px Impact, 'Arial Black', sans-serif";
      ctx.fillText(left, 230, 300);
      ctx.fillText(right, 794, 300);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 220px Impact, 'Arial Black', sans-serif";
      ctx.fillText(score, 512, 310);
      ctx.fillStyle = "#FF6FB0";
      ctx.font = "bold 84px Impact, 'Arial Black', sans-serif";
      ctx.fillText(foot, 512, 540);
    }),
  );

/** Argentina: light blue / white / light blue + simple sun disc. */
export const flagArgTexture = () =>
  memo("flag-arg", () =>
    makeCanvasTexture(600, 380, (ctx) => {
      ctx.fillStyle = "#74ACDF";
      ctx.fillRect(0, 0, 600, 380);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 127, 600, 126);
      ctx.fillStyle = "#F6B40E";
      ctx.beginPath();
      ctx.arc(300, 190, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#85340A";
      ctx.lineWidth = 4;
      ctx.stroke();
    }),
  );

/** England: white with red cross. */
export const flagEngTexture = () =>
  memo("flag-eng", () =>
    makeCanvasTexture(600, 380, (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 600, 380);
      ctx.fillStyle = "#CE1124";
      ctx.fillRect(255, 0, 90, 380);
      ctx.fillRect(0, 145, 600, 90);
    }),
  );

/** TV static / "no replay" screen (seeded per variant). */
export const staticTexture = (v: number) =>
  memo(`static-${v}`, () =>
    makeCanvasTexture(256, 192, (ctx) => {
      const r = rng(700 + v);
      ctx.fillStyle = "#3A3F4E";
      ctx.fillRect(0, 0, 256, 192);
      for (let y = 0; y < 192; y += 4) {
        for (let x = 0; x < 256; x += 4) {
          const g = Math.floor(80 + r() * 175);
          ctx.fillStyle = `rgb(${g},${g},${g + 10})`;
          ctx.fillRect(x, y, 3, 3);
        }
      }
      ctx.fillStyle = "rgba(18,16,20,0.5)";
      for (let y = 0; y < 192; y += 8) ctx.fillRect(0, y, 256, 2);
    }),
  );

/** Round numbered badge (yellow disc, ink ring) for the 55' run trail. */
export const badgeTexture = (n: string) =>
  memo(`badge-${n}`, () =>
    makeCanvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(128, 128, 122, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFE100";
      ctx.beginPath();
      ctx.arc(128, 128, 102, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = "bold 170px Impact, 'Arial Black', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n, 128, 140);
    }),
  );

/** Press-table name plate. */
export const plateTexture = (s: string) =>
  memo(`plate-${s}`, () =>
    makeCanvasTexture(512, 128, (ctx) => {
      ctx.fillStyle = "#FFF6E0";
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 502, 118);
      ctx.fillStyle = INK;
      ctx.font = "bold 76px Impact, 'Arial Black', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s, 256, 68);
    }),
  );
