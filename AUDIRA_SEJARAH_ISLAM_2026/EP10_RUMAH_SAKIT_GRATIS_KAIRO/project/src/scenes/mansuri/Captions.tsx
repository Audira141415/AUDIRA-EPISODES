import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { FONT } from "../../core/type/fonts";
import { ALL_WORDS, OUTRO_AT, prog } from "./time";
import { chunkWords, toLines } from "./chunks";

/** Karaoke captions: active word gold, bounce <= 1.04, word gap 0.42 em, on a dark blurred plate, above the bottom 380 px. */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  const groups = useMemo(() => chunkWords(ALL_WORDS), []);
  if (t >= OUTRO_AT - 0.2) return null;
  const idx = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    const end = Math.min(g[g.length - 1].e + 0.35, next ? next[0].s - 0.05 : Infinity);
    return t >= g[0].s - 0.12 && t <= end;
  });
  if (idx < 0) return null;
  const g = groups[idx];
  const fade = prog(t, g[0].s - 0.2, g[0].s - 0.06);
  return (
    <div style={{ position: "absolute", left: 70 * s, right: 70 * s, bottom: (380 + 70) * s, display: "flex", justifyContent: "center", opacity: fade }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: 4 * s,
          padding: `${16 * s}px ${30 * s}px ${20 * s}px`,
          borderRadius: 22 * s,
          background: "rgb(30,19,12)",
          boxShadow: `0 ${8 * s}px ${30 * s}px rgba(0,0,0,0.45)`,
          border: `${2 * s}px solid rgba(230,185,76,0.35)`,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 62 * s,
          lineHeight: 1.16,
          textAlign: "center",
          maxWidth: 980 * s,
        }}
      >
        {toLines(g).map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: "0.42em", whiteSpace: "nowrap" }}>
        {line.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.06;
          const spoken = t >= w.s;
          const k = active ? Math.sin(Math.min(1, (t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 0;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: active ? "#F0C766" : spoken ? "#FFF6E3" : "#D9CDB5",
                transform: `scale(${1 + 0.04 * k})`,
                textShadow: "0 2px 8px rgba(0,0,0,0.7)",
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
