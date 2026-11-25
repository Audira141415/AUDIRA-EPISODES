// AE-073 film — "Bagaimana Rumah Bisa Dicetak dengan Printer 3D?" (SATISFYFORGE).
// Audio master clock: every shot, state change, label and caption is keyed to timeline.json
// (word start times / section bounds), never to guessed numbers.

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { C, LAYER_H, SKIN, SLAB_TOP, BEAD_R } from "./World.tsx";
import {
  FilmWorld,
  PMAX,
  plateX,
  SECTION_POS,
  SEC_BASE,
  SEC_L,
  SEC_LAYERS,
  type WorldState,
  headAt,
  hoseCurve,
  pathPoint,
  railFor,
  wallTop,
} from "./FilmWorld.tsx";
import TL from "./timeline.json";

export const TOTAL_SECONDS = TL.total;

// ---------- clock helpers ----------
type Word = { w: string; s: number; e: number };
const clip = (id: string) => TL.clips.find((c) => c.id === id)!;
const W = (id: string, i: number) => (clip(id).words as Word[])[i].s;
const S = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
const up = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Shot boundaries (VO seconds)
const T = {
  h2: W("l02", 0),
  k1: S.KONTEKS[0],
  k2: W("l04", 0),
  k3: W("l05", 0),
  m1: S.MEKANISME[0],
  m2: W("l07", 0),
  m3: W("l07", 9), // "mengelilingi"
  m4: W("l08", 0),
  m5: W("l08", 10), // "sehingga"
  r1: S.REVEAL[0],
  r2: W("l09", 4), // "dua"
  r3: W("l10", 0),
  p1: S.PAYOFF[0],
  p2: W("l12", 0),
  p3: W("l12", 7), // "sedangkan"
  o1: S.OUTRO[0],
  o2: W("l14", 0),
  outro: S.OUTRO[1] + 0.2,
  end: TL.total,
};

// ---------- world state over time ----------
const progressAt = (t: number) => {
  if (t < T.k1) return 14.4 + 0.14 * (t / T.k1);
  if (t < T.m2) return 0;
  if (t < T.m3) return lerp(0, 0.2, (t - T.m2) / (T.m3 - T.m2));
  if (t < T.m4) return lerp(0.2, 5.4, smooth((t - T.m3) / (T.m4 - T.m3)));
  if (t < T.m5) return lerp(5.4, 5.52, (t - T.m4) / (T.m5 - T.m4));
  if (t < T.r1) return lerp(5.52, 12.45, smooth((t - T.m5) / (T.r1 - T.m5)));
  if (t < T.p1) return lerp(12.45, 22, (t - T.r1) / (T.p1 - T.r1));
  return PMAX;
};

export const stateAt = (t: number, f: number): WorldState => {
  const P = progressAt(t);
  const inK = t >= T.k1 && t < T.m1;
  return {
    P,
    slab: t < T.k1 ? 1 : t < T.k3 ? 0 : t < T.m1 ? up(t, T.k3 + 0.1, T.k3 + 1.3) : 1,
    gantry: !inK,
    lift: t >= T.p3 ? up(t, T.p3, T.p3 + 0.9) * 4 : 0,
    pump: t >= T.m1 && t < T.m4 ? 1 : 0,
    ghostHose: t >= T.m4 && t < T.m5 ? up(t, W("l08", 1) - 0.3, W("l08", 1) + 0.2) : 0,
    holo: inK ? up(t, T.k1 + 0.1, T.k1 + 0.8) * (1 - up(t, T.k3 + 0.6, T.m1 - 0.2)) : 0,
    explode: inK ? up(t, T.k2 + 0.3, T.k2 + 1.4) : 0,
    toolpath: inK && t >= W("l04", 6) ? clamp01((t - W("l04", 6)) / 1.6) : 0,
    formwork: t >= T.m5 && t < T.r1 ? up(t, W("l08", 15) - 0.9, W("l08", 15) - 0.4) * (1 - up(t, W("l08", 16), W("l08", 16) + 0.6)) : 0,
    formworkAt: 0.47,
    roof: t >= T.p3 ? clamp01((t - W("l12", 8)) / 1.1) : 0,
    windows: t >= T.p3 ? clamp01((t - W("l12", 9)) / 1.4) : 0,
    workers: t >= T.p3 ? 2 : t >= T.m1 || t < T.k1 ? 1 : 0,
    section: {
      show: t >= T.r1 && t < T.p1 ? 1 - Math.pow(1 - up(t, T.r1 - 0.05, T.r1 + 0.5), 2) * 0 : 0,
      skin: t >= T.r2 ? (0.5 + 0.5 * Math.sin((t - T.r2) * 6)) * (1 - up(t, W("l09", 6), T.r3)) * up(t, T.r2, T.r2 + 0.3) : 0,
      zig: t >= W("l09", 7) ? up(t, W("l09", 7), W("l09", 7) + 0.4) * (1 - up(t, T.r3 + 0.3, T.r3 + 0.9)) : 0,
      foam: t >= W("l10", 3) ? up(t, W("l10", 3), W("l10", 3) + 1.5) : 0,
      rebar: t >= W("l10", 5) ? clamp01((t - W("l10", 5)) / 0.9) : 0,
      cable: t >= W("l10", 7) ? clamp01((t - W("l10", 7)) / 0.8) : 0,
    },
    t,
    f,
  };
};

// ---------- camera ----------
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number; aperture: number };
const DEG = Math.PI / 180;
const orbit = (tgt: THREE.Vector3, d: number, az: number, el: number, fov = 40, aperture = 0.004): Cam => ({
  pos: [tgt.x + d * Math.cos(el * DEG) * Math.sin(az * DEG), tgt.y + d * Math.sin(el * DEG), tgt.z + d * Math.cos(el * DEG) * Math.cos(az * DEG)],
  target: [tgt.x, tgt.y, tgt.z],
  fov,
  aperture,
});
/** Azimuth (deg) of the outward wall normal at the head. */
const normalAz = (P: number) => {
  const u = P - Math.floor(P);
  const a = pathPoint(u - 0.003);
  const b = pathPoint(u + 0.003);
  const tx = b.x - a.x;
  const tz = b.z - a.z;
  // outward normal of a CCW loop (x,z): (tz, -tx)
  return Math.atan2(tz, -tx) / DEG;
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SITE = V(0, 1.6, 0);

export const camAt = (t: number): Cam => {
  const P = progressAt(t);
  const head = headAt(P);
  const nAz = normalAz(P);
  if (t < T.h2) {
    // macro on the nozzle, then pull back to reveal a truck-sized gantry
    const k = up(t, W("l01", 1) - 0.2, T.h2 - 0.1);
    const tgt = head.clone().add(V(0, 0.12, 0)).lerp(SITE.clone().add(V(-0.6, 0.6, -0.6)), k);
    return orbit(tgt, lerp(1.45, 31, k * k * (1.2 - 0.2 * k)), lerp(nAz + 28, 40, k), lerp(14, 31, k), 40, lerp(0.0016, 0.005, k));
  }
  if (t < T.k1) {
    const k = (t - T.h2) / (T.k1 - T.h2);
    return orbit(head.clone().add(V(0, -0.25, 0)), lerp(2.7, 2.3, k), nAz + lerp(-42, -18, k), lerp(9, 13, k), 40, 0.002);
  }
  if (t < T.k2) {
    const k = (t - T.k1) / (T.k2 - T.k1);
    return orbit(V(0, 0.9, 0.4), lerp(22, 20, k), lerp(18, 40, k), 38, 40, 0.004);
  }
  if (t < T.k3) {
    const k = (t - T.k2) / (T.k3 - T.k2);
    return orbit(V(0, 2.2, 0), lerp(23, 20, k), lerp(40, 58, k), lerp(34, 38, k), 40, 0.004);
  }
  if (t < T.m1) {
    const k = (t - T.k3) / (T.m1 - T.k3);
    return orbit(V(0, 0.3, 0.8), lerp(23, 21, k), lerp(58, 72, k), lerp(30, 26, k), 40, 0.004);
  }
  if (t < T.m2) {
    const k = smooth((t - T.m1) / (T.m2 - T.m1));
    return orbit(V(-4.2, 1.0, -5.1).lerp(V(-5.2, 3.2, -4.4), k), lerp(10.5, 10, k), lerp(28, 52, k), lerp(20, 24, k), 40, 0.003);
  }
  if (t < T.m3) {
    const k = (t - T.m2) / (T.m3 - T.m2);
    return orbit(head.clone().add(V(0, 0.1, 0)), lerp(1.8, 1.55, k), nAz + lerp(35, 18, k), lerp(16, 12, k), 40, 0.0016);
  }
  if (t < T.m4) {
    const k = (t - T.m3) / (T.m4 - T.m3);
    return orbit(V(0, 1.2, 0), lerp(24, 22, k), lerp(25, 62, k), 42, 40, 0.004);
  }
  if (t < T.m5) {
    const k = (t - T.m4) / (T.m5 - T.m4);
    return orbit(head.clone().add(V(0, 1.15, 0)), lerp(6.4, 5.8, k), nAz + lerp(-38, -22, k), lerp(10, 14, k), 40, 0.002);
  }
  if (t < T.r1) {
    const k = (t - T.m5) / (T.r1 - T.m5);
    const p = pathPoint(0.47);
    const n = normalAz(0.47);
    return orbit(V(p.x, SLAB_TOP + 0.45, p.z), lerp(4.6, 4.0, k), n + lerp(-14, 8, k), lerp(7, 9, k), 40, 0.0025);
  }
  const sec = SECTION_POS.clone().add(V(0, SEC_BASE + 0.75, 0));
  if (t < T.r2) {
    const k = smooth((t - T.r1) / (T.r2 - T.r1));
    return orbit(sec, lerp(7.2, 5.0, k), lerp(78, 58, k), lerp(16, 24, k), 40, 0.003);
  }
  if (t < T.r3) {
    const k = (t - T.r2) / (T.r3 - T.r2);
    return orbit(sec, lerp(5.0, 4.5, k), lerp(58, 46, k), lerp(24, 30, k), 40, 0.003);
  }
  if (t < T.p1) {
    const k = (t - T.r3) / (T.p1 - T.r3);
    return orbit(sec.clone().add(V(0.3, -0.1, 0)), lerp(5.0, 5.4, k), lerp(60, 70, k), lerp(40, 46, k), 40, 0.003);
  }
  if (t < T.p2) {
    const k = (t - T.p1) / (T.p2 - T.p1);
    return orbit(V(-0.6, 2.0, -1.0), lerp(26, 31, k), lerp(28, 36, k), lerp(26, 31, k), 40, 0.005);
  }
  if (t < T.p3) {
    const k = (t - T.p2) / (T.p3 - T.p2);
    return orbit(V(-0.6, 2.2, -1.0), lerp(31, 29, k), lerp(36, 22, k), lerp(31, 34, k), 40, 0.005);
  }
  if (t < T.o1) {
    const k = (t - T.p3) / (T.o1 - T.p3);
    return orbit(V(-0.4, 2.0, -0.6), lerp(26, 24, k), lerp(18, 32, k), lerp(30, 27, k), 40, 0.005);
  }
  if (t < T.o2) {
    const k = (t - T.o1) / (T.o2 - T.o1);
    return orbit(V(-0.4, 2.0, -0.6), lerp(24, 26, k), lerp(32, 48, k), lerp(27, 26, k), 40, 0.005);
  }
  // final: glide to the AUDIRA plate on the parked bridge
  const k = smooth((t - T.o2) / 1.4);
  const plate = platePos(t);
  const wide = orbit(V(-0.4, 2.0, -0.6), 26, 48, 26, 40, 0.005);
  const close = orbit(plate, 6.2, 8, 10, 40, 0.003);
  return {
    pos: [lerp(wide.pos[0], close.pos[0], k), lerp(wide.pos[1], close.pos[1], k), lerp(wide.pos[2], close.pos[2], k)],
    target: [lerp(wide.target[0], close.target[0], k), lerp(wide.target[1], close.target[1], k), lerp(wide.target[2], close.target[2], k)],
    fov: 40,
    aperture: lerp(0.005, 0.003, k),
  };
};

const platePos = (t: number) => {
  const s = stateAt(t, 0);
  const head = headAt(s.P);
  const rail = railFor(head, s.lift);
  return V(plateX(head), rail + 0.65, head.z + 0.26);
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.fov = cam.fov;
    p.near = 0.05;
    p.far = 220;
    p.lookAt(...cam.target);
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
  });
  return null;
};

const project = (cam: Cam, p: THREE.Vector3) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 220);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = p.clone().project(c);
  return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920, ok: v.z < 1 };
};

// ---------- overlay pieces ----------
const pop = (t: number, a: number, b = 99) => {
  if (t < a || t > b) return 0;
  const k = clamp01((t - a) / 0.35);
  const s = 1 + 0.12 * Math.sin(k * Math.PI) * (1 - k);
  return Math.min(1, k * 1.6) * s * (1 - clamp01((t - (b - 0.25)) / 0.25));
};

const Pill: React.FC<{ at: { x: number; y: number }; text: string; dx: number; dy: number; color: string; k: number; strike?: boolean }> = ({ at, text, dx, dy, color, k, strike }) => {
  if (k <= 0) return null;
  const half = text.length * 9 + 34;
  const x = Math.max(40 + half, Math.min(1040 - half, at.x + dx));
  const y = Math.max(370, Math.min(1320, at.y + dy));
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, k) }}>
        <line x1={at.x} y1={at.y} x2={x} y2={y} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
        <line x1={at.x} y1={at.y} x2={x} y2={y} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        <circle cx={at.x} cy={at.y} r={10} fill="#FFFFFF" stroke={color} strokeWidth={5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${k})`,
          background: "rgba(255,255,255,0.94)",
          border: `3px solid ${color}`,
          borderRadius: 999,
          padding: "10px 26px 12px",
          fontWeight: 600,
          fontSize: 34,
          color: C.ink,
          whiteSpace: "nowrap",
          boxShadow: "0 10px 26px rgba(120,90,160,0.22)",
          textDecoration: strike ? "line-through" : "none",
          textDecorationThickness: 4,
        }}
      >
        {text}
      </div>
    </>
  );
};

const Card: React.FC<{ k: number; top: number; children: React.ReactNode; accent?: string }> = ({ k, top, children, accent = C.pink }) => {
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        transform: `translateY(${(1 - Math.min(1, k)) * 30}px)`,
        opacity: Math.min(1, k),
        background: "rgba(255,247,242,0.92)",
        borderRadius: 36,
        borderLeft: `14px solid ${accent}`,
        padding: "26px 34px 28px",
        boxShadow: "0 14px 40px rgba(120,90,160,0.22)",
        color: C.ink,
      }}
    >
      {children}
    </div>
  );
};

// ---------- captions ----------
type Chunk = { words: Word[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of TL.clips) {
    const ws = c.words as Word[];
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const rest = ws.length - i - 1;
      const punct = /[,.]$/.test(w.w);
      if ((cur.length >= 6 || (punct && cur.length >= 2) || rest === 0) && !(rest > 0 && rest < 2 && !punct)) {
        out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    });
    if (cur.length) {
      const last = out[out.length - 1];
      last.words.push(...cur);
      last.e = cur[cur.length - 1].e;
    }
  }
  return out;
})();

const lines = (ws: Word[]) => {
  if (ws.length <= 4) return [ws];
  const half = Math.ceil(ws.length / 2);
  return [ws.slice(0, half), ws.slice(half)];
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T.outro) return null;
  const idx = CHUNKS.findIndex((c, i) => t >= c.s - 0.05 && t < (CHUNKS[i + 1]?.s ?? c.e + 0.6) && t < c.e + 0.6);
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  const k = clamp01((t - ch.s + 0.05) / 0.18);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", opacity: k }}>
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: 30,
          padding: "18px 30px 20px",
          boxShadow: "0 12px 34px rgba(120,90,160,0.22)",
          transform: `translateY(${(1 - k) * 14}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lines(ch.words).map((ln, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap" }}>
            {ln.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.08;
              const done = t >= w.e + 0.08;
              const b = active ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.2) * Math.PI) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    marginRight: wi < ln.length - 1 ? 22 : 0,
                    padding: "2px 10px 4px",
                    borderRadius: 14,
                    background: active ? C.pink : "transparent",
                    color: active ? "#FFFFFF" : done ? C.ink : "rgba(63,53,84,0.55)",
                    fontWeight: 600,
                    fontSize: 50,
                    lineHeight: 1.12,
                    transform: `scale(${b})`,
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
  );
};

// ---------- small icons ----------
const Toothpaste: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => {
  if (k <= 0) return null;
  const squeeze = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <svg width={260} height={150} viewBox="0 0 260 150" style={{ position: "absolute", left: x - 130, top: y - 75, transform: `scale(${k})` }}>
      <rect x={6} y={6} width={248} height={138} rx={36} fill="rgba(255,255,255,0.94)" stroke={C.mint} strokeWidth={4} />
      <path d={`M40 ${52 + squeeze * 4} L140 ${46} L140 104 L40 ${98 - squeeze * 4} Z`} fill={C.lilac} />
      <rect x={140} y={62} width={24} height={26} rx={5} fill={C.ink} />
      <path d={`M164 75 Q ${190 + squeeze * 10} 75 ${200 + squeeze * 14} 92 Q 210 108 226 106`} stroke={C.mortarFresh} strokeWidth={14} fill="none" strokeLinecap="round" />
    </svg>
  );
};

const DownArrows: React.FC<{ pts: { x: number; y: number }[]; k: number; t: number }> = ({ pts, k, t }) => {
  if (k <= 0) return null;
  const bob = Math.sin(t * 6) * 6;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, k) }}>
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y - 120 + bob})`}>
          <rect x={-9} y={0} width={18} height={70} rx={9} fill={C.orange} stroke="#FFFFFF" strokeWidth={4} />
          <path d="M-30 64 L30 64 L0 104 Z" fill={C.orange} stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
};

const Bracket: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; k: number; text: string }> = ({ a, b, k, text }) => {
  if (k <= 0) return null;
  const x = Math.min(a.x, b.x) - 70;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, k) }}>
        <path d={`M${a.x - 18} ${a.y} L${x} ${a.y} L${x} ${b.y} L${b.x - 18} ${b.y}`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinejoin="round" />
        <path d={`M${a.x - 18} ${a.y} L${x} ${a.y} L${x} ${b.y} L${b.x - 18} ${b.y}`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x - 16,
          top: (a.y + b.y) / 2,
          transform: `translate(-100%, -50%) scale(${k})`,
          background: C.ink,
          color: "#FFFFFF",
          borderRadius: 999,
          padding: "10px 26px 12px",
          fontWeight: 600,
          fontSize: 40,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </>
  );
};

const KICKERS: [number, string][] = [
  [0, "PRINTER 3D RUMAH"],
  [T.k1, "1 · MODEL & FONDASI"],
  [T.m1, "2 · CARA MENCETAK"],
  [T.r1, "3 · DI DALAM DINDING"],
  [T.p1, "4 · YANG TIDAK DICETAK"],
  [T.o1, "RINGKASNYA"],
];

const Overlay: React.FC<{ t: number; cam: Cam; s: WorldState }> = ({ t, cam, s }) => {
  const P = s.P;
  const head = headAt(P);
  const nozzle = project(cam, head);
  const kicker = [...KICKERS].reverse().find(([a]) => t >= a)![1];
  const printingShot = (t < T.k1) || (t >= T.m2 && t < T.r1);
  const elements: React.ReactNode[] = [];

  // HOOK
  if (t < T.h2) {
    elements.push(<Pill key="sem" at={nozzle} text="menyemprot" dx={-230} dy={-300} color="#B9B2C6" k={pop(t, W("l01", 4), T.h2)} strike />);
    elements.push(<Pill key="per" at={nozzle} text="✓ diperas" dx={220} dy={-210} color={C.mint} k={pop(t, W("l01", 6), T.h2)} />);
  } else if (t < T.k1) {
    elements.push(<Toothpaste key="tp" x={300} y={760} k={pop(t, W("l02", 3) - 0.2, T.k1)} t={t} />);
    elements.push(<Pill key="lp" at={project(cam, head.clone().add(new THREE.Vector3(0, -0.5, 0)))} text="lapis demi lapis" dx={170} dy={260} color={C.lilac} k={pop(t, W("l02", 5), T.k1)} />);
  }
  // KONTEKS
  if (t >= T.k1 && t < T.k2) {
    elements.push(<Pill key="m3d" at={project(cam, new THREE.Vector3(1.4, wallTop(PMAX) + 0.3, 1.6))} text="model 3D" dx={120} dy={-260} color={C.lilac} k={pop(t, W("l03", 3), T.k2)} />);
  }
  if (t >= T.k2 && t < T.k3) {
    elements.push(<Pill key="sl" at={project(cam, new THREE.Vector3(3.6, 1.6, 0.4))} text="lapisan tipis" dx={-60} dy={330} color={C.lilac} k={pop(t, W("l04", 3), T.k3)} />);
    const tpY = SLAB_TOP + 8 * ((PMAX * LAYER_H) / 9 + s.explode * 0.42) + 0.3;
    elements.push(<Pill key="jl" at={project(cam, new THREE.Vector3(-3.0, tpY, 2.8))} text="jalur kepala cetak" dx={60} dy={-240} color={C.pink} k={pop(t, W("l04", 6), T.k3)} />);
  }
  if (t >= T.k3 && t < T.m1) {
    elements.push(<Pill key="fd" at={project(cam, new THREE.Vector3(2.0, SLAB_TOP, 3.2))} text="fondasi: dicor biasa" dx={-80} dy={-330} color={C.mint} k={pop(t, W("l05", 2), T.m1)} />);
  }
  // MEKANISME
  if (t >= T.m1 && t < T.m2) {
    elements.push(<Pill key="mx" at={project(cam, new THREE.Vector3(-4.0, 1.25, -5.5))} text="mortar khusus" dx={-40} dy={-330} color={C.orange} k={pop(t, W("l06", 1), T.m2)} />);
    const hc = hoseCurve(head, s.lift);
    elements.push(<Pill key="hs" at={project(cam, hc.getPointAt(0.24))} text="dipompa lewat selang" dx={-60} dy={300} color={C.lilac} k={pop(t, W("l06", 4), T.m2)} />);
  }
  if (t >= T.m2 && t < T.m3) {
    const u = P - Math.floor(P);
    const bp = pathPoint(u - 0.012);
    const y0 = SLAB_TOP + 0.002;
    const y1 = SLAB_TOP + LAYER_H;
    elements.push(<Bracket key="br" a={project(cam, new THREE.Vector3(bp.x, y1, bp.z))} b={project(cam, new THREE.Vector3(bp.x, y0, bp.z))} k={pop(t, W("l07", 4), T.m3)} text="1–4 cm" />);
  }
  if (t >= T.m3 && t < T.m4) {
    elements.push(<Pill key="dn" at={nozzle} text="mengelilingi denah" dx={-120} dy={-330} color={C.pink} k={pop(t, W("l07", 9), T.m4)} />);
    elements.push(<Pill key="nl" at={project(cam, new THREE.Vector3(5.0, railFor(head, 0), 4.3))} text="naik 1 lapis ↑" dx={-130} dy={-200} color={C.mint} k={pop(t, W("l07", 12), T.m4)} />);
  }
  if (t >= T.m4 && t < T.m5) {
    const hc = hoseCurve(head, s.lift);
    elements.push(<Pill key="cr" at={project(cam, hc.getPointAt(0.95))} text="cair saat dipompa" dx={-200} dy={-230} color="#5FA8E8" k={pop(t, W("l08", 2), T.m5)} />);
    const u = P - Math.floor(P);
    const bp = pathPoint(u - 0.02);
    elements.push(<Pill key="kk" at={project(cam, new THREE.Vector3(bp.x, head.y - LAYER_H * 0.5, bp.z))} text="kaku setelah keluar" dx={120} dy={300} color={C.orange} k={pop(t, W("l08", 7), T.m5)} />);
  }
  if (t >= T.m5 && t < T.r1) {
    const top = wallTop(Math.floor(P));
    const pts = [0.455, 0.47, 0.485].map((u) => {
      const p = pathPoint(u);
      return project(cam, new THREE.Vector3(p.x, top + 0.05, p.z));
    });
    elements.push(<DownArrows key="ar" pts={pts} k={pop(t, W("l08", 11), T.r1)} t={t} />);
    elements.push(<Pill key="tc" at={project(cam, new THREE.Vector3(pathPoint(0.47).x, SLAB_TOP + 0.3, pathPoint(0.47).z))} text="tanpa cetakan" dx={200} dy={330} color={C.mint} k={pop(t, W("l08", 16), T.r1)} />);
  }
  // REVEAL
  const sp = (x: number, y: number, z: number) => project(cam, SECTION_POS.clone().add(new THREE.Vector3(x, y, z)));
  const secMid = SEC_BASE + (SEC_LAYERS * LAYER_H) / 2;
  const secTopY = SEC_BASE + SEC_LAYERS * LAYER_H;
  if (t >= T.r1 && t < T.r2) {
    elements.push(<Pill key="bo" at={sp(SEC_L / 2 - 0.3, secTopY, 0)} text="berongga" dx={-120} dy={-300} color={C.lilac} k={pop(t, W("l09", 3), T.r2)} />);
  }
  if (t >= T.r2 && t < T.r3) {
    elements.push(<Pill key="k1" at={sp(SEC_L / 2, secMid + 0.3, SKIN + BEAD_R)} text="kulit luar" dx={-60} dy={-360} color={C.mint} k={pop(t, W("l09", 5), T.r3)} />);
    elements.push(<Pill key="k2" at={sp(SEC_L / 2, secMid - 0.3, -SKIN - BEAD_R)} text="kulit dalam" dx={80} dy={330} color={C.mint} k={pop(t, W("l09", 5) + 0.2, T.r3)} />);
    elements.push(<Pill key="zz" at={sp(0.3, secTopY, 0.06)} text="penghubung zigzag" dx={-140} dy={-250} color={C.pink} k={pop(t, W("l09", 7), T.r3)} />);
  }
  if (t >= T.r3 && t < T.p1) {
    elements.push(<Pill key="in" at={sp(-0.6, SEC_BASE + 0.5, 0)} text="insulasi" dx={-150} dy={320} color={C.butter} k={pop(t, W("l10", 4), T.p1)} />);
    elements.push(<Pill key="bs" at={sp(-0.9, secTopY + 0.2, 0.05)} text="besi" dx={-120} dy={-300} color="#9AA3AE" k={pop(t, W("l10", 5), T.p1)} />);
    elements.push(<Pill key="kb" at={sp(-0.3, secTopY + 0.25, 0.05)} text="kabel" dx={170} dy={-360} color={C.orange} k={pop(t, W("l10", 7), T.p1)} />);
  }
  // PAYOFF
  const cardK1 = pop(t, W("l11", 1), T.p2);
  const hours = Math.round(100 * smooth((t - W("l12", 3)) / 1.3));
  const cardK2 = pop(t, W("l12", 1), T.p3 + 0.2);
  if (t >= T.p3 && t < T.o1) {
    elements.push(<Pill key="at" at={project(cam, new THREE.Vector3(0.8, wallTop(PMAX) + 0.2, 0.4))} text="atap" dx={60} dy={-300} color={C.lilac} k={pop(t, W("l12", 8) + 0.6, T.o1)} />);
    elements.push(<Pill key="jd" at={project(cam, new THREE.Vector3(-0.1, SLAB_TOP + 1.25, 2.9))} text="jendela" dx={-200} dy={260} color="#5FA8E8" k={pop(t, W("l12", 9) + 0.3, T.o1)} />);
    elements.push(<Pill key="is" at={project(cam, new THREE.Vector3(4.4, 1.2, 1.2))} text="dipasang pekerja" dx={60} dy={330} color={C.mint} k={pop(t, W("l12", 11), T.o1)} />);
  }
  if (t >= T.o1 && t < T.o2 + 0.4) {
    elements.push(<Pill key="d1" at={project(cam, new THREE.Vector3(3.5, SLAB_TOP + 1.0, 1.8))} text="dicetak: dinding" dx={80} dy={330} color={C.mint} k={pop(t, W("l13", 2), T.o2 + 0.4)} />);
    elements.push(<Pill key="d2" at={project(cam, new THREE.Vector3(-1.2, wallTop(PMAX) + 0.2, -0.4))} text="dipasang: atap & jendela" dx={-20} dy={-300} color={C.lilac} k={pop(t, W("l13", 3), T.o2 + 0.4)} />);
  }

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, fontFamily: `'${MANROPE}', sans-serif`, color: C.ink }}>
      {/* kicker + layer counter */}
      <div style={{ position: "absolute", top: 268, left: 64, right: 64, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.88)", padding: "9px 20px", borderRadius: 999, fontSize: 24, letterSpacing: 5, fontWeight: 600, color: "#E2628F" }}>{kicker}</div>
        </div>
        {printingShot && (
          <div style={{ background: "rgba(255,255,255,0.88)", border: `3px solid ${C.orange}`, padding: "8px 20px", borderRadius: 999, fontSize: 26, letterSpacing: 2, fontWeight: 600 }}>
            LAPISAN {String(Math.min(PMAX, Math.floor(P) + 1)).padStart(2, "0")}
          </div>
        )}
      </div>
      {elements}
      <Card k={cardK1} top={340} accent={C.pink}>
        <div style={{ fontSize: 30, letterSpacing: 4, fontWeight: 600, color: "#E2628F" }}>INGAT</div>
        <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.1, marginTop: 6 }}>jam cetak ≠ rumah jadi</div>
      </Card>
      <Card k={cardK2} top={340} accent={C.mint}>
        <div style={{ fontSize: 30, letterSpacing: 4, fontWeight: 600, color: "#3FAE86" }}>BECKUM, JERMAN</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1, letterSpacing: -2 }}>{Math.max(0, hours)}</div>
          <div style={{ fontSize: 44, fontWeight: 600 }}>jam</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 500, marginTop: 6 }}>waktu cetak dindingnya</div>
      </Card>
      <Captions t={t} />
    </div>
  );
};

// ---------- composition ----------
const useFontsOk = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep073 film fonts"));
  useEffect(() => {
    manropeReady().then(
      () => setOk(true),
      () => setOk(true),
    );
  }, []);
  useEffect(() => {
    if (ok) continueRender(handle);
  }, [ok, handle]);
  return ok;
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const ok = useFontsOk();
  const s = useMemo(() => stateAt(t, f), [t, f]);
  const cam = useMemo(() => camAt(t), [t]);
  const focus = new THREE.Vector3(...cam.pos).distanceTo(new THREE.Vector3(...cam.target));
  const sc = width / 1080;

  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.VSMShadowMap }} camera={{ position: cam.pos, fov: cam.fov, near: 0.05, far: 220 }}>
        <CameraRig cam={cam} />
        <hemisphereLight args={["#E9F0FF", "#F6D7CF", 0.6]} />
        <directionalLight
          position={[6, 16, 9]}
          intensity={1.7}
          color="#FFF5EE"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
          shadow-camera-far={60}
          shadow-radius={12}
          shadow-blurSamples={16}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-8, 5, 7]} intensity={0.5} color="#FFE7F0" />
        <directionalLight position={[2, 6, -12]} intensity={0.45} color="#E4ECFF" />
        <directionalLight position={[-16, 3.2, 10]} intensity={0.9} color="#FFF1E4" />
        {ok && <FilmWorld s={s} />}
        <Finish
          frame={frame}
          background={C.wall}
          profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
          exposure={0.84}
          envIntensity={0.3}
          hdri="studio"
          focus={focus}
          aperture={cam.aperture}
          maxBlur={0.011}
        />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${sc})`, transformOrigin: "0 0", pointerEvents: "none" }}>
        {ok && <Overlay t={t} cam={cam} s={s} />}
      </div>
      <Outro start={T.outro} />
    </AbsoluteFill>
  );
};
