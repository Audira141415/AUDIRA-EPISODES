// The thrown piece. Real lathe geometry rebuilt from the profile as it is thrown (lump -> cylinder
// -> vase, throwing rings as ridges), shaded by one physical material whose fragment shader blends
// four surfaces: wet clay (dark, clearcoat-glossy), leather-hard clay (pale, matte), raw glaze
// (chalky) that fires to a glossy teal with crackle, iron specks and thick beads at the drip ends,
// plus cream brushed lettering and a kiln-heat glow. The unglazed foot fires to matte terracotta.
//
//   <Vessel3D k={throwK(t)} open={openK(t)} dry={dryAt(t)} glaze={glazeAt(t)} drip={dripAt(t)}
//             paint={paintAt(t)} heat={heatAt(t)} fired={firedAt(t)} word="AUDIRA" letterU={0.08} />

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CLAY, GLAZE } from "../lib/palette.ts";
import { thrownProfile } from "../lib/profile.ts";
import { clayDetail, letterTexture } from "../lib/textures.ts";

export type VesselProps = {
  k: number;
  open: number;
  dry?: number;
  glaze?: number;
  drip?: number;
  paint?: number;
  heat?: number;
  fired?: number;
  /** Ring ridge strength (1 = fresh throwing rings). */
  rings?: number;
  word?: string;
  /** Centre of the lettering around the piece (0..1 of a turn, 0 = facing +z at rest). */
  letterU?: number;
  /** Lettering band, as normalised heights on the piece. */
  letterBand?: [number, number];
  segments?: number;
};

export const Vessel3D: React.FC<VesselProps> = ({
  k, open, dry = 0, glaze = 0, drip = 0, paint = 0, heat = 0, fired = 0, rings = 1, word = "AUDIRA", letterU = 0.08, letterBand = [0.42, 0.56], segments = 160,
}) => {
  // Quantise so the static tail of the film reuses one geometry.
  const qk = Math.round(k * 2000) / 2000, qo = Math.round(open * 2000) / 2000;
  const prof = useMemo(() => thrownProfile(qk, qo, rings), [qk, qo, rings]);
  const geo = useMemo(() => new THREE.LatheGeometry(prof.points, segments), [prof, segments]);
  useEffect(() => () => geo.dispose(), [geo]);

  const detail = clayDetail();
  const letters = letterTexture(word);
  const uniforms = useMemo(
    () => ({
      uDetail: { value: detail },
      uText: { value: letters },
      uHeight: { value: 0.1 },
      uOuterEnd: { value: 0.5 },
      uDry: { value: 0 },
      uGlaze: { value: 0 },
      uDrip: { value: 0 },
      uPaint: { value: 0 },
      uHeat: { value: 0 },
      uFired: { value: 0 },
      uUc: { value: letterU },
      uHalfW: { value: 0.13 },
      uH0: { value: letterBand[0] },
      uH1: { value: letterBand[1] },
      uWet: { value: new THREE.Color(CLAY.wet) },
      uDryC: { value: new THREE.Color(CLAY.dry) },
      uFiredC: { value: new THREE.Color(CLAY.fired) },
      uRaw: { value: new THREE.Color(GLAZE.raw) },
      uThin: { value: new THREE.Color(GLAZE.thin) },
      uThick: { value: new THREE.Color(GLAZE.thick) },
      uPaintC: { value: new THREE.Color(GLAZE.paint) },
    }),
    [detail, letters, letterU, letterBand[0], letterBand[1]],
  );
  uniforms.uHeight.value = prof.height;
  uniforms.uOuterEnd.value = prof.outerEnd;
  uniforms.uDry.value = dry;
  uniforms.uGlaze.value = glaze;
  uniforms.uDrip.value = drip;
  uniforms.uPaint.value = paint;
  uniforms.uHeat.value = heat;
  uniforms.uFired.value = fired;

  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1, bumpMap: detail, bumpScale: 0.5, sheen: 0.15, sheenRoughness: 0.7 });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", `#include <common>\nuniform float uHeight; varying vec2 vGUv; varying float vH;`)
        .replace("#include <begin_vertex>", `#include <begin_vertex>\nvGUv = uv; vH = position.y / uHeight;`);
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform sampler2D uDetail, uText;
          uniform float uDry, uGlaze, uDrip, uPaint, uHeat, uFired, uOuterEnd, uUc, uHalfW, uH0, uH1;
          uniform vec3 uWet, uDryC, uFiredC, uRaw, uThin, uThick, uPaintC;
          varying vec2 vGUv; varying float vH;
          float gHash(float x){ return fract(sin(x * 127.1 + 3.7) * 43758.5453); }
          vec2 gHash2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
          // Crackle: thin cell borders (F2 - F1), periodic around the piece.
          float crackle(vec2 p, float period){
            vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
            for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
              vec2 g = vec2(float(x), float(y)); vec2 c = i + g; c.x = mod(c.x, period);
              vec2 r = g + gHash2(c) - f; float d = dot(r, r);
              if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
            }
            return 1.0 - smoothstep(0.0, 0.05, sqrt(d2) - sqrt(d1));
          }`,
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          float gu = vGUv.x; float gh = clamp(vH, 0.0, 1.0);
          float outer = step(vGUv.y, uOuterEnd + 0.002);
          vec4 det = texture2D(uDetail, vec2(gu, gh));
          float ring = det.r, spk = det.g, stk = det.b;
          // Clay body: wet -> leather-hard -> fired terracotta.
          vec3 wetC = uWet * (0.88 + 0.22 * ring) * (0.85 + 0.3 * stk);
          vec3 dryC = uDryC * (0.9 + 0.14 * ring) * (1.0 - 0.3 * spk);
          vec3 firC = uFiredC * (0.86 + 0.24 * ring) * (1.0 - 0.45 * spk);
          vec3 clay = mix(mix(wetC, dryC, uDry), firC, uFired);
          // Glaze front: poured from the rim, drips run further down in fingers.
          float cells = 56.0; float cu = gu * cells; float ci = floor(cu); float fu = fract(cu);
          float w = 0.16 + 0.26 * gHash(ci + 1.3);
          float finger = smoothstep(w, 0.0, abs(fu - 0.5));
          float len = pow(gHash(ci + 7.1), 2.0) * 0.2 + 0.015;
          float wav = 0.035 * sin(gu * 6.2832 * 3.0 + 1.0) + 0.02 * sin(gu * 6.2832 * 7.0 + 2.0);
          float front = uGlaze * (0.7 + wav) + uDrip * len * finger;
          float dd = 1.0 - gh;
          float cov = outer > 0.5 ? smoothstep(front + 0.006, front - 0.006, dd) : smoothstep(0.05, 0.25, uGlaze);
          cov *= step(0.001, uGlaze);
          float bead = cov * smoothstep(0.06, 0.0, front - dd) * outer;
          float thick = clamp(0.55 + bead * 0.6 - (ring - 0.5) * 0.35 + (stk - 0.5) * 0.4, 0.0, 1.0);
          vec3 gl = mix(uThin, uThick, thick);
          float ck = crackle(vec2(gu * 72.0, gh * 20.0), 72.0);
          gl *= 1.0 - 0.18 * ck;
          gl = mix(gl, vec3(0.08, 0.055, 0.04), clamp(spk * 1.2, 0.0, 1.0) * 0.45);
          vec3 raw = uRaw * (0.78 + 0.16 * stk) * (1.0 - 0.06 * bead);
          vec3 glz = mix(raw, gl, uFired);
          // Brushed lettering on the glaze (wrap-safe around the piece), letter by letter.
          float du = fract(gu - uUc + 0.5) - 0.5;
          vec2 tuv = vec2(du / (2.0 * uHalfW) + 0.5, (gh - uH0) / (uH1 - uH0));
          float inR = step(0.0, tuv.x) * step(tuv.x, 1.0) * step(0.0, tuv.y) * step(tuv.y, 1.0) * outer;
          float txt = texture2D(uText, clamp(tuv, 0.0, 1.0)).a * inR * smoothstep(tuv.x - 0.04, tuv.x, uPaint * 1.06);
          glz = mix(glz, mix(vec3(0.42, 0.27, 0.17), uPaintC, uFired), txt);
          diffuseColor.rgb = mix(clay, glz, cov) * (1.0 - 0.75 * uHeat);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
          float rClay = mix(mix(0.32, 0.86, uDry), 0.92, uFired) + (stk - 0.5) * 0.08;
          float rGl = mix(0.9, 0.08 + ck * 0.12, uFired);
          rGl = mix(rGl, mix(0.85, 0.32, uFired), txt);
          roughnessFactor = mix(rClay, rGl, cov);`,
        )
        .replace(
          "#include <lights_physical_fragment>",
          `#include <lights_physical_fragment>
          #ifdef USE_CLEARCOAT
            material.clearcoat = mix((1.0 - uDry) * (1.0 - uFired) * 0.6, uFired * (1.0 - txt * 0.6), cov);
            material.clearcoatRoughness = mix(0.22 + stk * 0.15, 0.04, cov);
          #endif`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(1.0, 0.26, 0.04) * uHeat * (0.7 + 0.7 * ring + 0.4 * stk);`,
        );
    };
    m.customProgramCacheKey = () => "gerabah-vessel";
    return m;
  }, [detail, uniforms]);
  mat.bumpScale = 0.55 * (1 - glaze * 0.5) * (1 - fired * 0.6);
  mat.sheen = 0.15 * dry;

  return <mesh geometry={geo} material={mat} castShadow receiveShadow />;
};
