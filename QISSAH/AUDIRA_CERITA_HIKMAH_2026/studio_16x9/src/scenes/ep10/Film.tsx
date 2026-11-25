// EP10 "Cinta dan Waktu" (STAINEDGLASS, 16:9): the allegory as one living cathedral triptych.
// Panes light up per beat, the sea rises in cobalt glass, boats slide as glass panels across the
// lancets, and the camera trucks along the window. All timing comes from the locked voice timeline.
import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadGaramond } from "@remotion/google-fonts/EBGaramond";
import { StainedCameraRig, StainedPost } from "../../kits/stainedglass/lib/post";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { Cathedral } from "./Cathedral";
import { stateAt, shotAt, sm, T } from "./story";
import { CaptionBand, Captions, HikmahCard, Outro, TitleCard } from "./Overlay";

loadCinzel("normal", { weights: ["600", "700"], subsets: ["latin"] });
loadCormorant("italic", { weights: ["500", "600"], subsets: ["latin"] });
loadGaramond("normal", { weights: ["500", "600"], subsets: ["latin"] });

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const st = stateAt(t);
  const bloom = 0.5 + 0.25 * st.flash + 0.25 * sm(T.s10e, T.s10e + 3, t);
  return (
    <AbsoluteFill style={{ background: "#0E0B08" }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ position: [0, 0, 12], fov: 44, near: 0.05, far: 120 }}>
        <color attach="background" args={["#0E0B08"]} />
        <StainedCameraRig shot={shotAt(t)} />
        <Cathedral t={t} s={st} />
        <StainedPost frame={frame} strength={bloom} radius={0.55} threshold={0.82} vignette={0.5} grain={0.02} />
      </ThreeCanvas>
      <CaptionBand t={t} />
      <TitleCard t={t} />
      <Captions t={t} />
      <HikmahCard t={t} />
      <Outro t={t} />
      <Html5Audio src={staticFile("audio/ep10/mix.wav")} />
      <AudiraSignature seed="cerita-hikmah-ep10" handle="@audira" />
    </AbsoluteFill>
  );
};
