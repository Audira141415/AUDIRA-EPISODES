// EP02 — Maraton Paling Kacau, St. Louis 1904 (VINTAGEFORGE). Multi-scene director, every cut on the locked VO:
//   A   HOOK      cover B: the motor car, a runner waving from the passenger seat
//   B1  KONTEKS   Francis Field start, 15.00, 32 runners, brass thermometer 32 °C
//   B2  KONTEKS   one hand pump on the hill road: route map 40 km · 7 hills · 1 official water point
//   C1  PENGEMB.  Fred Lorz cramps at mile post 9 and climbs into the car
//   C2  PENGEMB.  stadium finish: Lorz breaks the tape, magnesium flash, DISKUALIFIKASI, LARANGAN SEUMUR HIDUP
//   D1  PENJELAS. trainer's table close-up: STRYCHNINE bottle, egg white, brandy
//   D2  PENJELAS. hill road to the finish gate: Hicks held up by his trainer, tape, pocket watch 3:28:53 (payoff)
//   Ea  PAYOFF    apple orchard: Félix Carvajal picks an apple, cramps, still finishes 4th
//   Eb  PAYOFF    cornfield: Len Taunyane chased off course by a dog
//   Ec  PAYOFF    chalkboard: 32 start → 14 finish
//   OUT OUTRO     press room: THE AUDIRA GAZETTE "LORZ JUARA BOSTON MARATHON 1905" + EP03 teaser (AUDIRA card from Root)
// Facts on screen only from research/SOURCE_REGISTER.md. Figures are stylised toys (no real faces, no logos).
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { CAR_DIM, MilePost, MotorCar, RoadSet, runPose } from "./RoadSet.tsx";
import { FRAMING_B, sitWave } from "./Cover.tsx";
import {
  Apple, bellyPose, BoxCamera, Cam, camAt, ChalkBoard, clutchCalf, CornField, eatPose, FinishGate, FinishTape, Hat, HillRoadSet,
  LampLights, LOOK, mixPose, OrchardSet, paintPaper, PressRoom, pistolPose, PumpSet, reachPose, Sign, StadiumSet, SunLights,
  supportPose, tapePose, ToyPerson, TrainerTable, type Key, type Shot, type V3,
} from "./sets.tsx";
import { Model as Glb } from "./Model.tsx";
import { Captions, Card, DustHaze, DustWipe, Flash, Frame, HeatHaze, HookTitle, NameCard, PocketWatch, RouteMap, Stamp, Teaser, Thermometer, type CapWord } from "./hud.tsx";
import { CLIPS, CUT, CUTS, IMPACT, T, clamp, lerp, sceneAt, seg } from "./timing.ts";

const K = (t: number, pos: V3, target: V3, fov: number): Key => ({ t, pos, target, fov });
const add = (s: Shot, d: V3): Shot => ({ ...s, pos: [s.pos[0] + d[0], s.pos[1] + d[1], s.pos[2] + d[2]], target: [s.target[0] + d[0], s.target[1] + d[1], s.target[2] + d[2]] });

/** Real light pool on the shot target: the subject is lit, the surroundings fall off (depth by light, not by 2D overlay). */
const PoolLight: React.FC<{ target: V3 }> = ({ target }) => {
  const ref = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.target.position.set(...target);
    l.target.updateMatrixWorld();
  });
  return <spotLight ref={ref} position={[target[0] + 1.2, target[1] + 5.5, target[2] + 2.4]} angle={0.21} penumbra={0.6} intensity={240} distance={18} decay={1.6} color="#ffe6b8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} />;
};

/** One R3F canvas per scene with the VINTAGEFORGE finish (memory best: VINTAGE_SEPIA_FILM, exposure 0.82, env 0.25). */
const Stage: React.FC<{ shot: Shot; frame: number; bg?: string; exposure?: number; lift?: number; pool?: boolean; children: React.ReactNode }> = ({ shot, frame, bg = "#4f3922", exposure = 0.82, lift = 0.09, pool = true, children }) => {
  const { width, height } = useVideoConfig();
  const focus = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 200 }}>
        <Cam shot={shot} lift={lift} />
        {pool && <PoolLight target={shot.target} />}
        {children}
        <Finish frame={frame} profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM} exposure={exposure} envIntensity={0.45} hdri="warmStudio" focus={focus} aperture={0.006} maxBlur={0.02} />
      </ThreeCanvas>
      {/* museum-vitrine vignette: the subject sits in the warm pool of light, the edges fall off */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 36% 22% at 50% 41%, rgba(255,226,170,0.9) 0%, rgba(255,226,170,0) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 62% at 50% 50%, rgba(36,21,9,0) 55%, rgba(36,21,9,0.42) 100%)" }} />
      {/* film grain + paper fibre (VINTAGEFORGE): a new grain seed every 2 frames */}
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.4 }}>
          <filter id={`g${frame}`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.9 * (width / 1080)} numOctaves={2} seed={Math.floor(frame / 2) % 17} />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 1.6 -0.35" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#g${frame})`} />
        </svg>
      </AbsoluteFill>
      {/* scrims under the HUD (top) and the karaoke band (bottom) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(36,21,9,0.6) 0%, rgba(36,21,9,0.25) 17%, rgba(36,21,9,0) 26%, rgba(36,21,9,0) 62%, rgba(36,21,9,0.3) 70%, rgba(36,21,9,0) 80%, rgba(36,21,9,0) 100%)" }} />
    </AbsoluteFill>
  );
};

// ================================================================= A — hook (cover B, the car rolls on)
const CAR_V = 0.42;
const hookShot = (t: number): Shot => {
  const fb = FRAMING_B;
  const keys = [K(0, fb.pos, fb.target, fb.fov), K(3.6, [2.1, 1.3, 4.1], [-0.12, 0.45, 0.35], 36), K(CUT.B1, [1.7, 1.25, 3.6], [-0.12, 0.5, 0.45], 34)];
  const s = camAt(keys, t, 0.02 * seg(t, 0, 1.2), 3);
  return add(s, [0, 0, t * CAR_V]);
};
const HookScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const z = t * CAR_V;
  return (
    <Stage shot={hookShot(t)} frame={frame} lift={0}>
      <SunLights />
      <RoadSet post={false} />
      <MotorCar position={[0, 0, z]} />
      <ToyPerson f={30 + f} seed={4} look={LOOK.lorz} poseOverride={sitWave(30 + f, 4)} position={[-0.14, CAR_DIM.seatY + 0.05, CAR_DIM.seatZ + z]} heading={0} scale={0.8} />
      <ToyPerson f={f} seed={11} look={{ ...LOOK.hicks, skin: "#b47a52", top: "#e2d6bc" }} poseOverride={runPose(46 + f, 11, 0.9)} position={[-0.8, 0, -7 + t * 0.55]} heading={0} />
    </Stage>
  );
};
const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <HookTitle o={1 - seg(t, 2.1, 2.7)} />
    <Card t={t} a={T.juaraHook - 0.05} b={CUT.B1 + 0.1} y={300} text="JUARA OLIMPIADE?" sub="ST. LOUIS · 1904" size={64} />
    <DustHaze t={t} puffs={[[980, 1150, 260, 0.5], [860, 1060, 200, 0.4], [1060, 1300, 220, 0.4]]} />
  </>
);

// ================================================================= B1 — Francis Field start
const RUNNERS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ z: -1.5 + (i % 4) * 0.95 - (i > 3 ? 0.45 : 0), x: -2 - (i > 3 ? 0.7 : 0), seed: 20 + i, skin: ["#f3cfb3", "#e6b28c", "#b47a52", "#d09a6c"][i % 4] }));
/** Lead runner (nearest lane) — after the gun the camera rides alongside him. */
const LEAD = 3;
const runSpeed = (i: number) => (i === LEAD ? 3.1 : 2.45 + (i % 3) * 0.12);
const leadX = (t: number) => RUNNERS[LEAD].x + Math.max(0, t - T.start) * runSpeed(LEAD);
const startShot = (t: number): Shot => {
  const pre = camAt([K(CUT.B1, [3.8, 2.6, 7.6], [-1.6, 1.0, -0.6], 40), K(T.start - 0.5, [0.2, 1.5, 5.6], [-2.4, 1.0, 0.2], 36)], t, 0.025, 5);
  const x = leadX(t);
  const ride: Shot = { pos: [x + 1.2, 1.1, 5.0], target: [x - 0.15, 0.45, RUNNERS[LEAD].z], fov: 34 };
  const k = seg(t, T.start - 0.3, T.start + 0.9);
  return { pos: [lerp(pre.pos[0], ride.pos[0], k), lerp(pre.pos[1], ride.pos[1], k), lerp(pre.pos[2], ride.pos[2], k)], target: [lerp(pre.target[0], ride.target[0], k), lerp(pre.target[1], ride.target[1], k), lerp(pre.target[2], ride.target[2], k)], fov: lerp(pre.fov, ride.fov, k) };
};
const StartScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const go = t >= T.start;
  const run = Math.max(0, t - T.start);
  return (
    <Stage shot={startShot(t)} frame={frame} lift={0.02}>
      <SunLights fogNear={18} fogFar={70} />
      <StadiumSet t={t} cheer={go ? 1 : 0.3} />
      <ToyPerson f={f} seed={7} look={LOOK.starter} poseOverride={pistolPose(go ? Math.exp(-(t - T.start) * 6) : 0)} position={[-2.9, 0, 2.05]} heading={-0.9} />
      {RUNNERS.map((r, i) => (
        <ToyPerson key={i} f={f + i * 13} seed={r.seed} look={{ outfit: "casual", top: i === LEAD ? "#f6efe0" : "#d9ccb0", bottom: "#2c1d12", skin: r.skin, hairStyle: 0 }} poseOverride={go ? runPose(f + i * 13, r.seed, 0) : mixPose(runPose(10, r.seed, 0), runPose(10, r.seed, 0), 0)} position={[r.x + run * runSpeed(i), 0, r.z]} heading={Math.PI / 2} />
      ))}
    </Stage>
  );
};
const StartHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.tanggal} b={T.pelari32 - 0.05} y={260} text="30 AGUSTUS 1904" sub="ST. LOUIS · START PUKUL 15.00" size={66} />
    <Card t={t} a={T.pelari32} b={T.suhu - 0.05} y={260} text="32 PELARI" sub="SIAP DI GARIS START" size={88} />
    <Thermometer t={t} a={T.suhu} b={CUT.B2 + 0.1} y={250} />
    <Flash t={t} at={T.start} dur={0.25} max={0.55} />
  </>
);

// ================================================================= B2 — one water pump on the hill road
const pumpShot = (t: number): Shot =>
  camAt([K(CUT.B2, [3.8, 1.35, 6.2], [0.7, 0.75, 0.1], 38), K(T.satuTitik, [2.7, 1.3, 4.1], [0.6, 0.62, 0.2], 36), K(CUT.C1, [2.3, 1.2, 3.3], [1.4, 2.2, -6], 37)], t, 0.02, 7);
const PumpScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={pumpShot(t)} frame={frame}>
    <SunLights sun={[4, 12, -6]} keyI={0.5} />
    <PumpSet t={t} />
  </Stage>
);
const PumpHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <RouteMap t={t} a={CUT.B2 + 0.1} b={CUT.C1 + 0.1} y={240} hillsAt={T.bukit} waterAt={T.satuTitik} />
    <DustHaze t={t} puffs={[[150, 1180, 220, 0.35], [950, 1250, 200, 0.3]]} />
  </>
);

// ================================================================= C1 — Lorz cramps, climbs into the car
const LORZ_X = 0.45;
const lorzRoad = (t: number) => {
  const zK = -6 + (T.kram - CUT.C1) * 1.6;
  if (t < T.kram) return { z: -6 + (t - CUT.C1) * 1.6, state: "run" as const, zK };
  if (t < T.menumpang + 0.2) return { z: zK, state: "cramp" as const, zK };
  return { z: zK, state: "car" as const, zK };
};
const carZ = (t: number, zK: number) => {
  const stop = zK + 0.15;
  if (t < T.menumpang - 0.4) return lerp(-12, stop, seg(t, T.kram - 0.4, T.menumpang - 0.4));
  return stop + Math.max(0, t - (T.menumpang + 0.7)) ** 1.4 * 1.6;
};
const roadShot = (t: number): Shot => {
  const L = lorzRoad(t);
  const focusZ = L.state === "car" ? carZ(t, L.zK) : L.z;
  const base = camAt([K(CUT.C1, [3.9, 1.35, 1.0], [0.2, 0.85, 0], 36), K(T.kram, [3.3, 1.2, 0.6], [0.2, 0.75, 0], 33), K(T.menumpang + 0.6, [3.2, 1.3, 0.8], [0, 0.85, 0], 34), K(CUT.C2, [2.6, 1.35, -0.6], [-0.2, 0.9, 3.0], 38)], t, 0.02, 9);
  return add(base, [0, 0, focusZ]);
};
const RoadScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const L = lorzRoad(t);
  const cz = carZ(t, L.zK);
  const seat: V3 = [-0.5 - 0.14, CAR_DIM.seatY + 0.05, CAR_DIM.seatZ + cz];
  const climb = seg(t, T.menumpang - 0.2, T.menumpang + 0.5);
  return (
    <Stage shot={roadShot(t)} frame={frame}>
      <SunLights sun={[8, 9, 2]} />
      <RoadSet post={false} />
      <MilePost position={[1.55, 0, L.zK - 0.4]} rotation={-1.2} top="MIL 9" bottom="ST. LOUIS · 1904" />
      <MotorCar position={[-0.5, 0, cz]} />
      <ToyPerson f={f} seed={6} look={{ outfit: "casual", top: "#3b2818", bottom: "#2a1d12", skin: "#e6b28c", hairStyle: 0, hair: "#1b1411" }} pose="sit" position={[-0.5 + 0.14, CAR_DIM.seatY + 0.05, CAR_DIM.seatZ + cz]} heading={0} scale={0.8} />
      {L.state === "run" && <ToyPerson f={f} seed={4} look={LOOK.lorz} poseOverride={runPose(f, 4, 0.3)} position={[LORZ_X, 0, L.z]} heading={0} />}
      {L.state === "cramp" && <ToyPerson f={f} seed={4} look={LOOK.lorz} poseOverride={clutchCalf(f)} position={[LORZ_X, 0, L.z]} heading={-0.6} />}
      {L.state === "car" && (
        <ToyPerson f={f} seed={4} look={LOOK.lorz} poseOverride={sitWave(f, 4)} position={[lerp(LORZ_X, seat[0], climb), lerp(0, seat[1], climb), lerp(L.zK, seat[2], climb)]} heading={0} scale={lerp(1, 0.8, climb)} />
      )}
    </Stage>
  );
};
const RoadHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameCard t={t} a={T.lorz - 0.1} b={T.kram - 0.05} y={260} name="FRED LORZ" role="PELARI AMERIKA SERIKAT" />
    <Card t={t} a={T.kram} b={T.menumpang - 0.05} y={260} text="KRAM · MIL 9" size={78} />
    <Card t={t} a={T.menumpang} b={CUT.C2 + 0.1} y={260} text="NAIK MOBIL" sub="BERKILO-KILOMETER" size={84} tone="ink" />
    <DustHaze t={t} puffs={[[300, 1150, 240, 0.4], [120, 1050, 200, 0.35]]} vx={-40} />
  </>
);

// ================================================================= C2 — stadium finish, the fake champion
const TAPE_X = 2.0;
const lorzTrackX = (t: number) => lerp(-3.2, TAPE_X + 0.6, seg(t, CUT.C2, T.disambut + 0.6));
const finishShot = (t: number): Shot =>
  camAt([K(CUT.C2, [-0.6, 1.4, 6.2], [-0.8, 0.9, 0], 38), K(T.disambut, [1.1, 1.25, 3.8], [2.0, 1.0, 0], 34), K(T.difoto, [4.2, 1.45, 4.6], [3.0, 0.95, 0.0], 36), K(T.terbongkar, [4.0, 1.45, 4.9], [3.0, 0.95, 0.0], 37), K(CUT.D1, [4.4, 1.9, 6.6], [3.0, 1.0, 0.0], 40)], t, 0.02, 11);
const FinishScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const x = lorzTrackX(t);
  const broken = seg(t, T.disambut - 0.1, T.disambut + 0.5);
  const pose = t < T.disambut - 0.05 ? runPose(f, 4, 0) : t < T.difoto - 0.3 ? tapePose(f) : mixPose(tapePose(f), { ...tapePose(0), ls: [0, 0, 0.2], rs: [0, 0, -0.2], le: -0.2, re: -0.2 }, seg(t, T.difoto - 0.3, T.difoto));
  const cheer = t < T.bohong ? 1 : 0.2;
  return (
    <Stage shot={finishShot(t)} frame={frame}>
      <SunLights fogNear={18} fogFar={70} sun={[-4, 10, 6]} />
      <StadiumSet t={t} cheer={cheer} />
      <FinishTape x={TAPE_X} broken={broken} />
      <ToyPerson f={f} seed={4} look={LOOK.lorz} poseOverride={pose} position={[x, 0, 0.1]} heading={t < T.difoto - 0.3 ? Math.PI / 2 : Math.PI / 2 + lerp(0, 0.9, seg(t, T.difoto - 0.3, T.difoto))} />
      <ToyPerson f={f} seed={31} look={LOOK.alice} pose="stand" position={[TAPE_X + 1.15, 0, -0.3]} heading={-0.4} />
      <Hat position={[TAPE_X + 1.15, 0.97, -0.3]} />
      <BoxCamera position={[TAPE_X + 3.0, 0, 1.7]} rotation={-2.3} />
      <ToyPerson f={f} seed={33} look={{ outfit: "casual", top: "#2a2018", bottom: "#2a2018", skin: "#f3cfb3", hairStyle: 3 }} pose="stand" position={[TAPE_X + 3.45, 0, 2.15]} heading={-2.3} />
    </Stage>
  );
};
const FinishHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.disambut + 0.15} b={T.difoto - 0.05} y={260} text="DISAMBUT SEBAGAI JUARA" size={64} />
    <Card t={t} a={T.difoto + 0.2} b={T.bohong - 0.05} y={260} text="DIFOTO BERSAMA ALICE ROOSEVELT" sub="PUTRI PRESIDEN AS" size={56} />
    <Stamp t={t} a={T.terbongkar} b={T.larangan - 0.05} y={300} text="DISKUALIFIKASI" size={84} />
    <Stamp t={t} a={T.larangan} b={CUT.D1 + 0.1} y={300} text="LARANGAN SEUMUR HIDUP" size={70} />
    <Flash t={t} at={T.difoto + 0.05} dur={0.45} max={0.9} />
  </>
);

// ================================================================= D1 — trainer's table (close-up)
const tableShot = (t: number): Shot =>
  camAt([K(CUT.D1, [-0.45, 1.45, 2.7], [-0.15, 0.82, 0.5], 36), K(T.racun, [-0.45, 1.5, 2.8], [-0.3, 0.8, 0.5], 37), K(T.telur, [0.0, 1.48, 2.75], [0.05, 0.8, 0.5], 37), K(CUT.D2, [0.55, 1.42, 2.55], [0.4, 0.84, 0.45], 36)], t, 0.01, 13);
const TableScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const pour = seg(t, T.strychnine + 0.1, T.racun + 0.3) * (1 - seg(t, T.telur - 0.2, T.telur + 0.2));
  return (
    <Stage shot={tableShot(t)} frame={frame} exposure={0.95} lift={0}>
      <SunLights sun={[3, 7, 4]} fogNear={3} fogFar={22} />
      <spotLight position={[0.2, 3.2, 2.2]} target-position={[0, 0.9, 0.4]} angle={0.42} penumbra={0.6} intensity={22} distance={9} decay={1.5} color="#fff0cf" />
      <RoadSet post={false} />
      <MotorCar position={[1.8, 0, -4.5]} rotation={-0.8} />
      <group position={[0, -0.36, 0.4]} scale={1.5}>
        <TrainerTable t={t} pour={pour} crack={seg(t, T.telur - 0.1, T.telur + 0.1)} />
      </group>
    </Stage>
  );
};
const TableHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameCard t={t} a={T.hicks - 0.1} b={T.strychnine - 0.05} y={260} name="THOMAS HICKS" role="PELARI AMERIKA SERIKAT" />
    <Card t={t} a={T.strychnine} b={T.telur - 0.05} y={260} text="STRYCHNINE" sub="= RACUN TIKUS" size={84} tone="ink" />
    <Card t={t} a={T.telur} b={CUT.D2 + 0.1} y={260} text="+ PUTIH TELUR" sub="+ BRANDY" size={76} />
  </>
);

// ================================================================= D2 — Hicks held up to the finish (payoff)
const HICKS_V = 0.75;
const GATE_Z = -6 + (T.garis - CUT.D2) * HICKS_V + 0.35;
const hicksZ = (t: number) => -6 + Math.min(t - CUT.D2, T.garis - CUT.D2 + 0.9) * HICKS_V;
const hillShot = (t: number): Shot => {
  const z = hicksZ(t);
  const near = camAt([K(CUT.D2, [0.9, 1.05, 4.9], [-0.4, 0.32, 0], 38), K(T.dipapah, [0.7, 1.0, 4.5], [-0.4, 0.32, 0], 37), K(T.garis - 0.6, [0.6, 1.0, 4.4], [-0.4, 0.36, 0], 37), K(IMPACT, [0.5, 1.0, 3.9], [-0.4, 0.42, 0], 35), K(CUT.Ea, [1.1, 1.3, 5.4], [-0.4, 0.85, -0.5], 38)], t, 0.03 * (1 - seg(t, T.garis - 0.9, T.garis)), 15);
  return add(near, [0, 0, z]);
};
const HillScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const z = hicksZ(t);
  const sway = Math.sin(t * 2.3) * 0.12;
  const hicks = runPose(f * 0.55, 8, 0.95);
  const shuffle = mixPose(hicks, { ...hicks, body: [0.3, 0, sway * 0.8], head: [0.45, 0, sway] }, 0.6);
  return (
    <Stage shot={hillShot(t)} frame={frame}>
      <SunLights sun={[5, 10, 8]} />
      <HillRoadSet />
      <FinishGate z={GATE_Z} />
      <group position={[0, 0, GATE_Z - 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <FinishTape x={0} broken={seg(t, T.garis + 0.05, T.garis + 0.6)} />
      </group>
      <ToyPerson f={f} seed={8} look={LOOK.hicks} poseOverride={shuffle} position={[-0.18 + sway * 0.3, 0, z]} heading={sway * 0.4} />
      <ToyPerson f={f * 0.6} seed={9} look={LOOK.trainer} poseOverride={supportPose(f * 0.6, 1)} position={[-0.62, 0, z - 0.05]} heading={0.15} />
    </Stage>
  );
};
const HillHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <HeatHaze t={t} on={seg(t, T.halusinasi + 0.3, T.halusinasi + 1.0) * (1 - seg(t, T.garis, T.garis + 0.6))} />
    <Card t={t} a={T.halusinasi + 0.6} b={T.dipapah - 0.05} y={260} text="BERHALUSINASI" size={84} tone="ink" />
    <Card t={t} a={T.dipapah} b={IMPACT - 0.05} y={260} text="DIPAPAH SAMPAI FINIS" size={66} />
    <PocketWatch t={t} a={IMPACT + 0.1} b={CUT.Ea + 0.1} y={250} />
    <Card t={t} a={T.waktu + 1.4} b={CUT.Ea + 0.1} y={590} text="JUARA RESMI · OLIMPIADE 1904" size={46} tone="gold" />
    <Flash t={t} at={IMPACT} dur={0.5} max={0.85} />
    <DustHaze t={t} puffs={[[540, 1260, 300, 0.35], [200, 1180, 200, 0.3]]} />
  </>
);

// ================================================================= Ea — orchard: Carvajal's apple
const orchardShot = (t: number): Shot => {
  const a = lerp(-0.75, 0.85, seg(t, CUT.Ea, CUT.Eb));
  const r = lerp(3.9, 3.4, seg(t, CUT.Ea, CUT.Eb));
  return { pos: [0.3 + Math.sin(a) * r, 1.15, 0.6 + Math.cos(a) * r], target: [0.3, 0.42, 0.1], fov: 38 };
};
const OrchardScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const eatAt = T.apel + 0.6;
  const runAt = T.keempat - 0.2;
  let pose = reachPose(f);
  if (t >= eatAt) pose = mixPose(reachPose(f), eatPose(f), seg(t, eatAt, eatAt + 0.3));
  if (t >= T.kramPerut) pose = mixPose(eatPose(f), bellyPose(f), seg(t, T.kramPerut, T.kramPerut + 0.3));
  if (t >= runAt) pose = runPose(f, 5, 0.2);
  const heading = t < eatAt ? Math.PI : lerp(Math.PI, 0.4, seg(t, eatAt, eatAt + 0.5));
  const x = 0.35 + Math.max(0, t - runAt) * 1.5;
  return (
    <Stage shot={orchardShot(t)} frame={frame}>
      <SunLights sun={[-5, 10, 5]} />
      <OrchardSet />
      <ToyPerson f={f} seed={5} look={LOOK.carvajal} poseOverride={pose} position={[x, 0, 0.45]} heading={t >= runAt ? Math.PI / 2 : heading} />
      {t < T.apel + 0.3 && <Apple position={[0.38, 2.1, 0.05]} />}
      {t >= eatAt && t < T.kramPerut + 0.2 && <Apple position={[0.48, 0.86, 0.62]} bitten />}
    </Stage>
  );
};
const OrchardHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameCard t={t} a={T.kuba - 0.1} b={T.kramPerut - 0.05} y={260} name="FÉLIX CARVAJAL" role="TUKANG POS · KUBA" />
    <Card t={t} a={T.kramPerut} b={T.keempat - 0.05} y={260} text="APEL · KRAM PERUT" size={72} />
    <Card t={t} a={T.keempat} b={CUT.Eb + 0.1} y={260} text="TETAP FINIS KE-4" size={84} tone="gold" />
  </>
);

// ================================================================= Eb — cornfield: the dog chase
const chaseP = (t: number, lag = 0): V3 => {
  const u = clamp((t - lag - CUT.Eb) / (CUT.Ec - CUT.Eb + 0.3));
  return [lerp(3.2, -1.4, u), 0, lerp(2.6, -2.4, u)];
};
const fieldShot = (t: number): Shot => {
  const p = chaseP(t);
  return camAt([K(CUT.Eb, [p[0] + 4.2, 3.4, p[2] + 4.6], p.map((v, i) => v + (i === 1 ? 0.6 : 0)) as V3, 40), K(CUT.Ec, [p[0] + 3.6, 2.9, p[2] + 4.2], p.map((v, i) => v + (i === 1 ? 0.6 : 0)) as V3, 40)], t, 0.03, 17);
};
const FieldScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const p = chaseP(t);
  const d = chaseP(t, 0.55);
  const hop = Math.abs(Math.sin(t * 11)) * 0.08;
  const heading = Math.atan2(-4.6, -5.0);
  return (
    <Stage shot={fieldShot(t)} frame={frame}>
      <SunLights sun={[6, 10, 6]} />
      <CornField />
      <ToyPerson f={f} seed={14} look={LOOK.taunyane} poseOverride={runPose(f * 1.3, 14, 0)} position={p} heading={heading} />
      <group position={[d[0], hop, d[2]]} rotation={[0, heading, 0]}>
        <Glb id="farm-dog-723730" height={0.5} />
      </group>
    </Stage>
  );
};
const FieldHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameCard t={t} a={T.taunyane - 0.1} b={CUT.Ec + 0.1} y={260} name="LEN TAUNYANE" role="AFRIKA SELATAN" />
    <Card t={t} a={T.anjing} b={CUT.Ec + 0.1} y={500} text="DIKEJAR ANJING · KELUAR JALUR" size={50} tone="ink" />
  </>
);

// ================================================================= Ec — chalkboard 32 → 14
const boardShot = (t: number): Shot => camAt([K(CUT.Ec, [0.5, 1.5, 6.0], [0, 1.2, 0], 46), K(CUT.OUT, [0.1, 1.35, 4.7], [0, 1.18, 0], 46)], t, 0.015, 19);
const BoardScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <Stage shot={boardShot(t)} frame={frame}>
    <SunLights sun={[4, 9, 7]} fogNear={6} fogFar={40} />
    <HillRoadSet />
    <ChalkBoard crossed={Math.round(18 * seg(t, T.dari + 0.4, T.empatBelas))} showFinish={t >= T.empatBelas} />
  </Stage>
);
const BoardHud: React.FC<{ t: number }> = ({ t }) => <Card t={t} a={T.empatBelas + 0.1} b={CUT.OUT + 0.1} y={260} text="32 START · 14 FINIS" size={76} tone="gold" />;

// ================================================================= OUT — press room, THE AUDIRA GAZETTE
const pressShot = (t: number): Shot => camAt([K(CUT.OUT, [0.05, 1.45, 1.95], [0, 0.98, 0], 46), K(T.berikutnya, [0.15, 1.5, 2.3], [0, 1.0, 0], 46), K(88.2, [0.35, 1.65, 3.0], [0, 1.0, 0], 46)], t, 0.012, 21);
const PressScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const k = seg(t, CUT.OUT + 0.05, CUT.OUT + 0.95);
  const spin = (1 - k) * Math.PI * 4;
  const flicker = 0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <Stage shot={pressShot(t)} frame={frame} bg="#2a1d12" exposure={0.95} lift={0} pool={false}>
      <LampLights lamp={[0.82, 1.32, -0.25]} flicker={flicker} />
      <PressRoom />
      <group position={[0, 1.02, 0.12]} rotation={[-0.32, 0, spin]} scale={Math.max(0.02, k)}>
        <Sign w={0.6} h={0.84} position={[0, 0, 0]} dep="gazette" draw={paintPaper} px={900} />
      </group>
    </Stage>
  );
};
const PressHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Card t={t} a={T.diringankan} b={T.boston - 0.05} y={260} text="HUKUMAN DIRINGANKAN" size={64} />
    <Teaser t={t} a={T.berikutnya} b={88.5} y={250} />
  </>
);

// ================================================================= captions + film
const KEY = /^(lorz|hicks|audira|strychnine|carvajal|taunyane|juara|racun|mobil|apel|anjing|empat|tiga|dua|satu|tujuh|sebelas|boston)/i;
const CAP: CapWord[] = CLIPS.flatMap((c) => c.words.map((w) => ({ w: w.w, t: w.s, e: w.e, key: KEY.test(w.w) })));

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const sc = sceneAt(t);
  return (
    <AbsoluteFill style={{ background: "#e9d6ae" }}>
      {sc === "A" && <HookScene t={t} frame={frame} />}
      {sc === "B1" && <StartScene t={t} frame={frame} />}
      {sc === "B2" && <PumpScene t={t} frame={frame} />}
      {sc === "C1" && <RoadScene t={t} frame={frame} />}
      {sc === "C2" && <FinishScene t={t} frame={frame} />}
      {sc === "D1" && <TableScene t={t} frame={frame} />}
      {sc === "D2" && <HillScene t={t} frame={frame} />}
      {sc === "Ea" && <OrchardScene t={t} frame={frame} />}
      {sc === "Eb" && <FieldScene t={t} frame={frame} />}
      {sc === "Ec" && <BoardScene t={t} frame={frame} />}
      {sc === "OUT" && <PressScene t={t} frame={frame} />}
      <Frame width={width} height={height}>
        {sc === "A" && <HookHud t={t} />}
        {sc === "B1" && <StartHud t={t} />}
        {sc === "B2" && <PumpHud t={t} />}
        {sc === "C1" && <RoadHud t={t} />}
        {sc === "C2" && <FinishHud t={t} />}
        {sc === "D1" && <TableHud t={t} />}
        {sc === "D2" && <HillHud t={t} />}
        {sc === "Ea" && <OrchardHud t={t} />}
        {sc === "Eb" && <FieldHud t={t} />}
        {sc === "Ec" && <BoardHud t={t} />}
        {sc === "OUT" && <PressHud t={t} />}
        <Captions t={t} words={CAP} end={T.ikuti + 1.0} />
        <DustWipe t={t} cuts={CUTS} />
      </Frame>
      <Audio src={staticFile("audio/ep02/vo.wav")} />
    </AbsoluteFill>
  );
};
void THREE;
