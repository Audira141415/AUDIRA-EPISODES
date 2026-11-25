// EP12 shots G to L.
import React from "react";
import { CinematicCamera, Layer } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { PX } from "../../kits/pixelstory/pixel/views.tsx";
import { HERO, KEY0, RIVAL, POSE, mixPose, stride } from "./sprites.ts";
import { corridor, hall, locker, ramp } from "./sets.ts";
import { Beam, Bits, Fig, FgHeads, FgRail, Pool, Rel, Rink, Sk, burst, camAt, confetti, falling, shake, spray, streaks, type Bit } from "./stage.tsx";
import { Chip, GREEN, Pop, RED, Stamp } from "./hud.tsx";
import { CUT, OUTRO_AT, T, clamp, lerp, seg } from "./timing.ts";
import { BLAZE, DAWN, GOLDRUN, MAGENTA, TURQ } from "./themes.ts";
import { LINES, Px, once, type Shot } from "./shotsA.tsx";

// ---------------------------------------------------------------- G locker room strategy
const LOCK = once(locker);
const LK_OVER = { wood: ramp("#3c1c0c", "#8c4c1c", "#d08a3c", "#ffd08c"), woodDark: ramp("#180a04", "#3c1c0c", "#70381a", "#b8703c"), amberLamp: ramp("#a85c10", "#ffb83c", "#ffe898", "#fffdf0"), metal: ramp("#2c2420", "#6c5c50", "#b8a490", "#fff0dc") };
const ov = (a: number, rx = 20, ry = 14): [number, number] => [69 + Math.cos(a) * rx, 92 + Math.sin(a) * ry];
export const G: Shot = {
  scene: ({ t }) => {
    const { back } = LOCK();
    const cam = camAt(t, [{ t: CUT.G, x: 60, y: -10, z: -20, roll: 0.8 }, { t: T.pelatih, x: -40, y: 10, z: 110, roll: 0 }, { t: T.tetap, x: 0, y: 0, z: 190, roll: -0.6 }, { t: T.hindari, x: 30, y: -20, z: 190, roll: 0.4 }, { t: T.tunggu, x: -10, y: 20, z: 180, roll: 0 }, { t: CUT.H, x: -30, y: 10, z: 170, roll: -1 }], 39);
    const sp = t * 1.1, crash = seg(t, T.hindari, T.hindari + 0.4), wait = seg(t, T.tetap, T.tetap + 1.2);
    const trail: Bit[] = [];
    for (let i = 0; i < 90; i++) { const [x, y] = ov((i / 90) * Math.PI * 2); trail.push([x, y, [70, 90, 120], 0.9, 1]); const [x2, y2] = ov((i / 90) * Math.PI * 2, 16, 7); trail.push([x2, y2, [150, 170, 190], 0.6, 1]); }
    const dots = [0, 1, 2, 3].map((i) => {
      const [x, y] = ov(sp + 0.5 + i * 0.42 - (i > 1 ? 0.22 * crash : 0) + (i < 2 ? 0.12 * crash : 0), 20.5, 11);
      const [ox, oy] = [(x - 67) / 20.5, (y - 92) / 11];
      return { x: x + ox * crash * (3 + i * 1.4), y: y + oy * crash * (2 + i), c: ["#e0681a", "#cf2a34", "#2f6bd0", "#8089a2"][i] };
    });
    const [hx, hy] = ov(sp - 0.28 - 0.75 * wait, 20.5, 11);
    const talk = Math.abs(Math.sin(t * 5));
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={1400} maxBlur={2}><Rel a={back} id="lock" amb={0.5} over={LK_OVER} lights={[{ kind: "point", x: 67, y: 10, r: 110, i: 0.75 }, { kind: "point", x: 14, y: 10, r: 60, i: 0.4 }, { kind: "point", x: 120, y: 10, r: 60, i: 0.4 }]} /></Layer>
          <Layer z={1080}>
            <Px x={31} y={64} w={72} h={56} c="#3c1c0c" /><Px x={33} y={66} w={68} h={52} c="#f4f0e4" /><Px x={33} y={66} w={68} h={3} c="#ffffff" /><Px x={33} y={114} w={68} h={4} c="#cfc4ac" />
            <Px x={46} y={120} w={3} h={34} c="#70381a" /><Px x={85} y={120} w={3} h={34} c="#70381a" />
            <Bits b={trail} />
            {dots.map((d, i) => <React.Fragment key={i}><Px x={d.x - 2.5} y={d.y - 2.5} w={5} h={5} c="#1c1410" /><Px x={d.x - 2} y={d.y - 2} w={4} h={4} c={d.c} /></React.Fragment>)}
            {crash > 0.5 ? <Bits b={burst(t, T.hindari + 0.2, dots[2].x, dots[2].y, 30, 0.35, [[208, 42, 48], [255, 160, 60]], 1.2)} /> : null}
            <Px x={hx - 4} y={hy - 4} w={8} h={8} c="#06341c" /><Px x={hx - 3} y={hy - 3} w={6} h={6} c={GREEN} /><Px x={hx - 3} y={hy - 3} w={6} h={2} c="#FFD75A" />
          </Layer>
          <Layer z={1000}>
            <Fig o={{ back: true, arms: "hips", breathe: Math.sin(t * 2) }} u={0.94} x={21} y={160} k={{ ...KEY0, amb: 0.3, dir: [0.3, -0.9, -0.1], rimDir: [1, -1], rim: "#FFD08C", rimAmt: 1 }} />
            <Fig o={{ suit: "black", trim: "gold", hat: "black", back: true, coat: true, arms: t > T.pelatih ? "point" : "down", breathe: talk }} u={0.94} x={t > T.pelatih ? 113 : 115} y={160} k={{ ...KEY0, amb: 0.34, dir: [-0.3, -0.9, -0.1], rimDir: [-1, -1], rim: "#FFD08C", rimAmt: 1 }} />
          </Layer>
        </CinematicCamera>
        <Beam x={540} w={900} c="#FFCF80" o={0.3} />
        <Pool x={540} y={900} rx={860} ry={1000} c="#70503a" k={0.8} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.kalah - 0.1} b={T.strategi} top={300}><Chip text="KALAH CEPAT" color="#FF8C6A" size={60} /></Pop>
      <Pop t={t} a={T.tetap - 0.1} b={T.hindari - 0.1} top={300}><Chip text="1. TETAP DI BELAKANG" color="#FFD75A" border={GREEN} size={54} /></Pop>
      <Pop t={t} a={T.hindari - 0.1} b={T.tunggu - 0.1} top={300}><Chip text="2. HINDARI TABRAKAN" color="#FFD75A" border={GREEN} size={54} /></Pop>
      <Pop t={t} a={T.tunggu - 0.1} b={CUT.H} top={300}><Chip text="3. TUNGGU" color="#FFD75A" border={GREEN} size={72} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- H semi-final, running left
export const H: Shot = {
  scene: ({ t }) => {
    const t0 = T.jatuhSemi - 0.1, sh = shake(t, t0 + 0.4, 26, 0.4);
    const cam = camAt(t, [{ t: CUT.H, x: 40, y: 50, z: 90, roll: 2 }, { t: t0, x: -10, y: 50, z: 150, roll: 3 }, { t: t0 + 0.5, x: -50, y: 60, z: 250, roll: 1 }, { t: CUT.I1, x: 20, y: 60, z: 170, roll: 2.4 }], 48);
    const scroll = -155 * t, dodge = seg(t, t0 + 0.1, t0 + 0.8);
    const foes = [
      { kit: RIVAL.orange, x: 62, y: 142, u: 0.98, at: 0, f: true }, { kit: RIVAL.blue, x: 38, y: 137, u: 0.92, at: 0.22, f: true }, { kit: RIVAL.white, x: 12, y: 132, u: 0.84, at: 9, f: false },
    ].map((f) => {
      const F = falling(stride(t * 1.2 + f.x * 0.01, true), t, t0 + f.at), k = seg(t, t0 + f.at, t0 + f.at + 1), aw = seg(t, t0 + 0.8, t0 + 1.9);
      return { ...f, F, X: f.x + 3 * Math.sin(t * 2 + f.x) + (f.f ? 10 * k + 130 * aw : -8 * k), Y: f.y - (f.f ? 10 * k : 0) };
    });
    const hx = lerp(104, 92, seg(t, CUT.H, t0)) - 22 * dodge, hy = 156 + 2 * dodge;
    return (
      <>
        <Rink th={MAGENTA} cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} scroll={scroll} t={t} stands={{ seed: 52, crowd: 0.92, cheer: 1 }} flash={0.6} floor={{ lines: LINES, traces: 0.4, pools: [{ x: 80, y: 150, r: 60, i: 0.2 }] }}>
          <Bits b={streaks(t, 84, 130, 1, 12)} />
          {foes.slice().reverse().map((f, i) => <Sk key={i} p={f.F.p} kit={f.kit} u={f.u} x={f.X} y={f.Y - f.F.lift * f.u} sh={f.Y} flip k={MAGENTA.key} refl={0.28} />)}
          <Bits b={foes.flatMap((f, i) => [...spray(t, f.X + 26, f.Y, 1, 12, 0.8, i + 2), ...burst(t, t0 + f.at + 0.4, f.X, f.Y, 50, 0.9)])} />
          <Sk p={mixPose(stride(t * 1.2, true), POSE.tuck, dodge * (1 - seg(t, t0 + 1, t0 + 1.5)) * 0.8)} kit={HERO} u={1.18} x={hx} y={hy} flip k={MAGENTA.key} />
          <Bits b={spray(t, hx + 46, hy - 2, 1, 26, 1.1, 7)} />
        </Rink>
        <FgRail c="#180428" hi="rgba(255,180,240,0.8)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={CUT.H + 0.25} b={T.lolosLagi - 0.1} top={300}><Chip text="SEMIFINAL" color="#FFD75A" size={72} /></Pop>
      <Stamp t={t} a={T.lolosLagi - 0.05} text="LOLOS LAGI" top={290} color={GREEN} />
    </>
  ),
};

// ---------------------------------------------------------------- I1 the gap
export const I1: Shot = {
  scene: ({ t }) => {
    const cam = camAt(t, [{ t: CUT.I1, x: 120, y: -90, z: 180, roll: -2.4 }, { t: T.lima + 0.5, x: 30, y: -20, z: 90, roll: -1 }, { t: T.tertinggal, x: -40, y: 80, z: 150, roll: 0.4 }, { t: CUT.I2, x: -10, y: 20, z: -30, roll: -1.6 }], 51);
    const gap = seg(t, CUT.I1, T.meter15);
    const hx = lerp(40, 30, gap), hy = 157;
    const foes = [{ kit: RIVAL.orange, x: 84, y: 124 }, { kit: RIVAL.white, x: 98, y: 117 }, { kit: RIVAL.red, x: 111, y: 112 }, { kit: RIVAL.blue, x: 124, y: 108 }].map((f, i) => ({ ...f, u: 0.62 - i * 0.04, X: f.x + 2.5 * Math.sin(t * 2 + i) + 3 * gap - 3, Y: f.y - 2 * gap }));
    const m = seg(t, T.meter15 - 0.3, T.meter15 + 0.4);
    const ax = hx + 40, ay = 150, bx = foes[0].X - 14, by = foes[0].Y;
    return (
      <>
        <Rink th={TURQ} cam={cam} scroll={165 * t} t={t} hor={34} boards={[76, 92]} stands={{ seed: 61, crowd: 0.95, top: 22, bot: 92 }} flash={0.4} floor={{ lines: [{ v: 0.06, w: 0.008, c: [220, 60, 70], bend: 0.02 }, { v: 0.62, w: 0.014, c: [30, 110, 200], bend: 0.05 }], traces: 0.5, pools: [{ x: 50, y: 150, r: 70, i: 0.12 }] }}>
          <Bits b={streaks(t, 94, 140, -1, 12)} />
          {foes.slice().reverse().map((f, i) => <Sk key={i} p={stride(t * 1.2 + i * 0.22, true)} kit={f.kit} u={f.u} x={f.X} y={f.Y} k={TURQ.key} refl={0.2} />)}
          <Bits b={foes.flatMap((f, i) => spray(t, f.X - 18, f.Y, -1, 8, 0.5, i + 2))} />
          {m > 0 ? Array.from({ length: 13 }, (_, i) => {
            const k = i / 12;
            if (k > m) return null;
            const s = lerp(1.5, 0.8, k);
            return <React.Fragment key={i}><Px x={lerp(ax, bx, k) - 2 * s} y={lerp(ay, by, k) - s} w={4 * s} h={2 * s} c={i % 2 ? "#FFD75A" : "#D02A30"} style={{ boxShadow: "0 0 0 3px rgba(4,30,34,0.85)" }} /></React.Fragment>;
          }) : null}
          <Sk p={stride(t * 1.15)} kit={HERO} u={1.2} x={hx} y={hy} k={TURQ.key} />
          <Bits b={spray(t, hx - 46, hy - 2, -1, 26, 1, 1)} />
        </Rink>
        <FgRail c="#063c44" hi="rgba(255,255,255,0.9)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={CUT.I1 + 0.2} b={T.meter15 - 0.25} top={300}><Chip text="FINAL" sub={t > T.lima - 0.1 ? "5 PEMAIN" : undefined} color="#FFD75A" size={76} /></Pop>
      <Pop t={t} a={T.meter15 - 0.2} b={CUT.I2} top={300}><Chip text="± 15 METER" color="#FFD75A" size={84} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- I2 the pile-up
const I2_F = [
  { kit: RIVAL.blue, x: 100, y: 146, u: 1.06, at: 0.28, tx: 112, ty: 140, end: POSE.slide },
  { kit: RIVAL.red, x: 72, y: 151, u: 1.1, at: 0.06, tx: 84, ty: 150, end: POSE.prone },
  { kit: RIVAL.white, x: 44, y: 143, u: 1.0, at: 1.0, tx: 58, ty: 136, end: POSE.slide },
  { kit: RIVAL.orange, x: 16, y: 148, u: 1.04, at: 1.35, tx: 34, ty: 146, end: POSE.fall },
];
export const I2: Shot = {
  scene: ({ t }) => {
    const s0 = T.senggol, hit = T.pembatas, sh = shake(t, s0, 22, 0.35), sh2 = shake(t, hit, 46, 0.6), sh3 = shake(t, T.seret + 0.5, 20, 0.35);
    const cam = camAt(t, [{ t: CUT.I2, x: -60, y: 50, z: 10, roll: -3 }, { t: s0 - 0.1, x: 60, y: 40, z: 110, roll: -4.5 }, { t: s0 + 0.16, x: 120, y: 60, z: 320, roll: -2 }, { t: T.seret, x: 20, y: 40, z: 110, roll: -1 }, { t: hit, x: 10, y: 50, z: 210, roll: 1.6 }, { t: CUT.I3, x: -70, y: 40, z: 60, roll: 0 }], 57);
    const brake = seg(t, T.seret, hit), scroll = 165 * t - 165 * Math.max(0, t - hit) * 0.75 - 30 * brake;
    const fs = I2_F.map((f, i) => {
      const t0 = s0 + f.at, F = falling(stride(t * 1.25 + i * 0.2, true), t, t0, f.end), k = seg(t, t0, hit + 0.1);
      const bump = i < 2 ? (i ? 7 : -7) * Math.max(0, 1 - Math.abs(t - s0) / 0.2) : 0;
      return { ...f, F, t0, X: lerp(f.x + 2 * Math.sin(t * 2.2 + i * 2), f.tx, k) + bump - 10 * seg(t, hit, CUT.I3), Y: lerp(f.y, f.ty, k) };
    });
    const h = seg(t, hit - 0.25, CUT.I3);
    const spin = (i: number, b: number) => b * 10 * Math.sin(i + t * 3);
    return (
      <>
        <Rink th={BLAZE} cam={{ ...cam, x: cam.x + sh.x + sh2.x + sh3.x, y: cam.y + sh.y + sh2.y + sh3.y }} scroll={scroll} t={t} boards={[84, 116]} seg={26} hor={72} stands={{ seed: 71, crowd: 0.96, cheer: 1, bot: 116 }} flash={0.9} floor={{ lines: LINES, traces: 0.5, pools: [{ x: 80, y: 140, r: 60, i: 0.16 }] }}>
          <Bits b={streaks(t, 88, 136, -1, t < hit ? 14 : 4)} />
          {[2, 3, 0, 1].map((i) => {
            const f = fs[i], p = t > hit ? { ...f.F.p, rot: f.F.p.rot + spin(i, Math.exp(-(t - hit) * 3)) } : f.F.p;
            return <Sk key={i} p={p} kit={f.kit} u={f.u} x={f.X} y={f.Y - f.F.lift * f.u} sh={f.Y} k={BLAZE.key} refl={0.28} />;
          })}
          <Bits b={[...fs.flatMap((f, i) => [...(t < f.t0 ? spray(t, f.X - 32, f.Y, -1, 12, 0.8, i + 2) : t < hit + 0.3 ? spray(t, f.X + 4, f.Y, 1, 18, 1.2, i + 12) : []), ...burst(t, f.t0 + 0.42, f.X, f.Y, 60, 1)]), ...burst(t, s0, 90, 112, 50, 0.8, [[255, 255, 255], [255, 220, 90]], 0.7), ...burst(t, hit, 96, 120, 140, 1.4, [[255, 255, 255], [255, 232, 170], [255, 190, 90]], 1.4)]} />
          {h > 0 ? <><Sk p={stride(t * 1.1, false)} kit={HERO} u={1.14} x={lerp(-64, 24, h)} y={158} k={BLAZE.key} /><Bits b={spray(t, lerp(-110, -20, h), 156, -1, 20, 1, 8)} /></> : null}
        </Rink>
        <FgRail c="#380c04" hi="rgba(255,236,170,0.85)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.tikungan - 0.2} b={T.ohno - 0.1} top={300}><Chip text="TIKUNGAN TERAKHIR" color="#FFD75A" size={56} /></Pop>
      <Pop t={t} a={T.ohno - 0.05} b={T.jatuhFinal - 0.1} top={300}><Chip text="OHNO × LI" color="#FFD75A" size={76} /></Pop>
      <Stamp t={t} a={T.jatuhFinal - 0.05} text="4 JATUH" top={284} color="#FFF4A4" />
    </>
  ),
};

// ---------------------------------------------------------------- I3 alone over the line
export const I3: Shot = {
  scene: ({ t }) => {
    const g = T.garis - 0.35, fin = seg(t, g - 0.3, g + 0.35), sh = shake(t, g, 14, 0.3);
    const cam = camAt(t, [{ t: CUT.I3, x: -60, y: 60, z: 260, roll: -2 }, { t: g - 0.3, x: 10, y: 60, z: 200, roll: -1 }, { t: g + 0.4, x: 0, y: 0, z: -120, roll: 0 }, { t: CUT.J + 0.1, x: 0, y: 4, z: -60, roll: 0.6 }], 61);
    const hu = lerp(1.16, 0.84, fin), hx = lerp(34, 64, fin), line = 64 + (g - t) * 150;
    return (
      <>
        <Rink th={GOLDRUN} cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} scroll={150 * t} t={t} stands={{ seed: 81, crowd: 0.97, cheer: 1 }} flash={1} floor={{ lines: [{ v: 0.1, w: 0.012, c: [30, 140, 80], bend: 0.03 }], traces: 0.3, pools: [{ x: 64, y: 150, r: 70, i: 0.16 }] }}>
          {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: (line + i * 5) * PX, top: 118 * PX, width: 2.6 * PX, height: 120 * PX, background: i ? "#14301c" : "#D02A30", transform: "skewX(-16deg)" }} />)}
          <Bits b={streaks(t, 84, 132, -1, 14)} />
          <Sk p={mixPose(stride(t * 1.2), POSE.raise, fin)} kit={HERO} u={hu} x={hx} y={156} k={GOLDRUN.key} />
          <Bits b={[...spray(t, hx - 46 * hu, 154, -1, 26, 1.1, 3), ...confetti(t, g - 0.2, ["#1CB468", "#FFD75A", "#FFFFFF", "#F48428"], 120), ...burst(t, g, 64, 156, 80, 1.2)]} />
        </Rink>
        <FgRail c="#2c1c04" hi="rgba(255,244,180,0.9)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => <Pop t={t} a={T.garis - 0.35} b={CUT.J + 1} top={284}><Chip text="FINIS" color={GREEN} border="#FFD75A" size={72} /></Pop>,
};

// ---------------------------------------------------------------- J podium
const HALL = once(hall);
const HL_OVER = {
  sky: ramp("#1c0408", "#5c0c18", "#a41c28", "#e85048"), book1: ramp("#3c0810", "#8c1420", "#d83038", "#ff8c78"), plaster: ramp("#2c1414", "#744040", "#c48c80", "#fff0dc"), teal: ramp("#1c1030", "#443068", "#8064a8", "#c8b0e8"),
  stone: ramp("#1c0608", "#480e14", "#802028", "#c04c48"), frame: ramp("#2c2c38", "#6c6c80", "#b8b8c8", "#ffffff"), ivoryLit: ramp("#8c6c28", "#e0b048", "#fff0a8", "#ffffff"), metal: ramp("#2c1808", "#7c5018", "#d8a038", "#ffe898"), leaf: ramp("#1a0d0a", "#6a4232", "#c08a68", "#f0c8a4"),
};
export const J: Shot = {
  scene: ({ t }) => {
    const { back, pod } = HALL();
    const cam = camAt(t, [{ t: CUT.J, x: 0, y: 130, z: 150, roll: 0 }, { t: T.pertama, x: -20, y: 20, z: 60, roll: 0.4 }, { t: T.selatan, x: 20, y: 20, z: 170, roll: -0.4 }, { t: CUT.K, x: 0, y: 0, z: 40, roll: 0 }], 63);
    const b = Math.sin(t * 2.2), up = t > CUT.J + 1.1 && t < T.australia + 0.6;
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={1500} maxBlur={3}><Rel a={back} id="hall" amb={0.62} over={HL_OVER} lights={[{ kind: "point", x: 67, y: 80, r: 120, i: 0.5 }]} /></Layer>
          <Layer z={1000}>
            <Rel a={pod} id="pod" amb={0.95} over={HL_OVER} />
            <Fig o={{ suit: "blue", trim: "white", hat: "white", arms: "down", breathe: b }} u={0.62} x={13} y={177} k={KEY0} />
            <Fig o={{ suit: "white", trim: "red", hat: "red", arms: "down", breathe: -b }} u={0.62} x={121} y={185} k={KEY0} />
            <Fig o={{ arms: up ? "up" : "medal", medal: true, breathe: b }} u={0.82} x={67} y={160 - (up ? 1.5 * Math.abs(Math.sin(t * 6)) : 0)} k={{ ...KEY0, amb: 0.4, rim: "#FFE9A0", rimAmt: 1 }} />
            <Bits b={confetti(t, CUT.J - 0.5, ["#FFD75A", "#FFFFFF", "#3FD077"], 80)} />
          </Layer>
          <Layer z={680} maxBlur={3}><FgHeads t={t} cheer c="#14040a" rim="rgba(255,210,120,0.7)" y={1560} /></Layer>
        </CinematicCamera>
        <Beam x={540 + 50 * Math.sin(t)} w={760} c="#FFE9A0" o={0.42} />
        <Beam x={200} w={420} c="#FFB060" o={0.2} rot={-14} /><Beam x={880} w={420} c="#FFB060" o={0.2} rot={14} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.pertama - 0.2} b={T.selatan - 0.4} top={280}><Chip text="EMAS PERTAMA" sub={t > T.australia - 0.1 ? "AUSTRALIA" : undefined} color="#FFD75A" border="#FFD75A" size={76} /></Pop>
      <Pop t={t} a={T.selatan - 0.4} b={CUT.K} top={280}><Chip text="PERTAMA DI" sub="BUMI SELATAN" color="#5CE08C" border={GREEN} size={76} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- K ten years of dawn practice
export const K: Shot = {
  scene: ({ t }) => {
    const cam = camAt(t, [{ t: CUT.K, x: -60, y: 80, z: 190, roll: 1.4 }, { t: T.menit, x: 30, y: 60, z: 110, roll: 0 }, { t: T.sepuluh, x: -20, y: 70, z: 230, roll: -1.6 }, { t: CUT.L, x: 40, y: 40, z: 60, roll: -0.4 }], 67);
    const k = clamp((t - CUT.K) / (CUT.L - CUT.K)), push = seg(t, T.sepuluh - 0.2, T.kerja + 0.4);
    const scroll = 120 * t + 40 * push * (t - T.sepuluh);
    return (
      <>
        <Rink th={DAWN} cam={cam} scroll={scroll} t={t} stands={{ seed: 91, crowd: 0, windows: true }} text="LATIHAN AUDIRA" floor={{ lines: [{ v: 0.1, w: 0.012, c: [190, 110, 130], bend: 0.03 }], traces: lerp(0.06, 0.95, push * 0.7 + k * 0.3), pools: [{ x: 110, y: 140, r: 60, i: 0.2 }] }}>
          <Bits b={streaks(t, 88, 132, -1, 8)} />
          {push > 0 ? [2, 1].map((i) => <Sk key={i} p={stride(t * 1.1 - i * 0.12)} kit={HERO} u={1.2} x={40 - i * 30 * push} y={157 - i * 4} k={DAWN.key} refl={0} opacity={(0.3 - i * 0.08) * push} />) : null}
          <Sk p={stride(t * 1.1)} kit={HERO} u={1.22} x={34 + 8 * Math.sin(t * 0.8)} y={157} k={DAWN.key} />
          <Bits b={spray(t, -14, 155, -1, 28, 1.1, 2)} />
        </Rink>
        <Beam x={900} w={620} c="#FFE0A0" o={0.42} rot={26} /><Beam x={560} w={420} c="#FFD0A0" o={0.3} rot={24} />
        <FgRail c="#3c1c34" hi="rgba(255,236,200,0.9)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.setengah - 0.1} b={T.sepuluh - 0.15} top={300}>
        <div style={{ position: "relative" }}><Chip text="1,5 MENIT" color="#F4F0E4" size={76} /><div style={{ position: "absolute", left: 20, top: "48%", height: 12, width: `${92 * seg(t, T.menit + 0.35, T.menit + 0.7)}%`, background: RED }} /></div>
      </Pop>
      <Stamp t={t} a={T.sepuluh - 0.1} text="10 TAHUN" sub={t > T.kerja - 0.1 ? "KERJA KERAS" : undefined} top={280} />
    </>
  ),
};

// ---------------------------------------------------------------- L two doors
const CORR = once(corridor);
const CR_OVER = { sky: ramp("#04161c", "#0c3440", "#1c5c6c", "#4c9cac"), stone: ramp("#061418", "#10343c", "#1c5460", "#488c98"), metal: ramp("#081c22", "#244c58", "#6c98a0", "#d0f0f4") };
export const L: Shot = {
  scene: ({ t }) => {
    const a = CORR();
    const cam = camAt(t, [{ t: CUT.L, x: 0, y: 60, z: 160, roll: 0.6 }, { t: T.beruntung, x: -60, y: 20, z: 70, roll: 0.8 }, { t: T.pantas + 0.2, x: 60, y: 20, z: 90, roll: -0.8 }, { t: T.tulis + 0.5, x: 10, y: 20, z: 60, roll: 0 }, { t: OUTRO_AT + 1, x: 0, y: 40, z: 230, roll: 0 }], 73);
    const l = seg(t, T.beruntung - 0.3, T.beruntung + 0.2), r = seg(t, T.pantas - 0.3, T.pantas + 0.2);
    const door = (cx: number, o: number, c1: string, c2: string) => (
      <>
        <Px x={cx - 20} y={51} w={40} h={99} c={`linear-gradient(180deg, ${c1}, ${c2})`} o={0.25 + 0.75 * o} />
        <div style={{ position: "absolute", left: (cx - 46) * PX, top: 30 * PX, width: 92 * PX, height: 140 * PX, background: `radial-gradient(ellipse, ${c2} 0%, rgba(0,0,0,0) 66%)`, opacity: 0.12 + 0.5 * o * (0.9 + 0.1 * Math.sin(t * 5)), mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", left: (cx - 24) * PX, top: 150 * PX, width: 48 * PX, height: 60 * PX, background: `linear-gradient(180deg, ${c2}, rgba(0,0,0,0))`, clipPath: "polygon(8% 0, 92% 0, 120% 100%, -20% 100%)", opacity: 0.15 + 0.45 * o, mixBlendMode: "screen" }} />
      </>
    );
    const lean = t < T.pantas - 0.2 ? -7 * l : lerp(-7, 8, r);
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={1200}>
            <Rel a={a} id="corr" amb={0.75} over={CR_OVER} />
            {door(32, l, "#fff8d8", "#ffc04c")}
            {door(102, r, "#e8ffe8", "#3fd077")}
          </Layer>
          <Layer z={1000}>
            <Bits b={Array.from({ length: 40 }, (_, i) => [((i * 37) % 150) - 8 + 4 * Math.sin(t + i), 160 - ((t * (5 + (i % 5) * 2) + i * 23) % 130), i % 2 ? [255, 214, 130] : [140, 255, 190], 0.25 + 0.35 * Math.abs(Math.sin(t + i)), 1] as Bit)} />
            <Fig o={{ back: true, arms: "hips", breathe: Math.sin(t * 2) }} u={0.98} x={67 + lean} y={160 - Math.abs(Math.sin(t * 2.6)) * 0.8} k={{ ...KEY0, amb: 0.22, key: 0.6, dir: [t > T.pantas ? 0.6 : -0.6, -0.5, -0.1], rimDir: [t > T.pantas ? 1 : -1, -0.6], rim: t > T.pantas ? "#8CFFB4" : "#FFD070", rimAmt: 1 }} />
          </Layer>
        </CinematicCamera>
        <Pool x={540} y={900} rx={900} ry={1050} c="#3c646c" k={0.7} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.beruntung - 0.1} top={300} left={48}><Chip text="BERUNTUNG?" color="#FFD75A" border="#FFC04C" size={48} /></Pop>
      <Pop t={t} a={T.pantas - 0.1} top={300} left={640}><Chip text="PANTAS?" color={GREEN} border={GREEN} size={48} /></Pop>
    </>
  ),
};
