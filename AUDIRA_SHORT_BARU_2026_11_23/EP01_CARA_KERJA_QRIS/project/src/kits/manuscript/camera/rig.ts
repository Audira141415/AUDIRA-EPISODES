// MANUSCRIPT Camera Rig — gold-leaf initial, the quill writing, the lontar bundle, the full desk.
//
// One continuous shot list (core/camera/moves.ts) instead of three eased lerp segments: the old rig
// stopped dead after each move (and parked for 1.4 s on the lontar), then lurched into the next.
// The framings are the old ones, converted with framingFrom; the writing beat follows the quill
// with two keys on its path instead of chasing it every frame.

import { shotPlan, cameraAt, frame, framingFrom, settle, type Framing } from "../../../core/camera/moves.ts";
import { INK_LINES, LECTERN, LINE_W, LINE_X0, lineProgress, lineY, pageToWorld } from "../core/motion.ts";

export interface ManuscriptCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number) => a.map((v, i) => v + (b[i] - v) * k) as V3;
const add = (a: V3, b: V3, k = 1) => a.map((v, i) => v + b[i] * k) as V3;

const FILM_FPS = 60;
const PAGE_NORMAL: V3 = [0, -Math.sin(LECTERN.tilt), Math.cos(LECTERN.tilt)];
const LONTAR_TGT: V3 = [0.98, 0.05, 0.42];

const penPoint = (t: number): V3 => {
  let line = 0;
  for (let i = 0; i < INK_LINES; i++) if (lineProgress(t, i) > 0) line = i;
  return pageToWorld(LINE_X0 + LINE_W * lineProgress(t, line) * 0.6, lineY(line));
};

/** The old writing framing: between the page's middle and the quill, seen square to the page. */
const writeFraming = (t: number) => {
  const tgt = mix(pageToWorld(0.3, 0.05), penPoint(t), 0.6);
  return framingFrom(add(add(tgt, PAGE_NORMAL, 1.15), [0.3, 0.08, 0.15]), tgt, 37);
};

const INITIAL = pageToWorld(-0.455, 0.265);
const HOOK = framingFrom(add(add(INITIAL, PAGE_NORMAL, 0.72), [0.12, 0.05, 0]), INITIAL, 34);

/** Halfway framing between two others, backed off to `dist` so the travel crosses fewer frame widths. */
const between = (a: Framing, b: Framing, dist: number): Framing => ({
  target: mix(a.target, b.target, 0.5),
  az: (a.az + b.az) / 2,
  el: (a.el + b.el) / 2 + 3,
  dist,
  fov: (a.fov + b.fov) / 2,
});

// The writing and lontar framings sit 35 % / 25 % further back than the old rig's, so the travel
// between them crosses fewer frame widths per second (the old ones measured "too fast").
const WRITE_A = { ...writeFraming(4.4), dist: writeFraming(4.4).dist * 1.35 };
const WRITE_B = { ...writeFraming(5.2), dist: writeFraming(5.2).dist * 1.35, az: writeFraming(5.2).az - 5 }; // drift round the quill
const LONTAR = (() => { const f = framingFrom([0.75, 1.05, 1.65], LONTAR_TGT, 36); return { ...f, dist: f.dist * 1.25 }; })();

// Seconds on the 60 fps film clock. The page is close (about 1 unit), so each travel backs off
// at its midpoint (a "between" key) and takes 3–4 s, which keeps the slide under ~0.6 frame widths/s:
//  0–1 s     hook: macro on the gold-leaf initial as a candle gleam slides across it
//  1–5.2 s   travel to the quill and follow it writing line after line on the right page
//  5.2–8.2 s track down to the lontar bundle as its cover lifts and leaves fan open
//  8.2–12 s  payoff: pull back to reveal lectern, codex, lontar and candles; the initial flares
const RIG = shotPlan(FILM_FPS, HOOK, [
  { at: 2.6, move: frame(between(HOOK, WRITE_A, 1.35)) },
  { at: 4.4, move: frame(WRITE_A) },
  { at: 5.2, move: frame(WRITE_B) },
  { at: 6.7, move: frame(between(WRITE_B, LONTAR, 1.8)) },
  { at: 8.2, move: frame(LONTAR) },
  { at: 12.0, move: frame(framingFrom([0.2, 1.3, 2.62], [0.08, 0.42, -0.15], 42)) },
  { at: 12.0, move: settle() },
]);

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getManuscriptCamera = (f: number): ManuscriptCameraConfig => {
  const shot = cameraAt(RIG, f, FILM_FPS, { lens: LENS, alive: { deg: 1.2 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
