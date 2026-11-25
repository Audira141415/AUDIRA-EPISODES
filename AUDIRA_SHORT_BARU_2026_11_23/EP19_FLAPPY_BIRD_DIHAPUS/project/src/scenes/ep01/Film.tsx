// EP01 film "Susi Susanti, Emas Pertama 1992" (PIXELSTORY). A 16-bit badminton game told in six sets, every cut on a VO word:
//   A    HOOK      the cover arena: score 5–11 blinks, the smash leaves, "EMAS PERTAMA INDONESIA"
//   B    KONTEKS   athlete's room at night: timeline 1952 → 1992 "40 TAHUN · 0 EMAS", the order, the clock that won't stop
//   C    PENGEMB.  the final court from the side: seed cards, Bang Soo-hyun, game 1 lost 5–11 (life bar drains)
//   D    PENJELAS. net-height close-up: 11–5, 11–3 (level up), stamp "EMAS PERTAMA" (first badminton gold anywhere)
//   E1   PAYOFF    podium from behind: the Merah Putih rises, "INDONESIA RAYA"
//   E2   PAYOFF    the same court, cooler light: Alan Budikusuma's gold, "2 EMAS · 1 HARI"
//   F    PAYOFF    Jakarta at sunset: open-car parade past Monas, "HINGGA ±1 JUTA ORANG", "MENIKAH 1997"
//   OUT  OUTRO     back to the cover arena: AUDIRA scoreboard + EP02 teaser, then the AUDIRA card (Root)
// Facts on screen only from research/SOURCE_REGISTER.md. Players are generic sprites: no faces, no crests, no Olympic marks.
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
import { Exposure, Glow, Grade, Grain, LightShaft, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { ArenaShot, COVER_CAM, CoverText, SHUTTLE, type LitLight } from "./ArenaShot.tsx";
import { CAR_ANCHOR, openCar, PAL, shuttle, side, SIDE_ANCHOR, sitter, SITTER_ANCHOR, SPEC, STAND_ANCHOR, standBack, type SidePose } from "./sprites.ts";
import { JKT, jakarta, NETC, netClose, POD, podium, room, ROOM, SIDE, sideCourt } from "./sets.ts";
import { Captions, Chip, GREEN, LevelBanner, LifeBar, NameCard, Pop, RED, Scoreboard, Stamp, Wipe } from "./hud.tsx";
import { CUT, MATCH_POINT, SMASH, T, TOTAL, clamp, lerp, sceneAt, seg, win } from "./timing.ts";

// ---------------------------------------------------------------- caches (built once per tab)
const once = <X,>(make: () => X) => {
  let v: X | undefined;
  return () => (v ??= make());
};
const ROOM_SET = once(room);
const SIDE_SET = once(sideCourt);
const NET_SET = once(netClose);
const POD_SET = once(podium);
const JKT_SET = once(jakarta);
const SPR = once(() => {
  const f = (s: Sprite) => finish(s, SPEC);
  return {
    susi: { ready: f(side("ready")), smash: f(side("smash")), wave: f(side("wave")), stand: f(side("stand")) },
    alan: { ready: f(side("ready", "short")), smash: f(side("smash", "short")), wave: f(side("wave", "short")), stand: f(side("stand", "short")) },
    sit: f(sitter()),
    back: f(standBack()),
    car: f(openCar()),
    cock: f(shuttle()),
  };
});
/** Neutral opponent kit for the men's final (both finalists were Indonesian): white shirt, dark-blue band. */
const ALT_PAL: Palette = { ...PAL, r: "#2A4C8C", R: "#16284A", q: "#4C78C4" };
/** Korean finalist's kit: red shirt and skirt, white shoulder band (generic, no crest). */
const RIVAL_KIT: Palette = { ...PAL, w: "#B8222E", v: "#6E1018", W: "#E2464A", z: "#2A080C", r: "#F5EEDF", R: "#BCAF98", q: "#FFFFFF", x: "#3E3430" };

// ---------------------------------------------------------------- helpers
type Key = { t: number; e?: (k: number) => number } & Partial<CameraState>;
const camAt = (t: number, ks: Key[], seed = 1, base: CameraState = { ...COVER_CAM, aperture: 6 }): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), base);
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
/** Short decaying shake after `at` (deterministic). */
const shake = (t: number, at: number, amp = 18, dur = 0.14) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor((k * 60) / 2);
  const fall = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * fall, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * fall };
};
const pixLabel: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };

const Lit: React.FC<{ s: Sprite; pal: Palette; x: number; y: number; lights: LitLight[]; ambient: number; flip?: boolean; scale?: number; anchor?: { x: number; y: number }; rim?: boolean }> = ({
  s, pal, x, y, lights, ambient, flip, scale, anchor, rim = true,
}) => (
  <SpriteView
    sprite={s}
    pal={pal}
    anchor={anchor ?? { x: Math.floor(s.w / 2), y: s.h - 1 }}
    x={x}
    y={y}
    flip={flip}
    scale={scale}
    lights={[...spriteLightsAt(lights, x, y - 20, { rim: 1, core: 0.3, width: 1 }), ...(rim ? [{ dir: [1, -0.6] as [number, number], color: "#CFE0FF", rim: 0.55, core: 0, width: 1 }] : [])]}
    gain={spriteGainAt(lights, x, y - 20, ambient)}
  />
);

/** A rally between two racket points: returns the shuttle position and who is hitting. `period` s per crossing. */
const rally = (t: number, t0: number, a: { x: number; y: number }, b: { x: number; y: number }, period: number, peak: number) => {
  const u = (t - t0) / period;
  const n = Math.floor(u);
  const k = u - n;
  const [p, q] = n % 2 === 0 ? [a, b] : [b, a];
  return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) - Math.sin(k * Math.PI) * peak, hitter: n % 2 === 0 ? "a" : "b", k };
};

const Shuttle: React.FC<{ x: number; y: number; scale?: number; dir?: number }> = ({ x, y, scale = PX, dir = 1 }) => {
  const spr = SPR();
  return (
    <>
      {[1, 2, 3, 4].map((k) => (
        <div key={k} style={{ position: "absolute", left: (x - dir * k * 2.4) * PX, top: (y + 1) * PX, width: PX * 1.6, height: PX * 0.9, background: rgba(C.ivory, 0.42 - k * 0.09) }} />
      ))}
      <Glow x={x} y={y + 1} r={5} color="#FFFFFF" intensity={0.4} />
      <SpriteView sprite={spr.cock} pal={PAL} anchor={{ x: 2, y: 3 }} x={x} y={y + 2} scale={scale} lights={[{ dir: [-0.4, -1], color: "#FFE6BC", rim: 1, core: 0.3, width: 1 }]} gain={1.1} />
    </>
  );
};

// ================================================================= A HOOK (cover arena)
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: 0, z: 0, y: 0 }, { t: 1.0, z: 20, e: ease.cameraSoft }, { t: CUT.B, z: 170, y: -30, e: ease.cameraSoft }], 3, COVER_CAM);
  const boost = 1 + 0.7 * win(t, 0.05, 0.6, 0.06, 0.45);
  // the shuttle hangs above the racket (cover), then the smash sends it into the far court to the right
  const k = clamp((t - SMASH) / 0.4);
  const shuttleAt = t < SMASH ? { x: SHUTTLE.x, y: SHUTTLE.y + Math.sin(t * 2) * 0.6 } : k < 1 ? { x: lerp(SHUTTLE.x, 112, k), y: lerp(SHUTTLE.y, 128, k * k) } : null;
  const sh = shake(t, SMASH + 0.4, 14);
  return <ArenaShot cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} boost={boost} shuttleAt={shuttleAt} />;
};
const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CoverText o={1 - seg(t, 2.2, 2.8)} />
    {t >= 2.8 ? <Scoreboard t={t} a="SUSI" b="BANG" score="5–11" flashAt={2.8} top={236} /> : null}
    <Pop t={t} a={T.umur} b={T.emasPertama - 0.05} top={400}>
      <Chip text="USIA 21 TAHUN" size={48} border={C.ivoryDim} />
    </Pop>
    <Pop t={t} a={T.emasPertama} b={CUT.B} top={400}>
      <Chip text="EMAS PERTAMA INDONESIA" color={C.gold} border={C.gold} size={52} />
    </Pop>
  </>
);

// ================================================================= B ROOM (the night before)
const roomLights = (t: number): LitLight[] => [
  { kind: "point", x: ROOM.LAMP.x, y: ROOM.LAMP.y - 4, r: 90, i: 1.25 + 0.04 * Math.sin(t * 3.1), color: "#FFC27A" },
  { kind: "point", x: ROOM.WIN.x + 14, y: ROOM.WIN.y + 20, r: 70, i: 0.45, color: "#BFD6FF" },
];
const clockText = (t: number) => {
  const m = Math.round(lerp(22 * 60 + 10, 26 * 60 + 14, seg(t, T.malam - 0.2, CUT.C)));
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const set = ROOM_SET();
  const spr = SPR();
  const cam = camAt(t, [{ t: CUT.B, x: -70, y: -20, z: 10 }, { t: T.susi, x: -20, y: 0, z: 50, e: ease.cameraSoft }, { t: T.malam, x: 0, y: 20, z: 90 }, { t: CUT.C, x: 10, y: 60, z: 240, e: ease.cameraSoft }], 5);
  const lights = roomLights(t);
  const opts = { ambient: 0.11, exposure: 1.1, dither: 0.45 };
  const c = ROOM.CLOCK;
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <CinematicCamera cam={{ ...cam, focus: 1000, aperture: 6 }}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={ROOM.WIN.x + 10} y={ROOM.WIN.y + 12} r={10} color="#DDE8FF" intensity={0.35} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={ROOM.LAMP.x} y={ROOM.LAMP.y - 5} r={20} color="#FFC27A" intensity={0.6} squash={0.8} />
        <div style={{ ...pixLabel, position: "absolute", left: c.x * PX, top: c.y * PX, width: c.w * PX, height: c.h * PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#FF5A4A", textShadow: "0 0 14px rgba(255,80,60,0.8)" }}>
          {blink ? clockText(t) : clockText(t).replace(":", " ")}
        </div>
        {t >= CUT.B ? <Lit s={spr.sit} pal={PAL} x={ROOM.SIT.x} y={ROOM.FLOOR} lights={lights} ambient={0.11} anchor={SITTER_ANCHOR} scale={PX * 2.4} /> : null}
      </Layer>
      <Layer z={620} maxBlur={12}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const TimelinePanel: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.sejak, T.empatPuluh + 0.4);
  const year = Math.round(lerp(1952, 1992, k));
  const zero = t >= T.tanpaEmas;
  const empty = zero && Math.floor((t - T.tanpaEmas) * 4) % 2 === 0;
  return (
    <div style={{ background: rgba(C.ink, 0.88), border: `6px solid ${C.ivoryDim}`, padding: "18px 26px", width: 900, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", ...pixLabel, fontSize: 36, color: C.ivory }}>
        <span>1952</span>
        <span style={{ color: C.gold, visibility: year < 1992 ? "visible" : "hidden" }}>{year}</span>
        <span>1992</span>
      </div>
      <div style={{ marginTop: 14, height: 30, background: rgba(C.ivory, 0.12), display: "flex", gap: 4, padding: 4 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ flex: 1, background: i < Math.round(k * 20) ? RED : "transparent" }} />
        ))}
      </div>
      {t >= T.empatPuluh ? (
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 84, color: C.ivory, lineHeight: 0.9 }}>40 TAHUN</div>
          <div style={{ ...pixLabel, fontSize: 40, color: zero ? "#FF8A80" : C.ivoryDim }}>· 0 EMAS</div>
          <div style={{ width: 64, height: 64, border: `6px solid ${C.gold}`, background: empty ? rgba(C.gold, 0.12) : "transparent", boxSizing: "border-box" }} />
        </div>
      ) : null}
    </div>
  );
};
const RoomHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.B + 0.05} b={T.buluTangkis - 0.05} top={236}>
      <Chip text="BARCELONA · 1992" color={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.buluTangkis} b={T.sejak - 0.05} top={236}>
      <Chip text="BULU TANGKIS · CABANG MEDALI RESMI PERTAMA" size={44} border={GREEN} />
    </Pop>
    <Pop t={t} a={T.sejak} b={T.susi - 0.05} top={236}>
      <TimelinePanel t={t} />
    </Pop>
    <Pop t={t} a={T.susi} b={T.instruksi - 0.05} top={236}>
      <NameCard name="SUSI SUSANTI" role="21 TAHUN · TUNGGAL PUTRI" />
    </Pop>
    <Pop t={t} a={T.instruksi} b={T.malam - 0.05} top={236}>
      <Chip text="INSTRUKSI PRESIDEN: BAWA PULANG EMAS" color={C.gold} border={C.gold} size={46} />
    </Pop>
    <Pop t={t} a={T.takBisa} b={CUT.C} top={236}>
      <Chip text="MALAM SEBELUM FINAL · TAK BISA TIDUR" size={44} />
    </Pop>
  </>
);

// ================================================================= C / E2 SIDE COURT
const sideLights = (cool: boolean): LitLight[] => [
  { kind: "cone", x: 67, y: -6, r: 230, i: 1.35, angle: Math.PI / 2, spread: 0.6, color: cool ? "#DDE6FF" : "#FFE6BC" },
  { kind: "point", x: 150, y: 50, r: 90, i: 0.4, color: "#CFE0FF" },
];
const SideScene: React.FC<{ t: number; alan?: boolean }> = ({ t, alan = false }) => {
  const set = SIDE_SET();
  const spr = SPR();
  const lights = sideLights(alan);
  const ambient = 0.13;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const t0 = alan ? CUT.E2 : CUT.C;
  const L = { x: 38, y: 112 };
  const R = { x: 96, y: 112 };
  const period = alan ? 0.9 : t > T.lalu ? 0.78 : 0.95;
  const r = rally(t, t0, L, R, period, 30);
  const hitL = r.hitter === "a" && r.k < 0.18;
  const hitR = r.hitter === "b" && r.k < 0.18;
  const left = alan ? spr.alan : spr.susi;
  const leftPose: SidePose = hitL ? "smash" : "ready";
  const rightSpr = alan ? spr.alan : spr.susi;
  const rightPose: SidePose = hitR ? "smash" : "ready";
  const sh = alan ? { x: 0, y: 0 } : shake(t, T.limaSebelas, 22);
  const cam = camAt(t, [{ t: t0, z: 120, y: 60 }, { t: t0 + 4, z: 170, y: 70 }, { t: CUT.D, z: 230, y: 80 }], 11);
  const camX = (r.x - 67) * PX * 0.35;
  const cs: CameraState = { ...cam, x: cam.x + camX + sh.x, y: cam.y + sh.y, aperture: 5 };
  const S = 1.4;
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {[10, 67, 124].map((x) => <Glow key={x} x={x} y={4} r={16} color={alan ? "#DDE6FF" : "#FFE6BC"} intensity={0.5} squash={0.6} />)}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -18 * PX, top: SIDE.BOARD_Y * PX + 10, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <div style={{ ...pixLabel, position: "absolute", left: 102 * PX, top: SIDE.BOARD_Y * PX + 10, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <LightShaft id="side" x={67} y={-6} angle={Math.PI / 2} length={180} spread={0.3} color={alan ? "#DDE6FF" : "#FFE6BC"} intensity={0.12} />
        <Lit s={left[leftPose]} pal={PAL} x={30} y={SIDE.FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} />
        <Lit s={rightSpr[rightPose]} pal={alan ? ALT_PAL : RIVAL_KIT} x={104} y={SIDE.FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} flip />
        <Shuttle x={r.x} y={r.y} dir={r.hitter === "a" ? 1 : -1} />
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
/** E2: the men's final seen wide from behind the baseline in the cover arena (not the side court of C). */
const AlanScene: React.FC<{ t: number }> = ({ t }) => {
  const spr = SPR();
  const lights: LitLight[] = [{ kind: "point", x: 67, y: 140, r: 70, i: 1.0, color: "#FFE6BC" }];
  const r = rally(t, CUT.E2, { x: 72, y: 150 }, { x: 46, y: 118 }, 0.9, 26);
  const hitA = r.hitter === "a" && r.k < 0.2;
  const hitB = r.hitter === "b" && r.k < 0.2;
  const cam = camAt(t, [{ t: CUT.E2, z: -120, y: -40 }, { t: T.duaEmas, z: -20, y: 0, e: ease.cameraSoft }, { t: CUT.F, z: 40, y: 10 }], 21, COVER_CAM);
  const mg = (
    <>
      <Lit s={spr.alan[hitB ? "smash" : "ready"]} pal={ALT_PAL} x={42} y={136} lights={lights} ambient={0.2} anchor={SIDE_ANCHOR} scale={PX * 0.9} flip />
      <Shuttle x={r.x} y={r.y} scale={PX * 0.9} dir={r.hitter === "a" ? -1 : 1} />
      <Lit s={spr.alan[hitA ? "smash" : "ready"]} pal={PAL} x={66} y={186} lights={lights} ambient={0.2} anchor={SIDE_ANCHOR} scale={PX * 1.6} />
    </>
  );
  return <ArenaShot cam={cam} boost={1.05} hero={false} rivalOn={false} shuttleAt={null} mg={mg} />;
};
const Glitch: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const g = win(t, at, at + 0.35, 0.02, 0.15);
  if (g < 0.01) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: g }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 236 + hash(i * 17 + Math.floor(t * 30)) * 220, height: 16 + hash(i * 5) * 40, background: i % 2 ? rgba(RED, 0.55) : rgba(C.ink, 0.7), transform: `translateX(${(hash(i + Math.floor(t * 30)) - 0.5) * 80}px)` }} />
      ))}
    </div>
  );
};
const liveScore = (t: number, a: number, b: number, from: number, to: number) => {
  const k = seg(t, from, to);
  return `${Math.round(a * k)}–${Math.round(b * k)}`;
};
const SideHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.C + 0.05} b={T.tanpaGim - 0.05} top={236}>
      <Chip text="SUSI · UNGGULAN 1" color={GREEN} border={GREEN} size={52} />
    </Pop>
    <Pop t={t} a={T.tanpaGim} b={T.agustus - 0.05} top={236}>
      <Chip text="MENUJU FINAL · 0 GIM HILANG" color={C.gold} border={C.gold} size={48} />
    </Pop>
    <Pop t={t} a={T.agustus} b={T.bang - 0.05} top={236}>
      <Chip text="FINAL · 4 AGUSTUS 1992 · MAR BELLA" size={44} />
    </Pop>
    <Pop t={t} a={T.bang} b={T.lalu - 0.05} top={236} left={60} origin="0% 50%">
      <NameCard name="BANG SOO-HYUN" role={t >= T.unggulan4 ? "KOREA SELATAN · UNGGULAN 4" : "KOREA SELATAN"} accent={"#B8222E"} />
    </Pop>
    <Pop t={t} a={T.semifinal} b={T.lalu - 0.05} top={440}>
      <Chip text="SEMIFINAL: SINGKIRKAN UNGGULAN 2" size={40} />
    </Pop>
    {t >= T.lalu ? <LevelBanner t={t} a={T.lalu} level={1} home="SUSI" away="BANG" score="5–11" scoreAt={T.limaSebelas} pending={liveScore(t, 5, 11, T.lalu + 0.3, T.limaSebelas - 0.1)} /> : null}
    {t >= T.lalu ? <LifeBar t={t} v={lerp(1, 0.25, seg(t, T.lalu + 0.3, T.limaSebelas + 0.3))} top={370} /> : null}
    <Glitch t={t} at={T.limaSebelas} />
  </>
);
const AlanHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={T.alan - 0.8} b={T.duaEmas - 0.05} top={236} left={60} origin="0% 50%">
      <NameCard name="ALAN BUDIKUSUMA" role="PACAR SUSI · TUNGGAL PUTRA" />
    </Pop>
    <Pop t={t} a={T.alan + 1.3} b={T.duaEmas - 0.05} top={440}>
      <Chip text="EMAS · 15–12, 18–13" color={C.gold} border={C.gold} size={48} />
    </Pop>
    <Pop t={t} a={T.duaEmas} b={CUT.F} top={236}>
      <Chip text="2 EMAS · 1 HARI" sub="4 AGUSTUS 1992" color={C.gold} border={C.gold} size={52} />
    </Pop>
  </>
);

// ================================================================= D NET CLOSE-UP (the comeback)
const netLights = (t: number): LitLight[] => [
  { kind: "cone", x: 67, y: -16, r: 240, i: 1.4 + 0.4 * win(t, MATCH_POINT, MATCH_POINT + 0.6, 0.03, 0.5), angle: Math.PI / 2, spread: 0.55, color: "#FFE6BC" },
  { kind: "point", x: 150, y: 40, r: 90, i: 0.4, color: "#CFE0FF" },
];
const NetScene: React.FC<{ t: number }> = ({ t }) => {
  const set = NET_SET();
  const spr = SPR();
  const lights = netLights(t);
  const ambient = 0.12;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const susiR = { x: 58, y: 92 };
  const rivR = { x: 96, y: 78 };
  // the rally quickens through games 2 and 3; the match point is a smash into the far court
  const period = t < T.gim2 ? 1.0 : 0.72;
  const live = t < MATCH_POINT - 0.45;
  const r = rally(t, CUT.D, susiR, rivR, period, 26);
  const fk = clamp((t - (MATCH_POINT - 0.45)) / 0.45);
  const sh0 = live ? r : fk < 1 ? { x: lerp(susiR.x, 112, fk), y: lerp(susiR.y - 6, NETC.FAR_FEET - 2, fk * fk), hitter: "a", k: 0 } : { x: 112, y: NETC.FAR_FEET - 2, hitter: "a", k: 1 };
  const susiPose: SidePose = (live && r.hitter === "a" && r.k < 0.2) || (!live && fk < 0.4) ? "smash" : "ready";
  const rivPose: SidePose = live && r.hitter === "b" && r.k < 0.2 ? "smash" : "ready";
  const sh = shake(t, MATCH_POINT, 30, 0.18);
  const crash = 70 * win(t, MATCH_POINT, MATCH_POINT + 0.9, 0.08, 0.7);
  const cam = camAt(t, [{ t: CUT.D, z: 30, y: 20 }, { t: T.gim3, z: 90, y: 20 }, { t: MATCH_POINT - 0.9, z: 120, y: 20 }, { t: MATCH_POINT, z: 150, y: 20, e: ease.cameraSoft }, { t: T.emasnya, x: 60, z: 240, y: 0 }, { t: CUT.E1, x: -40, z: 360, y: -30 }], 9);
  const camX = (sh0.x - 67) * PX * 0.3;
  const cs: CameraState = { ...cam, x: cam.x + camX + sh.x, y: cam.y + sh.y, z: cam.z + crash, aperture: 6 };
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={7}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -2 * PX, top: 91 * PX, fontSize: 30, fontWeight: 700, color: C.gold }}>{"AUDIRA            AUDIRA            AUDIRA"}</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Lit s={spr.susi[rivPose]} pal={RIVAL_KIT} x={102} y={NETC.FAR_FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.4} flip />
        <AlbedoView albedo={set.net} lights={lights} opts={opts} />
        <Lit s={spr.susi[susiPose]} pal={PAL} x={46} y={NETC.NEAR_FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.6} />
        <Shuttle x={sh0.x} y={sh0.y} dir={sh0.hitter === "a" ? 1 : -1} />
        {t >= MATCH_POINT ? <Glow x={112} y={NETC.FAR_FEET} r={14} color="#FFE6BC" intensity={0.7 * (1 - seg(t, MATCH_POINT, MATCH_POINT + 1.2))} /> : null}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const NetHud: React.FC<{ t: number }> = ({ t }) => {
  const life = t < T.gim2 ? 0.25 : t < T.sebelasLima ? lerp(0.25, 0.65, seg(t, T.gim2, T.sebelasLima)) : lerp(0.65, 1, seg(t, T.gim3, MATCH_POINT));
  return (
    <>
      <Pop t={t} a={CUT.D + 0.05} b={T.tapi - 0.05} top={236}>
        <Chip text="KALAH 1 GIM LAGI = EMAS LEPAS" size={46} />
      </Pop>
      <Pop t={t} a={T.tapi} b={T.gim2 - 0.05} top={236}>
        <Chip text="SUSI BANGKIT" color={GREEN} border={GREEN} size={60} />
      </Pop>
      {t >= T.gim2 && t < T.gim3 ? <LevelBanner t={t} a={T.gim2} level={2} home="SUSI" away="BANG" score="11–5" scoreAt={T.sebelasLima} pending={liveScore(t, 11, 5, T.gim2 + 0.2, T.sebelasLima - 0.1)} /> : null}
      {t >= T.gim3 && t < T.karena ? <LevelBanner t={t} a={T.gim3} level={3} home="SUSI" away="BANG" score="11–3" scoreAt={MATCH_POINT} pending={liveScore(t, 10, 3, T.gim3 + 0.1, MATCH_POINT - 0.3)} /> : null}
      {t < T.karena ? <LifeBar t={t} v={life} top={370} /> : null}
      <Pop t={t} a={T.sebelasLima + 0.1} b={T.gim3 - 0.05} top={480}>
        <Chip text="LEVEL UP · 1–1" color={GREEN} border={GREEN} size={52} />
      </Pop>
      <Pop t={t} a={MATCH_POINT + 0.15} b={T.karena - 0.05} top={480}>
        <Chip text="SUSI MENANG 2–1" color={C.gold} border={C.gold} size={60} />
      </Pop>
      <Pop t={t} a={T.karena} b={T.emasnya - 0.05} top={236}>
        <Chip text="FINAL TUNGGAL PUTRI SELESAI PALING DULU" size={44} />
      </Pop>
      <Stamp t={t} a={T.emasnya} text="EMAS #1" sub="BULU TANGKIS OLIMPIADE DI DUNIA" top={236} />
    </>
  );
};

// ================================================================= E1 PODIUM
const podLights = (t: number): LitLight[] => [
  { kind: "cone", x: POD.X + 2, y: -20, r: 240, i: 1.55, angle: Math.PI / 2, spread: 0.32, color: "#FFE6BC" },
  { kind: "point", x: POD.POLE_X, y: 60, r: 50, i: 0.5 * seg(t, T.podium, T.raya), color: "#FFE6BC" },
  { kind: "point", x: 150, y: 40, r: 90, i: 0.4, color: "#CFE0FF" },
];
const PodiumScene: React.FC<{ t: number }> = ({ t }) => {
  const set = POD_SET();
  const spr = SPR();
  const lights = podLights(t);
  const ambient = 0.1;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const up = seg(t, T.podium + 0.2, CUT.E2 - 0.5);
  const fy = lerp(POD.POLE_BOT - 14, POD.POLE_TOP + 1, up);
  const wave = (i: number) => Math.sin(t * 6 + i * 0.9) * 0.8;
  const tremble = t >= T.menangis ? Math.sin(t * 40) * 0.35 : 0;
  const cam = camAt(t, [{ t: CUT.E1, y: 160, z: 30 }, { t: T.raya + 0.8, y: -110, z: 60, e: ease.cameraSoft }, { t: T.menangis, y: -20, z: 110 }, { t: CUT.E2, y: 20, z: 190, e: ease.cameraSoft }], 15);
  // camera flashes from the photographers
  return (
    <CinematicCamera cam={{ ...cam, aperture: 7 }}>
      <Layer z={1500} maxBlur={6}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {/* the Merah Putih on its pole, in art-px stripes that ripple */}
        {Array.from({ length: 12 }, (_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: (POD.POLE_X + 1 + i * 2) * PX, top: (fy + wave(i)) * PX, width: PX * 2, height: PX * 6, background: "#D02A30" }} />
            <div style={{ position: "absolute", left: (POD.POLE_X + 1 + i * 2) * PX, top: (fy + 6 + wave(i)) * PX, width: PX * 2, height: PX * 6, background: "#F3E6CC" }} />
          </React.Fragment>
        ))}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <LightShaft id="pod" x={POD.X + 2} y={-20} angle={Math.PI / 2} length={200} spread={0.16} color="#FFE6BC" intensity={0.18} />
        <Glow x={POD.X + 2} y={POD.TOP} r={22} color="#FFE6BC" intensity={0.4} squash={0.4} />
        <Lit s={spr.back} pal={PAL} x={POD.X + 2 + tremble} y={POD.TOP} lights={lights} ambient={ambient} anchor={STAND_ANCHOR} scale={PX * 1.6} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const podiumFlash = (t: number) => {
  if (t < CUT.E1 || t >= CUT.E2) return 0;
  let f = 0;
  for (let i = 0; i < 6; i++) {
    const at = CUT.E1 + 0.6 + i * 0.7 + hash(i * 13) * 0.3;
    f += 0.12 * win(t, at, at + 0.12, 0.01, 0.1);
  }
  return f;
};
const PodiumHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.E1 + 0.05} b={T.raya - 0.05} top={236}>
      <Chip text="EMAS · TUNGGAL PUTRI" color={C.gold} border={C.gold} size={52} />
    </Pop>
    <Pop t={t} a={T.raya} b={CUT.E2} top={236}>
      <Chip text="INDONESIA RAYA" color={C.ivory} border={RED} size={60} />
    </Pop>
  </>
);

// ================================================================= F JAKARTA PARADE
const jktLights: LitLight[] = [
  { kind: "point", x: 30, y: 70, r: 260, i: 1.3, color: "#FFB070" },
  { kind: "point", x: 150, y: 40, r: 100, i: 0.35, color: "#CFE0FF" },
];
const JakartaScene: React.FC<{ t: number }> = ({ t }) => {
  const set = JKT_SET();
  const spr = SPR();
  const ambient = 0.2;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const k = clamp((t - CUT.F) / (CUT.OUT - CUT.F));
  const carX = lerp(-10, 140, k);
  const bob = Math.sin(t * 9) * 0.3;
  const cam = camAt(t, [{ t: CUT.F, z: 60, y: -10 }, { t: CUT.OUT, z: -20, y: -40, e: ease.cameraSoft }], 23);
  const camX = (carX - 67) * PX * 0.75;
  const deck = JKT.CAR_Y - 12 * 1.5;
  const waveA: SidePose = Math.floor(t * 3) % 2 === 0 ? "wave" : "stand";
  const waveB: SidePose = Math.floor(t * 3 + 1) % 2 === 0 ? "wave" : "stand";
  return (
    <CinematicCamera cam={{ ...cam, x: cam.x + camX, aperture: 6 }}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={jktLights} opts={opts} />
        <Glow x={30} y={70} r={34} color="#FFB070" intensity={0.8} />
        <Glow x={JKT.MONAS_X} y={27} r={8} color="#FFD080" intensity={0.7} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={jktLights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -6 * PX, top: 88 * PX, width: 47 * PX, height: 10 * PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: C.gold }}>AUDIRA</div>
        <Lit s={spr.susi[waveA]} pal={PAL} x={carX - 11} y={deck + bob} lights={jktLights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.2} />
        <Lit s={spr.alan[waveB]} pal={PAL} x={carX + 9} y={deck + bob} lights={jktLights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.2} />
        <Lit s={spr.car} pal={PAL} x={carX} y={JKT.CAR_Y} lights={jktLights} ambient={ambient} anchor={CAR_ANCHOR} scale={PX * 1.5} />
        {/* flower petals thrown from the kerb */}
        {Array.from({ length: 26 }, (_, i) => {
          const sp = 6 + hash(i * 7) * 10;
          const x = -40 + hash(i * 3) * 220 + Math.sin(t * 1.3 + i) * 4;
          const y = ((hash(i * 11) * 160 + (t - CUT.F) * sp) % 160) + 20;
          return <div key={i} style={{ position: "absolute", left: x * PX, top: y * PX, width: PX, height: PX, background: i % 3 === 0 ? "#F3E6CC" : i % 3 === 1 ? "#F25A54" : "#F4B860", opacity: 0.85 }} />;
        })}
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={jktLights} opts={{ ambient: 0.14, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const JakartaHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.F + 0.05} b={T.mobil - 0.05} top={236}>
      <Chip text="PULANG KE JAKARTA · AGUSTUS 1992" size={44} />
    </Pop>
    <Pop t={t} a={T.mobil} b={T.sejuta - 0.05} top={236}>
      <Chip text="DIARAK DI MOBIL TERBUKA" size={48} border={C.gold} />
    </Pop>
    <Pop t={t} a={T.sejuta} b={CUT.OUT} top={236}>
      <Chip text="HINGGA ±1 JUTA ORANG" color={C.gold} border={C.gold} size={60} />
    </Pop>
    <Pop t={t} a={T.menikah} b={CUT.OUT} top={470}>
      <Chip text="MENIKAH 1997" color={GREEN} border={GREEN} size={48} />
    </Pop>
  </>
);

// ================================================================= OUT (back to the cover arena)
const OutScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.OUT, z: 140, y: -20 }, { t: T.berikutnya, z: 0, y: 0, e: ease.cameraSoft }, { t: TOTAL, z: -150, y: -80 }], 17, COVER_CAM);
  return <ArenaShot cam={cam} boost={1.1} />;
};
const OutHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.OUT + 0.1} b={T.berikutnya - 0.05} top={236}>
      <div style={{ background: "#0B0A10", border: `8px solid ${C.gold}`, boxShadow: `0 0 0 6px ${C.ink}, 0 0 40px ${rgba(C.amber, 0.45)}`, padding: "16px 30px 20px", textAlign: "center" }}>
        <div style={{ ...pixLabel, fontSize: 40, color: C.gold, fontWeight: 700 }}>AUDIRA</div>
        <div style={{ height: 4, background: rgba(C.gold, 0.5), margin: "12px 0" }} />
        <div style={{ ...pixLabel, fontSize: 36, color: C.ivory }}>FINAL 1992 · TUNGGAL PUTRI</div>
        <div style={{ fontFamily: FONT.display, fontSize: 96, color: C.ivory, lineHeight: 1, marginTop: 10 }}>
          SUSI <span style={{ color: C.gold }}>2–1</span> BANG
        </div>
        <div style={{ ...pixLabel, fontSize: 36, color: C.ivoryDim, marginTop: 8 }}>5–11 · 11–5 · 11–3</div>
      </div>
    </Pop>
    <Pop t={t} a={T.berikutnya} top={236}>
      <div style={{ background: rgba(C.ink, 0.9), border: `6px solid ${GREEN}`, padding: "12px 26px 14px", textAlign: "center" }}>
        <div style={{ ...pixLabel, fontSize: 40, color: GREEN }}>BERIKUTNYA · EP02</div>
        <div style={{ fontFamily: FONT.display, fontSize: 96, color: C.ivory, lineHeight: 1, marginTop: 8 }}>MARATON PALING KACAU</div>
        <div style={{ ...pixLabel, fontSize: 40, color: C.gold, marginTop: 6 }}>OLIMPIADE 1904</div>
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
  const flash = 0.3 * win(t, 0.05, 0.4, 0.03, 0.3) + 0.28 * win(t, MATCH_POINT, MATCH_POINT + 0.24, 0.02, 0.2) + 0.12 * win(t, T.limaSebelas, T.limaSebelas + 0.2, 0.02, 0.15) + podiumFlash(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {sc === "B" && <RoomScene t={t} />}
        {sc === "C" && <SideScene t={t} />}
        {sc === "D" && <NetScene t={t} />}
        {sc === "E1" && <PodiumScene t={t} />}
        {sc === "E2" && <AlanScene t={t} />}
        {sc === "F" && <JakartaScene t={t} />}
        {sc === "OUT" && <OutScene t={t} />}
        <Grade />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 34% 24% at 50% 47%, rgba(255,226,176,0.2) 0%, rgba(255,226,176,0.07) 55%, rgba(255,226,176,0) 100%)", mixBlendMode: "screen", pointerEvents: "none" }} />
        <Vignette strength={0.85} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {sc === "B" && <RoomHud t={t} />}
        {sc === "C" && <SideHud t={t} />}
        {sc === "D" && <NetHud t={t} />}
        {sc === "E1" && <PodiumHud t={t} />}
        {sc === "E2" && <AlanHud t={t} />}
        {sc === "F" && <JakartaHud t={t} />}
        {sc === "OUT" && <OutHud t={t} />}
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
