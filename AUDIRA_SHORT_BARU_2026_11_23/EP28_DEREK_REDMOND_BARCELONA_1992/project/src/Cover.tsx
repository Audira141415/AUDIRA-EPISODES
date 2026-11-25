import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Sky, Stadium, Track } from "./lib/set";
import { BrandPlate, C, useFonts } from "./lib/hud";

// Derek (gold contour) hopping on his left leg, right leg folded; Jim (blue contour) holding him up.
export const DEREK_HOP = { lean: 8, head: 10, thA: 6, flA: 8, thB: 30, flB: 100, uaA: -25, faA: -35, uaB: 98, faB: -45, bob: 0 };
export const JIM_HOLD = { lean: 4, head: -12, thA: 14, flA: 10, thB: -14, flB: 14, uaA: -55, faA: -40, uaB: -20, faB: 10, bob: 0 };

export const Cover: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const m = MOODS.dusk;
  return (
    <AbsoluteFill style={{ background: m.top }}>
      <Sky mood={m} sunX={540} sunY={860} sunR={300} />
      <Stadium y0={740} y1={1170} mood={m} seed={28} flash />
      <Fog color={m.fog} y={1150} h={300} opacity={0.6} />
      <Track yH={1160} scroll={f / 400} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Figure x={600} y={1530} h={540} pose="walk" contour={C.blue} glow={1} angles={JIM_HOLD} />
        <Figure x={510} y={1545} h={540} pose="stand" contour={C.gold} glow={1.3} angles={DEREK_HOP} badge="GBR" />
      </svg>
      <BrandPlate x={60} y={1100} scale={0.8} />
      <div style={{ position: "absolute", top: 230, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 46, letterSpacing: 10, color: C.cream }}>BARCELONA · 3 AGUSTUS 1992</div>
        <div style={{ fontFamily: "Anton", fontSize: 168, lineHeight: 0.98, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>OTOT PUTUS,</div>
        <div style={{ fontFamily: "Anton", fontSize: 118, lineHeight: 1, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>AYAH TURUN</div>
        <div style={{ fontFamily: "Anton", fontSize: 118, lineHeight: 1, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>KE LINTASAN</div>
        <div style={{ display: "inline-block", marginTop: 26, padding: "10px 30px", background: "rgba(11,12,16,.8)", border: `3px solid ${C.gold}`, fontFamily: "BarlowX", fontSize: 54, letterSpacing: 6, color: C.cream }}>DEREK REDMOND</div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
