// EP01 cover (SKETCHFORGE): "MUNDUR ATAU BERTAHAN?"
// A sketchbook page on a graphite desk; the Vice President's office has lifted off the page:
// hatched desk, an empty chair pushed back, a sealed unaddressed envelope, the MA ruling
// "742 K/TUN/2026" with a vermilion stamp, an AUDIRA archive folder, and three paper cut-out
// figures in the kit's pencil language (no portraits) with name tags: Prabowo, Gibran, Prasetyo.
// He has NOT resigned: only an intention was announced (Mensesneg, 10 Nov 2026).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { makeDeskTexture } from "../../kits/sketchforge/lib/materials";
import {
  FIG_H,
  FIG_W,
  FigureSpec,
  PAGE_D,
  PAGE_W,
  documentTexture,
  envelopeTexture,
  faceTexture,
  figureBackTexture,
  figureTexture,
  folderTagTexture,
  pageTexture,
  plateTexture,
} from "./coverTextures.ts";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: CAVEAT } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

type V3 = [number, number, number];
const BG = P.desk;

// ---------- layout (world units, page centre at origin) ----------
export const DESK = { x: 0.2, z: -1.35, w: 2.2, d: 0.95, h: 0.78 };
export const CHAIR = { x: 0.55, z: -2.1, rot: -0.45 };
export const FIGS: { spec: FigureSpec; pos: V3; rot: number; h: number }[] = [
  {
    spec: { key: "prabowo", build: 1.16, jacket: "safari", jacketTone: "#D8CDB8", peci: true, tie: false, hands: "clasp", seed: 101 },
    pos: [-1.0, 0, -1.05],
    rot: 0.32,
    h: 1.66,
  },
  {
    spec: { key: "gibran", build: 0.9, jacket: "suit", jacketTone: "#55565D", peci: false, tie: false, hands: "side", headTilt: 0.06, seed: 202 },
    pos: [1.08, 0, -0.2],
    rot: -0.26,
    h: 1.8,
  },
  {
    spec: { key: "prasetyo", build: 1.0, jacket: "suit", jacketTone: "#64656C", peci: true, tie: true, holdPaper: true, hands: "side", seed: 303 },
    pos: [-0.12, 0, 0.62],
    rot: 0.05,
    h: 1.6,
  },
];

// ---------- camera ----------
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.position.set(0.3 + t * 0.03, 6.3, 8.6);
    camera.lookAt(0.0, 0.74, -0.75);
    camera.layers.enable(FX_LAYER);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- hatched solid: per-face canvas textures on POLISH.paper ----------
// Face order: +x (shadow side), -x (lit side), +y (top), -y, +z (front), -z (back)
export const HatchBox: React.FC<{ args: [number, number, number]; pos: V3; rot?: number; tone?: string; seed: number; frontLabel?: string; radius?: number }> = ({
  args,
  pos,
  rot = 0,
  tone = P.paperWhite,
  seed,
  frontLabel,
  radius,
}) => {
  const grain = useSurfaceGrain(seed, 0.26, 3);
  const maps = [
    faceTexture("side", tone, seed),
    faceTexture("front", tone, seed + 1),
    faceTexture("top", tone, seed + 2),
    faceTexture("side", tone, seed + 3),
    faceTexture("front", tone, seed + 4, frontLabel),
    faceTexture("side", tone, seed + 5),
  ];
  return (
    <mesh position={pos} rotation={[0, rot, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={args} radius={radius ?? Math.min(...args) * 0.08} segments={3} />
      {maps.map((m, i) => (
        <meshPhysicalMaterial key={i} attach={`material-${i}`} {...POLISH.paper} map={m} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
      ))}
    </mesh>
  );
};

// ---------- dashed lift lines from the page drawing up to the solid ----------
export const LiftLines: React.FC<{ pts: [V3, V3][] }> = ({ pts }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(pts.flatMap(([a, b]) => [new THREE.Vector3(...a), new THREE.Vector3(...b)]));
    return g;
  }, [pts]);
  return (
    <lineSegments geometry={geo} onUpdate={(l) => l.computeLineDistances()}>
      <lineDashedMaterial color={P.graphite} dashSize={0.06} gapSize={0.05} transparent opacity={0.55} />
    </lineSegments>
  );
};

// ---------- desk ----------
export const Desk: React.FC = () => {
  const { x, z, w, d, h } = DESK;
  const top = h;
  const corners: V3[] = [
    [x - w / 2, 0.002, z - d / 2],
    [x + w / 2, 0.002, z - d / 2],
    [x + w / 2, 0.002, z + d / 2],
    [x - w / 2, 0.002, z + d / 2],
  ];
  return (
    <group>
      {/* top slab */}
      <HatchBox args={[w, 0.08, d]} pos={[x, top - 0.04, z]} seed={10} tone={P.paperWhite} radius={0.025} />
      {/* two pedestals + modesty panel */}
      <HatchBox args={[0.58, h - 0.08, d - 0.1]} pos={[x - w / 2 + 0.34, (h - 0.08) / 2, z]} seed={20} tone={P.paper} />
      <HatchBox args={[0.58, h - 0.08, d - 0.1]} pos={[x + w / 2 - 0.34, (h - 0.08) / 2, z]} seed={30} tone={P.paper} />
      <HatchBox args={[w - 1.3, h * 0.55, 0.05]} pos={[x, h - 0.08 - (h * 0.55) / 2, z + 0.12]} seed={40} tone={P.paperShade} />
      {/* drawer lines on the front of the pedestals */}
      {[-1, 1].map((s) =>
        [0.18, 0.4].map((yy) => (
          <mesh key={`${s}${yy}`} position={[x + s * (w / 2 - 0.34), yy, z + (d - 0.1) / 2 + 0.003]}>
            <planeGeometry args={[0.46, 0.012]} />
            <meshBasicMaterial color={P.graphite} />
          </mesh>
        )),
      )}
      <LiftLines pts={corners.map((c) => [c, [c[0], top, c[2]]] as [V3, V3])} />
    </group>
  );
};

// ---------- empty chair, pushed back from the desk ----------
export const Chair: React.FC = () => {
  const { x, z, rot } = CHAIR;
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <HatchBox args={[0.62, 0.12, 0.6]} pos={[0, 0.5, 0]} seed={50} tone={P.clay} radius={0.04} />
      <HatchBox args={[0.6, 0.8, 0.12]} pos={[0, 0.97, -0.28]} seed={60} tone={P.clay} radius={0.05} />
      <HatchBox args={[0.08, 0.06, 0.48]} pos={[-0.33, 0.72, -0.02]} seed={70} tone={P.graphiteSoft} radius={0.02} />
      <HatchBox args={[0.08, 0.06, 0.48]} pos={[0.33, 0.72, -0.02]} seed={71} tone={P.graphiteSoft} radius={0.02} />
      {[-0.33, 0.33].map((ax) => (
        <mesh key={ax} position={[ax, 0.62, 0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 10]} />
          <meshStandardMaterial color={P.graphiteMid} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.44, 14]} />
        <meshStandardMaterial color={P.graphiteMid} roughness={0.4} metalness={0.6} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.17, 0.04, Math.cos(a) * 0.17]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[0.04, 0.035, 0.34]} />
            <meshStandardMaterial color={P.graphite} roughness={0.5} metalness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- flat printed sheet with thickness ----------
export const Sheet: React.FC<{ size: [number, number]; pos: V3; rot?: [number, number, number]; tex: THREE.Texture; thick?: number; edge?: string }> = ({
  size,
  pos,
  rot = [0, 0, 0],
  tex,
  thick = 0.01,
  edge = P.paperShade,
}) => {
  const grain = useSurfaceGrain(19, 0.16, 4);
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow receiveShadow position={[0, thick / 2, 0]}>
        <RoundedBoxGeo args={[size[0], thick, size[1]]} radius={thick * 0.45} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={edge} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, thick + 0.0015, 0]}>
        <planeGeometry args={size} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} />
      </mesh>
    </group>
  );
};

// ---------- desk props ----------
export const DeskProps: React.FC = () => {
  const top = DESK.h;
  const { x, z } = DESK;
  return (
    <group>
      {/* sealed envelope with vermilion wax seal (no address: no official letter exists) */}
      <Sheet size={[0.62, 0.4]} pos={[x - 0.1, top, z + 0.12]} rot={[0, 0.12, 0]} tex={envelopeTexture()} thick={0.016} edge="#E4D8C2" />
      <mesh position={[x - 0.1 + 0.005, top + 0.03, z + 0.12 + 0.03]} castShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.02, 24]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.accentDeep} clearcoat={0.8} roughness={0.35} />
      </mesh>
      {/* AUDIRA archive folder, tag on the spine edge */}
      <group position={[x - 0.72, top, z - 0.05]} rotation={[0, -0.18, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
          <RoundedBoxGeo args={[0.62, 0.06, 0.8]} radius={0.012} segments={2} />
          <meshPhysicalMaterial {...POLISH.paper} color={P.graphiteMid} />
        </mesh>
        <mesh position={[0, 0.0615, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.156]} />
          <meshPhysicalMaterial {...POLISH.paper} map={folderTagTexture()} />
        </mesh>
      </group>
      {/* name plate on the front edge */}
      <group position={[x + 0.5, top, z + 0.32]} rotation={[0, -0.08, 0]}>
        <mesh castShadow position={[0, 0.055, 0]} rotation={[-0.35, 0, 0]}>
          <RoundedBoxGeo args={[0.56, 0.12, 0.03]} radius={0.01} segments={2} />
          <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} />
        </mesh>
        <mesh position={[0, 0.056, 0.0165]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.53, 0.11]} />
          <meshBasicMaterial map={plateTexture()} toneMapped={false} />
        </mesh>
      </group>
      {/* pencil cup */}
      <group position={[x + 0.82, top, z - 0.25]}>
        <mesh castShadow position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.08, 0.075, 0.22, 20]} />
          <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} />
        </mesh>
        {[[-0.02, 0.1], [0.03, -0.12], [0.0, 0.02]].map(([dx, tilt], i) => (
          <mesh key={i} castShadow position={[dx, 0.25, 0]} rotation={[0, 0, tilt]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <meshStandardMaterial color={i === 1 ? P.accent : P.wood} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------- paper cut-out figure on a small stand ----------
export const Figure: React.FC<{ spec: FigureSpec; pos: V3; rot: number; h: number }> = ({ spec, pos, rot, h }) => {
  const w = (h * FIG_W) / FIG_H;
  const front = figureTexture(spec);
  const back = figureBackTexture(spec);
  const grain = useSurfaceGrain(spec.seed, 0.18, 2);
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, h / 2 + 0.04, 0.004]} castShadow receiveShadow onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial {...POLISH.paper} map={front} alphaTest={0.5} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, h / 2 + 0.04, -0.004]} rotation={[0, Math.PI, 0]} castShadow onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial {...POLISH.paper} map={back} alphaTest={0.5} />
      </mesh>
      {/* folded card stand */}
      <mesh position={[0, 0.03, -0.02]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w * 0.62, 0.06, 0.22]} radius={0.015} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} />
      </mesh>
    </group>
  );
};

// ---------- sketchbook page ----------
export const Page: React.FC = () => {
  const tex = pageTexture([
    { x: DESK.x, z: DESK.z, w: DESK.w, d: DESK.d },
    { x: CHAIR.x, z: CHAIR.z, w: 0.62, d: 0.6, rot: CHAIR.rot },
  ]);
  const grain = useSurfaceGrain(63, 0.14, 5);
  const rings = useMemo(() => Array.from({ length: 13 }, (_, i) => -PAGE_W / 2 + 0.35 + (i * (PAGE_W - 0.7)) / 12), []);
  return (
    <group>
      <mesh position={[0.05, -0.05, 0.04]} receiveShadow castShadow>
        <RoundedBoxGeo args={[PAGE_W + 0.24, 0.05, PAGE_D + 0.24]} radius={0.02} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} />
      </mesh>
      <mesh position={[0, -0.022, 0]} receiveShadow>
        <boxGeometry args={[PAGE_W, 0.04, PAGE_D]} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.paperShade} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <planeGeometry args={[PAGE_W, PAGE_D]} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} />
      </mesh>
      {rings.map((rx) => (
        <mesh key={rx} position={[rx, 0.02, -PAGE_D / 2 - 0.02]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.11, 0.017, 8, 20]} />
          <meshStandardMaterial color="#9EA0A6" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

export const DeskSurface: React.FC = () => {
  const tex = useMemo(() => makeDeskTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={tex} roughness={0.7} metalness={0.05} />
    </mesh>
  );
};

// ---------- foreground pencil + eraser ----------
export const Pencil: React.FC<{ pos: V3; rot: number }> = ({ pos, rot }) => (
  <group position={pos} rotation={[0, rot, Math.PI / 2]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
      <meshPhysicalMaterial {...POLISH.paper} color={P.accent} roughness={0.55} />
    </mesh>
    <mesh castShadow position={[0, 0.9, 0]}>
      <coneGeometry args={[0.05, 0.2, 6]} />
      <meshPhysicalMaterial {...POLISH.paper} color={P.wood} />
    </mesh>
    <mesh position={[0, 0.985, 0]}>
      <coneGeometry args={[0.016, 0.05, 6]} />
      <meshStandardMaterial color={P.graphite} roughness={0.4} metalness={0.3} />
    </mesh>
    <mesh castShadow position={[0, -0.84, 0]}>
      <cylinderGeometry args={[0.052, 0.052, 0.1, 12]} />
      <meshStandardMaterial color="#B9BBC0" metalness={0.9} roughness={0.3} />
    </mesh>
  </group>
);

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig f={f} />
    <ambientLight intensity={0.4} color="#FFF4E6" />
    <hemisphereLight args={["#FFF1DC", "#1A1A1E", 0.5]} />
    <directionalLight
      position={[-4.5, 8, 3.5]}
      intensity={2.6}
      color="#FFE6C4"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
      shadow-radius={5}
      onUpdate={(l) => l.shadow.camera.layers.enable(FX_LAYER)}
    />
    <directionalLight position={[4.5, 3.5, -5]} intensity={0.9} color="#A9C6EA" />

    <DeskSurface />
    <Page />
    <Desk />
    <Chair />
    <DeskProps />
    {/* MA ruling on the page, propped slightly toward the camera */}
    <Sheet size={[1.0, 1.32]} pos={[-1.05, 0.02, 0.55]} rot={[0.0, 0.14, 0]} tex={documentTexture()} thick={0.012} edge="#EEE6D6" />
    {FIGS.map((fg) => (
      <Figure key={fg.spec.key} {...fg} />
    ))}
    <Pencil pos={[1.25, 0.06, 2.35]} rot={0.75} />
    <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.85} envIntensity={0.25} ao />
  </>
);

// ---------- HTML overlay ----------
const NameTag: React.FC<{ x: number; y: number; name: string; role: string; rot?: number; align?: "left" | "right" }> = ({ x, y, name, role, rot = 0, align = "left" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rot}deg)`,
      background: "#FBF7EF",
      border: "3px solid #2F3034",
      boxShadow: "6px 8px 0 rgba(20,20,24,0.45)",
      padding: "10px 18px 12px",
      textAlign: align,
    }}
  >
    <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 36, lineHeight: 1.0, color: "#2F3034", letterSpacing: 0.5, textTransform: "uppercase" }}>{name}</div>
    <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 28, lineHeight: 1.15, color: P.accentDeep, marginTop: 4 }}>{role}</div>
  </div>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(38,38,42,0.95) 0%, rgba(38,38,42,0.85) 26%, rgba(38,38,42,0.0) 37%, rgba(38,38,42,0) 80%, rgba(38,38,42,0.5) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 194, fontFamily: OSWALD, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: P.accent }}>
      AUDIRA · BERITA VIRAL
    </div>
    <div style={{ position: "absolute", left: 66, top: 250, color: "#F3EBDD", lineHeight: 0.92, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
      <div style={{ fontFamily: ANTON, fontSize: 188, letterSpacing: 1 }}>MUNDUR</div>
      <div style={{ fontFamily: ANTON, fontSize: 112, letterSpacing: 1, marginTop: 6 }}>
        ATAU <span style={{ color: P.accent }}>BERTAHAN?</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 72, top: 552, fontFamily: CAVEAT, fontWeight: 700, fontSize: 46, color: "#F3EBDD", opacity: 0.92 }}>
      Niat mundur disampaikan, 10 Nov 2026
    </div>
    <NameTag x={44} y={1112} name="Prabowo Subianto" role="Presiden" rot={-2} />
    <NameTag x={600} y={1262} name="Gibran Rakabuming Raka" role="Wakil Presiden" rot={1.5} align="right" />
    <NameTag x={396} y={1412} name="Prasetyo Hadi" role="Mensesneg" rot={-1.5} />
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.3, 6.3, 8.6], fov: 33, near: 0.1, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};

export const Ep01Cover = Cover;
