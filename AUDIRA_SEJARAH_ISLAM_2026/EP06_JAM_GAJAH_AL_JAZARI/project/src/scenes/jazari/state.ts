// EP06 film state: a pure function of time. One primary driver for the clock (the bowl's sink depth
// `sink` 0..1); the rope, the inner water, the timer gauge and the ball release all follow from it or
// from word anchors of the locked voice.

import { at, part, prog, smooth, easeIO, clamp01, VO_END, TOTAL, OUTRO_AT } from "./time.ts";
import { BEAK, MOUTH, CHUTE_TOP, CYMBAL_TOP, BALL_SINK } from "./layout.ts";

type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** Piecewise-linear curve through [t, v] keys (eased per segment). */
function keys(t: number, ks: [number, number][]): number {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * smooth(prog(t, ks[i - 1][0], ks[i][0]));
  }
  return ks[ks.length - 1][1];
}

type Drop = { a: number; b: number; from: V3; to: V3; gravity?: boolean };

let CACHE: ReturnType<typeof build> | null = null;
function build() {
  const hookFall = 0.75; // the cover frame (0.3 s) shows the ball mid-fall
  const drops: Drop[] = [
    // hook: beak -> serpent mouth, mouth -> chute -> cymbal -> sink
    { a: -0.35, b: hookFall, from: BEAK, to: MOUTH, gravity: true },
    { a: at("bersiul") - 0.1, b: at("memukul") - 0.05, from: MOUTH, to: CHUTE_TOP },
    { a: at("memukul") - 0.05, b: at("simbal"), from: CHUTE_TOP, to: CYMBAL_TOP, gravity: true },
    { a: at("simbal") + 0.05, b: at("sendiri") + 0.3, from: CYMBAL_TOP, to: BALL_SINK, gravity: true },
    // main: the show
    { a: at("bola"), b: at("ular", 1, "e"), from: BEAK, to: MOUTH, gravity: true },
    { a: at("menunduk"), b: at("bola", 1) - 0.1, from: MOUTH, to: CHUTE_TOP },
    { a: at("bola", 1) - 0.1, b: at("simbal", 1), from: CHUTE_TOP, to: CYMBAL_TOP, gravity: true },
    { a: at("simbal", 1) + 0.05, b: at("simbal", 1) + 0.7, from: CYMBAL_TOP, to: BALL_SINK, gravity: true },
    // explanation: the rope releases the ball up top
    { a: at("melepas"), b: at("atas", 0, "e") + 0.2, from: BEAK, to: MOUTH, gravity: true },
    { a: at("mengangkat") - 0.6, b: at("mengangkat"), from: MOUTH, to: CHUTE_TOP },
    { a: at("mengangkat"), b: at("mangkuk", 2) + 0.2, from: CHUTE_TOP, to: CYMBAL_TOP, gravity: true },
    { a: at("mangkuk", 2) + 0.25, b: at("kembali") + 0.4, from: CYMBAL_TOP, to: BALL_SINK, gravity: true },
  ];
  const sinkKeys: [number, number][] = [
    [0, 0.3],
    [at("sendiri"), 0.36],
    [at("pertunjukan"), 0.55],
    [at("bola") - 0.2, 1.0],
    [at("simbal", 1), 1.0],
    [at("simbal", 1) + 0.9, 0.05],
    [at("air masuk"), 0.05],
    [at("tenggelam", 0, "e"), 1.0],
    [at("mengangkat") - 0.1, 1.0],
    [at("kembali"), 0.05],
    [at("siklus"), 0.08],
    [part("payoff").start, 0.3],
    [TOTAL, 0.4],
  ];
  return { drops, sinkKeys };
}

export function filmState(t: number) {
  const B = (CACHE ??= build());
  // ball: the active drop, else hidden (inside the mechanism) or waiting at the beak
  let ball: V3 = BEAK;
  let ballOn = 0;
  for (const d of B.drops) {
    if (t >= d.a && t <= d.b + 0.25) {
      const k = prog(t, d.a, d.b);
      const kk = d.gravity ? k * k : easeIO(k);
      ball = [d.from[0] + (d.to[0] - d.from[0]) * k, d.from[1] + (d.to[1] - d.from[1]) * kk, d.from[2] + (d.to[2] - d.from[2]) * k];
      ballOn = d.to === BALL_SINK ? 1 - prog(t, d.b - 0.15, d.b) : 1;
      break;
    }
  }
  // the next ball waits in the falcon's beak shortly before each release
  if (!ballOn) {
    for (const a of [at("bola"), at("melepas")]) if (t > a - 2.5 && t < a) ballOn = 1;
  }
  const sink = keys(t, B.sinkKeys);
  const hit = (a: number) => Math.exp(-Math.max(0, t - a) * 6) * (t >= a ? 1 : 0);
  const cymbalHit = Math.max(hit(at("simbal")), hit(at("simbal", 1)), hit(at("mangkuk", 2) + 0.2));
  const swing = (a: number) => Math.sin(clamp01((t - a) / 0.45) * Math.PI);
  const mahoutArm = 0.9 - 0.9 * Math.max(swing(at("memukul")), swing(at("memukul", 1)));
  const serpentDip = Math.max(Math.sin(clamp01((t - at("menunduk")) / 1.6) * Math.PI), Math.sin(clamp01((t - (at("mengangkat") - 0.7)) / 1.2) * Math.PI));
  const birdSpin = Math.PI * 2 * (smooth(prog(t, at("bersiul"), at("bersiul") + 1.2)) + smooth(prog(t, at("bersiul", 1), at("bersiul", 1) + 1.2)) + smooth(prog(t, at("peluit"), at("peluit") + 1.2)));
  const whistle = Math.max(
    Math.sin(clamp01((t - at("bersiul")) / 1.0) * Math.PI),
    Math.sin(clamp01((t - at("bersiul", 1)) / 1.2) * Math.PI),
    Math.sin(clamp01((t - at("udara")) / 2.2) * Math.PI),
  );
  const ropeTension = smooth(prog(t, at("menarik") - 0.3, at("menarik") + 0.3)) * (1 - smooth(prog(t, at("atas", 0, "e"), at("atas", 0, "e") + 0.8)));
  const inflow = smooth(prog(t, at("lubang") - 0.2, at("lubang") + 0.4)) * (1 - smooth(prog(t, at("tenggelam", 0, "e") - 0.2, at("tenggelam", 0, "e") + 0.3)));
  const gauge = prog(t, at("air masuk"), at("tenggelam", 0, "e"));
  const gaugeOn = clamp01(prog(t, at("air masuk") - 0.4, at("air masuk")) * (1 - prog(t, at("saat") + 0.6, at("saat") + 1.1)));
  // payoff: giant replica, then the human-height original
  const grow = smooth(prog(t, at("replika") - 0.6, at("dubai") + 0.9)) * (1 - smooth(prog(t, at("jam aslinya"), at("setinggi", 1) + 0.2)));
  const scale = 1 + grow * 1.78; // ±5 m vs ±1.8 m
  const visitors = clamp01(prog(t, at("replika") + 0.2, at("berdiri", 1))) * (1 - prog(t, at("jam aslinya") - 0.4, at("jam aslinya")));
  const adult = clamp01(prog(t, at("aslinya"), at("hanya") + 0.2)) * (1 - prog(t, at("menulis", 1) - 0.3, at("menulis", 1) + 0.3));
  // context: the 50 machine sketches appear on the left page
  const sketches = prog(t, at("50") - 0.1, at("mesin") + 0.9);
  const elephantSketch = smooth(prog(t, at("gambar"), at("membuatnya") + 0.3));
  const scribe = t * 0.35; // slow, constant turn of the scribe (Stage A: the pen "terus berputar")
  const outro = smooth(prog(t, OUTRO_AT, OUTRO_AT + 0.5));
  return { ball, ballOn, sink, cymbalHit, mahoutArm, serpentDip, birdSpin, whistle, ropeTension, inflow, gauge, gaugeOn, scale, visitors, adult, sketches, elephantSketch, scribe, outro, voEnd: VO_END };
}
export type FilmState = ReturnType<typeof filmState>;
export { lerp3 };
