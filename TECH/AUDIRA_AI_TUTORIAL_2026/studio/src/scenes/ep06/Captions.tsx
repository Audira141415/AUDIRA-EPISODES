// EP06 karaoke captions from timeline.json in RETROWAVE: a dark CRT strip with a magenta edge, pixel font,
// the active word lights cyan with a small bounce. Phrases <= 6 words; <= 4 words one line, longer
// phrases split into two balanced lines (3/3, 3/2); never a single word left alone.
import React from "react";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette.ts";
import TL from "./timeline.json";
import { PIX, ramp, sm } from "./ui.tsx";

type W = { w: string; s: number; e: number };
type Phrase = { words: W[]; s: number; e: number; lines: W[][] };

const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of TL.clips as { words: W[] }[]) {
    const ws = c.words;
    const groups = Math.ceil(ws.length / 6);
    const base = Math.floor(ws.length / groups), extra = ws.length % groups;
    let i = 0;
    for (let g = 0; g < groups; g++) {
      const n = base + (g < extra ? 1 : 0);
      const words = ws.slice(i, i + n);
      i += n;
      const lines = words.length <= 4 ? [words] : [words.slice(0, Math.ceil(words.length / 2)), words.slice(Math.ceil(words.length / 2))];
      out.push({ words, s: words[0].s, e: words[words.length - 1].e, lines });
    }
  }
  out.forEach((p, j) => {
    const next = out[j + 1];
    p.e = next ? Math.min(next.s, p.e + 0.6) : p.e + 0.6;
  });
  return out;
})();

export const Captions: React.FC<{ t: number; k: number; hideAfter: number }> = ({ t, k, hideAfter }) => {
  if (t >= hideAfter) return null;
  const ph = PHRASES.find((p) => t >= p.s - 0.08 && t < p.e);
  if (!ph) return null;
  const inK = sm(ramp(t, ph.s - 0.08, ph.s + 0.12));
  const H = ph.lines.length === 1 ? 100 : 176;
  const bottom = 1532; // above the 380 px platform UI band
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 12 * k}px)` }}>
      <div style={{ background: "rgba(12,8,26,0.86)", padding: `${10 * k}px ${34 * k}px`, borderRadius: 14 * k, border: `${2 * k}px solid rgba(0,246,255,0.45)`, borderLeft: `${8 * k}px solid ${P.neonMagenta}`, boxShadow: `0 0 ${22 * k}px rgba(255,0,127,0.4)`, maxWidth: 990 * k }}>
        {ph.lines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: 24 * k, lineHeight: 1.1 }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
              const long = line.reduce((n, x) => n + x.w.length, 0) > 28;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: PIX,
                    fontSize: (long ? 62 : 70) * k,
                    color: active ? P.synthCyan : done ? "#F4F1FF" : "rgba(244,241,255,0.5)",
                    textShadow: active ? `0 0 ${16 * k}px ${P.synthCyan}` : "none",
                    display: "inline-block",
                    transform: `translateY(${-b * 6 * k}px) scale(${1 + b * 0.04})`,
                    transformOrigin: "50% 100%",
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
