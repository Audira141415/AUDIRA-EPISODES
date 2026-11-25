// EP07 karaoke captions (ISOCRAFT comic): bold italic condensed, white with ink stroke, the active
// word turns yellow with a small bounce (<= 1.04, gap 0.4 em). Phrases <= 6 words; <= 4 words one
// line, longer phrases two balanced lines; never a single word alone. Bottom edge above the 380 px band.
import React from "react";
import TL from "./timeline.json";
import { BC, INK, P, ramp, sm } from "./ui.tsx";

type W = { w: string; s: number; e: number };
type Phrase = { s: number; e: number; lines: W[][] };

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
      out.push({ s: words[0].s, e: words[words.length - 1].e, lines });
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
  const inK = sm(ramp(t, ph.s - 0.08, ph.s + 0.1));
  const lineH = 76;
  const H = ph.lines.length * lineH + 12;
  const bottom = 1525;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", flexDirection: "column", alignItems: "center", opacity: inK, transform: `translateY(${(1 - inK) * 14 * k}px)` }}>
      <div style={{ background: "rgba(28,30,33,0.58)", borderRadius: 18 * k, padding: `${4 * k}px ${26 * k}px ${8 * k}px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {ph.lines.map((line, li) => {
        const chars = line.reduce((n, x) => n + x.w.length, 0);
        const size = chars > 24 ? 58 : 66;
        return (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: `0 ${0.4 * size * k}px`, height: lineH * k, alignItems: "center" }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: BC,
                    fontWeight: 800,
                    fontStyle: "italic",
                    fontSize: size * k,
                    color: active ? P.accentYellow : "#FFFFFF",
                    WebkitTextStroke: `${8 * k}px ${INK}`,
                    paintOrder: "stroke fill",
                    textShadow: `${4 * k}px ${5 * k}px 0 ${INK}`,
                    display: "inline-block",
                    transform: `translateY(${-b * 7 * k}px) scale(${1 + b * 0.04})`,
                    transformOrigin: "50% 100%",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        );
      })}
      </div>
    </div>
  );
};
