// Shared frame for the stylised showcase films: a Remotion-synchronised canvas, a camera driven from a
// C1 keyframe track, a bloom finishing chain, and a 2D overlay laid out at 1080 × 1920.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { HalfFloatType, NeutralToneMapping, PCFShadowMap, PerspectiveCamera, Vector2, WebGLRenderTarget } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useFonts } from "../../kits/pixelstory/typography/fonts.ts";

export const useClock = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, t: frame / fps };
};

export const sm = (a: number, b: number, t: number) => {
  const c = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return c * c * (3 - 2 * c);
};
export const lin = (a: number, b: number, t: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** Deterministic 0..1 noise from an integer. */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
};

const Chain: React.FC<{ bloom: [number, number, number]; exposure: number; cam: number[]; near: number; far: number }> = ({ bloom, exposure, cam, near, far }) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const rt = new WebGLRenderTarget(size.width, size.height, { type: HalfFloatType, samples: 4 });
    const c = new EffectComposer(gl, rt);
    c.setPixelRatio(1);
    c.setSize(size.width, size.height);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), bloom[0], bloom[1], bloom[2]));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, size.width, size.height, bloom]);
  useLayoutEffect(() => {
    const p = camera as PerspectiveCamera;
    p.position.set(cam[0], cam[1], cam[2]);
    p.lookAt(cam[3], cam[4], cam[5]);
    p.fov = cam[6];
    p.near = near;
    p.far = far;
    p.updateProjectionMatrix();
    p.updateMatrixWorld();
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = exposure;
  }, [cam, camera, gl, exposure, near, far]);
  useFrame(() => composer.render(), 1);
  return null;
};

export const Cine: React.FC<{
  bg: string;
  /** [x, y, z, targetX, targetY, targetZ, fov] */
  cam: number[];
  bloom?: [number, number, number];
  exposure?: number;
  near?: number;
  far?: number;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}> = ({ bg, cam, bloom, exposure = 1, near = 0.1, far = 800, overlay, children }) => {
  useFonts();
  const { width, height } = useVideoConfig();
  const b = useMemo<[number, number, number]>(() => bloom ?? [0.35, 0.5, 0.8], [bloom?.[0], bloom?.[1], bloom?.[2]]);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: cam[6], near, far, position: [cam[0], cam[1], cam[2]] }}>
        <color attach="background" args={[bg]} />
        {children}
        <Chain bloom={b} exposure={exposure} cam={cam} near={near} far={far} />
      </ThreeCanvas>
      {overlay ? <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>{overlay}</div> : null}
    </AbsoluteFill>
  );
};
