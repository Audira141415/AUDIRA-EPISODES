export {
  BEAT_NAMES,
  type BeatName,
  type BeatTiming,
  type Beats,
  type BeatProps,
  type BeatContent,
  type FilmConfig,
} from "./types.ts";
export { DEFAULT_MOVES, DEFAULT_LENS, quickBeats } from "./defaults.ts";
export { FilmFromConfig } from "./FilmFromConfig.tsx";

// Re-export camera moves so episodes import from one place.
export {
  hold,
  pushIn,
  pullOut,
  orbit,
  crane,
  truck,
  lookAt,
  frame,
  reveal,
  dollyZoom,
  dutch,
  settle,
  framingFrom,
  coverPose,
  fitDistance,
  shotPlan,
  cameraAt,
  type Framing,
} from "../core/camera/moves.ts";
