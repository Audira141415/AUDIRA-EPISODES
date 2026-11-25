// EP053 film world (VOXELVERSE). The cover's crossroads, rebuilt for motion: a motorcycle box ahead of the
// car stop line, inductive loops under the first car of every approach, vehicles as separate models so
// the south queue can drive off on its green, signals whose state is a pure function of time `t` (seconds
// on the VO clock), a green wave of four mid-block signals timed to the platoon's arrival, a 321-junction
// map board for the payoff and a control room with two operators. Left-hand traffic (Indonesia).

import React, { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, InstancedMesh, LinearFilter, Matrix4, MeshBasicMaterial, Object3D, PerspectiveCamera, Vector3, Quaternion, SRGBColorSpace, BoxGeometry } from "three";
import { C } from "../../kits/voxelverse/lib/palette";
import { GlowPanes, VoxModel, type Pane } from "../../kits/voxelverse/lib/components";
import type { V3, Vox } from "../../kits/voxelverse/lib/voxel";
import { shrub } from "../../kits/voxelverse/lib/kit";
import { radialTex } from "../../kits/voxelverse/lib/textures";
import { FX_LAYER } from "../../kits/voxelverse/lib/layers";
import { hash } from "../../kits/voxelverse/core/noise";
import type { CamState } from "../../kits/voxelverse/camera/rig";
import { Buildings, type BuildingSpec, type GlowFn, type Placement } from "../../kits/voxelverse/world/Building";
import { FONT } from "../../core/type/fonts";
import { TM } from "./times";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/* ------------------------------------------------------------------ layout */
export const P = { minX: -16, maxX: 16, minZ: -62, maxZ: 44, road: 3.2, walk: 5.2, curb: 0.15, base: 3.0 };
export const STOP = 6.3; // motorcycle stop line, signal poles
export const STOP_CAR = 10.6; // car stop line behind the motorcycle box
const ZEBRA: [number, number] = [3.6, 5.8];
export const LANE = 1.6;
export const WAVE_Z = [-19.5, -30.5, -41.5, -52.5];
export const LOOPS = [STOP_CAR + 1.3, STOP_CAR + 3.6];

export type ArmName = "S" | "N" | "E" | "W";
type Arm = { name: ArmName; dir: [number, number]; rotY: number; laneAt: (d: number) => [number, number]; cars: string[]; bikes: number };
export const ARMS: Arm[] = [
  { name: "S", dir: [0, -1], rotY: Math.PI, laneAt: (d) => [-LANE, d], cars: ["sedan", "angkot", "mpv", "sedan", "truck", "mpv"], bikes: 6 },
  { name: "N", dir: [0, 1], rotY: 0, laneAt: (d) => [LANE, -d], cars: ["mpv", "sedan", "angkot", "sedan"], bikes: 2 },
  { name: "E", dir: [-1, 0], rotY: -Math.PI / 2, laneAt: (d) => [d, LANE], cars: [], bikes: 0 },
  { name: "W", dir: [1, 0], rotY: Math.PI / 2, laneAt: (d) => [-d, -LANE], cars: ["mpv", "sedan"], bikes: 1 },
];
export const ARM = (n: ArmName) => ARMS.find((a) => a.name === n)!;

export const rotate = (rotY: number, [x, y, z]: V3): V3 => {
  const c = Math.cos(rotY), s = Math.sin(rotY);
  return [x * c + z * s, y, -x * s + z * c];
};
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* ------------------------------------------------------------------ vehicles + kinematics */
export type Vehicle = { id: number; arm: ArmName; kind: string; d0: number; lat: number; color: number; seed: number; rank: number; len: number };
const BODY = [C.cream, C.teal, 0xb8beb8, C.copper, 0x8f2f2a, C.stoneDark, 0xe7e2d6, C.tealDeep];
const ANGKOT = [0x2f7fb0, 0x3f9a6a, 0xd6a12c];
const LEN: Record<string, number> = { sedan: 4.1, mpv: 4.4, angkot: 4.3, truck: 5.6, bike: 1.5 };
export const VEHICLES: Vehicle[] = [];
ARMS.forEach((a, ai) => {
  let rank = 0;
  for (let b = 0; b < a.bikes; b++) {
    const row = Math.floor(b / 3);
    const col = b % 3;
    const lat = a.bikes === 1 ? 0 : (col - 1) * 0.95;
    VEHICLES.push({ id: VEHICLES.length, arm: a.name, kind: "bike", d0: STOP + 1.1 + row * 2.0, lat, color: [C.orange, 0x2a2f33, 0xb0352c, C.cream, 0x3d4e7a, C.teal][(ai + b) % 6], seed: ai * 10 + b, rank: row, len: 1.5 });
    rank = row + 1;
  }
  let d = STOP_CAR + 0.3;
  a.cars.forEach((kind, i) => {
    const L = LEN[kind];
    const seed = ai * 31 + i * 7 + 3;
    const color = kind === "angkot" ? ANGKOT[Math.floor(hash(seed) * ANGKOT.length)] : BODY[Math.floor(hash(seed * 3) * BODY.length)];
    VEHICLES.push({ id: VEHICLES.length, arm: a.name, kind, d0: d + L / 2, lat: 0, color, seed, rank: rank + i, len: L });
    d += L + 1.15;
  });
});

/** Distance covered since the queue started to move: accelerate, then cruise. */
const ACC = 2.6, VMAX = 9.5;
const travel = (tau: number) => {
  if (tau <= 0) return 0;
  const tA = VMAX / ACC;
  return tau < tA ? 0.5 * ACC * tau * tau : 0.5 * ACC * tA * tA + VMAX * (tau - tA);
};
const travelInv = (s: number) => {
  const tA = VMAX / ACC, sA = 0.5 * ACC * tA * tA;
  return s < sA ? Math.sqrt((2 * s) / ACC) : tA + (s - sA) / VMAX;
};
const startDelay = (v: Vehicle) => v.rank * 0.45;

/** Distance from the centre along the approach (negative = past the centre, driving away). */
export const vehicleD = (v: Vehicle, t: number) => (v.arm === "S" ? v.d0 - travel(t - TM.go - startDelay(v)) : v.d0);
export const vehiclePos = (v: Vehicle, t: number): V3 => {
  const a = ARM(v.arm);
  const [x, z] = a.laneAt(vehicleD(v, t));
  return a.dir[0] === 0 ? [x + v.lat, 0, z] : [x, 0, z + v.lat];
};
export const S_VEHICLES = VEHICLES.filter((v) => v.arm === "S");
const LEAD_CAR = S_VEHICLES.find((v) => v.kind !== "bike")!;
/** Green wave: each mid-block signal turns green 1.2 s before the first car of the platoon reaches it. */
export const WAVE_GREEN_AT: number[] = WAVE_Z.map(() => 0);
// d(head) for a mid-block head at z+1.6 on the −Z road is −(z + 1.6) from the centre (negative d = −Z side)
for (let i = 0; i < WAVE_Z.length; i++) {
  const headD = WAVE_Z[i] + 1.6; // z of the head; the S lane coordinate z equals d
  WAVE_GREEN_AT[i] = TM.go + startDelay(LEAD_CAR) + travelInv(LEAD_CAR.d0 - headD) - 1.2;
}

const GLASS = 0x1e2a2d;
const carModel = (c: Vehicle) => (v: Vox) => {
  const L = LEN[c.kind];
  const hl = L / 2;
  const W = c.kind === "truck" ? 1.95 : c.kind === "angkot" ? 1.65 : 1.75;
  const hw = W / 2;
  const body = c.color;
  const dark = 0x2a2e30;
  for (const sx of [-1, 1]) for (const z of [-hl + 0.85, hl - 0.85]) v.prismAlong([sx * (hw - 0.12), 0.33, z], [1, 0, 0], 0.33, 0.26, 0x1b1e1f, { sides: 10, mat: "satin" });
  if (c.kind === "truck") {
    v.span([-hw, 0.36, hl - 1.6], [hw, 1.25, hl], body, { mat: "satin" });
    v.span([-hw + 0.06, 1.25, hl - 1.45], [hw - 0.06, 2.05, hl - 0.2], body, { mat: "satin" });
    v.span([-hw + 0.1, 1.32, hl - 0.22], [hw - 0.1, 1.95, hl - 0.17], GLASS, { mat: "gloss" });
    v.span([-hw - 0.02, 1.38, hl - 1.3], [hw + 0.02, 1.92, hl - 0.6], GLASS, { mat: "gloss" });
    v.span([-hw - 0.05, 0.5, -hl], [hw + 0.05, 2.75, hl - 1.7], 0xd9d2c2, { mat: "matte", jitter: 0.02 });
    for (let z = -hl + 0.3; z < hl - 1.8; z += 0.6) v.span([-hw - 0.08, 0.6, z], [hw + 0.08, 2.65, z + 0.06], 0xb9b1a0, { mat: "matte" });
    v.span([-hw, 0.3, -hl - 0.05], [hw, 0.48, hl + 0.05], dark, { mat: "satin" });
    return;
  }
  const tall = c.kind === "mpv" || c.kind === "angkot";
  const beltY = 0.92;
  const roofY = tall ? 1.85 : 1.45;
  v.span([-hw, 0.3, -hl + 0.1], [hw, beltY, hl - 0.1], body, { mat: "satin" });
  v.span([-hw + 0.04, 0.28, hl - 0.15], [hw - 0.04, 0.55, hl + 0.02], dark, { mat: "satin" });
  v.span([-hw + 0.04, 0.28, -hl - 0.02], [hw - 0.04, 0.55, -hl + 0.15], dark, { mat: "satin" });
  const cf = tall ? hl - 0.9 : hl - 1.35;
  const cb = tall ? -hl + 0.2 : -hl + 0.8;
  v.span([-hw + 0.08, beltY, cb], [hw - 0.08, roofY - 0.08, cf], GLASS, { mat: "gloss" });
  v.span([-hw + 0.04, roofY - 0.1, cb + 0.05], [hw - 0.04, roofY, cf - 0.2], body, { mat: "satin" });
  for (const sx of [-1, 1]) {
    const x = sx * hw - 0.08 * sx;
    v.span([x - 0.04, beltY, cf - 0.12], [x + 0.04, roofY - 0.05, cf], body, { mat: "satin" });
    v.span([x - 0.04, beltY, cb], [x + 0.04, roofY - 0.05, cb + 0.12], body, { mat: "satin" });
    v.span([x - 0.04, beltY, (cf + cb) / 2 - 0.06], [x + 0.04, roofY - 0.05, (cf + cb) / 2 + 0.06], body, { mat: "satin" });
  }
  v.span([-hw + 0.06, beltY - 0.02, cf], [hw - 0.06, beltY + 0.06, hl - 0.2], body, { mat: "satin" });
  if (c.kind === "angkot") {
    for (const sx of [-1, 1]) v.span([sx * hw - 0.02, 0.62, -hl + 0.15], [sx * hw + 0.02 * sx, 0.74, hl - 0.15], 0xe8e0cc, { mat: "satin" });
    v.span([-hw + 0.2, roofY, cb + 0.3], [hw - 0.2, roofY + 0.06, cf - 0.4], 0x2a2e30, { mat: "metal" });
  }
  for (const sx of [-1, 1]) v.span([sx * (hw + 0.02) - 0.08, beltY + 0.05, cf - 0.3], [sx * (hw + 0.02) + 0.08, beltY + 0.18, cf - 0.15], body, { mat: "satin" });
};

const bikeModel = (b: Vehicle) => (v: Vox) => {
  for (const z of [-0.62, 0.62]) v.prismAlong([0, 0.3, z], [1, 0, 0], 0.3, 0.1, 0x1b1e1f, { sides: 10, mat: "satin" });
  v.span([-0.16, 0.35, -0.65], [0.16, 0.72, 0.45], b.color, { mat: "satin" });
  v.span([-0.18, 0.72, -0.6], [0.18, 0.82, 0.05], 0x222628, { mat: "fabric" });
  v.span([-0.12, 0.6, 0.45], [0.12, 1.05, 0.65], b.color, { mat: "satin" });
  v.span([-0.35, 1.0, 0.5], [0.35, 1.04, 0.56], 0x222628, { mat: "metal" });
  const shirt = [C.teal, 0x8c3b2e, C.cream, 0x3d4e7a, 0x6f7b4a][b.seed % 5];
  for (const sx of [-1, 1]) v.span([sx * 0.2 - 0.07, 0.45, -0.2], [sx * 0.2 + 0.07, 0.85, 0.25], 0x2f3438, { mat: "fabric" });
  v.span([-0.22, 0.82, -0.32], [0.22, 1.45, -0.02], shirt, { mat: "fabric" });
  for (const sx of [-1, 1]) v.rod([sx * 0.22, 1.35, -0.12], [sx * 0.3, 1.05, 0.5], 0.1, shirt, { mat: "fabric" });
  v.span([-0.16, 1.45, -0.27], [0.16, 1.55, -0.05], C.skin, { mat: "matte" });
  v.span([-0.18, 1.52, -0.32], [0.18, 1.82, 0.02], [0xe8e2d4, 0x2a2e30, C.orange, 0xb0352c][(b.seed * 7) % 4], { mat: "gloss" });
};

const BUILDERS = VEHICLES.map((v) => (v.kind === "bike" ? bikeModel(v) : carModel(v)));
const headMat = new MeshBasicMaterial({ color: new Color(0xfff0d2).multiplyScalar(2.2), toneMapped: false });
const tailMat = new MeshBasicMaterial({ color: new Color(0xff3020).multiplyScalar(2.6), toneMapped: false });

export const Traffic: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {VEHICLES.map((v, i) => {
      const a = ARM(v.arm);
      const p = vehiclePos(v, t);
      const hl = v.len / 2;
      const hw = v.kind === "truck" ? 0.97 : 0.87;
      return (
        <group key={v.id} position={p} rotation={[0, a.rotY, 0]}>
          <VoxModel build={BUILDERS[i]} seed={v.seed + 1} />
          {v.kind === "bike" ? (
            <mesh position={[0, 0.62, -0.69]} rotation={[0, Math.PI, 0]} material={tailMat}>
              <planeGeometry args={[0.18, 0.1]} />
            </mesh>
          ) : (
            [-1, 1].map((sx) => (
              <group key={sx}>
                <mesh position={[sx * (hw - 0.3), 0.72, hl + 0.03]} material={headMat}>
                  <planeGeometry args={[0.36, 0.14]} />
                </mesh>
                <mesh position={[sx * (hw - 0.25), 0.78, -hl - 0.035]} rotation={[0, Math.PI, 0]} material={tailMat}>
                  <planeGeometry args={[0.32, 0.16]} />
                </mesh>
              </group>
            ))
          )}
        </group>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ signal states */
export type Lamp = "red" | "amber" | "green";
/** Fixed schedule first (east gets green on an empty road), then the adaptive switch hands it to the south queue. */
export const lampOf = (name: ArmName | `wave${number}`, t: number): Lamp => {
  if (name.startsWith("wave")) return t >= WAVE_GREEN_AT[Number(name.slice(4))] ? "green" : "red";
  if (name === "E") return t < TM.amberE ? "green" : t < TM.redE ? "amber" : "red";
  if (name === "S") return t >= TM.greenS ? "green" : "red";
  return "red";
};
/** Countdown shown beside each approach head. */
export const countdownOf = (name: ArmName, t: number): number => {
  if (name === "S") return t < TM.greenS ? Math.ceil(TM.fixedS - t) : Math.ceil(TM.greenS + 40 - t);
  if (name === "E") return t < TM.amberE ? Math.ceil(TM.fixedE - t) : 0;
  return Math.ceil(TM.fixedS + 30 - t);
};

type Signal = { name: ArmName | `wave${number}`; pole: V3; rotY: number; head: V3; cam: V3; countdown: boolean };
export const SIGNALS: Signal[] = [];
for (const a of ARMS) {
  const [kx, kz] = a.laneAt(STOP + 0.6);
  const side: [number, number] = a.dir[0] === 0 ? [Math.sign(kx), 0] : [0, Math.sign(kz)];
  const off = P.road - LANE + 0.55;
  const pole: V3 = [kx + side[0] * off, P.curb, kz + side[1] * off];
  const head: V3 = [kx, 5.0, kz];
  SIGNALS.push({ name: a.name, pole, rotY: a.rotY + Math.PI, head, cam: [pole[0] + (head[0] - pole[0]) * 0.35, 6.25, pole[2] + (head[2] - pole[2]) * 0.35], countdown: true });
}
WAVE_Z.forEach((z, i) => {
  SIGNALS.push({ name: `wave${i}`, pole: [-P.road - 0.55, P.curb, z + 1.6], rotY: 0, head: [-LANE, 5.0, z + 1.6], cam: [-P.road + 0.2, 6.25, z + 1.6], countdown: false });
});
export const SIG = (n: string) => SIGNALS.find((s) => s.name === n)!;
/** Controller cabinet on the south-west corner; the radar sits on the south pole under the camera. */
export const CABINET: V3 = [-4.55, P.curb, 8.6];
export const RADAR: V3 = add(SIG("S").pole, [0.25, 4.6, 0.15]);

const signalModel = (v: Vox) => {
  const metal = 0x30373a;
  for (const s of SIGNALS) {
    const [px, py, pz] = s.pole;
    v.prism([px, py + 0.12, pz], 0.22, 0.24, metal, { sides: 8, mat: "metal" });
    v.prism([px, py + 3.3, pz], 0.1, 6.4, metal, { sides: 8, mat: "metal" });
    v.rod([px, 6.35, pz], [s.head[0], 6.35, s.head[2]], 0.11, metal, { mat: "metal" });
    v.rod([px, 5.7, pz], [px + (s.head[0] - px) * 0.45, 6.33, pz + (s.head[2] - pz) * 0.45], 0.06, metal, { mat: "metal" });
    v.span([s.head[0] - 0.04, 5.85, s.head[2] - 0.04], [s.head[0] + 0.04, 6.35, s.head[2] + 0.04], metal, { mat: "metal" });
    v.at(s.head, s.rotY, () => {
      v.span([-0.36, -0.95, -0.2], [0.36, 0.95, -0.16], 0x15191a, { mat: "satin" });
      for (const [a, b] of [[[-0.36, 0.89], [0.36, 0.95]], [[-0.36, -0.95], [0.36, -0.89]], [[-0.36, -0.95], [-0.3, 0.95]], [[0.3, -0.95], [0.36, 0.95]]] as [number, number][][])
        v.span([a[0], a[1], -0.155], [b[0], b[1], -0.145], 0xe6c23a, { mat: "satin" });
      v.span([-0.23, -0.78, -0.16], [0.23, 0.78, 0.1], 0x1f2426, { mat: "satin" });
      for (const y of [0.5, 0, -0.5]) {
        v.span([-0.2, y + 0.17, 0.1], [0.2, y + 0.21, 0.36], 0x1f2426, { mat: "satin" });
        for (const sx of [-1, 1]) v.span([sx * 0.2 - 0.02, y + 0.02, 0.1], [sx * 0.2 + 0.02, y + 0.21, 0.28], 0x1f2426, { mat: "satin" });
      }
      if (s.countdown) v.span([0.4, -0.3, -0.14], [1.02, 0.3, 0.1], 0x1f2426, { mat: "satin" });
    });
    v.at(s.cam, s.rotY, () => {
      v.span([-0.05, -0.12, -0.05], [0.05, 0.05, 0.05], metal, { mat: "metal" });
      v.at([0, -0.2, 0.05], [0.35, 0, 0], () => {
        v.span([-0.13, -0.11, -0.3], [0.13, 0.11, 0.32], 0xd8d4ca, { mat: "satin" });
        v.span([-0.16, 0.11, -0.34], [0.16, 0.14, 0.4], 0xc9c4b8, { mat: "satin" });
        v.prismAlong([0, 0, 0.33], [0, 0, 1], 0.075, 0.04, 0x0e1112, { sides: 10, mat: "gloss" });
      });
    });
  }
  // radar: a flat box on the south pole, facing the approach
  v.at(RADAR, SIG("S").rotY, () => {
    v.span([-0.2, -0.24, -0.06], [0.2, 0.24, 0.06], 0xe2ddd0, { mat: "satin" });
    v.span([-0.03, -0.03, -0.2], [0.03, 0.03, -0.06], metal, { mat: "metal" });
  });
  // controller cabinet with a conduit to the pole
  const [cx, cy, cz] = CABINET;
  v.span([cx - 0.45, cy, cz - 0.3], [cx + 0.45, cy + 1.5, cz + 0.3], 0x9aa09c, { mat: "satin", jitter: 0.02 });
  v.span([cx - 0.48, cy + 1.5, cz - 0.33], [cx + 0.48, cy + 1.58, cz + 0.33], 0x7d8380, { mat: "satin" });
  v.span([cx + 0.46, cy + 0.3, cz - 0.25], [cx + 0.47, cy + 1.3, cz + 0.25], 0x6f7572, { mat: "metal" });
};

/** Opening close-up: keep the lens readable (less emission + halo), full strength once the camera pulls back. */
export const lampBoost = (t: number) => 0.3 + 0.7 * smooth(2.6, 4.2, t);
const LAMP_TINT = { red: 0xff2a18, amber: 0xffa21a, green: 0x2cff8a };
const lampY = { red: 0.5, amber: 0, green: -0.5 } as const;
const signalPanes = (): Pane[] => {
  const out: Pane[] = [];
  for (const s of SIGNALS)
    for (const k of ["red", "amber", "green"] as Lamp[])
      out.push({ pos: add(s.head, rotate(s.rotY, [0, lampY[k], 0.105])), size: [0.32, 0.32], rotY: s.rotY, tint: LAMP_TINT[k], glow: (f) => (lampOf(s.name, f / 60) === k ? 7 * lampBoost(f / 60) : 0.05) });
  for (const s of SIGNALS) out.push({ pos: add(s.cam, rotate(s.rotY, [0.09, -0.12, 0.3])), size: [0.05, 0.05], rotY: s.rotY, tint: 0x5ef6ff, glow: () => 6 });
  return out;
};

/* ------------------------------------------------------------------ ground */
const ground = (v: Vox) => {
  const { minX, maxX, minZ, maxZ, road, walk, curb, base } = P;
  const asph = (x0: number, z0: number, x1: number, z1: number) => {
    for (let x = x0; x < x1 - 0.01; x += 2)
      for (let z = z0; z < z1 - 0.01; z += 1.6)
        v.span([x, -0.2, z], [Math.min(x + 2, x1), 0.02, Math.min(z + 1.6, z1)], v.rand() < 0.12 ? 0x474b4a : C.asphalt, { mat: "wet", r: 0.005, jitter: 0.05 });
  };
  asph(minX, -road, maxX, road);
  asph(-road, minZ, road, -road);
  asph(-road, road, road, maxZ);
  const paint = 0xd9d0bb;
  const mark = (a: V3, b: V3, c = paint) => v.span(a, b, c, { mat: "wet", r: 0.004, jitter: 0.03 });
  for (const s of [-1, 1]) mark([s > 0 ? STOP : -14, 0.02, -0.06], [s > 0 ? 14 : -STOP, 0.034, 0.06]);
  mark([-0.06, 0.02, STOP], [0.06, 0.034, 18]);
  for (let z = 19.5; z < maxZ - 1; z += 2.6) mark([-0.06, 0.02, z], [0.06, 0.034, z + 1.2]);
  mark([-0.06, 0.02, -14], [0.06, 0.034, -STOP]);
  for (let z = -14; z > minZ + 1; z -= 2.6) if (!WAVE_Z.some((w) => Math.abs(z - w) < 2.5)) mark([-0.06, 0.02, z], [0.06, 0.034, z - 1.3]);
  for (const s of [-1, 1]) {
    mark([minX, 0.02, s * (road - 0.3) - 0.05], [-walk, 0.032, s * (road - 0.3) + 0.05]);
    mark([walk, 0.02, s * (road - 0.3) - 0.05], [maxX, 0.032, s * (road - 0.3) + 0.05]);
  }
  // two stop lines per approach with the motorcycle box between them
  for (const a of ARMS)
    for (const d of [STOP, STOP_CAR]) {
      const [lx, lz] = a.laneAt(d);
      if (a.dir[0] === 0) mark([lx - LANE + 0.1, 0.02, lz - 0.2], [lx + LANE - 0.1, 0.036, lz + 0.2]);
      else mark([lx - 0.2, 0.02, lz - LANE + 0.1], [lx + 0.2, 0.036, lz + LANE - 0.1]);
    }
  for (const a of ARMS) {
    const [x0, z0] = a.laneAt(STOP + 0.25), [x1, z1] = a.laneAt(STOP_CAR - 0.25);
    const lo: V3 = a.dir[0] === 0 ? [x0 - LANE + 0.12, 0.021, Math.min(z0, z1)] : [Math.min(x0, x1), 0.021, z0 - LANE + 0.12];
    const hi: V3 = a.dir[0] === 0 ? [x0 + LANE - 0.12, 0.03, Math.max(z0, z1)] : [Math.max(x0, x1), 0.03, z0 + LANE - 0.12];
    v.span(lo, hi, 0x8a3f33, { mat: "wet", r: 0.004 });
  }
  const zebraAlongZ = (zc0: number, zc1: number) => {
    for (let x = -road + 0.3; x < road - 0.3; x += 0.6) mark([x, 0.02, zc0], [x + 0.34, 0.035, zc1]);
  };
  const zebraAlongX = (xc0: number, xc1: number) => {
    for (let z = -road + 0.3; z < road - 0.3; z += 0.6) mark([xc0, 0.02, z], [xc1, 0.035, z + 0.34]);
  };
  zebraAlongZ(ZEBRA[0], ZEBRA[1]);
  zebraAlongZ(-ZEBRA[1], -ZEBRA[0]);
  zebraAlongX(ZEBRA[0], ZEBRA[1]);
  zebraAlongX(-ZEBRA[1], -ZEBRA[0]);
  for (const w of WAVE_Z) zebraAlongZ(w - 1.1, w + 1.1);
  // inductive loops: saw cuts with dark sealant, lead-in to the kerb
  const seal = 0x1c2022;
  for (const a of ARMS)
    for (const d of LOOPS) {
      const [cx, cz] = a.laneAt(d);
      const hx = a.dir[0] === 0 ? 1.2 : 0.9, hz = a.dir[0] === 0 ? 0.9 : 1.2;
      v.span([cx - hx, 0.02, cz - hz], [cx + hx, 0.03, cz - hz + 0.07], seal, { mat: "gloss", r: 0.003 });
      v.span([cx - hx, 0.02, cz + hz - 0.07], [cx + hx, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      v.span([cx - hx, 0.02, cz - hz], [cx - hx + 0.07, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      v.span([cx + hx - 0.07, 0.02, cz - hz], [cx + hx, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      const [kx, kz] = a.dir[0] === 0 ? [Math.sign(cx) * road, cz] : [cx, Math.sign(cz) * road];
      v.span([Math.min(cx, kx) - 0.035, 0.02, Math.min(cz, kz) - 0.035], [Math.max(cx, kx) + 0.035, 0.03, Math.max(cz, kz) + 0.035], seal, { mat: "gloss", r: 0.003 });
    }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const zFar = sz > 0 ? maxZ : minZ;
      const xFar = sx > 0 ? maxX : minX;
      v.span([sx > 0 ? road - 0.02 : sx * road - 0.16, -0.2, Math.min(sz * road, zFar)], [sx > 0 ? road + 0.16 : -road + 0.02, curb + 0.01, Math.max(sz * road, zFar)], C.stoneLight, { mat: "wet", r: 0.02 });
      v.span([Math.min(sx * road, xFar), -0.2, sz > 0 ? road - 0.02 : -road - 0.16], [Math.max(sx * road, xFar), curb + 0.01, sz > 0 ? road + 0.16 : -road + 0.02], C.stoneLight, { mat: "wet", r: 0.02 });
      const x0 = Math.min(sx * (road + 0.16), xFar), x1 = Math.max(sx * (road + 0.16), xFar);
      const z0 = Math.min(sz * (road + 0.16), zFar), z1 = Math.max(sz * (road + 0.16), zFar);
      for (let x = x0; x < x1 - 0.01; x += 0.62)
        for (let z = z0; z < z1 - 0.01; z += 0.62) {
          const mx = Math.abs(x + 0.31), mz = Math.abs(z + 0.31);
          if (mx > walk && mz > walk) continue;
          v.span([x + 0.015, curb - 0.2, z + 0.015], [Math.min(x + 0.605, x1), curb, Math.min(z + 0.605, z1)], v.rand() < 0.15 ? C.stoneDark : C.stone, { mat: "wet", r: 0.015, jitter: 0.07 });
        }
      const yx0 = Math.min(sx * walk, xFar), yx1 = Math.max(sx * walk, xFar);
      const yz0 = Math.min(sz * walk, zFar), yz1 = Math.max(sz * walk, zFar);
      v.span([yx0, -0.2, yz0], [yx1, 0.06, yz1], C.cobble, { mat: "wet", jitter: 0.03, r: 0.01 });
    }
  const cuts = [-0.2, -0.7, -1.6, -base];
  const sc = [C.stoneDark, 0x6b5543, 0x5a4636];
  for (let i = 0; i < cuts.length - 1; i++) v.span([minX, cuts[i + 1], minZ], [maxX, cuts[i], maxZ], sc[i], { r: 0.02 });
  for (let i = 0; i < 160; i++) {
    const onFront = v.rand() < 0.4;
    const y = -0.8 - v.rand() * (base - 1.0);
    const s = 0.08 + v.rand() * 0.16;
    const col = [0x7a6656, 0x8b7a68, 0x5c4a3c][Math.floor(v.rand() * 3)];
    if (onFront) v.box([minX + 0.5 + v.rand() * (maxX - minX - 1), y, maxZ + 0.02], [s, s * 0.7, 0.06], col, { jitter: 0.1 });
    else v.box([(v.rand() < 0.5 ? maxX + 0.02 : minX - 0.02), y, minZ + 0.5 + v.rand() * (maxZ - minZ - 1)], [0.06, s * 0.7, s], col, { jitter: 0.1 });
  }
  for (const x of [-1.6, 1.2]) v.span([x - 0.22, -1.32, minZ - 0.05], [x + 0.22, -0.9, maxZ + 0.05], 0x3b3633, { r: 0.04 });
  v.span([minX - 0.18, -0.25, maxZ], [maxX + 0.18, 0.08, maxZ + 0.18], C.woodDark, { r: 0.02 });
  v.span([minX - 0.18, -0.25, minZ - 0.18], [maxX + 0.18, 0.08, minZ], C.woodDark, { r: 0.02 });
  v.span([minX - 0.18, -0.25, minZ], [minX, 0.08, maxZ], C.woodDark, { r: 0.02 });
  v.span([maxX, -0.25, minZ], [maxX + 0.18, 0.08, maxZ], C.woodDark, { r: 0.02 });
};

/* ------------------------------------------------------------------ city + furniture */
const Wp = (cz: number): Placement => ({ pos: [-P.walk, 0, cz], rotY: Math.PI / 2 });
const Ep = (cz: number): Placement => ({ pos: [P.walk, 0, cz], rotY: -Math.PI / 2 });
const CITY: { spec: BuildingSpec; at: Placement }[] = [
  { at: Wp(-9.3), spec: { w: 7.6, depth: 7.4, ground: 3.6, floors: [3.1, 3.1], wall: "plaster", wallColor: C.cream, trim: C.teal, win: "tall", bays: 3, winW: 0.95, winH: 1.8, roof: "flat", roofColor: C.stoneDark, shop: "bakery", shopColor: C.teal, extras: ["shutters", "plants", "ac"], seed: 51 } },
  { at: Wp(-16.2), spec: { w: 5.6, depth: 7, ground: 3.4, floors: [3.0, 3.0, 3.0], wall: "brick", wallColor: C.brick, trim: C.cream, win: "arched", bays: 2, winW: 1.0, winH: 1.9, roof: "mansard", roofColor: C.tealDeep, shop: "workshop", shopColor: C.copper, extras: ["balconies", "plants"], seed: 52 } },
  { at: Wp(-25.2), spec: { w: 7.4, depth: 7.4, ground: 3.8, floors: [3.2, 3.2, 3.2], wall: "stone", wallColor: C.stoneLight, trim: C.stoneDark, win: "band", bays: 3, winW: 1.0, winH: 1.6, roof: "stepped", roofColor: C.stone, shop: "arcade", shopColor: C.stoneDark, extras: ["ac", "tank"], seed: 53 } },
  { at: Wp(-36.2), spec: { w: 8.2, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1, 3.1], wall: "plaster", wallColor: C.plasterRose, trim: C.creamDark, win: "pair", bays: 3, winW: 1.5, winH: 1.5, roof: "flat", roofColor: C.copperPatina, shop: "cinema", shopColor: C.tealDeep, extras: ["tower"], seed: 54 } },
  { at: Wp(-46.4), spec: { w: 7.6, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1], wall: "brick", wallColor: C.brickDark, trim: C.stoneLight, win: "tall", bays: 3, winW: 0.9, winH: 1.8, roof: "saw", roofColor: C.copperPatina, shop: "market", shopColor: C.copper, seed: 55 } },
  { at: Wp(-57.6), spec: { w: 7.4, depth: 7.4, ground: 3.6, floors: [3.0, 3.0], wall: "plaster", wallColor: C.tealPale, trim: C.copper, win: "square", bays: 3, winW: 1.0, winH: 1.3, roof: "gable", roofColor: C.brickDark, shop: "bakery", shopColor: C.orange, seed: 57 } },
  { at: Ep(-8.9), spec: { w: 6.8, depth: 7.4, ground: 3.8, floors: [3.2], wall: "brick", wallColor: C.brickLight, trim: C.cream, win: "arched", bays: 3, winW: 1.1, winH: 2.0, roof: "gable", roofColor: C.copperDark, shop: "market", shopColor: C.orange, extras: ["chimney", "plants"], seed: 61 } },
  { at: Ep(-16.4), spec: { w: 5.4, depth: 7, ground: 3.4, floors: [3.0, 3.0, 3.0, 3.0], wall: "plaster", wallColor: C.plasterWarm, trim: C.teal, win: "square", bays: 2, winW: 1.1, winH: 1.3, roof: "flat", roofColor: C.stoneDark, shop: "bakery", shopColor: C.copper, extras: ["fireEscape", "ac"], seed: 62 } },
  { at: Ep(-25.0), spec: { w: 7.8, depth: 7.4, ground: 3.6, floors: [3.1, 3.1], wall: "stone", wallColor: C.stone, trim: C.copper, win: "round", bays: 3, winW: 1.1, winH: 1.5, roof: "mansard", roofColor: C.copperPatina, shop: "workshop", shopColor: C.tealDeep, extras: ["balconies", "shutters"], seed: 63 } },
  { at: Ep(-36.0), spec: { w: 8.0, depth: 7.4, ground: 3.6, floors: [3.2, 3.2, 3.2, 3.2, 3.2], wall: "plaster", wallColor: C.tealPale, trim: C.stoneDark, win: "band", bays: 3, winW: 1.0, winH: 1.5, roof: "flat", roofColor: C.stoneDark, shop: "arcade", shopColor: C.stoneDark, extras: ["tank", "ac"], seed: 64 } },
  { at: Ep(-46.2), spec: { w: 7.8, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1], wall: "brick", wallColor: C.brick, trim: C.cream, win: "pair", bays: 3, winW: 1.4, winH: 1.5, roof: "gable", roofColor: C.tealDeep, shop: "depot", extras: ["chimney"], seed: 65 } },
  { at: Ep(-57.4), spec: { w: 7.6, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1], wall: "stone", wallColor: C.stoneLight, trim: C.brick, win: "tall", bays: 3, winW: 0.9, winH: 1.8, roof: "stepped", roofColor: C.stone, shop: "workshop", shopColor: C.copper, seed: 67 } },
  { at: Wp(10.4), spec: { w: 8.4, depth: 6.4, ground: 3.6, floors: [], wall: "plaster", wallColor: C.plasterWarm, trim: C.copper, win: "square", bays: 3, winW: 1.0, winH: 1.0, roof: "gable", roofColor: C.copperDark, shop: "market", shopColor: C.teal, seed: 66 } },
  { at: Wp(22.0), spec: { w: 9.0, depth: 7, ground: 3.6, floors: [3.0], wall: "brick", wallColor: C.brickLight, trim: C.cream, win: "pair", bays: 3, winW: 1.3, winH: 1.4, roof: "flat", roofColor: C.stoneDark, shop: "bakery", shopColor: C.copper, extras: ["plants"], seed: 68 } },
  { at: Ep(24.0), spec: { w: 9.0, depth: 7, ground: 3.6, floors: [3.0, 3.0], wall: "plaster", wallColor: C.cream, trim: C.tealDeep, win: "tall", bays: 3, winW: 0.9, winH: 1.7, roof: "mansard", roofColor: C.copperPatina, shop: "workshop", shopColor: C.teal, extras: ["shutters"], seed: 69 } },
];
const windowGlow: GlowFn = ({ floor, seed, shop }) => {
  if (shop) return () => 1.05;
  const off = hash(seed * 5 + 2) > 0.78;
  const k = 0.7 + hash(seed * 7) * 0.6;
  return () => (off ? 0 : k * (floor > 2 ? 0.85 : 1));
};

export const STREETLAMPS: [number, number, number][] = [[-4.4, -13.5, 1], [4.4, -21.5, -1], [-4.4, -33.5, 1], [4.4, -44, -1], [4.4, 17, -1], [-4.4, 30, 1]];
const furniture = (v: Vox) => {
  const metal = 0x2a2f31;
  for (const [x, z, out] of STREETLAMPS) {
    v.prism([x, P.curb + 0.12, z], 0.15, 0.24, metal, { sides: 8, mat: "metal" });
    v.span([x - 0.05, P.curb, z - 0.05], [x + 0.05, 4.6, z + 0.05], metal, { mat: "metal", r: 0.015 });
    v.span([x, 4.5, z - 0.04], [x + out * 0.85, 4.58, z + 0.04], metal, { mat: "metal", r: 0.01 });
  }
  const px0 = P.walk + 0.3, pz0 = P.walk + 0.3;
  v.span([px0, 0.06, pz0], [P.maxX - 0.3, 0.22, 19], 0x56704a, { mat: "foliage", jitter: 0.04 });
  for (let x = px0; x < P.maxX - 0.3; x += 0.62) v.span([x + 0.02, 0.06, pz0 - 0.2], [x + 0.6, 0.42, pz0 + 0.02], C.stoneLight, { r: 0.03, jitter: 0.05 });
  for (let z = pz0; z < 19; z += 0.62) v.span([px0 - 0.2, 0.06, z + 0.02], [px0 + 0.02, 0.42, z + 0.6], C.stoneLight, { r: 0.03, jitter: 0.05 });
  const trees: V3[] = [[7.6, 0.2, 8.0], [11.5, 0.2, 7.4], [9.2, 0.2, 12.3], [13.6, 0.2, 11.2], [12, 0.2, 16.5], [-13.5, 0.2, 7.0], [-12, 0.2, 34], [12.5, 0.2, 36]];
  for (const [x, y, z] of trees) {
    v.span([x - 0.12, y, z - 0.12], [x + 0.12, y + 2.2, z + 0.12], C.woodDark, { r: 0.03 });
    shrub(v, [x, y + 2.3, z], 1.5);
    shrub(v, [x + 0.4, y + 3.0, z - 0.3], 1.1, 1);
  }
  v.span([9.0, 0.22, 9.6], [10.6, 0.5, 9.95], C.wood, { r: 0.02 });
  v.span([9.0, 0.5, 9.95], [10.6, 0.85, 10.05], C.wood, { r: 0.02 });
  for (let i = 0; i < 9; i++) v.span([6 + i * 0.95, 0.22, 6.0 + i * 0.8], [6.6 + i * 0.95, 0.25, 6.6 + i * 0.8], C.stone, { r: 0.02, jitter: 0.06 });
};
const LAMP_PANES: Pane[] = STREETLAMPS.map(([x, z, out]) => ({ pos: [x + out * 0.7, 4.45, z] as V3, size: [0.34, 0.34] as [number, number], rotY: 0, tint: 0xffcf86, glow: () => 2.8 }));

/* ------------------------------------------------------------------ textures */
const texFrom = (c: HTMLCanvasElement) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  t.anisotropy = 8;
  return t;
};
const chipCache = new Map<string, MeshBasicMaterial>();
export const chipMat = (n: number, color: string) => {
  const key = `${n}|${color}`;
  const hit = chipCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const g = c.getContext("2d")!;
  const r = 46;
  g.beginPath();
  g.moveTo(10 + r, 10);
  g.arcTo(502, 10, 502, 230, r);
  g.arcTo(502, 230, 10, 230, r);
  g.arcTo(10, 230, 10, 10, r);
  g.arcTo(10, 10, 502, 10, r);
  g.closePath();
  g.fillStyle = "rgba(14,26,28,0.9)";
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = color;
  g.stroke();
  g.beginPath();
  g.moveTo(226, 228);
  g.lineTo(256, 288);
  g.lineTo(286, 228);
  g.closePath();
  g.fillStyle = color;
  g.fill();
  g.fillRect(48, 112, 110, 44);
  g.fillRect(70, 82, 66, 34);
  g.fillStyle = "rgba(14,26,28,1)";
  g.beginPath();
  g.arc(74, 158, 15, 0, Math.PI * 2);
  g.arc(134, 158, 15, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f6ecd6";
  g.textBaseline = "middle";
  g.textAlign = "right";
  g.font = `600 150px '${FONT}'`;
  g.fillText(String(n), 470, 128);
  g.font = `600 30px '${FONT}'`;
  g.textAlign = "left";
  g.fillStyle = color;
  g.fillText("ANTRE", 50, 196);
  const m = new MeshBasicMaterial({ map: texFrom(c), transparent: true, toneMapped: false, depthWrite: false, fog: false });
  chipCache.set(key, m);
  return m;
};
const cdCache = new Map<string, MeshBasicMaterial>();
const countdownMat = (n: number, color: string) => {
  const key = `${n}|${color}`;
  const hit = cdCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 170px '${FONT}'`;
  g.fillText(String(Math.max(0, n)).padStart(2, "0"), 128, 136);
  const m = new MeshBasicMaterial({ map: texFrom(c), toneMapped: false });
  cdCache.set(key, m);
  return m;
};

export const billboard = (cam: CamState) => {
  const o = new Object3D();
  o.position.set(...cam.pos);
  o.lookAt(...cam.at);
  o.rotateY(Math.PI);
  return o.quaternion.clone();
};

/* ------------------------------------------------------------------ time-driven FX */
const LAMP_HEX: Record<Lamp, number> = { red: 0xff2a18, amber: 0xffa21a, green: 0x2cff8a };
const CD_COLOR: Record<Lamp, string> = { red: "#ff3a24", amber: "#ffb02a", green: "#4dff98" };

const Countdowns: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {SIGNALS.filter((s) => s.countdown).map((s) => {
      const lamp = lampOf(s.name, t);
      return (
        <mesh key={s.name} position={add(s.head, rotate(s.rotY, [0.71, 0, 0.105]))} rotation={[0, s.rotY, 0]} material={countdownMat(countdownOf(s.name as ArmName, t), CD_COLOR[lamp])}>
          <planeGeometry args={[0.56, 0.54]} />
        </mesh>
      );
    })}
  </group>
);

const Halos: React.FC<{ cam: CamState; t: number }> = ({ cam, t }) => {
  const q = useMemo(() => billboard(cam), [cam]);
  const tex = useMemo(radialTex, []);
  return (
    <group>
      {SIGNALS.map((s) => {
        const lamp = lampOf(s.name, t);
        const wave = s.name.startsWith("wave");
        // a short flare when a green-wave head switches on
        const flare = wave ? Math.exp(-Math.max(0, t - WAVE_GREEN_AT[Number(s.name.slice(4))]) * 3) * (lamp === "green" ? 1 : 0) : 0;
        return (
          <group key={s.name}>
            <mesh position={add(s.head, rotate(s.rotY, [0, lampY[lamp], 0.3]))} quaternion={q} layers={FX_LAYER} renderOrder={10}>
              <planeGeometry args={[(wave ? 3.4 : 2.0) * (1 + flare * 1.2), (wave ? 3.4 : 2.0) * (1 + flare * 1.2)]} />
              <meshBasicMaterial map={tex} color={LAMP_HEX[lamp]} transparent opacity={(0.55 + flare * 0.4) * lampBoost(t) * (wave ? 1.25 : 1)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
            <mesh position={[s.head[0], 0.06, s.head[2] + (wave ? 3 : 0)]} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={9}>
              <planeGeometry args={lamp === "green" ? [4.5, 9] : [5, 5]} />
              <meshBasicMaterial map={tex} color={LAMP_HEX[lamp]} transparent opacity={0.21} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
          </group>
        );
      })}
      {LAMP_PANES.map((p, i) => (
        <mesh key={`l${i}`} position={[p.pos[0], p.pos[1] - 0.1, p.pos[2]]} quaternion={q} layers={FX_LAYER} renderOrder={10}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial map={tex} color={0xffb469} transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Is any vehicle of this approach standing over the loop at distance d? */
const loopBusy = (arm: ArmName, d: number, t: number) =>
  VEHICLES.some((v) => v.arm === arm && v.kind !== "bike" && Math.abs(vehicleD(v, t) - d) < v.len / 2 + 0.3);

/** Loops light up once the film explains them; occupied loops glow, and the south loop radiates field rings. */
const LoopFX: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(radialTex, []);
  const on = smooth(TM.aspal - 0.4, TM.aspal + 0.4, t);
  if (on <= 0) return null;
  const items: React.ReactNode[] = [];
  for (const a of ARMS)
    for (const [li, d] of LOOPS.entries()) {
      const [cx, cz] = a.laneAt(d);
      const busy = loopBusy(a.name, d, t);
      const w = a.dir[0] === 0 ? 2.4 : 1.8, h = a.dir[0] === 0 ? 1.8 : 2.4;
      const k = on * (busy ? 1 : 0.25);
      items.push(
        <group key={`${a.name}${li}`}>
          {/* four bars tracing the saw cut */}
          {[
            [cx, cz - h / 2, w, 0.09],
            [cx, cz + h / 2, w, 0.09],
            [cx - w / 2, cz, 0.09, h],
            [cx + w / 2, cz, 0.09, h],
          ].map(([x, z, sx, sz], j) => (
            <mesh key={j} position={[x, 0.045, z]} layers={FX_LAYER} renderOrder={9}>
              <boxGeometry args={[sx, 0.02, sz]} />
              <meshBasicMaterial color={0x46e6ff} transparent opacity={0.9 * k} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
          ))}
        </group>,
      );
      // field rings rising from the south loops while the explanation runs
      if (a.name === "S" && busy && t > TM.aspal - 0.2 && t < TM.antrean + 1.0)
        for (let r = 0; r < 3; r++) {
          const ph = ((t - TM.aspal) * 0.9 + r / 3) % 1;
          items.push(
            <mesh key={`r${li}${r}`} position={[cx, 0.15 + ph * 1.9, cz]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + ph * 0.6, 0.8 + ph * 0.4, 1]} layers={FX_LAYER} renderOrder={11}>
              <ringGeometry args={[1.25, 1.36, 48]} />
              <meshBasicMaterial color={0x7ff3ff} transparent opacity={0.75 * (1 - ph) * on} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
            </mesh>,
          );
        }
    }
  return (
    <group>
      {items}
      <mesh position={[ARM("S").laneAt(LOOPS[0])[0], 0.05, (LOOPS[0] + LOOPS[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={8}>
        <planeGeometry args={[4, 6.5]} />
        <meshBasicMaterial map={tex} color={0x46e6ff} transparent opacity={0.25 * on * (loopBusy("S", LOOPS[0], t) ? 1 : 0.2)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
};

/** The south camera's view frustum and detection zone; radar arcs while the count runs. */
const SensorFX: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const s = SIG("S");
    const apex = add(s.cam, [0, -0.2, 0]);
    const a = ARM("S");
    const near = a.laneAt(STOP + 0.4), far = a.laneAt(STOP + 26);
    const hw = 1.5;
    const corners: V3[] = [[near[0] - hw, 0.05, near[1]], [near[0] + hw, 0.05, near[1]], [far[0] + hw, 0.05, far[1]], [far[0] - hw, 0.05, far[1]]];
    const pos: number[] = [];
    for (let k = 0; k < 4; k++) pos.push(...apex, ...corners[k], ...corners[(k + 1) % 4]);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    return g;
  }, []);
  const view = smooth(TM.membaca - 0.6, TM.membaca + 0.3, t) * (1 - smooth(TM.go + 1.0, TM.go + 2.5, t));
  const radarOn = t > TM.radar - 0.3 && t < TM.antrean + 0.8 ? 1 : 0;
  const s = SIG("S");
  return (
    <group>
      {view > 0 && (
        <mesh geometry={geo} layers={FX_LAYER} renderOrder={8}>
          <meshBasicMaterial color={0x46e6ff} transparent opacity={0.09 * view} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
        </mesh>
      )}
      {radarOn > 0 &&
        [0, 1, 2, 3].map((r) => {
          const ph = ((t - TM.radar) * 1.1 + r / 4) % 1;
          return (
            <mesh key={r} position={add(RADAR, [0, -0.2 - ph * 3.0, ph * 9 + 0.3])} rotation={[-Math.PI / 2 + 0.35, 0, 0]} layers={FX_LAYER} renderOrder={11}>
              <ringGeometry args={[0.6 + ph * 2.2, 0.68 + ph * 2.2, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
              <meshBasicMaterial color={0xffd27a} transparent opacity={0.8 * (1 - ph)} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
            </mesh>
          );
        })}
      {/* keep the sensor camera's status LED visible as a cue */}
      <mesh position={add(s.cam, rotate(s.rotY, [0.09, -0.12, 0.33]))} layers={FX_LAYER}>
        <planeGeometry args={[0.001, 0.001]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
    </group>
  );
};

/** Data pulses from the cabinet up the sidewalk to every green-wave signal ("menyelaraskan simpang berikutnya"). */
const LinkFX: React.FC<{ t: number }> = ({ t }) => {
  const on = smooth(TM.selaras - 0.4, TM.selaras + 0.2, t) * (1 - smooth(TM.reveal + 2.5, TM.reveal + 4, t));
  if (on <= 0) return null;
  const x = -P.road - 1.0;
  const out: React.ReactNode[] = [];
  // the line itself
  const z0 = CABINET[2], z1 = WAVE_Z[WAVE_Z.length - 1] + 1.6;
  out.push(
    <mesh key="line" position={[x, 0.2, (z0 + z1) / 2]} layers={FX_LAYER} renderOrder={9}>
      <boxGeometry args={[0.08, 0.03, Math.abs(z1 - z0)]} />
      <meshBasicMaterial color={0x46e6ff} transparent opacity={0.6 * on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
    </mesh>,
  );
  for (let k = 0; k < 6; k++) {
    const ph = ((t - TM.selaras) * 0.55 + k / 6) % 1;
    const z = z0 + (z1 - z0) * ph;
    out.push(
      <mesh key={k} position={[x, 0.25, z]} layers={FX_LAYER} renderOrder={10}>
        <boxGeometry args={[0.3, 0.12, 0.9]} />
        <meshBasicMaterial color={0xa8fbff} transparent opacity={on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>,
    );
  }
  // risers to each wave head
  for (const s of SIGNALS.filter((q) => q.name.startsWith("wave")))
    out.push(
      <mesh key={s.name} position={[s.pole[0], 3.2, s.pole[2]]} layers={FX_LAYER} renderOrder={9}>
        <boxGeometry args={[0.06, 6.2, 0.06]} />
        <meshBasicMaterial color={0x46e6ff} transparent opacity={0.5 * on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>,
    );
  return <group>{out}</group>;
};

/** Floating queue counters: hidden under the fixed schedule, they appear when the sensors read the road. */
export const queueCount = (arm: ArmName, t: number) => {
  const total = VEHICLES.filter((v) => v.arm === arm).length;
  if (arm !== "S") return total;
  // the south counter ticks up as the camera boxes each vehicle, then falls as the queue clears the loops
  const counted = S_VEHICLES.filter((_, i) => t >= TM.boxAt(i)).length;
  if (t < TM.go) return counted;
  return S_VEHICLES.filter((v) => vehicleD(v, t) > STOP - 0.5).length;
};
const QueueChips: React.FC<{ cam: CamState; t: number }> = ({ cam, t }) => {
  const q = useMemo(() => billboard(cam), [cam]);
  const projCam = useMemo(() => {
    const c = new PerspectiveCamera(cam.fov, 9 / 16, 0.03, 600);
    c.position.set(...cam.pos);
    c.lookAt(...cam.at);
    c.updateMatrixWorld();
    c.updateProjectionMatrix();
    return c;
  }, [cam]);
  const show = smooth(TM.membaca, TM.membaca + 0.5, t) * (1 - smooth(TM.reveal + 0.5, TM.reveal + 1.2, t)) + smooth(TM.outro, TM.outro + 0.6, t);
  if (show <= 0.01) return null;
  return (
    <group>
      {ARMS.map((a) => {
        const lamp = lampOf(a.name, t);
        const [x, z] = a.laneAt(a.name === "N" ? STOP_CAR + 7.5 : a.name === "S" ? STOP_CAR + 6 : STOP + 3.2);
        const pos: V3 = [x, 4.6, z];
        const col = lamp === "green" ? "#5cffa4" : lamp === "amber" ? "#ffb02a" : "#ff6a4a";
        const ndc = new Vector3(...pos).project(projCam);
        const dist = Math.hypot(pos[0] - cam.pos[0], pos[1] - cam.pos[1], pos[2] - cam.pos[2]);
        const edge = Math.max(Math.abs(ndc.x) + 0.32, Math.abs(ndc.y) + 0.12);
        const keep = (ndc.z < 1 ? 1 : 0) * clamp((0.95 - edge) / 0.12) * smooth(13, 18, dist);
        const sc = clamp(show) * keep;
        if (sc <= 0.01) return null;
        return (
          <group key={a.name}>
            <mesh position={pos} quaternion={q} scale={[sc, sc, 1]} material={chipMat(queueCount(a.name, t), col)} renderOrder={20} layers={FX_LAYER}>
              <planeGeometry args={[2.9, 1.7]} />
            </mesh>
            <mesh position={[x, (1.9 + pos[1] - 0.85) / 2, z]} layers={FX_LAYER}>
              <boxGeometry args={[0.035, pos[1] - 0.85 - 1.9, 0.035]} />
              <meshBasicMaterial color={col} toneMapped={false} transparent opacity={0.7 * sc} fog={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ payoff: map board of 321 junctions */
export const BOARD: V3 = [0, 0, -150];
const BOARD_N = 321;
const ADAPTIVE = 115;
const boardCells = (() => {
  const cells: { x: number; z: number; score: number; order: number }[] = [];
  for (let i = -14; i <= 14; i++)
    for (let j = -13; j <= 13; j++) {
      const dx = i / 14, dz = j / 13;
      const score = Math.hypot(dx * 1.0, dz * 1.12) + (hash(i * 131 + j * 17 + 5) - 0.5) * 0.42 + 0.12 * Math.sin(i * 0.7 + j * 0.3);
      cells.push({ x: i * 1.05, z: j * 1.05, score, order: hash(i * 71 + j * 29 + 3) });
    }
  cells.sort((a, b) => a.score - b.score);
  const pick = cells.slice(0, BOARD_N);
  // adaptive junctions cluster toward the centre and the main corridors, in a seeded order
  const ranked = [...pick].sort((a, b) => a.score * 0.8 + a.order * 0.5 - (b.score * 0.8 + b.order * 0.5));
  const lightAt = new Map<typeof pick[number], number>();
  ranked.slice(0, ADAPTIVE).forEach((c, k) => lightAt.set(c, k / (ADAPTIVE - 1)));
  return pick.map((c) => ({ x: c.x, z: c.z, light: lightAt.get(c) ?? -1 }));
})();
/** How many of the 115 are lit at time t (counts with the spoken numbers). */
export const boardLit = (t: number) => Math.round(ADAPTIVE * smooth(TM.boardFrom, TM.boardTo, t));

const boardBase = (v: Vox) => {
  const [bx, , bz] = BOARD;
  v.span([bx - 17, -1.2, bz - 16], [bx + 17, 0, bz + 16], 0x22302f, { r: 0.05 });
  v.span([bx - 17.3, -1.4, bz - 16.3], [bx + 17.3, 0.12, bz - 16], C.woodDark, { r: 0.03 });
  v.span([bx - 17.3, -1.4, bz + 16], [bx + 17.3, 0.12, bz + 16.3], C.woodDark, { r: 0.03 });
  v.span([bx - 17.3, -1.4, bz - 16], [bx - 17, 0.12, bz + 16], C.woodDark, { r: 0.03 });
  v.span([bx + 17, -1.4, bz - 16], [bx + 17.3, 0.12, bz + 16], C.woodDark, { r: 0.03 });
  // a few arterial roads across the map
  for (const [x0, z0, x1, z1] of [[-15, -2.1, 15, -1.6], [-15, 5.0, 15, 5.4], [-4.4, -14, -3.9, 14], [6.0, -14, 6.4, 14], [-12, -10, 12, -9.6]])
    v.span([bx + x0, 0, bz + z0], [bx + x1, 0.05, bz + z1], 0x3a4a48, { r: 0.01 });
  for (const c of boardCells) v.span([bx + c.x - 0.38, 0, bz + c.z - 0.38], [bx + c.x + 0.38, 0.22, bz + c.z + 0.38], 0x5d6b68, { r: 0.04, jitter: 0.06 });
};
const BoardLamps: React.FC<{ t: number }> = ({ t }) => {
  const { mesh, base } = useMemo(() => {
    const m = new InstancedMesh(new BoxGeometry(0.42, 0.34, 0.42), new MeshBasicMaterial({ toneMapped: false }), boardCells.length);
    const mat = new Matrix4();
    boardCells.forEach((c, i) => {
      mat.compose(new Object3D().position.set(BOARD[0] + c.x, 0.42, BOARD[2] + c.z), new Quaternion(), new Object3D().scale);
      m.setMatrixAt(i, mat);
      m.setColorAt(i, new Color(0x4a3a30));
    });
    m.frustumCulled = false;
    return { mesh: m, base: new Color(0x6b5a4a) };
  }, []);
  const lit = boardLit(t) / ADAPTIVE;
  const green = new Color(0x2cff8a).multiplyScalar(2.2);
  const flash = new Color(0xd6fff0).multiplyScalar(3.5);
  boardCells.forEach((c, i) => {
    if (c.light >= 0 && c.light <= lit - 1e-6) {
      const age = (lit - c.light) * 8;
      mesh.setColorAt(i, age < 0.25 ? flash : green);
    } else mesh.setColorAt(i, base);
  });
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

/* ------------------------------------------------------------------ payoff: control room */
export const ROOM: V3 = [0, 0, -240];
const wallTex = (() => {
  let t: CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = 1536;
    c.height = 640;
    const g = c.getContext("2d")!;
    g.fillStyle = "#070c0d";
    g.fillRect(0, 0, 1536, 640);
    const pw = 1536 / 4, ph = 320;
    // CCTV tiles: left and right columns
    const cctv = (x: number, y: number, w: number, h: number, k: number) => {
      g.fillStyle = "#1b2a29";
      g.fillRect(x, y, w, h);
      g.fillStyle = "#3a4645";
      g.fillRect(x + w * 0.42, y, w * 0.16, h);
      g.fillRect(x, y + h * 0.45, w, h * 0.14);
      g.fillStyle = "#e8e2d4";
      for (let n = 0; n < 6; n++) g.fillRect(x + w * 0.42 + 4 + (n % 2) * 14, y + h * 0.62 + Math.floor(n / 2) * 6, 3, 30);
      for (let n = 0; n < 4; n++) {
        const cy = y + h * 0.64 + n * 26;
        if (cy > y + h - 20) break;
        g.fillStyle = ["#c9b998", "#4f7f7b", "#b36a40", "#e6d9bf"][(k + n) % 4];
        g.fillRect(x + w * 0.44, cy, w * 0.05, 16);
      }
      g.strokeStyle = "#46e6ff";
      g.lineWidth = 3;
      g.strokeRect(x + w * 0.43, y + h * 0.62, w * 0.07, h * 0.3);
      g.fillStyle = k % 2 ? "#ff3a24" : "#3dff98";
      g.beginPath();
      g.arc(x + w * 0.64, y + h * 0.36, 9, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#cfe0da";
      g.font = `600 22px '${FONT}'`;
      g.fillText(`CCTV SIMPANG ${String(k + 3).padStart(3, "0")}`, x + 16, y + 30);
      g.fillStyle = "#ff5a44";
      g.fillText("● REC", x + w - 92, y + 30);
    };
    for (let j = 0; j < 2; j++) {
      cctv(8, j * ph + 8, pw - 16, ph - 16, j);
      cctv(3 * pw + 8, j * ph + 8, pw - 16, ph - 16, j + 2);
    }
    // centre: junction network map
    const mx = pw + 8, my = 8, mw = 2 * pw - 16, mh = 640 - 16;
    g.fillStyle = "#0f1d1c";
    g.fillRect(mx, my, mw, mh);
    g.strokeStyle = "#2f4a47";
    g.lineWidth = 10;
    const roadsH = [0.18, 0.4, 0.62, 0.84], roadsV = [0.12, 0.3, 0.5, 0.7, 0.88];
    for (const r of roadsH) { g.beginPath(); g.moveTo(mx, my + mh * r); g.lineTo(mx + mw, my + mh * r + 18 * Math.sin(r * 9)); g.stroke(); }
    for (const r of roadsV) { g.beginPath(); g.moveTo(mx + mw * r, my); g.lineTo(mx + mw * r + 22 * Math.cos(r * 7), my + mh); g.stroke(); }
    // corridor with the green wave
    g.strokeStyle = "#3dff98";
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(mx + mw * 0.5, my + mh); g.lineTo(mx + mw * 0.5 + 22 * Math.cos(3.5), my); g.stroke();
    roadsH.forEach((ry, i) => roadsV.forEach((rx, j) => {
      const px = mx + mw * rx + 22 * Math.cos(rx * 7) * ry, py = my + mh * ry + 18 * Math.sin(ry * 9) * rx;
      const adaptive = hash(i * 13 + j * 7 + 1) < 0.38 || j === 2;
      g.fillStyle = adaptive ? "#3dff98" : "#8a7562";
      g.beginPath(); g.arc(px, py, adaptive ? 13 : 10, 0, Math.PI * 2); g.fill();
      if (adaptive) { g.strokeStyle = "rgba(61,255,152,0.35)"; g.lineWidth = 4; g.beginPath(); g.arc(px, py, 22, 0, Math.PI * 2); g.stroke(); }
    }));
    g.fillStyle = "#cfe0da";
    g.font = `600 26px '${FONT}'`;
    g.fillText("PETA SIMPANG BERSINYAL", mx + 20, my + 74);
    // channel header on the wall, part of the room
    g.fillStyle = "#0b1615";
    g.fillRect(mx + mw * 0.52, my + 10, mw * 0.46, 56);
    g.fillStyle = "#f2a33a";
    g.font = `600 36px '${FONT}'`;
    g.textAlign = "right";
    g.fillText("AUDIRA EXPLAINED", mx + mw - 26, my + 50);
    g.textAlign = "left";
    g.font = `600 20px '${FONT}'`;
    g.fillStyle = "#3dff98"; g.fillText("● adaptif", mx + 20, my + mh - 22);
    g.fillStyle = "#b39a80"; g.fillText("● jadwal tetap", mx + 150, my + mh - 22);
    t = texFrom(c);
    return t;
  };
})();
const roomModel = (v: Vox) => {
  const [rx, , rz] = ROOM;
  const wall = 0x51625f, floor = 0x5b605d;
  v.span([rx - 9, -0.2, rz - 7], [rx + 9, 0, rz + 7], floor, { mat: "satin", r: 0.02 });
  for (let x = -9; x < 9; x += 1.2) v.span([rx + x + 0.02, 0, rz - 7], [rx + x + 0.05, 0.005, rz + 7], 0x333837, {});
  v.span([rx - 9, 0, rz - 7.3], [rx + 9, 5, rz - 7], wall, {});
  v.span([rx - 9.3, 0, rz - 7], [rx - 9, 5, rz + 7], wall, {});
  v.span([rx + 9, 0, rz - 7], [rx + 9.3, 5, rz + 7], wall, {});
  v.span([rx - 9.3, 5, rz - 7.3], [rx + 9.3, 5.3, rz + 7.3], 0x252d2e, {});
  v.span([rx - 9.3, 0, rz + 7], [rx + 9.3, 5, rz + 7.3], wall, {});
  // ceiling light strips
  for (const z of [-4, 0, 4]) v.span([rx - 6, 4.92, rz + z - 0.12], [rx + 6, 5, rz + z + 0.12], 0xd8e4e0, {});
  // video wall frame
  v.span([rx - 6.4, 0.9, rz - 7.0], [rx + 6.4, 4.4, rz - 6.8], 0x111617, { mat: "satin" });
  // wall trim, a supervisor desk lamp column, acoustic panels
  for (const x of [-8.2, 7.4]) v.span([rx + x, 0.4, rz - 6.95], [rx + x + 0.8, 4.2, rz - 6.8], 0x6e7f7b, { jitter: 0.05 });
  v.span([rx - 9, 0, rz - 6.95], [rx + 9, 0.25, rz - 6.8], 0x3d4645, {});
  // two-tier console desk
  for (const [z, h] of [[-3.0, 0.82], [0.4, 0.82]] as const) {
    v.span([rx - 5.5, 0, rz + z - 0.5], [rx + 5.5, h - 0.06, rz + z + 0.5], 0x4a5352, { mat: "satin" });
    v.span([rx - 5.6, h - 0.06, rz + z - 0.6], [rx + 5.6, h, rz + z + 0.6], 0xc9c2b2, { mat: "satin" });
    for (let x = -4.5; x <= 4.6; x += 1.5) {
      v.span([rx + x - 0.42, h, rz + z - 0.38], [rx + x + 0.42, h + 0.55, rz + z - 0.32], 0x16191a, { mat: "satin" });
      v.span([rx + x - 0.05, h, rz + z - 0.3], [rx + x + 0.05, h + 0.2, rz + z - 0.2], 0x16191a, { mat: "metal" });
      v.span([rx + x - 0.3, h, rz + z + 0.05], [rx + x + 0.3, h + 0.03, rz + z + 0.25], 0x2a2e30, {});
    }
  }
  // operators seated at the front row, seen from behind
  const op = (x: number, z: number, shirt: number, turn: number) => {
    v.at([rx + x, 0, rz + z], turn, () => {
      v.span([-0.32, 0, -0.1], [0.32, 0.48, 0.5], 0x2a2e30, { mat: "fabric" });
      v.span([-0.3, 0.48, 0.32], [0.3, 1.25, 0.42], 0x2a2e30, { mat: "fabric" });
      v.span([-0.24, 0.5, -0.05], [0.24, 1.18, 0.3], shirt, { mat: "fabric" });
      for (const sx of [-1, 1]) {
        v.rod([sx * 0.25, 1.1, 0.12], [sx * 0.2, 0.86, -0.32], 0.11, shirt, { mat: "fabric" });
        v.span([sx * 0.2 - 0.06, 0.82, -0.42], [sx * 0.2 + 0.06, 0.88, -0.3], C.skin, {});
        v.span([sx * 0.13 - 0.08, 0.45, -0.45], [sx * 0.13 + 0.08, 0.6, 0.05], 0x2f3438, { mat: "fabric" });
        v.span([sx * 0.13 - 0.08, 0, -0.5], [sx * 0.13 + 0.08, 0.5, -0.35], 0x2f3438, { mat: "fabric" });
      }
      v.span([-0.08, 1.18, 0.05], [0.08, 1.26, 0.2], C.skin, {});
      v.span([-0.15, 1.26, -0.05], [0.15, 1.56, 0.26], C.skin, {});
      v.span([-0.16, 1.4, 0.0], [0.16, 1.6, 0.28], C.hair, {});
      v.span([-0.16, 1.26, 0.18], [0.16, 1.42, 0.28], C.hair, {});
      // headset band
      v.span([-0.17, 1.38, 0.08], [0.17, 1.62, 0.13], 0x1d2224, { mat: "satin" });
    });
  };
  op(-1.5, -2.0, 0x3d5a78, 0);
  op(1.6, -2.0, 0x6f7b4a, -0.12);
  op(-3.2, 1.4, 0x3d5a78, 0.1);
};
const roomPanes = (): Pane[] => {
  const [rx, , rz] = ROOM;
  const out: Pane[] = [];
  for (const z of [-3.0, 0.4])
    for (let x = -4.5; x <= 4.6; x += 1.5) out.push({ pos: [rx + x, 0.82 + 0.3, rz + z - 0.315], size: [0.78, 0.46], rotY: 0, tint: hash(x * 3 + z) < 0.5 ? 0x7fd8c8 : 0x9fc0ff, glow: () => 0.95 });
  return out;
};
const VideoWall: React.FC = () => {
  const [rx, , rz] = ROOM;
  const mat = useMemo(() => new MeshBasicMaterial({ map: wallTex(), toneMapped: false, color: new Color(1.15, 1.15, 1.15) }), []);
  return (
    <mesh position={[rx, 2.65, rz - 6.78]} material={mat}>
      <planeGeometry args={[12.4, 3.3]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ rooftop billboard (brand inside the world) */
const BILL: V3 = [9.2, 10.4, -8.9];
const billboardFrame = (v: Vox) => {
  const [x, y, z] = BILL;
  const metal = 0x30373a;
  for (const dx of [-1.6, 1.6]) v.span([x + dx - 0.08, 6.6, z - 0.08], [x + dx + 0.08, y - 0.7, z + 0.08], metal, { mat: "metal" });
  v.span([x - 2.25, y - 0.8, z - 0.14], [x + 2.25, y + 0.8, z - 0.04], 0x1a2021, { mat: "satin" });
  v.span([x - 2.25, y - 0.86, z - 0.1], [x + 2.25, y - 0.8, z + 0.25], metal, { mat: "metal" });
  for (const dx of [-1.5, 0, 1.5]) v.span([x + dx - 0.05, y - 0.86, z + 0.2], [x + dx + 0.05, y - 0.7, z + 0.45], metal, { mat: "metal" });
};
const billMat = (() => {
  let m: MeshBasicMaterial | null = null;
  return () => {
    if (m) return m;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 360;
    const g = c.getContext("2d")!;
    g.fillStyle = "#13201f";
    g.fillRect(0, 0, 1024, 360);
    g.strokeStyle = "#f2a33a";
    g.lineWidth = 14;
    g.strokeRect(14, 14, 996, 332);
    g.fillStyle = "#f6ecd6";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 150px '${FONT}'`;
    g.fillText("AUDIRA", 512, 150);
    g.fillStyle = "#f2a33a";
    g.font = `600 58px '${FONT}'`;
    g.fillText("E X P L A I N E D", 512, 272);
    m = new MeshBasicMaterial({ map: texFrom(c), toneMapped: false, color: new Color(1.25, 1.25, 1.25) });
    return m;
  };
})();
const Billboard: React.FC = () => (
  <group>
    <VoxModel build={billboardFrame} seed={59} />
    <mesh position={[BILL[0], BILL[1], BILL[2] - 0.03]} material={billMat()}>
      <planeGeometry args={[4.3, 1.5]} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ assembled world */
export const FilmWorld: React.FC<{ t: number; f: number; cam: CamState; hideChips?: boolean }> = ({ t, f, cam, hideChips }) => {
  const glow = useMemo(() => windowGlow, []);
  const sigPanes = useMemo(signalPanes, []);
  const rPanes = useMemo(roomPanes, []);
  const inRoom = Math.abs(cam.pos[2] - ROOM[2]) < 30;
  const atBoard = Math.abs(cam.pos[2] - BOARD[2]) < 60 && !inRoom;
  return (
    <>
      <VoxModel build={ground} seed={53} castShadow={false} />
      <Buildings list={CITY} glow={glow} f={f} />
      <Traffic t={t} />
      <VoxModel build={signalModel} seed={55} />
      <VoxModel build={furniture} seed={56} />
      <Billboard />
      <GlowPanes panes={sigPanes} f={f} />
      <GlowPanes panes={LAMP_PANES} f={f} />
      <Countdowns t={t} />
      {!inRoom && !atBoard && (
        <>
          {STREETLAMPS.slice(0, 4).map(([x, z, out], i) => (
            <pointLight key={i} position={[x + out * 0.7, 4.1, z]} color={C.lampWarm} intensity={9} distance={9} decay={2} />
          ))}
          {SIGNALS.slice(0, 4).map((s) => (
            <pointLight key={s.name} position={[s.head[0], 4.2, s.head[2]]} color={LAMP_HEX[lampOf(s.name, t)]} intensity={10} distance={8} decay={2} />
          ))}
        </>
      )}
      <Halos cam={cam} t={t} />
      <LoopFX t={t} />
      <SensorFX t={t} />
      <LinkFX t={t} />
      {!hideChips && <QueueChips cam={cam} t={t} />}
      {atBoard && <VoxModel build={boardBase} seed={57} />}
      {atBoard && <BoardLamps t={t} />}
      {atBoard && <pointLight position={[BOARD[0], 9, BOARD[2] + 4]} color={0x9fe8d0} intensity={60} distance={40} decay={2} />}
      {inRoom && <VoxModel build={roomModel} seed={58} />}
      {inRoom && <GlowPanes panes={rPanes} f={f} />}
      {inRoom && <VideoWall />}
      {inRoom && (
        <>
          <pointLight position={[ROOM[0], 4.3, ROOM[2] - 4]} color={0xcfe7e0} intensity={90} distance={22} decay={2} />
          <pointLight position={[ROOM[0], 4.3, ROOM[2] + 3]} color={0xffd6a8} intensity={80} distance={22} decay={2} />
          <pointLight position={[ROOM[0], 2.6, ROOM[2] - 5.5]} color={0x5fe0d0} intensity={55} distance={14} decay={2} />
        </>
      )}
    </>
  );
};

