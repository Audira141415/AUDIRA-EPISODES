// CHRONICLE effects — all deterministic functions of time `t` (seconds):
//   <AshColumn>  billowing eruption / smoke column (instanced camera-facing puffs, lit from below by the vent)
//   <Embers>     glowing sparks rising / drifting (round soft points)
//   <Bolt>       volcanic lightning (jagged emissive segments) for short windows
//   <Birds>      a flock of black birds bursting away (flapping V shapes, silhouette-tagged, no contour)
//   <Smoke>      low lazy smoke for fires / chimneys (AshColumn preset)

import React, { useLayoutEffect, useMemo } from "react";
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedBufferAttribute, InstancedBufferGeometry,
  MeshBasicMaterial, NormalBlending, PlaneGeometry, ShaderMaterial, Vector3, CylinderGeometry,
} from "three";
import { noise1 } from "./cam.ts";

const hash = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ AshColumn
const PuffShader = {
  vertexShader: /* glsl */ `
    attribute vec3 aPos; attribute float aSize; attribute float aSeed; attribute float aAlpha; attribute float aHeat; attribute float aRot;
    varying vec2 vUv; varying float vSeed; varying float vAlpha; varying float vHeat;
    #include <fog_pars_vertex>
    void main(){
      vUv = uv; vSeed = aSeed; vAlpha = aAlpha; vHeat = aHeat;
      vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
      float c = cos(aRot), s = sin(aRot);
      vec2 p = mat2(c, -s, s, c) * position.xy;
      mv.xy += p * aSize;
      gl_Position = projectionMatrix * mv;
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uDark; uniform vec3 uLit; uniform vec3 uHot; uniform float uFlash; uniform vec3 uFlashCol; uniform float uDensity;
    varying vec2 vUv; varying float vSeed; varying float vAlpha; varying float vHeat;
    #include <fog_pars_fragment>
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
    void main(){
      vec2 q = vUv - 0.5;
      float r = length(q) * 2.0;
      float f = fbm(vUv * 3.2 + vSeed * 17.0);
      float m = smoothstep(1.0, 0.35, r + (f - 0.5) * 0.9);
      if (m < 0.01) discard;
      // lit from below: the underside of each puff catches the vent glow
      float under = smoothstep(0.35, -0.45, q.y + (f - 0.5) * 0.4);
      vec3 col = mix(uDark, uLit, under * vHeat);
      col = mix(col, uHot, pow(vHeat, 3.0) * under * 0.85);
      col *= 0.75 + 0.5 * f;
      col += uFlashCol * uFlash * (0.4 + 0.6 * f);
      gl_FragColor = vec4(col, m * vAlpha * uDensity);
      #include <fog_fragment>
    }`,
};

export type AshProps = {
  t: number;
  base: [number, number, number];
  height: number;
  width: number;
  count?: number;
  life?: number;
  wind?: [number, number];
  dark?: string; lit?: string; hot?: string;
  flash?: number; flashColor?: string;
  density?: number;
  seed?: number;
  /** 0…1 intensity ramp (eruption start) */
  amount?: number;
};

export const AshColumn: React.FC<AshProps> = (p) => {
  const N = p.count ?? 140;
  const { geo, mat } = useMemo(() => {
    const g = new InstancedBufferGeometry();
    const pl = new PlaneGeometry(1, 1);
    g.index = pl.index;
    g.setAttribute("position", pl.getAttribute("position"));
    g.setAttribute("uv", pl.getAttribute("uv"));
    g.setAttribute("aPos", new InstancedBufferAttribute(new Float32Array(N * 3), 3));
    for (const k of ["aSize", "aSeed", "aAlpha", "aHeat", "aRot"]) g.setAttribute(k, new InstancedBufferAttribute(new Float32Array(N), 1));
    g.instanceCount = N;
    const m = new ShaderMaterial({
      ...PuffShader,
      uniforms: {
        uDark: { value: new Color() }, uLit: { value: new Color() }, uHot: { value: new Color() }, uFlash: { value: 0 }, uFlashCol: { value: new Color() }, uDensity: { value: 1 },
        fogColor: { value: new Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 }, fogDensity: { value: 0.001 },
      },
      transparent: true, depthWrite: false, fog: true, blending: NormalBlending, side: DoubleSide,
    });
    return { geo: g, mat: m };
  }, [N]);
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  const L = p.life ?? 7;
  const amt = p.amount ?? 1;
  const seed = p.seed ?? 1;
  const aPos = geo.getAttribute("aPos") as InstancedBufferAttribute;
  const aSize = geo.getAttribute("aSize") as InstancedBufferAttribute;
  const aSeed = geo.getAttribute("aSeed") as InstancedBufferAttribute;
  const aAlpha = geo.getAttribute("aAlpha") as InstancedBufferAttribute;
  const aHeat = geo.getAttribute("aHeat") as InstancedBufferAttribute;
  const aRot = geo.getAttribute("aRot") as InstancedBufferAttribute;
  const wind = p.wind ?? [0, 0];
  for (let i = 0; i < N; i++) {
    const r0 = hash(i * 3.1 + seed), r1 = hash(i * 7.7 + seed), r2 = hash(i * 1.3 + seed * 2);
    const age = (((p.t + r0 * L) % L) + L) % L;
    const k = age / L;
    const rise = Math.pow(k, 0.75);
    const spread = p.width * (0.18 + 0.82 * Math.pow(k, 0.9));
    const ang = r1 * Math.PI * 2 + p.t * 0.15 * (r2 - 0.5);
    const rad = Math.sqrt(r2) * spread * 0.5;
    const y = p.base[1] + p.height * rise;
    const x = p.base[0] + Math.cos(ang) * rad + wind[0] * k * p.height + noise1(p.t * 0.3 + i, seed) * spread * 0.08;
    const z = p.base[2] + Math.sin(ang) * rad * 0.7 + wind[1] * k * p.height;
    aPos.setXYZ(i, x, y, z);
    aSize.setX(i, p.width * (0.32 + 0.75 * k) * (0.8 + 0.4 * r0));
    aSeed.setX(i, r1 * 10);
    const fadeIn = Math.min(1, age / 0.8), fadeOut = Math.min(1, (L - age) / 2.0);
    // born only after the eruption has started (amount ramps the column up)
    const born = Math.min(1, Math.max(0, (amt * 1.3 - k) * 3));
    aAlpha.setX(i, fadeIn * fadeOut * born * (0.55 + 0.45 * r2));
    aHeat.setX(i, Math.max(0, 1 - k * 1.6));
    aRot.setX(i, r0 * 6.28 + p.t * 0.08 * (r1 - 0.5));
  }
  for (const a of [aPos, aSize, aSeed, aAlpha, aHeat, aRot]) a.needsUpdate = true;
  const u = mat.uniforms;
  u.uDark.value.set(p.dark ?? "#3b3433");
  u.uLit.value.set(p.lit ?? "#b4502a");
  u.uHot.value.set(p.hot ?? "#ffb15a");
  u.uFlash.value = p.flash ?? 0;
  u.uFlashCol.value.set(p.flashColor ?? "#b9a0ff");
  u.uDensity.value = p.density ?? 0.9;
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={5} userData={{ noMask: true }} />;
};

// ------------------------------------------------------------------ Embers
const EmberShader = {
  vertexShader: /* glsl */ `
    attribute float aSize; attribute float aGlow; varying float vGlow; uniform float uScale;
    void main(){ vGlow = aGlow; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uCol; varying float vGlow;
    void main(){ vec2 q = gl_PointCoord - 0.5; float r = length(q) * 2.0; float a = smoothstep(1.0, 0.0, r); a *= a;
      gl_FragColor = vec4(uCol * (0.6 + 1.8 * vGlow) * a, a * vGlow); }`,
};

export const Embers: React.FC<{ t: number; count?: number; box: [number, number, number, number, number, number]; rise?: number; size?: number; color?: string; seed?: number; scale?: number }> = ({
  t, count = 260, box, rise = 1.2, size = 0.12, color = "#ff9a3c", seed = 3, scale = 900,
}) => {
  const { geo, mat } = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSize", new BufferAttribute(new Float32Array(count), 1));
    g.setAttribute("aGlow", new BufferAttribute(new Float32Array(count), 1));
    const m = new ShaderMaterial({ ...EmberShader, uniforms: { uCol: { value: new Color() }, uScale: { value: 900 } }, transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
    return { geo: g, mat: m };
  }, [count]);
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const [x0, y0, z0, x1, y1, z1] = box;
  const P = geo.getAttribute("position") as BufferAttribute;
  const S = geo.getAttribute("aSize") as BufferAttribute;
  const Gl = geo.getAttribute("aGlow") as BufferAttribute;
  const H = y1 - y0;
  for (let i = 0; i < count; i++) {
    const r = [hash(i + seed), hash(i * 2.3 + seed), hash(i * 5.1 + seed), hash(i * 9.7 + seed)];
    const span = H / Math.abs(rise);
    const k = (((t + r[0] * span) % span) + span) % span / span;
    const y = rise >= 0 ? y0 + k * H : y1 - k * H;
    const x = x0 + r[1] * (x1 - x0) + noise1(t * 0.7 + i * 0.37, seed) * 0.8;
    const z = z0 + r[2] * (z1 - z0) + noise1(t * 0.6 + i * 0.51, seed + 4) * 0.6;
    P.setXYZ(i, x, y, z);
    S.setX(i, size * (0.5 + r[3]));
    const tw = 0.6 + 0.4 * Math.sin(t * (6 + r[3] * 9) + i);
    Gl.setX(i, tw * Math.min(1, k * 6) * Math.min(1, (1 - k) * 4));
  }
  P.needsUpdate = S.needsUpdate = Gl.needsUpdate = true;
  mat.uniforms.uCol.value.set(color);
  mat.uniforms.uScale.value = scale;
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={6} />;
};

// ------------------------------------------------------------------ Bolt
const boltGeo = new CylinderGeometry(1, 1, 1, 5, 1);
const boltMat = new MeshBasicMaterial({ color: new Color("#e6dcff").multiplyScalar(5), toneMapped: false, fog: false });
const boltGlow = new MeshBasicMaterial({ color: new Color("#9a6bff").multiplyScalar(2), toneMapped: false, fog: false, transparent: true, opacity: 0.35, depthWrite: false, blending: AdditiveBlending });

/** A jagged bolt from `a` to `b`, visible while `on` > 0. Shape is fixed by `seed` (re-seed for a new strike). */
export const Bolt: React.FC<{ a: [number, number, number]; b: [number, number, number]; seed: number; on: number; width: number }> = ({ a, b, seed, on, width }) => {
  const segs = useMemo(() => {
    let pts = [new Vector3(...a), new Vector3(...b)];
    const len = pts[0].distanceTo(pts[1]);
    let amp = len * 0.18;
    for (let lvl = 0; lvl < 5; lvl++) {
      const next: Vector3[] = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const m = pts[i].clone().add(pts[i + 1]).multiplyScalar(0.5);
        m.x += (hash(seed * 13 + lvl * 7 + i) - 0.5) * amp;
        m.y += (hash(seed * 17 + lvl * 3 + i) - 0.5) * amp * 0.4;
        m.z += (hash(seed * 19 + lvl * 5 + i) - 0.5) * amp * 0.3;
        next.push(m, pts[i + 1]);
      }
      pts = next;
      amp *= 0.55;
    }
    return pts;
  }, [a, b, seed]);
  if (on <= 0.01) return null;
  return (
    <group userData={{ noMask: true }}>
      {segs.slice(0, -1).map((p, i) => {
        const q = segs[i + 1];
        const mid = p.clone().add(q).multiplyScalar(0.5);
        const d = q.clone().sub(p);
        const l = d.length();
        const up = new Vector3(0, 1, 0);
        const quat = new Vector3().copy(d).normalize();
        const axis = up.clone().cross(quat);
        const ang = Math.acos(Math.min(1, Math.max(-1, up.dot(quat))));
        const ax = axis.lengthSq() < 1e-8 ? new Vector3(1, 0, 0) : axis.normalize();
        return (
          <group key={i} position={mid} quaternion={[ax.x * Math.sin(ang / 2), ax.y * Math.sin(ang / 2), ax.z * Math.sin(ang / 2), Math.cos(ang / 2)]}>
            <mesh geometry={boltGeo} material={boltMat} scale={[width * on, l, width * on]} userData={{ noMask: true }} />
            <mesh geometry={boltGeo} material={boltGlow} scale={[width * 5 * on, l, width * 5 * on]} userData={{ noMask: true }} />
          </group>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------ Birds
const wingGeo = (() => {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array([0, 0, 0.12, 0, 0, -0.1, 1, 0, -0.02]), 3));
  g.computeVertexNormals();
  return g;
})();
const birdMat = new MeshBasicMaterial({ color: "#050506", side: DoubleSide, fog: true });

export const Birds: React.FC<{ t: number; start: number; origin: [number, number, number]; dir: [number, number, number]; count?: number; speed?: number; size?: number; seed?: number }> = ({
  t, start, origin, dir, count = 14, speed = 6, size = 0.28, seed = 5,
}) => {
  const a = t - start;
  if (a < 0) return null;
  const d = new Vector3(...dir).normalize();
  const yaw = Math.atan2(d.x, d.z);
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const r = [hash(i + seed), hash(i * 3.3 + seed), hash(i * 7.1 + seed), hash(i * 1.9 + seed)];
        const delay = r[0] * 0.5;
        const k = Math.max(0, a - delay);
        if (k <= 0) return null;
        const sp = speed * (0.75 + 0.5 * r[1]);
        const dist = sp * k * Math.min(1, 0.4 + k);
        const px = origin[0] + d.x * dist + (r[2] - 0.5) * (1.5 + k * 2.5);
        const py = origin[1] + d.y * dist + (r[3] - 0.5) * 1.2 + k * 1.4 * r[1] + noise1(k * 1.5 + i, seed) * 0.4;
        const pz = origin[2] + d.z * dist + (r[1] - 0.5) * (1.5 + k * 2.5);
        const flap = Math.sin(k * (14 + r[3] * 6) + i) * 0.7;
        const s = size * (0.8 + 0.4 * r[2]);
        return (
          <group key={i} position={[px, py, pz]} rotation={[0, yaw, 0]} scale={s} userData={{ noMask: true }}>
            <mesh geometry={wingGeo} material={birdMat} rotation={[0, 0, flap]} />
            <mesh geometry={wingGeo} material={birdMat} rotation={[0, Math.PI, flap]} />
          </group>
        );
      })}
    </group>
  );
};
