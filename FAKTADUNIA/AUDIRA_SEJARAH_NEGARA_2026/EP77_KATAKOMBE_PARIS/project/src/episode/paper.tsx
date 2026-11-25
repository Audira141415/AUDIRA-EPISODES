// EP77 Katakombe Paris — PAPERWORLD skin (s7). The sets, camera and timing stay from s6; this layer turns every
// surface into cut cardstock (kit paper material: pulp mottling, fibres, pale cut edge) and relights each scene as
// a paper diorama: warm key + cool coloured fill instead of one orange lantern wash. No ink outline (CHRONICLE).
import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, type Material } from "three";
import { paperFace } from "../kits/paperworld/material/paper.ts";
import { PALETTE } from "../kits/paperworld/tokens.ts";
import type { Look } from "../kits/chronicle/Stage.tsx";

type PName = keyof typeof PALETTE;
const NAMES = Object.keys(PALETTE) as PName[];
const LIN = NAMES.map((n) => new Color(PALETTE[n]));
const BRIGHT: PName[] = ["ivory", "coralLight", "goldLight", "mintLight", "cobaltLight", "ivoryShade"];

const nearest = (c: Color): PName => {
  let best: PName = "ivory", d = Infinity;
  LIN.forEach((p, i) => {
    const dd = (p.r - c.r) ** 2 + (p.g - c.g) ** 2 * 1.3 + (p.b - c.b) ** 2;
    if (dd < d) { d = dd; best = NAMES[i]; }
  });
  return best;
};
const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};

/** Figure contour colour → paper stock for the puppet. */
const SIL: Record<string, PName> = { "#ffb547": "coral", "#b98cff": "cobaltDeep", "#ff4b3a": "coralDeep", "#5fe0d2": "mintDeep", "#f3e3c6": "brownLight" };

const MADE = new WeakSet<Material>();
/** Register an episode-made paper material so PaperSkin leaves it alone. */
export const keepPaper = <T extends Material>(m: T): T => { MADE.add(m); return m; };
const pf = (c: string) => { const m = paperFace(c); MADE.add(m); return m; };

const paperFor = (mesh: Mesh, m: Material): Material | null => {
  if (MADE.has(m)) return null;
  if (mesh.userData?.keepMat) return null;
  if (m instanceof MeshBasicMaterial) {
    if (m.toneMapped === false) return null; // flames, glows
    const sil = mesh.userData?.sil?.color as string | undefined;
    return pf(sil && SIL[sil] ? SIL[sil] : "brownDeep");
  }
  if (!(m instanceof MeshStandardMaterial)) return null;
  // light sources and text plaques keep their own material
  if (m.emissiveMap || (m.emissive && m.emissive.getHex() !== 0 && m.emissiveIntensity > 0.3)) return null;
  const c = m.color.clone().convertLinearToSRGB();
  const lum = 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
  if (lum < 0.05) return pf("#2a1f1a"); // voids stay dark, but as paper
  if (m.map && lum > 0.85) {
    // textured GLB with a white base colour: give each model its own paper stock
    return pf(BRIGHT[Math.floor(hashStr(mesh.name + (mesh.parent?.name ?? "")) * BRIGHT.length)]);
  }
  return pf(nearest(c));
};

const LAMP_GAIN = 0.32;
const WHITE = new Color("#fff4e2");

/** Replaces every mesh material in the scene with paper, including GLBs that load later. */
export const PaperSkin: React.FC = () => {
  const scene = useThree((s) => s.scene);
  useFrame(() => {
    scene.traverse((o) => {
      const pl = o as PointLight;
      if (pl.isPointLight) {
        // CHRONICLE lamps were tuned for dark stone; ivory card reflects ~2x more. Dim them and pull the
        // amber toward paper white, so the cool scene fill shows (re-applied when React resets props).
        if (pl.userData.paperI !== pl.intensity) {
          pl.intensity *= LAMP_GAIN;
          pl.userData.origColor ??= pl.color.clone();
          pl.color.copy(pl.userData.origColor).lerp(WHITE, 0.45);
          pl.userData.paperI = pl.intensity;
        }
        return;
      }
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      if (mesh.userData.papered && !mesh.userData.sil) return;
      if (Array.isArray(mesh.material)) mesh.material = mesh.material.map((m) => paperFor(mesh, m) ?? m);
      else {
        const p = paperFor(mesh, mesh.material);
        if (p) mesh.material = p;
      }
      mesh.userData.papered = true;
      delete mesh.userData.sil; // no CHRONICLE ink contour in PAPERWORLD
    });
  }, 0);
  return null;
};

/**
 * CHRONICLE look → paper-diorama look: no contour, brighter bounce, coloured fill, gentle grade.
 * `fill` gives each scene its own cool counter-colour so the film is not one orange wash.
 */
export const paperLook = (L: Look, o: { fill: string; fillI?: number; hemi?: number; exposure?: number; fog?: number }): Look => ({
  ...L,
  hemi: { sky: o.fill, ground: "#3a2c26", intensity: (L.hemi.intensity ?? 0.6) * (o.hemi ?? 1.7) },
  fill: { pos: L.fill?.pos ?? [6, 6, 24], color: o.fill, intensity: o.fillI ?? 0.9 },
  fog: { color: L.fog.color, density: L.fog.density * (o.fog ?? 0.55) },
  exposure: o.exposure ?? 0.92,
  bloom: { strength: 0.1, radius: 0.4, threshold: 0.95 },
  grade: { shadow: "#2c3550", high: "#ffe2bf", amount: 0.1, contrast: 0.1, vignette: 0.3, grain: 0.012 },
  outline: { width: 1, halo: 0, gain: 1 },
});
