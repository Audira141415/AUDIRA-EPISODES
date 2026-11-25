// EP11 sets, part 1 (A road 1912, B1 Stockholm stadium, B2 Eurasia map, B3 white-night room) plus shared helpers.
// Part 2 (C1..OUT) lives in sets2.tsx. CHRONICLE grammar: black ink figures, coloured contours, one key from behind.
import React, { useMemo } from "react";
import { CanvasTexture, Color, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import type { Look } from "./chronicle/Stage.tsx";
import { Figure, POSES, gait, idle, type Arm, type Costume, type Leg, type Pose } from "./chronicle/Figure.tsx";
import { DAY, GOLDEN, INK, MAPROOM, ROOM_DAY } from "./chronicle/looks.ts";
import { Ground, Flag } from "./chronicle/props.tsx";
import { Embers } from "./chronicle/fx.tsx";
import { Shafts } from "./chronicle/fxextra.tsx";
import { F_STAMP } from "./chronicle/fonts.ts";
import type { V3 } from "./chronicle/cam.ts";
import { Model } from "./Model.tsx";
import { seg } from "./timing.ts";

// ---------------------------------------------------------------- shared helpers
const mixArm = (a: Arm = {}, b: Arm = {}, k: number): Arm => ({ fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * k, out: (a.out ?? 0) + ((b.out ?? 0) - (a.out ?? 0)) * k, elbow: (a.elbow ?? 0) + ((b.elbow ?? 0) - (a.elbow ?? 0)) * k, twist: (a.twist ?? 0) + ((b.twist ?? 0) - (a.twist ?? 0)) * k });
const mixLeg = (a: Leg = {}, b: Leg = {}, k: number): Leg => ({ fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * k, out: (a.out ?? 0) + ((b.out ?? 0) - (a.out ?? 0)) * k, knee: (a.knee ?? 0) + ((b.knee ?? 0) - (a.knee ?? 0)) * k, ankle: (a.ankle ?? 0) + ((b.ankle ?? 0) - (a.ankle ?? 0)) * k });
const n = (a: number | undefined, b: number | undefined, d: number, k: number) => (a ?? d) + ((b ?? d) - (a ?? d)) * k;
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  hipY: n(a.hipY, b.hipY, 0.93, k), lean: n(a.lean, b.lean, 0, k), yaw: n(a.yaw, b.yaw, 0, k), spine: n(a.spine, b.spine, 0, k), side: n(a.side, b.side, 0, k), twist: n(a.twist, b.twist, 0, k),
  head: [n(a.head?.[0], b.head?.[0], 0, k), n(a.head?.[1], b.head?.[1], 0, k)],
  armL: mixArm(a.armL, b.armL, k), armR: mixArm(a.armR, b.armR, k), legL: mixLeg(a.legL, b.legL, k), legR: mixLeg(a.legR, b.legR, k),
});
/** Running pose, about 2.9 steps/s at speed 1. */
export const run = (t: number, seed = 0, speed = 1, effort = 1): Pose => gait(t * 9 * speed + seed * 1.7, effort);
const A = (fwd = 0, out = 0.08, elbow = 0.12, twist = 0): Arm => ({ fwd, out, elbow, twist });
export const EP_POSE = {
  /** knees gone, arms loose; topple the whole group with rotation.x ≈ -1.42 */
  fall: (): Pose => ({ hipY: 0.86, lean: -0.2, spine: -0.15, armL: A(-0.4, 0.9, 0.3), armR: A(0.6, 0.7, 0.4), legL: { fwd: 0.5, out: 0.12, knee: 0.7 }, legR: { fwd: -0.1, out: 0.1, knee: 0.35 }, head: [0.45, 0.2] }),
  /** hands on the knees, out of breath */
  spent: (): Pose => ({ hipY: 0.8, lean: 0.62, spine: 0.35, armL: A(0.75, 0.16, 0.25), armR: A(0.75, 0.16, 0.25), legL: { fwd: 0.35, out: 0.14, knee: 0.55 }, legR: { fwd: 0.25, out: 0.14, knee: 0.5 }, head: [-0.35, 0] }),
  /** both arms high: crossing the line */
  victory: (): Pose => ({ ...POSES.stand(), armL: A(2.7, 0.35, 0.25), armR: A(2.7, 0.35, 0.25), head: [0.35, 0], legL: { fwd: 0.1, out: 0.12 }, legR: { fwd: -0.1, out: 0.12 } }),
  /** sitting, head in the hands */
  restless: (t: number): Pose => ({ ...POSES.sitChair(), spine: 0.5 + 0.06 * Math.sin(t * 1.6), armL: A(1.25, 0.06, 2.2, -0.3), armR: A(1.25, 0.06, 2.2, 0.3), head: [-0.35 + 0.1 * Math.sin(t * 2.1), 0.1 * Math.sin(t * 1.3)] }),
  /** drinking from a cup */
  drink: (k: number): Pose => ({ ...POSES.stand(), armR: A(1.1 + 0.35 * k, 0.1, 1.9 + 0.3 * k, 0.2), head: [0.15 + 0.3 * k, 0] }),
};
export const RUNNER: Costume = { hat: "none", wear: "pants", scale: 1.0, build: 0.96 };

const rng = (s: number) => { let sd = s; return () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; };
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(...rep); }
  return t;
};
const lazy = <X,>(f: () => X) => { let v: X | null = null; return () => (v ??= f()); };
const speckle = (g: CanvasRenderingContext2D, w: number, h: number, count: number, a: string, b: string, seed = 7, r = 3) => {
  const R = rng(seed);
  for (let i = 0; i < count; i++) { g.fillStyle = R() < 0.5 ? a : b; g.globalAlpha = 0.05 + R() * 0.16; g.fillRect(R() * w, R() * h, 1 + R() * r, 1 + R() * r); }
  g.globalAlpha = 1;
};
/** Dusty dirt road, wheel ruts along v. */
export const roadMat = lazy(() => {
  const t = canvasTex(1024, 2048, (g) => {
    g.fillStyle = "#b08a5e"; g.fillRect(0, 0, 1024, 2048);
    for (const x of [300, 724]) { const gr = g.createLinearGradient(x - 90, 0, x + 90, 0); gr.addColorStop(0, "rgba(70,46,26,0)"); gr.addColorStop(0.5, "rgba(70,46,26,0.5)"); gr.addColorStop(1, "rgba(70,46,26,0)"); g.fillStyle = gr; g.fillRect(x - 90, 0, 180, 2048); }
    speckle(g, 1024, 2048, 16000, "#4a3018", "#f0d6a8", 9, 6);
  }, [1, 10]);
  return new MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 2, roughness: 1 });
});
export const woodMat = (color: string, rep: [number, number] = [2, 2]) => {
  const t = canvasTex(1024, 1024, (g) => {
    const R = rng(23);
    for (let y = 0; y < 1024; y += 64) { const l = 150 + R() * 60; g.fillStyle = `rgb(${l},${l - 12},${l - 26})`; g.fillRect(0, y, 1024, 62); g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect(0, y + 61, 1024, 3); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(40,20,8,${0.05 + R() * 0.12})`; g.fillRect(R() * 1024, y + R() * 60, 60 + R() * 260, 1.5); } }
  }, rep);
  return new MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 1, roughness: 0.85, color: new Color(color) });
};
/** Painted board with big lettering (AUDIRA banner, km post, finish board). */
export const signMat = (text: string, bg = "#16100e", fg = "#f4ead8", w = 2048, h = 256, size = 150) => {
  const t = canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = "#b8322a"; g.fillRect(0, 14, w, 10); g.fillRect(0, h - 24, w, 10); g.font = `${size}px "${F_STAMP}"`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 6); });
  return new MeshStandardMaterial({ map: t, roughness: 0.8, emissive: new Color("#ffffff"), emissiveMap: t, emissiveIntensity: 0.3 });
};
export const GLOW = (color: string, k: number) => new MeshBasicMaterial({ color: new Color(color).multiplyScalar(k), toneMapped: false, fog: false });
export const DARK = new MeshStandardMaterial({ color: new Color("#1a1414"), roughness: 0.8 });
const puffTex = lazy(() => canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(255,255,255,0.9)"); r.addColorStop(0.5, "rgba(255,255,255,0.32)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }));
/** Soft dust / steam puffs rising from `at` and drifting along `drift`. */
export const Puffs: React.FC<{ t: number; at: V3; drift?: V3; count?: number; size?: number; color?: string; life?: number; opacity?: number; seed?: number }> = ({ t, at, drift = [0, 0.6, -1.2], count = 10, size = 0.9, color = "#ffd9a0", life = 1.4, opacity = 0.28, seed = 1 }) => {
  const mats = useMemo(() => Array.from({ length: count }, () => new MeshBasicMaterial({ map: puffTex(), color: new Color(color), transparent: true, depthWrite: false, fog: true })), [count, color]);
  return (
    <group userData={{ noMask: true }}>
      {mats.map((m, i) => {
        const k = ((((t / life + i / count + seed * 0.13) % 1) + 1) % 1);
        m.opacity = 0.5 * opacity * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - k * 0.4);
        const j = Math.sin(i * 12.9 + seed) * 0.35;
        return <mesh key={i} material={m} userData={{ noMask: true }} position={[at[0] + j + drift[0] * k, at[1] + drift[1] * k, at[2] + drift[2] * k]} scale={size * (0.5 + 1.4 * k)}><planeGeometry args={[1, 1]} /></mesh>;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- A: dirt road, 1912 (runner comes toward +z)
export const ROAD: Look = {
  ...GOLDEN, key: { ...GOLDEN.key, pos: [-10, 12, -50], intensity: 3.2, shadow: { box: 16, at: [0, 0, -4], far: 140 } },
  fog: { color: "#e0a878", density: 0.016 }, sky: { ...GOLDEN.sky, sunDir: [-0.06, 0.1, -1], sunSize: 0.46, glow: 0.8 },
  bloom: { strength: 0.1, radius: 0.35, threshold: 0.95 }, outline: { width: 1, halo: 0.45, gain: 2.2 },
};
/** Roadside shared with C1/C2: road strip, rolling ground, pines/birches, fences, two wooden houses. */
export const Roadside: React.FC<{ scroll?: number; houses?: boolean; ground?: string }> = ({ scroll = 0, houses = true, ground = "#7a6238" }) => {
  const m = roadMat();
  m.map!.offset.y = -scroll * 0.085;
  return (
    <group>
      <Ground size={400} color={ground} amp={1.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, -40]} material={m} receiveShadow><planeGeometry args={[6.4, 118]} /></mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const z = -2 - i * 6.5 + (scroll % 6.5);
        return (
          <group key={i}>
            <Model id="split-rail-fence-run-87da39" height={0.95} position={[-4.6, 0, z]} rotation={[0, Math.PI / 2, 0]} />
            <Model id="split-rail-fence-run-87da39" height={0.95} position={[4.6, 0, z]} rotation={[0, Math.PI / 2, 0]} />
            <Model id={i % 2 ? "birch-tree-181b33" : "front-yard-fir-tree-0a278d"} height={5.5 + (i % 3)} position={[-8.5 - (i % 3) * 1.6, 0, z - 2]} />
            <Model id={i % 2 ? "front-yard-fir-tree-0a278d" : "birch-tree-181b33"} height={5 + ((i + 1) % 3)} position={[8.5 + (i % 2) * 2, 0, z]} />
          </group>
        );
      })}
      {houses && <Model id="gabled-farmhouse-c7534f" height={5.5} position={[-13, 0, -30]} rotation={[0, 0.7, 0]} />}
      {houses && <Model id="crossing-keeper-s-cottage-de49a4" height={5} position={[13, 0, -24]} rotation={[0, -0.6, 0]} />}
    </group>
  );
};
export const RoadSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <Roadside scroll={t * 4.2} />
    <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0.07, 0]} pose={run(t)} look={RUNNER} t={t} />
    {[[-1.7, -7], [1.6, -9.5], [0.4, -13], [-1.1, -17]].map(([x, z], i) => <Figure key={i} id={10 + i} pos={[x, 0.07, z]} pose={run(t, i + 2, 0.95)} look={{ ...RUNNER, scale: 1.04 }} t={t} />)}
    <Puffs t={t} at={[0, 0.15, -0.4]} drift={[0.3, 0.7, -2.2]} size={1.1} color="#ffca86" />
    <Puffs t={t} at={[-0.8, 0.15, -7]} drift={[0.4, 1, -2]} size={1.8} color="#ffca86" seed={4} />
    <Embers t={t} count={160} box={[-5, 0.2, -8, 5, 3.5, 2]} rise={0.25} size={0.025} color="#ffe2b0" />
  </group>
);

// ---------------------------------------------------------------- B1: Stockholm stadium 1912
export const STADION12: Look = { ...DAY, key: { ...DAY.key, pos: [8, 16, -40], color: "#ffe2b0", intensity: 2.8, shadow: { box: 16, at: [0, 0, -2], far: 120 } }, fill: { pos: [-3, 9, 14], color: "#ffe6c4", intensity: 0.9 }, fog: { color: "#d8c8a8", density: 0.011 }, sky: { ...DAY.sky, zenith: "#4a86bc", horizon: "#f2dcb4", sunDir: [0.3, 0.12, -1], sunSize: 0.2, glow: 0.6 }, outline: { width: 1, halo: 0.4, gain: 2.0 } };
const trackMat = lazy(() => { const t = canvasTex(1024, 1024, (g) => { g.fillStyle = "#8a5a3c"; g.fillRect(0, 0, 1024, 1024); speckle(g, 1024, 1024, 14000, "#4a2a18", "#d8a67c", 5, 5); g.fillStyle = "rgba(244,234,216,0.8)"; for (let x = 0; x < 1024; x += 256) g.fillRect(x, 0, 12, 1024); }, [4, 16]); return new MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 1.2, roughness: 1 }); });
const tierM = lazy(() => woodMat("#b08a62", [10, 1]));
/** Track + grandstands + crowd, shared by B1, D2, E1, E2. `crowd` = number of spectators per stand row. */
export const Stands: React.FC<{ t: number; cheer?: number; rows?: number; z?: number; banner?: string }> = ({ t, cheer = 0, rows = 3, z = -15, banner }) => {
  const ban = useMemo(() => (banner ? signMat(banner) : null), [banner]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={trackMat()} receiveShadow><planeGeometry args={[60, 160]} /></mesh>
      {[0, 1, 2, 3].map((r) => <mesh key={r} position={[0, 0.5 + r * 0.8, z - r * 1.5]} receiveShadow castShadow material={tierM()}><boxGeometry args={[44, 1 + r * 0.1, 1.5]} /></mesh>)}
      {Array.from({ length: rows * 17 }, (_, i) => {
        const r = Math.floor(i / 17), x = ((i % 17) - 8) * 1.45 + Math.sin(i * 7.3) * 0.4;
        const up = Math.sin(i * 3.7) > 1 - 1.6 * cheer;
        return <Figure key={i} id={100 + i} pos={[x, 1.0 + r * 0.83, z - r * 1.5 + 0.1]} pose={idle(up ? POSES.raiseFist() : POSES.stand(), t * (up ? 2.4 : 1), i, up ? 3 : 1)} look={{ hat: i % 3 ? "none" : "peci", scale: 0.95 + 0.08 * Math.sin(i) }} t={t} />;
      })}
      {ban && <mesh position={[0, 0.62, z + 0.82]} material={ban}><planeGeometry args={[9, 1.1]} /></mesh>}
    </group>
  );
};
export const Stockholm: React.FC<{ t: number; pair: number }> = ({ t, pair }) => (
  <group>
    <Stands t={t} cheer={0.15} banner="STOCKHOLM 1912" />
    <Model id="clock-tower-752081" height={15} position={[-8.5, 0, -24]} />
    <Model id="clock-tower-752081" height={13} position={[9.5, 0, -26]} />
    {[-5.5, -2, 5.2].map((x, i) => <Flag key={x} pos={[x, 0, -12 + (i % 2)]} t={t + i} h={7} w={2} color={["#5a4636", "#8a3a2c", "#3a4a52"][i]} />)}
    <Figure id={1} outline={INK.hero} gain={1.2} pos={[0, 0, 0]} rotY={0.15} pose={idle(POSES.akimbo(), t, 1)} look={RUNNER} t={t} />
    <Figure id={2} outline={pair > 0.05 ? INK.ally : null} gain={2 * pair} pos={[1.15, 0, -0.7]} rotY={-0.25} pose={idle(POSES.stand(), t, 3)} look={{ ...RUNNER, scale: 1.04 }} t={t} />
    <Shafts from={[6, 14, -14]} yaw={0.3} tilt={0.5} len={18} width={7} count={4} color="#ffe2b0" opacity={0.03} t={t} />
    <Embers t={t} count={90} box={[-4, 0.2, -5, 4, 4, 2]} rise={0.15} size={0.02} color="#fff0d0" />
  </group>
);

// ---------------------------------------------------------------- B2: Eurasia paper map (Japan → Siberia → Stockholm)
export const MAPLOOK: Look = { ...MAPROOM, key: { pos: [-60, 120, -90], color: "#ffe2b8", intensity: 2.6 }, grade: { ...MAPROOM.grade, high: "#ffcf8f", amount: 0.14, vignette: 0.5 }, far: 2000 };
const M_LON = 78, M_LAT = 50, MK = 1.4;
export const mapPoint = (lon: number, lat: number, y = 0): V3 => [(lon - M_LON) * MK, y, -(lat - M_LAT) * MK * 1.5];
const ROUTE: [number, number][] = [[139.7, 35.6], [136, 36.5], [132, 40.5], [131.9, 43.1], [127, 48.5], [113, 52], [104, 52.3], [82, 55], [60, 56.8], [37.6, 55.7], [30.3, 59.9], [24.9, 60.2], [18.1, 59.3]];
/** Point on the route, p 0..1 (≈ 0.24 = Vladivostok, where ship becomes train). */
export const routeAt = (p: number): { pos: V3; yaw: number } => {
  const x = Math.min(0.9999, Math.max(0, p)) * (ROUTE.length - 1), i = Math.floor(x), k = x - i;
  const a = ROUTE[i], b = ROUTE[i + 1];
  const A0 = mapPoint(a[0], a[1]), B0 = mapPoint(b[0], b[1]);
  return { pos: mapPoint(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k), yaw: Math.atan2(B0[0] - A0[0], B0[2] - A0[2]) };
};
const EURASIA: [number, number][] = [[10, 54], [12, 45], [18, 40], [26, 40], [36, 36], [50, 30], [60, 25], [72, 20], [80, 14], [90, 22], [100, 14], [108, 18], [121, 30], [119, 38], [125, 39], [127, 35], [129, 37], [129, 42], [135, 44], [141, 52], [156, 58], [160, 70], [130, 73], [100, 77], [70, 72], [45, 67], [32, 70], [38, 65], [33, 66], [30, 60], [22, 59], [21, 55], [14, 54]];
const SCANDI: [number, number][] = [[5, 59], [11, 59], [13, 55.5], [18, 59], [18, 62], [24, 65.8], [22, 60.5], [29, 60.5], [32, 70], [20, 70], [12, 65]];
const JAPAN: [number, number][] = [[130, 31.5], [135, 34], [140.5, 35.5], [142, 40], [145, 43.5], [141.5, 45], [139.5, 41], [136, 36.5], [131, 34]];
const mapTex = lazy(() => canvasTex(2800, 1500, (g) => {
  const px = ([lo, la]: [number, number]): [number, number] => [((lo - 0) / 156) * 2800, ((78 - la) / 68) * 1500];
  g.fillStyle = "#1f4250"; g.fillRect(0, 0, 2800, 1500);
  g.strokeStyle = "rgba(244,234,216,0.1)"; g.lineWidth = 3;
  for (let lo = 0; lo < 156; lo += 13) { const [x] = px([lo, 0]); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1500); g.stroke(); }
  for (let la = 10; la < 78; la += 10) { const [, y] = px([0, la]); g.beginPath(); g.moveTo(0, y); g.lineTo(2800, y); g.stroke(); }
  const path = (p: [number, number][]) => { g.beginPath(); p.forEach((q, i) => { const [x, y] = px(q); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
  g.lineJoin = "round";
  for (const w of [110, 70, 36]) for (const p of [EURASIA, SCANDI, JAPAN]) { path(p); g.strokeStyle = "rgba(150,196,206,0.09)"; g.lineWidth = w; g.stroke(); }
  for (const p of [EURASIA, SCANDI, JAPAN]) { path(p); g.fillStyle = p === EURASIA ? "#c2ab7e" : "#dcc08a"; g.fill(); g.strokeStyle = "#5c4a32"; g.lineWidth = 6; g.stroke(); g.save(); path(p); g.clip(); speckle(g, 2800, 1500, 12000, "#4a3820", "#fff0cd", 11, 5); g.restore(); }
  const R = rng(31); g.strokeStyle = "rgba(70,50,28,0.35)"; g.lineWidth = 3;
  for (let i = 0; i < 150; i++) { const [x, y] = px([60 + R() * 60, 46 + R() * 10]); g.beginPath(); g.moveTo(x - 14, y + 12); g.lineTo(x, y - 12); g.lineTo(x + 14, y + 12); g.stroke(); }
  for (const x of [700, 1400, 2100]) { const gr = g.createLinearGradient(x - 24, 0, x + 24, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(20,12,6,0.35)"); gr.addColorStop(0.55, "rgba(255,240,210,0.2)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - 24, 0, 48, 1500); }
}));
const mapMat = lazy(() => new MeshStandardMaterial({ map: mapTex(), bumpMap: mapTex(), bumpScale: 1.2, roughness: 0.95 }));
const inkTint = (m: MeshStandardMaterial) => { m.color = new Color("#1c1512"); m.roughness = 0.55; m.emissive = new Color("#3a2410"); m.emissiveIntensity = 0.5; };
/** Small coal steamer (hull, deckhouse, two funnels), length ≈ 12, bow toward +z. */
const Steamer: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0.03 * Math.sin(t * 2), 0, 0.05 * Math.sin(t * 1.6)]}>
    <mesh position={[0, 1, 0]} material={DARK} castShadow><boxGeometry args={[2.6, 2, 9]} /></mesh>
    <mesh position={[0, 1, 4.5]} rotation={[0, Math.PI / 4, 0]} material={DARK} castShadow><boxGeometry args={[1.85, 2, 1.85]} /></mesh>
    <mesh position={[0, 2.5, -0.6]} castShadow><boxGeometry args={[1.9, 1.1, 4.6]} /><meshStandardMaterial color="#e8d8b8" roughness={0.8} /></mesh>
    {[0.6, -1.6].map((z) => <mesh key={z} position={[0, 4.2, z]} castShadow><cylinderGeometry args={[0.45, 0.5, 2.6, 16]} /><meshStandardMaterial color="#b8322a" roughness={0.7} /></mesh>)}
    <Puffs t={t} at={[0, 5.6, 0]} drift={[0.4, 2.4, -4]} size={2.2} color="#d8cdb8" opacity={0.3} />
  </group>
);
/** p 0..1 along ROUTE. Ship until Vladivostok, then tender locomotive + carriage. */
export const MapSet: React.FC<{ t: number; p: number }> = ({ t, p }) => {
  const f = routeAt(p), back = routeAt(Math.max(0, p - 0.055)), train = t >= 17.75, ship = Math.max(0.01, 1 - seg(t, 17.45, 17.75)), loco = Math.max(0.01, seg(t, 17.75, 18.05)), car = Math.max(0.01, seg(p, 0.29, 0.4)); // ship shrinks, train grows: no one-frame swap
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (M_LAT - 44) * MK * 1.5]} material={mapMat()} receiveShadow><planeGeometry args={[156 * MK, 68 * MK * 1.5]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}><planeGeometry args={[1600, 1600]} /><meshStandardMaterial color="#1a100a" roughness={1} /></mesh>
      {!train && <group position={f.pos} rotation={[0, f.yaw, 0]} scale={ship}><Steamer t={t} /></group>}
      {train && <group position={f.pos} rotation={[0, f.yaw, 0]} scale={loco}><Model id="tender-steam-locomotive-8e2a82" height={4.6} tint={inkTint} /><Puffs t={t} at={[0, 5, 3]} drift={[0.4, 3, -8]} size={3} color="#efe4cf" opacity={0.34} /></group>}
      {train && <group position={back.pos} rotation={[0, back.yaw, 0]} scale={car}><Model id="passenger-carriage-de9d58" height={4} tint={inkTint} /></group>}
    </group>
  );
};

// ---------------------------------------------------------------- B3: boarding room, white night
export const WHITENIGHT: Look = { ...ROOM_DAY, key: { pos: [-3, 6, -20], color: "#cfe0ff", intensity: 2.8, shadow: { box: 8, at: [0, 0, -1], far: 60, bias: -0.0006 } }, hemi: { sky: "#8ea6c8", ground: "#1a1620", intensity: 0.55 }, fog: { color: "#3c4860", density: 0.02 }, grade: { shadow: "#16203a", high: "#e6ecff", amount: 0.16, contrast: 0.24, vignette: 0.46, grain: 0.024 }, bloom: { strength: 0.4, radius: 0.6, threshold: 0.85 }, outline: { width: 1, halo: 0.45, gain: 2.2 } };
const wallM = lazy(() => woodMat("#6a625a", [3, 2])), floorM = lazy(() => woodMat("#5a4636", [3, 3]));
/** Wooden room: back wall with a bright window of w × h at (wx, wy); used by B3 and C3b. `glow` scales the window. */
export const Room: React.FC<{ t: number; wx?: number; wy?: number; color?: string; glow?: number; shaft?: number; children?: React.ReactNode }> = ({ t, wx = -1.2, wy = 2.1, color = "#eaf2ff", glow = 1.5, shaft = 0.16, children }) => {
  const win = useMemo(() => GLOW(color, 1), [color]);
  win.color.set(color).multiplyScalar(glow);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floorM()} receiveShadow><planeGeometry args={[14, 14]} /></mesh>
      <mesh position={[0, 2, -3.2]} material={wallM()} receiveShadow><boxGeometry args={[12, 5.4, 0.2]} /></mesh>
      {[-3.6, 3.6].map((x) => <mesh key={x} position={[x, 2, 0]} material={wallM()} receiveShadow><boxGeometry args={[0.2, 5.4, 8]} /></mesh>)}
      <mesh position={[wx, wy, -3.08]} material={win} userData={{ noMask: true }}><planeGeometry args={[1.5, 1.9]} /></mesh>
      {[[0, 0, 1.7, 0.09], [0, 0.95, 1.8, 0.12], [0, -0.95, 1.8, 0.12]].map(([x, y, w, h], i) => <mesh key={i} position={[wx + x, wy + y, -3.0]} material={DARK}><boxGeometry args={[w, h, 0.1]} /></mesh>)}
      {[-0.8, 0, 0.8].map((x) => <mesh key={x} position={[wx + x, wy, -3.0]} material={DARK}><boxGeometry args={[0.09, 1.9, 0.1]} /></mesh>)}
      <pointLight position={[wx, wy, -2.2]} color={color} intensity={14 * glow} distance={9} decay={1.6} />
      <Shafts from={[wx, wy + 0.9, -2.9]} tilt={0.95} len={4.4} width={1.4} count={4} color={color} opacity={shaft} t={t} />
      <Embers t={t} count={70} box={[-2.5, 0.3, -2.6, 2.5, 2.8, 1]} rise={0.06} size={0.014} color="#ffffff" />
      {children}
    </group>
  );
};
export const WhiteNightSet: React.FC<{ t: number }> = ({ t }) => (
  <Room t={t}>
    <Model id="bed-6e10e8" height={0.95} position={[0.7, 0, -1.7]} rotation={[0, Math.PI / 2, 0]} />
    <Model id="bedside-table-3f2b80" height={0.6} position={[2.4, 0, -2.2]} />
    <Model id="table-lamp-e25998" height={0.5} position={[2.4, 0.6, -2.2]} />
    <Figure id={1} outline={INK.hero} gain={1.2} pos={[0.2, 0, -0.75]} rotY={0.25} pose={EP_POSE.restless(t)} look={RUNNER} t={t} />
  </Room>
);
