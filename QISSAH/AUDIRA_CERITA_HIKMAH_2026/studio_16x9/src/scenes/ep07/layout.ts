// EP07 DUKA DI PERJALANAN (FILMNOIR, 16:9): one coordinate + timing module. Everything keys off the
// clip times in timeline.json, so the film re-times itself when the real Cartesia voice arrives.
import tl from "./timeline.json";

export const TOTAL_SECONDS: number = tl.total;
export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = tl.clips as Clip[];
export const T = Object.fromEntries(CLIPS.map((c) => [c.id, c.start])) as Record<string, number>;
export const E = Object.fromEntries(CLIPS.map((c) => [c.id, c.end])) as Record<string, number>;

export type V3 = [number, number, number];

export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const ramp = (t: number, a: number, b: number) => smooth(clamp((t - a) / Math.max(1e-4, b - a)));
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Mouth opening 0..1 for a speaker, driven by the word timestamps of their own lines. */
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start || t > c.end) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const u = (t - w.s) / Math.max(0.05, w.e - w.s);
        return 0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.17))));
      }
    }
  }
  return 0;
};

/* ---------- the intersection, metres. Origin = centre of the crossing, +x = screen right in the
   wide shot, -z = away from camera. Traffic keeps left (Indonesia). Jack drives towards -x in the
   near lane (z = +2); Bobby's police post sits on the far-left corner. ---------- */
export const ROAD_HALF = 4; // each road is 8 m wide
export const CURB_H = 0.15;
export const JACK_LANE_Z = 2;
export const STOP_X = 6.2; // Jack's stop line
export const POST: V3 = [-8.2, CURB_H, -7.2];
export const BOBBY_SPOT: V3 = [-4.9, CURB_H, -4.7];
export const LAMP_POSTS: V3[] = [
  [-5.0, CURB_H, -6.6],
  [6.4, CURB_H, -5.4],
  [-13.0, CURB_H, 5.2],
  // along the east-west road, so the approach is not a black void
  [21.0, CURB_H, 5.4],
  [37.0, CURB_H, -5.4],
  [53.0, CURB_H, 5.4],
  [-29.0, CURB_H, -5.4],
];
/** Traffic signal poles at the corners; `face` = heading of the lamp faces (0 faces +z). */
export const SIGNALS: { pos: V3; face: number; road: "ew" | "ns" }[] = [
  { pos: [-5.0, CURB_H, 5.0], face: Math.PI / 2, road: "ew" }, // far side for Jack, faces +x (towards him)
  { pos: [5.0, CURB_H, 5.0], face: Math.PI / 2, road: "ew" }, // near side for Jack
  { pos: [5.0, CURB_H, -5.0], face: -Math.PI / 2, road: "ew" },
  { pos: [-5.0, CURB_H, -5.0], face: 0, road: "ns" },
];

/** Signal phase for the east-west road (Jack's): the hook opens on red (the motif), the story
 *  rewinds to green at s2a, amber at s2f, red from s2h on. */
export const ewPhase = (t: number): "green" | "amber" | "red" => {
  if (t < T.s2a) return "red";
  if (t < T.s2f) return "green";
  if (t < T.s2h) return "amber";
  if (t > E.s8c + 0.4) return "green"; // payoff: Jack waited the whole red light
  return "red";
};
