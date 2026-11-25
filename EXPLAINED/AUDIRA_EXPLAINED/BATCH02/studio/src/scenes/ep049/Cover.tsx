// EP049 cover — "Baja Kok Bisa Mengapung?" (CLAYWORLD).
// A plasticine tank cut open along its front: on the left a small steel nail lies on the bottom,
// on the right a big steel cargo ship floats, cut along its centreline so the hollow, air-filled hull
// shows through the cut. Mustard arrows push up under the keel (buoyancy).
// Deterministic: everything derives from useCurrentFrame(); the thumb-print relief uses a seeded hash.

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CLAY_PALETTE as P } from "../../kits/clayworld/lib/palette";
import { stepFrame } from "../../kits/clayworld/core/motion";
import { MANROPE } from "../../core/type/fonts.ts";

// ---------- palette (kit tones + episode water/steel) ----------
export const C = {
  bg: "#E59A5C",
  sweep: "#E8A46A",
  table: P.tabletopBoard,
  water: "#4AA6DA",
  waterDeep: "#3B93C9",
  waterTop: "#86C8EC",
  tank: P.clayCream,
  hullTop: "#2F3A4A",
  hullBottom: P.terracotta,
  steel: "#8E99A3",
  air: "#F3E6D0",
  arrow: P.mustard,
  cream: P.clayCream,
};

// ---------- fonts ----------
export const ANTON = "EP049 Anton";
let antonLoading: Promise<void> | null = null;
export const useAnton = () => {
  const [handle] = useState(() => delayRender("EP049 Anton"));
  useEffect(() => {
    antonLoading ??= new FontFace(ANTON, `url(${staticFile("fonts/ep049/Anton-Regular.ttf")})`)
      .load()
      .then((f) => {
        (document.fonts as unknown as { add(face: FontFace): void }).add(f);
      });
    antonLoading.then(
      () => continueRender(handle),
      () => continueRender(handle),
    );
  }, [handle]);
};

// ---------- helpers ----------
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
};

export const usePrintTex = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) {
      const x = rnd(i) * 512, y = rnd(i + 100) * 512, r = 22 + rnd(i + 200) * 44;
      g.strokeStyle = `rgba(${rnd(i + 300) > 0.5 ? "255,255,255" : "0,0,0"},0.10)`;
      g.lineWidth = 2;
      for (let k = 0; k < 7; k++) {
        g.beginPath();
        g.ellipse(x, y, r - k * 3.4, (r - k * 3.4) * 0.72, rnd(i + 400) * 3, 0, Math.PI * 2);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.5, 1.5);
    return t;
  }, []);

const Tactile: React.FC<{ tex: THREE.Texture }> = ({ tex }) => {
  const { scene, gl } = useThree();
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m && m.isMeshStandardMaterial && m.bumpMap !== tex && !m.userData.smooth) {
        m.bumpMap = tex;
        m.bumpScale = 8;
        m.needsUpdate = true;
      }
    });
  });
  return null;
};

export const clay = (color: string, roughness = 0.84) => <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />;

// ---------- geometry ----------
export const WATER_Y = 2.45;
export const TANK_X = 3.35; // inner half-width
export const TANK_D = 3.0; // depth behind the cut
export const BEAM = 1.05; // half beam of the ship (cut on its centreline)

export const wave = (x: number) => WATER_Y + Math.sin(x * 3.1 + 0.6) * 0.045 + Math.sin(x * 7.3) * 0.02;

// ship side profile (outer), counter-clockwise from the stern deck
export const SHIP_X0 = -1.05;
// cruiser stern on the left, bulbous bow and raked stem on the right
export const HULL_OUT: [number, number][] = [
  [SHIP_X0 + 0.0, 3.18],
  [SHIP_X0 - 0.14, 2.8],
  [SHIP_X0 - 0.06, 2.25],
  [SHIP_X0 + 0.15, 1.5],
  [SHIP_X0 + 0.45, 1.12],
  [SHIP_X0 + 0.8, 1.02],
  [SHIP_X0 + 3.0, 1.02],
  [SHIP_X0 + 3.36, 1.07],
  [SHIP_X0 + 3.56, 1.28],
  [SHIP_X0 + 3.56, 1.56],
  [SHIP_X0 + 3.4, 1.76],
  [SHIP_X0 + 3.52, 2.1],
  [SHIP_X0 + 3.9, 3.3],
];
export const HULL_IN: [number, number][] = [
  [SHIP_X0 + 0.14, 3.02],
  [SHIP_X0 + 0.06, 2.25],
  [SHIP_X0 + 0.26, 1.58],
  [SHIP_X0 + 0.52, 1.26],
  [SHIP_X0 + 0.85, 1.16],
  [SHIP_X0 + 2.95, 1.16],
  [SHIP_X0 + 3.24, 1.26],
  [SHIP_X0 + 3.3, 1.5],
  [SHIP_X0 + 3.33, 2.1],
  [SHIP_X0 + 3.66, 3.02],
];

// x where the hull's outer outline crosses the waterline (stern side, bow side)
export const crossX = (pts: [number, number][], y: number, fromEnd: boolean) => {
  const seq = fromEnd ? [...pts].reverse() : pts;
  for (let i = 0; i < seq.length - 1; i++) {
    const [x0, y0] = seq[i];
    const [x1, y1] = seq[i + 1];
    if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  }
  return seq[0][0];
};

export const hullShape = (withHole: boolean) => {
  const s = new THREE.Shape(HULL_OUT.map(([x, y]) => new THREE.Vector2(x, y)));
  if (withHole) s.holes.push(new THREE.Path(HULL_IN.map(([x, y]) => new THREE.Vector2(x, y))));
  return s;
};

// front water slab: hull-shaped notch below the waterline
const waterFrontShape = () => {
  const s = new THREE.Shape();
  const xs = crossX(HULL_OUT, WATER_Y, false); // stern crossing
  const xb = crossX(HULL_OUT, WATER_Y, true); // bow crossing
  s.moveTo(-TANK_X, 0);
  s.lineTo(TANK_X, 0);
  s.lineTo(TANK_X, wave(TANK_X));
  for (let x = TANK_X; x > xb; x -= 0.08) s.lineTo(x, wave(x));
  s.lineTo(xb + 0.03, WATER_Y);
  // follow the hull bottom from bow to stern, below the waterline
  const under = [...HULL_OUT].reverse().filter(([, y]) => y < WATER_Y);
  for (const [x, y] of under) s.lineTo(x, y - 0.005);
  s.lineTo(xs - 0.03, WATER_Y);
  for (let x = xs; x > -TANK_X; x -= 0.08) s.lineTo(x, wave(x));
  s.lineTo(-TANK_X, wave(-TANK_X));
  s.closePath();
  return s;
};

export const waterBackShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-TANK_X, 0);
  s.lineTo(TANK_X, 0);
  for (let x = TANK_X; x >= -TANK_X; x -= 0.08) s.lineTo(x, wave(x));
  s.closePath();
  return s;
};

export const ext = (shape: THREE.Shape, depth: number, bevel = 0.035) =>
  new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 12 });

// ---------- scene pieces ----------
export const Tank: React.FC = () => {
  const wall = 0.32;
  const H = 3.15;
  return (
    <group>
      {/* bottom slab */}
      <mesh position={[0, -wall / 2, -TANK_D / 2]}>
        <primitive object={new RoundedBoxGeometry(TANK_X * 2 + wall * 2, wall, TANK_D + wall, 3, 0.1)} attach="geometry" />
        {clay(C.tank)}
      </mesh>
      {/* side walls */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (TANK_X + wall / 2), H / 2 - wall / 2, -TANK_D / 2]}>
          <primitive object={new RoundedBoxGeometry(wall, H + wall, TANK_D + wall, 3, 0.1)} attach="geometry" />
          {clay(C.tank)}
        </mesh>
      ))}
      {/* back wall */}
      <mesh position={[0, H / 2 - wall / 2, -TANK_D - wall / 2]}>
        <primitive object={new RoundedBoxGeometry(TANK_X * 2 + wall * 2, H + wall, wall, 3, 0.1)} attach="geometry" />
        {clay(C.tank)}
      </mesh>
      {/* coral rim rolled along the top edge */}
      {[-1, 1].map((sx) => (
        <mesh key={`r${sx}`} position={[sx * (TANK_X + wall / 2), H, -TANK_D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.2, TANK_D + 0.1, 6, 16]} />
          {clay(P.coral)}
        </mesh>
      ))}
      <mesh position={[0, H, -TANK_D - wall / 2]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, TANK_X * 2 + wall * 2, 6, 16]} />
        {clay(P.coral)}
      </mesh>
    </group>
  );
};

const Water: React.FC = () => {
  const front = useMemo(() => ext(waterFrontShape(), BEAM - 0.04, 0.03), []);
  const back = useMemo(() => ext(waterBackShape(), TANK_D - BEAM - 0.04, 0.03), []);
  return (
    <group>
      <mesh geometry={front} position={[0, 0, -BEAM + 0.01]}>{clay(C.water, 0.7)}</mesh>
      <mesh geometry={back} position={[0, 0, -TANK_D]}>{clay(C.waterDeep, 0.7)}</mesh>
      {/* little rolled clay ripples on the surface */}
      {[[-2.6, -1.6], [-1.4, -2.3], [2.9, -2.2], [-2.0, -0.45]].map(([x, z], i) => (
        <mesh key={i} position={[x, wave(x) + 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28 + i * 0.04, 0.035, 8, 28]} />
          {clay(C.waterTop, 0.6)}
        </mesh>
      ))}
    </group>
  );
};

export const Arrow: React.FC<{ x: number; y0: number; y1: number; z?: number; color?: string; r?: number }> = ({ x, y0, y1, z = 0.12, color = C.arrow, r = 0.085 }) => {
  const len = y1 - y0 - r * 3.2;
  return (
    <group position={[x, y0, z]}>
      <mesh position={[0, len / 2, 0]}>
        <capsuleGeometry args={[r, len, 6, 14]} />
        {clay(color)}
      </mesh>
      <mesh position={[0, len + r * 1.6, 0]}>
        <coneGeometry args={[r * 2.6, r * 3.6, 20]} />
        {clay(color)}
      </mesh>
    </group>
  );
};

const Ship: React.FC<{ bob: number }> = ({ bob }) => {
  const outer = useMemo(() => ext(hullShape(true), BEAM, 0.03), []);
  const back = useMemo(() => new THREE.ShapeGeometry(hullShape(false)), []);
  const below = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, -1, 0), WATER_Y + 0.02)], []);
  const stripe = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(WATER_Y + 0.02)), new THREE.Plane(new THREE.Vector3(0, -1, 0), WATER_Y + 0.14)], []);
  const above = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(WATER_Y + 0.14))], []);
  const cont = [P.coral, P.mustard, P.dustyTeal, P.olive, P.clayCream, P.terracotta];
  const boxes: [number, number, string][] = [];
  for (let col = 0; col < 5; col++) for (let tier = 0; tier < 2 + (col % 2 === 0 ? 1 : 0); tier++) boxes.push([1.1 + col * 0.56, tier, cont[(col * 3 + tier * 2) % cont.length]]);
  return (
    <group position={[0, bob, 0]}>
      {/* hull shell, two-tone: red below the boot-top, navy above */}
      <mesh geometry={outer} position={[0, 0, -BEAM]}>
        <meshStandardMaterial color={C.hullBottom} roughness={0.8} metalness={0.05} clippingPlanes={below} />
      </mesh>
      <mesh geometry={outer} position={[0, 0, -BEAM]}>
        <meshStandardMaterial color={C.hullTop} roughness={0.78} metalness={0.06} clippingPlanes={above} />
      </mesh>
      {/* boot-top stripe: the ship's waterline mark */}
      <mesh geometry={outer} position={[0, 0, -BEAM]}>
        <meshStandardMaterial color={C.cream} roughness={0.8} metalness={0.02} clippingPlanes={stripe} />
      </mesh>
      {/* hollow interior: the air inside, closed at the far side */}
      <mesh geometry={back} position={[0, 0, -BEAM + 0.04]}>{clay(C.air, 0.9)}</mesh>
      {/* frames / bulkheads inside the hull */}
      {[1.15, 2.15, 3.0].map((x, i) => (
        <mesh key={i} position={[SHIP_X0 + x, 2.1, -BEAM / 2]}>
          <boxGeometry args={[0.07, 1.85, BEAM - 0.05]} />
          {clay(C.steel, 0.7)}
        </mesh>
      ))}
      {/* deck furniture: containers (cut on the centreline too) */}
      {boxes.map(([x, tier, col], i) => (
        <mesh key={i} position={[SHIP_X0 + x, 3.2 + 0.24 + tier * 0.46, -0.48]}>
          <primitive object={new RoundedBoxGeometry(0.52, 0.44, 0.92, 2, 0.05)} attach="geometry" />
          {clay(col)}
        </mesh>
      ))}
      {/* bridge house at the stern */}
      <group position={[SHIP_X0 + 0.45, 3.2, -0.5]}>
        <mesh position={[0, 0.6, 0]}>
          <primitive object={new RoundedBoxGeometry(0.7, 1.2, 0.95, 3, 0.07)} attach="geometry" />
          {clay(C.cream)}
        </mesh>
        <mesh position={[0, 1.27, 0]}>
          <primitive object={new RoundedBoxGeometry(0.95, 0.22, 1.05, 3, 0.06)} attach="geometry" />
          {clay(C.cream)}
        </mesh>
        <mesh position={[0.02, 0.98, 0.48]}>
          <boxGeometry args={[0.6, 0.13, 0.04]} />
          {clay(P.charcoal, 0.4)}
        </mesh>
        <mesh position={[0.02, 0.62, 0.48]}>
          <boxGeometry args={[0.6, 0.09, 0.04]} />
          {clay(P.charcoal, 0.4)}
        </mesh>
        {/* funnel */}
        <mesh position={[-0.12, 1.62, -0.15]}>
          <cylinderGeometry args={[0.15, 0.19, 0.5, 18]} />
          {clay(P.terracotta)}
        </mesh>
        <mesh position={[-0.12, 1.89, -0.15]}>
          <cylinderGeometry args={[0.155, 0.155, 0.08, 18]} />
          {clay(P.charcoal)}
        </mesh>
      </group>
      {/* buoyancy arrows pushing on the keel */}
      {[0.75, 1.5, 2.25, 3.0].map((x, i) => (
        <Arrow key={i} x={SHIP_X0 + x} y0={0.18} y1={0.96} />
      ))}
    </group>
  );
};

export const Nail: React.FC = () => (
  // lying on the tank floor, half of it in front of the cut so it reads through the water
  <group position={[-2.35, 0.1, 0.0]} rotation={[0, 0, 0.08]} scale={1.0}>
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.075, 0.075, 1.3, 18]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.075, 0.26, 18]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.07, 22]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
    </group>
  </group>
);

const Bubbles: React.FC = () => (
  <group>
    {[[-2.05, 0.95, 0.085], [-2.25, 1.35, 0.065], [-2.08, 1.72, 0.05], [-2.22, 2.05, 0.04]].map(([x, y, r], i) => (
      <mesh key={i} position={[x, y, 0.0]}>
        <sphereGeometry args={[r, 16, 12]} />
        {clay("#DDF0FA", 0.5)}
      </mesh>
    ))}
    {/* sink trail: three short pressed dashes */}
    {[1.0, 1.4, 1.8].map((y, i) => (
      <mesh key={`d${i}`} position={[-2.75, y, 0.02]}>
        <capsuleGeometry args={[0.035, 0.22, 4, 10]} />
        {clay("#BFE0F2", 0.6)}
      </mesh>
    ))}
  </group>
);

export const Coil: React.FC<{ p: [number, number, number]; r: number; color: string; rot?: number }> = ({ p, r, color, rot = 0 }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, rot]}>
    <torusGeometry args={[r, 0.11, 12, 40, Math.PI * 1.6]} />
    {clay(color)}
  </mesh>
);

export const SpareNail: React.FC<{ p: [number, number, number]; ry: number; s?: number }> = ({ p, ry, s = 1 }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 14]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.53, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.06, 0.18, 14]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 18]} />
        <meshStandardMaterial color={C.steel} roughness={0.5} metalness={0.25} />
      </mesh>
    </group>
  </group>
);

const Props: React.FC = () => (
  <group>
    {/* big clay lifebuoy in the foreground, right */}
    <group position={[2.7, -0.12, 4.4]} rotation={[-Math.PI / 2 + 0.18, 0, 0.4]}>
      <mesh>
        <torusGeometry args={[0.72, 0.24, 16, 40]} />
        {clay(P.coral)}
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} rotation={[0, 0, (k * Math.PI) / 2 + Math.PI / 4]}>
          <torusGeometry args={[0.72, 0.245, 16, 40, 0.38]} />
          {clay(C.cream)}
        </mesh>
      ))}
    </group>
    {/* little clay dish holding spare nails, left */}
    <group position={[-2.4, -0.33, 4.3]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.85, 0.78, 0.12, 36]} />
        {clay(P.dustyTeal)}
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.08, 10, 40]} />
        {clay(P.dustyTeal)}
      </mesh>
      <SpareNail p={[-0.1, 0.16, 0.05]} ry={0.4} />
      <SpareNail p={[0.12, 0.2, -0.15]} ry={-0.5} />
      <SpareNail p={[0.0, 0.24, 0.25]} ry={1.4} s={0.9} />
    </group>
    {/* rolled clay snakes and pebbles: the modeller's table */}
    <Coil p={[0.2, -0.22, 5.3]} r={0.36} color={P.mustard} rot={0.7} />
    <Coil p={[-0.9, -0.22, 3.0]} r={0.24} color={P.olive} rot={2.2} />
    {[[1.1, 3.4, 0.2, P.terracotta], [-0.3, 4.1, 0.15, P.dustyTeal], [3.9, 2.4, 0.17, P.mustard], [-3.8, 2.5, 0.2, P.coral]].map(([x, z, r, c], i) => (
      <mesh key={i} position={[x as number, -0.33 + (r as number) * 0.6, z as number]} scale={[1.2, 0.7, 1]}>
        <sphereGeometry args={[r as number, 18, 12]} />
        {clay(c as string)}
      </mesh>
    ))}
  </group>
);

// ---------- camera ----------
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };
const camAt = (f: number): Cam => {
  const sf = stepFrame(f, 4);
  return {
    pos: [0.3 + Math.sin(sf * 0.01) * 0.04, 7.5, 23],
    target: [0.2, 2.15, -1],
    fov: 34,
  };
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.lookAt(...cam.target);
    p.fov = cam.fov;
    p.near = 0.1;
    p.far = 200;
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [cam, camera, gl]);
  return null;
};

// project a world point to 1080x1920 overlay pixels with the same camera
export const project = (cam: Cam, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920 };
};

const Label: React.FC<{ at: { x: number; y: number }; text: string; size?: number; color?: string; dx?: number; dy?: number; soft?: boolean }> = ({ at, text, size = 40, color = C.cream, dx = 0, dy = 0, soft = false }) => (
  <div
    style={{
      position: "absolute",
      left: at.x + dx,
      top: at.y + dy,
      transform: "translate(-50%, -50%)",
      fontFamily: MANROPE,
      fontWeight: 600,
      fontSize: size,
      color,
      whiteSpace: "nowrap",
      letterSpacing: "0.02em",
      ...(soft ? { background: "rgba(246,239,227,0.92)", padding: "6px 22px 8px", borderRadius: 999, boxShadow: "0 4px 0 rgba(122,58,28,0.35)" } : {}),
      textShadow: soft ? "none" : "0 3px 0 rgba(43,39,37,0.55), 0 6px 14px rgba(43,39,37,0.35)",
    }}
  >
    {text}
  </div>
);

export const Cover: React.FC = () => {
  useAnton();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const sf = stepFrame(f, 4);
  const bob = Math.sin(sf * 0.05) * 0.015;
  const cam = useMemo(() => camAt(f), [f]);
  const tex = usePrintTex();

  const lNail = project(cam, [-2.35, 0.1, 0.2]);
  const lAir = project(cam, [SHIP_X0 + 1.65, 2.45, 0]);
  const lBuoy = project(cam, [SHIP_X0 + 2.0, 0.55, 0.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: cam.fov, near: 0.1, far: 200, position: cam.pos }}
      >
        <color attach="background" args={[C.bg]} />
        <CameraRig cam={cam} />
        <hemisphereLight args={["#fff2df", "#7a5a44", 0.95]} />
        <directionalLight
          position={[-5, 11, 9]}
          intensity={3.3}
          color="#ffe9cc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0006}
          shadow-radius={4}
        />
        <pointLight position={[6, 4, 5]} intensity={22} color="#ffd2a8" />
        <pointLight position={[-2, 6, -7]} intensity={30} color={P.warmRimLight} />
        {/* paper sweep and table */}
        <mesh position={[0, 0, -12]}>
          <planeGeometry args={[80, 60]} />
          <meshStandardMaterial color={C.sweep} roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[40, 48]} />
          <meshStandardMaterial color={C.table} roughness={0.9} />
        </mesh>
        <Tank />
        <Water />
        <Nail />
        <Bubbles />
        <Ship bob={bob} />
        <Props />
        <Tactile tex={tex} />
      </ThreeCanvas>

      <AbsoluteFill style={{ transform: `scale(${width / 1080})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
        {/* soft vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(60,30,15,0.32) 100%)" }} />
        {/* title block */}
        <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MANROPE, fontWeight: 600, fontSize: 32, letterSpacing: "0.42em", paddingLeft: "0.42em", color: "#5A2E17" }}>AUDIRA EXPLAINED</div>
          <div
            style={{
              fontFamily: `'${ANTON}'`,
              fontSize: 150,
              lineHeight: 1.0,
              marginTop: 18,
              color: C.cream,
              textShadow: "0 7px 0 #B5532F, 0 14px 24px rgba(70,30,10,0.35)",
            }}
          >
            BAJA KOK BISA
            <br />
            <span style={{ color: "#FFE07A" }}>MENGAPUNG?</span>
          </div>
        </div>
        <Label at={lNail} text="paku baja" dy={-62} dx={0} size={38} />
        <Label at={lAir} text="udara" size={40} color="#7A3A1C" soft />
        <Label at={lBuoy} text="gaya apung" dx={0} dy={0} size={40} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
