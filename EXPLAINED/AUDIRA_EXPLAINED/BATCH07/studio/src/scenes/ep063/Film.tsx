// AE-063 film (BUILDFORGE): six scenes on the VO clock (timeline.json = Audio Master Clock).
// HOOK stadium + bicycle · KONTEKS sliced tribune · MEKANISME Stuttgart cable wheel assembly ·
// REVEAL force model · PAYOFF JIS space frame lift · OUTRO hero stadium.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { makeCamera, orbit, project, type Pose, type V3 } from "./camera.ts";
import { CL, SEC, TOTAL, wordT } from "./timing.ts";
import { cablePoint, innerPoint, outerPoint, STUTT, useMats } from "./world.tsx";
import {
  BIKE_POS, BikeOverlay, ForceScene, FULL_ROOF, HookBike, JisScene, LIFT_REST, LIFT_TOP, roofChain,
  SectionScene, Stadium,
} from "./scenes.tsx";

const SKY = "#cfe3ef";
export const FONT = "Manrope, 'Segoe UI', sans-serif";
export const ACC = "#ff8a3d";
const CARD_BG = "rgba(12,30,38,0.84)";

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- scene cuts (VO seconds) ----------------
const T_K = SEC.KONTEKS[0] - 0.3;
const T_M = SEC.MEKANISME[0] - 0.3;
const T_R = SEC.REVEAL[0] - 0.3;
const T_P = SEC.PAYOFF[0] - 0.3;
const T_O = SEC.OUTRO[0] - 0.3;
const T_CARD = SEC.OUTRO[1] + 0.2;
const T_BIKE = CL[1].start - 0.15;

// story beats
const W = {
  tiang: wordT(0, "tiang"),
  roda0: wordT(1, "roda"),
  hanya: wordT(2, "hanya"),
  tepi: wordT(2, "tepi"),
  masalahnya: wordT(3, "masalahnya"),
  menjorok: wordT(3, "menjorok"),
  melengkung: wordT(3, "melengkung"),
  stuttgart: wordT(4, "stuttgart"),
  roda: wordT(4, "roda"),
  tarik: wordT(5, "cincin"),
  tekan: wordT(6, "cincin"),
  empat: wordT(7, "empat"),
  jari: wordT(7, "jari"),
  kabel: CL[8].start,
  ditarik: wordT(8, "ditarik"),
  dorongan: wordT(8, "menahan"),
  cincinLuar: wordT(8, "cincin"),
  tarikan: wordT(9, "tarikan"),
  meniadakan: wordT(9, "meniadakan"),
  seberat: wordT(9, "seberat"),
  ditopang: wordT(9, "cukup"),
  cara: wordT(10, "cara"),
  jis: wordT(11, "jis"),
  rangka: wordT(11, "rangka"),
  tiga: wordT(11, "tiga"),
  dirakit: wordT(12, "dirakit"),
  diangkat: wordT(12, "diangkat"),
  enam: wordT(12, "enam"),
  seimbang: wordT(13, "seimbang"),
};

// ---------------- shots ----------------
type Shot = { t0: number; t1: number; a: Pose; b: Pose };
const P = (pos: V3, target: V3, fov = 40): Pose => ({ pos, target, fov });
const O = (c: V3, r: number, az: number, el: number, fov = 38): Pose => ({ pos: orbit(c, r, az, el), target: c, fov });
const BK = BIKE_POS;
const SHOTS: Shot[] = [
  // HOOK: from the pitch up to the roof edge + board, then the bicycle wheel on the plaza
  { t0: 0, t1: T_BIKE, a: P([-3, 2.4, 12], [0, 9.5, -24], 64), b: P([2.5, 5.5, 5], [0, 11.5, -24], 60) },
  { t0: T_BIKE, t1: T_K, a: P([BK[0] - 4.8, 1.4, BK[2] - 9.3], [BK[0] + 0.15, 1.12, BK[2]], 40), b: P([BK[0] - 3.0, 1.7, BK[2] - 9.8], [BK[0] + 0.05, 1.1, BK[2]], 40) },
  // KONTEKS: sliced tribune
  { t0: T_K, t1: CL[3].start - 0.1, a: P([13, 3.2, -13], [0, 5.5, 2.5], 50), b: P([10, 4.2, -15], [0, 6, 2.5], 50) },
  { t0: CL[3].start - 0.1, t1: T_M, a: P([-55, 6.5, 9], [0, 8.6, 0.5], 36), b: P([-51, 7.2, 5.5], [0, 8.4, 0], 36) },
  // MEKANISME: Stuttgart roof assembly
  { t0: T_M, t1: CL[5].start - 0.1, a: O([0, 4, 0], 100, 200, 46), b: O([0, 4, 0], 88, 214, 56) },
  { t0: CL[5].start - 0.1, t1: CL[6].start - 0.1, a: P([4, 13, 36], [0, 6, -2], 50), b: P([10, 16, 33], [0, 9, -4], 50) },
  { t0: CL[6].start - 0.1, t1: CL[7].start - 0.1, a: P([-38, 17, 16], [-22, 12, -8], 46), b: P([-37, 19, 4], [-20, 12, -16], 46) },
  { t0: CL[7].start - 0.1, t1: T_R, a: O([0, 6, 0], 78, 20, 58), b: O([0, 6, 0], 92, 40, 76) },
  // REVEAL: force model
  { t0: T_R, t1: CL[9].start - 0.1, a: O([3.9, 7, -7.2], 130, -28, 46), b: O([2, 7, -8], 124, -14, 52) },
  { t0: CL[9].start - 0.1, t1: W.seberat - 0.25, a: O([0, 8, 0], 96, 0, 84, 40), b: O([0, 8, 0], 94, 25, 82, 40) },
  { t0: W.seberat - 0.25, t1: T_P, a: P([40, 4.5, 22], [8, 9, -6], 50), b: P([35, 3.2, 31], [4, 9.5, -2], 50) },
  // PAYOFF: JIS space frame
  { t0: T_P, t1: W.rangka - 0.1, a: P([-11, 17, 12], [-20, 6, -2], 48), b: P([0, 25, 22], [-13, 7, -6], 46) },
  { t0: W.rangka - 0.1, t1: W.diangkat - 0.3, a: P([0, 25, 22], [-13, 7, -6], 46), b: O([0, 7, 0], 92, -40, 48) },
  { t0: W.diangkat - 0.3, t1: T_O, a: O([0, 9, 0], 92, -42, 30, 40), b: O([0, 11, 0], 86, -62, 18, 40) },
  // OUTRO: hero stadium
  { t0: T_O, t1: TOTAL + 1, a: O([0, 6, -2], 92, 22, 36), b: O([0, 6, -2], 84, -4, 30) },
];
const poseAt = (t: number) => {
  const i = Math.max(0, SHOTS.findIndex((s) => t >= s.t0 && t < s.t1));
  const s = SHOTS[i];
  const k = Easing.inOut(Easing.sin)(clamp01((t - s.t0) / (s.t1 - s.t0)));
  return { pose: { pos: lerp3(s.a.pos, s.b.pos, k), target: lerp3(s.a.target, s.b.target, k), fov: lerp(s.a.fov, s.b.fov, k) } as Pose, i };
};

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 1200;
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

// ---------------- state from the clock ----------------
const roofAt = (t: number) => {
  if (t < T_M || t >= T_O) return FULL_ROOF;
  return {
    inner: t >= W.tarik - 1.2 ? 1 : 0,
    innerLift: ramp(t, W.tarik - 1.2, W.tarik + 0.4),
    outer: ramp(t, W.tekan - 0.5, W.tekan + 0.5),
    cables: 40 * ramp(t, W.empat - 0.6, W.empat + 0.9),
    membrane: 0,
    colour: true,
  };
};
const forceAt = (t: number) => ({
  pull: ramp(t, W.ditarik - 0.3, W.ditarik + 0.3),
  push: ramp(t, W.cincinLuar - 0.05, W.cincinLuar + 0.5),
  cancel: ramp(t, W.meniadakan + 0.2, W.meniadakan + 1.2),
  weight: t >= W.seberat - 0.25 ? 1 : 0,
  cols: ramp(t, W.ditopang - 0.4, W.ditopang + 0.6),
  pulse: t >= W.tarikan && t < W.meniadakan + 0.2 ? 1 : 0,
});

// ---------------- HUD: anchored callouts + cards ----------------
type Note = { t0: number; t1: number; text: string; at: (t: number) => V3; dx: number; dy: number; color?: string };
const NOTES: Note[] = [
  { t0: CL[0].start + 0.1, t1: W.tiang - 0.1, text: "atap membran", at: () => [0, 12.6, -20], dx: -150, dy: -180 },
  { t0: CL[2].start, t1: W.hanya, text: "tiang di depan = pandangan terhalang", at: () => [0.6, 6.5, -0.4], dx: -40, dy: -330, color: "#ff4b3e" },
  { t0: W.tepi - 0.1, t1: CL[3].start - 0.15, text: "tiang hanya di tepi luar", at: () => [0, 9.5, 8.8], dx: -200, dy: -260, color: "#22b573" },
  { t0: W.menjorok - 0.1, t1: W.melengkung - 0.1, text: "atap menjorok ke lapangan", at: () => roofChain(0)[8], dx: 40, dy: -300 },
  { t0: W.melengkung - 0.1, t1: T_M - 0.1, text: "melengkung jatuh ↓", at: (t) => roofChain(bendAt(t))[8], dx: 40, dy: 230, color: "#ff4b3e" },
  { t0: W.tarik, t1: CL[6].start - 0.15, text: "cincin tarik (tengah)", at: () => innerPoint(STUTT, 12), dx: -120, dy: -330, color: "#2f8dff" },
  { t0: W.tekan, t1: CL[7].start - 0.15, text: "cincin tekan (baja, tepi luar)", at: () => outerPoint(STUTT, 33), dx: 30, dy: -330, color: "#ff7a2a" },
  { t0: W.jari - 0.1, t1: T_R - 0.1, text: "= jari-jari sepeda", at: () => cablePoint(STUTT, 5, 0.5), dx: -60, dy: -260, color: "#2f8dff" },
  { t0: W.ditarik - 0.1, t1: CL[9].start - 0.15, text: "kabel: hanya kuat ditarik", at: () => cablePoint(STUTT, 25, 0.45), dx: -80, dy: -300, color: "#2f8dff" },
  { t0: W.dorongan - 0.1, t1: CL[9].start - 0.15, text: "cincin luar: menahan dorongan", at: () => outerPoint(STUTT, 5), dx: -160, dy: 260, color: "#ff7a2a" },
  { t0: W.ditopang - 0.1, t1: T_P - 0.1, text: "tiang keliling: beban ke bawah", at: () => outerPoint(STUTT, 34, true), dx: -120, dy: -300, color: "#22b573" },
  { t0: W.rangka - 0.1, t1: W.tiga - 0.15, text: "rangka baja ruang", at: () => [-20, LIFT_REST, -4], dx: 40, dy: -320 },
  { t0: W.dirakit - 0.1, t1: W.diangkat - 0.2, text: "dirakit di bawah", at: () => [-14, LIFT_REST, -18], dx: 40, dy: -300 },
  { t0: W.diangkat - 0.1, t1: T_O - 0.1, text: "diangkat sekaligus ↑", at: (t) => [0, liftY(t), -28], dx: -120, dy: -260 },
];
const bendAt = (t: number) => (t < T_K ? 0 : ramp(t, wordT(3, "masalahnya"), W.melengkung + 0.7));
const liftAt = (t: number) => ramp(t, W.diangkat, SEC.PAYOFF[1] + 0.2);
const liftCount = (t: number) => Math.round(16 * clamp01((t - (W.enam - 0.6)) / 0.6));
const liftY = (t: number) => LIFT_REST + (LIFT_TOP - LIFT_REST) * liftAt(t);

const Callouts: React.FC<{ t: number; cam: THREE.PerspectiveCamera; k: number; Wd: number; H: number }> = ({ t, cam, k, Wd, H }) => {
  // keep tags below the stage rail / signature (top) and the centre card, and above the caption band
  const cardOn = CARDS.some((c) => t >= c.t0 && t < c.t1);
  const minY = (cardOn ? 640 : 460) * k;
  return (
  <svg width={Wd} height={H} style={{ position: "absolute", inset: 0 }}>
    {NOTES.filter((n) => t >= n.t0 && t < n.t1).map((n, i) => {
      const [x, y, ok] = project(cam, n.at(t), Wd, H);
      if (!ok) return null;
      const draw = clamp01((t - n.t0) / 0.35);
      const fade = 1 - clamp01((t - (n.t1 - 0.2)) / 0.2);
      const fs = 42 * k;
      const tw = n.text.length * fs * 0.56 + 40 * k;
      let lx = x + n.dx * k - tw / 2;
      lx = Math.max(48 * k, Math.min(Wd - 48 * k - tw, lx));
      const ly = Math.max(minY, Math.min(1090 * k, y + n.dy * k));
      const cx = lx + tw / 2;
      const col = n.color ?? ACC;
      const len = Math.hypot(cx - x, ly - y);
      return (
        <g key={i} opacity={fade}>
          <line x1={x} y1={y} x2={cx} y2={ly} stroke="#fff" strokeWidth={6 * k} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          <line x1={x} y1={y} x2={cx} y2={ly} stroke={col} strokeWidth={3 * k} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          <circle cx={x} cy={y} r={11 * k} fill={col} stroke="#fff" strokeWidth={4 * k} />
          <g opacity={clamp01((draw - 0.3) / 0.7)} transform={`translate(${lx} ${ly - 34 * k})`}>
            <rect width={tw} height={68 * k} rx={14 * k} fill="rgba(10,24,30,0.92)" stroke={col} strokeWidth={3 * k} />
            <text x={tw / 2} y={45 * k} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill="#fff">
              {n.text}
            </text>
          </g>
        </g>
      );
    })}
  </svg>
  );
};

type CardDef = { t0: number; t1: number; big: string; small: string; color?: string; count?: (t: number) => string };
const CARDS: CardDef[] = [
  { t0: W.tiang - 0.05, t1: T_BIKE - 0.05, big: "0 tiang", small: "di depan penonton", color: "#22b573" },
  { t0: W.roda0 - 0.05, t1: T_K - 0.05, big: "mirip roda sepeda", small: "rahasia atap tanpa tiang", color: ACC },
  { t0: W.stuttgart - 0.05, t1: CL[5].start - 0.15, big: "Stuttgart", small: "Jerman · atap roda kabel (1993)", color: ACC },
  { t0: W.empat - 0.65, t1: W.jari - 0.15, big: "40", small: "rangka kabel radial", color: "#2f8dff", count: (t) => `${Math.round(40 * clamp01((t - (W.empat - 0.6)) / 0.6))}` },
  { t0: W.meniadakan - 0.05, t1: W.seberat - 0.3, big: "Σ gaya = 0", small: "tarikan dari semua sisi saling meniadakan", color: "#2f8dff" },
  { t0: W.seberat - 0.05, t1: W.ditopang - 0.2, big: "± 2.700 ton", small: "baja atap di Stuttgart", color: ACC },
  { t0: W.jis - 0.05, t1: W.rangka - 0.15, big: "JIS · Jakarta", small: "cara lain: rangka baja ruang", color: ACC },
  { t0: W.tiga - 0.05, t1: W.dirakit - 0.15, big: "3.900 ton", small: "rangka baja ruang atap JIS", color: ACC },
  { t0: W.enam - 0.65, t1: T_O - 0.1, big: "16 titik", small: "titik angkat serentak", color: "#ff7a2a", count: (t) => `${liftCount(t)} titik` },
  { t0: W.seimbang - 0.4, t1: T_CARD - 0.05, big: "gaya seimbang", small: "tanpa tiang di depan penonton", color: "#22b573" },
];
const Cards: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const c = CARDS.find((x) => t >= x.t0 && t < x.t1);
  if (!c) return null;
  const a = Easing.out(Easing.back(1.5))(clamp01((t - c.t0) / 0.42));
  const out = 1 - clamp01((t - (c.t1 - 0.2)) / 0.2);
  const col = c.color ?? ACC;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 390 * k, display: "flex", justifyContent: "center", opacity: Math.min(clamp01((t - c.t0) / 0.2), out) }}>
      <div style={{ transform: `translateY(${(1 - a) * -30 * k}px) scale(${0.85 + 0.15 * a})`, background: CARD_BG, borderRadius: 26 * k, borderLeft: `${12 * k}px solid ${col}`, padding: `${18 * k}px ${40 * k}px ${22 * k}px`, boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.25)`, textAlign: "center", maxWidth: 900 * k }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92 * k, lineHeight: 1.0, color: "#fff", letterSpacing: -1 * k }}>{c.count ? c.count(t) : c.big}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44 * k, color: col, marginTop: 8 * k }}>{c.small}</div>
      </div>
    </div>
  );
};

// ---------------- stage rail (BUILDFORGE) ----------------
const STAGES = ["Atap tanpa tiang", "Masalahnya", "Atap roda kabel", "Gaya seimbang", "Cara lain: JIS", "Hasilnya"];
const STAGE_T = [0, T_K, T_M, T_R, T_P, T_O];
const StageRail: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= T_CARD) return null;
  const i = STAGE_T.filter((x) => t >= x).length - 1;
  const ap = clamp01((t - STAGE_T[i]) / 0.4);
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: 300 * k, display: "flex", alignItems: "center", gap: 16 * k }}>
      <div style={{ background: CARD_BG, borderRadius: 999, padding: `${8 * k}px ${22 * k}px`, fontFamily: FONT, fontWeight: 800, fontSize: 38 * k, color: "#fff", opacity: ap, whiteSpace: "nowrap" }}>
        <span style={{ color: "#7fe3c4" }}>{`0${i + 1}`}</span> · {STAGES[i]}
      </div>
      <div style={{ flex: 1, display: "flex", gap: 8 * k }}>
        {STAGES.map((_, j) => (
          <div key={j} style={{ flex: 1, height: 10 * k, borderRadius: 5 * k, background: j < i ? "#7fe3c4" : j === i ? ACC : "rgba(12,30,38,0.45)" }} />
        ))}
      </div>
    </div>
  );
};

// ---------------- karaoke captions ----------------
type Chunk = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CL.forEach((c) => {
    const ws = c.words;
    const n = Math.ceil(ws.length / 6);
    const size = Math.ceil(ws.length / n);
    for (let i = 0; i < ws.length; i += size) {
      let part = ws.slice(i, i + size);
      const rest = ws.length - (i + size);
      if (rest === 1) part = ws.slice(i, i + size + 1);
      out.push({ words: part, s: part[0].s - 0.08, e: 0 });
      if (rest === 1) break;
    }
  });
  out.forEach((ch, i) => (ch.e = i + 1 < out.length ? Math.min(out[i + 1].s, ch.words[ch.words.length - 1].e + 0.6) : ch.words[ch.words.length - 1].e + 0.6));
  return out;
})();
const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch || t >= T_CARD) return null;
  const n = ch.words.length;
  const lines = n > 4 ? [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))] : [ch.words];
  const appear = Easing.out(Easing.cubic)(clamp01((t - ch.s) / 0.18));
  const longest = Math.max(...lines.map((ln) => ln.reduce((a, w) => a + w.w.length, 0) * 0.6 * 58 + (ln.length - 1) * 24));
  const fs = 58 * Math.min(1, 880 / longest);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1250 * k, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(12,30,38,0.8)", borderRadius: 22 * k, padding: `${14 * k}px ${34 * k}px`, opacity: appear, transform: `translateY(${(1 - appear) * 14 * k}px)`, maxWidth: 960 * k }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: 24 * k, lineHeight: 1.22, whiteSpace: "nowrap" }}>
            {ln.map((w, wi) => {
              const on = t >= w.s - 0.03 && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const pop = on ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span key={wi} style={{ fontFamily: FONT, fontWeight: 800, fontSize: fs * k, color: on ? ACC : done ? "#ffffff" : "rgba(255,255,255,0.6)", transform: `scale(${pop})`, display: "inline-block" }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- 3D director ----------------
const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const m = useMats();
  const wheelK = t >= W.roda - 0.6 && t < CL[5].start ? ramp(t, W.roda - 0.6, W.roda + 0.3) * (1 - ramp(t, CL[5].start - 0.5, CL[5].start)) : t >= W.jari - 0.3 && t < T_R ? ramp(t, W.jari - 0.3, W.jari + 0.3) : 0;
  return (
    <>
      {t < T_K && (
        <>
          <Stadium m={m} f={f} roof={FULL_ROOF} sign={t < T_BIKE - 0.5} />
          {t >= T_BIKE - 0.5 && <HookBike m={m} f={f} />}
        </>
      )}
      {t >= T_K && t < T_M && <SectionScene m={m} f={f} bend={bendAt(t)} ghost={1 - ramp(t, W.hanya, W.hanya + 0.5)} backGlow={t >= W.tepi - 0.1 ? 1 : 0} load={ramp(t, W.masalahnya + 0.1, W.masalahnya + 0.6)} />}
      {t >= T_M && t < T_R && (
        <>
          <Stadium m={m} f={f} roof={roofAt(t)} board={false} />
          <BikeOverlay m={m} k={wheelK} y={lerp(26, STUTT.ringTop + 0.8, ramp(t, W.roda - 0.6, W.roda + 0.6))} />
        </>
      )}
      {t >= T_R && t < T_P && <ForceScene m={m} s={forceAt(t)} f={f} />}
      {t >= T_P && t < T_O && <JisScene m={m} f={f} built={ramp(t, T_P + 0.2, W.dirakit - 0.2)} lift={liftAt(t)} hot={liftCount(t)} />}
      {t >= T_O && <Stadium m={m} f={f} roof={FULL_ROOF} />}
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: Wd, height: H } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = Wd / 1080;
  const { pose } = poseAt(t);
  const cam = useMemo(() => makeCamera(pose, Wd, H), [pose, Wd, H]);
  const cuts = [T_K, T_M, T_R, T_P, T_O];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.1)) * 0.5;
  // low warm key (golden hour) for long shadows; outro even lower
  // hook interior: raking light from behind-left of the far stand so the roof edge throws shadow lines on the tiers
  const sun = t >= T_O ? ([-62, 22, 46] as V3) : t < T_BIKE ? ([-72, 26, -4] as V3) : ([-60, 30, 42] as V3);
  return (
    <AbsoluteFill style={{ backgroundColor: SKY }}>
      <ThreeCanvas width={Wd} height={H} dpr={1} shadows camera={{ fov: pose.fov, position: pose.pos, near: 0.1, far: 1200 }}>
        <Rig pose={pose} />
        <fog attach="fog" args={["#d9e2e6", 55, 330]} />
        <hemisphereLight args={["#e2eefa", "#8a7a5e", 0.72]} />
        <directionalLight
          position={sun}
          intensity={t >= T_O ? 3.6 : 3.3}
          color={t >= T_O ? "#ffc98e" : "#ffd6a6"}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-62}
          shadow-camera-right={62}
          shadow-camera-top={62}
          shadow-camera-bottom={-62}
          shadow-camera-near={1}
          shadow-camera-far={220}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
        />
        <directionalLight position={[30, 14, -30]} intensity={0.4} color="#bcd2f2" />
        <World t={t} f={f} />
        <Finish frame={frame} background={SKY} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.92} envIntensity={0.55} hdri="sky" ao aoRadius={1.4} />
      </ThreeCanvas>
      <Callouts t={t} cam={cam} k={k} Wd={Wd} H={H} />
      <Cards t={t} k={k} />
      <StageRail t={t} k={k} />
      <Captions t={t} k={k} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <Outro start={T_CARD} />
    </AbsoluteFill>
  );
};

