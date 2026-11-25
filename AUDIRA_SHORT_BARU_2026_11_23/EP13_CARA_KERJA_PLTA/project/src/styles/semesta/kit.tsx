import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {display, drawOn, lerp, p, pb, pio, rnd, spline, useFrame} from '../shared';
import {halusDrift, halusIdle, halusLevel, SoftShadow, useHalus, zoomAbout} from '../../lib/halus';

// SEMESTA kit — rich FLAT vector astronomy illustration. Light is never a gradient: every body is cut into 3–4
// hard-edged posterized tone bands (true sphere maths: band k = the part of the visible hemisphere where n·L > k),
// characters get a hard two-tone split, hills get a lit rim sliver. Depth = parallax layers, never blur/glow.
// HALUS (v1.16, level 'full' by default): wrap each scene's PICTURE (inside its strata/iris clip) in
// <g transform={semScene(t, {i, from, to, W, H})}> — slow drift on top of the scene's own camera (undefined when off);
// the strata wipe stays the scene change (signature). Title pills + Captions go outside it. Put <HalusDefs ink={SEM.ink} />
// once in the svg and <HalusLight strength={0.6} /> over the picture (night look); villagers/stargazer get soft contact
// shadows + idle sway automatically. The bodies' posterized light is untouched.

export const SEM = {
  space: '#0F2442', haze1: '#153259', haze2: '#1D4170', haze3: '#26508A', star: '#FFF4DC', starDim: '#9DB0CC',
  coral: '#FF7A59', coralSh: '#C9553B', sun: '#FFC24B', sunSh: '#D99A2B', mint: '#5FD4B0', mintSh: '#3FA888',
  cream: '#FFF4E0', creamSh: '#E6D3B0', ink: '#0B1A30', cell: '#183764', cellSh: '#0B1C36',
};
export const HEAD = "'Sem Head', sans-serif";

// ---------------------------------------------------------------- fonts + measuring
let FONTS_OK = false;
/** Holds the frame until Outfit is loaded, so measured pills/captions never use a fallback font. */
export const useSemFonts = () => {
  const [ready, setReady] = useState(FONTS_OK);
  const [handle] = useState(() => (FONTS_OK ? null : delayRender('semesta fonts')));
  useEffect(() => {
    if (FONTS_OK) {
      if (handle !== null) continueRender(handle);
      return;
    }
    Promise.all([600, 700, 800].map((w) => document.fonts.load(`${w} 40px 'Sem Head'`)))
      .then(() => document.fonts.ready)
      .then(() => {
        FONTS_OK = true;
        setReady(true);
        if (handle !== null) continueRender(handle);
      });
  }, [handle]);
  return ready;
};
let CTX: CanvasRenderingContext2D | null = null;
const WCACHE = new Map<string, number>();
export const textW = (text: string, size: number, weight = 700) => {
  const key = `${weight}|${size}|${text}`;
  const hit = WCACHE.get(key);
  if (hit !== undefined) return hit;
  if (!CTX) CTX = document.createElement('canvas').getContext('2d');
  if (!CTX) return text.length * size * 0.56;
  CTX.font = `${weight} ${size}px 'Sem Head'`;
  const w = CTX.measureText(text).width;
  if (FONTS_OK) WCACHE.set(key, w);
  return w;
};

// ---------------------------------------------------------------- parallax camera
/** Camera: focus point x/y in rest-screen coordinates, zoom z. cx/cy = screen centre (default 540/960 = portrait;
 *  landscape scenes pass cx: 960, cy: 540, e.g. camOf(useFrame())). */
export type Cam = {x: number; y: number; z: number; cx?: number; cy?: number};
/** A rest camera for the current frame: looking at the canvas centre, zoom 1 (portrait 540/960, landscape 960/540). */
export const camOf = (fr: {cx: number; cy: number}, z = 1): Cam => ({x: fr.cx, y: fr.cy, z, cx: fr.cx, cy: fr.cy});
/** Layer at depth d (0 = infinitely far, 1 = focal plane, >1 = foreground). screen = t + s * world. */
export const layer = (cam: Cam, d: number) => {
  const s = Math.pow(cam.z, d);
  const CX = cam.cx ?? 540, CY = cam.cy ?? 960;
  const fx = CX + (cam.x - CX) * d, fy = CY + (cam.y - CY) * d;
  return {s, tx: CX - fx * s, ty: CY - fy * s};
};
/** Children designed in screen coordinates for the camera pose `rest` (they sit exactly there when cam = rest). */
export const Layer: React.FC<{cam: Cam; d: number; rest?: Cam; children: React.ReactNode}> = ({cam, d, rest, children}) => {
  const l = layer(cam, d);
  if (!rest) return <g transform={`translate(${l.tx.toFixed(2)} ${l.ty.toFixed(2)}) scale(${l.s.toFixed(5)})`}>{children}</g>;
  const r = layer(rest, d);
  const k = l.s / r.s;
  return <g transform={`translate(${(l.tx - r.tx * k).toFixed(2)} ${(l.ty - r.ty * k).toFixed(2)}) scale(${k.toFixed(5)})`}>{children}</g>;
};
export const toScr = (cam: Cam, d: number, x: number, y: number, rest?: Cam): [number, number] => {
  let wx = x, wy = y;
  if (rest) {
    const r = layer(rest, d);
    wx = (x - r.tx) / r.s;
    wy = (y - r.ty) / r.s;
  }
  const l = layer(cam, d);
  return [l.tx + wx * l.s, l.ty + wy * l.s];
};
/** Scale factor a rest-designed layer has under cam. */
export const layerK = (cam: Cam, d: number, rest: Cam) => layer(cam, d).s / layer(rest, d).s;
export type CamMove = {from: number; to: number} & Partial<Cam>;
export const camPath = (t: number, start: Cam, moves: CamMove[]): Cam => {
  let c = {...start};
  for (const m of moves) {
    const q = pio(t, m.from, m.to);
    c = {...c, x: lerp(c.x, m.x ?? c.x, q), y: lerp(c.y, m.y ?? c.y, q), z: Math.exp(lerp(Math.log(c.z), Math.log(m.z ?? c.z), q))};
  }
  return c;
};

// ---------------------------------------------------------------- small path helpers
type P2 = [number, number];
const f1 = (v: number) => v.toFixed(1);
const f4 = (v: number) => v.toFixed(4);
export const rr = (x: number, y: number, w: number, h: number, r: number) => {
  const q = Math.min(r, w / 2, h / 2);
  return `M${f1(x + q)} ${f1(y)}H${f1(x + w - q)}A${q} ${q} 0 0 1 ${f1(x + w)} ${f1(y + q)}V${f1(y + h - q)}A${q} ${q} 0 0 1 ${f1(x + w - q)} ${f1(y + h)}H${f1(x + q)}A${q} ${q} 0 0 1 ${f1(x)} ${f1(y + h - q)}V${f1(y + q)}A${q} ${q} 0 0 1 ${f1(x + q)} ${f1(y)}Z`;
};
export const circ = (cx: number, cy: number, r: number) => `M${f1(cx - r)} ${f1(cy)}A${r} ${r} 0 1 0 ${f1(cx + r)} ${f1(cy)}A${r} ${r} 0 1 0 ${f1(cx - r)} ${f1(cy)}Z`;
export const polyD = (pts: P2[]) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;
const dotD = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0Z`;
/** Crisp 4-point sparkle. */
export const sparkleD = (x: number, y: number, r: number) => {
  const c = r * 0.17;
  return `M${f1(x)} ${f1(y - r)}Q${f1(x + c)} ${f1(y - c)} ${f1(x + r)} ${f1(y)}Q${f1(x + c)} ${f1(y + c)} ${f1(x)} ${f1(y + r)}Q${f1(x - c)} ${f1(y + c)} ${f1(x - r)} ${f1(y)}Q${f1(x - c)} ${f1(y - c)} ${f1(x)} ${f1(y - r)}Z`;
};
export const starsD = (seed: number, n: number, [x0, y0, x1, y1]: [number, number, number, number], r0: number, r1: number, sparkle = false) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(seed + i * 1.37) * (x1 - x0), y = y0 + rnd(seed + i * 2.71 + 9) * (y1 - y0);
    const r = r0 + Math.pow(rnd(seed + i * 5.3 + 4), 2) * (r1 - r0);
    d += sparkle ? sparkleD(x, y, r) : dotD(x, y, r);
  }
  return d;
};
/** Flat cloud/haze stratum with scalloped top and bottom edges (hard-edged, no blur). */
export const strataD = (x0: number, x1: number, yTop: number, yBot: number, seed: number, bump = 80) => {
  let d = `M${x0} ${yTop}`;
  let x = x0, i = 0;
  while (x < x1 - 1) {
    const w = bump * (0.8 + rnd(seed + i * 3.1) * 1.4);
    const nx = Math.min(x1, x + w);
    const ny = yTop + (rnd(seed + i * 7.3) - 0.5) * bump * 0.4;
    const r = (nx - x) * (0.55 + rnd(seed + i * 1.9) * 0.3);
    d += `A${f1(r)} ${f1(r)} 0 0 1 ${f1(nx)} ${f1(ny)}`;
    x = nx;
    i++;
  }
  d += `L${x1} ${yBot}`;
  while (x > x0 + 1) {
    const w = bump * (1.1 + rnd(seed + i * 3.1) * 1.6);
    const nx = Math.max(x0, x - w);
    const ny = yBot + (rnd(seed + i * 7.3) - 0.5) * bump * 0.3;
    const r = (x - nx) * (0.6 + rnd(seed + i * 1.9) * 0.4);
    d += `A${f1(r)} ${f1(r)} 0 0 1 ${f1(nx)} ${f1(ny)}`;
    x = nx;
    i++;
  }
  return d + 'Z';
};
/** Lumpy puff (closed scalloped blob) for flat clouds. */
export const puffD = (cx: number, cy: number, rx: number, ry: number, seed: number, n = 9) => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.82 + rnd(seed + i * 2.3) * 0.3;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[(i + 1) % n];
    const [px, py] = pts[i];
    const r = Math.hypot(x - px, y - py) * (0.56 + rnd(seed + i * 5.1) * 0.2);
    d += `A${f1(r)} ${f1(r)} 0 0 1 ${f1(x)} ${f1(y)}`;
  }
  return d + 'Z';
};

// ---------------------------------------------------------------- posterized sphere maths
export const CIRCLE_D = 'M-1 0A1 1 0 1 0 1 0A1 1 0 1 0 -1 0Z';
const rotP = (x: number, y: number, c: number, s: number): P2 => [x * c - y * s, x * s + y * c];
/**
 * Region of the visible hemisphere where n·L > k, in unit-disk coordinates (null = empty).
 * theta = screen direction toward the light (deg, SVG y-down), beta = angle between light and viewer
 * (rad: 0 = light from the viewer → full, π/2 = from the side → half, π = from behind → new).
 * The iso-lighting circle projects to an ellipse tangent to the limb, so the band is one elliptical arc + one limb arc.
 */
export const capD = (theta: number, beta: number, k: number): string | null => {
  if (k <= -1) return CIRCLE_D;
  if (k >= 1) return null;
  const b = Math.min(Math.PI - 1e-3, Math.max(1e-3, beta));
  const sb = Math.sin(b), cb = Math.cos(b), s = Math.sqrt(1 - k * k);
  const th = (theta * Math.PI) / 180, ct = Math.cos(th), st = Math.sin(th);
  const xc = k * sb, ax = Math.max(1e-4, s * Math.abs(cb));
  const c0 = (k * cb) / (s * sb);
  const rot = theta.toFixed(2);
  if (c0 >= 1) {
    const [x1, y1] = rotP(xc + ax, 0, ct, st), [x2, y2] = rotP(xc - ax, 0, ct, st);
    return `M${f4(x1)} ${f4(y1)}A${f4(ax)} ${f4(s)} ${rot} 0 1 ${f4(x2)} ${f4(y2)}A${f4(ax)} ${f4(s)} ${rot} 0 1 ${f4(x1)} ${f4(y1)}Z`;
  }
  if (c0 <= -1) return cb > k ? CIRCLE_D : null;
  const phi0 = Math.acos(c0);
  const xt = xc + s * Math.cos(phi0) * cb, yt = s * Math.sin(phi0);
  const large = phi0 < Math.PI / 2 ? 1 : 0;
  const sweep = cb >= 0 ? 1 : 0;
  const at = Math.atan2(yt, xt);
  const largeL = at > Math.PI / 2 ? 1 : 0;
  const [px, py] = rotP(xt, yt, ct, st), [qx, qy] = rotP(xt, -yt, ct, st);
  return `M${f4(px)} ${f4(py)}A${f4(ax)} ${f4(s)} ${rot} ${large} ${sweep} ${f4(qx)} ${f4(qy)}A1 1 0 ${largeL} 1 ${f4(px)} ${f4(py)}Z`;
};
/** Arc on radius rho along the lit limb (where the limb's n·L > k). */
export const rimD = (theta: number, beta: number, k: number, rho: number): string | null => {
  const b = Math.min(Math.PI - 1e-3, Math.max(1e-3, beta));
  const sb = Math.sin(b);
  if (k >= sb) return null;
  const ar = Math.min(Math.PI - 0.02, Math.acos(Math.max(-1, k / sb)));
  const th = (theta * Math.PI) / 180;
  const a0 = th - ar, a1 = th + ar;
  return `M${f4(rho * Math.cos(a0))} ${f4(rho * Math.sin(a0))}A${f4(rho)} ${f4(rho)} 0 ${ar > Math.PI / 2 ? 1 : 0} 1 ${f4(rho * Math.cos(a1))} ${f4(rho * Math.sin(a1))}`;
};
/** Light direction for PSphere/Moon/Earth `theta`: degrees from the body at (x, y) TOWARD the light source at (lx, ly)
 *  (SVG y-down: 0 = light from the right, 180 = from the left, -90 = from above). A body is always lit on the Sun's side. */
export const towardDeg = (x: number, y: number, lx: number, ly: number) => (Math.atan2(ly - y, lx - x) * 180) / Math.PI;
/** Moon phase from cycle position c (0 = new, .25 first quarter, .5 full, .75 last quarter). */
export const phase = (c: number) => {
  const f = ((c % 1) + 1) % 1;
  return f < 0.5 ? {theta: 0, beta: Math.PI * (1 - 2 * f)} : {theta: 180, beta: Math.PI * (2 * f - 1)};
};

type SphereProps = {
  id: string; x: number; y: number; r: number; theta: number; beta: number;
  tones: string[]; ks: number[]; surface?: (i: number) => React.ReactNode;
  rim?: {k: number; color: string; w: number; out?: number}; under?: React.ReactNode; over?: React.ReactNode;
};
/** Posterized sphere: tones[0] = shadow, tones[i+1] fills the band n·L > ks[i]. With `surface`, the surface is redrawn per band (clipped). */
export const PSphere: React.FC<SphereProps> = ({id, x, y, r, theta, beta, tones, ks, surface, rim, under, over}) => {
  const caps = ks.map((k) => capD(theta, beta, k));
  const rimPath = rim ? rimD(theta, beta, rim.k, 1 + (rim.out ?? 0) / r + (rim.out ? rim.w / 2 / r : -rim.w / 2 / r)) : null;
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${r.toFixed(4)})`}>
      {under}
      {surface ? (
        <>
          <defs>
            <clipPath id={`${id}-d`}><path d={CIRCLE_D} /></clipPath>
            {caps.map((d, i) => d && <clipPath key={i} id={`${id}-${i}`}><path d={d} /></clipPath>)}
          </defs>
          <g clipPath={`url(#${id}-d)`}>{surface(0)}</g>
          {caps.map((d, i) => d && <g key={i} clipPath={`url(#${id}-${i})`}>{surface(i + 1)}</g>)}
        </>
      ) : (
        <>
          <path d={CIRCLE_D} fill={tones[0]} />
          {caps.map((d, i) => d && <path key={i} d={d} fill={tones[i + 1]} />)}
        </>
      )}
      {rim && rimPath && <path d={rimPath} fill="none" stroke={rim.color} strokeWidth={rim.w / r} strokeLinecap="round" />}
      {over}
    </g>
  );
};

// ---------------------------------------------------------------- Moon
export const MOON_TONES = ['#7E7769', '#A79F8F', '#CFC7B5', '#E9E3D3'];
export const MOON_PALE = ['#9FB4C8', '#B9C7D3', '#D4DCE2', '#EEF1EF'];
const CRATERS = ([[-0.38, -0.3, 0.2], [0.3, -0.48, 0.13], [0.42, 0.22, 0.21], [-0.12, 0.46, 0.15], [-0.6, 0.28, 0.11], [0.06, -0.06, 0.09], [0.66, -0.16, 0.08], [-0.3, 0.12, 0.07], [0.15, 0.72, 0.09]] as const).map(([cx, cy, rc]) => {
  const f = Math.sqrt(Math.max(0.08, 1 - (cx * cx + cy * cy)));
  return {cx, cy, rx: rc * f, ry: rc, rot: (Math.atan2(cy, cx) * 180) / Math.PI};
});
export const Moon: React.FC<{id: string; x: number; y: number; r: number; theta: number; beta: number; tones?: string[]; craters?: boolean; rim?: string | null}> = ({id, x, y, r, theta, beta, tones = MOON_TONES, craters = true, rim = '#FFFBF0'}) => {
  const dark = [shade(tones[0], 0.86), tones[0], tones[1], tones[2]];
  return (
    <PSphere id={id} x={x} y={y} r={r} theta={theta} beta={beta} tones={tones} ks={[0, 0.34, 0.74]}
      rim={rim ? {k: 0.25, color: rim, w: Math.max(3, r * 0.028)} : undefined}
      surface={craters ? (i) => (
        <g>
          <path d={CIRCLE_D} fill={tones[i]} />
          {CRATERS.map((c, j) => <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} transform={`rotate(${c.rot.toFixed(1)} ${c.cx} ${c.cy})`} fill={dark[i]} />)}
        </g>
      ) : undefined} />
  );
};
/** Darken a #rrggbb colour (flat, no alpha). */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v * k))).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
export const mix = (h1: string, h2: string, q: number) => {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const c = (s: number) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, q)).toString(16).padStart(2, '0');
  return `#${c(16)}${c(8)}${c(0)}`;
};

// ---------------------------------------------------------------- Earth (flat map strip slid behind a disk)
export const EARTH = {
  ocean: ['#163866', '#2667B5', '#2F7FD3', '#4A94E2'],
  land: ['#1E4A3A', '#3F9A5E', '#5DBB76', '#7ACB8C'],
  cloud: ['#2A4670', '#C3D0DE', '#F4F7FA', '#FFFFFF'],
  city: '#FFD889', atmo: '#6DB2F2',
};
const MAPW = 4;
const CONT: P2[][] = [
  // Europe + Africa
  [[0.34, -0.8], [0.5, -0.88], [0.72, -0.84], [0.9, -0.72], [0.98, -0.56], [0.9, -0.45], [1.0, -0.32], [1.03, -0.18], [0.94, -0.1], [0.96, 0.04], [0.88, 0.24], [0.78, 0.44], [0.68, 0.56], [0.6, 0.44], [0.54, 0.22], [0.46, 0.07], [0.32, 0.01], [0.24, -0.14], [0.31, -0.3], [0.46, -0.36], [0.56, -0.42], [0.5, -0.52], [0.38, -0.56], [0.3, -0.66]],
  // Asia
  [[1.06, -0.86], [1.4, -0.93], [1.8, -0.87], [2.1, -0.75], [2.2, -0.56], [2.07, -0.42], [1.97, -0.26], [1.85, -0.15], [1.74, -0.24], [1.62, -0.1], [1.52, -0.02], [1.44, -0.18], [1.34, -0.3], [1.2, -0.24], [1.1, -0.36], [1.03, -0.52], [0.99, -0.7]],
  // islands
  [[1.76, 0.0], [1.88, -0.03], [1.94, 0.04], [1.84, 0.08]],
  [[1.98, 0.08], [2.1, 0.06], [2.14, 0.13], [2.02, 0.15]],
  // Australia
  [[2.02, 0.3], [2.22, 0.24], [2.36, 0.3], [2.41, 0.44], [2.3, 0.56], [2.12, 0.56], [2.0, 0.46]],
  // North America
  [[2.7, -0.84], [3.0, -0.92], [3.3, -0.86], [3.5, -0.72], [3.44, -0.56], [3.32, -0.46], [3.2, -0.3], [3.12, -0.2], [3.0, -0.26], [2.92, -0.4], [2.8, -0.5], [2.68, -0.66]],
  // South America
  [[3.14, -0.12], [3.3, -0.06], [3.46, 0.04], [3.44, 0.22], [3.34, 0.4], [3.24, 0.62], [3.18, 0.5], [3.16, 0.28], [3.08, 0.08]],
  // Greenland
  [[3.48, -0.95], [3.62, -0.97], [3.68, -0.87], [3.57, -0.79], [3.47, -0.85]],
];
const K = 1000; // map paths live in milli-units so the 1-decimal path rounding never shows
const LAND_D = CONT.map((c) => spline(c.map(([x, y]) => [x * K, y * K] as P2), true) + 'Z').join(' ') + ` M-200 900 Q600 840 1400 900 T3000 880 T4200 900 L4200 1300 L-200 1300 Z`;
const inPoly = (x: number, y: number, poly: P2[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const CITY_D = (() => {
  let d = '';
  let n = 0;
  for (let i = 0; i < 2400 && n < 260; i++) {
    const x = rnd(i * 3.7 + 11) * MAPW, y = -0.9 + rnd(i * 5.9 + 3) * 1.6;
    if (!CONT.some((c) => inPoly(x, y, c))) continue;
    const cl = rnd(i * 1.3 + 7);
    d += dotD(x * K, y * K, 3.5 + cl * cl * 5);
    n++;
  }
  return d;
})();
const CLOUD_PUFFS: Array<[number, number, number, number]> = [
  [0.12, -0.62, 0.15, 0.035], [0.3, -0.56, 0.08, 0.025], [0.66, -0.16, 0.14, 0.03], [0.84, -0.22, 0.07, 0.022], [1.22, -0.62, 0.17, 0.035],
  [1.42, -0.56, 0.08, 0.025], [1.55, 0.22, 0.15, 0.032], [2.44, -0.42, 0.14, 0.03], [2.62, -0.36, 0.07, 0.02], [2.74, 0.1, 0.17, 0.035],
  [3.55, -0.3, 0.14, 0.03], [0.5, 0.52, 0.13, 0.03], [3.78, 0.48, 0.12, 0.03], [1.12, 0.68, 0.16, 0.03], [2.2, -0.9, 0.18, 0.03],
  [0.86, -0.32, 0.06, 0.03], [2.2, 0.0, 0.07, 0.04], [3.3, 0.7, 0.09, 0.04], [1.7, -0.36, 0.07, 0.035], [0.02, 0.18, 0.12, 0.028],
];
const CLOUD_D = CLOUD_PUFFS.map(([x, y, rx, ry], i) => puffD(x * K, y * K, rx * K, ry * K, i * 3 + 1, 9)).join(' ');

export const Earth: React.FC<{id: string; x: number; y: number; r: number; theta: number; beta: number; lon: number; mapS?: number; mapY?: number; atmo?: boolean; children?: React.ReactNode}> = ({
  id, x, y, r, theta, beta, lon, mapS = 1, mapY = 0, atmo = true, children,
}) => {
  const L = ((lon % MAPW) + MAPW) % MAPW;
  const surface = (i: number) => (
    <g>
      <rect x={-1.05} y={-1.05} width={2.1} height={2.1} fill={EARTH.ocean[i]} />
      <g transform={`scale(${(mapS / K).toFixed(7)}) translate(${(-L * K).toFixed(2)} ${(mapY * K).toFixed(2)})`}>
        {[-MAPW, 0, MAPW].map((off) => (
          <g key={off} transform={`translate(${off * K} 0)`}>
            <path d={LAND_D} fill={EARTH.land[i]} />
            {i === 0 && <path d={CITY_D} fill={EARTH.city} />}
            <path d={CLOUD_D} fill={EARTH.cloud[i]} />
          </g>
        ))}
      </g>
    </g>
  );
  const w = Math.min(10, Math.max(3, r * 0.005));
  return (
    <PSphere id={id} x={x} y={y} r={r} theta={theta} beta={beta} tones={EARTH.ocean} ks={[0.02, 0.3, 0.8]} surface={surface}
      rim={atmo ? {k: -0.2, color: EARTH.atmo, w, out: w * 0.7} : undefined} over={children} />
  );
};

// ---------------------------------------------------------------- Sun (flat disc, hard limb-darkening bands, granules)
const GRAN = Array.from({length: 16}, (_, i) => {
  const a = rnd(i * 4.1) * Math.PI * 2, d = Math.sqrt(rnd(i * 2.9 + 1)) * 0.78;
  return puffD(Math.cos(a) * d * K, Math.sin(a) * d * K, (0.07 + rnd(i * 6.1) * 0.06) * K, (0.05 + rnd(i * 3.3) * 0.04) * K, i * 5 + 2, 7);
}).join(' ');
export const Sun: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${r.toFixed(3)})`}>
    <circle r={1} fill="#FFAE3A" />
    <circle r={0.9} fill="#FFC24B" />
    <circle r={0.56} fill="#FFD064" />
    <g transform={`rotate(${(t * 3).toFixed(2)}) scale(${1 / K})`}><path d={GRAN} fill="#FFAE3A" /></g>
  </g>
);

// ---------------------------------------------------------------- labels
/** Pill / label pop-in that is fully grown ≤ 10 frames after its cue (house rule), optional pop-out at `out`. */
export const popIn = (t: number, cue: number, out = 999, dur = 0.16) => pb(t, cue - 0.02, cue - 0.02 + dur) * (1 - p(t, out, out + 0.22));
export const Pill: React.FC<{x: number; y: number; text: string; q: number; bg: string; fg?: string; size?: number; weight?: number; padX?: number; align?: 'c' | 'l' | 'r'; rot?: number; drop?: string}> = ({
  x, y, text, q, bg, fg = SEM.ink, size = 44, weight = 800, padX, align = 'c', rot = 0, drop = '#0B1A3070',
}) => {
  if (q <= 0.002) return null;
  const px = padX ?? size * 0.62;
  const w = textW(text, size, weight) + px * 2, h = size * 1.52;
  const ox = align === 'l' ? w / 2 : align === 'r' ? -w / 2 : 0;
  return (
    <g transform={`translate(${(x + ox).toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${q.toFixed(4)})`}>
      <rect x={-w / 2} y={-h / 2 + size * 0.16} width={w} height={h} rx={h / 2} fill={drop} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} />
      <text x={0} y={size * 0.355} textAnchor="middle" fill={fg} style={{fontFamily: HEAD, fontWeight: weight, fontSize: size}}>{text}</text>
    </g>
  );
};
export const Leader: React.FC<{x1: number; y1: number; x2: number; y2: number; q: number; color: string; w?: number}> = ({x1, y1, x2, y2, q, color, w = 4}) => {
  if (q <= 0.002) return null;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" {...drawOn(q)} />
      <circle cx={x2} cy={y2} r={w * 2 * Math.min(1, Math.max(0, (q - 0.7) / 0.3))} fill={color} />
    </g>
  );
};

/** Dark flat caption outline (paint-order stroke, ~9.5 px outside the glyph): keeps cream words readable over lit doors,
 *  sunflower rays and the copper Moon. No shadow, no glow. */
export const CAPTION_OUTLINE = {w: 19, color: '#0F2442'};
/** Bottom captions: cream Outfit 700 with a hard dark outline; the spoken word sits in a coral pill that glides word to word.
 *  Frame-aware: centred on the canvas, max width 900 (portrait) / 1500 (landscape), default y 1604 / H − 130. */
export const Captions: React.FC<{t: number; pages: CaptionPage[]; y?: number; size?: number; outline?: {w: number; color: string}}> = ({t, pages, y: yIn, size = 58, outline = CAPTION_OUTLINE}) => {
  const fr = useFrame();
  const y = yIn ?? (fr.wide ? fr.H - 130 : 1604);
  const pg = pages.find((g) => t >= g.start - 0.08 && t < g.end);
  if (!pg) return null;
  const words = pg.words.map((w) => display(w.word));
  const ws = words.map((w) => textW(w, size, 700));
  const gap = size * 0.34, pad = size * 0.24;
  const total = ws.reduce((s, v) => s + v, 0) + gap * (ws.length - 1);
  const k = Math.min(1, (fr.wide ? 1500 : 900) / (total + pad * 2));
  const xs: number[] = [];
  let cx = -total / 2;
  ws.forEach((w) => {
    xs.push(cx);
    cx += w + gap;
  });
  let ai = 0;
  pg.words.forEach((w, i) => {
    if (t >= w.start - 0.06) ai = i;
  });
  const prev = Math.max(0, ai - 1);
  const g = ai === 0 ? 1 : p(t, pg.words[ai].start - 0.06, pg.words[ai].start + 0.06);
  const bx = lerp(xs[prev], xs[ai], g) - pad, bw = lerp(ws[prev], ws[ai], g) + pad * 2;
  const qin = p(t, pg.start - 0.08, pg.start + 0.1);
  const h = size * 1.3;
  const cid = `cap-${Math.round(pg.start * 100)}`;
  const spoken = (i: number) => t >= pg.words[i].start - 0.02;
  return (
    <g transform={`translate(${fr.cx} ${(y + (1 - qin) * 14).toFixed(1)}) scale(${k.toFixed(4)})`} opacity={qin}>
      {words.map((w, i) => (
        <text key={i} x={xs[i]} y={size * 0.35} fill={spoken(i) ? SEM.cream : '#AEBBD3'} stroke={outline.color} strokeWidth={outline.w} strokeLinejoin="round" paintOrder="stroke"
          style={{fontFamily: HEAD, fontWeight: 700, fontSize: size}}>{w}</text>
      ))}
      <rect x={bx} y={-h / 2} width={bw} height={h} rx={h / 2} fill={SEM.coral} stroke={SEM.ink} strokeWidth={6} />
      <defs><clipPath id={cid}><rect x={bx} y={-h / 2} width={bw} height={h} rx={h / 2} /></clipPath></defs>
      <g clipPath={`url(#${cid})`}>
        {words.map((w, i) => <text key={i} x={xs[i]} y={size * 0.35} fill={SEM.ink} style={{fontFamily: HEAD, fontWeight: 700, fontSize: size}}>{w}</text>)}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- posterized two-tone helper
/** Shape in `dark`, overlaid by the same shape shifted toward the light in `lit`, clipped to the shape → hard terminator. */
export const Shade2: React.FC<{id: string; d: string; lit: string; dark: string; dx: number; dy: number}> = ({id, d, lit, dark, dx, dy}) => (
  <>
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <path d={d} fill={dark} />
    <g clipPath={`url(#${id})`}><path d={d} fill={lit} transform={`translate(${dx} ${dy})`} /></g>
  </>
);

export const blink = (t: number, seed: number) => {
  const per = 2.6 + rnd(seed) * 1.4;
  const k = (t + rnd(seed + 1) * per) % per;
  return k < 0.1 ? Math.max(0.1, Math.abs(k - 0.05) / 0.05) : 1;
};

// ---------------------------------------------------------------- stargazer (scale figure, origin = feet)
export type Gaze = {lean: number; head: number; armR: [number, number]; armL: [number, number]; jump: number; sq: number; mouth: number; brows: number; eyes: number};
export const GAZE_REST: Gaze = {lean: 0, head: 0, armR: [12, 8], armL: [12, 8], jump: 0, sq: 0, mouth: 0, brows: 0, eyes: 0};
export const mixGaze = (a: Gaze, b: Gaze, q: number): Gaze => ({
  lean: lerp(a.lean, b.lean, q), head: lerp(a.head, b.head, q),
  armR: [lerp(a.armR[0], b.armR[0], q), lerp(a.armR[1], b.armR[1], q)], armL: [lerp(a.armL[0], b.armL[0], q), lerp(a.armL[1], b.armL[1], q)],
  jump: lerp(a.jump, b.jump, q), sq: lerp(a.sq, b.sq, q), mouth: lerp(a.mouth, b.mouth, q), brows: lerp(a.brows, b.brows, q), eyes: lerp(a.eyes, b.eyes, q),
});
const GZ = {jacket: '#5FD4B0', jacketSh: '#3FAE8E', sleeve: '#4CC4A0', pants: '#2E3F66', pantsSh: '#22304F', boot: '#17213A', skin: '#F2B68C', skinSh: '#D9946C', hat: '#FFC24B', hatSh: '#E0A231', scarf: '#FFF4E0', scarfSh: '#E2D0AE', ink: '#16203A', cheek: '#F59A80', tube: '#FFF4E0', tubeSh: '#D6C4A1', leg: '#93A6C4'};
/** Mouth: 0 smile → 1 'o' (surprise) → -1 flat/unsure. */
export const Stargazer: React.FC<{id: string; t: number; g: Gaze; scope?: {x: number; y: number; ang: number} | null; light?: [number, number]}> = ({id, t, g, scope = null, light = [6, -3]}) => {
  const [lx, ly] = light;
  const halus = useHalus('SEMESTA').full; // HALUS full: idle squash + head sway, soft contact shadow (needs HalusDefs)
  const idle = halusIdle(t, 3, halus);
  const bl = blink(t, 3);
  const arm = (side: 1 | -1, [a, e]: [number, number]) => {
    const sx = side * 25, sy = -114;
    const r1 = (a * Math.PI) / 180, r2 = ((a + e) * Math.PI) / 180;
    const ex = sx + side * Math.sin(r1) * 34, ey = sy + Math.cos(r1) * 34;
    const hx = ex + side * Math.sin(r2) * 32, hy = ey + Math.cos(r2) * 32;
    return (
      <g>
        <path d={`M${sx} ${sy}L${ex.toFixed(1)} ${ey.toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}`} stroke={side === 1 ? GZ.sleeve : GZ.jacketSh} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={hx} cy={hy} r={7.5} fill={GZ.skin} />
      </g>
    );
  };
  const breathe = Math.sin(t * 2.4) * 1.2;
  const mo = g.mouth;
  return (
    <g>
      {scope !== null && (
        <g>
          {[[-26, 0], [26, 0], [4, 6]].map(([dx, dy], i) => <line key={i} x1={scope.x} y1={scope.y + 6} x2={scope.x + dx} y2={dy} stroke={GZ.leg} strokeWidth={5} strokeLinecap="round" />)}
          <g transform={`translate(${scope.x} ${scope.y}) rotate(${scope.ang})`}>
            <Shade2 id={`${id}-tube`} d={rr(-46, -13, 142, 26, 13)} lit={GZ.tube} dark={GZ.tubeSh} dx={0} dy={-6} />
            <rect x={84} y={-16} width={16} height={32} rx={6} fill={GZ.hat} />
            <rect x={-56} y={-7} width={14} height={14} rx={4} fill={GZ.ink} />
            <circle r={6} fill={GZ.leg} />
          </g>
        </g>
      )}
      {halus && <SoftShadow cx={2} cy={0} rx={48 * Math.max(0.4, 1 - g.jump / 260)} ry={10} op={0.55} ink={SEM.ink} />}
      <g transform={`translate(0 ${(-g.jump).toFixed(1)}) scale(${((1 + g.sq * 0.12) * idle.sx).toFixed(3)} ${((1 - g.sq * 0.12) * idle.sy).toFixed(3)})`}>
        <Shade2 id={`${id}-lg1`} d={rr(-21, -64, 17, 56, 7)} lit={GZ.pants} dark={GZ.pantsSh} dx={lx} dy={0} />
        <Shade2 id={`${id}-lg2`} d={rr(4, -64, 17, 56, 7)} lit={GZ.pants} dark={GZ.pantsSh} dx={lx} dy={0} />
        <path d={rr(-26, -14, 24, 14, 6)} fill={GZ.boot} />
        <path d={rr(2, -14, 24, 14, 6)} fill={GZ.boot} />
        <g transform={`rotate(${g.lean.toFixed(2)} 0 -60)`}>
          {arm(-1, g.armL)}
          <g transform={`translate(0 ${breathe.toFixed(2)})`}>
            <Shade2 id={`${id}-jk`} d={rr(-31, -128, 62, 72, 20)} lit={GZ.jacket} dark={GZ.jacketSh} dx={lx * 1.6} dy={ly} />
            <rect x={-3} y={-112} width={6} height={50} rx={3} fill={GZ.jacketSh} />
            <Shade2 id={`${id}-sc`} d={rr(-26, -134, 52, 17, 8)} lit={GZ.scarf} dark={GZ.scarfSh} dx={lx} dy={0} />
            <path d={rr(9, -126, 13, 36, 6)} fill={GZ.scarfSh} />
          </g>
          {arm(1, g.armR)}
          <g transform={`translate(0 ${(-156 + breathe).toFixed(2)}) rotate(${(g.head + idle.head).toFixed(2)})`}>
            <Shade2 id={`${id}-hd`} d={circ(0, 0, 30)} lit={GZ.skin} dark={GZ.skinSh} dx={lx * 1.4} dy={ly} />
            <Shade2 id={`${id}-hat`} d="M-31 -3A31 31 0 0 1 31 -3Z" lit={GZ.hat} dark={GZ.hatSh} dx={lx} dy={0} />
            <path d={rr(-33, -10, 66, 13, 6)} fill={GZ.hatSh} />
            <circle cx={0} cy={-34} r={8} fill={GZ.scarf} />
            {[-11, 11].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy={7} rx={3.8 + g.eyes * 1.4} ry={(5.2 + g.eyes * 2.2) * bl} fill={GZ.ink} />
                {Math.abs(g.brows) > 0.05 && <path d={`M${ex - 6} ${(-6 - g.brows * 5 + (g.brows < 0 ? (ex < 0 ? 3 : -2) : 0)).toFixed(1)}L${ex + 6} ${(-6 - g.brows * 5 + (g.brows < 0 ? (ex < 0 ? -2 : 3) : 0)).toFixed(1)}`} stroke={GZ.ink} strokeWidth={3} strokeLinecap="round" />}
              </g>
            ))}
            <circle cx={-19} cy={15} r={4.5} fill={GZ.cheek} />
            <circle cx={19} cy={15} r={4.5} fill={GZ.cheek} />
            {mo > 0.5 ? <ellipse cx={0} cy={19} rx={4.5} ry={6} fill={GZ.ink} />
              : mo < -0.5 ? <path d="M-6 19 Q0 16 6 20" stroke={GZ.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
                : <path d="M-7 16 Q0 23 7 16" stroke={GZ.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
          </g>
        </g>
      </g>
    </g>
  );
};

/**
 * v1.16 HALUS scene drift: SVG transform for scene i (on screen from `from` to `to`, s) — slow push-in / pull-back about
 * (fx, fy), default the frame centre a little high. undefined when HALUS is off (the scene renders exactly as before).
 * `amount` 0.6 for dense diagrams, 1.3 for wide empty sky.
 */
export const semScene = (t: number, o: {i: number; from: number; to: number; W: number; H: number; fx?: number; fy?: number; amount?: number}): string | undefined => {
  if (halusLevel('SEMESTA') === 'off') return undefined;
  const {z, px} = halusDrift(t, o.from, o.to, o.i, o.amount ?? 1);
  return zoomAbout(z, o.fx ?? o.W / 2, o.fy ?? o.H * 0.46, px);
};

// ---------------------------------------------------------------- Romulus (generic legendary king, origin = feet, ~520 tall)
export type RomPal = {cloak: [string, string]; tunic: [string, string]; skin: [string, string]; hair: string; laurel: [string, string]; belt: string; spear: string; tip: [string, string]; sandal: string; eye: string};
export const ROM_MORN: RomPal = {cloak: ['#D2553A', '#A33D2B'], tunic: ['#F7EBD3', '#D8C4A0'], skin: ['#EDB08A', '#C98762'], hair: '#4A3326', laurel: ['#6CC27E', '#3F9A5E'], belt: '#FFC24B', spear: '#7A5236', tip: ['#EEE8DA', '#A79F8F'], sandal: '#6B4A33', eye: '#24170F'};
export const ROM_DUSK: RomPal = {cloak: ['#7C3446', '#5B2639'], tunic: ['#5F6486', '#474C6F'], skin: ['#9B6F72', '#7A5662'], hair: '#251B2A', laurel: ['#3F7C68', '#2E5D52'], belt: '#B48C4E', spear: '#4A3640', tip: ['#B8B4BC', '#8A8494'], sandal: '#33263A', eye: '#160F1E'};
export const flatPal = (c: string): RomPal => ({cloak: [c, c], tunic: [c, c], skin: [c, c], hair: c, laurel: [c, c], belt: c, spear: c, tip: [c, c], sandal: c, eye: c});

/** turn: 0 = back view (looking at the valley) → 1 = facing us (squash-in-X swap at 0.5). arm: 0 rest → 1 raised fist; point: 0..1 points left. */
export const Romulus: React.FC<{id: string; t: number; pal: RomPal; turn: number; arm: number; point: number; proud: number; light?: [number, number]; flat?: boolean}> = ({
  id, t, pal, turn, arm, point, proud, light = [-9, -3], flat = false,
}) => {
  const [lx, ly] = light;
  const front = turn >= 0.5;
  const sxTurn = 0.3 + 0.7 * Math.abs(Math.cos(turn * Math.PI));
  const sway = Math.sin(t * 1.5) * 10 + Math.sin(t * 2.3 + 1) * 4;
  const br = Math.sin(t * 2.1) * 2.2;
  const bl = flat ? 1 : blink(t, 11);
  const S = (key: string, d: string, c: [string, string], k = 1) =>
    flat ? <path key={key} d={d} fill={c[0]} /> : <Shade2 key={key} id={`${id}-${key}`} d={d} lit={c[0]} dark={c[1]} dx={lx * k} dy={ly * k} />;
  // arms: shoulder → hand
  const shL = {x: -56, y: -362 + br}, shR = {x: 56, y: -362 + br};
  const armA = (() => {
    // screen-left arm: rest (hanging) → fist raised (arm) → pointing left (point)
    const rest = {ex: -74, ey: -290, hx: -80, hy: -222};
    const up = {ex: -104, ey: -420, hx: -96, hy: -500};
    const pt = {ex: -128, ey: -360, hx: -196, hy: -378};
    const a1 = {ex: lerp(rest.ex, up.ex, arm), ey: lerp(rest.ey, up.ey, arm), hx: lerp(rest.hx, up.hx, arm), hy: lerp(rest.hy, up.hy, arm)};
    return {ex: lerp(a1.ex, pt.ex, point), ey: lerp(a1.ey, pt.ey, point), hx: lerp(a1.hx, pt.hx, point), hy: lerp(a1.hy, pt.hy, point)};
  })();
  const spearX = 106, spearLift = proud * 14;
  const head = (
    <g transform={`translate(0 ${(-440 + br - proud * 4).toFixed(1)}) rotate(${(-proud * 4).toFixed(2)})`}>
      {S('hd', circ(0, 0, 45), pal.skin)}
      {front ? (
        <>
          <path d="M-45 -6 Q-46 -50 0 -50 Q46 -50 45 -6 Q36 -30 0 -30 Q-36 -30 -45 -6 Z" fill={pal.hair} />
          <path d="M-44 2 Q-46 58 0 64 Q46 58 44 2 Q36 26 18 22 Q0 34 -18 22 Q-36 26 -44 2 Z" fill={pal.hair} />
          <path d="M-12 26 Q0 32 12 26" stroke={flat ? pal.hair : pal.skin[1]} strokeWidth={5} fill="none" strokeLinecap="round" />
          {[-16, 16].map((ex) => <ellipse key={ex} cx={ex} cy={-4} rx={4.6} ry={6.4 * bl} fill={pal.eye} />)}
          <path d={`M-26 ${-19 - proud * 3}L-7 ${-15 - proud * 3}M7 ${-15 - proud * 3}L26 ${-19 - proud * 3}`} stroke={pal.hair} strokeWidth={5.5} strokeLinecap="round" />
          <path d="M-3 0 L4 12 L-4 13 Z" fill={flat ? pal.skin[0] : pal.skin[1]} />
        </>
      ) : (
        <>
          <path d="M-46 4 Q-48 -50 0 -50 Q48 -50 46 4 Q44 40 0 44 Q-44 40 -46 4 Z" fill={pal.hair} />
          <ellipse cx={-45} cy={2} rx={7} ry={11} fill={pal.skin[1]} />
          <ellipse cx={45} cy={2} rx={7} ry={11} fill={pal.skin[1]} />
        </>
      )}
      {/* laurel wreath: two branches meeting at the brow */}
      {Array.from({length: 10}).map((_, i) => {
        const deg = 186 + i * 18.7;
        const a = (deg * Math.PI) / 180;
        const x = Math.cos(a) * 50, y = -2 + Math.sin(a) * 42;
        const rot = deg + 90 + (i < 5 ? 32 : -32);
        return <ellipse key={i} cx={x} cy={y} rx={8} ry={17} transform={`rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} fill={i % 2 ? pal.laurel[1] : pal.laurel[0]} />;
      })}
      {!front && <path d="M-6 40 L-16 72 L-4 70 Z M6 40 L16 72 L4 70 Z" fill={pal.laurel[1]} />}
    </g>
  );
  const armPaths = (
    <>
      <path d={`M${shL.x} ${shL.y.toFixed(1)}L${armA.ex.toFixed(1)} ${armA.ey.toFixed(1)}L${armA.hx.toFixed(1)} ${armA.hy.toFixed(1)}`} stroke={front ? pal.skin[0] : pal.skin[1]} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={armA.hx} cy={armA.hy} r={15} fill={front ? pal.skin[0] : pal.skin[1]} />
      {front && <path d={`M${shL.x - 4} ${shL.y - 6} Q${shL.x - 20} ${shL.y + 14} ${shL.x - 14} ${shL.y + 46}`} stroke={pal.tunic[1]} strokeWidth={30} fill="none" strokeLinecap="round" />}
      <path d={`M${shR.x} ${shR.y.toFixed(1)}L88 ${(-296 - spearLift * 0.6).toFixed(1)}L${spearX - 4} ${(-312 - spearLift).toFixed(1)}`} stroke={pal.skin[1]} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
  const spearHand = <circle cx={spearX - 2} cy={-312 - spearLift} r={15} fill={front ? pal.skin[0] : pal.skin[1]} />;
  return (
    <g transform={`scale(${sxTurn.toFixed(3)} 1)`}>
      {/* cloak behind */}
      {S('ck', `M-60 -372 Q-96 -250 ${(-122 + sway).toFixed(1)} -48 Q-30 ${(-26 + sway * 0.3).toFixed(1)} ${(64 + sway * 0.4).toFixed(1)} -40 Q86 -230 60 -372 Z`, pal.cloak, 2)}
      {/* spear (behind body in back view) */}
      {!front && <g transform={`translate(0 ${-spearLift})`}>
        <rect x={-spearX - 4.5} y={-660} width={9} height={656} rx={4} fill={pal.spear} />
        {S('tp', `M${-spearX} -740 Q${-spearX + 16} -690 ${-spearX} -656 Q${-spearX - 16} -690 ${-spearX} -740 Z`, pal.tip)}
      </g>}
      {/* legs + sandals */}
      {S('l1', rr(-34, -158, 24, 150, 11), pal.skin)}
      {S('l2', rr(10, -158, 24, 150, 11), pal.skin)}
      <path d={rr(-40, -16, 36, 16, 7)} fill={pal.sandal} />
      <path d={rr(4, -16, 36, 16, 7)} fill={pal.sandal} />
      {[-22, 22].map((x) => <path key={x} d={`M${x - 11} -54 L${x + 11} -40 M${x - 11} -34 L${x + 11} -22`} stroke={pal.sandal} strokeWidth={5} strokeLinecap="round" />)}
      {front ? (
        <g transform={`translate(0 ${br.toFixed(2)})`}>
          {S('tn', 'M-56 -372 L56 -372 Q70 -260 72 -140 Q0 -124 -72 -140 Q-70 -260 -56 -372 Z', pal.tunic)}
          <path d={rr(-64, -268, 128, 20, 8)} fill={pal.belt} />
          {S('dr', 'M-58 -374 Q-20 -380 40 -372 Q58 -300 70 -170 Q30 -190 4 -260 Q-30 -320 -58 -374 Z', pal.cloak)}
          <circle cx={-44} cy={-360} r={11} fill={pal.belt} />
        </g>
      ) : (
        <g transform={`translate(0 ${br.toFixed(2)})`}>
          <g transform="scale(-1 1)">{armPaths}{spearHand}</g>
          {S('cb', `M-66 -376 Q0 -392 66 -376 Q86 -240 ${(76 + sway * 0.3).toFixed(1)} -70 Q0 -54 ${(-84 + sway * 0.6).toFixed(1)} -66 Q-90 -240 -66 -376 Z`, pal.cloak, 2.2)}
          {[-24, 20].map((x, i) => <path key={i} d={`M${x} -330 Q${x + 6 + sway * 0.2} -220 ${x - 4 + sway * 0.4} -84`} stroke={pal.cloak[1]} strokeWidth={7} fill="none" strokeLinecap="round" />)}
        </g>
      )}
      {front && armPaths}
      {front && <g transform={`translate(0 ${-spearLift})`}>
        <rect x={spearX - 4.5} y={-660} width={9} height={656} rx={4} fill={pal.spear} />
        {S('tf', `M${spearX} -740 Q${spearX + 16} -690 ${spearX} -656 Q${spearX - 16} -690 ${spearX} -740 Z`, pal.tip)}
      </g>}
      {front && spearHand}
      {/* neck + head */}
      <path d={rr(-15, -410 + br, 30, 34, 10)} fill={pal.skin[1]} />
      {head}
    </g>
  );
};

// ---------------------------------------------------------------- Rome props (origin = ground centre)
export type Look = 'dusk' | 'morn';
export const Hut: React.FC<{x: number; y: number; s?: number; look: Look; id: string}> = ({x, y, s = 1, look, id}) => {
  const wall: [string, string] = look === 'dusk' ? ['#4D4560', '#3A3450'] : ['#C79C6E', '#A47C54'];
  const roof: [string, string] = look === 'dusk' ? ['#6A5A63', '#4E4352'] : ['#E2B266', '#BF8F48'];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Shade2 id={`${id}-w`} d={rr(-30, -40, 60, 40, 10)} lit={wall[0]} dark={wall[1]} dx={-8} dy={0} />
      <rect x={-8} y={-27} width={16} height={27} rx={7} fill={look === 'dusk' ? '#FFC24B' : '#5A3B2A'} />
      <Shade2 id={`${id}-r`} d="M-42 -34 Q-30 -60 0 -88 Q30 -60 42 -34 Q0 -26 -42 -34 Z" lit={roof[0]} dark={roof[1]} dx={-12} dy={0} />
    </g>
  );
};
export const House: React.FC<{x: number; y: number; s?: number; id: string; w?: number}> = ({x, y, s = 1, id, w = 70}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Shade2 id={`${id}-w`} d={rr(-w / 2, -50, w, 50, 4)} lit="#FFF1D8" dark="#E0CBA6" dx={-10} dy={0} />
    <rect x={-w / 2 + 12} y={-36} width={12} height={16} rx={3} fill="#8A5A3B" />
    <rect x={w / 2 - 24} y={-36} width={12} height={16} rx={3} fill="#8A5A3B" />
    <Shade2 id={`${id}-r`} d={`M${-w / 2 - 8} -48 L${-w / 2 + 10} -74 L${w / 2 - 10} -74 L${w / 2 + 8} -48 Z`} lit="#E2734D" dark="#B85438" dx={-12} dy={0} />
  </g>
);
export const Temple: React.FC<{x: number; y: number; s?: number; id: string}> = ({x, y, s = 1, id}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={rr(-80, -16, 160, 16, 3)} fill="#E0CBA6" />
    <path d={rr(-70, -26, 140, 12, 3)} fill="#F2E3C6" />
    {[-52, -18, 18, 52].map((cx) => <Shade2 key={cx} id={`${id}-c${cx}`} d={rr(cx - 9, -96, 18, 72, 4)} lit="#FFF6E6" dark="#DCC8A6" dx={-5} dy={0} />)}
    <path d={rr(-74, -108, 148, 14, 3)} fill="#F2E3C6" />
    <Shade2 id={`${id}-p`} d="M-84 -106 L0 -150 L84 -106 Z" lit="#E2734D" dark="#B85438" dx={-14} dy={0} />
    <path d="M-50 -112 L0 -138 L50 -112 Z" fill="#FFF1D8" />
  </g>
);
export const StoneWall: React.FC<{x: number; y: number; w: number; s?: number}> = ({x, y, w, s = 1}) => {
  const n = Math.max(2, Math.round(w / 34));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={rr(0, -34, w, 34, 4)} fill="#E6D3B0" />
      <path d={rr(0, -12, w, 12, 3)} fill="#CDB68D" />
      {Array.from({length: n}).map((_, i) => <path key={i} d={rr(i * (w / n) + 3, -48, w / n - 12, 16, 3)} fill="#E6D3B0" />)}
    </g>
  );
};
/** Small flat asteroid with three posterized tones. */
export const Rock: React.FC<{id: string; x: number; y: number; r: number; rot: number; seed: number}> = ({id, x, y, r, rot, seed}) => {
  const d = puffD(0, 0, 100, 78, seed, 8);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${r / 100})`}>
      <Shade2 id={`${id}-a`} d={d} lit="#5C6F96" dark="#34436A" dx={28} dy={-22} />
      <g clipPath={`url(#${id}-a)`}><path d={d} fill="#7D8FB3" transform="translate(62 -50)" /></g>
      <ellipse cx={-25} cy={15} rx={20} ry={14} fill="#2B3859" />
      <ellipse cx={30} cy={-25} rx={12} ry={9} fill="#46577F" />
    </g>
  );
};

// ---------------------------------------------------------------- eclipse tones + shadowed Moon (full-episode additions)
/** Moon in Earth's penumbra (dimmed, greyer), in the umbra (dark grey-blue, still visible) and at totality (copper-red). */
export const MOON_PEN = ['#5D6274', '#7D8193', '#A0A2AF', '#BEBDC3'];
export const MOON_DARK = ['#24345A', '#2E4168', '#3A5078', '#485F88'];
export const MOON_COPPER = ['#7A2E22', '#A3402A', '#C85A35', '#E07A4A'];
export type ShadeLayer = {d: string; tones: string[]; rim?: string | null};
/**
 * Moon with hard-edged shadow overlays: each layer redraws the same Moon (same bands + craters) in other tones,
 * clipped to a screen-space path (Earth's umbra/penumbra circle, a shadow cone polygon, a copper light front...).
 */
export const ShadowedMoon: React.FC<{id: string; x: number; y: number; r: number; theta: number; beta: number; tones?: string[]; layers: ShadeLayer[]; craters?: boolean; rim?: string | null}> = ({
  id, x, y, r, theta, beta, tones = MOON_TONES, layers, craters = true, rim = '#FFFBF0',
}) => (
  <g>
    <Moon id={id} x={x} y={y} r={r} theta={theta} beta={beta} tones={tones} craters={craters} rim={rim} />
    {layers.map((L, i) => (
      <g key={i}>
        <defs><clipPath id={`${id}-sh${i}`}><path d={L.d} /></clipPath></defs>
        <g clipPath={`url(#${id}-sh${i})`}>
          <Moon id={`${id}-s${i}`} x={x} y={y} r={r} theta={theta} beta={beta} tones={L.tones} craters={craters} rim={L.rim ?? null} />
        </g>
      </g>
    ))}
  </g>
);
/** Earth's shadow as seen ON the Moon: penumbra ring (radius pen) + umbra disc (radius um) centred at (sx, sy). */
export const earthShadow = (sx: number, sy: number, um: number, pen: number, umbra: string[] = MOON_DARK): ShadeLayer[] => [
  {d: circ(sx, sy, pen), tones: MOON_PEN},
  {d: circ(sx, sy, um), tones: umbra},
];
