// Stage — light, atmosphere and the finishing chain of a CHRONICLE shot.
//
// A Look is one mood of the style: a low key light (sun / moon / fire) with soft shadows, a coloured hemisphere,
// exponential fog that swallows distance into the sky colour, and a grade that pushes shadows toward ink-teal and
// highlights toward lamp-amber. Chain: MSAA scene → sanitize (NaN guard) → silhouette contours → faint bloom →
// neutral tone map → grade (split tone, S-curve, vignette, film grain).

import React, { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide, Color, DirectionalLight, FogExp2, HalfFloatType, HemisphereLight, Mesh, NeutralToneMapping, Object3D,
  PerspectiveCamera, ShaderMaterial, SphereGeometry, Vector2, Vector3, WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SilhouetteOutlinePass } from "./outline.ts";
import type { Shot, V3 } from "./cam.ts";

export type Look = {
  key: { pos: V3; color: string; intensity: number; shadow?: { box: number; at: V3; far?: number; bias?: number } };
  hemi: { sky: string; ground: string; intensity: number };
  /** soft counter-light from the camera side (keeps sets readable behind the black figures) */
  fill?: { pos: V3; color: string; intensity: number };
  fog: { color: string; density: number };
  sky: { zenith: string; horizon: string; ground: string; sunDir: V3; sunColor: string; sunSize: number; glow: number; stars?: number };
  exposure: number;
  bloom: { strength: number; radius: number; threshold: number };
  grade: { shadow: string; high: string; amount: number; contrast: number; vignette: number; grain: number };
  outline?: { width?: number; halo?: number; gain?: number };
  near?: number;
  far?: number;
};

const C = (x: string) => new Color(x);
const mixC = (a: string, b: string, t: number) => "#" + C(a).lerp(C(b), t).getHexString();
const m = (a: number, b: number, t: number) => a + (b - a) * t;
const m3 = (a: V3, b: V3, t: number): V3 => [m(a[0], b[0], t), m(a[1], b[1], t), m(a[2], b[2], t)];

/** Blend two looks (light changes inside a shot: a flash, dusk falling, fire flaring). */
export const mixLook = (a: Look, b: Look, t: number): Look => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    key: { pos: m3(a.key.pos, b.key.pos, t), color: mixC(a.key.color, b.key.color, t), intensity: m(a.key.intensity, b.key.intensity, t), shadow: a.key.shadow },
    hemi: { sky: mixC(a.hemi.sky, b.hemi.sky, t), ground: mixC(a.hemi.ground, b.hemi.ground, t), intensity: m(a.hemi.intensity, b.hemi.intensity, t) },
    fog: { color: mixC(a.fog.color, b.fog.color, t), density: m(a.fog.density, b.fog.density, t) },
    sky: {
      zenith: mixC(a.sky.zenith, b.sky.zenith, t), horizon: mixC(a.sky.horizon, b.sky.horizon, t), ground: mixC(a.sky.ground, b.sky.ground, t),
      sunDir: m3(a.sky.sunDir, b.sky.sunDir, t), sunColor: mixC(a.sky.sunColor, b.sky.sunColor, t), sunSize: m(a.sky.sunSize, b.sky.sunSize, t),
      glow: m(a.sky.glow, b.sky.glow, t), stars: m(a.sky.stars ?? 0, b.sky.stars ?? 0, t),
    },
    exposure: m(a.exposure, b.exposure, t),
    bloom: { strength: m(a.bloom.strength, b.bloom.strength, t), radius: m(a.bloom.radius, b.bloom.radius, t), threshold: m(a.bloom.threshold, b.bloom.threshold, t) },
    grade: {
      shadow: mixC(a.grade.shadow, b.grade.shadow, t), high: mixC(a.grade.high, b.grade.high, t), amount: m(a.grade.amount, b.grade.amount, t),
      contrast: m(a.grade.contrast, b.grade.contrast, t), vignette: m(a.grade.vignette, b.grade.vignette, t), grain: m(a.grade.grain, b.grade.grain, t),
    },
    fill: a.fill && b.fill ? { pos: m3(a.fill.pos, b.fill.pos, t), color: mixC(a.fill.color, b.fill.color, t), intensity: m(a.fill.intensity, b.fill.intensity, t) } : a.fill,
    outline: a.outline,
    near: a.near,
    far: a.far,
  };
};

// ---------------------------------------------------------------- sky dome
const SkyShader = {
  uniforms: {
    uZenith: { value: new Color() }, uHorizon: { value: new Color() }, uGround: { value: new Color() },
    uSunDir: { value: new Vector3(0, 0.1, -1) }, uSun: { value: new Color() }, uSunSize: { value: 0.02 }, uGlow: { value: 1 }, uStars: { value: 0 },
  },
  vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGround; uniform vec3 uSunDir; uniform vec3 uSun;
    uniform float uSunSize; uniform float uGlow; uniform float uStars; varying vec3 vDir;
    float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    void main(){
      vec3 d = normalize(vDir);
      float h = d.y;
      vec3 c = h > 0.0 ? mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHorizon, uGround, clamp(-h * 6.0, 0.0, 1.0));
      vec3 s = normalize(uSunDir);
      float cs = max(dot(d, s), 0.0);
      // wide warm wash + tight halo + hard disc
      c += uSun * uGlow * (0.22 * pow(cs, 6.0) + 0.35 * pow(cs, 60.0));
      c += uSun * 2.2 * smoothstep(1.0 - uSunSize * 0.02, 1.0 - uSunSize * 0.012, cs);
      if (uStars > 0.0 && h > 0.05) {
        vec3 q = floor(d * 420.0);
        float st = step(0.9975, hash(q)) * smoothstep(0.05, 0.4, h);
        c += vec3(0.9, 0.92, 1.0) * st * uStars * (0.4 + 0.6 * hash(q + 3.1));
      }
      gl_FragColor = vec4(c, 1.0);
    }`,
};

// ---------------------------------------------------------------- grade
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new Vector2(1080, 1920) },
    uShadow: { value: new Color("#0f2a33") }, uHigh: { value: new Color("#ffb46b") }, uAmount: { value: 0.12 },
    uContrast: { value: 0.18 }, uVignette: { value: 0.3 }, uGrain: { value: 0.018 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform vec3 uShadow; uniform vec3 uHigh;
    uniform float uAmount; uniform float uContrast; uniform float uVignette; uniform float uGrain; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(c.rgb, c.rgb * uShadow * 2.2, uAmount * (1.0 - smoothstep(0.0, 0.45, l)));
      c.rgb = mix(c.rgb, c.rgb * uHigh * 1.35, uAmount * smoothstep(0.35, 1.0, l));
      c.rgb = mix(c.rgb, c.rgb * c.rgb * (3.0 - 2.0 * c.rgb), uContrast);
      vec2 d = (vUv - 0.5) * vec2(1.0, 0.85);
      c.rgb *= 1.0 - uVignette * smoothstep(0.25, 0.85, length(d));
      float g = hash(vUv * uRes + uTime * 17.0) - 0.5;
      c.rgb += g * uGrain * (0.5 + 0.5 * (1.0 - l));
      gl_FragColor = vec4(max(c.rgb, 0.0), 1.0);
    }`,
};

const SanitizeShader = {
  uniforms: { tDiffuse: { value: null }, uMax: { value: 1.7 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0, 0.0, 0.0, 1.0);
      gl_FragColor = vec4(clamp(c.rgb, 0.0, uMax), 1.0);
    }`,
};

export const Stage: React.FC<{ shot: Shot; look: Look; frame: number; children: React.ReactNode }> = ({ shot, look, frame, children }) => {
  const { gl, scene, camera, size } = useThree();

  const rig = useMemo(() => {
    const target = new Object3D();
    const key = new DirectionalLight("#fff", 2);
    key.target = target;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.radius = 4;
    const hemi = new HemisphereLight("#fff", "#444", 1);
    const fill = new DirectionalLight("#fff", 0);
    fill.target = target;
    const sky = new Mesh(new SphereGeometry(1, 48, 24), new ShaderMaterial({ ...SkyShader, side: BackSide, depthWrite: false, fog: false }));
    sky.frustumCulled = false;
    sky.renderOrder = -10;
    sky.userData.noMask = true;
    return { target, key, hemi, fill, sky };
  }, []);

  const chain = useMemo(() => {
    const w = size.width, h = size.height;
    const rt = new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(SanitizeShader));
    const outline = new SilhouetteOutlinePass(scene, camera, w, h);
    composer.addPass(outline);
    const bloom = new UnrealBloomPass(new Vector2(w, h), 0.3, 0.5, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const grade = new ShaderPass(GradeShader);
    (grade.uniforms.uRes.value as Vector2).set(w, h);
    composer.addPass(grade);
    return { composer, outline, bloom, grade };
  }, [gl, scene, camera, size.width, size.height]);

  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.position.set(...shot.pos);
    cam.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
    cam.lookAt(...shot.target);
    cam.fov = shot.fov;
    cam.near = look.near ?? 0.1;
    cam.far = look.far ?? 4000;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    gl.toneMapping = NeutralToneMapping;
    gl.shadowMap.autoUpdate = false;
  }, [shot, camera, gl, look.near, look.far]);

  useFrame(() => {
    const L = look;
    const k = rig.key;
    const sh = L.key.shadow;
    const at = sh?.at ?? [0, 0, 0];
    rig.target.position.set(...at);
    rig.target.updateMatrixWorld();
    k.position.set(at[0] + L.key.pos[0], at[1] + L.key.pos[1], at[2] + L.key.pos[2]);
    k.color.set(L.key.color);
    k.intensity = L.key.intensity;
    k.castShadow = !!sh;
    if (sh) {
      const b = sh.box;
      const sc = k.shadow.camera;
      sc.left = -b; sc.right = b; sc.top = b; sc.bottom = -b;
      sc.near = 0.5;
      sc.far = sh.far ?? 400;
      sc.updateProjectionMatrix();
      k.shadow.bias = sh.bias ?? -0.0004;
      k.shadow.normalBias = 0.02;
    }
    k.updateMatrixWorld();
    rig.hemi.color.set(L.hemi.sky);
    rig.hemi.groundColor.set(L.hemi.ground);
    rig.hemi.intensity = L.hemi.intensity;
    const F = L.fill;
    rig.fill.intensity = F ? F.intensity : 0;
    if (F) { rig.fill.position.set(at[0] + F.pos[0], at[1] + F.pos[1], at[2] + F.pos[2]); rig.fill.color.set(F.color); }
    rig.fill.updateMatrixWorld();

    const fog = scene.fog as FogExp2 | null;
    if (!fog) scene.fog = new FogExp2(L.fog.color, L.fog.density);
    else { fog.color.set(L.fog.color); fog.density = L.fog.density; }
    scene.background = new Color(L.sky.horizon);

    const cam = camera as PerspectiveCamera;
    rig.sky.position.copy(cam.position);
    rig.sky.scale.setScalar((cam.far ?? 1000) * 0.9);
    rig.sky.updateMatrixWorld();
    const su = (rig.sky.material as ShaderMaterial).uniforms;
    su.uZenith.value.set(L.sky.zenith);
    su.uHorizon.value.set(L.sky.horizon);
    su.uGround.value.set(L.sky.ground);
    su.uSunDir.value.set(...L.sky.sunDir).normalize();
    su.uSun.value.set(L.sky.sunColor);
    su.uSunSize.value = L.sky.sunSize;
    su.uGlow.value = L.sky.glow;
    su.uStars.value = L.sky.stars ?? 0;

    gl.toneMappingExposure = L.exposure;
    chain.bloom.strength = L.bloom.strength * 0.4;
    chain.bloom.radius = L.bloom.radius;
    chain.bloom.threshold = L.bloom.threshold;
    chain.outline.setRadius(size.width, L.outline?.width ?? 1);
    chain.outline.mat.uniforms.uHalo.value = L.outline?.halo ?? 0.35;
    chain.outline.mat.uniforms.uGain.value = L.outline?.gain ?? 1.5;
    const g = chain.grade.uniforms;
    g.uTime.value = frame % 997;
    g.uShadow.value.set(L.grade.shadow);
    g.uHigh.value.set(L.grade.high);
    g.uAmount.value = L.grade.amount;
    g.uContrast.value = L.grade.contrast;
    g.uVignette.value = L.grade.vignette;
    g.uGrain.value = L.grade.grain;
    gl.shadowMap.needsUpdate = true;
    chain.composer.render();
  }, 1);

  return (
    <>
      <primitive object={rig.target} />
      <primitive object={rig.key} />
      <primitive object={rig.hemi} />
      <primitive object={rig.fill} />
      <primitive object={rig.sky} />
      {children}
    </>
  );
};
