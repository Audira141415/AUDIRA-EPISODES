import type React from "react";
import type { Framing, Move } from "../core/camera/moves.ts";
import type { HdriName } from "../core/render/Finish.tsx";
import type { ColorGradeProfile } from "../core/render/FinishingPresets.ts";

export const BEAT_NAMES = ["hook", "context", "main", "explanation", "payoff", "outro"] as const;
export type BeatName = (typeof BEAT_NAMES)[number];

export type BeatTiming = { start: number; end: number };
export type Beats = Record<BeatName, BeatTiming>;

export type BeatProps = {
  /** 0→1 progress through this beat. */
  progress: number;
  /** Seconds since beat start. */
  elapsed: number;
  /** Beat duration in seconds. */
  duration: number;
  /** Global time in seconds. */
  t: number;
  /** Current Remotion frame. */
  frame: number;
  fps: number;
};

/** Scene content: receives pre-computed beat timing, returns 3D objects. */
export type BeatContent = React.FC<BeatProps>;

export type FilmConfig = {
  /** Beat timings (from VO analysis or quickBeats). */
  beats: Beats;
  /** Camera start framing (use cover pose so frame 0 = thumbnail). */
  startFraming: Framing;
  /** Override default camera moves per beat. */
  shots?: Partial<Record<BeatName, { at?: number; move: Move }[]>>;
  /** 3D content per beat — the only part that changes per episode. */
  scenes: Record<BeatName, BeatContent>;
  background?: string;
  hdri?: HdriName;
  exposure?: number;
  envIntensity?: number;
  profile?: ColorGradeProfile;
  ao?: boolean;
  /** 2D overlay (HUD, captions). Rendered on top of the 3D scene. */
  overlay?: (scale: number, beat: BeatName, props: BeatProps) => React.ReactNode;
  /** Fade in/out durations in seconds. */
  fade?: { in?: number; out?: number; color?: string };
  /** Camera alive drift so held shots still breathe. Default true. */
  alive?: boolean | { deg?: number; breath?: number; seed?: number };
  /** Lens overrides. */
  lens?: { aperture?: number; maxBlur?: number; exposure?: number };
};
