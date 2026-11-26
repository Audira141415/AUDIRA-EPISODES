// EP17 sprite maps. Adab: every human is faceless — seen from behind, in a wrapped side profile
// with no facial pixels, or as a shrouded shape. One map = one merged voxel mesh (pixel.tsx).

import type { SpriteMap } from "./pixel.tsx";
import { CAMEL_GOLD } from "./pixel.tsx";

// Umar: plain patched brown robe, cream head wrap.
const UMAR = { t: "#EDE2C8", T: "#BBA77F", r: "#6B4A2E", R: "#4E331D", p: "#8E6C45", s: "#3A2616" };
// Aslam: indigo robe, white wrap.
const ASLAM = { t: "#F4EEDC", T: "#CFC3A2", r: "#2E4C7A", R: "#1F3558", p: "#3B5C8C", s: "#3A2616" };

const BACK_A = [
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
  ".ss..s.",
];
const BACK_B = [...BACK_A.slice(0, 11), ".rr.rr.", ".s..ss."];
const BACK_STAND = [...BACK_A.slice(0, 11), ".rr.rr.", ".ss.ss."];

export const UMAR_WALK_A: SpriteMap = { pal: UMAR, rows: BACK_A };
export const UMAR_WALK_B: SpriteMap = { pal: UMAR, rows: BACK_B };
export const UMAR_STAND: SpriteMap = { pal: UMAR, rows: BACK_STAND };
export const ASLAM_WALK_A: SpriteMap = { pal: ASLAM, rows: BACK_A };
export const ASLAM_WALK_B: SpriteMap = { pal: ASLAM, rows: BACK_B };
export const ASLAM_STAND: SpriteMap = { pal: ASLAM, rows: BACK_STAND };

/** Umar with bowed head and hand raised to the face, from behind (the weeping beat). */
export const UMAR_BOWED: SpriteMap = {
  pal: UMAR,
  rows: [
    ".......",
    "..ttt..",
    ".ttttt.",
    ".tttttr",
    "rrTTTrr",
    "rrRrRr.",
    "rrRpRr.",
    "rrRppRr",
    "rrrRrrr",
    ".rrRrr.",
    ".rrrrr.",
    ".rr.rr.",
    ".ss.ss.",
  ],
};

/** Mother seated on the ground, from behind: dark head cover, wide robe. */
export const MOTHER_SEATED: SpriteMap = {
  pal: { h: "#6E5C7E", H: "#4E3F5C", r: "#8E6A86", R: "#6A4C66", s: "#3A2616" },
  rows: [
    "...hhh...",
    "..hhhhh..",
    "..hhhhh..",
    ".hhHhHhh.",
    ".hhhhhhh.",
    "rrrRrRrrr",
    "rrRrrrRrr",
    "rrrRrRrrr",
    "rrrrrrrrr",
  ],
};

/** Child seated, from behind, holding a bowl up (eating beat). */
export const CHILD_SEATED: SpriteMap = {
  pal: { t: "#D9C9A6", T: "#AE9B74", r: "#8C5A3A", R: "#6A4128", b: "#B98552" },
  rows: [
    "..ttt..",
    ".ttttt.",
    "b.TTT.b",
    "brrrrrb",
    ".rRrRr.",
    "rrrrrrr",
  ],
};

/** Umar bent forward carrying a flour sack on his back (side profile, wrapped head, no face). */
export const UMAR_CARRY: SpriteMap = {
  pal: { ...UMAR, k: "#E8DCC0", K: "#BCA986", n: "#7A5E3C" },
  rows: [
    "...kkkkk....",
    "..kkkkkkk...",
    ".kkkkkkkkk..",
    ".kkkkkkkkk..",
    "..KKKKKKK...",
    "...nrrrrtt..",
    "..rrRrrrttt.",
    "..rrRprrTt..",
    "..rrRprr....",
    "..rrrRrr....",
    "...rrrrr....",
    "...rr.rr....",
    "...s...s....",
  ],
};

/** Umar crouched at the fire, from behind (blowing on the fire). */
export const UMAR_CROUCH: SpriteMap = {
  pal: UMAR,
  rows: [
    "..ttt..",
    ".ttttt.",
    ".tTTTt.",
    "rrrrrrr",
    "rrRpRrr",
    "rrRppRr",
    "rrrRrrr",
    "rrrrrrr",
  ],
};

/** A figure lying under a cover, head wrapped, seen from the side: a shrouded shape, no face. */
export const LYING: SpriteMap = {
  pal: { t: "#EDE2C8", T: "#BBA77F", c: "#7C5A3A", C: "#5C4028" },
  rows: [
    "..cccccccccccccc..",
    ".cccCcccCcccCccctt",
    "cccccccccccccccTtt",
    "CCCCCCCCCCCCCCCCTT",
  ],
};

/** Worshipper seated in a row, from behind. Three robe colours for variety. */
const SIT = [
  "..ttt..",
  ".ttttt.",
  ".ttttt.",
  ".rrrrr.",
  "rrrRrrr",
  "rrrRrrr",
  "rrrrrrr",
  "RrrrrrR",
];
export const SIT_WHITE: SpriteMap = { pal: { t: "#F4EEDC", T: "#CFC3A2", r: "#E9E0CC", R: "#C4B597" }, rows: SIT };
export const SIT_BROWN: SpriteMap = { pal: { t: "#EDE2C8", T: "#BBA77F", r: "#7A5634", R: "#5C3E24" }, rows: SIT };
export const SIT_INDIGO: SpriteMap = { pal: { t: "#F4EEDC", T: "#CFC3A2", r: "#33507E", R: "#22385A" }, rows: SIT };
/** Umar standing at the front as imam, from behind. */
export const IMAM: SpriteMap = { pal: UMAR, rows: BACK_STAND };

/** Camel carrying flour sacks (profile, rider fully wrapped). */
export const CAMEL_FLOUR: SpriteMap = {
  pal: { ...CAMEL_GOLD.pal, g: "#E6D8B8", G: "#B9A57E", c: "#6B4A2E", C: "#4E331D" },
  rows: CAMEL_GOLD.rows,
};
