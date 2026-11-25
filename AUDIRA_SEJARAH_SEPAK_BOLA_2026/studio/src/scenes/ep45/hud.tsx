// EP45 HUD in 1080 × 1920 design px: 16-bit game interface over the pixel sets.
// Kinetic callouts sit between the top safe band (180) and the caption band (y 1290–1540).
import React from "react";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { CLIPS, OUTRO_AT, TOTAL, WIPES, clamp, pop, seg, type Word } from "./timing.ts";

export const RED = "#C8202E";
export const GREEN = "#2BD46A";
const pix: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
const box = (border = RED): React.CSSProperties => ({
  background: rgba(C.ink, 0.86),
  border: `6px solid ${border}`,
  boxShadow: `0 8px 0 ${rgba(C.ink, 0.9)}`,
  padding: "16px 24px",
});

/** Pops in at `a` (game-UI overshoot), out at `b`. */
export const Pop: React.FC<{ t: number; a: number; b?: number; top: number; left?: number; children: React.ReactNode; origin?: string }> = ({
  t, a, b = 1e9, top, left, children, origin = "50% 50%",
}) => {
  if (t < a || t > b) return null;
  const s = pop(t, a);
  const out = 1 - seg(t, b - 0.2, b);
  return (
    <div style={{ position: "absolute", top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: "flex", justifyContent: left === undefined ? "center" : "flex-start" }}>
      <div style={{ transform: `scale(${s * out})`, transformOrigin: origin, opacity: out }}>{children}</div>
    </div>
  );
};

/** Floor 40 px (readable on a phone); long text wraps inside 940 px instead of running off the frame. */
export const Chip: React.FC<{ text: string; color?: string; border?: string; size?: number }> = ({ text, color = C.ivory, border = RED, size = 40 }) => (
  <div style={{ ...pix, ...box(border), fontSize: Math.max(40, size), color, fontWeight: 700, whiteSpace: "normal", maxWidth: 940, textAlign: "center", lineHeight: 1.2 }}>{text}</div>
);

/** Name card for a real person: name + role, no likeness. */
export const NameCard: React.FC<{ name: string; role: string; accent?: string }> = ({ name, role, accent = RED }) => (
  <div style={{ ...box(accent), padding: "14px 22px", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
    <div style={{ fontFamily: FONT.display, fontSize: 64, color: C.ivory, lineHeight: 0.95, letterSpacing: "0.01em" }}>{name}</div>
    <div style={{ ...pix, fontSize: 30, color: C.gold }}>{role}</div>
  </div>
);

/** Rubber-stamp result: slams in with a slight rotation. */
export const Stamp: React.FC<{ t: number; a: number; text: string; sub?: string; top: number; color?: string; rot?: number }> = ({ t, a, text, sub, top, color = C.gold, rot = -4 }) => {
  if (t < a) return null;
  const k = clamp((t - a) / 0.22);
  const s = 1.9 - 0.9 * (1 - (1 - k) ** 3);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, k * 2), border: `10px solid ${color}`, padding: "10px 34px 14px", maxWidth: 860, boxSizing: "border-box", background: rgba(C.ink, 0.78), textAlign: "center" }}>
        <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 0.95, color }}>{text}</div>
        {sub ? <div style={{ ...pix, fontSize: 48, color: C.ivory, marginTop: 6, whiteSpace: "normal", maxWidth: 640, margin: "6px auto 0", lineHeight: 1.15 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** 16-bit level banner: "LEVEL 1" + fixture + score. */
export const LevelBanner: React.FC<{ t: number; a: number; level: number; home: string; away: string; score: string; scoreAt?: number; pending?: string }> = ({
  t, a, level, home, away, score, scoreAt = 0, pending = "–",
}) => {
  if (t < a) return null;
  const slide = 1 - (1 - clamp((t - a) / 0.3)) ** 3;
  const shown = t >= scoreAt ? score : pending;
  const flash = t >= scoreAt && t < scoreAt + 0.5 && Math.floor((t - scoreAt) * 12) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 236, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${(1 - slide) * -120}px)`, opacity: slide }}>
      <div style={{ ...box(GREEN), display: "flex", alignItems: "center", gap: 26, padding: "14px 26px" }}>
        <div style={{ ...pix, fontSize: 34, color: GREEN, fontWeight: 700 }}>{`LEVEL ${level}`}</div>
        <div style={{ ...pix, fontSize: 40, color: C.ivory }}>{`${home} `}</div>
        <div style={{ fontFamily: FONT.display, fontSize: 80, color: flash ? C.ivory : C.gold, lineHeight: 0.9, minWidth: 150, textAlign: "center" }}>{shown}</div>
        <div style={{ ...pix, fontSize: 40, color: C.ivory }}>{` ${away}`}</div>
      </div>
    </div>
  );
};

/** Denmark's life bar: 10 pixel cells. `v` 0..1. Blinks when low. */
export const LifeBar: React.FC<{ t: number; v: number; top?: number }> = ({ t, v, top = 380 }) => {
  const n = Math.round(clamp(v) * 10);
  const low = n <= 3 && Math.floor(t * 6) % 2 === 0;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
      <div style={{ ...pix, fontSize: 30, color: C.ivory }}>DENMARK</div>
      <div style={{ display: "flex", gap: 6, padding: 6, background: rgba(C.ink, 0.85), border: `4px solid ${C.ivoryDim}` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ width: 34, height: 30, background: i < n ? (n <= 3 ? (low ? C.ivory : RED) : GREEN) : rgba(C.ivory, 0.12) }} />
        ))}
      </div>
    </div>
  );
};

/** Final scoreboard, top right, game style. */
export const Scoreboard: React.FC<{ den: number; ger: number; flashAt?: number; t: number; top?: number }> = ({ den, ger, flashAt = -9, t, top = 236 }) => {
  const f = t >= flashAt && t < flashAt + 0.6 && Math.floor((t - flashAt) * 10) % 2 === 0;
  return (
    <div style={{ position: "absolute", top, right: 48, ...box(f ? C.gold : RED), padding: "10px 18px", display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ ...pix, fontSize: 32, color: C.ivory }}>DEN</div>
      <div style={{ fontFamily: FONT.display, fontSize: 70, color: f ? C.ivory : C.gold, lineHeight: 0.9 }}>{`${den}–${ger}`}</div>
      <div style={{ ...pix, fontSize: 32, color: C.ivory }}>GER</div>
    </div>
  );
};

// ---------------------------------------------------------------- pixel wipe between scenes
const COLS = 9;
const ROWS = 16;
const CELL = 120;
export const Wipe: React.FC<{ t: number }> = ({ t }) => {
  const w = WIPES.find((x) => t > x.at - 0.24 && t < x.at + 0.24);
  if (!w) return null;
  const thr = (c: number, r: number) => {
    const base = w.dir === "down" ? r / ROWS : w.dir === "up" ? 1 - r / ROWS : w.dir === "right" ? c / COLS : 1 - c / COLS;
    return clamp(base * 0.82 + hash(c * 31 + r * 7) * 0.18);
  };
  const cover = t < w.at;
  const p = cover ? (t - (w.at - 0.24)) / 0.24 : (t - w.at) / 0.24;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const th = thr(c, r);
      const on = cover ? p >= th : p < th;
      if (on) cells.push(<div key={r * COLS + c} style={{ position: "absolute", left: c * CELL, top: r * CELL, width: CELL, height: CELL, background: C.ink }} />);
    }
  return <div style={{ position: "absolute", inset: 0 }}>{cells}</div>;
};

// ---------------------------------------------------------------- karaoke captions (pattern from EP11)
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const splitSentence = (ws: Word[]): Word[][] => {
    if (ws.length <= 6) return [ws];
    const k = Math.ceil(ws.length / 6);
    const parts: Word[][] = [];
    let i = 0;
    for (let j = 1; j < k; j++) {
      const ideal = Math.round((ws.length * j) / k);
      let cut = ideal;
      for (const d of [0, -1, 1, -2, 2]) {
        const c = ideal + d;
        if (c - i >= 2 && ws.length - c >= 2 && c - i <= 6 && /,$/.test(ws[c - 1].w)) {
          cut = c;
          break;
        }
      }
      parts.push(ws.slice(i, cut));
      i = cut;
    }
    parts.push(ws.slice(i));
    return parts;
  };
  CLIPS.forEach((c, ci) => {
    const sentences: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w) => {
      cur.push(w);
      if (/[.?!]$/.test(w.w)) {
        sentences.push(cur);
        cur = [];
      }
    });
    if (cur.length) sentences.push(cur);
    const merged: Word[][] = [];
    sentences.forEach((sn) => {
      if (sn.length === 1 && merged.length) merged[merged.length - 1] = merged[merged.length - 1].concat(sn);
      else merged.push(sn);
    });
    const parts = merged.flatMap(splitSentence);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  const totalChars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
  if (n > 4 || (n === 4 && totalChars > 26)) {
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (totalChars - a));
      if (diff < best) {
        best = diff;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: rgba(C.ink, 0.93),
          padding: "14px 26px 16px",
          border: `5px solid ${rgba(C.ivory, 0.16)}`,
          borderLeft: `10px solid ${RED}`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 14}px)`,
          textAlign: "center",
          maxWidth: 980,
          boxShadow: `0 8px 0 ${rgba(C.ink, 0.6)}`,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.22 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const active = t >= wd.s && t < (ch.words[idx + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    margin: "0 11px",
                    fontFamily: FONT.sans,
                    fontSize: 54,
                    fontWeight: 700,
                    color: active ? C.gold : done ? C.ivory : rgba(C.ivory, 0.62),
                    transform: `scale(${bump})`,
                  }}
                >
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
