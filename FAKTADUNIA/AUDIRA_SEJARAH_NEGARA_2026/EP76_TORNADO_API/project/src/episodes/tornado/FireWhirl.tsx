// EP76 fire whirl: a twisted open cylinder (radius profile + sway + twist in the vertex shader) with an
// emissive flame shader (spiral streaks + upward fbm noise), wrapped in a darker smoke sheath.
// Driven only by props (film seconds), so every frame is deterministic. No Points / LineSegments.
import React, { useMemo } from "react";
import * as THREE from "three";
import { fx } from "./Set";

const VERT = /* glsl */ `
uniform float uTime, uH, uR0, uR1, uTwist, uSway, uSpin, uNeck;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
void main() {
  vUv = uv;
  float h = uv.y;
  // waist profile: wide base skirt, narrow neck, flared top
  float r = mix(uR0, uR1, smoothstep(0.0, 1.0, h));
  r *= 1.0 - uNeck * sin(3.14159 * clamp(h * 1.3, 0.0, 1.0)) * 0.45;
  r *= 1.0 + 0.08 * sin(h * 23.0 - uTime * 7.0);
  float a = atan(position.z, position.x) + h * uTwist + uTime * uSpin;
  vec3 p = vec3(cos(a) * r, h * uH, sin(a) * r);
  p.x += sin(h * 3.1 + uTime * 0.9) * uSway * h;
  p.z += cos(h * 2.3 + uTime * 0.7) * uSway * h * 0.7;
  vN = normalize(normalMatrix * vec3(cos(a), 0.0, sin(a)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform float uTime, uSpin, uTwist, uGain, uSmoke, uFade;
uniform vec3 uCore, uMid, uEdge;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
void main() {
  float h = vUv.y;
  float u = vUv.x;
  // spiral coordinates (tiled around the column so the seam matches)
  float sp = u * 4.0 + h * uTwist * 0.22 - uTime * uSpin * 0.25;
  float streak = 0.5 + 0.5 * sin(sp * 6.2831 + 2.0 * fbm(vec2(sp, h * 3.0)));
  float n = fbm(vec2(sp * 1.0, h * 6.0 - uTime * 2.2));
  float n2 = fbm(vec2(sp * 2.0 + 3.0, h * 12.0 - uTime * 3.4));
  float body = n * 0.65 + n2 * 0.35;
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 1.4);
  float ends = smoothstep(0.0, 0.04, h) * (1.0 - smoothstep(0.78 - 0.25 * uSmoke, 1.0, h));
  if (uSmoke > 0.5) {
    // smoke sheath: soft grey, thicker at the top
    float a = smoothstep(0.35, 0.75, body) * (0.25 + 0.75 * h) * ends * (0.35 + 0.65 * rim) * uFade;
    vec3 c = mix(uEdge, uMid, body) * (0.55 + 0.6 * (1.0 - h));
    gl_FragColor = vec4(c, a * 0.75);
    return;
  }
  float heat = clamp(body * 1.35 + streak * 0.12 - h * 0.55, 0.0, 1.0);
  vec3 c = mix(uEdge, uMid, smoothstep(0.25, 0.6, heat));
  c = mix(c, uCore, smoothstep(0.65, 0.95, heat));
  float tongues = fbm(vec2(u * 9.0 + h * uTwist * 0.2, h * 4.0 - uTime * 3.0));
  float a = smoothstep(0.38, 0.72, heat * 0.8 + tongues * 0.45) * ends * (0.4 + 0.6 * rim) * uFade;
  gl_FragColor = vec4(c * uGain * (0.6 + 0.8 * heat), a);
}`;

export type WhirlProps = {
  t: number; // film seconds (drives the animation)
  height: number;
  r0: number; // base radius
  r1: number; // top radius
  twist?: number; // radians of twist along the height
  spin?: number; // rad/s
  sway?: number;
  neck?: number; // 0..1 waist pinch
  grow?: number; // 0..1 height reveal
  fade?: number; // 0..1 opacity
  gain?: number;
  smoke?: boolean; // add the smoke sheath
  light?: number; // point light intensity at the base
  position?: [number, number, number];
  core?: string;
  mid?: string;
  edge?: string;
};

const makeMat = (smoke: boolean) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: smoke ? THREE.NormalBlending : THREE.AdditiveBlending,
    toneMapped: false,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uH: { value: 1 },
      uR0: { value: 1 },
      uR1: { value: 1 },
      uTwist: { value: 6 },
      uSway: { value: 0.3 },
      uSpin: { value: 3 },
      uNeck: { value: 0.5 },
      uGain: { value: 1.6 },
      uSmoke: { value: smoke ? 1 : 0 },
      uFade: { value: 1 },
      uCore: { value: new THREE.Color("#FFF1B0") },
      uMid: { value: new THREE.Color("#FF9A2E") },
      uEdge: { value: new THREE.Color("#E2401E") },
    },
  });

export const FireWhirl: React.FC<WhirlProps> = ({
  t,
  height,
  r0,
  r1,
  twist = 7,
  spin = 3.2,
  sway = 0.4,
  neck = 0.55,
  grow = 1,
  fade = 1,
  gain = 1.7,
  smoke = true,
  light = 30,
  position = [0, 0, 0],
  core = "#FFF1B0",
  mid = "#FF9A2E",
  edge = "#E2401E",
}) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 48, 64, true), []);
  const fire = useMemo(() => [makeMat(false), makeMat(false)], []);
  const smk = useMemo(() => makeMat(true), []);
  if (grow <= 0.01 || fade <= 0.01) return null;
  const H = height * grow;
  const set = (m: THREE.ShaderMaterial, k: number, rk: number, spinK: number) => {
    const u = m.uniforms;
    u.uTime.value = t + k * 1.7;
    u.uH.value = H * (k === 2 ? 1.18 : 1 - 0.06 * k);
    u.uR0.value = r0 * rk;
    u.uR1.value = r1 * rk;
    u.uTwist.value = twist;
    u.uSway.value = sway;
    u.uSpin.value = spin * spinK;
    u.uNeck.value = neck;
    u.uGain.value = gain * (k === 1 ? 1.25 : 1);
    u.uFade.value = fade;
    u.uCore.value.set(core);
    u.uMid.value.set(mid);
    u.uEdge.value.set(k === 2 ? "#3A3330" : edge);
    if (k === 2) u.uMid.value.set("#8A817A");
  };
  set(fire[0], 0, 1, 1);
  set(fire[1], 1, 0.55, 1.35);
  set(smk, 2, 1.3, 0.6);
  return (
    <group position={position}>
      {/* geometry is a unit cylinder; the vertex shader rebuilds it from uv, so keep it un-scaled */}
      <mesh ref={fx} geometry={geo} material={fire[0]} renderOrder={4} frustumCulled={false} />
      <mesh ref={fx} geometry={geo} material={fire[1]} renderOrder={5} frustumCulled={false} />
      {smoke && <mesh ref={fx} geometry={geo} material={smk} renderOrder={3} frustumCulled={false} />}
      {/* glowing ground skirt */}
      <mesh ref={fx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={2}>
        <circleGeometry args={[r0 * 2.2, 48]} />
        <meshBasicMaterial color={mid} transparent opacity={0.35 * fade} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {light > 0 && <pointLight position={[0, Math.min(H * 0.25, 4), 0]} color="#FF8A3A" intensity={light * fade * grow} distance={r0 * 18 + 10} decay={1.6} />}
    </group>
  );
};

/** A small, mostly upright flame tongue (fire line on a hill, burning roofs). */
export const Flame: React.FC<{ t: number; size: number; position: [number, number, number]; seed?: number; fade?: number }> = ({ t, size, position, seed = 0, fade = 1 }) => (
  <FireWhirl
    t={t + seed * 3.1}
    height={size * (1.6 + 0.4 * Math.sin(t * 2.3 + seed * 5))}
    r0={size * 0.45}
    r1={size * 0.12}
    twist={1.2}
    spin={0.8}
    sway={size * 0.15}
    neck={0}
    gain={1.5}
    smoke={false}
    light={0}
    fade={fade}
    position={position}
  />
);
