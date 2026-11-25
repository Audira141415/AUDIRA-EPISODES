// EP03: every animated value of the film as a function of the voice clock t (seconds of vo.wav).
// All anchors are words of the locked voice (time.ts `at`).

import { at, prog, smooth, easeIO, easeOut, window01, OUTRO_AT } from "./time.ts";
import { ROOM_MIN_SCALE } from "./layout.ts";

export type FilmState = {
  light: [number, number, number];
  flame: [number, number, number];
  hand: number; // 0 = away, 1 = covering candle 2 (index 1)
  cut: number; // cutaway: ceiling off, outside visible
  inBeams: number; // candle -> hole beams
  straight: number; // "segaris lurus" guide lines
  dim: number; // 1 = normal room fill, lower = darker room
  lamp: number; // hanging lamp over the model table
  eyeOut: number;
  eyeCross: number;
  eyeIn: number;
  route1: number; // Basrah -> Kairo
  route2: number; // Kairo -> Aswan along the Nile
  routeVis: number;
  dam: number; // proposed dam line glow
  damBreak: number;
  walk: number; // caravan walk progress
  bar: number; // door bar slides shut
  winLight: number;
  books: number; // 0..7 volumes on the shelf
  frontOpen: number; // front wall + door hidden (payoff, camera outside)
  shell: number; // exterior box visible
  shrink: number; // 0..1 room scales into the lens
  scale: number;
  phone: number; // phone rises into place
  outro: number;
  wallLamp: number; // oil lamp on the left wall, lit from the door beat, snuffed on "gelap"
  shutterGlow: number; // soft warm light on the pinhole plate through the dark beat
  moon: number; // window-lattice moonlight (dimmed while the model table is the subject)
};

export function filmState(t: number): FilmState {
  // explanation: darkness, then the candles are lit one by one
  const dark0 = at("gelap");
  const lit = (k: number) => smooth(prog(t, at("lilin") + k * 0.5 - 0.15, at("lilin") + k * 0.5 + 0.35));
  const off = 1 - smooth(prog(t, dark0, dark0 + 0.5));
  // the room never goes fully black: a dim ember of the image stays until the candles are lit
  const candle = (k: number) => (t < dark0 + 0.5 ? 0.3 + 0.7 * off : Math.max(0.3 * (1 - lit(k)), lit(k)));
  // the hand covers the middle candle
  const tutup = at("tutup"), hilang = at("hilang"), buka = at("buka"), kembali = at("kembali");
  const handIn = easeOut(prog(t, tutup + 0.05, hilang - 0.35));
  const handOut = smooth(prog(t, buka + 0.15, kembali - 0.05));
  const hand = handIn * (1 - handOut);
  const covered = smooth(prog(t, hilang - 0.75, hilang - 0.25)) * (1 - smooth(prog(t, kembali - 0.6, kembali - 0.1)));
  const light: [number, number, number] = [candle(0), candle(1) * (1 - covered), candle(2)];

  const cut = smooth(prog(t, at("beberapa"), at("lubang", 0, "e"))) * (1 - smooth(prog(t, at("kesimpulannya"), at("berjalan"))));
  const dim = 1 - 0.15 * window01(t, dark0 - 0.2, at("lubang", 0, "e"), 0.6);

  const sinar = at("sinar");
  const shrink = easeIO(prog(t, at("kali"), at("kecil", 2, "e") + 0.2));
  return {
    light,
    flame: [candle(0), candle(1), candle(2)],
    hand,
    cut,
    inBeams: Math.max(cut, smooth(prog(t, at("pula") - 0.2, at("nama"))) * (1 - smooth(prog(t, at("kali"), at("memotret"))))),
    straight: window01(t, at("segaris") - 0.1, at("tutup") - 0.2, 0.35),
    dim,
    lamp: smooth(prog(t, at("sekitar"), at("sekitar") + 1.2)) * (1 - 0.6 * window01(t, dark0 - 0.5, at("lurus", 1, "e"), 1)),
    eyeOut: window01(t, at("mata") - 0.2, at("eropa") + 0.5, 0.4),
    eyeCross: smooth(prog(t, sinar, sinar + 0.35)),
    eyeIn: window01(t, at("masuk") - 0.7, at("jilid", 0, "e"), 0.4),
    route1: easeIO(prog(t, at("memanggilnya"), at("mesir", 0, "e"))),
    route2: easeIO(prog(t, at("sungai"), at("aswan", 0, "e"))),
    routeVis: window01(t, at("memanggilnya") - 0.3, at("gila"), 0.5),
    dam: window01(t, at("rencana") - 0.4, at("mustahil", 0, "e") + 0.9, 0.3),
    damBreak: smooth(prog(t, at("mustahil"), at("mustahil", 0, "e") + 0.5)),
    walk: smooth(prog(t, at("jeram") - 0.6, at("sadar"))),
    bar: easeOut(prog(t, at("dikurung"), at("dikurung", 0, "e") + 0.25)),
    winLight: smooth(prog(t, at("konon") - 0.4, at("konon") + 0.8)),
    books: 7 * prog(t, at("tujuh") - 0.1, at("jilid", 0, "e") + 0.15),
    frontOpen: smooth(prog(t, at("pula"), at("nama"))),
    shell: smooth(prog(t, at("pula") - 0.2, at("nama"))),
    shrink,
    scale: 1 + (ROOM_MIN_SCALE - 1) * shrink,
    phone: easeOut(prog(t, at("memotret") - 0.2, at("gelap", 2, "e") + 0.3)),
    outro: smooth(prog(t, OUTRO_AT, OUTRO_AT + 0.5)),
    wallLamp: smooth(prog(t, at("konon") - 0.4, at("konon") + 0.6)) * (1 - 0.65 * smooth(prog(t, at("cahaya"), at("cahaya") + 1.0))) * (1 - smooth(prog(t, at("beberapa"), at("lubang", 0, "e")))),
    shutterGlow: window01(t, at("wafat") - 0.3, at("lubang", 0, "e"), 0.8),
    moon: (1 - smooth(prog(t, at("pula") - 0.2, at("nama")))) * (1 - 0.88 * window01(t, at("sekitar"), at("keras"), 1.0)) - 0.6 * window01(t, at("masuk") - 1.2, at("kepler", 0, "e"), 1.0),
  };
}
