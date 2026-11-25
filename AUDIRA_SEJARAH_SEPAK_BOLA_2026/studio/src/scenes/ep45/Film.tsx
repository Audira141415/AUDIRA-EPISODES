// EP45 film "Denmark, Juara Tanpa Lolos" (PIXELSTORY). A 16-bit football game told in six sets, every cut on a VO word:
//   A    HOOK      the cover stadium: confetti falls, dolly to the cup, "EURO 1992" / "JUARA"
//   B1   KONTEKS   living room 1992: the TV's Group 1 list, YUGOSLAVIA struck out, DENMARK lights up
//   B2   KONTEKS   wall calendar 31 MEI, "10 HARI", Sweden 10–26 June, 8 teams
//   C1-3 PENGEMB.  afternoon pitch as three game levels: ENG 0–0, SWE 0–1 (life bar drains), FRA 2–1 (refills)
//   D    PENJELAS. night goal from behind the taker: 2–2 aet, shoot-out, the keeper's save, stamp 5–4
//   E1-3 PAYOFF    final stadium crane-down (26 Juni, Nya Ullevi, 37.800), two goals 18' and 78', cup lifted
//   OUT  OUTRO     wide stadium, AUDIRA scoreboard "FINAL 1992 · DENMARK 2–0 JERMAN", then the AUDIRA card (Root)
// Facts on screen only from research/SOURCE_REGISTER.md. Players are generic sprites: no faces, no crests.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash } from "../../kits/pixelstory/core/noise.ts";
import { ease } from "../../kits/pixelstory/core/motion.ts";
import { CinematicCamera, Layer, SCREEN, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { cameraAt, drift } from "../../kits/pixelstory/camera/path.ts";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import type { Palette, Sprite } from "../../kits/pixelstory/pixel/sprite.ts";
import { Exposure, Glow, Grade, Grain, LightShaft, Vignette } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { COVER_CAM, CoverText, StadiumShot, type LitLight } from "./StadiumShot.tsx";
import { ballFill, finishPlayer, keeperDiveFill, keeperStandFill, playerFill, TEAM, type Pose } from "./sprites.ts";
import { GOAL, PITCH, ROOM, goal, pitch, room } from "./sets.ts";
import { Captions, Chip, GREEN, LevelBanner, LifeBar, NameCard, Pop, RED, Scoreboard, Stamp, Wipe } from "./hud.tsx";
import { CUT, T, clamp, lerp, sceneAt, seg, win } from "./timing.ts";

// ---------------------------------------------------------------- caches (built once per tab)
const once = <X,>(make: () => X) => {
  let v: X | undefined;
  return () => (v ??= make());
};
const ROOM_SET = once(room);
const PITCH_SET = once(pitch);
const GOAL_SET = once(() => goal(5));
const FINAL_GOAL_SET = once(() => goal(26));
const SPR = once(() => ({
  run0: finishPlayer(playerFill("run0")),
  run1: finishPlayer(playerFill("run1")),
  stand: finishPlayer(playerFill("stand")),
  kick: finishPlayer(playerFill("kick")),
  keeper: finishPlayer(keeperStandFill()),
  dive: finishPlayer(keeperDiveFill()),
  ball: finishPlayer(ballFill()),
}));

// ---------------------------------------------------------------- helpers
type Key = { t: number; e?: (k: number) => number } & Partial<CameraState>;
const camAt = (t: number, ks: Key[], seed = 1, base: CameraState = { ...COVER_CAM, aperture: 6 }): CameraState => {
  const c = cameraAt(t * 60, ks.map((k) => ({ ...k, f: k.t * 60 })), base);
  const d = drift(t * 60, seed);
  return { ...c, x: c.x + d.x, y: c.y + d.y, roll: c.roll + d.roll };
};
/** 4-frame shake after `at` (deterministic). */
const shake = (t: number, at: number, amp = 18, dur = 0.12) => {
  const k = t - at;
  if (k < 0 || k > dur) return { x: 0, y: 0 };
  const i = Math.floor(k * 60 / 2);
  const fall = 1 - k / dur;
  return { x: (hash(i * 3 + Math.floor(at * 10)) - 0.5) * 2 * amp * fall, y: (hash(i * 5 + 1) - 0.5) * 2 * amp * fall };
};
const runPose = (t: number, phase = 0): Pose => (Math.floor(t * 60 / 8 + phase) % 2 === 0 ? "run0" : "run1");
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
    lights={[...spriteLightsAt(lights, x, y - 12, { rim: 1, core: 0.3, width: 1 }), ...(rim ? [{ dir: [1, -0.6] as [number, number], color: "#CFE0FF", rim: 0.5, core: 0, width: 1 }] : [])]}
    gain={spriteGainAt(lights, x, y - 12, ambient)}
  />
);

// ================================================================= A HOOK (cover stadium)
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: 0, z: 0, y: 0 }, { t: 1.0, z: 20, e: ease.cameraSoft }, { t: CUT.B1, z: 190, y: -40, e: ease.cameraSoft }], 3, COVER_CAM);
  const boost = 1 + 0.7 * win(t, 0.05, 0.6, 0.06, 0.45);
  return <StadiumShot cam={cam} confettiT={t} boost={boost} />;
};
const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CoverText o={1 - seg(t, 2.2, 2.8)} />
    <Pop t={t} a={Math.max(T.piala, 2.7)} b={CUT.B1} top={250}>
      <Chip text="PIALA EROPA 1992" size={46} />
    </Pop>
    <Pop t={t} a={T.juara - 0.05} b={CUT.B1} top={360}>
      <Chip text="TAK LOLOS → JUARA" color={C.gold} border={C.gold} size={44} />
    </Pop>
  </>
);

// ================================================================= B ROOM (TV + calendar)
const roomLights = (t: number): LitLight[] => {
  const S = ROOM.SCREEN;
  const flick = 1.2 + 0.07 * Math.sin(t * 23) + 0.05 * Math.sin(t * 7.3) + 0.25 * win(t, T.denmark, T.denmark + 0.6, 0.05, 0.5);
  return [
    { kind: "point", x: S.x + S.w / 2, y: S.y + S.h / 2 + 6, r: 78, i: flick, color: "#BFD6FF" },
    { kind: "point", x: ROOM.LAMP.x, y: ROOM.LAMP.y - 4, r: 62, i: 0.75, color: "#FFC27A" },
  ];
};
const TvScreen: React.FC<{ t: number }> = ({ t }) => {
  const S = ROOM.SCREEN;
  const rows = ["SWEDIA", "PRANCIS", "INGGRIS", "YUGOSLAVIA"];
  const strike = clamp((t - T.dicoret) / 0.45);
  const den = t >= T.denmark;
  const blink = den && t < T.denmark + 0.8 && Math.floor((t - T.denmark) * 10) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: S.x * PX, top: S.y * PX, width: S.w * PX, height: S.h * PX, overflow: "hidden", padding: "22px 24px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(120,170,255,0.28), rgba(10,14,30,0.85))" }} />
      {t < CUT.B2 ? <>
      <div style={{ position: "relative", ...pixLabel, fontSize: 24, color: C.gold }}>BERITA · PIALA EROPA</div>
      <div style={{ position: "relative", ...pixLabel, fontSize: 26, color: "#9FC4FF", marginTop: 16 }}>GRUP 1</div>
      {rows.map((r, i) => {
        const on = t >= T.tahun + 0.6 + i * 0.35;
        const last = i === 3;
        return (
          <div key={r} style={{ position: "relative", marginTop: 12, height: 44, opacity: on ? 1 : 0 }}>
            <div style={{ ...pixLabel, fontSize: 38, fontWeight: 700, color: last ? (den ? (blink ? C.ivory : GREEN) : t >= T.yugo ? "#FF8A80" : C.ivory) : C.ivory }}>{last && den ? "DENMARK" : r}</div>
            {last && !den && strike > 0 ? <div style={{ position: "absolute", left: -6, top: 16, height: 8, width: `${strike * 104}%`, background: RED }} /> : null}
          </div>
        );
      })}
      </> : null}
      {/* scanlines + roll bar */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 4px, rgba(0,0,0,0) 4px 8px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, height: 60, top: ((t * 90) % 420) - 60, background: "rgba(200,220,255,0.06)" }} />
    </div>
  );
};
const Calendar: React.FC<{ t: number }> = ({ t }) => {
  const c = ROOM.CAL;
  const ring = clamp((t - T.mei31) / 0.35);
  return (
    <div style={{ position: "absolute", left: c.x * PX, top: c.y * PX, width: c.w * PX, height: c.h * PX, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...pixLabel, fontSize: 42, color: C.ivory, marginTop: 10 }}>MEI 1992</div>
      <div style={{ position: "relative", marginTop: 34, fontFamily: FONT.display, fontSize: 120, color: "#2A1A16", lineHeight: 1 }}>
        31
        {ring > 0 ? (
          <div style={{ position: "absolute", left: -26, top: -14, width: 160, height: 150, borderRadius: "50%", border: `8px solid ${RED}`, transform: `scale(${0.6 + 0.4 * ring}) rotate(-8deg)`, opacity: ring }} />
        ) : null}
      </div>
    </div>
  );
};
const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const set = ROOM_SET();
  const b2 = t >= CUT.B2;
  const cam = b2
    ? camAt(t, [{ t: CUT.B2, x: 400, y: -600, z: 40 }, { t: T.hari10, x: 438, y: -630, z: 230, e: ease.cameraSoft }, { t: CUT.C1, x: 450, y: -640, z: 330 }], 7)
    : camAt(t, [{ t: CUT.B1, x: -70, y: 30, z: -30 }, { t: T.yugo, x: -40, y: 0, z: 150, e: ease.cameraSoft }, { t: T.pengganti, x: 20, y: 0, z: 230 }, { t: CUT.B2, x: 70, y: -10, z: 260 }], 5);
  const lights = roomLights(t);
  const opts = { ambient: 0.1, exposure: 1.1, dither: 0.45 };
  const S = ROOM.SCREEN;
  return (
    <CinematicCamera cam={{ ...cam, focus: 1000, aperture: 6 }}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={ROOM.LAMP.x} y={ROOM.LAMP.y - 5} r={18} color="#FFC27A" intensity={0.55} squash={0.8} />
        <Calendar t={t} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <TvScreen t={t} />
        <Glow x={S.x + S.w / 2} y={S.y + S.h / 2} r={46} color="#9FC4FF" intensity={0.28 + 0.2 * win(t, T.denmark, T.denmark + 0.7, 0.05, 0.6)} squash={0.9} />
      </Layer>
      <Layer z={620} maxBlur={12}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.08, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const RoomHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={T.tahun + 0.05} b={T.dicoret} top={236}>
      <Chip text="TAHUN 1992" color={C.gold} size={52} />
    </Pop>
    <Pop t={t} a={T.pbb} b={T.denmark - 0.1} top={236}>
      <NameCard name="SANKSI PBB" role="PERANG YUGOSLAVIA · DICORET" />
    </Pop>
    <Pop t={t} a={T.denmark} b={CUT.B2} top={236}>
      <Chip text="DENMARK MASUK" color={GREEN} border={GREEN} size={52} />
    </Pop>
    <Pop t={t} a={T.runnerUp} b={CUT.B2} top={350}>
      <Chip text="RUNNER-UP GRUP 4 KUALIFIKASI" size={40} />
    </Pop>
    <Stamp t={t} a={T.hari10} text="10 HARI" sub="SEBELUM KICK-OFF" top={250} color={C.gold} />
    <Pop t={t} a={T.turnamen} b={CUT.C1} top={590}>
      <Chip text="SWEDIA · 10–26 JUNI · 8 TIM" size={40} border={C.gold} />
    </Pop>
  </>
);

// ================================================================= C PITCH (three game levels)
const pitchLights: LitLight[] = [
  { kind: "point", x: 108, y: -40, r: 300, i: 1.45, color: "#FFE2B0" },
  { kind: "point", x: -40, y: 60, r: 140, i: 0.25, color: "#CFE0FF" },
];
type Level = { at: number; opp: keyof typeof TEAM; ball: (t: number) => { x: number; y: number }; attack: 1 | -1 };
const level = (t: number): Level =>
  t < CUT.C2
    ? { at: CUT.C1, opp: "ENG", attack: 1, ball: (u) => ({ x: 67 + 34 * Math.sin((u - CUT.C1) * 0.85), y: 170 - Math.abs(Math.sin(u * 4.2)) * 4 }) }
    : t < CUT.C3
      ? {
          at: CUT.C2,
          opp: "SWE",
          attack: -1,
          ball: (u) => {
            if (u < T.nolsatu - 0.3) return { x: lerp(70, 10, seg(u, CUT.C2, T.nolsatu - 0.3)), y: 172 - Math.abs(Math.sin(u * 5)) * 4 };
            if (u < T.nolsatu + 0.2) { const k = seg(u, T.nolsatu - 0.3, T.nolsatu + 0.2); return { x: lerp(10, PITCH.GOAL_L, k), y: lerp(172, 160, k) - Math.sin(k * Math.PI) * 10 }; }
            if (u < T.kesempatan) return { x: PITCH.GOAL_L + 2, y: 176 };
            return { x: 67 + 6 * Math.sin(u * 2), y: 172 };
          },
        }
      : {
          at: CUT.C3,
          opp: "FRA",
          attack: 1,
          ball: (u) => {
            if (u < T.duasatu - 0.35) return { x: lerp(60, 128, seg(u, CUT.C3, T.duasatu - 0.35)), y: 172 - Math.abs(Math.sin(u * 5)) * 4 };
            if (u < T.duasatu + 0.15) { const k = seg(u, T.duasatu - 0.35, T.duasatu + 0.15); return { x: lerp(128, PITCH.GOAL_R, k), y: lerp(172, 158, k) - Math.sin(k * Math.PI) * 10 }; }
            return { x: PITCH.GOAL_R - 2, y: 176 };
          },
        };
const PitchScene: React.FC<{ t: number }> = ({ t }) => {
  const set = PITCH_SET();
  const spr = SPR();
  const L = level(t);
  const ball = L.ball(t);
  const ballPrev = L.ball(t - 0.1);
  const dir = ball.x >= ballPrev.x ? 1 : -1;
  // the camera trucks after the ball, late and smooth (a few frames behind)
  const lag = L.ball(t - 0.25);
  const sh = shake(t, T.nolsatu, 22).x + shake(t, T.duasatu, 26).x;
  const cam = camAt(t, [{ t: L.at, z: 70 }, { t: L.at + 3, z: 90 }], 11);
  const camX = clamp((lag.x - 67) * PX * 0.85, -560, 560);
  const cs: CameraState = { ...cam, x: cam.x + camX + sh, y: cam.y - 30, aperture: 5 };
  const ambient = 0.3;
  const opts = { ambient, exposure: 1.05, dither: 0.4 };
  const oppPal = TEAM[L.opp];
  const players = [
    { pal: TEAM.DEN, x: ball.x - 16 * L.attack, y: 162, ph: 0 },
    { pal: TEAM.DEN, x: ball.x + 22 * L.attack, y: 178, ph: 1 },
    { pal: oppPal, x: ball.x + 7 * L.attack, y: 172, ph: 1 },
    { pal: oppPal, x: ball.x - 30 * L.attack, y: 154, ph: 0 },
  ].sort((a, b) => a.y - b.y);
  const coachOn = t < T.laga + 1.5;
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={pitchLights} opts={opts} />
        <Glow x={108} y={0} r={26} color="#FFD08A" intensity={0.7} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={pitchLights} opts={opts} />
        <div style={{ ...pixLabel, position: "absolute", left: 32 * PX, top: PITCH.BOARD_Y * PX + 6, fontSize: 30, color: C.ivory }}>EURO 1992 · SWEDIA</div>
        {players.map((p, i) => (
          <Lit key={i} s={spr[runPose(t, p.ph)]} pal={p.pal} x={p.x} y={p.y} lights={pitchLights} ambient={ambient} flip={dir < 0} rim={false} />
        ))}
        <Lit s={spr.ball} pal={TEAM.DEN} x={ball.x} y={ball.y} lights={pitchLights} ambient={ambient} rim={false} />
        {coachOn ? <Lit s={spr.stand} pal={TEAM.COACH} x={camX / PX + 14} y={196} lights={pitchLights} ambient={ambient} rim={false} /> : null}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={pitchLights} opts={{ ambient: 0.22, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const PitchHud: React.FC<{ t: number }> = ({ t }) => {
  const life = t < T.nolsatu ? 1 : t < T.duasatu ? lerp(1, 0.3, seg(t, T.nolsatu, T.nolsatu + 0.6)) : lerp(0.3, 1, seg(t, T.duasatu + 0.2, T.duasatu + 1.0));
  const glitch = win(t, T.nolsatu, T.nolsatu + 0.35, 0.02, 0.15);
  return (
    <>
      <Pop t={t} a={T.nielsen} b={T.laga - 0.05} top={236}>
        <NameCard name="RICHARD MØLLER NIELSEN" role="PELATIH DENMARK · NYARIS TANPA PERSIAPAN" />
      </Pop>
      {t >= T.laga && t < CUT.C2 ? <LevelBanner t={t} a={T.laga} level={1} home="DENMARK" away="INGGRIS" score="0–0" scoreAt={T.nolnol} /> : null}
      {t >= CUT.C2 && t < CUT.C3 ? <LevelBanner t={t} a={CUT.C2} level={2} home="DENMARK" away="SWEDIA" score="0–1" scoreAt={T.nolsatu} /> : null}
      {t >= CUT.C3 ? <LevelBanner t={t} a={CUT.C3} level={3} home="DENMARK" away="PRANCIS" score="2–1" scoreAt={T.duasatu} /> : null}
      {t >= T.laga ? <LifeBar t={t} v={life} /> : null}
      <Pop t={t} a={T.nolsatu + 0.05} b={T.kesempatan} top={480}>
        <Chip text="TUAN RUMAH SWEDIA" size={40} border={"#F2C230"} />
      </Pop>
      <Pop t={t} a={T.kesempatan} b={CUT.C3} top={480}>
        <Chip text="WAJIB MENANG" color={C.gold} size={52} border={C.gold} />
      </Pop>
      <Pop t={t} a={T.lolos} b={CUT.D} top={480}>
        <Chip text="LOLOS · SEMIFINAL" color={GREEN} border={GREEN} size={48} />
      </Pop>
      {glitch > 0.01 ? (
        <div style={{ position: "absolute", inset: 0, opacity: glitch }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: hash(i * 17 + Math.floor(t * 30)) * 1800, height: 16 + hash(i * 5) * 40, background: i % 2 ? rgba(RED, 0.55) : rgba(C.ink, 0.7), transform: `translateX(${(hash(i + Math.floor(t * 30)) - 0.5) * 80}px)` }} />
          ))}
        </div>
      ) : null}
    </>
  );
};

// ================================================================= D / E2 GOAL (night)
const goalLights = (boost = 1): LitLight[] => [
  { kind: "cone", x: -8, y: 6, r: 170, i: 1.7 * boost, angle: Math.atan2(150 - 6, 67 + 8), spread: 0.42, color: "#FFD9A0" },
  { kind: "cone", x: 142, y: 6, r: 170, i: 0.5 * boost, angle: Math.atan2(150 - 6, 67 - 142), spread: 0.4, color: "#CFE0FF" },
  { kind: "point", x: 67, y: 200, r: 50, i: 0.25, color: "#FFE2B0" },
];
type Shot = { kickAt: number; arrive: number; to: { x: number; y: number }; from: { x: number; y: number }; save?: boolean };
const ballOnShot = (t: number, s: Shot) => {
  if (t < s.kickAt) return { ...s.from, scale: PX * 1.4 };
  if (t < s.arrive) {
    const k = (t - s.kickAt) / (s.arrive - s.kickAt);
    return { x: lerp(s.from.x, s.to.x, k), y: lerp(s.from.y, s.to.y, k) - Math.sin(k * Math.PI) * 6, scale: PX * lerp(1.4, 0.75, k) };
  }
  if (s.save) {
    const k = clamp((t - s.arrive) / 0.5);
    return { x: lerp(s.to.x, s.to.x + 30, k), y: lerp(s.to.y, s.to.y - 40, k) + k * k * 30, scale: PX * 0.75 };
  }
  return { x: s.to.x, y: s.to.y + clamp((t - s.arrive) / 0.3) * 14, scale: PX * 0.75 };
};
const GoalScene: React.FC<{ t: number; final?: boolean }> = ({ t, final = false }) => {
  const set = final ? FINAL_GOAL_SET() : GOAL_SET();
  const spr = SPR();
  const lights = goalLights(final ? 1.1 : 1);
  const ambient = 0.08;
  const opts = { ambient, exposure: 1.12, dither: 0.45 };
  const spot = { x: GOAL.SPOT.x, y: GOAL.SPOT.y };
  // shots: the semifinal save; the final's two goals
  const shots: Shot[] = final
    ? [
        { kickAt: T.jensen + 0.05, arrive: T.jensen + 0.5, from: { x: 44, y: 210 }, to: { x: 36, y: 118 } },
        { kickAt: T.duanol - 0.36, arrive: T.duanol, from: spot, to: { x: 100, y: 158 } },
      ]
    : [{ kickAt: T.menepis - 0.3, arrive: T.menepis + 0.02, from: spot, to: { x: 95, y: 146 }, save: true }];
  const shot = shots.filter((s) => t >= s.kickAt - 1.2).pop() ?? shots[0];
  const ball = ballOnShot(t, shot);
  const ballVisible = final ? t >= shot.kickAt - 1.2 && t < shot.arrive + 0.9 : t >= T.adu + 0.5;
  // keeper: sways on the line; dives toward the ball (semifinal) or the wrong way (final, 2nd goal) / late (1st)
  const diveAt = final ? shot.kickAt + 0.06 : T.menepis - 0.26;
  const diveDir = final ? (shot.to.x < 67 ? -1 : -1) : 1;
  const diving = t >= diveAt && t < diveAt + 1.6;
  const dk = clamp((t - diveAt) / 0.32);
  const keeperX = diving ? lerp(67, 67 + diveDir * 20, dk) : 67 + Math.sin(t * 2.4) * 4;
  const keeperY = diving ? lerp(GOAL.BOT, 152, Math.sin(dk * Math.PI * 0.5)) + (dk >= 1 ? clamp((t - diveAt - 0.32) / 0.3) * 14 : 0) : GOAL.BOT;
  // the taker (or Vilfort) from behind: walks up, kicks
  const takerOn = final ? t >= T.vilfort - 0.2 && t < T.duanol + 0.8 : t >= T.adu;
  const takerKick = shot.kickAt;
  const takerX = final ? lerp(20, spot.x - 6, seg(t, T.vilfort, takerKick)) : lerp(52, spot.x - 6, seg(t, takerKick - 0.55, takerKick));
  const feet = spot.y + 6;
  const takerY = final ? lerp(feet + 6, feet, seg(t, T.vilfort, takerKick)) : t < T.satu ? lerp(feet + 40, feet + 8, seg(t, T.adu, T.adu + 1.0)) : lerp(feet + 8, feet, seg(t, takerKick - 0.55, takerKick));
  const takerPose: Pose = t >= takerKick - 0.04 && t < takerKick + 0.4 ? "kick" : (final ? t < takerKick : t > takerKick - 0.55 && t < takerKick) ? runPose(t) : "stand";
  const goals = final ? [shots[0].arrive, shots[1].arrive] : [T.menepis];
  const sh = goals.reduce((a, g) => ({ x: a.x + shake(t, g, final ? 26 : 30).x, y: a.y + shake(t, g, final ? 26 : 30).y }), { x: 0, y: 0 });
  const cam = final
    ? camAt(t, [{ t: CUT.E2, z: 40, y: -40 }, { t: T.jensen + 0.5, x: -170, z: 270, y: -60, e: ease.cameraSoft }, { t: T.menit78, x: -40, z: 200 }, { t: T.vilfort + 0.6, x: -120, z: 170 }, { t: T.mengunci, x: -60, z: 280, y: -10, e: ease.cameraSoft }, { t: CUT.E3, x: -30, z: 250, y: -30 }], 13)
    : camAt(t, [{ t: CUT.D, z: -40, y: -50 }, { t: T.adu, z: 90, y: -20, e: ease.cameraSoft }, { t: T.satu, z: 150 }, { t: T.menepis - 0.3, x: 110, z: 290, y: -40, e: ease.cameraSoft }, { t: T.menepis + 0.8, x: 170, z: 270, y: -30 }, { t: CUT.E1, x: 110, z: 220, y: -20 }], 9);
  // lifted ~290 px so goal, keeper and taker sit above the caption band
  const cs: CameraState = { ...cam, x: cam.x + sh.x, y: cam.y + 290 + sh.y, aperture: 6 };
  const keeperPal = final ? TEAM.KEEP_GER : TEAM.KEEP_DEN;
  const takerPal = final ? TEAM.DEN : TEAM.NED;
  const ballFirst = ball.y > keeperY; // ball in front of the keeper when lower on screen
  const ballEl = ballVisible ? <SpriteView sprite={spr.ball} pal={TEAM.DEN} anchor={{ x: 2, y: 2 }} x={ball.x} y={ball.y} scale={ball.scale} lights={spriteLightsAt(lights, ball.x, ball.y)} gain={spriteGainAt(lights, ball.x, ball.y, ambient)} /> : null;
  const keeperEl = diving ? (
    <Lit s={spr.dive} pal={keeperPal} x={keeperX} y={keeperY} lights={lights} ambient={ambient} flip={diveDir < 0} anchor={{ x: 16, y: 7 }} scale={PX * 1.6} />
  ) : (
    <Lit s={spr.keeper} pal={keeperPal} x={keeperX} y={keeperY} lights={lights} ambient={ambient} scale={PX * 1.6} />
  );
  return (
    <CinematicCamera cam={cs}>
      <Layer z={1500} maxBlur={5}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={-8} y={8} r={30} color="#FFD9A0" intensity={0.95} squash={0.7} />
        <Glow x={142} y={8} r={22} color="#CFE0FF" intensity={0.4} squash={0.7} />
        <div style={{ ...pixLabel, position: "absolute", left: -20 * PX, top: 110 * PX, fontSize: 30, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>{"AUDIRA        AUDIRA        AUDIRA        AUDIRA"}</div>
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.mid} lights={lights} opts={opts} />
        <LightShaft id="g1" x={-8} y={6} angle={Math.atan2(150 - 6, 67 + 8)} length={190} spread={0.18} color="#FFE2B0" intensity={0.16} />
        <Glow x={keeperX} y={GOAL.BOT - 16} r={26} color="#FFE2B0" intensity={0.32} squash={0.8} />
        {ballFirst ? null : ballEl}
        {keeperEl}
        {ballFirst ? ballEl : null}
        {takerOn ? <Lit s={spr[takerPose]} pal={takerPal} x={takerX} y={takerY} lights={lights} ambient={ambient} scale={PX * 1.5} /> : null}
      </Layer>
      <Layer z={640} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};
const PenaltyBoard: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  if (t < a) return null;
  const k = clamp((t - a) / 0.3);
  const row = (name: string, marks: boolean[]) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ ...pixLabel, fontSize: 32, color: C.ivory, width: 210 }}>{name}</div>
      {marks.map((m, i) => (
        <div key={i} style={{ width: 40, height: 40, background: m ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center", ...pixLabel, fontSize: 30, color: C.ink }}>{m ? "" : "X"}</div>
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
      <div style={{ background: rgba(C.ink, 0.86), border: `6px solid ${C.ivoryDim}`, padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {row("DENMARK", [true, true, true, true, true])}
        {row("BELANDA", [true, true, true, true, false])}
      </div>
    </div>
  );
};
const PenaltyHud: React.FC<{ t: number }> = ({ t }) => {
  const hb = t > T.satu && t < T.menepis - 0.2 ? 0.25 + 0.2 * Math.max(0, Math.sin((t - T.satu) * Math.PI * 2.4)) ** 8 : 0;
  return (
    <>
      {hb > 0 ? <Vignette strength={hb + 0.5} /> : null}
      <Pop t={t} a={CUT.D + 0.1} b={T.adu - 0.05} top={236}>
        <Chip text={t >= T.duadua ? "SEMIFINAL · DENMARK 2–2 BELANDA" : "SEMIFINAL · LAWAN BELANDA"} size={40} border={"#E8742A"} />
      </Pop>
      <Pop t={t} a={T.perpanjangan} b={T.adu - 0.05} top={400}>
        <Chip text="PERPANJANGAN WAKTU · 120'" size={40} color={C.gold} border={C.gold} />
      </Pop>
      <Pop t={t} a={T.adu} b={T.kiper - 0.1} top={236}>
        <Chip text="ADU PENALTI" size={64} color={C.gold} border={C.gold} />
      </Pop>
      <Pop t={t} a={T.satu} b={T.kiper - 0.1} top={380}>
        <Chip text="SATU MELESET = TAMAT" size={40} />
      </Pop>
      <Pop t={t} a={T.schmeichel - 0.1} b={T.limaempat - 0.1} top={236} left={60} origin="0% 50%">
        <NameCard name="PETER SCHMEICHEL" role="KIPER DENMARK" />
      </Pop>
      <Pop t={t} a={T.vanBasten} b={T.limaempat - 0.1} top={440} left={60} origin="0% 50%">
        <NameCard name="MARCO VAN BASTEN" role="BELANDA · DITEPIS" accent={"#E8742A"} />
      </Pop>
      <Stamp t={t} a={T.limaempat} text="5–4" sub="DENMARK KE FINAL" top={300} />
      <PenaltyBoard t={t} a={T.limaempat + 0.25} />
    </>
  );
};

// ================================================================= E1 / E3 / OUT (final stadium)
const FinalPlayers: React.FC<{ t: number }> = ({ t }) => {
  const spr = SPR();
  const lights: LitLight[] = [{ kind: "point", x: 67, y: 160, r: 60, i: 1.0, color: "#FFE2B0" }];
  const ps = [
    { pal: TEAM.DEN, x0: 30, y: 154, sp: 9, ph: 0 },
    { pal: TEAM.GER, x0: 52, y: 160, sp: 8, ph: 1 },
    { pal: TEAM.DEN, x0: 88, y: 165, sp: -7, ph: 1 },
    { pal: TEAM.GER, x0: 108, y: 157, sp: -9, ph: 0 },
  ];
  const u = t - CUT.E1;
  return (
    <>
      {/* night haze over the far stands: the crowd falls back, the pitch comes forward */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70 * PX, height: 70 * PX, background: "linear-gradient(180deg, rgba(255,226,176,0) 0%, rgba(255,226,176,0.16) 55%, rgba(255,226,176,0.05) 100%)" }} />
      <Glow x={67} y={150} r={40} color="#FFE2B0" intensity={0.35} squash={0.5} />
      {ps.map((p, i) => {
        const x = p.x0 + Math.sin(u * 0.5 + i) * 10 + p.sp * Math.sin(u * 0.3);
        return <Lit key={i} s={spr[runPose(t, p.ph)]} pal={p.pal} x={x} y={p.y} lights={lights} ambient={0.2} flip={Math.cos(u * 0.5 + i) < 0} />;
      })}
      <Lit s={spr.ball} pal={TEAM.DEN} x={67 + Math.sin(u * 0.5 + 0.5) * 10} y={162} lights={lights} ambient={0.2} rim={false} />
    </>
  );
};
const FinalIntroScene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t, [{ t: CUT.E1, y: -820, z: -80 }, { t: T.penonton + 0.6, y: 40, z: -10, e: ease.cameraSoft }, { t: CUT.E2, y: 90, z: 60 }], 15, COVER_CAM);
  return <StadiumShot cam={cam} hero={false} confettiT={-1} mg={<FinalPlayers t={t} />} boost={1.05} />;
};
const FinalIntroHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pop t={t} a={T.final + 0.02} b={CUT.E2} top={236}>
      <div style={{ background: rgba(C.ink, 0.86), border: `6px solid ${C.gold}`, padding: "16px 34px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.display, fontSize: 130, color: C.gold, lineHeight: 0.95 }}>FINAL</div>
        <div style={{ ...pixLabel, fontSize: 40, color: C.ivory, marginTop: 8 }}>26 JUNI 1992</div>
      </div>
    </Pop>
    <Pop t={t} a={T.goteborg} b={CUT.E2} top={540}>
      <Chip text="NYA ULLEVI · GÖTEBORG" size={40} />
    </Pop>
    {t >= T.penonton ? (
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18 }}>
        <div style={{ background: rgba(C.ink, 0.86), border: `6px solid ${RED}`, padding: "12px 24px", display: "flex", alignItems: "baseline", gap: 18 }}>
          <CounterDots t={t} />
          <div style={{ ...pixLabel, fontSize: 44, color: C.ivory }}>PENONTON</div>
        </div>
      </div>
    ) : null}
    <Pop t={t} a={T.jerman} b={CUT.E2} top={800}>
      <Chip text="DENMARK vs JERMAN" size={46} color={C.gold} border={C.gold} />
    </Pop>
  </>
);
/** 37.800 counted up, with an Indonesian thousands dot. */
const CounterDots: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.penonton, T.penonton + 1.1);
  const v = Math.round(37800 * k);
  return <div style={{ fontFamily: FONT.display, fontSize: 84, color: C.gold, lineHeight: 0.9 }}>{v.toLocaleString("id-ID")}</div>;
};
const FinalGoalsHud: React.FC<{ t: number }> = ({ t }) => {
  const g1 = T.jensen + 0.5;
  return (
    <>
      {t < T.duanol ? <Scoreboard t={t} den={t >= g1 ? 1 : 0} ger={0} flashAt={g1} top={440} /> : null}
      <Pop t={t} a={T.menit18} b={T.menit78 - 0.05} top={236} left={60} origin="0% 50%">
        <NameCard name="18' JOHN JENSEN" role="GOL PEMBUKA" />
      </Pop>
      <Pop t={t} a={T.menit78} b={T.mengunci} top={236} left={60} origin="0% 50%">
        <NameCard name={t >= T.vilfort ? "78' KIM VILFORT" : "78'"} role="MENGUNCI GELAR" />
      </Pop>
      <Pop t={t} a={T.putri} b={T.mengunci} top={600}>
        <div style={{ background: rgba(C.ink, 0.88), border: `6px solid ${C.ivoryDim}`, padding: "16px 24px", maxWidth: 860, textAlign: "center", ...pixLabel, whiteSpace: "normal", fontSize: 40, lineHeight: 1.3, color: C.ivory }}>
          SEMPAT PULANG MENEMANI PUTRINYA YANG SAKIT, LALU KEMBALI
        </div>
      </Pop>
      <Stamp t={t} a={T.duanol} text="2–0" sub="DENMARK MENGUNCI FINAL" top={236} color={C.gold} rot={0} />
    </>
  );
};
const LiftScene: React.FC<{ t: number }> = ({ t }) => {
  const out = t >= CUT.OUT;
  const cam = out
    ? camAt(t, [{ t: CUT.OUT, z: 0, y: 0 }, { t: T.menurutmu, z: -90, y: -40, e: ease.cameraSoft }, { t: 86.8, z: -170, y: -90 }], 17, COVER_CAM)
    : camAt(t, [{ t: CUT.E3, z: 300, y: -60 }, { t: CUT.OUT, z: 0, y: 0, e: ease.cameraSoft }], 19, COVER_CAM);
  const boost = 1.15 + 0.25 * win(t, T.juaraEropa, T.juaraEropa + 0.8, 0.05, 0.7);
  return <StadiumShot cam={cam} confettiT={t - CUT.E3} boost={boost} />;
};
const LiftHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t < CUT.OUT ? <Stamp t={t} a={T.juaraEropa} text="JUARA EROPA" sub="1992 · DARI TIDAK LOLOS" top={250} color={C.gold} /> : null}
    {t >= CUT.OUT ? (
      <Pop t={t} a={CUT.OUT + 0.1} top={236}>
        <div style={{ background: "#0B0A10", border: `8px solid ${C.gold}`, boxShadow: `0 0 0 6px ${C.ink}, 0 0 40px ${rgba(C.amber, 0.45)}`, padding: "18px 30px 22px", textAlign: "center" }}>
          <div style={{ ...pixLabel, fontSize: 40, color: C.gold, fontWeight: 700 }}>AUDIRA</div>
          <div style={{ height: 4, background: rgba(C.gold, 0.5), margin: "14px 0" }} />
          <div style={{ ...pixLabel, fontSize: 36, color: C.ivory }}>FINAL 1992</div>
          <div style={{ fontFamily: FONT.display, fontSize: 104, color: C.ivory, lineHeight: 1, marginTop: 10 }}>
            DENMARK <span style={{ color: C.gold }}>2–0</span> JERMAN
          </div>
        </div>
      </Pop>
    ) : null}
    <Pop t={t} a={T.menurutmu} top={650}>
      <Chip text="ADA KUDA HITAM YANG LEBIH GILA?" size={46} border={C.gold} />
    </Pop>
    <Pop t={t} a={T.tulis} top={840}>
      <Chip text="TULIS DI KOMENTAR · IKUTI AUDIRA" size={40} color={GREEN} border={GREEN} />
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
  const flash = 0.3 * win(t, 0.05, 0.4, 0.03, 0.3) + 0.24 * win(t, T.duanol, T.duanol + 0.22, 0.02, 0.18) + 0.15 * win(t, T.jensen + 0.5, T.jensen + 0.7, 0.02, 0.15) + 0.12 * win(t, T.menepis, T.menepis + 0.2, 0.02, 0.15);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0A0D12 0%, #120D12 55%, #0D0809 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {sc === "A" && <HookScene t={t} />}
        {(sc === "B1" || sc === "B2") && <RoomScene t={t} />}
        {(sc === "C1" || sc === "C2" || sc === "C3") && <PitchScene t={t} />}
        {sc === "D" && <GoalScene t={t} />}
        {sc === "E1" && <FinalIntroScene t={t} />}
        {sc === "E2" && <GoalScene t={t} final />}
        {(sc === "E3" || sc === "OUT") && <LiftScene t={t} />}
        <Grade />
        {/* subject pool: a warm key on the centre of interest, the frame edges fall away (depth: subject separation) */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 34% 24% at 50% 47%, rgba(255,226,176,0.22) 0%, rgba(255,226,176,0.08) 55%, rgba(255,226,176,0) 100%)", mixBlendMode: "screen", pointerEvents: "none" }} />
        <Vignette strength={0.88} cy="47%" />
        <Grain frame={Math.floor(t * 60)} />
        <Exposure color="#FFF4DC" amount={flash} blend="screen" />
        {sc === "A" && <HookHud t={t} />}
        {(sc === "B1" || sc === "B2") && <RoomHud t={t} />}
        {(sc === "C1" || sc === "C2" || sc === "C3") && <PitchHud t={t} />}
        {sc === "D" && <PenaltyHud t={t} />}
        {sc === "E1" && <FinalIntroHud t={t} />}
        {sc === "E2" && <FinalGoalsHud t={t} />}
        {(sc === "E3" || sc === "OUT") && <LiftHud t={t} />}
        <Wipe t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
