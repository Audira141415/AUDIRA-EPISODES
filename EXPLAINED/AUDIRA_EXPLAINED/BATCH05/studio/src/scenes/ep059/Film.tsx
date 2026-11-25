// AE-059 film (WORLDFORGE): the storm port of the cover, told as layers of defence.
// One world: Gerstner open sea breaking on the tetrapod breakwater, the calm basin, the quay and the
// moored container ship. The camera flies between them; every cut, beat and caption is read from
// timeline.json (Audio Master Clock). No audio in the composition.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import TL from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, FX_LAYER, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { mulberry32 } from "../../kits/worldforge/noise.ts";
import { Outro } from "../_shared/Outro.tsx";
import { Breakwater, OpenSea, SkyDome, plumeTexture, tetrapodGeometry, useStormEnvironment, BW_Z, DECK, HULL_L, QUAY_TOP, QUAY_X, STERN_V, BOW_V, type V3 } from "./world.tsx";
import { Bollards, Crane, LampMast, QuayStacks, Quay, Ship } from "./port.tsx";

// ── timeline ───────────────────────────────────────────────────────────────────
type Word = { w: string; s: number; e: number };
type Clip = { id: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
export const TOTAL = TL.total as number;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const clip = (id: string) => {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) throw new Error(`timeline: no clip ${id}`);
  return c;
};
const W = (id: string, word: string) => {
  const m = clip(id).words.find((x) => norm(x.w) === word);
  if (!m) throw new Error(`timeline: no word ${word} in ${id}`);
  return m.s;
};
const CS = (id: string) => clip(id).start;
const T = {
  luar: W("l01", "ombak"),
  inside: CS("l02"),
  tertambat: W("l02", "tertambat"),
  q: CS("l03"),
  kon: SEC.KONTEKS[0],
  bw: W("l04", "breakwater"),
  l05: CS("l05"),
  blok: W("l05", "blok"),
  tetra: W("l05", "tetrapod"),
  pecah: W("l05", "memecah"),
  jadi: W("l05", "jadi"),
  tenang: W("l05", "tenang"),
  mek: SEC.MEKANISME[0],
  diikat: W("l06", "diikat"),
  bollard: W("l06", "bollard"),
  tiap: W("l06", "tiap"),
  l07: CS("l07"),
  haluan: W("l07", "haluan"),
  buritan: W("l07", "buritan"),
  l08: CS("l08"),
  menjauh: W("l08", "menjauh"),
  spring: W("l08", "spring"),
  maju: W("l08", "maju"),
  l09: CS("l09"),
  fender: W("l09", "fender"),
  serap: W("l09", "menyerap"),
  benturan: W("l09", "benturan"),
  rev: SEC.REVEAL[0],
  l11: CS("l11"),
  pasang: W("l11", "pasang"),
  surut: W("l11", "surut"),
  muatan: W("l11", "muatan"),
  naik: W("l11", "naik"),
  setel: W("l11", "disetel"),
  pay: SEC.PAYOFF[0],
  tambah: W("l12", "ditambah"),
  tunda: W("l12", "tunda"),
  l13: CS("l13"),
  keluar: W("l13", "keluar"),
  l14: CS("l14"),
  putus: W("l14", "putus"),
  melecut: W("l14", "melecut"),
  out: SEC.OUTRO[0],
  berlapis: W("l15", "berlapis"),
  l16: CS("l16"),
};

// ── math ──────────────────────────────────────────────────────────────────────
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
const mix3 = (a: V3, b: V3, u: number): V3 => [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * ramp(t, a, b));
/** fade in over [a, a+f], out over [b-f, b] */
const win = (t: number, a: number, b: number, f = 0.25) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));

// ── port frame → world (same transform as the cover) ─────────────────────────
const PORT_YAW = (125 * Math.PI) / 180;
const C0: V3 = [2.5, 0, -136];
const PORT_AT: V3 = [0, 0, 50];
const YAXIS = new THREE.Vector3(0, 1, 0);
const P = (x: number, y: number, z: number): V3 => {
  const v = new THREE.Vector3(x - C0[0], y, z - C0[2]).applyAxisAngle(YAXIS, PORT_YAW);
  return [v.x + PORT_AT[0], v.y, v.z + PORT_AT[2]];
};

// ── ship hull: port-side x at a given v (distance from z = 0 toward the bow) ───
const CX = 2.5;
const BOW_PTS = (() => {
  const L = HULL_L, b = BOW_V;
  const p0 = [L, b - 40], p1 = [L, b - 16], p2 = [CX - 6, b - 2], p3 = [CX, b];
  const out: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const s = i / 64, a = (1 - s) ** 3, bb = 3 * (1 - s) ** 2 * s, c = 3 * (1 - s) * s * s, d = s ** 3;
    out.push([a * p0[0] + bb * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + bb * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
})();
const hullX = (v: number) => {
  if (v < STERN_V + 4) return HULL_L + ((STERN_V + 4 - v) / 4) * 1.2;
  if (v <= BOW_V - 40) return HULL_L;
  for (let i = 1; i < BOW_PTS.length; i++)
    if (BOW_PTS[i][1] >= v) {
      const [x0, v0] = BOW_PTS[i - 1], [x1, v1] = BOW_PTS[i];
      return mix(x0, x1, (v - v0) / Math.max(1e-6, v1 - v0));
    }
  return CX;
};

// ── ship motion (port frame offsets) ────────────────────────────────────────────
/** basin water level */
const waterAt = (t: number) => (t < T.l11 - 0.3 || t > T.pay ? 0 : 1.3 * sm(ramp(t, T.pasang - 0.15, T.surut + 0.3)) - 2.3 * sm(ramp(t, T.surut + 0.3, T.naik - 0.4)));
const cargoAt = (t: number) => (t < T.l11 - 0.3 || t > T.pay ? 0 : 0.8 * sm(ramp(t, T.muatan + 0.2, T.naik + 0.2)));
const motion = (t: number) => {
  let sx = 0.9 * bump(t, T.menjauh - 1.0, T.menjauh + 0.9) - 1.1 * bump(t, T.serap - 0.55, T.benturan + 0.75);
  if (t >= T.l09 && t < T.rev) sx += 4.5 * (1 - sm(ramp(t, T.l09 + 0.3, T.serap - 0.5)));
  if (t >= T.l13 && t < T.l14) sx += 26 * sm(ramp(t, T.keluar - 1.5, T.l14));
  const sz = t > T.spring && t < T.l09 ? 1.1 * Math.sin(2 * Math.PI * ramp(t, T.spring + 0.1, T.l09 - 0.1)) : 0;
  const hy = 0.15 * Math.sin(t * 0.9) + waterAt(t) + cargoAt(t);
  return { sx, sz, hy };
};

// ── mooring lines (port frame) ──────────────────────────────────────────────────
type Role = "head" | "stern" | "breast" | "spring";
type ML = { v: number; z: number; role: Role; color: string; extra?: boolean; snap?: boolean };
const O = "#d8742a", C = "#d9d0b8", B = "#3d86c9";
const LINES: ML[] = [
  { v: 64, z: -47, role: "stern", color: O },
  { v: 66, z: -47, role: "stern", color: C },
  { v: 78, z: -80.5, role: "breast", color: O },
  { v: 82, z: -80.5, role: "breast", color: C },
  { v: 96, z: -136, role: "spring", color: O },
  { v: 172, z: -132, role: "spring", color: C },
  { v: 186, z: -188, role: "breast", color: O },
  { v: 190, z: -188, role: "breast", color: C },
  { v: 200, z: -225.5, role: "head", color: O },
  { v: 201.5, z: -225.5, role: "head", color: C, snap: true },
  // storm: doubled up
  { v: 70, z: -54, role: "stern", color: B, extra: true },
  { v: 88, z: -89, role: "breast", color: B, extra: true },
  { v: 110, z: -150, role: "spring", color: B, extra: true },
  { v: 180, z: -180, role: "breast", color: B, extra: true },
  { v: 198, z: -220, role: "head", color: B, extra: true },
];
const BOLLARD_Z = [-47, -54, -80.5, -89, -132, -136, -150, -180, -188, -220, -225.5];
const FENDER_Z = [-50, -66, -82, -98, -114, -130, -148, -164, -178, -192, -206];
const ROLE_COLOR: Record<Role, string> = { head: "#ffb347", stern: "#ffb347", breast: "#7fe0ff", spring: "#b8ff7a" };
const bollardTop = (z: number): V3 => [QUAY_X - 1.6, QUAY_TOP + 1.45, z];
const fairleadAt = (v: number, m: { sx: number; sz: number; hy: number }): V3 => [hullX(v) - 0.15 + m.sx, (v >= 192 ? DECK + 2.4 : DECK - 0.6) + m.hy, -v + m.sz];
/** world-space sample points of a line (for 3D tube and HUD overlays) */
const linePoints = (l: ML, m: { sx: number; sz: number; hy: number }, slack: number, n = 24): V3[] => {
  const a = new THREE.Vector3(...fairleadAt(l.v, m));
  const b = new THREE.Vector3(...bollardTop(l.z));
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= 0.2 + a.distanceTo(b) * 0.006 + slack;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(n).map((p) => [p.x, p.y, p.z] as V3);
};

/** draw progress of each line (0 hidden → 1 tied) */
const lineDraw = (l: ML, i: number, t: number) => {
  if (t >= T.l14) return l.extra ? (t >= T.out ? 1 : 0) : 1; // snap shot + outro: all tied
  if (t >= T.l13 + 0.5) return 1 - sm(ramp(t, T.l13 + 0.5, T.l13 + 1.2)); // let go: ship leaves
  if (l.extra) return t < T.tambah - 0.3 ? 0 : sm(ramp(t, T.tambah - 0.3 + (i - 10) * 0.12, T.tambah + 0.3 + (i - 10) * 0.12));
  if (t < T.mek) return 1;
  return sm(ramp(t, T.diikat - 0.1 + i * 0.11, T.diikat + 0.45 + i * 0.11));
};
/** which roles are being explained right now (others dim) */
const focusRoles = (t: number): Role[] | null => {
  if (t >= T.l07 && t < T.l08) return ["head", "stern"];
  if (t >= T.l08 && t < T.spring - 0.2) return ["breast"];
  if (t >= T.spring - 0.2 && t < T.l09) return ["spring"];
  return null;
};
/** line slack during the tide beat: the ship drops, lines sag until the winch takes them in */
const slackAt = (t: number) => (t < T.l11 || t > T.pay ? 0 : sm(ramp(t, T.surut + 0.3, T.naik - 0.4)) * (1 - sm(ramp(t, T.setel - 0.7, T.setel + 0.1))));

// ── camera ────────────────────────────────────────────────────────────────────
type Cam = { pos: V3; tgt: V3; fov: number };
type Key = Cam & { t: number; e: "io" | "lin" };
const COVER: Cam = { pos: [-40, 85, 190], tgt: [20, -8, -110], fov: 80 };
const DIAG_T = P(-6, 0, -160);
const KEYS: Key[] = [
  // HOOK: the storm hits the armour (sea side), then cut inside: the ship holds still
  { t: 0, pos: [-112, 36, -222], tgt: [-44, 6, -300], fov: 50, e: "lin" },
  { t: T.inside - 0.08, pos: [-98, 31, -234], tgt: [-40, 6, -302], fov: 48, e: "lin" },
  { t: T.inside - 0.05, pos: P(-62, 30, -250), tgt: P(-4, 8, -180), fov: 55, e: "io" },
  { t: T.q - 0.1, pos: P(-92, 78, -254), tgt: P(110, -6, -40), fov: 74, e: "io" },
  { t: T.kon - 0.1, pos: P(-58, 34, -228), tgt: P(-14, 5, -194), fov: 50, e: "io" },
  // KONTEKS: fly out over the basin to the breakwater, down onto the tetrapods, up across the crest
  { t: T.bw - 0.5, pos: [-125, 62, -160], tgt: [-40, 4, -296], fov: 55, e: "lin" },
  { t: T.l05 - 0.1, pos: [-112, 56, -175], tgt: [-40, 4, -298], fov: 55, e: "io" },
  { t: T.l05 + 0.75, pos: [-54, 21, -264], tgt: [-42, 6.5, -292], fov: 50, e: "lin" },
  { t: T.pecah - 0.1, pos: [-48, 18, -270], tgt: [-41, 7.5, -292], fov: 50, e: "io" },
  { t: T.pecah + 0.9, pos: [-72, 60, -190], tgt: [-56, 0, -298], fov: 60, e: "lin" },
  { t: T.mek - 0.06, pos: [-54, 55, -196], tgt: [-46, 0, -300], fov: 60, e: "lin" },
  // MEKANISME: back at the quay (cut on "Di dermaga")
  { t: T.mek - 0.03, pos: P(-78, 56, -284), tgt: P(-10, 3, -175), fov: 50, e: "lin" },
  { t: T.tiap - 0.15, pos: P(-70, 52, -272), tgt: P(-10, 3, -172), fov: 50, e: "io" },
  { t: T.l07 - 0.1, pos: P(-100, 120, -300), tgt: DIAG_T, fov: 56, e: "lin" },
  { t: T.l08 - 0.15, pos: P(-106, 116, -288), tgt: DIAG_T, fov: 56, e: "io" },
  { t: T.l08 + 0.7, pos: P(-72, 52, -108), tgt: P(-8, 5, -82), fov: 55, e: "lin" },
  { t: T.spring - 0.3, pos: P(-66, 47, -98), tgt: P(-8, 5, -82), fov: 55, e: "io" },
  { t: T.spring + 0.5, pos: P(-118, 84, -150), tgt: P(-8, 3, -134), fov: 62, e: "lin" },
  { t: T.l09 - 0.1, pos: P(-112, 80, -142), tgt: P(-8, 3, -134), fov: 62, e: "io" },
  { t: T.l09 + 0.85, pos: P(-28, 23, -50), tgt: P(-14, 0.5, -82), fov: 46, e: "lin" },
  { t: T.rev - 0.06, pos: P(-27, 21, -55), tgt: P(-14, 0.5, -84), fov: 46, e: "lin" },
  // REVEAL: the winch, then astern along the quay for the tide
  { t: T.rev - 0.03, pos: P(-27, 20, -43), tgt: P(-7, 10, -63), fov: 50, e: "lin" },
  { t: T.l11 - 0.1, pos: P(-23, 18, -46), tgt: P(-7, 10, -64), fov: 50, e: "io" },
  { t: T.l11 + 0.7, pos: P(12, 12, -10), tgt: P(-13, 2.5, -58), fov: 58, e: "lin" },
  { t: T.pay - 0.15, pos: P(9, 12.5, -15), tgt: P(-13, 2.5, -59), fov: 58, e: "io" },
  // PAYOFF: storm wide, the tug, the way out, snap-back
  { t: T.pay + 0.8, pos: P(-84, 64, -254), tgt: P(80, -6, -80), fov: 70, e: "lin" },
  { t: T.tunda - 0.45, pos: P(-78, 58, -240), tgt: P(80, -6, -80), fov: 70, e: "lin" },
  { t: T.tunda - 0.42, pos: P(78, 27, -58), tgt: P(20, 4, -125), fov: 55, e: "lin" },
  { t: T.l13 - 0.1, pos: P(72, 25, -70), tgt: P(20, 4, -125), fov: 55, e: "io" },
  { t: T.l13 + 0.9, pos: P(-170, 170, -330), tgt: P(30, 0, -90), fov: 62, e: "lin" },
  { t: T.l14 - 0.06, pos: P(-160, 165, -318), tgt: P(36, 0, -84), fov: 62, e: "lin" },
  { t: T.l14 - 0.03, pos: P(-44, 17, -242), tgt: P(-14, 5, -217), fov: 55, e: "lin" },
  { t: T.out - 0.1, pos: P(-41, 15, -236), tgt: P(-14, 5, -217), fov: 55, e: "io" },
  // OUTRO: crane back up to the cover frame
  { t: T.out + 1.9, pos: COVER.pos, tgt: COVER.tgt, fov: 78, e: "lin" },
  { t: TOTAL, pos: [-34, 92, 202], tgt: COVER.tgt, fov: 80, e: "lin" },
];
const camAt = (t: number): Cam => {
  let i = 0;
  for (let k = 0; k < KEYS.length; k++) if (t >= KEYS[k].t) i = k;
  if (i >= KEYS.length - 1) return KEYS[KEYS.length - 1];
  const a = KEYS[i], b = KEYS[i + 1];
  const u = clamp01((t - a.t) / (b.t - a.t));
  const e = a.e === "io" ? eio(u) : u;
  return { pos: mix3(a.pos, b.pos, e), tgt: mix3(a.tgt, b.tgt, e), fov: mix(a.fov, b.fov, e) };
};
/** close-up fill light strength (0 = storm light only) */
const fillAt = (t: number) =>
  Math.max(
    win(t, T.l05, T.pecah + 0.6, 0.5) * 0.55,
    (1 - ramp(t, T.inside - 0.1, T.inside)) * 0.45,
    win(t, T.l09 + 0.3, T.rev, 0.4) * 1.0,
    win(t, T.rev, T.l11 + 0.4, 0.2) * 0.8,
    win(t, T.l11 + 0.2, T.pay, 0.4) * 0.45,
    win(t, T.tunda - 0.45, T.l13 + 0.5, 0.2) * 0.4,
    win(t, T.l14, T.out + 0.6, 0.2) * 0.9,
  );

const makeProjector = (cam: Cam) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.5, 9000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.tgt);
  c.updateMatrixWorld();
  return (p: V3) => {
    const v = new THREE.Vector3(...p).project(c);
    return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, front: v.z < 1 && v.z > -1 };
  };
};
type Proj = ReturnType<typeof makeProjector>;

// ── 3D: lights ────────────────────────────────────────────────────────────────
const Flood: React.FC<{ pos: V3; target: V3; color: string; intensity: number; angle: number }> = ({ pos, target, color, intensity, angle }) => {
  const { scene } = useThree();
  const l = useMemo(() => {
    const x = new THREE.SpotLight(color, intensity, 220, angle, 0.7, 2);
    x.position.set(...pos);
    x.target.position.set(...target);
    return x;
  }, [pos, target, color, intensity, angle]);
  useLayoutEffect(() => {
    scene.add(l, l.target);
    l.target.updateMatrixWorld();
    return () => {
      scene.remove(l, l.target);
    };
  }, [scene, l]);
  return null;
};

const FLOODS: { pos: V3; target: V3; i: number; a: number }[] = [
  { pos: P(-40, 30, -175), target: P(-8, 7, -195), i: 26000, a: 0.5 },
  { pos: P(-40, 30, -95), target: P(-8, 7, -115), i: 26000, a: 0.5 },
  { pos: P(-40, 24, -135), target: P(-12, 4, -150), i: 14000, a: 0.6 },
];

const Lights: React.FC<{ cam: Cam; fill: number }> = ({ cam, fill }) => {
  const { scene } = useThree();
  const { sun, key } = useMemo(() => {
    const l = new THREE.DirectionalLight("#d6dde3", 3.2);
    l.position.set(260, 300, 320);
    l.target.position.set(0, 0, 50);
    l.castShadow = true;
    const c = l.shadow.camera;
    c.left = -170;
    c.right = 170;
    c.top = 170;
    c.bottom = -170;
    c.near = 10;
    c.far = 900;
    l.shadow.mapSize.set(4096, 4096);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.04;
    const k = new THREE.SpotLight("#e4eef4", 0, 0, 0.55, 0.85, 2);
    return { sun: l, key: k };
  }, []);
  useLayoutEffect(() => {
    scene.add(sun, sun.target, key, key.target);
    return () => {
      scene.remove(sun, sun.target, key, key.target);
    };
  }, [scene, sun, key]);
  // camera-side key light for the close-ups: from above-left of the lens, aimed at the subject
  const d = Math.hypot(cam.pos[0] - cam.tgt[0], cam.pos[1] - cam.tgt[1], cam.pos[2] - cam.tgt[2]);
  key.position.set(cam.pos[0] + 4, cam.pos[1] + 8, cam.pos[2] + 2);
  key.target.position.set(...cam.tgt);
  key.target.updateMatrixWorld();
  key.intensity = fill * d * d * 2.6;
  return (
    <>
      <hemisphereLight args={["#6b7a86", "#151a1d", 0.75]} />
      <directionalLight color="#9fd8ff" intensity={2.4} position={[40, 60, -900]} />
      {FLOODS.map((f, i) => (
        <Flood key={i} pos={f.pos} target={f.target} color="#ffa04a" intensity={f.i} angle={f.a} />
      ))}
    </>
  );
};

// ── 3D: water ─────────────────────────────────────────────────────────────────
/** Calm basin with slowly drifting ripples (no fake mirrored spray), rising/falling with the tide. */
const FilmBasin: React.FC<{ t: number; level: number }> = ({ t, level }) => {
  const mat = useMemo(() => {
    const bump = surfaceGrain(159, 256, 0.25, 60).clone();
    bump.needsUpdate = true;
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(60, 28);
    return new THREE.MeshPhysicalMaterial({ color: "#0d1a1d", roughness: 0.09, metalness: 0, bumpMap: bump, bumpScale: 0.06, clearcoat: 0.4, clearcoatRoughness: 0.2 });
  }, []);
  mat.bumpMap!.offset.set(t * 0.004, t * 0.0025);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, -0.05 + level, 255]} material={mat} receiveShadow>
      <planeGeometry args={[2400, 1100]} />
    </mesh>
  );
};

// ── 3D: spray that actually breaks (billboards on the FX layer, yaw-facing the camera) ──
const BURSTS = [
  { x: -190, h: 48, w: 52, p: 3.9, ph: 0.3 },
  { x: -135, h: 74, w: 66, p: 4.4, ph: 1.7 },
  { x: -80, h: 52, w: 54, p: 3.6, ph: 0.9 },
  { x: -28, h: 88, w: 74, p: 4.1, ph: 2.6 },
  { x: 25, h: 58, w: 56, p: 3.7, ph: 0.1 },
  { x: 180, h: 70, w: 62, p: 4.3, ph: 2.1 },
  { x: 240, h: 50, w: 50, p: 3.8, ph: 1.2 },
  { x: 300, h: 64, w: 58, p: 4.0, ph: 3.0 },
];
const FilmSpray: React.FC<{ t: number; cam: Cam; storm: number; dim: number }> = ({ t, cam, storm, dim }) => {
  const parts = useMemo(() => {
    const g = new THREE.Group();
    const tex = [plumeTexture(11), plumeTexture(23), plumeTexture(37)];
    const geo = new THREE.PlaneGeometry(1, 1.5);
    geo.translate(0, 0.75, 0);
    const rnd = mulberry32(911);
    const items: { m: THREE.Mesh; mat: THREE.MeshBasicMaterial; b: (typeof BURSTS)[number]; k: number; sc: number; sy: number; flip: number; lag: number }[] = [];
    BURSTS.forEach((b, i) => {
      for (let k = 0; k < 4; k++) {
        const mat = new THREE.MeshBasicMaterial({ map: tex[(i + k) % 3], transparent: true, depthWrite: false, color: "#e6edf0", fog: true });
        const m = new THREE.Mesh(geo, mat);
        const sc = b.w * (0.75 + 0.35 * rnd()) * (k === 0 ? 1 : 0.6 + 0.1 * k);
        m.position.set(b.x + (rnd() - 0.5) * b.w * 0.7, 3, -(BW_Z + 2 + rnd() * 8));
        m.renderOrder = 5 + k;
        m.layers.set(FX_LAYER);
        g.add(m);
        items.push({ m, mat, b, k, sc, sy: (b.h / 1.5) * (k === 0 ? 1 : 0.5 + 0.12 * k), flip: rnd() < 0.5 ? -1 : 1, lag: k * 0.12 + rnd() * 0.1 });
      }
    });
    return { g, items };
  }, []);
  for (const it of parts.items) {
    const c = (((t - it.lag + it.b.ph) / it.b.p) % 1 + 1) % 1;
    const rise = sm(ramp(c, 0, 0.28));
    const fade = 1 - sm(ramp(c, 0.42, 0.98));
    const s = storm * (0.25 + 0.75 * rise);
    it.m.scale.set(it.sc * it.flip * (0.7 + 0.3 * rise) * storm, it.sy * s, 1);
    // billboards close to the lens wash the frame white: fade them by camera distance
    const dc = Math.hypot(cam.pos[0] - it.m.position.x, cam.pos[2] - it.m.position.z);
    const near = sm(ramp(dc, 50, 85));
    it.mat.opacity = Math.min(1, 0.15 + 0.95 * fade) * (0.35 + 0.65 * rise) * dim * near;
    it.m.visible = near > 0.01;
    it.m.rotation.set(0, Math.atan2(cam.pos[0] - it.m.position.x, cam.pos[2] - it.m.position.z), 0);
  }
  return <primitive object={parts.g} />;
};

/** Rain box that travels with the camera. */
const FilmRain: React.FC<{ t: number; cam: Cam; amount: number }> = ({ t, cam, amount }) => {
  const { lines, mat } = useMemo(() => {
    const rnd = mulberry32(4242);
    const n = 9000;
    const p = new Float32Array(n * 6);
    const c = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const x = (rnd() - 0.5) * 150, y = (rnd() - 0.5) * 70, z = (rnd() - 0.5) * 150;
      const len = 1.4 + rnd() * 1.6;
      p.set([x, y, z, x + 0.25 * len, y - len, z + 0.35 * len], i * 6);
      const b = 0.45 + rnd() * 0.4;
      c.set([b, b, b * 1.04, b * 0.3, b * 0.3, b * 0.32], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.08, depthWrite: false, fog: true });
    const l = new THREE.LineSegments(g, m);
    l.layers.set(FX_LAYER);
    l.frustumCulled = false;
    return { lines: l, mat: m };
  }, []);
  mat.opacity = 0.09 * amount;
  lines.position.set(cam.pos[0], cam.pos[1] - ((t * 14) % 6), cam.pos[2]);
  return <primitive object={lines} />;
};

// ── 3D: breakwater close-up props ─────────────────────────────────────────────
/** Rubble rocks on the harbour-side slope (the "tumpukan batu" under the armour). */
const Rubble: React.FC = () => {
  const mesh = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff", bumpMap: surfaceGrain(77, 256, 0.35, 2), bumpScale: 0.1 });
    const rnd = mulberry32(7171);
    const o = new THREE.Object3D();
    const ms: THREE.Matrix4[] = [];
    const cs: THREE.Color[] = [];
    for (let x = -150; x < 66; x += 1.7)
      for (let r = 0; r < 5; r++) {
        const u = BW_Z - 4.5 - r * 2.0 - rnd() * 0.8;
        const y = 6 - (BW_Z - 4 - u) + 0.3;
        if (y < -1.5) continue;
        o.position.set(x + (rnd() - 0.5) * 1.4, y, -u);
        o.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
        const s = 0.7 + rnd() * 0.8;
        o.scale.set(s * (0.8 + rnd() * 0.5), s * (0.6 + rnd() * 0.3), s * (0.8 + rnd() * 0.5));
        o.updateMatrix();
        ms.push(o.matrix.clone());
        const g = 0.12 + rnd() * 0.08;
        cs.push(new THREE.Color(g * 1.02, g, g * 0.94));
      }
    const m = new THREE.InstancedMesh(geo, mat, ms.length);
    ms.forEach((mm, i) => {
      m.setMatrixAt(i, mm);
      m.setColorAt(i, cs[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
};

const HERO_AT: V3 = [-42, 8.9, -291.5];
/** One tetrapod lowered into the armour so a single unit reads: four blunt legs from one core. */
const HeroTetrapod: React.FC<{ t: number }> = ({ t }) => {
  const { geo, mat, cable, q } = useMemo(() => {
    const g = tetrapodGeometry();
    const m = new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#b9b6ae", roughness: 0.8, bumpMap: surfaceGrain(18, 256, 0.3, 2), bumpScale: 0.08 });
    const c = new THREE.MeshStandardMaterial({ color: "#1a1c1e", roughness: 0.5, metalness: 0.6 });
    const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 1, 0));
    qq.premultiply(new THREE.Quaternion().setFromAxisAngle(YAXIS, 0.5));
    return { geo: g, mat: m, cable: c, q: qq };
  }, []);
  const u = sm(ramp(t, T.blok - 0.3, T.tetra - 0.05));
  const y = mix(HERO_AT[1] + 26, HERO_AT[1], u);
  const sway = (1 - u) * 0.4 * Math.sin(t * 2.2);
  const top = y + 1.8 * 1.6;
  const cableOn = t < T.tetra + 0.5;
  if (t < T.blok - 0.35) return null;
  return (
    <group>
      <mesh geometry={geo} material={mat} position={[HERO_AT[0] + sway, y, HERO_AT[2]]} quaternion={q} scale={1.8} castShadow receiveShadow />
      {cableOn && (
        <mesh material={cable} position={[HERO_AT[0] + sway * 0.5, top + 30, HERO_AT[2]]}>
          <cylinderGeometry args={[0.07, 0.07, 60, 6]} />
        </mesh>
      )}
    </group>
  );
};

// ── 3D: port-frame props ───────────────────────────────────────────────────────
const FilmFenders: React.FC<{ sx: number }> = ({ sx }) => {
  const rubber = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0d0e0f", roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.5 }), []);
  const panel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9a51c", roughness: 0.45, metalness: 0.3 }), []);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c99a1c", roughness: 0.5 }), []);
  const gap0 = HULL_L - QUAY_X;
  const gap = gap0 + Math.min(0, sx);
  const squash = gap / gap0;
  const bulge = 1 + 0.45 * (1 - squash);
  return (
    <>
      {FENDER_Z.map((z) => (
        <group key={z} position={[QUAY_X, 2.2, z]}>
          <mesh material={rubber} rotation={[0, 0, Math.PI / 2]} position={[gap * 0.42, 0, 0]} scale={[bulge, 1, bulge]} castShadow receiveShadow>
            <cylinderGeometry args={[1.35, 1.6, gap * 0.84, 28]} />
          </mesh>
          <mesh material={panel} position={[gap - 0.28, 0, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.42, 4.2, 3.2]} radius={0.1} />
          </mesh>
          <mesh material={edge} position={[gap - 0.28, 2.15, 0]}>
            <boxGeometry args={[0.44, 0.16, 3.22]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

const lineMat = (c: string) => new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: c, roughness: 0.75, emissive: new THREE.Color(c), emissiveIntensity: 0 });

/** Mooring lines as tubes; drawn from the ship toward the bollard; dimmed when not being explained. */
const FilmLines: React.FC<{ t: number; m: { sx: number; sz: number; hy: number }; slack: number }> = ({ t, m, slack }) => {
  const mats = useMemo(() => LINES.map((l) => lineMat(l.color)), []);
  const focus = focusRoles(t);
  const geos = useMemo(
    () =>
      LINES.map((l) => {
        const pts = linePoints(l, m, slack * (l.role === "stern" || l.role === "breast" ? 2.2 : 1.4), 40).map((p) => new THREE.Vector3(...p));
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, l.extra ? 0.28 : 0.24, 8, false);
      }),
    [m, slack],
  );
  useLayoutEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  return (
    <>
      {LINES.map((l, i) => {
        if (l.snap && t >= T.putus && t < T.out) return null;
        const d = lineDraw(l, i, t);
        if (d <= 0.001) return null;
        const g = geos[i];
        g.setDrawRange(0, Math.max(6, Math.floor(d * 40) * 8 * 6));
        const mt = mats[i];
        const on = !focus || focus.includes(l.role);
        mt.color.set(on ? l.color : "#3a3d40");
        mt.emissive.set(on && focus ? ROLE_COLOR[l.role] : l.color);
        mt.emissiveIntensity = on && focus ? 0.55 : slack > 0.2 && (l.role === "stern" || l.role === "breast") ? 0.0 : 0.04;
        return <mesh key={i} geometry={g} material={mt} castShadow />;
      })}
    </>
  );
};

/** Head line that parts and whips back along its own lead. */
const SnapLine: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => lineMat(C), []);
  const l = LINES.find((x) => x.snap)!;
  const geos = useMemo(() => {
    if (t < T.putus || t >= T.out) return [];
    const base = linePoints(l, { sx: 0, sz: 0, hy: 0.15 * Math.sin(t * 0.9) }, 0, 24).map((p) => new THREE.Vector3(...p));
    const A = base[0], Bp = base[base.length - 1], M = base[12];
    const dir = Bp.clone().sub(A).setY(0).normalize();
    const lat = new THREE.Vector3(-dir.z, 0, dir.x);
    const u = ramp(t, T.putus, T.putus + 0.55);
    const e = 1 - Math.pow(1 - u, 3);
    const out: THREE.TubeGeometry[] = [];
    for (const [anchor, sign] of [
      [Bp, 1],
      [A, -1],
    ] as [THREE.Vector3, number][]) {
      // free end: from the break point, flies past its anchor and lands beyond it
      const land = anchor.clone().addScaledVector(dir, sign * 15).setY(sign > 0 ? QUAY_TOP + 0.2 : anchor.y - 1.5);
      const free = M.clone().lerp(land, e);
      free.y += Math.sin(Math.PI * e) * 4;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 10; k++) {
        const s = k / 10;
        const p = anchor.clone().lerp(free, s);
        p.addScaledVector(lat, Math.sin(s * Math.PI * 2.2 + u * 9) * s * 3.2 * (1 - u * 0.7) * sign);
        p.y += Math.sin(s * Math.PI) * 1.2 * (1 - e);
        pts.push(p);
      }
      out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.24, 8, false));
    }
    return out;
  }, [t, l]);
  useLayoutEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} castShadow />
      ))}
    </>
  );
};

/** Snap-back danger zone on the quay around the head-line bollard. */
const DangerZone: React.FC<{ a: number; t: number }> = ({ a, t }) => {
  const { geo, ring, mat, edge } = useMemo(() => {
    const l = LINES.find((x) => x.snap)!;
    const pts = linePoints(l, { sx: 0, sz: 0, hy: 0 }, 0, 4);
    const A = pts[0], Bp = pts[pts.length - 1];
    const dx = Bp[0] - A[0], dz = Bp[2] - A[2];
    const th = Math.atan2(-dz, dx);
    const span = (110 * Math.PI) / 180;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    x.fillStyle = "#ff2a1a";
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = "#6b0d06";
    for (let i = -128; i < 256; i += 32) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + 16, 0);
      x.lineTo(i + 16 + 128, 128);
      x.lineTo(i + 128, 128);
      x.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    const g = new THREE.CircleGeometry(17, 48, th - span / 2, span);
    const r = new THREE.RingGeometry(16.6, 17.2, 48, 1, th - span / 2, span);
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide });
    const em = new THREE.MeshBasicMaterial({ color: "#ff3b2a", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    return { geo: g, ring: r, mat: m, edge: em };
  }, []);
  const pulse = 0.8 + 0.2 * Math.sin(t * 9);
  mat.opacity = a * 0.42 * pulse;
  edge.opacity = a * 0.95;
  if (a <= 0) return null;
  const b = bollardTop(-225.5);
  return (
    <group position={[b[0], QUAY_TOP + 0.06, b[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo} material={mat} layers={FX_LAYER} />
      <mesh geometry={ring} material={edge} layers={FX_LAYER} />
    </group>
  );
};

/** Mooring winch on the stern deck: drum with the line wrapped on it. */
const Winch: React.FC<{ t: number; hy: number }> = ({ t, hy }) => {
  const m = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const x = c.getContext("2d")!;
    x.fillStyle = "#d8742a";
    x.fillRect(0, 0, 256, 64);
    x.strokeStyle = "rgba(60,25,5,0.55)";
    x.lineWidth = 3;
    for (let i = -64; i < 320; i += 10) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + 18, 64);
      x.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return {
      rope: new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: "#ffffff", map: tex }),
      red: new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#8e2a1f" }),
      grey: new THREE.MeshStandardMaterial({ color: "#3d4447", roughness: 0.5, metalness: 0.5 }),
      line: new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: O }),
    };
  }, []);
  const turn = 3.0 * sm(ramp(t, T.rev + 0.4, T.l11 + 0.4)) - 2.2 * sm(ramp(t, T.setel - 0.4, T.setel + 0.8));
  const at: V3 = [-6.2, DECK + hy, -63.5];
  const lead = useMemo(() => {
    const a = new THREE.Vector3(at[0] - 1.6, at[1] + 1.6, at[2]);
    const f = new THREE.Vector3(...fairleadAt(64, { sx: 0, sz: 0, hy }));
    return new THREE.TubeGeometry(new THREE.LineCurve3(a, f), 4, 0.24, 8, false);
  }, [hy]);
  useLayoutEffect(() => () => lead.dispose(), [lead]);
  return (
    <group>
      <group position={at}>
        <mesh material={m.grey} position={[0, 0.4, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[5.2, 0.8, 3.2]} radius={0.12} />
        </mesh>
        {[-2.1, 2.1].map((x) => (
          <mesh key={x} material={m.red} position={[x, 1.6, 0]} castShadow>
            <RoundedBoxGeo args={[0.5, 2.6, 2.4]} radius={0.15} />
          </mesh>
        ))}
        <group position={[0, 1.6, 0]} rotation={[turn, 0, 0]}>
          <mesh material={m.rope} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[1.05, 1.05, 3.4, 32]} />
          </mesh>
          {[-1.8, 1.8].map((x) => (
            <mesh key={x} material={m.red} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.45, 1.45, 0.2, 32]} />
            </mesh>
          ))}
        </group>
        <mesh material={m.red} position={[2.9, 1.2, 0]} castShadow>
          <RoundedBoxGeo args={[1.4, 1.8, 1.8]} radius={0.2} />
        </mesh>
      </group>
      <mesh geometry={lead} material={m.line} castShadow />
    </group>
  );
};

/** Harbour tug: short, beamy, push-bow lined with tyre fenders. Built bow toward −x. */
const Tug: React.FC<{ pos: V3; yaw: number }> = ({ pos, yaw }) => {
  const m = useMemo(
    () => ({
      hull: new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#9b2a1e", roughness: 0.4 }),
      black: new THREE.MeshPhysicalMaterial({ color: "#141516", roughness: 0.8 }),
      white: new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#e6e4dc" }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#0b1116", roughness: 0.1, metalness: 0.3 }),
      yellow: new THREE.MeshStandardMaterial({ color: "#e0a81c", roughness: 0.5 }),
      lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd27a").multiplyScalar(3), toneMapped: false }),
    }),
    [],
  );
  const hullGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(13, -5);
    s.lineTo(-8, -5);
    s.quadraticCurveTo(-14, -4.5, -14.5, 0);
    s.quadraticCurveTo(-14, 4.5, -8, 5);
    s.lineTo(13, 5);
    s.quadraticCurveTo(14.5, 0, 13, -5);
    const g = new THREE.ExtrudeGeometry(s, { depth: 4.2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -2.2, 0);
    return g;
  }, []);
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh geometry={hullGeo} material={m.hull} castShadow receiveShadow />
      <mesh material={m.black} position={[0, 1.2, 0]}>
        <boxGeometry args={[26, 0.6, 10.4]} />
      </mesh>
      {/* tyre fenders around the push bow */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = -1.1 + (i / 8) * 2.2;
        return (
          <mesh key={i} material={m.black} position={[-14.2 * Math.cos(a) + 0.6, 0.6, 4.7 * Math.sin(a)]} rotation={[0, a, Math.PI / 2]}>
            <torusGeometry args={[0.75, 0.32, 8, 16]} />
          </mesh>
        );
      })}
      {/* deckhouse + wheelhouse */}
      <mesh material={m.white} position={[-1, 3.6, 0]} castShadow>
        <RoundedBoxGeo args={[10, 3.6, 7]} radius={0.35} />
      </mesh>
      <mesh material={m.white} position={[-2.5, 6.6, 0]} castShadow>
        <RoundedBoxGeo args={[6, 2.6, 7.6]} radius={0.3} />
      </mesh>
      <mesh material={m.glass} position={[-5.55, 6.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7, 1.3]} />
      </mesh>
      <mesh material={m.yellow} position={[3.5, 7.2, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 4.2, 16]} />
      </mesh>
      <mesh material={m.black} position={[-2.5, 10, 0]}>
        <boxGeometry args={[0.3, 4.2, 0.3]} />
      </mesh>
      <mesh material={m.lamp} position={[-2.5, 12.2, 0]}>
        <sphereGeometry args={[0.35, 10, 8]} />
      </mesh>
      {/* towing bitt aft */}
      <mesh material={m.black} position={[9, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.4, 14]} />
      </mesh>
    </group>
  );
};
const tugAt = (t: number) => {
  const arrive = sm(ramp(t, T.pay, T.tunda + 0.5));
  let x = mix(240, 32, arrive), yaw = 0;
  const z = -122;
  if (t >= T.l13 && t < T.l14) {
    yaw = Math.PI * sm(ramp(t, T.l13, T.l13 + 1.4));
    x += 9 * sm(ramp(t, T.l13 + 0.6, T.l14)) + motion(t).sx;
  }
  return { pos: [x, 0, z] as V3, yaw, on: t >= T.pay - 0.2 };
};

/** Container being lifted off the ship by the quay crane (the "muatan dibongkar" beat). */
const CRANE_Z = -98.9;
const LiftBox: React.FC<{ t: number; hy: number }> = ({ t, hy }) => {
  const m = useMemo(
    () => ({ box: new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#a8552a", roughness: 0.5 }), cable: new THREE.MeshStandardMaterial({ color: "#1a1c1e", roughness: 0.5 }), spreader: new THREE.MeshStandardMaterial({ color: "#d9a51c", roughness: 0.5 }) }),
    [],
  );
  const u = sm(ramp(t, T.muatan - 0.1, T.naik));
  const v = sm(ramp(t, T.naik - 0.2, T.setel + 0.4));
  const y = mix(DECK + 2.9 + 6 * 2.62 + hy, 35, u);
  const x = mix(-9.0, -30, v);
  const cableLen = QUAY_TOP + 38 - (y + 1.6);
  return (
    <group position={[x, y, CRANE_Z]}>
      <mesh material={m.box} castShadow>
        <RoundedBoxGeo args={[2.44, 2.59, 12.19]} radius={0.08} />
      </mesh>
      <mesh material={m.spreader} position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.6, 0.4, 12.4]} />
      </mesh>
      {[-3, 3].map((dz) => (
        <mesh key={dz} material={m.cable} position={[0, 1.7 + cableLen / 2, dz]}>
          <cylinderGeometry args={[0.06, 0.06, cableLen, 6]} />
        </mesh>
      ))}
    </group>
  );
};

const PortSpace: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <group position={PORT_AT} rotation={[0, PORT_YAW, 0]}>
    <group position={[-C0[0], 0, -C0[2]]}>{children}</group>
  </group>
);

/** Tide board on the quay face near the stern: striped scale plus a bright waterline marker. */
const GAUGE_Z = -43;
const TideGauge: React.FC<{ level: number }> = ({ level }) => {
  const { board, mark } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const x = c.getContext("2d")!;
    for (let i = 0; i < 16; i++) {
      x.fillStyle = i % 2 ? "#f2efe6" : "#c8321f";
      x.fillRect(0, i * 32, 64, 32);
    }
    x.fillStyle = "#111";
    x.fillRect(0, 0, 6, 512);
    x.fillRect(58, 0, 6, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      board: new THREE.MeshBasicMaterial({ map: tex, color: "#a9a49a", fog: false }),
      mark: new THREE.MeshBasicMaterial({ color: new THREE.Color("#8fe1ff").multiplyScalar(2), toneMapped: false }),
    };
  }, []);
  return (
    <group position={[QUAY_X + 0.08, 0, GAUGE_Z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh material={board} position={[0, -0.25, 0]}>
        <planeGeometry args={[1.8, 8]} />
      </mesh>
      <mesh material={mark} position={[0, level + 0.02, 0.05]}>
        <boxGeometry args={[2.6, 0.18, 0.1]} />
      </mesh>
    </group>
  );
};

// ── the scene ─────────────────────────────────────────────────────────────────
const Scene: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  useStormEnvironment(0.9);
  const cam = camAt(t);
  const dist = Math.hypot(cam.pos[0] - cam.tgt[0], cam.pos[1] - cam.tgt[1], cam.pos[2] - cam.tgt[2]);
  const shot: Shot = { pos: cam.pos, target: cam.tgt, fov: cam.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1.3 };
  const mo = motion(t);
  const slack = slackAt(t);
  const storm = 1 + 0.35 * ramp(t, T.pay, T.pay + 1.2) * (1 - ramp(t, T.out, T.out + 1.5));
  const tug = tugAt(t);
  const zone = t >= T.l14 && t < T.out + 0.2 ? sm(ramp(t, T.melecut - 0.1, T.melecut + 0.4)) : 0;
  const wl = waterAt(t);
  const fenderLamp = win(t, T.l09 + 0.3, T.rev, 0.3);
  return (
    <>
      <CameraRig shot={shot} near={0.5} far={9000} />
      <fogExp2 attach="fog" args={["#2a3439", 0.00085]} />
      <Lights cam={cam} fill={fillAt(t)} />
      <SkyDome t={40 + t} />
      <OpenSea t={40 + t} />
      <FilmBasin t={t} level={wl} />
      <Breakwater />
      <Rubble />
      <HeroTetrapod t={t} />
      <FilmSpray t={40 + t} cam={cam} storm={storm} dim={t < T.inside ? 0.7 : 1} />
      <PortSpace>
        <Quay />
        <Bollards zs={BOLLARD_Z} big={[-225.5, -188]} />
        <FilmFenders sx={mo.sx} />
        <TideGauge level={wl} />
        <pointLight color="#ffa04a" intensity={fenderLamp * 5200} distance={60} decay={2} position={[-24, 9, -58]} />
        <group position={[mo.sx, 0, mo.sz]}>
          <Ship heave={mo.hy} detail />
          <Winch t={t} hy={mo.hy} />
          <LiftBox t={t} hy={mo.hy} />
        </group>
        <FilmLines t={t} m={mo} slack={slack} />
        <SnapLine t={t} />
        <DangerZone a={zone} t={t} />
        {t > T.rev && t < T.pay && <Crane z={CRANE_Z} />}
        {tug.on && <Tug pos={tug.pos} yaw={tug.yaw} />}
        {[-58, -118, -178, -238].map((z) => (
          <LampMast key={z} pos={[-34, 3.5, z]} h={18} />
        ))}
        <QuayStacks />
      </PortSpace>
      <FilmRain t={t} cam={cam} amount={storm * storm} />
      <Finish frame={frame} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1.3} envIntensity={0} aoRadius={0.6} focus={dist} aperture={0.0002} maxBlur={0.004} />
    </>
  );
};

// ── HUD ───────────────────────────────────────────────────────────────────────
const CREAM = "#f2e8d6", AMBER = "#e8b46a", CYAN = "#8fe1ff", RED = "#ff4a3a";
const inFrame = (p: { x: number; y: number; front: boolean }) => p.front && p.x > -40 && p.x < 1120 && p.y > 150 && p.y < 1560;

const Tag: React.FC<{ pj: Proj; at: V3; label: string; sub?: string; dx: number; dy: number; a: number; color?: string; big?: boolean }> = ({ pj, at, label, sub, dx, dy, a, color = CREAM, big = false }) => {
  if (a <= 0.001) return null;
  const p = pj(at);
  if (!inFrame(p)) return null;
  const left = dx >= 0;
  const bw = (Math.max(label.length * 27, (sub?.length ?? 0) * 15) + 48) * (big ? 1.4 : 1);
  let lx = p.x + dx;
  if (left) lx = Math.min(lx, 1036 - bw);
  else lx = Math.max(lx, 44 + bw);
  const ly = Math.min(1440, Math.max(430, p.y + dy));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={p.x} y1={p.y} x2={lx} y2={ly} stroke={color} strokeOpacity={0.8} strokeWidth={2.5} />
        <circle cx={p.x} cy={p.y} r={8 + 4 * (1 - a)} fill="none" stroke={color} strokeWidth={2.5} />
        <circle cx={p.x} cy={p.y} r={3} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: left ? lx + 10 : undefined,
          right: left ? undefined : 1080 - lx + 10,
          top: ly - 26,
          fontFamily: FONT,
          color: CREAM,
          background: big ? "rgba(5,8,10,0.88)" : "rgba(8,12,15,0.62)",
          borderLeft: left ? `4px solid ${color}` : undefined,
          borderRight: left ? undefined : `4px solid ${color}`,
          padding: big ? "12px 22px" : "8px 14px",
          borderRadius: big ? 999 : 4,
          whiteSpace: "nowrap",
          textAlign: left ? "left" : "right",
          transform: `translateY(${(1 - a) * 10}px)`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: big ? 50 : 36, letterSpacing: "0.14em", color: big ? color : CREAM }}>{label}</div>
        {sub && <div style={{ fontWeight: 500, fontSize: big ? 34 : 29, letterSpacing: "0.02em", color: "rgba(242,232,214,0.82)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Projected polyline drawn on progressively (role highlight over a 3D line). */
const PathHud: React.FC<{ pj: Proj; pts: V3[]; color: string; prog: number; a: number; width?: number; dash?: string }> = ({ pj, pts, color, prog, a, width = 7, dash }) => {
  if (a <= 0.001 || prog <= 0) return null;
  const sp = pts.map(pj);
  if (sp.some((p) => !p.front)) return null;
  const n = Math.max(2, Math.ceil(prog * sp.length));
  const d = sp
    .slice(0, n)
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={width * 2.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
    </svg>
  );
};

/** Screen-space force arrow between two world points. */
const Arrow: React.FC<{ pj: Proj; from: V3; to: V3; color: string; a: number; width?: number; cross?: number; both?: boolean }> = ({ pj, from, to, color, a, width = 10, cross = 0, both }) => {
  if (a <= 0.001) return null;
  const p = pj(from), q = pj(to);
  if (!p.front || !q.front) return null;
  const ang = Math.atan2(q.y - p.y, q.x - p.x);
  const len = Math.hypot(q.x - p.x, q.y - p.y) * a;
  const ex = p.x + Math.cos(ang) * len, ey = p.y + Math.sin(ang) * len;
  const hs = width * 2.6;
  const head = (x: number, y: number, an: number) =>
    `M${x + Math.cos(an) * hs},${y + Math.sin(an) * hs} L${x + Math.cos(an + 2.5) * hs},${y + Math.sin(an + 2.5) * hs} L${x + Math.cos(an - 2.5) * hs},${y + Math.sin(an - 2.5) * hs} Z`;
  const mx = (p.x + ex) / 2, my = (p.y + ey) / 2;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, a * 2) }}>
      <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke="rgba(0,0,0,0.5)" strokeWidth={width + 6} strokeLinecap="round" />
      <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path d={head(ex, ey, ang)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
      {both && <path d={head(p.x, p.y, ang + Math.PI)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />}
      {cross > 0 && (
        <g opacity={cross} stroke="#ffffff" strokeWidth={9} strokeLinecap="round">
          <line x1={mx - 26} y1={my - 26} x2={mx + 26} y2={my + 26} />
          <line x1={mx + 26} y1={my - 26} x2={mx - 26} y2={my + 26} />
        </g>
      )}
    </svg>
  );
};

const Kicker: React.FC<{ t: number }> = ({ t }) => {
  const items: [number, number, string, string][] = [
    [T.kon, T.mek, "LAPIS 1", "Breakwater"],
    [T.mek, T.l09, "LAPIS 2", "Tali tambat"],
    [T.l09, T.rev, "LAPIS 3", "Fender"],
    [T.rev, T.pay, "LAPIS 4", "Tali disetel ulang"],
    [T.pay, T.out, "SAAT BADAI", "Pengamanan ekstra"],
  ];
  const it = items.find(([a, b]) => t >= a && t < b);
  if (!it) return null;
  const a = win(t, it[0], it[1], 0.3);
  return (
    <div style={{ position: "absolute", left: 64, top: 266, opacity: a, transform: `translateX(${(1 - a) * -20}px)`, fontFamily: FONT }}>
      <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: "0.32em", color: AMBER }}>{it[2]}</div>
      <div style={{ fontWeight: 600, fontSize: 52, color: CREAM, marginTop: 6, textShadow: "0 3px 18px rgba(0,0,0,0.75)" }}>{it[3]}</div>
    </div>
  );
};

const OutroLayers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.out || t > OUTRO_AT + 0.5) return null;
  const rows = ["Breakwater", "Tali tambat", "Fender karet", "Tali disetel ulang", "Kapal tunda siaga"];
  const fadeAll = 1 - ramp(t, OUTRO_AT - 0.3, OUTRO_AT + 0.3);
  return (
    <div style={{ position: "absolute", left: 64, top: 266, fontFamily: FONT, opacity: fadeAll }}>
      <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: "0.32em", color: AMBER, opacity: ramp(t, T.out, T.out + 0.3) }}>DIJAGA BERLAPIS</div>
      {rows.map((r, i) => {
        const a = sm(ramp(t, T.out + 0.25 + i * 0.32, T.out + 0.55 + i * 0.32));
        return (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: a, transform: `translateX(${(1 - a) * -24}px)` }}>
            <div style={{ width: 46, height: 46, borderRadius: 6, background: "rgba(8,12,15,0.7)", border: `2px solid ${CYAN}`, color: CYAN, fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ fontWeight: 600, fontSize: 44, color: CREAM, textShadow: "0 3px 16px rgba(0,0,0,0.8)" }}>{r}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 34, fontWeight: 700, fontSize: 30, letterSpacing: "0.3em", color: CREAM, opacity: sm(ramp(t, T.l16 + 0.3, T.l16 + 0.7)) }}>AUDIRA EXPLAINED</div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t);
  const pj = makeProjector(cam);
  const mo = motion(t);
  const slack = slackAt(t);
  const roleLines = (r: Role, extra = false) => LINES.filter((l) => l.role === r && !!l.extra === extra);
  const fade = (a: number, b: number, f = 0.25) => win(t, a, b, f);
  const tug = tugAt(t);
  const hullMid: V3 = P(-11.5 + mo.sx, 13 + mo.hy, -82 + mo.sz);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* HOOK */}
      <Tag pj={pj} at={[-60, 8, -294]} label="DI LUAR" sub="ombak badai" dx={60} dy={-300} a={fade(T.luar - 0.25, T.inside - 0.05, 0.15)} color={RED} big />
      <Tag pj={pj} at={[-60, 9, -292]} label="DI LUAR" sub="ombak badai" dx={60} dy={-120} a={fade(T.tertambat - 0.3, T.kon - 0.2)} color={RED} big />
      <Tag pj={pj} at={P(2.5, 22, -140)} label="DI DALAM" sub="kapal tetap tertambat" dx={-60} dy={160} a={fade(T.inside + 0.1, T.kon - 0.2)} color={CYAN} big />
      {t >= T.q - 0.1 && t < T.kon && (() => {
        const p = pj(P(-14, 6.5, -190));
        const a = win(t, T.q, T.kon, 0.2);
        return p.front ? (
          <div style={{ position: "absolute", left: p.x - 70, top: p.y - 70, width: 140, height: 140, opacity: a, borderRadius: 70, border: `5px solid ${AMBER}`, transform: `scale(${1 + 0.08 * Math.sin(t * 8)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 700, fontSize: 88, color: AMBER, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>
            ?
          </div>
        ) : null;
      })()}

      {/* KONTEKS */}
      <Tag pj={pj} at={[-40, 9, -292]} label="BREAKWATER" sub="pemecah gelombang" dx={-40} dy={-170} a={fade(T.bw - 0.1, T.l05 + 0.4)} color={AMBER} />
      <Tag pj={pj} at={[-32, 2.5, -278]} label="BATU" sub="tumpukan di inti" dx={-120} dy={120} a={fade(T.l05 + 0.4, T.pecah + 0.3)} />
      <Tag pj={pj} at={[HERO_AT[0], HERO_AT[1] + 1.2, HERO_AT[2]]} label="TETRAPOD" sub="blok beton 4 kaki" dx={110} dy={-170} a={fade(T.blok, T.pecah + 0.3)} color={AMBER} />
      <Arrow pj={pj} from={[-54, 4, -360]} to={[-54, 7, -300]} color={RED} a={fade(T.pecah - 0.2, T.mek, 0.4) * sm(ramp(t, T.pecah - 0.2, T.pecah + 0.4))} width={16} />
      <Arrow pj={pj} from={[-54, 1, -276]} to={[-54, 1, -248]} color={CYAN} a={fade(T.jadi - 0.1, T.mek, 0.4) * sm(ramp(t, T.jadi - 0.1, T.jadi + 0.5))} width={6} />
      <Tag pj={pj} at={[-70, 10, -312]} label="OMBAK PECAH" dx={60} dy={-190} a={fade(T.pecah, T.mek)} color={RED} />
      <Tag pj={pj} at={[-40, 0.5, -262]} label="AIR LEBIH TENANG" dx={30} dy={140} a={fade(T.tenang - 0.6, T.mek)} color={CYAN} />

      {/* MEKANISME */}
      <Tag pj={pj} at={P(-16.6, 5.6, -188)} label="BOLLARD" sub="tiang tambat di dermaga" dx={-120} dy={190} a={fade(T.bollard - 0.1, T.l07)} color={AMBER} />
      {t >= T.tiap - 0.2 &&
        t < T.l09 &&
        LINES.filter((l) => !l.extra).map((l, i) => {
          const focus = focusRoles(t);
          const on = !focus || focus.includes(l.role);
          const start = l.role === "head" ? T.haluan - 0.1 : l.role === "stern" ? T.buritan - 0.1 : l.role === "breast" ? T.l08 : T.spring;
          const prog = focus ? (on ? sm(ramp(t, start, start + 0.6)) : 0) : sm(ramp(t, T.tiap - 0.2 + i * 0.08, T.tiap + 0.3 + i * 0.08));
          return <PathHud key={i} pj={pj} pts={linePoints(l, mo, 0, 16).map((p) => P(...p))} color={ROLE_COLOR[l.role]} prog={prog} a={focus ? (on ? 1 : 0) : 0.75 * (1 - ramp(t, T.l07 - 0.2, T.l07))} width={focus ? 7 : 4} />;
        })}
      <Tag pj={pj} at={P(-16, 6, -225)} label="TALI HALUAN" sub="menahan ujung depan" dx={60} dy={-220} a={fade(T.haluan - 0.05, T.l08 - 0.1)} color={ROLE_COLOR.head} />
      <Tag pj={pj} at={P(-16, 6, -47)} label="TALI BURITAN" sub="menahan ujung belakang" dx={-60} dy={190} a={fade(T.buritan - 0.05, T.l08 - 0.1)} color={ROLE_COLOR.stern} />
      <Tag pj={pj} at={P(-14, 6.5, -80)} label="BREAST LINE" sub="tegak lurus dermaga" dx={-40} dy={190} a={fade(T.l08 + 0.1, T.spring - 0.3)} color={ROLE_COLOR.breast} />
      <Arrow pj={pj} from={hullMid} to={P(14 + mo.sx, 13 + mo.hy, -82)} color={RED} a={fade(T.l08 + 0.8, T.spring - 0.3) * sm(ramp(t, T.l08 + 0.8, T.menjauh - 0.2))} width={12} cross={sm(ramp(t, T.menjauh + 0.2, T.menjauh + 0.6))} />
      <Tag pj={pj} at={P(-14, 6.5, -134)} label="SPRING LINE" sub="sejajar lambung" dx={-60} dy={210} a={fade(T.spring - 0.1, T.l09)} color={ROLE_COLOR.spring} />
      <Arrow pj={pj} from={P(-9, 15, -150 + mo.sz)} to={P(-9, 15, -112 + mo.sz)} color={ROLE_COLOR.spring} a={fade(T.maju - 0.3, T.l09) * sm(ramp(t, T.maju - 0.3, T.maju + 0.2))} width={10} both cross={sm(ramp(t, T.maju + 0.4, T.maju + 0.8))} />
      <Tag pj={pj} at={P(-13.2, 2.4, -82)} label="FENDER KARET" sub="bantalan di dinding dermaga" dx={-40} dy={260} a={fade(T.fender - 0.1, T.rev)} color={AMBER} />
      <Arrow pj={pj} from={P(-1 + mo.sx, 7, -90)} to={P(-10.5 + mo.sx, 5, -90)} color={RED} a={fade(T.serap - 0.4, T.rev, 0.2) * sm(ramp(t, T.serap - 0.4, T.serap))} width={12} />
      <Tag pj={pj} at={P(-12.8, 4.4, -98)} label="BENTURAN DISERAP" dx={60} dy={-220} a={fade(T.benturan - 0.1, T.rev)} color={RED} />

      {/* REVEAL */}
      <Tag pj={pj} at={P(-6.2, DECK + 2.6 + mo.hy, -63.5)} label="WINCH TAMBAT" sub="mengulur & menarik tali" dx={-40} dy={-230} a={fade(T.rev + 0.1, T.l11 + 0.3)} color={AMBER} />
      <Tag pj={pj} at={P(QUAY_X + 0.3, 0.1 + waterAt(t), GAUGE_Z)} label={t < T.surut + 0.25 ? "AIR PASANG ↑" : "AIR SURUT ↓"} sub="kapal ikut naik-turun" dx={60} dy={-150} a={fade(T.pasang - 0.15, T.muatan + 0.6)} color={CYAN} />
      <Tag pj={pj} at={P(-26, 34, CRANE_Z)} label="MUATAN DIBONGKAR" dx={-60} dy={200} a={fade(T.muatan - 0.1, T.naik + 0.6)} color={AMBER} />
      <Arrow pj={pj} from={P(2, 4 + mo.hy, -60)} to={P(2, 13 + mo.hy, -60)} color={CYAN} a={fade(T.naik - 0.2, T.setel - 0.2) * (0.6 + 0.4 * Math.sin(t * 5))} width={10} both />
      <Tag pj={pj} at={P(2, 14 + mo.hy, -60)} label="KAPAL NAIK-TURUN" dx={90} dy={-150} a={fade(T.naik - 0.2, T.setel - 0.1)} color={CYAN} />
      {LINES.filter((l) => l.role === "stern" && !l.extra).map((l, i) => (
        <PathHud key={i} pj={pj} pts={linePoints(l, mo, slack * 2.2, 16).map((p) => P(...p))} color={slack > 0.15 ? RED : "#7dff9a"} prog={1} a={fade(T.naik + 0.4, T.pay, 0.3)} width={6} />
      ))}
      <Tag pj={pj} at={P(-16, 6, -47)} label={slack > 0.15 ? "TALI KENDUR" : "TALI DISETEL ULANG"} dx={-40} dy={-190} a={fade(T.naik + 0.4, T.pay)} color={slack > 0.15 ? RED : "#7dff9a"} />

      {/* PAYOFF */}
      {roleLines("head", true)
        .concat(roleLines("stern", true), roleLines("breast", true), roleLines("spring", true))
        .map((l, i) => (
          <PathHud key={i} pj={pj} pts={linePoints(l, mo, 0, 16).map((p) => P(...p))} color="#6fb8ff" prog={sm(ramp(t, T.tambah - 0.3 + i * 0.12, T.tambah + 0.4 + i * 0.12))} a={fade(T.tambah - 0.3, T.tunda - 0.45, 0.2)} width={6} />
        ))}
      <Tag pj={pj} at={P(-16, 6, -150)} label="+ TALI TAMBAHAN" dx={-60} dy={-260} a={fade(T.tambah - 0.1, T.tunda - 0.45, 0.2)} color="#6fb8ff" />
      <Tag pj={pj} at={P(tug.pos[0], 9, tug.pos[2])} label="KAPAL TUNDA" sub="disiagakan" dx={-30} dy={-220} a={fade(T.tunda - 0.2, T.l13 + 0.6)} color={AMBER} />
      <PathHud
        pj={pj}
        pts={Array.from({ length: 20 }, (_, i) => {
          const s = i / 19;
          const a = P(30, 0.5, -136), b = P(150, 0.5, -60), c = P(218, 0.5, 150);
          return mix3(mix3(a, b, s), mix3(b, c, s), s);
        })}
        color={CREAM}
        prog={sm(ramp(t, T.keluar - 1.2, T.keluar + 0.4))}
        a={fade(T.l13 + 0.3, T.l14 - 0.05, 0.2)}
        width={6}
        dash="22 16"
      />
      <Tag pj={pj} at={P(218, 1, 150)} label="KELUAR KE LAUT" sub="bila terlalu berbahaya" dx={-80} dy={150} a={fade(T.keluar - 0.4, T.l14 - 0.05, 0.2)} color={CREAM} />
      <Tag pj={pj} at={P(-21, 3.7, -229)} label="ZONA BAHAYA" sub="tali putus bisa melecut" dx={60} dy={-330} a={fade(T.melecut - 0.1, T.out)} color={RED} />
      {t >= T.putus && t < T.putus + 0.18 && <AbsoluteFill style={{ background: "#fff", opacity: 0.35 * (1 - ramp(t, T.putus, T.putus + 0.18)) }} />}

      <Kicker t={t} />
      <OutroLayers t={t} />
    </AbsoluteFill>
  );
};

// ── captions ──────────────────────────────────────────────────────────────────
type Phrase = { s: number; e: number; words: Word[] };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
      cur = [];
    };
    c.words.forEach((w, i) => {
      cur.push(w);
      const left = c.words.length - i - 1;
      if ((/[,.?!]$/.test(w.w) && cur.length >= 2 && left !== 1) || (cur.length >= 6 && left > 1)) flush();
    });
    flush();
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  let ph: Phrase | null = null;
  for (let i = 0; i < PHRASES.length; i++) {
    const nx = PHRASES[i + 1];
    const end = nx ? Math.min(nx.s, PHRASES[i].e + 0.6) : PHRASES[i].e + 0.6;
    if (t >= PHRASES[i].s - 0.05 && t < end) ph = PHRASES[i];
  }
  if (!ph || t > OUTRO_AT) return null;
  const n = ph.words.length;
  const lines = n <= 4 ? [ph.words] : [ph.words.slice(0, Math.ceil(n / 2)), ph.words.slice(Math.ceil(n / 2))];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 410, display: "flex", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 28px 16px", background: "linear-gradient(180deg, rgba(6,10,13,0.78), rgba(6,10,13,0.62))", borderRadius: 10, borderBottom: `3px solid ${CYAN}`, maxWidth: 968 }}>
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 }}>
            {line.map((w, i) => {
              const on = t >= w.s && t < w.e + 0.08;
              const past = t >= w.e + 0.08;
              const b = on ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 56,
                    lineHeight: 1.14,
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    color: on ? CYAN : CREAM,
                    opacity: on || past ? 1 : 0.55,
                    transform: `scale(${b}) translateY(${on ? -3 : 0}px)`,
                    textShadow: on ? "0 0 18px rgba(143,225,255,0.6), 0 2px 8px rgba(0,0,0,0.8)" : "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── film ──────────────────────────────────────────────────────────────────────
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1b2226" }}>
      {t < OUTRO_AT + 0.8 && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 55, near: 0.5, far: 9000, position: [0, 50, 0] }}>
          <Scene frame={frame} t={t} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,9,11,0.42) 0%, rgba(6,9,11,0) 26%, rgba(6,9,11,0) 70%, rgba(6,9,11,0.35) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Hud t={t} />
        <Captions t={t} />
      </div>
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
