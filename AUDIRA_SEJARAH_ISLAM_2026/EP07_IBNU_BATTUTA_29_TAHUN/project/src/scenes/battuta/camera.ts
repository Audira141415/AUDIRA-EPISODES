// EP07 camera: one continuous rig. Every key sits on a word time from the locked voice (time.ts); between
// keys position and target ease with smootherstep (soft landings, no overshoot). Long flights between the
// coast and the map rise over an arc. Key 0 is COVER_SHOT, so the opening frame is the approved cover.
import { Vector3 } from "three";
import type { Shot } from "../../kits/paperworld/render/Stage.tsx";
import type { V3 } from "../../kits/paperworld/components/Paper.tsx";
import { COVER_SHOT } from "./world.tsx";
import { PLACES } from "./map.tsx";
import { W, WE, VO_END, TOTAL, smooth } from "./time.ts";

type Key = { t: number; pos: V3; target: V3; fov: number; arc?: number; cut?: boolean };
const k = (t: number, pos: V3, target: V3, fov: number, arc = 0, cut = false): Key => ({ t, pos, target, fov, arc, cut });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const T = PLACES.tangier, D = PLACES.delhi, C = PLACES.calicut, M = PLACES.makkah;
const STORM: V3 = [C[0] + 12, 0, C[2] + 2];
// the overview looks up the route from behind Sumatra: Sumatra low in frame, Tangier far at the top
export const OVERVIEW_POS: V3 = [-125, 285, -180];
export const OVERVIEW_TGT: V3 = [175, 0, 85];

export const KEYS: Key[] = [
  k(0, COVER_SHOT.pos, COVER_SHOT.target, COVER_SHOT.fov),
  // hook: push toward the gate sign, then to the traveller standing at the bow
  k(WE("l01", "kota"), [2.2, 8.6, 22], [-0.6, 4.8, -12], 37),
  k(W("l01", "pernah"), [3.5, 4.6, -11.5], [-2.3, 3.0, -4.6], 34),
  k(W("l02", "tahun") - 0.05, [3.9, 4.9, -12.2], [-2.3, 3.0, -4.4], 34),
  // context: cut on "Tahun" to Tangier seen from high, descend to the east gate; the lone traveller walks out
  k(W("l02", "tahun"), add(T, [-110, 90, -70]), add(T, [0, 4, 0]), 40, 0, true),
  k(W("l02", "tangier"), add(T, [-42, 13, -10]), add(T, [0, 5, 0]), 38),
  k(WE("l03", "kafilah"), add(T, [-27, 7, -10]), add(T, [-8, 3.5, -1.5]), 34),
  k(W("l03", "haji"), add(T, [-31, 8.5, -13]), add(T, [-10, 3.5, -2]), 35),
  k(WE("l03", "kemudian"), add(M, [30, 55, -60]), add(M, [0, 4, -6]), 42),
  // main: follow the head of the thread east; Delhi; the mission toward China; the storm; Bengal, Burma, Sumatra
  k(W("l04", "lurus"), add(M, [22, 50, -55]), add(M, [-2, 4, -6]), 42),
  // main: one slow shot per leg, hard cuts on the sentence pauses (no flights across the whole map)
  k(W("l04", "timur") - 0.05, add(M, [20, 48, -52]), add(M, [-2, 4, -6]), 42),
  k(W("l04", "timur"), [190, 430, -160], [178, 0, 104], 46, 0, true),
  k(W("l04", "di") - 0.05, [186, 405, -146], [178, 0, 104], 46),
  k(W("l04", "di"), add(D, [12, 28, -66]), add(D, [0, 8, 0]), 36, 0, true),
  k(W("l05", "sultan") - 0.05, add(D, [8, 22, -54]), add(D, [0, 8, 0]), 36),
  k(W("l05", "sultan"), [55, 235, -125], [48, 0, 55], 44, 0, true),
  k(W("l05", "hancur") - 0.05, [53, 222, -114], [48, 0, 55], 44),
  k(W("l05", "hancur"), add(STORM, [10, 22, -62]), add(STORM, [0, 10, 0]), 38, 0, true),
  k(W("l05", "ia") - 0.05, add(STORM, [7, 19, -55]), add(STORM, [0, 10, 0]), 38),
  k(W("l05", "ia"), [62, 195, -116], [45, 0, 32], 44, 0, true),
  k(W("l05", "lalu") - 0.05, [56, 178, -104], [42, 0, 34], 44),
  k(W("l05", "lalu"), [8, 24, 52], [0, 5, -12], 38, 0, true),
  k(W("l05", "1345"), [4, 16, 40], [0, 5, -12], 38),
  // explanation: inside Sumutra
  k(W("l06", "warga"), [5.5, 4.8, 7.5], [0.0, 2.4, -9], 36),
  k(W("l07", "sumutra"), [5, 9.5, 13], [-3.5, 6.6, -13], 36),
  k(W("l07", "tamu"), [9, 24, 8.5], [4.2, 4.5, -16.5], 36),
  k(W("l08", "sultan"), [4, 26, 6], [0.4, 3.5, -18.5], 36),
  k(W("l08", "berjalan"), [6, 24, -6], [-4.5, 2, -21], 36),
  k(W("l09", "salat"), [5.4, 23.4, -6.6], [-4.5, 2, -21], 36),
  k(W("l09", "diskusi"), [21, 5.6, -20.2], [6.6, 1.7, -22.6], 38, 8),
  k(W("l09", "asar"), [20, 5.3, -20.6], [6.6, 1.6, -22.6], 38),
  // payoff: rise off the town to the whole island, then the whole route
  k(W("l10", "kota"), [6, 40, 25], [-4, 0, -16], 42),
  k(W("l10", "sumatra"), [-15, 190, -110], [-8, 0, -15], 45),
  k(W("l11", "al-jawa"), [-12, 200, -118], [-6, 0, -15], 45),
  k(W("l11", "kilometer"), OVERVIEW_POS, OVERVIEW_TGT, 50, 40),
  // outro: a slow push over the finished map
  k(VO_END, [-110, 262, -162], [170, 0, 82], 50),
  k(TOTAL + 1, [-106, 255, -157], [170, 0, 82], 50),
];

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// Hermite through the keys with Catmull-Rom tangents (velocity stays continuous across keys, so a key is a
// waypoint, not a stop); tangents are damped (0.7) to avoid overshoot and zero at cuts and at the ends.
const tangent = (i: number, get: (q: Key) => V3): V3 => {
  const prev = KEYS[i - 1], cur = KEYS[i], next = KEYS[i + 1];
  if (!prev || !next || cur.cut || next.cut) return [0, 0, 0];
  const a = get(prev), b = get(next), dt = next.t - prev.t;
  return [((b[0] - a[0]) / dt) * 0.7, ((b[1] - a[1]) / dt) * 0.7, ((b[2] - a[2]) / dt) * 0.7];
};
const hermite = (i: number, s: number, get: (q: Key) => V3): V3 => {
  const a = KEYS[i], b = KEYS[i + 1];
  const h = b.t - a.t;
  const m0 = tangent(i, get), m1 = tangent(i + 1, get);
  const p0 = get(a), p1 = get(b);
  const s2 = s * s, s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
  return [0, 1, 2].map((j) => h00 * p0[j] + h10 * h * m0[j] + h01 * p1[j] + h11 * h * m1[j]) as V3;
};

export const shotAt = (t: number): Shot & { dist: number } => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const s = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const u = smooth(s);
  const pos = hermite(i, s, (q) => q.pos);
  const target = hermite(i, s, (q) => q.target);
  pos[1] += (b.arc ?? 0) * Math.sin(Math.PI * s);
  const dist = new Vector3(...pos).distanceTo(new Vector3(...target));
  // alive: a slow drift proportional to the shot size, exactly zero at t = 0 (cover match)
  const amp = dist * 0.012;
  pos[0] += amp * Math.sin(t * 0.21);
  pos[1] += amp * 0.5 * Math.sin(t * 0.17);
  const close = 1 - Math.min(1, Math.max(0, (dist - 50) / 60));
  return {
    pos,
    target,
    fov: lerp(a.fov, b.fov, u),
    focus: dist,
    aperture: lerp(0.0002, 0.0012, close),
    maxBlur: lerp(0.002, 0.005, close),
    near: Math.max(0.08, dist * 0.004),
    far: 3200,
    dist,
  };
};
