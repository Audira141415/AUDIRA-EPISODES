// The folding studio: an ash table with a slate cutting mat, a fanned stack of washi sheets, a bone
// folder, finished cranes in other papers, strings of hanging cranes (senbazuru) against a warm
// paper backdrop, the hero sheet folding into a crane, and the AUDIRA tent card folding up.

import React, { useMemo } from "react";
import * as THREE from "three";
import { craneModel, FINISHED_T, THICK } from "../core/crane.ts";
import { pieceGeometry, pieceMatrix, type FoldModel } from "../core/fold.ts";
import { cardFold, craneFlight } from "../core/motion.ts";
import { cardTexture, cuttingMatTexture, rng, tableTexture, washiTextures } from "../lib/paper.ts";
import { WASHI, type Washi } from "../lib/palette.ts";
import { FoldedPaper3D, paperMaterials } from "./FoldedPaper3D.tsx";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish";

type V3 = [number, number, number];
const D = Math.PI / 180;

/** One merged geometry (3 material groups) of a model frozen at time t: cheap props. */
const bakeCache = new Map<string, THREE.BufferGeometry>();
function bakeModel(model: FoldModel, t: number, key: string): THREE.BufferGeometry {
  const hit = bakeCache.get(key);
  if (hit) return hit;
  const buckets: { pos: number[]; nor: number[]; uv: number[] }[] = [0, 1, 2].map(() => ({ pos: [], nor: [], uv: [] }));
  const nm = new THREE.Matrix3();
  const pv = new THREE.Vector3(), nv = new THREE.Vector3();
  for (const p of model.pieces) {
    const g = pieceGeometry(p, model.h, model.extent);
    const M = pieceMatrix(model, p, t);
    nm.getNormalMatrix(M);
    const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
    for (const grp of g.groups) {
      const b = buckets[grp.materialIndex ?? 0];
      for (let i = grp.start; i < grp.start + grp.count; i++) {
        pv.fromBufferAttribute(pa, i).applyMatrix4(M);
        nv.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
        b.pos.push(pv.x, pv.y, pv.z);
        b.nor.push(nv.x, nv.y, nv.z);
        b.uv.push(ua.getX(i), ua.getY(i));
      }
    }
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  let start = 0;
  buckets.forEach((b, i) => {
    pos.push(...b.pos);
    nor.push(...b.nor);
    uv.push(...b.uv);
    out.addGroup(start, b.pos.length / 3, i);
    start += b.pos.length / 3;
  });
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  bakeCache.set(key, out);
  return out;
}

const StaticCrane: React.FC<{ kind: Washi; seed?: number; position: V3; rotation?: V3; scale?: number; shadow?: boolean }> = ({ kind, seed = 2, position, rotation = [0, 0, 0], scale = 1, shadow = true }) => {
  const geo = bakeModel(craneModel(), FINISHED_T, "crane");
  const m = paperMaterials(kind, seed);
  const mats = useMemo(() => [m.top, m.bottom, m.edge], [m]);
  return <mesh geometry={geo} material={mats} position={position} rotation={rotation} scale={scale} castShadow={shadow} receiveShadow />;
};

/** Warm paper sweep behind the table, brighter behind the subject. */
const Backdrop: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(256, 300, 20, 256, 300, 360);
    gr.addColorStop(0, "#C9BCA8");
    gr.addColorStop(0.55, "#8E8273");
    gr.addColorStop(1, "#3E3933");
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.2, -1.9]}>
      <planeGeometry args={[7, 4.2]} />
      <meshPhysicalMaterial map={tex} {...POLISH.paper} />
    </mesh>
  );
};

const Table: React.FC = () => {
  const wood = useMemo(() => {
    const m = tableTexture().clone();
    m.repeat.set(1.4, 1);
    m.needsUpdate = true;
    return m;
  }, []);
  const mat = cuttingMatTexture();
  return (
    <group>
      <mesh position={[0, -0.04 - 0.004, -0.2]} receiveShadow>
        <RoundedBoxGeo args={[5, 0.08, 3.4]} />
        <meshPhysicalMaterial map={wood} roughness={0.55} clearcoat={0.25} clearcoatRoughness={0.45} />
      </mesh>
      <mesh position={[0.05, -0.002, -0.05]} receiveShadow>
        <RoundedBoxGeo args={[1.9, 0.004, 1.3]} />
        <meshPhysicalMaterial map={mat} roughness={0.72} clearcoat={0.15} clearcoatRoughness={0.4} />
      </mesh>
    </group>
  );
};

/** A fanned stack of square washi sheets, face print up. */
const SheetStack: React.FC<{ position: V3 }> = ({ position }) => {
  const kinds: Washi[] = ["sumi", "ai", "matcha", "kincha", "sakura", "shu"];
  return (
    <group position={position}>
      {kinds.map((k, i) => {
        const tex = washiTextures(k, 3 + i);
        return (
          <group key={k} position={[i * 0.012, 0.0025 + i * 0.0026, -i * 0.008]} rotation={[0, (i - 2) * 7 * D, 0]}>
            <mesh castShadow receiveShadow>
              <RoundedBoxGeo args={[0.34, 0.0022, 0.34]} />
              <meshPhysicalMaterial color={WASHI[k].core} {...POLISH.paper} />
            </mesh>
            <mesh position={[0, 0.00115, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[0.34, 0.34]} />
              <meshPhysicalMaterial map={tex.face} bumpMap={tex.bump} bumpScale={0.3} roughness={0.8} sheen={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Bone folder (tulang lipat): a long rounded cream slab with a pointed tip. */
const BoneFolder: React.FC<{ position: V3; yaw: number }> = ({ position, yaw }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const L = 0.3, W = 0.032;
    s.moveTo(-L / 2, -W / 2);
    s.lineTo(L / 2 - 0.04, -W / 2);
    s.quadraticCurveTo(L / 2, -W / 2, L / 2, 0);
    s.quadraticCurveTo(L / 2, W / 2, L / 2 - 0.04, W / 2);
    s.lineTo(-L / 2, W / 2);
    s.quadraticCurveTo(-L / 2 - 0.016, 0, -L / 2, -W / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 3, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={position} rotation={[0, yaw, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#EDE3CF" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.2} />
    </mesh>
  );
};

/** Strings of small cranes hanging against the backdrop, swaying a little. */
const Senbazuru: React.FC<{ t: number }> = ({ t }) => {
  const strings = useMemo(() => {
    const r = rng(17);
    const kinds: Washi[] = ["shu", "ai", "kincha", "sakura", "matcha", "sumi"];
    return [-1.05, -0.78, 0.82, 1.1].map((x, s) => ({
      x, z: -1.25 - s * 0.06 + (s % 2) * 0.12, top: 2.1, phase: r() * 6,
      cranes: Array.from({ length: 7 }, (_, i) => ({ kind: kinds[(i + s * 2) % kinds.length], yaw: (r() - 0.5) * 1.2, seed: 10 + i + s * 7 })),
    }));
  }, []);
  return (
    <group>
      {strings.map((s, si) => {
        const sway = Math.sin(t * 0.9 + s.phase) * 0.025;
        return (
          <group key={si} position={[s.x, s.top, s.z]} rotation={[0, 0, sway]}>
            <mesh position={[0, -0.75, 0]}>
              <cylinderGeometry args={[0.0012, 0.0012, 1.5, 4]} />
              <meshPhysicalMaterial color="#d8cbb5" {...POLISH.paper} />
            </mesh>
            {s.cranes.map((c, i) => (
              <StaticCrane key={i} kind={c.kind} seed={c.seed % 5} position={[0, -0.12 - i * 0.2, 0]} rotation={[0, c.yaw + Math.sin(t * 0.7 + i + si) * 0.25, 0]} scale={0.24} shadow={false} />
            ))}
          </group>
        );
      })}
    </group>
  );
};

/** Tent card that folds up from flat: AUDIRA printed on the front half. */
const TentCard: React.FC<{ t: number; position: V3; yaw: number }> = ({ t, position, yaw }) => {
  const k = cardFold(t);
  const phi = 62 * D * k;
  const W = 0.34, w = 0.13, th = 0.003;
  const tex = cardTexture();
  const back = washiTextures("kincha", 5);
  const half = (sgn: 1 | -1) => (
    <group position={[0, (w / 2) * Math.sin(phi) + th / 2, sgn * (w / 2) * Math.cos(phi)]} rotation={[sgn * phi, 0, 0]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[W, th, w]} />
        <meshPhysicalMaterial color={WASHI.kincha.core} {...POLISH.paper} />
      </mesh>
      <mesh position={[0, th / 2 + 0.0003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, w]} />
        {sgn > 0 ? (
          <meshPhysicalMaterial map={tex} bumpMap={back.bump} bumpScale={0.25} roughness={0.8} sheen={0.4} />
        ) : (
          <meshPhysicalMaterial map={back.back} bumpMap={back.bump} bumpScale={0.25} roughness={0.85} sheen={0.4} />
        )}
      </mesh>
    </group>
  );
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {half(1)}
      {half(-1)}
    </group>
  );
};

export const HERO_Y = THICK / 2 + 0.0006;
export const CARD = { pos: [0.5, 0, 0.36] as V3, yaw: -24 * D };

export const Studio3D: React.FC<{ t: number }> = ({ t }) => {
  const model = craneModel();
  const fl = craneFlight(t);
  return (
    <group>
      <Backdrop />
      <Table />
      <SheetStack position={[-0.72, 0, -0.5]} />
      <BoneFolder position={[0.66, 0.004, -0.12]} yaw={-62 * D} />
      <StaticCrane kind="ai" position={[-0.62, HERO_Y, 0.02]} rotation={[0, 0.7, 0]} scale={0.58} />
      <StaticCrane kind="kincha" position={[0.7, HERO_Y, -0.62]} rotation={[0, -0.5, 0]} scale={0.5} />
      <StaticCrane kind="matcha" position={[-0.25, HERO_Y, -0.9]} rotation={[0, 0.3, 0]} scale={0.42} />
      <Senbazuru t={t} />
      <TentCard t={t} position={CARD.pos} yaw={CARD.yaw} />
      <group position={[fl.pos[0], HERO_Y + fl.pos[1], fl.pos[2]]} rotation={[0, fl.yaw, -fl.pitch, "YXZ"]}>
        <group rotation={[fl.roll, 0, 0]}>
          <FoldedPaper3D model={model} t={t} kind="shu" seed={1} guidesUpTo={3} />
        </group>
      </group>
    </group>
  );
};
