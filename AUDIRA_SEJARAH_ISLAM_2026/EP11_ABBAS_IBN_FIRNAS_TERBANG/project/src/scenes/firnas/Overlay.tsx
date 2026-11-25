// EP11 Firnas 2D overlay: SKETCHFORGE-style HUD + karaoke captions synced to VO.
import React from "react";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { TIMELINE, prog, smooth, type Word } from "./time";

const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
const MONO = "'Courier New', monospace";

// Active caption: show the current line's words with karaoke highlight
const Caption: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  // find current line
  let currentLine = TIMELINE.lines[0];
  for (const line of TIMELINE.lines) {
    if (t >= line.start && t <= line.end + 0.5) currentLine = line;
  }
  if (!currentLine || t < currentLine.start - 0.2 || t > currentLine.end + 1.0) return null;

  const lineK = smooth(prog(t, currentLine.start, currentLine.start + 0.3));
  const lineOut = smooth(prog(t, currentLine.end + 0.3, currentLine.end + 0.8));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 400 * s,
        left: 56 * s,
        right: 56 * s,
        opacity: lineK * (1 - lineOut),
        transform: `translateY(${(1 - lineK) * 20 * s}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(38,38,42,0.85)",
          borderLeft: `${5 * s}px solid ${P.accent}`,
          padding: `${14 * s}px ${20 * s}px`,
          display: "flex",
          flexWrap: "wrap",
          gap: `${10 * s}px`,
          lineHeight: 1.4,
        }}
      >
        {currentLine.words.map((w: Word, i: number) => {
          if (w.w === "—") return null;
          const active = t >= w.s && t < w.e;
          const past = t >= w.e;
          return (
            <span
              key={i}
              style={{
                fontFamily: HAND,
                fontSize: 32 * s,
                color: active ? P.accent : past ? P.paper : "rgba(243,235,221,0.6)",
                transform: active ? `scale(1.04)` : "none",
                fontWeight: active ? 700 : 400,
                transition: "none",
              }}
            >
              {w.w.replace(/[.,;:"""!?]/g, (m) => m)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Top-left badge: episode + topic
const Badge: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const inK = smooth(prog(t, 0, 0.8));
  if (inK <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 180 * s,
        left: 56 * s,
        opacity: inK,
      }}
    >
      <div
        style={{
          background: "rgba(38,38,42,0.82)",
          padding: `${12 * s}px ${18 * s}px`,
          borderLeft: `${5 * s}px solid ${P.accent}`,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 18 * s,
            letterSpacing: 3 * s,
            color: P.paper,
          }}
        >
          SEJARAH ISLAM · EP11
        </div>
        <div
          style={{
            fontFamily: HAND,
            fontSize: 48 * s,
            lineHeight: 1.1,
            color: P.paperWhite,
            marginTop: 6 * s,
          }}
        >
          Abbas ibn Firnas
        </div>
        <div
          style={{
            fontFamily: HAND,
            fontSize: 28 * s,
            color: P.accentGlow,
            marginTop: 2 * s,
          }}
        >
          Manusia pertama yang mencoba terbang
        </div>
      </div>
    </div>
  );
};

// Top-right corner tag
const CornerTag: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const inK = smooth(prog(t, 0.3, 1));
  if (inK <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 180 * s,
        right: 56 * s,
        opacity: inK,
      }}
    >
      <div
        style={{
          border: `${2 * s}px solid ${P.accent}`,
          background: "rgba(38,38,42,0.85)",
          color: P.paperWhite,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 18 * s,
          padding: `${8 * s}px ${14 * s}px`,
          letterSpacing: 2 * s,
        }}
      >
        SKETCHFORGE
      </div>
    </div>
  );
};

export const FirnasOverlay: React.FC<{ t: number; width: number; height: number }> = ({ t, width, height }) => {
  const s = height / 1920;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      <Badge t={t} s={s} />
      <CornerTag t={t} s={s} />
      <Caption t={t} s={s} />
      {/* Creator tag at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 390 * s,
          right: 56 * s,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 16 * s,
          color: P.paper,
          letterSpacing: 2 * s,
          opacity: smooth(prog(t, 1, 2)),
        }}
      >
        Creator: AUDIRA
      </div>
    </div>
  );
};
