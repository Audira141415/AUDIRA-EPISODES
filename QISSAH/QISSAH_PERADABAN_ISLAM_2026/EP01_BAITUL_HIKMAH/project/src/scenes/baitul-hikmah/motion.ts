// Baitul Hikmah motion core. Frame clock f is 60-based (f = frame/fps * 60).
// Total duration ~63s = 3780 frames @60fps, 1890 @30fps.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const vnoise = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const fr = x - i;
  return hash(i + seed * 57.3) + (hash(i + 1 + seed * 57.3) - hash(i + seed * 57.3)) * smooth(fr);
};
export const candleFlicker = (t: number, seed: number) =>
  0.84 + 0.11 * vnoise(t * 5.5, seed) + 0.05 * vnoise(t * 15, seed + 2);

// Beat timing (seconds):
// Hook:          0–5    ink in water
// Baghdad:       5–15   miniature city on table
// Translation:  15–30   scrolls, quill writing
// Khawarizmi:   30–37   algebra equations float
// Banu Musa:    37–42   mechanical devices
// Destruction:  42–52   water floods table
// Closing:      52–63   letters rise from water

export const BEATS = {
  hook:        { start: 0,  end: 5  },
  baghdad:     { start: 5,  end: 15 },
  translation: { start: 15, end: 30 },
  khawarizmi:  { start: 30, end: 37 },
  banuMusa:    { start: 37, end: 42 },
  destruction: { start: 42, end: 52 },
  closing:     { start: 52, end: 63 },
} as const;

export interface BaitulState {
  t: number;
  /** 0–1 water flood level during destruction beat */
  floodLevel: number;
  /** 0–1 ink spread in water (hook + destruction) */
  inkSpread: number;
  /** 0–1 letters rising from water (closing) */
  lettersRise: number;
  /** 0–1 scroll unroll progress (translation beat) */
  scrollUnroll: number;
  /** 0–1 algebra equations floating (khawarizmi beat) */
  algebraFloat: number;
  /** 0–1 gear rotation progress (banu musa beat) */
  gearSpin: number;
  /** Current beat name */
  beat: keyof typeof BEATS;
}

export const computeState = (f: number): BaitulState => {
  const t = f / 60;
  const beat: keyof typeof BEATS =
    t < 5 ? "hook" : t < 15 ? "baghdad" : t < 30 ? "translation" :
    t < 37 ? "khawarizmi" : t < 42 ? "banuMusa" : t < 52 ? "destruction" : "closing";

  return {
    t,
    floodLevel: easeInOut(ramp(t, 43, 51)),
    inkSpread: Math.max(smooth(ramp(t, 0.5, 4)), smooth(ramp(t, 44, 50))),
    lettersRise: easeInOut(ramp(t, 53, 61)),
    scrollUnroll: easeInOut(ramp(t, 16, 22)),
    algebraFloat: easeInOut(ramp(t, 31, 35)),
    gearSpin: easeInOut(ramp(t, 38, 41)),
    beat,
  };
};

type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number) => a.map((v, i) => lerp(v, b[i], k)) as V3;

export interface CameraConfig {
  position: V3;
  target: V3;
  fov: number;
}

export const getCamera = (f: number): CameraConfig => {
  const t = f / 60;

  // Beat positions and targets — continuous camera, no hard cuts
  // Hook: table-level view of ink bowl with bookshelves visible behind
  const hookPos: V3 = [0, 1.1, 1.5];
  const hookTgt: V3 = [0, 0.62, 0.3];

  // Baghdad: orbit above miniature city
  const baghdadPos: V3 = [-1.5, 1.8, 1.5];
  const baghdadTgt: V3 = [-1.5, 0.6, 0];

  // Translation: track lateral along table
  const transPos: V3 = [0, 1.4, 2.0];
  const transTgt: V3 = [0, 0.6, 0];

  // Khawarizmi: push in to book
  const khawarPos: V3 = [1.5, 1.2, 1.2];
  const khawarTgt: V3 = [1.5, 0.7, 0];

  // Banu Musa: arc around mechanical device
  const banuPos: V3 = [3.0, 1.0, 1.4];
  const banuTgt: V3 = [3.0, 0.6, 0];

  // Destruction: crane up as water rises
  const destroyPos: V3 = [1.0, 3.0, 3.0];
  const destroyTgt: V3 = [1.0, 0, 0];

  // Closing: rising letters above table, scriptorium still visible
  const closePos: V3 = [0.5, 2.0, 2.8];
  const closeTgt: V3 = [0.5, 1.5, 0];

  // Smooth blend between positions
  const a = easeInOut(ramp(t, 3, 6));       // hook → baghdad
  const b = easeInOut(ramp(t, 13, 16));      // baghdad → translation
  const c = easeInOut(ramp(t, 28, 31));      // translation → khawarizmi
  const d = easeInOut(ramp(t, 35, 38));      // khawarizmi → banu musa
  const e = easeInOut(ramp(t, 40, 43));      // banu musa → destruction
  const g = easeInOut(ramp(t, 50, 53));      // destruction → closing

  let pos = mix(
    mix(mix(mix(mix(mix(hookPos, baghdadPos, a), transPos, b), khawarPos, c), banuPos, d), destroyPos, e),
    closePos,
    g,
  );
  const tgt = mix(
    mix(mix(mix(mix(mix(hookTgt, baghdadTgt, a), transTgt, b), khawarTgt, c), banuTgt, d), destroyTgt, e),
    closeTgt,
    g,
  );

  // Subtle handheld drift
  pos = [
    pos[0] + Math.sin(t * 0.7) * 0.03,
    pos[1] + Math.sin(t * 0.9) * 0.02,
    pos[2] + Math.sin(t * 0.5) * 0.02,
  ];

  // Baghdad orbit motion
  if (t > 5 && t < 15) {
    const orbitT = ramp(t, 5, 15);
    const angle = orbitT * Math.PI * 0.4 - Math.PI * 0.2;
    const radius = 2.2;
    pos[0] = baghdadTgt[0] + Math.sin(angle) * radius;
    pos[2] = baghdadTgt[2] + Math.cos(angle) * radius;
  }

  // Banu Musa arc
  if (t > 37 && t < 42) {
    const arcT = ramp(t, 37, 42);
    const angle = arcT * Math.PI * 0.6;
    pos[0] = banuTgt[0] + Math.sin(angle) * 1.4;
    pos[2] = banuTgt[2] + Math.cos(angle) * 1.4;
  }

  const fov = lerp(lerp(lerp(lerp(lerp(lerp(28, 36, a), 38, b), 32, c), 34, d), 42, e), 50, g);

  return { position: pos, target: tgt, fov };
};
