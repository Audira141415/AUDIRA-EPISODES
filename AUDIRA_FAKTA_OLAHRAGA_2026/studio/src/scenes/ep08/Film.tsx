// EP08 film "Owi/Butet, Kado Emas 17 Agustus" (PIXELSTORY). A 16-bit badminton game told in eight sets, every cut on a VO word:
//   A    HOOK      the cover arena (Rio 2016 final): clock 23:57 WIB, "3 MENIT SEBELUM 18 AGUSTUS", the smash, "EMAS OLIMPIADE"
//   B    KONTEKS   athletes' room at night: gold tradition 1992–2008, London 2012 empty, semifinal + bronze lost
//   C    PENGEMB.  side court 2v2 vs China: "0 GIM HILANG", Zhang Nan / Zhao Yunlei seed 1 + champions, semifinal 2–0
//   C2   PENGEMB.  Jakarta morning ceremony: the Merah Putih rises, "DOA UNTUK OWI/BUTET"
//   D    PENJELAS. net-height 2v2 vs Malaysia: H2H 7–1, roles (Butet net, Owi back), game 1 7–2, 11–4, 21–14, game 2 12–10
//   E1   PAYOFF    the cover arena again: match point 21–12 at minute 45, "45 = 1945"
//   E2   PAYOFF    podium from behind, two medallists, the flag rises: first mixed gold, only gold in Rio, 7th gold, the quote
//   OUT  OUTRO     Jakarta on Independence night (Monas, fireworks): Butet after Susy Susanti, EP09 teaser, then the AUDIRA card (Root)
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
import { ArenaShot, COVER_CAM, CoverText, MAS_KIT, SHUTTLE, type LitLight } from "./ArenaShot.tsx";
import { PAL, shuttle, side, SIDE_ANCHOR, sitter, SITTER_ANCHOR, SPEC, STAND_ANCHOR, standBack, type SidePose } from "./sprites.ts";
import { JKT, jakarta, NETC, netClose, POD, podium, room, ROOM, SIDE, sideCourt } from "./sets.ts";
import { Captions, Chip, GREEN, LevelBanner, NameCard, Pop, RED, Scoreboard, Stamp, Wipe } from "./hud.tsx";
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
const CEREMONY_SET = once(() => jakarta(false));
const NIGHT_SET = once(() => jakarta(true));
const SPR = once(() => {
  const f = (s: Sprite) => finish(s, SPEC);
  return {
    butet: { ready: f(side("ready")), smash: f(side("smash")), wave: f(side("wave")), stand: f(side("stand")) },
    owi: { ready: f(side("ready", "short")), smash: f(side("smash", "short")), wave: f(side("wave", "short")), stand: f(side("stand", "short")) },
    sit: f(sitter()),
    backButet: f(standBack()),
    backOwi: f(standBack(false)),
    cock: f(shuttle()),
  };
});
/** China's pair: red shirt, white band (generic, no crest). */
const RIVAL_KIT: Palette = { ...PAL, w: "#B8222E", v: "#6E1018", W: "#E2464A", z: "#2A080C", r: "#F5EEDF", R: "#BCAF98", q: "#FFFFFF", x: "#3E3430" };
const MAS_BLUE = "#3E58A8";

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
  return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) - Math.sin(k * Math.PI) * peak, hitter: n % 2 === 0 ? "a" : "b", k, n };
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

/** The Merah Putih in art-px stripes that ripple, hoisted to `fy` beside a pole at `poleX`. */
const Flag: React.FC<{ t: number; poleX: number; fy: number; n?: number }> = ({ t, poleX, fy, n = 12 }) => {
  const wave = (i: number) => Math.sin(t * 6 + i * 0.9) * 0.8;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: (poleX + 1 + i * 2) * PX, top: (fy + wave(i)) * PX, width: PX * 2, height: PX * 6, background: "#D02A30" }} />
          <div style={{ position: "absolute", left: (poleX + 1 + i * 2) * PX, top: (fy + 6 + wave(i)) * PX, width: PX * 2, height: PX * 6, background: "#F3E6CC" }} />
        </React.Fragment>
      ))}
    </>
  );
};

/** A soft horizontal haze band (art rows `top`..`top+h`), wider than the frame so camera moves never show its edge. */
const Mist: React.FC<{ top: number; h: number; color: string; a: number }> = ({ top, h, color, a }) => (
  <div style={{ position: "absolute", left: -900, width: 2880, top: top * PX, height: h * PX, background: `linear-gradient(180deg, ${rgba(color, 0)} 0%, ${rgba(color, a)} 50%, ${rgba(color, 0)} 100%)` }} />
);
/** Blurred racket head + net tape in the near foreground (E1). Screen px. */
const ForeRacket: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: -200, width: 1480, top: 1610, height: 26, background: "#E8E2D4", opacity: 0.85 }} />
    <div style={{ position: "absolute", left: -200, width: 1480, top: 1636, height: 600, backgroundImage: "repeating-linear-gradient(90deg, rgba(10,10,16,0.75) 0 6px, transparent 6px 40px), repeating-linear-gradient(0deg, rgba(10,10,16,0.75) 0 6px, transparent 6px 40px)" }} />
    <div style={{ position: "absolute", left: 760 + Math.sin(t * 1.3) * 10, top: 1250, width: 380, height: 480, borderRadius: "50%", border: "28px solid #16141C", boxSizing: "border-box", transform: "rotate(-24deg)", backgroundImage: "repeating-linear-gradient(90deg, rgba(220,220,230,0.35) 0 4px, transparent 4px 30px), repeating-linear-gradient(0deg, rgba(220,220,230,0.35) 0 4px, transparent 4px 30px)" }} />
  </>
);

/** Red LED clock (hook): 23:57 WIB, seconds ticking. */
const LedClock: React.FC<{ t: number }> = ({ t }) => {
  const sec = String(20 + Math.floor(t)).padStart(2, "0");
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ background: "#0B0A10", border: `8px solid ${RED}`, boxShadow: `0 0 0 6px ${C.ink}, 0 0 40px ${rgba(RED, 0.45)}`, padding: "14px 30px 18px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 0.9, color: "#FF5A4A", textShadow: "0 0 24px rgba(255,80,60,0.85)" }}>
        23{blink ? ":" : " "}57<span style={{ fontSize: 80 }}>{`:${sec}`}</span>
      </div>
      <div style={{ ...pixLabel, fontSize: 40, color: C.ivory, marginTop: 10 }}>WIB · 17 AGUSTUS 2016</div>
    </div>
  );
};

// ================================================================= A HOOK (cover arena)
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: 0, z: 0, y: 0 }, { t: 1.0, z: 20, e: ease.cameraSoft }, { t: CUT.B, z: 170, y: -30, e: ease.cameraSoft }], 3, COVER_CAM);
  const boost = 1 + 0.7 * win(t, 0.05, 0.6, 0.06, 0.45) + 0.5 * win(t, SMASH, SMASH + 0.5, 0.03, 0.4);
  // the shuttle hangs above the racket (cover), then the smash sends it into the far court
  const k = clamp((t - SMASH) / 0.4);
  const shuttleAt = t < SMASH ? { x: SHUTTLE.x, y: SHUTTLE.y + Math.sin(t * 2) * 0.6 } : k < 1 ? { x: lerp(SHUTTLE.x, 62, k), y: lerp(SHUTTLE.y, 132, k * k) } : null;
  const sh = shake(t, SMASH + 0.4, 14);
  return <ArenaShot cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} boost={boost} shuttleAt={shuttleAt} />;
};
export const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CoverText o={1 - seg(t, 2.1, 2.6)} />
    <Pop t={t} a={T.pukul} b={CUT.B} top={236}>
      <LedClock t={t} />
    </Pop>
    <Pop t={t} a={T.tigaMenit} b={T.emas - 0.05} top={560}>
      <Chip text="3 MENIT SEBELUM 18 AGUSTUS" size={48} border={C.ivoryDim} />
    </Pop>
    <Pop t={t} a={T.emas} b={CUT.B} top={560}>
      <Chip text="EMAS OLIMPIADE · RIO 2016" color={C.gold} border={C.gold} size={56} />
    </Pop>
  </>
);

// ================================================================= B ROOM (four years earlier: London)
const roomLights = (t: number): LitLight[] => [
  { kind: "point", x: ROOM.LAMP.x, y: ROOM.LAMP.y - 4, r: 72, i: 1.45 + 0.04 * Math.sin(t * 3.1), color: "#FFB866" },
  { kind: "point", x: ROOM.WIN.x + 14, y: ROOM.WIN.y + 20, r: 70, i: 0.45, color: "#BFD6FF" },
];
const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const set = ROOM_SET();
  const spr = SPR();
  const cam = camAt(t, [{ t: CUT.B, x: -70, y: -20, z: 10 }, { t: T.london, x: -20, y: 0, z: 60, e: ease.cameraSoft }, { t: T.owi, x: -8, y: 10, z: 70 }, { t: CUT.C, x: -4, y: 30, z: 120, e: ease.cameraSoft }], 5);
  const lights = roomLights(t);
  const opts = { ambient: 0.08, exposure: 1.1, dither: 0.45 };
  const c = ROOM.CLOCK;
  const on = t < T.london || Math.floor(t * 2) % 2 === 0;
  return (
    <CinematicCamera cam={{ ...cam, focus: 1000, aperture: 6 }}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={ROOM.WIN.x + 10} y={ROOM.WIN.y + 12} r={10} color="#DDE8FF" intensity={0.35} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Glow x={ROOM.LAMP.x} y={ROOM.LAMP.y - 5} r={30} color="#FFB866" intensity={0.75} squash={0.8} />
        <div style={{ ...pixLabel, position: "absolute", left: c.x * PX, top: c.y * PX, width: c.w * PX, height: c.h * PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#FF5A4A", textShadow: "0 0 14px rgba(255,80,60,0.8)", opacity: on ? 1 : 0.25 }}>
          2012
        </div>
        <Lit s={spr.owi.stand} pal={PAL} x={82} y={ROOM.FLOOR} lights={lights} ambient={0.11} anchor={SIDE_ANCHOR} scale={PX * 1.7} flip />
        <Lit s={spr.sit} pal={PAL} x={ROOM.SIT.x} y={ROOM.FLOOR} lights={lights} ambient={0.11} anchor={SITTER_ANCHOR} scale={PX * 2.4} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const GOLD_YEARS = [1992, 1996, 2000, 2004, 2008];
const TimelinePanel: React.FC<{ t: number }> = ({ t }) => {
  const lost = t >= T.london;
  const blink = lost && Math.floor((t - T.london) * 4) % 2 === 0;
  return (
    <div style={{ background: rgba(C.ink, 0.88), border: `6px solid ${C.ivoryDim}`, padding: "18px 22px", width: 960, boxSizing: "border-box" }}>
      <div style={{ ...pixLabel, fontSize: 40, color: C.gold, textAlign: "center" }}>{t < T.tradisi ? "EMAS BULU TANGKIS OLIMPIADE" : "TRADISI EMAS ..."}</div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
        {[...GOLD_YEARS, 2012].map((y, i) => {
          const gold = i < 5;
          const at = gold ? lerp(T.sejak + 0.5, T.selalu + 0.9, i / 4) : T.tradisi;
          const shown = t >= at;
          const s = shown ? Math.min(1, 0.6 + (t - at) * 3) : 0;
          return (
            <div key={y} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: shown ? 1 : 0.15 }}>
              <div style={{ width: 120, height: 120, boxSizing: "border-box", border: `8px solid ${gold ? C.gold : blink ? RED : C.ivoryDim}`, background: gold ? rgba(C.gold, 0.85) : "transparent", transform: `scale(${s || 1})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontSize: 80, color: lost ? RED : C.ivoryDim }}>
                {gold ? "" : lost ? "0" : "?"}
              </div>
              <div style={{ ...pixLabel, fontSize: 40, color: gold ? C.ivory : lost ? "#FF8A80" : C.ivoryDim }}>{y}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const RoomHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.B + 0.05} b={T.owi - 0.05} top={236}>
      <TimelinePanel t={t} />
    </Pop>
    <Pop t={t} a={T.london} b={T.owi - 0.05} top={530}>
      <Chip text="LONDON 2012 · TANPA EMAS" color="#FF8A80" border={RED} size={52} />
    </Pop>
    <Pop t={t} a={T.owi} b={CUT.C} top={236} left={60} origin="0% 50%">
      <NameCard name="OWI & BUTET" role="GANDA CAMPURAN INDONESIA" />
    </Pop>
    <Pop t={t} a={T.gagal} b={CUT.C} top={450}>
      <Chip text={t < T.lalu ? "SEMIFINAL: KALAH" : "SEMIFINAL: KALAH · PERUNGGU: KALAH"} color="#FF8A80" size={46} />
    </Pop>
  </>
);

// ================================================================= C SIDE COURT (Rio, the road to the final)
const sideLights: LitLight[] = [
  { kind: "cone", x: 67, y: -6, r: 230, i: 1.35, angle: Math.PI / 2, spread: 0.6, color: "#FFE6BC" },
  { kind: "point", x: 150, y: 50, r: 90, i: 0.4, color: "#CFE0FF" },
];
const SideScene: React.FC<{ t: number }> = ({ t }) => {
  const set = SIDE_SET();
  const spr = SPR();
  const lights = sideLights;
  const ambient = 0.13;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  // left: Butet front (x 50), Owi back (x 22); right: China front (x 84), back (x 112). The rally alternates front/back hitters.
  const r = rally(t, CUT.C, { x: 44, y: 110 }, { x: 92, y: 110 }, t > T.disingkirkan ? 0.7 : 0.9, 30);
  const front = Math.floor(r.n / 2) % 2 === 0;
  const hit = (side: "a" | "b") => r.hitter === side && r.k < 0.18;
  const pose = (side: "a" | "b", isFront: boolean): SidePose => (hit(side) && isFront === front ? "smash" : "ready");
  const cam = camAt(t, [{ t: CUT.C, z: 120, y: 60 }, { t: CUT.C + 4, z: 160, y: 70 }, { t: CUT.C2, z: 220, y: 80 }], 11);
  const camX = (r.x - 67) * PX * 0.3;
  const sh = shake(t, T.disingkirkan, 18);
  const cs: CameraState = { ...cam, x: cam.x + camX + sh.x, y: cam.y + sh.y, aperture: 5 };
  const S = 1.3;
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        {[10, 67, 124].map((x) => <Glow key={x} x={x} y={4} r={16} color="#FFE6BC" intensity={0.5} squash={0.6} />)}
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -18 * PX, top: SIDE.BOARD_Y * PX + 10, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <div style={{ ...pixLabel, position: "absolute", left: 102 * PX, top: SIDE.BOARD_Y * PX + 10, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <LightShaft id="side" x={67} y={-6} angle={Math.PI / 2} length={180} spread={0.3} color="#FFE6BC" intensity={0.12} />
        <Lit s={spr.owi[pose("a", false)]} pal={PAL} x={22} y={SIDE.FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} />
        <Lit s={spr.butet[pose("a", true)]} pal={PAL} x={48} y={SIDE.FEET - 2} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} />
        <Lit s={spr.butet[pose("b", true)]} pal={RIVAL_KIT} x={86} y={SIDE.FEET - 2} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} flip />
        <Lit s={spr.owi[pose("b", false)]} pal={RIVAL_KIT} x={112} y={SIDE.FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * S} flip />
        <Shuttle x={r.x} y={r.y} dir={r.hitter === "a" ? 1 : -1} />
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const SideHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.C + 0.05} b={T.semifinal - 0.05} top={236}>
      <Chip text={t < T.takGim ? "RIO 2016" : "RIO 2016 · 0 GIM HILANG"} color={C.gold} border={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.unggulan} b={T.disingkirkan - 0.05} top={236} left={60} origin="0% 50%">
      <NameCard name={t < T.zhang ? "SEMIFINAL" : "ZHANG NAN / ZHAO YUNLEI"} role="CHINA · UNGGULAN 1 · JUARA BERTAHAN" accent="#B8222E" />
    </Pop>
    <Pop t={t} a={T.disingkirkan} b={CUT.C2} top={236}>
      <Chip text="SEMIFINAL · MENANG 2–0" color={GREEN} border={GREEN} size={60} />
    </Pop>
  </>
);

// ================================================================= C2 JAKARTA MORNING (the ceremony)
const morningLights: LitLight[] = [
  { kind: "point", x: 30, y: 70, r: 260, i: 1.35, color: "#FFC890" },
  { kind: "point", x: 150, y: 40, r: 100, i: 0.45, color: "#CFE0FF" },
];
const CeremonyScene: React.FC<{ t: number }> = ({ t }) => {
  const set = CEREMONY_SET();
  const ambient = 0.24;
  const opts = { ambient, exposure: 1.15, dither: 0.45 };
  const up = seg(t, CUT.C2 + 0.1, CUT.D - 0.4);
  const fy = lerp(92, 44, up);
  const cam = camAt(t, [{ t: CUT.C2, y: 20, z: 60, x: 260 }, { t: CUT.D, y: -120, z: 140, x: 300, e: ease.cameraSoft }], 19);
  return (
    <CinematicCamera cam={{ ...cam, aperture: 6 }}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={morningLights} opts={opts} />
        <Glow x={30} y={70} r={34} color="#FFC890" intensity={0.8} />
        <Flag t={t} poleX={JKT.MONAS_X} fy={fy} />
      </Layer>
      <Layer z={1250} maxBlur={6}>
        <Mist top={JKT.STREET_T - 44} h={40} color="#FFD8B0" a={0.32} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={morningLights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -6 * PX, top: 88 * PX, width: 47 * PX, height: 10 * PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: C.gold }}>AUDIRA</div>
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={morningLights} opts={{ ambient: 0.16, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const CeremonyHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.C2 + 0.05} b={CUT.D} top={236}>
      <Chip text="PAGI · 17 AGUSTUS 2016" color={C.gold} border={RED} size={56} />
    </Pop>
    <Pop t={t} a={T.upacara} b={CUT.D} top={1060}>
      <Chip text="UPACARA DI KEMENPORA" sub="DOA UNTUK OWI / BUTET" size={48} border={C.ivoryDim} />
    </Pop>
  </>
);

// ================================================================= D NET CLOSE-UP (the final vs Malaysia)
const netLights: LitLight[] = [
  { kind: "cone", x: 67, y: -16, r: 240, i: 1.7, angle: Math.PI / 2, spread: 0.42, color: "#FFE6BC" },
  { kind: "point", x: 150, y: 40, r: 90, i: 0.4, color: "#CFE0FF" },
];
const NetScene: React.FC<{ t: number }> = ({ t }) => {
  const set = NET_SET();
  const spr = SPR();
  const lights = netLights;
  const ambient = 0.07;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  // Butet at the net plays the short ball; Owi from the back plays every third shot as a smash
  const near = { x: 56, y: 92 };
  const far = { x: 98, y: 80 };
  const period = t < T.gim2 ? 0.85 : 0.7;
  const r = rally(t, CUT.D, near, far, period, 24);
  const owiTurn = Math.floor(r.n / 2) % 3 === 2;
  const nearHit = r.hitter === "a" && r.k < 0.2;
  const butetPose: SidePose = nearHit && !owiTurn ? "smash" : "ready";
  const owiPose: SidePose = nearHit && owiTurn ? "smash" : "ready";
  const farFront = Math.floor(r.n / 2) % 2 === 0;
  const farHit = r.hitter === "b" && r.k < 0.2;
  const milestones = [T.tujuhDua, T.sebelasEmpat, T.empatBelas, T.sepuluh];
  const sh = milestones.reduce((acc, m) => {
    const s = shake(t, m, 14);
    return { x: acc.x + s.x, y: acc.y + s.y };
  }, { x: 0, y: 0 });
  const cam = camAt(t, [{ t: CUT.D, z: 30, y: 20 }, { t: T.butet, z: 80, y: 30, x: -40, e: ease.cameraSoft }, { t: T.owiBelakang, z: 60, y: 60, x: -80 }, { t: T.tujuhDua, z: 90, y: 20, x: 0 }, { t: T.gim2, z: 130, y: 10 }, { t: CUT.E1, z: 200, y: 0, e: ease.cameraSoft }], 9);
  const camX = (r.x - 67) * PX * 0.3;
  const cs: CameraState = { ...cam, x: cam.x + camX + sh.x, y: cam.y + sh.y, aperture: 6 };
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={7}>
        <AlbedoView albedo={set.back} lights={lights} opts={{ ...opts, ambient: 0.04 }} />
        <div style={{ ...pixLabel, position: "absolute", left: -2 * PX, top: 91 * PX, fontSize: 30, fontWeight: 700, color: C.gold }}>{"AUDIRA            AUDIRA            AUDIRA"}</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <Lit s={spr.butet[farHit && farFront ? "smash" : "ready"]} pal={MAS_KIT} x={94} y={NETC.FAR_FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.25} flip />
        <Lit s={spr.owi[farHit && !farFront ? "smash" : "ready"]} pal={MAS_KIT} x={116} y={NETC.FAR_FEET - 4} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.1} flip />
        <AlbedoView albedo={set.net} lights={lights} opts={opts} />
        <Lit s={spr.butet[butetPose]} pal={PAL} x={48} y={NETC.NEAR_FEET} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 1.6} />
        <Shuttle x={r.x} y={r.y} dir={r.hitter === "a" ? 1 : -1} />
      </Layer>
      <Layer z={760}>
        <Lit s={spr.owi[owiPose]} pal={PAL} x={16} y={NETC.NEAR_FEET + 22} lights={lights} ambient={ambient} anchor={SIDE_ANCHOR} scale={PX * 2.0} />
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
export const NetHud: React.FC<{ t: number }> = ({ t }) => {
  const g1 = t < T.sebelasEmpat ? "7–2" : t < T.empatBelas ? "11–4" : "21–14";
  const g1At = t < T.sebelasEmpat ? T.tujuhDua : t < T.empatBelas ? T.sebelasEmpat : T.empatBelas;
  return (
    <>
      <Pop t={t} a={T.chan - 0.1} b={T.sekali - 0.05} top={236} left={60} origin="0% 50%">
        <NameCard name="CHAN PENG SOON / GOH LIU YING" role="FINAL · MALAYSIA" accent={MAS_BLUE} />
      </Pop>
      <Pop t={t} a={T.sekali} b={T.butet - 0.05} top={236}>
        <Chip text="RIWAYAT TEMU: 7–1" sub="MALAYSIA CUMA MENANG SEKALI" color={GREEN} border={GREEN} size={56} />
      </Pop>
      <Pop t={t} a={T.butet} b={T.tujuhDua - 0.05} top={236}>
        <Chip text="BUTET · DEPAN NET" color={C.gold} border={C.gold} size={52} />
      </Pop>
      <Pop t={t} a={T.owiBelakang} b={T.tujuhDua - 0.05} top={400}>
        <Chip text="OWI · SERANG DARI BELAKANG" size={48} border={RED} />
      </Pop>
      {t >= T.tujuhDua && t < T.gim2 ? <LevelBanner t={t} a={T.tujuhDua - 0.05} level={1} home="INA" away="MAS" score={g1} scoreAt={g1At} /> : null}
      {t >= T.gim2 ? <LevelBanner t={t} a={T.gim2} level={2} home="INA" away="MAS" score="12–10" scoreAt={T.sepuluh} pending={t < T.mengejar ? "–" : `${Math.round(lerp(8, 11, seg(t, T.mengejar, T.sepuluh - 0.1)))}–${Math.round(lerp(4, 9, seg(t, T.mengejar, T.sepuluh - 0.1)))}`} /> : null}
      <Pop t={t} a={T.empatBelas + 0.1} b={T.gim2 - 0.05} top={420}>
        <Chip text="GIM 1 · INDONESIA" color={C.gold} border={C.gold} size={52} />
      </Pop>
      <Pop t={t} a={T.mengejar} b={CUT.E1} top={420}>
        <Chip text="MALAYSIA MENGEJAR" color="#FF8A80" border={RED} size={52} />
      </Pop>
    </>
  );
};

// ================================================================= E1 MATCH POINT (cover arena, closer)
const MatchScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.E1, z: 150, y: -110, x: 30, roll: -3 }, { t: MATCH_POINT - 0.3, z: 290, y: -150, x: 10, roll: -1.5, e: ease.cameraSoft }, { t: MATCH_POINT + 0.4, z: 320, y: -120, roll: 0 }, { t: CUT.E2, z: 210, y: -60, e: ease.cameraSoft }], 13, COVER_CAM);
  const far = { x: 44, y: 116 };
  const lift = MATCH_POINT - 0.9;
  let shuttleAt: { x: number; y: number } | null;
  if (t < lift) {
    const r = rally(t, CUT.E1, SHUTTLE, far, 0.8, 22);
    shuttleAt = { x: r.x, y: r.y };
  } else if (t < MATCH_POINT) {
    const k = (t - lift) / 0.9;
    shuttleAt = { x: lerp(far.x, SHUTTLE.x, k), y: lerp(far.y, SHUTTLE.y, k) - Math.sin(k * Math.PI) * 26 };
  } else {
    const k = clamp((t - MATCH_POINT) / 0.35);
    shuttleAt = k < 1 ? { x: lerp(SHUTTLE.x, 70, k), y: lerp(SHUTTLE.y, 134, k * k) } : null;
  }
  const boost = 1.05 + 0.8 * win(t, MATCH_POINT, MATCH_POINT + 0.7, 0.03, 0.6);
  const sh = shake(t, MATCH_POINT + 0.35, 30, 0.2);
  return (
    <>
      <ArenaShot cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y, aperture: 9 }} boost={boost * 1.15} ambient={0.06} shuttleAt={shuttleAt} />
      <AbsoluteFill style={{ filter: "blur(9px)", transform: `translate(${sh.x * 1.6}px, ${sh.y * 1.6}px)` }}>
        <ForeRacket t={t} />
      </AbsoluteFill>
    </>
  );
};
export const MatchHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Scoreboard t={t} a="INA" b="MAS" score={t < MATCH_POINT ? "20–12" : "21–12"} flashAt={MATCH_POINT} top={236} />
    <Pop t={t} a={CUT.E1 + 0.05} b={T.menit - 0.05} top={236} left={60} origin="0% 50%">
      <Chip text="MATCH POINT" color={C.gold} border={C.gold} size={48} />
    </Pop>
    <Pop t={t} a={T.menit} b={T.empatLima - 0.05} top={420}>
      <Chip text="MENIT KE-45" color={C.ivory} border={C.gold} size={64} />
    </Pop>
    {t >= T.empatLima ? <Stamp t={t} a={T.empatLima} text="45 = 1945" sub={t >= T.proklamasi ? "TAHUN PROKLAMASI" : undefined} top={420} /> : null}
  </>
);

// ================================================================= E2 PODIUM
const podLights = (t: number): LitLight[] => [
  { kind: "cone", x: POD.X + 2, y: -20, r: 240, i: 1.55, angle: Math.PI / 2, spread: 0.34, color: "#FFE6BC" },
  { kind: "point", x: POD.POLE_X, y: 60, r: 50, i: 0.5 * seg(t, CUT.E2, T.satuSatunya), color: "#FFE6BC" },
  { kind: "point", x: 150, y: 40, r: 90, i: 0.4, color: "#CFE0FF" },
];
const PodiumScene: React.FC<{ t: number }> = ({ t }) => {
  const set = POD_SET();
  const spr = SPR();
  const lights = podLights(t);
  const ambient = 0.1;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const up = seg(t, CUT.E2 + 0.2, T.kata);
  const fy = lerp(POD.POLE_BOT - 14, POD.POLE_TOP + 1, up);
  const cam = camAt(t, [{ t: CUT.E2, y: 160, z: 30 }, { t: T.satuSatunya, y: -110, z: 60, e: ease.cameraSoft }, { t: T.kata, y: -20, z: 110 }, { t: CUT.OUT, y: 20, z: 190, e: ease.cameraSoft }], 15);
  return (
    <CinematicCamera cam={{ ...cam, aperture: 7 }}>
      <Layer z={1500} maxBlur={6}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Flag t={t} poleX={POD.POLE_X} fy={fy} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <LightShaft id="pod" x={POD.X + 2} y={-20} angle={Math.PI / 2} length={200} spread={0.2} color="#FFE6BC" intensity={0.18} />
        <Glow x={POD.X + 2} y={POD.TOP} r={24} color="#FFE6BC" intensity={0.4} squash={0.4} />
        <Lit s={spr.backOwi} pal={PAL} x={POD.X - 10} y={POD.TOP} lights={lights} ambient={ambient} anchor={STAND_ANCHOR} scale={PX * 1.6} />
        <Lit s={spr.backButet} pal={PAL} x={POD.X + 14} y={POD.TOP} lights={lights} ambient={ambient} anchor={STAND_ANCHOR} scale={PX * 1.5} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const podiumFlash = (t: number) => {
  if (t < CUT.E2 || t >= CUT.OUT) return 0;
  let f = 0;
  for (let i = 0; i < 10; i++) {
    const at = CUT.E2 + 0.5 + i * 0.85 + hash(i * 13) * 0.3;
    f += 0.1 * win(t, at, at + 0.12, 0.01, 0.1);
  }
  return f;
};
const MEDALS = [1992, 1992, 1996, 2000, 2004, 2008, 2016];
const MedalRow: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", gap: 10, padding: "16px 18px", background: rgba(C.ink, 0.86), border: `6px solid ${C.gold}` }}>
    {MEDALS.map((y, i) => {
      const at = T.ketujuh + i * 0.1;
      const on = t >= at;
      const last = i === MEDALS.length - 1;
      return (
        <div key={i} style={{ width: 128, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: on ? 1 : 0.15, transform: `scale(${on ? Math.min(1, 0.5 + (t - at) * 4) : 0.5})` }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: last ? C.gold : rgba(C.gold, 0.75), border: `6px solid ${last ? C.ivory : C.amber}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontSize: 54, color: C.ink }}>{i + 1}</div>
          <div style={{ ...pixLabel, fontSize: 40, letterSpacing: "0.02em", color: last ? C.gold : C.ivory }}>{y}</div>
        </div>
      );
    })}
  </div>
);
export const PodiumHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t < T.satuSatunya ? <Stamp t={t} a={CUT.E2} text="EMAS" sub="GANDA CAMPURAN PERTAMA INDONESIA" top={236} /> : null}
    <Pop t={t} a={T.satuSatunya} b={T.ketujuh - 0.05} top={236}>
      <Chip text="SATU-SATUNYA EMAS INDONESIA DI RIO" color={C.gold} border={C.gold} size={56} />
    </Pop>
    <Pop t={t} a={T.ketujuh} b={T.kata - 0.05} top={236}>
      <Chip text="EMAS OLIMPIADE KE-7" sub="SEMUA DARI BULU TANGKIS" color={C.gold} border={C.gold} size={48} />
    </Pop>
    <Pop t={t} a={T.ketujuh + 0.1} b={T.kata - 0.05} top={430}>
      <MedalRow t={t} />
    </Pop>
    <Pop t={t} a={T.kata} b={CUT.OUT} top={236}>
      <div style={{ background: rgba(C.ink, 0.9), border: `8px solid ${RED}`, padding: "18px 30px 22px", textAlign: "center", maxWidth: 940 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 104, color: C.ivory, lineHeight: 0.95 }}>
          "HADIAH <span style={{ color: C.gold }}>HARI KEMERDEKAAN</span>"
        </div>
        <div style={{ ...pixLabel, fontSize: 40, color: C.gold, marginTop: 12 }}>— OWI</div>
      </div>
    </Pop>
  </>
);

// ================================================================= OUT (Jakarta, Independence night)
const nightLights = (t: number): LitLight[] => [
  { kind: "point", x: JKT.MONAS_X, y: 40, r: 120, i: 0.7 + 0.5 * fireworks(t), color: "#FFD9A0" },
  { kind: "point", x: 170, y: 30, r: 120, i: 0.5, color: "#8FA8FF" },
];
const BURSTS = Array.from({ length: 18 }, (_, i) => ({ at: i * 0.75 + hash(i * 7) * 0.4, x: JKT.MONAS_X - 55 + hash(i * 11) * 110, y: 46 + hash(i * 19) * 36, c: ["#F25A54", "#F4D27A", "#F3E6CC", "#7FD0FF"][i % 4] }));
function fireworks(t: number) {
  const u = t - CUT.OUT;
  return BURSTS.reduce((a, b) => a + win(u, b.at, b.at + 1.5, 0.05, 1.2), 0);
}
const NightScene: React.FC<{ t: number }> = ({ t }) => {
  const set = NIGHT_SET();
  const lights = nightLights(t);
  const ambient = 0.09;
  const opts = { ambient, exposure: 0.85, dither: 0.45 };
  const u = t - CUT.OUT;
  const cam = camAt(t, [{ t: CUT.OUT, z: 60, y: -90, x: 520 }, { t: T.berikutnya, z: -40, y: -120, x: 500, e: ease.cameraSoft }, { t: TOTAL, z: -120, y: -140, x: 480 }], 23);
  return (
    <CinematicCamera cam={{ ...cam, aperture: 6 }}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={JKT.MONAS_X} y={27} r={9} color="#FFD080" intensity={0.9} />
        {BURSTS.map((b, i) => {
          const k = clamp((u - b.at) / 1.5);
          if (k <= 0 || k >= 1) return null;
          const rad = 8 + k * 40;
          return (
            <React.Fragment key={i}>
              <Glow x={b.x} y={b.y} r={rad * 1.3} color={b.c} intensity={2.2 * (1 - k)} />
              {Array.from({ length: 28 }, (_, j) => {
                const a = (j / 28) * Math.PI * 2;
                return <div key={j} style={{ position: "absolute", left: (b.x + Math.cos(a) * rad) * PX, top: (b.y + Math.sin(a) * rad + k * k * 6) * PX, width: PX * 4, height: PX * 4, background: b.c, opacity: 1 - k * 0.6 }} />;
              })}
            </React.Fragment>
          );
        })}
      </Layer>
      <Layer z={1250} maxBlur={6}>
        <Mist top={JKT.STREET_T - 46} h={44} color="#5A6CB0" a={0.38} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: -6 * PX, top: 88 * PX, width: 47 * PX, height: 10 * PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: C.gold }}>AUDIRA</div>
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.07, exposure: 0.7, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const Plaque: React.FC<{ year: string; name: string; hot?: boolean }> = ({ year, name, hot }) => (
  <div style={{ background: rgba(C.ink, 0.9), border: `6px solid ${C.gold}`, boxShadow: hot ? `0 0 30px ${rgba(C.amber, 0.6)}` : undefined, padding: "12px 26px 16px", textAlign: "center", width: 440, boxSizing: "border-box" }}>
    <div style={{ fontFamily: FONT.display, fontSize: 84, color: C.gold, lineHeight: 0.95 }}>{year}</div>
    <div style={{ ...pixLabel, fontSize: 50, color: C.ivory, marginTop: 8, whiteSpace: "normal", lineHeight: 1.15, textShadow: "0 2px 0 #000" }}>{name}</div>
  </div>
);
export const NightHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={CUT.OUT + 0.1} b={T.berikutnya - 0.05} top={236}>
      <Chip text="PEREMPUAN KE-2" sub="PERAIH EMAS OLIMPIADE INDONESIA" color={C.gold} size={56} border={C.gold} />
    </Pop>
    <Pop t={t} a={T.susy} b={T.berikutnya - 0.05} top={470}>
      <div style={{ display: "flex", gap: 24 }}>
        <Plaque year="1992" name="SUSY SUSANTI" />
        <Plaque year="2016" name="LILIYANA NATSIR" hot />
      </div>
    </Pop>
    <Pop t={t} a={T.berikutnya} top={236}>
      <div style={{ background: rgba(C.ink, 0.9), border: `6px solid ${GREEN}`, padding: "12px 26px 14px", textAlign: "center" }}>
        <div style={{ ...pixLabel, fontSize: 40, color: GREEN }}>BERIKUTNYA · EP09</div>
        <div style={{ fontFamily: FONT.display, fontSize: 96, color: C.ivory, lineHeight: 1, marginTop: 8 }}>JAMAIKA BOBSLED</div>
        <div style={{ ...pixLabel, fontSize: 40, color: C.gold, marginTop: 6 }}>CALGARY 1988</div>
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
  const flash = 0.3 * win(t, 0.05, 0.4, 0.03, 0.3) + 0.2 * win(t, SMASH, SMASH + 0.2, 0.02, 0.15) + 0.3 * win(t, MATCH_POINT, MATCH_POINT + 0.24, 0.02, 0.2) + podiumFlash(t) + (sc === "OUT" ? 0.06 * fireworks(t) : 0);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {sc === "B" && <RoomScene t={t} />}
        {sc === "C" && <SideScene t={t} />}
        {sc === "C2" && <CeremonyScene t={t} />}
        {sc === "D" && <NetScene t={t} />}
        {sc === "E1" && <MatchScene t={t} />}
        {sc === "E2" && <PodiumScene t={t} />}
        {sc === "OUT" && <NightScene t={t} />}
        <Grade />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 34% 24% at 50% 47%, rgba(255,226,176,0.2) 0%, rgba(255,226,176,0.07) 55%, rgba(255,226,176,0) 100%)", mixBlendMode: "screen", pointerEvents: "none" }} />
        <Vignette strength={0.85} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {sc === "B" && <RoomHud t={t} />}
        {sc === "C" && <SideHud t={t} />}
        {sc === "C2" && <CeremonyHud t={t} />}
        {sc === "D" && <NetHud t={t} />}
        {sc === "E1" && <MatchHud t={t} />}
        {sc === "E2" && <PodiumHud t={t} />}
        {sc === "OUT" && <NightHud t={t} />}
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
