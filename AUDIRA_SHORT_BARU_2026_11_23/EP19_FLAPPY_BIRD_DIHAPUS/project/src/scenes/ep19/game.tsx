// EP19 in-phone game: an ORIGINAL pixel bird (round, orange-red, cream wing) flying between brick towers with
// neon lips on a teal sky. Deliberately unlike the original game's look (no green pipes, no yellow bird, no
// city skyline, no logo). Drawn as crisp SVG pixel grids so it scales to any screen size.
import React from "react";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";

/** Crisp pixel art from ASCII rows ('.' = transparent). */
export const Pix: React.FC<{ rows: string[]; pal: Record<string, string>; cell: number; style?: React.CSSProperties }> = ({ rows, pal, cell, style }) => {
  const w = Math.max(...rows.map((r) => r.length));
  const rects: React.ReactNode[] = [];
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const c = r[x];
      if (c === "." || !pal[c]) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={pal[c]} />);
    }
  });
  return (
    <svg width={w * cell} height={rows.length * cell} viewBox={`0 0 ${w} ${rows.length}`} shapeRendering="crispEdges" style={{ display: "block", ...style }}>
      {rects}
    </svg>
  );
};

export const BIRD_PAL = { k: "#3A0A10", o: "#F27A2E", r: "#D02A30", y: "#FFD23F", w: "#FFFFFF", b: "#1A0A0E", c: "#FFE9C4", s: "#C85A22" };
const BIRD_BODY = [
  "....kkkkkk......",
  "..kkooooookk....",
  ".kooooooowwwk...",
  "kooooooowwwbwk..",
  "kooooooowwwbwk..",
  "kroooooooowwwkkk",
  "krroooooookyyyyk",
  "krrrooooookkyyk.",
  ".krrrrooooooykk.",
  "..kkrrrrsssskk..",
  "....kkkkkkkk....",
];
const WING_UP = ["kkkk..", "kcccck", ".kccck", "..kkk."];
const WING_DN = ["..kkk.", ".kccck", "kcccck", "kkkk.."];
const BIRD_SLEEP = [
  "....kkkkkk......",
  "..kkooooookk....",
  ".kooooooooook...",
  "kooooooookkkk...",
  "koooooooooooo...",
  "kroooooooooookkk",
  "krroooooookyyyyk",
  "krrrooooookkyyk.",
  ".krrrrooooooykk.",
  "..kkrrrrsssskk..",
  "....kkkkkkkk....",
];

/** The bird, `cell` screen px per art px. `flap` 0/1 picks the wing frame; `tilt` degrees. */
export const Bird: React.FC<{ cell: number; flap: number; tilt?: number; sleep?: boolean }> = ({ cell, flap, tilt = 0, sleep = false }) => (
  <div style={{ position: "relative", width: 16 * cell, height: 11 * cell, transform: `rotate(${tilt}deg)` }}>
    <Pix rows={sleep ? BIRD_SLEEP : BIRD_BODY} pal={BIRD_PAL} cell={cell} />
    {!sleep && <Pix rows={flap ? WING_UP : WING_DN} pal={BIRD_PAL} cell={cell} style={{ position: "absolute", left: 1 * cell, top: (flap ? 3 : 5) * cell }} />}
  </div>
);

export const BRICK = "#B4552E";
export const BRICK_DARK = "#6E2A18";
export const NEON = "#7CF7E4";
export const SKY_TOP = "#1F6B66";
export const SKY_BOT = "#3FB7A8";

const brick = (cell: number): React.CSSProperties => ({
  backgroundColor: BRICK,
  backgroundImage: `linear-gradient(${BRICK_DARK} ${cell}px, transparent ${cell}px), linear-gradient(90deg, ${BRICK_DARK} ${cell}px, transparent ${cell}px)`,
  backgroundSize: `${cell * 8}px ${cell * 5}px, ${cell * 8}px ${cell * 10}px`,
  boxShadow: `inset ${cell}px 0 0 ${BRICK_DARK}, inset -${cell}px 0 0 ${BRICK_DARK}`,
});

/**
 * The game screen, w × h screen px. Time `t` scrolls towers left; the bird sits at 30% width and follows the
 * centre of the next gap, plus a hop on every `taps` time. `score` overrides the counter; `dead` blacks it out.
 */
export const GameView: React.FC<{
  w: number;
  h: number;
  cell: number;
  t: number;
  speed?: number;
  score?: string | null;
  taps?: number[];
  off?: number;
  brand?: boolean;
}> = ({ w, h, cell, t, speed = 1, score = null, taps = [], off = 0, brand = true }) => {
  const gapW = 34 * cell;
  const gapH = 0.3 * h;
  const spacing = 0.62 * w;
  const scroll = t * speed * 0.42 * w;
  const towers: React.ReactNode[] = [];
  const first = Math.floor(scroll / spacing);
  const gapY = (i: number) => 0.24 * h + hash(i * 13 + 5) * 0.34 * h;
  for (let i = first; i < first + 4; i++) {
    const x = i * spacing - scroll + 0.55 * w;
    if (x > w || x + gapW < 0) continue;
    const gy = gapY(i);
    towers.push(
      <React.Fragment key={i}>
        <div style={{ position: "absolute", left: x, top: 0, width: gapW, height: gy, ...brick(cell) }} />
        <div style={{ position: "absolute", left: x - cell * 2, top: gy - cell * 3, width: gapW + cell * 4, height: cell * 3, background: NEON, boxShadow: `0 0 ${cell * 3}px ${NEON}` }} />
        <div style={{ position: "absolute", left: x, top: gy + gapH, width: gapW, height: h - gy - gapH, ...brick(cell) }} />
        <div style={{ position: "absolute", left: x - cell * 2, top: gy + gapH, width: gapW + cell * 4, height: cell * 3, background: NEON, boxShadow: `0 0 ${cell * 3}px ${NEON}` }} />
      </React.Fragment>,
    );
  }
  // bird follows the gap the towers bring to its x
  const bx = 0.3 * w;
  const iNext = Math.floor((scroll + bx - 0.55 * w + gapW) / spacing);
  const target = gapY(iNext) + gapH / 2;
  const prev = gapY(iNext - 1) + gapH / 2;
  const u = ((scroll + bx - 0.55 * w + gapW) / spacing) - iNext;
  const by0 = prev + (target - prev) * Math.min(1, u * 1.6);
  const last = taps.filter((a) => a <= t).pop();
  const hop = last !== undefined ? Math.sin(Math.min(1, (t - last) / 0.45) * Math.PI) * -0.07 * h : 0;
  const by = by0 + hop + Math.sin(t * 5) * cell * 1.5;
  const flap = Math.floor(t * 10) % 2;
  const tilt = last !== undefined && t - last < 0.3 ? -18 : 8 * Math.sin(t * 2);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden", background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_BOT} 100%)` }}>
      {/* pixel clouds, slow parallax */}
      {[0, 1, 2, 3].map((i) => {
        const cx = (((i * 0.37 + 0.1) * w - t * speed * 0.08 * w) % (w * 1.3) + w * 1.3) % (w * 1.3) - w * 0.15;
        const cy = (0.08 + hash(i * 7) * 0.5) * h;
        return (
          <div key={i} style={{ position: "absolute", left: cx, top: cy, width: cell * 22, height: cell * 6, background: "#BFF5EC", opacity: 0.55, boxShadow: `${cell * 5}px -${cell * 3}px 0 0 rgba(191,245,236,0.55)` }} />
        );
      })}
      {/* far stepped mesas, slow parallax (depth behind the towers) */}
      {Array.from({ length: 7 }, (_, i) => {
        const mw = (0.22 + hash(i * 5 + 1) * 0.18) * w;
        const mh = (0.1 + hash(i * 11 + 2) * 0.16) * h;
        const mx = ((((i * 0.19) * w * 1.4 - t * speed * 0.05 * w) % (w * 1.4)) + w * 1.4) % (w * 1.4) - w * 0.2;
        return (
          <React.Fragment key={`m${i}`}>
            <div style={{ position: "absolute", left: mx, bottom: cell * 14, width: mw, height: mh, background: "#2F8A80", opacity: 0.55 }} />
            <div style={{ position: "absolute", left: mx + mw * 0.2, bottom: cell * 14 + mh, width: mw * 0.6, height: cell * 6, background: "#2F8A80", opacity: 0.55 }} />
          </React.Fragment>
        );
      })}
      {towers}
      {/* ground: brick earth with neon edge, scrolls with the towers */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: cell * 14, ...brick(cell), backgroundPositionX: -scroll, borderTop: `${cell * 2}px solid ${NEON}`, boxShadow: `0 -${cell * 2}px ${cell * 4}px ${NEON}`, filter: "brightness(0.7)" }} />
      <div style={{ position: "absolute", left: bx - 8 * cell, top: by - 5.5 * cell }}>
        <Bird cell={cell} flap={flap} tilt={tilt} />
      </div>
      {score !== null ? (
        <div style={{ position: "absolute", top: 0.06 * h, left: 0, right: 0, textAlign: "center", fontFamily: FONT.pixel, fontSize: Math.max(18, cell * 9), color: "#FFFFFF", textShadow: `${cell}px ${cell}px 0 #0D0809` }}>{score}</div>
      ) : null}
      {brand ? (
        <div style={{ position: "absolute", bottom: cell * 1.5, left: cell * 2, fontFamily: FONT.pixel, fontSize: Math.max(12, cell * 3.2), color: NEON, letterSpacing: "0.1em" }}>AUDIRA</div>
      ) : null}
      {off > 0 ? <div style={{ position: "absolute", inset: 0, background: "#050304", opacity: off }} /> : null}
    </div>
  );
};
