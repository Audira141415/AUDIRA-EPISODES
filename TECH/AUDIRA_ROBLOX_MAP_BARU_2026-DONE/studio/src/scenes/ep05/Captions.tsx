// EP05 karaoke captions (1080-wide overlay space). Chunks of the locked display words, one plate above
// the bottom 380 px safe band; active word cyan with a ≤1.04 bounce, gap ≥ 0.4 em.
import React from "react";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";
import { DISPLAY } from "./Cover.tsx";
import { LINES } from "./timing.ts";

type W = { w: string; s: number; e: number };
type Chunk = { words: W[]; start: number; end: number };

const MAX_CHARS = 24;

const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const line of LINES) {
    let cur: W[] = [];
    let len = 0;
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
      len = 0;
    };
    line.words.forEach((wd, i) => {
      // never split a number from its unit ("10 stud")
      const prevNum = cur.length > 0 && /^[0-9]+%?$/.test(cur[cur.length - 1].w);
      if (cur.length && len + 1 + wd.w.length > MAX_CHARS && !prevNum) flush();
      cur.push(wd);
      len += (len ? 1 : 0) + wd.w.length;
      const punct = /[,.:;?!]$/.test(wd.w);
      const rest = line.words.length - 1 - i;
      if (punct && cur.length >= 2 && rest !== 1) flush();
    });
    flush();
  }
  // each chunk stays until the next one starts (max 0.6 s after its last word)
  return out.map((c, i) => ({ ...c, end: Math.min(c.end + 0.6, out[i + 1]?.start ?? c.end + 0.6) }));
})();

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const chunk = CHUNKS.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!chunk) return null;
  const inK = Math.min(1, (t - (chunk.start - 0.05)) / 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 396, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 980,
          padding: "14px 30px 18px",
          borderRadius: 22,
          background: "rgba(8,11,17,0.84)",
          border: `2px solid ${P.accentNeon}55`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: inK,
          transform: `translateY(${(1 - inK) * 10}px)`,
        }}
      >
        {chunk.words.map((wd, i) => {
          const active = t >= wd.s && t < wd.e + 0.05;
          const past = t >= wd.e + 0.05;
          const k = active ? Math.min(1, (t - wd.s) / 0.12) : 0;
          const bounce = active ? 1 + 0.04 * Math.sin(Math.min(1, k) * Math.PI) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${DISPLAY}', Impact, sans-serif`,
                fontSize: 70,
                lineHeight: 1.12,
                letterSpacing: 1,
                marginRight: i < chunk.words.length - 1 ? "0.42em" : 0,
                color: active ? P.accentNeon : past ? "#FFFFFF" : "rgba(255,255,255,0.62)",
                transform: `scale(${bounce})`,
                display: "inline-block",
                textShadow: active ? `0 0 18px ${P.accentNeon}88` : "none",
              }}
            >
              {wd.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
