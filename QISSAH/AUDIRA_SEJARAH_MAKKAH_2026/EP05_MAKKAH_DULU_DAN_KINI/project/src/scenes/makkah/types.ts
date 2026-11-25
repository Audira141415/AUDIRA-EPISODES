import type React from "react";
import type { HubProps } from "./hub.tsx";
import type { SeaState, ZState } from "./sets.tsx";

export type V3 = [number, number, number];

/** Camera key anchored to a timeline time (vo.wav seconds). fov is authored for 9:16. */
export type Key = { t: number; pos: V3; tgt: V3; fov?: number };

export type CardPos = "tl" | "tr" | "bl" | "br" | "tc" | "ml" | "mr";
/** 2D data callout taken from the script / SOURCE_REGISTER. */
export type Callout = { a: number; b: number; kicker?: string; title: string; sub?: string; pos: CardPos; big?: boolean };
/** Two quote cards side by side, equal weight (neutral). */
export type QuotePair = { a: number; b: number; left: { who: string; text: string }; right: { who: string; text: string } };

export type ChapterDef = {
  id: string;
  card: { num: string; title: string; tag: string };
  keys: () => Key[];
  /** Hub (valley maquette) state at time t, for times inside this chapter's window. */
  hub: (t: number) => HubProps;
  /** Extra 3D for this chapter (labels, water, ropes...). Rendered while t is in the chapter window. */
  World?: React.FC<{ t: number }>;
  callouts?: () => Callout[];
  quotes?: () => QuotePair[];
  /** Side sets: mounted only while this returns a state. */
  sea?: (t: number) => SeaState;
  zub?: (t: number) => ZState;
  /** Light mood: 0 day, 1 dusk (chapter 7, end screen). */
  dusk?: (t: number) => number;
};
