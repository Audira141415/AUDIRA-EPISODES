// Figure — a posable 3D person rendered as a flat black silhouette (optionally with a coloured contour, see
// outline.ts). Built from simple solids on a joint hierarchy; because it is pure black, overlaps inside the body
// never show — only the outer shape reads, so the costume and the pose carry the character:
//   hats  : peci, destar (pointed head-cloth), caping (wide cone), shako, bicorne, turban, bun (hair), none
//   wear  : sarong / kain (cloth that follows the legs), robe (ankle-long), coat (short flare), pants
//   items : musket, spear, telescope, torch (lit flame), keris, flag, bundle (back / head), paddle
// Units are metres; the root is at the feet, facing +z. Everything is a pure function of the props.

import React, { useLayoutEffect, useMemo } from "react";
import {
  BufferAttribute, BufferGeometry, Color, CylinderGeometry, DoubleSide, LatheGeometry, MeshBasicMaterial, SphereGeometry, Vector2, ConeGeometry, BoxGeometry, TorusGeometry,
} from "three";
import { noise1 } from "./cam.ts";
import type { SilTag } from "./outline.ts";

// ------------------------------------------------------------------ shared geometry + material
const INK = new MeshBasicMaterial({ color: new Color("#040506"), fog: true, side: DoubleSide });
export const inkMaterial = INK;
const FLAME = new MeshBasicMaterial({ color: new Color("#ffb04a").multiplyScalar(4), toneMapped: false, fog: false });
const FLAME_CORE = new MeshBasicMaterial({ color: new Color("#fff1c4").multiplyScalar(6), toneMapped: false, fog: false });

const G = {
  sphere: new SphereGeometry(1, 20, 14),
  dome: new SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  cyl: new CylinderGeometry(1, 1, 1, 14, 1),
  cone: new ConeGeometry(1, 1, 18, 1),
  tri: new CylinderGeometry(1, 1, 1, 3, 1),
  box: new BoxGeometry(1, 1, 1),
  torus: new TorusGeometry(1, 0.32, 8, 20),
  limb: (r0: number, r1: number) => new CylinderGeometry(r1, r0, 1, 12, 1),
};
const limbCache = new Map<string, CylinderGeometry>();
const limb = (rTop: number, rBot: number) => {
  const k = `${rTop.toFixed(3)}|${rBot.toFixed(3)}`;
  let g = limbCache.get(k);
  if (!g) { g = G.limb(rBot, rTop); limbCache.set(k, g); }
  return g;
};
const latheCache = new Map<string, LatheGeometry>();
const torsoGeo = (kind: "m" | "f") => {
  let g = latheCache.get(kind);
  if (!g) {
    const pts = kind === "m"
      ? [[0.0, -0.02], [0.13, -0.01], [0.15, 0.06], [0.135, 0.18], [0.15, 0.3], [0.18, 0.39], [0.175, 0.45], [0.12, 0.49], [0.05, 0.505], [0.0, 0.505]]
      : [[0.0, -0.02], [0.15, -0.01], [0.155, 0.06], [0.115, 0.18], [0.135, 0.29], [0.145, 0.37], [0.14, 0.44], [0.1, 0.48], [0.045, 0.495], [0.0, 0.495]];
    g = new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), 20);
    latheCache.set(kind, g);
  }
  return g;
};

// ------------------------------------------------------------------ types
export type Arm = { fwd?: number; out?: number; elbow?: number; twist?: number };
export type Leg = { fwd?: number; out?: number; knee?: number; ankle?: number };
export type Pose = {
  hipY?: number; // pelvis height (m) at scale 1; default 0.93
  lean?: number; // whole-body forward lean at the pelvis (rad)
  yaw?: number; // pelvis yaw
  spine?: number; // forward bend of the chest
  side?: number; // side bend
  twist?: number; // chest yaw
  head?: [number, number]; // [look up, look left]
  armL?: Arm; armR?: Arm; legL?: Leg; legR?: Leg;
};
export type Hat = "none" | "peci" | "destar" | "caping" | "shako" | "bicorne" | "tricorne" | "turban" | "bun" | "hair" | "blangkon";
export type Wear = "pants" | "sarong" | "kain" | "robe" | "coat";
export type Item = "musket" | "spear" | "telescope" | "torch" | "keris" | "flag" | "paddle" | "none";
export type Costume = {
  body?: "m" | "f";
  hat?: Hat;
  wear?: Wear;
  itemR?: Item;
  itemL?: Item;
  load?: "back" | "head" | "none";
  keris?: boolean;
  scale?: number; // 1 = 1.68 m adult
  build?: number; // width multiplier
  headScale?: number;
};

// ------------------------------------------------------------------ poses
const A = (fwd = 0, out = 0.08, elbow = 0.12, twist = 0): Arm => ({ fwd, out, elbow, twist });

export const POSES = {
  stand: (): Pose => ({ armL: A(0.02, 0.09, 0.14), armR: A(0.02, 0.09, 0.14), legL: { fwd: 0.02, out: 0.04, knee: 0.03 }, legR: { fwd: -0.02, out: 0.04, knee: 0.03 } }),
  /** feet apart, hands on hips — the "hero on deck" stance */
  akimbo: (): Pose => ({ armL: A(-0.25, 0.62, 1.9, -1.25), armR: A(-0.25, 0.62, 1.9, 1.25), legL: { fwd: 0.05, out: 0.14, knee: 0.04 }, legR: { fwd: -0.08, out: 0.12, knee: 0.06 }, head: [0.12, 0] }),
  /** soldier at attention, weapon held upright at the right side */
  shoulderArms: (): Pose => ({ armL: A(0, 0.06, 0.1), armR: A(0.04, 0.12, 0.45, 0.2), legL: { out: 0.03 }, legR: { out: 0.03 } }),
  point: (side: "L" | "R" = "R", up = 0.15): Pose => {
    const p: Pose = { ...POSES.stand(), head: [up * 0.6, 0] };
    const arm = A(1.45 + up, 0.12, 0.06, 0);
    if (side === "R") p.armR = arm; else p.armL = arm;
    return p;
  },
  telescope: (): Pose => ({ armR: A(1.25, -0.42, 1.75, 0.3), armL: A(1.05, -0.32, 1.25, -0.3), head: [0.06, 0], legL: { fwd: 0.12, out: 0.06, knee: 0.08 }, legR: { fwd: -0.12, out: 0.06 } }),
  raiseFist: (): Pose => ({ ...POSES.stand(), armR: A(2.6, 0.25, 0.35, 0), head: [0.25, 0] }),
  /** both arms up to steady a load on the head */
  carryHead: (): Pose => ({ ...POSES.stand(), armL: A(0.35, 1.25, 2.1, -0.4), armR: A(0.1, 0.12, 0.2) }),
  /** kneeling, sitting back on the heels */
  kneel: (bow = 0): Pose => ({
    hipY: 0.5, lean: 0.05 + bow * 0.9, spine: bow * 0.6,
    legL: { fwd: 1.45, out: 0.12, knee: 2.75, ankle: -0.4 }, legR: { fwd: 1.45, out: 0.12, knee: 2.75, ankle: -0.4 },
    armL: A(0.55 + bow * 0.9, 0.1, 0.9 - bow * 0.6), armR: A(0.55 + bow * 0.9, 0.1, 0.9 - bow * 0.6), head: [-0.15 - bow * 0.3, 0],
  }),
  lookUp: (): Pose => ({ ...POSES.stand(), head: [0.55, 0], spine: -0.08 }),
  /** sitting cross-legged on the floor (bersila) */
  sitCross: (): Pose => ({
    hipY: 0.17, spine: 0.04,
    legL: { fwd: 1.42, out: 0.75, knee: 2.55, ankle: 0.2 }, legR: { fwd: 1.42, out: 0.75, knee: 2.55, ankle: 0.2 },
    armL: A(0.55, 0.2, 0.75, -0.2), armR: A(0.55, 0.2, 0.75, 0.2), head: [-0.05, 0],
  }),
  /** sitting on a chair / bench, seat ≈ 0.46 m */
  sitChair: (): Pose => ({
    hipY: 0.5, spine: 0.05,
    legL: { fwd: 1.5, out: 0.08, knee: 1.5, ankle: 0.0 }, legR: { fwd: 1.5, out: 0.08, knee: 1.45, ankle: 0.0 },
    armL: A(0.55, 0.1, 0.9), armR: A(0.55, 0.1, 0.9), head: [0, 0],
  }),
  /** seated at a desk, writing (t drives the pen hand) */
  write: (t: number): Pose => ({
    ...POSES.sitChair(), spine: 0.32, head: [-0.42, 0],
    armR: A(0.95 + 0.05 * Math.sin(t * 5), 0.05 + 0.03 * Math.sin(t * 3.1), 1.15, 0.1),
    armL: A(0.85, 0.12, 1.35, -0.1),
  }),
  /** kneeling with both palms raised in front (berdoa) */
  pray: (): Pose => ({
    ...POSES.kneel(0), lean: 0.06, head: [-0.28, 0],
    armL: A(0.42, 0.14, 1.55, -0.35), armR: A(0.42, 0.14, 1.55, 0.35),
  }),
  /** standing, talking with the right hand */
  talk: (t: number): Pose => ({ ...POSES.stand(), armR: A(0.55 + 0.18 * Math.sin(t * 2.2), 0.15, 1.0 + 0.2 * Math.sin(t * 1.7), 0.2), head: [0.05, 0.08 * Math.sin(t * 0.9)] }),
};

/** Breathing + weight shift + small head moves layered on any pose so held silhouettes never freeze. */
export const idle = (p: Pose, t: number, seed = 0, amt = 1): Pose => {
  const b = Math.sin(t * 1.45 + seed * 2.1);
  const w = Math.sin(t * 0.37 + seed * 1.3);
  const h = Math.sin(t * 0.53 + seed * 0.7);
  const arm = (a: Arm | undefined, k: number): Arm | undefined => (a ? { ...a, fwd: (a.fwd ?? 0) + 0.025 * amt * Math.sin(t * 0.8 + seed + k), out: (a.out ?? 0) + 0.012 * amt * b } : a);
  return {
    ...p,
    spine: (p.spine ?? 0) + 0.018 * amt * b,
    side: (p.side ?? 0) + 0.02 * amt * w,
    yaw: (p.yaw ?? 0) + 0.03 * amt * w,
    head: [(p.head?.[0] ?? 0) + 0.03 * amt * h, (p.head?.[1] ?? 0) + 0.06 * amt * Math.sin(t * 0.29 + seed)],
    armL: arm(p.armL, 0), armR: arm(p.armR, 2),
  };
};

/** Walk / run cycle. `phase` advances by π per step; `run` 0…1 blends walk → run. */
export const gait = (phase: number, run = 0, base: Pose = {}): Pose => {
  const amp = 0.42 + 0.32 * run;
  const leg = (p: number): Leg => {
    const s = Math.sin(p), c = Math.cos(p);
    return { fwd: amp * s + 0.05 * run, out: 0.03, knee: 0.08 + (0.75 + 0.85 * run) * Math.pow(Math.max(0, c), 1.4) + 0.1 * run, ankle: -0.2 * Math.max(0, -s) };
  };
  const arm = (p: number, side: number): Arm => ({ fwd: -(0.35 + 0.5 * run) * Math.sin(p) + 0.1 * run, out: 0.1, elbow: 0.2 + 1.0 * run, twist: side * 0.1 });
  return {
    ...base,
    hipY: 0.93 - 0.025 - 0.05 * run + (0.025 + 0.03 * run) * Math.abs(Math.cos(phase)),
    lean: 0.04 + 0.26 * run + (base.lean ?? 0),
    spine: base.spine ?? 0.02 * run,
    yaw: 0.08 * Math.sin(phase),
    twist: -0.12 * Math.sin(phase),
    legL: leg(phase), legR: leg(phase + Math.PI),
    armL: base.armL ?? arm(phase + Math.PI, 1), armR: base.armR ?? arm(phase, -1),
  };
};

// ------------------------------------------------------------------ kinematics used by the cloth
const legFK = (hx: number, l: Leg) => {
  const f = l.fwd ?? 0, k = l.knee ?? 0;
  const knee = [hx + Math.sin(l.out ?? 0) * 0.42 * Math.sign(hx), -0.02 - 0.42 * Math.cos(f), 0.42 * Math.sin(f)];
  const a = f - k;
  const ankle = [knee[0], knee[1] - 0.41 * Math.cos(a), knee[2] + 0.41 * Math.sin(a)];
  return { knee, ankle };
};

/** Cloth tube from the waist ring to a bottom ring that follows the knees/shins (sarong, kain, robe, coat flare). */
const Skirt: React.FC<{ pose: Pose; len: number; top: number; bottom: number; tag: SilTag; front?: number }> = ({ pose, len, top, bottom, tag, front = 1 }) => {
  const SEG = 22, RINGS = 7;
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array((SEG + 1) * RINGS * 3), 3));
    const idx: number[] = [];
    for (let r = 0; r < RINGS - 1; r++) for (let s = 0; s < SEG; s++) {
      const a = r * (SEG + 1) + s, b = a + SEG + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    g.setIndex(idx);
    return g;
  }, []);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  const L = legFK(0.09, pose.legL ?? {}), R = legFK(-0.09, pose.legR ?? {});
  const pos = geo.attributes.position as BufferAttribute;
  for (let r = 0; r < RINGS; r++) {
    const t = r / (RINGS - 1);
    const y = 0.06 - t * len;
    // where the legs are at this height (interpolate hip → knee → ankle by drop)
    const at = (fk: ReturnType<typeof legFK>, hx: number) => {
      const drop = -y + 0.02;
      if (drop <= 0.42) { const u = drop / 0.42; return [hx + (fk.knee[0] - hx) * u, fk.knee[2] * u]; }
      const u = Math.min(1, (drop - 0.42) / 0.41);
      return [fk.knee[0] + (fk.ankle[0] - fk.knee[0]) * u, fk.knee[2] + (fk.ankle[2] - fk.knee[2]) * u];
    };
    const l = at(L, 0.09), rr = at(R, -0.09);
    const cz = (l[1] + rr[1]) / 2, cx = (l[0] + rr[0]) / 2;
    const spreadZ = Math.abs(l[1] - rr[1]) / 2;
    const rx = top + (bottom - top) * t;
    const rz = rx * 0.78 + spreadZ * Math.min(1, t * 1.6) * 0.95;
    for (let s = 0; s <= SEG; s++) {
      const a = (s / SEG) * Math.PI * 2;
      const sx = Math.cos(a), sz = Math.sin(a);
      const k = sz > 0 ? front : 1;
      pos.setXYZ(r * (SEG + 1) + s, cx * t + sx * rx, y, cz * Math.min(1, t * 1.3) + sz * rz * k);
    }
  }
  pos.needsUpdate = true;
  geo.computeBoundingSphere();
  return <mesh geometry={geo} material={INK} userData={{ sil: tag }} />;
};

// ------------------------------------------------------------------ parts
type PartProps = { tag: SilTag };
const P: React.FC<PartProps & { geo: BufferGeometry; p?: [number, number, number]; s?: [number, number, number]; r?: [number, number, number] }> = ({ tag, geo, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0] }) => (
  <mesh geometry={geo} material={INK} position={p} scale={s} rotation={r} userData={{ sil: tag }} />
);

const HatMesh: React.FC<PartProps & { hat: Hat; t: number }> = ({ hat, tag, t }) => {
  switch (hat) {
    case "peci": return <P tag={tag} geo={G.cyl} p={[0, 0.085, -0.005]} s={[0.1, 0.085, 0.112]} />;
    case "destar": return (
      <>
        <P tag={tag} geo={G.sphere} p={[0, 0.05, -0.01]} s={[0.112, 0.07, 0.122]} />
        {/* the stiff pointed end of the head-cloth, tipped back and up */}
        <P tag={tag} geo={G.cone} p={[0.0, 0.14, -0.07]} s={[0.035, 0.16, 0.06]} r={[-0.75, 0, 0.12]} />
      </>
    );
    case "caping": return <P tag={tag} geo={G.cone} p={[0, 0.1, 0]} s={[0.3, 0.15, 0.3]} />;
    case "shako": return (
      <>
        <P tag={tag} geo={G.cyl} p={[0, 0.13, 0]} s={[0.104, 0.2, 0.11]} />
        <P tag={tag} geo={G.box} p={[0, 0.04, 0.1]} s={[0.17, 0.012, 0.09]} r={[0.25, 0, 0]} />
        <P tag={tag} geo={G.cyl} p={[0, 0.27 + 0.004 * Math.sin(t * 9), 0.06]} s={[0.018, 0.12, 0.018]} />
      </>
    );
    case "bicorne": return <P tag={tag} geo={G.dome} p={[0, 0.1, 0]} s={[0.25, 0.14, 0.055]} />;
    case "tricorne": return (
      <>
        <P tag={tag} geo={G.dome} p={[0, 0.07, 0]} s={[0.1, 0.1, 0.11]} />
        <P tag={tag} geo={G.tri} p={[0, 0.085, 0.0]} s={[0.2, 0.035, 0.2]} r={[0.0, Math.PI, 0]} />
      </>
    );
    case "blangkon": return (
      <>
        <P tag={tag} geo={G.sphere} p={[0, 0.035, 0]} s={[0.1, 0.085, 0.116]} />
        <P tag={tag} geo={G.sphere} p={[0, 0.0, -0.11]} s={[0.05, 0.045, 0.045]} />
      </>
    );
    case "turban": return <P tag={tag} geo={G.sphere} p={[0, 0.06, 0]} s={[0.13, 0.095, 0.135]} />;
    case "bun": return <P tag={tag} geo={G.sphere} p={[0, 0.0, -0.12]} s={[0.065, 0.06, 0.06]} />;
    case "hair": return <P tag={tag} geo={G.sphere} p={[0, -0.06, -0.06]} s={[0.1, 0.17, 0.07]} />;
    default: return null;
  }
};

/** Item held in a hand (hand frame: the arm hangs along −y, palm facing in). */
const ItemMesh: React.FC<PartProps & { item: Item; t: number; side: number }> = ({ item, tag, t, side }) => {
  switch (item) {
    case "musket": return (
      <group position={[0, 0.3, 0.03]}>
        <P tag={tag} geo={G.cyl} s={[0.014, 1.42, 0.014]} />
        <P tag={tag} geo={G.box} p={[0, -0.6, 0]} s={[0.035, 0.28, 0.07]} />
        <P tag={tag} geo={G.cone} p={[0, 0.88, 0]} s={[0.008, 0.36, 0.008]} />
      </group>
    );
    case "spear": return (
      <group position={[0, 0.45, 0.03]}>
        <P tag={tag} geo={G.cyl} s={[0.013, 2.1, 0.013]} />
        <P tag={tag} geo={G.cone} p={[0, 1.17, 0]} s={[0.028, 0.24, 0.012]} />
      </group>
    );
    case "telescope": return <P tag={tag} geo={limb(0.02, 0.03)} p={[0, -0.08, 0.2]} s={[1, 0.46, 1]} r={[Math.PI / 2, 0, 0]} />;
    case "keris": return <P tag={tag} geo={G.cone} p={[0, -0.2, 0]} s={[0.014, 0.34, 0.03]} r={[Math.PI, 0, 0]} />;
    case "paddle": return (
      <group position={[0, -0.05, 0.03]}>
        <P tag={tag} geo={G.cyl} s={[0.015, 1.5, 0.015]} />
        <P tag={tag} geo={G.sphere} p={[0, -0.75, 0]} s={[0.07, 0.24, 0.015]} />
      </group>
    );
    case "flag": {
      const w = Math.sin(t * 4.1) * 0.12;
      return (
        <group position={[0, 0.6, 0.03]}>
          <P tag={tag} geo={G.cyl} s={[0.013, 2.2, 0.013]} />
          <P tag={tag} geo={G.box} p={[side * 0.28, 0.85, w * 0.5]} s={[0.55, 0.36, 0.01]} r={[0, w, 0]} />
        </group>
      );
    }
    case "torch": {
      const f = 1 + 0.18 * noise1(t * 9, 3);
      return (
        <group position={[0, 0.12, 0.04]}>
          <P tag={tag} geo={G.cyl} s={[0.017, 0.5, 0.017]} />
          <mesh geometry={G.sphere} material={FLAME} position={[0, 0.3 + 0.03 * f, 0]} scale={[0.05, 0.11 * f, 0.05]} userData={{ noMask: true }} />
          <mesh geometry={G.sphere} material={FLAME_CORE} position={[0, 0.28, 0]} scale={[0.026, 0.05 * f, 0.026]} userData={{ noMask: true }} />
        </group>
      );
    }
    default: return null;
  }
};

const ArmChain: React.FC<PartProps & { arm: Arm; x: number; side: number; item: Item; t: number }> = ({ arm, x, side, item, tag, t }) => (
  <group position={[x, 0.425, 0]} rotation={[-(arm.fwd ?? 0), arm.twist ?? 0, side * (arm.out ?? 0), "XZY"]}>
    <P tag={tag} geo={G.sphere} s={[0.055, 0.055, 0.055]} />
    <P tag={tag} geo={limb(0.048, 0.037)} p={[0, -0.14, 0]} s={[1, 0.28, 1]} />
    <group position={[0, -0.28, 0]} rotation={[-(arm.elbow ?? 0), 0, 0]}>
      <P tag={tag} geo={G.sphere} s={[0.038, 0.038, 0.038]} />
      <P tag={tag} geo={limb(0.036, 0.027)} p={[0, -0.125, 0]} s={[1, 0.25, 1]} />
      <group position={[0, -0.25, 0]}>
        <P tag={tag} geo={G.sphere} p={[0, -0.055, 0.005]} s={[0.03, 0.07, 0.042]} />
        <ItemMesh item={item} tag={tag} t={t} side={side} />
      </group>
    </group>
  </group>
);

const LegChain: React.FC<PartProps & { leg: Leg; x: number; side: number; boot?: boolean }> = ({ leg, x, side, tag, boot }) => (
  <group position={[x, -0.02, 0]} rotation={[-(leg.fwd ?? 0), 0, side * (leg.out ?? 0)]}>
    <P tag={tag} geo={limb(0.078, 0.056)} p={[0, -0.21, 0]} s={[1, 0.42, 1]} />
    <group position={[0, -0.42, 0]} rotation={[leg.knee ?? 0, 0, 0]}>
      <P tag={tag} geo={G.sphere} s={[0.055, 0.055, 0.055]} />
      <P tag={tag} geo={limb(boot ? 0.052 : 0.05, boot ? 0.046 : 0.034)} p={[0, -0.205, 0]} s={[1, 0.41, 1]} />
      <group position={[0, -0.41, 0]} rotation={[leg.ankle ?? 0, 0, 0]}>
        <P tag={tag} geo={G.sphere} p={[0, -0.035, 0.045]} s={[0.045, 0.035, 0.12]} />
      </group>
    </group>
  </group>
);

export type FigureProps = {
  id: number;
  /** contour colour (null = plain black) */
  outline?: string | null;
  gain?: number;
  pos: [number, number, number];
  rotY?: number;
  pose: Pose;
  look?: Costume;
  t?: number;
};

export const Figure: React.FC<FigureProps> = ({ id, outline = null, gain, pos, rotY = 0, pose, look = {}, t = 0 }) => {
  const tag: SilTag = { id, color: outline, gain };
  const sc = look.scale ?? 1;
  const b = look.build ?? 1;
  const kind = look.body ?? "m";
  const wear = look.wear ?? "pants";
  const sx = kind === "f" ? 0.155 : 0.18;
  const hipY = pose.hipY ?? 0.93;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={[sc * b, sc, sc * b]}>
      <group position={[0, hipY, 0]} rotation={[pose.lean ?? 0, pose.yaw ?? 0, 0]}>
        {/* pelvis */}
        <P tag={tag} geo={G.sphere} p={[0, 0.0, 0]} s={[kind === "f" ? 0.16 : 0.145, 0.11, 0.11]} />
        <LegChain tag={tag} leg={pose.legL ?? {}} x={0.09} side={1} boot={wear === "coat"} />
        <LegChain tag={tag} leg={pose.legR ?? {}} x={-0.09} side={-1} boot={wear === "coat"} />
        {wear === "sarong" && <Skirt tag={tag} pose={pose} len={0.44} top={0.165} bottom={0.185} />}
        {wear === "kain" && <Skirt tag={tag} pose={pose} len={0.86} top={0.165} bottom={0.15} />}
        {wear === "robe" && <Skirt tag={tag} pose={pose} len={0.88} top={0.17} bottom={0.25} />}
        {wear === "coat" && <Skirt tag={tag} pose={pose} len={0.3} top={0.16} bottom={0.2} front={0.85} />}
        <group rotation={[pose.spine ?? 0, pose.twist ?? 0, pose.side ?? 0]}>
          <P tag={tag} geo={torsoGeo(kind)} s={[1, 1, 0.66]} />
          {look.load === "back" && <P tag={tag} geo={G.sphere} p={[0, 0.3, -0.2]} s={[0.2, 0.24, 0.14]} />}
          {look.keris && <P tag={tag} geo={G.cone} p={[-0.06, 0.12, -0.1]} s={[0.022, 0.3, 0.03]} r={[-0.3, 0, 0.5]} />}
          <ArmChain tag={tag} arm={pose.armL ?? {}} x={sx} side={1} item={look.itemL ?? "none"} t={t} />
          <ArmChain tag={tag} arm={pose.armR ?? {}} x={-sx} side={-1} item={look.itemR ?? "none"} t={t} />
          {/* neck + head */}
          <P tag={tag} geo={limb(0.045, 0.05)} p={[0, 0.53, 0.0]} s={[1, 0.1, 1]} />
          <group position={[0, 0.585, 0.01]} rotation={[-(pose.head?.[0] ?? 0), pose.head?.[1] ?? 0, 0]} scale={look.headScale ?? 1}>
            <P tag={tag} geo={G.sphere} p={[0, 0.045, 0]} s={[0.084, 0.112, 0.1]} />
            {/* nose + chin give the profile its read */}
            <P tag={tag} geo={G.sphere} p={[0, 0.03, 0.1]} s={[0.018, 0.03, 0.03]} />
            <P tag={tag} geo={G.sphere} p={[0, -0.035, 0.055]} s={[0.045, 0.036, 0.045]} />
            <HatMesh tag={tag} hat={look.hat ?? "none"} t={t} />
            {look.load === "head" && <P tag={tag} geo={G.sphere} p={[0, 0.2, 0]} s={[0.2, 0.09, 0.18]} />}
          </group>
        </group>
      </group>
    </group>
  );
};
