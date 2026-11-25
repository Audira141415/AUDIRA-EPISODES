// EP44 props — paper cut-outs for the Yusuf story (pure SVG). All drawn with Layered/P so they cast the long
// upper-left key-light shadow. No faces anywhere (adab).
import React from "react";
import { Layered, P, Y, circle, ellipse, rect, blob, hash, mix } from "./pieces";

/** Striped Bedouin tent, base centre 0,0, ~2w wide. Door glows. */
export const Tent2: React.FC<{ w?: number; h?: number; glow?: number; sign?: string }> = ({ w = 240, h = 230, glow = 1, sign }) => (
  <g>
    <path d={ellipse(0, -h * 0.3, w * 1.2, h * 0.7)} fill={Y.gold} opacity={0.4 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    <Layered depth={1} draw={(o) => (
      <g>
        <path d={`M${-w},0 L${-w * 0.8},${-h * 0.62} L${-w * 0.15},${-h} L${w * 0.2},${-h * 0.96} L${w * 0.85},${-h * 0.6} L${w},0Z`} fill={o ?? "#E3CFAE"} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${-w * 0.8 + i * w * 0.34},${-h * 0.66 - (i < 2 ? i * 0.17 : (4 - i) * 0.15) * h} L${-w * 0.68 + i * w * 0.34},0 L${-w * 0.56 + i * w * 0.34},0 L${-w * 0.68 + i * w * 0.34},${-h * 0.7 - (i < 2 ? i * 0.17 : (4 - i) * 0.15) * h}Z`} fill={o ?? Y.terra} opacity={o ? 1 : 0.85} />
        ))}
      </g>
    )} />
    <path d={`M${-w * 0.2},0 L${-w * 0.05},${-h * 0.55} L${w * 0.12},0Z`} fill={mix("#FFD27A", "#7A4A2A", 1 - glow)} />
    <path d={`M${-w * 0.15},${-h} L${w * 0.2},${-h * 0.96}`} stroke="#FFF6E2" strokeWidth={3} opacity={0.7} />
    {sign ? (
      <g transform={`translate(${w * 0.62},${-h * 0.2})`}>
        <path d={`M0,0 L0,${h * 0.2}`} stroke="#6B4A33" strokeWidth={8} />
        <Layered depth={0.4} draw={(o) => <path d={rect(-150, -74, 300, 74)} fill={o ?? "#FFF6E6"} />} />
        <path d={rect(-150, -74, 300, 9)} fill={Y.terra} />
        <text x={0} y={-20} textAnchor="middle" fontFamily="Anton" fontSize={38} fill={Y.ink} letterSpacing={1.5} stroke="#FFF6E6" strokeWidth={4} paintOrder="stroke">{sign}</text>
      </g>
    ) : null}
  </g>
);

/** Oil lamp, base 0,0, flame flicker with t. */
export const Lamp: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d={circle(0, -46, 90 + Math.sin(t * 9) * 6)} fill="#FFC86A" opacity={0.5} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} />
    <Layered depth={0.4} draw={(o) => <path d="M-40,-10 Q0,12 40,-10 L52,-22 L-30,-22 Q-46,-20 -40,-10Z" fill={o ?? "#B9763E"} />} />
    <path d={`M44,-24 Q${50 + Math.sin(t * 11) * 3},-62 44,-70 Q${38 + Math.sin(t * 13) * 3},-50 44,-24Z`} fill="#FFE08A" />
  </g>
);

/** Camel walking right, ~320 wide, feet at 0. */
export const Camel: React.FC<{ t: number; ph?: number; col?: string; load?: boolean }> = ({ t, ph = 0, col = "#C9955E", load = true }) => {
  const sw = Math.sin(t * 3.2 + ph);
  return (
    <Layered depth={0.8} draw={(o) => {
      const b = o ?? col, d = o ?? mix(col, "#2A1A10", 0.25);
      const leg = (x: number, p: number, c: string) => <g transform={`rotate(${p * 14},${x},-150)`}><path d={`M${x - 9},-150 L${x + 9},-150 L${x + 7},-4 L${x + 14},0 L${x - 10},0Z`} fill={c} /></g>;
      return (
        <g>
          {leg(-90, sw, d)}{leg(70, -sw, d)}
          <path d="M-140,-150 C-150,-200 -110,-215 -80,-200 C-60,-270 0,-270 20,-205 C40,-240 90,-235 100,-190 L120,-160 C110,-140 -120,-130 -140,-150Z" fill={b} />
          <path d="M100,-185 C130,-220 140,-270 150,-300 L182,-300 C192,-296 192,-282 180,-280 L168,-278 C160,-240 150,-200 120,-160Z" fill={b} />
          {load ? <path d="M-60,-235 L40,-235 L50,-196 L-70,-196Z" fill={o ?? "#B5523B"} /> : null}
          {load ? <path d="M-64,-210 L46,-210" stroke={o ?? Y.gold} strokeWidth={6} /> : null}
          {leg(-60, -sw, b)}{leg(100, sw, b)}
        </g>
      );
    }} />
  );
};

/** Wooden bucket hanging from a rope (rope goes up to -ropeLen). Bottom centre 0,0. */
export const Bucket: React.FC<{ ropeLen?: number; glow?: number }> = ({ ropeLen = 400, glow = 0 }) => (
  <g>
    <path d={`M0,-70 L0,${-70 - ropeLen}`} stroke="#D9C49A" strokeWidth={5} />
    {glow > 0 ? <path d={circle(0, -40, 140)} fill={Y.goldLt} opacity={0.6 * glow} filter="url(#psoft)" style={{ mixBlendMode: "screen" }} /> : null}
    <Layered depth={0.5} draw={(o) => (
      <g>
        <path d="M-48,-70 L48,-70 L38,0 L-38,0Z" fill={o ?? "#8A6040"} />
        <path d="M-50,-58 L50,-58 M-44,-20 L44,-20" stroke={o ?? "#5E4030"} strokeWidth={6} />
        <path d="M-48,-70 Q0,-130 48,-70" stroke={o ?? "#5E4030"} strokeWidth={5} fill="none" />
      </g>
    )} />
  </g>
);

/** Tunic laid flat, centre 0,0, ~300 wide; red paper tear-stains with stain 0..1. */
export const Shirt: React.FC<{ stain?: number }> = ({ stain = 1 }) => (
  <g>
    <Layered depth={0.6} draw={(o) => (
      <g>
        <path d="M-60,-150 L-150,-110 L-180,-20 L-120,0 L-100,-60 L-100,150 L100,150 L100,-60 L120,0 L180,-20 L150,-110 L60,-150 Q0,-110 -60,-150Z" fill={o ?? "#EFE2C6"} />
        <path d="M-60,-150 Q0,-110 60,-150 Q0,-95 -60,-150Z" fill={o ?? "#D9C8A6"} />
      </g>
    )} />
    <path d="M0,-118 L0,140 M-60,-40 L-70,140 M60,-40 L70,140" stroke="#D2BF98" strokeWidth={2.5} opacity={0.8} />
    <g opacity={stain}>
      <P d={blob(46, 3, 11, 0.32, 1.2, 0.9).replace(/^M/, "M").replace(/([-\d.]+),([-\d.]+)/g, (_, x, y) => `${(+x - 30).toFixed(1)},${(+y + 20).toFixed(1)}`)} fill="#C8322A" depth={0.15} noShadow />
      <P d={blob(30, 9, 10, 0.35).replace(/([-\d.]+),([-\d.]+)/g, (_, x, y) => `${(+x + 55).toFixed(1)},${(+y + 90).toFixed(1)}`)} fill="#B52A24" depth={0.15} noShadow />
      <P d={blob(22, 17, 9, 0.4).replace(/([-\d.]+),([-\d.]+)/g, (_, x, y) => `${(+x - 120).toFixed(1)},${(+y - 60).toFixed(1)}`)} fill="#C8322A" depth={0.15} noShadow />
    </g>
  </g>
);

/** Silver dirham coin, centre 0,0, spin = 0..1 (horizontal squash). */
export const Coin: React.FC<{ r?: number; spin?: number }> = ({ r = 46, spin = 0 }) => {
  const sx = Math.max(0.12, Math.abs(Math.cos(spin * Math.PI * 2)));
  return (
    <g transform={`scale(${sx},1)`}>
      <P d={circle(0, 0, r)} fill="#C9CCD3" depth={0.4} edge="#8E9099" />
      <path d={circle(0, 0, r * 0.72)} fill="none" stroke="#9EA1AA" strokeWidth={4} />
      <path d={`M${-r * 0.3},${-r * 0.1} L${r * 0.3},${-r * 0.1} M${-r * 0.2},${r * 0.15} L${r * 0.2},${r * 0.15}`} stroke="#8E9099" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** Open palm facing up (merchant), wrist at bottom 0,0, ~360 wide. */
export const Palm: React.FC<{ col?: string }> = ({ col = "#C98F64" }) => (
  <Layered depth={0.8} draw={(o) => (
    <g>
      <path d="M-80,0 L-90,-120 Q-100,-170 -60,-180 L120,-180 Q170,-170 160,-120 L140,-40 L80,0Z" fill={o ?? col} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={rect(-70 + i * 52, -260 + (i === 0 || i === 3 ? 24 : 0), 44, 110)} fill={o ?? col} />)}
      {[0, 1, 2, 3].map((i) => <path key={`c${i}`} d={circle(-48 + i * 52, -260 + (i === 0 || i === 3 ? 24 : 0), 22)} fill={o ?? col} />)}
      <path d="M-90,-120 L-170,-170 Q-200,-160 -180,-130 L-100,-60Z" fill={o ?? col} />
      <path d="M-120,0 L110,0 L120,140 L-130,140Z" fill={o ?? "#5E6E8A"} />
      {o ? null : <path d="M-40,-120 Q30,-90 100,-130" stroke={mix(col, "#000000", 0.25)} strokeWidth={4} fill="none" />}
    </g>
  )} />
);

/** Dark paper tree, base 0,0. */
export const DarkTree: React.FC<{ s?: number; seed?: number; col?: string }> = ({ s = 1, seed = 1, col = "#2C2A40" }) => (
  <g transform={`scale(${s})`}>
    <Layered depth={0.9} draw={(o) => (
      <g>
        <path d="M-18,0 L-10,-260 L10,-260 L20,0Z" fill={o ?? "#3A2E2A"} />
        <path d={blob(150, seed, 12, 0.25, 1, 1.15)} transform="translate(0,-360)" fill={o ?? col} />
        <path d={blob(100, seed + 4, 10, 0.25)} transform="translate(-90,-270)" fill={o ?? mix(col, "#000000", 0.15)} />
      </g>
    )} />
  </g>
);

/** Pair of glowing wolf eyes, centre 0,0; open 0..1. */
export const WolfEyes: React.FC<{ open: number; s?: number }> = ({ open, s = 1 }) => (
  <g transform={`scale(${s})`} opacity={Math.min(1, open * 1.4)}>
    {[-46, 46].map((x) => (
      <g key={x} transform={`translate(${x},0) scale(1,${Math.max(0.05, open)})`}>
        <path d={ellipse(0, 0, 60, 34)} fill="#FFD24A" opacity={0.5} filter="url(#pglow)" style={{ mixBlendMode: "screen" }} />
        <path d={`M-34,0 Q0,-26 34,0 Q0,22 -34,0Z`} fill="#FFD24A" />
        <path d={ellipse(0, 0, 5, 16)} fill="#1A1020" />
      </g>
    ))}
  </g>
);

/** Parchment scroll with a sketched well; draw 0..1 reveals the sketch. Centre 0,0, ~520 wide. */
export const Scroll: React.FC<{ draw: number; arrow?: number }> = ({ draw, arrow = 0 }) => (
  <g>
    <Layered depth={0.7} draw={(o) => (
      <g>
        <path d={rect(-240, -170, 480, 340)} fill={o ?? "#F3E3C0"} />
        <path d={rect(-262, -186, 44, 372)} fill={o ?? "#D9C49A"} />
        <path d={rect(218, -186, 44, 372)} fill={o ?? "#D9C49A"} />
      </g>
    )} />
    <g stroke="#5A3A2A" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - draw)}>
      <path d="M-120,-40 A120,36 0 1,0 120,-40 A120,36 0 1,0 -120,-40 M-120,-40 L-112,110 A112,30 0 0,0 112,110 L120,-40 M-110,30 A110,30 0 0,0 110,30" />
    </g>
    {arrow > 0 ? (
      <g opacity={arrow} stroke="#C8322A" strokeWidth={8} fill="none" strokeLinecap="round">
        <path d={`M-200,-140 Q-150,${-140 + 0} -40,-60`} strokeDasharray="300" strokeDashoffset={300 * (1 - arrow)} />
        <path d="M-60,-82 L-40,-60 L-68,-54" />
      </g>
    ) : null}
  </g>
);

/** Earth cross-section with the well shaft. Shaft centre x=0 from y=0 (mouth) to y=depth; water at the bottom. */
export const WellSection: React.FC<{ depth?: number; w?: number; t: number }> = ({ depth = 900, w = 300, t }) => {
  const layers = ["#D9B88A", "#C49A6A", "#A8805C", "#8E6A50", "#6E5244"];
  return (
    <g>
      {layers.map((c, i) => {
        const y0 = (depth * i) / layers.length - 40;
        let d = `M-700,${y0}`;
        for (let x = -700; x <= 700; x += 40) d += ` L${x},${(y0 + Math.sin(x / 130 + i * 1.7) * 14).toFixed(1)}`;
        d += ` L700,${depth + 400} L-700,${depth + 400}Z`;
        return <P key={i} d={d} fill={c} depth={0.5} edge={mix(c, "#ffffff", 0.4)} />;
      })}
      {Array.from({ length: 14 }, (_, i) => (
        <P key={`r${i}`} d={blob(18 + hash(i) * 22, i * 3, 8, 0.3)} fill={mix("#6E5244", "#ffffff", 0.15 * hash(i * 2))} depth={0.3}
          opacity={0.9} />
      )).map((el, i) => <g key={i} transform={`translate(${(hash(i * 7.7) - 0.5) * 1100},${80 + hash(i * 3.1) * depth})`}>{el}</g>)}
      <path d={`M${-w / 2},-10 L${-w / 2 + 10},${depth} L${w / 2 - 10},${depth} L${w / 2},-10Z`} fill="#1C1630" />
      <path d={`M${-w / 2},-10 L${-w / 2 + 10},${depth} L${-w / 2 + 40},${depth} L${-w / 2 + 34},-10Z`} fill="#3A3058" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={`b${i}`}>
          <path d={rect(-w / 2 - 34, i * (depth / 12), 34, depth / 12 - 6)} fill={i % 2 ? "#9A8C7E" : "#A89A8A"} />
          <path d={rect(w / 2, i * (depth / 12) + 20, 34, depth / 12 - 6)} fill={i % 2 ? "#A89A8A" : "#8E8072"} />
        </g>
      ))}
      <path d={`M${-w / 2 + 12},${depth - 70} L${w / 2 - 12},${depth - 70} L${w / 2 - 10},${depth} L${-w / 2 + 10},${depth}Z`} fill="#3E6E9A" />
      {[0, 1, 2].map((i) => <path key={`w${i}`} d={`M${-w / 2 + 30 + i * 70},${depth - 52 + Math.sin(t * 2 + i) * 3} l40,0`} stroke="#BFE0F2" strokeWidth={4} strokeLinecap="round" opacity={0.8} />)}
      <path d={`M-70,${depth - 70} Q-60,${depth - 110} 0,${depth - 112} Q60,${depth - 110} 70,${depth - 70}Z`} fill="#6E6460" />
    </g>
  );
};
