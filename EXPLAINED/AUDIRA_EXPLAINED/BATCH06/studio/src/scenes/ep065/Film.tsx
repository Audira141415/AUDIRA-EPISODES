// AE-065 film (VINTAGEFORGE): the cover's engraved bascule world, driven by timeline.json
// (Audio Master Clock). Every cut, state change, label and caption is keyed to VO word times.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { BridgeWorld, leafPoint, pinionCenter, PIVOT, type ShipPose } from "./BridgeWorld.tsx";
import { LIFT_TOP, LIFT_TOWER_X, LIFT_Z, LiftBridge, Quays, Seesaw, SEESAW_POS, SEESAW_SCALE, ToyCar, TrafficLight } from "./FilmProps.tsx";
import { makeCamera, project, type Pose } from "./camera.ts";
import { CL, SEC, TOTAL, wordT } from "./timing.ts";

type V3 = [number, number, number];
const BG = "#efe3c6";
const INK = "#2b1b10";
const ACCENT = "#8a3a22";
const HAND = "'Ink Free', 'Segoe Print', cursive";
const SERIF = "'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const DEG = Math.PI / 180;

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- story state from the VO clock ----------------
const T_HOOK_END = SEC.KONTEKS[0] - 0.2;
const T_MERAH = wordT(3, "merah");
const T_PALANG = wordT(3, "palang");
const T_KOSONG = wordT(3, "dikosongkan");
const T_MOTOR = wordT(7, "motor");
const T_RAK = wordT(7, "rak");
const T_SWING = CL[8].start;
const T_REVEAL = SEC.REVEAL[0] - 0.1;
const T_PAYOFF = SEC.PAYOFF[0] - 0.1;
const T_NAIK = wordT(12, "naik");
const T_BERHENTI = wordT(13, "berhenti");
const T_OUTRO = SEC.OUTRO[0] - 0.1;
const T_CARD = SEC.OUTRO[1] + 0.2;

const OPEN_HI = 1.36; // ≈78°, "hampir tegak", never 90°
const OPEN_HOLD = 1.3;
const openAt = (t: number) => {
  if (t < T_HOOK_END) return lerp(0.95, OPEN_HI, ramp(t, 0, 5.6));
  if (t < T_RAK) return 0;
  if (t < T_SWING) return lerp(0, 0.14, ramp(t, T_RAK, T_SWING));
  if (t < T_OUTRO) return lerp(0.14, OPEN_HOLD, ramp(t, T_SWING, SEC.MEKANISME[1] + 0.2));
  return lerp(OPEN_HOLD, 0, ramp(t, SEC.OUTRO[0] + 0.3, SEC.OUTRO[1] - 0.4));
};
const gateRaiseAt = (t: number) => {
  if (t < T_HOOK_END) return 0;
  if (t < T_PALANG) return 1;
  if (t < T_OUTRO) return 1 - ramp(t, T_PALANG, T_PALANG + 0.9);
  return ramp(t, SEC.OUTRO[1] - 0.3, SEC.OUTRO[1] + 0.4);
};
const redAt = (t: number) => (t < T_HOOK_END ? true : t < T_MERAH ? false : t < SEC.OUTRO[1] - 0.4);
const shipAt = (t: number): ShipPose => {
  if (t < T_HOOK_END) return { pos: [0.3, -3.5, -6 + t * 2.2], rotY: 0 };
  if (t < T_SWING) return { pos: [0.6, -3.5, -17], rotY: 0 };
  if (t < T_REVEAL) return { pos: [0.6, -3.5, lerp(-17, -12.5, ramp(t, T_SWING, T_REVEAL))], rotY: 0 };
  return null;
};
const STOP_X = [-8.3, -9.7, -11.1];
const carX = (t: number, i: number) => {
  const stop = STOP_X[i];
  if (t < T_HOOK_END) return stop;
  const a = CL[3].start + i * 0.35, b = T_KOSONG + 0.5 + i * 0.25;
  if (t < a) return stop - 14;
  return lerp(stop - 14, stop, Easing.out(Easing.cubic)(clamp01((t - a) / (b - a))));
};
// a car that clears the deck while the light turns red
const leaverX = (t: number) => lerp(-6.5, 14, clamp01((t - CL[3].start) / (T_KOSONG + 0.6 - CL[3].start)));
const seesawTilt = (t: number) => 0.035 + 0.16 * Math.cos(2.3 * (t - T_REVEAL)) * Math.exp(-(t - T_REVEAL) * 0.22);
const liftAt = (t: number) => (t < T_BERHENTI ? ramp(t, T_NAIK - 0.2, T_NAIK + 2.0) : 1 - ramp(t, T_BERHENTI, T_BERHENTI + 1.6));

// ---------------- shots ----------------
type Shot = { t0: number; t1: number; a: Pose; b: Pose; kicker: string };
const P = (pos: V3, target: V3, fov = 36): Pose => ({ pos, target, fov });
const orbit = (c: V3, r: number, az: number, el: number): V3 => [c[0] + r * Math.sin(az * DEG) * Math.cos(el * DEG), c[1] + r * Math.sin(el * DEG), c[2] + r * Math.cos(az * DEG) * Math.cos(el * DEG)];
const SEE_T: V3 = [SEESAW_POS[0] + 0.95, SEESAW_POS[1] - 0.35, 0];
const LIFT_C: V3 = [0, 7.4, LIFT_Z];

const SHOTS: Shot[] = [
  { t0: 0, t1: CL[1].start - 0.05, a: P([-13, 1.6, 6.5], [-0.5, 1.8, -2.5], 40), b: P([-11, 1.4, 5.6], [-0.5, 2.2, -2.5], 40), kicker: "Fig. I — jalan yang berdiri" },
  { t0: CL[1].start - 0.05, t1: T_HOOK_END, a: P([8.5, 3.2, 23], [0, 1.2, 0], 36), b: P([5.2, 2.0, 16], [0, 1.6, 0], 36), kicker: "Fig. I — jalan yang berdiri" },
  { t0: T_HOOK_END, t1: CL[3].start - 0.15, a: P([-1.9, -1.15, 1.9], [2.87, -1.6, 0.2], 34), b: P([-1.0, -1.4, 1.0], [2.87, -1.7, 0.2], 34), kicker: "Fig. II — jembatan jungkit" },
  { t0: CL[3].start - 0.15, t1: CL[4].start - 0.1, a: P([-17.5, 3.1, 7.0], [-7.8, 0.8, 0], 38), b: P([-15.6, 2.6, 5.6], [-7.6, 0.8, 0], 38), kicker: "Fig. II — lampu & palang" },
  { t0: CL[4].start - 0.1, t1: SEC.MEKANISME[0] - 0.1, a: P([-15.6, 2.6, 5.6], [-7.6, 0.8, 0], 38), b: P([-13, 8.5, 20], [-4.5, 0, 0], 36), kicker: "Fig. II — lampu & palang" },
  { t0: SEC.MEKANISME[0] - 0.1, t1: CL[6].start - 0.1, a: P([-4.2, 0.9, 11.5], [-4.3, -1.2, 0], 40), b: P([-4.0, -0.6, 8.9], [-4.4, -1.4, 0], 40), kicker: "Fig. III — di dalam pilar" },
  { t0: CL[6].start - 0.1, t1: T_MOTOR - 0.1, a: P([-4.0, -0.6, 8.9], [-4.4, -1.5, 0], 40), b: P([-5.9, -0.9, 8.4], [-4.6, -1.9, 0], 40), kicker: "Fig. III — di dalam pilar" },
  { t0: T_MOTOR - 0.1, t1: T_SWING - 0.1, a: P([-3.1, -1.5, 4.4], [-3.9, -2.15, 0.9], 40), b: P([-3.55, -1.85, 3.7], [-3.95, -2.2, 0.9], 40), kicker: "Fig. III — motor & roda gigi" },
  { t0: T_SWING - 0.1, t1: T_REVEAL, a: P([-4.3, -1.0, 9.0], [-3.6, -1.2, 0], 38), b: P([-7.2, 3.0, 20], [-2.0, 0.4, 0], 36), kicker: "Fig. III — motor & roda gigi" },
  { t0: T_REVEAL, t1: CL[10].start - 0.1, a: P([-7.2, 3.0, 20], [-2.0, 0.4, 0], 36), b: P(orbit(SEE_T, 30, -12, 1), SEE_T, 36), kicker: "Fig. IV — kuncinya keseimbangan" },
  { t0: CL[10].start - 0.1, t1: CL[11].start - 0.1, a: P(orbit(SEE_T, 30, -12, 1), SEE_T, 36), b: P(orbit(SEE_T, 29.5, 8, 1), SEE_T, 36), kicker: "Fig. IV — kuncinya keseimbangan" },
  { t0: CL[11].start - 0.1, t1: T_PAYOFF, a: P(orbit(SEE_T, 29.5, 8, 1), SEE_T, 36), b: P(orbit(SEE_T, 28, 14, 1), SEE_T, 36), kicker: "Fig. IV — kuncinya keseimbangan" },
  { t0: T_PAYOFF, t1: CL[13].start - 0.1, a: P([-0.5, 8.0, 15], [0, 3.0, LIFT_Z], 40), b: P([0.2, 3.4, -1.5], LIFT_C, 42), kicker: "Fig. V — jembatan angkat tegak" },
  { t0: CL[13].start - 0.1, t1: T_OUTRO, a: P([0.2, 3.4, -1.5], LIFT_C, 42), b: P(orbit(LIFT_C, 25, -22, 2), LIFT_C, 42), kicker: "Fig. V — jembatan angkat tegak" },
  { t0: T_OUTRO, t1: TOTAL + 1, a: P([-9.5, 11, 30], [0, 0.5, -3], 34), b: P([-7.6, 6.2, 24.5], [0, 0.4, -3], 34), kicker: "Fig. VI — karena seimbang" },
];
const shotAt = (t: number) => SHOTS.findIndex((s) => t >= s.t0 && t < s.t1);
const poseAt = (t: number): { pose: Pose; i: number } => {
  const i = Math.max(0, shotAt(t));
  const s = SHOTS[i];
  const k = Easing.inOut(Easing.sin)(clamp01((t - s.t0) / (s.t1 - s.t0)));
  // continuous drift so no shot ever holds still
  return { pose: { pos: lerp3(s.a.pos, s.b.pos, k), target: lerp3(s.a.target, s.b.target, k), fov: lerp(s.a.fov, s.b.fov, k) }, i };
};

// ---------------- annotations ----------------
type Note = { t0: number; t1: number; text: string; at: (t: number) => V3; dx: number; dy: number };
const cw = (t: number): V3 => leafPoint(openAt(t), -2.3 + 0.36, -0.36, 0.95);
const seesawPt = (t: number, x: number, y: number, z = 0.45): V3 => {
  const a = seesawTilt(t);
  const S = SEESAW_SCALE;
  return [SEESAW_POS[0] + S * (x * Math.cos(a) - y * Math.sin(a)), SEESAW_POS[1] + S * (x * Math.sin(a) + y * Math.cos(a)), z];
};
const NOTES: Note[] = [
  { t0: wordT(0, "berdiri"), t1: CL[1].start - 0.1, text: "hampir tegak", at: (t) => leafPoint(openAt(t), 3.0, 0.55, -0.9), dx: 150, dy: -120 },
  { t0: wordT(1, "kapal"), t1: T_HOOK_END, text: "kapal tiang tinggi", at: (t) => { const s = shipAt(t); return s ? [s.pos[0], s.pos[1] + 5.5, s.pos[2]] : [0, 0, 0]; }, dx: -330, dy: -40 },
  { t0: wordT(2, "jungkit"), t1: CL[3].start - 0.2, text: "jungkit = bascule", at: () => [2.85, -1.05, 0.2], dx: -300, dy: -250 },
  { t0: T_MERAH, t1: CL[4].start - 0.2, text: "lampu merah", at: () => [-7.92, 2.05, -1.5], dx: -120, dy: -230 },
  { t0: T_PALANG, t1: CL[4].start - 0.2, text: "palang turun", at: () => [-7.4, 0.75, 0.9], dx: -260, dy: 170 },
  { t0: wordT(4, "menunggu"), t1: SEC.MEKANISME[0] - 0.2, text: "antre beberapa menit", at: (t) => [carX(t, 1), 0.7, 0.65], dx: -120, dy: -220 },
  { t0: wordT(5, "poros"), t1: CL[6].start - 0.2, text: "poros (trunnion)", at: () => [PIVOT[0], PIVOT[1], 1.45], dx: 200, dy: -260 },
  { t0: wordT(5, "pilar"), t1: CL[6].start - 0.2, text: "pilar", at: () => [-6.2, -2.0, 1.6], dx: -60, dy: 230 },
  { t0: wordT(6, "ekor"), t1: T_MOTOR - 0.2, text: "ekor daun", at: (t) => leafPoint(openAt(t), -1.1, 0.05, 0.9), dx: 160, dy: -250 },
  { t0: wordT(6, "pemberat"), t1: T_MOTOR - 0.2, text: "pemberat", at: cw, dx: -40, dy: 300 },
  { t0: T_MOTOR, t1: T_SWING - 0.2, text: "motor", at: () => [pinionCenter()[0] - 0.35, -2.85, 1.3], dx: -230, dy: 200 },
  { t0: wordT(7, "roda"), t1: T_SWING - 0.2, text: "roda gigi kecil", at: () => [pinionCenter()[0], pinionCenter()[1], 1.06], dx: 140, dy: 320 },
  { t0: T_RAK, t1: T_SWING - 0.2, text: "rak gigi lengkung", at: (t) => leafPoint(openAt(t), -1.05 * Math.cos(25 * DEG), -1.05 * Math.sin(25 * DEG), 1.06), dx: -60, dy: -330 },
  { t0: T_SWING, t1: T_REVEAL - 0.1, text: "pemberat turun", at: cw, dx: -260, dy: 160 },
  { t0: wordT(8, "ujung"), t1: T_REVEAL - 0.1, text: "ujung jalan naik", at: (t) => leafPoint(openAt(t), 3.3, 0.55, 1.3), dx: 120, dy: -60 },
  { t0: CL[10].start, t1: T_PAYOFF - 0.2, text: "daun", at: (t) => seesawPt(t, 3.2, 0.25), dx: 40, dy: -230 },
  { t0: wordT(10, "pemberat"), t1: T_PAYOFF - 0.2, text: "pemberat", at: (t) => seesawPt(t, -1.35, -0.9), dx: -150, dy: 220 },
  { t0: wordT(10, "jungkat"), t1: T_PAYOFF - 0.2, text: "poros", at: () => [SEESAW_POS[0], SEESAW_POS[1], 0.5], dx: 90, dy: 260 },
  { t0: wordT(11, "selisih"), t1: T_PAYOFF - 0.1, text: "selisih kecil", at: (t) => seesawPt(t, 3.4, 0.3), dx: -40, dy: 150 },
  { t0: wordT(11, "gesekan"), t1: T_PAYOFF - 0.1, text: "gesekan", at: () => [SEESAW_POS[0], SEESAW_POS[1], 0.5], dx: -330, dy: -120 },
  { t0: wordT(11, "angin"), t1: T_PAYOFF - 0.1, text: "angin", at: (t) => seesawPt(t, 2.2, 0.6), dx: 130, dy: -330 },
  { t0: T_NAIK, t1: CL[13].start - 0.2, text: "dek naik lurus", at: (t) => [0, liftAt(t) * 5 + 1.0, LIFT_Z + 1.1], dx: -330, dy: -170 },
  { t0: wordT(12, "lift"), t1: T_OUTRO - 0.2, text: "bandul", at: (t) => [LIFT_TOWER_X + 0.1, LIFT_TOP - 1.5 - liftAt(t) * 5, LIFT_Z + 0.6], dx: 60, dy: -260 },
];

const Annotations: React.FC<{ t: number; cam: THREE.PerspectiveCamera; k: number; W: number; H: number }> = ({ t, cam, k, W, H }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {NOTES.filter((n) => t >= n.t0 && t < n.t1).map((n, i) => {
      const [x, y] = project(cam, n.at(t), W, H);
      const draw = clamp01((t - n.t0) / 0.45);
      const fade = 1 - clamp01((t - (n.t1 - 0.25)) / 0.25);
      const tw = n.text.length * 19 * k;
      const right = n.dx >= 0;
      let lx = x + n.dx * k;
      const ly = Math.max(380 * k, Math.min(H - 500 * k, y + n.dy * k));
      lx = right ? Math.max(60 * k, Math.min(W - 70 * k - tw, lx)) : Math.min(W - 60 * k, Math.max(70 * k + tw, lx));
      const cx = (x + lx) / 2 + 30 * k, cy = (y + ly) / 2;
      const len = Math.hypot(lx - x, ly - y) * 1.2;
      return (
        <g key={i} opacity={fade}>
          <circle cx={x} cy={y} r={8 * k} fill="none" stroke={INK} strokeWidth={3 * k} />
          <circle cx={x} cy={y} r={2.8 * k} fill={INK} />
          <path d={`M ${x} ${y} Q ${cx} ${cy} ${lx} ${ly}`} fill="none" stroke={INK} strokeWidth={2.8 * k} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
          <text x={lx + (right ? 10 : -10) * k} y={ly + 13 * k} textAnchor={right ? "start" : "end"} fontFamily={HAND} fontSize={42 * k} fontWeight={700} fill={INK} stroke={BG} strokeWidth={8 * k} paintOrder="stroke" opacity={clamp01((draw - 0.4) / 0.6)}>
            {n.text}
          </text>
        </g>
      );
    })}
  </svg>
);

// Tower Bridge ink card (REVEAL) and Ampera card + 1970 stamp (PAYOFF): facts from SCRIPT/RESEARCH only.
const Card: React.FC<{ t: number; t0: number; t1: number; k: number; title: string; lines: string[]; top: number; tilt: number }> = ({ t, t0, t1, k, title, lines, top, tilt }) => {
  if (t < t0 || t > t1) return null;
  const a = Easing.out(Easing.back(1.4))(clamp01((t - t0) / 0.5));
  const out = 1 - clamp01((t - (t1 - 0.3)) / 0.3);
  return (
    <div style={{ position: "absolute", left: 90 * k, right: 90 * k, top: top * k, opacity: Math.min(clamp01((t - t0) / 0.3), out), transform: `rotate(${tilt}deg) translateY(${(1 - a) * 40 * k}px) scale(${0.92 + 0.08 * a})`, background: "rgba(246,236,214,0.94)", border: `${3 * k}px solid ${INK}`, boxShadow: `${8 * k}px ${10 * k}px 0 rgba(59,40,24,0.25)`, padding: `${22 * k}px ${30 * k}px` }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48 * k, color: INK }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 40 * k, color: i === 0 ? ACCENT : INK, marginTop: 8 * k }}>
          {l}
        </div>
      ))}
    </div>
  );
};
const Stamp: React.FC<{ t: number; t0: number; t1: number; k: number }> = ({ t, t0, t1, k }) => {
  if (t < t0 || t > t1) return null;
  const a = clamp01((t - t0) / 0.25);
  return (
    <div style={{ position: "absolute", right: 110 * k, top: 1060 * k, transform: `rotate(-9deg) scale(${1.6 - 0.6 * a})`, opacity: a * 0.9, border: `${6 * k}px double ${ACCENT}`, color: ACCENT, background: "rgba(246,236,214,0.88)", padding: `${10 * k}px ${22 * k}px`, fontFamily: SERIF, fontWeight: 700, fontSize: 44 * k, letterSpacing: 3 * k, textAlign: "center", lineHeight: 1.1 }}>
      BERHENTI DIANGKAT
      <div style={{ fontSize: 60 * k }}>sejak 1970</div>
    </div>
  );
};

// ---------------- karaoke captions ----------------
type Chunk = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CL.forEach((c, ci) => {
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
    void ci;
  });
  out.forEach((ch, i) => (ch.e = i + 1 < out.length ? Math.min(out[i + 1].s, ch.words[ch.words.length - 1].e + 0.6) : ch.words[ch.words.length - 1].e + 0.6));
  return out;
})();
const Captions: React.FC<{ t: number; k: number; H: number }> = ({ t, k, H }) => {
  const ch = CHUNKS.find((c) => t >= c.s && t < c.e);
  if (!ch || t >= T_CARD) return null;
  const n = ch.words.length;
  const lines = n > 4 ? [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))] : [ch.words];
  const appear = Easing.out(Easing.cubic)(clamp01((t - ch.s) / 0.18));
  // fit the longest line inside ~860 px (Palatino bold ≈ 0.52 em per character)
  const longest = Math.max(...lines.map((ln) => ln.reduce((a, w) => a + w.w.length, 0) * 0.52 * 56 + (ln.length - 1) * 24));
  const fs = 56 * Math.min(1, 860 / longest);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: H - 1505 * k, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(246,236,214,0.9)", borderTop: `${3 * k}px solid ${INK}`, borderBottom: `${3 * k}px solid ${INK}`, padding: `${14 * k}px ${34 * k}px`, opacity: appear, transform: `translateY(${(1 - appear) * 14 * k}px)`, maxWidth: 940 * k }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: 24 * k, lineHeight: 1.18, whiteSpace: "nowrap" }}>
            {ln.map((w, wi) => {
              const on = t >= w.s - 0.03 && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const pop = on ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span key={wi} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: fs * k, color: on ? ACCENT : done ? INK : "rgba(43,27,16,0.55)", transform: `scale(${pop})`, display: "inline-block", textDecoration: on ? "underline" : "none", textDecorationThickness: 3 * k, textUnderlineOffset: 8 * k }}>
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

// ---------------- paper, kicker, transitions ----------------
const Paper: React.FC<{ W: number; H: number }> = ({ W, H }) => (
  <svg width={W} height={H} viewBox="0 0 1080 1920" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.5 }}>
    <filter id="ep065f-paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={65} />
      <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0.55 0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#ep065f-paper)" />
    <radialGradient id="ep065f-edge" cx="50%" cy="48%" r="75%">
      <stop offset="62%" stopColor="#fff" stopOpacity={0} />
      <stop offset="100%" stopColor="#7a4a22" stopOpacity={0.5} />
    </radialGradient>
    <rect width={1080} height={1920} fill="url(#ep065f-edge)" />
  </svg>
);
const Kicker: React.FC<{ text: string; k: number; t: number; t0: number }> = ({ text, k, t, t0 }) => (
  <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 262 * k, display: "flex", alignItems: "center", gap: 18 * k, opacity: clamp01((t - t0) / 0.35) }}>
    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32 * k, color: INK, whiteSpace: "nowrap", background: "rgba(246,236,214,0.88)", padding: `${2 * k}px ${12 * k}px` }}>{text}</span>
    <div style={{ flex: 1, height: 2 * k, background: INK, opacity: 0.7 }} />
  </div>
);

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 400;
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = frame / fps;
  const k = W / 1080;
  const f = t * 60;
  const { pose, i } = poseAt(t);
  const cam = useMemo(() => makeCamera(pose, W, H), [pose, W, H]);
  const shot = SHOTS[i];
  const open = openAt(t);
  const showSeesaw = t >= T_REVEAL && t < T_PAYOFF + 0.6;
  // diagram shots: the seesaw alone on plain parchment (world hidden per shot)
  const isolated = t >= CL[10].start - 0.1 && t < T_PAYOFF;
  const showLift = t >= T_PAYOFF;
  const pop = Easing.out(Easing.back(1.6))(clamp01((t - T_REVEAL - 0.3) / 0.7));
  // short parchment flash at each section boundary (page turn)
  const cuts = [T_HOOK_END, SEC.MEKANISME[0] - 0.1, T_PAYOFF, T_OUTRO];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.55;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <ThreeCanvas width={W} height={H} dpr={1} shadows camera={{ fov: pose.fov, position: pose.pos }}>
        <Rig pose={pose} />
        <fog attach="fog" args={[BG, 32, 80]} />
        <hemisphereLight args={["#fff4dc", "#8a6a48", 1.1]} />
        <directionalLight position={[-14, 22, 16]} intensity={2.6} color="#fff0d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-34} shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0004} />
        <directionalLight position={[12, 6, -10]} intensity={0.6} color="#ffd9a8" />
        <BridgeWorld
          f={f}
          open={open}
          px={k}
          fitPlate
          isolate={isolated}
          chamberPlate={!(t >= T_MOTOR - 0.1 && t < T_SWING - 0.1)}
          gateRaise={gateRaiseAt(t)}
          ship={shipAt(t)}
          extras={(m) =>
            isolated ? (
              <Seesaw m={m} tilt={seesawTilt(t)} pop={Math.max(0.001, pop)} />
            ) : (
            <>
              <Quays m={m} />
              <TrafficLight m={m} pos={[-7.92, 0, -1.5]} red={redAt(t)} />
              <TrafficLight m={m} pos={[7.92, 0, 1.5]} red={redAt(t)} />
              {STOP_X.map((x, ci) => (
                <ToyCar key={ci} m={m} pos={[carX(t, ci), 0, 0.65]} tint={ci} />
              ))}
              {[8.3, 9.7].map((x, ci) => (
                <ToyCar key={`r${ci}`} m={m} pos={[t < T_HOOK_END || t > T_KOSONG ? x : x + 14, 0, -0.65]} tint={ci + 2} dir={-1} />
              ))}
              {t > CL[3].start && t < T_KOSONG + 0.6 && <ToyCar m={m} pos={[leaverX(t), 0, -0.65]} tint={3} />}
              {showSeesaw && <Seesaw m={m} tilt={seesawTilt(t)} pop={Math.max(0.001, pop)} />}
              {showLift && <LiftBridge m={m} lift={liftAt(t)} />}
            </>
            )
          }
        />
        <Finish frame={frame} background={BG} profile={{ ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0006 }} exposure={0.82} envIntensity={0.25} hdri="warmStudio" ao />
      </ThreeCanvas>
      <Paper W={W} H={H} />
      <Annotations t={t} cam={cam} k={k} W={W} H={H} />
      <Card t={t} t0={wordT(11, "tower")} t1={T_PAYOFF - 0.1} k={k} top={340} tilt={-2} title="Tower Bridge, London" lines={["daun: lebih dari seribu ton", "motor hanya melawan sisa kecil"]} />
      <Card t={t} t0={wordT(13, "ampera")} t1={T_OUTRO - 0.1} k={k} top={300} tilt={1.5} title="Ampera, Palembang" lines={["dulu dek naik lurus (sebelum 1970)"]} />
      <Stamp t={t} t0={T_BERHENTI + 0.2} t1={T_OUTRO - 0.1} k={k} />
      <Kicker text={shot.kicker} k={k} t={t} t0={shot.t0} />
      <Captions t={t} k={k} H={H} />
      {flash > 0 && <AbsoluteFill style={{ background: BG, opacity: flash }} />}
      <Outro start={T_CARD} />
    </AbsoluteFill>
  );
};
