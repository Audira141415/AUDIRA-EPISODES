// EP09 film 3D scenes (COMICFORGE halftone cel + ink hulls). Every scene takes the global time t (seconds).
// World units = metres. Figures are generic comic players (no real faces, no crests).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BACK_INK, Inked, InkBox } from "../../kits/comicforge/scene/Ink.tsx";
import { rng } from "../../kits/comicforge/core/motion.ts";
import { Ball, BALL_R, Goal, KEEPER_REACH, KEEPER_SET, LUNGE, CHASE, MARADONA_JUMP } from "./Cover.tsx";
import { CameraRig, Footballer, FigurePose, INK, V3, tone } from "./comic.tsx";
import { adBoardTexture, crowdTexture } from "./coverTextures.ts";
import { badgeTexture, flagArgTexture, flagEngTexture, fullPitchTexture, scoreTexture, staticTexture } from "./filmTextures.ts";
import { CHEER, CamKey, FilmMats, STAND, camPath, lerpPose, runCycle } from "./filmKit.tsx";
import { T, easeInOut, lin, seg } from "./timing.ts";

const PI = Math.PI;
const faceDir = (dx: number, dz: number) => Math.atan2(dx, dz);

// ---------- environment ----------
const Pitch: React.FC<{ m: FilmMats }> = ({ m }) => {
  const mat = useMemo(() => tone(m.dotPx, "#2FB35A", "#1E7A3E", { map: fullPitchTexture() }), [m.dotPx]);
  return (
    <mesh rotation={[-PI / 2, 0, PI / 2]} material={mat}>
      <planeGeometry args={[105, 68]} />
    </mesh>
  );
};

/** Ground skirt under the stands so no void shows between pitch and crowd. */
const Apron: React.FC = () => (
  <mesh rotation={[-PI / 2, 0, 0]} position={[0, -0.02, 0]}>
    <planeGeometry args={[260, 260]} />
    <meshBasicMaterial color="#1E7A3E" />
  </mesh>
);

const Stands: React.FC<{ tint?: "day" | "dusk"; height?: number }> = ({ tint = "day", height = 34 }) => {
  const sides = useMemo(() => {
    const mk = (seed: number, L: number) => {
      const t = crowdTexture(seed, tint).clone();
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.set(L / 46, 1);
      t.needsUpdate = true;
      return t;
    };
    return [
      { pos: [43, 0, 0] as V3, ry: -PI / 2, L: 150, tex: mk(61, 150) },
      { pos: [-43, 0, 0] as V3, ry: PI / 2, L: 150, tex: mk(62, 150) },
      { pos: [0, 0, -62] as V3, ry: 0, L: 120, tex: mk(63, 120) },
      { pos: [0, 0, 62] as V3, ry: PI, L: 120, tex: mk(64, 120) },
    ];
  }, [tint]);
  const tilt = 0.62;
  return (
    <>
      {sides.map((s, i) => (
        <group key={i} position={s.pos} rotation={[0, s.ry, 0]}>
          <mesh rotation={[-tilt, 0, 0]} position={[0, (height / 2) * Math.cos(tilt), -(height / 2) * Math.sin(tilt)]}>
            <planeGeometry args={[s.L, height]} />
            <meshBasicMaterial map={s.tex} color="#8C8CB8" transparent toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* roof lip */}
          <mesh position={[0, height * Math.cos(tilt) + 0.6, -height * Math.sin(tilt) - 0.5]}>
            <boxGeometry args={[s.L, 1.4, 3]} />
            <meshBasicMaterial color="#121014" />
          </mesh>
        </group>
      ))}
    </>
  );
};

/** Perimeter boards around the pitch: the in-world AUDIRA brand. */
const AdBoards: React.FC = () => {
  const boards = useMemo(() => {
    const mk = (L: number) => {
      const t = adBoardTexture().clone();
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.set(L / 26, 1);
      t.needsUpdate = true;
      return t;
    };
    return [
      { pos: [37.5, 0.5, 0] as V3, ry: -PI / 2, L: 108, tex: mk(108) },
      { pos: [-37.5, 0.5, 0] as V3, ry: PI / 2, L: 108, tex: mk(108) },
      { pos: [0, 0.5, -56] as V3, ry: 0, L: 74, tex: mk(74) },
      { pos: [0, 0.5, 56] as V3, ry: PI, L: 74, tex: mk(74) },
    ];
  }, []);
  return (
    <>
      {boards.map((b, i) => (
        <group key={i} position={b.pos} rotation={[0, b.ry, 0]}>
          <mesh>
            <planeGeometry args={[b.L, 1.1]} />
            <meshBasicMaterial map={b.tex} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[b.L + 0.2, 1.3, 0.08]} />
            <meshBasicMaterial color="#121014" />
          </mesh>
        </group>
      ))}
    </>
  );
};

const Ground: React.FC<{ m: FilmMats; tint?: "day" | "dusk" }> = ({ m, tint }) => (
  <>
    <Apron />
    <Pitch m={m} />
    <AdBoards />
    <Stands tint={tint} />
  </>
);

/** Flat ink contact shadow. */
const Shadow: React.FC<{ x: number; z: number; r?: number; o?: number }> = ({ x, z, r = 0.5, o = 0.5 }) => (
  <mesh position={[x, 0.012, z]} rotation={[-PI / 2, 0, 0]} scale={[r * 1.3, r * 0.8, 1]}>
    <circleGeometry args={[1, 24]} />
    <meshBasicMaterial color="#0E3B1E" transparent opacity={o} depthWrite={false} />
  </mesh>
);

/** Camera-facing sprite (full lookAt). */
const Sprite: React.FC<{ tex: THREE.Texture; size: number; position: V3; cam: V3; scale?: number }> = ({ tex, size, position, cam, scale = 1 }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.lookAt(...cam);
  });
  if (scale <= 0.001) return null;
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </group>
  );
};

// =====================================================================
// STADIUM (konteks + outro): crane over the Azteca-like bowl.
// =====================================================================
export const STADIUM_KEYS: CamKey[] = [
  { t: 4.85, pos: [6, 92, 118], target: [0, 0, 6], fov: 48 },
  { t: 8.0, pos: [26, 52, 86], target: [0, 0, 0], fov: 48 },
  { t: 11.6, pos: [30, 14, 46], target: [-2, 1.5, 0], fov: 46 },
];
export const OUTRO_KEYS: CamKey[] = [
  { t: 71.6, pos: [0, 2.4, 9], target: [0, 0.6, 0], fov: 44 },
  { t: 76.0, pos: [10, 20, 52], target: [0, 1.5, 0], fov: 46 },
  { t: 81.0, pos: [16, 44, 92], target: [0, 2, 0], fov: 48 },
];

const LINEUP: { x: number; arg: boolean }[] = Array.from({ length: 12 }, (_, i) => ({ x: -9 + (i % 6) * 3.6, arg: i < 6 }));

export const StadiumScene: React.FC<{ m: FilmMats; t: number; outro?: boolean }> = ({ m, t, outro }) => {
  const cam = camPath(outro ? OUTRO_KEYS : STADIUM_KEYS, t);
  return (
    <>
      <CameraRig pos={cam.pos} target={cam.target} fov={cam.fov} />
      <Ground m={m} tint={outro ? "dusk" : "day"} />
      {outro ? (
        <>
          <Ball m={m} pos={[0, BALL_R, 0]} rot={[0.3, t * 0.2, 0.1]} />
          <Shadow x={0} z={0} r={0.25} />
        </>
      ) : (
        LINEUP.map((p, i) => (
          <React.Fragment key={i}>
            <Footballer kit={p.arg ? m.arg : m.eng} pose={STAND} position={[p.x + (p.arg ? 0 : 0), 0, p.arg ? -2.2 : 2.2]} rotY={0} scale={1.6} />
            <Shadow x={p.x} z={p.arg ? -2.2 : 2.2} r={0.6} />
          </React.Fragment>
        ))
      )}
    </>
  );
};

// =====================================================================
// FLAGS (konteks): Argentina vs England, waving cloth.
// =====================================================================
const Flag: React.FC<{ m: FilmMats; tex: THREE.Texture; t: number; position: V3; phase: number; mirror?: boolean }> = ({ m, tex, t, position, phase, mirror }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(2.4, 1.52, 24, 12), []);
  const base = useMemo(() => Float32Array.from(geo.getAttribute("position").array as Float32Array), [geo]);
  const mat = useMemo(() => tone(m.dotPx, "#FFFFFF", "#888888", { map: tex }), [m.dotPx, tex]);
  useLayoutEffect(() => {
    const pa = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const u = (x + 1.2) / 2.4; // 0 at pole
      pa.setZ(i, Math.sin(u * 5 - t * 5 + phase + y * 0.8) * 0.16 * u);
    }
    pa.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const g = useMemo(() => new THREE.CapsuleGeometry(0.04, 3.0, 4, 10), []);
  return (
    <group position={position} scale={[mirror ? -1 : 1, 1, 1]}>
      <Inked geometry={g} material={m.steel} outline={INK.thin} position={[-1.24, -0.6, 0]} />
      <mesh geometry={geo} material={mat} position={[0, 0.2, 0]} />
    </group>
  );
};

export const FlagsScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 11.2, 19.4);
  const cam: V3 = [0.3 - 0.6 * p, 0.1, 5.4 - 0.5 * p];
  return (
    <>
      <CameraRig pos={cam} target={[0, 0.15, 0]} fov={40} />
      <Flag m={m} tex={flagArgTexture()} t={t} position={[-1.45, 0, 0]} phase={0} />
      <Flag m={m} tex={flagEngTexture()} t={t} position={[1.45, 0, 0]} phase={1.7} mirror />
    </>
  );
};

// =====================================================================
// MAP (konteks): South Atlantic, Falklands / Malvinas. Coarse outlines, context only.
// =====================================================================
const LL = (lon: number, lat: number): [number, number] => [(lon + 63) * 0.62, -(lat + 51.5)];
const MAINLAND: [number, number][] = [
  [-74, -44], [-64.5, -44], [-65.2, -45.0], [-67.4, -46.0], [-67.6, -46.6], [-65.8, -47.8], [-67.4, -49.0], [-68.4, -50.2],
  [-69.0, -51.0], [-69.2, -51.7], [-68.4, -52.3], [-70.5, -52.8], [-74, -52.8],
];
const FUEGO: [number, number][] = [
  [-68.6, -52.6], [-67.6, -53.2], [-66.6, -53.9], [-65.2, -54.6], [-66.4, -55.0], [-68.6, -54.95], [-70.5, -55.2], [-71.5, -54.2], [-70.0, -53.2],
];
const WEST_FALKLAND: [number, number][] = [
  [-61.35, -51.3], [-60.4, -51.25], [-59.85, -51.55], [-60.05, -51.95], [-60.55, -52.25], [-61.15, -52.05], [-61.45, -51.65],
];
const EAST_FALKLAND: [number, number][] = [
  [-59.4, -51.35], [-58.4, -51.3], [-57.75, -51.55], [-58.3, -51.9], [-58.7, -52.25], [-59.35, -52.3], [-59.75, -51.95], [-59.55, -51.6],
];
const shapeOf = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  pts.forEach(([lon, lat], i) => {
    const [x, z] = LL(lon, lat);
    if (i === 0) s.moveTo(x, -z);
    else s.lineTo(x, -z);
  });
  return s;
};
const Land: React.FC<{ pts: [number, number][]; mat: THREE.Material; h: number; lift?: number }> = ({ pts, mat, h, lift = 0 }) => {
  const g = useMemo(() => new THREE.ExtrudeGeometry(shapeOf(pts), { depth: h, bevelEnabled: false }), [pts, h]);
  const edges = useMemo(() => new THREE.EdgesGeometry(g, 30), [g]);
  return (
    <group rotation={[-PI / 2, 0, 0]} position={[0, lift, 0]}>
      <mesh geometry={g} material={mat} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#121014" />
      </lineSegments>
    </group>
  );
};
export const FALKLANDS_POS: V3 = [LL(-59.6, -51.75)[0], 0.3, LL(-59.6, -51.75)[1]];
export const MAP_KEYS: CamKey[] = [
  { t: 12.4, pos: [0.0, 12, 8.5], target: [0.2, 0, 1.6], fov: 42 },
  { t: 15.6, pos: [0.8, 10, 7.0], target: [1.0, 0, 1.6], fov: 42 },
  { t: 19.6, pos: [1.6, 8.5, 6.2], target: [1.5, 0, 1.6], fov: 42 },
];
export const MapScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const cam = camPath(MAP_KEYS, t);
  const pulse = (t - T.falklands) % 1.2;
  const ringS = t > T.falklands ? 0.4 + pulse * 1.4 : 0;
  return (
    <>
      <CameraRig pos={cam.pos} target={cam.target} fov={cam.fov} />
      <mesh rotation={[-PI / 2, 0, 0]} material={m.sea}>
        <planeGeometry args={[40, 30]} />
      </mesh>
      <Land pts={MAINLAND} mat={m.land} h={0.25} />
      <Land pts={FUEGO} mat={m.land} h={0.25} />
      <Land pts={WEST_FALKLAND} mat={m.island} h={0.3} />
      <Land pts={EAST_FALKLAND} mat={m.island} h={0.3} />
      {ringS > 0 && (
        <mesh position={[FALKLANDS_POS[0], 0.33, FALKLANDS_POS[2]]} rotation={[-PI / 2, 0, 0]} scale={ringS}>
          <ringGeometry args={[1.0, 1.12, 48]} />
          <meshBasicMaterial color="#ED1C24" transparent opacity={Math.max(0, 1 - pulse / 1.2)} depthWrite={false} />
        </mesh>
      )}
      {/* dashed sea lane hint: coast -> islands (neutral context line, no arrows of war) */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = LL(-67.2, -50.6);
        const b = LL(-61.4, -51.6);
        const k = (i + 0.5) / 9;
        return (
          <mesh key={i} position={[a[0] + (b[0] - a[0]) * k, 0.02, a[1] + (b[1] - a[1]) * k]} rotation={[-PI / 2, 0, -Math.atan2(b[1] - a[1], b[0] - a[0])]}>
            <planeGeometry args={[0.18, 0.05]} />
            <meshBasicMaterial color="#FFF6E0" />
          </mesh>
        );
      })}
    </>
  );
};

// =====================================================================
// SCOREBOARD (babak 1, clock 51'->55', Lineker 81').
// =====================================================================
export const ScoreScene: React.FC<{ m: FilmMats; t: number; a: number; b: number; face: [string, string, string, string, string]; flip?: number; lineker?: boolean }> = ({
  m,
  t,
  a,
  b,
  face,
  flip = 0,
  lineker,
}) => {
  const p = lin(t, a, b);
  const cam: V3 = [-3.0 + 5.0 * p, 0.9 + 0.6 * p, 15.5 - 2.0 * p];
  const tex = scoreTexture(...face);
  const squash = flip > 0 && flip < 1 ? Math.abs(Math.cos(flip * PI)) : 1;
  const legs = useMemo(() => new THREE.CapsuleGeometry(0.12, 3.2, 4, 10), []);
  const lamp = useMemo(() => new THREE.SphereGeometry(0.13, 12, 10), []);
  return (
    <>
      <CameraRig pos={cam} target={[0, 2.2, 0]} fov={42} />
      <Pitch m={m} />
      <group position={[0, 0, -30]}>
        <Stands />
      </group>
      <group position={[0, 2.9, 0]}>
        <InkBox size={[6.3, 4.1, 0.45]} material={m.dark} ink={BACK_INK} t={0.08} />
        <mesh position={[0, 0, 0.33]} scale={[1, squash, 1]}>
          <planeGeometry args={[5.8, 3.6]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {/* lamp row on top */}
        {Array.from({ length: 7 }, (_, i) => (
          <Inked key={i} geometry={lamp} material={m.yellow} outline={INK.thin} position={[-2.7 + i * 0.9, 2.25, 0.1]} />
        ))}
      </group>
      <Inked geometry={legs} material={m.steel} outline={INK.thin} position={[-2.2, 1.0, -0.1]} />
      <Inked geometry={legs} material={m.steel} outline={INK.thin} position={[2.2, 1.0, -0.1]} />
      {lineker && (
        <>
          <Footballer kit={m.engNum} pose={lerpPose(STAND, CHEER, seg(t, T.lineker + 0.1, T.lineker + 0.6))} position={[2.4, 0, 3.4]} rotY={-0.5} scale={1.35} />
          <Shadow x={2.4} z={3.4} r={0.6} />
        </>
      )}
    </>
  );
};

// =====================================================================
// THE HAND (51'): miscued clearance, ball loops to the keeper, #10 jumps and fists it.
// Cover panel-1 coordinates: goal line z = -2.9, contact point C.
// =====================================================================
const C: V3 = [0.42, 2.36, -0.44];
const KICK = 23.15;
const HAND_KEYS: CamKey[] = [
  { t: 21.0, pos: [10, 5, 20], target: [2.5, 1.0, 6], fov: 42 },
  { t: 23.2, pos: [8.6, 4.4, 17], target: [2.2, 2.6, 5], fov: 42 },
  { t: 25.4, pos: [6.4, 3.0, 12], target: [0.8, 2.8, 1.0], fov: 42 },
  { t: 27.6, pos: [4.4, 1.7, 7.4], target: [0.0, 1.9, 0.3], fov: 44 },
  { t: 29.5, pos: [2.6, 0.95, 3.4], target: [0.1, 1.5, -0.4], fov: 45 },
  { t: 30.4, pos: [1.95, 0.7, 2.25], target: [0.05, 1.32, -0.5], fov: 46 },
  { t: 32.2, pos: [-1.6, 1.6, 4.6], target: [0.7, 1.1, -2.4], fov: 48 },
];
export const handCam = (t: number) => camPath(HAND_KEYS, t);

const quad = (a: V3, c: V3, b: V3, u: number): V3 => {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1], v * v * a[2] + 2 * v * u * c[2] + u * u * b[2]];
};
export const handBall = (t: number): V3 => {
  const feet: V3 = [2.95, BALL_R, 7.85];
  if (t < KICK) {
    const k = lin(t, 21.0, KICK - 0.05);
    return [5.6 + (feet[0] - 5.6) * k, BALL_R, 12 + (feet[2] - 12) * k];
  }
  if (t < T.kepalan) {
    const u = t < 26 ? 0.72 * (1 - Math.pow(1 - lin(t, KICK, 26), 2)) : 0.72 + 0.28 * lin(t, 26, T.kepalan);
    return quad([2.95, 0.2, 7.85], [2.2, 9.2, 4.0], C, u);
  }
  if (t < T.kepalan + 0.9) {
    const u = lin(t, T.kepalan, T.kepalan + 0.9);
    return quad(C, [0.75, 2.0, -1.5], [1.0, 0.9, -3.3], u);
  }
  const u = lin(t, T.kepalan + 0.9, T.kepalan + 1.6);
  return [1.0 + 0.1 * u, Math.max(BALL_R, 0.9 - 0.75 * u), -3.3 - 0.4 * u];
};

const KICK_BACK: FigurePose = { lean: 0.05, head: 0.1, armL: { x: 0.5, z: 0.6, bend: -0.6 }, armR: { x: -0.4, z: 0.6, bend: -0.6 }, legL: { x: 0.1, bend: 0.3 }, legR: { x: 0.9, bend: 1.3 } };
const KICK_HIT: FigurePose = { lean: -0.2, head: -0.2, armL: { x: -0.4, z: 0.8, bend: -0.5 }, armR: { x: 0.5, z: 0.8, bend: -0.5 }, legL: { x: 0.1, bend: 0.25 }, legR: { x: -1.35, bend: 0.2 } };
const WATCH: FigurePose = { ...STAND, head: -0.45 };

export const HandScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const cam = handCam(t);
  const ball = handBall(t);
  // clearing defender
  const kp = t < KICK - 0.35 ? lerpPose(STAND, KICK_BACK, seg(t, 22.2, KICK - 0.35)) : t < KICK + 0.1 ? lerpPose(KICK_BACK, KICK_HIT, seg(t, KICK - 0.35, KICK + 0.1)) : lerpPose(KICK_HIT, WATCH, seg(t, KICK + 0.3, KICK + 1.2));
  // #10 run-in and jump
  const runA: V3 = [-4.6, 0, 9.2];
  const jumpAt = T.melompat;
  let mPos: V3;
  let mPose: FigurePose;
  let mRot: number;
  if (t < 24.6) {
    mPos = runA;
    mPose = lerpPose(STAND, runCycle(t * 6, 0.1), 0.35);
    mRot = PI - 0.46;
  } else if (t < jumpAt) {
    const k = easeInOut(lin(t, 24.6, jumpAt)) * 0.92;
    mPos = [runA[0] * (1 - k), 0, runA[2] * (1 - k)];
    mPose = runCycle(t * 11);
    mRot = PI - 0.46;
  } else if (t < T.kepalan) {
    const k = lin(t, jumpAt, T.kepalan);
    const s = Math.sin((k * PI) / 2);
    mPos = [runA[0] * 0.08 * (1 - k), 0.3 * s, runA[2] * 0.08 * (1 - k)];
    mPose = lerpPose(runCycle(jumpAt * 11), MARADONA_JUMP, easeInOut(k));
    mRot = PI - 0.46 + 0.34 * easeInOut(k);
  } else {
    const k = lin(t, T.kepalan, T.kepalan + 0.7);
    mPos = [0, 0.3 * (1 - k * k), 0];
    mPose = lerpPose(MARADONA_JUMP, CHEER, seg(t, T.kepalan + 0.6, T.kepalan + 1.4));
    mRot = PI - 0.12;
  }
  // keeper
  const gk = seg(t, 28.4, T.kepalan - 0.05);
  const gkPos: V3 = [0.4 + (0.12 - 0.4) * gk, 0.1 * gk, -2.0 + 1.0 * gk];
  const gkPose = t < T.kepalan + 0.3 ? lerpPose(KEEPER_SET, KEEPER_REACH, gk) : lerpPose(KEEPER_REACH, { ...KEEPER_REACH, lean: -0.25, head: 0.1 }, seg(t, T.kepalan + 0.3, T.kepalan + 1.0));
  return (
    <>
      <CameraRig pos={cam.pos} target={cam.target} fov={cam.fov} />
      <group position={[0.6, 0, 49.6]}>
        <Ground m={m} />
      </group>
      <Goal m={m} position={[0.6, 0, -2.9]} rotY={0} />
      <Footballer kit={m.eng} pose={kp} position={[2.8, 0, 7.6]} rotY={PI / 2 + 0.3} />
      <Shadow x={2.8} z={7.6} />
      <Footballer kit={m.eng} pose={WATCH} position={[-2.2, 0, 3.0]} rotY={0.4} />
      <Shadow x={-2.2} z={3.0} />
      <Footballer kit={m.eng} pose={WATCH} position={[2.6, 0, 2.2]} rotY={-0.3} />
      <Shadow x={2.6} z={2.2} />
      <Footballer kit={m.arg} pose={runCycle(t * 7, 0.15)} position={[5.2 - lin(t, 21, 31) * 2.4, 0, 4.4]} rotY={-PI / 2 - 0.4} />
      <Shadow x={5.2 - lin(t, 21, 31) * 2.4} z={4.4} />
      <Footballer kit={m.keeper} pose={gkPose} position={gkPos} rotY={0.18} scale={1.16} />
      <Shadow x={gkPos[0]} z={gkPos[2]} r={0.6} />
      <Footballer kit={m.arg} pose={mPose} position={mPos} rotY={mRot} />
      <Shadow x={mPos[0]} z={mPos[2]} r={0.5} o={0.5 - mPos[1]} />
      <Ball m={m} pos={ball} rot={[t * 3, t * 2, 0]} />
      <Shadow x={ball[0]} z={ball[2]} r={0.18} o={0.45} />
    </>
  );
};

// =====================================================================
// REFEREE + LINESMAN (official in black kit; generic).
// =====================================================================
const POINT: FigurePose = { lean: 0.02, head: 0, armL: { x: 0.05, z: 0.2, bend: -0.2 }, armR: { x: -1.45, z: 0.55, bend: -0.05 }, legL: { x: 0.1, bend: 0.1 }, legR: { x: -0.2, bend: 0.15 } };
const crowdBack = (seed: number) => crowdTexture(seed, "day");

export const RefScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 32.0, 36.8);
  const pose = lerpPose(STAND, POINT, seg(t, T.sah - 0.4, T.sah));
  return (
    <>
      <CameraRig pos={[-2.4 + 1.0 * p, 0.6, 3.6 - 0.6 * p]} target={[0, 1.25, 0]} fov={42} />
      <mesh position={[0, 3, -14]}>
        <planeGeometry args={[48, 10]} />
        <meshBasicMaterial map={crowdBack(71)} color="#8C8CB8" transparent toneMapped={false} />
      </mesh>
      <mesh rotation={[-PI / 2, 0, 0]} material={m.pitch}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <Footballer kit={m.ref} pose={pose} position={[0, 0, 0]} rotY={0.35} scale={1.05} />
      <Shadow x={0} z={0} r={0.55} />
    </>
  );
};

export const LinesmanScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 34.6, 36.8);
  const stick = useMemo(() => new THREE.CapsuleGeometry(0.02, 0.62, 4, 8), []);
  const flagMat = useMemo(() => tone(m.dotPx, "#FFE100", "#E39A00"), [m.dotPx]);
  const ads = useMemo(() => {
    const t2 = adBoardTexture().clone();
    t2.wrapS = THREE.RepeatWrapping;
    t2.repeat.set(1.4, 1);
    t2.needsUpdate = true;
    return t2;
  }, []);
  return (
    <>
      <CameraRig pos={[2.2 - 0.8 * p, 1.0, 3.6 - 0.3 * p]} target={[0, 1.15, 0]} fov={42} />
      <mesh position={[0, 3.6, -10]}>
        <planeGeometry args={[40, 9]} />
        <meshBasicMaterial map={crowdBack(72)} color="#8C8CB8" transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.55, -3.2]}>
        <planeGeometry args={[36, 1.1]} />
        <meshBasicMaterial map={ads} toneMapped={false} />
      </mesh>
      <mesh rotation={[-PI / 2, 0, 0]} material={m.pitch}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <mesh position={[0, 0.01, 0.6]} rotation={[-PI / 2, 0, 0]}>
        <planeGeometry args={[30, 0.12]} />
        <meshBasicMaterial color="#F2F6EE" />
      </mesh>
      <Footballer kit={m.ref} pose={STAND} position={[0, 0, 0]} rotY={0.25} scale={1.05} />
      {/* flag held down: silent */}
      <group position={[0.36, 0.62, 0.12]} rotation={[0.05, 0.25, 0.08]}>
        <Inked geometry={stick} material={m.steel} outline={INK.thin} />
        <mesh position={[0.11, -0.18, 0]} material={flagMat}>
          <planeGeometry args={[0.22, 0.2]} />
        </mesh>
      </group>
      <Shadow x={0} z={0} r={0.55} />
    </>
  );
};

// =====================================================================
// NO REPLAY (1986): a retro TV with only static.
// =====================================================================
export const TvScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 36.2, 39.6);
  const v = Math.floor(t * 15) % 4;
  const knob = useMemo(() => new THREE.CylinderGeometry(0.11, 0.11, 0.1, 18), []);
  const ant = useMemo(() => new THREE.CapsuleGeometry(0.025, 1.3, 4, 8), []);
  return (
    <>
      <CameraRig pos={[1.6 - 2.0 * p, 1.3, 5.6 - 1.2 * p]} target={[0, 1.15, 0]} fov={40} />
      <InkBox size={[2.4, 1.8, 1.5]} material={m.tvBody} ink={BACK_INK} t={0.05} position={[0, 1.2, 0]} />
      <mesh position={[-0.25, 1.22, 0.77]}>
        <planeGeometry args={[1.55, 1.25]} />
        <meshBasicMaterial map={staticTexture(v)} toneMapped={false} />
      </mesh>
      <Inked geometry={knob} material={m.yellow} outline={INK.thin} position={[0.86, 1.5, 0.78]} rotation={[PI / 2, 0, 0]} />
      <Inked geometry={knob} material={m.yellow} outline={INK.thin} position={[0.86, 1.1, 0.78]} rotation={[PI / 2, 0, 0]} />
      <Inked geometry={ant} material={m.steel} outline={INK.thin} position={[-0.35, 2.6, 0]} rotation={[0, 0, 0.5]} />
      <Inked geometry={ant} material={m.steel} outline={INK.thin} position={[0.35, 2.6, 0]} rotation={[0, 0, -0.5]} />
      <InkBox size={[3.4, 0.3, 2.0]} material={m.wood} ink={BACK_INK} t={0.04} position={[0, 0.15, 0]} />
    </>
  );
};

// =====================================================================
// THE RUN (55'): from own half past 4 outfield players + the keeper. Numbered trail.
// Pitch length along z; attacking goal at z = -52.5.
// =====================================================================
export const RUN_KEYS: { t: number; p: [number, number] }[] = [
  { t: 42.5, p: [-1.5, 8] },
  { t: 43.2, p: [-2.6, 3.5] },
  { t: 44.0, p: [-4.8, -1.8] },
  { t: 45.0, p: [-8.6, -12.2] },
  { t: 46.0, p: [-10.6, -24] },
  { t: 47.0, p: [-7.0, -36] },
  { t: 48.6, p: [-2.6, -47.6] },
  { t: 49.3, p: [0.0, -50.4] },
  { t: 49.7, p: [0.5, -51.4] },
];
export const DEFENDERS: { pos: [number, number]; pass: number; keeper?: boolean }[] = [
  { pos: [-3.1, -1.2], pass: 44.0 },
  { pos: [-7.0, -12.8], pass: 45.0 },
  { pos: [-12.4, -24.6], pass: 46.0 },
  { pos: [-5.2, -36.6], pass: 47.0 },
  { pos: [-0.9, -49.2], pass: 48.75, keeper: true },
];
const runCurve = new THREE.CatmullRomCurve3(RUN_KEYS.map((k) => new THREE.Vector3(k.p[0], 0, k.p[1])), false, "centripetal");
export const runU = (t: number) => {
  const n = RUN_KEYS.length - 1;
  if (t <= RUN_KEYS[0].t) return 0;
  if (t >= RUN_KEYS[n].t) return 1;
  let i = 0;
  while (t > RUN_KEYS[i + 1].t) i++;
  return (i + (t - RUN_KEYS[i].t) / (RUN_KEYS[i + 1].t - RUN_KEYS[i].t)) / n;
};
export const runnerAt = (t: number): V3 => {
  const p = runCurve.getPoint(runU(t));
  return [p.x, 0, p.z];
};
export const runCam = (t: number, abad: boolean) => {
  if (abad) {
    const k = easeInOut(lin(t, 63.1, 67.6));
    return { pos: [34 - 14 * k, 70 - 16 * k, 18 - 4 * k] as V3, target: [-5, 0, -22 - 2 * k] as V3, fov: 50 };
  }
  const r = runnerAt(Math.max(42.6, t - 0.15));
  const end = seg(t, 48.6, 50.2);
  return {
    pos: [r[0] + 3.2 - 1.2 * end, 5.6 - 1.8 * end, r[2] + 7.6 - 1.6 * end] as V3,
    target: [r[0] - 0.6 + 0.6 * end, 0.8 + 0.4 * end, r[2] - 4.5 + 1.5 * end] as V3,
    fov: 45,
  };
};

const Trail: React.FC<{ uMax: number; gold?: boolean }> = ({ uMax, gold }) => {
  const N = 260;
  const geos = useMemo(() => {
    const mk = (w: number, y: number) => {
      const pts = runCurve.getSpacedPoints(N);
      const pos: number[] = [];
      const idx: number[] = [];
      for (let i = 0; i <= N; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(N, i + 1)];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const L = Math.hypot(dx, dz) || 1;
        const nx = -dz / L;
        const nz = dx / L;
        pos.push(pts[i].x + nx * w, y, pts[i].z + nz * w, pts[i].x - nx * w, y, pts[i].z - nz * w);
        if (i < N) {
          const o = i * 2;
          idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      return g;
    };
    return { core: mk(0.45, 0.05), ink: mk(0.75, 0.04) };
  }, []);
  const count = Math.floor(Math.min(1, uMax) * N) * 6;
  geos.core.setDrawRange(0, count);
  geos.ink.setDrawRange(0, count);
  return (
    <>
      <mesh geometry={geos.ink} frustumCulled={false}>
        <meshBasicMaterial color="#121014" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.core} frustumCulled={false}>
        <meshBasicMaterial color={gold ? "#FFC21A" : "#FFE100"} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export const RunScene: React.FC<{ m: FilmMats; t: number; abad?: boolean }> = ({ m, t, abad = false }) => {
  const tt = abad ? 50 : t; // abad: the completed run, frozen
  const cam = runCam(t, abad);
  const r = runnerAt(tt);
  const ahead = runnerAt(tt + 0.08);
  const dir = faceDir(ahead[0] - r[0] || 0.0001, ahead[2] - r[2] || -1);
  const moving = tt > 42.5 && tt < 49.8;
  const pose = moving ? runCycle(tt * 13, 0.3) : tt >= 49.8 ? lerpPose(runCycle(49.8 * 13), CHEER, seg(tt, 49.9, 50.4)) : STAND;
  // ball: fed from a team-mate, then at the runner's feet, then into the net
  let ball: V3;
  if (tt < 42.5) {
    const k = lin(tt, 42.0, 42.5);
    ball = [4 + (r[0] + 0.3 - 4) * k, BALL_R, 13 + (r[2] - 0.6 - 13) * k];
  } else if (tt < 49.6) {
    ball = [r[0] + Math.sin(dir) * 0.55, BALL_R, r[2] + Math.cos(dir) * 0.55];
  } else {
    const k = lin(tt, 49.6, 50.0);
    ball = [0.5 + 0.4 * k, BALL_R + 0.3 * Math.sin(k * PI), -52.0 - 1.2 * k];
  }
  return (
    <>
      <CameraRig pos={cam.pos} target={cam.target} fov={cam.fov} />
      <Ground m={m} />
      <Goal m={m} position={[0, 0, -52.5]} rotY={0} />
      <Trail uMax={runU(tt)} gold={abad} />
      {DEFENDERS.map((d, i) => {
        const passed = tt > d.pass;
        const k = seg(tt, d.pass - 0.5, d.pass + 0.1);
        const fall = seg(tt, d.pass, d.pass + 0.6);
        const facing = faceDir(r[0] - d.pos[0], r[2] - d.pos[1]);
        let pose: FigurePose = lerpPose(CHASE, LUNGE, k);
        if (passed) pose = { ...pose, lean: (pose.lean ?? 0) - 0.5 * fall, side: 0.4 * fall };
        if (d.keeper) pose = lerpPose(KEEPER_SET, { ...KEEPER_REACH, side: 1.1, lean: 0.2 }, k);
        const kx = d.keeper ? d.pos[0] - 0.8 * k : d.pos[0];
        const kz = d.keeper ? d.pos[1] + 0.6 * k : d.pos[1];
        const badge = abad ? 1 : seg(tt, d.pass, d.pass + 0.25) * (1 - seg(tt, d.pass + 0.7, d.pass + 1.0));
        return (
          <React.Fragment key={i}>
            <Footballer kit={d.keeper ? m.keeper : m.eng} pose={pose} position={[kx, d.keeper ? 0.3 * k : 0, kz]} rotY={facing} scale={d.keeper ? 1.16 : 1} />
            <Shadow x={kx} z={kz} r={0.55} />
            <Sprite tex={badgeTexture(String(i + 1))} size={abad ? 4.2 : 1.0} position={[kx, abad ? 4.4 : 2.7, kz]} cam={cam.pos} scale={badge} />
          </React.Fragment>
        );
      })}
      <Footballer kit={m.arg} pose={pose} position={r} rotY={dir} scale={abad ? 1.6 : 1} />
      <Shadow x={r[0]} z={r[2]} r={0.55} />
      <Ball m={m} pos={ball} rot={[tt * 9, 0, 0]} />
    </>
  );
};

// =====================================================================
// PRESS CONFERENCE (after the match).
// =====================================================================
const SEATED: FigurePose = { lean: 0.15, head: 0.05, armL: { x: -0.9, z: 0.3, bend: -1.2 }, armR: { x: -0.7, z: 0.3, bend: -1.5 }, legL: { x: -1.5, bend: 1.5 }, legR: { x: -1.5, bend: 1.5 } };
export const PressScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = easeInOut(lin(t, 54.6, 61.0));
  const mic = useMemo(() => ({ head: new THREE.SphereGeometry(0.075, 14, 12), stem: new THREE.CapsuleGeometry(0.018, 0.42, 4, 8) }), []);
  const talk = Math.sin(t * 16) * 0.06 * (t > T.usai && t < 60.4 ? 1 : 0);
  return (
    <>
      <CameraRig pos={[0.9 - 1.4 * p, 2.15, 4.4 - 1.2 * p]} target={[0, 1.15, 0]} fov={40} />
      {/* back wall: dotted press backdrop (generic, no logos) */}
      <mesh position={[0, 2, -1.4]} material={m.cloth}>
        <planeGeometry args={[12, 6]} />
      </mesh>
      <Footballer kit={m.suit} pose={{ ...SEATED, head: SEATED.head! + talk }} position={[0, 0.02, -0.55]} rotY={0} />
      <InkBox size={[3.2, 0.85, 1.0]} material={m.cloth} ink={BACK_INK} t={0.04} position={[0, 0.45, 0.15]} />
      <InkBox size={[3.3, 0.06, 1.1]} material={m.white} ink={BACK_INK} t={0.03} position={[0, 0.9, 0.15]} />
      {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
        <group key={i} position={[x * 1.3, 1.08, 0.42 - Math.abs(x) * 0.2]} rotation={[-0.35, -x * 0.6, 0]}>
          <Inked geometry={mic.stem} material={m.dark} outline={INK.thin} />
          <Inked geometry={mic.head} material={i % 2 ? m.steel : m.dark} outline={INK.thin} position={[0, 0.26, 0]} />
        </group>
      ))}
    </>
  );
};

// =====================================================================
// THE FIST (2005 admission): sculpted comic fist holding the ball up.
// =====================================================================
export const FistScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 60.5, 63.6);
  const g = useMemo(
    () => ({
      finger: new THREE.CapsuleGeometry(0.16, 0.34, 6, 14),
      thumb: new THREE.CapsuleGeometry(0.15, 0.4, 6, 14),
      palm: new THREE.CapsuleGeometry(0.42, 0.5, 8, 18),
      wrist: new THREE.CapsuleGeometry(0.3, 1.4, 6, 16),
    }),
    [],
  );
  return (
    <>
      <CameraRig pos={[Math.sin(p * 1.2 - 0.6) * 5.2, 1.4 + 0.6 * p, Math.cos(p * 1.2 - 0.6) * 5.2]} target={[0, 1.7, 0]} fov={40} />
      <group position={[0, 0.6, 0]} rotation={[0, 0, -0.12]}>
        <Inked geometry={g.wrist} material={m.arg.sleeve} outline={INK.thick} position={[0, -0.8, 0]} />
        <Inked geometry={g.palm} material={m.arg.skin} outline={INK.thick} position={[0, 0.55, 0]} scale={[1, 1, 0.75]} />
        {[-0.27, -0.09, 0.09, 0.27].map((x, i) => (
          <Inked key={i} geometry={g.finger} material={m.arg.skin} outline={INK.mid} position={[x * 1.05, 1.05 - Math.abs(x) * 0.2, 0.18]} rotation={[PI / 2, 0, 0]} />
        ))}
        <Inked geometry={g.thumb} material={m.arg.skin} outline={INK.mid} position={[-0.42, 0.62, 0.25]} rotation={[0.3, 0, 1.2]} />
      </group>
      <group position={[0.1, 2.42 + Math.sin(t * 2.4) * 0.04, 0.05]} scale={3}>
        <Ball m={m} pos={[0, 0, 0]} rot={[t, t * 0.7, 0]} />
      </group>
    </>
  );
};

// =====================================================================
// CHAMPIONS: generic gold cup (stylised, not a replica) + confetti.
// =====================================================================
export const TrophyScene: React.FC<{ m: FilmMats; t: number }> = ({ m, t }) => {
  const p = lin(t, 67.2, 72.0);
  const cup = useMemo(
    () =>
      new THREE.LatheGeometry(
        ([[0, 0], [0.62, 0], [0.62, 0.16], [0.3, 0.3], [0.16, 0.8], [0.14, 1.2], [0.3, 1.45], [0.62, 1.75], [0.74, 2.2], [0.7, 2.24], [0.58, 1.8], [0, 1.6]] as [number, number][]).map(
          ([r, y]) => new THREE.Vector2(r, y),
        ),
        40,
      ),
    [],
  );
  const handle = useMemo(() => new THREE.TorusGeometry(0.32, 0.06, 10, 24, PI), []);
  const plinth = useMemo(() => new THREE.CylinderGeometry(1.0, 1.15, 0.5, 32), []);
  const conf = useMemo(() => {
    const r = rng(1986);
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), 160);
    const cols = ["#74ACDF", "#FFFFFF", "#FFE100", "#E5007D", "#2BD46A"];
    const seeds = Array.from({ length: 160 }, (_, i) => {
      mesh.setColorAt(i, new THREE.Color(cols[i % cols.length]));
      return { x: (r() - 0.5) * 7, z: (r() - 0.5) * 4 - 0.5, y0: 4 + r() * 6, sp: 0.6 + r() * 0.8, ph: r() * 6, rot: r() * 6 };
    });
    mesh.frustumCulled = false;
    return { mesh, seeds };
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const since = Math.max(0, t - T.juara);
  conf.seeds.forEach((s, i) => {
    const y = t < T.juara ? 99 : s.y0 - ((since * s.sp) % 10);
    tmp.position.set(s.x + Math.sin(since * 2 + s.ph) * 0.2, y, s.z);
    tmp.rotation.set(since * 3 + s.rot, since * 2 + s.ph, 0);
    tmp.updateMatrix();
    conf.mesh.setMatrixAt(i, tmp.matrix);
  });
  conf.mesh.instanceMatrix.needsUpdate = true;
  return (
    <>
      <CameraRig pos={[Math.sin(-0.5 + p * 0.9) * 6.4, 1.3 + 1.0 * p, Math.cos(-0.5 + p * 0.9) * 6.4]} target={[0, 1.55, 0]} fov={40} />
      <Inked geometry={plinth} material={m.dark} outline={INK.mid} position={[0, 0.25, 0]} />
      <group position={[0, 0.5, 0]} rotation={[0, t * 0.35, 0]}>
        <Inked geometry={cup} material={m.gold} outline={INK.mid} />
        <Inked geometry={handle} material={m.gold} outline={INK.thin} position={[0.66, 1.75, 0]} rotation={[0, 0, -PI / 2]} />
        <Inked geometry={handle} material={m.gold} outline={INK.thin} position={[-0.66, 1.75, 0]} rotation={[0, 0, PI / 2]} />
      </group>
      <primitive object={conf.mesh} />
    </>
  );
};
