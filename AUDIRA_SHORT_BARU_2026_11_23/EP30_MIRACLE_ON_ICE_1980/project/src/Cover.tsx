import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Stadium } from "./lib/set";
import { Arena, Boards, Puck, Rink } from "./lib/rink";
import { C, useFonts } from "./lib/hud";

export const Cover: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Arena seed={3} cones={4} />
      <Stadium y0={560} y1={940} mood={MOODS.night} seed={7} flash banners={false} />
      <Fog color="#3E5A80" y={760} h={260} opacity={0.35} />
      <Rink yH={1010} scroll={f} />
      <Boards y={1010} scroll={200} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Figure x={320} y={1420} h={330} pose="skate" phase={0.15} k={0.3} contour={C.blue} glow={1.3} stick />
        <Figure x={790} y={1440} h={680} pose="skate" phase={0.6} k={0.3} contour={C.red} glow={1.3} facing={-1} stick />
        <Puck x={545} y={1350} r={20} />
      </svg>
      <div style={{ position: "absolute", top: 200, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 46, letterSpacing: 10, color: C.cream }}>LAKE PLACID · 22 FEB 1980</div>
        <div style={{ fontFamily: "Anton", fontSize: 240, lineHeight: 0.95, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.7)" }}>MIRACLE</div>
        <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 1, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>ON ICE</div>
        <div style={{ display: "inline-block", marginTop: 26, padding: "10px 30px", background: "rgba(11,12,16,.8)", border: `3px solid ${C.gold}`, fontFamily: "BarlowX", fontSize: 56, letterSpacing: 5, color: C.cream }}>
          <span style={{ color: C.blue }}>MAHASISWA</span> vs <span style={{ color: C.red }}>USSR</span>
        </div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
