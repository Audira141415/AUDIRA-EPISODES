// Storybook HUD for EP043: paper tags, karaoke caption strip, paper dial gauge.
import React from "react";
import { C } from "../Cover.tsx";
import { TL, backOut, clamp01, ramp } from "./util.ts";

const SERIF = "Georgia, 'Palatino Linotype', serif";

/** Torn-paper label pinned in screen space, with an optional pencil leader to a screen point. */
export const Tag: React.FC<{
  t: number;
  at: number;
  until?: number;
  x: number;
  y: number;
  text: string;
  sub?: string;
  anchor?: [number, number];
  size?: number;
  tilt?: number;
  accent?: string;
  cross?: boolean;
}> = ({ t, at, until, x, y, text, sub, anchor, size = 44, tilt = -1.5, accent = C.ochre, cross }) => {
  if (t < at) return null;
  const a = backOut((t - at) / 0.45);
  const out = until !== undefined ? 1 - ramp(t, until, until + 0.3) : 1;
  if (out <= 0) return null;
  const subSize = Math.max(30, Math.round(size * 0.7));
  const w = Math.max(text.length * size * 0.5, (sub?.length ?? 0) * subSize * 0.54) + 56;
  const h = size * 1.25 + (sub ? subSize * 1.3 : 0) + 26;
  const lead = clamp01((t - at - 0.15) / 0.4);
  return (
    <g opacity={clamp01(a * 3) * out}>
      {anchor && (
        <g filter="url(#pencil)">
          <path
            d={`M${x},${y + h / 2 - 6} L${x + (anchor[0] - x) * lead},${y + h / 2 - 6 + (anchor[1] - y - h / 2 + 6) * lead}`}
            stroke={C.graphite}
            strokeWidth={3}
            fill="none"
            strokeDasharray="10 7"
          />
          {lead >= 1 && <circle cx={anchor[0]} cy={anchor[1]} r={9} fill={accent} stroke={C.graphite} strokeWidth={2.5} />}
        </g>
      )}
      <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${0.6 + 0.4 * a})`}>
        <rect x={-w / 2 + 6} y={-h / 2 + 9} width={w} height={h} fill="#4a3424" opacity={0.22} filter="url(#blur6)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#FBF5EA" filter="url(#wcFine)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={C.graphite} strokeWidth={2} opacity={0.5} filter="url(#pencil)" />
        <rect x={-w / 2 + 14} y={-h / 2 - 8} width={70} height={22} fill={accent} opacity={0.7} transform="rotate(-4)" filter="url(#wcFine)" />
        <text
          x={0}
          y={-h / 2 + 13 + size}
          textAnchor="middle"
          fontFamily={SERIF}
          fontStyle="italic"
          fontWeight={700}
          fontSize={size}
          fill="#2C2723"
        >
          {text}
        </text>
        {sub && (
          <text x={0} y={-h / 2 + 13 + size + subSize * 1.35} textAnchor="middle" fontFamily={SERIF} fontSize={subSize} fontWeight={700} fill="#4A3020">
            {sub}
          </text>
        )}
        {cross && (
          <g filter="url(#wcFine)" stroke={C.chili} strokeWidth={10} strokeLinecap="round" opacity={clamp01((t - at - 0.3) / 0.3)}>
            <line x1={-w / 2 - 10} y1={-h / 2 - 6} x2={w / 2 + 10} y2={h / 2 + 6} />
          </g>
        )}
      </g>
    </g>
  );
};

/** Paper dial gauge (watercolour). value 0..1 sweeps the needle left to right. */
export const Dial: React.FC<{ x: number; y: number; r: number; value: number; labels: string[]; title: string; danger?: number }> = ({
  x,
  y,
  r,
  value,
  labels,
  title,
  danger = 0.75,
}) => {
  const ang = (v: number) => Math.PI + v * Math.PI;
  const pt = (v: number, rr: number) => [x + Math.cos(ang(v)) * rr, y + Math.sin(ang(v)) * rr];
  const [nx, ny] = pt(value, r * 0.82);
  const [dx0, dy0] = pt(danger, r * 0.9);
  const [dx1, dy1] = pt(1, r * 0.9);
  return (
    <g>
      <path d={`M${x - r - 30},${y + 40} A${r + 30},${r + 30} 0 0 1 ${x + r + 30},${y + 40} Z`} fill="#4a3424" opacity={0.2} filter="url(#blur6)" />
      <path d={`M${x - r - 24},${y + 30} A${r + 24},${r + 24} 0 0 1 ${x + r + 24},${y + 30} Z`} fill="#FBF5EA" filter="url(#wcSoft)" />
      <path d={`M${dx0},${dy0} A${r * 0.9},${r * 0.9} 0 0 1 ${dx1},${dy1}`} stroke={C.river} strokeWidth={26} fill="none" opacity={0.85} filter="url(#wcFine)" />
      <path d={`M${x - r * 0.9},${y} A${r * 0.9},${r * 0.9} 0 0 1 ${dx0},${dy0}`} stroke={C.clear} strokeWidth={26} fill="none" opacity={0.85} filter="url(#wcFine)" />
      {labels.map((l, i) => {
        const v = i / (labels.length - 1);
        const [lx, ly] = pt(v, r * 0.62);
        const [t0x, t0y] = pt(v, r * 0.78);
        const [t1x, t1y] = pt(v, r * 1.0);
        return (
          <g key={i}>
            <line x1={t0x} y1={t0y} x2={t1x} y2={t1y} stroke={C.graphite} strokeWidth={3} filter="url(#pencil)" />
            <text x={lx} y={ly + 10} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} fill="#2C2723">
              {l}
            </text>
          </g>
        );
      })}
      <line x1={x} y1={y} x2={nx} y2={ny} stroke={C.chili} strokeWidth={9} strokeLinecap="round" filter="url(#wcFine)" />
      <circle cx={x} cy={y} r={16} fill={C.graphite} />
      <text x={x} y={y + 74} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={36} fill="#2C2723">
        {title}
      </text>
    </g>
  );
};

// --- karaoke captions --------------------------------------------------------------------
type W = { w: string; s: number; e: number };
type Chunk = { words: W[]; from: number; to: number };

const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  TL.clips.forEach((clip, ci) => {
    const ws = clip.words as W[];
    let cur: W[] = [];
    const groups: W[][] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.:?!]$/.test(w.w);
      const left = ws.length - 1 - i;
      if ((cur.length >= 5 || (punct && cur.length >= 2)) && left !== 1) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) groups.push(cur);
    const nextClip = TL.clips[ci + 1];
    groups.forEach((g, gi) => {
      const from = g[0].s - 0.08;
      const to = gi < groups.length - 1 ? groups[gi + 1][0].s - 0.08 : Math.min(clip.end + 0.3, nextClip ? nextClip.start - 0.08 : clip.end + 0.6);
      out.push({ words: g, from, to });
    });
  });
  return out;
})();

export const Captions: React.FC<{ t: number; hideAfter: number }> = ({ t, hideAfter }) => {
  if (t >= hideAfter) return null;
  const ch = CHUNKS.find((c) => t >= c.from && t < c.to);
  if (!ch) return null;
  const inA = clamp01((t - ch.from) / 0.18);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 410,
        display: "flex",
        justifyContent: "center",
        opacity: inA,
        transform: `translateY(${(1 - inA) * 14}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(251,245,234,0.95)",
          padding: "16px 30px 20px",
          borderRadius: "6px 14px 8px 12px",
          boxShadow: "0 10px 24px rgba(74,52,36,0.25)",
          border: "2px solid rgba(60,55,51,0.35)",
          transform: "rotate(-0.8deg)",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.18,
          color: "#2C2723",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 900,
        }}
      >
        {ch.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < (ch.words[i + 1]?.s ?? ch.to) - 0.03;
          const said = t >= w.s - 0.03;
          const b = active ? backOut((t - w.s + 0.03) / 0.22) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 10px",
                color: active ? "#8A5530" : said ? "#2C2723" : "rgba(44,39,35,0.55)",
                transform: active ? `translateY(${-8 * (1 - Math.abs(1 - b)) * (b < 1.05 ? 1 : 1)}px) scale(${0.94 + 0.12 * Math.min(b, 1.1)})` : "none",
                backgroundImage: active ? "linear-gradient(transparent 62%, rgba(232,171,72,0.6) 62%, rgba(232,171,72,0.6) 92%, transparent 92%)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
