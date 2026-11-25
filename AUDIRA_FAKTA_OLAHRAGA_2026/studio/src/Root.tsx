import React from "react";
import { AbsoluteFill, Composition, Sequence, useVideoConfig } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import { AudiraOutro } from "./brand/AudiraOutro.tsx";
import * as EP01 from "./scenes/ep01/index.ts";
import * as EP02 from "./scenes/ep02/index.ts";
import * as EP03 from "./scenes/ep03/index.ts";
import * as EP04 from "./scenes/ep04/index.ts";
import * as EP05 from "./scenes/ep05/index.ts";
import * as EP06 from "./scenes/ep06/index.ts";
import * as EP07 from "./scenes/ep07/index.ts";
import * as EP08 from "./scenes/ep08/index.ts";
import * as EP08HD from "./scenes/ep08hd/index.ts";
import * as EP09 from "./scenes/ep09/index.ts";
import * as EP10 from "./scenes/ep10/index.ts";
import * as EP11 from "./scenes/ep11/index.ts";
import * as EP12 from "./scenes/ep12/index.ts";
import * as EP13 from "./scenes/ep13/index.ts";

const { preview, final } = PRESETS;
// Series AUDIRA_FAKTA_OLAHRAGA_2026 (@AudiraSportFacts). Signature seed per episode = "olahraga-EPNN".
export const SLUG: Record<string, string> = {
  Ep01: "olahraga-EP01",
  Ep02: "olahraga-EP02",
  Ep03: "olahraga-EP03",
  Ep04: "olahraga-EP04",
  Ep05: "olahraga-EP05",
  Ep06: "olahraga-EP06",
  Ep07: "olahraga-EP07",
  Ep08: "olahraga-EP08",
  Ep09: "olahraga-EP09",
  Ep10: "olahraga-EP10",
  Ep11: "olahraga-EP11",
  Ep12: "olahraga-EP12",
  Ep13: "olahraga-EP13",
};
// Signature starts after the cover frames (kicker at y~196); outro card holds the last ~3.8 s.
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
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep01Cover" component={EP01.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep02CoverA" component={EP02.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep02CoverB" component={EP02.CoverB} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep03CoverA" component={EP03.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep03CoverB" component={EP03.CoverB} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep04CoverA" component={EP04.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep04CoverB" component={EP04.CoverB} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep05CoverA" component={EP05.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep05CoverB" component={EP05.CoverB} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP01 film locked to VO 2026-11-22 */}
    <Composition id="Ep01Preview" component={signed("Ep01", EP01.Film)} durationInFrames={Math.ceil(EP01.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep01Final" component={signed("Ep01", EP01.Film)} durationInFrames={Math.ceil(EP01.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP02 film locked to VO 2026-11-22 */}
    <Composition id="Ep02Preview" component={signed("Ep02", EP02.Film)} durationInFrames={Math.ceil(EP02.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep02Final" component={signed("Ep02", EP02.Film)} durationInFrames={Math.ceil(EP02.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP03 film locked to VO 2026-11-22 */}
    <Composition id="Ep03Preview" component={signed("Ep03", EP03.Film)} durationInFrames={Math.ceil(EP03.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep03Final" component={signed("Ep03", EP03.Film)} durationInFrames={Math.ceil(EP03.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP04 film locked to VO 2026-11-22 */}
    <Composition id="Ep04Preview" component={signed("Ep04", EP04.Film)} durationInFrames={Math.ceil(EP04.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep04Final" component={signed("Ep04", EP04.Film)} durationInFrames={Math.ceil(EP04.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP05 film locked to VO 2026-11-22 */}
    <Composition id="Ep05Preview" component={signed("Ep05", EP05.Film)} durationInFrames={Math.ceil(EP05.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep05Final" component={signed("Ep05", EP05.Film)} durationInFrames={Math.ceil(EP05.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP06 film locked to VO 2026-11-23 */}
    <Composition id="Ep06CoverA" component={EP06.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep06Preview" component={signed("Ep06", EP06.Film)} durationInFrames={Math.ceil(EP06.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep06Final" component={signed("Ep06", EP06.Film)} durationInFrames={Math.ceil(EP06.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP07 film locked to VO 2026-11-24 */}
    <Composition id="Ep07Cover" component={EP07.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep07Preview" component={signed("Ep07", EP07.Film)} durationInFrames={Math.ceil(EP07.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep07Final" component={signed("Ep07", EP07.Film)} durationInFrames={Math.ceil(EP07.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP08 film locked to VO 2026-11-24 */}
    <Composition id="Ep08Cover" component={EP08.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep08Preview" component={signed("Ep08", EP08.Film)} durationInFrames={Math.ceil(EP08.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep08Final" component={signed("Ep08", EP08.Film)} durationInFrames={Math.ceil(EP08.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP08 HD2D (G21 restyle after PIXELSTORY, same VO/timing) 2026-11-24 */}
    <Composition id="Ep08HdCover" component={EP08HD.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep08HdPreview" component={signed("Ep08", EP08HD.Film)} durationInFrames={Math.ceil(EP08HD.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep08HdFinal" component={signed("Ep08", EP08HD.Film)} durationInFrames={Math.ceil(EP08HD.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP09 film locked to VO 2026-11-23 */}
    <Composition id="Ep09Cover" component={EP09.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep09Preview" component={signed("Ep09", EP09.Film)} durationInFrames={Math.ceil(EP09.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep09Final" component={signed("Ep09", EP09.Film)} durationInFrames={Math.ceil(EP09.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP10 film locked to VO 2026-11-24 */}
    <Composition id="Ep10CoverA" component={EP10.CoverA} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep10Preview" component={signed("Ep10", EP10.Film)} durationInFrames={Math.ceil(EP10.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep10Final" component={signed("Ep10", EP10.Film)} durationInFrames={Math.ceil(EP10.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP11 film locked to VO 2026-11-24 */}
    <Composition id="Ep11Cover" component={EP11.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep11Preview" component={signed("Ep11", EP11.Film)} durationInFrames={Math.ceil(EP11.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep11Final" component={signed("Ep11", EP11.Film)} durationInFrames={Math.ceil(EP11.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP12 film locked to VO 2026-11-24 */}
    <Composition id="Ep12Cover" component={EP12.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep12Preview" component={signed("Ep12", EP12.Film)} durationInFrames={Math.ceil(EP12.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep12Final" component={signed("Ep12", EP12.Film)} durationInFrames={Math.ceil(EP12.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* EP13 film locked to VO 2026-11-24 */}
    <Composition id="Ep13Cover" component={EP13.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep13Preview" component={signed("Ep13", EP13.Film)} durationInFrames={Math.ceil(EP13.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep13Final" component={signed("Ep13", EP13.Film)} durationInFrames={Math.ceil(EP13.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
  </>
);
