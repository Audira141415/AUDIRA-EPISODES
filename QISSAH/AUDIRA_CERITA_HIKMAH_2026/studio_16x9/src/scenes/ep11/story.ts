// EP11 story logic: clip times from the real voice timeline, who speaks when, where the two figures
// are and how they pose, which glass/salt states apply, and the camera shot list. Pure functions of t.
import TL from "./timeline.json";
import { poseAt, type Pose } from "./Figure.tsx";
import {
  CUP, DAYS, HUT, HUTSET, HUT_PATH, LAKE, LAKE_PATH, SHORE, clamp, dayAt, hutGround, lerp, polyAt, shoreY, smooth, type Clip,
} from "./world";

export const CLIPS = TL.clips as Clip[];
const byId = Object.fromEntries(CLIPS.map((c) => [c.id, c]));
export const T = (id: string) => byId[id].start;
export const E = (id: string) => byId[id].end;
export const TOTAL = TL.total;
export const OUTRO = 3.0;

export const FS = 0.46; // figure scale
type V3 = [number, number, number];
export const hutW = (x: number, z: number, dy = 0): V3 => [HUT.cx + x, hutGround(x, z) + dy, HUT.cz + z];
export const lakeW = (x: number, z: number, dy = 0): V3 => [LAKE.cx + x, shoreY(x, z) + dy, LAKE.cz + z];
const seg = (t: number, a: number, b: number) => smooth((t - a) / Math.max(0.001, b - a));

// ---------------------------------------------------------------------------------------------
// talking
export const mouthOf = (who: string, t: number) => {
  for (const c of CLIPS) {
    if (c.who !== who || t < c.start - 0.05 || t > c.end + 0.05) continue;
    for (const w of c.words) {
      if (t >= w.s && t <= w.e) {
        const syl = Math.max(1, Math.round(w.w.replace(/[^\p{L}]/gu, "").length / 2.6));
        return 0.3 + 0.7 * Math.abs(Math.sin(((t - w.s) / Math.max(0.05, w.e - w.s)) * Math.PI * syl));
      }
    }
    return 0.06;
  }
  return 0;
};
export const speaking = (who: string, t: number) => CLIPS.some((c) => c.who === who && t >= c.start && t <= c.end);

// ---------------------------------------------------------------------------------------------
// day cycle keyed to the story
export const day = (t: number) =>
  dayAt(
    [
      [0, DAYS.morning],
      [T("s5b"), DAYS.morning],
      [T("s6a"), DAYS.noon],
      [T("s7c"), DAYS.noon],
      [T("s7e"), DAYS.dusk],
      [E("s7k"), DAYS.dusk],
      [T("s8b") - 0.5, DAYS.night],
      [TOTAL, DAYS.night],
    ],
    t,
  );

// ---------------------------------------------------------------------------------------------
// figures
export type FigState = {
  where: "hut" | "lake" | "off";
  pos: V3; // world anchor (feet, or seat for sitting)
  heading: number;
  pose: Pose;
  mood: "smile" | "sad" | "neutral";
  mouth: number;
  item?: "stick" | null;
};

const headingTo = (a: [number, number], b: [number, number]) => Math.atan2(b[0] - a[0], b[1] - a[1]);
const pathHeading = (pts: [number, number][], k: number, dir = 1) => {
  const a = polyAt(pts, k);
  const b = polyAt(pts, clamp(k + 0.02 * dir));
  return headingTo(a, b);
};
const mix = (a: Pose, b: Pose, k: number): Pose => {
  const v = (x: V3, y: V3): V3 => [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)];
  return {
    body: v(a.body, b.body), lift: lerp(a.lift, b.lift, k), spine: v(a.spine, b.spine), head: v(a.head, b.head),
    ls: v(a.ls, b.ls), le: lerp(a.le, b.le, k), rs: v(a.rs, b.rs), re: lerp(a.re, b.re, k),
    lh: v(a.lh, b.lh), lk: lerp(a.lk, b.lk, k), rh: v(a.rh, b.rh), rk: lerp(a.rk, b.rk, k),
  };
};
const sitP = (f: number, seed: number): Pose => ({ ...poseAt("sit", f, seed), lh: [-1.45, 0, 0.08], lk: 1.4, rh: [-1.45, 0, -0.08], rk: 1.4, ls: [0.15, 0, 0.18], le: -0.9, rs: [0.15, 0, -0.18], re: -0.9 });
const kneelP = (f: number, seed: number): Pose => ({ ...sitP(f, seed), lift: 0.16, lh: [-1.35, 0, 0.1], lk: 2.7, rh: [-1.35, 0, -0.1], rk: 2.7, spine: [0.05, 0, 0] });
const look = (p: Pose, pitch: number, yaw = 0): Pose => ({ ...p, head: [p.head[0] * 0.3 + pitch, p.head[1] * 0.3 + yaw, p.head[2]] });
const talkArms = (p: Pose, t: number, amt: number, seed: number): Pose => {
  const g = Math.sin(t * 2.1 + seed) * 0.5 + 0.5;
  return { ...p, rs: [lerp(p.rs[0], -0.75 - g * 0.3, amt), p.rs[1], lerp(p.rs[2], -0.25, amt)], re: lerp(p.re, -1.25, amt) };
};

export const oldMan = (t: number): FigState => {
  const f = t * 60;
  const seed = 21;
  const m = mouthOf("paktua", t);
  const talk = speaking("paktua", t) ? 1 : 0;
  const base = { mood: "smile" as const, mouth: m, item: null };
  // --- in the hut: opening, the talk, the glass
  if (t < T("s5a") + 2.6) {
    if (t < T("s3a")) {
      const p = poseAt("stand", f, seed);
      const at: [number, number] = [-0.05, 0.62];
      const lookYoung = seg(t, T("s2d"), T("s2d") + 2);
      const youngAt = youngWalkPos(t);
      return { ...base, where: "hut", pos: hutW(at[0], at[1]), heading: lerp(0.35, headingTo(at, youngAt), lookYoung), pose: look(p, 0.05) };
    }
    let p = sitP(f, seed);
    const reach = seg(t, T("s4a"), T("s4a") + 0.9) * (1 - seg(t, E("s4b") - 0.3, E("s4b") + 0.6));
    if (reach > 0) {
      const stir = t > T("s4b") ? Math.sin(t * 6) * 0.12 : 0;
      p = mix(p, { ...p, rs: [-1.05 + stir, 0.1, -0.05 + stir], re: -0.55 }, reach);
      p = look(p, 0.35);
    } else {
      p = talkArms(look(p, 0.1), t, talk * 0.8, seed);
    }
    const listen = t > T("s3c") && t < T("s4a") ? Math.sin(t * 1.3) * 0.06 : 0; // slow nods while listening
    p = { ...p, head: [p.head[0] + listen, p.head[1], p.head[2]] };
    const [sx, sz] = HUTSET.oldSeat;
    return { ...base, where: "hut", pos: hutW(sx, sz, 0.027 + HUTSET.seatH), heading: Math.PI / 2, pose: p, mood: t > T("s4g") ? "smile" : "neutral" };
  }
  // --- forest walk (leads), then to the shore
  const w0 = T("s5a") + 2.6;
  const w1 = T("s5d") + 2.5;
  if (t < T("s6a") - 0.4) {
    const k = clamp((t - w0) / (w1 - w0));
    if (t < w1) {
      const [x, z] = polyAt(LAKE_PATH, k);
      return { ...base, where: "lake", pos: lakeW(x, z), heading: pathHeading(LAKE_PATH, k), pose: poseAt("walk", f, seed) };
    }
    const end = polyAt(LAKE_PATH, 1);
    const kk = seg(t, w1, T("s6a") - 0.4);
    const x = lerp(end[0], SHORE.old[0], kk), z = lerp(end[1], SHORE.old[1], kk);
    return { ...base, where: "lake", pos: lakeW(x, z), heading: headingTo(end, SHORE.old), pose: kk < 1 ? poseAt("walk", f, seed) : poseAt("stand", f, seed) };
  }
  const faceLake = headingTo(SHORE.old, SHORE.saltTarget);
  // --- salt, stick, talk at the shore
  if (t < T("s7a")) {
    let p = poseAt("stand", f, seed);
    let item: FigState["item"] = null;
    const throwK = seg(t, T("s6b"), T("s6b") + 1.0) * (1 - seg(t, T("s6b") + 2.2, T("s6b") + 3.0));
    const lift = seg(t, T("s6a") + 1.5, T("s6a") + 3) * (1 - seg(t, T("s6b"), T("s6b") + 0.6));
    if (lift > 0) p = mix(p, { ...p, rs: [-0.9, 0, -0.1], re: -1.4 }, lift);
    if (throwK > 0) p = mix(p, { ...p, rs: [-2.1, 0, -0.35], re: -0.15, spine: [0.12, 0, 0] }, throwK);
    const stirK = seg(t, T("s6c"), T("s6c") + 0.8) * (1 - seg(t, E("s6c"), E("s6c") + 0.8));
    if (stirK > 0) {
      item = "stick";
      const s = Math.sin(t * 4);
      p = mix(p, { ...p, rs: [-0.85 + s * 0.15, 0, -0.15 + Math.cos(t * 4) * 0.15], re: -0.3, spine: [0.18, 0, 0] }, stirK);
    }
    let heading = faceLake;
    if (t > T("s6e")) {
      p = talkArms(p, t, talk * 0.7, seed);
      heading = lerp(faceLake, headingTo(SHORE.old, SHORE.kneel), seg(t, T("s6e"), T("s6f")));
    }
    return { ...base, where: "lake", pos: lakeW(...SHORE.old), heading, pose: look(p, throwK > 0 ? -0.1 : 0.08), item };
  }
  // --- pat on the back, then sit facing each other
  if (t < T("s7b") + 1.2) {
    const pat = [SHORE.kneel[0] + 0.14, SHORE.kneel[1] + 0.12] as [number, number];
    const kk = seg(t, T("s7a"), T("s7a") + 1.4);
    const x = lerp(SHORE.old[0], pat[0], kk), z = lerp(SHORE.old[1], pat[1], kk);
    let p = kk < 1 ? poseAt("walk", f, seed) : poseAt("stand", f, seed);
    if (kk >= 1) p = { ...p, rs: [-0.45 - Math.abs(Math.sin(t * 6)) * 0.12, 0, 0.45], re: -0.6 };
    return { ...base, where: "lake", pos: lakeW(x, z), heading: headingTo([x, z], SHORE.kneel) - (kk >= 1 ? 0.5 : 0), pose: look(p, 0.2) };
  }
  if (t < T("s8a") + 0.8) {
    const p = talkArms(look(kneelP(f, seed), 0.05), t, talk, seed);
    return { ...base, where: "lake", pos: lakeW(...SHORE.sitOld), heading: headingTo(SHORE.sitOld, SHORE.sitYoung), pose: p };
  }
  // --- walk home (night), then back in the hut keeping the salt
  if (t < T("s8b")) {
    const k = 1 - clamp((t - T("s8a") - 0.8) / 6) * 0.35;
    const [x, z] = polyAt(LAKE_PATH, k);
    return { ...base, where: "lake", pos: lakeW(x, z), heading: pathHeading(LAKE_PATH, k, -1), pose: poseAt("walk", f, seed) };
  }
  let p = poseAt("stand", f, seed);
  const place = seg(t, T("s8b") + 0.6, T("s8b") + 1.8) * (1 - seg(t, E("s8c"), E("s8c") + 1));
  p = mix(p, { ...p, rs: [-0.95, 0, -0.1], re: -0.5, spine: [0.25, 0, 0] }, place);
  const at: [number, number] = [HUTSET.table[0] + 0.02, HUTSET.table[1] - 0.2];
  return { ...base, where: "hut", pos: hutW(at[0], at[1], 0.027), heading: 0, pose: look(p, 0.25 * place), mouth: 0 };
};

/** Young man on the hut path (C phase), jar-local. */
const youngWalkPos = (t: number): [number, number] => polyAt(HUT_PATH, clamp((t - T("s2d")) / (E("s2f") + 0.4 - T("s2d"))));

export const youngMan = (t: number): FigState => {
  const f = t * 60;
  const seed = 34;
  const m = mouthOf("pemuda", t);
  const talk = speaking("pemuda", t) ? 1 : 0;
  const base = { mood: "sad" as const, mouth: m, item: null };
  if (t < T("s2d") - 0.2) return { ...base, where: "off", pos: [0, -50, 0], heading: 0, pose: poseAt("stand", f, seed) };
  if (t < T("s3b")) {
    const k = clamp((t - T("s2d")) / (E("s2f") + 0.4 - T("s2d")));
    const [x, z] = youngWalkPos(t);
    const walking = k < 1;
    let p = walking ? poseAt("walk", f * 0.7, seed) : poseAt("stand", f, seed);
    p = { ...p, spine: [p.spine[0] + 0.28, p.spine[1], p.spine[2]] };
    p = look(p, walking ? 0.35 : 0.2);
    const heading = walking ? pathHeading(HUT_PATH, k) : headingTo([x, z], HUTSET.oldSeat);
    return { ...base, where: "hut", pos: hutW(x, z), heading, pose: p };
  }
  if (t < T("s5a") + 2.6) {
    let p = sitP(f, seed);
    p = { ...p, spine: [0.22, 0, 0] };
    const headDown = t < T("s3c") ? 0.5 : t < T("s4c") ? 0.18 : 0.3;
    p = look(p, headDown);
    if (talk) p = talkArms(p, t, 0.9, seed);
    // drinking from the glass
    const drink = seg(t, T("s4e"), T("s4e") + 1.0) * (1 - seg(t, T("s4f") - 0.6, T("s4f")));
    if (drink > 0) p = mix(p, { ...p, rs: [-1.25, 0, 0.35], re: -1.85, head: [-0.25, 0, 0] }, drink);
    const [sx, sz] = HUTSET.youngSeat;
    return { ...base, where: "hut", pos: hutW(sx, sz, 0.027 + HUTSET.seatH), heading: -Math.PI / 2, pose: p, mood: t > T("s4e") && t < T("s4f") ? "neutral" : "sad" };
  }
  const w0 = T("s5a") + 2.6;
  const w1 = T("s5d") + 2.5;
  if (t < T("s6a") - 0.4) {
    const k = clamp((t - w0) / (w1 - w0) - 0.07);
    if (t < w1 + 0.4) {
      const [x, z] = polyAt(LAKE_PATH, k);
      return { ...base, mood: "neutral", where: "lake", pos: lakeW(x, z), heading: pathHeading(LAKE_PATH, k), pose: look(poseAt("walk", f, seed), 0.1) };
    }
    const end = polyAt(LAKE_PATH, 0.93);
    const kk = seg(t, w1 + 0.4, T("s6a") - 0.4);
    const x = lerp(end[0], SHORE.young[0], kk), z = lerp(end[1], SHORE.young[1], kk);
    return { ...base, mood: "neutral", where: "lake", pos: lakeW(x, z), heading: headingTo(end, SHORE.young), pose: kk < 1 ? poseAt("walk", f, seed) : poseAt("stand", f, seed) };
  }
  if (t < T("s6g")) {
    const p = look(poseAt("stand", f, seed), 0.1);
    const watch = t < T("s6e") ? headingTo(SHORE.young, SHORE.saltTarget) : headingTo(SHORE.young, SHORE.old);
    return { ...base, mood: "neutral", where: "lake", pos: lakeW(...SHORE.young), heading: watch, pose: talk ? talkArms(p, t, 0.6, seed) : p };
  }
  if (t < T("s7b") + 1.2) {
    // kneel at the water and drink from cupped hands
    const k = seg(t, T("s6g"), T("s6g") + 1.2);
    const x = lerp(SHORE.young[0], SHORE.kneel[0], k), z = lerp(SHORE.young[1], SHORE.kneel[1], k);
    let p = mix(poseAt("stand", f, seed), kneelP(f, seed), k);
    const cup = seg(t, T("s6g") + 1.0, T("s6g") + 2.0) * (1 - seg(t, E("s6g") + 0.4, T("s6i")));
    if (cup > 0) p = mix(p, { ...p, body: [0.35, 0, 0], ls: [-1.3, 0, -0.25], le: -1.75, rs: [-1.3, 0, 0.25], re: -1.75, head: [0.15, 0, 0] }, cup);
    const lean = seg(t, T("s6g") + 1.0, T("s6g") + 1.8) * (1 - seg(t, T("s6g") + 2.4, T("s6g") + 3.6));
    p = { ...p, body: [p.body[0] + lean * 0.35, p.body[1], p.body[2]] };
    if (talk) p = talkArms(p, t, 0.5, seed);
    const heading = lerp(headingTo(SHORE.young, SHORE.saltTarget), headingTo(SHORE.kneel, SHORE.old), seg(t, E("s6g"), T("s6i")));
    const mood = t > T("s6i") ? "smile" : "neutral";
    return { ...base, mood, where: "lake", pos: lakeW(x, z), heading, pose: p };
  }
  if (t < T("s8a") + 0.8) {
    const p = look(kneelP(f, seed), t < T("s7k") ? 0.12 : 0.02);
    const nod = speaking("paktua", t) ? Math.sin(t * 1.2) * 0.05 : 0;
    return { ...base, mood: t > T("s7j") ? "smile" : "neutral", where: "lake", pos: lakeW(...SHORE.sitYoung), heading: headingTo(SHORE.sitYoung, SHORE.sitOld), pose: { ...p, head: [p.head[0] + nod, p.head[1], p.head[2]] } };
  }
  if (t < T("s8b")) {
    const k = 1 - clamp((t - T("s8a") - 0.8) / 6) * 0.35 - 0.05;
    const [x, z] = polyAt(LAKE_PATH, k);
    return { ...base, mood: "smile", where: "lake", pos: lakeW(x, z), heading: pathHeading(LAKE_PATH, k, -1), pose: poseAt("walk", f, seed) };
  }
  return { ...base, where: "off", pos: [0, -50, 0], heading: 0, pose: poseAt("stand", f, seed) };
};

// ---------------------------------------------------------------------------------------------
// props state
export const hutGlass = (t: number) => {
  const pour = seg(t, T("s4a") + 0.8, T("s4a") + 3.2);
  const cloud = seg(t, T("s4b"), E("s4b") + 0.5);
  const swirl = t > T("s4b") && t < E("s4b") + 2 ? 1.6 : t > T("s4a") ? 0.5 : 0;
  const tableTop = hutW(HUTSET.table[0], HUTSET.table[1], 0.027 + HUTSET.tableH);
  const [sx, sz] = HUTSET.youngSeat;
  const mouth = hutW(sx - 0.075, sz + 0.01, 0.027 + HUTSET.seatH + 0.17);
  const drink = seg(t, T("s4e"), T("s4e") + 1.0) * (1 - seg(t, T("s4f") - 0.6, T("s4f")));
  const pos: V3 = [lerp(tableTop[0] + 0.03, mouth[0], drink), lerp(tableTop[1], mouth[1] - 0.06, drink), lerp(tableTop[2], mouth[2], drink)];
  const dishSalt = t < T("s4a") + 1 ? 1 : t < T("s8b") ? 0.35 : lerp(0.35, 1, seg(t, T("s8b") + 1.2, T("s8b") + 2.4));
  return { pour, cloud, swirl, pos, tilt: drink * 0.9, dishSalt, visible: t < T("s5a") + 4 };
};
export const lakeSalt = (t: number) => {
  const scatter = clamp((t - T("s6b") - 0.3) / 3.2) * 1.4;
  const replay = clamp((t - T("s7k") - 0.5) / 4.5) * 1.4;
  const stir = clamp((t - T("s6c") - 0.4) / (E("s6c") - T("s6c") + 1.5)) * 1.3;
  const old = SHORE.old;
  const handLocal: V3 = [old[0] + 0.06, shoreY(old[0], old[1]) + 0.42, old[1] - 0.12];
  if (t > T("s7k") - 0.2 || t < 12) {
    // payoff / hook: a handful of salt drifting into the middle of the lake
    const v = t < 12 ? clamp((t - 0.3) / 3.2) * 1.4 : replay;
    return { scatter: v, stir: 0, hand: [SHORE.saltTarget[0] - 0.4, 1.9, SHORE.saltTarget[1] + 0.3] as V3 };
  }
  return { scatter, stir, hand: handLocal };
};

// ---------------------------------------------------------------------------------------------
// camera
export type CamPose = { pos: V3; target: V3; fov: number };
type Shot = { a: number; b: number; cam: (k: number, t: number) => CamPose };
const L3 = (p: V3, q: V3, k: number): V3 => [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
const add = (p: V3, q: V3): V3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const move = (from: CamPose, to: CamPose, via?: V3) => (k: number): CamPose => {
  const e = smooth(k);
  let pos = L3(from.pos, to.pos, e);
  if (via) pos = L3(L3(from.pos, via, e), L3(via, to.pos, e), e);
  return { pos, target: L3(from.target, to.target, e), fov: lerp(from.fov, to.fov, e) };
};
const head = (s: FigState, up = 0.2): V3 => add(s.pos, [0, s.pose.lift * FS + up, 0]);

export const TABLE_WIDE: CamPose = { pos: [-1.0, 4.4, 9.8], target: [-0.9, 0.95, -1.0], fov: 30 };
const HUT_GLASS: V3 = hutW(HUTSET.table[0] + 0.03, HUTSET.table[1], 0.13);

const shots = (): Shot[] => {
  const s = [] as Shot[];
  const add_ = (a: number, b: number, cam: Shot["cam"]) => s.push({ a, b, cam });
  // A hook: the cover shot, slow truck
  add_(0, T("s2a") - 0.4, move({ pos: [-1.7, 4.6, 10.2], target: [-1.35, 0.95, -1.0], fov: 30 }, { pos: [-1.0, 4.4, 9.8], target: [-1.05, 0.95, -1.0], fov: 30 }));
  // B glide left along the table to the hut jar, then push through the glass into the old man's world
  add_(T("s2a") - 0.4, T("s2c"), move({ pos: [-1.0, 4.4, 9.8], target: [-1.05, 0.95, -1.0], fov: 30 }, { pos: [HUT.cx + 1.2, 2.6, HUT.cz + 5.4], target: [HUT.cx, 1.35, HUT.cz], fov: 30 }, [-4.5, 4.0, 8.0]));
  add_(T("s2c"), T("s2d"), move({ pos: [HUT.cx + 1.2, 2.6, HUT.cz + 5.4], target: [HUT.cx, 1.35, HUT.cz], fov: 30 }, { pos: hutW(0.75, 1.3, 0.55), target: hutW(-0.15, -0.25, 0.3), fov: 38 }, [HUT.cx + 0.9, 1.6, HUT.cz + 2.6]));
  // C the young man walks up the path
  add_(T("s2d"), T("s3b"), (k, t) => {
    const y = youngMan(t);
    const yp = y.where === "hut" ? y.pos : hutW(1.0, 1.0);
    const pos = add(yp, [lerp(0.75, 0.55, k), 0.42, lerp(0.35, 0.75, k)]);
    const tg = L3(head(y, 0.15), hutW(0.0, 0.2, 0.22), seg(t, E("s2f") - 1, T("s3b")));
    return { pos, target: tg, fov: 38 };
  });
  // D the talk on the porch
  add_(T("s3b"), T("s3c"), move({ pos: hutW(0.15, 1.15, 0.45), target: hutW(0.12, 0.28, 0.2), fov: 36 }, { pos: hutW(0.18, 1.0, 0.4), target: hutW(0.12, 0.28, 0.2), fov: 36 }));
  add_(T("s3c"), T("s3f"), (k, t) => {
    const y = youngMan(t);
    return move({ pos: hutW(-0.42, 0.62, 0.36), target: head(y, 0.16), fov: 34 }, { pos: hutW(-0.38, 0.52, 0.33), target: head(y, 0.17), fov: 32 })(k);
  });
  add_(T("s3f"), T("s4a"), (k, t) => {
    const o = oldMan(t);
    return move({ pos: hutW(0.78, 0.66, 0.38), target: head(o, 0.17), fov: 33 }, { pos: hutW(0.62, 0.55, 0.34), target: head(o, 0.17), fov: 30 })(k);
  });
  // E the glass of salt water
  add_(T("s4a"), T("s4c"), move({ pos: hutW(0.2, 0.62, 0.36), target: HUT_GLASS, fov: 30 }, { pos: hutW(0.17, 0.5, 0.27), target: add(HUT_GLASS, [0, -0.02, 0]), fov: 28 }));
  add_(T("s4c"), T("s4e"), move({ pos: hutW(0.15, 0.98, 0.5), target: hutW(0.12, 0.28, 0.18), fov: 34 }, { pos: hutW(0.1, 0.9, 0.46), target: hutW(0.12, 0.28, 0.18), fov: 34 }));
  add_(T("s4e"), T("s4g"), (k, t) => {
    const y = youngMan(t);
    return move({ pos: hutW(-0.3, 0.72, 0.36), target: head(y, 0.16), fov: 30 }, { pos: hutW(-0.25, 0.68, 0.34), target: head(y, 0.16), fov: 28 })(k);
  });
  add_(T("s4g"), T("s5a"), (k, t) => {
    const o = oldMan(t);
    return move({ pos: hutW(0.75, 0.62, 0.35), target: head(o, 0.17), fov: 30 }, { pos: hutW(0.7, 0.6, 0.33), target: head(o, 0.17), fov: 28 })(k);
  });
  // F out of the hut jar, across the table, down into the forest of the big vessel
  const forestIn = { pos: lakeW(-1.05, -1.55, 0.55), target: lakeW(-1.9, -1.9, 0.25), fov: 40 };
  add_(T("s5a"), T("s5b"), move({ pos: hutW(0.6, 1.2, 0.8), target: hutW(-0.1, -0.2, 0.3), fov: 38 }, forestIn, [-3.2, 5.2, 4.5]));
  // G the walk through the woods (tracking from the lake side)
  add_(T("s5b"), T("s5d"), (k, t) => {
    const o = oldMan(t), y = youngMan(t);
    const mid = L3(o.pos, y.pos, 0.5);
    // follow from behind along the (tree-free) path, a little above head height
    const w0 = T("s5a") + 2.6, w1 = T("s5d") + 2.5;
    const kb = clamp((t - w0) / (w1 - w0) - 0.2);
    const [bx, bz] = polyAt(LAKE_PATH, Math.max(0, kb));
    const pos: V3 = lakeW(bx, bz, 0.62);
    const p0 = forestIn;
    const live = { pos, target: add(mid, [0, 0.22, 0]), fov: 40 };
    const e = seg(t, T("s5b"), T("s5b") + 1.2);
    return { pos: L3(p0.pos, live.pos, e), target: L3(p0.target, live.target, e), fov: 40 };
  });
  // H the lake opens up
  add_(T("s5d"), T("s6a"), move({ pos: lakeW(-2.45, 1.0, 0.55), target: lakeW(-1.75, 2.1, 0.2), fov: 42 }, { pos: lakeW(-2.5, 1.2, 1.25), target: lakeW(0.4, 0.4, 0.0), fov: 44 }));
  // I salt into the lake, stir, the young man drinks
  add_(T("s6a"), T("s6c"), (k) => move({ pos: [LAKE.cx + SHORE.saltTarget[0] + 0.9, 0.95, LAKE.cz + SHORE.saltTarget[1] + 0.5], target: lakeW(SHORE.old[0], SHORE.old[1], 0.25), fov: 34 }, { pos: [LAKE.cx + SHORE.saltTarget[0] + 1.1, 1.2, LAKE.cz + SHORE.saltTarget[1] + 0.1], target: lakeW(SHORE.old[0] + 0.2, SHORE.old[1] - 0.6, 0.1), fov: 42 })(k));
  add_(T("s6c"), T("s6f"), move({ pos: lakeW(-2.2, 1.0, 0.75), target: lakeW(...SHORE.stir, 0.05), fov: 38 }, { pos: lakeW(-2.05, 1.25, 0.6), target: lakeW(...SHORE.stir, 0.05), fov: 36 }));
  add_(T("s6f"), T("s6h"), move({ pos: lakeW(-0.3, 1.35, 0.5), target: lakeW(-0.95, 2.25, 0.2), fov: 36 }, { pos: lakeW(-0.45, 1.5, 0.42), target: lakeW(-1.0, 2.2, 0.15), fov: 34 }));
  add_(T("s6h"), T("s7a"), (k, t) => {
    const ang = lerp(0.2, -0.25, k);
    const c = lakeW((SHORE.old[0] + SHORE.kneel[0]) / 2, (SHORE.old[1] + SHORE.kneel[1]) / 2, 0.16);
    void t;
    return { pos: [c[0] + Math.sin(ang) * 1.05, c[1] + 0.32, c[2] - Math.cos(ang) * 1.05], target: c, fov: 36 };
  });
  // J pat on the back, sit facing each other
  add_(T("s7a"), T("s7c"), move({ pos: lakeW(-0.4, 1.55, 0.45), target: lakeW(SHORE.kneel[0] + 0.1, SHORE.kneel[1], 0.15), fov: 36 }, { pos: lakeW(-0.55, 1.4, 0.55), target: lakeW((SHORE.sitOld[0] + SHORE.sitYoung[0]) / 2, (SHORE.sitOld[1] + SHORE.sitYoung[1]) / 2, 0.12), fov: 36 }));
  // K the lesson begins (over the young man's shoulder onto the old man)
  const sitMid = lakeW((SHORE.sitOld[0] + SHORE.sitYoung[0]) / 2, (SHORE.sitOld[1] + SHORE.sitYoung[1]) / 2, 0.12);
  add_(T("s7c"), T("s7e"), (k, t) => {
    const o = oldMan(t);
    const yv = lakeW(SHORE.sitYoung[0], SHORE.sitYoung[1], 0);
    const back: V3 = [yv[0] + (yv[0] - o.pos[0]) * 1.6 + 0.25, yv[1] + 0.42, yv[2] + (yv[2] - o.pos[2]) * 1.6 + 0.45];
    return move({ pos: back, target: head(o, 0.12), fov: 32 }, { pos: add(back, [0.05, -0.02, -0.05]), target: head(o, 0.12), fov: 30 })(k);
  });
  // L "the vessel is our heart": rise out of the vessel to the table
  add_(T("s7e"), E("s7f") + 0.6, move({ pos: lakeW(-0.4, 1.6, 0.5), target: sitMid, fov: 34 }, TABLE_WIDE, [0.4, 3.5, 4.2]));
  // M back down to the two of them at dusk
  add_(E("s7f") + 0.6, T("s7h"), move(TABLE_WIDE, { pos: lakeW(0.1, 1.55, 0.55), target: sitMid, fov: 36 }, [0.2, 3.2, 3.5]));
  add_(T("s7h"), T("s7j"), (k) => {
    const ang = lerp(-0.6, 0.5, k);
    return { pos: [sitMid[0] + Math.sin(ang) * 1.0, sitMid[1] + 0.3, sitMid[2] - Math.cos(ang) * 1.0 * -1], target: sitMid, fov: 36 };
  });
  // N payoff: the small glass, then the big lake
  add_(T("s7j"), T("s7k"), move({ pos: [CUP.x + 0.15, 0.95, CUP.z + 1.55], target: [CUP.x, 0.45, CUP.z], fov: 30 }, { pos: [CUP.x + 0.05, 0.85, CUP.z + 1.35], target: [CUP.x, 0.45, CUP.z], fov: 28 }));
  add_(T("s7k"), E("s7k") + 1.0, move({ pos: [CUP.x + 0.05, 0.85, CUP.z + 1.35], target: [CUP.x, 0.45, CUP.z], fov: 28 }, { pos: [-1.2, 4.0, 9.2], target: [-1.05, 0.95, -1.0], fov: 31 }, [-3.4, 1.6, 5.0]));
  // O home at night
  add_(E("s7k") + 1.0, T("s8b"), (k, t) => {
    const o = oldMan(t), y = youngMan(t);
    const mid = L3(o.pos, y.pos, 0.5);
    return move({ pos: lakeW(-1.2, 2.0, 0.85), target: add(mid, [0, 0.2, 0]), fov: 40 }, { pos: lakeW(-1.5, 1.4, 0.6), target: add(mid, [0, 0.2, 0]), fov: 40 })(k);
  });
  add_(T("s8b"), T("s8d"), move({ pos: hutW(0.55, 1.15, 0.45), target: hutW(0.0, 0.3, 0.2), fov: 36 }, { pos: hutW(0.4, 0.95, 0.35), target: hutW(0.05, 0.3, 0.18), fov: 34 }));
  add_(T("s8d"), T("s8e"), move({ pos: [-3.0, 5.2, 11.5], target: [-2.6, 1.0, -1.2], fov: 34 }, { pos: [-2.4, 4.6, 10.6], target: [-2.2, 1.0, -1.2], fov: 34 }));
  add_(T("s8e"), TOTAL + 1, move({ pos: [0.9, 1.1, 4.2], target: [2.05, 0.2, 0.85], fov: 30 }, { pos: [1.6, 0.42, 2.3], target: [2.08, 0.14, 0.86], fov: 26 }));
  return s;
};
const SHOTS = shots();
export const cameraAt = (t: number): CamPose => {
  const sh = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  return sh.cam(clamp((t - sh.a) / (sh.b - sh.a)), t);
};
export const SHOT_STARTS = SHOTS.map((x) => x.a);
