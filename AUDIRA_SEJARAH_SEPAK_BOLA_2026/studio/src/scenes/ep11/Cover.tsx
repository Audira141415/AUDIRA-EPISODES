// EP11 cover (TACTICBOARD): "AC Milan, Dinasti Merah-Hitam". One hero: Sacchi's compact 4-4-2 block of
// red-black pucks squeezed into 25 m (defence line to forward line, research/SOURCE_REGISTER.md row 8),
// closing on a ball carrier. Elevated 3/4 board view (EP05 used a low front view of puck stacks).
// No crests: Rossoneri stripes on the pucks + text names only. Opponents are generic white pucks.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { PitchBoard3D } from "../../kits/tacticboard/scene/PitchBoard3D";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { prng } from "../../kits/tacticboard/core/motion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

type V3 = [number, number, number];
const W = 1080;
const H = 1920;
export const RED = "#D7192A";
export const BLACK = "#121214";
const GOLD = P.goalGold;
const CHALK = "#FFE27A";

// ---------- camera ----------
export const CAM = { pos: [-0.1, 9.5, 8.1] as V3, target: [-0.35, 0, -0.75] as V3, fov: 40 };

const project = (p: V3): [number, number] => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, W / H, 0.1, 120);
  cam.position.set(...CAM.pos);
  cam.lookAt(...CAM.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
};

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...CAM.pos);
    cam.lookAt(...CAM.target);
    cam.fov = CAM.fov;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// ---------- the block: 1 unit = 10 m (pitch 104 m = 10.4 units) ----------
const DEF_Z = 1.3; // back four
const MID_Z = 0.15; // midfield four
const FWD_Z = -1.2; // two forwards -> DEF_Z - FWD_Z = 2.5 units = 25 m
export const MILAN: { p: [number, number]; n: number }[] = [
  { p: [-1.4, DEF_Z], n: 3 },
  { p: [-0.47, DEF_Z + 0.08], n: 5 },
  { p: [0.47, DEF_Z + 0.08], n: 6 },
  { p: [1.4, DEF_Z], n: 2 },
  { p: [-1.45, MID_Z], n: 11 },
  { p: [-0.5, MID_Z + 0.05], n: 4 },
  { p: [0.5, MID_Z - 0.05], n: 8 },
  { p: [1.35, MID_Z - 0.25], n: 7 },
  { p: [-0.3, FWD_Z], n: 9 },
  { p: [0.7, FWD_Z - 0.05], n: 10 },
];
export const CARRIER: [number, number] = [1.12, -0.72];
export const OPP: [number, number][] = [CARRIER, [-1.0, -2.0], [0.25, -2.4], [1.75, -2.0]];
const R = 0.27; // puck radius
const PH = 0.09;

const stripeTexture = (n: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? BLACK : RED;
    g.fillRect(i * 32, 0, 32, 256);
  }
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath();
  g.arc(128, 128, 62, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = BLACK;
  g.font = "bold 84px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 128, 134);
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 10;
  g.beginPath();
  g.arc(128, 128, 120, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const MilanPuck: React.FC<{ x: number; z: number; n: number; seed: number }> = ({ x, z, n, seed }) => {
  const grain = useSurfaceGrain(seed, 0.12, 3);
  const top = useMemo(() => stripeTexture(n), [n]);
  return (
    <group position={[x, 0.012, z]}>
      <mesh position={[0, PH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, PH, 48]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={BLACK} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, PH * 0.62, 0]}>
        <cylinderGeometry args={[R * 1.004, R * 1.004, PH * 0.3, 48, 1, true]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={RED} />
      </mesh>
      <mesh position={[0, PH + 0.002, 0]} rotation={[-Math.PI / 2, 0, -0.3]}>
        <circleGeometry args={[R * 0.985, 64]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={top} />
      </mesh>
    </group>
  );
};

export const OppPuck: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0.012, z]}>
    <mesh position={[0, PH / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[R, R, PH, 48]} />
      <meshPhysicalMaterial {...POLISH.brickABS} color="#EEF1F4" />
    </mesh>
    <mesh position={[0, PH + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[R * 0.55, R * 0.75, 48]} />
      <meshBasicMaterial color="#8A96A3" />
    </mesh>
  </group>
);

export const Ball: React.FC<{ pos: V3; r?: number }> = ({ pos, r = 0.11 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F6F7F2";
    g.fillRect(0, 0, 512, 256);
    const rr = prng(5);
    g.fillStyle = "#1B1F24";
    for (let i = 0; i < 12; i++) {
      const cx = (i % 6) * 86 + (i < 6 ? 30 : 73);
      const cy = i < 6 ? 78 : 182;
      g.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + rr() * 0.2;
        g.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 26);
      }
      g.closePath();
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={pos} rotation={[0.4, 0.9, 0.2]} castShadow receiveShadow>
      <sphereGeometry args={[r, 48, 32]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} map={tex} clearcoat={0.6} roughness={0.35} />
    </mesh>
  );
};

// glowing chalk lines of the block (defence line and forward line) drawn on the board itself
const BlockLine: React.FC<{ z: number }> = ({ z }) => {
  const segs = useMemo(() => {
    const out: number[] = [];
    for (let x = -1.85; x < 1.85; x += 0.24) out.push(x);
    return out;
  }, []);
  return (
    <group position={[0, 0.016, z]}>
      {segs.map((x) => (
        <mesh key={x} position={[x + 0.07, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.14, 0.035]} />
          <meshBasicMaterial color={CHALK} toneMapped={false} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
};

// AUDIRA painted on the turf like a sponsor stencil, between the block and the near box (brand inside the world)
export const TurfBrand: React.FC<{ z?: number }> = ({ z = 2.25 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 1024, 256);
    g.font = "bold 190px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,255,255,0.44)";
    g.fillText("AUDIRA", 512, 136);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.014, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.1, 0.52]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

// AUDIRA LED ad board beyond the far touchline (brand inside the world)
export const AdBoard: React.FC<{ z?: number }> = ({ z = -3.05 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#120607";
    g.fillRect(0, 0, 2048, 128);
    g.fillStyle = "rgba(215,25,42,0.6)";
    g.fillRect(0, 8, 2048, 5);
    g.fillRect(0, 115, 2048, 5);
    g.fillStyle = "rgba(215,25,42,0.2)";
    for (let x = 0; x < 2048; x += 22) g.fillRect(x, 30, 10, 68);
    g.fillStyle = "#120607";
    g.fillRect(884, 18, 280, 92);
    g.font = "bold 58px Arial, sans-serif";
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = "#FFF1F1";
    g.fillText("AUDIRA", 1024, 66);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group position={[0, 0.2, z]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[5.2, 0.36, 0.08]} radius={0.02} segments={2} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#17110F" />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[5.0, 0.3]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <color attach="background" args={[P.void]} />
    <fog attach="fog" args={[P.void, 14, 34]} />
    <ambientLight intensity={0.3} color="#E6E2DC" />
    <hemisphereLight args={["#FFE6D6", "#1A2A10", 0.45]} />
    <directionalLight
      position={[-4, 10, 5]}
      intensity={2.6}
      color={P.flood}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={7}
      shadow-camera-bottom={-7}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0004}
    />
    {/* warm red rim from the far side: Rossoneri mood without tinting the grass */}
    <directionalLight position={[4, 4, -9]} intensity={1.1} color="#FF7A6A" />
    <PitchBoard3D t={0} />
    <BlockLine z={DEF_Z + 0.35} />
    <BlockLine z={FWD_Z - 0.35} />
    {MILAN.map((m, i) => (
      <MilanPuck key={m.n} x={m.p[0]} z={m.p[1]} n={m.n} seed={31 + i * 7} />
    ))}
    {OPP.map((o, i) => (
      <OppPuck key={i} x={o[0]} z={o[1]} />
    ))}
    <Ball pos={[CARRIER[0] - 0.1, 0.12, CARRIER[1] + 0.36]} />
    <TurfBrand />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao focus={12.3} aperture={0.002} maxBlur={0.006} />
  </>
);

// ---------- HTML overlay ----------
const ChalkLayer: React.FC = () => {
  // 25 m bracket on the left side of the block
  const bx = -1.95;
  const [ax, ay] = project([bx, 0.02, DEF_Z + 0.35]);
  const [cx, cy] = project([bx, 0.02, FWD_Z - 0.35]);
  const mx = (ax + cx) / 2 - 40;
  const my = (ay + cy) / 2;
  // pressing arrows: three red-black pucks close on the carrier
  const [tx, ty] = project([CARRIER[0], 0.05, CARRIER[1]]);
  const from = [MILAN[9].p, MILAN[7].p, MILAN[6].p].map((p) => project([p[0], 0.05, p[1]]));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="chalk" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#chalk)" fill="none" stroke={CHALK} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${ax + 26} ${ay} L ${ax - 10} ${ay} L ${cx - 10} ${cy} L ${cx + 26} ${cy}`} strokeWidth={7} />
        {from.map(([fx, fy], i) => {
          const k = 0.7;
          const ex = fx + (tx - fx) * k;
          const ey = fy + (ty - fy) * k;
          const ang = Math.atan2(ey - fy, ex - fx);
          const h1 = [ex - Math.cos(ang - 0.5) * 26, ey - Math.sin(ang - 0.5) * 26];
          const h2 = [ex - Math.cos(ang + 0.5) * 26, ey - Math.sin(ang + 0.5) * 26];
          return (
            <g key={i} strokeWidth={6} stroke="#FF5A4A">
              <path d={`M ${fx} ${fy} L ${ex} ${ey}`} />
              <path d={`M ${h1[0]} ${h1[1]} L ${ex} ${ey} L ${h2[0]} ${h2[1]}`} />
            </g>
          );
        })}
      </g>
      <text
        x={mx}
        y={my}
        fill={CHALK}
        filter="url(#chalk)"
        textAnchor="end"
        style={{ fontFamily: MARKER, fontSize: 58 }}
        transform={`rotate(-4 ${mx} ${my})`}
      >
        <tspan x={mx}>25</tspan>
        <tspan x={mx} dy={56}>M</tspan>
      </text>
    </svg>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(7,11,16,0.92) 0%, rgba(7,11,16,0.78) 24%, rgba(7,11,16,0) 38%, rgba(7,11,16,0) 82%, rgba(7,11,16,0.55) 100%)",
      }}
    />
    <ChalkLayer />
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: RED, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(8,8,10,0.94)", color: GOLD, padding: "8px 16px" }}>#11</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#FFF1F1", border: `2px solid ${RED}`, borderRadius: 8, padding: "6px 12px" }}>
        AC MILAN · AUDIRA
      </div>
    </div>
    <div style={{ position: "absolute", left: 56, top: 270, fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 132, letterSpacing: 1 }}>DINASTI</div>
      <div style={{ fontSize: 132, letterSpacing: 1 }}>
        <span style={{ color: RED }}>MERAH</span>-HITAM
      </div>
      <div style={{ marginTop: 16, display: "inline-block", fontFamily: MARKER, fontSize: 50, color: BLACK, background: GOLD, padding: "2px 18px 6px", transform: "rotate(-1.5deg)" }}>
        7 mahkota Eropa, rahasianya 25 meter
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM.pos, fov: CAM.fov, near: 0.1, far: 120 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
