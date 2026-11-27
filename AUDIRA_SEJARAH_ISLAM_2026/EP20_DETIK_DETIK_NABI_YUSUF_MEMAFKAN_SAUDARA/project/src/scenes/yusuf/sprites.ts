// EP20 sprite maps. Adab: every human is faceless — seen from behind, or facing the camera with
// the head fully wrapped (a hood colour block with a darker inner shadow, no eyes, no mouth).
// Nabi Muhammad ﷺ is never drawn. One map = one merged voxel mesh (pixel.tsx).

import type { SpriteMap } from "./pixel.tsx";
import { CAMEL_GOLD } from "./pixel.tsx";

// Yusuf: deep green robe with a gold sash, white wrap (court of Egypt).
const YUSUF = { t: "#F4EEDC", T: "#CFC3A2", r: "#23614A", R: "#174532", p: "#F2B935", s: "#3A2616" };
// Benyamin: pale sky robe.
const BENYAMIN = { t: "#F4EEDC", T: "#CFC3A2", r: "#6E93B8", R: "#4E7092", p: "#8CB0D2", s: "#3A2616" };
// Brothers: travel robes in five earth tones (hood h, hood shadow H).
const BRO_PALS = [
  { t: "#D9C9A6", T: "#AE9B74", r: "#7A5634", R: "#5C3E24", p: "#8E6C45", s: "#3A2616", h: "#2A1C12" },
  { t: "#E6DCC4", T: "#BCA986", r: "#8C2A26", R: "#5E1A18", p: "#A8443A", s: "#3A2616", h: "#2A1410" },
  { t: "#EDE2C8", T: "#BBA77F", r: "#4E5A6E", R: "#353F50", p: "#66748A", s: "#3A2616", h: "#1C2028" },
  { t: "#D8CBAA", T: "#A89670", r: "#9C7A3E", R: "#755A2A", p: "#B8944E", s: "#3A2616", h: "#2A2010" },
  { t: "#EFE6D2", T: "#CDBF9F", r: "#5E4A6E", R: "#43344F", p: "#7A6490", s: "#3A2616", h: "#1E1626" },
];
// Yaqub: elder in a dark indigo cloak, white wrap; the young Yusuf in cream.
const YAQUB = { t: "#F4EEDC", T: "#CFC3A2", r: "#2E3A66", R: "#1F2848", p: "#46558A", s: "#3A2616" };
const CHILD = { t: "#F4EEDC", T: "#CFC3A2", r: "#D8C49A", R: "#B09A70", p: "#E6D6B0", s: "#3A2616" };

const BACK_STAND = [
  "..ttt..",
  ".ttttt.",
  ".ttttt.",
  "..TTT..",
  ".rrrrr.",
  "rrRrRrr",
  "rrRpRrr",
  "rrRppRr",
  "rrrRrrr",
  ".rrRrr.",
  ".rrrrr.",
  ".rr.rr.",
  ".ss.ss.",
];
const BACK_A = [...BACK_STAND.slice(0, 11), ".rr.rr.", ".ss..s."];
const BACK_B = [...BACK_STAND.slice(0, 11), ".rr.rr.", ".s..ss."];

/** Facing the camera with the head fully hooded: hood rim t, deep hood shadow h, no face. */
const HOOD_FRONT = [
  "..ttt..",
  ".ttttt.",
  ".thhht.",
  ".thhht.",
  ".rTTTr.",
  "rrRrRrr",
  "rrRpRrr",
  "rrRppRr",
  "rrrRrrr",
  ".rrRrr.",
  ".rrrrr.",
  ".rr.rr.",
  ".ss.ss.",
];

/** Kneeling (bersimpuh) seen from behind: low, wide, head bowed. */
const KNEEL = [
  ".......",
  "..ttt..",
  ".ttttt.",
  ".rTTTr.",
  "rrrrrrr",
  "rrRpRrr",
  "rrRppRr",
  "rrrRrrr",
  "rrrrrrr",
  "sRrrrRs",
];

/** Seated on a throne seat, from behind: wide shoulders, no legs. */
const SEATED = [
  "..ttt..",
  ".ttttt.",
  ".ttttt.",
  "..TTT..",
  "prrrrrp",
  "rrRrRrr",
  "rrRpRrr",
  "rrRppRr",
  "rrrRrrr",
  "rrrrrrr",
];

/** Standing from behind with one arm out to the side (hand offered). */
const REACH = [
  "..ttt....",
  ".ttttt...",
  ".ttttt...",
  "..TTT....",
  ".rrrrrrrt",
  "rrRrRr...",
  "rrRpRr...",
  "rrRppRr..",
  "rrrRrrr..",
  ".rrRrr...",
  ".rrrrr...",
  ".rr.rr...",
  ".ss.ss...",
];

/** Runner in profile carrying the folded white shirt, wrapped head, no face. */
const RUN_A = [
  "...ttt.....",
  "..ttttt....",
  "..tttttWW..",
  "...TTTWWWW.",
  "..rrrrWWWW.",
  ".rrRrrr....",
  "rrRprr.....",
  ".rRpRr.....",
  ".rrRrr.....",
  "..rrrrr....",
  ".rr...rr...",
  "rr.....rr..",
  "s.......s..",
];
const RUN_B = [
  ...RUN_A.slice(0, 10),
  "...rrr.....",
  "...r.rr....",
  "...s..s....",
];

export const YUSUF_SEATED: SpriteMap = { pal: YUSUF, rows: SEATED };
export const YUSUF_STAND: SpriteMap = { pal: YUSUF, rows: BACK_STAND };
export const YUSUF_REACH: SpriteMap = { pal: YUSUF, rows: REACH };
/** Yusuf facing the camera, head fully hooded, one hand held out (the lifting-up gesture). */
export const YUSUF_FRONT_REACH: SpriteMap = {
  pal: { ...YUSUF, h: "#10261C" },
  rows: [
    "..ttt....",
    ".ttttt...",
    ".thhht...",
    ".thhht...",
    ".rTTTrrrt",
    "rrRrRr...",
    "rrRpRr...",
    "rrRppRr..",
    "rrrRrrr..",
    ".rrRrr...",
    ".rrrrr...",
    ".rr.rr...",
    ".ss.ss...",
  ],
};
export const BENYAMIN_STAND: SpriteMap = { pal: BENYAMIN, rows: BACK_STAND };
export const BENYAMIN_FRONT: SpriteMap = { pal: { ...BENYAMIN, h: "#1C2430" }, rows: HOOD_FRONT };

export const BRO_FRONT: SpriteMap[] = BRO_PALS.map((p) => ({ pal: p, rows: HOOD_FRONT }));
export const BRO_BACK: SpriteMap[] = BRO_PALS.map((p) => ({ pal: p, rows: BACK_STAND }));
export const BRO_WALK_A: SpriteMap[] = BRO_PALS.map((p) => ({ pal: p, rows: BACK_A }));
export const BRO_WALK_B: SpriteMap[] = BRO_PALS.map((p) => ({ pal: p, rows: BACK_B }));
export const BRO_KNEEL: SpriteMap[] = BRO_PALS.map((p) => ({ pal: p, rows: KNEEL }));

export const YAQUB_STAND: SpriteMap = { pal: YAQUB, rows: BACK_STAND };
/** The young Yusuf beside his father, from behind (smaller px). */
export const CHILD_STAND: SpriteMap = { pal: CHILD, rows: BACK_STAND };

export const RUNNER_A: SpriteMap = { pal: { ...BRO_PALS[0], W: "#F7F3EA" }, rows: RUN_A };
export const RUNNER_B: SpriteMap = { pal: { ...BRO_PALS[0], W: "#F7F3EA" }, rows: RUN_B };

/** Officer of the store from behind (red-brown, white wrap). */
export const OFFICER_BACK: SpriteMap = { pal: { ...YUSUF, r: "#8A3E22", R: "#5E2814", p: "#C9AE80" }, rows: BACK_STAND };

/** Camel loaded with grain sacks (profile, rider fully wrapped). */
export const CAMEL_GRAIN: SpriteMap = {
  pal: { ...CAMEL_GOLD.pal, g: "#E6D8B8", G: "#B9A57E", c: "#6B4A2E", C: "#4E331D" },
  rows: CAMEL_GOLD.rows,
};
