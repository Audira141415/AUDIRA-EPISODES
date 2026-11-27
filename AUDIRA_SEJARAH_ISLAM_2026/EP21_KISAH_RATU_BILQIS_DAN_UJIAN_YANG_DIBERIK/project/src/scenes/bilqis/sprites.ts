// EP21 sprite maps (Ratu Bilqis). Adab: every human is faceless — seen from behind, or facing the
// camera with the head fully wrapped (hood block with a dark inner shadow, no eyes, no mouth).
// Bilqis's robe always reaches the ground; when she lifts the hem only the shoes show (no calf).
// Nabi Sulaiman is drawn only small and from behind. Jinn are never drawn. One map = one voxel mesh.

import type { SpriteMap } from "./pixel.tsx";
import { CAMEL_GOLD } from "./pixel.tsx";

// Bilqis: wine-red robe, cream veil, small gold crown (c), gold trim (p).
const BILQIS = { c: "#F5C542", t: "#EFE4CC", T: "#C9B48E", r: "#8A2440", R: "#5E1830", p: "#F2B935", s: "#3A2616", k: "#5E1830", h: "#2A0E16" };

const B_BACK = [
  "..c.c..",
  "..ccc..",
  ".ttttt.",
  ".ttttt.",
  ".tTTTt.",
  "trrrrrt",
  "rrRrRrr",
  "rrRpRrr",
  "rrRrRrr",
  "rrrRrrr",
  "rrrRrrr",
  "rrrrrrr",
  "rrrrrrr",
  "RRRRRRR",
];

/** Lifting the hem with both hands at the sides: the hem rises one row, only the shoes show. */
const B_LIFT = [
  "...c.c...",
  "...ccc...",
  "..ttttt..",
  "..ttttt..",
  "..tTTTt..",
  ".trrrrrt.",
  ".rrRrRrr.",
  ".rrRpRrr.",
  "krrRrRrrk",
  "krrrRrrrk",
  ".rrrRrrr.",
  ".RRRRRRR.",
  "..s...s..",
];

/** Both hands raised (doa), from behind. */
const B_DUA = [
  "k.......k",
  "k..c.c..k",
  "kr.ccc.rk",
  ".rtttttr.",
  "..ttttt..",
  "..tTTTt..",
  ".trrrrrt.",
  ".rrRrRrr.",
  ".rrRpRrr.",
  ".rrrRrrr.",
  ".rrrRrrr.",
  ".rrrrrrr.",
  ".RRRRRRR.",
];

/** Seated on the council seat, facing the camera, head fully veiled (no face). */
const B_SEAT_FRONT = [
  "..c.c..",
  "..ccc..",
  ".ttttt.",
  ".thhht.",
  ".thhht.",
  "trTTTrt",
  "rrRpRrr",
  "rrRpRrr",
  "rrrRrrr",
  "rrrrrrr",
];

export const BILQIS_BACK: SpriteMap = { pal: BILQIS, rows: B_BACK };
export const BILQIS_WALK_A: SpriteMap = { pal: BILQIS, rows: [...B_BACK.slice(0, 13), "RRRRRR."] };
export const BILQIS_WALK_B: SpriteMap = { pal: BILQIS, rows: [...B_BACK.slice(0, 13), ".RRRRRR"] };
export const BILQIS_LIFT: SpriteMap = { pal: BILQIS, rows: B_LIFT };
export const BILQIS_DUA: SpriteMap = { pal: BILQIS, rows: B_DUA };
export const BILQIS_SEAT: SpriteMap = { pal: BILQIS, rows: B_SEAT_FRONT };

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

/** Nabi Sulaiman: only small and from behind (deep green robe, white wrap). */
export const SULAIMAN_BACK: SpriteMap = { pal: { t: "#F4EEDC", T: "#CFC3A2", r: "#2C5A3E", R: "#1D3E2A", p: "#F2B935", s: "#3A2616" }, rows: BACK_STAND };

// Saba nobles: rich robes, hooded front (no face).
const NOBLE_PALS = [
  { t: "#E6DCC4", T: "#BCA986", r: "#8C5A26", R: "#5E3A18", p: "#F2B935", s: "#3A2616", h: "#2A1A10" },
  { t: "#EDE2C8", T: "#BBA77F", r: "#3E5A7A", R: "#2A3E56", p: "#F2B935", s: "#3A2616", h: "#141C28" },
  { t: "#D9C9A6", T: "#AE9B74", r: "#6E3A5E", R: "#4A2640", p: "#E0A84A", s: "#3A2616", h: "#22101C" },
  { t: "#EFE6D2", T: "#CDBF9F", r: "#4E6A3A", R: "#344A26", p: "#E0A84A", s: "#3A2616", h: "#16200F" },
];
export const NOBLE_FRONT: SpriteMap[] = NOBLE_PALS.map((p) => ({ pal: p, rows: HOOD_FRONT }));
/** Sun worshippers of Saba seen from behind (small crowd). */
export const SABA_BACK: SpriteMap[] = NOBLE_PALS.map((p) => ({ pal: p, rows: BACK_STAND }));

// Birds in profile (facing +x). Animals may keep an eye pixel; they are not people.
const BIRD_ROWS = [
  ".....bb..",
  "....bbbk.",
  "bb.bbbb..",
  ".bbbbBb..",
  "..bBBb...",
  "...l.l...",
];
export const PIGEON: SpriteMap = { pal: { b: "#9AA0AC", B: "#666C78", k: "#E0A040", l: "#C07A40" }, rows: BIRD_ROWS };
export const CROW: SpriteMap = { pal: { b: "#2A2A30", B: "#16161A", k: "#B08A50", l: "#5A4A3A" }, rows: BIRD_ROWS };
export const HAWK: SpriteMap = { pal: { b: "#9A6A3E", B: "#6A4426", k: "#E8C040", l: "#E8C040" }, rows: BIRD_ROWS };
/** Hud-hud (hoopoe): orange crest, cinnamon body, black-and-white barred wings. */
export const HUDHUD: SpriteMap = {
  pal: { o: "#FF8A2A", b: "#D08A55", k: "#3A2A1A", w: "#1A1A1A", W: "#F1E8D4", l: "#8A6A4A" },
  rows: [
    "....o.o..",
    ".....oo..",
    ".....bbkk",
    "Ww.bbbb..",
    ".WwWwbb..",
    "..wWwb...",
    "...l.l...",
  ],
};
/** Hud-hud in flight (wings up). */
export const HUDHUD_FLY: SpriteMap = {
  pal: HUDHUD.pal,
  rows: [
    "..WwW....",
    "...wWw.o.",
    "....wW.oo",
    "....bbbkk",
    "..bbbbb..",
    "ww.bb....",
  ],
};

/** Small fish in profile (under the glass). */
const FISH_ROWS = ["F.fff..", "FFfffff", "F.fff.."];
export const FISH_ORANGE: SpriteMap = { pal: { f: "#FF8A3A", F: "#C8501E" }, rows: FISH_ROWS };
export const FISH_SILVER: SpriteMap = { pal: { f: "#D8E2EA", F: "#8A9AAA" }, rows: FISH_ROWS };

/** Camel of the gift caravan (rider fully wrapped). */
export const CAMEL_GIFT: SpriteMap = CAMEL_GOLD;
