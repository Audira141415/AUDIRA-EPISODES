// EP22 film "Demam Tamagotchi 1996" (PIXELSTORY, AUDIRA TECH). Every cut on a VO word:
//   A hook bedroom night (kid cries, LCD ghost+grave, AUDIRA sticker) · B toy shop 1996 · C inside the LCD
//   D classroom (40 juta, BIP, DILARANG) · D2 pet cemetery (jeda, penitip) · E1 Ig Nobel stage · E2 warehouse (rugi)
//   F office today (efek Tamagotchi, 98 juta+) · OUT bedroom by day (CTA + follow card; AUDIRA card in Root)
// Device, creature and icons are our own drawings. No Bandai logo, no official characters. People are generic sprites.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { ease } from "../../kits/pixelstory/core/motion.ts";
import { CinematicCamera, FOCAL, Layer, SCREEN, useCamera, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { cameraAt, drift } from "../../kits/pixelstory/camera/path.ts";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import { finish } from "../../kits/pixelstory/pixel/finish.ts";
import type { Palette, Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { Exposure, Glow, Grade, Grain, LightShaft, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import channel from "../../brand/channel.json";
import { BED, bedroom, CEM, CLASS, classroom, OFF, office, petCemetery, SHOP, stage, STG, toyShop, WH, warehouse } from "./sets.ts";
import {
  CROWD_PALS, HEAD_ANCHOR, headBack, KID_BACK_ANCHOR, KID_HANDS, KID_PAL, KID_SIDE_ANCHOR, kidBack, kidSide, OFFICE_PAL,
  person, PERSON_ANCHOR, PERSON_HAND, PUPIL_PALS, SPEC, SUIT_PAL,
} from "./sprites.ts";
import { ACCENT, Captions, Chip, Disclaimer, NameCard, Pop, Stamp, VIOLET, Wipe } from "./hud.tsx";
import { CUT, FLASHES, OUTRO_AT, T, TOTAL, clamp, lerp, sceneAt, seg, win } from "./timing.ts";

export type LitLight = Light & { color?: string };
export const REST: CameraState = { x: 0, y: 0, z: 0, roll: 0, focus: 1000, aperture: 6 };

// Foreground band locked to the bottom of the frame: whatever the dolly does, the top of the near
// albedo (art row `top`) lands at screen y `at` (just under the caption band), so the lower frame
// is never an empty dark strip. Horizontal parallax and scale still follow the camera.
// Warm bounce from below for the foreground band (scene lights sit around art row 120 and fall off before row 190).
const nearFill = <L,>(lights: L[], color: string): L[] => [...lights, { kind: "point", x: 68, y: 206, r: 150, i: 0.95, color } as unknown as L];
const NEAR_Z = 640;
const NearLayer: React.FC<{ top: number; at?: number; maxBlur?: number; children: React.ReactNode }> = ({ top, at = 1530, maxBlur = 5, children }) => {
  const cam = useCamera();
  const dz = NEAR_Z - cam.z;
  if (dz < 24) return null;
  const s = NEAR_Z / dz;
  const tY = -cam.y * (FOCAL / dz);
  const p0 = top * PX;
  const d = (at - SCREEN.cy - tY) / s - p0 + SCREEN.cy;
  return (
    <Layer z={NEAR_Z} maxBlur={maxBlur}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${d.toFixed(1)}px)` }}>{children}</div>
    </Layer>
  );
};
const RED = "#E0484E";
const LCD_BG = "#9BBC0F";
const LCD_OFF = "#8BAC0F";
const LCD_INK = "#0F380F";
const SHELL = { pink: "#E8708A", teal: "#3FB7A8", yellow: "#F2C14E", violet: "#9B7BFF" };

const once = <X,>(make: () => X) => {
  let v: X | undefined;
  return () => (v ??= make());
};
const BED_SET = once(bedroom);
const SHOP_SET = once(toyShop);
const CLASS_SET = once(classroom);
const CEM_SET = once(petCemetery);
const STG_SET = once(stage);
const WH_SET = once(warehouse);
const OFF_SET = once(office);
const SPR = once(() => {
  const f = (s: Sprite) => finish(s, SPEC);
  return { kid: f(kidSide()), pupil: f(kidBack()), head: f(headBack()), person: f(person()) };
});

type Key = { t: number; e?: (k: number) => number } & Partial<CameraState>;
const camAt = (t: number, ks: Key[], seed = 1, base: CameraState = REST): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), base);
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
const aim = (ax: number, ay: number) => ({ x: ax * PX - SCREEN.cx, y: ay * PX - SCREEN.cy });
const shake = (t: number, at: number, amp = 18, dur = 0.16) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor((k * 60) / 2);
  const fall = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * fall, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * fall };
};
const withShake = (c: CameraState, s: { x: number; y: number }): CameraState => ({ ...c, x: c.x + s.x, y: c.y + s.y });
const pixLabel: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
const at = (x: number, y: number, w: number, h: number): React.CSSProperties => ({ position: "absolute", left: x * PX, top: y * PX, width: w * PX, height: h * PX });

const Lit: React.FC<{ s: Sprite; pal: Palette; x: number; y: number; lights: LitLight[]; ambient: number; flip?: boolean; scale?: number; anchor?: { x: number; y: number }; rim?: string }> = ({
  s, pal, x, y, lights, ambient, flip, scale, anchor, rim = "#CFE0FF",
}) => (
  <SpriteView
    sprite={s}
    pal={pal}
    anchor={anchor ?? { x: Math.floor(s.w / 2), y: s.h - 1 }}
    x={x}
    y={y}
    flip={flip}
    scale={scale}
    lights={[...spriteLightsAt(lights, x, y - 20, { rim: 1, core: 0.3, width: 1 }), { dir: [1, -0.6] as [number, number], color: rim, rim: 0.95, core: 0, width: 1 }, { dir: [-1, -0.4] as [number, number], color: rim, rim: 0.5, core: 0, width: 1 }]}
    gain={spriteGainAt(lights, x, y - 20, ambient)}
  />
);

// ================================================================= LCD: 32 × 24 dot matrix, our own glyphs
const GL = {
  egg: ["...###...", "..#...#..", ".#.....#.", ".#..#..#.", "#.......#", "#..#....#", "#.....#.#", "#.......#", ".#.....#.", "..#...#..", "...###..."],
  shellL: ["#..", "##.", "#.#", "###"],
  shellR: ["..#", ".##", "#.#", "###"],
  blob: ["..######..", ".#......#.", "#..#..#..#", "#..#..#..#", "#........#", "#..####..#", ".#......#.", "..######..", ".#.#..#.#."],
  blobO: ["..######..", ".#......#.", "#..#..#..#", "#..#..#..#", "#...##...#", "#..#..#..#", ".#..##..#.", "..######..", ".#.#..#.#."],
  blobX: ["..######..", ".#......#.", "#.#.#.#.##", "#..#...#.#", "#.#.#.#.##", "#........#", ".#.####.#.", "..######..", ".#.#..#.#."],
  dead: ["..........", "..........", "..........", "..........", "..######..", ".#.#..#.#.", "#.#.##.#.#", "#........#", "##########"],
  food: ["..#..", ".###.", "#####", "#...#", "#####"],
  poop: ["..#..", ".##..", ".###.", "#####"],
  stink: ["#...#", ".#.#.", "#...#"],
  skull: [".###.", "#.#.#", "#####", ".#.#."],
  med: ["..#..", "..#..", "#####", "..#..", "..#.."],
  broom: ["#", "#", "#", "#", "#"],
  clock: ["..###..", ".#...#.", "#..#..#", "#..##.#", "#.....#", ".#...#.", "..###.."],
  ghost: ["..#####..", ".#.....#.", "#..#.#..#", "#.......#", "#..###..#", "#.......#", "#.......#", "#.......#", "#.#.#.#.#", ".#.#.#.#."],
  grave: ["..####..", ".#....#.", "#......#", "#..##..#", "#.####.#", "#..##..#", "#..##..#", "#......#", "########", "########"],
  halo: [".####.", "#....#", ".####."],
  wing: ["..#", ".##", "###", "##."],
  wing2: ["...", "###", ".##", "..#"],
  pause: ["##.##", "##.##", "##.##", "##.##", "##.##", "##.##"],
  sitter: [".###.", ".###.", "..#..", "#####", "..#..", "..#..", ".#.#.", "#...#"],
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  ground: ["################################"],
};
type Glyph = keyof typeof GL;
export type Pl = { g: Glyph; x: number; y: number; flip?: boolean };

export const Lcd: React.FC<{ cells: Pl[]; w: number; h: number }> = ({ cells, w, h }) => {
  const on: [number, number][] = [];
  for (const c of cells) {
    GL[c.g].forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) {
        if (row[xx] !== "#") continue;
        const x = c.x + (c.flip ? row.length - 1 - xx : xx);
        const y = c.y + yy;
        if (x >= 0 && x < 32 && y >= 0 && y < 24) on.push([x, y]);
      }
    });
  }
  return (
    <svg width={w} height={h} viewBox="0 0 32 24" shapeRendering="crispEdges" style={{ display: "block", background: LCD_BG }}>
      <defs>
        <pattern id="lcdoff" width={1} height={1} patternUnits="userSpaceOnUse">
          <rect x={0.08} y={0.08} width={0.84} height={0.84} fill={LCD_OFF} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={32} height={24} fill="url(#lcdoff)" />
      {on.map(([x, y], i) => <rect key={`s${i}`} x={x + 0.16} y={y + 0.16} width={0.88} height={0.88} fill={LCD_INK} opacity={0.22} />)}
      {on.map(([x, y], i) => <rect key={i} x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} fill={LCD_INK} />)}
    </svg>
  );
};

const G0: Pl = { g: "ground", x: 0, y: 23 };
const bounce = (t: number) => ({ x: 11 + Math.round(3 * Math.sin(t * 1.7)), y: 13 + (Math.floor(t * 3) % 2) });
export type LcdMode = "egg" | "blob" | "heart" | "ghostGrave" | "angel" | "pause" | "sitter";
export const lcdFor = (mode: LcdMode, t: number): Pl[] => {
  const b = bounce(t);
  const f2 = Math.floor(t * 3) % 2;
  switch (mode) {
    case "egg":
      return [{ g: "egg", x: 11, y: 10 + (Math.floor(t * 2) % 2) }, G0];
    case "blob":
      return [{ g: "blob", ...b }, G0];
    case "heart":
      return [{ g: "blob", x: b.x + 4, y: b.y }, { g: "heart", x: 3, y: 3 + f2 }, { g: "heart", x: 22, y: 5 - f2 }, G0];
    case "ghostGrave":
      return [{ g: "grave", x: 20, y: 12 }, { g: "ghost", x: 5, y: 5 + Math.round(Math.sin(t * 3) * 1.5) }, { g: "ground", x: 0, y: 22 }, G0];
    case "angel": {
      const f = Math.floor(t * 4) % 2 === 0;
      return [{ g: "halo", x: 13, y: 3 + (Math.floor(t * 2) % 2) }, { g: "blob", x: 11, y: 7 }, { g: f ? "wing" : "wing2", x: 7, y: 9 }, { g: f ? "wing" : "wing2", x: 22, y: 9, flip: true }];
    }
    case "pause":
      return Math.floor(t * 2.5) % 2 === 0 ? [{ g: "pause", x: 14, y: 3 }, { g: "blob", x: 11, y: 13 }, G0] : [{ g: "blob", x: 11, y: 13 }, G0];
    case "sitter":
      return [{ g: "sitter", x: 4, y: 14 }, { g: "blob", x: 15 + Math.round(Math.sin(t * 2)), y: 13 }, { g: "heart", x: 24, y: 4 + f2 }, G0];
  }
};

/** Scene C timeline on the LCD. */
const lcdC = (t: number): Pl[] => {
  if (t < T.menetas - 0.55) return lcdFor("egg", t);
  if (t < T.menetas + 0.05) return [{ g: "egg", x: 11 + (Math.floor(t * 12) % 2 ? 1 : -1), y: 10 }, G0];
  if (t < T.menetas + 0.5) {
    const k = seg(t, T.menetas + 0.05, T.menetas + 0.5);
    return [{ g: "blob", x: 11, y: 13 }, { g: "shellL", x: Math.round(9 - 6 * k), y: Math.round(18 - 4 * k) }, { g: "shellR", x: Math.round(20 + 6 * k), y: Math.round(18 - 4 * k) }, G0];
  }
  if (t < T.makan) return lcdFor("blob", t);
  if (t < T.bersihkan) return [{ g: Math.floor(t * 5) % 2 === 0 ? "blobO" : "blob", x: 15, y: 13 }, { g: "food", x: 7, y: 17 }, G0];
  if (t < T.obati) {
    const sweep = seg(t, T.bersihkan + 0.6, T.obati - 0.2);
    const cells: Pl[] = [{ g: "blob", x: 18, y: 13 }, G0];
    if (sweep < 0.6) cells.push({ g: "poop", x: 5, y: 18 }, { g: "stink", x: 5, y: 14 - (Math.floor(t * 3) % 2) });
    if (sweep > 0 && sweep < 1) cells.push({ g: "broom", x: Math.round(lerp(-1, 32, sweep)), y: 17 });
    return cells;
  }
  if (t < T.telantarkan) {
    return t > T.obati + 0.9
      ? [{ g: "blob", ...bounce(t) }, { g: "med", x: 24, y: 4 }, G0]
      : [{ g: "blobX", x: 11, y: 13 }, { g: "skull", x: 22, y: 6 + (Math.floor(t * 3) % 2) }, G0];
  }
  if (t < T.mati) {
    const n = 1 + Math.floor(seg(t, T.telantarkan, T.mati - 0.3) * 3);
    const cells: Pl[] = [{ g: "blobX", x: 13, y: 13 }, { g: "clock", x: 3, y: 2 }, G0];
    for (let i = 0; i < n; i++) cells.push({ g: "poop", x: 2 + i * 6, y: 18 }, { g: "stink", x: 2 + i * 6, y: 14 - ((Math.floor(t * 3) + i) % 2) });
    return cells;
  }
  if (t < T.versiJ) return [{ g: "dead", x: 11, y: 14 }, G0];
  if (t < T.versiI) return lcdFor("ghostGrave", t);
  return lcdFor("angel", t);
};

/** Hand-held digital egg in a set (art px, moves with the camera). x, y = shell centre. */
export const EggDev: React.FC<{ x: number; y: number; w: number; color: string; cells: Pl[]; rot?: number; glow?: number }> = ({ x, y, w, color, cells, rot = 0, glow = 0.5 }) => {
  const h = w * 1.18;
  const W = w * PX;
  const H = h * PX;
  const e = Math.max(2, Math.round(W * 0.05));
  return (
    <>
      {glow > 0 ? <Glow x={x} y={y - h * 0.1} r={w * 1.1} color="#C8F070" intensity={0.35 * glow} /> : null}
      <div style={{ position: "absolute", left: x * PX - W / 2, top: y * PX - H / 2, width: W, height: H, transform: `rotate(${rot}deg)`, transformOrigin: "50% 0%" }}>
        <div style={{ position: "absolute", left: W * 0.39, top: -W * 0.2, width: W * 0.22, height: W * 0.22, borderRadius: "50%", border: `${Math.max(2, W * 0.04)}px solid #C9CED6`, boxSizing: "border-box" }} />
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: "50% 50% 46% 46% / 58% 58% 42% 42%",
            background: `radial-gradient(ellipse at 34% 26%, ${rgba("#FFFFFF", 0.55)} 0%, ${color} 34%), ${color}`,
            boxShadow: `inset -${e}px -${e}px 0 ${rgba("#000000", 0.35)}, inset ${e}px ${e}px 0 ${rgba("#FFFFFF", 0.35)}, 0 ${e}px 0 ${rgba("#000000", 0.35)}`,
          }}
        />
        <div style={{ position: "absolute", left: W * 0.2, top: H * 0.27, width: W * 0.6, height: W * 0.45, background: "#2A2530", borderRadius: W * 0.06, padding: W * 0.03, boxSizing: "border-box" }}>
          <Lcd cells={cells} w={W * 0.54} h={W * 0.39} />
        </div>
        {[0.3, 0.5, 0.7].map((bx) => (
          <div key={bx} style={{ position: "absolute", left: W * bx - W * 0.055, top: H * 0.78, width: W * 0.11, height: W * 0.11, borderRadius: "50%", background: "#F3E6CC", boxShadow: `inset -1px -1px 0 ${rgba("#000000", 0.4)}` }} />
        ))}
      </div>
    </>
  );
};

/** Full-frame device (screen px): scene C and the hook's LCD insert. */
const DeviceFull: React.FC<{ t: number; cells: Pl[]; color: string; btn?: [number, number, number]; zoom?: number }> = ({ t, cells, color, btn = [0, 0, 0], zoom = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom}) rotate(${0.6 * Math.sin(t * 0.7)}deg)`, transformOrigin: "50% 40%" }}>
      <div style={{ position: "absolute", inset: -40, background: `radial-gradient(ellipse at 50% 36%, ${rgba("#FFFFFF", 0.32)} 0%, ${color} 38%, ${rgba("#000000", 0.55)} 100%), ${color}` }} />
      <div style={{ position: "absolute", inset: -40, backgroundImage: `radial-gradient(${rgba("#FFFFFF", 0.16)} 2px, transparent 3px)`, backgroundSize: "22px 22px", opacity: 0.6 }} />
      <div style={{ position: "absolute", left: -160, top: 150, width: 1400, height: 1300, borderRadius: "50%", border: `16px solid ${rgba("#FFFFFF", 0.18)}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 60, top: 372, width: 960, height: 736, borderRadius: 64, background: "#2A2530", boxShadow: `inset 0 10px 0 ${rgba("#000000", 0.5)}, 0 12px 0 ${rgba("#000000", 0.3)}, 0 0 0 12px ${rgba("#FFFFFF", 0.2)}` }} />
      <div style={{ position: "absolute", left: 90, top: 402, width: 900, height: 675, boxShadow: `0 0 60px ${rgba("#C8F070", 0.35)}` }}>
        <Lcd cells={cells} w={900} h={675} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)" }} />
      </div>
      {[300, 540, 780].map((cx, i) => (
        <div key={cx} style={{ position: "absolute", left: cx - 58, top: 1148, width: 116, height: 116, borderRadius: "50%", background: btn[i] > 0.01 ? `radial-gradient(circle at 40% 35%, #FFFFFF 0%, ${C.gold} 55%, #B07A2A 100%)` : "radial-gradient(circle at 40% 35%, #FFFFFF 0%, #F3E6CC 50%, #A89C86 100%)", boxShadow: `0 10px 0 ${rgba("#000000", 0.4)}, 0 0 ${50 * btn[i]}px ${rgba(C.gold, 0.9 * btn[i])}`, transform: `translateY(${6 * btn[i]}px)` }} />
      ))}
      <div style={{ position: "absolute", left: 340, top: 1620, width: 400, height: 170, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 22 }}>
        {Array.from({ length: 21 }, (_, i) => <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: rgba("#000000", 0.45), boxShadow: `inset 0 4px 0 ${rgba("#000000", 0.4)}` }} />)}
      </div>
    </div>
  </div>
);

// ================================================================= bedroom (A, OUT, cover)
const bedLights = (t: number, day: boolean, lamp: { x: number; y: number }, angle: number): LitLight[] =>
  day
    ? [
        { kind: "point", x: BED.WIN.x + 25, y: BED.WIN.y + 30, r: 180, i: 1.35, color: "#FFF0D0" },
        { kind: "point", x: 110, y: 110, r: 70, i: 0.45, color: "#FFE0A6" },
      ]
    : [
        { kind: "point", x: BED.WIN.x + 25, y: BED.WIN.y + 22, r: 120, i: 0.85, color: "#8FA8F0" },
        { kind: "cone", x: lamp.x, y: lamp.y, r: 110, i: 1.35 + 0.04 * Math.sin(t * 9), angle, spread: 0.55, color: "#FFB070" },
        { kind: "point", x: lamp.x, y: lamp.y, r: 60, i: 0.8, color: "#FFC27A" },
        { kind: "point", x: 98, y: 124, r: 34, i: 0.7, color: "#B8E05A" },
      ];
const KS = 1.6;
export const KID_HAND = { x: BED.KID.x + KID_HANDS.x * KS, y: BED.KID.y + KID_HANDS.y * KS };
export const BedShot: React.FC<{ t: number; cam?: CameraState; day?: boolean; kid?: boolean; tears?: number; sticker?: number; egg?: { x: number; y: number; w: number; cells: Pl[] } }> = ({
  t, cam = REST, day = false, kid = true, tears = 0, sticker = 0, egg,
}) => {
  const set = BED_SET();
  const spr = SPR();
  const lights = bedLights(t, day, set.lamp.bulb, set.lamp.angle);
  const ambient = day ? 0.24 : 0.08;
  const opts = { ambient, exposure: day ? 1.15 : 1.1, dither: 0.45 };
  const D = BED.DRAWER;
  const dev = egg ?? { x: KID_HAND.x, y: KID_HAND.y - 3, w: 8, cells: lcdFor("ghostGrave", t) };
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1300} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {day ? <Glow x={BED.WIN.x + 25} y={BED.WIN.y + 30} r={60} color="#FFF0D0" intensity={0.45} squash={0.9} /> : <Glow x={BED.WIN.x + 34} y={BED.WIN.y + 14} r={22} color="#BFD0FF" intensity={0.45} />}
        {day ? <LightShaft id="bedsun" x={BED.WIN.x + 25} y={BED.WIN.y + 10} angle={Math.PI * 0.32} length={190} spread={0.3} color="#FFF0D0" intensity={0.14} /> : null}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        {!day ? <Glow x={set.lamp.bulb.x} y={set.lamp.bulb.y} r={26} color="#FFB070" intensity={0.55} /> : null}
        <div style={{ ...at(D.x + 5, D.y + 1.5, D.w - 10, D.h - 3), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", background: sticker > 0.01 ? ACCENT : "#2A7F76", fontSize: 26, fontWeight: 700, color: C.ink, boxShadow: sticker > 0.01 ? `0 0 ${12 + 30 * sticker}px ${rgba(ACCENT, 0.5 + 0.5 * sticker)}` : undefined }}>AUDIRA</div>
        {sticker > 0.01 ? <Glow x={D.x + D.w / 2} y={D.y + D.h / 2} r={26} color={ACCENT} intensity={0.6 * sticker} squash={0.5} /> : null}
        {kid ? <Lit s={spr.kid} pal={KID_PAL} x={BED.KID.x} y={BED.KID.y} lights={lights} ambient={ambient} anchor={KID_SIDE_ANCHOR} scale={PX * KS} rim={day ? "#FFF0D0" : "#9FB8FF"} /> : null}
        <EggDev x={dev.x} y={dev.y} w={dev.w} color={SHELL.pink} cells={dev.cells} glow={day ? 0.3 : 0.9} />
        {tears > 0.01
          ? [0, 0.35].map((o) => {
              const k = ((t + o) % 0.7) / 0.7;
              return <div key={o} style={{ ...at(90 + k * 2, 107 + k * 12, 1, 1.6), borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#BFE6FF", opacity: tears * (1 - k * 0.6), boxShadow: `0 0 10px ${rgba("#BFE6FF", 0.8)}` }} />;
            })
          : null}
      </Layer>
      <NearLayer top={196}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFB878")} opts={{ ambient: ambient + 0.22, exposure: 1, dither: 0.4 }} />
      </NearLayer>
    </CinematicCamera>
  );
};

export const CoverText: React.FC<{ o?: number }> = ({ o = 1 }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o === 1 ? undefined : o }}>
      <div style={{ position: "absolute", top: 252, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pixLabel, fontSize: 36, color: C.ink, padding: "8px 16px", background: ACCENT, fontWeight: 700 }}>AUDIRA TECH #22</div>
      </div>
      <div style={{ position: "absolute", top: 318, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT.display, lineHeight: 0.95, textShadow: `0 8px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.9)}` }}>
        <div style={{ fontSize: 128, color: C.ivory }}>MATI KARENA</div>
        <div style={{ fontSize: 124, color: C.gold }}>DITELANTARKAN</div>
      </div>
      <div style={{ position: "absolute", top: 1120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pixLabel, fontSize: 36, color: C.ivory, padding: "12px 20px", background: rgba(C.ink, 0.8), border: `4px solid ${SHELL.pink}` }}>DEMAM TELUR DIGITAL 1996</div>
      </div>
    </div>
  );
};

// ================================================================= A HOOK
const HAND_CAM = aim(KID_HAND.x - 2, KID_HAND.y - 6);
const FACE_CAM = aim(92, 114);
const STICK_CAM = aim(BED.DRAWER.x + BED.DRAWER.w / 2, BED.DRAWER.y - 6);
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: 0, z: 40, x: FACE_CAM.x * 0.3, y: FACE_CAM.y * 0.3 }, { t: 1.45, z: 120, x: FACE_CAM.x * 0.7, y: FACE_CAM.y * 0.7, e: ease.cameraSoft }, { t: T.menangis + 0.3, z: 260, x: FACE_CAM.x, y: FACE_CAM.y, e: ease.cameraSoft }, { t: T.piksel - 0.1, z: 420, x: HAND_CAM.x, y: HAND_CAM.y, e: ease.cameraSoft }, { t: T.ini, z: 430, x: HAND_CAM.x, y: HAND_CAM.y }, { t: T.ini + 0.6, z: 300, x: STICK_CAM.x, y: STICK_CAM.y, e: ease.cameraSoft }, { t: CUT.B, z: 280, x: STICK_CAM.x - 20, y: STICK_CAM.y }], 3);
  const ins = win(t, T.piksel - 0.12, T.ini + 0.08, 0.14, 0.16);
  return (
    <>
      <BedShot t={t} cam={cam} tears={seg(t, 1.3, 1.8)} sticker={seg(t, T.ini, T.ini + 0.3)} />
      {ins > 0.001 ? (
        <div style={{ position: "absolute", inset: 0, opacity: ins }}>
          <DeviceFull t={t} cells={lcdFor("ghostGrave", t)} color={SHELL.pink} zoom={1.06 + 0.06 * seg(t, T.piksel, T.ini)} />
        </div>
      ) : null}
    </>
  );
};
const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CoverText o={1 - seg(t, 1.0, 1.45)} />
    <Pop t={t} a={1.5} b={T.jutaan - 0.03} top={268}>
      <Chip text="30 TAHUN LALU" sub="23 NOV 1996" color={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.jutaan} b={T.piksel - 0.1} top={268}>
      <Chip text="JUTAAN ANAK MENANGIS" size={56} border={SHELL.pink} />
    </Pop>
    <Pop t={t} a={T.ini + 0.05} b={CUT.B} top={268}>
      <Chip text="HEWAN PELIHARAAN DARI PIKSEL" size={44} border={ACCENT} />
    </Pop>
  </>
);

// ================================================================= B TOY SHOP
const shopLights = (t: number): LitLight[] => [
  { kind: "point", x: 30, y: -6, r: 150, i: 1.05, color: "#EAF2FF" },
  { kind: "point", x: 105, y: -6, r: 150, i: 1.05, color: "#EAF2FF" },
  { kind: "point", x: SHOP.HERO.x, y: SHOP.HERO.y + 6, r: 50, i: 0.6 + 0.6 * seg(t, T.telur - 0.3, T.telur), color: "#FFE0A6" },
  { kind: "point", x: 68, y: SHOP.COUNTER, r: 80, i: 0.6, color: "#FFC27A" },
];
const QUEUE = [{ x: 8, p: 0 }, { x: 36, p: 1 }, { x: 66, p: 2 }, { x: 96, p: 3 }, { x: 126, p: 4 }];
const HERO_CAM = aim(SHOP.HERO.x, SHOP.HERO.y + 8);
const ShopScene: React.FC<{ t: number }> = ({ t }) => {
  const set = SHOP_SET();
  const spr = SPR();
  const lights = shopLights(t);
  const opts = { ambient: 0.16, exposure: 1.12, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.B, x: -150, z: 40, y: -20 }, { t: T.tamagotchi, x: 30, z: 90, y: 0, e: ease.cameraSoft }, { t: T.gantungan, x: HERO_CAM.x, z: 330, y: HERO_CAM.y, e: ease.cameraSoft }, { t: T.pencipta, x: HERO_CAM.x, z: 320, y: HERO_CAM.y }, { t: T.aki + 0.6, x: 60, z: 110, y: 120, e: ease.cameraSoft }, { t: T.namanya, x: -40, z: 120, y: 100 }, { t: T.watch, x: HERO_CAM.x, z: 280, y: HERO_CAM.y, e: ease.cameraSoft }, { t: CUT.C, x: HERO_CAM.x, z: 380, y: HERO_CAM.y }], 5);
  const S = SHOP.SIGN;
  const swing = 9 * Math.sin((t - T.gantungan) * 3.2) * Math.exp(-Math.max(0, t - T.gantungan) * 0.5) * (t > T.gantungan - 0.4 ? 1 : 0.25);
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1000}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <div style={{ ...at(S.x, S.y, S.w, S.h), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, fontSize: 52, fontWeight: 700, color: C.gold, textShadow: `0 0 18px ${rgba(C.gold, 0.6)}` }}>
          <span>AUDIRA</span>
          <span style={{ color: SHELL.pink }}>TOYS</span>
          <span style={{ fontSize: 30, color: C.ivory }}>1996</span>
        </div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={SHOP.HERO.x} y={SHOP.HERO.y} r={22} color="#FFE0A6" intensity={0.25 + 0.4 * seg(t, T.telur - 0.3, T.telur)} />
        <EggDev x={SHOP.HERO.x} y={SHOP.HERO.y + 8} w={13} color={SHELL.pink} cells={lcdFor("egg", t)} rot={swing} glow={0.6} />
      </Layer>
      <NearLayer top={206}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFE0B0")} opts={{ ambient: 0.34, exposure: 1, dither: 0.4 }} />
        {QUEUE.map((q) => (
          <Lit key={q.x} s={spr.head} pal={CROWD_PALS[q.p]} x={q.x} y={244 + (q.p % 2) * 3} lights={lights} ambient={0.3} anchor={HEAD_ANCHOR} scale={PX * 2.6} rim="#EAF2FF" />
        ))}
      </NearLayer>
    </CinematicCamera>
  );
};
const ShopHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.B + 0.05} b={T.bandai - 0.05} top={268}>
      <Chip text="23 NOV 1996" sub="JEPANG" color={C.gold} size={60} />
    </Pop>
    <Pop t={t} a={T.bandai} b={T.gantungan - 0.05} top={268}>
      <Chip text="BANDAI MERILIS" sub="TELUR DIGITAL" size={56} border={SHELL.pink} />
    </Pop>
    <Pop t={t} a={T.gantungan} b={T.aki - 0.05} top={268}>
      <Chip text="SEUKURAN GANTUNGAN KUNCI" size={46} border={ACCENT} />
    </Pop>
    <Pop t={t} a={T.aki} b={T.akihiro - 0.05} top={268} left={60} origin="0% 50%">
      <NameCard name="AKI MAITA" role="BANDAI" />
    </Pop>
    <Pop t={t} a={T.akihiro} b={T.namanya - 0.05} top={268} left={60} origin="0% 50%">
      <NameCard name="AKIHIRO YOKOI" role="WIZ" accent={VIOLET} />
    </Pop>
    <Pop t={t} a={T.namanya} b={T.jam - 0.05} top={268}>
      <Chip text="TAMAGO + WATCH" color={C.gold} border={C.gold} size={60} />
    </Pop>
    <Pop t={t} a={T.jam} b={CUT.C} top={268}>
      <Chip text="TELUR + JAM TANGAN" size={56} border={SHELL.pink} />
    </Pop>
  </>
);

// ================================================================= C INSIDE THE LCD
const LcdScene: React.FC<{ t: number }> = ({ t }) => {
  const press = (a: number) => win(t, a, a + 0.45, 0.04, 0.2);
  const btn: [number, number, number] = [Math.max(press(T.tiga), press(T.makan)), Math.max(press(T.tiga + 0.3), press(T.bersihkan)), Math.max(press(T.tiga + 0.6), press(T.obati))];
  const zoom = 1 + 0.05 * seg(t, CUT.C, T.mati) + 0.06 * win(t, T.mati, T.mati + 0.5, 0.03, 0.4) - 0.03 * seg(t, T.versiJ, CUT.D);
  const s = shake(t, T.mati, 26, 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${s.x}px, ${s.y}px)` }}>
      <DeviceFull t={t} cells={lcdC(t)} color={t >= T.mati && t < T.versiJ ? "#8A5A66" : SHELL.pink} btn={btn} zoom={zoom} />
    </div>
  );
};
const LcdHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.C + 0.05} b={T.tiga - 0.05} top={268}>
      <Chip text="MENETAS" sub="JADI MAKHLUK KECIL" color={C.gold} size={58} />
    </Pop>
    <Pop t={t} a={T.tiga} b={T.makan - 0.05} top={268}>
      <Chip text="3 TOMBOL" color={C.gold} border={C.gold} size={64} />
    </Pop>
    <Pop t={t} a={T.makan} b={T.telantarkan - 0.05} top={268}>
      <Chip text={t >= T.obati ? "MAKAN · BERSIH · OBAT" : t >= T.bersihkan ? "MAKAN · BERSIH" : "MAKAN"} size={52} border={ACCENT} />
    </Pop>
    <Pop t={t} a={T.kurang} b={T.mati - 0.05} top={268}>
      <Chip text="< 12 JAM" sub="TANPA PERAWATAN" color={RED} border={RED} size={64} />
    </Pop>
    {t >= T.mati && t < T.versiJ - 0.05 ? <Stamp t={t} a={T.mati} text="MATI" top={268} color={RED} rot={-4} /> : null}
    <Pop t={t} a={T.versiJ} b={T.versiI - 0.05} top={268}>
      <Chip text="VERSI JEPANG" sub="HANTU + BATU NISAN" size={56} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.versiI} b={CUT.D} top={268}>
      <Chip text="VERSI INGGRIS" sub="MALAIKAT" color={C.gold} size={56} />
    </Pop>
  </>
);

// ================================================================= D CLASSROOM
const classLights = (t: number): LitLight[] => [
  { kind: "point", x: CLASS.WIN.x + 22, y: CLASS.WIN.y + 38, r: 160, i: 1.25, color: "#FFF2DA" },
  { kind: "point", x: 40, y: 0, r: 120, i: 0.6, color: "#EAF2FF" },
  { kind: "point", x: CLASS.EGG.x, y: CLASS.EGG.y - 4, r: 30, i: 0.4 + 0.8 * (Math.floor(t * 6) % 2) * win(t, T.bunyi, T.melarang, 0.05, 0.2), color: "#C8F070" },
];
const EGG_D_CAM = aim(CLASS.EGG.x, CLASS.EGG.y - 14);
const BOARD_CAM = aim(CLASS.BOARD.x + CLASS.BOARD.w / 2, CLASS.BOARD.y + CLASS.BOARD.h / 2 + 10);
const ClassScene: React.FC<{ t: number }> = ({ t }) => {
  const set = CLASS_SET();
  const spr = SPR();
  const lights = classLights(t);
  const ambient = 0.2;
  const opts = { ambient, exposure: 1.12, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.D, x: 40, z: 20, y: -80 }, { t: T.anak, x: 0, z: 90, y: -20, e: ease.cameraSoft }, { t: T.bunyi, x: EGG_D_CAM.x, z: 330, y: EGG_D_CAM.y, e: ease.cameraSoft }, { t: T.melarang - 0.4, x: EGG_D_CAM.x - 20, z: 300, y: EGG_D_CAM.y }, { t: T.melarang + 0.2, x: BOARD_CAM.x, z: 170, y: BOARD_CAM.y, e: ease.cameraSoft }, { t: CUT.D2, x: BOARD_CAM.x + 20, z: 190, y: BOARD_CAM.y }], 9);
  const ringing = t > T.bunyi && t < T.melarang;
  const beep = win(t, T.bunyi, T.melarang, 0.05, 0.2) * (Math.floor(t * 6) % 2);
  const Bd = CLASS.BOARD;
  return (
    <CinematicCamera cam={withShake(cam, shake(t, T.melarang, 20))}>
      <Layer z={1250} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={CLASS.WIN.x + 22} y={CLASS.WIN.y + 38} r={50} color="#FFF2DA" intensity={0.35} squash={0.9} />
        <div style={{ ...at(Bd.x + 4, Bd.y + 4, Bd.w - 8, Bd.h - 8), display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18, fontFamily: FONT.pixel, color: "#EEF2E6" }}>
          <div style={{ fontSize: 40, letterSpacing: "0.06em", opacity: 0.9 }}>{"MATEMATIKA  7 × 8 = ?"}</div>
          {t >= T.melarang ? <div style={{ fontFamily: FONT.display, fontSize: 70, color: "#FFB0A8", lineHeight: 1 }}>DILARANG BAWA</div> : null}
          {t >= T.melarang ? <div style={{ fontFamily: FONT.display, fontSize: 70, color: "#FFB0A8", lineHeight: 1 }}>TELUR DIGITAL!</div> : null}
          <div style={{ position: "absolute", right: 16, bottom: 10, fontSize: 24, opacity: 0.7 }}>AUDIRA</div>
        </div>
      </Layer>
      <Layer z={1000}>
        {CLASS.PUPILS.map((x, i) => (
          <Lit key={x} s={spr.pupil} pal={PUPIL_PALS[i]} x={x} y={150} lights={lights} ambient={ambient} anchor={KID_BACK_ANCHOR} scale={PX * 1.8} rim="#FFF2DA" />
        ))}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <EggDev x={CLASS.EGG.x + (ringing ? (beep ? 0.4 : -0.4) : 0)} y={CLASS.EGG.y - 5} w={8} color={SHELL.teal} cells={lcdFor(t > T.bunyi ? "blob" : "egg", t)} glow={0.5 + beep} />
        {t > T.bunyi && t < T.melarang + 0.4 ? (
          <div style={{ position: "absolute", left: (CLASS.EGG.x + 4) * PX, top: (CLASS.EGG.y - 26) * PX, ...pixLabel, fontSize: 40, fontWeight: 700, color: C.ink, background: C.ivory, padding: "10px 14px", border: `6px solid ${C.ink}`, transform: `scale(${0.9 + 0.15 * beep}) rotate(${beep ? 4 : -3}deg)`, transformOrigin: "0% 100%" }}>BIP! BIP!</div>
        ) : null}
      </Layer>
      <NearLayer top={196}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFF0D0")} opts={{ ambient: 0.34, exposure: 1, dither: 0.4 }} />
      </NearLayer>
    </CinematicCamera>
  );
};
const Counter: React.FC<{ t: number; a: number; to: number; unit: string; sub?: string }> = ({ t, a, to, unit, sub }) => (
  <Chip text={`${Math.round(to * seg(t, a, a + 1.2))} ${unit}`} sub={sub} color={C.gold} border={C.gold} size={64} />
);
const ClassHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.D + 0.05} b={T.sekitar - 0.05} top={268}>
      <Chip text="DEMAM MELEDAK" size={60} border={SHELL.pink} />
    </Pop>
    <Pop t={t} a={T.sekitar} b={T.bunyi - 0.05} top={268}>
      <Counter t={t} a={T.sekitar} to={40} unit="JUTA UNIT" sub="TERJUAL DI DUNIA" />
    </Pop>
    {t >= T.melarang && t < CUT.D2 ? <Stamp t={t} a={T.melarang} text="DILARANG" sub="DI BANYAK SEKOLAH" top={268} color={RED} rot={-3} /> : null}
  </>
);

// ================================================================= D2 PET CEMETERY
const cemLights = (t: number): LitLight[] => [
  { kind: "point", x: CEM.SUN.x, y: CEM.SUN.y, r: 170, i: 1.2, color: "#FF9A5A" },
  { kind: "point", x: 20, y: 10, r: 150, i: 0.45, color: "#9B7BFF" },
  { kind: "point", x: CEM.EGG.x, y: CEM.EGG.y - 6, r: 30, i: 0.6 + 0.4 * seg(t, T.tombol, T.tombol + 0.3), color: "#C8F070" },
];
const EGG_C_CAM = aim(CEM.EGG.x, CEM.EGG.y - 14);
const CemScene: React.FC<{ t: number }> = ({ t }) => {
  const set = CEM_SET();
  const lights = cemLights(t);
  const opts = { ambient: 0.14, exposure: 1.1, dither: 0.5 };
  const cam = camAt(t, [{ t: CUT.D2, x: -60, z: 30, y: -40 }, { t: T.pemakaman, x: 0, z: 110, y: EGG_C_CAM.y * 0.6, e: ease.cameraSoft }, { t: T.tombol, x: EGG_C_CAM.x, z: 330, y: EGG_C_CAM.y, e: ease.cameraSoft }, { t: CUT.E1, x: EGG_C_CAM.x + 20, z: 380, y: EGG_C_CAM.y }], 13);
  const mode: LcdMode = t >= T.fitur ? "sitter" : t >= T.tombol ? "pause" : "ghostGrave";
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={CEM.SUN.x} y={CEM.SUN.y} r={40} color="#FFB070" intensity={0.6} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...at(CEM.GRAVE.x + 4, CEM.GRAVE.y + 10, CEM.GRAVE.w - 8, 8), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#3A3440", fontWeight: 700 }}>R.I.P</div>
        <EggDev x={CEM.EGG.x} y={CEM.EGG.y - 6} w={10} color={SHELL.yellow} cells={lcdFor(mode, t)} glow={0.8} />
      </Layer>
      <NearLayer top={190}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFB060")} opts={{ ambient: 0.32, exposure: 1, dither: 0.4 }} />
      </NearLayer>
    </CinematicCamera>
  );
};
const CemHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.D2 + 0.05} b={T.pemakaman - 0.05} top={268}>
      <Chip text="SAMPAI DIKUBURKAN" size={56} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.pemakaman} b={T.tombol - 0.05} top={268}>
      <Chip text="PEMAKAMAN KHUSUS" sub="HEWAN VIRTUAL" color={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.tombol} b={T.fitur - 0.05} top={268}>
      <Chip text="+ TOMBOL JEDA" color={C.gold} border={C.gold} size={60} />
    </Pop>
    <Pop t={t} a={T.fitur} b={CUT.E1} top={268}>
      <Chip text="+ FITUR PENITIP" size={60} border={ACCENT} />
    </Pop>
  </>
);

// ================================================================= E1 IG NOBEL STAGE
const stgLights = (t: number): LitLight[] => [
  { kind: "cone", x: STG.SPEAKER.x - 4, y: -20, r: 230, i: 1.7, angle: Math.PI / 2, spread: 0.32, color: "#FFE6BC" },
  { kind: "cone", x: STG.TROPHY.x, y: -20, r: 200, i: 0.6 + 1.2 * seg(t, T.ig, T.ig + 0.3), angle: Math.PI / 2, spread: 0.28, color: "#FFD27A" },
  { kind: "point", x: 67, y: 200, r: 110, i: 0.4, color: "#FF8A5A" },
];
const SPK_CAM = aim(STG.SPEAKER.x - 10, 118);
const TROPHY_CAM = aim(STG.TROPHY.x, STG.TROPHY.y - 8);
const StageScene: React.FC<{ t: number }> = ({ t }) => {
  const set = STG_SET();
  const spr = SPR();
  const lights = stgLights(t);
  const ambient = 0.1;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.E1, x: 0, z: 20, y: -30 }, { t: T.meraih, x: SPK_CAM.x, z: 200, y: SPK_CAM.y, e: ease.cameraSoft }, { t: T.ig + 0.3, x: TROPHY_CAM.x, z: 260, y: TROPHY_CAM.y, e: ease.cameraSoft }, { t: T.karena + 0.6, x: 0, z: 90, y: -10, e: ease.cameraSoft }, { t: CUT.E2, x: 40, z: 130, y: -10 }], 15);
  const Tr = STG.TROPHY;
  return (
    <CinematicCamera cam={withShake(cam, shake(t, T.ig, 22))}>
      <Layer z={1400} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <LightShaft id="spk" x={STG.SPEAKER.x - 4} y={-20} angle={Math.PI / 2} length={180} spread={0.2} color="#FFE6BC" intensity={0.16} />
        <LightShaft id="tro" x={Tr.x} y={-20} angle={Math.PI / 2} length={150} spread={0.16} color="#FFD27A" intensity={0.14 * seg(t, T.ig, T.ig + 0.3)} />
        <div style={{ ...at(20, 14, 96, 12), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700, color: C.gold, textShadow: `0 0 16px ${rgba(C.gold, 0.6)}` }}>IG NOBEL 1997</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={Tr.x} y={Tr.y - 10} r={18} color="#FFD27A" intensity={0.3 + 0.5 * seg(t, T.ig, T.ig + 0.3)} />
        <div style={{ ...at(Tr.x - 5, Tr.y - 8, 10, 8), background: `linear-gradient(90deg, #B07A2A, ${C.gold} 40%, #FFE6BC 55%, #B07A2A)`, borderRadius: `0 0 ${4 * PX}px ${4 * PX}px` }} />
        <div style={{ ...at(Tr.x - 1, Tr.y, 2, 3), background: "#B07A2A" }} />
        <div style={{ ...at(Tr.x - 4, Tr.y + 3, 8, 2), background: C.gold }} />
        <EggDev x={Tr.x} y={Tr.y - 12} w={6} color={SHELL.violet} cells={lcdFor("heart", t)} glow={0.6} />
        <Lit s={spr.person} pal={SUIT_PAL} x={STG.SPEAKER.x} y={STG.SPEAKER.y} lights={lights} ambient={ambient} anchor={PERSON_ANCHOR} scale={PX * 2} rim="#FFE6BC" />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.podium} lights={lights} opts={opts} />
        <div style={{ ...at(STG.PODIUM.x + 4, STG.PODIUM.y + 8, STG.PODIUM.w - 8, 8), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.gold }}>AUDIRA</div>
      </Layer>
      <NearLayer top={208}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FF9A6A")} opts={{ ambient: 0.3, exposure: 1, dither: 0.4 }} />
        {[-2, 24, 52, 80, 108, 134].map((x, i) => (
          <Lit key={x} s={spr.head} pal={CROWD_PALS[i % 5]} x={x} y={246 + (i % 2) * 4} lights={lights} ambient={0.28} anchor={HEAD_ANCHOR} scale={PX * 2.6} rim="#FFE6BC" />
        ))}
      </NearLayer>
    </CinematicCamera>
  );
};
const StageHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E1 + 0.05} b={T.ig - 0.05} top={268}>
      <Chip text="1997" sub="PENCIPTANYA DIPANGGIL" color={C.gold} size={72} />
    </Pop>
    {t >= T.ig && t < T.karena - 0.05 ? <Stamp t={t} a={T.ig} text="IG NOBEL" sub="BIDANG EKONOMI" top={268} /> : null}
    <Pop t={t} a={T.karena} b={CUT.E2} top={268}>
      <Chip text="JUTAAN JAM KERJA" sub="DIPAKAI MERAWAT HEWAN VIRTUAL" size={52} border={SHELL.pink} />
    </Pop>
  </>
);

// ================================================================= E2 WAREHOUSE
const whLights = (): LitLight[] => [
  ...WH.LAMPS.map((x): LitLight => ({ kind: "cone", x, y: -6, r: 200, i: 1.2, angle: Math.PI / 2, spread: 0.55, color: "#FFD9A0" })),
  { kind: "point", x: 68, y: 120, r: 60, i: 0.55, color: "#FFE6BC" },
  { kind: "point", x: 170, y: 40, r: 120, i: 0.3, color: "#9FB8E8" },
];
const WarehouseScene: React.FC<{ t: number }> = ({ t }) => {
  const set = WH_SET();
  const lights = whLights();
  const opts = { ambient: 0.12, exposure: 1.1, dither: 0.45 };
  const B = WH.BOX;
  const BOX_CAM = aim(B.x + B.w / 2, B.y + B.h / 2);
  const cam = camAt(t, [{ t: CUT.E2, x: 120, z: 30, y: -20 }, { t: T.rugi - 0.3, x: BOX_CAM.x * 0.5, z: 150, y: BOX_CAM.y * 0.5, e: ease.cameraSoft }, { t: CUT.F, x: BOX_CAM.x, z: 240, y: BOX_CAM.y }], 21);
  return (
    <CinematicCamera cam={withShake(cam, shake(t, T.rugi, 22))}>
      <Layer z={1400} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {WH.LAMPS.map((x) => <Glow key={x} x={x} y={-5} r={18} color="#FFD9A0" intensity={0.6} squash={0.6} />)}
        {WH.LAMPS.map((x) => <LightShaft key={x} id={`wh${x}`} x={x} y={-6} angle={Math.PI / 2} length={170} spread={0.28} color="#FFD9A0" intensity={0.1} />)}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...at(B.x + 3, B.y + 4, B.w - 6, 12), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: C.gold }}>TELUR DIGITAL</div>
        <div style={{ ...at(B.x + 3, B.y + 19, B.w - 6, 9), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#3A2A24" }}>STOK x 1.000</div>
        {t >= T.rugi ? <div style={{ ...at(B.x + 2, B.y + 17, B.w - 4, 13), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: RED, border: `6px solid ${RED}`, transform: "rotate(-8deg)", background: rgba(C.ivory, 0.85) }}>TAK LAKU</div> : null}
        {[0, 1, 2].map((i) => <EggDev key={i} x={B.x + 8 + i * 16} y={B.y - 6} w={7} color={[SHELL.pink, SHELL.teal, SHELL.yellow][i]} cells={lcdFor("egg", 0)} glow={0} />)}
      </Layer>
      <NearLayer top={198}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFD9A0")} opts={{ ambient: 0.3, exposure: 1, dither: 0.4 }} />
      </NearLayer>
    </CinematicCamera>
  );
};
const WarehouseHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E2 + 0.05} b={T.rugi - 0.05} top={268}>
      <Chip text="1998 · DEMAM SURUT" size={56} border={VIOLET} />
    </Pop>
    {t >= T.rugi && t < CUT.F ? <Stamp t={t} a={T.rugi} text="RUGI ¥6 MILIAR" sub="BANDAI" top={268} color={RED} rot={-3} /> : null}
  </>
);

// ================================================================= F OFFICE (today)
const offLights = (): LitLight[] => [
  { kind: "point", x: OFF.WIN.x + 33, y: OFF.WIN.y + 36, r: 150, i: 1.15, color: "#FFF0D8" },
  { kind: "point", x: OFF.BOARD.x + 33, y: OFF.BOARD.y + 25, r: 70, i: 0.45, color: "#EAF2FF" },
  { kind: "point", x: 40, y: 110, r: 70, i: 0.4, color: "#FFD9A0" },
];
const OfficeScene: React.FC<{ t: number }> = ({ t }) => {
  const set = OFF_SET();
  const spr = SPR();
  const lights = offLights();
  const ambient = 0.2;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const S = 1.6;
  const hand = { x: OFF.STAND.x + PERSON_HAND.x * S, y: OFF.STAND.y + PERSON_HAND.y * S };
  const HCAM = aim(hand.x, hand.y - 4);
  const cam = camAt(t, [{ t: CUT.F, x: -70, z: 40, y: -30 }, { t: T.efek, x: HCAM.x * 0.6, z: 150, y: HCAM.y * 0.6, e: ease.cameraSoft }, { t: T.bukti + 0.3, x: HCAM.x, z: 300, y: HCAM.y, e: ease.cameraSoft }, { t: T.kini + 0.4, x: -40, z: 110, y: -30, e: ease.cameraSoft }, { t: CUT.OUT, x: -80, z: 140, y: -40 }], 19);
  const Bd = OFF.BOARD;
  const bob = Math.sin(t * 3) * 0.4;
  return (
    <CinematicCamera cam={withShake(cam, shake(t, T.efek, 24))}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={OFF.WIN.x + 33} y={OFF.WIN.y + 36} r={50} color="#FFF0D8" intensity={0.35} squash={0.9} />
        <div style={{ ...at(Bd.x, Bd.y, Bd.w, Bd.h), display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 40, boxSizing: "border-box", gap: 24 }}>
          {t >= T.efek ? (
            <>
              <div style={{ width: 70, height: 84, borderRadius: "50% 50% 46% 46% / 58% 58% 42% 42%", border: "6px solid #2A4C8C", boxSizing: "border-box" }} />
              <div style={{ fontFamily: FONT.display, fontSize: 80, color: "#B8222E", lineHeight: 1 }}>=</div>
              <div style={{ fontFamily: FONT.display, fontSize: 90, color: "#B8222E", lineHeight: 1 }}>♥</div>
            </>
          ) : null}
        </div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Lit s={spr.person} pal={OFFICE_PAL} x={OFF.STAND.x} y={OFF.STAND.y} lights={lights} ambient={ambient} anchor={PERSON_ANCHOR} scale={PX * S} />
        <EggDev x={hand.x} y={hand.y - 4 + bob} w={8} color={SHELL.teal} cells={lcdFor("heart", t)} glow={0.6} />
        {t >= T.efek
          ? [0, 1, 2, 3].map((i) => {
              const k = ((t - T.efek + i * 0.45) % 1.8) / 1.8;
              return <div key={i} style={{ position: "absolute", left: (hand.x - 4 + i * 3) * PX, top: (hand.y - 14 - k * 30) * PX, fontFamily: FONT.display, fontSize: 56, color: "#F25A7A", opacity: 1 - k, textShadow: `0 4px 0 ${C.ink}` }}>♥</div>;
            })
          : null}
      </Layer>
      <NearLayer top={194}>
        <AlbedoView albedo={set.near} lights={nearFill(lights, "#FFE8C8")} opts={{ ambient: 0.34, exposure: 1, dither: 0.4 }} />
      </NearLayer>
    </CinematicCamera>
  );
};
const OfficeHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.F + 0.05} b={T.efek - 0.05} top={268}>
      <Chip text="TAPI LAHIR SATU ISTILAH" size={50} border={ACCENT} />
    </Pop>
    {t >= T.efek && t < T.bukti - 0.05 ? <Stamp t={t} a={T.efek} text="EFEK TAMAGOTCHI" top={268} /> : null}
    <Pop t={t} a={T.bukti} b={T.kini - 0.05} top={268}>
      <Chip text="MANUSIA BISA SAYANG" sub="PADA MESIN" size={56} border={SHELL.pink} />
    </Pop>
    <Pop t={t} a={T.kini} b={CUT.OUT} top={268}>
      <Counter t={t} a={T.kini} to={98} unit="JUTA+ UNIT" sub="TOTAL TERJUAL (2025)" />
    </Pop>
  </>
);

// ================================================================= OUT (the bedroom by day)
const OutScene: React.FC<{ t: number }> = ({ t }) => {
  const egg = { x: 116, y: BED.STAND.y - 7, w: 9, cells: lcdFor("heart", t) };
  const EC = aim(egg.x, egg.y - 6);
  const cam = camAt(t, [{ t: CUT.OUT, z: 360, x: EC.x, y: EC.y }, { t: T.ikuti - 0.2, z: 300, x: EC.x - 30, y: EC.y + 10, e: ease.cameraSoft }, { t: T.ikuti + 0.9, z: 240, x: EC.x - 20, y: EC.y + 40, e: ease.cameraSoft }, { t: TOTAL, z: 250, x: EC.x - 20, y: EC.y + 40 }], 17);
  return <BedShot t={t} cam={cam} day kid={false} sticker={seg(t, T.ikuti, T.ikuti + 0.4)} egg={egg} />;
};
const OutHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.OUT + 0.1} b={T.ikuti - 0.05} top={268}>
      <Chip text="KAMU DULU PUNYA?" sub={t >= T.ceritakan ? "CERITAKAN DI KOMENTAR" : undefined} color={C.gold} size={54} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.ikuti} b={OUTRO_AT} top={268}>
      <div style={{ background: "#0B0A10", border: `8px solid ${C.gold}`, boxShadow: `0 0 0 6px ${C.ink}, 0 0 40px ${rgba(C.amber, 0.45)}`, padding: "18px 34px 22px", textAlign: "center" }}>
        <div style={{ ...pixLabel, fontSize: 40, color: ACCENT, fontWeight: 700 }}>IKUTI</div>
        <div style={{ fontFamily: FONT.display, fontSize: 110, color: C.ivory, lineHeight: 1, marginTop: 8 }}>
          AUDIRA <span style={{ color: C.gold }}>TECH</span>
        </div>
        <div style={{ ...pixLabel, fontSize: 40, color: C.gold, marginTop: 10 }}>{channel.handle}</div>
      </div>
    </Pop>
  </>
);

// ================================================================= film
export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const k = width / SCREEN.w;
  const sc = sceneAt(t);
  const flash = 0.25 * win(t, 0.05, 0.4, 0.03, 0.3) + FLASHES.reduce((s, a, i) => s + (i === 0 ? 0.5 : 0.35) * win(t, a, a + 0.26, 0.02, 0.22), 0);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {sc === "B" && <ShopScene t={t} />}
        {sc === "C" && <LcdScene t={t} />}
        {sc === "D" && <ClassScene t={t} />}
        {sc === "D2" && <CemScene t={t} />}
        {sc === "E1" && <StageScene t={t} />}
        {sc === "E2" && <WarehouseScene t={t} />}
        {sc === "F" && <OfficeScene t={t} />}
        {sc === "OUT" && <OutScene t={t} />}
        <Grade />
        <Vignette strength={sc === "C" ? 0.55 : 0.8} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={clamp(flash)} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {sc === "B" && <ShopHud t={t} />}
        {sc === "C" && <LcdHud t={t} />}
        {sc === "D" && <ClassHud t={t} />}
        {sc === "D2" && <CemHud t={t} />}
        {sc === "E1" && <StageHud t={t} />}
        {sc === "E2" && <WarehouseHud t={t} />}
        {sc === "F" && <OfficeHud t={t} />}
        {sc === "OUT" && <OutHud t={t} />}
        <Disclaimer t={t} />
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
