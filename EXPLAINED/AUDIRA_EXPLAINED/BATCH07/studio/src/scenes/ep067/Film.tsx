// AE-067 "Bagaimana Terowongan Air Membawa Air Antarwilayah?" — WORLDFORGE (Remotion + R3F).
// Director: one set per narration beat (timeline.json = Audio Master Clock), a continuous camera
// per shot, kinetic HUD callouts on the spoken word, karaoke captions, AUDIRA outro.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { SEC, CL, TOTAL, wordT, type Word } from "./timing.ts";
import { SkyGrad, valleyH, type V3, type P2 } from "./world.tsx";
import { CitySet, ReservoirSet, TOWER, ProfileSet, PROFILE, LiningSet, LEAK_AT, TapSet, TapCity, HudsonSet, HUDSON, SodetanSet, SOD, DAM_Z } from "./sets.tsx";

export const OUTRO_AT = SEC.OUTRO[1] + 0.2;
// documentary warm, a touch more saturation and contrast (jury: section looked flat vs the cover)
const GRADE = { ...COLOR_PROFILES.DOCUMENTARY_WARM, saturation: 1.32, contrastCurve: 0.28, vignette: 0.18 };
const wordN = (ci: number, prefix: string, n: number) => {
  const ws = CL[ci].words.filter((x) => x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!ws[n]) throw new Error(`ep067: "${prefix}"#${n} not in clip ${ci}`);
  return ws[n].s;
};
const T = {
  separuh: wordT(0, "separuh"),
  newyork: wordT(0, "new"),
  satu: wordT(0, "satu"),
  terowongan0: wordT(0, "terowongan"),
  seratus0: wordT(0, "seratus"),
  km: wordT(0, "kilometer"),
  kon: SEC.KONTEKS[0],
  delaware: wordT(1, "delaware"),
  dibangun: wordT(1, "dibangun"),
  y1939: wordN(1, "seribu", 0),
  y1945: wordN(1, "seribu", 1),
  airnya: CL[2].start,
  waduk: wordT(2, "waduk"),
  pegunungan: wordT(2, "pegunungan"),
  utara: wordT(2, "utara"),
  mek: SEC.MEKANISME[0],
  beda: wordT(3, "beda"),
  wadukM: wordT(4, "waduk"),
  tinggi: wordT(4, "tinggi"),
  kota: wordT(4, "kota"),
  mengalir: wordT(4, "mengalir"),
  turun: wordT(4, "turun"),
  kalau: CL[5].start,
  terisi: wordT(5, "terisi"),
  naik: wordT(5, "naik"),
  ujung: wordT(5, "ujungnya"),
  rendah: wordT(5, "rendah"),
  permukaan: wordT(5, "permukaan"),
  dinding: CL[6].start,
  beton: wordT(6, "beton"),
  merembes: wordT(6, "merembes"),
  rev: SEC.REVEAL[0],
  sembilan: wordT(7, "sembilan"),
  keran: wordT(7, "keran"),
  hanya: wordT(7, "hanya"),
  gravitasi: wordT(7, "gravitasi"),
  tapi: CL[8].start,
  retak: wordT(8, "retak"),
  bocor: wordT(9, "bocor"),
  seratus9: wordT(9, "seratus"),
  sehari: wordT(9, "sehari"),
  sampai2: wordN(9, "sampai", 1),
  jalur: wordT(9, "jalur"),
  sungai: wordT(9, "sungai"),
  pay: SEC.PAYOFF[0],
  indonesia: wordT(10, "indonesia"),
  banjir: wordT(10, "banjir"),
  sodetan: wordT(11, "sodetan"),
  mengalirkan: wordT(11, "mengalirkan"),
  enam: wordT(11, "enam"),
  kanal: wordT(11, "kanal"),
  out: SEC.OUTRO[0],
  turunO: wordT(12, "turun"),
  terowonganO: wordT(12, "terowongan"),
};

// ── math ──────────────────────────────────────────────────────────────────────
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const win = (t: number, a: number, b: number, f = 0.25) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

// ── shots ─────────────────────────────────────────────────────────────────────
type SetId = "city" | "reservoir" | "profile" | "lining" | "tap" | "leak" | "hudson" | "sodetan" | "outro";
type Key = { t: number; pos: V3; tgt: V3; fov: number };
type ShotDef = { set: SetId; a: number; b: number; keys: Key[] };
const K = (t: number, pos: V3, tgt: V3, fov = 42): Key => ({ t, pos, tgt, fov });
const CUT_LINING = T.dinding - 0.05;
const CUT_LEAK = T.tapi - 0.1;
const CUT_HUDSON = T.sampai2 - 0.2;
const CUT_PAY = T.pay - 0.02;
const CUT_OUT = T.out - 0.03;
const SHOTS: ShotDef[] = [
  { set: "city", a: 0, b: T.kon, keys: [K(0, [78, 14, 104], [20, 2, -14], 46), K(3.4, [30, -6, 74], [-14, -12, -10], 44), K(T.kon, [-58, -12, 50], [-128, -19, -10], 42)] },
  {
    set: "reservoir",
    a: T.kon,
    b: T.mek,
    keys: [K(T.kon, [36, 28, 112], [-6, 5, -4], 44), K(11.2, [14, 20, 62], [-13, 11, -6], 42), K(14.8, [26, 52, 66], [-12, 0, -110], 44), K(T.mek, [-6, 72, 76], [-4, 0, -170], 46)],
  },
  {
    set: "profile",
    a: T.mek,
    b: CUT_LINING,
    keys: [
      K(T.mek, [-74, 44, 74], [-56, 27, 0]),
      K(20.6, [-62, 78, 158], [18, 6, -12]),
      K(23.2, [-24, 12, 168], [-16, -1, 0]),
      K(25.8, [8, 2, 118], [12, -6, 0]),
      K(27.6, [26, 10, 120], [28, 3, 0]),
      K(29.4, [-104, 46, 108], [22, 10, -16]),
      K(CUT_LINING, [-110, 48, 100], [26, 10, -16]),
    ],
  },
  { set: "lining", a: CUT_LINING, b: T.rev, keys: [K(CUT_LINING, [16, 8, 46], [0, 0, -8], 40), K(T.rev, [8, 3, 35], [0, -0.5, -8], 40)] },
  { set: "tap", a: T.rev, b: CUT_LEAK, keys: [K(T.rev, [1.4, 2.7, 6.6], [-0.3, 1.75, -0.6], 40), K(CUT_LEAK, [0.1, 2.15, 4.3], [-0.35, 1.65, -0.6], 40)] },
  { set: "leak", a: CUT_LEAK, b: CUT_HUDSON, keys: [K(CUT_LEAK, [-10, -9, 30], [2, -2, -4], 40), K(CUT_HUDSON, [-18, -2, 36], [2, -2, -6], 40)] },
  { set: "hudson", a: CUT_HUDSON, b: CUT_PAY, keys: [K(CUT_HUDSON, [-34, 22, 196], [-4, -18, 0], 42), K(CUT_PAY, [22, 2, 176], [0, -24, 0], 42)] },
  {
    set: "sodetan",
    a: CUT_PAY,
    b: CUT_OUT,
    keys: [K(CUT_PAY, [44, 24, -52], [0, 0, -110], 42), K(51.2, [52, 30, 44], [0, -4, -40], 42), K(54.2, [25, -3, 50], [0, -13, 0], 42), K(CUT_OUT, [15, -8, 40], [0, -12, 0], 42)],
  },
  { set: "outro", a: CUT_OUT, b: TOTAL + 1, keys: [K(CUT_OUT, [98, 16, 34], [56, 15, -20], 42), K(OUTRO_AT + 1, [128, 30, 96], [8, 12, -16], 42)] },
];
type Rig = { def: ShotDef; pos: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 };
const RIGS: Rig[] = SHOTS.map((def) => {
  const pts = (f: (k: Key) => V3) => {
    const p = def.keys.map((k) => new THREE.Vector3(...f(k)));
    return p.length === 2 ? [p[0], p[0].clone().lerp(p[1], 0.5), p[1]] : p;
  };
  return { def, pos: new THREE.CatmullRomCurve3(pts((k) => k.pos), false, "centripetal"), tgt: new THREE.CatmullRomCurve3(pts((k) => k.tgt), false, "centripetal") };
});
const rigAt = (t: number) => RIGS.find((r) => t >= r.def.a && t < r.def.b) ?? RIGS[RIGS.length - 1];
export type Cam = { pos: V3; tgt: V3; fov: number; set: SetId; u: number };
export const camAt = (t: number): Cam => {
  const r = rigAt(t);
  const ks = r.def.keys;
  let i = 0;
  while (i < ks.length - 2 && t > ks[i + 1].t) i++;
  const lu = clamp01((t - ks[i].t) / Math.max(1e-3, ks[i + 1].t - ks[i].t));
  // continuous motion: linear between keys, slight ease only at the very ends of a shot
  const first = i === 0, last = i === ks.length - 2;
  let su = lu;
  if (first && last) su = 0.75 * lu + 0.25 * sm(lu);
  const idx = (i + su) / (ks.length - 1);
  const curveU = ks.length === 2 ? idx : idx;
  const p = r.pos.getPoint(curveU), g = r.tgt.getPoint(curveU);
  const fov = ks[i].fov + (ks[i + 1].fov - ks[i].fov) * su;
  void first;
  void last;
  return { pos: [p.x, p.y, p.z], tgt: [g.x, g.y, g.z], fov, set: r.def.set, u: clamp01((t - r.def.a) / (r.def.b - r.def.a)) };
};

// ── lights ────────────────────────────────────────────────────────────────────
const Sun: React.FC<{ pos: V3; target: V3; color: string; intensity: number; box: number }> = ({ pos, target, color, intensity, box }) => {
  const { scene } = useThree();
  const l = useMemo(() => {
    const x = new THREE.DirectionalLight(color, intensity);
    x.castShadow = true;
    x.shadow.mapSize.set(2048, 2048);
    x.shadow.bias = -0.0004;
    x.shadow.normalBias = 0.05;
    return x;
  }, [color, intensity]);
  l.position.set(...pos);
  l.target.position.set(...target);
  const c = l.shadow.camera;
  c.left = -box;
  c.right = box;
  c.top = box;
  c.bottom = -box;
  c.near = 1;
  c.far = box * 8;
  c.updateProjectionMatrix();
  l.target.updateMatrixWorld();
  useLayoutEffect(() => {
    scene.add(l, l.target);
    return () => {
      scene.remove(l, l.target);
    };
  }, [scene, l]);
  return null;
};

type Look = { top: string; hor: string; fog: number; sun: string; sunI: number; hemi: [string, string, number]; box: number; scale: number; target: V3; sunDir?: V3; rim?: [string, number] };
const DAY: Look = { top: "#5b94cc", hor: "#e5dccb", fog: 0.0016, sun: "#fff1dc", sunI: 3.0, hemi: ["#cfe0f0", "#6b5a45", 0.9], box: 170, scale: 1, target: [0, 0, -20] };
const LOOKS: Record<SetId, Look> = {
  city: { ...DAY, hor: "#ecd9b8", fog: 0.0022, sun: "#ffd29a", sunI: 3.4, sunDir: [-150, 90, 170], rim: ["#9cc8ff", 1.4] },
  reservoir: { ...DAY, fog: 0.0019, box: 200 },
  profile: { ...DAY, top: "#5a8fc8", hor: "#efd6b0", fog: 0.0026, sun: "#ffc98a", sunI: 3.6, sunDir: [-150, 70, 170], rim: ["#9cc8ff", 1.6], hemi: ["#cfe0f0", "#6b4a30", 0.75] },
  lining: { ...DAY, fog: 0.004, box: 40, scale: 0.2, target: [0, 0, -10], hemi: ["#d8e4ee", "#5a4c3c", 1.1] },
  leak: { ...DAY, fog: 0.004, box: 40, scale: 0.2, target: [0, 0, -10], hemi: ["#d8e4ee", "#5a4c3c", 1.1] },
  tap: { ...DAY, top: "#8fb8de", hor: "#f2e6d0", fog: 0.0, box: 12, scale: 0.05, target: [0, 1, 0], sunI: 2.6, hemi: ["#f4ead8", "#7a6650", 1.2] },
  hudson: { ...DAY, hor: "#ecd8b8", fog: 0.0024, sun: "#ffd29a", sunI: 3.4, sunDir: [-140, 90, 170], rim: ["#9cc8ff", 1.4] },
  sodetan: { ...DAY, top: "#7ea2c4", hor: "#eadcc4", fog: 0.0022, sun: "#ffe8c8" },
  outro: { ...DAY, top: "#5d86c0", hor: "#f4c890", fog: 0.0028, sun: "#ffb874", sunI: 3.8, sunDir: [-120, 55, 180], rim: ["#a9ccff", 1.8], hemi: ["#d8dff0", "#6b4a30", 0.7] },
};

const SetView: React.FC<{ set: SetId; t: number }> = ({ set, t }) => {
  switch (set) {
    case "city":
      return <CitySet t={t} />;
    case "reservoir":
      return <ReservoirSet t={t} />;
    case "profile":
      return <ProfileSet t={t} />;
    case "outro":
      return <ProfileSet t={t} flow={9} />;
    case "lining":
      return <LiningSet t={t} crack={0} leak={0} />;
    case "leak":
      return <LiningSet t={t} crack={sm(ramp(t, T.retak - 0.35, T.retak + 0.25))} leak={sm(ramp(t, T.bocor - 0.4, T.bocor + 0.6))} />;
    case "tap":
      return (
        <>
          <TapSet t={t} />
          <TapCity />
        </>
      );
    case "hudson":
      return <HudsonSet t={t} bypass={sm(ramp(t, T.jalur - 0.5, T.jalur + 0.6))} oldFlow={1 - sm(ramp(t, T.jalur - 0.3, T.jalur + 0.5))} />;
    case "sodetan":
      return <SodetanSet t={t} flood={0.35 + 0.65 * sm(ramp(t, T.banjir - 1.2, T.sodetan))} />;
  }
};

export const World: React.FC<{ frame: number; t: number; cam: Cam }> = ({ frame, t, cam }) => {
  const lk = LOOKS[cam.set];
  const shot: Shot = { pos: cam.pos, target: cam.tgt, fov: cam.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1 };
  const s = lk.scale;
  const sd = lk.sunDir ?? [140, 170, 150];
  const sunPos: V3 = [lk.target[0] + sd[0] * s, lk.target[1] + sd[1] * s, lk.target[2] + sd[2] * s];
  return (
    <>
      <CameraRig shot={shot} near={cam.set === "tap" ? 0.05 : 0.5} far={7000} />
      {lk.fog > 0 && <fogExp2 attach="fog" args={[lk.hor, lk.fog]} />}
      <SkyGrad top={lk.top} horizon={lk.hor} bottom={lk.hor} />
      <hemisphereLight args={lk.hemi} />
      <Sun pos={sunPos} target={lk.target} color={lk.sun} intensity={lk.sunI} box={lk.box} />
      {lk.rim && <directionalLight color={lk.rim[0]} intensity={lk.rim[1]} position={[lk.target[0] + 60 * s, lk.target[1] + 90 * s, lk.target[2] - 260 * s]} />}
      <SetView set={cam.set} t={t} />
      <Finish frame={frame} profile={GRADE} exposure={1} envIntensity={0.55} hdri="sky" ao aoRadius={cam.set === "tap" ? 0.05 : 0.5} />
    </>
  );
};

// ── projection for HUD ────────────────────────────────────────────────────────
type Proj = (p: V3) => { x: number; y: number; front: boolean };
export const makeProjector = (cam: Cam): Proj => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 7000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.tgt);
  c.updateMatrixWorld();
  return (p) => {
    const v = new THREE.Vector3(...p).applyMatrix4(c.matrixWorldInverse);
    const front = v.z < 0;
    const q = new THREE.Vector3(...p).project(c);
    return { x: (q.x * 0.5 + 0.5) * 1080, y: (-q.y * 0.5 + 0.5) * 1920, front };
  };
};

// ── HUD widgets (1080-wide space) ─────────────────────────────────────────────
const CREAM = "#f4ecdc", AMBER = "#ffb45c", CYAN = "#7fe0ff", RED = "#ff5a45", GREEN = "#8be08a", BROWN = "#e0b27a";
const CARD = "rgba(20,14,12,0.82)";
const inFrame = (p: { x: number; y: number; front: boolean }) => p.front && p.x > -40 && p.x < 1120 && p.y > 150 && p.y < 1560;

const Tag: React.FC<{ pj: Proj; at: V3; label: string; sub?: string; dx: number; dy: number; a: number; color?: string }> = ({ pj, at, label, sub, dx, dy, a, color = AMBER }) => {
  if (a <= 0.001) return null;
  const p = pj(at);
  if (!inFrame(p)) return null;
  const left = dx >= 0;
  const bw = Math.max(label.length * 25, (sub?.length ?? 0) * 16) + 56;
  let lx = p.x + dx;
  if (left) lx = Math.min(lx, 1030 - bw);
  else lx = Math.max(lx, 50 + bw);
  const ly = Math.min(1240, Math.max(560, p.y + dy));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={p.x} y1={p.y} x2={lx} y2={ly} stroke={color} strokeOpacity={0.9} strokeWidth={3} />
        <circle cx={p.x} cy={p.y} r={9 + 6 * (1 - a)} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={p.x} cy={p.y} r={4} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: left ? lx + 8 : undefined,
          right: left ? undefined : 1080 - lx + 8,
          top: ly - 30,
          fontFamily: FONT,
          color: CREAM,
          background: CARD,
          borderLeft: left ? `5px solid ${color}` : undefined,
          borderRight: left ? undefined : `5px solid ${color}`,
          padding: "10px 18px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          textAlign: left ? "left" : "right",
          transform: `translateY(${(1 - a) * 12}px)`,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: "0.08em", color }}>{label}</div>
        {sub && <div style={{ fontWeight: 600, fontSize: 31, color: "rgba(244,236,220,0.9)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Big data card in the upper safe zone (y ≥ 262). */
const Card: React.FC<{ a: number; kicker?: string; value: string; sub?: string; color?: string; top?: number; valueSize?: number }> = ({ a, kicker, value, sub, color = AMBER, top = 270, valueSize = 104 }) => {
  if (a <= 0.001) return null;
  const pop = 0.92 + 0.08 * ease(a);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: CARD, borderRadius: 14, padding: "18px 40px 22px", borderTop: `6px solid ${color}`, textAlign: "center", transform: `scale(${pop})`, fontFamily: FONT, maxWidth: 960 }}>
        {kicker && <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: "0.18em", color }}>{kicker}</div>}
        <div style={{ fontWeight: 800, fontSize: valueSize, lineHeight: 1.04, color: CREAM, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{value}</div>
        {sub && <div style={{ fontWeight: 600, fontSize: 38, color: "rgba(244,236,220,0.9)", marginTop: 6, whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
    </div>
  );
};

const PathHud: React.FC<{ pj: Proj; pts: V3[]; color: string; a: number; t: number; width?: number; dash?: boolean; prog?: number }> = ({ pj, pts, color, a, t, width = 6, dash = true, prog = 1 }) => {
  if (a <= 0.001) return null;
  const sp = pts.map(pj);
  if (sp.some((p) => !p.front)) return null;
  const n = Math.max(2, Math.ceil(prog * sp.length));
  const d = sp
    .slice(0, n)
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "26 18" : undefined} strokeDashoffset={dash ? -t * 90 : 0} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "26 18" : undefined} strokeDashoffset={dash ? -t * 90 : 0} />
    </svg>
  );
};

const Arrow: React.FC<{ pj: Proj; from: V3; to: V3; color: string; a: number; width?: number; both?: boolean }> = ({ pj, from, to, color, a, width = 10, both }) => {
  if (a <= 0.001) return null;
  const p = pj(from), q = pj(to);
  if (!p.front || !q.front) return null;
  const ang = Math.atan2(q.y - p.y, q.x - p.x);
  const len = Math.hypot(q.x - p.x, q.y - p.y) * ease(a);
  const ex = p.x + Math.cos(ang) * len, ey = p.y + Math.sin(ang) * len;
  const hs = width * 2.8;
  const head = (x: number, y: number, an: number) =>
    `M${x + Math.cos(an) * hs},${y + Math.sin(an) * hs} L${x + Math.cos(an + 2.5) * hs},${y + Math.sin(an + 2.5) * hs} L${x + Math.cos(an - 2.5) * hs},${y + Math.sin(an - 2.5) * hs} Z`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, a * 2) }}>
      <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke="rgba(0,0,0,0.5)" strokeWidth={width + 6} strokeLinecap="round" />
      <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path d={head(ex, ey, ang)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
      {both && <path d={head(p.x, p.y, ang + Math.PI)} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />}
    </svg>
  );
};

/** Level line (dashed horizontal in world) with a label. */
const MapCard: React.FC<{ a: number; t: number }> = ({ a, t }) => {
  if (a <= 0.001) return null;
  const prog = sm(ramp(t, T.utara, T.utara + 0.9));
  return (
    <div style={{ position: "absolute", right: 60, top: 300, opacity: a, transform: `translateY(${(1 - a) * 16}px)`, fontFamily: FONT }}>
      <div style={{ background: CARD, borderRadius: 14, padding: "22px 30px", borderTop: `6px solid ${CYAN}`, width: 330 }}>
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: "0.16em", color: CYAN }}>▲ UTARA</div>
        <svg width={270} height={330} style={{ display: "block", marginTop: 10 }}>
          <circle cx={60} cy={34} r={16} fill={CYAN} />
          <line x1={60} y1={52} x2={60 + 80 * prog} y2={52 + 230 * prog} stroke={CREAM} strokeWidth={6} strokeDasharray="16 10" />
          <rect x={120} y={276} width={34} height={34} rx={4} fill={AMBER} opacity={prog} />
          <text x={88} y={44} fill={CREAM} fontSize={34} fontWeight={800} fontFamily={FONT}>WADUK</text>
          <text x={100} y={176} fill={CREAM} fontSize={34} fontWeight={700} fontFamily={FONT} opacity={prog}>137 km</text>
        </svg>
        <div style={{ fontWeight: 800, fontSize: 38, color: AMBER, opacity: prog, whiteSpace: "nowrap" }}>KOTA</div>
      </div>
    </div>
  );
};

/** Jakarta locator: Java outline + pin, then a compact place chip that stays through the payoff. */
const JakartaMap: React.FC<{ t: number }> = ({ t }) => {
  const big = win(t, T.indonesia - 0.1, T.sodetan + 0.2, 0.25);
  const chip = win(t, T.sodetan - 0.1, CUT_OUT + 0.1, 0.25);
  const pin = sm(ramp(t, T.indonesia + 0.2, T.indonesia + 0.8));
  return (
    <>
      {big > 0.001 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 560, opacity: big, transform: `translateY(${(1 - big) * 16}px)`, fontFamily: FONT }}>
          <div style={{ background: CARD, borderRadius: 14, padding: "18px 26px 14px", borderTop: `6px solid ${BROWN}` }}>
            <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: "0.16em", color: BROWN }}>JAKARTA · PULAU JAWA</div>
            <svg width={848} height={200} viewBox="0 0 300 80" style={{ display: "block", marginTop: 6 }}>
              <path d="M8,30 C40,14 92,20 132,28 C176,35 226,33 292,46 L288,62 C232,68 172,66 122,60 C80,56 40,58 10,48 Z" fill="#6f8f45" stroke="#e8dcc4" strokeWidth={1.2} />
              <g opacity={pin} transform={`translate(44,${30 - 6 * (1 - pin)})`}>
                <circle r={9} fill={RED} opacity={0.35} />
                <path d="M0,-14 C-7,-14 -9,-6 -6,-1 L0,8 L6,-1 C9,-6 7,-14 0,-14 Z" fill={RED} stroke="#1a120e" strokeWidth={0.8} />
                <circle cy={-8} r={2.6} fill="#fff" />
              </g>
              <text x={62} y={22} fill={CREAM} fontSize={11} fontWeight={800} fontFamily={FONT} opacity={pin}>JAKARTA</text>
            </svg>
          </div>
        </div>
      )}
      {chip > 0.001 && (
        <div style={{ position: "absolute", left: 64, top: 540, opacity: chip, fontFamily: FONT, display: "flex", alignItems: "center", gap: 14, background: CARD, padding: "10px 20px", borderRadius: 999, borderLeft: `6px solid ${RED}` }}>
          <svg width={30} height={40} viewBox="-10 -16 20 26">
            <path d="M0,-14 C-7,-14 -9,-6 -6,-1 L0,8 L6,-1 C9,-6 7,-14 0,-14 Z" fill={RED} />
            <circle cy={-8} r={2.6} fill="#fff" />
          </svg>
          <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: "0.1em", color: CREAM, whiteSpace: "nowrap" }}>JAKARTA · INDONESIA</div>
        </div>
      )}
    </>
  );
};

const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const pj = makeProjector(cam);
  const f = (a: number, b: number, d = 0.25) => win(t, a, b, d);
  const s = cam.set;
  const tun = (path: P2[], step = 6): V3[] => path.filter((_, i) => i % step === 0).map(([x, y]) => [x, y, 0.5] as V3);
  const yr = Math.round(1939 + 6 * sm(ramp(t, T.y1945 - 0.2, T.y1945 + 0.4)));
  const km = Math.round(137 * ease(ramp(t, T.seratus0 - 0.05, T.km + 0.35)));
  const pct = Math.round(97 * ease(ramp(t, T.sembilan - 0.05, T.sembilan + 0.9)));
  const juta = Math.round(136 * ease(ramp(t, T.seratus9 - 0.05, T.seratus9 + 0.95)));
  const m3 = Math.round(60 * ease(ramp(t, T.enam - 0.05, T.enam + 0.8)));
  const mtn: V3 = [-70, valleyH(-70, -160) + 6, -160];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {s === "city" && (
        <>
          <Card a={f(T.separuh - 0.1, T.satu - 0.05, 0.2)} kicker="SEKITAR" value="½ AIR MINUM" sub="kota New York" color={CYAN} />
          <Tag pj={pj} at={[44, 66, -40]} label="NEW YORK" dx={-70} dy={150} a={f(T.newyork - 0.1, T.seratus0 - 0.1)} color={AMBER} />
          <Tag pj={pj} at={[-40, -19, 0.5]} label="1 TEROWONGAN" sub="mengalirkan air ke kota" dx={60} dy={170} a={f(T.satu - 0.05, T.kon + 0.1)} color={CYAN} />
          <Card a={f(T.seratus0 - 0.1, T.kon + 0.1, 0.2)} kicker="PANJANG" value={`${km} KM`} color={AMBER} valueSize={128} />
        </>
      )}
      {s === "reservoir" && (
        <>
          <Card a={f(T.delaware - 0.1, T.airnya - 0.1, 0.25)} kicker="NAMANYA" value="Delaware Aqueduct" sub={t > T.dibangun - 0.1 ? `dibangun ${yr >= 1945 ? "1939–1945" : yr}` : " "} color={AMBER} valueSize={84} />
          {t > T.y1939 - 0.2 && t < T.airnya && (
            <div style={{ position: "absolute", left: 140, right: 140, top: 560, height: 14, borderRadius: 7, background: "rgba(20,14,12,0.7)", opacity: f(T.y1939 - 0.2, T.airnya - 0.1) }}>
              <div style={{ width: `${100 * sm(ramp(t, T.y1939, T.y1945 + 0.5))}%`, height: "100%", borderRadius: 7, background: AMBER }} />
            </div>
          )}
          <Tag pj={pj} at={[TOWER[0], 17, TOWER[2]]} label="MENARA INTAKE" sub="air masuk terowongan" dx={70} dy={-130} a={f(T.airnya, T.waduk - 0.1)} color={CYAN} />
          <Tag pj={pj} at={[-26, 0.5, -70]} label="WADUK" sub="tampungan air" dx={60} dy={160} a={f(T.waduk - 0.1, T.mek)} color={CYAN} />
          <Tag pj={pj} at={mtn} label="PEGUNUNGAN" dx={-60} dy={-120} a={f(T.pegunungan - 0.1, T.mek)} color={GREEN} />
          <Tag pj={pj} at={[0, 4.6, DAM_Z]} label="BENDUNGAN" dx={60} dy={140} a={f(T.kon + 0.6, T.delaware + 0.1)} color={CREAM} />
          <MapCard a={f(T.utara - 0.1, T.mek + 0.1)} t={t} />
        </>
      )}
      {s === "profile" && (
        <>
          <PathHud pj={pj} pts={[[-78, PROFILE.level, 0.5], [32, PROFILE.level, 0.5]]} color={CYAN} a={f(T.tinggi - 0.1, T.kalau) * 0.9 + f(T.permukaan - 0.15, T.dinding + 0.3)} t={t} width={5} />
          <PathHud pj={pj} pts={tun(PROFILE.tunnel)} color={CREAM} a={f(T.mengalir - 0.1, T.dinding + 0.2) * 0.85} t={t} width={5} />
          <Card a={f(T.beda - 0.1, T.mengalir - 0.1)} kicker="KUNCINYA" value="Beda ketinggian" color={AMBER} valueSize={88} />
          <Tag pj={pj} at={[-60, PROFILE.level, 0.5]} label="WADUK · TINGGI" dx={40} dy={-160} a={f(T.wadukM - 0.1, T.kalau)} color={CYAN} />
          <Tag pj={pj} at={[52, PROFILE.cityY + 1, 0.5]} label="KOTA · RENDAH" dx={-40} dy={170} a={f(T.kota - 0.1, T.kalau)} color={AMBER} />
          <Arrow pj={pj} from={[30, PROFILE.level, 1]} to={[30, PROFILE.cityY + 1, 1]} color={AMBER} a={f(T.tinggi - 0.1, T.kalau) * sm(ramp(t, T.tinggi - 0.1, T.tinggi + 0.5))} width={9} both />
          <Tag pj={pj} at={[-30, 1, 0.5]} label="AIR MENGALIR TURUN" dx={60} dy={200} a={f(T.turun - 0.3, T.kalau + 0.4)} color={CYAN} />
          <Card a={f(T.terisi - 0.15, T.ujung - 0.1)} kicker="TEROWONGAN" value="Terisi penuh" color={CYAN} valueSize={88} />
          <Arrow pj={pj} from={[4, -11.5, 1]} to={[30, 2.5, 1]} color={GREEN} a={f(T.naik - 0.2, T.permukaan - 0.1) * sm(ramp(t, T.naik - 0.2, T.naik + 0.5))} width={11} />
          <Tag pj={pj} at={[22, -3, 0.5]} label="NAIK LAGI ↑" dx={40} dy={190} a={f(T.naik - 0.45, T.permukaan - 0.1)} color={GREEN} />
          <Tag pj={pj} at={[44, 11, 0.5]} label="UJUNG LEBIH RENDAH" sub="dari permukaan waduk" dx={-40} dy={200} a={f(T.rendah - 0.2, T.dinding + 0.2)} color={AMBER} />
          <Tag pj={pj} at={[-66, PROFILE.level, 0.5]} label="PERMUKAAN WADUK" dx={40} dy={-170} a={f(T.permukaan - 0.15, T.dinding + 0.2)} color={CYAN} />
        </>
      )}
      {s === "lining" && (
        <>
          <Tag pj={pj} at={[-12, 9, 0.2]} label="BATUAN" dx={-30} dy={-170} a={f(CUT_LINING + 0.1, T.rev)} color={CREAM} />
          <Tag pj={pj} at={[-4.0, 4.0, 0.3]} label="LAPISAN BETON" sub="dinding terowongan" dx={60} dy={-240} a={f(T.beton - 0.1, T.rev)} color={AMBER} />
          <Card a={f(T.merembes - 0.4, T.rev + 0.1, 0.2)} kicker="SUPAYA" value="Air tidak merembes" color={CYAN} valueSize={76} />
        </>
      )}
      {s === "tap" && (
        <>
          <Card a={f(T.sembilan - 0.1, CUT_LEAK + 0.1, 0.2)} kicker="AIR NEW YORK SAMPAI KE KERAN" value={`${pct}%`} sub={t > T.hanya - 0.1 ? "hanya dengan gravitasi · 3% dipompa" : " "} color={CYAN} valueSize={150} />
          <Arrow pj={pj} from={[0.45, 2.6, -0.13]} to={[0.45, 1.3, -0.13]} color={CYAN} a={f(T.gravitasi - 0.3, CUT_LEAK)} width={12} />
          <Tag pj={pj} at={[-0.53, 1.4, -0.13]} label="GRAVITASI" dx={-80} dy={200} a={f(T.gravitasi - 0.15, CUT_LEAK)} color={CYAN} />
        </>
      )}
      {s === "leak" && (
        <>
          <Tag pj={pj} at={LEAK_AT} label="BETON RETAK" dx={-80} dy={-260} a={f(T.retak - 0.15, CUT_HUDSON)} color={RED} />
          <Tag pj={pj} at={[6.4, -7.5, 0.2]} label="BOCOR" sub="air keluar dari terowongan" dx={-60} dy={220} a={f(T.bocor - 0.15, T.seratus9 + 0.2)} color={RED} />
          <Card a={f(T.seratus9 - 0.15, CUT_HUDSON + 0.1, 0.2)} kicker="BOCOR SAMPAI" value={`${juta} JUTA LITER`} sub="per hari" color={RED} valueSize={96} />
        </>
      )}
      {s === "hudson" && (
        <>
          <Tag pj={pj} at={[0, -22, 0.5]} label="TEROWONGAN BOCOR" dx={60} dy={-190} a={f(CUT_HUDSON + 0.1, T.jalur + 0.2)} color={RED} />
          <PathHud pj={pj} pts={tun(HUDSON.bypass, 8)} color={GREEN} a={f(T.jalur - 0.2, CUT_PAY + 0.2)} t={t} width={6} prog={sm(ramp(t, T.jalur - 0.2, T.jalur + 0.8))} />
          <Card a={f(T.jalur - 0.15, CUT_PAY + 0.1, 0.2)} kicker="JALUR PINTAS" value="± 4 km" sub="di bawah Sungai Hudson" color={GREEN} valueSize={110} />
          <Tag pj={pj} at={[0, 2, 0.5]} label="SUNGAI HUDSON" dx={-60} dy={-200} a={f(T.sungai - 0.15, CUT_PAY + 0.1)} color={CYAN} />
        </>
      )}
      {s === "sodetan" && (
        <>
          <Card a={f(T.indonesia - 0.15, T.sodetan - 0.1, 0.2)} kicker="DI INDONESIA" value="Air banjir" sub="dipindahkan lewat terowongan" color={BROWN} valueSize={96} />
          <JakartaMap t={t} />
          <Tag pj={pj} at={[-30, -0.3, -SOD.len - 14]} label="SUNGAI CILIWUNG" sub="meluap saat banjir" dx={60} dy={180} a={f(T.banjir - 0.2, T.sodetan + 0.6)} color={BROWN} />
          <Card a={f(T.sodetan - 0.15, CUT_OUT + 0.1, 0.2)} kicker="JAKARTA · SODETAN CILIWUNG" value={t < T.enam - 0.05 ? "Sodetan Ciliwung" : `± ${m3} m³/detik`} sub={t > T.kanal - 0.1 ? "ke Kanal Banjir Timur" : " "} color={BROWN} valueSize={100} />
          <Tag pj={pj} at={[5.2, -11, 0.3]} label="2 PIPA TEROWONGAN" dx={70} dy={-180} a={f(T.mengalirkan - 0.15, T.kanal - 0.2)} color={AMBER} />
          <Tag pj={pj} at={[-14, -21, 14]} label="KANAL BANJIR TIMUR" dx={-40} dy={170} a={f(T.kanal - 0.15, CUT_OUT + 0.1)} color={CYAN} />
        </>
      )}
      {s === "outro" && (
        <>
          <PathHud pj={pj} pts={tun(PROFILE.tunnel)} color={CYAN} a={f(T.out, OUTRO_AT) * 0.9} t={t} width={6} />
          <Card a={f(T.turunO - 0.2, OUTRO_AT + 0.2)} kicker="AIR CUKUP TURUN" value="Terowongan" sub={t > T.terowonganO ? "yang menunjukkan jalannya" : " "} color={CYAN} valueSize={96} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ── captions ──────────────────────────────────────────────────────────────────
type Phrase = { s: number; e: number; words: Word[] };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CL) {
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
  const chars = ph.words.reduce((a, w) => a + w.w.length + 1, 0);
  const lines = n <= 4 && chars <= 26 ? [ph.words] : [ph.words.slice(0, Math.ceil(n / 2)), ph.words.slice(Math.ceil(n / 2))];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 410, display: "flex", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px 28px 16px", background: "rgba(20,14,12,0.74)", borderRadius: 12, borderBottom: `4px solid ${AMBER}`, maxWidth: 968 }}>
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
                    fontWeight: 800,
                    fontSize: 58,
                    lineHeight: 1.14,
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    color: on ? AMBER : CREAM,
                    opacity: on || past ? 1 : 0.6,
                    transform: `scale(${b}) translateY(${on ? -3 : 0}px)`,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
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
const CUTS = SHOTS.slice(1).map((s) => s.a);
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const cam = camAt(t);
  const dip = Math.max(0, ...CUTS.map((c) => 1 - Math.abs(t - c) / 0.14));
  return (
    <AbsoluteFill style={{ backgroundColor: "#cfd6d8" }}>
      {t < OUTRO_AT + 0.8 && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 42, near: 0.5, far: 7000, position: [0, 50, 100] }}>
          <World frame={frame} t={t} cam={cam} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,8,6,0.30) 0%, rgba(10,8,6,0) 22%, rgba(10,8,6,0) 72%, rgba(10,8,6,0.30) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Hud t={t} cam={cam} />
        <Captions t={t} />
      </div>
      {dip > 0 && <AbsoluteFill style={{ background: "#0d0b09", opacity: 0.85 * dip }} />}
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
