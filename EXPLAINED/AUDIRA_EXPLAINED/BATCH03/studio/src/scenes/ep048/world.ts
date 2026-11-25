// EP048 film world: one long roofless car plant along +x, built once; update(t) poses every moving
// part from the VO clock only (deterministic, no incremental state).
// Line order (research "Saran visual akurat"): press -> body shop (body-in-white, spot welds) ->
// ED dip (antikarat, bermuatan listrik) -> paint booth -> oven tunnel -> assembly (doors off,
// marriage of body + engine/suspension, parts just in time) -> shower test -> roller test -> exit gate.

import * as THREE from "three";
import { FX_LAYER } from "../../core/render/Post.tsx";
import {
  C, LINE_Y, M, WB, WR, aimRobot, bodyInWhite, boxAt, extrude, glowSprite, hash, mesh,
  sidePanel, std, textPlate, wheel,
} from "./Cover.tsx";
import { concreteTexture } from "../../kits/buildforge/materials/textures.ts";
import { K, clamp, smooth, lerp } from "./clock.ts";

// ---------- stations (x, metres) ----------
export const X = {
  PRESS: -38,
  START: -33,
  WELD: -27,
  ED: -16,
  PAINT: -5,
  OVEN0: 1,
  OVEN1: 9,
  DOOR: 14,
  MARRY: 22,
  PARTS: 30,
  SHOWER: 38,
  ROLLER: 46,
  GATE: 56,
};
const ED0 = -20.5;
const ED1 = -11.5;
const SKID_Y = LINE_Y + 0.12;

const ED_MAT = std("#5d6369", 0.62, 0.3);
const DOOR_DARK = new THREE.MeshStandardMaterial({ color: "#16191b", roughness: 0.9, side: THREE.DoubleSide });
const NAVY = std("#33475b", 0.85);
const HELMET = std("#f3f1ea", 0.5);
const SKIN = std("#c9a68a", 0.8);
const BIN = std("#4f86b8", 0.6);
const AGV = std("#e7e3da", 0.55, 0.1);
const LIQ = new THREE.MeshPhysicalMaterial({ color: "#6fb2df", roughness: 0.1, metalness: 0, transparent: true, opacity: 0.3, clearcoat: 1, depthWrite: false, emissive: "#2a6f9a", emissiveIntensity: 0.25 });
const OVEN_IN = std("#3a2a1e", 0.9, 0, { emissive: "#ff7a2a", emissiveIntensity: 1.6 });
const WATER = new THREE.Color(0.75, 0.9, 1.0);

/** Body path height through the ED tank (hangers lift the body over the wall and dip it). */
export const edY = (x: number) => {
  if (x < ED0 - 2 || x > ED1 + 2) return SKID_Y;
  const up = smooth(ED0 - 2, ED0 - 0.6, x) * (1 - smooth(ED1 + 0.6, ED1 + 2, x));
  const dip = smooth(ED0 + 0.4, ED0 + 2.6, x) * (1 - smooth(ED1 - 2.6, ED1 - 0.4, x));
  return SKID_Y + up * 1.4 - dip * 1.9;
};

// ---------- car rig ----------
const GLASS_DARK = new THREE.MeshPhysicalMaterial({ color: "#22323d", roughness: 0.03, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.01, envMapIntensity: 1.6, side: THREE.DoubleSide });
// polish 3 (film only; the cover keeps its own materials): metallic paint with clearcoat, satin robot paint
const PAINT = new THREE.MeshPhysicalMaterial({ color: "#2a7fa0", roughness: 0.32, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 });
const HEAD = std("#eef0ee", 0.15, 0.2, { emissive: "#fff4dc", emissiveIntensity: 0.25 });
const ROBOT = new THREE.MeshPhysicalMaterial({ color: "#e0782f", roughness: 0.38, metalness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const lowerShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-2.2, 0.3);
  s.lineTo(-WB - 0.45, 0.3);
  s.absarc(-WB, WR, 0.45, Math.PI, 0, true);
  s.lineTo(WB - 0.45, 0.3);
  s.absarc(WB, WR, 0.45, Math.PI, 0, true);
  s.lineTo(2.18, 0.3);
  s.quadraticCurveTo(2.36, 0.34, 2.34, 0.56);
  s.quadraticCurveTo(2.3, 0.74, 2.1, 0.78);
  s.quadraticCurveTo(1.5, 0.86, 0.95, 0.95); // sloped hood up to the cowl
  s.lineTo(-1.6, 0.98);
  s.quadraticCurveTo(-2.1, 0.97, -2.26, 0.9);
  s.quadraticCurveTo(-2.34, 0.6, -2.2, 0.3);
  return s;
};
const greenShape = () => {
  const s = new THREE.Shape();
  s.moveTo(1.02, 0.93);
  s.quadraticCurveTo(0.55, 1.22, 0.18, 1.42); // raked windscreen
  s.quadraticCurveTo(-0.45, 1.5, -1.02, 1.44);
  s.quadraticCurveTo(-1.38, 1.26, -1.62, 0.96);
  s.lineTo(1.02, 0.93);
  return s;
};
const windowShapes = () => {
  const f = new THREE.Shape();
  f.moveTo(0.86, 1.0);
  f.quadraticCurveTo(0.5, 1.22, 0.18, 1.36);
  f.lineTo(-0.36, 1.38);
  f.lineTo(-0.36, 1.0);
  f.lineTo(0.86, 1.0);
  const r = new THREE.Shape();
  r.moveTo(-0.48, 1.0);
  r.lineTo(-0.48, 1.38);
  r.quadraticCurveTo(-0.95, 1.38, -1.12, 1.33);
  r.quadraticCurveTo(-1.3, 1.2, -1.46, 1.0);
  r.lineTo(-0.48, 1.0);
  return [f, r];
};
const doorShapes = () => {
  const f = new THREE.Shape();
  f.moveTo(-0.38, 0.4);
  f.lineTo(0.86, 0.4);
  f.lineTo(0.88, 0.96);
  f.lineTo(-0.38, 0.96);
  f.lineTo(-0.38, 0.4);
  const r = new THREE.Shape();
  r.moveTo(-0.44, 0.4);
  r.lineTo(-0.44, 0.96);
  r.lineTo(-1.5, 0.96);
  r.lineTo(-1.5, 0.82);
  r.lineTo(-1.08, 0.78);
  r.lineTo(-0.92, 0.56);
  r.lineTo(-0.92, 0.4);
  r.lineTo(-0.44, 0.4);
  return [f, r];
};

const spokedWheel = (x: number, z: number) => {
  const g = new THREE.Group();
  const tire = mesh(new THREE.TorusGeometry(0.25, 0.095, 12, 32), M.tire);
  tire.scale.z = 1.25;
  g.add(tire);
  const rim = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 28), M.rim);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const face = Math.sign(z) * 0.105;
  for (let i = 0; i < 5; i++) {
    const sp = boxAt(0.36, 0.05, 0.03, 0, 0, face, M.trim);
    sp.rotation.z = (i / 5) * Math.PI;
    g.add(sp);
  }
  g.add(boxAt(0.1, 0.1, 0.24, 0, 0, 0, M.trim));
  g.position.set(x, WR, z);
  return g;
};

export type CarState = {
  mode: "hidden" | "panels" | "biw" | "body";
  mat?: "ed" | "paint" | "sweep";
  sweep?: number; // world x of the paint front (sweep)
  doors?: number; // 1 attached, 0 removed (offset away)
  doorAway?: number; // 0..1 travel of removed doors
  wheels?: boolean;
  glass?: boolean;
  interior?: boolean;
  skid?: boolean;
  hanger?: number; // hanger bar top height (world y) or 0
  powertrain?: boolean;
  spin?: number; // wheel rotation (rad)
};

export class CarRig {
  root = new THREE.Group();
  panels = new THREE.Group();
  biw: THREE.Group;
  body = new THREE.Group();
  bodyMeshes: THREE.Mesh[] = [];
  sweepMeshes: THREE.Mesh[] = [];
  doors: { m: THREE.Mesh; side: number; idx: number }[] = [];
  apertures = new THREE.Group();
  wheels: THREE.Group[] = [];
  glass = new THREE.Group();
  interior = new THREE.Group();
  skid = new THREE.Group();
  hanger = new THREE.Group();
  hangerBars: THREE.Mesh[] = [];
  powertrain = new THREE.Group();
  paintClip: THREE.Material[] = [];
  planes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)];

  constructor(sweepable = false) {
    for (let i = 0; i < 2; i++) {
      const p = sidePanel(M.blank);
      p.rotation.x = -Math.PI / 2;
      p.position.set(0, 0.06 + i * 0.07, 0.3 - i * 0.5);
      this.panels.add(p);
    }
    this.root.add(this.panels);
    this.biw = bodyInWhite();
    this.root.add(this.biw);

    const addBody = (o: THREE.Mesh) => {
      this.body.add(o);
      this.bodyMeshes.push(o);
    };
    // polish 2: rounded sedan body — sloped hood, raked windscreen, painted greenhouse, glass panels
    addBody(mesh(extrude(lowerShape(), 1.5, 0.12), M.paint));
    addBody(mesh(extrude(greenShape(), 1.24, 0.1), M.paint));
    for (const z of [-0.58, 0.58]) {
      const hl = boxAt(0.1, 0.09, 0.42, 2.27, 0.7, z, HEAD);
      hl.rotation.z = -0.35;
      this.body.add(hl);
      this.body.add(boxAt(0.08, 0.08, 0.44, -2.33, 0.82, z, M.tail));
      this.body.add(boxAt(0.18, 0.08, 0.12, 0.86, 1.0, z * 1.6, M.trim)); // mirrors
    }
    this.body.add(boxAt(0.06, 0.14, 0.86, 2.36, 0.48, 0, M.trim));
    this.body.add(boxAt(4.3, 0.06, 1.7, 0, 0.3, 0, M.trim));
    const [fs, rs] = doorShapes();
    const ap = new THREE.ShapeGeometry([fs, rs]);
    for (const s of [-1, 1]) {
      const a = new THREE.Mesh(ap, DOOR_DARK);
      a.position.z = s * 0.872;
      this.apertures.add(a);
      [fs, rs].forEach((sh, idx) => {
        const d = mesh(extrude(sh, 0.03, 0.01), M.paint);
        d.position.z = s * 0.885;
        this.body.add(d);
        this.bodyMeshes.push(d);
        this.doors.push({ m: d, side: s, idx });
      });
    }
    this.body.add(this.apertures);
    // windows: side panes split by the B-pillar, raked windscreen, rear glass
    const sideG = new THREE.ShapeGeometry(windowShapes());
    for (const z of [-0.725, 0.725]) {
      const w = new THREE.Mesh(sideG, GLASS_DARK);
      w.position.z = z;
      this.glass.add(w);
    }
    const quad = (x0: number, y0: number, x1: number, y1: number, wd: number) => {
      const L = Math.hypot(x1 - x0, y1 - y0);
      const q = new THREE.Mesh(new THREE.PlaneGeometry(L, wd), GLASS_DARK);
      q.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
      q.rotation.set(-Math.PI / 2, 0, 0);
      const g = new THREE.Group();
      g.add(q);
      g.position.copy(q.position);
      q.position.set(0, 0.006, 0);
      g.rotation.z = Math.atan2(y1 - y0, x1 - x0);
      return g;
    };
    this.glass.add(quad(1.0, 0.99, 0.2, 1.43, 1.26), quad(-1.02, 1.45, -1.6, 1.06, 1.22));
    this.body.add(this.glass);
    for (const x of [0.05, -0.95]) for (const z of [-0.38, 0.38]) {
      this.interior.add(boxAt(0.5, 0.14, 0.5, x, 1.05, z, M.seat));
      this.interior.add(boxAt(0.12, 0.55, 0.48, x - 0.26, 1.3, z, M.seat));
    }
    this.interior.add(boxAt(0.35, 0.18, 1.5, 0.62, 1.07, 0, M.trim));
    this.body.add(this.interior);
    for (const x of [-WB, WB]) for (const z of [-0.74, 0.74]) {
      const w = spokedWheel(x, z);
      this.wheels.push(w);
      this.body.add(w);
    }
    this.root.add(this.body);

    if (sweepable) {
      // second skin in ED grey; clipping planes split the two at the paint front
      const pc = PAINT.clone();
      pc.clippingPlanes = [this.planes[0]];
      const ec = ED_MAT.clone();
      ec.clippingPlanes = [this.planes[1]];
      this.paintClip = [pc, ec];
      for (const m of this.bodyMeshes) {
        const e = new THREE.Mesh(m.geometry, ec);
        e.position.copy(m.position);
        e.rotation.copy(m.rotation);
        e.scale.copy(m.scale);
        e.castShadow = true;
        m.parent!.add(e);
        this.sweepMeshes.push(e);
      }
    }

    // skid
    for (const z of [-0.62, 0.62]) this.skid.add(boxAt(4.2, 0.08, 0.12, 0, 0.08, z, M.robotDark));
    for (const x of [-1.6, 0, 1.6]) this.skid.add(boxAt(0.12, 0.08, 1.36, x, 0.08, 0, M.robotDark));
    this.root.add(this.skid);

    // overhead hanger: two C-arms
    for (const x of [-1.7, 1.7]) {
      const bar = boxAt(0.1, 1, 0.1, x, 0.5, -1.05, M.rail);
      this.hanger.add(bar);
      this.hangerBars.push(bar);
      this.hanger.add(boxAt(0.1, 0.08, 1.1, x, 0.2, -0.5, M.rail));
    }
    this.root.add(this.hanger);

    // engine + transmission + subframes + struts (marriage)
    const eng = std("#5b5f63", 0.45, 0.6);
    this.powertrain.add(boxAt(0.62, 0.5, 0.78, 1.55, 0.62, 0, eng));
    this.powertrain.add(boxAt(0.5, 0.32, 0.4, 0.98, 0.5, 0, eng));
    this.powertrain.add(boxAt(1.0, 0.08, 1.4, 1.4, 0.32, 0, M.robotDark));
    this.powertrain.add(boxAt(0.2, 0.12, 1.5, -1.36, 0.34, 0, M.robotDark));
    for (const x of [-WB, WB]) for (const z of [-0.6, 0.6]) {
      const s = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.62, 10), M.roller);
      s.position.set(x, 0.62, z);
      this.powertrain.add(s);
      const sp = mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 14), std("#c9473a", 0.5));
      sp.rotation.x = Math.PI / 2;
      sp.position.set(x, 0.7, z);
      this.powertrain.add(sp);
      const disc = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 20), M.roller);
      disc.rotation.x = Math.PI / 2;
      disc.position.set(x, WR, z * 1.18);
      this.powertrain.add(disc);
    }
    this.root.add(this.powertrain);
  }

  set(st: CarState) {
    const vis = st.mode !== "hidden";
    this.root.visible = vis;
    if (!vis) return;
    this.panels.visible = st.mode === "panels";
    this.biw.visible = st.mode === "biw";
    this.body.visible = st.mode === "body";
    this.skid.visible = !!st.skid;
    this.powertrain.visible = !!st.powertrain;
    const hy = st.hanger ?? 0;
    this.hanger.visible = hy > 0;
    if (hy > 0) {
      const top = hy - this.root.position.y;
      for (const b of this.hangerBars) {
        b.scale.y = Math.max(0.2, top - 0.2);
        b.position.y = 0.2 + (top - 0.2) / 2;
      }
    }
    if (st.mode !== "body") return;
    const sweep = st.mat === "sweep";
    const mat = st.mat === "ed" ? ED_MAT : PAINT;
    for (const m of this.bodyMeshes) m.material = sweep ? this.paintClip[0] : mat;
    for (const m of this.sweepMeshes) m.visible = sweep;
    if (sweep) {
      const f = st.sweep ?? 0;
      this.planes[0].constant = f;
      this.planes[1].constant = -f;
    }
    const doors = st.doors ?? 1;
    const away = st.doorAway ?? 0;
    this.apertures.visible = doors < 1 || away > 0;
    for (const d of this.doors) {
      const off = (1 - doors) * 0.5 + away * 1.9;
      d.m.position.z = d.side * (0.925 + off);
      d.m.position.y = smooth(0, 0.3, away) * 0.25 - smooth(0.7, 1, away) * 0.2;
      d.m.position.x = away * (d.idx === 0 ? 0.4 : -0.4);
      d.m.visible = !(doors <= 0 && away <= 0);
    }
    for (const w of this.wheels) {
      w.visible = !!st.wheels;
      w.rotation.z = -(st.spin ?? 0);
    }
    this.glass.visible = true;
    for (const g of this.glass.children) g.traverse((o) => ((o as THREE.Mesh).material ? ((o as THREE.Mesh).material = st.glass ? GLASS_DARK : DOOR_DARK) : null));
    this.interior.visible = !!st.interior;
  }
}

// ---------- animated robot (handles on every joint) ----------
export type Arm = { root: THREE.Group; turret: THREE.Group; shoulder: THREE.Group; elbow: THREE.Group; wrist: THREE.Group; tip: THREE.Object3D; base: THREE.Vector3; scale: number };
export const makeArm = (base: THREE.Vector3, mat: THREE.Material, scale: number, tool: "gun" | "bell" | "grip"): Arm => {
  const root = new THREE.Group();
  root.position.copy(base);
  root.scale.setScalar(scale);
  root.add(boxAt(0.9, 0.12, 0.9, 0, 0.06, 0, M.robotDark));
  const b = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.42, 28), mat);
  b.position.y = 0.33;
  root.add(b);
  const turret = new THREE.Group();
  turret.position.y = 0.54;
  root.add(turret);
  const tb = mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 24), mat);
  tb.position.y = 0.15;
  turret.add(tb);
  const joint = (r: number, w: number) => {
    const j = mesh(new THREE.CylinderGeometry(r, r, w, 24), M.robotDark);
    j.rotation.x = Math.PI / 2;
    return j;
  };
  const shoulder = new THREE.Group();
  shoulder.position.set(0.12, 0.42, 0);
  turret.add(shoulder);
  shoulder.add(joint(0.2, 0.5));
  const up = mesh(new THREE.BoxGeometry(0.28, 1.5, 0.3), mat);
  up.position.y = 0.75;
  shoulder.add(up);
  const elbow = new THREE.Group();
  elbow.position.y = 1.5;
  shoulder.add(elbow);
  elbow.add(joint(0.17, 0.44));
  const mo = mesh(new THREE.BoxGeometry(0.36, 0.34, 0.36), mat);
  mo.position.x = -0.18;
  elbow.add(mo);
  const fo = mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.25, 20), mat);
  fo.rotation.z = -Math.PI / 2;
  fo.position.x = 0.62;
  elbow.add(fo);
  const wrist = new THREE.Group();
  wrist.position.x = 1.25;
  elbow.add(wrist);
  wrist.add(joint(0.1, 0.24));
  if (tool === "gun") {
    // C-shaped spot-weld gun
    wrist.add(boxAt(0.12, 0.2, 0.12, 0, -0.12, 0, M.robotDark));
    const c = mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 20, Math.PI * 1.4), M.roller);
    c.position.set(0, -0.3, 0);
    c.rotation.z = Math.PI * 0.8;
    wrist.add(c);
  } else if (tool === "bell") {
    wrist.add(boxAt(0.1, 0.24, 0.1, 0, -0.14, 0, M.robotWhite));
    const bell = mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.12, 20), M.roller);
    bell.position.y = -0.32;
    wrist.add(bell);
  } else {
    wrist.add(boxAt(0.1, 0.24, 0.1, 0, -0.14, 0, M.robotDark));
    wrist.add(boxAt(0.5, 0.04, 0.3, 0, -0.28, 0, M.robotDark));
  }
  const tip = new THREE.Object3D();
  tip.position.y = -0.46;
  wrist.add(tip);
  return { root, turret, shoulder, elbow, wrist, tip, base: base.clone(), scale };
};
export const poseArm = (a: Arm, target: THREE.Vector3) => {
  const p = aimRobot(a.base, target, a.scale);
  a.turret.rotation.y = p.yaw;
  a.shoulder.rotation.z = p.shoulder;
  a.elbow.rotation.z = p.elbow;
  a.wrist.rotation.z = p.wrist;
};

// ---------- spark burst (preallocated, rewritten per frame) ----------
class Sparks {
  n = 90;
  g = new THREE.BufferGeometry();
  pos = new Float32Array(this.n * 6);
  col = new Float32Array(this.n * 6);
  obj: THREE.Group;
  halo: THREE.Sprite;
  constructor(public seed: number) {
    this.g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.g.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    const l = new THREE.LineSegments(this.g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    l.layers.set(FX_LAYER);
    l.frustumCulled = false;
    this.halo = glowSprite(new THREE.Color("#ffc27a"), 1.4, 0.9);
    this.obj = new THREE.Group();
    this.obj.add(l, this.halo);
  }
  /** age: seconds since the weld fired; energy fades over 0.45 s. */
  update(at: THREE.Vector3, age: number, burst: number) {
    this.obj.position.copy(at);
    const on = age >= 0 && age < 0.5;
    this.obj.visible = on;
    if (!on) return;
    const k = 1 - age / 0.5;
    this.halo.scale.setScalar(0.6 + 1.6 * k);
    (this.halo.material as THREE.SpriteMaterial).opacity = 0.95 * k;
    for (let i = 0; i < this.n; i++) {
      const h1 = hash(this.seed + burst * 31 + i * 7.1);
      const h2 = hash(this.seed + burst * 17 + i * 3.3 + 11);
      const h3 = hash(this.seed + i * 1.7 + 29);
      const tt = Math.max(0, age - h3 * 0.08) * 0.9;
      const az = h1 * Math.PI * 2;
      const sp = 1.4 + h2 * 3.2;
      const vx = Math.cos(az) * sp * 0.8;
      const vz = Math.sin(az) * sp * 0.8;
      const vy = 0.5 + h2 * 2.0;
      const P = (s: number) => [vx * s, vy * s - 4.9 * s * s, vz * s];
      const a = P(tt);
      const b = P(Math.max(0, tt - 0.04 - h2 * 0.03));
      const e = Math.max(0, 1 - tt / (0.25 + h3 * 0.25));
      this.pos.set([...a, ...b], i * 6);
      this.col.set([3 * e, 2.2 * e, 1.1 * e, 1.0 * e, 0.45 * e, 0.12 * e], i * 6);
    }
    this.g.attributes.position.needsUpdate = true;
    this.g.attributes.color.needsUpdate = true;
  }
}

// ---------- simple worker figure (no face) ----------
export type Worker = { root: THREE.Group; armR: THREE.Group; armL: THREE.Group };
const makeWorker = (x: number, z: number, yaw: number): Worker => {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.rotation.y = yaw;
  for (const s of [-1, 1]) root.add(boxAt(0.16, 0.85, 0.18, 0, 0.43, s * 0.11, NAVY));
  root.add(boxAt(0.3, 0.7, 0.44, 0, 1.2, 0, NAVY));
  const head = mesh(new THREE.SphereGeometry(0.13, 16, 12), SKIN);
  head.position.y = 1.68;
  root.add(head);
  const hat = mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), HELMET);
  hat.position.y = 1.7;
  root.add(hat);
  const arm = (s: number) => {
    const g = new THREE.Group();
    g.position.set(0, 1.5, s * 0.28);
    const a = boxAt(0.11, 0.62, 0.11, 0, -0.31, 0, NAVY);
    g.add(a);
    root.add(g);
    return g;
  };
  return { root, armR: arm(1), armL: arm(-1) };
};

// ---------- the plant ----------
export type FilmWorld = ReturnType<typeof buildFilmWorld>;

export const buildFilmWorld = () => {
  const root = new THREE.Group();
  const add = (o: THREE.Object3D) => (root.add(o), o);

  // ground + floor (floor split around the ED tank pit)
  const grass = mesh(new THREE.PlaneGeometry(800, 800), M.grass, false);
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.03;
  add(grass);
  const tex = concreteTexture().clone();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.needsUpdate = true;
  const floorMat = std("#e6e1d7", 0.82, 0, { map: tex });
  const slab = (x0: number, x1: number, z0: number, z1: number) => {
    const o = mesh(new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0), floorMat, false);
    o.position.set((x0 + x1) / 2, -0.1, (z0 + z1) / 2);
    add(o);
  };
  slab(-50, ED0, -13, 13);
  slab(ED1, 66, -13, 13);
  slab(ED0, ED1, -13, -1.7);
  slab(ED0, ED1, 1.7, 13);
  const grid = new THREE.GridHelper(132, 44, 0x8f8a80, 0x8f8a80);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.22;
  grid.position.set(8, 0.004, 0);
  add(grid);
  for (const z of [-2.0, 2.0]) add(boxAt(84, 0.01, 0.1, 8, 0.006, z, M.hazardY));
  for (const z of [-5.2, 5.2]) add(boxAt(110, 0.01, 0.08, 8, 0.006, z, M.hazardY));
  // low walls (cut-away hall) + columns on the back wall
  add(boxAt(116, 3.2, 0.3, 8, 1.6, -13, M.wall));
  add(boxAt(116, 0.7, 0.18, 8, 2.6, -12.9, std("#bcd3dc", 0.08, 0.4)));
  add(boxAt(116, 0.9, 0.3, 8, 0.45, 13, M.wall));
  for (let x = -48; x <= 64; x += 8) add(boxAt(0.32, 4.4, 0.32, x, 2.2, -12.6, M.column));

  // conveyors: skid rails up to the marriage station (open over the ED tank), slat belt after
  const rails = (x0: number, x1: number) => {
    const L = x1 - x0;
    for (const z of [-0.62, 0.62]) {
      add(boxAt(L, 0.16, 0.14, (x0 + x1) / 2, LINE_Y - 0.1, z, M.rail));
      for (let x = x0 + 0.3; x < x1; x += 0.55) {
        const r = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12), M.roller);
        r.rotation.x = Math.PI / 2;
        r.position.set(x, LINE_Y - 0.02, z);
        add(r);
      }
    }
    for (let x = x0 + 0.6; x < x1; x += 2.4) for (const z of [-0.62, 0.62]) add(boxAt(0.12, LINE_Y - 0.12, 0.12, x, (LINE_Y - 0.12) / 2, z, M.rail));
  };
  rails(X.START, ED0 - 2.2);
  rails(ED1 + 2.2, X.MARRY - 1);
  const slats: THREE.Mesh[] = [];
  add(boxAt(X.GATE + 4 - X.MARRY, 0.06, 2.3, (X.MARRY + X.GATE + 4) / 2, 0.02, 0, M.rail));
  for (let x = X.MARRY; x < X.GATE + 4; x += 0.5) slats.push(add(boxAt(0.42, 0.03, 2.2, x, 0.065, 0, M.roller)) as THREE.Mesh);
  // floor chevrons that slide with the line (show the line is always moving)
  const chevM = new THREE.MeshBasicMaterial({ color: C.mint, toneMapped: false, transparent: true, opacity: 0.85 });
  const chevrons: THREE.Mesh[] = [];
  const chevG = new THREE.ShapeGeometry(
    (() => {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.lineTo(0.35, 0.25);
      s.lineTo(0, 0.5);
      s.lineTo(0.1, 0.5);
      s.lineTo(0.45, 0.25);
      s.lineTo(0.1, 0);
      s.lineTo(0, 0);
      return s;
    })(),
  );
  for (let i = 0; i < 60; i++) {
    const c = new THREE.Mesh(chevG, chevM);
    c.rotation.x = -Math.PI / 2;
    add(c);
    chevrons.push(c);
  }

  // --- press (tandem look: one big gantry press + a smaller one upstream) ---
  const press = new THREE.Group();
  press.position.set(X.PRESS, 0, 0);
  add(press);
  press.add(boxAt(5.6, 0.9, 3.0, 0, 0.45, 0, M.creamDark));
  press.add(boxAt(5.6, 0.08, 3.0, 0, 0.94, 0, M.rail));
  for (const s of [-1, 1]) {
    press.add(boxAt(0.6, 2.6, 0.7, s * 2.6, 2.2, -1.15, M.cream));
    press.add(boxAt(0.6, 2.6, 0.7, s * 2.6, 2.2, 1.15, M.cream));
    press.add(boxAt(5.6, 0.12, 0.14, 0, 0.84, s * 1.52, M.hazardY));
  }
  press.add(boxAt(6.0, 1.0, 3.9, 0, 4.0, 0, M.cream));
  press.add(boxAt(6.02, 0.12, 3.92, 0, 3.54, 0, M.robot));
  const ram = new THREE.Group();
  ram.add(boxAt(4.6, 0.5, 2.4, 0, 0, 0, M.rail));
  ram.add(boxAt(4.4, 0.1, 2.2, 0, -0.3, 0, M.bareDark));
  press.add(ram);
  const rods = [-1, 1].flatMap((s) => [-0.7, 0.7].map((z) => press.add(boxAt(0.2, 1, 0.2, s * 1.4, 0, z, M.roller)).children.at(-1) as THREE.Mesh));
  const pl0 = new THREE.PointLight("#fff1d8", 14, 9, 1.6);
  pl0.position.set(0, 1.9, 1.0);
  press.add(pl0);
  for (const s of [-1, 1]) press.add(boxAt(4.6, 0.06, 0.14, 0, 3.42, s * 1.3, M.lamp)); // work light bars under the crown
  const press2 = press.clone();
  press2.position.set(X.PRESS - 8, 0, 0);
  press2.scale.setScalar(0.85);
  add(press2);
  const blank = add(boxAt(4.4, 0.03, 1.9, 0, 0, 0, M.blank)) as THREE.Mesh;
  const pressPanel = sidePanel(M.blank);
  pressPanel.rotation.x = -Math.PI / 2;
  add(pressPanel);
  const scraps = [0, 1, 2].map((i) => add(boxAt(0.4 + i * 0.1, 0.03, 0.3, 0, 0, 0, M.blank)) as THREE.Mesh);
  // stack of blanks + coil feeding the press
  for (let i = 0; i < 8; i++) add(boxAt(4.4, 0.03, 1.9, X.PRESS - 4.2, 0.12 + i * 0.035, 3.6, M.blank));
  add(boxAt(4.6, 0.1, 2.1, X.PRESS - 4.2, 0.05, 3.6, M.pallet));
  // out-feed stack of stamped panels
  add(boxAt(4.9, 0.14, 2.0, X.PRESS + 2.6, 0.07, 4.0, M.pallet));
  for (let i = 0; i < 3; i++) {
    const p = sidePanel(M.blank);
    p.rotation.x = -Math.PI / 2;
    p.position.set(X.PRESS + 2.6, 0.17 + i * 0.07, 3.8);
    add(p);
  }
  // AUDIRA lettering on the press crown (in-world brand)
  const brandTex = textPlate(
    [
      { text: "AUDIRA", size: 150, weight: 600, color: "#1f2426", spacing: 34 },
      { text: "ASSEMBLY LINE 01", size: 54, weight: 600, color: C.accent, spacing: 14 },
    ],
    1400,
    420,
    "transparent",
  );
  const brandMat = new THREE.MeshStandardMaterial({ map: brandTex, transparent: true, roughness: 0.7 });
  const crownFace = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.26), brandMat);
  crownFace.position.set(X.PRESS, 4.0, 1.962);
  add(crownFace);

  // --- body shop robots (2 near side, 1 far side) ---
  const weldArms = [
    makeArm(new THREE.Vector3(X.WELD + 0.9, 0, 2.5), ROBOT, 0.95, "gun"),
    makeArm(new THREE.Vector3(X.WELD - 1.5, 0, 2.6), ROBOT, 0.95, "gun"),
    makeArm(new THREE.Vector3(X.WELD - 0.6, 0, -2.5), ROBOT, 0.95, "gun"),
  ];
  weldArms.forEach((a) => add(a.root));
  const sparks = weldArms.map((_, i) => new Sparks(13 + i * 41));
  sparks.forEach((s) => add(s.obj));
  const weldLight = new THREE.PointLight("#ffb562", 0, 5, 2);
  add(weldLight);
  // weld dots (instanced): glow when fired, then cool to dark
  const DOTS = 54;
  const dotM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), DOTS);
  dotM.layers.set(FX_LAYER);
  add(dotM);
  const heroBIW = new CarRig();
  add(heroBIW.root);

  // --- ED tank (raised walls, translucent liquid) + overhead rail ---
  const edG = new THREE.Group();
  add(edG);
  const L = ED1 - ED0;
  const cx = (ED0 + ED1) / 2;
  edG.add(boxAt(L + 0.4, 1.4, 0.2, cx, 0.5, -1.8, M.cream));
  edG.add(boxAt(L + 0.4, 0.5, 0.2, cx, 1.0, 1.8, M.cream));
  edG.add(boxAt(0.2, 1.4, 3.6, ED0 - 0.1, 0.5, 0, M.cream));
  edG.add(boxAt(0.2, 1.4, 3.6, ED1 + 0.1, 0.5, 0, M.cream));
  edG.add(boxAt(L + 0.4, 0.08, 0.24, cx, 1.24, 1.8, M.hazardY));
  const liquid = mesh(new THREE.BoxGeometry(L, 2.9, 3.4), LIQ, false);
  liquid.position.set(cx, -0.3, 0);
  liquid.renderOrder = 3;
  edG.add(liquid);
  // tank pit walls under the floor
  edG.add(boxAt(L, 0.1, 3.4, cx, -1.8, 0, M.rail));
  for (let x = ED0 + 1; x < ED1; x += 1.5) for (const z of [-1.55, 1.55]) edG.add(boxAt(0.5, 1.6, 0.06, x, -0.9, z, std("#8d949a", 0.4, 0.8))); // electrodes
  for (const z of [-1.2]) edG.add(boxAt(L + 6, 0.2, 0.22, cx, 4.6, z, M.truss));
  for (const x of [ED0 - 3, ED1 + 3]) edG.add(boxAt(0.22, 4.6, 0.22, x, 2.3, -1.2, M.truss));
  for (const x of [ED0 + 2.5, ED1 - 2.5]) {
    const l = new THREE.PointLight("#e8f4ff", 10, 9, 1.5);
    l.position.set(x, 3.6, 1.2);
    edG.add(l);
    edG.add(boxAt(2.2, 0.06, 0.2, x, 4.45, -1.2, M.lamp));
  }
  // electric field arcs (FX lines) over the liquid
  const arcN = 40;
  const arcPos = new Float32Array(arcN * 6);
  const arcG = new THREE.BufferGeometry();
  arcG.setAttribute("position", new THREE.BufferAttribute(arcPos, 3));
  const arcMat = new THREE.LineBasicMaterial({ color: new THREE.Color(1.2, 2.2, 3.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const arcs = new THREE.LineSegments(arcG, arcMat);
  arcs.layers.set(FX_LAYER);
  arcs.frustumCulled = false;
  add(arcs);
  const heroED = new CarRig();
  add(heroED.root);

  // --- paint booth + robots + mist ---
  const PX = X.PAINT;
  for (const s of [-1, 1]) {
    for (const x of [-3, 3]) add(boxAt(0.14, 3.6, 0.14, PX + x, 1.8, s * 2.4, M.robotWhite));
    add(boxAt(6.1, 0.16, 0.16, PX, 3.6, s * 2.4, M.robotWhite));
    const g = boxAt(5.9, s < 0 ? 3.4 : 1.0, 0.04, PX, s < 0 ? 1.8 : 0.6, s * 2.4, M.boothGlass);
    g.castShadow = false;
    add(g);
    add(boxAt(5.6, 0.08, 0.3, PX, 3.45, s * 2.25, M.lamp));
  }
  for (const x of [-3, 3]) add(boxAt(0.16, 0.16, 4.9, PX + x, 3.6, 0, M.robotWhite));
  const paintArms = [makeArm(new THREE.Vector3(PX + 0.4, 0, -1.95), M.robotWhite, 0.85, "bell"), makeArm(new THREE.Vector3(PX - 0.8, 0, 1.95), M.robotWhite, 0.85, "bell")];
  paintArms.forEach((a) => add(a.root));
  const mistCol = new THREE.Color(C.paint).lerp(new THREE.Color("#ffffff"), 0.3);
  const mists = paintArms.map(() => {
    const g = new THREE.Group();
    for (let i = 0; i < 22; i++) {
      const s = glowSprite(mistCol, 0.3, 0.2);
      (s.material as THREE.SpriteMaterial).blending = THREE.NormalBlending;
      g.add(s);
    }
    add(g);
    return g;
  });
  const heroPaint = new CarRig(true);
  add(heroPaint.root);

  // --- oven tunnel ---
  const OL = X.OVEN1 - X.OVEN0;
  const ox = (X.OVEN0 + X.OVEN1) / 2;
  add(boxAt(OL, 0.3, 3.8, ox, 3.0, 0, M.cream));
  for (const s of [-1, 1]) add(boxAt(OL, 3.0, 0.3, ox, 1.5, s * 1.9, M.cream));
  add(boxAt(OL, 0.1, 0.32, ox, 2.2, 1.9, M.hazardY));
  const ovenIn = mesh(new THREE.BoxGeometry(OL - 0.2, 2.6, 3.4), OVEN_IN, false);
  (ovenIn.material as THREE.Material).side = THREE.BackSide;
  ovenIn.position.set(ox, 1.35, 0);
  add(ovenIn);
  const ovenLight = new THREE.PointLight("#ff8a3a", 6, 7, 2);
  ovenLight.position.set(X.OVEN0 + 0.5, 1.5, 0);
  add(ovenLight);
  const ovenGlow = glowSprite(new THREE.Color("#ff9a4a"), 3.4, 0.55);
  ovenGlow.position.set(X.OVEN0 - 0.1, 1.4, 0);
  add(ovenGlow);

  // --- assembly: door station, marriage, parts ---
  const doorCart = new THREE.Group();
  doorCart.position.set(X.DOOR, 0, 3.0);
  doorCart.add(boxAt(2.6, 0.5, 0.9, 0, 0.25, 0, M.robotDark));
  for (const x of [-1.2, 1.2]) doorCart.add(boxAt(0.08, 1.4, 0.08, x, 0.95, -0.3, M.rail));
  add(doorCart);
  const doorCart2 = doorCart.clone();
  doorCart2.position.z = -3.0;
  add(doorCart2);
  const heroDoor = new CarRig();
  add(heroDoor.root);
  // marriage: overhead rail + AGV
  add(boxAt(10, 0.24, 0.24, X.MARRY, 5.0, -1.2, M.truss));
  for (const x of [X.MARRY - 5, X.MARRY + 5]) add(boxAt(0.22, 5.0, 0.22, x, 2.5, -1.2, M.truss));
  const agv = new THREE.Group();
  agv.add(boxAt(2.4, 0.32, 1.5, 0, 0.16, 0, AGV));
  agv.add(boxAt(2.42, 0.06, 1.52, 0, 0.3, 0, M.hazardY));
  const lift = new THREE.Group();
  lift.add(boxAt(3.6, 0.08, 1.2, 0, 0, 0, M.robotDark));
  agv.add(lift);
  const liftCol = boxAt(0.3, 1, 0.3, 0, 0, 0, M.roller);
  agv.add(liftCol);
  add(agv);
  const heroMarry = new CarRig();
  add(heroMarry.root);
  // parts station: workers, robot with windscreen, AGV with kanban bins
  const workers = [makeWorker(X.PARTS + 1.4, 1.7, Math.PI / 2), makeWorker(X.PARTS - 1.3, 1.8, Math.PI / 2), makeWorker(X.MARRY + 4.0, -2.0, -Math.PI / 2)];
  workers.forEach((w) => add(w.root));
  const glassArm = makeArm(new THREE.Vector3(X.PARTS + 1.2, 0, -2.7), ROBOT, 1.0, "grip");
  add(glassArm.root);
  const windscreen = mesh(new THREE.BoxGeometry(0.62, 0.02, 1.36), M.glass, false);
  add(windscreen);
  const loose = wheel(0, 0);
  add(loose);
  const binCart = new THREE.Group();
  binCart.add(boxAt(1.8, 0.3, 1.0, 0, 0.2, 0, AGV));
  for (let i = 0; i < 3; i++) {
    binCart.add(boxAt(0.5, 0.32, 0.7, -0.6 + i * 0.6, 0.52, 0, BIN));
    const card = boxAt(0.18, 0.12, 0.01, -0.6 + i * 0.6, 0.6, 0.36, std("#fbf7ee", 0.6, 0, { emissive: "#fff2c0", emissiveIntensity: 0.4 }));
    binCart.add(card);
  }
  add(binCart);
  const rack = new THREE.Group();
  rack.position.set(X.PARTS - 0.5, 0, -4.4);
  for (const x of [-1.6, 1.6]) for (const z of [-0.45, 0.45]) rack.add(boxAt(0.08, 2.0, 0.08, x, 1.0, z, M.rail));
  for (const y of [0.3, 1.0, 1.7]) {
    rack.add(boxAt(3.3, 0.05, 1.0, 0, y, 0, M.rail));
    for (let i = 0; i < 6; i++) if (hash(i * 3 + y * 10) > 0.25) rack.add(boxAt(0.46, 0.3, 0.7, -1.3 + i * 0.52, y + 0.18, 0, BIN));
  }
  add(rack);
  const heroParts = new CarRig();
  add(heroParts.root);

  // --- andon: pull cord along the assembly line + light board ---
  for (let x = 12; x <= 34; x += 5.5) add(boxAt(0.08, 2.4, 0.08, x, 1.2, 2.3, M.rail));
  const cordPts = [new THREE.Vector3(12, 2.3, 2.3), new THREE.Vector3(26.5, 2.3, 2.3), new THREE.Vector3(34, 2.3, 2.3)];
  const cordG = new THREE.BufferGeometry().setFromPoints(cordPts);
  const cord = new THREE.Line(cordG, new THREE.LineBasicMaterial({ color: "#f0c040" }));
  add(cord);
  const board = new THREE.Group();
  board.position.set(26, 4.8, -2.9);
  board.add(boxAt(6.4, 1.3, 0.2, 0, 0, 0, std("#2a2d30", 0.6)));
  for (const x of [-2.6, 2.6]) board.add(boxAt(0.1, 1.4, 0.1, x, 1.3, 0, M.rail));
  const cells: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 6; i++) {
    const m = std("#3b4044", 0.5, 0, { emissive: "#000000", emissiveIntensity: 1.5 });
    cells.push(m);
    board.add(boxAt(0.86, 0.8, 0.04, -2.5 + i, 0, 0.12, m));
  }
  add(board);
  const boardNums = textPlate([{ text: "1     2     3     4     5     6", size: 64, weight: 600, color: "#f6f2ea", spacing: 6 }], 1200, 120, "transparent");
  const nums = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 0.6), new THREE.MeshBasicMaterial({ map: boardNums, transparent: true, toneMapped: false }));
  nums.position.set(26, 4.8, -2.75);
  add(nums);

  // --- shower booth ---
  const SX = X.SHOWER;
  for (const s of [-1, 1]) {
    for (const x of [-3, 3]) add(boxAt(0.16, 3.4, 0.16, SX + x, 1.7, s * 2.2, M.robotWhite));
    add(boxAt(6.2, 0.16, 0.16, SX, 3.4, s * 2.2, M.robotWhite));
    const g = boxAt(5.9, s < 0 ? 3.2 : 0.9, 0.04, SX, s < 0 ? 1.7 : 0.45, s * 2.2, M.boothGlass);
    g.castShadow = false;
    add(g);
  }
  for (const x of [-2, 0, 2]) {
    const ring = mesh(new THREE.TorusGeometry(2.2, 0.05, 6, 32, Math.PI), M.roller);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(SX + x, 0.4, 0);
    ring.scale.set(1, 1.2, 1);
    add(ring);
  }
  const jetN = 140;
  const jetPos = new Float32Array(jetN * 6);
  const jetG = new THREE.BufferGeometry();
  jetG.setAttribute("position", new THREE.BufferAttribute(jetPos, 3));
  const jetMat = new THREE.LineBasicMaterial({ color: WATER, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const jets = new THREE.LineSegments(jetG, jetMat);
  jets.layers.set(FX_LAYER);
  jets.frustumCulled = false;
  add(jets);
  const heroShower = new CarRig();
  add(heroShower.root);

  // --- roller test pit ---
  const RX = X.ROLLER;
  add(boxAt(5.6, 0.04, 2.6, RX, 0.005, 0, M.rail));
  const drums: THREE.Group[] = [];
  for (const x of [-WB, WB]) {
    for (const dx of [-0.32, 0.32]) {
      const g = new THREE.Group();
      const d = mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.2, 24), M.roller);
      d.rotation.x = Math.PI / 2;
      g.add(d);
      for (let k = 0; k < 6; k++) {
        const st = boxAt(0.02, 0.02, 2.22, Math.cos((k / 6) * Math.PI * 2) * 0.22, Math.sin((k / 6) * Math.PI * 2) * 0.22, 0, M.robotDark);
        g.add(st);
      }
      g.position.set(RX + x + dx, 0.08, 0);
      add(g);
      drums.push(g);
    }
  }
  add(boxAt(1.2, 1.4, 0.9, RX + 3.6, 0.7, -2.6, M.cream));
  const heroRoller = new CarRig();
  add(heroRoller.root);

  // --- exit gate with the AUDIRA sign ---
  for (const z of [-3.4, 3.4]) add(boxAt(0.4, 5.4, 0.4, X.GATE, 2.7, z, M.cream));
  add(boxAt(0.5, 1.5, 7.2, X.GATE, 5.15, 0, M.cream));
  add(boxAt(0.52, 0.12, 7.22, X.GATE, 4.4, 0, M.robot));
  const signTex = textPlate(
    [
      { text: "AUDIRA", size: 170, weight: 600, color: "#1f2426", spacing: 40 },
      { text: "ASSEMBLY LINE 01 · EXIT", size: 52, weight: 600, color: C.accent, spacing: 12 },
    ],
    1600,
    460,
    "transparent",
  );
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.6), new THREE.MeshStandardMaterial({ map: signTex, transparent: true, roughness: 0.7 }));
  sign.position.set(X.GATE + 0.26, 5.15, 0);
  sign.rotation.y = Math.PI / 2;
  add(sign);
  const exitLamps = [-1, 1].map((s) => add(boxAt(0.1, 0.1, 0.6, X.GATE + 0.3, 4.6, s * 2.6, M.lamp)));
  void exitLamps;

  // --- flow units (12 cars, 8 m apart) ---
  const flow = Array.from({ length: 12 }, () => new CarRig());
  flow.forEach((u) => add(u.root));

  // timeline path drawn on the floor (hook: "berjam-jam")
  const pathM = new THREE.MeshBasicMaterial({ color: C.accent, toneMapped: false });
  const path = mesh(new THREE.BoxGeometry(1, 0.02, 0.18), pathM, false);
  path.receiveShadow = false;
  add(path);

  // foreground layer for close shots (placed near the camera each frame, blurred by DOF)
  const fg = new THREE.Group();
  fg.add(boxAt(0.14, 3.2, 0.14, 0, 1.6, 0, M.hazardY));
  for (let i = 0; i < 6; i++) fg.add(boxAt(0.15, 0.18, 0.16, 0, 0.4 + i * 0.5, 0, M.robotDark));
  const fgRack = new THREE.Group();
  fgRack.position.set(0.9, 0, 0.3);
  fgRack.add(boxAt(1.2, 0.06, 0.6, 0, 0.6, 0, M.rail));
  for (let i = 0; i < 2; i++) fgRack.add(boxAt(0.5, 0.3, 0.5, -0.3 + i * 0.6, 0.78, 0, BIN));
  fg.add(fgRack);
  add(fg);

  const heroes = [heroBIW, heroED, heroPaint, heroDoor, heroMarry, heroParts, heroShower, heroRoller];
  const tmp = new THREE.Vector3();

  // ------------------------------------------------------------------
  const update = (t: number, close: boolean) => {
    // flow line
    const disp = K.flowDisp(t);
    flow.forEach((u, i) => {
      const x = X.START + ((((8 * i + disp + 1.4) % 96) + 96) % 96);
      u.root.position.set(x, 0, 0);
      if (close || x > X.GATE + 6) {
        u.set({ mode: "hidden" });
        return;
      }
      flowState(u, x, t);
    });
    for (const c of chevrons) c.visible = false;
    if (!close) {
      chevrons.forEach((c, i) => {
        const base = X.START + 1 + ((i * 1.6 + disp) % 96);
        if (base > X.GATE + 2 || (base > ED0 - 2.5 && base < ED1 + 2.5)) return;
        c.visible = K.showChevrons(t);
        c.position.set(base, 0.012, 1.45);
      });
    }
    slats.forEach((s, i) => (s.position.x = X.MARRY + (((i * 0.5 + disp) % (X.GATE + 4 - X.MARRY)) + 0)));

    for (const h of heroes) h.set({ mode: "hidden" });

    // press cycle
    const pr = K.press(t);
    ram.position.y = pr.ramY;
    for (const r of rods) {
      r.scale.y = 3.5 - pr.ramY - 0.25;
      r.position.y = (pr.ramY + 0.25 + 3.5) / 2;
    }
    blank.visible = pr.blank >= 0;
    blank.position.set(X.PRESS - 4.5 + pr.blank * 4.5, 1.0, 0);
    pressPanel.visible = pr.panel >= 0;
    pressPanel.position.set(X.PRESS + pr.panel * 5.5, 1.0 - pr.panel * 0.35 * 0, 0);
    scraps.forEach((s, i) => {
      s.visible = pr.scrap >= 0 && pr.scrap < 1;
      const k = Math.max(0, pr.scrap);
      s.position.set(X.PRESS - 1.6 + i * 1.4, 1.0 - k * k * 1.2, 1.4 + k * 0.3);
      s.rotation.set(k * 2 + i, k, k * 1.5);
    });

    // body shop robots
    const wk = K.weld(t);
    weldArms.forEach((a, i) => {
      const w = wk.arms[i];
      poseArm(a, tmp.set(X.WELD + w.x, w.y, w.z));
      a.root.updateMatrixWorld(true);
      const tip = new THREE.Vector3();
      a.tip.getWorldPosition(tip);
      sparks[i].update(tip, close && K.inWeldShot(t) ? w.age : -1, w.burst);
    });
    const fire = wk.arms.reduce((m, a) => (a.age >= 0 && a.age < 0.3 ? Math.max(m, 1 - a.age / 0.3) : m), 0);
    weldLight.intensity = close && K.inWeldShot(t) ? fire * 8 : 0;
    if (fire > 0) {
      const a = wk.arms.find((q) => q.age >= 0 && q.age < 0.3)!;
      weldLight.position.set(X.WELD + a.x, a.y, a.z * 1.4);
    }
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < DOTS; i++) {
      const d = wk.dots[i];
      const on = close && d && d.age >= 0 && K.inWeldShot(t);
      dummy.position.set(on ? X.WELD + d.x : 0, on ? d.y : -50, on ? d.z : 0);
      dummy.updateMatrix();
      dotM.setMatrixAt(i, dummy.matrix);
      if (on) {
        const heat = Math.max(0, 1 - d.age / 1.2);
        col.setRGB(0.35 + 3 * heat, 0.33 + 1.4 * heat, 0.3 + 0.4 * heat);
        dotM.setColorAt(i, col);
      }
    }
    dotM.instanceMatrix.needsUpdate = true;
    if (dotM.instanceColor) dotM.instanceColor.needsUpdate = true;

    // paint robots sweep + mist
    const pk = K.paint(t);
    paintArms.forEach((a, i) => {
      const side = i === 0 ? -1 : 1;
      poseArm(a, tmp.set(pk.nozzleX, 1.9 + Math.sin(t * 3 + i) * 0.15, side * 1.45));
      a.root.updateMatrixWorld(true);
      const tip = new THREE.Vector3();
      a.tip.getWorldPosition(tip);
      mists[i].visible = close && pk.spray > 0;
      mists[i].children.forEach((c, k) => {
        const s = c as THREE.Sprite;
        const u = (hash(k * 5.3 + i) + t * 1.6) % 1;
        s.position.set(tip.x + (hash(k * 2.1) - 0.5) * 0.6 * u, tip.y - u * 0.5 + (hash(k * 4.4) - 0.5) * 0.3 * u, tip.z - side * u * 0.55);
        s.scale.setScalar(0.12 + 0.6 * u);
        (s.material as THREE.SpriteMaterial).opacity = 0.22 * (1 - u * 0.6) * pk.spray;
      });
    });

    // ED electric arcs
    const ek = K.ed(t);
    arcMat.opacity = close ? ek.charge : 0;
    for (let i = 0; i < arcN; i++) {
      const x0 = ED0 + 0.6 + hash(i * 3.1) * (L - 1.2);
      const z0 = (hash(i * 7.7) - 0.5) * 2.8;
      const j = Math.floor(t * 12 + i);
      const len = 0.25 + hash(j * 1.3) * 0.35;
      const a = hash(j * 2.9) * Math.PI * 2;
      arcPos.set([x0, 1.17, z0, x0 + Math.cos(a) * len, 1.17 + hash(j) * 0.05, z0 + Math.sin(a) * len], i * 6);
    }
    arcG.attributes.position.needsUpdate = true;

    // shower jets
    const sk = K.shower(t);
    jetMat.opacity = close ? sk : 0;
    for (let i = 0; i < jetN; i++) {
      const ring = i % 3;
      const ang = (hash(i * 1.9) - 0.5) * Math.PI * 0.95;
      const ox = SX + (ring - 1) * 2;
      const nx = ox + (hash(i * 4.1) - 0.5) * 0.2;
      const ny = 0.4 + Math.cos(ang) * 2.64;
      const nz = Math.sin(ang) * 2.2;
      const u = (hash(i * 3.7) + t * 2.4) % 1;
      const tx = SX + (hash(i * 6.1) - 0.5) * 3.6;
      const ty = 0.9 + hash(i * 2.2) * 0.6;
      const tz = 0;
      const p = (k: number) => [lerp(nx, tx, k), lerp(ny, ty, k), lerp(nz, tz * 0.4, k)];
      jetPos.set([...p(u * 0.82), ...p(Math.min(0.82, u * 0.82 + 0.12))], i * 6);
    }
    jetG.attributes.position.needsUpdate = true;

    // roller drums
    const rk = K.roller(t);
    drums.forEach((d) => (d.rotation.z = rk.spin * (WR / 0.22)));

    // andon board + cord
    const ak = K.andon(t);
    cells.forEach((m, i) => {
      m.emissive.set(i === 3 ? (ak.level >= 2 ? "#ff3a2a" : ak.level >= 1 ? "#ffc23a" : "#000000") : i < 3 ? "#2a5a3a" : "#000000");
      m.emissiveIntensity = i === 3 && ak.level >= 1 ? 2.2 : 0.8;
    });
    cordPts[1].set(26.5, 2.3 - ak.pull * 0.45, 2.3);
    cordG.setFromPoints(cordPts);
    const w3 = workers[0];
    w3.root.position.set(ak.active ? 26.5 : X.PARTS + 1.4, 0, ak.active ? 2.8 : 1.7);
    w3.root.rotation.y = ak.active ? 0 : Math.PI / 2;
    w3.armR.rotation.x = 0;
    w3.armR.rotation.z = ak.active ? lerp(-2.6, -2.3, ak.pull) : 0;

    // timeline path (hook)
    const pk2 = K.path(t);
    path.visible = !close && pk2 > 0;
    const len = (X.GATE - X.PRESS) * pk2;
    path.scale.x = Math.max(0.01, len);
    path.position.set(X.PRESS + len / 2, 0.03, 2.6);

    // ---------- heroes (close shots) ----------
    if (!close) return;
    // body shop
    heroBIW.root.position.set(X.WELD, SKID_Y, 0);
    heroBIW.set({ mode: "biw", skid: true });
    heroBIW.skid.position.y = -0.12;
    // ED dip
    const ex = K.edX(t);
    heroED.root.position.set(ex, edY(ex), 0);
    heroED.set({ mode: ek.coated ? "body" : "biw", mat: "ed", skid: true, hanger: 4.5 });
    heroED.skid.position.y = -0.12;
    // paint + oven
    heroPaint.root.position.set(pk.carX, SKID_Y, 0);
    heroPaint.set({ mode: "body", mat: "sweep", sweep: pk.front, skid: true });
    heroPaint.skid.position.y = -0.12;
    // doors off
    const dk = K.doors(t);
    heroDoor.root.position.set(X.DOOR, SKID_Y, 0);
    heroDoor.set({ mode: "body", mat: "paint", skid: true, doors: dk > 0 ? 0 : 1, doorAway: dk });
    heroDoor.skid.position.y = -0.12;
    // marriage
    const mk = K.marry(t);
    heroMarry.root.position.set(X.MARRY, mk.bodyY, 0);
    heroMarry.set({ mode: "body", mat: "paint", doors: 0, hanger: 5.0 });
    agv.position.set(X.MARRY + mk.agvX, 0, 0);
    lift.position.y = mk.liftY;
    liftCol.scale.y = Math.max(0.05, mk.liftY - 0.3);
    liftCol.position.y = 0.3 + (mk.liftY - 0.3) / 2;
    // powertrain rides on the lift (separate rig copy on the AGV)
    heroMarry.powertrain.visible = true;
    heroMarry.powertrain.position.set(mk.agvX, mk.liftY + 0.04 - mk.bodyY - 0.3, 0);
    // parts
    const qk = K.parts(t);
    heroParts.root.position.set(X.PARTS, 0.02, 0);
    heroParts.set({ mode: "body", mat: "paint", doors: 0, wheels: true, powertrain: true, glass: false, interior: true });
    heroParts.wheels[3].visible = false; // front near wheel is being fitted (loose wheel)
    loose.position.set(X.PARTS + WB, WR + 0.02, lerp(1.9, 0.74, qk.wheel));
    loose.visible = true;
    poseArm(glassArm, tmp.set(X.PARTS + 0.55, lerp(2.6, 1.55, qk.glass), lerp(-1.4, 0, qk.glass)));
    glassArm.root.updateMatrixWorld(true);
    const gtip = new THREE.Vector3();
    glassArm.tip.getWorldPosition(gtip);
    windscreen.position.set(gtip.x, gtip.y - 0.05, gtip.z);
    windscreen.rotation.z = lerp(0, 0.93, qk.glass);
    workers[1].armR.rotation.z = -1.2 - Math.sin(t * 5) * 0.2;
    workers[1].armL.rotation.z = -1.1 + Math.sin(t * 5) * 0.2;
    binCart.position.set(X.PARTS + qk.cartX, 0, -2.6);
    // shower + roller
    heroShower.root.position.set(SX, 0.02, 0);
    heroShower.set({ mode: "body", mat: "paint", wheels: true, glass: true, interior: true });
    heroRoller.root.position.set(RX, 0.33, 0);
    heroRoller.set({ mode: "body", mat: "paint", wheels: true, glass: true, interior: true, spin: rk.spin });
  };

  /** What a car looks like at line position x (flow shots). */
  const flowState = (u: CarRig, x: number, t: number) => {
    void t;
    u.skid.position.y = -0.12;
    if (x < X.WELD - 2.5) {
      u.root.position.y = SKID_Y - 0.1;
      u.set({ mode: "panels", skid: true });
      return;
    }
    if (x < X.MARRY) {
      const y = edY(x);
      u.root.position.y = y;
      const inEd = x > ED0 - 2.2 && x < ED1 + 2.2;
      if (x < X.ED) u.set({ mode: "biw", skid: true, hanger: inEd ? 4.5 : 0 });
      else if (x < X.PAINT + 1) u.set({ mode: "body", mat: "ed", skid: true, hanger: inEd ? 4.5 : 0 });
      else if (x < X.DOOR) u.set({ mode: "body", mat: "paint", skid: true });
      else u.set({ mode: "body", mat: "paint", skid: true, doors: 0 });
      if (x > X.MARRY - 1.5) u.root.position.y = lerp(SKID_Y, 0.02, smooth(X.MARRY - 1.5, X.MARRY, x));
      return;
    }
    u.root.position.y = x > X.ROLLER - 1.5 && x < X.ROLLER + 1.5 ? 0.33 : 0.02;
    const done = x > X.PARTS + 2;
    u.set({ mode: "body", mat: "paint", wheels: true, powertrain: false, glass: done, interior: done, doors: done ? 1 : 0, spin: x / WR });
  };

  return { root, update, clamp, fg };
};
