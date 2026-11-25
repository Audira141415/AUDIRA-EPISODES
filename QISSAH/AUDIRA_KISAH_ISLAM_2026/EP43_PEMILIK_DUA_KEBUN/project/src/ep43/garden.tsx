// EP43 garden objects (PAPERWORLD 2D SVG). Built on P/Layered from pieces.tsx. Figures are faceless card silhouettes.
import React from "react";
import { C, P, Layered, mix, hash, clamp01, easeOut, lerp, circle, ellipse, rect, blob } from "./pieces";

/** 8-point star (Islamic geometric ornament) path, centred cx,cy. */
export const star8 = (cx: number, cy: number, r: number, inner = 0.72) => {
  let d = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? " L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + "Z";
};

/** Water drop path, belly centred at 0,0, radius r, tip up. */
export const dropPath = (r: number) =>
  `M0,${-r * 2.1} Q${r * 0.35},${-r * 1.1} ${r},${-r * 0.1} A${r},${r} 0 1,1 ${-r},${-r * 0.1} Q${-r * 0.35},${-r * 1.1} 0,${-r * 2.1}Z`;

/** Faceless robed figure (paper card silhouette with folds), feet at 0,0, ~210 tall. Never a face. */
export type RobePose = "stand" | "boast" | "point" | "walk" | "spread" | "kneel" | "staff" | "hands";
export const Robed: React.FC<{ pose?: RobePose; color?: string; trim?: string; turban?: string; step?: number; arm?: number; s?: number }> = ({
  pose = "stand", color = C.robe, trim = C.robeTrim, turban = "#F3E9D6", step = 0, arm = 0, s = 1,
}) => {
  const kneel = pose === "kneel";
  const draw = (o: string | null) => {
    const body = o ?? color;
    const dark = o ?? mix(color, "#120818", 0.3);
    const lite = o ?? mix(color, "#ffffff", 0.24);
    const tr = o ?? trim;
    const tb = o ?? turban;
    const skin = o ?? "#B98462";
    const hem = kneel ? -40 : 0;
    const top = kneel ? -110 : -150;
    const sw = 15;
    const hy = kneel ? 40 : 0;
    return (
      <g>
        <path d={`M-30,${top} L30,${top} L${48 + step * 4},${hem} L${-48 - step * 4},${hem}Z`} fill={dark} />
        <path d={`M-26,${top - 2} L24,${top - 2} L${38 + step * 3},${hem - 4} L${-42 - step * 3},${hem - 4}Z`} fill={body} />
        <path d={`M-26,${top - 2} L-8,${top - 2} L-14,${hem - 4} L${-42 - step * 3},${hem - 4}Z`} fill={lite} opacity={o ? 1 : 0.55} />
        {o ? null : (
          <path d={`M2,${top + 4} L6,${hem - 8} M-12,${top + 30} L-20,${hem - 10} M16,${top + 30} L22,${hem - 10}`} stroke={mix(color, "#120818", 0.45)} strokeWidth={2.2} opacity={0.6} fill="none" />
        )}
        <path d={`M-24,${top + 46} L22,${top + 46} L23,${top + 56} L-25,${top + 56}Z`} fill={tr} />
        {kneel ? <path d="M-50,-40 L54,-40 L62,0 L-60,0Z" fill={dark} /> : (
          <path d={`M${-14 - step * 6},-2 L${-2 - step * 6},-2 L${-2 - step * 6},5 L${-20 - step * 6},5Z M${6 + step * 6},-2 L${18 + step * 6},-2 L${24 + step * 6},5 L${6 + step * 6},5Z`} fill={o ?? "#4A3526"} />
        )}
        <g transform={`translate(0,${hy})`}>
          <path d={rect(-5, -166, 13, 12)} fill={skin} />
          <path d={circle(2, -180, 17)} fill={skin} />
          <path d="M-18,-181 Q2,-216 22,-181 Q2,-190 -18,-181Z" fill={tb} />
          <path d={`M-19,-187 Q2,-176 23,-187 L22,-179 Q2,-169 -18,-179Z`} fill={o ?? mix(turban, "#7A5A30", 0.3)} />
          <path d="M20,-184 Q34,-176 26,-160" stroke={tb} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        <g transform={`translate(0,${kneel ? 40 : 0})`}>
          {pose === "stand" || pose === "walk" ? (
            <path d={`M-22,-142 L${-34 - step * 8},-92 L${-30 - step * 8},-70 M22,-142 L${34 + step * 8},-92 L${30 + step * 8},-70`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
          {pose === "boast" ? (
            <path d="M-20,-142 L-54,-110 L-26,-94 M24,-142 L58,-110 L32,-94" stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
          {pose === "point" ? (
            <g>
              <path d="M-22,-142 L-34,-92 L-30,-70" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
              <g transform={`rotate(${arm},22,-142)`}>
                <path d="M22,-142 L72,-150 L104,-158" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
                <path d={circle(110, -159, 8)} fill={skin} />
              </g>
            </g>
          ) : null}
          {pose === "spread" ? (
            <path d={`M-22,-142 L-70,${-166 - arm} L-106,${-184 - arm} M22,-142 L70,${-166 - arm} L106,${-184 - arm}`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
          {pose === "staff" ? (
            <g>
              <path d="M-22,-142 L-34,-92 L-30,-70" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
              <path d="M22,-142 L46,-112 L58,-106" stroke={body} strokeWidth={sw} strokeLinecap="round" fill="none" />
              <path d="M60,-200 L66,4" stroke={o ?? C.wood} strokeWidth={8} strokeLinecap="round" />
              <path d="M60,-200 Q74,-216 86,-202" stroke={o ?? C.wood} strokeWidth={8} strokeLinecap="round" fill="none" />
            </g>
          ) : null}
          {pose === "hands" || pose === "kneel" ? (
            <path d={`M-22,-142 L-44,${-112 + arm} L-16,${-130 + arm} M22,-142 L44,${-112 + arm} L16,${-130 + arm}`} stroke={body} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
        </g>
      </g>
    );
  };
  return <g transform={`scale(${s})`}><Layered draw={draw} depth={0.7} /></g>;
};

/** Grape cluster hanging from 0,0 (stem), ~r*8 tall. */
export const Grapes: React.FC<{ r?: number; col?: string; seed?: number; sway?: number }> = ({ r = 10, col = C.grape, seed = 0, sway = 0 }) => {
  const rows = [3, 3, 2, 2, 1];
  const berries = rows.flatMap((n, ri) => Array.from({ length: n }, (_, i) => ({
    x: (i - (n - 1) / 2) * r * 1.6 + (ri % 2 ? r * 0.3 : 0), y: r * 1.6 + ri * r * 1.35, k: `${ri}-${i}`, c: hash(seed + ri * 5 + i) > 0.5,
  })));
  return (
    <g transform={`rotate(${sway})`}>
      <path d={`M0,0 L0,${r * 0.9}`} stroke={C.woodLt} strokeWidth={r * 0.35} />
      <Layered depth={0.5} draw={(o) => (
        <g>
          {berries.map((b) => <path key={b.k} d={circle(b.x, b.y, r)} fill={o ?? (b.c ? col : mix(col, "#ffffff", 0.2))} />)}
          <path d={`M0,${r * 0.6} Q${r * 2},${-r * 0.4} ${r * 3},${r * 0.8} Q${r * 1.6},${r * 1.4} 0,${r * 0.6}Z`} fill={o ?? C.vine} />
        </g>
      )} />
      {berries.map((b) => <path key={`h${b.k}`} d={circle(b.x - r * 0.35, b.y - r * 0.35, r * 0.28)} fill="#FFFFFF" opacity={0.55} />)}
    </g>
  );
};

/** Vine trellis (para-para): posts + crossbeam + leaf canopy + hanging clusters. Foot-left at 0,0.
 *  fruit 0..1 grows clusters, collapse 0..1 knocks it down, dry 0..1 browns the leaves. */
export const Vineyard: React.FC<{ w?: number; h?: number; fruit?: number; collapse?: number; dry?: number; t?: number; seed?: number; posts?: number; grapeR?: number }> = ({
  w = 520, h = 260, fruit = 1, collapse = 0, dry = 0, t = 0, seed = 1, posts = 4, grapeR = 11,
}) => {
  const leafCol = mix(mix(C.vine, C.ochre, dry), "#5A4030", dry * 0.3);
  const fall = easeOut(collapse);
  return (
    <g>
      {Array.from({ length: posts }, (_, i) => {
        const x = (w / (posts - 1)) * i;
        const tilt = fall * (i % 2 ? 62 : -48) * (0.6 + hash(seed + i) * 0.5);
        return <g key={i} transform={`rotate(${tilt},${x},0)`}><P d={rect(x - 8, -h, 16, h)} fill={C.wood} depth={0.45} /></g>;
      })}
      <g transform={`translate(0,${fall * h * 0.84}) rotate(${fall * 10},${w / 2},${-h})`}>
        <P d={rect(-20, -h - 12, w + 40, 15)} fill={C.woodLt} depth={0.5} />
        {Array.from({ length: 7 }, (_, i) => {
          const x = -30 + ((w + 60) / 6) * i;
          return (
            <g key={i} transform={`translate(${x},${-h - 10 + Math.sin(t * 1.1 + i) * 3})`}>
              <P d={blob(64, seed * 13 + i, 10, 0.24, 1.25, 0.62)} fill={i % 2 ? leafCol : mix(leafCol, "#ffffff", 0.16)} depth={0.5} />
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, i) => {
          const x = 30 + ((w - 60) / 5) * i;
          const k = clamp01(fruit * 1.6 - i * 0.12);
          if (k <= 0.02 || dry > 0.7) return null;
          return (
            <g key={i} transform={`translate(${x},${-h + 16 + fall * 60}) scale(${0.4 + 0.6 * k})`} opacity={1 - dry}>
              <Grapes r={grapeR} seed={seed + i} sway={Math.sin(t * 1.4 + i) * 4 + fall * 30} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** Date palm with hanging orange date bunches, foot at 0,0. */
export const DatePalm: React.FC<{ h?: number; t?: number; seed?: number; dates?: number; dry?: number; bend?: number }> = ({ h = 320, t = 0, seed = 1, dates = 1, dry = 0, bend = 0 }) => {
  const sway = Math.sin(t * 1.2 + seed) * 3 + bend;
  const frond = (i: number) => mix(i % 2 ? C.leaf : C.leafDk, C.ochre, dry);
  return (
    <g transform={`rotate(${sway},0,0)`}>
      <P d={`M-11,0 Q${h * 0.06},${-h * 0.5} ${h * 0.03 - 6},${-h} L${h * 0.03 + 8},${-h} Q${h * 0.08 + 11},${-h * 0.5} 12,0Z`} fill="#9A7350" depth={0.5} />
      {Array.from({ length: 7 }, (_, i) => <path key={`r${i}`} d={`M-8,${-h * 0.12 * (i + 1)} L10,${-h * 0.12 * (i + 1) - 8}`} stroke="#7A5A3C" strokeWidth={3} />)}
      {dates > 0.02 ? [-1, 1].map((sx) => (
        <g key={sx} transform={`translate(${h * 0.03 + sx * 16},${-h + 18}) scale(${dates})`}>
          <Layered depth={0.3} draw={(o) => (
            <g>{Array.from({ length: 9 }, (_, j) => <path key={j} d={ellipse(sx * (6 + (j % 3) * 9), 12 + Math.floor(j / 3) * 14, 6, 8)} fill={o ?? (j % 2 ? "#D9702C" : "#B8521F")} />)}</g>
          )} />
        </g>
      )) : null}
      {Array.from({ length: 8 }, (_, i) => {
        const a = -168 + i * 22 + Math.sin(t + i) * 3 + dry * (i < 4 ? -14 : 14);
        return (
          <g key={i} transform={`translate(${h * 0.03},${-h}) rotate(${a})`}>
            <P d={`M0,0 Q${h * 0.2},${-h * 0.08} ${h * 0.4},${h * 0.06} Q${h * 0.2},${h * 0.025} 0,0Z`} fill={frond(i)} depth={0.4} />
            <path d={`M${h * 0.04},${-h * 0.01} L${h * 0.36},${h * 0.05}`} stroke={mix(frond(i), "#ffffff", 0.35)} strokeWidth={2} opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

/** Field (ladang) in 3/4 view: furrow strips between x0..x1 from y0 (far) to y1 (near). */
export const Field: React.FC<{ x0: number; x1: number; y0: number; y1: number; rows?: number; t?: number; dry?: number }> = ({ x0, x1, y0, y1, rows = 6, t = 0, dry = 0 }) => (
  <g>
    <P d={`M${x0 + 40},${y0} L${x1 - 40},${y0} L${x1},${y1} L${x0},${y1}Z`} fill={mix("#A9894E", "#8A6A3E", dry)} depth={0.4} />
    {Array.from({ length: rows }, (_, i) => {
      const k0 = i / rows, k1 = (i + 0.55) / rows;
      const ya = lerp(y0, y1, k0), yb = lerp(y0, y1, k1);
      const ia = lerp(40, 0, k0), ib = lerp(40, 0, k1);
      const col = mix(i % 2 ? "#9CC46A" : "#B9D27A", C.straw, dry);
      return (
        <g key={i}>
          <path d={`M${x0 + ia},${ya} L${x1 - ia},${ya} L${x1 - ib},${yb} L${x0 + ib},${yb}Z`} fill={col} />
          {Array.from({ length: 14 }, (_, j) => {
            const x = lerp(x0 + ia + 10, x1 - ia - 10, j / 13);
            const hh = 10 + k0 * 16;
            return <path key={j} d={`M${x},${ya + 2} L${x + Math.sin(t * 2 + j + i) * 3},${ya - hh}`} stroke={mix("#5E8E3A", C.ochre, dry)} strokeWidth={2.4} strokeLinecap="round" />;
          })}
        </g>
      );
    })}
  </g>
);

/** Woven basket full of grapes, foot centre 0,0. */
export const Basket: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    {[-40, -10, 22, 46].map((x, i) => <g key={i} transform={`translate(${x},-74)`}><Grapes r={12} seed={i * 4} col={i % 2 ? C.grape : C.grapeLt} /></g>)}
    <Layered depth={0.6} draw={(o) => (
      <g>
        <path d="M-80,-70 L80,-70 L62,0 L-62,0Z" fill={o ?? "#C99A5A"} />
        <path d={rect(-86, -78, 172, 14)} fill={o ?? "#A87A40"} />
      </g>
    )} />
    {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${-76 + i * 2},${-56 + i * 14} L${76 - i * 4},${-56 + i * 14}`} stroke="#8E6634" strokeWidth={3} opacity={0.7} />)}
    {Array.from({ length: 8 }, (_, i) => <path key={`v${i}`} d={`M${-66 + i * 19},-64 L${-54 + i * 16},-4`} stroke="#8E6634" strokeWidth={2} opacity={0.5} />)}
  </g>
);

/** Ornamental verse card (8-point stars at the corners), centred at 0,0. */
export const AyahCard: React.FC<{ w: number; h: number; title: string; lines?: string[]; sub?: string[]; size?: number; op?: number; accent?: string }> = ({
  w, h, title, lines = [], sub = [], size = 64, op = 1, accent = C.teal,
}) => {
  const block = lines.length * size * 1.12 + sub.length * 44;
  const y0 = -block / 2 + size * 0.8 + 18;
  return (
    <g opacity={op}>
      <Layered depth={0.8} draw={(o) => <path d={rect(-w / 2, -h / 2, w, h)} fill={o ?? C.paper} />} />
      <path d={rect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36)} fill="none" stroke={accent} strokeWidth={5} />
      <path d={rect(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60)} fill="none" stroke={C.gold} strokeWidth={2.5} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <g key={i}>
          <path d={star8(sx * (w / 2 - 24), sy * (h / 2 - 24), 30)} fill={accent} />
          <path d={star8(sx * (w / 2 - 24), sy * (h / 2 - 24), 14)} fill={C.gold} />
        </g>
      ))}
      <g transform={`translate(0,${-h / 2 + 6})`}>
        <Layered depth={0.4} draw={(o) => <path d={rect(-Math.min(280, w * 0.38), -40, Math.min(560, w * 0.76), 80)} fill={o ?? accent} />} />
        <text x={0} y={20} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={C.paper} letterSpacing={3}>{title}</text>
      </g>
      {lines.map((l, i) => (
        <text key={i} x={0} y={y0 + i * size * 1.12} textAnchor="middle" fontFamily="Anton" fontSize={size} fill={C.ink} letterSpacing={1.5}>{l}</text>
      ))}
      {sub.map((l, i) => (
        <text key={`s${i}`} x={0} y={y0 + lines.length * size * 1.12 + i * 44 + 4} textAnchor="middle" fontFamily="Manrope" fontWeight={800} fontSize={36} fill="#5A3E2C">{l}</text>
      ))}
    </g>
  );
};

/** Close-up paper hand, wrist at 0,0, fingers up; flip -1..1 turns it (palm ↔ back). */
export const Hand: React.FC<{ flip: number; s?: number; mirror?: boolean }> = ({ flip, s = 1, mirror }) => {
  const sx = Math.max(0.1, Math.abs(flip)) * (mirror ? -1 : 1);
  const palm = flip >= 0;
  const col = palm ? "#C99272" : "#A8735A";
  const d = "M-70,0 L-78,-150 Q-80,-178 -62,-180 Q-46,-180 -46,-156 L-44,-230 Q-44,-256 -24,-256 Q-6,-256 -6,-232 L-4,-252 Q-2,-278 18,-278 Q38,-278 38,-252 L36,-226 Q38,-246 56,-246 Q74,-246 74,-222 L70,-120 L104,-160 Q120,-176 134,-160 Q144,-148 132,-130 L76,-40 Q66,0 40,0Z";
  return (
    <g transform={`scale(${s * sx},${s})`}>
      <P d={d} fill={col} depth={0.7} />
      {palm ? (
        <path d="M-58,-110 Q-10,-90 50,-120 M-50,-70 Q0,-60 56,-84" stroke="#9A6A50" strokeWidth={4} fill="none" opacity={0.6} />
      ) : (
        <path d="M-26,-230 L-24,-210 M16,-252 L16,-232 M56,-222 L54,-204" stroke="#8A5A42" strokeWidth={4} opacity={0.5} />
      )}
      <P d={rect(-84, 0, 168, 140)} fill={C.robe} depth={0.5} />
      <path d={rect(-84, 0, 168, 18)} fill={C.robeTrim} />
    </g>
  );
};

/** Plant that grows (g 0..1) and dries (dry 0..1); foot at 0,0. */
export const Plant: React.FC<{ g: number; dry?: number; seed?: number; h?: number; t?: number }> = ({ g, dry = 0, seed = 0, h = 160, t = 0 }) => {
  if (g <= 0.01) return null;
  const hh = h * easeOut(g);
  const col = mix(mix("#6FB85A", C.ochre, clamp01(dry * 1.3)), "#8A6A3E", clamp01(dry * 2 - 1));
  const droop = dry * 30;
  const sway = Math.sin(t * 1.6 + seed) * 4;
  return (
    <g transform={`rotate(${sway})`}>
      <path d={`M0,0 Q${6 + droop * 0.4},${-hh * 0.5} ${droop * 0.6},${-hh}`} stroke={mix("#4E8A3E", C.ochre, dry)} strokeWidth={7} fill="none" strokeLinecap="round" />
      {Array.from({ length: 4 }, (_, i) => {
        const k = (i + 1) / 5;
        if (g < k * 0.8) return null;
        const side = i % 2 ? 1 : -1;
        return (
          <g key={i} transform={`translate(${droop * 0.3 * k},${-hh * k}) rotate(${side > 0 ? -40 + droop : 220 - droop})`}>
            <P d={`M0,0 Q${h * 0.16},${-h * 0.1} ${h * 0.32},0 Q${h * 0.16},${h * 0.08} 0,0Z`} fill={col} depth={0.25} />
          </g>
        );
      })}
      {g > 0.85 && dry < 0.5 ? <path d={circle(droop * 0.6, -hh - 6, 9)} fill={C.gold} /> : null}
    </g>
  );
};

/** Paper leaf, centred 0,0, ~64 long. */
export const Leaf: React.FC<{ col?: string; s?: number; rot?: number }> = ({ col = C.ochre, s = 1, rot = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <P d="M-32,0 Q-4,-22 32,0 Q-4,20 -32,0Z" fill={col} depth={0.3} />
    <path d="M-28,0 L28,0" stroke={mix(col, "#3A2614", 0.35)} strokeWidth={2} />
  </g>
);

/** Stone garden gate with a hanging AUDIRA board; centre-bottom at 0,0. */
export const Gate: React.FC<{ w?: number; h?: number; swing?: number }> = ({ w = 360, h = 380, swing = 0 }) => (
  <g>
    {[-1, 1].map((sx) => <P key={sx} d={rect((sx * w) / 2 - 34, -h, 68, h)} fill={C.stone} depth={0.9} />)}
    {[-1, 1].map((sx) => <path key={`c${sx}`} d={rect((sx * w) / 2 - 44, -h - 24, 88, 26)} fill={C.stoneDk} />)}
    <P d={`M${-w / 2 - 44},${-h - 20} Q0,${-h - 120} ${w / 2 + 44},${-h - 20} L${w / 2 + 44},${-h + 8} Q0,${-h - 88} ${-w / 2 - 44},${-h + 8}Z`} fill={C.stone} depth={0.8} />
    <path d={star8(0, -h - 58, 20)} fill={C.teal} />
    <g transform={`translate(0,${-h + 30}) rotate(${swing})`}>
      <path d="M-100,-24 L-80,6 M100,-24 L80,6" stroke={C.wood} strokeWidth={4} />
      <g transform="translate(0,44)">
        <Layered depth={0.5} draw={(o) => <path d={rect(-150, -38, 300, 80)} fill={o ?? C.paper} />} />
        <path d={rect(-150, -38, 300, 11)} fill={C.teal} />
        <text x={0} y={30} textAnchor="middle" fontFamily="Anton" fontSize={54} fill={C.ink} letterSpacing={9}>AUDIRA</text>
      </g>
    </g>
  </g>
);

/** River in 3/4 view: winding band from y0 (far, narrow) to y1 (near, wide). level 0..1 shrinks it. */
export const River: React.FC<{ t: number; x?: number; y0?: number; y1?: number; w0?: number; w1?: number; level?: number }> = ({ t, x = 540, y0 = 900, y1 = 2000, w0 = 40, w1 = 300, level = 1 }) => {
  const N = 16;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const k = i / N;
    return [x + Math.sin(k * 5 + 0.6) * lerp(20, 120, k), lerp(y0, y1, k), lerp(w0, w1, k) * 0.5 * level];
  });
  const side = (s: number, pad: number) => pts.map(([cx, y, hw]) => `${(cx + s * (hw + pad)).toFixed(1)},${y.toFixed(1)}`);
  const d = `M${side(-1, 0).join(" L")} L${side(1, 0).reverse().join(" L")}Z`;
  const bank = `M${side(-1, 12).join(" L")} L${side(1, 14).reverse().join(" L")}Z`;
  return (
    <g>
      <path d={bank} fill={C.landDk} />
      <P d={d} fill={mix(C.turq, C.carib, 0.45)} depth={0.3} />
      {pts.slice(1).map(([cx, y, hw], i) => (
        <path key={i} d={`M${cx - hw * 0.5 + Math.sin(t * 2 + i) * 6},${y} L${cx + hw * 0.2 + Math.sin(t * 2 + i) * 6},${y}`} stroke="#FFFFFF" strokeWidth={2 + i * 0.3} opacity={0.6} strokeLinecap="round" strokeDasharray={`${12 + i * 2} ${16 + i}`} strokeDashoffset={-t * 60} />
      ))}
    </g>
  );
};
