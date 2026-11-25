// EP06 2D layers (1080x1920 layout pixels): cover titles + cover labels (hook), one pinned chip per beat,
// the half-hour gauge, and karaoke captions on an opaque dark plate above the bottom 380 px.

import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { FONT } from "../../core/type/fonts.ts";
import { useFormat } from "../../core/film/format.ts";
import { prog, smooth, easeOut, window01, type Word } from "./time.ts";
import { PALETTE } from "./layout.ts";

export const SERIF = "JazariSerif";
type V3 = [number, number, number];
export type Shot = { pos: V3; target: V3; fov: number };

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

const cam = new THREE.PerspectiveCamera(26, 9 / 16, 0.05, 200);
export function project(shot: Shot, p: V3, W = 1080, H = 1920): [number, number] | null {
  cam.fov = shot.fov;
  cam.aspect = W / H;
  cam.position.set(...shot.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...shot.target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  if (v.z > 1 || v.z < -1) return null;
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
}

/** Cover titles: identical to the approved cover; they leave when the context starts. */
export const Titles: React.FC<{ t: number; outAt: number }> = ({ t, outAt }) => {
  const out = smooth(prog(t, outAt - 0.6, outAt));
  const a = (1 - out) * Math.min(1, 0.85 + t * 0.5);
  if (a <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 248, left: 72, right: 72, opacity: a, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 600, fontSize: 38, letterSpacing: 6, color: "#F6F1E7", background: PALETTE.lapis, padding: "10px 20px", borderRadius: 10 }}>SEJARAH ISLAM · EP06</div>
      <div style={{ marginTop: 22, fontFamily: `${SERIF}, 'Times New Roman', serif`, fontSize: 150, lineHeight: 0.9, color: PALETTE.ink }}>
        Jam Gajah
        <br />
        <span style={{ color: PALETTE.cut, fontStyle: "italic" }}>800 Tahun</span>
      </div>
      <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 600, fontSize: 40, letterSpacing: 3, color: "#3B4650" }}>AL-JAZARI · ± 1206</div>
    </div>
  );
};

const plate: React.CSSProperties = {
  background: PALETTE.ink,
  color: "#F6F1E7",
  fontFamily: FONT,
  fontWeight: 600,
  letterSpacing: 2,
  borderRadius: 14,
  whiteSpace: "nowrap",
  boxShadow: "0 10px 26px rgba(20,32,43,0.28)",
};

/** A label on a dark plate with a leader to a projected 3D point (ring = hollow ring around the point). */
export const PinLabel: React.FC<{ text: string; at: [number, number]; pin: [number, number] | null; opacity: number; ring?: number }> = ({ text, at, pin, opacity, ring = 11 }) => {
  const x = Math.min(1020 - 20 - text.length * 13, Math.max(60 + 20 + text.length * 13, at[0]));
  const d = pin ? Math.hypot(x - pin[0], at[1] - pin[1]) : 1;
  return (
    <>
      {pin ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity }}>
          <line x1={x} y1={at[1]} x2={pin[0] + ((x - pin[0]) * ring) / d} y2={pin[1] + ((at[1] - pin[1]) * ring) / d} stroke={PALETTE.ink} strokeWidth={3} />
          <circle cx={pin[0]} cy={pin[1]} r={ring} fill={ring > 14 ? "none" : PALETTE.cut} stroke={ring > 14 ? PALETTE.cut : "#fff"} strokeWidth={ring > 14 ? 5 : 3} />
        </svg>
      ) : null}
      <div style={{ ...plate, position: "absolute", left: x, top: at[1], transform: "translate(-50%, -50%)", opacity, fontSize: 40, padding: "12px 22px" }}>
        <span style={{ color: PALETTE.cut, marginRight: 12 }}>●</span>
        {text}
      </div>
    </>
  );
};

export type Chip = { text: string; sub?: string; a: number; b: number; pin?: () => V3 | null; big?: boolean };

/** One chip per beat, centred under the top safe line, with a leader to its 3D point. */
export const Chips: React.FC<{ chips: Chip[]; t: number; shot: Shot }> = ({ chips, t, shot }) => {
  return (
    <>
      {chips.map((c, i) => {
        const v = window01(t, c.a, c.b, 0.15);
        if (v <= 0.001) return null;
        const e = easeOut(prog(t, c.a, c.a + 0.25));
        const p3 = c.pin ? c.pin() : null;
        const pin = p3 ? project(shot, p3) : null;
        const pinOk = pin && pin[0] > 60 && pin[0] < 1020 && pin[1] > 420 && pin[1] < 1300;
        const y = 330;
        const fs = c.big ? 60 : 48;
        return (
          <React.Fragment key={i}>
            {pinOk && pin ? (
              <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: v }}>
                <line x1={540} y1={y + (c.sub ? 70 : 40)} x2={540 + (pin[0] - 540) * e} y2={y + 40 + (pin[1] - y - 40) * e} stroke={PALETTE.ink} strokeWidth={3} />
                <circle cx={pin[0]} cy={pin[1]} r={12 * e} fill={PALETTE.cut} stroke="#fff" strokeWidth={3} />
              </svg>
            ) : null}
            <div style={{ position: "absolute", left: 540, top: y, transform: `translate(-50%, -50%) translateY(${(1 - e) * 20}px)`, opacity: v, textAlign: "center" }}>
              <div style={{ ...plate, fontSize: fs, padding: c.big ? "16px 32px" : "12px 26px", display: "inline-block" }}>
                <span style={{ color: PALETTE.cut, marginRight: 14 }}>●</span>
                {c.text}
              </div>
              {c.sub ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ ...plate, fontSize: 46, padding: "10px 24px", display: "inline-block", background: PALETTE.lapis }}>{c.sub}</div>
                </div>
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The half-hour gauge: driven by the same value as the bowl's sink depth. */
export const Gauge: React.FC<{ v: number; k: number }> = ({ v, k }) => {
  if (v <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: 330, transform: "translate(-50%, -50%)", opacity: v }}>
      <div style={{ ...plate, padding: "16px 26px", display: "flex", alignItems: "center", gap: 22, fontSize: 40 }}>
        <span>AIR MASUK</span>
        <div style={{ width: 300, height: 22, borderRadius: 11, background: "rgba(246,241,231,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${k * 100}%`, height: "100%", background: PALETTE.water }} />
        </div>
        <span style={{ color: k >= 0.999 ? PALETTE.cut : "#F6F1E7" }}>1/2 JAM</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- karaoke captions
const NO_BREAK_AFTER = new Set(["di", "ke", "dari", "pada", "yang", "dan", "dengan", "setengah", "juru", "bak", "mulut", "kepala", "orang", "donald"]);
function chunks(words: Word[], maxChars: number): Word[][] {
  const clauses: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.,;:?!]$/.test(w.w)) {
      clauses.push(cur);
      cur = [];
    }
  }
  if (cur.length) clauses.push(cur);
  const glued: Word[][] = [];
  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i];
    if (c.length === 1 && i + 1 < clauses.length) clauses[i + 1] = [...c, ...clauses[i + 1]];
    else if (c.length === 1 && glued.length) glued[glued.length - 1].push(...c);
    else glued.push(c);
  }
  const len = (ws: Word[]) => ws.reduce((a, w) => a + w.w.length + 1, -1);
  const out: Word[][] = [];
  for (const c of glued) {
    const n = Math.max(1, Math.ceil(len(c) / maxChars));
    if (n === 1 || c.length < 4) {
      out.push(c);
      continue;
    }
    const target = len(c) / n;
    let partW: Word[] = [];
    for (let i = 0; i < c.length; i++) {
      partW.push(c[i]);
      const left = c.length - i - 1;
      if (len(partW) >= target && partW.length >= 2 && left >= 2 && !NO_BREAK_AFTER.has(c[i].w.toLowerCase())) {
        out.push(partW);
        partW = [];
      }
    }
    if (partW.length) out.push(partW);
  }
  return out;
}

export const Captions: React.FC<{ t: number; words: Word[] }> = ({ t, words }) => {
  const groups = React.useMemo(() => chunks(words, 26), [words]);
  const g = groups.find((c) => t >= c[0].s - 0.12 && t <= c[c.length - 1].e + 0.25);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 380 + 40, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "block",
          textWrap: "balance",
          maxWidth: 920,
          padding: "14px 30px 16px",
          borderRadius: 18,
          background: "rgba(14,22,30,0.9)",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 62,
          lineHeight: 1.14,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        {g.map((w, i) => {
          const nextS = i + 1 < g.length ? g[i + 1].s : Infinity;
          const active = t >= w.s && t < Math.min(w.e + 0.05, nextS);
          const spoken = t >= w.s;
          const k = active ? Math.sin(Math.min(1, (t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", margin: "0 0.21em", color: active ? "#FFC857" : spoken ? "#F4EFE6" : "rgba(244,239,230,0.62)", transform: `scale(${1 + 0.04 * k})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
