// Painted sky dome and painted sea. Both are flat-shaded ShaderMaterials (no lights): the sky is a
// gradient broken into horizontal brush bands with a warm glow towards the sun; the sea is
// layered horizontal dashes that scroll, a fresnel lift towards the horizon and broken glitter.

import React, { useMemo } from "react";
import * as THREE from "three";
import { brushField } from "../lib/brush.ts";
import { PAINT_GLSL, sunVector } from "../lib/paint.ts";
import { HAZE, PAINT } from "../lib/palette.ts";
import { SEA_Y } from "../core/motion.ts";

const col = (hex: string) => new THREE.Color(hex);

export const PaintedSky: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uBrush: { value: brushField(23) },
          uSun: { value: sunVector() },
          uZen: { value: col(PAINT.zenith) },
          uMid: { value: col(PAINT.skyMid) },
          uHor: { value: col(PAINT.horizon) },
          uGlow: { value: col(PAINT.sunGlow) },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uBrush; uniform vec3 uSun, uZen, uMid, uHor, uGlow; uniform float uTime;
          varying vec3 vDir;
          ${PAINT_GLSL}
          void main() {
            vec3 d = normalize(vDir);
            float az = atan(d.x, d.z);
            vec2 suv = vec2(az * 1.4 + uTime * 0.004, d.y * 7.0);
            vec4 br = texture2D(uBrush, suv);
            vec4 br2 = texture2D(uBrush, suv * vec2(0.5, 0.45) + 0.37);
            float h = d.y + (br.r - 0.5) * 0.07 + (br2.r - 0.5) * 0.05;
            // a painter's sky: a few bands of mixed paint rather than a smooth gradient
            float hq = paintBands(clamp(h * 1.25 + 0.06, 0.0, 1.0), 7.0, 0.22);
            vec3 c = mix(uHor, uMid, smoothstep(0.02, 0.32, hq));
            c = mix(c, uZen, smoothstep(0.3, 0.95, hq));
            float g = max(dot(d, uSun), 0.0);
            float glow = pow(g, 5.0) * 0.75 + pow(g, 40.0) * 0.6;
            glow = paintBands(clamp(glow + (br.g - 0.5) * 0.12, 0.0, 1.0), 4.0, 0.2);
            c = mix(c, uGlow, glow * 0.85);
            c *= 0.94 + (br.g - 0.5) * 0.12;
            c *= mix(vec3(1.03, 1.0, 0.95), vec3(0.96, 1.0, 1.05), br.b);
            gl_FragColor = vec4(c, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  mat.uniforms.uTime.value = t;
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[400, 48, 24]} />
    </mesh>
  );
};

export const PaintedSea: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBrush: { value: brushField(31) },
          uSun: { value: sunVector() },
          uDeep: { value: col(PAINT.seaDeep) },
          uSea: { value: col(PAINT.sea) },
          uLight: { value: col(PAINT.seaLight) },
          uGlint: { value: col(PAINT.glint) },
          uHaze: { value: col(HAZE.color) },
          uHor: { value: col(PAINT.horizon) },
          uHazeNear: { value: HAZE.near },
          uHazeFar: { value: HAZE.far * 1.6 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWP; varying float vDepth;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWP = w.xyz;
            vec4 mv = viewMatrix * w;
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uBrush; uniform vec3 uSun, uDeep, uSea, uLight, uGlint, uHaze, uHor;
          uniform float uTime, uHazeNear, uHazeFar;
          varying vec3 vWP; varying float vDepth;
          ${PAINT_GLSL}
          void main() {
            vec3 V = normalize(cameraPosition - vWP);
            // horizontal dashes: stretched in x, compressed in z, two layers scrolling against each other
            vec2 a = vec2(vWP.x * 0.16 + uTime * 0.02, vWP.z * 0.62 + uTime * 0.05);
            vec2 b = vec2(vWP.x * 0.09 - uTime * 0.015, vWP.z * 0.33 - uTime * 0.03) + 0.5;
            vec4 b1 = texture2D(uBrush, a);
            vec4 b2 = texture2D(uBrush, b);
            float fres = pow(1.0 - clamp(V.y, 0.0, 1.0), 4.0);
            float x = 0.38 + fres * 0.55 + (b1.r - 0.5) * 0.45 + (b2.r - 0.5) * 0.3;
            float q = paintBands(clamp(x, 0.0, 1.0), 4.0, 0.14);
            vec3 c = q < 0.5 ? mix(uDeep, uSea, q * 2.0) : mix(uSea, uLight, (q - 0.5) * 2.0);
            c = mix(c, uHor, smoothstep(0.75, 1.0, fres) * 0.35);
            // glitter: broken bright strokes where the sun reflects
            vec3 R = reflect(-V, vec3(0.0, 1.0, 0.0));
            float sp = smoothstep(0.55, 0.92, dot(R, uSun));
            float crest = step(0.7, b1.g * 0.7 + b2.r * 0.5);
            c = mix(c, uGlint, sp * crest * 0.9);
            c *= mix(vec3(1.03, 1.0, 0.96), vec3(0.96, 1.0, 1.04), b1.b);
            float hz = smoothstep(uHazeNear, uHazeFar, vDepth) * 0.9;
            c = mix(c, uHaze, hz);
            gl_FragColor = vec4(c, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  mat.uniforms.uTime.value = t;
  return (
    <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y, -120]} receiveShadow>
      <planeGeometry args={[500, 260, 1, 1]} />
    </mesh>
  );
};
