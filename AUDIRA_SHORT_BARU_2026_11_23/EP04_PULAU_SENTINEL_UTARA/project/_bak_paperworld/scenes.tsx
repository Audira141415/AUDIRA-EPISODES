// EP04 scenes S1–S11. Each gets global t (s) and local lt (s since scene start), draws in 1080 × 1920.
import React from "react";
import {
  C, P, PaperDefs, Sea, IslandSide, IslandTop, Figure, Boat, Canoe, Fish, Leaf, Tree, Heli, Buoy, Arrow, Coconut,
  Layered, blob, circle, ellipse, wave, waveLine, hash, ramp, ease, easeOut, lerp, mix,
} from "./pieces";

export type SceneProps = { t: number; lt: number };

const Frame: React.FC<{ children: React.ReactNode; bg?: [string, string]; id: string }> = ({ children, bg, id }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <PaperDefs />
    {bg ? (
      <>
        <defs>
          <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={bg[0]} />
            <stop offset="0.62" stopColor={bg[1]} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill={`url(#bg-${id})`} />
      </>
    ) : null}
    {children}
    <defs>
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.44" r="0.75">
        <stop offset="0.5" stopColor="#2A1A10" stopOpacity="0" />
        <stop offset="1" stopColor="#2A1A10" stopOpacity="0.5" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

const cam = (s: number, ox: number, oy: number, tx = 0, ty = 0, rot = 0) =>
  `translate(${ox + tx},${oy + ty}) rotate(${rot}) scale(${s}) translate(${-ox},${-oy})`;

const Sun: React.FC<{ x: number; y: number; r: number; col?: string }> = ({ x, y, r, col = C.gold }) => (
  <g>
    <path d={circle(x, y, r * 1.5)} fill={mix(col, "#ffffff", 0.55)} opacity={0.35} />
    <P d={circle(x, y, r)} fill={col} />
  </g>
);

// ── S1 Hook: island rises from foggy sea, boat stops ────────────────────────────────
export const S1: React.FC<SceneProps> = ({ t, lt }) => {
  const rise = easeOut(ramp(lt, 0, 2.2));
  const boatX = lerp(-260, 250, easeOut(ramp(lt, 0.2, 3.2)));
  const bob = Math.sin(t * 2.2) * 6;
  const fog = 1 - ramp(lt, 1.2, 4.5) * 0.6;
  return (
    <Frame id="s1" bg={[C.ivory, C.peach]}>
      <g transform={cam(1 + lt * 0.012, 540, 1050)}>
        <Sun x={820} y={560} r={100} />
        <g transform={`translate(${580},${1110 + (1 - rise) * 300}) scale(1.2)`}><IslandSide /></g>
        <Sea y={1090} t={t} only={[0, 1]} />
        <g transform={`translate(${boatX},${1182 + bob}) rotate(${Math.sin(t * 1.7) * 2})`}><Boat /></g>
        <Sea y={1090} t={t} only={[2, 3]} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={ellipse(200 + i * 340 + Math.sin(t * 0.4 + i) * 60 + lt * (12 + i * 6), 1010 + i * 50, 380, 46)} fill="#FFF8EE" opacity={0.55 * fog} />
        ))}
      </g>
    </Frame>
  );
};

// ── S2 Map → island top view ──────────────────────────────────────────────────────
const proj = ([lon, lat]: number[]) => [((lon - 68) / 29) * 600, ((36 - lat) / 30) * 700];
const poly = (pts: number[][]) => "M" + pts.map((p) => proj(p).map((v) => v.toFixed(1)).join(",")).join(" L") + "Z";
const INDIA = poly([[68.2, 23.7], [69.5, 22.4], [70.4, 20.9], [72.6, 21.3], [72.8, 19.0], [73.4, 16.0], [74.4, 14.0], [74.9, 12.6], [75.8, 11.0], [76.4, 9.5], [77.3, 8.1], [78.2, 8.9], [79.3, 10.3], [79.9, 11.0], [80.3, 13.3], [80.1, 15.4], [81.3, 16.4], [82.4, 17.0], [84.1, 18.3], [85.1, 19.5], [86.9, 20.8], [87.0, 21.6], [88.2, 21.7], [89.7, 22.0], [91.0, 22.8], [92.3, 21.5], [92.6, 20.6], [93.7, 19.5], [94.3, 18.0], [94.2, 16.1], [95.3, 15.8], [97.5, 16.5], [97.5, 27.5], [95.5, 28.2], [93, 27.8], [91.5, 27.8], [89, 26.8], [88.1, 27.9], [86, 27.9], [84, 28.5], [81, 30.2], [79, 31.3], [78.8, 32.5], [79.5, 34.5], [77.8, 35.5], [76, 36.5], [74.5, 36.5], [73.8, 34.4], [74.6, 32.8], [73.5, 32], [71, 30], [70.6, 28], [69.5, 27], [70, 25.5], [68.8, 24.2]]);
const LANKA = poly([[79.9, 9.8], [80.9, 9.0], [81.8, 7.5], [81.6, 6.4], [80.6, 5.9], [79.9, 6.8], [79.7, 8.2]]);
const ANDAMAN = [[516.2, 532, 3, 9], [514.1, 550.7, 3, 8], [511, 567, 3, 7], [507, 590.3, 2.6, 4]];
const SENT = [501.5, 570.5];

export const S2: React.FC<SceneProps> = ({ t, lt }) => {
  const z1 = ease(ramp(lt, 1.0, 4.6)), z2 = ease(ramp(lt, 4.6, 5.8));
  const k = lt < 4.6 ? lerp(1.6, 7, z1) : lerp(7, 34, z2);
  const cx = lt < 4.6 ? lerp(300, 510, z1) : lerp(510, SENT[0], z2);
  const cy = lt < 4.6 ? lerp(360, 560, z1) : lerp(560, SENT[1], z2);
  const mapOp = 1 - ramp(lt, 5.3, 6.0);
  const topOp = ramp(lt, 5.1, 5.9);
  const topS = lt < 6.2 ? lerp(0.25, 1.5, easeOut(ramp(lt, 5.0, 6.2))) : 1.5 + (lt - 6.2) * 0.04;
  const glow = ramp(lt, 8.7, 9.4) * (0.6 + 0.4 * Math.sin(t * 4));
  const pin = ramp(lt, 0.8, 1.2) * (1 - ramp(lt, 4.8, 5.3));
  const sx = 540 + (SENT[0] - cx) * k, sy = 880 + (SENT[1] - cy) * k;
  const inv = 1 / k;
  return (
    <Frame id="s2" bg={["#BFE3E0", "#93CBD0"]}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={waveLine(260 + i * 140, 6, 300, t * 0.6 + i)} stroke={C.foam} strokeWidth={3} fill="none" opacity={0.35} />
      ))}
      <g opacity={mapOp} transform={`translate(540,880) scale(${k}) translate(${-cx},${-cy})`}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${i * 100},-50 L${i * 100},760 M-50,${i * 117} L650,${i * 117}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
        ))}
        <P d={INDIA} fill={C.sand} depth={2.2 * inv} noShadow />
        <path d={INDIA} fill="none" stroke={C.leaf} strokeWidth={4} vectorEffect="non-scaling-stroke" opacity={0.6} />
        <P d={LANKA} fill={C.sand} depth={2.2 * inv} noShadow />
        {ANDAMAN.map(([x, y, rx, ry], i) => <P key={i} d={ellipse(x, y, rx, ry)} fill={C.leaf} depth={1.5 * inv} noShadow />)}
        <P d={circle(SENT[0], SENT[1], 1.9)} fill={C.forest} depth={1.2 * inv} noShadow />
        <text x={250} y={300} fontFamily="Anton" fontSize={44} fill={C.ink} opacity={0.55 * (1 - z1)}>INDIA</text>
      </g>
      {mapOp > 0 ? [[150, 560, 1.2, 0.5], [820, 620, 1.3, 0.9], [260, 1330, 1.0, 1.3]].map(([x, y, s, sp], i) => (
        <g key={`cl${i}`} opacity={mapOp} transform={`translate(${x + lt * 26 * sp},${y}) scale(${s})`}>
          <P d={blob(110, 40 + i * 7, 10, 0.25, 1.9, 0.62)} fill="#FFFDF6" depth={1.4} />
        </g>
      )) : null}
      {pin > 0 ? (
        <g opacity={pin} transform={`translate(${sx},${sy})`}>
          <path d={circle(0, 0, 26 + Math.sin(t * 5) * 4)} fill="none" stroke={C.red} strokeWidth={5} />
          <Layered draw={(o) => <path d="M0,-12 C-22,-40 -22,-70 0,-76 C22,-70 22,-40 0,-12Z" fill={o ?? C.red} />} />
          <text x={-40} y={-60} textAnchor="end" fontFamily="Anton" fontSize={46} fill={C.ink}>SENTINEL UTARA</text>
        </g>
      ) : null}
      {topOp > 0 ? (
        <g opacity={topOp} transform={`translate(${540 - ease(ramp(lt, 7.6, 10.4)) * 230},${880 + ease(ramp(lt, 7.6, 10.4)) * 60}) rotate(${(lt - 5) * 1.2}) scale(${topS + ease(ramp(lt, 7.6, 10.4)) * 1.0})`}>
          <IslandTop reefGlow={glow} />
        </g>
      ) : null}
    </Frame>
  );
};

// ── S3 Forest & tribe ─────────────────────────────────────────────────────────────
export const S3: React.FC<SceneProps> = ({ t, lt }) => {
  const bgX = -lt * 8, mgX = -lt * 20, fgX = -lt * 40;
  const more = ramp(lt, 3.6, 4.6);
  const bub = easeOut(ramp(lt, 6.3, 6.8));
  const step = Math.sin(t * 5);
  const trees = [60, 260, 470, 690, 880, 1060, 1240];
  return (
    <Frame id="s3" bg={["#EEF4DC", "#C7E0B2"]}>
      <g transform={`translate(${bgX},0)`}>
        <P d={wave(930, 50, 520, 0.6, -120, 1400)} fill="#A9CF98" depth={0.6} />
        <P d={wave(1040, 40, 430, 2.0, -120, 1400)} fill="#86BC7E" depth={0.7} />
      </g>
      <g transform={`translate(${mgX},0)`}>
        {trees.map((x, i) => (
          <g key={i} transform={`translate(${x},${1400})`}><Tree h={720 + hash(i) * 200} col={[C.leaf, C.forest, "#5FA866"][i % 3]} seed={i * 9 + 2} /></g>
        ))}
      </g>
      <defs>
        <radialGradient id="haze3" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6DA" stopOpacity="0.92" />
          <stop offset="0.6" stopColor="#FFF6DA" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFF6DA" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={540} cy={1000} rx={520} ry={520} fill="url(#haze3)" />
      <P d={wave(1380, 10, 600, 0.3, -120, 1200)} fill="#5E9658" />
      {more > 0 ? [200, 330, 960].map((x, i) => (
        <g key={i} opacity={more} transform={`translate(${x + mgX * 0.3},${1388}) scale(2.3)`}><Figure pose="stand" color={mix(C.skin, "#5E9658", 0.35)} /></g>
      )) : null}
      <g transform={`translate(${380 + lt * 4},${1410 + Math.abs(step) * -4}) scale(4)`}><Figure pose="spear" step={step} /></g>
      <g transform={`translate(${820 - lt * 3},${1400}) scale(3.6)`}><Figure pose="stand" step={-step * 0.6} /></g>
      <g transform={`translate(${610 + lt * 6},${1440 + Math.abs(step) * -5}) scale(-5,5)`}><Figure pose="walk" step={step} /></g>
      <P d={wave(1470, 8, 500, 1.2, -120, 1200)} fill="#4E8A4C" />
      {bub > 0 ? (
        <g>
          {[[700, 820], [300, 880]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x + lt * (i ? 4 : 6)},${y}) scale(${bub})`}>
              <P d={`${ellipse(0, 0, 110, 70)} M-30,55 L-60,110 L10,62Z`} fill={C.foam} />
              <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={C.ink}>? ? ?</text>
            </g>
          ))}
        </g>
      ) : null}
      <g transform={`translate(${fgX},0)`}>
        <g transform="translate(-30,1940)"><Leaf col={C.forest} s={1.5} r={25} /></g>
        <g transform="translate(60,1960)"><Leaf col={C.leaf} s={1.2} r={55} /></g>
        <g transform="translate(1180,1960)"><Leaf col={C.forest} s={1.6} r={-30} /></g>
        <g transform="translate(-40,-20)"><Leaf col={C.leaf} s={1.1} r={150} /></g>
        <g transform="translate(1250,-30)"><Leaf col={C.forest} s={1.3} r={-140} /></g>
      </g>
    </Frame>
  );
};

// ── S4 Hunting & fishing (cutaway) ────────────────────────────────────────────────
export const S4: React.FC<SceneProps> = ({ t, lt }) => {
  const bob = Math.sin(t * 2) * 6;
  const thrust = Math.sin(Math.PI * ramp(lt, 3.3, 4.0)) * 22;
  const fish = [[0, 1010, 70, C.amber], [400, 1090, -55, C.coral], [800, 1180, 60, C.gold], [250, 1250, -45, C.amber], [650, 960, 50, "#F09A8A"]] as const;
  return (
    <Frame id="s4" bg={[C.ivory, "#F4D9B8"]}>
      <defs>
        <linearGradient id="uw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6CC3B8" />
          <stop offset="1" stopColor="#2F6FA3" />
        </linearGradient>
      </defs>
      <g transform={cam(1 + lt * 0.008, 540, 900, 0, 30 - lt * 10)}>
        <g transform="translate(900,822) scale(0.32)"><IslandSide /></g>
        <path d={wave(822, 10, 320, t * 1.3)} fill="url(#uw)" />
        <path d={waveLine(822, 10, 320, t * 1.3)} stroke={C.foam} strokeWidth={6} fill="none" opacity={0.85} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${120 + i * 170 + Math.sin(t + i) * 20},860 L${60 + i * 170},1500`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={40} />
        ))}
        {fish.map(([x0, y, v, col], i) => {
          const x = ((((x0 + lt * v) % 1300) + 1300) % 1300) - 110;
          return <g key={i} transform={`translate(${x},${y + Math.sin(t * 2 + i) * 10}) scale(${v > 0 ? -1.3 : 1.3},1.3)`}><Fish col={col} /></g>;
        })}
        {Array.from({ length: 9 }, (_, i) => (
          <P key={i} d={blob(60 + hash(i) * 50, i * 13, 9, 0.3, 1, 0.8)} fill={["#F09A8A", C.coral, C.amber, C.mint][i % 4]} depth={0.6}
            opacity={1} edge={undefined} light />
        )).map((el, i) => <g key={i} transform={`translate(${i * 135 + 20},${1330 + hash(i + 4) * 60})`}>{el}</g>)}
        <P d="M-60,700 C120,700 260,760 360,846 C300,900 150,940 -60,980Z" fill={C.sand} />
        <g transform="translate(150,742) scale(-3.1,3.1)"><Figure pose="bow" armRot={10} /></g>
        <g transform={`translate(560,${822 + bob}) rotate(${Math.sin(t * 1.5) * 2})`}>
          <g transform="translate(0,-14) scale(3.8)"><Figure pose="spear" armRot={thrust} /></g>
          <Canoe />
        </g>
      </g>
    </Frame>
  );
};

// ── S5 MV Primrose wreck → iron arrowheads ───────────────────────────────────────
export const S5: React.FC<SceneProps> = ({ t, lt }) => {
  const arrows = [520, 640, 760];
  const flakes = Array.from({ length: 9 }, (_, i) => {
    const a = i % 3;
    const t0 = 0.3 + i * 0.17, p = ease(ramp(lt, t0, t0 + 1.0));
    const x0 = 470 + hash(i) * 260, y0 = 990;
    const x1 = 870, y1 = arrows[a];
    return { x: lerp(x0, x1, p), y: lerp(y0, y1, p) - Math.sin(Math.PI * p) * 120, p, r: lt * 300 + i * 40 };
  });
  return (
    <Frame id="s5" bg={["#F3E2CC", "#E9BFA0"]}>
      <g transform={cam(1.06 - ramp(lt, 0, 5.9) * 0.06, 540, 900)}>
        <g transform="translate(180,1040) scale(0.38)"><IslandSide /></g>
        <Sea y={1040} t={t} only={[0, 1]} />
        <g transform="translate(600,1030) rotate(9) scale(1.18)">
          <Layered draw={(o) => (
            <g>
              <path d="M-330,-10 L300,-10 L250,110 L-290,110Z" fill={o ?? "#5F5A55"} />
              <path d="M-330,-10 L300,-10 L296,6 L-326,6Z" fill={o ?? "#8A847D"} />
              <path d="M110,-10 L110,-130 L250,-130 L250,-10Z" fill={o ?? "#9A938B"} />
              <path d="M150,-130 L150,-200 L200,-200 L200,-130Z" fill={o ?? "#A65A3A"} />
              <path d="M-200,-10 L-200,-180" stroke={o ?? "#5F5A55"} strokeWidth={8} />
              {[0, 1, 2].map((i) => <path key={i} d={`M${130 + i * 40},-100 h24 v24 h-24Z`} fill={o ?? "#3D4A55"} />)}
              {[[-240, 40, 50], [-60, 70, 40], [80, 30, 46], [200, 60, 34], [170, -90, 26]].map(([x, y, r], i) => (
                <g key={`r${i}`} transform={`translate(${x},${y})`}><path d={blob(r, i * 5 + 1, 9, 0.35)} fill={o ?? "#B5653A"} opacity={o ? 1 : 0.85} /></g>
              ))}
            </g>
          )} />
          <text x={-150} y={70} fontFamily="Anton" fontSize={44} fill={C.foam} opacity={0.85}>PRIMROSE</text>
        </g>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${200 + i * 120},${1130 + hash(i) * 30})`}><P d={blob(50 + hash(i + 2) * 30, i * 3, 8, 0.3, 1.3, 0.6)} fill="#A9876A" /></g>
        ))}
        <Sea y={1040} t={t} only={[2, 3]} />
        {arrows.map((y, a) => {
          const tip = ramp(lt, 0.3 + (6 + a) * 0.17 + 0.9, 0.3 + (6 + a) * 0.17 + 1.1);
          return <g key={a} transform={`translate(${520},${y}) scale(0.92)`} opacity={ramp(lt, 0, 0.4)}><Arrow tip={tip} /></g>;
        })}
        {flakes.map((f, i) => (f.p > 0 && f.p < 1 ? (
          <g key={i} transform={`translate(${f.x},${f.y}) rotate(${f.r})`}>
            <P d="M-16,-12 L20,0 L-16,12Z" fill={C.iron} depth={0.4} />
          </g>
        ) : null))}
      </g>
    </Frame>
  );
};

// ── S6 1880 archive (sepia) ───────────────────────────────────────────────────────
const SEPIA = ["#CDBE98", "#BFAE86", "#AE9C76", "#9C8A66"];
export const S6: React.FC<SceneProps> = ({ t, lt }) => {
  const p = ease(ramp(lt, 0.6, 6.4));
  const q = (a: number, b: number, c: number) => (1 - p) * (1 - p) * a + 2 * (1 - p) * p * b + p * p * c;
  const sx = q(270, 560, 870), sy = q(1150, 1270, 1140);
  return (
    <Frame id="s6" bg={["#F0E2C2", "#E3CFA6"]}>
      <defs>
        <radialGradient id="sep" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#5C4632" stopOpacity="0" />
          <stop offset="1" stopColor="#5C4632" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <g transform={cam(1.02 + ease(ramp(lt, 3.6, 6.6)) * 0.2, 700, 760, 20 - lt * 6, 0)}>
        <Sun x={540} y={560} r={80} col="#E6C98F" />
        <Sea y={1080} t={t} cols={SEPIA} amp={10} gap={60} only={[0, 1]} />
        <g transform="translate(180,1082) scale(0.42)"><IslandSide mono="#7A6248" /></g>
        {[[860, 1060], [930, 1050], [1000, 1066]].map(([x, y], i) => (
          <Layered key={i} draw={(o) => (
            <g>
              <path d={`M${x - 34},${y} L${x + 34},${y} L${x + 34},${y - 50} L${x - 34},${y - 50}Z`} fill={o ?? "#C9B58E"} />
              <path d={`M${x - 42},${y - 48} L${x},${y - 84} L${x + 42},${y - 48}Z`} fill={o ?? "#7A6248"} />
            </g>
          )} />
        ))}
        <text x={870} y={970} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={C.sepia}>PORT BLAIR</text>
        <path d="M270,1150 Q560,1270 870,1140" stroke={C.sepia} strokeWidth={5} strokeDasharray="14 14" fill="none" opacity={0.7} />
        <g transform={`translate(${sx},${sy + Math.sin(t * 2) * 4}) scale(1.1)`}>
          <Layered draw={(o) => (
            <g>
              <path d="M-110,0 L110,0 L85,36 L-90,36Z" fill={o ?? "#6B4E34"} />
              <path d="M-30,0 L-30,-170 M40,0 L40,-150" stroke={o ?? "#5C4632"} strokeWidth={6} />
              <path d="M-26,-160 L-26,-20 L-100,-24Z" fill={o ?? "#EEDDB6"} />
              <path d="M-26,-160 L30,-30 L-26,-24Z" fill={o ?? "#E3CFA2"} />
              <path d="M44,-140 L44,-20 L100,-26Z" fill={o ?? "#EEDDB6"} />
            </g>
          )} />
        </g>
        <Sea y={1080} t={t} cols={SEPIA} amp={10} gap={60} only={[2, 3]} />
      </g>
      <P d="M120,560 L960,560 L960,880 L120,880Z" fill="#F5EAD2" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = easeOut(ramp(lt, 2.9 + i * 0.12, 3.3 + i * 0.12));
        const ghost = i >= 4 ? ease(ramp(lt, 4.7, 5.7)) : 0;
        return a > 0 ? (
          <g key={i} opacity={a} transform={`translate(${245 + i * 118},${850 - (1 - a) * 30}) scale(2.4)`}>
            <Figure pose="stand" color={C.sepia} ghost={ghost} />
          </g>
        ) : null;
      })}
      <rect width={1080} height={1920} fill="url(#sep)" />
    </Frame>
  );
};

// ── S7 1991 coconut exchange ──────────────────────────────────────────────────────
export const S7: React.FC<SceneProps> = ({ t, lt }) => {
  const bx = lt < 3 ? 860 : lt < 9.2 ? lerp(860, 720, ease(ramp(lt, 3, 6.5))) : lerp(720, 1260, ease(ramp(lt, 9.2, 11.6)));
  const bob = Math.sin(t * 2) * 5;
  const hp = ease(ramp(lt, 6.9, 8.3));
  const handFrom = [bx - 60 - 64, 1100 - 128 + bob], handTo = [512, 867];
  const cX = lerp(handFrom[0], handTo[0], hp), cY = lerp(handFrom[1], handTo[1], hp) - Math.sin(Math.PI * hp) * 90;
  const floatOp = ramp(lt, 1.0, 1.6) * (1 - ramp(lt, 6.4, 7.0));
  return (
    <Frame id="s7" bg={[C.ivory, "#F2D7B0"]}>
      <g transform={cam(1.02 + lt * 0.012, 540, 1000, -lt * 4, 0)}>
        <Sun x={260} y={470} r={90} />
        <Sea y={1000} t={t} only={[0, 1]} />
        <g transform={`translate(${bx},${1100 + bob})`}>
          {[-60, 0, 60].map((dx, i) => (
            <g key={i} transform={`translate(${dx},0) scale(2)`}><Figure pose={i === 0 && lt > 6 && lt < 8.6 ? "carry" : "stand"} color="#8A6E50" hat /></g>
          ))}
          <Boat hull="#E8E2D4" stripe={C.cobalt} />
        </g>
        {floatOp > 0 ? [0, 1, 2, 3].map((i) => (
          <g key={i} opacity={floatOp} transform={`translate(${560 + i * 40 - ramp(lt, 1, 6) * 80},${1150 + Math.sin(t * 2 + i) * 6})`}><Coconut /></g>
        )) : null}
        <Sea y={1000} t={t} only={[2, 3]} />
        <P d="M-60,1000 C150,990 380,1040 560,1190 C660,1280 720,1560 780,2000 L-60,2000Z" fill={C.sand} />
        <g transform="translate(150,1030) scale(3.3)"><Figure pose="stand" /></g>
        <g transform="translate(270,1060) scale(3.6)"><Figure pose="spear" armRot={-10} /></g>
        <g transform="translate(390,1110) scale(-3.8,3.8)"><Figure pose={lt > 6.4 ? "carry" : "stand"} /></g>
        {lt > 6.9 ? <g transform={`translate(${cX},${cY})`}><Coconut /></g> : null}
        <g transform="translate(-40,1900)"><Leaf col={C.forest} s={1.3} r={30} /></g>
      </g>
    </Frame>
  );
};

// ── S8 Tsunami 2004 payoff ────────────────────────────────────────────────────────
export const S8: React.FC<SceneProps> = ({ t, lt }) => {
  const rec = ease(ramp(lt, 0.3, 2.4));
  const hx = lerp(1320, 780, easeOut(ramp(lt, 1.9, 4.2)));
  const hy = 560 + Math.sin(t * 1.6) * 10;
  const arm = lerp(-55, 48, ease(ramp(lt, 5.2, 6.3)));
  const push = ease(ramp(lt, 3.5, 10.5));
  const glow = 1;
  const seaCols = ["#8FC6C4", "#5E9FB6", "#3D7AA5", "#2E5F8A"];
  return (
    <Frame id="s8" bg={["#A9BCD0", "#E6D3BE"]}>
      <defs>
        <radialGradient id="g8" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.gold} stopOpacity="0.85" />
          <stop offset="1" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam(1.12 + push * 0.2 + lt * 0.008, 400, 1300, lt * 5, 0)}>
        {[0, 1, 2].map((i) => (
          <P key={i} d={blob(120 + i * 30, 90 + i, 10, 0.25, 2.2, 0.6)} fill={mix("#C8D3DE", "#ffffff", i * 0.15)} depth={0.5} />
        )).map((el, i) => <g key={i} transform={`translate(${(160 + i * 380 + lt * 10) % 1300},${300 + i * 90})`}>{el}</g>)}
        {glow > 0 ? <path d={circle(470, 800, 600)} fill="url(#g8)" opacity={glow} /> : null}
        <path d={circle(470, 800, 260)} fill="url(#g8)" opacity={0.9} />
        <P d="M-60,1000 L1140,1000 L1140,2000 L-60,2000Z" fill="#C9A877" noShadow />
        {seaCols.map((c, i) => (
          <P key={i} d={wave(900 + i * 34, 8 + i * 3, 260 + i * 60, t * 1.4 + i, -120, 1200, lerp(1190, 1020, rec) + i * 4)} fill={c} depth={0.5} />
        ))}
        <P d={wave(890 - rec * 26, 18, 900, 0.8 + t * 0.2, -120, 1200, 930)} fill="#2E5F8A" depth={0.5} opacity={rec} />
        <P d="M-60,1180 C300,1150 700,1170 1140,1215 L1140,2000 L-60,2000Z" fill={C.sand} />
        {[[640, 1290, 0.9], [860, 1340, 1.2], [180, 1560, 1]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${i * 14 - 8}) scale(${s})`}>
            <P d="M-90,-12 L90,-12 L95,12 L-85,12Z" fill={C.wood} depth={0.5} />
          </g>
        ))}
        <g transform={`translate(${hx},${hy}) scale(-1.2,1.2)`}><Heli /></g>
        <g transform="translate(400,1470) scale(-6,6)"><Figure pose="bow" armRot={arm} /></g>
        <g transform="translate(1160,1960)"><Leaf col={C.forest} s={1.6} r={-35} /></g>
        <g transform="translate(1040,1990)"><Leaf col={C.leaf} s={1.2} r={-60} /></g>
      </g>
    </Frame>
  );
};

// ── S9 5 km ring (top-down) ───────────────────────────────────────────────────────
const SeaTop: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={waveLine(140 + i * 130, 7, 340, t * 0.7 + i * 1.3)} stroke={C.foam} strokeWidth={4} fill="none" opacity={0.3} />
    ))}
  </g>
);

export const S9: React.FC<SceneProps> = ({ t, lt }) => {
  const r = lt < 2.9 ? lerp(272, 300, easeOut(ramp(lt, 0.4, 1.2))) : lerp(300, 405, easeOut(ramp(lt, 2.9, 4.0)));
  const ringOp = ramp(lt, 0.4, 0.9);
  const germ = easeOut(ramp(lt, 4.7, 6.0));
  return (
    <Frame id="s9" bg={["#86CCCB", "#6AB4C0"]}>
      <SeaTop t={t} />
      <g transform={cam(1.12 - lt * 0.014, 540, 850, 0, 0, lt * 1.1)}>
        <path d={circle(540, 850, r)} fill={C.foam} opacity={0.14 * ringOp} />
        <g transform="translate(540,850)"><IslandTop /></g>
        <path d={circle(540, 850, r)} fill="none" stroke={C.red} strokeWidth={9} strokeDasharray="30 20" strokeDashoffset={-lt * 30} opacity={ringOp} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.3;
          return (
            <g key={i} opacity={ringOp} transform={`translate(${540 + Math.cos(a) * r},${850 + Math.sin(a) * r})`}>
              <P d={circle(0, 0, 18)} fill={C.red} depth={0.4} />
              <path d={circle(0, 0, 8)} fill={C.foam} />
            </g>
          );
        })}
        {germ > 0 ? Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.7;
          const rr = lerp(760, r + 50, germ) + Math.sin(t * 3 + i) * 8;
          return (
            <g key={i} transform={`translate(${540 + Math.cos(a) * rr},${850 + Math.sin(a) * rr})`} opacity={germ}>
              <P d={circle(0, 0, 24)} fill={C.coral} depth={0.4} />
              {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={circle(Math.cos(k) * 26, Math.sin(k) * 26, 6)} fill={C.coral} />)}
            </g>
          );
        }) : null}
      </g>
      <g opacity={ringOp} transform={`translate(${190},${660 + Math.sin(t * 2) * 5})`}>
        <Buoy label="AUDIRA" w={250} />
      </g>
    </Frame>
  );
};

// ── S10 2018: small boat crosses the ring and fades into ripples ─────────────────
export const S10: React.FC<SceneProps> = ({ t, lt }) => {
  const p = ease(ramp(lt, 0.4, 3.7));
  const bx = lerp(840, 610, p), by = lerp(1380, 1070, p);
  const fade = ease(ramp(lt, 3.9, 5.2));
  const rip = ramp(lt, 3.9, 6.2);
  return (
    <Frame id="s10" bg={["#86CCCB", "#6AB4C0"]}>
      <SeaTop t={t} />
      <g transform={cam(1.28 + lt * 0.02, 560, 900)}>
        <path d={circle(540, 760, 330)} fill={C.foam} opacity={0.14} />
        <g transform="translate(540,760) scale(0.55)"><IslandTop /></g>
        <path d={circle(540, 760, 330)} fill="none" stroke={C.red} strokeWidth={9} strokeDasharray="30 20" strokeDashoffset={-t * 30} />
        {rip > 0 ? [0, 1, 2].map((i) => {
          const k = clampR(rip * 1.4 - i * 0.25);
          return k > 0 ? <path key={i} d={ellipse(bx, by, 20 + k * 120, 14 + k * 80)} fill="none" stroke={C.foam} strokeWidth={5} opacity={(1 - k) * 0.9} /> : null;
        }) : null}
        <g opacity={1 - fade} transform={`translate(${bx},${by}) rotate(-31)`}>
          <path d="M-22,60 L-70,190 M22,60 L70,190" stroke={C.foam} strokeWidth={6} opacity={0.6 * ramp(lt, 0.4, 1)} />
          <Layered draw={(o) => (
            <g>
              <path d="M0,-60 C30,-30 30,40 0,60 C-30,40 -30,-30 0,-60Z" fill={o ?? C.wood} />
              <path d="M0,-40 C16,-20 16,30 0,44 C-16,30 -16,-20 0,-40Z" fill={o ?? "#9C7350"} />
            </g>
          )} />
        </g>
      </g>
    </Frame>
  );
};
const clampR = (v: number) => Math.max(0, Math.min(1, v));

// ── S11 Golden outro ──────────────────────────────────────────────────────────────
export const S11: React.FC<SceneProps> = ({ t, lt }) => {
  const s = 1.1 - ease(ramp(lt, 0, 6)) * 0.1;
  const cols = ["#F0A86A", "#E58A5E", "#C96A52", "#A65446"];
  return (
    <Frame id="s11" bg={[C.coral, C.gold]}>
      <g transform={cam(s, 540, 1050)}>
        <Sun x={540} y={1000} r={150} col="#FFE2A6" />
        {[0, 1].map((i) => (
          <path key={i} d={`M${(200 + i * 500 + lt * (14 + i * 8)) % 1200 - 60},${520 + i * 110} l30,-18 l30,18 l30,-18 l30,18`} stroke="#7A3E36" strokeWidth={6} fill="none" opacity={0.6} />
        ))}
        <g transform="translate(760,1062) scale(0.85)"><IslandSide mono="#8C4A3F" /></g>
        <Sea y={1050} t={t} cols={cols} amp={10} gap={66} />
        <g transform={`translate(300,${1380 + Math.sin(t * 1.8) * 8}) rotate(${Math.sin(t * 1.2) * 2.5})`}>
          <Buoy label="AUDIRA · FAKTA DUNIA" w={500} />
        </g>
      </g>
    </Frame>
  );
};

export const SCENE_MAP: Record<string, React.FC<SceneProps>> = { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 };
