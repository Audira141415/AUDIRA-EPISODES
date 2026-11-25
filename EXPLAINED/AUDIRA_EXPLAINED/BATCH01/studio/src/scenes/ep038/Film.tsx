// EP038 film: "Jakarta Terus Turun Tanah, Bagaimana Satelit Mengetahuinya?" (SATELLITEBRIEFING).
// Audio Master Clock: every cut, beat and caption reads timeline.json (VO seconds).
// One ThreeCanvas hosts three sets (map world, soil section, phase demo); the shot table picks
// which set is visible and where the camera is. Deterministic: all from useCurrentFrame().

import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import TL from "./timeline.json";
import { MONO, PAL, Stars, TITLE } from "./Cover";
import { hash } from "./map";
import { BOWL_MAIN, Beam, City, Clouds, Fringe, GNSS_SITES, Gnss, PSPoints, Reticle, SeaFar, Sheet, Satellite, Terrain, Track, mapPoint } from "./world";
import { LAYERS, PHASE_HIT, PHASE_O, PHASE_SAT, PhaseScene, SECTION_O, SectionScene, WELL, column, surfaceY } from "./scenes";
import { Outro } from "../_shared/Outro";

// ---------- timeline helpers ----------
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
export const TOTAL = TL.total;
const clip = (id: string) => CLIPS.find((c) => c.id === id)!;
const word = (id: string, prefix: string, nth = 0) => {
  const ws = clip(id).words.filter((w) => w.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return ws[nth] ?? ws[0];
};
const S = (id: string) => clip(id).start - 0.12;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outC = (x: number) => 1 - Math.pow(1 - x, 3);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- camera ----------
type Cam = { pos: THREE.Vector3; tgt: THREE.Vector3; fov: number };
const C = (pos: THREE.Vector3, tgt: THREE.Vector3, fov: number): Cam => ({ pos, tgt, fov });
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ pos: a.pos.clone().lerp(b.pos, k), tgt: a.tgt.clone().lerp(b.tgt, k), fov: a.fov + (b.fov - a.fov) * k });
const threeCam = (c: Cam, aspect: number) => {
  const p = new THREE.PerspectiveCamera(c.fov, aspect, 0.05, 120);
  p.position.copy(c.pos);
  p.lookAt(c.tgt);
  p.updateMatrixWorld();
  p.updateProjectionMatrix();
  return p;
};
const ASPECT = 1080 / 1920;
const onRay = (c: Cam, nx: number, ny: number, dist: number) => {
  const cam = threeCam(c, ASPECT);
  const p = new THREE.Vector3(nx, ny, 0.5).unproject(cam).sub(c.pos).normalize();
  return c.pos.clone().addScaledVector(p, dist);
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 120;
    c.lookAt(cam.tgt);
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------- key places ----------
const B = mapPoint(BOWL_MAIN.lon, BOWL_MAIN.lat);
const ANGKE = mapPoint(106.775, -6.116, 0.05);
const SECT = (x: number, y: number, z: number) => SECTION_O.clone().add(V(x, y, z));
const PH = (x: number, y: number, z: number) => PHASE_O.clone().add(V(x, y, z));

// ---------- shot table ----------
type Mode = "world" | "section" | "phase";
type Shot = { id: string; t0: number; t1: number; mode: Mode; a: Cam; b: Cam; ease?: (x: number) => number; tag: string };

const s1b = C(V(-0.1, 1.9, 1.5), V(-0.2, -0.1, -0.45), 44);
const s2b = C(V(0.9, 5.6, 3.2), V(0.15, 1.0, -1.3), 48);
const SAT2 = onRay(lerpCam(s1b, s2b, io(0.5)), 0.3, 0.42, 3.4);
const s6a = C(V(-3.4, 3.4, 4.6), V(0.0, 1.0, -1.0), 46);
const SAT6 = onRay(s6a, 0.36, 0.5, 4.6);
const SAT5 = V(0.6, 3.0, -1.2);
const s9b = C(V(-0.2, 2.5, 1.7), B.clone().add(V(0, 0, -0.05)), 44);
const s12b = C(V(1.0, 3.2, 3.2), V(0.6, 0, -0.2), 44);
const TRACK_A = V(-4.2, 2.4, -2.0), TRACK_B = V(4.2, 2.4, -2.0);

const SHOTS: Shot[] = [
  { id: "hook", t0: 0, t1: S("l02"), mode: "world", a: C(V(-0.6, 1.0, 0.7), B, 40), b: s1b, tag: "InSAR // Jakarta Utara" },
  { id: "orbit", t0: S("l02"), t1: S("l03"), mode: "world", a: s1b, b: s2b, tag: "Orbit // Satelit radar" },
  { id: "dive", t0: S("l03"), t1: S("l03") + 0.7, mode: "world", a: C(V(0.3, 2.6, 2.0), B, 44), b: C(B.clone().add(V(0.02, 0.22, 0.3)), B, 52), ease: (x) => x * x, tag: "Penampang // Bawah kota" },
  { id: "section", t0: S("l03") + 0.7, t1: S("l04"), mode: "section", a: C(SECT(0.6, 0.6, 7.4), SECT(0.2, -1.7, 0.6), 44), b: C(SECT(2.6, -0.2, 8.2), SECT(0.1, -1.75, 0.5), 44), tag: "Penampang // Bawah kota" },
  { id: "city", t0: S("l04"), t1: S("l05"), mode: "world", a: C(V(0.1, 7.6, 5.6), V(0.2, 0, 0.4), 46), b: C(V(0.5, 8.6, 5.0), V(0.3, 0, 0.2), 46), tag: "Skala kota // Seluruh Jakarta" },
  { id: "sat", t0: S("l05"), t1: S("l06"), mode: "world", a: C(SAT5.clone().add(V(1.7 * Math.cos(0.7), 1.3, 1.7 * Math.sin(0.7))), SAT5.clone().add(V(-0.15, -0.55, -0.1)), 38), b: C(SAT5.clone().add(V(1.7 * Math.cos(1.25), 1.2, 1.7 * Math.sin(1.25))), SAT5.clone().add(V(-0.15, -0.55, -0.1)), 38), tag: "Sentinel-1 // Radar C-band" },
  { id: "beam", t0: S("l06"), t1: S("l07"), mode: "world", a: s6a, b: C(V(-3.0, 3.6, 4.3), V(0.1, 1.0, -1.0), 46), tag: "SAR // Gelombang mikro" },
  { id: "pass", t0: S("l07"), t1: S("l08"), mode: "world", a: C(V(-1.2, 5.4, 4.4), V(-0.1, 1.3, -1.1), 52), b: C(V(0.5, 5.6, 4.0), V(0.4, 1.3, -1.1), 52), tag: "Orbit // Lintasan berulang" },
  { id: "phase", t0: S("l08"), t1: S("l09"), mode: "phase", a: C(PH(0.6, 2.4, 9.6), PH(0.4, 0.4, 0), 42), b: C(PH(0.3, 2.3, 9.0), PH(0.3, 0.4, 0), 42), tag: "Fase // Jarak bertambah" },
  { id: "merge", t0: S("l09"), t1: S("l10"), mode: "world", a: C(V(0.2, 6.6, 5.0), V(0.0, 0.3, -0.4), 46), b: s9b, tag: "Citra 1 − Citra 2" },
  { id: "fringe", t0: S("l10"), t1: S("l11"), mode: "world", a: s9b, b: C(V(-0.5, 1.45, 0.75), B, 44), tag: "Interferogram // fringe" },
  { id: "stack", t0: S("l11"), t1: S("l12"), mode: "world", a: C(V(0.6, 5.6, 4.7), V(0.1, 0, 0.1), 46), b: C(V(0.3, 5.0, 4.0), V(0.0, 0, 0.0), 46), tag: "PS-InSAR // Titik stabil + GNSS" },
  { id: "map", t0: S("l12"), t1: S("l13"), mode: "world", a: C(V(-1.9, 2.4, 2.7), V(-1.0, 0, -0.3), 44), b: s12b, tag: "Peta laju penurunan" },
  { id: "pull", t0: S("l13"), t1: S("l14"), mode: "world", a: s12b, b: C(V(1.2, 7.8, 5.6), V(0.2, 0.6, -0.8), 48), tag: "Pelan // Terukur" },
  { id: "why", t0: S("l14"), t1: TOTAL, mode: "section", a: C(SECT(2.1, 0.5, 3.9), SECT(0.4, -0.5, 0.8), 42), b: C(SECT(1.15, 0.25, 2.7), SECT(0.35, -0.15, 1.0), 42), tag: "Sumur dalam // ?" },
];
const shotAt = (t: number) => SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
const HARD_CUTS = ["section", "city", "sat", "beam", "pass", "phase", "merge", "stack", "why"].map((id) => SHOTS.find((s) => s.id === id)!.t0);

// ---------- 2D overlays ----------
const k0 = (w: number) => w / 1080;

const Callout: React.FC<{ x: number; y: number; dx: number; dy: number; label: string; sub?: string; color?: string; k: number; o: number }> = ({ x, y, dx, dy, label, sub, color = PAL.amber, k, o }) => {
  if (o <= 0.01) return null;
  // keep the label box on screen: flip the leader to the other side when it would clip
  const estW = Math.max(label.length * 0.66 * 34 + 30, (sub ?? "").length * 0.64 * 32 + 20) * k;
  const W = 1080 * k;
  if (dx < 0 && x + dx * k - 12 * k - estW < 30 * k) dx = Math.abs(dx);
  else if (dx > 0 && x + dx * k + 12 * k + estW > W - 30 * k) dx = -Math.abs(dx);
  const ex = x + dx * k, ey = y + dy * k;
  const draw = outC(clamp01(o * 1.4));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, o * 2) }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polyline points={`${x},${y} ${x + (ex - x) * 0.6 * draw},${y + (ey - y) * draw} ${x + (ex - x) * draw},${ey * draw + y * (1 - draw)}`} fill="none" stroke={color} strokeWidth={3 * k} />
        <circle cx={x} cy={y} r={7 * k} fill={color} />
      </svg>
      <div style={{ position: "absolute", left: dx > 0 ? ex + 12 * k : undefined, right: dx < 0 ? `calc(100% - ${ex - 12 * k}px)` : undefined, top: ey - 22 * k, textAlign: dx > 0 ? "left" : "right", whiteSpace: "nowrap", opacity: clamp01(o * 1.5 - 0.3) }}>
        <div style={{ display: "inline-block", fontFamily: MONO, fontWeight: 600, fontSize: 34 * k, letterSpacing: 3 * k, textTransform: "uppercase", color, background: "rgba(7,11,14,0.82)", padding: `${5 * k}px ${12 * k}px`, border: `${2 * k}px solid ${color}` }}>{label}</div>
        {sub ? (
          <div>
            <div style={{ display: "inline-block", marginTop: 6 * k, fontFamily: MONO, fontWeight: 600, fontSize: 32 * k, letterSpacing: 2 * k, textTransform: "uppercase", color: PAL.white, background: "rgba(7,11,14,0.72)", padding: `${3 * k}px ${8 * k}px` }}>{sub}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Tag: React.FC<{ text: string; k: number; t: number }> = ({ text, k, t }) => (
  <div style={{ position: "absolute", top: 180 * k, left: 60 * k, right: 60 * k, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 600, textTransform: "uppercase" }}>
    <div style={{ fontSize: 30 * k, letterSpacing: 3 * k, whiteSpace: "nowrap", color: PAL.amber, background: "rgba(7,11,14,0.55)", padding: `${4 * k}px ${8 * k}px` }}>
      <span style={{ opacity: Math.sin(t * 6) > -0.3 ? 1 : 0.25 }}>●</span> {text}
    </div>
    <div style={{ fontSize: 28 * k, letterSpacing: 1 * k, color: PAL.white, opacity: 0.8, border: `${2 * k}px solid ${PAL.amber}`, padding: `${4 * k}px ${10 * k}px`, background: "rgba(7,11,14,0.6)" }}>
      06°07'S 106°49'E
    </div>
  </div>
);

// karaoke captions: phrases of up to 5 words, broken after punctuation
type Chunk = { words: Word[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.:?!]$/.test(w.w);
      if (cur.length >= 5 || (punct && cur.length >= 2) || i === c.words.length - 1) {
        out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const idx = CHUNKS.findIndex((c, i) => t >= c.s - 0.05 && t < Math.min(c.e + 0.45, CHUNKS[i + 1] ? CHUNKS[i + 1].s - 0.05 : c.e + 0.45));
  if (idx < 0 || t > TL.sections.OUTRO[1] + 0.2) return null;
  const ch = CHUNKS[idx];
  const enter = outC(ramp(t, ch.s - 0.05, ch.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: 400 * k, display: "flex", justifyContent: "center", opacity: enter, transform: `translateY(${(1 - enter) * 14 * k}px)` }}>
      <div style={{ display: "flex", alignItems: "stretch", background: "rgba(7,11,14,0.84)", boxShadow: `0 ${6 * k}px ${24 * k}px rgba(0,0,0,0.5)` }}>
        <div style={{ width: 8 * k, background: PAL.amber }} />
        <div style={{ padding: `${14 * k}px ${22 * k}px`, fontFamily: TITLE, fontWeight: 800, fontSize: 62 * k, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: 1 * k, textAlign: "left", maxWidth: 880 * k, display: "flex", flexWrap: "wrap", columnGap: 20 * k }}>
          {ch.words.map((w, i) => {
            const active = t >= w.s && t < w.e + 0.04;
            const done = t >= w.e + 0.04;
            const pop = active ? 1 + 0.12 * Math.sin(Math.PI * clamp01((t - w.s) / Math.max(0.12, Math.min(0.25, w.e - w.s)))) : 1;
            return (
              <span key={i} style={{ display: "inline-block", color: active ? PAL.amber : done ? PAL.white : "rgba(242,245,246,0.55)", transform: `scale(${pop}) translateY(${active ? -3 * k : 0}px)`, transformOrigin: "50% 80%" }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SineStrip: React.FC<{ w: number; h: number; phase: number; color: string; len: number; k: number }> = ({ w, h, phase, color, len, k }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * w * len;
    pts.push(`${x},${h / 2 - Math.sin((i / 120) * len * Math.PI * 8 + phase) * h * 0.38}`);
  }
  const ex = w * len;
  const ey = h / 2 - Math.sin(len * Math.PI * 8 + phase) * h * 0.38;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(242,245,246,0.2)" strokeWidth={1.5 * k} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4 * k} />
      <circle cx={ex} cy={ey} r={8 * k} fill={color} />
    </svg>
  );
};

const Panel: React.FC<{ k: number; o: number; top: number; children: React.ReactNode }> = ({ k, o, top, children }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: top * k, opacity: o, transform: `translateY(${(1 - o) * 20 * k}px)`, background: "rgba(7,11,14,0.86)", border: `${2 * k}px solid rgba(255,190,85,0.7)`, padding: `${16 * k}px ${20 * k}px` }}>
      {children}
    </div>
  );

const monoS = (size: number, k: number, color = PAL.white): React.CSSProperties => ({ fontFamily: MONO, fontWeight: 600, fontSize: Math.max(size, 32) * k, letterSpacing: 1.5 * k, textTransform: "uppercase", color });

// ---------- film ----------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = k0(width);
  const shot = shotAt(t);
  const u = clamp01((t - shot.t0) / (shot.t1 - shot.t0));
  const cam = lerpCam(shot.a, shot.b, (shot.ease ?? io)(u));
  const pcam = threeCam(cam, width / height);
  const P = (p: THREE.Vector3) => {
    const v = p.clone().project(pcam);
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height };
  };
  const id = shot.id;

  // ---- world state ----
  let fringe = 0, phase = -t * 0.3, wipe = 99, night = 0;
  let ps = 0, psColor = 0, gnss = 0;
  let reticle = 0;
  let sat: { pos: THREE.Vector3; yaw: number; scale: number; flash?: number } | null = null;
  let ghost: THREE.Vector3 | null = null;
  let beam: { from: THREE.Vector3; gain: number; ret: number } | null = null;
  let clouds = 0, track = 0;
  const sheets: { pos: [number, number, number]; size: number; o: number; seed: number; tilt?: number }[] = [];

  if (id === "hook") { fringe = 1; reticle = outC(ramp(t, 0.3, 1.0)); }
  if (id === "orbit") { fringe = 1; reticle = 1 - ramp(t, shot.t0, shot.t0 + 1); sat = { pos: SAT2, yaw: -0.4, scale: 0.3 }; beam = { from: SAT2, gain: ramp(t, word("l02", "luar").s - 0.3, word("l02", "angkasa").e), ret: 0 }; }
  if (id === "dive") { fringe = 1 - u; }
  if (id === "city") { fringe = 0; }
  if (id === "sat") { sat = { pos: SAT5, yaw: 0.2, scale: 0.3 }; }
  if (id === "beam") {
    sat = { pos: SAT6, yaw: -0.35, scale: 0.3 };
    const mlm = word("l06", "malam");
    const sg = word("l06", "siang");
    night = io(ramp(t, sg.s - 0.1, mlm.e)) * (1 - io(ramp(t, mlm.e + 0.4, word("l06", "fase").s)));
    beam = { from: SAT6, gain: outC(ramp(t, word("l06", "menembakkan").s, word("l06", "gelombang").e)), ret: outC(ramp(t, word("l06", "memantul").s - 0.3, word("l06", "balik").e)) };
    clouds = outC(ramp(t, shot.t0, word("l06", "menembus").s + 0.2));
  }
  if (id === "pass") {
    track = outC(ramp(t, shot.t0, shot.t0 + 0.6));
    const shotW = word("l07", "memotret");
    const x = -4.0 + 4.6 * io(ramp(t, shot.t0, shotW.s));
    sat = { pos: V(x, 2.4, -2.0), yaw: 0, scale: 0.45, flash: Math.max(0, 1 - Math.abs(t - shotW.s - 0.1) * 5) };
    ghost = V(0.6, 2.4, -2.0);
    beam = { from: V(x, 2.4, -2.0), gain: Math.max(0, 1 - Math.abs(t - shotW.s - 0.25) * 2.2), ret: 0 };
  }
  if (id === "merge") {
    const pm = io(ramp(t, shot.t0 + 0.2, word("l09", "dibandingkan").e + 0.1));
    const fadeS = 1 - ramp(t, word("l09", "menjadi").s, word("l09", "interferogram").s + 0.3);
    sheets.push({ pos: [-0.85 * (1 - pm), 1.5 - 0.3 * pm, -0.4], size: 1.1, o: 0.92 * fadeS * outC(ramp(t, shot.t0, shot.t0 + 0.4)), seed: 0 });
    sheets.push({ pos: [0.85 * (1 - pm), 1.52 - 0.3 * pm, -0.4], size: 1.1, o: 0.92 * fadeS * outC(ramp(t, shot.t0, shot.t0 + 0.4)) * (1 - pm * 0.45), seed: 1 });
    fringe = 1;
    wipe = 5.5 * io(ramp(t, word("l09", "menjadi").s, word("l09", "pelangi").e));
  }
  if (id === "fringe") { fringe = 1; phase = -t * 0.3 - io(ramp(t, shot.t0 + 0.3, shot.t1 - 0.2)); reticle = outC(ramp(t, shot.t0, shot.t0 + 0.6)) * 0.9; }
  if (id === "stack") {
    fringe = 1 - ramp(t, shot.t0, shot.t0 + 0.6);
    const s0 = word("l11", "menumpuk").s, s1 = word("l11", "citra").e + 0.2, s2 = word("l11", "memilih").s;
    for (let i = 0; i < 10; i++) {
      const arrive = outC(ramp(t, s0 + (i / 10) * (s1 - s0) - 0.25, s0 + (i / 10) * (s1 - s0) + 0.3));
      const o = arrive * (1 - ramp(t, s2, s2 + 0.8));
      sheets.push({ pos: [0.2 + (i - 5) * 0.03, 2.4 - arrive * (1.5 - i * 0.07), 0.3 - (i - 5) * 0.02], size: 3.2, o: o * 0.55, seed: i, tilt: (i - 5) * 0.006 });
    }
    ps = io(ramp(t, s2, word("l11", "stabil").e + 0.4));
    gnss = ramp(t, word("l11", "menguncinya").s - 0.1, clip("l11").end + 0.4);
  }
  if (id === "map") { ps = 1; gnss = 1; psColor = io(ramp(t, shot.t0, shot.t0 + 1.3)); }
  if (id === "pull") {
    ps = 1; gnss = 1; psColor = 1;
    const x = -3.6 + 7.2 * ramp(t, shot.t0, shot.t1 + 0.6);
    sat = { pos: V(x, 2.4, -2.0), yaw: 0, scale: 0.3 };
    track = 0.6;
  }
  const lightK = 1 - night * 0.75;

  // ---- section state ----
  const pumpW = word("l03", "disedot");
  const clayW = word("l03", "lempung");
  const compact = id === "why" ? 1 : io(ramp(t, clayW.s, word("l03", "memadat").e + 0.4));
  const pump = id === "why" ? 1 : outC(ramp(t, pumpW.s - 0.3, pumpW.e + 0.2));

  // ---- phase state ----
  const turunW = word("l08", "turun");
  const drop = 0.3 * io(ramp(t, turunW.s, turunW.e + 0.4));
  const w1 = outC(ramp(t, SHOTS[8].t0, SHOTS[8].t0 + 0.9));
  const w2 = io(ramp(t, word("l08", "jaraknya").s, word("l08", "sedikit").e));
  const faseW = word("l08", "fase");

  // ---- flash at hard cuts ----
  const cutD = Math.min(...HARD_CUTS.map((c) => Math.abs(t - c)));
  const flash = Math.max(0, 1 - cutD / 0.12);

  const bg =
    shot.mode === "section"
      ? "radial-gradient(120% 70% at 50% 35%, #1a2733 0%, #0b1118 60%, #070B0E 100%)"
      : `linear-gradient(180deg, #05080b 0%, ${night > 0.5 ? "#05080b" : "#0a1828"} 55%, #0b1e33 100%)`;

  return (
    <AbsoluteFill style={{ background: PAL.void }}>
      <AbsoluteFill style={{ background: bg }} />
      {shot.mode !== "section" ? <Stars w={width} h={height} /> : null}
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true }} shadows>
        <Rig cam={cam} />
        {shot.mode !== "section" ? <fog attach="fog" args={[night > 0.5 ? "#05080b" : "#0a1828", 7, 24]} /> : null}
        <ambientLight intensity={0.45 * lightK + 0.08} color={night > 0.3 ? "#8aa6d6" : "#c9d6e6"} />
        <hemisphereLight args={["#9cc4ff", "#1a1208", 0.45 * lightK]} />
        <directionalLight
          position={shot.mode === "section" ? [SECTION_O.x - 3, 6, 5] : shot.mode === "phase" ? [PHASE_O.x - 4, 7, 5] : [-5, 7, 3]}
          target-position={shot.mode === "section" ? [SECTION_O.x, 0, 0] : shot.mode === "phase" ? [PHASE_O.x, 0, 0] : [0, 0, 0]}
          intensity={2.4 * lightK}
          color="#fff1dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0006}
          shadow-normalBias={0.03}
        />
        <directionalLight position={[4, 3, -6]} intensity={0.6 * lightK + 0.15} color="#7fb2ff" />

        {shot.mode === "world" ? (
          <group>
            <SeaFar />
            <Terrain night={night} />
            <City />
            <Fringe opacity={fringe} phase={phase} wipe={wipe} wipeC={[B.x, B.z]} />
            <PSPoints reveal={ps} color={psColor} />
            <Gnss p={gnss} t={t} />
            {sheets.map((s, i) => (
              <Sheet key={i} pos={s.pos} size={s.size} opacity={s.o} seed={s.seed} tilt={s.tilt} />
            ))}
            <Reticle at={B} size={0.5} opacity={reticle} t={t} />
            {sat ? <Satellite pos={sat.pos} yaw={sat.yaw} scale={sat.scale} flash={sat.flash ?? 0} /> : null}
            {ghost ? <Satellite pos={ghost} yaw={0} scale={0.45} opacity={0.3} /> : null}
            {beam ? <Beam from={beam.from.clone().add(V(0, -0.1, 0))} to={B.clone().add(V(0.1, 0.02, 0))} t={t} gain={beam.gain} /> : null}
            {beam && beam.ret > 0 ? <Beam from={beam.from.clone().add(V(0, -0.1, 0))} to={B.clone().add(V(0.1, 0.02, 0))} t={t} gain={beam.ret * 0.9} color="#5fd4ff" dir={-1} hw={0.7} hd={0.4} /> : null}
            {beam ? <Clouds center={beam.from.clone().lerp(B, 0.55)} opacity={clouds} t={t - shot.t0} /> : null}
            <Track a={TRACK_A} b={TRACK_B} opacity={track} />
          </group>
        ) : null}
        {shot.mode === "section" ? <SectionScene c={compact} pump={pump} t={t} water={1} /> : null}
        {shot.mode === "phase" ? <PhaseScene drop={drop} w1={w1} w2={w2} t={t} /> : null}
      </ThreeCanvas>

      {/* vignette + lower fade for captions */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(4,7,10,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,11,14,0) 66%, rgba(7,11,14,0.75) 82%, rgba(7,11,14,0.9) 100%)" }} />

      {/* ---- per-shot labels ---- */}
      {id === "hook" ? (() => { const p = P(B.clone().add(V(0, 0.05, 0))); return <Callout x={p.x} y={p.y} dx={180} dy={-170} label="Jakarta Utara" sub="tanah turun" k={k} o={ramp(t, 0.8, 1.4)} />; })() : null}
      {id === "orbit" ? (() => { const p = P(SAT2); return <Callout x={p.x} y={p.y} dx={-200} dy={120} label="Satelit radar" sub="di luar angkasa" color={PAL.white} k={k} o={ramp(t, word("l02", "luar").s - 0.2, word("l02", "angkasa").e)} />; })() : null}
      {id === "section" ? (() => {
        const clayMid = column(-0.9, 1, compact)[3];
        const aqMid = column(-0.9, 1, compact)[0];
        const pc = P(SECT(-0.9, (clayMid.lo + clayMid.hi) / 2, 1.02));
        const pa = P(SECT(-0.9, (aqMid.lo + aqMid.hi) / 2, 1.02));
        const top = surfaceY(WELL.x, WELL.z - 0.06, compact);
        const pw = P(SECT(WELL.x, top - 0.9, WELL.z));
        const ps0 = P(SECT(-0.4, surfaceY(-0.4, 0.6, compact) + 0.05, 0.6));
        return (
          <>
            <Callout x={pw.x} y={pw.y} dx={160} dy={-80} label="Sumur dalam" sub="air disedot" color="#7cc6ff" k={k} o={ramp(t, word("l03", "sumur").s - 0.2, word("l03", "dalam").e)} />
            <Callout x={pa.x} y={pa.y} dx={60} dy={110} label="Akuifer" sub="lapisan air tanah" color="#7cc6ff" k={k} o={ramp(t, word("l03", "air").s - 0.1, word("l03", "tanah").e)} />
            <Callout x={pc.x} y={pc.y} dx={70} dy={-150} label="Lempung lunak" sub={compact > 0.5 ? "butir merapat" : "berisi air"} k={k} o={ramp(t, clayW.s - 0.1, clayW.e + 0.2)} />
            <Callout x={ps0.x} y={ps0.y} dx={-40} dy={-200} label="Permukaan turun" color={PAL.white} k={k} o={ramp(t, word("l03", "memadat").s, word("l03", "memadat").e + 0.3)} />
          </>
        );
      })() : null}
      {id === "city" ? (
        <>
          {Array.from({ length: 9 }, (_, i) => {
            const lon = 106.66 + hash(i, 31) * 0.32, lat = -6.13 - hash(i, 37) * 0.18;
            const p = P(mapPoint(lon, lat, 0.05));
            const o = ramp(t, shot.t0 + 0.15 + i * 0.2, shot.t0 + 0.35 + i * 0.2);
            const s = 46 * k * (1.3 - 0.3 * o);
            return o > 0 ? (
              <div key={i} style={{ position: "absolute", left: p.x - s / 2, top: p.y - s / 2, width: s, height: s, border: `${3 * k}px solid ${PAL.amber}`, opacity: o, display: "flex", alignItems: "center", justifyContent: "center", ...monoS(24, k, PAL.amber) }}>?</div>
            ) : null;
          })}
          <Panel k={k} o={ramp(t, word("l04", "seluruh").s - 0.2, word("l04", "kota?").e)} top={1250}>
            <div style={monoS(24, k, PAL.amber)}>Target: perubahan sentimeter</div>
            <div style={monoS(20, k)}>di seluruh kota, sekaligus</div>
          </Panel>
        </>
      ) : null}
      {id === "sat" ? (() => {
        const yaw = 0.2, sc = 0.3;
        const W = (x: number, y: number, z: number) => SAT5.clone().add(V(x, y, z).multiplyScalar(sc).applyAxisAngle(V(0, 1, 0), yaw));
        const pb = P(W(0, 0.3, 0)), pa = P(W(-1.4, -0.45, -0.75)), pw = P(W(0, 0.05, 2.6));
        return (
          <>
            <Callout x={pb.x} y={pb.y} dx={-170} dy={-210} label="Sentinel-1" sub="satelit radar" color={PAL.white} k={k} o={ramp(t, word("l05", "satelit").s, word("l05", "radar").e)} />
            <Callout x={pa.x} y={pa.y} dx={-120} dy={180} label="Antena radar" sub="panel SAR panjang" k={k} o={ramp(t, word("l05", "radar").s, word("l05", "seperti").e)} />
            <Callout x={pw.x} y={pw.y} dx={100} dy={150} label="Panel surya" color="#7fb2ff" k={k} o={ramp(t, word("l05", "seperti").s, word("l05", "Sentinel").e)} />
          </>
        );
      })() : null}
      {id === "beam" ? (() => {
        const mid = SAT6.clone().lerp(B, 0.3);
        const pm = P(mid);
        const pc = P(SAT6.clone().lerp(B, 0.55).add(V(-0.8, 0.1, 0)));
        const pr = P(SAT6.clone().lerp(B, 0.7));
        const sg = word("l06", "siang"), mlm = word("l06", "malam");
        const fs = word("l06", "fase");
        return (
          <>
            <Callout x={pm.x} y={pm.y} dx={-140} dy={-120} label="Gelombang mikro" sub="ditembak miring" k={k} o={ramp(t, word("l06", "gelombang").s, word("l06", "miring").e) * (1 - ramp(t, word("l06", "menembus").s, word("l06", "menembus").e))} />
            <Callout x={pc.x} y={pc.y} dx={-80} dy={-140} label="Menembus awan" color={PAL.white} k={k} o={ramp(t, word("l06", "menembus").s, word("l06", "awan").e) * (1 - ramp(t, sg.s, sg.e))} />
            <div style={{ position: "absolute", top: 290 * k, left: 60 * k, display: "flex", gap: 14 * k, opacity: ramp(t, sg.s - 0.2, sg.s) * (1 - ramp(t, word("l06", "lalu").s, word("l06", "lalu").e)) }}>
              <div style={{ ...monoS(26, k, night < 0.5 ? PAL.amber : "rgba(242,245,246,0.35)"), border: `${2 * k}px solid currentColor`, padding: `${4 * k}px ${12 * k}px` }}>Siang</div>
              <div style={{ ...monoS(26, k, night >= 0.5 ? "#7fb2ff" : "rgba(242,245,246,0.35)"), border: `${2 * k}px solid currentColor`, padding: `${4 * k}px ${12 * k}px` }}>Malam</div>
              <div style={{ ...monoS(20, k), alignSelf: "center", opacity: ramp(t, mlm.s, mlm.e) }}>radar tetap jalan</div>
            </div>
            <Callout x={pr.x} y={pr.y} dx={170} dy={90} label="Pantulan balik" color="#5fd4ff" k={k} o={ramp(t, word("l06", "memantul").s - 0.2, word("l06", "balik").e)} />
            <Panel k={k} o={ramp(t, fs.s - 0.2, fs.e + 0.1)} top={1180}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
                <div style={{ ...monoS(22, k, "#5fd4ff"), width: 120 * k }}>Fase</div>
                <SineStrip w={640 * k} h={70 * k} phase={0} len={0.55 + 0.45 * ramp(t, fs.s, fs.e + 0.8)} color="#5fd4ff" k={k} />
              </div>
              <div style={{ ...monoS(17, k), marginTop: 6 * k, opacity: 0.8 }}>posisi puncak-lembah saat gelombang kembali</div>
            </Panel>
          </>
        );
      })() : null}
      {id === "pass" ? (() => {
        const shotW = word("l07", "memotret");
        const pg = P(V(0.6, 2.4, -2.0));
        const ps1 = P(sat!.pos);
        return (
          <>
            <Callout x={pg.x} y={pg.y} dx={140} dy={-150} label="Lintasan 1" sub="citra pertama" color="rgba(242,245,246,0.8)" k={k} o={ramp(t, shot.t0 + 0.2, shot.t0 + 0.8)} />
            <Callout x={ps1.x} y={ps1.y} dx={-120} dy={170} label="Lintasan 2" sub="jalur yang sama" k={k} o={ramp(t, word("l07", "lewat").s, word("l07", "sama,").e)} />
            <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - Math.abs(t - shotW.s - 0.1) * 6) * 0.35 }} />
          </>
        );
      })() : null}
      {id === "phase" ? (() => {
        const pg = P(PH(PHASE_HIT.x + 0.9, -drop + 0.05, 0.9));
        const ps2 = P(PH((PHASE_SAT.x + PHASE_HIT.x) / 2, PHASE_SAT.y / 2, 0.18));
        const shift = Math.PI * 1.1 * ramp(t, faseW.s - 0.6, faseW.e);
        return (
          <>
            <Callout x={pg.x} y={pg.y} dx={140} dy={-110} label="Tanah turun" k={k} o={ramp(t, turunW.s, turunW.e + 0.3)} />
            <Callout x={ps2.x} y={ps2.y} dx={-160} dy={-140} label="Jarak bertambah" sub="sedikit" color="#5fd4ff" k={k} o={ramp(t, word("l08", "jaraknya").s, word("l08", "sedikit").e)} />
            <Panel k={k} o={ramp(t, faseW.s - 0.5, faseW.s)} top={225}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
                <div style={{ ...monoS(18, k, PAL.amber), width: 230 * k }}>Lintasan 1</div>
                <SineStrip w={580 * k} h={56 * k} phase={0} len={1} color={PAL.amber} k={k} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 * k, marginTop: 8 * k }}>
                <div style={{ ...monoS(18, k, "#5fd4ff"), width: 230 * k }}>Lintasan 2</div>
                <SineStrip w={580 * k} h={56 * k} phase={-shift} len={1} color="#5fd4ff" k={k} />
              </div>
              <div style={{ ...monoS(20, k, PAL.white), marginTop: 8 * k, textAlign: "right" }}>ujung gelombang bergeser = fase bergeser</div>
            </Panel>
          </>
        );
      })() : null}
      {id === "merge" ? (() => {
        const pm = io(ramp(t, shot.t0 + 0.2, word("l09", "dibandingkan").e + 0.1));
        const fadeS = 1 - ramp(t, word("l09", "menjadi").s, word("l09", "interferogram").s);
        const pa = P(V(-0.85 * (1 - pm), 1.5 - 0.3 * pm, -1.0));
        const pb = P(V(0.85 * (1 - pm), 1.52 - 0.3 * pm, -1.0));
        const pi = P(B.clone().add(V(0.6, 0.05, 0.5)));
        return (
          <>
            <div style={{ position: "absolute", left: pa.x - 80 * k, top: pa.y - 50 * k, opacity: fadeS * (1 - pm), ...monoS(24, k, PAL.amber) }}>Citra 1</div>
            <div style={{ position: "absolute", left: pb.x - 60 * k, top: pb.y - 50 * k, opacity: fadeS * (1 - pm), ...monoS(24, k, PAL.amber) }}>Citra 2</div>
            <div style={{ position: "absolute", left: (pa.x + pb.x) / 2 - 140 * k, top: (pa.y + pb.y) / 2 - 50 * k, opacity: fadeS * ramp(pm, 0.3, 0.6), ...monoS(26, k, PAL.white) }}>fase 2 − fase 1</div>
            <Callout x={pi.x} y={pi.y} dx={120} dy={-200} label="Interferogram" sub="pita warna berulang" k={k} o={ramp(t, word("l09", "interferogram").s, word("l09", "pelangi").e)} />
          </>
        );
      })() : null}
      {id === "fringe" ? (() => {
        const rot = io(ramp(t, shot.t0 + 0.3, shot.t1 - 0.2));
        const R = 70 * k;
        const ang = rot * Math.PI * 2 - Math.PI / 2;
        return (
          <Panel k={k} o={ramp(t, shot.t0, shot.t0 + 0.5)} top={1170}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
              <div style={{ position: "relative", width: R * 2, height: R * 2, borderRadius: "50%", background: "conic-gradient(from 0deg, hsl(223,95%,50%), hsl(283,95%,50%), hsl(343,95%,50%), hsl(43,95%,50%), hsl(103,95%,50%), hsl(163,95%,50%), hsl(223,95%,50%))" }}>
                <div style={{ position: "absolute", inset: R * 0.42, borderRadius: "50%", background: "#0b1016" }} />
                <div style={{ position: "absolute", left: R + Math.cos(ang) * R * 0.71 - 11 * k, top: R + Math.sin(ang) * R * 0.71 - 11 * k, width: 22 * k, height: 22 * k, borderRadius: "50%", background: PAL.white, border: `${3 * k}px solid #0b1016` }} />
              </div>
              <div>
                <div style={monoS(28, k, PAL.amber)}>1 putaran warna</div>
                <div style={{ ...monoS(20, k), marginTop: 8 * k }}>= satu siklus fase</div>
                <div style={{ ...monoS(20, k), opacity: 0.8 }}>warna berulang, bukan skala</div>
              </div>
            </div>
          </Panel>
        );
      })() : null}
      {id === "stack" ? (() => {
        const ps0 = P(V(-0.4, 2.0, 0.3));
        const g = GNSS_SITES[3];
        const pg = P(mapPoint(g[0], g[1], 0.36));
        const pp = P(mapPoint(106.9, -6.24, 0.04));
        return (
          <>
            <Callout x={ps0.x} y={ps0.y} dx={-80} dy={-160} label="Puluhan citra" sub="ditumpuk" k={k} o={ramp(t, word("l11", "menumpuk").s, word("l11", "citra").e) * (1 - ramp(t, word("l11", "memilih").s, word("l11", "memilih").e + 0.4))} />
            <Callout x={pp.x} y={pp.y} dx={-120} dy={190} label="Titik stabil" sub="atap, tiang, beton" color={PAL.white} k={k} o={ramp(t, word("l11", "titik").s, word("l11", "stabil").e)} />
            <Callout x={pg.x} y={pg.y} dx={140} dy={-170} label="Stasiun GNSS" sub="pengunci di darat" k={k} o={ramp(t, word("l11", "GPS").s - 0.2, word("l11", "darat.").e)} />
          </>
        );
      })() : null}
      {id === "map" ? (() => {
        const pa = P(ANGKE);
        const pesW = word("l12", "pesisir");
        const umW = word("l12", "umumnya");
        return (
          <>
            <Callout x={pa.x} y={pa.y} dx={150} dy={-190} label="Pesisir utara & barat" sub="paling cepat turun" color="#ff6a4a" k={k} o={ramp(t, pesW.s - 0.1, word("l12", "barat").e)} />
            <Panel k={k} o={outC(ramp(t, umW.s - 0.15, umW.s + 0.35))} top={250}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 96 * k, lineHeight: 0.95, color: PAL.white }}>3–10 cm/tahun</div>
                  <div style={{ ...monoS(20, k, PAL.amber), marginTop: 6 * k }}>umumnya, tidak merata</div>
                </div>
              </div>
              <div style={{ marginTop: 14 * k, height: 12 * k, background: "linear-gradient(90deg, #2E70CE, #2fb59a, #7cc84a, #f2d43a, #f08a2c, #e3412c)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", ...monoS(16, k), marginTop: 6 * k, opacity: 0.85 }}>
                <span>stabil</span>
                <span>cepat turun</span>
              </div>
            </Panel>
          </>
        );
      })() : null}
      {id === "pull" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 780 * k, textAlign: "center", opacity: ramp(t, word("l13", "pelan").s - 0.1, word("l13", "pelan").e) * (1 - ramp(t, shot.t1 - 0.4, shot.t1)) }}>
          <div style={{ display: "inline-block", fontFamily: TITLE, fontWeight: 800, fontSize: 110 * k, color: PAL.white, background: "rgba(7,11,14,0.7)", padding: `${4 * k}px ${26 * k}px`, letterSpacing: 2 * k }}>
            PELAN <span style={{ color: PAL.amber, opacity: ramp(t, word("l13", "terukur.").s - 0.1, word("l13", "terukur.").e) }}>// TERUKUR</span>
          </div>
        </div>
      ) : null}
      {id === "why" ? (() => {
        const top = surfaceY(WELL.x, WELL.z - 0.06, 1);
        const pp = P(SECT(WELL.x, top + 0.3, WELL.z));
        const r = 70 * k * (1 + Math.sin(t * 4) * 0.05);
        return (
          <>
            <div style={{ position: "absolute", left: pp.x - r, top: pp.y - r, width: r * 2, height: r * 2, border: `${4 * k}px solid ${PAL.amber}`, borderRadius: "50%", opacity: ramp(t, shot.t0 + 0.3, shot.t0 + 0.8) }} />
            <div style={{ position: "absolute", left: pp.x + r + 14 * k, top: pp.y - 60 * k, fontFamily: TITLE, fontWeight: 800, fontSize: 120 * k, color: PAL.amber, opacity: ramp(t, word("l14", "dihentikan").s - 0.2, word("l14", "dihentikan").e) }}>?</div>
          </>
        );
      })() : null}

      <Tag text={shot.tag} k={k} t={t} />
      <Captions t={t} k={k} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(255,190,85,0.0) 0px, rgba(255,190,85,0.0) 6px, rgba(255,190,85,0.5) 7px)", opacity: flash * 0.5 }} />
      <AbsoluteFill style={{ background: PAL.white, opacity: flash * 0.18 }} />
      <Outro start={TL.sections.OUTRO[1] + 0.2} />
    </AbsoluteFill>
  );
};

export { LAYERS };
