// EP048 cover — "Bagaimana Mobil Dirakit?" in BUILDFORGE.
// A roofless (cut-away) car plant seen from above in daylight. One assembly line runs diagonally from the
// lower left to the upper right, one car per stage: 01 press (a side panel stamped from a steel blank),
// 02 body-in-white (bare steel frame welded by three orange robots, sparks), 03 paint (body sprayed in a
// glass booth), 04 final assembly: the finished car rolling off the line. Mint blueprint seats mark each station.
// Deterministic: everything derives from useCurrentFrame(); hash() is a seeded pure function.

import React, { useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, FX_LAYER, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, fontReady } from "../../core/type/fonts.ts";
import { createSky, skyEnvironment, type SkyLook } from "../../kits/buildforge/environment/Sky.ts";
import { concreteTexture } from "../../kits/buildforge/materials/textures.ts";

const W = 1080;
const H = 1920;

export const C = {
  ink: "#1f2426",
  soft: "#6a7174",
  accent: "#e0782f", // industrial orange (robots, kicker)
  mint: "#7fd8b8",
  floor: "#e6e1d7",
  paint: "#2a7fa0",
  steel: "#c3c8cc",
  cream: "#efe9df",
};

export const SKY: SkyLook = { zenith: "#5f9ad6", horizon: "#e6eeef", ground: "#cbc8b3", sun: "#fff0d6", cloud: "#fdfcf9" };
export const SUN = new THREE.Vector3(-0.45, 0.82, 0.38).normalize();

export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

// ---------- line layout (metres) ----------
// Stations along +x; the camera sits at -x/+z so x grows toward the upper right of the frame.
const ST = [-10.2, -3.4, 3.4, 10.2];
export const LINE_Y = 0.42; // top of the conveyor skids

// ---------- materials ----------
export const std = (color: string, roughness = 0.6, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
export const M = {
  bare: std("#c9ced2", 0.32, 0.85),
  bareDark: std("#9aa1a6", 0.38, 0.8),
  blank: std("#cfd3d6", 0.36, 0.7),
  paint: new THREE.MeshPhysicalMaterial({ color: C.paint, roughness: 0.28, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.06 }),
  glass: new THREE.MeshPhysicalMaterial({ color: "#cfe6ef", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.02 }),
  seat: std("#3a3734", 0.8),
  cabinOpen: std("#2a2f33", 0.85),
  tire: std("#1e1f21", 0.82),
  rim: std("#d9dcde", 0.25, 0.9),
  head: std("#f6f4ec", 0.2, 0, { emissive: "#fff4dc", emissiveIntensity: 0.9 }),
  tail: std("#a8231c", 0.3, 0, { emissive: "#c0261d", emissiveIntensity: 0.6 }),
  trim: std("#26292c", 0.55, 0.2),
  robot: std(C.accent, 0.42, 0.1),
  robotDark: std("#2f3133", 0.5, 0.4),
  robotWhite: std("#f1efe9", 0.45, 0.05),
  cream: std(C.cream, 0.7),
  creamDark: std("#d6cfc3", 0.75),
  rail: std("#4a4d50", 0.42, 0.7),
  roller: std("#9da3a7", 0.3, 0.85),
  column: std("#e6e2da", 0.6, 0.1),
  truss: std("#bfc3c5", 0.45, 0.6),
  hazardY: std("#f0c040", 0.6),
  wall: std("#f2eee7", 0.88),
  boothGlass: new THREE.MeshPhysicalMaterial({ color: "#dff1f2", roughness: 0.08, metalness: 0, transmission: 0, transparent: true, opacity: 0.22, depthWrite: false }),
  lamp: std("#fbf7ee", 0.4, 0, { emissive: "#fff6e2", emissiveIntensity: 1.4 }),
  grass: std("#a9c08e", 0.95),
  pallet: std("#c69a66", 0.75),
};

// ---------- car geometry (length along x, front at +x; base on y = 0) ----------
export const WB = 1.36; // wheel centre x
export const WR = 0.34; // wheel radius
export const AR = 0.43; // arch radius

export const silhouette = (withCabin: boolean) => {
  const s = new THREE.Shape();
  s.moveTo(-2.22, 0.3);
  s.lineTo(-WB - AR, 0.3);
  s.absarc(-WB, WR, AR, Math.PI, 0, true);
  s.lineTo(WB - AR, 0.3);
  s.absarc(WB, WR, AR, Math.PI, 0, true);
  s.lineTo(2.2, 0.3);
  s.quadraticCurveTo(2.34, 0.34, 2.32, 0.56);
  s.quadraticCurveTo(2.3, 0.76, 2.12, 0.8);
  s.lineTo(0.92, 0.98);
  if (withCabin) {
    s.quadraticCurveTo(0.55, 1.28, 0.22, 1.43);
    s.quadraticCurveTo(-0.45, 1.5, -1.1, 1.42);
    s.quadraticCurveTo(-1.42, 1.25, -1.62, 1.02);
  } else {
    s.lineTo(-1.62, 1.0);
  }
  s.lineTo(-2.12, 0.98);
  s.quadraticCurveTo(-2.32, 0.92, -2.3, 0.62);
  s.quadraticCurveTo(-2.3, 0.36, -2.22, 0.3);
  return s;
};

export const cabinShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0.9, 0.96);
  s.quadraticCurveTo(0.55, 1.28, 0.22, 1.43);
  s.quadraticCurveTo(-0.45, 1.5, -1.1, 1.42);
  s.quadraticCurveTo(-1.42, 1.25, -1.62, 0.96);
  s.lineTo(0.9, 0.96);
  return s;
};

export const extrude = (shape: THREE.Shape, depth: number, bevel = 0.05) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
};

export const mesh = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
  const o = new THREE.Mesh(g, m);
  o.castShadow = cast;
  o.receiveShadow = true;
  return o;
};
export const boxAt = (sx: number, sy: number, sz: number, x: number, y: number, z: number, m: THREE.Material) => {
  const o = mesh(new THREE.BoxGeometry(sx, sy, sz), m);
  o.position.set(x, y, z);
  return o;
};

export const wheel = (x: number, z: number) => {
  const g = new THREE.Group();
  const t = mesh(new THREE.CylinderGeometry(WR, WR, 0.24, 36), M.tire);
  t.rotation.x = Math.PI / 2;
  const r = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 24), M.rim);
  r.rotation.x = Math.PI / 2;
  const hub = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.27, 12), M.trim);
  hub.rotation.x = Math.PI / 2;
  g.add(t, r, hub);
  g.position.set(x, WR, z);
  return g;
};

/** Painted body (stage 3) or finished car (stage 4). */
const car = (finished: boolean) => {
  const g = new THREE.Group();
  g.add(mesh(extrude(silhouette(false), 1.66, 0.07), M.paint));
  // greenhouse: glass when finished, open dark cabin while still in the paint shop
  if (finished) {
    const gl = mesh(extrude(cabinShape(), 1.38, 0.06), M.glass, false);
    gl.renderOrder = 2;
    g.add(gl);
  }
  // interior seen through the glass / open window frames: seats, dashboard, steering wheel
  for (const x of [0.05, -0.95]) for (const z of [-0.38, 0.38]) {
    g.add(boxAt(0.5, 0.14, 0.5, x, 1.05, z, M.seat));
    g.add(boxAt(0.12, 0.55, 0.48, x - 0.26, 1.3, z, M.seat));
  }
  g.add(boxAt(0.35, 0.18, 1.5, 0.62, 1.07, 0, M.trim));
  const sw = mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), M.trim);
  sw.position.set(0.42, 1.2, -0.38);
  sw.rotation.y = Math.PI / 2;
  sw.rotation.x = 0.5;
  g.add(sw);
  // roof skin and pillars in body colour
  g.add(boxAt(1.18, 0.05, 1.42, -0.42, 1.455, 0, M.paint));
  for (const z of [-0.69, 0.69]) {
    const a = boxAt(0.07, 0.62, 0.06, 0.56, 1.2, z, M.paint);
    a.rotation.z = 0.93;
    const b = boxAt(0.1, 0.48, 0.06, -0.42, 1.2, z, M.paint);
    const c = boxAt(0.1, 0.56, 0.06, -1.36, 1.2, z, M.paint);
    c.rotation.z = -0.78;
    g.add(a, b, c);
  }
  // lights + trim
  for (const z of [-0.58, 0.58]) {
    g.add(boxAt(0.08, 0.1, 0.36, 2.29, 0.66, z, M.head));
    g.add(boxAt(0.08, 0.1, 0.34, -2.33, 0.78, z, M.tail));
  }
  g.add(boxAt(0.06, 0.12, 0.9, 2.33, 0.45, 0, M.trim)); // grille
  g.add(boxAt(4.1, 0.05, 1.72, 0, 0.3, 0, M.trim)); // sill shadow line
  // door seams
  for (const z of [-0.835, 0.835]) {
    g.add(boxAt(0.012, 0.5, 0.01, 0.62, 0.72, z, M.trim));
    g.add(boxAt(0.012, 0.5, 0.01, -0.42, 0.72, z, M.trim));
    g.add(boxAt(0.012, 0.5, 0.01, -1.42, 0.72, z, M.trim));
  }
  if (finished) {
    for (const x of [-WB, WB]) for (const z of [-0.74, 0.74]) g.add(wheel(x, z));
  }
  return g;
};

/** Side frame panel (stamped part, also the BIW side): silhouette with door/window apertures. */
export const sideShape = () => {
  const s = silhouette(true);
  const front = new THREE.Path();
  front.moveTo(-0.38, 0.46);
  front.lineTo(0.84, 0.46);
  front.lineTo(0.8, 0.97);
  front.quadraticCurveTo(0.5, 1.24, 0.18, 1.35);
  front.lineTo(-0.38, 1.37);
  front.lineTo(-0.38, 0.46);
  const rear = new THREE.Path();
  rear.moveTo(-0.9, 0.5);
  rear.lineTo(-0.5, 0.5);
  rear.lineTo(-0.5, 1.37);
  rear.lineTo(-1.06, 1.35);
  rear.quadraticCurveTo(-1.32, 1.2, -1.48, 1.02);
  rear.lineTo(-0.9, 0.98);
  rear.lineTo(-0.9, 0.5);
  s.holes.push(front, rear);
  return s;
};

export const sidePanel = (m: THREE.Material) => mesh(extrude(sideShape(), 0.05, 0.02), m);

/** Body-in-white: two side frames, floor pan, roof bows, cross members, strut towers. */
export const bodyInWhite = () => {
  const g = new THREE.Group();
  for (const z of [-0.82, 0.82]) {
    const p = sidePanel(M.bare);
    p.position.z = z;
    g.add(p);
  }
  g.add(boxAt(4.3, 0.06, 1.62, 0, 0.36, 0, M.bareDark)); // floor pan
  for (const z of [-0.5, 0.5]) g.add(boxAt(4.4, 0.12, 0.12, 0, 0.3, z, M.bareDark)); // rails
  // roof bows + rails
  for (const x of [0.2, -0.42, -1.05]) g.add(boxAt(0.08, 0.06, 1.66, x, x > 0 ? 1.42 : 1.44, 0, M.bare));
  g.add(boxAt(0.08, 0.08, 1.66, 0.88, 0.97, 0, M.bare)); // cowl
  g.add(boxAt(0.08, 0.08, 1.66, -1.62, 1.0, 0, M.bare)); // rear header
  g.add(boxAt(0.08, 0.3, 1.66, 2.22, 0.55, 0, M.bare)); // front bumper beam
  g.add(boxAt(0.08, 0.3, 1.66, -2.24, 0.6, 0, M.bare));
  for (const z of [-0.5, 0.5]) {
    g.add(boxAt(0.36, 0.42, 0.3, 1.36, 0.76, z * 1.12, M.bareDark)); // strut towers
    g.add(boxAt(0.36, 0.36, 0.3, -1.36, 0.72, z * 1.12, M.bareDark));
  }
  g.add(boxAt(0.06, 0.5, 1.5, -0.42, 0.68, 0, M.bareDark)); // seat cross member
  return g;
};

// ---------- conveyor ----------
const conveyor = (x0: number, x1: number) => {
  const g = new THREE.Group();
  const L = x1 - x0;
  const cx = (x0 + x1) / 2;
  for (const z of [-0.62, 0.62]) {
    g.add(boxAt(L, 0.16, 0.14, cx, LINE_Y - 0.1, z, M.rail));
    for (let x = x0 + 0.3; x < x1; x += 0.55) {
      const r = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 14), M.roller);
      r.rotation.x = Math.PI / 2;
      r.position.set(x, LINE_Y - 0.02, z);
      g.add(r);
    }
  }
  for (let x = x0 + 0.6; x < x1; x += 2.4) {
    for (const z of [-0.62, 0.62]) g.add(boxAt(0.12, LINE_Y - 0.12, 0.12, x, (LINE_Y - 0.12) / 2, z, M.rail));
  }
  return g;
};

const skid = () => {
  const g = new THREE.Group();
  for (const z of [-0.62, 0.62]) g.add(boxAt(4.2, 0.08, 0.12, 0, LINE_Y + 0.08, z, M.robotDark));
  for (const x of [-1.6, 0, 1.6]) g.add(boxAt(0.12, 0.08, 1.36, x, LINE_Y + 0.08, 0, M.robotDark));
  for (const x of [-1.3, 1.3]) for (const z of [-0.5, 0.5]) g.add(boxAt(0.1, 0.16, 0.1, x, LINE_Y + 0.2, z, M.robotDark));
  return g;
};

// ---------- six-axis robot ----------
export type Pose = { yaw: number; shoulder: number; elbow: number; wrist: number };
const robot = (pose: Pose, mat: THREE.Material, scale = 1) => {
  const root = new THREE.Group();
  root.add(boxAt(0.9, 0.12, 0.9, 0, 0.06, 0, M.robotDark));
  const base = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.42, 28), mat);
  base.position.y = 0.33;
  root.add(base);
  const turret = new THREE.Group();
  turret.position.y = 0.54;
  turret.rotation.y = pose.yaw;
  root.add(turret);
  const tbody = mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 24), mat);
  tbody.position.y = 0.15;
  turret.add(tbody);
  const joint = (r: number, w: number, m: THREE.Material = M.robotDark) => {
    const j = mesh(new THREE.CylinderGeometry(r, r, w, 24), m);
    j.rotation.x = Math.PI / 2;
    return j;
  };
  const shoulder = new THREE.Group();
  shoulder.position.set(0.12, 0.42, 0);
  shoulder.rotation.z = pose.shoulder;
  turret.add(shoulder);
  shoulder.add(joint(0.2, 0.5));
  const upper = mesh(new THREE.BoxGeometry(0.28, 1.5, 0.3), mat);
  upper.position.y = 0.75;
  shoulder.add(upper);
  const elbow = new THREE.Group();
  elbow.position.y = 1.5;
  elbow.rotation.z = pose.elbow;
  shoulder.add(elbow);
  elbow.add(joint(0.17, 0.44));
  const motor = mesh(new THREE.BoxGeometry(0.36, 0.34, 0.36), mat);
  motor.position.set(-0.18, 0, 0);
  elbow.add(motor);
  const fore = mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.25, 20), mat);
  fore.rotation.z = -Math.PI / 2;
  fore.position.x = 0.62;
  elbow.add(fore);
  const wrist = new THREE.Group();
  wrist.position.x = 1.25;
  wrist.rotation.z = pose.wrist;
  elbow.add(wrist);
  wrist.add(joint(0.1, 0.24));
  const tool = mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), M.robotDark);
  tool.position.y = -0.22;
  wrist.add(tool);
  const tip = new THREE.Object3D();
  tip.position.y = -0.46;
  wrist.add(tip);
  // hose along the arm
  const hose = mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 24, Math.PI), M.robotDark);
  hose.position.set(0.1, 0.9, 0.2);
  hose.rotation.z = Math.PI / 2;
  shoulder.add(hose);
  root.scale.setScalar(scale);
  return { root, tip };
};

/** Aim a robot so its tool tip lands near `target` (simple 2-link IK in the turret plane). */
export const aimRobot = (base: THREE.Vector3, target: THREE.Vector3, scale: number, wristDown = true): Pose => {
  const d = new THREE.Vector3().subVectors(target, base);
  const yaw = Math.atan2(-d.z, d.x);
  const r = Math.hypot(d.x, d.z) / scale - 0.12;
  const toolLen = 0.46;
  const y = d.y / scale - 0.96 + toolLen; // shoulder height (0.54 + 0.42) and wrist above the tip
  const L1 = 1.5;
  const L2 = 1.25;
  const D = Math.min(L1 + L2 - 0.01, Math.hypot(r, y));
  // shoulder angle measured from +y, rotating toward +x is negative z rotation
  const a = Math.atan2(r, y);
  const b = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D));
  const th1 = a - b; // upper arm angle from vertical toward target (elbow up)
  const ex = L1 * Math.sin(th1);
  const ey = L1 * Math.cos(th1);
  const fa = Math.atan2(y - ey, r - ex); // forearm angle from +x
  const shoulder = -th1;
  // forearm local +x is the upper arm's frame rotated by shoulder; world angle of forearm = PI/2 + shoulder + elbow
  const elbow = fa - shoulder;
  const wrist = wristDown ? -fa : 0;
  return { yaw, shoulder, elbow, wrist };
};

// ---------- sparks (additive, FX layer) ----------
const sparks = (seed: number, frame: number) => {
  const pos: number[] = [];
  const col: number[] = [];
  const N = 120;
  for (let i = 0; i < N; i++) {
    const h1 = hash(seed + i * 7.1);
    const h2 = hash(seed + i * 3.3 + 11);
    const h3 = hash(seed + i * 1.7 + 29);
    const life = (h3 + frame * 0.045) % 1;
    const az = h1 * Math.PI * 2;
    const sp = 1.2 + h2 * 2.6;
    const vx = Math.cos(az) * sp * 0.8;
    const vz = Math.sin(az) * sp * 0.8;
    const vy = 0.6 + h2 * 1.2;
    const t = life * 0.6;
    const p = (tt: number) => [vx * tt, vy * tt - 4.9 * tt * tt, vz * tt];
    const a = p(t);
    const b = p(Math.max(0, t - 0.05 - h2 * 0.04));
    const k = 1 - life;
    pos.push(...a, ...b);
    col.push(1.0 * k * 3, 0.82 * k * 2.6, 0.45 * k * 1.6, 1.0 * k, 0.5 * k, 0.15 * k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  l.layers.set(FX_LAYER);
  l.frustumCulled = false;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.2, 2.2), toneMapped: false }));
  glow.layers.set(FX_LAYER);
  const grp = new THREE.Group();
  grp.add(l, glow);
  for (let i = 0; i < 36; i++) {
    const j = i * 3;
    const k = 1 - ((hash(seed + j * 1.7 + 29) + frame * 0.045) % 1);
    const sp = glowSprite(new THREE.Color(1, 0.72, 0.35), 0.1 + 0.12 * k, 0.9 * k);
    sp.position.set(pos[j * 6], pos[j * 6 + 1], pos[j * 6 + 2]);
    grp.add(sp);
  }
  return grp;
};

export const glowSprite = (color: THREE.Color, size: number, opacity: number) => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sp.scale.setScalar(size);
  sp.layers.set(FX_LAYER);
  return sp;
};

/** Paint mist: soft cone of sprites from a nozzle toward the body. */
const mist = (from: THREE.Vector3, to: THREE.Vector3, frame: number) => {
  const g = new THREE.Group();
  const col = new THREE.Color(C.paint).lerp(new THREE.Color("#ffffff"), 0.35);
  for (let i = 0; i < 26; i++) {
    const t = (hash(i * 5.3) + frame * 0.02) % 1;
    const p = from.clone().lerp(to, t);
    p.x += (hash(i * 2.1) - 0.5) * 0.5 * t;
    p.z += (hash(i * 9.7) - 0.5) * 0.5 * t;
    p.y += (hash(i * 4.4) - 0.5) * 0.3 * t;
    const s = glowSprite(col, 0.15 + 0.55 * t, 0.16 * (1 - t * 0.6));
    (s.material as THREE.SpriteMaterial).blending = THREE.NormalBlending;
    s.position.copy(p);
    g.add(s);
  }
  return g;
};

// ---------- text plate (canvas texture) ----------
export const textPlate = (lines: { text: string; size: number; weight: number; color: string; spacing?: number }[], w: number, h: number, bg: string) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  if (bg !== "transparent") {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  const total = lines.reduce((s, l) => s + l.size * 1.15, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `${l.weight} ${l.size}px ${MANROPE}`;
    g.fillStyle = l.color;
    g.textAlign = "center";
    g.textBaseline = "top";
    (g as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing ?? 0}px`;
    g.fillText(l.text, w / 2, y);
    y += l.size * 1.15;
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ---------- mint blueprint seat outline on the floor ----------
export const seat = (x: number, len = 5.2, wid = 2.4) => {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: C.mint, toneMapped: false });
  const t = 0.05;
  const dash = (x0: number, z0: number, x1: number, z1: number) => {
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.floor(L / 0.35);
    for (let i = 0; i < n; i += 1) {
      if (i % 2) continue;
      const a = i / n;
      const b = Math.min(1, (i + 1) / n);
      const sx = x0 + (x1 - x0) * a, sz = z0 + (z1 - z0) * a;
      const ex = x0 + (x1 - x0) * b, ez = z0 + (z1 - z0) * b;
      const o = new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(ex - sx, ez - sz) || t, t), m);
      o.rotation.x = -Math.PI / 2;
      o.rotation.z = -Math.atan2(ez - sz, ex - sx);
      o.position.set((sx + ex) / 2, 0.012, (sz + ez) / 2);
      g.add(o);
    }
  };
  const hx = len / 2, hz = wid / 2;
  dash(x - hx, -hz, x + hx, -hz);
  dash(x - hx, hz, x + hx, hz);
  dash(x - hx, -hz, x - hx, hz);
  dash(x + hx, -hz, x + hx, hz);
  return g;
};

// ---------- the plant ----------
const buildWorld = (frame: number) => {
  const root = new THREE.Group();

  // ground outside + factory floor slab
  const grass = mesh(new THREE.PlaneGeometry(400, 400), M.grass, false);
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.02;
  root.add(grass);
  const tex = concreteTexture().clone();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 5);
  tex.needsUpdate = true;
  const floorMat = std(C.floor, 0.82, 0, { map: tex });
  const floor = mesh(new THREE.BoxGeometry(40, 0.2, 18), floorMat, false);
  floor.position.set(0, -0.1, 0);
  root.add(floor);
  // walkway lanes (yellow) either side of the line
  for (const z of [-1.9, 1.9]) root.add(boxAt(30, 0.01, 0.1, 0, 0.006, z, M.hazardY));
  for (const z of [-4.6, 4.6]) root.add(boxAt(36, 0.01, 0.08, 0, 0.006, z, M.hazardY));

  // low cut-away walls with a window band (back and far side only, so the camera sees in)
  root.add(boxAt(40, 2.6, 0.3, 0, 1.3, -9, M.wall));
  root.add(boxAt(40, 0.9, 0.3, 0, 3.75, -9, M.wall));
  root.add(boxAt(40, 0.7, 0.18, 0, 2.95, -9.0, std("#bcd3dc", 0.08, 0.4)));
  root.add(boxAt(0.3, 4.2, 18, 20, 2.1, 0, M.wall));
  root.add(boxAt(0.3, 1.1, 18, -20, 0.55, 0, M.wall));
  root.add(boxAt(40, 1.1, 0.3, 0, 0.55, 9, M.wall));

  // columns along the walls (the roof is cut away so the camera looks straight in)
  for (let x = -18; x <= 18; x += 6) for (const z of [-8.6]) root.add(boxAt(0.32, 4.2, 0.32, x, 2.1, z, M.column));
  for (let z = -6; z <= 6; z += 6) root.add(boxAt(0.32, 4.2, 0.32, 19.7, 2.1, z, M.column));

  // conveyor (one continuous line) with skids at stations 2 and 3
  root.add(conveyor(-12.6, 12.4));

  // station seats (mint blueprint outlines)
  for (const x of ST) root.add(seat(x));

  // --- 01 press ---
  const px = ST[0];
  const press = new THREE.Group();
  press.position.set(px, 0, 0);
  root.add(press);
  press.add(boxAt(5.6, 0.9, 3.0, 0, 0.45, 0, M.creamDark)); // bed
  press.add(boxAt(5.6, 0.08, 3.0, 0, 0.94, 0, M.rail)); // bolster plate
  for (const s of [-1, 1]) {
    press.add(boxAt(0.6, 2.4, 0.7, s * 2.6, 2.1, -1.15, M.cream));
    press.add(boxAt(0.6, 2.4, 0.7, s * 2.6, 2.1, 1.15, M.cream));
    press.add(boxAt(5.6, 0.12, 0.14, 0, 0.84, s * 1.52, M.hazardY));
  }
  press.add(boxAt(6.0, 1.0, 3.9, 0, 3.8, 0, M.cream)); // crown
  press.add(boxAt(6.02, 0.12, 3.92, 0, 3.34, 0, M.robot));
  const ramY = 1.62;
  press.add(boxAt(4.6, 0.5, 2.4, 0, ramY, 0, M.rail)); // ram coming down on the die
  press.add(boxAt(4.4, 0.1, 2.2, 0, ramY - 0.3, 0, M.bareDark)); // upper die
  for (const s of [-1, 1]) for (const z of [-0.7, 0.7]) press.add(boxAt(0.2, 3.3 - ramY, 0.2, s * 1.4, (ramY + 3.3) / 2, z, M.roller));
  // warm work light inside the press opening
  const pl0 = new THREE.PointLight("#fff1d8", 5, 6, 2);
  pl0.position.set(0, 1.25, 1.0);
  press.add(pl0);
  // stamped side panel lying on the die
  const panel = sidePanel(M.blank);
  panel.rotation.x = -Math.PI / 2;
  panel.position.set(0, 1.0, 0.4);
  press.add(panel);
  // stack of flat blanks + steel coil (foreground)
  for (let i = 0; i < 7; i++) root.add(boxAt(2.2, 0.03, 1.2, px - 1.0, 0.12 + i * 0.035, 3.6, M.blank));
  root.add(boxAt(2.4, 0.1, 1.4, px - 1.0, 0.05, 3.6, M.pallet));
  const coil = new THREE.LatheGeometry([new THREE.Vector2(0.35, -0.6), new THREE.Vector2(0.95, -0.6), new THREE.Vector2(0.95, 0.6), new THREE.Vector2(0.35, 0.6), new THREE.Vector2(0.35, -0.6)], 48);
  const coilM = mesh(coil, std("#b9bfc4", 0.42, 0.75));
  coilM.rotation.x = Math.PI / 2;
  coilM.position.set(px - 4.2, 0.95, -1.4);
  root.add(coilM);
  root.add(boxAt(1.6, 0.25, 1.6, px - 4.2, 0.12, -1.4, M.pallet));
  // out-feed: stamped side panels stacked flat on a pallet, ready for the body shop
  root.add(boxAt(4.9, 0.14, 2.0, px + 2.7, 0.07, 3.9, M.pallet));
  for (let i = 0; i < 3; i++) {
    const p = sidePanel(M.blank);
    p.rotation.x = -Math.PI / 2;
    p.position.set(px + 2.7, 0.17 + i * 0.07, 3.7);
    root.add(p);
  }

  // --- 02 body-in-white + welding robots ---
  const bx = ST[1];
  const sk2 = skid();
  sk2.position.x = bx;
  root.add(sk2);
  const biw = bodyInWhite();
  biw.position.set(bx, LINE_Y + 0.12, 0);
  root.add(biw);
  const welds: { base: THREE.Vector3; target: THREE.Vector3; seed: number }[] = [
    { base: new THREE.Vector3(bx + 0.8, 0, 2.5), target: new THREE.Vector3(bx + 0.55, LINE_Y + 1.5, 0.84), seed: 3 },
    { base: new THREE.Vector3(bx - 1.6, 0, -2.5), target: new THREE.Vector3(bx - 1.2, LINE_Y + 1.48, -0.84), seed: 17 },
    { base: new THREE.Vector3(bx - 1.9, 0, 2.6), target: new THREE.Vector3(bx - 1.55, LINE_Y + 1.05, 0.86), seed: 41 },
  ];
  for (const w of welds) {
    const sc = 0.95;
    const pose = aimRobot(w.base, w.target, sc);
    const r = robot(pose, M.robot, sc);
    r.root.position.copy(w.base);
    root.add(r.root);
    root.updateMatrixWorld(true);
    const tipW = new THREE.Vector3();
    r.tip.getWorldPosition(tipW);
    const s = sparks(w.seed, frame);
    s.position.copy(tipW);
    root.add(s);
    const pl = new THREE.PointLight("#ffb562", 6, 4, 2);
    pl.position.copy(tipW);
    root.add(pl);
    const halo = glowSprite(new THREE.Color("#ffc27a"), 2.6, 0.95);
    halo.position.copy(tipW);
    root.add(halo);
  }

  // --- 03 paint booth ---
  const cx3 = ST[2];
  const sk3 = skid();
  sk3.position.x = cx3;
  root.add(sk3);
  const painted = car(false);
  painted.position.set(cx3, LINE_Y + 0.12, 0);
  root.add(painted);
  for (const s of [-1, 1]) {
    // booth posts and glass side walls (far wall full, near wall low so the car reads)
    for (const x of [-3, 3]) root.add(boxAt(0.14, 3.6, 0.14, cx3 + x, 1.8, s * 2.2, M.robotWhite));
    root.add(boxAt(6.1, 0.16, 0.16, cx3, 3.6, s * 2.2, M.robotWhite));
    const gl = boxAt(5.9, s < 0 ? 3.4 : 1.0, 0.04, cx3, s < 0 ? 1.8 : 0.6, s * 2.2, M.boothGlass);
    gl.castShadow = false;
    root.add(gl);
    root.add(boxAt(5.6, 0.08, 0.3, cx3, 3.45, s * 2.05, M.lamp));
  }
  for (const x of [-3, 3]) root.add(boxAt(0.16, 0.16, 4.5, cx3 + x, 3.6, 0, M.robotWhite));
  const pBase = new THREE.Vector3(cx3 + 0.9, 0, -1.75);
  const pTarget = new THREE.Vector3(cx3 + 0.9, LINE_Y + 1.9, -0.55);
  const pr = robot(aimRobot(pBase, pTarget, 0.85), M.robotWhite, 0.85);
  pr.root.position.copy(pBase);
  root.add(pr.root);
  root.updateMatrixWorld(true);
  const nozzle = new THREE.Vector3();
  pr.tip.getWorldPosition(nozzle);
  root.add(mist(nozzle, new THREE.Vector3(cx3 + 0.9, LINE_Y + 1.25, 0.1), frame));

  // --- 04 finished car rolling off the line ---
  const fin = car(true);
  // it has left the conveyor on its own wheels and turns toward the yard
  fin.position.set(ST[3] - 1.0, 0.02, 1.8);
  fin.rotation.y = -0.35;
  root.add(fin);
  // end-of-line ramp
  root.add(boxAt(1.4, 0.06, 2.2, ST[3] - 3.2, 0.2, 0, M.rail));

  // staging area on the near side: tyre stacks, parts rack with bins, pallet of doors
  const tyre = (x: number, y: number, z: number) => {
    const t = mesh(new THREE.TorusGeometry(0.27, 0.11, 12, 28), M.tire);
    t.rotation.x = Math.PI / 2;
    t.position.set(x, y + 0.11, z);
    return t;
  };
  for (const [x, z, n] of [[0.6, 4.4, 5], [1.4, 4.4, 4], [0.6, 5.2, 3], [1.4, 5.2, 5], [2.2, 4.8, 4]] as const)
    for (let i = 0; i < n; i++) root.add(tyre(x, i * 0.22, z));
  const shelf = new THREE.Group();
  shelf.position.set(5.4, 0, 5.2);
  for (const x of [-1.6, 1.6]) for (const z of [-0.45, 0.45]) shelf.add(boxAt(0.08, 2.0, 0.08, x, 1.0, z, M.rail));
  const binM = std("#4f86b8", 0.6);
  for (const y of [0.3, 1.0, 1.7]) {
    shelf.add(boxAt(3.3, 0.05, 1.0, 0, y, 0, M.rail));
    for (let i = 0; i < 6; i++) if (hash(i * 3 + y * 10) > 0.2) shelf.add(boxAt(0.46, 0.3, 0.7, -1.3 + i * 0.52, y + 0.18, 0, binM));
  }
  root.add(shelf);
  root.add(boxAt(2.2, 0.12, 1.4, -1.0, 0.06, 4.2, M.pallet));
  for (let i = 0; i < 4; i++) root.add(boxAt(1.2, 0.05, 1.0, -1.0, 0.16 + i * 0.06, 4.2, M.blank));
  // pedestrian crossing stripes over the near walkway
  for (let i = 0; i < 6; i++) root.add(boxAt(0.3, 0.012, 2.4, 6.6 + i * 0.6, 0.006, 3.3, M.hazardY));

  return root;
};

// Banner textures need the bundled font, so they are drawn after it loads.
const Banner: React.FC = () => {
  const tex = useMemo(
    () =>
      textPlate(
        [
          { text: "AUDIRA", size: 150, weight: 600, color: "#1f2426", spacing: 34 },
          { text: "ASSEMBLY LINE 01", size: 54, weight: 600, color: C.accent, spacing: 14 },
        ],
        1400,
        420,
        "transparent",
      ),
    [],
  );
  // painted on the press crown's top face, turned to read level from the camera
  return (
    <>
      <group position={[ST[0], 4.315, 0]} rotation={[0, -1.25, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.7, 1.11]} />
          <meshStandardMaterial map={tex} transparent roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[ST[0] - 3.012, 3.86, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.0, 0.9]} />
        <meshStandardMaterial map={tex} transparent roughness={0.7} />
      </mesh>
    </>
  );
};

// ---------- camera ----------
const SHOT: Shot = {
  pos: [-37.21, 28.21, 14.05],
  target: [-1.2, 0, -0.5],
  fov: 28,
  focus: 30,
  aperture: 0,
  maxBlur: 0,
  exposure: 0.84,
};
const shotAt = (frame: number): Shot => {
  const d = frame * 0.01; // slow drift, still reads as frozen for the cover
  return { ...SHOT, pos: [SHOT.pos[0] + d, SHOT.pos[1], SHOT.pos[2] - d * 0.4] };
};

const World: React.FC<{ frame: number }> = ({ frame }) => {
  const { gl, scene } = useThree();
  const world = useMemo(() => buildWorld(frame), [frame]);
  const sky = useMemo(() => createSky(SKY, SUN), []);
  useLayoutEffect(() => {
    const env = skyEnvironment(gl, SKY, SUN);
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight("#fff3e0", 2.6);
    l.position.copy(SUN.clone().multiplyScalar(40));
    l.castShadow = true;
    l.shadow.mapSize.set(4096, 4096);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -24;
    c.right = 24;
    c.top = 24;
    c.bottom = -24;
    c.near = 1;
    c.far = 100;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 4;
    return l;
  }, []);
  const shot = useMemo(() => shotAt(frame), [frame]);
  return (
    <>
      <CameraRig shot={shot} near={0.5} far={2500} />
      <primitive object={sky} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <hemisphereLight args={["#eaf2ff", "#cfc6b4", 0.9]} />
      <primitive object={world} />
      <Banner />
      <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.84} envIntensity={0} aoRadius={0.4} />
    </>
  );
};

// ---------- overlay ----------
const project = (p: [number, number, number], shot: Shot) => {
  const cam = new THREE.PerspectiveCamera(shot.fov, W / H, 0.5, 2500);
  cam.position.set(...shot.pos);
  cam.lookAt(...shot.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

const STAGES: { n: string; label: string; at: [number, number, number]; dx: number; dy: number; left?: boolean }[] = [
  { n: "01", label: "PRESS", at: [ST[0] + 0.5, 1.6, 1.4], dx: 230, dy: 60 },
  { n: "02", label: "LAS", at: [ST[1] + 0.4, 1.9, 0.4], dx: 120, dy: 60 },
  { n: "03", label: "CAT", at: [ST[2] + 0.4, 1.9, 0.5], dx: 120, dy: 60 },
  { n: "04", label: "RAKIT", at: [ST[3] - 1.2, 1.45, 1.9], dx: -10, dy: -110, left: true },
];

const Tag: React.FC<{ s: (typeof STAGES)[number]; shot: Shot }> = ({ s, shot }) => {
  const a = project(s.at, shot);
  const ex = a.x + s.dx;
  const ey = a.y + s.dy;
  const right = s.dx > 0 && !s.left;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={C.ink} strokeWidth={2} opacity={0.75} />
        <circle cx={a.x} cy={a.y} r={6} fill="#ffffff" stroke={C.ink} strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: right ? ex + 10 : undefined,
          right: right ? undefined : W - ex + 10,
          top: ey - 30,
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          padding: "8px 16px",
          background: "rgba(250,248,243,0.92)",
          borderRadius: 4,
          boxShadow: "0 6px 18px rgba(40,40,30,0.18)",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.2em", color: C.accent }}>{s.n}</span>
        <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "0.16em", color: C.ink }}>{s.label}</span>
      </div>
    </>
  );
};

const Overlay: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ pointerEvents: "none", fontFamily: MANROPE }}>
    {STAGES.map((s) => (
      <Tag key={s.n} s={s} shot={shot} />
    ))}
    <div style={{ position: "absolute", left: 76, top: 200, width: 640 }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.34em", color: C.accent }}>AUDIRA EXPLAINED</div>
      <div style={{ marginTop: 14, fontSize: 112, fontWeight: 600, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
        Bagaimana
        <br />
        Mobil
        <br />
        Dirakit?
      </div>
      <div style={{ marginTop: 26, width: 360, height: 3, background: "rgba(31,36,38,0.18)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 360, height: 3, background: C.accent }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: i * 120 - 4, top: -4, width: 11, height: 11, borderRadius: 11, background: C.accent }} />
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep048Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = shotAt(frame);
  const [fontOk, setFontOk] = useState(false);
  useLayoutEffect(() => {
    const h = delayRender("ep048 font");
    fontReady().then(() => {
      setFontOk(true);
      continueRender(h);
    });
  }, []);
  return (
    <AbsoluteFill style={{ background: "#e6eeef" }}>
      {fontOk && (
        <ThreeCanvas width={W} height={H} dpr={1} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
          <World frame={frame} />
        </ThreeCanvas>
      )}
      {/* soft light wash under the title so it reads over the floor */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 30% at 18% 18%, rgba(246,243,236,0.9) 0%, rgba(246,243,236,0.55) 55%, rgba(246,243,236,0) 100%)" }} />
      <Overlay shot={shot} />
    </AbsoluteFill>
  );
};
