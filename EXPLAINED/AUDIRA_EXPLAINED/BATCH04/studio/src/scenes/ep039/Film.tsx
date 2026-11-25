// AE-039 film: "Bagaimana Minyak Bisa Mengalir Melalui Pipa di Dasar Laut?" (INNERWORKS).
// Every cut, beat, label and caption is read from timeline.json (Audio Master Clock).

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { P, R, X, project, ringPt } from "./layout.ts";
import { CORROSION, FilmPipeWorld, type PipeState } from "./FilmWorld.tsx";
import { OverviewWorld, OV, OV_PATH } from "./Overview.tsx";
import { LauncherWorld } from "./Launcher.tsx";
import { CUT, E, OUTRO_AT, S, TIMELINE, TOTAL, W, lerp, lerp3, ramp, smooth, type SceneId } from "./timing.ts";

type V3 = [number, number, number];
type Pose = { pos: V3; target: V3; fov: number };

const deg = (d: number) => (d * Math.PI) / 180;

// ---------------- shots ----------------
type ShotSpec = { id: string; t0: number; t1: number; scene: SceneId; pose: (t: number, k: number) => Pose };
const P2 = (a: Pose, b: Pose) => (_t: number, k: number): Pose => ({ pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) });

const pigJ = (t: number) => lerp(-2.2, 1.0, smooth(t, CUT.J + 0.1, CUT.K - 0.2));
const smartK = (t: number) => lerp(-1.3, 1.95, smooth(t, CUT.K + 0.1, W("l10", "mencari")));
const pigH = (t: number) => lerp(-3.3, -2.2, smooth(t, CUT.H, CUT.I));
const launchPig = (t: number) => lerp(-5.6, -3.0, smooth(t, CUT.I + 0.1, W("l09", "pipa", true)));

const SHOTS: ShotSpec[] = [
  { id: "A", t0: CUT.A, t1: CUT.B, scene: "pipe", pose: P2({ pos: [-12.5, 3.6, 9.6], target: [0.6, -0.4, 0], fov: 37 }, { pos: [5.5, 3.0, 5.6], target: [40, -0.9, -1.5], fov: 40 }) },
  { id: "B", t0: CUT.B, t1: CUT.C, scene: "pipe", pose: P2({ pos: [-5.0, 2.6, 4.2], target: [1.2, -0.2, 0], fov: 36 }, { pos: [-4.4, 2.35, 3.9], target: [1.5, -0.2, 0], fov: 36 }) },
  { id: "C", t0: CUT.C, t1: CUT.D, scene: "overview", pose: P2({ pos: [-7.0, 8.4, 4.4], target: [-3.3, 6.7, 0.3], fov: 36 }, { pos: [-17, 10, 14], target: [0.2, 2.6, 0], fov: 44 }) },
  { id: "D", t0: CUT.D, t1: CUT.E, scene: "pipe", pose: P2({ pos: [-8.8, 1.7, 2.8], target: [-3.3, -0.25, 0], fov: 36 }, { pos: [-8.2, 1.5, 2.5], target: [-3.2, -0.25, 0], fov: 35 }) },
  { id: "E", t0: CUT.E, t1: CUT.F, scene: "pipe", pose: P2({ pos: [-15.5, 4.0, 10], target: [1.2, -0.4, 0], fov: 37 }, { pos: [-13.0, 5.6, 12.4], target: [1.6, -0.3, 0], fov: 37 }) },
  { id: "F", t0: CUT.F, t1: CUT.G, scene: "pipe", pose: P2({ pos: [-5.4, 2.7, 4.3], target: [1.0, -0.2, 0], fov: 36 }, { pos: [-4.6, 2.4, 3.9], target: [1.2, -0.2, 0], fov: 36 }) },
  { id: "G", t0: CUT.G, t1: CUT.H, scene: "pipe", pose: P2({ pos: [-12.5, 3.8, 9.5], target: [0.2, -0.3, 0], fov: 34 }, { pos: [-11.2, 4.8, 10.6], target: [0.6, -0.3, 0], fov: 34 }) },
  { id: "H", t0: CUT.H, t1: CUT.I, scene: "pipe", pose: P2({ pos: [-6.5, 2.6, 3.6], target: [-1.4, -0.1, 0], fov: 36 }, { pos: [-5.9, 2.4, 3.3], target: [-1.1, -0.1, 0], fov: 36 }) },
  { id: "I", t0: CUT.I, t1: CUT.J, scene: "launcher", pose: P2({ pos: [-9.6, 3.0, 8.0], target: [-2.4, 0.2, -0.4], fov: 36 }, { pos: [-8.6, 2.6, 7.2], target: [-2.6, 0.1, -0.4], fov: 35 }) },
  {
    id: "J",
    t0: CUT.J,
    t1: CUT.K,
    scene: "pipe",
    pose: (t) => {
      const cx = pigJ(t) + 0.95;
      return { pos: [cx - 9.4, 4.3, 7.2], target: [cx + 0.6, -0.3, 0], fov: 36 };
    },
  },
  {
    id: "K",
    t0: CUT.K,
    t1: CUT.L,
    scene: "pipe",
    pose: (t) => {
      const cx = smartK(t) + 0.9;
      return { pos: [cx - 9.4, 4.3, 7.2], target: [cx + 0.6, -0.3, 0], fov: 36 };
    },
  },
  { id: "L", t0: CUT.L, t1: CUT.M, scene: "pipe", pose: P2({ pos: [-15.2, 4.2, 10.4], target: [0.6, -0.5, 0], fov: 37 }, { pos: [-14.0, 5.6, 11.8], target: [1.0, -0.5, 0], fov: 37 }) },
  { id: "M", t0: CUT.M, t1: CUT.END, scene: "pipe", pose: P2({ pos: [-14.6, 4.3, 10.2], target: [0.6, -0.5, 0], fov: 37 }, { pos: [-22, 12.5, 21], target: [9, -1.0, 0], fov: 42 }) },
];

const shotAt = (t: number) => SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
const camAt = (t: number): Shot => {
  const s = shotAt(t);
  const k = s.id === "M" ? smooth(t, s.t0, OUTRO_AT) : smooth(t, s.t0 - 0.4, s.t1 + 0.4);
  const p = s.pose(t, k);
  return { pos: p.pos, target: p.target, fov: p.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1 };
};

// ---------------- world state ----------------
const pipeState = (t: number, shot: string): PipeState => {
  const base: PipeState = {
    t,
    concX0: X.conc,
    insX0: X.ins,
    coatGlow: 0,
    anodeGlow: 0,
    steelHeat: 0,
    growth: 0.35,
    scrapeX: -99,
    pigDx: null,
    smartDx: null,
    heat: 0,
    cable: 0,
    corrosion: 0,
  };
  switch (shot) {
    case "B":
      return { ...base, growth: 0.6 };
    case "E":
      return { ...base, heat: smooth(t, W("l05", "dingin") - 0.4, W("l05", "dingin") + 0.4) };
    case "F":
      return { ...base, growth: lerp(0.15, 1, smooth(t, W("l06", "lilin") - 0.2, W("l06", "menempel", true))) };
    case "G": {
      // peel concrete + insulation back along the pipe, then re-wrap insulation on "insulasi"
      const peel = smooth(t, CUT.G + 0.05, W("l07", "pipa") + 0.1);
      const ins = smooth(t, W("l07", "pipa") + 0.15, W("l07", "insulasi", true));
      return {
        ...base,
        growth: 1,
        concX0: lerp(X.conc, X.cutEnd, peel),
        insX0: ins > 0 ? lerp(X.cutEnd, X.ins, ins) : lerp(X.ins, X.cutEnd, peel),
        steelHeat: smooth(t, W("l07", "dipanaskan"), W("l07", "listrik", true)),
        cable: smooth(t, W("l07", "listrik") - 0.2, W("l07", "listrik") + 0.3),
      };
    }
    case "H":
      return { ...base, growth: 1, concX0: X.cutEnd, pigDx: pigH(t) };
    case "J":
      return { ...base, growth: 1, concX0: X.cutEnd, pigDx: pigJ(t) };
    case "K": {
      const sx = smartK(t) + 0.35;
      return { ...base, growth: 1, concX0: X.cutEnd, scrapeX: 99, smartDx: smartK(t), corrosion: sx > 1.8 ? 2 : 1 };
    }
    case "L": {
      const coat = smooth(t, W("l11", "anti") - 0.2, W("l11", "anti")) * (1 - smooth(t, W("l11", "gelang") - 0.1, W("l11", "gelang") + 0.3));
      const an = smooth(t, W("l11", "gelang") - 0.2, W("l11", "gelang")) * (1 - smooth(t, W("l11", "beton") - 0.1, W("l11", "beton") + 0.3));
      return {
        ...base,
        growth: 1,
        pigDx: X.pigBack,
        concX0: lerp(X.cutEnd, X.conc, smooth(t, W("l11", "beton") - 0.1, W("l11", "pemberat", true))),
        coatGlow: coat * (0.7 + 0.3 * Math.sin(t * 9)),
        anodeGlow: an * (0.6 + 0.4 * Math.sin(t * 9)),
      };
    }
    case "M":
      return { ...base, growth: 1, pigDx: X.pigBack };
    default:
      return base;
  }
};

// ---------------- overlay: labels, HUD, captions ----------------
type Lab = { text: string; at: number; anchor: V3; color: string; dy?: number; side?: "left" | "right" };
const oilEnd = X.steel + 0.15;
const LABELS: Record<string, (t: number) => Lab[]> = {
  A: () => [{ text: "Puluhan km ke darat", at: W("l01", "puluhan") - 0.1, anchor: [30, 1.4, 0], color: P.amber, dy: -120 }],
  B: () => [{ text: "Tersumbat?", at: W("l02", "tersumbat") - 0.1, anchor: ringPt(1.9, R.steelIn - 0.12, deg(110)), color: P.wax, dy: -170 }],
  C: () => [
    { text: "Platform", at: W("l03", "platform") - 0.1, anchor: [OV.platX - 0.6, OV.deckY + 1.2, -0.4], color: "#6ccdaa", dy: -140 },
    { text: "Pompa", at: W("l03", "pompa") - 0.05, anchor: OV.pump, color: "#f4b33f", dy: -60 },
    { text: "Darat", at: W("l03", "darat") - 0.05, anchor: [OV.tank[0], OV.tank[1] + 1, 0], color: "#ef7a43", dy: -120 },
    { text: "Pipa baja", at: W("l03", "pipa") - 0.05, anchor: OV_PATH.getPointAt(0.6).toArray() as V3, color: P.concreteCut, dy: 120 },
  ],
  D: () => [
    { text: "Gas", at: W("l04", "gas") - 0.05, anchor: [oilEnd + 0.02, 0.3, -0.25], color: "#cfe9f0", dy: -150 },
    { text: "Minyak", at: W("l04", "minyak") - 0.05, anchor: [oilEnd + 0.02, -0.32, -0.1], color: "#7a4a22", dy: -40 },
    { text: "Air", at: W("l04", "air") - 0.05, anchor: [oilEnd + 0.02, -0.68, -0.1], color: "#5f8f9c", dy: 90 },
  ],
  E: () => [],
  F: () => [
    { text: "Lilin mengkristal", at: W("l06", "mengkristal") - 0.1, anchor: ringPt(1.6, R.steelIn - 0.16, deg(105)), color: P.wax, dy: -170 },
    { text: "Menempel di dinding", at: W("l06", "menempel") - 0.1, anchor: ringPt(2.2, R.steelIn - 0.2, deg(300)), color: P.wax, dy: 110 },
  ],
  G: () => [
    { text: "Insulasi", at: W("l07", "insulasi") - 0.1, anchor: ringPt(X.ins + 0.02, (R.coatOut + R.insOut) / 2, deg(118)), color: P.insulation, dy: -110 },
    { text: "Listrik lewat dinding baja", at: W("l07", "listrik") - 0.1, anchor: ringPt(X.steel + 0.02, (R.steelIn + R.steelOut) / 2, deg(200)), color: "#ff7a2a", dy: 130, side: "left" },
  ],
  H: (t) => [
    { text: "Lilin", at: W("l08", "lilin") - 0.1, anchor: ringPt(1.2, R.steelIn - 0.14, deg(110)), color: P.wax, dy: -130 },
    { text: "Pig", at: W("l08", "pig") - 0.1, anchor: [pigH(t) + 0.62, 0.55, 0.3], color: P.pigCup, dy: 160 },
  ],
  I: (t) => [{ text: "Launcher", at: S("l09"), anchor: [-3.4, 1.1, 0.2], color: P.steelCut, dy: -150 }, { text: "Pig masuk", at: W("l09", "dimasukkan"), anchor: [launchPig(t) + 1.2, 0.5, 0.3], color: P.pigCup, dy: 170 }],
  J: (t) => [
    { text: "Didorong aliran", at: W("l09", "didorong") - 0.1, anchor: [pigJ(t) - 0.5, 0.24, -0.1], color: P.amber, dy: 170, side: "left" },
    { text: "Mengikis lilin", at: W("l09", "mengikis") - 0.1, anchor: [pigJ(t) + 2.3, -0.45, 0.1], color: P.wax, dy: -260, side: "right" },
  ],
  K: (t) => [
    { text: "Pig pintar", at: W("l10", "pintar") - 0.1, anchor: [smartK(t) + 1.5, 0.3, 0.12], color: P.cyan, dy: -200 },
    { text: "Sensor", at: W("l10", "sensor") - 0.1, anchor: [smartK(t) + 0.35, 0.4, 0.42], color: P.cyan, dy: 170, side: "left" },
    ...(smartK(t) + 0.35 > 1.8 ? [{ text: "Karat", at: W("l10", "mencari") - 0.1, anchor: CORROSION, color: "#ff3b2f", dy: -120, side: "right" as const }] : []),
  ],
  L: () => [
    { text: "Anti karat", at: W("l11", "anti") - 0.1, anchor: ringPt(X.coat + 0.02, (R.steelOut + R.coatOut) / 2 + 0.01, deg(150)), color: "#3a3f45", dy: 60, side: "left" },
    { text: "Gelang anoda", at: W("l11", "gelang") - 0.1, anchor: ringPt(5.7, R.concOut + 0.03, deg(70)), color: P.anode, dy: -60 },
    { text: "Beton pemberat", at: W("l11", "beton") - 0.1, anchor: ringPt(X.conc + 0.02, (R.insOut + R.concOut) / 2, deg(110)), color: P.concreteCut, dy: -130, side: "left" },
  ],
  M: () => [],
};

const LabelTag: React.FC<{ l: Lab; t: number; shot: Shot; t1: number }> = ({ l, t, shot, t1 }) => {
  const k = ramp(t, l.at, l.at + 0.25) * (1 - ramp(t, t1 - 0.2, t1));
  if (k <= 0) return null;
  const [ax, ay] = project(l.anchor, shot);
  const side = l.side ?? (ax < 540 ? "left" : "right");
  const ty = Math.min(1480, Math.max(560, ay + (l.dy ?? 0)));
  const tx = side === "left" ? 64 : 1016;
  const elbowX = side === "left" ? Math.min(ax - 40, 360) : Math.max(ax + 40, 720);
  const pop = 0.85 + 0.15 * Math.min(1, k * 1.2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${ax},${ay} ${elbowX},${ty} ${side === "left" ? tx + 10 : tx - 10},${ty}`} fill="none" stroke="#e8f6fa" strokeWidth={2.5} strokeOpacity={0.75} />
        <circle cx={ax} cy={ay} r={8} fill="#08202b" stroke="#e8f6fa" strokeWidth={3} />
        <circle cx={ax} cy={ay} r={3.5} fill={l.color} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ty - 30,
          ...(side === "left" ? { left: tx } : { right: 1080 - tx }),
          transform: `scale(${pop})`,
          transformOrigin: side === "left" ? "left center" : "right center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 32,
          color: "#0c1a20",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(244,247,248,0.93)",
          padding: "6px 16px",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: l.color, border: "1.5px solid rgba(0,0,0,0.25)", display: "inline-block" }} />
        {l.text}
      </div>
    </div>
  );
};

const ColdCard: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("l05", "laut") - 0.1, W("l05", "laut") + 0.2) * (1 - ramp(t, CUT.F - 0.2, CUT.F));
  if (k <= 0) return null;
  const temp = smooth(t, W("l05", "nol") - 0.2, W("l05", "derajat", true));
  return (
    <div style={{ position: "absolute", top: 230, right: 64, opacity: k, fontFamily: FONT, color: P.ink, background: "rgba(6,32,46,0.78)", border: "1.5px solid rgba(111,227,255,0.55)", borderRadius: 18, padding: "20px 26px", display: "flex", gap: 22, alignItems: "center" }}>
      <div style={{ width: 22, height: 150, borderRadius: 11, background: "rgba(255,255,255,0.12)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${lerp(80, 18, temp)}%`, background: `linear-gradient(0deg, #5fd0ff, ${temp > 0.5 ? "#5fd0ff" : "#ff9a3c"})` }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "0.22em", color: P.cyan }}>LAUT DALAM</div>
        <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05 }}>±0–3 °C</div>
        <div style={{ fontSize: 26, fontWeight: 500, opacity: 0.8 }}>dinding pipa melepas panas</div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ text: string; from: number; to: number; t: number; color: string }> = ({ text, from, to, t, color }) => {
  const k = ramp(t, from, from + 0.25) * (1 - ramp(t, to - 0.2, to));
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: P.ink, background: "rgba(6,32,46,0.8)", border: `1.5px solid ${color}`, borderRadius: 999, padding: "10px 26px", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: color }} />
        {text}
      </div>
    </div>
  );
};

const SinkArrow: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("l11", "supaya") - 0.1, W("l11", "supaya") + 0.2) * (1 - ramp(t, CUT.M - 0.2, CUT.M));
  if (k <= 0) return null;
  const [x, y] = project([1.4, -0.2, 1.6], camAt(t));
  const bob = 10 * Math.sin(t * 6);
  return (
    <div style={{ position: "absolute", left: x - 160, top: y - 330 + bob, width: 320, opacity: k, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 32, fontWeight: 600, color: "#0c1a20", background: "rgba(244,247,248,0.93)", borderRadius: 10, padding: "6px 16px", whiteSpace: "nowrap" }}>Berat menahan pipa</div>
      <svg width={80} height={120} viewBox="0 0 80 120">
        <path d="M40 4 V96 M14 70 L40 104 L66 70" stroke={P.amber} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Karaoke captions: phrases of up to 5 words, broken at punctuation; active word in amber with a micro-bounce.
type Phrase = { words: { w: string; s: number; e: number }[]; t0: number; t1: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of TIMELINE.clips) {
    let cur: Phrase["words"] = [];
    // break at punctuation, then into balanced chunks of at most 4 words (never a lone word)
    const splitFlush = () => {
      const n = cur.length;
      if (!n) return;
      const parts = Math.ceil(n / 4);
      const base = Math.floor(n / parts);
      let extra = n % parts;
      let i = 0;
      for (let p = 0; p < parts; p++) {
        const size = base + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;
        const ws = cur.slice(i, i + size);
        i += size;
        out.push({ words: ws, t0: ws[0].s - 0.08, t1: 0 });
      }
      cur = [];
    };
    for (const w of c.words) {
      cur.push(w);
      if (/[,.?!]$/.test(w.w)) splitFlush();
    }
    splitFlush();
  }
  for (let i = 0; i < out.length; i++) {
    const last = out[i].words[out[i].words.length - 1].e;
    out[i].t1 = i + 1 < out.length ? Math.min(out[i + 1].t0, last + 0.6) : last + 0.6;
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p) => t >= p.t0 && t < p.t1);
  if (!ph) return null;
  const k = ramp(t, ph.t0, ph.t0 + 0.12);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 400, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: Math.min(56, Math.floor((56 * 28) / Math.max(28, ph.words.map((w) => w.w).join(" ").length))), lineHeight: 1.2, whiteSpace: "nowrap", textAlign: "center", color: "#eef6f8", background: "rgba(4,18,26,0.62)", borderRadius: 22, padding: "16px 28px", borderBottom: `4px solid ${P.amber}` }}>
        {ph.words.map((w, i) => {
          const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
          const done = t >= w.e;
          const b = active ? Math.sin(ramp(t, w.s, w.s + 0.18) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 16, color: active ? P.amber : done ? "#eef6f8" : "rgba(238,246,248,0.55)", transform: `translateY(${-8 * b}px) scale(${1 + 0.08 * b})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const s = shotAt(t);
  const shot = camAt(t);
  const labs = LABELS[s.id]?.(t) ?? [];
  const cold = s.id === "E" ? 0.18 * smooth(t, W("l05", "dingin") - 0.4, W("l05", "dingin") + 0.4) : s.id === "F" ? 0.1 : 0;
  // dark dip across each cut (the camera move continues on the far side)
  const cuts = [CUT.B, CUT.C, CUT.D, CUT.E, CUT.F, CUT.G, CUT.H, CUT.I, CUT.J, CUT.K, CUT.L, CUT.M];
  const dip = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.13));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {cold > 0 ? <div style={{ position: "absolute", inset: 0, background: "#3aa6d8", mixBlendMode: "soft-light", opacity: cold * 3 }} /> : null}
      {labs.map((l) => (
        <LabelTag key={l.text} l={l} t={t} shot={shot} t1={s.t1} />
      ))}
      <ColdCard t={t} />
      <Chip text="Produksi jalan terus" from={W("l09", "tanpa") - 0.1} to={CUT.K} t={t} color={P.amber} />
      <Chip text="Isinya campuran" from={S("l04")} to={CUT.E} t={t} color="#cfe9f0" />
      <Chip text="Pompa → darat" from={W("l03", "mendorong") - 0.1} to={E("l03") + 0.1} t={t} color="#f4b33f" />
      <SinkArrow t={t} />
      <Captions t={t} />
      {dip > 0 ? <div style={{ position: "absolute", inset: 0, background: "#02090e", opacity: dip * 0.85 }} /> : null}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = shotAt(t);
  const shot = camAt(t);
  return (
    <AbsoluteFill>
      <Stage3D background={P.bgBottom} overlay={() => <Overlay t={t} />}>
        <CameraRig shot={shot} near={0.2} far={700} />
        {s.scene === "pipe" ? <FilmPipeWorld s={pipeState(t, s.id)} /> : null}
        {s.scene === "overview" ? <OverviewWorld t={t} pumpOn={smooth(t, W("l03", "pompa") - 0.3, W("l03", "pompa"))} flow={smooth(t, W("l03", "mendorong") - 0.2, W("l03", "mendorong") + 0.3)} /> : null}
        {s.scene === "launcher" ? <LauncherWorld t={t} pigX={launchPig(t)} door={1 - smooth(t, CUT.J - 0.5, CUT.J)} /> : null}
        <Finish frame={frame} hdri="studio" profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} ao />
      </Stage3D>
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

export const FILM_SECONDS = TOTAL;
