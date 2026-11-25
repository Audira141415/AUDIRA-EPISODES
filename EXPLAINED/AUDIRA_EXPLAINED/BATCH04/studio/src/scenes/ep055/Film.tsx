// AE-055 film (FILMNOIR): "Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?"
// One 3D canvas; the camera cuts between the ENIAC hall and two macro stages (hero vacuum tube,
// decimal ring counters). Every cut and beat comes from timeline.json via timing.ts.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { EniacRoom, NOIR, FRONT_X, SOCKET_X, SOCKET_Y, rightPanelZ, COVER_ROOM, type RoomCfg } from "./EniacRoom.tsx";
import { NoirFigure, NoirArm, type NoirPose } from "./SilhouettePerson.tsx";
import { TubeStage, RingStage, FilmTable, TUBE_STAGE, RING_STAGE, RING_X, RING_Y, ringState, tubeOn } from "./Stages.tsx";
import { CUT, SEC, TIMELINE, OUTRO_START, shotAt, word, clip, type ShotName } from "./timing.ts";

const NOIR_GRADE = { ...COLOR_PROFILES.APPLE_STUDIO_CLEAN, vignette: 0.34, grain: 0.03, contrastCurve: 0.28 };
type V3 = [number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Film room: 18 panels per side + 4 at the back = 40 panels in a U (research: 40 panels, U shape).
const ROOM: RoomCfg = {
  ...COVER_ROOM,
  sideCount: 18,
  zStart: -9.3 + 17 * 0.64,
  audiraSide: 4,
  mirrorColor: "#0d0d0d", // cover note: floor reflection was too strong
  floorOpacity: 0.95,
  shaftI: 0.06,
  spotI: 340,
  shadowSize: 1024,
  coverOperators: false,
  foregroundCable: false,
  skipCable: 9,
};
const HERO_PANEL = 9;
const ZP = rightPanelZ(ROOM, HERO_PANEL);
const ZA = rightPanelZ(ROOM, ROOM.audiraSide);
const PLUG_IN_X = FRONT_X - 0.045;

// ---------------------------------------------------------------------------------------------
// Camera per shot
type Cam = { pos: V3; target: V3; fov: number; roll?: number };
const camera = (t: number): Cam => {
  const s = shotAt(t);
  const u = s.u;
  const e = ease(u);
  switch (s.name as ShotName) {
    case "hook":
      return { pos: [0.18 + Math.sin(t * 0.5) * 0.03, 0.62, lerp(1.9, 1.2, u)], target: [-0.05, 1.95, -9], fov: 62, roll: -0.035 };
    case "crane":
      return { pos: [0.1, lerp(0.8, 2.35, e), lerp(1.3, -0.4, e)], target: [0, lerp(1.4, 0.9, e), -9], fov: 60, roll: lerp(-0.035, 0.02, e) };
    case "name": {
      const a = lerp(-0.55, 0.45, e);
      return { pos: [Math.sin(a) * 2.6 + 0.1, lerp(1.25, 0.95, e), -9.4 + Math.cos(a) * 2.6], target: [0.15, 1.75, -9.7], fov: 55, roll: -0.03 };
    }
    case "overhead":
      return { pos: [lerp(0.4, -0.3, e), lerp(10.8, 9.4, e), lerp(3.4, 2.6, e)], target: [0, 0.3, -4.2], fov: 50 };
    case "tube": {
      const dive = clamp01((s.end - t - 0) < 0.4 ? 1 - (s.end - t) / 0.4 : 0);
      const a = lerp(-0.7, 0.3, e);
      const R = lerp(2.05, 1.65, e) * (1 - ease(dive) * 0.58);
      return { pos: add3(TUBE_STAGE, [Math.sin(a) * R, lerp(1.0, 0.9, e), Math.cos(a) * R]), target: add3(TUBE_STAGE, [0, 0.82, 0]), fov: 55 };
    }
    case "ring":
      return { pos: add3(RING_STAGE, [RING_X[2] + lerp(0.18, 0.02, e), 1.47, lerp(1.7, 1.48, e)]), target: add3(RING_STAGE, [RING_X[2], RING_Y + 0.02, 0]), fov: 40 };
    case "decimal":
      return { pos: add3(RING_STAGE, [RING_X[2] + lerp(0.02, -0.12, e), 1.5, lerp(1.5, 2.0, e)]), target: add3(RING_STAGE, [RING_X[2], RING_Y + 0.04, 0]), fov: 40 };
    case "carry":
      return { pos: add3(RING_STAGE, [lerp(0.08, -0.05, e), RING_Y + 0.02, lerp(3.75, 3.55, e)]), target: add3(RING_STAGE, [0, RING_Y + 0.12, 0]), fov: 54 };
    case "question":
      return { pos: [lerp(-0.6, -0.15, e), lerp(1.4, 1.28, e), ZP + lerp(2.5, 1.25, e)], target: [1.08, 1.15, ZP], fov: 50, roll: -0.03 };
    case "hands":
      return { pos: [lerp(-0.05, 0.08, e), lerp(1.42, 1.36, e), ZP + lerp(0.78, 0.62, e)], target: [1.08, 1.08, ZP + 0.02], fov: 45 };
    case "switches":
      return { pos: [lerp(0.4, 0.25, e), lerp(1.12, 1.0, e), -5.12 - 0.2 * e], target: [0.05, 0.75, -6.0], fov: 50 };
    case "days":
      return { pos: [0.18, 0.66, lerp(1.4, 1.0, u)], target: [-0.05, 1.95, -9], fov: 62, roll: -0.035 };
    case "women":
      return { pos: [lerp(0.05, -0.1, e), lerp(0.85, 0.95, e), lerp(1.3, -0.4, e)], target: [0, 1.35, -9], fov: 58, roll: -0.025 };
    case "cable":
      return {
        pos: lerp3([0.08, 1.36, ZP + 0.62], [-0.45, 1.45, ZP + 2.1], ease((u - 0.3) / 0.7)),
        target: lerp3([1.08, 1.08, ZP + 0.02], [0.95, 1.35, ZP - 1.6], ease((u - 0.3) / 0.7)),
        fov: 45,
      };
    case "plate":
    case "outro":
      return { pos: [-0.3, 1.62, ZA + lerp(0.38, -0.12, clamp01((t - CUT.plate) / (OUTRO_START + 0.6 - CUT.plate)))], target: [1.08, 1.6, ZA], fov: 34 };
  }
  return { pos: [0, 1, 3], target: [0, 1, 0], fov: 60 };
};

const CamRig: React.FC<{ c: Cam }> = ({ c }) => {
  const { camera: cam } = useThree();
  useLayoutEffect(() => {
    const pc = cam as THREE.PerspectiveCamera;
    pc.position.set(...c.pos);
    const r = c.roll ?? 0;
    pc.up.set(Math.sin(r), Math.cos(r), 0);
    pc.lookAt(...c.target);
    pc.fov = c.fov;
    pc.near = 0.03;
    pc.far = 80;
    pc.layers.enable(FX_LAYER);
    pc.updateProjectionMatrix();
  });
  return null;
};

// ---------------------------------------------------------------------------------------------
// Hero patch cable on the right-row panel: unplug, move, replug (hands); push in (outro).
const heroPlug = (t: number): { x: number; z: number; arm: boolean; grip: number } => {
  const zs = (k: number) => ZP + SOCKET_X(k);
  const out = PLUG_IN_X - 0.13;
  if (t < CUT.hands) return { x: PLUG_IN_X, z: zs(1), arm: false, grip: 0 };
  if (t < CUT.switches) {
    const pull = word("l11", "mencabut").s;
    const put = word("l11", "memasang").s;
    const kabel = word("l11", "kabel").s;
    const k1 = ease((t - pull) / 0.35);
    const k2 = ease((t - (pull + 0.4)) / (put + 0.3 - (pull + 0.4)));
    const k3 = ease((t - (put + 0.3)) / Math.max(0.2, kabel + 0.15 - (put + 0.3)));
    return { x: lerp(lerp(PLUG_IN_X, out, k1), PLUG_IN_X, k3), z: lerp(zs(1), zs(3), k2), arm: true, grip: t > pull - 0.3 ? 1 : 0 };
  }
  if (t < CUT.cable) return { x: PLUG_IN_X, z: zs(3), arm: false, grip: 0 };
  const push = word("l14", "program").s;
  const k = ease((t - push) / 0.45);
  return { x: lerp(out, PLUG_IN_X, k), z: zs(3), arm: t < push + 1.2, grip: 1 };
};

const HeroCable: React.FC<{ t: number }> = ({ t }) => {
  const p = heroPlug(t);
  const geo = useMemo(() => {
    const a = new THREE.Vector3(p.x - 0.04, SOCKET_Y, p.z);
    const b = new THREE.Vector3(FRONT_X - 0.02, 0.32, ZP + 0.6);
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(-0.12, -0.35, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, a.clone().add(new THREE.Vector3(-0.08, -0.02, 0)), mid, b]), 48, 0.013, 8, false);
  }, [p.x, p.z]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  const rubber = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0c0c0d", roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.35 }), []);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#9a968c", metalness: 1, roughness: 0.25 }), []);
  return (
    <group>
      <mesh geometry={geo} material={rubber} castShadow />
      <group position={[p.x, SOCKET_Y, p.z]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={rubber} castShadow>
          <cylinderGeometry args={[0.024, 0.028, 0.08, 18]} />
        </mesh>
        <mesh position={[0, -0.05, 0]} material={metal}>
          <cylinderGeometry args={[0.01, 0.01, 0.03, 10]} />
        </mesh>
      </group>
      {p.arm && <NoirArm from={[0.35, 0.55, p.z + 0.5]} to={[p.x - 0.07, SOCKET_Y - 0.01, p.z + 0.01]} grip={p.grip} />}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Operators (faceless 1940s silhouettes)
const P = {
  reachUp: { rs: [-2.5, 0, -0.12], re: -0.25, head: [-0.25, 0, 0] } as Partial<NoirPose>,
  plug: { ls: [-1.25, 0, 0.2], le: -0.7, rs: [-0.4, 0, -0.1], re: -0.9, head: [0.15, 0, 0], lean: 0.08 } as Partial<NoirPose>,
  clipboard: { ls: [-0.6, 0, 0.15], le: -1.5, rs: [-0.55, 0, -0.15], re: -1.5, head: [0.35, 0, 0] } as Partial<NoirPose>,
  turnKnob: { rs: [-1.05, 0, -0.1], re: -0.55, head: [0.2, 0, 0], lean: 0.12 } as Partial<NoirPose>,
  walk: { ls: [0.3, 0, 0.08], le: -0.2, rs: [-0.3, 0, -0.08], re: -0.3, step: 0.6 } as Partial<NoirPose>,
};

const Operators: React.FC<{ t: number; shot: ShotName }> = ({ t, shot }) => {
  const sway = Math.sin(t * 1.3) * 0.04;
  if (shot === "women") {
    // Six programmers at the panels (no names, no faces).
    const W: { pos: V3; h: number; pose: Partial<NoirPose> }[] = [
      { pos: [-0.66, 0, -1.6], h: -Math.PI / 2, pose: P.plug },
      { pos: [0.7, 0, -2.9], h: Math.PI / 2, pose: P.reachUp },
      { pos: [-0.2, 0, -4.1], h: Math.PI + 0.3, pose: P.clipboard },
      { pos: [-0.66, 0, -5.3], h: -Math.PI / 2 + 0.2, pose: P.turnKnob },
      { pos: [0.68, 0, -6.6], h: Math.PI / 2, pose: P.plug },
      { pos: [0.15, 0, -8.6], h: Math.PI, pose: P.reachUp },
    ];
    return (
      <>
        {W.map((w, i) => (
          <NoirFigure key={i} position={w.pos} heading={w.h} pose={{ ...w.pose, head: [((w.pose.head ?? [0, 0, 0])[0] as number) + sway * (i % 2 ? 1 : -1), 0, 0] }} woman />
        ))}
      </>
    );
  }
  if (shot === "days") {
    const day = Math.floor(clamp01((t - CUT.days) / (CUT.women - CUT.days)) * 3);
    const spots: V3[][] = [
      [[-0.66, 0, -2.4], [0.6, 0, -6.0]],
      [[0.7, 0, -3.6], [-0.2, 0, -7.2]],
      [[-0.66, 0, -4.8], [0.66, 0, -1.9]],
    ];
    const s = spots[Math.min(2, day)];
    return (
      <>
        <NoirFigure position={s[0]} heading={s[0][0] < 0 ? -Math.PI / 2 : Math.PI / 2} pose={P.plug} woman />
        <NoirFigure position={s[1]} heading={s[1][0] < 0 ? -Math.PI / 2 : Math.PI / 2} pose={P.reachUp} woman={day !== 1} />
      </>
    );
  }
  if (shot === "hook" || shot === "crane" || shot === "name" || shot === "overhead" || shot === "question") {
    return (
      <>
        <NoirFigure position={[0.3, 0, -9.2]} heading={Math.PI} pose={P.reachUp} woman />
        <NoirFigure position={[0.66, 0, -5.4]} heading={Math.PI / 2 + 0.25} pose={P.plug} woman={false} />
        {shot !== "hook" && <NoirFigure position={[-0.62, 0, -3.2]} heading={-Math.PI / 2} pose={P.clipboard} woman />}
      </>
    );
  }
  if (shot === "switches") {
    return <NoirArm from={[0.62, 0.42, -5.25]} to={[0.18, 0.79, -5.92]} grip={1} />;
  }
  return null;
};

// ---------------------------------------------------------------------------------------------
// 3D world per shot
const World: React.FC<{ t: number; f: number; frame: number }> = ({ t, f, frame }) => {
  const s = shotAt(t);
  const shot = s.name;
  const inRoom = !["tube", "ring", "decimal", "carry"].includes(shot);
  let power = 1;
  if (shot === "hook") power = 0.06 + 0.94 * ease((t - 0.35) / 2.7);
  let spotX = ROOM.spotX;
  let spotI = ROOM.spotI;
  if (shot === "days") {
    const k = clamp01((t - CUT.days) / (CUT.women - CUT.days)) * 3;
    const frac = k % 1;
    spotI = ROOM.spotI * Math.pow(Math.max(0, Math.sin(Math.PI * frac)), 0.6);
    spotX = 0.25 + (frac - 0.5) * 1.4;
  }
  if (shot === "women") spotI *= 0.55; // camera walks into the window patch: keep noir blacks
  const cfg: RoomCfg = {
    ...ROOM,
    power,
    spotX,
    spotI: inRoom ? spotI : 0,
    ceiling: shot !== "overhead",
    plateLight: shot === "plate" || shot === "outro" ? 0.9 : 0,
  };
  return (
    <>
      <CamRig c={camera(t)} />
      <ambientLight intensity={0.05} color="#8a93a0" />
      <hemisphereLight args={["#9aa4b2", "#1a1410", 0.08]} />
      <group visible={inRoom}>
        <EniacRoom f={f} cfg={cfg}>
          <HeroCable t={t} />
          {(shot === "hands" || shot === "cable" || shot === "question") && (
            <>
              <pointLight position={[0.72, 1.4, ZP + 0.3]} color="#ffd9a8" intensity={0.7} distance={1.4} decay={2} />
              <pointLight position={[0.85, 1.55, ZP - 0.55]} color="#cfd9e6" intensity={1.4} distance={1.5} decay={2} />
            </>
          )}
          {shot === "switches" && <FilmTable position={[0.05, 0, -6.2]} rotationY={0} t={t} turnFrom={CUT.switches + 0.2} />}
          <Operators t={t} shot={shot} />
        </EniacRoom>
      </group>
      <group visible={shot === "tube"}>
        <TubeStage t={t} />
      </group>
      <group visible={shot === "ring" || shot === "decimal" || shot === "carry"}>
        <RingStage t={t} wide={shot === "carry"} />
      </group>
      <Finish frame={frame} background={NOIR.void} profile={NOIR_GRADE} exposure={0.72} envIntensity={0.1} ao />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Overlays: case-file labels (top safe zone), counters, odometer, karaoke captions.
const AMBER = "#ffc98a";
const CREAM = "#efe9dc";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', Courier, monospace";

const appear = (t: number, a: number, b: number, fadeIn = 0.25, fadeOut = 0.2) =>
  Math.min(clamp01((t - a) / fadeIn), clamp01((b - t) / fadeOut));

const Label: React.FC<{ t: number; a: number; b: number; k: number; kicker?: string; big: React.ReactNode; size?: number; sub?: React.ReactNode; top?: number }> = ({ t, a, b, k, kicker, big, size = 96, sub, top = 210 }) => {
  const o = appear(t, a, b);
  if (o <= 0) return null;
  const y = (1 - ease((t - a) / 0.35)) * 26;
  return (
    <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: top * k, opacity: o, transform: `translateY(${y * k}px)` }}>
      {kicker && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 8 * k, color: AMBER, marginBottom: 14 * k }}>{kicker}</div>}
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size * k, lineHeight: 1.02, color: CREAM, textShadow: `0 ${4 * k}px ${26 * k}px rgba(0,0,0,0.95)` }}>{big}</div>
      {sub && (
        <>
          <div style={{ width: 110 * k, height: 3 * k, background: AMBER, margin: `${22 * k}px 0 ${16 * k}px` }} />
          <div style={{ display: "inline-block", padding: `${6 * k}px ${12 * k}px`, background: "rgba(5,5,6,0.72)", fontFamily: MONO, fontWeight: 700, fontSize: 34 * k, letterSpacing: 2 * k, color: "#ddd6c8", textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>{sub}</div>
        </>
      )}
    </div>
  );
};

const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const Odometer: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const a = word("l08", "seperti").s - 0.2;
  const b = CUT.question;
  const o = appear(t, a, b);
  if (o <= 0) return null;
  const roll = ease((t - (word("l08", "odometer").s - 0.25)) / 0.7);
  const drum = (from: number, to: number) => {
    const v = from + (to - from) * roll; // rolling position
    return (
      <div style={{ width: 130 * k, height: 180 * k, overflow: "hidden", background: "linear-gradient(180deg,#0b0a09,#26221c 50%,#0b0a09)", border: `${3 * k}px solid #8d7a55`, borderRadius: 8 * k, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -(v - from) * 180 * k }}>
          {[from, from + 1].map((d, i) => (
            <div key={i} style={{ height: 180 * k, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 124 * k, color: CREAM }}>
              {d % 10}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 220 * k, opacity: o, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 8 * k, color: AMBER, marginBottom: 18 * k }}>SEPERTI ODOMETER</div>
      <div style={{ display: "flex", gap: 14 * k, padding: 16 * k, background: "rgba(5,5,6,0.8)", borderRadius: 12 * k }}>
        {drum(0, 0)}
        {drum(0, 1)}
        {drum(9, 10)}
      </div>
    </div>
  );
};

const RingReadout: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const s = shotAt(t).name;
  if (s !== "carry") return null;
  const a = CUT.carry;
  const b = word("l08", "seperti").s - 0.2;
  const o = appear(t, a + 0.1, b);
  if (o <= 0) return null;
  const st = ringState(t);
  const cells = ["RATUSAN", "PULUHAN", "SATUAN"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230 * k, opacity: o, display: "flex", justifyContent: "center", gap: 40 * k }}>
      {cells.map((c, i) => (
        <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 170 * k, lineHeight: 1, color: i === 1 && st.d[1] === 1 ? AMBER : CREAM, textShadow: "0 4px 24px rgba(0,0,0,0.95)" }}>{st.d[i]}</div>
          <div style={{ fontFamily: MONO, fontSize: 22 * k, letterSpacing: 4 * k, color: "#cfc8b9", marginTop: 8 * k }}>{c}</div>
        </div>
      ))}
    </div>
  );
};

const Overlays: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const l02 = clip("l02");
  const delapan = word("l02", "delapan").s;
  const ribu = word("l02", "ribu").e;
  const n = Math.round((18000 * ease((t - delapan) / (ribu - delapan))) / 100) * 100;
  const on = tubeOn(t);
  return (
    <>
      <Label t={t} a={word("l01", "tidak").s} b={CUT.crane} k={k} kicker="1940-AN" big="TANPA LAYAR." sub="TANPA KEYBOARD" />
      <Label t={t} a={delapan - 0.2} b={l02.end + 0.4} k={k} kicker="SEKITAR" big={`± ${thousands(n)}`} size={150} sub="TABUNG VAKUM MENYALA" />
      <Label t={t} a={word("l03", "ENIAC").s} b={CUT.overhead} k={k} kicker="NAMANYA" big="ENIAC" size={170} sub={t > word("l03", "diumumkan").s ? "DIUMUMKAN 1946" : " "} />
      <Label t={t} a={word("l04", "dua").s} b={CUT.tube} k={k} kicker="BERAT" big="± 27 TON" size={140} sub={t > word("l04", "memenuhi").s - 0.1 ? "1 RUANGAN · 40 PANEL BENTUK U" : " "} />
      <Label t={t} a={word("l05", "tabung").s} b={CUT.ring} k={k} kicker="TABUNG VAKUM = SAKLAR" big={t > word("l05", "saklar").s ? (on ? "ON" : "OFF") : "SAKLAR"} size={150} sub={t > word("l05", "tanpa").s - 0.05 ? "TANPA BAGIAN BERGERAK" : " "} />
      <Label t={t} a={word("l06", "penghitung").s} b={CUT.decimal} k={k} kicker="PENGHITUNG 10 POSISI" big="0 – 9" size={150} sub={t > word("l06", "nol").s ? "SATU LAMPU MENYALA" : " "} />
      <Label
        t={t}
        a={word("l07", "desimal").s - 0.1}
        b={CUT.carry}
        k={k}
        kicker="ENIAC MENGHITUNG"
        big="DESIMAL"
        size={150}
        sub={t > word("l07", "bukan").s - 0.05 ? <span style={{ textDecoration: "line-through", textDecorationThickness: 4 * k, textDecorationColor: AMBER }}>BINER</span> : " "}
      />
      <RingReadout t={t} k={k} />
      <Odometer t={t} k={k} />
      <Label t={t} a={word("l09", "bagaimana").s} b={CUT.hands} k={k} big="BAGAIMANA MEMPROGRAMNYA?" size={88} />
      <Label t={t} a={CUT.hands} b={CUT.switches} k={k} kicker="CARA MEMPROGRAM" big="DENGAN TANGAN" size={110} sub={t > word("l11", "mencabut").s ? "CABUT · PASANG KABEL" : " "} />
      <Label t={t} a={word("l11", "memutar").s - 0.1} b={CUT.days} k={k} kicker="LALU MEMUTAR" big="RIBUAN SAKLAR" size={110} />
      <Label
        t={t}
        a={CUT.days + 0.05}
        b={CUT.women}
        k={k}
        kicker="1 SOAL"
        big={`HARI ${1 + Math.min(2, Math.floor(clamp01((t - CUT.days) / (CUT.women - CUT.days)) * 3))}`}
        size={140}
        sub="PERSIAPAN BERHARI-HARI"
      />
      <Label t={t} a={word("l13", "enam").s - 0.1} b={CUT.cable} k={k} kicker="PROGRAMMER PERTAMA" big="6 PEREMPUAN" size={128} sub={t > word("l13", "namanya").s ? "NAMA MEREKA TIDAK DISEBUT SAAT ENIAC DIUMUMKAN" : " "} />
      <Label t={t} a={word("l14", "kabel").s - 0.1} b={CUT.plate} k={k} big="KABEL, BUKAN KETIKAN." size={92} />
    </>
  );
};

// Karaoke captions: phrases of up to 5 words, active word amber with a micro-bounce.
type Phrase = { words: { w: string; s: number; e: number }[]; start: number; end: number };
const phrases = (): Phrase[] => {
  const out: Phrase[] = [];
  for (const c of TIMELINE.clips) {
    let cur: Phrase["words"] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    };
    c.words.forEach((w, i) => {
      cur.push(w);
      const rest = c.words.length - i - 1;
      if (cur.length >= 5 || (/[,.?!]$/.test(w.w) && cur.length >= 2 && rest !== 1) ) flush();
    });
    flush();
  }
  for (let i = 0; i < out.length; i++) out[i].end = i + 1 < out.length ? Math.min(out[i + 1].start, out[i].end + 0.6) : out[i].end + 0.6;
  return out;
};

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const list = useMemo(phrases, []);
  if (t >= OUTRO_START) return null;
  const p = list.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!p) return null;
  // Line breaks by word count: up to 4 words on one line; longer phrases split into two balanced
  // lines (never a single word left alone). Font shrinks for long lines instead of wrapping.
  const n = p.words.length;
  const cut = n <= 4 ? n : Math.ceil(n / 2);
  const lines = [p.words.slice(0, cut), p.words.slice(cut)].filter((l) => l.length);
  const longest = Math.max(...lines.map((l) => l.map((w) => w.w).join(" ").length));
  const size = 54 * Math.min(1, 30 / longest);
  let idx = 0;
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, bottom: 410 * k, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", rowGap: 4 * k, padding: `${14 * k}px ${26 * k}px`, background: "rgba(5,5,6,0.62)", borderLeft: `${4 * k}px solid ${AMBER}` }}>
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", whiteSpace: "nowrap", columnGap: 16 * k }}>
            {line.map((w) => {
              const i = idx++;
              const active = t >= w.s && t < w.e + 0.05;
              const done = t >= w.e;
              const bounce = active ? 1 + 0.08 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: size * k, color: active ? AMBER : done ? CREAM : "rgba(239,233,220,0.55)", display: "inline-block", transform: `scale(${bounce})`, textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}>
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

// Light flash on the macro cuts (zoom-through the glowing tube, power pulses).
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const cuts = [CUT.ring, CUT.tube, CUT.question];
  let o = 0;
  for (const c of cuts) {
    if (t >= c - 0.15 && t < c) o = Math.max(o, (t - (c - 0.15)) / 0.15);
    if (t >= c && t < c + 0.35) o = Math.max(o, 1 - (t - c) / 0.35);
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(60% 45% at 50% 45%, rgba(255,214,160,1) 0%, rgba(255,170,90,0.55) 45%, rgba(5,5,6,0) 100%)", opacity: o * 0.85, mixBlendMode: "screen" }} />;
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: NOIR.void }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 0.6, 2], fov: 62, near: 0.03, far: 80 }}>
        <World t={t} f={f} frame={frame} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.82) 0%, rgba(5,5,6,0.6) 22%, rgba(5,5,6,0) 40%)", pointerEvents: "none" }} />
      <Flash t={t} />
      <Overlays t={t} k={k} />
      <Captions t={t} k={k} />
      <Outro start={OUTRO_START} />
    </AbsoluteFill>
  );
};

export const FILM_SECONDS = TIMELINE.total;
export { SEC };
