// EP04 film: "Foto Ini Asli atau AI? Begini Cara Ceknya" (VISUALINVESTIGATION).
// One continuous forensic-desk world (FilmScene) timed to timeline.json, HUD + karaoke captions
// over it, AUDIRA outro card on top from sections.outro[1] + 0.2. No audio here (lead muxes VO).
import React, { useEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { FilmScene } from "./FilmScene.tsx";
import { Hud } from "./Hud.tsx";
import { SEC } from "./tl.ts";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const plex = loadPlex("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const BG = "#0B0C0E";

export const Ep04Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP04 film fonts"));
  useEffect(() => {
    Promise.all([anton.waitUntilDone(), plex.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <>
          <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 5, 3], fov: 30, near: 0.1, far: 80 }}>
            <FilmScene t={t} />
            <Finish frame={frame} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao />
          </ThreeCanvas>
          <Hud t={t} k={k} />
        </>
      )}
      <Outro start={SEC.outro[1] + 0.2} />
    </AbsoluteFill>
  );
};
