// An old wooden valve radio with a cream dial plate that reads AUDIRA (brand in scene), and a cup of
// tea whose steam is a soft noise sheet driven by film time.

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { SceneText } from "../../../core/polish/Drei.tsx";
import { FILM16_PALETTE as P } from "../lib/palette.ts";

/** Frequency ticks and numbers for the dial plate. */
function dialTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = P.dial;
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = P.dialInk;
  g.fillStyle = P.dialInk;
  g.font = "600 30px Georgia, serif";
  g.textAlign = "center";
  for (let i = 0; i <= 60; i++) {
    const x = 70 + i * 14.5;
    const big = i % 10 === 0;
    g.lineWidth = big ? 4 : 2;
    g.beginPath();
    g.moveTo(x, 150);
    g.lineTo(x, big ? 100 : 125);
    g.stroke();
    if (big) g.fillText(String(54 + i * 2.5).slice(0, 3), x, 88);
  }
  g.font = "italic 26px Georgia, serif";
  g.fillText("MW  ·  kHz × 10", 512, 200);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export const Radio3D: React.FC<{ t: number; tune: number; glow: number; position: [number, number, number] }> = ({ t, tune, glow, position }) => {
  const dial = useMemo(dialTexture, []);
  const grain = useSurfaceGrain(23, 0.25, 2);
  // the needle travels the scale as the set is tuned (tune 0..1)
  const needleX = -0.19 + tune * 0.38;
  return (
    <group position={position} rotation={[0, 0.32, 0]}>
      {/* walnut cabinet */}
      <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
        <RoundedBoxGeo args={[0.56, 0.34, 0.22]} radius={0.035} />
        <meshPhysicalMaterial color={P.radio} roughness={0.42} roughnessMap={grain} clearcoat={0.55} clearcoatRoughness={0.3} />
      </mesh>
      {/* speaker cloth */}
      <mesh position={[-0.1, 0.19, 0.111]}>
        <planeGeometry args={[0.28, 0.2]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={P.grille} />
      </mesh>
      {/* brass bars over the cloth */}
      {[-0.06, 0, 0.06].map((y) => (
        <mesh key={y} position={[-0.1, 0.19 + y, 0.115]}>
          <boxGeometry args={[0.29, 0.008, 0.006]} />
          <meshStandardMaterial color="#C9A45C" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* dial plate, lit from behind by the valves warming up */}
      <mesh position={[0.15, 0.22, 0.112]}>
        <planeGeometry args={[0.2, 0.12]} />
        <meshStandardMaterial map={dial} emissive={P.sun} emissiveMap={dial} emissiveIntensity={0.12 + glow * 0.9} roughness={0.5} />
      </mesh>
      <SceneText font="serif" position={[0.15, 0.17, 0.114]} fontSize={0.028} letterSpacing={0.2} color={P.dialInk} anchorX="center" anchorY="middle">
        AUDIRA
      </SceneText>
      <mesh position={[0.15 + needleX * 0.45, 0.225, 0.116]}>
        <boxGeometry args={[0.003, 0.09, 0.002]} />
        <meshBasicMaterial color={P.needle} />
      </mesh>
      {/* knobs */}
      {[0.08, 0.22].map((x, i) => (
        <mesh key={x} position={[x, 0.08, 0.12]} rotation={[Math.PI / 2, i ? tune * 4 : 0, 0]} castShadow>
          <cylinderGeometry args={[0.026, 0.028, 0.03, 32]} />
          <meshPhysicalMaterial color="#2A1A10" roughness={0.35} clearcoat={0.8} />
        </mesh>
      ))}
      {/* feet */}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.005, 0]}>
          <boxGeometry args={[0.06, 0.012, 0.16]} />
          <meshStandardMaterial color="#2A1A10" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const steamVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const steamFrag = /* glsl */ `
uniform float uTime; uniform float uSeed; uniform float uOpacity;
varying vec2 vUv;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
void main() {
  vec2 p = vUv;
  float rise = uTime * 0.35;
  // the plume wanders sideways more the higher it rises
  float sway = (n(vec2(p.y * 2.0 - rise, uSeed)) - 0.5) * 0.5 * p.y;
  float x = (p.x - 0.5 - sway) / (0.12 + p.y * 0.3);
  float body = exp(-x * x * 2.5);
  float wisps = n(vec2(p.x * 5.0, p.y * 4.0 - rise * 2.0)) * 0.6 + n(vec2(p.x * 11.0, p.y * 9.0 - rise * 3.0)) * 0.4;
  float a = body * smoothstep(0.0, 0.12, p.y) * (1.0 - smoothstep(0.55, 1.0, p.y)) * smoothstep(0.35, 0.8, wisps);
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), a * uOpacity);
}`;

const Steam: React.FC<{ t: number; seed: number; offset: [number, number, number]; opacity: number }> = ({ t, seed, offset, opacity }) => {
  const ref = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSeed: { value: seed }, uOpacity: { value: opacity } }), [seed, opacity]);
  uniforms.uTime.value = t;
  // billboard around the vertical axis so the plume always faces the lens
  useFrame(({ camera }) => {
    const m = ref.current;
    if (!m) return;
    const wp = new THREE.Vector3();
    m.getWorldPosition(wp);
    m.rotation.y = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z);
  });
  return (
    <mesh ref={ref} position={offset}>
      <planeGeometry args={[0.26, 0.5]} />
      <shaderMaterial vertexShader={steamVert} fragmentShader={steamFrag} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
};

/** Cup of tea on a saucer, steam rising. */
export const Teacup3D: React.FC<{ t: number; position: [number, number, number] }> = ({ t, position }) => {
  const cup = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.03, 0.0], [0.033, 0.004], [0.036, 0.012], [0.05, 0.03], [0.058, 0.06], [0.06, 0.075],
      [0.056, 0.075], [0.054, 0.062], [0.047, 0.032], [0.03, 0.012], [0.0, 0.01],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const saucer = useMemo(() => {
    const pts = [[0, 0], [0.05, 0], [0.085, 0.01], [0.095, 0.016], [0.09, 0.017], [0.05, 0.006], [0, 0.006]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <group position={position} scale={1.6}>
      <mesh geometry={saucer} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.cup} roughness={0.18} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cup} position={[0, 0.006, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.cup} roughness={0.15} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 48]} />
        <meshPhysicalMaterial color={P.tea} roughness={0.05} clearcoat={1} />
      </mesh>
      {/* handle */}
      <mesh position={[0.066, 0.045, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.005, 12, 32, Math.PI * 1.2]} />
        <meshPhysicalMaterial color={P.cup} roughness={0.15} clearcoat={1} />
      </mesh>
      <Steam t={t} seed={1.7} offset={[0, 0.3, 0]} opacity={0.75} />
      <Steam t={t + 3.1} seed={4.2} offset={[0.012, 0.32, 0.01]} opacity={0.5} />
    </group>
  );
};
