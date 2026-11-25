// Extra effects for the generic sets: fire (flame billboards + flickering light), light shafts, candle, rain.
import React, { useLayoutEffect, useMemo } from "react";
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, InstancedBufferAttribute, InstancedBufferGeometry, MeshBasicMaterial, PlaneGeometry, ShaderMaterial } from "three";
import { noise1 } from "../kits/chronicle/cam.ts";

type V3 = [number, number, number];

const FlameShader = {
  vertexShader: /* glsl */ `
    attribute vec3 aPos; attribute float aSize; attribute float aSeed;
    varying vec2 vUv; varying float vSeed;
    void main(){
      vUv = uv; vSeed = aSeed;
      vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
      mv.xy += position.xy * vec2(aSize * 0.55, aSize);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; uniform float uGain; varying vec2 vUv; varying float vSeed;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * n(p); p = p * 2.1 + 3.7; a *= 0.5; } return s; }
    void main(){
      vec2 q = vUv - vec2(0.5, 0.0);
      float y = vUv.y;
      float t = uTime * 2.6 + vSeed * 13.0;
      float wob = (fbm(vec2(q.x * 3.0 + vSeed, y * 2.5 - t)) - 0.5) * 0.35 * y;
      float w = 0.42 * (1.0 - y) * (0.6 + 0.4 * fbm(vec2(vSeed, y * 3.0 - t * 0.7)));
      float d = abs(q.x + wob) / max(w, 0.001);
      float body = smoothstep(1.0, 0.25, d) * smoothstep(0.0, 0.08, y);
      float cut = fbm(vec2(q.x * 5.0 + vSeed * 3.0, y * 4.0 - t * 1.3));
      body *= smoothstep(0.15, 0.55, cut + (1.0 - y) * 0.55);
      if (body < 0.01) discard;
      vec3 hot = vec3(1.0, 0.85, 0.5), mid = vec3(1.0, 0.45, 0.1), cool = vec3(0.7, 0.12, 0.03);
      vec3 c = mix(hot, mid, smoothstep(0.0, 0.45, y + d * 0.3));
      c = mix(c, cool, smoothstep(0.45, 0.9, y));
      gl_FragColor = vec4(c * uGain * body, body);
    }`,
};

/** A cluster of flames (each entry: base position + height). */
export const Flames: React.FC<{ t: number; at: { p: V3; h: number }[]; gain?: number; light?: boolean; seed?: number }> = ({ t, at, gain = 2.4, light = true, seed = 1 }) => {
  const N = at.length * 3;
  const { geo, mat } = useMemo(() => {
    const g = new InstancedBufferGeometry();
    const pl = new PlaneGeometry(1, 1);
    pl.translate(0, 0.5, 0);
    g.index = pl.index;
    g.setAttribute("position", pl.getAttribute("position"));
    g.setAttribute("uv", pl.getAttribute("uv"));
    g.setAttribute("aPos", new InstancedBufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute("aSize", new InstancedBufferAttribute(new Float32Array(N), 1));
    g.setAttribute("aSeed", new InstancedBufferAttribute(new Float32Array(N), 1));
    g.instanceCount = N;
    const m = new ShaderMaterial({ ...FlameShader, uniforms: { uTime: { value: 0 }, uGain: { value: 2 } }, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, toneMapped: false });
    return { geo: g, mat: m };
  }, [N]);
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const P = geo.getAttribute("aPos") as InstancedBufferAttribute;
  const S = geo.getAttribute("aSize") as InstancedBufferAttribute;
  const D = geo.getAttribute("aSeed") as InstancedBufferAttribute;
  at.forEach((f, i) => {
    for (let k = 0; k < 3; k++) {
      const j = i * 3 + k;
      const sd = i * 7.31 + k * 1.7 + seed;
      P.setXYZ(j, f.p[0] + (k - 1) * f.h * 0.18 + noise1(t * 0.5 + sd, 2) * 0.05 * f.h, f.p[1], f.p[2] + (k - 1) * 0.07 * f.h);
      S.setX(j, f.h * (k === 1 ? 1 : 0.7) * (0.9 + 0.15 * noise1(t * 3 + sd, 5)));
      D.setX(j, (sd * 0.123) % 1);
    }
  });
  P.needsUpdate = S.needsUpdate = D.needsUpdate = true;
  mat.uniforms.uTime.value = t;
  mat.uniforms.uGain.value = gain;
  const c = at.reduce((acc, f) => [acc[0] + f.p[0] / at.length, acc[1] + (f.p[1] + f.h * 0.5) / at.length, acc[2] + f.p[2] / at.length], [0, 0, 0]);
  const flick = 1 + 0.25 * noise1(t * 8, seed) + 0.1 * noise1(t * 21, seed + 3);
  const size = Math.max(...at.map((f) => f.h));
  return (
    <>
      <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={7} userData={{ noMask: true }} />
      {light && <pointLight position={[c[0], c[1] + size * 0.4, c[2] + size * 0.6]} color="#ff7a2a" intensity={14 * size * size * flick} distance={size * 14} decay={1.5} />}
    </>
  );
};

let shaftTex: CanvasTexture | null = null;
const shaft = () => {
  if (shaftTex) return shaftTex;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "rgba(255,255,255,0.9)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 256);
  const side = g.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, "rgba(0,0,0,1)");
  side.addColorStop(0.3, "rgba(0,0,0,0)");
  side.addColorStop(0.7, "rgba(0,0,0,0)");
  side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = side;
  g.fillRect(0, 0, 64, 256);
  shaftTex = new CanvasTexture(c);
  return shaftTex;
};

/** Soft additive light shafts (fake volumetric beams) hanging from `from`, leaning toward +z (the camera) by `tilt`. */
export const Shafts: React.FC<{ from: V3; yaw?: number; tilt: number; len: number; width: number; count?: number; color?: string; opacity?: number; t: number }> = ({
  from, yaw = 0, tilt, len, width, count = 4, color = "#ffd9a0", opacity = 0.16, t,
}) => {
  const mat = useMemo(() => new MeshBasicMaterial({ map: shaft(), color: new Color(color), transparent: true, opacity, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, toneMapped: false, fog: false }), [color, opacity]);
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  mat.opacity = opacity * (0.85 + 0.15 * noise1(t * 0.4, 7));
  return (
    <group position={from} rotation={[0, yaw, 0]} userData={{ noMask: true }}>
      <group rotation={[-tilt, 0, 0]}>
        {Array.from({ length: count }, (_, i) => {
          const x = (i / Math.max(1, count - 1) - 0.5) * width;
          return (
            <mesh key={i} material={mat} position={[x, -len / 2, 0]} rotation={[0, (i % 2 ? 1 : -1) * 0.22, 0]} userData={{ noMask: true }}>
              <planeGeometry args={[(width / count) * 1.5, len]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const candleFlame = new MeshBasicMaterial({ color: new Color("#ffb45a").multiplyScalar(5), toneMapped: false, fog: false });
const candleCore = new MeshBasicMaterial({ color: new Color("#fff0c8").multiplyScalar(7), toneMapped: false, fog: false });
const wax = new MeshBasicMaterial({ color: "#d8c8a8" });
export const Candle: React.FC<{ pos: V3; t: number; seed?: number; power?: number }> = ({ pos, t, seed = 1, power = 1 }) => {
  const f = 1 + 0.15 * noise1(t * 9, seed) + 0.06 * noise1(t * 23, seed + 2);
  return (
    <group position={pos}>
      <mesh material={wax} position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.025, 0.028, 0.14, 12]} />
      </mesh>
      <mesh material={candleFlame} position={[0, 0.17 + 0.01 * f, 0]} scale={[0.016, 0.04 * f, 0.016]} userData={{ noMask: true }}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      <mesh material={candleCore} position={[0, 0.16, 0]} scale={[0.007, 0.018, 0.007]} userData={{ noMask: true }}>
        <sphereGeometry args={[1, 8, 6]} />
      </mesh>
      <pointLight position={[0, 0.25, 0]} color="#ffae5c" intensity={2.6 * f * power} distance={7} decay={1.5} castShadow={false} />
    </group>
  );
};
