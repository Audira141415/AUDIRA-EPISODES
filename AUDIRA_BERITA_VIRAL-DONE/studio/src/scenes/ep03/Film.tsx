// EP03 film (CYBERFORGE): "Diblokir, bukan dibobol". One continuous camera over the approved
// cover's threat table. Every beat is anchored to word times in timeline.json (Audio Master Clock).
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { extend, useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { CYBER_PALETTE as C } from "../../kits/cyberforge/lib/palette.ts";
import { CyberAtmosphere } from "../../kits/cyberforge/world/Atmosphere.tsx";
import { CyberGrid } from "../../kits/cyberforge/world/CyberGrid.tsx";
import { DataStream } from "../../kits/cyberforge/world/DataStream.tsx";
import { TelemetryRings } from "../../kits/cyberforge/hud/TelemetryRings.tsx";
import { Outro } from "../_shared/Outro.tsx";
import tl from "./timeline.json";
import { AgencyNode, Attacks, BANK_POS, Bank, Bars, Dome, Islands, RED, Table, TeamTokens, TxPacket, type BarSpec } from "./world.tsx";

// the kit CyberGrid uses <threeLine>; register it so every render path (CLI too) knows it
extend({ ThreeLine: THREE.Line });

const { fontFamily: CHAKRA } = loadChakra("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"], subsets: ["latin"] });

// ------------------------------------------------------------------ clock
type Word = { w: string; s: number; e: number };
type Clip = { id: string; words: Word[] };
const CLIPS = tl.clips as Clip[];
const SEC = tl.sections as Record<"HOOK" | "KONTEKS" | "PENGEMBANGAN" | "PENJELASAN" | "PAYOFF" | "OUTRO", [number, number]>;
const TOTAL = tl.total;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

const T = {
  tapi: W("hook", 10),
  bukan: W("hook", 13),
  konteks: SEC.KONTEKS[0],
  senin: W("konteks", 1),
  forti: W("konteks", 6),
  bagi: W("konteks", 8),
  bank: W("konteks", 9),
  keu: W("konteks", 10),
  asur: W("konteks", 12),
  satu: W("konteks", 16),
  lebih: W("konteks", 17),
  n12: W("konteks", 19),
  jam: W("konteks", 23),
  peng: SEC.PENGEMBANGAN[0],
  a: W("pengembangan", 7),
  b: W("pengembangan", 16),
  c: W("pengembangan", 24),
  benar: W("pengembangan", 29),
  periode: W("pengembangan", 31),
  cakupan: W("pengembangan", 34),
  dasbor: W("pengembangan", 37),
  penj: SEC.PENJELASAN[0],
  upaya: W("penjelasan", 4),
  lalu: W("penjelasan", 5),
  bssn: W("penjelasan", 12),
  bukanP: W("penjelasan", 19),
  pemb: W("penjelasan", 21),
  pakar: W("penjelasan", 22),
  alfons: W("penjelasan", 24),
  quote: W("penjelasan", 28),
  menurut: W("penjelasan", 35),
  data: W("penjelasan", 36),
  pay: SEC.PAYOFF[0],
  regulator: W("payoff", 2),
  ojk: W("payoff", 5),
  koord: W("payoff", 6),
  jumat: W("payoff", 12),
  trans: W("payoff", 15),
  wajar: W("payoff", 17),
  tunda: W("payoff", 18),
  verif: W("payoff", 20),
  bssn2: W("payoff", 21),
  n151: W("payoff", 23),
  outro: SEC.OUTRO[0],
  otp: W("outro", 3),
  app: W("outro", 8),
  simpan: W("outro", 14),
  audira: W("outro", 19),
};

/** piecewise-linear key track, smoothed per segment */
const track = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i], [tb, vb] = keys[i + 1];
    if (t <= tb) return va + (vb - va) * smooth((t - ta) / (tb - ta));
  }
  return keys[keys.length - 1][1];
};

// ------------------------------------------------------------------ camera
type Pose = { t: number; p: [number, number, number]; g: [number, number, number]; fov: number };
const BK = BANK_POS;
const POSES: Pose[] = [
  { t: 0, p: [0.15, 12.6, 11.4], g: [0, 0, 0.1], fov: 40 },
  { t: T.tapi - 0.15, p: [0.0, 11.0, 10.2], g: [-0.1, 0.1, 0.15], fov: 40 },
  { t: T.bukan + 0.55, p: [BK[0] - 0.05, 3.0, 4.6], g: [BK[0], 0.55, BK[2]], fov: 38 },
  { t: T.konteks + 0.4, p: [BK[0] + 0.2, 3.2, 4.8], g: [BK[0] + 0.1, 0.5, BK[2]], fov: 38 },
  { t: T.forti + 0.2, p: [0, 15.2, 4.6], g: [0, 0, 0], fov: 40 },
  { t: T.bank, p: [0.1, 14.6, 4.9], g: [0, 0, 0.05], fov: 40 },
  { t: T.satu, p: [BK[0] + 0.25, 6.2, 6.4], g: [BK[0] + 0.1, 0.4, BK[2]], fov: 38 },
  { t: SEC.KONTEKS[1], p: [BK[0] + 0.6, 5.6, 6.2], g: [BK[0] + 0.3, 0.5, BK[2]], fov: 38 },
  { t: T.peng + 0.9, p: [-2.4, 4.0, 13.6], g: [0, 1.6, 0.8], fov: 38 },
  { t: T.c + 1.4, p: [0.4, 4.2, 13.8], g: [0, 1.6, 0.8], fov: 38 },
  { t: SEC.PENGEMBANGAN[1], p: [2.2, 4.4, 13.4], g: [0, 1.6, 0.8], fov: 38 },
  { t: T.upaya + 0.4, p: [3.0, 3.2, 6.4], g: [1.2, 1.5, -0.2], fov: 40 },
  { t: T.pakar, p: [1.0, 4.0, 7.4], g: [0.5, 1.2, -0.3], fov: 40 },
  { t: SEC.PENJELASAN[1], p: [-1.2, 4.6, 7.6], g: [-0.5, 0.9, 0], fov: 40 },
  { t: T.ojk, p: [BK[0] + 0.1, 3.4, 5.2], g: [BK[0] + 0.15, 0.6, BK[2]], fov: 38 },
  { t: T.trans, p: [BK[0] + 0.7, 3.2, 4.9], g: [BK[0] + 0.4, 0.45, BK[2] + 0.1], fov: 38 },
  { t: T.bssn2, p: [BK[0] + 0.4, 3.8, 5.4], g: [BK[0] + 0.1, 0.4, BK[2]], fov: 38 },
  { t: T.n151 + 0.6, p: [BK[0] - 0.1, 5.3, 6.6], g: [BK[0], 0.25, BK[2]], fov: 38 },
  { t: SEC.PAYOFF[1], p: [BK[0] - 0.3, 5.9, 7.2], g: [BK[0], 0.25, BK[2]], fov: 38 },
  { t: T.otp, p: [0.15, 12.2, 11.0], g: [0, 0, 0.1], fov: 40 },
  { t: TOTAL, p: [0.3, 12.9, 11.9], g: [0, 0, 0.1], fov: 40 },
];
const camAt = (t: number) => {
  let i = 0;
  while (i < POSES.length - 2 && t > POSES[i + 1].t) i++;
  const A = POSES[i], B = POSES[i + 1];
  const u = smooth((t - A.t) / (B.t - A.t));
  const L = (a: number, b: number) => a + (b - a) * u;
  const drift = 0.12;
  return {
    p: [L(A.p[0], B.p[0]) + Math.sin(t * 0.37) * drift, L(A.p[1], B.p[1]) + Math.sin(t * 0.29 + 1) * drift * 0.6, L(A.p[2], B.p[2])] as [number, number, number],
    g: [L(A.g[0], B.g[0]), L(A.g[1], B.g[1]), L(A.g[2], B.g[2])] as [number, number, number],
    fov: L(A.fov, B.fov),
  };
};
const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.p);
    cam.lookAt(...c.g);
    cam.fov = c.fov;
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ 3D scene
const BAR_SPECS = (t: number): BarSpec[] => [
  { x: -1.55, value: 1.2, color: C.solarAmber, big: "1,2 JUTA", l1: "SEKTOR KEUANGAN", l2: "PER SENIN MALAM", grow: seg(t, T.a - 0.1, T.a + 0.9), check: 0 },
  { x: 0, value: 2.1, color: C.cyan, big: "2,1 JUTA", l1: "SELURUH INDONESIA", l2: "PER SELASA", grow: seg(t, T.b - 0.1, T.b + 0.9), check: 0 },
  { x: 1.55, value: 7.3, color: "#b46cff", big: "7,3 JUTA", l1: "HITUNGAN", l2: "SEPEKAN", grow: seg(t, T.c - 0.1, T.c + 1.1), check: 0 },
];

const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f60 = t * 60;
  const barsK = win(t, T.peng + 0.3, SEC.PENGEMBANGAN[1] + 0.6, 0.6, 0.8);
  const arcK = track(t, [
    [0, 1], [T.konteks, 1], [T.konteks + 1, 0.6], [T.peng, 0.6], [T.peng + 0.8, 0.08], [SEC.PENGEMBANGAN[1], 0.08],
    [T.upaya, 1], [SEC.PENJELASAN[1], 1], [T.pay + 0.8, 0.3], [T.outro, 0.3], [T.outro + 1, 0.65],
  ]);
  const domeK = track(t, [[0, 1], [T.peng, 1], [T.peng + 0.8, 0.25], [SEC.PENGEMBANGAN[1], 0.25], [SEC.PENGEMBANGAN[1] + 0.8, 1]]);
  const flash = win(t, T.bukanP - 0.2, T.pemb + 0.8, 0.2, 0.5) + win(t, T.quote, T.quote + 1.5, 0.2, 0.6) * 0.6;
  const bankGlow = Math.max(win(t, T.bukan - 0.2, T.konteks + 1.2), win(t, T.bank, T.satu + 1.5), win(t, T.pay, SEC.PAYOFF[1], 0.5, 0.6));
  return (
    <>
      <CameraRig t={t} />
      <CyberAtmosphere f={f60} />
      <directionalLight position={[-3, 9, 6]} intensity={1.6} color="#bfefff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, 3.5, 0]} intensity={6} distance={9} decay={2} color={C.cyan} />
      <group position={[0, 1.2, 0]}>
        <CyberGrid f={f60} size={60} divisions={44} />
      </group>
      <group position={[0, -0.5, 0]} scale={[1, 1, 0.58]}>
        <TelemetryRings f={f60} radius={5.2} />
      </group>
      <group position={[0, -3, -4]}>
        <DataStream f={f60} count={140} />
      </group>
      <Table />
      <Islands dim={barsK} />
      <Bank t={t} glow={bankGlow} />
      <Bars specs={BAR_SPECS(t)} k={barsK} />
      <AgencyNode pos={[BK[0] + 1.25, 1.05, BK[2] - 0.5]} text="OJK" color={C.solarAmber} on={win(t, T.ojk - 0.2, T.trans - 0.1, 0.5, 0.4)} t={t} />
      <AgencyNode pos={[BK[0] + 1.15, 0.95, BK[2] - 0.35]} text="BSSN" color={C.cyan} on={win(t, T.bssn2 - 0.2, SEC.PAYOFF[1] + 0.3, 0.5, 0.5)} t={t} />
      <TxPacket t={t} a={seg(t, T.trans - 0.4, T.wajar)} flag={seg(t, T.wajar, T.wajar + 0.2)} hold={seg(t, T.tunda, T.tunda + 0.1)} verify={clamp01((t - T.verif) / 0.9) * (1 - seg(t, T.bssn2 + 0.6, T.bssn2 + 1.0))} />
      <TeamTokens show={clamp01((t - T.n151) / 0.9)} k={1 - seg(t, T.outro + 0.6, T.otp)} />
      <Dome k={domeK} flash={flash} />
      <Attacks t={t} k={arcK} />
      <Finish frame={frame} background={C.voidDeep} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
    </>
  );
};

// ------------------------------------------------------------------ HUD (HTML)
const Box: React.FC<{ s: number; on: number; style?: React.CSSProperties; color?: string; children: React.ReactNode }> = ({ s, on, style, color = C.cyan, children }) =>
  on <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        opacity: on,
        transform: `translateY(${(1 - on) * 18 * s}px)`,
        background: "rgba(6,14,28,0.84)",
        border: `${3 * s}px solid ${color}`,
        boxShadow: `0 0 ${24 * s}px ${color}44`,
        padding: `${16 * s}px ${26 * s}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );

const Bust: React.FC<{ s: number; color: string }> = ({ s, color }) => (
  <svg width={96 * s} height={110 * s} viewBox="0 0 96 110">
    <defs>
      <pattern id={`scan${color.slice(1)}`} width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="2" fill={color} opacity="0.35" />
      </pattern>
    </defs>
    <circle cx="48" cy="34" r="22" fill={`url(#scan${color.slice(1)})`} stroke={color} strokeWidth="3" />
    <path d="M8 108 C10 74 28 62 48 62 C68 62 86 74 88 108 Z" fill={`url(#scan${color.slice(1)})`} stroke={color} strokeWidth="3" />
  </svg>
);

const NameCard: React.FC<{ s: number; on: number; top: number; name: string; role: string; color?: string }> = ({ s, on, top, name, role, color = C.cyan }) => (
  <Box s={s} on={on} color={color} style={{ left: 64 * s, right: 64 * s, top: top * s, display: "flex", alignItems: "center", gap: 24 * s }}>
    <Bust s={s} color={color} />
    <div>
      <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 54 * s, color: C.hudWhite, lineHeight: 1.05 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, color, marginTop: 6 * s, lineHeight: 1.25, whiteSpace: "pre-line" }}>{role}</div>
    </div>
  </Box>
);

const Kicker: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const items: [number, number, string][] = [
    [0, T.konteks, "LIVE · PETA SERANGAN SIBER"],
    [T.konteks, T.peng, "PETA ANCAMAN · FORTIGUARD"],
    [T.peng, T.penj, "KENAPA ANGKANYA BEDA?"],
    [T.penj, T.pay, "YANG DICATAT: UPAYA"],
    [T.pay, T.outro, "RESPONS REGULATOR"],
    [T.outro, OUTRO_AT, "BAGIAN KITA"],
  ];
  const it = items.find(([a, b]) => t >= a && t < b);
  if (!it) return null;
  const on = t < 0.2 ? 1 : seg(t, it[0], it[0] + 0.35);
  const ill = Math.max(win(t, -1, T.tapi, 0.1, 0.3), win(t, T.upaya - 0.3, T.pakar, 0.3, 0.3));
  return (
    <>
      <div style={{ position: "absolute", left: 64 * s, top: 262 * s, fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, letterSpacing: 3 * s, color: C.cyan, opacity: on }}>
        <span style={{ color: RED, opacity: 0.55 + 0.45 * Math.round((Math.sin(t * 6) + 1) / 2) }}>●</span> {it[2]}
      </div>
      {ill > 0.01 && (
        <div style={{ position: "absolute", right: 64 * s, top: 258 * s, fontFamily: MONO, fontWeight: 700, fontSize: 26 * s, letterSpacing: 2 * s, color: "#04060d", background: "#d0f7ff", padding: `${4 * s}px ${12 * s}px`, opacity: ill }}>
          ILUSTRASI
        </div>
      )}
    </>
  );
};

const Hud: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const big = (txt: string, size: number, color: string, extra: React.CSSProperties = {}) => (
    <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: size * s, color, lineHeight: 0.98, ...extra }}>{txt}</div>
  );
  const els: React.ReactNode[] = [];
  // HOOK: the number, then what it is not
  const h1 = t < 0.05 ? 1 : 1 - seg(t, T.tapi - 0.1, T.tapi + 0.3);
  if (h1 > 0.01)
    els.push(
      <div key="h1" style={{ position: "absolute", left: 64 * s, top: 318 * s, opacity: h1 }}>
        {big("2 JUTA", 190, C.hudWhite, { textShadow: `0 0 ${30 * s}px rgba(255,42,60,0.55)` })}
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 * s, marginTop: 8 * s }}>
          {big("SERANGAN", 76, RED)}
          {big("/ HARI", 76, C.cyan)}
        </div>
      </div>,
    );
  const h2 = win(t, T.tapi + 0.1, T.konteks + 0.3, 0.35, 0.4);
  if (h2 > 0.01)
    els.push(
      <div key="h2" style={{ position: "absolute", left: 64 * s, top: 330 * s, opacity: h2, transform: `translateY(${(1 - h2) * 20 * s}px)` }}>
        {big("BUKAN", 120, C.cyan)}
        <div style={{ display: "flex", gap: 22 * s, alignItems: "baseline" }}>
          {big("BANK", 120, C.hudWhite)}
          <span style={{ position: "relative" }}>
            {big("JEBOL", 120, "#ff4a5a")}
            <span style={{ position: "absolute", left: -6 * s, right: -6 * s, top: "52%", height: 12 * s, background: C.hudWhite, transform: `scaleX(${seg(t, T.bukan + 0.4, T.bukan + 0.8)})`, transformOrigin: "left" }} />
          </span>
        </div>
      </div>,
    );
  // KONTEKS: screenshot frame + target #1 + counter
  const shot = win(t, T.senin, T.bank + 0.2, 0.5, 0.4);
  if (shot > 0.01)
    els.push(
      <div key="shot" style={{ position: "absolute", left: 40 * s, right: 40 * s, top: 340 * s, height: 860 * s, border: `${3 * s}px solid ${C.cyan}`, opacity: shot }}>
        <div style={{ background: C.cyan, color: "#04060d", fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, padding: `${8 * s}px ${18 * s}px`, display: "flex", justifyContent: "space-between" }}>
          <span>PETA ANCAMAN · FORTIGUARD</span>
          <span>● REAL-TIME</span>
        </div>
        <div style={{ position: "absolute", left: 18 * s, bottom: 16 * s, fontFamily: MONO, fontWeight: 700, fontSize: 26 * s, color: "#8fb3cc" }}>TANGKAPAN LAYAR · TAMPILAN ULANG</div>
        {[0, 1, 2].map((i) => {
          const o = seg(t, T.bagi + i * 0.22, T.bagi + i * 0.22 + 0.25);
          return o > 0.01 ? (
            <div key={i} style={{ position: "absolute", right: (20 + i * 26) * s, top: (90 + i * 92) * s, opacity: o, transform: `scale(${0.8 + 0.2 * o})`, fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, color: "#04060d", background: C.solarAmber, padding: `${6 * s}px ${14 * s}px` }}>
              ↗ DIBAGIKAN
            </div>
          ) : null;
        })}
      </div>,
    );
  const sasaran = win(t, T.bank - 0.1, T.peng + 0.2, 0.3, 0.4);
  if (sasaran > 0.01)
    els.push(
      <div key="sas" style={{ position: "absolute", left: 64 * s, top: 330 * s, opacity: sasaran }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, color: C.solarAmber, letterSpacing: 2 * s, opacity: seg(t, T.satu - 0.4, T.satu) * 1 + 0.0 }}>SASARAN NOMOR 1</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 * s, marginTop: 10 * s, maxWidth: 950 * s }}>
          {([["BANK", T.bank], ["KEUANGAN", T.keu], ["ASURANSI", T.asur]] as [string, number][]).map(([w, at]) => {
            const o = seg(t, at - 0.1, at + 0.2);
            return (
              <span key={w} style={{ opacity: o, transform: `scale(${0.9 + 0.1 * o})`, fontFamily: CHAKRA, fontWeight: 700, fontSize: 66 * s, color: "#04060d", background: C.matrixLime, padding: `${2 * s}px ${18 * s}px` }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>,
    );
  const cnt = win(t, T.n12 - 0.2, T.peng + 0.2, 0.3, 0.4);
  if (cnt > 0.01) {
    const v = 1.2 * seg(t, T.n12 - 0.1, T.n12 + 0.5);
    els.push(
      <Box key="cnt" s={s} on={cnt} color={C.solarAmber} style={{ left: 64 * s, right: 64 * s, top: 960 * s }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 * s }}>
          {big(`> ${v.toFixed(1).replace(".", ",")} JUTA`, 104, C.hudWhite)}
          {big(t >= T.jam - 0.1 ? "/ 24 JAM" : "", 54, C.cyan)}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, color: C.solarAmber, marginTop: 6 * s }}>UPAYA SERANGAN · SEKTOR KEUANGAN</div>
      </Box>,
    );
  }
  // PENGEMBANGAN
  const benar = win(t, T.benar - 0.1, SEC.PENGEMBANGAN[1] + 0.2, 0.3, 0.4);
  if (benar > 0.01)
    els.push(
      <div key="benar" style={{ position: "absolute", left: 64 * s, right: 64 * s, top: 330 * s, opacity: benar }}>
        {big("SEMUANYA BENAR ✓", 84, C.matrixLime)}
        <div style={{ display: "flex", gap: 16 * s, marginTop: 16 * s }}>
          {([["PERIODE BEDA", T.periode], ["CAKUPAN BEDA", T.cakupan]] as [string, number][]).map(([w, at]) => {
            const o = seg(t, at - 0.1, at + 0.25);
            return (
              <span key={w} style={{ opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: 34 * s, color: C.hudWhite, border: `${3 * s}px solid ${C.cyan}`, padding: `${6 * s}px ${16 * s}px` }}>
                {w}
              </span>
            );
          })}
        </div>
        {t >= T.dasbor - 0.2 && (
          <div style={{ marginTop: 18 * s, opacity: seg(t, T.dasbor - 0.2, T.dasbor + 0.2), fontFamily: MONO, fontWeight: 700, fontSize: 32 * s, color: C.solarAmber }}>
            <span style={{ color: RED, opacity: Math.round((Math.sin(t * 9) + 1) / 2) }}>●</span> DASBOR BERUBAH SETIAP SAAT
          </div>
        )}
      </div>,
    );
  // PENJELASAN
  const upaya = win(t, T.upaya - 0.2, T.pakar - 0.1, 0.3, 0.35);
  if (upaya > 0.01) {
    const strike = seg(t, T.bukanP, T.pemb + 0.3);
    els.push(
      <div key="up" style={{ position: "absolute", left: 64 * s, top: 330 * s, opacity: upaya }}>
        <div style={{ display: "flex", gap: 20 * s, alignItems: "baseline" }}>
          {big("UPAYA", 120, C.cyan)}
          {big("✓ TERCATAT", 52, C.matrixLime)}
        </div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 10 * s, opacity: seg(t, T.bukanP - 0.3, T.bukanP) }}>
          {big("PEMBOBOLAN", 92, "#ff4a5a")}
          <span style={{ position: "absolute", left: -8 * s, right: -8 * s, top: "48%", height: 12 * s, background: C.hudWhite, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
        </div>
      </div>,
    );
    // live log
    const rows = Math.floor(clamp01((t - T.lalu) / 3.5) * 5);
    if (t > T.lalu - 0.1)
      els.push(
        <Box key="log" s={s} on={seg(t, T.lalu - 0.1, T.lalu + 0.3) * upaya} style={{ right: 64 * s, top: 1000 * s, width: 520 * s, padding: `${12 * s}px ${20 * s}px` }}>
          {Array.from({ length: Math.max(1, rows) }, (_, i) => (
            <div key={i} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26 * s, color: i === rows - 1 ? C.hudWhite : "#8fb3cc", lineHeight: 1.45 }}>
              ▸ UPAYA · <span style={{ color: C.matrixLime }}>DIBLOKIR</span>
            </div>
          ))}
        </Box>,
      );
  }
  const bssn = win(t, T.bssn - 0.1, T.pakar - 0.1, 0.3, 0.3);
  els.push(<NameCard key="bssn" s={s} on={bssn} top={640} name="BSSN" role={"Badan Siber dan Sandi Negara\nJuru bicara: Prabaswari"} />);
  const alf = win(t, T.alfons - 0.15, SEC.PENJELASAN[1] + 0.2, 0.3, 0.4);
  els.push(<NameCard key="alf" s={s} on={alf} top={330} name="ALFONS TANUJAYA" role="Pakar keamanan siber, Vaksincom" color={C.matrixLime} />);
  const q = win(t, T.quote - 0.15, T.data - 0.1, 0.3, 0.35);
  if (q > 0.01)
    els.push(
      <Box key="q" s={s} on={q} color={C.matrixLime} style={{ left: 64 * s, right: 64 * s, top: 560 * s }}>
        <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 60 * s, color: C.hudWhite, lineHeight: 1.12 }}>
          “Upaya yang <span style={{ color: C.matrixLime }}>diblokir</span>, bukan bank yang <span style={{ color: "#ff4a5a" }}>dibobol</span>.”
        </div>
      </Box>,
    );
  const flat = win(t, T.data - 0.2, SEC.PENJELASAN[1] + 0.2, 0.3, 0.4);
  if (flat > 0.01) {
    const d = seg(t, T.data, T.data + 1.6);
    const pts = Array.from({ length: 25 }, (_, i) => `${(i / 24) * 900 * d},${60 + Math.sin(i * 1.7) * 5 + Math.sin(i * 0.6) * 4}`).join(" ");
    els.push(
      <Box key="flat" s={s} on={flat} color={C.cyan} style={{ left: 64 * s, right: 64 * s, top: 580 * s }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * s, color: C.cyan }}>SETAHUN TERAKHIR</div>
        <svg width={900 * s} height={120 * s} viewBox="0 0 900 120" style={{ display: "block", marginTop: 6 * s }}>
          <line x1="0" y1="110" x2="900" y2="110" stroke="#466280" strokeWidth="3" />
          <polyline points={pts} fill="none" stroke={C.matrixLime} strokeWidth="6" />
        </svg>
        <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 48 * s, color: C.hudWhite }}>TIDAK ADA LONJAKAN BERARTI</div>
      </Box>,
    );
  }
  // PAYOFF
  const reg = win(t, T.pay - 0.1, T.ojk + 0.1, 0.3, 0.3);
  if (reg > 0.01)
    els.push(
      <div key="reg" style={{ position: "absolute", left: 64 * s, top: 330 * s, opacity: reg }}>
        {big("REGULATOR", 110, C.solarAmber)}
        {big("TIDAK SANTAI", 110, C.hudWhite)}
      </div>,
    );
  const ojk = win(t, T.ojk - 0.1, T.trans - 0.2, 0.3, 0.3);
  els.push(<NameCard key="ojk" s={s} on={ojk} top={330} name="OJK" role={"Dian Ediana Rae\nKepala Eksekutif Pengawas Perbankan"} color={C.solarAmber} />);
  const koord = win(t, T.koord - 0.1, T.trans - 0.2, 0.3, 0.3);
  if (koord > 0.01)
    els.push(
      <Box key="ko" s={s} on={koord} color={C.solarAmber} style={{ left: 64 * s, right: 64 * s, top: 590 * s }}>
        <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 52 * s, color: C.hudWhite }}>KOORDINASI DENGAN TIM IT BANK</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, color: C.solarAmber, opacity: seg(t, T.jumat - 0.1, T.jumat + 0.2) }}>SEJAK JUMAT</div>
      </Box>,
    );
  const step = win(t, T.trans - 0.2, T.bssn2 - 0.1, 0.3, 0.3);
  if (step > 0.01) {
    const st: [string, number, string][] = [
      ["TRANSAKSI TIDAK WAJAR", T.wajar, "#ff4a5a"],
      ["DITUNDA", T.tunda, C.solarAmber],
      ["VERIFIKASI", T.verif, C.matrixLime],
    ];
    els.push(
      <div key="step" style={{ position: "absolute", left: 64 * s, right: 64 * s, top: 330 * s, opacity: step, display: "flex", flexDirection: "column", gap: 14 * s }}>
        {st.map(([w, at, col], i) => {
          const o = seg(t, at - 0.15, at + 0.15);
          return (
            <div key={w} style={{ opacity: 0.25 + 0.75 * o, display: "flex", alignItems: "center", gap: 16 * s }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34 * s, color: "#04060d", background: col, padding: `${2 * s}px ${12 * s}px` }}>{i + 1}</span>
              <span style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 64 * s, color: o > 0.5 ? col : C.hudWhite }}>{w}</span>
            </div>
          );
        })}
      </div>,
    );
  }
  const tim = win(t, T.bssn2 - 0.1, SEC.PAYOFF[1] + 0.3, 0.3, 0.4);
  if (tim > 0.01) {
    const n = Math.round(151 * clamp01((t - T.n151) / 0.9));
    els.push(
      <div key="tim" style={{ position: "absolute", left: 64 * s, top: 330 * s, opacity: tim }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, color: C.cyan, letterSpacing: 2 * s }}>BSSN MENYIAGAKAN</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 * s }}>
          {big(String(n), 170, C.hudWhite)}
          {big("TIM", 90, C.cyan)}
        </div>
        {big("TANGGAP INSIDEN · PERBANKAN", 46, C.hudCyan)}
      </div>,
    );
  }
  // OUTRO tips
  const tip = (key: string, at: number, icon: React.ReactNode, l1: string, l2: string, top: number) => {
    const o = win(t, at - 0.15, OUTRO_AT, 0.3, 0.2);
    if (o > 0.01)
      els.push(
        <Box key={key} s={s} on={o} color={RED} style={{ left: 64 * s, right: 64 * s, top: top * s, display: "flex", alignItems: "center", gap: 26 * s }}>
          {icon}
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30 * s, color: "#ff6a7a" }}>{l1}</div>
            <div style={{ fontFamily: CHAKRA, fontWeight: 700, fontSize: 56 * s, color: C.hudWhite, lineHeight: 1.05 }}>{l2}</div>
          </div>
        </Box>,
      );
  };
  const no = (
    <g>
      <circle cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="7" />
      <line x1="19" y1="81" x2="81" y2="19" stroke={RED} strokeWidth="7" />
    </g>
  );
  tip(
    "otp",
    T.otp,
    <svg width={110 * s} height={110 * s} viewBox="0 0 100 100">
      <rect x="32" y="16" width="36" height="68" rx="6" fill="none" stroke={C.hudCyan} strokeWidth="4" />
      <text x="50" y="56" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="14" fill={C.hudCyan}>OTP</text>
      {no}
    </svg>,
    "JANGAN BAGIKAN",
    "KODE OTP",
    330,
  );
  tip(
    "app",
    T.app,
    <svg width={110 * s} height={110 * s} viewBox="0 0 100 100">
      <path d="M40 58 L60 42 M34 50 l-8 8 a10 10 0 0 0 14 14 l8 -8 M66 50 l8 -8 a10 10 0 0 0 -14 -14 l-8 8" fill="none" stroke={C.hudCyan} strokeWidth="5" strokeLinecap="round" />
      {no}
    </svg>,
    "JANGAN PASANG APLIKASI",
    "DARI TAUTAN ASING",
    530,
  );
  const fol = win(t, T.simpan - 0.15, OUTRO_AT, 0.3, 0.2);
  if (fol > 0.01)
    els.push(
      <div key="fol" style={{ position: "absolute", left: 64 * s, top: 760 * s, opacity: fol, fontFamily: MONO, fontWeight: 700, fontSize: 34 * s, color: "#04060d", background: C.cyan, padding: `${8 * s}px ${18 * s}px` }}>
        SIMPAN · IKUTI AUDIRA
      </div>,
    );
  return <>{els}</>;
};

// ------------------------------------------------------------------ captions
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const n = c.words.length;
    const k = Math.ceil(n / 6);
    const base = Math.floor(n / k);
    let extra = n % k;
    let i = 0;
    const parts: Word[][] = [];
    for (let j = 0; j < k; j++) {
      const len = base + (extra-- > 0 ? 1 : 0);
      parts.push(c.words.slice(i, i + len));
      i += len;
    }
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  if (n > 4) {
    const chars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const d = Math.abs(a - (chars - a));
      if (d < best) {
        best = d;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 420 * s, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(4,8,18,0.86)", borderLeft: `${8 * s}px solid ${C.cyan}`, padding: `${12 * s}px ${30 * s}px`, opacity: appear, transform: `translateY(${(1 - appear) * 12 * s}px)`, maxWidth: 960 * s }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 * s, whiteSpace: "nowrap", lineHeight: 1.2 }}>
            {ln.map((wd, wi) => {
              const idx = ch.words.indexOf(wd);
              const nextS = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < nextS;
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span key={wi} style={{ display: "inline-block", fontFamily: CHAKRA, fontWeight: 700, fontSize: 54 * s, color: active ? C.cyan : done ? C.hudWhite : "rgba(240,248,255,0.5)", transform: `scale(${bump})`, textShadow: active ? `0 0 ${16 * s}px rgba(0,240,255,0.6)` : "none" }}>
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: C.voidDeep }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ position: [0, 12.6, 11.4], fov: 40, near: 0.1, far: 200 }}>
        <Scene t={t} frame={frame} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(4,6,13,0.9) 0%, rgba(4,6,13,0.55) 20%, rgba(4,6,13,0) 34%, rgba(4,6,13,0) 62%, rgba(4,6,13,0.55) 74%, rgba(4,6,13,0.8) 100%)",
        }}
      />
      <Kicker t={t} s={s} />
      <Hud t={t} s={s} />
      <Captions t={t} s={s} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
