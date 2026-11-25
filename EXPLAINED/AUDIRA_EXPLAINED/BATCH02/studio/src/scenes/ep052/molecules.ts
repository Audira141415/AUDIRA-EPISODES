// EP052 molecule builder: ball-and-stick geometry for a palm-oil triglyceride (POP-type: palmitic,
// oleic, palmitic on a glycerol backbone, joined by ester groups) and straight-chain alkanes.
// Scale: 1 world unit = 1 / 0.2727 Å (C–C 1.54 Å = 0.42). Hydrogens are placed from the
// heavy-atom geometry (tetrahedral for sp3, in-plane for sp2), so every carbon has its full valence.

import { Vector3 } from "three";

export type El = "C" | "H" | "O";
export type Atom = { p: Vector3; el: El; hCount: number };
export type Bond = { a: number; b: number; order: 1 | 2 };

const U = 0.42 / 1.54; // world units per ångström
export const LEN = {
  CC: 1.54 * U,
  CdC: 1.34 * U,
  CO: 1.43 * U, // glycerol C–O (ester alkoxy side)
  CeO: 1.34 * U, // acyl C–O (ester)
  CdO: 1.21 * U, // carbonyl C=O
  CH: 1.09 * U,
  OH: 0.96 * U,
  HH: 0.74 * U,
};

export class Mol {
  atoms: Atom[] = [];
  bonds: Bond[] = [];
  add(p: Vector3, el: El, hCount = 0) {
    this.atoms.push({ p: p.clone(), el, hCount });
    return this.atoms.length - 1;
  }
  bond(a: number, b: number, order: 1 | 2 = 1) {
    this.bonds.push({ a, b, order });
  }
  neighbours(i: number) {
    const out: number[] = [];
    for (const b of this.bonds) {
      if (b.a === i) out.push(b.b);
      else if (b.b === i) out.push(b.a);
    }
    return out;
  }
  /** Adds explicit hydrogens to every atom with hCount > 0, from its heavy-atom neighbours. */
  fillHydrogens(fallbackSide = new Vector3(0, 0, 1)) {
    const heavy = this.atoms.length;
    for (let i = 0; i < heavy; i++) {
      const at = this.atoms[i];
      if (at.hCount === 0) continue;
      const c = at.p;
      const dirs = this.neighbours(i).map((j) => this.atoms[j].p.clone().sub(c).normalize());
      const L = at.el === "O" ? LEN.OH : LEN.CH;
      const hs: Vector3[] = [];
      if (dirs.length === 1 && at.hCount === 3) {
        const axis = dirs[0].clone().negate();
        const ref = Math.abs(axis.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
        const p1 = new Vector3().crossVectors(axis, ref).normalize();
        const p2 = new Vector3().crossVectors(axis, p1).normalize();
        for (let k = 0; k < 3; k++) {
          const a = (k * 2 * Math.PI) / 3 + 0.5;
          hs.push(axis.clone().multiplyScalar(0.334).add(p1.clone().multiplyScalar(0.943 * Math.cos(a))).add(p2.clone().multiplyScalar(0.943 * Math.sin(a))));
        }
      } else if (dirs.length === 2 && at.hCount === 2) {
        const out = dirs[0].clone().add(dirs[1]).negate().normalize();
        let side = new Vector3().crossVectors(dirs[0], dirs[1]);
        if (side.lengthSq() < 1e-6) side = fallbackSide.clone();
        side.normalize();
        hs.push(out.clone().multiplyScalar(0.577).add(side.clone().multiplyScalar(0.816)));
        hs.push(out.clone().multiplyScalar(0.577).add(side.clone().multiplyScalar(-0.816)));
      } else {
        // one hydrogen opposite the sum of the existing bonds (sp2 CH, or tertiary sp3 CH)
        let out = dirs.reduce((s, d) => s.add(d), new Vector3()).negate();
        if (out.lengthSq() < 1e-4) out = fallbackSide.clone();
        hs.push(out.normalize());
      }
      for (const d of hs) {
        const h = this.add(c.clone().add(d.multiplyScalar(L)), "H");
        this.bond(i, h);
      }
    }
    return this;
  }
}

/**
 * Zigzag (all-trans) carbon chain. Bond j runs along `u` with a ±perpendicular offset `n`
 * (C–C–C ≈ 111°). `kinkAt` (bond index) rotates the chain axis after a cis double bond.
 */
const zigzag = (start: Vector3, u: Vector3, n: Vector3, bondLens: number[], kinkAt = -1, kinkAxis?: Vector3, kinkAngle = 0, parity = 1) => {
  const pts: Vector3[] = [];
  let p = start.clone();
  let uu = u.clone();
  let nn = n.clone();
  const half = (55.5 * Math.PI) / 180;
  for (let j = 0; j < bondLens.length; j++) {
    if (j === kinkAt && kinkAxis) {
      uu = uu.clone().applyAxisAngle(kinkAxis, kinkAngle);
      nn = nn.clone().applyAxisAngle(kinkAxis, kinkAngle);
    }
    const L = bondLens[j];
    const s = (j % 2 === 0 ? 1 : -1) * parity;
    p = p.clone().add(uu.clone().multiplyScalar(L * Math.sin(half))).add(nn.clone().multiplyScalar(s * L * Math.cos(half)));
    pts.push(p);
  }
  return pts;
};

/**
 * One acyl arm: glycerol carbon → ester O → carbonyl C(=O) → fatty chain of `carbons` carbons
 * (carbonyl carbon is C1). `doubleAt` = n puts a cis C(n)=C(n+1) double bond (oleic: 9).
 */
const acylArm = (m: Mol, g: number, fan: Vector3, carbons: number, opts: { doubleAt?: number; kinkAxis?: Vector3; kinkAngle?: number; parity?: number }) => {
  const gp = m.atoms[g].p;
  const fanN = new Vector3().crossVectors(new Vector3(0, 0, 1), fan).normalize();
  const oe = m.add(gp.clone().add(fan.clone().add(fanN.clone().multiplyScalar(0.35)).normalize().multiplyScalar(LEN.CO)), "O");
  m.bond(g, oe);
  const c1p = m.atoms[oe].p.clone().add(fan.clone().add(fanN.clone().multiplyScalar(-0.35)).normalize().multiplyScalar(LEN.CeO));
  const c1 = m.add(c1p, "C");
  m.bond(oe, c1);
  // chain C2..Cn along +x, zigzag in the xy plane
  const lens: number[] = [];
  for (let k = 2; k <= carbons; k++) lens.push(opts.doubleAt && k === opts.doubleAt + 1 ? LEN.CdC : LEN.CC);
  const kinkBond = opts.doubleAt ? opts.doubleAt : -1; // bond index (0-based) of C(n+1)→C(n+2)
  const pts = zigzag(c1p, new Vector3(1, 0, 0), new Vector3(0, 1, 0), lens, kinkBond, opts.kinkAxis, opts.kinkAngle ?? 0, opts.parity ?? 1);
  let prev = c1;
  const ids: number[] = [c1];
  pts.forEach((p, idx) => {
    const k = idx + 2; // carbon number
    const isTerminal = k === carbons;
    const isSp2 = opts.doubleAt !== undefined && (k === opts.doubleAt || k === opts.doubleAt + 1);
    const id = m.add(p, "C", isTerminal ? 3 : isSp2 ? 1 : 2);
    m.bond(prev, id, opts.doubleAt !== undefined && k === opts.doubleAt + 1 ? 2 : 1);
    ids.push(id);
    prev = id;
  });
  // carbonyl oxygen, in the plane of O–C1–C2, opposite their bisector
  const a = m.atoms[oe].p.clone().sub(c1p).normalize();
  const b = m.atoms[ids[1]].p.clone().sub(c1p).normalize();
  const od = a.add(b).negate().normalize();
  const oc = m.add(c1p.clone().add(od.multiplyScalar(LEN.CdO)), "O");
  m.bond(c1, oc, 2);
  return { oe, c1, oc, tail: ids[ids.length - 1] };
};

/** Palm-oil triglyceride: sn-1 palmitic (C16:0), sn-2 oleic (C18:1 cis-9), sn-3 palmitic (C16:0). */
export const buildTriglyceride = () => {
  const m = new Mol();
  const g2 = m.add(new Vector3(0, 0, 0), "C", 1);
  const g1 = m.add(new Vector3(-0.238, 0.346, 0.05), "C", 2);
  const g3 = m.add(new Vector3(-0.238, -0.346, -0.05), "C", 2);
  m.bond(g1, g2);
  m.bond(g2, g3);
  acylArm(m, g1, new Vector3(0.42, 0.86, 0.28).normalize(), 16, { parity: 1 });
  acylArm(m, g2, new Vector3(0.88, 0.05, -0.47).normalize(), 18, { doubleAt: 9, kinkAxis: new Vector3(0.2, 1, 0.1).normalize(), kinkAngle: -0.62, parity: -1 });
  acylArm(m, g3, new Vector3(0.42, -0.86, 0.2).normalize(), 16, { parity: -1 });
  return m.fillHydrogens(new Vector3(0, 0, 1));
};

/** Straight-chain alkane CnH(2n+2). */
export const buildAlkane = (n: number) => {
  const m = new Mol();
  const lens = Array.from({ length: n - 1 }, () => LEN.CC);
  const start = new Vector3(0, 0, 0);
  let prev = m.add(start, "C", 3);
  zigzag(start, new Vector3(1, 0, 0), new Vector3(0, 1, 0), lens).forEach((p, i) => {
    const id = m.add(p, "C", i === n - 2 ? 3 : 2);
    m.bond(prev, id);
    prev = id;
  });
  return m.fillHydrogens(new Vector3(0, 0, 1));
};

/** Water (bent, 104.5°). */
export const buildWater = () => {
  const m = new Mol();
  const o = m.add(new Vector3(0, 0, 0), "O");
  const half = (104.5 / 2) * (Math.PI / 180);
  const h1 = m.add(new Vector3(Math.sin(half), -Math.cos(half), 0).multiplyScalar(LEN.OH), "H");
  const h2 = m.add(new Vector3(-Math.sin(half), -Math.cos(half), 0).multiplyScalar(LEN.OH), "H");
  m.bond(o, h1);
  m.bond(o, h2);
  return m;
};

/** Hydrogen gas H2. */
export const buildH2 = () => {
  const m = new Mol();
  const a = m.add(new Vector3(-LEN.HH / 2, 0, 0), "H");
  const b = m.add(new Vector3(LEN.HH / 2, 0, 0), "H");
  m.bond(a, b);
  return m;
};

/** Formula check (used in QA notes): counts atoms by element. */
export const formula = (m: Mol) => {
  const c = { C: 0, H: 0, O: 0 };
  for (const a of m.atoms) c[a.el]++;
  return c;
};

/** Iso-alkane: straight CnH(2n+2) with one H on carbon `at` replaced by a methyl group (isomerisation). */
export const buildBranched = (n: number, at: number) => {
  const m = buildAlkane(n);
  // first hydrogen bonded to carbon `at`
  const bond = m.bonds.find((b) => (b.a === at && m.atoms[b.b].el === "H") || (b.b === at && m.atoms[b.a].el === "H"));
  if (!bond) return m;
  const h = bond.a === at ? bond.b : bond.a;
  const c = m.atoms[at].p;
  const dir = m.atoms[h].p.clone().sub(c).normalize();
  m.atoms[h] = { p: c.clone().add(dir.multiplyScalar(LEN.CC)), el: "C", hCount: 0 };
  // CH3 hydrogens on the new methyl carbon
  const axis = m.atoms[h].p.clone().sub(c).normalize();
  const ref = Math.abs(axis.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
  const p1 = new Vector3().crossVectors(axis, ref).normalize();
  const p2 = new Vector3().crossVectors(axis, p1).normalize();
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + 0.3;
    const d = axis.clone().multiplyScalar(0.334).add(p1.clone().multiplyScalar(0.943 * Math.cos(a))).add(p2.clone().multiplyScalar(0.943 * Math.sin(a)));
    const id = m.add(m.atoms[h].p.clone().add(d.multiplyScalar(LEN.CH)), "H");
    m.bond(h, id);
  }
  return m;
};
