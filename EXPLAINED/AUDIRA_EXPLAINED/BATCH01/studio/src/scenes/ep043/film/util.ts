// Timing + camera helpers for EP043. All beats come from timeline.json (Audio Master Clock).
import tl from "../timeline.json";

export const TL = tl;
export const SEC = tl.sections;

type Word = { w: string; s: number; e: number };
const WORDS: Word[] = tl.clips.flatMap((c) => c.words as Word[]);
const norm = (w: string) => w.replace(/[.,:?!]/g, "").toLowerCase();

/** Start (s) of the n-th occurrence of a spoken word. Throws if the script changed. */
export const wt = (w: string, n = 0): number => {
  const m = WORDS.filter((x) => norm(x.w) === norm(w));
  if (!m[n]) throw new Error(`timeline word not found: ${w} #${n}`);
  return m[n].s;
};

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const inOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const backOut = (x: number) => {
  const t = clamp01(x);
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Cam = { x: number; y: number; z: number; r?: number };
export type Key = [number, number, number, number]; // t, x, y, zoom

/** Keyframed camera with eased segments + a slow handheld drift so it never freezes. */
export const camAt = (keys: Key[], t: number, drift = 1): Cam => {
  let x = keys[0][1];
  let y = keys[0][2];
  let z = keys[0][3];
  if (t >= keys[keys.length - 1][0]) {
    const k = keys[keys.length - 1];
    x = k[1];
    y = k[2];
    z = k[3];
  } else {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a[0] && t < b[0]) {
        const u = inOut((t - a[0]) / (b[0] - a[0]));
        x = lerp(a[1], b[1], u);
        y = lerp(a[2], b[2], u);
        z = a[3] * Math.pow(b[3] / a[3], u);
        break;
      }
    }
  }
  return {
    x: x + Math.sin(t * 0.55) * 7 * drift,
    y: y + Math.cos(t * 0.43) * 6 * drift,
    z: z * (1 + Math.sin(t * 0.31) * 0.012 * drift),
    r: Math.sin(t * 0.27) * 0.35 * drift,
  };
};

/** SVG transform for a world layer at parallax depth p (1 = locked to camera). */
export const layerT = (cam: Cam, p = 1, rx = 540, ry = 960) => {
  const xL = rx + (cam.x - rx) * p;
  const yL = ry + (cam.y - ry) * p;
  const zL = Math.pow(cam.z, p);
  return `translate(540 960) rotate(${(cam.r ?? 0) * p}) scale(${zL}) translate(${-xL} ${-yL})`;
};

/** World point -> screen point (1080x1920) for a layer at depth p (rotation ignored, it is < 0.4 deg). */
export const proj = (cam: Cam, x: number, y: number, p = 1, rx = 540, ry = 960): [number, number] => {
  const xL = rx + (cam.x - rx) * p;
  const yL = ry + (cam.y - ry) * p;
  const zL = Math.pow(cam.z, p);
  return [540 + (x - xL) * zL, 960 + (y - yL) * zL];
};

/** Deterministic camera shake (only for impact beats). */
export const shake = (t: number, at: number, dur = 0.5, amp = 10): [number, number] => {
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return [0, 0];
  const a = amp * (1 - u) * (1 - u);
  return [Math.sin(t * 91) * a, Math.cos(t * 73) * a];
};

/** Start (s) of a VO clip by id (l01..l15). */
export const cs = (id: string): number => {
  const c = tl.clips.find((x) => x.id === id);
  if (!c) throw new Error(`clip not found: ${id}`);
  return c.start;
};
