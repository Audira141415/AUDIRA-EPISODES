// Stroke cards: thousands of single brush marks (leaf dabs, grass tufts, cloud puffs, glints) drawn
// as camera-facing quads in one instanced draw. Each card carries the normal of the volume it
// belongs to (a foliage clump, a cloud, the hill), so the marks are lit as one painted mass and
// snapped to the same value bands as the painted shader. Wind is a pure function of uTime.

import React, { useMemo } from "react";
import * as THREE from "three";
import { dabAtlas } from "../lib/brush.ts";
import { PAINT_GLSL, sunVector } from "../lib/paint.ts";
import { HAZE, LIGHT_TINT, SHADOW_TINT } from "../lib/palette.ts";

export type Card = {
  pos: [number, number, number];
  /** Normal of the painted volume (lighting). */
  nrm: [number, number, number];
  size: [number, number];
  rot?: number;
  /** Dab atlas cell: 0 leaf, 1 long stroke, 2 grass tuft, 3 cloud puff. */
  cell: number;
  color: THREE.Color;
  sway?: number;
  seed?: number;
};

export type CardMode = "billboard" | "grass" | "flat";

const VERT = /* glsl */ `
  attribute vec3 iPos; attribute vec3 iNrm; attribute vec3 iCol;
  attribute vec2 iSize; attribute float iRot; attribute float iCell; attribute float iSway; attribute float iSeed;
  uniform float uTime; uniform float uGust; uniform float uMode; uniform vec3 uOffset; uniform vec3 uWind;
  varying vec2 vUv; varying vec3 vN; varying vec3 vCol; varying float vSeed; varying float vCell; varying float vDepth; varying float vH;
  void main() {
    vec3 camR = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 camU = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec2 p = position.xy;
    vec3 base = iPos + uOffset;
    vec3 wp;
    float h = p.y + 0.5;
    if (uMode > 1.5) {
      // flat: lies in the xz plane (glints on the sea)
      float c = cos(iRot), s = sin(iRot);
      vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y) * iSize;
      wp = base + vec3(q.x, 0.0, q.y);
    } else if (uMode > 0.5) {
      // grass: a cylindrical billboard rooted at its base, bending with the wind from the root up
      vec3 right = normalize(vec3(camR.x, 0.0, camR.z));
      float sw = sin(uTime * 1.7 + base.x * 0.9 + base.z * 0.55 + iSeed * 6.0) * 0.55
               + sin(uTime * 3.1 + base.x * 2.3 + iSeed * 3.0) * 0.2 + uGust;
      vec3 bend = uWind * sw * iSway * h * h;
      wp = base + right * (p.x * iSize.x) + vec3(0.0, h * iSize.y, 0.0) + bend * iSize.y;
      wp.y -= dot(bend, bend) * iSize.y * 0.6;
    } else {
      float c = cos(iRot), s = sin(iRot);
      vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y) * iSize;
      vec3 jig = vec3(sin(uTime * 2.1 + iSeed * 20.0), sin(uTime * 2.7 + iSeed * 13.0) * 0.5, cos(uTime * 1.9 + iSeed * 9.0)) * iSway * (0.6 + uGust * 0.6);
      wp = base + camR * q.x + camU * q.y + jig;
    }
    // nudge each card along the view axis by its seed so overlapping marks never z-fight
    vec3 camF = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
    wp += camF * (iSeed - 0.5) * 0.25 * max(iSize.x, iSize.y);
    vUv = uv; vN = iNrm; vCol = iCol; vSeed = iSeed; vCell = iCell; vH = h;
    vec4 mv = viewMatrix * vec4(wp, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uDab; uniform vec3 uSun; uniform vec3 uHaze; uniform vec3 uShTint; uniform vec3 uLtTint;
  uniform float uBands; uniform float uBreak; uniform float uLift; uniform float uHazeNear; uniform float uHazeFar; uniform float uHazeMax;
  uniform float uCut; uniform float uMode; uniform float uWrap; uniform float uSoft; uniform float uJitter;
  varying vec2 vUv; varying vec3 vN; varying vec3 vCol; varying float vSeed; varying float vCell; varying float vDepth; varying float vH;
  ${PAINT_GLSL}
  void main() {
    vec2 cellOff = vec2(mod(vCell, 2.0), floor(vCell / 2.0)) * 0.5;
    vec2 uv = clamp(vUv, 0.004, 0.996);
    vec4 d = texture2D(uDab, cellOff + uv * 0.5);
    // hard cut for depth-writing marks; soft loaded-brush edge for blended layers (clouds)
    float alpha = uSoft > 0.5 ? smoothstep(uCut - 0.25, uCut + 0.12, d.r) : 1.0;
    if (uSoft < 0.5 && d.r < uCut) discard;
    if (alpha < 0.01) discard;
    float lam = dot(normalize(vN), uSun);
    float x = mix(clamp(lam, 0.0, 1.0), lam * 0.5 + 0.5, uWrap);
    x += (d.g - 0.5) * uBreak + (vSeed - 0.5) * uJitter + uLift;
    // grass: roots sit in the shade of the clump, tips catch the light
    if (uMode > 0.5 && uMode < 1.5) x += (vH - 0.5) * 0.35;
    float q = paintBands(clamp(x, 0.0, 1.0), uBands, 0.12);
    vec3 col = paintRamp(vCol, q, uShTint, uLtTint);
    float hz = smoothstep(uHazeNear, uHazeFar, vDepth) * uHazeMax;
    col = mix(col, uHaze, hz);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function cardUniforms(mode: CardMode) {
  return {
    uDab: { value: dabAtlas(5) },
    uSun: { value: sunVector() },
    uHaze: { value: new THREE.Color(HAZE.color) },
    uHazeNear: { value: HAZE.near },
    uHazeFar: { value: HAZE.far },
    uHazeMax: { value: 0.85 },
    uShTint: { value: new THREE.Vector3(...SHADOW_TINT) },
    uLtTint: { value: new THREE.Vector3(...LIGHT_TINT) },
    uBands: { value: 4 },
    uBreak: { value: 0.3 },
    uLift: { value: 0 },
    uCut: { value: 0.45 },
    uWrap: { value: 0.6 },
    uSoft: { value: 0 },
    uJitter: { value: 0.22 },
    uMode: { value: mode === "grass" ? 1 : mode === "flat" ? 2 : 0 },
    uTime: { value: 0 },
    uGust: { value: 0.5 },
    uOffset: { value: new THREE.Vector3() },
    uWind: { value: new THREE.Vector3(0.55, 0, -0.2) },
  };
}

export const StrokeCards: React.FC<{
  cards: Card[];
  mode?: CardMode;
  t: number;
  gust?: number;
  offset?: [number, number, number];
  lift?: number;
  bands?: number;
  breakup?: number;
  hazeMax?: number;
  wrap?: number;
  cut?: number;
  renderOrder?: number;
  /** Off for distant layers (clouds): marks then overlap in draw order like real paint. */
  depthWrite?: boolean;
  /** Soft, alpha-blended brush edges (needs depthWrite off). */
  soft?: boolean;
  /** Per-mark value jitter (lower = calmer masses). */
  jitter?: number;
}> = ({ cards, mode = "billboard", t, gust = 0.5, offset, lift = 0, bands = 4, breakup = 0.3, hazeMax = 0.85, wrap = 0.6, cut = 0.45, renderOrder, depthWrite = true, soft = false, jitter = 0.22 }) => {
  const geo = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = plane.index;
    g.setAttribute("position", plane.getAttribute("position"));
    g.setAttribute("uv", plane.getAttribute("uv"));
    const n = cards.length;
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const size = new Float32Array(n * 2), rot = new Float32Array(n), cell = new Float32Array(n), sway = new Float32Array(n), seed = new Float32Array(n);
    cards.forEach((c, i) => {
      pos.set(c.pos, i * 3);
      nrm.set(c.nrm, i * 3);
      col.set([c.color.r, c.color.g, c.color.b], i * 3);
      size.set(c.size, i * 2);
      rot[i] = c.rot ?? 0;
      cell[i] = c.cell;
      sway[i] = c.sway ?? 0;
      seed[i] = c.seed ?? (i * 0.6180339) % 1;
    });
    g.setAttribute("iPos", new THREE.InstancedBufferAttribute(pos, 3));
    g.setAttribute("iNrm", new THREE.InstancedBufferAttribute(nrm, 3));
    g.setAttribute("iCol", new THREE.InstancedBufferAttribute(col, 3));
    g.setAttribute("iSize", new THREE.InstancedBufferAttribute(size, 2));
    g.setAttribute("iRot", new THREE.InstancedBufferAttribute(rot, 1));
    g.setAttribute("iCell", new THREE.InstancedBufferAttribute(cell, 1));
    g.setAttribute("iSway", new THREE.InstancedBufferAttribute(sway, 1));
    g.setAttribute("iSeed", new THREE.InstancedBufferAttribute(seed, 1));
    g.instanceCount = n;
    return g;
  }, [cards]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ uniforms: cardUniforms(mode), vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, depthWrite, transparent: soft }),
    [mode, depthWrite, soft],
  );
  const u = mat.uniforms;
  u.uTime.value = t;
  u.uGust.value = gust;
  u.uLift.value = lift;
  u.uBands.value = bands;
  u.uBreak.value = breakup;
  u.uHazeMax.value = hazeMax;
  u.uWrap.value = wrap;
  u.uCut.value = cut;
  u.uSoft.value = soft ? 1 : 0;
  u.uJitter.value = jitter;
  (u.uOffset.value as THREE.Vector3).set(...(offset ?? [0, 0, 0]));
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={renderOrder} />;
};
