// AE-066 film: "Bagaimana Menara ATC Mengatur Ratusan Pesawat?" (GLASSCRAFT).
// Every beat is keyed to timeline.json (Audio Master Clock): shot cuts on clip starts, actions on
// word starts. One persistent 3D airfield + tower; frosted-glass HUD overlays carry the readable
// text (strip board, radio phrases, radar, light callouts, AirNav card); karaoke captions below.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { useFontsReady } from "./Cover.tsx";
import { FilmWorld, GEAR_Y, PZ, RZ, STOP_Z, TOWER, CAB_Y, TX, type PlaneState, type V3, type WorldState } from "./FilmWorld.tsx";
import TL from "./timeline.json";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
export const TOTAL = TL.total as number;
const clip = (id: string) => CLIPS.find((c) => c.id === id)!;
const word = (id: string, prefix: string) => clip(id).words.find((w) => w.w.toLowerCase().startsWith(prefix.toLowerCase()))!.s;
const SEC = TL.sections as unknown as Record<string, [number, number]>;

/* ---------------- key times (all from the timeline) ---------------- */
const K = {
  h2: clip("l02").start,
  k1: clip("l03").start,
  k2: clip("l04").start,
  delivery: word("l04", "Delivery"),
  ground: word("l05", "Ground"),
  tower: word("l06", "Tower"),
  m1: clip("l07").start,
  m2: clip("l08").start,
  line: word("l08", "Line"),
  diam: word("l08", "diam"),
  m3: clip("l09").start,
  cleared: word("l09", "cleared"),
  m4: clip("l10").start,
  radar: word("l10", "radar"),
  jarakR: word("l10", "jarak"),
  r1: clip("l11").start,
  r2: clip("l12").start,
  biru: word("l12", "biru"),
  hijau: word("l12", "hijau"),
  garis: word("l12", "garis"),
  r3: clip("l13").start,
  stop: word("l13", "stop"),
  merah: word("l13", "merah"),
  melintang: word("l13", "melintang"),
  r4: clip("l14").start,
  meski: word("l14", "meski"),
  lisan: word("l14", "lisan"),
  p1: clip("l15").start,
  pusaran: word("l15", "pusaran"),
  berikut: word("l15", "berikutnya"),
  jarakP: word("l15", "jarak"),
  p2: clip("l16").start,
  indonesia: word("l16", "Indonesia"),
  satu: word("l16", "satu"),
  airnav: word("l16", "AirNav"),
  o: clip("l17").start,
  izin: word("l17", "izin"),
  outro: SEC.OUTRO[1] + 0.2,
};

/* ---------------- helpers ---------------- */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lv = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const pulse = (t: number, t0: number) => Math.exp(-Math.pow((t - t0 - 0.35) / 0.55, 2));
const TW = TOWER;
const tw = (x: number, y: number, z: number): V3 => [TW[0] + x, y, TW[2] + z];

/* ---------------- world state ---------------- */
const HOLD_A: V3 = [TX, GEAR_Y, STOP_Z - 4.05];
const OFF: PlaneState = { on: false, pos: [0, 0, 0], rotY: 0 };

const planeA = (t: number): PlaneState => {
  if (t >= K.r1) return OFF;
  if (t < K.line) return { on: true, pos: HOLD_A, rotY: -Math.PI / 2 };
  const lineEnd = K.diam + 0.15;
  if (t < K.cleared + 0.1) {
    // quadratic bezier from the hold point onto the runway centreline, ending nose +x
    const u = smooth(span(t, K.line, lineEnd));
    const P0 = [TX, HOLD_A[2]];
    const P1 = [TX, RZ];
    const P2 = [TX + 5, RZ];
    const x = (1 - u) * (1 - u) * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0];
    const z = (1 - u) * (1 - u) * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1];
    const dx = 2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]);
    const dz = 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1]);
    return { on: true, pos: [x, GEAR_Y, z], rotY: u >= 1 ? 0 : Math.atan2(-dz, dx) };
  }
  const dt = t - (K.cleared + 0.1);
  const x = TX + 5 + 0.5 * 7 * dt * dt;
  const air = Math.max(0, dt - 1.5);
  return { on: true, pos: [x, GEAR_Y + air * air * 1.7, RZ], rotY: 0, pitch: Math.min(0.2, air * 0.35), gear: dt < 3.2, landing: true };
};

const planeB = (t: number): PlaneState => {
  if (t < K.r1 || t >= K.p1) return OFF;
  const zStart = PZ - 2.5;
  const arrive = K.melintang + 0.5;
  let z = lerp(zStart, HOLD_A[2], easeOut(span(t, K.r3, arrive)));
  const go = K.lisan + 0.3;
  if (t > go) z += 0.5 * 1.4 * (t - go) * (t - go);
  return { on: true, pos: [TX, GEAR_Y, z], rotY: -Math.PI / 2 };
};

const FLY_Y = 30;
const flyX = (t: number) => -62 + (t - K.p1) * 4.2;
const planeC = (t: number): PlaneState =>
  t >= K.p1 && t < K.p2 ? { on: true, pos: [flyX(t), FLY_Y, RZ], rotY: 0, gear: false, vortex: span(t, K.pusaran - 0.6, K.pusaran + 1.6) } : OFF;
const planeD = (t: number): PlaneState =>
  t >= K.p1 && t < K.p2 ? { on: true, pos: [flyX(t) - 19 - 3 * span(t, K.berikut - 0.6, K.jarakP + 0.4), FLY_Y + 0.4, RZ], rotY: 0, gear: false, vortex: 0.35 } : OFF;
const approach = (t: number, f: number): PlaneState =>
  t < K.m3 || t >= K.o ? { on: true, pos: [7.6 - f * 0.01 + (t >= K.o ? 30 : 0), 18.2, -43.9], rotY: Math.PI + 0.25, pitch: 0.05, roll: -0.08, gear: true, landing: true, scale: 0.6 } : OFF;

const worldAt = (t: number, f: number): WorldState => {
  const lineUp = t > K.line - 0.4 && t < K.cleared + 0.6;
  const goB = t > K.lisan - 0.13 && t < K.p1;
  const stopOff = lineUp || goB;
  return {
    a: planeA(t),
    b: planeB(t),
    c: planeC(t),
    d: planeD(t),
    appr: approach(t, f),
    stop: stopOff ? 0 : 1,
    lead: stopOff ? 1 : 0,
    gBlue: 1 + 1.4 * pulse(t, K.biru - 0.35),
    gGreen: 1 + 1.6 * pulse(t, K.hijau - 0.6),
    gRed: 1 + 1.2 * pulse(t, K.merah - 0.9),
  };
};

/* ---------------- camera: one shot per clip, continuous moves ---------------- */
type Cam = { pos: V3; target: V3; fov: number; up?: V3 };
const camAt = (t: number, st: WorldState): Cam => {
  if (t < K.h2) {
    const u = smooth(span(t, 0, K.h2));
    return { pos: lv([TX + 1.2, 1.9, 6.6], [TX + 0.8, 1.5, 5.3], u), target: [TX - 0.2, 0.8, -2.6], fov: 40 };
  }
  if (t < K.k1) {
    const u = smooth(span(t, K.h2, K.k1));
    return { pos: lv([TX + 0.9, 1.7, 5.6], [5, 13, 40], u), target: lv([TX - 0.2, 0.8, -2.6], [2.2, 6.4, -6], u), fov: lerp(40, 33, u) };
  }
  if (t < K.k2) {
    const u = smooth(span(t, K.k1, K.k2));
    return { pos: lv(tw(-0.5, CAB_Y + 2.35, -2.5), tw(0.2, CAB_Y + 2.1, -1.9), u), target: tw(0.5, CAB_Y + 0.7, 2.6), fov: 56 };
  }
  if (t < K.m1) {
    const u = smooth(span(t, K.k2, K.m1));
    const a = lerp(0.62, 0.12, u);
    const R = lerp(14, 12.5, u);
    return { pos: tw(Math.sin(a) * R, CAB_Y + 3.2 - u * 0.8, Math.cos(a) * R), target: tw(0, CAB_Y + 0.6, 0), fov: 38 };
  }
  if (t < K.m2) {
    const u = smooth(span(t, K.m1, K.m2));
    const a = lerp(0.24, 0.12, u);
    return { pos: tw(Math.sin(a) * 2.6, CAB_Y + 1.05, Math.cos(a) * 2.6), target: tw(-0.05, CAB_Y + 0.8, 1.72), fov: 46 };
  }
  if (t < K.m3) {
    const u = smooth(span(t, K.m2, K.m3));
    return { pos: lv([TX + 10, 5.2, 16], [TX + 8, 4.0, 15], u), target: lv([TX + 0.5, 0.6, 0], [TX + 4.5, 0.6, RZ], u), fov: 36 };
  }
  if (t < K.m4) {
    const u = smooth(span(t, K.m3, K.m4));
    const p = st.a.pos;
    return { pos: [TX + 20 + u * 2, 1.0 + u * 0.6, RZ + 8.5], target: [p[0] + 2.5, p[1] + 0.3, p[2]], fov: 34 };
  }
  if (t < K.r1) {
    const u = smooth(span(t, K.m4, K.r1));
    const p = st.a.on ? st.a.pos : ([60, 12, RZ] as V3);
    return { pos: add(p, [-11 + u * 2, 1.0 + u * 1.5, 9.5]), target: add(p, [2.5, 1.2, 0]), fov: 36 };
  }
  if (t < K.r2) {
    const u = smooth(span(t, K.r1, K.r2));
    return { pos: lv([TX + 3.2, 16, -15], [TX + 2.2, 8, -8.5], u), target: lv([TX, 0, -3], [TX, 0, 0.5], u), fov: 40 };
  }
  if (t < K.r3) {
    const u = smooth(span(t, K.r2, K.r3));
    return { pos: lv([TX + 1.6, 4.8, -12], [TX + 1.2, 3.8, -9.6], u), target: [TX, 0, 1.5], fov: 40 };
  }
  if (t < K.r4) {
    const u = smooth(span(t, K.r3, K.r4));
    return { pos: lv([TX + 3.6, 0.95, 2.8], [TX + 3.0, 1.1, 2.0], u), target: lv([TX, 0.2, 0.3], [TX - 0.3, 0.7, -2.2], u), fov: 40 };
  }
  if (t < K.p1) {
    const u = smooth(span(t, K.r4, K.p1));
    return { pos: lv([TX - 1.7, 1.2, 4.6], [TX - 1.2, 1.05, 3.5], u), target: [TX, 0.9, -2.8], fov: 40 };
  }
  if (t < K.p2) {
    const u = smooth(span(t, K.p1, K.p2));
    const xm = (st.c.pos[0] + st.d.pos[0]) / 2;
    return { pos: [xm + 1, FLY_Y + lerp(29, 26, u), RZ + 24], target: [xm + 1, FLY_Y, RZ], fov: 40, up: [1, 0, 0] };
  }
  if (t < K.o) {
    const u = smooth(span(t, K.p2, K.o));
    return { pos: lv([-14, 30, 46], [-6, 20, 50], u), target: lv([0, 2, -8], [3, 5, -8], u), fov: 34 };
  }
  const u = smooth(span(t, K.o, TOTAL - 3));
  const a = lerp(0.9, 0.25, u);
  const R = lerp(19, 17, u);
  return { pos: tw(Math.sin(a) * R, CAB_Y + 1.5 + u * 2.5, Math.cos(a) * R), target: tw(0, CAB_Y - 0.6, 0), fov: 36 };
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.up.set(...(cam.up ?? [0, 1, 0]));
    c.lookAt(...cam.target);
    c.fov = cam.fov;
    c.near = 0.1;
    c.far = 900;
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

/* ---------------- 3D text callouts for the PAYOFF (they must sit on the planes) ---------------- */
const textTexture = (text: string, color: string) => {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 200;
  const c = cv.getContext("2d")!;
  c.fillStyle = "rgba(14,22,40,0.72)";
  c.beginPath();
  c.roundRect(8, 30, 1008, 140, 70);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.45)";
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = color;
  c.font = `600 76px ${FONT}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, 512, 104);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const PayoffCallouts: React.FC<{ t: number; st: WorldState }> = ({ t, st }) => {
  const tex1 = useMemo(() => textTexture("Pusaran udara", "#bfe9ff"), []);
  const tex2 = useMemo(() => textTexture("Jarak lebih jauh", "#f6d365"), []);
  if (!st.c.on) return null;
  const o1 = easeOut(span(t, K.pusaran, K.pusaran + 0.5)) * (1 - smooth(span(t, K.jarakP - 0.5, K.jarakP - 0.1)));
  const o2 = easeOut(span(t, K.jarakP - 0.3, K.jarakP + 0.3));
  const c = st.c.pos;
  const d = st.d.pos;
  const midX = (c[0] + d[0]) / 2;
  const len = c[0] - d[0] - 7;
  return (
    <>
      {o1 > 0 && (
        <sprite position={[c[0] - 5, FLY_Y - 0.6, RZ - 3.8]} scale={[6.5 * o1, 1.27 * o1, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
          <spriteMaterial map={tex1} transparent depthWrite={false} depthTest={false} toneMapped={false} />
        </sprite>
      )}
      {o2 > 0 && (
        <>
          <mesh position={[midX, FLY_Y + 0.2, RZ + 4.2]} scale={[len * o2, 1, 1]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
            <boxGeometry args={[1, 0.06, 0.12]} />
            <meshBasicMaterial color={new THREE.Color("#f6d365").multiplyScalar(2)} toneMapped={false} transparent opacity={0.9} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[midX + (sd * len * o2) / 2, FLY_Y + 0.2, RZ + 4.2]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
              <boxGeometry args={[0.12, 0.06, 1.2]} />
              <meshBasicMaterial color={new THREE.Color("#f6d365").multiplyScalar(2)} toneMapped={false} />
            </mesh>
          ))}
          <sprite position={[midX + 1.5, FLY_Y + 0.6, RZ + 3.6]} scale={[6.5 * o2, 1.27 * o2, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
            <spriteMaterial map={tex2} transparent depthWrite={false} depthTest={false} toneMapped={false} />
          </sprite>
        </>
      )}
    </>
  );
};

/* ---------------- HTML overlays ---------------- */
const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06))",
  border: "1.5px solid rgba(255,255,255,0.32)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
  backdropFilter: "blur(24px) saturate(1.3)",
  color: "#fff",
  fontFamily: FONT,
};
const LANE_COL = { DELIVERY: "#f6d365", GROUND: "#43e97b", TOWER: "#f093fb" } as const;

const PlaneGlyph: React.FC<{ size: number; color: string; rot?: number }> = ({ size, color, rot = 0 }) => (
  <svg width={size} height={size} viewBox="-13 -13 26 26" style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
    <path d="M0,-12 Q2,-10 2,-5 L2,-2 L12,3 L12,5.5 L2,3 L1.6,8 L5,10.5 L5,12 L0,11 L-5,12 L-5,10.5 L-1.6,8 L-2,3 L-12,5.5 L-12,3 L-2,-2 L-2,-5 Q-2,-10 0,-12 Z" fill={color} />
  </svg>
);

/** Flight-strip board: the hero strip AUDIRA 66 moves Delivery -> Ground -> Tower on the VO words. */
const StripBoard: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t < K.k2 - 0.4 || t > K.m1 + 0.2) return null;
  const inn = easeOut(span(t, K.k2 - 0.4, K.k2 + 0.2));
  const out = 1 - smooth(span(t, K.m1 - 0.35, K.m1 + 0.2));
  const vis = inn * out;
  const lanes = [
    { name: "DELIVERY", role: "Izin rute", at: K.delivery, others: ["AUDIRA 12", "AUDIRA 40"] },
    { name: "GROUND", role: "Taxiway", at: K.ground, others: ["AUDIRA 27"] },
    { name: "TOWER", role: "Landasan", at: K.tower, others: ["AUDIRA 08"] },
  ] as const;
  const LANE_H = 250;
  const TOP = 120;
  // hero lane position: springs between lanes at each word
  const stage = t < K.ground ? 0 : t < K.tower ? 1 : 2;
  const moveFrom = stage === 0 ? 0 : stage - 1;
  const at = [K.delivery, K.ground, K.tower][stage];
  const mv = easeOut(span(t, at - 0.15, at + 0.45));
  const laneY = lerp(moveFrom, stage, stage === 0 ? 1 : mv);
  const heroIn = easeOut(span(t, K.delivery - 0.3, K.delivery + 0.3));
  const status = ["IZIN RUTE ✓", "TAXI", "LANDASAN"][stage];
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: 290 * s, height: (TOP + LANE_H * 3 + 30) * s, borderRadius: 56 * s, ...glass, opacity: vis, transform: `scale(${lerp(0.9, 1, inn)}) translateY(${(1 - out) * -40 * s}px)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 44 * s, top: 34 * s, fontSize: 40 * s, fontWeight: 600, letterSpacing: "-0.01em" }}>Papan strip penerbangan</div>
      <div style={{ position: "absolute", right: 44 * s, top: 42 * s, fontSize: 28 * s, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>AUDIRA TWR</div>
      {lanes.map((l, i) => {
        const active = stage === i && t >= l.at - 0.15;
        const col = LANE_COL[l.name];
        return (
          <div key={l.name} style={{ position: "absolute", left: 30 * s, right: 30 * s, top: (TOP + i * LANE_H) * s, height: (LANE_H - 18) * s, borderRadius: 34 * s, background: active ? `${col}22` : "rgba(255,255,255,0.04)", border: `2px solid ${active ? col : "rgba(255,255,255,0.12)"}`, boxShadow: active ? `0 0 40px ${col}55` : "none" }}>
            <div style={{ position: "absolute", left: 30 * s, top: 26 * s, fontSize: 40 * s, fontWeight: 600, color: col, letterSpacing: "0.08em" }}>{l.name}</div>
            <div style={{ position: "absolute", left: 30 * s, top: 80 * s, fontSize: 32 * s, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{l.role}</div>
            {l.others.map((o, j) => (
              <div key={o} style={{ position: "absolute", left: (30 + j * 190) * s, bottom: 24 * s, width: 176 * s, height: 64 * s, borderRadius: 16 * s, background: "rgba(255,255,255,0.08)", borderLeft: `${8 * s}px solid ${col}`, display: "flex", alignItems: "center", gap: 10 * s, paddingLeft: 12 * s, fontSize: 24 * s, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                <PlaneGlyph size={24 * s} color="rgba(255,255,255,0.7)" />
                {o}
              </div>
            ))}
          </div>
        );
      })}
      {/* hero strip */}
      <div
        style={{
          position: "absolute",
          right: 54 * s,
          top: (TOP + laneY * LANE_H + 26) * s,
          width: 520 * s,
          height: 180 * s,
          borderRadius: 28 * s,
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(225,238,255,0.9))",
          borderLeft: `${16 * s}px solid ${LANE_COL[lanes[stage].name]}`,
          boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
          opacity: heroIn,
          transform: `translateX(${(1 - heroIn) * 120 * s}px) rotate(${(1 - mv) * (stage ? -2 : 0)}deg)`,
          color: "#0b1426",
          padding: `${22 * s}px ${30 * s}px`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 * s }}>
          <PlaneGlyph size={58 * s} color="#0b1426" rot={stage === 2 ? 90 : 0} />
          <div style={{ fontSize: 66 * s, fontWeight: 600, letterSpacing: "-0.02em" }}>AUDIRA 66</div>
        </div>
        <div style={{ marginTop: 10 * s, fontSize: 36 * s, fontWeight: 600, color: "#1c5fd6", letterSpacing: "0.06em" }}>{status}</div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ s: number; text: string; color: string; o: number; size?: number; sub?: string; style?: React.CSSProperties }> = ({ s, text, color, o, size = 52, sub, style }) =>
  o <= 0 ? null : (
    <div style={{ ...glass, display: "inline-flex", flexDirection: "column", padding: `${22 * s}px ${40 * s}px`, borderRadius: 999, opacity: o, transform: `scale(${lerp(0.85, 1, o)})`, transformOrigin: "left center", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
        <span style={{ width: 20 * s, height: 20 * s, borderRadius: 99, background: color, boxShadow: `0 0 18px ${color}` }} />
        <span style={{ fontSize: size * s, fontWeight: 600, letterSpacing: "-0.01em" }}>{text}</span>
      </div>
      {sub && <div style={{ fontSize: 32 * s, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginTop: 6 * s, marginLeft: 38 * s }}>{sub}</div>}
    </div>
  );

/** Radio phrases (M1), line-up / take-off labels (M2-M3). */
const RadioOverlay: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const els: React.ReactNode[] = [];
  if (t >= K.m1 && t < K.m2 + 0.1) {
    const out = 1 - smooth(span(t, K.m2 - 0.3, K.m2 + 0.1));
    const ph = ["Line up and wait", "Cleared for takeoff", "Cleared to land"];
    els.push(
      <div key="m1" style={{ position: "absolute", left: 64 * s, top: 280 * s, display: "flex", flexDirection: "column", gap: 22 * s, opacity: out }}>
        <div style={{ fontSize: 30 * s, fontWeight: 600, letterSpacing: "0.16em", color: "#9fd8ff", fontFamily: FONT }}>FRASA STANDAR RADIO</div>
        {ph.map((p, i) => (
          <Pill key={p} s={s} text={p} color={["#f6d365", "#43e97b", "#7ee8ff"][i]} o={easeOut(span(t, K.m1 + 0.25 + i * 0.45, K.m1 + 0.7 + i * 0.45))} />
        ))}
      </div>,
    );
  }
  if (t >= K.line - 0.1 && t < K.m4) {
    const o = easeOut(span(t, K.line - 0.1, K.line + 0.3)) * (1 - smooth(span(t, K.m4 - 0.3, K.m4)));
    const clr = t >= K.cleared;
    els.push(
      <div key="m2" style={{ position: "absolute", left: 64 * s, top: 280 * s, display: "flex", flexDirection: "column", gap: 20 * s }}>
        <Pill s={s} text="Line up and wait" color="#f6d365" o={o * (clr ? 0.55 : 1)} sub={t < K.m3 ? "masuk landasan, lalu diam" : undefined} />
        <Pill s={s} text="Cleared for takeoff" color="#43e97b" o={o * easeOut(span(t, K.cleared - 0.1, K.cleared + 0.3))} sub="baru boleh terbang" />
      </div>,
    );
  }
  return <>{els}</>;
};

/** Approach radar (M4): blips on one approach line with visible gaps, no distance numbers. */
const Radar: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const a = K.radar - 0.5;
  if (t < a || t > K.r1 + 0.1) return null;
  const inn = easeOut(span(t, a, a + 0.5));
  const out = 1 - smooth(span(t, K.r1 - 0.3, K.r1 + 0.1));
  const o = inn * out;
  const tt = t - a;
  const blips = [0, 1, 2, 3].map((i) => {
    const d = 0.16 + i * 0.2 - tt * 0.012; // fraction along the approach line
    return { x: 450 + d * 300, y: 470 - d * 330, cs: ["AUDIRA 08", "AUDIRA 51", "AUDIRA 12", "AUDIRA 40"][i] };
  });
  const gapOn = easeOut(span(t, K.jarakR - 0.2, K.jarakR + 0.3));
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 300 * s, height: 960 * s, borderRadius: 56 * s, ...glass, opacity: o, transform: `scale(${lerp(1.25, 1, inn)})`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 44 * s, top: 34 * s, fontSize: 44 * s, fontWeight: 600 }}>Approach</div>
      <div style={{ position: "absolute", right: 44 * s, top: 46 * s, fontSize: 28 * s, fontWeight: 500, letterSpacing: "0.12em", color: "#9fd8ff" }}>LAYAR RADAR</div>
      <svg viewBox="0 0 900 820" style={{ position: "absolute", left: 30 * s, top: 120 * s, width: 900 * s, height: 820 * s }}>
        <defs>
          <radialGradient id="rg" cx="50%" cy="57%" r="60%">
            <stop offset="0%" stopColor="#0d2a44" />
            <stop offset="100%" stopColor="#050f1c" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="900" height="820" rx="40" fill="url(#rg)" opacity="0.92" />
        {[110, 220, 330, 440].map((r) => (
          <circle key={r} cx="450" cy="470" r={r} fill="none" stroke="rgba(126,232,255,0.22)" strokeWidth="2" />
        ))}
        <path d="M0,640 C160,600 230,700 380,660 S640,560 900,610" fill="none" stroke="rgba(126,232,255,0.55)" strokeWidth="4" />
        <line x1="420" y1="500" x2="480" y2="440" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <line x1="450" y1="470" x2="780" y2="60" stroke="rgba(246,211,101,0.45)" strokeWidth="3" strokeDasharray="14 12" />
        {blips.map((b, i) => (
          <g key={i} transform={`translate(${b.x},${b.y})`}>
            <g transform="rotate(-135) scale(1.7)">
              <path d="M0,-12 Q2,-10 2,-5 L2,-2 L12,3 L12,5.5 L2,3 L1.6,8 L5,10.5 L5,12 L0,11 L-5,12 L-5,10.5 L-1.6,8 L-2,3 L-12,5.5 L-12,3 L-2,-2 L-2,-5 Q-2,-10 0,-12 Z" fill="#7ee8ff" />
            </g>
            <text x="30" y="-18" fill="#ffffff" fontFamily={FONT} fontWeight="600" fontSize="30">{b.cs}</text>
          </g>
        ))}
        {/* separation brackets between consecutive aircraft (shape only, no numbers) */}
        {blips.slice(0, 3).map((b, i) => {
          const n = blips[i + 1];
          const ox = 34;
          const oy = 34;
          return (
            <g key={`g${i}`} opacity={gapOn}>
              <line x1={b.x + ox} y1={b.y + oy} x2={n.x + ox} y2={n.y + oy} stroke="#f6d365" strokeWidth="5" />
              <circle cx={b.x + ox} cy={b.y + oy} r="7" fill="#f6d365" />
              <circle cx={n.x + ox} cy={n.y + oy} r="7" fill="#f6d365" />
            </g>
          );
        })}
        <text x="60" y="780" fill="#f6d365" opacity={gapOn} fontFamily={FONT} fontWeight="600" fontSize="38">jarak antarpesawat dijaga</text>
      </svg>
    </div>
  );
};

/** REVEAL callouts: light colours and the stop bar rule. */
const LightCallouts: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t < K.r1 || t >= K.p1) return null;
  const items: { at: number; until: number; text: string; color: string; sub?: string }[] = [
    { at: K.r1 + 0.2, until: K.r2, text: "Lampu lalu lintas taxiway", color: "#7ee8ff" },
    { at: K.biru - 0.35, until: K.r3, text: "Tepi: biru", color: "#2a6bff" },
    { at: K.garis - 0.1, until: K.r3, text: "Garis tengah: hijau", color: "#18ff6a" },
    { at: K.stop - 0.1, until: K.r4 + 1.6, text: "Stop bar: merah", color: "#ff2a2a", sub: "melintang di taxiway" },
    { at: K.r4 + 0.3, until: K.lisan - 0.13, text: "Merah = jangan melintas", color: "#ff2a2a" },
    { at: K.meski - 0.05, until: K.p1, text: "Izin lisan ✓", color: "#43e97b", sub: "tetap tunggu merah padam" },
    { at: K.lisan - 0.1, until: K.p1, text: "Padam → lampu hijau", color: "#18ff6a" },
  ];
  const shown = items.filter((it) => t >= it.at && t < it.until);
  return (
    <div style={{ position: "absolute", left: 64 * s, top: 280 * s, display: "flex", flexDirection: "column", gap: 18 * s }}>
      {shown.map((it) => (
        <Pill key={it.text} s={s} text={it.text} color={it.color} sub={it.sub} size={50} o={easeOut(span(t, it.at, it.at + 0.35)) * (1 - smooth(span(t, it.until - 0.25, it.until)))} />
      ))}
    </div>
  );
};

const AirNavCard: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t < K.p2 || t >= K.o + 0.2) return null;
  const o = easeOut(span(t, K.indonesia - 0.2, K.indonesia + 0.3)) * (1 - smooth(span(t, K.o - 0.2, K.o + 0.2)));
  const one = easeOut(span(t, K.satu - 0.1, K.satu + 0.3));
  const an = easeOut(span(t, K.airnav - 0.15, K.airnav + 0.35));
  return (
    <div style={{ position: "absolute", left: 64 * s, right: 64 * s, top: 300 * s, padding: `${40 * s}px ${48 * s}px`, borderRadius: 52 * s, ...glass, opacity: o }}>
      <div style={{ fontSize: 32 * s, fontWeight: 600, letterSpacing: "0.16em", color: "#9fd8ff" }}>DI INDONESIA</div>
      <div style={{ fontSize: 46 * s, fontWeight: 500, marginTop: 16 * s, opacity: one }}>Satu lembaga pemandu:</div>
      <div style={{ fontSize: 104 * s, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 8 * s, opacity: an, transform: `translateY(${(1 - an) * 30 * s}px)`, background: "linear-gradient(90deg, #ffffff, #bfe9ff 60%, #7ee8ff)", WebkitBackgroundClip: "text", color: "transparent" }}>AirNav Indonesia</div>
    </div>
  );
};

const IzinWord: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t < K.izin - 0.2 || t > K.outro + 0.6) return null;
  const o = easeOut(span(t, K.izin - 0.2, K.izin + 0.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330 * s, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ ...glass, padding: `${24 * s}px ${80 * s}px`, borderRadius: 60 * s, fontSize: 170 * s, fontWeight: 600, letterSpacing: "-0.03em", transform: `scale(${lerp(0.8, 1, o)})`, background: "linear-gradient(160deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06))" }}>
        <span style={{ background: "linear-gradient(90deg, #7ee8ff, #c9a7ff 55%, #f093fb)", WebkitBackgroundClip: "text", color: "transparent" }}>izin</span>
      </div>
    </div>
  );
};

/* ---------------- karaoke captions ---------------- */
type Chunk = { words: Word[]; lines: Word[][]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const n = c.words.length;
    const groups = Math.ceil(n / 5);
    const per = Math.ceil(n / groups);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].start : TOTAL;
    for (let g = 0; g < groups; g++) {
      const ws = c.words.slice(g * per, Math.min(n, (g + 1) * per));
      if (!ws.length) continue;
      const lines = ws.length <= 4 ? [ws] : [ws.slice(0, Math.ceil(ws.length / 2)), ws.slice(Math.ceil(ws.length / 2))];
      out.push({ words: ws, lines, from: ws[0].s - 0.08, to: 0 });
    }
    const last = out[out.length - 1];
    last.to = Math.min(c.end + 0.3, nextStart - 0.05);
  });
  for (let i = 0; i < out.length - 1; i++) if (!out[i].to) out[i].to = out[i + 1].from;
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t >= K.outro) return null;
  const ch = CHUNKS.find((c) => t >= c.from && t < c.to);
  if (!ch) return null;
  const inn = easeOut(span(t, ch.from, ch.from + 0.18));
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, bottom: 400 * s, display: "flex", justifyContent: "center" }}>
      <div style={{ ...glass, background: "rgba(8,14,30,0.55)", borderRadius: 40 * s, padding: `${20 * s}px ${36 * s}px`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * s, opacity: inn, transform: `translateY(${(1 - inn) * 16 * s}px)` }}>
        {ch.lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", gap: 24 * s, justifyContent: "center" }}>
            {ln.map((w, wi) => {
              const idx = ch.words.indexOf(w);
              const nxt = ch.words[idx + 1];
              const active = t >= w.s && t < (nxt ? nxt.s : w.e + 0.25);
              const said = t >= w.s;
              const b = active ? 1 + 0.04 * Math.sin(Math.PI * clamp01((t - w.s) / 0.22)) : 1;
              return (
                <span key={wi} style={{ fontSize: 56 * s, fontWeight: 600, letterSpacing: "-0.01em", color: active ? "#7ee8ff" : said ? "#ffffff" : "rgba(255,255,255,0.55)", transform: `scale(${b})`, display: "inline-block", textShadow: active ? "0 0 24px rgba(126,232,255,0.6)" : "none" }}>
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

/** Short glass glint sweeping across the frame at section changes (reads as passing through glass). */
const SectionGlint: React.FC<{ t: number }> = ({ t }) => {
  const marks = [SEC.KONTEKS[0], SEC.MEKANISME[0], SEC.REVEAL[0], SEC.PAYOFF[0], SEC.OUTRO[0]];
  const m = marks.find((x) => t > x - 0.3 && t < x + 0.25);
  if (m === undefined) return null;
  const u = span(t, m - 0.3, m + 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-30%", left: `${lerp(-60, 130, u)}%`, width: "35%", height: "160%", transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(200,235,255,0.28), rgba(255,255,255,0))", filter: "blur(6px)" }} />
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const s = width / 1080;
  const ready = useFontsReady();
  const st = worldAt(t, f);
  const cam = camAt(t, st);
  return (
    <AbsoluteFill style={{ background: "#060b18" }}>
      {ready && (
        <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true }} camera={{ fov: cam.fov, position: cam.pos }}>
          <Rig cam={cam} />
          <FilmWorld f={f} st={st} />
          <PayoffCallouts t={t} st={st} />
          <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} hdri="studio" ao />
        </ThreeCanvas>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700 * s, background: "linear-gradient(180deg, rgba(4,8,22,0.45) 0%, rgba(4,8,22,0) 100%)" }} />
      {ready && (
        <>
          <StripBoard t={t} s={s} />
          <RadioOverlay t={t} s={s} />
          <Radar t={t} s={s} />
          <LightCallouts t={t} s={s} />
          <AirNavCard t={t} s={s} />
          <IzinWord t={t} s={s} />
          <Captions t={t} s={s} />
          <SectionGlint t={t} />
        </>
      )}
      <Outro start={K.outro} />
    </AbsoluteFill>
  );
};

export { K as KEY_TIMES };
