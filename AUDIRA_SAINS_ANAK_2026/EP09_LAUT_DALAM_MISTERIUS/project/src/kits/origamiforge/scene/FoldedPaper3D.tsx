// Renders a fold model at film time t: every piece is a paper slab (inside print on top, outside
// print underneath, a pale fibre edge), placed by its fold matrix. Crease marks appear on the
// sheet when their step starts; a dashed origami-diagram guide shows the next crease before it folds.

import React, { useMemo } from "react";
import * as THREE from "three";
import { creaseGeometry, pieceGeometry, pieceMatrix, type FoldModel } from "../core/fold.ts";
import { washiTextures } from "../lib/paper.ts";
import { WASHI, type Washi } from "../lib/palette.ts";

type Mats = { top: THREE.Material; bottom: THREE.Material; edge: THREE.Material; crease: THREE.Material };

const matCache = new Map<string, Mats>();
export function paperMaterials(kind: Washi, seed: number): Mats {
  const key = `${kind}:${seed}`;
  const hit = matCache.get(key);
  if (hit) return hit;
  const tex = washiTextures(kind, seed);
  const common = { roughness: 0.86, sheen: 0.45, sheenRoughness: 0.7, sheenColor: new THREE.Color("#fff6ea"), metalness: 0, bumpMap: tex.bump, bumpScale: 0.35 };
  const mats: Mats = {
    top: new THREE.MeshPhysicalMaterial({ ...common, map: tex.back }),
    bottom: new THREE.MeshPhysicalMaterial({ ...common, map: tex.face, roughness: 0.78 }),
    edge: new THREE.MeshPhysicalMaterial({ color: WASHI[kind].core, roughness: 0.9, sheen: 0.3, metalness: 0 }),
    crease: new THREE.MeshBasicMaterial({ color: "#2a1c12", transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }),
  };
  matCache.set(key, mats);
  return mats;
}

/** Geometry for every piece and crease mark of a model, built once. */
function useModelGeometry(model: FoldModel) {
  return useMemo(
    () =>
      model.pieces.map((p) => ({
        piece: p,
        geo: pieceGeometry(p, model.h, model.extent),
        creases: model.steps.map((_, k) => creaseGeometry(p, k, model.h)).map((g, k) => ({ g, k })).filter((c) => c.g) as { g: THREE.BufferGeometry; k: number }[],
      })),
    [model],
  );
}

export const FoldedPaper3D: React.FC<{
  model: FoldModel;
  t: number;
  kind: Washi;
  seed?: number;
  /** Show crease marks (from their step's start). */
  creases?: boolean;
  /** Show the dashed guide for steps up to this index (flat steps). -1 = none. */
  guidesUpTo?: number;
  castShadow?: boolean;
}> = ({ model, t, kind, seed = 1, creases = true, guidesUpTo = -1, castShadow = true }) => {
  const parts = useModelGeometry(model);
  const mats = paperMaterials(kind, seed);
  const arr = useMemo(() => [mats.top, mats.bottom, mats.edge], [mats]);
  return (
    <group>
      {parts.map(({ piece, geo, creases: cs }) => {
        const M = pieceMatrix(model, piece, t);
        return (
          <group key={piece.id} matrixAutoUpdate={false} matrix={M}>
            <mesh geometry={geo} material={arr} castShadow={castShadow} receiveShadow />
            {creases && cs.map(({ g, k }) => (t >= model.steps[k].spec.t0 + 0.12 ? <mesh key={k} geometry={g} material={mats.crease} /> : null))}
          </group>
        );
      })}
      {model.steps.map((s, k) => (k <= guidesUpTo && s.guide ? <Guide key={k} a={s.guide[0]} b={s.guide[1]} n={s.guideN} t={t} t0={s.spec.t0} mountain={s.spec.kind === "mountain"} /> : null))}
    </group>
  );
};

/** Origami-diagram dashed line (valley: dashes; mountain: dash-dot), drawn just before the fold. */
const Guide: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; n: THREE.Vector3; t: number; t0: number; mountain?: boolean }> = ({ a, b, n, t, t0, mountain }) => {
  const k = Math.min(1, Math.max(0, (t - (t0 - 0.55)) / 0.3)) * (1 - Math.min(1, Math.max(0, (t - (t0 + 0.12)) / 0.18)));
  const geo = useMemo(() => {
    const len = a.distanceTo(b);
    const dirv = b.clone().sub(a).normalize();
    const side = dirv.clone().cross(n).normalize().multiplyScalar(0.0016);
    const pos: number[] = [];
    const dash = 0.018, gap = 0.011;
    let s = 0, i = 0;
    while (s < len) {
      const l = mountain && i % 2 ? 0.004 : dash;
      const e = Math.min(len, s + l);
      const p0 = a.clone().addScaledVector(dirv, s), p1 = a.clone().addScaledVector(dirv, e);
      const q = [p0.clone().add(side), p1.clone().add(side), p1.clone().sub(side), p0.clone().sub(side)];
      for (const j of [0, 1, 2, 0, 2, 3]) pos.push(q[j].x, q[j].y, q[j].z);
      s = e + gap;
      i++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [a, b, n, mountain]);
  if (k <= 0) return null;
  // the dashes draw on from one end
  const reveal = Math.min(1, (t - (t0 - 0.55)) / 0.35);
  geo.setDrawRange(0, Math.ceil((geo.attributes.position.count / 6) * reveal) * 6);
  return (
    <mesh geometry={geo} renderOrder={5}>
      <meshBasicMaterial color="#1E3E6E" transparent opacity={0.85 * k} depthWrite={false} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  );
};
