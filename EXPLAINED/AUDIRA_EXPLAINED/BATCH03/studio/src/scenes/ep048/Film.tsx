// EP048 film — "Bagaimana Pabrik Mobil Bisa Memproduksi Ribuan Mobil?" (BUILDFORGE).
// World from the approved cover (roofless plant, daylight, mint seats, orange robots), built once in
// world.ts and posed per frame from the VO clock (clock.ts). Camera cuts follow VO sentences.

import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, fontReady } from "../../core/type/fonts.ts";
import { createSky, skyEnvironment } from "../../kits/buildforge/environment/Sky.ts";
import { Outro } from "../_shared/Outro.tsx";
import { C, SKY } from "./Cover.tsx";
// lower, raking sun for the film (contrast); the cover keeps its own sun
const SUN = new THREE.Vector3(-0.55, 0.6, 0.58).normalize();
import { buildFilmWorld } from "./world.ts";
import { B, TIMELINE, clamp, smooth } from "./clock.ts";

type V3 = [number, number, number];
type Key = { t: number; pos: V3; tgt: V3; fov: number };
type ShotDef = { from: number; to: number; close: boolean; wide?: boolean; n: string; label: string; keys: Omit<Key, "t">[] };

const S = (from: number, to: number, close: boolean, n: string, label: string, keys: Omit<Key, "t">[], wide = false): ShotDef => ({ from, to, close, n, label, keys, wide });

export const SHOTS: ShotDef[] = [
  S(0, B.tapi, false, "", "", [
    { pos: [70, 2.3, 3.4], tgt: [50, 2.7, -0.6], fov: 46 },
    { pos: [66, 2.6, 2.6], tgt: [50, 2.6, -0.6], fov: 46 },
  ]),
  S(B.tapi, B.konteks, false, "", "", [
    { pos: [63, 3.5, 8.5], tgt: [50, 1.6, 0], fov: 42 },
    { pos: [70, 46, 34], tgt: [10, 0, 0], fov: 40 },
  ], true),
  S(B.konteks, B.dikerjakan, false, "", "SATU JALUR BERGERAK", [
    { pos: [-7, 4.6, 10.0], tgt: [-1.5, 1.0, 0], fov: 40 },
    { pos: [-1, 5.2, 10.0], tgt: [4.5, 1.0, 0], fov: 40 },
  ]),
  S(B.dikerjakan, B.mek, false, "", "SATU JALUR BERGERAK", [
    { pos: [12, 7.5, 13], tgt: [20, 0.8, 0], fov: 42 },
    { pos: [22, 8.5, 14], tgt: [30, 0.8, 0], fov: 42 },
  ]),
  S(B.mek, B.robot, true, "01", "PRESS PANEL", [
    { pos: [-28.6, 2.9, 14.2], tgt: [-37.8, 2.5, 0], fov: 46 },
    { pos: [-30.0, 2.6, 12.8], tgt: [-37.4, 2.3, 0], fov: 46 },
  ]),
  S(B.robot, B.bodi, true, "02", "LAS BODI", [
    { pos: [-22.4, 3.3, 7.6], tgt: [-27, 1.3, 0], fov: 42 },
    { pos: [-25.2, 4.5, 8.6], tgt: [-27, 1.3, 0], fov: 42 },
  ]),
  S(B.bodi, B.dilapisi, true, "03", "CELUP ANTIKARAT", [
    { pos: [-20.0, 7.6, 9.6], tgt: [-19.0, -0.2, 0], fov: 50 },
    { pos: [-16.0, 7.2, 9.6], tgt: [-15.5, -0.2, 0], fov: 50 },
    { pos: [-12.0, 6.6, 9.4], tgt: [-11.5, 0.2, 0], fov: 50 },
  ]),
  S(B.dilapisi, B.reveal, true, "04", "CAT WARNA + OVEN", [
    { pos: [-1.6, 3.4, 8.6], tgt: [-5, 1.2, 0], fov: 42 },
    { pos: [-1.0, 3.3, 8.4], tgt: [-4.4, 1.2, 0], fov: 42 },
    { pos: [-2.0, 3.4, 9.8], tgt: [0.2, 1.3, 0], fov: 44 },
  ]),
  S(B.reveal, B.lalu7, true, "05", "PINTU DILEPAS", [
    { pos: [18.2, 2.8, 8.6], tgt: [14, 1.0, 0.6], fov: 44 },
    { pos: [16.2, 3.4, 9.2], tgt: [14, 1.0, 0.6], fov: 44 },
  ]),
  S(B.lalu7, B.pekerja, true, "06", "BODI + MESIN & SUSPENSI", [
    { pos: [26.8, 1.2, 7.6], tgt: [22, 1.4, 0], fov: 46 },
    { pos: [25.2, 1.7, 8.6], tgt: [22, 1.3, 0], fov: 46 },
  ]),
  S(B.pekerja, B.payoff, true, "07", "PART TEPAT WAKTU", [
    { pos: [34.6, 3.3, 8.4], tgt: [30, 1.0, -0.8], fov: 46 },
    { pos: [32.4, 4.2, 9.4], tgt: [30, 1.0, -1.0], fov: 46 },
  ]),
  S(B.payoff, B.diuji, true, "08", "UJI KEBOCORAN", [
    { pos: [42.6, 2.5, 8.0], tgt: [38, 1.1, 0], fov: 44 },
    { pos: [41.0, 2.1, 7.2], tgt: [38, 1.1, 0], fov: 44 },
  ]),
  S(B.diuji, B.kalau, true, "09", "UJI DI ATAS ROLLER", [
    { pos: [49.6, 0.95, 6.0], tgt: [46, 0.55, 0], fov: 44 },
    { pos: [48.6, 1.05, 5.3], tgt: [46, 0.55, 0], fov: 44 },
  ]),
  S(B.kalau, B.outro, false, "10", "TALI ANDON", [
    { pos: [16.5, 5.0, 12.6], tgt: [26, 2.2, -0.4], fov: 46 },
    { pos: [19.5, 4.6, 11.8], tgt: [26, 2.2, -0.4], fov: 46 },
  ]),
  S(B.outro, B.total + 0.1, false, "", "", [
    { pos: [44, 4.5, 15], tgt: [28, 0.8, 0], fov: 44 },
    { pos: [64, 30, 34], tgt: [24, 0, 0], fov: 42 },
  ], true),
];

export const shotIndex = (t: number) => {
  for (let i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].to) return i;
  return SHOTS.length - 1;
};

const camAt = (t: number) => {
  const s = SHOTS[shotIndex(t)];
  const u = clamp((t - s.from) / (s.to - s.from));
  const n = s.keys.length - 1;
  const seg = Math.min(n - 1, Math.floor(u * n));
  const k = smooth(0, 1, u * n - seg);
  const a = s.keys[seg];
  const b = s.keys[seg + 1];
  const L = (p: V3, q: V3): V3 => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  const tgt = L(a.tgt, b.tgt);
  const fov = a.fov + (b.fov - a.fov) * k;
  // close shots: tighter lens and a lower aim so the subject fills the band above the caption
  if (s.close) tgt[1] -= 0.35;
  return { def: s, pos: L(a.pos, b.pos), tgt, fov: s.close ? fov * 0.84 : fov };
};

// ---------- 3D ----------
const World: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const { gl, scene } = useThree();
  const w = useMemo(() => buildFilmWorld(), []);
  const sky = useMemo(() => createSky(SKY, SUN), []);
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight("#fff0d8", 3.6);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  const rim = useMemo(() => new THREE.DirectionalLight("#dfeeff", 1.6), []);
  useLayoutEffect(() => {
    const env = skyEnvironment(gl, SKY, SUN);
    scene.environment = env;
    scene.environmentIntensity = 0.8;
    scene.fog = new THREE.Fog("#e7ebe6", 22, 110); // thin plant haze separates the background
    gl.shadowMap.enabled = true;
    gl.localClippingEnabled = true;
    return () => {
      scene.environment = null;
      scene.fog = null;
      env.dispose();
    };
  }, [gl, scene]);

  const c = camAt(t);
  // cool rim light from behind the subject (opposite the camera, high) to separate cars from the floor
  rim.position.set(c.tgt[0] - (c.pos[0] - c.tgt[0]), c.tgt[1] + 12, c.tgt[2] - (c.pos[2] - c.tgt[2]));
  rim.target.position.set(...c.tgt);
  rim.target.updateMatrixWorld();
  rim.intensity = c.def.wide ? 0 : 1.6; // wide shots: cars face the camera, a back rim turns into clearcoat glare
  // pose the world for this instant before the frame is drawn
  w.update(t, c.def.close);
  const tg = new THREE.Vector3(...c.tgt);
  sun.position.copy(tg).addScaledVector(SUN, 60);
  sun.target.position.copy(tg);
  const cam = sun.shadow.camera as THREE.OrthographicCamera;
  const r = c.def.wide ? 48 : c.def.close ? 11 : 24;
  if (cam.right !== r) {
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = 1;
    cam.far = 160;
    cam.updateProjectionMatrix();
  }
  const P = new THREE.Vector3(...c.pos);
  const focus = P.distanceTo(tg);
  const dof = c.def.close ? { focus, aperture: 0.0016, maxBlur: 0.007 } : { focus, aperture: 0.0006, maxBlur: 0.003 };
  // foreground layer: a hazard post + parts shelf between camera and subject, low and to the right
  const fwd = tg.clone().sub(P).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  w.fg.visible = c.def.close;
  w.fg.position.copy(P).addScaledVector(fwd, Math.min(2.8, focus * 0.3)).addScaledVector(right, 0.5);
  w.fg.position.y = 0;
  w.fg.rotation.y = Math.atan2(-fwd.x, -fwd.z);
  const shot: Shot = { pos: c.pos, target: c.tgt, fov: c.fov, exposure: 0.84, ...dof };
  return (
    <>
      <CameraRig shot={shot} near={0.3} far={2500} />
      <primitive object={sky} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <hemisphereLight args={["#eaf2ff", "#bfb6a4", 0.5]} />
      <primitive object={rim} />
      <primitive object={w.root} />
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.84} envIntensity={0} aoRadius={0.4} focus={dof.focus} aperture={dof.aperture} maxBlur={dof.maxBlur} />
    </>
  );
};

// ---------- overlay (authored at 1080 × 1920, scaled) ----------
const pill = (bg: string): React.CSSProperties => ({ background: bg, borderRadius: 6, boxShadow: "0 6px 18px rgba(40,40,30,0.18)", padding: "10px 20px" });

const StageTag: React.FC<{ t: number }> = ({ t }) => {
  const s = SHOTS[shotIndex(t)];
  if (!s.label) return null;
  const a = smooth(s.from, s.from + 0.35, t) * (1 - smooth(s.to - 0.2, s.to, t));
  const done = SHOTS.filter((q) => q.n && q.from <= t).length;
  return (
    <div style={{ position: "absolute", left: 72, top: 196, opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 14, ...pill("rgba(250,248,243,0.92)") }}>
        {s.n && <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.2em", color: C.accent }}>{s.n}</span>}
        <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "0.12em", color: C.ink }}>{s.label}</span>
      </div>
      {s.n && (
        <div style={{ marginTop: 16, width: 400, height: 4, background: "rgba(31,36,38,0.18)", position: "relative" }}>
          <div style={{ width: (400 * done) / 10, height: 4, background: C.accent }} />
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ t: number; from: number; to: number; text: string; color?: string; top?: number; big?: boolean }> = ({ t, from, to, text, color = C.ink, top = 330, big }) => {
  if (t < from - 0.05 || t > to + 0.3) return null;
  const a = smooth(from, from + 0.3, t) * (1 - smooth(to, to + 0.3, t));
  const pop = 1 + 0.08 * Math.sin(clamp((t - from) / 0.3) * Math.PI);
  return (
    <div style={{ position: "absolute", left: 72, top, opacity: a, transform: `scale(${pop})`, transformOrigin: "left center" }}>
      <div style={{ display: "inline-block", fontSize: big ? 46 : 34, fontWeight: 600, letterSpacing: "0.06em", color, ...pill("rgba(250,248,243,0.94)") }}>{text}</div>
    </div>
  );
};

// hook: takt ring
const TaktRing: React.FC<{ t: number }> = ({ t }) => {
  if (t > B.tapi + 0.4) return null;
  const a = smooth(0.1, 0.5, t) * (1 - smooth(B.tapi, B.tapi + 0.4, t));
  const sweep = clamp(t / B.tapi);
  const R = 120;
  const arc = 2 * Math.PI * R;
  const big = smooth(B.seratus - 0.2, B.seratus + 0.2, t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", opacity: a }}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <circle cx={150} cy={150} r={R + 18} fill="rgba(250,248,243,0.9)" />
        <circle cx={150} cy={150} r={R} fill="none" stroke="rgba(31,36,38,0.15)" strokeWidth={12} />
        <circle cx={150} cy={150} r={R} fill="none" stroke={C.accent} strokeWidth={12} strokeDasharray={`${arc * sweep} ${arc}`} transform="rotate(-90 150 150)" strokeLinecap="round" />
        <text x={150} y={150} textAnchor="middle" dominantBaseline="central" fontFamily={MANROPE} fontWeight={600} fontSize={big > 0.5 ? 64 : 40} fill={C.ink}>
          {big > 0.5 ? "±100" : "1 mobil"}
        </text>
        <text x={150} y={202} textAnchor="middle" fontFamily={MANROPE} fontWeight={600} fontSize={26} letterSpacing={4} fill={C.accent}>
          {big > 0.5 ? "DETIK" : "KELUAR"}
        </text>
      </svg>
    </div>
  );
};

// karaoke captions: phrases of ≤5 words, active word in the style's orange with a micro-bounce
type Chunk = { words: { w: string; s: number }[]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of TIMELINE.clips) {
    let cur: { w: string; s: number }[] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, from: cur[0].s - 0.12, to: 0 });
      cur = [];
    };
    c.words.forEach((w) => {
      cur.push({ w: w.w, s: w.s });
      if (cur.length >= 5 || (/[,.]$/.test(w.w) && cur.length >= 2)) flush();
    });
    flush();
    out[out.length - 1].to = c.end + 0.25;
  }
  for (let i = 0; i < out.length; i++) if (!out[i].to) out[i].to = out[i + 1] ? out[i + 1].from : out[i].from + 2;
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ch = CHUNKS.find((c) => t >= c.from && t < c.to);
  if (!ch || t > B.card) return null;
  const a = smooth(ch.from, ch.from + 0.12, t);
  let active = -1;
  ch.words.forEach((w, i) => (t >= w.s ? (active = i) : null));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", ...pill("rgba(250,248,243,0.94)"), padding: "16px 28px", maxWidth: 900 }}>
        {ch.words.map((w, i) => {
          const on = i === active;
          const b = on ? 1 + 0.12 * Math.sin(clamp((t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span key={i} style={{ fontSize: 54, fontWeight: 600, color: on ? C.accent : i < active ? C.ink : "rgba(31,36,38,0.55)", display: "inline-block", transform: `scale(${b}) translateY(${on ? -3 * (b - 1) * 20 : 0}px)` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ fontFamily: MANROPE, pointerEvents: "none" }}>
    <TaktRing t={t} />
    <Chip t={t} from={B.jam - 0.2} to={B.konteks - 0.2} text="1 MOBIL DIBUAT: BERJAM-JAM" big top={240} />
    <Chip t={t} from={B.banyak} to={B.mek - 0.2} text="banyak mobil · dikerjakan bersamaan" />
    <Chip t={t} from={B.mengelas + 0.3} to={B.bodi - 0.2} text="ribuan titik las" />
    <Chip t={t} from={B.listrik - 0.6} to={B.dilapisi - 0.2} text="cat antikarat · bermuatan listrik" />
    <Chip t={t} from={B.dipanggang} to={B.reveal - 0.2} text="dipanggang di oven" />
    <Chip t={t} from={B.datang} to={B.payoff - 0.2} text="kotak part datang tepat waktu" />
    <Chip t={t} from={B.henti} to={B.outro - 0.1} text="LINI BERHENTI" color="#c0261d" />
    <Chip t={t} from={B.outro + 0.3} to={B.card} text="ritme, bukan terburu-buru" />
    <StageTag t={t} />
    <Captions t={t} />
  </AbsoluteFill>
);

export const Ep048Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [ok, setOk] = useState(false);
  useLayoutEffect(() => {
    const h = delayRender("ep048 font");
    fontReady().then(() => {
      setOk(true);
      continueRender(h);
    });
  }, []);
  const k = width / 1080;
  // hard cuts get a 3-frame light flash so they read as edits, not glitches
  const s = SHOTS[shotIndex(t)];
  const flash = s.from > 0 ? 1 - smooth(s.from, s.from + 0.12, t) : 0;
  return (
    <AbsoluteFill style={{ background: "#e6eeef" }}>
      {ok && (
        <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
          <World t={t} frame={frame} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "#fbf8f1", opacity: flash * 0.35 }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Overlay t={t} />
      </div>
      <Outro start={B.card} />
    </AbsoluteFill>
  );
};

export const FILM_SECONDS = TIMELINE.total;

