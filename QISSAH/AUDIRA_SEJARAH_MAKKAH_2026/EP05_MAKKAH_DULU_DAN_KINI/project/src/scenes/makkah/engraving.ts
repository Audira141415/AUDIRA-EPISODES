// VINTAGEFORGE engraving material for SEJARAH MAKKAH EP05.
// A MeshStandardMaterial (keeps PBR light, shadows and gold reflections) whose final colour is
// re-printed as a copperplate engraving: tonal hatching in world space (diagonal, then cross, then
// dense third pass in the deepest shadow), optional contour lines for terrain, and a split tint so
// the "dulu" half (x < splitX) prints in sepia iron-gall ink and the "kini" half in copper.

import * as THREE from "three";

export const INK = {
  paper: "#efe2c4",
  paperDeep: "#e2cfa6",
  sepia: "#3b2818",
  iron: "#1e1b18",
  copper: "#5a2f17",
  gold: "#c5a059",
  goldDeep: "#8c6a2c",
  verdigris: "#52796f",
  terracotta: "#b85a3f",
} as const;

export type EngraveOpts = {
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  /** Lines per world unit. */
  freq?: number;
  /** 0 = pure print (paper + ink), 1 = keep the lit material colour under the lines. */
  keep?: number;
  /** Strength of the ink lines. */
  ink?: number;
  /** Lift applied to luminance before choosing line width. */
  toneGain?: number;
  /** Contour line spacing in world units (0 = off). */
  contour?: number;
  splitX?: number;
  /** Camera distance at which `freq` applies; closer surfaces get finer octaves. */
  refDist?: number;
  side?: THREE.Side;
};

const cache = new Map<string, THREE.MeshStandardMaterial>();

export function engrave(o: EngraveOpts = {}): THREE.MeshStandardMaterial {
  const key = JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshStandardMaterial({
    color: o.color ?? INK.paper,
    roughness: o.roughness ?? 0.85,
    metalness: o.metalness ?? 0.0,
    side: o.side ?? THREE.FrontSide,
  });
  const u = {
    uFreq: { value: o.freq ?? 9 },
    uKeep: { value: o.keep ?? 0.25 },
    uInk: { value: o.ink ?? 0.92 },
    uGain: { value: o.toneGain ?? 1.25 },
    uContour: { value: o.contour ?? 0 },
    uSplitX: { value: o.splitX ?? 0 },
    uRefDist: { value: o.refDist ?? 7 },
    uPaper: { value: new THREE.Color(INK.paper) },
    uInkOld: { value: new THREE.Color(INK.sepia) },
    uInkNew: { value: new THREE.Color(INK.copper) },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vWP; varying vec3 vWN;
uniform float uFreq, uKeep, uInk, uGain, uContour, uSplitX, uRefDist;
uniform vec3 uPaper, uInkOld, uInkNew;
float hline(float s, float w) {
  float d = abs(fract(s) - 0.5) * 2.0;
  float aa = max(fwidth(s) * 2.0, 1e-4);
  return 1.0 - smoothstep(w - aa, w + aa, d);
}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
{
  vec3 lit = gl_FragColor.rgb;
  float lum = dot(lit, vec3(0.299, 0.587, 0.114));
  float t = clamp(pow(lum * uGain, 0.8), 0.0, 1.0);
  vec3 an = abs(normalize(vWN));
  vec2 p0 = an.x > an.y && an.x > an.z ? vWP.zy : (an.y > an.z ? vWP.xz : vWP.xy);
  // keep the burin spacing near-constant on screen: octave steps by camera distance, blended
  float dist = max(length(vWP - cameraPosition), 0.05);
  float lvl = log2(max(uRefDist / dist, 1.0));
  float l0 = floor(lvl);
  float fr = smoothstep(0.0, 1.0, lvl - l0);
  float m = 0.0;
  for (int k = 0; k < 2; k++) {
    float f = uFreq * exp2(l0 + float(k));
    vec2 p = p0 * f;
    float m1 = hline((p.x + p.y) * 0.7071, clamp((1.0 - t) * 0.95, 0.0, 0.72));
    float m2 = hline((p.x - p.y) * 0.7071, clamp((0.5 - t) / 0.5, 0.0, 1.0) * 0.8);
    float m3 = hline(p.y * 1.3, clamp((0.22 - t) / 0.22, 0.0, 1.0) * 0.9);
    float mk = max(m1, max(m2, m3));
    m += mk * (k == 0 ? 1.0 - fr : fr);
  }
  if (uContour > 0.0) {
    float c = hline(vWP.y / uContour, 0.16);
    m = max(m, c * 0.85);
  }
  float side = smoothstep(-0.15, 0.15, vWP.x - uSplitX);
  vec3 ink = mix(uInkOld, uInkNew, side);
  vec3 paper = mix(uPaper * vec3(0.95, 0.9, 0.8), uPaper, side) * (0.82 + 0.3 * t);
  vec3 base = mix(paper, lit * 1.05, uKeep);
  gl_FragColor.rgb = mix(base, ink, m * uInk);
}`,
      );
  };
  m.customProgramCacheKey = () => "engrave";
  cache.set(key, m);
  return m;
}

/** Seeded PRNG (Park-Miller). */
export const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/** Smooth value noise in 2D, deterministic. */
export function noise2(x: number, y: number, seed = 3): number {
  const h = (i: number, j: number) => {
    const n = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export function fbm(x: number, y: number, seed = 3, oct = 4): number {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x * f, y * f, seed + i * 13);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
}
