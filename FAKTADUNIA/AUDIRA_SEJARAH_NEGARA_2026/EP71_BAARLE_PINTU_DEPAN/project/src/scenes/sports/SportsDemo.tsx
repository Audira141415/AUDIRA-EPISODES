// Reference scene for the sport library (core/sport): one short play per sport, 3 s each.
// Check a change before using it in an episode:
//   node scripts/stills.mjs out/sports 1.7s,4.6s,7.1s,10s,13.2s,16.1s,19.5s SportsDemoPreview

import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { FONT } from "../../core/type/fonts.ts";
import {
  ACTION_SPEED, Athlete, Ball, CourtNet, Goal, Hoop, M, Racket, SPORTS, SportField, Stadium, TEAMS, TRACK,
  arc, ballRadius, bounce, goalPlacement, hoopPlacement, hoopRingWorld, lerp, lerpV, m, rollSpin, seg, smooth,
  type SportId,
} from "../../core/sport/index.ts";

type V3 = [number, number, number];

export const SPORT_SEG = 3;
export const SPORTS_ORDER: SportId[] = ["football", "futsal", "basketball", "volleyball", "badminton", "tennis", "track"];
export const SPORTS_DEMO_SECONDS = SPORT_SEG * SPORTS_ORDER.length;

type SceneProps = { f: number; t: number };

/** Key light whose shadow camera follows the action (its target object lives in the scene). */
const Sun: React.FC<{ target: V3; size?: number; indoor?: boolean }> = ({ target, size = 14, indoor }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  return (
  <>
    <primitive object={tgt} position={target} />
    <hemisphereLight args={[indoor ? "#fff3df" : "#dff1ff", indoor ? "#2a2018" : "#55603f", indoor ? 0.7 : 0.85]} />
    <directionalLight
      position={[target[0] + (indoor ? 2 : 10), target[1] + 22, target[2] + (indoor ? 3 : 8)]}
      target={tgt}
      intensity={indoor ? 2.0 : 2.6}
      color={indoor ? "#fff1dc" : "#fff3df"}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-size}
      shadow-camera-right={size}
      shadow-camera-top={size}
      shadow-camera-bottom={-size}
      shadow-bias={-0.0004}
    />
  </>
  );
};

// ---------------------------------------------------------------------------------------------
/** Football and futsal: a dribble, a strike, the keeper dives the wrong way, the net bulges. */
const GoalScene: React.FC<SceneProps & { sport: "football" | "futsal" }> = ({ f, t, sport }) => {
  const S = SPORTS[sport];
  const big = sport === "football";
  const goalZ = -m(S.length / 2);
  const kickAt = 1.7;
  const startZ = goalZ + (big ? m(24) : m(12));
  const runSpeed = ACTION_SPEED.dribble;
  const tRun = Math.min(t, kickAt - 0.3);
  const strikerZ = startZ - runSpeed * tRun;
  const striker: V3 = [m(big ? 3 : 1.5), 0, strikerZ];
  const kickU = seg(t, kickAt - 0.3, kickAt + 0.3);
  const r = ballRadius(S.ball);
  // Ball: rolls just ahead of the striker with small touches, then flies to the far corner.
  const touch = 0.32 + Math.abs(Math.sin(t * 9)) * 0.12;
  const atFoot: V3 = [striker[0] - 0.08, r, striker[2] - touch];
  const target: V3 = [-m(big ? 2.9 : 1.1), m(big ? 1.7 : 1.2), goalZ - 0.05];
  const flight = seg(t, kickAt, kickAt + (big ? 0.55 : 0.4));
  const ball: V3 = t < kickAt ? atFoot : flight < 1 ? arc(atFoot, target, flight, 0.25) : lerpV(target, [target[0] * 0.95, r, goalZ - m(1.2)], seg(t, kickAt + 0.55, kickAt + 1.1));
  const spin = rollSpin(t < kickAt ? runSpeed * t : runSpeed * kickAt + flight * 20, r);
  const hit = seg(t, kickAt + (big ? 0.55 : 0.4), kickAt + 1.4);
  const bulge = hit > 0 ? { x: target[0] / M, y: target[1] / M, amount: Math.sin(Math.min(1, hit * 2.2) * Math.PI) * 0.8 } : undefined;
  const celebrate = t > kickAt + 0.7;

  // Camera: behind the striker over the shoulder, keeping striker, keeper and goal in frame;
  // it pushes in toward the goal as the ball flies.
  const k = smooth(seg(t, 0, 2.8));
  const back = big ? m(7) : m(4.5);
  const camPos = lerpV([striker[0] + m(2.5), m(big ? 3.6 : 2.6), strikerZ + back], [m(big ? 2.5 : 1.2), m(big ? 2.4 : 1.8), strikerZ + back * 0.75], k);
  const camTarget = lerpV([striker[0] * 0.4, 0.5, (strikerZ + goalZ) / 2], [target[0] * 0.4, 0.6, goalZ + 0.5], k);

  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={big ? 42 : 46} />
      <Sun target={[0, 0, goalZ + 6]} size={big ? 16 : 10} indoor={S.indoor} />
      <SportField sport={sport} />
      <Stadium f={f} sport={sport} teams={[TEAMS.harbour, TEAMS.valley]} />
      <Goal sport={sport} {...goalPlacement(sport, -1)} bulge={bulge} frame={f} />
      <Goal sport={sport} {...goalPlacement(sport, 1)} />
      <Athlete
        f={f}
        seed={9}
        action={celebrate ? "celebrate" : t < kickAt - 0.3 ? "dribble" : "kick"}
        u={kickU}
        team={TEAMS.harbour}
        number={9}
        position={striker}
        heading={Math.PI - 0.12}
      />
      <Athlete f={f} seed={4} action="keeperDive" u={seg(t, kickAt - 0.05, kickAt + 0.75)} side={1} team={TEAMS.valley} keeper number={1} position={[0, 0, goalZ + m(0.6)]} heading={0} />
      <Athlete f={f} seed={5} action="run" team={TEAMS.valley} number={4} position={[m(big ? -2 : -1.2), 0, strikerZ - m(big ? 4 : 2) + t * 0.4]} heading={Math.PI * 0.85} />
      {big && <Athlete f={f} seed={7} action="sprint" team={TEAMS.harbour} number={11} position={[m(-9), 0, strikerZ + m(3) - t * ACTION_SPEED.sprint * 0.6]} heading={Math.PI} />}
      {big && <Athlete f={f} seed={12} action="run" team={TEAMS.valley} number={5} position={[m(-6), 0, strikerZ - m(6) + t * 0.3]} heading={Math.PI * 1.1} />}
      <Ball kind={S.ball} position={ball} spin={[-spin, 0, 0]} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
const BasketballScene: React.FC<SceneProps> = ({ f, t }) => {
  const ring = hoopRingWorld(-1);
  const shooter: V3 = [m(2.2), 0, ring[2] + m(6.4)];
  const heading = Math.atan2(ring[0] - shooter[0], ring[2] - shooter[2]);
  const u = seg(t, 0.25, 1.55);
  const releaseT = 0.25 + 0.6 * 1.3;
  const air = Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.3) / 0.55))) * 0.35;
  const fwd: V3 = [Math.sin(heading) * 0.16, 0, Math.cos(heading) * 0.16];
  const hold: V3 = [shooter[0] + fwd[0], lerp(0.72, 1.48, smooth(seg(u, 0.25, 0.6))) + air * (u > 0.25 ? 1 : 0), shooter[2] + fwd[2]];
  const flyU = seg(t, releaseT, releaseT + 0.95);
  const r = ballRadius("basketball");
  let ball: V3 = t < releaseT ? hold : arc(hold, [ring[0], ring[1] + r * 0.5, ring[2]], flyU, 1.1);
  const drop = seg(t, releaseT + 0.95, releaseT + 1.35);
  if (drop > 0) ball = [ring[0], lerp(ring[1], r, drop * drop), ring[2]];
  const swish = drop > 0 && drop < 1 ? Math.sin(drop * Math.PI) : 0;

  const k = smooth(seg(t, 0.2, 2.6));
  const camPos = lerpV([shooter[0] + m(3.5), m(2.4), shooter[2] + m(4.5)], [shooter[0] + m(0.8), m(2.0), shooter[2] + m(3.0)], k);
  const camTarget = lerpV([shooter[0] * 0.5, m(2.4), (shooter[2] + ring[2]) / 2], [ring[0], ring[1] - 0.2, ring[2]], k);
  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={48} />
      <Sun target={[0, 0, ring[2] + 3]} size={10} indoor />
      <SportField sport="basketball" />
      <Stadium f={f} sport="basketball" teams={[TEAMS.garuda, TEAMS.nusantara]} />
      <Hoop {...hoopPlacement(-1)} netSwish={swish} />
      <Hoop {...hoopPlacement(1)} />
      <Athlete f={f} seed={23} action={t > releaseT + 1.1 ? "celebrate" : "jumpShot"} u={u} team={TEAMS.garuda} number={23} position={shooter} heading={heading} />
      <Athlete f={f} seed={8} action={t > releaseT ? "jumpShot" : "defend"} u={seg(t, releaseT - 0.35, releaseT + 0.9)} team={TEAMS.nusantara} number={8} position={[shooter[0] - m(0.4), 0, shooter[2] - m(1.0)]} heading={heading + Math.PI} />
      <Athlete f={f} seed={14} action="jog" team={TEAMS.nusantara} number={14} position={[m(-3), 0, ring[2] + m(3) - t * 0.4]} heading={Math.PI * 0.9} />
      <Ball kind="basketball" position={ball} spin={[-t * 8, 0, 0]} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
const VolleyballScene: React.FC<SceneProps> = ({ f, t }) => {
  const spiker: V3 = [m(1.0), 0, m(2.2)];
  const u = seg(t, 0.15, 1.45);
  const hitT = 0.15 + 0.65 * 1.3;
  const hitPoint: V3 = [m(1.0), m(3.2), m(1.45)];
  const setter: V3 = [m(-2.2), m(2.3), m(0.8)];
  const landing: V3 = [m(-1.5), ballRadius("volleyball"), m(-6)];
  let ball: V3 = t < hitT ? arc(setter, hitPoint, seg(t, 0, hitT), 1.0) : arc(hitPoint, landing, seg(t, hitT, hitT + 0.32), -0.05);
  if (t > hitT + 0.32) ball = bounce(landing, [m(-3.5), ballRadius("volleyball"), m(-10)], seg(t, hitT + 0.32, hitT + 1.6), 1.2);
  const k = smooth(seg(t, 0, 2.8));
  const camPos = lerpV([m(6.2), m(2.6), m(5.0)], [m(5.6), m(3.4), m(2.0)], k);
  const camTarget = lerpV([0, m(2.2), m(0.5)], [m(-0.5), m(1.6), m(-1.5)], k);
  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={46} />
      <Sun target={[0, 0, 0]} size={9} indoor />
      <SportField sport="volleyball" />
      <Stadium f={f} sport="volleyball" teams={[TEAMS.garuda, TEAMS.valley]} />
      <CourtNet sport="volleyball" />
      <Athlete f={f} seed={6} action={t > hitT + 0.6 ? "celebrate" : "spike"} u={u} team={TEAMS.garuda} number={6} position={spiker} heading={Math.PI} />
      <Athlete f={f} seed={3} action="ready" team={TEAMS.garuda} number={3} position={[m(-2.5), 0, m(1.2)]} heading={Math.PI * 0.8} />
      <Athlete f={f} seed={10} action="jumpShot" u={seg(t, hitT - 0.45, hitT + 0.6)} team={TEAMS.valley} number={10} position={[m(0.6), 0, m(-0.7)]} heading={0} />
      <Athlete f={f} seed={11} action="jumpShot" u={seg(t, hitT - 0.4, hitT + 0.65)} team={TEAMS.valley} number={11} position={[m(1.6), 0, m(-0.7)]} heading={0} />
      <Athlete f={f} seed={2} action="ready" team={TEAMS.valley} number={2} position={[m(-2), 0, m(-6.5)]} heading={0.2} />
      <Ball kind="volleyball" position={ball} spin={[t * 9, t * 3, 0]} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
const shuttleSpin = (from: V3, to: V3): V3 => {
  const v = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), v);
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
};

const BadmintonScene: React.FC<SceneProps> = ({ f, t }) => {
  const player: V3 = [m(0.4), 0, m(4.2)];
  const u = seg(t, 0.45, 1.75);
  const hitT = 0.45 + 0.6 * 1.3;
  const hitPoint: V3 = [m(0.75), m(2.75), m(4.0)];
  const from: V3 = [m(-1.0), m(2.0), m(-4.5)];
  const down: V3 = [m(-1.6), m(0.04), m(-2.6)];
  const pre = seg(t, 0, hitT);
  const post = seg(t, hitT, hitT + 0.28);
  const pos = t < hitT ? arc(from, hitPoint, pre, m(3.2)) : lerpV(hitPoint, down, post);
  const ahead = t < hitT ? arc(from, hitPoint, Math.min(1, pre + 0.02), m(3.2)) : lerpV(hitPoint, down, Math.min(1, post + 0.05));
  const spin = post >= 1 ? ([Math.PI / 2 - 0.3, 0, 0.4] as V3) : shuttleSpin(pos, ahead);
  const k = smooth(seg(t, 0, 2.8));
  const camPos = lerpV([m(4.5), m(1.6), m(8.5)], [m(3.0), m(2.6), m(7.2)], k);
  const camTarget = lerpV([0, m(2.0), m(2.5)], [m(-0.5), m(1.2), m(-0.5)], k);
  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={46} />
      <Sun target={[0, 0, 0]} size={8} indoor />
      <SportField sport="badminton" />
      <Stadium f={f} sport="badminton" teams={[TEAMS.garuda, TEAMS.harbour]} rows={8} />
      <CourtNet sport="badminton" />
      <Athlete f={f} seed={17} action="smash" u={u} team={TEAMS.garuda} number={17} position={player} heading={Math.PI} rightHand={<Racket kind="badminton" />} />
      <Athlete f={f} seed={29} action="ready" team={TEAMS.harbour} position={[m(-0.6), 0, m(-4.4)]} heading={0} rightHand={<Racket kind="badminton" color="#ff8a00" />} />
      <Ball kind="shuttlecock" position={pos} spin={spin} scale={1.4} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
const TennisScene: React.FC<SceneProps> = ({ f, t }) => {
  const server: V3 = [m(0.8), 0, m(11.885 + 0.3)];
  const u = seg(t, 0.2, 1.6);
  const hitT = 0.2 + 0.62 * 1.4;
  const tossFrom: V3 = [server[0] - m(0.15), m(1.0), server[2] - m(0.35)];
  const contact: V3 = [server[0] - m(0.05), m(2.75), server[2] - m(0.45)];
  const bounceAt: V3 = [m(-2.0), ballRadius("tennis"), m(-4.6)];
  let ball: V3;
  if (t < 0.45) ball = tossFrom;
  else if (t < hitT) {
    const k = seg(t, 0.45, hitT);
    ball = [tossFrom[0], lerp(tossFrom[1], contact[1] + 0.25, Math.sin(k * Math.PI * 0.62) / Math.sin(Math.PI * 0.62)), lerp(tossFrom[2], contact[2], k)];
  } else if (t < hitT + 0.42) ball = arc(contact, bounceAt, seg(t, hitT, hitT + 0.42), -0.1);
  else ball = arc(bounceAt, [m(-3.6), m(1.0), m(-12)], seg(t, hitT + 0.42, hitT + 1.0), m(0.8));
  const k = smooth(seg(t, 0, 2.8));
  const camPos = lerpV([server[0] + m(3.2), m(1.8), server[2] + m(3.8)], [server[0] + m(1.6), m(3.4), server[2] + m(5.5)], k);
  const camTarget = lerpV([server[0], m(2.0), server[2] - m(1)], [m(-1), m(0.6), m(-5)], k);
  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={46} />
      <Sun target={[0, 0, server[2] - 4]} size={12} />
      <SportField sport="tennis" />
      <Stadium f={f} sport="tennis" teams={[TEAMS.nusantara, TEAMS.valley]} rows={12} />
      <CourtNet sport="tennis" />
      <Athlete f={f} seed={31} action="serve" u={u} team={TEAMS.nusantara} position={server} heading={Math.PI} rightHand={<Racket kind="tennis" />} />
      <Athlete f={f} seed={41} action="ready" team={TEAMS.valley} position={[m(-1.5), 0, m(-12.5)]} heading={0.15} rightHand={<Racket kind="tennis" color="#2f6fde" />} />
      <Ball kind="tennis" position={ball} spin={[t * 20, 0, 0]} scale={1.5} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
const TrackScene: React.FC<SceneProps> = ({ f, t }) => {
  const laneX = (i: number) => m(TRACK.radius + (i + 0.5) * TRACK.lane);
  const startZ = m(-8);
  const speeds = [1.0, 0.97, 1.03, 0.95];
  const runners = [2, 3, 4, 5].map((lane, i) => {
    const z = startZ - ACTION_SPEED.sprint * speeds[i] * t;
    return { lane, z, x: laneX(lane) };
  });
  const lead = Math.min(...runners.map((r) => r.z));
  const camPos: V3 = [laneX(3) - m(9), m(2.2), lead - m(4) + Math.sin(t * 0.8) * 0.3];
  const camTarget: V3 = [laneX(3.5), m(0.9), lead - m(1)];
  return (
    <>
      <PoseCamera position={camPos} target={camTarget} fov={50} />
      <Sun target={[laneX(3), 0, lead]} size={10} />
      <SportField sport="track" />
      <Stadium f={f} sport="track" teams={[TEAMS.garuda, TEAMS.nusantara]} rows={14} />
      {runners.map((r, i) => (
        <Athlete key={i} f={f} seed={50 + i} action="sprint" team={[TEAMS.garuda, TEAMS.valley, TEAMS.nusantara, TEAMS.harbour][i]} number={r.lane} position={[r.x, 0, r.z]} heading={Math.PI} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
export const SportsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const tAll = f / 60;
  const idx = Math.min(SPORTS_ORDER.length - 1, Math.floor(tAll / SPORT_SEG));
  const sport = SPORTS_ORDER[idx];
  const t = tAll - idx * SPORT_SEG;
  const indoor = SPORTS[sport].indoor;
  const bg = indoor ? "#10141b" : "#bfdcf2";
  const props = { f, t };
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 5, 10], fov: 45, near: 0.05, far: 400 }}>
        {sport === "football" && <GoalScene {...props} sport="football" />}
        {sport === "futsal" && <GoalScene {...props} sport="futsal" />}
        {sport === "basketball" && <BasketballScene {...props} />}
        {sport === "volleyball" && <VolleyballScene {...props} />}
        {sport === "badminton" && <BadmintonScene {...props} />}
        {sport === "tennis" && <TennisScene {...props} />}
        {sport === "track" && <TrackScene {...props} />}
        <Finish frame={frame} background={bg} hdri={indoor ? "studio" : "sky"} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={indoor ? 1.0 : 0.95} envIntensity={0.5} />
      </ThreeCanvas>
      <div
        style={{
          position: "absolute", top: height * 0.115, left: 0, right: 0, textAlign: "center",
          fontFamily: FONT, fontWeight: 800, fontSize: height * 0.034, color: "#ffffff", letterSpacing: 1,
          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
        }}
      >
        {SPORTS[sport].name.toUpperCase()}
        <div style={{ fontSize: height * 0.014, fontWeight: 600, opacity: 0.85, marginTop: 4 }}>{SPORTS[sport].rule}</div>
      </div>
    </AbsoluteFill>
  );
};

