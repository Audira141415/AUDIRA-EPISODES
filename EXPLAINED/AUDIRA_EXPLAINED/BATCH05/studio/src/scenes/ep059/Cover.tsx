// AE-059 cover (WORLDFORGE): storm port. Open sea breaks white on a tetrapod breakwater while the
// basin behind it lies flat; a container ship holds still alongside the quay on its mooring lines.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Basin, Breakwater, OpenSea, Rain, SkyDome, Spray, useStormEnvironment, BW_Z, type V3 } from "./world.tsx";
import { Bollards, Fenders, LampMast, MooringLines, QuayStacks, Quay, Ship, type Line } from "./port.tsx";

// 3/4 view from over the land, looking out to sea: quay + ship in the foreground running diagonally,
// a wide calm basin in the middle, the breakwater taking the storm across the background.
// Framing (fov 80 vertical, 9:16): ship centre at ~166 m, elevation ~29°, visible width there ≈ 157 m.
export const CAM = { pos: [-40, 85, 190] as V3, target: [20, -8, -110] as V3, fov: 80 };

// The port (quay, ship, lines, lamps) is modelled in its own frame (ship along −z, quay at x = −15)
// and placed into the harbour by this transform: yaw about the ship centre C0, then move it to S.
const PORT_YAW = (125 * Math.PI) / 180;
const C0: V3 = [2.5, 0, -136];
const PORT_AT: V3 = [0, 0, 50];
/** Port-frame point to world. */
export const w = ([x, y, z]: V3): V3 => {
  const v = new THREE.Vector3(x - C0[0], y, z - C0[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), PORT_YAW);
  return [v.x + PORT_AT[0], v.y, v.z + PORT_AT[2]];
};

// Mooring pattern (research [2]): head + stern lines ±45°, breast lines square to the quay,
// springs nearly parallel to the hull. Orange / cream synthetic lines.
const O = "#d8742a", C = "#d9d0b8";
export const LINES: Line[] = [
  { v: 61, z: -32, color: O }, // stern lines
  { v: 62.5, z: -35, color: C },
  { v: 72, z: -70, color: O }, // aft breast
  { v: 76, z: -74, color: C },
  { v: 92, z: -128, color: O }, // aft spring (leads forward)
  { v: 150, z: -140, color: C }, // forward springs (lead aft)
  { v: 176, z: -160, color: C },
  { v: 186, z: -169.6, color: O }, // three lines on the foreground bollard
  { v: 190, z: -170, color: C },
  { v: 194, z: -170.4, color: O },
  { v: 198, z: -185, color: O },
  { v: 206, z: -197, color: O }, // head lines to the quay-end bollard
  { v: 207.5, z: -197.4, color: C },
];
const BOLLARDS = [-32, -35, -70, -74, -100, -128, -140, -160, -170, -185, -197];
const FENDERS = [-50, -66, -82, -98, -114, -130, -148, -164, -178, -192];
const BURSTS = [
  { x: -190, h: 48, w: 52 },
  { x: -135, h: 74, w: 66 },
  { x: -80, h: 52, w: 54 },
  { x: -28, h: 88, w: 74 },
  { x: 25, h: 58, w: 56 },
  { x: 180, h: 70, w: 62 },
  { x: 240, h: 50, w: 50 },
  { x: 300, h: 64, w: 58 },
];

/** Quay floodlight; its target is added to the scene so the cone points where intended. */
const Flood: React.FC<{ pos: V3; target: V3; color: string; intensity: number; angle: number }> = ({ pos, target, color, intensity, angle }) => {
  const { scene } = useThree();
  const l = useMemo(() => {
    const x = new THREE.SpotLight(color, intensity, 220, angle, 0.7, 2);
    x.position.set(...pos);
    x.target.position.set(...target);
    return x;
  }, [pos, target, color, intensity, angle]);
  useLayoutEffect(() => {
    scene.add(l, l.target);
    l.target.updateMatrixWorld();
    return () => {
      scene.remove(l, l.target);
    };
  }, [scene, l]);
  return null;
};

const Lights: React.FC = () => {
  const { scene } = useThree();
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight("#d6dde3", 3.2);
    l.position.set(260, 300, 320);
    l.target.position.set(0, 0, 50);
    l.castShadow = true;
    const c = l.shadow.camera;
    c.left = -170;
    c.right = 170;
    c.top = 170;
    c.bottom = -170;
    c.near = 10;
    c.far = 900;
    l.shadow.mapSize.set(4096, 4096);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.04;
    return l;
  }, []);
  useLayoutEffect(() => {
    scene.add(light, light.target);
    return () => {
      scene.remove(light, light.target);
    };
  }, [scene, light]);
  return (
    <>
      <hemisphereLight args={["#6b7a86", "#151a1d", 0.75]} />
      {/* rim from the cloud break behind the breakwater */}
      <directionalLight color="#9fd8ff" intensity={2.4} position={[40, 60, -900]} />
      <Flood pos={w([-40, 30, -175])} target={w([-8, 7, -195])} color="#ffa04a" intensity={26000} angle={0.5} />
      <Flood pos={w([-40, 30, -95])} target={w([-8, 7, -115])} color="#ffa04a" intensity={26000} angle={0.5} />
      <Flood pos={w([-40, 24, -135])} target={w([-12, 4, -150])} color="#ffb060" intensity={14000} angle={0.6} />
    </>
  );
};

const Scene: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  useStormEnvironment(0.9);
  const shot: Shot = useMemo(() => ({ pos: CAM.pos, target: CAM.target, fov: CAM.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1.3 }), []);
  const camQuat = useMemo(() => {
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...CAM.pos), new THREE.Vector3(...CAM.target), new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, []);
  const heave = 0.15 * Math.sin(t * 0.9);
  return (
    <>
      <CameraRig shot={shot} near={0.5} far={9000} />
      <fogExp2 attach="fog" args={["#2a3439", 0.00085]} />
      <Lights />
      <SkyDome t={t} />
      <OpenSea t={t} />
      <Basin />
      <Breakwater />
      <Spray camQuat={camQuat} t={t} bursts={BURSTS} />
      <Spray camQuat={camQuat} t={t} bursts={BURSTS} mirror />
      <group position={PORT_AT} rotation={[0, PORT_YAW, 0]}>
        <group position={[-C0[0], 0, -C0[2]]}>
          <Quay />
          <Bollards zs={BOLLARDS} big={[-170]} />
          <Fenders zs={FENDERS} />
          <Ship heave={heave} />
          <MooringLines lines={LINES} heave={heave} />
          {[-58, -118, -178, -238].map((z) => (
            <LampMast key={z} pos={[-34, 3.5, z]} h={18} />
          ))}
          <QuayStacks />
        </group>
      </group>
      <Rain center={[-40, 40, 130]} t={t} />
      <Finish frame={frame} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1.3} envIntensity={0} aoRadius={0.6} focus={150} aperture={0.0002} maxBlur={0.004} />
    </>
  );
};

/** Screen position (px in 1080×1920) of a world point under the cover camera. */
const project = (p: V3) => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, 1080 / 1920, 0.5, 9000);
  cam.position.set(...CAM.pos);
  cam.lookAt(...CAM.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920 };
};

const Tag: React.FC<{ at: V3; label: string; dx: number; dy: number }> = ({ at, label, dx, dy }) => {
  const p = project(at);
  const lx = p.x + dx, ly = p.y + dy;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={p.x} y1={p.y} x2={lx} y2={ly} stroke="rgba(242,232,214,0.75)" strokeWidth={2} />
        <circle cx={p.x} cy={p.y} r={6} fill="none" stroke="rgba(242,232,214,0.9)" strokeWidth={2} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: dx < 0 ? undefined : lx + 10,
          right: dx < 0 ? 1080 - lx + 10 : undefined,
          top: ly - 24,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 27,
          letterSpacing: "0.22em",
          color: "#f2e8d6",
          textShadow: "0 2px 10px rgba(0,0,0,0.85)",
          background: "rgba(8,12,15,0.55)",
          padding: "6px 12px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = 40 + frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1b2226" }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: CAM.fov, near: 0.5, far: 9000, position: CAM.pos }}>
        <Scene frame={frame} t={t} />
      </ThreeCanvas>
      {/* top scrim so the title sits on the storm sky */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,9,11,0.55) 0%, rgba(6,9,11,0.15) 30%, rgba(6,9,11,0) 40%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 262, fontFamily: FONT, color: "#f4efe6" }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.42em", color: "#e8b46a" }}>AUDIRA EXPLAINED</div>
        <div style={{ marginTop: 26, fontSize: 96, lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
          Cara Pelabuhan
          <br />
          Menahan Kapal
        </div>
        <div style={{ marginTop: 22, fontSize: 40, fontWeight: 400, letterSpacing: "0.02em", color: "rgba(244,239,230,0.85)", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
          saat ombak besar menghantam
        </div>
      </div>
      <Tag at={[-60, 9, -BW_Z + 2]} label="BREAKWATER · TETRAPOD" dx={40} dy={-70} />
      <Tag at={[-110, 0, -170]} label="KOLAM TENANG" dx={40} dy={60} />
      <Tag at={w([-13.5, 6.4, -186])} label="TALI TAMBAT" dx={60} dy={110} />
    </AbsoluteFill>
  );
};
