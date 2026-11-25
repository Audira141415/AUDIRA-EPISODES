// EP12 stage: camera helpers, lit sprites with ice reflections, pixel particles, and the themed rink (stands, boards, ice).
import React, { useMemo } from "react";
import { hexToRgb, rgba, type RGB } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { CinematicCamera, Layer, restCamera, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { cameraAt, drift } from "../../kits/pixelstory/camera/path.ts";
import { PixelCanvas } from "../../kits/pixelstory/pixel/PixelCanvas.tsx";
import { PX } from "../../kits/pixelstory/pixel/views.tsx";
import type { Albedo } from "../../kits/pixelstory/environment/albedo.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { KEY0, figure, mixPose, POSE, raster, skaterCaps, type Cap, type FigOpts, type Key, type Kit, type Pose } from "./sprites.ts";
import { boardsTile, iceFloor, ramp, relit, standsTile, TILE, type FloorOpts, type Ramps } from "./sets.ts";
import { clamp } from "./timing.ts";

export type CK = { t: number; e?: (k: number) => number } & Partial<CameraState>;
export const camAt = (t: number, ks: CK[], seed = 1): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), { ...restCamera, aperture: 6 });
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
/** Decaying shake after `at`. */
export const shake = (t: number, at: number, amp = 22, dur = 0.3) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor((k * 60) / 2), f = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * f, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * f };
};

// ---------------------------------------------------------------- sprites
export const Caps: React.FC<{ caps: Cap[]; u: number; x: number; y: number; k?: Key; flip?: boolean; refl?: number; opacity?: number }> = ({ caps, u, x, y, k = KEY0, flip, refl = 0, opacity = 1 }) => {
  const cs = flip ? caps.map((c) => ({ ...c, a: [-c.a[0], c.a[1]] as [number, number], b: [-c.b[0], c.b[1]] as [number, number] })) : caps;
  const img = raster(cs, u, k);
  const left = (Math.round(x) + img.ox) * PX, top = (Math.round(y) + img.oy) * PX;
  return (
    <>
      {refl > 0 ? (
        <div style={{ position: "absolute", left, top: (Math.round(y) - img.oy - img.h) * PX, transform: "scaleY(-1)", opacity: refl, filter: "blur(5px)", maskImage: "linear-gradient(0deg, #000 0%, transparent 72%)" }}>
          <PixelCanvas w={img.w} h={img.h} pixels={img.px} scale={PX} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left, top, opacity }}>
        <PixelCanvas w={img.w} h={img.h} pixels={img.px} scale={PX} />
      </div>
    </>
  );
};
export const Shadow: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.5 }) => (
  <div style={{ position: "absolute", left: (x - w / 2) * PX, top: (y - 3) * PX, width: w * PX, height: 6 * PX, background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(4,10,24,${o}) 0%, rgba(4,10,24,${o * 0.6}) 50%, rgba(4,10,24,0) 100%)` }} />
);
export type SkProps = { p: Pose; kit: Kit; u: number; x: number; y: number; k?: Key; flip?: boolean; refl?: number; opacity?: number; sh?: number };
/** `sh`: ground row for the contact shadow when the body is airborne. */
export const Sk: React.FC<SkProps> = ({ p, kit, u, x, y, refl = 0.34, sh, ...r }) => (
  <>
    <Shadow x={x} y={(sh ?? y) + 1} w={74 * u} />
    <Caps caps={skaterCaps(p, kit)} u={u} x={x} y={y} refl={refl} {...r} />
  </>
);
export const Fig: React.FC<{ o: FigOpts; u: number; x: number; y: number; k?: Key; refl?: number; opacity?: number }> = ({ o, ...r }) => (
  <>
    <Shadow x={r.x} y={r.y} w={44 * r.u} />
    <Caps caps={figure(o)} {...r} />
  </>
);
/** Fall: current pose, trip, thrown, slide. Returns pose and vertical lift (units). */
export const falling = (from: Pose, t: number, t0: number, end: Pose = POSE.slide): { p: Pose; lift: number } => {
  const k = t - t0;
  if (k <= 0) return { p: from, lift: 0 };
  const s = (a: number, b: number) => {
    const x = clamp((k - a) / (b - a));
    return x * x * (3 - 2 * x);
  };
  let p = mixPose(from, POSE.trip, s(0, 0.24));
  p = mixPose(p, end === POSE.prone ? POSE.trip : POSE.fall, s(0.2, 0.5));
  p = mixPose(p, end, s(0.5, 0.95));
  return { p, lift: 16 * Math.sin(Math.PI * clamp(k / 0.62)) + 5 * Math.sin(Math.PI * clamp((k - 0.62) / 0.3)) };
};

// ---------------------------------------------------------------- pixel particles
export type Bit = [number, number, RGB, number, number];
const ICE1: RGB = [240, 252, 255];
const ICE2: RGB = [170, 220, 245];
/** Continuous spray from a blade (deterministic loop). */
export const spray = (t: number, x: number, y: number, dir: number, n = 22, pow = 1, seed = 1): Bit[] =>
  Array.from({ length: n }, (_, i) => {
    const life = 0.34 + hash(i + seed * 7) * 0.3, ph = t / life + hash(i * 3 + seed), c = Math.floor(ph), k = ph - c;
    const vx = dir * (18 + hash(i * 5 + c + seed) * 46) * pow, vy = -(12 + hash(i * 11 + c) * 40) * pow;
    return [x + vx * k * life, y + vy * k * life + 70 * (k * life) ** 2, hash(i + c) > 0.5 ? ICE1 : ICE2, 1 - k * 0.7, hash(i * 9) > 0.8 ? 2 : 1] as Bit;
  });
/** One-shot burst. */
export const burst = (t: number, t0: number, x: number, y: number, n = 60, pow = 1, cols: RGB[] = [ICE1, ICE2], dur = 1.1): Bit[] => {
  const k = t - t0;
  if (k < 0 || k > dur) return [];
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI * (0.06 + 0.88 * hash(i * 3 + 1)), v = (26 + 84 * hash(i * 7 + 2)) * pow;
    return [x + Math.cos(a) * v * k, Math.min(y + 8, y + Math.sin(a) * v * k + 92 * k * k), cols[i % cols.length], 1 - k / dur, hash(i * 13) > 0.6 ? 2 : 1] as Bit;
  });
};
export const confetti = (t: number, t0: number, cols: string[], n = 90): Bit[] =>
  Array.from({ length: n }, (_, i) => {
    const k = t - t0 - hash(i) * 0.7;
    if (k < 0) return [0, -900, ICE1, 0, 1] as Bit;
    return [-30 + hash(i * 3) * 195 + Math.sin(k * 3 + i) * 5, -10 + ((k * (34 + hash(i * 5) * 34)) % 175), hexToRgb(cols[i % cols.length]), Math.sin(k * 9 + i) > -0.3 ? 1 : 0.45, hash(i * 7) > 0.5 ? 2 : 1] as Bit;
  });
export const snow = (t: number, n = 90): Bit[] =>
  Array.from({ length: n }, (_, i) => [((((hash(i) * 220 + Math.sin(t * 0.9 + i) * 6 + t * 7) % 220) + 220) % 220) - 45, ((hash(i * 3) * 250 + t * (14 + hash(i * 5) * 16)) % 250) - 10, [235, 240, 255], 0.35 + hash(i * 7) * 0.6, hash(i * 11) > 0.75 ? 2 : 1] as Bit);
/** Wind streaks behind fast skaters. */
export const streaks = (t: number, y0: number, y1: number, dir = -1, n = 14): Bit[] => {
  const out: Bit[] = [];
  for (let i = 0; i < n; i++) {
    const sp = 170 + hash(i) * 190, len = 10 + Math.floor(hash(i * 3) * 18);
    const x = (((hash(i * 5) * 300 + dir * t * sp) % 300) + 300) % 300 - 80, y = y0 + hash(i * 7) * (y1 - y0);
    for (let j = 0; j < len; j++) out.push([x + j, y, ICE1, 0.28 * (j / len), 1]);
  }
  return out;
};
const BW = 240, BH = 290, BX = -52, BY = -30;
export const Bits: React.FC<{ b: Bit[] }> = ({ b }) => {
  const px = new Uint8ClampedArray(BW * BH * 4);
  for (const [x, y, c, a, s] of b)
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const X = Math.round(x) - BX + i, Y = Math.round(y) - BY + j;
        if (X < 0 || Y < 0 || X >= BW || Y >= BH) continue;
        const o = (Y * BW + X) * 4;
        px[o] = c[0];
        px[o + 1] = c[1];
        px[o + 2] = c[2];
        px[o + 3] = Math.max(px[o + 3], 255 * a);
      }
  return (
    <div style={{ position: "absolute", left: BX * PX, top: BY * PX, pointerEvents: "none" }}>
      <PixelCanvas w={BW} h={BH} pixels={px} scale={PX} />
    </div>
  );
};

// ---------------------------------------------------------------- static sets
export const Rel: React.FC<{ a: Albedo; id: string; lights?: Light[]; amb: number; over: Ramps; dither?: number; x?: number }> = ({ a, id, lights = [], amb, over, dither, x = 0 }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const px = useMemo(() => relit(a, lights, amb, over, dither), [a, id, amb]);
  return (
    <div style={{ position: "absolute", left: (a.ox + x) * PX, top: a.oy * PX }}>
      <PixelCanvas w={a.w} h={a.h} pixels={px} scale={PX} />
    </div>
  );
};
/** A 180 px tile repeated across the frame and scrolled (unsnapped so slow pans stay smooth). */
export const Tiled: React.FC<{ a: Albedo; id: string; amb: number; over: Ramps; scroll: number; children?: React.ReactNode }> = ({ a, id, amb, over, scroll, children }) => {
  const off = (((scroll % TILE) + TILE) % TILE) * PX;
  return (
    <div style={{ position: "absolute", left: -TILE * PX - off, top: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * TILE * PX, top: 0 }}>
          <Rel a={a} id={id} amb={amb} over={over} />
          {children}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- themed rink
export type Theme = { id: string; over: Ramps; ice: RGB[]; board: RGB; key: Key; stands: number; boardsAmb: number; fog: string; shadow: string; vign: number };
const skin = ramp("#1a0d0a", "#6a4232", "#c08a68", "#f0c8a4");
const steel = ramp("#05070c", "#1c2836", "#5a6e84", "#dceaf6");
type ThemeIn = { sky: string[]; seat: string[]; c1: string[]; c2: string[]; c3: string[]; pad1: string[]; pad2: string[]; ice: string[]; lamp?: string[]; board: string; key?: Partial<Key>; stands?: number; boards?: number; fog: string; shadow: string; vign?: number };
export const theme = (id: string, c: ThemeIn): Theme => ({
  id,
  over: { sky: ramp(...c.sky), stone: ramp(...c.seat), book1: ramp(...c.c1), plaster: ramp(...c.c2), teal: ramp(...c.c3), leaf: skin, metal: steel, frame: ramp(...c.pad1), paper: ramp(...c.pad2), ivoryLit: ramp(...(c.lamp ?? ["#10141c", "#6a7c90", "#e8f4ff", "#ffffff"])) },
  ice: ramp(...c.ice),
  board: hexToRgb(c.board),
  key: { ...KEY0, ...(c.key ?? {}) },
  stands: c.stands ?? 0.8,
  boardsAmb: c.boards ?? 1,
  fog: c.fog,
  shadow: c.shadow,
  vign: c.vign ?? 0.8,
});

export type RinkProps = {
  th: Theme;
  cam: CameraState;
  scroll: number;
  t: number;
  stands?: { seed: number; crowd: number; top?: number; bot?: number; cheer?: number; windows?: boolean; lamps?: number[] };
  boards?: [number, number];
  hor?: number;
  seg?: number;
  floor?: Partial<FloorOpts>;
  far?: React.ReactNode;
  fg?: React.ReactNode;
  flash?: number;
  text?: string;
  children?: React.ReactNode;
};
const cache = new Map<string, Albedo>();
const memo = (k: string, f: () => Albedo) => {
  let v = cache.get(k);
  if (!v) {
    v = f();
    cache.set(k, v);
  }
  return v;
};
const FX0 = -48, FW = 232;
export const Rink: React.FC<RinkProps> = ({ th, cam, scroll, t, stands = { seed: 1, crowd: 0.86 }, boards = [98, 118], hor = 70, seg = 30, floor, far, fg, flash = 0, text = "AUDIRA SPORT FACTS", children }) => {
  const st = { top: 34, bot: 118, ...stands };
  const sk = JSON.stringify(st);
  const S = memo("s" + sk, () => standsTile(st));
  const B = memo(`b${boards}${seg}`, () => boardsTile(boards[0], boards[1], seg));
  const d = (boards[1] - hor) / (152 - hor);
  const fo: FloorOpts = { x0: FX0, w: FW, y0: boards[1], y1: 268, hor, ice: th.ice, board: th.board, ...floor };
  const px = iceFloor(fo, scroll);
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={4}>
        <Tiled a={S} id={th.id + sk} amb={th.stands} over={th.over} scroll={scroll * d * 0.62} />
        {flash > 0
          ? Array.from({ length: 12 }, (_, i) => {
              const ph = t * 1.7 + hash(i * 3) * 4, c = Math.floor(ph);
              if (ph - c > 0.16) return null;
              const x = hash(i * 7 + c) * 1080, y = (st.top + 6 + hash(i * 11 + c) * (boards[0] - st.top - 14)) * PX;
              return <div key={i} style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(220,240,255,0.5) 22%, rgba(220,240,255,0) 68%)", opacity: flash, mixBlendMode: "screen" }} />;
            })
          : null}
        {far}
        <div style={{ position: "absolute", left: -400, right: -400, top: st.top * PX, height: (boards[0] - st.top) * PX, background: `linear-gradient(180deg, ${rgba(th.fog, 0)} 0%, ${rgba(th.fog, 0.42)} 100%)`, mixBlendMode: "screen" }} />
      </Layer>
      <Layer z={1000}>
        <div style={{ position: "absolute", left: FX0 * PX, top: boards[1] * PX }}>
          <PixelCanvas w={FW} h={fo.y1 - fo.y0} pixels={px} scale={PX} />
        </div>
        <Tiled a={B} id={th.id + boards} amb={th.boardsAmb} over={th.over} scroll={scroll * d}>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: 60 + i * 720, top: (boards[0] + (boards[1] - boards[0]) * 0.28) * PX, fontFamily: FONT.pixel, fontSize: Math.min(56, (boards[1] - boards[0]) * 3.2), fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.8)", whiteSpace: "pre" }}>{text}</div>
          ))}
        </Tiled>
        {children}
      </Layer>
      <Layer z={620} maxBlur={12}>{fg}</Layer>
    </CinematicCamera>
  );
};

// ---------------------------------------------------------------- foregrounds (locked at y 1530) and light
export const FgRail: React.FC<{ c?: string; hi?: string; y?: number }> = ({ c = "#04101e", hi = "rgba(190,230,255,0.75)", y = 1560 }) => (
  <div style={{ position: "absolute", left: -500, right: -500, top: y, height: 900, background: `linear-gradient(180deg, ${hi} 0px, ${hi} 14px, ${rgba(c, 0.92)} 15px, ${rgba(c, 0.8)} 120px, ${rgba(c, 1)} 420px)` }} />
);
export const FgHeads: React.FC<{ t: number; c?: string; rim?: string; cheer?: boolean; y?: number }> = ({ t, c = "#070a14", rim = "rgba(255,220,150,0.55)", cheer, y = 1640 }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const x = -260 + i * 190 + hash(i) * 50, by = y + hash(i * 3) * 60 + (cheer ? -18 * Math.abs(Math.sin(t * 5 + i)) : -5 * Math.sin(t * 1.4 + i));
      return (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: x, top: by, width: 130, height: 150, borderRadius: "50%", background: c, boxShadow: `inset 0 10px 0 ${rim}` }} />
          <div style={{ position: "absolute", left: x - 50, top: by + 110, width: 230, height: 620, borderRadius: "90px 90px 0 0", background: c, boxShadow: `inset 0 10px 0 ${rim}` }} />
          {cheer && i % 2 ? <div style={{ position: "absolute", left: x + 140, top: by - 120, width: 44, height: 320, borderRadius: 30, background: c, transform: `rotate(${12 + 10 * Math.sin(t * 6 + i)}deg)`, boxShadow: `inset 0 8px 0 ${rim}` }} /> : null}
        </React.Fragment>
      );
    })}
  </>
);
/** Screen-space key pool: darkens everything outside an ellipse (multiply). */
export const Pool: React.FC<{ x: number; y: number; rx: number; ry: number; c: string; k?: number }> = ({ x, y, rx, ry, c, k = 1 }) => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 35%, ${c} 100%)`, mixBlendMode: "multiply", opacity: k, pointerEvents: "none" }} />
);
export const Beam: React.FC<{ x: number; w: number; c: string; o: number; rot?: number; h?: number }> = ({ x, w, c, o, rot = 0, h = 1250 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: -60, width: w, height: h, clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", background: `linear-gradient(180deg, ${rgba(c, o)} 0%, ${rgba(c, o * 0.35)} 60%, ${rgba(c, 0)} 100%)`, filter: "blur(14px)", transform: `rotate(${rot}deg)`, transformOrigin: "50% 0", mixBlendMode: "screen", pointerEvents: "none" }} />
);
