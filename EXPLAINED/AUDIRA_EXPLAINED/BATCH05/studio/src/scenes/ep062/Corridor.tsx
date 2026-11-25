// AE-062 film — close-up "detail board": the vomitory tunnel at 1 unit = 1 m.
// Stand steps -> landing (wide, 1 m² grid) -> LORONG 1.5 m (narrowest, red) -> plaza -> GERBANG 3 m.
// Crowd = deterministic queue model, pure function of t (no Math.random, no state):
//   arrivals A_k = T_ARR + k / ARR_RATE (walk down the stand steps into the landing queue),
//   E(t) = tokens that have entered the lorong = integral of rate(t); rate drops when the queue
//   gets dense ("terlalu padat justru makin lambat"); queue slots shrink from ~3 to ~6 per m².
import React, { useMemo } from "react";
import * as THREE from "three";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { prng, smooth } from "../../kits/tacticboard/core/motion";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

export const C = {
  land: { x0: -6, x1: -2.1, hw: 2.5 },
  lor: { x0: -2.1, x1: 2, hw: 0.75 },
  plaza: { x0: 2, x1: 5, hw: 2.5 },
  gate: { x: 5, hw: 1.5 },
  floorY: 0.04,
  wallH: 0.45,
} as const;

export type FlowTimes = { arr: number; enter: number; slow0: number; slow1: number };

const ARR_RATE = 4.5; // tokens / s walking down into the landing
const R_FAST = 3.0; // lorong throughput before the crush (tokens / s)
const R_SLOW = 1.4; // throughput once the landing is packed
export const N_TOK = 110;
const TOK_R = 0.17;
const TOK_H = 0.12;

const stepTop = (x: number) => (x >= C.land.x0 ? C.floorY : C.floorY + 0.2 * Math.min(4, Math.ceil((C.land.x0 - x) / 0.5 - 1e-6)));

/** Tokens that have entered the lorong by time t. */
const entered = (t: number, ft: FlowTimes) => {
  if (t <= ft.enter) return 0;
  const a = Math.min(t, ft.slow0) - ft.enter;
  let e = R_FAST * a;
  if (t > ft.slow0) {
    const span = ft.slow1 - ft.slow0;
    const b = Math.min(t, ft.slow1) - ft.slow0;
    const k = (R_FAST - R_SLOW) / span;
    e += R_FAST * b - 0.5 * k * b * b;
  }
  if (t > ft.slow1) e += R_SLOW * (t - ft.slow1);
  return e;
};
export const flowRate = (t: number, ft: FlowTimes) =>
  t < ft.slow0 ? R_FAST : t > ft.slow1 ? R_SLOW : R_FAST - ((R_FAST - R_SLOW) * (t - ft.slow0)) / (ft.slow1 - ft.slow0);
/** Queue lattice pitch (m): ~3/m² -> ~6/m² while the payoff squeezes the crowd. */
export const pitch = (t: number, ft: FlowTimes) => 0.62 - 0.18 * smooth((t - ft.slow0) / (ft.slow1 - ft.slow0));
export const densityOf = (s: number) => 2 / (Math.sqrt(3) * s * s);

// half-disc hex lattice in front of the lorong mouth, unit pitch, sorted nearest-first
const LATTICE = (() => {
  // serpentine order (ring by ring, alternating sweep) so consecutive slots are neighbours:
  // a token advancing from slot i+1 to i never cuts across the crowd
  const pts: { x: number; z: number; d: number; a: number }[] = [];
  for (let r = 0; r < 14; r++) {
    for (let c = -14; c <= 14; c++) {
      const x = -0.55 - r * 0.866;
      const z = c + (r % 2 ? 0.5 : 0);
      pts.push({ x, z, d: Math.hypot(x * 1.05, z), a: Math.atan2(z, -x) });
    }
  }
  const ring = (p: { d: number }) => Math.round(p.d / 0.95);
  return pts.sort((p, q) => ring(p) - ring(q) || (ring(p) % 2 ? q.a - p.a : p.a - q.a));
})();
const MOUTH = { x: C.lor.x0, z: 0 };

type Tok = { x: number; y: number; z: number; s: number };
export const tokenPositions = (t: number, ft: FlowTimes): Tok[] => {
  const E = entered(t, ft);
  const s = pitch(t, ft);
  const out: Tok[] = [];
  for (let k = 0; k < N_TOK; k++) {
    const r = prng(7000 + k * 13);
    const jx = (r() - 0.5) * 0.04;
    const jz = (r() - 0.5) * 0.04;
    const spawnZ = (r() - 0.5) * 1.6;
    const lane = k % 2 ? 0.34 : -0.34;
    const plazaZ = (r() - 0.5) * 2.4;
    const A = ft.arr + k / ARR_RATE;
    const walk = 2.6;
    const slot = (q: number) => {
      const i = Math.max(0, Math.floor(q));
      const f = q - i;
      const a = LATTICE[Math.min(i, LATTICE.length - 1)];
      const b = LATTICE[Math.min(i + 1, LATTICE.length - 1)];
      const x = MOUTH.x + (a.x + (b.x - a.x) * f) * s + jx;
      const z = MOUTH.z + (a.z + (b.z - a.z) * f) * s + jz;
      return { x: Math.max(C.land.x0 + 0.25, x), z: Math.max(-C.land.hw + 0.25, Math.min(C.land.hw - 0.25, z)) };
    };
    if (t < A - walk) {
      out.push({ x: 0, y: -5, z: 0, s: 0 });
      continue;
    }
    if (k >= E) {
      const q = k - E;
      const target = slot(q);
      const p = smooth(Math.min(1, (t - (A - walk)) / walk));
      const sx = C.land.x0 - 1.9;
      const x = sx + (target.x - sx) * p;
      const z = spawnZ + (target.z - spawnZ) * p;
      // little step bounce while walking down the stand
      const bob = p < 1 ? Math.abs(Math.sin((t - A) * 9 + k)) * 0.03 : 0;
      out.push({ x, y: stepTop(x) + TOK_H / 2 + bob, z, s: Math.min(1, p * 4 + 0.2) });
      continue;
    }
    // inside the lorong / plaza / out of the gate: two lanes, speed = throughput
    const d = (E - k) * 0.3;
    const x = MOUTH.x + d;
    const zIn = slot(0).z;
    let z = zIn + (lane - zIn) * smooth(d / 0.6);
    if (x > C.plaza.x0) z = lane + (plazaZ - lane) * smooth((x - C.plaza.x0) / 2.4);
    const sc = 1 - smooth((x - 7.0) / 0.6);
    out.push({ x, y: C.floorY + TOK_H / 2, z, s: Math.max(0, sc) });
  }
  return out;
};

/** Tokens per 1 m² cell of the landing grid (cols x -6..-2, rows z -2.5..2.5). */
export const cellCounts = (toks: Tok[]) => {
  const n = new Array(4 * 5).fill(0);
  for (const p of toks) {
    if (p.s < 0.5 || p.x < -6 || p.x >= -2 || Math.abs(p.z) >= 2.5) continue;
    const ci = Math.floor(p.x + 6);
    const ri = Math.floor(p.z + 2.5);
    n[ri * 4 + ci]++;
  }
  return n;
};

const heat = (n: number) => {
  // yellow -> orange -> red as cell count climbs toward the ~5 / m² risk line
  const k = Math.max(0, Math.min(1, (n - 2) / 3));
  return new THREE.Color("#FFE27A").lerp(new THREE.Color("#FF3B2A"), k);
};

export const Corridor: React.FC<{
  t: number;
  ft: FlowTimes;
  narrowOn: number; // 0..1 red lorong highlight
  gateOn: number; // 0..1 gate label/bracket
  gridOn: number; // 0..1 1 m² grid
  heatOn: number; // 0..1 heatmap
}> = ({ t, ft, narrowOn, gateOn, gridOn, heatOn }) => {
  const grain = useMemo(() => surfaceGrain(63, 256, 0.3, 6), []);
  const toks = tokenPositions(t, ft);
  const mesh = useMemo(() => {
    const geo = new THREE.CylinderGeometry(TOK_R, TOK_R + 0.01, TOK_H, 28);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#ffffff" });
    const m = new THREE.InstancedMesh(geo, mat, N_TOK);
    const r = prng(6262);
    const cols = [new THREE.Color(P.lane), new THREE.Color(P.lane), new THREE.Color("#EDE6D6"), new THREE.Color("#B9CBE2")];
    const o = new THREE.Object3D();
    for (let i = 0; i < N_TOK; i++) {
      m.setColorAt(i, cols[Math.floor(r() * cols.length)].clone().multiplyScalar(0.88 + r() * 0.12));
      o.position.set(0, -5, 0);
      o.scale.setScalar(0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, []);
  {
    const o = new THREE.Object3D();
    toks.forEach((p, i) => {
      o.position.set(p.x, p.y, p.z);
      o.scale.setScalar(p.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  const counts = cellCounts(toks);

  const fx = (o: THREE.Object3D | null) => o && o.layers.set(FX_LAYER);
  const wall = "#C9D0D7";
  const walls: { p: [number, number, number]; s: [number, number, number] }[] = [
    // landing side walls
    { p: [(C.land.x0 + C.land.x1) / 2, 0, C.land.hw + 0.08], s: [C.land.x1 - C.land.x0, C.wallH, 0.16] },
    { p: [(C.land.x0 + C.land.x1) / 2, 0, -C.land.hw - 0.08], s: [C.land.x1 - C.land.x0, C.wallH, 0.16] },
    // funnel faces into the lorong
    { p: [C.lor.x0 - 0.08, 0, (C.land.hw + C.lor.hw) / 2 + 0.04], s: [0.16, C.wallH, C.land.hw - C.lor.hw + 0.24] },
    { p: [C.lor.x0 - 0.08, 0, -(C.land.hw + C.lor.hw) / 2 - 0.04], s: [0.16, C.wallH, C.land.hw - C.lor.hw + 0.24] },
    // lorong walls
    { p: [(C.lor.x0 + C.lor.x1) / 2, 0, C.lor.hw + 0.08], s: [C.lor.x1 - C.lor.x0, C.wallH, 0.16] },
    { p: [(C.lor.x0 + C.lor.x1) / 2, 0, -C.lor.hw - 0.08], s: [C.lor.x1 - C.lor.x0, C.wallH, 0.16] },
    // plaza opening + side walls
    { p: [C.plaza.x0 + 0.08, 0, (C.plaza.hw + C.lor.hw) / 2 + 0.04], s: [0.16, C.wallH, C.plaza.hw - C.lor.hw + 0.24] },
    { p: [C.plaza.x0 + 0.08, 0, -(C.plaza.hw + C.lor.hw) / 2 - 0.04], s: [0.16, C.wallH, C.plaza.hw - C.lor.hw + 0.24] },
    { p: [(C.plaza.x0 + C.plaza.x1) / 2, 0, C.plaza.hw + 0.08], s: [C.plaza.x1 - C.plaza.x0, C.wallH, 0.16] },
    { p: [(C.plaza.x0 + C.plaza.x1) / 2, 0, -C.plaza.hw - 0.08], s: [C.plaza.x1 - C.plaza.x0, C.wallH, 0.16] },
    // gate wall either side of the 3 m opening
    { p: [C.gate.x, 0, (C.plaza.hw + C.gate.hw) / 2 + 0.04], s: [0.16, C.wallH, C.plaza.hw - C.gate.hw + 0.16] },
    { p: [C.gate.x, 0, -(C.plaza.hw + C.gate.hw) / 2 - 0.04], s: [0.16, C.wallH, C.plaza.hw - C.gate.hw + 0.16] },
  ];

  const pulse = 0.5 + 0.5 * Math.sin(t * 5.2);
  const red = "#FF5A3C";
  const green = "#40E08C";

  return (
    <group>
      {/* studio floor + detail board */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.floor} />
      </mesh>
      <mesh position={[-0.5, -0.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[19.5, 0.4, 7.6]} radius={0.08} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.frame} />
      </mesh>
      <mesh position={[-0.5, -0.004, 0]} receiveShadow>
        <RoundedBoxGeo args={[19.2, 0.02, 7.3]} radius={0.06} />
        <meshStandardMaterial color="#18222C" roughness={0.82} />
      </mesh>

      {/* floors: landing + lorong + plaza (concrete) and the outside apron past the gate */}
      <mesh position={[(C.land.x0 + C.plaza.x1) / 2, C.floorY / 2, 0]} receiveShadow>
        <boxGeometry args={[C.plaza.x1 - C.land.x0, C.floorY, C.land.hw * 2]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#5B6875" bumpMap={grain} bumpScale={0.12} />
      </mesh>
      <mesh position={[6.6, C.floorY / 2 - 0.005, 0]} receiveShadow>
        <boxGeometry args={[3.2, C.floorY, 5]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#2E4A34" />
      </mesh>

      {/* stand steps behind the landing, with the aisle the crowd comes down */}
      {[0, 1, 2, 3].map((i) => (
        <group key={`st${i}`}>
          <mesh position={[C.land.x0 - 0.25 - i * 0.5, (0.2 * (i + 1) + C.floorY) / 2, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.5, 0.2 * (i + 1) + C.floorY, C.land.hw * 2]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={i % 2 ? "#3E4C5A" : "#465564"} bumpMap={grain} bumpScale={0.05} />
          </mesh>
          <mesh position={[C.land.x0 - 0.25 - i * 0.5, 0.2 * (i + 1) + C.floorY + 0.006, 0]} receiveShadow>
            <boxGeometry args={[0.5, 0.012, 1.7]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#B8BEC4" />
          </mesh>
          {/* seated spectators either side of the aisle */}
          {[-2.15, -1.6, -1.1, 1.1, 1.6, 2.15].map((z, j) => (
            <mesh key={j} position={[C.land.x0 - 0.25 - i * 0.5, 0.2 * (i + 1) + C.floorY + TOK_H / 2, z]} castShadow>
              <cylinderGeometry args={[TOK_R, TOK_R + 0.01, TOK_H, 24]} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color={(i + j) % 3 ? "#EDE6D6" : "#B9CBE2"} />
            </mesh>
          ))}
        </group>
      ))}

      {/* walls (maquette height so the crowd stays visible) */}
      {walls.map((w, i) => (
        <mesh key={i} position={[w.p[0], C.floorY + C.wallH / 2, w.p[2]]} castShadow receiveShadow>
          <RoundedBoxGeo args={w.s} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={wall} />
        </mesh>
      ))}
      {/* tunnel portal over the lorong mouth: a real covered recess */}
      <mesh position={[C.lor.x0 + 0.2, C.floorY + C.wallH + 0.05, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.4, 0.1, C.lor.hw * 2 + 0.36]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={wall} />
      </mesh>

      {/* lorong floor tint: the narrowest point */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(C.lor.x0 + C.lor.x1) / 2, C.floorY + 0.004, 0]} ref={fx}>
        <planeGeometry args={[C.lor.x1 - C.lor.x0, C.lor.hw * 2]} />
        <meshBasicMaterial color={red} transparent opacity={0.34 * narrowOn * (0.75 + 0.25 * pulse)} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* width brackets: 1,5 m (red) across the lorong, 3 m (green) across the gate */}
      {[
        { x: 0.2, hw: C.lor.hw, c: red, on: narrowOn },
        { x: C.gate.x + 0.35, hw: C.gate.hw, c: green, on: gateOn },
      ].map((b, i) =>
        b.on > 0.01 ? (
          <group key={`br${i}`} position={[b.x, C.floorY + C.wallH + 0.22, 0]} scale={[1, 1, Math.max(0.001, b.on)]}>
            <mesh>
              <boxGeometry args={[0.05, 0.05, b.hw * 2]} />
              <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[0, -0.12, s * b.hw]}>
                <boxGeometry args={[0.05, 0.28, 0.05]} />
                <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={1.6} toneMapped={false} />
              </mesh>
            ))}
          </group>
        ) : null,
      )}
      {/* gate posts */}
      {[-1, 1].map((s) => (
        <group key={`gp${s}`} position={[C.gate.x, 0, s * (C.gate.hw + 0.08)]}>
          <mesh position={[0, C.floorY + 0.36, 0]} castShadow>
            <RoundedBoxGeo args={[0.22, 0.72, 0.22]} radius={0.04} />
            <meshPhysicalMaterial {...POLISH.brickABS} color="#2A3440" />
          </mesh>
          <mesh position={[0, C.floorY + 0.78, 0]}>
            <RoundedBoxGeo args={[0.26, 0.1, 0.26]} radius={0.04} />
            <meshStandardMaterial color={green} emissive={green} emissiveIntensity={1.4 + gateOn} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 1 m² grid over the landing */}
      {gridOn > 0.01 && (
        <group position={[0, C.floorY + 0.006, 0]}>
          {[-6, -5, -4, -3, -2].map((x) => (
            <mesh key={`gx${x}`} position={[x, 0, 0]} ref={fx}>
              <boxGeometry args={[0.03, 0.006, 5]} />
              <meshBasicMaterial color="#F4F6EE" transparent opacity={0.75 * gridOn} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
          {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((z) => (
            <mesh key={`gz${z}`} position={[-4, 0, z]} ref={fx}>
              <boxGeometry args={[4, 0.006, 0.03]} />
              <meshBasicMaterial color="#F4F6EE" transparent opacity={0.75 * gridOn} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
      {heatOn > 0.01 &&
        counts.map((n, i) => {
          const ci = i % 4;
          const ri = Math.floor(i / 4);
          return (
            <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-6 + ci + 0.5, C.floorY + 0.003, -2.5 + ri + 0.5]} ref={fx}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshBasicMaterial color={heat(n)} transparent opacity={heatOn * Math.min(0.62, 0.12 + n * 0.1)} toneMapped={false} depthWrite={false} />
            </mesh>
          );
        })}

      <primitive object={mesh} />
    </group>
  );
};
