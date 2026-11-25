// EP038 secondary sets, placed far from the map so one canvas can host everything:
//  - SectionScene (at SECTION_O): soil cross-section block, deep well, clay compaction -> bowl.
//  - PhaseScene (at PHASE_O): ground slab that drops, two radar waves (pass 1 / pass 2).
// All animation comes from props computed per frame in Film.tsx.

import React, { useMemo } from "react";
import * as THREE from "three";
import { hash } from "./map";
import { PAL } from "./Cover";
import { Beam, Satellite, greyTex } from "./world";

export const SECTION_O = new THREE.Vector3(-40, 0, 0);
export const PHASE_O = new THREE.Vector3(40, 0, 0);

// ---------- soil cross-section ----------
const X0 = -2, X1 = 2, Z0 = -1, Z1 = 1;
const BOTTOM = -2.6;
export const WELL = { x: 0.35, z: 1.06 };
type Layer = { name: string; base: number; squeeze: number; color: string };
export const LAYERS: Layer[] = [
  { name: "akuiferDalam", base: 0.5, squeeze: 0.04, color: "#b6995c" },
  { name: "lempung2", base: 0.42, squeeze: 0.2, color: "#6c5440" },
  { name: "akuifer", base: 0.42, squeeze: 0.03, color: "#c2a46b" },
  { name: "lempungLunak", base: 1.0, squeeze: 0.34, color: "#8a6a4b" },
  { name: "tanahAtas", base: 0.1, squeeze: 0, color: "#7d868b" },
];
const bowl = (x: number, z: number) => Math.exp(-(((x - WELL.x) ** 2) / 1.8 + ((z - 0.7) ** 2) / 2.2));

/** Layer bottoms/tops at (x, z) for compaction c (0..1). */
export const column = (x: number, z: number, c: number) => {
  const b = bowl(x, z);
  let y = BOTTOM;
  return LAYERS.map((L) => {
    const th = L.base * (1 - L.squeeze * c * b);
    const lo = y;
    y += th;
    return { lo, hi: y };
  });
};
export const surfaceY = (x: number, z: number, c: number) => column(x, z, c)[LAYERS.length - 1].hi;

// Smooth layer body: front wall (z = Z1), left/right walls, and for the top layer the upper surface.
const SX = 160, SZ = 48;
const strataTex = () => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 512, 256);
  for (let k = 0; k < 900; k++) {
    const x = hash(k, 1) * 512, y = hash(k, 2) * 256;
    ctx.fillStyle = `rgba(${hash(k, 3) > 0.5 ? "255,255,255" : "0,0,0"},${0.06 + hash(k, 4) * 0.1})`;
    ctx.fillRect(x, y, 6 + hash(k, 5) * 30, 1 + hash(k, 6) * 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
let _strata: THREE.Texture | null = null;

const layerGeometry = (withTop: boolean) => {
  const g = new THREE.BufferGeometry();
  const nWall = (SX + 1) * 2 + (SZ + 1) * 2 * 2;
  const nTop = withTop ? (SX + 1) * (SZ + 1) : 0;
  const pos = new Float32Array((nWall + nTop) * 3);
  const uv = new Float32Array((nWall + nTop) * 2);
  const idx: number[] = [];
  let v = 0;
  const strip = (n: number) => {
    const base = v;
    for (let i = 0; i < n; i++) {
      const a = base + i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    v += (n + 1) * 2;
  };
  strip(SX); // front
  strip(SZ); // left
  strip(SZ); // right
  if (withTop) {
    const base = v;
    for (let j = 0; j < SZ; j++)
      for (let i = 0; i < SX; i++) {
        const a = base + j * (SX + 1) + i;
        idx.push(a, a + SX + 1, a + 1, a + 1, a + SX + 1, a + SX + 2);
      }
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
};

const fillLayer = (g: THREE.BufferGeometry, k: number, c: number, withTop: boolean) => {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  let v = 0;
  const put = (x: number, y: number, z: number, u: number, w: number) => {
    pos.setXYZ(v, x, y, z);
    uv.setXY(v, u, w);
    v++;
  };
  for (let i = 0; i <= SX; i++) {
    const x = X0 + (i / SX) * (X1 - X0);
    const s = column(x, Z1, c)[k];
    put(x, s.lo, Z1, x / 2, s.lo / 1.5);
    put(x, s.hi, Z1, x / 2, s.hi / 1.5);
  }
  for (const [xs, flip] of [[X0, true], [X1, false]] as [number, boolean][]) {
    for (let j = 0; j <= SZ; j++) {
      const z = flip ? Z0 + (j / SZ) * (Z1 - Z0) : Z1 - (j / SZ) * (Z1 - Z0);
      const s = column(xs, z, c)[k];
      put(xs, s.lo, z, z / 2, s.lo / 1.5);
      put(xs, s.hi, z, z / 2, s.hi / 1.5);
    }
  }
  if (withTop)
    for (let j = 0; j <= SZ; j++)
      for (let i = 0; i <= SX; i++) {
        const x = X0 + (i / SX) * (X1 - X0), z = Z0 + (j / SZ) * (Z1 - Z0);
        put(x, column(x, z, c)[k].hi, z, x / 2, z / 2);
      }
  pos.needsUpdate = true;
  uv.needsUpdate = true;
  g.computeVertexNormals();
};

const GX = 46, GY = 8;
export const SectionScene: React.FC<{ c: number; pump: number; t: number; water: number }> = ({ c, pump, t, water }) => {
  const strata = (_strata ??= strataTex());
  const geos = useMemo(() => LAYERS.map((_, k) => layerGeometry(k === LAYERS.length - 1)), []);
  geos.forEach((g, k) => fillLayer(g, k, c, k === LAYERS.length - 1));

  // clay grains and pore water on the front face (soft clay layer), instanced
  const { grainMesh, waterMesh } = useMemo(() => {
    const gm = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshStandardMaterial({ color: "#a88560", roughness: 0.8 }), GX * GY);
    const wm = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: "#58b4ff", toneMapped: false }), GX * GY);
    return { grainMesh: gm, waterMesh: wm };
  }, []);
  const M = new THREE.Matrix4();
  let n = 0;
  for (let i = 0; i < GX; i++) {
    const x = X0 + 0.08 + (i / (GX - 1)) * (X1 - X0 - 0.16);
    const seg = column(x, Z1, c)[3];
    const b = bowl(x, Z1);
    for (let j = 0; j < GY; j++) {
      const fy = (j + 0.5 + (hash(i, j) - 0.5) * 0.3) / GY;
      const y = seg.lo + fy * (seg.hi - seg.lo);
      M.makeScale(0.042, 0.03 * (1 - 0.25 * c * b), 0.02);
      M.setPosition(x + (hash(j, i) - 0.5) * 0.03, y, Z1 + 0.012);
      grainMesh.setMatrixAt(n, M);
      const sq = Math.max(0, 1 - c * b * 1.4) * water * (j < GY - 1 ? 1 : 0);
      M.makeScale(0.012 * sq + 1e-5, 0.012 * sq + 1e-5, 0.012 * sq + 1e-5);
      M.setPosition(x + 0.022, y + (seg.hi - seg.lo) / GY / 2, Z1 + 0.014);
      waterMesh.setMatrixAt(n, M);
      n++;
    }
  }
  grainMesh.instanceMatrix.needsUpdate = true;
  waterMesh.instanceMatrix.needsUpdate = true;
  const layerMeshes = geos.map((g, k) => (
    <mesh key={k} geometry={g} castShadow receiveShadow>
      <meshStandardMaterial color={LAYERS[k].color} map={strata} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  ));
  const grains = [<primitive key="gm" object={grainMesh} />, <primitive key="wm" object={waterMesh} />];

  // deep aquifer water flowing to the well, then up the pipe
  const aq = column(WELL.x, Z1, c)[0];
  const top = surfaceY(WELL.x, WELL.z - 0.06, c);
  const pipeLo = (aq.lo + aq.hi) / 2;
  const drops: React.ReactNode[] = [];
  if (pump > 0.01) {
    for (let k = 0; k < 26; k++) {
      const side = k % 2 ? 1 : -1;
      const u = (t * 0.55 + hash(k, 9)) % 1;
      const x = WELL.x + side * (1.9 - u * 1.85);
      const y = aq.lo + 0.1 + hash(k, 4) * (aq.hi - aq.lo - 0.2);
      drops.push(
        <mesh key={`a${k}`} position={[x, y, Z1 + 0.015]} scale={0.03 * pump}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#58b4ff" toneMapped={false} />
        </mesh>,
      );
    }
    for (let k = 0; k < 14; k++) {
      const u = (t * 0.7 + k / 14) % 1;
      drops.push(
        <mesh key={`p${k}`} position={[WELL.x, pipeLo + u * (top + 0.25 - pipeLo), WELL.z + 0.06]} scale={0.026 * pump}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#7cc6ff" toneMapped={false} />
        </mesh>,
      );
    }
  }

  // houses on top
  const houses: React.ReactNode[] = [];
  for (let k = 0; k < 22; k++) {
    const x = X0 + 0.2 + (k / 21) * (X1 - X0 - 0.4) + (hash(k, 1) - 0.5) * 0.08;
    if (Math.abs(x - WELL.x) < 0.18) continue;
    const z = 0.35 + hash(k, 2) * 0.5;
    const h = 0.12 + hash(k, 3) * 0.22;
    const w = 0.1 + hash(k, 4) * 0.06;
    const y = surfaceY(x, z, c);
    houses.push(
      <mesh key={`h${k}`} position={[x, y + h / 2, z]} castShadow>
        <boxGeometry args={[w, h, w * 1.2]} />
        <meshStandardMaterial color={hash(k, 5) > 0.5 ? "#c9cfd3" : "#aeb6bb"} roughness={0.7} />
      </mesh>,
    );
  }

  return (
    <group position={SECTION_O}>
      {layerMeshes}
      {grains}
      {drops}
      {houses}
      {/* well casing (cut-away in front of the face) + pump */}
      <mesh position={[WELL.x, (pipeLo + top + 0.2) / 2, WELL.z]}>
        <cylinderGeometry args={[0.05, 0.05, top + 0.2 - pipeLo, 16, 1, true]} />
        <meshStandardMaterial color="#cfd5d9" metalness={0.6} roughness={0.35} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[WELL.x, top + 0.3, WELL.z - 0.02]} castShadow>
        <boxGeometry args={[0.26, 0.2, 0.2]} />
        <meshStandardMaterial color="#2E70CE" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[WELL.x + 0.2, top + 0.34, WELL.z - 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 10]} />
        <meshStandardMaterial color="#cfd5d9" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* base plinth */}
      <mesh position={[0, BOTTOM - 0.06, 0]} receiveShadow>
        <boxGeometry args={[X1 - X0 + 0.3, 0.12, Z1 - Z0 + 0.3]} />
        <meshStandardMaterial color="#141c22" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ---------- phase scene ----------
const LAMBDA = 0.32;
const waveCurve = (S: THREE.Vector3, G: THREE.Vector3, amp: number, upto: number) => {
  const L = S.distanceTo(G);
  const dir = G.clone().sub(S).normalize();
  const n = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
  const pts: THREE.Vector3[] = [];
  const N = 220;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * upto;
    const d = u * L;
    pts.push(S.clone().addScaledVector(dir, d).addScaledVector(n, amp * Math.sin((d / LAMBDA) * Math.PI * 2)));
  }
  return { curve: new THREE.CatmullRomCurve3(pts), end: pts[pts.length - 1], L };
};

export const PHASE_SAT = new THREE.Vector3(1.0, 2.0, 0);
export const PHASE_HIT = new THREE.Vector3(-0.9, 0, 0);

export const PhaseScene: React.FC<{ drop: number; w1: number; w2: number; t: number }> = ({ drop, w1, w2, t }) => {
  const S = PHASE_SAT.clone().add(new THREE.Vector3(-0.12, -0.2, 0));
  const G1 = PHASE_HIT.clone().add(new THREE.Vector3(0, 0, -0.18));
  const G2 = PHASE_HIT.clone().add(new THREE.Vector3(0, -drop, 0.18));
  const S1 = S.clone().add(new THREE.Vector3(0, 0, -0.18));
  const S2 = S.clone().add(new THREE.Vector3(0, 0, 0.18));
  const a = w1 > 0 ? waveCurve(S1, G1, 0.07, w1) : null;
  const b = w2 > 0 ? waveCurve(S2, G2, 0.07, w2) : null;
  const houses = useMemo(
    () => Array.from({ length: 33 }, (_, k) => ({ x: -3.1 + (k % 11) * 0.55 + (hash(k, 1) - 0.5) * 0.15, z: 0.6 - Math.floor(k / 11) * 0.55, h: 0.14 + hash(k, 2) * 0.32, w: 0.16 + hash(k, 3) * 0.1 })),
    [],
  );
  const ground = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#8a949a", roughness: 0.75 }), 520);
    const M = new THREE.Matrix4();
    let n = 0;
    for (let k = 0; n < 520 && k < 4000; k++) {
      const x = (hash(k, 7) - 0.5) * 22, z = -1.3 - hash(k, 8) * 14;
      const h = 0.06 + Math.pow(hash(k, 9), 3) * 0.5;
      const w = 0.12 + hash(k, 10) * 0.16;
      M.makeScale(w, h, w);
      M.setPosition(x, -0.72 + h / 2, z);
      m.setMatrixAt(n++, M);
    }
    m.count = n;
    m.receiveShadow = true;
    return m;
  }, []);
  return (
    <group position={PHASE_O}>
      {/* surrounding city at the original level, receding to the horizon */}
      <mesh position={[0, -0.73, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial map={greyTex()} color="#9aa3a8" roughness={0.9} />
      </mesh>
      <primitive object={ground} />
      <Beam from={S} to={new THREE.Vector3(PHASE_HIT.x, -drop + 0.02, 0)} t={t} gain={0.75} hw={1.1} hd={0.8} />
      <group position={[0, -drop, 0]}>
        <mesh position={[-0.25, -0.36, 0]} receiveShadow castShadow>
          <boxGeometry args={[6.6, 0.72, 2.0]} />
          <meshStandardMaterial color="#5c666c" roughness={0.9} />
        </mesh>
        {houses.map((h, k) => (
          <mesh key={k} position={[h.x, h.h / 2, h.z]} castShadow>
            <boxGeometry args={[h.w, h.h, h.w * 1.2]} />
            <meshStandardMaterial color={k % 2 ? "#c9cfd3" : "#aeb6bb"} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* ghost of the original ground level */}
      {drop > 0.01 ? (
        <mesh position={[-0.25, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.6, 2.0]} />
          <meshBasicMaterial color={PAL.amber} transparent opacity={0.12} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      <Satellite pos={PHASE_SAT} yaw={Math.PI / 2 + 0.3} scale={0.4} />
      {a ? (
        <mesh>
          <tubeGeometry args={[a.curve, 400, 0.016, 6, false]} />
          <meshBasicMaterial color={PAL.amber} toneMapped={false} />
        </mesh>
      ) : null}
      {b ? (
        <mesh>
          <tubeGeometry args={[b.curve, 400, 0.016, 6, false]} />
          <meshBasicMaterial color="#5fd4ff" toneMapped={false} />
        </mesh>
      ) : null}
      {a && w1 >= 1 ? (
        <mesh position={a.end}>
          <sphereGeometry args={[0.045, 16, 10]} />
          <meshBasicMaterial color={PAL.amber} toneMapped={false} />
        </mesh>
      ) : null}
      {b && w2 >= 1 ? (
        <mesh position={b.end} scale={1 + Math.sin(t * 8) * 0.12}>
          <sphereGeometry args={[0.045, 16, 10]} />
          <meshBasicMaterial color="#5fd4ff" toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
