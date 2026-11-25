// EP12 shots A to F.
import React from "react";
import { CinematicCamera, Layer } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { PX } from "../../kits/pixelstory/pixel/views.tsx";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { HERO, KEY0, RIVAL, POSE, mixPose, patient, stride } from "./sprites.ts";
import { VERT, hospital, mountains, ramp, xray } from "./sets.ts";
import { Beam, Bits, Caps, Fig, FgRail, Pool, Rel, Rink, Sk, burst, camAt, confetti, falling, shake, snow, spray, streaks, type Bit } from "./stage.tsx";
import { Chip, GREEN, LifeBar, NameCard, Pop, RED, Stamp } from "./hud.tsx";
import { CUT, T, clamp, lerp, seg } from "./timing.ts";
import { CRIMSON, GOLDBLACK, NAVY, ROYAL, VIOLETNIGHT } from "./themes.ts";

export type Shot = { scene: React.FC<{ t: number }>; hud: React.FC<{ t: number }> };
type RGB = [number, number, number];
const RED3: RGB = [220, 60, 70], BLU3: RGB = [40, 90, 200];
export const LINES = [{ v: 0.1, w: 0.012, c: RED3, bend: 0.03 }, { v: 0.56, w: 0.018, c: BLU3, bend: 0.05 }];
/** Pixel block in art px. */
export const Px: React.FC<{ x: number; y: number; w: number; h: number; c: string; o?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, c, o = 1, children, style }) => (
  <div style={{ position: "absolute", left: x * PX, top: y * PX, width: w * PX, height: h * PX, background: c, opacity: o, ...style }}>{children}</div>
);
export const once = <V,>(f: () => V) => {
  let v: V | undefined;
  return () => (v ??= f());
};
const fr = (v: number) => v - Math.floor(v);

// ---------------------------------------------------------------- A hook: last place, then everyone falls
const A_FOES = [
  { kit: RIVAL.orange, x: 80, y: 139, u: 0.92, at: 0.02, dx: -8 },
  { kit: RIVAL.white, x: 96, y: 134, u: 0.86, at: 0.3, dx: 2 },
  { kit: RIVAL.red, x: 111, y: 130, u: 0.8, at: 0.5, dx: 6 },
  { kit: RIVAL.blue, x: 126, y: 127, u: 0.76, at: 0.16, dx: 4 },
];
export const A: Shot = {
  scene: ({ t }) => {
    const hit = T.jatuh + 0.28, sh = shake(t, hit, 26, 0.45), sh2 = shake(t, T.lalu + 0.2, 16, 0.3);
    const fin = seg(t, T.dia - 0.1, T.juara + 0.3);
    const cam = camAt(t, [
      { t: 0, x: 20, y: 70, z: 130, roll: -2 }, { t: T.lalu, x: 0, y: 30, z: 60, roll: -3 }, { t: hit, x: 40, y: 10, z: 150, roll: -1 },
      { t: T.dia, x: 10, y: 10, z: 40, roll: 0.6 }, { t: T.juara + 0.2, x: 0, y: 0, z: -40, roll: 0 }, { t: CUT.B, x: -6, y: 10, z: 70, roll: 1 },
    ], 3);
    const scroll = 150 * t + 26 * Math.min(t, 1.7);
    const hx = lerp(47, 51, seg(t, 0, 1.6)) + 2 * seg(t, 2.6, 3.6) + 18 * fin, hy = 157 - 1 * fin, hu = lerp(1.14, 0.7, fin);
    const win = seg(t, T.juara - 0.35, T.juara + 0.2);
    const hp = mixPose(stride(t * 1.15 + 0.2, t < T.jatuh + 0.5), POSE.raise, win);
    const foes = A_FOES.map((f) => {
      const t0 = T.lalu + f.at, k = clamp((t - t0) / 1.4), away = seg(t, hit + 0.6, hit + 1.6);
      const F = falling(stride(t * 1.2 + f.x * 0.013, true), t, t0, f.at === 0.3 ? POSE.prone : POSE.slide);
      const x = f.x + 3 * Math.sin(t * 2.2 + f.x) + f.dx * k - 170 * away, y = f.y - (f.y - 128) * k * 0.5;
      return { f, F, x, y };
    });
    return (
      <>
        <Rink th={NAVY} cam={{ ...cam, x: cam.x + sh.x + sh2.x, y: cam.y + sh.y + sh2.y }} scroll={scroll} t={t} stands={{ seed: 3, crowd: 0.9, cheer: 1 }} flash={0.4 + 0.5 * seg(t, T.lalu, T.jatuh)}
          floor={{ lines: LINES, traces: 0.35, pools: [{ x: 60, y: 150, r: 70, i: 0.3 }] }}>
          <Bits b={streaks(t, 90, 128, -1, 12)} />
          {foes.slice().reverse().map(({ f, F, x, y }, i) => (
            <Sk key={i} p={F.p} kit={f.kit} u={f.u} x={x} y={y - F.lift * f.u} sh={y} k={NAVY.key} refl={0.28} />
          ))}
          <Bits b={[...foes.flatMap(({ f, x, y }, i) => [...(t < T.lalu + f.at ? spray(t, x - 26, y, -1, 10, 0.7, i + 3) : t < hit + 1 ? spray(t, x + 8, y, 1, 18, 1.1, i + 9) : []), ...burst(t, T.lalu + f.at + 0.45, x + 6, y, 46, 0.8)]), ...burst(t, hit, 104, 124, 90, 1.15)]} />
          <Sk p={hp} kit={HERO} u={hu} x={hx} y={hy} k={NAVY.key} />
          <Bits b={[...spray(t, hx - 40 * hu, hy - 2, -1, 26, 1.1, 1), ...(win > 0 ? confetti(t, T.juara - 0.2, ["#FFD75A", "#3FD077", "#FFFFFF"], 90) : [])]} />
        </Rink>
        <FgRail y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={0.1} b={T.lalu - 0.05} top={300}><Chip text="PALING BELAKANG" color="#FFD75A" size={56} /></Pop>
      {t < T.juara ? <Stamp t={t} a={T.lalu + 0.35} text="TERAKHIR" sub="BERDIRI" top={284} /> : <Stamp t={t} a={T.juara} text="JUARA" sub="OLIMPIADE" top={284} color={GREEN} />}
    </>
  ),
};

// ---------------------------------------------------------------- B introduction: start line in the dark
export const B: Shot = {
  scene: ({ t }) => {
    const go = T.dibayar + 0.15, dt = Math.max(0, t - go);
    const cam = camAt(t, [{ t: CUT.B, x: -60, y: 20, z: 120, roll: 0.6 }, { t: T.bradbury + 0.4, x: -10, y: 6, z: 10, roll: 0 }, { t: go - 0.3, x: 20, y: 70, z: 210, roll: -0.8 }, { t: go + 0.4, x: 70, y: 70, z: 260, roll: -2.4 }, { t: CUT.C1, x: -40, y: 80, z: 330, roll: -1 }], 8);
    const crouch = seg(t, T.bradbury + 0.7, T.bradbury + 2), run = seg(t, go, go + 0.35);
    let p = mixPose(POSE.stand, POSE.start, crouch);
    p = { ...p, torso: p.torso + 2 * Math.sin(t * 2.4) };
    p = mixPose(p, stride(dt * 1.5), run);
    const scroll = 8 * (t - CUT.B) + 60 * dt * dt * (dt < 1 ? 1 : 0) + (dt >= 1 ? 60 + 130 * (dt - 1) : 0);
    const foes = [{ kit: RIVAL.violet, x: 98, y: 134, u: 0.66 }, { kit: RIVAL.white, x: 20, y: 130, u: 0.62 }];
    return (
      <>
        <Rink th={GOLDBLACK} cam={cam} scroll={scroll} t={t} stands={{ seed: 8, crowd: 0.75 }} flash={0.5} floor={{ lines: [{ v: 0.1, w: 0.012, c: [200, 130, 40], bend: 0.03 }], traces: 0.2, pools: [{ x: 62, y: 152, r: 46, i: 0.5 }] }}>
          {foes.map((f, i) => (
            <Sk key={i} p={mixPose(mixPose(POSE.stand, POSE.start, crouch), stride(dt * 1.4 + i * 0.3), run)} kit={f.kit} u={f.u} x={f.x + (i ? -26 : 26) * run * dt * 0.4} y={f.y} k={{ ...GOLDBLACK.key, amb: 0.1, key: 0.34 }} refl={0.18} />
          ))}
          <Sk p={p} kit={HERO} u={lerp(0.84, 1.1, crouch)} x={60 - 4 * run} y={156} k={GOLDBLACK.key} />
          <Bits b={[...snow(t * 0.3, 34).map((b) => [b[0], b[1], [255, 214, 130], b[3] * 0.5, 1] as Bit), ...burst(t, go, 28, 156, 50, 0.9, [[255, 230, 170], [255, 190, 90]]), ...(run > 0 ? spray(t, 22, 154, -1, 26, 1, 4) : [])]} />
        </Rink>
        <Beam x={300 + 70 * Math.sin(t * 0.7)} w={620} c="#FFD27A" o={0.34} rot={-12} />
        <Beam x={800 - 60 * Math.sin(t * 0.6)} w={560} c="#FFE6A8" o={0.26} rot={12} />
        <Pool x={540} y={1000} rx={820} ry={1000} c="#6a5432" />
        <FgRail c="#0c0804" hi="rgba(255,205,110,0.75)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.steven - 0.1} b={T.dibayar + 0.3} top={284}><NameCard name="STEVEN BRADBURY" role="SKATING LINTASAN PENDEK · AUSTRALIA" accent="#3FD077" /></Pop>
      <Pop t={t} a={T.mahal - 0.1} b={CUT.C1} top={300}><Chip text="DIBAYAR MAHAL" color="#FF8C6A" size={64} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- C1 the blade, Montreal
export const C1: Shot = {
  scene: ({ t }) => {
    const hit = T.menembus, t0 = hit - 0.62, sh = shake(t, hit, 34, 0.6);
    const cam = camAt(t, [{ t: CUT.C1, x: 60, y: 60, z: 60, roll: 2 }, { t: t0, x: 10, y: 50, z: 120, roll: 0.4 }, { t: hit, x: 10, y: 60, z: 180, roll: -3 }, { t: CUT.C2, x: -20, y: 40, z: 170, roll: -4.4 }], 12);
    const slow = Math.max(0, t - hit);
    const scroll = 140 * Math.min(t, hit) + 34 * slow;
    const fk = seg(t, t0, hit);
    const vF = falling(stride(t * 1.1 + 0.4, true), t < hit ? t : hit + slow * 0.45, t0, POSE.fall);
    const vx = lerp(112, 100, fk) + 10 * slow, vy = 151;
    const hF = falling(stride(t * 1.15, false), hit + slow * 0.6 - (t < hit ? 9 : 0), hit + 0.06, POSE.prone);
    const hx = lerp(22, 30, fk) - 6 * slow;
    return (
      <>
        <Rink th={CRIMSON} cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} scroll={scroll} t={t} stands={{ seed: 21, crowd: 0.82 }} flash={0.35} floor={{ lines: LINES, traces: 0.4, pools: [{ x: 60, y: 150, r: 60, i: 0.28 }] }}>
          <Bits b={streaks(t, 84, 132, -1, t < hit ? 14 : 4)} />
          <Sk p={hF.p} kit={HERO} u={1.16} x={hx} y={156 - hF.lift * 0.8} sh={156} k={CRIMSON.key} />
          <Sk p={vF.p} kit={RIVAL.violet} u={1.06} x={vx} y={vy - vF.lift} sh={vy} flip={t > t0 + 0.2} k={CRIMSON.key} />
          <Bits b={[...spray(t, hx - 46, 154, -1, 20, t < hit ? 1 : 0.4, 2), ...spray(t, vx - 10, vy, t > t0 ? 1 : -1, 18, 1, 6), ...burst(t, t0 + 0.3, vx, vy, 50, 0.9), ...burst(t, hit, 56, 112, 110, 1.2, [[255, 255, 255], [255, 224, 200], [255, 180, 150]], 1.3)]} />
        </Rink>
        <Pool x={500} y={980} rx={900} ry={1050} c="#8a4450" k={0.8} />
        <FgRail c="#20040c" hi="rgba(255,190,170,0.7)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => <Pop t={t} a={T.montreal - 0.1} b={CUT.C2} top={300}><Chip text="MONTREAL" color="#FFD75A" size={64} /></Pop>,
};

// ---------------------------------------------------------------- C2 hospital
const HOSP = once(hospital);
const HOSP_OVER = {
  sky: ramp("#3c8c7c", "#7cc8b4", "#b8ecd8", "#ecfff6"), teal: ramp("#1c6c64", "#3c9c8c", "#74ccb8", "#b4f0dc"), ivoryLit: ramp("#6c9c94", "#b4d8d0", "#eefcf6", "#ffffff"),
  metal: ramp("#2c4c50", "#5c8488", "#a0c4c4", "#e8fcfa"), stone: ramp("#1c5450", "#3c807a", "#78b4aa", "#b8e4d8"), book1: ramp("#8c1c24", "#d03a40", "#f0605c", "#ffb0a8"),
};
export const C2: Shot = {
  scene: ({ t }) => {
    const { back, bed } = HOSP();
    const cam = camAt(t, [{ t: CUT.C2, x: -70, y: -20, z: 60, roll: 0.8 }, { t: T.liter + 0.2, x: -10, y: 30, z: 170, roll: 0 }, { t: T.jahitan - 0.2, x: -62, y: 30, z: 100, roll: -0.8 }, { t: CUT.D1, x: -50, y: 20, z: 160, roll: -1.4 }], 15);
    const st = clamp((t - T.jahitan + 0.35) / 0.7), n = Math.floor(st * 9);
    const beat = fr(t * 1.1), breathe = Math.sin(t * 2.2);
    const ecg: Bit[] = Array.from({ length: 40 }, (_, i) => {
      const ph = fr(t * 0.55 - i / 60), y = ph > 0.5 && ph < 0.54 ? -9 : ph >= 0.54 && ph < 0.58 ? 5 : 0;
      return [-2 + i * 0.75, 66 + y, [90, 255, 150], 1 - 0.5 * (i / 40), 1] as Bit;
    });
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={1500} maxBlur={3}>
            <Rel a={back} id="hosp" amb={0.86} over={HOSP_OVER} lights={[{ kind: "point", x: 102, y: 44, r: 90, i: 0.35 }]} />
          </Layer>
          <Layer z={1120} maxBlur={2}>
            <Px x={-6} y={50} w={40} h={30} c="#20383c" /><Px x={-4} y={52} w={36} h={26} c="#06201a" />
            <Px x={12} y={80} w={3} h={70} c="#5c8488" />
            <Bits b={ecg} />
            <Fig o={{ suit: "coat", trim: "sheet", hat: "coat", coat: true, arms: t > T.jahitan - 0.6 ? "point" : "hips", breathe: breathe * 0.6 }} u={0.74} x={102 - 8 * seg(t, T.jahitan - 0.8, T.jahitan)} y={150} k={{ ...KEY0, amb: 0.46, rim: "#E8FFF6" }} />
          </Layer>
          <Layer z={1000}>
            <Rel a={bed} id="bed" amb={0.92} over={HOSP_OVER} />
            <Caps caps={patient()} u={1.04} x={60} y={130 - 0.4 * breathe} k={{ ...KEY0, amb: 0.48, rim: "#F0FFF8" }} />
            {Array.from({ length: n }, (_, i) => {
              const k = i / 8, x = 66 + k * 20, y = 109 - k * 9;
              return <React.Fragment key={i}><Px x={Math.round(x)} y={Math.round(y) - 2} w={1} h={5} c="#5a1a1e" /><Px x={Math.round(x)} y={Math.round(y) - 2} w={1} h={1} c="#1e0a0c" /></React.Fragment>;
            })}
            {n > 0 ? <Px x={64} y={109} w={1 + n * 2.4} h={1} c="#8a2a30" style={{ transform: "rotate(-24deg)", transformOrigin: "0 50%" }} /> : null}
          </Layer>
          <Layer z={780} maxBlur={4}>
            <Px x={6} y={20} w={2} h={150} c="#6c9ca0" /><Px x={0} y={20} w={14} h={2} c="#b8dcdc" />
            <Px x={-1} y={24} w={8} h={16} c="rgba(200,60,64,0.85)" /><Px x={-1} y={24} w={8} h={3 + 9 * clamp((t - CUT.C2) / 3.6)} c="rgba(236,255,250,0.85)" />
            <Px x={2.5} y={41 + 40 * beat} w={1.4} h={3} c="#d04a50" /><Px x={2.8} y={40} w={0.6} h={74} c="rgba(220,255,250,0.6)" />
          </Layer>
        </CinematicCamera>
        <Beam x={860} w={760} c="#F0FFE8" o={0.28} rot={14} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      {t < T.jahitan - 0.25 ? <LifeBar t={t} v={lerp(1, 0.2, seg(t, CUT.C2 + 0.4, T.liter + 0.5))} top={290} label="DARAH" /> : null}
      <Pop t={t} a={T.liter - 0.1} b={T.jahitan - 0.25} top={370}><Chip text="-4 LITER" color="#FF6A5C" size={84} /></Pop>
      <Pop t={t} a={T.jahitan - 0.2} b={CUT.D1} top={300}><Chip text={`${Math.round(111 * clamp((t - T.jahitan + 0.2) / 0.5))} JAHITAN`} color="#FFD75A" size={84} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- D1 training crash
export const D1: Shot = {
  scene: ({ t }) => {
    const hit = T.hantam, sh = shake(t, hit, 44, 0.6), left = Math.max(0, hit - t), after = Math.max(0, t - hit);
    const cam = camAt(t, [{ t: CUT.D1, x: -50, y: 60, z: 40, roll: -1.5 }, { t: hit - 0.9, x: 0, y: 50, z: 120, roll: -3 }, { t: hit, x: 70, y: 40, z: 260, roll: -0.5 }, { t: CUT.D2, x: 50, y: 60, z: 340, roll: 2.5 }], 19);
    const speed = 120, scroll = speed * Math.min(t, hit), wall = 98 + left * speed + 3 * Math.exp(-after * 6) * Math.sin(after * 40);
    const loss = seg(t, hit - 0.75, hit - 0.1);
    let p = mixPose(stride(t * 1.2, true), POSE.trip, loss);
    p = mixPose(p, POSE.prone, seg(t, hit - 0.15, hit + 0.1));
    const hx = lerp(34, 46, loss) - 10 * seg(t, hit, hit + 0.9), lift = 12 * Math.sin(Math.PI * seg(t, hit - 0.7, hit + 0.3));
    return (
      <>
        <Rink th={VIOLETNIGHT} cam={{ ...cam, x: cam.x + sh.x, y: cam.y + sh.y }} scroll={scroll} t={t} stands={{ seed: 31, crowd: 0, windows: true }} text="LATIHAN AUDIRA" floor={{ lines: LINES, traces: 0.55, pools: [{ x: 30, y: 140, r: 40, i: 0.3 }, { x: 110, y: 150, r: 40, i: 0.24 }] }}>
          <Bits b={streaks(t, 84, 132, -1, t < hit ? 12 : 0)} />
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <Px x={wall + i * 26 - (i ? 0 : 2 * Math.exp(-after * 8) * (after > 0 ? 1 : 0))} y={74} w={25} h={86} c={i % 2 ? "#d8ccf4" : "#7c44d0"} />
              <Px x={wall + i * 26} y={74} w={25} h={5} c={i % 2 ? "#ffffff" : "#c8a0ff"} /><Px x={wall + i * 26} y={74} w={3} h={86} c={i % 2 ? "#f4ecff" : "#a878f0"} />
              <Px x={wall + i * 26 + 20} y={79} w={5} h={81} c={i % 2 ? "#a898cc" : "#44208a"} /><Px x={wall + i * 26} y={152} w={25} h={8} c={i % 2 ? "#8070a8" : "#2c1464"} />
            </React.Fragment>
          ))}
          <Px x={wall} y={66} w={90} h={8} c="rgba(200,180,255,0.35)" />
          <Sk p={p} kit={HERO} u={1.2} x={hx} y={155 - lift} sh={156} k={VIOLETNIGHT.key} />
          <Bits b={[...spray(t, hx - 44, 154, -1, 24, t < hit ? 1 : 0.3, 5), ...burst(t, hit, 96, 136, 120, 1.25, [[255, 255, 255], [255, 220, 140], [200, 160, 255]], 1.2), ...burst(t, hit - 0.6, hx - 10, 156, 40, 0.7)]} />
        </Rink>
        <Beam x={240} w={520} c="#FFB84C" o={0.24} rot={-16} />
        <Pool x={560} y={1000} rx={900} ry={1050} c="#5a4a80" k={0.85} />
        <FgRail c="#0c0620" hi="rgba(255,190,90,0.7)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => <Pop t={t} a={T.tahun2000 - 0.1} b={CUT.D2} top={300}><Chip text="TAHUN 2000" color="#FFD75A" size={72} /></Pop>,
};

// ---------------------------------------------------------------- D2 x-ray
const XRAY = once(xray);
const XR_OVER = { sky: ramp("#04101c", "#0a2238", "#164060", "#2a6894"), teal: ramp("#020a14", "#0a3458", "#2a80b4", "#a8e8ff"), ivoryLit: ramp("#2a5c84", "#78b4d8", "#d0f0ff", "#ffffff"), metal: ramp("#0c1c2c", "#2c4c68", "#6c98b8", "#d0ecff") };
export const D2: Shot = {
  scene: ({ t }) => {
    const { wall, film } = XRAY();
    const cam = camAt(t, [{ t: CUT.D2, x: -50, y: -40, z: 30, roll: -1 }, { t: T.patah, x: -10, y: 10, z: 150, roll: 0.4 }, { t: T.dokter + 0.3, x: 20, y: 0, z: 110, roll: 0 }, { t: CUT.E, x: 60, y: -20, z: 220, roll: 1.2 }], 23);
    const pulse = 0.55 + 0.45 * Math.sin(t * 9), on = seg(t, T.tulang, T.tulang + 0.3), scan = 52 + 112 * fr((t - CUT.D2) * 0.42);
    const no = seg(t, T.tidak - 0.1, T.tidak + 0.2), shk = no * (1 - seg(t, T.tidak + 1.2, T.tidak + 1.6)) * 3 * Math.sin(t * 11);
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={1300} maxBlur={2}><Rel a={wall} id="xrw" amb={0.8} over={XR_OVER} /></Layer>
          <Layer z={1000}>
            <Rel a={film} id="xrf" amb={1} over={XR_OVER} />
            <Px x={10} y={scan} w={110} h={1} c="#b8f4ff" o={0.5} /><Px x={10} y={scan - 8} w={110} h={8} c="linear-gradient(180deg, rgba(120,220,255,0), rgba(120,220,255,0.28))" />
            {[3, 4].map((i) => {
              const v = VERT[i], crack = seg(t, T.patah, T.patah + 0.15);
              return (
                <React.Fragment key={i}>
                  <div style={{ position: "absolute", left: (v.x - 22) * PX, top: (v.y - 12) * PX, width: 44 * PX, height: 24 * PX, background: "radial-gradient(ellipse, rgba(255,60,50,0.85) 0%, rgba(255,60,50,0.35) 40%, rgba(255,60,50,0) 72%)", opacity: on * (0.5 + 0.5 * pulse), mixBlendMode: "screen" }} />
                  <Px x={v.x - v.w / 2 + (i === 3 ? 2.4 : -1.6) * crack} y={v.y - v.h / 2} w={v.w} h={v.h} c="#ff4a44" o={on * 0.85} style={{ transform: `rotate(${v.r + (i === 3 ? 7 : -5) * crack}deg)` }} />
                  {crack > 0 ? [0, 1, 2, 3].map((j) => <Px key={j} x={v.x - 1 + (j % 2)} y={v.y - v.h / 2 + j * 2} w={1.6} h={2.2} c="#1a0408" />) : null}
                </React.Fragment>
              );
            })}
            <Bits b={burst(t, T.patah, VERT[3].x, VERT[3].y + 4, 40, 0.5, [[255, 120, 100], [255, 220, 210]], 0.9)} />
          </Layer>
          <Layer z={760} maxBlur={2}>
            <Fig o={{ suit: "coat", trim: "coat", hat: "hair", back: true, coat: true, arms: t > T.tulang && t < T.dokter ? "point" : "down", breathe: Math.sin(t * 2) * 0.5 }} u={1.02} x={22 + shk * 0.3} y={176} k={{ ...KEY0, amb: 0.16, key: 0.34, dir: [0.6, -0.4, 0.2], rimDir: [1, -0.6], rim: "#8CE0FF", rimAmt: 1 }} />
          </Layer>
        </CinematicCamera>
        <Pool x={540} y={860} rx={820} ry={1000} c="#1c3c5c" k={0.8} />
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.tulang} b={T.tidak - 0.3} top={290}><Chip text={t > T.patah - 0.1 ? "2 TULANG LEHER PATAH" : "2 TULANG LEHER"} color="#FF6A5C" size={t > T.patah - 0.1 ? 50 : 60} /></Pop>
      <Pop t={t} a={T.tidak - 0.1} b={CUT.E} top={290}><Chip text="TIDAK AKAN KEMBALI" color="#FFD75A" size={52} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- E Salt Lake City
const MTN = once(mountains);
const MT_OVER = { dusk: ramp("#2c0c34", "#8c2c4c", "#f4743c", "#ffd88c"), mesa: ramp("#240c2c", "#5c2444", "#a44a50", "#e88c68"), ivoryLit: ramp("#4c2c54", "#a4647c", "#f4b8a4", "#fff0dc"), amberLamp: ramp("#7c3404", "#f09424", "#ffd870", "#fffbe0"), woodDark: ramp("#1c0820", "#3c1838", "#6c3048", "#b8604c") };
export const E: Shot = {
  scene: ({ t }) => {
    const m = MTN(), k = seg(t, CUT.E, CUT.F);
    const cam = camAt(t, [{ t: CUT.E, x: -60, y: 150, z: 200, roll: 0.8 }, { t: T.salt, x: 10, y: 30, z: 90, roll: 0 }, { t: CUT.F, x: 40, y: -50, z: 20, roll: -0.6 }], 27);
    const step = Math.abs(Math.sin(t * 4.2));
    return (
      <>
        <CinematicCamera cam={cam}>
          <Layer z={2600} maxBlur={1}><Rel a={m.sky} id="mts" amb={1} over={MT_OVER} /></Layer>
          <Layer z={1900} maxBlur={1}><Rel a={m.ridge} id="mtr" amb={0.95} over={MT_OVER} lights={[{ kind: "point", x: 96, y: 78, r: 70, i: 0.4 }]} /></Layer>
          <Layer z={1300} maxBlur={1}><Rel a={m.arena} id="mta" amb={0.9} over={MT_OVER} /></Layer>
          <Layer z={1000}>
            <Rel a={m.ground} id="mtg" amb={0.9} over={MT_OVER} />
            <Fig o={{ back: true, arms: "down", breathe: step }} u={0.88 - 0.08 * k} x={lerp(44, 62, k)} y={lerp(160, 154, k) - step} k={{ ...KEY0, amb: 0.24, key: 0.5, dir: [0.6, -0.5, -0.1], rimDir: [1, -0.7], rim: "#FFC070", rimAmt: 1 }} />
            <Bits b={snow(t, 80)} />
          </Layer>
          <Layer z={560} maxBlur={6}><Bits b={snow(t * 1.6 + 9, 26)} /></Layer>
        </CinematicCamera>
      </>
    );
  },
  hud: ({ t }) => (
    <>
      <Pop t={t} a={T.februari - 0.1} b={T.salt - 0.1} top={300}><Chip text="FEBRUARI 2002" color="#FFD75A" size={64} /></Pop>
      <Pop t={t} a={T.salt - 0.05} b={CUT.F} top={300}><Chip text="SALT LAKE CITY" color="#FFD75A" size={64} /></Pop>
    </>
  ),
};

// ---------------------------------------------------------------- F quarter-final
const Row: React.FC<{ c: string; text: string; tag?: string; tc?: string; strike?: number; hi?: boolean }> = ({ c, text, tag, tc = "#fff", strike = 0, hi }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, height: 52, padding: "0 18px", background: hi ? "rgba(63,208,119,0.22)" : "rgba(255,255,255,0.06)", fontFamily: FONT.pixel, fontWeight: 700, fontSize: 38, color: "#F4F8FF" }}>
    <div style={{ width: 34, height: 34, background: c }} />
    <div style={{ flex: 1 }}>{text}</div>
    {tag ? <div style={{ color: tc, fontSize: 36 }}>{tag}</div> : null}
    <div style={{ position: "absolute", left: 60, top: 22, height: 8, width: 300 * strike, background: RED }} />
  </div>
);
export const F: Shot = {
  scene: ({ t }) => {
    const cam = camAt(t, [{ t: CUT.F, x: -40, y: 40, z: 130, roll: -2 }, { t: T.ketiga, x: 30, y: 50, z: 150, roll: -1 }, { t: T.tersingkir + 0.4, x: -80, y: 40, z: 190, roll: 0.6 }, { t: T.dq, x: 40, y: 40, z: 100, roll: 0 }, { t: T.lolos + 0.2, x: -50, y: 50, z: 180, roll: -2.2 }, { t: CUT.G, x: 10, y: 40, z: 120, roll: -1 }], 33);
    const down = seg(t, T.tersingkir - 0.2, T.tersingkir + 0.4) * (1 - seg(t, T.lolos - 0.1, T.lolos + 0.3));
    const base = t - CUT.F, sp = 150 * base - 90 * Math.max(0, Math.min(base, T.lolos - CUT.F) - (T.tersingkir - CUT.F));
    const dq = seg(t, T.dq, T.dq + 0.5);
    const hp = mixPose(stride(t * 1.2), POSE.knees, down);
    const f1x = 112 + 5 * Math.sin(t * 1.7) + 20 * down, f2x = 78 + 4 * Math.sin(t * 1.4 + 1) + 10 * down;
    return (
      <>
        <Rink th={ROYAL} cam={cam} scroll={sp} t={t} stands={{ seed: 41, crowd: 0.94, cheer: t > T.lolos ? 1 : 0 }} flash={0.5} floor={{ lines: LINES, traces: 0.4, pools: [{ x: 40, y: 150, r: 60, i: 0.2 }] }}>
          <Bits b={streaks(t, 84, 130, -1, down > 0.5 ? 3 : 12)} />
          <Sk p={stride(t * 1.1 + 0.3)} kit={RIVAL.orange} u={0.76} x={f1x} y={132} k={ROYAL.key} refl={0.26} />
          <Sk p={mixPose(stride(t * 1.15 + 0.6), POSE.stand, dq * 0.25)} kit={RIVAL.white} u={0.82} x={f2x - 30 * dq} y={140 - 4 * dq} k={ROYAL.key} refl={0.28} opacity={1 - 0.35 * dq} />
          <Sk p={hp} kit={HERO} u={1.0} x={37 + 10 * seg(t, T.lolos, T.lolos + 0.8)} y={157} k={ROYAL.key} />
          <Bits b={[...spray(t, f1x - 28, 132, -1, 10, 0.6, 3), ...spray(t, f2x - 30, 140, -1, 12, 0.7, 4), ...spray(t, -18, 155, -1, 22, down > 0.5 ? 0.3 : 1, 5), ...confetti(t, T.lolos, ["#3FD077", "#FFD75A", "#FFFFFF"], 70)]} />
        </Rink>
        <FgRail c="#0a1a50" hi="rgba(230,240,255,0.85)" y={1640} />
      </>
    );
  },
  hud: ({ t }) => (
    <Pop t={t} a={CUT.F + 0.3} b={CUT.G} top={284}>
      <div style={{ width: 800, background: "rgba(6,14,44,0.9)", border: "6px solid #86B0FF", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: FONT.pixel, fontWeight: 700, fontSize: 38, color: "#FFD75A", textAlign: "center" }}>PEREMPAT FINAL</div>
        <Row c="#E0681A" text="LAWAN" tag="LOLOS" tc="#C8D8F4" />
        <Row c="#EEF2FA" text="LAWAN" strike={seg(t, T.dq, T.dq + 0.3)} tag={t > T.dq ? "DISKUALIFIKASI" : "LOLOS"} tc={t > T.dq ? "#FF6A5C" : "#C8D8F4"} />
        {t > T.ketiga - 0.1 ? <Row c={GREEN} text={t > T.tersingkir ? "BRADBURY" : "BRADBURY KE-3"} hi tag={t > T.lolos ? "LOLOS" : t > T.tersingkir ? "TERSINGKIR?" : undefined} tc={t > T.lolos ? GREEN : "#FF6A5C"} /> : null}
      </div>
    </Pop>
  ),
};
