// Six moments of the Vice President's seat. Facts: research/RISET_JIKA_WAPRES_MUNDUR_2026-11-11.md
// (Hatta resigned 1 Dec 1956; seat empty until 1973; Habibie had no VP 1998-1999; MPR elected
// Hamzah Haz 26 Jul 2001; Gibran stated an intention to resign 10 Nov 2026, not a resignation).

import { mat } from "../../../core/materials/sweep.ts";
import type { EraLabel } from "../../../kits/timeforge/film/subject.ts";
import type { Chair } from "./params.ts";

const teak = mat("#7a4a26", { rough: 0.55, cc: 0.5, ccRough: 0.35 });
const velvet = mat("#7d1f22", { rough: 0.9, sheen: 0.9 });
const dusty = mat("#8f7f74", { rough: 0.95, sheen: 0.4 });
const walnut = mat("#5a3a24", { rough: 0.45, cc: 0.6, ccRough: 0.25 });
const mustard = mat("#a8742a", { rough: 0.85, sheen: 0.7 });
const black = mat("#1f2023", { rough: 0.35, metal: 0.9 });
const leather = mat("#232427", { rough: 0.5, cc: 0.35, ccRough: 0.4 });
const graphite = mat("#3a3d42", { rough: 0.3, metal: 1 });
const navy = mat("#1c2a48", { rough: 0.38, cc: 0.85, ccRough: 0.14, sheen: 0.2 });
const red = mat("#c4302b", { rough: 0.6 });
const amber = mat("#d99a1e", { rough: 0.55 });

const wood1945: Chair = {
  seat: { hw: 4.3, hh: 0.55, d: 7.6, rc: 0.4, reF: 0.3, reB: 0.3 },
  back: { hw: 4.0, hh: 4.7, d: 0.9, rc: 1.2, reF: 0.3, reB: 0.3, tilt: 6 },
  arm: { h: 3.0, w: 0.55, len: 6.6 },
  legs: { h: 5.0, r: 0.36, four: 1, ped: 0 },
  tape: { k: 0 },
  mats: { cushion: velvet, frame: teak, tape: red },
};
const empty1956: Chair = { ...wood1945, tape: { k: 1 }, mats: { cushion: dusty, frame: teak, tape: red } };
const orba1973: Chair = {
  seat: { hw: 4.7, hh: 0.8, d: 8.0, rc: 0.9, reF: 0.6, reB: 0.5 },
  back: { hw: 4.4, hh: 5.0, d: 1.3, rc: 1.6, reF: 0.6, reB: 0.4, tilt: 9 },
  arm: { h: 3.2, w: 1.1, len: 7.0 },
  legs: { h: 4.4, r: 0.48, four: 1, ped: 0 },
  tape: { k: 0 },
  mats: { cushion: mustard, frame: walnut, tape: red },
};
const empty1998: Chair = { ...orba1973, tape: { k: 1 }, mats: { cushion: dusty, frame: walnut, tape: red } };
const office2001: Chair = {
  seat: { hw: 4.5, hh: 0.85, d: 7.8, rc: 1.4, reF: 0.7, reB: 0.6 },
  back: { hw: 4.2, hh: 5.6, d: 1.2, rc: 2.2, reF: 0.6, reB: 0.5, tilt: 12 },
  arm: { h: 2.6, w: 0.7, len: 5.6 },
  legs: { h: 4.6, r: 0.4, four: 0, ped: 1 },
  tape: { k: 0 },
  mats: { cushion: leather, frame: black, tape: red },
};
const exec2026: Chair = {
  seat: { hw: 4.6, hh: 0.95, d: 8.0, rc: 1.8, reF: 0.85, reB: 0.7 },
  back: { hw: 4.3, hh: 6.2, d: 1.4, rc: 2.6, reF: 0.7, reB: 0.6, tilt: 10 },
  arm: { h: 2.8, w: 0.9, len: 6.0 },
  legs: { h: 4.8, r: 0.4, four: 0, ped: 1 },
  tape: { k: 0.55 },
  mats: { cushion: navy, frame: graphite, tape: amber },
};

export const ERAS = { e1945: wood1945, e1956: empty1956, e1973: orba1973, e1998: empty1998, e2001: office2001, e2026: exec2026 };
export const ERA_ORDER = ["e1945", "e1956", "e1973", "e1998", "e2001", "e2026"] as const;
export const ERA_LABEL: Record<(typeof ERA_ORDER)[number], EraLabel> = {
  e1945: { year: 1945, decade: false, tag: "HATTA · WAPRES PERTAMA" },
  e1956: { year: 1956, decade: false, tag: "HATTA MUNDUR · KOSONG" },
  e1973: { year: 1973, decade: false, tag: "KURSI TERISI LAGI" },
  e1998: { year: 1998, decade: false, tag: "HABIBIE NAIK · KOSONG" },
  e2001: { year: 2001, decade: false, tag: "HAMZAH HAZ · DIPILIH MPR" },
  e2026: { year: 2026, decade: false, tag: "GIBRAN · BARU NIAT MUNDUR" },
};
