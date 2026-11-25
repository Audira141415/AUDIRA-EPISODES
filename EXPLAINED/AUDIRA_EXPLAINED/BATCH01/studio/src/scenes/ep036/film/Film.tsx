// EP036 film director: every cut, camera move, mechanism beat and caption is keyed to the VO
// clock in timeline.json (W("word") = that word's start second). One canvas, one set per shot.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage3D } from "../../../core/film/Stage3D.tsx";
import { CameraRig, Post, type Shot } from "../../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { FONT } from "../../../core/type/fonts.ts";
import { Outro } from "../../_shared/Outro.tsx";
import { Env } from "../World.tsx";
import { P, project } from "../layout.ts";
import { DB, Diorama, DSUMP, ENTRANCE, TW, type DioramaState } from "./Diorama.tsx";
import { TunnelInterior, IT, type TunnelState } from "./Tunnel.tsx";
import { TbmSet, TB, type TbmState } from "./TBM.tsx";
import { EntranceSet, EN, type EntranceState } from "./Entrance.tsx";
import { RiverSet, RV, type RiverState } from "./River.tsx";
import { clamp01, easeInOut, easeOut, lerp, lerp3, mixPose, poseShot, prog, rawShot, SEC, smooth, TL, W, type Pose } from "./common.tsx";

// ---------- cut points (VO seconds) ----------
const C = {
  B: W("Tapi"),
  C: W("kereta"),
  D: W("Kok"),
  E: SEC.KONTEKS[0],
  F: W("Ia"),
  G: SEC.MEKANISME[0],
  H: W("cincin"),
  I: W("dan", W("belakangnya")),
  J: W("Lapisan", W("disegel")),
  K: W("Karena"),
  L: W("petugas"),
  M: SEC.REVEAL[0],
  N: W("Rembesan"),
  O: W("Sensor"),
  P: SEC.PAYOFF[0],
  Q: SEC.OUTRO[0],
  END: SEC.OUTRO[1] + 0.2,
};
// hard cuts that still use a quick paper flash; the others are camera-continuous, match cuts or soil wipes
const CUTS = [C.G, C.O, C.P];
const WIPES: { t: number; dir: 1 | -1 }[] = [
  { t: C.J, dir: -1 },
  { t: C.M, dir: 1 },
  { t: C.N, dir: 1 },
];

type Label = { text: string; anchor: [number, number, number]; side: "left" | "right"; at: number; dy?: number; color?: string };
type Hud = { chip?: string; card?: { text: string; sub?: string; at: number }; big?: { text: string; at: number }; dim?: { a: [number, number, number]; b: [number, number, number]; text: string; at: number }; timer?: { at: number }; checklist?: { at: number } };
type Frame =
  | { set: "dio"; shot: Shot; s: DioramaState; labels: Label[]; hud: Hud }
  | { set: "tun"; shot: Shot; s: TunnelState; labels: Label[]; hud: Hud }
  | { set: "tbm"; shot: Shot; s: TbmState; labels: Label[]; hud: Hud }
  | { set: "ent"; shot: Shot; s: EntranceState; labels: Label[]; hud: Hud }
  | { set: "riv"; shot: Shot; s: RiverState; labels: Label[]; hud: Hud };

const dio = (t: number, o: Partial<DioramaState>): DioramaState => ({
  t,
  flood: 0.3,
  rain: 1,
  trainL: 3 - ((t * 9) % 30),
  trainR: Math.min(2.6, -20 + ((t * 9) % 40)),
  pressure: 0,
  glow: 0,
  pump: 0,
  seep: 0,
  ...o,
});

const L1 = "LAPISAN 1 · Cincin beton tersegel";
const L2 = "LAPISAN 2 · Pintu masuk stasiun";
const L3 = "LAPISAN 3 · Pompa & peringatan dini";

const WIDE: Pose = { target: [0, -4.4, -2], yaw: 24, pitch: 15, dist: 76, fov: 30 };
const leftRing: [number, number, number] = [TW.xs[0], TW.y, DB.front];
const J_POSE: Pose = { target: [-1.3, -1.4, -1.2], yaw: 52, pitch: 18, dist: 37, fov: 36 };
const K_POSE: Pose = { target: [-1.3, -1.5, -3.2], yaw: 80, pitch: 9, dist: 33, fov: 36 };
const E_START: Pose = { target: [TW.xs[0] + 0.6, TW.y + 0.2, DB.front], yaw: 14, pitch: 4, dist: 22, fov: 30 };

const direct = (t: number): Frame => {
  // HOOK: flooded street, then crane down through the cutaway
  if (t < C.B) {
    const k = prog(t, 0, C.B, (x) => x);
    const pose: Pose = { target: [lerp(-2.5, 0.0, k), lerp(-0.6, -0.2, k), 0], yaw: lerp(-26, -10, k), pitch: lerp(18, 14, k), dist: lerp(30, 26, k), fov: 32 };
    return { set: "dio", shot: poseShot(pose), s: dio(t, { flood: lerp(0.18, 0.3, k) }), labels: [], hud: {} };
  }
  if (t < C.C) {
    const k = prog(t, C.B, C.C - 0.55, easeInOut);
    const kz = prog(t, C.C - 0.55, C.C, (x) => x * x);
    const a: Pose = { target: [0.0, -0.2, 0], yaw: -10, pitch: 14, dist: 26, fov: 32 };
    const b: Pose = { target: [TW.xs[1], TW.y, DB.front], yaw: 12, pitch: 5, dist: 34, fov: 32 };
    const z: Pose = { target: [TW.xs[1], TW.y, DB.front - 2], yaw: 0, pitch: 0, dist: 3.2, fov: 40 };
    return {
      set: "dio",
      shot: poseShot(mixPose(mixPose(a, b, k), z, kz)),
      s: dio(t, { trainR: lerp(-30, -14, prog(t, C.B, C.C)), trainL: lerp(3.5, -12, prog(t, C.B, C.C)) }),
      labels: [{ text: "Puluhan meter di bawah", anchor: [TW.xs[1] + 1.6, TW.y + 2.9, DB.front], side: "right", at: W("puluhan") + 0.2 }],
      hud: {},
    };
  }
  if (t < C.D) {
    const u = t - C.C;
    const m = prog(t, C.C, C.C + 0.7, easeOut);
    const cam = [lerp(0, 1.6, m), lerp(0, 0.35, m), lerp(13.4, 9, m) - prog(t, C.C + 0.7, C.D, (x) => x) * 1.5];
    return {
      set: "tun",
      shot: rawShot(cam, [lerp(0, -0.3, m), lerp(0, -0.1, m), -30], lerp(40, 52, m)),
      s: { t, train: -75 + u * 42, seep: 0, glow: 0 },
      labels: [],
      hud: {},
    };
  }
  if (t < C.E) {
    const k = prog(t, C.D, C.E, (x) => x);
    const out = prog(t, C.D, C.D + 0.9, easeOut);
    const into = prog(t, C.E - 0.6, C.E, easeInOut);
    const close: Pose = { target: [TW.xs[1], TW.y, DB.front - 2], yaw: 0, pitch: 0, dist: 3.2, fov: 40 };
    const wide = { ...WIDE, yaw: lerp(30, 24, k), dist: lerp(82, 74, k) };
    const pose = mixPose(mixPose(close, wide, out), E_START, into);
    return { set: "dio", shot: poseShot(pose), s: dio(t, {}), labels: [], hud: { big: { text: "Kok bisa?", at: C.D } } };
  }
  // KONTEKS: not waterproof by magic — groundwater presses on the rings; then the three layers
  if (t < C.F) {
    const k = prog(t, C.E, C.F, (x) => x);
    const pose: Pose = { target: [leftRing[0] + 0.6, leftRing[1] + 0.2, leftRing[2]], yaw: lerp(14, 6, k), pitch: 4, dist: lerp(22, 19, k), fov: 30 };
    return {
      set: "dio",
      shot: poseShot(pose),
      s: dio(t, { pressure: prog(t, C.E + 0.3, C.E + 1.2) }),
      labels: [{ text: "Air tanah menekan", anchor: [leftRing[0] - TW.R - 0.9, leftRing[1] + 1.2, DB.front], side: "left", at: W("kebal") }],
      hud: {},
    };
  }
  if (t < C.G) {
    const k = prog(t, C.F, C.G - 0.4, easeInOut);
    const a: Pose = { target: [leftRing[0] + 0.6, leftRing[1] + 0.2, leftRing[2]], yaw: 6, pitch: 4, dist: 19, fov: 30 };
    return {
      set: "dio",
      shot: poseShot(mixPose(a, WIDE, k)),
      s: dio(t, { pressure: 1 - prog(t, C.F + 1, C.G) }),
      labels: [
        { text: "1  Cincin beton", anchor: [TW.xs[0] - 2.0, TW.y + 2.0, DB.front], side: "left", at: W("berlapis"), color: P.gasket },
        { text: "2  Pintu masuk", anchor: [ENTRANCE.x, 2.2, ENTRANCE.z], side: "left", at: W("supaya"), color: P.water },
        { text: "3  Pompa", anchor: [0.35, DSUMP.y0 + 1.0, 3.0], side: "right", at: W("sempat"), color: "#c98c22" },
      ],
      hud: {},
    };
  }
  // MEKANISME layer 1: the TBM bores, rings go in right behind it, joints sealed
  if (t < C.H) {
    const built = 30 + prog(t, C.G, C.H, (x) => x) * 0.25;
    const front = -60 + built * TB.len + TB.shieldLen + 0.6;
    const k = prog(t, C.G, C.H - 1.0, (x) => x);
    const g = prog(t, C.H - 1.0, C.H, easeInOut);
    const tail = -60 + 31 * TB.len;
    const pos = lerp3([front + lerp(10.5, 8.5, k), lerp(1.2, 1.8, k), lerp(12, 14, k)], [tail + 9, 2.5, 16], g);
    const tgt = lerp3([front - 1.2, -0.2, -0.6], [tail - 2.5, -0.2, -1.2], g);
    return {
      set: "tbm",
      shot: rawShot(pos, tgt, lerp(36, 36, k)),
      s: { t, built, spin: t * 1.4, glow: 0 },
      labels: [
        { text: "Mesin bor (TBM) Antareja", anchor: [front - 3, TB.shieldR - 0.2, -1.5], side: "left", at: W("Antareja") - 0.3, color: P.water },
        { text: "Kepala bor berputar", anchor: [front + 0.3, 2.2, 0.6], side: "right", dy: -60, at: W("mesin") },
      ],
      hud: { chip: L1 },
    };
  }
  if (t < C.I) {
    const built = 30.25 + prog(t, C.H + 0.1, C.I - 0.15, (x) => x) * 0.75;
    const tail = -60 + 31 * TB.len;
    const k = prog(t, C.H, C.I, (x) => x);
    return {
      set: "tbm",
      shot: rawShot([tail + lerp(9, 6, k), lerp(2.5, 1.8, k), lerp(16, 13, k)], [tail - 2.5, -0.2, -1.2], 36),
      s: { t, built, spin: t * 1.4, glow: 0 },
      labels: [{ text: "Cincin beton dipasang", anchor: [tail - 0.7, TB.R - 0.3, -1.6], side: "right", at: W("cincin") + 0.2, color: P.gasket }],
      hud: { chip: L1 },
    };
  }
  if (t < C.J) {
    const k = prog(t, C.I, C.J, (x) => x);
    const pose: Pose = { target: [leftRing[0] - 1.6, leftRing[1] + 1.3, DB.front], yaw: lerp(18, 8, k), pitch: lerp(10, 6, k), dist: lerp(11, 9.5, k), fov: 30 };
    return {
      set: "dio",
      shot: poseShot(pose),
      s: dio(t, { glow: prog(t, W("disegel") - 0.2, W("disegel") + 0.4), pressure: 1, trainL: -40 }),
      labels: [{ text: "Sambungan disegel", anchor: [leftRing[0] + Math.cos(2.3) * 2.6, leftRing[1] + Math.sin(2.3) * 2.6, DB.front + 0.05], side: "left", at: W("sambungannya"), color: P.gasket }],
      hud: { chip: L1 },
    };
  }
  // MEKANISME layer 2: the entrance is the only way in
  if (t < C.K) {
    const k = prog(t, C.J, C.K, (x) => x);
    const pose: Pose = mixPose({ target: [-1.3, -1.2, -0.8], yaw: 40, pitch: 24, dist: 42, fov: 36 }, J_POSE, k);
    return {
      set: "ent",
      shot: poseShot(pose),
      s: { t, flood: lerp(0.12, 0.3, k), panels: 0, flow: prog(t, W("jalan", C.J) - 0.2, W("jalan", C.J) + 0.4), lift: 0 },
      labels: [{ text: "Pintu stasiun", anchor: [-1.3, 2.4, 0.4], side: "left", at: W("pintu", C.J), color: P.water }],
      hud: { chip: L2 },
    };
  }
  if (t < C.L) {
    const k = prog(t, C.K, C.L, (x) => x);
    const pose: Pose = mixPose(J_POSE, K_POSE, prog(t, C.K, C.K + 1.2, easeInOut));
    void k;
    return {
      set: "ent",
      shot: poseShot(pose),
      s: { t, flood: lerp(0.3, 0.55, prog(t, C.K, W("tinggi", C.K) + 0.6)), panels: 0, flow: 0, lift: 0 },
      labels: [{ text: "Stasiun bawah tanah", anchor: [-1.0, -3.0, -8.0], side: "left", at: C.K + 0.3 }],
      hud: { chip: L2, dim: { a: [0.05, 0, 2.7], b: [0.05, EN.landingY, 2.7], text: "lebih tinggi dari jalan", at: W("lebih", C.K) } },
    };
  }
  if (t < C.M) {
    const k = prog(t, C.L, C.M, (x) => x);
    const panels = 4 * prog(t, W("memasang") - 0.2, W("menit", W("empat")) + 0.2, (x) => x);
    const pose: Pose = mixPose(K_POSE, { target: [-1.3, 0.9, 0.9], yaw: lerp(60, 52, k), pitch: 13, dist: lerp(15, 13, k), fov: 34 }, prog(t, C.L, C.L + 1.2, easeInOut));
    return {
      set: "ent",
      shot: poseShot(pose),
      s: { t, flood: 0.55, panels, flow: 0, lift: 0.5 + 0.5 * Math.sin(t * 5) },
      labels: [
        { text: "Panel penahan banjir", anchor: [-0.1, EN.landingY + 0.5, EN.grooveZ], side: "right", at: W("panel"), color: P.water },
        { text: "Petugas", anchor: [-1.6, EN.landingY + 1.7, 0.35], side: "left", at: W("petugas") + 0.2 },
      ],
      hud: { chip: L2, timer: { at: W("empat") } },
    };
  }
  // REVEAL layer 3: seepage is expected, collected, pumped; river sensor warns the control room
  if (t < C.N) {
    const k = prog(t, C.M, C.N, (x) => x);
    return {
      set: "tun",
      shot: rawShot([lerp(-1.4, -1.0, k), lerp(0.7, 0.4, k), lerp(10.2, 9.4, k)], [1.6, -1.0, 5.4], 40),
      s: { t, train: -120, seep: prog(t, W("air", C.M) - 0.2, W("air", C.M) + 0.6), glow: 0 },
      labels: [
        { text: "Rembesan kecil", anchor: [Math.cos(-0.35) * 2.4, Math.sin(-0.35) * 2.4, 6.06], side: "right", at: W("lolos") },
        { text: "Saluran samping", anchor: [IT.channelX, IT.invertY + 0.05, 4.0], side: "right", dy: 60, at: W("diperhitungkan") },
      ],
      hud: { chip: L3 },
    };
  }
  if (t < C.O) {
    const kUp = prog(t, W("pompa") + 0.2, C.O - 0.1, easeInOut);
    const pose: Pose = { target: [0, lerp(-12.0, -1.2, kUp), lerp(3.0, 2.0, kUp)], yaw: lerp(16, 22, kUp), pitch: lerp(6, 14, kUp), dist: lerp(14, 22, kUp), fov: 30 };
    return {
      set: "dio",
      shot: poseShot(pose),
      s: dio(t, { seep: prog(t, C.N, C.N + 0.5), pump: prog(t, W("pompa") - 0.1, W("pompa") + 0.4), flood: 0.3, rain: 0.8 }),
      labels: [
        { text: "Bak penampung (titik terendah)", anchor: [-0.8, DSUMP.water - 0.2, 3.3], side: "left", at: W("bak") },
        { text: "Pompa", anchor: [0.35, DSUMP.y0 + 1.2, 3.0], side: "right", at: W("pompa"), color: "#c98c22" },
        { text: "ke saluran kota", anchor: [0, 0.3, DB.front], side: "right", at: W("saluran"), color: P.water },
      ],
      hud: { chip: L3 },
    };
  }
  if (t < C.P) {
    const k = prog(t, W("peringatan") - 0.1, W("ruang", C.O), easeInOut);
    const a: Pose = { target: [3.3, 2.2, 4], yaw: lerp(-26, -18, prog(t, C.O, W("peringatan"), (x) => x)), pitch: 10, dist: 15, fov: 34 };
    const b: Pose = { target: [15, 1.6, -1.5], yaw: 4, pitch: 8, dist: 23, fov: 32 };
    const lv = prog(t, C.O, C.P - 0.8, (x) => x);
    const history = Array.from({ length: 40 }, (_, i) => {
      const x = i / 39;
      return x <= lv ? 0.25 + 0.6 * Math.pow(x, 1.6) + 0.03 * Math.sin(i * 1.7) : NaN;
    }).filter((v) => !Number.isNaN(v));
    return {
      set: "riv",
      shot: poseShot(mixPose(a, b, k)),
      s: { t, level: lerp(-2.3, -1.0, lv), signal: prog(t, W("peringatan") - 0.4, W("peringatan")), alert: prog(t, W("dini") - 0.1, W("dini") + 0.2), history: history.length > 1 ? history : [0.25, 0.25] },
      labels: [
        { text: "Sensor Kali Krukut", anchor: [RV.sensorX - 2.75, 4.3, 4], side: "left", at: W("Krukut") - 0.3, color: P.water },
        { text: "Ruang kendali", anchor: [15, 3.9, -2.8], side: "right", at: W("ruang", C.O), color: P.gasket },
      ],
      hud: { chip: L3 },
    };
  }
  // PAYOFF: flooded street above, trains still running below
  if (t < C.Q) {
    const k = prog(t, C.P, C.Q, (x) => x);
    const pose: Pose = { ...WIDE, yaw: lerp(36, 14, k), pitch: lerp(12, 15, k), dist: lerp(80, 84, k) };
    return {
      set: "dio",
      shot: poseShot(pose),
      s: dio(t, { flood: lerp(0.32, 0.42, k) }),
      labels: [
        { text: "Jalan tergenang", anchor: [4.2, 0.4, -1.5], side: "right", at: W("jalan", C.P), color: "#9a7a55" },
        { text: "MRT tetap beroperasi", anchor: [TW.xs[1] + 1.4, TW.y - 0.4, DB.front], side: "right", at: W("MRT", C.P), color: P.mint },
      ],
      hud: { card: { text: "1 Jan 2020", sub: "Jalan banjir, MRT beroperasi normal", at: W("Januari") } },
    };
  }
  // OUTRO: wide pull-back with the three layers
  const k = prog(t, C.Q, C.END, easeInOut);
  const pose: Pose = { ...WIDE, yaw: lerp(14, 26, k), pitch: lerp(15, 20, k), dist: lerp(84, 96, k) };
  return { set: "dio", shot: poseShot(pose), s: dio(t, { flood: 0.42, rain: lerp(1, 0.4, k) }), labels: [], hud: { checklist: { at: C.Q + 0.2 } } };
};

// ---------- overlay ----------
const pop = (t: number, at: number) => easeOut(clamp01((t - at) / 0.35));

const LabelTag: React.FC<{ l: Label; shot: Shot; t: number }> = ({ l, shot, t }) => {
  const a = pop(t, l.at);
  if (a <= 0) return null;
  const [ax, ay] = project(l.anchor, shot);
  if (!Number.isFinite(ax) || !Number.isFinite(ay)) return null;
  const ty = Math.min(1480, Math.max(560, ay + (l.dy ?? 0)));
  const tx = l.side === "left" ? 64 : 1016;
  const elbowX = l.side === "left" ? Math.max(Math.min(ax - 40, 420), 120) : Math.min(Math.max(ax + 40, 660), 960);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${ax},${ay} ${elbowX},${ty} ${l.side === "left" ? tx + 10 : tx - 10},${ty}`} fill="none" stroke={P.ink} strokeWidth={2.5} strokeOpacity={0.7} strokeDasharray={`${a * 900} 900`} />
        <circle cx={ax} cy={ay} r={8 * a} fill="#fff" stroke={P.ink} strokeWidth={3} />
        <circle cx={ax} cy={ay} r={3.5 * a} fill={l.color ?? P.ink} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ty - 46,
          ...(l.side === "left" ? { left: tx } : { right: 1080 - tx }),
          transform: `scale(${0.85 + 0.15 * a})`,
          transformOrigin: l.side === "left" ? "left center" : "right center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 32,
          color: P.ink,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.9)",
          padding: "7px 16px",
          borderRadius: 10,
          boxShadow: "0 4px 14px rgba(30,40,50,0.16)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: l.color ?? P.ink, display: "inline-block" }} />
        {l.text}
      </div>
    </div>
  );
};

// karaoke phrases: ≤5 words, break after punctuation
type Phrase = { words: { w: string; s: number; e: number }[]; start: number; end: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const clip of TL.clips) {
    let cur: Phrase["words"] = [];
    clip.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.:?!]$/.test(w.w);
      const last = i === clip.words.length - 1;
      const len = cur.map((x) => x.w).join(" ").length;
      const nextLen = i + 1 < clip.words.length ? len + 1 + clip.words[i + 1].w.length : 0;
      if (last || cur.length >= 3 || nextLen > 22 || (punct && cur.length >= 1)) {
        out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
        cur = [];
      }
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= C.END) return null;
  const idx = PHRASES.findIndex((p, i) => t >= p.start - 0.05 && (i === PHRASES.length - 1 || t < PHRASES[i + 1].start - 0.05));
  if (idx < 0) return null;
  const ph = PHRASES[idx];
  if (t > ph.end + 0.8) return null;
  const inA = easeOut(clamp01((t - ph.start + 0.05) / 0.18));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", opacity: inA, transform: `translateY(${(1 - inA) * 14}px)` }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 52,
          lineHeight: 1.18,
          whiteSpace: "nowrap",
          textAlign: "center",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 18,
          padding: "14px 28px",
          boxShadow: "0 8px 26px rgba(30,40,50,0.18)",
          borderBottom: `5px solid ${P.water}`,
        }}
      >
        {ph.words.map((w, i) => {
          const active = t >= w.s && t < (ph.words[i + 1]?.s ?? ph.end + 0.3);
          const done = t >= w.s;
          const b = active ? Math.sin(clamp01((t - w.s) / 0.22) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", marginRight: i < ph.words.length - 1 ? 14 : 0, color: active ? "#2f86c6" : P.ink, opacity: done ? 1 : 0.38, transform: `translateY(${-8 * b}px) scale(${1 + 0.06 * b})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const HudLayer: React.FC<{ hud: Hud; t: number; shot: Shot }> = ({ hud, t, shot }) => (
  <>
    {hud.chip ? (
      <div style={{ position: "absolute", top: 196, left: 64, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: "#fff", background: P.ink, borderRadius: 999, padding: "10px 24px", letterSpacing: "0.02em" }}>{hud.chip}</div>
    ) : null}
    {hud.big && t >= hud.big.at ? (
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 132, color: P.ink, letterSpacing: "-0.03em", textShadow: "0 0 30px rgba(243,240,234,0.95), 0 0 12px rgba(243,240,234,0.95)", opacity: pop(t, hud.big.at), transform: `scale(${0.9 + 0.1 * pop(t, hud.big.at)})` }}>
        Kok <span style={{ color: "#2f86c6" }}>bisa?</span>
      </div>
    ) : null}
    {hud.card && t >= hud.card.at ? (
      <div style={{ position: "absolute", top: 200, left: 64, right: 64, display: "flex", justifyContent: "center", opacity: pop(t, hud.card.at) }}>
        <div style={{ fontFamily: FONT, background: "rgba(255,255,255,0.94)", borderRadius: 20, padding: "22px 36px", boxShadow: "0 8px 26px rgba(30,40,50,0.18)", textAlign: "center", borderLeft: `8px solid ${P.mint}` }}>
          <div style={{ fontSize: 64, fontWeight: 600, color: P.ink }}>{hud.card.text}</div>
          <div style={{ fontSize: 34, fontWeight: 500, color: P.inkSoft, marginTop: 6 }}>{hud.card.sub}</div>
        </div>
      </div>
    ) : null}
    {hud.timer && t >= hud.timer.at ? (
      <div style={{ position: "absolute", top: 290, right: 64, fontFamily: FONT, fontWeight: 600, fontSize: 48, color: P.ink, background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: "12px 26px", boxShadow: "0 6px 20px rgba(30,40,50,0.16)", opacity: pop(t, hud.timer.at) }}>
        ± 4 menit
      </div>
    ) : null}
    {hud.dim && t >= hud.dim.at
      ? (() => {
          const [ax, ay] = project(hud.dim.a, shot);
          const [bx, by] = project(hud.dim.b, shot);
          const a = pop(t, hud.dim.at);
          const x = Math.max(ax, bx) + 90;
          return (
            <div style={{ position: "absolute", inset: 0, opacity: a }}>
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                <line x1={Math.max(0, ax - 420)} y1={ay} x2={x + 20} y2={ay} stroke={P.ink} strokeWidth={4} strokeDasharray="12 8" />
                <line x1={bx} y1={by} x2={x + 20} y2={by} stroke={P.ink} strokeWidth={4} strokeDasharray="12 8" />
                <line x1={x} y1={ay} x2={x} y2={ay + (by - ay) * a} stroke="#2f86c6" strokeWidth={10} />
                <polygon points={`${x - 20},${by + 30} ${x + 20},${by + 30} ${x},${by}`} fill="#2f86c6" opacity={a} />
                <text x={x + 30} y={ay + 44} fontFamily={FONT} fontWeight={600} fontSize={30} fill={P.inkSoft}>muka jalan</text>
              </svg>
              <div style={{ position: "absolute", left: Math.min(x + 30, 1080 - 64 - 420), top: (ay + by) / 2 - 80, fontFamily: FONT, fontWeight: 600, fontSize: 44, lineHeight: 1.1, color: P.ink, background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: "10px 20px", borderLeft: "8px solid #2f86c6", boxShadow: "0 6px 20px rgba(30,40,50,0.16)", width: 380 }}>
                {hud.dim.text}
              </div>
            </div>
          );
        })()
      : null}
    {hud.checklist && t >= hud.checklist.at ? (
      <div style={{ position: "absolute", top: 196, left: 64, right: 64, fontFamily: FONT }}>
        {[
          ["1", "Cincin beton, sambungan disegel", P.gasket],
          ["2", "Pintu tinggi + panel penahan", P.water],
          ["3", "Pompa + peringatan dini", "#c98c22"],
        ].map(([n, txt, c], i) => {
          const a = pop(t, hud.checklist!.at + i * 0.35);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: a, transform: `translateX(${(1 - a) * -30}px)` }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: c, color: "#fff", fontSize: 30, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
              <div style={{ fontSize: 38, fontWeight: 600, color: P.ink, background: "rgba(255,255,255,0.9)", borderRadius: 12, padding: "6px 16px" }}>{txt}</div>
            </div>
          );
        })}
      </div>
    ) : null}
  </>
);

const STRATA_BG = `linear-gradient(180deg, #4a4d50 0%, #4a4d50 4%, #6b6660 4%, #6b6660 9%, #d2b48c 9%, #d2b48c 26%, #bf9468 26%, #bf9468 46%, #c8a77a 46%, #c8a77a 78%, #9a785c 78%, #9a785c 100%)`;
/** "Cut through the ground": a slab of soil strata sweeps across the frame; the set changes while it covers it. dir 1 = camera goes down. */
const SoilWipe: React.FC<{ t: number }> = ({ t }) => {
  const w = WIPES.find((x) => Math.abs(t - x.t) < 0.34);
  if (!w) return null;
  const p = clamp01((t - (w.t - 0.33)) / 0.66);
  const H = 2400;
  const y = w.dir === 1 ? lerp(1920, -H, p) : lerp(-H, 1920, p);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: H, background: STRATA_BG, boxShadow: "0 0 60px rgba(30,20,10,0.45)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: "52%", borderTop: "8px dashed #3f86bf" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: 6, background: "rgba(40,30,20,0.25)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "64%", height: 6, background: "rgba(40,30,20,0.25)" }} />
    </div>
  );
};

const flash = (t: number) => {
  let v = 0;
  for (const c of CUTS) v = Math.max(v, 1 - Math.abs(t - c) / 0.12);
  return clamp01(v) * 0.85;
};

export const FilmEp036: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = direct(t);
  return (
    <AbsoluteFill>
      <Stage3D
        background={P.bg}
        fade={flash(t)}
        fadeColor={P.bg}
        overlay={() => (
          <div style={{ position: "absolute", inset: 0 }}>
            {f.labels.map((l) => (
              <LabelTag key={l.text} l={l} shot={f.shot} t={t} />
            ))}
            <HudLayer hud={f.hud} t={t} shot={f.shot} />
            <SoilWipe t={t} />
            <Captions t={t} />
          </div>
        )}
      >
        <Env />
        <CameraRig shot={f.shot} near={0.3} far={600} />
        {f.set === "dio" ? <Diorama s={f.s} /> : null}
        {f.set === "tun" ? <TunnelInterior s={f.s} /> : null}
        {f.set === "tbm" ? <TbmSet s={f.s} /> : null}
        {f.set === "ent" ? <EntranceSet s={f.s} /> : null}
        {f.set === "riv" ? <RiverSet s={f.s} /> : null}
        <Post shot={f.shot} frame={frame} ao aoRadius={0.45} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} />
      </Stage3D>
      <Outro start={C.END} />
    </AbsoluteFill>
  );
};

/** Exposed for storyboard / sfx tooling. */
export const CUT_POINTS = C;
export { IT, smooth };
