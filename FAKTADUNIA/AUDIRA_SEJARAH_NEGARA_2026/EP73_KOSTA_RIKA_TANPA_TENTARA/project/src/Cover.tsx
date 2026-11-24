// EP73 cover: dusk San José, Figueres (gold contour) swings the sledgehammer at the barracks wall.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure } from "./lib/fig";
import { Finish, Fog, MOODS, Sky } from "./lib/set";
import { BrandPlate, C, useFonts } from "./lib/hud";
import { Dust, Fortress, Leaves, Volcanoes } from "./lib/costa";

export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Sky mood={MOODS.dusk} sunX={300} sunY={1000} sunR={240} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Volcanoes y={1060} smoke={0.6} />
        <Fortress y={1420} h={560} ink="#16110E" brick="#2A211B" rim={C.gold} crack={0.85} crackX={660} towers={false} />
        <Dust x={660} y={1100} age={0.35} n={30} />
        <Figure x={400} y={1440} h={580} pose="smash" phase={0.45} contour={C.gold} glow={1.5} tool="hammer" />
      </svg>
      <Fog color={MOODS.dusk.fog} y={1300} h={300} opacity={0.35} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Leaves side="L" y={1560} seed={3} />
        <Leaves side="R" y={1620} seed={7} />
      </svg>
      <BrandPlate x={560} y={1470} scale={0.95} text="AUDIRA · FAKTA DUNIA" />
      <div style={{ position: "absolute", top: 230, width: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow", fontSize: 44, letterSpacing: 9, color: C.cream }}>KOSTA RIKA · SEJAK 1948</div>
        <div style={{ fontFamily: "Anton", fontSize: 230, lineHeight: 1.25, color: C.gold, textShadow: "0 10px 50px rgba(0,0,0,.6)" }}>0 TENTARA</div>
        <div style={{ fontFamily: "Anton", fontSize: 86, lineHeight: 1.2, color: C.cream, textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>DAN TETAP AMAN</div>
      </div>
      <Finish warm="#FFB060" vignette={0.55} />
    </AbsoluteFill>
  );
};
