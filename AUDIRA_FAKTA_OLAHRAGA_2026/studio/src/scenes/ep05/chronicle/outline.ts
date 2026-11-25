// SilhouetteOutlinePass — the CHRONICLE signature: people are flat black cut-outs standing in a lit 3D world, and
// selected figures carry a thin coloured contour (amber hero, cyan ally, crimson danger, violet tragedy …).
//
// How: one extra render of the scene into an ID mask. Every mesh tagged `userData.sil = {id, color}` draws its
// outline colour (rgb) and id (alpha); every other visible mesh only writes depth (colorWrite off for that render,
// so custom vertex shaders, alpha test and instancing still occlude correctly); transparent FX are hidden.
// A full-screen pass then draws, on each pixel, the colour of the NEAREST-IN-DEPTH figure whose silhouette lies
// within `radius` px but which does not cover the pixel itself (or covers it with a farther figure). Result: a
// contour hugging the outside of each figure, over the background and over the figures behind it, hidden where a
// wall or another figure is in front. Optional faint halo for the "lit edge" feel.

import {
  Camera, Color, DepthTexture, Material, Mesh, MeshBasicMaterial, NoBlending, Object3D, PerspectiveCamera, Scene,
  ShaderMaterial, UnsignedByteType, Vector2, WebGLRenderer, WebGLRenderTarget,
} from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";

export type SilTag = { id: number; color: string | null; gain?: number };

const OutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    tMask: { value: null },
    tDepth: { value: null },
    uTexel: { value: new Vector2(1 / 1080, 1 / 1920) },
    uR: { value: 3.4 },
    uHalo: { value: 0.3 },
    uGain: { value: 1.6 },
    uNear: { value: 0.1 },
    uFar: { value: 1000 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform sampler2D tMask; uniform sampler2D tDepth;
    uniform vec2 uTexel; uniform float uR; uniform float uHalo; uniform float uGain; uniform float uNear; uniform float uFar;
    varying vec2 vUv;
    float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec4 m0 = texture2D(tMask, vUv);
      float d0 = lin(texture2D(tDepth, vUv).x);
      float hr = uR * 2.4;
      float best = 1e4; vec3 col = vec3(0.0); float bestD = 1e9;
      for (int y = -8; y <= 8; y++) {
        for (int x = -8; x <= 8; x++) {
          vec2 o = vec2(float(x), float(y));
          float r = length(o);
          if (r > hr + 0.5) continue;
          vec2 uv = vUv + o * uTexel;
          vec4 m = texture2D(tMask, uv);
          if (m.a < 0.002) continue;                       // no figure there
          if (abs(m.a - m0.a) < 0.002) continue;           // same figure as this pixel
          if (m.r + m.g + m.b < 0.004) continue;           // figure without a contour
          float d = lin(texture2D(tDepth, uv).x);
          if (d > d0 * 0.997 - 0.01) continue;             // that figure must be in front of this pixel
          // nearest figure in depth wins where two contours meet
          if (r < best - 0.75 || (r < best + 0.75 && d < bestD)) { best = min(r, best); col = m.rgb; bestD = d; }
        }
      }
      float line = 1.0 - smoothstep(uR - 0.6, uR + 0.6, best);
      float halo = uHalo * (1.0 - smoothstep(uR * 0.5, hr, best)) * 0.45;
      float a = max(line, halo);
      vec3 lit = col * uGain;
      c.rgb = mix(c.rgb, lit, clamp(a, 0.0, 1.0));
      gl_FragColor = c;
    }`,
};

export class SilhouetteOutlinePass extends Pass {
  scene: Scene;
  camera: Camera;
  mask: WebGLRenderTarget;
  quad: FullScreenQuad;
  mat: ShaderMaterial;
  private maskMats = new Map<string, MeshBasicMaterial>();

  constructor(scene: Scene, camera: Camera, w: number, h: number) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.mask = new WebGLRenderTarget(w, h, { type: UnsignedByteType, depthTexture: new DepthTexture(w, h) });
    this.mat = new ShaderMaterial({ ...OutlineShader, uniforms: structuredCloneUniforms(OutlineShader.uniforms) });
    this.quad = new FullScreenQuad(this.mat);
    this.setRadius(w);
  }

  /** Contour width scales with the frame: ~3.4 px at 1080 wide. */
  setRadius(w: number, k = 1) {
    this.mat.uniforms.uR.value = Math.max(1.1, 3.4 * (w / 1080) * k);
    (this.mat.uniforms.uTexel.value as Vector2).set(1 / this.mask.width, 1 / this.mask.height);
  }

  private maskMat(tag: SilTag) {
    const key = `${tag.id}|${tag.color}|${tag.gain ?? 1}`;
    let m = this.maskMats.get(key);
    if (!m) {
      const c = tag.color ? new Color(tag.color).multiplyScalar(tag.gain ?? 1) : new Color(0, 0, 0);
      // alpha = id/255 must reach the target untouched: transparent (so OPAQUE does not force a = 1) + NoBlending
      m = new MeshBasicMaterial({ color: c, opacity: ((tag.id % 254) + 1) / 255, transparent: true, blending: NoBlending, fog: false, toneMapped: false, depthWrite: true });
      m.polygonOffset = true;
      m.polygonOffsetFactor = -1;
      m.polygonOffsetUnits = -1;
      this.maskMats.set(key, m);
    }
    return m;
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) {
    const scene = this.scene;
    const swapped: [Mesh, Material | Material[]][] = [];
    const muted: Material[] = [];
    const hidden: Object3D[] = [];
    scene.traverseVisible((o) => {
      const any = o as Mesh;
      if (!any.material) return;
      const tag = o.userData.sil as SilTag | undefined;
      if (tag) {
        swapped.push([any, any.material]);
        any.material = this.maskMat(tag);
        return;
      }
      const mats = Array.isArray(any.material) ? any.material : [any.material];
      if (o.userData.noMask || mats.some((m) => m.transparent && !m.depthWrite) || (o as unknown as { isPoints?: boolean }).isPoints || (o as unknown as { isLine?: boolean }).isLine) {
        hidden.push(o);
        return;
      }
      for (const m of mats) if (m.colorWrite) { m.colorWrite = false; muted.push(m); }
    });
    for (const o of hidden) o.visible = false;
    const bg = scene.background;
    const fog = scene.fog;
    scene.background = null;
    const oldClear = new Color();
    renderer.getClearColor(oldClear);
    const oldAlpha = renderer.getClearAlpha();
    const shadowAuto = renderer.shadowMap.autoUpdate;
    const shadowNeeds = renderer.shadowMap.needsUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(this.mask);
    renderer.clear(true, true, true);
    renderer.render(scene, this.camera);
    // restore
    renderer.shadowMap.autoUpdate = shadowAuto;
    renderer.shadowMap.needsUpdate = shadowNeeds;
    renderer.setClearColor(oldClear, oldAlpha);
    scene.background = bg;
    scene.fog = fog;
    for (const [m, mat] of swapped) m.material = mat;
    for (const m of muted) m.colorWrite = true;
    for (const o of hidden) o.visible = true;

    const cam = this.camera as PerspectiveCamera;
    const u = this.mat.uniforms;
    u.tDiffuse.value = readBuffer.texture;
    u.tMask.value = this.mask.texture;
    u.tDepth.value = this.mask.depthTexture;
    u.uNear.value = cam.near;
    u.uFar.value = cam.far;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }

  setSize(w: number, h: number) {
    this.mask.setSize(w, h);
    this.setRadius(w);
  }

  dispose() {
    this.mask.dispose();
    this.mat.dispose();
    this.quad.dispose();
    for (const m of this.maskMats.values()) m.dispose();
  }
}

function structuredCloneUniforms(u: Record<string, { value: unknown }>) {
  const out: Record<string, { value: unknown }> = {};
  for (const k of Object.keys(u)) {
    const v = u[k].value as { clone?: () => unknown } | null;
    out[k] = { value: v && typeof v === "object" && v.clone ? v.clone() : v };
  }
  return out;
}
