// EP09 procedural canvas textures (deterministic, no network): shirt number, ball, pitch, crowd, ad board.
import * as THREE from "three";
import { makeCanvasTexture } from "../../kits/comicforge/lib/materials.ts";
import { rng } from "../../kits/comicforge/core/motion.ts";

const INK = "#121014";
const cache = new Map<string, THREE.Texture>();
const memo = (key: string, make: () => THREE.Texture) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
};

export const numberTexture = (n: string, color: string) =>
  memo(`num-${n}-${color}`, () =>
    makeCanvasTexture(256, 256, (ctx) => {
      ctx.font = "bold 200px Impact, 'Arial Black', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = 22;
      ctx.strokeStyle = color === "#FFFFFF" ? INK : "#FFFFFF";
      ctx.strokeText(n, 128, 136);
      ctx.fillStyle = color;
      ctx.fillText(n, 128, 136);
    }),
  );

/** Equirect ball: white with black pentagons at the 12 icosahedron vertices (generic 32-panel ball). */
export const ballTexture = () =>
  memo("ball", () =>
    makeCanvasTexture(1024, 512, (ctx) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1024, 512);
      const ico = new THREE.IcosahedronGeometry(1, 0);
      const pos = ico.getAttribute("position");
      const seen: THREE.Vector3[] = [];
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
        if (seen.some((s) => s.distanceTo(v) < 1e-3)) continue;
        seen.push(v);
      }
      ctx.fillStyle = INK;
      for (const v of seen) {
        const lat = Math.asin(v.y);
        const lon = Math.atan2(v.z, v.x);
        const cx = ((lon + Math.PI) / (Math.PI * 2)) * 1024;
        const cy = (0.5 - lat / Math.PI) * 512;
        const r = 52;
        const sx = 1 / Math.max(0.2, Math.cos(lat));
        for (const off of [-1024, 0, 1024]) {
          ctx.beginPath();
          for (let k = 0; k <= 5; k++) {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
            const x = cx + off + Math.cos(a) * r * sx;
            const y = cy + Math.sin(a) * r;
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.fill();
        }
      }
    }),
  );

/** Mowed pitch with white touch line drawn near the far edge. */
export const pitchTexture = () =>
  memo("pitch", () => {
    const t = makeCanvasTexture(1024, 1024, (ctx) => {
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = i % 2 ? "#2FB35A" : "#25994B";
        ctx.fillRect(i * 64, 0, 64, 1024);
      }
      // halftone dot grain
      const r = rng(909);
      ctx.fillStyle = "rgba(10,60,30,0.28)";
      for (let y = 0; y < 1024; y += 12) {
        for (let x = (y / 12) % 2 ? 6 : 0; x < 1024; x += 12) {
          const s = 1.2 + r() * 1.6;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });

/** Stand of supporters: tiers of halftone heads in sky / white / magenta, transparent sky above. */
export const crowdTexture = (seed: number, tint: "day" | "dusk") =>
  memo(`crowd-${seed}-${tint}`, () =>
    makeCanvasTexture(2048, 512, (ctx) => {
      const r = rng(seed);
      ctx.fillStyle = tint === "day" ? "#3A3F9E" : "#2B2E8C";
      ctx.fillRect(0, 60, 2048, 452);
      // roof edge
      ctx.fillStyle = INK;
      ctx.fillRect(0, 52, 2048, 14);
      const cols = ["#7CCBF2", "#FFFFFF", "#FFE100", "#E5007D", "#FF6FB0", "#00A3E0"];
      for (let row = 0; row < 12; row++) {
        const y = 90 + row * 36;
        ctx.fillStyle = "rgba(18,16,20,0.35)";
        ctx.fillRect(0, y + 22, 2048, 4);
        for (let x = (row % 2) * 9; x < 2048; x += 18) {
          ctx.fillStyle = cols[Math.floor(r() * cols.length)];
          ctx.beginPath();
          ctx.arc(x, y + r() * 4, 6.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // a few waving flags (sky/white stripes) — generic, no crests
      for (let k = 0; k < 9; k++) {
        const x = 90 + k * 230 + r() * 60;
        const y = 110 + r() * 160;
        for (let s = 0; s < 5; s++) {
          ctx.fillStyle = s % 2 ? "#FFFFFF" : "#7CCBF2";
          ctx.fillRect(x + s * 14, y, 14, 52);
        }
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 70, 52);
      }
    }),
  );

/** Perimeter advertising board: the in-world AUDIRA brand. */
export const adBoardTexture = () =>
  memo("adboard", () => {
    const t = makeCanvasTexture(2048, 128, (ctx) => {
      const segs = ["AUDIRA", "SPORT FACTS", "AUDIRA", "SEJARAH SEPAK BOLA"];
      let x = 0;
      let i = 0;
      while (x < 2048) {
        const label = segs[i % segs.length];
        const w = label.length * 46 + 120;
        ctx.fillStyle = i % 2 ? "#FFE100" : "#121014";
        ctx.fillRect(x, 0, w, 128);
        ctx.fillStyle = i % 2 ? "#121014" : "#2BD46A";
        ctx.font = "bold 84px Impact, 'Arial Black', sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + 60, 68);
        x += w;
        i++;
      }
    });
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
