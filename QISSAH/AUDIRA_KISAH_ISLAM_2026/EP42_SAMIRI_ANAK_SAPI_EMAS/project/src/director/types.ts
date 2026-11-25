// Shared plan types (pure TS: imported by node scripts and by the Remotion bundle).

export type Word = { w: string; t: number; key?: boolean };

export type CostumeSpec = {
  body?: "m" | "f";
  hat?: "none" | "peci" | "destar" | "caping" | "shako" | "bicorne" | "tricorne" | "turban" | "bun" | "hair" | "blangkon";
  wear?: "pants" | "sarong" | "kain" | "robe" | "coat";
  itemR?: "musket" | "spear" | "telescope" | "torch" | "keris" | "flag" | "paddle" | "none";
  itemL?: "musket" | "spear" | "telescope" | "torch" | "keris" | "flag" | "paddle" | "none";
  load?: "back" | "head" | "none";
  keris?: boolean;
  scale?: number;
  headScale?: number;
};

export type Action =
  | "stand" | "akimbo" | "point" | "telescope" | "pray" | "kneel" | "bow" | "sit" | "write" | "run" | "walk"
  | "guard" | "raise" | "talk" | "look" | "march" | "carry";

export type Group = {
  count: number;
  name: string; // display / role word
  costume: CostumeSpec;
  action: Action;
  color: string | null;
  lead: boolean;
};

export type SetId = "makam" | "balai" | "kamar" | "hutan" | "desa" | "benteng" | "pelabuhan" | "dek" | "medan" | "pantai" | "gurun" | "thur" | "tungku" | "laut";
export type MoodId = "senja" | "biru" | "malam" | "pagi" | "siang" | "api" | "dalam-siang" | "dalam-malam";

export type Shot = "wide" | "medium" | "close" | "group" | "low";
export type Beat = { a: number; b: number; shot: Shot };

export type MapPoint = { name: string; lon: number; lat: number; volcano?: boolean };

export type Overlay =
  | { kind: "date"; a: number; b: number; top: string; big: string }
  | { kind: "name"; a: number; b: number; name: string; role?: string }
  | { kind: "count"; a: number; b: number; from: number; to: number; roll: [number, number]; unit: string; label?: string }
  | { kind: "cite"; a: number; b: number; text: string; src: string }
  | { kind: "end"; a: number; b: number; title: string; sources: string[] };

export type PlanScene = {
  a: number;
  b: number;
  kind: "map" | "place" | "end";
  map?: { points: MapPoint[]; route: boolean; rings: boolean; erupt: boolean; mode: "close" | "fit" | "route"; region?: Region };
  place?: { extras?: string[]; set: SetId; mood: MoodId; fire: boolean; rain: boolean; fog: boolean; candle: boolean; volcano: boolean; groups: Group[]; beats: Beat[]; seed: number };
  overlays: Overlay[];
};

export type Region = { lon0: number; lon1: number; lat0: number; lat1: number; cell: number; key: string };

export type Plan = {
  id: string;
  title: string;
  series?: string;
  duration: number;
  year: number | null;
  region: Region | null;
  scenes: PlanScene[];
  words: Word[];
  audio?: string; // public/ path of the voice-over / mix
  warnings: string[];
};
