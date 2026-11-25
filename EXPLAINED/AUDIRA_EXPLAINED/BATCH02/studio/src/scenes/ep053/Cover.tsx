// EP053 cover — VOXELVERSE. A miniature dusk crossroads on its diorama plinth: car queues on all four
// arms with a small count chip floating over each inbound lane, APILL signal poles (green for the long
// north–south approaches, red for the cross street), a camera on each pole arm and detector loops cut
// into the asphalt behind the stop lines, and down the long road a row of signals already green in
// sequence (green wave). Left-hand traffic (Indonesia): every inbound lane sits on the kerb side.
// No agency logos. Everything is a pure function of the frame (f = film frame on a 60 fps clock).

import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, LinearFilter, MeshBasicMaterial, Object3D, PCFShadowMap, SRGBColorSpace } from "three";
import { C } from "../../kits/voxelverse/lib/palette";
import { GlowPanes, VoxModel, type Pane } from "../../kits/voxelverse/lib/components";
import type { V3, Vox } from "../../kits/voxelverse/lib/voxel";
import { shrub } from "../../kits/voxelverse/lib/kit";
import { radialTex } from "../../kits/voxelverse/lib/textures";
import { FX_LAYER } from "../../kits/voxelverse/lib/layers";
import { hash } from "../../kits/voxelverse/core/noise";
import { cameraAt, type CamState, type Shot } from "../../kits/voxelverse/camera/rig";
import { CameraRig, Post } from "../../kits/voxelverse/camera/Post";
import { DuskLight, Environment, Fog, Sky } from "../../kits/voxelverse/world/Atmosphere";
import { Buildings, type BuildingSpec, type GlowFn, type Placement } from "../../kits/voxelverse/world/Building";
import { FONT, fontReady } from "../../core/type/fonts";

const FILM_FPS = 60;

/* ------------------------------------------------------------------ layout */
// Crossroads at the origin. The cross street runs along X, the long road along Z (it recedes away
// from the camera toward −Z). Plinth top is y = 0, walks sit at CURB.
const P = { minX: -16, maxX: 16, minZ: -52, maxZ: 16, road: 3.2, walk: 5.2, curb: 0.15, base: 3.0 };
const STOP = 6.3; // stop line distance from the centre
const ZEBRA: [number, number] = [3.6, 5.8];
const LANE = 1.6; // inbound lane centre offset
const WAVE_Z = [-19.5, -30.5, -41.5]; // mid-block crossings with their own signals (green wave)

type Arm = { name: string; dir: [number, number]; rotY: number; laneAt: (d: number) => [number, number]; count: number; cars: string[]; bikes: number };
// dir = direction of travel toward the centre; laneAt(d) = world xz of the inbound lane at distance d
const ARMS: Arm[] = [
  { name: "S", dir: [0, -1], rotY: Math.PI, laneAt: (d) => [-LANE, d], count: 12, cars: ["angkot", "sedan", "mpv", "sedan"], bikes: 5 },
  { name: "N", dir: [0, 1], rotY: 0, laneAt: (d) => [LANE, -d], count: 9, cars: ["mpv", "sedan", "truck", "sedan", "angkot", "mpv"], bikes: 4 },
  { name: "E", dir: [-1, 0], rotY: -Math.PI / 2, laneAt: (d) => [d, LANE], count: 4, cars: ["sedan", "mpv", "sedan"], bikes: 3 },
  { name: "W", dir: [1, 0], rotY: Math.PI / 2, laneAt: (d) => [-d, -LANE], count: 7, cars: ["mpv", "angkot", "sedan"], bikes: 3 },
];
const GREEN = new Set(["S", "N"]);

const rotate = (rotY: number, [x, y, z]: V3): V3 => {
  const c = Math.cos(rotY), s = Math.sin(rotY);
  return [x * c + z * s, y, -x * s + z * c];
};
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* ------------------------------------------------------------------ ground */
const ground = (v: Vox) => {
  const { minX, maxX, minZ, maxZ, road, walk, curb, base } = P;
  // asphalt: cross street, then the long road outside the junction box
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
  // centre lines: solid near the junction, dashed further out
  for (const s of [-1, 1]) {
    mark([s * (STOP), 0.02, -0.06], [s * 14, 0.034, 0.06]);
    for (let z = STOP; z < maxZ - 0.5; z += 2.6) if (z < 14 || s < 0) mark([-0.06, 0.02, s * z], [0.06, 0.034, s * z + s * 1.2]);
  }
  for (let z = -14; z > minZ + 1; z -= 2.6) if (!WAVE_Z.some((w) => Math.abs(z - w) < 2.5)) mark([-0.06, 0.02, z], [0.06, 0.034, z - 1.3]);
  mark([-0.06, 0.02, -STOP], [0.06, 0.034, -14]);
  // edge lines
  for (const s of [-1, 1]) {
    mark([minX, 0.02, s * (road - 0.3) - 0.05], [-walk, 0.032, s * (road - 0.3) + 0.05]);
    mark([walk, 0.02, s * (road - 0.3) - 0.05], [maxX, 0.032, s * (road - 0.3) + 0.05]);
  }
  // stop lines across each inbound half, zebras across each arm
  for (const a of ARMS) {
    const [lx, lz] = a.laneAt(STOP);
    if (a.dir[0] === 0) mark([lx - LANE + 0.1, 0.02, lz - 0.2], [lx + LANE - 0.1, 0.036, lz + 0.2]);
    else mark([lx - 0.2, 0.02, lz - LANE + 0.1], [lx + 0.2, 0.036, lz + LANE - 0.1]);
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

  // inductive detector loops: saw-cut rectangles with dark sealant behind each stop line
  const seal = 0x1c2022;
  for (const a of ARMS)
    for (const d of [STOP + 1.4, STOP + 4.4]) {
      const [cx, cz] = a.laneAt(d);
      const hx = a.dir[0] === 0 ? 0.85 : 1.0, hz = a.dir[0] === 0 ? 1.0 : 0.85;
      v.span([cx - hx, 0.02, cz - hz], [cx + hx, 0.03, cz - hz + 0.07], seal, { mat: "gloss", r: 0.003 });
      v.span([cx - hx, 0.02, cz + hz - 0.07], [cx + hx, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      v.span([cx - hx, 0.02, cz - hz], [cx - hx + 0.07, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      v.span([cx + hx - 0.07, 0.02, cz - hz], [cx + hx, 0.03, cz + hz], seal, { mat: "gloss", r: 0.003 });
      // lead-in cut to the kerb
      const [kx, kz] = a.dir[0] === 0 ? [Math.sign(cx) * road, cz] : [cx, Math.sign(cz) * road];
      v.span([Math.min(cx, kx) - 0.035, 0.02, Math.min(cz, kz) - 0.035], [Math.max(cx, kx) + 0.035, 0.03, Math.max(cz, kz) + 0.035], seal, { mat: "gloss", r: 0.003 });
    }

  // kerbs + pavers on the L-shaped walk of every quadrant, yards behind
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const zFar = sz > 0 ? maxZ : minZ;
      // kerb stones along both road edges of the quadrant
      v.span([sx > 0 ? road - 0.02 : sx * road - 0.16, -0.2, Math.min(sz * road, zFar)], [sx > 0 ? road + 0.16 : -road + 0.02, curb + 0.01, Math.max(sz * road, zFar)], C.stoneLight, { mat: "wet", r: 0.02 });
      const xFar = sx > 0 ? maxX : minX;
      v.span([Math.min(sx * road, xFar), -0.2, sz > 0 ? road - 0.02 : -road - 0.16], [Math.max(sx * road, xFar), curb + 0.01, sz > 0 ? road + 0.16 : -road + 0.02], C.stoneLight, { mat: "wet", r: 0.02 });
      const x0 = Math.min(sx * (road + 0.16), xFar), x1 = Math.max(sx * (road + 0.16), xFar);
      const z0 = Math.min(sz * (road + 0.16), zFar), z1 = Math.max(sz * (road + 0.16), zFar);
      for (let x = x0; x < x1 - 0.01; x += 0.62)
        for (let z = z0; z < z1 - 0.01; z += 0.62) {
          const mx = Math.abs(x + 0.31), mz = Math.abs(z + 0.31);
          if (mx > walk && mz > walk) continue;
          v.span([x + 0.015, curb - 0.2, z + 0.015], [Math.min(x + 0.605, x1), curb, Math.min(z + 0.605, z1)], v.rand() < 0.15 ? C.stoneDark : C.stone, { mat: "wet", r: 0.015, jitter: 0.07 });
        }
      // yard block behind the walks
      const yx0 = Math.min(sx * walk, xFar), yx1 = Math.max(sx * walk, xFar);
      const yz0 = Math.min(sz * walk, zFar), yz1 = Math.max(sz * walk, zFar);
      v.span([yx0, -0.2, yz0], [yx1, 0.06, yz1], C.cobble, { mat: "wet", jitter: 0.03, r: 0.01 });
    }

  // cut-away base: strata with pebbles, cable ducts, timber frame
  const cuts = [-0.2, -0.7, -1.6, -base];
  const sc = [C.stoneDark, 0x6b5543, 0x5a4636];
  for (let i = 0; i < cuts.length - 1; i++) v.span([minX, cuts[i + 1], minZ], [maxX, cuts[i], maxZ], sc[i], { r: 0.02 });
  for (let i = 0; i < 140; i++) {
    const onFront = v.rand() < 0.5;
    const y = -0.8 - v.rand() * (base - 1.0);
    const s = 0.08 + v.rand() * 0.16;
    const col = [0x7a6656, 0x8b7a68, 0x5c4a3c][Math.floor(v.rand() * 3)];
    if (onFront) v.box([minX + 0.5 + v.rand() * (maxX - minX - 1), y, maxZ + 0.02], [s, s * 0.7, 0.06], col, { jitter: 0.1 });
    else v.box([maxX + 0.02, y, minZ + 0.5 + v.rand() * (maxZ - minZ - 1)], [0.06, s * 0.7, s], col, { jitter: 0.1 });
  }
  for (const x of [-1.6, 1.2]) v.span([x - 0.22, -1.32, minZ - 0.05], [x + 0.22, -0.9, maxZ + 0.05], 0x3b3633, { r: 0.04 });
  v.span([minX - 0.18, -0.25, maxZ], [maxX + 0.18, 0.08, maxZ + 0.18], C.woodDark, { r: 0.02 });
  v.span([minX - 0.18, -0.25, minZ - 0.18], [maxX + 0.18, 0.08, minZ], C.woodDark, { r: 0.02 });
  v.span([minX - 0.18, -0.25, minZ], [minX, 0.08, maxZ], C.woodDark, { r: 0.02 });
  v.span([maxX, -0.25, minZ], [maxX + 0.18, 0.08, maxZ], C.woodDark, { r: 0.02 });
};

/* ------------------------------------------------------------------ vehicles */
type Car = { kind: string; pos: V3; rotY: number; color: number; seed: number };
const BODY = [C.cream, C.teal, 0xb8beb8, C.copper, 0x8f2f2a, C.stoneDark, 0xe7e2d6, C.tealDeep];
const ANGKOT = [0x2f7fb0, 0x3f9a6a, 0xd6a12c];
const LEN: Record<string, number> = { sedan: 4.1, mpv: 4.4, angkot: 4.3, truck: 5.6 };
const GAP = 1.15;

const CARS: Car[] = [];
const BIKES: { pos: V3; rotY: number; color: number; seed: number }[] = [];
ARMS.forEach((a, ai) => {
  // motorbikes wait in front, ahead of the car stop line (motorcycle box)
  for (let b = 0; b < a.bikes; b++) {
    const [x, z] = a.laneAt(STOP - 0.2 + 1.2 + Math.floor(b / 2) * 2.2);
    const off = (b % 2 ? 0.7 : -0.7) * (a.bikes === 1 ? 0 : 1);
    const p: V3 = a.dir[0] === 0 ? [x + off, P.curb * 0, z] : [x, 0, z + off];
    BIKES.push({ pos: p, rotY: a.rotY, color: [C.orange, 0x2a2f33, 0xb0352c, C.cream][(ai + b) % 4], seed: ai * 10 + b });
  }
  let d = STOP + 1.4 + Math.ceil(a.bikes / 2) * 2.2;
  a.cars.forEach((kind, i) => {
    const L = LEN[kind];
    const [x, z] = a.laneAt(d + L / 2);
    const seed = ai * 31 + i * 7 + 3;
    const color = kind === "angkot" ? ANGKOT[Math.floor(hash(seed) * ANGKOT.length)] : BODY[Math.floor(hash(seed * 3) * BODY.length)];
    CARS.push({ kind, pos: [x, 0, z], rotY: a.rotY, color, seed });
    d += L + GAP;
  });
});
// a few cars already rolling away on the green, outbound on the long road (left lane, x < 0)
[[-13, "sedan"], [-24.5, "mpv"], [-36, "angkot"], [-46, "sedan"]].forEach(([z, kind], i) =>
  CARS.push({ kind: kind as string, pos: [-LANE, 0, z as number], rotY: Math.PI, color: kind === "angkot" ? ANGKOT[i % 3] : BODY[(i * 3 + 1) % BODY.length], seed: 200 + i }),
);
// and one southbound car crossing the junction on the green
CARS.push({ kind: "sedan", pos: [LANE, 0, -1.2], rotY: 0, color: C.copper, seed: 300 });

const GLASS = 0x1e2a2d;
const carModel = (v: Vox, c: Car) => {
  const L = LEN[c.kind];
  const hl = L / 2;
  const W = c.kind === "truck" ? 1.95 : c.kind === "angkot" ? 1.65 : 1.75;
  const hw = W / 2;
  v.at(c.pos, c.rotY, () => {
    const body = c.color;
    const dark = 0x2a2e30;
    // wheels
    for (const sx of [-1, 1]) for (const z of [-hl + 0.85, hl - 0.85]) v.prismAlong([sx * (hw - 0.12), 0.33, z], [1, 0, 0], 0.33, 0.26, 0x1b1e1f, { sides: 10, mat: "satin" });
    if (c.kind === "truck") {
      // cab + box body
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
    // lower body
    v.span([-hw, 0.3, -hl + 0.1], [hw, beltY, hl - 0.1], body, { mat: "satin" });
    // bumpers
    v.span([-hw + 0.04, 0.28, hl - 0.15], [hw - 0.04, 0.55, hl + 0.02], dark, { mat: "satin" });
    v.span([-hw + 0.04, 0.28, -hl - 0.02], [hw - 0.04, 0.55, -hl + 0.15], dark, { mat: "satin" });
    // cabin: glass band with pillars, roof slab in body colour
    const cf = tall ? hl - 0.9 : hl - 1.35; // windscreen base
    const cb = tall ? -hl + 0.2 : -hl + 0.8;
    v.span([-hw + 0.08, beltY, cb], [hw - 0.08, roofY - 0.08, cf], GLASS, { mat: "gloss" });
    v.span([-hw + 0.04, roofY - 0.1, cb + 0.05], [hw - 0.04, roofY, cf - 0.2], body, { mat: "satin" });
    // pillars
    for (const sx of [-1, 1]) {
      v.span([sx * hw - 0.08 * sx - 0.04, beltY, cf - 0.12], [sx * hw - 0.08 * sx + 0.04, roofY - 0.05, cf], body, { mat: "satin" });
      v.span([sx * hw - 0.08 * sx - 0.04, beltY, cb], [sx * hw - 0.08 * sx + 0.04, roofY - 0.05, cb + 0.12], body, { mat: "satin" });
      v.span([sx * hw - 0.08 * sx - 0.04, beltY, (cf + cb) / 2 - 0.06], [sx * hw - 0.08 * sx + 0.04, roofY - 0.05, (cf + cb) / 2 + 0.06], body, { mat: "satin" });
    }
    // windscreen slope hint: a hood step
    v.span([-hw + 0.06, beltY - 0.02, cf], [hw - 0.06, beltY + 0.06, hl - 0.2], body, { mat: "satin" });
    if (c.kind === "angkot") {
      // side stripe, open rear door frame and roof rack
      for (const sx of [-1, 1]) v.span([sx * hw - 0.02, 0.62, -hl + 0.15], [sx * hw + 0.02 * sx, 0.74, hl - 0.15], 0xe8e0cc, { mat: "satin" });
      v.span([-hw + 0.2, roofY, cb + 0.3], [hw - 0.2, roofY + 0.06, cf - 0.4], 0x2a2e30, { mat: "metal" });
    }
    if (hash(c.seed * 5) > 0.8 && c.kind === "sedan") v.span([-0.3, roofY, -0.15], [0.3, roofY + 0.18, 0.15], 0xe7c25a, { mat: "satin" });
    // mirrors
    for (const sx of [-1, 1]) v.span([sx * (hw + 0.02) - 0.08, beltY + 0.05, cf - 0.3], [sx * (hw + 0.02) + 0.08, beltY + 0.18, cf - 0.15], body, { mat: "satin" });
  });
};

const bikeModel = (v: Vox, b: { pos: V3; rotY: number; color: number; seed: number }) => {
  v.at(b.pos, b.rotY, () => {
    for (const z of [-0.62, 0.62]) v.prismAlong([0, 0.3, z], [1, 0, 0], 0.3, 0.1, 0x1b1e1f, { sides: 10, mat: "satin" });
    v.span([-0.16, 0.35, -0.65], [0.16, 0.72, 0.45], b.color, { mat: "satin" });
    v.span([-0.18, 0.72, -0.6], [0.18, 0.82, 0.05], 0x222628, { mat: "fabric" });
    v.span([-0.12, 0.6, 0.45], [0.12, 1.05, 0.65], b.color, { mat: "satin" });
    v.span([-0.35, 1.0, 0.5], [0.35, 1.04, 0.56], 0x222628, { mat: "metal" });
    // rider: legs, torso, arms, helmet
    const shirt = [C.teal, 0x8c3b2e, C.cream, 0x3d4e7a][b.seed % 4];
    for (const sx of [-1, 1]) v.span([sx * 0.2 - 0.07, 0.45, -0.2], [sx * 0.2 + 0.07, 0.85, 0.25], 0x2f3438, { mat: "fabric" });
    v.span([-0.22, 0.82, -0.32], [0.22, 1.45, -0.02], shirt, { mat: "fabric" });
    for (const sx of [-1, 1]) v.rod([sx * 0.22, 1.35, -0.12], [sx * 0.3, 1.05, 0.5], 0.1, shirt, { mat: "fabric" });
    v.span([-0.16, 1.45, -0.27], [0.16, 1.55, -0.05], C.skin, { mat: "matte" });
    v.span([-0.18, 1.52, -0.32], [0.18, 1.82, 0.02], [0xe8e2d4, 0x2a2e30, C.orange, 0xb0352c][(b.seed * 7) % 4], { mat: "gloss" });
  });
};

const traffic = (v: Vox) => {
  for (const c of CARS) carModel(v, c);
  for (const b of BIKES) bikeModel(v, b);
};

const carLights = (): Pane[] => {
  const out: Pane[] = [];
  for (const c of CARS) {
    const hl = LEN[c.kind] / 2;
    const hw = (c.kind === "truck" ? 1.95 : 1.75) / 2;
    for (const sx of [-1, 1]) {
      out.push({ pos: add(c.pos, rotate(c.rotY, [sx * (hw - 0.3), 0.72, hl + 0.025])), size: [0.36, 0.14], rotY: c.rotY, tint: 0xfff0d2, glow: () => 1.6 });
      out.push({ pos: add(c.pos, rotate(c.rotY, [sx * (hw - 0.25), 0.78, -hl - 0.03])), size: [0.32, 0.16], rotY: c.rotY + Math.PI, tint: 0xff3020, glow: () => 2.6 });
    }
  }
  for (const b of BIKES) out.push({ pos: add(b.pos, rotate(b.rotY, [0, 0.62, -0.68])), size: [0.18, 0.1], rotY: b.rotY + Math.PI, tint: 0xff3020, glow: () => 2.6 });
  return out;
};

/* ------------------------------------------------------------------ signals */
// Each approach: a pole on the kerb-side corner at the stop line, a cantilever arm over the lane with a
// vertical 3-aspect head and a countdown box, plus a CCTV / detector camera on the arm looking down the
// approach. Heads face the approaching traffic.
type Signal = { pole: V3; rotY: number; reach: number; head: V3; cam: V3; green: boolean; wave?: number; countdown?: string };
const SIGNALS: Signal[] = [];
for (const a of ARMS) {
  const face = a.rotY + Math.PI; // the head looks back along the approach
  const [kx, kz] = a.laneAt(STOP + 0.6);
  // kerb side = away from the centre line
  const side: [number, number] = a.dir[0] === 0 ? [Math.sign(kx), 0] : [0, Math.sign(kz)];
  const pole: V3 = [kx + side[0] * (P.road - LANE + 0.55), P.curb, kz + side[1] * (P.road - LANE + 0.55)];
  const head: V3 = [kx, 5.0, kz];
  SIGNALS.push({ pole, rotY: face, reach: P.road - LANE + 0.55, head, cam: [pole[0] + (head[0] - pole[0]) * 0.35, 6.25, pole[2] + (head[2] - pole[2]) * 0.35], green: GREEN.has(a.name), countdown: GREEN.has(a.name) ? "18" : "42" });
}
// green wave: each signal down the road turns green a fixed offset after the one before it, timed to
// the platoon's travel speed. At the cover moment the first two are green and the farthest is still red.
const WAVE_GREEN = 2;
// green wave: mid-block crossings down the long road, heads facing the outbound (southbound-away) lane
WAVE_Z.forEach((z, i) => {
  SIGNALS.push({ pole: [-P.road - 0.55, P.curb, z + 1.6], rotY: 0, reach: P.road - LANE + 0.55, head: [-LANE, 5.0, z + 1.6], cam: [-P.road + 0.2, 6.25, z + 1.6], green: i < WAVE_GREEN, wave: i });
});

const signalModel = (v: Vox) => {
  const metal = 0x30373a;
  for (const s of SIGNALS) {
    const [px, py, pz] = s.pole;
    // base, pole, arm to above the lane
    v.prism([px, py + 0.12, pz], 0.22, 0.24, metal, { sides: 8, mat: "metal" });
    v.prism([px, py + 3.3, pz], 0.1, 6.4, metal, { sides: 8, mat: "metal" });
    v.rod([px, 6.35, pz], [s.head[0], 6.35, s.head[2]], 0.11, metal, { mat: "metal" });
    v.rod([px, 5.7, pz], [px + (s.head[0] - px) * 0.45, 6.33, pz + (s.head[2] - pz) * 0.45], 0.06, metal, { mat: "metal" });
    // drop to the head
    v.span([s.head[0] - 0.04, 5.85, s.head[2] - 0.04], [s.head[0] + 0.04, 6.35, s.head[2] + 0.04], metal, { mat: "metal" });
    v.at(s.head, s.rotY, () => {
      // backplate with a reflective yellow border, housing, visors
      v.span([-0.36, -0.95, -0.2], [0.36, 0.95, -0.16], 0x15191a, { mat: "satin" });
      for (const [a, b] of [[[-0.36, 0.89], [0.36, 0.95]], [[-0.36, -0.95], [0.36, -0.89]], [[-0.36, -0.95], [-0.3, 0.95]], [[0.3, -0.95], [0.36, 0.95]]] as [number, number][][])
        v.span([a[0], a[1], -0.155], [b[0], b[1], -0.145], 0xe6c23a, { mat: "satin" });
      v.span([-0.23, -0.78, -0.16], [0.23, 0.78, 0.1], 0x1f2426, { mat: "satin" });
      for (const y of [0.5, 0, -0.5]) {
        v.span([-0.2, y + 0.17, 0.1], [0.2, y + 0.21, 0.36], 0x1f2426, { mat: "satin" });
        for (const sx of [-1, 1]) v.span([sx * 0.2 - 0.02, y + 0.02, 0.1], [sx * 0.2 + 0.02, y + 0.21, 0.28], 0x1f2426, { mat: "satin" });
      }
      // countdown box beside the head
      if (s.countdown) v.span([0.4, -0.3, -0.14], [1.02, 0.3, 0.1], 0x1f2426, { mat: "satin" });
    });
    // camera / detector on the arm, looking down the approach
    v.at(s.cam, s.rotY, () => {
      v.span([-0.05, -0.12, -0.05], [0.05, 0.05, 0.05], metal, { mat: "metal" });
      v.at([0, -0.2, 0.05], [0.35, 0, 0], () => {
        v.span([-0.13, -0.11, -0.3], [0.13, 0.11, 0.32], 0xd8d4ca, { mat: "satin" });
        v.span([-0.16, 0.11, -0.34], [0.16, 0.14, 0.4], 0xc9c4b8, { mat: "satin" });
        v.prismAlong([0, 0, 0.33], [0, 0, 1], 0.075, 0.04, 0x0e1112, { sides: 10, mat: "gloss" });
      });
    });
  }
};

const LAMP_COLORS = { red: 0xff2a18, amber: 0xffa21a, green: 0x2cff8a };
const signalPanes = (): Pane[] => {
  const out: Pane[] = [];
  for (const s of SIGNALS) {
    const lamp = (y: number, tint: number, on: boolean) =>
      out.push({ pos: add(s.head, rotate(s.rotY, [0, y, 0.105])), size: [0.32, 0.32], rotY: s.rotY, tint, glow: () => (on ? 7 : 0.05) });
    lamp(0.5, LAMP_COLORS.red, !s.green);
    lamp(0, LAMP_COLORS.amber, false);
    lamp(-0.5, LAMP_COLORS.green, s.green);
    // camera status LED
    out.push({ pos: add(s.cam, rotate(s.rotY, [0.09, -0.12, 0.3])), size: [0.05, 0.05], rotY: s.rotY, tint: 0x5ef6ff, glow: () => 6 });
  }
  return out;
};

/* ------------------------------------------------------------------ city */
const W = (cz: number): Placement => ({ pos: [-P.walk, 0, cz], rotY: Math.PI / 2 });
const E = (cz: number): Placement => ({ pos: [P.walk, 0, cz], rotY: -Math.PI / 2 });
const CITY: { spec: BuildingSpec; at: Placement }[] = [
  { at: W(-9.3), spec: { w: 7.6, depth: 7.4, ground: 3.6, floors: [3.1, 3.1], wall: "plaster", wallColor: C.cream, trim: C.teal, win: "tall", bays: 3, winW: 0.95, winH: 1.8, roof: "flat", roofColor: C.stoneDark, shop: "bakery", shopColor: C.teal, extras: ["shutters", "plants", "ac"], seed: 51 } },
  { at: W(-16.2), spec: { w: 5.6, depth: 7, ground: 3.4, floors: [3.0, 3.0, 3.0], wall: "brick", wallColor: C.brick, trim: C.cream, win: "arched", bays: 2, winW: 1.0, winH: 1.9, roof: "mansard", roofColor: C.tealDeep, shop: "workshop", shopColor: C.copper, extras: ["balconies", "plants"], seed: 52 } },
  { at: W(-25.2), spec: { w: 7.4, depth: 7.4, ground: 3.8, floors: [3.2, 3.2, 3.2], wall: "stone", wallColor: C.stoneLight, trim: C.stoneDark, win: "band", bays: 3, winW: 1.0, winH: 1.6, roof: "stepped", roofColor: C.stone, shop: "arcade", shopColor: C.stoneDark, extras: ["ac", "tank"], seed: 53 } },
  { at: W(-36.2), spec: { w: 8.2, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1, 3.1], wall: "plaster", wallColor: C.plasterRose, trim: C.creamDark, win: "pair", bays: 3, winW: 1.5, winH: 1.5, roof: "flat", roofColor: C.copperPatina, shop: "cinema", shopColor: C.tealDeep, extras: ["tower"], seed: 54 } },
  { at: W(-46.4), spec: { w: 7.6, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1], wall: "brick", wallColor: C.brickDark, trim: C.stoneLight, win: "tall", bays: 3, winW: 0.9, winH: 1.8, roof: "saw", roofColor: C.copperPatina, shop: "market", shopColor: C.copper, seed: 55 } },
  { at: E(-8.9), spec: { w: 6.8, depth: 7.4, ground: 3.8, floors: [3.2], wall: "brick", wallColor: C.brickLight, trim: C.cream, win: "arched", bays: 3, winW: 1.1, winH: 2.0, roof: "gable", roofColor: C.copperDark, shop: "market", shopColor: C.orange, extras: ["chimney", "plants"], seed: 61 } },
  { at: E(-16.4), spec: { w: 5.4, depth: 7, ground: 3.4, floors: [3.0, 3.0, 3.0, 3.0], wall: "plaster", wallColor: C.plasterWarm, trim: C.teal, win: "square", bays: 2, winW: 1.1, winH: 1.3, roof: "flat", roofColor: C.stoneDark, shop: "bakery", shopColor: C.copper, extras: ["fireEscape", "ac"], seed: 62 } },
  { at: E(-25.0), spec: { w: 7.8, depth: 7.4, ground: 3.6, floors: [3.1, 3.1], wall: "stone", wallColor: C.stone, trim: C.copper, win: "round", bays: 3, winW: 1.1, winH: 1.5, roof: "mansard", roofColor: C.copperPatina, shop: "workshop", shopColor: C.tealDeep, extras: ["balconies", "shutters"], seed: 63 } },
  { at: E(-36.0), spec: { w: 8.0, depth: 7.4, ground: 3.6, floors: [3.2, 3.2, 3.2, 3.2, 3.2], wall: "plaster", wallColor: C.tealPale, trim: C.stoneDark, win: "band", bays: 3, winW: 1.0, winH: 1.5, roof: "flat", roofColor: C.stoneDark, shop: "arcade", shopColor: C.stoneDark, extras: ["tank", "ac"], seed: 64 } },
  { at: E(-46.2), spec: { w: 7.8, depth: 7.4, ground: 3.6, floors: [3.1, 3.1, 3.1], wall: "brick", wallColor: C.brick, trim: C.cream, win: "pair", bays: 3, winW: 1.4, winH: 1.5, roof: "gable", roofColor: C.tealDeep, shop: "depot", extras: ["chimney"], seed: 65 } },
  // low warung row on the near-left corner
  { at: W(10.4), spec: { w: 8.4, depth: 6.4, ground: 3.6, floors: [], wall: "plaster", wallColor: C.plasterWarm, trim: C.copper, win: "square", bays: 3, winW: 1.0, winH: 1.0, roof: "gable", roofColor: C.copperDark, shop: "market", shopColor: C.teal, seed: 66 } },
];

const windowGlow: GlowFn = ({ floor, seed, shop }) => {
  if (shop) return () => 1.05;
  const off = hash(seed * 5 + 2) > 0.78;
  const k = 0.7 + hash(seed * 7) * 0.6;
  return () => (off ? 0 : k * (floor > 2 ? 0.85 : 1));
};

/* street furniture: lamps, a small corner park with trees and a bench */
const STREETLAMPS: [number, number, number][] = [[-4.4, -13.5, 1], [4.4, -21.5, -1], [-4.4, -33.5, 1], [4.4, -44, -1], [-11, 4.4, 0], [11, -4.4, 0]];
const furniture = (v: Vox) => {
  const metal = 0x2a2f31;
  for (const [x, z, out] of STREETLAMPS) {
    v.prism([x, P.curb + 0.12, z], 0.15, 0.24, metal, { sides: 8, mat: "metal" });
    v.span([x - 0.05, P.curb, z - 0.05], [x + 0.05, 4.6, z + 0.05], metal, { mat: "metal", r: 0.015 });
    if (out) v.span([x, 4.5, z - 0.04], [x + out * 0.85, 4.58, z + 0.04], metal, { mat: "metal", r: 0.01 });
    else v.span([x - 0.04, 4.5, z], [x + 0.04, 4.58, z + Math.sign(-z) * 0.85], metal, { mat: "metal", r: 0.01 });
  }
  // park in the near-right quadrant
  const px0 = P.walk + 0.3, pz0 = P.walk + 0.3;
  v.span([px0, 0.06, pz0], [P.maxX - 0.3, 0.22, P.maxZ - 0.3], 0x56704a, { mat: "foliage", jitter: 0.04 });
  for (let x = px0; x < P.maxX - 0.3; x += 0.62) v.span([x + 0.02, 0.06, pz0 - 0.2], [x + 0.6, 0.42, pz0 + 0.02], C.stoneLight, { r: 0.03, jitter: 0.05 });
  for (let z = pz0; z < P.maxZ - 0.3; z += 0.62) v.span([px0 - 0.2, 0.06, z + 0.02], [px0 + 0.02, 0.42, z + 0.6], C.stoneLight, { r: 0.03, jitter: 0.05 });
  const trees: V3[] = [[7.6, 0.2, 8.0], [11.5, 0.2, 7.4], [9.2, 0.2, 12.3], [13.6, 0.2, 11.2], [-13.5, 0.2, -1 * 0 + 7.0]];
  for (const [x, y, z] of trees) {
    v.span([x - 0.12, y, z - 0.12], [x + 0.12, y + 2.2, z + 0.12], C.woodDark, { r: 0.03 });
    shrub(v, [x, y + 2.3, z], 1.5);
    shrub(v, [x + 0.4, y + 3.0, z - 0.3], 1.1, 1);
  }
  // bench + path
  v.span([9.0, 0.22, 9.6], [10.6, 0.5, 9.95], C.wood, { r: 0.02 });
  v.span([9.0, 0.5, 9.95], [10.6, 0.85, 10.05], C.wood, { r: 0.02 });
  for (let i = 0; i < 9; i++) v.span([6 + i * 0.95, 0.22, 6.0 + i * 0.8], [6.6 + i * 0.95, 0.25, 6.6 + i * 0.8], C.stone, { r: 0.02, jitter: 0.06 });
  // a parked motorbike and a cart by the warung
  v.at([-4.3, P.curb, 9.0], 0, () => {
    v.span([-0.5, 0.5, -0.4], [0.5, 1.2, 0.4], C.cream, { mat: "satin" });
    v.span([-0.55, 1.2, -0.45], [0.55, 1.28, 0.45], C.orange, { mat: "fabric" });
    for (const sx of [-1, 1]) v.prismAlong([sx * 0.55, 0.3, 0], [1, 0, 0], 0.3, 0.08, 0x1b1e1f, { sides: 10 });
  });
};
const LAMP_PANES: Pane[] = STREETLAMPS.map(([x, z, out]) => {
  const pos: V3 = out ? [x + out * 0.7, 4.45, z] : [x, 4.45, z + Math.sign(-z) * 0.7];
  return { pos, size: [0.34, 0.34], rotY: 0, tint: 0xffcf86, glow: () => 2.8 };
});

/* ------------------------------------------------------------------ overlays in the world */
const useFontReady = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep053 cover font"));
  useEffect(() => {
    fontReady().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

const chipTexture = (n: number, green: boolean) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 300;
  const g = c.getContext("2d")!;
  const r = 46;
  const rr = (x: number, y: number, w: number, h: number) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const accent = green ? "#5cffa4" : "#ff6a4a";
  rr(10, 10, 492, 220);
  g.fillStyle = "rgba(14,26,28,0.9)";
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = accent;
  g.stroke();
  // pointer
  g.beginPath();
  g.moveTo(226, 228);
  g.lineTo(256, 288);
  g.lineTo(286, 228);
  g.closePath();
  g.fillStyle = accent;
  g.fill();
  // car glyph
  g.fillStyle = accent;
  g.fillRect(48, 112, 110, 44);
  g.fillRect(70, 82, 66, 34);
  g.fillStyle = "rgba(14,26,28,1)";
  g.beginPath();
  g.arc(74, 158, 15, 0, Math.PI * 2);
  g.arc(134, 158, 15, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = accent;
  g.beginPath();
  g.arc(74, 158, 9, 0, Math.PI * 2);
  g.arc(134, 158, 9, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f6ecd6";
  g.textBaseline = "middle";
  g.textAlign = "right";
  g.font = `600 150px '${FONT}'`;
  g.fillText(String(n), 470, 128);
  g.font = `600 30px '${FONT}'`;
  g.textAlign = "left";
  g.fillStyle = accent;
  g.fillText("ANTRE", 50, 196);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  t.anisotropy = 8;
  return t;
};

const countdownTexture = (txt: string, color: string) => {
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
  g.fillText(txt, 128, 136);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  return t;
};

const billboard = (cam: CamState) => {
  const o = new Object3D();
  o.position.set(...cam.pos);
  o.lookAt(...cam.at);
  o.rotateY(Math.PI); // planes face +Z; turn them toward the lens
  return o.quaternion.clone();
};

const QueueChips: React.FC<{ cam: CamState; ok: boolean }> = ({ cam, ok }) => {
  const q = useMemo(() => billboard(cam), [cam]);
  const items = useMemo(
    () =>
      ok
        ? ARMS.map((a) => {
            const [x, z] = a.laneAt(a.name === "N" ? STOP + 7.5 : a.name === "S" ? STOP + 2.2 : STOP + 3.2);
            return { pos: [x, 4.4, z] as V3, foot: [x, 1.9, z] as V3, mat: new MeshBasicMaterial({ map: chipTexture(a.count, GREEN.has(a.name)), transparent: true, toneMapped: false, depthWrite: false, fog: false }), green: GREEN.has(a.name) };
          })
        : [],
    [ok],
  );
  return (
    <group>
      {items.map((it, i) => (
        <group key={i}>
          <mesh position={it.pos} quaternion={q} material={it.mat} renderOrder={20} layers={FX_LAYER}>
            <planeGeometry args={[2.9, 1.7]} />
          </mesh>
          {/* leader down to the queue */}
          <mesh position={[it.foot[0], (it.foot[1] + it.pos[1] - 0.85) / 2, it.foot[2]]} layers={FX_LAYER}>
            <boxGeometry args={[0.035, it.pos[1] - 0.85 - it.foot[1], 0.035]} />
            <meshBasicMaterial color={it.green ? 0x5cffa4 : 0xff6a4a} toneMapped={false} transparent opacity={0.7} fog={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Countdowns: React.FC<{ ok: boolean }> = ({ ok }) => {
  const items = useMemo(
    () =>
      ok
        ? SIGNALS.filter((s) => s.countdown).map((s) => ({
            pos: add(s.head, rotate(s.rotY, [0.71, 0, 0.105])),
            rotY: s.rotY,
            mat: new MeshBasicMaterial({ map: countdownTexture(s.countdown!, s.green ? "#4dff98" : "#ff3a24"), toneMapped: false, color: 0xffffff }),
          }))
        : [],
    [ok],
  );
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} rotation={[0, it.rotY, 0]} material={it.mat}>
          <planeGeometry args={[0.56, 0.54]} />
        </mesh>
      ))}
    </group>
  );
};

/** Halos around lit signal lenses and lamps, ground pools under the green wave (FX layer). */
const Halos: React.FC<{ cam: CamState }> = ({ cam }) => {
  const q = useMemo(() => billboard(cam), [cam]);
  const tex = useMemo(radialTex, []);
  const halos = useMemo(() => {
    const out: { pos: V3; size: number; color: number; opacity: number }[] = [];
    for (const s of SIGNALS) {
      const y = s.green ? -0.5 : 0.5;
      out.push({ pos: add(s.head, rotate(s.rotY, [0, y, 0.3])), size: s.wave !== undefined ? 2.6 : 2.0, color: s.green ? LAMP_COLORS.green : LAMP_COLORS.red, opacity: 0.55 });
    }
    for (const p of LAMP_PANES) out.push({ pos: [p.pos[0], p.pos[1] - 0.1, p.pos[2]], size: 2.2, color: 0xffb469, opacity: 0.35 });
    return out;
  }, []);
  const pools = useMemo(() => {
    const out: { pos: V3; w: number; d: number; color: number; opacity: number }[] = [];
    for (const s of SIGNALS) {
      if (s.green) out.push({ pos: [s.head[0], 0.06, s.head[2] + (s.wave !== undefined ? 3 : 0)], w: 4.5, d: 9, color: LAMP_COLORS.green, opacity: 0.22 });
      else out.push({ pos: [s.head[0], 0.06, s.head[2]], w: 5, d: 5, color: LAMP_COLORS.red, opacity: 0.2 });
    }
    return out;
  }, []);
  return (
    <group>
      {halos.map((h, i) => (
        <mesh key={i} position={h.pos} quaternion={q} layers={FX_LAYER} renderOrder={10}>
          <planeGeometry args={[h.size, h.size]} />
          <meshBasicMaterial map={tex} color={h.color} transparent opacity={h.opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ))}
      {pools.map((p, i) => (
        <mesh key={`p${i}`} position={p.pos} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={9}>
          <planeGeometry args={[p.w, p.d]} />
          <meshBasicMaterial map={tex} color={p.color} transparent opacity={p.opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

/** What the pole cameras see: a faint frustum from each approach camera to its detection zone. */
const SensorViews: React.FC = () => {
  const { geo, zones } = useMemo(() => {
    const pos: number[] = [];
    const zones: { c: V3; w: number; d: number; rot: number }[] = [];
    for (let i = 0; i < ARMS.length; i++) {
      const a = ARMS[i];
      const s = SIGNALS[i];
      const apex = add(s.cam, [0, -0.2, 0]);
      const near = a.laneAt(STOP + 0.4), far = a.laneAt(STOP + 13);
      const hw = 1.45;
      const corners: V3[] =
        a.dir[0] === 0
          ? [[near[0] - hw, 0.05, near[1]], [near[0] + hw, 0.05, near[1]], [far[0] + hw, 0.05, far[1]], [far[0] - hw, 0.05, far[1]]]
          : [[near[0], 0.05, near[1] - hw], [near[0], 0.05, near[1] + hw], [far[0], 0.05, far[1] + hw], [far[0], 0.05, far[1] - hw]];
      for (let k = 0; k < 4; k++) pos.push(...apex, ...corners[k], ...corners[(k + 1) % 4]);
      zones.push({ c: [(near[0] + far[0]) / 2, 0.055, (near[1] + far[1]) / 2], w: a.dir[0] === 0 ? hw * 2 : Math.abs(far[0] - near[0]), d: a.dir[0] === 0 ? Math.abs(far[1] - near[1]) : hw * 2, rot: 0 });
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    return { geo, zones };
  }, []);
  const zoneTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(255,255,255,1)";
    g.lineWidth = 10;
    g.strokeRect(5, 5, 246, 246);
    g.lineWidth = 3;
    for (let k = 1; k < 4; k++) {
      g.beginPath();
      g.moveTo(0, k * 64);
      g.lineTo(256, k * 64);
      g.stroke();
    }
    const t = new CanvasTexture(c);
    t.minFilter = LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, []);
  return (
    <group>
      <mesh geometry={geo} layers={FX_LAYER} renderOrder={8}>
        <meshBasicMaterial color={0x46e6ff} transparent opacity={0.07} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
      </mesh>
      {zones.map((z, i) => (
        <mesh key={i} position={z.c} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={9}>
          <planeGeometry args={[z.w, z.d]} />
          <meshBasicMaterial map={zoneTex} color={0x46e6ff} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ camera */
const SHOTS: Shot[] = [
  {
    name: "cover",
    from: 0,
    to: 60,
    keys: [
      { f: 0, pos: [5, 25, 43], at: [-0.4, 0, -2.5], fov: 47 },
      { f: 60, pos: [4.8, 24.9, 42.6], at: [-0.4, 0, -2.5], fov: 47 },
    ],
    focus: () => [0, 1, 0],
    aperture: 0.00035,
    maxBlur: 0.006,
    exposure: 1.05,
    fog: 0.006,
  },
];

const World: React.FC<{ f: number }> = ({ f }) => {
  const cam = cameraAt(SHOTS, f);
  const ok = true;
  const glow = useMemo(() => windowGlow, []);
  const carPanes = useMemo(carLights, []);
  const sigPanes = useMemo(signalPanes, []);
  return (
    <>
      <CameraRig cam={cam} />
      <Sky boost={0.92} />
      <Environment />
      <Fog density={cam.fog} />
      <DuskLight from={[-18, 28, 20]} size={40} intensity={1.0} fill={0.6} />
      <VoxModel build={ground} seed={53} castShadow={false} />
      <Buildings list={CITY} glow={glow} f={f} />
      <VoxModel build={traffic} seed={54} />
      <VoxModel build={signalModel} seed={55} />
      <VoxModel build={furniture} seed={56} />
      <GlowPanes panes={carPanes} f={f} />
      <GlowPanes panes={sigPanes} f={f} />
      <GlowPanes panes={LAMP_PANES} f={f} />
      <Countdowns ok={ok} />
      {STREETLAMPS.slice(0, 4).map(([x, z, out], i) => (
        <pointLight key={i} position={[x + out * 0.7, 4.1, z]} color={C.lampWarm} intensity={9} distance={9} decay={2} />
      ))}
      {/* signal spill: green on the long approaches, red on the cross street */}
      {SIGNALS.slice(0, 4).map((s, i) => (
        <pointLight key={`s${i}`} position={[s.head[0], 4.2, s.head[2]]} color={s.green ? 0x3dff90 : 0xff3a22} intensity={10} distance={8} decay={2} />
      ))}
      <SensorViews />
      <Halos cam={cam} />
      <QueueChips cam={cam} ok={ok} />
      <Post cam={cam} frame={f} />
    </>
  );
};

/* ------------------------------------------------------------------ title overlay */
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, color: "#f6ecd6", pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, background: "linear-gradient(rgba(16,24,25,0) 0%, rgba(16,24,25,0.78) 40%, rgba(16,24,25,0.95) 100%)" }} />
    <div style={{ position: "absolute", left: 72, right: 72, top: 1190 }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.32em", color: "#f2a33a" }}>AUDIRA EXPLAINED</div>
      <div style={{ fontSize: 112, fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.02em", marginTop: 18, textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>
        Lampu Merah
        <br />
        yang Bisa
        <br />
        <span style={{ color: "#6dffaa" }}>Berpikir?</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const ok = useFontReady();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1d2a2b" }}>
      {ok && <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        camera={{ fov: 44, near: 0.03, far: 600, position: [0, 3, 10] }}>
        <World f={f} />
      </ThreeCanvas>}
      <Overlay />
    </AbsoluteFill>
  );
};
