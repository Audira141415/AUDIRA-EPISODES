// EP11 cover: the amber runner coming out of the 1912 sun, title on top (1080 × 1920 still, also the social thumbnail).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "./chronicle/ShotCanvas.tsx";
import { chronicleFontsReady, F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { AMBER, CRIMSON, Frame, IVORY } from "./chronicle/Overlay.tsx";
import { ROAD, RoadSet } from "./sets.tsx";
import { Chip } from "./hud.tsx";

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [h] = useState(() => delayRender("ep11 cover fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  const t = 2.06 + frame * 0.001;
  return (
    <AbsoluteFill style={{ background: "#120a06" }}>
      {ok && (
        <>
          <ShotCanvas shot={{ pos: [0.55, 0.75, 4.9], target: [0.05, 1.42, 0], fov: 45 }} look={ROAD} frame={frame}><RoadSet t={t} /></ShotCanvas>
          <Frame width={width} height={height}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,8,4,0.62) 0%, rgba(20,8,4,0.3) 26%, rgba(20,8,4,0) 42%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 176, textAlign: "center", fontFamily: F_LABEL, fontWeight: 800, fontSize: 48, letterSpacing: 9, color: IVORY }}>AUDIRA · FAKTA OLAHRAGA</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 244, textAlign: "center", fontFamily: F_STAMP, lineHeight: 1.02, color: IVORY, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
              <div style={{ fontSize: 132, letterSpacing: 3 }}>MARATON</div>
              <div style={{ fontSize: 236, letterSpacing: 2, color: AMBER, lineHeight: 0.98 }}>54 TAHUN</div>
            </div>
            <div style={{ position: "absolute", left: 420, width: 240, top: 634, height: 9, background: CRIMSON }} />
            <Chip t={1} a={-1} b={9} text="START 1912 · FINIS 1967" y={672} />
          </Frame>
        </>
      )}
    </AbsoluteFill>
  );
};
