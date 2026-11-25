// AE-063 world (BUILDFORGE): procedural stadium bowl + cable-wheel roof (outer compression rings,
// inner tension ring, 40 radial cable trusses, membrane), space-frame roof for the JIS scene,
// bicycle wheel analogy, force arrows, AUDIRA board. Geometry follows research/RESEARCH_REPORT.md
// "Saran visual akurat": oval plan, columns only on the perimeter, open hole over the pitch.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";

export type V3 = [number, number, number];

// ---------------- palette ----------------
export const C = {
  concrete: "#ebe5d9",
  concreteDark: "#cfc6b6",
  steel: "#a9b2ba",
  cable: "#5d6670",
  membrane: "#f4f1ea",
  grass: "#73bd5c",
  grassDark: "#62ab4e",
  plaza: "#ddd6c8",
  land: "#9fce7f",
  tension: "#2f8dff",
  compress: "#ff7a2a",
  support: "#22b573",
  mint: "#7fe3c4",
  seatA: "#2f8f9d",
  seatB: "#e9eef0",
};

// ---------------- seeded random ----------------
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

// ---------------- (super)ellipse plan ----------------
/** Point on a superellipse with semi-axes ax (x) / az (z); p = 2 ellipse, p > 2 rounded rectangle. */
export const sup = (ax: number, az: number, th: number, y: number, p = 2): V3 => {
  const c = Math.cos(th), s = Math.sin(th);
  const e = 2 / p;
  return [ax * Math.sign(c) * Math.abs(c) ** e, y, az * Math.sign(s) * Math.abs(s) ** e];
};

export type Plan = {
  p: number;
  standIn: [number, number];
  standOut: [number, number];
  rows: number;
  rise: number;
  colR: [number, number];
  ringIn: [number, number];
  ringTop: number;
  ringLow: number;
  innerY: number;
};
/** Stadium in Stuttgart (oval, cable wheel). 1 unit ≈ 4 m. Long axis along z (portrait friendly). */
export const STUTT: Plan = { p: 2, standIn: [12.5, 17.5], standOut: [24, 29], rows: 12, rise: 0.74, colR: [26, 31], ringIn: [11.5, 16], ringTop: 13.4, ringLow: 10.6, innerY: 11.9 };
/** JIS-like rounded rectangle bowl (space frame scene). */
export const JIS: Plan = { p: 3.2, standIn: [11.5, 16.5], standOut: [24, 29], rows: 12, rise: 0.74, colR: [25.5, 30.5], ringIn: [12, 17], ringTop: 16, ringLow: 14, innerY: 15 };

// ---------------- materials ----------------
export const useMats = () => {
  const grain = useSurfaceGrain(63, 0.16, 6);
  const grain2 = useSurfaceGrain(91, 0.24, 3);
  return useMemo(() => {
    const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);
    const grassTex = (() => {
      const cv = document.createElement("canvas");
      cv.width = 64;
      cv.height = 512;
      const g = cv.getContext("2d")!;
      for (let i = 0; i < 10; i++) {
        g.fillStyle = i % 2 ? C.grass : C.grassDark;
        g.fillRect(0, i * 51.2, 64, 51.2);
      }
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    return {
      // poured concrete: grain drives both roughness and a fine bump so the surface reads as cast, not plastic
      concrete: phys({ ...POLISH.stone, color: C.concrete, roughness: 0.82, roughnessMap: grain, bumpMap: grain, bumpScale: 0.9 }),
      concreteDark: phys({ ...POLISH.stone, color: C.concreteDark, roughness: 0.9, roughnessMap: grain2, bumpMap: grain2, bumpScale: 1.2 }),
      seats: phys({ roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3, roughnessMap: grain2, vertexColors: true, color: "#ffffff", side: THREE.DoubleSide }),
      steel: phys({ color: C.steel, metalness: 0.92, roughness: 0.22, clearcoat: 0.4, clearcoatRoughness: 0.2, roughnessMap: grain2 }),
      cable: phys({ color: C.cable, metalness: 0.9, roughness: 0.24 }),
      /** painted steel ring (force colouring): metallic orange that still mirrors the sky */
      ringHot: phys({ color: C.compress, metalness: 0.78, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, emissive: C.compress, emissiveIntensity: 0.12 }),
      ringCool: phys({ color: C.tension, metalness: 0.78, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, emissive: C.tension, emissiveIntensity: 0.12 }),
      membrane: phys({ color: C.membrane, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color("#fff6e6"), transmission: 0, transparent: true, opacity: 0.86, side: THREE.DoubleSide }),
      grass: phys({ ...POLISH.fabric, color: "#ffffff", map: grassTex }),
      plaza: phys({ ...POLISH.stone, color: C.plaza }),
      land: phys({ ...POLISH.fabric, color: C.land }),
      lines: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 }),
      tension: phys({ color: C.tension, emissive: C.tension, emissiveIntensity: 0.55, metalness: 0.3, roughness: 0.3 }),
      compress: phys({ color: C.compress, emissive: C.compress, emissiveIntensity: 0.45, metalness: 0.3, roughness: 0.35 }),
      support: phys({ color: C.support, emissive: C.support, emissiveIntensity: 0.45, roughness: 0.4 }),
      ghost: phys({ color: C.mint, emissive: C.mint, emissiveIntensity: 0.6, transparent: true, opacity: 0.5, roughness: 0.4, depthWrite: false }),
      danger: phys({ color: "#ff4b3e", emissive: "#ff4b3e", emissiveIntensity: 0.5, transparent: true, opacity: 0.55, roughness: 0.4, depthWrite: false }),
      tree: phys({ ...POLISH.clay, color: "#5fa64a" }),
      trunk: phys({ ...POLISH.clay, color: "#8a6a4a" }),
      rubber: phys({ color: "#24272b", roughness: 0.7 }),
      chrome: phys({ color: "#e4e8ec", metalness: 1, roughness: 0.18 }),
      yellow: phys({ ...POLISH.toyPlastic, color: "#ffc531" }),
    };
  }, [grain, grain2]);
};
export type Mats = ReturnType<typeof useMats>;

// ---------------- geometry helpers ----------------
const quadStrip = (pos: number[], col: number[], a0: V3, a1: V3, b0: V3, b1: V3, c: THREE.Color) => {
  // a0-a1 is one edge, b0-b1 the opposite edge
  pos.push(...a0, ...b0, ...a1, ...a1, ...b0, ...b1);
  for (let i = 0; i < 6; i++) col.push(c.r, c.g, c.b);
};

/** Stepped bowl of `rows` tiers. `maxRows` lets the JIS scene show an unfinished bowl. */
export const useBowlGeo = (P: Plan, maxRows = P.rows, seg = 160) =>
  useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const cA = new THREE.Color(C.seatA), cB = new THREE.Color(C.seatB), cR = new THREE.Color(C.concreteDark);
    const ax = (s: number) => P.standIn[0] + (P.standOut[0] - P.standIn[0]) * s;
    const az = (s: number) => P.standIn[1] + (P.standOut[1] - P.standIn[1]) * s;
    for (let j = 0; j < maxRows; j++) {
      const s0 = j / P.rows, s1 = (j + 1) / P.rows;
      const y0 = 0.6 + j * P.rise, y1 = y0 + P.rise;
      const tread = j % 4 === 3 ? cR : j % 2 ? cA : cB;
      for (let i = 0; i < seg; i++) {
        const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
        // riser (vertical)
        quadStrip(pos, col, sup(ax(s0), az(s0), t0, y0, P.p), sup(ax(s0), az(s0), t1, y0, P.p), sup(ax(s0), az(s0), t0, y1, P.p), sup(ax(s0), az(s0), t1, y1, P.p), cR);
        // tread (horizontal)
        quadStrip(pos, col, sup(ax(s0), az(s0), t0, y1, P.p), sup(ax(s0), az(s0), t1, y1, P.p), sup(ax(s1), az(s1), t0, y1, P.p), sup(ax(s1), az(s1), t1, y1, P.p), tread);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [P, maxRows, seg]);

/** Closed (super)ellipse tube. */
export const ringGeo = (ax: number, az: number, y: number, r: number, p = 2, n = 120) => {
  const pts = Array.from({ length: n }, (_, i) => new THREE.Vector3(...sup(ax, az, (i / n) * Math.PI * 2, y, p)));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), n * 2, r, 10, true);
};

/** Cylinder between two points (for instancing: unit cylinder along y). */
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);
export const rodMatrix = (a: V3, b: V3, r: number) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va);
  const len = d.length();
  tmpQ.setFromUnitVectors(UP, d.normalize());
  return tmpM.clone().compose(va.add(vb).multiplyScalar(0.5), tmpQ, new THREE.Vector3(r, len, r));
};

export const Rod: React.FC<{ a: V3; b: V3; r: number; mat: THREE.Material; cast?: boolean }> = ({ a, b, r, mat, cast = true }) => {
  const m = useMemo(() => rodMatrix(a, b, r), [a, b, r]);
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  m.decompose(p, q, s);
  return (
    <mesh position={p} quaternion={q} scale={s} material={mat} castShadow={cast}>
      <cylinderGeometry args={[1, 1, 1, 10]} />
    </mesh>
  );
};

/** Instanced rods + spheres built before first draw. */
export const InstancedRods: React.FC<{ rods: [V3, V3][]; r: number; mat: THREE.Material; count?: number }> = ({ rods, r, mat, count }) => {
  const mesh = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 1, 8);
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, rods.length));
    rods.forEach(([a, b], i) => m.setMatrixAt(i, rodMatrix(a, b, r)));
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, [rods, r, mat]);
  useLayoutEffect(() => {
    mesh.count = count === undefined ? rods.length : Math.max(0, Math.min(rods.length, Math.floor(count)));
  }, [mesh, count, rods.length]);
  return <primitive object={mesh} />;
};

// ---------------- stadium parts ----------------
export const Ground: React.FC<{ m: Mats; P: Plan }> = ({ m, P }) => {
  const plaza = useMemo(() => {
    const s = new THREE.Shape();
    const n = 96;
    for (let i = 0; i <= n; i++) {
      const [x, , z] = sup(P.colR[0] + 9, P.colR[1] + 9, (i / n) * Math.PI * 2, 0, P.p);
      if (i === 0) s.moveTo(x, z);
      else s.lineTo(x, z);
    }
    return new THREE.ShapeGeometry(s, 4).rotateX(Math.PI / 2);
  }, [P]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={m.land} receiveShadow>
        <circleGeometry args={[420, 48]} />
      </mesh>
      <mesh geometry={plaza} position={[0, 0.0, 0]} material={m.plaza} receiveShadow scale={[1, 1, 1]} rotation={[Math.PI, 0, 0]} />
    </group>
  );
};

export const Pitch: React.FC<{ m: Mats }> = ({ m }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={m.grass} receiveShadow>
      <planeGeometry args={[20, 30]} />
    </mesh>
    {/* touch lines + halfway + centre circle */}
    {[
      [0, -12.9, 17, 0.12],
      [0, 12.9, 17, 0.12],
      [0, 0, 17, 0.12],
    ].map(([x, z, w, d], i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.07, z]} material={m.lines}>
        <planeGeometry args={[w, d]} />
      </mesh>
    ))}
    {[-8.5, 8.5].map((x) => (
      <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.07, 0]} material={m.lines}>
        <planeGeometry args={[0.12, 25.9]} />
      </mesh>
    ))}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} material={m.lines}>
      <ringGeometry args={[2.2, 2.34, 48]} />
    </mesh>
  </group>
);

/** One seated spectator: feet/seat base point, heading (0 faces +z), bob phase. */
export type Seat = { p: V3; h: number; ph: number };
const SKIN = ["#f3cfb3", "#e6b28c", "#d09a6c", "#b47a52", "#91603f", "#6e4730"];
const HAIR = ["#1b1411", "#2a1c14", "#432a1b", "#6e4426", "#b88b55"];
const SHIRT = ["#e84a3c", "#f4f1ea", "#2b4c7e", "#ffcf3f", "#1f8a70", "#ff8c42", "#3a7bd5", "#222831", "#c2185b", "#7fb3d5"];

/**
 * Instanced spectators that read as people, not capsules: shoulders wider than the waist (scaled
 * torso), a skin-tone head and a hair cap (no face detail, no real likeness). Three instanced
 * meshes built and coloured in useMemo before the first draw; a deterministic cheer bob per frame.
 */
export const People: React.FC<{ seats: Seat[]; s?: number; seed?: number; f: number; cast?: boolean }> = ({ seats, s = 1, seed = 7, f, cast = false }) => {
  const meshes = useMemo(() => {
    const r = rng(seed);
    const n = Math.max(1, seats.length);
    const torsoGeo = new THREE.CapsuleGeometry(0.15, 0.2, 4, 10);
    const headGeo = new THREE.SphereGeometry(0.105, 14, 10);
    const hairGeo = new THREE.SphereGeometry(0.112, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const mk = (g: THREE.BufferGeometry, rough: number) => {
      const im = new THREE.InstancedMesh(g, new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: rough, clearcoat: 0.15 }), n);
      im.castShadow = cast;
      im.receiveShadow = true;
      return im;
    };
    const torso = mk(torsoGeo, 0.75), head = mk(headGeo, 0.55), hair = mk(hairGeo, 0.85);
    const look = seats.map(() => ({ shirt: new THREE.Color(SHIRT[Math.floor(r() * SHIRT.length)]), skin: new THREE.Color(SKIN[Math.floor(r() * SKIN.length)]), hair: new THREE.Color(HAIR[Math.floor(r() * HAIR.length)]) }));
    look.forEach((l, i) => {
      torso.setColorAt(i, l.shirt);
      head.setColorAt(i, l.skin);
      hair.setColorAt(i, l.hair);
    });
    [torso, head, hair].forEach((im) => im.instanceColor && (im.instanceColor.needsUpdate = true));
    return { torso, head, hair, look };
  }, [seats, seed, cast]);
  useLayoutEffect(() => {
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const v = new THREE.Vector3(), sc = new THREE.Vector3();
    seats.forEach((it, i) => {
      const bob = Math.max(0, Math.sin(f * 0.09 + it.ph)) * 0.07 * s;
      q.setFromEuler(e.set(0, it.h, 0));
      v.set(it.p[0], it.p[1] + (0.24 * s) + bob, it.p[2]);
      meshes.torso.setMatrixAt(i, M.compose(v, q, sc.set(1.3 * s, 1 * s, 0.8 * s)));
      v.set(it.p[0], it.p[1] + 0.58 * s + bob, it.p[2]);
      meshes.head.setMatrixAt(i, M.compose(v, q, sc.set(s, s, s)));
      v.set(it.p[0], it.p[1] + 0.6 * s + bob, it.p[2]);
      meshes.hair.setMatrixAt(i, M.compose(v, q, sc.set(s, s, s)));
    });
    [meshes.torso, meshes.head, meshes.hair].forEach((im) => (im.instanceMatrix.needsUpdate = true));
  }, [meshes, seats, f, s]);
  return (
    <>
      <primitive object={meshes.torso} />
      <primitive object={meshes.head} />
      <primitive object={meshes.hair} />
    </>
  );
};

/** Spectators on the bowl treads, facing the pitch. */
export const Crowd: React.FC<{ P: Plan; maxRows?: number; fill?: number; seed?: number; f: number }> = ({ P, maxRows = P.rows, fill = 0.82, seed = 7, f }) => {
  const seats = useMemo(() => {
    const r = rng(seed);
    const items: Seat[] = [];
    for (let j = 0; j < maxRows; j++) {
      if (j % 4 === 3) continue;
      const s = (j + 0.55) / P.rows;
      const ax = P.standIn[0] + (P.standOut[0] - P.standIn[0]) * s;
      const az = P.standIn[1] + (P.standOut[1] - P.standIn[1]) * s;
      const n = Math.round(150 + j * 9);
      for (let i = 0; i < n; i++) {
        if (r() > fill) continue;
        const th = ((i + r() * 0.3) / n) * Math.PI * 2;
        const y = 0.6 + (j + 1) * P.rise;
        const p = sup(ax, az, th, y, P.p);
        items.push({ p, h: Math.atan2(-p[0], -p[2]), ph: r() * 6.28 });
      }
    }
    return items;
  }, [P, maxRows, fill, seed]);
  return <People seats={seats} s={0.78} seed={seed} f={f} />;
};

export const Bowl: React.FC<{ m: Mats; P: Plan; maxRows?: number }> = ({ m, P, maxRows = P.rows }) => {
  const geo = useBowlGeo(P, maxRows);
  const top = 0.6 + maxRows * P.rise;
  const facade = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 160, 1, true);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={m.seats} castShadow receiveShadow />
      {/* outer facade wall (ellipse via non-uniform scale) */}
      {P.p === 2 ? (
        <mesh geometry={facade} material={m.concrete} position={[0, top / 2, 0]} scale={[P.standOut[0] + 0.2, top, P.standOut[1] + 0.2]} castShadow receiveShadow />
      ) : (
        <SupWall P={P} h={top} m={m} />
      )}
      {/* podium ring at pitch level */}
      <mesh material={m.concreteDark} position={[0, 0.3, 0]} scale={[P.standIn[0], 0.6, P.standIn[1]]}>
        <cylinderGeometry args={[1, 1, 1, 120, 1, true]} />
      </mesh>
    </group>
  );
};

const SupWall: React.FC<{ P: Plan; h: number; m: Mats }> = ({ P, h, m }) => {
  const geo = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const c = new THREE.Color("#ffffff");
    const n = 160;
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2;
      const ax = P.standOut[0] + 0.2, az = P.standOut[1] + 0.2;
      quadStrip(pos, col, sup(ax, az, t0, 0, P.p), sup(ax, az, t1, 0, P.p), sup(ax, az, t0, h, P.p), sup(ax, az, t1, h, P.p), c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }, [P, h]);
  const mat = useMemo(() => {
    const x = m.concrete.clone();
    x.side = THREE.DoubleSide;
    return x;
  }, [m]);
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
};

export const N_RAD = 40;
const radTh = (i: number) => ((i + 0.5) / N_RAD) * Math.PI * 2;

/** Perimeter columns (only at the outer edge). */
export const Columns: React.FC<{ m: Mats; P: Plan; n?: number; mat?: THREE.Material; h?: number }> = ({ m, P, n = N_RAD, mat, h }) => {
  const H = h ?? P.ringTop;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const th = ((i + 0.5) / n) * Math.PI * 2;
        const [x, , z] = sup(P.colR[0], P.colR[1], th, 0, P.p);
        return (
          <mesh key={i} position={[x, H / 2, z]} material={mat ?? m.concrete} castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.55, H, 14]} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------- cable wheel roof ----------------
const upperCurve = (P: Plan, i: number) => {
  const th = radTh(i);
  const o = sup(P.colR[0], P.colR[1], th, P.ringTop, P.p);
  const n = sup(P.ringIn[0], P.ringIn[1], th, P.innerY, P.p);
  return (u: number): V3 => [o[0] + (n[0] - o[0]) * u, P.ringTop + (P.innerY - P.ringTop) * u + 0.35 * Math.sin(Math.PI * u), o[2] + (n[2] - o[2]) * u];
};
const lowerCurve = (P: Plan, i: number) => {
  const th = radTh(i);
  const o = sup(P.colR[0], P.colR[1], th, P.ringLow, P.p);
  const n = sup(P.ringIn[0], P.ringIn[1], th, P.innerY, P.p);
  return (u: number): V3 => [o[0] + (n[0] - o[0]) * u, P.ringLow + (P.innerY - P.ringLow) * u - 0.45 * Math.sin(Math.PI * u), o[2] + (n[2] - o[2]) * u];
};
export const innerPoint = (P: Plan, i: number): V3 => sup(P.ringIn[0], P.ringIn[1], radTh(i), P.innerY, P.p);
export const outerPoint = (P: Plan, i: number, low = false): V3 => sup(P.colR[0], P.colR[1], radTh(i), low ? P.ringLow : P.ringTop, P.p);
export const cablePoint = (P: Plan, i: number, u: number): V3 => upperCurve(P, i)(u);

const tubeFrom = (fn: (u: number) => V3, r: number) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, k) => new THREE.Vector3(...fn(k / 12)))), 24, r, 6, false);

export type RoofState = {
  /** 0..1 inner tension ring visible / lifted. */
  inner: number;
  /** 0..1 outer compression rings. */
  outer: number;
  /** cables drawn, 0..40 (fractional = growing). */
  cables: number;
  /** membrane panels 0..40. */
  membrane: number;
  /** highlight colouring (force diagram). */
  colour?: boolean;
  /** inner ring rises from the pitch to its seat (construction). */
  innerLift?: number;
};

export const CableRoof: React.FC<{ m: Mats; P: Plan; s: RoofState }> = ({ m, P, s }) => {
  const geos = useMemo(() => {
    const up: THREE.TubeGeometry[] = [];
    const lo: THREE.TubeGeometry[] = [];
    const hang: [V3, V3][] = [];
    for (let i = 0; i < N_RAD; i++) {
      const U = upperCurve(P, i), L = lowerCurve(P, i);
      up.push(tubeFrom(U, 0.09));
      lo.push(tubeFrom(L, 0.07));
      for (const u of [0.25, 0.5, 0.75]) hang.push([U(u), L(u)]);
    }
    const outerTop = ringGeo(P.colR[0], P.colR[1], P.ringTop, 0.55, P.p);
    const outerLow = ringGeo(P.colR[0], P.colR[1], P.ringLow, 0.45, P.p);
    const inner = ringGeo(P.ringIn[0], P.ringIn[1], P.innerY, 0.32, P.p);
    // membrane: one surface on the upper cables, valleys between them
    const pos: number[] = [];
    const idx: number[] = [];
    const NU = 10, NV = 6;
    const panelStart: number[] = [];
    for (let i = 0; i < N_RAD; i++) {
      panelStart.push(idx.length);
      const A = upperCurve(P, i), B = upperCurve(P, (i + 1) % N_RAD);
      const base = pos.length / 3;
      for (let a = 0; a <= NU; a++) {
        const u = a / NU;
        const pa = A(u), pb = B(u);
        for (let b = 0; b <= NV; b++) {
          const v = b / NV;
          const sag = 0.7 * Math.sin(Math.PI * v) * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
          pos.push(pa[0] + (pb[0] - pa[0]) * v, pa[1] + (pb[1] - pa[1]) * v - 0.14 - sag, pa[2] + (pb[2] - pa[2]) * v);
        }
      }
      for (let a = 0; a < NU; a++)
        for (let b = 0; b < NV; b++) {
          const q = base + a * (NV + 1) + b;
          idx.push(q, q + NV + 1, q + 1, q + 1, q + NV + 1, q + NV + 2);
        }
    }
    panelStart.push(idx.length);
    const mem = new THREE.BufferGeometry();
    mem.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    mem.setIndex(idx);
    mem.computeVertexNormals();
    return { up, lo, hang, outerTop, outerLow, inner, mem, panelStart };
  }, [P]);

  useLayoutEffect(() => {
    const n = Math.max(0, Math.min(N_RAD, s.membrane));
    geos.mem.setDrawRange(0, geos.panelStart[Math.floor(n)] ?? geos.panelStart[N_RAD]);
  }, [geos, s.membrane]);

  const col = !!s.colour;
  const innerY = (s.innerLift ?? 1) < 1 ? -(1 - (s.innerLift ?? 1)) * (P.innerY - 0.4) : 0;
  const cablesShown = s.cables;
  return (
    <group>
      {s.outer > 0 && (
        <group scale={[1, Math.max(0.001, s.outer), 1]}>
          <mesh geometry={geos.outerTop} material={col ? m.ringHot : m.steel} castShadow />
          <mesh geometry={geos.outerLow} material={col ? m.ringHot : m.steel} castShadow />
        </group>
      )}
      {s.inner > 0 && (
        <group position={[0, innerY, 0]} scale={[1, 1, 1]}>
          <mesh geometry={geos.inner} material={col ? m.ringCool : m.cable} castShadow scale={[1, 1, 1]} />
        </group>
      )}
      {geos.up.map((g, i) => {
        const k = Math.max(0, Math.min(1, cablesShown - i));
        if (k <= 0) return null;
        return <CableTube key={i} g={g} k={k} mat={col ? m.tension : m.cable} />;
      })}
      {geos.lo.map((g, i) => {
        const k = Math.max(0, Math.min(1, cablesShown - i));
        if (k <= 0) return null;
        return <CableTube key={`l${i}`} g={g} k={k} mat={col ? m.tension : m.cable} />;
      })}
      <InstancedRods rods={geos.hang} r={0.05} mat={m.cable} count={Math.floor(Math.max(0, cablesShown)) * 3} />
      {s.membrane > 0 && <mesh geometry={geos.mem} material={m.membrane} castShadow receiveShadow />}
    </group>
  );
};

const CableTube: React.FC<{ g: THREE.TubeGeometry; k: number; mat: THREE.Material }> = ({ g, k, mat }) => {
  // grow from the outer ring toward the centre: clone the index range lazily via drawRange on a per-mesh clone
  const geo = useMemo(() => g.clone(), [g]);
  useLayoutEffect(() => {
    const total = geo.index ? geo.index.count : 0;
    geo.setDrawRange(0, Math.floor((total * k) / 6) * 6);
  }, [geo, k]);
  return <mesh geometry={geo} material={mat} castShadow />;
};

// ---------------- AUDIRA board (in-world brand) ----------------
export const labelTexture = (lines: string[], bg: string, fg: string, w = 1024, h = 256, accent = "#ff7a2a") => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = accent;
  g.fillRect(0, h - h * 0.08, w, h * 0.08);
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (lines.length === 1) {
    g.font = `800 ${Math.round(h * 0.56)}px Manrope, 'Segoe UI', sans-serif`;
    g.fillText(lines[0], w / 2, h * 0.48);
  } else {
    g.font = `800 ${Math.round(h * 0.4)}px Manrope, 'Segoe UI', sans-serif`;
    g.fillText(lines[0], w / 2, h * 0.34);
    g.font = `600 ${Math.round(h * 0.2)}px Manrope, 'Segoe UI', sans-serif`;
    g.fillText(lines[1], w / 2, h * 0.72);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const Board: React.FC<{ lines: string[]; pos: V3; rotY?: number; w: number; h?: number; bg?: string; fg?: string }> = ({ lines, pos, rotY = 0, w, h, bg = "#0f2a33", fg = "#ffffff" }) => {
  const tex = useMemo(() => labelTexture(lines, bg, fg), [lines, bg, fg]);
  const H = h ?? w / 4;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.08]} castShadow>
        <RoundedBoxGeo args={[w + 0.3, H + 0.3, 0.14]} radius={0.06} />
        <meshPhysicalMaterial color="#20262b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, H]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------------- bicycle wheel analogy (procedural, 32 spokes) ----------------
export const BikeWheel: React.FC<{ m: Mats; r: number; colour?: boolean; opacity?: number }> = ({ m, r, colour, opacity = 1 }) => {
  const spokes = useMemo(() => {
    const out: [V3, V3][] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const side = i % 2 ? 0.05 : -0.05;
      out.push([[Math.cos(a) * r * 0.06, side * r, Math.sin(a) * r * 0.06], [Math.cos(a + 0.12) * r * 0.95, 0, Math.sin(a + 0.12) * r * 0.95]]);
    }
    return out;
  }, [r]);
  const fade = useMemo(() => {
    if (opacity >= 1) return null;
    const mk = (base: THREE.MeshPhysicalMaterial) => {
      const x = base.clone();
      x.transparent = true;
      x.opacity = opacity;
      x.depthWrite = false;
      return x;
    };
    return { rim: mk(colour ? m.compress : m.chrome), tyre: mk(m.rubber), spoke: mk(colour ? m.tension : m.chrome), hub: mk(colour ? m.tension : m.chrome) };
  }, [opacity, colour, m]);
  const rim = fade?.rim ?? (colour ? m.compress : m.chrome);
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={fade?.tyre ?? m.rubber} castShadow>
        <torusGeometry args={[r, r * 0.045, 12, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={rim} castShadow>
        <torusGeometry args={[r * 0.955, r * 0.022, 10, 96]} />
      </mesh>
      <mesh material={fade?.hub ?? (colour ? m.tension : m.chrome)} castShadow>
        <cylinderGeometry args={[r * 0.06, r * 0.06, r * 0.12, 20]} />
      </mesh>
      <InstancedRods rods={spokes} r={r * 0.006} mat={fade?.spoke ?? (colour ? m.tension : m.chrome)} />
    </group>
  );
};

// ---------------- force arrow ----------------
export const Arrow: React.FC<{ from: V3; dir: V3; len: number; mat: THREE.Material; r?: number }> = ({ from, dir, len, mat, r = 0.18 }) => {
  if (len <= 0.02) return null;
  const d = new THREE.Vector3(...dir).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
  const head = Math.min(len * 0.45, r * 4);
  const shaft = len - head;
  const o = new THREE.Vector3(...from);
  return (
    <group position={o} quaternion={q}>
      {shaft > 0 && (
        <mesh position={[0, shaft / 2, 0]} material={mat}>
          <cylinderGeometry args={[r, r, shaft, 12]} />
        </mesh>
      )}
      <mesh position={[0, shaft + head / 2, 0]} material={mat}>
        <coneGeometry args={[r * 2.4, head, 16]} />
      </mesh>
    </group>
  );
};

// ---------------- trees around the site ----------------
export const Trees: React.FC<{ m: Mats; P: Plan; seed?: number }> = ({ m, P, seed = 3 }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    const out: { p: V3; s: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const th = r() * Math.PI * 2;
      const k = 1.55 + r() * 0.9;
      const [x, , z] = sup(P.colR[0] * k, P.colR[1] * k, th, 0, 2);
      out.push({ p: [x, 0, z], s: 1.4 + r() * 1.4 });
    }
    return out;
  }, [P, seed]);
  return (
    <group>
      {items.map((t, i) => (
        <group key={i} position={t.p} scale={t.s}>
          <mesh position={[0, 0.6, 0]} material={m.trunk} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
          </mesh>
          <mesh position={[0, 1.6, 0]} material={m.tree} castShadow>
            <sphereGeometry args={[0.85, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------- space frame (JIS, PAYOFF) ----------------
export const useSpaceFrame = (P: Plan, spacing = 2.2, depth = 1.7) =>
  useMemo(() => {
    const out = [P.colR[0] + 0.8, P.colR[1] + 0.8];
    const inn = P.ringIn;
    const inside = (x: number, z: number) => {
      const no = Math.abs(x / out[0]) ** P.p + Math.abs(z / out[1]) ** P.p;
      const ni = Math.abs(x / inn[0]) ** P.p + Math.abs(z / inn[1]) ** P.p;
      return no <= 1 && ni >= 1;
    };
    const top: Map<string, V3> = new Map();
    const nx = Math.ceil(out[0] / spacing), nz = Math.ceil(out[1] / spacing);
    for (let i = -nx; i <= nx; i++) for (let j = -nz; j <= nz; j++) {
      const x = i * spacing, z = j * spacing;
      if (inside(x, z)) top.set(`${i},${j}`, [x, 0, z]);
    }
    const rodsTop: [V3, V3][] = [];
    const rodsBot: [V3, V3][] = [];
    const rodsDiag: [V3, V3][] = [];
    const nodes: V3[] = [];
    top.forEach((p, key) => {
      nodes.push(p);
      const [i, j] = key.split(",").map(Number);
      const r = top.get(`${i + 1},${j}`), u = top.get(`${i},${j + 1}`);
      if (r) rodsTop.push([p, r]);
      if (u) rodsTop.push([p, u]);
      // bottom node in the cell centre if all 4 corners exist
      const a = top.get(`${i + 1},${j + 1}`);
      if (r && u && a) {
        const b: V3 = [p[0] + spacing / 2, -depth, p[2] + spacing / 2];
        nodes.push(b);
        rodsDiag.push([b, p], [b, r], [b, u], [b, a]);
        const br = top.get(`${i + 2},${j}`) && top.get(`${i + 2},${j + 1}`) ? ([b[0] + spacing, -depth, b[2]] as V3) : null;
        const bu = top.get(`${i},${j + 2}`) && top.get(`${i + 1},${j + 2}`) ? ([b[0], -depth, b[2] + spacing] as V3) : null;
        if (br) rodsBot.push([b, br]);
        if (bu) rodsBot.push([b, bu]);
      }
    });
    return { rodsTop, rodsBot, rodsDiag, nodes };
  }, [P, spacing, depth]);

export const SpaceFrame: React.FC<{ m: Mats; P: Plan; built: number; nodeMat?: THREE.Material }> = ({ m, P, built, nodeMat }) => {
  const sf = useSpaceFrame(P);
  const nodeMesh = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 8), nodeMat ?? m.chrome, sf.nodes.length);
    const M = new THREE.Matrix4();
    sf.nodes.forEach((p, i) => im.setMatrixAt(i, M.makeTranslation(...p)));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    return im;
  }, [sf, m, nodeMat]);
  const all = sf.rodsTop.length + sf.rodsBot.length + sf.rodsDiag.length;
  const k = Math.max(0, Math.min(1, built));
  return (
    <group>
      <InstancedRods rods={sf.rodsTop} r={0.07} mat={m.steel} count={sf.rodsTop.length * k} />
      <InstancedRods rods={sf.rodsBot} r={0.06} mat={m.steel} count={sf.rodsBot.length * k} />
      <InstancedRods rods={sf.rodsDiag} r={0.05} mat={m.steel} count={sf.rodsDiag.length * k} />
      <primitive object={nodeMesh} />
      {void all}
    </group>
  );
};
