// EP05 karaoke captions from timeline.json: a cream paper strip with pencil frame, handwritten words,
// the active word turns vermilion with a small bounce. Phrases <= 6 words; <= 4 words one line,
// longer phrases split into two balanced lines; never a single word left alone.
import React from "react";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette.ts";
import TL from "./timeline.json";
import { HAND, ramp, sm } from "./ui.tsx";

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
  // hold each phrase until the next one starts (max 0.6 s) so the strip does not flicker
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
  const lines = ph.lines.length;
  const H = lines === 1 ? 104 : 178;
  const bottom = 1530; // strip bottom edge stays above the 380 px platform UI band
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (bottom - H) * k, display: "flex", justifyContent: "center", opacity: inK, transform: `translateY(${(1 - inK) * 12 * k}px)` }}>
      <div style={{ position: "relative", background: "rgba(251,247,239,0.96)", padding: `${14 * k}px ${30 * k}px`, boxShadow: `0 ${8 * k}px ${22 * k}px rgba(0,0,0,0.45)`, maxWidth: 980 * k, transform: "rotate(-0.6deg)", border: `${3 * k}px solid ${P.graphite}`, borderLeft: `${8 * k}px solid ${P.accent}` }}>
        {ph.lines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: 14 * k, lineHeight: 1.12 }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const b = active ? Math.sin(ramp(t, w.s, w.s + 0.22) * Math.PI) : 0;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: (line.reduce((n, x) => n + x.w.length, 0) > 26 ? 46 : 52) * k,
                    color: active ? P.accent : done ? P.graphite : P.graphiteSoft,
                    display: "inline-block",
                    transform: `translateY(${-b * 8 * k}px) scale(${1 + b * 0.08})`,
                    borderBottom: active ? `${4 * k}px solid ${P.accent}` : `${4 * k}px solid transparent`,
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
