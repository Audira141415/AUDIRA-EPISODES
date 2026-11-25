// Stage label: a small numbered caption and a five-stop progress rail on a soft paper chip.
// Deliberately quiet; the construction carries the story. Stages swap with a clip wipe, never an
// opacity fade, so the text keeps full contrast on every frame. Laid out on the format's layout canvas
// (1080 × 1920 short, 1920 × 1080 wide, via useFormat()) and scaled to the render size, always
// inside the safe area (below the top 180 px / above the bottom 380 px of a short). Text ≥ 36 px.

import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { ease, remap } from "../motion/easing.ts";

export type Stage = { from: number; to: number; n: string; label: string };

export const StageLabel: React.FC<{
  stages: Stage[];
  frame: number;
  fps?: number;
  show?: number;
  /** Kept for compatibility; the layout now comes from useFormat(). */
  width?: number;
  font: string;
  ink: string;
  soft: string;
  accent: string;
  /** Chip behind the text (keeps it ≥ 4.5:1 over sky, sand or lawn). */
  paper?: string;
  /** Small kit line above the stages. */
  kicker?: string;
}> = ({ stages, frame, fps = 30, show = 1, font, ink, soft, accent, paper = "rgba(250,248,243,0.92)", kicker = "BUILDFORGE · PAVILIUN" }) => {
  const fmt = useFormat();
  const { width: W, height: H } = fmt.layout;
  const r = fps / 30; // timings are authored at 30 fps
  const T = 10 * r;
  const intro = ease.type(remap(frame, 6 * r, 30 * r)) * show;
  const total = stages[stages.length - 1].to;
  if (intro <= 0.001) return null;
  const left = fmt.safe.left + 12;
  const top = fmt.safe.top + 24;
  const rail = 420;
  const chip = 680;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${fmt.scale})`, transformOrigin: "0 0", fontFamily: font, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left, top, width: chip, height: 196, padding: "22px 36px 0", boxSizing: "border-box", background: paper, borderRadius: 6, boxShadow: "0 6px 24px rgba(30,36,38,0.10)", clipPath: `inset(0 ${(1 - intro) * 100}% 0 0)` }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "0.12em", color: soft, whiteSpace: "nowrap" }}>{kicker}</div>
        <div style={{ position: "relative", height: 76, marginTop: 8 }}>
          {stages.map((s, i) => {
            const inK = i === 0 ? 1 : ease.type(remap(frame, s.from, s.from + T));
            const outK = i === stages.length - 1 ? 0 : ease.type(remap(frame, s.to - T, s.to));
            const v = inK * (1 - outK);
            if (v <= 0.001) return null;
            return (
              <div key={s.n} style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", clipPath: `inset(${outK * 100}% 0 ${(1 - inK) * 100}% 0)`, transform: `translateY(${(1 - inK) * 18 - outK * 14}px)` }}>
                <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "0.08em", color: accent }}>{s.n}</span>
                <span style={{ marginLeft: 22, fontSize: 44, fontWeight: 600, letterSpacing: "0.1em", color: ink }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: "relative", width: rail, height: 4, marginTop: 4 }}>
          <div style={{ position: "absolute", inset: 0, background: soft, opacity: 0.3 }} />
          <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: rail * Math.min(1, frame / total), background: accent }} />
          {stages.map((s, i) =>
            i === 0 ? null : (
              <div key={`t${s.n}`} style={{ position: "absolute", left: (rail * s.from) / total - 5, top: -3, width: 10, height: 10, borderRadius: 10, background: frame >= s.from ? accent : soft, opacity: frame >= s.from ? 1 : 0.4 }} />
            ),
          )}
        </div>
      </div>
    </div>
  );
};
