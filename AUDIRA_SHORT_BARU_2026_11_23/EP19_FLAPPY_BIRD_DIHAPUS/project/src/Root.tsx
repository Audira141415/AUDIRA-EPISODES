import React from "react";
import { AbsoluteFill, Composition, Sequence, useVideoConfig } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import { AudiraOutro } from "./brand/AudiraOutro.tsx";
import * as EP19 from "./scenes/ep19/index.ts";

const { preview, final } = PRESETS;
// AUDIRA short batch 2026-11-23 (@AudiraTECH). EP19 Flappy Bird. Old olahraga Root backed up in ../_tools/Root.tsx.bak-olahraga.
export const SLUG: Record<string, string> = {
  Ep19: "flappy-bird-EP19",
};
// Signature starts after the cover frames; outro card holds the last ~3.8 s.
const SIGNATURE_START = 3;
const OUTRO_SECONDS = 3.8;
export const signed = (name: string, Film: React.FC) => {
  const C: React.FC = () => {
    const { fps } = useVideoConfig();
    return (
      <AbsoluteFill>
        <Film />
        <AudiraOutro seconds={OUTRO_SECONDS} code="TECH" />
        <Sequence from={Math.round(SIGNATURE_START * fps)}>
          <AudiraSignature seed={SLUG[name]} code="TECH" outroSeconds={OUTRO_SECONDS + SIGNATURE_START} />
        </Sequence>
      </AbsoluteFill>
    );
  };
  return C;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep19Cover" component={EP19.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP19 film locked to VO 2026-11-23 */}
    <Composition id="Ep19Preview" component={signed("Ep19", EP19.Film)} durationInFrames={Math.ceil(EP19.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep19Final" component={signed("Ep19", EP19.Film)} durationInFrames={Math.ceil(EP19.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
  </>
);
