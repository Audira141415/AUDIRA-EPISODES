// EP03 Zamzam: the cutaway world. Ground block cut on the plane z = 0, the well halved by the cut.
// Every layer is an extruded footprint (top view) with the well / basement cavities cut into its
// front edge, so cut faces, cavity walls and caps share one geometry and never z-fight.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { L, PAL } from "./layout.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";

type Notch =
  | { kind: "well"; r: number }
  | { kind: "room" }
  | { kind: "none" };

/** Footprint in shape space (x, s) with s = -z (s grows into the block). */
function footprint(notch: Notch): THREE.Shape {
  const W = L.halfW, D = L.depth;
  const sh = new THREE.Shape();
  sh.moveTo(-W, 0);
  if (notch.kind === "well") {
    sh.lineTo(-notch.r, 0);
    sh.absarc(0, 0, notch.r, Math.PI, 0, true);
  } else if (notch.kind === "room") {
    const rw = L.roomHalfW;
    sh.lineTo(-rw, 0);
    sh.lineTo(-rw, L.roomDepth);
    sh.lineTo(rw, L.roomDepth);
    sh.lineTo(rw, L.tunnelDepth);
    sh.lineTo(W, L.tunnelDepth);
  }
  if (notch.kind !== "room") sh.lineTo(W, 0);
  sh.lineTo(W, D);
  sh.lineTo(-W, D);
  sh.closePath();
  return sh;
}

/** Extrude a footprint upward from y0 to y1 (caps = group 0, walls/cut faces = group 1). */
function layerGeo(notch: Notch, y0: number, y1: number) {
  const g = new THREE.ExtrudeGeometry(footprint(notch), { depth: y1 - y0, bevelEnabled: false, curveSegments: 48 });
  // shape (x, s, e) -> world (x, e, -s): rotateX(-90deg) maps s to -z and the extrusion to +y
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  g.computeVertexNormals();
  return g;
}

/** Seeded masonry courses for the well lining (stone blocks with mortar). */
function masonryTexture(seed = 11) {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  g.fillStyle = "#9c8b73";
  g.fillRect(0, 0, 512, 512);
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    const h = 512 / rows;
    let x = r % 2 ? -40 : 0;
    while (x < 512) {
      const w = 70 + rnd() * 60;
      const l = 68 + rnd() * 16;
      g.fillStyle = `hsl(${32 + rnd() * 8}, ${22 + rnd() * 10}%, ${l}%)`;
      g.fillRect(x + 3, r * h + 3, w - 6, h - 6);
      x += w;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(2, 6);
  return t;
}

/** Marble tile grid for the mataf floor. */
function marbleTexture(seed = 5) {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const l = 94 + rnd() * 4;
      g.fillStyle = `hsl(36, 18%, ${l}%)`;
      g.fillRect(i * 128, j * 128, 128, 128);
      g.strokeStyle = "rgba(150,140,125,0.18)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(i * 128 + rnd() * 128, j * 128);
      g.bezierCurveTo(i * 128 + rnd() * 128, j * 128 + 40, i * 128 + rnd() * 128, j * 128 + 90, i * 128 + rnd() * 128, j * 128 + 128);
      g.stroke();
    }
  g.strokeStyle = "rgba(120,110,95,0.35)";
  g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const Layer: React.FC<{ notch: Notch; y0: number; y1: number; cap: THREE.Material; side: THREE.Material }> = ({ notch, y0, y1, cap, side }) => {
  const geo = useMemo(() => layerGeo(notch, y0, y1), [notch, y0, y1]);
  return <mesh geometry={geo} material={[cap, side]} castShadow receiveShadow />;
};

/** Half pipe (back half, z <= 0) between y0 and y1, seen from inside. */
const HalfTube: React.FC<{ r: number; y0: number; y1: number; children: React.ReactNode; fx?: boolean }> = ({ r, y0, y1, children, fx }) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, y1 - y0, 48, 1, true, Math.PI / 2, Math.PI), [r, y0, y1]);
  return (
    <mesh geometry={geo} position={[0, (y0 + y1) / 2, 0]} receiveShadow layers={fx ? FX_LAYER : 0}>
      {children}
    </mesh>
  );
};

/** Straight pipe between two points. */
const Pipe: React.FC<{ a: [number, number, number]; b: [number, number, number]; r: number; mat: THREE.Material }> = ({ a, b, r, mat }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: va.clone().add(vb).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={mat} castShadow>
      <cylinderGeometry args={[r, r, len, 24]} />
    </mesh>
  );
};

/** Tawaf crowd as small faceless points circling the Ka'bah counter-clockwise (seen from above). */
const Crowd: React.FC<{ f: number }> = ({ f }) => {
  const data = useMemo(() => {
    const rnd = prng(73);
    const pts: { rho: number; a: number; w: number }[] = [];
    for (let i = 0; i < 2600; i++) {
      const rho = 9.5 + Math.pow(rnd(), 1.2) * 56;
      // walking pace about 0.7-1.1 m/s, so inner rings turn faster
      pts.push({ rho, a: rnd() * Math.PI * 2, w: (0.7 + rnd() * 0.4) / rho });
    }
    const bodyM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.26, 1.35, 8), new THREE.MeshStandardMaterial({ color: PAL.pilgrim, roughness: 0.85 }), pts.length);
    const headM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: "#e9e2d6", roughness: 0.8 }), pts.length);
    bodyM.castShadow = headM.castShadow = true;
    bodyM.frustumCulled = headM.frustumCulled = false;
    return { pts, bodyM, headM };
  }, []);
  useLayoutEffect(() => {
    const k = L.kaaba;
    const m = new THREE.Matrix4();
    const t = f / 60;
    data.pts.forEach((p, i) => {
      const a = p.a + p.w * t; // counter-clockwise seen from +y
      const x = k.x + Math.cos(a) * p.rho * 1.05;
      const z = k.z - Math.sin(a) * p.rho;
      const inside = z < -0.9 && z > -L.depth + 1 && Math.abs(x) < L.halfW - 1 && Math.hypot(x + 26, z + 12) > 6;
      const sc = inside ? 1 : 0;
      m.makeScale(sc, sc, sc).setPosition(x, 0.68, z);
      data.bodyM.setMatrixAt(i, m);
      m.makeScale(sc, sc, sc).setPosition(x, 1.5, z);
      data.headM.setMatrixAt(i, m);
    });
    data.bodyM.instanceMatrix.needsUpdate = true;
    data.headM.instanceMatrix.needsUpdate = true;
  }, [data, f]);
  return (
    <>
      <primitive object={data.bodyM} />
      <primitive object={data.headM} />
    </>
  );
};

const Kaaba: React.FC = () => {
  const k = L.kaaba;
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: PAL.gold, metalness: 1, roughness: 0.28 }), []);
  return (
    <group position={[k.x, 0, k.z]} rotation={[0, k.rotY, 0]}>
      {/* shadharwan base */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[k.w + 0.8, 0.4, k.d + 0.8]} radius={0.12} />
        <meshPhysicalMaterial {...POLISH.stone} color="#f6f3ee" />
      </mesh>
      <mesh position={[0, k.h / 2 + 0.4, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[k.w, k.h, k.d]} radius={0.18} />
        <meshPhysicalMaterial {...POLISH.fabric} color={PAL.kaaba} sheenColor={new THREE.Color("#3a3a3a")} />
      </mesh>
      {/* gold band of the kiswah */}
      <mesh position={[0, k.h * 0.68 + 0.4, 0]} material={gold}>
        <boxGeometry args={[k.w + 0.06, 1.0, k.d + 0.06]} />
      </mesh>
      {/* door on the east-facing side, raised above the ground */}
      <mesh position={[k.w * 0.18, 2.2 + 0.4 + 1.6, k.d / 2 + 0.05]} material={gold}>
        <boxGeometry args={[2.0, 3.2, 0.1]} />
      </mesh>
      {/* Hajar Aswad corner: small silver frame */}
      <mesh position={[k.w / 2 - 0.05, 1.5 + 0.4, k.d / 2 - 0.05]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.55, 0.75, 0.12]} />
        <meshPhysicalMaterial color="#d8dbde" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
};

/** Low arcade at the back edge of the plaza (the mosque around the mataf), to close the horizon. */
const Arcade: React.FC = () => {
  const n = 90;
  const z = -L.depth + 1.6;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = -L.halfW + 2 + (i * (2 * L.halfW - 4)) / (n - 1);
        return (
          <mesh key={i} position={[x, 3.2, z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[1.0, 6.4, 1.0]} radius={0.12} />
            <meshPhysicalMaterial {...POLISH.stone} color="#ece4d6" />
          </mesh>
        );
      })}
      <mesh position={[0, 7.0, z]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2 * L.halfW, 1.4, 2.6]} radius={0.2} />
        <meshPhysicalMaterial {...POLISH.stone} color="#e6dccb" />
      </mesh>
      <mesh position={[0, 4, z - 2]} receiveShadow>
        <boxGeometry args={[2 * L.halfW, 8, 2]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#d9cdb9" />
      </mesh>
    </group>
  );
};

/** Inflow chevrons on the weathered layer: water moving toward the shaft. */
const Inflow: React.FC<{ f: number }> = ({ f }) => {
  const y = (L.alluviumBottom + L.weatheredBottom) / 2;
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7fe3ff", emissive: "#39c6f2", emissiveIntensity: 1.6, roughness: 0.4 }), []);
  const items: React.ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const phase = ((f / 60) * 0.6 + i / 5) % 1;
      const x = side * (L.wellR + 0.5 + (1 - phase) * 7.5);
      items.push(
        <mesh key={`${side}-${i}`} position={[x, y, 0.03]} rotation={[0, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2]} material={mat}>
          <coneGeometry args={[0.32, 0.8, 3]} />
        </mesh>,
      );
    }
  }
  return <group>{items}</group>;
};

/** Pebbles in the alluvium and angular facets in the diorite, half-embedded in the cut face. */
const CutDetail: React.FC = () => {
  const { pebbles, facets } = useMemo(() => {
    const rnd = prng(91);
    const geoP = new THREE.SphereGeometry(1, 12, 9);
    const matP = new THREE.MeshPhysicalMaterial({ roughness: 0.8, color: "#ffffff" });
    const N = 1400;
    const pebbles = new THREE.InstancedMesh(geoP, matP, N);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
    let k = 0;
    while (k < N) {
      const x = -90 + rnd() * 150;
      const y = L.alluviumBottom + 0.3 + rnd() * (L.basementBottom - L.alluviumBottom - 0.6);
      const sz = 0.1 + Math.pow(rnd(), 2.2) * 0.42;
      if (Math.abs(x) < L.wellR + sz + 0.15) continue;
      e.set(rnd() * 3, rnd() * 3, rnd() * 3);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, -sz * 0.35), q, new THREE.Vector3(sz * (1 + rnd() * 0.5), sz * (0.6 + rnd() * 0.3), sz));
      pebbles.setMatrixAt(k, m);
      c.setHSL(0.07 + rnd() * 0.05, 0.2 + rnd() * 0.25, 0.42 + rnd() * 0.3);
      pebbles.setColorAt(k, c);
      k++;
    }
    const geoF = new THREE.BoxGeometry(1, 1, 1);
    const matF = new THREE.MeshPhysicalMaterial({ roughness: 0.82, color: "#ffffff" });
    const M = 380;
    const facets = new THREE.InstancedMesh(geoF, matF, M);
    k = 0;
    while (k < M) {
      const x = -90 + rnd() * 150;
      const y = L.wellBottom - 30 + rnd() * (L.weatheredBottom - L.wellBottom + 29.5);
      const sz = 1.2 + rnd() * 2.6;
      if (Math.abs(x) < L.wellR + sz * 0.8 + 0.2 && y > L.wellBottom - 0.5) continue;
      e.set(rnd() * 0.6 - 0.3, rnd() * 0.6 - 0.3, rnd() * Math.PI);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, -0.33), q, new THREE.Vector3(sz, sz * (0.35 + rnd() * 0.4), 0.68));
      facets.setMatrixAt(k, m);
      c.setHSL(0.42 + rnd() * 0.06, 0.05 + rnd() * 0.05, 0.075 + rnd() * 0.05);
      facets.setColorAt(k, c);
      k++;
    }
    pebbles.receiveShadow = facets.receiveShadow = true;
    pebbles.castShadow = true;
    return { pebbles, facets };
  }, []);
  return (
    <>
      <primitive object={pebbles} />
      <primitive object={facets} />
    </>
  );
};

/** Time-driven state of the hero cutaway (film); the cover uses the defaults. */
export type HeroState = {
  water: number; // water surface y
  seal: number; // 0 = stair entrance open, 1 = sealed (2003)
  glass: number; // glass room opacity factor
  room2: number; // second basement room lit (1973)
  visitors: number; // faceless pilgrims on the stairs (before 2003)
  sensor: number; // data-logger probe in the shaft
  rain: number; // rain over the plaza + seepage into the alluvium
  tunnel: number; // 1980s drainage tunnel bore
  tunnelStop: number; // tunnel stopped (red cross)
  buildings: number; // buildings + foundations above the water table
  opening: number; // main opening glow toward the Hajar Aswad
  table: number; // dashed water-table line on the cut face
  museum: number; // old well lip in a vitrine on the plaza
  pumpOn: number; // flow speed factor
  drop: number; // -1 hidden, else 0..1 progress of the drop along the pipe toward Kudai
};
export const HERO_DEFAULT: HeroState = {
  water: L.waterLevel, seal: 1, glass: 1, room2: 1, visitors: 0, sensor: 0, rain: 0, tunnel: 0, tunnelStop: 0,
  buildings: 0, opening: 0, table: 0, museum: 0, pumpOn: 1, drop: -1,
};

/** Diorite: salt-and-pepper crystals (white feldspar, black hornblende) on grey. */
function dioriteTexture(seed = 47) {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  g.fillStyle = "#7c8580";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "40,46,44" : "150,156,150"},${0.08 + rnd() * 0.1})`;
    g.beginPath();
    g.ellipse(rnd() * 512, rnd() * 512, 40 + rnd() * 120, 20 + rnd() * 60, rnd() * 3, 0, 7);
    g.fill();
  }
  for (let i = 0; i < 2600; i++) {
    const w = rnd();
    g.fillStyle = w < 0.45 ? `rgba(220,222,216,${0.25 + rnd() * 0.3})` : w < 0.9 ? `rgba(30,34,33,${0.3 + rnd() * 0.35})` : "rgba(180,150,115,0.4)";
    const sz = 0.8 + rnd() * 3;
    g.save();
    g.translate(rnd() * 512, rnd() * 512);
    g.rotate(rnd() * 3);
    g.fillRect(-sz, -sz * 0.5, sz * 2, sz);
    g.restore();
  }
  g.strokeStyle = "rgba(220,222,214,0.35)";
  for (let i = 0; i < 4; i++) {
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    let x = rnd() * 512, y = rnd() * 512;
    g.moveTo(x, y);
    for (let j = 0; j < 8; j++) { x += (rnd() - 0.5) * 120; y += (rnd() - 0.3) * 80; g.lineTo(x, y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(1 / 7, 1 / 7);
  return t;
}

/** Small faceless pilgrim: body and head, no features. */
export const Figure: React.FC<{ p: [number, number, number]; s?: number; color?: string }> = ({ p, s = 1, color = PAL.pilgrim }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.62, 0]} castShadow>
      <cylinderGeometry args={[0.17, 0.23, 1.2, 10]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
    <mesh position={[0, 1.36, 0]} castShadow>
      <sphereGeometry args={[0.15, 12, 10]} />
      <meshStandardMaterial color="#e6ddd0" roughness={0.8} />
    </mesh>
  </group>
);

export const ZamzamWorld: React.FC<{ f: number; st?: HeroState }> = ({ f, st = HERO_DEFAULT }) => {
  const grainSand = useSurfaceGrain(21, 0.5, 6);
  const grainRock = useSurfaceGrain(34, 0.6, 4);
  const marbleMap = useMemo(() => marbleTexture(), []);
  const masonry = useMemo(() => masonryTexture(), []);
  const dioriteMap = useMemo(() => dioriteTexture(), []);

  const m = useMemo(() => {
    const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);
    marbleMap.repeat.set(0.25, 0.25);
    return {
      marbleTop: phys({ color: "#ffffff", map: marbleMap, roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
      marbleCut: phys({ color: PAL.marbleCut, roughness: 0.5 }),
      concreteCap: phys({ color: PAL.concrete, roughness: 0.85 }),
      concreteCut: phys({ color: PAL.concreteCut, roughness: 0.9 }),
      sandCap: phys({ color: PAL.sandDark, roughness: 0.95 }),
      sandCut: phys({ color: PAL.sand, roughness: 0.95, bumpMap: grainSand, bumpScale: 1.2 }),
      weatheredCut: phys({ color: PAL.weathered, roughness: 0.75, emissive: "#a8560a", emissiveIntensity: 0.25 }),
      rockCap: phys({ color: PAL.dioriteDeep, roughness: 0.8 }),
      rockCut: phys({ color: "#ffffff", map: dioriteMap, roughness: 0.62, bumpMap: grainRock, bumpScale: 1.0, clearcoat: 0.15, clearcoatRoughness: 0.6 }),
      masonry: phys({ map: masonry, roughness: 0.9, side: THREE.DoubleSide }),
      collar: phys({ color: "#d2cec6", roughness: 0.7 }),
      steel: phys({ color: PAL.steel, metalness: 1, roughness: 0.22 }),
      pump: phys({ color: PAL.pump, metalness: 0.3, roughness: 0.35, clearcoat: 0.6 }),
      glass: phys({ color: "#d9f3ff", roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
      seal: phys({ color: PAL.seal, roughness: 0.9 }),
      water: phys({ color: PAL.water, roughness: 0.08, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, emissive: "#0d5f80", emissiveIntensity: 0.12 }),
      waterCut: phys({ color: PAL.waterCut, roughness: 0.1, transparent: true, opacity: 0.5, depthWrite: false, emissive: "#1d8fbf", emissiveIntensity: 0.15 }),
      flow: new THREE.MeshStandardMaterial({ color: "#7fe3ff", emissive: "#39c6f2", emissiveIntensity: 1.4 }),
      lamp: new THREE.MeshStandardMaterial({ color: "#fff6dc", emissive: "#ffe3a3", emissiveIntensity: 1.2 }),
      red: new THREE.MeshStandardMaterial({ color: "#e2483d", emissive: "#b8261b", emissiveIntensity: 0.6 }),
      build: phys({ color: "#efe7da", roughness: 0.8 }),
      found: phys({ color: "#9d968b", roughness: 0.9 }),
      dark: phys({ color: "#2b2622", roughness: 0.9 }),
    };
  }, [grainSand, grainRock, marbleMap, masonry, dioriteMap]);

  const r = L.wellR;
  const well: Notch = useMemo(() => ({ kind: "well", r }), [r]);
  const room: Notch = useMemo(() => ({ kind: "room" }), []);
  const none: Notch = useMemo(() => ({ kind: "none" }), []);

  const collarGeo = useMemo(() => {
    const s = new THREE.Shape();
    const ro = r + 0.38;
    s.moveTo(-ro, 0);
    s.absarc(0, 0, ro, Math.PI, 0, true);
    s.lineTo(r, 0);
    s.absarc(0, 0, r, 0, Math.PI, false);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: L.roomFloor * -1 + L.collarTop, bevelEnabled: false, curveSegments: 48 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, L.roomFloor, 0);
    return g;
  }, [r]);

  // stairs on the left of the old basement room, rising toward the sealed entrance
  const steps = 7;
  const rise = (L.roomCeil - L.roomFloor) / steps;
  const stairX0 = -2.4, stairX1 = -L.roomHalfW + 0.1;
  const run = (stairX0 - stairX1) / steps;
  const sealX = (stairX1 + stairX0 - 1.4) / 2 - 0.2;

  const pipeY1 = -1.45, pipeY2 = -1.8;
  const p1x = 0.3, p1z = -0.8, p2x = 0.75, p2z = -0.55;
  const t = f / 60;
  const wl = st.water;
  const roomMid = (L.roomFloor + L.roomCeil) / 2;
  const roomH = L.roomCeil - L.roomFloor;
  m.glass.opacity = 0.22 * st.glass;

  // drop along the pump pipe: up the shaft, then along the tunnel toward Kudai
  let dropPos: [number, number, number] | null = null;
  if (st.drop >= 0) {
    if (st.drop < 0.25) dropPos = [p1x, L.pumpY + 0.9 + (st.drop / 0.25) * (pipeY1 - L.pumpY - 0.9), p1z + 0.16];
    else dropPos = [p1x + ((st.drop - 0.25) / 0.75) * (L.halfW - p1x), pipeY1, p1z + 0.16];
  }

  return (
    <group>
      {/* ground block, bottom to top */}
      <Layer notch={none} y0={L.bottom} y1={L.wellBottom} cap={m.rockCap} side={m.rockCut} />
      <Layer notch={well} y0={L.wellBottom} y1={L.weatheredBottom} cap={m.rockCap} side={m.rockCut} />
      <Layer notch={well} y0={L.weatheredBottom} y1={L.alluviumBottom} cap={m.weatheredCut} side={m.weatheredCut} />
      <Layer notch={well} y0={L.alluviumBottom} y1={L.basementBottom} cap={m.sandCap} side={m.sandCut} />
      <Layer notch={well} y0={L.basementBottom} y1={L.roomFloor} cap={m.concreteCap} side={m.concreteCut} />
      <Layer notch={room} y0={L.roomFloor} y1={L.roomCeil} cap={m.concreteCap} side={m.concreteCut} />
      <Layer notch={none} y0={L.roomCeil} y1={L.marbleBottom} cap={m.concreteCap} side={m.concreteCut} />
      <Layer notch={none} y0={L.marbleBottom} y1={L.marbleTop} cap={m.marbleTop} side={m.marbleCut} />

      {/* well lining: stone masonry through the alluvium and weathered layer */}
      <HalfTube r={r - 0.02} y0={L.weatheredBottom} y1={L.roomFloor}>
        <primitive object={m.masonry} attach="material" />
      </HalfTube>
      <mesh geometry={collarGeo} material={m.collar} castShadow receiveShadow />

      {/* water column (cut by the section plane) */}
      <HalfTube r={r - 0.05} y0={L.wellBottom + 0.02} y1={wl} fx>
        <primitive object={m.water} attach="material" />
      </HalfTube>
      <mesh position={[0, (L.wellBottom + wl) / 2, 0.01]} material={m.waterCut} layers={FX_LAYER}>
        <planeGeometry args={[2 * (r - 0.05), wl - L.wellBottom]} />
      </mesh>
      <mesh position={[0, wl, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.waterCut} layers={FX_LAYER}>
        <circleGeometry args={[r - 0.05, 48, 0, Math.PI]} />
      </mesh>

      {/* basement: partition between the two rooms (1960s and 1973) and their ceiling lamps */}
      <mesh position={[3.4, roomMid, -3.6]} material={m.concreteCut} castShadow receiveShadow>
        <boxGeometry args={[0.25, roomH, 5.8]} />
      </mesh>
      <mesh position={[-1.4, L.roomCeil - 0.04, -2.4]} material={m.lamp}>
        <boxGeometry args={[1.4, 0.06, 0.3]} />
      </mesh>
      <mesh position={[4.4, L.roomCeil - 0.04, -2.4]} material={m.lamp} visible={st.room2 > 0.5}>
        <boxGeometry args={[1.4, 0.06, 0.3]} />
      </mesh>
      <pointLight position={[4.4, L.roomCeil - 0.4, -1.5]} intensity={6 * st.room2} distance={6} color="#ffe9c2" />
      <pointLight position={[-1.4, L.roomCeil - 0.4, -1.5]} intensity={6} distance={7} color="#fff1d6" />

      {/* glass room around the well mouth (today no visitor may enter) */}
      <group visible={st.glass > 0.02}>
        {[-2.9, 2.9].map((x) => (
          <mesh key={x} position={[x, roomMid, -1.6]} rotation={[0, Math.PI / 2, 0]} material={m.glass} layers={FX_LAYER}>
            <planeGeometry args={[3.2, roomH]} />
          </mesh>
        ))}
        <mesh position={[0, roomMid, -3.2]} material={m.glass} layers={FX_LAYER}>
          <planeGeometry args={[5.8, roomH]} />
        </mesh>
        {[[-2.9, -0.05], [-2.9, -3.2], [2.9, -0.05], [2.9, -3.2], [0, -3.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, L.roomFloor + (roomH * st.glass) / 2, z]} material={m.steel} castShadow scale={[1, Math.max(0.01, st.glass), 1]}>
            <boxGeometry args={[0.08, roomH, 0.08]} />
          </mesh>
        ))}
      </group>

      {/* stairs up to the old entrance; daylight while it is open, sealed by a slab in 2003 */}
      {Array.from({ length: steps }, (_, i) => (
        <mesh key={i} position={[stairX0 - run * (i + 0.5), L.roomFloor + (rise * (i + 1)) / 2, -1.6]} castShadow receiveShadow>
          <boxGeometry args={[run + 0.02, rise * (i + 1), 2.6]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#cfc8bc" />
        </mesh>
      ))}
      <mesh position={[sealX - (1 - st.seal) * 3.2, L.roomCeil - 0.06 - (1 - st.seal) * 0.2, -1.6]} material={m.seal} castShadow>
        <boxGeometry args={[2.4, 0.14, 2.8]} />
      </mesh>
      <pointLight position={[sealX, L.roomCeil - 0.3, -1.6]} intensity={10 * (1 - st.seal)} distance={5} color="#fff7e8" />
      {st.visitors > 0.02
        ? ([
            [-3.2, L.roomFloor + rise * 3, -1.2],
            [-4.3, L.roomFloor + rise * 5.5, -2.0],
            [-1.8, L.roomFloor, -2.6],
            [1.9, L.roomFloor, -1.0],
            [2.3, L.roomFloor, -2.4],
          ] as [number, number, number][]).map((p, i) => <Figure key={i} p={p} s={0.95 * st.visitors} />)
        : null}

      {/* pump and the two stainless pipes to the purification plant (Kudai) */}
      <group>
        <mesh position={[p1x, L.pumpY, p1z]} material={m.pump} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.7, 28]} />
        </mesh>
        <mesh position={[p1x, L.pumpY - 1.1, p1z]} material={m.steel}>
          <cylinderGeometry args={[0.24, 0.3, 0.5, 28]} />
        </mesh>
        <mesh position={[p2x, L.pumpY + 2.4, p2z]} material={m.pump} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 1.4, 28]} />
        </mesh>
        <Pipe a={[p1x, L.pumpY + 0.85, p1z]} b={[p1x, pipeY1, p1z]} r={0.1} mat={m.steel} />
        <Pipe a={[p2x, L.pumpY + 3.1, p2z]} b={[p2x, pipeY2, p2z]} r={0.08} mat={m.steel} />
        <mesh position={[p1x, pipeY1, p1z]} material={m.steel}><sphereGeometry args={[0.14, 20, 14]} /></mesh>
        <mesh position={[p2x, pipeY2, p2z]} material={m.steel}><sphereGeometry args={[0.12, 20, 14]} /></mesh>
        <Pipe a={[p1x, pipeY1, p1z]} b={[L.halfW, pipeY1, p1z]} r={0.1} mat={m.steel} />
        <Pipe a={[p2x, pipeY2, p2z]} b={[L.halfW, pipeY2, p2z]} r={0.08} mat={m.steel} />
        {Array.from({ length: 14 }, (_, i) => {
          const ph = (t * 0.25 + i / 14) % 1;
          return (
            <mesh key={i} position={[L.roomHalfW + 0.5 + ph * 40, pipeY1 + 0.32, p1z + 0.2]} rotation={[0, 0, -Math.PI / 2]} material={m.flow} visible={st.pumpOn > 0.5}>
              <coneGeometry args={[0.13, 0.36, 3]} />
            </mesh>
          );
        })}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={`c${i}`} position={[L.roomHalfW + 1 + i * 4, pipeY1 - 0.6, p1z + 0.1]} material={m.steel} castShadow>
            <boxGeometry args={[0.12, 1.2, 0.9]} />
          </mesh>
        ))}
        {/* pump state lamp: cyan running, red stopped */}
        <mesh position={[p1x + 0.32, L.pumpY + 0.5, p1z + 0.22]} material={st.pumpOn > 0.5 ? m.flow : m.red}>
          <sphereGeometry args={[0.1, 12, 10]} />
        </mesh>
      </group>
      {dropPos ? (
        <mesh position={dropPos} material={m.flow}>
          <sphereGeometry args={[0.17, 20, 16]} />
        </mesh>
      ) : null}

      {/* data-logger probe hanging into the water */}
      {st.sensor > 0.02 ? (
        <group>
          <Pipe a={[-0.55, L.collarTop, -0.6]} b={[-0.55, wl - 1.2, -0.6]} r={0.025} mat={m.dark} />
          <mesh position={[-0.55, wl - 1.4, -0.6]} material={m.pump}>
            <cylinderGeometry args={[0.09, 0.09, 0.5, 16]} />
          </mesh>
          <mesh position={[-0.55, wl - 1.4, -0.48]} material={m.flow} scale={st.sensor}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        </group>
      ) : null}

      {/* main opening toward the Hajar Aswad: glowing slot on the back wall at the weathered layer */}
      {st.opening > 0.02 ? (
        <mesh position={[-0.35, (L.alluviumBottom + L.weatheredBottom) / 2 - 0.05, -r + 0.05]} material={m.flow} scale={[st.opening, st.opening, 1]}>
          <boxGeometry args={[0.45, 0.3, 0.04]} />
        </mesh>
      ) : null}

      {/* dashed water-table line on the cut face */}
      {st.table > 0.02
        ? Array.from({ length: 60 }, (_, i) => {
            const x = -88 + i * 3;
            if (Math.abs(x) < r + 0.6) return null;
            return (
              <mesh key={`wt${i}`} position={[x, wl, 0.04]} material={m.flow} scale={[st.table, 1, 1]}>
                <boxGeometry args={[1.6, 0.12, 0.02]} />
              </mesh>
            );
          })
        : null}

      {/* 1980s drainage tunnel (cross-section in the alluvium) */}
      {st.tunnel > 0.02 ? (
        <group position={[-11, -7.2, 0.03]} scale={st.tunnel}>
          <mesh material={m.dark}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>
          <mesh position={[0, 0, 0.01]} material={m.concreteCut}>
            <ringGeometry args={[1.5, 1.85, 32]} />
          </mesh>
          {st.tunnelStop > 0.02
            ? [1, -1].map((sg) => (
                <mesh key={sg} position={[0, 0, 0.03]} rotation={[0, 0, (sg * Math.PI) / 4]} material={m.red} scale={[st.tunnelStop, 1, 1]}>
                  <boxGeometry args={[4.6, 0.36, 0.02]} />
                </mesh>
              ))
            : null}
        </group>
      ) : null}

      {/* buildings around the mosque with foundations that stop above the water table */}
      {st.buildings > 0.02
        ? ([
            [-58, 22, 9],
            [-46, 30, 8],
            [-34, 18, 7],
          ] as [number, number, number][]).map(([x, h, w], i) => {
            const hh = Math.max(0.1, h * st.buildings);
            return (
              <group key={`b${i}`}>
                <mesh position={[x, hh / 2, -6 - w / 2]} material={m.build} castShadow receiveShadow>
                  <RoundedBoxGeo args={[w, hh, w]} radius={0.3} />
                </mesh>
                {[-w / 3, 0, w / 3].map((dx) => (
                  <mesh key={dx} position={[x + dx, -0.5 - 2.6 * st.buildings, -0.3]} material={m.found}>
                    <boxGeometry args={[0.7, Math.max(0.01, 5.2 * st.buildings), 0.6]} />
                  </mesh>
                ))}
              </group>
            );
          })
        : null}

      {st.rain > 0.02 ? <Rain t={t} amount={st.rain} mat={m.flow} /> : null}
      {st.museum > 0.02 ? <Vitrine p={[-26, 0, -12]} s={st.museum * 1.5} dark={m.dark} /> : null}

      <CutDetail />
      <Inflow f={f} />
      <Kaaba />
      <Crowd f={f} />
      <Arcade />
    </group>
  );
};

/** Rain over the plaza and seepage arrows through the alluvium (aquifer recharge). */
const Rain: React.FC<{ t: number; amount: number; mat: THREE.Material }> = ({ t, amount, mat }) => {
  const streaks = useMemo(() => {
    const rnd = prng(5);
    return Array.from({ length: 140 }, () => ({ x: -70 + rnd() * 110, z: -40 + rnd() * 38, ph: rnd(), sp: 0.8 + rnd() * 0.5 }));
  }, []);
  const seep = useMemo(() => {
    const rnd = prng(9);
    return Array.from({ length: 34 }, () => ({ x: -60 + rnd() * 100, ph: rnd() }));
  }, []);
  return (
    <group>
      {streaks.map((s, i) => {
        const y = 26 - ((t * 18 * s.sp + s.ph * 26) % 26);
        return (
          <mesh key={i} position={[s.x, y, s.z]} material={mat} layers={FX_LAYER} scale={[1, amount, 1]}>
            <boxGeometry args={[0.05, 1.4, 0.05]} />
          </mesh>
        );
      })}
      {seep.map((s, i) => {
        if (Math.abs(s.x) < 3) return null;
        const y = -3.8 - ((t * 1.6 + s.ph * 9) % 9);
        return (
          <mesh key={`s${i}`} position={[s.x, y, 0.05]} rotation={[0, 0, Math.PI]} material={mat} scale={amount}>
            <coneGeometry args={[0.28, 0.7, 3]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Museum vitrine: the old well lip with pulley and bucket. */
const Vitrine: React.FC<{ p: [number, number, number]; s: number; dark: THREE.Material }> = ({ p, s, dark }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[4.2, 1.0, 3.2]} radius={0.12} />
      <meshPhysicalMaterial {...POLISH.stone} color="#3e4a46" />
    </mesh>
    <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.95, 0.32, 16, 40]} />
      <meshPhysicalMaterial color="#e9e1d2" roughness={0.45} clearcoat={0.4} />
    </mesh>
    <mesh position={[0, 1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.95, 32]} />
      <meshStandardMaterial color="#232a28" />
    </mesh>
    {[-1.0, 1.0].map((x) => (
      <mesh key={x} position={[x, 2.4, 0]} material={dark} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
      </mesh>
    ))}
    <mesh position={[0, 3.45, 0]} rotation={[0, 0, Math.PI / 2]} material={dark}>
      <cylinderGeometry args={[0.05, 0.05, 2.1, 8]} />
    </mesh>
    <mesh position={[0, 3.45, 0]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.28, 0.06, 10, 24]} />
      <meshPhysicalMaterial color="#b88a4a" metalness={0.8} roughness={0.35} />
    </mesh>
    <mesh position={[0.28, 2.7, 0]} material={dark}>
      <cylinderGeometry args={[0.015, 0.015, 1.5, 6]} />
    </mesh>
    <mesh position={[0.28, 1.85, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.17, 0.36, 18]} />
      <meshPhysicalMaterial color="#9b7b4f" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0, 2.5, 0]} layers={FX_LAYER}>
      <boxGeometry args={[4.0, 3.0, 3.0]} />
      <meshPhysicalMaterial color="#e6f6ff" transparent opacity={0.12} roughness={0.05} depthWrite={false} />
    </mesh>
  </group>
);
