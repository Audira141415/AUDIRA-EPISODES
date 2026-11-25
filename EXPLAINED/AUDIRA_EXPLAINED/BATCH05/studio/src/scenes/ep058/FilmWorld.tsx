// AE-058 film world: three sites built from the approved cover's BRUTALFORGE parts (flat toon,
// thick inverted-hull ink, hard shadows). Only the active site is mounted, at the origin.
//   Site A: city block, tower taken down top-down (cover world, now time-driven)
//   Site B: Japan, closed "hat" on top that steps down one floor at a time
//   Site C: open lot, implosion concept (wrapped columns, small sequential flashes, gravity)
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { prng } from "../../core/materials/textures.ts";
import { Ink, Rod, PAL, toon, toonMap, facadeTex, netTex, hatchTex, labelTex, INK_MAT, type V3 } from "./parts.tsx";
import { City, Excavator, MistCannon, Spray, Street, Tower, Worker } from "./World.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { A_FLOORS, B, B_FLOORS, COLLAPSE_T0, FLASH_T, FLOOR, backOut, clamp01, floorsA, floorsB, mix, outCubic, ramp, smooth } from "./timing.ts";

// ---------------------------------------------------------------------------------------------
// shared bits
export const Sun: React.FC = () => (
  <>
    <ambientLight intensity={1.15} />
    <hemisphereLight args={["#ffffff", "#f3e6a0", 0.4]} />
    <directionalLight
      position={[-26, 48, 34]}
      intensity={2.1}
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-camera-left={-56}
      shadow-camera-right={56}
      shadow-camera-top={56}
      shadow-camera-bottom={-56}
      shadow-camera-near={1}
      shadow-camera-far={180}
      shadow-bias={-0.0006}
    />
  </>
);

const Puff: React.FC<{ p: V3; r: number; color?: string }> = ({ p, r, color = "#E4DFD1" }) =>
  r <= 0.01 ? null : (
    <group position={p} scale={r}>
      <mesh material={toon(color)}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <mesh material={INK_MAT} scale={1.09}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
    </group>
  );

/** Flat 8-point comic star (spark/flash), faces +z; billboard by passing a rotation. */
const starGeo = (() => {
  let g: THREE.ShapeGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new THREE.Shape();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      const r = i % 2 ? 0.42 : 1;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    g = new THREE.ShapeGeometry(s);
    return g;
  };
})();
const FLASH_MAT = new THREE.MeshBasicMaterial({ color: PAL.yellow, side: THREE.DoubleSide, depthTest: false, transparent: true });
const FLASH_INK = new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.DoubleSide, depthTest: false, transparent: true });
export const Flash: React.FC<{ p: V3; s: number; rotY?: number; color?: THREE.Material }> = ({ p, s, rotY = 0, color = FLASH_MAT }) =>
  s <= 0.01 ? null : (
    <group position={p} rotation={[0, rotY, 0]} scale={s}>
      <mesh geometry={starGeo()} material={FLASH_INK} scale={1.22} renderOrder={20} />
      <mesh geometry={starGeo()} material={color} position={[0, 0, 0.01]} renderOrder={21} />
    </group>
  );

// facade materials cached per (rows, palette)
const matCache = new Map<string, THREE.MeshToonMaterial[]>();
const facadeMats = (rows: number, base: string, seed: number, pane: string, lit: string, cols = 4) => {
  const key = `${rows}|${base}|${seed}|${pane}|${lit}|${cols}`;
  const hit = matCache.get(key);
  if (hit) return hit;
  const face = toonMap(facadeTex(base, cols, Math.max(1, rows), seed, pane, lit));
  const top = new THREE.MeshToonMaterial({ color: "#7E776A" });
  const out = [face, face, top, top, face, face];
  matCache.set(key, out);
  return out;
};

// ---------------------------------------------------------------------------------------------
// SITE A pieces
const COLS: [number, number][] = [-3.4, 0, 3.4].flatMap((x) => [-3.4, 0, 3.4].map((z) => [x, z] as [number, number]));

/** Main tower: `n` floors (fraction = rubble work level), optional X-ray, furniture, asbestos. */
const TowerA: React.FC<{ n: number; xray: number; roofKit: boolean; furn: number; asb: number; f: number }> = ({ n, xray, roofKit, furn, asb, f }) => {
  const k = Math.floor(n + 1e-4);
  const q = n - k;
  const mats = facadeMats(k, PAL.concrete, 58, PAL.ink, PAL.cyan);
  useLayoutEffect(() => {
    // X-ray: the shell turns see-through so slabs and columns read inside
    const xr = xray > 0.01;
    for (const m of new Set(mats)) {
      if (m.transparent !== xr) {
        m.transparent = xr;
        m.needsUpdate = true;
      }
      m.opacity = 1 - 0.82 * xray;
      m.depthWrite = !xr;
    }
  });
  const hatch = useMemo(() => new THREE.MeshToonMaterial({ map: hatchTex(PAL.pink, PAL.white, [3, 2]) }), []);
  const rubble = useMemo(() => {
    const rnd = prng(5811);
    return Array.from({ length: 14 }, () => ({
      p: [-3.2 + rnd() * 6.4, rnd() * 0.5, -3.2 + rnd() * 6.4] as V3,
      s: [0.5 + rnd() * 0.7, 0.3 + rnd() * 0.4, 0.4 + rnd() * 0.6] as V3,
      r: [rnd() * 0.6, rnd() * 3, rnd() * 0.5] as V3,
    }));
  }, []);
  const rebar = useMemo(() => {
    const rnd = prng(5812);
    return COLS.filter((_, i) => i !== 4).map(([x, z]) => ({ x, z, lean: (rnd() - 0.5) * 0.7, h: 0.5 + rnd() * 0.5 }));
  }, []);
  const H = k * FLOOR;
  const furnCols = [PAL.pink, PAL.cyan, PAL.green, PAL.orange];
  return (
    <group>
      {k > 0 ? (
        <group>
          <mesh position={[0, H / 2, 0]} material={mats} castShadow={xray < 0.5} receiveShadow>
            <boxGeometry args={[8, H, 8]} />
          </mesh>
          {xray < 0.5 ? (
            <mesh position={[0, H / 2, 0]} material={INK_MAT}>
              <boxGeometry args={[8 + 0.28, H + 0.28, 8 + 0.28]} />
            </mesh>
          ) : null}
        </group>
      ) : null}
      {/* X-ray interior: slabs + 3 x 3 columns */}
      {xray > 0.01 && k > 0 ? (
        <group>
          {Array.from({ length: k }, (_, i) => (
            <Ink key={`s${i}`} size={[7.4, 0.22, 7.4]} position={[0, (i + 1) * FLOOR - 0.12, 0]} color={PAL.white} t={0.06} r={0.04} shadow={false} />
          ))}
          {COLS.map(([x, z]) => (
            <Ink key={`c${x}${z}`} size={[0.5, H, 0.5]} position={[x, H / 2, z]} color={PAL.cyan} t={0.06} r={0.04} shadow={false} />
          ))}
          {/* furniture: floors are emptied top-down (furn = floors still furnished) */}
          {Array.from({ length: Math.min(k, Math.ceil(furn)) }, (_, i) => {
            const s = clamp01(furn - i);
            return [0, 1, 2].map((j) => (
              <Ink
                key={`f${i}${j}`}
                size={[1.4 * s, 0.8 * s, 1.0 * s]}
                position={[-2 + j * 2, i * FLOOR + 0.5, -1.5 + ((i + j) % 2) * 2.6]}
                color={furnCols[(i + j) % 4]}
                t={0.05}
                r={0.08}
                shadow={false}
              />
            ));
          })}
          {/* asbestos ceiling panels, floor 6 */}
          {asb > 0 ? (
            <group position={[1.4, 6 * FLOOR - 0.28, 1.2]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={hatch} scale={1 + 0.08 * Math.sin(f / 5) * asb}>
                <planeGeometry args={[3.4, 2.6]} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} material={hatch} position={[0, 0.02, 0]}>
                <planeGeometry args={[3.4, 2.6]} />
              </mesh>
            </group>
          ) : null}
        </group>
      ) : null}
      {/* intact roof kit: parapet, stair housing, water tank */}
      {roofKit && k > 0 ? (
        <group position={[0, H, 0]}>
          <Ink size={[8.3, 0.5, 8.3]} position={[0, 0.25, 0]} color={PAL.concrete} t={0.12} r={0.08} />
          <Ink size={[2.4, 2.2, 2.4]} position={[-2, 1.4, -2]} color={PAL.white} t={0.1} r={0.1} />
          <group position={[2.2, 1.6, -1.8]}>
            <mesh material={toon(PAL.cyan)} castShadow>
              <cylinderGeometry args={[0.9, 0.9, 1.6, 20]} />
            </mesh>
            <mesh material={INK_MAT} scale={1.1}>
              <cylinderGeometry args={[0.9, 0.9, 1.6, 20]} />
            </mesh>
          </group>
        </group>
      ) : null}
      {/* work level: crushed remains of the floor being taken down */}
      {!roofKit && k >= 0 && n > 0.02 ? (
        <group position={[0, H, 0]}>
          {q > 0.02 ? <Ink size={[7.8, q * FLOOR, 7.8]} position={[0, (q * FLOOR) / 2, 0]} color={PAL.concreteDark} t={0.1} r={0.08} /> : null}
          <group position={[0, q * FLOOR, 0]}>
            {rubble.map((c, i) => (
              <Ink key={i} size={c.s} position={c.p} rotation={c.r} color={i % 3 ? PAL.concrete : PAL.concreteDark} t={0.05} r={0.05} />
            ))}
            {rebar.map((r, i) => (
              <Rod key={i} a={[r.x, 0, r.z]} b={[r.x + r.lean, r.h + 0.4, r.z + r.lean * 0.5]} r={0.06} color="#7a2a10" t={0.03} sides={5} />
            ))}
          </group>
        </group>
      ) : null}
    </group>
  );
};

/** Scaffold on front + both sides, net (see-through) and tarp (top bays), grows bottom-up. */
const FilmScaffold: React.FC<{ g: number; top: number; f: number }> = ({ g, top, f }) => {
  const net = useMemo(() => new THREE.MeshToonMaterial({ map: netTex([2, 2], 11), transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.02 }), []);
  const tarp = useMemo(() => new THREE.MeshToonMaterial({ color: "#F4F7FA", transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }), []);
  const H = top + 1.4;
  const shown = 1.3 + (H - 1.3) * g;
  if (g <= 0.001) return null;
  const rows: [number, number][] = [];
  for (let y = 1.3; y < H - 0.05; y += FLOOR) rows.push([y, Math.min(H, y + FLOOR)]);
  const faces: { pos: V3; rot: number; xs: number[] }[] = [
    { pos: [0, 0, 4.9], rot: 0, xs: [-4.3, -2.15, 0, 2.15, 4.3] },
    { pos: [4.9, 0, 0], rot: Math.PI / 2, xs: [-4.3, -2.15, 0, 2.15, 4.3] },
    { pos: [-4.9, 0, 0], rot: -Math.PI / 2, xs: [-4.3, -2.15, 0, 2.15, 4.3] },
  ];
  return (
    <group>
      {faces.map((F, fi) => (
        <group key={fi} position={F.pos} rotation={[0, F.rot, 0]}>
          {F.xs.map((x) => (
            <Rod key={`v${x}`} a={[x, 0, 0]} b={[x, shown, 0]} r={0.08} color={PAL.ink} />
          ))}
          {rows.map(([y0], ri) =>
            y0 <= shown ? <Rod key={`h${ri}`} a={[-4.4, y0, 0]} b={[4.4, y0, 0]} r={0.07} color={PAL.ink} /> : null,
          )}
          {rows.map(([y0, y1], ri) => {
            const vis = clamp01((shown - y0) / (y1 - y0));
            if (vis <= 0) return null;
            const isTarp = ri >= rows.length - 2;
            return F.xs.slice(0, -1).map((x0, b) => {
              const x1 = F.xs[b + 1];
              const h = (y1 - y0) * vis;
              const sway = 0.12 * Math.sin(f / 40 + ri * 1.3 + b * 2.1 + fi);
              return (
                <mesh key={`p${ri}${b}`} position={[(x0 + x1) / 2, y0 + h / 2, 0.12 + sway]} material={isTarp ? tarp : net}>
                  <planeGeometry args={[x1 - x0 - 0.06, h]} />
                </mesh>
              );
            });
          })}
          {/* tarp seams */}
          {rows.length >= 2 && rows[rows.length - 2][0] < shown
            ? F.xs.map((x) => <Rod key={`t${x}`} a={[x, rows[rows.length - 2][0], 0.16]} b={[x, Math.min(shown, H), 0.16]} r={0.05} color={PAL.pink} />)
            : null}
        </group>
      ))}
      {/* catch fans */}
      {[FLOOR * 3, FLOOR * 6].map((y) =>
        y + 0.4 < shown ? <Ink key={y} size={[9.4, 0.18, 2.0]} position={[0, y + 0.4, 5.9]} rotation={[-0.42, 0, 0]} color={PAL.pink} t={0.07} r={0.04} /> : null,
      )}
    </group>
  );
};

/** Mobile crane (whole truck in frame) with a slewing/luffing boom and a hook load. */
const CRANE_BASE: V3 = [15.5, 0, 13.6];
const CRANE_PIVOT: V3 = [13.6, 3.2, 13.6];
const FilmCrane: React.FC<{ tip: V3; hookY: number; children?: React.ReactNode }> = ({ tip, hookY, children }) => {
  const base = CRANE_BASE, pivot = CRANE_PIVOT;
  return (
    <group>
      <Ink size={[8.4, 1.2, 2.5]} position={[base[0], 1.15, base[2]]} color={PAL.white} t={0.1} r={0.12} />
      <Ink size={[1.9, 1.7, 2.5]} position={[base[0] + 3.6, 2.35, base[2]]} color={PAL.pink} t={0.1} r={0.18} />
      <Ink size={[0.9, 0.7, 2.3]} position={[base[0] + 4.0, 2.55, base[2]]} color={PAL.cyan} t={0.04} r={0.1} />
      {[-3.2, -1.4, 0.8, 3.4].map((dx) =>
        [-1.3, 1.3].map((dz) => (
          <group key={`${dx}${dz}`} position={[base[0] + dx, 0.58, base[2] + dz]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={toon(PAL.ink)} castShadow>
              <cylinderGeometry args={[0.58, 0.58, 0.45, 18]} />
            </mesh>
            <mesh material={toon("#9aa0a8")}>
              <cylinderGeometry args={[0.26, 0.26, 0.47, 12]} />
            </mesh>
          </group>
        )),
      )}
      {[-3.6, 3.0].map((dx) => (
        <Ink key={dx} size={[0.5, 0.3, 5.0]} position={[base[0] + dx, 0.4, base[2]]} color={PAL.yellow} t={0.07} r={0.06} />
      ))}
      <Ink size={[2.6, 1.3, 2.1]} position={[pivot[0], 2.3, pivot[2]]} color={PAL.pink} t={0.09} r={0.15} />
      <Rod a={pivot} b={tip} r={0.4} color={PAL.yellow} t={0.12} sides={4} />
      <Rod a={[pivot[0] + 0.3, pivot[1] - 0.6, pivot[2]]} b={[mix(pivot[0], tip[0], 0.3), mix(pivot[1], tip[1], 0.3), mix(pivot[2], tip[2], 0.3)]} r={0.24} color="#d9d9d9" t={0.06} />
      <Rod a={tip} b={[tip[0], hookY, tip[2]]} r={0.05} color={PAL.ink} />
      <Ink size={[0.5, 0.6, 0.5]} position={[tip[0], hookY, tip[2]]} color={PAL.yellow} t={0.06} r={0.08} />
      {children}
    </group>
  );
};

/** Street utility cabinet with power, water and gas lines into the building; each can be cut. */
const UTIL_COL = [PAL.yellow, PAL.cyan, PAL.orange];
export const UTIL_A: V3 = [5.6, 0, 9.6];
export const utilMid = (i: number): V3 => [mix(5.6, 2.2, 0.5), 4.4 + 0.9 * i, mix(9.6, 4.05, 0.5)];
const Utilities: React.FC<{ cuts: number[]; f: number }> = ({ cuts }) => (
  <group>
    <Ink size={[1.5, 1.6, 0.9]} position={[UTIL_A[0], 0.8, UTIL_A[2]]} color={PAL.white} t={0.08} r={0.1} />
    <Ink size={[1.0, 0.3, 0.05]} position={[UTIL_A[0], 1.2, UTIL_A[2] + 0.47]} color={PAL.pink} t={0} r={0.02} shadow={false} />
    {UTIL_COL.map((c, i) => {
      const y = 4.4 + 0.9 * i;
      const A: V3 = [UTIL_A[0] + (i - 1) * 0.35, y, UTIL_A[2]];
      const Bp: V3 = [2.2, y, 4.05];
      const dir = new THREE.Vector3(Bp[0] - A[0], 0, Bp[2] - A[2]).normalize();
      const M = new THREE.Vector3(...A).lerp(new THREE.Vector3(...Bp), 0.5);
      const gap = 0.55 * cuts[i];
      const m1 = M.clone().addScaledVector(dir, -gap - 0.01).toArray() as V3;
      const m2 = M.clone().addScaledVector(dir, gap + 0.01).toArray() as V3;
      const droop = 0.35 * cuts[i];
      m1[1] -= droop;
      m2[1] -= droop * 0.6;
      return (
        <group key={i}>
          <Rod a={[A[0], 1.5, A[2]]} b={A} r={0.22} color={c} t={0.08} sides={10} />
          <Rod a={A} b={m1} r={0.22} color={c} t={0.08} sides={10} />
          <Rod a={m2} b={Bp} r={0.22} color={c} t={0.08} sides={10} />
          {cuts[i] > 0.05 ? (
            <>
              <Ink size={[0.42, 0.42, 0.42]} position={m1} color={PAL.pink} t={0.06} r={0.08} />
              <Ink size={[0.42, 0.42, 0.42]} position={m2} color={PAL.pink} t={0.06} r={0.08} />
            </>
          ) : null}
          <Flash p={[M.x, M.y, M.z]} s={0.9 * Math.sin(Math.PI * clamp01(cuts[i] * 2.2))} rotY={0.5} />
        </group>
      );
    })}
  </group>
);

/** Furniture leaves down a chute from floor 2 into a truck on the street. */
const CHUTE_A: V3 = [-1.8, 5.6, 4.3];
const CHUTE_B: V3 = [-4.6, 2.6, 13.0];
const Chute: React.FC<{ t: number }> = ({ t }) => {
  const crates = Array.from({ length: 9 }, (_, i) => B.isi + 0.1 + i * 0.16);
  const cols = [PAL.pink, PAL.cyan, PAL.green, PAL.orange];
  return (
    <group>
      <Rod a={CHUTE_A} b={CHUTE_B} r={0.55} color={PAL.pink} t={0.08} sides={4} />
      {/* truck */}
      <group position={[-5.4, 0, 14.6]}>
        <Ink size={[5.2, 0.5, 2.4]} position={[0, 1.0, 0]} color={PAL.ink} t={0.04} r={0.08} />
        <Ink size={[1.8, 1.8, 2.4]} position={[-3.3, 1.6, 0]} color={PAL.cyan} t={0.09} r={0.16} />
        <Ink size={[4.8, 1.0, 0.15]} position={[0.1, 1.75, 1.15]} color={PAL.white} t={0.05} r={0.04} />
        <Ink size={[4.8, 1.0, 0.15]} position={[0.1, 1.75, -1.15]} color={PAL.white} t={0.05} r={0.04} />
        {[-3.2, -0.6, 1.6].map((dx) =>
          [-1.2, 1.2].map((dz) => (
            <group key={`${dx}${dz}`} position={[dx, 0.55, dz]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh material={toon(PAL.ink)} castShadow>
                <cylinderGeometry args={[0.55, 0.55, 0.4, 16]} />
              </mesh>
            </group>
          )),
        )}
      </group>
      {crates.map((ts, i) => {
        const u = ramp(t, ts, ts + 0.75);
        if (t < ts) return null;
        const landed = u >= 1;
        const p = landed
          ? ([-6.4 + (i % 3) * 1.2, 1.7 + Math.floor(i / 3) * 0.75, 14.6 + ((i % 2) - 0.5) * 0.9] as V3)
          : ([mix(CHUTE_A[0], CHUTE_B[0], u), mix(CHUTE_A[1], CHUTE_B[1], u) + 0.75, mix(CHUTE_A[2], CHUTE_B[2], u)] as V3);
        return <Ink key={i} size={[0.9, 0.7, 0.9]} position={p} rotation={[0, i * 0.7, landed ? 0 : 0.3]} color={cols[i % 4]} t={0.06} r={0.1} />;
      })}
    </group>
  );
};

/** Paperwork card: permit + technical plan, stamp slams down, envelopes fly to the neighbours. */
const DOC_POS: V3 = [0, 11.5, 15];
const DOC_ROT: V3 = [-0.08, -0.12, 0.03];
export const ENV_TARGETS: V3[] = [
  [-9.6, 7.8, 4.5],
  [-7.0, 4.2, 4.5],
  [-9.0, 2.0, 4.5],
  [7.2, 10.4, 4.4],
  [9.8, 5.2, 4.4],
  [6.6, 2.6, 4.4],
];
const DocCard: React.FC<{ t: number }> = ({ t }) => {
  const paper = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 1040;
    const g = c.getContext("2d")!;
    g.fillStyle = PAL.ink;
    g.fillRect(0, 0, 800, 1040);
    g.fillStyle = PAL.white;
    g.fillRect(16, 16, 768, 1008);
    g.fillStyle = PAL.yellow;
    g.fillRect(16, 16, 768, 150);
    g.fillStyle = PAL.ink;
    g.fillRect(16, 162, 768, 8);
    g.font = '96px Anton, "Arial Black", sans-serif';
    g.textBaseline = "middle";
    g.fillText("IZIN BONGKAR", 50, 96);
    // text lines
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? "#c9c4b6" : "#9b968a";
      g.fillRect(50, 210 + i * 46, 700 - (i % 3) * 120, 20);
    }
    // technical plan box
    g.fillStyle = PAL.ink;
    g.fillRect(46, 420, 708, 470);
    g.fillStyle = "#103a66";
    g.fillRect(56, 430, 688, 450);
    g.font = '50px Anton, "Arial Black", sans-serif';
    g.fillStyle = PAL.cyan;
    g.fillText("RENCANA TEKNIS", 80, 476);
    // floor-plan grid: column lines + column squares across the whole plan box
    g.strokeStyle = "rgba(0,240,255,0.55)";
    g.lineWidth = 3;
    for (let x = 80; x <= 720; x += 80) { g.beginPath(); g.moveTo(x, 500); g.lineTo(x, 865); g.stroke(); }
    for (let y = 520; y <= 860; y += 68) { g.beginPath(); g.moveTo(66, y); g.lineTo(734, y); g.stroke(); }
    g.fillStyle = "#ffffff";
    for (let x = 80; x <= 720; x += 160) for (let y = 520; y <= 860; y += 136) g.fillRect(x - 9, y - 9, 18, 18);
    g.strokeStyle = "#ffffff";
    g.lineWidth = 6;
    // tower elevation with floor lines + top-down arrow
    g.strokeRect(150, 540, 200, 310);
    for (let i = 1; i < 8; i++) {
      g.beginPath();
      g.moveTo(150, 540 + i * 38.75);
      g.lineTo(350, 540 + i * 38.75);
      g.stroke();
    }
    g.strokeStyle = PAL.pink;
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(420, 560);
    g.lineTo(420, 800);
    g.stroke();
    g.fillStyle = PAL.pink;
    g.beginPath();
    g.moveTo(390, 790);
    g.lineTo(450, 790);
    g.lineTo(420, 845);
    g.fill();
    g.strokeStyle = PAL.yellow;
    g.lineWidth = 6;
    g.setLineDash([16, 12]);
    g.beginPath();
    g.arc(250, 700, 230, Math.PI * 1.05, Math.PI * 1.95);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = PAL.white;
    for (let i = 0; i < 3; i++) g.fillRect(500, 600 + i * 60, 200 - i * 40, 14);
    g.fillStyle = "#9b968a";
    g.fillRect(50, 930, 300, 20);
    g.fillRect(50, 970, 220, 20);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: tex });
  }, []);
  const stampTex = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: labelTex([{ text: "DISETUJUI", color: PAL.pink, size: 120 }], "#ffffff", 640, 220, 0),
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );
  const appear = backOut(clamp01((t - B.konteks) / 0.5));
  const plan = smooth(ramp(t, B.rencana - 0.4, B.rencana + 0.2));
  // stamp: drops on "persetujuan", lifts, imprint remains
  const down = smooth(ramp(t, B.persetujuan - 0.15, B.persetujuan + 0.12));
  const up = smooth(ramp(t, B.pemda + 0.05, B.pemda + 0.5));
  const sz = 6 - 5.4 * down + 6 * up;
  const imprint = t >= B.persetujuan + 0.1 ? 1 : 0;
  return (
    <group position={DOC_POS} rotation={DOC_ROT} scale={0.2 + 0.8 * appear}>
      <Ink size={[10, 13, 0.35]} color={PAL.white} t={0.14} r={0.06} />
      <mesh position={[0, 0, 0.19]} material={paper}>
        <planeGeometry args={[9.7, 12.7]} />
      </mesh>
      {/* yellow cover over the plan, slides away on "rencana teknis" */}
      {plan < 1 ? (
        <mesh position={[(-8.6 * plan) / 2 + 0.05, -1.45 + 0, 0.2]} material={toon(PAL.yellow)}>
          <planeGeometry args={[8.6 * (1 - plan), 5.6]} />
        </mesh>
      ) : null}
      {imprint ? (
        <mesh position={[2.0, -4.6, 0.22]} rotation={[0, 0, 0.12]} material={stampTex}>
          <planeGeometry args={[4.4, 1.5]} />
        </mesh>
      ) : null}
      {t < B.pemda + 0.55 && t > B.konteks + 0.2 ? (
        <group position={[2.0, -4.6, 0.6 + sz]} rotation={[Math.PI / 2, 0, 0.12]}>
          <Ink size={[4.0, 0.7, 1.6]} position={[0, -0.35, 0]} color={PAL.pink} t={0.1} r={0.1} />
          <Rod a={[0, 0, 0]} b={[0, -1.6, 0]} r={0.28} color={PAL.ink} t={0} />
          <group position={[0, -1.9, 0]}>
            <mesh material={toon(PAL.yellow)}>
              <sphereGeometry args={[0.7, 18, 12]} />
            </mesh>
            <mesh material={INK_MAT} scale={1.12}>
              <sphereGeometry args={[0.7, 18, 12]} />
            </mesh>
          </group>
        </group>
      ) : null}
    </group>
  );
};

const Envelopes: React.FC<{ t: number }> = ({ t }) => {
  const from = new THREE.Vector3(DOC_POS[0], DOC_POS[1] - 2, DOC_POS[2] + 0.5);
  return (
    <group>
      {ENV_TARGETS.map((tg, i) => {
        const ts = B.warga - 0.1 + i * 0.12;
        const u = outCubic(ramp(t, ts, ts + 0.9));
        if (u <= 0) return null;
        const to = new THREE.Vector3(...tg);
        const ctrl = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 4.5, 3));
        const a = from.clone().lerp(ctrl, u), b = ctrl.clone().lerp(to, u);
        const p = a.lerp(b, u);
        const s = u >= 1 ? 1 + 0.25 * Math.sin(Math.PI * clamp01((t - ts - 0.9) / 0.3)) : 1;
        return (
          <group key={i} position={p.toArray() as V3} rotation={[0, (1 - u) * 2.4, (1 - u) * 0.6]} scale={s}>
            <Ink size={[1.5, 1.0, 0.12]} color={PAL.white} t={0.07} r={0.05} />
            <mesh position={[0, 0.14, 0.08]} rotation={[0, 0, Math.PI / 4]} material={toon(PAL.pink)}>
              <planeGeometry args={[0.72, 0.72]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Horizontal scan plane sweeping the X-ray tower. */
const ScanPlane: React.FC<{ y: number; o: number }> = ({ y, o }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), []);
  mat.opacity = 0.38 * o;
  if (o <= 0.01) return null;
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat}>
        <planeGeometry args={[11, 11]} />
      </mesh>
      {[[0, 5.5, 11, 0.25], [0, -5.5, 11, 0.25], [5.5, 0, 0.25, 11], [-5.5, 0, 0.25, 11]].map(([x, z, w, d], i) => (
        <Ink key={i} size={[w, 0.25, d]} position={[x, 0, z]} color={PAL.cyan} t={0.06} r={0.04} shadow={false} />
      ))}
    </group>
  );
};

export type SiteAState = {
  n: number;
  xray: number;
  roofKit: boolean;
  furn: number;
  asb: number;
  scaffold: number;
  doc: boolean;
  util: number[] | null;
  chute: boolean;
  crane: boolean;
  exc: "none" | "hook" | "top";
  spray: number;
  scanY: number;
  scanO: number;
  cleared: boolean;
};

export const siteAState = (t: number, shot: string): SiteAState => {
  const n = floorsA(t);
  const s: SiteAState = {
    n, xray: 0, roofKit: true, furn: 0, asb: 0, scaffold: 0, doc: false, util: null, chute: false, crane: false, exc: "none", spray: 0, scanY: 0, scanO: 0, cleared: false,
  };
  if (shot === "hookTop") {
    s.roofKit = t < B.dibongkar - 0.25;
    s.exc = "top";
    s.scaffold = 1;
  }
  if (shot === "docs") s.doc = true;
  if (shot === "scan") {
    s.xray = smooth(ramp(t, B.mekanisme, B.mekanisme + 0.5));
    s.furn = A_FLOORS;
    s.scanY = mix(A_FLOORS * FLOOR + 1.5, 6 * FLOOR - 0.3, smooth(ramp(t, B.memetakan - 0.1, B.berbahaya + 0.2)));
    s.scanO = Math.min(smooth(ramp(t, B.memetakan - 0.3, B.memetakan + 0.1)), 1);
    s.asb = smooth(ramp(t, B.berbahaya - 0.1, B.berbahaya + 0.3));
  }
  if (shot === "utility") {
    s.util = [smooth(ramp(t, B.listrik + 0.05, B.listrik + 0.35)), smooth(ramp(t, B.air, B.air + 0.3)), smooth(ramp(t, B.gas, B.gas + 0.3))];
  }
  if (shot === "empty") {
    s.xray = 0.85;
    s.furn = A_FLOORS * (1 - smooth(ramp(t, B.isi + 0.1, B.lalu - 0.1)));
    s.chute = true;
    s.util = [1, 1, 1];
  }
  if (shot === "wrap") {
    s.scaffold = smooth(ramp(t, B.dibungkus - 0.3, B.terpal + 0.5));
    s.util = [1, 1, 1];
  }
  if (shot === "lift") {
    s.scaffold = 1;
    s.crane = true;
    s.exc = "hook";
    s.roofKit = t < B.teratas;
  }
  if (shot === "crush" || shot === "spray" || shot === "vibe") {
    s.scaffold = 1;
    s.crane = shot !== "vibe";
    s.exc = "top";
    s.roofKit = false;
  }
  if (shot === "spray" || shot === "vibe") s.spray = smooth(ramp(t, B.air2 - 0.1, B.air2 + 0.6));
  if (shot === "outro") {
    s.cleared = true;
    s.roofKit = false;
  }
  return s;
};

const SiteA: React.FC<{ t: number; f: number; shot: string }> = ({ t, f, shot }) => {
  const s = siteAState(t, shot);
  const top = s.n * FLOOR;
  // excavator on the hook: street -> roof
  const liftK = ramp(t, B.alat + 0.1, B.teratas + 0.25);
  const start: V3 = [6.0, 0.05, 10.0], end: V3 = [0.9, A_FLOORS * FLOOR + 0.55, 0.9];
  const xz = smooth(ramp(liftK, 0.45, 0.88));
  const excY = mix(start[1], end[1] + 2.2, smooth(ramp(liftK, 0, 0.62))) - 2.2 * smooth(ramp(liftK, 0.86, 1));
  const excPos: V3 = s.exc === "hook" ? [mix(start[0], end[0], xz), excY, mix(start[2], end[2], xz)] : [0.9, top + 0.02, 0.9];
  const swing = s.exc === "hook" ? Math.sin(f / 22) * 0.08 * (1 - ramp(liftK, 0.85, 1)) : 0;
  const tip: V3 = s.exc === "hook" ? [excPos[0] + 0.3, A_FLOORS * FLOOR + 11, excPos[2] + 0.3] : [3.5, A_FLOORS * FLOOR + 10, 3.0];
  const skipY = mix(3, top + 1, 0.5 + 0.5 * Math.sin(t * 0.9));
  const crusher: V3 = [excPos[0] - 4.3, top + 2.0, excPos[2]];
  const dust = s.exc === "top" ? 1 - 0.65 * s.spray : 0;
  return (
    <group>
      <Sun />
      <City />
      <Tower x={-8.3} z={0.3} w={5.6} d={8} h={10.4} color={PAL.cyan} cols={3} seed={11} />
      <Tower x={8.4} z={0.2} w={6} d={8} h={13} color={PAL.pink} cols={3} seed={12} pane={PAL.ink} lit={PAL.yellow} />
      {!s.cleared ? (
        <TowerA n={s.n} xray={s.xray} roofKit={s.roofKit} furn={s.furn} asb={s.asb} f={f} />
      ) : (
        <group>
          <Ink size={[8.4, 0.3, 8.4]} position={[0, 0.15, 0]} color="#CFC9BA" t={0.08} r={0.05} />
          {[[-2.5, -2.4], [2.6, 1.8], [-1.0, 2.2]].map(([x, z], i) => (
            <Ink key={i} size={[0.9, 0.9, 0.9]} position={[x, 0.75, z]} rotation={[0, i, 0]} color={[PAL.green, PAL.cyan, PAL.pink][i]} t={0.06} r={0.12} />
          ))}
        </group>
      )}
      <FilmScaffold g={s.scaffold} top={Math.max(0, top)} f={f} />
      {s.exc !== "none" ? (
        <group position={excPos} rotation={[swing, Math.PI + (s.exc === "hook" ? 0.6 * (1 - xz) : 0), swing * 0.5]} scale={1.15}>
          <Excavator f={s.exc === "top" ? f : 0} />
        </group>
      ) : null}
      {s.crane ? (
        <FilmCrane tip={tip} hookY={s.exc === "hook" ? excY + 3.0 : skipY + 1.6}>
          {s.exc !== "hook" ? (
            <group position={[tip[0], skipY, tip[2]]}>
              <Ink size={[2.0, 1.1, 1.3]} color={PAL.yellow} t={0.08} r={0.1} />
              <Rod a={[0, 1.6, 0]} b={[-0.8, 0.55, 0]} r={0.03} color={PAL.ink} />
              <Rod a={[0, 1.6, 0]} b={[0.8, 0.55, 0]} r={0.03} color={PAL.ink} />
            </group>
          ) : (
            <>
              <Rod a={[excPos[0], excY + 3.0, excPos[2]]} b={[excPos[0] - 1.0, excY + 1.6, excPos[2]]} r={0.03} color={PAL.ink} />
              <Rod a={[excPos[0], excY + 3.0, excPos[2]]} b={[excPos[0] + 1.0, excY + 1.6, excPos[2]]} r={0.03} color={PAL.ink} />
            </>
          )}
        </FilmCrane>
      ) : null}
      <Street />
      {s.doc ? (
        <>
          <DocCard t={t} />
          <Envelopes t={t} />
        </>
      ) : null}
      <ScanPlane y={s.scanY} o={s.scanO} />
      {s.util ? <Utilities cuts={s.util} f={f} /> : null}
      {s.chute ? <Chute t={t} /> : null}
      {s.spray > 0.01 || shot === "outro" ? <MistCannon /> : null}
      {s.spray > 0.01 ? (
        <>
          <Spray f={f} from={[-4.8, 3.6, 11.0]} to={[-2.6, top - 0.6, 5.4]} arc={4.0} n={420} seed={71} spread={2.4 * s.spray} size={0.18 * s.spray} puffs={3} />
          <Spray f={f} from={[2.6, top + 1.3, -2.2]} to={crusher} arc={1.2} n={120} seed={72} spread={0.6} size={0.1 * s.spray} puffs={2} />
        </>
      ) : null}
      {dust > 0.01
        ? ([[-0.6, 2.4, 0.4, 0.95], [-1.4, 1.5, 1.4, 0.75], [0.2, 3.1, -0.6, 0.62], [-2.2, 3.4, 0.6, 0.5]] as const).map(([x, y, z, r], i) => (
            <Puff key={i} p={[crusher[0] + x, crusher[1] + y - 1.6 + Math.sin(f / 50 + i) * 0.1, crusher[2] + z]} r={r * dust * (1 + 0.12 * Math.sin(f / 18 + i * 2))} />
          ))
        : null}
      {s.exc === "top" ? (
        <>
          <Worker f={f} seed={3} pos={[3.0, top, -2.4]} heading={-2.3} />
          <Worker f={f} seed={8} pos={[3.2, top, 2.8]} heading={-1.4} vest={PAL.green} />
        </>
      ) : null}
      <Worker f={f} seed={14} pos={[-2.6, 0.1, 9.7]} heading={0.4} pose="wave" />
      <Worker f={f} seed={21} pos={[-4.0, 0.1, 13.6]} heading={-0.6} vest={PAL.green} />
      <Worker f={f} seed={27} pos={[3.2, 0.1, 10.0]} heading={0.2} />
      {/* vibration sensor LED + measuring rings on the neighbour wall */}
      {shot === "vibe" ? (
        <group position={[-6.4, 7.6, 4.42]}>
          <Ink size={[1.1, 0.85, 0.3]} position={[0, 0, -0.1]} color={PAL.yellow} t={0.07} r={0.08} />
          <Ink size={[0.6, 0.28, 0.05]} position={[-0.1, 0.05, 0.08]} color={PAL.ink} t={0} r={0.02} shadow={false} />
          <mesh material={toon(Math.floor(f / 15) % 2 ? PAL.green : PAL.white)} position={[0.28, 0.2, 0.02]}>
            <sphereGeometry args={[0.1, 10, 8]} />
          </mesh>
          {[0, 1, 2].map((i) => {
            const u = ((t * 0.9 + i / 3) % 1 + 1) % 1;
            return (
              <mesh key={i} scale={0.5 + u * 2.6}>
                <ringGeometry args={[0.92, 1, 40]} />
                <meshBasicMaterial color={PAL.green} transparent opacity={0.9 * (1 - u)} />
              </mesh>
            );
          })}
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// SITE B: Japan, closed hat
const Hat: React.FC<{ y: number; grow: number; door: number }> = ({ y, grow, door }) => {
  const inside = useMemo(() => new THREE.MeshToonMaterial({ color: "#2B2E36", side: THREE.BackSide }), []);
  if (grow <= 0.01) return null;
  const HH = FLOOR * 1.6;
  return (
    <group position={[0, y - FLOOR, 0]} scale={[1, grow, 1]}>
      {/* skirt that hides the floor being taken apart */}
      <Ink size={[8.7, FLOOR, 8.7]} position={[0, FLOOR / 2, 0]} color={PAL.white} t={0.12} r={0.06} />
      {[0.4, 1.4, 2.2].map((yy) => (
        <Ink key={yy} size={[8.76, 0.18, 8.76]} position={[0, yy, 0]} color={PAL.pink} t={0} r={0.03} shadow={false} />
      ))}
      {/* hat body: three walls + roof; front wall is a door that closes */}
      <group position={[0, FLOOR, 0]}>
        <Ink size={[9.0, 0.5, 9.0]} position={[0, HH, 0]} color={PAL.white} t={0.14} r={0.08} />
        <Ink size={[0.4, HH, 9.0]} position={[-4.3, HH / 2, 0]} color={PAL.white} t={0.12} r={0.05} />
        <Ink size={[0.4, HH, 9.0]} position={[4.3, HH / 2, 0]} color={PAL.white} t={0.12} r={0.05} />
        <Ink size={[9.0, HH, 0.4]} position={[0, HH / 2, -4.3]} color={PAL.white} t={0.12} r={0.05} />
        <mesh position={[0, HH / 2, 0]} material={inside}>
          <boxGeometry args={[8.2, HH, 8.2]} />
        </mesh>
        {/* inner overhead crane */}
        <Ink size={[7.6, 0.4, 0.5]} position={[0, HH - 0.6, 0.8]} color={PAL.yellow} t={0.06} r={0.05} />
        <Ink size={[0.8, 0.6, 0.8]} position={[-1.2, HH - 1.0, 0.8]} color={PAL.pink} t={0.05} r={0.08} />
        <Rod a={[-1.2, HH - 1.3, 0.8]} b={[-1.2, 0.9, 0.8]} r={0.04} color={PAL.ink} />
        <Ink size={[1.4, 0.7, 1.0]} position={[-1.2, 0.6, 0.8]} color={PAL.concrete} t={0.06} r={0.06} />
        {/* door, hinged at the roof edge */}
        <group position={[0, HH, 4.3]} rotation={[-1.25 * (1 - door), 0, 0]}>
          <Ink size={[9.0, HH, 0.4]} position={[0, -HH / 2, 0]} color={PAL.white} t={0.12} r={0.05} />
          <Ink size={[9.06, 0.5, 0.46]} position={[0, -HH * 0.35, 0]} color={PAL.pink} t={0} r={0.03} shadow={false} />
          <Ink size={[9.06, 0.5, 0.46]} position={[0, -HH * 0.75, 0]} color={PAL.pink} t={0} r={0.03} shadow={false} />
        </group>
      </group>
    </group>
  );
};

const SiteB: React.FC<{ t: number; f: number }> = ({ t }) => {
  const hatOn = t >= B.lantai3;
  const n = hatOn ? floorsB(t) : B_FLOORS;
  const k = Math.floor(n + 1e-4);
  const mats = facadeMats(k, PAL.concrete, 61, PAL.ink, PAL.cyan);
  const H = k * FLOOR;
  const grow = hatOn ? backOut(clamp01((t - B.lantai3 - 0.2) / 0.6)) : 0;
  const door = smooth(ramp(t, B.tertutup - 0.35, B.tertutup + 0.45));
  const hl = hatOn ? 0 : 0;
  void hl;
  return (
    <group>
      <Sun />
      <City />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -10]} receiveShadow material={toon("#EFEADC")}>
        <planeGeometry args={[260, 160]} />
      </mesh>
      <Ink size={[160, 0.1, 9]} position={[0, 0.0, 12]} color={PAL.asphalt} t={0} r={0.02} />
      <Tower x={-13} z={-1} w={7} d={8} h={28.6} color={PAL.cyan} cols={3} seed={31} />
      <Tower x={12.5} z={0} w={6.5} d={8} h={18.2} color={PAL.pink} cols={3} seed={32} pane={PAL.ink} lit={PAL.yellow} />
      <Tower x={1} z={-14} w={9} d={8} h={23.4} color={PAL.green} cols={4} seed={33} />
      <Tower x={-24} z={-6} w={7} d={8} h={13} color={PAL.white} cols={3} seed={34} />
      <Tower x={24} z={-6} w={7} d={8} h={20.8} color="#FFB3C4" cols={3} seed={35} />
      <group>
        <mesh position={[0, H / 2, 0]} material={mats} castShadow receiveShadow>
          <boxGeometry args={[8, H, 8]} />
        </mesh>
        <mesh position={[0, H / 2, 0]} material={INK_MAT}>
          <boxGeometry args={[8.28, H + 0.28, 8.28]} />
        </mesh>
        {!hatOn ? (
          <group position={[0, H, 0]}>
            <Ink size={[8.3, 0.5, 8.3]} position={[0, 0.25, 0]} color={PAL.concrete} t={0.12} r={0.08} />
            <Ink size={[2.4, 2.2, 2.4]} position={[-2, 1.4, -2]} color={PAL.white} t={0.1} r={0.1} />
          </group>
        ) : null}
      </group>
      {hatOn ? <Hat y={n * FLOOR} grow={grow} door={door} /> : null}
      {/* falling-debris-free street, a few people */}
      <ToyPerson f={t * 60} seed={41} pose="walk" position={[-6, 0.06, 11]} heading={1.5} scale={1.7} outfit="casual" />
      <ToyPerson f={t * 60} seed={42} pose="stand" position={[6, 0.06, 13]} heading={-0.4} scale={1.7} outfit="casual" />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// SITE C: open lot implosion
const C_FLOORS = 12;
export const CUT_COLS: [number, number][] = [
  [0, 0],
  [0, 3.4],
  [-3.4, 3.4],
  [3.4, 3.4],
  [3.4, 0],
  [-3.4, 0],
];
const SiteC: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const wrapMat = useMemo(() => new THREE.MeshToonMaterial({ map: hatchTex("#5a5e68", "#8a8f99", [1, 2]) }), []);
  const ringMat = useMemo(() => new THREE.MeshToonMaterial({ map: hatchTex(PAL.pink, PAL.white, [24, 24]), side: THREE.DoubleSide }), []);
  const mats = facadeMats(1, PAL.concrete, 71, PAL.ink, PAL.cyan);
  const tau = t - COLLAPSE_T0;
  const g = 12;
  const d = tau > 0 ? 0.5 * g * tau * tau : 0;
  const highlight = smooth(ramp(t, B.kolom - 0.1, B.kolom + 0.3)) * (tau > 0 ? 0 : 1);
  const crowd = useMemo(() => {
    const rnd = prng(5831);
    return Array.from({ length: 14 }, (_, i) => {
      const a = -0.25 + (i / 13) * 1.35 + (rnd() - 0.5) * 0.05;
      const r = 47 + rnd() * 4;
      return { p: [Math.sin(a) * r, 0.05, Math.cos(a) * r] as V3, s: 41 + i, h: a + Math.PI };
    });
  }, []);
  const dustMats = useMemo(
    () => [
      new THREE.MeshToonMaterial({ color: "#E4DFD1", transparent: true, depthWrite: false }),
      new THREE.MeshToonMaterial({ color: "#D2CBB9", transparent: true, depthWrite: false }),
      new THREE.MeshBasicMaterial({ color: PAL.ink, side: THREE.BackSide, transparent: true, depthWrite: false }),
    ],
    [],
  );
  const dustPuffs = useMemo(() => {
    const rnd = prng(5832);
    return Array.from({ length: 34 }, (_, i) => ({ a: (i / 34) * Math.PI * 2 + rnd() * 0.2, r: 0.5 + rnd() * 0.5, y: rnd(), s: 0.6 + rnd() * 0.6 }));
  }, []);
  const dust = tau > 0.8 ? outCubic(ramp(tau, 0.8, 4.6)) : 0;
  const dustO = mix(0.3, 1, smooth(ramp(tau, 0.8, 2.4)));
  dustMats[0].opacity = dustO;
  dustMats[1].opacity = dustO;
  dustMats[2].opacity = dustO;
  return (
    <group>
      <Sun />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow material={toon("#EFEADC")}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      {/* exclusion ring + barrier posts */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={ringMat} receiveShadow>
        <ringGeometry args={[40, 42.5, 96]} />
      </mesh>
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return <Ink key={i} size={[2.2, 0.9, 0.5]} position={[Math.sin(a) * 43.5, 0.45, Math.cos(a) * 43.5]} rotation={[0, a, 0]} color={i % 2 ? PAL.white : PAL.pink} t={0.08} r={0.12} />;
      })}
      {/* cleared ground pad + access road */}
      <Ink size={[22, 0.12, 22]} position={[0, 0.06, 0]} color="#D8D2C2" t={0.06} r={0.04} />
      {/* far town row */}
      {Array.from({ length: 14 }, (_, i) => (
        <Tower key={i} x={-130 + i * 20} z={-110 - (i % 3) * 6} w={12} d={8} h={6 + (i * 7) % 9} color={["#FFF09A", "#FFEB9E", "#FFF2A6"][i % 3]} cols={4} seed={900 + i} pane="#EEDC7C" lit="#FFF8D0" t={0.08} />
      ))}
      {/* the tower: open ground floor (columns), 11 floors above */}
      {COLS.map(([x, z], i) => {
        const cutIdx = CUT_COLS.findIndex(([cx, cz]) => cx === x && cz === z);
        const ft = cutIdx >= 0 ? FLASH_T[cutIdx] : Infinity;
        const broken = t >= ft + 0.05;
        if (tau > 0.12) return null;
        const hl = cutIdx >= 0 ? highlight : 0;
        return (
          <group key={i} position={[x, 0, z]}>
            {!broken ? (
              <>
                <Ink size={[0.6, FLOOR, 0.6]} position={[0, FLOOR / 2, 0]} color={PAL.concrete} t={0.07} r={0.05} />
                {cutIdx >= 0 ? <Ink size={[0.86, 1.2, 0.86]} position={[0, 1.0, 0]} material={wrapMat} t={0.06 + 0.08 * hl} r={0.08} /> : null}
              </>
            ) : (
              <>
                <Ink size={[0.6, 0.5, 0.6]} position={[0, 0.25, 0]} color={PAL.concrete} t={0.07} r={0.05} />
                <Ink size={[0.6, 0.7, 0.6]} position={[0, FLOOR - 0.35, 0]} color={PAL.concrete} t={0.07} r={0.05} />
                <Ink size={[0.5, 0.3, 0.4]} position={[0.5, 0.15, 0.3]} rotation={[0, 0.6, 0.2]} color={PAL.concreteDark} t={0.05} r={0.05} />
              </>
            )}
            {hl > 0.01 ? (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} scale={1 + 0.15 * Math.sin(f / 6)}>
                <ringGeometry args={[0.8, 1.05, 32]} />
                <meshBasicMaterial color={PAL.pink} transparent opacity={hl} />
              </mesh>
            ) : null}
            {cutIdx >= 0 ? <Flash p={[0, 1.1, 0.6]} s={1.0 * Math.sin(Math.PI * clamp01((t - ft) / 0.28))} /> : null}
          </group>
        );
      })}
      {Array.from({ length: C_FLOORS - 1 }, (_, j) => {
        const i = j + 1;
        const y0 = i * FLOOR;
        const rest = (i - 1) * 0.62;
        const yFall = y0 - d;
        const L = clamp01((rest - yFall) / 1.2);
        const y = Math.max(yFall, rest);
        const sy = mix(1, 0.24, L);
        const lean = (i % 2 ? 1 : -1) * 0.05 * L + (tau > 0 ? 0.012 * i * clamp01(tau) : 0);
        return (
          <group key={i} position={[lean * 4, y, 0]} rotation={[0, 0, lean]} scale={[1 + 0.06 * L, sy, 1 + 0.06 * L]}>
            <mesh position={[0, FLOOR / 2, 0]} material={mats} castShadow receiveShadow>
              <boxGeometry args={[8, FLOOR, 8]} />
            </mesh>
            <mesh position={[0, FLOOR / 2, 0]} material={INK_MAT}>
              <boxGeometry args={[8.26, FLOOR + 0.1, 8.26]} />
            </mesh>
            {i === C_FLOORS - 1 ? <Ink size={[8.3, 0.5, 8.3]} position={[0, FLOOR + 0.25, 0]} color={PAL.concrete} t={0.12} r={0.08} /> : null}
          </group>
        );
      })}
      {/* dust cloud: rolls out from the base, stays well inside the ring */}
      {dust > 0
        ? dustPuffs.map((p, i) => {
            const r = 4 + 16 * dust * p.r;
            const y = 1 + (2 + 12 * p.y) * dust;
            const sc = (1.5 + 5.5 * dust) * p.s;
            return (
              <group key={i} position={[Math.sin(p.a) * r, y, Math.cos(p.a) * r]} scale={sc}>
                <mesh material={dustMats[i % 3 ? 0 : 1]} renderOrder={5}>
                  <sphereGeometry args={[1, 16, 12]} />
                </mesh>
                <mesh material={dustMats[2]} scale={1.09} renderOrder={4}>
                  <sphereGeometry args={[1, 16, 12]} />
                </mesh>
              </group>
            );
          })
        : null}
      {/* crowd behind the ring */}
      {crowd.map((c, i) => (
        <ToyPerson key={i} f={f} seed={c.s} pose={tau > 0.5 && i % 3 === 0 ? "cheer" : "stand"} position={c.p} heading={c.h} scale={1.8} outfit="casual" />
      ))}
    </group>
  );
};

export const FilmWorld: React.FC<{ t: number; f: number; shot: string; site: "A" | "B" | "C" }> = ({ t, f, shot, site }) =>
  site === "A" ? <SiteA t={t} f={f} shot={shot} /> : site === "B" ? <SiteB t={t} f={f} /> : <SiteC t={t} f={f} />;
