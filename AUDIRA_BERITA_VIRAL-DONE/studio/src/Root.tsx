import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import { AudiraSignature } from "./brand/AudiraSignature.tsx";
import * as EP01 from "./scenes/ep01/index.ts";
import * as EP02 from "./scenes/ep02/index.ts";
import * as EP03 from "./scenes/ep03/index.ts";
import * as EP05 from "./scenes/ep05/index.ts";
import * as EP06 from "./scenes/ep06/index.ts";
import * as EP09 from "./scenes/ep09/index.ts";
import * as EP10 from "./scenes/ep10/index.ts";
import * as EpWapresBaru from "./scenes/ep_wapres_baru/index.ts";

// AUDIRA BERITA VIRAL 10 NOV 2026: each episode lives in src/scenes/epNN and exports Film, Cover, TOTAL_SECONDS.
// Cover = 1080x1920 still (approved 2026-11-10, do not change). Preview 540x960 @ 30, final 1080x1920 @ 60.
// TOTAL_SECONDS comes from the locked VO (timeline.json, 2026-11-11). Audio is muxed separately.
// The starter's full Root (all kit examples) is kept in Root.starter.tsx.txt.
const { preview, final } = PRESETS;
const SLUG: Record<string, string> = {
  Ep01: "berita-viral-01-gibran",
  Ep02: "berita-viral-02-pahlawan",
  Ep03: "berita-viral-03-siber",
  Ep05: "berita-viral-05-gta6",
  Ep06: "berita-viral-06-wapres-mundur",
  Ep09: "berita-viral-09-hak-pensiun-wapres",
  Ep10: "berita-viral-10-sejarah-wapres-mundur",
  EpWapresBaru: "explained-wapres-baru-5fakta",
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
const EPS = [["Ep01", EP01], ["Ep02", EP02], ["Ep03", EP03], ["Ep05", EP05], ["Ep06", EP06], ["Ep09", EP09], ["Ep10", EP10], ["EpWapresBaru", EpWapresBaru]] as const;

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
