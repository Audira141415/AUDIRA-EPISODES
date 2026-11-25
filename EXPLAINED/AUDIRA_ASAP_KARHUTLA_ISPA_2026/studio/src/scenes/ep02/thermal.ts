// Thermal-camera material for EP02 props: colour = ironbow(temperature), not a lit surface.
// Temperature comes from a base value, an optional vertical gradient (warmer up/down), a soft
// fresnel falloff (silhouette edges read cooler, like real IR), and optional panel grid lines.
import * as THREE from "three";
import { GLSL_COMMON } from "./world.ts";

const vert = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying vec3 vLocal; varying vec2 vUv;
void main(){
  vLocal = position; vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const frag = /* glsl */ `
${GLSL_COMMON}
uniform float uT; uniform float uGrad; uniform float uGradLo; uniform float uGradHi; uniform float uEdge;
uniform float uGrid; uniform float uOpacity;
varying vec3 vN; varying vec3 vV; varying vec3 vLocal; varying vec2 vUv;
void main(){
  float g = clamp((vLocal.y - uGradLo) / max(1e-4, uGradHi - uGradLo), 0.0, 1.0);
  float T = uT + uGrad * (g - 0.5);
  float fr = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  T -= uEdge * fr * fr;
  vec3 col = ironbow(T);
  if (uGrid > 0.0) {
    vec2 q = abs(fract(vUv * vec2(6.0, 3.0)) - 0.5);
    float line = 1.0 - smoothstep(0.42, 0.47, max(q.x, q.y));
    col = mix(col, vec3(0.0, 0.85, 1.0), (1.0 - line) * uGrid);
  }
  gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(2.2)), uOpacity);
}`;

export type ThermalOpts = { t: number; grad?: number; lo?: number; hi?: number; edge?: number; grid?: number; opacity?: number };
const cache = new Map<string, THREE.ShaderMaterial>();
export const thermalMat = (o: ThermalOpts) => {
  const key = JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit;
  const m = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: (o.opacity ?? 1) < 1,
    depthWrite: (o.opacity ?? 1) >= 1,
    side: THREE.DoubleSide,
    uniforms: {
      uT: { value: o.t }, uGrad: { value: o.grad ?? 0 }, uGradLo: { value: o.lo ?? 0 }, uGradHi: { value: o.hi ?? 1 },
      uEdge: { value: o.edge ?? 0.22 }, uGrid: { value: o.grid ?? 0 }, uOpacity: { value: o.opacity ?? 1 },
    },
  });
  cache.set(key, m);
  return m;
};
