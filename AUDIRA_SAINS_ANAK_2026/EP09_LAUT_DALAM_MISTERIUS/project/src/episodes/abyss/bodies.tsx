// Celestial bodies for EP05: procedural Moon (episode texture), Earth + Sun from the SCALEFORGE kit,
// star sphere, and in-world canvas labels (brand plate "AUDIRA LAB").
import React, { useMemo } from "react";
import * as THREE from "three";
import { makeEarthTextures, makeGlow, makeSunTexture } from "../../kits/scaleforge/lib/materials";
import { prng } from "../../kits/scaleforge/core/motion";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};

/** Equirect moon map. Near side (maria) centred at u = 0.25, which faces +Z at rotation 0. */
const makeMoonTextures = () => {
  const W = 1024;
  const H = 512;
  const [c, g] = canvas(W, H);
  const [b, bg] = canvas(W, H);
  g.fillStyle = "#A9A8A3";
  g.fillRect(0, 0, W, H);
  bg.fillStyle = "#808080";
  bg.fillRect(0, 0, W, H);
  const r = prng(505);
  // regolith grain
  for (let i = 0; i < 14000; i++) {
    const v = r();
    g.fillStyle = v > 0.5 ? `rgba(220,218,210,${0.05 + r() * 0.08})` : `rgba(70,70,68,${0.05 + r() * 0.08})`;
    g.fillRect(r() * W, r() * H, 2 + r() * 3, 2 + r() * 3);
  }
  // maria: dark seas, almost all on the near side (u 0.1–0.4)
  const maria: [number, number, number, number][] = [
    [0.22, 0.36, 70, 48], [0.29, 0.42, 58, 40], [0.18, 0.5, 62, 52], [0.27, 0.55, 46, 36],
    [0.33, 0.33, 40, 30], [0.21, 0.62, 52, 34], [0.31, 0.6, 30, 26], [0.15, 0.4, 34, 28],
    [0.72, 0.62, 26, 20], // one small mare on the far side
  ];
  for (const [u, v, rx, ry] of maria) {
    for (let k = 0; k < 6; k++) {
      g.fillStyle = `rgba(62,64,70,${0.16})`;
      g.beginPath();
      g.ellipse(u * W + (r() - 0.5) * rx * 0.6, v * H + (r() - 0.5) * ry * 0.6, rx * (0.6 + r() * 0.5), ry * (0.6 + r() * 0.5), r() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }
  // craters: rim highlight + dark floor, more on the far side
  const crater = (x: number, y: number, rad: number) => {
    g.fillStyle = "rgba(60,60,60,0.35)";
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(235,232,224,0.55)";
    g.lineWidth = Math.max(1, rad * 0.22);
    g.beginPath();
    g.arc(x - rad * 0.12, y - rad * 0.12, rad, Math.PI * 0.9, Math.PI * 1.9);
    g.stroke();
    bg.fillStyle = "rgba(20,20,20,0.7)";
    bg.beginPath();
    bg.arc(x, y, rad, 0, Math.PI * 2);
    bg.fill();
    bg.strokeStyle = "rgba(255,255,255,0.8)";
    bg.lineWidth = Math.max(1, rad * 0.3);
    bg.beginPath();
    bg.arc(x, y, rad, 0, Math.PI * 2);
    bg.stroke();
  };
  for (let i = 0; i < 420; i++) {
    const u = r();
    const far = u > 0.5;
    if (!far && r() < 0.35) continue;
    crater(u * W, H * (0.08 + r() * 0.84), 2 + Math.pow(r(), 3) * (far ? 14 : 10));
  }
  // Tycho-like bright rayed crater on the near side
  crater(0.25 * W, 0.74 * H, 10);
  g.strokeStyle = "rgba(240,238,230,0.18)";
  g.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    g.beginPath();
    g.moveTo(0.25 * W, 0.74 * H);
    g.lineTo(0.25 * W + Math.cos(a) * 120, 0.74 * H + Math.sin(a) * 60);
    g.stroke();
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return { map, bump: new THREE.CanvasTexture(b) };
};

let moonCache: ReturnType<typeof makeMoonTextures> | null = null;
let earthCache: ReturnType<typeof makeEarthTextures> | null = null;
let sunCache: THREE.Texture | null = null;
let glowCache: THREE.Texture | null = null;
const moonTex = () => (moonCache ??= makeMoonTextures());
const earthTex = () => (earthCache ??= makeEarthTextures());
const sunTex = () => (sunCache ??= makeSunTexture());
export const glowTex = () => (glowCache ??= makeGlow());

type V3 = [number, number, number];

/** Moon sphere. rotY = 0 shows the near side to +Z. `marker` adds an orange "face" arrow on the near side. */
export const Moon: React.FC<{
  radius?: number;
  position?: V3;
  rotY?: number;
  rotX?: number;
  stretch?: number;
  stretchAxisY?: number;
  marker?: boolean;
  emissive?: number;
}> = ({ radius = 1, position = [0, 0, 0], rotY = 0, rotX = 0, stretch = 1, stretchAxisY = 0, marker = false, emissive = 0 }) => {
  const t = moonTex();
  return (
    <group position={position} rotation={[0, stretchAxisY, 0]}>
      <group scale={[stretch, 1 / Math.sqrt(stretch), 1 / Math.sqrt(stretch)]}>
        <group rotation={[rotX, rotY - stretchAxisY, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[radius, 128, 96]} />
            <meshStandardMaterial
              map={t.map}
              bumpMap={t.bump}
              bumpScale={0.6}
              roughness={0.96}
              metalness={0}
              emissive="#2a2c34"
              emissiveIntensity={emissive}
            />
          </mesh>
          {marker && (
            <group position={[0, 0, radius]}>
              <mesh position={[0, 0, radius * 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[radius * 0.16, radius * 0.4, 24]} />
                <meshStandardMaterial color="#FF8A2B" emissive="#FF6B1A" emissiveIntensity={0.9} roughness={0.4} />
              </mesh>
              <mesh rotation={[0, 0, 0]}>
                <circleGeometry args={[radius * 0.2, 32]} />
                <meshBasicMaterial color="#FF8A2B" transparent opacity={0.85} />
              </mesh>
            </group>
          )}
        </group>
      </group>
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
      {glow > 0 && (
        <sprite scale={[radius * 2.9, radius * 2.9, 1]}>
          <spriteMaterial map={glowTex()} color="#7EC8FF" transparent opacity={0.55 * glow} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      )}
    </group>
  );
};

export const Sun: React.FC<{ radius?: number; position?: V3 }> = ({ radius = 3, position = [0, 0, 0] }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[radius, 64, 48]} />
      <meshBasicMaterial map={sunTex()} toneMapped={false} />
    </mesh>
    <sprite scale={[radius * 5, radius * 5, 1]}>
      <spriteMaterial map={glowTex()} color="#FFB040" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  </group>
);

/** Inside-out star sphere (canvas texture, not a point cloud). */
export const StarSphere: React.FC<{ radius?: number; tint?: string }> = ({ radius = 600, tint = "#ffffff" }) => {
  const tex = useMemo(() => {
    const [c, g] = canvas(2048, 1024);
    const grd = g.createLinearGradient(0, 0, 0, 1024);
    grd.addColorStop(0, "#0A1230");
    grd.addColorStop(0.5, "#070B18");
    grd.addColorStop(1, "#0B1026");
    g.fillStyle = grd;
    g.fillRect(0, 0, 2048, 1024);
    const r = prng(77);
    for (let i = 0; i < 2600; i++) {
      const s = Math.pow(r(), 6) * 2.6 + 0.6;
      g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.6})`;
      g.beginPath();
      g.arc(r() * 2048, r() * 1024, s, 0, Math.PI * 2);
      g.fill();
    }
    // faint milky band
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(150,170,230,0.025)`;
      g.beginPath();
      g.ellipse(r() * 2048, 520 + (r() - 0.5) * 220, 120, 40, 0.2, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} color={tint} fog={false} toneMapped={false} />
    </mesh>
  );
};

/** Flat in-world label plate (canvas texture). Used for "AUDIRA LAB" brand plates and night labels. */
export const LabelPlate: React.FC<{
  text: string;
  sub?: string;
  width?: number;
  position?: V3;
  rotation?: V3;
  accent?: string;
  opacity?: number;
  billboard?: boolean;
}> = ({ text, sub, width = 2, position = [0, 0, 0], rotation = [0, 0, 0], accent = "#FF8A2B", opacity = 1 }) => {
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

/** Gravity / pull arrow along +X, length L. */
export const Arrow: React.FC<{ length: number; position?: V3; rotation?: V3; color?: string; thickness?: number }> = ({
  length,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#FF8A2B",
  thickness = 0.08,
}) => (
  <group position={position} rotation={rotation}>
    <mesh position={[length / 2 - thickness * 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[thickness, thickness, Math.max(0.01, length - thickness * 4), 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
    <mesh position={[length - thickness * 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[thickness * 2.6, thickness * 5, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
    </mesh>
  </group>
);
