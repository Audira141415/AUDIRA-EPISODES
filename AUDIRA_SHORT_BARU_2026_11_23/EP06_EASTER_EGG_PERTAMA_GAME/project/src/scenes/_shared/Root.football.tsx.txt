import React from "react";
import { AbsoluteFill, Composition, Sequence, useVideoConfig } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
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
import * as EP09 from "./scenes/ep09/index.ts";
import * as EP10 from "./scenes/ep10/index.ts";
import * as EP11 from "./scenes/ep11/index.ts";
import { Cover as Ep30CoverComp } from "./scenes/ep30/Cover.tsx";
import { Cover as Ep31CoverComp } from "./scenes/ep31/Cover.tsx";
import { Cover as Ep32CoverComp } from "./scenes/ep32/Cover.tsx";
import { Cover as Ep33Cover } from "./scenes/ep33/Cover.tsx";
import { Cover as Ep34Cover } from "./scenes/ep34/Cover.tsx";
import { Cover as Ep35Cover } from "./scenes/ep35/Cover.tsx";
import * as EP39 from "./scenes/ep39/index.ts";
import * as EP40 from "./scenes/ep40/index.ts";
import * as EP41 from "./scenes/ep41/index.ts";
import * as EP42 from "./scenes/ep42/index.ts";
import * as EP43 from "./scenes/ep43/index.ts";
import * as EP44 from "./scenes/ep44/index.ts";
import * as EP45 from "./scenes/ep45/index.ts";
import * as EP46 from "./scenes/ep46/index.ts";
import * as EP47 from "./scenes/ep47/index.ts";
import * as EP18 from "./scenes/ep18/index.ts";
import * as EP19 from "./scenes/ep19/index.ts";
import * as EP20 from "./scenes/ep20/index.ts";
import * as EP21 from "./scenes/ep21/index.ts";
import * as EP22 from "./scenes/ep22/index.ts";
import * as EP23 from "./scenes/ep23/index.ts";
import { Cover as Ep36Cover } from "./scenes/ep36/Cover.tsx";
import { Cover as Ep37Cover } from "./scenes/ep37/Cover.tsx";
import { Cover as Ep38Cover } from "./scenes/ep38/Cover.tsx";
import * as EP12 from "./scenes/ep12/index.ts";
import * as EP13 from "./scenes/ep13/index.ts";
import * as EP14 from "./scenes/ep14/index.ts";
import * as EP15 from "./scenes/ep15/index.ts";
import * as EP16 from "./scenes/ep16/index.ts";
import * as EP17 from "./scenes/ep17/index.ts";
import { Cover as Ep24Cover } from "./scenes/ep24/Cover.tsx";
import { Cover as Ep25Cover } from "./scenes/ep25/Cover.tsx";
import { Cover as Ep26Cover } from "./scenes/ep26/Cover.tsx";
import { Cover as Ep27Cover } from "./scenes/ep27/Cover.tsx";
import { Cover as Ep28Cover } from "./scenes/ep28/Cover.tsx";
import { Cover as Ep29Cover } from "./scenes/ep29/Cover.tsx";

// AUDIRA SEJARAH SEPAK BOLA 2026: each episode lives in src/scenes/epNN and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (approved 2026-11-11, do not change). Preview 540x960 @ 30, final 1080x1920 @ 60.
// TOTAL_SECONDS comes from the locked VO (timeline.json, 2026-11-11). Audio is muxed separately.
// The starter's full Root (all kit examples) is kept in Root.starter.tsx.txt.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = {
  Ep01: "sepakbola-EP01",
  Ep02: "sepakbola-EP02",
  Ep03: "sepakbola-EP03",
  Ep04: "sepakbola-EP04",
  Ep05: "sepakbola-EP05",
  Ep06: "sepakbola-EP06",
  Ep07: "sepakbola-EP07",
  Ep08: "sepakbola-EP08",
  Ep09: "sepakbola-EP09",
  Ep10: "sepakbola-EP10",
  Ep11: "sepakbola-EP11",
  Ep12: "sepakbola-EP12",
  Ep13: "sepakbola-EP13",
  Ep14: "sepakbola-EP14",
  Ep15: "sepakbola-EP15",
  Ep16: "sepakbola-EP16",
  Ep17: "sepakbola-EP17",
  Ep42: "sepakbola-EP42",
  Ep43: "sepakbola-EP43",
  Ep44: "sepakbola-EP44",
  Ep45: "sepakbola-EP45",
  Ep47: "sepakbola-EP47",
  Ep46: "sepakbola-EP46",
};
// Film + moving AUDIRA signature as the last layer (anti-reupload, Branding Contract).
// The signature starts at 3 s: frames 0-3 s are the approved cover (kicker at y~196), which the signature would overlap.
const SIGNATURE_START = 3;
// Closing card length: films hold ~4 s after the last word (timeline total = voEnd + 4).
const OUTRO_SECONDS = 3.8;
const signed = (name: string, Film: React.FC) => {
  const C: React.FC = () => {
    const { fps } = useVideoConfig();
    return (
      <AbsoluteFill>
        <Film />
        <AudiraOutro seconds={OUTRO_SECONDS} />
        <Sequence from={Math.round(SIGNATURE_START * fps)}>
          <AudiraSignature seed={SLUG[name]} outroSeconds={OUTRO_SECONDS + SIGNATURE_START} /* frame inside the Sequence is 3 s behind */ />
        </Sequence>
      </AbsoluteFill>
    );
  };
  return C;
};
// Batch 2 (EP06-10) VO locked 2026-11-12.
const EPS = [["Ep01", EP01], ["Ep02", EP02], ["Ep03", EP03], ["Ep04", EP04], ["Ep05", EP05],
  ["Ep06", EP06], ["Ep07", EP07], ["Ep08", EP08], ["Ep09", EP09], ["Ep10", EP10], ["Ep11", EP11],
  ["Ep12", EP12], ["Ep13", EP13], ["Ep14", EP14], ["Ep15", EP15], ["Ep16", EP16], ["Ep17", EP17], ["Ep47", EP47], ["Ep45", EP45]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Ep30Cover" component={Ep30CoverComp} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep31Cover" component={Ep31CoverComp} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep32Cover" component={Ep32CoverComp} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="PeopleDemoPreview" component={PeopleDemo} durationInFrames={PEOPLE_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {/* EP12–17 now in EPS array (Film + Cover + Preview + Final) */}
    {/* EP33–35 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep33Cover" component={Ep33Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep34Cover" component={Ep34Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep35Cover" component={Ep35Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP24–26 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep24Cover" component={Ep24Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep25Cover" component={Ep25Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep26Cover" component={Ep26Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP27–29 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep27Cover" component={Ep27Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep28Cover" component={Ep28Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep29Cover" component={Ep29Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP18–20 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep18Cover" component={EP18.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep19Cover" component={EP19.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep20Cover" component={EP20.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP21–23 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep21Cover" component={EP21.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep22Cover" component={EP22.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep23Cover" component={EP23.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP36–38 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep36Cover" component={Ep36Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep37Cover" component={Ep37Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep38Cover" component={Ep38Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* EP42–44 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep42Cover" component={EP42.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep43Cover" component={EP43.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep44Cover" component={EP44.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {/* Ep45Cover/Preview/Final come from EPS (Film locked to VO 2026-11-22) */}
    <Composition id="Ep46Cover" component={EP46.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep46Film" component={signed("Ep46", EP46.Film)} durationInFrames={Math.ceil(EP46.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
    {/* Ep47Cover/Preview/Final come from EPS (Film locked to VO 2026-11-22) */}
    {/* EP39–41 cover-only compositions (Film/VO not yet produced) */}
    <Composition id="Ep39Cover" component={EP39.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep40Cover" component={EP40.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Ep41Cover" component={EP41.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Cover`} component={m.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
        <Composition id={`${name}Preview`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
