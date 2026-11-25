import React from 'react';
import {drawOn, lerp, p, rnd, spline, useFrame} from '../shared';
import {Cam, circ, HEAD, Layer, mix, polyD, puffD, rr, SEM, Shade2, sparkleD, starsD, strataD, textW} from './kit';
import {halusIdle, SoftShadow, useHalus} from '../../lib/halus';

// SEMESTA props — reusable pieces for full episodes (night village of Java/Bali, villagers + lesung, Kala Rahu,
// kendi + cakra, eclipse diagrams, calendar boards, sunset-ring badges, transitions). Same rules as the kit: flat
// colours only, light = hard posterized bands (Shade2/Shade3), depth = layers. Small shapes are drawn big and scaled.

type P2 = [number, number];
const f1 = (v: number) => v.toFixed(1);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rad = (d: number) => (d * Math.PI) / 180;

/** Three-tone posterized shape: dark base, mid + light copies shifted toward the light, clipped to the shape. */
export const Shade3: React.FC<{id: string; d: string; c: readonly [string, string, string]; dx: number; dy: number; k?: number}> = ({id, d, c, dx, dy, k = 2.4}) => (
  <>
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <path d={d} fill={c[2]} />
    <g clipPath={`url(#${id})`}>
      <path d={d} fill={c[1]} transform={`translate(${dx} ${dy})`} />
      <path d={d} fill={c[0]} transform={`translate(${f1(dx * k)} ${f1(dy * k)})`} />
    </g>
  </>
);
/** Two-bone IK: shoulder → hand with fixed segment lengths. Returns the elbow and the (reachable) hand. */
export const ik2 = (sx: number, sy: number, hx: number, hy: number, l1: number, l2: number, bend: 1 | -1): [number, number, number, number] => {
  const dx = hx - sx, dy = hy - sy;
  const d = Math.max(0.01, Math.hypot(dx, dy));
  const dm = Math.min(d, l1 + l2 - 0.01);
  const tx = sx + (dx * dm) / d, ty = sy + (dy * dm) / d;
  const c = (l1 * l1 + dm * dm - l2 * l2) / (2 * l1 * dm);
  const ang = Math.atan2(dy, dx) + bend * Math.acos(Math.max(-1, Math.min(1, c)));
  return [sx + l1 * Math.cos(ang), sy + l1 * Math.sin(ang), tx, ty];
};

// ================================================================ night village set (origin = ground centre)
export const NIGHT = {
  sky: '#0F2442', halo: ['#132C50', '#17335B', '#1C3A66', '#224272'], star: '#FFF4DC',
  cloudFar: '#1A3561', cloudNear: '#22416F', cloudRim: '#2E4F80',
  hillFar: '#16305A', hillFarRim: '#24467A', hillMid: '#132A4C', hillMidRim: '#1F3D68', hillNear: '#10223E', hillNearRim: '#1B3459',
  ground: '#142640', groundLit: '#1A2F4E', path: '#1B3150', fg: '#0A1526', fgRim: '#13233D',
  water: '#1B3A62', dike: '#11243F', glint: '#A9BCD0', lamp: '#FFC24B', lampSh: '#EFA23A',
};
export type HouseTone = {wall: [string, string]; roof: [string, string]; trim: string; base: string; win: string};
export const JOGLO_NIGHT: HouseTone = {wall: ['#51485E', '#3C3549'], roof: ['#3F4566', '#2B2F49'], trim: '#272236', base: '#3A4462', win: NIGHT.lamp};

/** Javanese joglo house: two-tier roof (brunjung over penanggap), gebyok wall, double door that opens on warm light. */
export const Joglo: React.FC<{id: string; x: number; y: number; s?: number; w?: number; tone?: HouseTone; open?: number; lit?: number}> = ({
  id, x, y, s = 1, w = 520, tone = JOGLO_NIGHT, open = 0, lit = 1,
}) => {
  const h = w / 2;
  const dw = 108, dh = 150;
  const leaf = (side: -1 | 1) => {
    const k = 1 - 0.86 * open;
    const x0 = side * dw / 2;
    return <path d={rr(Math.min(x0, x0 - side * (dw / 2) * k), -22 - dh, (dw / 2) * k, dh, 3)} fill={side < 0 ? tone.wall[1] : tone.wall[0]} />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* pillars of the front porch */}
      {[-1, 1].map((sd) => <path key={sd} d={rr(sd * (h + 34) - 8, -214, 16, 196, 6)} fill={tone.trim} />)}
      <path d={rr(-h - 16, -24, w + 32, 24, 5)} fill={tone.base} />
      <Shade2 id={`${id}-w`} d={rr(-h + 22, -200, w - 44, 178, 4)} lit={tone.wall[0]} dark={tone.wall[1]} dx={14} dy={0} />
      {Array.from({length: 11}).map((_, i) => {
        const px = -h + 22 + ((w - 44) * (i + 0.5)) / 11;
        return Math.abs(px) < dw / 2 + 6 ? null : <rect key={i} x={px - 2} y={-196} width={4} height={170} fill={tone.trim} opacity={0.55} />;
      })}
      {/* door: warm interior behind two leaves */}
      <rect x={-dw / 2 - 8} y={-30 - dh} width={dw + 16} height={dh + 8} rx={4} fill={tone.trim} />
      <rect x={-dw / 2} y={-22 - dh} width={dw} height={dh} fill={open > 0.01 ? tone.win : tone.wall[1]} />
      {open > 0.01 && <rect x={-dw / 2} y={-52} width={dw} height={30} fill={NIGHT.lampSh} />}
      {leaf(-1)}
      {leaf(1)}
      {/* windows with lattice */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * 152 - 42} y={-162} width={84} height={76} rx={4} fill={tone.trim} />
          <rect x={sd * 152 - 34} y={-154} width={68} height={60} fill={lit > 0.5 ? tone.win : tone.wall[1]} />
          {[-17, 0, 17].map((bx) => <rect key={bx} x={sd * 152 + bx - 2.5} y={-154} width={5} height={60} fill={tone.trim} />)}
          <rect x={sd * 152 - 34} y={-127} width={68} height={5} fill={tone.trim} />
        </g>
      ))}
      {/* lower roof (penanggap) — left slope in shade, right slope moonlit */}
      <path d={`M${-h - 78} -196 Q${-h + 10} -224 ${-w * 0.33} -292 L${w * 0.33} -292 Q${h - 10} -224 ${h + 78} -196 Z`} fill={tone.roof[1]} />
      <path d={`M${w * 0.06} -292 L${w * 0.33} -292 Q${h - 10} -224 ${h + 78} -196 L${w * 0.1} -196 Z`} fill={tone.roof[0]} />
      {[-248, -224].map((ly, i) => <path key={i} d={`M${-h + 30 - i * 40} ${ly} L${h - 30 + i * 40} ${ly}`} stroke={tone.trim} strokeWidth={4} opacity={0.5} />)}
      <path d={rr(-h - 80, -202, w + 160, 12, 6)} fill={tone.trim} />
      {/* upper roof (brunjung) */}
      <path d={`M${-w * 0.37} -284 Q${-w * 0.22} -330 ${-w * 0.12} -424 L${w * 0.12} -424 Q${w * 0.22} -330 ${w * 0.37} -284 Z`} fill={tone.roof[1]} />
      <path d={`M${w * 0.04} -424 L${w * 0.12} -424 Q${w * 0.22} -330 ${w * 0.37} -284 L${w * 0.08} -284 Z`} fill={tone.roof[0]} />
      <path d={rr(-w * 0.15, -436, w * 0.3, 14, 7)} fill={tone.trim} />
      {[-1, 1].map((sd) => <path key={sd} d={`M${sd * w * 0.15} -430 q${sd * 6} -26 ${sd * 22} -30 q${-sd * 12} 10 ${-sd * 8} 30 Z`} fill={tone.trim} />)}
    </g>
  );
};

/** Small background house: limasan (Java) or thatched bale (Bali), two flat tones, optional lit window. */
export const SmallHouse: React.FC<{x: number; y: number; s?: number; kind?: 'limasan' | 'bale'; c: [string, string, string]; lamp?: boolean}> = ({x, y, s = 1, kind = 'limasan', c, lamp = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-62} y={-70} width={124} height={70} fill={c[1]} />
    <rect x={8} y={-70} width={54} height={70} fill={c[0]} />
    {lamp && <rect x={-40} y={-50} width={26} height={24} rx={3} fill={NIGHT.lamp} />}
    {kind === 'limasan' ? (
      <>
        <path d="M-92 -66 L-40 -124 L40 -124 L92 -66 Z" fill={c[2]} />
        <path d="M10 -124 L40 -124 L92 -66 L20 -66 Z" fill={c[0]} />
      </>
    ) : (
      <>
        <path d="M-96 -60 Q-40 -96 0 -160 Q40 -96 96 -60 Q0 -48 -96 -60 Z" fill={c[2]} />
        <path d="M0 -160 Q40 -96 96 -60 Q48 -54 14 -56 Z" fill={c[0]} />
      </>
    )}
  </g>
);

/** Balinese candi bentar (split gate): two mirrored stepped towers with a gap. */
export const CandiBentar: React.FC<{x: number; y: number; s?: number; c?: [string, string, string]}> = ({x, y, s = 1, c = ['#5E4C66', '#47394F', '#6B7394']}) => {
  const half = (sd: -1 | 1) => {
    const tiers: Array<[number, number, number]> = [[0, 130, 120], [120, 112, 70], [190, 92, 56], [246, 70, 46], [292, 50, 40], [332, 30, 34]];
    return (
      <g transform={`scale(${sd} 1)`}>
        {tiers.map(([y0, wd, hh], i) => (
          <g key={i}>
            <path d={`M28 ${-y0} L28 ${-y0 - hh} L${28 + wd} ${-y0 - hh * 0.55} L${28 + wd} ${-y0} Z`} fill={sd > 0 ? c[1] : c[0]} />
            <rect x={26} y={-y0 - 8} width={wd + 6} height={8} fill={c[2]} />
          </g>
        ))}
        <path d="M28 -366 L28 -392 L44 -368 Z" fill={c[2]} />
      </g>
    );
  };
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{half(-1)}{half(1)}</g>;
};

/** Balinese meru (multi-tier shrine tower) silhouette with a moonlit side. */
export const Meru: React.FC<{x: number; y: number; s?: number; tiers?: number; c: [string, string]}> = ({x, y, s = 1, tiers = 5, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-46} y={-60} width={92} height={60} fill={c[0]} />
    {Array.from({length: tiers}).map((_, i) => {
      const yy = -60 - i * 46, ww = 120 - i * 18;
      return (
        <g key={i}>
          <rect x={-10} y={yy - 18} width={20} height={18} fill={c[0]} />
          <path d={`M${-ww / 2} ${yy - 18} L${-ww * 0.28} ${yy - 46} L${ww * 0.28} ${yy - 46} L${ww / 2} ${yy - 18} Z`} fill={c[0]} />
          <path d={`M${ww * 0.06} ${yy - 46} L${ww * 0.28} ${yy - 46} L${ww / 2} ${yy - 18} L${ww * 0.12} ${yy - 18} Z`} fill={c[1]} />
        </g>
      );
    })}
    <path d={`M-4 ${-60 - tiers * 46} L0 ${-84 - tiers * 46} L4 ${-60 - tiers * 46} Z`} fill={c[0]} />
  </g>
);

/** Coconut palm (origin = base). lean: horizontal offset of the crown; sway: frond swing (deg). */
const FROND_D = (() => {
  // one frond along +x, length 1000 (drawn ×1000, scaled down): midrib curve + fringe of leaflets below it
  const pts: P2[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    pts.push([s * 1000, -Math.sin(s * Math.PI * 0.9) * 120 + s * s * 260]);
  }
  let d = `M0 0`;
  for (let i = 1; i <= n; i++) d += `L${pts[i][0].toFixed(0)} ${(pts[i][1] - 38 * (1 - i / n)).toFixed(0)}`;
  for (let i = n; i >= 1; i--) {
    const [x, y] = pts[i], [px, py] = pts[i - 1];
    const w = 150 * Math.sin((i / n) * Math.PI * 0.95) + 20;
    d += `L${x.toFixed(0)} ${y.toFixed(0)}L${((x + px) / 2 - 30).toFixed(0)} ${((y + py) / 2 + w).toFixed(0)}`;
  }
  return d + 'Z';
})();
export const Palm: React.FC<{x: number; y: number; h: number; lean?: number; s?: number; t: number; seed?: number; c: [string, string, string]}> = ({x, y, h, lean = 60, s = 1, t, seed = 1, c}) => {
  const tx = lean, ty = -h;
  const trunk = `M-16 0 Q${f1(lean * 0.2 - 12)} ${f1(-h * 0.5)} ${f1(tx - 7)} ${f1(ty)} L${f1(tx + 7)} ${f1(ty)} Q${f1(lean * 0.2 + 12)} ${f1(-h * 0.5)} 16 0 Z`;
  const sway = Math.sin(t * 0.9 + seed) * 2.5;
  const fronds = [-170, -140, -110, -70, -40, -10, 20, 200];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={trunk} fill={c[1]} />
      {Array.from({length: 9}).map((_, i) => {
        const k = (i + 1) / 10;
        const cx = lerp(0, tx, k * k * 0.55 + k * 0.45), cy = -h * k;
        return <rect key={i} x={cx - 13 + k * 4} y={cy - 2} width={26 - k * 8} height={4} rx={2} fill={c[0]} />;
      })}
      <g transform={`translate(${tx} ${ty})`}>
        {fronds.map((a, i) => {
          const len = 150 + rnd(seed + i * 3.1) * 50;
          const flip = a < -90 || a > 90;
          return (
            <g key={i} transform={`rotate(${a + sway * (i % 2 ? 1 : -1)}) scale(${len / 1000} ${(flip ? -1 : 1) * len / 1000})`}>
              <path d={FROND_D} fill={i % 3 === 1 ? c[0] : c[2]} />
            </g>
          );
        })}
        <circle cx={-10} cy={10} r={11} fill={c[1]} />
        <circle cx={9} cy={12} r={11} fill={c[1]} />
        <circle cx={0} cy={-2} r={10} fill={c[1]} />
      </g>
    </g>
  );
};

/** Rice terraces on a slope: stacked bands of flooded paddies with dikes and moon glints. */
export const Terraces: React.FC<{x: number; y: number; w: number; n?: number; step?: number; t: number; c?: {water: string; dike: string; glint: string}}> = ({
  x, y, w, n = 5, step = 34, t, c = {water: NIGHT.water, dike: NIGHT.dike, glint: NIGHT.glint},
}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: n}).map((_, i) => {
      const yy = i * step, ww = w * (0.55 + 0.45 * (i / Math.max(1, n - 1)));
      const sag = 14 + i * 3;
      const top = `M${-ww / 2} ${yy} Q0 ${yy - sag} ${ww / 2} ${yy}`;
      return (
        <g key={i}>
          <path d={`${top} L${ww / 2} ${yy + step} Q0 ${yy + step - sag - 3} ${-ww / 2} ${yy + step} Z`} fill={c.dike} />
          <path d={`${top} L${ww / 2} ${yy + step - 8} Q0 ${yy + step - 8 - sag - 3} ${-ww / 2} ${yy + step - 8} Z`} fill={c.water} />
          <rect x={-30 + Math.sin(t * 0.8 + i * 1.7) * 6 + (i % 2 ? 60 : -40)} y={yy + step * 0.42 - sag * 0.5} width={36 + (i % 3) * 14} height={4} rx={2} fill={c.glint} />
        </g>
      );
    })}
  </g>
);

/** Lumbung (rice barn on stilts with rat-guard discs and a tall horseshoe thatch roof), origin = ground centre. */
export const Lumbung: React.FC<{x: number; y: number; s?: number; c?: {roof: [string, string]; post: string; disc: string; floor: string; line: string}}> = ({
  x, y, s = 1, c = {roof: ['#4E4D66', '#37374D'], post: '#2A2438', disc: '#5A6488', floor: '#3A3349', line: '#2B2B3E'},
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-62, -22, 22, 62].map((px) => <path key={px} d={rr(px - 7, -132, 14, 132, 4)} fill={c.post} />)}
    {[-62, -22, 22, 62].map((px) => <ellipse key={px} cx={px} cy={-70} rx={20} ry={6} fill={c.disc} />)}
    <path d={rr(-92, -146, 184, 20, 4)} fill={c.floor} />
    <path d="M-104 -138 Q-118 -300 0 -392 Q118 -300 104 -138 Q0 -122 -104 -138 Z" fill={c.roof[1]} />
    <path d="M0 -392 Q118 -300 104 -138 Q52 -128 18 -130 Q40 -270 0 -392 Z" fill={c.roof[0]} />
    {[-300, -250, -200].map((ly, i) => <path key={i} d={`M${-80 + i * 8} ${ly + 40} Q0 ${ly + 26} ${80 - i * 8} ${ly + 40}`} stroke={c.line} strokeWidth={4} fill="none" />)}
    <path d={rr(-20, -246, 40, 52, 6)} fill={c.line} />
  </g>
);
/** Little flat grass tufts along a ground line. */
export const tuftsD = (pts: Array<[number, number, number]>) => pts.map(([x, y, s]) => `M${x - 14 * s} ${y}L${x - 9 * s} ${y - 24 * s}L${x - 3 * s} ${y - 6 * s}L${x + 2 * s} ${y - 32 * s}L${x + 6 * s} ${y - 6 * s}L${x + 12 * s} ${y - 20 * s}L${x + 16 * s} ${y}Z`).join(' ');

/** Foreground silhouettes: bamboo fence and a banana plant (origin = ground). */
export const BambooFence: React.FC<{x: number; y: number; w: number; s?: number; c?: string; rim?: string}> = ({x, y, w, s = 1, c = NIGHT.fg, rim = NIGHT.fgRim}) => {
  const n = Math.round(w / 34);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({length: n}).map((_, i) => {
        const hh = 150 + ((i * 37) % 3) * 14;
        return <path key={i} d={rr(i * 34, -hh, 24, hh + 10, 12)} fill={i % 2 ? c : rim} />;
      })}
      <rect x={-6} y={-112} width={n * 34 + 6} height={12} rx={6} fill={c} />
      <rect x={-6} y={-58} width={n * 34 + 6} height={12} rx={6} fill={c} />
    </g>
  );
};
export const Banana: React.FC<{x: number; y: number; s?: number; t: number; flip?: boolean; c?: [string, string]}> = ({x, y, s = 1, t, flip = false, c = [NIGHT.fg, NIGHT.fgRim]}) => {
  const leaves: Array<[number, number]> = [[-62, 1], [-28, 0.92], [8, 1.05], [40, 0.9], [-90, 0.8]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={rr(-16, -260, 32, 270, 14)} fill={c[0]} />
      {leaves.map(([a, k], i) => (
        <g key={i} transform={`translate(0 -250) rotate(${a + Math.sin(t * 0.7 + i) * 2})`}>
          <path d={`M0 0 Q${110 * k} ${-70 * k} ${300 * k} ${10 * k} Q${150 * k} ${30 * k} 0 0 Z`} fill={i % 2 ? c[1] : c[0]} />
          <path d={`M4 0 Q${120 * k} ${-36 * k} ${296 * k} ${10 * k}`} stroke={i % 2 ? c[0] : c[1]} strokeWidth={5} fill="none" />
        </g>
      ))}
    </g>
  );
};

// ================================================================ villagers (origin = feet, ~205 tall at s = 1)
export type VGarb = 'peci' | 'udeng' | 'kebaya' | 'kid';
export type VPal = {top: [string, string]; bot: [string, string]; skin: [string, string]; hat: string; hatSh: string; hair: string; ink: string; feet: string; cheek: string; band: string};
export type VPose = {handL: P2; handR: P2; head: number; look: P2; mouth: number; walk: number; lean: number; brow: number};
export const V_REST: VPose = {handL: [-30, -86], handR: [30, -86], head: 0, look: [0, 0], mouth: 0, walk: -1, lean: 0, brow: 0};
const SKIN_N: [string, string] = ['#C99579', '#A77762'];
export const VPALS: Record<'pak' | 'bu' | 'bli' | 'adik' | 'mbah', VPal> = {
  pak: {top: ['#B9705A', '#965643'], bot: ['#3E6B82', '#2F556A'], skin: SKIN_N, hat: '#1B1E2C', hatSh: '#11131D', hair: '#1B1A24', ink: '#16131C', feet: '#2A2530', cheek: '#C77A6A', band: '#2B4C5E'},
  bu: {top: ['#D8BB90', '#B79A71'], bot: ['#7C506A', '#613F55'], skin: ['#CC9A7E', '#AA7C66'], hat: '#1E1A26', hatSh: '#15121B', hair: '#1E1A26', ink: '#16131C', feet: '#2A2530', cheek: '#C9786C', band: '#5C3A4E'},
  bli: {top: ['#4F8F86', '#3D726B'], bot: ['#C7A25C', '#A48241'], skin: ['#BD8A6E', '#9C6E58'], hat: '#E5DDCD', hatSh: '#C4BAA6', hair: '#1B1A24', ink: '#16131C', feet: '#2A2530', cheek: '#B97060', band: '#8E6B2F'},
  adik: {top: ['#DDB24E', '#B98F35'], bot: ['#3C4F7C', '#2D3D62'], skin: ['#CF9E80', '#AC7F68'], hat: '#26202E', hatSh: '#1A1520', hair: '#26202E', ink: '#16131C', feet: '#2A2530', cheek: '#D07C6C', band: '#2D3D62'},
  mbah: {top: ['#8C7AA8', '#6F5F8A'], bot: ['#5A6B4A', '#46543A'], skin: ['#C29177', '#A07562'], hat: '#1B1E2C', hatSh: '#11131D', hair: '#C9C2B8', ink: '#16131C', feet: '#2A2530', cheek: '#BF7466', band: '#3B4630'},
};
export const vBlink = (t: number, seed: number) => {
  const per = 2.8 + rnd(seed) * 1.6;
  const k = (t + rnd(seed + 1) * per) % per;
  return k < 0.11 ? Math.max(0.12, Math.abs(k - 0.055) / 0.055) : 1;
};
/** Generic flat villager (minimal face): peci + sarong, udeng + kamen (Bali), kebaya + kain + sanggul, or a kid. */
export const Villager: React.FC<{id: string; t: number; garb: VGarb; pal: VPal; pose?: Partial<VPose>; seed?: number; light?: [number, number]; flip?: boolean; front?: React.ReactNode}> = ({
  id, t, garb, pal, pose: pz = {}, seed = 1, light = [5, -2], flip = false, front,
}) => {
  const P = {...V_REST, ...pz};
  const halus = useHalus('SEMESTA').full; // HALUS full: idle squash + head sway, soft contact shadow (needs HalusDefs)
  const idle = halusIdle(t, seed, halus);
  P.head += idle.head;
  const [lx0, ly] = light;
  const lx = flip ? -lx0 : lx0;
  const walking = P.walk >= 0;
  const ph = P.walk * Math.PI * 2;
  const bob = walking ? Math.abs(Math.cos(ph)) * 3 : Math.sin(t * 2.2 + seed) * 1.2;
  const legDx = walking ? Math.sin(ph) * 8 : 0;
  const lift = (k: number) => (walking ? Math.max(0, k) * 6 : 0);
  const bl = vBlink(t, seed);
  const kid = garb === 'kid';
  const sh = {L: [-21, -140 + bob] as P2, R: [21, -140 + bob] as P2};
  const arm = (side: 'L' | 'R') => {
    const [sx, sy] = sh[side];
    const [hx, hy] = side === 'L' ? P.handL : P.handR;
    const [ex, ey, tx, ty] = ik2(sx, sy, hx, hy + bob, 29, 29, side === 'L' ? -1 : 1);
    return (
      <g key={side}>
        <path d={`M${sx} ${f1(sy)}L${f1(ex)} ${f1(ey)}L${f1(tx)} ${f1(ty)}`} stroke={side === 'L' ? pal.top[1] : pal.top[0]} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={tx} cy={ty} r={6.8} fill={pal.skin[0]} />
      </g>
    );
  };
  const longSkirt = garb === 'kebaya';
  return (
    <g transform={`scale(${(flip ? -1 : 1) * idle.sx} ${idle.sy})${kid ? ' scale(0.78)' : ''}`}>
      {halus && <SoftShadow cx={0} cy={0} rx={46} ry={10} op={0.55} ink={SEM.ink} />}
      {/* legs + feet */}
      {[-1, 1].map((sd) => {
        const dx = sd * 9 + sd * legDx;
        const up = lift(sd * Math.sin(ph));
        return (
          <g key={sd}>
            {!longSkirt && <path d={rr(dx - 7, -52 - up, 14, 50, 6)} fill={pal.skin[1]} />}
            <path d={rr(dx - 10 + sd * 2, -10 - up, 20, 10, 5)} fill={pal.feet} />
          </g>
        );
      })}
      <g transform={`translate(0 ${f1(bob)}) rotate(${P.lean.toFixed(2)} 0 -60)`}>
        {arm('L')}
        {/* lower garment */}
        {garb === 'kid' ? (
          <Shade2 id={`${id}-b`} d={rr(-24, -96, 48, 46, 10)} lit={pal.bot[0]} dark={pal.bot[1]} dx={lx} dy={0} />
        ) : longSkirt ? (
          <g>
            <Shade2 id={`${id}-b`} d="M-24 -100 L24 -100 L21 -6 L-21 -6 Z" lit={pal.bot[0]} dark={pal.bot[1]} dx={lx} dy={0} />
            {[-70, -44, -18].map((yy) => <rect key={yy} x={-22} y={yy} width={44} height={5} fill={pal.band} />)}
          </g>
        ) : (
          <g>
            <Shade2 id={`${id}-b`} d="M-26 -102 L26 -102 L30 -16 L-30 -16 Z" lit={pal.bot[0]} dark={pal.bot[1]} dx={lx} dy={0} />
            <rect x={-29} y={-54} width={58} height={8} fill={pal.band} />
            <rect x={-30} y={-30} width={60} height={5} fill={pal.band} />
            <rect x={-27} y={-102} width={54} height={9} fill={pal.bot[1]} />
          </g>
        )}
        {/* torso */}
        {longSkirt ? (
          <Shade2 id={`${id}-t`} d="M-25 -146 Q-27 -118 -30 -92 L30 -92 Q27 -118 25 -146 Q0 -154 -25 -146 Z" lit={pal.top[0]} dark={pal.top[1]} dx={lx * 1.4} dy={ly} />
        ) : (
          <Shade2 id={`${id}-t`} d={rr(-26, -152, 52, 60, 16)} lit={pal.top[0]} dark={pal.top[1]} dx={lx * 1.4} dy={ly} />
        )}
        {garb === 'peci' && <path d="M-6 -150 L0 -134 L6 -150 Z" fill={pal.top[1]} />}
        {longSkirt && <path d="M-12 -148 L0 -122 L12 -148 Z" fill={pal.skin[1]} />}
        {garb === 'udeng' && <path d="M-27 -110 L27 -110 L27 -100 L-27 -100 Z" fill={pal.hat} />}
        {arm('R')}
        {front}
        {/* head */}
        <g transform={`translate(0 -178) rotate(${P.head.toFixed(2)})`}>
          {garb === 'kebaya' && <circle cx={-2} cy={-24} r={15} fill={pal.hair} />}
          <Shade2 id={`${id}-h`} d={circ(0, 0, 26)} lit={pal.skin[0]} dark={pal.skin[1]} dx={lx * 1.2} dy={ly} />
          {garb === 'peci' && <path d={rr(-21, -32, 42, 18, 4)} fill={pal.hat} />}
          {garb === 'peci' && <rect x={-21} y={-17} width={42} height={4} fill={pal.hatSh} />}
          {garb === 'udeng' && (
            <g>
              <path d="M-27 -6 Q-28 -30 0 -31 Q28 -30 27 -6 Q0 -14 -27 -6 Z" fill={pal.hat} />
              <path d="M2 -30 L-8 -48 L10 -40 Z" fill={pal.hat} />
              <path d="M-27 -6 Q0 -14 27 -6 L27 -2 Q0 -10 -27 -2 Z" fill={pal.hatSh} />
            </g>
          )}
          {(garb === 'kebaya' || garb === 'kid') && <path d="M-26 -4 Q-27 -28 0 -28 Q27 -28 26 -4 Q14 -16 0 -14 Q-14 -16 -26 -4 Z" fill={pal.hair} />}
          {garb === 'kid' && <path d="M-4 -27 Q2 -40 12 -36 Q4 -34 4 -26 Z" fill={pal.hair} />}
          {[-9, 9].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex + P.look[0] * 3} cy={2 + P.look[1] * 3} rx={3.4} ry={4.6 * bl} fill={pal.ink} />
              {Math.abs(P.brow) > 0.05 && <path d={`M${ex - 5} ${f1(-7 - P.brow * 4 + (P.brow < 0 ? (ex < 0 ? 2 : -2) : 0))}L${ex + 5} ${f1(-7 - P.brow * 4 + (P.brow < 0 ? (ex < 0 ? -2 : 2) : 0))}`} stroke={pal.ink} strokeWidth={2.6} strokeLinecap="round" />}
            </g>
          ))}
          <circle cx={-16} cy={10} r={4} fill={pal.cheek} />
          <circle cx={16} cy={10} r={4} fill={pal.cheek} />
          {P.mouth > 0.5 ? <ellipse cx={0} cy={14} rx={3.8} ry={5} fill={pal.ink} />
            : <path d={P.mouth < -0.5 ? 'M-5 14 Q0 12 5 15' : 'M-6 11 Q0 17 6 11'} stroke={pal.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" />}
        </g>
      </g>
    </g>
  );
};

// ================================================================ lesung + alu + impact
export const WOOD_NIGHT = {lit: '#7A5A4A', mid: '#634738', dark: '#4C3529', groove: '#2A1C17'};
/** Long wooden rice mortar (lesung), origin = ground centre, length L. */
export const Lesung: React.FC<{id: string; x: number; y: number; L?: number; s?: number; c?: typeof WOOD_NIGHT}> = ({id, x, y, L = 640, s = 1, c = WOOD_NIGHT}) => {
  const h = L / 2;
  const body = `M${-h} -82 L${h} -82 Q${h + 8} -40 ${h - 30} -10 L${h - 70} 0 L${-h + 70} 0 L${-h + 30} -10 Q${-h - 8} -40 ${-h} -82 Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={h + 10} ry={14} fill="#0C1729" />
      <Shade3 id={`${id}-b`} d={body} c={[c.lit, c.mid, c.dark]} dx={0} dy={-10} k={4.6} />
      <path d={rr(-h, -88, L, 16, 8)} fill={c.lit} />
      <path d={rr(-h + 46, -86, L - 150, 11, 5.5)} fill={c.groove} />
      <ellipse cx={h - 52} cy={-80} rx={26} ry={7} fill={c.groove} />
      {[-0.32, 0.05, 0.38].map((k, i) => <rect key={i} x={k * L - 2} y={-66} width={4} height={50} fill={c.dark} opacity={0.6} />)}
    </g>
  );
};
/** Pestle (alu): vertical pole, origin = bottom tip. */
export const Alu: React.FC<{len?: number; c?: typeof WOOD_NIGHT}> = ({len = 250, c = WOOD_NIGHT}) => (
  <g>
    <path d={rr(-9, -len, 18, len, 9)} fill={c.mid} />
    <path d={rr(-9, -len, 7, len, 3.5)} fill={c.lit} />
    <path d={rr(-11, -24, 22, 24, 9)} fill={c.dark} />
  </g>
);
/** Hard-edged flat impact rings on the ground (k: 0 → 1), with radiating dashes. No opacity: strokes thin out. */
export const ImpactRings: React.FC<{x: number; y: number; k: number; s?: number; color?: string}> = ({x, y, k, s = 1, color = SEM.cream}) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 0.22].map((o, i) => {
        const q = clamp01((k - o) / (1 - o));
        if (q <= 0 || q >= 1) return null;
        const r = 30 + 170 * (1 - Math.pow(1 - q, 2));
        return <ellipse key={i} cx={0} cy={0} rx={r} ry={r * 0.3} fill="none" stroke={color} strokeWidth={9 * (1 - q)} />;
      })}
      {[-150, -120, -60, -30].map((a, i) => {
        const q = clamp01(k / 0.7);
        if (q >= 1) return null;
        const r0 = 30 + 60 * q, r1 = r0 + 34 * (1 - q);
        return <line key={i} x1={Math.cos(rad(a)) * r0} y1={Math.sin(rad(a)) * r0 * 0.6 - 10} x2={Math.cos(rad(a)) * r1} y2={Math.sin(rad(a)) * r1 * 0.6 - 10} stroke={color} strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  );
};
/** Pop-in onomatopoeia ("DUG!"): cream Outfit 800, ink outline, pops with overshoot and shrinks away. */
export const Onomato: React.FC<{x: number; y: number; text: string; k: number; size?: number; rot?: number; color?: string}> = ({x, y, text, k, size = 120, rot = 0, color = SEM.cream}) => {
  if (k <= 0 || k >= 1) return null;
  const pop = k < 0.25 ? 1.25 * Math.sin((k / 0.25) * Math.PI * 0.5) : k < 0.75 ? 1.25 - 0.25 * ((k - 0.25) / 0.5) : 1 - (k - 0.75) / 0.25;
  return (
    <g transform={`translate(${x} ${y - k * 26}) rotate(${rot}) scale(${Math.max(0.001, pop).toFixed(4)})`}>
      <text x={0} y={size * 0.36} textAnchor="middle" fill={color} stroke={SEM.ink} strokeWidth={size * 0.13} strokeLinejoin="round" paintOrder="stroke"
        style={{fontFamily: HEAD, fontWeight: 800, fontSize: size}}>{text}</text>
    </g>
  );
};

// ================================================================ Kala Rahu (original flat ornamental head; origin = head centre)
export type KalaPal = {skin: readonly [string, string, string]; crown: readonly [string, string, string]; hair: readonly [string, string, string]; eye: string; pupil: string; mouth: string; tongue: string; teeth: string; gem: string; stud: string; ink: string};
export const KALA_NIGHT: KalaPal = {
  skin: ['#F59268', '#DB704F', '#B9553E'], crown: ['#FFCB5C', '#EFAA3E', '#C9862E'], hair: ['#46BBA8', '#2F9488', '#22716A'],
  eye: '#FFF4E0', pupil: '#16203A', mouth: '#5A2333', tongue: '#E8806A', teeth: '#FFF4E0', gem: '#5FD4B0', stud: '#2F9488', ink: '#4A1E2A',
};
export const KALA_PRINT: KalaPal = {
  skin: ['#FF8460', '#F06A47', '#D2563B'], crown: ['#FFC24B', '#F2AB37', '#D99229'], hair: ['#B4473A', '#97392E', '#7A2C24'],
  eye: '#FFF8EA', pupil: '#2A1A1E', mouth: '#6E2A2C', tongue: '#FFA083', teeth: '#FFF8EA', gem: '#FFF8EA', stud: '#B4473A', ink: '#6E2A2C',
};
export type KalaFace = {mouth: number; look: P2; brow: number; browTilt: number; lid: number; blink: number; cheek: number};
export const KALA_REST: KalaFace = {mouth: 0, look: [0.3, -0.3], brow: 0, browTilt: 0, lid: 0, blink: 1, cheek: 0};
const KALA_FACE_UP = 'M-250 -250 C-120 -300 120 -300 250 -250 C330 -170 345 -40 322 40 C314 82 300 112 282 136 L196 132 Q0 178 -196 132 L-282 136 C-300 112 -314 82 -322 40 C-345 -40 -330 -170 -250 -250 Z';
const KALA_JAW = 'M-286 124 L-196 124 Q0 170 196 124 L286 124 C270 206 236 250 160 276 C90 300 -90 300 -160 276 C-236 250 -270 206 -286 124 Z';
const flameD = (L: number, W: number, curl: number) =>
  `M${-W} 0 Q${f1(-W * 1.15)} ${f1(-L * 0.55)} 0 ${-L} Q${f1(W * 0.3 * curl)} ${f1(-L * 0.78)} ${f1(W * 0.62)} ${f1(-L * 0.62)} Q${f1(W * 1.25)} ${f1(-L * 0.38)} ${W} 0 Z`;
const KALA_FLAMES = Array.from({length: 11}, (_, i) => {
  const a = -172 + i * 16.4;
  const big = i % 2 === 0;
  return {a, x: Math.cos(rad(a)) * 300, y: -40 + Math.sin(rad(a)) * 290, L: big ? 220 : 160, W: big ? 70 : 52};
});
const spiralD = (r: number, turns = 1.6) => {
  const pts: P2[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = k * turns * Math.PI * 2;
    pts.push([Math.cos(a) * r * (1 - k * 0.78), Math.sin(a) * r * (1 - k * 0.78)]);
  }
  return spline(pts);
};
const SPIRAL = spiralD(30);
/** Kala Rahu head: big round eyes, fangs, curly flame-hair crown, ear studs, ornamental neck edge. mouth 0 = grin → 1 = wide open. */
export const KalaHead: React.FC<{id: string; t: number; f?: Partial<KalaFace>; pal?: KalaPal; light?: [number, number]; inMouth?: React.ReactNode; collar?: boolean}> = ({
  id, t, f: fz = {}, pal = KALA_NIGHT, light = [10, -6], inMouth, collar = true,
}) => {
  const F = {...KALA_REST, ...fz};
  const [lx, ly] = light;
  const drop = 26 + F.mouth * 230;
  const jaw = drop - 26;
  const sway = (i: number) => Math.sin(t * 1.3 + i * 0.9) * 3;
  const eyeY = -84;
  const lidK = Math.max(F.lid, 1 - F.blink);
  const browY = (sd: number) => -178 - F.brow * 26 + sd * F.browTilt * 22;
  return (
    <g>
      {/* flame hair behind */}
      {KALA_FLAMES.map((fl, i) => (
        <g key={i} transform={`translate(${f1(fl.x)} ${f1(fl.y)}) rotate(${f1(fl.a + 90 + sway(i))})`}>
          <path d={flameD(fl.L, fl.W, 1)} fill={i % 2 ? pal.hair[1] : pal.hair[2]} />
          <path d={flameD(fl.L * 0.62, fl.W * 0.55, 1)} fill={pal.hair[0]} transform={`translate(${f1(fl.W * 0.12)} 0)`} />
        </g>
      ))}
      {/* jaw-side flame beard (moves with the jaw) */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 268} ${f1(170 + jaw * 0.85)}) rotate(${sd * 150 + sway(sd + 5)})`}>
          <path d={flameD(170, 54, 1)} fill={pal.hair[2]} />
          <path d={flameD(104, 30, 1)} fill={pal.hair[0]} />
        </g>
      ))}
      {/* ears + studs + hanging ornaments */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 322} -14)`}>
          <ellipse cx={sd * 18} cy={0} rx={52} ry={84} fill={sd < 0 ? pal.skin[2] : pal.skin[1]} />
          <path d={`M${sd * 30} 54 Q${sd * 44} 100 ${sd * 26} 150 Q${sd * 8} 104 ${sd * 30} 54 Z`} fill={pal.hair[1]} />
          <circle cx={sd * 30} cy={164} r={18} fill={pal.crown[1]} />
          <circle cx={sd * 22} cy={-6} r={50} fill={pal.crown[1]} />
          <circle cx={sd * 22 - sd * 5} cy={-11} r={42} fill={pal.crown[0]} />
          <circle cx={sd * 22} cy={-6} r={25} fill={pal.stud} />
          <circle cx={sd * 22 - 7} cy={-14} r={8} fill={pal.eye} />
        </g>
      ))}
      {/* neck + ornamental collar (the clean edge below which there is nothing) */}
      <g transform={`translate(0 ${f1(jaw)})`}>
        <path d="M-170 230 L170 230 L150 330 L-150 330 Z" fill={pal.skin[2]} />
        {collar && (
          <g>
            <path d="M-196 300 Q0 334 196 300 L190 350 Q0 384 -190 350 Z" fill={pal.crown[1]} />
            <path d="M-196 300 Q0 334 196 300 L194 316 Q0 350 -194 316 Z" fill={pal.crown[0]} />
            {Array.from({length: 9}).map((_, i) => {
              const x = -160 + i * 40, yy = 352 + Math.cos((x / 196) * Math.PI * 0.5) * 30;
              return <path key={i} d={`M${x - 16} ${f1(yy - 6)} Q${x} ${f1(yy + 30)} ${x + 16} ${f1(yy - 6)} Z`} fill={i % 2 ? pal.hair[1] : pal.crown[2]} />;
            })}
          </g>
        )}
      </g>
      {/* jaw (lower face) + its fangs */}
      <g transform={`translate(0 ${f1(jaw)})`}>
        <Shade3 id={`${id}-jaw`} d={KALA_JAW} c={pal.skin} dx={lx} dy={ly} />
        <path d="M-60 238 Q0 256 60 238" stroke={pal.skin[2]} strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>
      {/* gap filler between upper face and dropped jaw */}
      {jaw > 1 && <path d={`M-292 120 L292 120 L288 ${f1(136 + jaw)} L-288 ${f1(136 + jaw)} Z`} fill={pal.skin[2]} />}
      {/* mouth interior */}
      <path d={`M-196 132 Q0 178 196 132 L196 ${f1(122 + drop)} Q0 ${f1(170 + drop)} -196 ${f1(122 + drop)} Z`} fill={pal.mouth} />
      <ellipse cx={0} cy={118 + drop * 0.95} rx={110 + F.mouth * 30} ry={20 + F.mouth * 40} fill={pal.tongue} />
      {inMouth && (
        <>
          <defs><clipPath id={`${id}-mc`}><path d={`M-196 132 Q0 178 196 132 L196 ${f1(122 + drop)} Q0 ${f1(170 + drop)} -196 ${f1(122 + drop)} Z`} /></clipPath></defs>
          <g clipPath={`url(#${id}-mc)`}>{inMouth}</g>
        </>
      )}
      {/* fangs on the jaw */}
      <g transform={`translate(0 ${f1(jaw)})`}>
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 128} 152 L${sd * 160} 150 L${sd * 150} 92 Z`} fill={pal.teeth} />)}
      </g>
      {/* upper face */}
      <Shade3 id={`${id}-face`} d={KALA_FACE_UP} c={pal.skin} dx={lx} dy={ly} />
      {/* upper teeth */}
      {Array.from({length: 6}).map((_, i) => {
        const x = -125 + i * 50;
        const yy = 132 + 46 * (1 - Math.pow(x / 196, 2)) - 8;
        return <path key={i} d={rr(x - 19, yy - 4, 38, 30, 9)} fill={pal.teeth} />;
      })}
      {/* cheek spirals */}
      {[-1, 1].map((sd) => <path key={sd} d={SPIRAL} transform={`translate(${sd * 222} 58) scale(${sd} 1) scale(${1 + F.cheek * 0.25})`} stroke={pal.crown[0]} strokeWidth={9} fill="none" strokeLinecap="round" />)}
      {/* eyes */}
      {[-1, 1].map((sd) => {
        const ex = sd * 134;
        const px = ex + F.look[0] * 30, py = eyeY + F.look[1] * 28;
        const cid = `${id}-eye${sd}`;
        return (
          <g key={sd}>
            <circle cx={ex} cy={eyeY} r={92} fill={pal.skin[2]} />
            <circle cx={ex} cy={eyeY} r={80} fill={pal.eye} />
            <defs><clipPath id={cid}><circle cx={ex} cy={eyeY} r={80} /></clipPath></defs>
            <g clipPath={`url(#${cid})`}>
              <circle cx={px} cy={py} r={38} fill={pal.pupil} />
              <circle cx={px - 13} cy={py - 13} r={11} fill={pal.eye} />
              {lidK > 0.01 && <rect x={ex - 90} y={eyeY - 90} width={180} height={180 * lidK * 0.94} fill={pal.skin[1]} />}
            </g>
          </g>
        );
      })}
      {/* curly brows */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M${sd * 50} ${f1(browY(sd) + 26)} Q${sd * 140} ${f1(browY(sd) - 22)} ${sd * 236} ${f1(browY(sd) + 4)}`} stroke={pal.hair[2]} strokeWidth={30} fill="none" strokeLinecap="round" />
          <circle cx={sd * 236} cy={browY(sd) + 4} r={22} fill={pal.hair[1]} />
          <circle cx={sd * 236} cy={browY(sd) + 4} r={9} fill={pal.hair[0]} />
        </g>
      ))}
      {/* nose */}
      <Shade3 id={`${id}-nose`} d="M-74 46 C-96 -6 -44 -40 0 -40 C44 -40 96 -6 74 46 C62 84 -62 84 -74 46 Z" c={pal.skin} dx={lx * 1.4} dy={ly * 1.4} />
      <ellipse cx={-30} cy={52} rx={16} ry={10} fill={pal.ink} />
      <ellipse cx={30} cy={52} rx={16} ry={10} fill={pal.ink} />
      {/* crown */}
      <path d="M-276 -206 Q0 -236 276 -206 L268 -282 Q0 -316 -268 -282 Z" fill={pal.crown[1]} />
      <path d="M-268 -282 Q0 -316 268 -282 L270 -262 Q0 -294 -270 -262 Z" fill={pal.crown[0]} />
      {[-200, -96, 96, 200].map((x) => <path key={x} d={SPIRAL} transform={`translate(${x} -246) scale(0.7)`} stroke={pal.crown[2]} strokeWidth={10} fill="none" strokeLinecap="round" />)}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 176} -282) rotate(${sd * 16})`}>
          <path d="M-46 4 C-52 -50 -16 -84 0 -118 C16 -84 52 -50 46 4 Z" fill={pal.crown[1]} />
          <path d="M-26 0 C-30 -36 -8 -60 0 -82 C8 -60 30 -36 26 0 Z" fill={pal.crown[0]} />
          <circle cx={0} cy={-26} r={13} fill={pal.gem} />
        </g>
      ))}
      <path d="M-84 -284 C-94 -364 -30 -424 0 -484 C30 -424 94 -364 84 -284 Z" fill={pal.crown[1]} />
      <path d="M-54 -288 C-60 -346 -18 -392 0 -436 C18 -392 60 -346 54 -288 Z" fill={pal.crown[0]} />
      <ellipse cx={0} cy={-340} rx={28} ry={38} fill={pal.gem} />
      <ellipse cx={-9} cy={-352} rx={8} ry={11} fill={pal.eye} />
    </g>
  );
};
/** Kala's body for the flashback (origin = head centre at head scale; neck cut line at y ≈ 300). armUp 0..1 lifts the kendi arm. */
export const KalaBody: React.FC<{id: string; pal?: KalaPal; t: number; light?: [number, number]; hold?: React.ReactNode}> = ({id, pal = KALA_PRINT, t, light = [10, -6], hold}) => {
  const br = Math.sin(t * 2) * 4;
  return (
    <g>
      <path d={rr(-150, 250, 300, 120, 30)} fill={pal.skin[2]} />
      <g transform={`translate(0 ${br.toFixed(2)})`}>
        <Shade3 id={`${id}-tor`} d="M-360 470 Q-330 350 -150 330 L150 330 Q330 350 360 470 L330 900 L-330 900 Z" c={pal.skin} dx={light[0] * 1.5} dy={light[1]} />
        <path d="M-210 360 Q0 470 210 360 L196 400 Q0 512 -196 400 Z" fill={pal.crown[1]} />
        {Array.from({length: 7}).map((_, i) => <circle key={i} cx={-150 + i * 50} cy={402 + Math.sin((i / 6) * Math.PI) * 60} r={13} fill={i % 2 ? pal.hair[1] : pal.crown[0]} />)}
        <path d={rr(-336, 700, 672, 70, 20)} fill={pal.crown[1]} />
        <path d="M-350 770 L350 770 L380 1100 L-380 1100 Z" fill={pal.crown[0]} />
        {Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-300 + i * 120} 800 l40 60 l-40 60 l-40 -60 Z`} fill={pal.skin[1]} />)}
        {/* arms: left arm (screen right) on the belly, right arm (screen left) up to the mouth with the kendi */}
        <path d="M318 410 L404 600 L318 742" stroke={pal.skin[2]} strokeWidth={92} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={rr(330, 470, 100, 34, 14)} fill={pal.crown[0]} transform="rotate(64 380 487)" />
        <circle cx={312} cy={752} r={54} fill={pal.skin[0]} />
        <path d="M-318 410 L-430 520 L-336 300" stroke={pal.skin[2]} strokeWidth={92} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={rr(-442, 430, 100, 34, 14)} fill={pal.crown[0]} transform="rotate(-50 -392 447)" />
        {hold}
      </g>
    </g>
  );
};

// ================================================================ kendi + cakra + sparkles
/** Indonesian kendi (spouted water jar), origin = body centre, ~150 wide. */
export const Kendi: React.FC<{id: string; c?: readonly [string, string, string]; band?: string}> = ({id, c = ['#E08A5A', '#C46E44', '#9E5534'], band = '#FFC24B'}) => (
  <g>
    <path d="M58 -4 Q104 -32 124 -64 Q132 -72 138 -62 Q120 -14 72 22 Z" fill={c[1]} />
    <path d={rr(-26, -112, 52, 40, 10)} fill={c[1]} />
    <path d={rr(-36, -122, 72, 16, 8)} fill={c[0]} />
    <Shade3 id={`${id}-k`} d={circ(0, 0, 82)} c={c} dx={-8} dy={-8} k={2.6} />
    <path d="M-80 -6 Q0 14 80 -6 L78 10 Q0 30 -78 10 Z" fill={band} />
  </g>
);
/** Flat spinning cakra: sharp petals around a ring and hub (rot in deg). */
export const Cakra: React.FC<{r?: number; rot: number; c?: {blade: string; bladeSh: string; ring: string; hub: string; core: string}}> = ({
  r = 90, rot, c = {blade: '#FFF4E0', bladeSh: '#E6D3B0', ring: '#FFC24B', hub: '#FF7A59', core: '#FFF4E0'},
}) => (
  <g transform={`rotate(${rot.toFixed(2)}) scale(${r / 100})`}>
    {Array.from({length: 10}).map((_, i) => (
      <g key={i} transform={`rotate(${i * 36})`}>
        <path d="M-16 -62 L0 -104 L22 -60 Z" fill={c.blade} />
        <path d="M0 -104 L22 -60 L6 -62 Z" fill={c.bladeSh} />
      </g>
    ))}
    <circle r={66} fill={c.ring} />
    <circle r={50} fill={c.hub} />
    <circle r={28} fill={c.ring} />
    <circle r={12} fill={c.core} />
    {Array.from({length: 8}).map((_, i) => <circle key={i} cx={Math.cos(rad(i * 45)) * 58} cy={Math.sin(rad(i * 45)) * 58} r={5} fill={c.core} />)}
  </g>
);
/** Arc of sparkles (magic water), k = 0..1 progress along the arc; n sparkles flowing. */
export const SparkleStream: React.FC<{from: P2; ctrl: P2; to: P2; t: number; n?: number; color?: string; size?: number; q?: number}> = ({from, ctrl, to, t, n = 7, color = SEM.cream, size = 14, q = 1}) => {
  if (q <= 0.01) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const k = ((t * 0.9 + i / n) % 1);
        const x = (1 - k) * (1 - k) * from[0] + 2 * (1 - k) * k * ctrl[0] + k * k * to[0];
        const y = (1 - k) * (1 - k) * from[1] + 2 * (1 - k) * k * ctrl[1] + k * k * to[1];
        const s = size * q * Math.sin(k * Math.PI) * (i % 2 ? 0.75 : 1);
        return <path key={i} d={sparkleD(x, y, Math.max(0.1, s))} fill={color} />;
      })}
    </g>
  );
};

// ================================================================ eclipse diagram pieces
/** Shadow cone behind a body: apex direction `dir` (deg). umbra converges, penumbra diverges. Returns polygons. */
export const coneGeom = (ex: number, ey: number, re: number, dir: number, len: number, uEnd = 0.55, pEnd = 1.6, bands = 2) => {
  const c = Math.cos(rad(dir)), s = Math.sin(rad(dir));
  const nx = -s, ny = c;
  const P = (along: number, side: number): P2 => [ex + c * along + nx * side, ey + s * along + ny * side];
  const umbra: P2[] = [P(0, re), P(len, re * uEnd), P(len, -re * uEnd), P(0, -re)];
  const pens: P2[][] = Array.from({length: bands}, (_, i) => {
    const w = lerp(re, re * pEnd, (i + 1) / bands);
    return [P(0, re), P(len, w), P(len, -w), P(0, -re)];
  }).reverse();
  return {umbra, pens, axis: [P(0, 0), P(len, 0)] as [P2, P2]};
};
export const ShadowCone: React.FC<{g: ReturnType<typeof coneGeom>; umbra?: string; pens?: string[]}> = ({g, umbra = '#071327', pens = ['#132C50', '#0D2140']}) => (
  <g>
    {g.pens.map((pp, i) => <path key={i} d={polyD(pp)} fill={pens[i] ?? pens[pens.length - 1]} />)}
    <path d={polyD(g.umbra)} fill={umbra} />
  </g>
);
/** Simple angle arc (deg, SVG angles) with radius r. */
export const angleArcD = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${f1(cx + r * Math.cos(rad(a0)))} ${f1(cy + r * Math.sin(rad(a0)))}A${r} ${r} 0 ${large} ${sweep} ${f1(cx + r * Math.cos(rad(a1)))} ${f1(cy + r * Math.sin(rad(a1)))}`;
};

// ---------------------------------------------------------------- tiny 3D orbit rig (Sun at origin, ecliptic = XZ plane, Y up)
export type V3 = [number, number, number];
export type Cam3 = {cx: number; cy: number; t: V3; s: number; el: number};
/** Project a world point: screen x right, screen y down; d = depth (larger = farther from the viewer). */
export const proj = (c: Cam3, [X, Y, Z]: V3): {x: number; y: number; d: number} => {
  const x = X - c.t[0], y = Y - c.t[1], z = Z - c.t[2];
  const ce = Math.cos(c.el), se = Math.sin(c.el);
  return {x: c.cx + x * c.s, y: c.cy - (y * ce + z * se) * c.s, d: z * ce - y * se};
};
/** Point on a tilted circular orbit around `o`: node line at angle om (rad, in XZ), inclination inc, position u. */
export const orbitPt = (o: V3, R: number, om: number, inc: number, u: number): V3 => {
  const n: V3 = [Math.cos(om), 0, Math.sin(om)], m: V3 = [-Math.sin(om), 0, Math.cos(om)];
  const cu = Math.cos(u), su = Math.sin(u), ci = Math.cos(inc), si = Math.sin(inc);
  return [o[0] + R * (cu * n[0] + su * ci * m[0]), o[1] + R * su * si, o[2] + R * (cu * n[2] + su * ci * m[2])];
};
/** Projected orbit split into far/near halves relative to the centre's depth (draw far before the body, near after). */
export const orbitPaths = (c: Cam3, o: V3, R: number, om: number, inc: number, n = 72) => {
  const pc = proj(c, o);
  let far = '', near = '';
  let prevFar: boolean | null = null;
  for (let i = 0; i <= n; i++) {
    const p = proj(c, orbitPt(o, R, om, inc, (i / n) * Math.PI * 2));
    const isFar = p.d > pc.d;
    const cmd = `${f1(p.x)} ${f1(p.y)}`;
    if (isFar) far += (prevFar === true ? 'L' : 'M') + cmd;
    else near += (prevFar === false ? 'L' : 'M') + cmd;
    // stitch the joint so halves meet
    if (prevFar !== null && prevFar !== isFar) {
      if (isFar) near += `L${cmd}`;
      else far += `L${cmd}`;
    }
    prevFar = isFar;
  }
  return {far, near};
};

// ================================================================ boards, stamp, labels
/** Big title text: Outfit 800, cream with a hard ink outline (no glow). */
export const TitleText: React.FC<{x: number; y: number; text: string; q: number; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; rise?: number}> = ({
  x, y, text, q, size = 120, color = SEM.cream, anchor = 'middle', rise = 30,
}) => {
  if (q <= 0.002) return null;
  return (
    <g transform={`translate(${x} ${f1(y + (1 - Math.min(1, q)) * rise)}) scale(${(0.86 + 0.14 * q).toFixed(4)})`} opacity={Math.min(1, q * 1.6)}>
      <text x={0} y={0} textAnchor={anchor} fill={color} stroke={SEM.ink} strokeWidth={size * 0.14} strokeLinejoin="round" paintOrder="stroke"
        style={{fontFamily: HEAD, fontWeight: 800, fontSize: size}}>{text}</text>
    </g>
  );
};
/** Rubber stamp "0 TOTAL": the zero is a drawn ellipse ring (so its hole can double as a zoom portal). k = 0..1 landing. */
export const ZERO = {rx: 40, ry: 62, w: 22, cx: -86};
export const StampZero: React.FC<{x: number; y: number; k: number; rot?: number; label?: string; color?: string; bare?: number}> = ({x, y, k, rot = -10, label = 'TOTAL', color = SEM.coral, bare = 0}) => {
  if (k <= 0.001) return null;
  const s = k < 1 ? lerp(1.32, 1, Math.min(1, k * 1.25)) + Math.sin(Math.min(1, k) * Math.PI) * 0.04 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(4)})`} opacity={Math.min(1, k * 2.2)}>
      {bare < 0.99 && (
        <g opacity={1 - bare}>
          <path d={rr(-160, -96, 320, 192, 40)} fill="none" stroke={color} strokeWidth={10} />
          <path d={rr(-146, -82, 292, 164, 30)} fill="none" stroke={color} strokeWidth={4} />
          <text x={ZERO.cx + ZERO.rx + 24} y={20} textAnchor="start" fill={color} style={{fontFamily: HEAD, fontWeight: 800, fontSize: 54}}>{label}</text>
        </g>
      )}
      <ellipse cx={ZERO.cx} cy={0} rx={ZERO.rx} ry={ZERO.ry} fill="none" stroke={color} strokeWidth={ZERO.w} />
    </g>
  );
};

// ================================================================ sunset ring (Earth seen from the Moon during totality)
export const RING_BANDS: Array<[string, number]> = [['#8F2E24', 7], ['#D24A2E', 9], ['#F27A3A', 9], ['#FFB347', 6], ['#FFE2A0', 3]];
/** Ring of posterized sunset bands around a disc of radius r. q = 0..1 how much of the ring is drawn (from angle a0, deg). */
export const SunsetRing: React.FC<{x: number; y: number; r: number; q: number; a0?: number; thick?: number}> = ({x, y, r, q, a0 = -90, thick = 1}) => {
  if (q <= 0.002) return null;
  let rr0 = r;
  return (
    <g transform={`translate(${x} ${y})`}>
      {RING_BANDS.map(([c, w], i) => {
        const ww = w * thick;
        const rm = rr0 + ww / 2;
        rr0 += ww;
        const C = 2 * Math.PI * rm;
        return <circle key={i} r={rm} fill="none" stroke={c} strokeWidth={ww + 0.6} strokeDasharray={`${(C * Math.min(1, q)).toFixed(2)} ${(C + 10).toFixed(2)}`} transform={`rotate(${a0})`} />;
      })}
    </g>
  );
};
/** Tiny sunrise/sunset vignette in a round badge: sky bands, half sun on a horizon, a silhouette. kind: 0 sea, 1 hills, 2 palms. */
export const SunsetBadge: React.FC<{id: string; x: number; y: number; r: number; q: number; kind?: number; rise?: boolean}> = ({id, x, y, r, q, kind = 0, rise = false}) => {
  if (q <= 0.002) return null;
  const sky = rise ? ['#F7B26A', '#F59A5C', '#EE7F55', '#D9654F'] : ['#E8725A', '#D95A4E', '#B84A4E', '#8E3E52'];
  return (
    <g transform={`translate(${x} ${y}) scale(${q.toFixed(4)})`}>
      <circle r={r + 8} fill={SEM.ink} />
      <defs><clipPath id={`${id}-c`}><circle r={r} /></clipPath></defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect x={-r} y={-r} width={2 * r} height={2 * r} fill={sky[0]} />
        {sky.slice(1).map((c, i) => <circle key={i} cx={0} cy={r * 0.3} r={r * (1.2 - i * 0.28)} fill={c} />)}
        <circle cx={0} cy={r * 0.3} r={r * 0.34} fill="#FFC24B" />
        {kind === 0 && <g><rect x={-r} y={r * 0.3} width={2 * r} height={r} fill="#2E4F80" />{[0.45, 0.62, 0.8].map((k, i) => <rect key={i} x={-r * 0.3 + i * 6} y={r * k} width={r * (0.6 - i * 0.12)} height={4} rx={2} fill="#FFC24B" />)}</g>}
        {kind === 1 && <path d={`M${-r} ${r * 0.34} Q${-r * 0.4} ${r * 0.02} 0 ${r * 0.3} Q${r * 0.5} ${-r * 0.05} ${r} ${r * 0.3} L${r} ${r} L${-r} ${r} Z`} fill="#3A2A44" />}
        {kind === 2 && <g><rect x={-r} y={r * 0.3} width={2 * r} height={r} fill="#3A2A44" /><path d={`M${r * 0.42} ${r * 0.32} Q${r * 0.38} ${-r * 0.1} ${r * 0.5} ${-r * 0.3}`} stroke="#3A2A44" strokeWidth={6} fill="none" /><path d={`M${r * 0.5} ${-r * 0.3} q-30 2 -40 18 M${r * 0.5} ${-r * 0.3} q30 -2 36 16 M${r * 0.5} ${-r * 0.3} q-6 -20 -24 -26`} stroke="#3A2A44" strokeWidth={7} fill="none" strokeLinecap="round" /></g>}
      </g>
      <circle r={r} fill="none" stroke={SEM.cream} strokeWidth={5} />
    </g>
  );
};

// ================================================================ space sky + transitions
const SKY_BOX: [number, number, number, number] = [-900, -1600, 2000, 3500];
const SP_FAR = starsD(51, 600, SKY_BOX, 1.3, 2.5);
const SP_MID = starsD(63, 220, SKY_BOX, 2.2, 3.8);
const SP_SPARK = starsD(71, 56, SKY_BOX, 8, 16, true);
const SP_HAZE_B = [strataD(-1100, 2200, 260, 420, 13, 90), strataD(-1100, 2200, 1080, 1260, 15, 110), strataD(-1100, 2200, -780, -620, 19, 90), strataD(-1100, 2200, 1900, 2140, 25, 110), strataD(-1100, 2200, -1560, -1380, 31, 100)].join(' ');
const SP_HAZE_F = [strataD(-1100, 2200, 1360, 1440, 17, 90), strataD(-1100, 2200, 600, 660, 23, 70), strataD(-1100, 2200, -320, -240, 27, 80), strataD(-1100, 2200, 2400, 2480, 29, 90)].join(' ');
/** Deep-space backdrop (flat): far + mid stars, sparkles and two hard-edged haze strata, parallaxed by cam. */
export const SpaceSky: React.FC<{t: number; cam: Cam; haze?: boolean}> = ({t, cam, haze = true}) => {
  const fr = useFrame();
  const bc = {...cam, z: cam.z > 1 ? Math.sqrt(cam.z) : cam.z};
  return (
    <>
      <rect x={-200} y={-200} width={fr.W + 400} height={fr.H + 400} fill={SEM.space} />
      <Layer cam={bc} d={0.08}><path d={SP_FAR} fill={SEM.starDim} /></Layer>
      {haze && <Layer cam={bc} d={0.2}><g transform={`translate(${(t * 7).toFixed(2)} 0)`}><path d={SP_HAZE_B} fill={SEM.haze1} /></g></Layer>}
      <Layer cam={bc} d={0.26}><path d={SP_MID} fill={SEM.star} /></Layer>
      <Layer cam={bc} d={0.3}><path d={SP_SPARK} fill={SEM.star} /></Layer>
      {haze && <Layer cam={bc} d={0.45}><g transform={`translate(${(-t * 12).toFixed(2)} 0)`}><path d={SP_HAZE_F} fill={SEM.haze2} /></g></Layer>}
    </>
  );
};
/** Band of three flat cloud strata centred on screen y `yb` (a wipe moves yb across the frame). */
export const StrataBand: React.FC<{yb: number; seed?: number; cols?: [string, string, string]}> = ({yb, seed = 41, cols = ['#1D3A68', '#2E4C82', '#46598F']}) => {
  const x1 = Math.max(1300, useFrame().W + 220);
  return (
    <g>
      <path d={strataD(-200, x1, yb - 230, yb + 30, seed, 120)} fill={cols[0]} />
      <path d={strataD(-200, x1, yb - 120, yb + 120, seed + 2, 110)} fill={cols[1]} />
      <path d={strataD(-200, x1, yb - 10, yb + 220, seed + 6, 100)} fill={cols[2]} />
    </g>
  );
};
/** Constellation: points joined by crisp lines drawn on with q (0..1), sparkles at the vertices. */
export const Constellation: React.FC<{pts: P2[]; q: number; closed?: boolean; color?: string; w?: number; star?: number}> = ({pts, q, closed = false, color = SEM.cream, w = 4, star = 13}) => {
  if (q <= 0.002) return null;
  const segs = closed ? pts.length : pts.length - 1;
  return (
    <g>
      {Array.from({length: segs}).map((_, i) => {
        const k = clamp01(q * segs - i);
        if (k <= 0) return null;
        const a = pts[i], b = pts[(i + 1) % pts.length];
        return <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], b[0], k)} y2={lerp(a[1], b[1], k)} stroke={color} strokeWidth={w} strokeLinecap="round" />;
      })}
      {pts.map(([x, y], i) => {
        const k = clamp01(q * segs - i + 0.6);
        return k > 0.01 && <path key={i} d={sparkleD(x, y, (i % 3 === 0 ? star * 1.25 : star) * k)} fill={color} />;
      })}
    </g>
  );
};
/** Width-measured pill label placed so it never leaves the safe area horizontally. */
export const safePillX = (x: number, text: string, size: number, align: 'c' | 'l' | 'r' = 'c', lo = 64, hi = 1016) => {
  const w = textW(text, size, 800) + size * 1.24;
  const left = align === 'l' ? x : align === 'r' ? x - w : x - w / 2;
  const sh = left < lo ? lo - left : left + w > hi ? hi - (left + w) : 0;
  return x + sh;
};
/** Little flat drop/dot burst used for scattered light (k 0..1). */
export const Burst: React.FC<{x: number; y: number; k: number; dir: number; spread?: number; n?: number; dist?: number; color?: string; seed?: number; size?: number}> = ({x, y, k, dir, spread = 120, n = 9, dist = 160, color = '#6DB2F2', seed = 1, size = 1}) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const a = rad(dir + (rnd(seed + i * 3.3) - 0.5) * spread);
        const dd = dist * (0.5 + rnd(seed + i * 1.7) * 0.6) * (1 - Math.pow(1 - k, 2));
        const r = (5 + rnd(seed + i * 5.1) * 5) * (1 - k) * size;
        return <circle key={i} cx={x + Math.cos(a) * dd} cy={y + Math.sin(a) * dd} r={r} fill={color} />;
      })}
    </g>
  );
};
export {puffD, drawOn};

// ================================================================ helpers moved out of the gerhana episode (v1.14 fold)
/** Rolling hill silhouette through points, closed down to yBot. */
export const hillPathD = (pts: P2[], yBot: number) => `${spline(pts)} L ${pts[pts.length - 1][0]} ${yBot} L ${pts[0][0]} ${yBot} Z`;

/** Grazing sun ray as a sampled polyline around a planet E (centre + radius): straight down past the limb at band radius
 *  rho on side sd, along the atmosphere band, then off on the tangent toward (mx, my) — it never crosses the planet.
 *  kLimb = fraction of the length where it reaches the limb point (split colours there: sunflower before, red/orange after). */
export type RayG = {pts: P2[]; cum: number[]; L: number; kLimb: number; mid: P2};
export const grazeRay = (E: {x: number; y: number}, sd: -1 | 1, rho: number, mx: number, my: number, top = -80): RayG => {
  const dx = mx - E.x, dy = my - E.y, d = Math.hypot(dx, dy);
  const phi = Math.atan2(dy, dx), off = Math.acos(rho / d);
  const a = sd < 0 ? phi + off : phi - off;
  const a0 = sd < 0 ? Math.PI : 0;
  const pts: P2[] = [[E.x + sd * rho, top]];
  for (let i = 0; i <= 12; i++) {
    const ang = lerp(a0, a, i / 12);
    pts.push([E.x + rho * Math.cos(ang), E.y + rho * Math.sin(ang)]);
  }
  pts.push([mx, my]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1];
  return {pts, cum, L, kLimb: cum[1] / L, mid: [E.x + rho * Math.cos((a0 + a) / 2), E.y + rho * Math.sin((a0 + a) / 2)]};
};
/** Sub-polyline of a ray between length fractions k0..k1, plus the tip position and direction (for the arrowhead). */
export const raySub = (r: {pts: P2[]; cum: number[]; L: number}, k0: number, k1: number) => {
  const at = (k: number): {p: P2; i: number} => {
    const l = clamp01(k) * r.L;
    let i = 1;
    while (i < r.cum.length - 1 && r.cum[i] < l) i++;
    const seg = r.cum[i] - r.cum[i - 1] || 1;
    const u = (l - r.cum[i - 1]) / seg;
    return {p: [lerp(r.pts[i - 1][0], r.pts[i][0], u), lerp(r.pts[i - 1][1], r.pts[i][1], u)], i};
  };
  const s0 = at(k0), s1 = at(k1);
  const pts: P2[] = [s0.p];
  for (let i = s0.i; i < s1.i; i++) pts.push(r.pts[i]);
  pts.push(s1.p);
  const prev = r.pts[s1.i - 1];
  const ang = Math.atan2(s1.p[1] - prev[1], s1.p[0] - prev[0]);
  return {d: 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'), tip: s1.p, ang};
};
/** A straight ray as a polyline (for raySub / Arrowhead), e.g. sunlight that misses the planet. */
export const lineRay = (x0: number, y0: number, x1: number, y1: number) => ({pts: [[x0, y0], [x1, y1]] as P2[], cum: [0, Math.hypot(x1 - x0, y1 - y0)], L: Math.hypot(x1 - x0, y1 - y0)});
/** Small flat arrowhead at a ray tip (ang in radians). */
export const Arrowhead: React.FC<{x: number; y: number; ang: number; color: string; s?: number}> = ({x, y, ang, color, s = 1}) => (
  <path d="M14 0 L-9 -10 L-5 0 L-9 10 Z" fill={color} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(2)}) scale(${s})`} />
);

/** StampZero portal: screen position of the zero's hole for a stamp at (x, y) rotated `rot` (scale 1). */
export const zeroCenterOf = (x: number, y: number, rot: number): P2 => [x + ZERO.cx * Math.cos(rad(rot)), y + ZERO.cx * Math.sin(rad(rot))];
/** Even-odd clip path: the whole frame minus the zero's hole zoomed by Z around zc → everything outside the "0" stays,
 *  the next scene shows through the hole. Use as <clipPath><path clipRule="evenodd" d={zeroHoleD(...)} /></clipPath>. */
export const zeroHoleD = (zc: P2, Z: number, rot: number, W = 1080, H = 1920) => {
  const rx = (ZERO.rx - ZERO.w / 2) * Z, ry = (ZERO.ry - ZERO.w / 2) * Z;
  const ca = Math.cos(rad(rot)), sa = Math.sin(rad(rot));
  return `M-60 -60 H${W + 60} V${H + 60} H-60 Z M${(zc[0] - rx * ca).toFixed(1)} ${(zc[1] - rx * sa).toFixed(1)} a${rx.toFixed(1)} ${ry.toFixed(1)} ${rot} 1 0 ${(2 * rx * ca).toFixed(1)} ${(2 * rx * sa).toFixed(1)} a${rx.toFixed(1)} ${ry.toFixed(1)} ${rot} 1 0 ${(-2 * rx * ca).toFixed(1)} ${(-2 * rx * sa).toFixed(1)} Z`;
};

// ================================================================ NightVillage — the whole Java/Bali night village as one parallax set
// Layers (rest = canvas centre): 0 sky · 0.05 stars · 0.1 Moon slot + far clouds + sky slot · 0.14 near clouds · 0.2 far hills
// + meru + palms · 0.35 terraces · 0.55 village row (limasan, bale, candi bentar, palms) · 1 yard (joglo, lumbung, fence,
// stones, tufts) + yard slot · 1.35 foreground bananas. `dim` (0..1) = posterized moonlight dimming on rims/roofs/water,
// `part` (0..1) = clouds part outward, `doors` (0..1) = joglo doors open on warm light. Portrait = gerhana-episode layout.
type VLayout = {
  rest: Cam; skyRect: [number, number, number, number]; stars: string; spark: string;
  extra: Array<{x: number; y: number; r: number; at: number}>; cloudsFar: Array<[number, number, number, number]>; cloudsNear: Array<[number, number, number, number]>;
  midX: number; hillFar: string; hillMid: string; hillNear: string; meru: Array<[number, number, number, number]>; palmsFar: Array<[number, number, number]>;
  terraces: Array<[number, number, number, number, number, number]>; houses: Array<{x: number; y: number; s: number; kind: 'limasan' | 'bale'; lamp: boolean}>;
  candi: [number, number, number]; palmsRow: Array<[number, number, number, number]>; yard: string; stones: Array<[number, number, number]>; tufts: string;
  lumbung: [number, number, number]; door: P2; fence: [number, number, number]; bananas: Array<[number, number, number, boolean]>;
};
const villageTufts = (pts: Array<[number, number, number]>) => pts.map(([x, y, s]) => `M${x - 14 * s} ${y}L${x - 9 * s} ${y - 24 * s}L${x - 3 * s} ${y - 6 * s}L${x + 2 * s} ${y - 32 * s}L${x + 6 * s} ${y - 6 * s}L${x + 12 * s} ${y - 20 * s}L${x + 16 * s} ${y}Z`).join(' ');
export const VILLAGE: Record<'portrait' | 'landscape', VLayout> = {
  portrait: {
    rest: {x: 540, y: 960, z: 1}, skyRect: [-600, -2400, 2300, 5200],
    stars: starsD(201, 230, [-300, -900, 1400, 1080], 1.3, 3.0), spark: starsD(207, 20, [-200, -800, 1300, 900], 7, 12, true),
    extra: Array.from({length: 90}, (_, i) => ({x: -150 + rnd(i * 2.3 + 5) * 1380, y: -600 + rnd(i * 4.1 + 2) * 1500, r: 1.6 + rnd(i * 1.9) * 2, at: 2.6 + rnd(i * 7.7) * 2.2})),
    cloudsFar: [[110, 640, 170, 44], [420, 720, 120, 32], [930, 770, 190, 48], [1010, 260, 150, 40], [40, 230, 120, 32], [640, 900, 170, 40], [300, 360, 110, 28]],
    cloudsNear: [[250, 1010, 240, 62], [650, 1030, 230, 58], [450, 1066, 300, 60], [930, 1000, 200, 52]], midX: 540,
    hillFar: hillPathD([[-320, 1068], [-80, 996], [170, 1046], [420, 984], [650, 1036], [890, 972], [1110, 1022], [1400, 1004]], 2600),
    hillMid: hillPathD([[-320, 1156], [-40, 1100], [230, 1140], [480, 1094], [760, 1144], [1000, 1090], [1400, 1126]], 2600),
    hillNear: hillPathD([[-320, 1240], [200, 1210], [600, 1230], [1000, 1205], [1400, 1225]], 2600),
    meru: [[905, 1000, 0.62, 5], [985, 1012, 0.42, 3]], palmsFar: [[120, 1046, 120], [190, 1040, 96], [700, 1036, 104]],
    terraces: [[250, 1130, 430, 4, 30, 0], [830, 1124, 360, 4, 28, 1.3]],
    houses: [{x: 110, y: 1222, s: 0.78, kind: 'limasan', lamp: true}, {x: 560, y: 1226, s: 0.72, kind: 'limasan', lamp: false}, {x: 680, y: 1220, s: 0.8, kind: 'bale', lamp: true}],
    candi: [840, 1222, 0.6], palmsRow: [[30, 1228, 270, 40], [560, 1230, 230, -30], [1060, 1226, 250, -46]],
    yard: 'M-400 1372 Q540 1352 1480 1372 L1480 2700 L-400 2700 Z',
    stones: [[386, 1452, 44], [402, 1500, 50], [430, 1556, 56], [452, 1620, 60], [300, 1590, 30], [620, 1530, 34]],
    tufts: villageTufts([[120, 1830, 1.4], [300, 1880, 1.1], [520, 1850, 1.3], [760, 1890, 1.2], [930, 1840, 1.5], [1040, 1880, 1.1], [40, 1900, 1.2], [90, 1470, 1.1], [150, 1520, 0.8], [640, 1460, 0.9], [700, 1500, 1.2], [980, 1560, 1.1], [1030, 1600, 0.9], [60, 1640, 1.3], [990, 1690, 1.2], [180, 1580, 0.7], [760, 1590, 0.8]]),
    lumbung: [960, 1476, 0.92], door: [380, 1424], fence: [640, 1432, 110], bananas: [[-30, 1980, 1.25, false], [1110, 2010, 1.1, true]],
  },
  landscape: {
    rest: {x: 960, y: 540, z: 1, cx: 960, cy: 540}, skyRect: [-600, -1800, 3100, 3900],
    stars: starsD(201, 300, [-300, -700, 2250, 640], 1.3, 3.0), spark: starsD(207, 26, [-200, -600, 2150, 520], 7, 12, true),
    extra: Array.from({length: 120}, (_, i) => ({x: -150 + rnd(i * 2.3 + 5) * 2220, y: -400 + rnd(i * 4.1 + 2) * 1000, r: 1.6 + rnd(i * 1.9) * 2, at: 2.6 + rnd(i * 7.7) * 2.2})),
    cloudsFar: [[140, 330, 170, 44], [560, 410, 120, 32], [1210, 440, 190, 48], [1760, 150, 150, 40], [360, 120, 120, 32], [1580, 520, 170, 40], [880, 230, 110, 28]],
    cloudsNear: [[300, 610, 240, 62], [900, 630, 230, 58], [1500, 620, 280, 60], [1840, 600, 200, 52]], midX: 960,
    hillFar: hillPathD([[-320, 650], [-80, 580], [220, 630], [520, 566], [820, 620], [1120, 560], [1420, 612], [1720, 572], [2000, 618], [2280, 590]], 2000),
    hillMid: hillPathD([[-320, 734], [-40, 682], [300, 722], [640, 676], [980, 726], [1320, 674], [1660, 720], [2000, 680], [2280, 706]], 2000),
    hillNear: hillPathD([[-320, 812], [260, 784], [760, 804], [1260, 780], [1760, 800], [2280, 788]], 2000),
    meru: [[1640, 588, 0.62, 5], [1720, 600, 0.42, 3]], palmsFar: [[160, 630, 120], [230, 624, 96], [1040, 618, 104], [1880, 616, 110]],
    terraces: [[360, 712, 480, 4, 28, 0], [1300, 706, 420, 4, 26, 1.3]],
    houses: [{x: 150, y: 796, s: 0.78, kind: 'limasan', lamp: true}, {x: 1060, y: 800, s: 0.72, kind: 'limasan', lamp: false}, {x: 1180, y: 794, s: 0.8, kind: 'bale', lamp: true}, {x: 1820, y: 790, s: 0.74, kind: 'limasan', lamp: true}],
    candi: [1370, 796, 0.6], palmsRow: [[40, 802, 270, 40], [1000, 804, 230, -30], [1600, 800, 250, -46], [1960, 800, 240, 30]],
    yard: 'M-400 812 Q960 794 2320 812 L2320 1700 L-400 1700 Z',
    stones: [[686, 884, 44], [702, 926, 50], [730, 974, 52], [600, 954, 30], [920, 940, 34]],
    tufts: villageTufts([[90, 880, 1.1], [180, 920, 0.8], [1040, 870, 0.9], [1120, 910, 1.2], [1700, 930, 1.1], [1820, 890, 0.9], [1880, 1040, 1.2], [460, 1050, 0.7], [1300, 1060, 0.8], [60, 1060, 1.3]]),
    lumbung: [1480, 880, 0.92], door: [680, 862], fence: [940, 870, 110], bananas: [[-40, 1250, 1.0, false], [1960, 1270, 0.95, true]],
  },
};
export const NightVillage: React.FC<{
  t: number; cam: Cam; layout?: 'portrait' | 'landscape'; dim?: number; part?: number; doors?: number; glint?: string;
  extraStars?: 'reveal' | 'static' | 'none'; moon?: React.ReactNode; sky?: React.ReactNode; yard?: React.ReactNode; id?: string;
}> = ({t, cam, layout, dim = 0, part = 0, doors = 0, glint, extraStars = 'reveal', moon, sky, yard, id = ''}) => {
  const fr = useFrame();
  const V = VILLAGE[layout ?? (fr.wide ? 'landscape' : 'portrait')];
  const R = V.rest;
  const lit = (a: string, b: string) => mix(a, b, dim * 0.8);
  const DOOR = V.door;
  return (
    <g>
      <Layer cam={cam} d={0.0} rest={R}><rect x={V.skyRect[0]} y={V.skyRect[1]} width={V.skyRect[2]} height={V.skyRect[3]} fill={NIGHT.sky} /></Layer>
      <Layer cam={cam} d={0.05} rest={R}>
        <path d={V.stars} fill={SEM.starDim} />
        <path d={V.spark} fill={SEM.star} />
        {extraStars === 'reveal' && V.extra.map((s, i) => {
          const q = p(t, s.at, s.at + 0.5);
          return q > 0.01 && <circle key={i} cx={s.x} cy={s.y} r={s.r * q} fill={SEM.star} />;
        })}
        {extraStars === 'static' && V.extra.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={SEM.starDim} />)}
      </Layer>
      <Layer cam={cam} d={0.1} rest={R}>
        {moon}
        {V.cloudsFar.map(([x, y, rx, ry], i) => {
          const dx = (x < V.midX ? -1 : 1) * part * 140 + Math.sin(t * 0.12 + i) * 18;
          return (
            <g key={i} transform={`translate(${dx.toFixed(1)} 0)`}>
              <path d={puffD(x, y + 6, rx, ry, i * 5 + 3, 9)} fill={NIGHT.cloudRim} />
              <path d={puffD(x, y + 12, rx, ry, i * 5 + 3, 9)} fill={NIGHT.cloudFar} />
            </g>
          );
        })}
        {sky}
      </Layer>
      <Layer cam={cam} d={0.14} rest={R}>
        {V.cloudsNear.map(([x, y, rx, ry], i) => {
          const dx = (x < V.midX ? -1 : 1) * part * 60 + Math.sin(t * 0.15 + i * 2) * 14;
          return (
            <g key={i} transform={`translate(${dx.toFixed(1)} 0)`}>
              <path d={puffD(x, y - 6, rx, ry, i * 7 + 11, 10)} fill={NIGHT.cloudRim} />
              <path d={puffD(x, y, rx, ry, i * 7 + 11, 10)} fill={NIGHT.cloudNear} />
            </g>
          );
        })}
      </Layer>
      <Layer cam={cam} d={0.2} rest={R}>
        <Shade2 id={`${id}hf`} d={V.hillFar} lit={NIGHT.hillFar} dark={lit(NIGHT.hillFarRim, NIGHT.hillFar)} dx={-6} dy={9} />
        {V.meru.map(([x, y, sc, tiers], i) => <Meru key={i} x={x} y={y} s={sc} tiers={tiers} c={['#122A4E', lit('#1E3B66', '#122A4E')]} />)}
        {V.palmsFar.map(([x, y, h], i) => <Palm key={i} x={x} y={y} h={h} lean={i % 2 ? -22 : 26} s={0.7} t={t} seed={i + 20} c={['#14305A', '#112848', '#14305A']} />)}
      </Layer>
      <Layer cam={cam} d={0.35} rest={R}>
        <Shade2 id={`${id}hm`} d={V.hillMid} lit={NIGHT.hillMid} dark={lit(NIGHT.hillMidRim, NIGHT.hillMid)} dx={-6} dy={8} />
        {V.terraces.map(([x, y, w, n, step, dt], i) => <Terraces key={i} x={x} y={y} w={w} n={n} step={step} t={t + dt} c={{water: lit('#1E3E68', '#16304F'), dike: '#10233F', glint: glint ?? lit(NIGHT.glint, '#3A5578')}} />)}
      </Layer>
      <Layer cam={cam} d={0.55} rest={R}>
        <Shade2 id={`${id}hn`} d={V.hillNear} lit={NIGHT.hillNear} dark={lit(NIGHT.hillNearRim, NIGHT.hillNear)} dx={-4} dy={7} />
        {V.houses.map((h, i) => <SmallHouse key={i} x={h.x} y={h.y} s={h.s} kind={h.kind} lamp={h.lamp} c={['#26406A', '#1C3156', '#1A2C4C']} />)}
        <CandiBentar x={V.candi[0]} y={V.candi[1]} s={V.candi[2]} c={['#4B3F5E', '#3A3150', lit('#5E6890', '#454E72')]} />
        {V.palmsRow.map(([x, y, h, l], i) => <Palm key={i} x={x} y={y} h={h} lean={l} s={0.9} t={t} seed={i + 7} c={['#1E3B5E', '#172E4C', '#1A3556']} />)}
      </Layer>
      <Layer cam={cam} d={1} rest={R}>
        <path d={V.yard} fill={NIGHT.ground} />
        {V.stones.map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.32} fill={NIGHT.path} />)}
        <path d={V.tufts} fill="#1C3152" />
        <Lumbung x={V.lumbung[0]} y={V.lumbung[1]} s={V.lumbung[2]} c={{roof: [lit('#56556F', '#3E3D55'), '#3B3A51'], post: '#272235', disc: '#4E587C', floor: '#363048', line: '#2A293C'}} />
        {doors > 0.01 && <path d={`M${DOOR[0] - 52} ${DOOR[1]} L${DOOR[0] + 52} ${DOOR[1]} L${DOOR[0] + 130 * doors} ${DOOR[1] + 220 * doors} L${DOOR[0] - 120 * doors} ${DOOR[1] + 220 * doors} Z`} fill="#2A3A5C" />}
        <Joglo id={`${id}jg`} x={DOOR[0]} y={DOOR[1]} w={500} open={doors} tone={{wall: [lit('#554B62', '#3E3650'), '#3B3448'], roof: [lit('#454B6E', '#2E3250'), '#2B2F49'], trim: '#262134', base: '#38425F', win: NIGHT.lamp}} />
        <BambooFence x={V.fence[0]} y={V.fence[1]} w={V.fence[2]} s={0.8} c="#1A2A46" rim="#22355A" />
        {yard}
      </Layer>
      <Layer cam={cam} d={1.35} rest={R}>
        {V.bananas.map(([x, y, sc, flip], i) => <Banana key={i} x={x} y={y} s={sc} t={t + i * 2} flip={flip} />)}
      </Layer>
    </g>
  );
};
