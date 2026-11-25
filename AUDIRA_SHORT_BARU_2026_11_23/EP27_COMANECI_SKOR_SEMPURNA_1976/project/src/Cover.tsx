import React from "react";
import { AbsoluteFill } from "remotion";
import { Finish } from "./lib/set";
import { BrandPlate, C, useFonts } from "./lib/hud";
import { Arena, BarGymnast, Scoreboard, UnevenBars } from "./lib/gym";

export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Arena floorY={1640} spotX={630} tiers={[900, 1560]} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Scoreboard x={190} y={500} w={700} digits="100" />
        <UnevenBars s={0.75} ox={90} oy={800} />
        <BarGymnast x={630} y={1370} h={300} theta={180} contour={C.gold} glow={1.8} />
      </svg>
      <BrandPlate x={70} y={1120} scale={0.8} />
      <div style={{ position: "absolute", top: 165, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 44, letterSpacing: 9, color: C.cream }}>MONTRÉAL · 18 JULI 1976</div>
        <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 1, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>NILAI 10 = 1.00?</div>
      </div>
      <div style={{ position: "absolute", top: 370, width: 1080, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "10px 30px", background: "rgba(11,12,16,.82)", border: `3px solid ${C.gold}`, fontFamily: "BarlowX", fontSize: 50, letterSpacing: 5, color: C.cream }}>NADIA COMĂNECI · 14 TAHUN</div>
      </div>
      <Finish warm="#FFB060" />
    </AbsoluteFill>
  );
};
