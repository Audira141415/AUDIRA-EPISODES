import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Sky, Stadium, Track } from "./lib/set";
import { BrandPlate, C, useFonts } from "./lib/hud";

export const Cover: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const m = MOODS.dusk;
  return (
    <AbsoluteFill style={{ background: m.top }}>
      <Sky mood={m} sunX={560} sunY={880} sunR={300} />
      <Stadium y0={760} y1={1180} mood={m} seed={11} flash />
      <Fog color={m.fog} y={1160} h={300} opacity={0.6} />
      <Track yH={1170} scroll={f / 120} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Figure x={300} y={1600} h={300} pose="run" phase={0.62} contour={C.dim} glow={0.4} opacity={0.75} />
        <Figure x={560} y={1690} h={560} pose="run" phase={0.12} contour={C.gold} glow={1.2} />
        <Figure x={850} y={1580} h={270} pose="run" phase={0.4} contour={C.dim} glow={0.4} opacity={0.7} />
      </svg>
      <BrandPlate x={70} y={1110} scale={0.8} />
      <div style={{ position: "absolute", top: 230, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 46, letterSpacing: 10, color: C.cream }}>BERLIN · AGUSTUS 1936</div>
        <div style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 0.95, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>4 EMAS</div>
        <div style={{ fontFamily: "Anton", fontSize: 110, lineHeight: 1, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>DALAM 7 HARI</div>
        <div style={{ display: "inline-block", marginTop: 26, padding: "10px 30px", background: "rgba(11,12,16,.8)", border: `3px solid ${C.gold}`, fontFamily: "BarlowX", fontSize: 58, letterSpacing: 6, color: C.cream }}>JESSE OWENS</div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
