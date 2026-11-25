// EP10 film (COLLAGE): "Wapres mundur" — Hatta 1956 vs Agnew 1973, built on one kraft wall.
// Frame 0 = the approved cover board (complete). The camera then travels DOWN the wall through three
// more boards (2026 context, Indonesia 1956, USA 1973), pieces landing on twelves as the VO names them,
// whips back UP to the cover board for the comparison payoff, and pulls back to the cover framing.
// Every time comes from timeline.json (Audio Master Clock). Facts: research/SOURCE_REGISTER.md only.
// No faces of real people: objects, halftone buildings, name tags, stamps.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { shotPlan, cameraAt, frame as toFrame, settle, hold, type Framing } from "../../core/camera/moves.ts";
import { stepTime } from "../../core/film/craft.ts";
import { place, clamp01 } from "../../kits/collage/core/motion.ts";
import { COLLAGE_PALETTE as P } from "../../kits/collage/lib/palette.ts";
import { Outro } from "../_shared/Outro.tsx";
import { CoverWorld, COVER_CAMERA } from "./Cover.tsx";
import { paperTexture, type PaperSpec } from "../../kits/collage/lib/paper.ts";
import { scrapTexture, colonnadePhoto, capitolPhoto, peciPhoto, gavelPhoto, type ScrapSpec } from "./coverTextures.ts";
import { linesPrint, letterPrint, formPrint, docPrint, envelopePrint, chairPhoto, stampTexture, tagPrint2 } from "./filmTextures.ts";
import TL from "./timeline.json";

// ---------------- clock ----------------
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const S = TL.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
export const FILM_TOTAL = TL.total as number;
/** start of word i in clip id */
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const OUTRO_AT = S.OUTRO[1] + 0.2;

const RED = "#C8362A";
const BLUE = "#2A55A0";
const INK = P.ink;
const LAYER = 0.006;
const BASE = 0.009;

// ---------------- boards (the wall, top to bottom) ----------------
type BoardDef = { x: number; y: number; w: number; h: number; seed: number; color: string };
const BOARDS: BoardDef[] = [
  { x: 0, y: -2.75, w: 3.6, h: 4.0, seed: 31, color: "#B98E5E" }, // K: 2026 context
  { x: 0, y: -7.85, w: 3.9, h: 5.9, seed: 37, color: P.kraft }, // H: Indonesia 1956
  { x: 0, y: -13.95, w: 3.9, h: 6.0, seed: 41, color: "#AF845A" }, // A: USA 1973
];

/** One continuous darker kraft wall behind every board (no black void after the hook). Fades in after the cover frame. */
const KraftWall: React.FC<{ t: number }> = ({ t }) => {
  const grain = useSurfaceGrain(53, 0.7, 22);
  const a = clamp01((t - 0.4) / 1.0);
  if (a <= 0) return null;
  return (
    <mesh position={[0, -6.4, -0.016]} receiveShadow>
      <planeGeometry args={[12, 28]} />
      <meshStandardMaterial color="#6F5135" roughness={1} roughnessMap={grain} bumpMap={grain} bumpScale={0.8} transparent={a < 1} opacity={a} />
    </mesh>
  );
};

const Board: React.FC<{ b: BoardDef }> = ({ b }) => {
  const grain = useSurfaceGrain(b.seed, 0.6, 9);
  return (
    <group position={[b.x, b.y, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[b.w, b.h, 0.012]} />
        <meshStandardMaterial color={b.color} roughness={0.95} roughnessMap={grain} bumpMap={grain} bumpScale={1.0} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <boxGeometry args={[b.w + 0.04, b.h + 0.04, 0.008]} />
        <meshStandardMaterial color={P.kraftDark} roughness={1} />
      </mesh>
    </group>
  );
};

// ---------------- ghost fragments ----------------
/** Faded halftone remnants of older posters, glued flat on each board: surface texture, never text, never a subject. */
type Ghost = { x: number; y: number; w: number; h: number; rot: number; spec: PaperSpec };
const GHOST_KINDS = ["city", "crowd", "sky", "city", "crowd", "plain"] as const;
const GHOSTS: Ghost[] = (() => {
  const out: Ghost[] = [];
  let seed = 800;
  BOARDS.forEach((b) => {
    const rows = Math.round(b.h / 1.0);
    for (let r = 0; r < rows; r++) {
      for (const side of [-1, 1]) {
        seed++;
        const j = ((seed * 9301 + 49297) % 233280) / 233280;
        const w = 1.0 + j * 0.7, h = 0.55 + ((seed * 7) % 5) * 0.08;
        const kind = GHOST_KINDS[seed % GHOST_KINDS.length];
        out.push({
          x: side * (0.75 + j * 0.45), y: b.y + b.h / 2 - 0.5 - r * (b.h - 1.0) / Math.max(1, rows - 1), w, h, rot: (j - 0.5) * 0.12,
          spec: { kind, seed, aspect: w / h, ink: "#8A6A48", stock: "#C7A57C", torn: [true, true, true, true] },
        });
      }
    }
  });
  return out;
})();
const GhostScrap: React.FC<{ g: Ghost }> = ({ g }) => {
  const tex = useMemo(() => paperTexture(g.spec), [g.spec]);
  return (
    <mesh position={[g.x, g.y, BASE - 0.002]} rotation={[0, 0, g.rot]} receiveShadow>
      <planeGeometry args={[g.w, g.h]} />
      <meshStandardMaterial map={tex} alphaTest={0.5} roughness={0.95} />
    </mesh>
  );
};

// ---------------- pieces ----------------
// Each beat is a small group (max 4-5 pieces); a group leaves the board (slides off on twelves) when its beat ends,
// so no shot is crowded. No piece covers another piece's text; stamps land on blank paper or on a photo.
type FilmPiece = {
  id: string; spec: ScrapSpec; w: number; h: number; x: number; y: number; layer: number; rot: number; t0: number;
  /** seconds: the hand removes it */
  t1?: number;
  from?: [number, number]; curl?: number;
};
type StampDef = { id: string; lines: { t: string; size: number }[]; color: string; w: number; h: number; x: number; y: number; rot: number; t0: number; t1?: number; layer: number };

const sc = (key: string, seed: number, w: number, h: number, rest: Omit<ScrapSpec, "key" | "seed" | "aspect">): ScrapSpec => ({ key, seed, aspect: w / h, ...rest });
const piece = (id: string, seed: number, x: number, y: number, w: number, h: number, t0: number, rest: Omit<ScrapSpec, "key" | "seed" | "aspect">, extra: Partial<FilmPiece> = {}): FilmPiece => ({
  id, spec: sc(`film-${id}`, seed, w, h, rest), w, h, x, y, t0, layer: extra.layer ?? 3, rot: extra.rot ?? ((seed * 37) % 7 - 3) * 0.012, ...extra,
});
const TAG_H = 0.58;
const tag = (id: string, seed: number, x: number, y: number, w: number, t0: number, name: string, role: string, stock: string, roleInk: string, extra: Partial<FilmPiece> = {}) =>
  piece(id, seed, x, y, w, TAG_H, t0, { stock, torn: [true, false, true, false], print: tagPrint2(name, role, INK, roleInk) }, { layer: 5, ...extra });

// group exits (seconds)
const K1_OUT = W("konteks", 10) - 0.05;
const K2_OUT = S.KONTEKS[1] + 1.0;
const H1_OUT = W("pengembangan", 10) - 0.1;
const H2_OUT = W("pengembangan", 23) - 0.1;
const H2B_OUT = W("pengembangan", 27) - 0.1;
const H3_OUT = S.PENGEMBANGAN[1] + 1.0;
const A1_OUT = W("penjelasan", 9) - 0.06;
const A2_OUT = W("penjelasan", 22) - 0.06;
const A3_OUT = W("penjelasan", 31) - 0.06;
const A4_OUT = S.PAYOFF[0] + 1.2; // after the cut, out of view

const PIECES: FilmPiece[] = [
  // ---- K1: 2026, the letter to the MPR ----
  piece("kDate", 401, -0.5, -1.22, 2.1, 0.52, W("konteks", 0), { stock: P.newsprint, torn: [true, true, true, false], print: linesPrint([{ t: "KAMIS · 12 NOV 2026", y: 0.55, size: 0.5, face: "mono", color: INK }]) }, { from: [-0.8, 0.3], t1: K1_OUT }),
  tag("kGibran", 402, 0.55, -1.86, 2.0, W("konteks", 2), "GIBRAN RAKABUMING RAKA", "WAPRES RI", P.ochre, "#7A1E14", { from: [0.8, 0.2], t1: K1_OUT }),
  piece("kEnvelope", 403, -0.45, -2.66, 2.0, 0.95, W("konteks", 4), { stock: "#F3ECDD", print: envelopePrint("SURAT PENGUNDURAN DIRI", "→ MPR", INK, RED) }, { from: [-0.7, -0.3], layer: 4, t1: K1_OUT }),
  piece("kMPR", 404, 1.02, -2.72, 0.9, 0.58, W("konteks", 9), { stock: RED, print: linesPrint([{ t: "MPR", y: 0.55, size: 0.62, face: "impact", color: P.paper }]) }, { from: [0.7, 0.1], layer: 6, rot: 0.08, t1: K1_OUT }),
  // ---- K2: two countries ----
  piece("kIndo", 405, -0.78, -3.5, 1.6, 0.52, W("konteks", 10), { stock: "#F2E3DA", print: linesPrint([{ t: "INDONESIA", y: 0.55, size: 0.56, face: "impact", color: RED }]) }, { from: [-0.8, -0.2], t1: K2_OUT }),
  piece("kUSA", 406, 0.8, -3.52, 1.5, 0.52, W("konteks", 12), { stock: "#DCE4EF", print: linesPrint([{ t: "AMERIKA", y: 0.55, size: 0.56, face: "impact", color: BLUE }]) }, { from: [0.8, -0.2], t1: K2_OUT }),
  piece("kQ", 407, 0.0, -4.25, 0.62, 0.74, W("konteks", 18), { stock: P.ochre, print: linesPrint([{ t: "?", y: 0.55, size: 0.85, face: "serif", color: INK }]) }, { from: [0, -0.8], layer: 7, rot: 0.12, t1: K2_OUT }),

  // ---- H1: the letter, 20 Juli 1956 ----
  piece("hDate", 501, -0.75, -5.3, 1.7, 0.64, W("pengembangan", 0), { stock: P.newsprint, torn: [true, true, true, false], print: linesPrint([{ t: "20 JULI 1956", y: 0.56, size: 0.6, face: "impact", color: RED }]) }, { from: [-0.8, 0.4], t1: H1_OUT }),
  piece("hLetter", 502, 0.68, -6.25, 1.5, 1.9, W("pengembangan", 3), { stock: "#F5EFE2", torn: [false, false, true, false], print: letterPrint("20 JULI 1956", "KETUA DPR", "M. Hatta", INK, RED) }, { from: [0.8, 0.3], layer: 2, rot: 0.03, t1: H1_OUT }),
  piece("hPeci", 503, -1.05, -6.05, 0.95, 0.84, W("pengembangan", 3) + 0.2, { stock: "#F4D9D2", photo: peciPhoto, ink: INK, cell: 9 }, { from: [-0.8, 0.2], t1: H1_OUT }),
  tag("hHatta", 504, -0.8, -6.85, 1.55, W("pengembangan", 4), "BUNG HATTA", "WAPRES RI", P.ochre, "#7A1E14", { from: [-0.7, -0.2], t1: H1_OUT }),
  tag("hSartono", 505, 0.72, -7.55, 1.55, W("pengembangan", 8), "SARTONO", "KETUA DPR", "#F2E3DA", "#7A1E14", { from: [0.8, -0.2], rot: -0.03, t1: H1_OUT }),
  // ---- H2: the reasons ----
  piece("hColonnade", 506, -0.8, -7.85, 1.6, 1.08, W("pengembangan", 10), { stock: "#F1E9DA", photo: colonnadePhoto, ink: RED }, { from: [-0.8, 0], layer: 3, t1: H2_OUT }),
  piece("hReason", 507, -0.75, -8.72, 1.75, 0.66, W("pengembangan", 12), { stock: P.paper, torn: [true, true, true, true], print: linesPrint([{ t: "DPR + KONSTITUANTE", y: 0.36, size: 0.3, face: "black", color: INK }, { t: "HASIL PEMILU", y: 0.74, size: 0.3, face: "black", color: RED }]) }, { from: [-0.6, -0.5], layer: 5, t1: H2_OUT }),
  piece("hBeda", 508, 0.85, -7.95, 1.45, 0.6, W("pengembangan", 18), { stock: P.pink, print: linesPrint([{ t: "JALAN KIAN", y: 0.33, size: 0.34, face: "black", color: INK }, { t: "BERBEDA", y: 0.72, size: 0.34, face: "black", color: INK }]) }, { from: [0.8, 0.2], layer: 4, t1: H2_OUT }),
  tag("hSoekarno", 509, 0.85, -8.75, 1.5, W("pengembangan", 22), "SOEKARNO", "PRESIDEN RI", P.ochre, "#7A1E14", { from: [0.8, -0.3], t1: H2_OUT }),
  // ---- H2b: parliament approves (stamp on the blank half of the sheet) ----
  piece("hSheet", 513, 0.0, -8.2, 2.0, 1.25, W("pengembangan", 23), { stock: "#F5EFE2", print: linesPrint([{ t: "SURAT BUNG HATTA", y: 0.17, size: 0.16, face: "black", color: INK }, { t: "KEPADA KETUA DPR", y: 0.34, size: 0.12, face: "black", color: RED }]) }, { from: [0, 0.8], layer: 6, rot: -0.02, t1: H2B_OUT }),
  // ---- H3: 1 Des 1956, the empty chair ----
  piece("hDes", 510, -0.62, -9.7, 1.95, 0.66, W("pengembangan", 27), { stock: P.newsprint, print: linesPrint([{ t: "1 DES 1956", y: 0.4, size: 0.44, face: "impact", color: RED }, { t: "RESMI BERHENTI", y: 0.8, size: 0.26, face: "black", color: INK }]) }, { from: [-0.8, 0.2], layer: 6, t1: H3_OUT }),
  piece("hChair", 511, 0.9, -9.85, 1.05, 1.05, W("pengembangan", 33), { stock: "#EFE6D6", photo: chairPhoto, ink: RED, cell: 9 }, { from: [0.8, 0.2], layer: 3, t1: H3_OUT }),
  piece("hKosong", 512, -0.4, -10.42, 2.15, 0.52, W("pengembangan", 36), { stock: INK, torn: [true, true, true, true], print: linesPrint([{ t: "KOSONG >16 TAHUN", y: 0.55, size: 0.5, face: "impact", color: P.ochre }]) }, { from: [-0.6, -0.4], layer: 8, rot: -0.04, t1: H3_OUT }),

  // ---- A1: 10 Oct 1973, Agnew ----
  piece("aCapitol", 601, 0.78, -11.8, 1.55, 1.08, W("penjelasan", 0), { stock: "#ECEEEA", photo: capitolPhoto, ink: BLUE }, { from: [0.8, 0.3], layer: 2, t1: A1_OUT }),
  piece("aDate", 602, -0.6, -11.36, 1.9, 0.64, W("penjelasan", 2), { stock: "#EDE6D3", torn: [true, true, true, false], print: linesPrint([{ t: "10 OCT 1973", y: 0.56, size: 0.6, face: "impact", color: BLUE }]) }, { from: [-0.8, 0.3], layer: 4, t1: A1_OUT }),
  tag("aAgnew", 603, -0.68, -12.2, 1.65, W("penjelasan", 6), "SPIRO AGNEW", "WAPRES AS", P.pink, "#173A78", { from: [-0.8, -0.1], t1: A1_OUT }),
  // ---- A2: the charge ----
  piece("aForm", 604, -0.75, -13.18, 1.6, 1.12, W("penjelasan", 12), { stock: "#EEF0E8", print: formPrint("FORMULIR PAJAK", "PENGGELAPAN PAJAK", INK, RED) }, { from: [-0.8, -0.2], layer: 3, t1: A2_OUT }),
  piece("aGavel", 605, 0.95, -13.62, 0.95, 0.85, W("penjelasan", 9), { stock: "#D3E0EF", photo: gavelPhoto, ink: INK, cell: 9 }, { from: [0.8, 0], layer: 3, t1: A2_OUT }),
  piece("aSuap", 606, 0.85, -12.88, 1.4, 0.6, W("penjelasan", 17), { stock: P.paper, print: linesPrint([{ t: "+ PENYELIDIKAN", y: 0.33, size: 0.3, face: "black", color: BLUE }, { t: "SUAP", y: 0.72, size: 0.34, face: "black", color: BLUE }]) }, { from: [0.8, 0.3], layer: 5, t1: A2_OUT }),
  // ---- A3: 25th Amendment, Nixon names Ford ----
  piece("aAmend", 607, 0.0, -14.0, 2.2, 0.95, W("penjelasan", 22), { stock: "#F5F0E4", print: docPrint("AMANDEMEN KE-25", "KONSTITUSI AS", "PERTAMA KALI DIPAKAI", INK, RED) }, { from: [-0.8, 0], layer: 4, t1: A3_OUT }),
  tag("aNixon", 608, -0.85, -14.98, 1.45, W("penjelasan", 25), "NIXON", "PRESIDEN AS", "#DCE4EF", "#173A78", { from: [-0.8, 0.1], t1: A3_OUT }),
  tag("aFord", 609, 0.85, -14.98, 1.55, W("penjelasan", 28), "GERALD FORD", "WAPRES BARU", P.ochre, "#173A78", { from: [0.8, -0.2], layer: 6, rot: -0.03, t1: A4_OUT }),
  // ---- A4: the votes ----
  piece("aSenat", 610, -0.82, -15.68, 1.45, 0.4, W("penjelasan", 31), { stock: P.newsprint, print: linesPrint([{ t: "SENAT", y: 0.56, size: 0.6, face: "black", color: INK }]) }, { from: [-0.8, 0.2], layer: 4, t1: A4_OUT }),
  piece("aDPR", 611, 0.82, -15.68, 1.5, 0.4, W("penjelasan", 33), { stock: P.newsprint, print: linesPrint([{ t: "DPR AS", y: 0.56, size: 0.6, face: "black", color: INK }]) }, { from: [0.8, 0.2], layer: 4, t1: A4_OUT }),
  piece("aV1", 612, -0.82, -16.2, 1.4, 0.62, W("penjelasan", 36), { stock: BLUE, print: linesPrint([{ t: "92 – 3", y: 0.56, size: 0.66, face: "impact", color: P.paper }]) }, { from: [-0.6, -0.4], layer: 6, rot: -0.04, t1: A4_OUT }),
  piece("aV2", 613, 0.82, -16.22, 1.5, 0.62, W("penjelasan", 40), { stock: RED, print: linesPrint([{ t: "387 – 35", y: 0.56, size: 0.66, face: "impact", color: P.paper }]) }, { from: [0.6, -0.4], layer: 6, rot: 0.04, t1: A4_OUT }),

  // ---- payoff: on the cleared cover board ----
  piece("pPrinsip", 701, -0.85, 2.2, 1.35, 0.56, W("payoff", 7), { stock: RED, print: linesPrint([{ t: "PRINSIP", y: 0.56, size: 0.66, face: "impact", color: P.paper }]) }, { from: [-0.8, 0.2], layer: 14, rot: -0.05 }),
  piece("pSkandal", 702, 0.85, 2.15, 1.35, 0.56, W("payoff", 10), { stock: BLUE, print: linesPrint([{ t: "SKANDAL", y: 0.56, size: 0.66, face: "impact", color: P.paper }]) }, { from: [0.8, 0.2], layer: 14, rot: 0.05 }),
  piece("p8w", 703, 0.88, 3.2, 1.45, 0.62, W("payoff", 16), { stock: P.ochre, print: linesPrint([{ t: "8 MINGGU", y: 0.56, size: 0.62, face: "impact", color: INK }]) }, { from: [0.8, 0.3], layer: 15, rot: -0.04 }),
  piece("p16y", 704, -0.88, 3.22, 1.45, 0.62, W("payoff", 20), { stock: INK, print: linesPrint([{ t: "16 TAHUN", y: 0.56, size: 0.62, face: "impact", color: P.ochre }]) }, { from: [-0.8, 0.3], layer: 15, rot: 0.04 }),
  piece("pUUD", 705, 0.0, 1.0, 2.45, 0.56, W("payoff", 24), { stock: P.paper, print: linesPrint([{ t: "UUD 1945 · PASAL 8", y: 0.56, size: 0.5, face: "black", color: INK }]) }, { from: [0, -0.6], layer: 16, rot: -0.02 }),
  piece("p60", 706, 0.1, 0.45, 2.05, 0.62, W("payoff", 33), { stock: RED, print: linesPrint([{ t: "MPR · ≤ 60 HARI", y: 0.56, size: 0.56, face: "impact", color: P.paper }]) }, { from: [0.6, -0.5], layer: 17, rot: 0.03 }),
];

const STAMP_DEFS: StampDef[] = [
  { id: "sSetuju", lines: [{ t: "DISETUJUI", size: 0.42 }, { t: "PARLEMEN", size: 0.24 }], color: "#B32A20", w: 1.3, h: 0.5, x: 0.05, y: -8.5, rot: -0.12, t0: W("pengembangan", 24), t1: H2B_OUT, layer: 9 },
  { id: "sMundur", lines: [{ t: "MUNDUR", size: 0.6 }], color: "#B32A20", w: 1.0, h: 0.36, x: 0.86, y: -12.0, rot: 0.12, t0: W("penjelasan", 8), t1: A1_OUT, layer: 9 },
];

/** Exit: slides back the way it came on twelves, lifting off the board. null = gone. */
const leave = (t: number, t1: number | undefined, from: [number, number] = [0.6, 0.4]): [number, number, number] | null => {
  if (t1 === undefined) return [0, 0, 0];
  const k = clamp01((stepTime(t, 12) - t1) / 0.3);
  if (k >= 1) return null;
  return [from[0] * k * k * 2.4, from[1] * k * k * 2.4, k * 0.3];
};

// ---------------- 3D components ----------------
const sheetGeo = (w: number, h: number, curl: number) => {
  const g = new THREE.PlaneGeometry(w, h, 18, 6);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / (w / 2);
    p.setZ(i, curl * u * u);
  }
  g.computeVertexNormals();
  return g;
};

const Piece: React.FC<{ p: FilmPiece; t: number; i: number }> = ({ p, t, i }) => {
  const tex = useMemo(() => scrapTexture(p.spec), [p.spec]);
  const geo = useMemo(() => sheetGeo(p.w, p.h, p.curl ?? 0.01), [p.w, p.h, p.curl]);
  const s = place(t, p.t0, 40 + i, p.from);
  const o = leave(t, p.t1, p.from);
  if (!s.shown || !o) return null;
  return (
    <mesh geometry={geo} position={[p.x + s.dx + o[0], p.y + s.dy + o[1], BASE + p.layer * LAYER + s.lift + o[2]]} rotation={[0, 0, p.rot + s.rot]} scale={[s.press, s.press, 1]} castShadow receiveShadow>
      <meshStandardMaterial map={tex} alphaTest={0.5} roughness={0.92} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Stamp: React.FC<{ d: StampDef; t: number; i: number }> = ({ d, t, i }) => {
  const tex = useMemo(() => stampTexture(d.id, d.lines, d.color, d.w / d.h, 900 + i), [d, i]);
  const s = place(t, d.t0, 90 + i, [0, 0]);
  const o = leave(t, d.t1, [0, 0.6]);
  if (!s.shown || !o) return null;
  const slam = 1 + (1 - clamp01((stepTime(t, 12) - d.t0) / 0.25)) * 0.35;
  return (
    <mesh position={[d.x + o[0], d.y + o[1], BASE + d.layer * LAYER + s.lift * 0.5 + o[2]]} rotation={[0, 0, d.rot]} scale={[slam * s.press, slam * s.press, 1]}>
      <planeGeometry args={[d.w, d.h]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.8} />
    </mesh>
  );
};

/** Warm pool of light on the active pieces (darker board edges); off on the cover frame. */
const KeyPool: React.FC<{ tx: number; ty: number; k: number }> = ({ tx, ty, k }) => {
  const ref = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.position.set(tx - 0.8, ty + 1.4, 6.5);
    l.target.position.set(tx, ty + 0.3, 0);
    l.target.updateMatrixWorld();
  }, [tx, ty]);
  return <spotLight ref={ref} intensity={1.6 * k} color="#FFD9A8" angle={0.36} penumbra={1} decay={0} distance={0} />;
};

/** Key light that follows the camera target down the wall, same direction as the cover light. */
const FollowKey: React.FC<{ ty: number; tx: number }> = ({ tx, ty }) => {
  const ref = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.position.set(tx - 2.2, ty + 6.4, 3.4);
    l.target.position.set(tx, ty, 0);
    l.target.updateMatrixWorld();
    l.shadow.camera.updateProjectionMatrix();
  }, [tx, ty]);
  return (
    <directionalLight
      ref={ref}
      intensity={2.6}
      color={P.lamp}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-4.2}
      shadow-camera-right={4.2}
      shadow-camera-top={4.2}
      shadow-camera-bottom={-4.2}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      shadow-bias={-0.0002}
      shadow-normalBias={0.01}
      shadow-radius={4}
    />
  );
};

/** Cover pieces the hand takes off: name tags right after the cover frame (the caption would sit on them),
 * and at the payoff cut the news, peci, gavel and brand tape, so the comparison lands on a clear board. */
const COVER_OUT: Record<string, [number, [number, number]]> = {
  tagHatta: [0.25, [-1, -0.2]],
  tagAgnew: [0.25, [1, -0.2]],
  newsHatta: [S.PAYOFF[0] + 0.3, [-1, 0.3]],
  newsAgnew: [S.PAYOFF[0] + 0.38, [1, 0.3]],
  peci: [S.PAYOFF[0] + 0.46, [-1, -0.3]],
  gavel: [S.PAYOFF[0] + 0.54, [1, -0.3]],
  tapeBrand: [S.PAYOFF[0] + 0.62, [0, -1]],
};
const coverOffset = (t: number) => (id: string): [number, number, number] | null => {
  const e = COVER_OUT[id];
  return e ? leave(t, e[0], e[1]) : [0, 0, 0];
};

// ---------------- camera ----------------
const FPS = 30;
const FOV = COVER_CAMERA.fov;
/** look at a subject; the target drops a little so the subject sits in the upper part of the frame */
const at = (x: number, y: number, dist: number, az = 0, el = 2.5): Framing => ({ target: [x, y - 0.01 * dist, 0], az, el, dist, fov: FOV });
const go = (x: number, y: number, dist: number, az = 0) => toFrame(at(x, y, dist, az));
const COVER_F: Framing = { target: COVER_CAMERA.target, az: COVER_CAMERA.az, el: COVER_CAMERA.el, dist: COVER_CAMERA.dist, fov: FOV };

/** shot on a piece group: the group centre y sits a little above frame centre, well above the caption */
const sub = (y: number, dist = 8.8, az = 0) => toFrame({ target: [0, y - 0.25, 0], az, el: 2.5, dist, fov: FOV });
/** outro: the whole cover board, every key scrap above the caption top */
const OUTRO_F: Framing = { target: [0, 1.3, 0], az: -3, el: 2.5, dist: 14.8, fov: FOV };

/** Hard cut from the 1973 tallies to the cover board, just before "Dua kisah ini berbeda". */
const CUT_AT = S.PAYOFF[0] - 0.06;

const RIG = shotPlan(FPS, COVER_F, [
  { at: 0, move: hold() },
  // HOOK
  { at: 1.7, move: go(0, 4.07, 11.5, 2) }, // into the ransom title (full board width: no cropped words)
  { at: W("hook", 11) + 0.25, move: go(-0.9, 2.85, 7.4, -6) }, // Jakarta 1956
  { at: W("hook", 14) + 0.35, move: go(0.9, 2.8, 7.4, 6) }, // Washington 1973
  { at: W("hook", 16) + 0.1, move: go(0, 1.85, 6.4, 0) }, // AUDIRA tape on the seam
  { at: S.HOOK[1] + 0.35, move: sub(-0.9, 9.0, -2) }, // tilt down the wall
  // KONTEKS
  { at: W("konteks", 2), move: sub(-1.75, 8.8, -3) }, // date + Gibran
  { at: W("konteks", 6), move: sub(-2.4, 8.8, 3) }, // envelope
  { at: W("konteks", 9) + 0.4, move: sub(-2.5, 8.6, 4) }, // MPR
  { at: W("konteks", 12), move: sub(-3.75, 8.4, 0) }, // Indonesia + Amerika
  { at: W("konteks", 19), move: sub(-3.85, 9.0, -2) }, // + ?
  { at: S.KONTEKS[1] + 0.3, move: sub(-5.0, 9.4, 0) }, // descend
  // PENGEMBANGAN
  { at: W("pengembangan", 1), move: sub(-5.4, 8.8, -3) }, // 20 Juli 1956
  { at: W("pengembangan", 5), move: sub(-6.1, 9.0, -4) }, // letter, peci, Hatta
  { at: W("pengembangan", 8) + 0.2, move: sub(-7.0, 9.0, 3) }, // Sartono (above the HUD tabs)
  { at: W("pengembangan", 12), move: sub(-8.1, 8.8, -3) }, // DPR + Konstituante
  { at: W("pengembangan", 19), move: sub(-8.3, 8.8, 4) }, // jalan berbeda, Soekarno
  { at: W("pengembangan", 24), move: sub(-8.2, 8.4, 0) }, // the sheet: DISETUJUI stamp
  { at: W("pengembangan", 29), move: sub(-9.8, 8.8, -3) }, // 1 Des 1956
  { at: W("pengembangan", 39), move: sub(-10.0, 8.8, 3) }, // empty chair, kosong >16 tahun
  { at: S.PENGEMBANGAN[1] + 0.45, move: sub(-11.1, 9.4, 0) }, // descend
  // PENJELASAN
  { at: W("penjelasan", 3), move: sub(-11.6, 8.8, 3) }, // 10 Oct 1973 + Capitol
  { at: W("penjelasan", 8), move: sub(-11.9, 8.8, -3) }, // Agnew + MUNDUR
  { at: W("penjelasan", 13), move: sub(-13.1, 8.8, -2) }, // tax form + gavel
  { at: W("penjelasan", 18), move: sub(-13.2, 8.8, 3) }, // + suap
  { at: W("penjelasan", 23), move: sub(-14.3, 8.8, -3) }, // Amandemen ke-25
  { at: W("penjelasan", 28), move: sub(-14.7, 8.8, 3) }, // Nixon -> Ford
  { at: W("penjelasan", 33), move: sub(-15.4, 9.2, 0) }, // Senat / DPR AS
  { at: W("penjelasan", 37), move: sub(-15.6, 9.6, -2) }, // both tallies, fully framed
  { at: CUT_AT, move: sub(-15.6, 10.1, 2) }, // slow push-out on the two-shot until the cut
]);
// PAYOFF opens on a hard cut back to the cover board; the hand clears it, then the comparison lands
const RIG_B = shotPlan(FPS, { target: [0, 2.0, 0], az: -4, el: 2.5, dist: 13.6, fov: FOV }, [
  { at: CUT_AT, move: hold() },
  { at: W("payoff", 7), move: sub(2.5, 10.6, 2) }, // prinsip vs skandal
  { at: W("payoff", 16), move: sub(2.9, 10.0, 5) }, // 8 minggu
  { at: W("payoff", 22), move: sub(2.75, 10.9, -4) }, // 16 tahun
  { at: W("payoff", 26), move: sub(1.3, 13.8, 0) }, // UUD pasal 8
  { at: W("payoff", 37), move: sub(1.35, 13.2, 3) }, // <= 60 hari
  // OUTRO: pull back to the whole board
  { at: S.OUTRO[0] + 2.0, move: toFrame(OUTRO_F) },
  { at: S.OUTRO[1], move: toFrame({ ...OUTRO_F, dist: OUTRO_F.dist * 1.03, az: OUTRO_F.az + 2 }) },
  { at: S.OUTRO[1] + 0.01, move: settle() },
]);
const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const filmShot = (frame: number, fps: number) => {
  const t = frame / fps;
  // the hook opens exactly on the approved cover; life drift fades in after the first second
  const shot = cameraAt(t < CUT_AT ? RIG : RIG_B, (t * FPS), FPS, { lens: LENS, alive: { deg: 1.6 * clamp01(t - 0.6), breath: 0.012 * clamp01(t - 0.6), seed: 10 } });
  return shot;
};

// ---------------- overlay: kicker, ILUSTRASI chip, karaoke captions ----------------
const KICKERS: { at: number; label: string }[] = [
  { at: 0, label: "SEJARAH DUNIA" },
  { at: S.KONTEKS[0], label: "2026 · HARI INI" },
  { at: S.PENGEMBANGAN[0], label: "INDONESIA · 1956" },
  { at: S.PENJELASAN[0], label: "AMERIKA · 1973" },
  { at: S.PAYOFF[0], label: "1956 VS 1973" },
  { at: S.OUTRO[0], label: "SEJARAH DUNIA" },
];
const ILUSTRASI: [number, number][] = [
  [W("konteks", 4) - 0.1, W("konteks", 10)],
  [W("pengembangan", 3), W("pengembangan", 9)],
  [W("pengembangan", 23) - 0.1, W("pengembangan", 27)],
];

type Chunk = { words: Word[]; lines: Word[][]; s: number; e: number };
const len = (ws: Word[]) => ws.reduce((a, w) => a + w.w.length, 0) + ws.length - 1;
const splitLines = (ws: Word[]): Word[][] => {
  if (ws.length <= 4 && len(ws) <= 22) return [ws];
  let best = 2, bd = 1e9;
  for (let k = 2; k <= ws.length - 2; k++) {
    const d = Math.abs(len(ws.slice(0, k)) - len(ws.slice(k)));
    if (d < bd) { bd = d; best = k; }
  }
  return [ws.slice(0, best), ws.slice(best)];
};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    const groups: Word[][] = [];
    let cur: Word[] = [];
    for (const w of c.words) {
      cur.push(w);
      const end = /[.?!:]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3) || cur.length >= 7 || len(cur) >= 36;
      if (end) { groups.push(cur); cur = []; }
    }
    if (cur.length) groups.push(cur);
    // no lonely word: merge a 1-word group into its neighbour
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1 && groups.length > 1) {
        if (i > 0 && groups[i - 1].length + 1 <= 8) { groups[i - 1].push(...groups[i]); groups.splice(i, 1); i--; }
        else if (i + 1 < groups.length) { groups[i + 1].unshift(...groups[i]); groups.splice(i, 1); i--; }
      }
    }
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      const e = next ? next[0].s : Math.min(g[g.length - 1].e + 0.6, c.end + 0.5);
      out.push({ words: g, lines: splitLines(g), s: g[0].s - 0.08, e });
    });
  }
  return out;
})();

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  const ts = stepTime(t, 12);
  let ki = 0;
  KICKERS.forEach((b, i) => { if (b.at <= ts) ki = i; });
  const ilus = ILUSTRASI.some(([a, b]) => t >= a && t < b);
  const chunk = t < OUTRO_AT ? CHUNKS.find((c) => t >= c.s && t < c.e) : undefined;
  const topKicker = t < 2.4;
  const chip = { background: P.chip, color: P.hud, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 34 * k, letterSpacing: 3 * k, padding: `${8 * k}px ${18 * k}px`, clipPath: "polygon(0 6%, 4% 0, 97% 3%, 100% 40%, 98% 100%, 3% 95%, 0 60%)" } as const;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {topKicker && (
        <div style={{ position: "absolute", top: 262 * k, left: 60 * k, transform: "rotate(-1.4deg)", transformOrigin: "left top" }}>
          <div style={{ ...chip, fontSize: 36 * k, letterSpacing: 4 * k, padding: `${10 * k}px ${22 * k}px` }}>
            <span style={{ color: P.accent }}>{String(ki + 1).padStart(2, "0")} </span>
            {KICKERS[ki].label}
          </div>
        </div>
      )}
      {!topKicker && (
        <div style={{ position: "absolute", top: 1218 * k, left: 70 * k, right: 70 * k, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ ...chip, transform: "rotate(-1deg)" }}>
            <span style={{ color: P.accent }}>{String(ki + 1).padStart(2, "0")} </span>
            {KICKERS[ki].label}
          </div>
          {ilus && <div style={{ ...chip, background: P.paper, color: INK, border: `${3 * k}px solid ${INK}`, clipPath: "none", transform: "rotate(1.5deg)" }}>ILUSTRASI</div>}
        </div>
      )}
      {chunk && (
        <div style={{ position: "absolute", top: 1290 * k, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: P.newsprint, padding: `${18 * k}px ${34 * k}px`, maxWidth: 960 * k, boxShadow: `0 ${8 * k}px ${22 * k}px rgba(0,0,0,0.45)`,
              clipPath: "polygon(0 4%, 3% 0, 50% 3%, 97% 0, 100% 6%, 99% 50%, 100% 95%, 96% 100%, 50% 97%, 4% 100%, 0 94%, 1% 50%)",
              transform: `rotate(${(CHUNKS.indexOf(chunk) % 2 ? 0.8 : -0.8)}deg)`,
            }}
          >
            {chunk.lines.map((line, li) => (
              <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 * k, lineHeight: 1.15 }}>
                {line.map((w, wi) => {
                  const active = t >= w.s && t < (w.e > w.s ? Math.max(w.e, w.s + 0.12) : w.s + 0.3);
                  const said = t >= w.s;
                  return (
                    <span
                      key={wi}
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 900, fontSize: 54 * k,
                        color: active ? INK : said ? INK : "rgba(28,26,23,0.5)",
                        background: active ? P.ochre : "transparent", padding: `0 ${6 * k}px`,
                        transform: `scale(${active ? 1.04 : 1})`, transformOrigin: "center", display: "inline-block",
                      }}
                    >
                      {w.w}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------- film ----------------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = filmShot(frame, fps);
  /** light falloff ramps in after the cover frame (frame 0 stays the approved cover) */
  const pool = clamp01((t - 0.4) / 1.0);
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 80 }}>
        <CameraRig shot={shot} near={0.05} far={80} />
        <hemisphereLight args={["#FFF1DE", "#2B2118", 0.42 - 0.14 * pool]} />
        <FollowKey tx={shot.target[0]} ty={shot.target[1]} />
        <KeyPool tx={shot.target[0]} ty={shot.target[1]} k={pool} />
        <directionalLight position={[shot.target[0] + 2.6, shot.target[1] + 2.0, 2.2]} intensity={0.45} color={P.rim} />
        <mesh position={[0, -7, -0.035]} receiveShadow>
          <planeGeometry args={[30, 44]} />
          <meshStandardMaterial color={P.bg} roughness={1} />
        </mesh>
        <KraftWall t={t} />
        <CoverWorld offset={coverOffset(t)} />
        {BOARDS.map((b) => (
          <Board key={b.seed} b={b} />
        ))}
        {GHOSTS.map((g, i) => (
          <GhostScrap key={i} g={g} />
        ))}
        {PIECES.map((p, i) => (
          <Piece key={p.id} p={p} t={t} i={i} />
        ))}
        {STAMP_DEFS.map((d, i) => (
          <Stamp key={d.id} d={d} t={t} i={i} />
        ))}
        <Finish frame={frame} background={P.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} envIntensity={0.25} exposure={0.95} />
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none", opacity: pool, background: "radial-gradient(115% 80% at 50% 40%, rgba(0,0,0,0) 48%, rgba(24,15,8,0.5) 100%)" }} />
      <Overlay t={t} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
