// AE-068 film (URBANFORGE, Remotion + R3F). Multi-scene director driven by timeline.json (Audio Master Clock):
// HOOK      street section: bus above, Ø 1,8 m pipe below, aspal utuh
// KONTEKS   aerial of Jl. DI Panjaitan: fenced pits that look idle -> swoop to the section: entry/exit doors
// MEKANISME pipe jacking: wide system, cutterhead close-up, launch pit jacks + segment lowered, laser in the
//           pipe, approach to the reception pit
// REVEAL    A pipe yard: 2,43 m per segment, 189 segments lit in turn; B Sodetan Ciliwung Ø 4,05 m, 590 m
// PAYOFF    HDD: rig on the surface, pilot hole at an angle, reamer, pipe pulled back under the road
// OUTRO     golden street section: traffic keeps moving, pipe creeps into the reception pit; outro card
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { CL, type Word } from "./timing.ts";
import { C, JP, MLEN, OUTRO_START, RP, RPIT, SEC, SEG, T, TOTAL, XR0, YP, camFromPose, clamp01, jackState, poseFrom, ss, win, type Key } from "./shared.ts";
import { Buildings, EXTRA_PITS, Gantry, Hoarding, Laser, PipeString, Road, Soil, Stockpile, StreetLights, SubjectSpot, Traffic, Workers, makePlate, useMats } from "./StreetWorld.tsx";
import { GA, GB, GR, GY, PipeYard, ROW_N, Sodetan, YARD_Y, litCount } from "./RevealWorld.tsx";
import { ENTRY, EXIT, HddRig, HddSoil, hddState } from "./HddWorld.tsx";

// ---------- scenes ----------
type SceneId = "hook" | "konteks" | "mek" | "yard" | "sodetan" | "hdd" | "outro";
const T_SOD = CL[8].start;
const sceneAt = (t: number): SceneId =>
  t < SEC.KONTEKS[0] ? "hook" : t < SEC.MEKANISME[0] ? "konteks" : t < SEC.REVEAL[0] ? "mek" : t < T_SOD ? "yard" : t < SEC.PAYOFF[0] ? "sodetan" : t < SEC.OUTRO[0] ? "hdd" : "outro";

// ---------- camera keys (seconds from the VO) ----------
const Y = YP;
const KEYS: Record<SceneId, Key[]> = {
  hook: [
    { t: 0, p: [-15, 3.4, 38], q: [-9.5, -3.1, -3], f: 40 },
    { t: 2.3, p: [-10, 2.0, 35], q: [-7.3, -3.2, -3], f: 40 },
    { t: 4.3, p: [-2, 1.6, 33], q: [-1.5, -3.2, -3], f: 40 },
    { t: SEC.KONTEKS[0], p: [0, 1.2, 25], q: [1, -2.4, -3], f: 40 },
  ],
  konteks: [
    { t: SEC.KONTEKS[0], p: [-52, 60, -2], q: [2, 0, -4.5], f: 38 },
    { t: T.lubang1, p: [-44, 52, -1], q: [2, -0.5, -4.5], f: 38 },
    { t: T.padahal, p: [-38, 44, 3], q: [1, -1, -4], f: 38 },
    { t: T.pintu + 0.4, p: [-6, 8, 52], q: [0, -3.5, -3], f: 40 },
    { t: SEC.MEKANISME[0], p: [0, 1.5, 58], q: [0.5, -4, -3], f: 40 },
  ],
  mek: [
    { t: SEC.MEKANISME[0], p: [-8, 2.5, 46], q: [-4, -3.2, -3], f: 38 },
    { t: 18.35, p: [-5, 0.5, 42], q: [-3, -3.8, -3], f: 38 },
    { t: 18.45, p: [6.2, -3.4, 9.6], q: [0.0, -6.2, 0], f: 40 },
    { t: 21.3, p: [8.4, -3.7, 8.8], q: [2.3, -6.2, 0], f: 40 },
    { t: 21.4, p: [-7.6, -2.8, 12.5], q: [-13.2, -7.0, -0.6], f: 40 },
    { t: 23.2, p: [-8.4, -3.0, 12.0], q: [-13.0, -7.0, -0.6], f: 40 },
    { t: 25.45, p: [-8.6, -1.6, 13.5], q: [-12.6, -3.2, -0.3], f: 40 },
    { t: 26.9, p: [-8.2, -2.4, 12.8], q: [-12.4, -4.6, -0.2], f: 40 },
    { t: 28.15, p: [-7.6, -3.0, 12.2], q: [-11.8, -5.4, 0], f: 40 },
    { t: 28.2, p: [-10.2, Y + 0.34, 0.22], q: [6, Y - 0.08, 0], f: 56 },
    { t: 30.25, p: [-5.0, Y + 0.34, 0.22], q: [8, Y - 0.08, 0], f: 56 },
    { t: 30.3, p: [17.5, -2.2, 12.5], q: [10.5, -5.8, -1], f: 40 },
    { t: SEC.REVEAL[0], p: [16, -3, 10.8], q: [11, -6, -1], f: 40 },
  ],
  yard: [
    { t: SEC.REVEAL[0], p: [5.6, 2.3, 2.8], q: [0, 1.1, -1.2], f: 40 },
    { t: T.panjangnya, p: [5.0, 1.9, 1.4], q: [0, 1.1, -1.3], f: 40 },
    { t: T.seratus, p: [0.5, 5.2, 8.5], q: [0, -0.6, -28], f: 40 },
    { t: T.didorong, p: [0.4, 7.2, 10.5], q: [0, -1.0, -40], f: 40 },
    { t: T_SOD, p: [0.3, 9.0, 11.0], q: [0, -1.2, -52], f: 40 },
  ],
  sodetan: [
    { t: T_SOD, p: [-21.5, -5.2, 13.5], q: [-29.2, -7.0, 0], f: 40 },
    { t: T.empat + 0.3, p: [-20.5, -4.6, 15.5], q: [-28.6, -6.6, 0], f: 40 },
    { t: T.sejauh, p: [-14, 0, 40], q: [-14, -5.5, -2], f: 40 },
    { t: SEC.PAYOFF[0], p: [-1, 14, 122], q: [-1, -5, -4], f: 40 },
  ],
  hdd: [
    { t: SEC.PAYOFF[0], p: [-30, 4.0, 25], q: [-20, -1.6, -1], f: 40 },
    { t: T.lubangK, p: [-24, 1.5, 21], q: [-16.5, -3.2, -1], f: 40 },
    { t: 49.25, p: [-7, -2.5, 17], q: [-5.5, -7.2, 0], f: 40 },
    { t: T.diperbesar, p: [13, -1.2, 17], q: [13.5, -4.6, 0], f: 40 },
    { t: T.lalu + 0.1, p: [-2, -1.0, 24], q: [-1, -6.6, 0], f: 40 },
    { t: T.ditarik + 0.6, p: [7, -0.5, 26], q: [5, -6.4, 0], f: 40 },
    { t: SEC.OUTRO[0], p: [-5, 0.5, 30], q: [-3, -6.2, 0], f: 40 },
  ],
  outro: [
    { t: SEC.OUTRO[0], p: [32, 7, 42], q: [7, -3.2, -4], f: 36 },
    { t: T.bawah, p: [26, 3.2, 34], q: [8.6, -5.2, -3.5], f: 36 },
    { t: TOTAL, p: [22, 2.2, 28], q: [10, -5.4, -3], f: 36 },
  ],
};
const followHead = (t: number) => {
  const h = hddState(t).head;
  return { pos: new THREE.Vector3(h.x + 3.5, h.y + 1.2, 13), tgt: new THREE.Vector3(h.x + 0.8, h.y - 2.2, 0), fov: 40 };
};
export const pose = (t: number) => {
  const base = poseFrom(KEYS[sceneAt(t)], t);
  const w = ss(T.lubangK + 0.1, T.lubangK + 0.7, t) * (1 - ss(T.diperbesar - 0.45, T.diperbesar + 0.15, t));
  if (w <= 0) return base;
  const f = followHead(t);
  return { pos: base.pos.lerp(f.pos, w), tgt: base.tgt.lerp(f.tgt, w), fov: base.fov };
};

// ---------- 3D ----------
const SPOT_R: Record<SceneId, number> = { hook: 7, konteks: 16, mek: 3.6, yard: 7, sodetan: 6, hdd: 5, outro: 7 };
const SPOT_I: Record<SceneId, number> = { hook: 8, konteks: 10, mek: 9, yard: 6, sodetan: 7, hdd: 20, outro: 11 };
const SceneRoot: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const { camera } = useThree();
  const M = useMats();
  const plate = useMemo(() => makePlate(["AUDIRA", "PROYEK PIPA BAWAH JALAN"]), []);
  const id = sceneAt(t);
  const p = pose(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(p.pos); cam.up.set(0, 1, 0); cam.lookAt(p.tgt);
    cam.fov = p.fov; cam.near = id === "mek" && t >= 28.2 && t < 30.3 ? 0.05 : 0.3; cam.far = 700;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  });
  const street = id === "hook" || id === "konteks" || id === "mek" || id === "outro";
  const js = jackState(t);
  const golden = id === "outro" ? 1 : 0;
  // distance haze: starts just behind the subject so the soil section and back walls fall off into dark
  const dSub = p.pos.distanceTo(p.tgt);
  const fogNear = dSub + (id === "yard" ? 8 : 3), fogFar = fogNear + (id === "yard" ? 120 : id === "konteks" ? 70 : id === "sodetan" ? 60 : 34);
  const spotR = SPOT_R[id];
  return (
    <>
      <fog attach="fog" args={[C.bg, fogNear, fogFar]} />
      <StreetLights golden={golden} />
      <SubjectSpot tgt={p.tgt} from={[2.5, 7, 9]} radius={spotR} intensity={SPOT_I[id]} />
      {street && (
        <group>
          <Soil M={M} />
          <Road M={M} />
          <Buildings />
          <Traffic t={t} />
          <Hoarding x0={JP.x0 - 0.4} x1={JP.x1 + 0.4} M={M} plate={plate} />
          <Hoarding x0={RPIT.x0 - 0.4} x1={RPIT.x1 + 0.4} M={M} />
          {EXTRA_PITS.map(([a, b]) => <Hoarding key={a} x0={a} x1={b} M={M} />)}
          <Gantry M={M} hookY={js.lower >= 0 ? YP + js.lower * 9 + RP : 4} />
          <Stockpile M={M} />
          <PipeString t={t} M={M} />
          <Laser t={t} on={ss(T.laser - 0.25, T.laser + 0.2, t) * (1 - ss(SEC.MEKANISME[1], SEC.MEKANISME[1] + 0.3, t))} M={M} />
          <Workers f={t * 60} />
          {id === "mek" && t >= 28.2 && t < 30.3 && <pointLight position={[p.pos.x + 1.5, YP + 0.3, 0]} intensity={5} distance={22} decay={1} color="#ffe9cf" />}
        </group>
      )}
      {id === "yard" && <PipeYard t={t} M={M} />}
      {id === "sodetan" && <Sodetan t={t} f={t * 60} M={M} />}
      {id === "hdd" && (
        <group>
          <HddSoil M={M} />
          <Road M={M} />
          <Buildings />
          <Traffic t={t} />
          <HddRig t={t} M={M} />
        </group>
      )}
      <Finish frame={frame} background={C.bg} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1.1} envIntensity={0.32} ao hdri="city" />
    </>
  );
};

// ---------- 2D HUD ----------
const proj = (cam: THREE.PerspectiveCamera, v3: [number, number, number]) => {
  const v = new THREE.Vector3(...v3).project(cam);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, ok: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 };
};
const LABEL: React.CSSProperties = { fontFamily: `'${FONT}'`, fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" };

const Tag: React.FC<{ cam: THREE.PerspectiveCamera; at: [number, number, number]; dx: number; dy: number; text: string; o: number; color?: string }> = ({ cam, at, dx, dy, text, o, color = C.accent }) => {
  if (o <= 0.01) return null;
  const a = proj(cam, at);
  if (!a.ok) return null;
  const tx = Math.min(Math.max(a.x + dx, 60), 1020), ty = Math.min(Math.max(a.y + dy, 290), 1180);
  const right = tx > 560;
  const pop = 0.92 + 0.08 * ss(0, 1, o);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={a.x} y1={a.y} x2={tx} y2={ty} stroke={color} strokeWidth={3} />
        <circle cx={a.x} cy={a.y} r={9} fill={color} stroke="#111" strokeWidth={2} />
      </svg>
      <div style={{ ...LABEL, position: "absolute", left: right ? undefined : tx, right: right ? 1080 - tx : undefined, top: ty - 30, fontSize: 40, color: "#fff", background: C.card, padding: "8px 16px", borderLeft: `6px solid ${color}`, transform: `scale(${pop})`, transformOrigin: right ? "right center" : "left center" }}>{text}</div>
    </div>
  );
};

const Card: React.FC<{ o: number; kicker?: string; title: string; sub?: string; color?: string; top?: number; size?: number }> = ({ o, kicker, title, sub, color = C.accent, top = 300, size = 76 }) => {
  if (o <= 0.01) return null;
  const k = ss(0, 1, o);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - k) * -24}px) scale(${0.92 + 0.08 * k})` }}>
      <div style={{ ...LABEL, background: C.card, padding: "20px 34px 22px", borderTop: `6px solid ${color}`, textAlign: "center", maxWidth: 960 }}>
        {kicker && <div style={{ fontSize: 38, color, letterSpacing: "0.16em" }}>{kicker}</div>}
        <div style={{ fontSize: size, color: "#fff", lineHeight: 1.05, letterSpacing: "0.01em", whiteSpace: "normal" }}>{title}</div>
        {sub && <div style={{ fontSize: 36, color: "#d9d6cf", marginTop: 8, fontWeight: 500, whiteSpace: "normal" }}>{sub}</div>}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const cam = camFromPose(pose(t));
  const id = sceneAt(t);
  const js = jackState(t);
  const hs = hddState(t);
  const hide = 1 - ss(OUTRO_START - 0.3, OUTRO_START, t);
  const lit = litCount(t);
  // dimension bar for the 2,43 m segment (yard)
  const dimO = win(t, T.duaK - 0.15, T.seratus - 0.6, 0.2);
  const d0 = proj(cam, [0, YARD_Y + RP + 0.35, 0]), d1 = proj(cam, [0, YARD_Y + RP + 0.35, -SEG]);
  // ruler 590 m (sodetan)
  const rulerO = win(t, T.lima - 0.2, SEC.PAYOFF[0] + 0.1, 0.25);
  const r0 = proj(cam, [GA.x1, 1.5, 0]), r1 = proj(cam, [GB.x0, 1.5, 0]);
  return (
    <AbsoluteFill style={{ opacity: hide }}>
      {/* HOOK */}
      {id === "hook" && <>
        <Tag cam={cam} at={[-6, YP + RP, 0.4]} dx={60} dy={-300} text="PIPA Ø 1,8 M" o={win(t, T.dua - 0.1, SEC.HOOK[1] + 0.3)} />
        <Tag cam={cam} at={[-1, 0.1, -4]} dx={-40} dy={-260} text="JALAN RAYA" o={win(t, T.jalan0 - 0.1, SEC.HOOK[1] + 0.3)} color={C.cyan} />
        <Card o={win(t, T.tanpa - 0.05, SEC.HOOK[1] + 0.4)} kicker="ASPAL" title="TIDAK DIBONGKAR" top={300} size={70} />
      </>}
      {/* KONTEKS */}
      {id === "konteks" && <>
        <Card o={win(t, T.jalan1 - 0.1, T.lubang1 - 0.05)} kicker="LOKASI PROYEK" title="Jl. DI Panjaitan" sub="Jakarta Timur" size={72} />
        {[[(JP.x0 + JP.x1) / 2, 2.6, -2], [(RPIT.x0 + RPIT.x1) / 2, 2.6, -2], [(EXTRA_PITS[0][0] + EXTRA_PITS[0][1]) / 2, 2.6, -2], [(EXTRA_PITS[1][0] + EXTRA_PITS[1][1]) / 2, 2.6, -2]].map((a, i) => (
          <Tag key={i} cam={cam} at={a as [number, number, number]} dx={i % 2 ? -150 : 130} dy={-70} text="LUBANG GALIAN" o={win(t, T.lubang1 + i * 0.12, T.padahal + 0.3)} color={C.cyan} />
        ))}
        <Tag cam={cam} at={[JP.x1 - 0.6, YP, 0.9]} dx={40} dy={-330} text="PINTU MASUK" o={win(t, T.pintu - 0.1, SEC.KONTEKS[1] + 0.3)} />
        <Tag cam={cam} at={[RPIT.x0 + 0.6, YP, 0.9]} dx={-40} dy={-460} text="PINTU KELUAR" o={win(t, T.keluar - 0.1, SEC.KONTEKS[1] + 0.3)} />
      </>}
      {/* MEKANISME */}
      {id === "mek" && <>
        <Card o={win(t, T.pipe - 0.15, 18.35)} kicker="TEKNIK" title="PIPE JACKING" size={92} />
        <Tag cam={cam} at={[js.F, YP + 0.6, 0.6]} dx={-60} dy={-430} text="MESIN BOR" o={win(t, T.mesin - 0.1, 21.3)} />
        <Tag cam={cam} at={[js.F + 0.15, YP - 0.5, 0.5]} dx={-80} dy={-300} text="MENGIKIS TANAH" o={win(t, T.mengikis - 0.1, 21.3)} color={C.cyan} />
        <Tag cam={cam} at={[JP.x0 + 1.2, -3.6, -1.5]} dx={60} dy={-300} text="LUBANG DORONG" o={win(t, T.lubangD - 0.1, 25.3)} color={C.cyan} />
        <Tag cam={cam} at={[(XR0 + js.R) / 2 - 0.4, YP + 0.62, 1.12]} dx={80} dy={-180} text="DONGKRAK HIDROLIK" o={win(t, T.dongkrak - 0.1, 25.3)} />
        <Tag cam={cam} at={[js.R + SEG * 0.5, YP + RP, 0.2]} dx={60} dy={-260} text="PIPA BETON" o={win(t, T.mendorong, 25.3, 0.15)} color={C.cyan} />
        <Card o={win(t, T.satu - 0.05, T.satu + 1.3) + win(t, T.potong2 - 0.25, 28.15)} kicker="SIKLUS" title="+1 POTONG PIPA" size={64} top={300} />
        <Tag cam={cam} at={[js.F - MLEN + 0.05, YP, 0]} dx={-120} dy={-330} text="TARGET LASER" o={win(t, T.laser, 30.25)} color={C.red} />
        <Card o={win(t, T.laser - 0.05, 30.25)} kicker="ARAH" title="LASER LURUS" size={64} top={300} color={C.red} />
        <Tag cam={cam} at={[RPIT.x0 + 1.6, YP - 1, -1.5]} dx={-40} dy={-380} text="LUBANG TERIMA" o={win(t, T.menuju - 0.1, SEC.REVEAL[0] + 0.2)} color={C.cyan} />
      </>}
      {/* REVEAL A */}
      {id === "yard" && <>
        {dimO > 0.01 && d0.ok && d1.ok && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: dimO }}>
            <line x1={d0.x} y1={d0.y} x2={d1.x} y2={d1.y} stroke={C.accent} strokeWidth={6} />
            <circle cx={d0.x} cy={d0.y} r={10} fill={C.accent} /><circle cx={d1.x} cy={d1.y} r={10} fill={C.accent} />
          </svg>
        )}
        <Card o={dimO} kicker="TIAP POTONG" title="2,43 M" size={110} />
        <Card o={win(t, T.seratus - 0.6, T_SOD + 0.1, 0.15)} kicker={t > T.didorong ? "DIDORONG BERGILIRAN" : "JUMLAH POTONG"} title={`${Math.min(ROW_N, lit)} POTONG`} size={104} />
      </>}
      {/* REVEAL B */}
      {id === "sodetan" && <>
        <Card o={win(t, T.sodetan - 0.1, SEC.PAYOFF[0] + 0.1)} kicker="SODETAN CILIWUNG" title={t < T.sejauh - 0.1 ? "Ø 4,05 M" : "590 M"} sub={t < T.sejauh - 0.1 ? "diameter luar pipa" : "didorong antar-shaft"} size={110} />
        <Tag cam={cam} at={[GA.x1 + 0.5, GY + GR * 0.4, 1.6]} dx={60} dy={180} text="PIPA BETON" o={win(t, T.selebar - 0.1, T.sejauh)} color={C.cyan} />
        {rulerO > 0.01 && r0.ok && r1.ok && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: rulerO }}>
            <line x1={r0.x} y1={r0.y} x2={r0.x + (r1.x - r0.x) * ss(T.lima - 0.2, T.lima + 0.8, t)} y2={r0.y + (r1.y - r0.y) * ss(T.lima - 0.2, T.lima + 0.8, t)} stroke={C.accent} strokeWidth={8} />
            <circle cx={r0.x} cy={r0.y} r={12} fill={C.accent} /><circle cx={r1.x} cy={r1.y} r={12} fill={C.accent} />
          </svg>
        )}
      </>}
      {/* PAYOFF */}
      {id === "hdd" && <>
        <Card o={win(t, T.pengeboran - 0.15, T.lubangK - 0.05)} kicker="HDD" title="Pengeboran Horizontal Terarah" size={62} />
        <Tag cam={cam} at={[hs.head.x, hs.head.y, 0.3]} dx={-60} dy={-300} text="LUBANG KECIL · PILOT" o={win(t, T.lubangK - 0.05, T.diperbesar)} />
        <Tag cam={cam} at={[ENTRY.x + 1, -0.5, 0.3]} dx={40} dy={-200} text="DIBOR MIRING" o={win(t, T.miring - 0.1, T.diperbesar)} color={C.cyan} />
        <Tag cam={cam} at={[hs.reamer.x, hs.reamer.y, 0.4]} dx={40} dy={-320} text="DIPERBESAR · REAMER" o={win(t, T.diperbesar - 0.05, T.lalu + 0.2)} />
        <Tag cam={cam} at={[EXIT.x + 6, 0.8, 0.3]} dx={-40} dy={-300} text="PIPA DITARIK ←" o={win(t, T.ditarik - 0.15, SEC.PAYOFF[1] + 0.3)} />
        <Card o={win(t, T.melewati - 0.1, SEC.PAYOFF[1] + 0.3)} kicker="TANPA LUBANG VERTIKAL" title="LEWAT BAWAH JALAN" size={60} />
      </>}
      {/* OUTRO */}
      {id === "outro" && <>
        <Tag cam={cam} at={[4, 1.6, -5]} dx={-60} dy={-260} text="LALU LINTAS JALAN TERUS" o={win(t, T.lintas - 0.2, OUTRO_START)} color={C.cyan} />
        <Tag cam={cam} at={[js.F - 1.2, YP + RP, 0.3]} dx={-60} dy={-330} text="PIPA MERAYAP" o={win(t, T.bawah, OUTRO_START, 0.15)} />
      </>}
    </AbsoluteFill>
  );
};

// ---------- karaoke captions ----------
type Chunk = { words: Word[]; start: number; end: number };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMW = new Set(["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "puluh", "ratus", "koma", "seratus", "meter", "potong"]);
const CONJ = new Set(["dan", "di", "ke", "dari", "yang", "agar", "lalu", "demi"]);
const cutOk = (ws: Word[], i: number) => i > 0 && i < ws.length && !(NUMW.has(norm(ws[i].w)) && NUMW.has(norm(ws[i - 1].w)) && !/[.,]$/.test(ws[i - 1].w)) && !CONJ.has(norm(ws[i - 1].w));
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CL.forEach((c) => {
    let ws = c.words;
    while (ws.length) {
      let take = ws.length;
      if (ws.length > 6) {
        const target = Math.ceil(ws.length / Math.ceil(ws.length / 5));
        let best = -1, bestCost = 1e9;
        for (let k = 3; k <= Math.min(6, ws.length - 2); k++) {
          const cost = (cutOk(ws, k) ? 0 : 100) + Math.abs(k - target) * 2 + (/[.,]$/.test(ws[k - 1].w) ? -6 : 0);
          if (cost < bestCost) { bestCost = cost; best = k; }
        }
        take = best;
      }
      const part = ws.slice(0, take);
      out.push({ words: part, start: part[0].s - 0.12, end: part[part.length - 1].e + 0.25 });
      ws = ws.slice(take);
    }
  });
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.min(out[i].end, out[i + 1].start);
  return out;
})();
const splitLines = (ws: Word[]): Word[][] => {
  if (ws.length <= 4) return [ws];
  const chars = ws.reduce((a, w) => a + w.w.length + 1, 0);
  let best = Math.ceil(ws.length / 2), bestCost = 1e9;
  for (let k = 2; k <= ws.length - 2; k++) {
    const l1 = ws.slice(0, k).reduce((a, w) => a + w.w.length + 1, 0);
    const cost = Math.abs(chars - 2 * l1) + (cutOk(ws, k) ? 0 : 200);
    if (cost < bestCost) { bestCost = cost; best = k; }
  }
  return [ws.slice(0, best), ws.slice(best)];
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ch = CHUNKS.find((c) => t >= c.start && t < c.end);
  if (!ch || t > OUTRO_START) return null;
  const lines = splitLines(ch.words);
  const appear = ss(ch.start, ch.start + 0.15, t);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1290, fontFamily: `'${FONT}'`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: appear, transform: `translateY(${(1 - appear) * 12}px)` }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24, alignItems: "baseline", padding: "8px 24px", background: "rgba(22,24,29,0.86)", borderRadius: 6 }}>
          {ln.map((w, i) => {
            const active = t >= w.s && t < w.e + 0.08;
            const done = t >= w.e + 0.08;
            const b = active ? 1 + 0.04 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
            return <span key={i} style={{ display: "inline-block", whiteSpace: "nowrap", fontSize: 58, fontWeight: 600, color: active ? C.accent : done ? "#FFFFFF" : "#FFFFFFb0", transform: `scale(${b})` }}>{w.w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill>
      <Stage3D background={C.bg} overlay={() => <><div style={{ position: "absolute", inset: 0, background: "radial-gradient(62% 44% at 50% 44%, rgba(0,0,0,0) 50%, rgba(5,6,9,0.7) 80%, rgba(3,4,6,0.92) 100%)" }} /><Overlay t={t} /><Captions t={t} /></>}>
        <SceneRoot t={t} frame={frame} />
      </Stage3D>
      <Outro start={OUTRO_START} />
    </AbsoluteFill>
  );
};
