// Bronze material: real metal PBR (metalness 1) with one shader that covers the whole life of a
// casting, driven by four uniforms:
//   uHeat    0..1  blackbody glow (white-orange → red → dark); thin parts (aThick low) cool first
//   uFront         polishing front in local y: as-cast oxide below, bright polished bronze above
//   uPatina  0..1  ageing: the body browns, verdigris grows out of the crevices (aCav), raised
//                  edges (aConv) stay rubbed gold
//   uBand    0..1  brightness of the warm buffing line riding the polishing front
// Geometry supplies aCav / aConv / aThick (lib/sculpture.ts) or a relief height map (plaques), from
// which the same values are derived in the vertex shader.
//
//   const { material, uniforms } = makeBronzeMaterial();                // statue
//   const plaque = makeBronzeMaterial({ relief: tex, size: [0.6, 0.22], depth: 0.012 });

import * as THREE from "three";
import { BRONZE } from "./palette.ts";

const NOISE = /* glsl */ `
  float bfHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float bfNoise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(bfHash(i), bfHash(i + vec3(1,0,0)), f.x), mix(bfHash(i + vec3(0,1,0)), bfHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(bfHash(i + vec3(0,0,1)), bfHash(i + vec3(1,0,1)), f.x), mix(bfHash(i + vec3(0,1,1)), bfHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float bfFbm(vec3 p){ float a = 0.5, s = 0.0; for (int k = 0; k < 4; k++){ s += a * bfNoise(p); p *= 2.07; a *= 0.5; } return s; }
  vec3 bfBlackbody(float h){
    vec3 c = mix(vec3(0.55, 0.03, 0.0), vec3(1.0, 0.3, 0.03), smoothstep(0.0, 0.55, h));
    return mix(c, vec3(1.0, 0.8, 0.5), smoothstep(0.6, 1.0, h));
  }
`;

export type BronzeUniforms = {
  uHeat: { value: number };
  uFront: { value: number };
  uPatina: { value: number };
  uBand: { value: number };
};

export function makeBronzeMaterial(opts: { relief?: THREE.Texture; size?: [number, number]; depth?: number; texel?: [number, number]; key?: string } = {}) {
  const uniforms = {
    uHeat: { value: 0 },
    uFront: { value: -10 },
    uPatina: { value: 0 },
    uBand: { value: 0 },
    uRaw: { value: new THREE.Color(BRONZE.raw) },
    uRawScale: { value: new THREE.Color(BRONZE.rawScale) },
    uPolished: { value: new THREE.Color(BRONZE.polished) },
    uRubbed: { value: new THREE.Color(BRONZE.rubbed) },
    uBrown: { value: new THREE.Color(BRONZE.brown) },
    uVerd: { value: new THREE.Color(BRONZE.verdigris) },
    uVerdDeep: { value: new THREE.Color(BRONZE.verdigrisDeep) },
    uCrust: { value: new THREE.Color(BRONZE.verdigrisCrust) },
    uRelief: { value: opts.relief ?? null },
    uSize: { value: new THREE.Vector2(...(opts.size ?? [1, 1])) },
    uDepth: { value: opts.depth ?? 0 },
    uTexel: { value: new THREE.Vector2(...(opts.texel ?? [1 / 512, 1 / 512])) },
  };
  const relief = !!opts.relief;
  const material = new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 1, roughness: 0.3, envMapIntensity: 1 });
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    const vHead = /* glsl */ `
      varying vec3 vLocal; varying float vCav, vConv, vThick;
      ${relief ? "uniform sampler2D uRelief; uniform vec2 uSize, uTexel; uniform float uDepth;" : "attribute float aCav, aConv, aThick;"}`;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", `#include <common>\n${vHead}`);
    if (relief) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `vec2 e = uTexel * 1.5;
          float hx = (texture2D(uRelief, uv + vec2(e.x, 0.0)).r - texture2D(uRelief, uv - vec2(e.x, 0.0)).r) * uDepth / (2.0 * e.x * uSize.x);
          float hy = (texture2D(uRelief, uv + vec2(0.0, e.y)).r - texture2D(uRelief, uv - vec2(0.0, e.y)).r) * uDepth / (2.0 * e.y * uSize.y);
          vec3 objectNormal = normalize(vec3(-hx, -hy, 1.0));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
          #endif`,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `vec4 rd = texture2D(uRelief, uv);
          vec3 transformed = vec3(position);
          transformed.z += rd.r * uDepth;
          vLocal = vec3(position.xy * 3.0, rd.r);
          vCav = clamp((1.0 - rd.r) * 0.75 + rd.g * 0.6, 0.0, 1.0);
          vConv = clamp(rd.b * 1.4, 0.0, 1.0);
          vThick = 1.0;`,
        );
    } else {
      sh.vertexShader = sh.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n vLocal = position; vCav = aCav; vConv = aConv; vThick = aThick;",
      );
    }
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uHeat, uFront, uPatina, uBand;
        uniform vec3 uRaw, uRawScale, uPolished, uRubbed, uBrown, uVerd, uVerdDeep, uCrust;
        varying vec3 vLocal; varying float vCav, vConv, vThick;
        float bfRough, bfMetal; vec3 bfEmit;
        ${NOISE}`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        float n1 = bfFbm(vLocal * 9.0);
        float n2 = bfFbm(vLocal * 34.0 + 7.0);
        float n3 = bfNoise(vLocal * 90.0);
        // As-cast skin: dark oxide with fire scale.
        vec3 raw = mix(uRaw, uRawScale, smoothstep(0.35, 0.75, n1)) * (0.85 + 0.3 * n3);
        float rawR = 0.5 + 0.25 * n2;
        // Polished bronze, with brushed variation in brightness and roughness.
        vec3 pol = uPolished * (0.9 + 0.18 * n2);
        float polR = 0.14 + 0.12 * n1 + 0.05 * n3;
        float pk = smoothstep(uFront - 0.02, uFront + 0.02, vLocal.y);
        vec3 metal = mix(raw, pol, pk);
        float rough = mix(rawR, polR, pk);
        // Age: statuary brown everywhere except the rubbed, raised edges.
        float rub = smoothstep(0.2, 0.7, vConv + (n2 - 0.5) * 0.3);
        float brown = uPatina * (1.0 - rub * 0.9);
        metal = mix(metal, uBrown * (0.8 + 0.4 * n1), brown * 0.88);
        metal = mix(metal, uRubbed, uPatina * rub * 0.55);
        rough = mix(rough, 0.38 + 0.18 * n1, brown * 0.85);
        // Verdigris grows out of the crevices first.
        float fieldV = vCav * 1.1 + (n1 - 0.5) * 0.6 + (n2 - 0.5) * 0.25 - vConv * 0.4 + (1.0 - clamp(vLocal.y, 0.0, 1.2)) * 0.06;
        float thr = mix(1.3, 0.22, uPatina);
        float vg = smoothstep(thr, thr + 0.1, fieldV) * step(0.002, uPatina);
        vec3 verd = mix(uVerdDeep, uVerd, smoothstep(0.25, 0.8, n2 + (fieldV - thr) * 0.4));
        verd = mix(verd, uCrust, smoothstep(0.35, 0.9, fieldV - thr + (n3 - 0.5) * 0.3) * 0.55);
        // Heat: thin parts cool first.
        float hv = clamp((uHeat - (1.0 - vThick) * 0.45) / 0.55, 0.0, 1.0);
        vec3 hot = mix(metal, raw * 0.6, smoothstep(0.0, 0.3, uHeat));
        diffuseColor.rgb = mix(hot, verd, vg);
        bfMetal = mix(1.0, 0.0, vg);
        bfRough = mix(mix(rough, 0.7, smoothstep(0.0, 0.3, uHeat)), 0.82, vg);
        bfEmit = bfBlackbody(hv * 0.68) * pow(hv, 1.6) * (0.7 + 1.1 * hv) * (0.7 + 0.6 * n1) * (0.55 + 0.45 * (1.0 - vCav));
        bfEmit += vec3(1.0, 0.62, 0.3) * exp(-abs(vLocal.y - uFront) * 70.0) * uBand * 1.6;`,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n roughnessFactor = bfRough;")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n metalnessFactor = bfMetal;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n float bfFace = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);\n totalEmissiveRadiance += bfEmit * (0.35 + 0.65 * bfFace);");
  };
  material.customProgramCacheKey = () => `bronzeforge-${relief ? "relief" : "statue"}-${opts.key ?? ""}`;
  return { material, uniforms: uniforms as typeof uniforms & BronzeUniforms };
}
