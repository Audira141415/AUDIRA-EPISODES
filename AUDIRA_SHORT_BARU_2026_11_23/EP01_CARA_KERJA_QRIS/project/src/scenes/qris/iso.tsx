// ISOCRAFT 2D toolkit: true isometric (30°) SVG primitives with three flat tones per face.
// x runs down-right, y down-left, z up. Draw order is manual (back to front).
import React from "react";
import { continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";

export const C30 = Math.cos(Math.PI / 6);
export const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export const COL = {
  ground: "#F3E7D2",
  ink: "#1F1A2C",
  success: "#23B26D",
  qris: "#E0262E",
  issuer: "#2F6FDE",
  switch: "#F2A93B",
  acquirer: "#7B5AE0",
  merchant: "#E8664A",
  board: "#EACB98",
  soil: "#A88B66",
  grey: "#CFC6B8",
  white: "#FFFDF8",
  graphite: "#3A3446",
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
/** Focus + context: unfocused colours drift toward warm grey. */
export const dim = (c: string, focus: number) => mix(c, COL.grey, (1 - focus) * 0.72);
export const tones = (c: string) => ({ top: mix(c, "#FFF8EC", 0.22), left: c, right: mix(c, "#231A2C", 0.24) });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const lerp = (t: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing: e });
/** 0→1 with back-ease overshoot (pop). */
export const pop = (t: number, at: number, dur = 0.35) => lerp(t, at, at + dur, 0, 1, Easing.out(Easing.back(1.8)));
export const win = (t: number, a: number, b: number, fade = 0.25) =>
  Math.min(lerp(t, a, a + fade, 0, 1), lerp(t, b - fade, b, 1, 0));

/** Keyframed value: [[t, v], ...] with smooth easing between keys. */
export const keys = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(t, k[i - 1][0], k[i][0], k[i - 1][1], k[i][1]);
  return k[k.length - 1][1];
};

export const Box: React.FC<{ x: number; y: number; z?: number; w: number; d: number; h: number; c: string; focus?: number; o?: number }> = ({
  x, y, z = 0, w, d, h, c, focus = 1, o = 1,
}) => {
  const t = tones(dim(c, focus));
  return (
    <g opacity={o}>
      <polygon points={pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)])} fill={t.left} />
      <polygon points={pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)])} fill={t.right} />
      <polygon points={pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])} fill={t.top} />
    </g>
  );
};

/** Iso cylinder (axis z). */
export const Cyl: React.FC<{ x: number; y: number; z?: number; r: number; h: number; c: string; focus?: number }> = ({ x, y, z = 0, r, h, c, focus = 1 }) => {
  const t = tones(dim(c, focus));
  const [cx, cyB] = P(x, y, z);
  const cyT = cyB - h;
  const rx = r * Math.SQRT2 * C30, ry = r * Math.SQRT2 * 0.5;
  return (
    <g>
      <path d={`M${cx - rx},${cyT} L${cx - rx},${cyB} A${rx},${ry} 0 0 0 ${cx + rx},${cyB} L${cx + rx},${cyT} Z`} fill={t.left} />
      <path d={`M${cx},${cyT} L${cx},${cyB + ry} A${rx},${ry} 0 0 0 ${cx + rx},${cyB} L${cx + rx},${cyT} Z`} fill={t.right} />
      <ellipse cx={cx} cy={cyT} rx={rx} ry={ry} fill={t.top} />
    </g>
  );
};

/** Floating diorama board with strata and a soft shadow. */
export const Board: React.FC<{ x: number; y: number; w: number; d: number; c?: string; focus?: number }> = ({ x, y, w, d, c = COL.board, focus = 1 }) => {
  const [sx, sy] = P(x + w / 2, y + d / 2, -90);
  return (
    <g>
      <ellipse cx={sx} cy={sy} rx={(w + d) * 0.5} ry={(w + d) * 0.17} fill="#1F1A2C" opacity={0.1} filter="url(#soft)" />
      <Box x={x} y={y} z={-46} w={w} d={d} h={22} c={COL.soil} focus={focus} />
      <Box x={x} y={y} z={-24} w={w} d={d} h={10} c="#C9B48F" focus={focus} />
      <Box x={x} y={y} z={-14} w={w} d={d} h={14} c={c} focus={focus} />
    </g>
  );
};

/** Pale station plate with a dashed ink outline. */
export const Pad: React.FC<{ x: number; y: number; w: number; d: number; c: string; o?: number }> = ({ x, y, w, d, c, o = 1 }) => (
  <polygon
    points={pts([P(x, y, 0.5), P(x + w, y, 0.5), P(x + w, y + d, 0.5), P(x, y + d, 0.5)])}
    fill={mix(c, "#FFFFFF", 0.72)}
    stroke={COL.ink}
    strokeWidth={2}
    strokeDasharray="10 8"
    opacity={o}
  />
);

/** Deterministic QR-like module grid (illustration only, not scannable). */
export const qrGrid = (seed: number, n = 21): boolean[][] => {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const g = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() > 0.52));
  const finder = (ox: number, oy: number) => {
    for (let i = -1; i < 8; i++) for (let j = -1; j < 8; j++) {
      const X = ox + i, Y = oy + j;
      if (X < 0 || Y < 0 || X >= n || Y >= n) continue;
      const ring = Math.max(Math.abs(i - 3), Math.abs(j - 3));
      g[Y][X] = ring === 3 || ring <= 1;
      if (i < 0 || j < 0 || i > 6 || j > 6) g[Y][X] = false;
    }
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  return g;
};

/** Paint a QR grid on any plane: origin + u (column step) + v (row step), in screen px. */
export const QrPlane: React.FC<{ o: [number, number]; u: [number, number]; v: [number, number]; seed: number; n?: number; size: number; fill?: string; bg?: string; reveal?: number }> = ({
  o, u, v, seed, n = 21, size, fill = COL.ink, bg = COL.white, reveal = 1,
}) => {
  const g = React.useMemo(() => qrGrid(seed, n), [seed, n]);
  const cu: [number, number] = [(u[0] * size) / n, (u[1] * size) / n];
  const cv: [number, number] = [(v[0] * size) / n, (v[1] * size) / n];
  const at = (i: number, j: number): [number, number] => [o[0] + cu[0] * i + cv[0] * j, o[1] + cu[1] * i + cv[1] * j];
  let d = "";
  const rows = Math.round(n * reveal);
  for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) if (g[j][i]) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), e = at(i, j + 1);
    d += `M${a[0].toFixed(1)},${a[1].toFixed(1)}L${b[0].toFixed(1)},${b[1].toFixed(1)}L${c[0].toFixed(1)},${c[1].toFixed(1)}L${e[0].toFixed(1)},${e[1].toFixed(1)}Z`;
  }
  const m = -1.2;
  return (
    <g>
      <polygon points={pts([at(m, m), at(n - m, m), at(n - m, n - m), at(m, n - m)])} fill={bg} />
      <path d={d} fill={fill} />
    </g>
  );
};

/** Text painted on the +y (left-visible) vertical face starting at world point. */
export const FaceText: React.FC<{ x: number; y: number; z: number; size: number; children: React.ReactNode; fill?: string; weight?: number; anchor?: "start" | "middle" }> = ({
  x, y, z, size, children, fill = COL.ink, weight = 700, anchor = "start",
}) => {
  const [sx, sy] = P(x, y, z);
  return (
    <text transform={`matrix(${C30},0.5,0,1,${sx},${sy})`} fontFamily="'Space Grotesk'" fontWeight={weight} fontSize={size} fill={fill} textAnchor={anchor}>
      {children}
    </text>
  );
};

/** Upright phone standing on the ground, screen on its +y face. */
export const Phone: React.FC<{ x: number; y: number; z?: number; screen: string; s?: number; focus?: number; children?: React.ReactNode }> = ({ x, y, z = 0, screen, s = 1, focus = 1, children }) => {
  const w = 70 * s, h = 140 * s, d = 10 * s;
  const [ox, oy] = P(x + 6 * s, y + d, z + h - 8 * s);
  return (
    <g>
      <Box x={x} y={y} z={z} w={w} d={d} h={h} c={COL.graphite} focus={focus} />
      <polygon points={pts([P(x + 6 * s, y + d + 0.5, z + 10 * s), P(x + w - 6 * s, y + d + 0.5, z + 10 * s), P(x + w - 6 * s, y + d + 0.5, z + h - 8 * s), P(x + 6 * s, y + d + 0.5, z + h - 8 * s)])} fill={screen} />
      <g transform={`matrix(${C30},0.5,0,1,${ox},${oy})`}>{children}</g>
    </g>
  );
};

/** Office building with window bands. */
export const Building: React.FC<{ x: number; y: number; w: number; d: number; h: number; c: string; focus?: number; label?: string }> = ({ x, y, w, d, h, c, focus = 1, label }) => {
  const bands = Math.floor(h / 34);
  const win = mix(dim(c, focus), "#FFFFFF", 0.55);
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} c={c} focus={focus} />
      {Array.from({ length: bands - 1 }, (_, i) => {
        const z0 = 22 + i * 34;
        return (
          <g key={i}>
            <polygon points={pts([P(x + 10, y + d + 0.5, z0), P(x + w - 10, y + d + 0.5, z0), P(x + w - 10, y + d + 0.5, z0 + 14), P(x + 10, y + d + 0.5, z0 + 14)])} fill={win} />
            <polygon points={pts([P(x + w + 0.5, y + 10, z0), P(x + w + 0.5, y + d - 10, z0), P(x + w + 0.5, y + d - 10, z0 + 14), P(x + w + 0.5, y + 10, z0 + 14)])} fill={mix(win, "#231A2C", 0.25)} />
          </g>
        );
      })}
      {label ? (
        <g>
          <polygon points={pts([P(x + 4, y + d + 0.8, h - 42), P(x + w - 4, y + d + 0.8, h - 42), P(x + w - 4, y + d + 0.8, h - 4), P(x + 4, y + d + 0.8, h - 4)])} fill="#FFFDF8" />
          <FaceText x={x + w / 2} y={y + d + 1.2} z={h - 13} size={Math.min(36, (w * 1.5) / String(label).length)} anchor="middle">{label}</FaceText>
        </g>
      ) : null}
    </g>
  );
};

/** Minimal person billboard (Isotype). */
export const Person: React.FC<{ x: number; y: number; c: string; s?: number; o?: number }> = ({ x, y, c, s = 1, o = 1 }) => {
  const [sx, sy] = P(x, y, 0);
  return (
    <g transform={`translate(${sx},${sy}) scale(${s})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={12} ry={6} fill="#1F1A2C" opacity={0.12} />
      <path d="M-11,0 L-8,-30 Q0,-36 8,-30 L11,0 Z" fill={c} />
      <path d="M0,-33 Q8,-31 8,-30 L11,0 L0,0 Z" fill={mix(c, "#231A2C", 0.24)} />
      <circle cx={0} cy={-44} r={9} fill={mix(c, "#FFF8EC", 0.25)} />
    </g>
  );
};

/** Little shop (Isotype). */
export const Shop: React.FC<{ x: number; y: number; c: string; o?: number; s?: number }> = ({ x, y, c, o = 1, s = 1 }) => (
  <g opacity={o}>
    <Box x={x} y={y} w={26 * s} d={26 * s} h={22 * s} c={c} />
    <Box x={x - 3 * s} y={y - 3 * s} z={22 * s} w={32 * s} d={32 * s} h={6 * s} c={COL.qris} />
  </g>
);

/** Data packet: a small glowing green cube. */
export const Packet: React.FC<{ x: number; y: number; z?: number; s?: number; c?: string; check?: boolean }> = ({ x, y, z = 30, s = 1, c = COL.success, check }) => {
  const [sx, sy] = P(x, y, z + 12 * s);
  return (
    <g>
      <circle cx={sx} cy={sy} r={34 * s} fill={c} opacity={0.18} />
      <Box x={x - 12 * s} y={y - 12 * s} z={z} w={24 * s} d={24 * s} h={24 * s} c={c} />
      {check ? <path d={`M${sx - 9 * s},${sy - 12 * s} l${6 * s},${6 * s} l${11 * s},${-12 * s}`} stroke="#fff" strokeWidth={4 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

/** Dashed ink route along world points, drawn up to `p` (0..1). */
export const Route: React.FC<{ pts3: [number, number, number][]; p: number; c?: string; w?: number }> = ({ pts3, p, c = COL.ink, w = 3 }) => {
  const s = pts3.map(([x, y, z]) => P(x, y, z));
  const seg = s.slice(1).map((b, i) => Math.hypot(b[0] - s[i][0], b[1] - s[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, p));
  const out: [number, number][] = [s[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i]);
    out.push([s[i][0] + (s[i + 1][0] - s[i][0]) * f, s[i][1] + (s[i + 1][1] - s[i][1]) * f]);
    left -= seg[i];
  }
  return <polyline points={pts(out)} fill="none" stroke={c} strokeWidth={w} strokeDasharray="12 9" strokeLinecap="round" />;
};

/** Point along a world polyline at fraction f. */
export const along = (pts3: [number, number, number][], f: number): [number, number, number] => {
  const seg = pts3.slice(1).map((b, i) => Math.hypot(b[0] - pts3[i][0], b[1] - pts3[i][1], b[2] - pts3[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, f));
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const k = left / seg[i];
      return [0, 1, 2].map((j) => pts3[i][j] + (pts3[i + 1][j] - pts3[i][j]) * k) as [number, number, number];
    }
    left -= seg[i];
  }
  return pts3[pts3.length - 1];
};

// ── fonts ───────────────────────────────────────────────────────────────────
let fontsReady: Promise<void> | null = null;
export const useIsoFonts = () => {
  const [handle] = React.useState(() => (typeof document === "undefined" ? null : delayRender("qris fonts")));
  React.useEffect(() => {
    if (handle === null) return;
    fontsReady ??= Promise.all([
      new FontFace("Space Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }).load(),
      new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`).load(),
    ]).then((faces) => faces.forEach((f) => (document.fonts as unknown as { add(f: FontFace): void }).add(f)));
    fontsReady.then(() => continueRender(handle), () => continueRender(handle));
  }, [handle]);
};
