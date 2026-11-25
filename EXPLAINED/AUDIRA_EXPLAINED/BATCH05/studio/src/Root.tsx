import React from "react";
import { Composition, AbsoluteFill } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP056 from "./scenes/ep056/index.ts";
import * as EP057 from "./scenes/ep057/index.ts";
import * as EP058 from "./scenes/ep058/index.ts";
import * as EP059 from "./scenes/ep059/index.ts";
import * as EP062 from "./scenes/ep062/index.ts";

// AUDIRA EXPLAINED Batch 5: each episode lives in src/scenes/epXXX and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (topic cover / thumbnail). Preview 540x960 @ 30, final 1080x1920 @ 60.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = { Ep056: "ae-056-revolusi-industri", Ep057: "ae-057-bata-ringan", Ep058: "ae-058-gedung-dirobohkan", Ep059: "ae-059-pelabuhan-ombak-besar", Ep062: "ae-062-stadion-aman" };
// Film + moving AUDIRA signature as the last layer (anti-reupload, CLAUDE.md Branding Contract).
const signed = (name: string, Film: React.FC) => {
  const C: React.FC = () => (
    <AbsoluteFill>
      <Film />
      <AudiraSignature seed={SLUG[name]} outroSeconds={4.2} />
    </AbsoluteFill>
  );
  return C;
};
const EPS = [["Ep056", EP056], ["Ep057", EP057], ["Ep058", EP058], ["Ep059", EP059], ["Ep062", EP062]] as const;

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
