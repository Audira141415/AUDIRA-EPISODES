// Molten bronze: an unlit HDR shader (bloom picks it up) with a hot white-yellow core, orange
// edges at grazing angles and noise that flows along the stream. Plus the tapered stream tube.
//
//   const stream = streamGeometry(points, 0.024, 0.014);
//   const mat = moltenMaterial("core");     // set mat.uniforms.uTime / uCut / uWidth each frame
//   const halo = moltenMaterial("halo");    // additive glow shell, put it on FX_LAYER

import * as THREE from "three";

const NOISE = /* glsl */ `
  float mHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float mNoise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(mHash(i), mHash(i + vec3(1,0,0)), f.x), mix(mHash(i + vec3(0,1,0)), mHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(mHash(i + vec3(0,0,1)), mHash(i + vec3(1,0,1)), f.x), mix(mHash(i + vec3(0,1,1)), mHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
`;

/** Tube along a polyline with radius tapering r0 → r1; `aCenter` lets the shader pulse the radius. */
export function streamGeometry(points: THREE.Vector3[], r0: number, r1: number, segs = 96, radial = 18) {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], cen: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const P = curve.getPointAt(u);
    const r = r0 + (r1 - r0) * Math.sqrt(u);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const n = frames.normals[i].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
      pos.push(P.x + n.x * r, P.y + n.y * r, P.z + n.z * r);
      nor.push(n.x, n.y, n.z);
      uv.push(u, j / radial);
      cen.push(P.x, P.y, P.z);
    }
  }
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aCenter", new THREE.Float32BufferAttribute(cen, 3));
  g.setIndex(idx);
  return g;
}

export type MoltenKind = "core" | "halo" | "pool";

/** HDR molten material. Uniforms: uTime (s), uCut (0..1 hide from the top), uWidth, uGlow. */
export function moltenMaterial(kind: MoltenKind) {
  const uniforms = { uTime: { value: 0 }, uCut: { value: 0 }, uWidth: { value: 1 }, uGlow: { value: 1 } };
  const halo = kind === "halo";
  const tube = kind !== "pool";
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: halo,
    depthWrite: !halo,
    blending: halo ? THREE.AdditiveBlending : THREE.NormalBlending,
    side: halo ? THREE.BackSide : THREE.FrontSide,
    toneMapped: false,
    vertexShader: /* glsl */ `
      ${tube ? "attribute vec3 aCenter;" : ""}
      uniform float uTime, uWidth;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vUv = uv;
        vec3 p = position;
        ${tube ? `float pulse = 1.0 + 0.16 * sin(uv.x * 46.0 - uTime * 26.0) + 0.06 * sin(uv.x * 13.0 - uTime * 11.0);
        p = aCenter + (position - aCenter) * uWidth * pulse * ${halo ? "2.6" : "1.0"};` : ""}
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uCut, uGlow;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      ${NOISE}
      void main(){
        ${tube ? "if (vUv.x < uCut) discard;" : ""}
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        ${
          kind === "pool"
            ? `vec2 q = vUv - 0.5; float r = length(q) * 2.0;
               float churn = mNoise(vec3(q * 9.0, uTime * 1.6)) * 0.6 + mNoise(vec3(q * 23.0 + 4.0, uTime * 2.4)) * 0.4;
               float crust = smoothstep(0.55, 0.75, churn) * smoothstep(0.2, 1.0, r);
               vec3 c = mix(vec3(5.0, 3.4, 1.6), vec3(2.4, 0.7, 0.12), smoothstep(0.1, 1.0, r));
               c = mix(c, vec3(0.5, 0.08, 0.02), crust * 0.7);
               gl_FragColor = vec4(c * uGlow, 1.0);`
            : halo
              ? `float a = pow(facing, 3.0) * 0.16 * uGlow;
                 gl_FragColor = vec4(vec3(1.6, 0.55, 0.12) * a, a);`
              : `float flow = mNoise(vec3(vUv.x * 22.0 - uTime * 9.0, vUv.y * 5.0, 1.0)) * 0.65 + mNoise(vec3(vUv.x * 60.0 - uTime * 14.0, vUv.y * 11.0, 3.0)) * 0.35;
                 float edge = pow(max(1.0 - facing, 0.0), 1.6);
                 vec3 c = mix(vec3(3.6, 2.3, 1.0), vec3(2.4, 0.6, 0.1), clamp(edge * 1.1 + (flow - 0.5) * 0.6, 0.0, 1.0));
                 c *= 0.8 + 0.45 * flow;
                 gl_FragColor = vec4(c * uGlow, 1.0);`
        }
      }`,
  });
}
