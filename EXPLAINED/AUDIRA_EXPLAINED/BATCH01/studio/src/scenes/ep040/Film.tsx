// EP040 film: "Kamera ETLE Bisa Membaca Plat Nomor di Malam Hari?" — THERMALFORGE.
// Shots, beats and captions are all keyed to timeline.json (see timing.ts). No audio in the composition.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { World, type WorldState, type Cam, type V3, CAM1, plateWorld, project, camLocal, PLATE, PLATE_W, PLATE_H, BEAD_SRC, BEAD_HITS } from "./world.tsx";
import { SEC, W, WE, CLIPS, OUTRO_START, clamp, lerp, lerp3, ramp, ease, easeOut } from "./timing.ts";
import { Office, Letter, officeLayout } from "./office.tsx";

export const C = { black: "#05020F", violet: "#310E68", magenta: "#9B1D8C", amber: "#EA5E28", yellow: "#F7D038", white: "#FFFFFF", cyan: "#00E5FF", ink: "#F1EEF4" };

// ---------------- shot list (cuts from the VO clock) ----------------
const PRE = 0.12; // cut a beat before the word lands
const CUTS: [string, number][] = [
  ["s1", 0],
  ["s2", W("Kamu") - PRE],
  ["s3", W("Justru") - PRE],
  ["s4", SEC.KONTEKS[0] - PRE],
  ["s5", W("Kuncinya") - PRE],
  ["s6", SEC.MEKANISME[0] - PRE],
  ["s7", W("Di", W("lensa")) - PRE],
  ["s8", W("di", W("mata")) - PRE],
  ["s9", W("Permukaan") - PRE],
  ["s10", W("Latarnya") - PRE],
  ["s11", W("Itu", W("Latarnya")) - PRE],
  ["s12", SEC.REVEAL[0] - PRE],
  ["s13", W("Software") - PRE],
  ["s14", SEC.PAYOFF[0] - PRE],
  ["s15", W("Fotonya") - PRE],
  ["s16", W("baru") - PRE],
  ["s17", SEC.OUTRO[0] - PRE],
  ["s18", W("Kamu", SEC.OUTRO[0]) - PRE],
];
export const SHOT_STARTS = CUTS.map((c) => c[1]);
const shotAt = (t: number) => {
  let i = 0;
  while (i + 1 < CUTS.length && t >= CUTS[i + 1][1]) i++;
  const a = CUTS[i][1], b = i + 1 < CUTS.length ? CUTS[i + 1][1] : OUTRO_START + 1;
  return { id: CUTS[i][0], a, b, u: clamp((t - a) / (b - a)) };
};

// key beats
const B = {
  bright: W("paling"),
  ocr0: W("membaca"), ocr1: WE("otomatis."),
  lightOn: W("menyalakan"),
  lens: W("lensa"),
  ir: W("inframerah"),
  flash: W("kilatan") + 0.15,
  beadIn: W("retroreflektif") - 0.2, beadOut: W("memantulkan"), beadEnd: WE("sumbernya.") + 0.3,
  bg: W("menyala"), ink: W("hurufnya"),
  white: W("putih"), contrast: W("kontras"),
  speed: W("seperseribu"), freeze: W("membekukan"),
  find: W("mencari"), straight: W("meluruskannya"), cut: W("memotong"), read: W("membacanya"),
  judge: W("hakim"),
};

const POV: V3 = [2.45, 5.42, 12.9];
const carHook = (t: number) => ({ x: 1.95, z: Math.min(-8, -42 + 4.6 * t), yaw: 0 });

const stateAt = (t: number): WorldState & { shot: ReturnType<typeof shotAt> } => {
  const shot = shotAt(t);
  const { id, u, a } = shot;
  const base: WorldState = {
    world: "street", t, cam: { pos: [0, 5, 20], target: [0, 0, 0], fov: 35 },
    car: { x: 1.95, z: -6, yaw: 0 }, sweep: 1, splitX: 0, irOn: 1, flash: 0, rings: -1, beadIn: 0, beadOut: 0, newPlate: 0, pulse: -1,
  };
  const pl = (car: WorldState["car"]) => plateWorld(car).toArray() as V3;
  const set = (o: Partial<WorldState>) => ({ ...base, ...o, shot });
  switch (id) {
    case "s1": {
      const car = carHook(t);
      return set({ car, sweep: 0, cam: { pos: lerp3([-7, 15.5, 36], [-4.5, 11.5, 29], ease(u)), target: lerp3([1.5, 0, -12], [1.8, 0.5, -16], ease(u)), fov: 40 } });
    }
    case "s2": {
      const car = carHook(t);
      return set({ car, sweep: 0, cam: { pos: lerp3([3.3, 7.4, 19.6], [3.1, 7.0, 18.4], ease(u)), target: lerp3([1.8, 1.0, -12], [1.9, 0.6, -12], ease(u)), fov: 34 } });
    }
    case "s3": {
      const car = carHook(t);
      return set({ car, sweep: ramp(t, a + 0.05, B.bright, easeOut), cam: { pos: lerp3(POV, [2.42, 5.3, 12.3], ease(u)), target: pl(car), fov: lerp(30, 24, ease(u)) } });
    }
    case "s4": {
      const car = { x: 1.95, z: lerp(-7.4, -5.0, u), yaw: 0.05 };
      return set({ car, cam: { pos: lerp3([2.6, 5.5, 13.0], [2.5, 5.3, 12.4], ease(u)), target: lerp3(pl(car), [1.95, 0.4, car.z + 1], 0.35), fov: lerp(30, 27, u) } });
    }
    case "s5": {
      const car = { x: 1.95, z: -5.0, yaw: 0.05 };
      const p = plateWorld(car);
      const k = Math.pow(ease(u), 1.6);
      return set({ car, cam: { pos: lerp3([2.5, 5.3, 12.4], [p.x + 0.12, p.y + 0.22, p.z + 1.25], k), target: lerp3([1.95, 0.4, car.z + 1], p.toArray(), Math.min(1, k * 1.5)), fov: lerp(27, 32, k) } });
    }
    case "s6": {
      const ang = lerp(-0.6, 0.12, ease(u));
      const r = lerp(3.2, 2.7, ease(u));
      const mid = camLocal(CAM1, [-0.19, 0, 0.3]);
      const pos: V3 = [mid.x + Math.sin(ang) * r, mid.y - 1.0, mid.z - Math.cos(ang) * r];
      return set({ car: { x: 1.95, z: -30, yaw: 0 }, irOn: ramp(t, B.lightOn, B.lightOn + 0.5), rings: t > B.lightOn ? t - B.lightOn : -1, fill: 1.1, cam: { pos, target: mid.toArray() as V3, fov: 32 } });
    }
    case "s7": {
      const car = { x: 1.95, z: lerp(-16, -7.5, u), yaw: 0 };
      return set({ car, splitX: lerp(1, 0.5, ramp(t, a, a + 0.55, easeOut)), cam: { pos: lerp3([4.4, 5.8, 14.2], [4.2, 5.5, 13.4], ease(u)), target: [2.1, 0, -4.2], fov: 31 } });
    }
    case "s8": {
      const car = { x: 1.95, z: lerp(-13, -8, u), yaw: 0 };
      const f = Math.exp(-Math.pow((t - B.flash) / 0.07, 2)) + 0.6 * Math.exp(-Math.pow((t - B.flash - 0.9) / 0.06, 2));
      return set({ car, sweep: 0, irOn: 0, flash: f, cam: { pos: lerp3([-0.4, 4.0, 22.5], [0.2, 4.1, 21.2], ease(u)), target: lerp3([2.6, 3.2, 4], [2.7, 3.1, 3], ease(u)), fov: 44 } });
    }
    case "s9":
      return set({ world: "macro", beadIn: ramp(t, B.beadIn, B.beadOut - 0.05, easeOut), beadOut: ramp(t, B.beadOut, B.beadEnd, easeOut), cam: { pos: lerp3([2.2, 2.6, 18.5], [-0.6, 2.8, 15.2], ease(u)), target: [0, 2.4, 0], fov: 42 } });
    case "s10": {
      const car = { x: 1.95, z: -5.0, yaw: 0 };
      const p = plateWorld(car);
      return set({ car, irOn: 0.5, bloom: 0.03, cam: { pos: lerp3([p.x - 0.5, p.y + 0.35, p.z + 2.2], [p.x + 0.4, p.y + 0.3, p.z + 1.9], ease(u)), target: lerp3([p.x - 0.08, p.y + 0.05, p.z], [p.x + 0.06, p.y + 0.05, p.z], ease(u)), fov: 32 } });
    }
    case "s11":
      return set({ world: "compare", bloom: 0.12, newPlate: ramp(t, B.white - 0.45, B.white + 0.35, easeOut), cam: { pos: lerp3([0.9, 1.4, 11.5], [-0.4, 0.9, 10.2], ease(u)), target: [0, 0.75, 0], fov: 40 } });
    case "s12":
    case "s13": {
      const tf = B.freeze;
      const te = Math.min(t, tf);
      const s12a = CUTS[11][1];
      const k = clamp((te - s12a) / (tf - s12a));
      const car = { x: 1.95, z: lerp(-50, -5.6, k), yaw: 0 };
      const camK = ease(k);
      return set({ car, flash: Math.exp(-Math.pow((t - tf) / 0.05, 2)) * 0.6, cam: { pos: lerp3([4.9, 4.3, 14.6], [4.4, 4.9, 13.8], camK), target: lerp3([1.9, 0.6, -24], [1.95, 0.5, -3.6], camK), fov: lerp(30, 27, camK) } });
    }
    case "s14": {
      const car = { x: 1.95, z: -5.6, yaw: 0 };
      return set({ car, fill: 2.2, pulse: ramp(t, a + 0.35, shot.b - 0.15, (x) => x), cam: { pos: lerp3([5.6, 3.6, 23], [11.5, 6.4, 22], ease(u)), target: lerp3([4.8, 4.6, 13.6], [5.6, 4.4, 13.6], ease(u)), fov: 46 } });
    }
    case "s15": {
      // the frozen frame, shown inside the back-office monitor window (office.tsx draws the room around it)
      const L = officeLayout(t, a, shot.b);
      const fov = (2 * Math.atan(6.2 / (L.s * 19.5)) * 180) / Math.PI;
      return set({ car: { x: 1.95, z: -5.6, yaw: 0 }, bloom: 0.15, cam: { pos: [2.45, 5.42, 12.9], target: [1.95, 0.75, -4.6], fov, shift: [L.hole.x + L.hole.w / 2 - 540, L.hole.y + L.hole.h / 2 - 960] } });
    }
    case "s16":
      return set({ world: "none" });
    case "s17": {
      const car = { x: 1.95, z: lerp(-6.5, -3.5, u), yaw: 0 };
      const p = pl(car);
      return set({ car, cam: { pos: lerp3([3.4, 2.6, 4.2], [-3, 14, 25], ease(u)), target: lerp3(p, [1.6, 0, -7], ease(u)), fov: lerp(34, 42, u) } });
    }
    default: {
      const car = { x: 1.95, z: lerp(-3.5, -1.2, u), yaw: 0 };
      return set({ car, cam: { pos: lerp3([-3, 14, 25], [-4.5, 17, 30], ease(u)), target: lerp3([1.6, 0, -7], [1.6, 0, -9], ease(u)), fov: 42 } });
    }
  }
};

// ---------------- 2D layer ----------------
const mono: React.CSSProperties = { fontFamily: `'${FONT}'`, fontVariantNumeric: "tabular-nums", letterSpacing: "0.14em" };
const fadeIn = (t: number, at: number, d = 0.3) => ramp(t, at, at + d, easeOut);

const Label: React.FC<{ x: number; y: number; text: string; o: number; color?: string; dx?: number; dy?: number; align?: "left" | "right" }> = ({ x, y, text, o, color = C.cyan, dx = 90, dy = -70, align: align0 = "left" }) => {
  let align = align0;
  if (o <= 0.001) return null;
  const lx = x + dx, ly = clamp(y + dy, 210, 1350);
  // keep the text inside the frame: flip to the other side when it would run off the edge
  const tw = text.length * 19 + 40;
  if (align === "left" && lx + 40 + tw > 1030) align = "right";
  else if (align === "right" && lx - 40 - tw < 50) align = "left";
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
        <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth={3} />
        <polyline points={`${x},${y} ${lx},${ly} ${lx + (align === "left" ? 30 : -30)},${ly}`} fill="none" stroke={color} strokeWidth={2.5} />
      </svg>
      <div style={{ position: "absolute", top: ly - 17, ...(align === "left" ? { left: lx + 40 } : { right: 1080 - lx + 40 }), whiteSpace: "nowrap", fontSize: 28, fontWeight: 600, color, opacity: o, ...mono, textShadow: "0 2px 10px #000" }}>{text}</div>
    </>
  );
};

const Tag: React.FC<{ x: number; y: number; text: string; o: number; color?: string; size?: number; bg?: string }> = ({ x, y, text, o, color = C.ink, size = 30, bg = "#05020Fcc" }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x, top: y, padding: "10px 18px", background: bg, border: `2px solid ${color}55`, color, fontSize: size, fontWeight: 600, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, ...mono, whiteSpace: "nowrap" }}>{text}</div>
  );

const PlateArt: React.FC<{ w: number; gap?: number; boxes?: number; dark?: boolean }> = ({ w, gap = 0, boxes = 0, dark = false }) => {
  const h = w * 0.29;
  return (
    <div style={{ width: w, height: h, background: dark ? "#0b0b0b" : "#FFFBEA", border: `${w * 0.012}px solid ${dark ? "#888" : "#111"}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
      {PLATE.split("").map((ch, i) => (ch === " " ? <div key={i} style={{ width: w * 0.035 + gap }} /> : (
        <div key={i} style={{ margin: `0 ${gap / 2}px`, width: w * 0.083, height: h * 0.66, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.13, fontWeight: 600, color: dark ? "#ddd" : "#0B0910", lineHeight: 1, outline: boxes > 0 ? `${2}px solid rgba(155,29,140,${boxes})` : "none" }}>{ch}</div>
      )))}
    </div>
  );
};

const LockBox: React.FC<{ cam: Cam; car: WorldState["car"]; o: number; label?: string }> = ({ cam, car, o, label }) => {
  if (o <= 0.001) return null;
  const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => project(cam, plateWorld(car, (sx * PLATE_W) / 2, (sy * PLATE_H) / 2)));
  const pad = 14 + (1 - o) * 40;
  const x0 = Math.min(...cs.map((c) => c.x)) - pad, x1 = Math.max(...cs.map((c) => c.x)) + pad;
  const y0 = Math.min(...cs.map((c) => c.y)) - pad, y1 = Math.max(...cs.map((c) => c.y)) + pad;
  const tick = (s: React.CSSProperties) => <div style={{ position: "absolute", background: C.cyan, ...s }} />;
  return (
    <div style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, border: `3px solid ${C.cyan}`, boxShadow: `0 0 18px ${C.cyan}88`, opacity: o }}>
      {tick({ left: -16, top: (y1 - y0) / 2 - 1.5, width: 22, height: 3 })}
      {tick({ right: -16, top: (y1 - y0) / 2 - 1.5, width: 22, height: 3 })}
      {tick({ top: -16, left: (x1 - x0) / 2 - 1.5, width: 3, height: 22 })}
      {tick({ bottom: -16, left: (x1 - x0) / 2 - 1.5, width: 3, height: 22 })}
      {label ? <div style={{ position: "absolute", left: x1 - x0 + 26, top: (y1 - y0) / 2 - 15, whiteSpace: "nowrap", fontSize: 26, color: C.cyan, fontWeight: 600, ...mono }}>{label}</div> : null}
    </div>
  );
};

const SensorHud: React.FC<{ t: number; o: number; line2?: string }> = ({ t, o, line2 = "MODE MALAM · ILUMINATOR AKTIF" }) =>
  o <= 0.001 ? null : (
    <div style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 66, top: 196, ...mono }}>
        <div style={{ fontSize: 26, color: C.cyan, fontWeight: 600 }}>● REC  KAMERA TIANG</div>
        <div style={{ fontSize: 22, opacity: 0.7, marginTop: 10 }}>{line2}</div>
      </div>
      <div style={{ position: "absolute", right: 66, top: 196, textAlign: "right", ...mono }}>
        <div style={{ fontSize: 26, fontWeight: 600 }}>23:47:{String(12 + Math.floor(t)).padStart(2, "0")}</div>
      </div>
    </div>
  );

// karaoke captions: phrases of up to 5 words, broken after punctuation
type Phrase = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Phrase["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const last = i === c.words.length - 1;
    const punct = /[,.:?!]$/.test(w.w);
    if (last || cur.length >= 5 || (punct && cur.length >= 2)) {
      out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});

const Captions: React.FC<{ t: number }> = ({ t }) => {
  let idx = -1;
  for (let i = 0; i < PHRASES.length; i++) if (t >= PHRASES[i].s - 0.12) idx = i;
  if (idx < 0) return null;
  const ph = PHRASES[idx];
  const next = PHRASES[idx + 1];
  const endAt = next ? Math.min(next.s - 0.12, ph.e + 0.9) : ph.e + 0.9;
  if (t > endAt) return null;
  const inK = easeOut((t - (ph.s - 0.12)) / 0.18);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1392, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", gap: "0 18px", opacity: inK, transform: `translateY(${(1 - inK) * 16}px)` }}>
      {ph.words.map((w, i) => {
        const on = t >= w.s - 0.03;
        const active = on && t < w.e + 0.05;
        const pop = active ? Math.sin(clamp((t - w.s) / 0.18) * Math.PI) : 0;
        return (
          <span key={i} style={{
            display: "inline-block", fontFamily: `'${FONT}'`, fontWeight: 600, fontSize: 58, lineHeight: 1.18, letterSpacing: "-0.01em",
            color: active ? C.yellow : on ? C.ink : "#F1EEF488",
            transform: `translateY(${-pop * 8}px) scale(${1 + pop * 0.06})`,
            textShadow: active ? `0 0 22px ${C.amber}aa, 0 3px 12px #000` : "0 3px 12px #000",
            borderBottom: active ? `4px solid ${C.cyan}` : "4px solid transparent",
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const Overlay: React.FC<{ s: ReturnType<typeof stateAt> }> = ({ s }) => {
  const { t, cam, car, shot } = s;
  const id = shot.id;
  const els: React.ReactNode[] = [];
  const sensorShot = ["s3", "s4", "s5", "s10", "s12", "s13"].includes(id);

  if (id === "s1") {
    els.push(<Tag key="loc" x={66} y={210} text="PERSIMPANGAN · 23:47" o={fadeIn(t, 0.3)} color={C.ink} size={26} />);
  }
  if (id === "s2") {
    const lens = project(cam, camLocal(CAM1, [0, 0, 0.46]));
    els.push(<Label key="cam" x={lens.x} y={lens.y} text="KAMERA TILANG" o={fadeIn(t, W("kamera") )} dx={110} dy={-120} />);
  }
  if (id === "s3") {
    els.push(<div key="sweep" style={{ position: "absolute", left: 0, right: 0, top: s.sweep * 1920 - 3, height: 6, background: C.cyan, boxShadow: `0 0 30px ${C.cyan}`, opacity: s.sweep > 0.001 && s.sweep < 0.999 ? 1 : 0 }} />);
    els.push(<SensorHud key="hud" t={t} o={fadeIn(t, B.bright - 0.3)} line2="MATA KAMERA" />);
    els.push(<LockBox key="lock" cam={cam} car={car} o={fadeIn(t, B.bright + 0.2, 0.35)} label="PALING TERANG" />);
  }
  if (id === "s4") {
    els.push(<SensorHud key="hud" t={t} o={1} />);
    els.push(<LockBox key="lock" cam={cam} car={car} o={1} label="PLAT TERKUNCI" />);
    const n = Math.floor(clamp((t - B.ocr0) / (B.ocr1 - B.ocr0)) * 10.999);
    const txt = PLATE.slice(0, n);
    const o = fadeIn(t, B.ocr0 - 0.3);
    els.push(
      <div key="ocr" style={{ position: "absolute", left: 66, top: 1060, opacity: o }}>
        <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600, ...mono }}>ANPR · PENGENAL PLAT OTOMATIS</div>
        <div style={{ marginTop: 12, width: 620, height: 130, background: "#05020Fd8", border: `3px solid ${C.cyan}`, display: "flex", alignItems: "center", paddingLeft: 34, fontSize: 92, fontWeight: 600, color: C.yellow, ...mono, letterSpacing: "0.08em" }}>
          {txt}<span style={{ opacity: Math.floor(t * 4) % 2 ? 1 : 0.2, color: C.cyan }}>▌</span>
        </div>
      </div>,
    );
  }
  if (id === "s5") {
    els.push(<SensorHud key="hud" t={t} o={1 - shot.u} />);
    els.push(<Tag key="key" x={66} y={330} text="KUNCINYA: PLAT ITU SENDIRI" o={fadeIn(t, W("Kuncinya"))} color={C.yellow} size={34} />);
  }
  if (id === "s6") {
    const lens = project(cam, camLocal(CAM1, [0, 0, 0.47]));
    const led = project(cam, camLocal(CAM1, [-0.38, 0, 0.37]));
    els.push(<Label key="lens" x={lens.x} y={lens.y} text="LENSA" o={fadeIn(t, B.lens - 0.2)} dx={120} dy={150} />);
    els.push(<Label key="led" x={led.x} y={led.y} text="LAMPU KAMERA" o={fadeIn(t, B.lightOn)} color={C.yellow} dx={-110} dy={-170} align="right" />);
    els.push(<Tag key="own" x={66} y={330} text="CAHAYANYA SENDIRI" o={fadeIn(t, W("cahayanya"))} color={C.yellow} size={30} />);
  }
  if (id === "s7") {
    const o = fadeIn(t, shot.a + 0.3);
    els.push(<div key="div" style={{ position: "absolute", top: 0, bottom: 0, left: s.splitX * 1080 - 2, width: 4, background: C.cyan, boxShadow: `0 0 24px ${C.cyan}`, opacity: s.splitX < 0.999 ? 1 : 0 }} />);
    els.push(<Tag key="eye" x={50} y={250} text="MATA MANUSIA" o={o} size={28} />);
    els.push(<Tag key="cam" x={590} y={250} text="KAMERA" o={o} color={C.cyan} size={28} />);
    els.push(<Tag key="eye2" x={50} y={1120} text="gelap" o={fadeIn(t, B.ir + 0.5)} size={30} />);
    els.push(<Tag key="cam2" x={590} y={1120} text="terang" o={fadeIn(t, B.ir + 0.5)} color={C.yellow} size={30} />);
    els.push(<Tag key="ir" x={50} y={1210} text="INFRAMERAH: TAK TERLIHAT MATA" o={fadeIn(t, B.ir)} color={C.cyan} size={28} bg="#05020Fee" />);
  }
  if (id === "s8") {
    els.push(<Tag key="v" x={66} y={250} text="VARIAN LAIN: KILATAN LAMPU" o={fadeIn(t, shot.a + 0.25)} color={C.ink} size={30} />);
    const lens = project(cam, camLocal(CAM1, [-0.38, 0, 0.4]));
    els.push(<div key="fl" style={{ position: "absolute", left: lens.x - 260, top: lens.y - 260, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, #ffffff 0%, #ffffffcc 12%, #ffffff33 40%, #ffffff00 70%)", opacity: clamp(s.flash * 1.4) }} />);
    els.push(<Label key="src" x={lens.x} y={lens.y} text="KILATAN DARI KAMERA" o={fadeIn(t, B.flash - 0.1)} color={C.yellow} dx={-60} dy={220} />);
  }
  if (id === "s9") {
    const hit = project(cam, [BEAD_HITS[2], 0.25, 0]);
    const bead = project(cam, [-1.2, -0.2, 0.4]);
    const alu = project(cam, [1.2, -1.7, 1.6]);
    const src = project(cam, BEAD_SRC.clone().multiplyScalar(11).add(new THREE.Vector3(BEAD_HITS[1], 0.25, 0)));
    els.push(<Tag key="t" x={66} y={250} text="PENAMPANG PLAT (ILUSTRASI)" o={fadeIn(t, shot.a + 0.2)} size={26} />);
    els.push(<Label key="b" x={bead.x} y={bead.y} text="MANIK KACA" o={fadeIn(t, W("retroreflektif"))} dx={40} dy={-300} />);
    els.push(<Label key="a" x={alu.x} y={alu.y} text="PELAT LOGAM" o={fadeIn(t, W("retroreflektif") + 0.4)} dx={-40} dy={-160} align="right" />);
    els.push(<Label key="s" x={src.x} y={src.y} text="DARI LAMPU KAMERA" o={fadeIn(t, B.beadIn + 0.2)} color={C.amber} dx={90} dy={-40} />);
    els.push(<Label key="r" x={hit.x} y={hit.y} text="BALIK KE SUMBER" o={fadeIn(t, B.beadOut + 0.5)} color={C.yellow} dx={80} dy={-260} />);
  }
  if (id === "s10") {
    const p = plateWorld(car);
    const bg = project(cam, p.clone().add(new THREE.Vector3(-0.27, 0.06, 0)));
    const ch = project(cam, p.clone().add(new THREE.Vector3(0.05, 0.0, 0)));
    els.push(<SensorHud key="hud" t={t} o={1} />);
    els.push(<Label key="bg" x={bg.x} y={bg.y} text="LATAR: MENYALA" o={fadeIn(t, B.bg)} color={C.yellow} dx={40} dy={-260} />);
    els.push(<Label key="ink" x={ch.x} y={ch.y} text="HURUF: TETAP GELAP" o={fadeIn(t, B.ink)} dx={40} dy={240} />);
  }
  if (id === "s11") {
    const oldP = project(cam, [-2.15, 2.6 + 0.63, 0]);
    const newP = project(cam, [-2.15, 0.1 + 0.63, 0]);
    els.push(<Tag key="o" x={Math.max(50, oldP.x)} y={oldP.y - 70} text="SEBELUM: DASAR HITAM" o={fadeIn(t, shot.a + 0.2)} size={28} />);
    els.push(<Tag key="n" x={Math.max(50, newP.x)} y={newP.y - 70} text="SEJAK 2022: DASAR PUTIH" o={fadeIn(t, B.white)} color={C.yellow} size={28} />);
    const kc = fadeIn(t, B.contrast, 0.5);
    // contrast bars beside each plate tag (illustrative), clear of the caption band
    [[oldP.y - 70, 0.35, C.magenta], [newP.y - 70, 0.95, C.yellow]].forEach(([y, v, col], i) => {
      els.push(<div key={`kb${i}`} style={{ position: "absolute", left: 600, top: (y as number) + 14, height: 22, width: 400 * (v as number) * kc, background: col as string, boxShadow: `0 0 16px ${col as string}88` }} />);
    });
    els.push(<div key="kt" style={{ position: "absolute", left: 600, top: oldP.y - 120, fontSize: 22, color: C.cyan, fontWeight: 600, opacity: kc, ...mono }}>KONTRAS (ILUSTRASI)</div>);
  }
  if (id === "s12" || id === "s13") {
    const frozen = t >= B.freeze;
    els.push(<SensorHud key="hud" t={frozen ? B.freeze : t} o={1} />);
    if (!frozen) {
      // speed streaks while the car moves
      const k = clamp((t - shot.a) / (B.freeze - shot.a));
      els.push(
        <svg key="sp" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 * Math.sin(k * Math.PI) }}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = 140 + ((i * 397) % 820), y0 = ((i * 211 + t * 2600) % 2200) - 200;
            return <line key={i} x1={x} y1={y0} x2={x - 6} y2={y0 + 160} stroke={C.yellow} strokeWidth={2} strokeOpacity={0.5} />;
          })}
        </svg>,
      );
    }
    const so = fadeIn(t, B.speed - 0.2);
    els.push(
      <div key="sh" style={{ position: "absolute", left: 66, top: 330, opacity: so, ...mono }}>
        <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600 }}>SHUTTER</div>
        <div style={{ fontSize: 110, fontWeight: 300, color: C.ink, lineHeight: 1.05, letterSpacing: "0.02em" }}>±1/1000<span style={{ fontSize: 44 }}> dtk</span></div>
      </div>,
    );
    // iris snap at the freeze
    const ir = Math.exp(-Math.pow((t - B.freeze) / 0.09, 2));
    if (ir > 0.01) {
      els.push(
        <svg key="iris" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const a0 = (i / 6) * Math.PI * 2 + ir;
            const r = 1300 * (1 - ir * 0.92);
            const cx = 540 + Math.cos(a0) * (r + 700), cy = 860 + Math.sin(a0) * (r + 700);
            return <circle key={i} cx={cx} cy={cy} r={1000} fill="#05020F" />;
          })}
        </svg>,
      );
    }
    if (frozen) {
      els.push(<div key="fr" style={{ position: "absolute", left: 40, right: 40, top: 160, bottom: 400, border: `3px solid ${C.ink}66` }} />);
      els.push(<Tag key="beku" x={66} y={560} text="MOBIL MEMBEKU" o={fadeIn(t, B.freeze + 0.1)} color={C.yellow} size={30} />);
    }
  }
  if (id === "s13") {
    const steps = [["CARI", B.find], ["LURUSKAN", B.straight], ["POTONG", B.cut], ["BACA", B.read]] as const;
    const cur = steps.reduce((acc, st, i) => (t >= st[1] - 0.1 ? i : acc), -1);
    els.push(<div key="dim" style={{ position: "absolute", inset: 0, background: "#05020F", opacity: 0.45 * fadeIn(t, B.straight - 0.2) }} />);
    els.push(<LockBox key="lock" cam={cam} car={car} o={fadeIn(t, B.find, 0.3)} label="1 · CARI PLAT" />);
    els.push(
      <div key="steps" style={{ position: "absolute", left: 66, right: 66, top: 690, display: "flex", gap: 10, opacity: fadeIn(t, B.find - 0.2), ...mono }}>
        {steps.map(([n], i) => (
          <div key={n} style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 21, fontWeight: 600, color: i <= cur ? "#05020F" : C.ink, background: i === cur ? C.yellow : i < cur ? C.cyan : "#05020Fcc", border: `2px solid ${i <= cur ? "transparent" : "#ffffff44"}` }}>{i + 1} {n}</div>
        ))}
      </div>,
    );
    const sk = 1 - fadeIn(t, B.straight + 0.15, 0.6);
    const gap = 26 * fadeIn(t, B.cut, 0.5);
    const box = fadeIn(t, B.cut, 0.3);
    const cropO = fadeIn(t, B.straight - 0.1, 0.3);
    els.push(
      <div key="crop" style={{ position: "absolute", left: 540 - 330, top: 800, width: 660, opacity: cropO, perspective: 900 }}>
        <div style={{ transform: `rotateY(${sk * 32}deg) rotateZ(${-sk * 7}deg) scale(${0.85 + 0.15 * cropO})`, boxShadow: `0 0 50px #F7D03855`, border: `3px solid ${C.cyan}` }}>
          <PlateArt w={654} gap={gap} boxes={box} />
        </div>
      </div>,
    );
    const ro = fadeIn(t, B.read - 0.1);
    const n = Math.floor(clamp((t - B.read) / 0.6) * 10.999);
    els.push(
      <div key="read" style={{ position: "absolute", left: 66, right: 66, top: 1035, opacity: ro, display: "flex", alignItems: "center", justifyContent: "space-between", ...mono }}>
        <div style={{ fontSize: 64, fontWeight: 600, color: C.yellow }}>{PLATE.slice(0, n)}</div>
        <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600, opacity: fadeIn(t, B.read + 0.6) }}>CEK POLA ✓</div>
      </div>,
    );
  }
  if (id === "s14") {
    // solid dark plate, placed below the bright gantry arm so it stays readable
    els.push(<Tag key="j" x={66} y={560} text="BUKAN HAKIM TERAKHIR" o={fadeIn(t, B.judge - 0.1)} color={C.yellow} size={36} bg="#05020F" />);
    els.push(<Tag key="d" x={66} y={650} text="FOTO → PETUGAS" o={fadeIn(t, B.judge + 0.5)} color={C.cyan} size={28} bg="#05020F" />);
  }
  if (id === "s15") els.push(<Office key="off" t={t} a={shot.a} b={shot.b} />);
  if (id === "s16") els.push(<Letter key="let" t={t} a={shot.a} b={shot.b} />);
  if (id === "s17" || id === "s18") {
    els.push(<SensorHud key="hud" t={t} o={0.8} />);
    if (id === "s17") els.push(<LockBox key="lock" cam={cam} car={car} o={1 - shot.u} />);
    const big = fadeIn(t, W("gelap", SEC.OUTRO[0]) - 0.1, 0.5);
    els.push(
      <div key="big" style={{ position: "absolute", left: 66, right: 66, top: 330, opacity: big, transform: `translateY(${(1 - big) * 20}px)` }}>
        <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.0, color: C.ink, letterSpacing: "-0.02em" }}>Gelap bukan<br /><span style={{ color: C.yellow }}>tempat bersembunyi</span></div>
      </div>,
    );
    if (id === "s18") {
      const q = fadeIn(t, shot.a + 0.2, 0.5);
      els.push(
        <div key="q" style={{ position: "absolute", left: 66, right: 66, top: 1080, opacity: q, padding: "26px 30px", background: "#05020Fdd", border: `3px solid ${C.cyan}`, transform: `translateY(${(1 - q) * 20}px)` }}>
          <div style={{ fontSize: 44, fontWeight: 600, color: C.ink, lineHeight: 1.15 }}>Pernah dapat surat konfirmasi ETLE?</div>
          <div style={{ fontSize: 26, color: C.cyan, marginTop: 12, ...mono }}>CERITAKAN DI KOMENTAR</div>
        </div>,
      );
    }
  }

  // cut accents: sensor-tear bars for a few frames around each cut
  const near = SHOT_STARTS.slice(1).reduce((m, c) => Math.min(m, Math.abs(t - c)), 9);
  const tear = clamp(1 - near / 0.1);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: `'${FONT}'`, color: C.ink }}>
      {id !== "s15" && id !== "s16" ? (
        <>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 40%, transparent 55%, #05020Fcc 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 380, background: `linear-gradient(#05020F${sensorShot ? "dd" : "99"} 40%, #05020F00)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 720, background: "linear-gradient(#05020F00, #05020Fcc 45%, #05020F)" }} />
        </>
      ) : null}
      {els}
      <Captions t={t} />
      {tear > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tear }}>
          {[0.12, 0.31, 0.47, 0.66, 0.83].map((y, i) => (
            <div key={i} style={{ position: "absolute", left: (i % 2 ? -1 : 1) * 60 * tear, right: 0, top: `${y * 100}%`, height: 10 + (i % 3) * 14, background: i % 2 ? C.magenta : C.cyan, opacity: 0.5, mixBlendMode: "screen" }} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = stateAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      {t < OUTRO_START + 0.8 ? (
        <Stage3D background={C.black} overlay={() => <Overlay s={s} />}>
          <World s={s} />
        </Stage3D>
      ) : null}
      <Outro start={OUTRO_START} />
    </AbsoluteFill>
  );
};
