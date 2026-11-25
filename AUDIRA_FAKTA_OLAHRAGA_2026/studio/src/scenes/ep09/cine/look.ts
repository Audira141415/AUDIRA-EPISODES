// EP09 CINESTORY look: physical material recipes (no toy plastic, no paper) and a procedural snow texture,
// so the lower third of the frame reads as real snow (wind ripples, sled grooves, sparkle) instead of a flat white floor.
import { canvasTex } from "./mats.ts";
import { mulberry32 } from "../../../kits/worldforge/noise.ts";

export const CINE = {
  /** fibreglass shell with car-paint clearcoat */
  paint: { roughness: 0.34, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 },
  /** polished track ice: glossy, slightly blue, reflects the floodlights */
  ice: { roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, reflectivity: 0.6 },
  snow: { color: "#c3cfdc", roughness: 0.9, sheen: 0.12, sheenColor: "#9fb6d6", sheenRoughness: 0.7 },
  sand: { color: "#d9bd86", roughness: 0.95 },
  water: { color: "#1f7f9a", roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02 },
  asphalt: { color: "#4a4e55", roughness: 0.88 },
  steel: { color: "#b9c0c8", metalness: 0.85, roughness: 0.3 },
  signPaint: { color: "#17202b", roughness: 0.45, clearcoat: 0.6 },
  signText: "#f4f1e6",
};

/** Snow ground: soft blue-grey wind ripples, a few grooves, fine sparkle. Repeats over the floor. */
export const snowTex = (rep: [number, number]) =>
  canvasTex(
    `ep09snow${rep.join("x")}`,
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#dfe6ee";
      g.fillRect(0, 0, w, h);
      const r = mulberry32(9);
      for (let i = 0; i < 70; i++) {
        const y = r() * h, a = 0.05 + r() * 0.08;
        g.strokeStyle = `rgba(110,135,170,${a * 1.6})`;
        g.lineWidth = 2 + r() * 6;
        g.beginPath();
        g.moveTo(-10, y);
        for (let x = 0; x <= w + 20; x += 32) g.lineTo(x, y + Math.sin(x / 60 + i) * 6 + (r() - 0.5) * 4);
        g.stroke();
      }
      for (let i = 0; i < 1600; i++) {
        g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(170,190,215,0.35)";
        g.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
    },
    rep,
  );
