// EP08 map plate: a machined aluminium plate with the western Mediterranean coast raised in satin
// champagne metal (stylised outline, not a survey map), brass city pins, the Madinat al-Zahra arcade
// model and copper route wires that draw themselves (payoff: Kordoba → Toledo → Salerno / Montpellier).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { CITY, MAP, geo } from "./world.ts";

// Stylised coast (lon, lat): Iberia, south France, Italy, joined along the plate's north edge.
const LAND: [number, number][] = [
  [-9.3, 43.0], [-8.0, 43.7], [-5.8, 43.6], [-3.8, 43.5], [-1.8, 43.4], [-1.4, 44.6], [-1.2, 46.1],
  [13.4, 46.1], [12.3, 45.3], [12.4, 44.2], [13.6, 43.5], [14.0, 42.6], [15.2, 41.9], [16.0, 41.4],
  [17.0, 41.0], [18.5, 40.1], [17.2, 39.6], [17.1, 38.9], [16.5, 38.4], [16.0, 37.95], [15.6, 38.2],
  [15.7, 39.0], [15.6, 40.0], [14.8, 40.6], [14.0, 40.8], [13.0, 41.2], [12.3, 41.7], [11.1, 42.4],
  [10.5, 43.0], [10.2, 43.9], [8.8, 44.4], [7.5, 43.8], [7.0, 43.6], [6.0, 43.1], [5.0, 43.3],
  [4.0, 43.5], [3.1, 43.1], [3.2, 42.4], [3.2, 41.9], [2.0, 41.3], [0.9, 41.0], [0.2, 40.2],
  [-0.3, 39.5], [0.2, 38.8], [-0.5, 38.3], [-0.8, 37.6], [-1.6, 37.0], [-2.1, 36.7], [-3.4, 36.7],
  [-4.4, 36.7], [-5.3, 36.1], [-5.9, 36.2], [-6.3, 36.8], [-7.0, 37.2], [-7.4, 37.2], [-7.9, 37.0],
  [-8.9, 37.0], [-8.8, 38.0], [-9.5, 38.7], [-9.0, 39.5], [-8.8, 40.5], [-8.7, 41.5], [-8.9, 42.2],
];

const landGeometry = () => {
  const s = new THREE.Shape();
  LAND.forEach(([lon, lat], i) => {
    const [x, , z] = geo(lon, lat);
    // shape lives in XY; rotate to XZ later (y = -z so north stays far)
    if (i === 0) s.moveTo(x, -z);
    else s.lineTo(x, -z);
  });
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1, curveSegments: 4 });
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
};

/** Thin engraved graticule on the sea face. */
let gratTex: THREE.CanvasTexture | null = null;
const graticule = () => {
  if (gratTex) return gratTex;
  const cv = document.createElement("canvas");
  cv.width = 2048;
  cv.height = 1024;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#2b3640";
  c.fillRect(0, 0, 2048, 1024);
  c.strokeStyle = "rgba(190,205,215,0.22)";
  c.lineWidth = 2;
  for (let i = 1; i < 16; i++) {
    c.beginPath();
    c.moveTo((i * 2048) / 16, 0);
    c.lineTo((i * 2048) / 16, 1024);
    c.stroke();
  }
  for (let j = 1; j < 6; j++) {
    c.beginPath();
    c.moveTo(0, (j * 1024) / 6);
    c.lineTo(2048, (j * 1024) / 6);
    c.stroke();
  }
  gratTex = new THREE.CanvasTexture(cv);
  gratTex.colorSpace = THREE.SRGBColorSpace;
  gratTex.anisotropy = 8;
  return gratTex;
};

/** Brushed-metal streak texture (bump + roughness) so the land reads as machined aluminium, not plaster. */
let brushTex: THREE.CanvasTexture | null = null;
const brushed = () => {
  if (brushTex) return brushTex;
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1024;
  const c = cv.getContext("2d")!;
  let seed = 4242;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  c.fillStyle = "#808080";
  c.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) {
    const y = r() * 1024, v = 90 + r() * 80;
    c.strokeStyle = `rgba(${v},${v},${v},0.55)`;
    c.lineWidth = 0.6 + r() * 1.4;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(1024, y + (r() - 0.5) * 4);
    c.stroke();
  }
  brushTex = new THREE.CanvasTexture(cv);
  brushTex.wrapS = brushTex.wrapT = THREE.RepeatWrapping;
  brushTex.repeat.set(3, 3);
  return brushTex;
};

const Pin: React.FC<{ at: readonly [number, number]; k: number; color?: string }> = ({ at, k, color = "#c39352" }) => {
  if (k <= 0.001) return null;
  const [x, y, z] = geo(at[0], at[1]);
  const h = 0.32 * k;
  return (
    <group position={[x, y + 0.05, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, h, 12]} />
        <meshPhysicalMaterial color="#d9dcdf" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, h, 0]} castShadow>
        <sphereGeometry args={[0.065 * k, 24, 16]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.22} clearcoat={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.05, 0.075 * (0.6 + 0.4 * k), 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

/** Madinat al-Zahra: a short horseshoe-arch arcade in pale stone (symbolic scale), rising from the plate. */
const arcadeGeometry = () => {
  const W = 1.0, H = 0.5, n = 3, r = 0.11, a = r * 0.8, h = 0.28;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, 0);
  s.lineTo(W / 2, 0);
  s.lineTo(W / 2, H);
  s.lineTo(-W / 2, H);
  s.closePath();
  for (let i = 0; i < n; i++) {
    const cx = -W / 2 + (W / n) * (i + 0.5);
    const p = new THREE.Path();
    p.moveTo(cx - a, 0.03);
    p.lineTo(cx - a, h - 0.6 * r);
    p.absarc(cx, h, r, Math.PI + 0.6435, -0.6435, true);
    p.lineTo(cx + a, 0.03);
    p.closePath();
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -0.06);
  return g;
};

const Arcade: React.FC<{ k: number }> = ({ k }) => {
  const geom = useMemo(() => arcadeGeometry(), []);
  if (k <= 0.001) return null;
  const [x, y, z] = geo(CITY.zahra[0] - 0.9, CITY.zahra[1] + 0.25);
  return (
    <group position={[x, y + 0.05 - (1 - k) * 0.5, z]} rotation={[0, 0.35, 0]} scale={0.62}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshPhysicalMaterial color="#efe6d6" roughness={0.6} clearcoat={0.1} />
      </mesh>
      {/* red-and-white voussoir hint on the arch faces */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.04, 0.05, 0.16]} />
        <meshPhysicalMaterial color="#b0563a" roughness={0.55} />
      </mesh>
    </group>
  );
};

/** Copper wire route that grows from a to b (0..1) along a raised arc. */
const Route: React.FC<{ a: readonly [number, number]; b: readonly [number, number]; p: number; lift?: number }> = ({ a, b, p, lift = 0.5 }) => {
  const curve = useMemo(() => {
    const A = new THREE.Vector3(...geo(a[0], a[1], MAP.top + 0.2));
    const B = new THREE.Vector3(...geo(b[0], b[1], MAP.top + 0.2));
    const M = A.clone().lerp(B, 0.5);
    M.y += lift * Math.min(1, A.distanceTo(B) / 3);
    return new THREE.QuadraticBezierCurve3(A, M, B);
  }, [a, b, lift]);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 80, 0.028, 10, false), [curve]);
  if (p <= 0.001) return null;
  const count = Math.max(6, Math.floor(geom.index!.count * Math.min(1, p) / 60) * 60);
  geom.setDrawRange(0, count);
  const head = curve.getPoint(Math.min(1, p));
  return (
    <group>
      <mesh geometry={geom} castShadow>
        <meshPhysicalMaterial color="#d08a4e" metalness={1} roughness={0.2} clearcoat={0.5} />
      </mesh>
      {p < 1 ? (
        <mesh position={head}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshPhysicalMaterial color="#f0c38a" metalness={1} roughness={0.15} />
        </mesh>
      ) : null}
    </group>
  );
};

export type MapState = {
  pins: { kordoba: number; toledo: number; salerno: number; montpellier: number };
  arcade: number;
  routes: { toledo: number; salerno: number; montpellier: number };
};

export const MapPlate: React.FC<{ s: MapState }> = ({ s }) => {
  const land = useMemo(() => landGeometry(), []);
  const grat = useMemo(() => graticule(), []);
  const brush = useMemo(() => brushed(), []);
  const [x0, , z0] = geo(MAP.lonMin, MAP.latMax);
  const [x1, , z1] = geo(MAP.lonMax, MAP.latMin);
  const W = x1 - x0, D = z1 - z0;
  return (
    <group>
      {/* base block, brushed aluminium */}
      <mesh position={[(x0 + x1) / 2, 0, (z0 + z1) / 2]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W + 0.3, 0.18, D + 0.3]} radius={0.06} />
        <meshPhysicalMaterial color="#9fa3a8" metalness={1} roughness={0.55} roughnessMap={brush} anisotropy={0.8} />
      </mesh>
      {/* sea face, anodised slate with engraved graticule */}
      <mesh position={[(x0 + x1) / 2, 0.092, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial map={grat} metalness={0.55} roughness={0.42} clearcoat={0.3} />
      </mesh>
      {/* land, satin champagne metal */}
      <mesh geometry={land} position={[0, 0.09, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#d2c3a2" metalness={1} roughness={0.32} roughnessMap={brush} bumpMap={brush} bumpScale={0.35} anisotropy={0.85} anisotropyRotation={0.3} clearcoat={0.25} clearcoatRoughness={0.3} />
      </mesh>
      <Pin at={CITY.kordoba} k={s.pins.kordoba} color="#e0a463" />
      <Pin at={CITY.toledo} k={s.pins.toledo} />
      <Pin at={CITY.salerno} k={s.pins.salerno} />
      <Pin at={CITY.montpellier} k={s.pins.montpellier} />
      <Arcade k={s.arcade} />
      <Route a={CITY.kordoba} b={CITY.toledo} p={s.routes.toledo} lift={0.35} />
      <Route a={CITY.toledo} b={CITY.salerno} p={s.routes.salerno} lift={0.9} />
      <Route a={CITY.toledo} b={CITY.montpellier} p={s.routes.montpellier} lift={0.6} />
    </group>
  );
};
