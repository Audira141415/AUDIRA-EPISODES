// 2D layers for the Kiswah film: captions (calm 16:9 band, karaoke in 9:16), chapter title cards,
// the end-screen frames and the AUDIRA outro. Layout is in layout pixels (useFormat) scaled to the
// render size, inside each format's safe area.
import React from "react";
import { Img, staticFile } from "remotion";
import { useFormat } from "../../core/film/format.ts";
import { PAL } from "./kit.tsx";
import { CHAPTERS, clamp, ease, type Word } from "./tl.ts";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', monospace";

// ---------- captions ----------
type Page = { words: Word[]; s: number; e: number };
export const paginate = (words: Word[], max: number): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
    cur = [];
  };
  words.forEach((w) => {
    cur.push(w);
    const end = /[.?!]$/.test(w.w);
    const soft = /[,;:]$/.test(w.w);
    if (cur.length >= max || (end && cur.length >= 3) || (soft && cur.length >= max - 2)) flush();
  });
  flush();
  return pages;
};

export const Captions: React.FC<{ t: number; pages: Page[]; mode: "wide" | "short" }> = ({ t, pages, mode }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  let idx = -1;
  for (let i = 0; i < pages.length; i++) if (t >= pages[i].s - 0.12) idx = i;
  if (idx < 0) return null;
  const p = pages[idx];
  const next = pages[idx + 1];
  if (t > p.e + 0.6 && (!next || t < next.s - 0.12)) return null;
  const fade = ease(t, p.s - 0.12, 0.15);
  if (mode === "wide") {
    return (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 136 * s, display: "flex", justifyContent: "center", opacity: fade }}>
        <div style={{ maxWidth: 1360 * s, padding: `${10 * s}px ${26 * s}px`, background: "rgba(10,7,8,0.62)", borderRadius: 8 * s, textAlign: "center", fontFamily: SERIF, fontSize: 40 * s, lineHeight: 1.3, color: PAL.cream }}>
          {p.words.map((w, i) => {
            const on = t >= w.s && t < (p.words[i + 1]?.s ?? w.e + 0.3);
            return (
              <span key={i} style={{ color: on ? PAL.gold : t > w.e ? PAL.cream : "rgba(246,234,214,0.72)" }}>
                {w.w}
                {i < p.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 70 * s, right: 70 * s, bottom: 410 * s, display: "flex", justifyContent: "center", opacity: fade }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 0.42 * 62 * s, rowGap: 6 * s, fontFamily: SERIF, fontWeight: 700, fontSize: 62 * s, lineHeight: 1.15 }}>
        {p.words.map((w, i) => {
          const on = t >= w.s && t < (p.words[i + 1]?.s ?? w.e + 0.3);
          const k = on ? clamp((t - w.s) / 0.12) : 0;
          const bounce = on ? 1 + 0.04 * Math.sin(Math.PI * k) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `scale(${bounce})`,
                color: on ? PAL.gold : "#FFF6E6",
                textShadow: `0 ${3 * s}px ${14 * s}px rgba(0,0,0,0.9), 0 0 ${3 * s}px rgba(0,0,0,0.9)`,
                WebkitTextStroke: `${1.5 * s}px rgba(10,7,8,0.85)`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- chapter title cards ----------
const CARD: Record<string, { n: string; title: string; year: string }> = {
  c01_intro: { n: "SEJARAH MAKKAH · EP04", title: "Kiswah, Kain Penutup Ka'bah", year: "lebih dari 1.500 tahun" },
  c02_tubba: { n: "BAB 1", title: "Raja dari Yaman dan Kain Pertama", year: "± abad ke-5 M" },
  c03_jahiliah: { n: "BAB 2", title: "Kiswah Bertumpuk, sampai Fathu Makkah", year: "pra-Islam – 8 H / 630 M" },
  c04_warna: { n: "BAB 3", title: "Putih, Merah, Hijau, Hitam", year: "masa khalifah – abad ke-13 M" },
  c05_mesir: { n: "BAB 4", title: "Mesir, Mahmal, dan Desa Wakaf", year: "± 750 H – 1817 M" },
  c06_1927: { n: "BAB 5", title: "Ketika Makkah Menenun Sendiri", year: "1926 – 1962" },
  c07_pabrik: { n: "BAB 6", title: "Umm Al-Joud: Anatomi Kiswah", year: "1977 – kini" },
  c08_ganti: { n: "BAB 7", title: "Ritual Penggantian & Kain Lama", year: "2022 – kini" },
};

export const ChapterCard: React.FC<{ t: number }> = ({ t }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const ch = CHAPTERS.find((c) => CARD[c.id] && t >= c.start - 0.2 && t < c.start + 3.6);
  if (!ch) return null;
  const c = CARD[ch.id];
  const a = ease(t, ch.start - 0.2, 0.5) * (1 - ease(t, ch.start + 3.0, 0.5));
  const slide = (1 - ease(t, ch.start - 0.2, 0.6)) * 30;
  const left = fmt.safe.left * s;
  const top = (fmt.isWide ? fmt.safe.top + 20 : 200) * s;
  return (
    <div style={{ position: "absolute", left, top, opacity: a, transform: `translateX(${-slide * s}px)` }}>
      <div style={{ display: "inline-block", padding: `${18 * s}px ${30 * s}px ${20 * s}px`, background: "rgba(10,7,8,0.74)", borderLeft: `${5 * s}px solid ${PAL.gold}`, outline: `${2 * s}px dashed rgba(227,169,62,0.55)`, outlineOffset: `${-10 * s}px` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 * s, letterSpacing: 5 * s, color: PAL.gold }}>{c.n}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: (fmt.isWide ? 58 : 54) * s, lineHeight: 1.05, color: PAL.cream, marginTop: 8 * s, maxWidth: (fmt.isWide ? 1100 : 900) * s }}>{c.title}</div>
        <div style={{ fontFamily: MONO, fontSize: 22 * s, letterSpacing: 2 * s, color: "rgba(246,234,214,0.85)", marginTop: 10 * s }}>{c.year}</div>
      </div>
    </div>
  );
};

// ---------- end screen frames (YouTube elements go inside them) ----------
export const EndFrames: React.FC<{ t: number; from: number; to: number }> = ({ t, from, to }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (t < from - 0.5 || t > to) return null;
  const a = ease(t, from, 1.0) * (1 - ease(t, to - 3.6, 0.5));
  const L = fmt.layout;
  const w = L.width * 0.3;
  const h = w * 0.5625;
  const top = (L.height - h) / 2 - 40;
  const box = (x: number, label: string) => (
    <div style={{ position: "absolute", left: x * s, top: top * s, width: w * s, height: h * s, border: `${2 * s}px dashed rgba(227,169,62,0.55)`, background: "rgba(10,7,8,0.35)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 18 * s, letterSpacing: 3 * s, color: "rgba(246,234,214,0.55)", marginBottom: -34 * s }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,5,6,0.35)" }} />
      {box(L.width * 0.1, "VIDEO BERIKUTNYA")}
      {box(L.width * 0.6, "SUBSCRIBE · AUDIRA")}
      <div style={{ position: "absolute", left: 0, right: 0, top: (top - 90) * s, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 46 * s, color: PAL.cream }}>Sejarah Makkah, bersama Audira</div>
    </div>
  );
};

// ---------- outro card ----------
export const Outro: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (t < from) return null;
  const a = ease(t, from, 0.5);
  const logoH = (fmt.isWide ? 300 : 360) * s;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B3D2E", opacity: a, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ height: logoH, transform: `scale(${0.96 + 0.04 * ease(t, from, 2.5)})` }} />
      <div style={{ marginTop: 34 * s, fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 30 * s, letterSpacing: 2 * s, color: "#E8F3EE" }}>Created by Agus Dwi R.</div>
    </div>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) ${strength > 0.6 ? 38 : 55}%, rgba(8,5,6,${strength}) 100%)` }} />
);
