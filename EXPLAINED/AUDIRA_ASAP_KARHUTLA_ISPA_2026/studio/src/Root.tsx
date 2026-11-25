import React from "react";
import { Composition, AbsoluteFill } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP01 from "./scenes/ep01/index.ts";
import * as EP02 from "./scenes/ep02/index.ts";
import * as EP03 from "./scenes/ep03/index.ts";
import * as EP04 from "./scenes/ep04/index.ts";
import * as EP05 from "./scenes/ep05/index.ts";

// AUDIRA ASAP KARHUTLA ISPA 2026: each episode lives in src/scenes/epNN and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
// The starter's full Root (all kit examples) is kept in Root.starter.tsx.txt.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = {
  Ep01: "asap-ispa-01-mimika",
  Ep02: "asap-ispa-02-papua-selatan",
  Ep03: "asap-ispa-03-papua-tengah",
  Ep04: "asap-ispa-04-balita",
  Ep05: "asap-ispa-05-lintas-negara",
};
// Film + moving AUDIRA signature as the last layer (anti-reupload, Branding Contract).
const signed = (name: string, Film: React.FC) => {
  const C: React.FC = () => (
    <AbsoluteFill>
      <Film />
      <AudiraSignature seed={SLUG[name]} outroSeconds={4.2} />
    </AbsoluteFill>
  );
  return C;
};
const EPS = [["Ep01", EP01], ["Ep02", EP02], ["Ep03", EP03], ["Ep04", EP04], ["Ep05", EP05]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PeopleDemoPreview" component={PeopleDemo} durationInFrames={PEOPLE_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Cover`} component={m.Cover} durationInFrames={30} fps={30} width={1080} height={1920} />
        <Composition id={`${name}Preview`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={signed(name, m.Film)} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
