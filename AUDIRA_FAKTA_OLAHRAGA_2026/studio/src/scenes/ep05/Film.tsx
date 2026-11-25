// EP05 — Rumble in the Jungle 1974 (CHRONICLE). Multi-scene director, every cut on the locked VO (timing.ts).
// A hook (= cover KO frame) → B1 map flight to Kinshasa → B2 face-off stage → C1 night training camp (cut eye,
// postponement) → C2 Stade du 20 Mai before dawn ("Ali, bomaye!") → D rope-a-dope on the ropes → E1 round 8 KO
// (low angle) → E2 dawn + rainstorm → OUT score card + next-episode teaser (AUDIRA outro card from Root.signed).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "./chronicle/ShotCanvas.tsx";
import { chronicleFontsReady } from "./chronicle/fonts.ts";
import { Captions, Cite, DateStamp, Frame, MapPin, NameTag, RouteLine, AMBER, CRIMSON, type Word as CapWord } from "./chronicle/Overlay.tsx";
import { camAt, handheld, project, type CamKey, type Shot, type V3 } from "./chronicle/cam.ts";
import { mixLook, type Look } from "./chronicle/Stage.tsx";
import { INK, NIGHT } from "./chronicle/looks.ts";
import { Figure, gait, idle } from "./chronicle/Figure.tsx";
import { Bolt } from "./chronicle/fx.tsx";
import { BOX, FLOOR, PREDAWN, Ring, Stadium } from "./RingSet.tsx";
import { Title } from "./Cover.tsx";
import { BOX2, BOXER_LOOK, CAMP, CampSet, Dish, FACEOFF, FaceOffSet, LightPool, MapSet, Rain, mixPose, mapPoint, flight, routePts } from "./sets.tsx";
import { BigValue, Calendar, Chip, Count, EnergyBar, Flash, InkCut, Record, RedPulse, ScoreCard, Stamp, Teaser } from "./hud.tsx";
import { CLIPS, CUT, T, clamp, lerp, seg } from "./timing.ts";
import { MAPROOM } from "./chronicle/looks.ts";

const F = FLOOR;
type SceneId = "A" | "B1" | "B2" | "C1" | "C2" | "D" | "E1" | "E2" | "OUT";
const sceneAt = (t: number): SceneId =>
  t < CUT.map ? "A" : t < CUT.faceoff ? "B1" : t < CUT.camp ? "B2" : t < CUT.stadium ? "C1" : t < CUT.ropes ? "C2" : t < CUT.ko ? "D" : t < CUT.dawn ? "E1" : t < CUT.out ? "E2" : "OUT";

const K = (t: number, pos: V3, target: V3, fov = 44, hold = false): CamKey => ({ t, pos, target, fov, hold });

// ================================================================= looks
// D: high angle onto the canvas under a cold blue-white key (reads as a different set from the night wides)
const ROPES_LOOK: Look = { ...mixLook(PREDAWN, NIGHT, 0.5), key: { ...PREDAWN.key, pos: [-6, 22, 6], color: "#ffd2a0", intensity: 3.0 }, exposure: 1.1, grade: { ...PREDAWN.grade, shadow: "#1a1426", high: "#ffc07a", amount: 0.24, vignette: 0.55 } };
// E1: flashbulb heat: warm amber haze, no stars, bright canvas
const KO_LOOK: Look = {
  ...PREDAWN, exposure: 1.35, key: { ...PREDAWN.key, color: "#ffd9a0", intensity: 4.4 }, hemi: { sky: "#a07a5a", ground: "#2a1a12", intensity: 0.85 },
  fog: { color: "#54443e", density: 0.016 }, sky: { ...PREDAWN.sky, zenith: "#2a1c22", horizon: "#b07a52", stars: 0, glow: 0.9 },
  bloom: { strength: 0.45, radius: 0.6, threshold: 0.7 }, grade: { ...PREDAWN.grade, shadow: "#2a1410", high: "#ffcf8a", amount: 0.2, contrast: 0.3 },
  outline: { width: 1, halo: 0.45, gain: 2.2 },
};
// C2: crowd under floodlight haze, blue-teal air
const STADIUM_LOOK: Look = { ...PREDAWN, exposure: 1.2, key: { ...PREDAWN.key, pos: [5, 14, -7], color: "#ffc58a", intensity: 3.4 }, fog: { color: "#3c5076", density: 0.02 }, sky: { ...PREDAWN.sky, horizon: "#5a7496", glow: 0.8 }, hemi: { ...PREDAWN.hemi, intensity: 0.75 } };
const STORM_DAWN: Look = {
  key: { pos: [10, 9, -60], color: "#ffb27a", intensity: 1.7, shadow: { box: 14, at: [0, F, 0], far: 120, bias: -0.0005 } },
  hemi: { sky: "#7a88a8", ground: "#1a1616", intensity: 0.72 },
  fill: { pos: [6, 6, 26], color: "#8090b0", intensity: 0.3 },
  fog: { color: "#4e5466", density: 0.016 },
  sky: { zenith: "#26314c", horizon: "#e09a6a", ground: "#1c1c22", sunDir: [0.15, 0.06, -1], sunColor: "#ffb070", sunSize: 0.22, glow: 0.85, stars: 0 },
  exposure: 1.02,
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.8 },
  grade: { shadow: "#1c2436", high: "#ffc08a", amount: 0.14, contrast: 0.2, vignette: 0.42, grain: 0.026 },
  outline: { width: 1, halo: 0.3, gain: 1.6 },
};

// ================================================================= A — hook (cover frame → slow dolly back)
const HookScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const keys = [
    K(0, [0.2, F + 1.0, 3.0], [0.2, F + 1.13, -2.0], 67),
    K(4.2, [-0.5, F + 1.0, 3.1], [0.3, F + 1.13, -2.0], 66),
    K(CUT.map, [-1.2, F + 0.98, 3.1], [0.35, F + 1.12, -2.05], 65),
  ];
  const shot = handheld(camAt(keys, t), t, { hits: [T.subuh], hit: 0.02, seed: 5 });
  const tf = 2 + t; // the cover renders its figures at t = 2
  // unbeaten Foreman stands in guard while the VO reads his 40–0 record; the KO lands on "subuh"
  const ko = seg(t, T.subuh - 0.3, T.subuh + 0.35);
  const aliPose = mixPose(idle(BOX.guard(), tf, 1, 0.8), BOX.heldPunch(), seg(t, T.subuh - 0.55, T.subuh - 0.25));
  const fPose = mixPose(idle(BOX.guard(), tf, 2, 0.8), BOX.fall(), ko);
  const topple = (-0.55 - 0.2 * seg(t, 0, CUT.map)) * ko;
  return (
    <ShotCanvas shot={shot} look={PREDAWN} frame={frame}>
      <Stadium t={tf} cheer={1} />
      <Ring />
      <Figure id={1} outline={INK.hero} pos={[1.05, F, -2.0]} rotY={-1.3} pose={idle(aliPose, tf, 1, 0.5)} look={BOXER_LOOK} t={tf} />
      <group position={[0.1, F, -2.1]} rotation={[0, 1.45, 0]}>
        <group rotation={[topple, 0, topple * 0.35]}>
          <Figure id={2} outline={INK.foe} pos={[0, 0, 0]} pose={fPose} look={{ ...BOXER_LOOK, scale: 1.16 }} t={tf} />
        </group>
      </group>
    </ShotCanvas>
  );
};
const HookHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t < 2.6 && <div style={{ opacity: 1 - seg(t, 2.1, 2.6) }}><Title chip="40 LAGA · 40 MENANG" chipColor={AMBER} /></div>}
    <Record t={t} a={2.5} crack={T.subuh} b={CUT.map - 0.05} y={250} />
    <Flash t={t} at={0.02} dur={0.4} max={0.5} />
    <Flash t={t} at={T.subuh} dur={0.3} max={0.35} />
  </>
);

// ================================================================= B1 — map: flight to Kinshasa
const mapProgress = (t: number) => lerp(0.3, 0.97, seg(t, CUT.map, CUT.faceoff - 0.5));
const mapShot = (t: number): Shot => {
  const k = mapPoint(15.3, -4.3), mid = mapPoint(-30, 18);
  const z = seg(t, CUT.map, CUT.faceoff);
  const tg: V3 = [lerp(mid[0], k[0] - 3, z), 0, lerp(mid[2], k[2] - 1.5, z)];
  const back = lerp(118, 72, z), up = lerp(150, 92, z);
  const pos: V3 = [tg[0] + 0.892 * back, up, tg[2] + 0.451 * back];
  return handheld({ pos, target: tg, fov: 42 }, t, { seed: 9, drift: 0.003 });
};
const MapScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <ShotCanvas shot={mapShot(t)} look={MAPROOM} frame={frame}>
    <MapSet progress={mapProgress(t)} yawOffset={0} />
  </ShotCanvas>
);
const MapHud: React.FC<{ t: number; aspect: number }> = ({ t, aspect }) => {
  const shot = mapShot(t);
  const P = (p: V3) => project(shot, aspect, p);
  const k = P(mapPoint(15.3, -4.3));
  const us = P(mapPoint(-74, 40.7));
  const pts = routePts(30).map((p) => P([p[0], 0, p[2]]));
  return (
    <>
      {/* route stays below the date title (no line through "30 OKT 1974") */}
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(500px 0 0 0)" }}><RouteLine pts={pts} progress={mapProgress(t)} dash width={7} opacity={0.9} /></div>
      {us.vis && <MapPin s={t} a={CUT.map} x={us.x} y={us.y} name="AMERIKA SERIKAT" side="r" color={CRIMSON} />}
      {k.vis && <MapPin s={t} a={T.kinshasa + 0.2} x={k.x} y={k.y} name="KINSHASA, ZAIRE" sub="kini RD Kongo" side="r" pulse={1} />}
      <DateStamp s={t} a={T.tanggal} b={CUT.faceoff + 0.05} top="KINSHASA · ZAIRE" big="30 OKT 1974" y={250} />
    </>
  );
};

// ================================================================= B2 — face-off stage
const faceShot = (t: number): Shot => {
  const keys = [
    K(CUT.faceoff, [0.1, 1.55, 7.0], [-1.05, 0.89, 0], 42),
    K(T.ali - 0.4, [-0.3, 1.55, 6.9], [-0.95, 0.89, 0], 42),
    K(T.ali + 0.5, [0.4, 1.55, 7.0], [0.95, 0.89, 0], 42),
    K(T.bursa - 0.3, [0.6, 1.55, 6.8], [0.95, 0.89, 0], 41),
    K(T.bursa + 1.2, [0, 1.7, 6.3], [0, 0.92, 0], 44),
    K(CUT.camp, [0, 1.8, 7.0], [0, 0.92, 0], 44),
  ];
  return handheld(camAt(keys, t), t, { seed: 11 });
};
const FaceOffScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const fPose = idle(BOX.guard(), t, 2, 1.2);
  const aPose = idle(t > T.bursa ? mixPose(BOX.guard(), BOX2.victory(), 0.25 + 0.15 * Math.sin(t * 3)) : BOX.guard(), t, 4, 1.6);
  return (
    <ShotCanvas shot={faceShot(t)} look={FACEOFF} frame={frame}>
      <FaceOffSet t={t} foreman={fPose} ali={aPose} gap={1.0} />
    </ShotCanvas>
  );
};
const FaceOffHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <NameTag s={t} a={T.foreman} b={T.ali - 0.15} name="GEORGE FOREMAN" role="25 tahun · juara dunia kelas berat" y={260} />
    <Chip t={t} a={T.juara} b={T.ali - 0.15} text="JUARA DUNIA · 40–0" color={CRIMSON} y={420} />
    <NameTag s={t} a={T.ali} b={T.bursa - 0.15} name="MUHAMMAD ALI" role="32 tahun · penantang" y={260} />
    <Chip t={t} a={T.dicabut} b={T.bursa - 0.15} text="GELAR DICABUT · 7 TAHUN LALU" y={420} />
    <BigValue t={t} a={T.bursa} b={CUT.camp + 0.05} label="BURSA TARUHAN" value="4 : 1" note="Foreman diunggulkan" y={250} size={200} />
    <Cite s={t} a={T.empatBanding} b={CUT.camp + 0.05} text="Ali tak dijagokan, 4 banding 1" src="The New York Times · 30 Okt 1974" y={600} />
  </>
);

// ================================================================= C1 — night training camp
const punchCycle = (t: number, period: number) => {
  const ph = ((t / period) % 3 + 3) % 3;
  const i = Math.floor(ph), u = ph - i;
  const hit = Math.sin(Math.PI * Math.min(1, u * 1.6));
  const strike = i === 0 ? BOX2.jabL() : i === 1 ? BOX2.jabR() : BOX.hook();
  return mixPose(BOX.guard(), strike, hit);
};
const CampScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const keys = [K(CUT.camp, [3.9, 2.1, 5.9], [0.15, 1.18, -0.6], 42), K(T.robek, [2.8, 1.95, 4.6], [0.0, 1.18, -0.6], 39), K(CUT.stadium, [2.4, 1.9, 4.1], [-0.1, 1.18, -0.6], 38)];
  const shot = handheld(camAt(keys, t), t, { hits: [T.robek], hit: 0.03, seed: 13 });
  const cut = seg(t, T.robek, T.robek + 0.25);
  const fPose = cut > 0 ? mixPose(punchCycle(t, 0.5), BOX2.wobble(), cut * (1 - seg(t, T.robek + 0.9, T.robek + 1.4) * 0.6)) : punchCycle(t, 0.5);
  const pPose = t > T.robek - 0.22 && t < T.robek + 0.3 ? mixPose(BOX.guard(), BOX2.jabR(), Math.sin(Math.PI * clamp((t - (T.robek - 0.22)) / 0.5))) : idle(BOX.guard(), t, 7, 1.4);
  return (
    <ShotCanvas shot={shot} look={CAMP} frame={frame}>
      <CampSet t={t} foreman={fPose} partner={pPose} />
    </ShotCanvas>
  );
};
const CampHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Calendar t={t} a={CUT.camp + 0.05} flip={T.sebulan} b={T.mata - 0.05} y={250} />
    <Chip t={t} a={T.sebulan} b={T.mata - 0.05} text="DITUNDA > 1 BULAN" y={1440} />
    <Chip t={t} a={T.mata} b={CUT.stadium + 0.05} text="MATA FOREMAN ROBEK SAAT SPARING" color={CRIMSON} y={260} />
    <RedPulse t={t} at={T.robek} />
  </>
);

// ================================================================= C2 — Stade du 20 Mai before dawn
const stadiumShot = (t: number): Shot => {
  const keys = [
    // inside the crowd's eye line, close enough that the boxers fill ~45% of the height; floor canvas fills the bottom
    K(CUT.stadium, [-3.2, F + 5.6, -11.5], [0, F + 1.2, 1.5], 48),
    K(T.tayang + 0.8, [-2.0, F + 3.4, -8.6], [0.05, F + 0.95, 0.8], 46),
    K(T.hampir, [-0.6, F + 1.5, -6.2], [0, F + 0.78, 0.3], 44),
    K(T.bomaye, [0.5, F + 1.45, -6.1], [0, F + 0.8, 0.3], 44),
    K(CUT.ropes, [1.2, F + 1.45, -6.0], [0, F + 0.82, 0.3], 43),
  ];
  return handheld(camAt(keys, t), t, { hits: [T.bomaye, T.bunuh], hit: 0.008, seed: 17 });
};
const StadiumScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const cheer = t > T.meneriakkan ? (Math.sin(t * 7) > -0.3 ? 1 : 0.6) : 0.6;
  return (
    <ShotCanvas shot={stadiumShot(t)} look={STADIUM_LOOK} frame={frame}>
      <Stadium t={t} cheer={cheer} />
      <group rotation={[0, Math.PI, 0]}><Stadium t={t + 3} cheer={cheer} /></group>
      <Ring />
      <Dish pos={[-5.6, 0, 5.2]} rotY={2.4} height={3.2} />
      {/* floodlight pool on the canvas + crimson rim behind Foreman, amber behind Ali */}
      <group position={[0, F, 0.6]}><LightPool r={2.1} strength={0.3} /></group>
      <pointLight position={[-2.2, F + 2.6, 2.2]} color="#d8432f" intensity={26} distance={9} decay={1.6} />
      <pointLight position={[2.2, F + 2.6, 2.2]} color="#ffb547" intensity={22} distance={9} decay={1.6} />
      <Figure id={1} outline={INK.hero} pos={[0.72, F, 0.4]} rotY={-1.6} pose={idle(BOX.guard(), t, 1, 1.8)} look={BOXER_LOOK} t={t} />
      <Figure id={2} outline={INK.foe} pos={[-0.72, F, 0.2]} rotY={1.5} pose={idle(BOX.guard(), t, 2, 1.2)} look={{ ...BOXER_LOOK, scale: 1.16 }} t={t} />
    </ShotCanvas>
  );
};
const fmtN = (n: number) => Math.round(n).toLocaleString("id-ID");
const StadiumHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <BigValue t={t} a={T.jamEmpat} b={T.hampir - 0.1} label="WAKTU KINSHASA" value="04.00" note="dini hari, menjelang subuh" y={250} />
    <Chip t={t} a={T.tayang} b={T.hampir - 0.1} text="TAYANG PRIME TIME DI AS · SATELIT" y={600} />
    <BigValue t={t} a={T.hampir} b={T.bomaye - 0.1} label="PERKIRAAN PENONTON STADION" value={`${fmtN(60000 * seg(t, T.hampir, T.hampir + 1.1))}`} y={250} />
    <Stamp t={t} a={T.bomaye} b={CUT.ropes + 0.05} text="“ALI, BOMAYE!”" sub={t > T.bunuh ? "ARTINYA: “ALI, BUNUH DIA!”" : undefined} color={AMBER} y={280} size={140} />
  </>
);

// ================================================================= D — rope-a-dope
const energy = (t: number) => 1 - 0.8 * seg(t, T.memukul, T.menguras + 1.4);
const RopesScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const period = lerp(0.48, 0.8, 1 - energy(t));
  const fPose = t > T.memukul - 1.2 ? punchCycle(t, period) : idle(BOX.guard(), t, 2, 1);
  const hitK = Math.max(0, Math.sin(((t / period) % 1) * Math.PI));
  const aPose = mixPose(BOX.ropes(), { ...BOX.ropes(), lean: -0.55, head: [-0.4, 0.15] }, t > T.memukul - 1.2 ? hitK * 0.6 : 0);
  const keys = [
    K(CUT.ropes, [1.4, F + 3.9, 3.0], [-2.2, F + 0.62, -1.0], 50),
    K(T.ronde, [0.9, F + 3.7, 2.7], [-2.3, F + 0.64, -1.0], 48),
    K(T.ropeADope, [0.5, F + 3.5, 2.5], [-2.35, F + 0.68, -1.0], 47),
    K(CUT.ko, [0.3, F + 3.4, 2.4], [-2.4, F + 0.68, -1.0], 46),
  ];
  const hits = Array.from({ length: 18 }, (_, i) => T.memukul + i * 0.65).filter((x) => x < CUT.ko);
  const shot = handheld(camAt(keys, t), t, { hits, hit: 0.006, seed: 19 });
  return (
    <ShotCanvas shot={shot} look={ROPES_LOOK} frame={frame}>
      <Stadium t={t} cheer={0.4} />
      <Ring />
      <Figure id={1} outline={INK.hero} pos={[-2.75, F, -0.7]} rotY={1.5} pose={aPose} look={BOXER_LOOK} t={t} />
      <Figure id={2} outline={INK.foe} pos={[-1.85, F, -1.35]} rotY={-1.35} pose={fPose} look={{ ...BOXER_LOOK, scale: 1.16 }} t={t} />
    </ShotCanvas>
  );
};
const roundAt = (t: number) => (t < T.ronde ? 2 : Math.min(7, 2 + Math.floor((t - T.ronde) / 1.25) + 1));
const RopesHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Chip t={t} a={T.kendur} b={T.ronde} text="BERSANDAR DI TALI YANG KENDUR" y={470} />
    <EnergyBar t={t} a={T.bersandar} b={CUT.ko} level={energy(t)} bar={seg(t, T.memukul - 0.3, T.memukul)} tag={`RONDE ${roundAt(t)}`} y={292} />
    <Stamp t={t} a={T.ropeADope} b={CUT.ko + 0.05} text="ROPE-A-DOPE" sub="JEBAKAN ALI" color={AMBER} y={470} size={124} />
  </>
);

// ================================================================= E1 — round 8 KO (low angle)
const comboStart = T.rentetan, comboEnd = T.roboh - 0.35;
const KOScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  // Ali
  let aPose = idle(BOX.guard(), t, 1, 1.2);
  if (t >= comboStart && t < comboEnd) {
    const i = Math.floor((t - comboStart) / 0.3), u = ((t - comboStart) / 0.3) % 1;
    aPose = mixPose(BOX.guard(), i % 2 ? BOX2.jabL() : BOX2.jabR(), Math.sin(Math.PI * u));
  } else if (t >= comboEnd) aPose = mixPose(BOX2.jabR(), BOX.heldPunch(), seg(t, comboEnd, T.roboh + 0.3));
  if (t > T.wasit + 2.2) aPose = mixPose(aPose, BOX2.victory(), seg(t, T.wasit + 2.2, T.wasit + 2.8));
  // Foreman
  let fPose = idle(BOX.guard(), t, 2, 1);
  if (t >= T.limbung) fPose = mixPose(fPose, BOX2.wobble(), seg(t, T.limbung, T.limbung + 0.5) * (0.7 + 0.3 * Math.sin(t * 5)));
  const fall = seg(t, T.roboh - 0.25, T.roboh + 0.45);
  if (fall > 0) fPose = mixPose(fPose, BOX.fall(), fall);
  const topple = -1.42 * fall;
  const aliWalk = seg(t, T.roboh + 0.6, T.roboh + 2.2);
  const aliPos: V3 = [lerp(0.9, 0.55, aliWalk), F, lerp(-1.2, -3.4, aliWalk)];
  const aliRot = aliWalk > 0 && aliWalk < 1 ? lerp(-1.45, -3.0, Math.min(1, aliWalk * 3)) : aliWalk >= 1 ? -0.4 : -1.45;
  // referee count
  const cnt = t >= T.wasit + 0.1 ? ((t - (T.wasit + 0.1)) / 0.155) % 1 : 0;
  const rPose = t >= T.wasit ? BOX2.count(Math.sin(Math.PI * cnt)) : idle(BOX.guard(), t, 6, 0.4);
  const keys = [
    K(CUT.ko, [2.4, F + 0.45, 2.95], [0.25, F + 1.25, -1.40], 50),
    K(T.roboh - 0.85, [2.0, F + 0.5, 2.7], [0.2, F + 1.2, -1.40], 48, true),
    K(T.roboh - 0.05, [1.95, F + 0.5, 2.65], [0.2, F + 1.18, -1.40], 47, true),
    K(T.roboh + 0.35, [1.2, F + 0.8, 3.0], [-0.1, F + 0.85, -1.60], 50),
    K(T.wasit + 0.6, [-0.3, F + 0.95, 1.4], [-0.6, F + 0.45, -2.00], 58),
    K(CUT.dawn, [-0.35, F + 1.0, 1.5], [-0.6, F + 0.5, -2.10], 58),
  ];
  const hits = [...Array.from({ length: 6 }, (_, i) => comboStart + 0.15 + i * 0.3).filter((x) => x < comboEnd)];
  const shot = handheld(handheld(camAt(keys, t), t, { hits, hit: 0.007, seed: 23 }), t, { hits: [T.roboh + 0.2], hit: 0.035, seed: 29, drift: 0 });
  return (
    <ShotCanvas shot={shot} look={KO_LOOK} frame={frame}>
      <Stadium t={t} cheer={t > T.roboh ? 1 : 0.5} />
      <Ring />
      <Figure id={1} outline={INK.hero} pos={aliPos} rotY={aliRot} pose={aliWalk > 0 && aliWalk < 1 ? gait(t * 7, 0.2, aPose) : aPose} look={BOXER_LOOK} t={t} />
      <group position={[-0.3, F, -1.35]} rotation={[0, 1.45, 0]}>
        <group rotation={[topple, 0, topple * 0.2]}>
          <Figure id={2} outline={INK.foe} pos={[0, 0, 0]} pose={fPose} look={{ ...BOXER_LOOK, scale: 1.16 }} t={t} />
        </group>
      </group>
      {fall > 0 && <group position={[-0.9, F, -1.5]}><LightPool r={1.5} strength={0.42 * fall} /></group>}
      {fall > 0 && <pointLight position={[-0.9, F + 1.6, -0.6]} color="#d8432f" intensity={18 * fall} distance={5} decay={1.6} />}
      <Figure id={3} outline={INK.neutral} pos={[-1.5, F, -2.7]} rotY={0.5} pose={rPose} look={{ scale: 1.05 }} t={t} />
    </ShotCanvas>
  );
};
const KOHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <BigValue t={t} a={T.ronde8} b={T.rentetan - 0.1} label="KINSHASA · 30 OKT 1974" value="RONDE 8" y={250} size={170} />
    <Stamp t={t} a={T.roboh} b={T.wasit - 0.05} text="KO!" color={CRIMSON} y={260} size={230} />
    <Count t={t} a={T.wasit + 0.1} b={T.duaMenit - 0.3} end={T.duaMenit - 0.05} y={250} />
    <BigValue t={t} a={T.duaMenit} b={CUT.dawn + 0.05} label="RONDE 8 · KO DI DETIK" value="2:58" color={AMBER} y={250} size={210} />
    <Flash t={t} at={T.roboh} dur={0.45} max={0.8} />
  </>
);

// ================================================================= E2 / OUT — dawn and the storm
const dawnK = (t: number) => seg(t, T.fajar - 0.6, T.fajar + 1.2);
const DawnScene: React.FC<{ t: number; frame: number; out?: boolean }> = ({ t, frame, out }) => {
  const look = mixLook(PREDAWN, STORM_DAWN, dawnK(t));
  const keys = out
    ? [K(CUT.out, [0.5, 6.5, 17.0], [0, 0.2, -4], 58), K(81.6, [1.0, 7.2, 19.0], [0, 0.3, -4], 56)]
    : [K(CUT.dawn, [0.4, F + 0.35, 3.0], [0, F + 0.85, -2.4], 56), K(T.badai, [0.35, F + 0.4, 2.8], [0, F + 0.9, -2.4], 56), K(T.badai + 1.0, [0.4, F + 1.6, 3.6], [0, F + 0.8, -2.4], 56), K(CUT.out, [0.5, 6.5, 17.0], [0, 0.2, -4], 58)];
  const shot = handheld(camAt(keys, t), t, { seed: 31, hits: [T.badai + 0.35], hit: 0.006 });
  const rain = seg(t, T.badai - 0.2, T.badai + 0.8);
  const strike = Math.max(0, 1 - Math.abs(t - (T.badai + 0.35)) / 0.12);
  const strike2 = Math.max(0, 1 - Math.abs(t - 77.8) / 0.12);
  return (
    <ShotCanvas shot={shot} look={look} frame={frame}>
      <Stadium t={t} cheer={1} />
      <group rotation={[0, Math.PI, 0]}><Stadium t={t + 3} cheer={1} /></group>
      <Ring />
      <Figure id={1} outline={INK.hero} pos={[0, F, -2.4]} rotY={0.15} pose={idle(BOX2.victory(), t, 3, 1.5)} look={BOXER_LOOK} t={t} />
      <Rain t={t} on={rain} center={[shot.target[0], -1, shot.target[2] * 0.4]} size={[30, 16, 30]} />
      <Bolt a={[-30, 60, -90]} b={[-22, 8, -80]} seed={3} on={strike} width={0.6} />
      <Bolt a={[34, 60, -95]} b={[28, 10, -85]} seed={7} on={strike2} width={0.6} />
    </ShotCanvas>
  );
};
const DawnHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Chip t={t} a={T.fajar} b={CUT.out + 0.05} text={t > T.badai ? "LALU BADAI HUJAN MENGGUYUR" : "FAJAR MENYINGSING"} y={260} />
    <Flash t={t} at={T.badai + 0.33} dur={0.25} max={0.4} color="#dfe6ff" />
  </>
);
const OutHud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <ScoreCard t={t} a={CUT.out} b={T.episode - 0.1} y={300} />
    <Teaser t={t} a={T.episode} b={81.5} y={320} />
    <Flash t={t} at={77.78} dur={0.25} max={0.3} color="#dfe6ff" />
  </>
);

// ================================================================= captions (VO words)
const KEYS = /^(ali|foreman|ko|rope-a-dope|audira|bomaye|kinshasa|delapan|sepuluh|roboh)/i;
const CAP: CapWord[] = CLIPS.flatMap((c) => c.words.map((w) => ({ w: w.w, t: w.s, key: KEYS.test(w.w) })));

// ================================================================= film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [h] = useState(() => delayRender("ep05 fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  const sc = sceneAt(t);
  const cuts = [CUT.map, CUT.faceoff, CUT.camp, CUT.stadium, CUT.ropes, CUT.ko, CUT.dawn];
  return (
    <AbsoluteFill style={{ background: "#060a1a" }}>
      {ok && (
        <>
          {sc === "A" && <HookScene t={t} frame={frame} />}
          {sc === "B1" && <MapScene t={t} frame={frame} />}
          {sc === "B2" && <FaceOffScene t={t} frame={frame} />}
          {sc === "C1" && <CampScene t={t} frame={frame} />}
          {sc === "C2" && <StadiumScene t={t} frame={frame} />}
          {sc === "D" && <RopesScene t={t} frame={frame} />}
          {sc === "E1" && <KOScene t={t} frame={frame} />}
          {sc === "E2" && <DawnScene t={t} frame={frame} />}
          {sc === "OUT" && <DawnScene t={t} frame={frame} out />}
          <Frame width={width} height={height}>
            {sc === "A" && <HookHud t={t} />}
            {sc === "B1" && <MapHud t={t} aspect={width / height} />}
            {sc === "B2" && <FaceOffHud t={t} />}
            {sc === "C1" && <CampHud t={t} />}
            {sc === "C2" && <StadiumHud t={t} />}
            {sc === "D" && <RopesHud t={t} />}
            {sc === "E1" && <KOHud t={t} />}
            {sc === "E2" && <DawnHud t={t} />}
            {sc === "OUT" && <OutHud t={t} />}
            <Captions s={t} words={CAP} max={3} y={1330} end={T.ikuti + 1.2} />
            <InkCut t={t} cuts={cuts} />
          </Frame>
        </>
      )}
    </AbsoluteFill>
  );
};
