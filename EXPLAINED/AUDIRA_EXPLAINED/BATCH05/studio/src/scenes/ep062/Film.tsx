// AE-062 film — "Bagaimana Stadion Menampung Puluhan Ribu Penonton dengan Aman?" (TACTICBOARD).
// One continuous camera over the approved cover world (StadiumBoard, film mode), a zoom-through
// into the hero vomitory to the 1:1 "detail board" (Corridor) and back out again.
// Every beat is keyed to word times in timeline.json (Audio Master Clock). Audio is muxed by lead.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { smooth } from "../../kits/tacticboard/core/motion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { Outro } from "../_shared/Outro.tsx";
import {
  StadiumBoard,
  Arrow,
  routeFromTop,
  toWorld,
  tierTop,
  U,
  STEP,
  VOM,
  GANG_W,
  CONC_MID,
  CONC_OUT,
  nearestGate,
  GATES,
  type Side,
} from "./StadiumBoard";
import { Corridor, pitch, densityOf, flowRate, C, type FlowTimes } from "./Corridor";
import TL from "./timeline.json";

// ------------------------------------------------------------------ clock (timeline.json)
type Word = { w: string; s: number; e: number };
const CLIPS = (TL as unknown as { clips: { id: string; words: Word[] }[] }).clips;
const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

const T = {
  eight: W("l01", 10),
  keluar: W("l01", 13),
  green: W("l02", 3),
  delapan2: W("l03", 0),
  jalur: W("l03", 4),
  bukan: W("l03", 8),
  lebar: W("l04", 0),
  tiap: W("l05", 0),
  enam: W("l05", 6),
  datar: W("l05", 12),
  kali: W("l06", 0),
  kapasitas: W("l06", 6),
  kunci: W("l07", 0),
  titik: W("l07", 4),
  bukanG: W("l07", 6),
  lorong: W("l08", 0),
  gerbang3: W("l08", 6),
  tetap: W("l08", 9),
  padat: W("l09", 1),
  lima: W("l10", 0),
  risiko: W("l10", 8),
  indo: W("l11", 0),
  aturan: W("l11", 2),
  pintu: W("l11", 12),
  limaBelas: W("l11", 14),
  stadion: W("l12", 0),
  titik2: W("l12", 4),
  audira: W("l13", 1),
};
const T_IN = T.kunci + 1.3; // cut through the vomitory into the detail board
const T_OUT = T.indo + 0.45; // and back out to the stadium
const OUTRO_AT = SEC.OUTRO[1] + 0.2;
const FT: FlowTimes = { arr: T.kunci - 5, enter: T.kunci - 3, slow0: T.padat - 0.3, slow1: T.risiko - 0.6 };

// ------------------------------------------------------------------ camera
type Pose = { tgt: [number, number, number]; d: number; el: number; az: number };
const pose = (tgt: [number, number, number], d: number, el: number, az: number): Pose => ({ tgt, d, el, az });
type Seg = { a: number; b: number; to: Pose; ease?: (k: number) => number; from?: Pose };
const easeIn = (k: number) => k * k * k;
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const HERO = { side: "+x" as Side, v: 0 };
const VOM_P: [number, number, number] = [2.45, tierTop(VOM[1]) + 0.01, 0];

const SHOTS: Seg[] = [
  { a: 0, b: SEC.KONTEKS[0] - 0.2, from: pose([0, 0, -0.4], 29, 60, -30), to: pose([0.3, 0, -0.6], 23.5, 43, -8) },
  { a: SEC.KONTEKS[0] - 0.2, b: T.delapan2 - 0.2, to: pose([0.9, 0.15, -0.5], 20, 42, -24) },
  { a: T.delapan2 - 0.2, b: SEC.MEKANISME[0], to: pose([2.9, 0.3, -1.0], 12.5, 46, -46) },
  { a: SEC.MEKANISME[0], b: T.tiap - 0.4, to: pose([2.95, 0.55, 0.0], 3.8, 50, -74) },
  { a: T.tiap - 0.4, b: T.datar - 0.3, to: pose([2.95, 0.55, 0.02], 3.3, 48, -58) },
  { a: T.datar - 0.3, b: T.kali - 0.2, to: pose([3.8, 0.1, -0.9], 3.3, 50, -22) },
  { a: T.kali - 0.2, b: T.kunci - 0.1, to: pose([2.6, 0.35, -0.2], 8.2, 50, -36) },
  { a: T.kunci - 0.1, b: T_IN, to: pose(VOM_P, 0.32, 74, -40), ease: easeIn },
  // ---- detail board (corridor), 1 unit = 1 m
  { a: T_IN, b: T.lorong - 0.6, from: pose([-3.2, 0.3, 0], 2.0, 12, -90), to: pose([0.6, 0, 0], 17.5, 52, -90), ease: easeOut },
  { a: T.lorong - 0.6, b: SEC.PAYOFF[0] - 0.2, to: pose([0.6, 0, 0], 15.5, 50, -76) },
  { a: SEC.PAYOFF[0] - 0.2, b: T_OUT - 0.35, to: pose([-3.6, 0, 0], 10.5, 62, -112) },
  { a: T_OUT - 0.35, b: T_OUT, to: pose([-3.6, 0, 0], 24, 86, -112), ease: easeIn },
  // ---- back out of the hero vomitory to the whole stadium
  { a: T_OUT, b: T_OUT + 1.4, from: pose(VOM_P, 0.5, 76, -30), to: pose([1.6, 0.3, -0.6], 9, 56, -22), ease: easeOut },
  { a: T_OUT + 1.4, b: SEC.OUTRO[0], to: pose([0.8, 0.2, -1.0], 21, 44, -12) },
  { a: SEC.OUTRO[0], b: TOTAL + 1, to: pose([1.7, 0.4, -0.9], 13.5, 40, -28) },
];
const lerpPose = (A: Pose, B: Pose, k: number): Pose => ({
  tgt: [A.tgt[0] + (B.tgt[0] - A.tgt[0]) * k, A.tgt[1] + (B.tgt[1] - A.tgt[1]) * k, A.tgt[2] + (B.tgt[2] - A.tgt[2]) * k],
  d: A.d * Math.pow(B.d / A.d, k), // log-distance: dolly speed reads constant
  el: A.el + (B.el - A.el) * k,
  az: A.az + (B.az - A.az) * k,
});
const poseAt = (t: number): Pose => {
  let prev = SHOTS[0].from!;
  for (const s of SHOTS) {
    const from = s.from ?? prev;
    if (t < s.b || s === SHOTS[SHOTS.length - 1]) {
      const k = Math.max(0, Math.min(1, (t - s.a) / (s.b - s.a)));
      return lerpPose(from, s.to, (s.ease ?? smooth)(k));
    }
    prev = s.to;
  }
  return prev;
};
const FOV = 32;
const camOf = (t: number) => {
  const p = poseAt(t);
  const el = (p.el * Math.PI) / 180;
  const az = (p.az * Math.PI) / 180;
  const drift = Math.sin(t * 0.37) * 0.012 * p.d; // hand-held float, scales with distance
  const pos: [number, number, number] = [
    p.tgt[0] + p.d * Math.cos(el) * Math.sin(az) + drift,
    p.tgt[1] + p.d * Math.sin(el),
    p.tgt[2] + p.d * Math.cos(el) * Math.cos(az),
  ];
  return { pos, tgt: p.tgt, d: p.d };
};
const project = (p: THREE.Vector3, t: number, w: number, h: number) => {
  const c = camOf(t);
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 160);
  cam.position.set(...c.pos);
  cam.lookAt(...c.tgt);
  cam.updateMatrixWorld();
  const v = p.clone().project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, vis: v.z < 1 };
};
const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camOf(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.pos);
    cam.lookAt(...c.tgt);
    cam.fov = FOV;
    cam.near = Math.max(0.02, c.d * 0.04);
    cam.far = 160;
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ board extras (3D)
const GANGS: { side: Side; v: number; bottom?: boolean }[] = [
  { side: "+x", v: 0, bottom: true },
  { side: "+x", v: 1.4 },
  { side: "-x", v: 0 },
  { side: "-x", v: -1.4 },
];
const SLOTS = 34;
const GAP = 0.78;
const V_STAIR = 0.13; // stairs (66 / min per m) ...
const V_FLAT = 0.13 * (82 / 66); // ... flat concourse is faster (82 / min per m)
/** Board token on a gangway exit flow, by age (s) since it stepped into the gangway. */
const flowPos = (side: Side, v: number, age: number, j: number): { p: THREE.Vector3; s: number } | null => {
  const gate = nearestGate(side, v);
  const dir = Math.sign(gate.v - v) || 1;
  const jit = ((j * 37) % 7) / 7 - 0.5;
  const L1 = U(8) - U(5.6);
  const t1 = L1 / V_STAIR;
  if (age < 0) return null;
  if (age < t1) {
    const u = U(8) - age * V_STAIR;
    const k = Math.max(0, Math.min(8, Math.floor(u / STEP)));
    const sc = 1 - smooth((age - (t1 - 0.35)) / 0.35);
    return { p: toWorld(side, u, tierTop(k) + 0.028, v + jit * 0.05), s: Math.max(0, sc) };
  }
  const t2 = t1 + 1.0; // under the stand
  if (age < t2) return null;
  const L3 = Math.abs(gate.v - v) - 0.35;
  const t3 = t2 + L3 / V_FLAT;
  if (age < t3) {
    const vv = v + dir * (0.35 + (age - t2) * V_FLAT);
    return { p: toWorld(side, CONC_MID + jit * 0.22, 0.076, vv), s: smooth((age - t2) / 0.3) };
  }
  const L4 = CONC_OUT + 0.8 - CONC_MID;
  const t4 = t3 + L4 / V_FLAT;
  if (age < t4) {
    const u = CONC_MID + (age - t3) * V_FLAT;
    return { p: toWorld(side, u, 0.076, gate.v + jit * 0.12), s: 1 - smooth((age - (t4 - 0.6)) / 0.6) };
  }
  return null;
};
const bottomPos = (side: Side, v: number, age: number, j: number) => {
  const L = U(2.6) - U(0);
  const t1 = L / V_STAIR;
  if (age < 0 || age > t1) return null;
  const u = U(0) + age * V_STAIR;
  const k = Math.max(0, Math.min(8, Math.floor(u / STEP)));
  const jit = ((j * 53) % 5) / 5 - 0.5;
  return { p: toWorld(side, u, tierTop(k) + 0.028, v + jit * 0.05), s: 1 - smooth((age - (t1 - 0.35)) / 0.35) };
};

const BoardFlow: React.FC<{ t: number }> = ({ t }) => {
  const n = GANGS.length * SLOTS + 12;
  const mesh = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.05, 0.054, 0.032, 20);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#ffffff" });
    const m = new THREE.InstancedMesh(geo, mat, n);
    const o = new THREE.Object3D();
    o.scale.setScalar(0);
    o.updateMatrix();
    for (let i = 0; i < n; i++) {
      m.setColorAt(i, new THREE.Color(P.lane).multiplyScalar(0.9 + ((i * 17) % 10) / 100));
      m.setMatrixAt(i, o.matrix);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = true;
    m.frustumCulled = false;
    return m;
  }, [n]);
  // two flow windows: the exit after the whistle (hook..mechanism) and after the doors open (payoff..outro)
  const start = t < T_IN ? T.keluar : T.pintu + 0.5;
  const on = t < T.kunci + 0.6 || t > T.pintu + 0.5;
  const o = new THREE.Object3D();
  let i = 0;
  GANGS.forEach((g, gi) => {
    for (let j = 0; j < SLOTS; j++, i++) {
      const age = t - start - j * GAP - gi * 0.31;
      const r = on ? flowPos(g.side, g.v, age, j + gi * 5) : null;
      o.position.copy(r ? r.p : new THREE.Vector3(0, -3, 0));
      o.scale.setScalar(r ? Math.max(0.001, r.s) : 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
  });
  for (let j = 0; j < 12; j++, i++) {
    const age = ((t - start - j * GAP) % (12 * GAP) + 12 * GAP) % (12 * GAP);
    const r = on && t - start - j * GAP >= 0 ? bottomPos("+x", 0, age, j) : null;
    o.position.copy(r ? r.p : new THREE.Vector3(0, -3, 0));
    o.scale.setScalar(r ? Math.max(0.001, r.s) : 0);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

/** Telestrator arrow that draws itself along a route (drawRange on a tube). */
const DrawArrow: React.FC<{ pts: THREE.Vector3[]; p: number; color: string; radius: number }> = ({ pts, p, color, radius }) => {
  const { geo, curve } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    return { geo: new THREE.TubeGeometry(curve, 160, radius, 10, false), curve };
  }, [pts, radius]);
  const k = Math.max(0.001, Math.min(1, p));
  const count = geo.index!.count;
  geo.setDrawRange(0, Math.floor((count * k) / 6) * 6);
  const head = curve.getPointAt(Math.min(0.999, k));
  const tan = curve.getTangentAt(Math.min(0.999, k));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.35} toneMapped={false} />
      </mesh>
      <mesh position={head} quaternion={q}>
        <coneGeometry args={[radius * 3.2, radius * 7, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
};

const GATES_W = GATES.map((g) => toWorld(g.side, CONC_OUT + 0.05, 0, g.v));
const ROUTE = routeFromTop("+x", 0, 0.12);
const ROUTE_IN = ROUTE.slice(0, 6); // tribun -> gangway -> vomitory -> concourse (stops here)
const ROUTE_GHOST = ROUTE.slice(5); // concourse -> gate -> outside (NOT what the 8 min measures)
const STAIR_TAPE_U = U(7);
const CONC_TAPE_V = -1.0;

const Tape: React.FC<{ center: THREE.Vector3; rotY: number; len: number; p: number }> = ({ center, rotY, len, p }) => {
  const k = Math.max(0.001, p);
  return (
    <group position={center} rotation={[0, rotY, 0]}>
      {/* tape case */}
      <mesh position={[0, 0.02, len / 2 + 0.035]} castShadow>
        <RoundedBoxGeo args={[0.07, 0.05, 0.06]} radius={0.015} />
        <meshPhysicalMaterial {...POLISH.brickABS} color="#FF5A3C" />
      </mesh>
      {/* blade, unrolling from the case */}
      <group position={[0, 0.004, len / 2]} scale={[1, 1, k]}>
        <mesh position={[0, 0, -len / 2]} castShadow>
          <boxGeometry args={[0.035, 0.004, len]} />
          <meshStandardMaterial color={P.lane} emissive={P.lane} emissiveIntensity={0.35} roughness={0.4} metalness={0.3} />
        </mesh>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={i} position={[0.008, 0.003, -i * (len / 10)]}>
            <boxGeometry args={[i % 5 ? 0.012 : 0.022, 0.002, 0.003]} />
            <meshBasicMaterial color="#14110A" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const BoardExtras: React.FC<{ t: number }> = ({ t }) => {
  const fx = (o: THREE.Object3D | null) => o && o.layers.set(FX_LAYER);
  const pulse = 0.5 + 0.5 * Math.sin(t * 5.2);
  const arrowP = seg(t, T.delapan2, T.jalur + 0.2);
  const arrowOn = t > T.delapan2 && t < SEC.MEKANISME[0];
  const ghostOn = t > T.bukan - 0.1 && t < SEC.MEKANISME[0];
  const bookIn = seg(t, T.green - 0.4, T.green + 0.4);
  const bookOut = seg(t, T.delapan2 - 0.3, T.delapan2 + 0.4);
  const stairTape = t > T.lebar - 0.2 && t < T.datar ? seg(t, T.lebar, T.lebar + 0.9) : 0;
  const concTape = t > T.datar - 0.3 && t < T.kali + 0.4 ? seg(t, T.datar, T.datar + 0.6) : 0;
  const sector = t > T.kapasitas - 0.3 && t < T_IN ? seg(t, T.kapasitas - 0.2, T.kapasitas + 0.5) : 0;
  const ring = (t > T.kunci - 0.2 && t < T_IN) || t > T.stadion - 0.4 ? 1 : 0;
  const stop = ROUTE_IN[ROUTE_IN.length - 1];
  const gate = ROUTE_GHOST[ROUTE_GHOST.length - 2];
  return (
    <group>
      {/* GREEN GUIDE booklet dropped on the pitch like a coach's manual */}
      {bookIn > 0 && bookOut < 1 && (
        <group position={[0.15, 0.06 + (1 - bookIn) * 1.4 + bookOut * 0.0, 0.3]} rotation={[0, -0.35 + (1 - bookIn) * 0.6, 0]} scale={1 - bookOut}>
          <mesh castShadow receiveShadow>
            <RoundedBoxGeo args={[1.0, 0.07, 1.36]} radius={0.025} />
            <meshPhysicalMaterial {...POLISH.brickABS} color="#2F8F4E" />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.96, 0.05, 1.3]} />
            <meshStandardMaterial color="#F2EFE6" roughness={0.9} />
          </mesh>
          <mesh position={[-0.43, 0.037, 0]}>
            <boxGeometry args={[0.08, 0.004, 1.36]} />
            <meshStandardMaterial color="#1E6A38" roughness={0.6} />
          </mesh>
          <mesh position={[0.05, 0.037, -0.32]}>
            <boxGeometry args={[0.6, 0.004, 0.1]} />
            <meshStandardMaterial color={P.lane} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* exit route: tribun -> gangway -> vomitory -> concourse, stops at the free-flowing exit route */}
      {arrowOn && <DrawArrow pts={ROUTE_IN} p={arrowP} color={P.lane} radius={0.032} />}
      {arrowOn && arrowP > 0.98 && (
        <group position={[stop.x, 0.08, stop.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} ref={fx}>
            <ringGeometry args={[0.16, 0.2 + pulse * 0.02, 48]} />
            <meshBasicMaterial color={P.lane} transparent opacity={0.9} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
            <meshStandardMaterial color={P.lane} emissive={P.lane} emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        </group>
      )}
      {ghostOn && <Arrow pts={ROUTE_GHOST} color="#E8FFF0" radius={0.014} dashed={[0.02, 0.98]} glow={0.45} />}
      {ghostOn && (
        <group position={[gate.x + 0.05, 0.32, gate.z]} scale={seg(t, T.bukan, T.bukan + 0.35)}>
          {[1, -1].map((s) => (
            <mesh key={s} rotation={[0, 0, s * 0.785]}>
              <boxGeometry args={[0.04, 0.42, 0.04]} />
              <meshStandardMaterial color="#FF5A3C" emissive="#FF5A3C" emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}

      {/* 1 m tape across the stair (66 / min) and across the flat concourse (82 / min) */}
      {stairTape > 0 && <Tape center={toWorld("+x", STAIR_TAPE_U, tierTop(7) + 0.04, 0)} rotY={0} len={GANG_W} p={stairTape} />}
      {concTape > 0 && (
        <Tape center={toWorld("+x", CONC_MID, 0.1, CONC_TAPE_V)} rotY={Math.PI / 2} len={GANG_W} p={concTape} />
      )}

      {/* sector capacity: the block of seats served by the hero gangway */}
      {sector > 0 &&
        Array.from({ length: 9 }, (_, k) => (
          <mesh key={k} position={toWorld("+x", U(k), tierTop(k) + 0.045, 0)} ref={fx}>
            <boxGeometry args={[STEP - 0.01, 0.07, 1.36 * sector]} />
            <meshBasicMaterial color={P.lane} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}

      {/* doors opening: green pulse at every gate */}
      {t > T.pintu - 0.2 && t < T.pintu + 2.6 &&
        GATES_W.map((g, i) => {
          const k = ((t - T.pintu + 0.2) % 1.2) / 1.2;
          return (
            <mesh key={`gp${i}`} position={[g.x, 0.09, g.z]} rotation={[-Math.PI / 2, 0, 0]} ref={fx}>
              <ringGeometry args={[0.15 + k * 0.5, 0.2 + k * 0.5, 48]} />
              <meshBasicMaterial color="#40E08C" transparent opacity={0.9 * (1 - k)} toneMapped={false} depthWrite={false} />
            </mesh>
          );
        })}
      {/* the narrowest point: red pulse ring on the hero vomitory */}
      {ring > 0 && (
        <group position={[VOM_P[0], VOM_P[1] + 0.02, VOM_P[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.75, 1]} ref={fx}>
            <ringGeometry args={[0.36 + pulse * 0.05, 0.4 + pulse * 0.05, 64]} />
            <meshBasicMaterial color="#FF5A3C" transparent opacity={0.9 - pulse * 0.3} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.75, 1]} position={[0, 0.002, 0]} ref={fx}>
            <ringGeometry args={[0.5, 0.52, 64]} />
            <meshBasicMaterial color="#FF8A6A" transparent opacity={0.45} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ------------------------------------------------------------------ HUD + labels (HTML)
const panel = (s: number, accent: string): React.CSSProperties => ({
  background: "rgba(7,11,16,0.9)",
  borderLeft: `${6 * s}px solid ${accent}`,
  borderRadius: 10 * s,
  padding: `${14 * s}px ${22 * s}px`,
  boxShadow: `0 ${10 * s}px ${28 * s}px rgba(0,0,0,0.5)`,
  color: "#F4F7FA",
});
const KICK: { a: number; text: string }[] = [
  { a: 0, text: "STADION PENUH" },
  { a: SEC.KONTEKS[0], text: "BATAS 8 MENIT" },
  { a: SEC.MEKANISME[0], text: "LEBAR = ANGKA" },
  { a: SEC.REVEAL[0], text: "TITIK TERSEMPIT" },
  { a: SEC.PAYOFF[0], text: "KEPADATAN" },
  { a: T.indo - 0.2, text: "ATURAN DI INDONESIA" },
  { a: SEC.OUTRO[0], text: "STADION AMAN" },
];

const Pin: React.FC<{
  t: number;
  w: number;
  h: number;
  at: THREE.Vector3;
  op: number;
  bg: string;
  fg?: string;
  dx?: number;
  dy?: number;
  children: React.ReactNode;
}> = ({ t, w, h, at, op, bg, fg = "#fff", dx = -50, dy = -120, children }) => {
  if (op <= 0.01) return null;
  const s = h / 1920;
  const p = project(at, t, w, h);
  if (!p.vis) return null;
  // keep pinned labels inside the 9:16 safe zone
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: FONT,
        left: Math.min(Math.max(p.x, 200 * s), w - 200 * s),
        top: Math.min(Math.max(p.y, 560 * s), h - 520 * s),
        transform: `translate(${dx}%, ${dy}%) scale(${0.9 + 0.1 * op})`,
        opacity: op,
        background: bg,
        color: fg,
        borderRadius: 12 * s,
        padding: `${10 * s}px ${20 * s}px`,
        fontWeight: 600,
        fontSize: 34 * s,
        whiteSpace: "nowrap",
        textAlign: "center",
        boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.5)`,
        lineHeight: 1.15,
      }}
    >
      {children}
    </div>
  );
};

const Hud: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const s = h / 1920;
  const kick = [...KICK].reverse().find((k) => t >= k.a)!;
  const sub = (txt: string, c = "#C9D3DC", big = false) => (
    <div style={{ fontSize: (big ? 28 : 22) * s, letterSpacing: 2 * s, color: c, fontWeight: 600 }}>{txt}</div>
  );
  // 8:00 countdown starts on "delapan menit"
  const left = Math.max(0, 480 - Math.max(0, t - T.eight));
  const mm = Math.floor(left / 60);
  const ss = Math.floor(left % 60);
  const clockOp = win(t, T.eight - 0.15, T.delapan2 + 3.0, 0.25, 0.4);
  const ggOp = win(t, T.green - 0.1, T.delapan2 - 0.2);
  const eqOp = win(t, T.kali, T.kunci - 0.2);
  const keyOp = win(t, T.kunci, T.lorong - 0.3);
  const calcOp = win(t, T.tetap - 0.1, SEC.PAYOFF[0] - 0.1);
  const denOp = win(t, T.padat - 0.2, T_OUT - 0.3);
  const ruleOp = win(t, T.aturan - 0.15, SEC.OUTRO[0] - 0.1);
  const clockRule = seg(t, T.pintu - 0.3, T.pintu + 0.4);
  const den = densityOf(pitch(t, FT));
  const eqStep = seg(t, T.kali + 0.6, T.kali + 1.4);
  const rate = flowRate(t, FT) / 3;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: FONT }}>
      {/* kicker */}
      <div
        style={{
          position: "absolute",
          top: 262 * s,
          left: 60 * s,
          display: "flex",
          alignItems: "center",
          gap: 14 * s,
          fontSize: 31 * s,
          letterSpacing: 4 * s,
          fontWeight: 600,
          color: P.lane,
          background: "rgba(10,14,20,0.72)",
          padding: `${8 * s}px ${20 * s}px ${8 * s}px ${16 * s}px`,
          borderRadius: 30 * s,
          lineHeight: 1.1,
          opacity: t < OUTRO_AT ? 1 : 0,
        }}
      >
        <span style={{ width: 16 * s, height: 16 * s, borderRadius: 8 * s, background: "#FF5A3C", display: "inline-block" }} />
        AE-062 · {kick.text}
      </div>

      <div style={{ position: "absolute", top: 340 * s, left: 60 * s, display: "flex", flexDirection: "column", gap: 14 * s }}>
        {clockOp > 0.01 && (
          <div style={{ display: "flex", borderRadius: 12 * s, overflow: "hidden", opacity: clockOp, transform: `translateY(${(1 - clockOp) * -20 * s}px)`, boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.5)` }}>
            <div style={{ background: "rgba(8,12,18,0.92)", color: P.lane, fontWeight: 600, fontSize: 76 * s, padding: `${4 * s}px ${22 * s}px`, fontVariantNumeric: "tabular-nums" }}>
              {mm}:{String(ss).padStart(2, "0")}
            </div>
            <div style={{ background: P.lane, color: "#14110A", fontWeight: 600, fontSize: 26 * s, lineHeight: 1.15, padding: `${8 * s}px ${18 * s}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span>KELUAR DARI TRIBUN</span>
              <span style={{ fontSize: 19 * s, opacity: 0.75 }}>{t > T.green ? "GREEN GUIDE (INGGRIS)" : "WAKTU MAKSIMUM"}</span>
            </div>
          </div>
        )}
        {ggOp > 0.01 && (
          <div style={{ ...panel(s, "#40E08C"), opacity: ggOp }}>
            <div style={{ fontSize: 46 * s, fontWeight: 600, color: "#7CF0B0" }}>Green Guide</div>
            {sub("PEDOMAN KESELAMATAN STADION · INGGRIS")}
          </div>
        )}
        {eqOp > 0.01 && (
          <div style={{ ...panel(s, P.lane), opacity: eqOp }}>
            {sub("PER 1 M LEBAR TANGGA")}
            <div style={{ fontSize: 50 * s, fontWeight: 600, marginTop: 4 * s, fontVariantNumeric: "tabular-nums" }}>
              66 × 8 menit <span style={{ opacity: eqStep, color: P.lane }}>= 528 orang</span>
            </div>
            <div style={{ fontSize: 24 * s, color: "#B8C4CF", marginTop: 4 * s, opacity: seg(t, T.kapasitas - 0.2, T.kapasitas + 0.4) }}>
              Jumlahkan semua lebar → kapasitas sektor
            </div>
          </div>
        )}
        {keyOp > 0.01 && (
          <div style={{ ...panel(s, "#FF5A3C"), opacity: keyOp }}>
            {sub("KUNCINYA", "#FF8A6A")}
            <div style={{ fontSize: 44 * s, fontWeight: 600 }}>
              Titik tersempit, <span style={{ color: "#8B98A5", textDecoration: t > T.bukanG ? "line-through" : "none" }}>bukan gerbang terbesar</span>
            </div>
          </div>
        )}
        {calcOp > 0.01 && (
          <div style={{ ...panel(s, "#FF5A3C"), opacity: calcOp }}>
            {sub("LEBAR YANG DIHITUNG", "#FF8A6A")}
            <div style={{ fontSize: 54 * s, fontWeight: 600, display: "flex", gap: 22 * s, alignItems: "baseline" }}>
              <span style={{ color: "#FF6A4C" }}>1,5 m</span>
              <span style={{ fontSize: 36 * s, color: "#8B98A5", textDecoration: "line-through" }}>3 m</span>
            </div>
          </div>
        )}
        {denOp > 0.01 && (
          <div style={{ ...panel(s, den > 5 ? "#FF3B2A" : P.lane), opacity: denOp, width: 620 * s }}>
            {sub("KEPADATAN (ORANG / M²)", "#E6ECF1", true)}
            <div style={{ position: "relative", height: 26 * s, marginTop: 12 * s, borderRadius: 13 * s, background: "linear-gradient(90deg,#2E7D4F,#FFE27A 55%,#FF3B2A 80%)" }}>
              {/* scale 1..6, risk line at ~5 */}
              <div style={{ position: "absolute", left: `${((5 - 1) / 5) * 100}%`, top: -8 * s, bottom: -8 * s, width: 4 * s, background: "#fff", opacity: seg(t, T.lima, T.lima + 0.4) }} />
              <div
                style={{
                  position: "absolute",
                  left: `${((Math.min(6, den) - 1) / 5) * 100}%`,
                  top: -10 * s,
                  width: 0,
                  height: 0,
                  transform: `translateX(-${12 * s}px)`,
                  borderLeft: `${12 * s}px solid transparent`,
                  borderRight: `${12 * s}px solid transparent`,
                  borderTop: `${16 * s}px solid #fff`,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 * s, fontWeight: 600, color: "#E6ECF1", marginTop: 6 * s }}>
              <span>1</span>
              <span style={{ opacity: seg(t, T.lima, T.lima + 0.4), marginLeft: "auto", marginRight: "18%" }}>±5</span>
              <span>6</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginTop: 10 * s }}>
              <span style={{ fontSize: 28 * s, letterSpacing: 2 * s, color: "#E6ECF1", fontWeight: 600, width: 150 * s }}>ALIRAN</span>
              <div style={{ flex: 1, height: 14 * s, background: "rgba(255,255,255,0.12)", borderRadius: 7 * s }}>
                <div style={{ width: `${rate * 100}%`, height: "100%", borderRadius: 7 * s, background: rate > 0.75 ? "#40E08C" : "#FF8A3C" }} />
              </div>
            </div>
            {t > T.risiko - 0.1 && (
              <div style={{ marginTop: 14 * s, display: "inline-block", background: "#E5402C", color: "#FFFFFF", borderRadius: 8 * s, padding: `${6 * s}px ${14 * s}px`, fontSize: 34 * s, fontWeight: 600, opacity: seg(t, T.risiko - 0.15, T.risiko + 0.1) }}>Risiko terhimpit naik tajam</div>
            )}
          </div>
        )}
        {ruleOp > 0.01 && (
          <div style={{ ...panel(s, "#40E08C"), opacity: ruleOp }}>
            {sub("INDONESIA · ATURAN POLISI SEJAK 2022", "#E6ECF1", true)}
            <div style={{ display: "flex", alignItems: "center", gap: 20 * s, marginTop: 10 * s }}>
              {/* match clock: the last 15 of 90 minutes in red, doors open at the wedge */}
              <svg width={110 * s} height={110 * s} viewBox="-55 -55 110 110">
                <circle r="50" fill="#0E151C" stroke="#E8FFF0" strokeWidth="4" />
                <path d={`M0 0 L ${50 * Math.sin((75 / 90) * 2 * Math.PI)} ${-50 * Math.cos((75 / 90) * 2 * Math.PI)} A50 50 0 0 1 0 -50 Z`} fill="#FF5A3C" opacity="0.9" />
                <line x1="0" y1="0" x2={40 * Math.sin((75 / 90) * 2 * Math.PI)} y2={-40 * Math.cos((75 / 90) * 2 * Math.PI)} stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                <circle r="5" fill="#fff" />
              </svg>
              <div>
                <div style={{ fontSize: 40 * s, fontWeight: 600, opacity: 0.35 + 0.65 * clockRule }}>{clockRule > 0.5 ? "Pintu dibuka" : "15 menit terakhir"}</div>
                <div style={{ fontSize: 34 * s, color: P.lane, fontWeight: 600, opacity: seg(t, T.limaBelas - 0.1, T.limaBelas + 0.3) }}>15 menit sebelum laga berakhir</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Labels: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const s = h / 1920;
  const board = t < T_IN || t >= T_OUT;
  const red = "rgba(150,26,14,0.95)";
  const cntNum = Math.round(66 * seg(t, T.enam, T.enam + 0.9));
  if (board) {
    const stop = ROUTE_IN[ROUTE_IN.length - 1];
    const gate = ROUTE_GHOST[ROUTE_GHOST.length - 2];
    return (
      <>
        <Pin t={t} w={w} h={h} at={new THREE.Vector3(0.15, 0.3, 0.3)} op={win(t, T.green + 0.2, T.delapan2 - 0.3)} bg="#2F8F4E" dx={-50} dy={-160}>
          GREEN GUIDE
        </Pin>
        <Pin t={t} w={w} h={h} at={new THREE.Vector3(stop.x, 0.4, stop.z)} op={win(t, T.jalur - 0.1, SEC.MEKANISME[0] - 0.1)} bg={P.lane} fg="#14110A" dx={-60} dy={-110}>
          JALUR KELUAR LANCAR
          <div style={{ fontSize: 20 * s, opacity: 0.75 }}>8 MENIT BERHENTI DI SINI</div>
        </Pin>
        <Pin t={t} w={w} h={h} at={new THREE.Vector3(gate.x, 0.5, gate.z)} op={win(t, T.bukan, SEC.MEKANISME[0] - 0.1)} bg="rgba(7,11,16,0.92)" dx={-70} dy={-140}>
          <span style={{ textDecoration: "line-through", color: "#B8C4CF" }}>sampai luar stadion</span>
        </Pin>
        <Pin t={t} w={w} h={h} at={toWorld("+x", STAIR_TAPE_U, tierTop(7) + 0.06, 0)} op={win(t, T.lebar + 0.5, T.enam - 0.2)} bg={P.lane} fg="#14110A" dx={-50} dy={-150}>
          <span style={{ fontSize: 48 * s }}>1 m</span>
          <div style={{ fontSize: 20 * s, opacity: 0.75 }}>LEBAR TANGGA</div>
        </Pin>
        <Pin t={t} w={w} h={h} at={toWorld("+x", U(6.2), tierTop(6) + 0.06, 0)} op={win(t, T.enam - 0.3, T.datar - 0.3)} bg="rgba(7,11,16,0.92)" dx={-50} dy={-140}>
          <span style={{ fontSize: 58 * s, color: P.lane, fontVariantNumeric: "tabular-nums" }}>{cntNum}</span>
          <div style={{ fontSize: 22 * s, color: "#B8C4CF" }}>ORANG / MENIT · TANGGA 1 m</div>
        </Pin>
        <Pin t={t} w={w} h={h} at={toWorld("+x", CONC_MID, 0.12, CONC_TAPE_V)} op={win(t, T.datar + 0.1, T.kali + 0.3)} bg="rgba(7,11,16,0.92)" dx={-50} dy={-150}>
          <span style={{ fontSize: 58 * s, color: "#7CF0B0" }}>82</span>
          <div style={{ fontSize: 22 * s, color: "#B8C4CF" }}>ORANG / MENIT · DATAR 1 m</div>
        </Pin>
        <Pin t={t} w={w} h={h} at={toWorld("+x", U(4), tierTop(8) + 0.25, 0)} op={win(t, T.kapasitas, T.kunci + 0.6)} bg={P.lane} fg="#14110A" dx={-50} dy={-130}>
          KAPASITAS SEKTOR
        </Pin>
        <Pin t={t} w={w} h={h} at={new THREE.Vector3(VOM_P[0], VOM_P[1] + 0.3, VOM_P[2])} op={win(t, T.titik2 - 0.2, OUTRO_AT + 0.4)} bg={red} dx={-70} dy={-130}>
          <span style={{ fontSize: 42 * s }}>TITIK PALING SEMPIT</span>
          <div style={{ fontSize: 20 * s, color: "#FFD1C7" }}>DI SINI KAPASITAS DIHITUNG</div>
        </Pin>
      </>
    );
  }
  return (
    <>
      <Pin t={t} w={w} h={h} at={new THREE.Vector3(0, C.floorY + 0.7, 0)} op={win(t, T.titik - 0.1, SEC.PAYOFF[0] + 1.2)} bg={red} dx={-50} dy={-120}>
        {t < T.lorong ? "TITIK TERSEMPIT" : "LORONG 1,5 m"}
      </Pin>
      <Pin t={t} w={w} h={h} at={new THREE.Vector3(C.gate.x + 0.3, C.floorY + 0.95, 0)} op={win(t, T.bukanG - 0.1, SEC.PAYOFF[0] - 0.1)} bg={t < T.gerbang3 ? "rgba(7,11,16,0.92)" : "#1F7A4A"} dx={-50} dy={-110}>
        {t < T.gerbang3 ? "GERBANG TERBESAR" : "GERBANG 3 m"}
      </Pin>
      <Pin t={t} w={w} h={h} at={new THREE.Vector3(-2.8, C.floorY + 0.4, -2.0)} op={win(t, T.padat + 0.3, T_OUT - 0.4)} bg="rgba(7,11,16,0.92)" dx={-50} dy={-110}>
        GRID 1 m²
      </Pin>
    </>
  );
};

// ------------------------------------------------------------------ karaoke captions
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

const Captions: React.FC<{ t: number; h: number }> = ({ t, h }) => {
  const s = h / 1920;
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  // one line if short; otherwise two lines balanced by characters, never one word alone on line 2
  const chars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
  let cut = n;
  if (n > 4 || chars > 24) {
    let best = 1e9;
    for (let i = 1; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (chars - a));
      if (diff < best) {
        best = diff;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 420 * s, display: "flex", justifyContent: "center", pointerEvents: "none", fontFamily: FONT }}>
      <div
        style={{
          background: "rgba(7,11,16,0.84)",
          borderRadius: 16 * s,
          padding: `${14 * s}px ${30 * s}px`,
          borderBottom: `${5 * s}px solid ${P.lane}`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 14 * s}px)`,
          textAlign: "center",
          maxWidth: 940 * s,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.22 }}>
            {ln.map((wd, wi) => {
              const active = t >= wd.s && t < (ch.words[ch.words.indexOf(wd) + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.12 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    margin: `0 ${9 * s}px`,
                    fontSize: 54 * s,
                    fontWeight: 600,
                    color: active ? P.lane : done ? "#F4F7FA" : "rgba(244,247,250,0.55)",
                    transform: `scale(${bump}) translateY(${active ? -3 * s : 0}px)`,
                  }}
                >
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
export const Ep062Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const board = t < T_IN || t >= T_OUT;
  const cam = camOf(t);
  const focus = Math.hypot(cam.pos[0] - cam.tgt[0], cam.pos[1] - cam.tgt[1], cam.pos[2] - cam.tgt[2]);
  // dip through the dark vomitory on both zoom-throughs
  const dip = Math.max(1 - Math.abs(t - T_IN) / 0.32, 1 - Math.abs(t - T_OUT) / 0.3, 0);
  const doorOpen = seg(t, T.pintu - 0.1, T.pintu + 0.8);
  const narrowOn = seg(t, T.titik - 0.2, T.titik + 0.4);
  const gateOn = seg(t, T.gerbang3 - 0.2, T.gerbang3 + 0.4) * (1 - seg(t, SEC.PAYOFF[0], SEC.PAYOFF[0] + 0.6));
  const gridOn = seg(t, T.padat - 0.2, T.padat + 0.6);
  const heatOn = seg(t, T.padat + 0.6, T.lima + 0.4);
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: FOV, near: 0.05, far: 160, position: [0, 20, 20] }}>
        <CameraRig t={t} />
        <color attach="background" args={[P.void]} />
        <fog attach="fog" args={[P.void, 34, 62]} />
        <ambientLight intensity={0.3} color="#DDE6F0" />
        <hemisphereLight args={["#CFE0FF", "#1A2A10", 0.5]} />
        <directionalLight
          position={[-6, 14, 7]}
          intensity={2.5}
          color={P.flood}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={1}
          shadow-camera-far={45}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[8, 6, -10]} intensity={0.85} color="#9CC3FF" />
        {board ? (
          <group>
            <StadiumBoard t={t} hero={HERO} film doors={t >= T_OUT} doorOpen={doorOpen} />
            <BoardFlow t={t} />
            <BoardExtras t={t} />
          </group>
        ) : (
          <Corridor t={t} ft={FT} narrowOn={narrowOn} gateOn={gateOn} gridOn={gridOn} heatOn={heatOn} />
        )}
        <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} focus={focus} aperture={0.0045} maxBlur={0.007} />
      </ThreeCanvas>
      {dip > 0 && <AbsoluteFill style={{ background: "#020305", opacity: Math.min(1, dip * 1.2) }} />}
      <Labels t={t} w={width} h={height} />
      <Hud t={t} w={width} h={height} />
      <Captions t={t} h={height} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
