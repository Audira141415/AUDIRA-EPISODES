// EP02 film (MARBLEMUSEUM): "19 Pahlawan Nasional baru". One continuous night walk through the
// approved cover hall: hook exhibits -> Hoegeng lectern -> crane over 19 plaques -> Keppres sheet
// -> dolly past the named steles -> nomination ladder -> Margono stele with two balanced cards ->
// Hoegeng's guest book -> fly back to the wide hall. Kit post chain (MarblePost), as on the cover.
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { MarbleCameraRig, MarblePost, type MarbleShot } from "../../kits/marblemuseum/lib/post";
import { MARBLE_PALETTE } from "../../kits/marblemuseum/lib/palette";
import { Outro } from "../_shared/Outro.tsx";
import { BG, BOOK_POS, BUMP_POS, HERO_PLAQUE, KEPPRES_SHEET, MARGONO_SLOT, STATUE_POS, STAIR, World, slotPose, type V3 } from "./World.tsx";
import { CLIPS, OUTRO_AT, SEC, STEP_T, T, TOTAL, seg, win, type Word } from "./timing.ts";

const { fontFamily: CINZEL, waitUntilDone } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });
const { fontFamily: CORM, waitUntilDone: waitCorm } = loadCormorant("normal", { weights: ["500", "700"], subsets: ["latin"] });
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const GOLD = MARBLE_PALETTE.hudGilt;
const INK = "#1D1A17";
const OXBLOOD = "#8C1D18";

// ------------------------------------------------------------------ camera (PCHIP keys, never parked)
type Key = { t: number; p: V3; q: V3; f: number };
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const steleCam = (slot: number, t: number, dist: number, up = 0.55, f = 44): Key => {
  const { center, normal } = slotPose(slot);
  const aisle = center[0] < 0 ? 0.15 : -0.15;
  return { t, p: [center[0] + normal[0] * dist + aisle, center[1] + up, center[2] + normal[2] * dist], q: add(center, [0, 0.03, 0]), f };
};
const bookN: V3 = [Math.sin(0.35), 0, Math.cos(0.35)];
const BOOK_C: V3 = [BOOK_POS[0], 1.0, BOOK_POS[2]];
const bookCam = (t: number, d: number, up: number): Key => ({ t, p: [BOOK_C[0] + bookN[0] * d, BOOK_C[1] + up, BOOK_C[2] + bookN[2] * d], q: BOOK_C, f: 42 });

const KEYS: Key[] = [
  { t: 0, p: [0, 2.45, 8.7], q: [0, 0.78, 3.4], f: 44 },
  { t: 3.4, p: [0, 2.3, 8.1], q: [0, 0.78, 3.6], f: 44 },
  { t: T.tidur + 0.4, p: [BUMP_POS[0] + 0.25, 1.75, BUMP_POS[2] + 2.3], q: [BUMP_POS[0], 0.55, BUMP_POS[2] - 0.2], f: 40 },
  { t: T.patung + 0.5, p: [STATUE_POS[0] - 0.35, 1.8, STATUE_POS[2] + 2.4], q: [STATUE_POS[0], 1.15, STATUE_POS[2]], f: 40 },
  { t: T.hoegeng + 0.6, p: [0, 1.95, 6.2], q: [-0.2, 1.15, 2.7], f: 42 },
  { t: SEC.HOOK[1] - 0.4, p: [-0.22, 1.78, 4.45], q: HERO_PLAQUE, f: 40 },
  { t: 13.2, p: [0.1, 3.2, 5.4], q: [0, 1.0, -4], f: 46 },
  { t: T.prabowo + 2.8, p: [0.1, 3.9, 4.6], q: [0, 1.0, -7], f: 46 },
  { t: T.provinsi + 0.8, p: [0.15, 3.5, 4.8], q: [0.1, 1.1, -3], f: 46 },
  { t: T.keppres + 1.0, p: [KEPPRES_SHEET[0], 2.0, 3.75], q: KEPPRES_SHEET, f: 40 },
  { t: T.rekor + 0.3, p: [0.45, 1.9, 3.6], q: add(KEPPRES_SHEET, [-0.05, 0, 0]), f: 40 },
  { t: T.hoegeng2 + 0.4, p: [-0.25, 1.85, 3.75], q: HERO_PLAQUE, f: 40 },
  { t: T.sadikin - 0.9, p: [-0.27, 1.78, 3.5], q: HERO_PLAQUE, f: 40 },
  { t: T.sadikin - 0.25, p: [-0.1, 2.45, 2.3], q: [-0.9, 1.2, -0.5], f: 42 },
  steleCam(0, T.sadikin + 0.4, 2.3),
  steleCam(0, T.roem - 0.5, 2.05),
  steleCam(1, T.roem + 0.4, 2.3),
  steleCam(1, T.sastro - 0.5, 2.05),
  steleCam(2, T.sastro + 0.4, 2.3),
  steleCam(2, T.takdir - 0.5, 2.05),
  steleCam(3, T.takdir + 0.4, 2.3),
  steleCam(3, T.wasyid - 0.5, 2.05),
  steleCam(4, T.wasyid + 0.4, 2.3),
  steleCam(4, SEC.PENJELASAN[0] - 0.2, 2.0),
  { t: T.gelar + 1.4, p: [0, 1.9, -7.5], q: [0, 1.3, -16], f: 44 },
  { t: T.usulan + 0.6, p: [0.35, 2.0, -11.6], q: [0, 1.2, STAIR.z0 - 1.6], f: 44 },
  { t: T.prov + 0.4, p: [0.32, 2.3, -11.5], q: [0, 1.25, STAIR.z0 - 2.0], f: 44 },
  { t: T.dewan + 0.3, p: [0.3, 2.6, -12.1], q: [0, 1.6, STAIR.z0 - 2.6], f: 44 },
  { t: T.presiden + 0.3, p: [0.5, 2.8, -13.4], q: [0, 2.3, STAIR.z0 - 3.2], f: 44 },
  steleCam(MARGONO_SLOT, T.margono + 0.3, 2.35),
  steleCam(MARGONO_SLOT, T.pemerintah - 0.3, 2.1),
  steleCam(MARGONO_SLOT, T.cucu - 0.6, 2.55, 0.5, 46),
  bookCam(T.tamu - 0.3, 1.9, 1.55),
  bookCam(T.jamPulang + 0.4, 1.6, 1.3),
  { t: SEC.OUTRO[0] + 2.6, p: [0, 3.8, 5.0], q: [0, 1.0, -8], f: 46 },
  { t: OUTRO_AT, p: [0, 4.2, 7.6], q: [0, 1.0, -7], f: 46 },
  { t: TOTAL + 0.5, p: [0, 4.25, 7.9], q: [0, 1.0, -7], f: 46 },
];

/** Monotone cubic (Fritsch–Carlson) per component: smooth velocity, no overshoot into props. */
const pchip = (ts: number[], ys: number[], t: number) => {
  const n = ts.length;
  if (t <= ts[0]) return ys[0];
  if (t >= ts[n - 1]) return ys[n - 1];
  let i = 0;
  while (t > ts[i + 1]) i++;
  const d = (k: number) => (ys[k + 1] - ys[k]) / (ts[k + 1] - ts[k]);
  const m = (k: number) => {
    if (k === 0) return d(0);
    if (k === n - 1) return d(n - 2);
    const a = d(k - 1), b = d(k);
    if (a * b <= 0) return 0;
    const h0 = ts[k] - ts[k - 1], h1 = ts[k + 1] - ts[k];
    const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const h = ts[i + 1] - ts[i];
  const s = (t - ts[i]) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * ys[i] + h10 * h * m(i) + h01 * ys[i + 1] + h11 * h * m(i + 1);
};
const KT = KEYS.map((k) => k.t);
const comp = (fn: (k: Key) => number) => KEYS.map(fn);
const CH = {
  px: comp((k) => k.p[0]), py: comp((k) => k.p[1]), pz: comp((k) => k.p[2]),
  qx: comp((k) => k.q[0]), qy: comp((k) => k.q[1]), qz: comp((k) => k.q[2]), f: comp((k) => k.f),
};
const shotAt = (t: number): MarbleShot => ({
  pos: [pchip(KT, CH.px, t), pchip(KT, CH.py, t), pchip(KT, CH.pz, t)],
  target: [pchip(KT, CH.qx, t), pchip(KT, CH.qy, t), pchip(KT, CH.qz, t)],
  fov: pchip(KT, CH.f, t),
  exposure: 0.82,
});

// ------------------------------------------------------------------ HUD pieces
const Fade: React.FC<{ o: number; style: React.CSSProperties; children: React.ReactNode; rise?: number; s: number }> = ({ o, style, children, rise = 18, s }) => {
  if (o <= 0.001) return null;
  return <div style={{ position: "absolute", opacity: o, transform: `translateY(${(1 - o) * rise * s}px)`, ...style }}>{children}</div>;
};

/** Museum wall label: name + role (no portraits of real people). */
const NameCard: React.FC<{ o: number; s: number; name: string; lines: string[]; kicker?: string }> = ({ o, s, name, lines, kicker = "PAHLAWAN NASIONAL 2026" }) => (
  <Fade o={o} s={s} style={{ left: 60 * s, top: 300 * s, width: 640 * s }}>
    <div style={{ background: "rgba(246,241,231,0.95)", color: INK, padding: `${20 * s}px ${28 * s}px ${22 * s}px`, borderLeft: `${8 * s}px solid ${OXBLOOD}`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 * s, letterSpacing: 4 * s, color: "#7A6A55" }}>{kicker}</div>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 40 * s, lineHeight: 1.12, marginTop: 8 * s }}>{name}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: CORM, fontWeight: 700, fontSize: 32 * s, lineHeight: 1.25, color: "#3B342D", marginTop: i === 0 ? 6 * s : 0 }}>
          {l}
        </div>
      ))}
    </div>
  </Fade>
);

const Title: React.FC<{ o: number; s: number; text: string; size?: number; color?: string; top?: number; sub?: string }> = ({ o, s, text, size = 76, color = "#F4ECDD", top = 290, sub }) => (
  <Fade o={o} s={s} style={{ left: 0, right: 0, top: top * s, textAlign: "center" }}>
    <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: size * s, lineHeight: 1.04, color, letterSpacing: 2 * s, textShadow: `0 ${5 * s}px ${24 * s}px rgba(0,0,0,0.75)` }}>{text}</div>
    {sub && <div style={{ fontFamily: CORM, fontWeight: 700, fontStyle: "italic", fontSize: 40 * s, color: "rgba(244,236,221,0.92)", marginTop: 10 * s, textShadow: `0 ${3 * s}px ${14 * s}px rgba(0,0,0,0.8)` }}>{sub}</div>}
  </Fade>
);

const Chip: React.FC<{ o: number; s: number; text: string; right?: boolean }> = ({ o, s, text, right }) => (
  <Fade o={o} s={s} rise={8} style={{ [right ? "right" : "left"]: 60 * s, top: 262 * s }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 * s, letterSpacing: 4 * s, color: GOLD, border: `${1.5 * s}px solid ${GOLD}`, background: "rgba(18,8,7,0.72)", padding: `${8 * s}px ${16 * s}px` }}>{text}</div>
  </Fade>
);

const Counter: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  const o = win(t, T.sembilanBelas - 0.15, T.keppres - 0.1, 0.25, 0.3);
  if (o <= 0) return null;
  const n19 = Math.round(19 * seg(t, T.sembilanBelas, T.sembilanBelas + 0.9));
  const pOn = seg(t, T.provinsi - 0.1, T.provinsi + 0.2);
  const n12 = Math.round(12 * seg(t, T.provinsi, T.provinsi + 0.7));
  const cell = (n: number, label: string, op: number) => (
    <div style={{ opacity: op, textAlign: "center", width: 360 * s }}>
      <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: 170 * s, lineHeight: 1, color: "#F4ECDD", textShadow: `0 ${6 * s}px ${26 * s}px rgba(0,0,0,0.75)` }}>{n}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 * s, letterSpacing: 7 * s, color: GOLD }}>{label}</div>
    </div>
  );
  return (
    <Fade o={o} s={s} style={{ left: 0, right: 0, top: 300 * s, display: "flex", justifyContent: "center", gap: 40 * s }}>
      {cell(n19, "TOKOH", 1)}
      {cell(n12, "PROVINSI", pOn)}
    </Fade>
  );
};

const LADDER_HUD = ["Tim peneliti kabupaten/kota", "Provinsi", "Kementerian Sosial", "Dewan Gelar", "Presiden"];
const LadderList: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  const o = win(t, T.usulan - 0.3, SEC.PENJELASAN[1] + 0.25, 0.35, 0.35);
  if (o <= 0) return null;
  return (
    <Fade o={o} s={s} style={{ left: 60 * s, top: 300 * s, width: 600 * s }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 * s, letterSpacing: 5 * s, color: GOLD, marginBottom: 12 * s }}>JALUR USULAN GELAR</div>
      {LADDER_HUD.map((l, j) => {
        const on = seg(t, STEP_T[j] - 0.05, STEP_T[j] + 0.25);
        const active = t >= STEP_T[j] - 0.05 && (j === 4 || t < STEP_T[j + 1] - 0.05);
        return (
          <div key={j} style={{ display: "flex", alignItems: "center", gap: 16 * s, marginBottom: 8 * s, opacity: 0.4 + 0.6 * on }}>
            <div style={{ width: 46 * s, height: 46 * s, borderRadius: 23 * s, border: `${2 * s}px solid ${GOLD}`, background: active ? GOLD : "rgba(18,8,7,0.7)", color: active ? INK : GOLD, fontFamily: CINZEL, fontWeight: 900, fontSize: 26 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>{j + 1}</div>
            <div style={{ fontFamily: CORM, fontWeight: 700, fontSize: 38 * s, color: "#F4ECDD", textShadow: `0 ${2 * s}px ${10 * s}px rgba(0,0,0,0.9)` }}>{l}</div>
          </div>
        );
      })}
    </Fade>
  );
};

/** Two equal cards: neither side bigger, brighter, or first-placed in colour. */
const Balance: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  const end = T.cucu - 0.35;
  const a = win(t, T.pemerintah - 0.15, end, 0.3, 0.35);
  const b = win(t, T.sejarawan - 0.15, end, 0.3, 0.35);
  if (a <= 0 && b <= 0) return null;
  const card = (o: number, who: string, l1: string, l2: string) => (
    <div style={{ opacity: o, transform: `translateY(${(1 - o) * 18 * s}px)`, width: 450 * s, background: "rgba(246,241,231,0.95)", color: INK, padding: `${18 * s}px ${22 * s}px`, borderTop: `${6 * s}px solid ${GOLD}`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 * s, letterSpacing: 4 * s, color: "#7A6A55" }}>{who}</div>
      <div style={{ fontFamily: CORM, fontWeight: 700, fontSize: 36 * s, lineHeight: 1.18, marginTop: 6 * s }}>{l1}</div>
      <div style={{ fontFamily: CORM, fontWeight: 700, fontSize: 36 * s, lineHeight: 1.18 }}>{l2}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 300 * s, display: "flex", justifyContent: "space-between" }}>
      {card(a, "PEMERINTAH", "Memenuhi syarat,", "lewat mekanisme")}
      {card(b, "SEJARAWAN", "Kritik: konflik", "kepentingan")}
    </div>
  );
};

// ------------------------------------------------------------------ karaoke captions (museum label)
type Chunk = { words: Word[]; a: number; b: number };
const clean = (w: string) => w.replace(/�/g, "–");
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const n = c.words.length;
    const k = Math.ceil(n / 6);
    const base = Math.floor(n / k);
    let extra = n % k;
    let i = 0;
    const parts: Word[][] = [];
    for (let j = 0; j < k; j++) {
      const len = base + (extra-- > 0 ? 1 : 0);
      parts.push(c.words.slice(i, i + len));
      i += len;
    }
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  const len = (ws: Word[]) => ws.reduce((m, x) => m + clean(x.w).length + 1, 0);
  let cut = n;
  if (n > 4 || len(ch.words) > 26) {
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const diff = Math.abs(len(ch.words.slice(0, i)) - len(ch.words.slice(i)));
      if (diff < best) {
        best = diff;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400 * s, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(246,241,231,0.93)",
          padding: `${12 * s}px ${30 * s}px ${14 * s}px`,
          borderBottom: `${5 * s}px solid ${OXBLOOD}`,
          boxShadow: `0 ${10 * s}px ${28 * s}px rgba(0,0,0,0.5)`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 12 * s}px)`,
          textAlign: "center",
          maxWidth: 960 * s,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.18 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const active = t >= wd.s && t < (ch.words[idx + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.2) : 1;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    margin: `0 ${12 * s}px`,
                    fontFamily: CORM,
                    fontSize: 58 * s,
                    fontWeight: 700,
                    color: active ? OXBLOOD : done ? INK : "rgba(29,26,23,0.42)",
                    transform: `scale(${bump})`,
                    borderBottom: `${3 * s}px solid ${active ? GOLD : "transparent"}`,
                  }}
                >
                  {clean(wd.w)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ overlay
const Overlay: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const hookHead = 1 - seg(t, T.tidur - 0.35, T.tidur - 0.05);
  const item = (a: number) => win(t, a - 0.1, T.hariIni + 0.2, 0.25, 0.35);
  const resmi = win(t, T.resmi - 0.15, SEC.KONTEKS[0] + 0.2, 0.3, 0.3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,6,5,0.85) 0%, rgba(11,6,5,0.55) 16%, rgba(11,6,5,0) 34%, rgba(11,6,5,0) 78%, rgba(11,6,5,0.45) 100%)" }} />

      {/* HOOK: frame 0 = thumbnail */}
      {hookHead > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 262 * s, textAlign: "center", opacity: hookHead }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26 * s, letterSpacing: 4 * s, color: GOLD }}>LELUCON YANG SERING DIKAITKAN DENGAN GUS DUR</div>
          <div style={{ fontFamily: CINZEL, fontWeight: 900, fontSize: 112 * s, lineHeight: 1.0, marginTop: 18 * s, color: "#F4ECDD", textShadow: `0 ${6 * s}px ${28 * s}px rgba(0,0,0,0.75)` }}>
            POLISI JUJUR
          </div>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 92 * s, lineHeight: 1.05, color: "#E9CF8C", textShadow: `0 ${4 * s}px ${20 * s}px rgba(0,0,0,0.75)` }}>CUMA TIGA</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 60 * s, top: 290 * s }}>
        {[
          [T.tidur, "1", "Polisi tidur"],
          [T.patung, "2", "Patung polisi"],
          [T.hoegeng, "3", "Hoegeng"],
        ].map(([a, n, l]) => {
          const o = item(a as number);
          return (
            <div key={n as string} style={{ opacity: o, transform: `translateX(${(1 - o) * -20 * s}px)`, display: "flex", alignItems: "center", gap: 18 * s, marginBottom: 12 * s }}>
              <div style={{ width: 62 * s, height: 62 * s, borderRadius: 31 * s, background: n === "3" ? GOLD : "rgba(18,8,7,0.75)", border: `${2 * s}px solid ${GOLD}`, color: n === "3" ? INK : GOLD, fontFamily: CINZEL, fontWeight: 900, fontSize: 36 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: (n === "3" ? 60 : 48) * s, color: "#F4ECDD", textShadow: `0 ${3 * s}px ${14 * s}px rgba(0,0,0,0.85)` }}>{l}</div>
            </div>
          );
        })}
      </div>
      <Title o={resmi} s={s} text="RESMI PAHLAWAN" sub="Nasional · 10 November 2026" top={300} size={84} />

      {/* KONTEKS */}
      <Chip o={win(t, SEC.KONTEKS[0], T.sembilanBelas - 0.3, 0.3, 0.3)} s={s} text="SELASA · 10 NOV 2026 · ISTANA NEGARA" />
      <NameCard o={win(t, T.prabowo - 0.15, T.sembilanBelas - 0.4, 0.3, 0.3)} s={s} kicker="MENGANUGERAHKAN GELAR" name="PRABOWO SUBIANTO" lines={["Presiden Republik Indonesia"]} />
      <Counter s={s} t={t} />
      <Title o={win(t, T.keppres - 0.1, T.fadli - 0.9, 0.3, 0.3)} s={s} text="KEPPRES 93/TK/2026" sub="Gelar Pahlawan Nasional · 19 tokoh" size={70} />
      <NameCard o={win(t, T.fadli - 0.9, SEC.KONTEKS[1] + 0.1, 0.3, 0.3)} s={s} kicker="MENURUT" name="FADLI ZON" lines={["Menteri Kebudayaan, Ketua Dewan GTK", "Jumlah ini termasuk pemecah rekor"]} />

      {/* PENGEMBANGAN */}
      <NameCard o={win(t, T.hoegeng2 - 0.1, T.sadikin - 0.5, 0.3, 0.3)} s={s} name="HOEGENG IMAN SANTOSO" lines={["Jenderal Polisi · Kapolri 1968–1971", "Dikenal menolak suap"]} />
      <NameCard o={win(t, T.sadikin - 0.1, T.roem - 0.2, 0.3, 0.25)} s={s} name="ALI SADIKIN" lines={["Gubernur DKI Jakarta 1966–1977"]} />
      <NameCard o={win(t, T.roem - 0.1, T.sastro - 0.2, 0.3, 0.25)} s={s} name="MOHAMAD ROEM" lines={["Diplomat, Perundingan Roem-Roijen 1949"]} />
      <NameCard o={win(t, T.sastro - 0.1, T.takdir - 0.2, 0.3, 0.25)} s={s} name="ALI SASTROAMIDJOJO" lines={["Perdana Menteri saat Konferensi", "Asia Afrika 1955"]} />
      <NameCard o={win(t, T.takdir - 0.1, T.wasyid - 0.2, 0.3, 0.25)} s={s} name="SUTAN TAKDIR ALISJAHBANA" lines={["Sastrawan, Pujangga Baru"]} />
      <NameCard o={win(t, T.wasyid - 0.1, SEC.PENGEMBANGAN[1] + 0.1, 0.3, 0.3)} s={s} name="K.H. WASYID" lines={["Pemimpin Geger Cilegon 1888"]} />

      {/* PENJELASAN */}
      <Title o={win(t, SEC.PENJELASAN[0], T.usulan - 0.3, 0.3, 0.3)} s={s} text="TIDAK TURUN" sub="begitu saja" size={92} />
      <LadderList s={s} t={t} />

      {/* PAYOFF */}
      <Title o={win(t, SEC.PAYOFF[0], T.margono - 0.2, 0.3, 0.3)} s={s} text="MEMANCING" sub="perdebatan" size={92} />
      <NameCard
        o={win(t, T.margono - 0.15, T.pemerintah - 0.2, 0.3, 0.3)}
        s={s}
        name="R.M. MARGONO DJOJOHADIKUSUMO"
        lines={seg(t, T.kakek - 0.1, T.kakek) > 0 ? ["Pendiri BNI", "Kakek Presiden Prabowo Subianto"] : ["Pendiri BNI"]}
      />
      <Balance s={s} t={t} />
      <NameCard o={win(t, T.cucu - 0.15, T.buku - 0.2, 0.3, 0.3)} s={s} kicker="CERITA KELUARGA" name="KRISNADI RAMAJAYA HOEGENG" lines={["Cucu Hoegeng"]} />
      <Title o={win(t, T.buku - 0.1, SEC.OUTRO[0] + 0.2, 0.3, 0.3)} s={s} top={340} text="BUKU MUTASI" sub={seg(t, T.jamPulang - 0.1, T.jamPulang) > 0 ? "jam datang · jam pulang" : t >= T.jamDatang - 0.1 ? "jam datang · …" : "wajib diisi tamu"} size={80} />
      <Chip o={win(t, T.cucu - 0.3, SEC.OUTRO[0] + 0.2, 0.3, 0.3)} s={s} text="ILUSTRASI" right />

      {/* OUTRO */}
      <Title o={win(t, SEC.OUTRO[0], OUTRO_AT, 0.4, 0.3)} s={s} text="19 NAMA" sub={t >= T.tokoh - 0.1 ? "Tokoh mana yang paling kamu kenal?" : "19 cerita"} size={110} top={290} />
      <Fade o={win(t, T.tulis - 0.1, OUTRO_AT, 0.3, 0.3)} s={s} style={{ left: 0, right: 0, top: 560 * s, textAlign: "center" }}>
        <div style={{ display: "inline-block", fontFamily: SANS, fontWeight: 700, fontSize: 28 * s, letterSpacing: 5 * s, color: INK, background: GOLD, padding: `${10 * s}px ${22 * s}px` }}>TULIS DI KOMENTAR</div>
      </Fade>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ film
export const Ep02Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const s = width / 1080;
  const [handle] = useState(() => delayRender("ep02-fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    Promise.all([waitUntilDone(), waitCorm()])
      .then(() => Promise.all([document.fonts.load(`700 40px ${CINZEL}`), document.fonts.load(`900 40px ${CINZEL}`), document.fonts.load(`400 40px ${CINZEL}`), document.fonts.load(`700 40px ${CORM}`)]))
      .then(done, done);
  }, [handle]);
  const shot = shotAt(t);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 60 }}>
          <MarbleCameraRig shot={shot} near={0.05} far={60} />
          <World t={t} font={CINZEL} />
          <MarblePost frame={frame} strength={0.18} radius={0.5} threshold={0.95} vignette={0.45} grain={0.02} />
        </ThreeCanvas>
      )}
      <Overlay t={t} s={s} />
      <Captions t={t} s={s} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

export const Film = Ep02Film;
