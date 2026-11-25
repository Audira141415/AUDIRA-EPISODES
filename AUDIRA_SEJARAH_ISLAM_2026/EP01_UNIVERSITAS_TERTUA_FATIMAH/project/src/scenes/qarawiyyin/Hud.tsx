// EP01 2D layer: hook title (cover), sourced chips on solid cobalt cards (style memory: text over
// tile patterns needs a solid backing card), karaoke captions and the AUDIRA outro card.
// Safe zones: top 180 px, bottom 380 px of 1080 x 1920; captions sit above the bottom 380 px.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { P } from "./picture.ts";
import { COBALT, OCHRE, QarawiyyinCoverText } from "./Overlay.tsx";
import { TL, W, win, ramp, OUTRO_AT, type Word } from "./tl.ts";

const Chip: React.FC<{ k: number; top: number; left?: number; children: React.ReactNode; accent?: string }> = ({ k, top, left = 60, children, accent = P.terracotta }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  if (k <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: top * s,
        left: left * s,
        opacity: k,
        transform: `translateY(${(1 - k) * 24 * s}px) scale(${0.96 + 0.04 * k})`,
        transformOrigin: "left center",
        background: COBALT,
        borderLeft: `${8 * s}px solid ${accent}`,
        boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.55)`,
        padding: `${12 * s}px ${26 * s}px`,
        maxWidth: 940 * s,
      }}
    >
      {children}
    </div>
  );
};
const big = (s: number, size = 64, color = "#FBF1DF"): React.CSSProperties => ({ fontFamily: "QAnton, Impact, sans-serif", fontSize: size * s, lineHeight: 1.05, color, letterSpacing: 1 * s });
const small = (s: number, size = 32, color = OCHRE): React.CSSProperties => ({ fontFamily: "QSerif, Georgia, serif", fontSize: size * s, lineHeight: 1.15, color });

export const QarawiyyinHud: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const title = 1 - ramp(t, W("penjaga") + 0.5, W("penjaga") + 1.1);
  const guinness = win(t, W("menurut", 0) - 0.1, W("tapi") - 0.2);
  const source = win(t, W("menurut", 1) - 0.1, W("perempuan") + 0.6);
  const konon = win(t, W("konon") - 0.1, W("selesai") + 0.4);
  const noYear = win(t, W("tak", 0) - 0.1, W("namanya") - 0.3);
  const noExam = win(t, W("tak", 1) - 0.1, W("namanya") - 0.3);
  const keysOn = win(t, W("empat", 2) - 0.4, W("dalamnya") - 0.2);
  const ins = [W("empat", 2), W("dipegang"), W("empat", 3), W("orang")];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {title > 0.001 ? <QarawiyyinCoverText opacity={title} /> : null}
      <Chip k={guinness} top={292}>
        <div style={big(s, 58)}>LEMBAGA PENDIDIKAN TERTUA</div>
        <div style={big(s, 58, OCHRE)}>YANG MASIH BEROPERASI</div>
        <div style={{ ...small(s, 30, "#FBF1DF"), marginTop: 6 * s }}>menurut Guinness World Records</div>
      </Chip>
      <Chip k={source} top={292} accent={OCHRE}>
        <div style={small(s, 30)}>menurut catatan sejarawan Fez</div>
        <div style={big(s, 54)}>IBNU ABI ZAR'</div>
      </Chip>
      <Chip k={konon} top={292} accent={OCHRE}>
        <div style={big(s, 46, OCHRE)}>KONON</div>
        <div style={small(s, 30, "#FBF1DF")}>bahan dan air dari tanah itu sendiri</div>
      </Chip>
      <Chip k={noYear} top={292}>
        <div style={big(s, 54)}>
          <span style={{ color: OCHRE }}>TAK ADA</span> TAHUN AJARAN
        </div>
      </Chip>
      <Chip k={noExam} top={390}>
        <div style={big(s, 54)}>
          <span style={{ color: OCHRE }}>TAK ADA</span> UJIAN RESMI
        </div>
      </Chip>
      <Chip k={keysOn} top={292}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
          <div style={big(s, 50)}>EMPAT KUNCI · EMPAT ORANG</div>
          {ins.map((a, i) => {
            const on = ramp(t, a, a + 0.3);
            return (
              <div
                key={i}
                style={{
                  width: 34 * s,
                  height: 34 * s,
                  borderRadius: 17 * s,
                  border: `${4 * s}px solid ${OCHRE}`,
                  background: on > 0.5 ? OCHRE : "transparent",
                  transform: `scale(${1 + Math.sin(Math.PI * on) * 0.18})`,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </Chip>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- karaoke captions
type Page = { words: Word[]; s: number; e: number };
// Chunking: punctuation first, then balanced splits that never end on a function word and never
// leave a one-word chunk (jury note: no orphans, no phrase split across chunks).
const STOP = new Set(["di", "ke", "dari", "dan", "yang", "untuk", "apa", "paling", "atas", "ini", "itu", "sebuah", "seorang", "tak", "masih", "kita", "harus", "sampai", "pun", "pernah", "menjadi", "ia", "kata", "tempat", "dipakai", "orang", "resmi"]);
const clean = (w: string) => w.toLowerCase().replace(/[.,:;?!]/g, "");
const chars = (ws: Word[]) => ws.reduce((a, x) => a + x.w.length + 1, 0);
const splitSeg = (seg: Word[]): Word[][] => {
  if (seg.length <= 6 && chars(seg) <= 34) return [seg];
  const n = Math.ceil(chars(seg) / 30);
  const target = chars(seg) / n;
  const out: Word[][] = [];
  let cur: Word[] = [];
  seg.forEach((w, i) => {
    cur.push(w);
    const rest = seg.length - i - 1;
    if (out.length < n - 1 && chars(cur) >= target * 0.85 && rest >= 2 && cur.length >= 2 && !STOP.has(clean(w.w))) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};
const buildPages = (): Page[] => {
  const pages: Page[] = [];
  for (const line of TL.lines) {
    const segs: Word[][] = [];
    let cur: Word[] = [];
    line.words.forEach((w) => {
      cur.push(w);
      if (/[.,?!]$/.test(w.w)) {
        segs.push(cur);
        cur = [];
      }
    });
    if (cur.length) segs.push(cur);
    let chunks: Word[][] = segs.flatMap(splitSeg);
    // merge one-word chunks into a neighbour of the same line
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].length === 1 && chunks.length > 1) {
          const j = i + 1 < chunks.length && (i === 0 || chars(chunks[i + 1]) <= chars(chunks[i - 1])) ? i + 1 : i - 1;
          const a = Math.min(i, j);
          chunks = [...chunks.slice(0, a), [...chunks[a], ...chunks[a + 1]], ...chunks.slice(a + 2)];
          merged = true;
          break;
        }
      }
    }
    for (const c of chunks) pages.push({ words: c, s: c[0].s, e: c[c.length - 1].e });
  }
  return pages;
};
export const CAPTION_PAGES = () => PAGES.map((p) => p.words.map((w) => w.w).join(" "));
const PAGES = buildPages();

export const QarawiyyinCaptions: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  let idx = -1;
  for (let i = 0; i < PAGES.length; i++) if (PAGES[i].s - 0.12 <= t) idx = i;
  if (idx < 0 || t > TL.voEnd + 0.3) return null;
  const p = PAGES[idx];
  const next = PAGES[idx + 1];
  const end = Math.min(p.e + 0.6, next ? next.s - 0.12 : p.e + 0.6);
  if (t > end) return null;
  const k = interpolate(t, [p.s - 0.12, p.s + 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 410 * s, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 940 * s,
          textAlign: "center",
          padding: `${14 * s}px ${30 * s}px ${10 * s}px`,
          background: "rgba(19,48,111,0.9)",
          borderTop: `${4 * s}px solid ${OCHRE}`,
          boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`,
          opacity: k,
          transform: `translateY(${(1 - k) * 14 * s}px)`,
          fontFamily: "QAnton, Impact, sans-serif",
          fontSize: 66 * s,
          lineHeight: 1.18,
          letterSpacing: 1 * s,
          textWrap: "balance",
        }}
      >
        {p.words.map((w, i) => {
          const active = t >= w.s - 0.04 && t < w.e + 0.04;
          const said = t >= w.e;
          const pop = active ? 1 + 0.04 * Math.sin(Math.PI * Math.min(1, (t - w.s + 0.04) / 0.22)) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: i < p.words.length - 1 ? "0.42em" : 0,
                color: active ? "#F2C46A" : said ? "#FBF1DF" : "rgba(251,241,223,0.6)",
                transform: `scale(${pop})`,
                transformOrigin: "center bottom",
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

// ---------------------------------------------------------------- outro card
export const QarawiyyinOutro: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const k = ramp(t, OUTRO_AT, OUTRO_AT + 0.6);
  if (k <= 0.001) return null;
  // the brand card is 1080 x 400: centred on AUDIRA green with the creator line under it
  return (
    <AbsoluteFill style={{ opacity: k, background: "#0B3D2E", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 900 * s, height: "auto", transform: `scale(${0.96 + 0.04 * k})` }} />
      <div style={{ marginTop: 10 * s, fontFamily: "QSerif, Georgia, serif", fontSize: 44 * s, color: "#F2C46A", letterSpacing: 2 * s }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};
