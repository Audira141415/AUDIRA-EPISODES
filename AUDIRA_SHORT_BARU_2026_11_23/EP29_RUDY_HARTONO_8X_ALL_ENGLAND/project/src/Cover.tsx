import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure } from "./lib/fig";
import { Finish } from "./lib/set";
import { BrandPlate, C, useFonts } from "./lib/hud";
import { Court, Hall, Shuttle, Trophy } from "./lib/badminton";

export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Hall floorY={1180} spotX={600} tiers={[760, 1170]} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Court yN={1600} yF={1220} cx={540} half={560} netH={330} />
        <Figure x={230} y={1520} h={300} pose="ready" contour={C.dim} glow={0.4} opacity={0.75} racket={-20} />
        <Figure x={720} y={1340} h={560} pose="smash" phase={0.42} contour={C.gold} glow={1.4} facing={-1} racket={10} />
        <Shuttle x={420} y={1020} s={1.3} dir={160} trail={[[560, 900], [500, 950], [440, 1005]]} />
        {Array.from({ length: 8 }).map((_, i) => <Trophy key={i} x={120 + i * 120} y={700} s={0.62} lit={i === 7 ? 1 : 0.9} />)}
      </svg>
      <BrandPlate x={60} y={1205} scale={0.8} />
      <div style={{ position: "absolute", top: 190, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 44, letterSpacing: 9, color: C.cream }}>ALL ENGLAND · 1968–1976</div>
        <div style={{ fontFamily: "Anton", fontSize: 230, lineHeight: 0.95, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>8× JUARA</div>
        <div style={{ fontFamily: "Anton", fontSize: 92, lineHeight: 1, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>7 KALI BERUNTUN</div>
      </div>
      <div style={{ position: "absolute", top: 1440, width: 1080, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "10px 30px", background: "rgba(11,12,16,.82)", border: `3px solid ${C.gold}`, fontFamily: "BarlowX", fontSize: 60, letterSpacing: 6, color: C.cream }}>RUDY HARTONO</div>
      </div>
      <Finish warm="#FFB060" />
    </AbsoluteFill>
  );
};
