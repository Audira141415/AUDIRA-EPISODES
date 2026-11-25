// Sand materials. Both are MeshStandardMaterial with procedural grain injected (no photo textures):
//   - sculptMaterial: packed, carved sand. Colour speckle at grain scale (fades out below ~1.5 px so it
//     never shimmers), trowel scrapes on walls and tops, carved bands and recessed panels on the
//     pillars, scutes on the turtle shell, the engraved name on the plinth, a darker wet base, and a
//     loose, lighter lid where the form is still rising or has just crumbled. Flat-shaded for crisp
//     carved facets; marks fade and wind gullies appear as `erode` grows.
//   - beachMaterial: the beach itself. Dry sand above, darker glossy wet sand toward the sea and
//     behind the swash, fresh loose sand on the apron, ripples as bump on the far beach.
// Both read `aOrig` (rest position) so the texture stays glued to the material as the shape moves.

import * as THREE from "three";
import { GLSL_NOISE } from "./noise.ts";
import { SAND, PASIR_PALETTE as P } from "./palette.ts";
import { NAME_RECT, nameTexture, type Part } from "./sculpture.ts";

/** Uniforms shared by every sculpture part (update once per frame). */
export function sculptShared() {
  return {
    uCeil: { value: 0 },
    uCeilAmp: { value: 0.05 },
    uErode: { value: 0 },
    uName: { value: nameTexture() as THREE.Texture },
    uDryLight: { value: new THREE.Color(SAND.dryLight) },
    uDryDark: { value: new THREE.Color(SAND.dryDark) },
    uWet: { value: new THREE.Color(SAND.wet) },
    uMineral: { value: new THREE.Color(SAND.mineral) },
    uShellCol: { value: new THREE.Color(SAND.shell) },
  };
}
export type SculptShared = ReturnType<typeof sculptShared>;

const COLOR_CHUNK = /* glsl */ `
  float px = max(length(fwidth(vWp)), 1e-5);
  vec3 P = vOrig;
  vec3 on = normalize(vObjN);
  float side = 1.0 - abs(on.y);
  float g = pfGrain(P, px);
  float mott = pfFbm3(P * 5.0);
  float ch = uCeil + vCeilN * uCeilAmp;
  float raw = smoothstep(-0.012, 0.02, vOrig.y - ch);
  float wob = pfNoise3(P * vec3(4.0, 0.7, 4.0)) * 0.9;
  float marks = 0.0;
  float cut = 0.0;
  if (uSurf < 1.5 || uSurf > 3.5) {
    // Trowel scrapes: a sawtooth across walls, diagonal strokes on tops.
    // Strokes come in patches (one pass of the trowel), not as a regular brick-like pattern.
    float patchW = smoothstep(0.38, 0.7, pfNoise3(P * vec3(2.6, 7.0, 2.6)));
    float patchT = smoothstep(0.38, 0.7, pfNoise3(P * vec3(5.0, 2.0, 3.0) + 4.0));
    float scr = fract(P.y * 26.0 + wob * 2.2);
    marks += side * scr * scr * 0.0016 * patchW;
    float tp = fract((P.x * 0.6 + P.z * 0.8) * 20.0 + wob * 2.0);
    marks += (1.0 - side) * tp * tp * 0.0013 * patchT;
  }
  if (uSurf > 0.5 && uSurf < 1.5) {
    // Pillar: carved bands and a recessed panel with a raised diamond on every face.
    float bands = (1.0 - smoothstep(0.008, 0.016, abs(P.y - 0.86))) + (1.0 - smoothstep(0.007, 0.014, abs(P.y - 1.93))) + (1.0 - smoothstep(0.006, 0.012, abs(P.y - 2.0)));
    cut += bands * side;
    vec2 q = vec2(dot(P.xz - uC.xz, vec2(-on.z, on.x)), P.y - 1.42);
    float panel = (1.0 - smoothstep(0.165, 0.18, abs(q.x))) * (1.0 - smoothstep(0.37, 0.385, abs(q.y)));
    float dia = 1.0 - smoothstep(0.1, 0.112, abs(q.x) + abs(q.y) * 0.42);
    float rim = 1.0 - smoothstep(0.004, 0.009, abs(abs(q.x) + abs(q.y) * 0.42 - 0.135));
    cut += side * (panel * (1.0 - dia) + rim * panel * 0.6) * smoothstep(0.6, 0.9, side);
  }
  if (uSurf > 1.5 && uSurf < 2.5) {
    // Turtle shell: central row, two rings and radial seams (scutes), scalloped rim.
    vec3 q = (P - uC) / uH;
    float r = length(q.xz);
    float a = atan(q.z, q.x);
    float ring1 = 1.0 - smoothstep(0.012, 0.03, abs(r - 0.4));
    float ring2 = 1.0 - smoothstep(0.012, 0.03, abs(r - 0.78));
    float spokes = (1.0 - smoothstep(0.03, 0.07, abs(sin(a * 3.0)) * r)) * step(0.4, r) * step(r, 0.78);
    float rimS = (1.0 - smoothstep(0.03, 0.06, abs(sin(a * 7.0)) * r)) * step(0.78, r);
    float mid = (1.0 - smoothstep(0.012, 0.03, abs(q.z))) * step(r, 0.4) * step(0.1, abs(q.x));
    cut += (ring1 + ring2 + spokes + rimS + mid) * 0.75 * step(0.0, q.y);
  }
  if (uSurf > 2.5 && uSurf < 3.5) {
    marks += (pfNoise3(P * 48.0) - 0.5) * 0.0024;
  }
  float nameM = 0.0;
  if (uSurf > 3.5 && on.z > 0.5) {
    vec2 uv = vec2((P.x - ${NAME_RECT.x0.toFixed(3)}) / ${(NAME_RECT.x1 - NAME_RECT.x0).toFixed(3)}, (P.y - ${NAME_RECT.y0.toFixed(3)}) / ${(NAME_RECT.y1 - NAME_RECT.y0).toFixed(3)});
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) nameM = texture2D(uName, uv).r;
    cut += nameM * 1.3;
  }
  float erodeK = 1.0 - 0.8 * uErode;
  float h = (marks - cut * 0.011) * erodeK;
  h += (pfFbm3(P * vec3(14.0, 3.0, 14.0)) - 0.5) * 0.004 * uErode;
  h = mix(h, (pfNoise3(P * 36.0) - 0.5) * 0.006, raw);
  h += g * 0.0014;
  pfH = h;

  float tone = clamp(0.5 + g * 0.5 + (mott - 0.5) * 0.75, 0.0, 1.0);
  vec3 col = mix(uDryDark, uDryLight, tone);
  float fade2 = 1.0 - smoothstep(0.0012, 0.004, px);
  float sp = pfHash3(floor(P * 520.0));
  col = mix(col, uMineral, step(0.955, sp) * 0.55 * fade2);
  col = mix(col, uShellCol, step(sp, 0.025) * 0.45 * fade2);
  // Cut recesses hold shade and a little damp.
  col *= 1.0 - clamp(cut * erodeK, 0.0, 1.0) * 0.16;
  float wet = 1.0 - smoothstep(0.02, 0.26, vWp.y + (mott - 0.5) * 0.1);
  col = mix(col, uWet, wet * 0.7);
  col = mix(col, uDryLight * 1.04, raw * 0.45);
  diffuseColor.rgb = col;
  pfWet = wet;
`;

export function sculptMaterial(part: Part, shared: SculptShared): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.94, metalness: 0, flatShading: true });
  const own = {
    uSurf: { value: part.surf },
    uC: { value: new THREE.Vector3(...part.c) },
    uH: { value: new THREE.Vector3(...part.h) },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, own);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute vec3 aOrig; attribute float aCeilN;
        varying vec3 vOrig; varying vec3 vObjN; varying vec3 vWp; varying float vCeilN;`,
      )
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vOrig = aOrig; vObjN = normal; vCeilN = aCeilN; vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uCeil, uCeilAmp, uErode, uSurf; uniform vec3 uC, uH;
        uniform sampler2D uName; uniform vec3 uDryLight, uDryDark, uWet, uMineral, uShellCol;
        varying vec3 vOrig; varying vec3 vObjN; varying vec3 vWp; varying float vCeilN;
        ${GLSL_NOISE}`,
      )
      .replace("#include <color_fragment>", `#include <color_fragment>\nfloat pfH = 0.0; float pfWet = 0.0;\n${COLOR_CHUNK}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.66, pfWet);`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\nnormal = pfBump(normal, -vViewPosition, pfH * 1.8, 1.0);`);
  };
  m.customProgramCacheKey = () => "pasir-sculpt";
  return m;
}

/** Uniforms for the beach. */
export function beachShared() {
  return {
    uWetFront: { value: -99 },
    uShore: { value: -2.6 },
    uDry: { value: new THREE.Color(SAND.dry) },
    uDryLight: { value: new THREE.Color(SAND.dryLight) },
    uDryDark: { value: new THREE.Color(SAND.dryDark) },
    uWet: { value: new THREE.Color(SAND.wet) },
    uWetDeep: { value: new THREE.Color(SAND.wetDeep) },
    uMineral: { value: new THREE.Color(SAND.mineral) },
    uShellCol: { value: new THREE.Color(SAND.shell) },
  };
}
export type BeachShared = ReturnType<typeof beachShared>;

export function beachMaterial(shared: BeachShared, rippleBump: boolean): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, { uRipple: { value: rippleBump ? 1 : 0 } });
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\nattribute float aFresh;\nvarying vec3 vWp; varying float vFresh;`)
      .replace("#include <worldpos_vertex>", `#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz; vFresh = aFresh;`);
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uWetFront, uShore, uRipple; uniform vec3 uDry, uDryLight, uDryDark, uWet, uWetDeep, uMineral, uShellCol;
        varying vec3 vWp; varying float vFresh;
        ${GLSL_NOISE}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float px = max(length(fwidth(vWp)), 1e-5);
        vec3 P = vWp;
        float g = pfGrain(vec3(P.x, 0.0, P.z), px);
        float mott = pfFbm3(vec3(P.x * 1.3, 0.0, P.z * 1.3));
        float tone = clamp(0.5 + g * 0.45 + (mott - 0.5) * 0.8, 0.0, 1.0);
        vec3 col = mix(uDryDark, uDryLight, tone);
        col = mix(col, uDry, 0.35);
        float fade2 = 1.0 - smoothstep(0.0012, 0.004, px);
        float sp = pfHash3(floor(vec3(P.x, 0.0, P.z) * 480.0));
        col = mix(col, uMineral, step(0.955, sp) * 0.5 * fade2);
        col = mix(col, uShellCol, step(sp, 0.02) * 0.4 * fade2);
        // Wet band toward the sea, with a ragged high-water line; and the swash's wet tongue.
        float edge = (pfNoise3(vec3(P.x * 0.9, 0.0, P.z * 0.4)) - 0.5) * 0.7;
        float wet = smoothstep(uShore + 0.5 + edge, uShore - 0.5 + edge, P.z);
        float swash = smoothstep(uWetFront + 0.08, uWetFront - 0.25, P.z + edge * 0.4) * step(-50.0, uWetFront);
        wet = max(wet, swash * 0.85);
        col = mix(col, mix(uWet, uWetDeep, smoothstep(0.6, 1.0, wet)), wet);
        // Fresh fallen sand on the apron: lighter and looser.
        col = mix(col, uDryLight * 1.02, clamp(vFresh, 0.0, 1.0) * 0.35 * (1.0 - wet));
        // Ripple troughs collect darker heavy grains.
        float rip = sin((P.x * 0.82 + P.z * 0.57) * 26.0 + pfNoise3(vec3(P.x * 0.9, 0.0, P.z * 0.9)) * 3.2);
        float far = smoothstep(2.0, 4.0, length(max(abs(P.xz) - vec2(1.5, 1.2), 0.0)));
        col *= 1.0 - (1.0 - smoothstep(-1.0, -0.6, rip)) * 0.07 * far;
        diffuseColor.rgb = col;
        float pfWet = wet;
        float pfH = g * 0.0012 + rip * 0.006 * far * uRipple * (1.0 - wet * 0.7);`,
      )
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.3, pfWet);`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\nnormal = pfBump(normal, -vViewPosition, pfH * 2.0, 1.0);`);
  };
  m.customProgramCacheKey = () => `pasir-beach-${rippleBump ? 1 : 0}`;
  return m;
}

export const SEA = { deep: P.seaDeep, near: P.seaNear, foam: P.foam };
