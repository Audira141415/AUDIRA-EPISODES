// EP10 karaoke captions from timeline.json in noir dress: a black title-card strip with thin amber
// rules, cream serif words; the active word turns tungsten amber with a small bounce.
// Phrases <= 6 words: <= 4 words one line, longer split into two balanced lines; never one word alone.
import React from "react";
import TL from "./timeline.json";
import { AMBER, CREAM, SERIF, ramp, sm } from "./ui.tsx";

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
  const inK = sm(ramp(t, ph.s - 0.08, ph.s + 0.12));
  const H = ph.lines.length === 1 ? 104 : 176;
  const bottom = 1530;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 12 * k}px)` }}>
      <div style={{ background: "rgba(5,6,8,0.9)", padding: `${12 * k}px ${34 * k}px`, borderTop: `${2 * k}px solid ${AMBER}`, borderBottom: `${2 * k}px solid ${AMBER}`, boxShadow: `0 ${10 * k}px ${26 * k}px rgba(0,0,0,0.7)`, maxWidth: 1000 * k }}>
        {ph.lines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: 16 * k, lineHeight: 1.14 }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
              const long = line.reduce((n, x) => n + x.w.length, 0) > 26;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: (long ? 48 : 56) * k,
                    color: active ? AMBER : done ? CREAM : "rgba(242,235,221,0.6)",
                    display: "inline-block",
                    transform: `translateY(${-b * 8 * k}px) scale(${1 + b * 0.08})`,
                    textShadow: active ? `0 0 ${16 * k}px rgba(255,227,160,0.55)` : undefined,
                    borderBottom: `${3 * k}px solid ${active ? AMBER : "transparent"}`,
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
