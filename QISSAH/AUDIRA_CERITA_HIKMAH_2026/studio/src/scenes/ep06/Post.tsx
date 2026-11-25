// Watercolour finishing chain for EP06: scene (MSAA) -> soft bloom (fairy, lamp, windows) -> output
// -> watercolour pass: hand wobble that "boils" a few times a second, pigment pooling at colour edges,
// broken graphite pencil contours, cold-press paper tooth, a ragged unpainted paper margin, and the
// story grade (global saturation + tint, plus a local "colour bloom" circle that spreads like a wet wash).
import React, { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { HalfFloatType, NeutralToneMapping, PerspectiveCamera, Vector2, Vector3, WebGLRenderTarget } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import type { V3 } from "./layout";

export type Cam = { pos: V3; at: V3; fov: number; roll?: number };

export const CamRig: React.FC<{ cam: Cam; exposure: number }> = ({ cam, exposure }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const c = camera as PerspectiveCamera;
    c.position.set(...cam.pos);
    c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
    c.lookAt(...cam.at);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 200;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = exposure;
  }, [cam, camera, gl, exposure]);
  return null;
};

const WatercolorShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBoil: { value: 0 },
    uSat: { value: 1 },
    uTint: { value: new Vector3(1, 1, 1) },
    uBloomC: { value: new Vector2(0.5, 0.5) },
    uBloomR: { value: -1 },
    uAspect: { value: 1920 / 1080 },
    uLine: { value: 0.75 },
    uEdge: { value: 0.6 },
    uMargin: { value: 1 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uBoil, uSat, uBloomR, uAspect, uLine, uEdge, uMargin;
    uniform vec3 uTint;
    uniform vec2 uBloomC;
    varying vec2 vUv;
    float h(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
    float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
    vec3 tex(vec2 uv){ return texture2D(tDiffuse, clamp(uv, 0.001, 0.999)).rgb; }
    void main(){
      vec2 ref = vec2(1.0/1080.0, 1.0/1920.0);
      vec2 uv = vUv;
      vec2 w = vec2(fbm(uv*vec2(7.0,12.0) + uBoil*1.7), fbm(uv*vec2(7.0,12.0) + 5.2 + uBoil*1.3)) - 0.5;
      uv += w * ref * 7.0;
      vec3 c = tex(uv);
      // pigment pooling: colour that differs from its surroundings dries darker at the edge
      vec3 b = vec3(0.0);
      for (int i = 0; i < 8; i++){ float a = float(i) * 0.785398; b += tex(uv + vec2(cos(a), sin(a)) * ref * 5.0); }
      b /= 8.0;
      float diff = length(c - b);
      c *= 1.0 - uEdge * 0.5 * smoothstep(0.03, 0.3, diff);
      // pencil contour from a luminance sobel, broken up like graphite on paper tooth
      vec2 o = ref * 1.6;
      float tl = lum(tex(uv + vec2(-o.x, o.y))), tc = lum(tex(uv + vec2(0.0, o.y))), tr = lum(tex(uv + o));
      float ml = lum(tex(uv - vec2(o.x, 0.0))), mr = lum(tex(uv + vec2(o.x, 0.0)));
      float bl = lum(tex(uv - o)), bc = lum(tex(uv - vec2(0.0, o.y))), br = lum(tex(uv + vec2(o.x, -o.y)));
      float gx = (tr + 2.0*mr + br) - (tl + 2.0*ml + bl);
      float gy = (tl + 2.0*tc + tr) - (bl + 2.0*bc + br);
      float e = length(vec2(gx, gy));
      float grain = fbm(vUv * vec2(90.0, 160.0));
      float line = smoothstep(0.16, 0.42, e) * (0.45 + 0.55 * grain);
      c = mix(c, vec3(0.24, 0.215, 0.2), line * uLine);
      // story grade: saturation, tint, and the local colour bloom
      float l = lum(c);
      float sat = uSat;
      if (uBloomR > 0.0) {
        vec2 d = (vUv - uBloomC) * vec2(1.0, uAspect);
        float rag = (fbm(vUv * vec2(5.0, 9.0) + 2.3) - 0.5) * 0.22;
        float inside = 1.0 - smoothstep(uBloomR - 0.08, uBloomR + 0.02, length(d) + rag);
        sat = mix(sat, 1.0, inside);
      }
      vec3 grey = vec3(l) * vec3(0.92, 0.97, 1.08);
      float restore = uSat < 0.999 ? (sat - uSat) / (1.0 - uSat) : 0.0;
      c = mix(grey, c, sat) * mix(uTint, vec3(1.0), restore);
      // cold-press paper: tooth catches pigment (darker specks in the valleys), whites stay warm paper
      float tooth = fbm(vUv * vec2(260.0, 460.0));
      float pig = 1.0 - l;
      c *= 1.0 - (tooth - 0.5) * 0.16 - pig * (tooth - 0.45) * 0.12;
      c = mix(c, c * vec3(1.0, 0.985, 0.955), 0.5);
      // low-frequency pigment blotches: uneven wet-in-wet density across the sheet
      float blot = fbm(vUv * vec2(3.0, 5.3) + 11.0) - 0.5;
      c *= 1.0 + blot * 0.16;
      // lift the darks toward a translucent wash (watercolour never reaches black)
      c = mix(c, vec3(0.2, 0.22, 0.32) + c * 0.85, 0.22 * (1.0 - smoothstep(0.0, 0.45, lum(c))));
      // ragged unpainted paper margin
      vec2 q = abs(vUv - 0.5) * 2.0;
      float rim = max(q.x, q.y) + (fbm(vUv * vec2(9.0, 16.0) + 7.7) - 0.5) * 0.09;
      float border = smoothstep(0.9, 1.0, rim);
      c = mix(c, vec3(0.98, 0.965, 0.937), border * uMargin);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export type Grade = { sat: number; tint: V3; bloomC: [number, number]; bloomR: number; line?: number; margin?: number };

export const WatercolorPost: React.FC<{ frame60: number; grade: Grade }> = ({ frame60, grade }) => {
  const { gl, scene, camera, size } = useThree();
  const chain = useMemo(() => {
    const w = size.width, h = size.height;
    const rt = new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new Vector2(w, h), 0.28, 0.4, 0.96));
    composer.addPass(new OutputPass());
    const wc = new ShaderPass(WatercolorShader);
    wc.uniforms.uAspect.value = h / w;
    composer.addPass(wc);
    return { composer, wc };
  }, [gl, scene, camera, size.width, size.height]);

  useLayoutEffect(() => {
    const u = chain.wc.uniforms;
    u.uBoil.value = Math.floor(frame60 / 8) % 97;
    u.uSat.value = grade.sat;
    (u.uTint.value as Vector3).set(...grade.tint);
    (u.uBloomC.value as Vector2).set(...grade.bloomC);
    u.uBloomR.value = grade.bloomR;
    u.uLine.value = grade.line ?? 0.75;
    u.uMargin.value = grade.margin ?? 1;
  }, [frame60, chain, grade]);

  useFrame(() => {
    chain.composer.render();
  }, 1);
  return null;
};
