// AE-068 street world: a city road cut open along z = 0 like an architectural section model.
// Above: asphalt lanes with GLB traffic, sidewalks, shop rows. Below: layered soil (asphalt, base course,
// laterite fill, clay, silt), a launch (jacking) pit and a reception pit, and the pipe-jacking string:
// thrust wall, jacking frame with four hydraulic cylinders, thrust ring, short concrete segments with steel
// collars, and the boring machine (MTBM) with a rotating cutterhead. Shapes follow research/RESEARCH_REPORT.md
// "Saran visual akurat". Pure function of t.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { C, JP, MLEN, PIT_FLOOR, PIT_Z, RI, RM, RP, RPIT, SEG, WALL, XR0, YP, jackState, rng } from "./shared.ts";

// ---------- materials ----------
/** Seeded cast-concrete texture: mottled cement, aggregate specks, air pores, form-line streaks. */
export const makeConcreteTex = (seed = 1868, size = 512) => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d")!;
  const r = rng(seed);
  g.fillStyle = "#c8c5bf"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) { // mottling
    const v = 160 + Math.floor(r() * 70);
    g.fillStyle = `rgba(${v},${v - 3},${v - 8},0.10)`;
    g.beginPath(); g.arc(r() * size, r() * size, 10 + r() * 46, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 5200; i++) { // aggregate specks
    const v = r() < 0.5 ? 90 + r() * 50 : 215 + r() * 35;
    g.fillStyle = `rgba(${v},${v},${v - 6},${0.35 + r() * 0.4})`;
    g.fillRect(r() * size, r() * size, 1 + r() * 2.2, 1 + r() * 2.2);
  }
  for (let i = 0; i < 420; i++) { // air pores
    g.fillStyle = `rgba(40,38,35,${0.45 + r() * 0.4})`;
    g.beginPath(); g.arc(r() * size, r() * size, 0.8 + r() * 2.2, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 14; i++) { // water/form streaks
    g.fillStyle = `rgba(80,72,62,${0.05 + r() * 0.07})`;
    g.fillRect(r() * size, 0, 2 + r() * 10, size);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 8;
  return tex;
};

export const useMats = () => {
  const grain = useSurfaceGrain(68, 0.25, 6);
  const crete = useMemo(() => makeConcreteTex(), []);
  return useMemo(() => {
    const std = (color: string, rough = 0.9, metal = 0, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, roughnessMap: grain, bumpMap: grain, bumpScale: 0.6, ...extra });
    // matte cast concrete: textured albedo + bump, almost no specular (no "plastic" sheen)
    const conc = (color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
      new THREE.MeshPhysicalMaterial({ color, map: crete, bumpMap: crete, bumpScale: 2.2, roughness: 0.97, metalness: 0, specularIntensity: 0.18, envMapIntensity: 0.35, ...extra });
    // dark soil: no env sheen, so the lit subject separates from the section face
    const soil = (color: string) => std(color, 1, 0, { specularIntensity: 0.1, envMapIntensity: 0.15, bumpScale: 1.2 });
    return {
      asphalt: std(C.asphalt, 0.82),
      gravel: soil("#4d4943"),
      laterite: soil("#43261a"),
      clay: soil("#2c241d"),
      silt: soil("#191613"),
      concrete: conc("#8f8c86"),
      plaster: std(C.plaster, 0.8),
      pipe: conc("#d4d1cb"),
      pipeIn: new THREE.MeshStandardMaterial({ color: "#8e8a83", map: crete, roughness: 0.95, side: THREE.BackSide, emissive: "#2a2724", emissiveIntensity: 0.25 }),
      collar: std("#6f767f", 0.35, 0.85),
      steel: std(C.steel, 0.3, 0.9),
      chrome: new THREE.MeshPhysicalMaterial({ color: "#e9eef3", roughness: 0.08, metalness: 1, clearcoat: 0.6 }),
      orange: std(C.orange, 0.45, 0.35, { clearcoat: 0.4 }),
      yellow: std(C.yellow, 0.5, 0.2, { clearcoat: 0.3 }),
      dark: std("#2d3036", 0.5, 0.6),
      marking: new THREE.MeshStandardMaterial({ color: "#f1efe8", roughness: 0.6 }),
      curb: std("#cfcac0", 0.85),
      walk: std("#7a766f", 0.9),
      apron: std("#121316", 0.9, 0, { envMapIntensity: 0.1 }),
      plinth: new THREE.MeshStandardMaterial({ color: "#121318", roughness: 0.7, metalness: 0.2 }),
      laser: new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: "#ff5a40", toneMapped: false, transparent: true, opacity: 0.35, depthWrite: false }),
      crete,
    };
  }, [grain, crete]);
};
export type Mats = ReturnType<typeof useMats>;

// ---------- soil section ----------
const LAYERS: { y0: number; y1: number; m: keyof Mats }[] = [
  { y0: 0, y1: -0.3, m: "asphalt" },
  { y0: -0.3, y1: -1.0, m: "gravel" },
  { y0: -1.0, y1: -3.8, m: "laterite" },
  { y0: -3.8, y1: PIT_FLOOR, m: "clay" },
  { y0: PIT_FLOOR, y1: -16, m: "silt" },
];
export const X_MIN = -42, X_MAX = 42, Z_BACK = -14;

/** Slab across x0..x1, between y1..y0, z from zb to 0; optional semicircular pipe notch on the cut face. */
export const notchGeo = (x0: number, x1: number, y0: number, y1: number, zb: number, notchR: number, yc = YP) => {
  const s = new THREE.Shape();
  // shape plane: sx = -z, sy = y; extruded along +x after rotation
  s.moveTo(0, y0); s.lineTo(-zb, y0); s.lineTo(-zb, y1); s.lineTo(0, y1);
  if (notchR > 0) { s.lineTo(0, yc - notchR); s.absarc(0, yc, notchR, -Math.PI / 2, Math.PI / 2, false); }
  s.lineTo(0, y0);
  const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false, curveSegments: 36 });
  // local (sx, sy, ez) -> world (x0 + ez, sy, -sx)
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, x0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1));
  g.computeVertexNormals();
  return g;
};
export const Box: React.FC<{ a: [number, number, number]; b: [number, number, number]; m: THREE.Material; r?: boolean }> = ({ a, b, m, r }) => (
  <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} material={m} castShadow receiveShadow>
    {r ? <RoundedBoxGeo args={[Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])]} radius={0.04} segments={2} /> : <boxGeometry args={[Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])]} />}
  </mesh>
);

const JW = { o0: JP.x0 - WALL, o1: JP.x1 + WALL };
const RW = { o0: RPIT.x0 - WALL, o1: RPIT.x1 + WALL };

export const Soil: React.FC<{ M: Mats }> = ({ M }) => {
  const geos = useMemo(() => {
    const out: { g: THREE.BufferGeometry; m: keyof Mats }[] = [];
    for (const L of LAYERS) {
      const inPits = L.y0 > PIT_FLOOR + 0.01; // layer is cut by the pits
      const segs: [number, number, boolean][] = inPits
        ? [[X_MIN, JW.o0, false], [JW.o1, RW.o0, L.m === "clay"], [RW.o1, X_MAX, false]]
        : [[X_MIN, X_MAX, false]];
      for (const [x0, x1, notch] of segs) out.push({ g: notchGeo(x0, x1, L.y0, L.y1, PIT_Z - WALL, notch ? RM : 0), m: L.m });
      // behind the pits: full slab
      out.push({ g: notchGeo(X_MIN, X_MAX, L.y0, L.y1, Z_BACK, 0).translate(0, 0, PIT_Z - WALL), m: L.m });
    }
    // pit walls (concrete), the inner walls carry the pipe opening
    const w = (x0: number, x1: number, notch: boolean) => out.push({ g: notchGeo(x0, x1, 0.05, PIT_FLOOR - 0.3, PIT_Z - WALL, notch ? RM : 0), m: "concrete" });
    w(JW.o0, JP.x0, false); w(JP.x1, JW.o1, true); w(RW.o0, RPIT.x0, true); w(RPIT.x1, RW.o1, false);
    return out;
  }, []);
  return (
    <group>
      {geos.map((o, i) => <mesh key={i} geometry={o.g} material={M[o.m] as THREE.Material} castShadow receiveShadow />)}
      {/* pit back walls and floors */}
      {[JP, RPIT].map((p, i) => (
        <group key={i}>
          <Box a={[p.x0, PIT_FLOOR - 0.3, PIT_Z - WALL]} b={[p.x1, 0.05, PIT_Z]} m={M.concrete} />
          <Box a={[p.x0, PIT_FLOOR - 0.3, PIT_Z]} b={[p.x1, PIT_FLOOR, 0]} m={M.concrete} />
        </group>
      ))}
      {/* plinth under the model */}
      <Box a={[X_MIN - 6, -16.6, Z_BACK - 40]} b={[X_MAX + 6, -16, 6]} m={M.plinth} />
    </group>
  );
};

// ---------- road surface ----------
export const Road: React.FC<{ M: Mats; x0?: number; x1?: number }> = ({ M, x0 = -90, x1 = 90 }) => {
  const dashes = useMemo(() => { const a: number[] = []; for (let x = x0; x < x1; x += 6) a.push(x); return a; }, [x0, x1]);
  return (
    <group>
      {/* road beyond the cut block (surface only) */}
      <Box a={[x0, -0.6, -10]} b={[X_MIN, 0, 0]} m={M.asphalt} />
      <Box a={[X_MAX, -0.6, -10]} b={[x1, 0, 0]} m={M.asphalt} />
      <Box a={[x0, 0, -13.3]} b={[x1, 0.2, -10]} m={M.walk} />
      <Box a={[x0, 0, -10.25]} b={[x1, 0.22, -10]} m={M.curb} />
      <Box a={[x0, -0.6, -70]} b={[x1, 0.2, -13.3]} m={M.walk} />
      {/* lane markings */}
      {dashes.map((x) => (
        <group key={x}>
          {(x + 3 < JW.o0 - 0.5 || x > RW.o1 + 0.5 || (x > JW.o1 + 0.5 && x + 3 < RW.o0 - 0.5)) && <mesh position={[x + 1.5, 0.012, -3.4]} rotation={[-Math.PI / 2, 0, 0]} material={M.marking}><planeGeometry args={[3, 0.15]} /></mesh>}
          <mesh position={[x + 1.5, 0.012, -6.6]} rotation={[-Math.PI / 2, 0, 0]} material={M.marking}><planeGeometry args={[3, 0.15]} /></mesh>
        </group>
      ))}
      <mesh position={[(x0 + x1) / 2, 0.012, -9.7]} rotation={[-Math.PI / 2, 0, 0]} material={M.marking}><planeGeometry args={[x1 - x0, 0.15]} /></mesh>
    </group>
  );
};

// ---------- buildings & street furniture ----------
const BLDG: { id: string; x: number; s: number }[] = [
  { id: "one-storey-shop-row-83c958", x: -52, s: 12 },
  { id: "narrow-walk-up-41f10c", x: -42, s: 13 },
  { id: "corner-shop-5aec8c", x: -33, s: 9 },
  { id: "one-storey-shop-row-83c958", x: -21, s: 12 },
  { id: "narrow-walk-up-41f10c", x: -11, s: 13 },
  { id: "one-storey-shop-row-83c958", x: 0, s: 12 },
  { id: "corner-shop-5aec8c", x: 11.5, s: 9 },
  { id: "one-storey-shop-row-83c958", x: 23, s: 12 },
  { id: "narrow-walk-up-41f10c", x: 33, s: 13 },
  { id: "one-storey-shop-row-83c958", x: 44, s: 12 },
  { id: "corner-shop-5aec8c", x: 55, s: 9 },
];
export const Buildings: React.FC = () => (
  <group>
    {BLDG.map((b, i) => (
      <AssetModel key={i} id={b.id} size={b.s} ground position={[b.x, 0.2, -19.5]} tint={i % 3 === 1 ? "#d9d4ca" : C.plaster} roughness={0.85}
        fallback={<mesh position={[b.x, 3, -19.5]}><RoundedBoxGeo args={[9, 6, 8]} /><meshStandardMaterial color={C.plaster} /></mesh>} />
    ))}
    {Array.from({ length: 12 }, (_, i) => -55 + i * 10).map((x, i) => (
      i % 2 === 0
        ? <AssetModel key={`t${i}`} id="street-tree-0d33f3" size={5.5} ground position={[x + 2, 0.2, -12]} polish="clay" />
        : <AssetModel key={`l${i}`} id="street-lamp-136745" size={5.5} ground position={[x + 2, 0.2, -10.8]} rotation={[0, 0, 0]} />
    ))}
  </group>
);

// ---------- traffic (GLB vehicles, deterministic loops) ----------
const CARS = (() => {
  const r = rng(6808);
  const ids = [
    { id: "city-bus-49fd97", len: 11 }, { id: "town-car-56eeb6", len: 4.6 }, { id: "delivery-truck-a9537e", len: 6 },
    { id: "town-car-56eeb6", len: 4.6 }, { id: "wedge-coupe-80s-9f8b5e", len: 4.4 }, { id: "town-car-56eeb6", len: 4.6 },
    { id: "delivery-truck-a9537e", len: 6 }, { id: "wedge-coupe-80s-9f8b5e", len: 4.4 }, { id: "town-car-56eeb6", len: 4.6 },
    { id: "city-bus-49fd97", len: 11 }, { id: "wedge-coupe-80s-9f8b5e", len: 4.4 }, { id: "town-car-56eeb6", len: 4.6 },
  ];
  return ids.map((c, i) => ({ ...c, lane: i % 2 === 0 ? -5.0 : -8.2, dir: i % 2 === 0 ? 1 : -1, off: i === 0 ? 45 : i * 12.5 + r() * 5, v: i === 0 ? 8 : 7 + r() * 2.5 }));
})();
export const Traffic: React.FC<{ t: number; speed?: number }> = ({ t, speed = 1 }) => (
  <group>
    {CARS.map((c, i) => {
      const span = 150;
      const x = (((c.off + c.v * speed * t * c.dir) % span) + span) % span - span / 2;
      return (
        <AssetModel key={i} id={c.id} size={c.len} ground position={[x, 0.02, c.lane]} rotation={[0, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          fallback={<mesh position={[x, 0.8, c.lane]}><RoundedBoxGeo args={[c.len, 1.5, 2]} /><meshStandardMaterial color="#c0392b" /></mesh>} />
      );
    })}
  </group>
);

// ---------- hoarding around a pit + AUDIRA plate ----------
export const makePlate = (lines: string[], w = 1024, h = 320, bg = "#16181d", fg = "#ffffff", accent = C.accent) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = accent; g.fillRect(0, h - 26, w, 26);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 ${Math.round(h * 0.4)}px '${FONT}'`;
  g.fillText(lines[0], w / 2, h * 0.36, w * 0.9);
  if (lines[1]) { g.font = `500 ${Math.round(h * 0.15)}px '${FONT}'`; g.fillText(lines[1], w / 2, h * 0.7, w * 0.9); }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
export const EXTRA_PITS: [number, number][] = [[-47, -42], [43, 48]];
export const Hoarding: React.FC<{ x0: number; x1: number; M: Mats; plate?: THREE.Texture }> = ({ x0, x1, M, plate }) => {
  const n = Math.max(1, Math.round((x1 - x0) / 4));
  const w = (x1 - x0) / n;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <AssetModel key={i} id="construction-hoarding-c286ac" size={4} ground position={[x0 + w * (i + 0.5), 0, PIT_Z - WALL - 0.4]}
          fallback={<Box a={[x0 + w * i, 0, PIT_Z - 0.9]} b={[x0 + w * (i + 1), 2.2, PIT_Z - 0.7]} m={M.plaster} />} />
      ))}
      {[x0 - 0.35, x1 + 0.35].map((x, i) => (
        <AssetModel key={`s${i}`} id="construction-hoarding-c286ac" size={3.2} ground position={[x, 0, -1.6]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      {[x0 - 1.2, x1 + 1.2].map((x, i) => <AssetModel key={`c${i}`} id="site-traffic-cone-d3ce94" size={0.75} ground position={[x, 0, -3.6]} />)}
      {plate && (
        <mesh position={[(x0 + x1) / 2, 1.35, PIT_Z - WALL - 0.02]}>
          <planeGeometry args={[3.4, 1.06]} />
          <meshStandardMaterial map={plate} roughness={0.6} emissive="#ffffff" emissiveMap={plate} emissiveIntensity={0.18} />
        </mesh>
      )}
    </group>
  );
};

// ---------- gantry crane over the launch pit ----------
export const Gantry: React.FC<{ M: Mats; hookY: number }> = ({ M, hookY }) => {
  const xc = XR0 + SEG / 2;
  return (
    <group>
      {[JP.x0 - 0.9, JP.x1 + 0.9].map((x, i) => (
        <group key={i}>
          <Box a={[x - 0.2, 0, -3.3]} b={[x + 0.2, 7.2, -2.9]} m={M.yellow} r />
          <Box a={[x - 0.2, 0, -0.4]} b={[x + 0.2, 7.2, 0]} m={M.yellow} r />
          <Box a={[x - 0.25, 6.9, -3.3]} b={[x + 0.25, 7.5, 0]} m={M.yellow} r />
        </group>
      ))}
      <Box a={[JP.x0 - 1.15, 7.5, -0.35]} b={[JP.x1 + 1.15, 8.1, 0.25]} m={M.yellow} r />
      <Box a={[xc - 0.6, 7.0, -0.45]} b={[xc + 0.6, 7.5, 0.45]} m={M.dark} r />
      <mesh position={[xc, (7.0 + hookY) / 2, 0]} material={M.dark}><cylinderGeometry args={[0.035, 0.035, Math.max(0.01, 7.0 - hookY), 6]} /></mesh>
      <mesh position={[xc, hookY + 0.12, 0]} material={M.steel}><boxGeometry args={[1.6, 0.08, 0.08]} /></mesh>
    </group>
  );
};

/** Spare segments on timber blocks beside the launch pit (surface stockpile). */
export const Stockpile: React.FC<{ M: Mats }> = ({ M }) => (
  <group>
    {[-24.6, -21.8].map((x, i) => (
      <group key={i}>
        <PipeSeg x={x} y={RP + 0.25} M={M} />
        {[0.4, 2.0].map((d) => <Box key={d} a={[x + d - 0.15, 0, -1.4]} b={[x + d + 0.15, 0.3, 1.0]} m={M.gravel} r />)}
      </group>
    ))}
  </group>
);

// ---------- pipe segment, machine, jacking frame ----------
export const PipeSeg: React.FC<{ x: number; y?: number; M: Mats; r?: number; ri?: number; len?: number }> = ({ x, y = YP, M, r = RP, ri = RI, len = SEG }) => (
  <group position={[x + len / 2, y, 0]} rotation={[0, 0, -Math.PI / 2]}>
    <mesh material={M.pipe} castShadow receiveShadow><cylinderGeometry args={[r, r, len - 0.04, 48, 1, true]} /></mesh>
    <mesh material={M.pipeIn}><cylinderGeometry args={[ri, ri, len - 0.04, 48, 1, true]} /></mesh>
    {[-1, 1].map((sgn) => (
      <mesh key={sgn} position={[0, sgn * (len / 2 - 0.02), 0]} rotation={[sgn * -Math.PI / 2, 0, 0]} material={M.pipe}><ringGeometry args={[ri, r, 48]} /></mesh>
    ))}
    {/* steel collar at the leading end */}
    <mesh position={[0, len / 2 - 0.12, 0]} material={M.collar}><cylinderGeometry args={[r * 1.015, r * 1.015, 0.2, 48, 1, true]} /></mesh>
  </group>
);

export const Machine: React.FC<{ F: number; spin: number; M: Mats; r?: number; len?: number; y?: number }> = ({ F, spin, M, r = RM, len = MLEN, y = YP }) => {
  const cutters = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2, rr: (0.3 + (i % 3) * 0.22) * r })), [r]);
  return (
    <group position={[F, y, 0]}>
      {/* shield body */}
      <group rotation={[0, 0, -Math.PI / 2]} position={[-len / 2 - 0.12, 0, 0]}>
        <mesh material={M.orange} castShadow><cylinderGeometry args={[r, r, len - 0.24, 48]} /></mesh>
        <mesh position={[0, -len * 0.18, 0]} material={M.dark}><cylinderGeometry args={[r * 1.01, r * 1.01, 0.08, 48, 1, true]} /></mesh>
      </group>
      {/* cutterhead */}
      <group rotation={[spin, 0, 0]} position={[-0.12, 0, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} material={M.steel}><cylinderGeometry args={[r * 0.98, r * 0.98, 0.22, 48]} /></mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} rotation={[(k * Math.PI) / 4, 0, 0]} position={[0.14, 0, 0]} material={M.dark}><boxGeometry args={[0.1, r * 1.9, 0.18]} /></mesh>
        ))}
        {cutters.map((c, i) => (
          <mesh key={i} position={[0.2, Math.cos(c.a) * c.rr, Math.sin(c.a) * c.rr]} rotation={[0, 0, -Math.PI / 2]} material={M.chrome}><cylinderGeometry args={[0.09, 0.09, 0.08, 16]} /></mesh>
        ))}
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={M.chrome}><coneGeometry args={[0.16, 0.25, 20]} /></mesh>
      </group>
    </group>
  );
};

/** Thrust wall, rails, four cylinders and the thrust ring at x = R. */
export const JackFrame: React.FC<{ R: number; M: Mats }> = ({ R, M }) => {
  const ring = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.4, -1.25); s.lineTo(1.4, -1.25); s.lineTo(1.4, 1.25); s.lineTo(-1.4, 1.25); s.lineTo(-1.4, -1.25);
    const h = new THREE.Path(); h.absarc(0, 0, RI * 0.95, 0, Math.PI * 2, true); s.holes.push(h);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    g.rotateY(Math.PI / 2);
    return g;
  }, []);
  const barrelEnd = XR0 - 0.1;
  const barrelStart = JP.x0 + 0.75;
  const cyl: [number, number][] = [[-0.62, 1.12], [0.62, 1.12], [-0.62, -1.12], [0.62, -1.12]];
  return (
    <group>
      {/* thrust (reaction) wall */}
      <Box a={[JP.x0, PIT_FLOOR, -2.9]} b={[JP.x0 + 0.7, -3.4, 0]} m={M.concrete} r />
      {/* guide rails */}
      {[-0.55, 0.55].map((z) => <Box key={z} a={[JP.x0 + 0.7, PIT_FLOOR, z - 0.12]} b={[JP.x1, YP - RP + 0.05, z + 0.12]} m={M.steel} />)}
      {/* frame */}
      <Box a={[barrelStart - 0.1, YP - 1.45, -1.55]} b={[barrelStart + 0.15, YP + 1.45, 1.55]} m={M.yellow} r />
      {cyl.map(([dy, dz], i) => (
        <group key={i}>
          <mesh position={[(barrelStart + barrelEnd) / 2, YP + dy, dz]} rotation={[0, 0, -Math.PI / 2]} material={M.yellow} castShadow>
            <cylinderGeometry args={[0.2, 0.2, barrelEnd - barrelStart, 24]} />
          </mesh>
          <mesh position={[(barrelEnd + R) / 2, YP + dy, dz]} rotation={[0, 0, -Math.PI / 2]} material={M.chrome} castShadow>
            <cylinderGeometry args={[0.11, 0.11, Math.max(0.05, R - barrelEnd), 20]} />
          </mesh>
        </group>
      ))}
      <mesh geometry={ring} position={[R - 0.25, YP, 0]} material={M.steel} castShadow />
    </group>
  );
};

/** The jacked string: newest segment rear at R, then n segments, then the machine. */
export const PipeString: React.FC<{ t: number; M: Mats; hideFrom?: number }> = ({ t, M }) => {
  const js = jackState(t);
  return (
    <group>
      {Array.from({ length: js.n }, (_, i) => <PipeSeg key={i} x={js.R + i * SEG} M={M} />)}
      {js.lower >= 0 && <PipeSeg x={XR0} y={YP + js.lower * 9} M={M} />}
      <Machine F={js.F} spin={js.spin} M={M} />
      {/* undug clay ahead of the machine (fills the notch on the cut face) */}
      {js.F < RPIT.x0 && <SoilPlug x0={js.F + 0.02} x1={RPIT.x0 - WALL} m={M.clay} />}
      {js.F < RPIT.x0 && <SoilPlug x0={Math.max(js.F + 0.02, RPIT.x0 - WALL)} x1={RPIT.x0} m={M.concrete} />}
      <JackFrame R={js.R} M={M} />
    </group>
  );
};
const SoilPlug: React.FC<{ x0: number; x1: number; m: THREE.Material }> = ({ x0, x1, m }) => {
  const len = Math.max(0.01, x1 - x0);
  return (
    <group position={[x0 + len / 2, YP, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} material={m} receiveShadow><cylinderGeometry args={[RM + 0.01, RM + 0.01, len, 32, 1, false, Math.PI / 2, Math.PI]} /></mesh>
      <mesh position={[0, 0, 0.001]} material={m} receiveShadow><planeGeometry args={[len, 2 * RM + 0.02]} /></mesh>
    </group>
  );
};

/** Laser theodolite in the launch pit and the beam through the string to the target behind the machine. */
export const Laser: React.FC<{ t: number; on: number; M: Mats }> = ({ t, on, M }) => {
  if (on <= 0.01) return null;
  const js = jackState(t);
  const x0 = JP.x0 + 0.85, x1 = js.F - MLEN + 0.05;
  return (
    <group>
      <Box a={[x0 - 0.25, YP - 0.25, -0.2]} b={[x0 + 0.15, YP + 0.12, 0.2]} m={M.dark} r />
      <mesh position={[(x0 + x1) / 2, YP, 0]} rotation={[0, 0, -Math.PI / 2]} material={M.laser} scale={[on, 1, on]}><cylinderGeometry args={[0.045, 0.045, x1 - x0, 8]} /></mesh>
      <mesh position={[(x0 + x1) / 2, YP, 0]} rotation={[0, 0, -Math.PI / 2]} material={M.glow} scale={[on, 1, on]}><cylinderGeometry args={[0.1, 0.1, x1 - x0, 12]} /></mesh>
      {/* target plate */}
      <mesh position={[x1 - 0.02, YP, 0]} rotation={[0, -Math.PI / 2, 0]}><circleGeometry args={[0.35, 32]} /><meshStandardMaterial color="#f4f1ea" emissive="#ffffff" emissiveIntensity={0.25} /></mesh>
      <mesh position={[x1 - 0.04, YP, 0]} rotation={[0, -Math.PI / 2, 0]}><ringGeometry args={[0.12, 0.16, 32]} /><meshBasicMaterial color="#202020" /></mesh>
      <mesh position={[x1 - 0.05, YP, 0]} rotation={[0, -Math.PI / 2, 0]} material={M.laser}><circleGeometry args={[0.06 * on, 16]} /></mesh>
    </group>
  );
};

// ---------- workers ----------
const Helmet: React.FC<{ c: string }> = ({ c }) => (
  <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>
);
export const Workers: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <ToyPerson f={f} seed={11} pose="point" outfit="uniform" position={[-18.5, 0, -0.6]} heading={-Math.PI / 2 - 0.5} scale={1.7} headwear={<Helmet c={C.yellow} />} />
    <ToyPerson f={f} seed={23} pose="stand" outfit="uniform" position={[17.3, 0, -1.6]} heading={-1.1} scale={1.7} headwear={<Helmet c="#f4f1ea" />} />
  </group>
);

// ---------- lights ----------
/** Narrow warm spot that pools light on the subject only (radius in metres at the target). */
export const SubjectSpot: React.FC<{ tgt: THREE.Vector3; from: [number, number, number]; radius: number; intensity?: number; color?: string }> = ({ tgt, from, radius, intensity = 7, color = "#ffe6c4" }) => {
  const spot = useMemo(() => { const s = new THREE.SpotLight(); s.decay = 0; s.penumbra = 0.75; return s; }, []);
  const pos = new THREE.Vector3(tgt.x + from[0], tgt.y + from[1], tgt.z + from[2]);
  spot.position.copy(pos);
  spot.target.position.copy(tgt);
  spot.target.updateMatrixWorld();
  spot.angle = Math.min(1.2, Math.atan(radius / pos.distanceTo(tgt)) * 1.35);
  spot.intensity = intensity;
  spot.color.set(color);
  return <><primitive object={spot} /><primitive object={spot.target} /></>;
};

export const StreetLights: React.FC<{ golden?: number }> = ({ golden = 0 }) => {
  const sunCol = new THREE.Color("#ffe2b8").lerp(new THREE.Color("#ffb070"), golden);
  return (
    <>
      <hemisphereLight args={["#dfe6f2", "#2a241d", 0.2]} />
      <ambientLight intensity={0.04} />
      {/* warm low key */}
      <directionalLight position={[-40, 14 - golden * 5, 55]} intensity={3.4} color={sunCol} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-near={1} shadow-camera-far={160}
        shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-bias={-0.0004} />
      {/* strong cold rims from above-behind: they catch the top/back of pipes and machines but never the
          section face (its normal points at the camera), so the cut soil stays dark behind the subject */}
      <directionalLight position={[-18, 40, -26]} intensity={4.2} color="#8fc2ff" />
      <directionalLight position={[34, 22, -40]} intensity={2.6} color="#a9cfff" />
      <directionalLight position={[45, 6, 30]} intensity={0.6} color="#bcd6ff" />
      {/* fill on the cut face */}
      <directionalLight position={[10, -4, 40]} intensity={0.25} color="#fff4e6" />
    </>
  );
};
