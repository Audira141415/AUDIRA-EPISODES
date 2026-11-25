// Rigid fold engine. A sheet is a set of flat convex panels (pieces) with real thickness. Each fold
// step cuts the selected pieces along a crease plane, and the pieces on the moving side rotate as
// rigid bodies about the crease line. Steps are authored against the "reference" state (every
// earlier step at its target angle), so creases can be placed from where the paper really is.
// At film time t a piece's world matrix is the product of its steps' rotations at their angles(t).
//
//   const model = buildFold(diamond(0.5), [stepA, stepB, ...], 0.004);
//   const M = pieceMatrix(model, piece, t);   // pure function of t
//
// Stacking: a 180° fold lands the moving layers on top of (or under) the stack: the hinge is
// lifted along the stack normal so layers never intersect, exactly like folded paper.

import * as THREE from "three";

export type V3 = [number, number, number];

export type Crease = { a: THREE.Vector3; b: THREE.Vector3; step: number };
export type Piece = {
  id: number;
  /** Convex polygon in sheet coordinates (the flat sheet lies in y = 0). */
  poly: THREE.Vector3[];
  /** Indices of the steps that rotate this piece, in order. */
  moves: number[];
  /** Crease marks lying on this piece (sheet coordinates). */
  creases: Crease[];
  /** World matrix in the reference state. */
  ref: THREE.Matrix4;
};

export type StepSpec = {
  name: string;
  /** Pieces that take part in this step (default: all). */
  select?: (p: Piece) => boolean;
  /** Crease plane through `p` with normal `m`: selected pieces are cut; the `m` side moves. Omit to move every selected piece. */
  plane?: { p: V3; m: V3 };
  /** Rotation axis through `p`; direction defaults to m × n (positive angle lifts the moving side toward n). */
  line?: { p: V3; d?: V3 };
  /** Stack normal (default +y, the table up). */
  n?: V3;
  /** Target angle in radians used for the reference state. */
  angle: number;
  /** Hinge height: "stack" lands the moving layers on top/under the rest, "mid" the stack middle, "line" exactly at line.p. */
  pivot?: "stack" | "mid" | "line";
  /** Pieces the "stack" pivot stacks against (default: every piece that does not move). */
  stackOver?: (p: Piece) => boolean;
  /** Angle at film time t (radians). */
  at: (t: number) => number;
  /** Second the step starts (crease marks and the dashed guide key off it). */
  t0: number;
  kind?: "valley" | "mountain" | "reverse" | "turn" | "open";
};

export type BuiltStep = {
  spec: StepSpec;
  axisP: THREE.Vector3;
  axisD: THREE.Vector3;
  /** Dashed guide over the crease in the reference state (world), or null. */
  guide: [THREE.Vector3, THREE.Vector3] | null;
  /** Normal to offset the guide along (stack up). */
  guideN: THREE.Vector3;
};

export type FoldModel = { pieces: Piece[]; steps: BuiltStep[]; h: number; extent: number };
export type StepDef = (model: FoldModel) => StepSpec | StepSpec[];

const EPS = 1e-6;
const v = (a: V3) => new THREE.Vector3(...a);

/** Square sheet of side `side`, turned 45° so its diagonal runs along x (a diamond). */
export function diamond(side: number): THREE.Vector3[] {
  const R = side / Math.SQRT2;
  return [v([-R, 0, 0]), v([0, 0, R]), v([R, 0, 0]), v([0, 0, -R])];
}
export function rect(w: number, d: number): THREE.Vector3[] {
  return [v([-w / 2, 0, -d / 2]), v([-w / 2, 0, d / 2]), v([w / 2, 0, d / 2]), v([w / 2, 0, -d / 2])];
}

const toWorld = (p: Piece, q: THREE.Vector3) => q.clone().applyMatrix4(p.ref);
/** World normal of a piece (its sheet +y). */
export const pieceNormal = (p: Piece) => new THREE.Vector3(0, 1, 0).transformDirection(p.ref);
/** Centroid in sheet coordinates. */
export const centroid = (p: Piece) => p.poly.reduce((s, q) => s.add(q), new THREE.Vector3()).multiplyScalar(1 / p.poly.length);
/** Centroid in reference world coordinates. */
export const worldCentroid = (p: Piece) => toWorld(p, centroid(p));

/** Min/max of a piece's slab (both faces) along direction n, reference state. */
export function extent(p: Piece, n: THREE.Vector3, h: number): [number, number] {
  const nn = pieceNormal(p).multiplyScalar(h / 2);
  let lo = Infinity, hi = -Infinity;
  for (const q of p.poly) {
    const w = toWorld(p, q);
    for (const s of [1, -1]) {
      const d = w.clone().addScaledVector(nn, s).dot(n);
      lo = Math.min(lo, d);
      hi = Math.max(hi, d);
    }
  }
  return [lo, hi];
}

const rotation = (p: THREE.Vector3, d: THREE.Vector3, angle: number) =>
  new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)
    .multiply(new THREE.Matrix4().makeRotationAxis(d, angle))
    .multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z));

/** Cut a convex polygon (sheet coords) by signed distances; returns [negative, positive, cut points]. */
function clip(poly: THREE.Vector3[], d: number[]) {
  const neg: THREE.Vector3[] = [], pos: THREE.Vector3[] = [], cut: THREE.Vector3[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = d[i], db = d[(i + 1) % poly.length];
    if (da <= EPS) neg.push(a.clone());
    if (da >= -EPS) pos.push(a.clone());
    if (Math.abs(da) <= EPS) cut.push(a.clone());
    if ((da < -EPS && db > EPS) || (da > EPS && db < -EPS)) {
      const k = da / (da - db);
      const x = a.clone().lerp(b, k);
      neg.push(x.clone());
      pos.push(x.clone());
      cut.push(x);
    }
  }
  return { neg, pos, cut };
}
const area = (poly: THREE.Vector3[]) => {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    s += a.x * b.z - b.x * a.z;
  }
  return Math.abs(s) / 2;
};

/** Build the fold model: cut and move pieces step by step in the reference state. */
export function buildFold(sheet: THREE.Vector3[], defs: StepDef[], h: number): FoldModel {
  let ext = 0;
  for (const q of sheet) ext = Math.max(ext, Math.abs(q.x), Math.abs(q.z));
  const model: FoldModel = { pieces: [{ id: 0, poly: sheet.map((q) => q.clone()), moves: [], creases: [], ref: new THREE.Matrix4() }], steps: [], h, extent: ext };
  let nextId = 1;
  for (const def of defs) {
    const specs = def(model);
    for (const spec of Array.isArray(specs) ? specs : [specs]) {
      const k = model.steps.length;
      const n = v(spec.n ?? [0, 1, 0]).normalize();
      const sel = model.pieces.filter((p) => (spec.select ? spec.select(p) : true));
      const moving = new Set<Piece>();
      const cutPts: THREE.Vector3[] = [];
      let m: THREE.Vector3 | null = null;
      if (spec.plane) {
        m = v(spec.plane.m).normalize();
        const p0 = v(spec.plane.p);
        for (const p of sel) {
          const d = p.poly.map((q) => toWorld(p, q).sub(p0).dot(m!));
          const { neg, pos, cut } = clip(p.poly, d);
          const negOk = neg.length >= 3 && area(neg) > 1e-9, posOk = pos.length >= 3 && area(pos) > 1e-9;
          if (posOk && !negOk) moving.add(p);
          else if (posOk && negOk) {
            const np: Piece = { id: nextId++, poly: pos, moves: [...p.moves], creases: [], ref: p.ref.clone() };
            // keep old crease marks on whichever half holds them
            const keep: Crease[] = [];
            for (const c of p.creases) {
              const mid = toWorld(p, c.a.clone().add(c.b).multiplyScalar(0.5)).sub(p0).dot(m);
              (mid > 0 ? np.creases : keep).push(c);
            }
            p.poly = neg;
            p.creases = keep;
            if (cut.length >= 2) p.creases.push({ a: cut[0].clone(), b: cut[cut.length - 1].clone(), step: k });
            model.pieces.push(np);
            moving.add(np);
          }
          for (const c of cut) cutPts.push(toWorld(p, c));
        }
      } else for (const p of sel) moving.add(p);

      // hinge line
      const lp = v(spec.line?.p ?? spec.plane?.p ?? [0, 0, 0]);
      const d = spec.line?.d ? v(spec.line.d).normalize() : m ? m.clone().cross(n).normalize() : new THREE.Vector3(1, 0, 0);
      const pivot = spec.pivot ?? "stack";
      let a = lp.dot(n);
      if (pivot === "mid") {
        let lo = Infinity, hi = -Infinity;
        for (const p of model.pieces) {
          const [l, u] = extent(p, n, h);
          lo = Math.min(lo, l);
          hi = Math.max(hi, u);
        }
        a = (lo + hi) / 2;
      } else if (pivot === "stack") {
        const still = model.pieces.filter((p) => !moving.has(p) && (spec.stackOver ? spec.stackOver(p) : true));
        const up = spec.angle >= 0;
        let mv = up ? -Infinity : Infinity;
        for (const p of moving) {
          const [l, u] = extent(p, n, h);
          mv = up ? Math.max(mv, u) : Math.min(mv, l);
        }
        let st = mv;
        for (const p of still) {
          const [l, u] = extent(p, n, h);
          st = up ? Math.max(st, u) : Math.min(st, l);
        }
        a = (st + mv) / 2 + (up ? 1 : -1) * h * 0.08;
      }
      const axisP = lp.clone().addScaledVector(n, a - lp.dot(n));
      let topN = -Infinity;
      for (const p of sel) topN = Math.max(topN, extent(p, n, h)[1]);
      const R = rotation(axisP, d, spec.angle);
      for (const p of moving) {
        p.ref = R.clone().multiply(p.ref);
        p.moves.push(k);
      }

      // dashed guide across the top of the stack, before the fold happens
      let guide: [THREE.Vector3, THREE.Vector3] | null = null;
      if (cutPts.length >= 2) {
        let best = 0, ga = cutPts[0], gb = cutPts[1];
        for (let i = 0; i < cutPts.length; i++)
          for (let j = i + 1; j < cutPts.length; j++) {
            const dd = cutPts[i].distanceTo(cutPts[j]);
            if (dd > best) { best = dd; ga = cutPts[i]; gb = cutPts[j]; }
          }
        guide = [ga, gb].map((q) => q.clone().addScaledVector(n, topN - q.dot(n) + 0.0008)) as [THREE.Vector3, THREE.Vector3];
      }
      model.steps.push({ spec, axisP, axisD: d, guide, guideN: n });
    }
  }
  return model;
}

/** World matrix of a piece at film time t (pure). */
export function pieceMatrix(model: FoldModel, p: Piece, t: number, out = new THREE.Matrix4()): THREE.Matrix4 {
  out.identity();
  for (const k of p.moves) {
    const s = model.steps[k];
    out.premultiply(rotation(s.axisP, s.axisD, s.spec.at(t)));
  }
  return out;
}

/**
 * Slab geometry for one piece: groups 0 = top face (sheet +y, the inside/back print),
 * 1 = bottom face (sheet -y, the outside/face print), 2 = cut edge. UVs come from sheet coords, so
 * the print runs continuously across every crease.
 */
export function pieceGeometry(p: Piece, h: number, extent: number): THREE.BufferGeometry {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  const U = (q: THREE.Vector3) => [q.x / (2 * extent) + 0.5, q.z / (2 * extent) + 0.5];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, n: THREE.Vector3, uvs: number[][]) => {
    // wind so the face points along n
    const cr = b.clone().sub(a).cross(c.clone().sub(a));
    const flip = cr.dot(n) < 0;
    const vs = flip ? [a, c, b] : [a, b, c];
    const us = flip ? [uvs[0], uvs[2], uvs[1]] : uvs;
    vs.forEach((q, i) => {
      pos.push(q.x, q.y, q.z);
      nor.push(n.x, n.y, n.z);
      uv.push(us[i][0], us[i][1]);
    });
  };
  const top = p.poly.map((q) => new THREE.Vector3(q.x, h / 2, q.z));
  const bot = p.poly.map((q) => new THREE.Vector3(q.x, -h / 2, q.z));
  const up = new THREE.Vector3(0, 1, 0), dn = new THREE.Vector3(0, -1, 0);
  const g = new THREE.BufferGeometry();
  for (let i = 1; i < p.poly.length - 1; i++) tri(top[0], top[i], top[i + 1], up, [U(p.poly[0]), U(p.poly[i]), U(p.poly[i + 1])]);
  const nTop = pos.length / 3;
  for (let i = 1; i < p.poly.length - 1; i++) tri(bot[0], bot[i], bot[i + 1], dn, [U(p.poly[0]), U(p.poly[i]), U(p.poly[i + 1])]);
  const nBot = pos.length / 3 - nTop;
  const c = centroid(p);
  for (let i = 0; i < p.poly.length; i++) {
    const j = (i + 1) % p.poly.length;
    const e = p.poly[j].clone().sub(p.poly[i]);
    if (e.length() < 1e-7) continue;
    const out = new THREE.Vector3(e.z, 0, -e.x).normalize();
    if (out.dot(p.poly[i].clone().sub(c)) < 0) out.negate();
    const ui = U(p.poly[i]), uj = U(p.poly[j]);
    tri(top[i], top[j], bot[j], out, [ui, uj, uj]);
    tri(top[i], bot[j], bot[i], out, [ui, uj, ui]);
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.addGroup(0, nTop, 0);
  g.addGroup(nTop, nBot, 1);
  g.addGroup(nTop + nBot, pos.length / 3 - nTop - nBot, 2);
  return g;
}

/** Thin strips along the crease marks of one step, on both faces of a piece. */
export function creaseGeometry(p: Piece, step: number, h: number, width = 0.0022): THREE.BufferGeometry | null {
  const cs = p.creases.filter((c) => c.step === step);
  if (!cs.length) return null;
  const pos: number[] = [], nor: number[] = [];
  for (const c of cs) {
    const e = c.b.clone().sub(c.a).normalize();
    const side = new THREE.Vector3(e.z, 0, -e.x).multiplyScalar(width / 2);
    for (const s of [1, -1]) {
      const y = s * (h / 2 + 0.00035);
      const q = [c.a.clone().add(side), c.b.clone().add(side), c.b.clone().sub(side), c.a.clone().sub(side)].map((q) => new THREE.Vector3(q.x, y, q.z));
      const idx = s > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
      const cr = q[1].clone().sub(q[0]).cross(q[2].clone().sub(q[0]));
      const flip = (cr.y > 0 ? 1 : -1) !== s;
      const order = flip ? [idx[0], idx[2], idx[1], idx[3], idx[5], idx[4]] : idx;
      for (const i of order) {
        pos.push(q[i].x, q[i].y, q[i].z);
        nor.push(0, s, 0);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
