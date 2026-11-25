// Yarn-cord letters: each glyph is one or more strokes (polylines in a unit box, x 0..0.8, y 0..1),
// densely resampled so a Catmull-Rom tube keeps crisp-but-soft corners like a couched cord.
// Only the glyphs the brand needs are drawn by hand; unknown characters return no strokes.

export type Stroke = [number, number][];

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 14): Stroke =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

const GLYPHS: Record<string, Stroke[]> = {
  A: [
    [[0, 0], [0.4, 1], [0.8, 0]],
    [[0.17, 0.4], [0.63, 0.4]],
  ],
  U: [[[0, 1], [0, 0.36], ...arc(0.4, 0.36, 0.4, Math.PI, Math.PI * 2).slice(1), [0.8, 1]]],
  D: [[[0.04, 0], [0.04, 1], [0.32, 1], ...arc(0.32, 0.5, 0.5, Math.PI / 2, -Math.PI / 2, 18).slice(1), [0.04, 0]]],
  I: [
    [[0.4, 0], [0.4, 1]],
    [[0.18, 1], [0.62, 1]],
    [[0.18, 0], [0.62, 0]],
  ],
  R: [
    [[0.04, 0], [0.04, 1], [0.42, 1], ...arc(0.42, 0.74, 0.26, Math.PI / 2, -Math.PI / 2, 12).slice(1), [0.04, 0.48]],
    [[0.36, 0.48], [0.8, 0]],
  ],
};

/** Resample a polyline every `step` (unit-box units) so corners stay near-sharp under Catmull-Rom. */
export function resample(s: Stroke, step = 0.05): Stroke {
  const out: Stroke = [s[0]];
  for (let i = 1; i < s.length; i++) {
    const [ax, ay] = s[i - 1], [bx, by] = s[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}

export const glyphStrokes = (ch: string): Stroke[] => (GLYPHS[ch] ?? []).map((s) => resample(s));

export const strokeLength = (s: Stroke) => {
  let L = 0;
  for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
  return L;
};

/** Point at fraction k (0..1) of a stroke's length. */
export function strokeAt(s: Stroke, k: number): [number, number] {
  const L = strokeLength(s) * Math.min(1, Math.max(0, k));
  let acc = 0;
  for (let i = 1; i < s.length; i++) {
    const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
    if (acc + d >= L) {
      const f = d > 0 ? (L - acc) / d : 0;
      return [s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f];
    }
    acc += d;
  }
  return s[s.length - 1];
}
