import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Lookdev } from "./scenes/lookdev/Lookdev.tsx";
import { ChronicleFilm, chronicleMetadata } from "./film/ChronicleFilm.tsx";
import GENERATED from "./generated/plan.json";
import type { Plan } from "./director/types.ts";

const { preview, final } = PRESETS;

// Films are rendered by scripts/make.mjs with the plan as props; the default props are the last planned story
// (src/generated/plan.json) so the Studio opens on it. Lookdev = the silhouette cast with contours (npm run look:cast).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ChroniclePreview" component={ChronicleFilm} defaultProps={{ plan: GENERATED as unknown as Plan }} calculateMetadata={chronicleMetadata} durationInFrames={300} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ChronicleFinal" component={ChronicleFilm} defaultProps={{ plan: GENERATED as unknown as Plan }} calculateMetadata={chronicleMetadata} durationInFrames={600} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ChroniclePreviewWide" component={ChronicleFilm} defaultProps={{ plan: GENERATED as unknown as Plan }} calculateMetadata={chronicleMetadata} durationInFrames={300} fps={preview.fps} width={preview.height} height={preview.width} />
    <Composition id="ChronicleFinalWide" component={ChronicleFilm} defaultProps={{ plan: GENERATED as unknown as Plan }} calculateMetadata={chronicleMetadata} durationInFrames={600} fps={final.fps} width={final.height} height={final.width} />
    <Composition id="Lookdev" component={Lookdev} durationInFrames={4 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
  </>
);
