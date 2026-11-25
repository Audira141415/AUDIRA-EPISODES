import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import * as E2 from "./scenes/ijazah/Ep02Vintage.tsx";
import * as E3 from "./scenes/ijazah/Ep03Draft.tsx";
import * as E4 from "./scenes/ijazah/Ep04Brutal.tsx";

// Each film is registered as <id>Preview (540×960@30) and <id>Final (1080×1920@60).
const { preview, final } = PRESETS;
const FILMS = [["E02", E2], ["E03", E3], ["E04", E4]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {FILMS.map(([id, m]) => (
      <React.Fragment key={id}>
        <Composition id={`${id}Preview`} component={m.Film} durationInFrames={Math.round(m.SECONDS * preview.fps)} fps={preview.fps} width={preview.width} height={preview.height} />
        <Composition id={`${id}Final`} component={m.Film} durationInFrames={Math.round(m.SECONDS * final.fps)} fps={final.fps} width={final.width} height={final.height} />
      </React.Fragment>
    ))}
  </>
);
