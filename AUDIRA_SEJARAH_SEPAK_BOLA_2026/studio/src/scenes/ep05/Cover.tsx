// EP05 cover (TACTICBOARD): "Klub Raja Liga". The kit's miniature pitch board becomes a league-title
// ladder: three stacks of acrylic pucks in club colours, one puck per league title (HIGH rows of
// research/RESEARCH_REPORT.md): Linfield 57 (world record), Celtic 56, Rangers 55. A gold record line
// sits at puck 57; a chalk telestrator note marks it. No crests: club colours + text names only.
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
const GREEN = "#2BD46A";
const GOLD = P.goalGold;

// ---------- camera (also used to place the HTML chips exactly over the 3D stacks) ----------
const CAM = { pos: [0, 4.1, 10.6] as V3, target: [0, 1.3, 0.6] as V3, fov: 38 };

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

// ---------- clubs (HIGH rows only) ----------
type Club = {
  name: string;
  country: string;
  titles: number;
  x: number;
  z: number;
  body: string;
  alt: string; // every-10th puck (Celtic: every other puck = hoops)
  hoops?: boolean;
  chip: string;
  seed: number;
};
const CLUBS: Club[] = [
  { name: "CELTIC", country: "SKOTLANDIA", titles: 56, x: -1.24, z: 0.6, body: "#159A4C", alt: "#F4F6EE", hoops: true, chip: "#159A4C", seed: 11 },
  { name: "LINFIELD", country: "IRLANDIA UTARA", titles: 57, x: 0, z: 0.6, body: "#2F6FE4", alt: "#F4F6EE", chip: "#2F6FE4", seed: 23 },
  { name: "RANGERS", country: "SKOTLANDIA", titles: 55, x: 1.24, z: 0.6, body: "#16337F", alt: "#D3202E", chip: "#16337F", seed: 37 },
];
const PR = 0.4; // puck radius
const PH = 0.046; // puck height
const topY = (n: number) => n * PH;

const numberTexture = (n: number, bg: string, fg = "#FFFFFF") => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(255,255,255,0.92)";
  g.lineWidth = 12;
  g.beginPath();
  g.arc(128, 128, 104, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = fg;
  g.font = "bold 120px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 128, 136);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Stack: React.FC<{ c: Club }> = ({ c }) => {
  const grain = useSurfaceGrain(c.seed, 0.12, 3);
  const pucks = useMemo(() => {
    const r = prng(c.seed * 97);
    return Array.from({ length: c.titles }, (_, i) => ({
      dx: (r() - 0.5) * 0.022,
      dz: (r() - 0.5) * 0.022,
      rot: r() * Math.PI * 2,
      alt: c.hoops ? i % 2 === 1 : (i + 1) % 10 === 0,
    }));
  }, [c]);
  const topTex = useMemo(() => numberTexture(c.titles, c.body), [c]);
  const last = pucks[pucks.length - 1];
  return (
    <group position={[c.x, 0.01, c.z]}>
      {pucks.map((p, i) => (
        <mesh key={i} position={[p.dx, i * PH + PH / 2, p.dz]} rotation={[0, p.rot, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[PR, PR, PH * 0.94, 48]} />
          <meshPhysicalMaterial {...POLISH.brickABS} color={p.alt ? c.alt : c.body} roughnessMap={grain} />
        </mesh>
      ))}
      {/* numbered top face of the last (newest) puck */}
      <mesh position={[last.dx, topY(c.titles) + 0.002, last.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PR * 0.985, 64]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={topTex} />
      </mesh>
    </group>
  );
};

// ---------- gold record line at puck 57 ----------
const RecordLine: React.FC = () => {
  const y = topY(57) + 0.012;
  const segs = useMemo(() => {
    const out: number[] = [];
    for (let x = -2.25; x < 2.25; x += 0.2) out.push(x);
    return out;
  }, []);
  return (
    <group position={[0, y, 0.1]}>
      {segs.map((x) => (
        <mesh key={x} position={[x + 0.06, 0, 0]}>
          <RoundedBoxGeo args={[0.12, 0.018, 0.018]} radius={0.006} segments={2} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- loose pucks (foreground) + match ball ----------
const LOOSE: { p: V3; c: string; rx: number; rz: number }[] = [
  { p: [-1.15, 0.03, 3.75], c: "#159A4C", rx: 0, rz: 0 },
  { p: [-1.1, 0.076, 3.72], c: "#F4F6EE", rx: 0, rz: 0 },
  { p: [1.2, 0.03, 3.95], c: "#16337F", rx: 0, rz: 0 },
  { p: [0.45, 0.03, 4.15], c: "#2F6FE4", rx: 0, rz: 0 },
];

const Ball: React.FC<{ pos: V3 }> = ({ pos }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F6F7F2";
    g.fillRect(0, 0, 512, 256);
    const r = prng(5);
    g.fillStyle = "#1B1F24";
    for (let i = 0; i < 12; i++) {
      const cx = (i % 6) * 86 + (i < 6 ? 30 : 73);
      const cy = i < 6 ? 78 : 182;
      g.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r() * 0.2;
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
      <sphereGeometry args={[0.2, 48, 32]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} map={tex} clearcoat={0.6} roughness={0.35} />
    </mesh>
  );
};

// ---------- AUDIRA pitch-side LED ad board behind the stacks (brand inside the world) ----------
const AdBoard: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#06120B";
    g.fillRect(0, 0, 2048, 128);
    // thin LED stripes; one small AUDIRA tag that lands in the gap between LINFIELD and RANGERS
    g.fillStyle = "rgba(43,212,106,0.55)";
    g.fillRect(0, 8, 2048, 5);
    g.fillRect(0, 115, 2048, 5);
    g.fillStyle = "rgba(43,212,106,0.18)";
    for (let x = 0; x < 2048; x += 22) g.fillRect(x, 30, 10, 68);
    g.fillStyle = "#06120B";
    g.fillRect(1180, 22, 230, 84);
    g.font = "bold 48px Arial, sans-serif";
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = "#E8FFF0";
    g.fillText("AUDIRA", 1295, 66);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group position={[0, 0.2, -2.3]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[6.3, 0.38, 0.08]} radius={0.02} segments={2} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#11171D" />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[6.1, 0.32]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <color attach="background" args={[P.void]} />
    <fog attach="fog" args={[P.void, 16, 38]} />
    <ambientLight intensity={0.32} color="#DDE6F0" />
    <hemisphereLight args={["#CFE0FF", "#1A2A10", 0.5]} />
    <directionalLight
      position={[4.5, 10, 6]}
      intensity={2.5}
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
    {/* cool rim from behind to separate the stacks from the stadium */}
    <directionalLight position={[-5, 6, -10]} intensity={1.3} color="#9CC3FF" />
    {/* soft green bounce off the pitch */}
    <pointLight position={[0, 0.6, 2.6]} intensity={4} distance={6} color="#7BE39A" />

    <PitchBoard3D t={0} />
    {CLUBS.map((c) => (
      <Stack key={c.name} c={c} />
    ))}
    <RecordLine />
    {LOOSE.map((l, i) => (
      <mesh key={i} position={l.p} rotation={[l.rx, i * 0.7, l.rz]} castShadow receiveShadow>
        <cylinderGeometry args={[PR, PR, PH * 0.94, 48]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={l.c} />
      </mesh>
    ))}
    <Ball pos={[-0.3, 0.21, 3.6]} />
    <AdBoard />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0.55} ao focus={10.4} aperture={0.002} maxBlur={0.008} />
  </>
);

// ---------- HTML overlay: kicker, headline, chips at stack bases, chalk note ----------
const Chalk: React.FC = () => {
  const lin = CLUBS[1];
  const [cx, cy] = project([lin.x, topY(57), lin.z]);
  const [lx, ly] = project([2.25, topY(57) + 0.012, 0.1]);
  // note sits right of the stacks, above the record line's end
  const nx = Math.min(lx - 40, W - 330);
  const ny = ly - 150;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="chalk" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feComposite in="d" in2="n" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="d" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#chalk)" fill="none" stroke="#FFE27A" strokeLinecap="round" strokeLinejoin="round" opacity={0.95}>
        {/* loose double ring around the 57th puck */}
        <ellipse cx={cx} cy={cy + 4} rx={128} ry={52} strokeWidth={7} transform={`rotate(-4 ${cx} ${cy})`} />
        <ellipse cx={cx + 3} cy={cy + 1} rx={136} ry={58} strokeWidth={3.5} transform={`rotate(-7 ${cx} ${cy})`} />
        {/* arrow from the note to the ring */}
        <path d={`M ${nx + 60} ${ny + 70} Q ${nx - 10} ${ny + 70} ${cx + 128} ${cy - 30}`} strokeWidth={7} />
        <path d={`M ${cx + 128} ${cy - 30} l 34 -6 M ${cx + 128} ${cy - 30} l 14 -30`} strokeWidth={7} />
      </g>
      <text
        x={nx + 70}
        y={ny + 50}
        fill="#FFE27A"
        filter="url(#chalk)"
        style={{ fontFamily: MARKER, fontSize: 44 }}
        transform={`rotate(-5 ${nx + 70} ${ny + 50})`}
      >
        <tspan x={nx + 70}>REKOR</tspan>
        <tspan x={nx + 70} dy={46}>DUNIA!</tspan>
      </text>
    </svg>
  );
};

const Chips: React.FC = () => (
  <>
    {CLUBS.map((c) => {
      const [x, y] = project([c.x, 0, c.z + PR + 0.05]);
      const hero = c.titles === 57;
      return (
        <div
          key={c.name}
          style={{
            position: "absolute",
            left: x,
            top: y + 8,
            transform: "translateX(-50%)",
            width: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))",
          }}
        >
          <div
            style={{
              fontFamily: ANTON,
              fontSize: hero ? 84 : 68,
              lineHeight: 1,
              color: hero ? GOLD : "#FFFFFF",
              textShadow: "0 4px 14px rgba(0,0,0,0.7)",
            }}
          >
            {c.titles}
          </div>
          <div
            style={{
              marginTop: 2,
              background: c.chip,
              color: "#FFFFFF",
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 2,
              padding: "4px 14px",
              borderRadius: 8,
              border: hero ? `3px solid ${GOLD}` : "3px solid rgba(255,255,255,0.85)",
            }}
          >
            {c.name}
          </div>
          <div style={{ marginTop: 2, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: "#E8FFF0" }}>{c.country}</div>
        </div>
      );
    })}
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(7,11,16,0.9) 0%, rgba(7,11,16,0.72) 22%, rgba(7,11,16,0) 36%, rgba(7,11,16,0) 80%, rgba(7,11,16,0.5) 100%)",
      }}
    />
    <Chalk />
    <Chips />
    {/* kicker */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: GREEN, color: "#06210F", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(8,12,18,0.92)", color: GOLD, padding: "8px 16px" }}>#05</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#E8FFF0", border: `2px solid ${GREEN}`, borderRadius: 8, padding: "6px 12px" }}>
        GELAR LIGA · AUDIRA
      </div>
    </div>
    {/* headline */}
    <div style={{ position: "absolute", left: 56, top: 268, fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 150, letterSpacing: 1 }}>
        RAJA LIGA <span style={{ color: GOLD }}>DUNIA</span>
      </div>
      <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: "#06210F", background: GREEN, padding: "2px 18px 6px", transform: "rotate(-1.5deg)" }}>
        bukan klub yang kamu kira
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
