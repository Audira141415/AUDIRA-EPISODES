// EP02 karaoke captions: words from the locked timeline, chunked into short phrases (a number
// never splits from its unit), active word in orange with a ≤1.04 bounce, on a blurred plate
// whose bottom edge sits above the 380 px bottom safe zone.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, type Word } from "./timing.ts";
import { TEXT } from "./fonts.ts";

type Chunk = { words: Word[]; start: number; end: number };

const UNITS = new Set(["juta", "juta.", "juta,", "miliar", "dolar", "dolar.", "dolar,", "hari", "bulan", "bulan.", "teratas,", "teratas"]);
const isNum = (w: string) => /^[\d.,%:]+$/.test(w.replace(/[.,:]$/, "")) && /\d/.test(w);

const chunkLine = (words: Word[]): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  const len = (ws: Word[]) => ws.reduce((s, w) => s + w.w.length + 1, 0);
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (!next) return;
    const keepUnit = isNum(w.w) && UNITS.has(next.w.toLowerCase());
    const punct = /[.,:]$/.test(w.w) && !isNum(w.w);
    const long = len(cur) + next.w.length > 24;
    if (!keepUnit && ((punct && cur.length >= 2) || long)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const u = height / 1920;
  const chunks = useMemo(() => {
    const all: Chunk[] = [];
    TL.lines.forEach((l) => chunkLine(l.words).forEach((ws) => all.push({ words: ws, start: ws[0].s, end: ws[ws.length - 1].e })));
    // each chunk holds until the next one starts (max 0.8 s past its last word)
    return all.map((c, i) => ({ ...c, end: Math.min(all[i + 1] ? all[i + 1].start - 0.02 : c.end + 0.8, c.end + 0.8) }));
  }, []);
  const c = chunks.find((k) => t >= k.start - 0.08 && t < k.end);
  if (!c) return null;
  const inK = Math.min(1, (t - (c.start - 0.08)) / 0.12);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 60 * u,
          right: 60 * u,
          bottom: 420 * u,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: "0.4em",
            rowGap: 4 * u,
            padding: `${18 * u}px ${30 * u}px ${20 * u}px`,
            borderRadius: 26 * u,
            background: "rgba(12,13,15,0.88)",
            textShadow: `0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.6)`,
            backdropFilter: `blur(${14 * u}px)`,
            boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`,
            border: `${1.5 * u}px solid rgba(210,176,122,0.35)`,
            fontFamily: TEXT,
            fontWeight: 700,
            fontSize: 62 * u,
            lineHeight: 1.12,
            color: "#F4F1EA",
            opacity: inK,
            transform: `translateY(${(1 - inK) * 14 * u}px)`,
            maxWidth: 900 * u,
          }}
        >
          {c.words.map((w, i) => {
            const active = t >= w.s - 0.03 && t < (c.words[i + 1]?.s ?? c.end);
            const done = t >= w.s;
            const b = active ? Math.sin(Math.min(1, (t - w.s) / 0.18) * Math.PI) : 0;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  color: active ? "#FF8A50" : done ? "#FFFFFF" : "rgba(255,255,255,0.72)",
                  transform: `scale(${1 + 0.04 * b})`,
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
