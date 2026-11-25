// EP05 sets beyond the ring: the Atlantic map (flight to Kinshasa), the face-off stage, the night training camp,
// and rain for the dawn storm. Same CHRONICLE grammar: black ink figures with coloured contours, one key light,
// fog, three depth layers. GLB props from the local catalog via Model.tsx (redraw-safe loader).
import React, { useLayoutEffect, useMemo } from "react";
import {
  AdditiveBlending, BoxGeometry, CanvasTexture, RepeatWrapping, Color, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace,
} from "three";
import type { Look } from "./chronicle/Stage.tsx";
import { Figure, POSES, type Arm, type Leg, type Pose } from "./chronicle/Figure.tsx";
import { INK } from "./chronicle/looks.ts";
import { Palm } from "./chronicle/props.tsx";
import { Shafts } from "./chronicle/fxextra.tsx";
import { F_CITE, F_LABEL } from "./chronicle/fonts.ts";
import type { V3 } from "./chronicle/cam.ts";
import { Model } from "./Model.tsx";
import { grainTex } from "./RingSet.tsx";

// ---------------------------------------------------------------- pose blending
const mixArm = (a: Arm = {}, b: Arm = {}, k: number): Arm => ({
  fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * k,
  out: (a.out ?? 0) + ((b.out ?? 0) - (a.out ?? 0)) * k,
  elbow: (a.elbow ?? 0) + ((b.elbow ?? 0) - (a.elbow ?? 0)) * k,
  twist: (a.twist ?? 0) + ((b.twist ?? 0) - (a.twist ?? 0)) * k,
});
const mixLeg = (a: Leg = {}, b: Leg = {}, k: number): Leg => ({
  fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * k,
  out: (a.out ?? 0) + ((b.out ?? 0) - (a.out ?? 0)) * k,
  knee: (a.knee ?? 0) + ((b.knee ?? 0) - (a.knee ?? 0)) * k,
  ankle: (a.ankle ?? 0) + ((b.ankle ?? 0) - (a.ankle ?? 0)) * k,
});
const n = (a: number | undefined, b: number | undefined, d: number, k: number) => (a ?? d) + ((b ?? d) - (a ?? d)) * k;
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  hipY: n(a.hipY, b.hipY, 0.93, k), lean: n(a.lean, b.lean, 0, k), yaw: n(a.yaw, b.yaw, 0, k), spine: n(a.spine, b.spine, 0, k),
  side: n(a.side, b.side, 0, k), twist: n(a.twist, b.twist, 0, k),
  head: [n(a.head?.[0], b.head?.[0], 0, k), n(a.head?.[1], b.head?.[1], 0, k)],
  armL: mixArm(a.armL, b.armL, k), armR: mixArm(a.armR, b.armR, k), legL: mixLeg(a.legL, b.legL, k), legR: mixLeg(a.legR, b.legR, k),
});

const A = (fwd = 0, out = 0.08, elbow = 0.12, twist = 0): Arm => ({ fwd, out, elbow, twist });
/** Extra boxing poses (BOX in RingSet holds guard / hook / ropes / fall / heldPunch). */
export const BOX2 = {
  jabR: (): Pose => ({ ...POSES.stand(), armL: A(1.2, 0.22, 2.1, -0.3), armR: A(1.55, 0.02, 0.15, 0.1), twist: -0.4, lean: 0.2, legL: { fwd: 0.35, out: 0.12, knee: 0.28 }, legR: { fwd: -0.3, out: 0.1, knee: 0.12 }, head: [-0.1, 0] }),
  jabL: (): Pose => ({ ...POSES.stand(), armL: A(1.55, 0.02, 0.15, -0.1), armR: A(1.1, 0.25, 2.2, 0.3), twist: 0.35, lean: 0.18, legL: { fwd: 0.35, out: 0.12, knee: 0.28 }, legR: { fwd: -0.3, out: 0.1, knee: 0.12 }, head: [-0.1, 0] }),
  wobble: (): Pose => ({ ...POSES.stand(), hipY: 0.88, lean: -0.08, spine: -0.1, side: 0.12, armL: A(0.6, 0.3, 1.2), armR: A(0.45, 0.35, 1.0), legL: { fwd: 0.25, out: 0.18, knee: 0.4 }, legR: { fwd: -0.2, out: 0.16, knee: 0.35 }, head: [0.25, 0.15] }),
  victory: (): Pose => ({ ...POSES.stand(), armL: A(2.7, 0.35, 0.25), armR: A(2.7, 0.35, 0.25), head: [0.35, 0], legL: { fwd: 0.1, out: 0.12 }, legR: { fwd: -0.1, out: 0.12 } }),
  /** referee counting: right arm sweeping down with each count */
  count: (k: number): Pose => ({ ...POSES.stand(), lean: 0.25, spine: 0.2, armR: A(1.9 - 1.1 * k, 0.15, 0.2), armL: A(0.3, 0.12, 0.4), legL: { fwd: 0.25, out: 0.14, knee: 0.3 }, legR: { fwd: -0.25, out: 0.12, knee: 0.2 }, head: [-0.35, 0] }),
};
export const BOXER_LOOK = { itemL: "glove" as const, itemR: "glove" as const, scale: 1.12, build: 1.08 };

// ---------------------------------------------------------------- map (Atlantic → Kinshasa)
const MAP_LON = -15, MAP_LAT = 7.5, MAP_K = 2, MAP_W = 140, MAP_H = 105;
export const mapPoint = (lon: number, lat: number, y = 0): V3 => [(lon - MAP_LON) * MAP_K, y, -(lat - MAP_LAT) * MAP_K];

// coarse hand-traced coasts (lon, lat) — a stylised parchment map, not a survey
const AFRICA: [number, number][] = [
  [-6, 35.8], [-10, 30], [-13, 27], [-17, 21], [-17, 15], [-16, 12], [-13, 9], [-11, 7], [-8, 4.5], [-3, 5], [2, 6], [5, 5.5], [8, 4.5],
  [9.5, 3], [9, 0], [12, -5], [13, -9], [12, -17], [14, -23], [16.5, -28.5], [18.5, -34], [20, -34.8], [25, -34], [28, -33], [32.5, -28.5],
  [35, -24], [35.5, -20], [40, -16], [40.5, -11], [39.5, -7], [39, -4.5], [42, -1], [46, 2], [49, 6], [51, 11.5], [44, 11], [43, 13],
  [39, 15.5], [37, 19], [35, 24], [32.5, 30], [32, 31.3], [25, 31.8], [20, 31], [19, 30.3], [15, 32], [11, 33.5], [10, 37], [3, 36.8], [-2, 35],
];
const EUROPE: [number, number][] = [
  [-9.5, 43.5], [-9, 37], [-6, 36.2], [-2, 36.8], [0, 39], [3, 42.5], [7, 43.5], [9, 44.3], [12, 44], [16, 41], [18.5, 40], [16, 38], [19, 41.5],
  [20, 40], [23, 37], [26, 38.5], [27, 41], [29, 41], [36, 36.5], [36, 34], [35, 33], [55, 33], [55, 61], [5, 61], [5, 53], [2, 51], [-1, 49.5], [-4, 48], [-1.5, 43.5],
];
const NAMERICA: [number, number][] = [
  [-86, 61], [-60, 61], [-60, 55], [-56, 51], [-60, 47], [-66, 45], [-70, 42], [-74, 40.5], [-76, 35], [-80, 32], [-81, 25], [-82, 28], [-84, 30], [-86, 30],
];
const SAMERICA: [number, number][] = [
  [-86, 9], [-77, 8], [-72, 12], [-62, 10.5], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5], [-35, -9], [-39, -13], [-40, -20], [-44, -23], [-48, -26],
  [-53, -33], [-58, -38], [-62, -40], [-65, -46], [-86, -46],
];
const CUBA: [number, number][] = [[-85, 22], [-80, 23], [-74, 20], [-78, 20], [-85, 22]];

const useMapTexture = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2800; c.height = 2100;
    const g = c.getContext("2d")!;
    const px = (lon: number, lat: number): [number, number] => [((lon - (MAP_LON - MAP_W / 2)) / MAP_W) * c.width, ((MAP_LAT + MAP_H / 2 - lat) / MAP_H) * c.height];
    g.fillStyle = "#1c3a48"; g.fillRect(0, 0, c.width, c.height);
    // graticule
    g.strokeStyle = "rgba(244,234,216,0.09)"; g.lineWidth = 3;
    for (let lon = -90; lon <= 60; lon += 15) { const [x] = px(lon, 0); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }
    for (let lat = -45; lat <= 60; lat += 15) { const [, y] = px(0, lat); g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
    // equator, a touch brighter
    g.strokeStyle = "rgba(255,181,71,0.22)"; g.setLineDash([24, 18]);
    { const [, y] = px(0, 0); g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
    g.setLineDash([]);
    const land = (pts: [number, number][], fill: string) => {
      g.beginPath();
      pts.forEach(([lo, la], i) => { const [x, y] = px(lo, la); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.closePath();
      g.fillStyle = fill; g.fill();
      g.strokeStyle = "#5c4a32"; g.lineWidth = 6; g.stroke();
      g.strokeStyle = "rgba(244,234,216,0.35)"; g.lineWidth = 2; g.stroke();
    };
    let sd = 11;
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const path = (pts: [number, number][]) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = px(lo, la); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    const all = [NAMERICA, SAMERICA, CUBA, EUROPE, AFRICA];
    // engraved water lines hugging the coasts
    for (const w of [120, 84, 52, 26]) for (const pts of all) { path(pts); g.strokeStyle = `rgba(150,196,206,${0.05 + (120 - w) / 1400})`; g.lineWidth = w; g.lineJoin = "round"; g.stroke(); }
    land(NAMERICA, "#a8946c");
    land(SAMERICA, "#a8946c");
    land(CUBA, "#a8946c");
    land(EUROPE, "#a8946c");
    land(AFRICA, "#c9b48a");
    // relief: mottled terrain + hachured highlands, clipped to land
    for (const pts of all) {
      g.save(); path(pts); g.clip();
      for (let i = 0; i < 9000; i++) {
        const x = rnd() * c.width, y = rnd() * c.height, r = 1.5 + rnd() * 4;
        g.fillStyle = rnd() < 0.5 ? `rgba(70,52,30,${0.06 + rnd() * 0.1})` : `rgba(255,240,205,${0.05 + rnd() * 0.08})`;
        g.fillRect(x, y, r, r);
      }
      g.strokeStyle = "rgba(80,60,36,0.28)"; g.lineWidth = 2.4;
      for (let i = 0; i < 520; i++) { const x = rnd() * c.width, y = rnd() * c.height, l = 8 + rnd() * 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * 0.35, y + l); g.stroke(); }
      g.restore();
    }
    // Congo basin rainforest: dense dark-green stipple, clipped to Africa
    g.save(); path(AFRICA); g.clip();
    { const [fx, fy] = px(21, 0); for (let i = 0; i < 16000; i++) { const a = rnd() * 6.283, d = Math.pow(rnd(), 0.7) * 300; const x = fx + Math.cos(a) * d * 1.5, y = fy + Math.sin(a) * d; g.fillStyle = `rgba(${40 + rnd() * 30},${70 + rnd() * 30},${38 + rnd() * 20},${0.25 + rnd() * 0.3})`; g.beginPath(); g.arc(x, y, 1.5 + rnd() * 3, 0, 7); g.fill(); } }
    g.restore();
    // Congo river, Kinshasa sits on it
    g.strokeStyle = "rgba(60,110,130,0.85)"; g.lineWidth = 9; g.lineCap = "round";
    { const r = [[12.3, -6], [15.3, -4.3], [17.5, -2.5], [18.5, 0.5], [21, 2], [24, 1.5], [25.5, 0.2]].map(([lo, la]) => px(lo, la)); g.beginPath(); r.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
    // Zaire, a soft amber wash around Kinshasa
    const [kx, ky] = px(15.3, -4.3);
    const rg = g.createRadialGradient(kx, ky, 10, kx, ky, 240);
    rg.addColorStop(0, "rgba(255,181,71,0.55)"); rg.addColorStop(1, "rgba(255,181,71,0)");
    g.fillStyle = rg; g.fillRect(kx - 260, ky - 260, 520, 520);
    // sea label
    g.fillStyle = "rgba(244,234,216,0.42)"; g.textAlign = "center";
    g.font = `italic 74px "${F_CITE}"`;
        g.font = `700 54px "${F_LABEL}"`; g.fillStyle = "rgba(60,44,28,0.75)";
    const [ax, ay] = px(20, 12); g.fillText("A F R I K A", ax, ay);
    // paper grain over everything
    for (let i = 0; i < 60000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "255,246,226" : "0,0,0"},${0.05 + rnd() * 0.09})`; g.fillRect(rnd() * c.width, rnd() * c.height, 2 + rnd() * 4, 2 + rnd() * 4); }
    // paper fibres + fold creases
    for (let i = 0; i < 1400; i++) { const x = rnd() * c.width, y = rnd() * c.height, a = rnd() * 6.3, l = 10 + rnd() * 30; g.strokeStyle = `rgba(${rnd() < 0.5 ? "255,240,210" : "40,28,16"},0.12)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (const fx of [c.width / 3, (2 * c.width) / 3]) { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(fx - 3, 0, 3, c.height); g.fillStyle = "rgba(255,240,210,0.1)"; g.fillRect(fx, 0, 3, c.height); }
    { g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, c.height / 2 - 3, c.width, 3); g.fillStyle = "rgba(255,240,210,0.1)"; g.fillRect(0, c.height / 2, c.width, 3); }
    const vg = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.3, c.width / 2, c.height / 2, c.width * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,10,4,0.45)");
    g.fillStyle = vg; g.fillRect(0, 0, c.width, c.height);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return tex;
};

/** Flight path New York → Kinshasa (gentle arc), progress 0..1. */
export const flight = (p: number): { pos: V3; yaw: number } => {
  const a = [-74, 40.7], c = [-38, 30], b = [15.3, -4.3];
  const q = (u: number) => [
    (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
    (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
  ];
  const u = Math.min(1, Math.max(0, p));
  const [lo, la] = q(u);
  const [lo2, la2] = q(Math.min(1, u + 0.01));
  const [lo0, la0] = q(Math.max(0, u - 0.01));
  const pos = mapPoint(lo, la, 7 - 4.5 * Math.max(0, (u - 0.8) / 0.2));
  const dx = (lo2 - lo0) * MAP_K, dz = -(la2 - la0) * MAP_K;
  return { pos, yaw: Math.atan2(dx, dz) };
};

// airliner as a flat ink cut-out (CHRONICLE palette), not glossy CG
const inkPlane = (m: MeshStandardMaterial) => { m.map = null; m.color = new Color("#1c1512"); m.metalness = 0; m.roughness = 1; m.emissive = new Color("#3a2414"); m.emissiveIntensity = 0.35; };
export const MapSet: React.FC<{ progress: number; yawOffset?: number }> = ({ progress, yawOffset = 0 }) => {
  const tex = useMapTexture();
  const f = flight(progress);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_W * MAP_K, MAP_H * MAP_K]} />
        <meshStandardMaterial map={tex} bumpMap={tex} bumpScale={0.8} roughness={0.95} />
      </mesh>
      {/* table edge beyond the sheet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#120c09" roughness={1} />
      </mesh>
      <group position={f.pos} rotation={[0, f.yaw + yawOffset, 0]}>
        <Model id="widebody-airliner-ae0a5a" height={7} position={[0, -3, 0]} tint={inkPlane} />
      </group>
    </group>
  );
};

/** Projected flight point for the overlay (pin / route). */
export const routePts = (count = 24) => Array.from({ length: count + 1 }, (_, i) => flight(i / count).pos);

// ---------------------------------------------------------------- face-off stage
export const FACEOFF: Look = {
  key: { pos: [0.5, 22, 3], color: "#ffe1b0", intensity: 3.6, shadow: { box: 8, at: [0, 0, 0], far: 60, bias: -0.0005 } },
  hemi: { sky: "#4a3a52", ground: "#0a0708", intensity: 0.4 },
  fill: { pos: [-6, 4, 14], color: "#4a5a8a", intensity: 0.25 },
  fog: { color: "#120c12", density: 0.035 },
  sky: { zenith: "#06050a", horizon: "#140e16", ground: "#050405", sunDir: [0, 1, 0], sunColor: "#000000", sunSize: 0, glow: 0 },
  exposure: 1.3,
  bloom: { strength: 0.42, radius: 0.55, threshold: 0.72 },
  grade: { shadow: "#140f22", high: "#ffc98a", amount: 0.16, contrast: 0.3, vignette: 0.5, grain: 0.024 },
  outline: { width: 1, halo: 0.35, gain: 1.7 },
};
const STAGE = new MeshStandardMaterial({ color: new Color("#2a1e1a"), roughness: 0.7 });
let stageTex = false;
const stageMat = () => {
  if (stageTex) return STAGE;
  stageTex = true;
  const c = document.createElement("canvas"); c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  let sd = 23; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let y = 0; y < 1024; y += 64) { // worn floorboards
    for (let x = 0; x < 1024;) { const w = 180 + rnd() * 260; const l = 40 + rnd() * 30; g.fillStyle = `rgb(${l + 30},${l + 14},${l})`; g.fillRect(x, y, w, 62); g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(x + w - 2, y, 2, 62); x += w; }
    g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect(0, y + 62, 1024, 2);
  }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "200,160,120" : "0,0,0"},${0.04 + rnd() * 0.08})`; g.fillRect(rnd() * 1024, rnd() * 1024, 1 + rnd() * 6, 1); }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(3, 3); t.rotation = Math.PI / 2;
  STAGE.map = t; STAGE.bumpMap = t; STAGE.bumpScale = 0.8; STAGE.color = new Color("#e0c8b0"); STAGE.needsUpdate = true;
  return STAGE;
};
const CURTAIN = new MeshStandardMaterial({ color: new Color("#4a1612"), roughness: 1 });
let curtainTex = false;
const curtainMat = () => { if (!curtainTex) { curtainTex = true; const m = grainTex("canvas", 512, 1); m.repeat.set(1, 6); CURTAIN.map = m; CURTAIN.bumpMap = m; CURTAIN.bumpScale = 1.5; CURTAIN.color = new Color("#7a2a22"); CURTAIN.needsUpdate = true; } return CURTAIN; };
const BULB = new MeshBasicMaterial({ color: new Color("#fff0cc").multiplyScalar(5), toneMapped: false, fog: false });
const poolTex = (() => {
  let tex: CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(255,236,200,1)"); r.addColorStop(0.45, "rgba(255,214,150,0.65)"); r.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    tex = new CanvasTexture(c);
    return tex;
  };
})();
/** Bright pool of spotlight on the stage floor (additive). */
export const LightPool: React.FC<{ r: number; strength?: number }> = ({ r, strength = 1.6 }) => {
  const mat = useMemo(() => new MeshBasicMaterial({ map: poolTex(), color: new Color("#ffe2b8").multiplyScalar(strength), transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false }), [strength]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -0.3]} material={mat} userData={{ noMask: true }}>
      <planeGeometry args={[r * 2.6, r * 2]} />
    </mesh>
  );
};

export const FaceOffSet: React.FC<{ t: number; foreman: Pose; ali: Pose; gap?: number }> = ({ t, foreman, ali, gap = 1.25 }) => (
  <group>
    <mesh position={[0, -0.25, 4]} material={stageMat()} receiveShadow>
      <boxGeometry args={[14, 0.5, 16]} />
    </mesh>
    {/* folded curtain behind */}
    {Array.from({ length: 18 }, (_, i) => (
      <mesh key={i} position={[(i - 8.5) * 0.9, 4, -3.4 + (i % 2) * 0.18]} rotation={[0, (i % 2 ? 0.35 : -0.35), 0]} material={curtainMat()} receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 9, 12, 1, false, 0, Math.PI]} />
      </mesh>
    ))}
    <mesh position={[0, 5.6, 0.2]} material={BULB} userData={{ noMask: true }}>
      <cylinderGeometry args={[0.6, 0.9, 0.25, 24]} />
    </mesh>
    <LightPool r={1.7} strength={0.75} />
    <Shafts from={[0, 5.5, 0.2]} tilt={0} len={5.8} width={1.1} count={3} color="#ffe2b0" opacity={0.14} t={t} />
    <Figure id={2} outline={INK.foe} pos={[-gap, 0, 0]} rotY={1.45} pose={foreman} look={{ ...BOXER_LOOK, scale: 1.16 }} t={t} />
    <Figure id={1} outline={INK.hero} pos={[gap, 0, 0]} rotY={-1.45} pose={ali} look={BOXER_LOOK} t={t} />
  </group>
);

// ---------------------------------------------------------------- night training camp
export const CAMP: Look = {
  key: { pos: [-6, 9, -20], color: "#8fa4d8", intensity: 1.2, shadow: { box: 9, at: [0, 0, -1], far: 70, bias: -0.0006 } },
  hemi: { sky: "#3a2a22", ground: "#0c0806", intensity: 0.4 },
  fill: { pos: [6, 5, 18], color: "#6a5a4a", intensity: 0.25 },
  fog: { color: "#1e140f", density: 0.028 },
  sky: { zenith: "#0b1022", horizon: "#24304e", ground: "#0b0b12", sunDir: [0, 0.3, -1], sunColor: "#cfd8ff", sunSize: 0.12, glow: 0.3, stars: 0.6 },
  exposure: 1.3,
  bloom: { strength: 0.42, radius: 0.55, threshold: 0.72 },
  grade: { shadow: "#1a1220", high: "#ffbf73", amount: 0.16, contrast: 0.3, vignette: 0.48, grain: 0.026 },
  outline: { width: 1, halo: 0.4, gain: 1.7 },
};
const PLANK = new MeshStandardMaterial({ color: new Color("#3a2a20"), roughness: 0.9 });
const FLOORW = new MeshStandardMaterial({ color: new Color("#241913"), roughness: 0.95 });
const MAT = new MeshStandardMaterial({ color: new Color("#b0a08a"), roughness: 0.95 });
let campTex = false;
const campMats = () => {
  if (!campTex) { campTex = true; const m = grainTex("canvas", 1024, 2); MAT.map = m; MAT.bumpMap = m; MAT.bumpScale = 0.6; MAT.needsUpdate = true; const d = grainTex("dirt", 1024, 10); FLOORW.map = d; FLOORW.bumpMap = d; FLOORW.color = new Color("#8a7060"); FLOORW.needsUpdate = true; }
};
const ROPE = new MeshStandardMaterial({ color: new Color("#d9d2c4"), roughness: 0.6, emissive: new Color("#3a2e26"), emissiveIntensity: 0.4 });
const POSTM = new MeshStandardMaterial({ color: new Color("#1a1414"), roughness: 0.8 });
const NIGHTWIN = new MeshBasicMaterial({ color: new Color("#ffffff"), toneMapped: true });
let winTex = false;
const nightWin = () => {
  if (winTex) return NIGHTWIN;
  winTex = true;
  const c = document.createElement("canvas");
  c.width = 640; c.height = 440;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, "#141a2a"); sky.addColorStop(0.65, "#2e3850"); sky.addColorStop(1, "#4a4a56");
  g.fillStyle = sky; g.fillRect(0, 0, 640, 440);
  let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(230,230,255,${0.3 + rnd() * 0.5})`; g.fillRect(rnd() * 640, rnd() * 220, 2, 2); }
  // haze band + distant tree line
  const hz = g.createLinearGradient(0, 250, 0, 440); hz.addColorStop(0, "rgba(120,120,140,0)"); hz.addColorStop(1, "rgba(120,116,130,0.45)");
  g.fillStyle = hz; g.fillRect(0, 250, 640, 190);
  g.fillStyle = "#0c0c12"; g.beginPath(); g.moveTo(0, 440);
  for (let x = 0; x <= 640; x += 16) g.lineTo(x, 360 - Math.abs(Math.sin(x * 0.05)) * 26 - rnd() * 14);
  g.lineTo(640, 440); g.fill();
  // palm against the sky
  g.strokeStyle = "#0c0c12"; g.lineWidth = 12; g.beginPath(); g.moveTo(470, 440); g.quadraticCurveTo(450, 280, 500, 150); g.stroke();
  g.lineWidth = 7; for (let k = 0; k < 7; k++) { const a = -2.9 + k * 0.5; g.beginPath(); g.moveTo(500, 150); g.quadraticCurveTo(500 + Math.cos(a) * 70, 150 + Math.sin(a) * 40 - 20, 500 + Math.cos(a) * 130, 150 + Math.sin(a) * 50 + 40); g.stroke(); }
  // grime / dust on the glass
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "200,180,150" : "0,0,0"},${0.03 + rnd() * 0.06})`; g.fillRect(rnd() * 640, rnd() * 440, 1 + rnd() * 3, 1 + rnd() * 3); }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
  NIGHTWIN.map = t; NIGHTWIN.color = new Color("#b8b8c4"); NIGHTWIN.needsUpdate = true;
  return NIGHTWIN;
};

export const CAMP_FLOOR = 0.5;
export const CampSet: React.FC<{ t: number; foreman: Pose; partner: Pose }> = ({ t, foreman, partner }) => {
  const H = 2.2;
  campMats();
  const corners: [number, number][] = [[-H, -H], [H, -H], [H, H], [-H, H]];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={FLOORW} receiveShadow><planeGeometry args={[40, 40]} /></mesh>
      {/* back wall with a night window */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[(i - 7.5) * 1.1, 3, -6]} material={PLANK} receiveShadow>
          <boxGeometry args={[1.06, 6, 0.2]} />
        </mesh>
      ))}
      <mesh position={[-3.2, 3.4, -5.88]} material={nightWin()} userData={{ noMask: true }}><planeGeometry args={[3.2, 2.2]} /></mesh>
      <mesh position={[-3.2, 3.4, -5.85]} material={POSTM}><boxGeometry args={[0.1, 2.2, 0.05]} /></mesh>
      <mesh position={[-3.2, 3.4, -5.85]} material={POSTM}><boxGeometry args={[3.2, 0.1, 0.05]} /></mesh>
      <Palm pos={[-4.2, 0, -12]} h={7} lean={[0.8, 0.2]} t={t} seed={3} />
      {/* heavy bag on the right */}
      <mesh position={[4.6, 2.2, -3.2]} material={POSTM} castShadow><cylinderGeometry args={[0.32, 0.32, 1.4, 16]} /></mesh>
      <mesh position={[4.6, 3.9, -3.2]} material={POSTM}><cylinderGeometry args={[0.015, 0.015, 2.0, 6]} /></mesh>
      {/* hanging bulb */}
      <mesh position={[0, 4.6, -0.6]} material={BULB} userData={{ noMask: true }}><sphereGeometry args={[0.16, 16, 12]} /></mesh>
      <mesh position={[0, 5.4, -0.6]} material={POSTM}><cylinderGeometry args={[0.01, 0.01, 1.5, 6]} /></mesh>
      <pointLight position={[0, 4.4, -0.6]} color="#ffc27a" intensity={60 * (1 + 0.05 * Math.sin(t * 9))} distance={18} decay={1.6} castShadow />
      <Shafts from={[0, 4.5, -0.6]} tilt={0} len={4.2} width={2} count={4} color="#ffcf8a" opacity={0.07} t={t} />
      {/* sparring ring */}
      <mesh position={[0, CAMP_FLOOR / 2, -0.6]} material={MAT} receiveShadow castShadow><boxGeometry args={[H * 2 + 0.4, CAMP_FLOOR, H * 2 + 0.4]} /></mesh>
      {corners.map(([x, z], i) => (
        <mesh key={i} position={[x, CAMP_FLOOR + 0.6, z - 0.6]} material={POSTM} castShadow><cylinderGeometry args={[0.06, 0.07, 1.2, 8]} /></mesh>
      ))}
      {corners.map(([x0, z0], i) => {
        const [x1, z1] = corners[(i + 1) % 4];
        const len = Math.hypot(x1 - x0, z1 - z0);
        const ry = Math.atan2(x1 - x0, z1 - z0);
        return [0.45, 0.9].map((h, j) => (
          <mesh key={`${i}-${j}`} position={[(x0 + x1) / 2, CAMP_FLOOR + h, (z0 + z1) / 2 - 0.6]} rotation={[Math.PI / 2, 0, -ry]} material={ROPE}>
            <cylinderGeometry args={[0.024, 0.024, len, 8]} />
          </mesh>
        ));
      })}
      <Figure id={2} outline={INK.foe} pos={[-0.7, CAMP_FLOOR, -0.6]} rotY={1.4} pose={foreman} look={{ ...BOXER_LOOK, scale: 1.16 }} t={t} />
      <Figure id={5} outline="#5a6a8a" pos={[0.75, CAMP_FLOOR, -0.75]} rotY={-1.5} pose={partner} look={{ ...BOXER_LOOK, scale: 1.08 }} t={t} />
    </group>
  );
};

// ---------------------------------------------------------------- rain
const RAIN_MAT = new MeshBasicMaterial({ color: new Color("#d8e2f0"), transparent: true, opacity: 0.32, depthWrite: false, fog: false });
const dummy = new Object3D();
/** Slanted rain streaks in a box around `center`, deterministic in t. `on` 0..1 sets density. */
export const Rain: React.FC<{ t: number; on: number; center?: V3; size?: [number, number, number]; count?: number }> = ({ t, on, center = [0, 0, 0], size = [24, 14, 24], count = 2200 }) => {
  const mesh = useMemo(() => {
    const m = new InstancedMesh(new BoxGeometry(0.014, 0.7, 0.014), RAIN_MAT, count);
    m.frustumCulled = false;
    m.userData.noMask = true;
    return m;
  }, [count]);
  useLayoutEffect(() => {
    const live = Math.floor(count * Math.min(1, Math.max(0, on)));
    for (let i = 0; i < count; i++) {
      const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12543.123, r3 = Math.sin(i * 39.425) * 24634.634;
      const fx = r1 - Math.floor(r1), fz = r2 - Math.floor(r2), fy = r3 - Math.floor(r3);
      const y = size[1] * (1 - ((fy + t * 1.6) % 1));
      dummy.position.set(center[0] + (fx - 0.5) * size[0] + (y - size[1] / 2) * 0.18, center[1] + y, center[2] + (fz - 0.5) * size[2]);
      dummy.rotation.set(0, 0, 0.18);
      dummy.scale.setScalar(i < live ? 1 : 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [mesh, t, on, count, center, size]);
  return <primitive object={mesh} />;
};

/** Satellite dish on a pole, for the "beamed to America" beat. */
export const Dish: React.FC<{ pos: V3; rotY?: number; height?: number }> = ({ pos, rotY = 0, height = 3 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Model id="comms-dish-7b129a" height={height} />
  </group>
);
