import React from "react";
import { AbsoluteFill, Composition, Sequence, useVideoConfig } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import { AudiraOutro } from "./brand/AudiraOutro.tsx";
import * as EP06 from "./scenes/ep06/index.ts";

const { preview, final } = PRESETS;
// AUDIRA TECH (@AudiraTECH), short EP06 "Easter Egg Pertama yang Terkenal di Game". Handle comes from src/brand/channel.json.
export const SLUG: Record<string, string> = {
  Ep06: "easter-egg-EP06",
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
    <Composition id="Ep06Cover" component={EP06.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP06 film locked to VO 2026-11-23 */}
    <Composition id="Ep06Preview" component={signed("Ep06", EP06.Film)} durationInFrames={Math.ceil(EP06.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep06Final" component={signed("Ep06", EP06.Film)} durationInFrames={Math.ceil(EP06.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
  </>
);
