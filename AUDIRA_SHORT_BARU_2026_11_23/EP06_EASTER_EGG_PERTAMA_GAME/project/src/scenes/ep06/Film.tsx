// EP06 film "Easter Egg Pertama yang Terkenal di Game" (PIXELSTORY, AUDIRA TECH). Every cut on a VO word:
//   A    HOOK      the secret room (cover): rainbow wall text, the 1-pixel gray dot, AUDIRA plaque
//   B    KONTEKS   cartridge warehouse: the maker's name is wiped off the box, "DIHAPUS", ±US$22.000, 0 royalti
//   C    PENGEMB.  programmer's desk at night: Warren Robinett (generic figure), the secret room on his CRT, 1980, 1 juta kopi
//   D    PENJELAS. top-down castle map: take the dot, carry it down the corridor, the wall breaks
//   D2   PENJELAS. back in the secret room: the colour-cycling credit
//   E1   PAYOFF    teen's room: the 15-year-old finder writes to Atari, ±US$10.000 to remove it
//   E2   PAYOFF    office: Steve Wright (generic figure) keeps it, "EASTER EGG", Atari policy
//   F    PAYOFF    museum: Moonlander 1973 is older, Adventure is where the term began
//   OUT  OUTRO     the secret room again: comment CTA + follow card, then the AUDIRA card (Root)
// Everything game-like is our own drawing (corner tag). No Atari logo, no original sprites. Real people are generic sprites.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { ease } from "../../kits/pixelstory/core/motion.ts";
import { CinematicCamera, Layer, SCREEN, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { cameraAt, drift } from "../../kits/pixelstory/camera/path.ts";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import { finish } from "../../kits/pixelstory/pixel/finish.ts";
import type { Palette, Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { Exposure, Glow, Grade, Grain, LightShaft, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import channel from "../../brand/channel.json";
import { DEV, devDesk, MAP, mazeMap, MUS, museum, OFF, office, ROOM, secretRoom, TEEN, teenRoom, WH, warehouse } from "./sets.ts";
import { DEV_ANCHOR, DEV_PAL, devBack, DIR_ANCHOR, DIR_HAND, DIR_PAL, director, egg, EGG_ANCHOR, EGG_PAL, SPEC, TEEN_ANCHOR, TEEN_PAL, teenBack } from "./sprites.ts";
import { ACCENT, Captions, Chip, Disclaimer, NameCard, Pop, Stamp, VIOLET, Wipe } from "./hud.tsx";
import { BREAK, CUT, EGG_STAMP, OUTRO_AT, T, TOTAL, clamp, lerp, sceneAt, seg, win } from "./timing.ts";

export type LitLight = Light & { color?: string };
export const REST: CameraState = { x: 0, y: 0, z: 0, roll: 0, focus: 1000, aperture: 6 };
export const RAINBOW = ["#F25A54", "#F4B860", "#7FE07A", "#3FB7A8", "#5A9AD8", "#9B7BFF"];
const rainbow = (t: number, off = 0) => RAINBOW[(Math.floor(t * 4) + off) % RAINBOW.length];
const GOLD_BOX = "#F4B860";
const DOT_GRAY = "#9AA0A8";

// ---------------------------------------------------------------- caches (built once per tab)
const once = <X,>(make: () => X) => {
  let v: X | undefined;
  return () => (v ??= make());
};
const ROOM_SET = once(secretRoom);
const WH_SET = once(warehouse);
const DEV_SET = once(devDesk);
const MAP_SET = once(mazeMap);
const TEEN_SET = once(teenRoom);
const OFF_SET = once(office);
const MUS_SET = once(museum);
const SPR = once(() => {
  const f = (s: Sprite) => finish(s, SPEC);
  return { dev: f(devBack()), teen: f(teenBack()), dir: f(director(true)), egg: f(egg()) };
});

// ---------------------------------------------------------------- helpers
type Key = { t: number; e?: (k: number) => number } & Partial<CameraState>;
const camAt = (t: number, ks: Key[], seed = 1, base: CameraState = REST): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), base);
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
/** Short decaying shake after `at` (deterministic). */
const shake = (t: number, at: number, amp = 18, dur = 0.16) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor((k * 60) / 2);
  const fall = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * fall, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * fall };
};
const withShake = (c: CameraState, s: { x: number; y: number }): CameraState => ({ ...c, x: c.x + s.x, y: c.y + s.y });
/** Piecewise path through [t, x, y] keys, smoothstep between keys. */
const along = (t: number, ks: [number, number, number][]) => {
  if (t <= ks[0][0]) return { x: ks[0][1], y: ks[0][2] };
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const k = seg(t, ks[i - 1][0], ks[i][0]);
      return { x: lerp(ks[i - 1][1], ks[i][1], k), y: lerp(ks[i - 1][2], ks[i][2], k) };
    }
  }
  const l = ks[ks.length - 1];
  return { x: l[1], y: l[2] };
};
const pixLabel: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
const at = (x: number, y: number, w: number, h: number): React.CSSProperties => ({ position: "absolute", left: x * PX, top: y * PX, width: w * PX, height: h * PX });
const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

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

/** The player: a gold square, 4 × 4 art px (our own design). */
const Player: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <Glow x={x + 2} y={y + 2} r={9} color={GOLD_BOX} intensity={0.55} />
    <div style={{ ...at(x, y, 4, 4), background: GOLD_BOX, boxShadow: `inset -${PX}px -${PX}px 0 #B07A2A, inset ${PX}px ${PX}px 0 #FFE0A6` }} />
  </>
);
/** The gray dot: one art pixel. */
const Dot: React.FC<{ x: number; y: number; glow?: number }> = ({ x, y, glow = 0.5 }) => (
  <>
    <Glow x={x + 0.5} y={y + 0.5} r={5} color="#DDE4EE" intensity={glow} />
    <div style={{ ...at(x, y, 1, 1), background: DOT_GRAY }} />
  </>
);

// ================================================================= the secret room (A, D2, OUT, cover)
const roomLights = (t: number): LitLight[] => [
  { kind: "point", x: -9, y: 56, r: 100, i: 1.05 + 0.06 * Math.sin(t * 7.3), color: "#FFB070" },
  { kind: "point", x: 145, y: 56, r: 100, i: 1.05 + 0.06 * Math.sin(t * 6.1 + 1), color: "#FFB070" },
  { kind: "point", x: 67, y: 88, r: 78, i: 0.75, color: rainbow(t) },
  { kind: "point", x: 67, y: 146, r: 34, i: 0.55, color: "#DDE4EE" },
  { kind: "cone", x: 67, y: 108, r: 110, i: 1.35, angle: Math.PI / 2, spread: 0.42, color: "#FFC27A" },
];
export const RoomShot: React.FC<{ t: number; cam?: CameraState; player?: { x: number; y: number } | null; dot?: { x: number; y: number } | null; plaque?: number; ring?: number }> = ({
  t, cam = REST, player = null, dot = ROOM.DOT, plaque = 0, ring = 0,
}) => {
  const set = ROOM_SET();
  const lights = roomLights(t);
  const opts = { ambient: 0.07, exposure: 1.1, dither: 0.45 };
  const TX = ROOM.TEXT;
  const Q = ROOM.PLAQUE;
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1000}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={-9} y={56} r={30} color="#FFB070" intensity={0.55} />
        <Glow x={145} y={56} r={30} color="#FFB070" intensity={0.55} />
        <Glow x={TX.x + TX.w / 2} y={TX.y + TX.h / 2} r={50} color={rainbow(t)} intensity={0.28} squash={0.45} />
        {/* the hidden credit, our own lettering, colour-cycling like the original idea */}
        <div style={{ ...at(TX.x, TX.y, TX.w, TX.h), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ ...pixLabel, fontSize: 50, fontWeight: 700, color: rainbow(t), textShadow: `0 0 18px ${rgba(rainbow(t), 0.8)}` }}>CREATED BY</div>
          <div style={{ fontFamily: FONT.display, letterSpacing: "0.04em", lineHeight: 1, fontSize: 84, color: rainbow(t, 2), textShadow: `0 0 18px ${rgba(rainbow(t, 2), 0.8)}` }}>WARREN ROBINETT</div>
        </div>
        {/* brand plaque: part of the room */}
        <div style={{ ...at(Q.x, Q.y, Q.w, Q.h), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: C.ink, textShadow: plaque > 0.01 ? `0 0 ${10 + 30 * plaque}px ${rgba(C.glow, 0.5 + 0.5 * plaque)}` : undefined }}>
          AUDIRA
        </div>
        {plaque > 0.01 ? <Glow x={Q.x + Q.w / 2} y={Q.y + Q.h / 2} r={34} color={C.glow} intensity={0.6 * plaque} squash={0.4} /> : null}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={67} y={150} r={46} color="#FF8A5A" intensity={0.42} squash={0.32} />
        {dot ? <Dot x={dot.x} y={dot.y} glow={0.4 + 0.3 * Math.sin(t * 5) ** 2} /> : null}
        {player ? <Player x={player.x} y={player.y} /> : null}
        {ring > 0.01 && dot ? (
          <div style={{ position: "absolute", left: (dot.x + 0.5) * PX - 70, top: (dot.y + 0.5) * PX - 70, width: 140, height: 140, borderRadius: "50%", border: `8px solid ${GOLD_BOX}`, opacity: ring, transform: `scale(${1.25 - 0.25 * ring + 0.06 * Math.sin(t * 9)})`, boxSizing: "border-box", boxShadow: `0 0 24px ${rgba(GOLD_BOX, 0.7)}` }} />
        ) : null}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};

/** Cover headline. `o` fades it. Text above the wall panel (art rows 30–66) and one label between plaque and dot. */
export const CoverText: React.FC<{ o?: number }> = ({ o = 1 }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o === 1 ? undefined : o }}>
      <div style={{ position: "absolute", top: 252, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pixLabel, fontSize: 36, color: C.ink, padding: "8px 16px", background: ACCENT, fontWeight: 700 }}>AUDIRA TECH #06</div>
      </div>
      <div style={{ position: "absolute", top: 318, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT.display, lineHeight: 0.95, textShadow: `0 8px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.9)}` }}>
        <div style={{ fontSize: 128, color: C.ivory }}>NAMA YANG</div>
        <div style={{ fontSize: 132, color: C.gold }}>DISEMBUNYIKAN</div>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pixLabel, fontSize: 36, color: C.ivory, padding: "12px 20px", background: rgba(C.ink, 0.8), border: `4px solid ${GOLD_BOX}` }}>EASTER EGG PERTAMA YANG TERKENAL</div>
      </div>
    </div>
  );
};

// ================================================================= A HOOK
const DOT_CAM = { x: (ROOM.DOT.x + 0.5) * PX - SCREEN.cx, y: (ROOM.DOT.y + 0.5) * PX - SCREEN.cy };
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: 0, z: 0, y: 0 }, { t: 1.2, z: 200, x: DOT_CAM.x, y: DOT_CAM.y * 0.85, e: ease.cameraSoft }, { t: T.piksel, z: 520, x: DOT_CAM.x, y: DOT_CAM.y, e: ease.cameraSoft }, { t: T.nama + 0.2, z: 480, x: DOT_CAM.x, y: DOT_CAM.y }, { t: T.audira - 0.1, z: 130, y: -10, e: ease.cameraSoft }, { t: CUT.B, z: 60, y: 0, e: ease.cameraSoft }], 3);
  return <RoomShot t={t} cam={cam} plaque={seg(t, T.audira, T.audira + 0.3)} ring={win(t, 1.1, T.audira, 0.25, 0.25)} />;
};
export const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CoverText o={1 - seg(t, 1.0, 1.45)} />
    <Pop t={t} a={T.piksel} b={T.nama - 0.05} top={268}>
      <Chip text="1 PIKSEL" color={C.gold} border={C.gold} size={64} />
    </Pop>
    <Pop t={t} a={T.nama} b={T.audira - 0.05} top={268}>
      <Chip text="NAMA YANG DILARANG MUNCUL" size={48} border={VIOLET} />
    </Pop>
  </>
);

// ================================================================= B WAREHOUSE
const whLights = (): LitLight[] => [
  ...WH.LAMPS.map((x): LitLight => ({ kind: "cone", x, y: -6, r: 200, i: 1.3, angle: Math.PI / 2, spread: 0.55, color: "#FFD9A0" })),
  { kind: "point", x: 68, y: 120, r: 60, i: 0.6, color: "#FFE6BC" },
  { kind: "point", x: 170, y: 40, r: 120, i: 0.3, color: "#9FB8E8" },
];
const STAMP_DOWN = T.kotaknya;
const WarehouseScene: React.FC<{ t: number }> = ({ t }) => {
  const set = WH_SET();
  const lights = whLights();
  const opts = { ambient: 0.13, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.B, x: -120, z: 20, y: 0 }, { t: T.kotaknya, x: -30, z: 110, y: 40, e: ease.cameraSoft }, { t: T.alasannya, x: 0, z: 90, y: 30 }, { t: CUT.C, x: 60, z: 40, y: 0 }], 5);
  const B = WH.BOX;
  const erase = seg(t, T.menghapus + 0.1, T.kotaknya - 0.15);
  // rubber stamp drops onto the label
  const down = t < STAMP_DOWN ? seg(t, STAMP_DOWN - 0.35, STAMP_DOWN) : 1 - seg(t, STAMP_DOWN + 0.25, STAMP_DOWN + 0.7);
  const sy = lerp(40, B.y + 10, down * down);
  const inked = t >= STAMP_DOWN;
  return (
    <CinematicCamera cam={withShake(cam, shake(t, STAMP_DOWN, 22))}>
      <Layer z={1400} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {WH.LAMPS.map((x) => <Glow key={x} x={x} y={-5} r={18} color="#FFD9A0" intensity={0.6} squash={0.6} />)}
        {WH.LAMPS.map((x) => <LightShaft key={x} id={`wh${x}`} x={x} y={-6} angle={Math.PI / 2} length={170} spread={0.28} color="#FFD9A0" intensity={0.1} />)}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...at(B.x + 3, B.y + 4, B.w - 6, 12), ...pixLabel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: C.gold }}>GAME</div>
        {/* the label band: the maker's name is wiped from right to left */}
        <div style={{ ...at(B.x + 3, B.y + 20, B.w - 6, 9), overflow: "hidden" }}>
          <div style={{ ...pixLabel, position: "absolute", left: 14, top: 22, fontSize: 30, color: "#3A2A24", clipPath: `inset(0 ${erase * 100}% 0 0)` }}>PEMBUAT: ▮▮▮▮▮▮</div>
          {inked ? <div style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 10, marginTop: -5, background: "#C8323A", opacity: 0.9 }} /> : null}
        </div>
        {/* the stamp: wooden handle + red base */}
        <div style={{ position: "absolute", left: (B.x + B.w / 2 - 3) * PX, top: (sy - 14) * PX, width: 6 * PX, height: 10 * PX, background: "#7A4A26", boxShadow: `inset -${PX}px 0 0 #4A2A14` }} />
        <div style={{ position: "absolute", left: (B.x + B.w / 2 - 10) * PX, top: (sy - 4) * PX, width: 20 * PX, height: 4 * PX, background: "#9A2F35", boxShadow: `inset 0 -${PX}px 0 #5A141A` }} />
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const WarehouseHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.B + 0.05} b={T.kotaknya - 0.05} top={268}>
      <Chip text="ATARI · AKHIR 1970-AN" color={C.gold} size={56} />
    </Pop>
    {t >= T.kotaknya && t < T.alasannya - 0.05 ? <Stamp t={t} a={T.kotaknya} text="DIHAPUS" sub="NAMA PEMBUAT GAME" top={268} color="#E0484E" /> : null}
    <Pop t={t} a={T.alasannya} b={T.gajinya - 0.05} top={268}>
      <Chip text="AGAR TIDAK DIBAJAK PESAING" size={52} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.gajinya} b={CUT.C} top={268}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Chip text="±US$22.000 / TAHUN" color={C.gold} border={C.gold} size={60} />
        {t >= T.tanpa ? <Chip text="0 ROYALTI" color="#FF8A80" border="#E0484E" size={56} /> : null}
      </div>
    </Pop>
  </>
);

// ================================================================= C PROGRAMMER'S DESK
const SCREEN_C = { x: DEV.SCREEN.x + DEV.SCREEN.w / 2, y: DEV.SCREEN.y + DEV.SCREEN.h / 2 };
const devLights = (t: number, lamp: { x: number; y: number }): LitLight[] => [
  { kind: "point", x: SCREEN_C.x, y: SCREEN_C.y, r: 90, i: 1.0 + 0.35 * win(t, T.ruang, T.game, 0.3, 0.3), color: t >= T.ruang && t < T.game ? rainbow(t) : "#7FE0D0" },
  { kind: "cone", x: lamp.x, y: lamp.y, r: 110, i: 1.1, angle: Math.atan2(1, -0.7), spread: 0.6, color: "#FFC27A" },
  { kind: "point", x: DEV.WIN.x + 25, y: DEV.WIN.y + 30, r: 80, i: 0.35, color: "#9FB8E8" },
];
const CODE = ["LDA #$1F", "STA ROOM", "JSR DRAW", "LDX DOT", "CMP #$00", "BNE WALL", "INC ROOM", "JMP LOOP"];
const CrtContent: React.FC<{ t: number }> = ({ t }) => {
  const S = DEV.SCREEN;
  const box: React.CSSProperties = { ...at(S.x, S.y, S.w, S.h), overflow: "hidden", background: "#06110F" };
  if (t >= T.game)
    return (
      <div style={{ ...box, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ ...pixLabel, fontSize: 26, color: "#7FE0D0" }}>RILIS</div>
        <div style={{ fontFamily: FONT.display, fontSize: 96, color: C.gold, lineHeight: 1 }}>1980</div>
      </div>
    );
  if (t >= T.ruang)
    return (
      <div style={{ ...box, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 240, height: 160, border: `8px solid ${rainbow(t, 1)}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
          <div style={{ ...pixLabel, fontSize: 52, fontWeight: 700, color: rainbow(t) }}>W.R.</div>
        </div>
      </div>
    );
  const n = Math.floor((t - CUT.C) * 3);
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{ ...box, padding: 14, boxSizing: "border-box" }}>
      {Array.from({ length: 7 }, (_, i) => {
        const line = CODE[(n + i) % CODE.length];
        return (
          <div key={i} style={{ ...pixLabel, fontSize: 22, color: "#7FE0D0", marginBottom: 8 }}>
            {line}
            {i === 6 && blink ? " ▮" : ""}
          </div>
        );
      })}
    </div>
  );
};
const DeskScene: React.FC<{ t: number }> = ({ t }) => {
  const set = DEV_SET();
  const spr = SPR();
  const lights = devLights(t, set.lamp.bulb);
  const ambient = 0.11;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const sc = { x: SCREEN_C.x * PX - SCREEN.cx, y: SCREEN_C.y * PX - SCREEN.cy };
  const cam = camAt(t, [{ t: CUT.C, x: -60, z: 10, y: 40 }, { t: T.hampir, x: 0, z: 60, y: 0, e: ease.cameraSoft }, { t: T.ruang - 0.6, x: 40, z: 90, y: -20 }, { t: T.ruang + 0.6, x: sc.x, y: sc.y, z: 330, e: ease.cameraSoft }, { t: T.game - 0.3, x: sc.x, y: sc.y, z: 360 }, { t: T.game + 0.7, x: 40, z: 120, y: 30, e: ease.cameraSoft }, { t: CUT.D, x: 10, z: 70, y: 60 }], 7);
  const typing = t < T.ruang ? Math.sin(t * 22) * 0.4 : 0;
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={6}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <CrtContent t={t} />
        <Glow x={SCREEN_C.x} y={SCREEN_C.y} r={34} color={t >= T.ruang && t < T.game ? rainbow(t) : "#7FE0D0"} intensity={0.45} squash={0.8} />
        <Glow x={set.lamp.bulb.x} y={set.lamp.bulb.y} r={16} color="#FFC27A" intensity={0.6} />
        <Lit s={spr.dev} pal={DEV_PAL} x={DEV.SEAT.x} y={DEV.SEAT.y + typing} lights={lights} ambient={ambient} anchor={DEV_ANCHOR} scale={PX * 1.5} rim="#7FE0D0" />
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const DeskHud: React.FC<{ t: number }> = ({ t }) => {
  const copies = lerp(0, 1000000, seg(t, T.terjual + 0.1, T.sejuta + 0.3));
  return (
    <>
      <Pop t={t} a={T.warren - 0.3} b={T.hampir - 0.05} top={268} left={60} origin="0% 50%">
        <NameCard name="WARREN ROBINETT" role="PROGRAMMER ATARI" />
      </Pop>
      <Pop t={t} a={T.hampir} b={T.diamDiam - 0.05} top={268}>
        <Chip text="±1 TAHUN · SENDIRIAN" sub="ADVENTURE · 1978–1979" color={C.gold} size={52} />
      </Pop>
      <Pop t={t} a={T.diamDiam} b={T.game - 0.05} top={268}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Chip text="RUANG RAHASIA" color={C.gold} border={VIOLET} size={60} />
          {t >= T.tanpaMemberi ? <Chip text="TANPA MEMBERI TAHU SIAPA PUN" size={44} /> : null}
        </div>
      </Pop>
      <Pop t={t} a={T.maret} b={T.terjual - 0.05} top={268}>
        <Chip text="RILIS MARET 1980" color={C.gold} border={C.gold} size={60} />
      </Pop>
      <Pop t={t} a={T.terjual} b={CUT.D} top={268}>
        <div style={{ background: rgba(C.ink, 0.88), border: `6px solid ${C.gold}`, padding: "14px 30px", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 104, color: C.gold, lineHeight: 1 }}>{fmt(copies)}{t >= T.sejuta + 0.3 ? "+" : ""}</div>
          <div style={{ ...pixLabel, fontSize: 40, color: C.ivory, marginTop: 8 }}>KOPI TERJUAL</div>
        </div>
      </Pop>
    </>
  );
};

// ================================================================= D CASTLE MAP (top-down)
const PICK = 38.3;
const playerPath = (t: number) =>
  along(t, [
    [CUT.D, 40, 100],
    [CUT.D + 0.6, 40, 100],
    [PICK, 16, 117],
    [T.bawa, 16, 117],
    [T.bawa + 0.45, 40, 117],
    [T.bawa + 0.9, 40, 132],
    [T.dinding, 144, 132],
    [BREAK, 145, 132],
    [BREAK + 0.6, 163, 135],
  ]);
const mapLights = (t: number, p: { x: number; y: number }): LitLight[] => [
  { kind: "point", x: p.x + 2, y: p.y + 2, r: 46, i: 1.15, color: "#FFE0A6" },
  { kind: "point", x: MAP.GOLD.x + 24, y: MAP.GOLD.y + 17, r: 60, i: 0.7, color: "#FFD27A" },
  { kind: "point", x: MAP.BLACK.x + 24, y: MAP.BLACK.y + 17, r: 50, i: 0.35, color: "#9B7BFF" },
  { kind: "point", x: 168, y: 137, r: 44, i: 1.3 * seg(t, BREAK, BREAK + 0.3), color: rainbow(t) },
];
const Shards: React.FC<{ t: number }> = ({ t }) => {
  if (t < BREAK) return <div style={{ ...at(MAP.WALL_X, MAP.HALL_Y - 7, 4, 18), background: "#C9B48E", boxShadow: `inset -${PX}px 0 0 #8A7656, inset ${PX}px 0 0 #E6D4AE` }} />;
  const k = t - BREAK;
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const vx = 6 + hash(i * 7) * 22;
        const vy = (hash(i * 11) - 0.5) * 30;
        const x = MAP.WALL_X + 1 + vx * k;
        const y = MAP.HALL_Y - 6 + (i % 7) * 2.5 + vy * k + 18 * k * k;
        return <div key={i} style={{ ...at(x, y, 1.5, 1.5), background: i % 3 ? "#C9B48E" : "#E6D4AE", opacity: 1 - clamp(k / 1.1) }} />;
      })}
    </>
  );
};
const MapScene: React.FC<{ t: number }> = ({ t }) => {
  const a = MAP_SET();
  const p = playerPath(t);
  const lights = mapLights(t, p);
  const carried = t >= PICK;
  const follow = { x: (p.x + 2) * PX - SCREEN.cx, y: (p.y + 2) * PX - SCREEN.cy };
  const zk = camAt(t, [{ t: CUT.D, z: 180 }, { t: PICK - 0.4, z: 300, e: ease.cameraSoft }, { t: T.ukurannya + 0.2, z: 470, e: ease.cameraSoft }, { t: T.bawa, z: 450 }, { t: T.bawa + 0.8, z: 300, e: ease.cameraSoft }, { t: BREAK, z: 360 }, { t: CUT.D2, z: 400 }], 9);
  const cam: CameraState = withShake({ ...zk, x: zk.x + follow.x, y: zk.y + follow.y - 60, aperture: 0 }, shake(t, BREAK, 28, 0.2));
  const lab = (text: string, x: number, y: number, color: string) => (
    <div style={{ ...pixLabel, position: "absolute", left: x * PX, top: y * PX, transform: "translateX(-50%)", fontSize: 30, fontWeight: 700, color, textShadow: `0 4px 0 ${C.ink}` }}>{text}</div>
  );
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1000}>
        <AlbedoView albedo={a} lights={lights} opts={{ ambient: 0.55, exposure: 1.3, dither: 0.4 }} />
        <div style={{ position: "absolute", left: (p.x + 2) * PX - 1600, top: (p.y + 2) * PX - 1600, width: 3200, height: 3200, background: `radial-gradient(circle, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 240px, ${rgba("#0B0910", 0.6)} 820px)`, pointerEvents: "none" }} />
        {lab("KASTIL HITAM", MAP.BLACK.x + MAP.BLACK.w / 2, MAP.BLACK.y - 13, VIOLET)}
        {lab("KATAKOMBE", MAP.CATA.x + MAP.CATA.w / 2 + 6, MAP.CATA.y + 30, "#C7B8FF")}
        {lab("KASTIL EMAS", MAP.GOLD.x + MAP.GOLD.w / 2, MAP.GOLD.y - 13, C.gold)}
        {t >= BREAK ? lab("RUANG RAHASIA", MAP.SECRET.x + MAP.SECRET.w / 2, MAP.SECRET.y - 8, rainbow(t)) : null}
        {t >= BREAK ? <Glow x={MAP.SECRET.x + MAP.SECRET.w / 2} y={MAP.SECRET.y + MAP.SECRET.h / 2} r={MAP.SECRET.w * 0.7} color={rainbow(t)} intensity={0.45} /> : null}
        <Glow x={p.x + 2} y={p.y + 2} r={40} color="#FFE0A6" intensity={0.6} />
        <Shards t={t} />
        {!carried ? <Dot x={MAP.DOT.x} y={MAP.DOT.y} glow={0.5 + 0.3 * Math.sin(t * 6) ** 2} /> : <Dot x={p.x + 5} y={p.y + 1} glow={0.6} />}
        {t >= T.ukurannya && t < T.bawa ? (
          <div style={{ position: "absolute", left: (MAP.DOT.x + 5.5) * PX - 34, top: (MAP.DOT.y + 1.5) * PX - 34, width: 68, height: 68, border: `5px solid ${GOLD_BOX}`, borderRadius: "50%", boxSizing: "border-box", opacity: 0.6 + 0.4 * Math.sin(t * 10) ** 2 }} />
        ) : null}
        <Player x={p.x} y={p.y} />
      </Layer>
    </CinematicCamera>
  );
};
/** Screen-space foreground for the top-down map: blurred dark stone columns with torches, parallax against the camera. */
const MapFG: React.FC<{ t: number }> = ({ t }) => {
  const p = playerPath(t);
  const px = Math.max(-70, Math.min(70, -(p.x - 80) * 1.2 + Math.sin(t * 0.7) * 20));
  const flick = (s: number) => 0.85 + 0.15 * Math.sin(t * 9 + s);
  const col = (left: number, top: number, w: number, h: number, s: number) => (
    <>
      <div style={{ position: "absolute", left: left + px, top, width: w, height: h, borderRadius: 40, background: "linear-gradient(90deg, #0B0910 0%, #1C1620 55%, #0B0910 100%)", filter: "blur(16px)", opacity: 0.94 }} />
      <div style={{ position: "absolute", left: left + px + w / 2 - 110, top: top + 120, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${rgba("#FFC27A", 0.75 * flick(s))} 0%, ${rgba("#FF8A3A", 0.25)} 40%, rgba(0,0,0,0) 70%)`, filter: "blur(6px)", mixBlendMode: "screen" }} />
    </>
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {col(-170, 520, 300, 1500, 0)}
      {col(950, 380, 320, 1600, 2)}
    </div>
  );
};
export const MapHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.D + 0.05} b={T.ambil - 0.05} top={268}>
      <Chip text="CARA MENEMUKANNYA" color={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.ambil} b={T.ukurannya - 0.05} top={268}>
      <Chip text="1 · AMBIL TITIK ABU-ABU" sub="KATAKOMBE KASTIL HITAM" size={42} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.ukurannya} b={T.bawa - 0.05} top={268}>
      <Chip text="UKURAN: 1 PIKSEL" color={C.gold} border={C.gold} size={60} />
    </Pop>
    <Pop t={t} a={T.bawa} b={T.dinding - 0.05} top={268}>
      <Chip text="2 · BAWA KE UJUNG LORONG" sub="DI BAWAH KASTIL EMAS" size={42} border={C.gold} />
    </Pop>
    <Pop t={t} a={T.dinding} b={CUT.D2} top={268}>
      <Chip text="3 · DINDING BISA DITEMBUS" color={C.ivory} size={42} border={ACCENT} />
    </Pop>
  </>
);

// ================================================================= D2 back in the room
const TEXT_CAM = { x: (ROOM.TEXT.x + ROOM.TEXT.w / 2) * PX - SCREEN.cx, y: (ROOM.TEXT.y + ROOM.TEXT.h / 2) * PX - SCREEN.cy };
const RoomRevealScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.D2, z: -30, y: 0 }, { t: T.tulisan, z: 50, x: TEXT_CAM.x, y: TEXT_CAM.y + 40, e: ease.cameraSoft }, { t: CUT.E1, z: 95, x: TEXT_CAM.x, y: TEXT_CAM.y + 30 }], 13);
  return <RoomShot t={t} cam={cam} player={{ x: 58, y: 144 }} dot={{ x: 64, y: 147 }} plaque={0.4} />;
};
export const RoomRevealHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.D2 + 0.1} b={T.tulisan - 0.05} top={268}>
      <Chip text="RUANG RAHASIA" color={C.gold} border={VIOLET} size={60} />
    </Pop>
    <Pop t={t} a={T.tulisan} b={T.dibuat - 0.05} top={268}>
      <Chip text="TULISAN BERGANTI WARNA" size={52} border={rainbow(t)} />
    </Pop>
    <Pop t={t} a={T.dibuat} b={CUT.E1} top={268}>
      <Chip text="DIBUAT OLEH" sub="WARREN ROBINETT" color={C.ivory} border={C.gold} size={52} />
    </Pop>
  </>
);

// ================================================================= E1 TEEN'S ROOM
const TV_C = { x: TEEN.SCREEN.x + TEEN.SCREEN.w / 2, y: TEEN.SCREEN.y + TEEN.SCREEN.h / 2 };
const teenLights = (t: number): LitLight[] => [
  { kind: "point", x: TV_C.x, y: TV_C.y, r: 90, i: 1.15, color: rainbow(t) },
  { kind: "point", x: TEEN.WIN.x + 20, y: TEEN.WIN.y + 24, r: 80, i: 0.35, color: "#9FB8E8" },
  { kind: "point", x: -20, y: 90, r: 90, i: 0.55, color: "#FFC27A" },
];
const TeenScene: React.FC<{ t: number }> = ({ t }) => {
  const set = TEEN_SET();
  const spr = SPR();
  const lights = teenLights(t);
  const ambient = 0.12;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.E1, x: -40, z: 30, y: 30 }, { t: T.menyurati, x: 20, z: 90, y: 0, e: ease.cameraSoft }, { t: CUT.E2, x: 60, z: 150, y: -20 }], 15);
  const S = TEEN.SCREEN;
  // the letter rises from the teen and flies out to the right
  const lk = clamp((t - (T.menyurati - 0.2)) / 1.4);
  const letter = t >= T.menyurati - 0.2 && lk < 1 ? { x: lerp(44, 170, lk * lk), y: lerp(100, 40, lk) - Math.sin(lk * Math.PI) * 20, r: lerp(-10, 25, lk) } : null;
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={6}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...at(S.x, S.y, S.w, S.h), background: "#05070C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, overflow: "hidden" }}>
          <div style={{ ...pixLabel, fontSize: 18, color: rainbow(t), fontWeight: 700 }}>CREATED BY</div>
          <div style={{ fontFamily: FONT.display, lineHeight: 1, fontSize: 30, color: rainbow(t, 2) }}>W. ROBINETT</div>
        </div>
        <Glow x={TV_C.x} y={TV_C.y} r={30} color={rainbow(t)} intensity={0.45} squash={0.8} />
        <Lit s={spr.teen} pal={TEEN_PAL} x={TEEN.SIT.x} y={TEEN.SIT.y} lights={lights} ambient={ambient} anchor={TEEN_ANCHOR} scale={PX * 1.9} rim={rainbow(t)} />
        {letter ? (
          <div style={{ position: "absolute", left: letter.x * PX, top: letter.y * PX, width: 14 * PX, height: 9 * PX, background: "#F3E6CC", transform: `rotate(${letter.r}deg)`, boxShadow: `inset 0 -${PX}px 0 #BCAF98, 0 0 20px rgba(255,240,210,0.5)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, borderLeft: `${7 * PX}px solid transparent`, borderRight: `${7 * PX}px solid transparent`, borderTop: `${5 * PX}px solid #D8C8A8` }} />
          </div>
        ) : null}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const TeenHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E1 + 0.05} b={T.menyurati - 0.05} top={268}>
      <Chip text="REMAJA 15 TAHUN" sub={t >= T.salt ? "SALT LAKE CITY, AS" : undefined} color={C.gold} size={58} />
    </Pop>
    <Pop t={t} a={T.menyurati} b={T.menghapusnya - 0.05} top={268}>
      <Chip text="MENYURATI ATARI" size={60} border={VIOLET} />
    </Pop>
    <Pop t={t} a={T.menghapusnya} b={CUT.E2} top={268}>
      <Chip text="BIAYA HAPUS: ±US$10.000" sub={t >= T.sepuluh ? "UNTUK CHIP ROM BARU" : undefined} color={C.gold} border={C.gold} size={54} />
    </Pop>
  </>
);

// ================================================================= E2 OFFICE
const offLights = (): LitLight[] => [
  { kind: "point", x: OFF.WIN.x + 33, y: OFF.WIN.y + 36, r: 150, i: 1.15, color: "#FFF0D8" },
  { kind: "point", x: OFF.BOARD.x + 33, y: OFF.BOARD.y + 25, r: 70, i: 0.45, color: "#EAF2FF" },
  { kind: "point", x: 40, y: 110, r: 70, i: 0.4, color: "#FFD9A0" },
];
const EGG_DROPS = [
  { at: EGG_STAMP + 0.1, x: 8, pal: EGG_PAL },
  { at: EGG_STAMP + 0.4, x: 34, pal: { ...EGG_PAL, r: "#3FB7A8", R: "#1F6B66", q: "#8FE6D8", t: "#9B7BFF", T: "#5A3FB0", a: "#C7B8FF" } },
  { at: T.telur, x: 60, pal: { ...EGG_PAL, r: "#F25A54", R: "#9A2F35", q: "#FF8A80", t: "#F4B860", T: "#B07A2A", a: "#FFE0A6" } },
];
const OfficeScene: React.FC<{ t: number }> = ({ t }) => {
  const set = OFF_SET();
  const spr = SPR();
  const lights = offLights();
  const ambient = 0.2;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.E2, x: -70, z: 40, y: -30 }, { t: T.steve, x: -20, z: 70, y: -20, e: ease.cameraSoft }, { t: EGG_STAMP, x: 0, z: 110, y: 0 }, { t: T.atariKebijakan, x: -60, z: 90, y: -40, e: ease.cameraSoft }, { t: CUT.F, x: -90, z: 130, y: -50 }], 19);
  const Bd = OFF.BOARD;
  const S = 1.6;
  const hand = { x: OFF.STAND.x + DIR_HAND.x * S, y: OFF.STAND.y + DIR_HAND.y * S };
  const bob = Math.sin(t * 3) * 0.4;
  return (
    <CinematicCamera cam={withShake(cam, shake(t, EGG_STAMP, 20))}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={OFF.WIN.x + 33} y={OFF.WIN.y + 36} r={50} color="#FFF0D8" intensity={0.35} squash={0.9} />
        {/* whiteboard marker drawings */}
        <div style={{ ...at(Bd.x, Bd.y, Bd.w, Bd.h), display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", paddingRight: 30, boxSizing: "border-box", gap: 10 }}>
          {t >= T.steve ? (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 70, height: 92, borderRadius: "50% 50% 46% 46% / 60% 60% 40% 40%", border: "6px solid #2A4C8C", boxSizing: "border-box" }} />
              <div style={{ fontFamily: FONT.display, fontSize: 90, color: "#B8222E", lineHeight: 1 }}>?</div>
            </div>
          ) : null}
          {t >= T.atariKebijakan ? (
            <div style={{ ...pixLabel, fontSize: 24, color: "#1E3A6A", textAlign: "right", lineHeight: 1.3 }}>{"GAME BERIKUTNYA\n+ EASTER EGG"}</div>
          ) : null}
        </div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Lit s={spr.dir} pal={DIR_PAL} x={OFF.STAND.x} y={OFF.STAND.y} lights={lights} ambient={ambient} anchor={DIR_ANCHOR} scale={PX * S} />
        <Glow x={hand.x} y={hand.y - 5} r={10} color="#FFF4DC" intensity={0.3 + 0.3 * seg(t, EGG_STAMP - 0.2, EGG_STAMP)} />
        <Lit s={spr.egg} pal={EGG_PAL} x={hand.x} y={hand.y + bob} lights={lights} ambient={ambient} anchor={EGG_ANCHOR} scale={PX * S} />
        {EGG_DROPS.map((d, i) => {
          if (t < d.at) return null;
          const k = t - d.at;
          const fall = Math.min(1, k / 0.35);
          const bounce = k > 0.35 ? Math.abs(Math.sin((k - 0.35) * 9)) * 8 * Math.exp(-(k - 0.35) * 5) : 0;
          const y = lerp(10, OFF.DESK, fall * fall) - bounce;
          return <Lit key={i} s={spr.egg} pal={d.pal} x={d.x} y={y} lights={lights} ambient={ambient} anchor={EGG_ANCHOR} scale={PX * 1.4} />;
        })}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.14, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const OfficeHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E2 + 0.05} b={T.steve - 0.05} top={268}>
      <Chip text="KEPUTUSAN ATARI" size={56} border={C.gold} />
    </Pop>
    <Pop t={t} a={T.steve} b={EGG_STAMP - 0.05} top={268} left={60} origin="0% 50%">
      <NameCard name="STEVE WRIGHT" role={"DIREKTUR PENGEMBANGAN\nSOFTWARE ATARI"} />
    </Pop>
    {t >= EGG_STAMP && t < T.atariKebijakan - 0.05 ? <Stamp t={t} a={EGG_STAMP} text="EASTER EGG" sub="SEPERTI BERBURU TELUR PASKAH" top={268} /> : null}
    <Pop t={t} a={T.atariKebijakan} b={CUT.F} top={268}>
      <Chip text="JADI KEBIJAKAN ATARI" sub="GAME BERIKUTNYA DISARANKAN PUNYA EASTER EGG" color={C.gold} border={C.gold} size={50} />
    </Pop>
  </>
);

// ================================================================= F MUSEUM
const musLights = (t: number): LitLight[] => [
  { kind: "cone", x: MUS.P1.x + MUS.P1.w / 2, y: -18, r: 200, i: 1.8 * seg(t, CUT.F, CUT.F + 0.4), angle: Math.PI / 2, spread: 0.4, color: "#DDE6FF" },
  { kind: "cone", x: MUS.P2.x + MUS.P2.w / 2, y: -18, r: 200, i: 0.35 + 1.6 * seg(t, T.tapi, T.tapi + 0.4), angle: Math.PI / 2, spread: 0.4, color: "#FFE0A6" },
];
const Panel: React.FC<{ P: { x: number; y: number; w: number; h: number }; year: string; name: string; on: number; color: string; children: React.ReactNode }> = ({ P, year, name, on, color, children }) => (
  <div style={{ ...at(P.x, P.y, P.w, P.h), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.35 + 0.65 * on }}>
    <div style={{ fontFamily: FONT.display, fontSize: 92, color, lineHeight: 1 }}>{year}</div>
    <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    <div style={{ ...pixLabel, fontSize: 30, color: C.ivory, fontWeight: 700 }}>{name}</div>
  </div>
);
const MuseumScene: React.FC<{ t: number }> = ({ t }) => {
  const set = MUS_SET();
  const lights = musLights(t);
  const opts = { ambient: 0.1, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.F, x: -280, z: 60, y: -170 }, { t: T.tapi, x: 0, z: 40, y: -170, e: ease.cameraSoft }, { t: CUT.OUT, x: 296, z: 90, y: -180 }], 23);
  const on1 = seg(t, CUT.F, CUT.F + 0.4);
  const on2 = seg(t, T.tapi, T.tapi + 0.4);
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1000}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={MUS.P1.x + MUS.P1.w / 2} y={-16} r={12} color="#DDE6FF" intensity={0.6 * on1} squash={0.6} />
        <Glow x={MUS.P2.x + MUS.P2.w / 2} y={-16} r={12} color="#FFE0A6" intensity={0.2 + 0.5 * on2} squash={0.6} />
        <LightShaft id="m1" x={MUS.P1.x + MUS.P1.w / 2} y={-18} angle={Math.PI / 2} length={150} spread={0.2} color="#DDE6FF" intensity={0.12 * on1} />
        <LightShaft id="m2" x={MUS.P2.x + MUS.P2.w / 2} y={-18} angle={Math.PI / 2} length={150} spread={0.2} color="#FFE0A6" intensity={0.14 * on2} />
        <Panel P={MUS.P1} year="1973" name="MOONLANDER" on={on1} color="#BFD6FF">
          {/* generic lander glyph: body, legs, flame */}
          <div style={{ position: "relative", width: 90, height: 80 }}>
            <div style={{ position: "absolute", left: 25, top: 4, width: 40, height: 30, background: "#BFD6FF" }} />
            <div style={{ position: "absolute", left: 14, top: 34, width: 10, height: 30, background: "#8AA0C8", transform: "skewX(20deg)" }} />
            <div style={{ position: "absolute", left: 66, top: 34, width: 10, height: 30, background: "#8AA0C8", transform: "skewX(-20deg)" }} />
            <div style={{ position: "absolute", left: 38, top: 36, width: 14, height: 14 + 8 * Math.abs(Math.sin(t * 14)), background: "#F4B860" }} />
          </div>
        </Panel>
        <Panel P={MUS.P2} year="1980" name="ADVENTURE" on={on2} color={C.gold}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 32, height: 32, background: GOLD_BOX }} />
            <div style={{ width: 8, height: 8, background: DOT_GRAY, boxShadow: "0 0 12px #DDE4EE" }} />
            <div style={{ ...pixLabel, fontSize: 26, color: rainbow(t) }}>EGG</div>
          </div>
        </Panel>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: 50 * PX, top: (MUS.RAIL - 9) * PX, fontSize: 30, fontWeight: 700, color: C.gold }}>AUDIRA</div>
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const MuseumHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.F + 0.05} b={T.tapi - 0.05} top={268}>
      <Chip text="BUKAN PERTAMA" sub="MOONLANDER 1973 LEBIH TUA" size={56} border="#BFD6FF" />
    </Pop>
    <Pop t={t} a={T.tapi} b={CUT.OUT} top={268}>
      <Chip text="ASAL ISTILAH EASTER EGG" sub="ADVENTURE · 1980" color={C.gold} border={C.gold} size={56} />
    </Pop>
  </>
);

// ================================================================= OUT (back to the room)
const OutScene: React.FC<{ t: number }> = ({ t }) => {
  // floor-level close on the player holding the dot (f1 is the wide wall shot), then rise to the AUDIRA plaque on "Ikuti"
  const floor = { x: (62 + 0.5) * PX - SCREEN.cx, y: 146 * PX - SCREEN.cy };
  const plaque = { x: (ROOM.PLAQUE.x + ROOM.PLAQUE.w / 2) * PX - SCREEN.cx, y: (ROOM.PLAQUE.y + 4) * PX - SCREEN.cy };
  const cam = camAt(t, [{ t: CUT.OUT, z: 640, x: floor.x - 30, y: floor.y - 20 }, { t: T.ikuti - 0.2, z: 600, x: floor.x + 20, y: floor.y - 40, e: ease.cameraSoft }, { t: T.ikuti + 0.9, z: 420, x: plaque.x, y: plaque.y + 90, e: ease.cameraSoft }, { t: TOTAL, z: 440, x: plaque.x, y: plaque.y + 80 }], 17);
  // CTA part: top-down map, the player resting inside the opened secret room (different from the hook's wall shot)
  if (t < T.ikuti) return <><MapScene t={t} /><MapFG t={t} /></>;
  return <RoomShot t={t} cam={cam} player={{ x: 56, y: 143 }} dot={{ x: 62, y: 144 }} plaque={seg(t, T.ikuti, T.ikuti + 0.4)} ring={0.7} />;
};
export const OutHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.OUT + 0.1} b={T.ikuti - 0.05} top={268}>
      <Chip text="KAMU PERNAH NEMU?" sub={t >= T.tulis ? "TULIS DI KOMENTAR" : "EASTER EGG DI GAME"} color={C.gold} size={50} border={VIOLET} />
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
  const flash =
    0.3 * win(t, 0.05, 0.4, 0.03, 0.3) +
    0.4 * win(t, BREAK, BREAK + 0.26, 0.02, 0.22) +
    0.3 * win(t, CUT.D2, CUT.D2 + 0.24, 0.01, 0.22) +
    0.3 * win(t, EGG_STAMP, EGG_STAMP + 0.24, 0.02, 0.2) +
    0.14 * win(t, T.kotaknya, T.kotaknya + 0.2, 0.02, 0.15);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {sc === "B" && <WarehouseScene t={t} />}
        {sc === "C" && <DeskScene t={t} />}
        {sc === "D" && <MapScene t={t} />}
        {sc === "D" && <MapFG t={t} />}
        {sc === "D2" && <RoomRevealScene t={t} />}
        {sc === "E1" && <TeenScene t={t} />}
        {sc === "E2" && <OfficeScene t={t} />}
        {sc === "F" && <MuseumScene t={t} />}
        {sc === "OUT" && <OutScene t={t} />}
        <Grade />
        <Vignette strength={0.8} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {sc === "B" && <WarehouseHud t={t} />}
        {sc === "C" && <DeskHud t={t} />}
        {sc === "D" && <MapHud t={t} />}
        {sc === "D2" && <RoomRevealHud t={t} />}
        {sc === "E1" && <TeenHud t={t} />}
        {sc === "E2" && <OfficeHud t={t} />}
        {sc === "F" && <MuseumHud t={t} />}
        {sc === "OUT" && <OutHud t={t} />}
        <Disclaimer t={t} />
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
