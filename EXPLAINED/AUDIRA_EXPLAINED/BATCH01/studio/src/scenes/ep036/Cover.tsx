// EP036 cover: "Kenapa MRT Tetap Kering?" — INNERWORKS cutaway of a rainy street over a dry MRT tunnel.

import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, Post } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { World } from "./World.tsx";
import { COVER_SHOT, P, SUMP, TUNNEL, BLOCK, project } from "./layout.ts";

type Label = { text: string; anchor: [number, number, number]; side: "left" | "right"; dy?: number; color: string };

const LABELS: Label[] = [
  { text: "Jalan tergenang", anchor: [4.9, 0.22, 0.9], side: "right", dy: -110, color: P.waterDeep },
  { text: "Air tanah menekan", anchor: [TUNNEL.x + Math.cos((135 * Math.PI) / 180) * (TUNNEL.R + 1.1), TUNNEL.y + Math.sin((135 * Math.PI) / 180) * (TUNNEL.R + 1.1), BLOCK.front + 0.12], side: "left", dy: -50, color: P.waterDeep },
  { text: "Cincin beton + gasket", anchor: [TUNNEL.x - TUNNEL.R + 0.22, TUNNEL.y - 0.9, BLOCK.front], side: "left", dy: 40, color: P.gasket },
  { text: "Pompa sump", anchor: [2.7, SUMP.y0 + 1.5, 3.0], side: "right", dy: 40, color: "#c98c22" },
];

const LabelTag: React.FC<{ l: Label }> = ({ l }) => {
  const [ax, ay] = project(l.anchor);
  const ty = ay + (l.dy ?? 0);
  const tx = l.side === "left" ? 64 : 1016;
  const elbowX = l.side === "left" ? Math.min(ax - 40, 300) : Math.max(ax + 40, 780);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${ax},${ay} ${elbowX},${ty} ${l.side === "left" ? tx + 10 : tx - 10},${ty}`} fill="none" stroke={P.ink} strokeWidth={2.5} strokeOpacity={0.7} />
        <circle cx={ax} cy={ay} r={8} fill="#fff" stroke={P.ink} strokeWidth={3} />
        <circle cx={ax} cy={ay} r={3.5} fill={l.color} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: ty - 44,
          ...(l.side === "left" ? { left: tx } : { right: 1080 - tx }),
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 30,
          color: P.ink,
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.86)",
          padding: "6px 14px",
          borderRadius: 10,
          boxShadow: "0 4px 14px rgba(30,40,50,0.14)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: l.color, display: "inline-block" }} />
        {l.text}
      </div>
    </>
  );
};

const Overlay: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: P.ink }}>
    <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.32em", color: "#2f86c6" }}>AUDIRA EXPLAINED</div>
      <div style={{ fontSize: 118, fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.025em", marginTop: 22 }}>
        Kenapa MRT
        <br />
        Tetap <span style={{ color: "#2f86c6" }}>Kering?</span>
      </div>
    </div>
    {LABELS.map((l) => (
      <LabelTag key={l.text} l={l} />
    ))}
  </div>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D background={P.bg} overlay={() => <Overlay />}>
      <CameraRig shot={COVER_SHOT} />
      <World f={frame} />
      <Post shot={COVER_SHOT} frame={frame} ao aoRadius={0.5} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} />
    </Stage3D>
  );
};
