// ROBLOX FAKTA UNIK EP01 — 5 Fakta Unik Roblox yang 99% Pemain Tidak Tahu
// VOXELVERSE style: chamfered voxel dioramas, dusk copper-teal palette, DOCUMENTARY_WARM finish.
// 90 s × 60 fps = 5400 film frames. VO-synced scene cuts at beat boundaries.

import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { C } from "../../kits/voxelverse/lib/palette";
import { VoxModel } from "../../kits/voxelverse/lib/components";
import type { V3, Vox } from "../../kits/voxelverse/lib/voxel";
import { cameraAt, type Shot } from "../../kits/voxelverse/camera/rig";
import { CameraRig, Post } from "../../kits/voxelverse/camera/Post";
import { DuskLight, Environment, Fog, Sky } from "../../kits/voxelverse/world/Atmosphere";
import { clamp, lerp, ramp } from "../../kits/voxelverse/core/motion";
import { hash } from "../../kits/voxelverse/core/noise";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

export const ROBLOX_FAKTA_SECONDS = 90;
const FILM_FPS = 60;
const s = (sec: number) => Math.round(sec * FILM_FPS);

// VO beat boundaries (from vo-words.json analysis)
const B = {
  hook:    { from: 0,        to: s(3.86)  },
  context: { from: s(3.86),  to: s(19.88) },
  oof:     { from: s(19.88), to: s(33.89) },
  trophy:  { from: s(33.89), to: s(46.72) },
  dominus: { from: s(46.72), to: s(59.44) },
  ekonomi: { from: s(59.44), to: s(69.67) },
  payoff:  { from: s(69.67), to: s(84.01) },
  outro:   { from: s(84.01), to: s(90)    },
};

type Beat = keyof typeof B;
const beatAt = (f: number): Beat => {
  if (f < B.context.from) return "hook";
  if (f < B.oof.from)     return "context";
  if (f < B.trophy.from)  return "oof";
  if (f < B.dominus.from) return "trophy";
  if (f < B.ekonomi.from) return "dominus";
  if (f < B.payoff.from)  return "ekonomi";
  if (f < B.outro.from)   return "payoff";
  return "outro";
};

// --- Scene 0: HOOK — DynaBlocks → Roblox logo ---
const buildHookLogo = (v: Vox) => {
  // "DYNABLOCKS" text as voxel blocks, slightly tilted
  const letters = "ROBLOX";
  for (let i = 0; i < letters.length; i++) {
    const x = (i - 2.5) * 1.6;
    v.box([x, 2.5, 0], [1.2, 1.6, 1.2], C.amber, { jitter: 0.08 });
    v.box([x, 2.5, 0], [0.8, 1.2, 0.8], C.orange, { mat: "gloss" });
  }
  // Pedestal
  v.span([-6, 0, -3], [6, 0.4, 3], C.stoneDark, { mat: "satin" });
  // Fog particles (decorative voxel cubes scattered)
  for (let i = 0; i < 20; i++) {
    const a = hash(i * 7) * Math.PI * 2;
    const r = 2 + hash(i * 13) * 5;
    const y = 1 + hash(i * 19) * 4;
    v.box([Math.cos(a) * r, y, Math.sin(a) * r], [0.3, 0.3, 0.3], C.tealSoft, { jitter: 0.2, mat: "satin" });
  }
};

const HOOK_SHOTS: Shot[] = [{
  name: "logo reveal", from: 0, to: B.hook.to,
  keys: [
    { f: 0, pos: [0, 2.5, 8], at: [0, 2.5, 0], fov: 48 },
    { f: B.hook.to, pos: [-2, 3.5, 6], at: [0, 2.2, 0], fov: 44 },
  ],
  focus: () => [0, 2.5, 0] as V3,
  aperture: 0.0012, maxBlur: 0.008, exposure: 1.0, fog: 0.008, handheld: 0.003,
}];

// --- Scene 1: CONTEXT — Garage 2004, two figures, CRT ---
const buildGarage = (v: Vox) => {
  // Garage floor
  v.span([-5, 0, -4], [5, 0.15, 5], C.asphalt);
  // Back wall
  v.span([-5, 0, -4], [5, 4.5, -3.8], C.plasterWarm, { jitter: 0.03 });
  // Side walls
  v.span([-5, 0, -4], [-4.8, 4.5, 5], C.plasterWarm, { jitter: 0.03 });
  v.span([4.8, 0, -4], [5, 4.5, 5], C.plasterWarm, { jitter: 0.03 });
  // Garage door (half open)
  v.span([-3, 2.2, 4.8], [3, 4.5, 5], C.stoneDark, { mat: "metal" });
  // Desk with CRT monitor
  v.span([-2, 0.15, -2], [2, 0.9, 0], C.wood);
  // CRT monitor
  v.box([0, 1.5, -1], [1.4, 1.1, 1.0], C.stoneDark, { mat: "satin" });
  v.box([0, 1.5, -0.6], [1.1, 0.8, 0.1], 0x2244aa, { mat: "gloss" }); // screen glow
  // Keyboard
  v.box([0, 0.95, 0.3], [1.0, 0.08, 0.4], C.ink, { mat: "satin" });
  // Chair
  v.box([-2.8, 0.5, -0.5], [0.6, 0.06, 0.6], C.brick);
  v.span([-3.0, 0.15, -0.8], [-2.6, 0.5, -0.2], C.ink, { mat: "metal" });
  // Figure 1 (David) — simplified blocky person
  v.box([1.2, 1.3, 0.5], [0.5, 0.8, 0.3], C.teal); // torso
  v.box([1.2, 1.9, 0.5], [0.35, 0.35, 0.35], C.skin); // head
  v.box([1.2, 0.6, 0.5], [0.22, 0.7, 0.22], C.stoneDark); // legs
  // Figure 2 (Erik)
  v.box([-1.5, 1.3, 0.8], [0.5, 0.8, 0.3], C.copper); // torso
  v.box([-1.5, 1.9, 0.8], [0.35, 0.35, 0.35], C.skin); // head
  v.box([-1.5, 0.6, 0.8], [0.22, 0.7, 0.22], C.ink); // legs
  // Shelf with boxes
  v.span([3, 1.2, -3.5], [4.5, 1.3, -2.5], C.wood);
  v.box([3.4, 1.6, -3], [0.6, 0.5, 0.5], C.brick, { jitter: 0.1 });
  v.box([4.0, 1.6, -3], [0.5, 0.4, 0.5], C.amber, { jitter: 0.1 });
  // Single lamp above
  v.prism([0, 4.2, -1], 0.3, 0.15, C.amber, { sides: 8, mat: "gloss" });
};

const CONTEXT_SHOTS: Shot[] = [{
  name: "garage zoom out", from: B.context.from, to: B.context.to,
  keys: [
    { f: B.context.from, pos: [0.5, 1.8, 2.5], at: [0, 1.4, -1], fov: 52 },
    { f: s(10), pos: [-3, 2.5, 4], at: [0, 1.5, -0.5], fov: 48 },
    { f: B.context.to, pos: [-6, 4.5, 7], at: [0, 1.5, 0], fov: 44 },
  ],
  focus: (f) => f < s(10) ? [0, 1.5, -1] as V3 : [0, 2, 0] as V3,
  aperture: (f) => lerp(0.0015, 0.0006, clamp((f - B.context.from) / s(12))),
  maxBlur: 0.009, exposure: 0.95, fog: 0.014, handheld: 0.004,
}];

// --- Scene 2: OOF — Character falls, sound wave, Messiah arcade ---
const buildOofScene = (v: Vox) => {
  // Platform
  v.span([-6, 0, -5], [6, 0.2, 6], C.cobble);
  // Falling character (mid-air pose, tilted)
  v.at([-1, 3.5, 0], [0, 0, 0.3], () => {
    v.box([0, 0, 0], [0.5, 0.8, 0.3], C.teal); // torso
    v.box([0, 0.6, 0], [0.35, 0.35, 0.35], C.skin); // head
    v.box([-0.2, -0.6, 0], [0.2, 0.6, 0.2], C.stoneDark); // left leg
    v.box([0.2, -0.5, 0.1], [0.2, 0.6, 0.2], C.stoneDark); // right leg (kicked out)
    v.box([-0.4, 0.2, 0], [0.14, 0.5, 0.14], C.teal); // left arm up
    v.box([0.4, 0.1, 0], [0.14, 0.5, 0.14], C.teal); // right arm
  });
  // "OOF" text blocks (big, behind character)
  const oofLetters = [0, 2.2, 4.4]; // O, O, F positions
  for (const dx of oofLetters) {
    v.box([dx - 2, 2, -3], [1.6, 2.0, 0.6], C.orange, { mat: "gloss", jitter: 0.05 });
  }
  // Sound wave rings (concentric arcs)
  for (let i = 0; i < 5; i++) {
    const r = 1.5 + i * 0.8;
    for (let a = -0.6; a < 0.6; a += 0.15) {
      v.box([Math.cos(a) * r - 1, 3.5 + Math.sin(a) * r * 0.3, -1.5], [0.15, 0.15, 0.15],
        i % 2 === 0 ? C.amber : C.orange, { mat: "gloss" });
    }
  }
  // Arcade cabinet (Messiah reference)
  v.span([3, 0.2, 1], [5, 2.2, 2.5], C.ink, { mat: "satin" });
  v.box([4, 2.6, 1.75], [1.6, 0.6, 0.1], 0x33aa55, { mat: "gloss" }); // screen
  v.box([4, 1.7, 2.6], [0.8, 0.1, 0.3], C.stoneDark, { mat: "metal" }); // controls
  // Copyright symbol (red block)
  v.box([4, 3.2, 1.75], [0.5, 0.5, 0.3], 0xcc3333, { mat: "gloss" });
};

const OOF_SHOTS: Shot[] = [{
  name: "oof impact", from: B.oof.from, to: B.oof.to,
  keys: [
    { f: B.oof.from, pos: [2, 3, 7], at: [-1, 3, 0], fov: 50 },
    { f: s(25), pos: [-3, 2.5, 5], at: [0, 2.5, -1], fov: 46 },
    { f: B.oof.to, pos: [5, 3, 4], at: [3, 2, 1.5], fov: 42 },
  ],
  focus: (f) => f < s(26) ? [-1, 3.5, 0] as V3 : [4, 2.5, 1.75] as V3,
  aperture: 0.001, maxBlur: 0.008, exposure: 1.0, fog: 0.01, handheld: 0.005,
}];

// --- Scene 3: TROPHY — Museum, glass case, golden trophy ---
const buildMuseum = (v: Vox) => {
  // Museum floor (dark, polished)
  v.span([-7, 0, -5], [7, 0.15, 6], C.stoneDark, { mat: "gloss" });
  // Back wall
  v.span([-7, 0, -5], [7, 5, -4.7], C.stoneDark, { mat: "satin" });
  // Glass case pedestal
  v.span([-1, 0.15, -1], [1, 1.0, 1], C.stone, { mat: "satin" });
  // Glass case (four thin walls)
  v.span([-0.8, 1.0, -0.8], [0.8, 3.0, -0.75], 0x88bbcc, { mat: "gloss" }); // front
  v.span([-0.8, 1.0, 0.75], [0.8, 3.0, 0.8], 0x88bbcc, { mat: "gloss" }); // back
  v.span([-0.8, 1.0, -0.8], [-0.75, 3.0, 0.8], 0x88bbcc, { mat: "gloss" }); // left
  v.span([0.75, 1.0, -0.8], [0.8, 3.0, 0.8], 0x88bbcc, { mat: "gloss" }); // right
  // Golden trophy (small, on pedestal inside case)
  v.box([0, 1.3, 0], [0.3, 0.15, 0.3], C.amber, { mat: "metal" }); // base
  v.prism([0, 1.8, 0], 0.15, 0.6, C.amber, { sides: 8, mat: "metal" }); // stem
  v.box([0, 2.3, 0], [0.4, 0.3, 0.2], C.amber, { mat: "metal" }); // cup top
  // "8" counter display
  v.box([0, 3.5, -4.5], [1.2, 0.8, 0.1], C.orange, { mat: "gloss" });
  // Spotlights above
  for (const x of [-3, 0, 3]) {
    v.prism([x, 4.8, 0], 0.2, 0.15, C.cream, { sides: 6 });
  }
  // Shedletsky avatar (standing beside case)
  v.box([2.5, 1.0, 0], [0.5, 0.8, 0.3], C.brick); // torso
  v.box([2.5, 1.6, 0], [0.35, 0.35, 0.35], C.skin); // head
  v.box([2.5, 0.35, 0], [0.22, 0.6, 0.22], C.ink); // legs
  // Other empty pedestals (items "lost")
  for (const x of [-4, -2.5, 4, 5.5]) {
    v.span([x - 0.4, 0.15, -1], [x + 0.4, 0.8, 0], C.stone, { mat: "satin" });
  }
};

const TROPHY_SHOTS: Shot[] = [{
  name: "museum track", from: B.trophy.from, to: B.trophy.to,
  keys: [
    { f: B.trophy.from, pos: [-5, 2.5, 6], at: [0, 2, 0], fov: 44 },
    { f: s(38), pos: [-1, 2.2, 3.5], at: [0, 1.8, 0], fov: 38 },
    { f: B.trophy.to, pos: [3, 2.5, 4], at: [1, 2, 0], fov: 42 },
  ],
  focus: () => [0, 2, 0] as V3,
  aperture: (f) => lerp(0.0008, 0.0014, ramp(f, B.trophy.from, s(40))),
  maxBlur: 0.008, exposure: 1.05, fog: 0.006, handheld: 0.003,
}];

// --- Scene 4: DOMINUS — Gold podium, crown, money stacks ---
const buildDominus = (v: Vox) => {
  // Floor
  v.span([-7, 0, -5], [7, 0.15, 6], C.asphalt);
  // Central podium
  v.span([-1.5, 0.15, -1.5], [1.5, 1.8, 1.5], C.amber, { mat: "metal", jitter: 0.03 });
  // Dominus crown (iconic hat shape)
  v.box([0, 2.5, 0], [1.2, 0.5, 1.2], C.amber, { mat: "metal" }); // base band
  v.box([0, 3.0, 0], [1.0, 0.3, 1.0], C.amber, { mat: "metal" }); // top
  // Crown spikes
  for (const p of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4], [0, 0]]) {
    v.box([p[0], 3.4, p[1]], [0.2, 0.4, 0.2], C.amber, { mat: "metal" });
  }
  // Ruby gem in crown center
  v.box([0, 3.1, 0.55], [0.2, 0.2, 0.1], 0xcc2244, { mat: "gloss" });
  // Money stacks (left side)
  for (let i = 0; i < 6; i++) {
    const x = -4 + (i % 3) * 1.2;
    const z = -1 + Math.floor(i / 3) * 1.5;
    const h = 0.5 + hash(i * 7) * 1.5;
    v.span([x - 0.4, 0.15, z - 0.3], [x + 0.4, 0.15 + h, z + 0.3], 0x44aa44, { jitter: 0.1 });
  }
  // Robux coins (right side)
  for (let i = 0; i < 8; i++) {
    const a = hash(i * 11) * Math.PI * 2;
    const r = 2.5 + hash(i * 13) * 2;
    v.prism([Math.cos(a) * r + 3, 0.5 + hash(i * 17) * 2, Math.sin(a) * r], 0.25, 0.08, C.amber, { sides: 12, mat: "metal" });
  }
  // Price tag floating
  v.box([0, 4.5, 0], [2.5, 0.6, 0.1], C.orange, { mat: "gloss" });
};

const DOMINUS_SHOTS: Shot[] = [{
  name: "dominus orbit", from: B.dominus.from, to: B.dominus.to,
  keys: [
    { f: B.dominus.from, pos: [0, 2.5, 7], at: [0, 2.5, 0], fov: 46 },
    { f: s(53), pos: [5, 3.5, 4], at: [0, 2.5, 0], fov: 42 },
    { f: B.dominus.to, pos: [3, 5, -2], at: [0, 2, 0], fov: 44 },
  ],
  focus: () => [0, 2.5, 0] as V3,
  aperture: 0.0008, maxBlur: 0.007, exposure: 1.05, fog: 0.008, handheld: 0.003,
}];

// --- Scene 5: EKONOMI — Skyline, $1.5B, creator podiums, coins ---
const buildEkonomi = (v: Vox) => {
  // Ground
  v.span([-8, 0, -6], [8, 0.1, 7], C.asphalt);
  // Skyline buildings (varying heights)
  const towers: [number, number, number][] = [
    [-6, 8, 2], [-4, 6, 1.8], [-2, 10, 2.2], [0, 7, 1.6], [2, 12, 2],
    [4, 5, 1.8], [6, 9, 2.1],
  ];
  for (const [x, h, w] of towers) {
    v.span([x - w / 2, 0.1, -5], [x + w / 2, h, -3], C.tealDeep, { jitter: 0.06 });
    // Windows
    for (let wy = 1; wy < h - 0.5; wy += 1.2) {
      for (let wx = x - w / 2 + 0.3; wx < x + w / 2 - 0.3; wx += 0.6) {
        v.box([wx, wy, -2.95], [0.3, 0.5, 0.05], C.amberHot, { mat: "gloss" });
      }
    }
  }
  // Creator figures on podiums (10 small)
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 2.5;
    const h = 0.5 + hash(i * 3) * 0.8;
    v.span([x - 0.4, 0.1, 2], [x + 0.4, h, 2.8], C.amber, { mat: "metal" });
    // Mini figure
    v.box([x, h + 0.5, 2.4], [0.3, 0.5, 0.2], [C.teal, C.copper, C.orange, C.brick, C.cream][i]);
    v.box([x, h + 0.95, 2.4], [0.22, 0.22, 0.22], C.skin);
  }
  // Falling coins
  for (let i = 0; i < 15; i++) {
    const x = -5 + hash(i * 7) * 10;
    const y = 2 + hash(i * 11) * 6;
    const z = -1 + hash(i * 13) * 4;
    v.prism([x, y, z], 0.18, 0.06, C.amber, { sides: 10, mat: "metal" });
  }
};

const EKONOMI_SHOTS: Shot[] = [{
  name: "ekonomi skyline", from: B.ekonomi.from, to: B.ekonomi.to,
  keys: [
    { f: B.ekonomi.from, pos: [0, 3, 10], at: [0, 4, -2], fov: 50 },
    { f: B.ekonomi.to, pos: [-4, 5, 8], at: [0, 4, -2], fov: 46 },
  ],
  focus: () => [0, 4, 0] as V3,
  aperture: 0.0005, maxBlur: 0.006, exposure: 1.0, fog: 0.005, handheld: 0.003,
}];

// --- Scene 6: PAYOFF — Zoom out from garage to giant city ---
const buildPayoff = (v: Vox) => {
  // Huge city ground
  v.span([-15, 0, -12], [15, 0.1, 13], C.asphalt);
  // Tiny garage (bottom center — callback to scene 1)
  v.span([-1, 0.1, 4], [1, 1.2, 5.5], C.plasterWarm, { jitter: 0.03 });
  // Massive city surrounding it
  for (let i = 0; i < 40; i++) {
    const x = -14 + hash(i * 7) * 28;
    const z = -11 + hash(i * 11) * 22;
    if (Math.abs(x) < 2 && z > 3) continue; // skip over garage
    const h = 2 + hash(i * 13) * 10;
    const w = 1 + hash(i * 17) * 2;
    v.span([x - w / 2, 0.1, z - w / 2], [x + w / 2, h, z + w / 2],
      [C.tealDeep, C.stoneDark, C.brick, C.plasterWarm][i % 4], { jitter: 0.05 });
    // Some lit windows
    if (h > 5) {
      for (let wy = 1; wy < h - 1; wy += 1.5) {
        v.box([x, wy, z + w / 2 + 0.02], [0.3, 0.4, 0.03], C.amberHot, { mat: "gloss" });
      }
    }
  }
  // Big counter overlay voxels: "126.5M"
  for (let i = 0; i < 8; i++) {
    const a = hash(i * 23) * Math.PI * 2;
    const r = 3 + hash(i * 29) * 4;
    v.box([Math.cos(a) * r, 8 + hash(i * 31) * 3, Math.sin(a) * r],
      [0.6, 0.6, 0.6], C.amber, { mat: "gloss", jitter: 0.1 });
  }
};

const PAYOFF_SHOTS: Shot[] = [{
  name: "payoff zoom out", from: B.payoff.from, to: B.payoff.to,
  keys: [
    { f: B.payoff.from, pos: [0, 4, 16], at: [0, 1.5, 4.5], fov: 48 },
    { f: s(76), pos: [-6, 20, 24], at: [0, 3, 0], fov: 42 },
    { f: B.payoff.to, pos: [-12, 28, 28], at: [0, 2, 0], fov: 38 },
  ],
  focus: (f) => f < s(76) ? [0, 1.5, 4.5] as V3 : [0, 3, 0] as V3,
  aperture: (f) => lerp(0.001, 0.0003, ramp(f, B.payoff.from, B.payoff.to)),
  maxBlur: 0.006, exposure: 1.0, fog: 0.002, handheld: 0.003,
}];

// --- Scene 7: OUTRO — Dioramas sink, AUDIRA logo ---
const buildOutro = (v: Vox) => {
  // "AUDIRA" letters as voxel blocks
  const letters = "AUDIRA";
  for (let i = 0; i < letters.length; i++) {
    const x = (i - 2.5) * 1.8;
    v.box([x, 2.5, 0], [1.3, 1.8, 1.0], C.teal, { jitter: 0.06 });
    v.box([x, 2.5, 0.1], [0.9, 1.4, 0.1], C.amber, { mat: "gloss" });
  }
  // Accent glow ring
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 5;
    v.box([Math.cos(a) * r, 0.5, Math.sin(a) * r], [0.3, 0.3, 0.3], C.copper, { mat: "metal" });
  }
  // Ground disc
  v.prism([0, 0, 0], 7, 0.3, C.stoneDark, { sides: 24, mat: "satin" });
};

const OUTRO_SHOTS: Shot[] = [{
  name: "outro", from: B.outro.from, to: B.outro.to,
  keys: [
    { f: B.outro.from, pos: [0, 3.5, 9], at: [0, 2.5, 0], fov: 44 },
    { f: B.outro.to, pos: [0, 4, 10], at: [0, 2.5, 0], fov: 42 },
  ],
  focus: () => [0, 2.5, 0] as V3,
  aperture: 0.0006, maxBlur: 0.006, exposure: 1.0, fog: 0.005, handheld: 0.002,
}];

// --- All shots merged for the camera system ---
const ALL_SHOTS: Shot[] = [
  ...HOOK_SHOTS,
  ...CONTEXT_SHOTS,
  ...OOF_SHOTS,
  ...TROPHY_SHOTS,
  ...DOMINUS_SHOTS,
  ...EKONOMI_SHOTS,
  ...PAYOFF_SHOTS,
  ...OUTRO_SHOTS,
];

// --- Scene component ---
const SceneGroup: React.FC<{ beat: Beat; visible: boolean; f: number }> = ({ beat, visible, f }) => {
  if (!visible) return null;
  const builders: Record<Beat, (v: Vox) => void> = {
    hook: buildHookLogo,
    context: buildGarage,
    oof: buildOofScene,
    trophy: buildMuseum,
    dominus: buildDominus,
    ekonomi: buildEkonomi,
    payoff: buildPayoff,
    outro: buildOutro,
  };
  return <VoxModel build={builders[beat]} seed={42 + beat.length} />;
};

// --- Main world ---
const World: React.FC<{ f: number }> = ({ f }) => {
  const beat = beatAt(f);
  const cam = cameraAt(ALL_SHOTS, f);

  return (
    <>
      <CameraRig cam={cam} />
      <Sky boost={beat === "outro" ? 0.6 : 0.85} />
      <Environment intensity={0.4} />
      <Fog density={cam.fog} />
      <DuskLight from={[-16, 30, 26]} size={22} intensity={1.1} />
      {/* Render only the active scene */}
      <SceneGroup beat="hook" visible={beat === "hook"} f={f} />
      <SceneGroup beat="context" visible={beat === "context"} f={f} />
      <SceneGroup beat="oof" visible={beat === "oof"} f={f} />
      <SceneGroup beat="trophy" visible={beat === "trophy"} f={f} />
      <SceneGroup beat="dominus" visible={beat === "dominus"} f={f} />
      <SceneGroup beat="ekonomi" visible={beat === "ekonomi"} f={f} />
      <SceneGroup beat="payoff" visible={beat === "payoff"} f={f} />
      <SceneGroup beat="outro" visible={beat === "outro"} f={f} />
      <Post cam={cam} frame={f} />
    </>
  );
};

export const RobloxFaktaFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1d2a2b" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: PCFShadowMap }}
        dpr={1.5}
        gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        camera={{ fov: 44, near: 0.03, far: 600, position: [0, 3, 10] }}
      >
        <World f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} envIntensity={0.4} />
      </ThreeCanvas>
      {/* VO audio */}
      <Audio src={staticFile("audio/roblox-fakta-ep01.wav")} volume={1} />
    </AbsoluteFill>
  );
};
