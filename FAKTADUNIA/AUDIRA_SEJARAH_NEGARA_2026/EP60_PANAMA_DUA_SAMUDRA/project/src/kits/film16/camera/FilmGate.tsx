// FILM16 film gate: wraps the 3D picture and adds what the camera, stock and projector add. Gate weave
// and exposure flicker move the picture itself; grain, dust, the rounded gate, the edge code chip, a
// typewriter caption and the end-of-roll light leak sit on top. All keyed to the film frame (24/s).

import React from "react";
import { useVideoConfig } from "remotion";
import { dirt, filmFrame, flicker, grainPick, makeGrainTiles, runOut, weave, win } from "../core/film.ts";
import { FILM16_PALETTE as P } from "../lib/palette.ts";

let TILES: string[] | null = null;
const tiles = () => (TILES ??= makeGrainTiles(6, 256));

export const FilmGate: React.FC<{
  t: number;
  children: React.ReactNode;
  /** typewriter caption, e.g. place and year */
  caption?: string;
  captionAt?: number;
  /** edge code text (top left chip) */
  roll?: string;
  runOutAt?: number;
  grain?: number;
}> = ({ t, children, caption, captionAt = 2.6, roll = "16MM · ROL 03", runOutAt = 1e9, grain = 0.36 }) => {
  const { width, height } = useVideoConfig();
  const s = width / 1080;
  const n = filmFrame(t);
  const g = grainPick(n, 6);
  const tileUrl = tiles()[g.tile];
  const { specks, hair } = dirt(n);
  const end = runOut(t, runOutAt);
  const fl = flicker(n);
  const wv = weave(n);

  const typed = caption ? caption.slice(0, Math.max(0, Math.floor((t - captionAt) * 14))) : "";
  const captionFade = caption ? 1 - win(t, captionAt + 3.6, captionAt + 4.2) : 0;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0b0907" }}>
      {/* the picture: weave + flicker + the print's lifted blacks and soft saturation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${wv.x * s}px, ${wv.y * s}px) rotate(${wv.rot}deg) scale(1.012)`,
          filter: `brightness(${fl * 1.02}) contrast(0.93) saturate(0.9) sepia(0.06)`,
        }}
      >
        {children}
      </div>

      {/* grain: a different clumped tile every film frame, overlay-blended */}
      {tileUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${tileUrl})`,
            backgroundSize: `${256 * s * 1.4}px ${256 * s * 1.4}px`,
            backgroundPosition: `${g.ox * 256 * s}px ${g.oy * 256 * s}px`,
            mixBlendMode: "overlay",
            opacity: grain,
          }}
        />
      )}

      {/* dust and the odd hair on the print */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {specks.map((d, i) => (
          <circle key={i} cx={d.x * width} cy={d.y * height} r={d.r * s} fill={d.dark ? "rgba(20,14,10,0.75)" : "rgba(255,248,235,0.7)"} />
        ))}
        {hair && (
          <path
            d={`M0 0 q ${hair.bend * s} ${(hair.len / 2) * s} 0 ${hair.len * s}`}
            transform={`translate(${hair.x * width} ${hair.y * height}) rotate(${hair.rot})`}
            stroke="rgba(20,14,10,0.6)"
            strokeWidth={1.6 * s}
            fill="none"
          />
        )}
      </svg>

      {/* gate: soft rounded corners and edge falloff of the 16mm aperture */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 34 * s, boxShadow: `inset 0 0 ${150 * s}px ${30 * s}px rgba(8,6,4,0.55)` }} />
      <div style={{ position: "absolute", inset: -40 * s, border: `${40 * s}px solid #0b0907`, borderRadius: 74 * s }} />

      {/* edge code chip (below the 180 px top band and the signature start) */}
      <div
        style={{
          position: "absolute", top: 262 * s, left: 64 * s, padding: `${8 * s}px ${16 * s}px`, background: P.chip,
          color: P.accent, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 32 * s, letterSpacing: 4 * s,
        }}
      >
        {roll} <span style={{ color: P.hudDim }}>{String(n).padStart(5, "0")}</span>
      </div>

      {/* typewriter caption, a documentary lower third kept above the 380 px bottom band */}
      {caption && t > captionAt && (
        <div
          style={{
            position: "absolute", left: 64 * s, bottom: 470 * s, color: P.hud, opacity: captionFade,
            fontFamily: "'Courier New', monospace", fontSize: 40 * s, letterSpacing: 1 * s, textShadow: `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.6)`,
          }}
        >
          {typed}
          <span style={{ opacity: n % 12 < 6 ? 1 : 0 }}>▌</span>
        </div>
      )}

      {/* end of roll: leak from the right edge, flash, black */}
      {end.leak > 0 && (
        <div
          style={{
            position: "absolute", inset: 0, mixBlendMode: "screen", opacity: end.leak,
            background: `radial-gradient(120% 70% at ${110 - end.leak * 40}% 40%, rgba(255,120,40,0.95), rgba(255,60,30,0.55) 40%, rgba(0,0,0,0) 75%)`,
          }}
        />
      )}
      {end.flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#FFF3DC", opacity: end.flash }} />}
      {end.black > 0 && <div style={{ position: "absolute", inset: 0, background: "#000", opacity: end.black }} />}
    </div>
  );
};
