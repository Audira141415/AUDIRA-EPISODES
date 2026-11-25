import React from "react";
import { AbsoluteFill, Composition, Sequence, useVideoConfig } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import { AudiraOutro } from "./brand/AudiraOutro.tsx";
import * as EP22 from "./scenes/ep22/index.ts";

const { preview, final } = PRESETS;
// AUDIRA TECH (@AudiraTECH), short EP22 "Demam Tamagotchi 1996". Handle comes from src/brand/channel.json.
export const SLUG: Record<string, string> = {
  Ep22: "demam-tamagotchi-1996",
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
        <AudiraOutro seconds={OUTRO_SECONDS} />
        <Sequence from={Math.round(SIGNATURE_START * fps)}>
          <AudiraSignature seed={SLUG[name]} outroSeconds={OUTRO_SECONDS + SIGNATURE_START} />
        </Sequence>
      </AbsoluteFill>
    );
  };
  return C;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep22Cover" component={EP22.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP22 film locked to VO 2026-11-23 */}
    <Composition id="Ep22Preview" component={signed("Ep22", EP22.Film)} durationInFrames={Math.ceil(EP22.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep22Final" component={signed("Ep22", EP22.Film)} durationInFrames={Math.ceil(EP22.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
  </>
);
