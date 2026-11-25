// EP037 cover: "Rahasia Toilet Bus AKAP" in TOYDIORAMA.
// Static theatrical camera, wooden stage with footlights, dusk intercity road built from
// cardboard flats; hero = toy coach with its rear cut open. Deterministic: only useCurrentFrame().
import React, { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { FONT, fontReady } from "../../core/type/fonts.ts";
import { Bus } from "./Bus.tsx";
import { Cyl, P, PaperTag, RBox, V3, useCanvasTexture } from "./parts.tsx";

const lilita = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const TITLE_FONT = `'${lilita.fontFamily}', ${FONT}, sans-serif`;

// ---- camera (static, kit FOV 32) ----
const CAM = { pos: [1.4, 4.4, 14.6] as V3, target: [-0.25, 1.15, 0] as V3, fov: 32 };
const BUS_ROT = 0.92; // rear 3/4 view: rear + cut side face the audience

const CamSet: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...CAM.pos);
    camera.lookAt(...CAM.target);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Sky: React.FC = () => {
  const tex = useCanvasTexture(512, 1024, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, "#0B1328");
    g.addColorStop(0.3, "#1E2450");
    g.addColorStop(0.5, "#5B3A6B");
    g.addColorStop(0.62, "#C9643F");
    g.addColorStop(0.72, "#F2A35A");
    g.addColorStop(1, "#F7C27A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 1024);
    let s = 21;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 140; i++) {
      const y = rnd() * 520;
      ctx.fillStyle = `rgba(255,240,210,${0.25 + rnd() * 0.6})`;
      const r = 0.8 + rnd() * 1.8;
      ctx.beginPath();
      ctx.arc(rnd() * 512, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return (
    <mesh position={[0, 3.6, -5.2]}>
      <planeGeometry args={[16, 13]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

/** Cardboard hill flat with a wavy top, standing on dowels. */
const HillFlat: React.FC<{ z: number; y: number; color: string; seed: number; amp: number; h: number }> = ({ z, y, color, seed, amp, h }) => {
  const geo = React.useMemo(() => {
    const sh = new THREE.Shape();
    const w = 14;
    sh.moveTo(-w / 2, 0);
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const x = -w / 2 + (w * i) / n;
      const yy = h + Math.sin(i * 0.55 + seed) * amp + Math.sin(i * 1.3 + seed * 2) * amp * 0.35;
      sh.lineTo(x, yy);
    }
    sh.lineTo(w / 2, 0);
    sh.lineTo(-w / 2, 0);
    return new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
  }, [seed, amp, h]);
  return (
    <group position={[0, y, z]}>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial color={color} roughness={0.88} metalness={0.02} />
      </mesh>
    </group>
  );
};

const Tree: React.FC<{ pos: V3; s: number; c: string }> = ({ pos, s, c }) => (
  <group position={pos} scale={s}>
    <Cyl r={0.04} h={0.3} color="#5A3B26" position={[0, 0.15, 0]} rough={0.85} seg={10} />
    <mesh position={[0, 0.55, 0]} castShadow>
      <coneGeometry args={[0.26, 0.6, 7]} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
    <mesh position={[0, 0.8, 0]} castShadow>
      <coneGeometry args={[0.19, 0.42, 7]} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
  </group>
);

const StreetLamp: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Cyl r={0.035} h={1.9} color="#3B4148" position={[0, 0.95, 0]} rough={0.7} seg={12} />
    <RBox size={[0.42, 0.05, 0.06]} r={0.02} color="#3B4148" position={[0.18, 1.88, 0]} />
    <RBox size={[0.16, 0.06, 0.12]} r={0.025} color="#FFE3A6" position={[0.36, 1.84, 0]} emissive="#FFC46B" emissiveIntensity={2.4} />
    <pointLight position={[0.36, 1.7, 0]} color="#FFC46B" intensity={2.2} distance={3.2} decay={2} />
  </group>
);

const Road: React.FC = () => (
  <group rotation={[0, BUS_ROT, 0]}>
    <RBox size={[11, 0.04, 2.0]} r={0.015} color={P.asphalt} position={[0, 0.02, 0]} rough={0.9} cast={false} />
    <RBox size={[11, 0.045, 0.06]} r={0.01} color="#E9E1CF" position={[0, 0.022, 0.92]} rough={0.8} cast={false} />
    <RBox size={[11, 0.045, 0.06]} r={0.01} color="#E9E1CF" position={[0, 0.022, -0.92]} rough={0.8} cast={false} />
    {Array.from({ length: 12 }, (_, i) => (
      <RBox key={i} size={[0.42, 0.046, 0.05]} r={0.01} color="#F2D27A" position={[-5.2 + i * 0.95, 0.022, -0.02]} rough={0.8} cast={false} />
    ))}
    {/* verges */}
    <RBox size={[11, 0.06, 0.9]} r={0.02} color={P.grass} position={[0, 0.03, 1.48]} rough={0.9} cast={false} />
    <RBox size={[11, 0.06, 0.9]} r={0.02} color={P.grassDark} position={[0, 0.03, -1.48]} rough={0.9} cast={false} />
  </group>
);

const Stage: React.FC = () => {
  const planks = Array.from({ length: 15 }, (_, i) => i - 7);
  return (
    <group>
      {planks.map((i) => (
        <RBox key={i} size={[0.6, 0.16, 6.4]} r={0.02} color={i % 2 ? P.floor : P.floorLight} position={[i * 0.62, -0.08, -1.0]} rough={0.68} cast={false} />
      ))}
      <RBox size={[9.4, 0.7, 0.12]} r={0.03} color={P.trim} position={[0, -0.42, 2.25]} cast={false} />
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
        <group key={k} position={[k * 0.85, 0.04, 2.05]}>
          <Cyl r={0.08} r2={0.1} h={0.07} color={P.trim} rough={0.6} seg={14} />
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={P.footlight} emissive={P.footlight} emissiveIntensity={1.8} roughness={0.3} />
          </mesh>
          <pointLight color={P.footlight} intensity={0.6} distance={1.6} decay={2} position={[0, 0.12, -0.15]} />
        </group>
      ))}
    </group>
  );
};

const Curtains: React.FC = () => (
  <group>
    {[-1, 1].map((side) => (
      <group key={side} position={[side * 2.75, 0, 1.6]}>
        {Array.from({ length: 5 }, (_, i) => (
          <Cyl key={i} r={0.17} h={7.5} color={i % 2 ? P.velvet : P.velvetDark} position={[side * i * 0.22, 3.6, -i * 0.05]} rough={0.93} seg={16} />
        ))}
      </group>
    ))}
    <RBox size={[9, 0.9, 0.3]} r={0.12} color={P.velvet} position={[0, 6.9, 1.4]} rough={0.93} />
  </group>
);

const Moon: React.FC = () => (
  <group position={[1.55, 4.55, -4.6]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.36, 0.36, 0.06, 40]} />
      <meshBasicMaterial color="#FBEFD2" fog={false} toneMapped={false} />
    </mesh>
    <mesh position={[0.1, 0.06, 0.035]}>
      <circleGeometry args={[0.07, 20]} />
      <meshBasicMaterial color="#E9D7B0" fog={false} toneMapped={false} />
    </mesh>
    <Cyl r={0.02} h={1.6} color={P.dowel} position={[0, -1.1, -0.06]} rough={0.7} seg={8} />
  </group>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  // tags face the camera (yaw from tag to camera), gentle deterministic sway
  const sway = Math.sin((f / 60) * 1.5) * 0.02;
  const r = BUS_ROT;
  // bus-local -> world for tag targets
  const toWorld = (p: V3): V3 => {
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };
  const yawTo = (p: V3) => Math.atan2(CAM.pos[0] - p[0], CAM.pos[2] - p[2]);
  const tankW = toWorld([-2.02, 1.62, 0.3]);
  const hoseW = toWorld([-1.8, 0.2, 0.42]);
  const tagA: V3 = [-1.25, 2.85, 1.5];
  const tagB: V3 = [1.05, 0.62, 2.7];
  return (
    <>
      <CamSet />
      <color attach="background" args={["#0E141D"]} />
      <fog attach="fog" args={["#2A2348", 20, 34]} />
      <ambientLight intensity={0.5} color="#E8D9F0" />
      <hemisphereLight args={["#6A6FB0", "#3A291E", 0.55]} />
      <spotLight
        position={[4.5, 7.5, 6.0]}
        intensity={360}
        angle={0.42}
        penumbra={0.75}
        decay={2}
        color="#FFE6C4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-5, 4.5, -4]} intensity={1.3} color="#8EB8E5" />
      <directionalLight position={[3, 2, 6]} intensity={0.35} color="#FFD1A0" />

      <Sky />
      <Moon />
      <HillFlat z={-4.4} y={0} color="#3B2F5C" seed={1.3} amp={0.3} h={1.5} />
      <HillFlat z={-3.6} y={0} color="#2D3F5E" seed={4.1} amp={0.25} h={1.0} />
      <HillFlat z={-2.8} y={0} color="#2B4E4C" seed={2.2} amp={0.18} h={0.55} />
      <Tree pos={[-3.0, 0, -2.2]} s={1.3} c="#3C6B50" />
      <Tree pos={[-2.4, 0, -2.5]} s={1.0} c="#2F5A44" />
      <Tree pos={[2.6, 0, -2.0]} s={1.25} c="#3C6B50" />
      <Tree pos={[3.0, 0, 0.4]} s={0.9} c="#2F5A44" />
      <Tree pos={[-3.0, 0, 1.4]} s={0.8} c="#3C6B50" />

      <Stage />
      <Road />
      <StreetLamp pos={toWorld([0.6, 0, -1.25])} rotY={r + Math.PI / 2} />
      <StreetLamp pos={toWorld([-3.6, 0, -1.25])} rotY={r + Math.PI / 2} />

      <group rotation={[0, r, 0]}>
        <Bus f={f} />
      </group>

      <PaperTag text="AIR BILAS" sub="TANDON KECIL" font={FONT} position={tagA} rotY={yawTo(tagA)} tilt={0.06 + sway} target={tankW} w={1.25} />
      <PaperTag text="KE JALAN" sub="BUANGAN LANGSUNG" font={FONT} position={tagB} rotY={yawTo(tagB)} tilt={-0.05 - sway} target={hoseW} w={1.25} />
      <Curtains />
    </>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  void height;
  const f = (frame / fps) * 60;
  const [handle] = useState(() => delayRender("ep037 fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([fontReady(), lilita.waitUntilDone()]).then(
      () => {
        setReady(true);
        continueRender(handle);
      },
      () => {
        setReady(true);
        continueRender(handle);
      },
    );
  }, [handle]);
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#0E141D" }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows
            dpr={1}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            camera={{ position: CAM.pos, fov: CAM.fov, near: 0.1, far: 60 }}
          >
            <Scene f={f} />
          </ThreeCanvas>
          <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0" }}>
            <Overlay />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => (
  <>
    {/* soft top + bottom vignette for type legibility */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 640, background: "linear-gradient(180deg, rgba(8,11,24,0.42) 0%, rgba(8,11,24,0.2) 55%, rgba(8,11,24,0) 100%)" }} />
    <div style={{ position: "absolute", left: 0, bottom: 0, width: 1080, height: 620, background: "linear-gradient(0deg, rgba(8,8,14,0.9) 0%, rgba(8,8,14,0.55) 50%, rgba(8,8,14,0) 100%)" }} />
    <div style={{ position: "absolute", left: 84, top: 196, right: 84 }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: P.busHoney, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: P.busCoral, display: "inline-block" }} />
        AUDIRA EXPLAINED
      </div>
      <div style={{ fontFamily: TITLE_FONT, fontSize: 132, lineHeight: 0.98, color: "#FFF6E6", marginTop: 18, textShadow: "0 6px 0 rgba(0,0,0,0.35), 0 12px 30px rgba(0,0,0,0.5)" }}>
        Rahasia Toilet
        <br />
        <span style={{ color: P.busHoney }}>Bus AKAP</span>
      </div>
    </div>
    {/* taped kraft question chip, above the bottom safe zone (ends at y <= 1540) */}
    <div style={{ position: "absolute", left: 84, top: 1408, transform: "rotate(-1.6deg)" }}>
      <div style={{ position: "relative", background: P.paper, color: P.ink, padding: "22px 34px", borderRadius: 6, boxShadow: "0 14px 30px rgba(0,0,0,0.45)", fontFamily: FONT, fontWeight: 600, fontSize: 44 }}>
        Kenapa ada <span style={{ color: P.busCoral }}>aturan pakainya?</span>
        <div style={{ position: "absolute", left: 30, top: -16, width: 150, height: 34, background: "rgba(230,200,117,0.85)", transform: "rotate(-4deg)" }} />
      </div>
    </div>
  </>
);
