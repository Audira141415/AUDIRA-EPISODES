// EP07 shot list: the whole film as one function stateAt(t). Each shot is keyed to clip ids of the
// real voice timeline (T = clip start, E = clip end), never to hard-coded seconds.
import type { ActName } from "./Cast";
import { BOBBY_SPOT, CURB_H, E, JACK_LANE_Z, POST, T, TOTAL_SECONDS, clamp, lerp, lerp3, mouthOf, ramp, type V3 } from "./layout";

export type Cam = { pos: V3; target: V3; fov: number; near?: number; roll?: number };
export type Actor = { pos: V3; heading: number; act: ActName; mood?: "smile" | "stern" | "sad" | "shock"; scale?: number; talk?: number };
export type CarState = { x: number; z: number; brake: number; head: number; interior: boolean; dist: number; shake?: number };
export type Blinds = { from: V3; to: V3; color: string; intensity: number; slant?: number };
export type State = {
  shot: string;
  cam: Cam;
  car: CarState | null;
  jack: Actor | null;
  bobby: Actor | null;
  blinds: Blinds | null;
  note: null | { show: number };
  paperSlip: number; // 0..1 the folded paper travelling from Bobby's hand into the window gap
  ticketBook: boolean;
  rain: number;
};

/** Parked car: Jack pulled over on the far side of the crossing, by the left curb. */
export const PARK = { x: -17, z: 3.0 };
/** car-local (forward +x, right +z) to world for a car facing -x at (cx, cz). */
export const carW = (cx: number, cz: number, l: V3): V3 => [cx - l[0], l[1], cz - l[2]];
/** heading (0 faces +z) that looks from a to b */
export const face = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const yOn = (x: number, z: number) => (Math.abs(x) > 4 && Math.abs(z) > 4 ? CURB_H : 0);
const at = (x: number, z: number): V3 => [x, yOn(x, z), z];

const JACK_SEAT = (cx: number, cz: number) => carW(cx, cz, [-0.3, 0.72, 0.4]);
const JACK_HEAD = (cx: number, cz: number) => carW(cx, cz, [-0.3, 1.25, 0.4]);
const SEATED_SCALE = 1.25;
const seatedJack = (cx: number, cz: number, act: ActName, mood: Actor["mood"], t: number): Actor => ({
  pos: JACK_SEAT(cx, cz), heading: -Math.PI / 2, act, mood, scale: SEATED_SCALE, talk: mouthOf("jack", t),
});

/* outside the parked car, the two friends */
const JACK_OUT: V3 = at(-16.7, 1.05);
const BOBBY_MEET: V3 = at(-14.5, 0.55);
const BOBBY_WINDOW: V3 = at(-17.2, 0.95);

/** eased move of a camera between two keys over [a, b] */
const move = (t: number, a: number, b: number, c0: Cam, c1: Cam): Cam => {
  const k = ramp(t, a, b);
  return { pos: lerp3(c0.pos, c1.pos, k), target: lerp3(c0.target, c1.target, k), fov: lerp(c0.fov, c1.fov, k), near: c0.near, roll: c0.roll };
};
const lin = (t: number, a: number, b: number) => clamp((t - a) / Math.max(1e-4, b - a));

const base = (shot: string, cam: Cam): State => ({
  shot, cam, car: null, jack: null, bobby: null, blinds: null, note: null, paperSlip: 0, ticketBook: false, rain: 1,
});
const parked = (extra: Partial<CarState> = {}): CarState => ({ x: PARK.x, z: PARK.z, brake: 0, head: 0.35, interior: false, dist: 0, ...extra });

export const HERO: Cam = { pos: [1.6, 1.25, 13.8], target: [-0.9, 2.05, -2.0], fov: 41 };

export const stateAt = (t: number): State => {
  const bobbyTalk = mouthOf("bobby", t);
  const jackTalk = mouthOf("jack", t);

  /* A. hook: the moment itself, frozen, the camera cranes off the red lamp to the wide */
  if (t < T.s2a) {
    const cam = t < T.s1a + 3
      ? move(t, 0, T.s1a + 3, { pos: [-2.4, 3.55, 8.4], target: [-4.9, 3.3, 5.0], fov: 30 }, { pos: [-0.6, 3.4, 10.5], target: [-4.2, 2.9, 4.4], fov: 32 })
      : move(t, T.s1a + 3, E.s1b - 1.0, { pos: [-0.6, 3.4, 10.5], target: [-4.2, 2.9, 4.4], fov: 32 }, HERO);
    const s = base("A-hook", cam);
    s.car = { x: 3.6, z: JACK_LANE_Z, brake: 0.6, head: 1, interior: false, dist: 0 };
    s.bobby = { pos: BOBBY_SPOT, heading: 1.25, act: "wave", mood: "stern" };
    return s;
  }

  /* B. the story rewinds: high establishing crane, Jack's car far down the road, the light green */
  if (t < T.s2c) {
    const x = lerp(56, 36, lin(t, T.s2a, T.s2c));
    const k = ramp(t, T.s2a, T.s2c);
    const cam: Cam = { pos: [x - 13 + k * 2, lerp(5.5, 3.2, k), -6.8], target: [x - 3, 1.0, 1.5], fov: 40 };
    const s = base("B-establish", cam);
    s.car = { x, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 56 - x };
    s.bobby = { pos: BOBBY_SPOT, heading: 1.0, act: "stand", mood: "stern" };
    return s;
  }

  /* C. chase camera behind the car: the green light ahead */
  if (t < T.s2d) {
    const u = lin(t, T.s2c, T.s2d);
    const x = lerp(40, 30, u);
    const s = base("C-chase", { pos: [x + 6.8, 1.7, JACK_LANE_Z + 1.1], target: [x - 12, 1.9, JACK_LANE_Z - 0.6], fov: 40 });
    s.car = { x, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 40 - x };
    s.bobby = { pos: BOBBY_SPOT, heading: 1.0, act: "stand", mood: "stern" };
    return s;
  }

  /* D. he floors it: low front three-quarter at the crossing, the car rushes at us under the green */
  if (t < T.s2f) {
    const u = lin(t, T.s2d, T.s2f);
    const x = 46 - 30 * u * u; // accelerating
    const cam = move(t, T.s2d, T.s2f, { pos: [7.6, 0.55, -0.6], target: [20, 1.6, 2.6], fov: 34 }, { pos: [7.2, 0.6, -0.9], target: [15, 1.9, 2.4], fov: 38 });
    const s = base("D-accelerate", cam);
    s.car = { x, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 46 - x };
    return s;
  }

  /* E. inside the car: the light turns amber; venetian-blind shadows sweep over Jack */
  if (t < E.s2g) {
    const u = lin(t, T.s2f, E.s2g);
    const cx = lerp(15, 11, u), cz = JACK_LANE_Z;
    const head = JACK_HEAD(cx, cz);
    const s = base("E-amber", { pos: carW(cx, cz, [0.62, 1.34, -0.2]), target: [head[0], head[1] - 0.08, head[2]], fov: 62, near: 0.03 });
    s.car = { x: cx, z: cz, brake: 0, head: 1, interior: true, dist: 50 - cx, shake: 1 };
    s.jack = seatedJack(cx, cz, "drive", t > T.s2g ? "shock" : "stern", t);
    s.blinds = { from: carW(cx, cz, [3.5 - u * 2.5, 2.7, -1.6]), to: head, color: "#ffae1a", intensity: 60, slant: 0.18 };
    s.rain = 0.25;
    return s;
  }

  /* F. the signal head, close: amber snaps to red */
  if (t < T.s2i) {
    const cam = move(t, E.s2g, T.s2i, { pos: [8.4, 3.0, 5.9], target: [5.1, 3.35, 5.05], fov: 26 }, { pos: [7.6, 3.1, 5.6], target: [5.1, 3.35, 5.05], fov: 22 });
    const s = base("F-red", cam);
    s.car = { x: 16, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 0 };
    return s;
  }

  /* G. ground level at the stop line: the car blows through the red */
  if (t < T.s3a) {
    const u = lin(t, T.s2i, T.s3a);
    const x = lerp(26, -14, Math.pow(u, 1.15));
    const look = lerp3([14, 1.0, 2.2], [-6, 1.0, 2.0], ramp(u, 0.45, 0.85));
    const s = base("G-run-red", { pos: [5.4, 0.42, -0.9], target: look, fov: 40 });
    s.car = { x, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 26 - x };
    s.bobby = { pos: BOBBY_SPOT, heading: 1.25, act: "stand", mood: "stern" };
    return s;
  }

  /* H. the whistle: Bobby under his lamp, arm up */
  if (t < T.s3b) {
    const cam = move(t, T.s3a, T.s3b, { pos: [-3.0, 1.55, -1.9], target: [-4.9, 1.45, -4.7], fov: 36 }, { pos: [-3.3, 1.55, -2.4], target: [-4.9, 1.5, -4.7], fov: 32 });
    const s = base("H-whistle", cam);
    s.bobby = { pos: BOBBY_SPOT, heading: face(BOBBY_SPOT, [0, 0, 2]), act: "whistle", mood: "stern" };
    return s;
  }

  /* I. wide across the crossing: Jack pulls over on the far side, Bobby waving him in */
  if (t < T.s3d) {
    const u = lin(t, T.s3b, E.s3c);
    const k = 1 - Math.pow(1 - u, 2.2); // decelerate
    const x = lerp(-4, PARK.x, k);
    const z = lerp(JACK_LANE_Z, PARK.z, ramp(u, 0.35, 0.95));
    const cam = move(t, T.s3b, T.s3d, { pos: [-27, 3.4, -6.5], target: [-11, 0.8, 0.5], fov: 40 }, { pos: [-27.5, 3.0, -6.0], target: [-14, 0.9, 1.5], fov: 38 });
    const s = base("I-pull-over", cam);
    s.car = { x, z, brake: u > 0.25 ? 1 : 0, head: 1, interior: false, dist: -x };
    s.bobby = { pos: BOBBY_SPOT, heading: face(BOBBY_SPOT, [x, 0, z]), act: t < T.s3c ? "wave" : "stand", mood: "stern" };
    return s;
  }

  /* J. the mirror: from the back of the car, Bobby walks over through the rain */
  if (t < T.s3e) {
    const u = lin(t, T.s3d, E.s3e + 0.5);
    const p = lerp3(BOBBY_SPOT, BOBBY_MEET, u);
    const s = base("J-mirror", { pos: [-13.6, 0.95, 1.7], target: lerp3([-7, 1.2, -3.6], [-12.5, 1.2, -0.6], ramp(t, T.s3d, E.s3e)), fov: 34, near: 0.05 });
    s.car = parked({ brake: 1 });
    s.bobby = { pos: [p[0], yOn(p[0], p[2]), p[2]], heading: face(p, BOBBY_MEET), act: "walk", mood: "stern" };
    return s;
  }

  /* K. reveal: Bobby, close. His face gives nothing. */
  if (t < T.s4a) {
    const h = face(BOBBY_MEET, JACK_OUT);
    const eye: V3 = [BOBBY_MEET[0] + Math.sin(h) * 2.3, 1.62, BOBBY_MEET[2] + Math.cos(h) * 2.3];
    const cam = move(t, T.s3e, T.s4a, { pos: eye, target: [BOBBY_MEET[0], 1.55, BOBBY_MEET[2]], fov: 30 }, { pos: [eye[0] * 0.92 + BOBBY_MEET[0] * 0.08, 1.6, eye[2] * 0.92 + BOBBY_MEET[2] * 0.08], target: [BOBBY_MEET[0], 1.57, BOBBY_MEET[2]], fov: 26 });
    const s = base("K-reveal", cam);
    s.car = parked();
    s.bobby = { pos: BOBBY_MEET, heading: h, act: "stand", mood: "stern" };
    return s;
  }

  /* L-P. the two friends by the car. Two-shot from the road; singles over the shoulder. */
  if (t < T.s5a) {
    const s = base("L-two-shot", HERO);
    s.car = parked();
    const exit = ramp(t, T.s4a, T.s4a + 1.6);
    const jp = lerp3(carW(PARK.x, PARK.z, [0.1, 0, 1.25]), JACK_OUT, exit);
    const jh = face(JACK_OUT, BOBBY_MEET);
    const bh = face(BOBBY_MEET, JACK_OUT);
    const jackAct: ActName = t < T.s4c ? (exit < 1 ? "walk" : "armsOpen") : t >= T.s4e && t < T.s4h ? "gesture" : "stand";
    const writing = t >= T.s4k;
    s.jack = { pos: [jp[0], 0, jp[2]], heading: jh, act: jackAct, mood: t < T.s4d ? "smile" : t < T.s4h ? "smile" : "sad", talk: jackTalk };
    s.bobby = { pos: BOBBY_MEET, heading: bh, act: writing ? "write" : t >= T.s4j && t < T.s4k ? "handOut" : "stand", mood: "stern", talk: bobbyTalk };
    s.ticketBook = writing;
    const two: Cam = { pos: [-15.4, 1.55, -4.3], target: [-15.5, 1.35, 1.0], fov: 34 };
    const jackHead: V3 = [JACK_OUT[0], 1.6, JACK_OUT[2]];
    const bobHead: V3 = [BOBBY_MEET[0], 1.62, BOBBY_MEET[2]];
    // over-the-shoulder positions: behind one, looking at the other
    const ots = (from: V3, to: V3, side: number): Cam => {
      const dx = to[0] - from[0], dz = to[2] - from[2];
      const n = Math.hypot(dx, dz);
      const ux = dx / n, uz = dz / n;
      return { pos: [from[0] - ux * 1.7 - uz * 0.75 * side, 1.85, from[2] - uz * 1.7 + ux * 0.75 * side], target: [to[0], to[1] - 0.1, to[2]], fov: 32 };
    };
    if (t < T.s4b) s.cam = move(t, T.s4a, T.s4b, { ...two, pos: [-15.4, 1.5, -5.2], fov: 38 }, two); // jump out, arms open
    else if (t < T.s4c) { s.cam = move(t, T.s4b, T.s4c, two, { ...two, pos: [-15.5, 1.55, -3.6], fov: 32 }); s.shot = "L-greet"; }
    else if (t < T.s4d) { s.cam = ots(jackHead, bobHead, 1); s.shot = "M-hai"; }
    else if (t < T.s4e) { s.cam = move(t, T.s4d, T.s4e, two, { ...two, fov: 31 }); s.shot = "N-cold"; }
    else if (t < T.s4h) { s.cam = move(t, T.s4e, T.s4h, ots(bobHead, jackHead, -1), { ...ots(bobHead, jackHead, -1), fov: 26 }); s.shot = "N-excuse"; }
    else if (t < T.s4k) { s.cam = move(t, T.s4h, T.s4k, ots(jackHead, bobHead, 1), { ...ots(jackHead, bobHead, 1), fov: 25 }); s.shot = "O-bobby"; }
    else {
      const fx = Math.sin(bh), fz = Math.cos(bh);
      const book: V3 = [BOBBY_MEET[0] + fx * 0.3, 1.2, BOBBY_MEET[2] + fz * 0.3];
      const side: V3 = [BOBBY_MEET[0] + fx * 1.9 + fz * 1.0, 1.55, BOBBY_MEET[2] + fz * 1.9 - fx * 1.0];
      s.cam = move(t, T.s4k, T.s5a, { pos: side, target: [book[0], 1.35, book[2]], fov: 34 }, { pos: [side[0] * 0.85 + book[0] * 0.15, 1.65, side[2] * 0.85 + book[2] * 0.15], target: [book[0], 1.3, book[2]], fov: 30 });
      s.shot = "P-writing";
    }
    return s;
  }

  /* Q. back in the car: Jack watches his old friend write. Blinds of lamplight cross his face. */
  if (t < T.s5c) {
    const head = JACK_HEAD(PARK.x, PARK.z);
    const cam = move(t, T.s5a, T.s5c, { pos: carW(PARK.x, PARK.z, [0.25, 1.3, -0.5]), target: [head[0] + 0.05, head[1], head[2] - 0.2], fov: 44, near: 0.03 },
      { pos: carW(PARK.x, PARK.z, [0.3, 1.28, -0.38]), target: [head[0] + 0.05, head[1], head[2] - 0.1], fov: 40, near: 0.03 });
    const s = base("Q-in-car", cam);
    s.car = parked({ interior: true, head: 0 });
    s.jack = seatedJack(PARK.x, PARK.z, "drive", "sad", t);
    s.bobby = { pos: BOBBY_WINDOW, heading: face(BOBBY_WINDOW, head), act: "write", mood: "stern" };
    s.ticketBook = true;
    s.blinds = { from: carW(PARK.x, PARK.z, [-2.6, 3.4, -2.6]), to: head, color: "#ffe2b0", intensity: 55, slant: -0.12 };
    s.rain = 0.3;
    return s;
  }

  /* R. outside the window: the paper slips in; Bobby walks back to his post without a word */
  if (t < T.s5e) {
    const slip = ramp(t, T.s5c + 1.0, E.s5c + 0.6);
    const back = ramp(t, T.s5d + 1.6, E.s5d + 0.4);
    const bp = lerp3(BOBBY_WINDOW, BOBBY_SPOT, back);
    const cam: Cam = { pos: lerp3([-20.4, 1.6, -2.2], [-19.6, 1.8, -3.0], ramp(t, T.s5c, T.s5e)), target: [lerp(-17.0, bp[0], 0.85), 1.3, lerp(1.4, bp[2], 0.85)], fov: 36 };
    const s = base("R-slip", cam);
    s.car = parked();
    s.jack = seatedJack(PARK.x, PARK.z, "drive", "sad", t);
    s.bobby = { pos: [bp[0], yOn(bp[0], bp[2]), bp[2]], heading: back > 0.02 ? face(BOBBY_WINDOW, BOBBY_SPOT) : face(BOBBY_WINDOW, JACK_HEAD(PARK.x, PARK.z)), act: back > 0.02 && back < 0.99 ? "walk" : "handOut", mood: "stern" };
    s.paperSlip = slip;
    return s;
  }

  /* S-V. the note. Insert in Jack's hands, lamplight through blinds; cut away once to Bobby alone. */
  if (t < T.s7a) {
    const head = JACK_HEAD(PARK.x, PARK.z);
    const note = carW(PARK.x, PARK.z, [0.08, 1.04, 0.4]);
    if (t >= T.s6e && t < T.s6f) {
      // U. Bobby alone at his post, head bowed
      const cam = move(t, T.s6e, T.s6f, { pos: [-8.0, 1.5, 1.6], target: [-5.6, 1.5, -4.9], fov: 30 }, { pos: [-7.6, 1.5, 1.0], target: [-5.6, 1.45, -4.9], fov: 26 });
      const s = base("U-alone", cam);
      s.car = parked({ head: 0 });
      s.bobby = { pos: [-5.4, CURB_H, -5.4], heading: 0.6, act: "bow", mood: "sad" };
      return s;
    }
    const prog = ramp(t, T.s6a, E.s6j); // pan down the page as it fills
    const s = base(t < T.s6a ? "S-unfold" : "T-note", { pos: [note[0] + 0.28, note[1] + 0.42, note[2] + 0.18], target: [note[0] - 0.02 + prog * 0.05, note[1] + 0.03 - prog * 0.06, note[2] + 0.0], fov: t < T.s6a ? 44 : 34, near: 0.02 });
    if (t < T.s6a) s.cam = move(t, T.s5e, T.s6a, { pos: carW(PARK.x, PARK.z, [0.3, 1.32, -0.35]), target: [head[0], 1.15, head[2]], fov: 42, near: 0.03 }, s.cam);
    s.car = parked({ interior: true, head: 0 });
    s.jack = seatedJack(PARK.x, PARK.z, "holdNote", "sad", t);
    s.note = { show: ramp(t, T.s5e + 0.3, T.s5f) };
    s.blinds = { from: carW(PARK.x, PARK.z, [-2.4, 3.4, -2.2]), to: note, color: "#ffe2b0", intensity: 45, slant: -0.12 };
    s.rain = 0.25;
    return s;
  }

  /* W. Jack out in the rain, looking for Bobby; the post is empty */
  if (t < T.s7c) {
    if (t < T.s7b) {
      const p: V3 = at(-15.6, -0.6);
      const s = base("W-search", move(t, T.s7a, T.s7b, { pos: [-18.6, 1.6, -3.4], target: [-15.6, 1.5, -0.6], fov: 34 }, { pos: [-18.9, 1.65, -3.9], target: [-15.4, 1.5, -0.8], fov: 30 }));
      s.car = parked({ head: 0 });
      s.jack = { pos: p, heading: face(p, POST), act: "lookAround", mood: "shock" };
      return s;
    }
    const s = base("W-empty-post", move(t, T.s7b, T.s7c, { pos: [-2.0, 1.8, 2.2], target: [-7.4, 1.6, -6.4], fov: 32 }, { pos: [-2.6, 1.8, 1.4], target: [-7.6, 1.6, -6.6], fov: 28 }));
    s.car = parked({ head: 0 });
    return s;
  }

  /* X. driving home slowly: high crane, red tail lights in the wet */
  if (t < T.s8a) {
    const u = lin(t, T.s7c, T.s8a);
    const x = lerp(30, 13, 1 - Math.pow(1 - u, 1.6));
    const cam = move(t, T.s7c, T.s8a, { pos: [36, 7.5, 7.2], target: [24, 0.5, 2], fov: 38 }, { pos: [21, 4.5, 7.0], target: [8, 1.2, 1.5], fov: 40 });
    const s = base("X-slow-home", cam);
    s.car = { x, z: JACK_LANE_Z, brake: u > 0.8 ? 1 : 0.2, head: 1, interior: false, dist: 30 - x };
    return s;
  }

  /* Y. payoff: this time he stops at the red, and waits. The hikmah is spoken. */
  if (t < T.s8e) {
    const cam = move(t, T.s8a, E.s8c, { pos: [14.6, 1.0, 3.6], target: [8.0, 1.2, 2.0], fov: 34 }, { pos: [13.5, 2.6, 6.0], target: [4.9, 3.2, 4.4], fov: 34 });
    const s = base("Y-wait", t < E.s8c ? cam : move(t, E.s8c, T.s8e, cam, { pos: [13.0, 2.8, 6.4], target: [3.0, 2.4, 2.8], fov: 38 }));
    const go = ramp(t, E.s8c + 1.2, T.s8e + 2.5);
    const x = 8.9 - go * 3.5;
    s.car = { x, z: JACK_LANE_Z, brake: go > 0.05 ? 0 : 1, head: 1, interior: false, dist: 8.9 - x };
    s.bobby = { pos: BOBBY_SPOT, heading: 1.25, act: "stand", mood: "stern" };
    return s;
  }

  /* Z. closing: rise above the crossing as the car rolls on under the green */
  const u = lin(t, T.s8e, TOTAL_SECONDS);
  const s = base("Z-close", move(t, T.s8e, TOTAL_SECONDS - 3, { pos: [13.0, 2.8, 6.4], target: [3.0, 2.4, 2.8], fov: 38 }, { pos: [9, 15, 7.5], target: [-1, 0, -3], fov: 44 }));
  const x = 5.4 - 22 * Math.pow(u, 1.3);
  s.car = { x, z: JACK_LANE_Z, brake: 0, head: 1, interior: false, dist: 30 - x };
  s.bobby = { pos: BOBBY_SPOT, heading: 1.25, act: "stand", mood: "stern" };
  return s;
};
