// The painted shader. Three's Lambert lighting (with real shadow maps) runs first; then the light
// that reached the surface is measured, broken up by the brush field sampled in the surface's own
// frame (strokes wrap around the form), and snapped to a few soft painted value bands mapped onto a
// colour ramp: cool violet-blue shadow → local colour → warm light. A painted rim catches the sun
// side of silhouettes and a soft brushy darkening stands in for outlines (no ink lines: that is
// TOONFORGE). Everything else in the kit (cards, sky, sea) shares these uniforms and the same
// band logic, so the whole frame reads as one painting.

import * as THREE from "three";
import { brushField } from "./brush.ts";
import { LIGHT_TINT, SHADOW_TINT, SUN_DIR } from "./palette.ts";

export type PaintOptions = {
  color?: string;
  vertexColors?: boolean;
  /** Strokes per world unit (bigger = finer brushwork). */
  stroke?: number;
  /** Number of painted value bands. */
  bands?: number;
  /** How far the brush field pushes band edges (0..1). */
  breakup?: number;
  /** Lit value that counts as full light (raise when lights are brighter). */
  key?: number;
  rim?: number;
  outline?: number;
  /** Self-lit colour added after banding (windows, lamp). */
  glow?: string;
  glowAmount?: number;
  shadowTint?: [number, number, number];
  lightTint?: [number, number, number];
  side?: THREE.Side;
  seed?: number;
};

/** GLSL shared by every painted shader: the band quantiser and the ramp. */
export const PAINT_GLSL = /* glsl */ `
  float paintBands(float x, float bands, float soft) {
    float b = x * bands;
    float fb = floor(b);
    float fr = b - fb;
    return clamp((fb + smoothstep(0.5 - soft, 0.5 + soft, fr)) / bands, 0.0, 1.0);
  }
  vec3 paintRamp(vec3 base, float q, vec3 shTint, vec3 ltTint) {
    vec3 sh = base * shTint + vec3(0.012, 0.014, 0.035);
    vec3 lt = min(base * ltTint + vec3(0.035, 0.022, 0.0), vec3(1.0));
    return q < 0.5 ? mix(sh, base, q * 2.0) : mix(base, lt, (q - 0.5) * 2.0);
  }
  vec2 strokeFrame(vec3 P, vec3 N) {
    // ground-like surfaces: strokes run along z (into the view), so perspective shortens them into dabs
    vec3 up = abs(N.y) > 0.6 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 T = normalize(cross(up, N));
    vec3 B = cross(N, T);
    return vec2(dot(P, T), dot(P, B));
  }
`;

export const sunVector = () => new THREE.Vector3(...SUN_DIR);

export function paintMaterial(o: PaintOptions = {}): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ color: o.color ?? "#ffffff", vertexColors: !!o.vertexColors, side: o.side ?? THREE.FrontSide });
  const uniforms = {
    uBrush: { value: brushField(11) },
    uSun: { value: sunVector() },
    uStroke: { value: o.stroke ?? 3 },
    uBands: { value: o.bands ?? 4 },
    uBreak: { value: o.breakup ?? 0.42 },
    uKey: { value: o.key ?? 0.85 },
    uRim: { value: o.rim ?? 0.55 },
    uOutline: { value: o.outline ?? 0.5 },
    uGlow: { value: new THREE.Color(o.glow ?? "#000000") },
    uGlowAmt: { value: o.glowAmount ?? 0 },
    uShTint: { value: new THREE.Vector3(...(o.shadowTint ?? SHADOW_TINT)) },
    uLtTint: { value: new THREE.Vector3(...(o.lightTint ?? LIGHT_TINT)) },
    uSeedOff: { value: new THREE.Vector2(((o.seed ?? 0) * 0.137) % 1, ((o.seed ?? 0) * 0.291) % 1) },
  };
  m.userData.paint = uniforms;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPW; varying vec3 vPN;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 pw = vec4(transformed, 1.0); vec3 pn = objectNormal;
        #ifdef USE_INSTANCING
          pw = instanceMatrix * pw; pn = mat3(instanceMatrix) * pn;
        #endif
        vPW = (modelMatrix * pw).xyz; vPN = normalize(mat3(modelMatrix) * pn);`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vPW; varying vec3 vPN;
        uniform sampler2D uBrush; uniform vec3 uSun, uGlow, uShTint, uLtTint; uniform vec2 uSeedOff;
        uniform float uStroke, uBands, uBreak, uKey, uRim, uOutline, uGlowAmt;
        ${PAINT_GLSL}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `{
          vec3 Nw = normalize(vPN);
          if (!gl_FrontFacing) Nw = -Nw;
          vec3 V = normalize(cameraPosition - vPW);
          // brush field in the surface frame: strokes run around the form
          vec2 suv = strokeFrame(vPW, Nw) * uStroke * vec2(0.55, 1.0) + uSeedOff;
          vec4 br = texture2D(uBrush, suv);
          vec4 br2 = texture2D(uBrush, suv * 0.37 + vec2(0.31, 0.77));
          float baseLum = max(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)), 0.002);
          float lit = dot(outgoingLight - totalEmissiveRadiance, vec3(0.299, 0.587, 0.114)) / baseLum;
          float x = clamp(lit / uKey, 0.0, 1.0);
          x += (br.r - 0.5) * uBreak + (br2.r - 0.5) * uBreak * 0.5;
          float q = paintBands(clamp(x, 0.0, 1.0), uBands, 0.09);
          vec3 base = diffuseColor.rgb * (0.9 + (br.g - 0.5) * 0.22);
          // per-stroke hue jitter: a touch warmer or cooler, like mixed paint on the brush
          base *= mix(vec3(1.05, 0.99, 0.92), vec3(0.94, 0.99, 1.07), br.b);
          vec3 col = paintRamp(base, q, uShTint, uLtTint);
          // painted rim on the sun side of silhouettes
          float fres = pow(1.0 - clamp(dot(Nw, V), 0.0, 1.0), 2.6);
          float sunSide = smoothstep(-0.15, 0.55, dot(Nw, uSun));
          float rim = step(0.42, fres * sunSide + (br.g - 0.5) * 0.25) * uRim;
          col = mix(col, min(base * uLtTint * 1.25 + vec3(0.08, 0.05, 0.0), vec3(1.0)), rim * 0.75);
          // soft brushy outline on the shadow side of silhouettes
          float edge = smoothstep(0.62, 0.9, fres + (br.r - 0.5) * 0.3) * (1.0 - sunSide * 0.7);
          col = mix(col, base * uShTint * 0.55, edge * uOutline);
          col += uGlow * uGlowAmt;
          outgoingLight = col;
        }
        #include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "painterly-paint-v1";
  return m;
}
