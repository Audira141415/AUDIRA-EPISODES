// A carved wooden panel. The relief is real geometry: a dense plane displaced in the vertex shader
// from the relief data (lib/relief.ts), with normals from finite differences, so light rakes across
// every leaf and shoulder. `reveal` (0..1) is how far the chisel has gone; fresh cuts are paler and
// matte until `oil` (0..1) darkens and polishes the whole panel.
//
//   <ReliefPanel3D relief={floralPanel(3)} size={[1.6, 1.0]} reveal={k} oil={o} species="jati" />

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { WOOD, type Species } from "../lib/palette.ts";
import type { Relief } from "../lib/relief.ts";
import { woodFinish, woodTexture } from "../lib/wood.ts";

export const ReliefPanel3D: React.FC<{
  relief: Relief;
  /** Panel face in world units (width, height). */
  size: [number, number];
  reveal?: number;
  oil?: number;
  /** Carve depth in world units. */
  depth?: number;
  thickness?: number;
  species?: Species;
  seed?: number;
  /** Segments along the long side (density of the relief mesh). */
  detail?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Draw the backing slab (off for block faces glued to a body). */
  slab?: boolean;
  /** Paint the cut-away background this colour (toy blocks); the raised motif stays bare wood. */
  paint?: string;
}> = ({ relief, size, reveal = 1, oil = 0, depth = 0.035, thickness = 0.06, species = "jati", seed = 3, detail = 384, position, rotation, slab = true, paint }) => {
  const [W, H] = size;
  const wood = woodTexture(species, seed);
  const geo = useMemo(() => {
    const sx = W >= H ? detail : Math.round((detail * W) / H);
    const sy = W >= H ? Math.round((detail * H) / W) : detail;
    return new THREE.PlaneGeometry(W, H, sx, sy);
  }, [W, H, detail]);
  const uniforms = useMemo(
    () => ({
      uData: { value: relief.tex },
      uReveal: { value: reveal },
      uOil: { value: oil },
      uDepth: { value: depth },
      uTexel: { value: new THREE.Vector2(1 / relief.w, 1 / relief.h) },
      uSize: { value: new THREE.Vector2(W, H) },
      uFresh: { value: new THREE.Color(WOOD[species].fresh) },
      uPaint: { value: new THREE.Color(paint ?? "#000000") },
      uPaintOn: { value: paint ? 1 : 0 },
    }),
    [relief, W, H, species, paint],
  );
  uniforms.uReveal.value = reveal;
  uniforms.uOil.value = oil;
  uniforms.uDepth.value = depth;

  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ map: wood.map, ...woodFinish(false), color: "#ffffff" });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uniforms);
      const eff = `
        uniform sampler2D uData; uniform float uReveal, uDepth; uniform vec2 uTexel, uSize;
        varying vec2 vRUv; varying float vDepth, vCut;
        float carved(vec2 p){ vec4 d = texture2D(uData, p); return smoothstep(d.g - 0.012, d.g, uReveal); }
        float effH(vec2 p){ vec4 d = texture2D(uData, p); return (d.r - 1.0) * uDepth * carved(p); }`;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", `#include <common>\n${eff}`)
        .replace(
          "#include <beginnormal_vertex>",
          `vec2 e = uTexel * 1.5;
          float hx = (effH(uv + vec2(e.x, 0.0)) - effH(uv - vec2(e.x, 0.0))) / (2.0 * e.x * uSize.x);
          float hy = (effH(uv + vec2(0.0, e.y)) - effH(uv - vec2(0.0, e.y))) / (2.0 * e.y * uSize.y);
          vec3 objectNormal = normalize(vec3(-hx, -hy, 1.0));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
          #endif`,
        )
        .replace(
          "#include <begin_vertex>",
          `vec3 transformed = vec3( position );
          float h0 = effH(uv);
          transformed.z += h0;
          vRUv = uv; vDepth = -h0 / max(uDepth, 1e-5); vCut = carved(uv);`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform sampler2D uData; uniform float uOil, uPaintOn; uniform vec3 uFresh, uPaint;
          varying vec2 vRUv; varying float vDepth, vCut;`,
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          vec4 rd = texture2D(uData, vRUv);
          // Fresh cut: paler wood with gouge facets; cavities darken (dust, then oil pooling).
          float fresh = vCut * smoothstep(0.03, 0.25, vDepth);
          vec3 cut = uFresh * (0.8 + (rd.b - 0.5) * 0.3);
          diffuseColor.rgb = mix(diffuseColor.rgb, mix(cut, diffuseColor.rgb * 0.9, uOil * 0.75), fresh);
          diffuseColor.rgb *= mix(1.0, 0.55, smoothstep(0.45, 1.0, vDepth) * vCut);
          diffuseColor.rgb *= mix(1.0, 0.7, uOil);
          diffuseColor.rgb = mix(diffuseColor.rgb, uPaint * (0.92 + (rd.b - 0.5) * 0.1), uPaintOn * smoothstep(0.55, 0.85, vDepth) * vCut);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor, 0.4, uOil);`,
        );
    };
    m.customProgramCacheKey = () => "ukir-relief";
    return m;
  }, [wood.map, uniforms]);
  mat.clearcoat = oil * 0.45;

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {slab && (
        // The slab sits below the deepest cut, or it would cover the carved background.
        <mesh position={[0, 0, -depth - thickness / 2 - 0.001]} castShadow receiveShadow>
          <RoundedBoxGeo args={[W + 0.004, H + 0.004, thickness]} radius={0.006} />
          <meshPhysicalMaterial map={wood.map} {...woodFinish(oil > 0.5)} color={oil > 0.5 ? "#b8a089" : "#ffffff"} />
        </mesh>
      )}
    </group>
  );
};
