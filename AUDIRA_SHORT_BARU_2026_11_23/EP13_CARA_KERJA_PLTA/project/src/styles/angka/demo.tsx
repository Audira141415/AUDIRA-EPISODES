import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {lerp, useFrame} from '../shared';
import {HScene} from '../../lib/halus';
import {
  ARMS, bump, Caption, clamp01, crouch, dentAt, eio, ein, eout, fall, Figure, gcam, gcamTransform, groundPath, headOf, Impact, kf, land, lerpP, lidAt, lin,
  NGK, Num, P, Pose, pop, Puff, RIG, Seg, seq, Shadow, sit, useNgkFonts, viewX,
} from './kit';
import {Critter, EqLane, FloorRuler, LaneState, Lock, Machine, MACH, Pedestal, Sweat, TitleWords} from './props';

// ANGKA StyleGallery demo (6 s QA sheet, never a delivery) — the look's signature moves on one off-white number-line
// floor: Garis (teal stick figure, IK limbs, blinking dot eyes) catches numbers that fall with weight and squash and
// throws them into the "× 0" press; the ram flattens each one and a tiny coral 0 hops onto the pile; a giant 1.000.000
// lands on the funnel (the floor dents, the press squashes) and is sucked in — still 0. The equation lane writes itself
// token by token with a mustard bar, captions slide a mustard underline word to word; Garis ends up sitting, sweating.
// Landscape (Look-ANGKA-Wide) re-composes: the floor runs the full width with numbers queueing on the left and the
// locked "= 6" target on the right, the equation lane sits above the world, the caption under the floor line.
// Flat colours only: no gradients, glows, blur or filters.

const K = NGK;
const G = 1180; // ground line (world y); the press stands at x 0
const FEED = -420; // Garis
const FUN: P = [MACH.funnel.cx, G + MACH.funnel.top - 22];
const EQX = 640, PED_X = 830, PED_TOP = G - 46;

const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.32, end: start + i * 0.32 + 0.28}));
  return [{start, end, words: ws}];
};
const PAGES = [...fakePage('Satu kali nol, nol.', 0.35, 2.3), ...fakePage('Seratus? Tetap nol.', 2.4, 3.65), ...fakePage('Sejuta... masih nol!', 3.75, 5.35),
  ...fakePage('Semua hilang.', 5.45, 6.0)];

type Feed = {n: string; size: number; color: string; cs: number; catchT?: number; throwT?: number; funnel: number; land: number; slam: number; out: number; pile: number; giant?: boolean};
const FEEDS: Feed[] = [
  {n: '1', size: 170, color: K.ink, cs: 110, catchT: 0.55, throwT: 1.05, funnel: 1.35, land: 1.45, slam: 1.75, out: 2.15, pile: 3},
  {n: '100', size: 140, color: K.blue, cs: 92, catchT: 2.0, throwT: 2.45, funnel: 2.75, land: 2.85, slam: 3.1, out: 3.5, pile: 4},
  {n: '1.000.000', size: 170, color: K.ink, cs: 56, funnel: 4.45, land: 4.5, slam: 4.75, out: 5.15, pile: 5, giant: true},
];
const GIANT_LAND = 3.75, SUCK = 4.05;
const PILE: P[] = [[262, 0], [310, 0], [358, 0], [214, 0], [238, -56], [286, -56]];
/** portrait: same six zeros stacked 3-2-1 so the heap stays clear of the right frame edge */
const PILE_TALL: P[] = [[262, 0], [310, 0], [286, -56], [214, 0], [238, -56], [262, -112]];
const IMPACTS: Impact[] = [
  {t: GIANT_LAND, x: 0, amp: 22, w: 300}, ...FEEDS.map((f) => ({t: f.slam, x: 0, amp: f.giant ? 12 : 7, w: 240})),
  {t: 5.25, x: PED_X, amp: 6, w: 140},
];
const gy = (x: number, t: number) => G + dentAt(x, t, [], IMPACTS);

// ---------- Garis ----------
type P2 = [P, P];
const lp2 = (a: P2, b: P2, q: number): P2 => [lerpP(a[0], b[0], q), lerpP(a[1], b[1], q)];
const HOLD: P2 = [[-4, -94], [16, -96]];
const THROW: P2 = [[56, -84], [72, -64]];
const work = (t: number): Pose => {
  const r1 = eio(t, 0.2, 0.42) * (1 - eio(t, 1.05, 1.15));
  const th1 = bump(t, 1.05, 1.35);
  const r2 = eio(t, 1.62, 1.84) * (1 - eio(t, 2.45, 2.55));
  const th2 = bump(t, 2.45, 2.75);
  const duck = eio(t, 3.38, 3.58) * (1 - eio(t, 4.0, 4.25));
  let hands: P2 = ARMS.down;
  hands = lp2(hands, HOLD, Math.max(r1, r2));
  hands = lp2(hands, THROW, Math.max(th1, th2));
  hands = lp2(hands, [[10, -60], [30, -64]], duck);
  const look = kf(t, [[0, [1, -0.3]], [0.2, [0.2, -1]], [0.62, [0.6, -0.6]], [1.05, [1, -0.6]], [1.5, [1, 0]], [1.62, [0.2, -1]], [2.45, [1, -0.6]], [2.9, [1, 0]],
    [3.3, [0.3, -1]], [4.1, [1, -0.5]], [4.75, [1, 0]]], 0.14);
  const dip = 12 * bump(t, 0.55, 0.75) + 24 * bump(t, 2.0, 2.3);
  return crouch(FEED, gy(FEED, t), 1, t, duck, hands, {look, dy: dip, lean: 10 * Math.max(th1, th2)});
};
const rest = (t: number) => sit(FEED, gy(FEED, t), 1, t, {tired: 1, look: kf(t, [[5.3, [0.4, 0.7]], [5.75, [1, 0]]], 0.2)});
const SEGS: Seg[] = [[0, work], [5.3, rest, 0.35]];
const held = (g: Pose): P => [(g.hands[0][0] + g.hands[1][0]) / 2, (g.hands[0][1] + g.hands[1][1]) / 2 - 8];

/** a number outside the press: falling into Garis's hands, held, thrown into the funnel */
const outside = (f: Feed, t: number, g: Pose): {x: number; y: number; s: number; sx: number; sy: number} | null => {
  if (f.giant || t > f.funnel + 0.12) return null;
  const c = f.catchT!, th = f.throwT!;
  if (t < c - 0.42) return null;
  const h = held(g);
  if (t < c) return {x: h[0], y: fall(t, c - 0.42, c, h[1] - 900, h[1]), s: 1, sx: 0.95, sy: 1.06};
  if (t < th) {
    const [sx, sy] = land(t, c, 0.12, 0.3);
    return {x: h[0], y: h[1], s: 1, sx, sy};
  }
  if (t < f.funnel) {
    const a = held(seq(th, SEGS));
    const q = lin(t, th, f.funnel);
    const ctrl: P = [(a[0] + FUN[0]) / 2, 2 * (FUN[1] - 150) - (a[1] + FUN[1]) / 2];
    const u = 1 - q;
    return {x: u * u * a[0] + 2 * u * q * ctrl[0] + q * q * FUN[0], y: u * u * a[1] + 2 * u * q * ctrl[1] + q * q * FUN[1], s: lerp(1, 0.55, q), sx: 1, sy: 1};
  }
  return {x: FUN[0], y: lerp(FUN[1], FUN[1] + 170, lin(t, f.funnel, f.funnel + 0.1)), s: 0.55, sx: 1, sy: 1};
};
const ramAt = (t: number) => {
  let r = 0;
  for (const f of FEEDS) {
    const d = Math.min(0.2, f.slam - f.land);
    r = Math.max(r, ein(t, f.slam - d, f.slam) * (1 - eio(t, f.slam + 0.08, f.slam + 0.36)));
  }
  return r;
};
/** a finished 0 hopping from the slot onto the pile (pre-existing pile zeros sit there from frame 0) */
const zeroAt = (i: number, t: number, pile: P[] = PILE): {p: P; sx: number; sy: number} | null => {
  const to: P = [pile[i][0], G + pile[i][1]];
  const f = FEEDS.find((x) => x.pile === i);
  if (!f) return {p: to, sx: 1, sy: 1};
  if (t < f.out) return null;
  const from: P = [175, G - 46];
  const ta = f.out + 0.34;
  if (t < ta) {
    const q = lin(t, f.out, ta);
    const apex = Math.min(from[1], to[1]) - 150;
    const ctrl: P = [(from[0] + to[0]) / 2, 2 * apex - (from[1] + to[1]) / 2];
    const u = 1 - q;
    const s = lerp(0.6, 1, Math.min(1, q * 3));
    return {p: [u * u * from[0] + 2 * u * q * ctrl[0] + q * q * to[0], u * u * from[1] + 2 * u * q * ctrl[1] + q * q * to[1]], sx: s, sy: s};
  }
  const [sx, sy] = land(t, ta, 0.18, 0.4);
  return {p: to, sx, sy};
};

const LANE: LaneState[] = [
  {from: 0.5, to: 2.32, toks: [{s: '1', at: 0.55}, {s: '×', at: 1.2}, {s: '0', at: 1.75, c: K.coral}, {s: '=', at: 1.95}, {s: '0', at: 2.15, c: K.coral}]},
  {from: 2.4, to: 3.55, toks: [{s: '100', at: 2.4, c: K.blue}, {s: '×', at: 2.75}, {s: '0', at: 3.1, c: K.coral}, {s: '=', at: 3.3}, {s: '0', at: 3.5, c: K.coral}]},
  {from: 3.86, to: 9, toks: [{s: '1.000.000', at: 3.86}, {s: '×', at: 4.1}, {s: '0', at: 4.75, c: K.coral}, {s: '=', at: 4.95}, {s: '0', at: 5.15, c: K.coral}]},
];
const QUEUE = [{n: '7', x: -640, c: K.coral, size: 120}, {n: '42', x: -800, c: K.teal, size: 110}];

export const AngkaDemo: React.FC = () => {
  const fr = useFrame();
  const {W, H, wide} = fr;
  const {fps, durationInFrames} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const ready = useNgkFonts();
  if (!ready) return <AbsoluteFill style={{background: K.bg}} />;

  const cam = wide
    ? gcam(t, {x: 100, s: 0.92, gs: 790}, [{from: 3.15, to: 3.7, s: 0.86}, {from: 5.25, to: 5.95, x: 40, s: 0.98}])
    : gcam(t, {x: -60, s: 1.12, gs: 1200}, [{from: 3.15, to: 3.7, x: -10, s: 1.0}, {from: 5.25, to: 5.95, x: -80, s: 1.08}]);
  const [vx0, vx1] = viewX(cam, 120, W);
  const ground = groundPath(Math.floor(vx0 / 16) * 16, vx1, G, (x) => gy(x, t) - G);
  const g = seq(t, SEGS);
  const hc = headOf(g);
  const ram = ramAt(t);
  const mSq = (() => {
    let sx = 1, sy = 1;
    for (const [at, amt] of [[GIANT_LAND, 0.12], ...FEEDS.map((f) => [f.slam, f.giant ? 0.09 : 0.04])] as Array<[number, number]>) {
      const [a, b] = land(t, at, amt, 0.4);
      sx *= a; sy *= b;
    }
    return [sx, sy];
  })();
  const giant = (() => {
    if (t < GIANT_LAND - 0.46 || t > FEEDS[2].funnel - 0.02) return null;
    const restY = G + MACH.funnel.top - 18;
    if (t < SUCK) {
      const [sx, sy] = t < GIANT_LAND ? [0.95, 1.08] : land(t, GIANT_LAND, 0.12, 0.45);
      return {x: -30, y: t < GIANT_LAND ? fall(t, GIANT_LAND - 0.46, GIANT_LAND, restY - 1250, restY) : restY, sx, sy};
    }
    const q = eio(t, SUCK, FEEDS[2].funnel);
    return {x: lerp(-30, FUN[0], q), y: lerp(restY, G - 440, q), sx: lerp(1, 0.06, q), sy: lerp(1, 0.6, q)};
  })();
  const chamber = (() => {
    const out: React.ReactNode[] = [];
    const ramTop = lerp(MACH.ramUp, MACH.ramDown, ram);
    FEEDS.forEach((f, i) => {
      if (t < f.land - 0.1 || t > f.out) return;
      const h = f.cs * 0.73;
      if (t < f.slam + 0.16) {
        const dropQ = lin(t, f.land - 0.1, f.land + 0.04);
        const x = lerp(MACH.funnel.cx, 0, eout(dropQ, 0, 1));
        const y = lerp(MACH.win.y + 10, MACH.bed, dropQ * dropQ);
        const syc = Math.max(0.12, t < f.slam ? clamp01((MACH.bed - (ramTop + MACH.ramH)) / h) : 0.12);
        const flat = t < f.slam ? 1 : 1 - ein(t, f.slam + 0.06, f.slam + 0.16);
        out.push(<Num key={`c${i}`} x={x} y={y} text={f.n} size={f.cs} weight={800} color={f.color} sx={(1 + 0.5 * (1 - syc)) * flat} sy={syc} />);
      }
      if (t >= f.slam + 0.08) {
        const q = pop(t, f.slam + 0.08, 0.26);
        const slide = eio(t, f.out - 0.32, f.out - 0.04);
        out.push(<Num key={`z${i}`} x={lerp(0, 270, slide)} y={MACH.bed} text="0" size={70} weight={800} color={K.coral} sx={q} sy={q} />);
      }
    });
    return (
      <g>
        <defs><clipPath id="angkaDemoWin"><rect x={MACH.win.x} y={MACH.win.y} width={MACH.win.w} height={MACH.win.h} rx={14} /></clipPath></defs>
        <g clipPath="url(#angkaDemoWin)">{out}</g>
      </g>
    );
  })();
  const above = g.floor === null ? 0 : Math.max(0, g.floor - RIG.hipH - g.hip[1]);
  const shX = (g.hip[0] + (g.feet[0][0] + g.feet[1][0]) / 2) / 2; // under the body, also when sitting
  const lockY = t < 5.25 ? fall(t, 4.85, 5.25, PED_TOP - 46 - 900, PED_TOP - 46) : PED_TOP - 46;

  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        {/* HALUS: the world is one scene (i 0) drifting on top of gcam; EqLane / TitleWords / Caption stay locked */}
        <HScene look="ANGKA" t={t} from={0} to={durationInFrames / fps} i={0} fx={W / 2} fy={H * 0.47}>
        <g transform={gcamTransform(cam, G, W)}>
          <path d={`${ground} L ${vx1 + 20} ${G + 1600} L ${vx0 - 20} ${G + 1600} Z`} fill={K.band} />
          <FloorRuler x0={vx0} x1={vx1} ground={G} origin={0} />

          {/* the queue (left) and the locked target "= 6" (right): in view on the wide frame */}
          {QUEUE.map((c, k) => {
            const hop = Math.max(0, Math.sin(Math.PI * 2 * (t * 1.1 + k * 0.45)));
            return <Critter key={k} x={c.x} y={gy(c.x, t) - 18 * hop * hop} text={c.n} size={c.size} color={c.c} phase={0} legs face={1} />;
          })}
          <Num x={EQX} y={G - 40} text="=" size={150} weight={700} color={K.ink} />
          {t >= 2.2 && <path d={`M ${EQX + 30} ${G - 128} L ${EQX + 30 - 60 * eout(t, 2.2, 2.4)} ${G - 128 + 110 * eout(t, 2.2, 2.4)}`} stroke={K.coral} strokeWidth={14} strokeLinecap="round" />}
          <Pedestal x={PED_X} y={gy(PED_X, t)} w={200} h={46} />
          <Num x={PED_X} y={PED_TOP} text="6" size={220} weight={800} color={K.ink} sx={land(t, 5.25, 0.1, 0.4)[0]} sy={land(t, 5.25, 0.1, 0.4)[1]} />
          {t >= 4.85 && <Lock x={PED_X + 40} y={lockY} q={0.72} straps={eout(t, 5.25, 5.37)} strapW={170} strapH={150} />}

          {/* numbers outside the press (behind it: they vanish into the funnel) */}
          {FEEDS.map((f, i) => {
            const o = outside(f, t, g);
            return o ? <Num key={i} x={o.x} y={o.y} text={f.n} size={f.size * o.s} weight={800} color={f.color} sx={o.sx} sy={o.sy} /> : null;
          })}
          {t > GIANT_LAND - 0.42 && t < GIANT_LAND && <Shadow x={-30} y={G} w={700 * lin(t, GIANT_LAND - 0.42, GIANT_LAND)} h={12} />}
          {giant && <Num x={giant.x} y={giant.y} text="1.000.000" size={170} weight={800} color={K.ink} sx={giant.sx} sy={giant.sy} />}

          <Puff x={0} y={G} t={t} at={GIANT_LAND} s={2.2} />
          <Machine x={0} y={gy(0, t)} ram={ram} sx={mSq[0]} sy={mSq[1]} lamp={t < FEEDS[2].slam ? K.mustard : K.coral} chamber={chamber} />
          {PILE.map((_, i) => {
            const z = zeroAt(i, t, wide ? PILE : PILE_TALL);
            return z ? <Num key={i} x={z.p[0]} y={z.p[1]} text="0" size={76} weight={800} color={K.coral} sx={z.sx} sy={z.sy} /> : null;
          })}

          {/* Garis */}
          {g.floor !== null && <Shadow x={shX} y={gy(shX, t)} w={Math.max(0, 96 - above * 0.18)} />}
          <Figure pose={g} color={K.teal} lid={lidAt(t, [1.5, 3.0, 4.45, 5.9])} kind="garis" />
          {[5.4, 5.72].map((at, i) => {
            const k = lin(t, at, at + 0.9);
            if (k <= 0 || k >= 1) return null;
            const sc = Math.min(1, k * 5) * (1 - eio(k, 0.75, 1));
            return <Sweat key={i} x={hc[0] - 34 + i * 64} y={hc[1] - 30 + 46 * eio(k, 0.1, 1)} s={0.9 * sc} />;
          })}

          <path d={ground} stroke={K.ink} strokeWidth={6} fill="none" strokeLinejoin="round" />
        </g>
        </HScene>
        <EqLane t={t} states={LANE} />
      </svg>
      {!wide && (
        <TitleWords t={t} out={99} lines={[
          {y: 290, size: 120, words: [{s: 'APA', at: -1}, {s: 'PUN', at: -1}]},
          {y: 450, size: 170, words: [{s: '×', at: -1}, {s: '0', at: -1, c: K.coral}, {s: '=', at: 5.15, c: K.mustard}, {s: '0', at: 5.25, c: K.coral}]},
        ]} />
      )}
      <Caption t={t} pages={PAGES} />
    </AbsoluteFill>
  );
};
