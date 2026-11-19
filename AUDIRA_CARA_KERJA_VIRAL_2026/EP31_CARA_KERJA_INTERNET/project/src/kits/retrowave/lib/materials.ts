import * as THREE from "three";
import { RETROWAVE_PALETTE } from "./palette";

export function createNeonGridMaterial() {
  return new THREE.LineBasicMaterial({
    color: RETROWAVE_PALETTE.neonMagenta,
    linewidth: 2,
  });
}

/**
 * Infinite neon grid floor: anti-aliased lines drawn in the fragment shader (1 unit per cell),
 * cyan near the camera fading to magenta and into the void at the horizon. Set `uniforms.scroll`
 * to the travelled distance; it wraps every cell, so the loop is seamless.
 */
export function createSynthGridMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      scroll: { value: 0 },
      near: { value: new THREE.Color(RETROWAVE_PALETTE.synthCyan) },
      far: { value: new THREE.Color(RETROWAVE_PALETTE.neonMagenta) },
      floor: { value: new THREE.Color("#120A26") },
      fadeDist: { value: 34 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float scroll; uniform vec3 near; uniform vec3 far; uniform vec3 floor; uniform float fadeDist;
      varying vec3 vWorld;
      void main() {
        vec2 p = vec2(vWorld.x, vWorld.z + scroll);
        vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
        float line = 1.0 - min(min(g.x, g.y) / 1.4, 1.0);
        float d = clamp(-vWorld.z / fadeDist, 0.0, 1.0);
        vec3 lineCol = mix(near, far, smoothstep(0.05, 0.7, d)) * 2.2;
        vec3 col = mix(floor, lineCol, line * (1.0 - d * 0.65));
        col = mix(col, vec3(0.047, 0.031, 0.102), smoothstep(0.55, 1.0, d));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    extensions: { derivatives: true } as never,
  });
}

/** Striped synthwave sun: amber → magenta gradient with horizontal cut bands that widen downward. */
export function createSynthSunMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color("#FFD23A") },
      mid: { value: new THREE.Color(RETROWAVE_PALETTE.sunsetAmber) },
      bottom: { value: new THREE.Color(RETROWAVE_PALETTE.neonMagenta) },
      drift: { value: 0 },
    },
    transparent: true,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform float drift;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv - 0.5;
        if (length(c) > 0.5) discard;
        float y = vUv.y;
        vec3 col = y > 0.5 ? mix(mid, top, (y - 0.5) * 2.0) : mix(bottom, mid, y * 2.0);
        if (y < 0.74) {
          float band = fract(y * 9.0 + drift);
          float gap = mix(0.46, 0.05, y / 0.74);
          if (band < gap) discard;
        }
        gl_FragColor = vec4(col * 1.6, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
