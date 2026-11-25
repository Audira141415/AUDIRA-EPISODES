// EP09 HUD: one fact chip at a time (opaque plate, top area, below the signature row) and karaoke
// captions on an opaque plate above the bottom 380 px. Authored at 1080x1920, scaled by height/1920.
// Chip text comes only from the script / SOURCE_REGISTER.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../../core/type/fonts.ts";
import { AMBER, CREAM, PLATE } from "./Overlay.tsx";
import { TIMELINE, W, OUTRO_AT, ramp, type Word } from "./time.ts";

type Chip = { text: string; from: number; to: number };
const CHIPS: Chip[] = [
  { text: "YAMAN · ABAD KE-15", from: W("yaman"), to: W("tanamannya") - 0.2 },
  { text: "ETIOPIA → YAMAN", from: W("etiopia"), to: W("kisah") - 0.2 },
  { text: "KALDI: HANYA LEGENDA", from: W("kaldi"), to: W("kemudian") + 0.3 },
  { text: "AL-JAZIRI · MUFTI ADEN · ±1454", from: W("al-jaziri"), to: W("versi") - 0.2 },
  { text: "VERSI LAIN: AL-SHADHILI, MOKHA", from: W("versi"), to: W("gunanya") - 0.1 },
  { text: "MENGUSIR KANTUK", from: W("mengusir"), to: W("malam") - 0.1 },
  { text: "ZIKIR MALAM", from: W("malam"), to: W("dari", 4) - 0.2 },
  { text: "MAKKAH → KAIRO → ISTANBUL", from: W("menyebar"), to: W("tahun", 4) - 0.1 },
  { text: "MAKKAH · 1511", from: W("tahun", 4), to: W("khair") - 0.1 },
  { text: "KHAIR BEG · PENGAWAS PASAR", from: W("khair"), to: W("yang", 2) - 0.1 },
  { text: "MUSIK · PERMAINAN TARUHAN", from: W("musik"), to: W("kopi", 5) - 0.1 },
  { text: "KOPI DILARANG", from: W("kopi", 5), to: W("tapi", 2) - 0.1 },
  { text: "SULTAN DI KAIRO: DIBATALKAN", from: W("tapi", 2), to: W("namanya") - 0.2 },
  { text: "1696 · GAGAL KARENA BANJIR", from: W("1696"), to: W("kiriman") - 0.1 },
  { text: "1699 · TUMBUH", from: W("1699"), to: W("dan", 5) - 0.25 },
  { text: "1711 · JAWA → EROPA", from: W("1711"), to: W("jadi", 2) - 0.2 },
];

const FactChip: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const c = CHIPS.find((k) => t >= k.from - 0.05 && t < k.to);
  if (!c) return null;
  const a = Math.min(ramp(t, c.from - 0.05, c.from + 0.25), 1 - ramp(t, c.to - 0.25, c.to));
  return (
    <div style={{ position: "absolute", top: 300 * s, left: 60 * s, right: 60 * s, display: "flex", justifyContent: "center", opacity: a }}>
      <div
        style={{
          background: PLATE,
          borderLeft: `${8 * s}px solid ${AMBER}`,
          padding: `${12 * s}px ${26 * s}px`,
          boxShadow: `0 ${8 * s}px ${26 * s}px rgba(0,0,0,0.55)`,
          fontFamily: "QhAnton, Impact, sans-serif",
          fontSize: 50 * s,
          letterSpacing: 2 * s,
          color: CREAM,
          maxWidth: 960 * s,
          textAlign: "center",
          transform: `translateY(${(1 - a) * -10 * s}px)`,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

// ---------- captions: chunk each line at punctuation, max 6 words, no 1-word orphans ----------
type Chunk = { words: Word[]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const lines = TIMELINE.lines;
  lines.forEach((line, li) => {
    const groups: Word[][] = [];
    let cur: Word[] = [];
    line.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.?!:;]$/.test(w.w);
      const last = i === line.words.length - 1;
      if (last || (punct && cur.length >= 2) || cur.length >= 6) {
        groups.push(cur);
        cur = [];
      }
    });
    // merge orphans
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1 && groups.length > 1) {
        if (i > 0 && groups[i - 1].length < 7) {
          groups[i - 1].push(...groups[i]);
          groups.splice(i, 1);
          i--;
        } else if (i + 1 < groups.length) {
          groups[i + 1].unshift(...groups[i]);
          groups.splice(i, 1);
          i--;
        }
      }
    }
    const nextLineStart = li + 1 < lines.length ? lines[li + 1].start : line.end + 0.6;
    groups.forEach((g, gi) => {
      const from = gi === 0 ? line.start - 0.05 : g[0].s - 0.05;
      const to = gi + 1 < groups.length ? groups[gi + 1][0].s - 0.05 : Math.min(nextLineStart - 0.05, line.end + 0.5);
      out.push({ words: g, from, to });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  // the hook (0-4.4 s) is carried by the cover title card; captions start with the context
  if (t < 4.45 || t >= OUTRO_AT - 0.2) return null;
  const c = CHUNKS.find((k) => t >= k.from && t < k.to);
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, bottom: 410 * s, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(20,10,5,0.94)",
          borderRadius: 18 * s,
          padding: `${16 * s}px ${30 * s}px`,
          maxWidth: 960 * s,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 0.42 * 54 * s,
          rowGap: 6 * s,
          boxShadow: `0 ${8 * s}px ${30 * s}px rgba(0,0,0,0.5)`,
        }}
      >
        {c.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < w.e + 0.05;
          const done = t >= w.e + 0.05;
          const pop = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.12) * Math.PI * 0.5) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: `${FONT}, sans-serif`,
                fontWeight: 600,
                fontSize: 54 * s,
                lineHeight: 1.25,
                color: active ? AMBER : done ? CREAM : "rgba(255,241,220,0.72)",
                transform: `scale(${pop})`,
                display: "inline-block",
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

export const QahwaHud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const s = height / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <FactChip t={t} s={s} />
      <Captions t={t} s={s} />
    </div>
  );
};
