// EP053 film — "Lampu Merah Bisa Mengatur Ribuan Kendaraan Secara Otomatis?" (VOXELVERSE).
// Every cut, signal change, count and caption is read from timeline.json via ./times. No audio here: the
// lead muxes VO + music + SFX separately.

import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap, PerspectiveCamera, Vector3 } from "three";
import { cameraAt, type CamState, type Shot } from "../../kits/voxelverse/camera/rig";
import { CameraRig, Post } from "../../kits/voxelverse/camera/Post";
import { DuskLight, Environment, Fog, Sky } from "../../kits/voxelverse/world/Atmosphere";
import type { V3 } from "../../kits/voxelverse/lib/voxel";
import { FONT, fontReady } from "../../core/type/fonts";
import { Outro } from "../_shared/Outro";
import { SEC, TM, TOTAL, WORDS, T } from "./times";
import { ARM, BOARD, FilmWorld, ROOM, SIG, S_VEHICLES, WAVE_GREEN_AT, WAVE_Z, boardLit, lampOf, queueCount, vehiclePos } from "./filmWorld";

const FILM_FPS = 60;
const F = (sec: number) => sec * FILM_FPS;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* ------------------------------------------------------------------ shots (seconds on the VO clock) */
const CUT = {
  konteks: SEC.KONTEKS[0] - 0.2,
  empty: T("hijau", 1, SEC.KONTEKS[0]) - 0.15,
  mek: SEC.MEKANISME[0] - 0.1,
  loop: T("di", 1, T("jalan", 1, SEC.MEKANISME[0])) - 0.1,
  pov: T("ditambah") - 0.05,
  wide: T("komputer") - 0.15,
  reveal: SEC.REVEAL[0] - 0.2,
  board: T("di", 1, SEC.PAYOFF[0]) - 0.1,
  room: TM.petugas - 0.12,
  outro: SEC.OUTRO[0] - 0.2,
};
const lead = S_VEHICLES.find((v) => v.kind !== "bike")!;
const chase = (t: number) => {
  const z = vehiclePos(lead, t)[2];
  return { pos: [2.6, 8.5, z + 15] as V3, at: [-1.4, 1.6, z - 15] as V3 };
};
const sCam = SIG("S").cam;
const shot = (name: string, a: number, b: number, keys: { t: number; pos: V3; at: V3; fov: number }[], o: Partial<Omit<Shot, "focus">> & { focus: V3 }): Shot => ({
  name,
  from: F(a),
  to: F(b),
  keys: keys.map((k) => ({ f: F(k.t), pos: k.pos, at: k.at, fov: k.fov })),
  focus: () => o.focus,
  aperture: o.aperture ?? 0.0006,
  maxBlur: o.maxBlur ?? 0.006,
  exposure: o.exposure ?? 1.05,
  fog: o.fog ?? 0.006,
  handheld: o.handheld ?? 0.002,
});
const SHOTS: Shot[] = [
  shot("hook: red lamp to the junction", 0, CUT.konteks, [
    { t: 0, pos: [-0.2, 5.0, 11.6], at: [-1.3, 4.7, 6.9], fov: 36 },
    { t: 3.0, pos: [0.6, 6.6, 15.5], at: [-1.2, 4.0, 4], fov: 40 },
    { t: CUT.konteks, pos: [5.5, 23, 41], at: [-0.4, 0, -2.5], fov: 46 },
  ], { focus: [-1.6, 4, 6.9], aperture: 0.0008 }),
  shot("konteks: waiting at red", CUT.konteks, CUT.empty, [
    { t: CUT.konteks, pos: [0.7, 1.55, 21], at: [-1.3, 2.6, 5], fov: 40 },
    { t: CUT.empty, pos: [0.5, 1.7, 18.2], at: [-1.3, 2.8, 4.5], fov: 39 },
  ], { focus: [-1.6, 1.5, 9], aperture: 0.0012 }),
  shot("konteks: empty east on green", CUT.empty, CUT.mek, [
    { t: CUT.empty, pos: [15.2, 2.4, 4.9], at: [2, 3.4, 0.5], fov: 42 },
    { t: CUT.mek, pos: [12.6, 2.9, 3.9], at: [1.5, 3.6, 0.8], fov: 41 },
  ], { focus: [6.9, 4, 1.6], aperture: 0.0009 }),
  shot("mekanisme: the pole camera reads the road", CUT.mek, CUT.loop, [
    { t: CUT.mek, pos: [-8.4, 8.6, 1.5], at: [-2.4, 3.4, 12], fov: 44 },
    { t: CUT.loop, pos: [-6.8, 7.6, 4.2], at: [-1.8, 2.0, 15], fov: 44 },
  ], { focus: [-3.0, 6, 6.9] }),
  shot("mekanisme: loop under the first car", CUT.loop, CUT.pov, [
    { t: CUT.loop, pos: [2.0, 2.6, 7.4], at: [-1.6, 0.2, 13.2], fov: 46 },
    { t: CUT.pov, pos: [2.0, 2.2, 8.6], at: [-1.6, 0.2, 13.6], fov: 45 },
  ], { focus: [-1.6, 0.3, 12.2], aperture: 0.0014 }),
  shot("mekanisme: camera POV counts the queue", CUT.pov, CUT.wide, [
    { t: CUT.pov, pos: add(sCam, [0.15, -0.25, 0.8]), at: [-1.6, 0, 22], fov: 50 },
    { t: CUT.wide, pos: add(sCam, [0.15, -0.2, 1.0]), at: [-1.6, 0, 21], fov: 46 },
  ], { focus: [-1.6, 0, 16], aperture: 0.0003, handheld: 0.001 }),
  shot("mekanisme: computer re-splits the green", CUT.wide, CUT.reveal, [
    { t: CUT.wide, pos: [6.5, 21, 37], at: [-0.5, 0, 1], fov: 46 },
    { t: TM.go, pos: [5, 20, 32], at: [-0.8, 0, -4], fov: 46 },
    { t: CUT.reveal, pos: chase(CUT.reveal).pos, at: chase(CUT.reveal).at, fov: 46 },
  ], { focus: [0, 1, 0] }),
  shot("reveal: green wave", CUT.reveal, CUT.board - 2.6, [
    { t: CUT.reveal, ...chase(CUT.reveal), fov: 46 },
    { t: (CUT.reveal + CUT.board - 2.6) / 2, ...chase((CUT.reveal + CUT.board - 2.6) / 2), fov: 46 },
    { t: CUT.board - 2.6, ...chase(CUT.board - 2.6), fov: 47 },
  ], { focus: [-1.6, 3, -30], aperture: 0.0003 }),
  shot("payoff: not every junction", CUT.board - 2.6, CUT.board, [
    { t: CUT.board - 2.6, ...chase(CUT.board - 2.6), fov: 47 },
    { t: CUT.board, pos: [6, 40, 4], at: [-1.2, 2, -40], fov: 46 },
  ], { focus: [0, 0, -20], aperture: 0.0002 }),
  shot("payoff: 115 of 321", CUT.board, CUT.room, [
    { t: CUT.board, pos: add(BOARD, [7, 44, 40]), at: add(BOARD, [0, 0, 3]), fov: 50 },
    { t: CUT.room, pos: add(BOARD, [-5, 38, 33]), at: add(BOARD, [0, 0, 2]), fov: 50 },
  ], { focus: BOARD, aperture: 0.0002, fog: 0.004 }),
  shot("payoff: control room", CUT.room, CUT.outro, [
    { t: CUT.room, pos: add(ROOM, [0.6, 3.6, 6.4]), at: add(ROOM, [0, 1.5, -5]), fov: 52 },
    { t: CUT.outro, pos: add(ROOM, [0.2, 3.3, 5.0]), at: add(ROOM, [0, 1.6, -5]), fov: 50 },
  ], { focus: add(ROOM, [0, 1.5, -2]), aperture: 0.0008, fog: 0, exposure: 1.1 }),
  shot("outro: the junction, still watched", CUT.outro, TOTAL + 1, [
    { t: CUT.outro, pos: [9, 27, 48], at: [-0.4, 0, -4], fov: 46 },
    { t: TOTAL, pos: [5, 25, 43], at: [-0.4, 0, -2.5], fov: 46 },
  ], { focus: [0, 1, 0], aperture: 0.0004 }),
];

/* ------------------------------------------------------------------ projection for HUD */
const projector = (cam: CamState, w: number, h: number) => {
  const c = new PerspectiveCamera(cam.fov, w / h, 0.03, 600);
  c.position.set(...cam.pos);
  c.lookAt(...cam.at);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return (p: V3) => {
    const v = new Vector3(...p).project(c);
    return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, front: v.z < 1 };
  };
};

/* ------------------------------------------------------------------ overlays */
const INK = "rgba(14,26,28,0.88)";
const CREAM = "#f6ecd6";
const AMBER = "#f2a33a";
const GREEN = "#5cffa4";
const RED = "#ff6a4a";
const CYAN = "#5ef0ff";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fadeIn = (t: number, a: number, d = 0.3) => clamp((t - a) / d);
const win = (t: number, a: number, b: number, d = 0.3) => Math.min(fadeIn(t, a, d), 1 - fadeIn(t, b - d, d));

const Panel: React.FC<{ k: number; style: React.CSSProperties; children: React.ReactNode; o: number }> = ({ k, style, children, o }) => (
  <div style={{ position: "absolute", background: INK, border: `${2 * k}px solid rgba(246,236,214,0.18)`, borderRadius: 22 * k, padding: `${22 * k}px ${28 * k}px`, opacity: o, transform: `translateY(${(1 - o) * 18 * k}px)`, boxShadow: `0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.35)`, ...style }}>{children}</div>
);
const Kicker: React.FC<{ k: number; c?: string; children: React.ReactNode }> = ({ k, c = AMBER, children }) => (
  <div style={{ fontSize: 24 * k, letterSpacing: "0.22em", fontWeight: 600, color: c }}>{children}</div>
);

const Bar: React.FC<{ k: number; label: string; w: number; color: string; note?: string }> = ({ k, label, w, color, note }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 * k, marginTop: 16 * k }}>
    <div style={{ width: 120 * k, fontSize: 30 * k, fontWeight: 600 }}>{label}</div>
    <div style={{ height: 30 * k, width: w * k, background: color, borderRadius: 8 * k, boxShadow: `0 0 ${18 * k}px ${color}88` }} />
    {note && <div style={{ fontSize: 26 * k, color, fontWeight: 600 }}>{note}</div>}
  </div>
);

const Hud: React.FC<{ t: number; cam: CamState; w: number; h: number }> = ({ t, cam, w, h }) => {
  const k = w / 1080;
  const proj = projector(cam, w, h);
  const top = 200 * k, left = 60 * k;
  const out: React.ReactNode[] = [];

  // HOOK: the same red, longer in the morning, shorter in the evening
  const hb = win(t, T("lama") - 0.25, T("siapa") + 0.4);
  if (hb > 0) {
    const sore = fadeIn(t, T("sore") - 0.3, 0.4);
    out.push(
      <Panel key="hook" k={k} o={hb} style={{ left, top }}>
        <Kicker k={k} c={RED}>LAMPU MERAH · SIMPANG YANG SAMA</Kicker>
        <Bar k={k} label="Pagi" w={560 * clamp(fadeIn(t, T("pagi") - 0.4, 0.6))} color="#ff4a32" note="lebih lama" />
        <div style={{ opacity: sore }}>
          <Bar k={k} label="Sore" w={230 * sore} color="#ff4a32" note="lebih singkat" />
        </div>
      </Panel>,
    );
  }
  // KONTEKS: one fixed clock that never looks at the road
  const fb = win(t, SEC.KONTEKS[0] - 0.1, CUT.mek + 0.1);
  if (fb > 0) {
    const ang = ((t - SEC.KONTEKS[0]) / 6) * 360;
    const R = 62 * k, cx = 76 * k, cy = 76 * k, circ = 2 * Math.PI * R;
    out.push(
      <Panel key="fixed" k={k} o={fb} style={{ left, top, display: "flex", alignItems: "center", gap: 26 * k }}>
        <svg width={152 * k} height={152 * k}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ff4a32" strokeWidth={18 * k} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#3dff90" strokeWidth={18 * k} strokeDasharray={`${circ * 0.45} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
          <line x1={cx} y1={cy} x2={cx + Math.sin((ang * Math.PI) / 180) * R * 0.95} y2={cy - Math.cos((ang * Math.PI) / 180) * R * 0.95} stroke={CREAM} strokeWidth={6 * k} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={8 * k} fill={CREAM} />
        </svg>
        <div>
          <Kicker k={k}>JADWAL TETAP</Kicker>
          <div style={{ fontSize: 36 * k, fontWeight: 600, marginTop: 8 * k, lineHeight: 1.15 }}>Hijau ⟶ merah<br />tiap putaran sama</div>
          <div style={{ fontSize: 24 * k, marginTop: 10 * k, opacity: 0.75 }}>{t > CUT.empty ? "jalan timur kosong, tetap hijau" : "antrean menunggu"}</div>
        </div>
      </Panel>,
    );
  }
  // MEKANISME: sensor labels
  const sl = win(t, TM.membaca - 0.2, CUT.loop + 0.1);
  if (sl > 0) {
    const p = proj(add(SIG("S").cam, [0, 0.4, 0]));
    if (p.front)
      out.push(
        <div key="camlabel" style={{ position: "absolute", left: p.x - 120 * k, top: p.y - 120 * k, opacity: sl, fontSize: 28 * k, fontWeight: 600, color: CYAN, background: INK, padding: `${8 * k}px ${16 * k}px`, borderRadius: 12 * k, border: `${2 * k}px solid ${CYAN}` }}>KAMERA</div>,
      );
  }
  const ll = win(t, TM.aspal - 0.2, CUT.pov + 0.1);
  if (ll > 0) {
    const p = proj([ARM("S").laneAt(14.2)[0] + 1.25, 0.05, 14.2]);
    if (p.front)
      out.push(
        <Panel key="loop" k={k} o={ll} style={{ left, top }}>
          <Kicker k={k} c={CYAN}>LOOP INDUKTIF DI ASPAL</Kicker>
          <div style={{ fontSize: 34 * k, fontWeight: 600, marginTop: 8 * k, lineHeight: 1.2 }}>Kawat tertanam, dialiri arus.<br />Logam mobil di atasnya<br />mengubah medan magnet.</div>
        </Panel>,
      );
  }
  // camera POV: analytics boxes on every south vehicle + radar tag + count
  if (t >= CUT.pov && t < CUT.wide) {
    // one box only: the front-most car whose outline sits fully inside the safe area of this POV
    const boxOf = (v: (typeof S_VEHICLES)[number]) => {
      const p = vehiclePos(v, t);
      const hl = v.len / 2, hw = 0.95, hh = v.kind === "truck" ? 2.8 : 1.9;
      const pts = [-1, 1].flatMap((sx) => [-1, 1].flatMap((sz) => [0, hh].map((y) => proj([p[0] + sx * hw, y, p[2] + sz * hl]))));
      return { y0: Math.min(...pts.map((q) => q.y)), y1: Math.max(...pts.map((q) => q.y)) };
    };
    const frontCar = S_VEHICLES.findIndex((v) => v.kind !== "bike" && boxOf(v).y1 < h - 400 * k && boxOf(v).y0 > 200 * k);
    const shown = S_VEHICLES.map((v, i) => ({ v, i })).filter(({ i }) => i === frontCar && t >= TM.boxAt(0));
    out.push(
      <div key="rec" style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 40 * k, right: 40 * k, top: 190 * k, bottom: 400 * k, border: `${3 * k}px solid rgba(94,240,255,0.55)`, borderRadius: 18 * k }} />
        <div style={{ position: "absolute", left: 66 * k, top: 214 * k, fontSize: 26 * k, fontWeight: 600, color: CYAN, letterSpacing: "0.12em" }}>● KAMERA SIMPANG · ANALITIK VIDEO</div>
        <div style={{ position: "absolute", right: 66 * k, top: 206 * k, fontSize: 30 * k, fontWeight: 600, color: CREAM, background: INK, padding: `${6 * k}px ${16 * k}px`, borderRadius: 10 * k }}>ANTREAN {queueCount("S", t)}</div>
        {t > TM.radar - 0.2 && <div style={{ position: "absolute", right: 66 * k, top: 262 * k, fontSize: 24 * k, fontWeight: 600, color: "#ffd27a" }}>+ RADAR: jarak & kecepatan</div>}
        {shown.map(({ v, i }) => {
          const p = vehiclePos(v, t);
          const hl = v.len / 2, hw = v.kind === "bike" ? 0.4 : 0.95, hh = v.kind === "truck" ? 2.8 : v.kind === "bike" ? 1.85 : 1.9;
          const pts = [-1, 1].flatMap((sx) => [-1, 1].flatMap((sz) => [0, hh].map((y) => proj([p[0] + sx * hw, y, p[2] + sz * hl]))));
          const x0 = Math.min(...pts.map((q) => q.x)), x1 = Math.max(...pts.map((q) => q.x));
          const y0 = Math.min(...pts.map((q) => q.y)), y1 = Math.max(...pts.map((q) => q.y));
          if (y1 < 180 * k || y0 > h - 380 * k) return null;
          const pop = clamp((t - TM.boxAt(0) - i * 0) / 0.15);
          const label = v.kind === "bike" ? "MOTOR" : v.kind === "truck" ? "TRUK" : "MOBIL · TERDETEKSI";
          const col = v.kind === "bike" ? "#ffd27a" : CYAN;
          return (
            <div key={v.id} style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, border: `${2.5 * k}px solid ${col}`, opacity: pop, transform: `scale(${1.25 - 0.25 * pop})` }}>
              <div style={{ position: "absolute", left: -2 * k, top: -26 * k, fontSize: 18 * k, fontWeight: 600, background: col, color: "#0e1a1c", padding: `${1 * k}px ${6 * k}px` }}>{label}</div>
            </div>
          );
        })}
      </div>,
    );
  }
  // computer re-splits the green: south longer, east shorter
  const sb = win(t, TM.menambah - 0.35, TM.go + 2.2);
  if (sb > 0) {
    const g = clamp((t - TM.menambah) / 1.6);
    out.push(
      <Panel key="split" k={k} o={sb} style={{ left, top }}>
        <Kicker k={k}>KOMPUTER MENGATUR ULANG</Kicker>
        <Bar k={k} label="Selatan" w={250 + 300 * g} color="#3dff90" note={g > 0.05 ? "hijau +" : ""} />
        <div style={{ fontSize: 22 * k, opacity: 0.75, marginLeft: 138 * k }}>12 kendaraan antre</div>
        <Bar k={k} label="Timur" w={Math.max(30, 250 - 200 * g)} color="#3dff90" note={g > 0.05 ? "hijau −" : ""} />
        <div style={{ fontSize: 22 * k, opacity: 0.75, marginLeft: 138 * k }}>jalan kosong</div>
      </Panel>,
    );
  }
  // green wave: number each head as it turns green, ahead of the platoon
  const gw = win(t, CUT.reveal, CUT.board - 2.0);
  if (gw > 0) {
    WAVE_Z.forEach((_, i) => {
      const s = SIG(`wave${i}`);
      const p = proj(add(s.head, [0, 1.6, 0]));
      const on = clamp((t - WAVE_GREEN_AT[i]) / 0.25);
      if (!p.front || p.y < 180 * k || p.y > h - 380 * k) return;
      const green = lampOf(`wave${i}`, t) === "green";
      out.push(
        <div key={`w${i}`} style={{ position: "absolute", left: p.x - 30 * k, top: p.y - 30 * k, width: 60 * k, height: 60 * k, borderRadius: 30 * k, background: green ? "#2cff8a" : INK, border: `${3 * k}px solid ${green ? "#eafff2" : RED}`, color: green ? "#0e1a1c" : RED, fontSize: 32 * k, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", opacity: gw, transform: `scale(${1 + 0.35 * on * Math.exp(-(t - WAVE_GREEN_AT[i]) * 4)})` }}>{i + 1}</div>,
      );
    });
    out.push(
      <Panel key="wave" k={k} o={win(t, CUT.reveal, CUT.board - 2.0)} style={{ left, top }}>
        <Kicker k={k} c={GREEN}>GELOMBANG HIJAU</Kicker>
        <div style={{ fontSize: 32 * k, fontWeight: 600, marginTop: 8 * k, lineHeight: 1.2 }}>Hijau berurutan, ada jeda<br />mengikuti laju rombongan</div>
      </Panel>,
    );
  }
  // payoff numbers
  const pb = win(t, TM.jakarta - 0.3, CUT.room + 0.05, 0.35);
  if (pb > 0) {
    out.push(
      <Panel key="payoff" k={k} o={pb} style={{ left, right: left, top }}>
        <Kicker k={k} c={GREEN}>JAKARTA · FEBRUARI 2026</Kicker>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 * k, marginTop: 6 * k }}>
          <div style={{ fontSize: 150 * k, fontWeight: 600, color: GREEN, lineHeight: 1 }}>{boardLit(t)}</div>
          <div style={{ fontSize: 54 * k, fontWeight: 600 }}>dari 321 simpang</div>
        </div>
        <div style={{ fontSize: 30 * k, marginTop: 8 * k, opacity: 0.9 }}>bersinyal sudah memakai sistem adaptif</div>
        <div style={{ fontSize: 20 * k, marginTop: 12 * k, opacity: 0.6 }}>Sumber: Dishub DKI, via Kompas.com (26 Feb 2026)</div>
      </Panel>,
    );
  }
  const rb = win(t, CUT.room, CUT.outro + 0.05);
  if (rb > 0)
    out.push(
      <Panel key="room" k={k} o={rb} style={{ left, top }}>
        <Kicker k={k} c={CYAN}>PUSAT KENDALI</Kicker>
        <div style={{ fontSize: 32 * k, fontWeight: 600, marginTop: 8 * k }}>Petugas tetap memantau<br />dan bisa mengambil alih</div>
      </Panel>,
    );
  return <>{out}</>;
};

/* ------------------------------------------------------------------ karaoke captions */
type Group = { words: typeof WORDS; from: number; to: number };
const GROUPS: Group[] = (() => {
  const gs: Group[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const pause = next ? next.s - w.e > 0.35 : true;
    if (cur.length >= 5 || /[.,?!:]$/.test(w.w) || pause) {
      gs.push({ words: cur, from: cur[0].s - 0.12, to: 0 });
      cur = [];
    }
  });
  gs.forEach((g, i) => (g.to = i + 1 < gs.length ? Math.min(gs[i + 1].from, g.words[g.words.length - 1].e + 0.8) : g.words[g.words.length - 1].e + 0.8));
  return gs;
})();
const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t > SEC.OUTRO[1] + 0.2) return null;
  const g = GROUPS.find((x) => t >= x.from && t < x.to);
  if (!g) return null;
  const o = clamp((t - g.from) / 0.12) * clamp((g.to - t) / 0.12);
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, top: 1405 * k, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(14,26,28,0.82)", borderRadius: 20 * k, padding: `${14 * k}px ${26 * k}px`, borderBottom: `${4 * k}px solid ${AMBER}`, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 14 * k, rowGap: 4 * k, maxWidth: 980 * k }}>
        {g.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < (g.words[i + 1]?.s ?? w.e + 0.25);
          const done = t >= w.s;
          const bounce = active ? 1 + 0.12 * clamp(1 - (t - w.s) / 0.18) : 1;
          return (
            <span key={i} style={{ fontSize: 50 * k, fontWeight: 600, lineHeight: 1.18, color: active ? AMBER : done ? CREAM : "rgba(246,236,214,0.55)", display: "inline-block", transform: `scale(${bounce}) translateY(${(1 - bounce) * 40 * k}px)` }}>{w.w}</span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ composition */
const useFontReady = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep053 film font"));
  useEffect(() => {
    fontReady().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

/** Short dips to dark on the cuts that change place (map board, control room, back to the street). */
const DIPS = [CUT.board, CUT.room, CUT.outro];
const dip = (t: number) => Math.max(0, ...DIPS.map((c) => 1 - Math.abs(t - c) / 0.14));

const Scene: React.FC<{ f: number; t: number; cam: CamState }> = ({ f, t, cam }) => (
  <>
    <CameraRig cam={cam} />
    <Sky boost={0.92} />
    <Environment />
    <Fog density={cam.fog} />
    <DuskLight from={[-18, 28, 20]} size={45} intensity={1.0} fill={0.6} />
    <FilmWorld t={t} f={f} cam={cam} hideChips={f >= F(CUT.pov) && f < F(CUT.wide)} />
    <Post cam={cam} frame={f} />
  </>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = F(t);
  const cam = cameraAt(SHOTS, f);
  const ok = useFontReady();
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1d2a2b", fontFamily: FONT, color: CREAM }}>
      {ok && (
        <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
          gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
          camera={{ fov: 44, near: 0.03, far: 600, position: [0, 3, 10] }}>
          <Scene f={f} t={t} cam={cam} />
        </ThreeCanvas>
      )}
      {ok && <Hud t={t} cam={cam} w={width} h={height} />}
      <Captions t={t} k={k} />
      <AbsoluteFill style={{ background: "#0b1112", opacity: dip(t), pointerEvents: "none" }} />
      <Outro start={SEC.OUTRO[1] + 0.2} />
    </AbsoluteFill>
  );
};
