// AE-058 world: a concrete tower being taken down top-down between two close neighbours.
// Units ~ metres (floor = 2.6). Building M footprint 8 x 8 centred on the origin, base at y = 0.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ToyPerson, type PoseName } from "../../core/polish/Person.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Ink, Rod, PAL, toon, toonMap, facadeTex, netTex, hatchTex, labelTex, INK_MAT, type V3 } from "./parts.tsx";

const FLOOR = 2.6;
const INTACT = 7; // floors still standing under the work level
const TOP = INTACT * FLOOR; // 18.2: slab the excavator works on

export const CameraRig: React.FC<{ f: number; pos: V3; target: V3; fov: number }> = ({ f, pos, target, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const drift = Math.sin(f / 240) * 0.6; // slow lateral drift (frame driven)
    cam.position.set(pos[0] + drift, pos[1], pos[2]);
    cam.lookAt(new THREE.Vector3(...target));
    cam.fov = fov;
    cam.near = 1;
    cam.far = 400;
    cam.updateProjectionMatrix();
  }, [camera, f, pos, target, fov]);
  return null;
};

// ---------------------------------------------------------------------------------------------
// Buildings
export const Tower: React.FC<{ x: number; z: number; w: number; d: number; h: number; color: string; cols: number; seed: number; t?: number; pane?: string; lit?: string }> = ({
  x, z, w, d, h, color, cols, seed, t = 0.12, pane, lit,
}) => {
  const mats = useMemo(() => {
    const rows = Math.max(1, Math.round(h / FLOOR));
    const front = toonMap(facadeTex(color, cols, rows, seed, pane, lit));
    const side = toonMap(facadeTex(color, Math.max(1, Math.round((cols * d) / w)), rows, seed + 5, pane, lit));
    const top = toon(color);
    return [side, side, top, top, front, front];
  }, [color, cols, h, w, d, seed, pane, lit]);
  return (
    <group>
      <Ink size={[w, h, d]} position={[x, h / 2, z]} material={mats} t={t} r={0.06} />
      {/* parapet cap */}
      <Ink size={[w + 0.3, 0.45, d + 0.3]} position={[x, h + 0.22, z]} color={color} t={t} r={0.08} />
    </group>
  );
};

const MainBuilding: React.FC = () => {
  const mats = useMemo(() => {
    const face = toonMap(facadeTex(PAL.concrete, 4, INTACT, 58, PAL.ink, PAL.cyan));
    const top = toon("#7E776A");
    return [face, face, top, top, face, face];
  }, []);
  const rebar = useMemo(() => {
    const rnd = prng(5801);
    const out: { a: V3; b: V3 }[] = [];
    // rebar sprouting from broken column stubs and the torn slab edge
    const stubs: V3[] = [[-3.4, TOP + 0.6, 3.4], [0, TOP + 0.9, 3.4], [3.4, TOP + 0.5, 3.4], [3.4, TOP + 1.2, 0], [-3.4, 20.8 + 1.3, -3.4]];
    for (const s of stubs) {
      for (let i = 0; i < 4; i++) {
        const ox = (i % 2 ? 0.18 : -0.18), oz = (i < 2 ? 0.18 : -0.18);
        const lean = (rnd() - 0.5) * 0.8;
        out.push({ a: [s[0] + ox, s[1] - 0.1, s[2] + oz], b: [s[0] + ox + lean, s[1] + 0.6 + rnd() * 0.5, s[2] + oz + (rnd() - 0.5) * 0.6] });
      }
    }
    for (let i = 0; i < 9; i++) {
      const x = -3.8 + i * 0.6;
      out.push({ a: [x, 20.8, -0.6], b: [x + (rnd() - 0.5) * 0.4, 20.8 - 0.2 - rnd() * 0.5, 0.2 + rnd() * 0.5] });
    }
    return out;
  }, []);
  const chunks = useMemo(() => {
    const rnd = prng(5802);
    return Array.from({ length: 16 }, () => ({
      p: [-1.2 + rnd() * 3.6, TOP + 0.2 + rnd() * 0.15, 2 + rnd() * 1.8] as V3,
      s: [0.35 + rnd() * 0.5, 0.25 + rnd() * 0.3, 0.3 + rnd() * 0.45] as V3,
      r: [rnd() * 0.6, rnd() * 3, rnd() * 0.5] as V3,
    }));
  }, []);
  return (
    <group>
      <Ink size={[8, TOP, 8]} position={[0, TOP / 2, 0]} material={mats} t={0.14} r={0.06} />
      {/* work level: back row of columns, partial slab above, broken stubs in front */}
      {[-3.4, 0, 3.4].map((x) => (
        <Ink key={`b${x}`} size={[0.6, FLOOR, 0.6]} position={[x, TOP + FLOOR / 2, -3.4]} color={PAL.concrete} t={0.08} r={0.05} />
      ))}
      <Ink size={[0.6, 1.5, 0.6]} position={[-3.4, TOP + 0.75, 1]} color={PAL.concrete} t={0.08} r={0.05} rotation={[0, 0, 0.12]} />
      <Ink size={[0.6, 1.2, 0.6]} position={[3.4, TOP + 0.6, 0]} color={PAL.concrete} t={0.08} r={0.05} />
      <Ink size={[0.6, 0.6, 0.6]} position={[-3.4, TOP + 0.3, 3.4]} color={PAL.concrete} t={0.08} r={0.05} />
      <Ink size={[0.6, 0.9, 0.6]} position={[0, TOP + 0.45, 3.4]} color={PAL.concrete} t={0.08} r={0.05} />
      <Ink size={[0.6, 0.5, 0.6]} position={[3.4, TOP + 0.25, 3.4]} color={PAL.concrete} t={0.08} r={0.05} />
      {/* partial upper slab (the floor being eaten) */}
      <Ink size={[5.2, 0.4, 3.6]} position={[-1.4, 20.8, -2.2]} color={PAL.concrete} t={0.09} r={0.05} />
      <Ink size={[1.8, 0.4, 1.0]} position={[-3.1, 20.7, -0.1]} color={PAL.concrete} t={0.09} r={0.05} rotation={[0.18, 0, -0.08]} />
      <Ink size={[0.6, 1.3, 0.6]} position={[-3.4, 20.8 + 0.85, -3.4]} color={PAL.concrete} t={0.08} r={0.05} />
      {rebar.map((r, i) => (
        <Rod key={i} a={r.a} b={r.b} r={0.055} color="#7a2a10" t={0.03} sides={5} />
      ))}
      {chunks.map((c, i) => (
        <Ink key={i} size={c.s} position={c.p} rotation={c.r} color={i % 3 ? PAL.concrete : PAL.concreteDark} t={0.05} r={0.05} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Scaffold, net and catch fans on the street face
const NetPanel: React.FC<{ x0: number; x1: number; y0: number; y1: number; z: number; f: number; seed: number; mat: THREE.Material }> = ({ x0, x1, y0, y1, z, f, seed, mat }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(x1 - x0, y1 - y0, 10, 10), [x0, x1, y0, y1]);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const w = x1 - x0, h = y1 - y0;
    const ph = seed * 1.7;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / w + 0.5, v = pos.getY(i) / h + 0.5;
      const bell = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
      // slack belly between the tubes + slow wind ripple (frame driven)
      const sag = 0.45 * bell + 0.16 * bell * Math.sin(f / 40 + ph + u * 3.0 + v * 2.0);
      pos.setZ(i, sag);
      // fabric droops a little at the bottom edge of each bay
      pos.setY(i, pos.getY(i) - 0.12 * Math.sin(Math.PI * u) * (1 - v) * (1 - v));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return <mesh geometry={geo} material={mat} position={[(x0 + x1) / 2, (y0 + y1) / 2, z]} />;
};

const Scaffold: React.FC<{ f: number }> = ({ f }) => {
  const nets = useMemo(
    () =>
      [0.7, 0.85, 1].map(
        (o, i) =>
          new THREE.MeshToonMaterial({ map: netTex([2, 2], 9 + i), transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.02 }),
      ),
    [],
  );
  const xs = [-4.3, -2.15, 0, 2.15, 4.3];
  const levels = Array.from({ length: 8 }, (_, i) => i * FLOOR + 1.3);
  const Z = 4.9;
  const panels: { x0: number; x1: number; y0: number; y1: number; k: number }[] = [];
  for (let r = 1; r < levels.length - 1 + 1; r++) {
    for (let b = 0; b < xs.length - 1; b++) {
      const y0 = levels[r - 1] + (r === 1 ? 1.3 : 0), y1 = r === levels.length - 1 ? TOP + 1.4 : levels[r];
      if (r >= levels.length) continue;
      panels.push({ x0: xs[b], x1: xs[b + 1], y0, y1, k: (r * 7 + b * 3) % 3 });
    }
  }
  return (
    <group>
      {xs.map((x) => (
        <Rod key={`v${x}`} a={[x, 0, Z]} b={[x, TOP + 1.4, Z]} r={0.08} color={PAL.ink} />
      ))}
      {levels.map((y) => (
        <Rod key={`h${y}`} a={[-4.4, y, Z]} b={[4.4, y, Z]} r={0.07} color={PAL.ink} />
      ))}
      <Rod a={[-4.4, TOP + 1.4, Z]} b={[4.4, TOP + 1.4, Z]} r={0.07} color={PAL.ink} />
      {/* fabric safety net, one slack panel per scaffold bay */}
      {panels.map((p, i) => (
        <NetPanel key={i} {...p} z={Z + 0.1} f={f} seed={i} mat={nets[p.k]} />
      ))}
      {/* catch fans (sloped trays that stop falling debris) */}
      {[FLOOR * 3, FLOOR * 5].map((y) => (
        <Ink key={y} size={[9.2, 0.18, 2.0]} position={[0, y + 0.4, Z + 1.0]} rotation={[-0.42, 0, 0]} color={PAL.pink} t={0.07} r={0.04} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Compact demolition excavator with a hydraulic crusher, local forward = +x
export const Excavator: React.FC<{ f: number }> = ({ f }) => {
  const bite = Math.sin(f / 14) * 0.08;
  const PINK = PAL.pink;
  const elbow: V3 = [2.3, 3.0, 0];
  const tip: V3 = [3.75, 1.7 + bite, 0];
  return (
    <group>
      {[-0.72, 0.72].map((z) => (
        <Ink key={z} size={[2.5, 0.55, 0.5]} position={[0, 0.28, z]} color={PAL.ink} t={0.05} r={0.2} />
      ))}
      <Ink size={[1.4, 0.3, 1.4]} position={[0, 0.7, 0]} color="#3a3d45" t={0.05} r={0.06} />
      <Ink size={[2.0, 0.85, 1.7]} position={[-0.2, 1.25, 0]} color={PINK} t={0.07} r={0.14} />
      <Ink size={[0.6, 0.7, 1.6]} position={[-1.15, 1.2, 0]} color={PAL.ink} t={0.05} r={0.12} />
      {/* remote-controlled: no cab, a hazard beacon and arm instead */}
      <Ink size={[0.5, 0.25, 0.5]} position={[-0.4, 1.8, 0.3]} color={PAL.yellow} t={0.05} r={0.08} />
      <Rod a={[0.55, 1.5, 0]} b={elbow} r={0.2} color={PINK} t={0.07} />
      <Rod a={elbow} b={tip} r={0.16} color={PINK} t={0.07} />
      <Rod a={[0.6, 1.2, 0.25]} b={[1.6, 2.4, 0.25]} r={0.08} color="#d9d9d9" t={0.04} />
      {/* crusher jaws */}
      <group position={tip}>
        <Ink size={[0.5, 0.5, 0.55]} color="#3a3d45" t={0.05} r={0.08} />
        <Ink size={[0.75, 0.22, 0.4]} position={[0.35, 0.25, 0]} rotation={[0, 0, 0.5]} color="#3a3d45" t={0.05} r={0.06} />
        <Ink size={[0.75, 0.22, 0.4]} position={[0.35, -0.3, 0]} rotation={[0, 0, -0.55]} color="#3a3d45" t={0.05} r={0.06} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Mobile crane lowering a debris skip from the work level
const Crane: React.FC<{ f: number }> = ({ f }) => {
  const base: V3 = [14.4, 0, 13.4];
  const pivot: V3 = [12.8, 3.2, 13.4];
  const tipP: V3 = [5.4, 23.6, 6.4];
  const lower = 14.2 - Math.sin(f / 200) * 0.3;
  return (
    <group>
      <Ink size={[7.2, 1.2, 2.4]} position={[base[0], 1.15, base[2]]} color={PAL.white} t={0.09} r={0.12} />
      <Ink size={[1.8, 1.6, 2.4]} position={[base[0] + 3.0, 2.3, base[2]]} color={PAL.pink} t={0.09} r={0.18} />
      <Ink size={[0.9, 0.7, 2.2]} position={[base[0] + 3.4, 2.5, base[2]]} color={PAL.cyan} t={0.04} r={0.1} />
      {[-2.6, -0.8, 1.2, 2.9].map((dx) =>
        [-1.25, 1.25].map((dz) => (
          <group key={`${dx}${dz}`} position={[base[0] + dx, 0.55, base[2] + dz]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={toon(PAL.ink)} castShadow>
              <cylinderGeometry args={[0.55, 0.55, 0.45, 18]} />
            </mesh>
            <mesh material={toon("#9aa0a8")}>
              <cylinderGeometry args={[0.25, 0.25, 0.47, 12]} />
            </mesh>
          </group>
        )),
      )}
      {/* outriggers */}
      {[-3.2, 3.2].map((dx) => (
        <Ink key={dx} size={[0.5, 0.3, 4.6]} position={[base[0] + dx, 0.4, base[2]]} color={PAL.yellow} t={0.06} r={0.06} />
      ))}
      <Ink size={[2.4, 1.2, 2.0]} position={[pivot[0], 2.3, pivot[2]]} color={PAL.pink} t={0.08} r={0.15} />
      <Rod a={pivot} b={tipP} r={0.36} color={PAL.yellow} t={0.1} sides={4} />
      <Rod a={[pivot[0] + 0.3, pivot[1] - 0.6, pivot[2]]} b={[pivot[0] + (tipP[0] - pivot[0]) * 0.32, pivot[1] + (tipP[1] - pivot[1]) * 0.32, pivot[2] + (tipP[2] - pivot[2]) * 0.32]} r={0.22} color="#d9d9d9" t={0.06} />
      {/* hook line + skip */}
      <Rod a={tipP} b={[tipP[0], lower + 1.4, tipP[2]]} r={0.04} color={PAL.ink} />
      <Rod a={[tipP[0], lower + 1.4, tipP[2]]} b={[tipP[0] - 0.8, lower + 0.55, tipP[2]]} r={0.03} color={PAL.ink} />
      <Rod a={[tipP[0], lower + 1.4, tipP[2]]} b={[tipP[0] + 0.8, lower + 0.55, tipP[2]]} r={0.03} color={PAL.ink} />
      <Ink size={[2.0, 1.1, 1.3]} position={[tipP[0], lower, tipP[2]]} color={PAL.yellow} t={0.08} r={0.1} />
      {[[-0.5, 0.2], [0.1, -0.2], [0.55, 0.15]].map(([dx, dz], i) => (
        <Ink key={i} size={[0.55, 0.4, 0.5]} position={[tipP[0] + dx, lower + 0.7, tipP[2] + dz]} rotation={[0.3 * i, i, 0.2]} color={PAL.concrete} t={0.05} r={0.06} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Water: mist cannon from the street + hose on the work slab. Droplets ride a parabola.
export const Spray: React.FC<{ f: number; from: V3; to: V3; arc: number; n: number; seed: number; spread: number; size: number; puffs?: number }> = ({
  f, from, to, arc, n, seed, spread, size, puffs = 0,
}) => {
  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.8, depthWrite: false });
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.frustumCulled = false;
    return m;
  }, [n]);
  const pts = useMemo(() => {
    const rnd = prng(seed);
    return Array.from({ length: n }, () => ({ u: rnd(), a: rnd() * Math.PI * 2, r: rnd(), s: 0.5 + rnd() }));
  }, [n, seed]);
  const at = (u: number): THREE.Vector3 => {
    const p = new THREE.Vector3(...from).lerp(new THREE.Vector3(...to), u);
    p.y += Math.sin(u * Math.PI) * arc;
    return p;
  };
  useLayoutEffect(() => {
    const mtx = new THREE.Matrix4();
    pts.forEach((p, i) => {
      const u = (p.u + f / 90) % 1;
      const c = at(u);
      const rad = spread * u * p.r;
      c.x += Math.cos(p.a) * rad;
      c.y += Math.sin(p.a) * rad * 0.7;
      c.z += Math.sin(p.a * 1.7) * rad;
      const s = size * p.s * (0.5 + u);
      mtx.compose(c, new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, mtx);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  const puffList = useMemo(() => {
    const rnd = prng(seed + 99);
    return Array.from({ length: puffs }, (_, i) => ({ u: 0.8 + (i / Math.max(1, puffs)) * 0.25, o: [(rnd() - 0.5) * 1.6, (rnd() - 0.3) * 1.2, (rnd() - 0.5) * 1.6] as V3, s: 0.5 + rnd() * 0.6 }));
  }, [puffs, seed]);
  return (
    <group>
      <primitive object={mesh} />
      {puffList.map((p, i) => {
        const c = at(Math.min(1, p.u));
        return (
          <group key={i} position={[c.x + p.o[0], c.y + p.o[1], c.z + p.o[2]]} scale={p.s}>
            <mesh material={toon("#F4FBFF")}>
              <sphereGeometry args={[1, 16, 12]} />
            </mesh>
            <mesh material={INK_MAT} scale={1.08}>
              <sphereGeometry args={[1, 16, 12]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const MistCannon: React.FC = () => (
  <group position={[-6.4, 0, 12.4]}>
    <Ink size={[2.6, 0.5, 1.6]} position={[0, 0.75, 0]} color={PAL.ink} t={0.05} r={0.1} />
    {[-0.9, 0.9].map((dz) => (
      <group key={dz} position={[0, 0.45, dz]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={toon(PAL.ink)}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
        </mesh>
      </group>
    ))}
    <Ink size={[0.5, 1.0, 0.5]} position={[0, 1.4, 0]} color={PAL.white} t={0.05} r={0.08} />
    <Rod a={[0, 1.9, 0]} b={[1.4, 3.3, -1.2]} r={0.6} color={PAL.cyan} t={0.09} sides={16} />
    <Rod a={[1.4, 3.3, -1.2]} b={[1.6, 3.5, -1.37]} r={0.66} color={PAL.ink} sides={16} />
  </group>
);

// ---------------------------------------------------------------------------------------------
// Street level: road, closed lane, hoarding with the AUDIRA board, barriers, cones
export const Street: React.FC = () => {
  const hatch = useMemo(() => new THREE.MeshToonMaterial({ map: hatchTex(PAL.pink, PAL.white, [10, 1]) }), []);
  const board = useMemo(
    () =>
      toonMap(
        labelTex(
          [
            { text: "AUDIRA EXPLAINED", color: PAL.ink, size: 92 },
            { text: "ZONA AMAN  •  DILARANG MASUK", color: PAL.pink, size: 62 },
          ],
          PAL.yellow,
          1024,
          256,
          16,
        ),
      ),
    [],
  );
  const dashes = Array.from({ length: 16 }, (_, i) => -36 + i * 5);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -10]} receiveShadow material={toon("#EFEADC")}>
        <planeGeometry args={[220, 120]} />
      </mesh>
      <Ink size={[120, 0.1, 9]} position={[0, 0.0, 13.2]} color={PAL.asphalt} t={0} r={0.02} />
      {dashes.map((x) => (
        <Ink key={x} size={[2.4, 0.04, 0.3]} position={[x, 0.07, 14.4]} color={PAL.white} t={0} r={0.01} shadow={false} />
      ))}
      <Ink size={[120, 0.3, 0.4]} position={[0, 0.15, 8.6]} color={PAL.white} t={0.06} r={0.05} />
      <Ink size={[120, 0.3, 0.4]} position={[0, 0.15, 17.8]} color={PAL.white} t={0.06} r={0.05} />
      {/* closed lane: hatched exclusion strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.06, 9.9]} material={hatch} receiveShadow>
        <planeGeometry args={[11.6, 2.2]} />
      </mesh>
      {/* hoarding with brand board */}
      <Ink size={[10.6, 2.4, 0.18]} position={[-0.4, 1.2, 7.2]} color={PAL.white} t={0.07} r={0.04} />
      <mesh position={[-0.4, 1.35, 7.31]} material={board}>
        <planeGeometry args={[6.4, 1.6]} />
      </mesh>
      {/* water-filled barriers + cones on the lane edge */}
      {Array.from({ length: 7 }, (_, i) => -5.8 + i * 1.8).map((x, i) => (
        <Ink key={x} size={[1.6, 0.9, 0.55]} position={[x, 0.45, 11.2]} color={i % 2 ? PAL.white : PAL.pink} t={0.06} r={0.14} />
      ))}
      {[-7.2, 6.0].map((x) => (
        <group key={x} position={[x, 0, 11.2]}>
          <mesh position={[0, 0.5, 0]} material={toon(PAL.orange)} castShadow>
            <coneGeometry args={[0.32, 1.0, 16]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} material={INK_MAT} scale={1.12}>
            <coneGeometry args={[0.32, 1.0, 16]} />
          </mesh>
        </group>
      ))}
      {/* vibration monitor on the left neighbour's wall */}
      <Ink size={[0.9, 0.7, 0.3]} position={[-6.2, 3.0, 4.2]} color={PAL.yellow} t={0.06} r={0.08} />
      <Ink size={[0.5, 0.25, 0.05]} position={[-6.2, 3.05, 4.38]} color={PAL.ink} t={0} r={0.02} shadow={false} />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Background city (seeded), clouds
export const City: React.FC = () => {
  const blocks = useMemo(() => {
    const rnd = prng(5803);
    const cols = ["#FFF09A", "#FFEB9E", "#FFF2A6", "#FFEDA4", "#FFF4AE"];
    const out: { x: number; z: number; w: number; d: number; h: number; c: string; s: number }[] = [];
    let x = -46;
    while (x < 46) {
      const w = 4 + rnd() * 5;
      out.push({ x: x + w / 2, z: -30 - rnd() * 6, w, d: 5 + rnd() * 3, h: 3 + rnd() * 4, c: cols[Math.floor(rnd() * cols.length)], s: Math.floor(rnd() * 1000) });
      x += w + 0.6 + rnd() * 1.4;
    }
    x = -60;
    while (x < 60) {
      const w = 5 + rnd() * 6;
      out.push({ x: x + w / 2, z: -60 - rnd() * 8, w, d: 6, h: 3 + rnd() * 4, c: cols[Math.floor(rnd() * cols.length)], s: Math.floor(rnd() * 1000) });
      x += w + 1 + rnd() * 2;
    }
    return out;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <Tower key={i} x={b.x} z={b.z} w={b.w} d={b.d} h={b.h} color={b.c} cols={Math.max(2, Math.round(b.w / 2.6))} seed={b.s} pane="#EEDC7C" lit="#FFF8D0" t={0.08} />
      ))}
    </group>
  );
};

export const Worker: React.FC<{ f: number; seed: number; pos: V3; heading: number; pose?: PoseName; vest?: string }> = ({ f, seed, pos, heading, pose = "stand", vest = PAL.orange }) => {
  const S = 1.7;
  return (
    <group>
      <ToyPerson f={f} seed={seed} pose={pose} position={pos} heading={heading} scale={S} outfit="casual" look={{ top: vest, bottom: "#1d2a4a", height: 1, hairStyle: 0 }} />
      {/* hard hat */}
      <group position={[pos[0], pos[1] + 0.93 * S, pos[2]]} rotation={[0, heading, 0]}>
        <mesh material={toon(PAL.white)} castShadow>
          <sphereGeometry args={[0.15 * S, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={toon(PAL.white)} position={[0, 0.005, 0.04 * S]}>
          <cylinderGeometry args={[0.17 * S, 0.17 * S, 0.015, 18]} />
        </mesh>
      </group>
    </group>
  );
};

export const World: React.FC<{ f: number }> = ({ f }) => {
  const crusher: V3 = [-3.0, TOP + 1.6, 1.3];
  return (
    <group>
      <ambientLight intensity={1.15} />
      <hemisphereLight args={["#ffffff", "#f3e6a0", 0.4]} />
      <directionalLight
        position={[-26, 48, 34]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
      />
      <City />
      {/* close neighbours */}
      <Tower x={-8.3} z={0.3} w={5.6} d={8} h={10.4} color={PAL.cyan} cols={3} seed={11} />
      <Tower x={8.4} z={0.2} w={6} d={8} h={13} color={PAL.pink} cols={3} seed={12} pane={PAL.ink} lit={PAL.yellow} />
      <MainBuilding />
      <Scaffold f={f} />
      <group position={[1.1, TOP + 0.02, 1.6]} rotation={[0, Math.PI, 0]} scale={1.15}>
        <Excavator f={f} />
      </group>
      <Crane f={f} />
      <MistCannon />
      <Street />
      {/* water: mist cannon arc to the work level, hose from the slab onto the crusher */}
      <Spray f={f} from={[-4.8, 3.6, 11.0]} to={[-3.0, TOP - 1.2, 5.6]} arc={4.0} n={380} seed={71} spread={2.4} size={0.17} puffs={3} />
      <Spray f={f} from={[2.4, TOP + 1.3, -1.6]} to={crusher} arc={1.2} n={110} seed={72} spread={0.6} size={0.1} puffs={2} />
      {/* concrete dust puffs at the crusher, damped by the spray */}
      {([[-3.9, TOP + 2.3, 1.6, 0.55], [-4.4, TOP + 1.6, 2.4, 0.42], [-3.3, TOP + 2.8, 0.6, 0.38]] as const).map(([x, y, z, r], i) => (
        <group key={i} position={[x, y + Math.sin(f / 50 + i) * 0.08, z]} scale={r}>
          <mesh material={toon("#D9D4C6")}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <mesh material={INK_MAT} scale={1.1}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
      ))}
      {/* workers: hose + remote operator on the slab, flagman and crew on the street */}
      <Worker f={f} seed={3} pos={[2.6, TOP, -1.9]} heading={-2.3} />
      <Worker f={f} seed={8} pos={[3.0, TOP, 2.6]} heading={-1.4} vest={PAL.green} />
      <Worker f={f} seed={14} pos={[-2.6, 0.1, 9.7]} heading={0.4} pose="wave" />
      <Worker f={f} seed={21} pos={[-4.0, 0.1, 13.6]} heading={-0.6} vest={PAL.green} />
      <Worker f={f} seed={27} pos={[3.2, 0.1, 10.0]} heading={0.2} />
    </group>
  );
};
