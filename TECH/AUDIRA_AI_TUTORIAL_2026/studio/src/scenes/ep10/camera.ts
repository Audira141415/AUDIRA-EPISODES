// EP10 camera track through the noir office (Cover.tsx world). Keys are VO seconds from timeline.json;
// between keys the camera glides (short legs eased, long legs linear) so it never parks. `cut: true` = hard cut.

export type V3 = [number, number, number];
type Key = { t: number; pos: V3; target: V3; fov: number; cut?: boolean };

// world refs: open drawer cards ~(-0.6, 1.35, 0.06..0.62), AUDIRA plate (-0.6, 1.335, 0.74),
// lamp head (-0.64, 1.92, -0.06), bin (0.32, 0, 0.82), clock (1.0, 2.12, -0.58) + 72 JAM plate y 1.8,
// clerk (0.84, 0, 0.44). Visible width at distance d = 2·d·tan(fov/2)·9/16.
export const KEYS: Key[] = [
  // HOOK: straight into the drawer of chat cards, then the AUDIRA plate, then follow a card to the bin
  { t: 0.0, pos: [-0.22, 2.6, 2.5], target: [-0.6, 1.3, 0.35], fov: 36 },
  { t: 5.0, pos: [-0.35, 2.3, 2.0], target: [-0.6, 1.28, 0.38], fov: 36 },
  { t: 5.1, pos: [-0.05, 1.62, 2.95], target: [-0.6, 1.3, 0.72], fov: 30, cut: true },
  { t: 7.7, pos: [-0.35, 1.55, 2.6], target: [-0.6, 1.3, 0.72], fov: 30 },
  { t: 9.85, pos: [0.85, 1.35, 3.3], target: [0.05, 0.75, 0.75], fov: 34 },
  // KONTEKS: the cover wide, orbit the cabinet in the moonlight, crane over the full drawer
  { t: 9.95, pos: [1.15, 2.05, 7.9], target: [0.0, 0.9, 0.1], fov: 34, cut: true },
  { t: 13.55, pos: [0.75, 1.95, 7.0], target: [0.0, 0.88, 0.1], fov: 34 },
  { t: 13.65, pos: [-2.2, 2.5, 4.3], target: [-0.45, 1.05, 0.25], fov: 36, cut: true },
  { t: 21.0, pos: [-1.35, 2.85, 3.65], target: [-0.5, 1.1, 0.25], fov: 36 },
  { t: 21.1, pos: [-0.62, 3.55, 1.75], target: [-0.6, 1.2, 0.36], fov: 36, cut: true },
  { t: 24.4, pos: [-0.6, 3.05, 1.35], target: [-0.6, 1.2, 0.36], fov: 36 },
  // LANGKAH: the dossier panel sits over a slow dolly across the office
  { t: 24.5, pos: [1.9, 1.75, 5.2], target: [-0.25, 1.1, 0.2], fov: 38, cut: true },
  { t: 44.6, pos: [-0.4, 1.95, 4.6], target: [-0.1, 1.05, 0.2], fov: 38 },
  // PENJELASAN: low by the bin, then the mass delete, then the 72 JAM clock
  { t: 44.7, pos: [2.0, 0.95, 3.6], target: [0.2, 0.85, 0.3], fov: 38, cut: true },
  { t: 53.7, pos: [1.6, 1.15, 3.3], target: [0.0, 0.9, 0.3], fov: 38 },
  { t: 53.8, pos: [0.85, 1.75, 3.75], target: [-0.15, 0.85, 0.45], fov: 38, cut: true },
  { t: 56.4, pos: [0.65, 1.65, 3.25], target: [-0.1, 0.8, 0.5], fov: 38 },
  { t: 56.5, pos: [0.8, 1.95, 1.05], target: [1.0, 1.97, -0.58], fov: 34, cut: true },
  { t: 63.2, pos: [0.55, 1.95, 1.85], target: [0.95, 1.9, -0.58], fov: 34 },
  // PAYOFF: the clerk under the lamp, the HAPUS bin close, then pull back wide
  { t: 63.3, pos: [2.05, 1.55, 2.85], target: [0.6, 1.0, 0.35], fov: 36, cut: true },
  { t: 70.7, pos: [1.7, 1.6, 2.45], target: [0.55, 1.0, 0.35], fov: 36 },
  { t: 70.8, pos: [0.95, 0.9, 2.45], target: [0.32, 0.35, 0.85], fov: 34, cut: true },
  { t: 76.85, pos: [0.65, 0.95, 2.2], target: [0.32, 0.35, 0.85], fov: 34 },
  { t: 76.95, pos: [-0.3, 2.2, 5.0], target: [0.0, 0.95, 0.2], fov: 36, cut: true },
  { t: 81.2, pos: [0.3, 2.45, 6.6], target: [0.0, 0.95, 0.2], fov: 36 },
  // OUTRO: under the green lamp, rising into the dark
  { t: 81.3, pos: [-0.1, 1.85, 1.9], target: [-0.62, 1.55, 0.1], fov: 34, cut: true },
  { t: 90.3, pos: [-0.2, 2.6, 2.4], target: [-0.62, 1.6, 0.1], fov: 34 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const l3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const raw = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const k = b.cut ? 0 : b.t - a.t <= 3 ? ease(raw) : raw;
  // slight handheld breathing so even holds are alive
  const w: V3 = [Math.sin(t * 0.7) * 0.012, Math.sin(t * 0.53 + 1) * 0.01, 0];
  const p = l3(a.pos, b.pos, k);
  return { pos: [p[0] + w[0], p[1] + w[1], p[2]] as V3, target: l3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) };
};
