import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import * as EP07 from "./scenes/ep07/index.ts";
import * as EP08 from "./scenes/ep08/index.ts";
import * as EP09 from "./scenes/ep09/index.ts";
import * as EP10 from "./scenes/ep10/index.ts";
import * as EP11 from "./scenes/ep11/index.ts";

// Cerita Hikmah season 2: LANDSCAPE 16:9 for regular YouTube video (not Shorts).
// Preview 960x540 @ 30 for drafts, final 1920x1080 @ 30 (rule 09: long 16:9 is 30 fps, half the frames of 60).
// Films read time as frame / fps, so the fps change does not move any timing.
// Each episode: src/scenes/epXX exports Film + TOTAL_SECONDS.
export const LANDSCAPE = { preview: { width: 960, height: 540, fps: 30 }, final: { width: 1920, height: 1080, fps: 30 } } as const;
const { preview, final } = LANDSCAPE;
const EPS = [["Ep07", EP07], ["Ep08", EP08], ["Ep09", EP09], ["Ep10", EP10], ["Ep11", EP11]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {/* vertical demo of core/polish ToyPerson, kept as a reference for character building */}
    <Composition id="PeopleDemoPreview" component={PeopleDemo} durationInFrames={PEOPLE_DEMO_SECONDS * PRESETS.preview.fps} fps={PRESETS.preview.fps} width={PRESETS.preview.width} height={PRESETS.preview.height} />
    {EPS.map(([name, m]) => (
      <React.Fragment key={name}>
        <Composition id={`${name}Preview`} component={m.Film} durationInFrames={Math.ceil(m.TOTAL_SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${name}Final`} component={m.Film} durationInFrames={Math.ceil(m.TOTAL_SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
