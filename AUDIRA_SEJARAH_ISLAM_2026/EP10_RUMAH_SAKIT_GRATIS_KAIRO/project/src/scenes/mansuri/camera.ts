// EP10 Mansuri camera: one continuous motion-control move through the felt diorama.
// Starts at the approved cover framing; every key is anchored to a word of the locked voice.
import { shotPlan, cameraAt, frame, framingFrom, settle, hold, type Beat } from "../../core/camera/moves.ts";
import { COVER } from "./framing";
import { B } from "./beats";

type V3 = [number, number, number];
const FPS = 60;
const f = (pos: V3, target: V3, fov = 36) => frame(framingFrom(pos, target, fov));
const k = (at: number, pos: V3, target: V3, fov = 36): Beat => ({ at, move: f(pos, target, fov) });

const BEATS: Beat[] = [
  // hook: hold on the cover framing while the title reads, drifting a touch closer
  k(B.hookEnd - 0.4, [0.1, 1.65, 10.6], [0, 2.2, 0]),
  // context: crane up and back to show Cairo, then glide left to the sick room in Damaskus
  k(B.lalu, [0, 4.6, 15.5], [0, 2.0, -2]),
  k(B.nazar - 0.6, [-1.0, 4.4, 15.0], [-0.9, 1.9, -2]),
  k(B.qalawun + 1.2, [-3.6, 2.2, 4.8], [-4.3, 0.5, 1.1], 38),
  k(B.damaskus + 0.4, [-3.75, 2.0, 4.7], [-4.25, 0.65, 0.9], 38),
  k(B.raja, [-3.2, 1.65, 3.7], [-3.7, 0.6, 0.5], 38),
  // hold close on the crown and its cushion (the hero of "Ia pun menjadi sultan")
  k(B.sultan - 0.2, [-3.35, 1.15, 2.55], [-3.55, 0.45, 0.55], 38),
];

// Cut on the sentence pause ("sultan." | "Di atas bekas istana tua") straight to the hospital site.
export const CUT_MAIN = B.mainStart - 0.3;
const BEATS_B: Beat[] = [
  { at: CUT_MAIN, move: hold() },
  k(B.dimulai + 0.4, [0.9, 5.2, -2.0], [0.05, 0.3, -6.2], 40),
  k(B.selesai + 0.6, [0.3, 4.5, -2.1], [0, 0.2, -6.4], 40),
  k(B.demam, [0, 4.2, -2.4], [0, 0.3, -6.6], 40),
  k(B.jiwa, [-0.3, 4.4, -2.3], [0, 0.2, -6.4], 40),
  k(B.terpisah - 0.3, [0, 4.8, -2.0], [0, 0.1, -6.2], 40),
  k(B.kasur, [0.62, 1.45, -3.9], [0.62, 0.2, -5.75], 38),
  // explanation: lift high over the whole complex, sweep east to the waqf town, follow the threads back
  k(B.siapa + 0.5, [3.1, 4.0, 6.6], [3.8, 0.9, -0.6], 40),
  k(B.pasar, [4.4, 2.6, 2.9], [4.4, 0.75, -1.6], 38),
  k(B.tanah, [4.2, 3.1, 3.0], [4.4, 0.4, -1.4], 38),
  k(B.eObat, [3.9, 3.6, 6.4], [3.9, 0.7, -0.2], 40),
  k(B.pelayan, [3.4, 1.7, 5.6], [3.4, 0.45, 1.7], 38),
  k(B.pintunya + 0.9, [0.2, 1.6, 9.0], [0, 1.4, 0], 36),
  // payoff: clothes and coins by the gate, the oud at night, then the 1915 sign over the arch
  k(B.payStart + 1.3, [0.5, 1.45, 7.2], [0.3, 1.0, 1.0], 36),
  k(B.pakaian, [1.45, 1.25, 5.7], [0.8, 0.35, 2.9], 36),
  k(B.saku, [1.65, 1.15, 5.3], [0.9, 0.3, 2.95], 36),
  k(B.musik, [-0.45, 1.35, 5.0], [-0.75, 0.4, 2.2], 36),
  k(B.limaAbad + 0.3, [0, 1.7, 9.6], [0, 2.0, 0], 36),
  k(B.sejak + 0.6, [0, 2.6, 7.4], [0, 2.85, 0.5], 36),
  { at: B.rsMata + 1.2, move: hold() },
  // outro: pull back to the whole diorama with the AUDIRA signpost
  k(B.tulis, [0.9, 4.0, 13.6], [0.6, 1.5, 0], 36),
  k(B.voEnd, [1.1, 3.8, 12.9], [0.6, 1.5, 0], 36),
  { at: B.voEnd + 0.01, move: settle() },
];

const RIG = shotPlan(FPS, framingFrom(COVER.pos, COVER.target, COVER.fov), BEATS);
const RIG_B = shotPlan(FPS, framingFrom([1.4, 6.0, -2.0], [0.1, 0.3, -6.0], 40), BEATS_B);

export const mansuriCamera = (f60: number) => {
  const shot = cameraAt(f60 / FPS < CUT_MAIN ? RIG : RIG_B, f60, FPS, { lens: { aperture: 0, maxBlur: 0, exposure: 1 }, alive: { deg: 1.0, breath: 0.008 } });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};
