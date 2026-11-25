// EP03 Zamzam 2D layers: captions (calm 16:9 band / karaoke 9:16), chapter title cards, projected
// tags and fixed callouts, the end screen with two empty end-screen frames, and the AUDIRA outro.
// Everything is laid out in layout pixels (useFormat) and scaled to the render size.

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../../core/type/fonts.ts";
import { useFormat } from "../../core/film/format.ts";
import { prog, smooth, easeOut, type Word } from "./time.ts";
import { PAL } from "./layout.ts";

export const INK = PAL.ink;
export const CYAN = "#1a8fbd";

/** Wraps children in a layer laid out at layout size and scaled to the render size. */
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

/** Group words into display chunks: break after punctuation or when too long. */
export function chunks(words: Word[], maxWords: number, maxChars: number): Word[][] {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    cur.push(w);
    len += w.w.length + 1;
    const punct = /[.,;:?!]$/.test(w.w);
    if (cur.length >= maxWords || len >= maxChars || (punct && cur.length >= 3)) {
      out.push(cur);
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

/** 16:9 captions: bottom-centre band above the bottom 120 px, two lines max, calm highlight. */
export const WideCaptions: React.FC<{ t: number; words: Word[] }> = ({ t, words }) => {
  const groups = React.useMemo(() => chunks(words, 12, 66), [words]);
  const g = groups.find((c) => t >= c[0].s - 0.15 && t <= c[c.length - 1].e + 0.35);
  if (!g) return null;
  const fade = Math.min(prog(t, g[0].s - 0.15, g[0].s + 0.1), 1 - prog(t, g[g.length - 1].e + 0.15, g[g.length - 1].e + 0.35));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 120 + 26, display: "flex", justifyContent: "center", opacity: fade }}>
      <div style={{ maxWidth: 1300, textAlign: "center", padding: "10px 26px 12px", borderRadius: 14, background: "rgba(14,22,24,0.62)", fontFamily: FONT, fontWeight: 600, fontSize: 40, lineHeight: 1.28, color: "#f4f1ea", letterSpacing: 0.2 }}>
        {g.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.05;
          const spoken = t >= w.s;
          return (
            <span key={i} style={{ color: active ? "#8fe4ff" : spoken ? "#f4f1ea" : "rgba(244,241,234,0.62)" }}>
              {w.w}
              {i < g.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 9:16 karaoke captions above the bottom 380 px: active word highlighted, bounce <= 1.04, gap >= 0.4 em. */
export const ShortCaptions: React.FC<{ t: number; words: Word[] }> = ({ t, words }) => {
  const groups = React.useMemo(() => chunks(words, 4, 26), [words]);
  const g = groups.find((c) => t >= c[0].s - 0.1 && t <= c[c.length - 1].e + 0.25);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 380 + 40, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: "0.42em", rowGap: 6, fontFamily: FONT, fontWeight: 600, fontSize: 70, lineHeight: 1.12, textAlign: "center" }}>
      {g.map((w, i) => {
        const active = t >= w.s && t < w.e + 0.05;
        const k = active ? Math.sin(Math.min(1, (t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 0;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active ? "#ffd84a" : "#ffffff",
              transform: `scale(${1 + 0.04 * k})`,
              textShadow: "0 3px 10px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)",
              WebkitTextStroke: "2.4px rgba(0,0,0,0.8)",
              paintOrder: "stroke fill",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Chapter title card (about 3 s) inside the safe area, top-left. */
export const TitleCard: React.FC<{ t: number; at: number; num: string; title: string; era: string }> = ({ t, at, num, title, era }) => {
  const fmt = useFormat();
  const a = easeOut(prog(t, at - 0.2, at + 0.6));
  const b = smooth(prog(t, at + 3.0, at + 3.7));
  const vis = a * (1 - b);
  if (vis <= 0.001) return null;
  const wide = fmt.isWide;
  return (
    <div style={{ position: "absolute", left: fmt.safe.left + 4, top: fmt.safe.top + (wide ? 24 : 40), opacity: vis, transform: `translateX(${(1 - a) * -40}px)`, background: "rgba(247,243,236,0.9)", borderRadius: 18, padding: "16px 24px 18px", boxShadow: "0 10px 30px rgba(30,25,15,0.18)" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 600, fontSize: wide ? 24 : 30, letterSpacing: 5, color: INK, background: "rgba(255,255,255,0.86)", padding: "8px 16px", borderRadius: 8 }}>
        <span style={{ width: 10, height: 10, background: PAL.coral, borderRadius: 2 }} />
        {num}
      </div>
      <div style={{ marginTop: 12, maxWidth: wide ? 1100 : 900, fontFamily: FONT, fontWeight: 600, fontSize: wide ? 66 : 76, lineHeight: 1.02, letterSpacing: -1.5, color: INK, textShadow: "0 2px 18px rgba(239,233,223,0.9)" }}>{title}</div>
      <div style={{ marginTop: 12, display: "inline-block", fontFamily: FONT, fontWeight: 600, fontSize: wide ? 28 : 32, letterSpacing: 3, color: "#eaf7fb", background: "rgba(16,26,30,0.78)", padding: "6px 14px", borderRadius: 8 }}>{era}</div>
    </div>
  );
};

/** Two-line technical tag (value + caption) with an accent dot. */
export const Tag: React.FC<{ x: number; y: number; value: string; caption?: string; accent?: string; align?: "left" | "right"; vis?: number; size?: number }> = ({
  x, y, value, caption, accent = INK, align = "left", vis = 1, size = 1,
}) => {
  if (vis <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: align === "left" ? x : undefined,
        right: align === "right" ? x : undefined,
        top: y,
        transform: `translateY(-50%) scale(${0.92 + 0.08 * vis})`,
        transformOrigin: align === "left" ? "0 50%" : "100% 50%",
        opacity: vis,
        display: "flex",
        alignItems: "center",
        gap: 12 * size,
        background: "rgba(255,255,255,0.95)",
        borderRadius: 14 * size,
        padding: `${9 * size}px ${18 * size}px ${9 * size}px ${13 * size}px`,
        boxShadow: "0 6px 18px rgba(30,25,15,0.22)",
        fontFamily: FONT,
        color: INK,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 13 * size, height: 13 * size, borderRadius: 99, background: accent, flex: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.12 }}>
        <span style={{ fontWeight: 600, fontSize: 32 * size, letterSpacing: 0.3 }}>{value}</span>
        {caption ? <span style={{ fontWeight: 500, fontSize: 22 * size, color: "#525b5e", letterSpacing: 0.3 }}>{caption}</span> : null}
      </div>
    </div>
  );
};

/** Leader line from a tag to its 3D anchor point. */
export const Leader: React.FC<{ x1: number; y1: number; x2: number; y2: number; vis: number }> = ({ x1, y1, x2, y2, vis }) => {
  if (vis <= 0.01) return null;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  return (
    <>
      <div style={{ position: "absolute", left: x1, top: y1 - 1.5, width: len * vis, height: 3, background: "rgba(255,255,255,0.92)", transform: `rotate(${ang}rad)`, transformOrigin: "0 50%", boxShadow: "0 0 4px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", left: x2 - 7, top: y2 - 7, width: 14, height: 14, borderRadius: 99, border: "3px solid #fff", boxShadow: "0 0 5px rgba(0,0,0,0.4)", opacity: vis }} />
    </>
  );
};

/** Panel with rows (HUD / data card), anchored to a screen corner. */
export const Panel: React.FC<{ vis: number; x: number; y: number; title: string; rows: { k: string; v: string; bar?: number; warn?: boolean }[]; width?: number; align?: "left" | "right"; note?: string }> = ({
  vis, x, y, title, rows, width = 470, align = "right", note,
}) => {
  if (vis <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? x : undefined, top: y, width, opacity: vis, transform: `translateY(${(1 - vis) * 20}px)`, background: "rgba(16,26,30,0.84)", borderRadius: 18, padding: "18px 22px 16px", fontFamily: FONT, color: "#eef6f8", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
      <div style={{ fontWeight: 600, fontSize: 21, letterSpacing: 4, color: "#8fe4ff", marginBottom: 12 }}>{title}</div>
      {rows.map((r) => (
        <div key={r.k} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 600 }}>
            <span style={{ color: r.warn ? "#ff8a7a" : "#eef6f8" }}>{r.k}</span>
            <span style={{ color: r.warn ? "#ff8a7a" : "#bfe9f5" }}>{r.v}</span>
          </div>
          {r.bar !== undefined ? (
            <div style={{ marginTop: 6, height: 8, borderRadius: 9, background: "rgba(255,255,255,0.14)" }}>
              <div style={{ width: `${Math.max(0, Math.min(1, r.bar)) * 100}%`, height: 8, borderRadius: 9, background: r.warn ? "#ff8a7a" : "#39c6f2" }} />
            </div>
          ) : null}
        </div>
      ))}
      {note ? <div style={{ marginTop: 4, fontSize: 18, color: "rgba(238,246,248,0.7)" }}>{note}</div> : null}
    </div>
  );
};

/** Big counter card. */
export const Counter: React.FC<{ vis: number; x: number; y: number; value: string; label: string; source?: string; align?: "left" | "right" }> = ({ vis, x, y, value, label, source, align = "left" }) => {
  if (vis <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? x : undefined, top: y, opacity: vis, transform: `translateY(${(1 - vis) * 16}px)`, fontFamily: FONT, background: "rgba(255,255,255,0.93)", borderRadius: 18, padding: "16px 24px", boxShadow: "0 8px 24px rgba(30,25,15,0.2)" }}>
      <div style={{ fontWeight: 600, fontSize: 64, letterSpacing: -1, color: CYAN, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 6, fontWeight: 600, fontSize: 26, color: INK }}>{label}</div>
      {source ? <div style={{ marginTop: 4, fontWeight: 500, fontSize: 18, color: "#6a7174" }}>{source}</div> : null}
    </div>
  );
};

/** End screen frames (YouTube elements go here) and the AUDIRA outro card. */
export const EndScreen: React.FC<{ t: number; voEnd: number; total: number }> = ({ t, voEnd, total }) => {
  const fmt = useFormat();
  const inP = smooth(prog(t, voEnd + 0.3, voEnd + 1.5));
  const outro = smooth(prog(t, total - 3.0, total - 2.4));
  if (inP <= 0.001) return null;
  const W = fmt.layout.width, H = fmt.layout.height;
  const fw = W * 0.3, fh = fw * 0.5625;
  return (
    <>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: i === 0 ? W * 0.09 : W * 0.61,
            top: H * 0.5 - fh / 2,
            width: fw,
            height: fh,
            borderRadius: 18,
            border: "3px solid rgba(255,255,255,0.85)",
            background: "rgba(16,26,30,0.18)",
            opacity: inP * (1 - outro),
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: fmt.safe.top + 30, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 34, letterSpacing: 4, color: INK, opacity: inP * (1 - outro), textShadow: "0 1px 12px rgba(239,233,223,0.9)" }}>
        SEJARAH MAKKAH · EPISODE BERIKUTNYA: KISWAH
      </div>
      <Outro vis={outro} />
    </>
  );
};

export const Outro: React.FC<{ vis: number }> = ({ vis }) => {
  const fmt = useFormat();
  if (vis <= 0.001) return null;
  const wide = fmt.isWide;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B3D2E", opacity: vis, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: wide ? 420 : 520, height: "auto" }} />
      <div style={{ marginTop: 28, fontFamily: FONT, fontWeight: 500, fontSize: wide ? 34 : 40, letterSpacing: 2, color: "#e9f1ec" }}>Created by Agus Dwi R.</div>
    </div>
  );
};

/** Short end card before the outro. */
export const ShortEndCard: React.FC<{ vis: number }> = ({ vis }) => {
  if (vis <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 560, opacity: vis, transform: `translateY(${(1 - vis) * 30}px)`, background: "rgba(255,255,255,0.95)", borderRadius: 28, padding: "40px 40px 44px", textAlign: "center", fontFamily: FONT, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
      <div style={{ fontWeight: 600, fontSize: 30, letterSpacing: 5, color: PAL.coral }}>VIDEO PANJANG</div>
      <div style={{ marginTop: 14, fontWeight: 600, fontSize: 66, lineHeight: 1.05, color: INK }}>Tonton video panjangnya di YouTube Audira</div>
      <div style={{ marginTop: 16, fontWeight: 500, fontSize: 30, color: "#5a6366" }}>Sejarah Makkah · EP03 · Rahasia Sumur Zamzam</div>
    </div>
  );
};

/** Short hook headline (0–4 s), under the top safe line. */
export const ShortHook: React.FC<{ t: number; title: string }> = ({ t, title }) => {
  const a = easeOut(prog(t, 0, 0.5));
  const b = smooth(prog(t, 3.8, 4.5));
  if (a * (1 - b) <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 180 + 40, opacity: a * (1 - b), transform: `translateY(${(1 - a) * -24}px)`, fontFamily: FONT }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontWeight: 600, fontSize: 28, letterSpacing: 5, color: INK, background: "rgba(255,255,255,0.86)", padding: "8px 16px", borderRadius: 8 }}>
        <span style={{ width: 10, height: 10, background: PAL.coral, borderRadius: 2 }} />
        SEJARAH MAKKAH · EP03
      </div>
      <div style={{ marginTop: 14, fontWeight: 600, fontSize: 84, lineHeight: 1.0, letterSpacing: -1.5, color: INK, textShadow: "0 2px 18px rgba(239,233,223,0.95)" }}>{title}</div>
    </div>
  );
};
