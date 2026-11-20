// EP67 — Borobudur sand sculpture PARTS.
// Tiered pyramid evocative of a Southeast Asian stupa monument:
// 6 square tiers (Rupadhatu), 3 round tiers (Arupadhatu), main stupa, ring stupas.
// Shapes are original sand-sculpture forms — not an exact replica.

import { type Part, SURF } from "../../kits/pasirforge/lib/sculpture.ts";

export const BPARTS: Part[] = [
  // Plinth base — AUDIRA carved in front face (z = 2.0)
  { name: "plinth",  kind: "box", c: [0, 0.1,   0], h: [2.0,  0.1,  2.0],  surf: SURF.plinth, soft: 0.55 },

  // 6 square tiers — Rupadhatu
  { name: "sq1",     kind: "box", c: [0, 0.375, 0], h: [1.9,  0.175, 1.9], surf: SURF.pillar, soft: 0.70 },
  { name: "sq2",     kind: "box", c: [0, 0.725, 0], h: [1.65, 0.175, 1.65],surf: SURF.pillar, soft: 0.75 },
  { name: "sq3",     kind: "box", c: [0, 1.05,  0], h: [1.4,  0.15,  1.4], surf: SURF.pillar, soft: 0.80 },
  { name: "sq4",     kind: "box", c: [0, 1.35,  0], h: [1.15, 0.15,  1.15],surf: SURF.pillar, soft: 0.85 },
  { name: "sq5",     kind: "box", c: [0, 1.625, 0], h: [0.9,  0.125, 0.9], surf: SURF.plain,  soft: 0.90 },
  { name: "sq6",     kind: "box", c: [0, 1.875, 0], h: [0.7,  0.125, 0.7], surf: SURF.plain,  soft: 0.95 },

  // 3 round tiers — Arupadhatu (ellipsoid, slightly flattened)
  { name: "rnd1",    kind: "ell", c: [0, 2.12,  0], h: [0.6,  0.12,  0.6], surf: SURF.plain,  soft: 1.0  },
  { name: "rnd2",    kind: "ell", c: [0, 2.37,  0], h: [0.44, 0.10,  0.44],surf: SURF.plain,  soft: 1.05 },
  { name: "rnd3",    kind: "ell", c: [0, 2.57,  0], h: [0.3,  0.09,  0.3], surf: SURF.plain,  soft: 1.10 },

  // Main stupa (bell-shaped ellipsoid)
  { name: "stupa-m", kind: "ell", c: [0, 2.76,  0], h: [0.19, 0.38,  0.19],surf: SURF.skin,   soft: 1.20 },

  // 4 ring stupas on rnd1 (cardinal directions)
  { name: "stupa-N", kind: "ell", c: [0,     2.13,  0.52], h: [0.07, 0.13, 0.07], surf: SURF.skin, soft: 1.3 },
  { name: "stupa-S", kind: "ell", c: [0,     2.13, -0.52], h: [0.07, 0.13, 0.07], surf: SURF.skin, soft: 1.3 },
  { name: "stupa-E", kind: "ell", c: [0.52,  2.13,  0],    h: [0.07, 0.13, 0.07], surf: SURF.skin, soft: 1.3 },
  { name: "stupa-W", kind: "ell", c: [-0.52, 2.13,  0],    h: [0.07, 0.13, 0.07], surf: SURF.skin, soft: 1.3 },

  // 4 ring stupas on rnd2
  { name: "stupa2-N", kind: "ell", c: [0,     2.38,  0.38], h: [0.06, 0.11, 0.06], surf: SURF.skin, soft: 1.35 },
  { name: "stupa2-S", kind: "ell", c: [0,     2.38, -0.38], h: [0.06, 0.11, 0.06], surf: SURF.skin, soft: 1.35 },
  { name: "stupa2-E", kind: "ell", c: [0.38,  2.38,  0],    h: [0.06, 0.11, 0.06], surf: SURF.skin, soft: 1.35 },
  { name: "stupa2-W", kind: "ell", c: [-0.38, 2.38,  0],    h: [0.06, 0.11, 0.06], surf: SURF.skin, soft: 1.35 },
];

/** Where "AUDIRA" is carved on the plinth front face. z = 2.0 (front of plinth). */
export const BNAME_RECT = { x0: -1.4, x1: 1.4, y0: 0.0, y1: 0.2, z: 2.0 };
