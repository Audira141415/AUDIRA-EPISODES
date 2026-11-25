// EP19 film "Flappy Bird — game ±US$50.000/hari yang dihapus pembuatnya" (PIXELSTORY). Every cut on a VO word:
//   A    HOOK      night desk, the phone runs the game; counter US$50.000/HARI; a finger presses HAPUS; screen dies
//   B    KONTEKS   small Hanoi room, a coder from behind; FLAPPY BIRD, Dong Nguyen, .Gears, a few days, 24 May 2013, quiet
//   C1   PENGEMB.  city at dusk, giant chart billboard: January 2014 explodes, #1 free app (US, China, UK)
//   C2   PENGEMB.  the game full screen: tap = up, one gap = one point, 10 bronze, 40 platinum
//   D1   PENJELAS. desk again, the coin jar fills: ±US$50.000 per day (to The Verge); then the phone floods with messages
//   D2   PENJELAS. the laptop close: 8 Feb 2014 post, 22-hour countdown, "bukan soal hukum"
//   E1   PAYOFF    app shop wall, the bird's box dissolves: not found; Forbes: "produk yang adiktif"
//   E2   PAYOFF    auction gallery: a phone with the game in a glass case, bids > US$90.000, listing taken down
//   OUT  OUTRO     back at the desk, the bird asleep on a dark screen; "KAMU BERANI HAPUS?"; AUDIRA card (Root)
// Original pixel bird and brick towers only (no assets or look of the original game). Facts from research/SOURCE_REGISTER.md.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { ease } from "../../kits/pixelstory/core/motion.ts";
import { CinematicCamera, Layer, SCREEN, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { cameraAt, drift } from "../../kits/pixelstory/camera/path.ts";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import { Exposure, Glow, Grade, Grain, LightShaft, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { AUC, auctionSet, CITY, citySet, DESK, deskSet, ROOM, roomSet, STORE, storeSet } from "./sets.ts";
import { CODER_ANCHOR, CODER_PAL, coderBack } from "./sprites.ts";
import { Bird, GameView, NEON } from "./game.tsx";
import { Captions, Chip, GREEN, NameCard, Pop, RED, Stamp, Wipe } from "./hud.tsx";
import { CUT, T, TOTAL, clamp, lerp, sceneAt, seg, win } from "./timing.ts";

type LitLight = Light & { color?: string };

// ---------------------------------------------------------------- caches
const once = <X,>(make: () => X) => {
  let v: X | undefined;
  return () => (v ??= make());
};
const DESK_SET = once(deskSet);
const ROOM_SET = once(roomSet);
const CITY_SET = once(citySet);
const STORE_SET = once(storeSet);
const AUC_SET = once(auctionSet);
const CODER = once(coderBack);

// ---------------------------------------------------------------- helpers
export const BASE_CAM: CameraState = { x: 0, y: 0, z: 0, roll: 0, focus: 1000, aperture: 6 };
type Key = { t: number; e?: (k: number) => number } & Partial<CameraState>;
const camAt = (t: number, ks: Key[], seed = 1): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), BASE_CAM);
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
const shake = (t: number, at: number, amp = 18, dur = 0.16) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor((k * 60) / 2);
  const fall = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * fall, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * fall };
};
const pix: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
const box = (border: string): React.CSSProperties => ({ background: rgba(C.ink, 0.88), border: `6px solid ${border}`, boxShadow: `0 8px 0 ${rgba(C.ink, 0.9)}`, padding: "16px 26px" });
const money = (v: number) => `US$${Math.round(v).toLocaleString("de-DE")}`;
/** Screen-px rect of an art-px region on the subject plane. */
const at = (r: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({ position: "absolute", left: r.x * PX, top: r.y * PX, width: r.w * PX, height: r.h * PX, overflow: "hidden" });

// ================================================================= desk set (A, D1, OUT)
const deskLights = (t: number, screen: number): LitLight[] => {
  const s = DESK_SET();
  return [
    { kind: "cone", x: s.bulb.x, y: s.bulb.y, r: 150, i: 1.25, angle: s.lampAngle, spread: 0.55, color: "#FFC27A" },
    { kind: "point", x: DESK.SCREEN.x + 24, y: DESK.SCREEN.y + 40, r: 70, i: 0.95 * screen + 0.05 * Math.sin(t * 7), color: "#9FF0E2" },
    { kind: "point", x: DESK.WIN.x + 16, y: DESK.WIN.y + 20, r: 60, i: 0.35, color: "#BFD6FF" },
  ];
};
const DeskStage: React.FC<{ t: number; cam: CameraState; screen: number; children?: React.ReactNode; jar?: React.ReactNode }> = ({ t, cam, screen, children, jar }) => {
  const set = DESK_SET();
  const lights = deskLights(t, screen);
  const opts = { ambient: 0.11, exposure: 1.1, dither: 0.45 };
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={DESK.WIN.x + 16} y={DESK.WIN.y + 18} r={14} color="#DDE8FF" intensity={0.3} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={set.bulb.x} y={set.bulb.y} r={18} color="#FFC27A" intensity={0.55} squash={0.8} />
        <LightShaft id="desk" x={set.bulb.x} y={set.bulb.y} angle={set.lampAngle} length={90} spread={0.3} color="#FFC27A" intensity={0.12} />
        <div style={{ ...at(DESK.SCREEN), background: "#050304" }}>{children}</div>
        <Glow x={DESK.SCREEN.x + 24} y={DESK.SCREEN.y + 40} r={46} color="#9FF0E2" intensity={0.28 * screen} />
        {jar}
      </Layer>
      <Layer z={620} maxBlur={12}>
        <Glow x={68} y={186} r={90} color="#FF9A50" intensity={0.24} squash={0.35} />
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const SW = DESK.SCREEN.w * PX;
const SH = DESK.SCREEN.h * PX;

// ================================================================= A HOOK
const hookCam = (t: number) => camAt(t, [{ t: 0, z: 30, y: -40 }, { t: T.usd, z: 170, y: 20, e: ease.cameraSoft }, { t: T.hapus, z: 220, y: 40, e: ease.cameraSoft }, { t: CUT.B, z: 250, y: 40 }], 3);
const deleteOff = (t: number) => seg(t, T.hapus + 0.12, T.hapus + 0.45);
const HookScreen: React.FC<{ t: number }> = ({ t }) => {
  const dlg = t >= T.lalu && t < T.hapus + 0.4;
  const press = t >= T.hapus;
  // finger slides in from bottom right to the button
  const fk = seg(t, T.lalu + 0.3, T.hapus);
  const fx = lerp(SW + 40, SW * 0.62, fk);
  const fy = lerp(SH + 60, SH * 0.6 + 20, fk) + (press ? 8 : 0);
  const off = deleteOff(t);
  const collapse = t > T.hapus + 0.12 && t < T.hapus + 0.5 ? 1 - seg(t, T.hapus + 0.12, T.hapus + 0.45) : 1;
  const score = String(Math.min(99, Math.floor(t * 4) + 12));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scaleY(${off > 0 ? Math.max(0.02, collapse) : 1})`, transformOrigin: "50% 50%" }}>
        <GameView w={SW} h={SH} cell={4} t={t + 3} score={score} taps={[0.4, 1.1, 1.8, 2.6, 3.3, 4.0, 4.7, 5.4, 6.1].map((x) => x + 3)} />
        {dlg ? (
          <div style={{ position: "absolute", left: 24, right: 24, top: SH * 0.36, background: "#140C0E", border: `6px solid ${RED}`, padding: "18px 14px", textAlign: "center", transform: `scale(${clamp((t - T.lalu) / 0.2) * (press ? 0.96 : 1)})` }}>
            <div style={{ ...pix, fontSize: 26, color: C.ivory }}>HAPUS GAME?</div>
            <div style={{ ...pix, fontSize: 30, color: C.ivory, marginTop: 16, display: "inline-block", padding: "10px 18px", background: press ? "#7A1015" : RED }}>HAPUS</div>
          </div>
        ) : null}
      </div>
      {off > 0 ? <div style={{ position: "absolute", inset: 0, background: "#050304", opacity: off }} /> : null}
      {t >= T.lalu + 0.3 && t < T.hapus + 0.6 ? (
        <div style={{ position: "absolute", left: fx, top: fy }}>
          <div style={{ width: 70, height: 150, background: "#B97A55", borderTop: "10px solid #D9A07A", boxShadow: "inset -10px 0 0 #8A5638" }} />
        </div>
      ) : null}
    </>
  );
};
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const sh = shake(t, T.hapus, 14);
  const cam = hookCam(t);
  return (
    <DeskStage t={t} cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} screen={1 - deleteOff(t)}>
      <HookScreen t={t} />
    </DeskStage>
  );
};
/** Cover headline: kicker, two-line title, one tag. Lives over the opening frame. */
export const CoverText: React.FC<{ o?: number }> = ({ o = 1 }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o === 1 ? undefined : o }}>
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...pix, fontSize: 36, color: C.ink, padding: "8px 16px", background: NEON }}>AUDIRA TECH #19</div>
      </div>
      <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT.display, lineHeight: 0.95, textShadow: `0 8px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.9)}` }}>
        <div style={{ fontSize: 120, color: C.ivory }}>US$50.000/HARI</div>
        <div style={{ fontSize: 150, color: C.gold }}>DIHAPUS SENDIRI</div>
      </div>
    </div>
  );
};
const HookHud: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.usd - 0.15, T.usd + 0.6);
  return (
    <>
      <CoverText o={1 - seg(t, T.usd - 0.35, T.usd - 0.1)} />
      <Pop t={t} a={T.usd - 0.05} b={T.audira - 0.05} top={236}>
        <div style={{ ...box(C.gold), textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 110, color: C.gold, lineHeight: 0.95 }}>{money(50000 * k)}</div>
          <div style={{ ...pix, fontSize: 40, color: C.ivory, marginTop: 8 }}>PER HARI · DARI IKLAN</div>
        </div>
      </Pop>
      <Pop t={t} a={T.audira} b={CUT.B} top={236}>
        <Chip text="INI AUDIRA TECH" color={NEON} border={NEON} size={60} />
      </Pop>
    </>
  );
};

// ================================================================= B ROOM (Hanoi)
const roomLights = (t: number, screen = 1): LitLight[] => [
  { kind: "point", x: ROOM.LAPTOP.x + 22, y: ROOM.LAPTOP.y + 12, r: 80, i: 1.15 * screen + 0.05 * Math.sin(t * 5), color: "#9FF0E2" },
  { kind: "point", x: ROOM.WIN.x + 28, y: ROOM.WIN.y + 30, r: 70, i: 0.5, color: "#BFD6FF" },
  { kind: "point", x: 130, y: 60, r: 70, i: 0.45, color: "#FFC27A" },
];
const LaptopB: React.FC<{ t: number }> = ({ t }) => {
  const L = ROOM.LAPTOP;
  const w = L.w * PX;
  const h = L.h * PX;
  if (t < T.rilis) {
    // code editor: lines type in, the bird is being drawn pixel by pixel on the right
    const n = Math.floor((t - CUT.B) * 6);
    return (
      <div style={{ position: "absolute", inset: 0, background: "#0E1618", padding: 14 }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ height: 8, marginBottom: 12, width: i < n ? `${30 + hash(i * 7) * 40}%` : 0, background: i % 3 === 0 ? NEON : i % 3 === 1 ? "#F4B860" : "#6E8C88", marginLeft: (i % 3) * 18 }} />
        ))}
        <div style={{ position: "absolute", right: 18, top: 50, clipPath: `inset(0 0 ${100 - clamp((t - CUT.B) / 8) * 100}% 0)` }}>
          <Bird cell={8} flap={1} />
        </div>
      </div>
    );
  }
  return <GameView w={w} h={h} cell={3} t={t} score={t >= T.sepi ? "0" : String(Math.floor((t - T.rilis) * 2))} taps={[0.5, 1.3, 2.1, 3.0].map((x) => x + T.rilis)} />;
};
const CoderLit: React.FC<{ lights: LitLight[]; x: number; y: number; scale: number; breathe: number }> = ({ lights, x, y, scale, breathe }) => (
  <SpriteView
    sprite={CODER()}
    pal={CODER_PAL}
    anchor={CODER_ANCHOR}
    x={x}
    y={y + breathe}
    scale={scale}
    lights={spriteLightsAt(lights, x, y - 30, { rim: 0.5, core: 0.35, width: 1 })}
    gain={spriteGainAt(lights, x, y - 30, 0.12)}
  />
);
const RoomStage: React.FC<{ t: number; cam: CameraState; screen?: React.ReactNode; screenOn?: number }> = ({ t, cam, screen, screenOn = 1 }) => {
  const set = ROOM_SET();
  const lights = roomLights(t, screenOn);
  const opts = { ambient: 0.1, exposure: 1.1, dither: 0.45 };
  const po = ROOM.POSTER;
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={ROOM.WIN.x + 40} y={ROOM.WIN.y + 14} r={10} color="#DDE8FF" intensity={0.35} />
        <div style={{ ...pix, position: "absolute", left: po.x * PX, top: (po.y + po.h - 9) * PX, width: po.w * PX, textAlign: "center", fontSize: 30, fontWeight: 700, color: C.gold }}>AUDIRA</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={at(ROOM.LAPTOP)}>{screen}</div>
        <Glow x={ROOM.LAPTOP.x + 22} y={ROOM.LAPTOP.y + 14} r={36} color="#9FF0E2" intensity={0.3 * screenOn} />
        <CoderLit lights={lights} x={ROOM.CODER.x} y={ROOM.CODER.y} scale={PX * 1.6} breathe={Math.sin(t * 1.6) * 0.4} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <Glow x={68} y={186} r={90} color="#FF9A50" intensity={0.24} squash={0.35} />
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.B, x: -160, y: -40, z: 0 }, { t: T.dong, x: -60, y: 0, z: 60, e: ease.cameraSoft }, { t: T.beberapa, x: 60, y: 40, z: 120 }, { t: T.sepi, x: 180, y: 90, z: 220, e: ease.cameraSoft }, { t: CUT.C1, x: 200, y: 100, z: 250 }], 5);
  return <RoomStage t={t} cam={cam} screen={<LaptopB t={t} />} />;
};
const FlatGraph: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ ...box(C.ivoryDim), width: 820, boxSizing: "border-box" }}>
    <div style={{ ...pix, fontSize: 40, color: C.ivory }}>SEPI BERBULAN-BULAN</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, marginTop: 16, borderBottom: `4px solid ${C.ivoryDim}` }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ flex: 1, height: i < (t - T.sepi) * 14 ? 6 + hash(i) * 8 : 0, background: C.ivoryDim }} />
      ))}
    </div>
  </div>
);
const RoomHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={T.flappy - 0.05} b={T.dong - 0.05} top={236}>
      <div style={{ fontFamily: FONT.display, fontSize: 170, color: C.gold, lineHeight: 0.95, textShadow: `0 10px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.9)}` }}>FLAPPY BIRD</div>
    </Pop>
    <Pop t={t} a={T.dong} b={T.gears - 0.05} top={236} left={60} origin="0% 50%">
      <NameCard name="DONG NGUYEN" role={t >= T.hanoi ? "PROGRAMMER · HANOI, VIETNAM" : "PROGRAMMER"} accent={NEON} />
    </Pop>
    <Pop t={t} a={T.gears} b={T.beberapa - 0.05} top={236}>
      <Chip text=".GEARS" sub="STUDIO KECIL MILIKNYA" color={NEON} border={NEON} size={56} />
    </Pop>
    <Pop t={t} a={T.beberapa} b={T.rilis - 0.05} top={236}>
      <Chip text="DIBUAT DALAM BEBERAPA HARI" color={C.gold} border={C.gold} size={48} />
    </Pop>
    <Pop t={t} a={T.mei} b={T.sepi - 0.05} top={236}>
      <Chip text="RILIS 24 MEI 2013" sub="iPHONE · iOS" size={56} border={GREEN} />
    </Pop>
    <Pop t={t} a={T.sepi} b={CUT.C1} top={236}>
      <FlatGraph t={t} />
    </Pop>
  </>
);

// ================================================================= C1 CITY BILLBOARD
const cityLights: LitLight[] = [
  { kind: "point", x: 68, y: 100, r: 110, i: 1.1, color: "#9FF0E2" },
  { kind: "point", x: -30, y: 60, r: 120, i: 0.7, color: "#FFB070" },
];
const boardH = (i: number, t: number) => {
  const grow = seg(t, T.meledak - 0.2, T.meledak + 1.6);
  const base = 0.05 + hash(i * 3) * 0.04;
  const boom = Math.pow(i / 23, 3) * 0.95;
  return base + boom * grow;
};
const Billboard: React.FC<{ t: number }> = ({ t }) => {
  const B = CITY.BOARD;
  const country = t >= T.inggris ? "INGGRIS" : t >= T.tiongkok ? "TIONGKOK" : t >= T.amerika ? "AMERIKA" : "";
  return (
    <div style={{ ...at(B), background: "#08100F", padding: 28, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", ...pix, fontSize: 32, color: NEON }}>
        <span>AUDIRA · TOP APPS</span>
        <span style={{ color: C.gold }}>JAN 2014</span>
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, height: 470, display: "flex", alignItems: "flex-end", gap: 8, borderBottom: `6px solid ${NEON}` }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} style={{ flex: 1, height: `${boardH(i, t) * 100}%`, background: i > 18 && t >= T.meledak ? C.gold : NEON }} />
        ))}
      </div>
      {t >= T.meledak ? (
        <div style={{ position: "absolute", right: 60, top: 110 - seg(t, T.meledak, T.meledak + 1.6) * 30 }}>
          <Bird cell={9} flap={Math.floor(t * 10) % 2} tilt={-20} />
        </div>
      ) : null}
      {t >= T.nomor ? (
        <div style={{ position: "absolute", left: 40, top: 100, transform: `scale(${Math.min(1, (t - T.nomor) / 0.2)})`, transformOrigin: "0 0" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 200, color: C.gold, lineHeight: 0.9 }}>#1</div>
          <div style={{ ...pix, fontSize: 34, color: C.ivory }}>{country}</div>
        </div>
      ) : null}
    </div>
  );
};
const CityScene: React.FC<{ t: number }> = ({ t }) => {
  const set = CITY_SET();
  const opts = { ambient: 0.16, exposure: 1.1, dither: 0.45 };
  const sh = shake(t, T.meledak, 16, 0.2);
  const cam = camAt(t, [{ t: CUT.C1, y: 160, z: -40 }, { t: T.meledak, y: 40, z: 40, e: ease.cameraSoft }, { t: CUT.C2, y: 0, z: 110 }], 7);
  return (
    <CinematicCamera cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y, aperture: 5 }}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={cityLights} opts={opts} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={cityLights} opts={opts} />
        <Billboard t={t} />
        <Glow x={68} y={98} r={70} color="#9FF0E2" intensity={0.22 + 0.2 * win(t, T.meledak, T.meledak + 1, 0.05, 0.8)} squash={0.8} />
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={cityLights} opts={{ ambient: 0.12, exposure: 1, dither: 0.4 }} />
        {/* phone glows in the crowd */}
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: (-70 + i * 17) * PX, top: (196 + hash(i) * 6) * PX, width: PX * 3, height: PX * 4, background: NEON, opacity: t >= T.meledak + hash(i * 3) * 1.5 ? 0.85 : 0.1, boxShadow: `0 0 24px ${NEON}` }} />
        ))}
      </Layer>
    </CinematicCamera>
  );
};
const CityHud: React.FC<{ t: number }> = ({ t }) => {
  const list = [t >= T.amerika && "AMERIKA", t >= T.tiongkok && "TIONGKOK", t >= T.inggris && "INGGRIS"].filter(Boolean).join(" · ");
  return (
    <>
      <Pop t={t} a={CUT.C1 + 0.05} b={T.nomor - 0.05} top={236}>
        <Chip text={t >= T.meledak ? "JANUARI 2014 · MELEDAK" : "JANUARI 2014"} color={C.gold} border={C.gold} size={56} />
      </Pop>
      <Pop t={t} a={T.nomor} b={CUT.C2} top={236}>
        <Chip text="#1 APLIKASI GRATIS" sub={list || " "} color={C.gold} border={C.gold} size={56} />
      </Pop>
    </>
  );
};

// ================================================================= C2 GAME FULL SCREEN
const gameScore = (t: number) => {
  if (t < T.dapat) return 0;
  if (t < T.sepuluh) return Math.round(lerp(1, 9, seg(t, T.dapat, T.sepuluh - 0.1)));
  if (t < T.empat) return Math.round(lerp(10, 39, seg(t, T.sepuluh, T.empat - 0.05)) );
  return 40;
};
const MEDAL = { bronze: ["#C2702E", "#7A3E16"], platinum: ["#E8F4F2", "#8FB8B2"] } as const;
const Medal: React.FC<{ kind: keyof typeof MEDAL; n: number; label: string }> = ({ kind, n, label }) => (
  <div style={{ ...box(MEDAL[kind][0]), display: "flex", alignItems: "center", gap: 26 }}>
    <div style={{ width: 120, height: 120, background: MEDAL[kind][0], border: `10px solid ${MEDAL[kind][1]}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontSize: 64, color: C.ink, clipPath: "polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%)" }}>{n}</div>
    <div style={{ ...pix, fontSize: 48, color: MEDAL[kind][0] }}>{label}</div>
  </div>
);
const GameScene: React.FC<{ t: number }> = ({ t }) => {
  const taps = [T.ketuk, ...Array.from({ length: 24 }, (_, i) => T.ketuk + 0.55 + i * 0.36)];
  const z = 1 + 0.08 * seg(t, CUT.C2, CUT.D1);
  const last = taps.filter((a) => a <= t).pop() ?? -9;
  const kick = t - last < 0.1 ? 6 : 0;
  const speed = t < T.sepuluh ? 0.85 : 1.35;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z}) translateY(${kick}px)`, transformOrigin: "50% 45%" }}>
      <GameView w={1080} h={1920} cell={10} t={t * (t < T.sepuluh ? 1 : 1)} speed={speed} score={String(gameScore(t))} taps={taps} />
      {/* tap ripple */}
      {t >= T.ketuk && t - last < 0.3 ? <div style={{ position: "absolute", left: 540 - 60 - (t - last) * 200, top: 1150 - 60 - (t - last) * 200, width: 120 + (t - last) * 400, height: 120 + (t - last) * 400, border: `10px solid ${rgba("#FFFFFF", 0.7 * (1 - (t - last) / 0.3))}`, borderRadius: "50%" }} /> : null}
    </div>
  );
};
const GameHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.C2 + 0.05} b={T.ketuk - 0.05} top={420}>
      <Chip text="ATURANNYA SEDERHANA" size={56} border={NEON} />
    </Pop>
    <Pop t={t} a={T.ketuk} b={T.lewati - 0.05} top={420}>
      <Chip text="KETUK = BURUNG NAIK" color={NEON} border={NEON} size={52} />
    </Pop>
    <Pop t={t} a={T.lewati} b={T.sepuluh - 0.05} top={420}>
      <Chip text="1 CELAH = 1 POIN" color={C.gold} border={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.medali - 0.1} b={T.empat - 0.05} top={420}>
      <Medal kind="bronze" n={10} label="PERUNGGU" />
    </Pop>
    <Pop t={t} a={T.platinum - 0.05} b={CUT.D1} top={420}>
      <Medal kind="platinum" n={40} label="PLATINUM" />
    </Pop>
  </>
);

// ================================================================= D1 COIN JAR + flood of messages
const Coins: React.FC<{ t: number }> = ({ t }) => {
  const J = DESK.JAR;
  const fill = seg(t, CUT.D1 + 0.3, T.tapi) * 0.85;
  const coins: React.ReactNode[] = [];
  if (t < T.tapi + 0.6)
    for (let i = 0; i < 26; i++) {
      const t0 = CUT.D1 + 0.2 + i * 0.18;
      const k = (t - t0) / 0.6;
      if (k < 0 || k > 1) continue;
      const x = J.x + 4 + hash(i * 7) * (J.w - 10);
      const y = lerp(J.y - 60, J.y + J.h - 4 - fill * (J.h - 6), k * k);
      coins.push(<div key={i} style={{ position: "absolute", left: x * PX, top: y * PX, width: PX * 4, height: PX * 3, background: C.gold, boxShadow: `inset -${PX}px -${PX}px 0 #B5701E, 0 0 16px ${rgba(C.gold, 0.6)}` }} />);
    }
  const fh = fill * (J.h - 4);
  return (
    <>
      <div style={{ position: "absolute", left: (J.x + 1) * PX, top: (J.y + J.h - 1 - fh) * PX, width: (J.w - 2) * PX, height: fh * PX, background: `repeating-linear-gradient(180deg, ${C.gold} 0 ${PX * 2}px, #B5701E ${PX * 2}px ${PX * 3}px)` }} />
      {coins}
      <Glow x={J.x + J.w / 2} y={J.y + J.h - 6} r={22} color={C.gold} intensity={0.45 * fill} />
    </>
  );
};
const Flood: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.max(0, Math.floor((t - T.tapi) * 7));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0E1618" }}>
      <div style={{ ...pix, position: "absolute", top: 12, left: 0, right: 0, textAlign: "center", fontSize: 22, color: C.ivory }}>{`${Math.min(999, n * 37)} NOTIFIKASI`}</div>
      {Array.from({ length: Math.min(12, n) }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 14, right: 14, top: 50 + i * 48, height: 40, background: i % 2 ? "#2B3B39" : "#3A2A2C", borderLeft: `8px solid ${i % 3 === 0 ? RED : NEON}` }}>
          <div style={{ margin: "10px 12px", height: 8, width: `${40 + hash(i) * 50}%`, background: rgba(C.ivory, 0.6) }} />
        </div>
      ))}
    </div>
  );
};
const JarScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.D1, x: 420, y: 120, z: 120 }, { t: T.usdHari, x: 360, y: 110, z: 190, e: ease.cameraSoft }, { t: T.tapi, x: 300, y: 90, z: 200 }, { t: T.tapi + 0.6, x: 20, y: 40, z: 230, e: ease.cameraSoft }, { t: CUT.D2, x: 0, y: 40, z: 260 }], 9);
  return (
    <DeskStage t={t} cam={cam} screen={t >= T.tapi ? 0.8 : 0.5} jar={<Coins t={t} />}>
      {t >= T.tapi ? <Flood t={t} /> : <GameView w={SW} h={SH} cell={4} t={t} score="999" taps={[t - 0.2]} />}
    </DeskStage>
  );
};
const JarHud: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.usdHari - 0.9, T.usdHari);
  return (
    <>
      <Pop t={t} a={CUT.D1 + 0.05} b={T.tapi - 0.05} top={236}>
        <div style={{ ...box(C.gold), textAlign: "center" }}>
          <div style={{ ...pix, fontSize: 40, color: C.ivory }}>KEPADA THE VERGE:</div>
          <div style={{ fontFamily: FONT.display, fontSize: 120, color: C.gold, lineHeight: 0.95, marginTop: 10 }}>±{money(50000 * k)}</div>
          <div style={{ ...pix, fontSize: 40, color: C.ivory, marginTop: 8 }}>PER HARI · DARI IKLAN</div>
        </div>
      </Pop>
      <Pop t={t} a={T.tapi} b={CUT.D2} top={236}>
        <Chip text="TAPI IA TIDAK BAHAGIA" color={C.ivory} border={RED} size={60} />
      </Pop>
    </>
  );
};

// ================================================================= D2 LAPTOP CLOSE (the post + countdown)
const countdown = (t: number) => {
  if (t < T.duaDua) return "--:--:--";
  const s = Math.max(0, 22 * 3600 - (t - T.duaDua) * 3600 * 1.3);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};
const LaptopD: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, background: "#100A0C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ ...pix, fontSize: 18, color: RED }}>MENUJU DIHAPUS</div>
    <div style={{ fontFamily: FONT.display, fontSize: 64, color: t >= T.duaDua ? C.ivory : C.ivoryDim, marginTop: 8 }}>{countdown(t)}</div>
  </div>
);
const PostCard: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ background: "#F3E6CC", border: `6px solid ${C.ink}`, boxShadow: `0 10px 0 ${rgba(C.ink, 0.9)}`, padding: "20px 28px", width: 900, boxSizing: "border-box" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, ...pix, fontSize: 34, color: C.ink }}>
      <span>POSTINGAN · DONG NGUYEN</span>
      <span style={{ color: RED, fontSize: 40 }}>8 FEB 2014</span>
    </div>
    <div style={{ height: 4, background: rgba(C.ink, 0.3), margin: "14px 0" }} />
    <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 50, color: C.ink, lineHeight: 1.18, minHeight: 120 }}>
      {t >= T.duaDua ? "“22 jam lagi, aku akan menurunkan Flappy Bird." : ""}
      {t >= T.akuTidak ? " Aku tidak tahan lagi.”" : ""}
    </div>
  </div>
);
const PostScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.D2, x: 120, y: 60, z: 200 }, { t: T.duaDua, x: 180, y: 90, z: 300, e: ease.cameraSoft }, { t: T.katanya, x: 200, y: 110, z: 340 }, { t: CUT.E1, x: 150, y: 90, z: 280, e: ease.cameraSoft }], 13);
  return <RoomStage t={t} cam={cam} screen={<LaptopD t={t} />} screenOn={0.8} />;
};
const PostHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.D2 + 0.05} b={T.katanya - 0.05} top={236}>
      <PostCard t={t} />
    </Pop>
    <Pop t={t} a={T.bukan - 0.1} b={CUT.E1} top={236}>
      <Chip text="KATANYA: BUKAN SOAL HUKUM" color={C.gold} border={C.gold} size={54} />
    </Pop>
  </>
);

// ================================================================= E1 APP SHOP WALL
const storeLights = (t: number): LitLight[] => [
  { kind: "cone", x: 68, y: -30, r: 260, i: 1.3, angle: Math.PI / 2, spread: 0.45, color: "#FFE6BC" },
  { kind: "point", x: STORE.SLOT.x + 15, y: STORE.SLOT.y + 15, r: 40, i: 0.6 * (1 - seg(t, T.hilang, T.hilang + 0.5)) + 0.25, color: "#9FF0E2" },
];
const StoreScene: React.FC<{ t: number }> = ({ t }) => {
  const set = STORE_SET();
  const lights = storeLights(t);
  const opts = { ambient: 0.12, exposure: 1.1, dither: 0.45 };
  const S = STORE.SLOT;
  const dissolve = seg(t, T.hilang - 0.1, T.hilang + 0.5);
  const cam = camAt(t, [{ t: CUT.E1, x: -260, y: 0, z: 80 }, { t: T.hilang, x: 0, y: 40, z: 200, e: ease.cameraSoft }, { t: T.forbes, x: 0, y: 40, z: 230 }, { t: CUT.E2, x: 40, y: 10, z: 120, e: ease.cameraSoft }], 17);
  const cells = 10;
  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        {/* the bird's box in its slot: dissolves cell by cell on "hilang" */}
        <div style={at({ x: S.x, y: S.y, w: 28, h: 28 })}>
          <div style={{ position: "absolute", inset: 0, background: "#1F6B66" }} />
          <div style={{ position: "absolute", left: 40, top: 70 }}>
            <Bird cell={9} flap={Math.floor(t * 8) % 2} />
          </div>
          {Array.from({ length: cells * cells }, (_, i) => {
            const on = hash(i * 17 + 3) < dissolve;
            return on ? <div key={i} style={{ position: "absolute", left: (i % cells) * 22.4, top: Math.floor(i / cells) * 22.4, width: 23, height: 23, background: "#120B0C" }} /> : null;
          })}
          {dissolve > 0.6 ? <div style={{ position: "absolute", inset: 10, border: `6px dashed ${rgba(C.ivory, 0.5)}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontSize: 110, color: rgba(C.ivory, 0.6) }}>?</div> : null}
        </div>
        <LightShaft id="store" x={68} y={-30} angle={Math.PI / 2} length={200} spread={0.25} color="#FFE6BC" intensity={0.1} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <Glow x={68} y={186} r={90} color="#FF9A50" intensity={0.24} squash={0.35} />
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const QuoteCard: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ ...box(C.ivoryDim), width: 900, boxSizing: "border-box" }}>
    <div style={{ ...pix, fontSize: 38, color: C.gold }}>KEPADA FORBES:</div>
    <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 48, color: C.ivory, lineHeight: 1.2, marginTop: 12 }}>
      {t >= T.dibuat ? "“Dibuat untuk dimainkan beberapa menit saat santai…”" : "…"}
    </div>
  </div>
);
const StoreHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E1 + 0.05} b={T.hilang - 0.05} top={236}>
      <Chip text="KEESOKAN HARINYA" size={52} />
    </Pop>
    {t >= T.hilang && t < T.forbes - 0.05 ? <Stamp t={t} a={T.hilang} text="HILANG" sub="APP STORE & GOOGLE PLAY" top={236} color={RED} /> : null}
    <Pop t={t} a={T.forbes} b={T.adiktif - 0.05} top={236}>
      <QuoteCard t={t} />
    </Pop>
    <Pop t={t} a={T.adiktif} b={CUT.E2} top={236}>
      <Chip text="“…MALAH JADI PRODUK YANG ADIKTIF”" sub={t >= T.masalah ? "ITU SUDAH JADI MASALAH" : " "} color={C.gold} border={C.gold} size={48} />
    </Pop>
  </>
);

// ================================================================= E2 AUCTION
const aucLights = (t: number): LitLight[] => [
  { kind: "cone", x: 68, y: -20, r: 230, i: 1.5 + 0.3 * win(t, T.usd90, T.usd90 + 0.6, 0.03, 0.5), angle: Math.PI / 2, spread: 0.25, color: "#FFE6BC" },
  { kind: "point", x: 68, y: 120, r: 40, i: 0.6, color: "#9FF0E2" },
];
const AuctionScene: React.FC<{ t: number }> = ({ t }) => {
  const set = AUC_SET();
  const lights = aucLights(t);
  const opts = { ambient: 0.09, exposure: 1.1, dither: 0.45 };
  const cam = camAt(t, [{ t: CUT.E2, y: -140, z: -60 }, { t: T.hp, y: 40, z: 120, e: ease.cameraSoft }, { t: T.usd90, y: 60, z: 230, e: ease.cameraSoft }, { t: CUT.OUT, y: 40, z: 170 }], 19);
  const sh = shake(t, T.turun, 16);
  const P = { x: 59, y: 104, w: 18, h: 30 };
  const taken = seg(t, T.turun, T.turun + 0.5);
  return (
    <CinematicCamera cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y, aperture: 7 }}>
      <Layer z={1500} maxBlur={6}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <div style={{ ...pix, position: "absolute", left: 30 * PX, top: 30 * PX, width: 76 * PX, textAlign: "center", fontSize: 36, color: rgba(C.gold, 0.8), fontWeight: 700 }}>AUDIRA AUCTION</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <LightShaft id="auc" x={68} y={-20} angle={Math.PI / 2} length={170} spread={0.14} color="#FFE6BC" intensity={0.2} />
        <div style={{ ...at(P), background: "#1A1214", border: "10px solid #2A2024", boxSizing: "border-box", opacity: 1 - taken * 0.7 }}>
          <GameView w={P.w * PX - 20} h={P.h * PX - 20} cell={2} t={t} score="7" taps={[t - 0.25]} brand={false} />
        </div>
        <Glow x={68} y={120} r={20} color="#9FF0E2" intensity={0.3 * (1 - taken)} />
        {/* price tag on a string */}
        <div style={{ position: "absolute", left: (AUC.CASE.x + AUC.CASE.w + 2) * PX, top: 118 * PX, background: C.ivory, padding: "8px 12px", ...pix, fontSize: 26, color: C.ink, transform: `rotate(${Math.sin(t * 2) * 4}deg)` }}>LOT #19</div>
      </Layer>
      <Layer z={620} maxBlur={12}>
        <Glow x={68} y={186} r={90} color="#FF9A50" intensity={0.24} squash={0.35} />
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const AuctionHud: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.ditawar - 0.1, T.usd90);
  const bid = lerp(1000, 90000, k * k);
  return (
    <>
      <Pop t={t} a={T.hp - 0.1} b={T.ditawar - 0.05} top={236}>
        <Chip text="HP BERISI FLAPPY BIRD" sub="DIJUAL DI eBAY" size={54} border={C.gold} />
      </Pop>
      <Pop t={t} a={T.ditawar} b={T.turun - 0.05} top={236}>
        <div style={{ ...box(C.gold), textAlign: "center" }}>
          <div style={{ ...pix, fontSize: 40, color: C.ivory }}>TAWARAN</div>
          <div style={{ fontFamily: FONT.display, fontSize: 120, color: C.gold, lineHeight: 0.95, marginTop: 8 }}>{t >= T.usd90 ? ">US$90.000" : money(bid)}</div>
          <div style={{ ...pix, fontSize: 36, color: C.ivoryDim, marginTop: 8 }}>TAWARAN, BUKAN HARGA JUAL</div>
        </div>
      </Pop>
      {t >= T.turun ? <Stamp t={t} a={T.turun} text="DITURUNKAN" sub="eBAY MENURUNKAN IKLANNYA" top={236} color={RED} /> : null}
    </>
  );
};

// ================================================================= OUT
const OutScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.OUT, z: 260, y: 40 }, { t: T.kalau, z: 140, y: 20, e: ease.cameraSoft }, { t: TOTAL, z: 20, y: -20 }], 23);
  return (
    <DeskStage t={t} cam={cam} screen={0.35}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0B2422 0%, #123B37 100%)" }}>
        <div style={{ position: "absolute", left: SW / 2 - 64, top: SH * 0.45 + Math.sin(t * 1.5) * 6 }}>
          <Bird cell={8} flap={0} sleep />
        </div>
        <div style={{ ...pix, position: "absolute", left: SW / 2 + 60, top: SH * 0.38 - ((t * 20) % 40), fontSize: 30, color: rgba(C.ivory, 0.7) }}>z</div>
        <div style={{ ...pix, position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontSize: 22, color: rgba(NEON, 0.8) }}>AUDIRA</div>
      </div>
    </DeskStage>
  );
};
const OutHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.OUT + 0.05} b={T.kalau - 0.05} top={236}>
      <Chip text="US$50.000/HARI DILEPAS" sub={t >= T.dilepas ? "DEMI HATI YANG TENANG" : " "} color={C.gold} border={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.kalau} b={T.ikuti - 0.05} top={236}>
      <div style={{ fontFamily: FONT.display, fontSize: 140, color: C.ivory, lineHeight: 0.95, textAlign: "center", textShadow: `0 10px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.9)}` }}>
        KAMU <span style={{ color: RED }}>BERANI</span>
        <br />
        HAPUS?
      </div>
    </Pop>
    <Pop t={t} a={T.ikuti} top={236}>
      <Chip text="IKUTI AUDIRA TECH" sub="TULIS JAWABANMU DI KOMENTAR" color={NEON} border={NEON} size={56} />
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
  const flash = 0.25 * win(t, T.meledak, T.meledak + 0.3, 0.03, 0.25) + 0.22 * win(t, T.hilang, T.hilang + 0.25, 0.02, 0.2) + 0.2 * win(t, T.usd90, T.usd90 + 0.25, 0.02, 0.2);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {sc === "B" && <RoomScene t={t} />}
        {sc === "C1" && <CityScene t={t} />}
        {sc === "C2" && <GameScene t={t} />}
        {sc === "D1" && <JarScene t={t} />}
        {sc === "D2" && <PostScene t={t} />}
        {sc === "E1" && <StoreScene t={t} />}
        {sc === "E2" && <AuctionScene t={t} />}
        {sc === "OUT" && <OutScene t={t} />}
        <Grade />
        <Vignette strength={sc === "C2" ? 0.45 : 0.85} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {sc === "B" && <RoomHud t={t} />}
        {sc === "C1" && <CityHud t={t} />}
        {sc === "C2" && <GameHud t={t} />}
        {sc === "D1" && <JarHud t={t} />}
        {sc === "D2" && <PostHud t={t} />}
        {sc === "E1" && <StoreHud t={t} />}
        {sc === "E2" && <AuctionHud t={t} />}
        {sc === "OUT" && <OutHud t={t} />}
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};

/** Cover: the opening frame of the film with the headline. */
export const CoverFrame: React.FC<{ t: number }> = ({ t }) => (
  <>
    <HookScene t={t} />
    <CoverText />
  </>
);
