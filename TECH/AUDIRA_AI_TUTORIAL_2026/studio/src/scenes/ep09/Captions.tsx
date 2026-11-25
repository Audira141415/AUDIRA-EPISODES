// EP09 karaoke captions (LIDARFORGE): dark survey-glass strip with cyan brackets, mono-heavy words;
// the active word glows laser cyan with a small bounce. <=4 words one line, 5-6 words two balanced lines.
import React from "react";
import TL from "./timeline.json";
import { AMBER, Brackets, CYAN, GROT, ramp, sm } from "./ui.tsx";

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
  const H = ph.lines.length === 1 ? 100 : 172;
  const bottom = 1530;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 12 * k}px)` }}>
      <div style={{ position: "relative", background: "rgba(4,10,14,0.88)", padding: `${12 * k}px ${30 * k}px`, maxWidth: 990 * k, border: `${2 * k}px solid rgba(0,240,255,0.3)`, boxShadow: `0 0 ${26 * k}px rgba(0,240,255,0.18), 0 ${8 * k}px ${22 * k}px rgba(0,0,0,0.5)` }}>
        <Brackets k={k} len={22} w={3} />
        {ph.lines.map((line, li) => {
          const chars = line.reduce((n, x) => n + x.w.length, 0);
          const fs = (chars > 24 ? 46 : 54) * k;
          return (
            <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: fs * 0.42, lineHeight: 1.18 }}>
              {line.map((w, wi) => {
                const active = t >= w.s && t < w.e + 0.05;
                const done = t >= w.e + 0.05;
                const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
                return (
                  <span
                    key={wi}
                    style={{
                      fontFamily: GROT,
                      fontWeight: 700,
                      fontSize: fs,
                      color: active ? CYAN : done ? "#f1f5f9" : "rgba(241,245,249,0.5)",
                      display: "inline-block",
                      transform: `translateY(${-b * 6 * k}px) scale(${1 + b * 0.04})`,
                      transformOrigin: "50% 100%",
                      textShadow: active ? `0 0 ${16 * k}px ${CYAN}` : undefined,
                      borderBottom: active ? `${4 * k}px solid ${AMBER}` : `${4 * k}px solid transparent`,
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
