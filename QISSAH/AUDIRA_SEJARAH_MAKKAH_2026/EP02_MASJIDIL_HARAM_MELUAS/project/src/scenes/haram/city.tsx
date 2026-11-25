// Houses that press against the courtyard and the modern city around it, one instanced mesh each.
// Each block knows which clearing removes it; it sinks into the plinth as the footprint edge passes.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { depthIn, inRect, type Rect } from "./parts.tsx";
import { FAHD, HILLS, MASA, OLD_ZONE, S1, S3, rectAt, FP } from "./layout.ts";
import type { WorldState } from "./state.ts";

type Block = { x: number; z: number; sx: number; sz: number; h: number; ry: number; zone: "old" | "s1" | "fahd" | "s3" | "city"; rank: number };

const nearHill = (x: number, z: number) => HILLS.some((h) => Math.hypot(x - h.x, z - h.z) < h.r + 0.5);

function makeBlocks() {
  const rnd = prng(20261110);
  const old: Block[] = [];
  const city: Block[] = [];
  const sq = 0.3;
  for (let x = OLD_ZONE.x0; x <= OLD_ZONE.x1; x += sq) {
    for (let z = OLD_ZONE.z0; z <= OLD_ZONE.z1; z += sq) {
      const jx = x + (rnd() - 0.5) * 0.06, jz = z + (rnd() - 0.5) * 0.06;
      const r = rnd();
      if (inRect(FP[0], jx, jz, 0.05)) continue; // the open courtyard
      if (Math.abs(jx - MASA.x) < 0.33 && jz > MASA.z0 - 0.2 && jz < MASA.z1 + 0.2) continue; // the sa'i street
      if (r < 0.1) continue; // lanes and yards
      const inS1 = inRect(S1, jx, jz);
      old.push({ x: jx, z: jz, sx: 0.19 + rnd() * 0.07, sz: 0.19 + rnd() * 0.07, h: 0.07 + Math.pow(rnd(), 1.6) * 0.15, ry: (rnd() - 0.5) * 0.25, zone: inS1 ? "s1" : inRect(FAHD, jx, jz, 0.1) ? "fahd" : "old", rank: rnd() });
    }
  }
  const step = 0.82;
  for (let gx = -34; gx <= 34; gx++) {
    for (let gz = -40; gz <= 26; gz++) {
      const x = gx * step + (rnd() - 0.5) * 0.12, z = gz * step + (rnd() - 0.5) * 0.12;
      const k = rnd();
      if (inRect(OLD_ZONE, x, z, 0.3) || nearHill(x, z)) continue;
      if (Math.abs(x + 1.0) < 0.35 || Math.abs(z - 8.2) < 0.4 || Math.abs(x - 11.5) < 0.4) continue; // avenues
      if (Math.abs(x) < 2.6 && z > 5.0 && z < 9.8) continue; // south forecourt with the museum plaque
      if (k < 0.08) continue;
      const d = Math.hypot(x, z + 3);
      const near = Math.max(0, 1 - d / 22);
      const h = 0.12 + Math.pow(rnd(), 2.2) * (0.5 + near * 1.6);
      const zone = inRect(S3, x, z, 0.3) ? "s3" : inRect(FAHD, x, z, 0.4) ? "fahd" : "city";
      city.push({ x, z, sx: 0.5 + rnd() * 0.22, sz: 0.5 + rnd() * 0.22, h, ry: 0, zone, rank: rnd() });
    }
  }
  return { old, city };
}

const BLOCKS = makeBlocks();

/** 0 = standing, 1 = gone. */
function cleared(b: Block, s: WorldState, R: Rect) {
  const byCourt = Math.min(1, Math.max(0, (depthIn(R, b.x, b.z) + 0.12) / 0.3));
  const wave = (p: number) => Math.min(1, Math.max(0, (p * 1.25 - b.rank) / 0.25));
  let k = byCourt;
  if (b.zone === "s1") k = Math.max(k, wave(s.s1Clear));
  if (b.zone === "fahd") k = Math.max(k, wave(s.fahdClear), wave(s.s1Clear) * (b.h < 0.25 ? 1 : 0));
  if (b.zone === "s3") k = Math.max(k, wave(s.s3Clear));
  if (b.zone === "old") k = Math.max(k, wave(s.s1Clear) * (inRect(OLD_ZONE, b.x, b.z, -0.4) ? 1 : 0));
  return k;
}

const BlockSet: React.FC<{ list: Block[]; mat: THREE.Material; s: WorldState }> = ({ list, mat, s }) => {
  const mesh = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, list.length);
    im.castShadow = true;
    im.receiveShadow = true;
    return im;
  }, [list, mat]);
  const R = rectAt(s.fp);
  useLayoutEffect(() => {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    list.forEach((b, i) => {
      const k = cleared(b, s, R);
      const h = b.h * (1 - k);
      if (h < 0.002) {
        m4.makeScale(0, 0, 0);
      } else {
        q.setFromEuler(e.set(0, b.ry, 0));
        m4.compose(new THREE.Vector3(b.x, h / 2, b.z), q, new THREE.Vector3(b.sx, h, b.sz));
      }
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <primitive object={mesh} />;
};

export const City: React.FC<{ s: WorldState; clay: THREE.Material; plaster: THREE.Material }> = ({ s, clay, plaster }) => (
  <>
    <BlockSet list={BLOCKS.old} mat={clay} s={s} />
    <BlockSet list={BLOCKS.city} mat={plaster} s={s} />
  </>
);

/** Contour-layer hills (laser-cut site model). */
export const Hills: React.FC<{ mat: THREE.Material }> = ({ mat }) => {
  const rings = useMemo(
    () =>
      HILLS.map((h) => {
        const rnd = prng(h.seed * 7919 + 1);
        return Array.from({ length: h.layers }, (_, i) => {
          const t = i / h.layers;
          return { rr: h.r * (1 - t * 0.85), dx: (rnd() - 0.5) * h.r * 0.18 * t, dz: (rnd() - 0.5) * h.r * 0.18 * t, rot: rnd() * Math.PI };
        });
      }),
    [],
  );
  return (
    <>
      {HILLS.map((h, j) => (
        <group key={h.seed} position={[h.x, 0, h.z]}>
          {rings[j].map((g, i) => (
            <mesh key={i} material={mat} position={[g.dx, 0.11 * i + 0.055, g.dz]} rotation={[0, g.rot, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[g.rr, g.rr, 0.11, 9]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};
