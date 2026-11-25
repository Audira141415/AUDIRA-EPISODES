// EP28 cover (CHAINREACTION): "La Remontada — Barcelona vs PSG 2017".
// Workshop table: 7 coloured dominoes represent the 7 goals (PSG 4 up, Barca needing 6).
// 4 dominoes toppled (PSG's 4-goal lead overcome), domino 5 at peak of fall (Neymar),
// domino 6 also tipping (Cavani OG + Suárez), domino 7 standing = Sergi Roberto 95'.
// Blaugrana palette on domino faces. AUDIRA banner in-scene on the cloth banner rig.
// Facts: 4-0 aggregate deficit, 6-1 win, 6-5 total, 95th-minute goal. No real faces.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { CHAINREACTION_PALETTE as P } from "../../kits/chainreaction/lib/palette.ts";
import { woodGrain } from "../../kits/chainreaction/lib/materials.ts";

const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: ANTON } = loadAnton();

type V3 = [number, number, number];
const W = 1080;
const H = 1920;

const CAM_POS: V3 = [-0.1, 1.68, 4.4];
const CAM_TARGET: V3 = [0, 0.3, -0.5];
const CAM_FOV = 44;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...CAM_POS);
    cam.lookAt(...CAM_TARGET);
    cam.fov = CAM_FOV;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// Domino geometry constants
const DH = 0.68;  // height
const DW = 0.24;  // width
const DD = 0.055; // depth
const SPACING = 0.34;

// Blaugrana + PSG colors mapped to 7 goal dominoes
// dom 1-4: toppled (Blaugrana, goals scored), dom 5: mid-fall, dom 6: tipping, dom 7: standing
const DOM_COLORS = [
  "#1A508C", // Messi 3' (blau)
  "#A50044", // Suárez 45+1' (grana)
  "#1A508C", // Neymar 88' (blau)
  "#A50044", // Neymar 90+1' (grana)
  "#1A508C", // Neymar 90+4' (blau) — mid-fall
  "#A50044", // Cavani OG (grana) — tipping
  "#FFB800", // Sergi Roberto 95' — gold, still standing
];

const dominoFaceCanvas = (bg: string, label: string): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 128, 256);
  // white pips / divider
  g.fillStyle = "rgba(255,255,255,0.72)";
  g.fillRect(32, 120, 64, 4);
  // 3 pips top half
  [[64, 42], [40, 90], [88, 90]].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 10, 0, Math.PI * 2);
    g.fill();
  });
  // 3 pips bottom half
  [[40, 170], [64, 215], [88, 170]].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 10, 0, Math.PI * 2);
    g.fill();
  });
  // number label on the face edge
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.font = "bold 32px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(label, 64, 20);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Rotation state: fully toppled = -90°, standing = 0°, mid-fall = -45°, tipping = -15°
const DOMINO_ROTS = [
  -Math.PI / 2 + 0.08, // 1 fully down
  -Math.PI / 2 + 0.1,  // 2 fully down
  -Math.PI / 2 + 0.06, // 3 fully down
  -Math.PI / 2 + 0.07, // 4 fully down
  -Math.PI / 2 + 0.4,  // 5 mid-fall (peak)
  -0.22,               // 6 just tipping (starting to fall)
  0,                   // 7 standing upright
];

const Domino: React.FC<{ i: number }> = ({ i }) => {
  const face = useMemo(() => dominoFaceCanvas(DOM_COLORS[i], String(i + 1)), [i]);
  const rot = DOMINO_ROTS[i];
  const x = -1.08 + i * SPACING;
  const grain = useSurfaceGrain(200 + i, 0.1, 2);
  return (
    // pivot at bottom center of domino face
    <group position={[x, 0.0, 0]}>
      <group rotation={[0, 0, rot]} style={{}}>
        <group position={[0, DH / 2, 0]}>
          <mesh castShadow receiveShadow>
            <RoundedBoxGeo args={[DW, DH, DD]} radius={0.008} segments={2} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={DOM_COLORS[i]} roughnessMap={grain} />
          </mesh>
          {/* face decal */}
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, 0, (s * DD) / 2 + s * 0.001]}>
              <planeGeometry args={[DW * 0.86, DH * 0.9]} />
              <meshBasicMaterial map={face} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

/** Knocked-over domino contact shadow. */
const FlatShadow: React.FC<{ i: number }> = ({ i }) => {
  if (i >= 5) return null;
  const x = -1.08 + i * SPACING;
  // when toppled, the domino lies flat toward -z; shadow elongated
  const len = DH * 0.9;
  return (
    <mesh position={[x - len * 0.5, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[len, DW * 0.9]} />
      <meshBasicMaterial color="#0A0806" transparent opacity={0.45} depthWrite={false} />
    </mesh>
  );
};

/** Motion arc of the 5th domino (peak of fall). */
const MotionArc: React.FC = () => {
  const pts = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const cx = -1.08 + 4 * SPACING; // domino 5 x
    for (let t = 0; t <= 1; t += 0.04) {
      const a = -Math.PI / 2 + 0.4 * (1 - t) - 0.08 * t;
      const r = DH / 2;
      out.push(new THREE.Vector3(cx + Math.cos(a) * r, Math.sin(a + Math.PI / 2) * r + DH / 2, 0.04));
    }
    return out;
  }, []);
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, pts.length, 0.009, 4, false);
  }, [pts]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={P.trail} transparent opacity={0.6} toneMapped={false} />
    </mesh>
  );
};

/** Cloth banner with AUDIRA on the pegboard wall. */
const AudiraBanner: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 196;
    const g = c.getContext("2d")!;
    g.fillStyle = P.flag;
    g.fillRect(0, 0, 512, 196);
    // stitched border
    g.strokeStyle = P.flagText;
    g.lineWidth = 4;
    g.setLineDash([18, 10]);
    g.strokeRect(16, 16, 480, 164);
    g.setLineDash([]);
    g.fillStyle = P.flagText;
    g.font = "900 110px 'Arial Black', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 102);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0.6, 1.72, -1.56]}>
      <planeGeometry args={[1.1, 0.42]} />
      <meshPhysicalMaterial {...POLISH.fabric} map={tex} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Pegboard back wall. */
const BackWall: React.FC = () => {
  const grain = useSurfaceGrain(55, 0.08, 4);
  const peg = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    // hardboard base
    for (let i = 0; i < 256 * 256 * 4; i += 4) {
      const v = 136 + (Math.random() - 0.5) * 20;
      const d = new Uint8ClampedArray([v - 20, v - 30, v - 35, 255]);
      (g as unknown as { data?: Uint8ClampedArray }).data;
    }
    g.fillStyle = "#7A5C45";
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#1a120c";
    [[64, 64], [192, 64], [64, 192], [192, 192]].forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 7, 0, Math.PI * 2);
      g.fill();
    });
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 8);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.5, -1.6]} receiveShadow>
      <planeGeometry args={[7, 6]} />
      <meshStandardMaterial map={peg} roughnessMap={grain} roughness={0.85} />
    </mesh>
  );
};

/** Workbench surface. */
const Bench: React.FC = () => {
  const grain = useMemo(() => woodGrain(23, [3, 1]), []);
  return (
    <>
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[6, 0.12, 2.6]} radius={0.015} segments={2} />
        <meshPhysicalMaterial color={P.bench} map={grain} roughness={0.65} clearcoat={0.25} clearcoatRoughness={0.4} />
      </mesh>
      {/* bench front face trim */}
      <mesh position={[0, -0.1, 1.3]}>
        <RoundedBoxGeo args={[6, 0.1, 0.04]} radius={0.008} segments={1} />
        <meshPhysicalMaterial color={P.plyEdge} map={grain} roughness={0.5} />
      </mesh>
    </>
  );
};

/** Warm lamp above the scene. */
const Lamp: React.FC = () => (
  <group position={[0, 3.1, 0.3]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.08, 0.14, 0.22, 24, 1, true]} />
      <meshPhysicalMaterial color={P.bracket} metalness={0.7} roughness={0.35} side={THREE.DoubleSide} />
    </mesh>
    <pointLight
      position={[0, -0.18, 0]}
      intensity={18}
      color={P.lamp}
      distance={6.5}
      decay={2}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.001}
    />
  </group>
);

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[P.bg]} />
    <ambientLight intensity={0.08} color="#D4B890" />
    {/* cool rim from the back for depth */}
    <directionalLight position={[-2, 4, -3]} intensity={0.6} color={P.rim} />
    <Lamp />
    <BackWall />
    <Bench />
    <AudiraBanner />
    {Array.from({ length: 7 }, (_, i) => (
      <React.Fragment key={i}>
        <Domino i={i} />
        <FlatShadow i={i} />
      </React.Fragment>
    ))}
    <MotionArc />
    <Finish
      frame={0}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={0.9}
      envIntensity={0.2}
      ao
      focus={1.1}
      aperture={0.004}
      maxBlur={0.012}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* gradient */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(23,17,13,0.9) 0%, rgba(23,17,13,0.74) 18%, rgba(23,17,13,0) 36%, rgba(23,17,13,0) 76%, rgba(23,17,13,0.6) 100%)",
    }} />
    {/* kicker */}
    <div style={{
      position: "absolute", left: 60, right: 60, top: 196,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{
        fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3,
        color: P.ink, background: P.accent, padding: "7px 16px",
      }}>
        SEJARAH SEPAK BOLA
      </div>
      <div style={{
        fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2,
        color: P.ink, background: P.plywood, padding: "7px 14px",
      }}>
        #28
      </div>
    </div>

    {/* main headline */}
    <div style={{
      position: "absolute", left: 56, top: 262,
      lineHeight: 0.9,
    }}>
      <div style={{
        fontFamily: ANTON, fontSize: 136,
        color: "#FFFFFF",
        WebkitTextStroke: `4px ${P.ink}`,
        paintOrder: "stroke fill",
        textShadow: `6px 6px 0 ${P.ink}`,
        letterSpacing: -1,
      }}>LA</div>
      <div style={{
        fontFamily: ANTON, fontSize: 100,
        color: P.accent,
        WebkitTextStroke: `4px ${P.ink}`,
        paintOrder: "stroke fill",
        textShadow: `6px 6px 0 ${P.ink}`,
        letterSpacing: 1,
      }}>REMONTADA</div>
    </div>

    {/* score */}
    <div style={{
      position: "absolute", left: 56, top: 522,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        fontFamily: MONO, fontWeight: 800, fontSize: 32,
        color: "#7A5C45", textDecoration: "line-through",
        textDecorationColor: P.marble, textDecorationThickness: 4,
      }}>4–0</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: P.plywood }}>→</div>
      <div style={{
        fontFamily: MONO, fontWeight: 800, fontSize: 56,
        color: P.accent,
        textShadow: `3px 3px 0 ${P.ink}`,
      }}>6–1</div>
    </div>

    {/* domino counter legend */}
    <div style={{
      position: "absolute", right: 60, top: 530,
      fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 1,
      color: P.inkDim, textAlign: "right",
      lineHeight: 1.5,
    }}>
      <div>7 DOMINÓ</div>
      <div>7 GOL</div>
      <div style={{ color: P.plywood }}>MENIT 95'</div>
    </div>

    {/* bottom line */}
    <div style={{
      position: "absolute", left: 56, right: 56, bottom: 196,
    }}>
      <div style={{
        fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2,
        color: P.plywood, borderTop: `2px solid rgba(243,167,18,0.5)`, paddingTop: 12,
      }}>
        BARCELONA · CHAMPIONS LEAGUE · 2017
      </div>
      <div style={{
        fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1,
        color: P.inkDim, marginTop: 8,
      }}>
        Kalah 0–4, menang 6–1 · Agregat 6–5
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 25 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
