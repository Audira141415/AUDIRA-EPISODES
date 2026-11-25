// AE-051 cover: "Kolam Umum Kok Tetap Jernih?" in FLUIDFORGE.
// Cutaway pool with caustic floor, the circulation loop drawn as liquid ribbons
// (skimmer + main drain -> pump -> sand filter -> chlorinator -> return inlet),
// liquid-chrome chlorine orbs breaking up germs, and a magnifier bubble in the foreground.
// Deterministic: everything derives from useCurrentFrame() and a seeded PRNG.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { LOGO_PATHS, LOGO_VIEWBOX } from "./logoPaths.ts";

export const C = {
  void: "#030a12",
  deep: "#06213a",
  water: "#1fb6ff",
  cyan: "#5ff4ff",
  chrome: "#e6edf5",
  germ: "#ff2e88",
  germ2: "#b8ff3a",
  sand: "#e9d29a",
  gravel: "#8d98a6",
  tile: "#eaf6ff",
  deck: "#dfe8ef",
  section: "#0b1a29",
};

// ---------- camera ----------
const CAM = { pos: new THREE.Vector3(1.0, 4.9, 12.9), target: new THREE.Vector3(0.05, -0.12, 0.2), fov: 31 };

const CamRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(CAM.pos);
    cam.fov = CAM.fov;
    cam.near = 0.1;
    cam.far = 80;
    cam.lookAt(CAM.target);
    cam.updateProjectionMatrix();
  });
  return null;
};

// Same projection on the HTML side, so callouts sit on their 3D anchors.
const project = (p: [number, number, number], w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, w / h, 0.1, 80);
  cam.position.copy(CAM.pos);
  cam.lookAt(CAM.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

// ---------- helpers ----------
export const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Tileable water caustic (port of the classic iterative caustic), baked to a canvas.
const causticTexture = (time: number) => {
  const N = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  const TAU = Math.PI * 2;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = ((x / N) * TAU) % TAU - 250;
      const py = ((y / N) * TAU) % TAU - 250;
      let ix = px, iy = py, c = 1;
      const inten = 0.005;
      for (let n = 0; n < 5; n++) {
        const t = time * (1 - 3.5 / (n + 1));
        const nx = px + Math.cos(t - ix) + Math.sin(t + iy);
        const ny = py + Math.sin(t - iy) + Math.cos(t + ix);
        ix = nx; iy = ny;
        c += 1 / Math.hypot(px / (Math.sin(ix + t) / inten), py / (Math.cos(iy + t) / inten));
      }
      c /= 5;
      c = 1.17 - Math.pow(c, 1.4);
      const v = Math.min(1, Math.pow(Math.abs(c), 8));
      const k = (y * N + x) * 4;
      img.data[k] = 40 + v * 215;
      img.data[k + 1] = 150 + v * 105;
      img.data[k + 2] = 210 + v * 45;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1.4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const gradientTexture = () => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 1024;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 520, 20, 256, 520, 620);
  g.addColorStop(0, "#0e4a6e");
  g.addColorStop(0.45, "#082a44");
  g.addColorStop(1, C.void);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 1024);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// ---------- pool ----------
export const P = { x0: -1.3, x1: 1.3, y0: 0.1, y1: 0.9, z0: -0.8, z1: 0.95, water: 0.8 };

export const Box: React.FC<{ a: [number, number, number]; b: [number, number, number]; children: React.ReactNode }> = ({ a, b, children }) => (
  <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}>
    <boxGeometry args={[b[0] - a[0], b[1] - a[1], b[2] - a[2]]} />
    {children}
  </mesh>
);

export const sectionMat = <meshStandardMaterial color={C.section} roughness={0.32} metalness={0.55} />;
export const tileMat = <meshPhysicalMaterial color={C.tile} roughness={0.16} metalness={0.05} clearcoat={1} clearcoatRoughness={0.08} />;
export const deckMat = <meshStandardMaterial color={C.deck} roughness={0.42} metalness={0.05} />;

const WaterSurface: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const w = P.x1 - P.x0, d = P.z1 - P.z0;
    const g = new THREE.PlaneGeometry(w, d, 90, 60);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const y =
        Math.sin(x * 5.2 + t * 1.7) * 0.012 +
        Math.sin(z * 7.1 - t * 1.3 + x * 1.8) * 0.01 +
        Math.sin(Math.hypot(x - 0.9, z - 0.2) * 14 - t * 4) * 0.008 * Math.exp(-Math.hypot(x - 0.9, z - 0.2) * 1.4);
      pos.setY(i, y);
    }
    g.computeVertexNormals();
    return g;
  }, [t]);
  return (
    <mesh geometry={geo} position={[(P.x0 + P.x1) / 2, P.water, (P.z0 + P.z1) / 2]} layers={FX_LAYER}>
      <meshPhysicalMaterial color="#7fd8ff" transparent opacity={0.42} roughness={0.02} metalness={0.25} clearcoat={1} envMapIntensity={1.6} depthWrite={false} />
    </mesh>
  );
};

const Pool: React.FC<{ t: number }> = ({ t }) => {
  const caustic = useMemo(() => causticTexture(t * 0.6 + 3.1), [t]);
  const zf = P.z1;
  return (
    <group>
      {/* ground blocks around the cavity (cut section at the front) */}
      <Box a={[-1.75, -0.3, -1.15]} b={[P.x0 - 0.02, P.y1, zf]}>{sectionMat}</Box>
      <Box a={[P.x1 + 0.02, -0.3, -1.15]} b={[1.75, P.y1, zf]}>{sectionMat}</Box>
      <Box a={[P.x0, -0.3, -1.15]} b={[P.x1, P.y1, P.z0 - 0.02]}>{sectionMat}</Box>
      <Box a={[P.x0, -0.3, P.z0]} b={[P.x1, P.y0 - 0.02, zf]}>{sectionMat}</Box>
      {/* deck */}
      <Box a={[-1.78, P.y1, -1.18]} b={[P.x0 - 0.02, P.y1 + 0.05, zf]}>{deckMat}</Box>
      <Box a={[P.x1 + 0.02, P.y1, -1.18]} b={[1.78, P.y1 + 0.05, zf]}>{deckMat}</Box>
      <Box a={[P.x0 - 0.02, P.y1, -1.18]} b={[P.x1 + 0.02, P.y1 + 0.05, P.z0 - 0.02]}>{deckMat}</Box>
      {/* tiled inner faces */}
      <Box a={[P.x0 - 0.02, P.y0, P.z0]} b={[P.x0, P.y1, zf]}>{tileMat}</Box>
      <Box a={[P.x1, P.y0, P.z0]} b={[P.x1 + 0.02, P.y1, zf]}>{tileMat}</Box>
      <Box a={[P.x0, P.y0, P.z0 - 0.02]} b={[P.x1, P.y1, P.z0]}>{tileMat}</Box>
      {/* caustic floor */}
      <mesh position={[0, P.y0 - 0.005, (P.z0 + zf) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[P.x1 - P.x0, zf - P.z0]} />
        <meshStandardMaterial map={caustic} emissiveMap={caustic} emissive="#9fefff" emissiveIntensity={0.55} roughness={0.25} />
      </mesh>
      {/* lane line on the floor */}
      <Box a={[-1.0, P.y0, 0.04]} b={[1.0, P.y0 + 0.004, 0.12]}>
        <meshStandardMaterial color="#0d3d63" roughness={0.3} />
      </Box>
      {/* water volume + front glass (cutaway) */}
      <mesh position={[0, (P.y0 + P.water) / 2, (P.z0 + zf) / 2]} layers={FX_LAYER}>
        <boxGeometry args={[P.x1 - P.x0 - 0.01, P.water - P.y0, zf - P.z0 - 0.01]} />
        <meshPhysicalMaterial color={C.water} transparent opacity={0.3} roughness={0.05} depthWrite={false} />
      </mesh>
      <mesh position={[0, (P.y0 + P.water) / 2, zf + 0.004]} layers={FX_LAYER}>
        <planeGeometry args={[P.x1 - P.x0, P.water - P.y0]} />
        <meshBasicMaterial color="#0aa6ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <WaterSurface t={t} />
      {/* glowing cut edge outlining the section */}
      {[
        [[P.x0 - 0.03, -0.3, zf], [P.x0 - 0.01, P.y1 + 0.05, zf + 0.012]],
        [[P.x1 + 0.01, -0.3, zf], [P.x1 + 0.03, P.y1 + 0.05, zf + 0.012]],
        [[P.x0 - 0.03, P.y0 - 0.03, zf], [P.x1 + 0.03, P.y0 - 0.01, zf + 0.012]],
        [[-1.78, P.y1 + 0.05, zf], [P.x0 - 0.01, P.y1 + 0.065, zf + 0.012]],
        [[P.x1 + 0.01, P.y1 + 0.05, zf], [1.78, P.y1 + 0.065, zf + 0.012]],
      ].map(([a, b], i) => (
        <Box key={i} a={a as [number, number, number]} b={b as [number, number, number]}>
          <meshBasicMaterial color={C.cyan} toneMapped={false} />
        </Box>
      ))}
      {/* skimmer mouth (left wall, at the waterline) and main drain grate */}
      <Box a={[P.x0 - 0.02, P.water - 0.08, 0.5]} b={[P.x0 + 0.03, P.water + 0.04, 0.78]}>
        <meshStandardMaterial color="#1c2733" metalness={0.9} roughness={0.2} />
      </Box>
      <mesh position={[0, P.y0 + 0.006, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 40]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.12} />
      </mesh>
      {[-0.09, -0.045, 0, 0.045, 0.09].map((dx) => (
        <Box key={dx} a={[dx - 0.008, P.y0 + 0.007, 0.25]} b={[dx + 0.008, P.y0 + 0.012, 0.45]}>
          <meshStandardMaterial color="#132231" />
        </Box>
      ))}
      {/* return inlet (right wall) */}
      <mesh position={[P.x1 - 0.02, 0.55, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.07, 0.07, 28]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.08} />
      </mesh>
      {/* ladder rails (chrome) */}
      {[-0.95, -0.7].map((x) => (
        <mesh key={x} position={[x, P.y1 + 0.2, P.z0 + 0.05]}>
          <torusGeometry args={[0.16, 0.018, 12, 40, Math.PI]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- circulation pipes ----------
export type V3 = [number, number, number];
export const ZP = 1.12;
export const PIPES: { pts: V3[]; color: string; glow: number; speed: number }[] = [
  // skimmer -> down the left side -> pump
  { pts: [[-1.3, 0.76, 0.64], [-1.55, 0.74, 0.9], [-1.6, 0.6, ZP], [-1.6, -0.6, ZP], [-1.45, -1.25, ZP], [-1.15, -1.55, 0.95]], color: "#3bd6c6", glow: 0.9, speed: 0.06 },
  // main drain -> under the floor -> joins the left riser
  { pts: [[0, 0.1, 0.35], [0, -0.12, 0.6], [-0.35, -0.28, ZP], [-1.0, -0.4, ZP], [-1.6, -0.55, ZP]], color: "#3bd6c6", glow: 0.9, speed: 0.06 },
  // pump -> sand filter
  { pts: [[-0.6, -1.62, 0.95], [-0.1, -1.68, ZP], [0.45, -1.6, ZP], [0.68, -1.45, 0.75]], color: "#58e8ff", glow: 1.1, speed: 0.07 },
  // filter top -> chlorinator -> return inlet
  { pts: [[1.05, -0.55, 0.55], [1.15, -0.3, 0.9], [1.6, -0.15, ZP], [1.62, 0.35, ZP], [1.55, 0.6, 0.9], [1.3, 0.55, 0.6]], color: "#8ff9ff", glow: 1.6, speed: 0.07 },
];

export const Pipe: React.FC<{ pts: V3[]; color: string; glow: number; speed: number; t: number; seed: number; on?: number }> = ({ pts, color, glow, speed, t, seed, on = 1 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal", 0.4), [pts]);
  const glass = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.075, 20, false), [curve]);
  const core = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.034, 12, false), [curve]);
  const len = curve.getLength();
  const n = on > 0.02 ? Math.max(3, Math.round(len * 1.9)) : 0;
  return (
    <group>
      <mesh geometry={glass} layers={FX_LAYER}>
        <meshPhysicalMaterial color="#bfefff" transparent opacity={0.22} roughness={0.04} metalness={0.4} clearcoat={1} envMapIntensity={2} depthWrite={false} />
      </mesh>
      <mesh geometry={core}>
        <meshStandardMaterial color={on > 0.02 ? color : "#16303f"} emissive={color} emissiveIntensity={glow * on} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* liquid-chrome slugs riding the flow */}
      {Array.from({ length: n }, (_, i) => {
        const u = (i / n + t * speed + seed * 0.13) % 1;
        const p = curve.getPointAt(u);
        const tan = curve.getTangentAt(u);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
        return (
          <mesh key={i} position={p} quaternion={q} scale={[1, 1.9, 1]}>
            <sphereGeometry args={[0.05, 28, 20]} />
            <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.04} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- pump + sand filter + chlorinator ----------
export const useLogoTexture = () =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#0a1520";
    ctx.beginPath();
    ctx.roundRect(4, 4, 504, 248, 28);
    ctx.fill();
    ctx.strokeStyle = "#5ff4ff";
    ctx.lineWidth = 5;
    ctx.stroke();
    const k = 200 / LOGO_VIEWBOX[3];
    ctx.save();
    ctx.translate((512 - LOGO_VIEWBOX[2] * k) / 2, 28);
    ctx.scale(k, k);
    for (const [fill, d] of LOGO_PATHS) {
      ctx.fillStyle = fill;
      ctx.fill(new Path2D(d));
    }
    ctx.restore();
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

export const OPEN = Math.PI * 0.55; // wedge cut out of the filter, facing the camera
export const Layer: React.FC<{ r: number; y0: number; y1: number; color: string; rough?: number; emissive?: string }> = ({ r, y0, y1, color, rough = 0.85, emissive }) => (
  <mesh position={[0, (y0 + y1) / 2, 0]}>
    <cylinderGeometry args={[r, r, y1 - y0, 48, 1, false, OPEN / 2, Math.PI * 2 - OPEN]} />
    <meshStandardMaterial color={color} roughness={rough} side={THREE.DoubleSide} emissive={emissive ?? "#000"} emissiveIntensity={emissive ? 0.35 : 0} />
  </mesh>
);
export const Cap: React.FC<{ r: number; y0: number; y1: number; color: string }> = ({ r, y0, y1, color }) => (
  // flat cut faces of the wedge, so the layers read as solid
  <group>
    {[OPEN / 2, -OPEN / 2].map((a) => (
      <mesh key={a} position={[Math.sin(a) * r * 0.5, (y0 + y1) / 2, Math.cos(a) * r * 0.5]} rotation={[0, a + Math.PI / 2, 0]}>
        <planeGeometry args={[r, y1 - y0]} />
        <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

const SandFilter: React.FC<{ t: number }> = ({ t }) => {
  const R = 0.44;
  const grains = useMemo(() => {
    const rnd = mulberry(51);
    return Array.from({ length: 70 }, () => {
      const a = OPEN / 2 + rnd() * (Math.PI * 2 - OPEN);
      const rr = 0.05 + rnd() * 0.33;
      return { p: [Math.sin(a) * rr, -0.35 + rnd() * 0.42, Math.cos(a) * rr] as V3, s: 0.012 + rnd() * 0.02 };
    });
  }, []);
  return (
    <group position={[1.05, -1.55, 0.5]} rotation={[0, -0.2, 0]}>
      {/* shell */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[R, R, 1.0, 64, 1, true, OPEN / 2, Math.PI * 2 - OPEN]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[R, 64, 32, OPEN / 2 + Math.PI / 2, Math.PI * 2 - OPEN, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[R * 0.92, R * 0.7, 0.14, 48]} />
        <meshStandardMaterial color="#1a2836" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* media layers: gravel, sand, water above */}
      <Layer r={R - 0.02} y0={-0.42} y1={-0.27} color={C.gravel} />
      <Cap r={R - 0.02} y0={-0.42} y1={-0.27} color="#6f7b88" />
      <Layer r={R - 0.02} y0={-0.27} y1={0.12} color={C.sand} />
      <Cap r={R - 0.02} y0={-0.27} y1={0.12} color="#d9bd7c" />
      <mesh position={[0, 0.33, 0]} layers={FX_LAYER}>
        <cylinderGeometry args={[R - 0.02, R - 0.02, 0.42, 48, 1, false, OPEN / 2, Math.PI * 2 - OPEN]} />
        <meshPhysicalMaterial color={C.water} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* trapped dirt specks in the sand */}
      {grains.map((g, i) => (
        <mesh key={i} position={g.p}>
          <icosahedronGeometry args={[g.s, 0]} />
          <meshStandardMaterial color={i % 3 ? "#7a5a3a" : C.germ} emissive={i % 3 ? "#000" : C.germ} emissiveIntensity={0.6} roughness={0.7} />
        </mesh>
      ))}
      {/* downward flow arrows in the water layer */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.2) * 0.18, 0.4 - ((t * 0.25 + i / 3) % 1) * 0.25, 0.22]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.04, 0.09, 16]} />
          <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
};

export const Pump: React.FC = () => (
  <group position={[-0.95, -1.62, 0.85]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.2, 0.2, 0.34, 48]} />
      <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.07} />
    </mesh>
    <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.26, 48]} />
      <meshStandardMaterial color="#13212f" metalness={0.7} roughness={0.25} />
    </mesh>
    {[-0.36, -0.3, -0.24, -0.18].map((x) => (
      <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.165, 0.008, 8, 40]} />
        <meshStandardMaterial color="#5ff4ff" emissive="#5ff4ff" emissiveIntensity={0.6} />
      </mesh>
    ))}
    {/* strainer basket dome */}
    <mesh position={[0.05, 0.24, 0]}>
      <sphereGeometry args={[0.13, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#bfefff" transparent opacity={0.5} roughness={0.03} metalness={0.3} clearcoat={1} />
    </mesh>
    <Box a={[-0.45, -0.3, -0.18]} b={[0.25, -0.2, 0.18]}>
      <meshStandardMaterial color="#1a2836" metalness={0.8} roughness={0.3} />
    </Box>
  </group>
);

export const Chlorinator: React.FC<{ t: number }> = ({ t }) => (
  <group position={[1.62, 0.1, ZP + 0.02]}>
    <mesh>
      <cylinderGeometry args={[0.13, 0.13, 0.36, 40]} />
      <meshPhysicalMaterial color="#d8fbff" transparent opacity={0.35} roughness={0.03} metalness={0.2} clearcoat={1} depthWrite={false} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.7 + t * 0.6) * 0.06, -0.12 + ((i * 0.07 + t * 0.05) % 0.26), Math.sin(i * 1.7 + t * 0.6) * 0.06]}>
        <sphereGeometry args={[0.028, 20, 14]} />
        <meshStandardMaterial color="#ffffff" emissive="#7ff7ff" emissiveIntensity={2.2} />
      </mesh>
    ))}
    {[-0.19, 0.19].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.145, 0.145, 0.04, 40]} />
        <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.06} />
      </mesh>
    ))}
  </group>
);

// ---------- chlorine vs germs ----------
export const Germ: React.FC<{ p: V3; r: number; broken?: number; seed: number; color?: string }> = ({ p, r, broken = 0, seed, color = C.germ }) => {
  const spikes = useMemo(() => {
    const rnd = mulberry(seed);
    return Array.from({ length: 14 }, () => {
      const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize();
      return { v, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v) };
    });
  }, [seed]);
  const shards = useMemo(() => {
    const rnd = mulberry(seed + 7);
    return Array.from({ length: 9 }, () => ({
      v: new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize(),
      d: 1.2 + rnd() * 1.4,
      s: 0.25 + rnd() * 0.3,
      rot: [rnd() * 6, rnd() * 6, rnd() * 6] as V3,
    }));
  }, [seed]);
  const core = 1 - broken * 0.45;
  return (
    <group position={p}>
      <mesh scale={core}>
        <icosahedronGeometry args={[r, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} metalness={0.2} flatShading />
      </mesh>
      {spikes.map(({ v, q }, i) => (
        <mesh key={i} position={v.clone().multiplyScalar(r * core * 1.05)} quaternion={q} scale={core}>
          <coneGeometry args={[r * 0.16, r * 0.55, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
      ))}
      {broken > 0 &&
        shards.map((s, i) => (
          <mesh key={i} position={s.v.clone().multiplyScalar(r * s.d)} rotation={s.rot} scale={s.s * broken}>
            <tetrahedronGeometry args={[r * 0.6, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} flatShading />
          </mesh>
        ))}
    </group>
  );
};

export const ChlorineOrb: React.FC<{ p: V3; r: number }> = ({ p, r }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 40, 28]} />
      <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.03} />
    </mesh>
    <mesh scale={1.55} layers={FX_LAYER}>
      <sphereGeometry args={[r, 24, 16]} />
      <meshBasicMaterial color={C.cyan} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
);

const PoolLife: React.FC<{ t: number }> = ({ t }) => {
  const rnd = useMemo(() => mulberry(2051), []);
  const orbs = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        p: [P.x0 + 0.15 + rnd() * 2.3, P.y0 + 0.1 + rnd() * 0.55, P.z0 + 0.15 + rnd() * 1.5] as V3,
        r: 0.025 + rnd() * 0.022,
        ph: rnd() * 6,
      })),
    [rnd],
  );
  const germs: { p: V3; b: number }[] = [
    { p: [-0.55, 0.42, 0.55], b: 0 },
    { p: [0.35, 0.55, 0.25], b: 0.7 },
    { p: [0.85, 0.3, 0.7], b: 1 },
    { p: [-0.9, 0.62, -0.2], b: 0.4 },
  ];
  return (
    <group>
      {orbs.map((o, i) => (
        <ChlorineOrb key={i} p={[o.p[0] + Math.sin(t * 0.7 + o.ph) * 0.03, o.p[1] + Math.sin(t + o.ph) * 0.02, o.p[2]]} r={o.r} />
      ))}
      {germs.map((g, i) => (
        <Germ key={i} p={g.p} r={0.06} broken={g.b} seed={300 + i} color={i % 2 ? C.germ : C.germ2} />
      ))}
      {/* in-pool circulation ribbon: return jet sweeping toward skimmer + drain */}
      <FlowRibbon t={t} />
    </group>
  );
};

export const FlowRibbon: React.FC<{ t: number }> = ({ t }) => {
  const curves = useMemo(
    () => [
      new THREE.CatmullRomCurve3([new THREE.Vector3(1.25, 0.55, 0.6), new THREE.Vector3(0.6, 0.52, 0.45), new THREE.Vector3(-0.2, 0.6, 0.35), new THREE.Vector3(-0.9, 0.72, 0.55), new THREE.Vector3(-1.25, 0.74, 0.64)]),
      new THREE.CatmullRomCurve3([new THREE.Vector3(1.25, 0.55, 0.6), new THREE.Vector3(0.7, 0.38, 0.2), new THREE.Vector3(0.25, 0.22, 0.25), new THREE.Vector3(0.0, 0.13, 0.35)]),
    ],
    [],
  );
  return (
    <group>
      {curves.map((c, k) => (
        <group key={k}>
          <mesh layers={FX_LAYER}>
            <tubeGeometry args={[c, 100, 0.03, 10, false]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const u = (i / 7 + t * 0.08) % 1;
            const p = c.getPointAt(u);
            const tan = c.getTangentAt(u);
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
            return (
              <mesh key={i} position={p} quaternion={q}>
                <coneGeometry args={[0.035, 0.09, 14]} />
                <meshStandardMaterial color="#ffffff" emissive={C.cyan} emissiveIntensity={1.6} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// ---------- foreground magnifier: chlorine breaking a germ ----------
const MagnifierBubble: React.FC<{ t: number }> = ({ t }) => {
  const c: V3 = [0.12, -0.78, 2.0];
  const orbs: V3[] = [
    [0.27, 0.12, 0.05],
    [-0.22, 0.2, 0.12],
    [0.05, -0.28, 0.1],
    [-0.15, -0.12, 0.25],
  ];
  return (
    <group position={c} rotation={[0, t * 0.05, 0]}>
      <Germ p={[0, 0, 0]} r={0.15} broken={0.85} seed={777} />
      {orbs.map((o, i) => (
        <ChlorineOrb key={i} p={o} r={0.075} />
      ))}
      <mesh layers={FX_LAYER}>
        <sphereGeometry args={[0.48, 64, 40]} />
        <meshPhysicalMaterial color="#c9f6ff" transparent opacity={0.13} roughness={0.0} metalness={0.5} clearcoat={1} envMapIntensity={2.4} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]}>
        <torusGeometry args={[0.5, 0.008, 10, 120]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- background ----------
export const Backdrop: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => gradientTexture(), []);
  const drops = useMemo(() => {
    const rnd = mulberry(9051);
    return Array.from({ length: 8 }, (_, i) => ({ p: [(i % 2 ? 1 : -1) * (2.4 + rnd() * 1.6), -2.6 + rnd() * 3.2, -2 - rnd() * 3] as V3, r: 0.06 + rnd() * 0.22, ph: rnd() * 6 }));
  }, []);
  return (
    <group>
      <mesh position={[0, 0, -12]}>
        <planeGeometry args={[18, 34]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {drops.map((d, i) => (
        <mesh key={i} position={[d.p[0], d.p[1] + Math.sin(t * 0.4 + d.ph) * 0.15, d.p[2]]}>
          <sphereGeometry args={[d.r, 32, 24]} />
          <meshStandardMaterial color={C.chrome} metalness={1} roughness={0.05} />
        </mesh>
      ))}
      {/* equipment-room floor */}
      <Box a={[-2.4, -2.2, -1.2]} b={[2.4, -2.1, 1.6]}>
        <meshStandardMaterial color="#08131e" metalness={0.85} roughness={0.18} />
      </Box>
    </group>
  );
};

const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30 + 4;
  const logo = useLogoTexture();
  return (
    <>
      <CamRig />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3.5, 7, 5]} intensity={1.8} color="#fff6e8" />
      <directionalLight position={[-5, 3, -4]} intensity={0.9} color="#7fd0ff" />
      <pointLight position={[0, 0.5, 0.4]} intensity={6} distance={4} color="#5fd8ff" />
      <pointLight position={[0.3, -1.2, 2]} intensity={5} distance={4} color="#9ff3ff" />
      <Backdrop t={t} />
      <Pool t={t} />
      <PoolLife t={t} />
      {PIPES.map((p, i) => (
        <Pipe key={i} {...p} t={t} seed={i} />
      ))}
      <Pump />
      <SandFilter t={t} />
      <Chlorinator t={t} />
      <MagnifierBubble t={t} />
      {/* AUDIRA plant-room plate on the cut section face, under the pool */}
      <mesh position={[0.6, -0.1, P.z1 + 0.02]}>
        <planeGeometry args={[0.7, 0.35]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>
      <Finish frame={frame} background={C.void} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao />
    </>
  );
};

// ---------- overlay ----------
const Callout: React.FC<{ at: V3; text: string; dx: number; dy: number; w: number; h: number; align?: "left" | "right" }> = ({ at, text, dx, dy, w, h, align = "left" }) => {
  const a = project(at, w, h);
  const bx = a.x + dx, by = a.y + dy;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: w, height: h, pointerEvents: "none" }}>
        <line x1={a.x} y1={a.y} x2={bx} y2={by} stroke="#5ff4ff" strokeWidth={2.5} />
        <circle cx={a.x} cy={a.y} r={7} fill="#5ff4ff" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: by - 26,
          left: align === "left" ? bx : undefined,
          right: align === "right" ? w - bx : undefined,
          padding: "8px 18px",
          borderRadius: 999,
          background: "rgba(4,16,26,0.82)",
          border: "2px solid rgba(95,244,255,0.75)",
          color: "#eafcff",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </>
  );
};

export const Ep051Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <ThreeCanvas width={width} height={height} camera={{ position: CAM.pos.toArray() as V3, fov: CAM.fov, near: 0.1, far: 80 }}>
        <Scene frame={frame} />
      </ThreeCanvas>
      {/* top scrim for the title */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(3,10,18,0.92) 0%, rgba(3,10,18,0.6) 60%, rgba(3,10,18,0) 100%)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 196, fontFamily: FONT, color: "#f2fbff" }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 9, color: "#5ff4ff" }}>AUDIRA EXPLAINED · 051</div>
        <div style={{ marginTop: 18, fontSize: 112, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3 }}>
          Kolam Umum
          <br />
          Kok Tetap{" "}
          <span style={{ background: "linear-gradient(90deg,#5ff4ff,#c6fbff 55%,#5fb8ff)", WebkitBackgroundClip: "text", color: "transparent" }}>Jernih?</span>
        </div>
      </div>
      <Callout at={[-1.32, 0.78, 0.66]} text="Skimmer" dx={12} dy={-128} w={width} h={height} />
      <Callout at={[-0.95, -1.42, 0.85]} text="Pompa" dx={-50} dy={84} w={width} h={height} align="right" />
      <Callout at={[1.25, -0.9, 0.75]} text="Filter pasir" dx={60} dy={-120} w={width} h={height} align="right" />
      <Callout at={[1.62, 0.1, ZP + 0.1]} text="Klorin" dx={40} dy={-70} w={width} h={height} align="right" />
      <Callout at={[0.12, -0.5, 2.0]} text="Klorin vs kuman" dx={-40} dy={-110} w={width} h={height} align="right" />
      {/* bottom line, above the 380 px UI band */}
      <div style={{ position: "absolute", left: 72, right: 72, top: 1486, fontFamily: FONT, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ height: 3, flex: 1, background: "linear-gradient(90deg, rgba(95,244,255,0), #5ff4ff)" }} />
        <div style={{ fontSize: 30, fontWeight: 500, color: "#bfefff", letterSpacing: 2 }}>disaring · didisinfeksi · diputar ulang</div>
        <div style={{ height: 3, flex: 1, background: "linear-gradient(90deg, #5ff4ff, rgba(95,244,255,0))" }} />
      </div>
    </AbsoluteFill>
  );
};
