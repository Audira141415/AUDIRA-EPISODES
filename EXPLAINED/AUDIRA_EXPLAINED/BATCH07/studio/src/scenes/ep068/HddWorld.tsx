// AE-068 PAYOFF world: horizontal directional drilling (HDD). No shafts: a surface rig with an inclined carriage
// drills a small pilot hole at an angle from the entry point, under the road, up to the exit point; a reamer is
// pulled back to enlarge it; then the welded pipe lying on rollers beyond the exit is pulled back to the rig.
// (research: HDD pulls the pipe, starts from the surface, no shaft.)
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { C, T, clamp01, ss } from "./shared.ts";
import { Box, Mats } from "./StreetWorld.tsx";

export const HZ = -0.65; // soil face sits just behind the bore plane
export const ENTRY = new THREE.Vector3(-19, 0, 0);
export const EXIT = new THREE.Vector3(19, 0, 0);
const BORE_PTS = [ENTRY, new THREE.Vector3(-13, -2.9, 0), new THREE.Vector3(-6, -5.4, 0), new THREE.Vector3(0, -5.9, 0), new THREE.Vector3(6, -5.4, 0), new THREE.Vector3(13, -2.9, 0), EXIT];
export const bore = new THREE.CatmullRomCurve3(BORE_PTS, false, "centripetal");
const PIPE_PTS = [...BORE_PTS, new THREE.Vector3(22, 0.55, 0), new THREE.Vector3(30, 0.6, 0), new THREE.Vector3(45, 0.6, 0), new THREE.Vector3(62, 0.6, 0)];
export const pipePath = new THREE.CatmullRomCurve3(PIPE_PTS, false, "centripetal");
const BORE_LEN = bore.getLength();
const PIPE_PATH_LEN = pipePath.getLength();
const PIPE_LEN = BORE_LEN + 3;

// phases (VO words)
const pilotU = (t: number) => ss(T.lubangK, T.diperbesar - 0.05, t);
const reamU = (t: number) => ss(T.diperbesar, T.lalu + 0.15, t); // reamer: exit -> entry
const pullU = (t: number) => ss(T.lalu + 0.2, T.melewati + 0.75, t); // pipe head: exit -> entry
export const hddState = (t: number) => {
  const p = pilotU(t), r = reamU(t), q = pullU(t);
  return {
    pilot: p, ream: r, pull: q,
    head: bore.getPointAt(Math.max(0.001, p)),
    reamer: bore.getPointAt(1 - r * 0.999),
    // pipe head position as fraction along pipePath
    pipeHeadU: (BORE_LEN * (1 - q)) / PIPE_PATH_LEN,
  };
};

const N = 360, RADIAL = 16;
const tubeRange = (g: THREE.TubeGeometry, u0: number, u1: number) => {
  const a = Math.floor(clamp01(u0) * N), b = Math.ceil(clamp01(u1) * N);
  g.setDrawRange(a * RADIAL * 6, Math.max(0, b - a) * RADIAL * 6);
};

export const HddSoil: React.FC<{ M: Mats }> = ({ M }) => {
  const L: [number, number, keyof Mats][] = [[0, -0.3, "asphalt"], [-0.3, -1.0, "gravel"], [-1.0, -3.8, "laterite"], [-3.8, -8.2, "clay"], [-8.2, -16, "silt"]];
  return (
    <group>
      {L.map(([y0, y1, m]) => <Box key={m} a={[-60, y1, -20]} b={[60, y0, HZ]} m={M[m] as THREE.Material} />)}
      {/* verge on the cut side so the bore plane has ground above it */}
      <Box a={[-60, -0.3, HZ]} b={[60, 0, 1.4]} m={M.walk} />
      <Box a={[-66, -16.6, -60]} b={[66, -16, 6]} m={M.plinth} />
    </group>
  );
};

export const HddRig: React.FC<{ t: number; M: Mats }> = ({ t, M }) => {
  const st = hddState(t);
  const tubes = useMemo(() => ({
    pilot: new THREE.TubeGeometry(bore, N, 0.22, RADIAL, false),
    rod: new THREE.TubeGeometry(bore, N, 0.1, RADIAL, false),
    ream: new THREE.TubeGeometry(bore, N, 0.58, RADIAL, false),
    plan: new THREE.TubeGeometry(bore, N, 0.045, 6, false),
  }), []);
  const mats = useMemo(() => ({
    // the freshly drilled cavity glows warm (lit by the drilling crew's lamps along the path) so the bore reads against dark soil
    hole: new THREE.MeshStandardMaterial({ color: "#d9b27a", roughness: 1, side: THREE.BackSide, emissive: "#ffb45a", emissiveIntensity: 0.85 }),
    plan: new THREE.MeshBasicMaterial({ color: C.cyan, toneMapped: false, transparent: true, opacity: 0.55, depthWrite: false }),
    holeFront: new THREE.MeshStandardMaterial({ color: "#6a4c35", roughness: 1, transparent: true, opacity: 0.18, depthWrite: false }),
    hdpe: new THREE.MeshPhysicalMaterial({ color: "#1c1e22", roughness: 0.3, clearcoat: 0.8 }),
    mud: new THREE.MeshStandardMaterial({ color: "#7a6a58", roughness: 0.3 }),
    stripe: new THREE.MeshBasicMaterial({ color: C.accent, toneMapped: false }),
  }), []);
  tubeRange(tubes.pilot, 0, st.pilot);
  tubeRange(tubes.rod, 0, st.pilot);
  tubeRange(tubes.ream, 1 - st.ream, 1);
  const uPipeHead = st.pipeHeadU;
  // pipe on the rollers spans [head, head + PIPE_LEN]; the tube is built along the whole pipePath
  const pipeU0 = uPipeHead, pipeU1 = uPipeHead + PIPE_LEN / PIPE_PATH_LEN;
  const pipeTube = useMemo(() => new THREE.TubeGeometry(pipePath, N, 0.45, RADIAL, false), []);
  tubeRange(pipeTube, pipeU0, pipeU1);
  // rig: inclined mast pointing at the entry, angle ~ entry tangent
  const tan = bore.getTangentAt(0);
  const ang = Math.atan2(-tan.y, tan.x);
  const carriage = st.pilot > 0 && st.pilot < 1 ? 0.6 + ((t * 1.7) % 1) * 3.2 : 1.8;
  const pipeHeadPt = pipePath.getPointAt(clamp01(uPipeHead));
  const show = (v: boolean) => (v ? 1 : 0);
  return (
    <group>
      {/* planned bore path (survey line), ahead of the drill head */}
      <mesh geometry={tubes.plan} material={mats.plan} position={[0, 0, 0.35]} visible={st.pull < 0.01} />
      {/* bore: pilot hole + reamed hole (cavities) */}
      <mesh geometry={tubes.pilot} material={mats.hole} visible={st.pilot > 0.002 && st.ream < 0.999} />
      <mesh geometry={tubes.rod} material={M.steel} visible={st.pilot > 0.002 && st.ream < 0.002} />
      <mesh geometry={tubes.ream} material={mats.hole} visible={st.ream > 0.002} />
      <mesh geometry={tubes.ream} material={mats.holeFront} visible={st.ream > 0.002} />
      {/* pipe being pulled back */}
      <mesh geometry={pipeTube} material={mats.hdpe} castShadow />
      {/* drill head (pilot) with bent sub */}
      {st.pilot > 0.001 && st.pilot < 0.999 && (
        <group position={st.head} rotation={[0, 0, Math.atan2(bore.getTangentAt(st.pilot).y, bore.getTangentAt(st.pilot).x) - Math.PI / 2]}>
          <mesh material={M.chrome} scale={1.8}><coneGeometry args={[0.2, 0.6, 16]} /></mesh>
          <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0.035]} material={M.steel}><cylinderGeometry args={[0.15, 0.15, 0.6, 12]} /></mesh>
        </group>
      )}
      {/* reamer */}
      {st.ream > 0.001 && st.ream < 0.999 && (
        <group position={st.reamer} rotation={[t * 6, 0, Math.atan2(bore.getTangentAt(1 - st.ream).y, bore.getTangentAt(1 - st.ream).x)]}>
          {[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} rotation={[(k * Math.PI) / 3, 0, 0]} material={M.chrome}><boxGeometry args={[0.9, 1.05, 0.14]} /></mesh>)}
          <mesh rotation={[0, 0, -Math.PI / 2]} material={M.orange}><cylinderGeometry args={[0.38, 0.38, 1.0, 20]} /></mesh>
        </group>
      )}
      {/* pulling head (swivel) at the pipe front during pullback */}
      {st.pull > 0.001 && st.pull < 0.999 && (
        <mesh position={pipeHeadPt} material={M.orange}><sphereGeometry args={[0.5, 20, 14]} /></mesh>
      )}
      {/* rollers under the waiting pipe */}
      {Array.from({ length: 10 }, (_, i) => 23 + i * 4).map((x) => (
        <group key={x}>
          <Box a={[x - 0.5, 0, -0.5]} b={[x + 0.5, 0.12, 0.5]} m={M.dark} />
          <mesh position={[x, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.yellow}><cylinderGeometry args={[0.1, 0.1, 0.9, 12]} /></mesh>
        </group>
      ))}
      {/* rig trailer + inclined mast + carriage + drill string to the entry */}
      <group position={[ENTRY.x - 0.6, 0, 0]} rotation={[0, 0, -ang]}>
        <Box a={[-11, 0.2, -1.3]} b={[0, 0.65, 1.3]} m={M.dark} r />
        <Box a={[-10.5, 0.65, -0.35]} b={[-0.4, 1.0, 0.35]} m={M.yellow} r />
        <Box a={[-11 + carriage, 1.0, -0.7]} b={[-9.2 + carriage, 2.2, 0.7]} m={M.orange} r />
        <mesh position={[(-9.2 + carriage) / 2, 1.0 + 0.0, 0]} rotation={[0, 0, -Math.PI / 2]} material={M.steel}><cylinderGeometry args={[0.1, 0.1, Math.max(0.1, 9.2 - carriage), 12]} /></mesh>
      </group>
      <group position={[ENTRY.x - 14, 0, -3.2]}>
        <AssetModel id="delivery-truck-a9537e" size={6} ground rotation={[0, Math.PI / 2, 0]} />
      </group>
      <Box a={[ENTRY.x - 13, 0, 1.0]} b={[ENTRY.x - 10, 2.6, 3.4]} m={M.plaster} r />
      {/* bentonite mud pit at the entry */}
      <mesh position={[ENTRY.x + 1.2, 0.03, 0.8]} rotation={[-Math.PI / 2, 0, 0]} material={mats.mud} scale={0.5 + 0.5 * show(st.pilot > 0)}><circleGeometry args={[1.6, 32]} /></mesh>
      {/* entry / exit stakes */}
      {[ENTRY.x, EXIT.x].map((x) => <mesh key={x} position={[x, 0.6, 0.9]} material={mats.stripe}><cylinderGeometry args={[0.05, 0.05, 1.2, 8]} /></mesh>)}
    </group>
  );
};
