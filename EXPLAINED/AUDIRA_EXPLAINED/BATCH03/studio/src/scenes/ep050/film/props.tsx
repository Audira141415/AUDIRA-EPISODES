// EP050 film props in the SATISFYFORGE look: pastel clearcoat, soft shadows, exact placements.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32 } from "../../../kits/satisfyforge/core/motion";
import { SATISFYFORGE_PALETTE as P } from "../../../kits/satisfyforge/lib/palette";
import { FX_LAYER } from "../../../core/render/Post";
import { BELT_TOP, LANE, makeSignTexture, roundRectPath } from "../parts";

const FONT = "'Manrope', 'Segoe UI', sans-serif";

export const Candy: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.28 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={1} clearcoatRoughness={0.12} />
);

export const RBox: React.FC<{ size: [number, number, number]; r?: number; color: string; position?: [number, number, number]; rotation?: [number, number, number]; rough?: number }> = ({
  size,
  r = 0.04,
  color,
  position,
  rotation,
  rough,
}) => {
  const g = useMemo(() => new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(r, Math.min(...size) / 2 - 0.001)), [size[0], size[1], size[2], r]);
  return (
    <mesh geometry={g} position={position} rotation={rotation} castShadow receiveShadow>
      <Candy color={color} rough={rough} />
    </mesh>
  );
};

/** Flat label: canvas texture on a plane (text faces +z). */
export const Label: React.FC<{ tex: THREE.Texture; w: number; h: number; position?: [number, number, number]; rotation?: [number, number, number]; opacity?: number }> = ({
  tex,
  w,
  h,
  position,
  rotation,
  opacity = 1,
}) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={tex} roughness={0.4} transparent={opacity < 1} opacity={opacity} />
  </mesh>
);

// ---------- wall with a curtained hatch ("lubang") ----------
export const HatchWall: React.FC<{ t: number; z?: number; lift?: number }> = ({ t, z = -3, lift = 0 }) => {
  const OW = 1.25;
  const OH = 0.95;
  const top = BELT_TOP + OH;
  return (
    <group position={[0, 0, z]}>
      <RBox size={[3.2, 2.6, 0.5]} r={0.08} color="#FFF3EE" position={[-OW / 2 - 1.6, 1.3, 0]} />
      <RBox size={[3.2, 2.6, 0.5]} r={0.08} color="#FFF3EE" position={[OW / 2 + 1.6, 1.3, 0]} />
      <RBox size={[OW + 0.02, 2.6 - top, 0.5]} r={0.05} color="#FFF3EE" position={[0, top + (2.6 - top) / 2, 0]} />
      <RBox size={[OW + 0.02, BELT_TOP, 0.5]} r={0.03} color="#FFF3EE" position={[0, BELT_TOP / 2, 0]} />
      {/* rim ring around the opening */}
      <RBox size={[OW + 0.26, 0.1, 0.56]} r={0.04} color={P.lilac} position={[0, top + 0.05, 0]} />
      {/* inner darkness (deep lilac, never black) */}
      <mesh position={[0, BELT_TOP + OH / 2, -0.6]}>
        <planeGeometry args={[OW + 0.4, OH + 0.4]} />
        <meshBasicMaterial color="#8C78B8" />
      </mesh>
      {/* rubber curtain strips */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = -OW / 2 + (i + 0.5) * (OW / 8);
        const sw = Math.sin(t * 2.2 + i * 0.7) * 0.04 + lift * (0.9 - Math.abs(x) * 0.6);
        return (
          <group key={i} position={[x, top - 0.02, 0.1]} rotation={[-sw, 0, 0]}>
            <mesh position={[0, -OH / 2, 0]} castShadow>
              <boxGeometry args={[OW / 8 - 0.012, OH - 0.02, 0.012]} />
              <meshPhysicalMaterial color="#D8CDEB" roughness={0.35} clearcoat={0.6} transparent opacity={0.88} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------- check-in tag printer ----------
export const Printer: React.FC<{ position: [number, number, number]; blink: number }> = ({ position, blink }) => (
  <group position={position}>
    <RBox size={[0.7, 0.36, 0.55]} r={0.09} color={LANE.butter} position={[0, 0.18, 0]} />
    <RBox size={[0.36, 0.04, 0.08]} r={0.015} color="#FFF8E6" position={[0, 0.36, 0.2]} />
    <mesh position={[0.24, 0.37, -0.15]}>
      <sphereGeometry args={[0.035, 20, 12]} />
      <meshBasicMaterial color={new THREE.Color(LANE.mint).multiplyScalar(1 + blink * 1.6)} toneMapped={false} />
    </mesh>
  </group>
);

// ---------- glowing frame (highlights a region of a tag) ----------
export const GlowFrame: React.FC<{ w: number; h: number; position: [number, number, number]; color: string; k: number }> = ({ w, h, position, color, k }) => {
  const s = 0.7 + 0.3 * k;
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), toneMapped: false, transparent: true }), [color]);
  mat.opacity = k;
  if (k <= 0.001) return null;
  const th = 0.008;
  return (
    <group position={position} scale={[s, 1, s]}>
      {[
        [0, -h / 2, w + th, th],
        [0, h / 2, w + th, th],
        [-w / 2, 0, th, h],
        [w / 2, 0, th, h],
      ].map(([x, z, a, b], i) => (
        <mesh key={i} position={[x, 0, z]} material={mat} ref={(m) => m?.layers.set(FX_LAYER)}>
          <boxGeometry args={[a, 0.004, b]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- flight data card ----------
export const makeCardTexture = (lines: [string, string][], title: string, accent: string) => {
  const W = 640;
  const H = 400;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, W, H);
  g.fillStyle = accent;
  roundRectPath(g, 28, 26, 260, 46, 23);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = `600 26px ${FONT}`;
  g.fillText(title, 46, 58);
  lines.forEach(([k, v], i) => {
    const y = 132 + i * 66;
    g.fillStyle = "rgba(75,63,92,0.55)";
    g.font = `500 26px ${FONT}`;
    g.fillText(k, 36, y);
    g.fillStyle = P.ink;
    g.font = `600 36px ${FONT}`;
    g.fillText(v, 250, y);
    g.fillStyle = "rgba(75,63,92,0.1)";
    g.fillRect(36, y + 20, W - 72, 2);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const FloatCard: React.FC<{ tex: THREE.Texture; position: [number, number, number]; rotation?: [number, number, number]; k: number; w?: number }> = ({ tex, position, rotation, k, w = 1.6 }) => {
  if (k <= 0.001) return null;
  const h = w * (400 / 640);
  return (
    <group position={position} rotation={rotation} scale={0.6 + 0.4 * k}>
      <RBox size={[w + 0.08, h + 0.08, 0.05]} r={0.04} color="#FFFFFF" position={[0, 0, -0.03]} />
      <Label tex={tex} w={w} h={h} position={[0, 0, 0.0]} />
    </group>
  );
};

/** Dotted data link: beads travelling along a curve. */
export const DataLink: React.FC<{ curve: THREE.Curve<THREE.Vector3>; t: number; k: number; color: string }> = ({ curve, t, k, color }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.5), toneMapped: false }), [color]);
  const n = 22;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = ((i / n + t * 0.5) % 1) * k;
        if (u < 0.01) return null;
        const p = curve.getPointAt(Math.min(1, u));
        return (
          <mesh key={i} position={p} material={mat}>
            <sphereGeometry args={[0.022, 12, 8]} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- X-ray tunnel ----------
export const makeXrayTexture = (seed: number) => {
  const W = 512;
  const H = 288;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#E9F4FF";
  g.fillRect(0, 0, W, H);
  // bag silhouette + contents (generic shapes, no real items)
  g.strokeStyle = "rgba(60,110,190,0.9)";
  g.lineWidth = 8;
  roundRectPath(g, 96, 56, 320, 180, 28);
  g.stroke();
  const rnd = mulberry32(seed);
  const cols = ["rgba(255,140,90,0.55)", "rgba(120,200,160,0.6)", "rgba(110,150,240,0.55)"];
  for (let i = 0; i < 7; i++) {
    g.fillStyle = cols[i % 3];
    const x = 120 + rnd() * 230;
    const y = 76 + rnd() * 110;
    roundRectPath(g, x, y, 40 + rnd() * 50, 22 + rnd() * 30, 10);
    g.fill();
  }
  g.fillStyle = "rgba(60,110,190,0.9)";
  g.font = `600 24px ${FONT}`;
  g.fillText("SINAR-X", 20, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const XrayMachine: React.FC<{ t: number; screen: THREE.Texture; scan: number; ok: number }> = ({ t, screen, scan, ok }) => {
  const L = 1.9;
  const okMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  okMat.color.set(ok > 0 ? new THREE.Color(LANE.mint).multiplyScalar(1.8) : new THREE.Color("#F3ECF6"));
  return (
    <group>
      {/* tunnel shell: two sides + roof */}
      <RBox size={[0.18, 1.0, L]} r={0.06} color="#FFFFFF" position={[-0.6, BELT_TOP + 0.35, 0]} />
      <RBox size={[0.18, 1.0, L]} r={0.06} color="#FFFFFF" position={[0.6, BELT_TOP + 0.35, 0]} />
      <RBox size={[1.38, 0.2, L]} r={0.07} color="#FFFFFF" position={[0, BELT_TOP + 0.9, 0]} />
      <RBox size={[1.42, 0.06, L + 0.02]} r={0.02} color={LANE.butter} position={[0, BELT_TOP + 0.78, 0]} />
      {/* curtains both ends */}
      {[L / 2, -L / 2].map((zz) =>
        Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${zz}${i}`} position={[-0.42 + i * 0.168, BELT_TOP + 0.42, zz]} rotation={[Math.sin(t * 2 + i) * 0.04, 0, 0]}>
            <boxGeometry args={[0.15, 0.7, 0.012]} />
            <meshPhysicalMaterial color="#CFC3E4" roughness={0.4} clearcoat={0.5} transparent opacity={0.85} />
          </mesh>
        )),
      )}
      {/* operator screen on a stalk */}
      <group position={[0.95, BELT_TOP + 1.25, 0.2]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={1} />
        </mesh>
        <RBox size={[0.98, 0.6, 0.06]} r={0.04} color="#FFFFFF" />
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.9, 0.506]} />
          <meshBasicMaterial map={screen} toneMapped={false} transparent opacity={0.35 + 0.65 * scan} />
        </mesh>
        <mesh position={[-0.45 + 0.9 * clamp(scan), 0, 0.034]}>
          <planeGeometry args={[0.012, 0.506]} />
          <meshBasicMaterial color="#5CA8FF" toneMapped={false} />
        </mesh>
      </group>
      {/* status lamp */}
      <mesh position={[0, BELT_TOP + 1.04, -L / 2 + 0.2]} material={okMat}>
        <sphereGeometry args={[0.07, 20, 12]} />
      </mesh>
    </group>
  );
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));

// ---------- toy aircraft (no livery) ----------
export const Plane: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation }) => {
  const body = useMemo(() => new THREE.CapsuleGeometry(0.42, 2.6, 8, 32), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={body} rotation={[0, 0, Math.PI / 2]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <Candy color="#FFFFFF" rough={0.22} />
      </mesh>
      {/* lilac belly stripe */}
      <RBox size={[2.9, 0.08, 0.86]} r={0.035} color={P.lilac} position={[0, 0.72, 0]} />
      {/* windows */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.26, 1.02, 0.4]}>
          <sphereGeometry args={[0.05, 14, 10]} />
          <meshPhysicalMaterial color={P.sky} roughness={0.1} clearcoat={1} />
        </mesh>
      ))}
      {/* wings */}
      <RBox size={[0.9, 0.07, 3.6]} r={0.03} color="#F4F0FA" position={[0.1, 0.75, 0]} rotation={[0, 0.25, 0]} />
      {/* engines */}
      {[-1.0, 1.0].map((z) => (
        <mesh key={z} position={[0.35, 0.55, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.5, 24]} />
          <Candy color={P.pink} />
        </mesh>
      ))}
      {/* tail */}
      <RBox size={[0.55, 0.75, 0.06]} r={0.025} color={P.pink} position={[-1.55, 1.45, 0]} rotation={[0, 0, -0.35]} />
      <RBox size={[0.4, 0.05, 1.2]} r={0.02} color="#F4F0FA" position={[-1.6, 1.0, 0]} />
      {/* wheels */}
      {[
        [0.9, 0],
        [-0.1, 0.35],
        [-0.1, -0.35],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 20]} />
          <meshPhysicalMaterial color="#6B5F7E" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- ULD container (LD3-like slanted side) ----------
export const ULD: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; plate: THREE.Texture }> = ({ position, rotation, plate }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.6, 0);
    s.lineTo(0.45, 0);
    s.lineTo(0.75, 0.45);
    s.lineTo(0.75, 1.05);
    s.lineTo(-0.6, 1.05);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.0, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
    g.translate(0, 0, -0.5);
    return g;
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#F2F4F9" metalness={0.35} roughness={0.3} clearcoat={0.6} />
      </mesh>
      {/* open front (curtain rolled up): soft lilac interior */}
      <mesh position={[0.0, 0.5, 0.534]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshStandardMaterial color="#D9CFEA" roughness={0.8} />
      </mesh>
      <Label tex={plate} w={0.8} h={0.2} position={[-0.05, 0.94, 0.536]} />
    </group>
  );
};

// ---------- abstract passenger token (no face) ----------
export const Pawn: React.FC<{ position: [number, number, number]; color: string; ghost?: boolean }> = ({ position, color, ghost }) => (
  <group position={position}>
    <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.24, 0.27, 0.12, 40]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} transparent={ghost} opacity={ghost ? 0.25 : 1} />
    </mesh>
    <mesh position={[0, 0.42, 0]} castShadow>
      <capsuleGeometry args={[0.13, 0.36, 8, 24]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} transparent={ghost} opacity={ghost ? 0.25 : 1} />
    </mesh>
    <mesh position={[0, 0.8, 0]} castShadow>
      <sphereGeometry args={[0.13, 28, 18]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} transparent={ghost} opacity={ghost ? 0.25 : 1} />
    </mesh>
  </group>
);

/** Flat ring on the floor (status ring). */
export const Ring: React.FC<{ position: [number, number, number]; r: number; color: string; k?: number }> = ({ position, r, color, k = 1 }) => {
  if (k <= 0.001) return null;
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={0.6 + 0.4 * k}>
      <ringGeometry args={[r - 0.04, r, 64]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(1.2)} toneMapped={false} transparent opacity={k} />
    </mesh>
  );
};

/** Floating pill sign (canvas text), billboard-ish fixed rotation. */
export const Pill: React.FC<{ text: string; bg: string; position: [number, number, number]; rotation?: [number, number, number]; k: number; w?: number; fg?: string }> = ({
  text,
  bg,
  position,
  rotation,
  k,
  w = 0.7,
  fg = "#FFFFFF",
}) => {
  const tex = useMemo(() => makeSignTexture(text, bg, fg, 512, 192, 96), [text, bg, fg]);
  if (k <= 0.001) return null;
  const h = w * (192 / 512);
  return (
    <group position={position} rotation={rotation} scale={k}>
      <RBox size={[w + 0.04, h + 0.04, 0.05]} r={Math.min(0.08, h / 2)} color={bg} position={[0, 0, -0.03]} />
      <Label tex={tex} w={w} h={h} position={[0, 0, 0.0]} />
    </group>
  );
};

// ---------- instanced mini-bag pile ----------
export const MiniPile: React.FC<{ n: number; max: number; cols: number; position: [number, number, number]; seed: number }> = ({ n, max, cols, position, seed }) => {
  // Built imperatively so matrices AND instance colours exist before the first draw: if the
  // material compiles once without instanceColor, it stays grey for the rest of a video render.
  const mesh = useMemo(() => {
    const geo = new RoundedBoxGeometry(0.13, 0.07, 0.18, 2, 0.025);
    const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.3, clearcoat: 1 });
    const m = new THREE.InstancedMesh(geo, mat, max);
    const rnd = mulberry32(seed);
    const pal = [P.pink, P.mint, P.butter, P.lilac, P.sky, P.peach];
    const o = new THREE.Object3D();
    const per = cols * cols;
    for (let i = 0; i < max; i++) {
      const layer = Math.floor(i / per);
      const j = i % per;
      const x = (j % cols) - (cols - 1) / 2;
      const z = Math.floor(j / cols) - (cols - 1) / 2;
      o.position.set(x * 0.15, 0.035 + layer * 0.075, z * 0.2);
      o.rotation.set(0, (rnd() - 0.5) * 0.08, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(pal[Math.floor(rnd() * pal.length)]));
    }
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor!.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, [max, cols, seed]);
  mesh.count = Math.max(0, Math.min(max, Math.floor(n)));
  return <primitive object={mesh} position={position} />;
};

/** Floor plate with text (lies flat, text readable from +z). */
export const FloorPlate: React.FC<{ text: string; bg: string; position: [number, number, number]; w?: number; fg?: string; k?: number }> = ({ text, bg, position, w = 1.0, fg = "#FFFFFF", k = 1 }) => {
  const tex = useMemo(() => makeSignTexture(text, bg, fg, 640, 200, 104), [text, bg, fg]);
  const h = w * (200 / 640);
  return (
    <group position={position} scale={[k, 1, k]}>
      <RBox size={[w + 0.06, 0.05, h + 0.06]} r={0.02} color={bg} position={[0, 0.025, 0]} />
      <mesh position={[0, 0.0505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
    </group>
  );
};
