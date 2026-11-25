import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {drawOn, lerp, p, pb, pio, rnd} from '../../styles/shared';
import {B, HEAD, MONO, Pt} from '../../styles/blueprint/kit';

// EP13 PLTA — drawing parts for the BLUEPRINT sheets. All sizes in the 1080×1920 portrait frame.

export const COPPER = '#FF9A55';
export const pop = (t: number, a: number, d = 0.35) => pb(t, a, a + d);
/** pop in at a, fade out ending at b */
export const popIO = (t: number, a: number, b: number, d = 0.3) => Math.max(0, Math.min(pb(t, a, a + d), 1 - pio(t, b - d, b)));
export const fmt = (n: number, dec = 0) => n.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Wait for the BLUEPRINT fonts before the first frame is captured. */
export const useBpFonts = () => {
  const [h] = useState(() => delayRender('bp-fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const f = (document as unknown as {fonts: {load: (s: string) => Promise<unknown>}}).fonts;
    Promise.all([f.load("700 80px 'BP Head'"), f.load("600 30px 'BP Mono'"), f.load("500 30px 'BP Mono'")])
      .catch(() => null)
      .then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return ok;
};

/** rotation angle (deg) for a wheel that spins up from t0 to t1 and then holds wMax deg/s */
export const spin = (t: number, t0: number, t1: number, wMax: number, w0 = 0) => {
  if (t <= t0) return w0 * t;
  const d = t1 - t0;
  if (t < t1) return w0 * t + 0.5 * (wMax - w0) * ((t - t0) ** 2) / d + 0;
  return w0 * t + 0.5 * (wMax - w0) * d + (wMax - w0) * (t - t1);
};

/** point at fraction u (0..1) along a polyline */
export const along = (pts: Pt[], u: number): Pt => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? d / segs[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};
export const pathOf = (pts: Pt[]) => `M ${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ')}`;

/** Water (cyan) or electron (yellow) particles streaming along a polyline. */
export const Flow: React.FC<{pts: Pt[]; t: number; start: number; n?: number; speed?: number; r?: number; color?: string; end?: number}> = ({
  pts, t, start, n = 16, speed = 0.35, r = 9, color = B.cyan, end = 1e9,
}) => {
  const q = Math.min(p(t, start, start + 0.5), 1 - p(t, end - 0.4, end));
  if (q <= 0) return null;
  return (
    <g opacity={q}>
      {Array.from({length: n}).map((_, i) => {
        const u = (((t - start) * speed + i / n) % 1 + 1) % 1;
        const [x, y] = along(pts, u);
        return <circle key={i} cx={x} cy={y} r={r * (0.7 + 0.3 * rnd(i * 3.3))} fill={color} />;
      })}
    </g>
  );
};

/** Sheet title block — the AUDIRA brand inside every drawing. */
export const TitleBlock: React.FC<{n: string; title: string; q: number}> = ({n, title, q}) => (
  <g opacity={q}>
    <rect x={80} y={176} width={920} height={58} fill={B.deep} fillOpacity={0.85} stroke={B.line2} strokeWidth={2} />
    <line x1={470} y1={176} x2={470} y2={234} stroke={B.line2} strokeWidth={2} />
    <line x1={700} y1={176} x2={700} y2={234} stroke={B.line2} strokeWidth={2} />
    <text x={100} y={215} fill={B.yellow} style={{fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 1}}>AUDIRA ENGINEERING</text>
    <text x={488} y={215} fill={B.line} style={{fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 1}}>DWG EP13-{n}</text>
    <text x={718} y={215} fill={B.cyan} style={{fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 1}}>{title}</text>
  </g>
);

/** Big sheet heading (BP Head) with an optional typed subline. */
export const Heading: React.FC<{text: string; sub?: string; t: number; at: number; y?: number; color?: string; size?: number; out?: number}> = ({
  text, sub, t, at, y = 330, color = B.line, size = 96, out = 1e9,
}) => {
  const q = Math.min(p(t, at, at + 0.45), 1 - p(t, out - 0.3, out));
  if (q <= 0) return null;
  const n = sub ? Math.max(0, Math.min(sub.length, Math.floor((t - at - 0.3) * 32))) : 0;
  return (
    <g opacity={q} transform={`translate(0 ${(1 - q) * 30})`}>
      <text x={540} y={y} textAnchor="middle" fill={color} style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, letterSpacing: 1}}>{text}</text>
      {sub && n > 0 && <text x={540} y={y + 62} textAnchor="middle" fill={B.cyan} style={{fontFamily: MONO, fontWeight: 600, fontSize: 36, letterSpacing: 3}}>{sub.slice(0, n)}</text>}
    </g>
  );
};

/** HUD data card: crop marks, mono kicker, children drawn in local coords (0,0 = card top-left). */
export const Card: React.FC<{x: number; y: number; w: number; h: number; q: number; kicker?: string; accent?: string; children?: React.ReactNode}> = ({
  x, y, w, h, q, kicker, accent = B.cyan, children,
}) => {
  if (q <= 0.001) return null;
  const s = lerp(0.82, 1, Math.min(1.2, q));
  const m = (px: number, py: number, dx: number, dy: number) => <path d={`M ${px + dx * 26} ${py} L ${px} ${py} L ${px} ${py + dy * 26}`} fill="none" stroke={accent} strokeWidth={4} />;
  return (
    <g opacity={Math.min(1, q)} transform={`translate(${x} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect x={0} y={0} width={w} height={h} fill={B.deep} fillOpacity={0.92} stroke={B.line2} strokeWidth={2} />
      {m(-10, -10, 1, 1)}{m(w + 10, -10, -1, 1)}{m(-10, h + 10, 1, -1)}{m(w + 10, h + 10, -1, -1)}
      {kicker && <text x={30} y={52} fill={accent} style={{fontFamily: MONO, fontWeight: 600, fontSize: 32, letterSpacing: 3}}>{kicker}</text>}
      {children}
    </g>
  );
};

/** Tag: boxed mono label with a leader to point a. */
export const Tag: React.FC<{a?: Pt; x: number; y: number; text: string; q: number; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'}> = ({
  a, x, y, text, q, color = B.line, size = 36, anchor = 'middle',
}) => {
  if (q <= 0.001) return null;
  const w = text.length * size * 0.62 + 36;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const h = size + 26;
  return (
    <g opacity={Math.min(1, q)}>
      {a && <path d={`M ${a[0]} ${a[1]} L ${x} ${y}`} stroke={color} strokeWidth={3} fill="none" {...drawOn(Math.min(1, q))} />}
      {a && <circle cx={a[0]} cy={a[1]} r={8} fill={color} />}
      <g transform={`translate(${x} ${y}) scale(${lerp(0.7, 1, Math.min(1.15, q))}) translate(${-x} ${-y})`}>
        <rect x={x0} y={y - h / 2} width={w} height={h} fill={B.deep} stroke={color} strokeWidth={3} />
        <text x={x0 + w / 2} y={y + size * 0.36} textAnchor="middle" fill={color} style={{fontFamily: MONO, fontWeight: 600, fontSize: size, letterSpacing: 1}}>{text}</text>
      </g>
    </g>
  );
};

/** Rubber stamp (rotated, red). */
export const Stamp: React.FC<{x: number; y: number; text: string; q: number; size?: number; rot?: number; color?: string}> = ({x, y, text, q, size = 64, rot = -8, color = B.red}) => {
  if (q <= 0.001) return null;
  const w = text.length * size * 0.6 + 60;
  const s = lerp(1.8, 1, Math.min(1, q));
  return (
    <g opacity={Math.min(1, q * 1.5)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.6} fill={B.deep} fillOpacity={0.6} stroke={color} strokeWidth={7} />
      <rect x={-w / 2 + 10} y={-size * 0.85 + 10} width={w - 20} height={size * 1.6 - 20} fill="none" stroke={color} strokeWidth={2.5} />
      <text x={0} y={size * 0.34} textAnchor="middle" fill={color} style={{fontFamily: HEAD, fontWeight: 700, fontSize: size, letterSpacing: 2}}>{text}</text>
    </g>
  );
};

/** Light bulb (glass, neck, screw base, filament). `on` 0..1 lights it. */
export const Bulb: React.FC<{cx: number; cy: number; r: number; q: number; on: number; t: number}> = ({cx, cy, r, q, on, t}) => {
  const L: Pt = [cx - 0.574 * r, cy + 0.819 * r];
  const R: Pt = [cx + 0.574 * r, cy + 0.819 * r];
  const glass = `M ${L[0]} ${L[1]} A ${r} ${r} 0 1 1 ${R[0]} ${R[1]} L ${cx + 0.42 * r} ${cy + 1.25 * r} L ${cx - 0.42 * r} ${cy + 1.25 * r} Z`;
  const fil = `M ${cx - 0.22 * r} ${cy + 1.0 * r} L ${cx - 0.2 * r} ${cy + 0.15 * r} L ${cx - 0.1 * r} ${cy + 0.02 * r} L ${cx} ${cy + 0.15 * r} L ${cx + 0.1 * r} ${cy + 0.02 * r} L ${cx + 0.2 * r} ${cy + 0.15 * r} L ${cx + 0.22 * r} ${cy + 1.0 * r}`;
  const flick = on * (0.92 + 0.08 * Math.sin(t * 23));
  return (
    <g>
      {on > 0 && (
        <g opacity={flick}>
          <circle cx={cx} cy={cy} r={r * 2.3} fill="url(#bulbGlow)" />
          {Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            if (Math.sin(a) > 0.55) return null;
            const r0 = r * 1.3, r1 = r * (1.55 + 0.12 * Math.sin(t * 6 + i));
            return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke={B.yellow} strokeWidth={7} strokeLinecap="round" />;
          })}
        </g>
      )}
      <path d={glass} fill={on > 0 ? `rgba(255,212,71,${0.28 * on})` : B.face1} fillOpacity={on > 0 ? 1 : 0.5 * q} stroke={B.line} strokeWidth={5} strokeLinejoin="round" {...drawOn(q)} />
      <path d={fil} fill="none" stroke={on > 0.05 ? B.yellow : B.line2} strokeWidth={on > 0.05 ? 7 : 4} strokeLinejoin="round" {...drawOn(p(q, 0.4, 1))} />
      <g opacity={p(q, 0.5, 1)}>
        {[0, 1, 2].map((i) => <rect key={i} x={cx - 0.42 * r} y={cy + (1.25 + i * 0.14) * r} width={0.84 * r} height={0.12 * r} fill={B.face2} stroke={B.line} strokeWidth={3} />)}
        <path d={`M ${cx - 0.2 * r} ${cy + 1.67 * r} L ${cx + 0.2 * r} ${cy + 1.67 * r} L ${cx} ${cy + 1.82 * r} Z`} fill={B.line} />
      </g>
    </g>
  );
};

/** Water drop (teardrop) centred at x,y. */
export const Drop: React.FC<{x: number; y: number; s: number; color?: string}> = ({x, y, s, color = B.cyan}) => (
  <path d={`M ${x} ${y - 34 * s} C ${x + 6 * s} ${y - 20 * s} ${x + 22 * s} ${y - 2 * s} ${x + 22 * s} ${y + 12 * s} A ${22 * s} ${22 * s} 0 0 1 ${x - 22 * s} ${y + 12 * s} C ${x - 22 * s} ${y - 2 * s} ${x - 6 * s} ${y - 20 * s} ${x} ${y - 34 * s} Z`}
    fill={color} stroke={B.line} strokeWidth={3} />
);

/** Monas silhouette, base centre at (x, base), height h. */
export const Monas: React.FC<{x: number; base: number; h: number; q: number; color?: string}> = ({x, base, h, q, color = B.line}) => {
  const u = (k: number) => base - k * h;
  const d = `M ${x - 0.32 * h} ${u(0)} L ${x + 0.32 * h} ${u(0)} L ${x + 0.32 * h} ${u(0.05)} L ${x + 0.2 * h} ${u(0.09)} L ${x + 0.2 * h} ${u(0.13)} L ${x + 0.05 * h} ${u(0.15)} L ${x + 0.03 * h} ${u(0.86)} L ${x + 0.06 * h} ${u(0.88)} L ${x - 0.06 * h} ${u(0.88)} L ${x - 0.03 * h} ${u(0.86)} L ${x - 0.05 * h} ${u(0.15)} L ${x - 0.2 * h} ${u(0.13)} L ${x - 0.2 * h} ${u(0.09)} L ${x - 0.32 * h} ${u(0.05)} Z`;
  return (
    <g>
      <path d={d} fill={B.face1} stroke={color} strokeWidth={3} strokeLinejoin="round" {...drawOn(q)} />
      <path d={`M ${x} ${u(1)} C ${x + 0.05 * h} ${u(0.95)} ${x + 0.05 * h} ${u(0.9)} ${x} ${u(0.885)} C ${x - 0.05 * h} ${u(0.9)} ${x - 0.05 * h} ${u(0.95)} ${x} ${u(1)} Z`} fill={B.yellow} opacity={p(q, 0.7, 1)} />
    </g>
  );
};

/** Lattice transmission tower, base centre (x, base), height h. */
export const Tower: React.FC<{x: number; base: number; h: number; q: number}> = ({x, base, h, q}) => {
  const lv = [0, 0.25, 0.5, 0.7];
  const legX = (k: number) => lerp(0.24, 0.06, Math.min(1, k / 0.8)) * h;
  const d: string[] = [];
  d.push(`M ${x - legX(0)} ${base} L ${x - legX(0.8)} ${base - 0.8 * h} L ${x} ${base - h} L ${x + legX(0.8)} ${base - 0.8 * h} L ${x + legX(0)} ${base}`);
  for (let i = 0; i < lv.length - 1; i++) {
    const a = lv[i], b = lv[i + 1];
    d.push(`M ${x - legX(a)} ${base - a * h} L ${x + legX(b)} ${base - b * h} M ${x + legX(a)} ${base - a * h} L ${x - legX(b)} ${base - b * h}`);
  }
  d.push(`M ${x - 0.3 * h} ${base - 0.72 * h} L ${x + 0.3 * h} ${base - 0.72 * h} M ${x - 0.22 * h} ${base - 0.86 * h} L ${x + 0.22 * h} ${base - 0.86 * h}`);
  return <path d={d.join(' ')} fill="none" stroke={B.line} strokeWidth={3} strokeLinejoin="round" {...drawOn(q)} />;
};

/** Francis runner (top view): hub + curved blades, rotation in degrees. */
export const Runner: React.FC<{cx: number; cy: number; R: number; rot: number; q: number; glow?: number; blades?: number}> = ({cx, cy, R, rot, q, glow = 0, blades = 13}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    {glow > 0 && <circle r={R * 1.25} fill="url(#bulbGlow)" opacity={glow} />}
    <circle r={R} fill={B.face2} stroke={B.line} strokeWidth={4} {...drawOn(q)} />
    {Array.from({length: blades}).map((_, i) => {
      const a = (i / blades) * Math.PI * 2;
      const a2 = a + 0.75;
      const r0 = R * 0.3;
      const p0: Pt = [Math.cos(a) * r0, Math.sin(a) * r0];
      const p1: Pt = [Math.cos(a2) * R * 0.95, Math.sin(a2) * R * 0.95];
      const c: Pt = [Math.cos(a + 0.15) * R * 0.75, Math.sin(a + 0.15) * R * 0.75];
      return <path key={i} d={`M ${p0[0]} ${p0[1]} Q ${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`} fill="none" stroke={glow > 0.3 ? B.yellow : B.line} strokeWidth={4} strokeLinecap="round" {...drawOn(p(q, 0.3, 1))} />;
    })}
    <circle r={R * 0.28} fill={B.deep} stroke={B.line} strokeWidth={4} opacity={p(q, 0.5, 1)} />
    <circle r={R * 0.1} fill={B.line2} opacity={p(q, 0.6, 1)} />
  </g>
);

/** Full-frame cut: the next sheet slides up over the previous one with a cyan cut line. */
export const SheetWipe: React.FC<{q: number; a: React.ReactNode; b: React.ReactNode}> = ({q, a, b}) => (
  <>
    <div style={{position: 'absolute', inset: 0}}>{a}</div>
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - q) * 1920}px)`, background: B.bg, boxShadow: `0 -6px 0 ${B.cyan}, 0 -30px 60px rgba(0,0,0,0.45)`}}>{b}</div>
  </>
);

export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="bulbGlow">
      <stop offset="0%" stopColor={B.yellow} stopOpacity={0.55} />
      <stop offset="60%" stopColor={B.yellow} stopOpacity={0.12} />
      <stop offset="100%" stopColor={B.yellow} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="key" cx="22%" cy="14%" r="80%">
      <stop offset="0%" stopColor="#CFEBFF" stopOpacity={0.2} />
      <stop offset="45%" stopColor="#CFEBFF" stopOpacity={0.06} />
      <stop offset="100%" stopColor="#CFEBFF" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vig" cx="42%" cy="40%" r="78%">
      <stop offset="50%" stopColor={B.deep} stopOpacity={0} />
      <stop offset="100%" stopColor={B.deep} stopOpacity={0.85} />
    </radialGradient>
    <filter id="lift" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#020a1c" floodOpacity="0.55" /></filter>
    <filter id="fgBlur" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
    <pattern id="hatchC" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="22" stroke={B.line2} strokeWidth="2" strokeOpacity=".5" /></pattern>
    <pattern id="earth" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1="0" y1="0" x2="0" y2="30" stroke={B.line2} strokeWidth="1.5" strokeOpacity=".35" /><circle cx="15" cy="15" r="2" fill={B.line2} fillOpacity=".35" /></pattern>
  </defs>
);
