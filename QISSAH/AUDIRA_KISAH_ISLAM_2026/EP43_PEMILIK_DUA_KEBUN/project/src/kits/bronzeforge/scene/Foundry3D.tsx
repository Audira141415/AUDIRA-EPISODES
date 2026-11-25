// The whole set: a dark foundry floor, a backdrop that glows furnace-warm during the pour and cools
// to a museum teal for the monument, the granite plinth with the AUDIRA plaque, the mould and pour,
// and the statue. Lights live here too, because the heat light follows the story.

import React, { useMemo } from "react";
import * as THREE from "three";
import { BRONZE_PALETTE as P } from "../lib/palette.ts";
import { floor } from "../lib/textures.ts";
import {
  MONUMENT, SPRUE, STATUE_SCALE, TOP_Y, fillAt, heatAt, openAt, patinaAt, polishAt, polishFront, seg, smooth, streamCut,
} from "../core/motion.ts";
import { Plinth3D } from "./Plinth3D.tsx";
import { Pour3D } from "./Pour3D.tsx";
import { Statue3D } from "./Statue3D.tsx";

const Backdrop: React.FC<{ warm: number; cool: number }> = ({ warm, cool }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uWarm: { value: 0 }, uCool: { value: 0 } },
        depthWrite: false,
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: /* glsl */ `
          uniform float uWarm, uCool; varying vec2 vUv;
          void main(){
            vec2 q = vUv - vec2(0.5, 0.42);
            float r = length(q * vec2(1.0, 1.25));
            float glow = exp(-r * r * 9.0);
            vec3 base = mix(vec3(0.010, 0.007, 0.006), vec3(0.004, 0.009, 0.011), uCool);
            vec3 warm = vec3(0.07, 0.018, 0.004) * uWarm;
            vec3 cool = vec3(0.03, 0.06, 0.065) * uCool;
            gl_FragColor = vec4(base + (warm + cool) * glow, 1.0);
          }`,
      }),
    [],
  );
  mat.uniforms.uWarm.value = warm;
  mat.uniforms.uCool.value = cool;
  return (
    <mesh position={[0, 2.2, -4.5]} material={mat}>
      <planeGeometry args={[16, 10]} />
    </mesh>
  );
};

const Floor: React.FC = () => {
  const f = floor();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial map={f.map} roughness={0.92} color="#a89c90" />
    </mesh>
  );
};

export const Foundry3D: React.FC<{ t: number }> = ({ t }) => {
  const heat = heatAt(t);
  const pouring = 1 - streamCut(t);
  const fill = fillAt(t);
  const opened = openAt(t);
  const patina = patinaAt(t);
  const front = polishFront(t);
  const band = Math.sin(Math.PI * polishAt(t));
  const upTarget = useMemo(() => new THREE.Object3D(), []);
  const mon = smooth(seg(t, MONUMENT - 0.6, MONUMENT + 1.0));
  // Heat light: the pour, then the exposed casting; flickers like a real melt.
  const flick = 0.88 + 0.12 * Math.sin(t * 23) * Math.sin(t * 5.1);
  const pourLight = pouring * 2.2 * flick;
  const castLight = (opened > 0 ? heat * heat : 0) * 5.5 * flick;
  return (
    <group>
      <Backdrop warm={0.25 + 0.75 * Math.max(pouring, heat * (opened > 0 ? 1 : 0.6))} cool={mon * 0.9 + patina * 0.3} />
      <Floor />
      <hemisphereLight args={["#FFE4C4", "#140E0A", 0.22]} />
      {/* Key: warm, high front-left, shadows */}
      <directionalLight
        position={[-2.4, 4.2, 2.6]}
        intensity={1.8 + 1.4 * smooth(seg(t, 4.8, 6.0))}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3.2}
        shadow-camera-bottom={-0.5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Cool rim from behind right: carves the silhouette, reads as the patina's light */}
      <directionalLight position={[2.6, 2.8, -2.6]} intensity={1.4 + 1.2 * mon} color={P.rim} />
      {/* Monument uplight: low and warm from the front for the heroic angle */}
      <primitive object={upTarget} position={[0, TOP_Y + 0.5, 0]} />
      <spotLight position={[0.6, 0.25, 2.4]} angle={0.5} penumbra={0.8} intensity={mon * 14} color="#FFD3A0" target={upTarget} />
      <pointLight position={[SPRUE[0], SPRUE[1] + 0.12, SPRUE[2] + 0.1]} intensity={pourLight} color={P.heat} distance={0} decay={2} />
      <pointLight position={[0, TOP_Y + 0.5, 0.55]} intensity={castLight + fill * 0.4 * pouring} color={P.heat} distance={0} decay={2} />
      <Plinth3D patina={patina} />
      <Statue3D heat={heat} front={front} patina={patina} band={band} position={[0, TOP_Y, 0]} rotation={[0, -0.18, 0]} scale={STATUE_SCALE} />
      <Pour3D t={t} />
    </group>
  );
};
