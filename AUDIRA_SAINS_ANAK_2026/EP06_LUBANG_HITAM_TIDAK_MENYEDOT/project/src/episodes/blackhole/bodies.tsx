// Celestial bodies for EP06: black hole (black core + additive accretion disk + camera-facing lensed ring),
// Earth + Sun from the SCALEFORGE kit, star sphere, measuring ruler and in-world canvas labels ("AUDIRA LAB").
import React, { useMemo } from "react";
import * as THREE from "three";
import { makeEarthTextures, makeGlow, makeSunTexture } from "../../kits/scaleforge/lib/materials";
import { prng } from "../../kits/scaleforge/core/motion";

type V3 = [number, number, number];

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};

/**
 * Square disk map for ringGeometry (planar UVs: the outer radius touches the canvas edge).
 * `innerFrac` = inner radius / outer radius of the ring that will use it.
 */
const makeDiskTexture = (innerFrac: number, seed: number) => {
  const S = 1024;
  const C = S / 2;
  const [c, g] = canvas(S, S);
  g.fillStyle = "#000000";
  g.fillRect(0, 0, S, S);
  const r0 = innerFrac * C;
  const grd = g.createRadialGradient(C, C, r0, C, C, C);
  grd.addColorStop(0, "rgba(255,248,226,1)");
  grd.addColorStop(0.12, "rgba(255,214,140,0.95)");
  grd.addColorStop(0.4, "rgba(255,150,60,0.7)");
  grd.addColorStop(0.75, "rgba(190,70,20,0.35)");
  grd.addColorStop(1, "rgba(80,20,5,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(C, C, C, 0, Math.PI * 2);
  g.arc(C, C, r0, 0, Math.PI * 2, true);
  g.fill();
  const r = prng(seed);
  // swirling gas streaks: short arcs, brighter towards the inner edge
  for (let i = 0; i < 1400; i++) {
    const u = Math.pow(r(), 1.6);
    const rad = r0 + u * (C - r0) * 0.98;
    const a = r() * Math.PI * 2;
    const len = 0.15 + r() * 0.7;
    const bright = 1 - u;
    g.strokeStyle = r() < 0.55 ? `rgba(255,240,210,${0.06 + bright * 0.28})` : `rgba(40,10,0,${0.12 + r() * 0.2})`;
    g.lineWidth = 1 + r() * (3 + bright * 4);
    g.beginPath();
    g.arc(C, C, rad, a, a + len);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const diskCache = new Map<string, THREE.Texture>();
const diskTex = (innerFrac: number, seed: number) => {
  const key = `${innerFrac.toFixed(3)}-${seed}`;
  if (!diskCache.has(key)) diskCache.set(key, makeDiskTexture(innerFrac, seed));
  return diskCache.get(key)!;
};

let earthCache: ReturnType<typeof makeEarthTextures> | null = null;
let sunCache: THREE.Texture | null = null;
let glowCache: THREE.Texture | null = null;
const earthTex = () => (earthCache ??= makeEarthTextures());
const sunTex = () => (sunCache ??= makeSunTexture());
export const glowTex = () => (glowCache ??= makeGlow());

const HOT = new THREE.Color("#FFFFFF");
const COLD = new THREE.Color("#7A2A0C");

/**
 * Black hole. Disk lies in the local XZ plane (tilt about X), spins with `spin`.
 * `camPos` (world) orients the lensed back-disk ring + photon ring towards the camera,
 * so it must not sit inside a rotated parent group.
 */
export const BlackHole: React.FC<{
  radius?: number;
  position?: V3;
  camPos: V3;
  spin?: number;
  heat?: number;
  disk?: number;
  tilt?: number;
  light?: number;
}> = ({ radius = 1, position = [0, 0, 0], camPos, spin = 0, heat = 1, disk = 1, tilt = 0.18, light = 1 }) => {
  const DI = 1.55;
  const DO = 4.2;
  const LI = 1.12;
  const LO = 2.3;
  const col = COLD.clone().lerp(HOT, heat);
  const quat = useMemo(() => {
    const dir = new THREE.Vector3(camPos[0] - position[0], camPos[1] - position[1], camPos[2] - position[2]).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  }, [camPos[0], camPos[1], camPos[2], position[0], position[1], position[2]]);
  const ds = Math.max(0.0001, disk);
  return (
    <group position={position}>
      {/* event horizon shadow: pure black, writes depth so the far disk hides behind it */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[radius, 96, 64]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>
      {/* lensed image of the far disk + photon ring, always facing the camera */}
      <group quaternion={quat} scale={[ds, ds, ds]}>
        <mesh position={[0, 0, -radius * 0.2]} renderOrder={1}>
          <ringGeometry args={[radius * LI, radius * LO, 128, 1]} />
          <meshBasicMaterial map={diskTex(LI / LO, 11)} color={col} transparent opacity={0.85 * disk} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, radius * 0.02]} renderOrder={2}>
          <ringGeometry args={[radius * 1.02, radius * 1.09, 128, 1]} />
          <meshBasicMaterial color="#FFE7C2" transparent opacity={0.9 * disk} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      {/* accretion disk */}
      <group rotation={[tilt, 0, 0]} scale={[ds, ds, ds]}>
        <group rotation={[0, spin, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
            <ringGeometry args={[radius * DI, radius * DO, 160, 1]} />
            <meshBasicMaterial map={diskTex(DI / DO, 5)} color={col} transparent opacity={disk} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      <sprite scale={[radius * 9 * ds, radius * 9 * ds, 1]} renderOrder={4}>
        <spriteMaterial map={glowTex()} color="#FF9A40" transparent opacity={0.22 * disk * (0.4 + 0.6 * heat)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight color="#FFB070" intensity={light * disk * (0.3 + heat) * 6} distance={radius * 30} decay={1.2} />
    </group>
  );
};

/** Earth with clouds and atmosphere glow. spin = rotation about its axis in radians. */
export const Earth: React.FC<{ radius?: number; position?: V3; spin?: number; glow?: number }> = ({
  radius = 1,
  position = [0, 0, 0],
  spin = 0,
  glow = 1,
}) => {
  const t = earthTex();
  return (
    <group position={position}>
      <group rotation={[0.41, spin, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 96, 64]} />
          <meshStandardMaterial map={t.surface} roughness={0.7} metalness={0.05} />
        </mesh>
        <mesh scale={1.015}>
          <sphereGeometry args={[radius, 96, 64]} />
          <meshStandardMaterial map={t.clouds} transparent depthWrite={false} roughness={1} />
        </mesh>
      </group>
      <sprite scale={[radius * 2.9, radius * 2.9, 1]}>
        <spriteMaterial map={glowTex()} color="#7EC8FF" transparent opacity={0.55 * glow} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
};

export const Sun: React.FC<{ radius?: number; position?: V3; glow?: number; tint?: string }> = ({ radius = 3, position = [0, 0, 0], glow = 1, tint = "#FFB040" }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[Math.max(0.0001, radius), 64, 48]} />
      <meshBasicMaterial map={sunTex()} toneMapped={false} />
    </mesh>
    <sprite scale={[radius * 5 + 0.0001, radius * 5 + 0.0001, 1]}>
      <spriteMaterial map={glowTex()} color={tint} transparent opacity={0.9 * glow} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  </group>
);

/** Glowing star point (S2 and friends): small hot core + additive halo. */
export const StarPoint: React.FC<{ position: V3; size?: number; color?: string; opacity?: number }> = ({ position, size = 0.25, color = "#BFD8FF", opacity = 1 }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[size * 0.35, 24, 16]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={opacity} toneMapped={false} />
    </mesh>
    <sprite scale={[size * 3, size * 3, 1]}>
      <spriteMaterial map={glowTex()} color={color} transparent opacity={0.95 * opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  </group>
);

/** Inside-out star sphere (canvas texture, not a point cloud). `dense` = galactic-centre star field. */
export const StarSphere: React.FC<{ radius?: number; tint?: string; dense?: boolean }> = ({ radius = 600, tint = "#ffffff", dense = false }) => {
  const tex = useMemo(() => {
    const [c, g] = canvas(2048, 1024);
    const grd = g.createLinearGradient(0, 0, 0, 1024);
    grd.addColorStop(0, "#0A1230");
    grd.addColorStop(0.5, dense ? "#140E1C" : "#070B18");
    grd.addColorStop(1, "#0B1026");
    g.fillStyle = grd;
    g.fillRect(0, 0, 2048, 1024);
    const r = prng(dense ? 91 : 77);
    // milky band (warmer and much brighter at the galactic centre)
    for (let i = 0; i < (dense ? 520 : 260); i++) {
      g.fillStyle = dense ? `rgba(235,${165 + Math.floor(r() * 40)},150,0.011)` : `rgba(150,170,230,0.025)`;
      g.beginPath();
      g.ellipse(r() * 2048, 520 + (r() - 0.5) * (dense ? 160 : 220) * (0.4 + r()), 140, 40, 0.05, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < (dense ? 9000 : 2600); i++) {
      const s = Math.pow(r(), 6) * 2.6 + 0.6;
      const y = dense && r() < 0.6 ? 520 + (r() - 0.5) * 300 * r() : r() * 1024;
      g.fillStyle = `rgba(255,${235 + Math.floor(r() * 20)},${215 + Math.floor(r() * 40)},${0.35 + r() * 0.6})`;
      g.beginPath();
      g.arc(r() * 2048, y, s, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [dense]);
  return (
    <mesh rotation={[0.15, 0, 0]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} color={tint} fog={false} toneMapped={false} />
    </mesh>
  );
};

/** Flat in-world label plate (canvas texture). Used for "AUDIRA LAB" brand plates. */
export const LabelPlate: React.FC<{
  text: string;
  sub?: string;
  width?: number;
  position?: V3;
  rotation?: V3;
  accent?: string;
  opacity?: number;
}> = ({ text, sub, width = 2, position = [0, 0, 0], rotation = [0, 0, 0], accent = "#FF6B2C", opacity = 1 }) => {
  const tex = useMemo(() => {
    const [c, g] = canvas(768, 256);
    g.fillStyle = "rgba(8,12,24,0.86)";
    g.beginPath();
    g.roundRect(6, 6, 756, 244, 28);
    g.fill();
    g.fillStyle = accent;
    g.fillRect(6, 6, 16, 244);
    g.fillStyle = "#F4F6FB";
    g.font = "bold 92px Arial, sans-serif";
    g.textBaseline = "middle";
    g.fillText(text, 52, sub ? 98 : 128);
    if (sub) {
      g.font = "bold 50px Arial, sans-serif";
      g.fillStyle = accent;
      g.fillText(sub, 54, 190);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, sub, accent]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / 3]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** SCALEFORGE measuring ruler along +X, centred, `length` world units, orange ticks. */
export const Ruler: React.FC<{ length: number; position?: V3; rotation?: V3; opacity?: number }> = ({ length, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 1 }) => {
  const L = Math.max(0.001, length);
  const th = 0.035;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[th, th, L, 10]} />
        <meshBasicMaterial color="#FF6B2C" transparent opacity={opacity} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, (s * L) / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[th, th, 0.5, 10]} />
          <meshBasicMaterial color="#FF6B2C" transparent opacity={opacity} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Thin glowing tube along a polyline (orbit lines, light rays). */
export const Tube: React.FC<{ points: THREE.Vector3[]; radius?: number; color?: string; opacity?: number; closed?: boolean }> = ({
  points,
  radius = 0.02,
  color = "#3AA8FF",
  opacity = 0.6,
  closed = false,
}) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), Math.max(32, points.length * 2), radius, 8, closed), [points, radius, closed]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
};
