// EP04 film: plinth marble with veins that read at gallery distance (jury round 2: plinths read as
// flat cream plastic). Copy of the MARBLEMUSEUM world-space vein shader (kit untouched), with
// larger, darker grey veins, a faint gold secondary vein and polish (roughness 0.3, light clearcoat
// with streaky clearcoat roughness). World-space, seeded hash only: identical in every render tab.
import * as THREE from "three";

const GLSL = /* glsl */ `
  varying vec3 vMPos;
  float eHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float eNoise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(eHash(i + vec3(0,0,0)), eHash(i + vec3(1,0,0)), f.x), mix(eHash(i + vec3(0,1,0)), eHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(eHash(i + vec3(0,0,1)), eHash(i + vec3(1,0,1)), f.x), mix(eHash(i + vec3(0,1,1)), eHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float eFbm(vec3 p){ float a = 0.5; float s = 0.0; for (int k = 0; k < 5; k++){ s += a * eNoise(p); p *= 2.03; a *= 0.5; } return s; }
  float veinMask(vec3 p, float scale){
    p *= scale;
    float n = eFbm(p * 1.4);
    float v1 = abs(sin((p.x * 1.1 + p.y * 2.3 + p.z * 0.7) * 2.2 + n * 6.5));
    float v2 = abs(sin((p.x * -1.6 + p.y * 0.8 + p.z * 1.4) * 4.6 + eFbm(p * 2.7) * 8.0));
    return (1.0 - smoothstep(0.0, 0.085, v1)) * 0.9 + (1.0 - smoothstep(0.0, 0.04, v2)) * 0.45;
  }
  float goldMask(vec3 p, float scale){
    p *= scale * 0.7;
    float g = abs(sin((p.x * 0.9 - p.y * 1.7 + p.z * 1.2) * 1.6 + eFbm(p * 1.9 + 7.0) * 7.5));
    return 1.0 - smoothstep(0.0, 0.03, g);
  }
`;

export const makeVeinedMarble = (opts: { color?: string; scale?: number; strength?: number; gold?: number } = {}) => {
  const mat = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? "#D9D2C5",
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.25,
    sheen: 0.12,
    sheenColor: new THREE.Color("#FFF1DE"),
    sheenRoughness: 0.6,
  });
  const scale = (opts.scale ?? 1.5).toFixed(3);
  const strength = (opts.strength ?? 0.95).toFixed(3);
  const gold = (opts.gold ?? 0.55).toFixed(3);
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vMPos;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\n vMPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${GLSL}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         float vm = clamp(veinMask(vMPos, ${scale}) * ${strength}, 0.0, 0.85);
         float cloud = 0.9 + 0.1 * eFbm(vMPos * ${scale} * 0.9 + 3.0);
         vec3 veinCol = mix(vec3(0.36, 0.38, 0.42), vec3(0.50, 0.44, 0.37), eNoise(vMPos * 1.3));
         diffuseColor.rgb = mix(diffuseColor.rgb * cloud, veinCol, vm);
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.60, 0.28), goldMask(vMPos, ${scale}) * ${gold});`,
      )
      // polish streaks: roughness varies along the stone
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
         roughnessFactor = clamp(roughnessFactor + (eNoise(vMPos * vec3(2.0, 18.0, 2.0)) - 0.5) * 0.18, 0.12, 0.6);`,
      );
  };
  mat.customProgramCacheKey = () => `ep04-vein-${scale}-${strength}-${gold}`;
  return mat;
};
