// AE-063 3D scenes: one component per narrative section (multi-scene law).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import {
  Arrow, BikeWheel, Board, Bowl, C, CableRoof, Columns, Crowd, Ground, innerPoint, JIS, N_RAD, outerPoint, People, Pitch, rng, Rod,
  SpaceFrame, STUTT, sup, Trees, type Mats, type RoofState, type Seat, type V3,
} from "./world.tsx";

export const BOARD_POS: V3 = [0, 11.2, -29.0];

/** Shared full stadium (hook, mekanisme, outro). */
export const Stadium: React.FC<{ m: Mats; f: number; roof: RoofState; crowd?: boolean; board?: boolean; trees?: boolean; sign?: boolean }> = ({ m, f, roof, crowd = true, board = true, trees = true, sign = true }) => (
  <group>
    <Ground m={m} P={STUTT} />
    <Pitch m={m} />
    <Bowl m={m} P={STUTT} />
    {crowd && <Crowd P={STUTT} f={f} />}
    <Columns m={m} P={STUTT} />
    <CableRoof m={m} P={STUTT} s={roof} />
    {trees && <Trees m={m} P={STUTT} />}
    {board && <Board lines={["AUDIRA"]} pos={BOARD_POS} w={7} />}
    {board && sign && (
      <group position={[-7, 0, 37]} rotation={[0, 0.1, 0]}>
        <Rod a={[-3.6, 0, 0]} b={[-3.6, 3.4, 0]} r={0.16} mat={m.steel} />
        <Rod a={[3.6, 0, 0]} b={[3.6, 3.4, 0]} r={0.16} mat={m.steel} />
        <Board lines={["AUDIRA", "stadion atap kabel"]} pos={[0, 4.3, 0]} w={9} h={2.8} />
      </group>
    )}
    <AssetModel id="match-goal-a98b60" size={3.2} ground position={[0, 0.05, -12.6]} polish="toyPlastic" />
    <AssetModel id="match-goal-a98b60" size={3.2} ground position={[0, 0.05, 12.6]} rotation={[0, Math.PI, 0]} polish="toyPlastic" />
    {[[-30, -36], [30, -36], [-30, 36], [30, 36]].map(([x, z], i) => (
      <AssetModel key={i} id="floodlight-mast-4482be" size={16} ground position={[x, 0, z]} rotation={[0, Math.atan2(-x, -z), 0]} />
    ))}
  </group>
);

export const FULL_ROOF: RoofState = { inner: 1, outer: 1, cables: N_RAD, membrane: N_RAD };

// ---------------- HOOK extra: bicycle on the plaza ----------------
export const BIKE_POS: V3 = [2, 0, 45];
export const WHEEL_R = 0.9;
export const WHEEL_C: V3 = [BIKE_POS[0], 1.06, BIKE_POS[2]];
/** Hero spoked wheel (rim, 32 spokes, hub) in a fork on a repair stand, the bicycle GLB behind it. */
export const HookBike: React.FC<{ m: Mats; f: number }> = ({ m, f }) => (
  <group>
    <AssetModel id="city-bicycle-5b67d1" size={1.9} ground position={[BIKE_POS[0] + 1.7, 0, BIKE_POS[2] + 3.2]} rotation={[0, 1.2, 0]} polish="toyPlastic" />
    <group position={WHEEL_C} rotation={[0, 0.42, 0]}>
      {/* wheel stands upright, facing the camera (axis along z) and turns slowly */}
      <group rotation={[Math.PI / 2, f * 0.012, 0]}>
        <BikeWheel m={m} r={WHEEL_R} />
      </group>
      {/* fork blades from the hub up to the crown */}
      {[-0.07, 0.07].map((z) => (
        <Rod key={z} a={[0, 0, z]} b={[0.12, WHEEL_R + 0.28, z * 0.6]} r={0.022} mat={m.chrome} />
      ))}
      <Rod a={[0.12, WHEEL_R + 0.26, 0]} b={[0.13, WHEEL_R + 0.34, 0]} r={0.04} mat={m.chrome} />
      {/* repair stand: axle clamp at hub height on a tripod (nothing above the wheel but the fork) */}
      <Rod a={[0, 0, 0.1]} b={[0, 0, 0.45]} r={0.03} mat={m.steel} />
      <Rod a={[0, 0, 0.45]} b={[0.75, 0, 0.45]} r={0.03} mat={m.steel} />
      <Rod a={[0.75, 0.05, 0.45]} b={[0.75, -1.06, 0.45]} r={0.035} mat={m.steel} />
      {[0, 2.1, 4.2].map((a) => (
        <Rod key={a} a={[0.75, -0.55, 0.45]} b={[0.75 + Math.cos(a) * 0.5, -1.06, 0.45 + Math.sin(a) * 0.5]} r={0.025} mat={m.steel} />
      ))}
    </group>
  </group>
);

// ---------------- KONTEKS: sliced tribune ----------------
export const SEC_ROWS = 8;
const ROOF_BASE: V3 = [0, 10.6, 8.8];
const SEG = 1.75;
const NSEG = 8;
/** Points along the cantilever from the back column toward the pitch (-z), drooping with `bend`. */
export const roofChain = (bend: number): V3[] => {
  const pts: V3[] = [ROOF_BASE];
  let ang = 0;
  for (let i = 0; i < NSEG; i++) {
    ang += bend * 0.032 * (i + 1);
    const p = pts[pts.length - 1];
    pts.push([0, p[1] - Math.sin(ang) * SEG, p[2] - Math.cos(ang) * SEG]);
  }
  return pts;
};
export const SightEye: V3 = [0.6, 3.55, 3.4];

/** Cantilever girders + roof deck along a chain (shared by the cut stand and the far stand). */
const RoofDeck: React.FC<{ m: Mats; chain: V3[]; xs: number[]; w: number; mat?: THREE.Material; deck?: THREE.Material }> = ({ m, chain, xs, w, mat, deck }) => (
  <group>
    {xs.map((x) =>
      chain.slice(0, -1).map((p, i) => (
        <Rod key={`${x}-${i}`} a={[x, p[1], p[2]]} b={[x, chain[i + 1][1], chain[i + 1][2]]} r={0.28 - i * 0.02} mat={mat ?? m.steel} />
      )),
    )}
    {chain.slice(0, -1).map((p, i) => {
      const q = chain[i + 1];
      const mid: V3 = [0, (p[1] + q[1]) / 2 + 0.3, (p[2] + q[2]) / 2];
      const ang = Math.atan2(p[1] - q[1], p[2] - q[2]);
      return (
        <mesh key={`d${i}`} position={mid} rotation={[ang, 0, 0]} material={deck ?? m.membrane} castShadow receiveShadow>
          <RoundedBoxGeo args={[w, 0.14, SEG * 1.18]} radius={0.05} />
        </mesh>
      );
    })}
  </group>
);

/** Stepped stand block (rows rise toward +z), with a seated crowd facing the pitch (-z). */
const StandBlock: React.FC<{ m: Mats; f: number; w: number; seed: number; fill?: number }> = ({ m, f, w, seed, fill = 0.86 }) => {
  const geoRows = useMemo(() => Array.from({ length: SEC_ROWS }, (_, j) => ({ z: j * 1.0 + 0.5, y: 0.5 + j * 0.75 })), []);
  const seats = useMemo(() => {
    const r = rng(seed);
    const out: Seat[] = [];
    for (let j = 0; j < SEC_ROWS; j++) {
      const top = 0.875 + j * 0.75;
      for (let x = -w / 2 + 0.45; x <= w / 2 - 0.45; x += 0.62) {
        if (r() > fill) continue;
        out.push({ p: [x + (r() - 0.5) * 0.12, top, j + 0.55], h: Math.PI + (r() - 0.5) * 0.3, ph: r() * 6.28 });
      }
    }
    return out;
  }, [w, seed, fill]);
  return (
    <group>
      {geoRows.map((r, j) => (
        <mesh key={j} position={[0, r.y / 2 + 0.375 / 2, r.z]} material={j % 2 ? m.concrete : m.concreteDark} castShadow receiveShadow>
          <RoundedBoxGeo args={[w, r.y + 0.375, 1.0]} radius={0.05} />
        </mesh>
      ))}
      <mesh position={[0, 3.4, 8.3]} material={m.concrete} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, 6.8, 0.6]} radius={0.08} />
      </mesh>
      <People seats={seats} s={1.05} seed={seed} f={f} cast />
    </group>
  );
};

/** Ghost of the drooping roof + downward load arrows at the cantilever tip. */
const TipLoad: React.FC<{ m: Mats; k: number; bend: number; f: number }> = ({ m, k, bend, f }) => {
  if (k <= 0.01) return null;
  const droop = roofChain(1);
  const tip = roofChain(bend)[NSEG];
  const pulse = 1 + 0.08 * Math.sin(f * 0.2);
  return (
    <group>
      {bend < 0.9 &&
        droop.slice(0, -1).map((p, i) => <Rod key={`dg${i}`} a={[0, p[1] + 0.3, p[2]]} b={[0, droop[i + 1][1] + 0.3, droop[i + 1][2]]} r={0.11} mat={m.danger} cast={false} />)}
      {[-6, 0, 6].map((x) => (
        <Arrow key={x} from={[x, tip[1] + 4.2 * k, tip[2] + 0.4]} dir={[0, -1, 0]} len={3.2 * k * pulse} mat={m.danger} r={0.2} />
      ))}
    </group>
  );
};

/** Another stand of the same stadium (context), with its own straight cantilever on edge columns. */
const FarStand: React.FC<{ m: Mats; f: number; pos: V3; rotY: number; seed: number }> = ({ m, f, pos, rotY, seed }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <StandBlock m={m} f={f} w={60} seed={seed} fill={0.8} />
    {[-24, -12, 0, 12, 24].map((x) => (
      <mesh key={x} position={[x, ROOF_BASE[1] / 2, ROOF_BASE[2]]} material={m.concrete} castShadow>
        <cylinderGeometry args={[0.45, 0.6, ROOF_BASE[1], 16]} />
      </mesh>
    ))}
    <RoofDeck m={m} chain={roofChain(0)} xs={[-24, -12, 0, 12, 24]} w={59.6} />
  </group>
);

export const SectionScene: React.FC<{ m: Mats; f: number; bend: number; ghost: number; backGlow: number; load?: number }> = ({ m, f, bend, ghost, backGlow, load = 0 }) => {
  const chain = roofChain(bend);
  const straight = roofChain(0);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={m.land} receiveShadow>
        <circleGeometry args={[300, 48]} />
      </mesh>
      {/* pitch between the cut stand and the opposite stand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14, 0.03, -20]} material={m.grass} receiveShadow>
        <planeGeometry args={[90, 40]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -1.2]} material={m.lines}>
        <planeGeometry args={[40, 0.14]} />
      </mesh>
      {/* stepped stand (cut section) */}
      <StandBlock m={m} f={f} w={16} seed={31} />
      <ToyPerson f={f} seed={21} pose="cheer" position={[SightEye[0], 0.5 + 3 * 0.75 + 0.375, 3.5]} heading={Math.PI} scale={1.25} />
      {/* opposite side of the stadium: same kind of stand + cantilever, across the pitch (context, fogged) */}
      <FarStand m={m} f={f} pos={[0, 0, -40]} rotY={Math.PI} seed={57} />
      <FarStand m={m} f={f} pos={[44, 0, -14]} rotY={Math.PI / 2} seed={73} />
      {/* back columns: the only supports (edge) */}
      {[-6, 0, 6].map((x) => (
        <mesh key={x} position={[x, ROOF_BASE[1] / 2, ROOF_BASE[2]]} material={backGlow > 0.5 ? m.support : m.concrete} castShadow>
          <cylinderGeometry args={[0.45, 0.6, ROOF_BASE[1], 16]} />
        </mesh>
      ))}
      {/* cantilever girders + roof deck, bending */}
      <RoofDeck m={m} chain={chain} xs={[-6, 0, 6]} w={15.6} />
      <TipLoad m={m} k={load} bend={bend} f={f} />
      {/* ghost of the straight roof while it bends */}
      {bend > 0.05 &&
        straight.slice(0, -1).map((p, i) => <Rod key={`g${i}`} a={[0, p[1] + 0.6, p[2]]} b={[0, straight[i + 1][1] + 0.6, straight[i + 1][2]]} r={0.08} mat={m.ghost} cast={false} />)}
      {/* old-style column in front of the spectators (crossed out) */}
      {ghost > 0.01 && (
        <mesh position={[0.6, 5.2, -0.4]}>
          <cylinderGeometry args={[0.5, 0.6, 10.4, 16]} />
          <meshPhysicalMaterial color="#ff4b3e" emissive="#ff4b3e" emissiveIntensity={0.5} transparent opacity={0.6 * ghost} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

// ---------------- REVEAL: force model on a blueprint table ----------------
export const BlueprintFloor: React.FC = () => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#e7f1f5";
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(47,141,255,0.35)";
    g.lineWidth = 2;
    for (let i = 0; i <= 512; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
    }
    g.strokeStyle = "rgba(47,141,255,0.15)";
    g.lineWidth = 1;
    for (let i = 0; i <= 512; i += 16) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(24, 24);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
};

export type ForceState = { pull: number; push: number; cancel: number; weight: number; cols: number; pulse: number };
const ARROW_IDX = [0, 5, 10, 15, 20, 25, 30, 35];
export const ForceScene: React.FC<{ m: Mats; s: ForceState; f: number }> = ({ m, s, f }) => {
  const P = STUTT;
  const shrink = 1 - s.cancel;
  return (
    <group>
      <BlueprintFloor />
      {/* plan outline of the bowl on the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, P.standOut[1] / P.standOut[0], 1]}>
        <ringGeometry args={[P.standOut[0] - 0.25, P.standOut[0] + 0.25, 128]} />
        <meshBasicMaterial color={C.tension} transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, P.standIn[1] / P.standIn[0], 1]}>
        <ringGeometry args={[P.standIn[0] - 0.2, P.standIn[0] + 0.2, 128]} />
        <meshBasicMaterial color={C.tension} transparent opacity={0.35} />
      </mesh>
      <CableRoof m={m} P={P} s={{ inner: 1, outer: 1, cables: N_RAD, membrane: s.weight > 0 ? N_RAD : 0, colour: true }} />
      {/* perimeter columns rise (only vertical load) */}
      {s.cols > 0 && (
        <group scale={[1, Math.max(0.001, s.cols), 1]}>
          <Columns m={m} P={P} mat={m.support} h={P.ringLow} />
        </group>
      )}
      {/* tension: cables pull the inner ring outward */}
      {ARROW_IDX.map((i) => {
        const a = innerPoint(P, i);
        const o = outerPoint(P, i);
        const d: V3 = [o[0] - a[0], 0, o[2] - a[2]];
        const pulse = 1 + 0.12 * Math.sin(f * 0.25) * s.pulse;
        return <Arrow key={`t${i}`} from={[a[0], a[1] + 1.2, a[2]]} dir={d} len={8 * s.pull * shrink * pulse} mat={m.tension} r={0.5} />;
      })}
      {/* compression: outer ring pushed inward */}
      {ARROW_IDX.map((i) => {
        const o = outerPoint(P, i);
        const a = innerPoint(P, i);
        const d: V3 = [a[0] - o[0], 0, a[2] - o[2]];
        const L = 8 * s.push * shrink;
        const dn = Math.hypot(d[0], d[2]);
        const start: V3 = [o[0] - (d[0] / dn) * (L + 0.8), o[1] + 1.4, o[2] - (d[2] / dn) * (L + 0.8)];
        return <Arrow key={`c${i}`} from={start} dir={d} len={L} mat={m.compress} r={0.5} />;
      })}
      {/* columns carry only downward load */}
      {s.cols > 0.6 &&
        [0, 10, 20, 30].map((i) => {
          const o = outerPoint(P, i, true);
          return <Arrow key={`w${i}`} from={[o[0], o[1] + 6.5, o[2]]} dir={[0, -1, 0]} len={4.5 * (s.cols - 0.6) / 0.4} mat={m.support} r={0.3} />;
        })}
      <Board lines={["AUDIRA", "model gaya atap kabel"]} pos={[0, 1.6, 34]} w={9} rotY={0} />
    </group>
  );
};

// ---------------- PAYOFF: JIS space frame lifted from 16 points ----------------
export const LIFT_REST = 6.4;
export const LIFT_TOP = 17.5;
export const liftPoints = (): V3[] =>
  Array.from({ length: 16 }, (_, i) => {
    const th = ((i + 0.5) / 16) * Math.PI * 2;
    const mid: [number, number] = [(JIS.ringIn[0] + JIS.colR[0]) / 2 + 1.5, (JIS.ringIn[1] + JIS.colR[1]) / 2 + 1.5];
    return sup(mid[0], mid[1], th, 0, JIS.p);
  });

const LiftTower: React.FC<{ m: Mats; p: V3; h: number; hot: number }> = ({ m, p, h, hot }) => (
  <group position={p}>
    {[[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].map(([x, z], i) => (
      <mesh key={i} position={[x, h / 2, z]} material={m.yellow} castShadow>
        <RoundedBoxGeo args={[0.22, h, 0.22]} radius={0.05} />
      </mesh>
    ))}
    {Array.from({ length: Math.floor(h / 2) }, (_, i) => (
      <mesh key={`b${i}`} position={[0, 1 + i * 2, 0]} material={m.yellow}>
        <RoundedBoxGeo args={[1.1, 0.14, 1.1]} radius={0.04} />
      </mesh>
    ))}
    <mesh position={[0, h + 0.4, 0]} material={hot > 0 ? m.compress : m.steel} castShadow>
      <RoundedBoxGeo args={[1.6, 0.8, 1.6]} radius={0.12} />
    </mesh>
  </group>
);

export const JisScene: React.FC<{ m: Mats; f: number; built: number; lift: number; hot: number }> = ({ m, f, built, lift, hot }) => {
  const y = LIFT_REST + (LIFT_TOP - LIFT_REST) * lift;
  const pts = liftPoints();
  return (
    <group>
      <Ground m={m} P={JIS} />
      <Pitch m={m} />
      <Bowl m={m} P={JIS} maxRows={12} />
      <Crowd P={JIS} f={f} fill={0} />
      <Columns m={m} P={JIS} n={36} h={JIS.ringLow} />
      <Trees m={m} P={JIS} seed={9} />
      <group position={[0, y, 0]}>
        <SpaceFrame m={m} P={JIS} built={built} />
      </group>
      {pts.map((p, i) => (
        <group key={i}>
          <LiftTower m={m} p={p} h={LIFT_TOP + 2.2} hot={i < hot ? 1 : 0} />
          {/* strand cable from the jack down to the frame */}
          <Rod a={[p[0], LIFT_TOP + 2.2, p[2]]} b={[p[0], y + 0.1, p[2]]} r={0.07} mat={i < hot ? m.compress : m.cable} cast={false} />
        </group>
      ))}
      <AssetModel id="mobile-crane-671d3f" size={14} ground position={[34, 0, 22]} rotation={[0, -2.2, 0]} />
    </group>
  );
};

export const BikeOverlay: React.FC<{ m: Mats; k: number; y: number }> = ({ m, k, y }) =>
  k > 0.01 ? (
    <group position={[0, y, 0]} scale={[STUTT.colR[0] / 27, 1, STUTT.colR[1] / 27]}>
      <BikeWheel m={m} r={27} colour opacity={0.55 * k} />
    </group>
  ) : null;
