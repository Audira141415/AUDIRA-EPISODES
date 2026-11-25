// AE-073 cover — SATISFYFORGE look development. 3/4 camera at ~32° elevation (motion memory:
// top-down reads flat), depth of field focused on the print head, blurred props in the foreground.
// Text on screen uses only research-backed facts (layer 1–4 cm; extrusion, not spraying).

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { Bucket, C, Cone, HEAD, LAYERS, LAYER_H, SLAB_TOP, WallSample, World, cornerPoint } from "./World.tsx";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";

export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };

const ELEV = (32 * Math.PI) / 180;
const AZ = (40 * Math.PI) / 180;
export const coverCam = (f: number): Cam => {
  const d = 38;
  const sway = Math.sin((f / 60) * 0.5) * 0.04;
  const tgt: [number, number, number] = [-1.2, 1.6, -1.6];
  return {
    pos: [tgt[0] + d * Math.cos(ELEV) * Math.sin(AZ + sway), tgt[1] + d * Math.sin(ELEV), tgt[2] + d * Math.cos(ELEV) * Math.cos(AZ + sway)],
    target: tgt,
    fov: 40,
  };
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(...cam.pos);
    p.fov = cam.fov;
    p.near = 0.1;
    p.far = 200;
    p.lookAt(...cam.target);
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
  });
  return null;
};

export const project = (cam: Cam, p: THREE.Vector3) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = p.clone().project(c);
  return { x: ((v.x + 1) / 2) * 1080, y: ((1 - v.y) / 2) * 1920 };
};

/** Point on the floor (y = 0) seen at pixel (px, py) of the 1080x1920 frame. */
export const groundAt = (cam: Cam, px: number, py: number): [number, number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3((px / 1080) * 2 - 1, 1 - (py / 1920) * 2, 0.5).unproject(c);
  const dir = v.sub(c.position).normalize();
  const t = -c.position.y / dir.y;
  const p = c.position.clone().addScaledVector(dir, t);
  return [p.x, 0, p.z];
};

/** Foreground layer: large blurred props in the lower frame (depth cue). */
const Foreground: React.FC<{ cam: Cam }> = ({ cam }) => {
  const grain = useSurfaceGrain(91, 0.35, 6);
  const yaw = Math.atan2(cam.pos[0] - cam.target[0], cam.pos[2] - cam.target[2]);
  return (
    <group>
      <group position={groundAt(cam, 230, 1640)} rotation={[0, yaw + 0.35, 0]} scale={3.4}>
        <WallSample grain={grain} layers={7} />
      </group>
      <group position={groundAt(cam, 870, 1640)} scale={2.4}>
        <Bucket grain={grain} />
      </group>
      <Cone p={groundAt(cam, 600, 1790)} s={2.2} />
    </group>
  );
};

const useFontsOk = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep073 fonts"));
  useEffect(() => {
    manropeReady().then(
      () => setOk(true),
      () => setOk(true),
    );
  }, []);
  useEffect(() => {
    if (ok) continueRender(handle);
  }, [ok, handle]);
  return ok;
};

const Pill: React.FC<{ at: { x: number; y: number }; text: string; dx: number; dy: number; color: string }> = ({ at, text, dx, dy, color }) => (
  <>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <line x1={at.x} y1={at.y} x2={at.x + dx} y2={at.y + dy} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
      <line x1={at.x} y1={at.y} x2={at.x + dx} y2={at.y + dy} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <circle cx={at.x} cy={at.y} r={10} fill="#FFFFFF" stroke={color} strokeWidth={5} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: at.x + dx,
        top: at.y + dy,
        transform: "translate(-50%, -50%)",
        background: "rgba(255,255,255,0.92)",
        border: `3px solid ${color}`,
        borderRadius: 999,
        padding: "10px 26px 12px",
        fontFamily: `'${MANROPE}', sans-serif`,
        fontWeight: 600,
        fontSize: 30,
        color: C.ink,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 26px rgba(120,90,160,0.22)",
      }}
    >
      {text}
    </div>
  </>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const ok = useFontsOk();
  const cam = useMemo(() => coverCam(f), [f]);
  const focus = new THREE.Vector3(...cam.pos).distanceTo(HEAD.pos);
  const nozzle = project(cam, HEAD.pos.clone().add(new THREE.Vector3(0, 0.05, 0)));
  const layers = project(cam, cornerPoint(Math.PI * 0.62, SLAB_TOP + LAYERS * LAYER_H));
  const s = width / 1080;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: C.wall }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.VSMShadowMap }} camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 200 }}>
        <CameraRig cam={cam} />
        <hemisphereLight args={["#E9F0FF", "#F6D7CF", 0.6]} />
        <directionalLight
          position={[6, 16, 9]}
          intensity={1.7}
          color="#FFF5EE"
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-camera-far={60}
          shadow-radius={12}
          shadow-blurSamples={16}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-8, 5, 7]} intensity={0.5} color="#FFE7F0" />
        <directionalLight position={[2, 6, -12]} intensity={0.45} color="#E4ECFF" />
        {ok && <World f={f} />}
        {ok && <Foreground cam={cam} />}
        {/* low raking light from the side: each printed bead gets a lit top and a shaded underside */}
        <directionalLight position={[-16, 3.2, 10]} intensity={0.9} color="#FFF1E4" />
        <Finish
          frame={frame}
          background={C.wall}
          profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
          exposure={0.84}
          envIntensity={0.3}
          hdri="studio"
          focus={focus}
          aperture={0.0055}
          maxBlur={0.011}
        />
      </ThreeCanvas>

      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0", pointerEvents: "none", color: C.ink, fontFamily: `'${MANROPE}', sans-serif` }}>
        <div style={{ position: "absolute", top: 262, left: 44, right: 44, padding: "26px 28px 30px", borderRadius: 40, background: "rgba(255,247,242,0.80)", boxShadow: "0 14px 40px rgba(120,90,160,0.20)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.85)", padding: "9px 20px", borderRadius: 999, fontSize: 24, letterSpacing: 6, fontWeight: 600, color: "#E2628F" }}>AUDIRA EXPLAINED</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[C.pink, C.butter, C.mint].map((c, i) => (
                <div key={c} style={{ width: (i === 2 ? 56 : 18) * 1, height: 12, borderRadius: 6, background: c }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 108, fontWeight: 600, lineHeight: 0.98, letterSpacing: -4, marginTop: 22, textShadow: "0 4px 18px rgba(255,255,255,0.55)" }}>
            Rumah Dicetak
            <br />
            <span style={{ background: `linear-gradient(transparent 60%, ${C.pink}99 60%)`, padding: "0 8px" }}>Lapis demi Lapis</span>
          </div>
        </div>
        {ok && <Pill at={nozzle} text="mortar diperas, bukan disemprot" dx={150} dy={-420} color={C.orange} />}
        {ok && <Pill at={layers} text="2 kulit + zigzag + rongga" dx={-110} dy={250} color={C.lilac} />}
      </div>
    </div>
  );
};
